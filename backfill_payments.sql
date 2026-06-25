-- Backfill payments for loans that have paid_amount > 0
-- but no corresponding records in the payments table.
--
-- Run once in Supabase SQL editor.
-- Safe to re-run: the WHERE clause excludes loans that already have payment records.

INSERT INTO payments (id, loan_id, amount, method, note, date, ref)
SELECT
  'BF-' || l.id                      AS id,
  l.id                               AS loan_id,
  l.paid_amount                      AS amount,
  'cash'                             AS method,
  'backfill from loan record'        AS note,
  COALESCE(l.updated_at, l.created_at, now()) AS date,
  'BF-' || l.id                      AS ref
FROM loans l
WHERE l.paid_amount > 0
  AND l.status IN ('active', 'completed')
  AND l.id NOT IN (SELECT DISTINCT loan_id FROM payments);
