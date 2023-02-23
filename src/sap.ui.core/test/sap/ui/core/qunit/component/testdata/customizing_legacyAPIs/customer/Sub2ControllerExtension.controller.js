sap.ui.define(['sap/ui/core/mvc/ControllerExtension'],
	function(ControllerExtension) {
	"use strict";

	/*global aLifeCycleCalls, standardSub2ControllerCalled, customSub2ControllerCalled */

	return ControllerExtension.extend("testdata.customizing.customer.Sub2ControllerExtension", {
		metadata: {
			methods: {
				"customerAction": {"public": true, "final": false}
			}
		},
		customerAction: function() {
			customSub2ControllerCalled();
		},
		overrides: {
			onInit: function() {
				aLifeCycleCalls.push("Sub2ControllerExtension Controller onInit()");
			},

			onExit: function() {
				aLifeCycleCalls.push("Sub2ControllerExtension Controller onExit()");
			},

			onBeforeRendering: function() {
				aLifeCycleCalls.push("Sub2ControllerExtension Controller onBeforeRendering()");
			},

			onAfterRendering: function() {
				aLifeCycleCalls.push("Sub2ControllerExtension Controller onAfterRendering()");
			},

			originalSAPAction: function() {
				standardSub2ControllerCalled();
				return "ext";
			}
		}

	});

});
