/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/ComponentContainer"
], function (ComponentContainer) {
	"use strict";

		new ComponentContainer({
			name: "sap.f.cardsdemo",
			settings: {
				id: "cardsplayground"
			},
			manifest: true
		}).placeAt("content");
});