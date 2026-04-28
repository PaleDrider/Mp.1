# Vilniaus Aidai — Diegimo Instrukcija

## Failų struktūra

```
echoes-game/
├── index.html          ← Pagrindinis žaidimo failas (atidaryti naršyklėje)
├── css/
│   └── style.css       ← Stiliai
├── js/
│   ├── data.js         ← Istorijų duomenys (čia rašyti turinį)
│   ├── audio.js        ← 8-bit muzikos variklis
│   ├── compositor.js   ← Paveikslėlių sluoksniuotojas
│   └── game.js         ← Pagrindinis žaidimo variklis
├── img/
│   ├── bg/             ← Fono paveikslėliai (bridge.png, park.png...)
│   └── atmo/           ← Atmosferos overlay (night.png, rain.png...)
├── admin/
│   └── index.html      ← Istorijų biblioteka ir statistikos
├── data/
│   └── stories/        ← AI sugeneruoti JSON failai (sukuria skriptas)
├── scripts/
│   └── generate_story.sh ← AI generavimo skriptas
└── prompts/
    └── story_blueprint.md ← Bito standartas
```

---

## 1. Greitas paleidimas (VSCodium arba Konsole)

### VSCodium

```bash
# Atidaryti projektą
codium /kelias/iki/echoes-game

# Instaliuoti "Live Server" plėtinį (vieną kartą):
# Ctrl+Shift+X → paieška "Live Server" → Instaliuoti

# Paleisti žaidimą:
# Dešinys klik ant index.html → "Open with Live Server"
# Automatiškai atsidarys: http://localhost:5500
```

### KDE Konsole (be serverio — paprasčiausias būdas)

```bash
cd /kelias/iki/echoes-game

# Tiesiog atidaryti naršyklėje:
xdg-open index.html

# ARBA nurodyti naršyklę tiesiogiai:
firefox index.html
chromium index.html
```

**Svarbu:** `file://` protokolas veikia visam žaidimui išskyrus paveikslėlius.
Jei paveikslėliai nerodomi — reikia lokalaus serverio:

```bash
# Python (dažniausiai jau instaliuotas Arch Linux):
cd /kelias/iki/echoes-game
python3 -m http.server 8080

# Atidaryti naršyklėje:
xdg-open http://localhost:8080
```

---

## 2. Paveikslėlių failai (img/)

Žaidimas veikia **be paveikslėlių** — compositor.js piešia procedūrinį foną.
Kai turėsite AI sugeneruotus paveikslėlius, įdėkite juos:

### Fono paveikslėliai (img/bg/)
Rekomenduojamas dydis: **1280×720px** arba **1920×1080px**, PNG arba JPG.

| Failas | Aprašymas |
|---|---|
| `bridge.png` | Tiltas (Žaliasis tiltas ar kitas) |
| `street_main.png` | Plati gatvė (Gedimino prospektas) |
| `street_narrow.png` | Siaura gatvė (Pilies, Literatų) |
| `park.png` | Sodas (Bernardinų sodas) |
| `river_bank.png` | Upės krantinė (Neris, Vilnelė) |
| `courtyard.png` | Senamiesčio kiemas |
| `tower.png` | Gedimino bokštas |
| `cathedral_sq.png` | Katedros aikštė |
| `square.png` | Miesto aikštė |

### Atmosferos overlay (img/atmo/)
Rekomenduojamas dydis: **tas pats kaip bg**, **PNG su skaidrumu (alpha)**.

| Failas | Efektas | Patarimas |
|---|---|---|
| `night.png` | Naktinis tamsumas | Tamsus mėlynas + žvaigždės |
| `rain.png` | Lietus | Baltos linijos striažai |
| `fog.png` | Rūkas | Pilkas švelnus gradientas |
| `dawn.png` | Aušra | Šiltas oranžinis |
| `dusk.png` | Saulėlydis | Rausvai violetinis |
| `snow.png` | Sniegas | Balti taškeliai |
| `crowd.png` | Minia | Siluetai apačioje |

### Paveikslėlių generavimas su Perchance.ai

Nueikite į https://perchance.org/ai-photo-generator arba panašų įrankį.

**Promptai fono paveikslėliams:**

```
Vilnius Lithuania old town narrow street at night,
cobblestone pavement, wet from rain, street lamp glow,
gothic architecture, atmospheric, dark moody, no people,
game background art, 16:9 aspect ratio
```

```
Green Bridge Vilnius Lithuania over Neris river at night,
city lights reflection in water, dramatic sky,
atmospheric game background, dark moody, cinematic
```

**Promptai atmosferos overlay (su skaidrumu):**

```
rain overlay texture, falling rain streaks, transparent
background, dark blue tones, suitable for image compositing,
PNG with alpha channel
```

```
night overlay, dark blue vignette, transparent center,
suitable for compositing over photos, PNG alpha
```

---

## 3. Gemini API raktas (nemokamas)

