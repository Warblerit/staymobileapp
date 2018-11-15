const sql = require("mssql");
const config = require("../config");
const request = new sql.Request();
const winlogger = require("../log");
const nodemailer = require('nodemailer');
//auto complete client name 
exports.clientnames=function(req,res){
    new sql.ConnectionPool(config)
    .connect()
      .then(pool => {
        return pool
        .request()
        .input("Action","clientnames") 
        .input('Str',req.body.string)         
     .execute('SS_SP_AutocompleteRegister_Help')
    })
    .then(result =>{
    
if (result.recordsets.length > 0) {
  
    res.status(200).json({ "data": result.recordsets[0] })
  }
  else {
    res.status(500).json({ "message": 'Error' })
  }

  sql.close();
})
.catch(err => {
  res.status(500).json({ "message": err.message });
  // winlogger.log('error', message);
  sql.close();
});
};

// DOMINE CHECK
exports.domaincheck=function(req,res){
  new sql.ConnectionPool(config)
  .connect()
    .then(pool => {
      return pool
      .request()
      .input("Action","domaincheck") 
      .input('Str',req.body.exitdomain)         
   .execute('SS_SP_AutocompleteRegister_Help')
  })
  .then(result =>{
  
if (result.recordsets.length > 0) {

  res.status(200).json({ "data": result.recordsets[0] })
}
else {
  res.status(500).json({ "message": 'Error' })
}

sql.close();
})
.catch(err => {
res.status(500).json({ "message": err.message });
// winlogger.log('error', message);
sql.close();
});
};


