sap.ui.define([
	"sap/ui/integration/Extension",
	"sap/ui/core/format/DateFormat"
], function(Extension, DateFormat) {
	"use strict";

	var SampleExtension = Extension.extend("card.explorer.calendar.extensionSample.SampleExtension");


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

	SampleExtension.prototype._generateAppointmentsData = function(oSelectedDate) {
		var oFormatter = DateFormat.getDateTimeInstance({
				pattern: "YYYY-MM-ddTHH:mm"
			}),
			oStartDate = new Date(oSelectedDate),
			oEndDate = new Date(oSelectedDate),
			aAppointmentDates = [];

		// format as UTC dates, this is how all the dates are fed in the model

		oStartDate.setHours(9, 0, 0, 0);
		oEndDate.setHours(9, 30, 0, 0);

		aAppointmentDates.push({
			"start": oFormatter.format(oStartDate, true),
			"end": oFormatter.format(oEndDate, true),
			"title": "Daily meeting",
			"text": "repetitive meeting",
			"icon": "sap-icon://repost",
			"type": "Type08"
		});

		oStartDate.setHours(12, 0);
		oEndDate.setHours(13, 0);

		aAppointmentDates.push({
			"start": oFormatter.format(oStartDate, true),
			"end": oFormatter.format(oEndDate, true),
			"title": "Lunch",
			"text": "out of office",
			"icon": "sap-icon://meal",
			"type": "Type06"
		});

		oStartDate.setHours(18, 0);
		oEndDate.setHours(18, 30);

		aAppointmentDates.push({
			"start": oFormatter.format(oStartDate, true),
			"end": oFormatter.format(oEndDate, true),
			"title": "Private appointment",
			"icon": "sap-icon://locked",
			"type": "Type13"
		});

		return {
			"item": aAppointmentDates
		};
	};

	SampleExtension.prototype._generateMonthData = function (oStartDate, oEndDate) {
		var oFormatter = DateFormat.getDateTimeInstance({
				pattern: "YYYY-MM-ddTHH:mm"
			}),
			oDateInDisplayedMonth = new Date(oStartDate.getFullYear(), oStartDate.getMonth(), oStartDate.getDate() + 8),
			iRandomDate = Math.floor(Math.random() * (28 - 1) + 1),
			iSecondRandomDate = Math.floor(Math.random() * (28 - 1) + 1),
			iRandomTypeNumber = Math.floor(Math.random() * (9 - 1) + 1),
			iSecondRandomTypeNumber = Math.floor(Math.random() * (20 - 10) + 10),
			oFirstSpecialDate = new Date(oDateInDisplayedMonth.getFullYear(), oDateInDisplayedMonth.getMonth(), iRandomDate, 12),
			oSecondSpecialDate = new Date(oDateInDisplayedMonth.getFullYear(), oDateInDisplayedMonth.getMonth(), iSecondRandomDate, 12),
			sDummyDate1 = oFormatter.format(oFirstSpecialDate),
			sDummyDate2 = oFormatter.format(oSecondSpecialDate);

		return {
			"specialDates": [
				{
					"start": sDummyDate1,
					"type": "Type0" + iRandomTypeNumber
				},
				{
					"start": sDummyDate2,
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