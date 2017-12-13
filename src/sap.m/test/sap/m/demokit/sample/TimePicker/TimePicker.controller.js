sap.ui.define(['sap/m/library','sap/ui/core/mvc/Controller','sap/ui/model/json/JSONModel'],
	function(library, Controller, JSONModel) {
		"use strict";

		var TimePickerMaskMode = library.TimePickerMaskMode,
			TPController = Controller.extend("sap.m.sample.TimePicker.TimePicker", {

			onInit: function () {
				// create model
				var oModel = new JSONModel();
				oModel.setData({
					dateValue: new Date()
				});
				this.getView().setModel(oModel);

				this.byId("TP3").setDateValue(new Date());
				this.byId("TP5").setInitialFocusedDateValue(new Date(2017, 8, 9, 10, 11, 12));

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
			},

			handleChangeMaskMode: function (oEvent) {
				var sMaskMode = oEvent.getParameter("state") ? TimePickerMaskMode.On : TimePickerMaskMode.Off;

				this.byId("TP1").setMaskMode(sMaskMode);
				this.byId("TP2").setMaskMode(sMaskMode);
				this.byId("TP3").setMaskMode(sMaskMode);
				this.byId("TP4").setMaskMode(sMaskMode);
				this.byId("TP5").setMaskMode(sMaskMode);
			}
		});

		return TPController;

	});
