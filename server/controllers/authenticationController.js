const sql = require("mssql");
const config = require("../config");
const request = new sql.Request();
const jwt = require("jsonwebtoken");
const winlogger = require("../log");
 var moment = require('moment');

/*Config*/

/*Authentication Methods*/
 var expires = moment().add('days', 1).valueOf();
exports.login = function (req, res) {
  new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
      return pool
        .request()
        .input("Action", "SignIn")
        .input("Email", req.body.Email)
        .input("Pwd", req.body.Password)
        .input("Str", "")
        .input("Id", 0)
        .execute("SP_Login_StaySimplified");
    })
    .then(result => {
      const rows = result.recordsets[0][0];
      if (rows.Flag.toString() === "Success") {
        const payload = {
          Flag: rows.Flag
        };
        var token = jwt.sign(payload, config.superSecret, {
          expiresIn: expires
        });
        res.status(200).json({
          user_token: token,
          user_details: rows
        });
      } else if (rows.Flag.toString() === "Failure") {
        res.status(500).send({ message: rows.Flag });
        winlogger.log('error', rows.Flag);
      }

      sql.close();
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
      winlogger.log('error', err.message);
      sql.close();
    });
};
exports.top1_user = function (req, res) {
  sql.connect(config).then(() => {
    return sql.query`select top 2500 * from wrbhbuser`
  }).then(result => {
    let rows = result.recordset
    res.status(200).send({ "data": rows })

    sql.close();
  }).catch(err => {
    res.status(500).send({ message: err.message })
    sql.close();
  })
}