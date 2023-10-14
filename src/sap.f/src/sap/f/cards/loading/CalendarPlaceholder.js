/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/f/cards/loading/ListPlaceholder",
	"./CalendarPlaceholderRenderer"
], function (ListPlaceholder, CalendarPlaceholderRenderer) {
	"use strict";

	/**
	 * Constructor for a new <code>CalendarPlaceholder</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 *
	 * @extends sap.f.cards.loading.ListPlaceholder
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.99
	 * @alias sap.f.cards.loading.CalendarPlaceholder
	 */
	var CalendarPlaceholder = ListPlaceholder.extend("sap.f.cards.loading.CalendarPlaceholder", {
		metadata: {
			library: "sap.f",
			properties: {
				/**
				 * The maxLegendItems set to the legend items.
				 */
				maxLegendItems: {
					type : "int",
					group : "Misc"
				},

				/**
				 * Item template form the list.
				 */
				item: {
					type: "any"
				},

				/**
				 * Legend item template form the list.
				 */
				legendItem: {
					type: "any"
				}
			}
		},
		renderer: CalendarPlaceholderRenderer
	});

	return CalendarPlaceholder;
});
