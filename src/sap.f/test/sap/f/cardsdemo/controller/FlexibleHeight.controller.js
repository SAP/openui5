sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/StandardListItem"
], function (Controller, StandardListItem) {
	"use strict";

	return Controller.extend("sap.f.cardsdemo.controller.FlexibleHeight", {
		_index: 1,
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
		},
		_onLayoutL: function (oGrid) {
		},
		_onLayoutXL: function (oGrid) {
		},
		onAddItemPress: function () {
			var oList = this.getView().byId("default4x2withcomponent")
				.getAggregation("_content")
				.getComponentInstance()
				.byId("app")
				.byId("somelist");

			oList.addItem(new StandardListItem({
				title: "Item " + this._index,
				description: "One more item added to the list with index " + this._index,
				icon: "sap-icon://bell"
			}));
			this._index++;
		}
    });

});