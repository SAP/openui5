sap.ui.define(['sap/ui/core/mvc/Controller','sap/ui/model/json/JSONModel'],
	function(Controller, JSONModel) {
	"use strict";

	var GroupController = Controller.extend("sap.m.sample.DatePicker.Group", {

		onInit: function () {
			// create model
			var oModel = new JSONModel();
			oModel.setData({
				dateValue: new Date()
			});
			this.getView().setModel(oModel);

			this.byId("DP3").setDateValue(new Date());
			this.byId("DP8").setInitialFocusedDateValue(new Date(2017, 5, 13));
			this.byId("DP6").setMinDate(new Date(2016, 0, 1));
			this.byId("DP6").setMaxDate(new Date(2016, 11, 31));
			this.byId("DP6").setDateValue(new Date(2016, 1, 16));
			this.byId("DP7").addSpecialDate(new sap.ui.unified.DateTypeRange({
				startDate: new Date(2015, 10, 5),
				endDate: new Date(2015, 10, 25),
				type: sap.ui.unified.CalendarDayType.NonWorking
			}));

			this._iEvent = 0;

			// for the data binding example do not use the change event for check but the data binding parsing events
			sap.ui.getCore().attachParseError(
					function(oEvent) {
						var oElement = oEvent.getParameter("element");

						if (oElement.setValueState) {
							oElement.setValueState(sap.ui.core.ValueState.Error);
						}
					});

			sap.ui.getCore().attachValidationSuccess(
					function(oEvent) {
						var oElement = oEvent.getParameter("element");

						if (oElement.setValueState) {
							oElement.setValueState(sap.ui.core.ValueState.None);
						}
					});
		},

		handleChange: function (oEvent) {
			var oText = this.byId("T1");
			var oDP = oEvent.oSource;
			var sValue = oEvent.getParameter("value");
			var bValid = oEvent.getParameter("valid");
			this._iEvent++;
			oText.setText("Change - Event " + this._iEvent + ": DatePicker " + oDP.getId() + ":" + sValue);

			if (bValid) {
				oDP.setValueState(sap.ui.core.ValueState.None);
			} else {
				oDP.setValueState(sap.ui.core.ValueState.Error);
			}
		}
	});

	return GroupController;

});
