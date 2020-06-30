sap.ui.define([
	'sap/ui/core/mvc/Controller', 'sap/ui/rta/RuntimeAuthoring'
], function(Controller, RuntimeAuthoring) {
	"use strict";

	var LinkAccessibility = Controller.extend("sap.ui.mdc.acc.link.LinkAccessibility", {
		onInit: function() {
			this.getView().bindElement("/ProductCollection('38094020.2')");
		},
		onPressRTA: function() {
			var oRuntimeAuthoring = new RuntimeAuthoring({
				rootControl: this.getOwnerComponent().getAggregation("rootControl"),
				flexSettings: {
					developerMode: false
				},
				stop: function() {
					oRuntimeAuthoring.destroy();
				}
			});
			oRuntimeAuthoring.start();
		}
	});
	return LinkAccessibility;
});
