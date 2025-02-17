/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/m/p13n/FilterPanel"
], (FilterPanel) => {
	"use strict";

	return FilterPanel.extend("sap.ui.mdc.p13n.panels.FilterPanel", {
		metadata: {
			library: "sap.ui.mdc"
		},
		renderer: {
			apiVersion: 2
		}
	});
});