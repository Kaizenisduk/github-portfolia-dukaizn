/* ═══════════════════════════════════════════════════
   Altanbagana Dulguun — Portfolio Scripts
   ═══════════════════════════════════════════════════ */

/* ── SMOOTH CURSOR ─────────────────────────────── */
const dot  = document.getElementById('cur-dot');
const ring = document.getElementById('cur-ring');
let mX = window.innerWidth / 2, mY = window.innerHeight / 2;
let rX = mX, rY = mY;

document.addEventListener('mousemove', e => { mX = e.clientX; mY = e.clientY; });

(function tick() {
  dot.style.transform  = `translate(${mX - 4}px, ${mY - 4}px)`;
  rX += (mX - rX) * 0.10;
  rY += (mY - rY) * 0.10;
  const hw = ring.offsetWidth / 2, hh = ring.offsetHeight / 2;
  ring.style.transform = `translate(${rX - hw}px, ${rY - hh}px)`;
  requestAnimationFrame(tick);
})();

document.querySelectorAll('a,.project-card,.stat-card,.tag,.btn,.project-add-btn').forEach(el => {
  el.addEventListener('mouseenter', () => ring.classList.add('hov'));
  el.addEventListener('mouseleave', () => ring.classList.remove('hov'));
});


/* ══════════════════════════════════════════════════
   THREE.JS — 3D HERO BACKGROUND
   ══════════════════════════════════════════════════ */
(function init3D() {
  const canvas = document.getElementById('hero-canvas-3d');
  if (!canvas || typeof THREE === 'undefined') return;

  const scene    = new THREE.Scene();
  const camera   = new THREE.PerspectiveCamera(55, canvas.offsetWidth / canvas.offsetHeight, 0.1, 100);
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  camera.position.set(0, 0, 5);

  // Materials
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0x8f47e8, wireframe: true, transparent: true, opacity: 0.15
  });
  const edgeMat = new THREE.LineBasicMaterial({
    color: 0x8f47e8, transparent: true, opacity: 0.35
  });
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0x8f47e8, transparent: true, opacity: 0.04
  });

  // Main icosahedron
  const icoGeo = new THREE.IcosahedronGeometry(1.8, 1);
  const icoMesh = new THREE.Mesh(icoGeo, wireMat);
  scene.add(icoMesh);

  // Edges
  const edgesGeo = new THREE.EdgesGeometry(icoGeo);
  const edgeLines = new THREE.LineSegments(edgesGeo, edgeMat);
  scene.add(edgeLines);

  // Inner sphere glow
  const innerSphere = new THREE.Mesh(
    new THREE.SphereGeometry(1.2, 32, 32),
    glowMat
  );
  scene.add(innerSphere);

  // Outer wireframe sphere
  const outerGeo = new THREE.IcosahedronGeometry(2.8, 0);
  const outerWire = new THREE.Mesh(outerGeo, new THREE.MeshBasicMaterial({
    color: 0x2b65d9, wireframe: true, transparent: true, opacity: 0.06
  }));
  scene.add(outerWire);

  // Particles
  const particleCount = 200;
  const pGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 10;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const pMat = new THREE.PointsMaterial({
    color: 0x8f47e8, size: 0.02, transparent: true, opacity: 0.5
  });
  const particles = new THREE.Points(pGeo, pMat);
  scene.add(particles);

  // Mouse interaction
  let mouseX = 0, mouseY = 0;
  document.querySelector('.hero').addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
  });

  // Animate
  function animate() {
    requestAnimationFrame(animate);
    const t = performance.now() * 0.001;

    icoMesh.rotation.x = t * 0.12 + mouseY * 0.3;
    icoMesh.rotation.y = t * 0.18 + mouseX * 0.3;
    edgeLines.rotation.copy(icoMesh.rotation);

    innerSphere.rotation.x = -t * 0.08;
    innerSphere.rotation.y = -t * 0.12;
    innerSphere.scale.setScalar(1 + Math.sin(t * 0.8) * 0.05);

    outerWire.rotation.x = -t * 0.04;
    outerWire.rotation.y = t * 0.06;

    particles.rotation.y = t * 0.02;
    particles.rotation.x = t * 0.01;

    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    const w = canvas.offsetWidth, h = canvas.offsetHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
})();


