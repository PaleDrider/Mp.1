# Vilniaus Aidai — Bito Standartas (Blueprint)

## Kas tai yra?
Šis dokumentas yra **standartas** kiekvienam žaidimo bitui.
AI generuodamas tekstą PRIVALO laikytis šios struktūros.
Redaktorius/autorius tikrina tik tai, kas čia pažymėta ✓.

---

## Bito struktūra (JSON)

```json
{
  "id": 3,
  "title": "Tiltas ties Vilnele",
  "narrative": "...",
  "location": "Žaliasis tiltas",
  "imageTags": { "background": "bridge", "atmosphere": "night" },
  "isFinale": false,
  "choices": [ ...4 pasirinkimai... ]
}
```

---

## Naratyvo taisyklės (narrative)

| Taisyklė | Reikšmė |
|---|---|
| **Ilgis** | 130–200 žodžių. Ne mažiau, ne daugiau. |
| **Kalba** | Lietuviškai. Literatūrinė, ne šnekamoji. |
| **Perspektyva** | Antrasis asmuo: "Tu stovi...", "Tavo rankos..." |
| **Tiesioginis kalbėjimas** | DRAUDŽIAMAS. Nė vieno dialogo. |
| **Vietovardis** | Paminėti bent vieną realų Vilniaus pavadinimą. |
| **Pabaiga** | Bitas turi baigtis atviru klausimu arba momentu sprendimui. |
| **Žanras** | Atmosferinis, paslaptingas. Ne siaubo, ne komedija. |
| **Veiksmažodžiai** | Esamasis laikas (stovi, eina, mato). |

**Pavyzdys (TEISINGAS):**
> Tu kirtai Žaliąjį tiltą jau tris kartus šį vakarą. Neries vanduo
> žemiau juodas kaip veidrodis, atspindintis priešais ją uždegtas
> gatvines lempas. Kažkas paliko ant turėklo seną krepšį — odinis,
> iškepęs, su inicialais, kurių jau nebeįskaitysi. Miestas kvėpuoja
> tave šalia savęs.

**Pavyzdys (NETEISINGAS):**
> "Kas čia?" — paklausė Jonas. Jis buvo labai nustebintas!
> *(Dialogas, trečias asmuo, šauktukai — visi draudžiami)*

---

## Pasirinkimų taisyklės (choices)

Kiekvienas bitas turi **lygiai 4** pasirinkimus.

| Laukas | Taisyklė |
|---|---|
| `text` | Maks. 12 žodžių. Veiksmažodis pradžioje. |
| `attributes` | Lygiai **2** atributai iš sąrašo žemiau. |
| `unlocks` | Bito ID šioje istorijoje (1–10). Turi egzistuoti. |
| `statCheck` | `null` arba `{"stat":"wit","threshold":7,"bonusUnlock":8}` |

**Atributų sąrašas:**
```
DRĄSA    JĖGA     RYŽTAS    IŠMINTIS  GUDRUMAS   DĖMESYS
UŽUOJAUTA GARBĖ   VILTIS    AMBICIJA  BAIMĖ      ABEJINGUMAS
GODUMAS  TIKĖJIMAS INTUICIJA KANTRYBĖ
```

**Pasirinkimų balanso taisyklė:**
- 1 pasirinkimas su "šviesiaisiais" atributais (DRĄSA, GARBĖ, VILTIS...)
- 1 pasirinkimas su "tamsiais" atributais (BAIMĖ, AMBICIJA, GODUMAS...)
- 2 pasirinkimai neutralūs/mišrūs
- Max 1 pasirinkimas su `statCheck` per bitą

---

## Unlocks grandinės taisyklė

Kiekviena istorija turi 10 bitų. Žaidėjas turi galimybę pasiekti
bitą 10 per 4–8 žingsnius (ne mažiau, ne daugiau).

**Taisyklinga grandinė (pvz.):**
```
1 → 3 → 5 → 8 → 10   (4 žingsniai — trumpiausias kelias)
1 → 2 → 4 → 7 → 9 → 10 (5 žingsniai)
```

**Netaisyklinga:**
```
1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10  (per ilga — 9 žingsniai)
1 → 10  (per trumpa — 1 žingsnis)
```

---

## Paveikslėlių žymų sąrašas (imageTags)

**background** (vienas iš):
| Kodas | Aprašymas |
|---|---|
| `bridge` | Tiltas |
| `street_main` | Plati gatvė, prospektas |
| `street_narrow` | Siaura gatvė, senamiesčio skersgatvis |
| `park` | Sodas, parkas |
| `river_bank` | Upės krantinė |
| `courtyard` | Kiemas, vidiniė teritorija |
| `tower` | Bokštas, tvirtovė |
| `cathedral_sq` | Katedros aikštė, bažnyčios |
| `square` | Aikštė |

**atmosphere** (vienas iš):
| Kodas | Efektas |
|---|---|
| `night` | Tamsi naktis (multiply overlay) |
| `rain` | Lietus (tamsiai mėlynas overlay) |
| `fog` | Rūkas (pilkas overlay) |
| `dawn` | Aušra (šiltas oranžinis) |
| `dusk` | Saulėlydis (tamsiai raudonas) |
| `snow` | Sniegas (švelnus baltas) |
| `crowd` | Minia (neutralus tamsus) |

---

## Istorijos finalinis bitas (id: 10)

```json
"10": {
  "id": 10,
  "title": "<Istorijos pavadinimas pabaiga>",
  "narrative": "...(finalinis tekstas, refleksyvus, 130-200 žodžių)...",
  "location": "<Vilniaus vieta>",
  "imageTags": { "background": "...", "atmosphere": "dawn" },
  "isFinale": true,
  "choices": []
}
```

Finaliniame bite:
- `isFinale: true` — **privaloma**
- `choices: []` — tuščias masyvas
- Naratyvas: refleksyvus, baigiamasis, ramiai uždarantis istoriją
- Rekomenduojama atmosphere: `dawn` (simbolizuoja pabaigą/pradžią)

---

## Fakto patikrinimas (Facts Check)

Prieš patvirtinant AI sugeneruotą istoriją, patikrinti:

- [ ] Visi Vilniaus vietovardžiai egzistuoja realiame Vilniuje
- [ ] Nė vienas bitas neturi klaidingų istorinių faktų
- [ ] Visi `unlocks` ID egzistuoja toje pačioje istorijoje
- [ ] Bitas 10 turi `isFinale: true`
- [ ] Kiekvienas pasirinkimas turi lygiai 2 atributus
- [ ] Naratyvo ilgis 130–200 žodžių (apytiksliai)

---

## Promptas AI (kopijuoti į terminalą)

```
Sukurk naują žaidimo istoriją "Vilniaus Aidai" žaidimui.
Grąžink TIK JSON, be jokio teksto prieš ar po.
Laikykis struktūros iš prompts/story_blueprint.md.
Istorija: <TEMA, pvz: "Senas malūnas prie Vilnelės">
Pradinė vieta: <VIETOVARDIS>
Nuotaika: <ATMOSFERA, pvz: lietus, naktis, rūkas>
```
