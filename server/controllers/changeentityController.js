const sql=require("mssql");
const config = require("../config");
const request=new sql.Request;
const winlogger = require("../log");

     exports.changeentity = function(req, res) {
      new sql.ConnectionPool(config)
      .connect()
      .then(pool => {
        return pool
          // return sql.query `select ClientName,ClientLogo from WRBHBClientManagement  where MasterClientId=243 and IsActive=1 and IsDeleted=0`
        .request()
        .input("Action","Load")
        .input("ClientId", req.body.ClientId)  
        // .input("UserId",req.body.UserId)       
        .execute("SP_SS_ChangeEntity_Help");
      })
        .then(result => {
          //  const rows = result.recordsets[0][0];
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
          sql.close();
        });
      };
      

      exports.addentity=function(req,res){
        new sql.ConnectionPool(config)
        .connect()
        .then(pool => {
          return pool
         .request()
         .input("Action","Update")
         .input("ClientId", req.body.ClientId)  
        .input("UserId",req.body.UserId)   
           
       .execute("SP_SS_ChangeEntity_Help");
        })
        .then(result =>{
          if (result.recordsets.length > 0) {    
            res.status(200).json({ "data": result.recordsets })
          }
          else {
            res.status(500).json({ "message": 'Client id not changed' })
          }
    
          sql.close();
        })
        .catch(err => {
          res.status(500).json({ "message": err.message });          
          sql.close();
        });
      };
      

  