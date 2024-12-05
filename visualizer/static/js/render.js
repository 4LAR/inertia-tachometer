
// Создаем сцену
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 4;

const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById("3dCanvas") });
renderer.setSize(window.innerWidth, window.innerHeight - 150);

const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load('./texture.jpg');
const material = new THREE.MeshBasicMaterial({ map: texture });

// Добавляем куб
// const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: false });
const geometry = new THREE.BoxGeometry(1, 2, 1);
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Анимация
function animate() {
  // cube.rotation.x = rotation.pitch - 1;  // Roll по оси X
  // cube.rotation.y = rotation.roll; // Pitch по оси Y
  // cube.rotation.z = rotation.yaw;   // Yaw по оси Z
  // cube.position.x = position.x;
  // cube.position.y = position.y;
  // cube.position.z = position.z;

  const euler = new THREE.Euler(
    rotation.pitch * Math.PI / 180,
    rotation.yaw * Math.PI / 180,
    rotation.roll * Math.PI / 180,
    'XYZ' // Укажите правильный порядок вращений
  );
  cube.quaternion.setFromEuler(euler);

  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
