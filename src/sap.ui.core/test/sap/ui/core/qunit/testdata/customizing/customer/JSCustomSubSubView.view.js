sap.ui.define(['sap/ui/commons/TextView', 'sap/ui/core/mvc/JSView'],
	function(TextView, JSView) {
	"use strict";

	sap.ui.jsview("testdata.customizing.customer.JSCustomSubSubView", {

		createContent : function(oController) {

			return [new TextView({text: "I am the customer replacement"}),
			        sap.ui.extensionpoint(this, "extension44")];
		}
	});

});
