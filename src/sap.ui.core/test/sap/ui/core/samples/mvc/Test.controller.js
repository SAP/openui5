sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/m/MessageToast'
], function(Controller, MessageToast) {
	"use strict";

	return Controller.extend("sap.ui.core.mvctest.Test", {

		onInit: function(oEvent) {
			MessageToast.show(oEvent.getSource().getId() + ": Test controller init");
		},


		doIt: function(oEvent) {
			MessageToast.show(oEvent.getSource().getId() + ": does it!");
		},


		onBeforeRendering: function(oEvent) {
			MessageToast.show(oEvent.getSource().getId() + ": Test controller onBeforeRendering");
		},

		onAfterRendering: function(oEvent) {
			MessageToast.show(oEvent.getSource().getId() + ": Test controller onAfterRendering");
		},

		onExit: function(oEvent) {
			MessageToast.show(oEvent.getSource().getId() + ": Test controller exit");
		}

	});

});
