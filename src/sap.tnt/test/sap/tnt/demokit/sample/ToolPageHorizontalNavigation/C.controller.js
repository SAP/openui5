sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.tnt.sample.ToolPageHorizontalNavigation.C", {

		onInit: function () {
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/tnt/sample/ToolPageHorizontalNavigation/model/data.json"));
			this.getView().setModel(oModel);
		},

		onItemSelect: function (oEvent) {
			var oItem = oEvent.getParameter("item");
			this.byId("pageContainer").to(this.getView().createId(oItem.getKey()));
		}
	});
});