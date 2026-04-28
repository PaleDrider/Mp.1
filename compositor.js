// =========================================================
// compositor.js — Paveikslėlių Sluoksniuotojas
// Sujungia fono (bg) ir atmosferos (atmo) PNG failus
// į vieną canvas elementą kiekvienam bitui.
// Jei failų nėra — piešia procedūrinį foną (atsarginis variantas)
// =========================================================

class SceneCompositor {
  constructor() {
    // Įkeltų paveikslėlių talpykla — kad nereikėtų krauti du kartus
    this.cache = {};
    // Canvas elementas iš index.html
    this.canvas = null;
    this.ctx    = null;
    // Dabartinė animacinė kilpa (rūko efektui)
    this.animFrame = null;
  }

  // =====================================================
  // Inicializuoti su canvas ID
  // =====================================================
  init(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    // Canvas dydis = lango dydis
    this._resize();
    window.addEventListener('resize', () => this._resize());
  }

  _resize() {
    if (!this.canvas) return;
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  // =====================================================
  // Pagrindinė funkcija: nupiešti sceną pagal imageTags
  // tags: { background: 'bridge', atmosphere: 'night' }
  // =====================================================
  async render(tags) {
    if (!this.ctx) return;
    // Sustabdyti seną animaciją
    if (this.animFrame) cancelAnimationFrame(this.animFrame);

    const W = this.canvas.width;
    const H = this.canvas.height;

    // Bandyti įkelti failus
    const bgPath   = `img/bg/${tags.background || 'street_narrow'}.png`;
    const atmoPath = tags.atmosphere ? `img/atmo/${tags.atmosphere}.png` : null;

    const bgImg   = await this._load(bgPath).catch(() => null);
    const atmoImg = atmoPath ? await this._load(atmoPath).catch(() => null) : null;

    if (bgImg) {
      // Turimas paveikslėlis — piešti jį
      this.ctx.drawImage(bgImg, 0, 0, W, H);
    } else {
      // Nėra failo — procedūrinis fonas
      this._drawProceduralBg(tags.background, tags.atmosphere);
    }

    if (atmoImg) {
      // Atmosferos sluoksnis su blend režimu
      const mode = this._blendMode(tags.atmosphere);
      this.ctx.globalCompositeOperation = mode;
      this.ctx.globalAlpha = 0.60;
      this.ctx.drawImage(atmoImg, 0, 0, W, H);
      this.ctx.globalCompositeOperation = 'source-over';
      this.ctx.globalAlpha = 1.0;
    } else if (tags.atmosphere) {
      // Nėra atmo failo — spalvinis overlay
      this._applyColorOverlay(tags.atmosphere);
    }
  }

  // =====================================================
  // Blend režimas pagal atmosferą
  // =====================================================
  _blendMode(atmo) {
    const dark = ['night','rain','fog','dusk'];
    const light = ['dawn','snow'];
    if (dark.includes(atmo))  return 'multiply';
    if (light.includes(atmo)) return 'screen';
    return 'overlay';
  }

  // =====================================================
  // Procedūrinis fonas kai nėra PNG failų
  // Paprastas gradientas + spalvinis tonas pagal vietą
  // =====================================================
  _drawProceduralBg(bg, atmo) {
    const W = this.canvas.width;
    const H = this.canvas.height;

    // Pagrindinė spalvų schema pagal vietą
    const palettes = {
      bridge:       ['#1a1a2e','#16213e','#0f3460'],
      street_main:  ['#0d0d1a','#1a1a2e','#2d2d44'],
      street_narrow:['#0a0a15','#151525','#201f30'],
      park:         ['#0a150a','#0d1f0d','#152815'],
      river_bank:   ['#050e1a','#0a1a2e','#102040'],
      courtyard:    ['#100d18','#1a1525','#251f30'],
      tower:        ['#080811','#10101e','#18182c'],
      cathedral_sq: ['#0c0c1a','#14142a','#1e1e3a'],
      square:       ['#0d0d1a','#16162a','#202035'],
    };

    const colors = palettes[bg] || palettes.street_narrow;

    // Vertikalus gradientas
    const grad = this.ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0,   colors[0]);
    grad.addColorStop(0.5, colors[1]);
    grad.addColorStop(1,   colors[2]);
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, W, H);

    // Žvaigždės nakties atveju
    if (atmo === 'night' || atmo === 'dusk') {
      this._drawStars(W, H);
    }

    // Žibintų efektas gatvei
    if (bg === 'street_main' || bg === 'street_narrow') {
      this._drawStreetLights(W, H, atmo);
    }

