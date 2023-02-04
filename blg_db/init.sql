CREATE TABLE users (
                       username VARCHAR(50) NOT NULL UNIQUE,
                       password CHAR(64) NOT NULL,
                       email VARCHAR(255) NOT NULL UNIQUE,
                       user_uid CHAR(37) NOT NULL PRIMARY KEY,
                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER users_create_uid
    BEFORE INSERT ON users
    FOR EACH ROW SET NEW.user_uid = UUID();

CREATE TABLE posts (
                       id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
                       content TEXT NOT NULL,
                       user_uid CHAR(37) NOT NULL,
                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                       CONSTRAINT fk_user_uid
                           FOREIGN KEY (user_uid)
                               REFERENCES users(user_uid)
                               ON DELETE CASCADE
                               ON UPDATE CASCADE
);

