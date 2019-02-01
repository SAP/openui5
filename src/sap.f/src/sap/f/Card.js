/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Control",
	"sap/f/CardRenderer"
], function (
	Control,
	CardRenderer
) {
	"use strict";

	/**
	 * Constructor for a new <code>Card</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * A control that represents a small container with a header and content.
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @experimental
	 * @since 1.60
	 * @alias sap.f.Card
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Card = Control.extend("sap.f.Card", /** @lends sap.f.Card.prototype */ {
		metadata: {
			library: "sap.f",
			interfaces: ["sap.f.ICard"],
			properties: {

				/**
				 * Defines the width of the card.
				 */
				width: { type: "sap.ui.core.CSSSize", group: "Appearance", defaultValue: "100%" },

				/**
				 * Defines the height of the card.
				 */
				height: { type: "sap.ui.core.CSSSize", group: "Appearance", defaultValue: "auto" }
			},
			aggregations: {

				/**
				 * Defines the header of the card.
				 */
				header: { type: "sap.f.cards.IHeader", multiple: false },

				/**
				 * Defines the content of the card.
				 */
				content: { type: "sap.ui.core.Control", multiple: false }
			}
		},
		renderer: CardRenderer
	});

	/**
	 * Implements sap.f.ICard interface.
	 *
	 * @returns {sap.f.cards.IHeader} The header of the card.
	 * @protected
	 */
	Card.prototype.getCardHeader = function () {
		return this.getHeader();
	};

	/**
	 * Implements sap.f.ICard interface.
	 *
	 * @returns {sap.ui.core.Control} The content of the card.
	 * @protected
	 */
	Card.prototype.getCardContent = function () {
		return this.getContent();
	};

	return Card;
});
