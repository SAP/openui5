sap.ui.define(['sap/m/Text', 'sap/ui/core/mvc/View'],
	function(Text, View) {
	"use strict";

	return View.extend("testdata.customizing.customer.TypedCustomSubSubView", {
		createContent : function(oController) {
			return [
				new Text({text: "I am the customer replacement"}),
				sap.ui.extensionpoint(this, "extension44Typed")
			];
		}
	});
});
