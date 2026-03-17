-- Grant user access to both dev and test databases

GRANT ALL PRIVILEGES ON asset_tracking.* TO 'asset_user'@'%';
GRANT ALL PRIVILEGES ON asset_tracking_test.* TO 'asset_user'@'%';
FLUSH PRIVILEGES;
