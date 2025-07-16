#!/bin/bash

# Проверка неиспользуемых зависимостей
cargo +nightly udeps --all-targets

# Проверка устаревших зависимостей
cargo outdated --exit-code 1

# Проверка безопасности зависимостей
cargo audit
