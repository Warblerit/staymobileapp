const sql = require("mssql");
const config = require("../config");
const request = new sql.Request();
const jwt = require("jsonwebtoken");
const winlogger = require("../log");
const nodemailer = require('nodemailer');
exports.getUsers = function (req, res) {
    new sql.ConnectionPool(config)
        .connect()
        .then(pool => {
            return pool
                .request()
                .input("Action", "PageLoad")
                .input("Id", req.params.clientId)
                .input("UserId", 0)
                .input("Str", "")
                .execute("SP_UserMaster_Help");
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

exports.EmployeesLoad = function (req, res) {
    new sql.ConnectionPool(config)
        .connect()
        .then(pool => {
            return pool
                .request()
                .input("Action", "DataLoad")
                .input("Id", req.body.ClientId)
                .input("UserId", 0)
                .input("Str", "")
                .execute("SP_UserMaster_Help");
        })
        .then(result => {
            //  const rows = result.recordsets[0][0];
            if (result.recordsets.length > 0) {

                res.status(200).json({ "data": result.recordsets[0] })
            }
            else {
                res.status(500).send({ message: 'Error Load users' })
            }
            sql.close();
        })
        .catch(err => {
            res.status(500).send({ message: err.message });
            sql.close();
        });
}
exports.UserAdd = function (req, res) {
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
                .input("Action", "UserInsert")
                .input("UserGroup", req.body.UserGroup)
                .input("UserName", req.body.UserName)
                .input("Email", req.body.EmailId)
                .input("FirstName", req.body.FirstName)
                .input("LastName", req.body.LastName)
                .input("MobileNumber", req.body.MobileNumber)
                .input("EmployeeID", req.body.EmployeeId)
                .input("ClientId", req.body.ClientId)
                .input("ClientName", req.body.ClientName)
                .input("Designation", req.body.Designation)
                .input("CostCenter", req.body.CostCenter)
                .input("Department", req.body.Derpartment)
                .input("Id", 0)
                .input("CreatedBy", req.body.UserId)
                .execute("SP_UserMaster_Insert");
        })
        .then(result => {
            //var exists=result.recordsets[0][0];
            const rowss = result.recordsets[0];
            var exists = rowss[0];
            if (exists.ErrMsg != "UserName or EmailId Already Exist") {

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
                    var header = "<div style=\"width: 100%; background: #ebebeb; padding: 50px 0;\">" +
                        "<div class=\"Header\" style=\"width: 60%; margin: 0 auto; background: #ffffff;padding: 20px; border-top: 3px solid #499681;\">" +
                        "<div style=\"width: 100%; margin: 0 auto;\"><div style=\"width:50%; display: inline-block; vertical-align: middle;\">" +
                        "<img src=\"http://endpoint887127.azureedge.net/img/new.png\" width=\"125\" height=\"auto\" alt=\"\" title=\"\"></div>";


                    var clientLogo = "<div class=\"Header\" style=\"width:50%; display: inline-block; vertical-align: middle; text-align: right;\">" +
                        "<img src='" + exists.ClientLogo + "' width=\"125\" height=\"auto\" alt=\"\" title=\"\">" +
                        "</div></div>";


                    var message =
                        " <table cellpadding=\"0\" cellspacing=\"0\" width=\"600\" border=\"0\" align=\"center\" style=\"padding-top:30px;\">" +
                        " <tr style=\"font-size:12px; \">" +
                        " <td width=\"600\" style=\"padding:12px 5px;\">" +
                        " <p style=\"margin-top:20px;\">" +
                        " <span> System generated email. Please do not reply. </span>" +
                        " <style=\"margin-top:20px;\">" +
                        " <span style=\"float:right\"  >   Date : " + exists.Dt + "</span><br>" +
                        " </td></tr></table>";

                    var Url = config.clientUrl + "signup/" + exists.RowId;
                    var regLink =
                        " <table cellpadding=\"0\" cellspacing=\"0\" width=\"600\" border=\"0\" align=\"center\" style=\"padding-top:0px;\">" +
                        " <tr style=\"font-size:12px;\">" +
                        " <td width=\"600\" style=\"padding:3px 5px;\">" +
                        " <p style=\"margin-top:10px;\">" +
                        " <span>Dear " + req.body.UserName + " </span> " + " <br>" +
                        " </p>" +
                        " <span>Welcome to Stay Simplyfied. India's first digital automation platform for Business STAY.</span> " +
                        " <br>" + " </p>" + " <p style=\"margin-top:20px;\">" +
                        "<p style=\"text-align: center; font-size: 14px; word-spacing: 150%; line-height: 150%;font-family: arial;\">" +
                        "<a href=\"" + Url + "\"  style=\"background-color: #4CAF50; padding: 10px; text-align: center; border-radius: 2px; color:#ffffff; font-weight: bold; cursor: pointer; text-decoration: none;\">Register Now </a>" +
                        "</p>" +
                        " <span>Thanks for your interest in Staysimplyfied.com. To confirm your email address press the button above or follow this link." + "<br>" + Url + " </span> " +
                        //" <span>Thanks for your interest in Staysimplyfied.com. Please use the link below to activate your Staysimplyfied account." + "<br>" + "http://localhost:42517/activation?Activationid=" + obj.RowId.ToString().Replace("-", "") + " </span> " +
                        " </p>" +
                        "<table width=\"000\" cellpadding=\"10\" align=\"center\" style=\"border-collapse: collapse; padding: 10px;\">" +
                        "<tr style=\"font-size:11px; font-weight:normal;  border: 1px solid black;\">" +
                        "<td style=\" border: 1px solid black;\" align=\"center\" valign=\"center\"><img src=\"https://portalvhds4prl9ymlwxnt8.blob.core.windows.net/clogo/clogo/analytics.png\"  align=\"center\">  <br>" +
                        "<p style=\"text-align: center; font-size: 11px; word-spacing: 120%; line-height: 120%;font-family: arial;\"> Analytics help you to make intelligent, real-time & informed decision.</p> " +
                        "</td>" +
                        "<td style=\"border: 1px solid black;\" align=\"center\" valign=\"center\"><img src=\"https://portalvhds4prl9ymlwxnt8.blob.core.windows.net/clogo/clogo/booking-tool.png\" align=\"center\"> " + "<br>" +
                        "<p style=\"text-align: center; font-size: 11px; word-spacing: 120%; line-height: 120%;font-family: arial;\"> AI Powered efficient Booking tool with concierge desk. </p> " +
                        "</td>" +
                        "<td style=\"border: 1px solid black;\" align=\"center\" valign=\"center\"><img src=\"https://portalvhds4prl9ymlwxnt8.blob.core.windows.net/clogo/clogo/expense-tracking.png\" align=\"center\" > <br>" +
                        "<p style=\"text-align: center; font-size: 11px; word-spacing: 120%; line-height: 120%;font-family: arial;\"> Travel Expenses capture for Compliance and Audit. </p> " +
                        "</td>" +
                        "</tr >" +
                        "<tr style=\"font-size:11px; font-weight:normal; border: 1px solid black;\">" +
                        "<td style=\"border: 1px solid black;\" align=\"center\" valign=\"center\"><img src=\"https://portalvhds4prl9ymlwxnt8.blob.core.windows.net/clogo/clogo/personlization.png\" align=\"center\"> <br>" +
                        "<p style=\"text-align: center; font-size: 11px; word-spacing: 120%; line-height: 120%;font-family: arial;\"> Customized to operage within Govt Norms and present ingrastructure. </p> " +
                        "</td>" +
                        "<td style=\"border: 1px solid black;\" align=\"center\" valign=\"center\"><img src=\"https://portalvhds4prl9ymlwxnt8.blob.core.windows.net/clogo/clogo/policy.png\" align=\"center\" >  <br>" +
                        "<p style=\"text-align: center; font-size: 11px; word-spacing: 120%; line-height: 120%;font-family: arial;\"> 100% Travel Policy Compliance. </p>" +
                        "</td >" +
                        "<td style=\"border: 1px solid black;\" align=\"center\" valign=\"center\"><img src=\"https://portalvhds4prl9ymlwxnt8.blob.core.windows.net/clogo/clogo/trip-approval.png\"  align=\"center\">  <br>" +
                        "<p style=\"text-align: center; font-size: 11px; word-spacing: 120%; line-height: 120%;font-family: arial;\"> Alert based multi-level approval features. </p> " +
                        "</td>" +
                        "</tr></table>" +
                        " <p style=\"margin-top:30px;\">" +
                        " <span>Once your account is activated, you can login by using your email address and password by visiting our website.</span> " + "  <br>" +
                        " </p>" +
                        " <span style=\"font-weight:bold\"> CompanyName : " + req.body.ClientName + " </span> " + "  <br>" +
                        " <span style=\"font-weight:bold\"> Username : " + req.body.EmailId + " </span> " + "  <br>" +
                        " <p style=\"margin-top:5px;\">" +
                        " <span>  If you did interested in Staysimplyfied account, simply ignore this email and your account will not be activated and all information stored will be erased in 7 business days. </span> " + "  <br>" +
                        " </p>" +
                        " <p style=\"margin-top:5px;\">" +
                        " <span>  If you have problems signing in, please call 1800-425-3454 or email us at stay@staysimplyfied.com </span> " + "  <br>" +
                        " </p>" + " <br>" +
                        " <p style=\"margin-top:5px;\">" +
                        //" <span>  We look forward to your patronage and hope you continue to support us. </span> " +
                        " </p></td></tr></table>";

                    var footer =
                        " <table cellpadding=\"0\" cellspacing=\"0\" width=\"600\" border=\"0\" align=\"center\" style=\"padding-top:10px;\">" +
                        " <tr style=\"font-size:11px; font-weight:normal;\"> " +
                        " <td colspan=\"3\" style=\"padding-top:30px;\"> <p style=\"color:orange; font-weight:bold; margin:0px; font-size:11px;\"> Thanking You, <br>" +
                        " Team Stay Simplyfied </p> " + " <br>" +
                        //   " <p style=\"color:orange; font-weight:bold; margin:0px; font-size:11px; padding-top:20px;\">Disclaimer :</p>" +
                        //   " <p style=\"font-size:10px; padding-top:10px; padding-bottom:20px;\">" +// Disclaimer + "</p>" +
                        " </td></tr> </table>" +
                        "</div>";
                    var EmailContent = header + clientLogo + message + regLink + footer;
                    let mailOptions = {
                        from: '"No Reply" <stay@hummingbirdindia.com>',
                        to: req.body.EmailId,

                        subject: req.body.ClientName + 'Welcome to Stay Simplyfied',
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
exports.UserUpdate = function (req, res) {
    new sql.ConnectionPool(config)
        .connect()
        .then(pool => {
            return pool
                .request()
                .input("Action", "UserUpdate")
                .input("UserGroup", req.body.UserGroup)
                .input("UserName", req.body.UserName)
                .input("Email", req.body.EmailId)
                .input("FirstName", req.body.FirstName)
                .input("LastName", req.body.LastName)
                .input("MobileNumber", req.body.MobileNumber)
                .input("EmployeeID", req.body.EmployeeId)
                .input("ClientId", req.body.ClientId)
                .input("ClientName", req.body.ClientName)
                .input("Designation", req.body.Designation)
                .input("CostCenter", req.body.CostCenter)
                .input("Department", req.body.Derpartment)
                .input("Id", req.body.Id)
                .input("CreatedBy", req.body.UserId)
                .execute("SP_UserMaster_Insert");
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
exports.Userdelete = function (req, res) {
    new sql.ConnectionPool(config)
        .connect()
        .then(pool => {
            return pool
                .request()
                .input("Action", 'UserDelete')
                .input("Id", req.body.Id)
                .input("UserId", req.body.UserId)
                .input("Str", "")
                .execute("SP_UserMaster_Help");
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
exports.SendInvite = function (req, res) {
    var GuestId = req.body.GuestId;
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
                .input("Action", "GuestLoad")
                .input("Id", req.body.GuestId)
                .input("UserId", 0)
                .input("Str", "")
                .execute("SP_UserMaster_Help");
        })
        .then(result => {
            const rows = result.recordsets[0];

            const Email = rows[0].Email;
            const GuestName = rows[0].GuestName;
            const RowId = rows[0].RowId;
            const Id = rows[0].Id;
            const ClientLogo = rows[0].ClientLogo;
            const ClientName = rows[0].ClientName;
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

                var header = "<div style=\"width: 100%; background: #ebebeb; padding: 50px 0;\">" +
                    "<div class=\"Header\" style=\"width: 60%; margin: 0 auto; background: #ffffff;padding: 20px; border-top: 3px solid #499681;\">" +
                    "<div style=\"width: 100%; margin: 0 auto;\"><div style=\"width:50%; display: inline-block; vertical-align: middle;\">" +
                    "<img src=\"http://endpoint887127.azureedge.net/img/new.png\" width=\"125\" height=\"auto\" alt=\"\" title=\"\"></div>";


                var clientLogo = "<div class=\"Header\" style=\"width:50%; display: inline-block; vertical-align: middle; text-align: right;\">" +
                    "<img src='" + ClientLogo + "' width=\"125\" height=\"auto\" alt=\"\" title=\"\">" +
                    "</div></div>";

                var guestName = "<div class=\"Content1\" style=\"width: 60%; border-top: 4px solid #ebebeb; margin: 0 auto; background: #ffffff;padding: 20px;\">" +
                    "<p style=\"text-align: justify; font-size: 14px; word-spacing: 150%; line-height: 150%; font-family: arial;\"><b>Hey " + GuestName + ",</b></p>" +
                    "<p style=\"text-align: justify; font-size: 14px; word-spacing: 150%; line-height: 150%; font-family: arial;\">Mobident has invited you to use Staysimplified to book travel.</p>";

                var Url = config.clientUrl + "signup/" + RowId;

                var regLink = "<p style=\"text-align: center; font-size: 14px; word-spacing: 150%; line-height: 150%;font-family: arial;\">" +
                    "<a href=\"" + Url + "\"  style=\"background-color: #4CAF50; padding: 10px; text-align: center; border-radius: 2px; color:#ffffff; font-weight: bold; cursor: pointer; text-decoration: none;\">Register Now </a>" +
                    "</p>";

                var content = "<p style=\"text-align: justify; font-size: 14px; word-spacing: 150%; line-height: 150%;font-family: arial;\">As part of Staysimplified you'll get better rates, better rooms, simple cancellations, and much more. </p>" +
                    "<p style=\"text-align: justify; font-size: 14px; word-spacing: 150%; line-height: 150%; font-family: arial;\">We'd love to hear from you - feel free to email us directly with any questions, comments, or feedback. </p> <br>" +
                    "<table width=\"000\" cellpadding=\"10\" align=\"center\" style=\"border-collapse: collapse; padding: 10px;\">" +
                    "<tr style=\"font-size:11px; font-weight:normal;  border: 1px solid black;\">" +
                    "<td style=\" border: 1px solid black;\" align=\"center\" valign=\"center\"><img src=\"https://portalvhds4prl9ymlwxnt8.blob.core.windows.net/clogo/clogo/analytics.png\"  align=\"center\">  <br>" +
                    "<p style=\"text-align: center; font-size: 11px; word-spacing: 120%; line-height: 120%;font-family: arial;\"> Analytics help you to make intelligent, real-time & informed decision.</p> " +
                    "</td>" +
                    "<td style=\"border: 1px solid black;\" align=\"center\" valign=\"center\"><img src=\"https://portalvhds4prl9ymlwxnt8.blob.core.windows.net/clogo/clogo/booking-tool.png\" align=\"center\"> " + "<br>" +
                    "<p style=\"text-align: center; font-size: 11px; word-spacing: 120%; line-height: 120%;font-family: arial;\"> AI Powered efficient Booking tool with concierge desk. </p> " +
                    "</td>" +
                    "<td style=\"border: 1px solid black;\" align=\"center\" valign=\"center\"><img src=\"https://portalvhds4prl9ymlwxnt8.blob.core.windows.net/clogo/clogo/expense-tracking.png\" align=\"center\" > <br>" +
                    "<p style=\"text-align: center; font-size: 11px; word-spacing: 120%; line-height: 120%;font-family: arial;\"> Travel Expenses capture for Compliance and Audit. </p> " +
                    "</td>" +
                    "</tr >" +
                    "<tr style=\"font-size:11px; font-weight:normal; border: 1px solid black;\">" +
                    "<td style=\"border: 1px solid black;\" align=\"center\" valign=\"center\"><img src=\"https://portalvhds4prl9ymlwxnt8.blob.core.windows.net/clogo/clogo/personlization.png\" align=\"center\"> <br>" +
                    "<p style=\"text-align: center; font-size: 11px; word-spacing: 120%; line-height: 120%;font-family: arial;\"> Customized to operage within Govt Norms and present ingrastructure. </p> " +
                    "</td>" +
                    "<td style=\"border: 1px solid black;\" align=\"center\" valign=\"center\"><img src=\"https://portalvhds4prl9ymlwxnt8.blob.core.windows.net/clogo/clogo/policy.png\" align=\"center\" >  <br>" +
                    "<p style=\"text-align: center; font-size: 11px; word-spacing: 120%; line-height: 120%;font-family: arial;\"> 100% Travel Policy Compliance. </p>" +
                    "</td >" +
                    "<td style=\"border: 1px solid black;\" align=\"center\" valign=\"center\"><img src=\"https://portalvhds4prl9ymlwxnt8.blob.core.windows.net/clogo/clogo/trip-approval.png\"  align=\"center\">  <br>" +
                    "<p style=\"text-align: center; font-size: 11px; word-spacing: 120%; line-height: 120%;font-family: arial;\"> Alert based multi-level approval features. </p> " +
                    "</td>" +
                    "</tr></table> <br> <br>" +
                    "<p style=\"text-align: justify; font-size: 14px; word-spacing: 150%; line-height: 150%;font-family: arial;\">The Staysimplified Team <br />" +
                    "<a href=\"www.Staysimplified.com\" style=\"text-decoration: none;\">www.Staysimplified.com</a></p> <br>" +
                    "</div>";

                var footer = "<div class=\"footer\" style=\"width: 60%; border-top: 4px solid #ebebeb; margin: 0 auto; background: #ffffff;padding: 20px;\">" +
                    "<p style=\"color: #bbb;text-align: center;\">Staysimplified is a product of Humming Bird Digital Private Limited</p></div></div>";

                var EmailContent = header + clientLogo + guestName + regLink + content + footer;

                let mailOptions = {
                    from: '"No Reply" <stay@hummingbirdindia.com>',
                    to: Email,
                    subject: req.body.ClientName + ' invited you to Staysimplified',
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
                                    .input("Action", "GuestUpdate")
                                    .input("Id", req.body.GuestId)
                                    .input("UserId", 0)
                                    .input("Str", "")
                                    .execute("SP_UserMaster_Help");
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
            res.status(500).send({ message: err.message });
            winlogger.log('error', err.message);
            sql.close();
        });
}
exports.UserDataLoad = function (req, res) {
    new sql.ConnectionPool(config)
        .connect()
        .then(pool => {
            return pool
                .request()
                .input("Action", "GetUserData")
                .input("Id", 0)
                .input("UserId", 0)
                .input("Str", req.body.rowid)
                .execute("SP_UserMaster_Help");
        }).then(result => {
            let rows = result.recordsets[0];
            res.status(200).send({ "data": rows })
            sql.close();
        }).catch(err => {
            res.status(500).send({ message: err.message })
            sql.close();
        })

}

//anbu
// exports.PasswordUpdate = function (req, res) {
//     new sql.ConnectionPool(config)
//         .connect()
//         .then(pool => {
//             return pool
//                 .request()
//                 .input("Action", "Password_update")
//                 .input("Id", req.body.Id)
//                 .input("UserId", 0)
//                 .input("Str", req.body.Password)
//                 .execute("SP_UserMaster_Help");
//         })
//         .then(result => {
//             let rows = result.recordsets[0];
//             res.status(200).send({ "data": rows })
//             sql.close();
//         })
//         .catch(err => {
//             res.status(500).send({ message: err.message });
//             sql.close();
//         });
// }

//sathish
exports.PasswordUpdate = function (req, res) {
    new sql.ConnectionPool(config)
        .connect()
        .then(pool => {
            return pool
                .request()
                .input("Action", "Password_update")
                .input('ClientName', '')
                .input('ClientId', '')
                .input('UserGroup', '')
                .input('FirstName', '')
                .input('LastName', '')
                .input('Email', '')
                .input('MobileNumber', '')
                .input('DomainName', '')
                .input('Designation', req.body.Designation)
                .input('Title', req.body.Title)
                .input('EmployeeId', req.body.EmployeeId)
                .input("UId", req.body.Id)
                // .input("UserId", 0)
                .input("Str", req.body.Password)
                .execute("SS_SP_NewclientSignup_Help");
        })
        .then(result => {
            let rows = result.recordsets[0];
            res.status(200).send({ "data": rows })
            sql.close();
        })
        .catch(err => {
            res.status(500).send({ message: err.message });
            sql.close();
        });
}