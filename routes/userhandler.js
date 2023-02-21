let express = require('express');
let router = express.Router();
let mainModules = require('../modules/main')
let userHelper = require('../modules/userHelpers');

// console.log(mainModules.randomGen(15));

let products = [
    {
        image: "./images/products/oneplus-nord-ce-2-lite-5g.jpg",
        title: 'OnePlus',
        model: "Nord CE 2 Lite 5G",
        spec: "  (Blue Tide, 6GB RAM, 128GB Storage)",
        price: 18999
    },
    {
        image: "./images/products/redmi-a1.jpg",
        title: 'Redmi',
        model: " A1 ",
        spec: " (Light Blue, 2GB RAM, 32GB Storage) | Segment Best AI Dual Cam | 5000mAh Battery | Leather Texture Design | Android 12",
        price: 6799
    },
    {
        image: "./images/products/redme-9-active.jpg",
        title: 'Redmi',
        model: " 9 Activ ",
        spec: "(Carbon Black, 4GB RAM, 64GB Storage) | Octa-core Helio G35 | 5000 mAh Battery",
        price: 8499
    },
    {
        image: "./images/products/oneplus-nord-2t-5g.jpg",
        title: 'OnePlus',
        model: " Nord 2T 5G ",
        spec: "  (Jade Fog, 8GB RAM, 128GB Storage)",
        price: 28999
    },
    {
        image: "./images/products/samsung-galexy-m33-5g.webp",
        title: 'Samsung ',
        model: " Galaxy M33 5G  ",
        spec: " (Mystique Green, 6GB, 128GB Storage) | 6000mAh Battery | Upto 12GB RAM with RAM Plus | Travel Adapter to be Purchased Separately",
        price: 18999
    },
    {
        image: "./images/products/samsung-galexy-s20-fe-5g.webp",
        title: 'Samsung ',
        model: " Galaxy S20 FE 5G ",
        spec: " (Cloud Navy, 8GB RAM, 128GB Storage) with No Cost EMI & Additional Exchange Offers",
        price: 37990
    },
    {
        image: "./images/products/samsung-galexy-s22-ultra-5g.webp",
        title: 'Samsung ',
        model: "  Galaxy S22 Ultra 5G",
        spec: " (Phantom Black, 12GB, 256GB Storage) Galaxy Watch4",
        price: "1,12,998"
    },
    {
        image: "./images/products/iphone-14-128gb.jpg",
        title: 'Apple ',
        model: " iPhone 14 ",
        spec: " iPhone 14 128GB Blue | Free delivery available",
        price: "78,400"
    },
    {
        image: "./images/products/iphone-14-pro-256gb.jpg",
        title: 'Apple ',
        model: " iPhone 14 Pro ",
        spec: " iPhone 14 Pro  256GB Deep Purple | Free delivery available",
        price: "1,39,900"
    },
    {
        image: "./images/products/oppo-reno7pro-5g.jpg",
        title: 'Oppo ',
        model: "  Reno7 Pro 5G ",
        spec: " (Starlight Black, 12 GBRAM, 256GB Storage)",
        price: "33,400"
    }
]
router.get('/', (req, res, next) => {
    userHelper.authCheck(req).then((data) => {
        if (data.state) {

            // res.send('Hello, loggedin: '+ data.userData.name)
            console.log('Final logged');
            res.locals.userData = data.userData;
            next();
        } else {
            res.send('Hello, not logged in ')

        }
    }).catch((err) => {

        console.log('Error Detected- err:' + err)
        res.redirect('/login');

    })
}, (req, res) => {
    res.render('userhome', { userData: res.locals.userData, products })
})

router.get('/login', (req, res, next) => {
    userHelper.authCheck(req).then((data) => {
        if (data.state) {
            res.locals.userData = data.userData;
            res.redirect('/');

        } else {
            res.send('Hello, not logged in ')
        }
    }).catch((err) => {

        console.log('Error Detected- err:' + err)
        next();

    })
}, (req, res) => {
    res.render('userlogin');
})
router.get('/signup', (req, res) => {
    res.render('usersignup');
})
router.post('/signup', (req, res) => {
    if (req.body.name.length >= 4) {
        if (mainModules.validateEmail(req.body.email)) {
            if (req.body.password.length >= 8) {
                if (req.body.password == req.body.repassword) {

                    userHelper.getUserCount({ email: req.body.email }).then((result) => {
                        if (result == 0) {
                            let newuserID = mainModules.randomGen(15);
                            mainModules.hashPassword(req.body.password, (hashedPass) => {
                                userHelper.newuser({ _id: newuserID, name: req.body.name, email: req.body.email, password: hashedPass }).then((err, re) => {
                                    let newID = mainModules.randomGen(15);
                                    console.log('Its working...');
                                    newID = 'uLOG' + newID;
                                    req.session.loginID = newID;
                                    userHelper.createAuth(newuserID, newID)
                                    res.render('usersignup', { successLoginAttempt: true });
                                })
                            })

                        } else {
                            res.render('usersignup', { errorDetucted: 'Already a user exist with this email, please try another email! ' });
                        }

                    })
                } else {
                    res.render('usersignup', { errorDetucted: 'Please check Password! didn\'t match the password ' });
                }

            } else {
                res.render('usersignup', { errorDetucted: 'Password must contain 8 characters minimum.' });
            }

        } else {
            res.render('usersignup', { errorDetucted: 'Email must be valid! Please Check your email.' });
        }
    } else {
        res.render('usersignup', { errorDetucted: 'Name must have morethan 4 letters ' });
    }
})
router.post('/login', (req, res) => {
    if (mainModules.validateEmail(req.body.email)) {
        if (req.body.password.length >= 8) {
            userHelper.getUserCount({ email: req.body.email }).then((result) => {
                if (result == 1) {
                    userHelper.getAuser({ email: req.body.email }, (userdata) => {

                        mainModules.hashPasswordvalidate(req.body.password, userdata.password, (data) => {
                            if (data) {

                                let newID = mainModules.randomGen(15);
                                newID = 'uLOG' + newID;
                                req.session.loginID = newID;
                                userHelper.createAuth(userdata._id, newID)
                                res.render('userlogin', { successLoginAttempt: true })
                            } else {
                                res.render('userlogin', { errorDetucted: 'Please check the password! You have entered a wrong password.' })
                            }
                        })
                    })
                } else {
                    res.render('userlogin', { errorDetucted: 'Please check the credentials! We couldn\'t find a user' })
                }
            })

        } else {

            res.render('userlogin', { errorDetucted: 'Please check the credentials! Seems something went wrong.' })
        }
    } else {
        res.render('userlogin', { errorDetucted: 'Please check the credentials! Seems something went wrong.' })

    }

})

router.get('/logout', (req, res) => {
    userHelper.usersignout(req)
    req.session.destroy();
    res.redirect('/login');
})

router.get('/test2', (req, res) => {
    /* if(true){
             console.log('checking logged in');
             console.log('ses: '+req.session.loginID);
             
     }else{
         // req.session.loginID='testlogin';
         console.log('User not logged in');
     }*/
    userHelper.authCheck(req).then((data) => {
        if (data.state) {

            res.send('Hello, loggedin: ' + data.userData.name)
        } else {
            res.send('Hello, not logged in ')

        }
    }).catch((err) => {

        res.send('<h1>Error Detected-</h1>err:' + err)

    })
})


module.exports = router;