sap.ui.define([
	"sap/ui/core/UIComponent"
], function (UIComponent) {
	"use strict";

	return UIComponent.extend("sap.tnt.sample.InfoLabelInTable.Component", {

		metadata: {
			manifest: "json"
		},

		getTable: function () {
			return this.getRootControl().getContent()[0];
		}

	});
});