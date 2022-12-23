sap.ui.define([
	"sap/m/Text",
	"sap/ui/core/mvc/JSView"
],
	function(TextView, JSView) {
	"use strict";

	sap.ui.jsview("testdata.customizing.sync_legacyAPIs.jsview.customer.JSCustomSubSubView", {

		createContent : function(oController) {

			return [
				new Text({text: "I am the customer replacement"}),
				sap.ui.extensionpoint(this, "extension44")
			];
		}
	});

});
