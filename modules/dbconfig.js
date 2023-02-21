var MongoClient = require('mongodb').MongoClient;


let state={
    db:null
}
 

let connection = {
    connectDB: (callback)=>{
        const url = "mongodb://localhost:27017/";
        const database= 'week6task1';

        MongoClient.connect(url,(err,data)=>{
            console.log(database);
            if(err) return callback(err)
            state.db = data.db(database);
            callback();
        })
    }
}

module.exports = {dbGet: ()=>state.db, initConnect: connection.connectDB}
