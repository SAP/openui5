sap.ui.define(['sap/ui/core/mvc/Controller', 'sap/m/MessageToast'],
	function(Controller, MessageToast) {
	"use strict";

	var PageController = Controller.extend("sap.m.sample.GenericTileStates.Page", {
		press : function(evt) {
			MessageToast.show("The generic tile is pressed.");
		}
	});

	return PageController;
});