/* ══════════════════════════════════════════════════
   RADAR CHART — Big SVG
   ══════════════════════════════════════════════════ */
const skillsData = [
  { name: 'Illustrator', value: 85 },
  { name: 'Photoshop',   value: 80 },
  { name: 'Premiere',    value: 75 },
  { name: 'UI / UX',     value: 70 },
  { name: '3D Art',      value: 72 },
  { name: 'Game Design', value: 55 },
];

function buildRadarChart() {
  const svg = document.getElementById('radar-svg');
  if (!svg) return;

  const cx = 250, cy = 250, maxR = 180;
  const n = skillsData.length;
  const step = (Math.PI * 2) / n;
  let html = '';

  // Grid rings (5 levels)
  for (let ring = 1; ring <= 5; ring++) {
    const r = (maxR / 5) * ring;
    const pts = [];
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + i * step;
      pts.push(`${cx + Math.cos(a) * r},${cy + Math.sin(a) * r}`);
    }
    html += `<polygon points="${pts.join(' ')}" class="radar-grid-ring"/>`;
  }

  // Axis lines
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + i * step;
    html += `<line x1="${cx}" y1="${cy}" x2="${cx + Math.cos(a) * maxR}" y2="${cy + Math.sin(a) * maxR}" class="radar-grid-line"/>`;
  }

  // Data shape
  const pts = skillsData.map((s, i) => {
    const a = -Math.PI / 2 + i * step;
    const r = (s.value / 100) * maxR;
    return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r };
  });
  html += `<polygon class="radar-shape radar-shape-initial" points="${pts.map(p => `${p.x},${p.y}`).join(' ')}"/>`;

  // Dots
  pts.forEach((p, i) => {
    html += `<circle class="radar-dot" cx="${p.x}" cy="${p.y}" r="5"><title>${skillsData[i].name}: ${skillsData[i].value}%</title></circle>`;
  });

  // Labels + percentage
  skillsData.forEach((s, i) => {
    const a = -Math.PI / 2 + i * step;
    const lR = maxR + 30;
    const lx = cx + Math.cos(a) * lR;
    const ly = cy + Math.sin(a) * lR;
    let anchor = 'middle';
    if (Math.cos(a) > 0.15)  anchor = 'start';
    if (Math.cos(a) < -0.15) anchor = 'end';

    const pctR = maxR + 48;
    const px = cx + Math.cos(a) * pctR;
    const py = cy + Math.sin(a) * pctR;

    html += `<g class="radar-label-group">`;
    html += `<text x="${lx}" y="${ly}" text-anchor="${anchor}" dominant-baseline="central" class="radar-label">${s.name}</text>`;
    html += `<text x="${px}" y="${py + 14}" text-anchor="${anchor}" dominant-baseline="central" class="radar-pct">${s.value}%</text>`;
    html += `</g>`;
  });

  svg.innerHTML = html;
}

buildRadarChart();

// Animate radar on scroll
const radarObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const shape = e.target.querySelector('.radar-shape');
      if (shape) {
        shape.classList.remove('radar-shape-initial');
        shape.classList.add('radar-shape-visible');
      }
      radarObs.unobserve(e.target);
    }
  });
}, { threshold: 0.3 });

const radarContainer = document.querySelector('.radar-container');
if (radarContainer) radarObs.observe(radarContainer);


/* ══════════════════════════════════════════════════
   SCROLL REVEAL
   ══════════════════════════════════════════════════ */
const ro = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('vis');
    ro.unobserve(e.target);
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach(el => ro.observe(el));


/* ══════════════════════════════════════════════════
   PROJECT FILE UPLOAD — Category-based
   ══════════════════════════════════════════════════ */
let activeCategory = null;
const fileInput = document.getElementById('file-input-hidden');

// Each "+" button opens file picker for that category
document.querySelectorAll('.project-add-btn').forEach(btn => {
  btn.addEventListener('click', e => {
    e.stopPropagation();
    activeCategory = btn.dataset.category;
    fileInput.click();
  });
});

