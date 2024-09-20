-- @block
CREATE TABLE locations(
    id INT PRIMARY KEY AUTO_INCREMENT,
    location VARCHAR(255) NOT NULL
);

-- @block
CREATE Table workers(
    id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    middle_name VARCHAR(255),
    gender VARCHAR(6),
    address TEXT NOT NULL,
    contact VARCHAR(15),
    age INT
);

--@block
CREATE TABLE worker_locations(
    worker_id INT,
    location_id INT,
    FOREIGN KEY (worker_id) REFERENCES workers(id),
    FOREIGN KEY (location_id) REFERENCES locations(id),
    PRIMARY KEY (worker_id, location_id)
);

--@block
INSERT INTO locations (location)
VALUES
    ('Moriah'),
    ('Scarborough'),
    ('Castara');

--@block
SELECT id, location FROM locations WHERE id = 1;

--@block
SELECT id, location FROM locations WHERE location = "Moriah";