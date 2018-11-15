const sql = require('mssql')
const config = require("../config");
const request = new sql.Request();
const jwt = require("jsonwebtoken");
var fs = require('fs');
var moment = require('moment');
//http://localhost:3000/api/provisionalbook
exports.provisionalbookrequest = function (req, res) {
  var Result = [];
  var bodyxml =
    "<provisional-book-request xmlns='http://www.cleartrip.com/hotel/provisional-book-request'>" +
    "<nri>false</nri>" +
    "<hotel-id>41617</hotel-id>" +
    "<check-in-date>2018-06-23+05:30</check-in-date>" +
    "<check-out-date>2018-06-24+05:30</check-out-date>" +
    "<number-of-rooms>1</number-of-rooms>" +
    "<adults-per-room>2</adults-per-room>" +
    "<children-per-room>0</children-per-room>" +
    "<booking-code>5:32550:6899374|si-1d9437fb-cd5e-40ef-a6bd-468ea2953510</booking-code>" +
    "<room-type-code>94514:352700</room-type-code>" +
    "<customer-info>" +
    "<title>Mr</title>" +
    "<first-name>Test1</first-name>" +
    "<last-name>User1</last-name>" +
    "<street-address-1>Main Road</street-address-1>" +
    "<city>Bangalore</city>" +
    "<state>Karnataka</state>" +
    "<country>India</country>" +
    "<postal-code>560078</postal-code>" +
    "<mobile>9000000009</mobile>" +
    "<email>user@test.com</email>" +
    "</customer-info>" +
    "</provisional-book-request>";
  var args = {
    headers: {
      "x-ct-api-key": "c02333ad69bceac20df3995fbf68390f"
    },
    body: bodyxml
  };
  var url = 'https://apistaging.cleartrip.com/hotels/1.0/provisionalbook';
  const request = require("request");
  request.post(url, args, (error, response, body) => {
    var ress = response.body;
    var statusCode = response.statusCode;
    var statusMessage = response.statusMessage;
    //
    if (statusCode == 200) {
      var xml2js = require('xml2js');
      var parser = new xml2js.Parser();
      parser.parseString(ress, function (err, result) {
        var provisionalbookingid = result["provisional-book-response"]["provisional-book-id"][0];
        Result.push({ "provisional bookingid": provisionalbookingid });
        //
        var bodybook =
          "<book-request xmlns='http://www.cleartrip.com/hotel/book-request'>" +
          "<affiliate-txn-id/>" +
          "<nri>false</nri>" +
          "<hotel-id>41617</hotel-id>" +
          "<check-in-date>2018-06-23</check-in-date>" +
          "<check-out-date>2018-06-24</check-out-date>" +
          "<number-of-rooms>1</number-of-rooms>" +
          "<adults-per-room>2</adults-per-room>" +
          "<children-per-room>0</children-per-room>" +
          "<booking-code>5:32550:6899374|si-1d9437fb-cd5e-40ef-a6bd-468ea2953510</booking-code>" +
          "<room-type-code>94514:352700</room-type-code>" +
          "<booking-amount>7080.00</booking-amount>" +
          "<customer>" +
          "<title>Mr</title>" +
          "<first-name>Test1</first-name>" +
          "<last-name>user1</last-name>" +
          "<landline>080234567890</landline>" +
          "<mobile>9844000000</mobile>" +
          "<email>testing@gmail.com</email>" +
          "</customer>" +
          "<payment>" +
          "<payment-type>DA</payment-type>" +
          "<deposit-account-detail>" +
          "<id>44604108</id>" +
          "</deposit-account-detail>" +
          "</payment>" +
          "<provisional-book-id>" + provisionalbookingid + "</provisional-book-id>" +
          "</book-request>";
        //
        var argsbook = {
          headers: {
            "x-ct-api-key": "c02333ad69bceac20df3995fbf68390f"
          },
          body: bodybook
        };
        var urlbook = 'https://apistaging.cleartrip.com/hotels/1.0/book';
        const request = require("request");
        request.post(urlbook, argsbook, (error, response, body) => {
          var respo = response.body;
          var statusCode = response.statusCode;
          var statusMessage = response.statusMessage;
          //
          if (statusCode == 200) {
            var xml2js = require('xml2js');
            var parser = new xml2js.Parser();
            parser.parseString(respo, function (err, result) {
              var confirmationnumber = result["book-response"]["confirmation-number"][0];
              var bookingid = result["book-response"]["booking-id"][0];
              Result.push({ "booking number": confirmationnumber });
              Result.push({ "booking id": bookingid });
              //
              var argscancel = {
                headers: {
                  "x-ct-api-key": "c02333ad69bceac20df3995fbf68390f"
                }
              };
              var urlcancel = 'http://apistaging.cleartrip.com/trips/hotel/' + bookingid;
              const requestcancel = require("request");
              requestcancel.delete(urlcancel, argscancel, (error, response, body) => {
                var rescancel = response.body;
                var statusCodecancel = response.statusCode;
                var statusMessagecancel = response.statusMessage;
                //
                if (statusCodecancel == 200) {
                  var xml2jscancel = require('xml2js');
                  var parsercancel = new xml2jscancel.Parser();
                  //
                  parsercancel.parseString(rescancel, function (err, result) {
                    var refundamount = result["cancellations"]["cancellation"][0]["refund-amount"][0];
                    var suppliercancellation = result["cancellations"]["cancellation"][0]["supplier-cancellation"][0];
                    var txnid = result["cancellations"]["cancellation"][0]["txn-id"][0];
                    Result.push({ "txnid": txnid });
                    Result.push({ "cancel status": suppliercancellation });
                    Result.push({ "refund amount": refundamount });
                    res.status(200).send({ Result });
                  });
                }
              });
            });
          }
        });
      });
    }
    else {
      var xml2jsmsg = require('xml2js');
      var parsermsg = new xml2jsmsg.Parser();
      //
      parsermsg.parseString(ress, function (err, result) {
        var message = result["common:faults"]["common:fault"][0]["common:fault-message"][0];
        Result.push({ "Response Code : ": statusCode, "fault message": message });
        res.status(200).send({ Result });
      });
    }
  });
};
//http://localhost:3000/api/search
exports.searchrequest = function (req, res) {
  var args = {
    headers: {
      "x-ct-api-key": "c02333ad69bceac20df3995fbf68390f"
    }
  };
  var chkin = moment(req.body.ChkInDt, 'MM/DD/YYYY');
  var chkout = moment(req.body.ChkOutDt, 'MM/DD/YYYY');
  var chkinformat = chkin.format('YYYY-MM-DD')
  var chkoutformat = chkout.format('YYYY-MM-DD')
  var url = 'https://apistaging.cleartrip.com/hotels/1.0/search?check-in=' + chkinformat + '&check-out=' + chkoutformat + '&no-of-rooms=' + (req.body.SingleOccupancyCount + req.body.DoubleOccupancyCount) + '&adults-per-room=2&children-per-room=0&city=' + req.body.locality + '&country=IN&scr=INR&sct=IN';

  const request = require("request");

  request.get(url, args, (error, response, body) => {
    var body1 = body;
    var error1 = error;
    var response1 = response;

    var xml2js = require('xml2js');

    var parser = new xml2js.Parser();

    parser.parseString(body, function (err, result) {
      var err = err;
      var sdfs = result;

      var mm = JSON.stringify(sdfs);
      var parsed = JSON.parse(mm);

      var arr = [];
      for (var x in result) {
        arr.push(parsed[x].$);
        arr.push(parsed[x].currency[0]);
        arr.push(parsed[x]["search-criteria"]);
        arr.push(parsed[x].hotels[0]);
        arr.push(parsed[x]["base-url"][0])
      }
      if (arr[3] != "") {

        var hotelcount = arr[3].hotel.length;

      }

      var hotelarr = arr[3].hotel;
      var hotelresult = [];
      try {
        for (var i = 0; i < hotelcount; i++) {
          var hotelid = hotelarr[i]["hotel-id"][0];

          var basicinfo = hotelarr[i]["basic-info"][0];

          var opaque = hotelarr[i]["opaque"][0];

          var copyright = basicinfo["hotel-info:hotel-info-copyright"][0];

          var hotelname = basicinfo["hotel-info:hotel-name"][0];

          var address = basicinfo["hotel-info:address"][0];

          var locality = basicinfo["hotel-info:locality"][0];

          var localityid = basicinfo["hotel-info:locality-id"][0];

          var latitude = basicinfo["hotel-info:locality-latitude"][0];

          var longitude = basicinfo["hotel-info:locality-longitude"][0];

          var city = basicinfo["hotel-info:city"][0];

          var state = basicinfo["hotel-info:state"][0];

          var statecode = basicinfo["hotel-info:state-code"][0];

          var country = basicinfo["hotel-info:country"][0];

          var countrycode = basicinfo["hotel-info:country-code"][0];

          var zip = basicinfo["hotel-info:zip"][0];

          var rateinfo = basicinfo["hotel-info:rate-info"];

          var rateinfo_lowrate = 0;

          if (rateinfo != undefined) {

            var rateinfo_highrate = rateinfo[0]["hotel-info:high-rate"][0];

            rateinfo_lowrate = rateinfo[0]["hotel-info:low-rate"][0];

            var rateinfo_currency = rateinfo[0]["hotel-info:currency"][0];

            var rateinfo_ratedisclaimer = rateinfo[0]["hotel-info:rate-disclaimer"][0];
          }

          var communicationinfo = basicinfo["hotel-info:communication-info"];

          var communicationinfo_phone = communicationinfo[0]["hotel-info:phone"][0];

          var communicationinfo_fax = communicationinfo[0]["hotel-info:fax"][0];

          var communicationinfo_email = communicationinfo[0]["hotel-info:email"][0];

          var communicationinfo_website = communicationinfo[0]["hotel-info:website"][0];

          var communicationinfo_ownername = communicationinfo[0]["hotel-info:owner-name"][0];

          var chain = basicinfo["hotel-info:chain"][0];

          var overview = basicinfo["hotel-info:overview"][0];

          var nailimage = basicinfo["hotel-info:thumb-nail-image"][0];

          var hotelamenities = basicinfo["hotel-info:hotel-amenities"][0];

          var isveg = basicinfo["hotel-info:is-veg"][0];

          var isonhold = basicinfo["hotel-info:is-on-hold"][0];

          var hotelratings = basicinfo["hotel-info:hotel-ratings"][0];

          if (hotelratings["hotel-info:hotel-rating"][1]) {
            var tripratingimage = hotelratings["hotel-info:hotel-rating"][1]["hotel-info:rating-image-url"][0];

          }



          var starrating = basicinfo["hotel-info:star-rating"][0];

          var ctrecommendation = basicinfo["hotel-info:ct-recommendation"][0];

          var hotelusp = basicinfo["hotel-info:hotel-usp"][0];

          var notice = basicinfo["hotel-info:notice"][0];

          var ctrecommended = basicinfo["hotel-info:ct-recommended"][0];

          var getawayproperty = basicinfo["hotel-info:getaway-property"][0];

          var lthhotel = basicinfo["hotel-info:lth-hotel"][0];

          var faqs = basicinfo["hotel-info:faqs"][0];

          var restrictions = basicinfo["hotel-info:restrictions"][0];

          var hotelactivities = basicinfo["hotel-info:hotel-activities"][0];

          var view360 = basicinfo["hotel-info:view-360"][0];

          var supplier360 = basicinfo["hotel-info:supplier-360"][0];

          var gstinenabled = basicinfo["hotel-info:gstin_enabled"][0];

          var gstin = basicinfo["hotel-info:gstin"][0];

          var tds_enabled = basicinfo["hotel-info:tds_enabled"][0];

          var tds_rate = basicinfo["hotel-info:tds_rate"][0];

          var geodist = require('geodist');
          var Distance = geodist({ lat: 12.9715987, lon: 77.59456269999998 }, { lat: latitude, lon: longitude }, { exact: true, unit: 'km' });

          var obj = {
            "PropertyName": hotelname,
            "PropertyId": hotelid,
            "Propertaddress": address,
            "ImageLocation": nailimage,
            "StarRating": starrating,
            "TripadvisorRating": tripratingimage,
            "Tariff": rateinfo_lowrate,
            "GetType": "API",
            "PropertyType": "CTP",
            "Distance": Distance,
            "MasterPropertyId": 0,
            "LocalityId": locality,
            "LocalityId": localityid
          };
          hotelresult.push(obj);
        }
        res.status(200).send({ hotelresult });
      }
      catch (exception) {
        let fdf = exception.message;
      }
    });
  });
};
//http://localhost:3000/api/oyoroomssearch
exports.oyoroomssearchrequest = function (req, res) {
  var args = {
    headers: {
      "access-token": "ZEYyOTF0YW5xWEhWVnNkaFNBRFA6TUExQzZXUnhyVUhvZkZQTjE1bm8="
    }
  };
  const request = require("request");

  var Result = [];

  var total_count = 0;

  var no_of_entry = 0;

  var url = 'http://affiliate-staging.ap-southeast-1.elasticbeanstalk.com/api/v2/hotels/listing?no_of_entry=100&page=1';

  request.get(url, args, (error, response, body) => {
    var response = JSON.parse(body);

    var hotels = response.hotels;

    no_of_entry = response.no_of_entry;

    total_count = response.total_count;

    var len = hotels.length;

    for (var i = 0; i < len; i++) {
      var id = hotels[i].id;
      var name = hotels[i].name;
      var description = hotels[i].description;
      var address = hotels[i].address;
      var small_address = hotels[i].small_address;
      var city = hotels[i].city;
      var state = hotels[i].state;
      var country = hotels[i].country;
      var zipcode = hotels[i].zipcode;
      var latitude = hotels[i].latitude;
      var longitude = hotels[i].longitude;
      var oyo_home = hotels[i].oyo_home;
      var category = hotels[i].category;
      var images = hotels[i].images;
      var amenities = hotels[i].amenities;
      var policies = hotels[i].policies;
      var landing_url = hotels[i].landing_url;
      //
      Result.push({ id, city });
    }
    res.status(200).send({ Result });
  });
}


