-- Migration: Add workflow_subscriptions table
-- Description: Allow users to subscribe to workflow instance updates

CREATE TABLE IF NOT EXISTS workflow_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  instance_id UUID NOT NULL REFERENCES workflow_instances(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, instance_id)
);

CREATE INDEX idx_subscriptions_user ON workflow_subscriptions(user_id);
CREATE INDEX idx_subscriptions_instance ON workflow_subscriptions(instance_id);

COMMENT ON TABLE workflow_subscriptions IS 'User subscriptions to workflow instances for notifications';
COMMENT ON COLUMN workflow_subscriptions.user_id IS 'User who subscribed';
COMMENT ON COLUMN workflow_subscriptions.instance_id IS 'Workflow instance being monitored';
