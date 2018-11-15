const express = require("express");
const router = express.Router();
const User = require("../models/user");
const axios = require("axios");
const bcrypt = require("bcrypt");
const config = require("../config");
const jwt = require("jsonwebtoken");

/*Reference to controllers*/
const auth = require("../controllers/authenticationController");
const home = require("../controllers/homeController");
const roles = require("../controllers/rolescontroller");
const approvalmatrix = require("../controllers/approvalmatrixController");
const emp = require('../controllers/employeeController');
const travellers = require('../controllers/travellersController');
const users = require('../controllers/usersController');
const bookingSearch = require('../controllers/propertysearchController');
const chen = require('../controllers/changeentityController');
const savingreport = require('../controllers/savingreportController');
const paymentreport = require('../controllers/paymentReportController');
const hrPolicy = require('../controllers/hrpolicyController');
const cpp = require('../controllers/connectpreferredproperty');
const hotelDetails = require('../controllers/hoteldetailsController');
const hotelRegistration = require('../controllers/hotelregistrationController');
const booking = require('../controllers/bookingController');
const bookinghistory = require('../controllers/bookinghistoryController');
const pendingapproval = require('../controllers/pendingapprovalController');
const cancellation = require('../controllers/cancellationController');
const changepassword = require('../controllers/changepasswordController');

const ghreport = require('../controllers/ghController')
const CChart = require("../controllers/occupancychartController");
const screenmaster = require('../controllers/screenmasterController');
const menu = require('../controllers/dynamicController')
const cleartrip = require('../controllers/cleartripcontroller')
const register = require('../controllers/registerController')
const cartitem = require('../controllers/checkoutController')


/*Routes without token*/
router.post("/login", auth.login);
router.post('/employee', emp.employee);
router.post('/employeeinvite', emp.employeeinvite);
router.post('/RegDataLoad', emp.RegDataLoad);
router.post('/SignUp', emp.SignUp);
router.post('/UserDataLoad', users.UserDataLoad);
router.post('/PasswordUpdate', users.PasswordUpdate);
router.post('/ClientList', register.clientnames);
router.post('/Adminuserinsert', register.adminuserinsert);
//router.post('/domaincheck',register.domaincheck);
router.post('/adminNewuserinsert', register.AdminNewUserinsert);


router.post('/GetCountry', hotelRegistration.GetCountry);
router.post('/GetState', hotelRegistration.GetState);
router.post('/GetStarRating', hotelRegistration.GetStarRating);
router.post('/GetCity', hotelRegistration.GetCity);
router.post('/InsertHotelRegistration', hotelRegistration.InsertHotelRegistration);
router.get('/checkIfGuestExists/:GuestId', pendingapproval.checkIfGuestExists);




/*Routes without token*/

/* MIDDLEWARE SECTION */

/* JWT token Middleware */

router.use(function (req, res, next) {
  /* Check header/url parameters/post parameters for token */
  var token =
    req.body.token || req.query.token || req.headers["x-access-token"];
  /* Decode token using secretkey */
  if (token) {
    jwt.verify(token, config.superSecret, function (err, decoded) {
      if (err) {
        return res.json({
          success: false,
          message: "Failed to authenticate token."
        });
      } else {
        req.decoded = decoded;
        next();
      }
    });
  } else {
    /* return an error if no token found */
    return res.status(403).send({
      success: false,
      message: "No token provided."
    });
  }
});

/*API Routes GET */


router.get("/top1_user", auth.top1_user);
router.get("/getLocations", home.locationJson);
//router.get('/getEmpCodeDetails/:ClientId/:EmpCode/:GradeId',travellers.getEmpCodeDetails)
router.get("/getUsers/:clientId", users.getUsers);
router.get('/getProperty/:clientId/:propertyName', cpp.getProperty);
router.get('/getState/', cpp.getState);
router.get("/getCity/:StateId", cpp.getCity);
router.get("/getbookings/:UserId/:Status", bookinghistory.getbookings);
router.get("/getRequests/:ClientId/:UserId", pendingapproval.getRequests);
router.get("/getRequestHistory/:ClientId/:UserId", pendingapproval.getRequestHistory);
router.get("/getcancelbookings/:UserId", cancellation.getbookings);
router.get("/getRequests/:ClientId/:UserId", pendingapproval.getRequests);


/*API Routes POST */
router.post('/DDlRole', roles.DDlRole);
router.post("/allroles", roles.allroles);
router.post("/Roleadd", roles.Roleadd);
router.post("/approvalmatrix", approvalmatrix.getgrades);
router.post("/policyadd", approvalmatrix.TravelpolicyAdd);
router.post("/getpolicy", approvalmatrix.getpolicy);
router.post("/Travelpolicyhelp", approvalmatrix.TravelpolicyHelp);
router.post("/TravelpolicyDelete", approvalmatrix.TravelpolicyDelete);
router.post("/GradeAdd", approvalmatrix.GradeAdd);
router.post("/GradeDelete", approvalmatrix.GradeDelete);

