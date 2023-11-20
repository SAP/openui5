/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/f/cards/loading/PlaceholderBase",
	"./ListPlaceholderRenderer"
], function (PlaceholderBase, ListPlaceholderRenderer) {
	"use strict";

	/**
	 * Constructor for a new <code>ListPlaceholder</code>.
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
	 * @since 1.76
	 * @alias sap.f.cards.loading.ListPlaceholder
	 */
	var ListPlaceholder = PlaceholderBase.extend("sap.f.cards.loading.ListPlaceholder", {
		metadata: {
			library: "sap.f",
			properties: {

				/**
				 * The minimum number of items set to the list.
				 */
				minItems: {
					type : "int",
					group : "Misc"
				},

				/**
				 * The presence of icon
				 */
				hasIcon: {
					type: "boolean"
				},

				/**
				 * The presence of description
				 */
				hasDescription: {
					type: "boolean"
				},

				/**
				 * The number of the attributes
				 */
				attributesLength: {
					type: "int",
					defaultValue: 0
				},

				/**
				 * The presence of Chart
				 */
				hasChart: {
					type: "boolean"
				},

				/**
				 * The presence of actions strip
				 */
				hasActionsStrip: {
					type: "boolean"
				},

				itemHeight: {
					type: "sap.ui.core.CSSSize"
				}
			}
		},
		renderer: ListPlaceholderRenderer
	});

	return ListPlaceholder;
});
