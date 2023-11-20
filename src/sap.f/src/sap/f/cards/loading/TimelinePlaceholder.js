/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/f/cards/loading/PlaceholderBase",
	"./TimelinePlaceholderRenderer"
], function (PlaceholderBase, TimelinePlaceholderRenderer) {
	"use strict";

	/**
	 * Constructor for a new <code>TimelinePlaceholder</code>.
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
	 * @since 1.106
	 * @alias sap.f.cards.loading.TimelinePlaceholder
	 */
	var TimelinePlaceholder = PlaceholderBase.extend("sap.f.cards.loading.TimelinePlaceholder", {
		metadata: {
			library: "sap.f",
			properties: {

				/**
				 * The minimum number of items set to the timeline.
				 */
				minItems: {
					type : "int",
					group : "Misc"
				},

				/**
				 * Item template form the timeline.
				 */
				item: {
					type: "any"
				},

				itemHeight: {
					type: "sap.ui.core.CSSSize"
				}
			}
		},
		renderer: TimelinePlaceholderRenderer
	});

	return TimelinePlaceholder;
});
