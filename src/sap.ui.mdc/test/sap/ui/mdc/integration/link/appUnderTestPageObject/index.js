/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/ComponentContainer"
], function (ComponentContainer) {
	"use strict";

	new ComponentContainer({
		name: "sap.ui.mdc.LinkIntegrationTesting.appUnderTestPageObject",
		manifest: true,
		height: "100%",
		settings : {
			id : "LinkIntegrationTesting.appUnderTestPageObject"
		},
		async: true
	}).placeAt("content");
});
