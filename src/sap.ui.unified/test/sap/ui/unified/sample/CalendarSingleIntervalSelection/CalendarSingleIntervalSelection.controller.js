sap.ui.define(['sap/ui/core/mvc/Controller','sap/ui/unified/DateRange', 'sap/m/MessageToast'],
	function(Controller, DateRange, MessageToast) {
	"use strict";

	var CalendarSingleIntervalSelectionController = Controller.extend("sap.ui.unified.sample.CalendarSingleIntervalSelection.CalendarSingleIntervalSelection", {
		oFormatYyyymmdd: null,

		onInit: function() {
			this.oFormatYyyymmdd = sap.ui.core.format.DateFormat.getInstance({pattern: "yyyy-MM-dd", calendarType: sap.ui.core.CalendarType.Gregorian});
		},

		handleCalendarSelect: function(oEvent) {
			var oCalendar = oEvent.getSource();
			this._updateText(oCalendar.getSelectedDates()[0]);
		},

		_updateText: function(oSelectedDates) {
			var oSelectedDateFrom = this.byId("selectedDateFrom");
			var oSelectedDateTo = this.byId("selectedDateTo");
			var oDate;
			if (oSelectedDates) {
				oDate = oSelectedDates.getStartDate();
				if (oDate) {
					oSelectedDateFrom.setText(this.oFormatYyyymmdd.format(oDate));
				} else {
					oSelectedDateTo.setText("No Date Selected");
				}
				oDate = oSelectedDates.getEndDate();
				if (oDate) {
					oSelectedDateTo.setText(this.oFormatYyyymmdd.format(oDate));
				} else {
					oSelectedDateTo.setText("No Date Selected");
				}
			} else {
				oSelectedDateFrom.setText("No Date Selected");
				oSelectedDateTo.setText("No Date Selected");
			}
		},

		handleSelectThisWeek: function(oEvent) {
			this._selectWeekInterval(6);
		},

		handleSelectWorkWeek: function(oEvent) {
			this._selectWeekInterval(4);
		},

		handleWeekNumberSelect: function(oEvent) {
			var oDateRange = oEvent.getParameter("weekDays");
			var iWeekNumber = oEvent.getParameter("weekNumber");

			if (iWeekNumber % 5 === 0) {
				oEvent.preventDefault();
				MessageToast.show("You are not allowed to select this calendar week!");
			} else {
				this._updateText(oDateRange);
			}
		},

		_selectWeekInterval: function(iDays) {
			var oCurrent = new Date();     // get current date
			var iWeekstart = oCurrent.getDate() - oCurrent.getDay() + 1;
			var iWeekend = iWeekstart + iDays;       // end day is the first day + 6
			var oMonday = new Date(oCurrent.setDate(iWeekstart));
			var oSunday = new Date(oCurrent.setDate(iWeekend));

			var oCalendar = this.byId("calendar");

			oCalendar.removeAllSelectedDates();
			oCalendar.addSelectedDate(new DateRange({startDate: oMonday, endDate: oSunday}));

			this._updateText(oCalendar.getSelectedDates()[0]);
		}
	});

	return CalendarSingleIntervalSelectionController;

});
