sap.ui.define([
	'./BaseController',
	'sap/ui/model/json/JSONModel',
	"sap/ui/VersionInfo",
	"sap/ui/core/mvc/XMLView"
], function (BaseController, JSONModel, VersionInfo, XMLView) {
	"use strict";
	return BaseController.extend("sap.ui.demo.toolpageapp.controller.Statistics", {

		onInit: function () {
			var oViewModel = new JSONModel({
				ColumnChartData: [{v: 80}, {v: 150}, {v: 400}, {v: 200}],
				ColumnChartData2: [{v: 40}, {v: 320}, {v: 270}, {v: 140}, {v: 60}],
				ComparisonChartData: [{v: 120}, {v: -67}, {v: 250}, {v: -80}],
				ComparisonChartData2: [{v: -70}, {v: 170}, {v: -30}, {v: 60}, {v: 120}],
				PieChartData: [{v: 83}],
				PieChartData2: [{v: 57}]
			});
			this.setModel(oViewModel, "view");

			// Load charts for the current environment (D3 = OpenUI5, MicroCharts = SAPUI5)
			VersionInfo.load().then(function (oVersionInfo) {
				var sType = (oVersionInfo.name.startsWith("SAPUI5") ? "Micro" : "D3");

				if (sType === "Micro") {
					// For SAPUI5, we need first to load the microchart library and then create the view
					sap.ui.getCore().loadLibrary("sap.suite.ui.microchart", {async: true}).then(function () {
						this._createView(sType);
					}.bind(this));
				} else {
					this._createView(sType);
				}
			}.bind(this));

			this._createView = function (sType) {
				XMLView.create({
					id: this.getView().createId("charts"),
					viewName: "sap.ui.demo.toolpageapp.view.Statistics" + sType
				}).then(function (oView) {
					this.byId("statisticsContainer").addContent(oView);
				}.bind(this));
			};
		},

		onRefresh: function () {
			this.byId("charts").byId("statisticsBlockLayout").invalidate();
			this.byId("charts").byId("statisticsBlockLayout").setBusy(true);
			setTimeout(function () {
				this.byId("charts").byId("statisticsBlockLayout").setBusy(false);
			}.bind(this), 2000);
		}

	});
});