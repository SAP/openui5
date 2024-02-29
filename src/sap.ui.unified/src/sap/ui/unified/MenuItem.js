/*!
 * ${copyright}
 */

// Provides control sap.ui.unified.MenuItem.
sap.ui.define(['sap/ui/core/IconPool', './MenuItemBase', './library', 'sap/ui/core/library'],
	function(IconPool, MenuItemBase, library, coreLibrary) {
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
			icon : {type : "sap.ui.core.URI", group : "Appearance", defaultValue : ''},

			/**
			 * Defines the shortcut text that should be displayed on the menu item on non-mobile devices.
			 * <b>Note:</b> The text is only displayed and set as а value of the <code>aria-keyshortcuts</code> attribute.
			 * There is no built-in functionality that selects the item when the corresponding shortcut is pressed.
			 * This should be implemented by the application developer.
			 */
			shortcutText : {type : "string", group : "Appearance", defaultValue : ''}

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
			bIsEnabled = oItem.getEnabled(),
			sShortcutText = oItem.getShortcutText(),
			oIcon;

		rm.openStart("li", oItem);

		if (!oSubMenu && sShortcutText) {
			rm.attr("aria-keyshortcuts", sShortcutText);
		}

		if (oItem.getVisible()) {
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

		if (oItem.getTooltip_AsString()) {
			rm.attr("title", oItem.getTooltip_AsString());
		}

		// ARIA
		if (oInfo.bAccessible) {
			rm.accessibilityState(oItem, {
				role: "menuitem",
				disabled: !bIsEnabled,
				posinset: oInfo.iItemNo,
				setsize: oInfo.iTotalItems,
				labelledby: { value: this.getId() + "-txt", append: true }
			});
			if (oSubMenu) {
				rm.attr("aria-haspopup", coreLibrary.aria.HasPopup.Menu.toLowerCase());
				rm.attr("aria-owns", oSubMenu.getId());
			}
		}

		rm.openEnd();

		rm.openStart("div");
		rm.class("sapUiMnuItmIco");
		rm.openEnd();

		if (oItem.getIcon()) {
			oIcon = oItem._getIcon();
			rm.renderControl(oIcon);
		}
		rm.close("div");

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
		if (!oSubMenu && sShortcutText) {
			rm.text(sShortcutText);
		}
		rm.close("div");

		// Submenu column
		if (oSubMenu) {
			rm.openStart("div");
			rm.class("sapUiMnuItmSbMnu");
			rm.openEnd();
			rm.openStart("div");
			rm.class("sapUiIconMirrorInRTL");
			rm.openEnd();
			rm.close("div");
			rm.close("div");
		}

		rm.close("li");
	};

	MenuItem.prototype.hover = function(bHovered, oMenu){
		this.$().toggleClass("sapUiMnuItmHov", bHovered);
	};

	MenuItem.prototype.focus = function(oMenu){
		if (this.getVisible()) {
			this.$().trigger("focus");
		} else {
			oMenu.focus();
		}
	};

	return MenuItem;

});
