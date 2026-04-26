
// =========================
// main.js
// =========================
const canvas = document.getElementById("space");
const ctx = canvas.getContext("2d");

const dtSlider = document.getElementById("dt");
const gSlider = document.getElementById("gravity");
const trailSlider = document.getElementById("trail");
const dtValue = document.getElementById("dtValue");
const gValue = document.getElementById("gValue");
const trailValue = document.getElementById("trailValue");
const resetButton = document.getElementById("reset");

let width = 0;
let height = 0;
let bodies = [];
let G = Number(gSlider.value);
let dt = Number(dtSlider.value);
let maxTrail = Number(trailSlider.value);

const softening = 80;
const scale = 180;

function resize() {
  width = canvas.width = window.innerWidth * devicePixelRatio;
  height = canvas.height = window.innerHeight * devicePixelRatio;
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
}

function createBody(data) {
  return { ...data, trail: [] };
}

function resetSystem() {
  bodies = [
    createBody({ x: -0.75, y: 0, vx: 0.32, vy: 0.58, mass: 1.2, radius: 11, color: '#f87171' }),
    createBody({ x: 0.75, y: 0, vx: 0.32, vy: 0.58, mass: 1.2, radius: 11, color: '#60a5fa' }),
    createBody({ x: 0, y: 0.9, vx: -0.64, vy: -1.16, mass: 1.2, radius: 11, color: '#facc15' })
  ];
}

function updatePhysics() {
  const acc = bodies.map(() => ({ ax: 0, ay: 0 }));

  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      const a = bodies[i];
      const b = bodies[j];

      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const distSq = dx * dx + dy * dy + softening / (scale * scale);
      const dist = Math.sqrt(distSq);
      const force = G / distSq;

      const nx = dx / dist;
      const ny = dy / dist;

      acc[i].ax += force * b.mass * nx;
      acc[i].ay += force * b.mass * ny;
      acc[j].ax -= force * a.mass * nx;
      acc[j].ay -= force * a.mass * ny;
    }
  }

  bodies.forEach((body, i) => {
    body.vx += acc[i].ax * dt;
    body.vy += acc[i].ay * dt;
    body.x += body.vx * dt;
    body.y += body.vy * dt;

    body.trail.push({ x: body.x, y: body.y });
    if (body.trail.length > maxTrail) body.trail.shift();
  });
}

function toScreen(point) {
  return {
    x: window.innerWidth / 2 + point.x * scale,
    y: window.innerHeight / 2 + point.y * scale
  };
}

function draw() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  bodies.forEach(body => {
    ctx.beginPath();
    body.trail.forEach((point, i) => {
      const p = toScreen(point);
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.strokeStyle = body.color;
    ctx.stroke();
  });

  bodies.forEach(body => {
    const p = toScreen(body);
    ctx.beginPath();
    ctx.arc(p.x, p.y, body.radius, 0, Math.PI * 2);
    ctx.fillStyle = body.color;
    ctx.fill();
  });
}

function animate() {
  for (let i = 0; i < 4; i++) updatePhysics();
  draw();
  requestAnimationFrame(animate);
}

dtSlider.addEventListener("input", () => {
  dt = Number(dtSlider.value);
  dtValue.textContent = dt.toFixed(3);
});

gSlider.addEventListener("input", () => {
  G = Number(gSlider.value);
  gValue.textContent = G.toFixed(2);
});

trailSlider.addEventListener("input", () => {
  maxTrail = Number(trailSlider.value);
  trailValue.textContent = maxTrail;
});

resetButton.addEventListener("click", resetSystem);
window.addEventListener("resize", resize);

resize();
resetSystem();
animate();
