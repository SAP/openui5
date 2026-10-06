sap.ui.define([
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/Component",
	"sap/ui/rta/test/mockserver"
], async (ComponentContainer, Component, MockServer) => {
	"use strict";

	// start the MockServers before the Component is created, since the OData models are
	// declared in the manifest and instantiated during Component construction
	await MockServer.init();

	// initialize the UI component
	const oComponent = await Component.create({
		name: "sap.ui.rta.test",
		id: "Comp1",
		componentData: {
			showAdaptButton: true
		}
	});
	new ComponentContainer({
		async: true,
		component: oComponent
	}).placeAt("content");
});