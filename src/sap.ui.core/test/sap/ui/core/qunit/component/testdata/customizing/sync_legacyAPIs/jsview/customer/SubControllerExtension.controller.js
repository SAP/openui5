sap.ui.define(['sap/ui/core/mvc/Controller'],
	function(/* Controller */) {
	"use strict";

	sap.ui.controller("testdata.customizing.sync_legacyAPIs.jsview.customer.SubControllerExtension", {

		customerAction: function() {
			/*eslint-disable no-alert */
			alert("This is a customer Action");
			/*eslint-ensable no-alert */
		}

	});

});
