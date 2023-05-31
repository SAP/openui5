/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/f/cards/loading/PlaceholderBase",
	"./AnalyticalPlaceholderRenderer"
], function (PlaceholderBase, AnalyticalPlaceholderRenderer) {
	"use strict";

	/**
	 * Constructor for a new <code>AnalyticalPlaceholder</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.108
	 * @alias sap.f.cards.loading.AnalyticalPlaceholder
	 */
	var AnalyticalPlaceholder = PlaceholderBase.extend("sap.f.cards.loading.AnalyticalPlaceholder", {
		metadata: {
			library: "sap.f",
			properties: {
				chartType: {
					type : "string",
					defaultValue: ""
				},
				minHeight: {
					type : "string",
					defaultValue: ""
				}
			}
		},
		renderer: AnalyticalPlaceholderRenderer
	});

	return AnalyticalPlaceholder;
});
