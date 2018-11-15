const sql = require('mssql')
const config = require("../config");
const request = new sql.Request();
const jwt = require("jsonwebtoken");
var fs = require('fs');
var multer = require('multer');
var path = require('path');
var xlstojson = require("xls-to-json-lc");
var xlsxtojson = require("xlsx-to-json-lc");
const excel2Json = require('convert-excel-to-json');
var Isemail = require('isemail');
var capitalize = require('string-capitalize');
var stripchar = require('stripchar').StripChar;
const nodemailer = require('nodemailer');

//multers disk storage settings
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/')
    },
    filename: function (req, file, cb) {
        var datetimestamp = Date.now();
        cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1])
    }
});
//multer settings
var upload = multer({
    storage: storage,
    fileFilter: function (req, file, callback) {
        if (['xls', 'xlsx'].indexOf(file.originalname.split('.')[file.originalname.split('.').length - 1]) === -1) {
            return callback(new Error('Wrong extension type'));
        }
        callback(null, true);
    }
}).single('file');

/** API path that will upload the files */
exports.employee = function (req, res) {

    upload(req, res, function (err) {
        if (err) {
            res.json({ error_code: 1, err_desc: err });
            return;
        }
        /** Multer gives us file info in req.file object */
        if (!req.file) {
            res.json({ error_code: 1, err_desc: "No file passed" });
            return;
        }
        /** Check the extension of the incoming file and 
         *  use the appropriate module
         */
        if (req.file.originalname.split('.')[req.file.originalname.split('.').length - 1] === 'xlsx') {
            exceltojson = xlsxtojson;
        } else {
            exceltojson = xlstojson;
        }

        try {
            const result = excel2Json({
                sourceFile: req.file.path,
                sheets: ['Sheet1'],
                header: {
                    rows: 1
                }

            });



            if (result.length != 0) {
                console.log(result.Sheet1.length);
                if (result.Sheet1.length > 10000) {
                    try {
                        fs.unlinkSync(req.file.path);
                        res.status(200).send({ message: "Over Limit" });
                    } catch (e) {

                    }

                }
                else {

                    try {
                        fs.unlinkSync(req.file.path);
                    } catch (e) {
                    }

                    var ClientId = req.body.ClientId;
                    var UserId = req.body.UserId;
                    var InviteStatus = req.body.InviteStatus;
                    var JsonVal = JSON.stringify(result.Sheet1);
                    var jsondata = JSON.parse(JsonVal);
                    var Update = "";
                    var SessionId = "";
                    var MainCount = Math.ceil((jsondata.length / 10000));
                    var min = 0;
                    var max;



                    new sql.ConnectionPool(config)
                        .connect()
                        .then(pool => {

                            for (var j = 1; j <= MainCount; j++) {
                                Update = "";
                                SessionId = s4() + s4() + '-' + s4() + '-' + s4();
                                if (j == MainCount) {
                                    max = jsondata.length;
                                }
                                else {
                                    max = j * 10000;
                                }

                                for (var i = min; i < max; i++) {
                                    var EmailFlag = false;
                                    var Email = jsondata[i].G == undefined ? "" : jsondata[i].G;
                                    var empId = jsondata[i].A == undefined ? "" : jsondata[i].A;
                                    var Title = jsondata[i].B == undefined ? "Mr" : jsondata[i].B;
                                    var FirstName = jsondata[i].C == undefined ? "" : jsondata[i].C;
                                    var LastName = jsondata[i].D == undefined ? "" : jsondata[i].D;
                                    var Grade = jsondata[i].E == undefined ? "" : jsondata[i].E;
                                    var MobileNo = jsondata[i].F == undefined ? "" : jsondata[i].F;
                                    var Designation = jsondata[i].H == undefined ? "" : jsondata[i].H;
                                    var Nationality = jsondata[i].I == undefined ? "" : jsondata[i].I;
                                    var Column1 = jsondata[i].J == undefined ? "" : jsondata[i].J;
                                    var Column2 = jsondata[i].K == undefined ? "" : jsondata[i].K;
                                    var Column3 = jsondata[i].L == undefined ? "" : jsondata[i].L;
                                    var Column4 = jsondata[i].M == undefined ? "" : jsondata[i].M;
                                    var Column5 = jsondata[i].N == undefined ? "" : jsondata[i].N;
                                    var Column6 = jsondata[i].O == undefined ? "" : jsondata[i].O;
                                    var Column7 = jsondata[i].P == undefined ? "" : jsondata[i].P;
                                    var Column8 = jsondata[i].Q == undefined ? "" : jsondata[i].Q;
                                    var Column9 = jsondata[i].R == undefined ? "" : jsondata[i].R;
                                    var Column10 = jsondata[i].S == undefined ? "" : jsondata[i].S;
                                    var ManagerEmpCode = jsondata[i].T == undefined ? "" : jsondata[i].T;
                                    var SupervisorEmpCode = jsondata[i].U == undefined ? "" : jsondata[i].U;
                                    if (FirstName != '') {
                                        FirstName = capitalize(FirstName).trim();
                                        FirstName = stripchar.RSspecChar(FirstName);
                                    }
                                    if (LastName != '') {
                                        LastName = capitalize(LastName).trim();
                                        LastName = stripchar.RSspecChar(LastName);
                                    }
                                    if (Designation != '') {
                                        Designation = stripchar.RSspecChar(Designation);
                                    }
                                    if (Grade != '') {
                                        Grade = stripchar.RSspecChar(Grade);
                                    }
                                    if (MobileNo != '') {
                                        MobileNo = MobileNo;
                                    }
                                    if (Email != '') {
                                        if (Isemail.validate(Email)) {
                                            EmailFlag = true;
                                        }
                                        else {
                                            EmailFlag = false;
                                        }
                                    }
                                    else {
                                        EmailFlag = true;
                                    }


                                    if (EmailFlag) {
                                        Update += "insert into WRBHBClientManagementAddClientGuest_temp (CltmgntId,CompanyName,EmpCode,FirstName,LastName,Grade,GMobileNo,EmailId,CreatedBy,CreatedDate,IsActive,IsDeleted,Designation,GradeId,Nationality,Title,Column1,Column2,Column3,Column4,Column5,Column6,Column7,Column8,Column9,Column10,ManagerEmpCode,ManagerId,SupervisorEmpCode,SupervisorId,Invite,SessionNo) values(" + ClientId + ",'Warbler Software Technology','" + empId + "','" + FirstName + "','" + LastName + "','" + Grade + "', '" + MobileNo + "','" + Email + "'," + UserId + ",getdate(),1,0,'" + Designation + "',0,'" + Nationality + "','" + Title + "','" + Column1 + "','" + Column2 + "','" + Column3 + "','" + Column4 + "','" + Column5 + "','" + Column6 + "','" + Column7 + "','" + Column8 + "','" + Column9 + "','" + Column10 + "','" + ManagerEmpCode + "',0,'" + SupervisorEmpCode + "',0,CAST('" + InviteStatus + "' AS BIT),'" + SessionId + "');";

                                    }

                                    if (i == (max - 1) && j != MainCount) {
                                        pool
                                            .request()
                                            .input("Action", "Update")
                                            .input("ClientId", ClientId)
                                            .input("UniqueId", SessionId)
                                            .input("UsrId", UserId)
                                            .input("Id", 0)
                                            .input("Str", Update)
                                            .execute("SS_EmployeeImport_Help");
                                    }
                                    if (i == (max - 1) && j == MainCount) {
                                        return pool
                                            .request()
                                            .input("Action", "Update")
                                            .input("ClientId", ClientId)
                                            .input("UniqueId", SessionId)
                                            .input("UsrId", UserId)
                                            .input("Id", 0)
                                            .input("Str", Update)
                                            .execute("SS_EmployeeImport_Help");
                                    }



                                }
                                min = i;
                            }
                        })
                        .then(result => {
                            const rows = result.recordsets[0][0];
                            const rows1 = result.recordsets[0][0];
                            if (rows.Msg.toString() == "Ok" && rows1.Msg.toString() == "Ok") {
                                res.status(200).send({ message: "Success" });
                            }
                            else {
                                res.status(500).send({ message: "Error On Insert" });
                            }

                            sql.close();
                        })
                        .catch(err => {
                            res.status(500).send({ message: "Error" });
                            sql.close();
                        });







                }

            }

        } catch (e) {
            res.status(500).send({ message: "Invalid excel file" });
        }
    });
};

