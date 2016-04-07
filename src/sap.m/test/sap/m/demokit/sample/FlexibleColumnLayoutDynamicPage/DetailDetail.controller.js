sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast"
], function (JSONModel, Controller, MessageToast) {
	"use strict";

	return Controller.extend("sap.m.sample.FlexibleColumnLayoutDynamicPage.DetailDetail", {
		onInit: function () {
			this.bus = sap.ui.getCore().getEventBus();
		},
		handleDetailDetailPress: function () {
			MessageToast.show("No more columns to load");
		},
		deleteContentPressHandler: function () {
			this.getView().byId("detailDetailPage").setContent(null);
			MessageToast.show("Page content deleted");
		}
	});
}, true);
