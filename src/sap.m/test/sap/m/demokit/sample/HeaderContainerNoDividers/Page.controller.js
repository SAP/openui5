sap.ui.define([ 'jquery.sap.global', 'sap/m/MessageToast', 'sap/ui/core/mvc/Controller' ],
	function(jQuery, MessageToast, Controller, JSONModel) {
	"use strict";

	var PageController = Controller.extend("sap.m.sample.HeaderContainerNoDividers.Page", {
		press : function(evt) {
			MessageToast.show("Fire press");
		}
	});

	return PageController;
});