// exports.employee= function(req, res) {

//     upload(req,res,function(err){
//       if(err){
//            res.json({error_code:1,err_desc:err});
//            return;
//       }
//       /** Multer gives us file info in req.file object */
//       if(!req.file){
//           res.json({error_code:1,err_desc:"No file passed"});
//            return;
//       }
//       /** Check the extension of the incoming file and 
//        *  use the appropriate module
//        */
//       if(req.file.originalname.split('.')[req.file.originalname.split('.').length-1] === 'xlsx'){
//           exceltojson = xlsxtojson;
//       } else {
//           exceltojson = xlstojson;
//       }

//       try {
//           const result = excel2Json({
//               sourceFile: req.file.path,
//               sheets: ['Sheet1'],
//               header:{
//                   rows: 1 
//               }

//           });



//           if(result.length !=0) {
//              console.log(result.Sheet1.length);
//               if(result.Sheet1.length > 20000) {
//                   try {
//                       fs.unlinkSync(req.file.path); 
//                       res.status(200).send({message: "Over Limit"});
//                       } catch(e) {

//                       }

//               }
//               else {



//               var ClientId = req.body.ClientId;
//               var UserId = req.body.UserId;
//               var InviteStatus = req.body.InviteStatus;
//               var JsonVal =  JSON.stringify(result.Sheet1);
//               var jsondata = JSON.parse(JsonVal);
//               var Update = "";
//               var SessionId = s4() + s4() + '-' + s4() + '-' + s4();


