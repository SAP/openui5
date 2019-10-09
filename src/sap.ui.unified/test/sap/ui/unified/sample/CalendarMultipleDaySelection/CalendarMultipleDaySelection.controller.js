sap.ui.define(['sap/ui/core/mvc/Controller', 'sap/ui/model/json/JSONModel', 'sap/ui/core/format/DateFormat'],
	function(Controller, JSONModel, DateFormat) {
	"use strict";

	var CalendarType = sap.ui.core.CalendarType;

	return Controller.extend("sap.ui.unified.sample.CalendarMultipleDaySelection.CalendarMultipleDaySelection", {
		oFormatYyyymmdd: null,
		oModel: null,

		onInit: function() {
			this.oFormatYyyymmdd = DateFormat.getInstance({pattern: "yyyy-MM-dd", calendarType: CalendarType.Gregorian});

			this.oModel = new JSONModel({selectedDates:[]});
			this.getView().setModel(this.oModel);
		},

		handleCalendarSelect: function(oEvent) {
			var oCalendar = oEvent.getSource(),
				aSelectedDates = oCalendar.getSelectedDates(),
				oData = {
					selectedDates: []
				},
				oDate,
				i;
			if (aSelectedDates.length > 0 ) {
				for (i = 0; i < aSelectedDates.length; i++){
					oDate = aSelectedDates[i].getStartDate();
					oData.selectedDates.push({Date:this.oFormatYyyymmdd.format(oDate)});
				}
				this.oModel.setData(oData);
			} else {
				this._clearModel();
			}
		},

		handleRemoveSelection: function() {
			this.byId("calendar").removeAllSelectedDates();
			this._clearModel();
		},

		_clearModel: function() {
			var oData = {selectedDates:[]};
			this.oModel.setData(oData);
		}
	});

});
