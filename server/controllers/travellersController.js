const sql = require("mssql");
const config = require("../config");
const request = new sql.Request();
const winlogger = require("../log");

exports.getEmpCodeDetails = function (req, res) {
  new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
      return pool
        .request()
        .input("ClientId", req.body.ClientId)
        .input("EmpCode", req.body.EmpCode)
        .input("GradeId", req.body.GradeId)
        .input("UserId", req.body.UserId)
        .input("Id", 0)
        .input("Str", '')
        .execute("SP_StayEmpCode_Search");
    })
    .then(result => {
      const rows = result.recordsets[0];
      res.status(200).send({ "data": rows });
      sql.close();
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
      winlogger.log('error', err.message);
      sql.close();
    });
};

exports.empCodeWithGuestId = function (req, res) {
  new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
      return pool
        .request()
        .input("Action", 'Getguestdetails')
        .input("Id", req.body.Id)
        .input("Grade", '')
        .input("ClientId", '')
        .execute("Enduserempcodesearch");
    })
    .then(result => {
      const rows = result.recordsets[0];
      res.status(200).send(rows);
      sql.close();
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
      winlogger.log('error', err.message);
      sql.close();
    });
};


exports.getGradeId = function (req, res) {
  new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
      return pool
        .request()
        .input("Action", 'getGradeId')
        .input("Id", 0)
        .input("Grade", req.body.Grade)
        .input("ClientId", req.body.ClientId)
        .execute("Enduserempcodesearch");
    })
    .then(result => {
      const rows = result.recordsets[0];
      res.status(200).send(rows);
      sql.close();
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
      winlogger.log('error', err.message);
      sql.close();
    });
};