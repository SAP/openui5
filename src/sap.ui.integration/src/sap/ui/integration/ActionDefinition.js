/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Element"
], function(
	Element
) {
	"use strict";

	/**
	 * Constructor for a new <code>ActionDefinition</code>.
	 *
	 * @param {string} [sId] ID for the new ActionDefinition, generated automatically if no ID is given.
	 * @param {object} [mSettings] Initial settings for the new ActionDefinition.
	 *
	 * @class
	 * Represents an action, which appears in the header of {@link sap.ui.integration.widgets.Card}.
	 * Useful in <code>Component</code> card and <code>Extension</code>.
	 *
	 * @extends sap.ui.core.Element
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @experimental Since 1.85. Disclaimer: this class is in a beta state - incompatible API changes may be done before its official public release. Use at your own discretion.
	 * @since 1.85
	 * @alias sap.ui.integration.ActionDefinition
	 */
	var ActionDefinition = Element.extend("sap.ui.integration.ActionDefinition", {
		metadata: {
			library: "sap.ui.integration",
			properties: {
				/**
				 * The type of the action.
				 */
				type: {
					type: "sap.ui.integration.CardActionType"
				},

				/**
				 * The text of the action button.
				 */
				text: {
					type: "string", defaultValue: ""
				},

				/**
				 * The icon of the action button.
				 */
				icon: {
					type: "sap.ui.core.URI"
				},

				/**
				 * Indicates whether the user can interact with the action button or not.
				 * <b>Note</b>: Disabled controls cannot be focused and they are out of the navigation tab-chain.
				 */
				enabled: {
					type: "boolean", defaultValue: true
				},

				/**
				 * Whether the action button should be visible on the screen.
				 */
				visible: {
					type: "boolean", defaultValue: true
				},

				/**
				 * The parameters of the action.
				 */
				parameters: {
					type: "object"
				},

				/**
				 * Defines whether a visual separator should be rendered before the item.
				 * <b>Note</b>: If an item is invisible its separator is also not displayed.
				 */
				startsSection: {
					type: "boolean", defaultValue: false
				}
			},
			events: {

				/**
				 * Fired when the action button is pressed.
				 */
				press: {
				}
			},
			associations: {
				/**
				 * The button in the actions menu, which is related to this action.
				 */
				_menuItem: {
					type: "sap.m.MenuItem",
					multiple: false,
					visibility: "hidden"
				}
			},
			aggregations: {
				/**
				 * Action Definitions which will appear as nested items in the menu.
				 * <b>Note</b>: The parent action definition will not fire a press anymore, it will only be used to hold the subitem.
				 */
				actionDefinitions: {
					type: "sap.ui.integration.ActionDefinition",
					multiple: true
				}
			}
		}
	});

	return ActionDefinition;
});