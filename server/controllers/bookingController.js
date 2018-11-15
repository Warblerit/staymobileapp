const sql = require("mssql");
const config = require("../config");
const request = new sql.Request();
const winlogger = require("../log");
const _ = require('lodash');
const nodemailer = require('nodemailer');
const uniqid = require('uniqid');

exports.confirmbooking = function (req, res) {

  let ApprovalHeaderId = 0;
  let ApprovalBookingId = 0;
  let BookingId = 0;
  let BookingpropertyId = 0;
  let Policy = true;
  let roomguestdetails = req.body.roomguestdetails;
  let logindetails = req.body.logindetails;
  let selectedRT = req.body.selectedRT;
  let searchDetails = req.body.searchDetails;
  let selectedProp = req.body.selectedProp
  let breakupHour = searchDetails.CheckInTime.split(':', 2)
  let breakupMinute = breakupHour[1].split(' ')
  // let ampm = searchDetails.CheckInTime.split(' ')



  // No Policy means Save to Booking Table.


  if (Policy == true) {
    // StayApproval_Header Insert Booking Table 1st.
    new sql.ConnectionPool(config)
      .connect()
      .then(pool => {
        return pool
          .request()
          .input("ClientId", logindetails.ClientId)
          .input("ClientName", logindetails.ClientName)
          .input("Status", 'Cart')
          .input("Remarks", '')
          .input("UserId", logindetails.UserId)
          .input("Str", "")
          .input("Id", 0)
          .execute("Sp_StayApproval_Header_Insert");
      })
      .then(result => {
        const rows1 = result.recordsets[0][0];
        ApprovalHeaderId = rows1.ApprovalHeaderId;
        sql.close();
        // StayApprovalBooking_Details Insert Booking Table 2nd Start.
        new sql.ConnectionPool(config)
          .connect()
          .then(pool => {
            return pool
              .request()
              .input("ApprovalHeaderId", ApprovalHeaderId)
              .input("CheckInDate", searchDetails.checkInDate)
              .input("ExpectedChkInTime", breakupHour[0] + ":" + breakupMinute[0])
              .input("CheckOutDate", searchDetails.checkOutDate)
              .input("CityId", '')
              .input("CityName", searchDetails.locality)
              .input("Status", 'Cart')
              .input("UserId", logindetails.UserId)
              .input("TariffPaymentMode", searchDetails.TariffPaymentMode)
              .input("ServicePaymentMode", searchDetails.ServicePaymentMode)
              .input("TravelType", searchDetails.TravelType)
              .input("SingleCount", searchDetails.SingleOccupancyCount)
              .input("DoubleCount", searchDetails.DoubleOccupancyCount)
              .input("AMPM", breakupMinute[1])
              .execute("SP_StayApprovalBooking_Details_Insert");
          })
          .then(result => {
            const rows2 = result.recordsets[0][0];
            ApprovalBookingId = rows2.ApprovalBookingId;
            sql.close();

            // StayApprovalGuest_Details Insert Booking Table 4th Start.
            new sql.ConnectionPool(config)
              .connect()
              .then(pool => {
                roomguestdetails.forEach((room, RIndex) => {
                  var Occupancy = _.last(room);
                  room.forEach((guest, GIndex) => {
                    if (guest.hasOwnProperty('CltmgntId'))
                      return pool
                        .request()
                        .input("ApprovalBookingId", ApprovalBookingId)
                        .input("GuestId", guest.Id)
                        .input("EmpCode", guest.EmpCode)
                        .input("Title", guest.Title)
                        .input("FirstName", guest.FirstName)
                        .input("LastName", guest.LastName)
                        .input("Grade", guest.Grade)
                        .input("GradeId", guest.GradeId)
                        .input("Designation", guest.Designation)
                        .input("EmailId", guest.EmailId)
                        .input("MobileNo", guest.GMobileNo)
                        .input("Column1", guest.Column1)
                        .input("Column2", guest.Column2)
                        .input("Column3", guest.Column3)
                        .input("Column4", guest.Column4)
                        .input("Column5", guest.Column5)
                        .input("Column6", guest.Column6)
                        .input("Column7", guest.Column7)
                        .input("Column8", guest.Column8)
                        .input("Column9", guest.Column9)
                        .input("Column10", guest.Column10)
                        .input("ManagerName", guest.ManagerName)
                        .input("ManagerEmpCode", guest.ManagerEmpCode)
                        .input("ManagerId", guest.ManagerId)
                        .input("SupervisorEmpCode", guest.SupervisorEmpCode)
                        .input("SupervisorId", guest.SupervisorId)
                        .input("Captured", RIndex + 1)
                        .input("Status", 'Cart')
                        // .input("PaymentMode", guest.PaymentMode)
                        .input("UserId", logindetails.UserId)
                        .input("Occupancy", Occupancy)
                        .execute("Sp_StayApprovalGuest_Details_Insert");
                  });

                });
              })
              .then(() => {

                sql.close();

                // StayApprovalProperty_Details Insert Booking Table 3rd Start.

                new sql.ConnectionPool(config)
                  .connect()
                  .then(pool => {
                    return pool
                      .request()
                      .input("ApprovalBookingId", ApprovalBookingId)
                      .input("PropertyId", selectedRT.PropertyId)
                      .input("PropertyName", selectedRT.PropertyName)
                      .input("GetType", selectedRT.GetType)
                      .input("PropertyType", selectedRT.PropertyType)
                      .input("SingleTariff", parseFloat(selectedRT.SingleTariff))
                      .input("DoubleTariff", parseFloat(selectedRT.DoubleTariff))
                      .input("TripleTariff", 0)
                      .input("RoomType", selectedRT.RoomType)
                      .input("SingleandMarkup", parseFloat(selectedRT.SingleandMarkup))
                      .input("DoubleandMarkup", parseFloat(selectedRT.DoubleandMarkup))
                      .input("TripleandMarkup", 0)
                      .input("Markup", 0)
                      .input("TAC", selectedRT.TAC)
                      .input("Inclusions", selectedRT.Inclusions)
                      .input("DiscountModeRS", selectedRT.DiscountModeRS)
                      .input("DiscountModePer", selectedRT.DiscountModePer)
                      .input("DiscountAllowed", parseFloat(selectedRT.DiscountAllowed))
                      .input("Phone", selectedRT.Phone)
                      .input("Email", selectedRT.Email)

                      .input("Locality", selectedRT.Locality)
                      .input("LocalityId", selectedRT.LocalityId)
                      .input("MarkupId", selectedRT.MarkupId)
                      .input("SingleandMarkup1", selectedRT.SingleandMarkup)
                      .input("DoubleandMarkup1", selectedRT.DoubleandMarkup)
                      .input("TripleandMarkup1", 0)
                      .input("TACPer", parseFloat(selectedRT.TACPer))
                      .input("TaxAdded", selectedRT.TaxAdded)
                      .input("SingleTax", parseFloat(selectedRT.SingleTax))
                      .input("DoubleTax", parseFloat(selectedRT.DoubleTax))
                      .input("TripleTax", 0)
                      .input("RoomTypeId", searchDetails.RoomTypeId)
                      .input("TaxInclusive", selectedRT.TaxInclusive)
                      .input("BaseTariff", 0)
                      .input("GeneralMarkup", 0)
                      .input("ExpWithTax", '')
                      .input("AgreedSingle", 0)
                      .input("AgreedDouble", 0)
                      .input("AgreedTriple", 0)
                      .input("TACTaxInclusive", selectedRT.TACTaxInclusive)
                      .input("UserId", logindetails.UserId)
                      .execute("SP_StayApprovalProperty_Details_Insert");
                  })
                  .then(result => {
                    sql.close();
                    const rows = result.recordsets;
                    const guestdet = result.recordsets[1];
                    const lodashArr = _.toArray(guestdet);

                    var roomGuestDetailslod = _.groupBy(lodashArr, 'ApprovalBookingId', 'Captured');

                    // var merge = _.merge(roomGuestDetailslod, bookingdet);
                    res.send({ RoomGuests: roomGuestDetailslod });
                  })
                  .catch(err => {
                    res.status(500).send({ message: err.message });
                    winlogger.log('error', err.message);
                    sql.close();
                  });


                // StayApprovalProperty_Details Insert Booking Table 3rd End. 

              })
              .catch(err => {
                res.status(500).send({ message: err.message });
                winlogger.log('error', err.message);
                sql.close();
              });

            // StayApprovalGuest_Details Insert Booking Table 4th End.

          }).catch(err => {
            res.status(500).send({ message: err.message });
            winlogger.log('error', err.message);
            sql.close();
          });
        // .catch(err => {
        //   res.status(500).send({ message: err.message });
        //   winlogger.log('error', err.message);
        //   sql.close();
        // });
        // StayApprovalBooking_Details Insert Booking Table 2nd End.


      })
      .catch(err => {
        res.status(500).send({ message: err.message });
        winlogger.log('error', err.message);
        sql.close();
      });


    // StayApproval_Header Insert Booking Table 1st End.

  }

  // else {
  //   // Insert Main Booking Table 1st.
  //   new sql.ConnectionPool(config)
  //     .connect()
  //     .then(pool => {
  //       return pool
  //         .request()
  //         .input("BookingCode", req.body.BookingCode)
  //         .input("TrackingNo", req.body.TrackingNo)
  //         .input("ClientId", req.body.ClientId)
  //         .input("GradeId", req.body.GradeId)
  //         .input("StateId", req.body.StateId)
  //         .input("CityId", req.body.CityId)
  //         .input("ClientName", req.body.ClientName)
  //         .input("CheckInDate", req.body.CheckInDate)

  //         .input("ExpectedChkInTime", req.body.ExpectedChkInTime)
  //         .input("CheckOutDate", req.body.CheckOutDate)
  //         .input("GradeName", req.body.GradeName)
  //         .input("StateName", req.body.StateName)
  //         .input("CityName", req.body.CityName)
  //         .input("ClientBookerId", req.body.ClientBookerId)
  //         .input("ClientBookerName", req.body.ClientBookerName)
  //         .input("ClientBookerEmail", req.body.ClientBookerEmail)

  //         .input("EmailtoGuest", req.body.EmailtoGuest)
  //         .input("Note", req.body.Note)
  //         .input("SpecialRequirements", req.body.SpecialRequirements)
  //         .input("Status", req.body.Status)
  //         .input("Sales", req.body.Sales)
  //         .input("CRM", req.body.CRM)
  //         .input("CancelRemarks", req.body.CancelRemarks)
  //         .input("AMPM", req.body.AMPM)
  //         .input("BookingLevel", req.body.BookingLevel)
  //         .input("PONo", req.body.PONo)
  //         .input("PONoId", req.body.PONoId)
  //         .input("CancelStatus", req.body.CancelStatus)
  //         .input("BookedDt", req.body.BookedDt)
  //         .input("BookedUsrId", req.body.BookedUsrId)
  //         .input("FrontEnd", req.body.FrontEnd)
  //         .input("MMTPONo", req.body.MMTPONo)

  //         .input("MMTPONoId", req.body.MMTPONoId)
  //         .input("ExtraCCEmail", req.body.ExtraCCEmail)
  //         .input("HRPolicy", req.body.HRPolicy)
  //         .input("HRPolicyOverrideRemarks", req.body.HRPolicyOverrideRemarks)
  //         .input("PropertyRefNo", req.body.PropertyRefNo)
  //         .input("PaymentFlag", req.body.PaymentFlag)
  //         .input("PaymentCode", req.body.PaymentCode)
  //         .input("PaymentCodeRemarks", req.body.PaymentCodeRemarks)
  //         .input("HBStay", req.body.HBStay)
  //         .input("PurposeOfStay", req.body.PurposeOfStay)
  //         .input("EATicketNo", req.body.EATicketNo)
  //         .input("Client_RequestNo", req.body.Client_RequestNo)
  //         .input("Servicecharge", req.body.Servicecharge)
  //         .input("Sctariff", req.body.Sctariff)
  //         .input("Scservice", req.body.Scservice)
  //         .input("CountryId", req.body.CountryId)

  //         .input("guestcount", req.body.guestcount)
  //         .input("singlecount", req.body.singlecount)
  //         .input("doublecount", req.body.doublecount)
  //         .input("triplecount", req.body.triplecount)
  //         .input("TRFornNo", req.body.TRFornNo)
  //         .input("TRFormNo", req.body.TRFormNo)
  //         .input("TRId", req.body.TRId)
  //         .input("UserId", req.body.UserId)
  //         .execute("SP_StayBooking_Insert");
  //     })
  //     .then(result => {
  //       const rows = result.recordsets[0][0];
  //       BookingId = rows.BookingId;
  //       sql.close();

  //       //Second Table Insert Booking Guest Table Insert


  //       new sql.ConnectionPool(config)
  //         .connect()
  //         .then(pool => {
  //           return pool
  //             .request()
  //             .input("BookingId", BookingId)
  //             .input("GuestId", req.body.GuestId)
  //             .input("GradeId", req.body.GradeId)
  //             .input("EmpCode", req.body.EmpCode)

  //             .input("Title", req.body.Title)
  //             .input("FirstName", req.body.FirstName)
  //             .input("LastName", req.body.LastName)
  //             .input("Grade", req.body.Grade)
  //             .input("Designation", req.body.Designation)
  //             .input("EmailId", req.body.EmailId)
  //             .input("MobileNo", req.body.MobileNo)
  //             .input("Nationality", req.body.Nationality)
  //             .input("RoomType", req.body.RoomType)
  //             .input("Captured", req.body.Captured)
  //             .input("PaymentMode", req.body.PaymentMode)
  //             .input("UserId", req.body.UserId)
  //             .execute("SP_StayBookingGuestDetails_Insert");
  //         })
  //         .then(result => {
  //           const rows = result.recordsets[0][0];
  //           ApprovalHeaderId = rows1.ApprovalHeaderId;
  //           sql.close();

  //         })
  //         .catch(err => {
  //           res.status(500).send({ message: err.message });
  //           sql.close();
  //         });


  //       //Third Table Booking Property Insert 

  //       new sql.ConnectionPool(config)
  //         .connect()
  //         .then(pool => {
  //           return pool
  //             .request()
  //             .input("BookingId", BookingId)
  //             .input("PropertyName", req.body.PropertyName)
  //             .input("PropertyId", req.body.PropertyId)
  //             .input("GetType", req.body.GetType)

  //             .input("PropertyType", req.body.PropertyType)
  //             .input("RoomType", req.body.RoomType)
  //             .input("SingleTariff", req.body.SingleTariff)
  //             .input("DoubleTariff", req.body.DoubleTariff)
  //             .input("TripleTariff", req.body.TripleTariff)
  //             .input("SingleandMarkup", req.body.SingleandMarkup)
  //             .input("DoubleandMarkup", req.body.DoubleandMarkup)
  //             .input("TripleandMarkup", req.body.TripleandMarkup)
  //             .input("Markup", req.body.Markup)
  //             .input("TAC", req.body.TAC)
  //             .input("DiscountModeRS", req.body.DiscountModeRS)

  //             .input("DiscountModePer", req.body.DiscountModePer)
  //             .input("DiscountAllowed", req.body.DiscountAllowed)
  //             .input("Phone", req.body.Phone)
  //             .input("Email", req.body.Email)
  //             .input("Locality", req.body.Locality)
  //             .input("LocalityId", req.body.LocalityId)
  //             .input("MarkupId", req.body.MarkupId)
  //             .input("SingleandMarkup1", req.body.SingleandMarkup1)
  //             .input("DoubleandMarkup1", req.body.DoubleandMarkup1)
  //             .input("TripleandMarkup1", req.body.TripleandMarkup1)
  //             .input("APIHdrId", req.body.APIHdrId)

  //             .input("RatePlanCode", req.body.RatePlanCode)
  //             .input("RoomTypeCode", req.body.RoomTypeCode)
  //             .input("SingleRoomRate", req.body.SingleRoomRate)
  //             .input("SingleTaxes", req.body.SingleTaxes)
  //             .input("SingleRoomDiscount", req.body.SingleRoomDiscount)
  //             .input("DubRoomRate", req.body.DubRoomRate)
  //             .input("DubTaxes", req.body.DubTaxes)
  //             .input("DubRoomDiscount", req.body.DubRoomDiscount)
  //             .input("AmountAfterTax ", req.body.AmountAfterTax)
  //             .input("AmountBeforeTax", req.body.AmountBeforeTax)
  //             .input("AvaRatePlanCode", req.body.AvaRatePlanCode)

  //             .input("AvailabilityResponseReferenceKey", req.body.AvailabilityResponseReferenceKey)
  //             .input("BookResponseReferenceKey", req.body.BookResponseReferenceKey)
  //             .input("BookHotelReservationIdvalue", req.body.BookHotelReservationIdvalue)
  //             .input("BookHotelReservationIdtype", req.body.BookHotelReservationIdtype)
  //             .input("TACPer", req.body.TACPer)
  //             .input("TaxAdded", req.body.TaxAdded)
  //             .input("TotalCancelAmount", req.body.TotalCancelAmount)
  //             .input("CancellationMarkup", req.body.CancellationMarkup)
  //             .input("Errorcode ", req.body.Errorcode)
  //             .input("Description1", req.body.Description1)
  //             .input("LTAgreed", req.body.LTAgreed)

  //             .input("STAgreed", req.body.STAgreed)
  //             .input("LTRack", req.body.LTRack)
  //             .input("TaxInclusive", req.body.TaxInclusive)
  //             .input("BaseTariff", req.body.BaseTariff)
  //             .input("GeneralMarkup", req.body.GeneralMarkup)
  //             .input("ExpWithTax", req.body.ExpWithTax)
  //             .input("SC", req.body.SC)
  //             .input("AgreedSingle", req.body.AgreedSingle)
  //             .input("AgreedDouble ", req.body.AgreedDouble)
  //             .input("AgreedTriple", req.body.AgreedTriple)
  //             .input("TACTaxInclusive", req.body.TACTaxInclusive)
  //             .input("UserId", req.body.UserId)
  //             .execute("SP_StayBookingPropertyDetails_Insert");
  //         })
  //         .then(result => {
  //           const rows = result.recordsets[0][0];
  //           BookingpropertyId = rows.BookingpropertyId;
  //           sql.close();


  //           //4Th Table Booking property assignedguest Insert

  //           new sql.ConnectionPool(config)
  //             .connect()
  //             .then(pool => {
  //               return pool
  //                 .request()
  //                 .input("BookingId", BookingId)
  //                 .input("EmpCode", req.body.EmpCode)
  //                 .input("FirstName", req.body.FirstName)
  //                 .input("LastName", req.body.LastName)

  //                 .input("GuestId", req.body.GuestId)
  //                 .input("Occupancy", req.body.Occupancy)
  //                 .input("RoomType", req.body.RoomType)
  //                 .input("Tariff", req.body.Tariff)
  //                 .input("RoomId", req.body.RoomId)
  //                 .input("BookingPropertyId", req.body.BookingPropertyId)
  //                 .input("BookingPropertyTableId", BookingpropertyId)
  //                 .input("SSPId", req.body.SSPId)
  //                 .input("ServicePaymentMode", req.body.ServicePaymentMode)
  //                 .input("TariffPaymentMode", req.body.TariffPaymentMode)
  //                 .input("ChkInDt", req.body.ChkInDt)

  //                 .input("ChkOutDt", req.body.ChkOutDt)
  //                 .input("ExpectChkInTime", req.body.ExpectChkInTime)
  //                 .input("CancelRemarks", req.body.CancelRemarks)
  //                 .input("CancelModifiedFlag", req.body.CancelModifiedFlag)
  //                 .input("AMPM", req.body.AMPM)
  //                 .input("RoomCaptured", req.body.RoomCaptured)
  //                 .input("ApartmentId", req.body.ApartmentId)
  //                 .input("RackSingle", req.body.RackSingle)
  //                 .input("RackDouble", req.body.RackDouble)
  //                 .input("RackTriple", req.body.RackTriple)
  //                 .input("PtyChkInTime", req.body.PtyChkInTime)


  //                 .input("PtyChkInAMPM", req.body.PtyChkInAMPM)
  //                 .input("PtyChkOutTime", req.body.PtyChkOutTime)
  //                 .input("PtyChkOutAMPM", req.body.PtyChkOutAMPM)
  //                 .input("PtyGraceTime", req.body.PtyGraceTime)
  //                 .input("LTonRack", req.body.LTonRack)
  //                 .input("LTonAgreed", req.body.LTonAgreed)
  //                 .input("STonRack", req.body.STonRack)
  //                 .input("STonAgreed", req.body.STonAgreed)
  //                 .input("CurrentStatus", req.body.CurrentStatus)
  //                 .input("CheckInHdrId", req.body.CheckInHdrId)
  //                 .input("CheckOutHdrId", req.body.CheckOutHdrId)

  //                 .input("RoomShiftingFlag", req.body.RoomShiftingFlag)
  //                 .input("Title", req.body.Title)
  //                 .input("Column1", req.body.Column1)
  //                 .input("Column2", req.body.Column2)
  //                 .input("Column3", req.body.Column3)
  //                 .input("Column4", req.body.Column4)
  //                 .input("Column5", req.body.Column5)
  //                 .input("Column6", req.body.Column6)
  //                 .input("Column7", req.body.Column7)
  //                 .input("Column8", req.body.Column8)
  //                 .input("Column9", req.body.Column9)
  //                 .input("Column10", req.body.Column10)
  //                 .input("BTCFilePath", req.body.BTCFilePath)
  //                 .input("UserId", req.body.UserId)
  //                 .execute("SP_StayBookingGuestDetails_Insert");
  //             })
  //             .then(result => {
  //               const rows = result.recordsets[0][0];
  //               ApprovalHeaderId = rows1.ApprovalHeaderId;
  //               sql.close();

  //             })
  //             .catch(err => {
  //               res.status(500).send({ message: err.message });
  //               sql.close();
  //             });



  //         })
  //         .catch(err => {
  //           res.status(500).send({ message: err.message });
  //           sql.close();
  //         });





  //     })
  //     .catch(err => {
  //       res.status(500).send({ message: err.message });
  //       sql.close();
  //     });

  // }
}


