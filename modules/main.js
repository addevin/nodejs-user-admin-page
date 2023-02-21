// let express = require('express')
// let app = express();
let bcrypt = require('bcrypt')
var mainFunctions = {
    randomGen: (length)=>{
            var result           = '';
            var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            var charactersLength = characters.length;
            for ( var i = 0; i < length; i++ ) {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }
            return result;
        // console.log(makeid(5));
    },
    validateEmail : (email) => {
        return email.match(
          /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
    },
    hashPassword:(plaintextPassword, callback)=>{
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(plaintextPassword, salt, function(err, hash) {
                if(err) throw err;
                callback(hash);
            });
            })
    },
    hashPasswordvalidate : async function(plaintextPassword, hash, callback) {
        const result = await bcrypt.compare(plaintextPassword, hash);
        callback(result);
    }
}

module.exports = mainFunctions;