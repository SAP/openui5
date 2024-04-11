sap.ui.define([
	"sap/ushell/Container"
], async function(
	Container
) {
	"use strict";

	const oContent = await Container.createRendererInternal(null);
	oContent.placeAt("content");
});