
sap.ui.define([
	'sap/ui/core/mvc/Controller'
], function(Controller) {
	"use strict";
	return Controller.extend("view.Main", {
		onPressRTA: function() {
			var oOwnerComponent = this.getOwnerComponent();
			sap.ui.getCore().loadLibrary("sap/ui/rta", { async: true }).then(function () {
				sap.ui.require(["sap/ui/rta/api/startKeyUserAdaptation"], function (startKeyUserAdaptation) {
					startKeyUserAdaptation({
						rootControl: oOwnerComponent.getAggregation("rootControl")
					});
				});
			});
		}
	});
});
