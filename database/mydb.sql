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
ALTER TABLE workers 
MODIFY COLUMN availability ENUM("Day", "Night", "Eclipse", "Specified") NOT NULL;

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
ALTER TABLE days_off ADD CONSTRAINT unique_worker_days UNIQUE (worker_id, start_date,end_date);

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
CREATE TABLE occupancy (
    id INT AUTO_INCREMENT PRIMARY KEY,
    worker_id INT NOT NULL,
    event_date DATE NOT NULL,
    note TEXT,
    FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE,
    CONSTRAINT unique_occupancy UNIQUE (worker_id,event_date)
);

--@block
SELECT * FROM locations;

--@block
SELECT * FROM days_off;

--@block
SELECT * FROM workers;

--@block
SELECT * FROM worker_locations WHERE location_id = 2;

--@block
SELECT * FROM permanent_restrictions;

--@block
SELECT * FROM occupancy;

--@block
DELETE FROM permanent_restrictions;
ALTER TABLE permanent_restrictions AUTO_INCREMENT = 1;

--@block
DELETE FROM locations;
ALTER TABLE locations AUTO_INCREMENT = 1;

--@block
DELETE FROM days_off;
ALTER TABLE days_off AUTO_INCREMENT = 1;

--@block
DELETE FROM workers;
ALTER TABLE workers AUTO_INCREMENT = 1;
ALTER TABLE worker_locations AUTO_INCREMENT = 1;

--@block
DROP TABLE permanent_restrictions;

--@block
DELETE FROM permanent_restrictions;
ALTER TABLE permanent_restrictions AUTO_INCREMENT = 1;

--@block
SELECT * FROM worker_constraints;

