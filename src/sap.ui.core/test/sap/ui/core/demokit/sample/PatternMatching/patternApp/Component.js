sap.ui.define(['jquery.sap.global', 'sap/ui/core/UIComponent', 'sap/ui/core/mvc/View'],
	function(jQuery, UIComponent, View) {
	"use strict";

	
	var Component = UIComponent.extend("patternApp.Component", {

		createContent : function () {
			return sap.ui.view({
				viewName : "patternApp.view.PatternTable",
				type : "XML"
			});
		}

	});

	return Component;

});
