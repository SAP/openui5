sap.ui.define(['sap/ui/core/mvc/Controller','sap/ui/model/json/JSONModel'],
	function(Controller, JSONModel) {
	"use strict";

	var GroupController = Controller.extend("sap.m.sample.DateTimePicker.Group", {

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
			var oDTP = oEvent.oSource;
			var sValue = oEvent.getParameter("value");
			var bValid = oEvent.getParameter("valid");
			this._iEvent++;
			oText.setText("Change - Event " + this._iEvent + ": DateTimePicker " + oDTP.getId() + ":" + sValue);

			if (bValid) {
				oDTP.setValueState(sap.ui.core.ValueState.None);
			} else {
				oDTP.setValueState(sap.ui.core.ValueState.Error);
			}
		}
	});

	return GroupController;

});
