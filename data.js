// =========================================================
// data.js — Žaidimo duomenys
// Atributų sąrašas, Vilniaus vietovardžiai, istorijų šablonai
// Šis failas yra "biblioteka" — čia saugomi visi turinio duomenys
// =========================================================

// =====================================================
// ATRIBUTŲ SĄRAŠAS (Attribute Pool)
// Kiekvienas pasirinkimas turi LYGIAI 2 atributus.
// AI generuodamas tekstą PRIVALO nurodyti 2 atributus
// iš šio sąrašo — ne daugiau, ne mažiau.
// Žaidėjo archetipas = 2 dažniausiai pasirenkami atributai.
// =====================================================
const ATTRIBUTES = {
  // --- Veiksmo grupė ---
  DRĄSA:        { lt: 'Drąsa',        en: 'Courage',      group: 'action',  color: '#c84040' },
  JĖGA:         { lt: 'Jėga',         en: 'Strength',     group: 'action',  color: '#a05020' },
  RYŽTAS:       { lt: 'Ryžtas',       en: 'Resolve',      group: 'action',  color: '#e07830' },

  // --- Proto grupė ---
  IŠMINTIS:     { lt: 'Išmintis',     en: 'Wisdom',       group: 'mind',    color: '#4878b0' },
  GUDRUMAS:     { lt: 'Gudrumas',     en: 'Cunning',      group: 'mind',    color: '#8040a0' },
  DĖMESYS:      { lt: 'Dėmesys',     en: 'Focus',        group: 'mind',    color: '#20a090' },

  // --- Socialinė grupė ---
  UŽUOJAUTA:    { lt: 'Užuojauta',   en: 'Compassion',   group: 'social',  color: '#d04080' },
  GARBĖ:        { lt: 'Garbė',       en: 'Honor',        group: 'social',  color: '#c8a830' },
  VILTIS:       { lt: 'Viltis',      en: 'Hope',         group: 'social',  color: '#70a8d8' },

  // --- Niūrioji grupė ---
  AMBICIJA:     { lt: 'Ambicija',    en: 'Ambition',     group: 'dark',    color: '#a03030' },
  BAIMĖ:        { lt: 'Baimė',       en: 'Fear',         group: 'dark',    color: '#304060' },
  ABEJINGUMAS:  { lt: 'Abejingumas', en: 'Indifference', group: 'dark',    color: '#606060' },
  GODUMAS:      { lt: 'Godumas',     en: 'Greed',        group: 'dark',    color: '#a09020' },

  // --- Mistinė grupė ---
  TIKĖJIMAS:    { lt: 'Tikėjimas',   en: 'Faith',        group: 'mystic',  color: '#d8c898' },
  INTUICIJA:    { lt: 'Intuicija',   en: 'Intuition',    group: 'mystic',  color: '#a080c0' },
  KANTRYBĖ:     { lt: 'Kantrybė',   en: 'Patience',     group: 'mystic',  color: '#60a8c0' },
};

// =====================================================
// ARCHETIPŲ SĄRAŠAS
// Žaidėjo pabaigos tekstas priklauso nuo dominuojančių atributų
// =====================================================
const ARCHETYPES = {
  DRĄSA_RYŽTAS:        'Lakūnas',
  IŠMINTIS_DĖMESYS:    'Tyrinėtojas',
  GUDRUMAS_AMBICIJA:   'Šešėlis',
  UŽUOJAUTA_VILTIS:    'Globėjas',
  GARBĖ_TIKĖJIMAS:     'Saugotojas',
  BAIMĖ_ABEJINGUMAS:   'Klajoklis',
  INTUICIJA_KANTRYBĖ:  'Regėtojas',
  // ... papildomi archetipai pridedami pagal poreikį
};

