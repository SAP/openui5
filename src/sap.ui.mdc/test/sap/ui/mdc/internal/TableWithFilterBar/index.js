sap.ui.define([
	"sap/ui/core/ComponentContainer",
	"sap/base/util/UriParameters"
], function (ComponentContainer, UriParameters) {
	"use strict";

	var oUriParams = new UriParameters(window.location.href),
	sManifest = oUriParams.get("opa") === true ? "opa-manifest.json" : "manifest.json";

	new ComponentContainer({
		name: "sap.ui.v4demo",
		settings : {
			id : "v4demo"
		},
		async: true,
		manifest: sManifest
	}).placeAt("content");
});