sap.ui.define([ 'sap/m/MessageToast', 'sap/ui/core/mvc/Controller' ],
	function(MessageToast, Controller) {
	"use strict";

	var PageController = Controller.extend("sap.m.sample.HeaderContainerVM.Page", {
		press : function(evt) {
			MessageToast.show("Fire press");
		}
	});

	return PageController;
});