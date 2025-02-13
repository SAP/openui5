sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast"
], function(Controller, MessageToast) {
	"use strict";

	return Controller.extend("sap.m.sample.overlayLink.Controller", {
		onObjectIdentifierPress: function () {
			MessageToast.show("Object Identifier Pressed");
		}
	});
});