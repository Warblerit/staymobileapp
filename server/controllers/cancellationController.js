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
        .input("Action", "CancelLoad")
        .input("UserId", req.params.UserId)
        .input("Str", "")
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
exports.cancelrequest = function (req, res) {
  new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
      return pool
        .request()
        .input("Action", "SMTP")
        .input("Str1", '')
        .input("Id", 0)
        .execute("SP_SMTPMailSetting_Help");
    })
    .then(result => {
      let rows = result.recordsets[0][0];
      Host = rows.Host;
      CredentialsUserName = rows.CredentialsUserName;
      CredentialsPassword = rows.CredentialsPassword;
      Port = rows.Port;
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
        .input("Action", "CancelRequest")
        .input("StayBookingId", req.body.StayBookingId)
        .input("ClientId", req.body.ClientId)
        .input("StayGuestId", req.body.StayGuestId)
        .input("Remarks", req.body.Remarks)
        .input("UserId", req.body.UserId)
        .execute("SP_BookingPending_Help");
    })
    .then(result => {
      //var exists=result.recordsets[0][0];
      const rowss = result.recordsets[0];
      var exists = rowss[0];
      if (exists.Msg != "Request has been Already Approved") {

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

          Newdetails = "<tr>" +
            "<td align=\"left\" height=\"30px\" width=\"160px\" bgcolor=\"#eeeeee\" style=\"font-size:12px;\"> " + "Dear" + " " + "HummingBird Booking Team" + ", " + "</td>" +
            "</tr>" +
            "<br/>" +
            "<tr>" +
            "<td align=\"left\" height=\"30px\" width=\"160px\" bgcolor=\"#eeeeee\" style=\"font-size:12px;\"> " + "This is a Hotel / Guest House booking request which is Cancelled." + "</td>" +
            "</tr>" +
            "<br/>" +
            "<table width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"font-family:Verdana; font-size:12px;\">" +
            "<tr>" +
            "<td valign=\"top\"><table width=\"600\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" align=\"center\" style=\"border:1px solid #5b5b5b;\">" +
            "<tr>" +
            "<td valign=\"top\"><table border=\"0\" cellspacing=\"0\" cellpadding=\"0\">" +
            "<tr>" +
            "<td valign=\"middle\" align=\"left\" style=\"padding:10px;\"><img src='" + exists.ClientLogo + "' style=\"padding:10px;\" width=\"125\" height=\"auto\"alt=\"logo\"/></td>" +
            // "<td valign=\"middle\" width=\"50%\" align=\"left\" style=\"padding:10px;\"><img src='"+ exists.ClientLogo +"' width=\"125\" height=\"auto\"alt=\"logo\"/></td>" +
            "</tr>" +
            "<tr>" +
            "<td align=\"left\" style=\"color:#505050; font-weight:bold; padding:10px; font-size:12px;\">Request Details</td>" +
            "</tr>" +
            "<tr>" +
            "<td valign=\"top\"><table width=\"600\" border=\"0\" cellspacing=\"1\" cellpadding=\"5\">" +
            "<tr>" +
            "<td align=\"center\" height=\"30px\" width=\"160px\" bgcolor=\"#cccccc\" style=\"font-size:12px;\">Request Id</td>" +
            "<td align=\"center\" height=\"30px\" width=\"160px\" bgcolor=\"#cccccc\" style=\"font-size:12px;\">Request Type</td>" +
            "<td align=\"center\" height=\"30px\" width=\"110px\" bgcolor=\"#cccccc\" style=\"font-size:12px;\">Requested by</td>" +
            "<td align=\"center\" height=\"30px\" width=\"100px\" bgcolor=\"#cccccc\" style=\"font-size:12px;\">Request Date</td>" +
            "<td align=\"center\" height=\"30px\" width=\"230px\" bgcolor=\"#cccccc\" style=\"font-size:12px;\">Company Name</td>" +
            "</tr>" +
            "<tr>" +
            "<td align=\"center\" height=\"30px\" width=\"160px\" bgcolor=\"#eeeeee\" style=\"font-size:12px;\"> " + "HB/" + exists.StayBookingId + "</td>" +
            "<td align=\"center\" height=\"30px\" width=\"160px\" bgcolor=\"#eeeeee\" style=\"font-size:12px;\">" + exists.RequestType + "</td>" +
            "<td align=\"center\" height=\"30px\" width=\"110px\" bgcolor=\"#eeeeee\" style=\"font-size:12px;\">" + exists.Requestby + "</td>" +
            "<td align=\"center\" height=\"30px\" width=\"100px\" bgcolor=\"#eeeeee\" style=\"font-size:12px;\">" + exists.RequestDate + "</td>" +
            "<td align=\"center\" height=\"30px\" width=\"230px\" bgcolor=\"#eeeeee\" style=\"font-size:12px;\">" + exists.ClientName + "</td>" +
            "</tr>" +
            "</table></td>" +
            "</tr>" +
            "<tr>" +
            "<td align=\"left\" style=\"color:#505050; font-weight:bold; padding:10px; font-size:12px;\">Guest Details</td>" +
            "</tr>" +
            "<tr>" +
            "<td valign=\"top\"><table width=\"600\" border=\"0\" cellspacing=\"1\" cellpadding=\"3\">" +
            "<tr>" +
            "<td align=\"center\" bgcolor=\"#FF9900\" style=\"font-size:12px;\">Emp Code</td>" +
            "<td align=\"center\" bgcolor=\"#FF9900\" style=\"font-size:12px;\">Emp Name</td>" +
            "<td align=\"center\" bgcolor=\"#FF9900\" style=\"font-size:12px;\">Gender</td>" +
            "<td align=\"center\" bgcolor=\"#FF9900\" style=\"font-size:12px;\">Email ID</td>" +
            "<td align=\"center\" bgcolor=\"#FF9900\" style=\"font-size:12px;\">Number</td>" +

            "</tr>" +
            "<tr>" +
            "<td align=\"center\" bgcolor=\"#FFCC66\" style=\"font-size:12px;\">" + exists.EmpCode + "</td>" +
            "<td align=\"center\" bgcolor=\"#FFCC66\" style=\"font-size:12px;\">" + exists.EmpName + "</td>" +
            "<td align=\"center\" bgcolor=\"#FFCC66\" style=\"font-size:12px;\">" + "" + "</td>" +
            "<td align=\"center\" bgcolor=\"#FFCC66\" style=\"font-size:12px;\">" + exists.EmailId + " </td>" +
            "<td align=\"center\" bgcolor=\"#FFCC66\" style=\"font-size:12px;\">" + exists.MobileNo + "</td>" +
            "</tr>" +
            "</table></td>" +
            "<tr >" +
            "<td valign=\"top\"><table width=\"600\" border=\"0\" cellspacing=\"2\" cellpadding=\"3\" style=\"padding-top:4px\">" +
            "<tr>" +
            "<td align=\"center\" bgcolor=\"#FF9900\" style=\"font-size:12px;\">Band</td>" +
            "<td align=\"center\" bgcolor=\"#FF9900\" style=\"font-size:12px;\">Check-In Date</td>" +
            "<td align=\"center\" bgcolor=\"#FF9900\" style=\"font-size:12px;\">Check-Out Date</td>" +
            "<td align=\"center\" bgcolor=\"#FF9900\" style=\"font-size:12px;\">Reason For Travel</td>" +
            "<td align=\"center\" bgcolor=\"#FF9900\" style=\"font-size:12px;\">Remarks</td>" +
            "</tr>" +
            "<tr>" +
            "<td align=\"center\" bgcolor=\"#FFCC66\" style=\"font-size:12px;\">" + exists.Grade + "</td>" +
            "<td align=\"center\" bgcolor=\"#eeeeee\" style=\"font-size:12px;\">" + exists.CheckInDate + "  " + exists.ExpectedChkInTime + "</td>" +
            "<td align=\"center\" bgcolor=\"#eeeeee\" style=\"font-size:12px;\">" + exists.CheckOutDate + "  " + exists.ExpectedChkInTime + "</td>" +
            "<td align=\"center\" bgcolor=\"#eeeeee\" style=\"font-size:12px;\">" + "Client visit" + "</td>" +
            "<td align=\"center\" bgcolor=\"#eeeeee\" style=\"font-size:12px;\">" + exists.Remarks + "</td>" +

            "</tr>" +
            "<tr>" +
            "<td align=\"center\" bgcolor=\"#FF9900\" style=\"font-size:12px;\">Hotel Name</td>" +
            "<td align=\"center\" bgcolor=\"#FF9900\" style=\"font-size:12px;\">Room Type</td>" +
            "<td align=\"center\" bgcolor=\"#FF9900\" style=\"font-size:12px;\">Tariff</td>" +
            "<td align=\"center\" bgcolor=\"#FF9900\" style=\"font-size:12px;\">Location</td>" +
            "<td align=\"center\" bgcolor=\"#FF9900\" style=\"font-size:12px;\">Travel to city</td>" +
            "</tr>" +
            "<tr>" +
            "<td align=\"center\" bgcolor=\"#eeeeee\" style=\"font-size:12px;\">" + exists.PropertyName + "</td>" +
            "<td align=\"center\" bgcolor=\"#eeeeee\" style=\"font-size:12px;\">" + exists.RoomType + "</td>" +
            "<td align=\"center\" bgcolor=\"#eeeeee\" style=\"font-size:12px;\">" + exists.Tariff + "</td>" +
            "<td align=\"center\" bgcolor=\"#eeeeee\" style=\"font-size:12px;\">" + exists.CityName + "</td>" +
            "<td align=\"center\" bgcolor=\"#eeeeee\" style=\"font-size:12px;\">" + exists.Locality + "</td>" +
            "</tr>" +
            "</table></td>" +
            "</tr>" +
            "<tr>" +
            "<td style=\"padding:20px;\"><!-- Space for approval button--></td>" +
            "</tr>" +
            "<tr>" +
            "<td valign=\"top\"><table width=\"600\" border=\"0\" cellspacing=\"1\" cellpadding=\"0\">" +
            "<tr>" +
            "<td bgcolor=\"#cccccc\" width=\"50%\" style=\"font-size:12px; padding:10px;text-align:center\">" +
            "<div>" +
            "<a style=\"border:1px solid #1e5021;border-radius:4px;display:inline-block;font-family:sans-serif;font-size:20px;font-weight:bold;line-height:40px;text-align:center;text-decoration:none;width:200px;-webkit-text-size-adjust:none;mso-hide:all;\">" + "Status : Cancelled" + "</a></div>" +
            "</td>" +
            "</tr>" +
            "</table></td>" +
            "</tr>" +
            "<tr>" +
            "<td valign=\"middle\" bgcolor=\"#5b5b5b\" style=\"font-size:12px; padding:10px; color:#fff;\" align=\"left\">For booking Support : 08182-268378</td>" +
            "</tr>" +
            "<tr>" +
            "<td valign=\"middle\" bgcolor=\"#5b5b5b\" style=\"font-size:12px; padding:10px; color:#fff;\" align=\"left\">Powered by HummingBird </td>" +
            "</tr>" +
            "</table></td>" +
            "</tr>" +
            "</table></td>" +
            "</tr>" +
            "</table>";

          var EmailContent = Newdetails;
          let mailOptions = {
            from: '"No Reply" <stay@hummingbirdindia.com>',
            to: exists.EmailId,
            cc: "hbconf17@gmail.com",
            subject: 'Hotel-Guest house request - Intimation : ' + exists.StayBookingId,
            html: EmailContent
          };
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              return console.log(error);
            }
            else {
              res.status(200).send({ "data": exists });
              sql.close();
            }
          });
        })
      }
      else {
        res.status(200).send({ "data": exists });
        sql.close();
      }
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
      winlogger.log('error', err.message);
      sql.close();
    });
};
