const sql = require("mssql");
const config = require("../config");
const request = new sql.Request();
const winlogger = require("../log");
var HdrId = 0;
var DtlId = 0;
exports.allmodule = function (req, res) {
  new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
      return pool
        .request()
        .input("Action", "DDLModule")
        .execute("SS_Sp_RolesRights");
    })
    .then(result => {
      const rows = result.recordsets;
      res.status(200).send({ "data": rows });
      sql.close();
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
      // winlogger.log('error', message);
      sql.close();
    });
};

exports.allType = function (req, res) {
  new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
      return pool
        .request()
        .input("Action", "DDLType")
        .execute("SS_Sp_RolesRights");
    })
    .then(result => {
      const rows = result.recordsets;
      res.status(200).send({ "data": rows });
      sql.close();
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
      // winlogger.log('error', message);
      sql.close();
    });
};

exports.InsertScreen = function (req, res) {
  new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
      return pool
        .request()
        .input("Action", "ScreenMasterAdd")
        .input("ModuleName", req.body.ModuleName)
        .input("ModuleId", req.body.ModuleId)
        .input("SubModuleName", req.body.SubModuleName)
        .input("StateName", req.body.StateName)
        .input("ScreenName", req.body.ScreenName)
        .input("ClientId", req.body.ClientId)
        .input("UserId", req.body.UserId)
        .input("TypeName", req.body.TypeName)
        .input("TypeId", req.body.TypeId)

        .execute("SS_Sp_RolesRights");
    })
    .then(result => {
      if (result.recordsets.length > 0) {
        res.status(200).json({ "data": result.recordsets[0][0] })
      }
      else {
        res.status(500).send({ "message": 'Error Inserting Screen Name Or State Name' })
      }
      sql.close();
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
      winlogger.log('error', message);
      sql.close();
    });
};