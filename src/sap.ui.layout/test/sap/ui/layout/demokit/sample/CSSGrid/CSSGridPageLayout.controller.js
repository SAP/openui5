sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("sap.ui.layout.sample.CSSGrid.CSSGridPageLayout", {

		onSliderMoved: function (oEvent) {
			var fValue = oEvent.getParameter("value");
			this.byId("gridLayout").setWidth(fValue + "%");
		}

	});
});