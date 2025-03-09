sap.ui.define(["sap/ui/core/UIComponent"],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("testdata.other.reuse.Component", {
		metadata : {
			manifest: "json"
		}
	});

	return Component;
});
