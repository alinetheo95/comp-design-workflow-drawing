// three-sketch.js
// This script creates a Three.js scene with interactive 3D spheres on a wireframe grid

(function() {
  // Scene, camera, renderer setup
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, 800 / 400, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(800, 400);
  renderer.setClearColor(0x000000); // black background

  document.getElementById('threejs-container-1').appendChild(renderer.domElement);

  // Add ambient light
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  // Add directional light
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 10, 7);
  scene.add(directionalLight);

  // Create a wireframe grid
  const gridHelper = new THREE.GridHelper(10, 20, 0x888888, 0x888888);
  scene.add(gridHelper);

  // Camera control variables
  let cameraAngle = 0.8; // Fixed starting angle
  let cameraRadius = 8;
  let cameraHeight = 4;
  
  // Mouse control variables
  let mouseX = 0;
  let mouseY = 0;
  let targetCameraRadius = 8;
  let targetCameraHeight = 4;
  const minRadius = 3;
  const maxRadius = 20;
  const minHeight = 1;
  const maxHeight = 10;
  
  // Pan control variables
  let panX = 0;
  let panZ = 0;
  let targetPanX = 0;
  let targetPanZ = 0;
  const panSpeed = 0.05;

  // Sphere system variables
  const spheres = [];
  const sphereRadius = 0.2; // Scaled for 3D space
  const maxSpheres = 30;
  
  // Create sphere geometry (reuse for performance)
  const sphereGeometry = new THREE.SphereGeometry(sphereRadius, 16, 16);
  
  // Convert your color scheme to Three.js colors
  const colorScheme = [
    { color: [217, 137, 72], count: 2 },   // Orange-brown
    { color: [243, 110, 55], count: 1 },   // Orange
    { color: [241, 95, 49], count: 1 },    // Orange-red
    { color: [239, 66, 58], count: 1 },    // Red-orange
    { color: [236, 44, 61], count: 1 },    // Red
    { color: [229, 35, 100], count: 1 },   // Red-pink
    { color: [208, 28, 103], count: 1 },   // Pink-red
    { color: [129, 97, 130], count: 1 },   // Purple
    { color: [92, 64, 91], count: 1 },     // Dark purple
    { color: [79, 47, 63], count: 1 },     // Dark purple-brown
  ];

  // Create materials from your color scheme
  const sphereMaterials = [];
  colorScheme.forEach(colorData => {
    const [r, g, b] = colorData.color;
    const material = new THREE.MeshPhongMaterial({ 
      color: new THREE.Color(r/255, g/255, b/255),
      shininess: 100 
    });
    
    // Add multiple instances for colors that appear more than once
    for (let i = 0; i < colorData.count; i++) {
      sphereMaterials.push(material);
    }
  });

  // Sphere class to manage individual sphere behavior
  class Sphere3D {
    constructor(x, y, z, materialIndex = null) {
      // Use specific material or random from scheme
      const material = materialIndex !== null ? 
        sphereMaterials[materialIndex] : 
        sphereMaterials[Math.floor(Math.random() * sphereMaterials.length)];
      
      this.mesh = new THREE.Mesh(sphereGeometry, material);
      
      this.mesh.position.set(x, y, z);
      this.velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02
      );
      
      this.rotationSpeed = {
        x: (Math.random() - 0.5) * 0.05,
        y: (Math.random() - 0.5) * 0.05,
        z: (Math.random() - 0.5) * 0.05
      };
      
      scene.add(this.mesh);
    }

    update() {
      // Update position
      this.mesh.position.add(this.velocity);
      
      // Update rotation
      this.mesh.rotation.x += this.rotationSpeed.x;
      this.mesh.rotation.y += this.rotationSpeed.y;
      this.mesh.rotation.z += this.rotationSpeed.z;
      
      // Boundary checking - bounce off invisible walls
      const bounds = 4;
      if (this.mesh.position.x > bounds || this.mesh.position.x < -bounds) {
        this.velocity.x *= -0.8; // Add some damping
      }
      if (this.mesh.position.y > bounds || this.mesh.position.y < sphereRadius) {
        this.velocity.y *= -0.8;
      }
      if (this.mesh.position.z > bounds || this.mesh.position.z < -bounds) {
        this.velocity.z *= -0.8;
      }
      
      // Keep spheres above the grid
      if (this.mesh.position.y < sphereRadius) {
        this.mesh.position.y = sphereRadius;
      }
    }

    remove() {
      scene.remove(this.mesh);
    }
  }

  // Convert 2D positions to 3D and create initial spheres based on your data
  const initialSpheres = [
    { x: 50, y: 100, color: [217, 137, 72] },
    { x: 100, y: 300, color: [217, 137, 72] },
    { x: 200, y: 80, color: [243, 110, 55] },
    { x: 250, y: 220, color: [241, 95, 49] },
    { x: 300, y: 340, color: [239, 66, 58] },
    { x: 430, y: 280, color: [236, 44, 61] },
    { x: 400, y: 70, color: [229, 35, 100] },
    { x: 550, y: 200, color: [208, 28, 103] },
    { x: 600, y: 350, color: [129, 97, 130] },
    { x: 700, y: 120, color: [92, 64, 91] },
    { x: 750, y: 300, color: [79, 47, 63] },
  ];

  // Create initial spheres with your specific colors and positions
  initialSpheres.forEach((sphereData, index) => {
    // Convert 2D coordinates to 3D space
    const x = (sphereData.x - 400) / 100; // Center and scale
    const z = (sphereData.y - 200) / 100; // Center and scale
    const y = 0.5 + Math.random() * 2; // Random height above grid
    
    // Find matching material index
    const materialIndex = index < sphereMaterials.length ? index : 
      Math.floor(Math.random() * sphereMaterials.length);
    
    const sphere = new Sphere3D(x, y, z, materialIndex);
    spheres.push(sphere);
  });

  // Mouse interaction variables
  const mouse = new THREE.Vector2();
  const raycaster = new THREE.Raycaster();
  let isMouseDown = false;
  let isDragging = false;
  let isPanning = false;
  let isZooming = false;
  let lastMouseX = 0;
  let lastMouseY = 0;
  let keys = {};

  // Add mouse and keyboard event listeners
  renderer.domElement.addEventListener('mousedown', onMouseDown);
  renderer.domElement.addEventListener('mouseup', onMouseUp);
  renderer.domElement.addEventListener('mousemove', onMouseMove);
  renderer.domElement.addEventListener('wheel', onMouseWheel);
  renderer.domElement.addEventListener('contextmenu', (e) => e.preventDefault()); // Disable right-click menu
  
  // Keyboard event listeners for modifier keys
  window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
  });
  window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
  });

  function onMouseDown(event) {
    isMouseDown = true;
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
    
    // Right click for camera rotation control
    if (event.button === 2) {
      isDragging = true;
    }
    // Left click for panning (single finger click and hold)
    else if (event.button === 0) {
      isPanning = true;
      event.preventDefault();
    }
  }

  function onMouseUp(event) {
    isMouseDown = false;
    isDragging = false;
    isPanning = false;
    isZooming = false;
  }

  function onMouseMove(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    if (isMouseDown) {
      const deltaX = event.clientX - lastMouseX;
      const deltaY = event.clientY - lastMouseY;
      
      // Camera rotation with right mouse button (two-finger tap on trackpad)
      if (isDragging) {
        // Rotate camera angle and adjust height
        cameraAngle -= deltaX * 0.01;
        targetCameraHeight += deltaY * 0.01;
        targetCameraHeight = Math.max(minHeight, Math.min(maxHeight, targetCameraHeight));
      }
      // Pan around space with left mouse button (single finger click and hold)
      else if (isPanning) {
        // Calculate pan direction based on camera angle
        const cosAngle = Math.cos(cameraAngle);
        const sinAngle = Math.sin(cameraAngle);
        
        // Pan perpendicular to camera direction
        targetPanX += (-deltaX * cosAngle - deltaY * sinAngle) * panSpeed;
        targetPanZ += (deltaX * sinAngle - deltaY * cosAngle) * panSpeed;
      }
      
      lastMouseX = event.clientX;
      lastMouseY = event.clientY;
    }
    
    // Update mouse position
    mouseX = mouse.x;
    mouseY = mouse.y;
  }

  function onMouseWheel(event) {
    event.preventDefault();
    
    // Handle trackpad pinch-to-zoom and two-finger scroll
    if (event.ctrlKey) {
      // Pinch-to-zoom gesture (detected by ctrlKey on most trackpads)
      const zoomSpeed = 0.5;
      if (event.deltaY > 0) {
        targetCameraRadius += zoomSpeed;
      } else {
        targetCameraRadius -= zoomSpeed;
      }
      targetCameraRadius = Math.max(minRadius, Math.min(maxRadius, targetCameraRadius));
    } else {
      // Two-finger scroll for panning
      const panAmount = 0.02;
      const cosAngle = Math.cos(cameraAngle);
      const sinAngle = Math.sin(cameraAngle);
      
      // Pan based on scroll direction
      targetPanX += (-event.deltaX * cosAngle - event.deltaY * sinAngle) * panAmount;
      targetPanZ += (event.deltaX * sinAngle - event.deltaY * cosAngle) * panAmount;
    }
  }

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);
    
    // Smooth camera transitions
    cameraRadius += (targetCameraRadius - cameraRadius) * 0.1;
    cameraHeight += (targetCameraHeight - cameraHeight) * 0.1;
    
    // Smooth pan transitions
    panX += (targetPanX - panX) * 0.1;
    panZ += (targetPanZ - panZ) * 0.1;
    
    // Update camera position (fixed angle, no auto-rotation)
    camera.position.x = Math.cos(cameraAngle) * cameraRadius + panX;
    camera.position.z = Math.sin(cameraAngle) * cameraRadius + panZ;
    camera.position.y = cameraHeight;
    camera.lookAt(panX, 1, panZ); // Look at the panned center point
    
    // Update all spheres
    spheres.forEach((sphere, index) => {
      sphere.update();
      
      // Remove spheres that fall too far below the grid
      if (sphere.mesh.position.y < -10) {
        sphere.remove();
        spheres.splice(index, 1);
      }
    });
    
    renderer.render(scene, camera);
  }
  animate();
})();