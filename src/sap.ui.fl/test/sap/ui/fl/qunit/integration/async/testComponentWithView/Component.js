 /*
* @${copyright}
*/

sap.ui.define([ "sap/ui/core/UIComponent"], function(UIComponent) {
	"use strict";
	return UIComponent.extend("sap.ui.fl.qunit.integration.async.testComponentWithView.Component", {
		init : function() {
			UIComponent.prototype.init.apply(this, arguments);
		},

		createContent: function () {
			return sap.ui.view(this.createId("rootView"), {
				viewName : "sap.ui.fl.qunit.integration.async.testComponentWithView.View",
				type : sap.ui.core.mvc.ViewType.XML,
				async: this.getComponentData().async || false,
				height: "100%",
                cache: {
				    keys: [this.getComponentData().cacheKey]
				}
			});
		}
	});
});
