sap.ui.define([
	'sap/ui/core/mvc/Controller'
], function(Controller) {
	"use strict";

	var LinkAccessibility = Controller.extend("sap.ui.mdc.acc.link.LinkAccessibility", {
		onInit: function() {
			this.getView().bindElement("/ProductCollection('38094020.2')");
		}
	});
	return LinkAccessibility;
});
