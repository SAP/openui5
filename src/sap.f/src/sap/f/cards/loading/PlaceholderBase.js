/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/core/Core",
	"sap/f/cards/loading/PlaceholderBaseRenderer"
], function (Control, Core, PlaceholderBaseRenderer) {
	"use strict";


	/**
	 * Constructor for a new <code>PlaceholderBase</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The <code>PlaceholderBase</code> control provides a base for all placeholder types.
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.115.0
	 * @alias sap.f.cards.loading.PlaceholderBase
	 */
	var PlaceholderBase = Control.extend("sap.f.cards.loading.PlaceholderBase", /** @lends sap.f.cards.loading.PlaceholderBase.prototype */ {
		metadata: {

			library: "sap.f",
			properties: {

				/**
				 * Indicates whether the tooltip will be rendered by subclasses
				 * @public
				 */
				renderTooltip: { type: "boolean", defaultValue: true },

				/**
				 * Indicates whether the card has any content
				 * @private
				 */
				hasContent: { type: "boolean", defaultValue: true}
			}
		},

		renderer: PlaceholderBaseRenderer
	});

	return PlaceholderBase;

});
