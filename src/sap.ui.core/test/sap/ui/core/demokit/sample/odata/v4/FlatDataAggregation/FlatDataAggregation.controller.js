/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/util/UriParameters",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/test/TestUtils"
], function (UriParameters, Controller, JSONModel, TestUtils) {
	"use strict";

	return Controller.extend(
			"sap.ui.core.sample.odata.v4.FlatDataAggregation.FlatDataAggregation", {
		onExit : function () {
			this.getView().getModel("ui").destroy();
			return Controller.prototype.onExit.apply(this, arguments);
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

		onInit : function () {
			var sGrandTotalAtBottomOnly
					= UriParameters.fromQuery(location.search).get("grandTotalAtBottomOnly"),
				bGrandTotalAtBottomOnly = sGrandTotalAtBottomOnly === "true",
				oMTable = this.byId("mTable"),
				oTTable = this.byId("tTable"),
				oRowsBinding = oTTable.getBinding("rows");

			this.getView().setModel(new JSONModel({
				sFilterGrid : "",
				sFilterResponsive : "",
				bRealOData : TestUtils.isRealOData()
			}), "ui");

			this.byId("title").setBindingContext(oMTable.getBinding("items").getHeaderContext(),
				"headerContext");
			oMTable.setModel(oMTable.getModel(), "headerContext");

			if (sGrandTotalAtBottomOnly) {
				oRowsBinding.changeParameters({
					$count : true,
					$filter : 'SalesNumberSum gt 0',
					$orderby : 'Region desc'
				});
				// Note: this triggers a "refresh" event with reason "filter" which resets
				// firstVisibleRow to 0
				oRowsBinding.setAggregation({
					aggregate : {
						AmountPerSale : {
							grandTotal : true,
							unit : 'Currency'
						},
						SalesAmount : {
							grandTotal : true,
							unit : 'Currency'
						},
						SalesAmountLocalCurrency : {
							grandTotal : true,
							unit : 'LocalCurrency'
						},
						SalesNumberSum : {
							grandTotal : true,
							name : 'SalesNumber',
							"with" : 'sum'
						}
					},
					//TODO how to change this w/o duplicating $$aggregation here?
					grandTotalAtBottomOnly : bGrandTotalAtBottomOnly,
					group : {
						Region : {}
					}
				});
				if (bGrandTotalAtBottomOnly) {
					oTTable.setFixedRowCount(0);
				}
				oTTable.setFixedBottomRowCount(1);
			}
			oRowsBinding.resume();
			oTTable.setBindingContext(oRowsBinding.getHeaderContext(), "headerContext");
			oTTable.setModel(oTTable.getModel(), "headerContext");
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