const sql = require("mssql");
const config = require("../config");
const request = new sql.Request();
const jwt = require("jsonwebtoken");
const winlogger = require("../log");
const nodemailer = require('nodemailer');


exports.checkIfGuestExists = function (req, res) {


  new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
      return pool
        .request()
        .input('input_parameter', req.params.GuestId)


        .query(`  select top 1 * FROM wrbhbuser where GuestId = @input_parameter and IsActive=1 and IsDeleted=0`)
    }).then(result => {

      return res.status(200).json({ response: result.recordsets[0][0] })

    }).catch(err => {

      return res.status(500).send({ message: err.message })

    })

}


exports.getRequests = function (req, res) {
  new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
      return pool
        .request()
        .input("Action", "PageLoad")
        .input("StayBookingId", 0)
        .input("ClientId", req.params.ClientId)
        .input("StayGuestId", 0)
        .input("Remarks", "")
        .input("UserId", req.params.UserId)
        .execute("SP_BookingPending_Help");
    })
    .then(result => {
      //  const rows = result.recordsets[0][0];
      if (result.recordsets.length > 0) {
        res.status(200).json({ "data": result.recordsets })
      }
      else {
        res.status(500).send({ message: 'Error Load bookings' })
      }

      sql.close();
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
      winlogger.log('error', err.message);
      sql.close();
    });
};

exports.getRequestHistory = function (req, res) {
  new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
      return pool
        .request()
        .input("Action", "RequestHistory")
        .input("StayBookingId", 0)
        .input("ClientId", req.params.ClientId)
        .input("StayGuestId", 0)
        .input("Remarks", "")
        .input("UserId", req.params.UserId)
        .execute("SP_BookingPending_Help");
    })
    .then(result => {
      //  const rows = result.recordsets[0][0];
      if (result.recordsets.length > 0) {
        res.status(200).json({ "data": result.recordsets })
      }
      else {
        res.status(500).send({ message: 'Error Load bookings' })
      }

      sql.close();
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
      winlogger.log('error', err.message);
      sql.close();
    });
};

