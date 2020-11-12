sap.ui.define(['sap/m/library',
		'sap/ui/core/mvc/Controller',
		'sap/ui/core/library',
		'sap/ui/core/Core',
		'sap/ui/model/json/JSONModel'],
	function(library, Controller, coreLibrary, Core, JSONModel) {
		"use strict";

		var ValueState = coreLibrary.ValueState;

		return Controller.extend("sap.m.sample.TimePicker.TimePicker", {

			onInit: function () {
				// create model
				var oModel = new JSONModel();
				oModel.setData({
					"maskMode": {
						"state": true
					},
					"timePickers": {
						"TP1": {
							"value": "19:15",
							"format": "HH:mm",
							"placeholder" :"Enter meeting start time"
						},
						"TP2": {
							"format": "HH:mm:ss",
							"placeholder" :"Enter meeting end time"
						},
						"TP3": {
							"format": "hh:mm a",
							"dateValue": new Date(),
							"placeholder" :"Enter daily task deadline"
						},
						"TP4": {
							"format": "hh:mm:ss a",
							"placeholder" :"Enter time"
						},
						"TP5": {
							"format": "hh:mm:ss a",
							"initialFocusedDateValue": new Date(2017, 8, 9, 10, 11, 12),
							"placeholder" :"Enter time"
						},
						"TP6": {
							"format": "HH:mm:ss",
							"support2400": true,
							"value": "23:40:50",
							"placeholder" :"Enter meeting start time"
						}
					}
				});
				this.getView().setModel(oModel);
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
				oText.setText("'change' Event #" + this._iEvent + " from TimePicker '" + oTP.getId() + "': " + sValue + (bValid ? ' (valid)' : ' (invalid)'));

				if (bValid) {
					oTP.setValueState(ValueState.None);
				} else {
					oTP.setValueState(ValueState.Error);
				}
			}

		});

	});
