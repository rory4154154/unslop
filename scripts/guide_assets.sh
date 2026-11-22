#!/bin/bash
# guide_assets.sh <run-dir>
# before/<n>.png + after/<n>.png → guide/img/page-<n>-before.jpg / -after.jpg (2000px wide), films/out → guide/vid.
set -e
D="$(cd "$1" && pwd)"
mkdir -p "$D/guide/img" "$D/guide/vid"
for b in "$D"/before/*.png; do
  n="$(basename "$b" .png)"; a="$D/after/$n.png"
  [ -f "$a" ] || { echo "no after for $n, skipped"; continue; }
  ffmpeg -v error -y -i "$b" -vf scale=2000:-2 -q:v 3 "$D/guide/img/page-$n-before.jpg"
  ffmpeg -v error -y -i "$a" -vf scale=2000:-2 -q:v 3 "$D/guide/img/page-$n-after.jpg"
  echo "page-$n"
done
cp "$D"/films/out/*.mp4 "$D"/films/out/*-poster.jpg "$D/guide/vid/" 2>/dev/null || echo "no films rendered yet"
ls "$D/guide/vid" 2>/dev/null | tr '\n' ' '; echo
