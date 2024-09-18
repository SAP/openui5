/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/sample/common/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/json/JSONModel"
], function (Controller, Filter, JSONModel) {
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
					sFilter = oUriParameters.get("filter"),
					sGrandTotalAtBottomOnly = oUriParameters.get("grandTotalAtBottomOnly"),
					sSubtotalsAtBottomOnly = oUriParameters.get("subtotalsAtBottomOnly"),
					oTable = this.byId("table"),
					oTitle = this.byId("title"),
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
						BookingID : {additionally : ["BookingDate"]},
						ConnectionID : {
							additionally : ["DepAirport", "DepCity", "DestAirport", "DestCity",
								"Distance", "DistanceUnit"]
						},
						TravelID : {additionally : ["FlightDate"]}
					},
					groupLevels : ["airline", "ConnectionID", "status", "TravelID"]
				};
				// enable V4 tree table flag
				oTable._oProxy._bEnableV4 = true;
				oTitle.setBindingContext(oRowsBinding.getHeaderContext());
				if (sThreshold) {
					oTable.setThreshold(parseInt(sThreshold));
				}
				if (sGrandTotalAtBottomOnly) {
					if (sGrandTotalAtBottomOnly === "true") {
						oTable.getRowMode().setFixedTopRowCount(0);
					}
					oTable.getRowMode().setFixedBottomRowCount(1);
					this._oAggregation.grandTotalAtBottomOnly = sGrandTotalAtBottomOnly === "true";
				}
				if (sSubtotalsAtBottomOnly) {
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
				oRowsBinding.resume(); // now that "ui" model is available...
			}, this);
		},

		onSearch : function () {
			this._oAggregation.search
				= this.getView().getModel("ui").getProperty("/sSearch");
			this.byId("table").getBinding("rows").setAggregation(this._oAggregation);
		}
	});
});
