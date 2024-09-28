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
    location_id INT,
    FOREIGN KEY (location_id) REFERENCES locations(id)
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
INSERT INTO workers (first_name,last_name,middle_name,gender,address,contact,age)
VALUES
    ('John','Doe',NULL,'Male',"123 Main Street", "1234567890",19),
    ('Sammy','Smith',"John","Male","123 Frederick Street", "1234567890",29),
    ('Isiah','Fereton',NULL,"Male","123 King Street", "1234567890",45);

--@block
SELECT * FROM workers;

--@block
SELECT id, location FROM locations WHERE location = "Moriah";

--@block
DELETE FROM locations;
ALTER TABLE locations AUTO_INCREMENT = 1;

--@block
DELETE FROM workers;
ALTER TABLE workers AUTO_INCREMENT = 1;

--@block
INSERT INTO workers (first_name,last_name,middle_name,gender,address,contact,age)
VALUES
    ('Mary','Doe','Jasmine','Female',"123 Main Street", "1234567890",19);
