sap.ui.define(['sap/ui/core/mvc/Controller'],
	function(Controller) {
	"use strict";

	return Controller.extend("sap.ui.core.mvctest.Test", {
	
		onInit: function(oEvent) {
			alert(oEvent.getSource().getId() + ": Test controller init");
			function onPress(oEvent) {
				alert("pressed");
			}
		},


		doIt: function(oEvent) {
			alert(oEvent.getSource().getId() + ": does it!");
		},


		onBeforeRendering: function(oEvent) {
			alert(oEvent.getSource().getId() + ": Test controller onBeforeRendering");
		},

		onAfterRendering: function(oEvent) {
			alert(oEvent.getSource().getId() + ": Test controller onAfterRendering");
		},

		onExit: function(oEvent) {
			alert(oEvent.getSource().getId() + ": Test controller exit");
		}

	});

});
