sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("sap.f.sample.GridListResponsiveColumnLayout.GridListResponsiveColumnLayout", {
		onInit: function () {
		},
		onSliderMoved: function (oEvent) {
			var value = oEvent.getParameter("value");
			this.byId("panelForGridList").setWidth(value + "%");
		}
	});

});

