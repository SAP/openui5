sap.ui.define(['jquery.sap.global', 'sap/ui/core/mvc/Controller', 'sap/m/MessageToast'],
	function(jQuery, Controller,MessageToast) {
		"use strict";
		var PageController = Controller.extend("sap.m.sample.NumericContentDifSizes.Page", {
			press : function(evt) {
				MessageToast.show("The numeric content is pressed.");
			}
		});
		return PageController;
});