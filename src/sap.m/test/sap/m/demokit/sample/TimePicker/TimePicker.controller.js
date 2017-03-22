sap.ui.define(['sap/ui/core/mvc/Controller','sap/ui/model/json/JSONModel'],
	function(Controller, JSONModel) {
		"use strict";

		var TPController = Controller.extend("sap.m.sample.TimePicker.TimePicker", {

			onInit: function () {
				// create model
				var oModel = new JSONModel();
				oModel.setData({
					dateValue: new Date()
				});
				this.getView().setModel(oModel);

				this.byId("TP3").setDateValue(new Date());

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
				var oTP = oEvent.oSource;
				var sValue = oEvent.getParameter("value");
				var bValid = oEvent.getParameter("valid");
				this._iEvent++;
				oText.setText("Change - Event " + this._iEvent + ": TimePicker " + oTP.getId() + ":" + sValue);

				if (bValid) {
					oTP.setValueState(sap.ui.core.ValueState.None);
				} else {
					oTP.setValueState(sap.ui.core.ValueState.Error);
				}
			}
		});

		return TPController;

	});
