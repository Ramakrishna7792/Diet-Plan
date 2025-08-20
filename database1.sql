CREATE TABLE diet_plan1 (
    id INT AUTO_INCREMENT PRIMARY KEY,    -- id as primary key
    email VARCHAR(255) UNIQUE,            -- email as unique key
    name  VARCHAR(255),
    age INT,
    height INT,
    currentWeight FLOAT,
    goalWeight FLOAT,
    gender VARCHAR(10),
    goalType VARCHAR(10),
    duration INT,
    targetCalories INT
);
