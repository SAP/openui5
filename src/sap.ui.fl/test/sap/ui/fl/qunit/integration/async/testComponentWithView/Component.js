 /*
* @${copyright}
*/

sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/core/mvc/XMLView"
], function(
	UIComponent,
	XMLView
) {
	"use strict";
	return UIComponent.extend("sap.ui.fl.qunit.integration.async.testComponentWithView.Component", {
		init: function() {
			UIComponent.prototype.init.apply(this, arguments);
		},

		createContent: function () {
			this.oViewPromise = XMLView.create({
				viewName: "sap.ui.fl.qunit.integration.async.testComponentWithView.View",
				id: this.createId("rootView"),
				height: "100%",
				cache: {
					keys: [this.getComponentData().cacheKey]
				}
			}).then(function(oView) {
				return oView;
			});
		}
	});
});
