sap.ui.define(['sap/ui/core/mvc/ControllerExtension'],
	function(ControllerExtension) {
	"use strict";

	/*global oLifecycleSpy */

	return ControllerExtension.extend("testdata.customizing.customer.Sub6AnotherControllerExtension", {
		metadata: {
			methods: {
				"myCustomAction1": {"public": true, "final": false},
				"myCustomAction2": {"public": true, "final": false}
			}
		},

		overrides: {
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
			}
		},

		myCustomAction1: function() {
			//alert("myCustomAction1");
		},

		myCustomAction3: function() {
			//alert("myCustomAction3");
		}

	});

});
