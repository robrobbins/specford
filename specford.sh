#!/bin/bash

# store the args
args=("$@")
len=${#args[@]}

# if we have any args, run them in zambie
if [ $len -gt 0 ]; then
  for f in $args
  do
    node "scripts/$f.js"
  done
else
# if there arent any just run averything in the scripts dir
  cd scripts/
  for file in *
  do
    if [ -f "$file" ]; then
      node $file
    fi
  done
  cd ..
fi
