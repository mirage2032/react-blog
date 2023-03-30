CREATE TABLE users
(
    user_uid   CHAR(37)     NOT NULL PRIMARY KEY,
    username   VARCHAR(50)  NOT NULL UNIQUE,
    password   CHAR(64)     NOT NULL,
    email      VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TRIGGER create_user_uid
    BEFORE INSERT
    ON users
    FOR EACH ROW SET NEW.user_uid = UUID();

CREATE TABLE posts
(
    post_uid   CHAR(37)            NOT NULL PRIMARY KEY,
    user_uid   CHAR(37)            NOT NULL,
    content    TEXT                NOT NULL,
    category   ENUM ('buy','sell') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (user_uid)
        REFERENCES users (user_uid)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TRIGGER create_post_uid
    BEFORE INSERT
    ON posts
    FOR EACH ROW SET NEW.post_uid = UUID();

CREATE TABLE post_votes
(
    id         INT PRIMARY KEY AUTO_INCREMENT,
    user_uid   CHAR(37)                                                        NOT NULL,
    post_uid   CHAR(37)                                                        NOT NULL,
    vote_type  ENUM ('up','down')                                              NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (user_uid)
        REFERENCES users (user_uid)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (post_uid)
        REFERENCES posts (post_uid)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT votelimit UNIQUE (user_uid, post_uid)
)