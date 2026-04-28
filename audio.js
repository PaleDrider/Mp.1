// =========================================================
// audio.js — 8 Bitų Muzikos Variklis
// Naudoja Web Audio API — jokių išorinių failų nereikia
// Procedūriškai generuoja čiptjūno stilių
// =========================================================

class ChiptuneEngine {
  constructor() {
    // Web Audio kontekstas — inicializuojamas tik po pirmo klik
    this.ctx = null;
    // Pagrindinis garsumo valdiklis
    this.masterGain = null;
    // Ar šiuo metu groja muzika
    this.isPlaying = false;
    // Šiuo metu grojama tema (objektas)
    this.currentTheme = null;
    // Šiuo metu grojamos temos pavadinimas
    this.currentThemeName = null;
    // Timeout ID sekveoseriui
    this.seqTimeout = null;
    // Sekveoserio pozicija
    this.step = 0;

    // Nustatymai — saugomi localStorage
    this.musicOn = localStorage.getItem('musicEnabled') !== 'false';
    this.sfxOn   = localStorage.getItem('sfxEnabled')   !== 'false';

    // Natos pagal dažnį (Hz)
    // _ = pauzė
    this.N = {
      _:  0,
      C3:130.81, D3:146.83, E3:164.81, F3:174.61, G3:196.00, A3:220.00, B3:246.94,
      C4:261.63, D4:293.66, E4:329.63, F4:349.23, G4:392.00, A4:440.00, B4:493.88,
      C5:523.25, D5:587.33, E5:659.25, G5:783.99, A5:880.00,
    };

    // =====================================================
    // TEMOS — melodija + bosas, BPM, bangos forma
    // Kiekvienas įrašas yra natos kodas (16-osios natos)
    // _ = pauzė
    // =====================================================
    this.themes = {

      // Titulinio ekrano muzika — paslaptinga, tamsoka, lėta
      title: {
        bpm: 76,
        waveform: 'triangle',
        melody: [
          'C4','_','E4','_','G4','A4','G4','_',
          'E4','_','D4','_','C4','_','_','_',
          'F4','_','A4','_','C5','_','B4','_',
          'A4','_','G4','_','F4','E4','_','_',
        ],
        bass: [
          'C3','_','C3','_','G3','_','G3','_',
          'F3','_','F3','_','C3','_','_','_',
          'F3','_','F3','_','C3','_','C3','_',
          'G3','_','G3','_','F3','_','_','_',
        ],
      },

      // Žaidimo muzika — įtempta, nuotykinga, greita
      gameplay: {
        bpm: 148,
        waveform: 'square',
        melody: [
          'G4','G4','_','A4','G4','_','E4','_',
          'G4','G4','_','D5','_','C5','_','_',
          'G4','G4','_','A4','G4','_','D5','_',
          'C5','_','_','_','G3','_','_','_',
        ],
        bass: [
          'G3','_','G3','_','C3','_','C3','_',
          'D3','_','D3','_','G3','_','_','_',
          'G3','_','G3','_','C3','_','C3','_',
          'D3','_','D3','_','G3','_','_','_',
        ],
      },

      // Kelionės muzika — rami, meditacinė, lėta
      travel: {
        bpm: 68,
        waveform: 'triangle',
        melody: [
          'C4','_','_','E4','_','_','G4','_',
          'E4','_','D4','_','C4','_','_','_',
          'A3','_','_','C4','_','_','E4','_',
          'D4','_','C4','_','_','_','_','_',
        ],
        bass: [
          'C3','_','G3','_','C3','_','G3','_',
          'F3','_','G3','_','C3','_','_','_',
          'A2','_','E3','_','A2','_','E3','_',
          'F3','_','G3','_','C3','_','_','_',
        ],
      },

      // Epilogo muzika — reflektyvus, gilus, ramus
      epilogue: {
        bpm: 58,
        waveform: 'triangle',
        melody: [
          'E4','_','D4','_','C4','_','_','_',
          'D4','_','E4','_','E4','_','_','_',
          'D4','_','D4','_','E4','_','G4','_',
          'E4','_','D4','_','C4','_','_','_',
        ],
        bass: [
          'C3','_','G3','_','C3','_','_','_',
          'G3','_','G3','_','C3','_','_','_',
          'G3','_','G3','_','C3','_','C3','_',
          'G3','_','G3','_','C3','_','_','_',
        ],
      },
    };
  }

  // =====================================================
  // Inicializuoti Web Audio kontekstą
  // SVARBU: turi būti iškviesta po vartotojo sąveikos
  // (naršyklės politika draudžia garso be vartotojo veiksmo)
  // =====================================================
  init() {
    if (this.ctx) return; // Jau inicializuota
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.28; // Garso lygis
    this.masterGain.connect(this.ctx.destination);
  }

