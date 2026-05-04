window.STORIES[2] = {
  id: 2,
  name: 'Medžio Pasaka',
  description: 'Senas ąžuolas sode saugo miesto paslaptis.',
  status: 'active',
  killCount: 0,
  retiredAt: null,
  fastestBeat: null,

  bits: {
    1: {
      id: 1, isFinale: false,
      title: 'Sode',
      narrative: `Sodas naktį atrodo kaip visai kitas pasaulis. Senas ąžuolas prie pat Vilnelės upelės kranto — didžiulis, jo žievė pilna įrėžimų ir randų kaip senas veidas. Ant vienos žemos šakos pakabintas laiškas — eilutėmis surištas su virvele, šiek tiek drėgnas, bet dar nesuplyšęs. Jis šlamša vėjyje kaip kvietimas. Upelė čiurlena apačioje. Tu esi vienintelis žmogus sode.`,
      location: 'Bernardinų sodas',
      imageTags: { background: 'park', atmosphere: 'night' },
      choices: [
        { text: 'Paimti laišką nuo šakos', attributes: ['DRĄSA','GUDRUMAS'], unlocks: 3, statCheck: null },
        { text: 'Stebėti iš saugaus atstumo', attributes: ['BAIMĖ','DĖMESYS'], unlocks: 2, statCheck: null },
        { text: 'Liesti medžio žievę rankomis', attributes: ['INTUICIJA','TIKĖJIMAS'], unlocks: 4, statCheck: null },
        { text: 'Skaityti laišką neimant jo nuo šakos', attributes: ['IŠMINTIS','KANTRYBĖ'], unlocks: 5,
          statCheck: { stat:'wit', threshold:7, bonusUnlock:8, successText:'Iš toli matai parašytą žodį — tai ne laiškas, tai žemėlapis.', failText:'Per tamsu skaityti iš tolo.' } }
      ]
    },
    2: {
      id: 2, isFinale: false,
      title: 'Stebėjimas iš tolo',
      narrative: `Tu sustoji už kelių žingsnių. Laiškas siūbuoja vėjyje ir tu nenorai jo tiesti. Galbūt tai kažkieno asmeniška — pakabintas čia ne tau. Vilnelės upelis čiurlena, lyg patvirtindamas tavo dvejonę. Pro sodą praeina pora jaunų žmonių — jie nesustoja, nepastebi laiško, eina toliau kalbėdamiesi. Tu esi vienintelis matantis. Tai kažką reiškia — arba nieko nereiškia. Neaišku.`,
      location: 'Bernardinų sodas',
      imageTags: { background: 'park', atmosphere: 'night' },
      choices: [
        { text: 'Nuspręsti paimti laišką', attributes: ['RYŽTAS','DRĄSA'], unlocks: 3, statCheck: null },
        { text: 'Palikti viską kaip yra ir eiti', attributes: ['ABEJINGUMAS','KANTRYBĖ'], unlocks: 6, statCheck: null },
        { text: 'Sėdėti ant suoliuko ir laukti', attributes: ['KANTRYBĖ','TIKĖJIMAS'], unlocks: 7, statCheck: null },
        { text: 'Ieškoti kas pakabino', attributes: ['GUDRUMAS','DĖMESYS'], unlocks: 4, statCheck: null }
      ]
    },
    3: {
      id: 3, isFinale: false,
      title: 'Laiškas rankose',
      narrative: `Laiškas šiek tiek drėgnas, bet popierius storas ir tvirtas — ne šiuolaikinis. Rašysena ant viršelio — graži, traukta su plunksna arba labai geru rašikliu, nelygu kaip senų laikų mokykloje. Viduje — du sakiniai lietuviškai. Tu perskaitai juos du kartus, tris kartus. Sakiniai nepaaiškina nieko, bet kartu su ąžuolu, su naktimi, su Vilnele — jie skamba kaip kažkieno labai svarbus prašymas.`,
      location: 'Bernardinų sodas',
      imageTags: { background: 'park', atmosphere: 'fog' },
      choices: [
        { text: 'Vykdyti tai kas parašyta', attributes: ['TIKĖJIMAS','GARBĖ'], unlocks: 7, statCheck: null },
        { text: 'Ieškoti kas parašė', attributes: ['DRĄSA','GUDRUMAS'], unlocks: 5, statCheck: null },
        { text: 'Pakabinti laišką atgal', attributes: ['KANTRYBĖ','ABEJINGUMAS'], unlocks: 6, statCheck: null },
        { text: 'Iššifruoti paslėptą prasmę', attributes: ['IŠMINTIS','DĖMESYS'], unlocks: 8,
          statCheck: { stat:'wit', threshold:6, bonusUnlock:9, successText:'Tarp eilučių matai kryptį — Rotušės aikštė, tretias suoliukas nuo fontano.', failText:'Sakiniai lieka sakiniais. Jokios paslėptos prasmės.' } }
      ]
    },
    4: {
      id: 4, isFinale: false,
      title: 'Medžio žievė',
      narrative: `Žievė po pirštais šiurkšti ir šilta — neįtikėtinai šilta tokiai vėsiai nakčiai. Ąžuolas senas, jo vidinis laikrodis matuoja laiką visai kitais vienetais nei tavo. Tarp įrėžimų randi ne tik atsitiktinius randus — yra ir sąmoningai išpjautų ženklų. Inicialai, datos, eilutės. Kažkas čia palikdavo žodžius medžiui kaip laiškai į dėžutę. Vilnelė čiurlena žemiau. Tu supranti, kad šis ąžuolas yra miesto archyvas.`,
      location: 'Vilnelės upelis',
      imageTags: { background: 'park', atmosphere: 'dawn' },
      choices: [
        { text: 'Skaityti visus įrėžimus kruopščiai', attributes: ['DĖMESYS','IŠMINTIS'], unlocks: 8, statCheck: null },
        { text: 'Įrėžti ir savo inicialus', attributes: ['AMBICIJA','VILTIS'], unlocks: 7, statCheck: null },
        { text: 'Fotografuoti ženklus', attributes: ['GUDRUMAS','RYŽTAS'], unlocks: 5, statCheck: null },
        { text: 'Tiesiog stovėti ir jausti', attributes: ['TIKĖJIMAS','INTUICIJA'], unlocks: 9, statCheck: null }
      ]
    },
    5: {
      id: 5, isFinale: false,
      title: 'Ieškant rašančiojo',
      narrative: `Kas pakabino laišką? Šis klausimas veda tave pro Bažnyčios raudoną plytų sieną, pro uždaras parduotuves, pro keletą vėlyvų pėsčiųjų. Niekas neatrodo kaip žmogus kuris kabo laiškus ant ąžuolų vidurnaktį. O gal kaip tik atrodo — niekas neatrodo kaip šis žmogus, nes toks žmogus atrodo labai normaliai. Tu nusprendžiate, kad ieškoti be žinojimo ką ieškai yra kaip vaikščioti užmerktomis akimis.`,
      location: 'Šv. Onos bažnyčia',
      imageTags: { background: 'cathedral_sq', atmosphere: 'night' },
      choices: [
        { text: 'Grįžti prie ąžuolo', attributes: ['INTUICIJA','KANTRYBĖ'], unlocks: 4, statCheck: null },
        { text: 'Paskelbti žinutę socialiniuose tinkluose', attributes: ['GUDRUMAS','AMBICIJA'], unlocks: 7, statCheck: null },
        { text: 'Pasilikti prie bažnyčios ir stebėti', attributes: ['DĖMESYS','BAIMĖ'], unlocks: 8, statCheck: null },
        { text: 'Eiti į naktinę kavinę pasitarti', attributes: ['UŽUOJAUTA','VILTIS'], unlocks: 6, statCheck: null }
      ]
    },
    6: {
      id: 6, isFinale: false,
      title: 'Aikštė naktį',
      narrative: `Aikštė tuščia ir didelė. Fontanas neveikia — žiemos režimas arba remontas — bet jo baseinas pilnas lapų ir lietaus vandens, atspindintis žvaigždes. Trečias suoliukas nuo fontano — tai sakinys iš laiško, jei jį iššifravote. Ant suoliuko — nieko. Arba beveik nieko. Tarp suoliuko lentų įspraustas mažas popierinis trikampis. Miestas mūsų akivaizdoje pasakoja savo istorijas.`,
      location: 'Aikštė',
      imageTags: { background: 'square', atmosphere: 'night' },
      choices: [
        { text: 'Paimti trikampį', attributes: ['DRĄSA','GUDRUMAS'], unlocks: 9, statCheck: null },
        { text: 'Fotografuoti ir palikti', attributes: ['DĖMESYS','KANTRYBĖ'], unlocks: 8, statCheck: null },
        { text: 'Sėdėti ir laukti kas ateis', attributes: ['KANTRYBĖ','TIKĖJIMAS'], unlocks: 10,
          statCheck: { stat:'luck', threshold:8, bonusUnlock:10, successText:'Ir tikrai — po dvidešimt minučių ateina sena moteris. Ji nustebusi mato tave čia.', failText:'Niekas neateina. Tu sėdi vienas.' } },
        { text: 'Palikti viską ir eiti namo', attributes: ['ABEJINGUMAS','BAIMĖ'], unlocks: 7, statCheck: null }
      ]
    },
    7: {
      id: 7, isFinale: false,
      title: 'Gatvė',
      narrative: `Gatvė čia šiek tiek kyla į kalną, ir iš viršaus matosi miesto šviesos. Naktinis Vilnius iš čia atrodo kaip žemėlapis nubrėžtas šviesos piešikliu. Kažkur ten — Bernardinų sodas, ąžuolas, neišspręsta mįslė. Kažkur ten — Rotušės aikštė, suoliukas, popierinis trikampis arba jo nebuvimas. Gatvių tinklas atrodo kaip medžio šakos. Tu sustoji ir galvoji, kad miestas ir medis yra vienas ir tas pats dalykas.`,
      location: 'Gatvė',
      imageTags: { background: 'street_narrow', atmosphere: 'dusk' },
      choices: [
        { text: 'Grįžti prie ąžuolo su nauju supratimu', attributes: ['INTUICIJA','VILTIS'], unlocks: 9, statCheck: null },
        { text: 'Eiti per Užupį', attributes: ['RYŽTAS','GUDRUMAS'], unlocks: 8, statCheck: null },
        { text: 'Sėdėti ir žiūrėti į miestą ilgai', attributes: ['ABEJINGUMAS','TIKĖJIMAS'], unlocks: 10, statCheck: null },
        { text: 'Žemyn link upės', attributes: ['KANTRYBĖ','GARBĖ'], unlocks: 6, statCheck: null }
      ]
    },
    8: {
      id: 8, isFinale: false,
      title: 'Kiemas',
      narrative: `Seni kiemai su menininkų plakatais, varteliai kurie lyg ir atidaryti bet lyg ir ne. Kažkuriame lange šviesa — kažkas dirba naktį. Kažkurio kiemo fontane — maža varlė skulptūra, garsi Užupio konstitucija. Tu sustoji prie sienos su ja ir skaitai vieną punktą: „Kiekvienas turi teisę neturėti teisių." Šis miestas sugeba būti rimtas ir žaismingas vienu metu.`,
      location: 'Užupis',
      imageTags: { background: 'courtyard', atmosphere: 'night' },
      choices: [
        { text: 'Ieškoti dirbančio menininko lango', attributes: ['DRĄSA','UŽUOJAUTA'], unlocks: 9, statCheck: null },
        { text: 'Paskaityti visą konstituciją', attributes: ['IŠMINTIS','KANTRYBĖ'], unlocks: 10, statCheck: null },
        { text: 'Grįžti prie ąžuolo', attributes: ['TIKĖJIMAS','INTUICIJA'], unlocks: 9, statCheck: null },
        { text: 'Sėdėti prie fontano', attributes: ['ABEJINGUMAS','VILTIS'], unlocks: 10,
          statCheck: { stat:'grace', threshold:6, bonusUnlock:10, successText:'Tyla čia ypatinga. Tu supranti, kad laiškas buvo ne mįslė — jis buvo kvietimas čia.', failText:'Fontanas drėgnas. Tu šąli.' } }
      ]
    },
    9: {
      id: 9, isFinale: false,
      title: 'Paslaptis atsiskleidžia',
      narrative: `Popierinis trikampis arba senojo ąžuolo įrėžimai, arba laiško žodžiai — visa tai veda į tą patį: kažkas nori, kad šis miestas būtų matomas kitaip. Ne kaip turistinė trasa, ne kaip gyvenamoji vieta, bet kaip organizmas. Medis ir miesto gatvių tinklas turi tą pačią matematiką. Bernardinų sodas, Vilnelės krantinė, Rotušės aikštė — trys taškai apie kuriuos tu žinai šią naktį ko nežinojai ryte.`,
      location: 'Vilnelės upelis',
      imageTags: { background: 'river_bank', atmosphere: 'dawn' },
      choices: [
        { text: 'Grįžti prie ąžuolo paskutinį kartą', attributes: ['GARBĖ','TIKĖJIMAS'], unlocks: 10, statCheck: null },
        { text: 'Palikti savo žinutę miestui', attributes: ['VILTIS','AMBICIJA'], unlocks: 10, statCheck: null },
        { text: 'Eiti namo ir miegoti', attributes: ['ABEJINGUMAS','KANTRYBĖ'], unlocks: 10, statCheck: null },
        { text: 'Papasakoti kitiems', attributes: ['UŽUOJAUTA','RYŽTAS'], unlocks: 10, statCheck: null }
      ]
    },
    10: {
      id: 10, isFinale: true,
      title: 'Medžio žinia',
      narrative: `Laiškas buvo skirtas tau. Ne vardas, ne data — tiesiog žodžiai, kurie tiko tobulai šiai nakčiai ir šiam žmogui. Medis žinojo. Galbūt visada žinojo — ąžuolai gyvena šimtmečius ir mato daug žmonių praeinančių su savo klausimais. Bernardinų sodas šviesėja. Vilnelės čiurlenimas prisiartina kai nutyla kiti miesto garsai. Miestas atsibunda lėtai, kaip kiekvieną rytą jau kelis šimtus metų. Tu esi tik vienas iš daugelio, kurie čia sustojo ir paklausė.`,
      location: 'Bernardinų sodas',
      imageTags: { background: 'park', atmosphere: 'dawn' },
      choices: []
    }
  }
};
