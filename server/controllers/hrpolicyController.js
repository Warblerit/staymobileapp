const sql = require("mssql");
const config = require("../config");
const request = new sql.Request();
const winlogger = require("../log");
var HdrId = 0;
var DtlId = 0;
exports.HrClientDetail = function (req, res) {
  new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
      return pool
        .request()
        .input("PAction", "ClientLoad")
        .execute("SS_Sp_HrPolicy");
    })
    .then(result => {
      const rows = result.recordsets[0];
      res.status(200).send({ "data": rows });
      sql.close();
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
      // winlogger.log('error', message);
      sql.close();
    });
};
exports.GetCityLoad = function (req, res) {
  new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
      return pool
        .request()
        .input("PAction", "CityLoad")
        .input("Pram1", req.body.ClientId)
        .input("Pram2", req.body.GradeId)
        .execute("SS_Sp_HrPolicy");
    })
    .then(result => {
      if (result.recordsets.length > 0) {
        res.status(200).json({ "data": result.recordsets })
      }
      else {
        res.status(500).json({ "message": 'Error Load City' })
      }
      sql.close();
    })
    .catch(err => {
      res.status(500).json({ "message": err.message });
      sql.close();
    });
};
exports.HrDeleteGrades = function (req, res) {
  new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
      let Temp = 0;
      for (var i = 0, len = req.body.SelectedGrades.length; i < len; i++) {
        Temp = Temp + 1;

        if (req.body.SelectedGrades.length > Temp) {
          pool
            .request()
            .input("PAction", "GradeDelete")
            .input("Pram2", req.body.SelectedGrades[i].value)
            .input("UserId", req.body.UserId)
            .execute("SS_Sp_HrPolicy");
        }
        else if (req.body.SelectedGrades.length == Temp) {
          return pool
            .request()
            .input("PAction", "GradeDelete")
            .input("Pram2", req.body.SelectedGrades[i].value)
            .input("UserId", req.body.UserId)
            .execute("SS_Sp_HrPolicy");
        }
      }
    })
    .then(result => {
      if (result.recordsets.length > 0) {
        res.status(200).json({ "message": 'Grade Deleted Successfully' })
      }
      else {
        res.status(500).send({ "message": 'Error While Deleting' })
      }
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
      winlogger.log('error', err.message);
      sql.close();
    });
};

exports.GetGradeForClient = function (req, res) {
  new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
      return pool
        .request()
        .input("PAction", "GradeLoad")
        .input("Pram1", req.body.ClientId)
        .execute("SS_Sp_HrPolicy");
    })
    .then(result => {
      //  const rows = result.recordsets[0][0];
      if (result.recordsets.length > 0) {

        res.status(200).json({ "data": result.recordsets })
      }
      else {
        res.status(500).json({ "message": 'Error Load Grade' })
      }
      sql.close();
    })
    .catch(err => {
      res.status(500).json({ "message": err.message });
      // winlogger.log('error', message);
      sql.close();
    });
};

