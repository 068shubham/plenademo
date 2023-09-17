--liquibase formatted sql

--changeset demo:main_1.1 labels:main_tables
CREATE TABLE demo_babynames
(
    id            SERIAL PRIMARY KEY,
    first_name    VARCHAR(255) NOT NULL,
    gender        CHAR(1) NOT NULL,
    birth_year    INTEGER NOT NULL,
    phone_number  INTEGER NOT NULL,
    created_at    TIMESTAMP WITHOUT TIME ZONE DEFAULT (now())
);
--rollback DROP TABLE demo_babynames;
