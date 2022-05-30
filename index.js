const express= require('express');

const cookieParser= require("cookie-parser");
const sessions = require("express-session");

const d = new Date();
const db = require('./database');
const e = require('express');
const { constants } = require('buffer');
db.connect();

let t1,t2;
let fees=0;

const app=express();
app.set('view engine', 'ejs');

const oneDay =1000* 60*  60;

app.use(sessions({
    secret: "Idontcarecouldntcareless26538hrdj2772",
    saveUninitialized:true,
    cookie: {maxAge: oneDay},
    resave:false
}))

app.use(cookieParser());
var session;

app.use(express.json());
app.use(express.urlencoded({ extended: true}));


const PORT = process.env.PORT || 5500;
app.listen(PORT, ()=>
    console.log('hi'));


const router = express.Router();

app.use('/',router);
router.get('/',(req,res)=>{
    res.render('index')
});

router.get('/adminLogin',(req,res)=>{
    res.render('adminLogin')
});

router.get('/clientLogin',(req,res)=>{
    console.log(d.getTime());
    res.render('clientLogin')
});

router.get('/adminRegister',(req,res)=>{
    res.render('adminRegister')
});

router.get('/clientRegister',(req,res)=>{
    res.render('clientRegister')
});



router.post('/clogin',(req,res)=>{
    db.query('select * from client where username =' + db.escape(req.body.username) + ';',
    (error ,result, fields)=>{
        let pwd=req.body.password;
        pwd="s11o0hh6=hj"+pwd+ "rr6ytu;"
        let crypto = require('crypto');
        const hash = crypto.createHash('sha256').update(pwd).digest('base64');
        if (error || result[0] === undefined) {
            return res.send('USER NOT REGISTERED.');
        }
        else {
            if (result[0] != undefined && result[0].password === hash) {
                session=req.session;
                session.userid=req.body.username;
                console.log(req.session)
                db.query("SELECT * from books where bool=1;",
                (error, result1, fields)=>{
                    if(error){
                        throw error;
                    }    
                    else{
                        db.query("SELECT * from books where username="+db.escape(session.userid)+";",
                        (error ,result2, fields)=>{
                        return res.render('clientLoggedin', { data: req.body.username , book_list: result1 , my_books:result2});
                        });
                    }
                });
                
            }
            else {
                return res.send('PASSWORD INCORRECT.');
            }
        }
    

    });
    
});

router.post('/cregister',(req,res)=>{
    let pwd=req.body.password;
    pwd="s11o0hh6=hj"+pwd+ "rr6ytu;"
    let crypto = require('crypto');
    const hash = crypto.createHash('sha256').update(pwd).digest('base64');
    
    db.query('select * from client where username =' + db.escape(req.body.username) + ';',
    (error ,result, fields)=>{
        if (result[0]===undefined ) {
            if(req.body.username && (req.body.password==req.body.password1)){
                db.query("INSERT INTO client VALUES(" + db.escape(req.body.username) + ",'" + hash+"', 0);");
                session=req.session;
                session.userid=req.body.username;
                db.query("SELECT * from books where bool=1;",
                (error, result1, fields)=>{
                    if(error){
                        throw error;
                    }    
                    else{
                        db.query("SELECT * from books where username="+db.escape(session.userid)+";",
                        (error ,result2, fields)=>{
                        return res.render('clientLoggedin', { data: req.body.username , book_list: result1 , my_books:result2});
                        });
                    }
                });

            }
            else{
                res.send('PASSWORD(S) NOT VALID.');
            }
        }
        else {
            res.send('USERNAME TAKEN. PLEASE CHOOSE ANOTHER.');
        }

    });
    
});

router.post('/viewRequests', (req,res)=>{
    db.query("select * from r where c=1;",
    (error, result, fields)=>{
        db.query("select * from r where c=0;",
            (error,result1,fields)=>{
                db.query("select * from r where c=2;",
                (error,result2,fields)=>{
                if(error){
                    throw error;
                }
                else{
                    return res.render('requests',{takeRequests:result1, returnRequests:result , adminRequests: result2});
                }
            });
        });
    });
});

