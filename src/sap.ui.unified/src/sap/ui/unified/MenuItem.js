/*!
 * ${copyright}
 */

// Provides control sap.ui.unified.MenuItem.
sap.ui.define(['sap/ui/core/IconPool', './MenuItemBase', './library'],
	function(IconPool, MenuItemBase, library) {
	"use strict";



	/**
	 * Constructor for a new MenuItem element.
	 *
	 * @param {string} [sId] Id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Standard item to be used inside a menu. A menu item represents an action which can be selected by the user in the menu or
	 * it can provide a submenu to organize the actions hierarchically.
	 * @extends sap.ui.unified.MenuItemBase
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.21.0
	 *
	 * @constructor
	 * @public
	 * @alias sap.ui.unified.MenuItem
	 * @ui5-metamodel This control/element will also be described in the UI5 (legacy) design time meta model
	 */
	var MenuItem = MenuItemBase.extend("sap.ui.unified.MenuItem", /** @lends sap.ui.unified.MenuItem.prototype */ { metadata : {

		library : "sap.ui.unified",
		properties : {

			/**
			 * Defines the text which should be displayed on the item.
			 */
			text : {type : "string", group : "Appearance", defaultValue : ''},

			/**
			 * Defines the icon of the {@link sap.ui.core.IconPool sap.ui.core.IconPool} or an image which should be displayed on the item.
			 */
			icon : {type : "sap.ui.core.URI", group : "Appearance", defaultValue : ''}
		},
		associations : {

			/**
			 * Association to controls / IDs which label this control (see WAI-ARIA attribute aria-labelledby).
			 */
			ariaLabelledBy : {type : "sap.ui.core.Control", multiple : true, singularName : "ariaLabelledBy"}
		}
	}});

	IconPool.insertFontFaceStyle(); //Ensure Icon Font is loaded

	MenuItem.prototype.render = function(oRenderManager, oItem, oMenu, oInfo){
		var rm = oRenderManager,
			oSubMenu = oItem.getSubmenu(),
			bIsEnabled = oItem.getEnabled();

		rm.write("<li");

		if (oItem.getVisible() && bIsEnabled) {
			rm.writeAttribute("tabindex", "0");
		}

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
		if (!bIsEnabled) {
			rm.writeAttribute("disabled", "disabled");
		}

		if (oItem.getTooltip_AsString()) {
			rm.writeAttributeEscaped("title", oItem.getTooltip_AsString());
		}
		rm.writeElementData(oItem);

		// ARIA
		if (oInfo.bAccessible) {
			rm.writeAccessibilityState(oItem, {
				role: "menuitem",
				disabled: null, // Prevent aria-disabled as a disabled attribute is enough
				posinset: oInfo.iItemNo,
				setsize: oInfo.iTotalItems,
				labelledby: {value: /*oMenu.getId() + "-label " + */this.getId() + "-txt " + this.getId() + "-scuttxt", append: true}
			});
			if (oSubMenu) {
				rm.writeAttribute("aria-haspopup", true);
				rm.writeAttribute("aria-owns", oSubMenu.getId());
			}
		}

		// Left border
		rm.write("><div class=\"sapUiMnuItmL\"></div>");

		// icon/check column
		if (oItem.getIcon()) {
			rm.write("<div class=\"sapUiMnuItmIco\">");
			rm.writeIcon(oItem.getIcon(), null, {title: null});
			rm.write("</div>");
		}

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

	MenuItem.prototype.hover = function(bHovered, oMenu){
		this.$().toggleClass("sapUiMnuItmHov", bHovered);
	};

	MenuItem.prototype.focus = function(oMenu){
		if (this.getEnabled() && this.getVisible()) {
			this.$().focus();
		} else {
			oMenu.focus();
		}
	};

	return MenuItem;

});
