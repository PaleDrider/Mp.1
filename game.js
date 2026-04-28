// =========================================================
// game.js — Pagrindinis Žaidimo Variklis "Vilniaus Aidai"
// Valdo: ekranų keitimą, sesijos logiką, laikmaičius,
// pasirinkimus, bito skaitymo sistemą, statistiką
// =========================================================

// =====================================================
// ŽAIDĖJO SESIJOS OBJEKTAS
// Sukuriamas naujas kiekvienai sesijai
// =====================================================
function createSession(code) {
  const digits = code.split('').map(Number);
  return {
    code,
    digits,
    // Bitų limitas: kiekvienas skaitmuo = 6 bitai
    bitLimit: digits.length * 6,
    // Aktyvių istorijų ID sąrašas (iš kodo)
    activeStories: digits.map(d => d === 0
      ? Math.floor(Math.random() * 10) + 1  // 0 = atsitiktinė
      : d
    ),

    // Sugeneruotos paslėptos statistikos (1–10)
    stats: {
      might: Math.floor(Math.random() * 10) + 1, // Jėga
      wit:   Math.floor(Math.random() * 10) + 1, // Protas
      grace: Math.floor(Math.random() * 10) + 1, // Gracingumas
      luck:  Math.floor(Math.random() * 10) + 1, // Laimė
    },

    // Žaidimo eigas žurnalas
    choiceLog:    [],  // { bitId, storyId, choiceIndex, attrs, ts, readMs }
    bitsVisited:  [],  // { storyId, bitId, isFinale }
    flagCount:    0,   // Greito paspaudimo žymės (bot detektorius)
    passiveCount: 0,   // Automatinių pasirinkimų skaičius
    score:        0,
    startTime:    Date.now(),

    // Dabartinis bito būsena
    currentStoryId: null,
    currentBitId:   null,
    storyProgress:  {}, // { storyId: [bitIds...] }

    // Atributų skaitikliai (archetipui)
    attrCount: {},
  };
}