router.post('/alogin',(req,res)=>{
    db.query('select * from admin where username =' + db.escape(req.body.username) + ';',
    (error ,result, fields)=>{
        let pwd=req.body.password;
        pwd="s11o0hh6=hj"+pwd+ "rr6ytu;"
        let crypto = require('crypto');
        const hash = crypto.createHash('sha256').update(pwd).digest('base64');
        console.log(hash);
        if (error || result[0] === undefined) {
            return res.send('USER NOT REGISTERED.');
            // throw error;
        }
        else {
            if (result[0] != undefined && result[0].password == hash) {
                session=req.session;
                session.userid=req.body.username;
                db.query("SELECT * from books where bool=1;",
                (error, result, fields)=>{
                    if(error){
                        throw error;
                    }    
                    else{
                        return res.render('adminLoggedin', { data: req.body.username , book_list: result });
                    }
                });
            }
            
            else {
               return res.send('PASSWORD INCORRECT.');
            }
        }

    });
    
});



router.get('/logout', (req,res)=>{
    req.session.destroy();
    res.render('index')

});

router.post('/addBook',(req,res)=>{  
    db.query("insert into books values(" + db.escape(req.body.bookname) +", 1, " + "'');");  
    db.query("SELECT * from books where bool=1;",
                (error, result, fields)=>{
                    if(error){
                        throw error;
                    }    
                    else{
                        
                        
                        return res.render('adminLoggedin', {book_list: result });
                    }
                });
    
});

router.post('/dropBook',(req,res)=>{  
    // console.log("DELETE FROM books WHERE title=" + db.escape(req.body.bookname) + ";");
    
    db.query("SELECT * from books where title="+db.escape(req.body.bookname)+";",
                (error, result1, fields)=>{
                    db.query("DELETE FROM books WHERE title=" + db.escape(req.body.bookname) + ";");
                    db.query("SELECT * from books where bool=1;",
                    (error,result,fields)=>{
                    if(error){
                        throw error;
                    }    
                    else if(result1[0]===undefined){
                        return res.send('BOOK DOESN\'T EXIST IN LIBRARY')
                    }
                    else{
                        return res.render('adminLoggedin', {book_list: result});
                    }
                });
                });
});


//VALUE OF C IS 0 FOR CHECK-IN AND C IS 1 FOR CHECK-OUT
router.post('/checkInRequest',(req,res)=>{  

    db.query("SELECT * from books WHERE title="+db.escape(req.body.bookname)+" AND username="+db.escape(session.userid)+";",
                (error, result, fields)=>{
                    db.query("SELECT * from books WHERE bool=1 AND title="+db.escape(req.body.bookname)+";",
                    (error, result1, fields)=>{
                    if(error){
                        throw error;
                    }    
                    else if(result1[0]===undefined){
                        return res.send('BOOK DOESN\'T EXIST IN LIBRARY');
                    }
                    else if(result[0]===undefined){ 
                        db.query("insert into r values("+db.escape(session.userid) +","+ db.escape(req.body.bookname) +",0);"); 
                        // db.query("update books set bool=0, username="+db.escape(session.userid)+" where title="+db.escape(req.body.bookname)+";"); 
                        db.query("update books set bool=0 where title="+db.escape(req.body.bookname)+";"); 
                        return res.send('REQUEST SENT');
                    }
                    
                    else{
                        return res.send('YOU HAVE THIS BOOK ALREADY');
                    }
                });
            });
});

router.post('/checkOutRequest',(req,res)=>{  
    
    db.query("SELECT * from books WHERE title="+db.escape(req.body.bookname)+" AND username="+db.escape(session.userid)+";",
                (error, result, fields)=>{
                    if(error){
                        throw error;
                    }    
                    else if(result[0]===undefined){ 
                        return res.send('YOU CANNOT RETURN A BOOK YOU DON\'T OWN');
                        
                    }
                    else{
                        db.query("insert into r values("+db.escape(session.userid) +","+ db.escape(req.body.bookname) +",1);"); 
                        t2=d.getTime(); 
                        db.query("update dates set rt="+db.escape(t2)+" where username="+db.escape(session.userid)+" and title="+ db.escape(req.body.bookname)+";");
                        db.query("select * from dates where username="+db.escape(session.userid)+" and title="+ db.escape(req.body.bookname)+";",
                        (error, result,fields)=>{
                            let t1=result[0].tt;
                            console.log(t1);
                            console.log(t2);
                        if(t2-t1 >60000){
                            db.query("update client set fees=500 where username="+db.escape(session.userid)+";"); 
                        }
                        return res.send('REQUEST SENT');
                    });
                }
                });
                
});

