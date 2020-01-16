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

		rm.openStart("li", oItem);

		if (oItem.getVisible() && bIsEnabled) {
			rm.attr("tabindex", "0");
		}

		rm.class("sapUiMnuItm");
		if (oInfo.iItemNo == 1) {
			rm.class("sapUiMnuItmFirst");
		} else if (oInfo.iItemNo == oInfo.iTotalItems) {
			rm.class("sapUiMnuItmLast");
		}
		if (!oMenu.checkEnabled(oItem)) {
			rm.class("sapUiMnuItmDsbl");
		}
		if (oItem.getStartsSection()) {
			rm.class("sapUiMnuItmSepBefore");
		}

		if (!bIsEnabled) {
			rm.attr("disabled", "disabled");
		}

		if (oItem.getTooltip_AsString()) {
			rm.attr("title", oItem.getTooltip_AsString());
		}

		// ARIA
		if (oInfo.bAccessible) {
			rm.accessibilityState(oItem, {
				role: "menuitem",
				disabled: null, // Prevent aria-disabled as a disabled attribute is enough
				posinset: oInfo.iItemNo,
				setsize: oInfo.iTotalItems,
				labelledby: {value: /*oMenu.getId() + "-label " + */this.getId() + "-txt " + this.getId() + "-scuttxt", append: true}
			});
			if (oSubMenu) {
				rm.attr("aria-haspopup", true);
				rm.attr("aria-owns", oSubMenu.getId());
			}
		}

		// Left border
		rm.openEnd();
		rm.openStart("div");
		rm.class("sapUiMnuItmL");
		rm.openEnd();
		rm.close("div");

		if (oItem.getIcon()) {
			// icon/check column
			rm.openStart("div");
			rm.class("sapUiMnuItmIco");
			rm.openEnd();
			rm.icon(oItem.getIcon(), null, {title: null});
			rm.close("div");
		}

		// Text column
		rm.openStart("div", this.getId() + "-txt");
		rm.class("sapUiMnuItmTxt");
		rm.openEnd();
		rm.text(oItem.getText());
		rm.close("div");

		// Shortcut column
		rm.openStart("div", this.getId() + "-scuttxt");
		rm.class("sapUiMnuItmSCut");
		rm.openEnd();
		rm.close("div");

		// Submenu column
		rm.openStart("div");
		rm.class("sapUiMnuItmSbMnu");
		rm.openEnd();
		if (oSubMenu) {
			rm.openStart("div");
			rm.class("sapUiIconMirrorInRTL");
			rm.openEnd();
			rm.close("div");
		}
		rm.close("div");

		// Right border
		rm.openStart("div");
		rm.class("sapUiMnuItmR");
		rm.openEnd();
		rm.close("div");

		rm.close("li");
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
