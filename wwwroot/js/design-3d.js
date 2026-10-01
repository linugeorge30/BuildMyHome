import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js";

const canvas = document.getElementById("house-3d");
const dataEl = document.getElementById("house-3d-data");
if (!canvas || !dataEl) {
  throw new Error("3D viewer markup is missing.");
}

const house = JSON.parse(dataEl.textContent);
const rooms = house.rooms || [];
const planW = Number(house.planWidth) || 8;
const planD = Number(house.planDepth) || 6;
const maxH = rooms.reduce((h, room) => Math.max(h, Number(room.height) || 2.7), 2.7);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf4efe6);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;

const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 200);
const center = new THREE.Vector3(planW / 2, maxH * 0.35, planD / 2);
let azimuth = Math.PI * 0.28;
let polar = 1.05;
let distance = Math.max(planW, planD) * 1.55 + maxH * 2;

const roomCenters = {};

function sizeCanvas() {
  const wrap = canvas.parentElement;
  const width = Math.max(280, wrap.clientWidth);
  const height = Math.max(320, Math.min(640, Math.round(width * 0.62)));
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

function updateCamera() {
  polar = Math.min(1.35, Math.max(0.25, polar));
  distance = Math.min(60, Math.max(6, distance));
  camera.position.set(
    center.x + distance * Math.sin(polar) * Math.cos(azimuth),
    center.y + distance * Math.cos(polar),
    center.z + distance * Math.sin(polar) * Math.sin(azimuth)
  );
  camera.lookAt(center);
}

function addLights() {
  scene.add(new THREE.HemisphereLight(0xfff4e6, 0x6b6358, 1.05));
  const sun = new THREE.DirectionalLight(0xfff8ee, 1.15);
  sun.position.set(planW * 0.3, maxH * 4, planD * 0.2);
  sun.castShadow = true;
  scene.add(sun);
}

function addGround() {
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(planW + 6, planD + 6),
    new THREE.MeshStandardMaterial({ color: 0xe7dcc8, roughness: 1 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(planW / 2, 0, planD / 2);
  ground.receiveShadow = true;
  scene.add(ground);
}

function makeLabel(text, color) {
  const sheet = document.createElement("canvas");
  sheet.width = 512;
  sheet.height = 128;
  const ctx = sheet.getContext("2d");
  ctx.fillStyle = "rgba(28, 25, 23, 0.78)";
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(16, 24, 480, 80, 18);
  } else {
    ctx.rect(16, 24, 480, 80);
  }
  ctx.fill();
  ctx.fillStyle = "#f7f1e8";
  ctx.font = "600 42px Outfit, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 256, 64);
  const texture = new THREE.CanvasTexture(sheet);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true }));
  sprite.scale.set(Math.min(2.8, Math.max(1.4, text.length * 0.16)), 0.7, 1);
  sprite.userData.tint = color;
  return sprite;
}

function addWall(x, y, z, w, h, d, material) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
}

function addRoom(room) {
  const w = Number(room.width);
  const d = Number(room.length);
  const h = Number(room.height) || 2.7;
  const x = Number(room.x);
  const z = Number(room.y);
  const color = new THREE.Color(room.accent || "#c4a35a");
  const t = 0.07;
  const cx = x + w / 2;
  const cz = z + d / 2;

  roomCenters[room.id] = new THREE.Vector3(cx, h * 0.45, cz);

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(Math.max(0.2, w - 0.04), Math.max(0.2, d - 0.04)),
    new THREE.MeshStandardMaterial({ color, roughness: 0.82, metalness: 0.02 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(cx, 0.03, cz);
  floor.receiveShadow = true;
  scene.add(floor);

  const wallMat = new THREE.MeshStandardMaterial({
    color: color.clone().offsetHSL(0, 0, -0.08),
    roughness: 0.72
  });
  addWall(cx, h / 2, z, w, h, t, wallMat);
  addWall(cx, h / 2, z + d, w, h, t, wallMat);
  addWall(x, h / 2, cz, t, h, d, wallMat);
  addWall(x + w, h / 2, cz, t, h, d, wallMat);

  const label = makeLabel(room.name, color);
  label.position.set(cx, Math.min(h * 0.72, h - 0.35), cz);
  scene.add(label);
}

addLights();
addGround();
rooms.forEach(addRoom);
sizeCanvas();
updateCamera();

let dragging = false;
let lastX = 0;
let lastY = 0;

canvas.addEventListener("pointerdown", (event) => {
  dragging = true;
  lastX = event.clientX;
  lastY = event.clientY;
  canvas.setPointerCapture(event.pointerId);
});
canvas.addEventListener("pointerup", () => {
  dragging = false;
});
canvas.addEventListener("pointermove", (event) => {
  if (!dragging) {
    return;
  }
  azimuth += (event.clientX - lastX) * 0.008;
  polar -= (event.clientY - lastY) * 0.008;
  lastX = event.clientX;
  lastY = event.clientY;
  updateCamera();
});
canvas.addEventListener("wheel", (event) => {
  event.preventDefault();
  distance += event.deltaY * 0.012;
  updateCamera();
}, { passive: false });

document.getElementById("reset-camera")?.addEventListener("click", () => {
  center.set(planW / 2, maxH * 0.35, planD / 2);
  azimuth = Math.PI * 0.28;
  polar = 1.05;
  distance = Math.max(planW, planD) * 1.55 + maxH * 2;
  updateCamera();
});

document.getElementById("room-legend")?.addEventListener("click", (event) => {
  const chip = event.target.closest("[data-room]");
  if (!chip) {
    return;
  }
  const target = roomCenters[chip.dataset.room];
  if (!target) {
    return;
  }
  center.copy(target);
  distance = Math.max(7, Math.min(distance, 14));
  updateCamera();
  document.querySelectorAll(".legend-chip").forEach((item) => item.classList.toggle("active", item === chip));
});

window.addEventListener("resize", () => {
  sizeCanvas();
  updateCamera();
});

function tick() {
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
tick();