--@block
INSERT INTO workers (first_name, last_name, middle_name, gender, address, contact, age, id_number, availability, hours) VALUES
('James', 'Anderson', NULL, 'Male', '123 Oak St', '555-1111', 28, 20001, 'Day', JSON_ARRAY('6am-2pm', '6am-6pm')),
('Sophia', 'Brown', 'Marie', 'Female', '456 Pine St', '555-2222', 35, 20002, 'Night', JSON_ARRAY('6pm-6am', '10pm-6am')),
('Michael', 'Carter', 'John', 'Male', '789 Cedar St', '555-3333', 30, 20003, 'Eclipse', JSON_ARRAY('24hrs')),
('Olivia', 'Davis', NULL, 'Female', '101 Maple St', '555-4444', 26, 20004, 'Specified', JSON_ARRAY('2pm-10pm', '10pm-6am')),
('William', 'Evans', 'Lee', 'Male', '202 Birch St', '555-5555', 45, 20005, 'Day', JSON_ARRAY('6am-2pm', '6am-6pm')),
('Emma', 'Foster', NULL, 'Female', '303 Elm St', '555-6666', 27, 20006, 'Night', JSON_ARRAY('6pm-6am', '10pm-6am')),
('David', 'Garcia', 'Ray', 'Male', '404 Redwood St', '555-7777', 33, 20007, 'Eclipse', JSON_ARRAY('24hrs')),
('Ava', 'Harris', NULL, 'Female', '505 Spruce St', '555-8888', 29, 20008, 'Specified', JSON_ARRAY('10pm-6am')),
('Noah', 'Iverson', 'James', 'Male', '606 Poplar St', '555-9999', 38, 20009, 'Day', JSON_ARRAY('6am-2pm', '6am-6pm')),
('Liam', 'Jackson', NULL, 'Male', '707 Fir St', '555-1010', 32, 20010, 'Night', JSON_ARRAY('6pm-6am', '10pm-6am')),
('Ella', 'Johnson', 'Rose', 'Female', '808 Pine St', '555-1112', 29, 20011, 'Day', JSON_ARRAY('6am-2pm', '6am-6pm')),
('Mason', 'Martinez', NULL, 'Male', '909 Cedar St', '555-2223', 36, 20012, 'Night', JSON_ARRAY('6pm-6am', '10pm-6am')),
('Lucas', 'Nelson', 'Paul', 'Male', '1010 Birch St', '555-3334', 31, 20013, 'Eclipse', JSON_ARRAY('24hrs')),
('Mia', 'Owens', NULL, 'Female', '1111 Elm St', '555-4445', 27, 20014, 'Specified', JSON_ARRAY('2pm-10pm', '10pm-6am')),
('Daniel', 'Perez', 'Scott', 'Male', '1212 Maple St', '555-5556', 42, 20015, 'Day', JSON_ARRAY('6am-2pm', '6am-6pm')),
('Grace', 'Quinn', NULL, 'Female', '1313 Oak St', '555-6667', 25, 20016, 'Night', JSON_ARRAY('6pm-6am', '10pm-6am')),
('Henry', 'Reed', 'Louis', 'Male', '1414 Spruce St', '555-7778', 37, 20017, 'Eclipse', JSON_ARRAY('24hrs')),
('Zoe', 'Stewart', NULL, 'Female', '1515 Redwood St', '555-8889', 30, 20018, 'Specified', JSON_ARRAY('10pm-6am')),
('Ethan', 'Thompson', 'Alex', 'Male', '1616 Poplar St', '555-9990', 40, 20019, 'Day', JSON_ARRAY('6am-2pm', '6am-6pm')),
('Amelia', 'Upton', NULL, 'Female', '1717 Fir St', '555-1011', 33, 20020, 'Night', JSON_ARRAY('6pm-6am', '10pm-6am')),
('Isabella', 'White', NULL, 'Female', '1801 Pine Rd', '555-1212', 31, 20021, 'Day', JSON_ARRAY('6am-2pm', '6am-6pm')),
('Benjamin', 'Young', 'Charles', 'Male', '1902 Cedar Ln', '555-1313', 28, 20022, 'Night', JSON_ARRAY('6pm-6am', '10pm-6am')),
('Charlotte', 'Adams', NULL, 'Female', '2003 Birch Ave', '555-1414', 35, 20023, 'Eclipse', JSON_ARRAY('24hrs')),
('Oliver', 'Wright', NULL, 'Male', '2104 Elm St', '555-1515', 29, 20024, 'Specified', JSON_ARRAY('2pm-10pm', '10pm-6am')),
('Elijah', 'Hill', 'Daniel', 'Male', '2205 Maple Dr', '555-1616', 42, 20025, 'Day', JSON_ARRAY('6am-2pm', '6am-6pm')),
('Scarlett', 'Green', NULL, 'Female', '2306 Oak St', '555-1717', 26, 20026, 'Night', JSON_ARRAY('6pm-6am', '10pm-6am')),
('Jameson', 'Baker', 'Robert', 'Male', '2407 Redwood Rd', '555-1818', 33, 20027, 'Eclipse', JSON_ARRAY('24hrs')),
('Victoria', 'King', NULL, 'Female', '2508 Spruce Ln', '555-1919', 30, 20028, 'Specified', JSON_ARRAY('10pm-6am')),
('Sebastian', 'Lopez', 'Joseph', 'Male', '2609 Poplar Ave', '555-2020', 38, 20029, 'Day', JSON_ARRAY('6am-2pm', '6am-6pm')),
('Madison', 'Moore', NULL, 'Female', '2710 Fir St', '555-2121', 32, 20030, 'Night', JSON_ARRAY('6pm-6am', '10pm-6am')),
('Owen', 'Taylor', 'George', 'Male', '2811 Pine Rd', '555-2224', 29, 20031, 'Day', JSON_ARRAY('6am-2pm', '6am-6pm')),
('Penelope', 'Anderson', NULL, 'Female', '2912 Cedar Ln', '555-2323', 36, 20032, 'Night', JSON_ARRAY('6pm-6am', '10pm-6am')),
('Carter', 'Thomas', 'John', 'Male', '3013 Birch Ave', '555-2424', 31, 20033, 'Eclipse', JSON_ARRAY('24hrs')),
('Layla', 'Jackson', NULL, 'Female', '3114 Elm St', '555-2525', 27, 20034, 'Specified', JSON_ARRAY('2pm-10pm', '10pm-6am')),
('Julian', 'White', 'William', 'Male', '3215 Maple Dr', '555-2626', 42, 20035, 'Day', JSON_ARRAY('6am-2pm', '6am-6pm')),
('Lily', 'Harris', NULL, 'Female', '3316 Oak St', '555-2727', 25, 20036, 'Night', JSON_ARRAY('6pm-6am', '10pm-6am')),
('Gabriel', 'Martin', 'David', 'Male', '3417 Redwood Rd', '555-2828', 37, 20037, 'Eclipse', JSON_ARRAY('24hrs')),
('Aria', 'Thompson', NULL, 'Female', '3518 Spruce Ln', '555-2929', 30, 20038, 'Specified', JSON_ARRAY('10pm-6am')),
('Lincoln', 'Garcia', 'James', 'Male', '3619 Poplar Ave', '555-3030', 40, 20039, 'Day', JSON_ARRAY('6am-2pm', '6am-6pm')),
('Nora', 'Martinez', NULL, 'Female', '3720 Fir St', '555-3131', 33, 20040, 'Night', JSON_ARRAY('6pm-6am', '10pm-6am')),
('Grayson', 'Robinson', 'Michael', 'Male', '3821 Pine Rd', '555-3232', 31, 20041, 'Day', JSON_ARRAY('6am-2pm', '6am-6pm')),
('Hazel', 'Clark', NULL, 'Female', '3922 Cedar Ln', '555-3335', 28, 20042, 'Night', JSON_ARRAY('6pm-6am', '10pm-6am')),
('Mateo', 'Rodriguez', 'Joseph', 'Male', '4023 Birch Ave', '555-3434', 35, 20043, 'Eclipse', JSON_ARRAY('24hrs')),
('Eleanor', 'Lewis', NULL, 'Female', '4124 Elm St', '555-3535', 29, 20044, 'Specified', JSON_ARRAY('2pm-10pm', '10pm-6am')),
('Samuel', 'Lee', 'Daniel', 'Male', '4225 Maple Dr', '555-3636', 42, 20045, 'Day', JSON_ARRAY('6am-2pm', '6am-6pm')),
('Stella', 'Walker', NULL, 'Female', '4326 Oak St', '555-3737', 26, 20046, 'Night', JSON_ARRAY('6pm-6am', '10pm-6am')),
('Josiah', 'Hall', 'Robert', 'Male', '4427 Redwood Rd', '555-3838', 33, 20047, 'Eclipse', JSON_ARRAY('24hrs')),
('Violet', 'Allen', NULL, 'Female', '4528 Spruce Ln', '555-3939', 30, 20048, 'Specified', JSON_ARRAY('10pm-6am')),
('Christopher', 'Young', 'George', 'Male', '4629 Poplar Ave', '555-4040', 38, 20049, 'Day', JSON_ARRAY('6am-2pm', '6am-6pm')),
('Audrey', 'Hernandez', NULL, 'Female', '4730 Fir St', '555-4141', 32, 20050, 'Night', JSON_ARRAY('6pm-6am', '10pm-6am')),
('David', 'Cook', 'John', 'Male', '4831 Pine Rd', '555-4242', 29, 20051, 'Day', JSON_ARRAY('6am-2pm', '6am-6pm')),
('Addison', 'Bailey', NULL, 'Female', '4932 Cedar Ln', '555-4343', 36, 20052, 'Night', JSON_ARRAY('6pm-6am', '10pm-6am')),
('Joseph', 'Nelson', 'William', 'Male', '5033 Birch Ave', '555-4446', 31, 20053, 'Eclipse', JSON_ARRAY('24hrs'));

INSERT INTO worker_locations (worker_id, location_id)
SELECT w.id, 
       (SELECT id FROM locations ORDER BY RAND() LIMIT 1) 
FROM workers w;

-- INSERT INTO worker_locations (worker_id, location_id)
-- SELECT w.id, 
--     (SELECT id FROM locations WHERE locations.id = 1)
-- FROM workers w;

--@block
INSERT INTO occupancy(worker_id,event_date,note) VALUES 
(1,'2025-10-21',"day-off");

--@block
SELECT 
    pr.id AS ID,
    w.first_name AS first_name,
    w.last_name AS last_name,
    pr.day_of_week AS day_of_week,
    pr.start_time AS start_time,
    pr.end_time AS end_time
FROM    permanent_restrictions as pr
JOIN    workers as w ON pr.worker_id = w.id;

--@block
SELECT w.* FROM workers w JOIN worker_locations wl ON w.id = wl.worker_id WHERE wl.location_id = 1;