sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel'
],
	function(Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.m.sample.OverflowToolbarSimple.OverflowToolbar", {
		onInit : function () {
			var oViewModel = new JSONModel();
			oViewModel.setData({
				"viewPortPercentWidth": 100
			});
			this.getView().setModel(oViewModel);
		},

		onSliderMoved: function () {
			var iValue = this.getView().getModel().getProperty("/viewPortPercentWidth");

			this.byId("otb1").setWidth(iValue + "%");
			this.byId("otb2").setWidth(iValue + "%");
			this.byId("otb3").setWidth(iValue + "%");
			this.byId("otb4").setWidth(iValue + "%");
			this.byId("otb5").setWidth(iValue + "%");
			this.byId("otb6").setWidth(iValue + "%");
			this.byId("otb7").setWidth(iValue + "%");
			this.byId("otb8").setWidth(iValue + "%");
			this.byId("otb9").setWidth(iValue + "%");
			this.byId("otb10").setWidth(iValue + "%");
		}
	});
});
