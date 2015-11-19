sap.ui.define(['sap/ui/core/mvc/Controller'],
function(Controller) {
	"use strict";

	return Controller.extend("appUnderTest.view.Main", {

		onInit: function () {
			var oButton = this.byId("navigationButton");
			setTimeout(function () {
				// Opa will wait until the button is not busy
				oButton.setBusy(false);
			}, 5000);
		},

		onNavButtonPress : function () {
			this.byId("myApp").to(this.byId("secondPage").getId());
		}

	});

});
