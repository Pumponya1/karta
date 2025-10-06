const bgCanvas = document.getElementById('romanticBackground');
const pathCanvas = document.getElementById('pathCanvas');
const bgCtx = bgCanvas.getContext('2d');
const pathCtx = pathCanvas.getContext('2d');
const clickSound = document.getElementById('clickSound'); // 🔔
let w, h;
const bgMusic = document.getElementById('bgMusic');
let musicStarted = false;

function resize() {
  w = bgCanvas.width = pathCanvas.width = window.innerWidth;
  h = bgCanvas.height = pathCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// --- фон ---
const particles = [];
const colors = ['#fff0f5', '#ffd6e0', '#ffffff', '#ffb3c6'];
for (let i = 0; i < 120; i++) {
  particles.push({
    x: Math.random() * w,
    y: Math.random() * h,
    r: Math.random() * 2 + 1,
    color: colors[Math.floor(Math.random() * colors.length)],
    speedY: Math.random() * 0.5 + 0.2,
  });
}

function drawHeart(ctx, x, y, size, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size, size);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(0, -3, -3, -3, -3, 0);
  ctx.bezierCurveTo(-3, 3, 0, 5, 0, 6);
  ctx.bezierCurveTo(0, 5, 3, 3, 3, 0);
  ctx.bezierCurveTo(3, -3, 0, -3, 0, 0);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

function drawBackground() {
  bgCtx.clearRect(0, 0, w, h);
  particles.forEach(p => {
    drawHeart(bgCtx, p.x, p.y, 0.7, p.color);
    p.y += p.speedY;
    if (p.y > h + 10) {
      p.y = -10;
      p.x = Math.random() * w;
    }
  });
  requestAnimationFrame(drawBackground);
}
drawBackground();

// --- линия ---
function getPathY(x) {
  const amplitude = h * 0.15;
  const frequency = 2.5;
  return h * 0.5 + Math.sin((x / w) * Math.PI * frequency) * amplitude;
}

function drawPath() {
  pathCtx.beginPath();
  pathCtx.moveTo(0, getPathY(0));
  for (let x = 0; x <= w; x += 10) pathCtx.lineTo(x, getPathY(x));

  const gradient = pathCtx.createLinearGradient(0, 0, w, h);
  gradient.addColorStop(0, '#ff80ab');
  gradient.addColorStop(0.5, '#f06292');
  gradient.addColorStop(1, '#ce93d8');

  pathCtx.strokeStyle = gradient;
  pathCtx.lineWidth = 20;
  pathCtx.shadowBlur = 30;
  pathCtx.shadowColor = 'rgba(255, 170, 200, 0.9)';
  pathCtx.stroke();
}

// --- сердечки ---
let hearts = [];
function generateHearts() {
  hearts = [];
  const count = 17;
  const step = w / (count + 1);
  for (let i = 1; i <= count; i++) {
    const x = step * i;
    const y = getPathY(x);
    const phase = Math.random() * Math.PI * 2;
    hearts.push({ x, y, img: `images/images${i}.jpg`, phase });
  }
}

// --- анимация сердечек ---
function drawHearts(time) {
  hearts.forEach(h => {
    const pulse = 0.9 + Math.sin(time / 500 + h.phase) * 0.2;
    const glow = 0.5 + (Math.sin(time / 700 + h.phase) + 1) / 2;
    const color = `rgba(${255}, ${210 + 45 * glow}, ${70 + 30 * glow}, 1)`;
    pathCtx.shadowBlur = 25 + 10 * glow;
    pathCtx.shadowColor = `rgba(255, 220, 100, ${0.6 + glow * 0.4})`;
    drawHeart(pathCtx, h.x, h.y, 5 * pulse, color);
  });
}

function render(time = 0) {
  pathCtx.clearRect(0, 0, w, h);
  drawPath();
  drawHearts(time);
  requestAnimationFrame(render);
}

generateHearts();
render();
window.addEventListener('resize', () => {
  resize();
  generateHearts();
});

// --- popup + звук ---
const overlay = document.getElementById('overlay');
const popupImage = document.getElementById('popupImage');

pathCanvas.addEventListener('click', e => {
  const rect = pathCanvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  hearts.forEach(h => {
    const dx = x - h.x;
    const dy = y - h.y;
    if (Math.sqrt(dx * dx + dy * dy) < 40) {
      popupImage.src = h.img;
      overlay.style.display = 'flex';

      // 🔔 Проиграть звук
      clickSound.currentTime = 0;
      clickSound.volume = 0.1;
      clickSound.play();
// 🎶 Включить музыку при первом клике
if (!musicStarted) {
  bgMusic.volume = 0.35;
  bgMusic.play();
  musicStarted = true;
}

    }
  });
});

overlay.addEventListener('click', () => (overlay.style.display = 'none'));
