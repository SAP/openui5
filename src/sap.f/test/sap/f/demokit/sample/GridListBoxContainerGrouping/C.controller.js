sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.f.sample.GridListBoxContainerGrouping.C", {

		onInit: function () {
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/f/sample/GridListBoxContainerGrouping/model/items.json"));
			this.getView().setModel(oModel);
		},

		onSliderMoved: function (oEvent) {
			var fValue = oEvent.getParameter("value");
			this.byId("panelForGridList").setWidth(fValue + "%");
		}

	});
});