router.post("/PolicyNameUpdate", approvalmatrix.PolicyNameUpdate);
router.post("/PolicyDescriptionUpdate", approvalmatrix.PolicyDescriptionUpdate);
router.get('/getEmpCodeDetails/:clientId/:empCode', travellers.getEmpCodeDetails)
router.get("/getUsers/:clientId", users.getUsers);
router.post("/GetScreenForRoles", roles.GetScreenForRoles);
router.post("/DeleteRoles", roles.DeleteRoles);
router.post("/DeleteEnable", roles.DeleteEnable);
router.post("/DeleteDisable", roles.DeleteDisable);

router.post("/HotelRuleValueUpdate", approvalmatrix.HotelRuleValueUpdate);
router.post("/HotelRuleConditionUpdate", approvalmatrix.HotelRuleConditionUpdate);
router.post("/getPropertySearch", bookingSearch.getPropertySearch);
router.post("/ScreenAddRights", roles.ScreenAddRights);
router.post("/ScreenRemoveRights", roles.ScreenRemoveRights);

router.post("/changeentity", chen.changeentity);
router.post("/addentity", chen.addentity);
router.post("/savingReport", savingreport.savingReport);
router.post("/PaymentCurrentReport", paymentreport.PaymentCurrentReport);
router.post("/GHAutocomplete", ghreport.autocomplete)
router.post("/GHReports", ghreport.GhReport)
router.post("/Changepassword", changepassword.Changepassword)



router.get("/HrClientDetail", hrPolicy.HrClientDetail);
router.post("/GetGradeForClient", hrPolicy.GetGradeForClient);
router.post("/GetCityLoad", hrPolicy.GetCityLoad);
router.post("/HrGradeAdd", hrPolicy.HrGradeAdd);
router.post("/HrDeleteGrades", hrPolicy.HrDeleteGrades);
router.post("/LoadHrClientData", hrPolicy.LoadHrClientData);
router.post("/LoadClientSelectedData", hrPolicy.LoadClientSelectedData);
router.post("/HrDeletePolicy", hrPolicy.HrDeletePolicy);
router.post("/GetPopGradeForClient", hrPolicy.GetPopGradeForClient);
router.post("/LoadHrPopClientData", hrPolicy.LoadHrPopClientData);
router.post("/InsertPolicyData", hrPolicy.InsertPolicyData);
router.post("/UpdatePolicyData", hrPolicy.UpdatePolicyData);
router.post('/employeeinvite', emp.employeeinvite);
router.post('/RegDataLoad', emp.RegDataLoad);
router.post('/CppInsert', cpp.CppInsert);
router.post('/CppGridLoad', cpp.CppGridLoad);
router.post('/propertydelete', cpp.propertydelete);
router.post('/PropertDataLoad', cpp.PropertDataLoad);
router.post('/CppUpdate', cpp.CppUpdate);
router.post('/CppCheck', cpp.CppCheck);
router.post('/CppHdrInsert', cpp.CppHdrInsert);
router.post('/PropertyHistory', cpp.PropertyHistory);
router.post('/NewPropertyReq', cpp.NewPropertyReq);
router.post("/getPropertyDetails", hotelDetails.getHotelDetails);
router.post('/getEmpCodeDetails', travellers.getEmpCodeDetails)


router.post('/EmployeesLoad', users.EmployeesLoad);
router.post('/SendInvite', users.SendInvite);
router.post('/UserAdd', users.UserAdd);
router.post('/UserUpdate', users.UserUpdate);
router.post('/Userdelete', users.Userdelete);


router.post('/confirmBooking', booking.confirmbooking);
router.post('/delbookingreq', booking.delbookingreq);
router.post('/RequestApprove', pendingapproval.RequestApprove);
router.post('/RequestCancel', pendingapproval.RequestCancel);
router.post('/finalcheckout', booking.finalcheckout);
router.post('/canceldetails', cancellation.cancelrequest);
router.post('/getEmpCodeWithGuestId', travellers.empCodeWithGuestId);
router.post('/allmodule', screenmaster.allmodule);
router.post('/InsertScreen', screenmaster.InsertScreen);
router.post('/AllType', screenmaster.allType)
router.post('/getEndUserGradeId', travellers.getGradeId);
router.post('/OccupancyChart', CChart.OccupancyChart);
router.post('/OccupancyProperty', CChart.OccupancyProperty);
router.post("/dynamicMenus", menu.dynamicMenu);
router.post("/AIRecommendedProp", booking.AIRecommendedProp);
router.post("/cleartripsearch", cleartrip.searchrequest);
router.post("/cleartriphoteldetails", cleartrip.Hotelrequest);
router.post("/getCartItems", cartitem.getCartItems);
router.post("/getCartCount", cartitem.getCartCount);
router.post("/upcomingtrips", home.upcomingtrips);
router.post('/getInviteCount', home.getEmployeeInviteCount);
router.post('/AIconfirmbooking', booking.AIconfirmbooking);
router.post('/getMghRoomTypes', booking.getMghRoomType);
router.post('/setMghRoomNo', booking.saveSelectedRoomNo);

module.exports = router;
