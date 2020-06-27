/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/ComponentContainer"
], function (ComponentContainer) {
	"use strict";

	new ComponentContainer({
		name: "sap.ui.v4demo",
		settings : {
			id : "v4demo"
		},
		async: true
	}).placeAt("content");
});
