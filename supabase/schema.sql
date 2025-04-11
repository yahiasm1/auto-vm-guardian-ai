
-- Create tables for the VM Management System
-- This file contains SQL to create all required tables based on the TypeScript types

-- Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'instructor', 'student', 'guest')),
  department TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'inactive', 'suspended', 'pending')),
  last_active TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Virtual Machines Table
CREATE TABLE IF NOT EXISTS public.virtual_machines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  os TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'creating' CHECK (status IN ('running', 'stopped', 'suspended', 'creating', 'error')),
  cpu INTEGER NOT NULL,
  ram INTEGER NOT NULL,
  storage INTEGER NOT NULL,
  ip TEXT,
  course TEXT,
  user_id UUID NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Resources Table (for resource usage tracking)
CREATE TABLE IF NOT EXISTS public.resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id),
  cpu_usage NUMERIC NOT NULL,
  ram_usage NUMERIC NOT NULL,
  storage_usage NUMERIC NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Documents Table
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Assignments Table
CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  course TEXT NOT NULL,
  due_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create functions for resource aggregation
CREATE OR REPLACE FUNCTION get_max_resources(p_user_id UUID, p_start_time TIMESTAMPTZ)
RETURNS TABLE (max_cpu NUMERIC, max_ram NUMERIC, max_storage NUMERIC) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    MAX(cpu_usage) AS max_cpu, 
    MAX(ram_usage) AS max_ram, 
    MAX(storage_usage) AS max_storage
  FROM 
    resources
  WHERE 
    user_id = p_user_id AND 
    timestamp >= p_start_time;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_avg_resources(p_user_id UUID, p_start_time TIMESTAMPTZ)
RETURNS TABLE (avg_cpu NUMERIC, avg_ram NUMERIC, avg_storage NUMERIC) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    AVG(cpu_usage) AS avg_cpu, 
    AVG(ram_usage) AS avg_ram, 
    AVG(storage_usage) AS avg_storage
  FROM 
    resources
  WHERE 
    user_id = p_user_id AND 
    timestamp >= p_start_time;
END;
$$ LANGUAGE plpgsql;

-- Add Row Level Security (RLS) policies
-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.virtual_machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admin can view all user data" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin can insert user data" ON public.users
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin can update user data" ON public.users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Virtual machine policies
CREATE POLICY "Users can view their own VMs" ON public.virtual_machines
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all VMs" ON public.virtual_machines
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Instructor can view course VMs" ON public.virtual_machines
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'instructor' AND 
      course IN (SELECT course FROM public.virtual_machines WHERE course IS NOT NULL)
    )
  );

CREATE POLICY "Users can create their own VMs" ON public.virtual_machines
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own VMs" ON public.virtual_machines
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admin can update any VM" ON public.virtual_machines
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Similar policies for other tables...

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vm_user_id ON public.virtual_machines(user_id);
CREATE INDEX IF NOT EXISTS idx_vm_course ON public.virtual_machines(course);
CREATE INDEX IF NOT EXISTS idx_resources_user_id ON public.resources(user_id);
CREATE INDEX IF NOT EXISTS idx_resources_timestamp ON public.resources(timestamp);
CREATE INDEX IF NOT EXISTS idx_assignments_course ON public.assignments(course);
CREATE INDEX IF NOT EXISTS idx_assignments_due_date ON public.assignments(due_date);