// =====================================================
// PAGRINDINĖ ŽAIDIMO BŪSENA
// =====================================================
const Game = {
  session:  null,       // Dabartinė sesija
  timers:   {},         // Aktyvūs laikmaičiai
  screens:  {},         // Ekranų elementai

  // =====================================================
  // Inicializuoti žaidimą — iškviesti vieną kartą
  // =====================================================
  init() {
    // Surinkti visus ekranus
    this.screens = {
      title:    document.getElementById('screen-title'),
      code:     document.getElementById('screen-code'),
      profile:  document.getElementById('screen-profile'),
      bit:      document.getElementById('screen-bit'),
      travel:   document.getElementById('screen-travel'),
      epilogue: document.getElementById('screen-epilogue'),
    };

    // Compositor inicializacija (scenos canvas)
    Compositor.init('scene-canvas');

    // Pritaikyti išsaugotus nustatymus
    this._applySettings();

    // Priskirti mygtukų klausytojus
    this._bindUI();

    // Rodyti titulą
    this.showScreen('title');
    Audio8bit.play('title');

    // Titulinio ekrano animacija (procedūrinė)
    this._animateTitleBg();
  },

  // =====================================================
  // EKRANŲ VALDYMAS
  // =====================================================
  showScreen(name) {
    Object.entries(this.screens).forEach(([k, el]) => {
      if (!el) return;
      el.classList.remove('active', 'hidden');
      if (k === name) {
        el.classList.add('active');
        el.style.display = 'flex';
      } else {
        el.style.display = 'none';
      }
    });
  },

  // =====================================================
  // UI MYGTUKŲ PRISKYRIMAS
  // =====================================================
  _bindUI() {
    // --- Titulinis ---
    this._on('btn-play',    () => { Audio8bit.sfx('navigate'); this.showScreen('code'); this._initCodeScreen(); });
    this._on('btn-options', () => { Audio8bit.sfx('navigate'); this._showOverlay('overlay-options'); });
    this._on('btn-credits', () => { Audio8bit.sfx('navigate'); this._showOverlay('overlay-credits'); });

    // --- Perdangos uždarymas ---
    this._on('close-options', () => this._hideOverlay('overlay-options'));
    this._on('close-credits', () => this._hideOverlay('overlay-credits'));

    // --- Nustatymai ---
    this._on('toggle-music', () => {
      const on = Audio8bit.toggleMusic();
      const btn = document.getElementById('toggle-music');
      if (btn) { btn.textContent = on ? 'ĮJUNGTA' : 'IŠJUNGTA'; btn.dataset.active = on; }
      if (on) Audio8bit.play(this._currentTheme());
    });
    this._on('toggle-sfx', () => {
      const on = Audio8bit.toggleSFX();
      const btn = document.getElementById('toggle-sfx');
      if (btn) { btn.textContent = on ? 'ĮJUNGTI' : 'IŠJUNGTI'; btn.dataset.active = on; }
    });

    // Šrifto dydžio mygtukai
    document.querySelectorAll('.size-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const size = btn.dataset.size;
        document.body.className = document.body.className.replace(/font-\w+/g, '');
        document.body.classList.add(`font-${size}`);
        localStorage.setItem('fontSize', size);
        Audio8bit.sfx('navigate');
      });
    });

    // --- Kodo ekranas ---
    this._on('btn-reroll', () => { Audio8bit.sfx('navigate'); this._generateCode(); });
    this._on('btn-start-journey', () => this._startFromCode());
    this._on('btn-back-from-code', () => { Audio8bit.sfx('navigate'); this.showScreen('title'); });

    // Kodo įvestis — tikrinti realiu laiku
    const codeInput = document.getElementById('custom-code-input');
    if (codeInput) codeInput.addEventListener('input', () => this._validateCodeInput());

    // --- Profilio ekranas ---
    this._on('btn-begin', () => this._beginJourney());

    // --- Žaidimo ekranas ---
    this._on('btn-end-game', () => this._endGameEarly());

    // Pasirinkimų mygtukai
    document.querySelectorAll('.choice-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index);
        this._onChoiceSelected(idx);
      });
    });

    // --- Kelionės ekranas ---
    this._on('btn-skip-travel', () => this._endGameEarly());

    // --- Epilogo ekranas ---
    this._on('btn-play-again', () => {
      Audio8bit.sfx('navigate');
      this.showScreen('code');
      this._initCodeScreen();
    });
    this._on('btn-back-title', () => {
      Audio8bit.sfx('navigate');
      this.session = null;
      Audio8bit.play('title');
      this.showScreen('title');
    });
  },

  // Pagalbinė: priskirti click klausytoją pagal ID
  _on(id, fn) {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', fn);
  },

  // =====================================================
  // KODO EKRANAS
  // =====================================================
  _initCodeScreen() {
    this._generateCode();
    const input = document.getElementById('custom-code-input');
    if (input) input.value = '';
    const err = document.getElementById('code-error');
    if (err) err.classList.add('hidden');
    this._updateCodeInfo('');
  },

  // Sugeneruoti atsitiktinį 5 skaitmenų kodą
  _generateCode() {
    const len    = 3 + Math.floor(Math.random() * 5); // 3–7 skaitmenų
    const digits = Array.from({length: len}, () => Math.floor(Math.random() * 10));
    const code   = digits.join('');
    this._displayCode(code, 'auto-code-display');
    this._updateCodeInfo(code);
    // Saugoti kaip aktyvų auto kodą
    this._currentAutoCode = code;
  },

  // Rodyti kodą kaip atskirus skaičių langelius
  _displayCode(code, containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = '';
    code.split('').forEach((d, i) => {
      const box = document.createElement('div');
      box.className = 'code-digit';
      box.textContent = d;
      box.style.animationDelay = `${i * 50}ms`;
      el.appendChild(box);
    });
  },

  // Rodyti sesijos informaciją
  _updateCodeInfo(code) {
    const el = document.getElementById('code-info');
    if (!el || !code) { if (el) el.textContent = ''; return; }
    const bits = code.length * 6;
    el.textContent = `${code.length} sk. · ${bits} bitai · ~${Math.round(bits * 1.5)} min.`;
  },

  // Tikrinti vartotojo įvestą kodą
  _validateCodeInput() {
    const input = document.getElementById('custom-code-input');
    const err   = document.getElementById('code-error');
    if (!input || !err) return false;

    const val = input.value.replace(/\D/g, ''); // Tik skaitmenys
    input.value = val;

    if (val.length === 0) {
      err.classList.add('hidden');
      this._updateCodeInfo(this._currentAutoCode || '');
      return true;
    }
    if (val.length < 3) {
      err.textContent = 'Mažiausiai 3 skaitmenys';
      err.classList.remove('hidden');
      return false;
    }
    err.classList.add('hidden');
    this._updateCodeInfo(val);
    return true;
  },

  // Pradėti iš kodo ekrano
  _startFromCode() {
    const input  = document.getElementById('custom-code-input');
    const custom = input ? input.value.replace(/\D/g, '') : '';
    const code   = custom.length >= 3 ? custom : (this._currentAutoCode || '314');

    if (code.length < 3) {
      const err = document.getElementById('code-error');
      if (err) { err.textContent = 'Per trumpas kodas!'; err.classList.remove('hidden'); }
      return;
    }

    Audio8bit.sfx('select');
    this.session = createSession(code);
    this._showProfile();
  },

  // =====================================================
  // PROFILIO EKRANAS
  // =====================================================
  _showProfile() {
    this.showScreen('profile');

    // Piešti pikselinį avataorą
    this._drawAvatar('avatar-canvas', this.session.stats);

    // Tekstinės užuominos apie statistikas (be skaičių!)
    const hints = [];
    const s = this.session.stats;
    if (s.might >= 7) hints.push('Tavo rankos tvirtos kaip akmuo.');
    if (s.wit    >= 7) hints.push('Tavo akys mato daugiau nei kiti.');
    if (s.grace  >= 7) hints.push('Tavo žingsniai tylūs ir tikslūs.');
    if (s.luck   >= 7) hints.push('Likimas tau šypsosi.');
    if (hints.length === 0) hints.push('Paprastas keliautojas. Niekas nepaprasto.');

    const hintsEl = document.getElementById('avatar-hints');
    if (hintsEl) hintsEl.innerHTML = hints.map(h => `<div>${h}</div>`).join('');

    // Skoninis tekstas
    const flavors = [
      'Miestas laukia. Istorija prasideda čia.',
      'Kiekvienas žingsnis bus atsiminimai.',
      'Vilnius atsimena visus. Ar jis atsiminys tave?',
    ];
    const flavEl = document.getElementById('profile-flavor');
    if (flavEl) flavEl.textContent = flavors[Math.floor(Math.random() * flavors.length)];
  },

  // =====================================================
  // PIKSELINIO AVATARO PIEŠIMAS (Canvas API)
  // 16×16 pikselių, kiekvienas blokasas = 8px
  // Statistikos nustato išvaizdą
  // =====================================================
  _drawAvatar(canvasId, stats) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const S   = 8; // Vieno "pikselio" dydis ekrane
    ctx.clearRect(0, 0, 128, 128);

    // Spalvų paletė
    const skin   = '#e8c89a';
    const hair   = '#4a3020';
    const armor  = '#708090'; // Jėga >= 7
    const scroll = '#d4b060'; // Protas >= 7
    const cloak  = stats.grace >= 7 ? '#503080' : '#4878b0';
    const boots  = '#3a2a1a';
    const amulet = stats.luck  >= 7 ? '#ffd700' : null;

    const p = (col, row, color) => {
      ctx.fillStyle = color;
      ctx.fillRect(col * S, row * S, S, S);
    };

    // Galva (3–5 stulpeliai, 1–2 eilutės)
    p(3,1,hair); p(4,1,hair); p(5,1,hair);
    p(3,2,skin); p(4,2,skin); p(5,2,skin);
    p(3,3,skin); p(4,3,skin); p(5,3,skin);

    // Šalmas jei jėga >= 7
    if (stats.might >= 7) {
      p(2,1,armor); p(3,1,armor); p(4,1,armor); p(5,1,armor); p(6,1,armor);
      p(2,2,armor); p(6,2,armor);
    }

    // Kūnas
    p(3,4,cloak); p(4,4,cloak); p(5,4,cloak);
    p(3,5,cloak); p(4,5,cloak); p(5,5,cloak);
    p(3,6,cloak); p(4,6,cloak); p(5,6,cloak);

    // Amuletas jei laimė >= 7
    if (amulet) p(4,5,amulet);

    // Rankos
    p(2,4,skin); p(6,4,skin);
    p(2,5,skin); p(6,5,skin);

    // Ritinys jei protas >= 7
    if (stats.wit >= 7) {
      p(7,4,scroll); p(7,5,scroll); p(7,6,scroll);
    }

    // Kojos ir batai
    p(3,7,cloak); p(5,7,cloak);
    p(3,8,boots); p(5,8,boots);
    p(3,9,boots); p(5,9,boots);
  },

  // =====================================================
  // KELIONĖS PRADŽIA (po profilio ekrano)
  // =====================================================
  _beginJourney() {
    Audio8bit.sfx('select');
    Audio8bit.play('gameplay');
    this._loadNextBit();
  },

  // =====================================================
  // BITO ĮKĖLIMAS
  // Ieško sekančio bito pagal sesijos aktyvias istorijas
  // =====================================================
  _loadNextBit() {
    const s = this.session;

    // Ar pasiektas bitų limitas?
    if (s.bitsVisited.length >= s.bitLimit) {
      this._triggerEpilogue('Kelionės laikas baigėsi.');
      return;
    }

    // Pasirinkti istoriją (rotacija per aktyvias istorijas)
    const storyIdx    = s.bitsVisited.length % s.activeStories.length;
    const storyId     = s.activeStories[storyIdx];
    const story       = GameData.stories[storyId];

    if (!story) {
      // Nežinoma istorija — peršokti
      console.warn('Nežinoma istorija:', storyId);
      this._triggerEpilogue('Istorija nerasta.');
      return;
    }

    // Rasti sekantį bitą šioje istorijoje
    const visitedInStory = (s.storyProgress[storyId] || []);
    let nextBitId = 1; // Pradėti nuo bito 1

    if (visitedInStory.length > 0) {
      const lastBitId  = visitedInStory[visitedInStory.length - 1];
      const lastBit    = story.bits[lastBitId];
      // Imti pirmą pasirinkimo unlock (bus atnaujintas po pasirinkimo)
      nextBitId = (lastBit && lastBit.choices[0]) ? lastBit.choices[0].unlocks : 10;
    }

    // Jei bito nėra — naudoti 10 (finalinis)
    const bit = story.bits[nextBitId] || story.bits[10];
    if (!bit) { this._triggerEpilogue('Kelio pabaiga.'); return; }

    s.currentStoryId = storyId;
    s.currentBitId   = bit.id;
    this._renderBit(story, bit);
  },

  // =====================================================
  // BITO RODYMAS
  // =====================================================
  _renderBit(story, bit) {
    this.showScreen('bit');
    const s = this.session;

    // Skaitliukas viršuje
    const counter = document.getElementById('bit-counter');
    if (counter) counter.textContent =
      `${s.bitsVisited.length + 1} / ${s.bitLimit}  ·  ${story.name}`;

    // Žymos (story name)
    const tagsEl = document.getElementById('story-tags');
    if (tagsEl) tagsEl.innerHTML =
      `<span class="story-tag">${story.name.toUpperCase()}</span>`;

    // Vietovardis
    const locEl = document.getElementById('bit-location');
    if (locEl) locEl.textContent = `⌖ ${bit.location || ''}`;

    // Paslėpti pasirinkimus iš pradžių
    const choicesWrap = document.getElementById('choices-wrap');
    if (choicesWrap) choicesWrap.classList.add('hidden');

    // Scenos paveikslėlis
    Compositor.render(bit.imageTags || { background: 'street_narrow', atmosphere: 'night' });

    // Rašomosios mašinėlės efektas
    this._typeText('bit-text', bit.narrative || '', 28, () => {
      // Po teksto — laukti iki 10 sek. prieš rodant pasirinkimus
    });

    // Laikmaičio pradžia
    this._startReadingTimer(bit);
  },

  // =====================================================
  // 3 FAZIŲ LAIKMAITIS
  // 0–10 sek.: bot stebėjimas (pasirinkimai dar slepiami)
  // 10–60 sek.: skaitymo langas (pasirinkimai rodomi)
  // 60 sek.: automatinis pasirinkimas + baudimas
  // =====================================================
  _startReadingTimer(bit) {
    this._clearTimers();

    const TOTAL_MS    = 60000;
    const UNLOCK_MS   = 10000; // Pasirinkimų atrakinimas
    const startTime   = Date.now();

    // Atnaujinti laiko juostą kas 200ms
    this.timers.bar = setInterval(() => {
      const elapsed  = Date.now() - startTime;
      const pct      = Math.max(0, 100 - (elapsed / TOTAL_MS) * 100);
      const barEl    = document.getElementById('timer-bar');
      const labelEl  = document.getElementById('timer-phase-label');

      if (barEl) {
        barEl.style.width = pct + '%';
        // Spalvų signalai
        barEl.className = 'timer-bar' +
          (pct < 25 ? ' danger' : pct < 50 ? ' warn' : '');
      }

      if (elapsed < UNLOCK_MS) {
        if (labelEl) labelEl.textContent = `Skaitoma... (${Math.ceil((UNLOCK_MS - elapsed) / 1000)})`;
      } else {
        if (labelEl) labelEl.textContent = 'Pasirinkite...';
      }
    }, 200);

    // Po 10 sek. — parodyti pasirinkimus
    this.timers.unlock = setTimeout(() => {
      this._showChoices(bit);
    }, UNLOCK_MS);

    // Po 60 sek. — automatinis pasirinkimas
    this.timers.auto = setTimeout(() => {
      this._autoSelect(bit, startTime);
    }, TOTAL_MS);
  },

  // =====================================================
  // PASIRINKIMŲ RODYMAS
  // =====================================================
  _showChoices(bit) {
    const wrap = document.getElementById('choices-wrap');
    if (!wrap) return;

    const btns = wrap.querySelectorAll('.choice-btn');
    btns.forEach((btn, i) => {
      const choice = bit.choices[i];
      if (!choice) { btn.style.display = 'none'; return; }
      btn.style.display = 'block';

      // Pasirinkimo tekstas + atributų žymos
      btn.innerHTML = choice.text +
        `<span class="choice-attr">${choice.attributes.join(' · ')}</span>`;

      // Spalvinis žymėjimas: įgūdžių patikrinimas
      btn.className = 'choice-btn';
      if (choice.statCheck) btn.classList.add('skill-check');

      // Išsaugoti pasirinkimo indeksą
      btn.dataset.index = i;
    });

    wrap.classList.remove('hidden');
  },

  // =====================================================
  // PASIRINKIMAS PASPAUSTAS
  // =====================================================
  _onChoiceSelected(index) {
    const s   = this.session;
    const bit = GameData.stories[s.currentStoryId]?.bits[s.currentBitId];
    if (!bit || !bit.choices[index]) return;

    const choice    = bit.choices[index];
    const readMs    = Date.now() - (this._bitStartTime || Date.now());
    const isQuick   = readMs < 10000; // Greičiau nei 10 sek.

    // Bot detektoriaus žymė
    if (isQuick) {
      s.flagCount++;
      if (s.flagCount >= 3) s.suspicious = true;
    }

    // Įrašyti į žurnalą
    s.choiceLog.push({
      storyId:   s.currentStoryId,
      bitId:     bit.id,
      choiceIdx: index,
      attrs:     choice.attributes,
      readMs,
      wasSkill:  !!choice.statCheck,
      ts:        Date.now(),
    });

    // Atributų skaitiklis (archetipui)
    choice.attributes.forEach(a => {
      s.attrCount[a] = (s.attrCount[a] || 0) + 1;
    });

    // Sekančio bito ID (su įgūdžių patikra)
    let nextBitId = choice.unlocks;
    if (choice.statCheck) {
      const st = s.stats[choice.statCheck.stat];
      if (st >= choice.statCheck.threshold) {
        nextBitId = choice.statCheck.bonusUnlock;
        Audio8bit.sfx('unlock'); // Įgūdžių patikrinimas pavyko!
      }
    }

    // Žymėti bitą kaip aplankytą
    s.bitsVisited.push({ storyId: s.currentStoryId, bitId: bit.id, isFinale: bit.isFinale });
    if (!s.storyProgress[s.currentStoryId]) s.storyProgress[s.currentStoryId] = [];
    s.storyProgress[s.currentStoryId].push(bit.id);

    // Finalinis bitas — kill count
    if (bit.isFinale) {
      this._onStoryFinale(s.currentStoryId);
      this._triggerEpilogue('Istorija užbaigta!');
      return;
    }

    // Sustabdyti laikmaičius
    this._clearTimers();
    Audio8bit.sfx('select');

    // Išsaugoti nextBitId kelionės fazei
    this._nextBitId = nextBitId;
    this._travelPhase(readMs);
  },

  // =====================================================
  // AUTOMATINIS PASIRINKIMAS (bauda už pasyvumą)
  // =====================================================
  _autoSelect(bit, startTime) {
    this.session.passiveCount++;
    Audio8bit.sfx('penalty');
    // Automatiškai pasirinkti pirmą variantą (baudos kelias)
    this._onChoiceSelected(0);
  },

  // =====================================================
  // KELIONĖS FAZĖ (po pasirinkimo)
  // Trukmė: 1–5 sek., priklausomai nuo skaitymo laiko
  // =====================================================
  _travelPhase(readMs) {
    // Kelionės laiko formulė: readMs / 12, max 5 sek., min 1 sek.
    const travelMs = Math.min(5000, Math.max(1000, Math.round(readMs / 12)));

    this.showScreen('travel');
    Audio8bit.play('travel');

    // Atsitiktinė lore užuomina
    const loreEl = document.getElementById('travel-lore');
    if (loreEl) loreEl.textContent = GameData.randomLore();

    // Animuotas avataras
    Compositor.animateTravel('travel-canvas', travelMs);

    // Po kelionės — sekantis bitas
    this.timers.travel = setTimeout(() => {
      Audio8bit.play('gameplay');
      this._loadBitById(this.session.currentStoryId, this._nextBitId);
    }, travelMs);
  },

  // =====================================================
  // KONKRETAUS BITO ĮKĖLIMAS
  // =====================================================
  _loadBitById(storyId, bitId) {
    const story = GameData.stories[storyId];
    if (!story) { this._loadNextBit(); return; }
    const bit   = story.bits[bitId];
    if (!bit)   { this._loadNextBit(); return; }

    this.session.currentBitId = bitId;
    this._bitStartTime = Date.now();
    this._renderBit(story, bit);
  },

  // =====================================================
  // ISTORIJOS FINALAS (bitas 10 pasiektas)
  // =====================================================
  _onStoryFinale(storyId) {
    Audio8bit.sfx('complete');
    const story = GameData.stories[storyId];
    if (!story) return;

    story.killCount = (story.killCount || 0) + 1;

    // Jei 1000 kartų — žymėti išimčiai
    if (story.killCount >= 1000) {
      story.status = 'retired';
      story.retiredAt = Date.now();
      console.log(`Istorija "${story.name}" žymima išimčiai (1000 užbaigimų)`);
      // Siųsti signalą admin sistemai (jei yra backend)
      this._notifyAdmin({ type: 'retire', storyId, killCount: story.killCount });
    }

    // Taškų premija už finalą
    this.session.score += 500;
  },

  // =====================================================
  // ŽAIDIMO PABAIGA ANKSČIAU (baigti mygtukas)
  // =====================================================
  _endGameEarly() {
    Audio8bit.sfx('endgame');
    this._clearTimers();
    this._triggerEpilogue('Kelionė nutraukta.');
  },

  // =====================================================
  // EPILOGO EKRANAS
  // =====================================================
  _triggerEpilogue(reason) {
    this._clearTimers();
    const s = this.session;

    // Skaičiuoti galutinį tašką
    s.score += s.bitsVisited.length * 10;
    s.score += s.choiceLog.filter(c => c.wasSkill).length * 100;
    s.score  = Math.max(0, s.score - s.passiveCount * 20);

    // Siųsti duomenis admin sistemai
    this._sendPlayData(s);

    Audio8bit.play('epilogue');
    this.showScreen('epilogue');

    // Piešti avataorą epiloge
    this._drawAvatar('epilogue-avatar', s.stats);

    // Statistikų tinklelis
    const storyNames = {};
    s.bitsVisited.forEach(v => {
      const st = GameData.stories[v.storyId];
      if (!storyNames[v.storyId]) storyNames[v.storyId] = { name: st?.name || '?', count: 0, finales: 0 };
      storyNames[v.storyId].count++;
      if (v.isFinale) storyNames[v.storyId].finales++;
    });

    const statsEl = document.getElementById('epilogue-stats');
    if (statsEl) {
      let html = `
        <div class="stat-item"><span class="stat-label">BITAI</span><span class="stat-value">${s.bitsVisited.length}</span></div>
        <div class="stat-item"><span class="stat-label">LAIKAS</span><span class="stat-value">${Math.round((Date.now() - s.startTime) / 60000)} min.</span></div>
        <div class="stat-item"><span class="stat-label">ARCHETIPAS</span><span class="stat-value">${this._getArchetype(s.attrCount)}</span></div>
        <div class="stat-item"><span class="stat-label">GREITI PASPAUDIMAI</span><span class="stat-value">${s.flagCount} ${s.suspicious ? '⚠' : ''}</span></div>
      `;
      Object.values(storyNames).forEach(st => {
        html += `<div class="stat-item"><span class="stat-label">${st.name.toUpperCase()}</span><span class="stat-value">${st.count} bitai${st.finales ? ' ✓' : ''}</span></div>`;
      });
      statsEl.innerHTML = html;
    }

    // Narratyvinis epilogas
    const textEl = document.getElementById('epilogue-text');
    if (textEl) textEl.textContent = this._buildEpilogueText(s, reason, storyNames);

    // Galutinis taškas
    const scoreEl = document.getElementById('final-score');
    if (scoreEl) scoreEl.textContent = `${s.score} taškų`;
  },

  // =====================================================
  // ARCHETIPO NUSTATYMAS
  // =====================================================
  _getArchetype(attrCount) {
    if (!attrCount || Object.keys(attrCount).length === 0) return 'Keliautojas';
    const sorted = Object.entries(attrCount).sort((a,b) => b[1]-a[1]);
    const top1   = sorted[0]?.[0];
    const top2   = sorted[1]?.[0];
    const key    = `${top1}_${top2}`;
    return GameData.ARCHETYPES[key]
        || GameData.ARCHETYPES[`${top2}_${top1}`]
        || top1 ? `${GameData.ATTRIBUTES[top1]?.lt || top1}` : 'Keliautojas';
  },

  // =====================================================
  // EPILOGO TEKSTAS
  // =====================================================
  _buildEpilogueText(s, reason, storyNames) {
    const arch     = this._getArchetype(s.attrCount);
    const stories  = Object.values(storyNames);
    const finished = stories.filter(st => st.finales > 0);
    const parts    = [];

    parts.push(`${arch}. Toks tavo kelias šiandien.`);

    if (stories.length > 0) {
      const list = stories.map(st => `${st.count} žingsniai "${st.name}"`).join(', ');
      parts.push(`Tu keliavai per: ${list}.`);
    }

    if (finished.length > 0) {
      parts.push(`Užbaigei: ${finished.map(st => `"${st.name}"`).join(', ')}. Miestas tai atsimins.`);
    } else {
      parts.push('Pabaigos šį kartą neradai. Bet Vilnius vis dar laukia.');
    }

    if (s.suspicious) {
      parts.push('(Tavo žingsniai buvo neįprastai greiti.)');
    }

    return parts.join(' ');
  },

  // =====================================================
  // DUOMENŲ SIUNTIMAS ADMIN SISTEMAI
  // =====================================================
  async _sendPlayData(s) {
    const payload = {
      sessionId:    `${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
      code:         s.code,
      score:        s.score,
      bitCount:     s.bitsVisited.length,
      choiceLog:    s.choiceLog,
      attrCount:    s.attrCount,
      flagCount:    s.flagCount,
      suspicious:   !!s.suspicious,
      passiveCount: s.passiveCount,
      durationMs:   Date.now() - s.startTime,
      storyProgress:s.storyProgress,
      ts:           new Date().toISOString(),
    };

    // Saugoti lokaliai (visada veikia be backend)
    try {
      const existing = JSON.parse(localStorage.getItem('sessions') || '[]');
      existing.push(payload);
      // Max 100 sesijų localStorage
      if (existing.length > 100) existing.shift();
      localStorage.setItem('sessions', JSON.stringify(existing));
    } catch(e) {}

    // Bandyti siųsti į backend (jei egzistuoja)
    try {
      await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch(e) {
      // Backend nepasiekiamas — duomenys jau saugomi localStorage
    }
  },

  // =====================================================
  // ADMIN PRANEŠIMAS (istorijos išėmimui ir kt.)
  // =====================================================
  async _notifyAdmin(data) {
    try {
      await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } catch(e) {}
  },

  // =====================================================
  // LAIKO NUVALIMAS
  // =====================================================
  _clearTimers() {
    Object.values(this.timers).forEach(t => {
      clearInterval(t); clearTimeout(t);
    });
    this.timers = {};
  },

  // =====================================================
  // TITULINIO FONO ANIMACIJA
  // =====================================================
  _animateTitleBg() {
    const canvas = document.getElementById('title-bg-canvas');
    if (!canvas) return;
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    let t = 0;

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // Judantis gradientas (lėtas, atmosferiškas)
      const cx  = W / 2 + Math.sin(t * 0.002) * W * 0.2;
      const cy  = H / 2 + Math.cos(t * 0.0015) * H * 0.15;
      const rad = Math.max(W, H) * 0.75;
      const g   = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
      g.addColorStop(0,   'rgba(30,20,60,0.9)');
      g.addColorStop(0.5, 'rgba(15,10,30,0.8)');
      g.addColorStop(1,   'rgba(5,5,15,0.95)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      // Mirgančios žvaigždės
      for (let i = 0; i < 60; i++) {
        const sx = ((i * 137.5 + t * 0.02) % W);
        const sy = ((i * 97.3)  % (H * 0.7));
        const a  = 0.2 + Math.abs(Math.sin(t * 0.001 + i)) * 0.6;
        ctx.beginPath();
        ctx.arc(sx, sy, 1, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,245,220,${a})`;
        ctx.fill();
      }
      t++;
      requestAnimationFrame(draw);
    };
    draw();
  },

  // =====================================================
  // RAŠOMOSIOS MAŠINĖLĖS EFEKTAS
  // =====================================================
  _typeText(elementId, text, msPerChar, onDone) {
    const el = document.getElementById(elementId);
    if (!el) { if (onDone) onDone(); return; }
    el.innerHTML = '';
    let i = 0;

    const cursor = document.createElement('span');
    cursor.className = 'cursor';
    el.appendChild(cursor);

    const interval = setInterval(() => {
      if (i >= text.length) {
        clearInterval(interval);
        cursor.remove();
        if (onDone) onDone();
        return;
      }
      // Įterpti prieš kursorių
      el.insertBefore(document.createTextNode(text[i]), cursor);
      i++;
    }, msPerChar);
  },

  // =====================================================
  // NUSTATYMŲ PRITAIKYMAS
  // =====================================================
  _applySettings() {
    const fs = localStorage.getItem('fontSize') || 'medium';
    document.body.classList.add(`font-${fs}`);

    // Sinchronizuoti mygtukus
    document.querySelectorAll('.size-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.size === fs);
    });

    const musicBtn = document.getElementById('toggle-music');
    if (musicBtn) {
      musicBtn.textContent = Audio8bit.musicOn ? 'ĮJUNGTA' : 'IŠJUNGTA';
      musicBtn.dataset.active = Audio8bit.musicOn;
    }
    const sfxBtn = document.getElementById('toggle-sfx');
    if (sfxBtn) {
      sfxBtn.textContent = Audio8bit.sfxOn ? 'ĮJUNGTI' : 'IŠJUNGTI';
      sfxBtn.dataset.active = Audio8bit.sfxOn;
    }
  },

  // Dabartinė muzikos tema pagal aktyvų ekraną
  _currentTheme() {
    const active = document.querySelector('.screen.active');
    if (!active) return 'title';
    const id = active.id;
    if (id === 'screen-bit')      return 'gameplay';
    if (id === 'screen-travel')   return 'travel';
    if (id === 'screen-epilogue') return 'epilogue';
    return 'title';
  },

  // Rodyti / slėpti perdangas
  _showOverlay(id) { const el = document.getElementById(id); if (el) el.classList.remove('hidden'); },
  _hideOverlay(id) { const el = document.getElementById(id); if (el) el.classList.add('hidden'); },
};

// =====================================================
// PALEIDIMAS
// Žaidimas inicializuojamas kai DOM paruoštas
// =====================================================
document.addEventListener('DOMContentLoaded', () => {
  // Pirmasis klik — leidžia Web Audio veikti
  document.addEventListener('click', () => Audio8bit.init(), { once: true });
  Game.init();
});
