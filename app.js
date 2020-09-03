const mysql = require("mysql");
const inquirer = require("inquirer");
// const consoleTable = require("console.table");

const db = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "123",
    database: "employee_tracker_DB"
});

db.connect(function(err) {
    if(err) throw err;
   viewEmployee();
});

const viewDepartment = () => {
    db.query(`SELECT department.name AS 'Department'
    FROM department`, function(err, res) {
        if(err) throw err;
        console.log(res);
        db.end();
    });
}

const viewRole = () => {
    db.query(`
    SELECT
        role.title AS 'Title',
        department.name AS 'Department',
        role.salary AS 'Salary'
    FROM department
    INNER JOIN role ON department.id = role.department_id`,function(err, res) {
        if(err) throw err;
        console.log(res);
        db.end();
    });
}

const viewEmployee = () => {
    db.query(`
    SELECT
        c1.id AS 'ID',
        c1.first_name AS 'FirstName',
        c1.last_name AS 'LastName',
        department.name AS 'Department',
        role.title AS 'Role',
        role.salary AS 'Salary',
        CONCAT(c2.first_name, ' ', c2.last_name) AS 'Manager'
    FROM department
    INNER JOIN role ON department.id = role.department_id
    LEFT JOIN employee c1 ON role.id = c1.role_id
    LEFT JOIN employee c2 ON c1.manager_id = c2.id
    `, function(err, res) {
        if(err) throw err;
        console.log(res);
        db.end();
    })
}