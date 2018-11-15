const sql = require("mssql");
const config = require("../config");
const request = new sql.Request();
const winlogger = require("../log");
const nodemailer = require('nodemailer');

exports.CppGridLoad = function (req, res) {
  new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
      return pool
        .request()
        .input("Action", 'PageLoad')
        .input("ClientId", req.body.ClientId)
        .input("PropertyId", 0)
        .input("Id", 0)
        .input("UserId", req.body.UserId)
        .execute("Sp_SS_ContractClientPref_Help");
    })
    .then(result => {
      const rows = result.recordsets[0];
      res.status(200).send({ "data": rows });
      sql.close();
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
      winlogger.log('error', message);
      sql.close();
    });
};

exports.CppCheck = function (req, res) {
  new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
      return pool
        .request()
        .input("Action", 'OnLoad')
        .input("ClientId", req.body.ClientId)
        .input("PropertyId", 0)
        .input("Id", 0)
        .input("UserId", req.body.UserId)
        .execute("Sp_SS_ContractClientPref_Help");
    })
    .then(result => {
      const rows = result.recordsets[0];
      res.status(200).send({ "data": rows });
      sql.close();
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
      winlogger.log('error', message);
      sql.close();
    });
};

exports.PropertyHistory = function (req, res) {
  new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
      return pool
        .request()
        .input("Action", 'History')
        .input("ClientId", req.body.ClientId)
        .input("PropertyId", req.body.PropertyId)
        .input("Id", 0)
        .input("UserId", req.body.UserId)
        .execute("Sp_SS_ContractClientPref_Help");
    })
    .then(result => {
      const rows = result.recordsets;
      res.status(200).send({ "data": rows });
      sql.close();
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
      winlogger.log('error', message);
      sql.close();
    });
};

exports.CppHdrInsert = function (req, res) {
  new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
      return pool
        .request()
        .input("ClientName", "")
        .input("ClientId", req.body.ClientId)
        .input("CreatedBy", req.body.UserId)
        .execute("Sp_SS_ContractClientPref_Header_Insert");
    })
    .then(result => {
      const rows = result.recordsets[0];
      res.status(200).send({ "data": rows });
      sql.close();
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
      winlogger.log('error', message);
      sql.close();
    });
};

exports.PropertDataLoad = function (req, res) {
  new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
      return pool
        .request()
        .input("Action", 'LastData')
        .input("ClientId", req.body.ClientId)
        .input("PropertyId", req.body.PropertyId)
        .input("Id", 0)
        .input("UserId", req.body.UserId)
        .execute("Sp_SS_ContractClientPref_Help");
    })
    .then(result => {
      const rows = result.recordsets[0];
      res.status(200).send({ "data": rows });
      sql.close();
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
      winlogger.log('error', message);
      sql.close();
    });
};


exports.getProperty = function (req, res) {
  new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
      return pool
        .request()
        .input("clientId", req.params.clientId)
        .input("propertyName", req.params.propertyName)
        .execute("SS_PropertySearch");
    })
    .then(result => {
      const rows = result.recordsets[0];
      res.status(200).send({ "data": rows });
      sql.close();
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
      winlogger.log('error', message);
      sql.close();
    });
};
exports.getCity = function (req, res) {
  new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
      return pool
        .request()
        .input("Action", "CityLoad")
        .input("PropertyName", "")
        .input("ContactName", "")
        .input("Phone", "")
        .input("Email", "")
        .input("StateName", "")
        .input("StateId", 0)
        .input("CityName", "")
        .input("CityId", 0)
        .input("Id1", req.params.StateId)
        .execute("SP_NewPropertyRequest_Help");
    })
    .then(result => {
      const rows = result.recordsets[0];
      res.status(200).send({ "data": rows });
      sql.close();
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
      winlogger.log('error', message);
      sql.close();
    });
};

exports.getState = function (req, res) {
  new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
      return pool
        .request()
        .input("Action", "StateLoad")
        .input("PropertyName", "")
        .input("ContactName", "")
        .input("Phone", "")
        .input("Email", "")
        .input("StateName", "")
        .input("StateId", 0)
        .input("CityName", "")
        .input("CityId", 0)
        .input("Id1", 0)
        .execute("SP_NewPropertyRequest_Help");
    })
    .then(result => {
      const rows = result.recordsets[0];
      res.status(200).send({ "data": rows });
      sql.close();
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
      winlogger.log('error', message);
      sql.close();
    });
};

