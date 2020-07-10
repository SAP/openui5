/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/core/ComponentContainer"
], function (Core, ComponentContainer) {
	"use strict";

	Core.attachInit(function () {
		new ComponentContainer({
			name: "sap.f.cardsdemo",
			settings: {
				id: "cardsplayground"
			}
		}).placeAt("content");
	});
});