sap.ui.define(['sap/ui/core/UIComponent', 'sap/ui/core/mvc/View'],
	function(UIComponent, View) {
	"use strict";

	var Component = UIComponent.extend("appUnderTest.Component", {

		createContent : function () {
			return sap.ui.view({
				viewName : "view.Main",
				type : "XML"
			});
		}

	});

	return Component;

});
