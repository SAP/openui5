// Note: the HTML page 'Patterns.html' loads this module via data-sap-ui-on-init

sap.ui.define(["sap/ui/core/Core", "sap/ui/core/ComponentContainer"], function(Core, ComponentContainer) {
	"use strict";
	Core.ready().then(function() {
		new ComponentContainer({
			height : "100%",
			name : "patternApp",
			settings : {
				id : "patternApp"
			}
		}).placeAt("content");
	});
});