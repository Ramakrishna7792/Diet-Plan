CREATE TABLE calorielog ( 
    id INT NOT NULL AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    food_items TEXT NULL,
    total_calories INT NULL,
    breakfast_calories INT,
    lunch_calories INT,
    dinner_calories INT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);
