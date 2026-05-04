

window.STORIES[1] = {
  id: 1,
  name: 'Akmens Pasaka',
  description: 'Senas akmuo Žirmūnų gatvėje slepia miesto atmintį.',
  status: 'active',
  killCount: 0,
  retiredAt: null,
  fastestBeat: null,

  bits: {
    1: {
      id: 1, isFinale: false,
      title: 'Akmuo Žirmūnų gatvėje',
      narrative: `Žirmūnų gatvė šią naktį neįprastai tuščia. Grindinio akmenys blizga po vakarykščio lietaus, kiekvienas jų atspindintis žibinto šviesą kaip mažas veidrodis. Ties sena siena, kur gatvė lenkiasi link Katedros aikštės, kažkas padėjo neįprastą akmenį — pernelyg lygiai aptašytą, pernelyg taisyklingą, kad būtų atsitiktinis. Žibinto šviesa krenta ant jo kaip rodo pirštą. Tu sustoji. Visas miestas, rodos, sulaiko kvapą kartu su tavimi.`,
      location: 'Pilies gatvė',
      imageTags: { background: 'street_narrow', atmosphere: 'night' },
      choices: [
        { text: 'Paimti akmenį į rankas', attributes: ['DRĄSA','AMBICIJA'], unlocks: 3, statCheck: null },
        { text: 'Apeiti ir eiti toliau', attributes: ['ABEJINGUMAS','KANTRYBĖ'], unlocks: 2, statCheck: null },
        { text: 'Atsiklaupti ir apžiūrėti iš arti', attributes: ['DĖMESYS','IŠMINTIS'], unlocks: 4, statCheck: null },
        { text: 'Paklausti einančio pro šalį senelio', attributes: ['UŽUOJAUTA','GUDRUMAS'], unlocks: 5,
          statCheck: { stat:'wit', threshold:7, bonusUnlock:8, successText:'Senelis žino šią gatvę atmintinai. Jo žodžiai atidaro duris, kurių nepastebėtumėte vienas.', failText:'Senelis tik papurto galvą ir eina toliau.' } }
      ]
    },
    2: {
      id: 2, isFinale: false,
      title: 'Aikštė naktį',
      narrative: `Tu eini toliau. Bet paskui atsigręži. Akmuo vis dar ten, žibinto apšviestas kaip relikvija altoriuje. Aikštė atsiveria prieš tave — didžiulė ir tuščia, tik bažnyčios bokštai kerta naktinį dangų. Aikštės akmenimis atsimuša tavo žingsniai. Kažkur toli šuo suloja, ir garsas nutolsta per senamiesčio labirintą. Tu sedi ant laiptų ir klausaisi kaip miestas kvepia po lietaus.`,
      location: 'Katedros aikštė',
      imageTags: { background: 'cathedral_sq', atmosphere: 'night' },
      choices: [
        { text: 'Grįžti prie akmens', attributes: ['INTUICIJA','DRĄSA'], unlocks: 3, statCheck: null },
        { text: 'Sėdėti ir klausytis miesto', attributes: ['KANTRYBĖ','TIKĖJIMAS'], unlocks: 6, statCheck: null },
        { text: 'Eiti link Gedimino bokšto', attributes: ['AMBICIJA','RYŽTAS'], unlocks: 7, statCheck: null },
        { text: 'Rašyti kažką ant šaligatvio kreida', attributes: ['VILTIS','GUDRUMAS'], unlocks: 4, statCheck: null }
      ]
    },
    3: {
      id: 3, isFinale: false,
      title: 'Akmuo rankose',
      narrative: `Akmuo šaltas ir netikėtai sunkus dėl savo dydžio. Ant jo apačios — įrėžti ženklai, per seni, kad būtų lietuviškas raidynas. Galbūt rūnos. Galbūt tik atsitiktiniai įbrėžimai po amžių dūžių. Tavo pirštai seka juos kaip raidžių kontūrus, nors proto balsas sako, kad tai tik fantazija. Pilies gatvė toliau tuščia. Akmuo šilsta tavo rankose lyg jis irgi lauktų kažko.`,
      location: 'Pilies gatvė',
      imageTags: { background: 'street_narrow', atmosphere: 'night' },
      choices: [
        { text: 'Nešti akmenį su savimi', attributes: ['AMBICIJA','RYŽTAS'], unlocks: 7, statCheck: null },
        { text: 'Padėti atgal tiksliai kaip buvo', attributes: ['GARBĖ','KANTRYBĖ'], unlocks: 6, statCheck: null },
        { text: 'Bandyti iššifruoti ženklus', attributes: ['IŠMINTIS','DĖMESYS'], unlocks: 8,
          statCheck: { stat:'wit', threshold:6, bonusUnlock:9, successText:'Ženklai tampa aiškūs — tai ne rūnos, bet sena žymė, kurią kažkas paliko tyčia jums.', failText:'Ženklai lieka paslaptimi. Gal nebuvo skirta žinoti.' } },
        { text: 'Mesti akmenį į tamsą', attributes: ['BAIMĖ','ABEJINGUMAS'], unlocks: 5, statCheck: null }
      ]
    },
    4: {
      id: 4, isFinale: false,
      title: 'Įrašai akmenyje',
      narrative: `Iš arti matyti daugiau. Akmens paviršius ne toks lygus, kaip atrodė iš tolo — jis išraustas daugybės mažų įrėžimų, kurie sudaro tam tikrą raštą. Kažkas čia dirbo ilgai ir kruopščiai. Literatų gatvė netoli — galbūt kažkuriame iš senų namų slypi atsakymas. Tavo keliai šiek tiek skauda nuo klūpojimo ant šaltų grindinio akmenų, bet tu negali atitraukti žvilgsnio.`,
      location: 'Literatų gatvė',
      imageTags: { background: 'street_narrow', atmosphere: 'fog' },
      choices: [
        { text: 'Eiti ieškoti knygų apie senus ženklus', attributes: ['IŠMINTIS','RYŽTAS'], unlocks: 7, statCheck: null },
        { text: 'Fotografuoti ženklus telefonu', attributes: ['DĖMESYS','GUDRUMAS'], unlocks: 8, statCheck: null },
        { text: 'Palikti akmenį ir mąstyti', attributes: ['KANTRYBĖ','TIKĖJIMAS'], unlocks: 6, statCheck: null },
        { text: 'Klausti vietinio istoriko', attributes: ['UŽUOJAUTA','GARBĖ'], unlocks: 9,
          statCheck: { stat:'grace', threshold:6, bonusUnlock:9, successText:'Istorikas iš karto atpažįsta ženklą — senasis Vilniaus gildijos antspaudas.', failText:'Istorikas klauso neįtikėtinai.' } }
      ]
    },
    5: {
      id: 5, isFinale: false,
      title: 'Senelio žodžiai',
      narrative: `Senelis sustoja. Jo akys, nors senos ir pavargusios, atsispindi žibinto šviesoje kaip du maži žvaigždžių fragmentai. Jis žiūri į akmenį tavo rankose ilgą akimirką, tada sako kažką labai tyliai, tik judindamas lūpas. Tu nesupranti žodžių — gal senoji tarmė, gal visai kita kalba — bet jo ranka per sekundę paliečia akmenį, ir kažkas tame prisilietimo gesturuje atrodo kaip atsisveikinimas.`,
      location: 'Pilies gatvė',
      imageTags: { background: 'street_narrow', atmosphere: 'night' },
      choices: [
        { text: 'Sekti paskui senelį', attributes: ['DRĄSA','INTUICIJA'], unlocks: 8, statCheck: null },
        { text: 'Paklausti ko jis palietė', attributes: ['UŽUOJAUTA','DĖMESYS'], unlocks: 7, statCheck: null },
        { text: 'Pasilikti ir žiūrėti jam einant', attributes: ['BAIMĖ','ABEJINGUMAS'], unlocks: 6, statCheck: null },
        { text: 'Padėti akmenį ten kur buvo', attributes: ['GARBĖ','TIKĖJIMAS'], unlocks: 9, statCheck: null }
      ]
    },
    6: {
      id: 6, isFinale: false,
      title: 'Neries krantinė',
      narrative: `Tu atsiduri prie Neries. Upė šią naktį juoda kaip veidrodis, atspindinti priešais ją apšviestos krantinės žibintus auksinėmis juostelėmis. Akmuo vis dar tavo rankose, arba galbūt jau kišenėje — tu jau nebebesi tikras. Miestas kvepia po lietaus žeme ir vandeniu. Kažkas šio momento atrodo labai senas, tarsi upė matė tą patį žmogų su tuo pačiu akmeniu jau tūkstantį kartų.`,
      location: 'Neries krantinė',
      imageTags: { background: 'river_bank', atmosphere: 'night' },
      choices: [
        { text: 'Mesti akmenį į upę', attributes: ['RYŽTAS','AMBICIJA'], unlocks: 9, statCheck: null },
        { text: 'Sėdėti ir žiūrėti į vandenį', attributes: ['KANTRYBĖ','INTUICIJA'], unlocks: 8, statCheck: null },
        { text: 'Grįžti į senamiesčio kiemus', attributes: ['GUDRUMAS','DĖMESYS'], unlocks: 7, statCheck: null },
        { text: 'Eiti per tiltą į kitą krantą', attributes: ['DRĄSA','VILTIS'], unlocks: 10, statCheck: null }
      ]
    },
    7: {
      id: 7, isFinale: false,
      title: 'Prospektas',
      narrative: `Prospektas naktyje — tarsi teatro scena po spektaklio. Tuščios kėdės, nuleistos uždangos, bet dekoracijos dar stovi. Keletas vėlyvų praeivių, dviračių šviesos. Kažkur triukšmauja restoranas. Tu eini viduriniuoju pėsčiųjų taku ir jauti akmens svorį kišenėje — jei jis dar ten. Bokštas kalno viršuje blykčioja raudonai — aviacinis signalas, bet iš toli jis atrodo lyg senasis signalas.`,
      location: 'Gedimino prospektas',
      imageTags: { background: 'street_main', atmosphere: 'dusk' },
      choices: [
        { text: 'Lipti į Gedimino kalną', attributes: ['RYŽTAS','DRĄSA'], unlocks: 10, statCheck: null },
        { text: 'Užeiti į vakarinę kavinę', attributes: ['ABEJINGUMAS','GUDRUMAS'], unlocks: 9, statCheck: null },
        { text: 'Sustoti prie seno pastato', attributes: ['DĖMESYS','IŠMINTIS'], unlocks: 8, statCheck: null },
        { text: 'Skambinti draugui papasakoti', attributes: ['UŽUOJAUTA','VILTIS'], unlocks: 6, statCheck: null }
      ]
    },
    8: {
      id: 8, isFinale: false,
      title: 'Žaliasis tiltas',
      narrative: `Žaliasis tiltas. Geležiniai baliustradų ornamentai šalti ir drėgni po lietaus. Nuo tilto matosi abu krantai — senoji dalis su bažnyčių siluetais, ir naujoji su stiklo bokštais. Tavo rankose — akmuo arba jo nebuvimas, priklausomai nuo to ką pasirinkote ankstesnėse gatvėse. Vanduo teka labai lėtai, tarsi upė irgi mąsto. Kažkas šiame taške tarp dviejų krantų atrodo kaip sprendimas.`,
      location: 'Žaliasis tiltas',
      imageTags: { background: 'bridge', atmosphere: 'night' },
      choices: [
        { text: 'Padėti akmenį ant tilto turėklo', attributes: ['TIKĖJIMAS','VILTIS'], unlocks: 10, statCheck: null },
        { text: 'Grįžti į kur pradėjai', attributes: ['GARBĖ','KANTRYBĖ'], unlocks: 9, statCheck: null },
        { text: 'Eiti į senamiesčio kiemus', attributes: ['INTUICIJA','GUDRUMAS'], unlocks: 5, statCheck: null },
        { text: 'Pasilikti ir laukti aušros', attributes: ['KANTRYBĖ','BAIMĖ'], unlocks: 10,
          statCheck: { stat:'luck', threshold:7, bonusUnlock:10, successText:'Aušra ateina kaip atsakymas. Pirmieji miesto garsai pasako viską.', failText:'Aušra ateina šalta ir be atsakymų.' } }
      ]
    },
    9: {
      id: 9, isFinale: false,
      title: 'Sodas',
      narrative: `Sodas prieš aušrą. Tamsoje medžiai dideli ir ramūs, jų lapai dar drėgni nuo nakties, krintantys vandens lašai skamba kaip mažas laikrodis. Upelė čiurlena per sodo pakraštį. Akmuo kišenėje, jei jis dar ten, dabar jaučiasi kitoks — lengvesnis, arba sunkesnis, nesi tikras. Kažkas šiame sode laukia tol, kol žmonės išeina, ir tada grįžta.`,
      location: 'Bernardinų sodas',
      imageTags: { background: 'park', atmosphere: 'dawn' },
      choices: [
        { text: 'Palikti akmenį po senu ąžuolu', attributes: ['TIKĖJIMAS','GARBĖ'], unlocks: 10, statCheck: null },
        { text: 'Nešti akmenį toliau', attributes: ['AMBICIJA','RYŽTAS'], unlocks: 10, statCheck: null },
        { text: 'Palaidoti akmenį žemėje', attributes: ['INTUICIJA','KANTRYBĖ'], unlocks: 10, statCheck: null },
        { text: 'Pasilikti ir žiūrėti saulėtekį', attributes: ['VILTIS','ABEJINGUMAS'], unlocks: 10, statCheck: null }
      ]
    },
    10: {
      id: 10, isFinale: true,
      title: 'Akmens paslaptis',
      narrative: `Supranti. Tas akmuo buvo ženklas — ne tau asmeniškai, bet per tave. Vilnius turi savo atmintį, savo kalbą, kurios nereikia mokytis — ją reikia pajusti. Ir tu, nors trumpam, ją pajutai. Galbūt akmuo vis dar tavo kišenėje, galbūt jis jau kažkur miestas — prie upės, po medžiu, ant tilto. Gatvė vėl tuščia. Bet ji kitokia. Tu kitoks. Miestas tęsia savo gyvenimą kaip tęsė jį prieš tave ir tęs po.`,
      location: 'Pilies gatvė',
      imageTags: { background: 'street_narrow', atmosphere: 'dawn' },
      choices: []
    }
  }
};
