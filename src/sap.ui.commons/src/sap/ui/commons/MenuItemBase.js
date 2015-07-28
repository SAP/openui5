/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', 'sap/ui/unified/MenuItemBase'],
	function(jQuery, MenuItemBase) {
	"use strict";
	
	/**
	 * Abstract base class <code>MenuItemBase</code> for menu item elements. Please use concrete subclasses.
	 *
	 * @param {string} [sId] Id for the new control, generated automatically if no id is given 
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Abstract base class for menu item which provides common properties and events for all concrete item implementations.
	 * @abstract
	 * @extends sap.ui.unified.MenuItemBase
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.0.0
	 * 
	 * @deprecated Since version 1.21.0. 
	 * Please use the element <code>sap.ui.unified.MenuItemBase</code> of the library <code>sap.ui.unified</code> instead.
	 *
	 * @constructor
	 * @public
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
