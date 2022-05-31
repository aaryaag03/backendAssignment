const mysql=require('mysql');
module.exports=mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "", //enter your mysql password here
    database: "library",
    port:3306,
  });