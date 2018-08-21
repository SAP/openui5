sap.ui.define(['sap/ui/core/mvc/Controller','sap/ui/unified/DateRange'],
	function(Controller, DateRange) {
	"use strict";

	var CalendarCalendarTypeController = Controller.extend("sap.ui.unified.sample.CalendarCalendarType.CalendarCalendarType", {
		oFormatYyyymmdd: null,

		onInit: function() {
			this.oFormatYyyymmdd = sap.ui.core.format.DateFormat.getInstance({pattern: "yyyy-MM-dd", calendarType: sap.ui.core.CalendarType.Gregorian});
		},

		handleCalendarSelect: function(oEvent) {
			var oCalendar = oEvent.getSource();
			this._updateText(oCalendar);
		},

		_updateText: function(oCalendar) {
			var oText = this.byId("selectedDate");
			var aSelectedDates = oCalendar.getSelectedDates();
			var oDate;
			oDate = aSelectedDates[0].getStartDate();
			oText.setText(this.oFormatYyyymmdd.format(oDate));
		},

		handleFocusToday: function(oEvent) {
			var oCalendar = this.byId("calendar");
			oCalendar.focusDate(new Date());
		}
	});

	return CalendarCalendarTypeController;

});
