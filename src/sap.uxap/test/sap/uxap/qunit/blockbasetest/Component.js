sap.ui.define([
	"sap/ui/core/UIComponent"
], function (UIComponent) {
	"use strict";

	var Component = UIComponent.extend("blockbasetest.Component", {

		createContent: function () {
			return sap.ui.view({
				viewName: "blockbasetest.Main",
				type: "XML"
			});
		}
	});
	return Component;
}, true);
