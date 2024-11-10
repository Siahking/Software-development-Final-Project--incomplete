--@block
CREATE TABLE locations(
    id INT PRIMARY KEY AUTO_INCREMENT,
    location VARCHAR(255) NOT NULL
);

--@block
CREATE Table workers(
    id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    middle_name VARCHAR(255),
    gender VARCHAR(6),
    address TEXT NOT NULL,
    contact VARCHAR(15),
    age INT NOT NULL,
    id_number INT UNIQUE NOT NULL
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
CREATE TABLE days_off(
    break_id INT PRIMARY KEY AUTO_INCREMENT,
    worker_id INT NOT NULL,
    dates JSON NOT NULL,
    FOREIGN KEY (worker_id) REFERENCES workers(id)
);

--@block
CREATE TABLE worker_constraints (
    constraint_id INT PRIMARY KEY AUTO_INCREMENT,
    group_id INT NOT NULL,
    worker_id INT NOT NULL,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (worker_id) REFERENCES workers(id)
);

--@block
INSERT INTO locations (location)
VALUES
    ('Moriah'),
    ('Scarborough'),
    ('Castara');

--@block
INSERT INTO workers (first_name,last_name,middle_name,gender,address,contact,age,id_number)
VALUES
    ('John','Doe',NULL,'Male',"123 Main Street", "1234567890",19,1738),
    ('Sammy','Smith',"John","Male","123 Frederick Street", "1234567890",29,32842),
    ('Isiah','Fereton',NULL,"Male","123 King Street", "1234567890",45,232424);

--@block
SELECT * FROM locations WHERE id = 2;

--@block
SELECT * FROM workers WHERE id = 1;

--@block
SELECT * FROM worker_locations

--@block
DELETE FROM locations;
ALTER TABLE locations AUTO_INCREMENT = 1;

--@block
DELETE FROM workers;
ALTER TABLE workers AUTO_INCREMENT = 1;

--@block
INSERT INTO workers (first_name,last_name,middle_name,gender,address,contact,age)
VALUES
    ('Jerry','king','Mason','Male',"123 new yorl", "1234567890",34);

--@block
DROP TABLE IF EXISTS worker_locations;
DROP TABLE IF EXISTS workers;

--@block
SELECT * FROM workers WHERE id_number = 987890;