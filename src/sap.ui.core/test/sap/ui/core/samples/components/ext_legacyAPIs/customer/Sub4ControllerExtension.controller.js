sap.ui.define([
	"sap/m/MessageToast",
	"sap/ui/core/mvc/Controller"
], function(MessageToast /*, Controller */) {
	"use strict";

	sap.ui.controller("samples.components.ext_legacyAPIs.customer.Sub4ControllerExtension", {

		customerAction: function() {
			MessageToast.show("This is a customer Action");
		}

	});

});
