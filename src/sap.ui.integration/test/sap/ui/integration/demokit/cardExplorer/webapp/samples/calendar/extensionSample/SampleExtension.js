sap.ui.define(["sap/ui/integration/Extension"], function (Extension) {
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

	SampleExtension.prototype._generateAppointmentsData = function (oSelectedDate) {
		var oFormatter = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "YYYY-MM-dd"
			}),
			sDummyDate = oFormatter.format(oSelectedDate);

		return {
			"item": [
				{
					"start": sDummyDate + "T07:00",
					"end":  sDummyDate + "T07:30",
					"title": "Daily meeting for " +  oSelectedDate.toDateString(),
					"text": "repetitive meeting",
					"icon": "sap-icon://repost",
					"type": "Type08"
				},
				{
					"start": sDummyDate + "T09:00",
					"end":  sDummyDate + "T10:00",
					"title": "Lunch for " +  oSelectedDate.toDateString(),
					"text": "out of office",
					"icon": "sap-icon://meal",
					"type": "Type06"
				},
				{
					"start": sDummyDate + "T16:00",
					"end":  sDummyDate + "T16:30",
					"title": "Private appointment for " +  oSelectedDate.toDateString(),
					"icon": "sap-icon://locked",
					"type": "Type13"
				}
			]
		};
	};

	SampleExtension.prototype._generateMonthData = function (oStartDate, oEndDate) {
		var oFormatter = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "YYYY-MM-dd"
			}),
			oDateInDisplayedMonth = new Date(oStartDate.getFullYear(), oStartDate.getMonth(), oStartDate.getDate() + 8),
			iRandomDate = Math.floor(Math.random() * (28 - 1) + 1),
			iSecondRandomDate = Math.floor(Math.random() * (28 - 1) + 1),
			iRandomTypeNumber = Math.floor(Math.random() * (9 - 1) + 1),
			iSecondRandomTypeNumber = Math.floor(Math.random() * (20 - 10) + 10),
			oFirstSpecialDate = new Date(oDateInDisplayedMonth.getFullYear(), oDateInDisplayedMonth.getMonth(), iRandomDate),
			oSecondSpecialDate = new Date(oDateInDisplayedMonth.getFullYear(), oDateInDisplayedMonth.getMonth(), iSecondRandomDate),
			sDummyStartDate = oFormatter.format(oFirstSpecialDate),
			sDummyEndDate = oFormatter.format(oSecondSpecialDate);

		return {
			"specialDates": [
				{
					"start": sDummyStartDate + "T12:00",
					"type": "Type0" + iRandomTypeNumber
				},
				{
					"start": sDummyEndDate + "T12:00",
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