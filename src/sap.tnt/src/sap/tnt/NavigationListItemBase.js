/*!
 * ${copyright}
 */

sap.ui.define([
	"./library",
	"sap/ui/core/Item",
	"sap/ui/core/Icon",
	"sap/ui/core/Lib",
	"sap/ui/events/KeyCodes",
	"sap/base/i18n/Localization"
], function (library, Item, Icon, Lib, KeyCodes, Localization) {
	"use strict";

	const EXPAND_ICON_SRC = "sap-icon://navigation-right-arrow";
	const COLLAPSE_ICON_SRC = "sap-icon://navigation-down-arrow";
	const EXTERNAL_LINK_ICON = "sap-icon://arrow-right";

	/**
	 * Constructor for a new <code>NavigationListItemBase</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The <code>NavigationListItemBase</code> class represents a base class for the items that are accepted by the <code>NavigationList</code> control.
	 * @extends sap.ui.core.Item
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @abstract
	 * @since 1.121
	 * @alias sap.tnt.NavigationListItemBase
	 */
	const NavigationListItemBase = Item.extend("sap.tnt.NavigationListItemBase", /** @lends sap.tnt.NavigationListItemBase.prototype */ {
		metadata: {
			library: "sap.tnt",
			properties: {
				/**
				 * Specifies if the item is expanded.
				 * @since 1.121
				 */
				expanded: { type: "boolean", group: "Misc", defaultValue: true },

				/**
				 * Specifies if the item is allowed to be expanded or collapsed by the user.
				 */
				hasExpander: { type: "boolean", group: "Misc", defaultValue: true },

				/**
				 * Specifies if the item should be shown.
				 *
				 * @since 1.121
				 */
				visible: { type: "boolean", group: "Appearance", defaultValue: true }

			},
			aggregations: {
				/**
				 * The icon for the expanded items.
				 * @since 1.121
				 */
				_expandIconControl: { type: "sap.ui.core.Icon", multiple: false, visibility: "hidden" },

				/**
				 * The icon for external links.
				 * @since 1.121
				 */
				_externalLinkIconControl: { type: "sap.ui.core.Icon", multiple: false, visibility: "hidden" }
			},
			events: {
				/**
				 * Fired when an item is pressed.
				 * @since 1.133
				 */
				press: {
					parameters: {
						/**
						 * The pressed item.
						 */
						item: { type: "sap.ui.core.Item" }
					}
				}
			}
		}
	});

	NavigationListItemBase.prototype.init = function () {
		this._resourceBundleCore = Lib.getResourceBundleFor("sap.ui.core");
		this._resourceBundleTnt = Lib.getResourceBundleFor("sap.tnt");
	};

	NavigationListItemBase.prototype.exit = function () {
		this._resourceBundleCore = null;
		this._resourceBundleTnt = null;
	};

	/**
	 * Gets the tree level of this item.
	 *
	 * @private
	 * @returns {number} level
	 */
	NavigationListItemBase.prototype.getLevel = function () {
		const iBaseLevel = 0;
		const oParent = this.getParent();
		if (oParent && oParent.isA("sap.tnt.NavigationListItem")) {
			return oParent.getLevel() + 1;
		}

		return iBaseLevel;
	};

	/**
	 * Gets the <code>NavigationList</code> control, which holds this item.
	 *
	 * @private
	 * @returns {sap.tnt.NavigationList} control instance
	 */
	NavigationListItemBase.prototype.getNavigationList = function () {
		let oParent = this.getParent();
		while (oParent && !oParent.isA("sap.tnt.NavigationList")) {
			oParent = oParent.getParent();
		}

		return oParent;
	};

	/**
	 * Returns false if any of the parents up the chain of items has its property enabled set to false.
	 * Otherwise returns true.
	 *
	 * @private
	 * @returns {boolean} enabled
	 */
	NavigationListItemBase.prototype.getAllParentsEnabled = function () {
		let oParent = this.getParent();
		while (oParent && !oParent.isA("sap.tnt.NavigationList")) {
			if (!oParent.getEnabled()) {
				return false;
			}

			oParent = oParent.getParent();
		}

		return true;
	};

	/**
	 * Returns true if the parent <code>NavigationList</code> control is expanded.
	 *
	 * @private
	 * @returns {boolean} expanded
	 */
	NavigationListItemBase.prototype._isListExpanded = function () {
		const oNavList = this.getNavigationList();
		if (!oNavList) {
			return false;
		}

		return oNavList.getExpanded() || oNavList.hasStyleClass("sapTntNLPopup");
	};

	/**
	 * If the item doesn't have a key, the function returns the ID of the <code>NavigationListItem</code>,
	 * so the <code>NavigationList</code> can remember the selected item.
	 *
	 * @private
	 * @returns {string} key
	 */
	NavigationListItemBase.prototype._getUniqueKey = function () {
		const sKey = this.getKey();
		return sKey ? sKey : this.getId();
	};

	/**
	 * Gets DOM references of the navigation items.
	 * @abstract
	 */
	NavigationListItemBase.prototype._getFocusDomRefs = function () { };

	/**
	 * Gets DOM reference of the accessibility element.
	 * @abstract
	 */
	NavigationListItemBase.prototype._getAccessibilityRef = function () { };

	/**
	 * Returns the <code>sap.ui.core.Icon</code> control used to display the expand/collapse icon.
	 *
	 * @returns {sap.ui.core.Icon} Icon control instance
	 * @private
	 */
	NavigationListItemBase.prototype._getExpandIconControl = function () {
		let oIcon = this.getAggregation("_expandIconControl");
		if (!oIcon) {
			const bExpanded = this.getExpanded();

			oIcon = new Icon({
				src: bExpanded ? COLLAPSE_ICON_SRC : EXPAND_ICON_SRC,
				visible: !!this.getItems()?.length && this.getHasExpander(),
				useIconTooltip: false,
				tooltip: this._getExpandIconTooltip(!bExpanded)
			}).addStyleClass(`sapTntNLIExpandIcon ${this._getExpandIconStyleClass()}`);

			this.setAggregation("_expandIconControl", oIcon, true);
		}

		return oIcon;
	};

	/**
	 * Returns the <code>sap.ui.core.Icon</code> control used to display the external link icon.
	 *
	 * @returns {sap.ui.core.Icon} Icon control instance
	 * @private
	 */
	NavigationListItemBase.prototype._getExternalIcon = function () {
		var oIcon = this.getAggregation("_externalLinkIconControl");

		if (!oIcon) {
			oIcon = new Icon({
				src: EXTERNAL_LINK_ICON
			}).addStyleClass(`sapTntNLIExternalLinkIcon`);
			this.setAggregation("_externalLinkIconControl", oIcon);
		}
		return oIcon;
	};

	/**
	 * Returns a custom style class for the _expandIconControl aggregation.
	 *
	 * @private
	 * @returns {string} custom style class
	 */
	NavigationListItemBase.prototype._getExpandIconStyleClass = function () {
		return "";
	};

	/**
	 * Gets the expand/collapse icon tooltip.
	 *
	 * @param {boolean} bExpanded whether the <code>NavigationListItemBase</code> is expanded
	 * @private
	 * @returns {string} sTooltip tooltip
	 */
	NavigationListItemBase.prototype._getExpandIconTooltip = function (bExpanded) {
		if (!this.getEnabled() || !this.getAllParentsEnabled()) {
			return "";
		}

		const sKey = bExpanded ? "Icon.expand" : "Icon.collapse";
		return this._resourceBundleCore.getText(sKey);
	};

	/**
	 * Returns the DOM Element that should get the focus.
	 *
	 * @return {Element} Returns the DOM Element that should get the focus
	 * @protected
	 */
	NavigationListItemBase.prototype.getFocusDomRef = function () {
		const oFocusRef = this.getDomRef()?.querySelector("[tabindex]");
		if (!oFocusRef) {
			return null;
		}

		return oFocusRef;
	};

	/**
	 * Handles key down event.
	 *
	 * @param {sap.ui.base.Event} oEvent keydown event
	 * @private
	 */
	NavigationListItemBase.prototype.onkeydown = function (oEvent) {
		if (oEvent.key ? oEvent.key === " " : oEvent.keyCode === KeyCodes.SPACE) {
			oEvent.preventDefault();
		}

		if (!this._isListExpanded()) {
			return;
		}

		if (oEvent.isMarked("subItem")) {
			return;
		}

		if (oEvent.srcControl.getLevel() === 1) {
			oEvent.setMarked("subItem");
		}

		if (this.getLevel() !== 0) {
			return;
		}

		const bRtl = Localization.getRTL();

		//  KeyCodes.MINUS is not returning 189
		if ((oEvent.shiftKey && oEvent.which == 189) ||
			oEvent.which == KeyCodes.NUMPAD_MINUS ||
			(oEvent.which == KeyCodes.ARROW_RIGHT && bRtl) ||
			(oEvent.which == KeyCodes.ARROW_LEFT && !bRtl)) {
			if (this.collapse()) {
				oEvent.preventDefault();
				// prevent ItemNavigation to move the focus to the next/previous item
				oEvent.stopPropagation();
			}
		} else if (oEvent.which == KeyCodes.NUMPAD_PLUS ||
			(oEvent.shiftKey && oEvent.which == KeyCodes.PLUS) ||
			oEvent.which == KeyCodes.ARROW_LEFT && bRtl ||
			oEvent.which == KeyCodes.ARROW_RIGHT && !bRtl) {
			if (this.expand()) {
				oEvent.preventDefault();
				// prevent ItemNavigation to move the focus to the next/previous item
				oEvent.stopPropagation();
			}
		}
	};

	/**
	 * Handles ontap event.
	 *
	 * @param {sap.ui.base.Event} oEvent tap event
	 * @private
	 * @returns {boolean} whether the event was handled
	 */
	NavigationListItemBase.prototype.ontap = function (oEvent) {
		const oParams = {
			item: this
		};

		if (this.getEnabled() && !(oEvent.srcControl.isA("sap.ui.core.Icon")) && !this._isOverflow && !(!this.getNavigationList().getExpanded() && this.getItems().length)) {
			this._firePress(oParams);

			oEvent.stopPropagation();
		}

		if (oEvent.isMarked("subItem")) {
			return true;
		}

		oEvent.setMarked("subItem");

		if (!this.getEnabled() || !this.getAllParentsEnabled()) {
			return true;
		}

		if (this._handleExpanderClick(oEvent)) {
			return true;
		}

		return false;
	};

	/**
	 * Fires a press event on an item.
	 * @param {object} oParams The event parameters
	 * @private
	 */
	NavigationListItemBase.prototype._firePress = function(oParams) {
		const oNavList = this.getNavigationList();

		oNavList?.fireItemPress({ item: this });
		this.firePress(oParams);
	};

	/**
	 * Handles the logic for expanding/collapsing the child items.
	 *
	 * @param {sap.ui.base.Event} oEvent tap event
	 * @private
	 * @returns {boolean} whether the event was handled
	 */
	NavigationListItemBase.prototype._handleExpanderClick = function (oEvent) {
		const sClickTargetClassName = this._getExpanderActivationTarget(),
			oClickedRef = oEvent.target.closest(sClickTargetClassName);
		if (!this._isListExpanded() || this.getLevel() !== 0 || !oClickedRef) {
			return false;
		}

		if (this.getExpanded()) {
			this.collapse();
		} else {
			this.expand();
		}

		return true;
	};

	/**
	 * Returns the root CSS selector of the element that will handle the expanding/collapsing of the child items.
	 *
	 * @private
	 * @returns {string} CSS selector of the target
	 */
	NavigationListItemBase.prototype._getExpanderActivationTarget = function () {
		if (!this.getSelectable() && !(this.getHref() && this.getTarget() === "_blank")) {
			return ".sapTntNLIFirstLevel";
		}
		return ".sapTntNLIExpandIcon";
	};

	/**
	 * Expands the child items (works only on first-level items).
	 * @returns {boolean} whether the items will be expanded
	 */
	NavigationListItemBase.prototype.expand = function () {
		if (this.getExpanded() || !this.getHasExpander() || this.getItems().length == 0 || this.getLevel() !== 0) {
			return false;
		}

		this.setProperty("expanded", true, true);
		this._getExpandIconControl()
			.setSrc(COLLAPSE_ICON_SRC)
			.setTooltip(this._getExpandIconTooltip(false));

		this._getAccessibilityRef().setAttribute("aria-expanded", "true");

		const $container = this.$().find(".sapTntNLIItemsContainer").first();
		$container.stop(true, true).slideDown("fast", () => {
			this._updateContainerVisibility();
			this.getNavigationList()?._updateNavItems();
		});

		return true;
	};

	NavigationListItemBase.prototype._updateContainerVisibility = function () {
		const oContainerRef = this.getDomRef()?.querySelector(".sapTntNLIItemsContainer");
		if (oContainerRef) {
			if (this.getExpanded()) {
				oContainerRef.classList.remove("sapTntNLIItemsContainerHidden");
			} else {
				oContainerRef.classList.add("sapTntNLIItemsContainerHidden");
			}
		}
	};

	/**
	 * Collapses the child items (works only on first-level items).
	 *
	 * @returns {boolean} whether the items will be collapsed
	 */
	NavigationListItemBase.prototype.collapse = function () {
		if (!this.getExpanded() || !this.getHasExpander() || this.getItems().length == 0 || this.getLevel() !== 0) {
			return false;
		}

		this.setProperty("expanded", false, true);
		this._getExpandIconControl()
			.setSrc(EXPAND_ICON_SRC)
			.setTooltip(this._getExpandIconTooltip(true));

		this._getAccessibilityRef().setAttribute("aria-expanded", "false");

		const $container = this.$().find(".sapTntNLIItemsContainer").first();
		$container.stop(true, true).slideUp("fast", () => {
			this._updateContainerVisibility();
			this.getNavigationList()?._updateNavItems();
		});

		return true;
	};

	NavigationListItemBase.prototype._isInsidePopover = function () {
		return !!this.getNavigationList()?.hasStyleClass("sapTntNLPopup");
	};

	return NavigationListItemBase;
});