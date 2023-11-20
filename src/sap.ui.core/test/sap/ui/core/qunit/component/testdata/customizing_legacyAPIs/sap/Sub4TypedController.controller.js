sap.ui.define(['sap/ui/core/mvc/Controller', 'sap/base/Log'],
	function(Controller, Log) {
	"use strict";

	return Controller.extend("testdata.customizing.sap.Sub4Typed", {

		onInit: function() {
			Log.info("Sub4Typed Controller onInit()");
		},

		onExit: function() {
			Log.info("Sub4Typed Controller onExit()");
		},

		onBeforeRendering: function() {
			Log.info("Sub4Typed Controller onBeforeRendering()");
		},

		onAfterRendering: function() {
			Log.info("Sub4Typed Controller onAfterRendering()");
		},

		originalSAPAction: function() {
			//alert("This is an original SAP Action");
		}

	});

});
