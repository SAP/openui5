sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	'sap/ui/core/library',
	'sap/ui/core/date/UI5Date'
], function(Controller, JSONModel, coreLibrary, UI5Date) {
	"use strict";

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	return Controller.extend("sap.m.sample.DateTimePicker.Group", {

		onInit: function () {
			// create model
			var oModel = new JSONModel();
			oModel.setData({
				valueDTP2: UI5Date.getInstance(2016, 1, 18, 10, 32, 30),
				valueDTP3: UI5Date.getInstance(),
				valueDTP4: UI5Date.getInstance(2016, 1, 18, 10, 32, 30),
				valueDTP5: UI5Date.getInstance(),
				valueDTP8: UI5Date.getInstance(2016, 1, 18, 10, 32, 30),
				valueDTP9: UI5Date.getInstance(),
				valueDTP10: UI5Date.getInstance(2023, 2, 31, 10, 32, 30),
				valueDTP11: null,
				timezoneDTP10: "Australia/Sydney",
				timezoneDTP11: "Asia/Tokyo"
			});
			this.getView().setModel(oModel);
			this.byId("DTP6").setInitialFocusedDateValue(UI5Date.getInstance(2017, 5, 13, 11, 12, 13));

			this._iEvent = 0;

			// for the data binding example do not use the change event for check but the data binding parsing events
			this.getView().attachParseError(
				function(oEvent) {
					var oElement = oEvent.getParameter("element");

					if (oElement.setValueState) {
						oElement.setValueState(ValueState.Error);
					}
				});

			this.getView().attachValidationSuccess(
				function(oEvent) {
					var oElement = oEvent.getParameter("element");

					if (oElement.setValueState) {
						oElement.setValueState(ValueState.None);
					}
				});
		},

		handleChange: function (oEvent) {
			var oText = this.byId("textResult"),
				oDTP = oEvent.getSource(),
				sValue = oEvent.getParameter("value"),
				bValid = oEvent.getParameter("valid");

			this._iEvent++;
			oText.setText("Change - Event " + this._iEvent + ": DateTimePicker " + oDTP.getId() + ":" + sValue);

			if (bValid) {
				oDTP.setValueState(ValueState.None);
			} else {
				oDTP.setValueState(ValueState.Error);
			}
		}
	});

});
