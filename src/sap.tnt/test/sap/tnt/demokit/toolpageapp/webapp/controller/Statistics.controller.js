sap.ui.define([
		'sap/ui/demo/toolpageapp/controller/BaseController',
		'sap/ui/model/json/JSONModel'
	], function (BaseController, JSONModel) {
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

				// Load charts for the current ennvironment (D3 = OpenUI5, MicroCharts = SAPUI5)
				try {
					sap.ui.require([
						"sap/suite/ui/microchart/AreaMicroChart"
					], function () {
						this.byId("statisticsContainer").addContent(sap.ui.xmlview({id: this.getView().createId("charts"), viewName : "sap.ui.demo.toolpageapp.view.StatisticsMicro"}));
					}.bind(this));
				} catch (oException) {
					// no microcharts available: use d3 view
					this.byId("statisticsContainer").addContent(sap.ui.xmlview({id: this.getView().createId("charts"), viewName : "sap.ui.demo.toolpageapp.view.StatisticsD3"}));
				}
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