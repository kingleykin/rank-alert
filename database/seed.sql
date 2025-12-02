-- Seed data cho MVP: VieON Anh Trai Say Hi

INSERT INTO rankings (id, name, type, source_url, description, update_frequency)
VALUES (
  'vieon-atsh',
  'VieON - Anh Trai Say Hi',
  'vieon',
  'https://api-voting.vieon.vn/voting-service/api/v1/objects/all',
  'Bảng xếp hạng bình chọn Anh Trai Say Hi trên VieON',
  600
);

-- NOTE: URL trên là ví dụ. Cần tìm API endpoint thực tế bằng cách:
-- 1. Mở https://vieon.vn/anh-trai-say-hi
-- 2. DevTools → Network → Fetch/XHR
-- 3. Tìm request chứa ranking data
-- 4. Update URL bằng script: database/update-vieon-url.sql

