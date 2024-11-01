sap.ui.define(["sap/ui/core/UIComponent"],
	function(UIComponent) {
	"use strict";

	// This component is used in a deprecated test to test the legacy feature
	// ui5lint-disable-next-line async-component-flags
	var Component = UIComponent.extend("testdata.inherit.parent.Component", {
		metadata: "json"
	});

	return Component;
});