exports.CppInsert = function (req, res) {
  new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
      return pool
        .request()
        .input("HeaderId", req.body.HeaderId)
        .input("PropertyName", req.body.Property)
        .input("RoomType", req.body.RoomType)
        .input("TariffSingle", req.body.ATariffSingle)
        .input("TariffDouble", req.body.ATariffDouble)
        .input("TariffTriple", req.body.ATariffTriple)
        .input("LTariffSingle", req.body.RTariffSingle)
        .input("LTariffDouble", req.body.RTariffDouble)
        .input("LTariffTriple", req.body.RTariffTriple)
        .input("Facility", req.body.Facility)
        .input("TaxInclusive", req.body.Inclusive)
        .input("LTAgreed", 0)
        .input("LTRack", 0)
        .input("STAgreed", 0)
        .input("TAC", 0)
        .input("TACInclusive", 0)
        .input("ContactName", req.body.ContactName)
        .input("ContactPhone", req.body.ContactPhone)
        .input("Email", req.body.ContactEmail)
        .input("PropertyId", req.body.PropertyId)
        .input("RoomId", 0)
        .input("CreatedBy", req.body.UserId)
        .execute("Sp_SS_ContractClientPref_Detail_Insert");
    })
    .then(result => {
      const rows = result.recordsets[0];
      res.status(200).send({ "data": rows });
      sql.close();
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
      winlogger.log('error', message);
      sql.close();
    });
};

exports.CppUpdate = function (req, res) {
  new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
      return pool
        .request()
        .input("HeaderId", req.body.HeaderId)
        .input("PropertyName", req.body.Property)
        .input("RoomType", req.body.RoomType)
        .input("TariffSingle", req.body.ATariffSingle)
        .input("TariffDouble", req.body.ATariffDouble)
        .input("TariffTriple", req.body.ATariffTriple)
        .input("LTariffSingle", req.body.RTariffSingle)
        .input("LTariffDouble", req.body.RTariffDouble)
        .input("LTariffTriple", req.body.RTariffTriple)
        .input("Facility", req.body.Facility)
        .input("TaxInclusive", req.body.Inclusive)
        .input("LTAgreed", 0)
        .input("LTRack", 0)
        .input("STAgreed", 0)
        .input("TAC", 0)
        .input("TACInclusive", 0)
        .input("ContactName", req.body.ContactName)
        .input("ContactPhone", req.body.ContactPhone)
        .input("Email", req.body.ContactEmail)
        .input("PropertyId", req.body.PropertyId)
        .input("RoomId", 0)
        .input("CreatedBy", req.body.UserId)
        .input("Id", req.body.Id)
        .execute("Sp_SS_ContractClientPref_Detail_Update");
    })
    .then(result => {
      const rows = result.recordsets[0];
      res.status(200).send({ "data": rows });
      sql.close();
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
      winlogger.log('error', message);
      sql.close();
    });
};




