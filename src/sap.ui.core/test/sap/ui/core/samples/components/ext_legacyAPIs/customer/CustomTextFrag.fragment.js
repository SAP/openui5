sap.ui.define(['sap/m/Text', 'sap/ui/core/Fragment'],
	function(Text, Fragment) {
	"use strict";

	sap.ui.jsfragment("samples.components.ext_legacyAPIs.customer.CustomTextFrag", {

		createContent : function(oController) {
			var oText = new Text("iHaveCausedDestruction", {
				text : "Hello World"
			});
			return oText;
		}

	});

});
