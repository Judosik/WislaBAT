import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Water } from 'three/addons/objects/Water.js';
import { Sky } from 'three/addons/objects/Sky.js';

let container, stats;
let camera, scene, renderer;
let controls, water, sun, terrain, directionalLight;

const parameters = {
    elevation: 4,
    azimuth: -152,
    waterLevel: 0.7  // Parameter for water level control
};

let terrainSize = { width: 200, height: 200 }; // Default values, will be updated

init();

function init() {

    container = document.getElementById('container');

    // Renderer setup
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setAnimationLoop(animate);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.5;
    container.appendChild(renderer.domElement);

    // Scene setup
    scene = new THREE.Scene();

    // Camera setup
    camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 20000);
    camera.position.set(30, 100, 150);

    // Sun setup
    sun = new THREE.Vector3();

    // Load DEM image and set terrain size
    const demImage = new Image();
    demImage.src = 'terrain_data/dem.png';
    demImage.onload = () => {
        terrainSize.width = demImage.width;
        terrainSize.height = demImage.height;
        setupTerrain(); // Setup terrain after loading DEM dimensions
    };

    // Water setup
    const textureLoader = new THREE.TextureLoader();
    const waterGeometry = new THREE.PlaneGeometry(10000, 10000);
    water = new Water(
        waterGeometry,
        {
            textureWidth: 512,
            textureHeight: 512,
            waterNormals: textureLoader.load('textures/waternormals.jpg', function (texture) {texture.wrapS = texture.wrapT = THREE.RepeatWrapping;}),
            sunDirection: new THREE.Vector3(),
            sunColor: 0xffffff,
            waterColor: 0x001e0f,
            distortionScale: 3.7,
            fog: scene.fog !== undefined
        }
    );
    water.rotation.x = - Math.PI / 2;
    water.position.y = parameters.waterLevel;
    scene.add(water);

    // Sky setup
    const sky = new Sky();
    sky.scale.setScalar(10000);
    scene.add(sky);

    const skyUniforms = sky.material.uniforms;
    skyUniforms['turbidity'].value = 10;
    skyUniforms['rayleigh'].value = 2;
    skyUniforms['mieCoefficient'].value = 0.005;
    skyUniforms['mieDirectionalG'].value = 0.8;

    // Create the directional light
    directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 5000;
    directionalLight.shadow.camera.left = -500;
    directionalLight.shadow.camera.right = 500;
    directionalLight.shadow.camera.top = 500;
    directionalLight.shadow.camera.bottom = -500;
    scene.add(directionalLight);

    // PMREM for scene environment
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const sceneEnv = new THREE.Scene();

    let renderTarget;

    function updateSun() {
        const phi = THREE.MathUtils.degToRad(90 - parameters.elevation);
        const theta = THREE.MathUtils.degToRad(parameters.azimuth);

        sun.setFromSphericalCoords(1, phi, theta);

        // Update sky and water sun positions
        sky.material.uniforms['sunPosition'].value.copy(sun);
        water.material.uniforms['sunDirection'].value.copy(sun).normalize();

        // Update directional light position
        directionalLight.position.copy(sun).multiplyScalar(1000);

        // Update environment map
        if (renderTarget !== undefined) renderTarget.dispose();
        sceneEnv.add(sky);
        renderTarget = pmremGenerator.fromScene(sceneEnv);
        scene.add(sky);
        scene.environment = renderTarget.texture;
    }
    updateSun();

    // Orbit controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.maxPolarAngle = Math.PI * 0.495;
    controls.target.set(0, 10, 0);
    controls.minDistance = 10.0;
    controls.maxDistance = 180.0;
    controls.update();

    stats = new Stats();
    container.appendChild(stats.dom);

    // GUI setup
    const gui = new GUI();
    const folderSky = gui.addFolder('Sky');
    folderSky.add(parameters, 'elevation', 0, 90, 0.1).onChange(updateSun);
    folderSky.add(parameters, 'azimuth', -180, 180, 0.1).onChange(updateSun);
    folderSky.open();

    const folderWaterLvl = gui.addFolder('Water Level');
    folderWaterLvl.add(parameters, 'waterLevel', -3, 3, 0.01).name('water level (cm)').onChange((value) => {
        water.position.y = (value);
    });
    folderWaterLvl.open();

    const waterUniforms = water.material.uniforms;
    const folderWater = gui.addFolder('Water');
    folderWater.add(waterUniforms.distortionScale, 'value', 0, 8, 0.1).name('distortionScale');
    folderWater.add(waterUniforms.size, 'value', 0.1, 10, 0.1).name('size');
    folderWater.open();

    window.addEventListener('resize', onWindowResize);
}

function setupTerrain() {
    const textureLoader = new THREE.TextureLoader();
    const heightMap = textureLoader.load('terrain_data/dem.png', () => { console.log("Height map loaded"); }, undefined, (error) => { console.error("Error loading height map:", error); });
    const diffuseMap = textureLoader.load('terrain_data/orto_phot.png', () => {console.log("Diffusion map loaded");}, undefined, (error) => {console.error("Error loading diffusion map:", error);});


    const terrainMaterial = new THREE.MeshStandardMaterial({
        map: diffuseMap,
        displacementMap: heightMap,
        displacementScale: 12,
        roughness: 0.8,
        metalness: 0.2,
    });

    // Create terrain geometry based on DEM dimensions
    const terrainGeometry = new THREE.PlaneGeometry(200, 200, terrainSize.width - 1, terrainSize.height - 1);
    terrainGeometry.rotateX(-Math.PI / 2);
    terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
    terrain.receiveShadow = true;
    terrain.castShadow = true;
    scene.add(terrain);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    render();
    stats.update();
}

function render() {
    water.material.uniforms['time'].value += 1.0 / 60.0; // Animate water
    renderer.render(scene, camera);
}
