#!/bin/bash

# store the args
args=("$@")
len=${#args[@]}

# if we have any args, run them in phantom
if [ $len -gt 0 ]; then
  for f in $args
  do
    phantomjs "scripts/$f.js"
  done
else
# if there arent any just run averything in the scripts dir
  cd scripts/
  for file in *
  do
    if [ -f "$file" ]; then
      phantomjs $file
    fi
  done
  cd ..
fi
