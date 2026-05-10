// ═══════════════════════════════════════════════════
// engine.js — Visas žaidimo variklis
// Apjungia: žaidimo logiką + 8-bit garsą + paveikslėlių sluoksniavimą
// ═══════════════════════════════════════════════════

// ───────────────────────────────────────────────────
// GLOBALUS ISTORIJŲ REGISTRAS
// Kiekvienas stories/story_N.js prideda savo duomenis čia.
// engine.js niekada tiesiogiai nežino apie failo pavadinimą.
// ───────────────────────────────────────────────────
window.STORIES = window.STORIES || {};

// ATRIBUTŲ SĄRAŠAS
const ATTRS = {
  DRĄSA:'Drąsa', JĖGA:'Jėga', RYŽTAS:'Ryžtas',
  IŠMINTIS:'Išmintis', GUDRUMAS:'Gudrumas', DĖMESYS:'Dėmesys',
  UŽUOJAUTA:'Užuojauta', GARBĖ:'Garbė', VILTIS:'Viltis',
  AMBICIJA:'Ambicija', BAIMĖ:'Baimė', ABEJINGUMAS:'Abejingumas',
  GODUMAS:'Godumas', TIKĖJIMAS:'Tikėjimas', INTUICIJA:'Intuicija', KANTRYBĖ:'Kantrybė',
};

// ARCHETIPAI (2 dažniausi atributai → archetipo vardas)
const ARCHETYPES = {
  DRĄSA_RYŽTAS:'Lakūnas', IŠMINTIS_DĖMESYS:'Tyrinėtojas',
  GUDRUMAS_AMBICIJA:'Šešėlis', UŽUOJAUTA_VILTIS:'Globėjas',
  GARBĖ_TIKĖJIMAS:'Saugotojas', BAIMĖ_ABEJINGUMAS:'Klajoklis',
  INTUICIJA_KANTRYBĖ:'Regėtojas',
};

// LORE užuominos (rodomos kelionės fazės metu)
const LORE = [
  'Senos gatvės atsimena žingsnius, kurių šeimininkai pamiršo.',
  'Miestas niekada nemiega — tik keičia balsą.',
  'Kiekvienas pasirinkimas meta šešėlį, kurio nematysi.',
  'Tiltas — ir praeitis, ir ateitis tuo pačiu metu.',
  'Gatvės vardas saugo senesnį vardą po savimi.',
  'Upė neša žodžius, kurių niekas nebetaria.',
  'Koks tavo pėdsakas? Ar jis paskui tave lieka?',
  'Pilies žiburiai niekada visiškai neužgęsta.',
  'Naktinis Vilnius — visai kitas miestas nei dieninis.',
  'Kiekvieną naktį miestas permąsto savo atmintį.',
];

