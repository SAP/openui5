/*!
 * ${copyright}
 */

// Provides control sap.ui.commons.MenuTextFieldItem.
sap.ui.define(['./MenuItemBase', './library', 'sap/ui/unified/MenuTextFieldItem'],
	function(MenuItemBase, library, UnifiedMenuTextFieldItem) {
	"use strict";



	/**
	 * Constructor for a new MenuTextFieldItem element.
	 *
	 * @param {string} [sId] Id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Special menu item which contains a label and a text field. This menu item is e.g. helpful for filter implementations.
	 * The aggregation <code>submenu</code> (inherited from parent class) is not supported for this type of menu item.
	 * @extends sap.ui.unified.MenuTextFieldItem
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.21.0.
	 * Please use the control <code>sap.ui.unified.MenuTextFieldItem</code> of the library <code>sap.ui.unified</code> instead.
	 * @alias sap.ui.commons.MenuTextFieldItem
	 */
	var MenuTextFieldItem = UnifiedMenuTextFieldItem.extend("sap.ui.commons.MenuTextFieldItem", /** @lends sap.ui.commons.MenuTextFieldItem.prototype */ { metadata : {

		deprecated : true,
		library : "sap.ui.commons"
	}});

	/*Ensure MenuItemBase is loaded (incl. loading of unified library)*/

	return MenuTextFieldItem;

});
