DROP DATABASE IF EXISTS employee_tracker_DB;
CREATE DATABASE employee_tracker_DB;
USE employee_tracker_DB;

CREATE TABLE department (
	id INT AUTO_INCREMENT,
    PRIMARY KEY (id),
    name VARCHAR (30) NOT NULL
);

CREATE TABLE role (
	id INT AUTO_INCREMENT,
    PRIMARY KEY (id),
    title VARCHAR(30) NOT NULL,
    salary DEC NOT NULL,
    department_id INT NOT NULL,
    FOREIGN KEY (department_id) REFERENCES department(id)
);

CREATE TABLE employee (
	id INT AUTO_INCREMENT,
    PRIMARY KEY (id),
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30) NOT NULL,
    role_id INT NOT NULL,
    FOREIGN KEY (role_id) REFERENCES role(id),
    manager_id INT REFERENCES id
);

SELECT * FROM department;
-- add department
INSERT INTO department (name)
VALUES ('Boss'), ('Sales'), ('Engineering');

SELECT * FROM role;
-- add role
INSERT INTO role (title, salary, department_id)
VALUES('Boss', 0, 1),  ('Sales Lead', 100000, 2),  ('Lead Engineer', 150000, 3);


SELECT * FROM employee;
-- add employee
INSERT INTO employee (first_name, last_name, role_id)
VALUES('Dan', 'Yu', 1);
INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ('Becky', 'Moon', 2 , 1), ('Ashleigh', ' Mendez', 3, 1);

-- View department
SELECT department.name AS 'Department'
FROM department;

-- View role
SELECT 
	role.title AS 'Title',
	department.name AS 'Department',
    role.salary AS 'Salary'
FROM department
INNER JOIN role ON department.id = role.department_id;

-- View employee and manager
SELECT 
	c1.id AS 'ID',
	c1.first_name AS 'First Name',
    c1.last_name AS 'Last Name',
    CONCAT(c2.first_name, ' ', c2.last_name) AS 'Manager'
FROM employee c1
INNER JOIN employee c2 ON c1.manager_id = c2.id;

-- View employee
SELECT 
	c1.id AS 'ID',
	c1.first_name AS 'First Name',
    c1.last_name AS 'Last Name',
	department.name AS 'Department',
    role.title AS 'Role',
    role.salary AS 'Salary',
	CONCAT(c2.first_name, ' ', c2.last_name) AS 'Manager'
FROM department
INNER JOIN role ON department.id = role.department_id
LEFT JOIN employee c1 ON role.id = c1.role_id
LEFT JOIN employee c2 ON c1.manager_id = c2.id;

SELECT 
	*
FROM employee
GROUP BY id;

-- View employee by department, manager 
SELECT 
	c1.id AS 'ID',
	c1.first_name AS 'First Name',
    c1.last_name AS 'Last Name',
	department.name AS 'Department',
    role.title AS 'Role',
    role.salary AS 'Salary',
	CONCAT(c2.first_name, ' ', c2.last_name) AS 'Manager'
FROM department
INNER JOIN role ON department.id = role.department_id
LEFT JOIN employee c1 ON role.id = c1.role_id
LEFT JOIN employee c2 ON c1.manager_id = c2.id
WHERE department.id = 2;
-- WHERE c1.manager_id = 1; 



-- update employee role and manager
UPDATE employee
SET role_id = 2,
	manager_id = 1
WHERE id = 2;

-- delete employee, role, department
DELETE FROM employee WHERE id = 2;
DELETE FROM role WHERE id = 2;
DELETE FROM department WHERE id = 2;





