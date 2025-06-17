/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/m/MessageBox",
	"sap/ui/core/sample/common/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/Sorter",
	"sap/ui/model/json/JSONModel"
], function (Log, MessageBox, Controller, Filter, Sorter, JSONModel) {
	"use strict";

	return Controller.extend("sap.ui.core.sample.odata.v4.MultiLevelExpand.Main", {
		onChangeGrandTotal : function (vEventOrSelectedKey) {
			const sGrandTotalAtBottomOnly = typeof vEventOrSelectedKey === "string"
				? vEventOrSelectedKey
				: vEventOrSelectedKey.getSource().getSelectedKey();
			const oTable = this.byId("table");

			oTable.getRowMode().setFixedTopRowCount(
				["", "false"].includes(sGrandTotalAtBottomOnly) ? 1 : 0);
			oTable.getRowMode().setFixedBottomRowCount(
				["false", "true"].includes(sGrandTotalAtBottomOnly) ? 1 : 0);
			switch (sGrandTotalAtBottomOnly) {
				case "":
					this._oAggregation.grandTotalAtBottomOnly = undefined;
					break;

				case "false":
					this._oAggregation.grandTotalAtBottomOnly = false;
					break;

				case "true":
					this._oAggregation.grandTotalAtBottomOnly = true;
					break;

				// case "off":
				// no default
			}
			this._oAggregation.aggregate.FlightPrice.grandTotal = sGrandTotalAtBottomOnly !== "off";

			oTable.getBinding("rows").setAggregation(this._oAggregation);
		},

		onChangeSubtotals : function (vEventOrSelectedKey) {
			const sSubtotalsAtBottomOnly = typeof vEventOrSelectedKey === "string"
				? vEventOrSelectedKey
				: vEventOrSelectedKey.getSource().getSelectedKey();
			const oTable = this.byId("table");

			switch (sSubtotalsAtBottomOnly) {
				case "":
					this._oAggregation.subtotalsAtBottomOnly = undefined;
					break;

				case "false":
					this._oAggregation.subtotalsAtBottomOnly = false;
					break;

				case "true":
					this._oAggregation.subtotalsAtBottomOnly = true;
					break;

				// case "off":
				// no default
			}
			this._oAggregation.aggregate.FlightPrice.subtotals = sSubtotalsAtBottomOnly !== "off";

			oTable.getBinding("rows").setAggregation(this._oAggregation);
		},

		onCollapseAll : function (oEvent) {
			try {
				oEvent.getSource().getBindingContext().collapse(true);
			} catch (oError) {
				MessageBox.error(oError.message);
			}
		},

		onDownload : function () {
			this.byId("table").getBinding("rows").requestDownloadUrl().then(function (sUrl) {
				window.open(sUrl, sUrl);
			});
		},

		onExit : function () {
			this.getView().getModel("ui").destroy();
			return Controller.prototype.onExit.apply(this, arguments);
		},

		onExpandAll : async function (oEvent) {
			try {
				await oEvent.getSource().getBindingContext().expand(true);
			} catch (oError) {
				MessageBox.error(oError.message);
			}
		},

		onInit : function () {
			// initialization has to wait for view model/context propagation
			this.getView().attachEventOnce("modelContextChange", function () {
				var oUriParameters = new URLSearchParams(window.location.search),
					sExpandTo = oUriParameters.get("expandTo"),
					sFilter = oUriParameters.get("filter"),
					sFirstVisibleRow = oUriParameters.get("firstVisibleRow") || "0",
					sGrandTotalAtBottomOnly = oUriParameters.get("grandTotalAtBottomOnly"),
					sLeafCount = oUriParameters.get("leafCount"),
					sSort = oUriParameters.get("sort"),
					sSubtotalsAtBottomOnly = oUriParameters.get("subtotalsAtBottomOnly"),
					oTable = this.byId("table"),
					sThreshold = oUriParameters.get("threshold") || "100",
					oRowsBinding = oTable.getBinding("rows"),
					sVisibleRowCount = oUriParameters.get("visibleRowCount");

				this.getView().setModel(new JSONModel({
					iMessages : 0,
					sSearch : "",
					iVisibleRowCount : parseInt(sVisibleRowCount) || 20
				}), "ui");
				this.initMessagePopover("showMessages");

				this._oAggregation = {
					aggregate : {
						FlightPrice : {
							grandTotal : true,
							subtotals : true,
							unit : "CurrencyCode_code"
						}
					},
					group : {
						airline : {additionally : ["airlineName"]}
					},
					groupLevels : ["airline", "ConnectionID", "FlightDate", "status", "BookingDate"]
				};
				if (sExpandTo) {
					this._oAggregation.expandTo = sExpandTo === "*"
						? Number.MAX_SAFE_INTEGER
						: parseFloat(sExpandTo); // Note: parseInt("1E16") === 1
				}
				oRowsBinding.setAggregation(this._oAggregation);
				oTable._oProxy._bEnableV4 = true; // enable V4 tree table flag
				this.getView().setModel(oRowsBinding.getModel(), "header");
				this.getView().setBindingContext(oRowsBinding.getHeaderContext(), "header");
				if (sLeafCount === "false" || sLeafCount === "off") {
					// Note: no "select" event fired!
					this.byId("toggleCount").setSelected(false);
					this.onToggleCount(false);
				}
				if (sThreshold) {
					oTable.setThreshold(parseInt(sThreshold));
				}
				if (sFirstVisibleRow) {
					oTable.setFirstVisibleRow(parseInt(sFirstVisibleRow));
				}
				if (!["", "false", "off", "true"].includes(sGrandTotalAtBottomOnly)) {
					sGrandTotalAtBottomOnly = ""; // ignore invalid values
				}
				// Note: no "change" event fired!
				this.byId("grandTotalAtBottomOnly").setSelectedKey(sGrandTotalAtBottomOnly);
				this.onChangeGrandTotal(sGrandTotalAtBottomOnly);
				if (!["", "false", "off", "true"].includes(sSubtotalsAtBottomOnly)) {
					sSubtotalsAtBottomOnly = ""; // ignore invalid values
				}
				// Note: no "change" event fired!
				this.byId("subtotalsAtBottomOnly").setSelectedKey(sSubtotalsAtBottomOnly);
				this.onChangeSubtotals(sSubtotalsAtBottomOnly);
				if (sFilter === "off") {
					oRowsBinding.filter();
				} else if (sFilter) { // e.g. "status EQ B,Distance BT 1000 5000"
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
				if (sSort === "off") {
					oRowsBinding.sort();
				} else if (sSort) {
					oRowsBinding.sort(sSort.split(",").map((sSingleSort) => {
						const aPieces = sSingleSort.split(" ");

						return new Sorter({
							path : aPieces[0],
							descending : aPieces[1] === "desc"
						});
					}));
				}
				oRowsBinding.resume(); // now that "ui" model is available...
			}, this);
		},

		onRefresh : function (_oEvent, bKeepTreeState) {
			const oBinding = this.byId("table").getBinding("rows");
			if (bKeepTreeState) {
				oBinding.getHeaderContext().requestSideEffects([""]);
			} else {
				oBinding.refresh();
			}
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
						oContext, "sap.ui.core.sample.odata.v4.MultiLevelExpand.Main");
				}
			});
		},

		onToggleCount : function (vEventOrSelected) {
			const bCount = typeof vEventOrSelected === "boolean"
				? vEventOrSelected
				: vEventOrSelected.getSource().getSelected();
			const sTitle = "Flight Bookings ({header>$selectionCount} selected)";
			if (bCount) { // turn on
				this.byId("table").getBinding("rows").changeParameters({$count : true});
				// Note: #setText does not support binding syntax
				this.byId("title").applySettings({
					text : "{header>$count} " + sTitle
				});
			} else { // turn off
				this.byId("title").applySettings({
					text : sTitle
				});
				this.byId("table").getBinding("rows").changeParameters({$count : false});
			}
		}
	});
});
