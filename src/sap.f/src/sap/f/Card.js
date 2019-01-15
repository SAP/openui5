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
	 * A control that represents header and content area as a card. Content area of a card should use controls or component located in the sub package sal.f.cardcontents.
	 *
	 * <h3>Overview</h3>
	 *
	 * The control consist of a header and content section
	 *
	 * <h3>Usage</h3>
	 *
	 * <h3>Responsive Behavior</h3>
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @experimental
	 * @since 1.60
	 * @see {@link TODO Card}
	 * @alias sap.f.Card
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Card = Control.extend("sap.f.Card", /** @lends sap.f.Card.prototype */ {
		metadata: {
			library: "sap.f",
			interfaces: ["sap.f.ICard"],
			properties: {

				/**
				 * Defines the width of the Card
				 *
				 * <b>Note:</b> If no width is set, sap.f.Card will take 100% of its parent container
				 * @since 1.61
				 */
				width: { type: "sap.ui.core.CSSSize", group: "Appearance", defaultValue: "100%" },

				/**
				 * Defines the height of the Card
				 *
				 * <b>Note:</b> If no height is set, sap.f.Card will take 100% of its parent container
				 * @since 1.61
				 */
				height: { type: "sap.ui.core.CSSSize", group: "Appearance", defaultValue: "100%" }
			},
			aggregations: {

				header: { type: "sap.f.cards.IHeader", multiple: false },
				content: { type: "sap.ui.core.Control", multiple: false }
			}
		},
		renderer: CardRenderer
	});

	Card.prototype._getHeader = function () {
		return this.getHeader();
	};

	Card.prototype._getContent = function () {
		return this.getContent();
	};

	return Card;
});
