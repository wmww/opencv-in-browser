#!/bin/bash
set -euo pipefail
IFS=$'\n\t'

docker build . -t build-img
docker create --name build-cont build-img
docker cp build-cont:/code/opencv/build ./opencv_build
