#!/bin/bash
set -euo pipefail
IFS=$'\n\t'

# See https://docs.opencv.org/master/d4/da1/tutorial_js_setup.html

git clone https://github.com/opencv/opencv.git --depth 1
cd opencv

# Build in the given directory
# Append --build_test to build OpenCV tests
python ./platforms/js/build_js.py build --build_wasm
