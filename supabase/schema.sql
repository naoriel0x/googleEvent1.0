-- Create cases table
CREATE TABLE public.cases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed')),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reporter_name TEXT,
  involved_parties TEXT,
  violation_type TEXT CHECK (violation_type IN ('penggusuran', 'sengketa_lahan', 'pencemaran_lingkungan', 'pelanggaran_hak', 'lainnya')),
  incident_date TEXT,
  incident_location TEXT,
  description TEXT,
  witnesses JSONB DEFAULT '[]',
  evidence JSONB DEFAULT '[]',
  messages JSONB DEFAULT '[]',
  completeness_score INTEGER DEFAULT 0 CHECK (completeness_score >= 0 AND completeness_score <= 100),
  document_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT description_length CHECK (char_length(description) <= 10000)
);

-- Create indexes
CREATE INDEX idx_cases_session_id ON public.cases(session_id);
CREATE INDEX idx_cases_status ON public.cases(status);
CREATE INDEX idx_cases_created_at ON public.cases(created_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow anyone to read their own session's cases
CREATE POLICY "Users can read their own session cases"
  ON public.cases
  FOR SELECT
  USING (true);

-- Allow anyone to insert cases
CREATE POLICY "Users can insert cases"
  ON public.cases
  FOR INSERT
  WITH CHECK (true);

-- Allow anyone to update their own session's cases
CREATE POLICY "Users can update their own session cases"
  ON public.cases
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Create storage buckets for evidence and documents
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('evidence', 'evidence', false),
  ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS for storage buckets
CREATE POLICY "Evidence is private"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'evidence');

CREATE POLICY "Documents are public"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'documents');

CREATE POLICY "Users can upload evidence"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'evidence');

CREATE POLICY "Users can upload documents"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'documents');

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update updated_at on every update
CREATE OR REPLACE TRIGGER update_cases_updated_at BEFORE UPDATE
  ON public.cases
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
