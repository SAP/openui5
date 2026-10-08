/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Element"
], (
	Element
) => {
	"use strict";

	/**
	 * Constructor for a new <code>RowItemActionItemBase</code>.
	 *
	 * @param {string} [sId] Optional ID for the new object; generated automatically if no non-empty ID is given
	 * @param {object} [mSettings] Initial settings for the new object
	 *
	 * @class
	 * Shared base for the action items of <code>sap.ui.mdc.List</code> and <code>sap.ui.mdc.Table</code>.
	 * Subclasses add their own <code>type</code> property.
	 * It must not be used stand-alone.
	 * @extends sap.ui.core.Element
	 * @abstract
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @since 1.154
	 * @alias sap.ui.mdc.table.RowItemActionItemBase
	 * @public
	 */
	const RowItemActionItemBase = Element.extend("sap.ui.mdc.table.RowItemActionItemBase", {
		metadata: {
			"abstract": true,
			library: "sap.ui.mdc",
			properties: {
				/**
				 * Text of the action.
				 */
				text: {type: "string"},
				/**
				 * Icon of the action.
				 */
				icon: {type: "sap.ui.core.URI"},
				/**
				 * Determines whether the action is visible.
				 */
				visible: {type: "boolean", defaultValue: true}
			},
			events: {
				/**
				 * Fired when the action is pressed.
				 */
				press: {
					parameters: {
						/**
						 * The binding context of the item on which the action was pressed.
						 */
						bindingContext: {
							type: "sap.ui.model.Context"
						}
					}
				}
			}
		}
	});

	/**
	 * Handles the press event from the inner control.
	 *
	 * @param {object} mPropertyBag The event property bag
	 * @private
	 */
	RowItemActionItemBase.prototype._onPress = function(mPropertyBag) {
		this.firePress({
			bindingContext: mPropertyBag.bindingContext
		});
	};

	return RowItemActionItemBase;
});
