const sql = require("mssql");
const config = require("../config");
const request = new sql.Request();
const winlogger = require("../log");
const nodemailer = require('nodemailer');
exports.GetCountry = function (req, res) {
  new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
      return pool
        .request()
        .input("Action", "LoadCountry")
        .execute("SS_SP_HotelRegistration_help");
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
exports.GetState = function (req, res) {
  new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
      return pool
        .request()
        .input("Action", "LoadState")
        .input("CountryId", req.body.CountryId)
        .execute("SS_SP_HotelRegistration_help");
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
exports.GetCity = function (req, res) {
  new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
      return pool
        .request()
        .input("Action", "LoadCity")
        .input("StateId", req.body.StateId)
        .execute("SS_SP_HotelRegistration_help");
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
exports.GetStarRating = function (req, res) {
  new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
      return pool
        .request()
        .input("Action", "LoadStarCategory")
        .execute("SS_SP_HotelRegistration_help");
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
exports.InsertHotelRegistration = function (req, res) {

  let Host;
  let CredentialsUserName;
  let CredentialsPassword;
  let Port;
  let emailArray;

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

      let CheckIn = req.body.CheckInTime.split(':', 2)
      let CheckInMeridian = CheckIn[1].split(' ')

      let CheckOut = req.body.CheckOutTime.split(':', 2)
      let CheckOutMeridian = CheckOut[1].split(' ')

      new sql.ConnectionPool(config)
        .connect()
        .then(pool => {
          return pool
            .request()
            .input("PropertyName", req.body.HotelName)
            .input("Propertaddress", req.body.HotelAddress)
            .input("CountryId", req.body.CountryId)
            .input("CountryName", req.body.CountryName)
            .input("StateId", req.body.StateId)
            .input("State", req.body.StateName)
            .input("CityId", req.body.CityId)
            .input("City", req.body.CityName)
            .input("Postal", req.body.Pincode)
            .input("Phone", req.body.MobileNo)
            .input("CheckIn", CheckIn[0])
            .input("CheckInMeridian", CheckInMeridian[1])
            .input("CheckOut", CheckOut[0])
            .input("CheckOutMeridian", CheckOutMeridian[1])
            .input("TRIPRating", req.body.StarRating)
            .input("PropertDescription", req.body.HotelDescription)
            .input("FirstName", req.body.YourName)
            .input("EmailID", req.body.ContactEmailId)
            .input("PhoneNo", req.body.ContactTelephoneNo)
            .input("UserId", req.body.UserId)
            .execute("SS_SP_HotelRegistration_Save");
        })
        .then(result => {
          const rows = result.recordsets[0];
          if (rows[0].Msg == "Registered Successfully") {
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
            // var clientLogo = "<div class=\"Header\" style=\"width:50%; display: inline-block; vertical-align: middle; text-align: right;\">"+
            // "<img src='"+ ClientLogo +"' width=\"125\" height=\"auto\" alt=\"\" title=\"\">"+
            // "</div></div>";
            var message =
              " <table cellpadding=\"0\" cellspacing=\"0\" width=\"600\" border=\"0\"  style=\"padding-top:10px;\">" +
              " <tr style=\"font-size:12px; \">" +
              " <td width=\"600\" style=\"padding:12px 5px;\">" +
              " <p style=\"margin-top:20px;\">" +
              " <span> System generated email. Please do not reply. </span>" +
              " <style=\"margin-top:20px;\">" +
              //" <span style=\"float:right\"  >   Date : " + Dt + "</span><br>" +
              " </td></tr></table>";

            var regLink =
              " <table cellpadding=\"0\" cellspacing=\"0\" width=\"600\" border=\"0\"  style=\"padding-top:0px;\">" +
              " <tr style=\"font-size:12px;\">" +
              " <td width=\"600\" style=\"padding:3px 5px;\">" +
              " <p style=\"margin-top:10px;\">" +
              " <span>Dear Humming Bird </span> " + " <br>" +
              " </p>" +
              " <span>Below Property details are requested  to Add as External Property.</span> " +
              " <br>" + " </p>" + " <p style=\"margin-top:20px;\">" +
              "</td></tr></table>";

            var content = "<h4 style=\"font-size: 14px; padding: 0; margin: 0;\">Property Details</h4>";

            var body = "<table style=\"border-collapse: collapse;width:600; border: 1px solid #252525;\" cellpadding=\"5\">" +
              "<tr style=\"border-collapse: collapse; border: 1px solid #252525;\"><td>Property Name</td>" +
              "<td style=\"border-collapse: collapse; border: 1px solid #252525;\">Contact Name</td> " +
              "<td style=\"border-collapse: collapse; border: 1px solid #252525;\">Contact Phone</td>" +
              "<td style=\"border-collapse: collapse; border: 1px solid #252525;\">Contact Mobile</td>" +
              "<td style=\"border-collapse: collapse; border: 1px solid #252525;\">Contact Email</td></tr>" +
              "<tr style=\"border-collapse: collapse; border: 1px solid #252525;\">" +
              "<td style=\"border-collapse: collapse; border: 1px solid #252525;\">" + req.body.HotelName + "</td>" +
              "<td style=\"border-collapse: collapse; border: 1px solid #252525;\">" + req.body.YourName + "</td>" +
              "<td style=\"border-collapse: collapse; border: 1px solid #252525;\">" + req.body.ContactTelephoneNo + "</td>" +
              "<td style=\"border-collapse: collapse; border: 1px solid #252525;\">" + req.body.MobileNo + "</td>" +
              "<td style=\"border-collapse: collapse; border: 1px solid #252525;\">" + req.body.ContactEmailId + "</td></tr>" +
              "</table><br /><h4 style=\"font-size: 14px; padding: 0; margin: 0;\">Basic details are added in Property Management,please update the remaining details</h4><br />";
            var EmailContent = Header + message + regLink + content + body;
            let mailOptions = {
              from: '"No Reply" <stay@hummingbirdindia.com>',
              to: 'hbconf17@gmail.com',
              subject: 'Property Request',
              html: EmailContent
            };
            transporter.sendMail(mailOptions, (error, info) => {
              if (!error) {
                // return console.log(error);
                res.status(200).send({ "data": rows });
              }

            }).catch(err => {
              res.status(500).send({ message: err.message });
              // winlogger.log('error', message);
              sql.close();
            });
          }
          else {
            res.status(200).send({ "data": rows });
          }
        })
    })
    .catch(err => {
      res.status(500).send({ message: "Error" });
      sql.close();
    });
}
