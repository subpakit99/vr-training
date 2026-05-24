-- ====================================================================
-- VR Container Training Management — Initial Schema + Seed Data
-- ====================================================================
-- คำแนะนำ: copy ทั้งไฟล์นี้ → paste ใน Supabase SQL Editor → กด Run
-- ====================================================================

-- ลบตารางเดิม (ถ้ามี) เพื่อรันใหม่ได้
DROP TABLE IF EXISTS training_records CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS courses CASCADE;

-- ────────────────────────────────────────────────────────────────────
-- TABLE: courses (หลักสูตร)
-- ────────────────────────────────────────────────────────────────────
CREATE TABLE courses (
  id              TEXT PRIMARY KEY,
  title           TEXT NOT NULL,
  category        TEXT NOT NULL,
  is_compulsory   BOOLEAN NOT NULL DEFAULT false,
  hours           INTEGER NOT NULL DEFAULT 0,
  expiry_years    INTEGER NOT NULL DEFAULT 0
);

-- ────────────────────────────────────────────────────────────────────
-- TABLE: employees (พนักงาน)
-- ────────────────────────────────────────────────────────────────────
CREATE TABLE employees (
  id          TEXT PRIMARY KEY,
  full_name   TEXT NOT NULL,
  department  TEXT NOT NULL,
  position    TEXT NOT NULL
);

-- ────────────────────────────────────────────────────────────────────
-- TABLE: training_records (บันทึกการอบรม)
-- ────────────────────────────────────────────────────────────────────
CREATE TABLE training_records (
  id          SERIAL PRIMARY KEY,
  emp_id      TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  course_id   TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  date        DATE NOT NULL,
  trainer     TEXT NOT NULL DEFAULT '',
  score       INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_training_emp_id ON training_records(emp_id);
CREATE INDEX idx_training_course_id ON training_records(course_id);
CREATE INDEX idx_training_date ON training_records(date DESC);

-- ────────────────────────────────────────────────────────────────────
-- DISABLE RLS (ตอน demo · production ค่อยเปิด + เขียน policies)
-- ────────────────────────────────────────────────────────────────────
ALTER TABLE courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE employees DISABLE ROW LEVEL SECURITY;
ALTER TABLE training_records DISABLE ROW LEVEL SECURITY;

-- ────────────────────────────────────────────────────────────────────
-- SEED: courses
-- ────────────────────────────────────────────────────────────────────
INSERT INTO courses (id, title, category, is_compulsory, hours, expiry_years) VALUES
  ('SFT-001', 'ความปลอดภัยในการทำงานกับเครื่องจักร', 'ความปลอดภัย', true,  6, 1),
  ('ORI-001', 'ปฐมนิเทศพนักงานใหม่',                'ปฐมนิเทศ',    true,  3, 0),
  ('SKL-001', 'เทคนิคการแปรรูปไม้ยางพารา',           'ทักษะงาน',    false, 12, 2),
  ('SKL-002', 'การขับโฟล์คลิฟต์',                    'ทักษะงาน',    false, 8, 2);

-- ────────────────────────────────────────────────────────────────────
-- SEED: employees
-- ────────────────────────────────────────────────────────────────────
INSERT INTO employees (id, full_name, department, position) VALUES
  ('EMP-101', 'สมชาย ใจดี',       'เตรียมไม้',      'พนักงานผลิต'),
  ('EMP-102', 'วิชัย รักงาน',      'แปรรูปไม้สด',    'หัวหน้ากะ'),
  ('EMP-103', 'ดวงใจ ขยันยิ่ง',    'สำนักงาน',       'เจ้าหน้าที่บุคคล'),
  ('EMP-104', 'สมศักดิ์ กล้าหาญ', 'คลังสินค้า',     'พนักงานขับโฟล์คลิฟต์'),
  ('EMP-105', 'มานี สีใส',         'แปรรูปไม้สด',    'พนักงานผลิต');

-- ────────────────────────────────────────────────────────────────────
-- SEED: training_records
-- ────────────────────────────────────────────────────────────────────
INSERT INTO training_records (emp_id, course_id, date, trainer, score) VALUES
  ('EMP-101', 'SFT-001', '2026-05-20', 'คุณวนัสรา', 85),
  ('EMP-101', 'SKL-001', '2026-05-22', 'คุณสมภพ',  65),
  ('EMP-104', 'ORI-001', '2026-05-24', 'HR',         100),
  ('EMP-101', 'ORI-001', '2026-01-10', 'HR',         80),
  ('EMP-102', 'SFT-001', '2025-05-01', 'วิทยากร',    95),
  ('EMP-103', 'SFT-001', '2025-06-15', 'วิทยากร',    90),
  ('EMP-102', 'ORI-001', '2026-05-01', 'HR',         88),
  ('EMP-103', 'ORI-001', '2026-05-01', 'HR',         88),
  ('EMP-104', 'SFT-001', '2026-05-01', 'วิทยากร',    88),
  ('EMP-104', 'SKL-002', '2026-05-05', 'คุณสมภพ',   92);

-- ====================================================================
-- ตรวจสอบผล: ควรเห็น records ตามนี้
-- ====================================================================
SELECT 'courses' AS tbl, COUNT(*) AS rows FROM courses
UNION ALL SELECT 'employees', COUNT(*) FROM employees
UNION ALL SELECT 'training_records', COUNT(*) FROM training_records;
