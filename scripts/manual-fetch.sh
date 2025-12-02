#!/bin/bash

# Script để trigger manual fetch ranking data

echo "🚀 Triggering Manual Fetch for VieON ATSH..."
echo ""

WORKER_URL="http://localhost:8787"

# Check if worker is running
if ! curl -s "$WORKER_URL" > /dev/null 2>&1; then
    echo "❌ Worker is NOT running"
    echo "   Run: cd workers && npm run dev"
    exit 1
fi

# Trigger manual update
echo "📡 Sending update request..."
RESPONSE=$(curl -s -X POST "$WORKER_URL/api/update" \
  -H "Content-Type: application/json" \
  -d '{"rankingId":"vieon-atsh"}')

if [ "$RESPONSE" = "OK" ]; then
    echo "✅ Update triggered successfully!"
    echo ""
    echo "⏳ Waiting 3 seconds for data to be fetched..."
    sleep 3
    echo ""
    
    # Check results
    echo "📊 Checking results..."
    cd workers
    wrangler d1 execute rankalert --local --command="SELECT COUNT(*) as total_items FROM ranking_items WHERE ranking_id = 'vieon-atsh'"
    echo ""
    
    echo "🎯 Top 5 rankings:"
    wrangler d1 execute rankalert --local --command="SELECT position, item_name, score FROM ranking_items WHERE ranking_id = 'vieon-atsh' ORDER BY position ASC LIMIT 5"
else
    echo "❌ Update failed"
    echo "Response: $RESPONSE"
fi