//                   for(var i=0; i<jsondata.length; i++) {
//                       var EmailFlag = false; 
//                       var Email =  jsondata[i].G == undefined ? "" : jsondata[i].G;
//                       var empId =  jsondata[i].A == undefined ? "" : jsondata[i].A;
//                       var Title =  jsondata[i].B == undefined ? "Mr" : jsondata[i].B;
//                       var FirstName =  jsondata[i].C == undefined ? "" : jsondata[i].C;
//                       var LastName =  jsondata[i].D == undefined ? "" : jsondata[i].D;
//                       var Grade =  jsondata[i].E == undefined ? "" : jsondata[i].E;
//                       var MobileNo =  jsondata[i].F == undefined ? "" : jsondata[i].F;
//                       var Designation =  jsondata[i].H == undefined ? "" : jsondata[i].H;
//                       var Nationality =  jsondata[i].I == undefined ? "" : jsondata[i].I;
//                       var Column1 =  jsondata[i].J == undefined ? "" : jsondata[i].J;
//                       var Column2 =  jsondata[i].K == undefined ? "" : jsondata[i].K;
//                       var Column3 =  jsondata[i].L == undefined ? "" : jsondata[i].L;
//                       var Column4 =  jsondata[i].M == undefined ? "" : jsondata[i].M;
//                       var Column5 =  jsondata[i].N == undefined ? "" : jsondata[i].N;
//                       var Column6 =  jsondata[i].O == undefined ? "" : jsondata[i].O;
//                       var Column7 =  jsondata[i].P == undefined ? "" : jsondata[i].P;
//                       var Column8 =  jsondata[i].Q == undefined ? "" : jsondata[i].Q;
//                       var Column9 =  jsondata[i].R == undefined ? "" : jsondata[i].R;
//                       var Column10 =  jsondata[i].S == undefined ? "" : jsondata[i].S;
//                       var ManagerEmpCode =  jsondata[i].T == undefined ? "" : jsondata[i].T;
//                       var SupervisorEmpCode =  jsondata[i].U == undefined ? "" : jsondata[i].U; 
//                       if(FirstName!='') {
//                           FirstName  = capitalize(FirstName).trim();
//                           FirstName =stripchar.RSspecChar(FirstName);
//                       }
//                       if(LastName!='') {
//                           LastName  = capitalize(LastName).trim();
//                           LastName =stripchar.RSspecChar(LastName);
//                       }
//                       if(Designation!='') {
//                           Designation =stripchar.RSspecChar(Designation);
//                       }
//                       if(Grade!='') {
//                           Grade = stripchar.RSspecChar(Grade);
//                       }
//                       if(MobileNo!='') {
//                           MobileNo =   MobileNo;
//                       }
//                       if(Email !='') {
//                           if(Isemail.validate(Email)) {
//                               EmailFlag = true;
//                           }
//                           else {
//                               EmailFlag = false;
//                           }
//                       }
//                       else {
//                           EmailFlag = true;
//                       }


//                           if(EmailFlag) {
//                               Update += "insert into WRBHBClientManagementAddClientGuest_temp (CltmgntId,CompanyName,EmpCode,FirstName,LastName,Grade,GMobileNo,EmailId,CreatedBy,CreatedDate,IsActive,IsDeleted,Designation,GradeId,Nationality,Title,Column1,Column2,Column3,Column4,Column5,Column6,Column7,Column8,Column9,Column10,ManagerEmpCode,ManagerId,SupervisorEmpCode,SupervisorId,Invite,SessionNo) values("+ClientId+",'Warbler Software Technology','"+empId+"','"+FirstName+"','"+LastName+"','"+Grade+"', '"+MobileNo+"','"+Email+"',"+UserId+",getdate(),1,0,'"+Designation+"',0,'"+Nationality+"','"+Title+"','"+Column1+"','"+Column2+"','"+Column3+"','"+Column4+"','"+Column5+"','"+Column6+"','"+Column7+"','"+Column8+"','"+Column9+"','"+Column10+"','"+ManagerEmpCode+"',0,'"+SupervisorEmpCode+"',0,CAST('"+InviteStatus+"' AS BIT),'"+SessionId +"');";

