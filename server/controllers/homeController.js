const sql = require("mssql");
const config = require("../config");
const request = new sql.Request();
const multer = require('multer');
const jwt = require("jsonwebtoken");
var express = require('express');
var app = express();
var googleMapsClient = require("@google/maps").createClient({
  key: "AIzaSyCLkNMGzysnTwHV4iZMkJb1YQI_8F4T0Co"
});
var DIR = './uploads/';
var upload = multer({ dest: DIR });

exports.locationJson = function (req, res) {
  googleMapsClient.places(
    {
      query: req.query.mdauto,
      language: "en"
    },
    function (err, response) {
      if (!err) {
        res.status(200).send(JSON.stringify(response.json.results));
      }
    }
  );
};

exports.upcomingtrips = function (req, res) {
  new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
      return pool
        .request()
        .input("Action", "Booked")
        .input("UserId", req.body.datum.UserId)
        .execute("SP_SS_Mybookinghistory_Help");
    })
    .then(result => {

      res.status(200).send(result.recordsets[0]);
    })

}

exports.getEmployeeInviteCount = function (req, res) {

  new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
      return pool
        .request()
        .query(`select count(*) as inviteCount from WRBHBClientManagementAddClientGuest where CltmgntId=${req.body.edatum.ClientId} and IsActive=1 and InviteFlg=1`);
    })
    .then(result => {

      res.status(200).send(result.recordsets[0][0])
    })



}