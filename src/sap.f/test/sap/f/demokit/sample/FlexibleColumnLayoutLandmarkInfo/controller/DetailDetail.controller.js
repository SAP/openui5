sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("sap.f.sample.FlexibleColumnLayoutLandmarkInfo.controller.DetailDetail", {
		onInit: function () {
			this.bus = this.getOwnerComponent().getEventBus();
		},
		handleNavigateToMidColumnPress: function () {
			this.bus.publish("flexible", "setDetailPage");
		}
	});
});
