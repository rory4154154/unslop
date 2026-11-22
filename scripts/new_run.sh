#!/bin/bash
# new_run.sh <run-dir> <product> [--demo]
# Scaffolds a redline run: before/ src/ after/ films/ guide/, with the film engine and templates copied in.
# --demo also adds slop/ with the default-AI-UI kit, for building a fictional "before" from scratch.
set -e
D="$1"; PRODUCT="$2"
[ -z "$D" ] || [ -z "$PRODUCT" ] && { echo "usage: new_run.sh <run-dir> <product> [--demo]"; exit 1; }
K="$(cd "$(dirname "$0")/.." && pwd)"
[ -e "$D" ] && { echo "exists: $D (not overwriting)"; exit 1; }
mkdir -p "$D"/{before,src,after,films/out,films/check,guide/img,guide/vid}
cp "$K"/engine/{steps.js,frame.css} "$D/films/"
cp "$K/templates/film.html" "$D/films/_film.html"
cp "$K/templates/screen.html" "$D/src/_screen.html"
cp "$K/templates/guide.html" "$D/guide/$PRODUCT-redline.html"
if [ "$3" = "--demo" ]; then mkdir -p "$D/slop"; cp "$K"/templates/slop-kit/* "$D/slop/"; fi
echo "$D"
