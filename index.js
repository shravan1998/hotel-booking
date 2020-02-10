var express = require("express")
var ejs = require("ejs")
var path = require("path")
var bodyParser = require("body-parser")
var mysql = require("mysql")
var localStorage = require('localStorage')
var uid;
const connection = mysql.createConnection({
    host: "localhost",
    username: "root",
    password: "",
    database:"hotel"
});
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.get('/',function(req,res){
    res.render('index');
});

app.get('/login',function(req,res){
    res.render('index');
    localStorage.clear();
    console.log(localStorage.getItem('uid'));
});

app.get('/register',function(req,res){
    res.render('routes/register');
});

app.get('/dashboard',function(req,res){
    var sql="SELECT * FROM `hotels` WHERE `members`<>0";
    connection.query(sql,(err,results,fields)=>{
        if(err){
            console.log(err);
        }else{
            res.render('routes/dashboard',{hotel:results});
        }
    });
    
});

app.get('/hotel-rooms',function(req,res){
    sql="SELECT * FROM `hotels`";
    connection.query(sql,(err,results,fields)=>{
        if(err){
            console.log(err);
        }else{
            res.render('routes/rooms',{hotel:results});
        }
    })
    
});

app.get('/rooms-entry/:id',function(req,res){
    var id = req.params.id;
    res.render('routes/rooms-entry',{id:id});
});

app.set('views',__dirname);
app.use(express.static(__dirname+'/'));
app.post('/login',function(req,res){
    var email = req.body.email;
    var password = req.body.password;
    var sql = "SELECT * FROM login WHERE email='"+email+"'";
    connection.query(sql,function(err,results,fields){
        if(err){
            throw err;
        }
        else{
            console.log("The solution is : ",results);
            if(results.length > 0){
                if(results[0].password == password){
                    var sql1 = "SELECT uid FROM login WHERE `email`='"+email+"'"; 
                    connection.query(sql,function(err,results,fields)
                    {
                        if(!err){
                            //console.log("Inserted");
                            console.log(results[0].uid);
                            localStorage.setItem('uid', results[0].uid);
                            myValue = localStorage.getItem('uid');
                            console.log(myValue);
                            
                        }else{
                            throw err;
                        }
                        
                    });   
                    return res.redirect('/hotel-rooms');
                }
                else{
                    res.send("Email and password doesnt match");
                }
            }
            else{
                res.send("Email doesnt exist");
            }
        }
    });
   
    
});

app.post('/register',(req,res)=>{
    var email = req.body.email;
    var password = req.body.password;
    var cpassword = req.body.cpassword;
    var sql = "INSERT INTO login(`email`,`password`) VALUES ('"+email+"','"+password+"')";
    if(password.length>5 && cpassword == password){
                connection.query(sql,function(err)
                {
                    if(!err){
                        console.log("Inserted");
                      
                        
                    }else{
                        throw err;
                    }
                    
                });
    
                var sql1 = "SELECT uid FROM login WHERE `email`='"+email+"'"; 
                connection.query(sql1,function(err,results,fields)
                {
                    if(!err){
                        //console.log("Inserted");
                        console.log(results[0].uid);
                        localStorage.setItem('uid', results[0].uid);
                        myValue = localStorage.getItem('uid');
                        console.log(myValue);
                        
                    }else{
                        throw err;
                    }
                    
                });     
    
        return res.redirect('/hotel-rooms');
    }
});
app.post('/book/:id',(req,res)=>{
    console.log(req.params.id);
    var sql = "UPDATE `hotels` SET `members`="+req.body.members+" WHERE `hotel_rid`="+req.params.id+"";
    connection.query(sql,(err)=>{
        if(err){
            console.log(err)
        }else{
            console.log('updated');
        }
    });
    return res.redirect('/dashboard');
});

app.get('/delete/:id',(req,res)=>{
    var sql = "DELETE FROM `hotels` WHERE `hotel_rid`="+req.params.id+"";
    connection.query(sql,(err)=>{
        if(err){
            console.log(err);
        }else{
            console.log("Room No Longer Available");
        }
    });
    return res.redirect('/dashboard');
});

app.set('view engine','ejs');

app.listen(8000,function(){
    console.log('connected');
});