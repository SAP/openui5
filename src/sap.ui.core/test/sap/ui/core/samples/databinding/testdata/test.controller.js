sap.ui.define(['sap/ui/core/mvc/Controller', 'sap/m/MessageToast'],
	function(Controller, MessageToast) {
	"use strict";

	var testController = Controller.extend("testdata.test", {

		onInit: function() {
		 //MessageToast.show("Dev controller init");
			/*
			function onPress(oEvent) {
				MessageToast.show("pressed");
			}
			*/
			//this.getElementByLocalId(id).attachPress(onPress);
		},


		doIt: function(oEvent) {
			MessageToast.show(oEvent.getSource().getId() + " does it!");
		},


		onBeforeRendering: function() {
			MessageToast.show("Dev controller onBeforeRendering");
		},

		onAfterRendering: function() {
			//MessageToast.show("Dev controller onAfterRendering");
		},

		onExit: function() {
			MessageToast.show("Dev controller exit");
		}

	});

	return testController;

});
