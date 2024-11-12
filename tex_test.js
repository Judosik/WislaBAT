function init() {
    container = document.getElementById('container');

    // Renderer setup
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setAnimationLoop(animate);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.5;
    container.appendChild(renderer.domElement);

    scene = new THREE.Scene();

    // Camera setup
    camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.set(30, 100, 150);

    // Light setup for visibility
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(50, 100, 50);
    scene.add(directionalLight);

    // Texture loading with callbacks
    const textureLoader = new THREE.TextureLoader();
    const heightMap = textureLoader.load('terrain_data/dem.png', 
        () => console.log("Height map loaded successfully."),
        undefined,
        (error) => console.error("Error loading height map:", error)
    );

    // Set RepeatWrapping for displacement map
    heightMap.wrapS = heightMap.wrapT = THREE.RepeatWrapping;

    const normalMap = textureLoader.load('textures/gravelly_sand_1k/textures/gravelly_sand_nor_gl_1k.png');
    const aoMap = textureLoader.load('textures/gravelly_sand_1k/textures/gravelly_sand_ao_1k.png');
    const roughnessMap = textureLoader.load('textures/gravelly_sand_1k/textures/gravelly_sand_rough_1k.png');
    const diffuseMap = textureLoader.load('textures/gravelly_sand_1k/textures/gravelly_sand_diff_1k.png');

    const repeat = 4;
    [diffuseMap, normalMap, aoMap, roughnessMap].forEach(map => {
        map.wrapS = map.wrapT = THREE.RepeatWrapping;
        map.repeat.set(repeat, repeat);
    });

    const terrainMaterial = new THREE.MeshStandardMaterial({
        map: diffuseMap,
        displacementMap: heightMap,
        displacementScale: 20, // Increase to make displacement more visible
        normalMap: normalMap,
        aoMap: aoMap,
        roughnessMap: roughnessMap,
        roughness: 1.0,
        metalness: 0.0,
    });

    // Increase plane segment count for better displacement mapping
    const terrainGeometry = new THREE.PlaneGeometry(200, 200, 256, 256);
    terrainGeometry.rotateX(-Math.PI / 2);
    terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
    scene.add(terrain);

    // Orbit Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 10, 0);
    controls.update();

    window.addEventListener('resize', onWindowResize);
}
