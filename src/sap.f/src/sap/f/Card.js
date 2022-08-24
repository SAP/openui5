/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/f/library",
	"./CardBase",
	"sap/f/CardRenderer"
], function (
	library,
	CardBase,
	CardRenderer
) {
	"use strict";

	var HeaderPosition = library.cards.HeaderPosition;

	/**
	 * Constructor for a new <code>Card</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * A control that represents a container with a predefined header and content.
	 *
	 * <h3>Overview</h3>
	 * The card is a container for grouping and displaying information.
	 *
	 * <h3>Structure</h3>
	 * You can control the width and height of the card, using properties.
	 * The <code>Card</code> has the following aggregations:
	 * <ul>
	 * <li><code>header</code> - can be either a {@link sap.f.cards.Header Header} or a {@link sap.f.cards.NumericHeader NumericHeader}
	 * <li><code>content</code> - can be any {@link sap.ui.core.Control Control}.</li>
	 * </ul>
	 *
	 * <h3>Guidelines:</h3>
	 * <ul>
	 * <li>A card should represent a task or visualize a specific set of information.</li>
	 * <li>It is recommended to use cards on home page layouts.</li>
	 * <li>The card shouldn't be large with a lot of content.</li>
	 * </ul>
	 *
	 * <h3>Usage</h3>
	 * To show a KPI value or any numeric information, use {@link sap.f.cards.NumericHeader NumericHeader} as a card header.
	 * For any other use cases, use the regular {@link sap.f.cards.Header Header}.
	 * Recommended content:
	 * - List
	 * - Table
	 * - Object information
	 * - Charts
	 * - Timelines
	 * - Images
	 *
	 * <i>When to use</i>
	 * <ul>
	 * <li>When you need multiple cards on a home page layout.</li>
	 * <li>When you have to achieve simple card visualization.</li>
	 * </ul>
	 *
	 * <i>When not to use</i>
	 * <ul>
	 * <li>When you have to reuse the card between applications. For such cases, use: {@link sap.ui.integration.widgets.Card Integration Card}.</li>
	 * <li>When you need nesting. For such cases, use: {@link sap.m.Panel Panel}.</li>
	 * <li>When the card is not part of a card layout. For such cases, use: {@link sap.m.Panel Panel}.</li>
	 * <li>When you need more header configuration flexibility.</li>
	 * </ul>
	 *
	 * @extends sap.f.CardBase
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.64
	 * @alias sap.f.Card
	 */
	var Card = CardBase.extend("sap.f.Card", /** @lends sap.f.Card.prototype */ {
		metadata: {
			library: "sap.f",
			properties: {

				/**
				 * Defines the position of the Card Header.
				 * @since 1.65
				 */
				headerPosition: { type: "sap.f.cards.HeaderPosition", group: "Appearance", defaultValue: HeaderPosition.Top }
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
	 * @returns {sap.f.cards.HeaderPosition} The position of the header of the card.
	 * @protected
	 * @since 1.65
	 */
	Card.prototype.getCardHeaderPosition = function () {
		return this.getHeaderPosition();
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
