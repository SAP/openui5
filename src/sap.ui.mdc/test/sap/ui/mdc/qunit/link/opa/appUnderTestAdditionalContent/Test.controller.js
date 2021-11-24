sap.ui.define([
	'sap/ui/core/mvc/Controller', 'sap/ui/rta/api/startAdaptation'
], function(Controller, startAdaptation) {
	"use strict";

	return Controller.extend("appUnderTestAdditionalContent.Test", {
		onPressRTA: function() {
			startAdaptation({
				rootControl: this.getOwnerComponent(),
				stop: function() {
					this.destroy();
				}
			});
		}
	});
});
