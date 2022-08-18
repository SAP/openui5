/*
* @${copyright}
*/

sap.ui.define(["sap/ui/core/UIComponent", "sap/ui/core/mvc/ViewType"], function(UIComponent, ViewType) {
	"use strict";
	return UIComponent.extend("testComponent.Component", {
		init: function() {
			UIComponent.prototype.init.apply(this, arguments);
		},

		createContent: function() {
			var view = sap.ui.view({
				id: this.createId("myView"),
				viewName: "testComponent.View",
				type: ViewType.XML,
				async: false // test timing
			});

			return view;
		}
	});
});
