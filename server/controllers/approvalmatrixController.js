const sql = require("mssql");
const config = require("../config");
const request = new sql.Request();
const winlogger = require("../log");

exports.getgrades = function (req, res) {
  sql.connect(config).then(() => {
    return sql.query`select Grade as gradename,id from WRBHBGradeMaster where IsActive=1 and IsDeleted=0 AND ClientId=2007 AND Grade!=''
        GROUP BY Grade,Id`
  }).then(result => {
    let rows = result.recordset;
    res.status(200).send({ "data": rows })


  }).catch(err => {
    res.status(500).send({ message: err.message })
    sql.close();
  })
};

exports.getpolicy = function (req, res) {
  new sql.ConnectionPool(config).connect().then((pool) => {
    return pool.query`select policyname,id as policyid,clientid from WRBHBStaytravelpolicy_header where IsActive=1 and IsDeleted=0 AND ClientId=${req.body.ClientId}`
  }).then(result => {
    let rows = result.recordset;
    res.status(200).send({ "data": rows })


  }).catch(err => {
    res.status(500).send({ message: err.message })
    sql.close();
  })
};

exports.TravelpolicyHelp = function (req, res) {
  new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
      return pool
        .request()
        .input("ClientId", req.body.ClientId)
        .input("PolicyId", req.body.PolicyId)
        .input("UserId", req.body.UserId)
        .input("Str", "")
        .input("Id", 0)
        .execute("SP_StayTravelPolicy_Help");
    })
    .then(result => {
      const Policy = result.recordsets[0];
      const HotelRule = result.recordsets[1];
      const Grades = result.recordsets[2];
      res.status(200).send({ Grades, HotelRule, Policy })
      sql.close();
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
      //winlogger.log('error',message);
      sql.close();
    });
}

exports.TravelpolicyAdd = function (req, res) {
  new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
      return pool
        .request()
        .input("ClientId", req.body.ClientId)
        .input("PolicyName", req.body.PolicyName)
        .input("UserId", req.body.UserId)
        .input("Str", "")
        .input("Id", 0)
        .execute("SP_StayTravelPolicy_Insert");
    })
    .then(result => {
      const rows = result.recordsets[0][0];
      res.status(200).send({ message: rows.Flag, PolicyId: rows.Id })
      sql.close();
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
      //winlogger.log('error',message);
      sql.close();
    });

}

exports.TravelpolicyDelete = function (req, res) {
  new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
      let Temp = 0;
      for (var i = 0, len = req.body.SelectedPolicies.length; i < len; i++) {
        Temp = Temp + 1;
        if (req.body.SelectedPolicies.length > Temp) {
          pool
            .request()
            .input("PolicyId", req.body.SelectedPolicies[i].policyid)
            .input("UserId", req.body.UserId)
            .input("Str", "")
            .input("Id", 0)
            .execute("SP_StayTravelPolicy_Delete");
        }
        if (req.body.SelectedPolicies.length == Temp) {
          return pool
            .request()
            .input("PolicyId", req.body.SelectedPolicies[i].policyid)
            .input("UserId", req.body.UserId)
            .input("Str", "")
            .input("Id", 0)
            .execute("SP_StayTravelPolicy_Delete");
        }

      }

    })
    .then(result => {
      const rows = result.recordsets[0][0];
      res.status(200).send({ message: rows.Flag })
      sql.close();
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
      //winlogger.log('error',message);
      sql.close();
    });

}

//Hotel Rule Price Update

exports.HotelRuleValueUpdate = function (req, res) {
  new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
      return pool
        .request()
        .input("HotelRuleTableId", req.body.TableId)
        .input("Value", req.body.Value)
        .input("ClientId", req.body.ClientId)
        .input("UserId", req.body.UserId)
        .input("Str", "")
        .input("Id", 0)
        .execute("SP_StayTravelPolicyHotelRuleValue_Update");
    })
    .then(result => {
      const rows = result.recordsets[0][0];
      res.status(200).send({ message: rows.Flag })
      sql.close();
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
      //winlogger.log('error',message);
      sql.close();
    });

}

//Hotel Rule Condition Update

exports.HotelRuleConditionUpdate = function (req, res) {
  new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
      return pool
        .request()
        .input("ClientId", req.body.ClientId)
        .input("PolicyId", req.body.PolicyId)
        .input("Condition", req.body.Condition)
        .input("UserId", req.body.UserId)
        .input("Str", "")
        .input("Id", 0)
        .execute("SP_StayTravelPolicyHotelRuleCondition_Update");
    })
    .then(result => {
      const rows = result.recordsets[0][0];
      res.status(200).send({ message: rows.Flag })
      sql.close();
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
      //winlogger.log('error',message);
      sql.close();
    });

}

