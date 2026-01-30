-- Add unique constraint to workflow name
ALTER TABLE workflows ADD CONSTRAINT workflows_name_unique UNIQUE (name);
