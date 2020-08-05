sap.ui.define(['sap/m/library',
		'sap/ui/core/mvc/Controller',
		'sap/ui/core/library',
		'sap/ui/core/Core',
		'sap/ui/model/json/JSONModel'],
	function(library, Controller, coreLibrary, Core, JSONModel) {
		"use strict";

		var TimePickerMaskMode = library.TimePickerMaskMode,
			ValueState = coreLibrary.ValueState;

		return Controller.extend("sap.m.sample.TimePicker.TimePicker", {

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
				var oText = this.byId("T1"),
					oTP = oEvent.getSource(),
					sValue = oEvent.getParameter("value"),
					bValid = oEvent.getParameter("valid");
				this._iEvent++;
				oText.setText("Change - Event " + this._iEvent + ": TimePicker " + oTP.getId() + ":" + sValue);

				if (bValid) {
					oTP.setValueState(ValueState.None);
				} else {
					oTP.setValueState(ValueState.Error);
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

	});
