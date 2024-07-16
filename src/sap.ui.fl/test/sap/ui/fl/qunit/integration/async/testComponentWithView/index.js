sap.ui.define([
	"sap/ui/core/Component",
	"sap/m/Shell",
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/Core"
], function (Component, Shell, ComponentContainer, Core) {
	"use strict";
	Core.ready().then(() => {
		return Component.create({
			name: "sap.ui.fl.qunit.integration.async.testComponentWithView",
			id: "sap.ui.fl.qunit.integration.async.testComponentWithView",
			manifest: true,
			componentData: {
				async: true
			}
		});
	}).then(function(oComponent) {
		// initialize the UI component
		new Shell({
			app: new ComponentContainer({
				height: "100%",
				component: oComponent
			})
		}).placeAt("content");
	})
});