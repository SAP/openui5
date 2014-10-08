sap.ui.controller("sap.ui.unified.sample.CalendarMultipleDaySelection.CalendarMultipleDaySelection", {
	oFormatYyyymmdd: null,
	oModel: null,

	onInit: function() {
		this.oFormatYyyymmdd = sap.ui.core.format.DateFormat.getInstance({pattern: "yyyy-MM-dd"});

		this.oModel = new sap.ui.model.json.JSONModel({selectedDates:[]});
		this.getView().setModel(this.oModel);
	},

	handleCalendarSelect: function(oEvent) {
		var oCalendar = oEvent.oSource;
		var aSelectedDates = oCalendar.getSelectedDates();
		var oDate;
		var oData = {selectedDates:[]};
		if (aSelectedDates.length > 0 ) {
			for(var i=0; i<aSelectedDates.length; i++){
				oDate = aSelectedDates[i].getStartDate();
				oData.selectedDates.push({Date:this.oFormatYyyymmdd.format(oDate)});
			}
			this.oModel.setData(oData);
		} else {
			this._clearModel();
		}
	},

	handleRemoveSelection: function(oEvent) {
		this.getView().byId("calendar").removeAllSelectedDates();
		this._clearModel();
	},

	_clearModel: function() {
		var oData = {selectedDates:[]};
		this.oModel.setData(oData);
	}
});