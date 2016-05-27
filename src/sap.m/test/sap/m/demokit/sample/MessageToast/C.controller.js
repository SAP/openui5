sap.ui.define(['sap/m/MessageToast','sap/ui/core/mvc/Controller'],
	function(MessageToast, Controller) {
	"use strict";

	var CController = Controller.extend("sap.m.sample.MessageToast.C", {

		handleMessageToastPress: function(oEvent) {
			var msg = 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy\r\n eirmod.';
			MessageToast.show(msg);
		}
	});


	return CController;

});
