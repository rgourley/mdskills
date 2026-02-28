-- Add role column to users table for admin access control
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- Set rgourley@gmail.com as admin
UPDATE public.users SET role = 'admin' WHERE email = 'rgourley@gmail.com';
