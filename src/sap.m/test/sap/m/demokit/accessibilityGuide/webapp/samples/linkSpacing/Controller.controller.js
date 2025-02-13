sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast"
], function(Controller, MessageToast) {
	"use strict";

	return Controller.extend("sap.m.sample.linkSpacing.Controller", {
		onObjectIdentifierPress: function () {
			MessageToast.show("Object Identifier Pressed");
		},
		onLinkPress: function () {
			MessageToast.show("Link Pressed");
		},
		onObjectStatusPress: function () {
			MessageToast.show("Object Status Pressed");
		},
		onObjectNumberPress: function () {
			MessageToast.show("Object Number Pressed");
		}
	});
});
