let express = require('express');
let router = express.Router();
let dbGet = require('../modules/dbconfig').dbGet;
let userHelper = require('../modules/userHelpers');
let mainModules = require('../modules/main');
var createError = require('http-errors');


router.get('/', (req, res, next) => {
    userHelper.adminAuthCheck(req).then((data) => {
        if (data.state) {
            res.locals.userData = data.userData;
            next();
        } else {
            res.send('Hello, not logged in ')
        }
    }).catch((err) => {
        console.log('Error Detected- err:' + err)
        res.redirect('/admin/login');
    })
}, (req, res) => {
    let countDatas = {}
    userHelper.getUserCount({}).then((count) => {
        // countDatas.users = count;
        return count;
    }).then((usercount) => {

        userHelper.getUserCount({ admin: true }).then((admincount) => {
            countDatas.admins = admincount;
            countDatas.users = usercount;
            res.render('adminpanel', { layout: 'adminLayout.hbs', page: ['dashboard'], pagedashboard: true, adminuserData: res.locals.userData, countDatas })
        })
    })
})

router.get('/login', (req, res, next) => {
    userHelper.adminAuthCheck(req).then((data) => {
        if (data.state) {
            res.locals.userData = data.userData;
            res.redirect('/admin');
        } else {
            res.send('Hello, not logged in ')
        }
    }).catch((err) => {
        console.log('Error Detected- err:' + err)
        next();
    })
}, (req, res) => {

    res.render('adminLogin')

})
router.post('/login', (req, res, next) => {
    userHelper.adminAuthCheck(req).then((data) => {
        if (data.state) {
            res.locals.userData = data.userData;
            res.redirect('/admin');
        } else {
            res.send('Hello, not logged in ')
        }
    }).catch((err) => {
        console.log('Error Detected- err:' + err)
        next();
    })
}, (req, res) => {
    if (mainModules.validateEmail(req.body.email)) {
        if (req.body.password.length >= 8) {
            userHelper.getUserCount({ email: req.body.email }).then((result) => {
                if (result == 1) {
                    userHelper.getAuser({ email: req.body.email }, (userdata) => {
                        if (userdata.admin) {



                            mainModules.hashPasswordvalidate(req.body.password, userdata.password, (data) => {
                                if (data) {

                                    let newID = mainModules.randomGen(15);
                                    newID = 'uLOG' + newID;
                                    console.log(req.session.loginID);
                                    req.session.loginID = newID;
                                    userHelper.createAuth(userdata._id, newID)
                                    res.render('adminLogin', { successLoginAttempt: true })
                                } else {
                                    res.render('adminLogin', { errorDetucted: 'Please check the password! You have entered a wrong password.' })
                                }
                            })
                        } else {
                            res.render('adminLogin', { errorDetucted: 'Sorry, you are not authorised to access Admin panel! ' })

                        }
                    })
                } else {
                    res.render('adminLogin', { errorDetucted: 'Please check the credentials! We couldn\'t find a user' })
                }
            })

        } else {

            res.render('adminLogin', { errorDetucted: 'Please check the credentials! Seems something went wrong.' })
        }
    } else {
        res.render('adminLogin', { errorDetucted: 'Please check the credentials! Seems something went wrong.' })

    }
})

router.get('/users', (req, res, next) => {
    userHelper.adminAuthCheck(req).then((data) => {
        if (data.state) {
            res.locals.userData = data.userData;
            next();
        } else {
            res.send('Hello, not logged in ')
        }
    }).catch((err) => {
        console.log('Error Detected- err:' + err)
        res.redirect('/admin/login');
    })
}, (req, res) => {
    userHelper.list((users) => {
        res.render('admin-users', { layout: 'adminLayout.hbs', page: ['users'], pageusers: true, users: users, adminuserData: res.locals.userData });
    })


})

