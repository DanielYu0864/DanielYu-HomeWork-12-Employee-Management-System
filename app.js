const mysql = require("mysql");
const inquirer = require("inquirer");
const consoleTable = require("console.table");
// const express = require('express');

// const viewFunction = require('./lib/view');
const roleObj = [];
const employeeObj = [];
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
    .then((chosen) => {
        switch(chosen.main) {
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
const selectIdandNameFromEmployee = `SELECT id, CONCAT(first_name, ' ', last_name) AS 'name' FROM employee`;
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


const addFunction = () => {
    inquirer
        .prompt({
            name: 'add',
            type: 'list',
            message: 'Add options',
            choices: ['Department', 'Role', 'Employee', 'Back']
        })
        .then((chosen) => {
            switch(chosen.add) {
                case 'Department':
                    addDepartment();
                break;
                case 'Role':
                    addRole();
                break;
                case 'Employee':
                    addEmployee();
                break;
                default:
                    mainOption();
            }
        });
}

const deleteFunction = () => {
    inquirer
        .prompt({
            name: 'delete',
            type: 'list',
            message: 'delete options',
            choices: ['Department', 'Role', 'Employee', 'Back']
        })
        .then((chosen) => {
            switch(chosen.delete) {
                case 'Department':
                    deleteDepartment();
                break;
                case 'Role':
                    deleteRole();
                break;
                case 'Employee':
                    deleteEmployee();
                break;
                default:
                    mainOption();
            }

        })
        .catch((err) => err);
}

const updateFunction = () => {
    inquirer
        .prompt({
            name: 'update',
            type: 'list',
            message: 'Update Employee option',
            choices: ['Employee Role', 'Employee Manager', 'Back']
        })
        .then((chosen) => {
            switch(chosen.update) {
                case 'Employee Role':
                    updateEmployeeRole();
                break;
                case 'Employee Manager':
                    updateEmployeeManager();
                break;
                default:
                    mainOption();
            }
        })
        .catch(err => err);
}

const updateEmployeeRole = () => {
    db.query(`SELECT id,
    CONCAT(first_name, ' ', last_name) AS 'name'
    FROM employee`, function(err, res) {
        if(err) throw err;
        inquirer
            .prompt({
                name: 'employee',
                type: 'rawlist',
                message: 'choose employee to update role',
                choices: () => {
                    const list = [];
                    for(let i = 0; i < res.length; i++) {
                        list.push(res[i]);
                    }
                    return list;
                }
            })
            .then((chosen) => {
                // console.log(chosen);
                const employeeId = findId(chosen.employee, res);
                // console.log(EmployeeId);
                db.query(`SELECT id, title AS 'name' FROM role`, function(err, res) {
                    if(err) throw err;
                    inquirer
                        .prompt({
                            name: 'role',
                            type: 'rawlist',
                            message: 'choose role to update',
                            choices: () => {
                                const list = [];
                                for(let i = 0; i < res.length; i++) {
                                    list.push(res[i]);
                                }
                                return list;
                            }
                        }).then((chosen) => {
                            console.log(chosen);
                            const roleId = findId(chosen.role, res);
                            console.log(roleId);
                                db.query(`
                                    UPDATE employee
                                    SET role_id = ?
                                    WHERE id = ?;
                                    `, [roleId ,employeeId], function(err, res) {
                                        if(err) throw err;
                                        console.log('updated employee');
                                        mainOption();
                                })
                        }).catch(err => err);
                }); // query end
            }) // then
            .catch(err => err);
    });

}



const updateEmployeeManager = () => {
    db.query(selectIdandNameFromEmployee, function(err, res) {
        if(err) throw err;
        inquirer
            .prompt({
                name: 'employee',
                type: 'rawlist',
                message: 'choose employee to update manager',
                choices: () => {
                    const list = [];
                    for(let i = 0; i < res.length; i++) {
                        list.push(res[i]);
                    }
                    return list;
                }
            })
            .then((chosen) => {
                // console.log(chosen);
                const employeeId = findId(chosen.employee, res);
                // console.log(EmployeeId);
                db.query(selectIdandNameFromEmployee, function(err, res) {
                    if(err) throw err;
                    inquirer
                        .prompt({
                            name: 'manager',
                            type: 'rawlist',
                            message: 'choose manager to update',
                            choices: () => {
                                const list = [];
                                for(let i = 0; i < res.length; i++) {
                                    list.push(res[i]);
                                }
                                return list;
                            }
                        }).then((chosen) => {
                            // console.log(chosen);
                            const managerId = findId(chosen.manager, res);
                            // console.log(managerId);
                                db.query(`
                                    UPDATE employee
                                    SET manager_id = ?
                                    WHERE id = ?;
                                    `, [managerId ,employeeId], function(err, res) {
                                        if(err) throw err;
                                        console.log('updated employee');
                                        mainOption();
                                })
                        }).catch(err => err);
                }); // query end
            }) // then
            .catch(err => err);
    });
}


const deleteDepartment = () => {
    db.query(`SELECT * FROM department`,
    function(err, res) {
        if(err) throw err;
        inquirer
        .prompt({
            name: 'name',
            type: 'rawlist',
            message: 'choose to remove',
            choices: () => {
                const list = [];
                for(let i = 0; i < res.length; i ++) {
                    list.push(res[i]);
                }
                return list;
            }
        }).then((chosen) => {
            // console.log(chosen);
            const departmentId = findId(chosen.name, res);
            // console.log(departmentId);
            db.query(`
                DELETE FROM department WHERE id = ?
                `,departmentId ,function(err, res) {
                    if(err) throw err;
                    console.log('deleted department');
                    mainOption();
            });
        }).catch(err => err);
    });

}


const deleteRole = () => {
    db.query(`SELECT id, title AS 'name' FROM role`,
        function(err, res){
            if(err) throw err;
            inquirer
                .prompt({
                    name: 'title',
                    type: 'rawlist',
                    message: 'choose to remove',
                    choices: async () => {
                        const list = [];
                        for(let i = 0; i < res.length; i++) {
                            list.push(res[i]);
                        }
                        return list;
                    }
                })
                .then((chosen) => {
                    console.log(chosen);
                    const roleId = findId(chosen.title, res);
                    console.log(roleId);
                    db.query(`
                    DELETE FROM role WHERE id = ?
                    `,roleId ,function(err, res) {
                        if(err) throw err;
                        console.log('deleted role');
                        mainOption();
                    });

                }) // then
                .catch(err => err);
        });
}

const deleteEmployee = () => {
    db.query(selectIdandNameFromEmployee, function(err, res) {
        if(err) throw err;
        inquirer
            .prompt({
                name: 'name',
                type: 'rawlist',
                message: 'choose to delete',
                choices: () => {
                    const list = [];
                    for(let i = 0; i < res.length; i++) {
                        list.push(res[i].name);
                        // console.log(list);
                    }
                    return list;
                }
            }).then((chosen) => {
                console.log(chosen);
                const employeeId = findId(chosen.name, res);
                // console.log(employeeId);
                db.query(`
                DELETE FROM employee WHERE id = ?
                `,employeeId , function(err, res) {
                    if(err) throw err;
                    if(res) console.log('delete employ successed');
                    mainOption();
                });
            }).catch((err) => err);
    });
}


// Department sql functions

const addDepartment = () => {
    inquirer
        .prompt({
            name: 'name',
            type: 'input',
            message: 'deparment name'
        })
        .then((input) => {
            db.query(`
                INSERT INTO department (name)
                VALUES (?)
                `, input.name ,function(err, res) {
                if(err) throw err;
                console.log('add department successed');
                mainOption();
            });

        });
}

// role sql functions

const departmentObj = [];
const findDepartment = () => {
    db.query(`SELECT * FROM department`,
        function(err, res) {
            if(err) throw err;
            for(let i = 0; i < res.length; i++) {
                departmentObj.push(res[i]);
            }
            return departmentObj;
        });
}


const findId = (name, idArray) => {
    for(let i = 0; i < idArray.length ;i++ ) {
        if(name === idArray[i].name) {
            return idArray[i].id;
        }
    }
}
const addRole = () => {
    db.query(`SELECT * FROM department`,
        function(err, res) {
            if(err) throw err;
            inquirer
                .prompt([
                    {
                        name: 'title',
                        type: 'input',
                        message: 'role title'
                    },
                    {
                        name: 'salary',
                        type: 'number',
                        message: 'role salary'
                    },
                    {
                        name: 'department_name',
                        type: 'rawlist',
                        message: 'department',
                        choices: () => {
                            const list = [];
                            for(let i = 0; i < res.length; i++) {
                                list.push(res[i].name);
                            }
                            return list;
                            }
                    }
                ]) // prompt end
                .then((answer) => {
                    // console.log(answer);
                    const department_id = findId(answer.department_name, res);
                    db.query(`
                        INSERT INTO role (title, salary, department_id)
                        VALUES(?,?,?)
                        `,[answer.title, answer.salary, department_id],
                        function(err, res) {
                            if(err) throw err;
                            console.log('added Role: ' + JSON.stringify(answer));
                        });
                        mainOption();
                }) //then
                .catch(err => err);
            });
}
const findRole = () => {
    db.query(`SELECT id, title AS 'name' FROM role`,
        function(err, res){
            if(err) throw err;
            for(let i = 0; i < res.length ;i++) {
                roleObj.push(res[i]);
            }
            // console.log(roleObj);
            return roleObj;
        });
}




const findEmployee = () => {
    db.query(selectIdandNameFromEmployee, function(err, res) {
        if(err) throw err;
        for(let i = 0; i< res.length ; i++) {
            employeeObj.push(res[i]);
        }

        // console.log(employeeObj);
        return employeeObj;
    });
}

const addEmployee = () =>{
    findRole();
    findEmployee();
    inquirer
        .prompt([
            {
                name: 'first_name',
                type: 'input',
                message: 'Employee\'s first name'
            },
            {
                name: 'last_name',
                type: 'input',
                message: 'Employee\'s last name'
            },
            {
                name: 'role',
                type: 'rawlist',
                message: 'employee role',
                choices: () => {
                    const list = [];
                    for(let i = 0; i < roleObj.length; i++) {
                        list.push(roleObj[i].name);
                        // console.log(list);
                    }
                    return list;
                }
            },
            {
                name: 'manager',
                type: 'rawlist',
                message: 'employee manager',
                choices: () => {
                    employeeObj.push('null');
                    const list = [];
                    for(let i = 0; i < employeeObj.length; i++) {
                        list.push(employeeObj[i]);
                        // console.log(list);
                    }
                    return list;
                }
            }
        ])
        .then((answer) => {
            // console.log(answer);
            const role_id = findId(answer.role, roleObj);
            const manager_id = findId(answer.manager, employeeObj);
            // console.log('role: ' + role_id + '\nm: ' + manager_id)
            db.query(`
                INSERT INTO employee (first_name, last_name, role_id, manager_id)
                VALUES (?, ?, ? , ?)
                `,[answer.first_name ,answer.last_name ,role_id , manager_id] ,function (err, res) {
                    if(err) throw err;
                    console.log('add employee successed');
                    mainOption();
                });
        }).catch(err => err);
}



// employee sql functions
