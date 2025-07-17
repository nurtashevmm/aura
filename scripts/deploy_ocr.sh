#!/bin/bash

# Set required environment variables
export LLVM_CONFIG_PATH=$(brew --prefix llvm)/bin/llvm-config
export CPATH=/opt/homebrew/opt/leptonica/include
export LIBRARY_PATH=/opt/homebrew/opt/leptonica/lib

# Build and deploy
cargo build --release
systemctl restart aura-ocr-service