// ═══════════════════════════════════════════════════
// 1. GARSO MODULIS (8-bit Web Audio API)
//    Nereikia jokių garso failų — visos melodijos generuojamos.
// ═══════════════════════════════════════════════════
const Sound = (() => {
  let ctx = null, master = null;
  let playing = false, curTheme = null, step = 0, seqT = null;
  let musicOn = localStorage.getItem('music') !== 'false';
  let sfxOn   = localStorage.getItem('sfx')   !== 'false';

  // Natos dažniai
  const N = {
    _:0, C3:130.8, D3:146.8, E3:164.8, F3:174.6, G3:196, A3:220, B3:246.9,
    C4:261.6, D4:293.7, E4:329.6, F4:349.2, G4:392, A4:440, B4:493.9,
    C5:523.3, D5:587.3, E5:659.3, G5:784,
  };

  // Temos (melodija + bosas, BPM, bangos forma)
  const THEMES = {
    title: {
      bpm:72, w:'triangle',
      mel:['C4','_','E4','_','G4','A4','G4','_','E4','_','D4','_','C4','_','_','_','F4','_','A4','_','C5','_','B4','_','A4','_','G4','_','F4','E4','_','_'],
      bas:['C3','_','C3','_','G3','_','G3','_','F3','_','F3','_','C3','_','_','_','F3','_','F3','_','C3','_','C3','_','G3','_','G3','_','F3','_','_','_'],
    },
    gameplay: {
      bpm:144, w:'square',
      mel:['G4','G4','_','A4','G4','_','E4','_','G4','G4','_','D5','_','C5','_','_','G4','G4','_','A4','G4','_','D5','_','C5','_','_','_','G3','_','_','_'],
      bas:['G3','_','G3','_','C3','_','C3','_','D3','_','D3','_','G3','_','_','_','G3','_','G3','_','C3','_','C3','_','D3','_','D3','_','G3','_','_','_'],
    },
    travel: {
      bpm:64, w:'triangle',
      mel:['C4','_','_','E4','_','_','G4','_','E4','_','D4','_','C4','_','_','_','A3','_','_','C4','_','_','E4','_','D4','_','C4','_','_','_','_','_'],
      bas:['C3','_','G3','_','C3','_','G3','_','F3','_','G3','_','C3','_','_','_','A2','_','E3','_','A2','_','E3','_','F3','_','G3','_','C3','_','_','_'],
    },
    epilogue: {
      bpm:56, w:'triangle',
      mel:['E4','_','D4','_','C4','_','_','_','D4','_','E4','_','E4','_','_','_','D4','_','D4','_','E4','_','G4','_','E4','_','D4','_','C4','_','_','_'],
      bas:['C3','_','G3','_','C3','_','_','_','G3','_','G3','_','C3','_','_','_','G3','_','G3','_','C3','_','C3','_','G3','_','G3','_','C3','_','_','_'],
    },
  };

  function init() {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = 0.25;
    master.connect(ctx.destination);
  }

  function note(freq, dur, w='square', vol=0.3) {
    if (!ctx || freq <= 0) return;
    try {
      const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime;
      o.type = w; o.frequency.value = freq;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(vol, t + 0.008);
      g.gain.setValueAtTime(vol, t + dur - 0.015);
      g.gain.linearRampToValueAtTime(0, t + dur);
      o.connect(g); g.connect(master);
      o.start(t); o.stop(t + dur);
    } catch(e) {}
  }

  function tick() {
    if (!playing || !curTheme) return;
    const th = curTheme, ms = (60 / th.bpm / 4) * 1000, dur = (ms * 0.8) / 1000;
    const mn = th.mel[step % th.mel.length], bn = th.bas[step % th.bas.length];
    if (mn !== '_' && N[mn]) note(N[mn], dur, th.w, 0.36);
    if (bn !== '_' && N[bn]) note(N[bn], dur, th.w === 'square' ? 'triangle' : th.w, 0.2);
    step++;
    if (step >= Math.max(th.mel.length, th.bas.length)) step = 0;
    seqT = setTimeout(tick, ms);
  }

  return {
    play(name) {
      if (!musicOn) return;
      init();
      if (curTheme === THEMES[name] && playing) return;
      this.stop();
      curTheme = THEMES[name]; if (!curTheme) return;
      playing = true; step = 0; tick();
    },
    stop() {
      playing = false; curTheme = null;
      if (seqT) { clearTimeout(seqT); seqT = null; }
    },
    sfx(type) {
      if (!sfxOn) return; init();
      const p = (f,d,w='square',v=0.2) => note(f,d,w,v);
      const d = (fn,ms) => setTimeout(fn,ms);
      if (type==='select')   { p(440,.06); d(()=>p(660,.1,'square',.16),60); }
      if (type==='navigate') { p(330,.05,'square',.14); }
      if (type==='unlock')   { [523,659,784,1046].forEach((f,i)=>d(()=>p(f,.1,'square',.18),i*60)); }
      if (type==='penalty')  { [220,165].forEach((f,i)=>d(()=>p(f,.15,'square',.22),i*100)); }
      if (type==='complete') { [523,659,784,659,784,1046].forEach((f,i)=>d(()=>p(f,.12,'triangle',.24),i*80)); }
    },
    toggleMusic() {
      musicOn = !musicOn; localStorage.setItem('music', musicOn);
      if (!musicOn) this.stop(); return musicOn;
    },
    toggleSFX() { sfxOn = !sfxOn; localStorage.setItem('sfx', sfxOn); return sfxOn; },
    get musicOn() { return musicOn; },
    get sfxOn()   { return sfxOn; },
  };
})();

