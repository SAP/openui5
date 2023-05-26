sap.ui.require([
	"sap/m/App",
	"sap/m/Page",
	"sap/ui/core/ComponentContainer"
], function(
	App,
	Page,
	ComponentContainer
) {
	"use strict";

	sap.ui.getCore().attachInit(function() {
		new App({
			pages: [
				new Page({
					title: "Context-Based Adaptation",
					enableScrolling: true,
					content: [
						new ComponentContainer({
							name: "sap.ui.rta.contextBased",
							settings: {
								id: "ContextBasedAdaptationContainer"
							},
							manifest: true
						})
					]
				})
			]
		}).placeAt("content");
	});
});