exports.GradeAdd = function (req, res) {
  new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
      let Temp = 0;
      for (var i = 0, len = req.body.SelectedGrades.length; i < len; i++) {
        Temp = Temp + 1;
        if (req.body.SelectedGrades.length > Temp) {
          pool
            .request()
            .input("PolicyId", req.body.PolicyId)
            .input("GradeId", req.body.SelectedGrades[i].gradeid)
            .input("GradeName", req.body.SelectedGrades[i].gradename)
            .input("UserId", req.body.UserId)
            .input("Str", "")
            .input("Id", 0)
            .execute("SP_StayTravelPolicyGrade_Insert");
        }
        else if (req.body.SelectedGrades.length == Temp) {
          return pool
            .request()
            .input("PolicyId", req.body.PolicyId)
            .input("GradeId", req.body.SelectedGrades[i].gradeid)
            .input("GradeName", req.body.SelectedGrades[i].gradename)
            .input("UserId", req.body.UserId)
            .input("Str", "")
            .input("Id", 0)
            .execute("SP_StayTravelPolicyGrade_Insert");
        }
      }
    })
    .then(result => {
      const rows = result.recordsets[0][0];

      res.status(200).send({ message: rows.Flag })
      sql.close();
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
      //winlogger.log('error',message);
      sql.close();
    });

}



exports.GradeDelete = function (req, res) {
  new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
      let Temp = 0;
      for (var i = 0, len = req.body.SelectedGrades.length; i < len; i++) {
        Temp = Temp + 1;
        if (req.body.SelectedGrades.length > Temp) {
          pool
            .request()
            .input("PolicyGradeTableId", req.body.SelectedGrades[i].policydtlsid)
            .input("UserId", req.body.UserId)
            .input("Str", "")
            .input("Id", 0)
            .execute("SP_StayTravelPolicyGrade_Delete");
        }
        else if (req.body.SelectedGrades.length == Temp) {
          return pool
            .request()
            .input("PolicyGradeTableId", req.body.SelectedGrades[i].policydtlsid)
            .input("UserId", req.body.UserId)
            .input("Str", "")
            .input("Id", 0)
            .execute("SP_StayTravelPolicyGrade_Delete");
        }
      }
    })
    .then(result => {
      const rows = result.recordsets[0][0];

      res.status(200).send({ message: rows.Flag })
      sql.close();
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
      //winlogger.log('error',message);
      sql.close();
    });

}

exports.PolicyNameUpdate = function (req, res) {
  new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
      return pool
        .request()
        .input("PolicyId", req.body.PolicyId)
        .input("PolicyName", req.body.PolicyName)
        .input("ClientId", req.body.ClientId)
        .input("UserId", req.body.UserId)
        .input("Str", "")
        .input("Id", 0)
        .execute("SP_StayTravelPolicyName_Update");
    })
    .then(result => {
      const rows = result.recordsets[0][0];

      res.status(200).send({ message: rows.Flag })
      sql.close();
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
      //winlogger.log('error',message);
      sql.close();
    });

}

exports.PolicyDescriptionUpdate = function (req, res) {
  new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
      return pool
        .request()
        .input("PolicyId", req.body.PolicyId)
        .input("Description", req.body.Description)
        .input("UserId", req.body.UserId)
        .input("Str", "")
        .input("Id", 0)
        .execute("SP_StayTravelPolicyDescription_Update");
    })
    .then(result => {
      const rows = result.recordsets[0][0];

      res.status(200).send({ message: rows.Flag })
      sql.close();
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
      //winlogger.log('error',message);
      sql.close();
    });


  exports.DoctorSave = function (req, res) {
    new sql.ConnectionPool(config)
      .connect()
      .then(pool => {
        let Temp = 0;
        for (var i = 0, len = req.body.DoctorDetails.length; i < len; i++) {
          Temp = Temp + 1;
          if (req.body.DoctorDetails.length > Temp) {
            pool
              .request()
              .input("Name", req.body.DoctorDetails[i].name)
              .input("EmailId", req.body.DoctorDetails[i].EmailId)
              .input("Mobile", req.body.DoctorDetails[i].mobile)
              .input("StateName", req.body.DoctorDetails[i].statename)
              .input("CityName", req.body.DoctorDetails[i].cityname)
              .execute("SP_DoctorDetails_Insert");
          }
          else if (req.body.DoctorDetails.length == Temp) {
            return pool
              .request()
              .input("Name", req.body.DoctorDetails[i].name)
              .input("EmailId", req.body.DoctorDetails[i].EmailId)
              .input("Mobile", req.body.DoctorDetails[i].mobile)
              .input("StateName", req.body.DoctorDetails[i].statename)
              .input("CityName", req.body.DoctorDetails[i].cityname)
              .execute("SP_DoctorDetails_Insert");
          }

        }

      })
      .then(result => {
        const rows = result.recordsets[0][0];

        res.status(200).send({ message: rows.Flag })
        sql.close();
      })
      .catch(err => {
        res.status(500).send({ message: err.message });
        //winlogger.log('error',message);
        sql.close();
      });

  }

}