# ==========================
# TABLE DEFINITIONS
# ==========================
DROP TABLE IF EXISTS organizations;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS assets;
DROP TABLE IF EXISTS asset_assignments;

CREATE TABLE organizations 
(
    organization_id     INT NOT NULL AUTO_INCREMENT,
    organization_name   VARCHAR(255) NOT NULL UNIQUE,
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (organization_id)
);

CREATE TABLE users 
(
    user_id             INT NOT NULL AUTO_INCREMENT,
    user_name           VARCHAR(255) NOT NULL,
    email               VARCHAR(255) NOT NULL UNIQUE,
    password            VARCHAR(255) NOT NULL,
    organization_id     INT NOT NULL,
    user_type           VARCHAR(100) NOT NULL,
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id),
    FOREIGN KEY (organization_id) REFERENCES organizations(organization_id)
);

CREATE TABLE assets 
(
    asset_id            INT NOT NULL AUTO_INCREMENT,
    asset_name          VARCHAR(255) NOT NULL,
    asset_type          VARCHAR(100) NOT NULL,
    asset_status        VARCHAR(100) NOT NULL,
    serial_number       VARCHAR(255) NOT NULL,
    organization_id     INT NOT NULL,
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (asset_id),
    FOREIGN KEY (organization_id) REFERENCES organizations(organization_id),
    UNIQUE KEY  (serial_number, organization_id)
);

CREATE TABLE asset_assignments 
(
    asset_assignment_id     INT NOT NULL AUTO_INCREMENT,
    asset_id                INT NOT NULL,
    assigned_user_id        INT NOT NULL,
    created_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active               TINYINT DEFAULT 0,
    PRIMARY KEY (asset_assignment_id),
    FOREIGN KEY (asset_id) REFERENCES assets(asset_id),
    FOREIGN KEY (assigned_user_id) REFERENCES users(user_id)
);

# ==========================
# SAMPLE DATA
# ==========================
INSERT INTO organizations (organization_name)
VALUES 
('Company A'),
('Company B'),
('Company C');

INSERT INTO users (user_name, email, password, user_type, organization_id)
VALUES 
-- password used hashed value, original value secreT124!
('User A', 'usera@yopmail.com', '$2b$10$uiz6selEi7mUn0w6mrMsq.nTkFu1NSWsQ9NNvZM6CeGEXVBNtBxz.', 'admin', 1),
('User B', 'userb@yopmail.com', '$2b$10$uiz6selEi7mUn0w6mrMsq.nTkFu1NSWsQ9NNvZM6CeGEXVBNtBxz.', 'member', 1),
('User C', 'userc@yopmail.com', '$2b$10$uiz6selEi7mUn0w6mrMsq.nTkFu1NSWsQ9NNvZM6CeGEXVBNtBxz.', 'member', 1);

INSERT INTO assets (asset_name, asset_type, asset_status, serial_number, organization_id) 
VALUES
('Laptop Dell XPS', 'device', 'available', 'DLLXPS2024001', 1),
('Laptop HP Elitebook', 'device', 'in-use', 'HPELT2024001', 1),
('Mouse Logitech', 'equipment', 'available', 'LGTMSE2024001', 1);

INSERT INTO asset_assignments (asset_id, assigned_user_id, is_active)
VALUES 
(1, 1, 1),
(1, 2, 0),
(1, 3, 0);
