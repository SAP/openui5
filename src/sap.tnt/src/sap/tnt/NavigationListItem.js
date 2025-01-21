/*!
 * ${copyright}
 */

// Provides control sap.tnt.NavigationListItem.
sap.ui.define([
	"./library",
	"sap/ui/core/Element",
	"sap/ui/core/InvisibleText",
	"sap/ui/core/Renderer",
	"sap/ui/core/IconPool",
	"sap/ui/core/library",
	"sap/ui/events/KeyCodes",
	"sap/ui/util/openWindow",
	"sap/ui/util/defaultLinkTypes",
	"./NavigationListItemBase"
], function (
	library,
	Element,
	InvisibleText,
	Renderer,
	IconPool,
	coreLibrary,
	KeyCodes,
	openWindow,
	defaultLinkTypes,
	NavigationListItemBase
) {
	"use strict";

	// shortcut for sap.ui.core.TextAlign
	var TextAlign = coreLibrary.TextAlign;

	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;

	const EXPAND_ICON_SRC = "sap-icon://navigation-right-arrow";
	const COLLAPSE_ICON_SRC = "sap-icon://navigation-down-arrow";

	/**
	 * Constructor for a new NavigationListItem.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The NavigationListItem represents a navigation action, which can be selected by the user.
	 * It can provide sub items.
	 * @extends sap.tnt.NavigationListItemBase
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.34
	 * @alias sap.tnt.NavigationListItem
	 */
	const NavigationListItem = NavigationListItemBase.extend("sap.tnt.NavigationListItem", /** @lends sap.tnt.NavigationListItem.prototype */ {
		metadata: {
			library: "sap.tnt",
			properties: {
				/**
				 * Specifies the icon for the item.
				 */
				icon: { type: "sap.ui.core.URI", group: "Misc", defaultValue: "" },

				/**
				 * Specifies if the item should be shown.
				 *
				 * @since 1.52
				 */
				visible: { type: "boolean", group: "Appearance", defaultValue: true },

				/**
				 * Specifies if the item can be selected.
				 * It is recommended to set this property to <code>false</code> when the property <code>href</code> is also used.
				 *
				 * @since 1.116
				 * @experimental Since 1.116. Disclaimer: this property is in a beta state
				 * - incompatible API changes may be done before its official public release.
				 */
				selectable: { type: "boolean", group: "Behavior", defaultValue: true },

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
			defaultAggregation: "items",
			aggregations: {

				/**
				 * The sub items.
				 */
				items: { type: "sap.tnt.NavigationListItem", multiple: true, singularName: "item" }
			},
			events: {
				/**
				 * Fired when this item is selected.
				 */
				select: {
					parameters: {
						/**
						 * The selected item.
						 */
						item: { type: "sap.ui.core.Item" }
					}
				}
			},
			designtime: "sap/tnt/designtime/NavigationListItem.designtime"
		}
	});

	NavigationListItem._getInvisibleText = function () {
		if (!this._invisibleText) {
			this._invisibleText = new InvisibleText().toStatic();
		}
		return this._invisibleText;
	};

	/**
	 * Creates a popup list.
	 *
	 * @returns {sap.tnt.NavigationList} The list for popup
	 * @private
	 */
	NavigationListItem.prototype.createListForPopup = function () {
		const aSubItems = this.getItems(),
			oList = this.getNavigationList(),
			oSelectedItem = oList.getSelectedItem();

		let oSelectedItemInPopup;

		const aClonedSubItems = aSubItems
			.filter((oItem) => oItem.getVisible())
			.map((oItem) => {
				const oClonedItem = new NavigationListItem({
					key: oItem.getId(),
					text: oItem.getText(),
					textDirection: oItem.getTextDirection(),
					enabled: oItem.getEnabled(),
					selectable: oItem.getSelectable(),
					href: oItem.getHref(),
					target: oItem.getTarget(),
					tooltip: oItem.getTooltip()
				});

				if (oSelectedItem === oItem) {
					oSelectedItemInPopup = oClonedItem;
				}

				return oClonedItem;
			});

		const oItemForList = new NavigationListItem({
			expanded: true,
			hasExpander: false,
			selectable: this.getSelectable(),
			key: this.getId(),
			text: this.getText(),
			enabled: this.getEnabled(),
			textDirection: this.getTextDirection(),
			href: this.getHref(),
			target: this.getTarget(),
			tooltip: this.getTooltip(),
			items: aClonedSubItems
		});

		const NavigationListClass = oList.getMetadata().getClass().prototype.constructor;
		const oListForPopup = new NavigationListClass({
			itemSelect: this.onPopupItemSelect.bind(this),
			items: oItemForList
		}).addStyleClass("sapTntNLPopup");

		if (oSelectedItem == this) {
			oSelectedItemInPopup = oItemForList;
			oListForPopup.isGroupSelected = true;
		}

		oListForPopup.setSelectedItem(oSelectedItemInPopup);

		return oListForPopup;
	};

	/**
	 * Handles popup item selection.
	 *
	 * @param {sap.ui.base.Event} oEvent item select event
	 * @private
	 */
	NavigationListItem.prototype.onPopupItemSelect = function (oEvent) {
		const oItemInPopup = oEvent.getParameter("item"),
			oRealItem = Element.getElementById(oItemInPopup.getKey());

		oRealItem._selectItem();
	};

	/**
	 * Selects this item.
	 *
	 * @private
	 */
	NavigationListItem.prototype._selectItem = function () {
		const oParams = {
			item: this
		};

		this.fireSelect(oParams);

		if (this.getSelectable()) {
			this.getNavigationList()._selectItem(oParams);
		}

		this._openUrl();
	};

	/**
	 * Opens a url.
	 *
	 * @private
	 */
	NavigationListItem.prototype._openUrl = function () {
		const sHref = this.getHref();

		if (sHref) {
			openWindow(sHref, this.getTarget() || "_self");
		}
	};

	/**
	 * Gets DOM reference of the accessibility element.
	 *
	 * @private
	 * @returns {HTMLElement} dom ref
	 */
	NavigationListItem.prototype._getAccessibilityRef = function () {
		return this.getDomRef().querySelector(".sapTntNLIFirstLevel");
	};

	/**
	 * Handles tap event.
	 *
	 * @param {sap.ui.base.Event} oEvent tap event
	 * @private
	 */
	NavigationListItem.prototype.ontap = function (oEvent) {
		if (NavigationListItemBase.prototype.ontap.apply(this, arguments)) {
			return;
		}

		oEvent.preventDefault();

		// second navigation level
		if (this.getLevel() > 0) {
			if (this.getEnabled() && this.getAllParentsEnabled()) {
				this._selectItem();
			}

			return;
		}

		const oNavList = this.getNavigationList();
		// first navigation level
		if (oNavList.getExpanded() || !this.getItems().length) {
			this._selectItem();
		} else {
			const oList = this.createListForPopup();
			oNavList._openPopover(this, oList);
		}
	};

	NavigationListItem.prototype.onkeydown = function (oEvent) {
		if (oEvent.isMarked("subItem")) {
			return;
		}

		const bHasModifierKey = this._hasModifierKey(oEvent);

		if ((oEvent.key ? oEvent.key === "Enter" : oEvent.keyCode === KeyCodes.ENTER) && !bHasModifierKey) {
			this.getDomRef().classList.add("sapTntNLIActive");
			this.ontap(oEvent);
		} else if ((oEvent.key ? oEvent.key === " " : oEvent.keyCode === KeyCodes.SPACE) && !bHasModifierKey) {
			this.getDomRef().classList.add("sapTntNLIActive");
		}

		//onkeyup is not called when new page is opened
		if (this.getHref() && this.getTarget() === "_blank") {
			this.getDomRef().classList.remove("sapTntNLIActive");
		}

		NavigationListItemBase.prototype.onkeydown.apply(this, arguments);
	};

	NavigationListItem.prototype.onkeyup = function (oEvent) {
		if (oEvent.isMarked("subItem")) {
			return;
		}

		const bHasModifierKey = this._hasModifierKey(oEvent);

		if ((oEvent.key ? oEvent.key === "Enter" : oEvent.keyCode === KeyCodes.ENTER) && !bHasModifierKey) {
			this.getDomRef().classList.remove("sapTntNLIActive");
		} else if ((oEvent.key ? oEvent.key === " " : oEvent.keyCode === KeyCodes.SPACE)) {
			this.getDomRef().classList.remove("sapTntNLIActive");

			if (!bHasModifierKey) {
				this.ontap(oEvent);
			}
		}

		if (oEvent.srcControl.getLevel() === 1) {
			oEvent.setMarked("subItem");
		}
	};

	/**
	 * Renders the item.
	 *
	 * @param {sap.ui.core.RenderManager} oRM renderer instance
	 * @param {sap.tnt.NavigationList} oNavigationList control instance
	 * @private
	 */
	NavigationListItem.prototype.render = function (oRM, oNavigationList) {
		if (!this.getVisible()) {
			return;
		}

		if (this.getLevel() === 0) {
			this.renderFirstLevelNavItem(oRM, oNavigationList);
		} else {
			this.renderSecondLevelNavItem(oRM, oNavigationList);
		}
	};


	/**
	 * Renders the first-level navigation item.
	 *
	 * @param {sap.ui.core.RenderManager} oRM renderer instance
	 * @param {sap.tnt.NavigationList} oNavigationList control instance
	 * @private
	 */
	NavigationListItem.prototype.renderFirstLevelNavItem = function (oRM, oNavigationList) {
		const aItems = this._getVisibleItems(this),
			bListExpanded = this._isListExpanded(),
			bEnabled = this.getEnabled() || this.getAllParentsEnabled();

		oRM.openStart("li", this)
			.attr("role", "none");

		if (!bListExpanded) {
			if (aItems.length && bEnabled) {
				oRM.class("sapTntNLINotExpandedTriangle");
			}

			if (this._isOverflow) {
				oRM.class("sapTntNLOverflow")
					.class("sapTntNLIHidden");
			}
		}

		oRM.openEnd();

		const sSubtreeId = `${this.getId()}-subtree`;
		this.renderMainElement(oRM, oNavigationList, sSubtreeId);

		if (bListExpanded && aItems.length) {
			oRM.openStart("ul", sSubtreeId)
				.class("sapTntNLIItemsContainer")
				.accessibilityState({
					role: "group",
					label: this.getText()
				});

			if (!this.getExpanded()) {
				oRM.class("sapTntNLIItemsContainerHidden");
			}

			oRM.openEnd();

			aItems.forEach((oItem) => oItem.render(oRM, oNavigationList));

			oRM.close("ul");
		}

		oRM.close("li");
	};

	/**
	 * Render external link icon
	 *  @param {sap.ui.core.RenderManager} oRM renderer instance
	 */
	NavigationListItem.prototype._renderExternalLinkIcon =  function (oRM) {
		if (!(this.getHref() && this.getTarget() === "_blank")) {
			return;
		}
		const oIcon = this._getExternalIcon();
		oRM.renderControl(oIcon);
	};

	/**
	 * Renders the group item.
	 *
	 * @param {sap.ui.core.RenderManager} oRM renderer instance
	 * @param {sap.tnt.NavigationList} oNavigationList control instance
	 * @param {string} sSubtreeId ID of child items wrapper element
	 * @private
	 */
	NavigationListItem.prototype.renderMainElement = function (oRM, oNavigationList, sSubtreeId) {
		const bListExpanded = this._isListExpanded(),
			aItems = this._getVisibleItems(this),
			bDisabled = !this.getEnabled() || !this.getAllParentsEnabled(),
			bExpanded = this.getExpanded(),
			bSelectable = this.getSelectable(),
			bExpanderVisible = !!aItems.length && this.getHasExpander();

		oRM.openStart("div")
			.class("sapTntNLI")
			.class("sapTntNLIFirstLevel");

		if (bDisabled) {
			oRM.class("sapTntNLIDisabled");
		}

		let bSelected = false;
		if (bSelectable && oNavigationList._selectedItem === this) {
			oRM.class("sapTntNLISelected");
			bSelected = true;
		}

		if (!bListExpanded && aItems.includes(oNavigationList._selectedItem)) {
			oRM.class("sapTntNLISelected");
			bSelected = true;
		}

		if (bExpanderVisible) {
			oRM.class("sapTntNLIWithExpander");
		}

		const oLinkAriaProps = {};
		if (!bListExpanded) {
			oLinkAriaProps.role = bSelectable ? "menuitemradio" : "menuitem";

			if (aItems.length) {
				oLinkAriaProps.haspopup = "tree";
			}

			if (this._isOverflow) {
				oLinkAriaProps.haspopup = "menu";
			}

			if (bSelectable) {
				oLinkAriaProps.checked = oNavigationList._selectedItem === this;
			}

			oLinkAriaProps.roledescription = this._resourceBundleTnt.getText("NAVIGATION_LIST_ITEM_ROLE_DESCRIPTION_MENUITEM");
		} else {
			oLinkAriaProps.role = "treeitem";

			if (bSelected) {
				oLinkAriaProps.current = "page";
			}

			if (aItems.length) {
				oLinkAriaProps.owns = sSubtreeId;
				oLinkAriaProps.expanded = bExpanded;
			}
		}

		oRM.openEnd();

		this._renderStartLink(oRM, oLinkAriaProps, bDisabled);

		this._renderIcon(oRM);

		this._renderText(oRM);

		this._renderExternalLinkIcon(oRM);

		if (bListExpanded) {
			const oIcon = this._getExpandIconControl();
			oIcon.setVisible(bExpanderVisible)
				.setSrc(bExpanded ? COLLAPSE_ICON_SRC : EXPAND_ICON_SRC)
				.setTooltip(this._getExpandIconTooltip(!bExpanded));

			oRM.renderControl(oIcon);
		}

		if (!bListExpanded && this.getItems().length) {
			const oIcon = this._getExpandIconControl().setSrc(EXPAND_ICON_SRC);
			oRM.renderControl(oIcon);
		}

		this._renderCloseLink(oRM);

		oRM.close("div");
	};

	/**
	 * Renders the second-level navigation item.
	 *
	 * @param {sap.ui.core.RenderManager} oRM renderer instance
	 * @param {sap.tnt.NavigationList} oNavigationList control instance
	 * @private
	 */
	NavigationListItem.prototype.renderSecondLevelNavItem = function (oRM, oNavigationList) {
		const bDisabled = !this.getEnabled() || !this.getAllParentsEnabled();

		oRM.openStart("li", this)
			.class("sapTntNLI")
			.class("sapTntNLISecondLevel")
			.attr("role", "none");

		let bSelected = false;
		if (this.getSelectable() && oNavigationList._selectedItem === this) {
			oRM.class("sapTntNLISelected");
			bSelected = true;
		}

		if (bDisabled) {
			oRM.class("sapTntNLIDisabled");
		}

		oRM.openEnd();

		const oLinkAriaProps = {
			role: "treeitem",
			current: this._isListExpanded() && bSelected ? "page" : undefined
		};
		this._renderStartLink(oRM, oLinkAriaProps, bDisabled);

		this._renderIcon(oRM);

		this._renderText(oRM);

		this._renderExternalLinkIcon(oRM);

		this._renderCloseLink(oRM);

		oRM.close("li");
	};

	/**
	 * Renders opening tag of anchor element.
	 *
	 * @param {sap.ui.core.RenderManager} oRM renderer instance
	 * @param {object} oAriaProps object with aria properties
	 * @param {boolean} bDisabled whether the item is disabled
	 * @private
	 */
	NavigationListItem.prototype._renderStartLink = function (oRM, oAriaProps, bDisabled) {
		const sHref = this.getHref(),
			sTarget = this.getTarget();

		oRM.openStart("a", `${this.getId()}-a`)
			.accessibilityState(this, {
				...oAriaProps
			});

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

	/**
	 * Closes anchor element.
	 *
	 * @param {sap.ui.core.RenderManager} oRM renderer instance
	 * @private
	 */
	NavigationListItem.prototype._renderCloseLink = function (oRM) {
		oRM.close("a");
	};

	/**
	 * Renders an icon.
	 *
	 * @param {sap.ui.core.RenderManager} oRM renderer instance
	 * @private
	 */
	NavigationListItem.prototype._renderIcon = function (oRM) {
		const sIconSrc = this.getIcon(),
			oIconInfo = IconPool.getIconInfo(sIconSrc);

		// Manually rendering the icon instead of using RenderManager's writeIcon. In this way title
		// attribute is not rendered and the tooltip of the icon does not override item's tooltip
		oRM.openStart("span")
			.class("sapUiIcon")
			.class("sapTntNLIIcon")
			.attr("aria-hidden", "true");

		if (sIconSrc) {
			if (oIconInfo && !oIconInfo.suppressMirroring) {
				oRM.class("sapUiIconMirrorInRTL");
			}

			if (oIconInfo) {
				oRM.attr("data-sap-ui-icon-content", oIconInfo.content)
					.style("font-family", `'${oIconInfo.fontFamily}'`);
			}
		}

		oRM.openEnd().close("span");
	};

	/**
	 * Renders a text.
	 *
	 * @param {sap.ui.core.RenderManager} oRM renderer instance
	 * @private
	 */
	NavigationListItem.prototype._renderText = function (oRM) {
		oRM.openStart("span")
			.class("sapMText")
			.class("sapTntNLIText")
			.class("sapMTextNoWrap");

		const sTextDir = this.getTextDirection();
		if (sTextDir !== TextDirection.Inherit) {
			oRM.attr("dir", sTextDir.toLowerCase());
		}

		const sTextAlign = Renderer.getTextAlign(TextAlign.Begin, sTextDir);
		if (sTextAlign) {
			oRM.style("text-align", sTextAlign);
		}

		oRM.openEnd()
			.text(this.getText())
			.close("span");
	};

	/**
	 * Switches this item between selected and unselected states.
	 * Changes the attributes that were set during the render functions.
	 *
	 * @param {boolean} bSelected the new value of the property selected to adjust to
	 * @private
	 */
	NavigationListItem.prototype._toggle = function (bSelected) {
		const oNavigationList = this.getNavigationList(),
			bListExpanded = this._isListExpanded();

		if (!oNavigationList || !oNavigationList.getDomRef()) {
			return;
		}

		const oRootRef = this.getDomRef();
		if (this.getLevel() === 0) {
			const oMainRef = oRootRef?.querySelector(".sapTntNLIFirstLevel");
			oMainRef?.classList.toggle("sapTntNLISelected", bSelected);
		}

		if (this.getLevel() !== 0) {
			if (bListExpanded) {
				oRootRef?.classList.toggle("sapTntNLISelected", bSelected);
			} else {
				// Items on Second Level do not get rendered in a collapsed list, so they don't have DomRefs

				const oParentMainRef = this.getParent().getDomRef()?.querySelector(".sapTntNLIFirstLevel");
				oParentMainRef?.classList.toggle("sapTntNLISelected", bSelected);
				if (bSelected) {
					oParentMainRef?.classList.toggle("sapTntNLINoHoverEffect", bSelected);
				}
			}
		}

		this._syncAriaAttributes(this.getFocusDomRef(), bSelected, bListExpanded);

		oNavigationList._closePopover();
	};

	NavigationListItem.prototype._syncAriaAttributes = function (oFocusRef, bSelected, bListExpanded) {
		if (!oFocusRef) {
			return;
		}

		if (bListExpanded) {
			if (bSelected) {
				oFocusRef.setAttribute("aria-current", "page");
			} else {
				oFocusRef.removeAttribute("aria-current");
			}
		} else {
			oFocusRef.setAttribute("aria-checked", bSelected ? "true" : "false");
		}
	};

	/**
	 * Gets DOM references of the navigation items.
	 *
	 * @private
	 * @returns {Array<HTMLElement>} array of dom refs
	 */
	NavigationListItem.prototype._getFocusDomRefs = function () {
		const aDomRefs = [];

		if (!this.getEnabled() || !this.getVisible()) {
			return aDomRefs;
		}

		aDomRefs.push(this.getDomRef("a"));

		if (this._isListExpanded() && this.getExpanded()) {
			aDomRefs.push(...this.getDomRef().querySelectorAll(".sapTntNLISecondLevel:not(.sapTntNLIDisabled) a"));
		}

		return aDomRefs;
	};

	/**
	 * Returns all the items aggregation marked as visible
	 *
	 * @param {sap.tnt.NavigationList|sap.tnt.NavigationListItem} oControl The control to check for visible items
	 * @return {sap.tnt.NavigationListItem[]} All the visible NavigationListItems
	 * @private
	 */
	NavigationListItem.prototype._getVisibleItems = function (oControl) {
		return oControl.getItems().filter((oItem) => oItem.getVisible());
	};

	/**
	 * Handles click event.
	 *
	 * @param {sap.ui.base.Event} oEvent click event
	 * @private
	 */
	NavigationListItem.prototype.onclick = function (oEvent) {
		// prevent click event on <a> element, in order to avoid unnecessary href changing
		// this will be handled by _openUrl
		if (this.getHref()) {
			oEvent.preventDefault();
		}
	};

	/**
	 * Handles mousedown event.
	 *
	 * @param {sap.ui.base.Event} oEvent click event
	 * @private
	 */
	NavigationListItem.prototype.onmousedown = function (oEvent) {
		// prevent focusin event to be fired on <a> element
		// ItemNavigation will take care of focusing it
		if (this.getHref()) {
			oEvent.preventDefault();
		}
	};

	/**
	 * Handles focusout event.
	 * Removes the temporary class set which disabled the showing of the text during hover and focus.
	 *
	 * @private
	 */
	NavigationListItem.prototype.onfocusout = function () {
		var oMainRef = this.getDomRef()?.querySelector(".sapTntNLIFirstLevel");
		if (oMainRef) {
			oMainRef.classList.remove("sapTntNLINoHoverEffect");
		}
	};

	NavigationListItem.prototype.onmouseout = function () {
		const oMainRef = this.getDomRef()?.querySelector(".sapTntNLIFirstLevel");
		const oNavList = this.getNavigationList();
		const oSubItemSelected = this.getItems().find((oItem) => oItem === oNavList.getSelectedItem());

		if (oMainRef && (this === oNavList.getSelectedItem() || oSubItemSelected)) {
			oMainRef.classList.add("sapTntNLINoHoverEffect");
		}
	};

	NavigationListItem.prototype.onmouseover = NavigationListItem.prototype.onfocusout;

	NavigationListItem.prototype._hasModifierKey = 	function hasModifierKeys(oEvent) {
		return oEvent.shiftKey || oEvent.altKey || oEvent.ctrlKey || oEvent.metaKey;
	};

	return NavigationListItem;
});