exports.GetPopGradeForClient = function (req, res) {
  new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
      return pool
        .request()
        .input("PAction", "PopUpGradeLoad")
        .input("Pram1", req.body.ClientId)
        .execute("SS_Sp_HrPolicy");
    })
    .then(result => {
      if (result.recordsets.length > 0) {
        res.status(200).json({ "data": result.recordsets })
      }
      else {
        res.status(500).json({ "message": 'Error Load Grade' })
      }
      sql.close();
    })
    .catch(err => {
      res.status(500).json({ "message": err.message });
      // winlogger.log('error', message);
      sql.close();
    });
};
exports.HrGradeAdd = function (req, res) {
  new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
      return pool
        .request()
        .input("PAction", "GradeSave")
        .input("Pram1", req.body.ClientId)
        .input("Pram2", 0)
        .input("Pram3", req.body.GradeName)
        .input("Pram4", req.body.Designation)
        .input("UserId", req.body.UserId)
        .execute("SS_Sp_HrPolicy");
    })
    .then(result => {
      if (result.recordsets.length > 0) {
        res.status(200).json({ "data": result.recordsets[0][0] })
      }
      else {
        res.status(500).send({ "message": 'Error Grade Load' })
      }
      sql.close();
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
      // winlogger.log('error', message);
      sql.close();
    });
};
exports.LoadHrPopClientData = function (req, res) {
  new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
      return pool
        .request()
        .input("PAction", "ClientPopLoad")
        .input("Pram1", req.body.ClientId)
        //.input("UserId", req.body.UserId)
        .execute("SS_Sp_HrPolicy");
    })
    .then(result => {
      if (result.recordsets.length > 0) {
        res.status(200).json({ "data": result.recordsets })
      }
      else {
        res.status(500).send({ "message": 'Error Client Detail Load' })
      }

    })
    .catch(err => {
      res.status(500).send({ message: err.message });
      // winlogger.log('error', message);
      sql.close();
    });
};
exports.InsertPolicyData = function (req, res) {
  new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
      return pool
        .request()
        .input("ClientId", req.body.ClientId)
        .input("GradeId", req.body.GradeId)
        .input("MinValue", req.body.MinValue)
        .input("MaxValue", req.body.MaxValue)
        .input("Grade", req.body.Grade)
        .input("NeedGH", req.body.NeedGH)
        .input("ValueStarRatingFlag", req.body.ValueStarRatingFlag)
        .input("StarRatingId", req.body.StarRatingId)
        .input("CreatedBy", req.body.UserId)
        .execute("SS_Sp_ClientGradeValue_Insert");
    })
    .then(result => {
      const Row = result.recordsets[0][0];
      DtlId = Row.Id;
      var n = req.body.City.length;
      new sql.ConnectionPool(config)
        .connect()
        .then(pool => {
          let Temp = 0;
          for (var i = 0; i < req.body.City.length; i++) {
            if (n > i) {
              pool
                .request()
                .input("ClientGradeValueId", DtlId)
                .input("CityId", req.body.City[i].value)
                .input("CityName", req.body.City[i].label)
                .input("CreatedBy", req.body.UserId)
                .execute("SS_Sp_ClientGradeValueDetails_Insert");
            }
            if (n == i) {
              return
              pool
                .request()
                .input("ClientGradeValueId", DtlId)
                .input("CityId", req.body.City[i].value)
                .input("CityName", req.body.City[i].label)
                .input("CreatedBy", req.body.UserId)
                .execute("SS_Sp_ClientGradeValueDetails_Insert");
            }
          }
        })
        .then(results => {
          const rows = result.recordsets[0][0];
          res.status(200).json({ "data": result.recordsets })
          sql.close();
        })
        .catch(err => {
          res.status(500).send({ message: err.message });
          // winlogger.log('error', message);
          sql.close();
        });
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
      // winlogger.log('error', message);
      sql.close();
    });
}
exports.UpdatePolicyData = function (req, res) {
  new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
      return pool
        .request()
        .input("ClientId", req.body.ClientId)
        .input("GradeId", req.body.GradeId)
        .input("MinValue", req.body.MinValue)
        .input("MaxValue", req.body.MaxValue)
        .input("Grade", req.body.Grade)
        .input("NeedGH", req.body.NeedGH)
        .input("ValueStarRatingFlag", req.body.ValueStarRatingFlag)
        .input("StarRatingId", req.body.StarRatingId)
        .input("Id", req.body.Id)
        .input("CreatedBy", req.body.UserId)
        .execute("SS_Sp_ClientGradeValue_Update");
    })
    .then(result => {
      const Row = result.recordsets[0][0];
      HdrId = Row.value;
      var n = req.body.City.length;
      sql.close();
      new sql.ConnectionPool(config)
        .connect()
        .then(pool => {
          for (var i = 0; i < req.body.City.length; i++) {
            if (req.body.City[i].Id == 0) {
              if (n > i) {
                pool
                  .request()
                  .input("ClientGradeValueId", HdrId)
                  .input("CityId", req.body.City[i].value)
                  .input("CityName", req.body.City[i].label)
                  .input("CreatedBy", req.body.UserId)
                  .execute("SS_Sp_ClientGradeValueDetails_Insert");
              }
              if (n == i) {
                return
                pool
                  .request()
                  .input("ClientGradeValueId", HdrId)
                  .input("CityId", req.body.City[i].value)
                  .input("CityName", req.body.City[i].label)
                  .input("CreatedBy", req.body.UserId)
                  .execute("SS_Sp_ClientGradeValueDetails_Insert");
              }
            } else {
              if (n > i) {
                pool
                  .request()
                  .input("ClientGradeValueId", HdrId)
                  .input("CityId", req.body.City[i].value)
                  .input("CityName", req.body.City[i].label)
                  .input("Id", req.body.City[i].Id)
                  .input("CreatedBy", req.body.UserId)
                  .execute("SS_Sp_ClientGradeValueDetails_Update");
              }
              if (n == i) {
                return
                pool
                  .request()
                  .input("ClientGradeValueId", HdrId)
                  .input("CityId", req.body.City[i].value)
                  .input("CityName", req.body.City[i].label)
                  .input("Id", req.body.City[i].Id)
                  .input("CreatedBy", req.body.UserId)
                  .execute("SS_Sp_ClientGradeValueDetails_Update");
              }
            }
          }

        })

        .then(results => {
          const rows = result.recordsets[0][0];
          res.status(200).json({ "data": result.recordsets })
          sql.close();
        })
        .catch(err => {
          res.status(500).send({ message: err.message });
          // winlogger.log('error', message);
          sql.close();
        });
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
      // winlogger.log('error', message);
      sql.close();
    });
}

exports.LoadHrClientData = function (req, res) {
  new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
      return pool
        .request()
        .input("PAction", "Select")
        .input("Pram1", req.body.ClientId)
        .input("Pram2", req.body.GradeId)
        .input("Pram3", req.body.Id)
        //.input("UserId", req.body.UserId)
        .execute("SS_Sp_HrPolicy");
    })
    .then(result => {
      if (result.recordsets.length > 0) {
        res.status(200).json({ "data": result.recordsets })
      }
      else {
        res.status(500).send({ "message": 'Error Client Detail Load' })
      }
      sql.close();
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
      // winlogger.log('error', message);
      sql.close();
    });
};
exports.HrDeletePolicy = function (req, res) {
  new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
      return pool
        .request()
        .input("PAction", "PolicyDelete")
        .input("Pram5", req.body.PolicyId)
        .input("UserId", req.body.UserId)
        .execute("SS_Sp_HrPolicy");
    })
    .then(result => {
      if (result.recordsets.length > 0) {
        res.status(200).json({ "data": result.recordsets })
      }
      else {
        res.status(500).send({ "message": 'Error Load ClientData' })
      }
      sql.close();
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
      // winlogger.log('error', message);
      sql.close();
    });
};
exports.LoadClientSelectedData = function (req, res) {
  new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
      return pool
        .request()
        .input("PAction", "SearchHrClient")
        .input("Pram5", req.body.GradeId)
        .input("UserId", req.body.UserId)
        .execute("SS_Sp_HrPolicy");
    })
    .then(result => {
      if (result.recordsets.length > 0) {
        res.status(200).json({ "data": result.recordsets })
      }
      else {
        res.status(500).send({ "message": 'Error Load ClientData' })
      }
      sql.close();
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
      // winlogger.log('error', message);
      sql.close();
    });
};