exports.AIconfirmbooking = function (req, res) {

  let ApprovalHeaderId = 0;
  let ApprovalBookingId = 0;
  let BookingId = 0;
  let BookingpropertyId = 0;
  let Policy = true;
  let roomguestdetails = req.body.roomguestdetails;
  let logindetails = req.body.logindetails;
  let selectedRT = req.body.selectedRT;
  let searchDetails = req.body.searchDetails;
  let selectedProp = req.body.selectedProp
  let breakupHour = searchDetails.CheckInTime.split(':', 2)
  let breakupMinute = breakupHour[1].split(' ')
  // let ampm = searchDetails.CheckInTime.split(' ')



  if (Policy == true) {
    //StayApproval_Header Insert Booking Table 1st.
    new sql.ConnectionPool(config)
      .connect()
      .then(pool => {
        return pool
          .request()
          .input("ClientId", logindetails.ClientId)
          .input("ClientName", logindetails.ClientName)
          .input("Status", 'Cart')
          .input("Remarks", '')
          .input("UserId", logindetails.UserId)
          .input("Str", "")
          .input("Id", 0)
          .execute("Sp_StayApproval_Header_Insert");
      })
      .then(result => {
        const rows1 = result.recordsets[0][0];
        ApprovalHeaderId = rows1.ApprovalHeaderId;
        sql.close();
        //StayApprovalBooking_Details Insert Booking Table 2nd Start.
        new sql.ConnectionPool(config)
          .connect()
          .then(pool => {
            return pool
              .request()
              .input("ApprovalHeaderId", ApprovalHeaderId)
              .input("CheckInDate", searchDetails.checkInDate)
              .input("ExpectedChkInTime", breakupHour[0] + ":" + breakupMinute[0])
              .input("CheckOutDate", searchDetails.checkOutDate)
              .input("CityId", '')
              .input("CityName", searchDetails.locality)
              .input("Status", 'Cart')
              .input("UserId", logindetails.UserId)
              .input("TariffPaymentMode", searchDetails.TariffPaymentMode)
              .input("ServicePaymentMode", searchDetails.ServicePaymentMode)
              .input("TravelType", searchDetails.TravelType)
              .input("SingleCount", searchDetails.SingleOccupancyCount)
              .input("DoubleCount", searchDetails.DoubleOccupancyCount)
              .input("AMPM", breakupMinute[1])
              .execute("SP_StayApprovalBooking_Details_Insert");
          })
          .then(result => {
            const rows2 = result.recordsets[0][0];
            ApprovalBookingId = rows2.ApprovalBookingId;
            sql.close();

            //StayApprovalGuest_Details Insert Booking Table 4th Start.
            new sql.ConnectionPool(config)
              .connect()
              .then(pool => {
                roomguestdetails.forEach((room, RIndex) => {
                  var Occupancy = _.last(room);

                  room.forEach((guest, GIndex) => {
                    if (guest.hasOwnProperty('CltmgntId'))
                      return pool
                        .request()
                        .input("ApprovalBookingId", ApprovalBookingId)
                        .input("GuestId", guest.Id)
                        .input("EmpCode", guest.EmpCode)
                        .input("Title", guest.Title)
                        .input("FirstName", guest.FirstName)
                        .input("LastName", guest.LastName)
                        .input("Grade", guest.Grade)
                        .input("GradeId", guest.GradeId)
                        .input("Designation", guest.Designation)
                        .input("EmailId", guest.EmailId)
                        .input("MobileNo", guest.GMobileNo)
                        .input("Column1", guest.Column1)
                        .input("Column2", guest.Column2)
                        .input("Column3", guest.Column3)
                        .input("Column4", guest.Column4)
                        .input("Column5", guest.Column5)
                        .input("Column6", guest.Column6)
                        .input("Column7", guest.Column7)
                        .input("Column8", guest.Column8)
                        .input("Column9", guest.Column9)
                        .input("Column10", guest.Column10)
                        .input("ManagerName", guest.ManagerName)
                        .input("ManagerEmpCode", guest.ManagerEmpCode)
                        .input("ManagerId", guest.ManagerId)
                        .input("SupervisorEmpCode", guest.SupervisorEmpCode)
                        .input("SupervisorId", guest.SupervisorId)
                        .input("Captured", RIndex + 1)
                        .input("Status", 'Cart')
                        // .input("PaymentMode", guest.PaymentMode)
                        .input("UserId", logindetails.UserId)
                        .input("Occupancy", Occupancy)
                        .execute("Sp_StayApprovalGuest_Details_Insert");
                  });

                });
              })
              .then(() => {

                sql.close();

                //StayApprovalProperty_Details Insert Booking Table 3rd Start.

                new sql.ConnectionPool(config)
                  .connect()
                  .then(pool => {
                    return pool
                      .request()
                      .input("ApprovalBookingId", ApprovalBookingId)
                      .input("PropertyId", selectedRT.PropertyId)
                      .input("PropertyName", selectedRT.PropertyName)
                      .input("GetType", selectedRT.GetType)
                      .input("PropertyType", selectedRT.PropertyType)
                      .input("SingleTariff", parseFloat(selectedRT.SingleTariff))
                      .input("DoubleTariff", parseFloat(selectedRT.DoubleTariff))
                      .input("TripleTariff", 0)
                      .input("RoomType", selectedRT.RoomType)
                      .input("SingleandMarkup", parseFloat(selectedRT.SingleandMarkup[0]))
                      .input("DoubleandMarkup", parseFloat(selectedRT.DoubleandMarkup[0]))
                      .input("TripleandMarkup", 0)
                      .input("Markup", 0)
                      .input("TAC", selectedRT.TAC)
                      .input("Inclusions", selectedRT.Inclusions)
                      .input("DiscountModeRS", selectedRT.DiscountModeRS)
                      .input("DiscountModePer", selectedRT.DiscountModePer)
                      .input("DiscountAllowed", parseFloat(selectedRT.DiscountAllowed))
                      .input("Phone", selectedRT.Phone)
                      .input("Email", selectedRT.Email)

                      .input("Locality", selectedRT.Locality)
                      .input("LocalityId", selectedRT.LocalityId)
                      .input("MarkupId", selectedRT.MarkupId)
                      .input("SingleandMarkup1", selectedRT.SingleandMarkup[0])
                      .input("DoubleandMarkup1", selectedRT.DoubleandMarkup[0])
                      .input("TripleandMarkup1", 0)
                      .input("TACPer", parseFloat(selectedRT.TACPer))
                      .input("TaxAdded", selectedRT.TaxAdded)
                      .input("SingleTax", parseFloat(selectedRT.LTAgreed))
                      .input("DoubleTax", parseFloat(selectedRT.STAgreed))
                      .input("TripleTax", 0)
                      .input("RoomTypeId", searchDetails.RoomTypeId)
                      .input("TaxInclusive", selectedRT.TaxInclusive)
                      .input("BaseTariff", 0)
                      .input("GeneralMarkup", 0)
                      .input("ExpWithTax", '')
                      .input("AgreedSingle", 0)
                      .input("AgreedDouble", 0)
                      .input("AgreedTriple", 0)
                      .input("TACTaxInclusive", selectedRT.TACTaxInclusive)
                      .input("UserId", logindetails.UserId)
                      .execute("SP_StayApprovalProperty_Details_Insert");
                  })
                  .then(result => {
                    sql.close();
                    const rows = result.recordsets;
                    const guestdet = result.recordsets[1];
                    const lodashArr = _.toArray(guestdet);

                    var roomGuestDetailslod = _.groupBy(lodashArr, 'ApprovalBookingId', 'Captured');

                    // var merge = _.merge(roomGuestDetailslod, bookingdet);
                    res.send({ RoomGuests: roomGuestDetailslod });
                  })
                  .catch(err => {
                    res.status(500).send({ message: err.message });
                    winlogger.log('error', err.message);
                    sql.close();
                  });


                //StayApprovalProperty_Details Insert Booking Table 3rd End. 

              })
              .catch(err => {
                res.status(500).send({ message: err.message });
                winlogger.log('error', err.message);
                sql.close();
              });

            //StayApprovalGuest_Details Insert Booking Table 4th End.

          }).catch(err => {
            res.status(500).send({ message: err.message });
            winlogger.log('error', err.message);
            sql.close();
          });
        // .catch(err => {
        //   res.status(500).send({ message: err.message });
        //   winlogger.log('error', err.message);
        //   sql.close();
        // });
        //StayApprovalBooking_Details Insert Booking Table 2nd End.


      })
      .catch(err => {
        res.status(500).send({ message: err.message });
        winlogger.log('error', err.message);
        sql.close();
      });


    //StayApproval_Header Insert Booking Table 1st End.

  }

  /////////////////No Plolicy means Save to Booking Table.



  else {
    // Insert Main Booking Table 1st.
    new sql.ConnectionPool(config)
      .connect()
      .then(pool => {
        return pool
          .request()
          .input("BookingCode", req.body.BookingCode)
          .input("TrackingNo", req.body.TrackingNo)
          .input("ClientId", req.body.ClientId)
          .input("GradeId", req.body.GradeId)
          .input("StateId", req.body.StateId)
          .input("CityId", req.body.CityId)
          .input("ClientName", req.body.ClientName)
          .input("CheckInDate", req.body.CheckInDate)

          .input("ExpectedChkInTime", req.body.ExpectedChkInTime)
          .input("CheckOutDate", req.body.CheckOutDate)
          .input("GradeName", req.body.GradeName)
          .input("StateName", req.body.StateName)
          .input("CityName", req.body.CityName)
          .input("ClientBookerId", req.body.ClientBookerId)
          .input("ClientBookerName", req.body.ClientBookerName)
          .input("ClientBookerEmail", req.body.ClientBookerEmail)

          .input("EmailtoGuest", req.body.EmailtoGuest)
          .input("Note", req.body.Note)
          .input("SpecialRequirements", req.body.SpecialRequirements)
          .input("Status", req.body.Status)
          .input("Sales", req.body.Sales)
          .input("CRM", req.body.CRM)
          .input("CancelRemarks", req.body.CancelRemarks)
          .input("AMPM", req.body.AMPM)
          .input("BookingLevel", req.body.BookingLevel)
          .input("PONo", req.body.PONo)
          .input("PONoId", req.body.PONoId)
          .input("CancelStatus", req.body.CancelStatus)
          .input("BookedDt", req.body.BookedDt)
          .input("BookedUsrId", req.body.BookedUsrId)
          .input("FrontEnd", req.body.FrontEnd)
          .input("MMTPONo", req.body.MMTPONo)

          .input("MMTPONoId", req.body.MMTPONoId)
          .input("ExtraCCEmail", req.body.ExtraCCEmail)
          .input("HRPolicy", req.body.HRPolicy)
          .input("HRPolicyOverrideRemarks", req.body.HRPolicyOverrideRemarks)
          .input("PropertyRefNo", req.body.PropertyRefNo)
          .input("PaymentFlag", req.body.PaymentFlag)
          .input("PaymentCode", req.body.PaymentCode)
          .input("PaymentCodeRemarks", req.body.PaymentCodeRemarks)
          .input("HBStay", req.body.HBStay)
          .input("PurposeOfStay", req.body.PurposeOfStay)
          .input("EATicketNo", req.body.EATicketNo)
          .input("Client_RequestNo", req.body.Client_RequestNo)
          .input("Servicecharge", req.body.Servicecharge)
          .input("Sctariff", req.body.Sctariff)
          .input("Scservice", req.body.Scservice)
          .input("CountryId", req.body.CountryId)

          .input("guestcount", req.body.guestcount)
          .input("singlecount", req.body.singlecount)
          .input("doublecount", req.body.doublecount)
          .input("triplecount", req.body.triplecount)
          .input("TRFornNo", req.body.TRFornNo)
          .input("TRFormNo", req.body.TRFormNo)
          .input("TRId", req.body.TRId)
          .input("UserId", req.body.UserId)
          .execute("SP_StayBooking_Insert");
      })
      .then(result => {
        const rows = result.recordsets[0][0];
        BookingId = rows.BookingId;
        sql.close();

        //Second Table Insert Booking Guest Table Insert


        new sql.ConnectionPool(config)
          .connect()
          .then(pool => {
            return pool
              .request()
              .input("BookingId", BookingId)
              .input("GuestId", req.body.GuestId)
              .input("GradeId", req.body.GradeId)
              .input("EmpCode", req.body.EmpCode)

              .input("Title", req.body.Title)
              .input("FirstName", req.body.FirstName)
              .input("LastName", req.body.LastName)
              .input("Grade", req.body.Grade)
              .input("Designation", req.body.Designation)
              .input("EmailId", req.body.EmailId)
              .input("MobileNo", req.body.MobileNo)
              .input("Nationality", req.body.Nationality)
              .input("RoomType", req.body.RoomType)
              .input("Captured", req.body.Captured)
              .input("PaymentMode", req.body.PaymentMode)
              .input("UserId", req.body.UserId)
              .execute("SP_StayBookingGuestDetails_Insert");
          })
          .then(result => {
            const rows = result.recordsets[0][0];
            ApprovalHeaderId = rows1.ApprovalHeaderId;
            sql.close();

          })
          .catch(err => {
            res.status(500).send({ message: err.message });
            sql.close();
          });


        //Third Table Booking Property Insert 

        new sql.ConnectionPool(config)
          .connect()
          .then(pool => {
            return pool
              .request()
              .input("BookingId", BookingId)
              .input("PropertyName", req.body.PropertyName)
              .input("PropertyId", req.body.PropertyId)
              .input("GetType", req.body.GetType)

              .input("PropertyType", req.body.PropertyType)
              .input("RoomType", req.body.RoomType)
              .input("SingleTariff", req.body.SingleTariff)
              .input("DoubleTariff", req.body.DoubleTariff)
              .input("TripleTariff", req.body.TripleTariff)
              .input("SingleandMarkup", req.body.SingleandMarkup)
              .input("DoubleandMarkup", req.body.DoubleandMarkup)
              .input("TripleandMarkup", req.body.TripleandMarkup)
              .input("Markup", req.body.Markup)
              .input("TAC", req.body.TAC)
              .input("DiscountModeRS", req.body.DiscountModeRS)

              .input("DiscountModePer", req.body.DiscountModePer)
              .input("DiscountAllowed", req.body.DiscountAllowed)
              .input("Phone", req.body.Phone)
              .input("Email", req.body.Email)
              .input("Locality", req.body.Locality)
              .input("LocalityId", req.body.LocalityId)
              .input("MarkupId", req.body.MarkupId)
              .input("SingleandMarkup1", req.body.SingleandMarkup1)
              .input("DoubleandMarkup1", req.body.DoubleandMarkup1)
              .input("TripleandMarkup1", req.body.TripleandMarkup1)
              .input("APIHdrId", req.body.APIHdrId)

              .input("RatePlanCode", req.body.RatePlanCode)
              .input("RoomTypeCode", req.body.RoomTypeCode)
              .input("SingleRoomRate", req.body.SingleRoomRate)
              .input("SingleTaxes", req.body.SingleTaxes)
              .input("SingleRoomDiscount", req.body.SingleRoomDiscount)
              .input("DubRoomRate", req.body.DubRoomRate)
              .input("DubTaxes", req.body.DubTaxes)
              .input("DubRoomDiscount", req.body.DubRoomDiscount)
              .input("AmountAfterTax ", req.body.AmountAfterTax)
              .input("AmountBeforeTax", req.body.AmountBeforeTax)
              .input("AvaRatePlanCode", req.body.AvaRatePlanCode)

              .input("AvailabilityResponseReferenceKey", req.body.AvailabilityResponseReferenceKey)
              .input("BookResponseReferenceKey", req.body.BookResponseReferenceKey)
              .input("BookHotelReservationIdvalue", req.body.BookHotelReservationIdvalue)
              .input("BookHotelReservationIdtype", req.body.BookHotelReservationIdtype)
              .input("TACPer", req.body.TACPer)
              .input("TaxAdded", req.body.TaxAdded)
              .input("TotalCancelAmount", req.body.TotalCancelAmount)
              .input("CancellationMarkup", req.body.CancellationMarkup)
              .input("Errorcode ", req.body.Errorcode)
              .input("Description1", req.body.Description1)
              .input("LTAgreed", req.body.LTAgreed)

              .input("STAgreed", req.body.STAgreed)
              .input("LTRack", req.body.LTRack)
              .input("TaxInclusive", req.body.TaxInclusive)
              .input("BaseTariff", req.body.BaseTariff)
              .input("GeneralMarkup", req.body.GeneralMarkup)
              .input("ExpWithTax", req.body.ExpWithTax)
              .input("SC", req.body.SC)
              .input("AgreedSingle", req.body.AgreedSingle)
              .input("AgreedDouble ", req.body.AgreedDouble)
              .input("AgreedTriple", req.body.AgreedTriple)
              .input("TACTaxInclusive", req.body.TACTaxInclusive)
              .input("UserId", req.body.UserId)
              .execute("SP_StayBookingPropertyDetails_Insert");
          })
          .then(result => {
            const rows = result.recordsets[0][0];
            BookingpropertyId = rows.BookingpropertyId;
            sql.close();


            //4Th Table Booking property assignedguest Insert

            new sql.ConnectionPool(config)
              .connect()
              .then(pool => {
                return pool
                  .request()
                  .input("BookingId", BookingId)
                  .input("EmpCode", req.body.EmpCode)
                  .input("FirstName", req.body.FirstName)
                  .input("LastName", req.body.LastName)

                  .input("GuestId", req.body.GuestId)
                  .input("Occupancy", req.body.Occupancy)
                  .input("RoomType", req.body.RoomType)
                  .input("Tariff", req.body.Tariff)
                  .input("RoomId", req.body.RoomId)
                  .input("BookingPropertyId", req.body.BookingPropertyId)
                  .input("BookingPropertyTableId", BookingpropertyId)
                  .input("SSPId", req.body.SSPId)
                  .input("ServicePaymentMode", req.body.ServicePaymentMode)
                  .input("TariffPaymentMode", req.body.TariffPaymentMode)
                  .input("ChkInDt", req.body.ChkInDt)

                  .input("ChkOutDt", req.body.ChkOutDt)
                  .input("ExpectChkInTime", req.body.ExpectChkInTime)
                  .input("CancelRemarks", req.body.CancelRemarks)
                  .input("CancelModifiedFlag", req.body.CancelModifiedFlag)
                  .input("AMPM", req.body.AMPM)
                  .input("RoomCaptured", req.body.RoomCaptured)
                  .input("ApartmentId", req.body.ApartmentId)
                  .input("RackSingle", req.body.RackSingle)
                  .input("RackDouble", req.body.RackDouble)
                  .input("RackTriple", req.body.RackTriple)
                  .input("PtyChkInTime", req.body.PtyChkInTime)


                  .input("PtyChkInAMPM", req.body.PtyChkInAMPM)
                  .input("PtyChkOutTime", req.body.PtyChkOutTime)
                  .input("PtyChkOutAMPM", req.body.PtyChkOutAMPM)
                  .input("PtyGraceTime", req.body.PtyGraceTime)
                  .input("LTonRack", req.body.LTonRack)
                  .input("LTonAgreed", req.body.LTonAgreed)
                  .input("STonRack", req.body.STonRack)
                  .input("STonAgreed", req.body.STonAgreed)
                  .input("CurrentStatus", req.body.CurrentStatus)
                  .input("CheckInHdrId", req.body.CheckInHdrId)
                  .input("CheckOutHdrId", req.body.CheckOutHdrId)

                  .input("RoomShiftingFlag", req.body.RoomShiftingFlag)
                  .input("Title", req.body.Title)
                  .input("Column1", req.body.Column1)
                  .input("Column2", req.body.Column2)
                  .input("Column3", req.body.Column3)
                  .input("Column4", req.body.Column4)
                  .input("Column5", req.body.Column5)
                  .input("Column6", req.body.Column6)
                  .input("Column7", req.body.Column7)
                  .input("Column8", req.body.Column8)
                  .input("Column9", req.body.Column9)
                  .input("Column10", req.body.Column10)
                  .input("BTCFilePath", req.body.BTCFilePath)
                  .input("UserId", req.body.UserId)
                  .execute("SP_StayBookingGuestDetails_Insert");
              })
              .then(result => {
                const rows = result.recordsets[0][0];
                ApprovalHeaderId = rows1.ApprovalHeaderId;
                sql.close();

              })
              .catch(err => {
                res.status(500).send({ message: err.message });
                sql.close();
              });



          })
          .catch(err => {
            res.status(500).send({ message: err.message });
            sql.close();
          });





      })
      .catch(err => {
        res.status(500).send({ message: err.message });
        sql.close();
      });

  }
}



