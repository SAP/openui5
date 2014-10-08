/*!
 * ${copyright}
 */

// Provides control sap.ui.commons.MenuTextFieldItem.
sap.ui.define(['jquery.sap.global', './MenuItemBase', './library', 'sap/ui/unified/MenuTextFieldItem'],
	function(jQuery, MenuItemBase, library, MenuTextFieldItem1) {
	"use strict";


	
	/**
	 * Constructor for a new MenuTextFieldItem.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Menu item which contains an text field. This menu item is e.g. helpful for filters.
	 * The aggregation 'submenu' (inherited from parent class) is not supported for this type of menu item.
	 * @extends sap.ui.unified.MenuTextFieldItem
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.21.0. 
	 * Please use the control sap.ui.unified.MenuTextFieldItem of the library sap.ui.unified instead.
	 * @name sap.ui.commons.MenuTextFieldItem
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var MenuTextFieldItem = MenuTextFieldItem1.extend("sap.ui.commons.MenuTextFieldItem", /** @lends sap.ui.commons.MenuTextFieldItem.prototype */ { metadata : {
	
		deprecated : true,
		library : "sap.ui.commons"
	}});
	
	/*Ensure MenuItemBase is loaded (incl. loading of unified library)*/

	return MenuTextFieldItem;

}, /* bExport= */ true);
