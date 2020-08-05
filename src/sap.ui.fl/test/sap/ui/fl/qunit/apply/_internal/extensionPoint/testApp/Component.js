sap.ui.define(['jquery.sap.global', 'sap/ui/core/UIComponent'],
function(jQuery, Component1) {
	"use strict";

	var Component = Component1.extend("sap.ui.fl.qunit.extensionPoint.testApp.Component", {

		metadata: {
			version: "1.0",
			rootView: {
				viewName: "sap.ui.fl.qunit.extensionPoint.testApp.view.Main",
				type: "XML",
				id: "mainView"
			},
			customizing: {},
			manifest: "json"
		}
	});
	return Component;
});