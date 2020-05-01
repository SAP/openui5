sap.ui.define([ 'sap/m/MessageToast', 'sap/ui/core/mvc/Controller' ],
	function(MessageToast, Controller) {
	"use strict";

	var PageController = Controller.extend("sap.m.sample.HeaderContainerNoDividers.Page", {
		onInit: function() {
			var oHeaderContainer = this.byId("headerContainer");

			for (var i = 1; i <= 8; i++) {
				oHeaderContainer.addAriaLabelledBy(this.byId("text" + i));
			}
		},
		press : function(evt) {
			MessageToast.show("Fire press");
		}
	});

	return PageController;
});