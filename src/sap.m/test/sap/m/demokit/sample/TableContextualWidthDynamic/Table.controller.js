sap.ui.define([
		'jquery.sap.global',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel',
		'sap/ui/Device'
	], function(jQuery, Controller, JSONModel, Device) {
	"use strict";


	var TableController = Controller.extend("sap.m.sample.Table.Table", {

		onInit: function () {
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock") + "/products.json");
			this.getView().setModel(oModel);
		},

		onBeforeRendering: function () {
			if (Device.system.phone) {
				Device.orientation.attachHandler(this._orientationHandler, this);
				if (Device.orientation.portrait) {
					this._showMessageStrip(false);
				} else {
					this._showMessageStrip(true);
				}
			}
		},

		_orientationHandler: function (mParams) {
			if (mParams.landscape) {
				this._showMessageStrip(true);
			} else {
				this._showMessageStrip(false);
			}
		},

		_showMessageStrip: function (bShow) {
			var oMessageStrip = this.getView().byId("idMessageStrip");
			oMessageStrip.setVisible(bShow);
		},

		onExit: function () {
			Device.orientation.detachHandler(this._orientationHandler, this);
		}
	});


	return TableController;
});