exports.propertydelete = function (req, res) {
  new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
      return pool
        .request()
        .input("Action", 'Delete')
        .input("ClientId", 0)
        .input("PropertyId", 0)
        .input("Id", req.body.Id)
        .input("UserId", req.body.UserId)
        .execute("Sp_SS_ContractClientPref_Help");
    })
    .then(result => {
      const rows = result.recordsets[0];
      res.status(200).send({ message: rows.Flag })
      sql.close();
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
      sql.close();
    });

};
exports.NewPropertyReq = function (req, res) {

  let Host;
  let CredentialsUserName;
  let CredentialsPassword;
  let Port;
  let emailArray;
  let ClientLogo;
  let Dt;

  new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
      return pool
        .request()
        .input("Action", "SMTP")
        .input("Str1", '')
        .input("Id", 0)
        .execute("SS_SP_SMTPMailSetting_Help");
    })
    .then(result => {
      let rows = result.recordsets[0][0];
      Host = rows.Host;
      CredentialsUserName = rows.CredentialsUserName;
      CredentialsPassword = rows.CredentialsPassword;
      Port = rows.Port;
      sql.close();
    })
    .catch(err => {
      res.status(500).send({ message: "Error" });
      sql.close();
    });

  new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
      return pool
        .request()
        .input("Action", 'PropertyRequest')
        .input("ClientId", req.body.ClientId)
        .input("PropertyId", 0)
        .input("Id", 0)
        .input("UserId", req.body.UserId)
        .execute("Sp_SS_ContractClientPref_Help");
    })
    .then(result => {
      let rowss = result.recordsets[0][0];
      ClientLogo = rowss.ClientLogo;
      Dt = rowss.Dt;
      sql.close();
      nodemailer.createTestAccount((err, account) => {
        let transporter = nodemailer.createTransport({
          host: Host,
          port: Port,
          secure: false,
          auth: {
            user: CredentialsUserName,
            pass: CredentialsPassword
          }
        });

        var Header = "<div style=\"width: 100%; background: #ebebeb; padding: 50px 0;\">" +
          "<div class=\"Header\" style=\"width: 60%; margin: 0 auto; background: #ffffff;padding: 20px; border-top: 3px solid #499681;\">" +
          "<div style=\"width: 100%; margin: 0 auto;\"><div style=\"width:50%; display: inline-block; vertical-align: middle;\">" +
          "<img src=\"http://endpoint887127.azureedge.net/img/new.png\" width=\"125\" height=\"auto\" alt=\"\" title=\"\"></div>";


        var clientLogo = "<div class=\"Header\" style=\"width:50%; display: inline-block; vertical-align: middle; text-align: right;\">" +
          "<img src='" + ClientLogo + "' width=\"125\" height=\"auto\" alt=\"\" title=\"\">" +
          "</div></div>";

        var message =
          " <table cellpadding=\"0\" cellspacing=\"0\" width=\"600\" border=\"0\"  style=\"padding-top:10px;\">" +
          " <tr style=\"font-size:12px; \">" +
          " <td width=\"600\" style=\"padding:12px 5px;\">" +
          " <p style=\"margin-top:20px;\">" +
          " <span> System generated email. Please do not reply. </span>" +
          " <style=\"margin-top:20px;\">" +
          " <span style=\"float:right\"  >   Date : " + Dt + "</span><br>" +
          " </td></tr></table>";

        var regLink =
          " <table cellpadding=\"0\" cellspacing=\"0\" width=\"600\" border=\"0\"  style=\"padding-top:0px;\">" +
          " <tr style=\"font-size:12px;\">" +
          " <td width=\"600\" style=\"padding:3px 5px;\">" +
          " <p style=\"margin-top:10px;\">" +
          " <span>Dear Humming Bird </span> " + " <br>" +
          " </p>" +
          " <span>Below Property details are requested by Client to Add as Contract client Property.</span> " +
          " <br>" + " </p>" + " <p style=\"margin-top:20px;\">" +
          "</td></tr></table>";

        var content = "<h4 style=\"font-size: 14px; padding: 0; margin: 0;\">Property Details</h4>";

        var body = "<table style=\"border-collapse: collapse;width:600; border: 1px solid #252525;\" cellpadding=\"5\">" +
          "<tr style=\"border-collapse: collapse; border: 1px solid #252525;\"><td>Property Name</td>" +
          "<td style=\"border-collapse: collapse; border: 1px solid #252525;\">Contact Name</td> " +
          "<td style=\"border-collapse: collapse; border: 1px solid #252525;\">Contact Phone</td>" +
          "<td style=\"border-collapse: collapse; border: 1px solid #252525;\">Contact Email</td></tr>" +
          "<tr style=\"border-collapse: collapse; border: 1px solid #252525;\">" +
          "<td style=\"border-collapse: collapse; border: 1px solid #252525;\">" + req.body.PropertyName + "</td>" +
          "<td style=\"border-collapse: collapse; border: 1px solid #252525;\">" + req.body.ContactName + "</td>" +
          "<td style=\"border-collapse: collapse; border: 1px solid #252525;\">" + req.body.ContactPhone + "</td>" +
          "<td style=\"border-collapse: collapse; border: 1px solid #252525;\">" + req.body.ContactEmail + "</td></tr>" +
          "</table><br /><h4 style=\"font-size: 14px; padding: 0; margin: 0;\">Basic details are added in Property Management,please update the remaining details</h4><br />";


        var content1 = "<h4 style=\"font-size: 14px; padding: 0; margin: 0;\">Requester Details</h4>";

        var footer = "<table style=\"border-collapse: collapse;width:600; border: 1px solid #252525;\" cellpadding=\"5\">" +
          "<tr style=\"border-collapse: collapse; border: 1px solid #252525;\"><td>Client Name</td>" +
          "<td style=\"border-collapse: collapse; border: 1px solid #252525;\">User Name</td>" +
          "<td style=\"border-collapse: collapse; border: 1px solid #252525;\">Email</td></tr>" +
          "<tr style=\"border-collapse: collapse; border: 1px solid #252525;\">" +
          "<td style=\"border-collapse: collapse; border: 1px solid #252525;\">" + req.body.ClientName + "</td>" +
          "<td style=\"border-collapse: collapse; border: 1px solid #252525;\">" + req.body.UserName + "</td> " +
          "<td style=\"border-collapse: collapse; border: 1px solid #252525;\">" + req.body.Email + "</td></tr>" +
          "</table></div></div>";

        var EmailContent = Header + clientLogo + message + regLink + content + body + content1 + footer;

        let mailOptions =
        {
          from: '"No Reply" <stay@hummingbirdindia.com>',
          to: 'hbconf17@gmail.com',
          subject: 'Property Request',
          html: EmailContent
        };
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            return console.log(error);
          }
          else {
            new sql.ConnectionPool(config)
              .connect()
              .then(pool => {
                return pool
                  .request()
                  .input("Action", "PropertyAdd")
                  .input("PropertyName", req.body.PropertyName)
                  .input("ContactName", req.body.ContactName)
                  .input("Phone", req.body.ContactPhone)
                  .input("Email", req.body.ContactEmail)
                  .input("StateName", req.body.StateName)
                  .input("StateId", req.body.StateId)
                  .input("CityName", req.body.CityName)
                  .input("CityId", req.body.CityId)
                  .input("Id1", 0)
                  .execute("SP_NewPropertyRequest_Help");
              })
              .then(result => {
                const rows = result.recordsets[0];
                res.status(200).send({ "data": rows });
                sql.close();
              })
              .catch(err => {
                res.status(500).send({ message: err.message });
                sql.close();
              });
          }
        });
      });
    })
    .catch(err => {
      res.status(500).send({ message: "Error" });
      sql.close();
    });
}