sap.ui.define(['sap/ui/core/ExtensionPoint', 'sap/m/Text', 'sap/ui/core/mvc/View'],
	function(ExtensionPoint, Text, View) {
	"use strict";

	return View.extend("testdata.customizing.customer.TypedCustomSubSubView", {
		createContent : function() {
			return ExtensionPoint.load({
				container: this,
				name: "extension44Typed"
			}).then(function(oResult){
				return [
					new Text({text: "I am the customer replacement"}),
					oResult
				];
			});
		}
	});
});
