sap.ui.define(['jquery.sap.global', 'sap/ui/core/Component'],
	function(jQuery, Component) {
	"use strict";
	var ManifestComponent = Component.extend("sap.test.manifestcomp.Component", {
		metadata : {
			manifest: "json"
		}
	});
	return ManifestComponent;
});
