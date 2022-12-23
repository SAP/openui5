sap.ui.define(['sap/m/Text', 'sap/ui/core/mvc/JSView'],
	function(Text, JSView) {
	"use strict";

	sap.ui.jsview("samples.components.ext_legacyAPIs.customer.JSCustomSubSubView", {

		createContent : function(oController) {

			return [
				new Text({
					text: "I am the customer replacement"
				}),
				sap.ui.extensionpoint(this, "extension44")
			];
		}
	});

});
