sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("sap.f.sample.FlexibleColumnLayoutLandmarkInfoArrow.controller.Detail", {
		onInit: function () {
			this.bus = this.getOwnerComponent().getEventBus();
		},
		handleNavigateToFirstColumn: function () {
			this.bus.publish("flexible", "setListPage");
		},
		handleNavigateToLastColumn: function () {
			this.bus.publish("flexible", "setDetailDetailPage");
		}
	});
});
