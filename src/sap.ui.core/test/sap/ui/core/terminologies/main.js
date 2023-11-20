/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/i18n/Localization",
	'sap/ui/core/Component',
	"sap/ui/core/ComponentContainer"
], function (Localization, Component, ComponentContainer) {
	"use strict";

	var oUriParameters = new URLSearchParams(window.location.search);

	// set the default language to "de" if parameter is not present
	if (!oUriParameters.get("sap-ui-language")) {
		Localization.setLanguage("de");
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