sap.ui.define([
	"sap/ui/integration/Extension",
	"sap/ui/core/format/DateFormat",
	"sap/ui/core/date/UI5Date"
], function(Extension, DateFormat, UI5Date) {
	"use strict";

	var SampleExtension = Extension.extend("cardsdemo.mobileSdk.calendarCardWithExtension.extension");


	SampleExtension.prototype.init = function () {
		this.attachAction(function (oEvent) {
			var sActionType = oEvent.getParameter("type"),
				mParams = oEvent.getParameter("parameters");

			if (sActionType === "DateChange") {
				this._updateAppointments(mParams.selectedDate);
			} else if (sActionType === "MonthChange") {
				this._updateCalendarData(mParams.firstDate, mParams.lastDate);
			}
		});
	};

	SampleExtension.prototype._updateAppointments = function (oSelectedDate) {
		var oData = this._generateAppointmentsData(oSelectedDate),
			oCard = this.getCard();

		setTimeout(function () {
			oCard.getModel("calendarData").setProperty("/item", oData.item);
		}, 3000); // simulate delay
	};

	SampleExtension.prototype._updateCalendarData = function (oStartDate, oEndDate) {
		var oData = this._generateMonthData(oStartDate, oEndDate),
			oCard = this.getCard();

		setTimeout(function () {
			oCard.getModel("calendarData").setProperty("/specialDate", oData.specialDates);
			oCard.getModel("calendarData").setProperty("/legendItem", oData.legendItems);
		}, 3000); // simulate delay
	};


	SampleExtension.prototype._buildAppointments = function(oStartDate, oAppointmentDates) {
		var oFormatter = DateFormat.getDateTimeInstance({
			pattern: "YYYY-MM-ddTHH:mm"
		}),
			aBuiltAppointments = [],
			sStartDateString = oStartDate.toDateString();

		aBuiltAppointments.push({
			"start": oFormatter.format(oAppointmentDates[0].startDate, true),
			"end": oFormatter.format(oAppointmentDates[0].endDate, true),
			"title": "Daily meeting for " + sStartDateString,
			"text": "repetitive meeting",
			"icon": "sap-icon://repost",
			"type": "Type08"
		});

		aBuiltAppointments.push({
			"start": oFormatter.format(oAppointmentDates[1].startDate, true),
			"end": oFormatter.format(oAppointmentDates[1].endDate, true),
			"title": "Lunch for " + sStartDateString,
			"text": "out of office",
			"icon": "sap-icon://meal",
			"type": "Type06"
		});

		aBuiltAppointments.push({
			"start": oFormatter.format(oAppointmentDates[2].startDate, true),
			"end": oFormatter.format(oAppointmentDates[2].endDate, true),
			"title": "Private appointment for " + sStartDateString,
			"icon": "sap-icon://locked",
			"type": "Type13"
		});

		return aBuiltAppointments;
	};

	SampleExtension.prototype._generateAppointmentsData = function(oSelectedDate) {
		var oStartDate = UI5Date.getInstance(oSelectedDate),
			oFirstAppointmentStart = UI5Date.getInstance(oSelectedDate),
			oFirstAppointmentEnd = UI5Date.getInstance(oSelectedDate),
			oSecondAppointmentStart = UI5Date.getInstance(oSelectedDate),
			oSecondAppointmentEnd = UI5Date.getInstance(oSelectedDate),
			oThirdAppointmentStart = UI5Date.getInstance(oSelectedDate),
			oThirdAppointmentEnd = UI5Date.getInstance(oSelectedDate),
			aAppointments;

		oFirstAppointmentStart.setHours(9, 0, 0, 0);
		oFirstAppointmentEnd.setHours(9, 30, 0, 0);
		oSecondAppointmentStart.setHours(12, 0);
		oSecondAppointmentEnd.setHours(13, 0);
		oThirdAppointmentStart.setHours(18, 0);
		oThirdAppointmentEnd.setHours(18, 0);

		aAppointments = this._buildAppointments(
			oStartDate,
			[
				{
					startDate: oFirstAppointmentStart,
					endDate: oFirstAppointmentEnd
				},
				{
					startDate: oSecondAppointmentStart,
					endDate: oSecondAppointmentEnd
				},
				{
					startDate: oThirdAppointmentStart,
					endDate: oThirdAppointmentEnd
				}
			]
		);

		return {
			"item": aAppointments
		};
	};

	SampleExtension.prototype._generateMonthData = function (oStartDate, oEndDate) {
		var oDateInDisplayedMonth = UI5Date.getInstance(oStartDate.getFullYear(), oStartDate.getMonth(), oStartDate.getDate() + 8),
			sSelectedMonth = oDateInDisplayedMonth.getMonth().toString(),
			iRandomTypeNumber = Math.floor(Math.random() * (9 - 1) + 1),
			iSecondRandomTypeNumber = Math.floor(Math.random() * (20 - 10) + 10),
			oActualDate = new Date(),
			iSeconds = oActualDate.getSeconds(),
			sDummyDate1,
			sDummyDate2,
			sDummyDate3,
			sDummyDate4;

			sSelectedMonth = sSelectedMonth.length === 1 ? "0" + (sSelectedMonth - 0 + 1) : (sSelectedMonth - 0 + 1);

			if (iSeconds <= 9) {
				sDummyDate1 = "2019-" + sSelectedMonth + "-21T12:00";
				sDummyDate2 = "2019-" + sSelectedMonth + "-13T12:00";
				sDummyDate3 = "2019-10-21T12:00";
				sDummyDate4 = "2019-10-13T12:00";
			} else if (iSeconds <= 19) {
				sDummyDate1 = "2019-" + sSelectedMonth + "-23T12:00";
				sDummyDate2 = "2019-" + sSelectedMonth + "-15T12:00";
				sDummyDate3 = "2019-10-23T12:00";
				sDummyDate4 = "2019-10-15T12:00";
			} else if (iSeconds <= 29) {
				sDummyDate1 = "2019-" + sSelectedMonth + "-25T12:00";
				sDummyDate2 = "2019-" + sSelectedMonth + "-17T12:00";
				sDummyDate3 = "2019-10-25T12:00";
				sDummyDate4 = "2019-10-17T12:00";
			} else if (iSeconds <= 39) {
				sDummyDate1 = "2019-" + sSelectedMonth + "-27T12:00";
				sDummyDate2 = "2019-" + sSelectedMonth + "-19T12:00";
				sDummyDate3 = "2019-10-27T12:00";
				sDummyDate4 = "2019-10-19T12:00";
			} else if (iSeconds <= 49) {
				sDummyDate1 = "2019-" + sSelectedMonth + "-19T12:00";
				sDummyDate2 = "2019-" + sSelectedMonth + "-11T12:00";
				sDummyDate3 = "2019-10-19T12:00";
				sDummyDate4 = "2019-10-11T12:00";
			} else {
				sDummyDate1 = "2019-" + sSelectedMonth + "-17T12:00";
				sDummyDate2 = "2019-" + sSelectedMonth + "-09T12:00";
				sDummyDate3 = "2019-10-17T12:00";
				sDummyDate4 = "2019-10-09T12:00";
			}
		return {
			"specialDates": [
				{
					"start": sDummyDate1,
					"type": "Type0" + iRandomTypeNumber
				},
				{
					"start": sDummyDate2,
					"type": "Type" + iSecondRandomTypeNumber
				},
				{
					"start": sDummyDate3,
					"type": "Type0" + iRandomTypeNumber
				},
				{
					"start": sDummyDate4,
					"type": "Type" + iSecondRandomTypeNumber
				}
			],
			"legendItems": [
				{
					"category": "calendar",
					"text": "Out of office",
					"type": "Type0" + iRandomTypeNumber
				},
				{
					"category": "calendar",
					"text": "Public holiday",
					"type": "Type" + iSecondRandomTypeNumber
				},
				{
					"category": "appointment",
					"text": "Private appointment",
					"type": "Type06"
				},
				{
					"category": "appointment",
					"text": "Collaboration with other team members",
					"type": "Type08"
				},
				{
					"category": "appointment",
					"text": "Out of office",
					"type": "Type13"
				}
			]
		};
	};

	return SampleExtension;
});