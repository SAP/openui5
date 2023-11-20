sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/mvc/Controller"
], function(Log, Controller) {
	"use strict";

	/*global oLifecycleSpy */

	return Controller.extend("testdata.customizing.sap.Sub6", {

		onInit: function() {
			Log.info("Sub6 Controller onInit()");
			oLifecycleSpy("Sub6 Controller onInit()");
		},

		onExit: function() {
			Log.info("Sub6 Controller onExit()");
			oLifecycleSpy("Sub6 Controller onExit()");
		},

		onBeforeRendering: function() {
			Log.info("Sub6 Controller onBeforeRendering()");
			oLifecycleSpy("Sub6 Controller onBeforeRendering()");
		},

		onAfterRendering: function() {
			Log.info("Sub6 Controller onAfterRendering()");
			oLifecycleSpy("Sub6 Controller onAfterRendering()");
		},

		originalSAPAction: function() {
			//alert("This is an original SAP Action");
		}

	});

});
