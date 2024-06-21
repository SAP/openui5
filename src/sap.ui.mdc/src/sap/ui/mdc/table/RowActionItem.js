/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/core/Element',
	'sap/ui/mdc/enums/TableRowActionType'
], (Element) => {
	"use strict";

	/**
	 * Constructor for new RowActionItem.
	 *
	 * @param {string} [sId] Optional ID for the new object; generated automatically if no non-empty ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * The <code>RowActionItem</code> control represents a action for a row.
	 * This control can only be used in the context of <code>sap.ui.mdc.Table</code> control to define row actions.
	 * @extends sap.ui.core.Element
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.ui.mdc.table.RowActionItem
	 */

	const RowActionItem = Element.extend("sap.ui.mdc.table.RowActionItem", {
		metadata: {
			library: "sap.ui.mdc",
			properties: {
				/**
				 * Type of the row action item.
				 *
				 * Setting the type ensures default values for the properties <code>icon</code> and <code>text</code>. If an icon or text is set
				 * explicitly, this setting is used.
				 */
				type: { type: "sap.ui.mdc.enums.TableRowActionType" },
				/**
				 * Text for the row action item.
				 *
				 * <b>Note:</b> A custom text cannot be set when the table type is {@link sap.ui.mdc.table.ResponsiveTableType ResponsiveTable}.
				 */
				text: { type: "string" },
				/**
				 * Icon for the row action item.
				 *
				 * <b>Note:</b> A custom icon cannot be set when the table type is {@link sap.ui.mdc.table.ResponsiveTableType ResponsiveTable}.
				 */
				icon: { type: "sap.ui.core.URI" },
				/**
				 * Whether the item should be visible on the screen.
				 */
				visible: { type: "boolean", defaultValue: true }
			},
			events: {
				/**
				 * Fired when the row action item is pressed.
				 *
				 * If the table type is {@link sap.ui.mdc.table.GridTableType GridTable}, the <code>press</code> event is fired when a row action
				 * item is pressed.
				 *
				 * If the table type is {@link sap.ui.mdc.table.ResponsiveTableType ResponsiveTable}, the <code>press</code> event and the table's
				 * <code>rowPress</code> event are fired when a row with a row action item is pressed.
				 *
				 * @private
				 * @ui5-restricted sap.ui.mdc.table.RowActionItem
				 */
				press: {
					parameters: {
						/**
						 * The binding context of the pressed row action
						 */
						bindingContext: {
							type: "sap.ui.model.Context"
						}
					}
				}
			}
		}
	});

	RowActionItem.prototype._onPress = function(mPropertyBag) {
		this.firePress({
			bindingContext: mPropertyBag.bindingContext
		});
	};

	return RowActionItem;
});