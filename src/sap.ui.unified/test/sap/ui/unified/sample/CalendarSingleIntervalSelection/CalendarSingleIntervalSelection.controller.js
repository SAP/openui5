sap.ui.define(['sap/ui/core/mvc/Controller', 'sap/ui/unified/DateRange', 'sap/m/MessageToast', 'sap/ui/core/format/DateFormat'],
	function(Controller, DateRange, MessageToast, DateFormat) {
	"use strict";

	var CalendarType = sap.ui.core.CalendarType;

	return Controller.extend("sap.ui.unified.sample.CalendarSingleIntervalSelection.CalendarSingleIntervalSelection", {
		oFormatYyyymmdd: null,

		onInit: function() {
			this.oFormatYyyymmdd = DateFormat.getInstance({pattern: "yyyy-MM-dd", calendarType: CalendarType.Gregorian});
		},

		handleCalendarSelect: function(oEvent) {
			var oCalendar = oEvent.getSource();
			this._updateText(oCalendar.getSelectedDates()[0]);
		},

		_updateText: function(oSelectedDates) {
			var oSelectedDateFrom = this.byId("selectedDateFrom"),
				oSelectedDateTo = this.byId("selectedDateTo"),
				oDate;

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

		handleSelectThisWeek: function() {
			this._selectWeekInterval(6);
		},

		handleSelectWorkWeek: function() {
			this._selectWeekInterval(4);
		},

		handleWeekNumberSelect: function(oEvent) {
			var oDateRange = oEvent.getParameter("weekDays"),
				iWeekNumber = oEvent.getParameter("weekNumber");

			if (iWeekNumber % 5 === 0) {
				oEvent.preventDefault();
				MessageToast.show("You are not allowed to select this calendar week!");
			} else {
				this._updateText(oDateRange);
			}
		},

		_selectWeekInterval: function(iDays) {
			var oCurrent = new Date(), // get current date
				iWeekStart = oCurrent.getDate() - oCurrent.getDay() + 1,
				iWeekEnd = iWeekStart + iDays, // end day is the first day + 6
				oMonday = new Date(oCurrent.setDate(iWeekStart)),
				oSunday = new Date(oCurrent.setDate(iWeekEnd)),
				oCalendar = this.byId("calendar");

			oCalendar.removeAllSelectedDates();
			oCalendar.addSelectedDate(new DateRange({startDate: oMonday, endDate: oSunday}));

			this._updateText(oCalendar.getSelectedDates()[0]);
		}
	});

});
