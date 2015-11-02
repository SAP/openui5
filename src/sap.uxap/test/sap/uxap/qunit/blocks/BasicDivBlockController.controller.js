sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
	"use strict";
	return Controller.extend("sap.uxap.testblocks.BasicDivBlockController", {
		onAfterRendering: function () {
			var oDomRef = this.getView().$();
			if (oDomRef) {
				var htmlElements = oDomRef.children('div');
				if (htmlElements.length > 0) {
					var divElement = htmlElements.first();
					divElement.css('height', this.oParentBlock.getHeight());
					divElement.css('background-color', this.oParentBlock.getBackgroundColor());
				}
			}
		}
	});
}, true);
