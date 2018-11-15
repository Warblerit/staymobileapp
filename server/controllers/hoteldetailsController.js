const sql = require("mssql");
const config = require("../config");
const request = new sql.Request();
const winlogger = require("../log");

exports.getHotelDetails = function (req, res) {

  if(req.body.propertytype=="ExP" || req.body.propertytype=="CPP"){

    new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
      return pool
        .request()
        .input("Action", 'Property')
        .input("Grade", '')
        .input("GradeId", 0)
        .input("ChkInDt", req.body.checkindate)
        .input("ChkOutDt", req.body.checkoutdate)
        .input("ClientId", req.body.clientid)
        .input("SingleCount", req.body.singlecount)
        .input("DoubleCount", req.body.doublecount)
        .input("PropertyType", req.body.propertytype)
        .input("PropertyId", req.body.propertyid)
        .input("Id1", 0)
        .input("Str1", '')
        .execute("SS_Booking_Property_RoomTypes_ExPCPP");
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
  }

  else if(req.body.propertytype=="MGH" || req.body.propertytype=="InP"){

    new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
      return pool
        .request()
        .input("Action", 'Property')
        .input("Grade", '')
        .input("GradeId", 0)
        .input("ChkInDt", req.body.checkindate)
        .input("ChkOutDt", req.body.checkoutdate)
        .input("ClientId", req.body.clientid)
        .input("SingleCount", req.body.singlecount)
        .input("DoubleCount", req.body.doublecount)
        .input("PropertyType", req.body.propertytype)
        .input("PropertyId", req.body.propertyid)
        .input("Id1", 0)
        .input("Str1", '')
        .execute("SS_Booking_Property_RoomTypes_MGHDdPInP");
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
  }

};
