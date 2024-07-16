// Note: the HTML page 'RoutingFullscreen.html' loads this module via data-sap-ui-on-init

sap.ui.define(["sap/ui/core/Core", "sap/ui/core/ComponentContainer"], function(Core, ComponentContainer) {
	"use strict";
	Core.ready().then(function() {
		new ComponentContainer({
			height : "100%",
			name : "sap.ui.core.sample.RoutingFullscreen.routingApp",
			settings : {
				id : "routingApp"
			}
		}).placeAt("content");
	});
});