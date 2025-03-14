/*!
 * ${copyright}
 */

// Provides control sap.ui.unified.MenuItem.
sap.ui.define([
	'sap/ui/core/IconPool',
	'sap/m/MenuItem',
	'sap/ui/core/library',
	'sap/ui/core/Icon',
	"sap/ui/util/defaultLinkTypes",
	"sap/ui/util/openWindow",
	"sap/ui/events/KeyCodes",
	"./NavigationListMenuItemRenderer"
	],
	function (
		IconPool,
		MenuItem,
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

		library : "sap.tnt",
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

	/**
	 * Handles click event.
	 *
	 * @param {sap.ui.base.Event} oEvent click event
	 * @private
	 */
	NavigationListMenuItem.prototype.onclick = function (oEvent) {
		if (!this.getEnabled()) {
			return;
		}

		if (!this._navItem._firePress(oEvent, this._navItem)) {
			return;
		}

		oEvent.preventDefault();
		this._openUrl();

		const oNavigationItem = this._navItem;
		const oNavigationList = oNavigationItem.getNavigationList();

		if (oNavigationItem.getSelectable()) {
			oNavigationList._selectItem({
				item: oNavigationItem
			});

			const oMenu = this._oMenu;
			oMenu.close();
			oMenu.destroy();

			const oSelectedItemDomRef = oNavigationList.getDomRef().querySelector(".sapTntNLISelected [tabindex]");
			oSelectedItemDomRef?.focus();
		}
	};

	/**
	 * Handle the key up event for SPACE and ENTER.
	 * @param {jQuery.Event} oEvent - the keyboard event.
	 * @private
	 */
	NavigationListMenuItem.prototype.onkeyup = function (oEvent) {
		if (oEvent.which === KeyCodes.SPACE && this._bSpacePressed && !this._bPressedEscapeOrShift) {
			this.onclick(oEvent);
		}

		this._bSpacePressed = false;
		this._bPressedEscapeOrShift = false;
	};

	/**
	 * Handle the key down event for SPACE and ENTER.
	 * @param {jQuery.Event} oEvent - the keyboard event.
	 * @private
	 */
	NavigationListMenuItem.prototype.onkeydown = function (oEvent) {
		if (oEvent.which === KeyCodes.ENTER) {
			this.onclick(oEvent);
		} else if (oEvent.which === KeyCodes.SPACE) {
			// To prevent the browser scrolling.
			this._bSpacePressed = true;
			oEvent.preventDefault();
		} else if (oEvent.which === KeyCodes.SHIFT || oEvent.which === KeyCodes.ESCAPE) {
			this._bPressedEscapeOrShift = true;
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
	 * @override
	 */
	NavigationListMenuItem.prototype._createPopover = function () {
		const oPopover = MenuItem.prototype._createPopover.apply(this, arguments);
		oPopover.addStyleClass("sapMSubmenu");
		oPopover.addStyleClass("sapTntNLMenu");

		return oPopover;
	};

	return NavigationListMenuItem;
});
