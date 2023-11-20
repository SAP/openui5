sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function(Controller, JSONModel) {
	"use strict";

	/*global aLifeCycleCalls, standardSub2ControllerCalled */

	return Controller.extend("testdata.customizing.sap.Sub2", {

		onInit: function() {
			aLifeCycleCalls.push("Sub2 Controller onInit()");


			// create some dummy JSON data
			var data = {names:[
				{name: "Anton"},
				{name: "Karl"},
				{name: "Hermann"}
			]};

			// create a Model and assign it to the View
			var oModel = new JSONModel();
			oModel.setData(data);
			this.getView().setModel(oModel);
		},

		onExit: function() {
			aLifeCycleCalls.push("Sub2 Controller onExit()");
		},

		onBeforeRendering: function() {
			aLifeCycleCalls.push("Sub2 Controller onBeforeRendering()");
		},

		onAfterRendering: function() {
			aLifeCycleCalls.push("Sub2 Controller onAfterRendering()");
		},


		originalSAPAction: function() {
			standardSub2ControllerCalled();
			return "ori";
		}

	});
});
