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
	return UIComponent.extend("testComponentAsync.Component", {
		init: function() {
			sap.ui.core.UIComponent.prototype.init.apply(this, arguments);
		},

		createContent: function() {
			return XMLView.create({
				id: "myView",
				viewName: "testComponentAsync.View"
			});
		}
	});
});
