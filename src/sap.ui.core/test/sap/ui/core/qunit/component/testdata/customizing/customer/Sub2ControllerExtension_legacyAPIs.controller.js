sap.ui.define(['sap/ui/core/mvc/Controller'],
	function(/* Controller */) {
	"use strict";

	/*global aLifeCycleCalls, standardSub2ControllerCalled, customSub2ControllerCalled */

	return sap.ui.controller("testdata.customizing.customer.Sub2ControllerExtension_legacyAPIs", {

		onInit: function() {
			aLifeCycleCalls.push("Sub2ControllerExtension_legacyAPIs Controller onInit()");
		},

		onExit: function() {
			aLifeCycleCalls.push("Sub2ControllerExtension_legacyAPIs Controller onExit()");
		},

		onBeforeRendering: function() {
			aLifeCycleCalls.push("Sub2ControllerExtension_legacyAPIs Controller onBeforeRendering()");
		},

		onAfterRendering: function() {
			aLifeCycleCalls.push("Sub2ControllerExtension_legacyAPIs Controller onAfterRendering()");
		},


		originalSAPAction: function() {
			standardSub2ControllerCalled();
			return "ext";
		},

		customerAction: function() {
			customSub2ControllerCalled();
		},

		isExtended: true

	});

});
