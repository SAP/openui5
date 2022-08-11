/*!
 * ${copyright}
 */

// Provides control sap.ui.commons.Menu.
sap.ui.define([
	'./MenuItemBase',
	'./library',
	'sap/ui/unified/Menu',
	'./MenuRenderer'
],
	function(MenuItemBase, library, UnifiedMenu, MenuRenderer) {
	"use strict";



	/**
	 * Constructor for a new Menu control.
	 *
	 * @param {string} [sId] Id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * A menu is an interactive element which provides a choice of different actions to the user. These actions (items) can also be organized in submenus.
	 * Like other dialog-like controls, the menu is not rendered within the control hierarchy. Instead it can be opened at a specified position via a function call.
	 * @extends sap.ui.unified.Menu
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.0.0
	 *
	 * @constructor
	 * @public
	 * @deprecated as of version 1.21.0, replaced by {@link sap.ui.unified.Menu}
	 * @alias sap.ui.commons.Menu
	 */
	var Menu = UnifiedMenu.extend("sap.ui.commons.Menu", /** @lends sap.ui.commons.Menu.prototype */ { metadata : {

		deprecated : true,
		library : "sap.ui.commons"
	}});

	Menu.prototype.bCozySupported = false;

	/*Ensure MenuItemBase is loaded (incl. loading of unified library)*/

	return Menu;

});
