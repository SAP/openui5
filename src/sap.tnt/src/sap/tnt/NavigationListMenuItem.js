/*!
 * ${copyright}
 */

// Provides control sap.ui.unified.MenuItem.
sap.ui.define([
	'sap/ui/core/IconPool',
	'sap/ui/unified/MenuItem',
	'sap/ui/unified/library',
	'sap/ui/core/library',
	'sap/ui/core/Icon',
	"sap/ui/util/defaultLinkTypes",
	"sap/ui/util/openWindow",
	"sap/ui/events/KeyCodes"],
	function (
		IconPool,
		MenuItem,
		library,
		coreLibrary,
		Icon,
		defaultLinkTypes,
		openWindow,
		KeyCodes
) {
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
	 * @extends sap.ui.unified.MenuItem
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @alias sap.tnt.NavigationListMenuItem
	 */
	var NavigationListMenuItem = MenuItem.extend("sap.tnt.NavigationListMenuItem", /** @lends sap.ui.unified.MenuItem.prototype */ { metadata : {

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

			/**
			 * Defines the link target URI. Supports standard hyperlink behavior. If a JavaScript action should be triggered,
			 * this should not be set, but instead an event handler for the <code>select</code> event should be registered.
			 */
			href: { type: "sap.ui.core.URI", group: "Data", defaultValue: null },

			/**
			 * Specifies the browsing context where the linked content will open.
			 *
			 * Options are the standard values for window.open() supported by browsers:
			 * <code>_self</code>, <code>_top</code>, <code>_blank</code>, <code>_parent</code>, <code>_search</code>.
			 * Alternatively, a frame name can be entered. This property is only used when the <code>href</code> property is set.
			 */
			target: { type: "string", group: "Behavior", defaultValue: null }
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
			oIcon,
			bIsExternalLink = this.getHref() && this.getTarget() === "_blank";

		rm.openStart("li", oItem);

		if (this.getHref()) {
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

		// External link "a" tag
		if (this.getHref()) {
			this._renderLinkTag(rm);
		}

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

		if (oSubMenu) {
			rm.class("sapTntNLIExpandIcon");
		}

		rm.openEnd();
		if (oSubMenu) {
			rm.openStart("div");
			rm.class("sapUiIconMirrorInRTL");
			rm.openEnd();
			rm.close("div");
		}
		rm.close("div");

		// External link icon
		if (bIsExternalLink) {
			const oIcon = this._getExternalLinkIcon();
			rm.renderControl(oIcon);
		}

		// End of external link "a" tag
		if (this.getHref()) {
			rm.close("a");
		}

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
	 * Handles click event.
	 *
	 * @param {sap.ui.base.Event} oEvent click event
	 * @private
	 */
	NavigationListMenuItem.prototype.onclick = function (oEvent) {
		oEvent.preventDefault();
		this._openUrl();
	};

	/**
	 * Handle the key down event for SPACE and ENTER.
	 * @param {jQuery.Event} oEvent - the keyboard event.
	 * @private
	 */
	NavigationListMenuItem.prototype.onkeyup = function (oEvent) {

		if (oEvent.which === KeyCodes.SPACE || oEvent.which === KeyCodes.ENTER) {
			this._openUrl();
		}
	};

	/**
	 * Opens a url.
	 *
	 * @private
	 */
	NavigationListMenuItem.prototype._openUrl = function () {
		const sHref = this.getHref();

		if (sHref) {
			openWindow(sHref, this.getTarget() || "_self");
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

	/**
	 * Renders opening tag of anchor element.
	 *
	 * @param {sap.ui.core.RenderManager} oRM renderer instance
	 * @private
	 */
	NavigationListMenuItem.prototype._renderLinkTag = function (oRM) {
		const sHref = this.getHref(),
			sTarget = this.getTarget(),
			bDisabled = this.getEnabled();

		oRM.openStart("a", `${this.getId()}-a`);

		const sTooltip = this.getTooltip_AsString() || this.getText();
		if (sTooltip) {
			oRM.attr("title", sTooltip);
		}

		if (!bDisabled) {
			oRM.attr("tabindex", "-1");
		}

		if (sHref) {
			oRM.attr("href", sHref);
		}

		if (sTarget) {
			oRM.attr("target", sTarget)
				.attr("rel", defaultLinkTypes("", sTarget));
		}

		oRM.openEnd();
	};

	return NavigationListMenuItem;
});