//                           }


//                   }

//               new sql.ConnectionPool(config)
//               .connect()
//               .then(pool => {
//               return pool
//                   .request()
//                   .input("Action", "Update")
//                   .input("ClientId",ClientId) 
//                   .input("UniqueId", SessionId) 
//                   .input("UsrId",UserId)
//                   .input("Id",0)
//                   .input("Str",Update)
//                   .execute("SS_EmployeeImport_Help");
//               })
//               .then(result => {


//               const rows = result.recordsets[0][0];
//               const rows1 = result.recordsets[0][0];
//               if(rows.Msg.toString() == "Ok" && rows1.Msg.toString() == "Ok") {
//                   res.status(200).send({message: "Success"});
//               }
//               else {
//                   res.status(500).send({message:  "Error On Insert"});
//               }

//               sql.close();
//               })
//               .catch(err => {
//                   res.status(500).send({message: "Error"});
//               sql.close();
//               });

//               try {
//                   fs.unlinkSync(req.file.path); 
//                   } catch(e) {

//                   }
//               }
//           }




//       } catch (e){
//           res.status(500).send({message: "Invalid excel file"});
//       }
//   })
//   };

function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
}

exports.employeeinvite = function (req, res) {

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
                .input("Action", 'DataLoad')
                .input("Id", 0)
                .input("Str", '')
                .execute("SS_EmployeeInvite_Help");
        })
        .then(result => {
            let rows1 = result.recordsets[0];
            emailArray = rows1;

            new sql.ConnectionPool(config)
                .connect()
                .then(pool => {
                    let Temp = 0;

                    for (let i = 0; i < emailArray.length; i++) {

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
                                "<div style=\"width:50%; display: inline-block; vertical-align: middle;\">" +
                                "<img src=\"http://endpoint887127.azureedge.net/img/new.png\" width=\"125\" height=\"auto\" alt=\"\" title=\"\">" +
                                "</div>";

                            var clientLogo = "<div style=\"width:49%; display: inline-block; vertical-align: middle; text-align: right;\">" +
                                "<img src='" + ClientLogo + "' width=\"125\" height=\"auto\" alt=\"\" title=\"\">" +
                                "</div></div>";

                            var guestName = "<div class=\"Content1\" style=\"width: 60%; border-top: 4px solid #ebebeb; margin: 0 auto; background: #ffffff;padding: 20px;\">" +
                                "<p style=\"text-align: justify; font-size: 14px; word-spacing: 150%; line-height: 150%; font-family: arial;\"><b>Hey " + emailArray[i].FirstName + ",</b></p>" +
                                "<p style=\"text-align: justify; font-size: 14px; word-spacing: 150%; line-height: 150%; font-family: arial;\">Mobident has invited you to use Staysimplified to book travel.</p>";

                            var Url = config.clientUrl + "login/" + emailArray[i].RowId;

                            var regLink = "<p style=\"text-align: center; font-size: 14px; word-spacing: 150%; line-height: 150%;font-family: arial;\">" +
                                "<a href=\"" + Url + "\"  style=\"background-color: #4CAF50; padding: 10px; text-align: center; border-radius: 2px; color:#ffffff; font-weight: bold; cursor: pointer; text-decoration: none;\">Register Now </a>" +
                                "</p>";

                            var content = "<p style=\"text-align: justify; font-size: 14px; word-spacing: 150%; line-height: 150%;font-family: arial;\">As part of Staysimplified you'll get better rates, better rooms, simple cancellations, and much more. </p>" +
                                "<p style=\"text-align: justify; font-size: 14px; word-spacing: 150%; line-height: 150%; font-family: arial;\">We'd love to hear from you - feel free to email us directly with any questions, comments, or feedback. </p>" +
                                "<p style=\"text-align: justify; font-size: 14px; word-spacing: 150%; line-height: 150%;font-family: arial;\">The Staysimplified Team <br />" +
                                "<a href=\"www.Staysimplified.com\" style=\"text-decoration: none;\">www.Staysimplified.com</a></p>" +
                                "</div>";

                            var footer = "<div class=\"footer\" style=\"width: 60%; border-top: 4px solid #ebebeb; margin: 0 auto; background: #ffffff;padding: 20px;\">" +
                                "<p style=\"color: #bbb;text-align: center;\">Staysimplified is a product of Humming Bird Digital Private Limited</p></div></div>";


                            var EmailContent = header + clientLogo + guestName + regLink + content + footer;

                            // var Header = "<div style=\"width: 70%; margin: 0 auto; background: #ebebeb; border-radius: 0 0 10px 10px;\">"+
                            // "<div class=\"Header\" style=\"border-top: 3px solid #499681; min-height: 300px; padding: 20px; \">"+
                            // "<img src=\"http://endpoint887127.azureedge.net/img/new.png\" width=\"75\" height=\"auto\" alt=\"\">"+
                            // "<h4 style=\"text-align: center; font-size: 26px; color: #499681; padding: 0; margin: 0;\">Accept Invitation</h4>";

                            // var title = "<p style=\"text-align: justify; font-size: 18px; word-spacing: 150%; line-height: 150%; padding: 0; margin: 0;\">Dear <b>"+ emailArray[i].FirstName +"</b>,</p><br />";

                            // var body = "<p style=\"text-align: justify; font-size: 16px; word-spacing: 150%; line-height: 150%; padding: 0; margin: 0;\">"+ 
                            // "Dummy text is text that is used in the publishing industry"+
                            // "or by web designers to occupy the space which will later be filled with 'real' content."+
                            // "This is required when, for example, the final text is not yet available.</p>";

                            // var Url = config.clientUrl +"login/"+ emailArray[i].RowId;

                            // var footer =  "<br /><br />"+
                            // "<div style=\"text-align: center;\">"+
                            // "<a href=\""+ Url +"\" style=\"background-color: #4CAF50; padding: 10px; text-align: center; border-radius: 2px; color:#ffffff; font-weight: bold; cursor: pointer; text-decoration: none;\">Accept</a>"+
                            // "</div>";

                            // var EmailContent = Header  + title + body + footer;

                            let mailOptions = {
                                from: '"No Reply" <stay@hummingbirdindia.com>',
                                to: emailArray[i].EmailId,
                                subject: 'Invitation',
                                html: EmailContent
                            };

                            transporter.sendMail(mailOptions, (error, info) => {
                                if (error) {
                                    return console.log(error);
                                }
                                console.log('Message sent: %s', info.messageId);
                            });


                        });

                        if (emailArray.length > i) {
                            pool
                                .request()
                                .input("Action", "Update")
                                .input("Id", emailArray[i].Id)
                                .input("Str", '')
                                .execute("SS_EmployeeInvite_Help");
                        }
                        if (emailArray.length == i) {
                            return pool
                                .request()
                                .input("Action", "Update")
                                .input("Id", emailArray[i].Id)
                                .input("Str", '')
                                .execute("SS_EmployeeInvite_Help");
                        }

                    }
                })
                .then(result => {
                    res.status(200).send({ message: "Success" });
                    sql.close();
                })
                .catch(err => {
                    res.status(500).send({ message: "Error" });
                    sql.close();
                });
        })
        .catch(err => {
            res.status(500).send({ message: "Error" });
            sql.close();
        });



}

