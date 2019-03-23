sap.ui.require([
	"sap/ui/core/ComponentContainer"
], function(
	ComponentContainer
) {
	"use strict";

	sap.ui.getCore().attachInit(function() {
		new ComponentContainer({
			height: "100%",
			width: "100%",
			name: "cp.opa.test.app"
		}).placeAt("content");
	});
});
