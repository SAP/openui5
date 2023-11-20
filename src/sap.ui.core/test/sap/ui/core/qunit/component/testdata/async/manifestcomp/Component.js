sap.ui.define(['sap/ui/core/Component'],
	function(Component) {
	"use strict";
	var ManifestComponent = Component.extend("sap.test.manifestcomp.Component", {
		metadata : {
			manifest: "json"
		}
	});
	return ManifestComponent;
});
