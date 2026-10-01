sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/library"
], function(Controller, JSONModel, mobileLibrary) {
	"use strict";

	// shortcut for sap.m.Sticky
	var Sticky = mobileLibrary.Sticky;

	return Controller.extend("sap.m.sample.TableSticky.TableSticky", {
		onInit: function() {
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"));
			this.getView().setModel(oModel);
		},

		onToggleSticky: function() {
			var oView = this.getView();
			var aSticky = [];
			if (oView.byId("btnHeaderToolbar").getPressed()) { aSticky.push(Sticky.HeaderToolbar); }
			if (oView.byId("btnInfoToolbar").getPressed()) { aSticky.push(Sticky.InfoToolbar); }
			if (oView.byId("btnColumnHeaders").getPressed()) { aSticky.push(Sticky.ColumnHeaders); }
			if (oView.byId("btnGroupHeaders").getPressed()) { aSticky.push(Sticky.GroupHeaders); }
			this.byId("idProductsTable").setSticky(aSticky);
		}
	});
});
