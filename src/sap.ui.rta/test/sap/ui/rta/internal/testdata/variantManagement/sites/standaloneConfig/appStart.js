sap.ui.require([
	"sap/m/Shell",
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/Component",
	"sap/ui/core/Core"
], function(Shell, ComponentContainer, Component, Core) {
	"use strict";
	return Core.ready().then(() => {
		return Component.create({
			name: "sap.ui.rta.test.variantManagement"
		});
	}).then((oComponent) => {
		return new ComponentContainer({
			height: "100%",
			component: oComponent,
			async: true
		});
	}).then((oComponentContainer) => {
		// initialize the UI component
		return new Shell({
			app: oComponentContainer
		}).placeAt("content");
	});
});