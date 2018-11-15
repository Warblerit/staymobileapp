const sql = require("mssql");
const config = require("../config");
const request = new sql.Request();
const winlogger = require("../log");

exports.OccupancyChart = function(req, res) {
    new sql.ConnectionPool(config)
      .connect()
      .then(pool => {
        return pool
          .request()
          .input("Action", 'OccupancyChart')
          .input("Pram1",0)
          .input("Pram2", req.body.Id)
          .input("Pram3",req.body.From)
          .input("Pram4",req.body.To)
          .input("UserId", req.body.UserId)
          .execute("SP_SS_OccupancyChartMVC_Help");
      })
      .then(result => {
        const rows = result.recordsets[0];
        res.status(200).send({"data": rows });
        sql.close();
      })
      .catch(err => {
        res.status(500).send({ message: err.message });
        winlogger.log('error',message);
        sql.close();
      });
  };


  exports.OccupancyProperty = function(req, res) {
    new sql.ConnectionPool(config)
    .connect()
      .then(pool => {
        return pool
        .request()
        .input("Action","Property")
        .input("Pram1",0)
        .input("Pram2",req.body.ClientId)
        .input("Pram3","")
        .input("Pram4","")
         .input("UserId",0)
        .execute("SP_SS_GHReport_Help")
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

  }