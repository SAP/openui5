sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("sap.f.cardsdemo.controller.Zflow", {
		onInit: function () {
			this.getView().byId("cssgrid")._wrapItemsWithDiv = true;
		},
        onLayoutChange: function (oEvent) {
			var sLayout = oEvent.getParameter("layout");
			var oGrid = oEvent.getSource().getParent();

			switch (sLayout) {
				case "layoutS": this._onLayoutS(oGrid); break;
				case "layoutM": this._onLayoutM(oGrid); break;
				case "layoutL": this._onLayoutL(oGrid); break;
				case "layoutXL": this._onLayoutXL(oGrid); break;
			}
		},
		onSwitchChange: function (oEvent) {
			var bState = oEvent.getParameter("state");
			var sGridAutoFlow = bState ? "RowDense" : "Row";
			var oGrid = this.getView().byId("cssgrid");
			oGrid.getCustomLayout().getLayoutS().setGridAutoFlow(sGridAutoFlow);
			oGrid.getCustomLayout().getLayoutM().setGridAutoFlow(sGridAutoFlow);
			oGrid.getCustomLayout().getLayoutL().setGridAutoFlow(sGridAutoFlow);
			oGrid.getCustomLayout().getLayoutXL().setGridAutoFlow(sGridAutoFlow);
		},
		_onLayoutS: function (oGrid) {
		},
		_onLayoutM: function (oGrid) {
			this.getView().byId("default4x2").setHorizontalSize(2);
			this.getView().byId("default4x1").setHorizontalSize(2);
			this.getView().byId("default4x4").setHorizontalSize(2);
			this.getView().byId("default4x4Image").setHorizontalSize(2);
			this.getView().byId("default6x4").setHorizontalSize(4);
			this.getView().byId("2default6x4").setHorizontalSize(4);
			this.getView().byId("ddefault6x2").setVerticalSize(5);
		},
		_onLayoutL: function (oGrid) {
			this.getView().byId("default4x2").setHorizontalSize(4);
			this.getView().byId("default4x1").setHorizontalSize(4);
			this.getView().byId("default4x4").setHorizontalSize(4);
			this.getView().byId("default4x4Image").setHorizontalSize(4);
			this.getView().byId("default6x4").setHorizontalSize(6);
			this.getView().byId("2default6x4").setHorizontalSize(6);
			this.getView().byId("ddefault6x2").setVerticalSize(6);
		},
		_onLayoutXL: function (oGrid) {
		}
    });

});