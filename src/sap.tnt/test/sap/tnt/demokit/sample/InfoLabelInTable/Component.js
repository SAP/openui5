sap.ui.define(["sap/ui/core/UIComponent", "sap/ui/core/mvc/XMLView"],
	function(UIComponent, XMLView) {
	'use strict';

	var Component = UIComponent.extend("sap.tnt.sample.InfoLabelInTable.Component", {
		metadata : {
			manifest: "json"
		},
		getTable : function () {
			return this.getRootControl().getContent()[0];
		}
	});

	return Component;
});