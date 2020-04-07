 /*
* @${copyright}
*/

sap.ui.define(["sap/ui/core/UIComponent"], function(UIComponent) {
	"use strict";
	return UIComponent.extend("testComponent.Component", {
		init : function() {
			sap.ui.core.UIComponent.prototype.init.apply(this, arguments);
		},

		createContent: function() {
			var view = sap.ui.view({
				id: this.createId("myView"),
				viewName: "testComponent.View",
				type: sap.ui.core.mvc.ViewType.XML,
				async: false // test timing
			});

			return view;
		}
	});
});
