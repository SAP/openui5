sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast"
], function(Log, Controller, MessageToast) {
	"use strict";

	var Sub4Controller = Controller.extend("samples.components.ext_legacyAPIs.sap.Sub4", {

		onInit: function() {
			Log.info("Sub4 Controller onInit()");
		},

		onExit: function() {
			Log.info("Sub4 Controller onExit()");
		},

		onBeforeRendering: function() {
			Log.info("Sub4 Controller onBeforeRendering()");
		},

		onAfterRendering: function() {
			Log.info("Sub4 Controller onAfterRendering()");
		},


		originalSAPAction: function() {
			MessageToast.show("This is an original SAP Action");
		}

	});

	return Sub4Controller;

});
