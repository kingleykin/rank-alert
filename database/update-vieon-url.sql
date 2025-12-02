-- Update VieON Anh Trai Say Hi source URL
-- Chạy script này sau khi có URL chính xác từ VieON

-- Cách 1: Nếu VieON có API public
UPDATE rankings 
SET source_url = 'https://api-voting.vieon.vn/voting-service/api/v1/objects/all'
WHERE id = 'vieon-atsh';

-- Cách 2: Nếu phải scrape từ web
-- UPDATE rankings 
-- SET source_url = 'https://vieon.vn/anh-trai-say-hi/binh-chon'
-- WHERE id = 'vieon-atsh';

-- Verify update
SELECT id, name, source_url, last_updated 
FROM rankings 
WHERE id = 'vieon-atsh';

-- wrangler d1 execute rankalert --command="UPDATE rankings SET source_url = 'https://api-voting.vieon.vn/voting-service/api/v1/objects/all' WHERE id = 'vieon-atsh'"
