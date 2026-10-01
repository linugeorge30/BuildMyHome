import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js";

const modal = document.getElementById("planner-3d-modal");
const canvas = document.getElementById("planner-3d");
if (!modal || !canvas || !window.BMH) {
  throw new Error("Planner 3D viewer is missing.");
}

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf4efe6);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;

const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 120);
const center = new THREE.Vector3(2, 1, 2);
let azimuth = Math.PI * 0.35;
let polar = 0.68;
let distance = 9;
let roomGroup = null;
let dragging = false;
let lastX = 0;
let lastY = 0;
let running = false;

function disposeGroup(group) {
  if (!group) {
    return;
  }
  group.traverse(function (obj) {
    if (obj.geometry) {
      obj.geometry.dispose();
    }
    if (obj.material) {
      const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
      materials.forEach(function (mat) {
        if (mat.map) {
          mat.map.dispose();
        }
        mat.dispose();
      });
    }
  });
  scene.remove(group);
}

function sizeCanvas() {
  const width = Math.max(280, canvas.parentElement.clientWidth);
  const height = Math.max(320, Math.min(520, Math.round(width * 0.56)));
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

function updateCamera() {
  polar = Math.min(1.35, Math.max(0.22, polar));
  distance = Math.min(40, Math.max(3.5, distance));
  camera.position.set(
    center.x + distance * Math.sin(polar) * Math.cos(azimuth),
    center.y + distance * Math.cos(polar),
    center.z + distance * Math.sin(polar) * Math.sin(azimuth)
  );
  camera.lookAt(center);
}

function addWall(group, x, y, z, w, h, d, material) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);
}

function makeLabel(text) {
  const sheet = document.createElement("canvas");
  sheet.width = 256;
  sheet.height = 64;
  const ctx = sheet.getContext("2d");
  ctx.fillStyle = "rgba(28, 25, 23, 0.8)";
  ctx.fillRect(8, 10, 240, 44);
  ctx.fillStyle = "#f7f1e8";
  ctx.font = "600 22px Outfit, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 128, 32);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
    map: new THREE.CanvasTexture(sheet),
    transparent: true
  }));
  sprite.scale.set(1.2, 0.3, 1);
  return sprite;
}

function buildScene(snap) {
  disposeGroup(roomGroup);
  roomGroup = new THREE.Group();

  const w = Number(snap.width) || 4;
  const d = Number(snap.length) || 4;
  const h = Number(snap.height) || 2.7;
  const t = 0.08;
  const floorColor = new THREE.Color(snap.floorColor || "#d4b483");
  const wallColor = new THREE.Color(snap.wallColor || "#c4785a");

  scene.clear();
  scene.background = new THREE.Color(0xf4efe6);
  scene.add(new THREE.HemisphereLight(0xfff4e6, 0x6b6358, 1.1));
  const sun = new THREE.DirectionalLight(0xfff8ee, 1.1);
  sun.position.set(w * 0.4, h * 3, d * 0.2);
  sun.castShadow = true;
  scene.add(sun);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(w + 3, d + 3),
    new THREE.MeshStandardMaterial({ color: 0xe7dcc8, roughness: 1 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(w / 2, -0.02, d / 2);
  ground.receiveShadow = true;
  roomGroup.add(ground);

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(w, d),
    new THREE.MeshStandardMaterial({ color: floorColor, roughness: 0.85 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(w / 2, 0.01, d / 2);
  floor.receiveShadow = true;
  roomGroup.add(floor);

  const wallMat = new THREE.MeshStandardMaterial({ color: wallColor, roughness: 0.7 });
  addWall(roomGroup, w / 2, h / 2, 0, w, h, t, wallMat);
  addWall(roomGroup, w / 2, h / 2, d, w, h, t, wallMat);
  addWall(roomGroup, 0, h / 2, d / 2, t, h, d, wallMat);
  addWall(roomGroup, w, h / 2, d / 2, t, h, d, wallMat);

  (snap.items || []).forEach(function (item) {
    const fw = Math.max(0.12, Number(item.width));
    const fd = Math.max(0.12, Number(item.depth));
    const fh = Math.max(0.15, Math.min(h - 0.1, Number(item.height) || 0.8));
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(fw, fh, fd),
      new THREE.MeshStandardMaterial({ color: item.color || "#6b4f3a", roughness: 0.6 })
    );
    mesh.position.set(Number(item.x) + fw / 2, fh / 2 + 0.02, Number(item.y) + fd / 2);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    roomGroup.add(mesh);
    const label = makeLabel(item.name || "Item");
    label.position.set(mesh.position.x, fh + 0.18, mesh.position.z);
    roomGroup.add(label);
  });

  scene.add(roomGroup);
  center.set(w / 2, h * 0.35, d / 2);
  azimuth = Math.PI * 0.35;
  polar = 0.68;
  distance = Math.max(w, d) * 1.4 + h * 1.6;
  const caption = document.getElementById("planner-3d-caption");
  if (caption) {
    const count = (snap.items || []).length;
    caption.textContent = (snap.name || "Room") + " · " + w + " × " + d + " × " + h + " m · " +
      count + " furniture piece" + (count === 1 ? "" : "s");
  }
}

function tick() {
  if (!running) {
    return;
  }
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}

canvas.addEventListener("pointerdown", function (event) {
  dragging = true;
  lastX = event.clientX;
  lastY = event.clientY;
  canvas.setPointerCapture(event.pointerId);
});
canvas.addEventListener("pointerup", function () {
  dragging = false;
});
canvas.addEventListener("pointermove", function (event) {
  if (!dragging) {
    return;
  }
  azimuth += (event.clientX - lastX) * 0.008;
  polar -= (event.clientY - lastY) * 0.008;
  lastX = event.clientX;
  lastY = event.clientY;
  updateCamera();
});
canvas.addEventListener("wheel", function (event) {
  event.preventDefault();
  distance += event.deltaY * 0.01;
  updateCamera();
}, { passive: false });

document.getElementById("reset-planner-3d")?.addEventListener("click", function () {
  const snap = window.BMH.getPlannerSnapshot && window.BMH.getPlannerSnapshot();
  if (snap) {
    center.set(snap.width / 2, snap.height * 0.35, snap.length / 2);
    distance = Math.max(snap.width, snap.length) * 1.4 + snap.height * 1.6;
  }
  azimuth = Math.PI * 0.35;
  polar = 0.68;
  updateCamera();
});

modal.addEventListener("shown.bs.modal", function () {
  const snap = window.BMH.getPlannerSnapshot && window.BMH.getPlannerSnapshot();
  if (!snap) {
    return;
  }
  buildScene(snap);
  sizeCanvas();
  updateCamera();
  running = true;
  tick();
});

modal.addEventListener("hidden.bs.modal", function () {
  running = false;
  dragging = false;
});

window.addEventListener("resize", function () {
  if (modal.classList.contains("show")) {
    sizeCanvas();
    updateCamera();
  }
});
