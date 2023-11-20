sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("sap.m.sample.CarouselEmptyMessages.C", {
		onResizeCarouselContainer: function (oEvent) {
			var	iValue = oEvent.getParameter("value"),
				oCarouselContainer = this.byId("carouselEmpty");

			oCarouselContainer.setWidth(iValue + "%");
		}
	});
});