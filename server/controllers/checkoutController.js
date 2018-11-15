const sql = require("mssql");
const config = require("../config");
const request = new sql.Request();
const winlogger = require("../log");
const _ = require('lodash');

exports.getCartItems = function (req, res) {
    new sql.ConnectionPool(config)
        .connect()
        .then(pool => {
            return pool
                .request()
                .input("Action", "Cart")
                .input("UserId", req.body.userId)
                .input("Id", 0)
                .input("Str", '')
                .execute('SP_CartDetails_Help')
        })
        .then(result => {
            const rows = result.recordsets;
            const guestdet = result.recordsets[0];
            const lodashArr = _.toArray(guestdet);


            var roomGuestDetailslod = _.groupBy(lodashArr, 'ApprovalBookingId', 'Captured');

            var bookingOrder = _.orderBy(roomGuestDetailslod, ['ApprovalBookingId']).reverse();

            res.send({ RoomGuests: bookingOrder });
        }).catch(err => {

            res.status(500).send({ message: err.message });
            winlogger.log('error', err.message);
            sql.close();
        })

}

exports.getCartCount = function (req, res) {
    new sql.ConnectionPool(config)
        .connect()
        .then(pool => {
            return pool
                .request()
                .input("Action", "cartcount")
                .input("UserId", req.body.userId)
                .input("Id", 0)
                .input("Str", '')
                .execute('SP_CartDetails_Help')
        })
        .then(result => {
            const rows = result.recordsets[0][0];
            res.status(200).send(rows);

        }).catch(err => {

            res.status(500).send({ message: err.message });
            winlogger.log('error', err.message);
            sql.close();
        })

}