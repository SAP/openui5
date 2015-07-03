sap.ui.define(['sap/ui/core/mvc/Controller'],
	function(/* Controller */) {
	"use strict";

	return sap.ui.controller("testdata.customizing.customersub.Sub2SubControllerExtension", {
	
		onInit: function() {
			aLifeCycleCalls.push("Sub2SubControllerExtension Controller onInit()");
		},
	
		onExit: function() {
			aLifeCycleCalls.push("Sub2SubControllerExtension Controller onExit()");
		},
	
		onBeforeRendering: function() {
			aLifeCycleCalls.push("Sub2SubControllerExtension Controller onBeforeRendering()");
		},
	
		onAfterRendering: function() {
			aLifeCycleCalls.push("Sub2SubControllerExtension Controller onAfterRendering()");
		},
	
	
		originalSAPAction: function() {
			standardSub2ControllerCalled();
			return "ext";
		},
	
		customerAction: function() {
			customSub2ControllerCalled();
		},
	
		customerSubAction: function() {
			customSub2ControllerCalled();
		}
	
	});

});