router.use('/users/update/:uid', (req, res, next) => {
    userHelper.adminAuthCheck(req).then((data) => {
        if (data.state) {
            res.locals.userData = data.userData;
            next();
        } else {
            res.send('Hello, not logged in ')
        }
    }).catch((err) => {
        console.log('Error Detected- err:' + err)
        res.redirect('/admin/login');
    })
}, (req, res, next) => {
    userHelper.getUserCount({ _id: req.params.uid }).then((isUserExist) => {
        if (isUserExist == 1) {
            next();
            console.log('User is available: ' + isUserExist);
        } else {
            // res.send('<h2>404! user is unavailable!</h2>')
            // res.render('404')

            next(createError(404)) //Creating error


        }
    })
})
router.get('/users/update/:uid', (req, res) => {
    if (req.query.removeUser) {
        deleteUser = true;
    } else {
        deleteUser = false;
    }
    userHelper.getAuser({ _id: req.params.uid }, (userData) => {
        res.render('admin-user-update', { layout: 'adminLayout.hbs', page: ["users", "update", userData.name], pageusers: true, userData: userData, adminuserData: res.locals.userData, deleteUser });
    })
    // res.send('Hello '+req.params.uname)

})
router.post('/users/update/:uid', (req, res) => {
    // userHelper.getAuser({_id:req.params.uid},
    let submitErr;
    let from = {
        _id: req.params.uid
    }
    let update = {
        $set: {

        }
    }
    if (req.body.uNametoUpdate) {
        update.$set.name = req.body.uNametoUpdate;
    }
    if (req.body.emailtoUpdate) {
        update.$set.email = req.body.emailtoUpdate;
    }
    console.log('req admin auth: ' + req.body.adminAccess);
    if (req.body.adminAccess) {
        if (res.locals.userData._id != req.params.uid) {

            if (req.body.adminAccess == 'yes') {
                update.$set.admin = true;
            } else {
                update.$set.admin = false;
            }
        } else {
            if((res.locals.userData.admin==true) != (req.body.adminAccess=='yes')){
             submitErr = "You cannot change your own admin authorization!";
            }    
        }
    }
    if (req.body.password) {
        let userPass = req.body.password;
        if (userPass == req.body.repassword) {
            if (userPass.length >= 8) {
                mainModules.hashPassword(userPass, (hashPassword) => {
                    update.$set = { password: hashPassword };
                    userHelper.updateUser(from, update).then(() => {
                        console.log('User password changed (uid:'+from._id+')');

                    });
                })
            } else {
                submitErr = "Password must contain 8 letters!";
            }
        } else {
            submitErr = "Password didn't match! try again";

        }
    }

    userHelper.updateUser(from, update).then(() => {
        console.log(update);
        userHelper.getAuser({ _id: req.params.uid }, (userData) => {
            res.render('admin-user-update', { layout: 'adminLayout.hbs', page: ["users", "update", userData.name], pageusers: true, userData: userData, adminuserData: res.locals.userData, updateStatus: true, submitErr });
        })
    })
    // res.send('Hello '+req.params.uname)

})

router.get('/server/deleteuser/:uid', (req, res, next) => {
    userHelper.adminAuthCheck(req).then((data) => {
        if (data.state) {
            res.locals.userData = data.userData;
            next();
        } else {
            res.send('Hello, not logged in ')
        }
    }).catch((err) => {
        console.log('Error Detected- err:' + err)
        res.redirect('/admin/login');
    })
}, (req, res, next) => {
    userHelper.getUserCount({ _id: req.params.uid }).then((isUserExist) => {
        if (isUserExist == 1) {
            next();
            console.log('User is available: ' + isUserExist);
        } else {
            console.log('User is unavailble 404');
            // res.send('<h2>404! user is unavailable!</h2>')
            res.render('404')

        }
    })
}, (req, res) => {
    userHelper.dropUser(req.params.uid).then((err, result) => {

        res.send('<hr><b class="text-primary">Deleted account, userid: ' + req.params.uid + '</b>')
    })
})
module.exports = router;