// ═══════════════════════════════════════════════════
// 2. PAVEIKSLĖLIŲ MODULIS
//    Kraunami iš img/img.zip (vienas failas).
//    Jei ZIP nėra — procedūrinis fonas automatiškai.
// ═══════════════════════════════════════════════════
const Images = (() => {
  const blobCache = {};
  let zipLoaded  = false;
  let zipLoading = null;

  function loadJSZip() {
    if (window.JSZip) return Promise.resolve();
    return new Promise((ok, err) => {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
      s.onload = ok; s.onerror = err;
      document.head.appendChild(s);
    });
  }

  async function loadZip() {
    if (zipLoaded) return;
    if (zipLoading) return zipLoading;
    zipLoading = (async () => {
      try {
        await loadJSZip();
        const res = await fetch('img/img.zip');
        if (!res.ok) throw new Error('img.zip nerasta');
        const buf = await res.arrayBuffer();
        const zip = await JSZip.loadAsync(buf);
        const tasks = [];
        zip.forEach((path, file) => {
          if (path.match(/\.(png|jpg)$/i)) {
            tasks.push(file.async('blob').then(blob => {
              const key = path.replace(/^img\//, '').replace(/\.(png|jpg)$/i, '');
              blobCache[key] = URL.createObjectURL(blob);
            }));
          }
        });
        await Promise.all(tasks);
        zipLoaded = true;
        console.log('ZIP įkeltas:', Object.keys(blobCache).length, 'paveikslėliai');
      } catch(e) {
        console.log('img.zip nepasiekiama — procedūrinis fonas:', e.message);
        zipLoaded = true;
      }
    })();
    return zipLoading;
  }

  async function getBlobUrl(type, name) {
    await loadZip();
    return blobCache[type + '/' + name] || null;
  }

  // Placeholder load function for compatibility
  function load(src) { return Promise.resolve(null); }

  // Procedūrinis fonas kai PNG nėra
  function drawProc(ctx, W, H, bg, atmo) {
    const pals = {
      bridge:       ['#2a3a2a','#1a2a3a','#0a1520'],
      street_main:  ['#2a2a3a','#1a1a2a','#0d0d1a'],
      street_narrow:['#201818','#2a1a18','#180e0a'],
      park:         ['#1a2a1a','#0d1a0d','#081208'],
      river_bank:   ['#0a1828','#081220','#040c18'],
      courtyard:    ['#1a1520','#120e18','#0a0810'],
      tower:        ['#181820','#101018','#080810'],
      cathedral_sq: ['#181828','#101020','#080818'],
      square:       ['#201a18','#181210','#100c08'],
    };
    const c = pals[bg] || pals.street_narrow;
    const g = ctx.createLinearGradient(0,0,0,H);
    g.addColorStop(0,c[0]); g.addColorStop(.5,c[1]); g.addColorStop(1,c[2]);
    ctx.fillStyle = g; ctx.fillRect(0,0,W,H);
    // Žvaigždės naktyje
    if (atmo==='night'||atmo==='dusk') {
      for(let i=0;i<60;i++){
        const x=Math.random()*W, y=Math.random()*H*.5, a=.2+Math.random()*.7;
        ctx.beginPath(); ctx.arc(x,y,Math.random()*1.2,0,Math.PI*2);
        ctx.fillStyle=`rgba(255,245,220,${a})`; ctx.fill();
      }
    }
    // Atmosferos overlay
    const ov={night:'rgba(5,5,25,.55)',rain:'rgba(20,30,50,.45)',fog:'rgba(180,185,200,.28)',
               dawn:'rgba(120,60,20,.25)',dusk:'rgba(60,20,10,.38)',snow:'rgba(200,210,230,.2)',crowd:'rgba(10,10,20,.3)'};
    if(ov[atmo]){ctx.fillStyle=ov[atmo]; ctx.fillRect(0,0,W,H);}
  }

  return {
    preload() { loadZip(); },

    async render(canvasId, tags) {
      const cv = document.getElementById(canvasId); if(!cv) return;
      const ctx = cv.getContext('2d');
      const W = cv.width, H = cv.height;
      const bgUrl   = await getBlobUrl('bg', tags.background || 'street_narrow');
      const atmoUrl = tags.atmosphere ? await getBlobUrl('atmo', tags.atmosphere) : null;

      if (bgUrl) {
        const img = new Image();
        await new Promise(ok => { img.onload = ok; img.src = bgUrl; });
        ctx.drawImage(img, 0, 0, W, H);
      } else { drawProc(ctx, W, H, tags.background, tags.atmosphere); }

      if (atmoUrl) {
        const modes={night:'multiply',rain:'multiply',fog:'screen',dawn:'screen',dusk:'multiply',snow:'screen',crowd:'multiply'};
        const img = new Image();
        await new Promise(ok => { img.onload = ok; img.src = atmoUrl; });
        ctx.globalCompositeOperation = modes[tags.atmosphere]||'overlay';
        ctx.globalAlpha = 0.6;
        ctx.drawImage(img, 0, 0, W, H);
        ctx.globalCompositeOperation='source-over'; ctx.globalAlpha=1;
      }
    },

    // Kelionės animacija (pikselinis avataras eina)
    animateTravel(canvasId, durationMs) {
      const cv = document.getElementById(canvasId); if(!cv) return;
      const ctx = cv.getContext('2d');
      const W=cv.width, H=cv.height;
      let start=null, fr=0, lastStep=0;
      const STEP=200;

      const draw=(ts)=>{
        if(!start) start=ts;
        const el=ts-start;
        if(ts-lastStep>STEP){fr=(fr+1)%4;lastStep=ts;}
        ctx.clearRect(0,0,W,H);
        ctx.fillStyle='#c8b898'; ctx.fillRect(0,0,W,H);
        // Kelio animacija
        const off=(el/12)%32;
        ctx.fillStyle='#a89878';
        for(let x=-32+off;x<W+32;x+=32) ctx.fillRect(Math.floor(x),H-18,16,18);
        // Avataras
        const S=3, ax=W/2-12, ay=H-50;
        this._walkPixel(ctx,ax,ay,S,fr);
        if(el<durationMs) requestAnimationFrame(draw);
      };
      requestAnimationFrame(draw);
    },

    _walkPixel(ctx,x,y,S,fr){
      const p=(c,r,col)=>{ctx.fillStyle=col;ctx.fillRect(x+c*S,y+r*S,S,S);};
      p(2,0,'#e8c89a');p(3,0,'#e8c89a');p(4,0,'#e8c89a');
      p(1,1,'#c8a84a');p(2,1,'#e8c89a');p(3,1,'#e8c89a');p(4,1,'#e8c89a');p(5,1,'#c8a84a');
      p(2,2,'#4878b0');p(3,2,'#4878b0');p(4,2,'#4878b0');
      p(2,3,'#4878b0');p(3,3,'#4878b0');p(4,3,'#4878b0');
      if(fr===0||fr===2){p(2,4,'#2a4a6a');p(4,4,'#2a4a6a');p(2,5,'#2a4a6a');p(4,5,'#2a4a6a');}
      else if(fr===1){p(1,4,'#2a4a6a');p(4,4,'#2a4a6a');p(1,5,'#2a4a6a');p(5,5,'#2a4a6a');}
      else{p(2,4,'#2a4a6a');p(5,4,'#2a4a6a');p(3,5,'#2a4a6a');p(5,5,'#2a4a6a');}
    },
  };
})();

// ═══════════════════════════════════════════════════
// 3. SESIJOS KŪRIMAS
//    Sukuriamas naujas objektas kiekvienai žaidimo sesijai
// ═══════════════════════════════════════════════════
function newSession(code) {
  const digits = code.split('').map(Number);
  return {
    code, digits,
    bitLimit: digits.length * 6,
    activeStories: digits.map(d => d===0 ? Math.ceil(Math.random()*10) : d),
    stats: {
      might: Math.floor(Math.random()*10)+1,
      wit:   Math.floor(Math.random()*10)+1,
      grace: Math.floor(Math.random()*10)+1,
      luck:  Math.floor(Math.random()*10)+1,
    },
    choiceLog: [], bitsVisited: [], storyProgress: {},
    attrCount: {}, flagCount: 0, passiveCount: 0,
    score: 0, startTime: Date.now(), suspicious: false,
    currentStory: null, currentBit: null, nextBitId: null,
    _autoCode: null,
  };
}

// ═══════════════════════════════════════════════════
// 4. PAGRINDINIS ŽAIDIMO VARIKLIS
// ═══════════════════════════════════════════════════
const Game = {
  s: null, // aktyvus session objektas
  timers: {},
  _bitStart: 0,

  // ─── Inicializacija ───
  init() {
    this._applySettings();
    this._bind();
    this.show('title');
    Sound.play('title');
    this._titleAnim();
    // Pradėti krauti paveikslėlius fone (neblokuoja UI)
    Images.preload();
  },

  // ─── Ekranų keitimas ───
  show(name) {
    document.querySelectorAll('.screen').forEach(el => {
      el.classList.remove('active');
      el.classList.add('hidden'); // grąžinti hidden visiems
    });
    const el = document.getElementById(`scr-${name}`);
    if (el) {
      el.classList.remove('hidden'); // pašalinti hidden tik aktyviam
      el.style.display = 'flex';
      requestAnimationFrame(() => el.classList.add('active'));
    }
  },

  // ─── Mygtukų priskyrimas ───
  _bind() {
    const on = (id, fn) => { const e = document.getElementById(id); if (e) e.addEventListener('click', fn); };

    // Titulinis
    on('btn-play',    () => { Sound.sfx('navigate'); this.show('code'); this._initCode(); });
    on('btn-options', () => { Sound.sfx('navigate'); this._showOv('ov-options'); });
    on('btn-credits', () => { Sound.sfx('navigate'); this._showOv('ov-credits'); });
    on('cls-options', () => this._hideOv('ov-options'));
    on('cls-credits', () => this._hideOv('ov-credits'));

    // Nustatymai
    on('tog-music', () => {
      const on = Sound.toggleMusic();
      const b = document.getElementById('tog-music');
      if (b) { b.textContent = on ? 'Įjungta' : 'Išjungta'; b.dataset.on = on; }
      if (on) Sound.play(this._curTheme());
    });
    on('tog-sfx', () => {
      const on = Sound.toggleSFX();
      const b = document.getElementById('tog-sfx');
      if (b) { b.textContent = on ? 'Įjungti' : 'Išjungti'; b.dataset.on = on; }
    });
    document.querySelectorAll('.sz-btn').forEach(b => b.addEventListener('click', () => {
      document.querySelectorAll('.sz-btn').forEach(x=>x.classList.remove('active'));
      b.classList.add('active');
      document.body.className = document.body.className.replace(/font-\w+/,'');
      document.body.classList.add(`font-${b.dataset.sz}`);
      localStorage.setItem('fontSize', b.dataset.sz);
      Sound.sfx('navigate');
    }));

    // Kodas
    on('btn-reroll', () => { Sound.sfx('navigate'); this._genCode(); });
    on('btn-go', () => this._startFromCode());
    on('btn-back-code', () => { Sound.sfx('navigate'); this.show('title'); Sound.play('title'); });
    const ci = document.getElementById('code-input');
    if (ci) ci.addEventListener('input', () => this._validateCode());

    // Profilis
    on('btn-begin', () => { Sound.sfx('select'); Sound.play('gameplay'); this._nextBit(); });

    // Žaidimas
    on('btn-settings-hud', () => { Sound.sfx('navigate'); this._showOv('ov-options'); });
    on('btn-end', () => this._endEarly());
    on('btn-skip', () => this._endEarly());

    // Epilogas
    on('btn-again', () => { Sound.sfx('navigate'); this.show('code'); this._initCode(); });
    on('btn-title', () => { Sound.sfx('navigate'); this.s = null; this.show('title'); Sound.play('title'); });
  },

  // ─── Kodo ekranas ───
  _initCode() {
    this._genCode();
    const i = document.getElementById('code-input'); if (i) i.value = '';
    const e = document.getElementById('code-err'); if (e) e.classList.add('hidden');
    this._setInfo('');
  },
  _genCode() {
    const len = 3 + Math.floor(Math.random() * 5);
    const code = Array.from({length:len}, ()=>Math.floor(Math.random()*10)).join('');
    this._showDigits(code);
    this._setInfo(code);
    this._autoCode = code;
  },
  _showDigits(code) {
    const el = document.getElementById('code-digits'); if (!el) return;
    el.innerHTML = '';
    code.split('').forEach((d,i) => {
      const box = document.createElement('div');
      box.className = 'c-digit'; box.textContent = d;
      box.style.animationDelay = `${i*45}ms`;
      el.appendChild(box);
    });
  },
  _setInfo(code) {
    const el = document.getElementById('code-info'); if (!el) return;
    if (!code) { el.textContent = ''; return; }
    el.textContent = `${code.length} sk. · ${code.length*6} bitai · ~${Math.round(code.length*6*1.5)} min.`;
  },
  _validateCode() {
    const i = document.getElementById('code-input');
    const e = document.getElementById('code-err');
    if (!i || !e) return;
    const v = i.value.replace(/\D/g,''); i.value = v;
    if (v.length > 0 && v.length < 3) { e.textContent='Min. 3 skaitmenys'; e.classList.remove('hidden'); }
    else e.classList.add('hidden');
    if (v.length >= 3) this._setInfo(v);
    else this._setInfo(this._autoCode || '');
  },
  _startFromCode() {
    const inp = document.getElementById('code-input');
    const custom = inp ? inp.value.replace(/\D/g,'') : '';
    const code = custom.length >= 3 ? custom : (this._autoCode || '314');
    if (code.length < 3) {
      const e = document.getElementById('code-err');
      if (e) { e.textContent='Per trumpas kodas!'; e.classList.remove('hidden'); }
      return;
    }
    Sound.sfx('select');
    this.s = newSession(code);
    this._showProfile();
  },

  // ─── Profilio ekranas ───
  _showProfile() {
    this.show('profile');
    this._drawAvatar('av-canvas', this.s.stats);
    const hints=[], S=this.s.stats;
    if(S.might>=7) hints.push('Tavo rankos tvirtos kaip akmuo.');
    if(S.wit  >=7) hints.push('Tavo akys mato daugiau nei kiti.');
    if(S.grace>=7) hints.push('Tavo žingsniai tylūs ir tikslūs.');
    if(S.luck >=7) hints.push('Likimas tau šypsosi.');
    if(!hints.length) hints.push('Paprastas keliautojas. Nieko ypatingo.');
    const h=document.getElementById('av-hints'); if(h) h.innerHTML=hints.map(x=>`<div>${x}</div>`).join('');
    const f=document.getElementById('av-flavor');
    const fl=['Miestas laukia.','Kiekvienas žingsnis bus atsiminimai.','Ar Vilnius atsiminins tave?'];
    if(f) f.textContent=fl[Math.floor(Math.random()*fl.length)];
  },

  // ─── Pikselinis avataras ───
  _drawAvatar(id, stats) {
    const cv=document.getElementById(id); if(!cv) return;
    const ctx=cv.getContext('2d'), S=8;
    ctx.clearRect(0,0,128,128);
    const p=(c,r,col)=>{ctx.fillStyle=col;ctx.fillRect(c*S,r*S,S,S);};
    const armor=stats.might>=7, scroll=stats.wit>=7;
    const cloak=stats.grace>=7?'#503080':'#4878b0';
    const boots='#3a2a1a', skin='#e8c89a', hair='#4a3020';
    p(3,1,hair);p(4,1,hair);p(5,1,hair);
    p(3,2,skin);p(4,2,skin);p(5,2,skin);
    p(3,3,skin);p(4,3,skin);p(5,3,skin);
    if(armor){['#708090'].forEach(c=>{p(2,1,c);p(3,1,c);p(4,1,c);p(5,1,c);p(6,1,c);p(2,2,c);p(6,2,c);});}
    p(3,4,cloak);p(4,4,cloak);p(5,4,cloak);
    p(3,5,cloak);p(4,5,cloak);p(5,5,cloak);
    p(3,6,cloak);p(4,6,cloak);p(5,6,cloak);
    if(stats.luck>=7) p(4,5,'#ffd700');
    p(2,4,skin);p(6,4,skin);p(2,5,skin);p(6,5,skin);
    if(scroll){p(7,4,'#d4b060');p(7,5,'#d4b060');p(7,6,'#d4b060');}
    p(3,7,cloak);p(5,7,cloak);p(3,8,boots);p(5,8,boots);p(3,9,boots);p(5,9,boots);
  },

  // ─── Bito įkėlimas ───
  _nextBit() {
    const s = this.s;
    if (s.bitsVisited.length >= s.bitLimit) { this._epilogue('Kelionės laikas baigėsi.'); return; }

    // Filtruoti tik esamas istorijas (apsauga kai kodas nurodo neegzistuojančią)
    const available = Object.keys(window.STORIES).map(Number);
    if (!available.length) { this._epilogue('Nėra istorijų. Pridėkite story_1.js.'); return; }

    const idx = s.bitsVisited.length % s.activeStories.length;
    // Jei story neegzistuoja — paimti atsitiktinę iš turimų
    let sid = s.activeStories[idx];
    if (!window.STORIES[sid]) {
      sid = available[s.bitsVisited.length % available.length];
    }
    const story = window.STORIES[sid];
    if (!story) { this._epilogue('Istorija nerasta.'); return; }

    const visited = s.storyProgress[sid] || [];
    let nextId = 1;
    if (visited.length > 0) {
      const last = story.bits[visited[visited.length-1]];
      nextId = (last && last.choices && last.choices[0]) ? last.choices[0].unlocks : 10;
    }
    // Saugus fallback: jei nurodytas bitas neegzistuoja, imti pirmą turimą
    const bit = story.bits[nextId]
      || story.bits[10]
      || story.bits[Object.keys(story.bits)[0]];
    if (!bit) { this._epilogue('Istorija tuščia.'); return; }

    s.currentStory = sid; s.currentBit = bit.id;
    this._renderBit(story, bit);
  },

  // ─── Bito rodymas ───
  _renderBit(story, bit) {
    this.show('bit');
    const s = this.s;
    this._bitStart = Date.now();

    // HUD atnaujinimas
    this._updateHUD(story, bit);

    // Scenos canvas (dydis pagal ekraną)
    const scv = document.getElementById('scene-canvas');
    if (scv) { scv.width = scv.offsetWidth || window.innerWidth; scv.height = 180; }
    Images.render('scene-canvas', bit.imageTags || {background:'street_narrow',atmosphere:'night'});

    // Vietovardis
    const loc=document.getElementById('bit-loc'); if(loc) loc.textContent=`✦ ${bit.location||''}`;

    // Slėpti pasirinkimus, outcome
    const cw=document.getElementById('choices-wrap'); if(cw) { cw.classList.add('hidden'); cw.innerHTML=''; }
    ['outcome-label','outcome-text'].forEach(id=>{const e=document.getElementById(id);if(e)e.classList.add('hidden');});

    // Puslapio numeris
    const pn=document.getElementById('page-num'); if(pn) pn.textContent=s.bitsVisited.length+1;

    // Rašomosios mašinėlės efektas
    this._typeText('bit-text', bit.narrative||'', 22);

    // Laikmaičio paleidimas
    this._startTimer(bit);
  },

  // ─── HUD atnaujinimas ───
  _updateHUD(story, bit) {
    const s = this.s;
    const nm=document.getElementById('hud-name'); if(nm) nm.textContent='Keliautojas';
    const sl=document.getElementById('hud-story'); if(sl) sl.textContent=story.name;

    // Resursai (rodomi kaip paslėpti — žydrai tik ?)
    ['might','wit','grace','luck'].forEach(k=>{
      const e=document.getElementById(`r-${k}`); if(e) e.textContent='?';
    });
    const rb=document.getElementById('r-bits'); if(rb) rb.textContent=s.bitsVisited.length;
    const rs=document.getElementById('r-score'); if(rs) rs.textContent=s.score;

    // Statistikų taškai (raudoni = might, žalsvai mėlyni = wit)
    this._drawDots('dots-red', s.stats.might, 'red');
    this._drawDots('dots-teal', s.stats.wit, 'teal');

    // HUD portretas
    this._drawAvatar('hud-portrait', s.stats);

    // XP juosta (bito progresas)
    const xp=document.getElementById('xp-bar');
    if(xp) xp.style.width=`${Math.min(100,(s.bitsVisited.length/s.bitLimit)*100)}%`;
  },

  _drawDots(id, val, type) {
    const el=document.getElementById(id); if(!el) return;
    el.innerHTML='';
    for(let i=0;i<5;i++){
      const d=document.createElement('div');
      d.className=`dot ${i < Math.round(val/2) ? type : 'empty'}`;
      el.appendChild(d);
    }
  },

  // ─── 3 fazių laikmaitis ───
  _startTimer(bit) {
    this._clearTimers();
    const start = Date.now();
    const TOTAL=60000, UNLOCK=10000;

    this.timers.bar = setInterval(() => {
      const el=Date.now()-start;
      const pct=Math.max(0,100-(el/TOTAL)*100);
      const tf=document.getElementById('timer-fill');
      const tl=document.getElementById('timer-label');
      if(tf){ tf.style.width=pct+'%'; tf.className='timer-fill'+(pct<25?' danger':pct<50?' warn':'');}
      if(tl) tl.textContent=el<UNLOCK?`Skaitoma... (${Math.ceil((UNLOCK-el)/1000)})`:' Pasirinkite...';
    },200);

    this.timers.unlock = setTimeout(()=>this._showChoices(bit), UNLOCK);
    this.timers.auto   = setTimeout(()=>this._autoSelect(bit), TOTAL);
  },

  // ─── Pasirinkimų rodymas ───
  _showChoices(bit) {
    const wrap=document.getElementById('choices-wrap'); if(!wrap) return;
    wrap.innerHTML='';
    bit.choices.forEach((ch,i) => {
      const btn=document.createElement('button');
      btn.className='ch-item'+(ch.statCheck?' skill-chk':'');
      // Sėkmės tikimybė pagal statistiką
      const pct = this._calcPct(ch);
      btn.innerHTML=`
        <div class="ch-main"><span class="ch-ico">✦</span>${ch.text}</div>
        ${pct!==null?`<div class="ch-pct ${ch.statCheck?'skill':''}"><span class="ch-pct-ico">${ch.statCheck?'⚡':'●'}</span>Tikimybė: ${pct}%</div>`:''}
        <div class="ch-attr">${ch.attributes.join(' · ')}</div>`;
      btn.addEventListener('click',()=>this._choose(i, bit));
      wrap.appendChild(btn);
    });
    wrap.classList.remove('hidden');
  },

  // Sėkmės tikimybė (paprasta formulė pagal statistiką ir threshold)
  _calcPct(choice) {
    if (!choice.statCheck) return null;
    const base = 50;
    const diff = this.s.stats[choice.statCheck.stat] - choice.statCheck.threshold;
    return Math.min(95, Math.max(5, base + diff * 8));
  },

  // ─── Pasirinkimas paspaustas ───
  _choose(idx, bit) {
    const s=this.s, ch=bit.choices[idx];
    if (!ch) return;
    const readMs=Date.now()-this._bitStart;
    if (readMs < 10000) { s.flagCount++; if(s.flagCount>=3) s.suspicious=true; }

    s.choiceLog.push({storyId:s.currentStory,bitId:bit.id,choiceIdx:idx,attrs:ch.attributes,readMs,wasSkill:!!ch.statCheck,ts:Date.now()});
    ch.attributes.forEach(a=>{s.attrCount[a]=(s.attrCount[a]||0)+1;});

    // Sekančio bito nustatymas
    let nextId = ch.unlocks;
    let outcome = null;
    if (ch.statCheck) {
      const stat=s.stats[ch.statCheck.stat];
      if (stat >= ch.statCheck.threshold) {
        nextId=ch.statCheck.bonusUnlock;
        outcome={ok:true, text:ch.statCheck.successText||'Sėkmė! Jūsų sugebėjimai leidžia žengti toliau.'};
        Sound.sfx('unlock');
      } else {
        outcome={ok:false, text:ch.statCheck.failText||'Nepavyko. Kelias sunkesnis nei manėte.'};
      }
    }

    // Rodyti outcome jei yra
    if (outcome) {
      const ol=document.getElementById('outcome-label'), ot=document.getElementById('outcome-text');
      if(ol){ ol.textContent=outcome.ok?'⟨Sėkmė⟩':'⟨Nesėkmė⟩'; ol.className='outcome-label'+(outcome.ok?'':' fail'); ol.classList.remove('hidden'); }
      if(ot){ ot.textContent=outcome.text; ot.classList.remove('hidden'); }
    }

    // Žymėti bitą
    s.bitsVisited.push({storyId:s.currentStory,bitId:bit.id,isFinale:bit.isFinale});
    if(!s.storyProgress[s.currentStory]) s.storyProgress[s.currentStory]=[];
    s.storyProgress[s.currentStory].push(bit.id);

    if(bit.isFinale) { this._onFinale(s.currentStory); this._epilogue('Istorija užbaigta!'); return; }

    this._clearTimers();
    Sound.sfx('select');
    s.nextBitId = nextId;

    // Kelionės fazė
    const tMs=Math.min(5000,Math.max(1000,Math.round(readMs/12)));
    this._travel(tMs);
  },

  _autoSelect(bit) {
    this.s.passiveCount++;
    Sound.sfx('penalty');
    const btn=document.querySelector('#choices-wrap .ch-item');
    if(btn) btn.classList.add('auto');
    setTimeout(()=>this._choose(0,bit),300);
  },

  // ─── Kelionės fazė ───
  _travel(ms) {
    this.show('travel');
    Sound.play('travel');
    const lore=document.getElementById('lore-text');
    if(lore) lore.textContent=LORE[Math.floor(Math.random()*LORE.length)];
    Images.animateTravel('travel-canvas',ms);
    this.timers.travel=setTimeout(()=>{
      Sound.play('gameplay');
      this._loadBitById(this.s.currentStory, this.s.nextBitId);
    },ms);
  },

  _loadBitById(storyId, bitId) {
    const story=window.STORIES[storyId]; if(!story){this._nextBit();return;}
    const bit=story.bits[bitId]; if(!bit){this._nextBit();return;}
    this.s.currentBit=bitId;
    this._bitStart=Date.now();
    this._renderBit(story,bit);
  },

  // ─── Istorijos finalas ───
  _onFinale(storyId) {
    Sound.sfx('complete');
    const story=window.STORIES[storyId]; if(!story) return;
    story.killCount=(story.killCount||0)+1;
    this.s.score+=500;
    if(story.killCount>=1000){
      story.status='retired';
      console.log(`Istorija "${story.name}" žymima išimčiai`);
      this._saveSession();
    }
  },

  _endEarly() {
    Sound.sfx('endgame');
    this._clearTimers();
    this._epilogue('Kelionė nutraukta.');
  },

  // ─── Epilogas ───
  _epilogue(reason) {
    this._clearTimers();
    const s=this.s;
    s.score+=s.bitsVisited.length*10+s.choiceLog.filter(c=>c.wasSkill).length*100;
    s.score=Math.max(0,s.score-s.passiveCount*20);
    this._saveSession();

    Sound.play('epilogue');
    this.show('epi');
    this._drawAvatar('epi-avatar',s.stats);

    const arch=this._archetype(s.attrCount);
    const ae=document.getElementById('epi-arch'); if(ae) ae.textContent=arch;

    // Statistikos
    const byStory={};
    s.bitsVisited.forEach(v=>{
      const st=window.STORIES[v.storyId];
      if(!byStory[v.storyId])byStory[v.storyId]={name:st?.name||'?',count:0,fin:0};
      byStory[v.storyId].count++;
      if(v.isFinale)byStory[v.storyId].fin++;
    });
    const es=document.getElementById('epi-stats'); if(es) {
      es.innerHTML=[
        `<div class="epi-stat"><span class="lbl">BITAI</span><span class="val">${s.bitsVisited.length}</span></div>`,
        `<div class="epi-stat"><span class="lbl">LAIKAS</span><span class="val">${Math.round((Date.now()-s.startTime)/60000)} min.</span></div>`,
        `<div class="epi-stat"><span class="lbl">ŽYMĖS</span><span class="val">${s.flagCount}${s.suspicious?' ⚠':''}</span></div>`,
        `<div class="epi-stat"><span class="lbl">PASYVUMAS</span><span class="val">${s.passiveCount}</span></div>`,
        ...Object.values(byStory).map(st=>`<div class="epi-stat"><span class="lbl">${st.name.toUpperCase()}</span><span class="val">${st.count} bitai${st.fin?' ✓':''}</span></div>`)
      ].join('');
    }

    // Epilogo tekstas
    const et=document.getElementById('epi-text'); if(et) {
      const parts=[`${arch}. Toks tavo kelias.`];
      const stList=Object.values(byStory);
      if(stList.length) parts.push(`Tu keliavai per: ${stList.map(x=>x.count+' žingsniai "'+x.name+'"').join(', ')}.`);
      const fin=stList.filter(x=>x.fin>0);
      if(fin.length) parts.push(`Užbaigei: ${fin.map(x=>'"'+x.name+'"').join(', ')}. Miestas tai atsimins.`);
      else parts.push('Pabaigos šį kartą neradai. Bet Vilnius vis dar laukia.');
      if(s.suspicious) parts.push('(Tavo žingsniai buvo neįprastai greiti.)');
      et.textContent=parts.join(' ');
    }

    const sc=document.getElementById('epi-score'); if(sc) sc.textContent=`${s.score} taškų`;
  },

  _archetype(attrCount) {
    if(!attrCount||!Object.keys(attrCount).length) return 'Keliautojas';
    const sorted=Object.entries(attrCount).sort((a,b)=>b[1]-a[1]);
    const k=`${sorted[0]?.[0]}_${sorted[1]?.[0]}`;
    return ARCHETYPES[k]||ARCHETYPES[`${sorted[1]?.[0]}_${sorted[0]?.[0]}`]||ATTRS[sorted[0]?.[0]]||'Keliautojas';
  },

  // ─── Duomenų išsaugojimas ───
  _saveSession() {
    const s=this.s;
    const d={
      sessionId:`${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
      code:s.code, score:s.score, bitCount:s.bitsVisited.length,
      choiceLog:s.choiceLog, attrCount:s.attrCount,
      flagCount:s.flagCount, suspicious:s.suspicious,
      passiveCount:s.passiveCount, durationMs:Date.now()-s.startTime,
      storyProgress:s.storyProgress, ts:new Date().toISOString(),
    };
    try {
      const existing=JSON.parse(localStorage.getItem('sessions')||'[]');
      existing.push(d);
      if(existing.length>200) existing.shift();
      localStorage.setItem('sessions',JSON.stringify(existing));
    } catch(e){}
    try { fetch('/api/session',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)}); } catch(e){}
  },

  // ─── Rašomosios mašinėlės efektas ───
  _typeText(id, text, msPer) {
    const el=document.getElementById(id); if(!el) return;
    el.innerHTML='';
    let i=0;
    const cur=document.createElement('span'); cur.className='cursor'; el.appendChild(cur);
    const iv=setInterval(()=>{
      if(i>=text.length){clearInterval(iv);cur.remove();return;}
      el.insertBefore(document.createTextNode(text[i]),cur); i++;
    },msPer);
  },

  // ─── Titulinio fono animacija ───
  _titleAnim() {
    const cv=document.getElementById('title-bg-canvas'); if(!cv) return;
    // Tituliniame ekrane nėra canvas, praleidžiame
  },

  // ─── Nustatymų pritaikymas ───
  _applySettings() {
    const fs=localStorage.getItem('fontSize')||'md';
    document.body.classList.add(`font-${fs}`);
    document.querySelectorAll('.sz-btn').forEach(b=>b.classList.toggle('active',b.dataset.sz===fs));
    const mb=document.getElementById('tog-music'); if(mb){mb.textContent=Sound.musicOn?'Įjungta':'Išjungta';mb.dataset.on=Sound.musicOn;}
    const sb=document.getElementById('tog-sfx');   if(sb){sb.textContent=Sound.sfxOn?'Įjungti':'Išjungti';sb.dataset.on=Sound.sfxOn;}
  },

  _curTheme() {
    const a=document.querySelector('.screen.active'); if(!a) return 'title';
    return {title:'title','scr-bit':'gameplay','scr-travel':'travel','scr-epi':'epilogue'}[a.id]||'title';
  },

  _clearTimers() { Object.values(this.timers).forEach(t=>{clearInterval(t);clearTimeout(t);}); this.timers={}; },
  _showOv(id) { const e=document.getElementById(id);if(e)e.classList.remove('hidden'); },
  _hideOv(id) { const e=document.getElementById(id);if(e)e.classList.add('hidden'); },
};

// ─── Paleidimas ───
document.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('click',()=>Sound.init&&Sound.init(),{once:true});
  // Patikrinti ar yra bent viena istorija
  if (!Object.keys(window.STORIES).length) {
    console.warn('Nepridėta jokia istorija. Pridėkite stories/story_1.js failą.');
  }
  Game.init();
});
