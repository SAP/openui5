/*
 * ! ${copyright}
 */

sap.ui.define([
	'sap/ui/core/Element'
], function(Element) {
	"use strict";

	/**
	 * Constructor for a new SelectionDialogItem.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class tbd
	 * @extends sap.ui.core.Element
	 * @version ${version}
	 * @constructor
	 * @abstract
	 * @private
	 * @since 1.60.0
	 * @alias sap.ui.mdc.link.SelectionDialogItem
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var SelectionDialogItem = Element.extend("sap.ui.mdc.link.SelectionDialogItem", /** @lends sap.ui.mdc.link.SelectionDialogItem.prototype */
	{
		metadata: {
			library: "sap.ui.mdc",
			properties: {
				/**
				 * The unique key of the item.
				 */
				key: {
					type: "string"
				},
				/**
				 * The text to be displayed for the item.
				 */
				text: {
					type: "string"
				},
				/**
				 * The description to be displayed for the item.
				 */
				description: {
					type: "string"
				},
				/**
				 * Defines href of the item.
				 */
				href: {
					type: "string",
					defaultValue: undefined
				},
				/**
				 * Defines target of the item.
				 */
				target: {
					type: "string"
				},
				/**
				 * Defines icon of the item.
				 */
				icon: {
					type: "string"
				},
				/**
				 * Defines visibility of the item.
				 */
				visible: {
					type: "boolean",
					defaultValue: false
				},
				isBaseline: {
					type: "boolean",
					defaultValue: false
				}
			}
		}
	});

	return SelectionDialogItem;

});
