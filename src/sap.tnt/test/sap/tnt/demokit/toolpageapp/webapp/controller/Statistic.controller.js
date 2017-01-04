sap.ui.define([
		'sap/ui/demo/toolpageapp/controller/BaseController'
	], function (BaseController) {
		"use strict";
		return BaseController.extend("sap.ui.demo.toolpageapp.controller.Statistic", {

			onInit: function () {
			},

			onRefresh: function () {
				this.getView().byId("statisticsBlockLayout").setBusy(true);
				setTimeout(function () {
					this.getView().byId("statisticsBlockLayout").setBusy(false);
				}.bind(this), 2000);
			}

		});
});