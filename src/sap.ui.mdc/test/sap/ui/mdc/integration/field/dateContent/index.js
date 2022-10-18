/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/ComponentContainer"
], function (ComponentContainer) {
	"use strict";

	new ComponentContainer({
		name: "sap.ui.mdc.integration.field.dateContent",
		manifest: true,
		height: "100%",
		settings : {
			id : "DateContent"
		},
		async: true
	}).placeAt("content");
});
