CREATE TABLE IF NOT EXISTS "kyc_review_logs" (
  "id"           TEXT         NOT NULL,
  "kyc_id"       TEXT         NOT NULL,
  "decision"     "KycStatus"  NOT NULL,
  "comment"      TEXT,
  "reviewed_by"  TEXT,
  "reviewed_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "kyc_review_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "kyc_review_logs_kyc_id_idx" ON "kyc_review_logs"("kyc_id");

DO $$ BEGIN
  ALTER TABLE "kyc_review_logs" ADD CONSTRAINT "kyc_review_logs_kyc_id_fkey"
    FOREIGN KEY ("kyc_id") REFERENCES "kycs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