    // Taikyti atmosferos spalvą
    this._applyColorOverlay(atmo);
  }

  // Žvaigždžių piešimas (procedūrinė)
  _drawStars(W, H) {
    const count = 80;
    for (let i = 0; i < count; i++) {
      const x = Math.random() * W;
      const y = Math.random() * H * 0.5;
      const r = Math.random() * 1.2;
      const a = 0.3 + Math.random() * 0.7;
      this.ctx.beginPath();
      this.ctx.arc(x, y, r, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(255,255,220,${a})`;
      this.ctx.fill();
    }
  }

  // Gatvės žibintai
  _drawStreetLights(W, H, atmo) {
    const lightColor = atmo === 'night' ? 'rgba(255,200,100,0.15)' : 'rgba(255,220,150,0.08)';
    for (let i = 0; i < 3; i++) {
      const x = (W / 4) * (i + 0.5);
      const grad = this.ctx.createRadialGradient(x, H * 0.3, 2, x, H * 0.3, 120);
      grad.addColorStop(0, lightColor);
      grad.addColorStop(1, 'transparent');
      this.ctx.fillStyle = grad;
      this.ctx.fillRect(x - 120, 0, 240, H * 0.7);
    }
  }

  // Spalvinis overlay pagal atmosferą
  _applyColorOverlay(atmo) {
    const W = this.canvas.width;
    const H = this.canvas.height;
    const overlays = {
      night: 'rgba(5,5,25,0.55)',
      rain:  'rgba(20,30,50,0.45)',
      fog:   'rgba(180,185,200,0.25)',
      dawn:  'rgba(120,60,20,0.22)',
      dusk:  'rgba(60,20,10,0.35)',
      snow:  'rgba(200,210,230,0.18)',
      crowd: 'rgba(10,10,20,0.30)',
    };
    const color = overlays[atmo] || 'rgba(0,0,0,0.2)';
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, W, H);
  }

  // =====================================================
  // Kelionės animacija: pikselinis avataras eina
  // Piešiama travel-canvas elementui
  // =====================================================
  animateTravel(canvasId, durationMs) {
    const c   = document.getElementById(canvasId);
    if (!c) return;
    const ctx = c.getContext('2d');
    const W = c.width  = 256;
    const H = c.height = 128;

    let start   = null;
    let frame   = 0; // Animacijos kadras (0 arba 1, eigos judesys)
    let elapsed = 0;

    const STEP_MS = 200; // Žingsnio animacijos greitis
    let lastStep  = 0;

    const draw = (ts) => {
      if (!start) start = ts;
      elapsed = ts - start;

      // Žingsnio kadro keitimas
      if (ts - lastStep > STEP_MS) {
        frame = (frame + 1) % 4;
        lastStep = ts;
      }

      // Išvalyti
      ctx.clearRect(0, 0, W, H);

      // Žemė
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, W, H);

      // Judantis grindinys (horizonto iliuzija)
      const roadOffset = (elapsed / 15) % 32;
      ctx.fillStyle = '#252535';
      for (let x = -32 + roadOffset; x < W + 32; x += 32) {
        ctx.fillRect(Math.floor(x), H - 20, 16, 20);
      }

      // Pikselinis avataras (8x12 pikselių, padidinta 3x)
      const S = 3; // pikselių dydis
      const ax = W / 2 - 12;
      const ay = H - 56;

      // Bėgimo animacija pagal kadrą
      this._drawWalkingPixel(ctx, ax, ay, S, frame);

      // Tęsti animaciją kol laikas nepasibaigė
      if (elapsed < durationMs) {
        this.animFrame = requestAnimationFrame(draw);
      }
    };

    this.animFrame = requestAnimationFrame(draw);
  }

  // Pikselinis avataras (labai paprastas, 8-bit stiliaus)
  _drawWalkingPixel(ctx, x, y, S, frame) {
    const p = (col, row, color) => {
      ctx.fillStyle = color;
      ctx.fillRect(x + col * S, y + row * S, S, S);
    };

    // Galva
    p(2,0,'#e8c89a'); p(3,0,'#e8c89a'); p(4,0,'#e8c89a');
    p(1,1,'#c8a84a'); p(2,1,'#e8c89a'); p(3,1,'#e8c89a'); p(4,1,'#e8c89a'); p(5,1,'#c8a84a');

    // Kūnas
    p(2,2,'#4878b0'); p(3,2,'#4878b0'); p(4,2,'#4878b0');
    p(2,3,'#4878b0'); p(3,3,'#4878b0'); p(4,3,'#4878b0');

    // Kojos pagal animacijos kadrą
    if (frame === 0 || frame === 2) {
      p(2,4,'#2a4a6a'); p(4,4,'#2a4a6a');
      p(2,5,'#2a4a6a'); p(4,5,'#2a4a6a');
    } else if (frame === 1) {
      p(1,4,'#2a4a6a'); p(4,4,'#2a4a6a');
      p(1,5,'#2a4a6a'); p(5,5,'#2a4a6a');
    } else {
      p(2,4,'#2a4a6a'); p(5,4,'#2a4a6a');
      p(3,5,'#2a4a6a'); p(5,5,'#2a4a6a');
    }
  }

  // =====================================================
  // Paveikslėlio įkėlimas su talpykla
  // =====================================================
  _load(src) {
    if (this.cache[src]) return Promise.resolve(this.cache[src]);
    return new Promise((res, rej) => {
      const img = new Image();
      img.onload  = () => { this.cache[src] = img; res(img); };
      img.onerror = () => rej(new Error(`Nepavyko įkelti: ${src}`));
      img.src = src;
    });
  }
}

// Globalus compositor objektas
const Compositor = new SceneCompositor();
