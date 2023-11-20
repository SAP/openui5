/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/ComponentContainer"
], function (ComponentContainer) {
	"use strict";

	new ComponentContainer({
		name: "sap.ui.mdc.ActionToolbarTesting",
		manifest: true,
		height: "100%",
		settings : {
			id : "ActionToolbarTesting"
		},
		async: true
	}).placeAt("content");
});
