const { dbGet } = require("./dbconfig");
let users = {
    list: (callback) => {
        dbGet().collection("users").find({}).toArray((err, result) => {
            if (err) throw err;
            console.log(result);
            callback(result)
        });

    },
    newuser: (data) => {
        return dbGet().collection('users').insertOne(data)
    },
    updateUser:(from,update)=>{
        return dbGet().collection('users').updateOne(from,update)

    },
    getAuser: (data, callback) => {
        dbGet().collection('users').findOne(data, (err, result) => {
            callback(result);
        })
    },
    getUserCount: (data) => {
        return dbGet().collection('users').countDocuments(data)
        // callback(result);
        //.then((result)=>{callback(result); console.log(result)})

    },
    createAuth: (userID, newID) => {
        let currentTime = Date.now();
        return dbGet().collection('users').updateOne({ _id: userID }, { $set: { loggedin: true, time: currentTime, sess_id: newID } })
    },
    authCheck: (req) => {
        return new Promise((resolve, reject) => {

            let loginid = 'Nodata';
            if (req.session.loginID) {
                console.log('Valid sess');
                loginid = req.session.loginID;

            } else {
                console.log('Not valid');
                reject('User not logged')

                // req.session.loginID.distroy();

            }
            users.getUserCount({ sess_id: loginid }).then((userCount) => {
                if (userCount === 1) {
                    if (loginid) {

                        dbGet().collection('users').findOne({ sess_id: loginid }, (err, result) => {
                            if (result.loggedin) {
                                if(err) reject(err);
                                console.log('User already logged in');
                                result = {
                                    state:true,
                                    userData: result
                                }
                                resolve(result);
                            } else {
                                console.log('User not logged');
                                reject('User not logged')
                            }
                            console.log(result);
                            // callback(result);
                        })
                    } else {
                        console.log('User not logged****');
                        reject('User not logged')
                    }
                } else {
                    console.log('User not logged*111*');
                    reject('User not logged')

                }
            })
        })
    },
    adminAuthCheck: (req) => {
        return new Promise((resolve, reject) => {

            let loginid = 'Nodata';
            if (req.session.loginID) {
                console.log('Valid sess');
                loginid = req.session.loginID;

            } else {
                console.log('Not valid');
                reject('Admin: User not logged')

                // req.session.loginID.distroy();

            }
            users.getUserCount({ sess_id: loginid }).then((userCount) => {
                if (userCount === 1) {
                    if (loginid) {

                        dbGet().collection('users').findOne({ sess_id: loginid }).then( ( result) => {
                            if (result.loggedin && result.admin) {
                                console.log('User already logged in');
                                result = {
                                    state:true,
                                    userData: result
                                }
                                resolve(result);
                            } else {
                                console.log('User not logged');
                                reject('Admin: User not logged')
                            }
                            console.log(result);
                            // callback(result);
                        })
                    } else {
                        console.log('Admin: User not logged****');
                        reject('Admin: User not logged')
                    }
                } else {
                    console.log('Admin: User not logged*111*');
                    reject('Admin: User not logged')

                }
            })
        })
    },
    usersignout:(req)=>{
        if(req.session.loginID){
            let loginID = req.session.loginID;
            users.getUserCount({ sess_id:  loginID}).then((userCount)=>{
                if(userCount==1){
                    let currentTime = Date.now();
                    dbGet().collection('users').updateOne({ sess_id: loginID }, { $set: { loggedin: false, time: currentTime, sess_id: 'NoSess' } })
                }
            })
        }
    },
    dropUser: (userID, callback)=>{
         return dbGet().collection('users').deleteOne({ _id:  userID})
    }
}

// userAuthValidate: (req, res, next)
module.exports = users;