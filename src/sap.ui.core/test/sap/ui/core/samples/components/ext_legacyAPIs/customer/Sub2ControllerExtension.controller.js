sap.ui.define([
	"sap/base/Log",
	"sap/m/MessageToast",
	"sap/ui/core/mvc/Controller"
], function(Log, MessageToast/*, Controller*/) {
	"use strict";

	sap.ui.controller("samples.components.ext_legacyAPIs.customer.Sub2ControllerExtension", {

		onInit: function() {
			Log.info("Sub2ControllerExtension Controller onInit()");
		},

		onExit: function() {
			Log.info("Sub2ControllerExtension Controller onExit()");
		},

		onBeforeRendering: function() {
			Log.info("Sub2ControllerExtension Controller onBeforeRendering()");
		},

		onAfterRendering: function() {
			Log.info("Sub2ControllerExtension Controller onAfterRendering()");
		},


		customerAction: function() {
			MessageToast.show("This is a customer Action");
		}

	});

});
