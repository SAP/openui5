sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	return UIComponent.extend("sap.m.sample.Table.Component", {
		metadata : {
			manifest: "json"
		},

		getTable: function () {
			return this.getRootControl().getContent()[0];
		}
	});
});
