const sql = require("mssql");
const config = require("../config");
const request = new sql.Request();
const winlogger = require("../log");
        
//saving report

  exports.PaymentCurrentReport=function(req,res){
    new sql.ConnectionPool(config)
    .connect()
      .then(pool => {
        return pool
        .request()
        .input("Action","PageLoad")
        .input("FromDt","")
       .input("ToDt","")
        .input("ClientId",req.body.ClientId)
        .input("UserId",req.body.UserId)
        .input("Str",req.body.range)
        .execute('SS_PropertyWisePaymentRange_Report_Stay')
    })
    .then(result =>{
    
if (result.recordsets.length > 0) {
  
    res.status(200).json({ "data": result.recordsets })
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
