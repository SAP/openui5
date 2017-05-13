sap.ui.define(['sap/ui/core/mvc/Controller'],
	function(/* Controller */) {
	"use strict";

	sap.ui.controller("testdata.customizing.customer.Sub4ControllerExtension", {

		customerAction: function() {
			/*eslint-disable no-alert */
			alert("This is a customer Action");
			/*eslint-ensable no-alert */
		}

	});

});
