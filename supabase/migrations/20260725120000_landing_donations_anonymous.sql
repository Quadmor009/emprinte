-- Add anonymous flag to donations
ALTER TABLE landing.donations
  ADD COLUMN anonymous boolean NOT NULL DEFAULT false;
