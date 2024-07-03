sap.ui.define(["sap/ui/core/Component"],
	function(Component) {
	"use strict";

	var EmbeddedComponent = Component.extend("testdata.embedded.Component", {
		manifest: true
	});
	return EmbeddedComponent;
});