exports.RequestApprove = function (req, res) {
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
        .input("Action", "RequestApproved")
        .input("StayBookingId", req.body.StayBookingId)
        .input("ClientId", req.body.ClientId)
        .input("StayGuestId", req.body.StayGuestId)
        .input("Remarks", req.body.Remarks)
        .input("UserId", req.body.UserId)
        .execute("SP_BookingPending_Help");
    })
    .then(result => {

      const rowss = result.recordsets[1];
      var exists = rowss[0];
      if (result.recordsets[0][0].Sts == "Request has been Approved Successfully") {

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
            "<td align=\"left\" height=\"30px\" width=\"160px\" bgcolor=\"#eeeeee\" style=\"font-size:12px;\"> " + "This is a Hotel / Guest House booking request which is approved and to be booked." + "</td>" +
            "</tr>" +
            "<br/>" +
            "<table width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"font-family:Verdana; font-size:12px;\">" +
            "<tr>" +
            "<td valign=\"top\"><table width=\"600\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" align=\"center\" style=\"border:1px solid #5b5b5b;\">" +
            "<tr>" +
            "<td valign=\"top\"><table border=\"0\" cellspacing=\"0\" cellpadding=\"0\">" +
            "<tr>" +
            "<td valign=\"middle\" align=\"left\" style=\"padding:10px;\"><img style=\"padding:10px;\" src='" + exists.ClientLogo + "' width=\"150\" alt=\"logo\"/></td>" +
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
            "<a style=\"border:1px solid #1e5021;border-radius:4px;display:inline-block;font-family:sans-serif;font-size:20px;font-weight:bold;line-height:40px;text-align:center;text-decoration:none;width:200px;-webkit-text-size-adjust:none;mso-hide:all;\">" + "Status : Approved" + "</a></div>" +
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
            subject: 'Hotel-Guest house request - Intimation : ' + exists.StayBookingId,
            html: EmailContent
          };
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.log(error);
              res.status(500).send({ message: 'Approval Email Error' });

            }
            else {

              sql.close();

            }
          });
        })
      }

      if (result.recordsets.length > 2) {
        if (result.recordsets[2][0].Sts == "Recommendation") {

          //send recommendation if no grade exists or if no approval needed or once manager has approved all guests in that request

          let approvalGuestDetails = result.recordsets[4]
          let bookingEmailDetails = result.recordsets[3][0]
          let propEmailDetails = result.recordsets[5][0]
          let logoDetails = result.recordsets[6][0]
          let fromEmailId = result.recordsets[7][0].FromEmailId

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

            Imagebody =
              " <table cellpadding=\"0\" cellspacing=\"0\" width=\"800px\" border=\"0\" align=\"center\" style=\" position: relative; font-family:  arial, helvetica; font-size: 12px;  border: #cccdcf solid 1px\">" +
              "<tr><td>" +
              "<table cellpadding=\"0\" cellspacing=\"0\" width=\"800px\" border=\"0\" align=\"center\">" +
              "<tr> " +
              "<th align=\"left\" width=\"50%\" style=\"padding: 10px 0px 10px 10px;\">" +
              "<img src=" + logoDetails.Logo + " width=\"150px\" alt=" + logoDetails.LogoName + ">" +
              "</th><th width=\"50%\"></th></tr></table>";
            NameBody =
              " <p style=\"margin:0px;\">Hello Team,</p><br>" +
              " <p style=\"margin:0px;\">Greetings for the Day.</p><br>" +
              " <p style=\"margin:0px;\">Please Check if the Rooms are available in below mentioned hotels.   [ Tracking Id: " + bookingEmailDetails.TrackingNo + " ]</p>" +
              " <p style=\"color:orange; font-weight:bold; font-size:14px;\">Guest and Property Details :</p>" +
              " <span style=\"color:#f54d02; font-weight:bold\">City : </span> " + bookingEmailDetails.CityName + "<br><br>" +
              " <span style=\"color:#f54d02; font-weight:bold\">Client Name : </span> " + bookingEmailDetails.ClientName + "<br><br>" +
              " <span style=\"color:#f54d02; font-weight:bold\">Property Name : </span> " + propEmailDetails.PropertyName + "<br><br>" +
              "<br><br>";
            GridBody =
              " <table cellpadding=\"0\" cellspacing=\"0\" width=\"800px\" border=\"0\" align=\"center\">" +
              " <tr style=\"font-size:11px; font-weight:normal;\">" +
              " <th style=\"background-color:#ccc; padding:6px 0px; border-right:1px solid #666;\"><p>Property</p></th>" +
              " <th style=\"background-color:#ccc; padding:6px 0px; border-right:1px solid #666;\"><p>Type</p></th>" +
              " <th style=\"background-color:#ccc; padding:6px 0px; border-right:1px solid #666;\"><p>Location</p></th>" +
              " <th style=\"background-color:#ccc; padding:6px 0px; border-right:1px solid #666;\"><p>Room Type</p></th>" +
              " <th style=\"background-color:#ccc; padding:6px 0px; border-right:1px solid #666;\"><p>Single Tariff</p></th>" +
              " <th style=\"background-color:#ccc; padding:6px 0px; border-right:1px solid #666;\"><p>Double Tariff</p></th>" +
              " <th style=\"background-color:#ccc; padding:6px 0px; border-right:1px solid #666;\"><p>Inclusions</p></th>" +
              " <th style=\"background-color:#ccc; padding:6px 0px; border-right:1px solid #fff;\"><p>Check In Policy</p></th>" +
              " <th style =\"background-color:#ccc; padding:6px 0px; border-right:1px solid #fff;\"><p>Request Initiated By</p></th>" +
              "</tr>";
            GridBody +=
              " <tr style=\"font-size:11px; font-weight:normal;\">" +
              " <td style=\"background-color:#eee; padding:6px 0px; border-right:1px solid #666;\"><p style=\"text-align:center;\">" + propEmailDetails.PropertyName + "</p></td>" +
              " <td style=\"background-color:#eee; padding:6px 0px; border-right:1px solid #666;\"><p style=\"text-align:center;\">" + propEmailDetails.PropertyType + "</p></td>" +
              " <td style=\"background-color:#eee; padding:6px 0px; border-right:1px solid #666;\"><p style=\"text-align:center;\">" + bookingEmailDetails.CityName + "</p></td>" +
              " <td style=\"background-color:#eee; padding:6px 0px; border-right:1px solid #666;\"><p style=\"text-align:center;\">" + propEmailDetails.RoomType + "</p></td>" +
              " <td style=\"background-color:#eee; padding:6px 0px; border-right:1px solid #666;\"><p style=\"text-align:center;\">" + propEmailDetails.SingleandMarkup1 + "</p></td>" +
              " <td style=\"background-color:#eee; padding:6px 0px; border-right:1px solid #666;\"><p style=\"text-align:center;\">" + propEmailDetails.DoubleandMarkup1 + "</p></td>" +
              " <td style=\"background-color:#eee; padding:6px 0px; border-right:1px solid #666;\"><p style=\"text-align:center;\">" + propEmailDetails.Inclusions + "</p></td>" +
              " <td style=\"background-color:#eee; padding:6px 0px; border-right:1px solid #fff;\"><p style=\"text-align:center;\">" + propEmailDetails.ChkInType + "</p></td>" +
              " <td style=\"background-color:#eee; padding:6px 0px; border-right:1px solid #fff;\"><p style=\"text-align:center;\">" + bookingEmailDetails.ClientBookerName + "</p></td>" +

              "</tr></table>";
            GridBody +=
              "<p style=\"margin-top:10px; margin-left:5px; font-size:11px;\">" +
              "<span style=\"color:#f54d02; font-weight:bold; font-size:11px;\">Tax </span><ul><li>  &#9733;   - Taxes as applicable</li><li> #   - Including Tax</li></ul></p>" +
              " <table cellpadding=\"0\" cellspacing=\"0\" width=\"800px\" border=\"0\" align=\"center\" style=\"padding-top:10px;\">" +
              " <tr style=\"font-size:11px; background-color:#eee;\">" +
              " <td width=\"100%\" style=\"padding:12px 5px;\">" +
              " <p style=\"margin-top:0px;\"><b>Conditions : </b><ul><li><b>All rates quoted are subject to availability and duration of Stay.</b></li><li>All Tariff quoted are limited and subject to availability and has to be confirmed in 30 mins from the time when these tariff's are generated " + bookingEmailDetails.Dt + ".</li><li>While every effort has been made to ensure the accuracy and availablity of all information.</li></ul></p>" +
              " <p style=\"margin-top:0px;\"><b>Cancellation Policy : </b> <ul><li> Cancellation of booking to be confirmed through Email.</li> " +
              "<li>Mail to be sent to stay@staysimplyfied.com and mention the booking ID no.</li>" +
              "<li>Cancellation policy varies from Property to property. Please verify confirmation email.</li></ul>" +
              " <p style=\"margin-top:20px;\"><b>Note : </b>" + "" + "<br>" +
              "</p>" +
              "</td></tr></table><br><br>";
            GridBody2 =
              " <table cellpadding=\"0\" cellspacing=\"0\" width=\"800px\" border=\"0\" align=\"center\">" +
              " <tr style=\"font-size:11px; font-weight:normal;\">" +
              " <th style=\"background-color:#ccc; padding:6px 0px; border-right:1px solid #666;\"><p>Guest Details</p></th>" +
              " <th style=\"background-color:#ccc; padding:6px 0px; border-right:1px solid #666;\"><p>Occupancy</p></th>" +
              " <th style=\"background-color:#ccc; padding:6px 0px; border-right:1px solid #666;\"><p>Checkin Date</p></th>" +
              " <th style=\"background-color:#ccc; padding:6px 0px; border-right:1px solid #666;\"><p>Checkout Date</p></th>" +
              " <th style=\"background-color:#ccc; padding:6px 0px; border-right:1px solid #666;\"><p>Tarrif</p></th>" +
              " <th style=\"background-color:#ccc; padding:6px 0px; border-right:1px solid #666;\"><p>Traiff Payment Mode</p></th>" +
              " <th style=\"background-color:#ccc; padding:6px 0px; border-right:1px solid #666;\"><p>Service Payment Mode</p></th>" +
              "</tr>";

            approvalGuestDetails.forEach(item => {

              GridBody2 +=
                " <tr style=\"font-size:11px; font-weight:normal;\">" +
                " <td style=\"background-color:#eee; padding:6px 0px; border-right:1px solid #666;width:auto;\"><p style=\"text-align:center;\">" + item.Name + "</p></td>" +
                " <td style=\"background-color:#eee; padding:6px 0px; border-right:1px solid #666;\"><p style=\"text-align:center;\">" + item.Occupancy + "</p></td>" +
                " <td style=\"background-color:#eee; padding:6px 0px; border-right:1px solid #666;\"><p style=\"text-align:center;\">" + bookingEmailDetails.CheckInDate + "</p></td>" +
                " <td style=\"background-color:#eee; padding:6px 0px; border-right:1px solid #666;\"><p style=\"text-align:center;\">" + bookingEmailDetails.CheckOutDate + "</p></td>" +
                " <td style=\"background-color:#eee; padding:6px 0px; border-right:1px solid #666;\"><p style=\"text-align:center;\">" + item.Tariff + "</p></td>" +
                " <td style=\"background-color:#eee; padding:6px 0px; border-right:1px solid #666;\"><p style=\"text-align:center;\">" + item.TariffMode + "</p></td>" +
                " <td style=\"background-color:#eee; padding:6px 0px; border-right:1px solid #666;\"><p style=\"text-align:center;\">" + item.ServiceMode + "</p></td>" +
                "</tr>";



            })


            GridBody2 += "</table><br><br>";

            /*Add Custom fields in booking request email*/
            //  GridCustomFields =
            //                           " <table cellpadding=\"0\" cellspacing=\"0\" width=\"800px\" border=\"0\" align=\"center\">" +
            //                           " <tr style=\"font-size:11px; font-weight:normal;\">";
            // foreach (var item in Dictkeyvaluepair.Take(1))
            // {

            //     foreach (var res in item)
            //     {

            //         GridCustomFields += " <th style=\"background-color:#ccc; padding:6px 0px; border-right:1px solid #666;\"><p>" + Regex.Replace(res.Key, @"[\d-]", string.Empty) + "</p></th>";



            //     }

            // }
            // GridCustomFields += "</tr>";
            // foreach (var item in Dictkeyvaluepair)
            // {
            //     GridCustomFields += "<tr style=\"font-size:11px; font-weight:normal;\">";
            //     foreach (var res in item)
            //     {

            //         GridCustomFields += "<td style=\"background-color:#eee; padding:6px 0px; border-right:1px solid #666;\"><p style=\"text-align:center;\">" + res.Value + "</p></td>";


            //     }
            //     GridCustomFields += "</tr>";

            // }
            // GridCustomFields += "</table><br><br>";

            Newdetails = Imagebody + NameBody + GridBody2 + GridBody;

            var EmailContent = Newdetails;
            let mailOptions = {
              from: '"No Reply"' + fromEmailId,
              to: 'ravi@hummingbirdindia.com',
              cc: 'hbconf17@gmail.com',
              subject: "Recommended Hotel List TID - " + bookingEmailDetails.TrackingNo,
              html: EmailContent
            };
            transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                return console.log(error);
              }
              else {

                sql.close();
              }


            })

          })



        }
      }
      res.status(200).send({ message: result.recordsets[0][0].Sts });
      sql.close();

    })
    .catch(err => {
      res.status(500).send({ message: err.message });
      winlogger.log('error', err.message);
      sql.close();
    });
};

