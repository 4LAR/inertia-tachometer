// Получаем родительский блок
const parentDiv = document.getElementById("scene"); // Замените на ID вашего родительского div

// Создаем сцену
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, parentDiv.clientWidth / parentDiv.clientHeight, 0.1, 1000);
camera.position.z = 4;

const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById("3dCanvas") });
renderer.setSize(parentDiv.clientWidth, parentDiv.clientHeight);

// Загружаем текстуру
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load('./texture.jpg');
// const material = new THREE.MeshBasicMaterial({ map: texture });
// Добавляем куб
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
const geometry = new THREE.BoxGeometry(1, 2, 1);
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Анимация
function animate() {
  const euler = new THREE.Euler(
    rotation.pitch * Math.PI / 180,
    rotation.yaw * Math.PI / 180,
    rotation.roll * Math.PI / 180,
    'XYZ'
  );

  cube.quaternion.setFromEuler(euler);

  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

// Функция для обновления размеров рендерера
function updateRendererSize() {
  const rect = parentDiv.getBoundingClientRect();
  console.log(rect, rect.width, rect.height);
  renderer.setSize(rect.width, rect.height);
  camera.aspect = rect.width / rect.height;
  camera.updateProjectionMatrix();
}

// Используем ResizeObserver для отслеживания изменений размеров родительского блока
const resizeObserver = new ResizeObserver(updateRendererSize);
resizeObserver.observe(parentDiv);

// Инициализация размеров рендерера при загрузке
updateRendererSize();
