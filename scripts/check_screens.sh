#!/bin/bash
# check_screens.sh <src-dir> [extra taste flags, e.g. --allow heavy-shadow]
# Runs the deterministic checkers that are installed on every screen rebuild (skips _*.html).
# Bar: Taste 0 FAIL, Gesso PASS, unslop-ui hits only where you can say why. Missing checkers are skipped, not failed.
SRC="$(cd "$1" && pwd)"; shift
S="${SKILLS_DIR:-$HOME/.claude/skills}"
TMP="$(mktemp -d)"
files=(); for f in "$SRC"/*.html; do [[ $(basename "$f") == _* ]] || files+=("$f"); done
echo "== Taste Skill inspector (--app, 1440)"
if [ -f "$S/design-taste-frontend/scripts/inspect.mjs" ]; then
  for f in "${files[@]}"; do
    printf "%s: " "$(basename "$f" .html)"
    node "$S/design-taste-frontend/scripts/inspect.mjs" "$f" --app --widths 1440 "$@" --out "$TMP/taste/$(basename "$f" .html)" 2>&1 | grep -E "^\s*\[|RESULT" | tr '\n' ' '; echo
  done
else echo "skipped: install https://github.com/Leonxlnx/taste-skill"; fi
echo "== unslop-ui tells (--surface)"
if [ -f "$S/unslop-ui/scripts/count_tells.py" ]; then
  ( cd "$SRC" && python3 "$S/unslop-ui/scripts/count_tells.py" --surface $(ls *.html *.css *.js 2>/dev/null | grep -v '^_') 2>/dev/null ) \
    | python3 -c 'import json,sys
d=json.load(sys.stdin); hits={k:v for k,v in d.items() if isinstance(v,dict) and v.get("count")}
print("total", d.get("total")); [print(" ",k,v["count"],(v.get("examples") or [""])[:2]) for k,v in hits.items()]' 2>&1
else echo "skipped: install https://github.com/felipebasurto/unslop-ui"; fi
echo "== Gesso anti-slop"
if command -v npx >/dev/null; then
  for f in "${files[@]}"; do ( cd "$TMP" && npx -y @gessobuild/anti-slop check "$f" 2>&1 | grep -v "^  note\|advisory\]\|^$\|file(s)" ); done
else echo "skipped: needs npx"; fi
echo "(taste screenshots in $TMP/taste)"