exports.RegDataLoad = function (req, res) {
    new sql.ConnectionPool(config)
        .connect()
        .then(pool => {
            return pool
                .request()
                .input("Action", "GetData")
                .input("Id", 0)
                .input("Str", req.body.rowid)
                .execute("SS_EmployeeInvite_Help");
        }).then(result => {
            let rows = result.recordsets[0][0];
            res.status(200).send({ "data": rows })

            sql.close();

            sql.close();
        }).catch(err => {
            res.status(500).send({ message: err.message })
            sql.close();
        })

}

exports.SignUp = function (req, res) {

    new sql.ConnectionPool(config)
        .connect()
        .then(pool => {
            return pool
                .request()
                .input("Action", "Insert")
                .input("EmpId", req.body.EmpId)
                .input("EmpCode", req.body.EmpCode)
                .input("UserName", req.body.UserName)
                .input("EmailId", req.body.EmailId)
                .input("MobileNumber", req.body.MobileNumber)
                .input("Password", req.body.Password)
                .execute("SS_EmployeeSignUp");
        })
        .then(result => {
            let rows2 = result.recordsets[0][0];
            Result = rows2.msg;

            if (Result == "Success") {
                res.status(200).send({ message: "Success" });
            }
            else {
                res.status(200).send({ message: rows2.msg });
            }

            sql.close();
        })
        .catch(err => {
            res.status(500).send({ message: err.message });
            sql.close();
        });
}