1. Eikite į: https://aistudio.google.com/app/apikey
2. Sukurkite raktą (nemokama — 1500 užklausų/dieną)
3. Nustatykite aplinkos kintamajame:

```bash
# Pridėti į ~/.bashrc arba ~/.zshrc:
export GEMINI_API_KEY="jūsų_raktas_čia"

# Pritaikyti iš karto:
source ~/.bashrc
```

---

## 4. Istorijų generavimas

```bash
# Suteikti vykdymo teises (vieną kartą):
chmod +x scripts/generate_story.sh

# Generuoti su Gemini (jei raktas nustatytas):
./scripts/generate_story.sh

# Generuoti su lokaliu AI:
./scripts/generate_story.sh --ai qwen

# Perrašyti esamą istoriją:
./scripts/generate_story.sh --ai gemini --story 1

# Rezultatas išsaugomas:
# data/stories/story_new_20250101_120000.json
```

Po generavimo:
1. Atidarykite `admin/index.html` naršyklėje
2. Spustelėkite **Įkelti iš JSON**
3. Pasirinkite sugeneruotą failą
4. Patikrinkite bitų struktūrą
5. Išsaugokite

---

## 5. Admin puslapis

```bash
# Atidaryti:
xdg-open admin/index.html
# arba
firefox admin/index.html
```

Admin puslapyje galite:
- Peržiūrėti sesijų statistikas
- Redaguoti atskirus bitus
- Importuoti/eksportuoti istorijas JSON formatu
- Stebėti kill count (kiek kartų pasiektas bitas 10)
- Matyti įtartinas sesijas (bot detektoriaus duomenys)

---

## 6. Bot detektoriaus testas

Bot detektorius veikia automatiškai. Norėdami testuoti:

```bash
# Atidarykite DevTools (F12) naršyklėje
# Console skirtuke paleiskite:

# Simuliuoti greitą botą:
for(let i=0; i<5; i++) {
  setTimeout(() => document.querySelectorAll('.choice-btn')[0]?.click(), i * 500);
}

# Po sesijos admin puslapyje matysite:
# "⚠ ĮTARTINA" žymę ir flagCount > 3
```

**Bot detektoriaus logika (game.js):**
- `flagCount++` kai pasirinkimas paspaustas greičiau nei per 10 sek.
- `suspicious = true` kai `flagCount >= 3`
- `passiveCount++` kai laikas baigėsi ir auto-pasirinkta
- Atributų pasiskirstymas: tikri žaidėjai klastringi, botai — vienodi

---

## 7. GitHub ir viešas hosting

### GitHub

```bash
cd echoes-game
git init
git add .
git commit -m "Pirmas Vilniaus Aidai commit"

# Sukurkite repo GitHub svetainėje, tada:
git remote add origin https://github.com/vardas/echoes-game.git
git push -u origin main
```

### Nemokamas hosting (GitHub Pages)

```bash
# GitHub repozitorijoje:
# Settings → Pages → Source: main branch / root folder
# Jūsų žaidimas bus pasiekiamas per:
# https://vardas.github.io/echoes-game/
```

**Svarbu dėl GitHub Pages:**
- Paveikslėliai veiks (jei įkelti)
- Backend (Python serveris) NEVEIKS — tik statiniai failai
- Sesijų duomenys saugomi tik localStorage (žaidėjo naršyklėje)
- Admin puslapis veikia, bet duomenys nesidalina tarp žaidėjų

### Jei reikia backend (sesijų saugojimas):

Paprasčiausias nemokamas variantas — **Render.com** (free tier):
- Sukurkite `server.py` su Flask
- Jis priima `/api/session` POST užklausas
- Saugo į SQLite failą

```python
# server.py (minimalus backend)
from flask import Flask, request, jsonify
import json, os
from datetime import datetime

app = Flask(__name__, static_folder='.', static_url_path='')

@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/api/session', methods=['POST'])
def save_session():
    data = request.get_json()
    with open('data/sessions.jsonl', 'a') as f:
        f.write(json.dumps({**data, 'server_ts': datetime.now().isoformat()}) + '\n')
    return jsonify({'ok': True})

if __name__ == '__main__':
    os.makedirs('data', exist_ok=True)
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 8080)))
```

---

## 8. Dažnos klaidos

| Klaida | Priežastis | Sprendimas |
|---|---|---|
| Žaidimas nepaleidžiamas | JS klaida konsolėje | F12 → Console, rasti raudoną klaidą |
| Muzika negirdima | Naršyklės politika | Spustelėkite bet kur puslapyje pirma |
| Paveikslėliai nerodo | `file://` protokolas | Naudoti `python3 -m http.server 8080` |
| Admin rodo tuščia | Nėra sesijų | Pažaiskite žaidimą, grįžkite į admin |
| Ollama neveikia | Servisas nesukurtas | `systemctl start ollama` arba `ollama serve` |
| Gemini klaida 403 | Neteisingas raktas | Patikrinkite `echo $GEMINI_API_KEY` |
