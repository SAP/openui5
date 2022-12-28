sap.ui.define(['sap/ui/core/mvc/ControllerExtension'],
	function(ControllerExtension) {
	"use strict";

	return ControllerExtension.extend("testdata.customizing.customer.Sub4ControllerExtension", {
		metadata: {
			methods: {
				"customerAction": {"public": true, "final": false}
			}
		},

		customerAction: function() {
			/*eslint-disable no-alert */
			alert("This is a customer Action");
			/*eslint-ensable no-alert */
		}

	});

});
