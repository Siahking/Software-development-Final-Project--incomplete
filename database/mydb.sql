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
    CONSTRAINT unique_constraint UNIQUE (worker1_id, worker2_id),  -- To prevent duplicate constraints
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