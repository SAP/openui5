sap.ui.define(["./parent/Component"],
	function(Component1) {
	"use strict";

	// This component is used in a deprecated test to test the legacy feature
	// ui5lint-disable-next-line async-component-flags
	var Component = Component1.extend("testdata.inherit.Component", {
		metadata: "json"
	});

	return Component;
});
