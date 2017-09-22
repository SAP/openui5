sap.ui.define([
		'jquery.sap.global',
		'sap/m/MessageToast',
		'sap/ui/core/Fragment',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(jQuery, MessageToast, Fragment, Controller, JSONModel) {
	"use strict";

	var CController = Controller.extend("sap.m.sample.Popover.C", {

		onInit : function (evt) {
			// set explored app's demo model on this sample
			var oModel = new JSONModel(jQuery.sap.getModulePath("sap.ui.demo.mock", "/products.json"));
			this.getView().setModel(oModel);
		},

		onExit : function () {
			if (this._oPopover) {
				this._oPopover.destroy();
			}
		},

		handlePopoverPress: function (oEvent) {

			// create popover
			if (!this._oPopover) {
				this._oPopover = sap.ui.xmlfragment("sap.m.sample.Popover.Popover", this);
				this.getView().addDependent(this._oPopover);
				this._oPopover.bindElement("/ProductCollection/0");
			}

			this._oPopover.openBy(oEvent.getSource());
		},

		handleEmailPress: function (oEvent) {
			this._oPopover.close();
			MessageToast.show("E-Mail has been sent");
		}
	});


	return CController;

});