exports.delbookingreq = function (req, res) {
  sql.close();
  new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
      return pool
        .request()
        .input("Action", 'delete')
        .input("Column1", '')
        .input("Column2", '')
        .input("Column3", '')
        .input("Column4", '')
        .input("Column5", '')
        .input("Column6", '')
        .input("Column7", '')
        .input("Column8", '')
        .input("Column9", '')
        .input("Column10", '')
        .input("GuestId", '')
        .input("RoomId", 0)
        .input("RoomNo", '')
        .input("Id", req.body.Id)
        .execute("SS_StayApprovalGuestDetails_Update");
    })
    .then(result => {

      res.status(200).send({ message: 'Cart item deleted successfully' });


    }).catch(err => {

      res.status(500).send({ message: err.message });
      winlogger.log('error', err.message);
      sql.close();
    })

}


exports.saveSelectedRoomNo = (function (req, res) {

  var reqData = req.body.finalguestdetails;

  new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
      reqData.forEach(element => {
        let bookingId = "";

        //update selected roomno for MGH
        element.value.forEach(item => {
          bookingId = item.ApprovalBookingId
          return pool.request()

            .input("Action", 'update')
            .input("Column1", item.Column1)
            .input("Column2", item.Column2)
            .input("Column3", item.Column3)
            .input("Column4", item.Column4)
            .input("Column5", item.Column5)
            .input("Column6", item.Column6)
            .input("Column7", item.Column7)
            .input("Column8", item.Column8)
            .input("Column9", item.Column9)
            .input("Column10", item.Column10)
            .input("GuestId", item.GuestId)
            .input("Id", item.GstDtlsTblId)
            .input("RoomId", item.RoomId)
            .input("RoomNo", item.RoomNo)
            .execute("SS_StayApprovalGuestDetails_Update")
        })

      })
    }).then(() => {


      res.status(200).send({ message: "roomno has been assigned" });

    })


})

