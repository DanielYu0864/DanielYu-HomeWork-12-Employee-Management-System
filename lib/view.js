const express = require('express');
const inquirer = require("inquirer");
const mysql = require("mysql");

const selectIdandNameFromEmployee = `SELECT id, CONCAT(first_name, ' ', last_name) AS 'name' FROM employee`;
const viewFunction = () => {
    inquirer
        .prompt({
            name: 'view',
            type: 'list',
            message: 'view options',
            choices: ['Department' ,'Role' ,'Employee' ,'View employee by manager' ,'Back']
        })
        .then((chosen) => {
            switch(chosen.view) {
                case 'Department':
                    viewDepartment();
                break;
                case 'Role':
                    viewRole();
                break;
                case 'Employee':
                    viewEmployee();
                break;
                case 'View employee by manager':
                    chooseManager();
                break;
                default:
                    mainOption();
            }
        });
}

const viewDepartment = () => {
    db.query(`SELECT id AS 'ID' ,department.name AS 'Department'
    FROM department`, function(err, res) {
        if(err) throw err;
        console.table(['ID', 'Name'] ,res);
        mainOption();
    });
}

const viewRole = () => {
    db.query(`
    SELECT
        role.id AS 'ID',
        role.title AS 'Title',
        department.name AS 'Department',
        role.salary AS 'Salary'
    FROM department
    INNER JOIN role ON department.id = role.department_id`,function(err, res) {
        if(err) throw err;
        console.table(res);
        mainOption();
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
    INNER JOIN employee c1 ON role.id = c1.role_id
    LEFT JOIN employee c2 ON c1.manager_id = c2.id
    `, function(err, res) {
        if(err) throw err;
        console.table(res);
        mainOption();
    });
}

const chooseManager = () => {
    db.query(selectIdandNameFromEmployee,
        function(err, res) {
            if(err) throw err;
            inquirer
                .prompt({
                    name: 'manager',
                    type: 'rawlist',
                    message: 'choose manager',
                    choices: () => {
                        const list = [];
                        for(let i = 0; i < res.length; i++) {
                            list.push(res[i]);
                        }
                        return list;
                    }
                })
                .then((chosen) => {
                    const managerId = findId(chosen.manager, res);
                    db.query(`SELECT id FROM employee WHERE id = ?`, managerId , function(err, res) {
                        if(err) throw err;
                        viewEmployeeByManager(res);
                    });
                });
        });

}


const viewEmployeeByManager = (manager) => {
    db.query(`
    SELECT
        employee.id AS 'ID',
        employee.first_name AS 'First Name',
        employee.last_name AS 'Last Name',
        department.name AS 'Department',
        role.title AS 'Role',
        role.salary AS 'Salary'
    FROM department
    INNER JOIN role ON department.id = role.department_id
    INNER JOIN employee ON role.id = employee.role_id
    WHERE manager_id = ?;
    `,manager[0].id , function(err, res) {
        if(err) throw err;
        console.table(res);
        mainOption();
    })
}

module.exports = viewFunction;