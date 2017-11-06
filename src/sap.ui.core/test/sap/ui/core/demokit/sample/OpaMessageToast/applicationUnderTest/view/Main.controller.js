sap.ui.define([
	'sap/m/MessageToast',
	"sap/ui/core/mvc/Controller"	
], function (MessageToast, Controller) {
	"use strict";

	var MainController = Controller.extend("view.Main", {
		handleMessageToastPress: function(oEvent) {
			var msg = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam volutpat ultricies varius.';
			MessageToast.show(msg);
		}
	});

	return MainController;

});
