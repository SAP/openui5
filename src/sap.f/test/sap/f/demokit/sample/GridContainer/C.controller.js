sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/f/sample/GridContainer/RevealGrid/RevealGrid"
], function (Controller, JSONModel, RevealGrid) {
	"use strict";

	return Controller.extend("sap.f.sample.GridContainer.C", {

		onInit: function () {
			var oCitiesModel = new JSONModel(sap.ui.require.toUrl("sap/f/sample/GridContainer/model/cities.json")),
				oProductsModel =  new JSONModel(sap.ui.require.toUrl("sap/f/sample/GridContainer/model/products.json"));

			this.getView().setModel(oCitiesModel, "cities");
			this.getView().setModel(oProductsModel, "products");

			// Use smaller margin around grid when on smaller screens
			var oGrid = this.getView().byId("demoGrid");
			oGrid.attachLayoutChange(function (oEvent) {
				var sLayout = oEvent.getParameter("layout");

				if (sLayout === "layoutXS" || sLayout === "layoutS") {
					oGrid.removeStyleClass("sapUiSmallMargin");
					oGrid.addStyleClass("sapUiTinyMargin");
				} else {
					oGrid.removeStyleClass("sapUiTinyMargin");
					oGrid.addStyleClass("sapUiSmallMargin");
				}
			});
		},

		onRevealGrid: function () {
			RevealGrid.toggle("demoGrid", this.getView());
		},

		onExit: function() {
			RevealGrid.destroy("demoGrid", this.getView());
		},

		onSnapToRowChange: function (oEvent) {
			this.getView().byId("demoGrid").setSnapToRow(oEvent.getParameter("state"));
		},

		onAllowDenseFillChange: function (oEvent) {
			this.getView().byId("demoGrid").setAllowDenseFill(oEvent.getParameter("state"));
		},

		onInlineBlockLayoutChange: function (oEvent) {
			this.getView().byId("demoGrid").setInlineBlockLayout(oEvent.getParameter("state"));
		}

	});
});