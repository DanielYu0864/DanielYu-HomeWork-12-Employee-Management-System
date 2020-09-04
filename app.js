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
    mainOption();
});
// prompt
const mainOption = () => {
    inquirer.prompt({
        name: 'main',
        type: 'list',
        message: 'what you want',
        choices: ['View', 'Add','Update' ,'Delete', 'End']
    })
    .then((answer) => {
        switch(answer.main) {
            case 'View':
                viewFunction();
            break;
            case 'Add':
                addFunction();
            break;
            case 'Update':
                updateFunction();
            break;
            case 'Delete':
                deleteFunction();
            break;
            default:
                console.log('End');
                db.end();
        }
    });
}

const viewFunction = () => {
    inquirer
        .prompt({
            name: 'view',
            type: 'list',
            message: 'view options',
            choices: ['Department', 'Role', 'Employee', 'Back']
        })
        .then((answer) => {
            switch(answer.view) {
                case 'Department':
                    viewDepartment();
                break;
                case 'Role':
                    viewRole();
                break;
                case 'Employee':
                    viewEmployee();
                break;
                default:
                    mainOption();
            }
        });
}

const addFunction = () => {
    inquirer
        .prompt({
            name: 'add',
            type: 'list',
            message: 'Add options',
            choices: ['Department', 'Role', 'Employee', 'Back']
        })
        .then((answer) => {
            switch(answer.add) {
                case 'Department':
                    console.log('department');
                    addDepartment();
                break;
                case 'Role':

                break;
                case 'Employee':

                break;
                default:
                    mainOption();
            }
        });
}





// Department sql functions
const viewDepartment = () => {
    db.query(`SELECT department.name AS 'Department'
    FROM department`, function(err, res) {
        if(err) throw err;
        console.log(res);
        mainOption();
    });
}
const addDepartment = () => {
    inquirer
        .prompt({
            name: 'department',
            type: 'input',
            message: 'deparment name'
        })
        .then((input) => {
            db.query(`
                INSERT INTO department (name)
                VALUES (?)
                `, input.department ,function(err, res) {
                if(err) throw err;
                console.log('add department successed');
            });
        });
}
const deleteDepartment = () => {
    db.query(`
    DELETE FROM department WHERE id = ?
    `,'department.id' ,function(err, res) {
        if(err) throw err;
        console.log('deleted department');
        mainOption();
    });
}
// role sql functions
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
        mainOption();
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
        mainOption();
    });
}
const deleteRole = () => {
    db.query(`
    DELETE FROM role WHERE id = ?
    `,'role.id' ,function(err, res) {
        if(err) throw err;
        console.log('deleted role');
        mainOption();
    });
}

// employee sql functions
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
        mainOption();
    });
}
const addEmployee = () =>{
    db.query(`
    INSERT INTO employee (first_name, last_name, role_id, manager_id)
    VALUES (?, ?, ? , ?)
    `,['first', 'last','role', 'manager'] ,function (err, res) {
        if(err) throw err;
        console.log('add employee successed');
        mainOption();
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
        mainOption();
    })
}

const deleteEmployee = () => {
    db.query(`
    DELETE FROM employee WHERE id = ?
    `, 'id', function(err, res) {
        if(err) throw err;
        if(res) console.log('delete employ successed');
        mainOption();
    });
}
