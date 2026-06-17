-- Core schema (PostgreSQL)

CREATE TABLE workers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  region TEXT,
  consent_signed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE video_clips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID REFERENCES workers(id),
  task_type TEXT,
  duration_seconds INTEGER,
  region TEXT,
  status TEXT DEFAULT 'raw',
  raw_s3_key TEXT,
  processed_s3_key TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE buyers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE licences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID REFERENCES buyers(id),
  clip_id UUID REFERENCES video_clips(id),
  purchased_at TIMESTAMPTZ DEFAULT now(),
  price_usd NUMERIC(10,2)
);