// userinsert
exports.adminuserinsert=function(req,res){

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
      .input("Action","AdminUserInsert") 
      .input('ClientName',req.body.clientname)    
      .input('ClientId',req.body.clientid)  
      .input('UserGroup','TRAVELADMIN')  
      .input('UserName','')  
      .input('FirstName',req.body.firstname)  
      .input('LastName',req.body.lastname)  
      .input('Email',req.body.email)       
      .input('MobileNumber',req.body.mobileno)
      .input('CreatedBy', '')  
      .input('EmployeeID', '')  
      .input('Designation','')  
      .input('CostCenter', '')  
      .input('Department','')  
      .input('Id','') 
                

   .execute('SP_UserMaster_Insert')
  })
  .then(result =>{
    const rowss = result.recordsets[0];
    var exists = rowss[0];  
   
    if (req.body.clientid != 0 && exists.ErrMsg === undefined) {

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
          " <span>Dear " + req.body.firstname + " </span> " + " <br>" +
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
          " <span style=\"font-weight:bold\"> CompanyName : " + req.body.clientname + " </span> " + "  <br>" +
          " <span style=\"font-weight:bold\"> Username : " + req.body.email + " </span> " + "  <br>" +
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
          to: req.body.email,
          subject: req.body.ClientName + ' Welcome you to Stay Simplyfied',
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

exports.AdminNewUserinsert=function(req,res){

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
      .input("Action","newclient") 
      .input('ClientName',req.body.clientname)    
      .input('ClientId',req.body.clientid)  
      .input('UserGroup','TRAVELADMIN')       
      .input('FirstName',req.body.firstname)  
      .input('LastName',req.body.lastname)  
      .input('Email',req.body.email)       
      .input('MobileNumber',req.body.mobileno)  
      .input('DomainName',req.body.domainname)   
      .input('Designation','')
      .input('Title','')
      .input('EmployeeId','')
      .input('Str','')
      .input('UId','')
     .execute('SS_SP_NewclientSignup_Help')
  })
  .then(result =>{
    const rowss = result.recordsets[0];
    var exists = rowss[0];  
   
    if (req.body.clientid == 0 && exists.ErrMsg === undefined ) {

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


        // var clientLogo = "<div class=\"Header\" style=\"width:50%; display: inline-block; vertical-align: middle; text-align: right;\">" +
        //   "<img src='" + exists.ClientLogo + "' width=\"125\" height=\"auto\" alt=\"\" title=\"\">" +
        //   "</div></div>";


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
          " <span>Dear " + req.body.firstname + " </span> " + " <br>" +
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
          " <span style=\"font-weight:bold\"> CompanyName : " + req.body.clientname + " </span> " + "  <br>" +
          " <span style=\"font-weight:bold\"> Username : " + req.body.email + " </span> " + "  <br>" +
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
          //mail to client
        
        //mail to admin

        var headerHB = "<div style=\"width: 100%; background: #ebebeb; padding: 50px 0;\">" +
          "<div class=\"Header\" style=\"width: 60%; margin: 0 auto; background: #ffffff;padding: 20px; border-top: 3px solid #499681;\">" +
          "<div style=\"width: 100%; margin: 0 auto;\"><div style=\"width:50%; display: inline-block; vertical-align: middle;\">" +
          "<img src=\"http://endpoint887127.azureedge.net/img/new.png\" width=\"125\" height=\"auto\" alt=\"\" title=\"\"></div>";

          var messageHB =
          " <table cellpadding=\"0\" cellspacing=\"0\" width=\"600\" border=\"0\" align=\"center\" style=\"padding-top:30px;\">" +
          " <tr style=\"font-size:12px; \">" +
          " <td width=\"600\" style=\"padding:12px 5px;\">" +
          " <p style=\"margin-top:20px;\">" +
          " <span> System generated email. Please do not reply. </span>" +
          " <style=\"margin-top:20px;\">" +
          " <span style=\"float:right\"  >   Date : " + exists.Dt + "</span><br>" +
          " </td></tr></table>";

          var bodyHB =
          " <table cellpadding=\"0\" cellspacing=\"0\" width=\"600\" border=\"0\" align=\"center\" style=\"padding-top:0px;\">" +
          " <tr style=\"font-size:12px;\">" +
          " <td width=\"600\" style=\"padding:3px 5px;\">" +
          " <p style=\"margin-top:10px;\">" +
          " <span>Hi Team,  </span> " + " <br>" +
          " </p>" +
          " <span> A New client registration is done successfully. Please followup with this new client and give a personal touch </span> " +" <br>" +
                            
           " <p style=\"margin-top:30px;\">" +         
          " <span style=\"font-weight:bold\"> CompanyName : " + req.body.clientname + " </span> " + "  <br>" +
          " <span style=\"font-weight:bold\"> User Name : " + req.body.email + " </span> " + "  <br>" +
          " <span style=\"font-weight:bold\"> First Name : " + req.body.firstname + " </span> " + "  <br>" +
          " <span style=\"font-weight:bold\"> Last Name : " + req.body.lastname + " </span> " + "  <br>" +
          " <span style=\"font-weight:bold\"> Mobile Number : " + req.body.mobileno + " </span> " + "  <br>" +
          " <span style=\"font-weight:bold\"> Email : " + req.body.email + " </span> " + "  <br>" +         
          " </p>";  

          var footerHB =
          " <table cellpadding=\"0\" cellspacing=\"0\" width=\"600\" border=\"0\" align=\"center\" style=\"padding-top:10px;\">" +
          " <tr style=\"font-size:11px; font-weight:normal;\"> " +
          " <td colspan=\"3\" style=\"padding-top:30px;\"> <p style=\"color:orange; font-weight:bold; margin:0px; font-size:11px;\"> Thanking You, <br>" +
          " Team Stay Simplyfied </p> " + " <br>" +           
          " </td></tr> </table>" +
          "</div>";

        var EmailContentHB= headerHB + messageHB + bodyHB + footerHB;
        let mailOptionsHB={
          from:'"No Reply" <stay@hummingbirdindia.com>',
          to:req.body.email,
          cc: "hbconf17@gmail.com",
          subject: ' Welcome to Stay Simplyfied',
          html: EmailContentHB
        };

        var EmailContent = header + message + regLink + footer;
        let mailOptions = {
          from: '"No Reply" <stay@hummingbirdindia.com>',
          to: req.body.email,
          cc: "hbconf17@gmail.com",
          subject: req.body.clientname + ' Welcome to Stay Simplyfied',
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
       

        transporter.sendMail(mailOptionsHB, (error, info) => {
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
 
   
