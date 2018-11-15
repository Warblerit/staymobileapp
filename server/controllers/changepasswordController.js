const sql = require("mssql");
const config = require("../config");
const request = new sql.Request();
const winlogger = require("../log");
        
//Chanage password front end

  exports.Changepassword=function(req,res){
    new sql.ConnectionPool(config)
    .connect()
      .then(pool => {
        return pool
        .request()
        .input("Action","PasswordChange")
        .input("UserId",req.body.UserId)         
        .input("oldpassword",req.body.oldpassword)
        .input("newPassword",req.body.newpassword)       
        .execute('SS_SP_ChangePassword_FrontEnd ')
    })
    .then(result =>{
    
if (result.recordsets.length > 0) {
  
    res.status(200).json({ "data": result.recordsets[0] })
  }
  else {
    res.status(500).json({ "message": 'Error' })
  }

  sql.close();
})
.catch(err => {
  res.status(500).json({ "message": err.message });
  // winlogger.log('error', message);
  sql.close();
});
};

 