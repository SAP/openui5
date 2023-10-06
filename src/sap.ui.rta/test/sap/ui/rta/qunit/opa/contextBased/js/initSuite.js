sap.ui.require([
	"sap/m/App",
	"sap/m/Page",
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/Core"
], function(
	App,
	Page,
	ComponentContainer,
	Core
) {
	"use strict";

	Core.ready().then(() => {
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