exports.Hotelrequest = function (req, res) {
  var args = {
    headers: {
      "x-ct-api-key": "c02333ad69bceac20df3995fbf68390f"
    }
  };

  var chkin = moment(req.body.checkindate, 'MM/DD/YYYY');
  var chkout = moment(req.body.checkoutdate, 'MM/DD/YYYY');
  var chkinformat = chkin.format('YYYY-MM-DD')
  var chkoutformat = chkout.format('YYYY-MM-DD')


  var url = 'https://apistaging.cleartrip.com/hotels/1.0/search?check-in=' + chkinformat + '&check-out=' + chkoutformat + '&no-of-rooms=' + (req.body.singlecount + req.body.doublecount) + '&adults-per-room=2&children-per-room=0&city=' + req.body.locality +
    '&state=""&country=IN&ct_hotelid=' + req.body.propertyid + '&scr=INR&sct=IN';

  const request = require("request");

  request.get(url, args, (error, response, body) => {
    var body1 = body;
    var error1 = error;
    var response1 = response;

    var xml2js = require('xml2js');

    var parser = new xml2js.Parser();

    parser.parseString(body, function (err, result) {
      var err = err;
      var sdfs = result;

      var mm = JSON.stringify(sdfs);
      var parsed = JSON.parse(mm);

      var arr = [];
      for (var x in result) {
        arr.push(parsed[x].$);
        arr.push(parsed[x].currency[0]);
        arr.push(parsed[x]["search-criteria"]);
        arr.push(parsed[x].hotels[0]);
        arr.push(parsed[x]["base-url"][0])
      }

      var hotelcount = arr[3].hotel.length;
      var hotelarr = arr[3].hotel;
      var data = [];
      try {
        for (var i = 0; i < hotelcount; i++) {
          var hotelid = hotelarr[i]["hotel-id"][0];

          var basicinfo = hotelarr[i]["basic-info"][0];

          var opaque = hotelarr[i]["opaque"][0];

          var copyright = basicinfo["hotel-info:hotel-info-copyright"][0];

          var hotelname = basicinfo["hotel-info:hotel-name"][0];

          var address = basicinfo["hotel-info:address"][0];

          var locality = basicinfo["hotel-info:locality"][0];

          var localityid = basicinfo["hotel-info:locality-id"][0];

          var latitude = basicinfo["hotel-info:locality-latitude"][0];

          var longitude = basicinfo["hotel-info:locality-longitude"][0];

          var city = basicinfo["hotel-info:city"][0];

          var state = basicinfo["hotel-info:state"][0];

          var statecode = basicinfo["hotel-info:state-code"][0];

          var country = basicinfo["hotel-info:country"][0];

          var countrycode = basicinfo["hotel-info:country-code"][0];

          var zip = basicinfo["hotel-info:zip"][0];

          var rateinfo = basicinfo["hotel-info:rate-info"];

          var rateinfo_lowrate = 0;

          if (rateinfo != undefined) {

            var rateinfo_highrate = rateinfo[0]["hotel-info:high-rate"][0];

            rateinfo_lowrate = rateinfo[0]["hotel-info:low-rate"][0];

            var rateinfo_currency = rateinfo[0]["hotel-info:currency"][0];

            var rateinfo_ratedisclaimer = rateinfo[0]["hotel-info:rate-disclaimer"][0];
          }

          var communicationinfo = basicinfo["hotel-info:communication-info"];

          var communicationinfo_phone = communicationinfo[0]["hotel-info:phone"][0];

          var communicationinfo_fax = communicationinfo[0]["hotel-info:fax"][0];

          var communicationinfo_email = communicationinfo[0]["hotel-info:email"][0];

          var communicationinfo_website = communicationinfo[0]["hotel-info:website"][0];

          var communicationinfo_ownername = communicationinfo[0]["hotel-info:owner-name"][0];

          var chain = basicinfo["hotel-info:chain"][0];

          var overview = basicinfo["hotel-info:overview"][0];

          var nailimage = basicinfo["hotel-info:thumb-nail-image"][0];

          var hotelamenities = basicinfo["hotel-info:hotel-amenities"][0];

          var isveg = basicinfo["hotel-info:is-veg"][0];

          var isonhold = basicinfo["hotel-info:is-on-hold"][0];

          var hotelratings = basicinfo["hotel-info:hotel-ratings"][0];

          var tripratingimage = hotelratings["hotel-info:hotel-rating"][1]["hotel-info:rating-image-url"][0];

          var starrating = basicinfo["hotel-info:star-rating"][0];

          var ctrecommendation = basicinfo["hotel-info:ct-recommendation"][0];

          var hotelusp = basicinfo["hotel-info:hotel-usp"][0];

          var notice = basicinfo["hotel-info:notice"][0];

          var ctrecommended = basicinfo["hotel-info:ct-recommended"][0];

          var getawayproperty = basicinfo["hotel-info:getaway-property"][0];

          var lthhotel = basicinfo["hotel-info:lth-hotel"][0];

          var faqs = basicinfo["hotel-info:faqs"][0];

          var restrictions = basicinfo["hotel-info:restrictions"][0];

          var hotelactivities = basicinfo["hotel-info:hotel-activities"][0];

          var view360 = basicinfo["hotel-info:view-360"][0];

          var supplier360 = basicinfo["hotel-info:supplier-360"][0];

          var gstinenabled = basicinfo["hotel-info:gstin_enabled"][0];

          var gstin = basicinfo["hotel-info:gstin"][0];

          var tds_enabled = basicinfo["hotel-info:tds_enabled"][0];

          var tds_rate = basicinfo["hotel-info:tds_rate"][0];

          var roomrates = hotelarr[i]["room-rates"][0]["room-rate"];

          var roomrateslength = roomrates.length;

          for (var j = 0; j < roomrateslength; j++) {
            var roomtypecode = roomrates[j]["room-type"][0]["room-type-code"][0];

            var roomdescription = roomrates[j]["room-type"][0]["room-description"][0];

            var roomtypeid = roomrates[j]["room-type"][0]["room-type-id"][0];

            var ratebreakdown = roomrates[j]["rate-breakdown"][0]["common:rate"];

            var commondate = ratebreakdown[0]["common:date"][0];

            var pricingelements = ratebreakdown[0]["common:pricing-elements"][0]["common:pricing-element"];

            var pricingelementslength = pricingelements.length;

            var category = pricingelements[0]["common:category"][0];

            var amount = pricingelements[0]["common:amount"][0];

            var amount1 = 0;

            if (pricingelementslength == 2) {

              var category1 = pricingelements[1]["common:category"][0];

              amount1 = pricingelements[1]["common:amount"][0];

              var code1 = pricingelements[1]["common:code"][0];
            }

            var bookingcode = roomrates[j]["booking-code"][0];

            var provisionalbookingrequired = roomrates[j]["provisional-booking-required"][0];

            var inclusions = "";

            if (roomrates[j]["inclusions"] != undefined) {

              var inclusions_if_con = roomrates[j]["inclusions"][0];

              if (inclusions_if_con != "") {
                inclusions = roomrates[j]["inclusions"][0]["inclusion"][0];
              }
            }

            var currency_code = roomrates[j]["currency_code"][0];

            var ispackage = roomrates[j]["is-package"][0];

            var packagesavings = roomrates[j]["package-savings"][0];

            var postpay = roomrates[j]["post-pay"][0];

            var pahcc = roomrates[j]["pah-cc"][0];

            var basepkgdiff = roomrates[j]["base-pkg-diff"][0];

            var opaque = roomrates[j]["opaque"][0];

            var amount2 = Math.round(parseFloat(amount) + parseFloat(amount1)).toString() + ".00";

            var obj = {
              "PropertyName": hotelname,
              "PropertyId": hotelid,
              "GetType": "API",
              "PropertyType": "CTP",
              "RoomType": roomdescription,
              "RoomTypeId": roomtypecode,
              "SingleTariff": amount2,
              "DoubleTariff": amount2,
              "SingleandMarkup": amount2,
              "DoubleandMarkup": amount2,
              "SingleTax": 0,
              "DoubleTax": 0,
              "HRSingle": amount,
              "HRDouble": amount,
              "HRSingleandMarkup": amount,
              "HRDoubleandMarkup": amount,
              "StarRating": starrating,
              "TripadvisorRating": tripratingimage,
              "TaxInclusive": true,
              "TAC": false,
              "TACPer": 0,
              "TACTaxInclusive": false,
              "DiscountModeRS": false,
              "DiscountModePer": false,
              "DiscountAllowed": 0,
              "Phone": communicationinfo_phone,
              "Email": communicationinfo_email,
              "LocalityId": locality,
              "LocalityId": localityid,
              "MarkupId": 0,
              "Inclusions": inclusions,
              "TaxAdded": "N",
              "CancelPolicy": "",
              "BookingPolicy": "",
              "ChkIn": bookingcode,
              "Postal": zip,
              "PtyImg": "",
              "Propertaddress": address,
              "TaxAmountSingle": amount1,
              "TaxAmountDouble": amount1,
              "RoomImg": ""
            };
            data.push(obj);
          }
        }
        res.status(200).send({ data });
      }
      catch (exception) {
        let fdf = exception.message;
      }
    });
  });
};