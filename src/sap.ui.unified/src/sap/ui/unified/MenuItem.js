/*!
 * ${copyright}
 */

// Provides control sap.ui.unified.MenuItem.
sap.ui.define([
	'sap/ui/core/Element',
	'sap/ui/core/IconPool',
	'./MenuItemBase',
	'./library',
	'sap/ui/core/library'
], function(
	Element,
	IconPool,
	MenuItemBase,
	library,
	coreLibrary
) {

	"use strict";

	// shortcut for sap.ui.core.ItemSelectionMode
	var ItemSelectionMode = coreLibrary.ItemSelectionMode;

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
	 * @implements sap.ui.unified.IMenuItem
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

		interfaces: [
			"sap.ui.unified.IMenuItem"
		],
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
			 * Determines whether the <code>MenuItem</code> is selected (default is set to <code>false</code>).
			 * A selected <code>MenuItem</code> has a check mark rendered at its end.
			 * <b>Note: </b> selection functionality works only if the menu item is a member of <code>MenuItemGroup</code> with
			 * <code>itemSelectionMode</code> set to {@link sap.ui.core.ItemSelectionMode.SingleSelect} or {@link sap.ui.unified.ItemSelectionMode.MultiSelect}.
			 * @since 1.127.0
			 */
			selected : {type : "boolean", group : "Behavior", defaultValue : false},

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
			ariaLabelledBy : {type : "sap.ui.core.Control", multiple : true, singularName : "ariaLabelledBy"},

			/**
			 * MenuItemGroup associated with this item.
			 */
			_group : {type : "sap.ui.unified.MenuItemGroup",  group : "Behavior", visibility : "hidden"}

		}

	}});

	IconPool.insertFontFaceStyle(); //Ensure Icon Font is loaded

	MenuItem.prototype.render = function(oRenderManager, oItem, oMenu, oInfo){
		var rm = oRenderManager,
			oSubMenu = oItem.getSubmenu(),
			bIsEnabled = oItem.getEnabled(),
			bIsSelected = oItem.getSelected() && oItem._getItemSelectionMode() !== ItemSelectionMode.None,
			sShortcutText = oItem.getShortcutText(),
			sRole,
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

			switch (oItem._getItemSelectionMode()) {
				case ItemSelectionMode.SingleSelect:
					sRole = "menuitemradio";
					break;
				case ItemSelectionMode.MultiSelect:
					sRole = "menuitemcheckbox";
					break;
				default:
					sRole = "menuitem";
			}

			rm.accessibilityState(oItem, {
				role: sRole,
				disabled: !bIsEnabled,
				posinset: oInfo.iItemNo,
				setsize: oInfo.iTotalItems,
				selected: null,
				checked: bIsSelected ? true : undefined,
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

		if (oSubMenu) {
			// Submenu column
			rm.openStart("div");
			rm.class("sapUiMnuItmSbMnu");
			rm.openEnd();
			rm.openStart("div");
			rm.class("sapUiIconMirrorInRTL");
			rm.openEnd();
			rm.close("div");
			rm.close("div");
		} else if (bIsSelected) {
			// Selection column
			rm.openStart("div", this.getId() + "-sel");
			rm.class("sapUiMnuItmSel");
			rm.openEnd();
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

	MenuItem.prototype._getItemSelectionMode = function() {
		var sGroup = this.getAssociation("_group");

		return sGroup ? Element.getElementById(sGroup).getItemSelectionMode() : ItemSelectionMode.None;
	};

	/**
	 * Sets the <code>selected</code> state of the <code>MenuItem</code> and deselect other selected <code>MenuItem</code> controls
	 * if selection mode is <code>SingleSelect</code>.
	 *
	 * @since 1.127.0
	 * @public
	 * @override
	 * @param {boolean} bState Whether the state is selected or not
	 * @returns {this} Returns <code>this</code> to allow method chaining
	 */
	MenuItem.prototype.setSelected = function(bState) {
		var oGroup = Element.getElementById(this.getAssociation("_group"));

		// in case of single selection, clear selected state of all other items in the group to ensure that only one item is selected
		if (bState && oGroup && oGroup.getItemSelectionMode() === ItemSelectionMode.SingleSelect) {
			oGroup._clearSelectedItems();
		}

		this.setProperty("selected", bState);

		return this;
	};

	/**
	 * @since 1.127.0
	 * @public
	 * @override
	 * @returns {boolean} Returns <code>true</code> if the <code>MenuItem</code> is selected and is part of group
	 * with single or multi selection mode, <code>false</code> otherwise.
	 */
	MenuItem.prototype.getSelected = function() {
		return this.getProperty("selected") && this._getItemSelectionMode() !== ItemSelectionMode.None;
	};

	return MenuItem;

});
