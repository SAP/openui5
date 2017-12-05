sap.ui.define([
		'jquery.sap.global',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel',
		'sap/m/MessageToast'
	], function(jQuery, Controller, JSONModel, MessageToast) {
	"use strict";

	var StepInputController = Controller.extend("sap.m.sample.StepInput.StepInput", {

		onInit: function () {
			var oModel,
				aData = [
					{ label: "Step = 1 (default); value = 6, min = 5, max = 15, width = 120px", value: 6, min:5, max:15, width:"120px"},
					{ label: "Step = 1 (default); value = 6, min = 5, max = 15, width = 120px, with validation on LiveChange", value: 6, min:5, max:15, width:"120px", validationMode:"LiveChange"},
					{ label: "Step = 5, no value, no min, no max, width = 120px", step:5, width:"120px"},
					{ label: "Step = 5, no value, no min, no max, width = 120px, largerStep = 3", step:5, width:"120px", largerStep:3 },
					{ label: "Step = 1.1, no value, displayValuePrecision = 1, min = -6, max = 23.5, width = 120px", step: 1.1, min:-6, max:23.5, width:"120px", displayValuePrecision: 1},
					{ label: "Disabled, value = 12.3, displayValuePrecision = 1, width = 120px", value: 12.3, enabled:false, width:"120px", displayValuePrecision: 1},
					{ label: "Read only, value = 123, default width of 100%", editable:false, value:123},
					{ label: "Step = 0.05; value = 1.32, displayValuePrecision = 3, min = -5, max = 15", value: 1.32, step: 0.05, min:-5, max:15, displayValuePrecision: 3},
					{ label: "Step = 1.05; value = 1.5675, displayValuePrecision = 2, no Min and Max", value: 1.5675, step: 1.05, displayValuePrecision: 2},
					{ label: "Step = -1 (which becomes 1), value = 20, width = 120px", value: 20, step: -1, width:"120px"},
					{ label: "Step = 1 (default); value = 6, min = 5, max = 15, width = 240px, with added description and default fieldWidth 50%", value: 6, min:5, max:15, width:"240px", description:"EUR"},
					{ label: "Step = 1 (default); value = 160, with added description and fieldWidth set to 70%", value: 160, fieldWidth:"70%", description:"EUR"},
					{ label: "Step = 1 (default); value = 160, align:Center", value: 160, textAlign:"Center"},
					{ label: "Step = 5, stepMode = Multiple, min = -40, max = 100, value = 10,", value: 10, step: 5, max: 100, min: -40, stepMode: sap.m.StepInputStepModeType.Multiple}
				];
			oModel = new JSONModel({
				modelData: aData
			});
			this.getView().setModel(oModel);
		},

		/**
		 * Change event handler.
		 * @param {sap.ui.base.Event} oEvent the event
		 */
		onChange: function (oEvent) {
			MessageToast.show("Value changed to '" + oEvent.getParameter("value") + "'");
		}
	});

	return StepInputController;

});
