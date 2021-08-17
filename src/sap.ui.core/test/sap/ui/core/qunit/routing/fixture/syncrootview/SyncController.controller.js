sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("test.routing.target.SyncController", {
		onInit: function() {
			var oComponent = this.getOwnerComponent();
			var oRouter = oComponent.getRouter();

			oRouter.initialize();
		}
	});
});