// =====================================================
// VILNIAUS VIETOVARDŽIAI
// Naudojami istorijų generavimui — PRIVALU paminėti
// bent vieną realią vietą kiekviename bite.
// bg = paveikslėlio failo pavadinimas (be .png)
// =====================================================
const VILNIUS_LOCATIONS = [
  { name: 'Gedimino prospektas',      bg: 'street_main',    atmo: ['night','dusk','crowd'],  type: 'street'   },
  { name: 'Pilies gatvė',             bg: 'street_narrow',  atmo: ['night','rain','fog'],     type: 'street'   },
  { name: 'Gedimino bokštas',         bg: 'tower',          atmo: ['dawn','fog','dusk'],      type: 'landmark' },
  { name: 'Bernardinų sodas',         bg: 'park',           atmo: ['dawn','fog','snow'],      type: 'park'     },
  { name: 'Neries krantinė',          bg: 'river_bank',     atmo: ['night','rain','dusk'],    type: 'water'    },
  { name: 'Lukiškių aikštė',          bg: 'square',         atmo: ['crowd','night','fog'],    type: 'square'   },
  { name: 'Užupis',                   bg: 'courtyard',      atmo: ['dawn','fog','night'],     type: 'district' },
  { name: 'Žaliasis tiltas',          bg: 'bridge',         atmo: ['night','rain','fog'],     type: 'bridge'   },
  { name: 'Katedros aikštė',          bg: 'cathedral_sq',   atmo: ['night','dawn','fog'],     type: 'square'   },
  { name: 'Šnipiškės',               bg: 'street_narrow',  atmo: ['night','rain','crowd'],   type: 'district' },
  { name: 'Pylimo gatvė',             bg: 'street_main',    atmo: ['dusk','crowd','rain'],    type: 'street'   },
  { name: 'Rotušės aikštė',           bg: 'square',         atmo: ['dawn','crowd','fog'],     type: 'square'   },
  { name: 'Subačiaus gatvė',          bg: 'street_narrow',  atmo: ['night','fog','rain'],     type: 'street'   },
  { name: 'Vilnelės upelis',          bg: 'river_bank',     atmo: ['dawn','fog','snow'],      type: 'water'    },
  { name: 'Senamiesčio kiemai',       bg: 'courtyard',      atmo: ['night','fog','dusk'],     type: 'district' },
  { name: 'Šv. Onos bažnyčia',        bg: 'cathedral_sq',   atmo: ['dawn','night','fog'],     type: 'landmark' },
  { name: 'Literatų gatvė',           bg: 'street_narrow',  atmo: ['dusk','rain','night'],    type: 'street'   },
  { name: 'Antakalnio rajonas',        bg: 'park',           atmo: ['dawn','snow','fog'],      type: 'district' },
  { name: 'Žirmūnų tiltas',           bg: 'bridge',         atmo: ['night','rain','dusk'],    type: 'bridge'   },
];

// =====================================================
// LORE UŽUOMINOS
// Rodomos kelionės fazės metu (1–5 sek.)
// Paslaptingos, be spoilerių, atmosferiškos
// =====================================================
const LORE_HINTS = [
  'Senos gatvės atsimena žingsnius, kurių šeimininkai jau seniai pamiršti.',
  'Miestas niekada nemiega — tik keičia balsą.',
  'Kiekvienas pasirinkimas meta šešėlį, kurio nematysi.',
  'Kažkas stebi pro senovinį langą. Ar tu pats stebėtojas?',
  'Akmuo žino daugiau nei žmogus, kuris jį padėjo.',
  'Tiltas — ir praeitis, ir ateitis tuo pačiu metu.',
  'Naktinis Vilnius yra visai kitas miestas nei dieninis.',
  'Istorija nesibaigia. Ji tik keičia formą.',
  'Vieną dieną ir tave prisimins kaip legendą.',
  'Pilies žiburiai niekada visiškai neužgęsta.',
  'Gatvės vardas saugo senesnį vardą po savimi.',
  'Upė neša žodžius, kurių niekas nebetaria.',
  'Senamiesčio aidas skamba kitaip po vidurnakčio.',
  'Kiekvieną naktį miestas permąsto savo atminimą.',
  'Koks tavo pėdsakas? Ar jis paskui tave lieka?',
  'Šešėlis — tai gyvenimas, kurio nepasirinkai.',
];