  // =====================================================
  // Paleisti temą pagal pavadinimą
  // themeName: 'title' | 'gameplay' | 'travel' | 'epilogue'
  // =====================================================
  play(themeName) {
    if (!this.musicOn) return;
    this.init();

    // Jei ta pati tema jau groja — netrikdyti
    if (this.currentThemeName === themeName && this.isPlaying) return;

    this.stop(); // Sustabdyti ankstesnę

    const theme = this.themes[themeName];
    if (!theme) { console.warn('Nežinoma tema:', themeName); return; }

    this.currentTheme = theme;
    this.currentThemeName = themeName;
    this.isPlaying = true;
    this.step = 0;
    this._tick();
  }

  // =====================================================
  // Sustabdyti muziką
  // =====================================================
  stop() {
    this.isPlaying = false;
    this.currentThemeName = null;
    if (this.seqTimeout) {
      clearTimeout(this.seqTimeout);
      this.seqTimeout = null;
    }
  }

  // =====================================================
  // Vidinis sekveoserio žingsnis
  // Kviečiamas rekursyviai per setTimeout
  // =====================================================
  _tick() {
    if (!this.isPlaying || !this.currentTheme) return;

    const theme = this.currentTheme;
    // Kiekvieno žingsnio trukmė pagal BPM (16-osios natos)
    const stepMs = (60 / theme.bpm / 4) * 1000;
    const noteDur = (stepMs * 0.82) / 1000; // Natos ilgumas sek.

    // Melodijos nata
    const mn = theme.melody[this.step % theme.melody.length];
    if (mn !== '_' && this.N[mn]) {
      this._playNote(this.N[mn], noteDur, theme.waveform, 0.38);
    }

    // Baso nata (octave down, minkštesnė bangos forma)
    const bn = theme.bass[this.step % theme.bass.length];
    if (bn !== '_' && this.N[bn]) {
      this._playNote(this.N[bn], noteDur,
        theme.waveform === 'square' ? 'triangle' : theme.waveform,
        0.22
      );
    }

    this.step++;
    // Ciklas — po pabaigos pradėti iš naujo
    if (this.step >= Math.max(theme.melody.length, theme.bass.length)) {
      this.step = 0;
    }

    this.seqTimeout = setTimeout(() => this._tick(), stepMs);
  }

  // =====================================================
  // Groti vieną natą naudojant Oscillator
  // freq: Hz, dur: sekundės, wave: bangos forma, vol: 0-1
  // =====================================================
  _playNote(freq, dur, wave = 'square', vol = 0.3) {
    if (!this.ctx || !this.masterGain || freq <= 0) return;
    try {
      const osc  = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now  = this.ctx.currentTime;

      osc.type = wave;
      osc.frequency.value = freq;

      // Garso vokas — glotnus įėjimas ir išėjimas
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(vol, now + 0.008);
      gain.gain.setValueAtTime(vol, now + dur - 0.015);
      gain.gain.linearRampToValueAtTime(0, now + dur);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + dur);
    } catch(e) {
      // Ignoruoti garso klaidas — žaidimas veikia be garso
    }
  }

  // =====================================================
  // GARSO EFEKTAI (SFX)
  // type: 'select' | 'navigate' | 'unlock' | 'penalty' | 'complete'
  // =====================================================
  sfx(type) {
    if (!this.sfxOn) return;
    this.init();

    const p = (f, d, w = 'square', v = 0.22) =>
      this._playNote(f, d, w, v);
    const delay = (fn, ms) => setTimeout(fn, ms);

    switch(type) {
      case 'select':    // Pasirinkimas paspaustas
        p(440, 0.06); delay(() => p(660, 0.1, 'square', 0.18), 60);
        break;
      case 'navigate':  // Meniu naršymas
        p(330, 0.05, 'square', 0.16);
        break;
      case 'unlock':    // Įgūdžių patikrinimas pavyko
        [523,659,784,1046].forEach((f,i) =>
          delay(() => p(f, 0.1, 'square', 0.2), i * 60));
        break;
      case 'penalty':   // Laikas baigėsi / baudimas
        [220,165].forEach((f,i) =>
          delay(() => p(f, 0.15, 'square', 0.25), i * 100));
        break;
      case 'complete':  // Istorija užbaigta
        [523,659,784,659,784,1046].forEach((f,i) =>
          delay(() => p(f, 0.12, 'triangle', 0.28), i * 80));
        break;
      case 'endgame':   // Žaidimas baigiasi
        [440,330,220].forEach((f,i) =>
          delay(() => p(f, 0.2, 'triangle', 0.2), i * 120));
        break;
    }
  }

  // =====================================================
  // Įjungti / išjungti muziką
  // Grąžina naują būseną (true = įjungta)
  // =====================================================
  toggleMusic() {
    this.musicOn = !this.musicOn;
    localStorage.setItem('musicEnabled', this.musicOn);
    if (!this.musicOn) this.stop();
    return this.musicOn;
  }

  // =====================================================
  // Įjungti / išjungti SFX
  // =====================================================
  toggleSFX() {
    this.sfxOn = !this.sfxOn;
    localStorage.setItem('sfxEnabled', this.sfxOn);
    return this.sfxOn;
  }
}

// Sukurti globalų garso objektą — naudojamas visame game.js
const Audio8bit = new ChiptuneEngine();
