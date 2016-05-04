sap.ui.define([
		'jquery.sap.global',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(jQuery, Controller, JSONModel) {
	"use strict";

	var StepInputController = Controller.extend("sap.m.sample.StepInput.StepInput", {

		onInit: function () {
			var aData = [
				{ label: "Step = 1 (default); value = 6, min = 5, max = 15, width = 120px", value: 6, min:5, max:15, width:"120px"},
				{ label: "Step = 5, no value, no min, no max, width = 120px", step:5, width:"120px"},
				{ label: "Step = 5, no value, no min, no max, width = 120px, largerStep = 3", step:5, width:"120px", largerStep:3 },
				{ label: "Step = 1.1, no value, min = -6, max = 23.5, width = 120px", step: 1.1, min:-6, max:23.5, width:"120px" },
				{ label: "Disabled, value = 12.3, width = 120px", value: 12.3, enabled:false, width:"120px"},
				{ label: "Display only, value = 123, default width of 100%", editable:false, value:123}
			];

			var oModel = new sap.ui.model.json.JSONModel({
				modelData: aData
			});
			this.getView().setModel(oModel);
		}
	});

	return StepInputController;

});
