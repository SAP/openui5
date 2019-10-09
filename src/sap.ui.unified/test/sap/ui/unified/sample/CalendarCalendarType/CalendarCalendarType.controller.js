sap.ui.define(['sap/ui/core/mvc/Controller','sap/ui/core/format/DateFormat'],
	function(Controller, DateFormat) {
	"use strict";

	var CalendarType = sap.ui.core.CalendarType;

	return Controller.extend("sap.ui.unified.sample.CalendarCalendarType.CalendarCalendarType", {
		oFormatYyyymmdd: null,

		onInit: function() {
			this.oFormatYyyymmdd = DateFormat.getInstance({pattern: "yyyy-MM-dd", calendarType: CalendarType.Gregorian});
		},

		handleCalendarSelect: function(oEvent) {
			var oCalendar = oEvent.getSource();
			this._updateText(oCalendar);
		},

		_updateText: function(oCalendar) {
			var oText = this.byId("selectedDate"),
				aSelectedDates = oCalendar.getSelectedDates(),
				oDate = aSelectedDates[0].getStartDate();

			oText.setText(this.oFormatYyyymmdd.format(oDate));
		},

		handleFocusToday: function() {
			var oCalendar = this.byId("calendar");
			oCalendar.focusDate(new Date());
		}
	});

});
