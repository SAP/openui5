sap.ui.define([
		'sap/ui/core/UIComponent',
		'sap/ui/core/mvc/View'],
	function(UIComponent) {
	"use strict";

	return UIComponent.extend("sap.ui.sample.appUnderTest.Component", {

		createContent : function () {
			return sap.ui.view({
				viewName : "sap.ui.sample.appUnderTest.view.Main",
				type : "XML"
			});
		}

	});

	}
);
