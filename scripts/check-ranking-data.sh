#!/bin/bash

# Script kiểm tra dữ liệu ranking đã được lấy chưa

echo "🔍 Checking RankAlert Data..."
echo ""

# Check if worker is running
echo "1️⃣ Checking Worker Status..."
WORKER_URL="http://localhost:8787"
if curl -s "$WORKER_URL" > /dev/null 2>&1; then
    echo "✅ Worker is running at $WORKER_URL"
else
    echo "❌ Worker is NOT running"
    echo "   Run: cd workers && npm run dev"
    exit 1
fi
echo ""

# Check rankings table
echo "2️⃣ Checking Rankings Table..."
cd workers
wrangler d1 execute rankalert --local --command="SELECT id, name, last_updated FROM rankings WHERE id = 'vieon-atsh'"
echo ""

# Check ranking_items table
echo "3️⃣ Checking Ranking Items..."
ITEMS_COUNT=$(wrangler d1 execute rankalert --local --command="SELECT COUNT(*) as count FROM ranking_items WHERE ranking_id = 'vieon-atsh'" 2>/dev/null | grep -o '[0-9]\+' | tail -1)

if [ -z "$ITEMS_COUNT" ] || [ "$ITEMS_COUNT" = "0" ]; then
    echo "❌ No ranking items found"
    echo ""
    echo "💡 To fetch data, run:"
    echo "   curl -X POST http://localhost:8787/api/update \\"
    echo "     -H 'Content-Type: application/json' \\"
    echo "     -d '{\"rankingId\":\"vieon-atsh\"}'"
else
    echo "✅ Found $ITEMS_COUNT ranking items"
    echo ""
    echo "📊 Top 5 items:"
    wrangler d1 execute rankalert --local --command="SELECT position, item_name, score FROM ranking_items WHERE ranking_id = 'vieon-atsh' ORDER BY position ASC LIMIT 5"
fi
echo ""

# Check ranking_history table
echo "4️⃣ Checking Ranking History..."
HISTORY_COUNT=$(wrangler d1 execute rankalert --local --command="SELECT COUNT(*) as count FROM ranking_history WHERE ranking_id = 'vieon-atsh'" 2>/dev/null | grep -o '[0-9]\+' | tail -1)

if [ -z "$HISTORY_COUNT" ] || [ "$HISTORY_COUNT" = "0" ]; then
    echo "ℹ️  No history yet (normal for first run)"
else
    echo "✅ Found $HISTORY_COUNT history records"
fi
echo ""

# Test API endpoint
echo "5️⃣ Testing API Endpoint..."
RESPONSE=$(curl -s "$WORKER_URL/api/rankings/vieon-atsh")

if echo "$RESPONSE" | grep -q "item_name"; then
    echo "✅ API endpoint working"
    echo ""
    echo "📡 API Response:"
    echo "$RESPONSE" | jq '.[0:3]' 2>/dev/null || echo "$RESPONSE"
else
    echo "❌ API endpoint returned empty or error"
    echo "Response: $RESPONSE"
fi
echo ""

echo "✅ Check complete!"
