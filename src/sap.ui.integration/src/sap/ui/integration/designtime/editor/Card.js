/*!
 * ${copyright}
 */
sap.ui.define([
	"./CardRenderer",
	"sap/ui/integration/widgets/Card"
], function (
	CardRenderer,
	WidgetsCard
) {
	"use strict";

	/**
	 * Constructor for a new <code>Card</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * A control that represents a container with a header and content.
	 *
	 * @extends sap.ui.integration.widgets.Card
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @private
	 * @constructor
	 * @since 1.112
	 * @alias sap.ui.integration.designtime.editor.Card
	 */
	var Card = WidgetsCard.extend("sap.ui.integration.designtime.editor.Card", /** @lends sap.ui.integration.designtime.editor.Card.prototype */ {
		metadata: {
			library: "sap.ui.integration",
			properties: {

				/**
				 * Defines if the card is readonly.
				 * @experimental Since 1.112
				 * @private
				 * @ui5-restricted sap.ui.integration.designtime.editor.Card
				 * @since 1.112
				 */
				readonly: {type: "boolean", group: "Behavior", defaultValue: false},

				/**
				 * Defines the z-index of the readonly dom.
				 * @experimental Since 1.112
				 * @private
				 * @ui5-restricted sap.ui.integration.designtime.editor.Card
				 * @since 1.112
				 */
				readonlyZIndex: {type: "int", group: "Behavior", defaultValue: 1}
			}
		},
		renderer: CardRenderer
	});

	return Card;
});