// =====================================================
// ISTORIJŲ MANIFESTAS
// Čia registruojamos aktyvios ir išėjusios istorijos.
// Failas: data/manifest.json (šis yra numatytasis,
// realiame žaidime skaitomas iš JSON failo)
// =====================================================
const STORIES_MANIFEST = {
  version: '1.0',
  lastUpdated: '2025-01-01',
  active: [1, 2],     // Aktyvios istorijos šiandien
  retired: [],        // Išėjusios (pasiekusios 1000 užbaigimų)
};

// =====================================================
// ISTORIJŲ STRUKTŪROS ŠABLONAS
// Kiekviena AI sugeneruota istorija turi atitikti
// šią struktūrą tiksliai. Admin.js ją tikrina.
//
// SVARBU: bits[10].isFinale = true PRIVALOMA
// Kai pasiekiama — killCount++ ir gali išimti istoriją
// =====================================================

const STORY_01 = {
  id: 1,
  name: 'Akmens pasaka',
  description: 'Senas akmuo Pilies gatvėje slepia miesto atmintį.',
  status: 'active',       // 'active' | 'retired'
  killCount: 0,           // Kiek kartų pasiektas bitas 10
  retiredAt: null,        // Timestamp kai išimta
  fastestBeat: null,      // Greičiausias užbaigimas (ms)

  // BITŲ MATRICAS (10 bitų, ne visi pasiekiami vienoje sesijoje)
  // Raktas = bito ID (1–10), reikšmė = bito objektas
  // Bito 10 pasiekimas = istorijos pabaiga (killCount++)
  bits: {

    1: {
      id: 1,
      title: 'Akmuo Pilies gatvėje',
      narrative: `Pilies gatvė šią naktį neįprastai tuščia. Grindinio akmenys blizga
po vakarykščio lietaus. Ties sena siena, kur gatvė lenkiasi link
Katedros aikštės, kažkas padėjo neįprastą akmenį — pernelyg lygiai
aptašytą, pernelyg taisyklingą, kad būtų atsitiktinis. Žibinto šviesa
krentą ant jo kaip rodo pirštą. Tu sustoji.`,
      location: 'Pilies gatvė',
      // imageTags: compositor.js naudoja šiuos raktažodžius
      // background = img/bg/<vardas>.png
      // atmosphere = img/atmo/<vardas>.png
      imageTags: { background: 'street_narrow', atmosphere: 'night' },
      loreHint: LORE_HINTS[0],
      isFinale: false,

      choices: [
        {
          text: 'Paimti akmenį į rankas',
          // PRIVALU: lygiai 2 atributai iš ATTRIBUTES sąrašo
          attributes: ['DRĄSA', 'AMBICIJA'],
          unlocks: 3,       // Sekantis bito ID šioje istorijoje
          statCheck: null   // Nėra statistikos patikrinimo
        },
        {
          text: 'Apeiti ir eiti toliau',
          attributes: ['ABEJINGUMAS', 'KANTRYBĖ'],
          unlocks: 2,
          statCheck: null
        },
        {
          text: 'Atsiklaupti ir apžiūrėti iš arti',
          attributes: ['DĖMESYS', 'IŠMINTIS'],
          unlocks: 4,
          statCheck: null
        },
        {
          text: 'Paklausti einančio pro šalį senelio',
          attributes: ['UŽUOJAUTA', 'GUDRUMAS'],
          unlocks: 5,
          // Statistikos patikrinimas (Skill Check):
          // Jei žaidėjo 'wit' >= 7, gauna bonusUnlock vietoje unlocks
          statCheck: { stat: 'wit', threshold: 7, bonusUnlock: 8 }
        }
      ]
    },

    2: {
      id: 2,
      title: 'Katedros aikštė naktį',
      narrative: `Tu eini toliau. Bet paskui atsigręži. Akmuo vis dar ten,
žibinto apšviestas. Katedros aikštė atsiveria prieš tave — tuščia,
tik bažnyčios bokštai kerta naktinį dangų. Kažkur toli šuo suloja.
Tavo žingsniai aidi tarp senų akmenų.`,
      location: 'Katedros aikštė',
      imageTags: { background: 'cathedral_sq', atmosphere: 'night' },
      loreHint: LORE_HINTS[6],
      isFinale: false,
      choices: [
        { text: 'Grįžti prie akmens',              attributes: ['INTUICIJA','DRĄSA'],      unlocks: 3, statCheck: null },
        { text: 'Atsisėsti ant laiptų ir klausytis', attributes: ['KANTRYBĖ','TIKĖJIMAS'],   unlocks: 6, statCheck: null },
        { text: 'Eiti link Gedimino bokšto',        attributes: ['AMBICIJA','RYŽTAS'],      unlocks: 7, statCheck: null },
        { text: 'Rašyti savo vardą ant šaligatvio', attributes: ['VILTIS','GUDRUMAS'],      unlocks: 4, statCheck: null }
      ]
    },

    3: {
      id: 3,
      title: 'Akmuo rankose',
      narrative: `Akmuo šaltas ir sunkus. Ant jo apačios — įrėžti ženklai,
per seni, kad būtų lietuviškas raidynas. Galbūt rūnos. Galbūt tik
įbrėžimai. Tavo pirštai seka juos kaip raidžių kontūrus,
nors proto balsas sako, kad tai tik fantazija.`,
      location: 'Pilies gatvė',
      imageTags: { background: 'street_narrow', atmosphere: 'night' },
      loreHint: LORE_HINTS[4],
      isFinale: false,
      choices: [
        { text: 'Nešti akmenį su savimi',      attributes: ['AMBICIJA','RYŽTAS'],    unlocks: 7,  statCheck: null },
        { text: 'Padėti atgal tiksliai kaip buvo', attributes: ['GARBĖ','KANTRYBĖ'],    unlocks: 6,  statCheck: null },
        { text: 'Bandyti iššifruoti ženklus',  attributes: ['IŠMINTIS','DĖMESYS'],   unlocks: 8,  statCheck: { stat: 'wit', threshold: 6, bonusUnlock: 9 } },
        { text: 'Mesti akmenį į tamsą',        attributes: ['BAIMĖ','ABEJINGUMAS'],  unlocks: 5,  statCheck: null }
      ]
    },

    // ... bitai 4–9 generuojami AI pagal tą patį šabloną ...
    // Patogumo dėlei čia vietoj tų bitų naudokime užpildą:
    4: {
      id: 4, title: '[AI generuojamas]', isFinale: false,
      narrative: '[Šis bitas bus sugeneruotas AI. Žr. prompts/local_story.md]',
      location: 'Senamiestis', imageTags: { background: 'courtyard', atmosphere: 'fog' },
      loreHint: LORE_HINTS[3], choices: [
        { text: 'Pasirinkimas A', attributes: ['DRĄSA','VILTIS'],     unlocks: 7, statCheck: null },
        { text: 'Pasirinkimas B', attributes: ['IŠMINTIS','KANTRYBĖ'],unlocks: 8, statCheck: null },
        { text: 'Pasirinkimas C', attributes: ['GUDRUMAS','BAIMĖ'],   unlocks: 6, statCheck: null },
        { text: 'Pasirinkimas D', attributes: ['GARBĖ','RYŽTAS'],     unlocks: 9, statCheck: null }
      ]
    },
    5: {
      id: 5, title: '[AI generuojamas]', isFinale: false,
      narrative: '[Šis bitas bus sugeneruotas AI.]',
      location: 'Užupis', imageTags: { background: 'courtyard', atmosphere: 'dawn' },
      loreHint: LORE_HINTS[7], choices: [
        { text: 'Pasirinkimas A', attributes: ['DRĄSA','AMBICIJA'],   unlocks: 8,  statCheck: null },
        { text: 'Pasirinkimas B', attributes: ['UŽUOJAUTA','VILTIS'], unlocks: 9,  statCheck: null },
        { text: 'Pasirinkimas C', attributes: ['BAIMĖ','ABEJINGUMAS'],unlocks: 6,  statCheck: null },
        { text: 'Pasirinkimas D', attributes: ['TIKĖJIMAS','GARBĖ'],  unlocks: 10, statCheck: { stat: 'luck', threshold: 8, bonusUnlock: 10 } }
      ]
    },
    6: {
      id: 6, title: '[AI generuojamas]', isFinale: false,
      narrative: '[Šis bitas bus sugeneruotas AI.]',
      location: 'Neries krantinė', imageTags: { background: 'river_bank', atmosphere: 'night' },
      loreHint: LORE_HINTS[11], choices: [
        { text: 'Pasirinkimas A', attributes: ['RYŽTAS','DRĄSA'],     unlocks: 9,  statCheck: null },
        { text: 'Pasirinkimas B', attributes: ['KANTRYBĖ','VILTIS'],  unlocks: 8,  statCheck: null },
        { text: 'Pasirinkimas C', attributes: ['GUDRUMAS','AMBICIJA'],unlocks: 10, statCheck: null },
        { text: 'Pasirinkimas D', attributes: ['BAIMĖ','ABEJINGUMAS'],unlocks: 7,  statCheck: null }
      ]
    },
    7: {
      id: 7, title: '[AI generuojamas]', isFinale: false,
      narrative: '[Šis bitas bus sugeneruotas AI.]',
      location: 'Gedimino prospektas', imageTags: { background: 'street_main', atmosphere: 'dusk' },
      loreHint: LORE_HINTS[2], choices: [
        { text: 'Pasirinkimas A', attributes: ['IŠMINTIS','DĖMESYS'],  unlocks: 10, statCheck: null },
        { text: 'Pasirinkimas B', attributes: ['AMBICIJA','RYŽTAS'],   unlocks: 9,  statCheck: null },
        { text: 'Pasirinkimas C', attributes: ['UŽUOJAUTA','TIKĖJIMAS'],unlocks: 8, statCheck: null },
        { text: 'Pasirinkimas D', attributes: ['GODUMAS','GUDRUMAS'],  unlocks: 6,  statCheck: null }
      ]
    },
    8: {
      id: 8, title: '[AI generuojamas]', isFinale: false,
      narrative: '[Šis bitas bus sugeneruotas AI.]',
      location: 'Žaliasis tiltas', imageTags: { background: 'bridge', atmosphere: 'night' },
      loreHint: LORE_HINTS[5], choices: [
        { text: 'Pasirinkimas A', attributes: ['TIKĖJIMAS','VILTIS'],  unlocks: 10, statCheck: null },
        { text: 'Pasirinkimas B', attributes: ['BAIMĖ','RYŽTAS'],     unlocks: 9,  statCheck: null },
        { text: 'Pasirinkimas C', attributes: ['GUDRUMAS','DĖMESYS'], unlocks: 7,  statCheck: null },
        { text: 'Pasirinkimas D', attributes: ['GARBĖ','DRĄSA'],      unlocks: 10, statCheck: { stat: 'might', threshold: 7, bonusUnlock: 10 } }
      ]
    },
    9: {
      id: 9, title: '[AI generuojamas]', isFinale: false,
      narrative: '[Šis bitas bus sugeneruotas AI.]',
      location: 'Bernardinų sodas', imageTags: { background: 'park', atmosphere: 'dawn' },
      loreHint: LORE_HINTS[14], choices: [
        { text: 'Pasirinkimas A', attributes: ['KANTRYBĖ','TIKĖJIMAS'],unlocks: 10, statCheck: null },
        { text: 'Pasirinkimas B', attributes: ['VILTIS','DRĄSA'],     unlocks: 10, statCheck: null },
        { text: 'Pasirinkimas C', attributes: ['ABEJINGUMAS','BAIMĖ'],unlocks: 6,  statCheck: null },
        { text: 'Pasirinkimas D', attributes: ['INTUICIJA','GARBĖ'],  unlocks: 10, statCheck: null }
      ]
    },

    // ---- BITAS 10: FINALINIS (PRIVALOMAS) ----
    // Pasiekimas = istorijos užbaigimas = killCount++
    10: {
      id: 10,
      title: 'Akmens paslaptis',
      narrative: `Supranti. Tas akmuo buvo ženklas — ne tau, bet per tave.
Vilnius turi savo atmintį, savo kalbą, kurios nereikia mokytis —
ją reikia pajusti. Ir tu, nors trumpam, ją pajutai.
Pilies gatvė vėl tuščia. Bet ji kitokia. Tu kitoks.`,
      location: 'Pilies gatvė',
      imageTags: { background: 'street_narrow', atmosphere: 'dawn' },
      loreHint: LORE_HINTS[8],
      isFinale: true,   // ← PRIVALOMA. Padidina killCount
      choices: []       // ← Pabaigos bitui nėra pasirinkimų
    }
  }
};

