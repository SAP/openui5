/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Sorter",
	"sap/ui/model/json/JSONModel",
	"sap/ui/test/TestUtils"
], function (Controller, Sorter, JSONModel, TestUtils) {
	"use strict";

	return Controller.extend(
			"sap.ui.core.sample.odata.v4.FlatDataAggregation.FlatDataAggregation", {
		onBeforeRendering : function () {
			var mTable = this.byId("mTable"),
				tTable = this.byId("tTable");

			this.getView().setModel(new JSONModel({
				sFilterGrid : "",
				sFilterResponsive : "",
				bRealOData : TestUtils.isRealOData()
			}), "ui");

			this.byId("title").setBindingContext(mTable.getBinding("items").getHeaderContext(),
				"headerContext");
			mTable.setModel(mTable.getModel(), "headerContext");

			tTable.setBindingContext(tTable.getBinding("rows").getHeaderContext(),
				"headerContext");
			tTable.setModel(tTable.getModel(), "headerContext");
		},

		onFilterGrid : function (oEvent) {
			this.byId("tTable").getBinding("rows").changeParameters({
				$filter : 'SalesNumberSum gt '
					+ (this.getView().getModel("ui").getProperty("/sFilterGrid") || 0)
			});
		},

		onFilterResponsive : function (oEvent) {
			this.byId("mTable").getBinding("items").changeParameters({
				$filter : 'SalesNumber gt '
					+ (this.getView().getModel("ui").getProperty("/sFilterResponsive") || 0)
			});
		},

		onRefreshGrid : function (oEvent) {
			this.byId("tTable").getBinding("rows").refresh();
		},

		onRefreshResponsive : function (oEvent) {
			this.byId("mTable").getBinding("items").refresh();
		},

		onSortGrid : function (oEvent) {
			this.byId("tTable").getBinding("rows").changeParameters({$orderby : 'Region asc'});
		},

		onSortResponsive : function (oEvent) {
			this.byId("mTable").getBinding("items").changeParameters({$orderby : 'Region asc'});
		}
	});
});