sap.ui.require([
	"sap/m/App",
	"sap/m/Page",
	"sap/ui/core/ComponentContainer"
], function (
	App,
	Page,
	ComponentContainer
) {
	"use strict";

	sap.ui.getCore().attachInit(function () {
		new App({
			pages: [
				new Page({
					title: "App Context Dialog",
					enableScrolling: true,
					content: [
						new ComponentContainer({
							name: "sap.ui.rta.appcontext",
							settings: {
								id: "AppContextDialog"
							},
							manifest: true
						})
					]
				})
			]
		}).placeAt("content");
	});
});
