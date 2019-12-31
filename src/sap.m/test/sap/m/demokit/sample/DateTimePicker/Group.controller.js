sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	'sap/ui/core/library',
	"sap/ui/core/Core"
], function(Controller, JSONModel, coreLibrary, Core) {
	"use strict";

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	return Controller.extend("sap.m.sample.DateTimePicker.Group", {

		onInit: function () {
			// create model
			var oModel = new JSONModel();
			oModel.setData({
				dateValue: new Date()
			});
			this.getView().setModel(oModel);

			this.byId("DTP3").setDateValue(new Date());
			this.byId("DTP6").setInitialFocusedDateValue(new Date(2017, 5, 13, 11, 12, 13));

			this._iEvent = 0;

			// for the data binding example do not use the change event for check but the data binding parsing events
			Core.attachParseError(
				function(oEvent) {
					var oElement = oEvent.getParameter("element");

					if (oElement.setValueState) {
						oElement.setValueState(ValueState.Error);
					}
				});

			Core.attachValidationSuccess(
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