exports.finalcheckout = (function (req, res) {
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
    })
    .catch(err => {
      res.status(500).send({ message: "Error" });
      sql.close();
    });


  sql.close();
  var reqData = req.body.finalguestdetails;

  new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
      reqData.forEach(element => {
        let bookingId = "";

        //update guests on proceed to checkout
        element.value.forEach(item => {
          bookingId = item.ApprovalBookingId
          pool.request()

            .input("Action", 'update')
            .input("Column1", item.Column1)
            .input("Column2", item.Column2)
            .input("Column3", item.Column3)
            .input("Column4", item.Column4)
            .input("Column5", item.Column5)
            .input("Column6", item.Column6)
            .input("Column7", item.Column7)
            .input("Column8", item.Column8)
            .input("Column9", item.Column9)
            .input("Column10", item.Column10)
            .input("GuestId", item.GuestId)
            .input("Id", item.GstDtlsTblId)
            .input("RoomId", item.RoomId)
            .input("RoomNo", item.RoomNo)
            .execute("SS_StayApprovalGuestDetails_Update")
        })
        pool.close();
        sql.close();
        new sql.ConnectionPool(config)
          .connect()
          .then(pool => {
            pool.request()
              .input("Action", 'cart_to_checkout')
              .input("clientid", req.body.clientId)
              .input("usrid", req.body.userId)
              .input("Str1", uniqid())
              .input("Str2", '')
              .input("Id1", parseInt(bookingId))
              .input("Id2", 0)
              .execute("SS_StayApproval_Help").then((result) => {

                //get client and property details

                if (result.recordsets[0][0].Sts == "Approval") {


                  let approvalGuestDetails = result.recordsets[1]

                  let bookingEmailDetails = {

                    checkin: approvalGuestDetails[0].CheckInDate,
                    checkout: approvalGuestDetails[0].CheckOutDate,
                    clientlogo: approvalGuestDetails[0].ClientLogo,
                    companyname: approvalGuestDetails[0].CompanyName,
                    propname: approvalGuestDetails[0].PropertyName,
                    reqdate: approvalGuestDetails[0].RequestDate,
                    reqby: approvalGuestDetails[0].Requestedby,
                    reqid: approvalGuestDetails[0].RequestId,
                    roomtype: approvalGuestDetails[0].RoomType,
                    tariff: approvalGuestDetails[0].Tariff,
                    travelcity: approvalGuestDetails[0].TravelCity,
                    traveltype: approvalGuestDetails[0].TravelType


                  }

                  //foreach guest check if manager id exists and send approval email

                  approvalGuestDetails.forEach(item => {

                    //check if manager id exists

                    if (item.ManagerId != 0 || item.ManagerId != undefined || item.ManagerId != null) {


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
                          "<td valign=\"middle\" align=\"left\" style=\"padding:10px;\"><img style=\"padding:10px;\" src=\"http://endpoint887127.azureedge.net/img/new.png\" width=\"150\" alt=\"logo\"/></td>" +
                          "</tr>" +
                          "<tr>" +
                          "<td align=\"left\" style=\"color:#505050; font-weight:bold; padding:10px; font-size:12px;\">Request Details</td>" +
                          "</tr>" +
                          "<tr>" +
                          "<td valign=\"top\"><table width=\"600\" border=\"0\" cellspacing=\"1\" cellpadding=\"5\">" +
                          "<tr>" +
                          "<td align=\"center\" height=\"30px\" width=\"160px\" bgcolor=\"#cccccc\" style=\"font-size:12px;\">Request Id</td>" +
                          // "<td align=\"center\" height=\"30px\" width=\"160px\" bgcolor=\"#cccccc\" style=\"font-size:12px;\">Request Type</td>" +
                          "<td align=\"center\" height=\"30px\" width=\"110px\" bgcolor=\"#cccccc\" style=\"font-size:12px;\">Requested by</td>" +
                          "<td align=\"center\" height=\"30px\" width=\"100px\" bgcolor=\"#cccccc\" style=\"font-size:12px;\">Request Date</td>" +
                          "<td align=\"center\" height=\"30px\" width=\"230px\" bgcolor=\"#cccccc\" style=\"font-size:12px;\">Company Name</td>" +
                          "</tr>" +
                          "<tr>" +
                          "<td align=\"center\" height=\"30px\" width=\"160px\" bgcolor=\"#eeeeee\" style=\"font-size:12px;\"> " + bookingEmailDetails.reqid + "</td>" +
                          // "<td align=\"center\" height=\"30px\" width=\"160px\" bgcolor=\"#eeeeee\" style=\"font-size:12px;\">" + bookingEmailDetails.traveltype + "</td>" +
                          "<td align=\"center\" height=\"30px\" width=\"110px\" bgcolor=\"#eeeeee\" style=\"font-size:12px;\">" + bookingEmailDetails.reqby + "</td>" +
                          "<td align=\"center\" height=\"30px\" width=\"100px\" bgcolor=\"#eeeeee\" style=\"font-size:12px;\">" + bookingEmailDetails.reqdate + "</td>" +
                          "<td align=\"center\" height=\"30px\" width=\"230px\" bgcolor=\"#eeeeee\" style=\"font-size:12px;\">" + bookingEmailDetails.companyname + "</td>" +
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
                          // "<td align=\"center\" bgcolor=\"#FF9900\" style=\"font-size:12px;\">Gender</td>" +
                          "<td align=\"center\" bgcolor=\"#FF9900\" style=\"font-size:12px;\">Email ID</td>" +
                          "<td align=\"center\" bgcolor=\"#FF9900\" style=\"font-size:12px;\">Number</td>" +

                          "</tr>" +
                          "<tr>" +
                          "<td align=\"center\" bgcolor=\"#FFCC66\" style=\"font-size:12px;\">" + item.EmpCode + "</td>" +
                          "<td align=\"center\" bgcolor=\"#FFCC66\" style=\"font-size:12px;\">" + item.EmpName + "</td>" +
                          // "<td align=\"center\" bgcolor=\"#FFCC66\" style=\"font-size:12px;\">" + "" + "</td>" +
                          "<td align=\"center\" bgcolor=\"#FFCC66\" style=\"font-size:12px;\">" + item.EmailId + " </td>" +
                          "<td align=\"center\" bgcolor=\"#FFCC66\" style=\"font-size:12px;\">" + item.MobileNo + "</td>" +
                          "</tr>" +
                          "</table></td>" +
                          "<tr >" +
                          "<td valign=\"top\"><table width=\"600\" border=\"0\" cellspacing=\"2\" cellpadding=\"3\" style=\"padding-top:4px\">" +
                          "<tr>" +
                          "<td align=\"center\" bgcolor=\"#FF9900\" style=\"font-size:12px;\">Grade</td>" +
                          "<td align=\"center\" bgcolor=\"#FF9900\" style=\"font-size:12px;\">Check-In Date</td>" +
                          "<td align=\"center\" bgcolor=\"#FF9900\" style=\"font-size:12px;\">Check-Out Date</td>" +
                          // "<td align=\"center\" bgcolor=\"#FF9900\" style=\"font-size:12px;\">Reason For Travel</td>" +
                          // "<td align=\"center\" bgcolor=\"#FF9900\" style=\"font-size:12px;\">Remarks</td>" +
                          "</tr>" +
                          "<tr>" +
                          "<td align=\"center\" bgcolor=\"#FFCC66\" style=\"font-size:12px;\">" + item.Grade + "</td>" +
                          "<td align=\"center\" bgcolor=\"#eeeeee\" style=\"font-size:12px;\">" + bookingEmailDetails.checkin + "</td>" +
                          "<td align=\"center\" bgcolor=\"#eeeeee\" style=\"font-size:12px;\">" + bookingEmailDetails.checkout + "</td>" +
                          // "<td align=\"center\" bgcolor=\"#eeeeee\" style=\"font-size:12px;\">" + bookingEmailDetails.traveltype + "</td>" +
                          // "<td align=\"center\" bgcolor=\"#eeeeee\" style=\"font-size:12px;\">" + "" + "</td>" +

                          "</tr>" +
                          "<tr>" +
                          "<td align=\"center\" bgcolor=\"#FF9900\" style=\"font-size:12px;\">Hotel Name</td>" +
                          "<td align=\"center\" bgcolor=\"#FF9900\" style=\"font-size:12px;\">Room Type</td>" +
                          "<td align=\"center\" bgcolor=\"#FF9900\" style=\"font-size:12px;\">Tariff</td>" +
                          // "<td align=\"center\" bgcolor=\"#FF9900\" style=\"font-size:12px;\">Location</td>" +
                          "<td align=\"center\" bgcolor=\"#FF9900\" style=\"font-size:12px;\">Travel to city</td>" +
                          "</tr>" +
                          "<tr>" +
                          "<td align=\"center\" bgcolor=\"#eeeeee\" style=\"font-size:12px;\">" + bookingEmailDetails.propname + "</td>" +
                          "<td align=\"center\" bgcolor=\"#eeeeee\" style=\"font-size:12px;\">" + bookingEmailDetails.roomtype + "</td>" +
                          "<td align=\"center\" bgcolor=\"#eeeeee\" style=\"font-size:12px;\">" + bookingEmailDetails.tariff + "</td>" +
                          // "<td align=\"center\" bgcolor=\"#eeeeee\" style=\"font-size:12px;\">" + "" + "</td>" +
                          "<td align=\"center\" bgcolor=\"#eeeeee\" style=\"font-size:12px;\">" + bookingEmailDetails.travelcity + "</td>" +
                          "</tr>" +
                          "</table></td>" +
                          "</tr>" +
                          "<tr>" +
                          "<td style=\"padding:20px;\"><!-- Space for approval button--></td>" +
                          "</tr>" +
                          "<tr>" +
                          "<td valign=\"top\"><table width=\"600\" border=\"0\" cellspacing=\"1\" cellpadding=\"0\">" +
                          "<tr>" +
                          "<td bgcolor=\"#cccccc\" colspan=\"2\">" +
                          "<label>To Approve/Deny request, simply click on the buttons shown below (or copy the link below the button into your Firefox or Chrome browser).</label>" +
                          "</td>" +
                          "<br/>" +
                          "</tr>" +
                          "<tr>" +
                          "<td bgcolor=\"#cccccc\" width=\"50%\" style=\"font-size:12px; padding:10px;text-align:center\">" +
                          "<div>" +
                          "<a href=\ " + config.clientUrl + "Pendingapprovalemail/" + bookingEmailDetails.reqid.split('/')[1] + "/" + item.ManagerId + "/" + item.GuestRowId + "/" + "Approve" + "\" style=\"background-color:#1ea914;border:1px solid #1e5021;border-radius:4px;color:#ffffff;display:inline-block;font-family:sans-serif;font-size:13px;font-weight:bold;line-height:40px;text-align:center;text-decoration:none;width:200px;-webkit-text-size-adjust:none;mso-hide:all;\">Approve Request</a></div>" +
                          "</td>" +
                          "<td bgcolor=\"#cccccc\" width=\"50%\" style=\"font-size:12px; padding:10px;text-align:center\">" +
                          "<div><a href=\ " + config.clientUrl + "Pendingapprovalemail/" + bookingEmailDetails.reqid.split('/')[1] + "/" + item.ManagerId + "/" + item.GuestRowId + "/" + "Deny" + "\" style=\"background-color:#b4040a;border:1px solid #501e1e;border-radius:4px;color:#ffffff;display:inline-block;font-family:sans-serif;font-size:13px;font-weight:bold;line-height:40px;text-align:center;text-decoration:none;width:200px;-webkit-text-size-adjust:none;mso-hide:all;\">Deny Request</a></div>" +
                          "</td>" +
                          "</tr>" +
                          "<tr>" +
                          "<td bgcolor=\"#cccccc\" width=\"100%\" colspan=\"2\">" +
                          "<label style:\"green\">Approve :" + " " + "</label>" +
                          "<label>\ " + config.clientUrl + "Pendingapprovalemail/" + bookingEmailDetails.reqid.split('/')[1] + "/" + item.ManagerId + "/" + item.GuestRowId + "/" + "Approve" + "\"</label>" +
                          "<br/>" +
                          "<br/>" +
                          "<label style:\"red\">Deny :" + " " + "</label>" +
                          "<label>\ " + config.clientUrl + "Pendingapprovalemail/" + bookingEmailDetails.reqid.split('/')[1] + "/" + item.ManagerId + "/" + item.GuestRowId + "/" + "Deny" + "\" </label>" +
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
                          to: item.manageremailid,
                          subject: 'Hotel-Guest house request - Intimation : ' + bookingEmailDetails.reqid,
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



                  })

                }

                else if (result.recordsets[0][0].Sts == "Recommendation") {

                  //send recommendation if no grade exists or if no approval needed

                  let approvalGuestDetails = result.recordsets[2]
                  let bookingEmailDetails = result.recordsets[1][0]
                  let propEmailDetails = result.recordsets[3][0]
                  let logoDetails = result.recordsets[4][0]
                  let fromEmailId = result.recordsets[5][0].FromEmailId

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
                    var GuestEmail = ""

                    Imagebody =
                      " <table cellpadding=\"0\" cellspacing=\"0\" width=\"800px\" border=\"0\" align=\"center\" style=\" position: relative; font-family:  arial, helvetica; font-size: 12px;  border: #cccdcf solid 1px\">" +
                      "<tr><td>" +
                      "<table cellpadding=\"0\" cellspacing=\"0\" width=\"800px\" border=\"0\" align=\"center\">" +
                      "<tr> " +
                      "<th align=\"left\" width=\"50%\" style=\"padding: 10px 0px 10px 10px;\">" +
                      "<img src=" + logoDetails.Logo + " width=\"150px\"  alt=" + logoDetails.LogoName + ">" +
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
                      cc: "hbconf17@gmail.com",
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


                else if (result.recordsets[0][0].Sts == "Booked") {


                  BookingId = result.recordsets[0][0].Code
                  BookingRowId = result.recordsets[0][0].BookingRowId

                  //MGH Email Start

                  pool.request()
                    .input("Action", 'RoomBookingConfirmed')
                    .input("Str", '')
                    .input("Id", parseInt(BookingId))
                    .execute("SS_BookingDtls_Help").then(result => {

                      //Get From and To Email

                      let Response = result.recordsets



                      DeskNo = "080-33013103";
                      link = "http://mybooking.hummingbirdindia.com/?redirect=BookingConfirmation&B=R&R=" + BookingRowId;
                      //Confirmation email start
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
                          "<table style =\"max-width:600px; width:100%; margin:auto;\" cellpadding =\"0\" cellspacing =\"0\" border = \"0\">" +
                          "<tr>" +
                          "<td align = \"right\" style =\"padding:10px 0 10px 0;\">" +
                          "<a style = \"font-size:12px; padding:10px 0 10px 0;\" align =\"right\" href=" + link + "> View in browser </a> </td>" +
                          "</tr>" +
                          "<tr>" +
                          "<td align = \"center\" style =\"padding:10px 0 10px 0;\">" +
                          "<img src=" + result.recordsets[2][0].ClientLogo + " width = \"150\" alt=" + result.recordsets[2][0].ClientName + "></td>" +
                          "</tr>" +
                          " <tr>" +
                          "<td style =\"font-size:16px; padding:20px 0 10px 0; line-height:28px;\" align = \"center\"><span style =\"padding:5px;\"><strong> Booking Confirmation #:  " + result.recordsets[2][0].BookingCode + " </strong></span></td>" +
                          "</tr>" +
                          "<tr>" +
                          "<td style = \"padding:20px 0 20px 0;\">" +
                          "<table cellpadding = \"10\" cellspacing = \"1\" border = \"0\" bgcolor = \"#cccccc\" style = \"width:100%;\">" +
                          "<tr bgcolor=\"#FAFAFA\">" +
                          "<td  style = \"font-size:13px; width:50%;\" valign = \"top\"><strong>Booked by :" + result.recordsets[2][0].ClientBookerName + "</strong></td>" +
                          "<td  style = \"font-size:13px; width:50%;\" valign = \"top\"><span style = \"padding:0px; background:#ffcc00;\"><strong> Please refer your name and " + result.recordsets[2][0].BookingCode + " at the time of/check - In </strong></span> </td>" +
                          "</tr>" +
                          "<tr>" +
                          "<td bgcolor = \"#FFFFFF\" style = \"font-size:13px; width:50%;\" valign = \"top\"><strong> Reservation Date </strong></td>" +
                          "<td bgcolor = \"#FFFFFF\" style = \"font-size:13px; width:50%;\" valign = \"top\"> " + result.recordsets[2][0].BookedDt + " </td>" +
                          "</tr>" +
                          "<tr bgcolor=\"#FAFAFA\">" +
                          "<td  style = \"font-size:13px; width:50%;\" valign = \"top\"><strong> Company Name </strong></td>" +
                          "<td  style = \"font-size:13px; width:50%;\" valign = \"top\"> " + result.recordsets[2][0].ClientName + "</td>" +
                          "</tr>" +
                          "<tr>" +
                          "<td bgcolor = \"#FFFFFF\" style = \"font-size:13px; width:50%;\" valign = \"top\"><strong> Client Request / Booking No </strong></td>" +
                          "<td bgcolor = \"#FFFFFF\" style = \"font-size:13px; width:50%;\" valign = \"top\"> " + result.recordsets[2][0].BookingCode + "</td>" +
                          "</tr>" +
                          "</table>" +
                          "</td>" +
                          "</tr>" +
                          "<tr>" +
                          "<td style = \"font-size:13px; padding:0px 0 20px 0; line-height:28px;\" align = \"center\"><span style = \"padding:5px; background:#ffcc00;\"><strong> Kindly inform the below helpdesk for any changes in your stay, For your ACCOUNTING PURPOSE e.g. Extended Stay, Short Stay, No Show, Room change </strong></span></td>" +
                          "</tr>" +
                          "<tr>" +
                          "<td bgcolor = \"#FF4500\" style = \"font-size:16px; color:#FFFFFF; width:50%; padding:10px 0 10px 0;\" valign = \"top\" align = \"center\"><strong> Guest Details </strong></td>" +
                          "</tr>";

                        GuestDetailsTable1 =
                          "<tr>" +
                          "<td style = \"padding:0 0 40px 0;\">" +
                          "<table cellpadding = \"10\" cellspacing = \"1\" border = \"0\" bgcolor = \"#cccccc\" style = \"width:100%;\">" +
                          "<tr  bgcolor=\"#FAFAFA\">" +
                          "<td bgcolor = \"#FFFFFF\" style = \"font-size:13px; width:16%;\" valign = \"top\" align = \"center\"><strong> Guest Name </strong></td>" +
                          "<td bgcolor = \"#FFFFFF\" style = \"font-size:13px; width:16%;\" valign = \"top\" align = \"center\"><strong> Check - In Date / Expected Time </strong></td>" +
                          "<td bgcolor = \"#FFFFFF\" style = \"font-size:13px; width:16%;\" valign = \"top\" align = \"center\"><strong> Check - Out Date </strong></td>" +
                          "<td bgcolor = \"#FFFFFF\" style = \"font-size:13px; width:16%;\" valign = \"top\" align = \"center\"><strong> Room No / Occupancy </strong></td>" +
                          "<td bgcolor = \"#FFFFFF\" style = \"font-size:13px; width:16%;\" valign = \"top\" align = \"center\"><strong> Payment Mode for Tariff </strong></td>" +
                          "<td bgcolor = \"#FFFFFF\" style = \"font-size:13px; width:16%;\" valign = \"top\" align = \"center\"><strong> Payment Mode for Service </strong></td>" +
                          "</tr>";
                        result.recordsets[0].forEach(item => {
                          GuestDetailsTable1 +=
                            "<tr>" +
                            "<td bgcolor = \"#FFFFFF\" style = \"font-size:13px; width:16%;\" valign = \"top\" align = \"center\"> " + item.Name + " </td>" +
                            "<td bgcolor = \"#FFFFFF\" style = \"font-size:13px; width:16%;\" valign = \"top\" align = \"center\"> " + item.ChkInDt + "</td>" +
                            "<td bgcolor = \"#FFFFFF\" style = \"font-size:13px; width:16%;\" valign = \"top\" align = \"center\"> " + item.ChkOutDt + " </td>" +
                            "<td bgcolor = \"#FFFFFF\" style = \"font-size:13px; width:16%;\" valign = \"top\" align = \"center\"> " + item.RoomNo + " / " + item.Occupancy + "</td>" +
                            "<td bgcolor = \"#FFFFFF\" style = \"font-size:13px; width:16%;\" valign = \"top\" align = \"center\"> " + item.TariffPaymentMode + "<br/> </td>" +
                            "<td bgcolor = \"#FFFFFF\" style = \"font-size:13px; width:16%;\" valign = \"top\" align = \"center\">" + item.ServicePaymentMode + "</td>" +
                            "</tr>";

                        })

                        GuestDetailsTable1 += "</table>" +
                          "</td>" +
                          "</tr>";


                        AddressDtls =
                          "<tr>" +
                          "<td bgcolor = \"#FF4500\" style = \"font-size:16px; color:#FFFFFF; width:50%; padding:10px 0 10px 0;\" valign = \"top\" align = \"center\"><strong> Contact Details </strong></td>" +
                          "</tr>" +
                          "<tr>" +
                          "<td style = \"padding:0 0 20px 0;\">" +
                          "<table cellpadding = \"10\" cellspacing = \"1\" border = \"0\" bgcolor = \"#cccccc\" style = \"width:100%;\">" +
                          "<tr  bgcolor=\"#FAFAFA\">" +
                          "<td style = \"font-size:13px; width:40%;\" valign = \"top\"><strong> Property Name </strong></td>" +
                          "<td  style = \"font-size:13px; width:60%;\" valign = \"top\">" + result.recordsets[1][0].PropertyName + " </td>" +
                          "</tr>" +
                          "<tr>" +
                          "<td bgcolor = \"#FFFFFF\" style = \"font-size:13px; width:40%;\" valign = \"top\"><strong> Property Address </strong></td>" +
                          "<td bgcolor = \"#FFFFFF\" style = \"font-size:13px; width:60%;\" valign = \"top\"> " + result.recordsets[1][0].ADDRESS + " </td>" +
                          "</tr>" +
                          "<tr bgcolor=\"#FAFAFA\">" +
                          "<td  style = \"font-size:13px; width:40%;\" valign = \"top\"><strong> Property Phone </strong></td>" +
                          "<td  style = \"font-size:13px; width:60%;\" valign = \"top\">" + result.recordsets[1][0].Phone + " </td>" +
                          "</tr>" +
                          "<tr>" +
                          "<td  bgcolor = \"#FFFFFF\" style = \"font-size:13px; width:40%;\" valign = \"top\"><strong> Inclusions </strong></td>" +
                          "<td  bgcolor = \"#FFFFFF\" style = \"font-size:13px; width:60%;\" valign = \"top\">" + result.recordsets[1][0].Facility + " </td>" +
                          "</tr>" +
                          "<tr bgcolor=\"#FAFAFA\">" +
                          "<td bgcolor = \"#FFFFFF\" style = \"font-size:13px; width:40%;\" valign = \"top\"><strong> Directions </strong></td>" +
                          "<td bgcolor = \"#FFFFFF\" style = \"font-size:13px; width:60%;\" valign = \"top\">" + result.recordsets[1][0].Directions + "</td>" +
                          "</tr>" +
                          "<tr>" +
                          "<td bgcolor = \"#FFFFFF\" style = \"font-size:13px; width:40%;\" valign = \"top\"><strong> Map </strong></td>" +
                          "<td bgcolor = \"#FFFFFF\" style = \"font-size:13px; width:60%;\" valign = \"top\" align=\"center\"> <a href=\"https://www.google.co.in/maps/place/" + result.recordsets[1][0].Map + "\">" + "<img style=\"width:36px;height:36px;\" src=\"http://portalvhds4prl9ymlwxnt8.blob.core.windows.net/img/Google_Maps_Icon.png\"/> " + "</a></td>" +
                          "</tr>" +
                          "<tr bgcolor=\"#FAFAFA\">" +
                          "<td  style = \"font-size:13px; width:40%;\" valign = \"top\"><strong> Note </strong></td>" +
                          "<td  style = \"font-size:13px; width:60%;\" valign = \"top\"> " + result.recordsets[1][0].ExtraNote + "</td>" +
                          "</tr>" +
                          "<tr>" +
                          "<td  bgcolor = \"#FFFFFF\" style = \"font-size:13px; width:40%;\" valign = \"top\"><strong>Special Note</strong></td>" +
                          "<td  bgcolor = \"#FFFFFF\" style = \"font-size:13px; width:60%;\" valign = \"top\"> " + result.recordsets[1][0].ExtraNote + "</td>" +
                          "</tr>" +
                          "<tr bgcolor=\"#FAFAFA\">" +
                          "<td bgcolor = \"#FFFFFF\" style = \"font-size:13px; width:40%;\" valign = \"top\"><strong> Check In Policy</strong></td>" +
                          "<td bgcolor = \"#FFFFFF\" style = \"font-size:13px; width:60%;\" valign = \"top\">" + result.recordsets[1][0].CheckInType + " </td>" +
                          "</tr>" +
                          "<tr>" +
                          "<td bgcolor = \"#FFFFFF\" style = \"font-size:13px; width:30%;\" valign = \"top\"><strong> Contact for any issues and feedbacks </strong></td>" +
                          "<td bgcolor = \"#FFFFFF\" style = \"font-size:13px; width:50%;\" valign = \"top\">" + DeskNo + " " + "," + " " + result.recordsets[10][0].EmailId + "</td>" +
                          "</tr>" +
                          "</table>" +
                          "</td>" +
                          "</tr>";

                        FooterDtls =
                          "<tr>" +
                          "<td style = \"padding:20px 0 20px 0;\">" +
                          "<table cellpadding = \"10\" cellspacing = \"1\" border = \"0\" bgcolor = \"#cccccc\" style = \"width:100%;\">" +
                          "<tr bgcolor=\"#FAFAFA\">" +
                          "<td  style = \"font-size:11px; width:50%;\" valign = \"top\"><strong> Security Policy </strong></td>" +
                          "<td  style = \"font-size:11px; width:50%;\" valign = \"top\"> " + result.recordsets[1][0].BookingPolicy + "</td>" +
                          "</tr>" +
                          "<tr>" +
                          "<td bgcolor = \"#FFFFFF\" style = \"font-size:11px; width:50%;\" valign = \"top\"><strong>Cancellation / No Show / Early Departure Policy</strong></td>" +
                          "<td bgcolor = \"#FFFFFF\" style = \"font-size:11px; width:50%;\" valign = \"top\"> " + result.recordsets[1][0].CancelPolicy + "</td>" +
                          "</tr>" +
                          "</table>" +
                          "</td>" +
                          "</tr>" +
                          "<tr>" +
                          "<td style = \"font-size:12px; padding:20px 0 20px 0;\"> " + result.recordsets[4][0].Strg + " </td>" +
                          "</tr>" +
                          "</table>";


                        var EmailContent = Imagebody + GuestDetailsTable1 + AddressDtls + FooterDtls;
                        let mailOptions = {
                          from: '"No Reply"' + 'stay@hummingbirdindia.com',
                          to: 'ravi@hummingbirdindia.com',
                          cc: "hbconf17@gmail.com",
                          subject: "Booking Confirmation - " + result.recordsets[2][0].BookingCode,
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
                    })
                  //Confirmation email end

                }


              }).catch(err => {
                res.status(500).send({ message: err.message });
                winlogger.log('error', err.message);
                sql.close();

              })

          })
      })

    }).then(() => {
      sql.close();

      res.status(200).send({ message: 'Cart item updated successfully' });


    }).catch(err => {

      res.status(500).send({ message: err.message });
      winlogger.log('error', err.message);
      sql.close();
    })



})


