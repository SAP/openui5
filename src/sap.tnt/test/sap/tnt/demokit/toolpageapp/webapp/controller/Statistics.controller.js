sap.ui.define([
		'sap/ui/demo/toolpageapp/controller/BaseController'
	], function (BaseController) {
		"use strict";
		return BaseController.extend("sap.ui.demo.toolpageapp.controller.Statistics", {

			onInit: function () {
				this.getRouter().getRoute("statistics").attachPatternMatched(this._onRouteMatched, this);
			},

			onRefresh: function () {
				this.getView().byId("statisticsBlockLayout").setBusy(true);
				setTimeout(function () {
					this.getView().byId("statisticsBlockLayout").setBusy(false);
				}.bind(this), 2000);
			},

			_onRouteMatched: function () {
				try {
					sap.ui.require([
						"sap/suite/ui/microchart/AreaMicroChart"
					], function () {
						this.byId("statisticsContainer").addContent(sap.ui.xmlview({viewName : "sap.ui.demo.toolpageapp.view.StatisticsMicro"}));
					}.bind(this));
				} catch(oException) {
					// no microcharts available: use d3 view
					this.byId("statisticsContainer").addContent(sap.ui.xmlview({viewName : "sap.ui.demo.toolpageapp.view.StatisticsD3"}));
				}
			}

		});
});