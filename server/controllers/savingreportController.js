const sql = require("mssql");
const config = require("../config");
const request = new sql.Request();
const winlogger = require("../log");
        
//saving report

  exports.savingReport=function(req,res){
    new sql.ConnectionPool(config)
    .connect()
      .then(pool => {
        return pool
        .request()
        .input("Action","DataLoad")
        .input("FromDt",req.body.FromDt)
        .input("ToDt",req.body.ToDt)
        .input("ClientId",req.body.ClientId)
        .execute('SP_SS_SavingReport_Help')
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

//Expense report(currentmonth)
exports.currentexpenseReport=function(req,res){
  new sql.ConnectionPool(config)
  .connect()
    .then(pool => {
      return pool
      .request()
      .input("Action","PageLoad")
      .input("PropertyId",req.body.PropertyId)
      .input("PaymentMode",req.body.ToDt)
      .input("PropertyType",req.body.ClientId)
      .input("Range",req.body.ClientId)
      .input("MasterClientId",req.body.ClientId)
      .input("ClientId",req.body.ClientId)
      
      .execute('SP_ExpenseReport_Warsoft')
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
