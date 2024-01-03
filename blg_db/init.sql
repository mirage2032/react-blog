CREATE TABLE StudentGroups
(
    id       INT NOT NULL PRIMARY KEY,
    faculty  VARCHAR(255),
    year     INT,
    subgroup INT
);

CREATE TABLE Accounts
(
    id       INT NOT NULL PRIMARY KEY,
    username VARCHAR(255),
    password VARCHAR(255),
    role     ENUM ('admin', 'teacher', 'student')
);

CREATE TABLE Students
(
    id         INT NOT NULL PRIMARY KEY,
    name       VARCHAR(255),
    surname    VARCHAR(255),
    group_id   INT,
    account_id INT,
    FOREIGN KEY (group_id) REFERENCES StudentGroups (id),
    FOREIGN KEY (account_id) REFERENCES Accounts (id)
);

CREATE TABLE Teachers
(
    id         INT NOT NULL PRIMARY KEY,
    name       VARCHAR(255),
    surname    VARCHAR(255),
    account_id INT,
    FOREIGN KEY (account_id) REFERENCES Accounts (id)
);

CREATE TABLE Subjects
(
    id         INT NOT NULL PRIMARY KEY,
    name       VARCHAR(255),
    id_group   INT,
    id_teacher INT,
    FOREIGN KEY (id_group) REFERENCES StudentGroups (id),
    FOREIGN KEY (id_teacher) REFERENCES Teachers (id)
);

CREATE TABLE Subject_timetable
(
    id         INT NOT NULL PRIMARY KEY,
    id_subject INT,
    start      TIMESTAMP,
    end        TIMESTAMP,
    FOREIGN KEY (id_subject) REFERENCES Subjects (id)
);


CREATE TABLE users
(
    user_uid   CHAR(37)                            NOT NULL PRIMARY KEY,
    username   VARCHAR(50)                         NOT NULL UNIQUE,
    password   CHAR(64)                            NOT NULL,
    email      VARCHAR(255)                        NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TRIGGER create_user_uid
    BEFORE INSERT
    ON users
    FOR EACH ROW SET NEW.user_uid = UUID();

CREATE TABLE posts
(
    post_uid   CHAR(37)                            NOT NULL PRIMARY KEY,
    user_uid   CHAR(37)                            NOT NULL,
    content    TEXT                                NOT NULL,
    category   ENUM ('buy','sell')                 NOT NULL,
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
);
