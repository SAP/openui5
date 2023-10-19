/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/sample/common/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/json/JSONModel",
	"sap/ui/test/TestUtils"
], function (Controller, Filter, JSONModel, TestUtils) {
	"use strict";

	return Controller.extend("sap.ui.core.sample.odata.v4.DataAggregation.DataAggregation", {
		onExit : function () {
			this.getView().getModel("ui").destroy();
			return Controller.prototype.onExit.apply(this, arguments);
		},

		onDownload : function () {
			this.byId("table").getBinding("rows").requestDownloadUrl().then(function (sUrl) {
				window.open(sUrl, sUrl);
			});
		},

		onInit : function () {
			var oUriParameters = new URLSearchParams(window.location.search),
				sFilter = TestUtils.retrieveData( // controlled by OPA
						"sap.ui.core.sample.odata.v4.DataAggregation.filter")
					|| oUriParameters.get("filter"),
				sGrandTotalAtBottomOnly = TestUtils.retrieveData( // controlled by OPA
						"sap.ui.core.sample.odata.v4.DataAggregation.grandTotalAtBottomOnly")
					|| oUriParameters.get("grandTotalAtBottomOnly"),
				sLeafCount = TestUtils.retrieveData( // controlled by OPA
						"sap.ui.core.sample.odata.v4.DataAggregation.leafCount")
					|| oUriParameters.get("leafCount"),
				sSubtotalsAtBottomOnly = TestUtils.retrieveData( // controlled by OPA
						"sap.ui.core.sample.odata.v4.DataAggregation.subtotalsAtBottomOnly")
					|| oUriParameters.get("subtotalsAtBottomOnly"),
				oTable = this.byId("table"),
				oTitle = this.byId("title"),
				oRowsBinding = oTable.getBinding("rows"),
				sVisibleRowCount = TestUtils.retrieveData( // controlled by OPA
						"sap.ui.core.sample.odata.v4.DataAggregation.visibleRowCount")
					|| oUriParameters.get("visibleRowCount");

			this.getView().setModel(new JSONModel({
				iMessages : 0,
				sSearch : "",
				iVisibleRowCount : parseInt(sVisibleRowCount) || 5
			}), "ui");
			this.initMessagePopover("showMessages");

			this._oAggregation = {
				aggregate : {
					SalesAmountLocalCurrency : {
						grandTotal : true,
						subtotals : true,
						unit : "LocalCurrency"
					},
					SalesNumber : {}
				},
				group : {
					AccountResponsible : {},
					Country_Code : {additionally : ["Country"]}
				},
				groupLevels : ["Country_Code", "Region", "Segment"]
			};
			if (sGrandTotalAtBottomOnly) {
				if (sGrandTotalAtBottomOnly === "true") {
					oTable.getRowMode().setFixedTopRowCount(0);
				}
				oTable.getRowMode().setFixedBottomRowCount(1);
				this._oAggregation.grandTotalAtBottomOnly = sGrandTotalAtBottomOnly === "true";
			}
			if (sLeafCount) {
				oRowsBinding.changeParameters({$count : sLeafCount === "true"});
				oTitle.setBindingContext(oRowsBinding.getHeaderContext());
				oTitle.applySettings({
					text : "Sales Amount by Account Responsible ({$count})"
				});
			}
			if (sSubtotalsAtBottomOnly) {
				this._oAggregation.subtotalsAtBottomOnly = sSubtotalsAtBottomOnly === "true";
			}
			oRowsBinding.setAggregation(this._oAggregation);
			if (sFilter) { // e.g. "LocalCurrency GT G,Region LT S"
				oRowsBinding.filter(sFilter.split(",").map(function (sSingleFilter) {
					var aPieces = sSingleFilter.split(" ");

					return new Filter({
						path : aPieces[0],
						operator : aPieces[1],
						value1 : aPieces[2],
						value2 : aPieces[3]
					});
				}));
			}
			oRowsBinding.resume(); // now that "ui" model is available...
		},

		onSearch : function () {
			this._oAggregation.search
				= this.getView().getModel("ui").getProperty("/sSearch");
			this.byId("table").getBinding("rows").setAggregation(this._oAggregation);
		},

		onToggleExpand : function (oEvent) {
			// get the context from the button's row
			var oRowContext = oEvent.getSource().getBindingContext();

			if (oRowContext.isExpanded()) {
				oRowContext.collapse();
			} else {
				oRowContext.expand();
			}
		}
	});
});
