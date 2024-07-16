// Note: the HTML page 'index.html' loads this module via data-sap-ui-on-init

sap.ui.define([
	"sap/ui/core/Core",
	"appUnderTest/server",
	"sap/m/Shell",
	"sap/ui/core/ComponentContainer"
], function (Core, server, Shell, ComponentContainer) {
	"use strict";

	Core.ready().then(function () {
		// start fake server
		server.init();

		// start app
		new Shell({
			app: new ComponentContainer({
				name : 'appUnderTest',
				settings : {
					id : "appUnderTest"
				}
			})
		}).placeAt("content");
	});
});