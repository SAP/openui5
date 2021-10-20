sap.ui.define(['sap/m/Text', 'sap/ui/core/Fragment'],
	function(Text, Fragment) {
	"use strict";

	sap.ui.jsfragment("testdata.customizing.customer.CustomTextFrag", {

		createContent : function(oController) {
			var oText = new Text("iHaveCausedDestruction", {
				text : "Hello World"
			});
			return oText;
		}

	});

});
