#!/bin/bash

# Test basic OCR functionality
echo "Testing OCR service..."
curl -X POST -F "file=@tests/integration/kaspi_receipt.jpg" http://localhost:8080/api/payment/verify-cheque

# Test metrics endpoint
echo "\n\nTesting metrics..."
curl http://localhost:8080/api/payment/metrics

# Test health endpoint
echo "\n\nTesting health..."
curl http://localhost:8080/api/health
