sap.ui.define(["sap/ui/core/Component"],
	function(Component) {
	"use strict";

	var EmbeddedComponent = Component.extend("testdata.embedded.Component", {
		metadata: {
			manifest: "json"
		}
	});
	return EmbeddedComponent;
});
