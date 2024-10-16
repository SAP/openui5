sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	"sap/ui/core/date/UI5Date"
],
	function(Controller, JSONModel, UI5Date) {
	"use strict";

	return Controller.extend("sap.m.sample.OverflowToolbarDifferentControls.OverflowToolbar", {
		onInit : function () {
			var oViewModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/countriesExtendedCollection.json"));
			oViewModel.setData({
				"viewPortPercentWidth": 100
			});
			this.getView().setModel(oViewModel);
		},

		onSliderMoved: function () {
			var iValue = this.getView().getModel().getProperty("/viewPortPercentWidth");

			this.byId("otb1").setWidth(iValue + "%");
		}
	});
});