if (fileInput) {
  fileInput.addEventListener('change', e => {
    if (!activeCategory) return;
    const gallery = document.querySelector(`.project-gallery[data-category="${activeCategory}"]`);
    if (!gallery) return;

    for (const file of e.target.files) {
      addThumb(file, gallery);
    }
    e.target.value = '';
    activeCategory = null;
  });
}

function getExt(name) {
  const p = name.split('.');
  return p.length > 1 ? p.pop().toUpperCase() : 'FILE';
}

function addThumb(file, gallery) {
  const thumb = document.createElement('div');
  thumb.className = 'gallery-thumb';

  const isImage = file.type.startsWith('image/');

  if (isImage) {
    const reader = new FileReader();
    reader.onload = ev => {
      thumb.innerHTML = `
        <img src="${ev.target.result}" alt="${file.name}"/>
        <button class="gallery-remove" title="Устгах">✕</button>
      `;
      attachRemove(thumb);
    };
    reader.readAsDataURL(file);
  } else {
    const ext = getExt(file.name);
    thumb.innerHTML = `
      <div class="gallery-thumb-file">
        <div class="ext">.${ext}</div>
        <div class="fname">${file.name}</div>
      </div>
      <button class="gallery-remove" title="Устгах">✕</button>
    `;
    attachRemove(thumb);
  }

  gallery.appendChild(thumb);
}

function attachRemove(thumb) {
  const btn = thumb.querySelector('.gallery-remove');
  if (btn) {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      thumb.style.opacity = '0';
      thumb.style.transform = 'scale(0.8)';
      thumb.style.transition = 'all .25s ease';
      setTimeout(() => thumb.remove(), 250);
    });
  }
}


/* ══════════════════════════════════════════════════
   CONTACT FORM — Fully working via mailto
   ══════════════════════════════════════════════════ */
const btnSend   = document.getElementById('btn-send');
const formName  = document.getElementById('form-name');
const formEmail = document.getElementById('form-email');
const formMsg   = document.getElementById('form-message');

if (btnSend) {
  btnSend.addEventListener('click', () => {
    // Clear previous errors
    [formName, formEmail, formMsg].forEach(f => f.classList.remove('error'));

    // Validate
    let hasError = false;
    if (!formName.value.trim()) { formName.classList.add('error'); hasError = true; }
    if (!formEmail.value.trim() || !formEmail.value.includes('@')) { formEmail.classList.add('error'); hasError = true; }
    if (!formMsg.value.trim()) { formMsg.classList.add('error'); hasError = true; }
    if (hasError) return;

    // Show loading
    const txtEl  = btnSend.querySelector('.btn-text');
    const loadEl = btnSend.querySelector('.btn-loading');
    const doneEl = btnSend.querySelector('.btn-done');
    txtEl.style.display  = 'none';
    loadEl.style.display = 'inline';
    btnSend.classList.add('sending');

    // Build mailto
    const subject = encodeURIComponent(`Хамтран ажиллах санал — ${formName.value.trim()}`);
    const body    = encodeURIComponent(
      `Нэр: ${formName.value.trim()}\nИмэйл: ${formEmail.value.trim()}\n\n${formMsg.value.trim()}`
    );
    const mailto = `mailto:altanbagana.dulguun@gmail.com?subject=${subject}&body=${body}`;

    // Simulate delay then open mail client
    setTimeout(() => {
      window.open(mailto, '_blank');

      loadEl.style.display = 'none';
      doneEl.style.display = 'inline';
      btnSend.classList.remove('sending');
      btnSend.classList.add('done');

      showToast('✓ Имэйл клиент нээгдлээ!');

      // Reset after 3s
      setTimeout(() => {
        doneEl.style.display = 'none';
        txtEl.style.display  = 'inline';
        btnSend.classList.remove('done');
        formName.value  = '';
        formEmail.value = '';
        formMsg.value   = '';
      }, 3000);
    }, 800);
  });

  // Remove error on input
  [formName, formEmail, formMsg].forEach(f => {
    f.addEventListener('input', () => f.classList.remove('error'));
  });
}

/* Toast notification */
function showToast(msg) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}
