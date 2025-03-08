--@block
CREATE TABLE locations(
    id INT PRIMARY KEY AUTO_INCREMENT,
    location VARCHAR(255) NOT NULL UNIQUE
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
    id_number INT UNIQUE NOT NULL,
    availability ENUM("Day","Night","Eclipse","Specified") NOT NULL,
    hours JSON NOT NULL
);

--@block
CREATE TABLE worker_locations(
    id INT PRIMARY KEY AUTO_INCREMENT,
    worker_id INT,
    location_id INT,
    FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE,
    UNIQUE (worker_id, location_id)
);

--@block
CREATE TABLE days_off(
    break_id INT PRIMARY KEY AUTO_INCREMENT,
    worker_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE,
    CHECK (start_date <= end_date)
);

--@block
CREATE TABLE worker_constraints (
    id INT AUTO_INCREMENT PRIMARY KEY,
    worker1_id INT NOT NULL,
    worker2_id INT NOT NULL,
    note TEXT,
    UNIQUE (worker1_id, worker2_id),  -- To prevent duplicate constraints
    FOREIGN KEY (worker1_id) REFERENCES workers(id) ON DELETE CASCADE,
    FOREIGN KEY (worker2_id) REFERENCES workers(id) ON DELETE CASCADE
);

--@block
CREATE TABLE permanent_restrictions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    worker_id INT NOT NULL,
    day_of_week ENUM('Any','Sunday','Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday','Saturday') DEFAULT 'Any',
    start_time TIME NULL,
    end_time TIME NULL,
    FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE,
    CONSTRAINT unique_unavailability UNIQUE (worker_id, day_of_week, start_time, end_time)
);

--@block
INSERT INTO locations (location)
VALUES
    ('Moriah'),
    ('Scarborough'),
    ('Castara');

--@block
INSERT INTO workers (first_name,last_name,middle_name,gender,address,contact,age,id_number,availability,hours)
VALUES
    ('John','Doe',NULL,'Male',"123 Main Street", "1234567890",19,1738,'Day',JSON_ARRAY("6am-2pm","6am-6pm")),
    ('Sammy','Smith',"John","Male","123 Frederick Street", "1234567890",29,32842,"Night",JSON_ARRAY("10pm-6am","6pm-6am")),
    ('Isiah','Fereton',NULL,"Male","123 King Street", "1234567890",45,232424,"Specified",JSON_ARRAY("2pm-10pm","6am-6pm"));

--@block
SELECT * FROM locations;

--@block
SELECT * FROM days_off;

--@block
SELECT * FROM workers;

--@block
DELETE FROM locations;
ALTER TABLE locations AUTO_INCREMENT = 1;

--@block
DELETE FROM workers;
ALTER TABLE workers AUTO_INCREMENT = 1;

--@block
ALTER TABLE days_off ADD CONSTRAINT unique_worker_days UNIQUE (worker_id, start_date,end_date);

--@block
ALTER TABLE workers 
MODIFY COLUMN availability ENUM("Day", "Night", "Eclipse", "Specified") NOT NULL;

--@block
DROP TABLE permanent_restrictions;

--@block
DELETE FROM permanent_restrictions;
ALTER TABLE permanent_restrictions SET AUTO_INCREMENT = 1;