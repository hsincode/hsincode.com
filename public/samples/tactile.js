import * as THREE from '../assets/three/three.module.min.js';

export async function createScene(container) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.35;
  container.append(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 40);
  camera.position.set(0, 0, 10);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x78988b, 3));
  const light = new THREE.DirectionalLight(0xffffff, 4);
  light.position.set(-3, 6, 8);
  light.castShadow = true;
  light.shadow.mapSize.set(1024, 1024);
  light.shadow.camera.left = -8;
  light.shadow.camera.right = 8;
  light.shadow.camera.top = 8;
  light.shadow.camera.bottom = -8;
  light.shadow.normalBias = 0.04;
  scene.add(light);

  const group = new THREE.Group();
  scene.add(group);
  const texture = await new THREE.TextureLoader().loadAsync(new URL('../assets/avatar.png', import.meta.url).href);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);

  const shape = new THREE.Shape();
  const size = 2.65;
  const half = size / 2;
  const radius = 0.10;
  shape.moveTo(-half + radius, -half);
  shape.lineTo(half - radius, -half);
  shape.quadraticCurveTo(half, -half, half, -half + radius);
  shape.lineTo(half, half - radius);
  shape.quadraticCurveTo(half, half, half - radius, half);
  shape.lineTo(-half + radius, half);
  shape.quadraticCurveTo(-half, half, -half, half - radius);
  shape.lineTo(-half, -half + radius);
  shape.quadraticCurveTo(-half, -half, -half + radius, -half);
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: 0.14, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.035, bevelThickness: 0.035, curveSegments: 12 });
  geometry.center();
  const shell = new THREE.MeshStandardMaterial({ color: 0xf7faf8, metalness: 0.15, roughness: 0.30 });
  const back = new THREE.MeshStandardMaterial({ color: 0xb3c8bc, metalness: 0.25, roughness: 0.35 });
  const plate = new THREE.Mesh(geometry, shell);
  plate.castShadow = true;
  plate.receiveShadow = true;
  group.add(plate);

  const picture = new THREE.Mesh(new THREE.PlaneGeometry(2.49, 2.49), new THREE.MeshBasicMaterial({ map: texture, toneMapped: false }));
  picture.position.z = 0.111;
  group.add(picture);
  const rearPlate = new THREE.Mesh(geometry, back);
  rearPlate.position.set(0.19, -0.16, -0.32);
  rearPlate.rotation.z = -0.075;
  rearPlate.castShadow = true;
  group.add(rearPlate);

  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.ShadowMaterial({ opacity: 0.075 }));
  shadow.position.z = -0.45;
  shadow.receiveShadow = true;
  scene.add(shadow);

  let targetX = 0;
  let targetY = 0;
  let smoothX = 0;
  let smoothY = 0;
  function resize() {
    const width = innerWidth;
    const height = document.body.scrollHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    const worldHeight = 2 * Math.tan(THREE.MathUtils.degToRad(35 / 2)) * camera.position.z;
    const headerBottom = document.querySelector('.sample-header').getBoundingClientRect().bottom + scrollY;
    const textTop = document.querySelector('.tactile-main .eyebrow').getBoundingClientRect().top + scrollY;
    const availableHeight = textTop - headerBottom;
    const pixels = Math.min(280, width * 0.55, availableHeight * 0.66);
    group.scale.setScalar(pixels / height * worldHeight / size);
    const imageY = headerBottom + availableHeight / 2 - 8;
    targetX = 0;
    targetY = (0.5 - imageY / height) * worldHeight;
  }
  function render(time, pointer) {
    smoothX += (pointer.x - smoothX) * 0.045;
    smoothY += (pointer.y - smoothY) * 0.045;
    group.position.set(targetX, targetY + Math.sin(time * 0.7) * 0.06, 0);
    group.rotation.set(0.09 + smoothY * 0.10, -0.20 + smoothX * 0.15, 0.05 + Math.sin(time * 0.35) * 0.025);
    renderer.render(scene, camera);
    container.dataset.rendered = '';
  }
  return { render, resize };
}
