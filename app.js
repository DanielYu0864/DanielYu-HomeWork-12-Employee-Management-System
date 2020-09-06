const mysql = require("mysql");
const inquirer = require("inquirer");
// const consoleTable = require("console.table");
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
    // findEmployee();
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
            choices: ['Department', 'Role', 'Employee', 'Back']
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

const deleteDepartment = () => {


    db.query(`
    DELETE FROM department WHERE id = ?
    `,'department.id' ,function(err, res) {
        if(err) throw err;
        console.log('deleted department');
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

const findEmployee = () => {
    db.query(`SELECT id,
    CONCAT(first_name, ' ', last_name) AS 'name'
    FROM employee`, function(err, res) {
        if(err) throw err;
        for(let i = 0; i< res.length ; i++) {
            employeeObj.push(res[i]);
        }

        // console.log(employeeObj);
        return employeeObj;
    })
}




const deleteEmployee = () => {
    db.query(`SELECT id,
    CONCAT(first_name, ' ', last_name) AS 'name'
    FROM employee`, function(err, res) {
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
                console.log(employeeId);
                db.query(`
                DELETE FROM employee WHERE id = ?
                `,employeeId , function(err, res) {
                    if(err) throw err;
                    if(res) console.log('delete employ successed');
                    mainOption();
                });
            }).catch((err) => err);
    });

    // db.query(`
    // DELETE FROM employee WHERE id = ?
    // `, 'id', function(err, res) {
    //     if(err) throw err;
    //     if(res) console.log('delete employ successed');
    //     mainOption();
    // });

    // findEmployee1();
    // inquirer
    //     .prompt({
    //         name: 'name',
    //         type: 'rawlist',
    //         message: 'choose to delete',
    //         choices: () => {
    //             // const list = [];
    //             // for(let i = 0; i < employeeObj.length; i++) {
    //             //     list.push(employeeObj[i]);
    //             //     // console.log(list);
    //             // }
    //             // return list;
    //         }
    //     }).then((chosen) => {
    //         console.log(chosen);
    //     }).catch((err) => err);


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
            });
        });
}

// role sql functions
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
        console.log(res);
        mainOption();
    });
}

const findDepartment = () => {
    db.query(`SELECT * FROM department`,
        function(err, res) {
            if(err) throw err;

            let deparmentObj = JSON.stringify(res);
            console.log(deparmentObj);
            return deparmentObj;
        })
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
        function(err, result) {
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
                            for(let i = 0; i < result.length; i++) {
                                list.push(result[i].name);
                            }
                            return list;
                            }
                    }
                ]) // prompt end
                .then((answer) => {
                    // console.log(answer);
                    const department_id = findId(answer.department_name, result);
                    db.query(`
                        INSERT INTO role (title, salary, department_id)
                        VALUES(?,?,?)
                        `,[answer.title, answer.salary, department_id],
                        function(err, res) {
                            if(err) throw err;
                            console.log('added Role: ' + JSON.stringify(answer));
                        });
                }).catch(err => err);
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
                    console.log(answer);
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
