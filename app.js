var createError = require('http-errors');
let express = require('express');
let app = express();
let path = require('path')
let session = require('express-session');
let mainModules = require('./modules/main')
let database = require('./modules/dbconfig')
let cookieParser = require('cookie-parser');

//cache clearing... 
app.use(function (req, res, next) {
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
        res.header('Expires', '-1');
        res.header('Pragma', 'no-cache');
    
    next();
});



//dbINIT
database.initConnect((err)=>{
    if(err) console.log('Database Error: '+err);
    else console.log('Database connected to port 27017');
})

//setup
app.set('view engine','hbs');
app.set('views', path.join(__dirname,'views'));

//middlewares
app.use(cookieParser());
app.use(express.static(path.join(__dirname,'public')));
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(session({secret:mainModules.randomGen(20), cookie:{maxAge:6000000},resave:true, saveUninitialized:true}))
// app.use(session({secret:"dfgd65fg351Random", cookie:{maxAge:600000000}}))


//routers
let userhandler = require('./routes/userhandler') 
app.use('/', userhandler);
let adminhandler = require('./routes/adminhandler'); 
app.use('/admin', adminhandler);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});
  

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {}; 
    let errStatus = err.status || 500;
    // render the error page
    res.status(errStatus);
    if(errStatus==404){
        res.render('404');
    }else{
        res.send('<div style="font-family: \'Segoe UI\', Tahoma, Geneva, Verdana, sans-serif; text-align:center;"><h2 style="color:red;">500 |  Internal error detucted!</h2> We will be back soon..</div>')
        // res.render('error');
    }
});
  

//init
let PORT = process.env.PORT || 8081;
app.listen(PORT, ()=>console.log(`Server is running on port ${PORT}`))
