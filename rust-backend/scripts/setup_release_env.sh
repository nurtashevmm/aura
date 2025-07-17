#!/bin/bash
# Environment setup for release builds
export PKG_CONFIG_PATH="/opt/homebrew/opt/leptonica/lib/pkgconfig"
export LEPTONICA_INCLUDE_DIR="/opt/homebrew/opt/leptonica/include"
export LLVM_CONFIG_PATH="$(brew --prefix llvm)/bin/llvm-config"
export CPATH="/opt/homebrew/opt/leptonica/include"
export LIBRARY_PATH="/opt/homebrew/opt/leptonica/lib"

echo "Release build environment configured"
