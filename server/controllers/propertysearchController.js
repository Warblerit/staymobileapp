const sql = require("mssql");
const config = require("../config");
const request = new sql.Request();
const winlogger = require("../log");

exports.getPropertySearch = function (req, res) {
    new sql.ConnectionPool(config)
        .connect()
        .then(pool => {
            return pool
                .request()
                .input("Action", "Property")
                .input("Grade", req.body.Grade)
                .input("GradeId", req.body.GradeId)
                .input("ChkInDt", req.body.ChkInDt)
                .input("ChkOutDt", req.body.ChkOutDt)
                .input("Lattitude", req.body.Lattitude)
                .input("Longitude", req.body.Longitude)
                .input("PlaceId", req.body.PlaceId)
                .input("ClientId", req.body.ClientId)
                .input("Id1", "")
                .input("Str1", "")
                .input("SingleCount", req.body.SingleOccupancyCount)
                .input("DoubleCount", req.body.DoubleOccupancyCount)
                .execute("SS_Booking_PropertySearch");
        })
        .then(result => {
            const rows = result.recordsets[0];
            const starrating = result.recordsets[1];
            const hotelchain = result.recordsets[2];
            const locality = result.recordsets[3];
            res.status(200).send({ data: rows, starRating: starrating, hotelChain: hotelchain, Locality: locality });
            sql.close();
        })
        .catch(err => {
            res.status(500).send({ message: err.message });
            winlogger.log('error', err.message);
            sql.close();
        });
};