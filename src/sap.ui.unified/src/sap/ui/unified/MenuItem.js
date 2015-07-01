/*!
 * ${copyright}
 */

// Provides control sap.ui.unified.MenuItem.
sap.ui.define(['jquery.sap.global', 'sap/ui/core/IconPool', './MenuItemBase', './library'],
	function(jQuery, IconPool, MenuItemBase, library) {
	"use strict";


	
	/**
	 * Constructor for a new MenuItem.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Smallest unit in the menu hierarchy. An item can be a direct part of a menu bar, of a menu, or of a sub menu.
	 * @extends sap.ui.unified.MenuItemBase
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.ui.unified.MenuItem
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var MenuItem = MenuItemBase.extend("sap.ui.unified.MenuItem", /** @lends sap.ui.unified.MenuItem.prototype */ { metadata : {
	
		library : "sap.ui.unified",
		properties : {
	
			/**
			 * 
			 * Item text
			 */
			text : {type : "string", group : "Appearance", defaultValue : ''},
	
			/**
			 * 
			 * Icon to be displayed
			 */
			icon : {type : "sap.ui.core.URI", group : "Appearance", defaultValue : ''}
		}
	}});
	
	IconPool.getIconInfo("", ""); //Ensure Icon Font is loaded
	
	MenuItem.prototype.render = function(oRenderManager, oItem, oMenu, oInfo){
		var rm = oRenderManager;
		var oSubMenu = oItem.getSubmenu();
		rm.write("<li ");
		
		var sClass = "sapUiMnuItm";
		if (oInfo.iItemNo == 1) {
			sClass += " sapUiMnuItmFirst";
		} else if (oInfo.iItemNo == oInfo.iTotalItems) {
			sClass += " sapUiMnuItmLast";
		}
		if (!oMenu.checkEnabled(oItem)) {
			sClass += " sapUiMnuItmDsbl";
		}
		if (oItem.getStartsSection()) {
			sClass += " sapUiMnuItmSepBefore";
		}
		
		rm.writeAttribute("class", sClass);
		if (oItem.getTooltip_AsString()) {
			rm.writeAttributeEscaped("title", oItem.getTooltip_AsString());
		}
		rm.writeElementData(oItem);
	
		// ARIA
		if (oInfo.bAccessible) {
			rm.writeAccessibilityState(oMenu, { //Pass the Menu here to write aria-labelledby
				role: "menuitem",
				disabled: !oMenu.checkEnabled(oItem),
				posinset: oInfo.iItemNo,
				setsize: oInfo.iTotalItems,
				labelledby: {value: oMenu.getId() + "-label " + this.getId() + "-txt " + this.getId() + "-scuttxt", append: true}
			});
			if (oSubMenu) {
				rm.writeAttribute("aria-haspopup", true);
				rm.writeAttribute("aria-owns", oSubMenu.getId());
			}
		}
	
		// Left border
		rm.write("><div class=\"sapUiMnuItmL\"></div>");
	
		// icon/check column
		rm.write("<div class=\"sapUiMnuItmIco\">");
		if (oItem.getIcon()) {
			rm.writeIcon(oItem.getIcon(), null, {title: null});
		}
		rm.write("</div>");
	
		// Text column
		rm.write("<div id=\"" + this.getId() + "-txt\" class=\"sapUiMnuItmTxt\">");
		rm.writeEscaped(oItem.getText());
		rm.write("</div>");
	
		// Shortcut column
		rm.write("<div id=\"" + this.getId() + "-scuttxt\" class=\"sapUiMnuItmSCut\"></div>");
	
		// Submenu column
		rm.write("<div class=\"sapUiMnuItmSbMnu\">");
		if (oSubMenu) {
			rm.write("<div class=\"sapUiIconMirrorInRTL\"></div>");
		}
		rm.write("</div>");
	
		// Right border
		rm.write("<div class=\"sapUiMnuItmR\"></div>");
	
		rm.write("</li>");
	};
	
	/**
	 * @protected
	 */
	MenuItem.prototype.hover = function(bHovered, oMenu){
		this.$().toggleClass("sapUiMnuItmHov", bHovered);
	};

	return MenuItem;

}, /* bExport= */ true);