// =====================================================
// ANTROJI ISTORIJA (šablonas — AI ją užpildo)
// =====================================================
const STORY_02 = {
  id: 2,
  name: 'Medžio pasaka',
  description: 'Senas ąžuolas Bernardinų sode slepia miesto paslaptis.',
  status: 'active',
  killCount: 0,
  retiredAt: null,
  fastestBeat: null,
  bits: {
    1: {
      id: 1, title: 'Ąžuolas sode', isFinale: false,
      narrative: `Bernardinų sodas naktį atrodo visiškai kitaip. Senas ąžuolas
prie pat upės kranto — didžiulis, jo žievė pilna įrėžimų ir randų.
Ant vienos šakos pakabintas senas laiškas. Jis šlamša vėjyje.`,
      location: 'Bernardinų sodas',
      imageTags: { background: 'park', atmosphere: 'night' },
      loreHint: LORE_HINTS[1],
      choices: [
        { text: 'Paimti laišką',             attributes: ['DRĄSA','GUDRUMAS'],     unlocks: 3,  statCheck: null },
        { text: 'Stebėti iš tolo',           attributes: ['BAIMĖ','DĖMESYS'],     unlocks: 2,  statCheck: null },
        { text: 'Liesti medžio žievę',       attributes: ['INTUICIJA','TIKĖJIMAS'],unlocks: 4,  statCheck: null },
        { text: 'Skaityti laišką vietoje',   attributes: ['IŠMINTIS','KANTRYBĖ'], unlocks: 5,  statCheck: { stat: 'wit', threshold: 7, bonusUnlock: 8 } }
      ]
    },
    // ... likusius bitus generuoja AI ...
    10: {
      id: 10, title: 'Medžio žinia', isFinale: true,
      narrative: `Laiškas buvo skirtas tau. Ne vardas, ne data — tiesiog žodžiai,
kurie tiko tobulai. Medis žinojo. Galbūt visada žinojo.
Vilnelės čiurlenimas prisiartina. Miestas kvėpuoja.`,
      location: 'Bernardinų sodas',
      imageTags: { background: 'park', atmosphere: 'dawn' },
      loreHint: LORE_HINTS[9],
      choices: []
    }
  }
};

// =====================================================
// Eksportuoti viską į globalų GameData objektą
// game.js ir kiti failai naudoja window.GameData
// =====================================================
window.GameData = {
  ATTRIBUTES,
  ARCHETYPES,
  VILNIUS_LOCATIONS,
  LORE_HINTS,
  STORIES_MANIFEST,
  stories: {
    1: STORY_01,
    2: STORY_02,
  },

  // Pagalbinė funkcija gauti vietovę pagal pavadinimą
  getLocation(name) {
    return this.VILNIUS_LOCATIONS.find(l => l.name === name) || this.VILNIUS_LOCATIONS[0];
  },

  // Pagalbinė funkcija atsitiktinei lore užuominai
  randomLore() {
    return this.LORE_HINTS[Math.floor(Math.random() * this.LORE_HINTS.length)];
  },
};
