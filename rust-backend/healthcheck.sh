#!/bin/sh

# Check OCR service health
curl -sSf http://localhost:8080/api/health > /dev/null || exit 1

# Check payment processor status
curl -sS http://localhost:8080/api/payment/metrics | \
    jq -e '.pending_topups < 20' || exit 1
