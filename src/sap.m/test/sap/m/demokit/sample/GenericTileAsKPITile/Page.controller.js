sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast"
], function (Controller, MessageToast) {
	"use strict";

	var PageController = Controller.extend("sap.m.sample.GenericTileAsKPITile.Page", {
		onPress: function (oEvent) {
			MessageToast.show("The tile is pressed.");
		}
	});

	return PageController;
});