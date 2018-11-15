const sql = require("mssql");
const config = require("../config");
const request = new sql.Request();
const jwt = require("jsonwebtoken");
const winlogger = require("../log");
const nodemailer = require('nodemailer');
exports.getbookings = function (req, res) {
  new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
      return pool
        .request()
        .input("Action", "PageLoad")
        .input("UserId", req.params.UserId)
        .input("Str", req.params.Status)
        .execute("SP_Mybookinghistory_Help");
    })
    .then(result => {
      //  const rows = result.recordsets[0][0];
      if (result.recordsets.length > 0) {
        res.status(200).json({ "data": result.recordsets })
      }
      else {
        res.status(500).send({ message: 'Error Load users' })
      }

      sql.close();
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
      winlogger.log('error', err.message);
      sql.close();
    });
};
