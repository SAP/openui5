sap.ui.define([
		'jquery.sap.global',
		'sap/m/MessageBox',
		'sap/ui/core/Fragment',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(jQuery, MessageBox, Fragment, Controller, JSONModel) {
	"use strict";

	var PageController = Controller.extend("sap.m.sample.ObjectHeaderResponsiveIV.Page", {

		onInit: function() {
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock") + "/products.json");
			this.getView().setModel(oModel);
		},

		onPress: function (evt) {
			jQuery.sap.require("sap.m.MessageBox");
			MessageBox.alert("Link was clicked!");
		},

		onExit : function () {
			if (this._oPopover) {
				this._oPopover.destroy();
			}
		},

		_getPopover : function () {
			if (!this._oPopover) {
				this._oPopover = sap.ui.xmlfragment("sap.m.sample.ObjectHeaderResponsiveIV.Popover", this);
			}
			return this._oPopover;
		},

		handleTitlePress : function (oEvent) {
			var domRef = oEvent.getParameter("domRef");
			this._getPopover().openBy(domRef);
		}
	});


	return PageController;

});