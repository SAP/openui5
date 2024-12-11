/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/sample/common/Controller",
	"sap/ui/model/Filter"
], function (Controller, Filter) {
	"use strict";

	return Controller.extend(
			"sap.ui.core.sample.odata.v4.FlatDataAggregation.FlatDataAggregation", {
		onDownload : function () {
			this.byId("table").getBinding("rows").requestDownloadUrl().then(function (sUrl) {
				window.open(sUrl, sUrl);
			});
		},

		onInit : function () {
			// initialization has to wait for view model/context propagation
			this.getView().attachEventOnce("modelContextChange", function () {
				const oTable = this.byId("table");
				const oRowsBinding = oTable.getBinding("rows");
				this.byId("title").setBindingContext(oRowsBinding.getHeaderContext());

				this._oAggregation = {
					aggregate : {
						FlightPrice : {
							grandTotal : true,
							unit : "CurrencyCode_code"
						}
					},
					group : {
						airline : {additionally : ["airlineName"]},
						ConnectionID : {
							additionally : ["DepAirport", "DepCity", "DestAirport", "DestCity",
								"Distance", "DistanceUnit", "PlaneType"]
						},
						FlightDate : {},
						status : {additionally : ["statusName"]}
					}
					// Note: leaf level is aggregation across TravelID, BookingDate, BookingID
				};
				const oUriParameters = new URLSearchParams(window.location.search);
				const sGrandTotalAtBottomOnly = oUriParameters.get("grandTotalAtBottomOnly");
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
				oRowsBinding.setAggregation(this._oAggregation);

				const sFilter = oUriParameters.get("filter");
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
				const sOrderby = oUriParameters.get("$orderby");
				if (sOrderby) {
					oRowsBinding.changeParameters({$orderby : sOrderby});
				}
				oRowsBinding.resume();
			}, this);
		},

		onSearch : function (oEvent) {
			this._oAggregation.search = oEvent.getParameter("query");
			this.byId("table").getBinding("rows").setAggregation(this._oAggregation);
		}
	});
});
