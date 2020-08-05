sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast"
], function (Controller, JSONModel, MessageToast) {
	"use strict";

	return Controller.extend("sap.f.sample.GridListBreakPoints.C", {

		onInit: function () {
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/f/sample/GridListBreakPoints/model/items.json"));
			this.getView().setModel(oModel);
		},

		onLayoutChange: function (oEvent) {
			MessageToast.show("Layout changed to " + oEvent.getParameter("layout"));
		},

		onSliderMoved: function (oEvent) {
			var fValue = oEvent.getParameter("value");
			this.byId("panelForGridList").setWidth(fValue + "%");
		}

	});
});