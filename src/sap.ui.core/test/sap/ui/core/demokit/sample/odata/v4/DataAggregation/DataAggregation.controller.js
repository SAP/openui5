/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/m/MessageBox",
	"sap/ui/core/sample/common/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/json/JSONModel",
	"sap/ui/test/TestUtils"
], function (Log, MessageBox, Controller, Filter, JSONModel, TestUtils) {
	"use strict";

	return Controller.extend("sap.ui.core.sample.odata.v4.DataAggregation.DataAggregation", {
		onDownload : function () {
			this.byId("table").getBinding("rows").requestDownloadUrl().then(function (sUrl) {
				window.open(sUrl, sUrl);
			});
		},

		onExit : function () {
			this.getView().getModel("ui").destroy();
			return Controller.prototype.onExit.apply(this, arguments);
		},

		onInit : function () {
			// initialization has to wait for view model/context propagation
			this.getView().attachEventOnce("modelContextChange", function () {
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
						Country_Code : {additionally : ["Country"]}
					},
					groupLevels : ["Country_Code", "Region", "Segment", "AccountResponsible"]
				};
				if (sGrandTotalAtBottomOnly) {
					if (sGrandTotalAtBottomOnly === "true") {
						oTable.getRowMode().setFixedTopRowCount(0);
					}
					oTable.getRowMode().setFixedBottomRowCount(1);
					this._oAggregation.grandTotalAtBottomOnly = sGrandTotalAtBottomOnly === "true";
				}
				this.getView().setModel(oRowsBinding.getModel(), "header");
				this.getView().setBindingContext(oRowsBinding.getHeaderContext(), "header");
				if (sLeafCount) {
					oRowsBinding.changeParameters({$count : sLeafCount === "true"});
					oTitle.applySettings({
						text : "Sales Amount by Account Responsible"
							+ " (Leaves: {header>$count}, Selected: {header>$selectionCount})"
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
			}, this);
		},

		onRefresh : function () {
			this.byId("table").getBinding("rows").refresh();
		},

		onSearch : function () {
			this._oAggregation.search
				= this.getView().getModel("ui").getProperty("/sSearch");
			this.byId("table").getBinding("rows").setAggregation(this._oAggregation);
		},

		onShowSelection : function () {
			const oListBinding = this.byId("table").getBinding("rows");
			const bSelectAll = oListBinding.getHeaderContext().isSelected();
			const aPaths = oListBinding.getAllCurrentContexts()
				.filter((oContext) => oContext.isSelected() !== bSelectAll)
				.map((oContext) => oContext.getPath());
			MessageBox.information((bSelectAll ? "All except " : "") + aPaths.join("\n"),
				{title : "Selected Rows"});

			oListBinding.getAllCurrentContexts().forEach((oContext) => {
				const bSelectedGetter = oContext.isSelected();
				const bSelectedProperty = oContext.getProperty("@$ui5.context.isSelected") ?? false;
				if (bSelectedGetter !== bSelectedProperty) {
					Log.warning(`${bSelectedGetter} vs. ${bSelectedProperty}`,
						oContext, "sap.ui.core.sample.odata.v4.DataAggregation.DataAggregation");
				}
			});
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
