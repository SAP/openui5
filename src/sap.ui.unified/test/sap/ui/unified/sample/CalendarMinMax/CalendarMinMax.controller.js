sap.ui.define(['sap/ui/core/mvc/Controller', 'sap/ui/model/json/JSONModel', 'sap/ui/core/format/DateFormat'],
	function(Controller, JSONModel, DateFormat) {
	"use strict";

	return Controller.extend("sap.ui.unified.sample.CalendarMinMax.CalendarMinMax", {
		oFormatYyyymmdd: null,

		onInit: function() {
			this.oFormatYyyymmdd = DateFormat.getInstance({style: "long"});

			var oModel = new JSONModel();
			oModel.setData({
				minDate: new Date(2000, 0, 1),
				maxDate: new Date(2050, 11, 31),
				disabled: [{start: new Date(2016, 0, 4), end: new Date(2016, 0, 10)},
						   {start: new Date(2016, 0, 15)}
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
