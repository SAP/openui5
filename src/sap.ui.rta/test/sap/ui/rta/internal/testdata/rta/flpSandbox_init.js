sap.ui.define([
	"sap/ushell/Container",
	"sap/ui/rta/test/mockserver"
], async function(
	Container,
	MockServer
) {
	"use strict";

	// start the MockServers before the FLP loads the app Component, since the OData models
	// are declared in the manifest and instantiated during Component construction
	await MockServer.init();

	const oContent = await Container.createRendererInternal(null);
	oContent.placeAt("content");
});