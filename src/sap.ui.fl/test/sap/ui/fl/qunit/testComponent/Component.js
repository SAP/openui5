/*
* @${copyright}
*/

sap.ui.define(["sap/ui/core/UIComponent", "sap/ui/core/mvc/XMLView"], function(UIComponent, XMLView) {
	"use strict";
	return UIComponent.extend("testComponent.Component", {
		init(...aArgs) {
			UIComponent.prototype.init.apply(this, aArgs);
		},
		metadata: {
			interfaces: ["sap.ui.core.IAsyncContentCreation"],
			manifest: "json"
		},
		createContent() {
			return XMLView.create({
				id: "myView",
				viewName: "testComponent.View"
			});
		}
	});
});
