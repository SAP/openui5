sap.ui.define([
	'sap/ui/core/mvc/Controller', 'sap/ui/rta/RuntimeAuthoring'
], function(Controller, RuntimeAuthoring) {
	"use strict";

	return Controller.extend("appUnderTest.Test", {
		onPressRTA: function() {
			var oRuntimeAuthoring = new RuntimeAuthoring({
				rootControl: this.getOwnerComponent().getAggregation("rootControl"),
				stop: function() {
					oRuntimeAuthoring.destroy();
				}
			});
			oRuntimeAuthoring.start();
		}
	});
}, true);
