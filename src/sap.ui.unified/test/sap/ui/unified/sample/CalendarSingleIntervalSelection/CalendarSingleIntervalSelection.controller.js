sap.ui.define(['sap/ui/core/mvc/Controller','sap/ui/unified/DateRange'],
	function(Controller, DateRange) {
	"use strict";

	var CalendarSingleIntervalSelectionController = Controller.extend("sap.ui.unified.sample.CalendarSingleIntervalSelection.CalendarSingleIntervalSelection", {
		oFormatYyyymmdd: null,

		onInit: function() {
			this.oFormatYyyymmdd = sap.ui.core.format.DateFormat.getInstance({pattern: "yyyy-MM-dd", calendarType: sap.ui.core.CalendarType.Gregorian});
		},

		handleCalendarSelect: function(oEvent) {
			var oCalendar = oEvent.oSource;
			this._updateText(oCalendar);
		},

		_updateText: function(oCalendar) {
			var oSelectedDateFrom = this.byId("selectedDateFrom");
			var oSelectedDateTo = this.byId("selectedDateTo");
			var aSelectedDates = oCalendar.getSelectedDates();
			var oDate;
			if (aSelectedDates.length > 0 ) {
				oDate = aSelectedDates[0].getStartDate();
				if (oDate) {
					oSelectedDateFrom.setText(this.oFormatYyyymmdd.format(oDate));
				} else {
					oSelectedDateTo.setText("No Date Selected");
				}
				oDate = aSelectedDates[0].getEndDate();
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

		_selectWeekInterval: function(iDays) {
			var oCurrent = new Date();     // get current date
			var iWeekstart = oCurrent.getDate() - oCurrent.getDay() + 1;
			var iWeekend = iWeekstart + iDays;       // end day is the first day + 6
			var oMonday = new Date(oCurrent.setDate(iWeekstart));
			var oSunday = new Date(oCurrent.setDate(iWeekend));

			var oCalendar = this.byId("calendar");

			oCalendar.removeAllSelectedDates();
			oCalendar.addSelectedDate(new DateRange({startDate: oMonday, endDate: oSunday}));

			this._updateText(oCalendar);
		}
	});

	return CalendarSingleIntervalSelectionController;

});
