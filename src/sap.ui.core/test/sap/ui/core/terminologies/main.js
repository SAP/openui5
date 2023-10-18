/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/ui/core/Component',
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/Configuration"
], function (Component, ComponentContainer, Configuration) {
	"use strict";

	var oUriParameters = new URLSearchParams(window.location.search);

	// set the default language to "de" if parameter is not present
	if (!oUriParameters.get("sap-ui-language")) {
		Configuration.setLanguage("de");
	}

	// set the manifest used
	var sManifestParam = oUriParameters.get("manifest");
	var sManifest = sManifestParam ? sManifestParam + "/manifest.appdescr" : true;
	Component.create({
		name: "sap.ui.demo.terminologies",
		manifest: sManifest
	}).then(function(oComponent) {
		var oContainer = new ComponentContainer({
			component: oComponent
		});
		oContainer.placeAt("content");
	});

});