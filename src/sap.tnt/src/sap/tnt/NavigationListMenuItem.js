/*!
 * ${copyright}
 */

// Provides control sap.ui.unified.MenuItem.
sap.ui.define(['sap/ui/core/IconPool', 'sap/ui/unified/MenuItemBase', 'sap/ui/unified/library', 'sap/ui/core/library', 'sap/ui/core/Icon'],
	function(IconPool, MenuItemBase, library, coreLibrary, Icon) {
	"use strict";

	const EXTERNAL_LINK_ICON = "sap-icon://arrow-right";
	/**
	 * Constructor for a new NavigationListMenuItem element.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Represents a navigation list menu item.
	 * @extends sap.ui.unified.MenuItemBase
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @alias sap.tnt.NavigationListMenuItem
	 */
	var NavigationListMenuItem = MenuItemBase.extend("sap.tnt.NavigationListMenuItem", /** @lends sap.ui.unified.MenuItem.prototype */ { metadata : {

		library : "sap.ui.unified",
		properties : {

			/**
			 * Defines the text which should be displayed on the item.
			 */
			text : {type : "string", group : "Appearance", defaultValue : ''},

			/**
			 * Defines an icon from the {@link sap.ui.core.IconPool sap.ui.core.IconPool} or an image which should be displayed on the item.
			 */
			icon : {type : "sap.ui.core.URI", group : "Appearance", defaultValue : ''},

			isExternalLink: {type : "boolean", group : "Appearance", defaultValue : false}
		},
		associations : {

			/**
			 * Association to controls / IDs which label this control (see WAI-ARIA attribute aria-labelledby).
			 */
			ariaLabelledBy : {type : "sap.ui.core.Control", multiple : true, singularName : "ariaLabelledBy"}
		},
		aggregations: {

			/**
			 * The icon for external links.
			 * @since 1.121
			 */
			_externalLinkIcon: { type: "sap.ui.core.Icon", multiple: false, visibility: "hidden"}
		}
	}});

	IconPool.insertFontFaceStyle(); //Ensure Icon Font is loaded

	NavigationListMenuItem.prototype.render = function(oRenderManager, oItem, oMenu, oInfo){
		var rm = oRenderManager,
			oSubMenu = oItem.getSubmenu(),
			bIsEnabled = oItem.getEnabled(),
			oIcon;

		rm.openStart("li", oItem);

		if (oItem.getIsExternalLink()) {
			rm.class("sapUiMnuItmExternalLink");
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

		// Left border
		rm.openEnd();
		rm.openStart("div");
		rm.class("sapUiMnuItmL");
		rm.openEnd();
		rm.close("div");

		if (oItem.getIcon() && oItem._getIcon) {
			// icon/check column
			rm.openStart("div");
			rm.class("sapUiMnuItmIco");
			rm.openEnd();

			oIcon = oItem._getIcon(oItem);
			rm.renderControl(oIcon);

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

		// External link icon
		if (oItem.getIsExternalLink()) {

			const oIcon = this._getExternalLinkIcon();
			rm.renderControl(oIcon);
		}

		// Right border
		rm.openStart("div");
		rm.class("sapUiMnuItmR");
		rm.openEnd();
		rm.close("div");

		rm.close("li");
	};

	NavigationListMenuItem.prototype.hover = function(bHovered, oMenu){
		this.$().toggleClass("sapUiMnuItmHov", bHovered);
	};

	NavigationListMenuItem.prototype.focus = function(oMenu){
		if (this.getVisible()) {
			this.$().trigger("focus");
		} else {
			oMenu.focus();
		}
	};

	/**
	 * Returns the <code>sap.ui.core.Icon</code> control used to display the external link icon.
	 *
	 * @returns {sap.ui.core.Icon} Icon control instance
	 * @private
	 */
	NavigationListMenuItem.prototype._getExternalLinkIcon = function () {
		var oIcon = this.getAggregation("_externalLinkIcon");

		if (!oIcon) {
			oIcon = new Icon({
				src: EXTERNAL_LINK_ICON
			}).addStyleClass(`sapTntNLIExternalLinkIcon`);
			this.setAggregation("_externalLinkIcon", oIcon);
		}
		return oIcon;
	};

	return NavigationListMenuItem;
});
