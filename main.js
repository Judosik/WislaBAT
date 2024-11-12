import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Water } from 'three/addons/objects/Water.js';
import { Sky } from 'three/addons/objects/Sky.js';

let container, stats;
let camera, scene, renderer;
let controls, water, sun, terrain;

init();

function init() {

    container = document.getElementById('container');

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setAnimationLoop(animate);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.5;
    container.appendChild(renderer.domElement);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 20000);
    camera.position.set(30, 100, 150);

    sun = new THREE.Vector3();

    // Terrain setup
    const textureLoader = new THREE.TextureLoader();
    const heightMap = textureLoader.load('terrain_data/dem.png', () => {console.log("Height map loaded");}, undefined, (error) => {console.error("Error loading height map:", error);});
    const normalMap = textureLoader.load('textures/aerial_beach_01_1k/textures/aerial_beach_01_nor_dx_1k.png', () => {console.log("Normal map loaded");}, undefined, (error) => {console.error("Error loading normal map:", error);});
    const aoMap = textureLoader.load('textures/aerial_beach_01_1k/textures/aerial_beach_01_ao_1k.png', () => {console.log("Oclusion map loaded");}, undefined, (error) => {console.error("Error loading oclusion map:", error);});
    const roughnessMap = textureLoader.load('textures/aerial_beach_01_1k/textures/aerial_beach_01_rough_1k.png', () => {console.log("Roughness map loaded");}, undefined, (error) => {console.error("Error loading roughness map:", error);});
    const diffuseMap = textureLoader.load('textures/aerial_beach_01_1k/textures/aerial_beach_01_diff_1k.png', () => {console.log("Diffusion map loaded");}, undefined, (error) => {console.error("Error loading diffusion map:", error);});

    const repeat = 1;
    [diffuseMap, normalMap, aoMap, roughnessMap].forEach(map => {
        map.wrapS = map.wrapT = THREE.RepeatWrapping;
        map.repeat.set(repeat, repeat);
    });

    const terrainMaterial = new THREE.MeshStandardMaterial({
        map: diffuseMap,
        displacementMap: heightMap,
        displacementScale: 10,
        normalMap: normalMap,
        aoMap: aoMap,
        roughnessMap: roughnessMap,
        roughness: 1.0,
        metalness: 0.2,
    });

    const terrainGeometry = new THREE.PlaneGeometry(200, 200, 2023 - 1, 2119 - 1);
    terrainGeometry.rotateX(-Math.PI / 2);
    terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
    scene.add(terrain);

    // Water setup
    const waterGeometry = new THREE.PlaneGeometry(10000, 10000);
    water = new Water(
        waterGeometry,
        {
            textureWidth: 512,
            textureHeight: 512,
            waterNormals: textureLoader.load('textures/waternormals.jpg', function (texture) {
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            }),
            sunDirection: new THREE.Vector3(),
            sunColor: 0xffffff,
            waterColor: 0x001e0f,
            distortionScale: 3.7,
            fog: scene.fog !== undefined
        }
    );
    water.rotation.x = - Math.PI / 2;
    water.position.y = 1; // Adjust based on terrain elevation
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

    const parameters = {
        elevation: 2,
        azimuth: 180
    };

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const sceneEnv = new THREE.Scene();

    let renderTarget;
    function updateSun() {
        const phi = THREE.MathUtils.degToRad(90 - parameters.elevation);
        const theta = THREE.MathUtils.degToRad(parameters.azimuth);

        sun.setFromSphericalCoords(1, phi, theta);

        sky.material.uniforms['sunPosition'].value.copy(sun);
        water.material.uniforms['sunDirection'].value.copy(sun).normalize();

        if (renderTarget !== undefined) renderTarget.dispose();

        sceneEnv.add(sky);
        renderTarget = pmremGenerator.fromScene(sceneEnv);
        scene.add(sky);

        scene.environment = renderTarget.texture;
    }
    updateSun();

    controls = new OrbitControls(camera, renderer.domElement);
    controls.maxPolarAngle = Math.PI * 0.495;
    controls.target.set(0, 10, 0);
    controls.minDistance = 40.0;
    controls.maxDistance = 200.0;
    controls.update();

    stats = new Stats();
    container.appendChild(stats.dom);

    const gui = new GUI();
    const folderSky = gui.addFolder('Sky');
    folderSky.add(parameters, 'elevation', 0, 90, 0.1).onChange(updateSun);
    folderSky.add(parameters, 'azimuth', -180, 180, 0.1).onChange(updateSun);
    folderSky.open();

    const waterUniforms = water.material.uniforms;
    const folderWater = gui.addFolder('Water');
    folderWater.add(waterUniforms.distortionScale, 'value', 0, 8, 0.1).name('distortionScale');
    folderWater.add(waterUniforms.size, 'value', 0.1, 10, 0.1).name('size');
    folderWater.open();

    window.addEventListener('resize', onWindowResize);
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