exports.RequestCancel = function (req, res) {
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
        .input("Action", "RequestDenied")
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
      var exists = result.recordsets[1];
      if (rowss[0].Sts == "Request has been Denied Successfully") {

        exists.forEach(element => {

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
              "<td valign=\"middle\" align=\"left\" style=\"padding:10px;\"><img style=\"padding:10px;\" src='" + element.ClientLogo + "' width=\"150\" alt=\"logo\"/></td>" +
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
              "<td align=\"center\" height=\"30px\" width=\"160px\" bgcolor=\"#eeeeee\" style=\"font-size:12px;\"> " + "HB/" + element.StayBookingId + "</td>" +
              "<td align=\"center\" height=\"30px\" width=\"160px\" bgcolor=\"#eeeeee\" style=\"font-size:12px;\">" + element.RequestType + "</td>" +
              "<td align=\"center\" height=\"30px\" width=\"110px\" bgcolor=\"#eeeeee\" style=\"font-size:12px;\">" + element.Requestby + "</td>" +
              "<td align=\"center\" height=\"30px\" width=\"100px\" bgcolor=\"#eeeeee\" style=\"font-size:12px;\">" + element.RequestDate + "</td>" +
              "<td align=\"center\" height=\"30px\" width=\"230px\" bgcolor=\"#eeeeee\" style=\"font-size:12px;\">" + element.ClientName + "</td>" +
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
              "<td align=\"center\" bgcolor=\"#FFCC66\" style=\"font-size:12px;\">" + element.EmpCode + "</td>" +
              "<td align=\"center\" bgcolor=\"#FFCC66\" style=\"font-size:12px;\">" + element.EmpName + "</td>" +
              "<td align=\"center\" bgcolor=\"#FFCC66\" style=\"font-size:12px;\">" + "" + "</td>" +
              "<td align=\"center\" bgcolor=\"#FFCC66\" style=\"font-size:12px;\">" + element.EmailId + " </td>" +
              "<td align=\"center\" bgcolor=\"#FFCC66\" style=\"font-size:12px;\">" + element.MobileNo + "</td>" +
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
              "<td align=\"center\" bgcolor=\"#FFCC66\" style=\"font-size:12px;\">" + element.Grade + "</td>" +
              "<td align=\"center\" bgcolor=\"#eeeeee\" style=\"font-size:12px;\">" + element.CheckInDate + "  " + element.ExpectedChkInTime + "</td>" +
              "<td align=\"center\" bgcolor=\"#eeeeee\" style=\"font-size:12px;\">" + element.CheckOutDate + "  " + element.ExpectedChkInTime + "</td>" +
              "<td align=\"center\" bgcolor=\"#eeeeee\" style=\"font-size:12px;\">" + "Client visit" + "</td>" +
              "<td align=\"center\" bgcolor=\"#eeeeee\" style=\"font-size:12px;\">" + element.Remarks + "</td>" +

              "</tr>" +
              "<tr>" +
              "<td align=\"center\" bgcolor=\"#FF9900\" style=\"font-size:12px;\">Hotel Name</td>" +
              "<td align=\"center\" bgcolor=\"#FF9900\" style=\"font-size:12px;\">Room Type</td>" +
              "<td align=\"center\" bgcolor=\"#FF9900\" style=\"font-size:12px;\">Tariff</td>" +
              "<td align=\"center\" bgcolor=\"#FF9900\" style=\"font-size:12px;\">Location</td>" +
              "<td align=\"center\" bgcolor=\"#FF9900\" style=\"font-size:12px;\">Travel to city</td>" +
              "</tr>" +
              "<tr>" +
              "<td align=\"center\" bgcolor=\"#eeeeee\" style=\"font-size:12px;\">" + element.PropertyName + "</td>" +
              "<td align=\"center\" bgcolor=\"#eeeeee\" style=\"font-size:12px;\">" + element.RoomType + "</td>" +
              "<td align=\"center\" bgcolor=\"#eeeeee\" style=\"font-size:12px;\">" + element.Tariff + "</td>" +
              "<td align=\"center\" bgcolor=\"#eeeeee\" style=\"font-size:12px;\">" + element.CityName + "</td>" +
              "<td align=\"center\" bgcolor=\"#eeeeee\" style=\"font-size:12px;\">" + element.Locality + "</td>" +
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
              to: element.EmailId,
              subject: 'Hotel-Guest house request - Intimation : ' + element.StayBookingId,
              html: EmailContent
            };
            transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                return console.log(error);
              }
              else {
                res.status(200).send({ "data": element });
                sql.close();
              }
            });
          })
        });
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