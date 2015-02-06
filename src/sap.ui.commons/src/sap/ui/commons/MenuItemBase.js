/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', 'sap/ui/unified/MenuItemBase'],
	function(jQuery, MenuItemBase) {
	"use strict";


	/**
	 * @class Provides the standard properties for menu items.
	 * @extends sap.ui.unified.MenuItemBase
	 *
	 * @author SAP SE 
	 *
	 * @public
	 * @deprecated Since version 1.21.0. 
	 * Please use the control sap.ui.unified.MenuItemBase of the library sap.ui.unified instead.
	 * @name sap.ui.commons.MenuItemBase
	 */
	
	try {
		sap.ui.getCore().loadLibrary("sap.ui.unified");
	} catch (e) {
		jQuery.sap.log.error("The controls/elements 'sap.ui.commons.Menu*' needs library 'sap.ui.unified'.");
		throw (e);
	}
	
	
	return MenuItemBase;

}, /* bExport= */ true);
