#!/bin/bash

# Script để reset và restore local D1 database

echo "🔄 Resetting local D1 database..."
echo ""

cd workers

# Run schema
echo "1️⃣ Creating tables..."
wrangler d1 execute rankalert --local --file=../database/schema.sql

# Run seed
echo ""
echo "2️⃣ Seeding data..."
wrangler d1 execute rankalert --local --file=../database/seed.sql

# Trigger fetch
echo ""
echo "3️⃣ Fetching VieON data..."
sleep 2
curl -X POST http://localhost:8787/api/update \
  -H "Content-Type: application/json" \
  -d '{"rankingId":"vieon-atsh"}' \
  -s > /dev/null

# Verify
echo ""
echo "4️⃣ Verifying data..."
TOTAL=$(wrangler d1 execute rankalert --local --command="SELECT COUNT(*) as total FROM ranking_items WHERE ranking_id = 'vieon-atsh'" 2>/dev/null | grep -o '[0-9]\+' | tail -1)

if [ -z "$TOTAL" ] || [ "$TOTAL" = "0" ]; then
    echo "❌ No data found"
else
    echo "✅ Found $TOTAL ranking items"
    echo ""
    echo "📊 Top 3:"
    wrangler d1 execute rankalert --local --command="SELECT position, item_name, score FROM ranking_items WHERE ranking_id = 'vieon-atsh' ORDER BY position LIMIT 3"
fi

echo ""
echo "✅ Database reset complete!"
echo ""
echo "🌐 Test API:"
echo "   curl http://localhost:8787/api/rankings/vieon-atsh | jq '.'"
