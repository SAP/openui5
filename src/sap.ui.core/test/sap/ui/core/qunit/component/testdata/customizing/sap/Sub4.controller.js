sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/mvc/Controller"
], function(Log, Controller) {
	"use strict";

	return Controller.extend("testdata.customizing.sap.Sub4", {

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
			//alert("This is an original SAP Action");
		}

	});

});
