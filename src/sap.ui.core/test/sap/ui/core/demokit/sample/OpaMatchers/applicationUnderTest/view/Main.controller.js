sap.ui.define(['sap/ui/core/mvc/Controller'],
	function(Controller) {
	"use strict";

	var MainController = Controller.extend("view.Main", {

		onInit : function () {
			var that = this;

			window.setTimeout(function () {
				that.byId("changingButton").setText("Changed text");
			},5000);
		}

	});

	return MainController;

});
