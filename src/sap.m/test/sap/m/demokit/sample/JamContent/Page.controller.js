sap.ui.define(['jquery.sap.global', 'sap/ui/core/mvc/Controller', 'sap/m/MessageToast'],
	function(jQuery, Controller, MessageToast) {
	"use strict";
	var PageController = Controller.extend("sap.m.sample.JamContent.Page", {
		press : function(evt) {
			MessageToast.show("The news content is pressed.");
		}
	});
	return PageController;
});