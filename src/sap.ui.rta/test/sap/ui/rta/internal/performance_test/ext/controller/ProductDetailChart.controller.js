sap.ui.define([
		"sap/ui/core/mvc/Controller",
		"sap/ui/model/json/JSONModel",
		"sap/viz/ui5/controls/Popover",
		"sap/ui/model/Sorter",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"sap/viz/ui5/controls/common/feeds/FeedItem",
		"sap/viz/ui5/data/FlattenedDataset"
	], function(Controller, JSONModel, Popover, Sorter, Filter, FilterOperator, FeedItem, FlattenedDataset) {
	"use strict";

	function substractMonthsFromToday(iMonthsToBeSubstracted) {
		var dToday = new Date(),
			iYear = dToday.getFullYear(),
			iMonth = dToday.getMonth() - iMonthsToBeSubstracted + 1;
		if (iMonth < 0) {
			iMonth = iMonth + 12;
			iYear = iYear - 1;
		}
		return Date.UTC(iYear, iMonth, 1);
	}

	var aVizFrameIDs = ["vizFrameBar", "vizFrameLine"];

	return Controller.extend("sap.ui.rta.test.performance.ext.controller.ProductDetailChart", {
		onInit: function() {
			var oView = this.getView();

			var oModel = this.getOwnerComponent().getModel("i18n|sap.suite.ui.generic.template.ObjectPage|STTA_C_MP_Product");
			if (oModel){
				this._oResourceBundle  = oModel.getResourceBundle();
			}
			this._oDimSelector = this.byId("select");

			var oDimensionSelectorModel = new JSONModel({
				dateSelector: [{
					key: substractMonthsFromToday(6),
					text: this._oResourceBundle.getText("xfld.dateHalfYear")
				}, {
					key: substractMonthsFromToday(12),
					text: this._oResourceBundle.getText("xfld.dateOneYear")
				}]
			});
			oView.setModel(oDimensionSelectorModel, "dimensionSelector");
			this._oDimSelector.setSelectedKey(substractMonthsFromToday(6));

			aVizFrameIDs.forEach(function(sVizFrameId) {
				new Popover().connect(this.byId(sVizFrameId).getVizUid());
			}.bind(this));
			aVizFrameIDs.forEach(this._setChartData.bind(this));
		},

		onChange: function() {
			aVizFrameIDs.forEach(this._resetChartData.bind(this));
		},

		_getChartConfiguration: function() {
			var dToday = new Date(),
				iStartDate = parseInt(this._oDimSelector.getSelectedKey(), 10),
				iEndDate = Date.UTC(dToday.getFullYear(), dToday.getMonth(), dToday.getDate()),
				sRevenueUIText = this._oResourceBundle.getText("xfld.amountAxis"),
				sMonthUIText = this._oResourceBundle.getText("xfld.dateAxis"),
				fnOnDataReceived = function(oEvent) {

				  var sCurrencyCode = '';
					if (oEvent.getSource().getContexts()[0]) {
						sCurrencyCode = oEvent.getSource().getContexts()[0].getProperty("Currency");
					} else {
						if (oEvent.getSource().oContext) {
							sCurrencyCode = oEvent.getSource().oContext.getProperty("Currency");
						} else {
							sCurrencyCode = '';
						}
					}

					var	oVizProperties = {
						title: {
							text: this._oResourceBundle.getText("xtit.chartTitle", [sCurrencyCode])
						}
					};
					aVizFrameIDs.forEach(function(sVizFrameId) {
						this.byId(sVizFrameId).setVizProperties(oVizProperties);
					}.bind(this));
				}.bind(this);

			return {
				axisLabels: new FeedItem({
					uid: "axisLabels",
					type: "Dimension",
					values: [sMonthUIText]
				}),
				primaryValues: new FeedItem({
					uid: "primaryValues",
					type: "Measure",
					values: [sRevenueUIText]
				}),
				dataset: new FlattenedDataset({
					dimensions: [{
						name: sMonthUIText,
						value: "{DeliveryMonth_Text}"
				}],
					measures: [{
						name: sRevenueUIText,
						value: "{Revenue}"
				}],
					data: {
						path: "to_ProductSalesData",
						sorter: [new Sorter("DeliveryDateTime", false)],
						filters: [new Filter("DeliveryDateTime", FilterOperator.BT, iStartDate, iEndDate)],
						events: {
							dataReceived: fnOnDataReceived
						}
					}
				})
			};
		},

		_resetChartData: function(sVizFrameId) {
			this.byId(sVizFrameId).destroyDataset();
			this.byId(sVizFrameId).destroyFeeds();
			this._setChartData(sVizFrameId);
		},

		_setChartData: function(sVizFrameId) {
			var oVizFrame = this.byId(sVizFrameId),
				oChartConfigBar = this._getChartConfiguration();
			oVizFrame.addFeed(oChartConfigBar.primaryValues);
			oVizFrame.addFeed(oChartConfigBar.axisLabels);
			oVizFrame.setDataset(oChartConfigBar.dataset);
		}
	});
});