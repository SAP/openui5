sap.ui.controller("sap.ui.unified.sample.CalendarMultipleMonth.CalendarMultipleMonth", {
	oFormatYyyymmdd: null,

	onInit: function() {
		this.oFormatYyyymmdd = sap.ui.core.format.DateFormat.getInstance({pattern: "yyyy-MM-dd"});
	},

	handleCalendarSelect: function(oEvent) {
		var oCalendar = oEvent.oSource;
		this._updateText(oCalendar);
	},

	_updateText: function(oCalendar) {
		oText = this.getView().byId("selectedDate");
		var aSelectedDates = oCalendar.getSelectedDates();
		var oDate;
		if (aSelectedDates.length > 0 ) {
			oDate = aSelectedDates[0].getStartDate();
			oText.setText(this.oFormatYyyymmdd.format(oDate));
		} else {
			oText.setValue("No Date Selected");
		}
	},

	handleSelectToday: function(oEvent) {
		var oCalendar = this.getView().byId("calendar");
		oCalendar.removeAllSelectedDates();
		oCalendar.addSelectedDate(new sap.ui.unified.DateRange({startDate: new Date()}));
		this._updateText(oCalendar);
	}
});