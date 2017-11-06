sap.ui.define(['sap/ui/core/mvc/Controller','sap/ui/model/json/JSONModel'],
	function(Controller, JSONModel) {
	"use strict";

	var CalendarMinMaxController = Controller.extend("sap.ui.unified.sample.CalendarMinMax.CalendarMinMax", {
		oFormatYyyymmdd: null,

		onInit: function() {
			this.oFormatYyyymmdd = sap.ui.core.format.DateFormat.getInstance({style: "long"});

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
			var oCalendar = oEvent.oSource;
			var oText = this.byId("selectedDate");
			var aSelectedDates = oCalendar.getSelectedDates();
			var oDate;
			if (aSelectedDates.length > 0 ) {
				oDate = aSelectedDates[0].getStartDate();
				oText.setText(this.oFormatYyyymmdd.format(oDate));
			} else {
				oText.setValue("No Date Selected");
			}
		},

		handleShowWeekNumbers: function(oEvent) {
			var oCalendar = this.byId('calendar');
			var bShowWeekNumbers = oEvent.getParameter("state");

			oCalendar.setShowWeekNumbers(bShowWeekNumbers);
		}

	});

	return CalendarMinMaxController;

});
