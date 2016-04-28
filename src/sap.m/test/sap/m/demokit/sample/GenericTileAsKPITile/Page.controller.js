sap.ui.define(['jquery.sap.global', 'sap/ui/core/mvc/Controller', 'sap/m/MessageToast'],
	function(jQuery, Controller, MessageToast) {
	"use strict";

	var PageController = Controller.extend("sap.m.sample.GenericTileAsKPITile.Page", {
		press : function(evt) {
			MessageToast.show("The GenericTile is pressed.");
		}
	});

	return PageController;
});