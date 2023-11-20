sap.ui.define(['sap/ui/core/mvc/ControllerExtension'],
	function(ControllerExtension) {
	"use strict";

	/*global aLifeCycleCalls, standardSub2ControllerCalled,customSub2ControllerCalled */

	return ControllerExtension.extend("testdata.customizing.customersub.Sub2SubControllerExtension", {
		metadata: {
			methods: {
				"customerAction": {"public": true, "final": false},
				"customerSubAction": {"public": true, "final": false}
			}
		},

		overrides: {

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
			}

		},

		customerAction: function() {
			customSub2ControllerCalled();
		},

		customerSubAction: function() {
			customSub2ControllerCalled();
		}

	});

});
