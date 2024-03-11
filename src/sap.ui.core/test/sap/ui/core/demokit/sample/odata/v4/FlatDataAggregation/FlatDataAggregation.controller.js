/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/m/MessageToast",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/test/TestUtils"
], function (MessageToast, Controller, JSONModel, TestUtils) {
	"use strict";

	return Controller.extend(
			"sap.ui.core.sample.odata.v4.FlatDataAggregation.FlatDataAggregation", {
		_oAggregation4Grid : {
			aggregate : {
				AmountPerSale : {
					grandTotal : true,
					unit : "Currency"
				},
				SalesAmount : {
					grandTotal : true,
					unit : "Currency"
				},
				SalesAmountLocalCurrency : {
					grandTotal : true,
					unit : "LocalCurrency"
				},
				SalesNumberSum : {
					grandTotal : true,
					name : "SalesNumber",
					with : "sum"
				}
			},
			group : {
				Region : {}
			}
		},

		_oAggregation4Responsive : {
			aggregate : {
				SalesAmount : {grandTotal : true, unit : "Currency"},
				SalesNumber : {}
			},
			group : {
				Region : {}
			}
		},

		download : function (oListBinding) {
			oListBinding.requestDownloadUrl().then(function (sUrl) {
				window.open(sUrl, sUrl);
			});
		},

		onDownloadGrid : function () {
			this.download(this.byId("tTable").getBinding("rows"));
		},

		onDownloadResponsive : function () {
			this.download(this.byId("mTable").getBinding("items"));
		},

		onExit : function () {
			this.getView().getModel("ui").destroy();
			return Controller.prototype.onExit.apply(this, arguments);
		},

		onFilterGrid : function () {
			var sFilter = this.getView().getModel("ui").getProperty("/sFilterGrid"),
				sGrandTotalAtBottomOnly
					= new URLSearchParams(window.location.search)
						.get("grandTotalAtBottomOnly"),
				oTTable = this.byId("tTable"),
				oTTableMode = oTTable.getRowMode(),
				oRowsBinding = oTTable.getBinding("rows"),
				that = this;

			oRowsBinding.suspend();
			oRowsBinding.changeParameters({
				$filter : sFilter ? "SalesNumberSum gt " + sFilter : undefined
			});
			if (!this._oAggregation4Grid["grandTotal like 1.84"]) {
				// grand total and filtering for aggregated property cannot be combined
				if (sFilter) {
					MessageToast.show(
						"Grand totals and filtering for aggregated properties cannot be combined"
							+ " - grand totals have been turned off while filtering is on", {
						duration : 5000,
						my : "center center",
						at : "center center",
						of : oTTable
					});
				}
				["AmountPerSale", "SalesAmount", "SalesAmountLocalCurrency", "SalesNumberSum"]
					.forEach(function (sAlias) {
						that._oAggregation4Grid.aggregate[sAlias].grandTotal = !sFilter;
					});
				oRowsBinding.setAggregation(this._oAggregation4Grid);
				oTTableMode.setFixedTopRowCount(sGrandTotalAtBottomOnly !== "true"
												&& !sFilter ? 1 : 0);
				oTTableMode.setFixedBottomRowCount(sGrandTotalAtBottomOnly && !sFilter ? 1 : 0);
			}
			oRowsBinding.resume();
		},

		onFilterResponsive : function () {
			var sFilter = this.getView().getModel("ui").getProperty("/sFilterResponsive"),
				oMTable = this.byId("mTable"),
				oItemsBinding = oMTable.getBinding("items");

			oItemsBinding.suspend();
			oItemsBinding.changeParameters({
				$filter : sFilter ? "SalesNumber gt " + sFilter : undefined
			});
			if (!this._oAggregation4Responsive["grandTotal like 1.84"]) {
				// grand total and filtering for aggregated property cannot be combined
				if (sFilter) {
					MessageToast.show(
						"Grand totals and filtering for aggregated properties cannot be combined"
							+ " - grand totals have been turned off while filtering is on", {
						duration : 5000,
						my : "center center",
						at : "center center",
						of : oMTable
					});
				}
				this._oAggregation4Responsive.aggregate.SalesAmount.grandTotal = !sFilter;
				oItemsBinding.setAggregation(this._oAggregation4Responsive);
			}
			oItemsBinding.resume();
		},

		onInit : function () {
			var oUriParameters = new URLSearchParams(window.location.search),
				sGrandTotalAtBottomOnly = oUriParameters.get("grandTotalAtBottomOnly"),
				bGrandTotalAtBottomOnly = sGrandTotalAtBottomOnly === "true",
				sGrandTotalLike184 = oUriParameters.get("grandTotalLike1.84"),
				oMTable = this.byId("mTable"),
				oItemsBinding = oMTable.getBinding("items"),
				oTTable = this.byId("tTable"),
				oRowsBinding = oTTable.getBinding("rows");

			this.getView().setModel(new JSONModel({
				sFilterGrid : "",
				sFilterResponsive : "",
				bRealOData : TestUtils.isRealOData()
			}), "ui");

			if (sGrandTotalLike184) {
				this._oAggregation4Grid["grandTotal like 1.84"] = true;
				this._oAggregation4Responsive["grandTotal like 1.84"] = true;
			}

			oItemsBinding.setAggregation(this._oAggregation4Responsive);
			oItemsBinding.resume();
			this.byId("title").setBindingContext(oMTable.getBinding("items").getHeaderContext(),
				"headerContext");
			oMTable.setModel(oMTable.getModel(), "headerContext");

			oRowsBinding.changeParameters({
				$count : true,
				$orderby : "Region desc"
			});
			if (sGrandTotalAtBottomOnly) {
				this._oAggregation4Grid.grandTotalAtBottomOnly = bGrandTotalAtBottomOnly;
				oTTable.getRowMode().setFixedBottomRowCount(1);
			}
			// Note: this invokes a "refresh" event with reason "filter" which resets
			// firstVisibleRow to 0
			oRowsBinding.setAggregation(this._oAggregation4Grid);
			oTTable.setFirstVisibleRow(1); //TODO does not help?
			if (sGrandTotalAtBottomOnly !== "true") {
				oTTable.getRowMode().setFixedTopRowCount(1);
			}
			oRowsBinding.resume();
			oTTable.setBindingContext(oRowsBinding.getHeaderContext(), "headerContext");
			oTTable.setModel(oTTable.getModel(), "headerContext");
		},

		onRefreshGrid : function () {
			this.byId("tTable").getBinding("rows").refresh();
		},

		onRefreshResponsive : function () {
			this.byId("mTable").getBinding("items").refresh();
		},

		onSortGrid : function () {
			this.byId("tTable").getBinding("rows").changeParameters({$orderby : "Region asc"});
		},

		onSortResponsive : function () {
			this.byId("mTable").getBinding("items").changeParameters({$orderby : "Region asc"});
		}
	});
});
