sap.ui.define([
	"sap/ui/core/mvc/Controller", "sap/ui/rta/api/startKeyUserAdaptation"
], function(Controller, startKeyUserAdaptation) {
	"use strict";

	return Controller.extend("appUnderTest.Test", {
		onPressRTA: function() {
			var oOwnerComponent = this.getOwnerComponent();
			startKeyUserAdaptation({
				rootControl: oOwnerComponent.getAggregation("rootControl")
			});
		}
	});
});
