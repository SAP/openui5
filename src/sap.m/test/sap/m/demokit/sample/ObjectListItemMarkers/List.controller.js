sap.ui.define([
		'sap/m/MessageToast',
		'sap/ui/core/mvc/Controller'
	], function(MessageToast, Controller) {
	"use strict";

	return Controller.extend("sap.m.sample.ObjectListItemMarkers.List", {

		onListItemPress: function (oEvent) {
			MessageToast.show("Pressed : " + oEvent.getSource().getTitle());
		}
	});
});
