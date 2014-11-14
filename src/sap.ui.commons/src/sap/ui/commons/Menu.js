/*!
 * ${copyright}
 */

// Provides control sap.ui.commons.Menu.
sap.ui.define(['jquery.sap.global', './MenuItemBase', './library', 'sap/ui/unified/Menu'],
	function(jQuery, MenuItemBase, library, Menu1) {
	"use strict";


	
	/**
	 * Constructor for a new Menu.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * A container for menu items. When the space in the browser is not large enough to display all defined items, a scroll bar is provided.
	 * @extends sap.ui.unified.Menu
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.21.0. 
	 * Please use the control sap.ui.unified.Menu of the library sap.ui.unified instead.
	 * @alias sap.ui.commons.Menu
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Menu = Menu1.extend("sap.ui.commons.Menu", /** @lends sap.ui.commons.Menu.prototype */ { metadata : {
	
		deprecated : true,
		library : "sap.ui.commons"
	}});
	
	/*Ensure MenuItemBase is loaded (incl. loading of unified library)*/

	return Menu;

}, /* bExport= */ true);