exports.AIRecommendedProp = (function (req, res) {
  new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
      return pool
        .request()
        .input("Action", "Property")
        .input("Grade", req.body.grade)
        .input("GradeId", req.body.gradeId)
        .input("ChkInDt", req.body.checkIn)
        .input("ChkOutDt", req.body.checkOut)
        .input("Lattitude", req.body.lat)
        .input("Longitude", req.body.long)
        .input("ClientId", req.body.clientId)
        .input("GuestId", req.body.guestId)
        .input("CityId", "")
        .execute("SP_Booking_PropertyLoad_Help_AIRecommendation_Sakthi");
    })
    .then(result => {

      let rows = result.recordsets[1];

      res.status(200).send({ propList: rows })

    }).catch(err => {

      res.status(500).send({ message: 'something went wrong !' })

    })

})


exports.getMghRoomType = (function (req, res) {
  new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
      return pool
        .request()
        .input("Action", "MGHRoomDtls")
        .input("ChkInDt", req.body.ChkInDt)
        .input("ChkOutDt", req.body.ChkOutDt)
        .input("ClientId", req.body.ClientId)
        .input("PropertyId", req.body.PropertyId)
        .input("BookingLevel", req.body.BookingLevel)
        .input("PropertyType", req.body.PropertyType)
        .input("Param1", req.body.Param1)
        .input("Param2", req.body.Param2)
        .execute("SS_StaySimplyfied_MGHRooms");
    })
    .then(result => {

      res.status(200).send({ roomTypeList: result.recordsets[0] })

    }).catch(err => {

      res.status(500).send({ message: 'something went wrong !' })

    })


})