router.post('/allowTake',(req,res)=>{  
   console.log(req.body);

   t1=d.getTime();
   

    for (const [key, value] of Object.entries(req.body)) {
        
        // console.log(key);
        let usa ="";
        let tita ="";
        let checka=0;

        for (let iii = 0 ; iii < key.length ; iii++ )
        {

            if (key[iii]=='@')
            {
                checka=1;
                continue;
            }

            if(!(checka))
            {
                usa = usa + key[iii];
            }

            else
            {
                tita = tita + key[iii];
            }

        }

        // console.log(usa);
        // console.log(tita);
        db.query("insert into dates values("+db.escape(usa)+", "+db.escape(tita)+", "+t1+", 0);");


        db.query("delete from r where username="+db.escape(usa)+" and title="+db.escape(tita)+";");
        db.query("update books set username="+db.escape(usa)+" where title="+db.escape(tita)+";"); 
        db.query("select * from r where c=1;",
    (error, result, fields)=>{
        db.query("select * from r where c=0;",
            (error,result1,fields)=>{
                db.query("select * from r where c=2;",
                (error,result2,fields)=>{
                if(error){
                    throw error;
                }
                else{
                    return res.render('requests',{takeRequests:result1, returnRequests:result , adminRequests: result2});
                }
            });
        });
    });
        

    }
                    
});

router.post('/allowReturn',(req,res)=>{
    console.log(req.body);
    for (const [key, value] of Object.entries(req.body)) {
    console.log(key);
    let usa ="";
    let tita ="";
    let checka=0;

        for (let iii = 0 ; iii < key.length ; iii++ ){
            if (key[iii]=='@'){
                checka=1;
                continue;
            }

            if(!(checka)){
                usa = usa + key[iii];
            }

            else{
                tita = tita + key[iii];
            }

        }

        db.query("delete from r where username="+db.escape(usa)+" and title="+db.escape(tita)+";");
        db.query("update books set bool=1, username='' where title="+db.escape(tita)+";");
        db.query("select * from r where c=1;",
    (error, result, fields)=>{
        db.query("select * from r where c=0;",
            (error,result1,fields)=>{
                db.query("select * from r where c=2;",
                (error,result2,fields)=>{
                if(error){
                    throw error;
                }
                else{
                    return res.render('requests',{takeRequests:result1, returnRequests:result , adminRequests: result2});
                }
            });
        });
    });

    }                 
});

router.post('/allowAdmin',(req,res)=>{
    console.log(req.body);
    for (const [key, value] of Object.entries(req.body)) {
    console.log(key);
    
    

        db.query("delete from r where username="+db.escape(key)+" and title="+db.escape(value)+";");
        db.query("insert into admin values("+db.escape(key)+", "+db.escape(value)+");");
        db.query("select * from r where c=1;",
    (error, result, fields)=>{
        db.query("select * from r where c=0;",
            (error,result1,fields)=>{
                db.query("select * from r where c=2;",
                (error,result2,fields)=>{
                if(error){
                    throw error;
                }
                else{
                    return res.render('requests',{takeRequests:result1, returnRequests:result , adminRequests: result2});
                }
            });
        });
    });

    }                 
});



router.post('/adminRequest',(req,res)=>{
    console.log(req.body);
    let admin_name=req.body.username
    let pwd=req.body.password;
    pwd="s11o0hh6=hj"+pwd+ "rr6ytu;"
    let crypto = require('crypto');
    const hash = crypto.createHash('sha256').update(pwd).digest('base64');
    
    db.query('select * from admin where username =' + db.escape(req.body.username) + ';',
    (error ,result, fields)=>{
        if (result[0]===undefined ) {
            if(req.body.username && (req.body.password==req.body.password1)){
                db.query("insert into r values(" + db.escape(req.body.username) + ",'" + hash+"', 2);");
                res.send('REQUEST SENT.');
            }
            else{
                res.send('PASSWORD(S) NOT VALID.');
            }
        }
        else {
            res.send('USERNAME TAKEN. PLEASE CHOOSE ANOTHER.');
        }

    });                
});





