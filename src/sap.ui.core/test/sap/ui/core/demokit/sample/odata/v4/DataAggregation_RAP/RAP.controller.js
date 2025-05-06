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

	return Controller.extend("sap.ui.core.sample.odata.v4.DataAggregation_RAP.RAP", {
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
					bBookingID = oUriParameters.has("BookingID"),
					sFilter = oUriParameters.get("filter"),
					sGrandTotalAtBottomOnly = oUriParameters.get("grandTotalAtBottomOnly"),
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
						airline : {additionally : ["airlineName"]},
						ConnectionID : {
							additionally : ["DepAirport", "DepCity", "DestAirport", "DestCity",
								"Distance", "DistanceUnit"]
						}
					},
					groupLevels : ["airline", "ConnectionID", "FlightDate", "status", "TravelID",
						"BookingDate"]
				};
				if (bBookingID) { // leaf level is individual bookings
					this._oAggregation.groupLevels.push("BookingID");
				} else { // leaf level shows aggregates
					const oColumn = oTable.getColumns()[9];
					if (oColumn.getLabel().getText() === "Booking ID") {
						oColumn.destroy(); // destroy BookingID column
					}
				}
				oTable._oProxy._bEnableV4 = true; // enable V4 tree table flag
				this.getView().setModel(oRowsBinding.getModel(), "header");
				this.getView().setBindingContext(oRowsBinding.getHeaderContext(), "header");
				if (sThreshold) {
					oTable.setThreshold(parseInt(sThreshold));
				}
				if (sGrandTotalAtBottomOnly === "off") {
					oTable.getRowMode().setFixedTopRowCount(0);
					this._oAggregation.aggregate.FlightPrice.grandTotal = false;
				} else if (sGrandTotalAtBottomOnly) {
					if (sGrandTotalAtBottomOnly === "true") {
						oTable.getRowMode().setFixedTopRowCount(0);
					}
					oTable.getRowMode().setFixedBottomRowCount(1);
					this._oAggregation.grandTotalAtBottomOnly = sGrandTotalAtBottomOnly === "true";
				}
				if (sSubtotalsAtBottomOnly === "off") {
					this._oAggregation.aggregate.FlightPrice.subtotals = false;
				} else if (sSubtotalsAtBottomOnly) {
					this._oAggregation.subtotalsAtBottomOnly = sSubtotalsAtBottomOnly === "true";
				}
				oRowsBinding.setAggregation(this._oAggregation);
				if (sFilter) { // e.g. "status EQ B,Distance BT 1000 5000"
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
				if (sSort) {
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
						oContext, "sap.ui.core.sample.odata.v4.DataAggregation_RAP.RAP");
				}
			});
		}
	});
});
