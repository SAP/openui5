sap.ui.define(['sap/ui/core/mvc/ControllerExtension'],
	function(ControllerExtension) {
	"use strict";

	/*global oLifecycleSpy */

	return ControllerExtension.extend("testdata.customizing.customer.Sub6InstanceSpecificControllerExtension", {
		metadata: {
			methods: {
				"mySpecificAction": {"public": true, "final": false}
			}
		},

		overrides: {
			onInit: function() {
				oLifecycleSpy("Sub6InstanceSpecificControllerExtension Controller onInit()");
			},

			onExit: function() {
				oLifecycleSpy("Sub6InstanceSpecificControllerExtension Controller onExit()");
			},

			onBeforeRendering: function() {
				oLifecycleSpy("Sub6InstanceSpecificControllerExtension Controller onBeforeRendering()");
			},

			onAfterRendering: function() {
				oLifecycleSpy("Sub6InstanceSpecificControllerExtension Controller onAfterRendering()");
			}
		},

		mySpecificAction: function() {
			// should be there
		}

	});

});
