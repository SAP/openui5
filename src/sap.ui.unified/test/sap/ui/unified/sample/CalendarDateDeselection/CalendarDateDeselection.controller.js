sap.ui.define(['sap/ui/core/mvc/Controller','sap/ui/unified/DateRange'],
	function(Controller, DateRange) {
	"use strict";

	var CalendarDateDeselectionController = Controller.extend("sap.ui.unified.sample.CalendarDateDeselection.CalendarDateDeselection", {
		oFormatYyyymmdd: null,

		onInit: function() {
			this.oFormatYyyymmdd = sap.ui.core.format.DateFormat.getInstance({pattern: "yyyy-MM-dd", calendarType: sap.ui.core.CalendarType.Gregorian});
		},

		handleCalendarSelect: function(oEvent) {
			var oCalendar = oEvent.oSource,
				oSelectedDate = oCalendar.getSelectedDates()[0],
				oStartDate = oSelectedDate.getStartDate();
			if (this.oLastSelectedJSDate && oStartDate.getTime() === this.oLastSelectedJSDate.getTime()) {
				oCalendar.removeSelectedDate(oSelectedDate);
				this.oLastSelectedJSDate = null;
			} else {
				this.oLastSelectedJSDate = oStartDate;
			}
			this._updateText(oCalendar);
		},

		_updateText: function(oCalendar) {
			var oText = this.byId("selectedDate"),
				aSelectedDates = oCalendar.getSelectedDates(),
				oDate;
			if (aSelectedDates.length > 0 ) {
				oDate = aSelectedDates[0].getStartDate();
				oText.setText(this.oFormatYyyymmdd.format(oDate));
			} else {
				oText.setText("No Date Selected");
			}
		}
	});

	return CalendarDateDeselectionController;

});