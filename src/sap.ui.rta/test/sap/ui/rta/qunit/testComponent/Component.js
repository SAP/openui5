/*
* @${copyright}
*/

sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/core/mvc/ViewType",
	"sap/ui/core/mvc/View"
], function(
	UIComponent,
	ViewType,
	View
) {
	"use strict";
	return UIComponent.extend("testComponent.Component", {
		metadata: {
			interfaces: ["sap.ui.core.IAsyncContentCreation"],
			manifest: "json"
		},
		init(...aArgs) {
			UIComponent.prototype.init.apply(this, aArgs);
		},

		createContent() {
			const view = new View({
				id: this.createId("myView"),
				viewName: "testComponent.View",
				type: ViewType.XML,
				async: true
			});

			return view;
		}
	});
});