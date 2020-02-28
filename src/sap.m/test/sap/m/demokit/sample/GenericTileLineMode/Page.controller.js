sap.ui.define([
	'jquery.sap.global',
	'sap/ui/core/mvc/Controller',
	'sap/m/MessageToast',
	"sap/ui/model/json/JSONModel"
], function (jQuery, Controller, MessageToast, JSONModel) {
	"use strict";

	var PageController = Controller.extend("sap.m.sample.GenericTileLineMode.Page", {
		onInit: function () {
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/m/sample/GenericTileLineMode/tiles.json"));
			this.getView().setModel(oModel);
		},

		changeEnforceSmall: function (oEvent) {
			var oSwitch = oEvent.getSource();
			this.getView().getModel().setProperty("/sizeBehavior", oSwitch.getState() ? "Small" : "Responsive");
		},

		press: function (evt) {
			var oTile = evt.getSource(),
				sTileName = oTile.getHeader() || oTile.getTooltip();

			if (evt.getParameter("action") === "Remove") {
				MessageToast.show("Remove action of GenericTile \"" + sTileName + "\" has been pressed.");
			} else {
				MessageToast.show("The GenericTile \"" + sTileName + "\" has been pressed.");
			}
		},

		pressSlideTile: function (evt) {
			var oTile = evt.getSource();

			if (evt.getParameter("action") === "Remove") {
				MessageToast.show("Remove action of SlideTile \"" + oTile.getTooltip() + "\" has been pressed.");
			} else {
				MessageToast.show("The SlideTile \"" + oTile.getTooltip() + "\" has been pressed.");
			}
		}
	});

	return PageController;
});
