sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel',
		'sap/ui/core/format/DateFormat',
		'sap/ui/core/date/UI5Date'
	], function(Controller, JSONModel, DateFormat, UI5Date) {
	"use strict";

	return Controller.extend("sap.ui.unified.sample.CalendarMinMax.CalendarMinMax", {
		oFormatYyyymmdd: null,

		onInit: function() {
			this.oFormatYyyymmdd = DateFormat.getInstance({style: "long"});

			var oModel = new JSONModel();
			oModel.setData({
				minDate: UI5Date.getInstance(2000, 0, 1),
				maxDate: UI5Date.getInstance(2050, 11, 31),
				disabled: [
					{start: UI5Date.getInstance(2016, 0, 4), end: UI5Date.getInstance(2016, 0, 10)},
					{start: UI5Date.getInstance(2016, 0, 15)}
				]
			});
			this.getView().setModel(oModel);

		},

		handleCalendarSelect: function(oEvent) {
			var oCalendar = oEvent.getSource(),
				oText = this.byId("selectedDate"),
				aSelectedDates = oCalendar.getSelectedDates(),
				oDate = aSelectedDates[0].getStartDate();

			oText.setText(this.oFormatYyyymmdd.format(oDate));
		},

		handleShowWeekNumbers: function(oEvent) {
			var oCalendar = this.byId('calendar'),
				bShowWeekNumbers = oEvent.getParameter("state");

			oCalendar.setShowWeekNumbers(bShowWeekNumbers);
		}

	});

});
