sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/integration/ActionDefinition"
], function (Controller, ActionDefinition) {
	"use strict";

	return Controller.extend("sap.f.cardsdemo.controller.DefaultHeader", {
		onInit: function () {
			var oCard5 = this.getView().byId("card5");

			oCard5.attachManifestReady(function () {
				oCard5.addActionDefinition(new ActionDefinition({
					type: "Custom",
					text: "Button"
				}));
			});
		}
	});
});
