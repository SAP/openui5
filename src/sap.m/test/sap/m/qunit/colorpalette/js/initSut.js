sap.ui.require([
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/Core"
], function(
	ComponentContainer,
	Core
) {
	"use strict";

	Core.ready(function() {
		new ComponentContainer({
			height: "100%",
			width: "100%",
			name: "cp.opa.test.app"
		}).placeAt("content");
	});
});
