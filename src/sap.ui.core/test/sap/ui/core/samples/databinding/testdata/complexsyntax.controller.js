sap.ui.define(['sap/ui/core/mvc/Controller', 'sap/m/MessageToast'],
	function(Controller) {
	"use strict";

	var complexsyntaxController = Controller.extend("testdata.complexsyntax", {

		onInit: function() {
			//MessageToast.show("Dev controller init");

			/*
			function onPress(oEvent) {
				MessageToast.show("pressed");
			} */

			//this.getElementByLocalId(id).attachPress(onPress);
		},


		doIt: function(oEvent) {
			//MessageToast.show(oEvent.getSource().getId() + " does it!");
		},


		onBeforeRendering: function() {
		//	MessageToast.show("Dev controller onBeforeRendering");
		},

		onAfterRendering: function() {
			//MessageToast.show("Dev controller onAfterRendering");
		},

		onExit: function() {
			//MessageToast.show("Dev controller exit");
		},

		myFormatter: function(sName) {
			return sName.toUpperCase();
		},

		myGenderFormatter: function(sGender) {
			var sValue = 'Mr.';
			if (sGender === "female") {
				sValue = 'Mrs.';
			}
			return sValue;
		}

	});

	return complexsyntaxController;

});
