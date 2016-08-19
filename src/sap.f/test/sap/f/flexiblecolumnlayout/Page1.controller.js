sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/Controller"
], function (JSONModel, Controller) {
	"use strict";

	return Controller.extend("flexibleColumnLayout.Page1", {
		onInit: function () {
			this.bus = sap.ui.getCore().getEventBus();
		},
		handleNextPress: function () {
			this.bus.publish("flexible", "navigate", {pageName: "fcl"});
		}
	});
}, true);
