sap.ui.define(['sap/ui/core/mvc/Controller'],
	function(/* Controller */) {
	"use strict";

	/*global oLifecycleSpy */

	sap.ui.controller("testdata.customizing.customer.Sub6AnotherControllerExtension", {

		onInit: function() {
			oLifecycleSpy("Sub6AnotherControllerExtension Controller onInit()");
		},

		onExit: function() {
			oLifecycleSpy("Sub6AnotherControllerExtension Controller onExit()");
		},

		onBeforeRendering: function() {
			oLifecycleSpy("Sub6AnotherControllerExtension Controller onBeforeRendering()");
		},

		onAfterRendering: function() {
			oLifecycleSpy("Sub6AnotherControllerExtension Controller onAfterRendering()");
		},


		myCustomAction1: function() {
			//alert("myCustomAction1");
		},

		myCustomAction3: function() {
			//alert("myCustomAction3");
		}

	});

});
