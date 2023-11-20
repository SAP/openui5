sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/mvc/Controller"
], function(Log, Controller) {
	"use strict";

	return Controller.extend("testdata.customizing.sync_legacyAPIs.jsview.sap.Sub", {

		onInit: function() {
			Log.info("Sub Controller onInit()");
		},

		onExit: function() {
			Log.info("Sub Controller onExit()");
		},

		onBeforeRendering: function() {
			Log.info("Sub Controller onBeforeRendering()");
		},

		onAfterRendering: function() {
			Log.info("Sub Controller onAfterRendering()");
		},

		originalSAPAction: function() {
			//alert("This is an original SAP Action");
		}

	});

});
