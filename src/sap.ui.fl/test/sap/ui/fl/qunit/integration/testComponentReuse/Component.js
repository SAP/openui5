/*
* @${copyright}
*/

sap.ui.define(["sap/ui/core/UIComponent", "sap/ui/core/mvc/ViewType"], function(UIComponent, ViewType) {
	"use strict";
	return UIComponent.extend("sap.ui.fl.qunit.integration.testComponentReuse.Component", {
		init: function() {
			UIComponent.prototype.init.apply(this, arguments);
		},

		createContent: function() {
			var view = sap.ui.view({
				id: this.createId("myView"),
				viewName: "sap.ui.fl.qunit.integration.testComponentReuse.View",
				type: ViewType.XML,
				async: false // test timing
			});

			return view;
		}
	});
});
