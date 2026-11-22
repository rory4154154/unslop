#!/bin/bash
# stills.sh <recording> <out-dir> <crop|-> name=seconds [name=seconds ...]
# Pulls full-resolution stills of each screen from a screen recording.
# crop is ffmpeg w:h:x:y in source pixels, to cut browser chrome (e.g. 2880:1600:0:176 on a 2880x1800 Retina capture).
# Find the times first:  ffmpeg -i rec.mov -vf "fps=1/5,scale=480:-1" contact/%03d.jpg  and look at the contact frames.
set -e
REC="$1"; OUT="$2"; CROP="$3"; shift 3
mkdir -p "$OUT"
ffprobe -v error -show_entries format=duration:stream=width,height -of csv=p=0 "$REC"
for pair in "$@"; do
  n="${pair%%=*}"; t="${pair#*=}"
  if [ "$CROP" = "-" ]; then VF="null"; else VF="crop=$CROP"; fi
  ffmpeg -v error -y -ss "$t" -i "$REC" -frames:v 1 -vf "$VF" "$OUT/$n.png"
  echo "$OUT/$n.png  ($t s)"
done
