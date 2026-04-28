#!/bin/bash
# =========================================================
# scripts/generate_story.sh
# Istorijos generavimo skriptas
# Naudoja: 1) Gemini API  2) qwen2.5-coder:3b  3) llama3.2:3b
#
# NAUDOJIMAS:
#   chmod +x scripts/generate_story.sh
#   ./scripts/generate_story.sh
#   ./scripts/generate_story.sh --ai qwen --story 3
#
# IŠVESTIS: data/stories/story_<ID>_<timestamp>.json
# =========================================================

# ---- Konfigūracija ----
GEMINI_KEY="${GEMINI_API_KEY:-}"     # Nustatyti aplinkos kintamajame
AI_MODEL="gemini"                    # Numatytasis: gemini
STORY_ID="new"                       # Arba konkretus ID
OUTPUT_DIR="data/stories"

# ---- Argumentų analizė ----
while [[ $# -gt 0 ]]; do
  case $1 in
    --ai)    AI_MODEL="$2"; shift 2 ;;
    --story) STORY_ID="$2"; shift 2 ;;
    *) shift ;;
  esac
done

mkdir -p "$OUTPUT_DIR"

echo "=== Vilniaus Aidai — Istorijos Generatorius ==="
echo "AI modelis: $AI_MODEL"
echo "Istorijos ID: $STORY_ID"
echo "================================================"

# =====================================================
# BITO ŠABLONAS (Blueprint)
# AI PRIVALO laikytis šios struktūros
# =====================================================
read -r -d '' BLUEPRINT << 'BLUEPRINT_EOF'
Sukurk vieną žaidimo istoriją "Vilniaus Aidai" žaidimui.
Grąžink TIK JSON, be jokio teksto prieš ar po.

PRIVALOMA JSON STRUKTŪRA:
{
  "id": <skaičius>,
  "name": "<istorijos pavadinimas lietuviškai>",
  "description": "<1 sakinys apie istoriją>",
  "status": "active",
  "killCount": 0,
  "bits": {
    "1": {
      "id": 1,
      "title": "<bito pavadinimas>",
      "narrative": "<130-200 žodžių teksto, lietuviškai, 1-3 pastraipos, be dialogų>",
      "location": "<TIKRAS Vilniaus vietovardis>",
      "imageTags": {
        "background": "<vienas iš: bridge|street_main|street_narrow|park|river_bank|courtyard|tower|cathedral_sq|square>",
        "atmosphere": "<vienas iš: night|rain|fog|dawn|dusk|snow|crowd>"
      },
      "isFinale": false,
      "choices": [
        {
          "text": "<pasirinkimo tekstas, maks. 12 žodžių>",
          "attributes": ["<ATTR1>", "<ATTR2>"],
          "unlocks": <bito ID kurį atrakinantis>,
          "statCheck": null
        },
        ... (iš viso 4 pasirinkimai)
      ]
    },
    ...
    "10": {
      "id": 10,
      "isFinale": true,
      "choices": []
    }
  }
}

ATRIBUTŲ SĄRAŠAS (kiekvienam pasirinkimui 2 iš šio sąrašo):
DRĄSA, JĖGA, RYŽTAS, IŠMINTIS, GUDRUMAS, DĖMESYS,
UŽUOJAUTA, GARBĖ, VILTIS, AMBICIJA, BAIMĖ, ABEJINGUMAS,
GODUMAS, TIKĖJIMAS, INTUICIJA, KANTRYBĖ

TAISYKLĖS:
- Visos 10 bitų turi turėti aiškų kelią iki bito 10
- Bitas 10 privalo turėti "isFinale": true ir tuščią "choices": []
- Kiekvienas bitas turi paminėti TIKRĄ Vilniaus gatvę arba vietą
- Naratyvas turi būti 130-200 žodžių, atmosferiškas, be kalbos tiesiogiai
- Kiekvienas pasirinkimas turi LYGIAI 2 atributus iš sąrašo
- imageTags.background ir imageTags.atmosphere iš nurodytų variantų
- unlock grandinė turi leisti pasiekti bitą 10 per 4-8 žingsnius
- Istorija turi turėti aiškią temą (pvz: Tilto paslaptis, Senamiesčio dvaro šešėlis)

VILNIAUS VIETOVARDŽIAI (naudoti vieną per bitą):
Gedimino prospektas, Pilies gatvė, Gedimino bokštas,
Bernardinų sodas, Neries krantinė, Lukiškių aikštė,
Užupis, Žaliasis tiltas, Katedros aikštė, Šnipiškės,
Pylimo gatvė, Rotušės aikštė, Subačiaus gatvė,
Vilnelės upelis, Šv. Onos bažnyčia, Literatų gatvė

Grąžink TIK validų JSON be papildomų komentarų.
BLUEPRINT_EOF

