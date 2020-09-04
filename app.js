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

});

const mainOption = () => {
    inquirer.prompt({
        name: 'main',
        type: 'list',
        message: 'what you want',
        choices: ['view', 'add','update' ,'delete']
    }).then((answer) => {

    });
}

const viewDepartment = () => {
    db.query(`SELECT department.name AS 'Department'
    FROM department`, function(err, res) {
        if(err) throw err;
        console.log(res);
        db.end();
    });
}

const addDepartment = () => {
    db.query(`
    INSERT INTO department (name)
    VALUES (?)
    `, 'department.name' ,function(err, res) {
        if(err) throw err;
        console.log('add department successed');
        db.end();
    });
}

const deleteDepartment = () => {
    db.query(`
    DELETE FROM department WHERE id = ?
    `,'department.id' ,function(err, res) {
        if(err) throw err;
        console.log('deleted department');
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

const addRole = () => {
    db.query(`
    INSERT INTO role (title, salary, department_id)
    VALUES(?,?,?)
    `,['role.title', 'role.salary', 'department_id'],
    function(err, res) {
        if(err) throw err;
        console.log('added Role');
        db.end();
    });
}

const deleteRole = () => {
    db.query(`
    DELETE FROM role WHERE id = ?
    `,'role.id' ,function(err, res) {
        if(err) throw err;
        console.log('deleted role');
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
    });
}

const addEmployee = () =>{
    db.query(`
    INSERT INTO employee (first_name, last_name, role_id, manager_id)
    VALUES (?, ?, ? , ?)
    `,['first', 'last','role', 'manager'] ,function (err, res) {
        if(err) throw err;
        console.log('add employee successed');
        db.end();
    });
}

const updateEmployee = () => {
    db.query(`
    UPDATE employee
    SET role_id = ?
    WHERE id = ?;
    `, ['role_id','employee.id'], function(err, res) {
        if(err) throw err;
        console.log('updated employee');
        db.end();
    })
}

const deleteEmployee = () => {
    db.query(`
    DELETE FROM employee WHERE id = ?
    `, 'id', function(err, res) {
        if(err) throw err;
        if(res) console.log('delete employ successed');
        db.end();
    });
}
