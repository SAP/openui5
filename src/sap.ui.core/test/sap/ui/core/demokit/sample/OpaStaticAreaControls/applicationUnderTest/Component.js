sap.ui.define([
	'sap/ui/core/UIComponent'
], function(UIComponent) {
	"use strict";

	return UIComponent.extend("appUnderTest.Component", {
		metadata: {
			rootView: {
				id: "mainView",
				viewName: "view.Main",
				type: "XML"
			}
		}
	});
});
