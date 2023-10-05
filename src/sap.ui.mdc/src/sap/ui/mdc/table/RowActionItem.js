/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/core/Element',
	'sap/ui/core/IconPool',
	'sap/ui/core/Core',
	'sap/ui/mdc/enums/TableRowAction',
	"sap/ui/core/Lib"
], function(Element, IconPool, Core, TableRowAction, Lib) {
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
				 * As of version 1.98, only sap.ui.mdc.enums.TableRowAction.Navigation is available.
				 * Setting the type ensures default values for the properties <code>icon</code> and <code>text</code>.
				 * If an icon or text is set explicitly this setting is used.
				 */
				type: {type: "sap.ui.mdc.enums.TableRowAction"},
				/**
				 * Text for the row action item.
				 *
				 * Custom text cannot be set when using <code>sap.m.Table</code>.
				 */
				text: {type: "string"},
				/**
				 * Icon for the row action item.
				 *
				 * A custom icon cannot be set when using <code>sap.m.Table</code>
				 */
				icon: {type: "sap.ui.core.URI"},
				/**
				 * Whether the item should be visible on the screen.
				 */
				visible: {type: "boolean", defaultValue: true}
			},
			events: {
				/**
				 * Fired when the row action item is pressed.
				 *
				 * <code>sap.ui.table.Table</code>: The press event is fired when a row action item is pressed.
				 *
				 * <code>sap.m.Table</code>: The press event is fired when a row with a row action item is pressed.
				 * The <code>sap.ui.mdc.Table</code>'s <code>rowPress</code> event is fired as well, when pressing a row with a row action item.
				 *
				 * @private
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

	const mThemeParameters = {
		navigationIcon: "navigation-right-arrow"
	};

	RowActionItem.prototype._getText = function () {
		let sText;
		if (this.getText()) {
			sText = this.getText();
		} else {
			const oResourceBundle = Lib.getResourceBundleFor("sap.ui.mdc");
			if (this.getType() === TableRowAction.Navigation) {
				sText = oResourceBundle.getText("table.ROW_ACTION_ITEM_NAVIGATE");
			}
		}
		return sText;
	};

	RowActionItem.prototype._getIcon = function () {
		let oIcon;
		if (this.getIcon()) {
			oIcon = this.getIcon();
		} else if (this.getType() === TableRowAction.Navigation) {
			oIcon = IconPool.getIconURI(mThemeParameters["navigationIcon"]);
		}
		return oIcon;
	};

	RowActionItem.prototype._onPress = function(mPropertyBag) {
		this.firePress({
			bindingContext: mPropertyBag.bindingContext
		});
	};

	return RowActionItem;
});