sap.ui.define(['sap/ui/core/mvc/Controller'],
function(Controller) {
	"use strict";

	return Controller.extend("appUnderTest.view.Main", {

		onInit : function () {
			var that = this;

			window.setTimeout(function () {
				that.byId("changingButton").setText("Changed text");
			},5000);
		}

	});

});
