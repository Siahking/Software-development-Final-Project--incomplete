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
    id INT PRIMARY KEY AUTO_INCREMENT,
    worker_id INT,
    location_id INT,
    FOREIGN KEY (worker_id) REFERENCES workers(id),
    FOREIGN KEY (location_id) REFERENCES locations(id),
    UNIQUE (worker_id, location_id)
);

--@block
CREATE TABLE days_off(
    break_id INT PRIMARY KEY AUTO_INCREMENT,
    worker_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    FOREIGN KEY (worker_id) REFERENCES workers(id)
);

--@block
CREATE TABLE worker_constraints (
    id INT AUTO_INCREMENT PRIMARY KEY,
    worker1_id INT NOT NULL,
    worker2_id INT NOT NULL,
    note TEXT,
    UNIQUE (worker1_id, worker2_id),  -- To prevent duplicate constraints
    FOREIGN KEY (worker1_id) REFERENCES workers(id),
    FOREIGN KEY (worker2_id) REFERENCES workers(id)
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
SELECT * FROM workers WHERE id IN (4,11)

--@block
SELECT * FROM workers;

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
INSERT INTO worker_constraints (worker1_id,worker2_id,note)
VALUES (1,2,"Hate each other");

--@block
ALTER TABLE days_off ADD CONSTRAINT unique_worker_days UNIQUE (worker_id, start_date,end_date);

--@block
SELECT * FROM worker_locations;