# =====================================================
# 1. GEMINI API (pirmas bandymas)
# =====================================================
try_gemini() {
  echo "Bandoma Gemini Flash API..."

  if [ -z "$GEMINI_KEY" ]; then
    echo "GEMINI_API_KEY nenustatytas. Pereinama prie lokalaus AI."
    return 1
  fi

  RESPONSE=$(curl -s -X POST \
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_KEY}" \
    -H "Content-Type: application/json" \
    -d "{
      \"contents\": [{
        \"parts\": [{\"text\": $(echo "$BLUEPRINT" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))')}]
      }],
      \"generationConfig\": {
        \"temperature\": 0.7,
        \"maxOutputTokens\": 4096
      }
    }" 2>/dev/null)

  if echo "$RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['candidates'][0]['content']['parts'][0]['text'])" 2>/dev/null | python3 -m json.tool > /dev/null 2>&1; then
    echo "✓ Gemini atsakė sėkmingai"
    echo "$RESPONSE" | python3 -c "
import sys, json
d = json.load(sys.stdin)
text = d['candidates'][0]['content']['parts'][0]['text']
# Išvalyti markdown code fences jei yra
text = text.strip()
if text.startswith('\`\`\`'):
    text = '\n'.join(text.split('\n')[1:])
if text.endswith('\`\`\`'):
    text = '\n'.join(text.split('\n')[:-1])
print(text)
"
    return 0
  else
    echo "Gemini klaida arba neteisingas JSON atsakas."
    return 1
  fi
}

# =====================================================
# 2. OLLAMA LOKALUS AI (atsarginis variantas)
# =====================================================
try_ollama() {
  local MODEL_TAG="$1"
  echo "Bandoma Ollama modelis: $MODEL_TAG..."

  # Patikrinti ar ollama veikia
  if ! command -v ollama &> /dev/null; then
    echo "Ollama neinstaliuota. Bandykite: curl -fsSL https://ollama.com/install.sh | sh"
    return 1
  fi

  if ! ollama list 2>/dev/null | grep -q "$MODEL_TAG"; then
    echo "Modelis $MODEL_TAG nerastas. Parsiunčiama: ollama pull $MODEL_TAG"
    ollama pull "$MODEL_TAG" || return 1
  fi

  # Trumpesnis promptas lokaliam AI (mažiau tokenų)
  SHORT_PROMPT="Sukurk istoriją žaidimui. Grąžink TIK JSON. ${BLUEPRINT}"

  echo "Generuojama (gali užtrukti 1-3 min.)..."
  RESULT=$(echo "$SHORT_PROMPT" | ollama run "$MODEL_TAG" --nowordwrap 2>/dev/null)

  # Ištraukti JSON iš atsakymo
  JSON_PART=$(echo "$RESULT" | python3 -c "
import sys, re
text = sys.stdin.read()
# Ieškoti JSON bloko
match = re.search(r'\{.*\}', text, re.DOTALL)
if match:
    print(match.group(0))
" 2>/dev/null)

  if echo "$JSON_PART" | python3 -m json.tool > /dev/null 2>&1; then
    echo "✓ Ollama ($MODEL_TAG) atsakė sėkmingai"
    echo "$JSON_PART"
    return 0
  else
    echo "Ollama ($MODEL_TAG) neteisingas JSON."
    return 1
  fi
}

# =====================================================
# PAGRINDINIS GENERAVIMO PROCESAS
# =====================================================
RESULT_JSON=""
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

case "$AI_MODEL" in
  gemini)
    RESULT_JSON=$(try_gemini) || \
    RESULT_JSON=$(try_ollama "qwen2.5-coder:3b") || \
    RESULT_JSON=$(try_ollama "llama3.2:3b") || \
    RESULT_JSON=$(try_ollama "phi3:mini")
    ;;
  qwen)
    RESULT_JSON=$(try_ollama "qwen2.5-coder:3b") || \
    RESULT_JSON=$(try_ollama "llama3.2:3b")
    ;;
  llama)
    RESULT_JSON=$(try_ollama "llama3.2:3b") || \
    RESULT_JSON=$(try_ollama "phi3:mini")
    ;;
  phi3)
    RESULT_JSON=$(try_ollama "phi3:mini")
    ;;
esac

# =====================================================
# IŠSAUGOTI REZULTATĄ
# =====================================================
if [ -z "$RESULT_JSON" ]; then
  echo ""
  echo "✗ Nepavyko sugeneruoti. Visi AI modeliai nepasiekiami."
  echo "  Rankiniam generavimui nukopijuokite promptą iš:"
  echo "  prompts/story_blueprint.md"
  exit 1
fi

# Išsaugoti į failą
OUTFILE="${OUTPUT_DIR}/story_${STORY_ID}_${TIMESTAMP}.json"
echo "$RESULT_JSON" | python3 -m json.tool > "$OUTFILE" 2>/dev/null || echo "$RESULT_JSON" > "$OUTFILE"

echo ""
echo "✓ Išsaugota: $OUTFILE"
echo "  Importuokite per admin puslapį arba nukopijuokite į data.js"
echo ""

# Parodyti pirmus 5 laukus
echo "--- Peržiūra ---"
echo "$RESULT_JSON" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    print(f'ID: {d.get(\"id\", \"?\")}')
    print(f'Pavadinimas: {d.get(\"name\", \"?\")}')
    print(f'Bitų skaičius: {len(d.get(\"bits\", {}))}')
    has_finale = any(v.get('isFinale') for v in d.get('bits',{}).values())
    print(f'Finalinis bitas: {\"✓\" if has_finale else \"✗ TRŪKSTA!\"}')
except Exception as e:
    print(f'Klaida analizuojant: {e}')
"
