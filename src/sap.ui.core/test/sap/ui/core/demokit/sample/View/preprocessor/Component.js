sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/core/mvc/View"
],
function(UIComponent, View) {
	"use strict";

	return UIComponent.extend("sap.ui.core.sample.View.preprocessor.Component", {

		metadata: {
			manifest: "json",
			interfaces: [
				"sap.ui.core.IAsyncContentCreation"
			]
		},
		createContent: function () {
			return View.create({ viewName: "module:sap/ui/core/sample/View/preprocessor/SampleView"});
		}
	});
});
