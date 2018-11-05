sap.ui.define([
		'sap/ui/demo/toolpageapp/controller/BaseController',
		'sap/ui/model/json/JSONModel',
		"sap/ui/VersionInfo"
	], function (BaseController, JSONModel, VersionInfo) {
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
					if (oVersionInfo.name.startsWith("SAPUI5")) {
						// SAPUI5 distribution: use micro charts
						this.byId("statisticsContainer").addContent(sap.ui.xmlview({id: this.getView().createId("charts"), viewName : "sap.ui.demo.toolpageapp.view.StatisticsMicro"}));
					} else {
						// OpenUI5 distribution: use D3 charts
						this.byId("statisticsContainer").addContent(sap.ui.xmlview({id: this.getView().createId("charts"), viewName : "sap.ui.demo.toolpageapp.view.StatisticsD3"}));
					}
				}.bind(this));
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