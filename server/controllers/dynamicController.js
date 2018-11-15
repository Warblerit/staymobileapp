const sql = require("mssql");
const config = require("../config");
const request = new sql.Request();
const winlogger = require("../log");

//Dynamic menu

exports.dynamicMenu = function (req, res) {

  new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
      return pool
        .request()
        .input("clientId", req.body.clientid)
        .input("userId", req.body.userid)
        .input("UserGroup", req.body.usergroup)
        .input("RoleId", '')
        .execute('SS_SP_MenuShowhelp')
    })
    .then(result => {

      if (result.recordsets.length > 0) {
        //const client=result.recordsets[0][0]
        // const user=results.recordsets[0][1]
        res.status(200).send({ data: result.recordsets })
      }
      else {
        res.status(500).send({ message: 'Error' })

      }


    })
    .catch(err => {
      res.status(500).send({ message: err.message });
      winlogger.log('error', err.message);
      sql.close();
    });
};