/*
* @${copyright}
*/

sap.ui.define(["sap/ui/core/UIComponent", "sap/ui/core/mvc/XMLView"], function(UIComponent, XMLView) {
	"use strict";
	return UIComponent.extend("testComponent.Component", {
		init: function() {
			UIComponent.prototype.init.apply(this, arguments);
		},
		metadata: {
			interfaces: ["sap.ui.core.IAsyncContentCreation"],
			manifest: "json"
		},
		createContent: function() {
			return XMLView.create({
				id: "myView",
				viewName: "testComponent.View"
			});
		}
	});
});
