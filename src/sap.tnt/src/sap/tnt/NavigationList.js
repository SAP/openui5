/*!
 * ${copyright}
 */

// Provides control sap.tnt.NavigationList
sap.ui.define([
	"./library",
	"sap/ui/core/Lib",
	"sap/ui/core/Theming",
	"sap/ui/core/Element",
	"sap/ui/core/Control",
	"sap/ui/core/ResizeHandler",
	"sap/ui/core/Popup",
	"sap/m/library",
	"sap/m/Popover",
	"sap/ui/core/delegate/ItemNavigation",
	"sap/ui/core/InvisibleText",
	"./NavigationListItem",
	"./NavigationListMenuItem",
	"./NavigationListRenderer",
	"sap/m/Menu",
	"sap/base/Log"
], function (
	library,
	Lib,
	Theming,
	Element,
	Control,
	ResizeHandler,
	Popup,
	mLibrary,
	Popover,
	ItemNavigation,
	InvisibleText,
	NavigationListItem,
	NavigationListMenuItem,
	NavigationListRenderer,
	Menu,
	Log
) {
	"use strict";

	// shortcut for sap.m.PlacementType
	var PlacementType = mLibrary.PlacementType;

	/**
	 * Constructor for a new <code>NavigationList</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The NavigationList control is an interactive control, which provides a choice of
	 * different items, ordered as a list.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.34
	 * @alias sap.tnt.NavigationList
	 */
	const NavigationList = Control.extend("sap.tnt.NavigationList", /** @lends sap.tnt.NavigationList.prototype */ {
		metadata: {
			library: "sap.tnt",
			properties: {
				/**
				 * Specifies the width of the control.
				 */
				width: { type: "sap.ui.core.CSSSize", group: "Dimension" },
				/**
				 * Specifies if the control is in expanded or collapsed mode.
				 */
				expanded: { type: "boolean", group: "Misc", defaultValue: true },
				/**
				 * Specifies the currently selected key.
				 *
				 * @since 1.62.0
				 */
				selectedKey: { type: "string", group: "Data" }
			},
			defaultAggregation: "items",
			aggregations: {

				/**
				 * The items displayed in the list.
				 */
				items: { type: "sap.tnt.NavigationListItemBase", multiple: true, singularName: "item" },

				/**
				 * The overflow item.
				 */
				_overflowItem: { type: "sap.tnt.NavigationListItem", multiple: false, visibility: "hidden" }
			},
			associations: {
				/**
				 * Association to controls / IDs, which describe this control (see WAI-ARIA attribute aria-describedby).
				 */
				ariaDescribedBy: { type: "sap.ui.core.Control", multiple: true, singularName: "ariaDescribedBy" },

				/**
				 * Association to controls / IDs, which label this control (see WAI-ARIA attribute aria-labelledby).
				 */
				ariaLabelledBy: { type: "sap.ui.core.Control", multiple: true, singularName: "ariaLabelledBy" },

				/**
				 * The currently selected <code>NavigationListItem</code>.
				 *
				 * @since 1.52.0
				 */
				selectedItem: { type: "sap.tnt.NavigationListItem", multiple: false }
			},
			events: {
				/**
				 * Fired when an item is selected.
				 */
				itemSelect: {
					parameters: {
						/**
						 * The selected item.
						 */
						item: { type: "sap.ui.core.Item" }
					}
				},
				/**
				 * Fired when an item is pressed.
				 */
				itemPress: {
					allowPreventDefault: true,
					parameters: {
						/**
						 * The pressed item.
						 */
						item: { type: "sap.ui.core.Item" },
						/**
						 * Indicates whether the CTRL key was pressed when the link was selected.
						 * @since 1.137
						 */
						ctrlKey: { type: "boolean" },
						/**
						 * Indicates whether the Shift key was pressed when the link was selected.
						 * @since 1.137
						 */
						shiftKey: { type: "boolean" },
						/**
						 * Indicates whether the Alt key was pressed when the link was selected.
						 * @since 1.137
						 */
						altKey: { type: "boolean" },
						/**
						 * Indicates whether the "meta" key was pressed when the link was selected.
						 *
						 * On Macintosh keyboards, this is the command key (⌘).
						 * On Windows keyboards, this is the windows key (⊞).
						 *
						 * @since 1.137
						 */
						metaKey: { type: "boolean" }
					}
				}
			}
		},

		renderer: NavigationListRenderer
	});

	/**
	 * Initializes the control.
	 * @private
	 * @override
	 */
	NavigationList.prototype.init = function () {
		this._oItemNavigation = new ItemNavigation();
		this._oItemNavigation.setCycling(false)
			.setPageSize(10)
			.setDisabledModifiers({
				sapnext: ["alt", "meta"],
				sapprevious: ["alt", "meta"]
			});

		this.addDelegate(this._oItemNavigation);
		this._handleThemeAppliedBound = this._handleThemeApplied.bind(this);
	};

	/**
	 * Clears the control dependencies.
	 * @private
	 */
	NavigationList.prototype.exit = function () {
		if (this._oItemNavigation) {
			this.removeDelegate(this._oItemNavigation);
			this._oItemNavigation.destroy();
			this._oItemNavigation = null;
		}

		if (this._oPopover) {
			this._oPopover.destroy();
			this._oPopover = null;
		}

		this._deregisterResizeHandler();

		Theming.detachApplied(this._handleThemeAppliedBound);
	};

	/**
	 * Called before the control is rendered.
	 */
	NavigationList.prototype.onBeforeRendering = function () {
		this._deregisterResizeHandler();

		// make sure the initial selected item (if any) is correct
		const sSelectedKey = this.getSelectedKey();
		this.setSelectedKey(sSelectedKey);
	};

	/**
	 * Called after the control is rendered.
	 */
	NavigationList.prototype.onAfterRendering = function () {
		this._oItemNavigation.setRootDomRef(this.getDomRef());

		this._animateExpandCollapse();

		this._updateNavItems();

		if (this.getExpanded()) {
			return;
		}

		// clear the vertical scroll when collapsed
		this.getDomRef().scrollTop = 0;
		this._sResizeListenerId = ResizeHandler.register(this.getDomRef().parentNode, this._resize.bind(this));

		Theming.attachApplied(this._handleThemeAppliedBound);
	};

	NavigationList.prototype._animateExpandCollapse = function () {
		const aAllItems = this.getItems().flatMap((item) => [item, ...item.getItems()]);
		const oAnimateExpandItem = aAllItems.find((oItem) => oItem._animateExpand);

		if (oAnimateExpandItem) {
			oAnimateExpandItem._animateExpand = false;
			oAnimateExpandItem.$()
				.find(".sapTntNLIItemsContainer")
				.first()
				.stop(true, true)
				.slideDown("fast", () => {
					oAnimateExpandItem.$().find(".sapTntNLIItemsContainer").first().removeClass("sapTntNLIItemsContainerHidden");
				});
		}

		const oAnimateCollapseItem = aAllItems.find((oItem) => oItem._animateCollapse);

		if (oAnimateCollapseItem) {
			oAnimateCollapseItem._animateCollapse = false;
			oAnimateCollapseItem.$()
				.find(".sapTntNLIItemsContainer")
				.first()
				.stop(true, true)
				.slideUp("fast", () => {
					oAnimateCollapseItem.$().find(".sapTntNLIItemsContainer").first().addClass("sapTntNLIItemsContainerHidden");
				});
		}
	};

	NavigationList.prototype._deregisterResizeHandler = function () {
		if (this._sResizeListenerId) {
			ResizeHandler.deregister(this._sResizeListenerId);
			this._sResizeListenerId = null;
		}
	};

	NavigationList.prototype._handleThemeApplied = function () {
		Theming.detachApplied(this._handleThemeAppliedBound);

		this._updateOverflowItems();
	};

	NavigationList.prototype._resize = function () {
		this._updateOverflowItems();
	};

	NavigationList.prototype._updateOverflowItems = function () {
		var oDomRef = this.getDomRef();
		if (this.getExpanded() || !oDomRef) {
			return;
		}

		const oOverflowItemRef = oDomRef.querySelector(".sapTntNLOverflow");
		if (!oOverflowItemRef) {
			return;
		}

		oOverflowItemRef.classList.add("sapTntNLIHidden");

		const aItemsRefs = [...oDomRef.querySelectorAll("ul > :not(.sapTntNLOverflow)")];
		let iItemsHeight = aItemsRefs.reduce((iSum, oItemRef) => {
			oItemRef.classList.remove("sapTntNLIHidden");
			return iSum + oItemRef.offsetHeight;
		}, 0);

		const { paddingTop, paddingBottom } = window.getComputedStyle(oDomRef);
		const iListHeight = oDomRef.offsetHeight - parseFloat(paddingTop) - parseFloat(paddingBottom);

		if (iListHeight >= iItemsHeight) {
			return;
		}

		oOverflowItemRef.classList.remove("sapTntNLIHidden");
		iItemsHeight = oOverflowItemRef.offsetHeight;

		let oSelectedItemRef = oDomRef.querySelector(".sapTntNLISelected");
		if (oSelectedItemRef) {
			oSelectedItemRef = oSelectedItemRef.parentNode;

			const { marginTop, marginBottom } = window.getComputedStyle(oSelectedItemRef);
			iItemsHeight += oSelectedItemRef.offsetHeight + parseFloat(marginTop) + parseFloat(marginBottom);
		}

		aItemsRefs.forEach((oItemRef) => {
			if (oItemRef === oSelectedItemRef) {
				return;
			}

			const { marginTop, marginBottom }  = window.getComputedStyle(oItemRef);
			iItemsHeight += oItemRef.offsetHeight + parseFloat(marginTop) + parseFloat(marginBottom);

			if (iItemsHeight >= iListHeight) {
				oItemRef.classList.add("sapTntNLIHidden");
			}
		});
	};

	NavigationList.prototype._getOverflowItem = function () {
		let oOverflowItem = this.getAggregation("_overflowItem");
		if (!oOverflowItem) {
			oOverflowItem = new NavigationListItem({
				text: Lib.getResourceBundleFor("sap.tnt").getText("NAVIGATION_LIST_NAVIGATION_OVERFLOW"),
				icon: "sap-icon://overflow",
				selectable: false,
				select: this._overflowPress.bind(this)
			});

			oOverflowItem._isOverflow = true;

			this.setAggregation("_overflowItem", oOverflowItem);
		}

		return oOverflowItem;
	};

	NavigationList.prototype._overflowPress = function (oEvent) {
		const oOpener = oEvent.getSource();
		oOpener.getDomRef().querySelector(".sapTntNLI").classList.add("sapTntNLIActive");

		const oMenu = this._createOverflowMenu(oOpener);

		const oPopover = oMenu._getPopover();
		oPopover.setPlacement(PlacementType.Right);

		oMenu.openBy(oOpener, false, Popup.Dock.EndCenter);
	};

	NavigationList.prototype._createOverflowMenu = function (opener) {
		const oMenu = new Menu({
			closed: function () {
				opener.getDomRef().querySelector(".sapTntNLI").classList.remove("sapTntNLIActive");
			}
		});

		oMenu.applySettings({
			items: this._createNavigationMenuItems(oMenu)
		});

		oMenu.addStyleClass("sapTntNLMenu");
		this.addDependent(oMenu);
		return oMenu;
	};

	NavigationList.prototype._createNavigationMenuItems = function (oMenu) {
		var items = [],
			menuItems = [];

		this.getItems().forEach((item) => {
			if (item.isA("sap.tnt.NavigationListGroup")) {
				items.push(...item.getItems());
			} else {
				items.push(item);
			}
		});

		items.forEach(function (item) {
			if (!item.getVisible() || !item.getDomRef().classList.contains("sapTntNLIHidden")) {
				return;
			}

			var menuItem = new NavigationListMenuItem({
				icon: item.getIcon(),
				text: item.getText(),
				tooltip: item.getTooltip_AsString() || item.getText(),
				visible: item.getVisible(),
				enabled: item.getEnabled(),
				href: item.getHref(),
				target: item.getTarget()
			});
			menuItem._navItem = item;
			menuItem._oMenu = oMenu;

			item.getItems().forEach(function (subItem) {
				var subMenuItem = new NavigationListMenuItem({
					icon: subItem.getIcon(),
					text: subItem.getText(),
					tooltip: subItem.getTooltip_AsString() || subItem.getText(),
					visible: subItem.getVisible(),
					enabled: subItem.getEnabled(),
					href: subItem.getHref(),
					target: subItem.getTarget()
				});
				subMenuItem._navItem = subItem;
				subMenuItem._oMenu = oMenu;

				menuItem.addItem(subMenuItem);
			});

			menuItems.push(menuItem);
		});

		return menuItems;
	};

	NavigationList.prototype._updateNavItems = function () {
		const aDomRefs = this._getFocusDomRefs();
		this._oItemNavigation.setItemDomRefs(aDomRefs);
	};

	/**
	 * Gets DOM references of the navigation items.
	 * @private
	 */
	NavigationList.prototype._getFocusDomRefs = function () {
		const aDomRefs = this.getItems().flatMap((oItem) => oItem._getFocusDomRefs()),
			oOverflowDomRef = this._getOverflowItem().getDomRef("a");

		if (!this.getExpanded() && oOverflowDomRef) {
			aDomRefs.push(oOverflowDomRef);
		}

		return aDomRefs;
	};

	/**
	 * Adapts popover position.
	 * @private
	 */
	NavigationList.prototype._adaptPopoverPositionParams = function () {
		if (this.getShowArrow()) {
			this._marginLeft = 10;
			this._marginRight = 10;
			this._marginBottom = 10;

			this._arrowOffset = 8;
			this._offsets = ["0 -8", "8 0", "0 8", "-8 0"];

			this._myPositions = ["center bottom", "begin top", "center top", "end top"];
			this._atPositions = ["center top", "end top", "center bottom", "begin top"];
		} else {
			this._marginTop = 0;
			this._marginLeft = 0;
			this._marginRight = 0;
			this._marginBottom = 0;

			this._arrowOffset = 0;
			this._offsets = ["0 0", "0 0", "0 0", "0 0"];

			this._myPositions = ["begin bottom", "begin top", "begin top", "end top"];
			this._atPositions = ["begin top", "end top", "begin bottom", "begin top"];
		}
	};

	/**
	 * Selects an item.
	 * @private
	 */
	NavigationList.prototype._selectItem = function (oParams) {
		this.fireItemSelect(oParams);
		this.setSelectedItem(oParams.item);
	};

	NavigationList.prototype._findItemByKey = function (sKey) {
		const aAllItems = this.findAggregatedObjects(true, (oObject) => oObject.isA("sap.tnt.NavigationListItem"));
		return aAllItems.find((oItem) => oItem._getUniqueKey() === sKey);
	};

	/**
	 * Sets the selected item based on a key.
	 * @public
	 * @param {string} sSelectedKey The key of the item to be selected
	 * @return {this} this pointer for chaining
	 */
	NavigationList.prototype.setSelectedKey = function (sSelectedKey) {
		const oItem = this._findItemByKey(sSelectedKey);
		this.setSelectedItem(oItem);

		return this.setProperty("selectedKey", sSelectedKey, true);
	};

	/**
	 * Gets the currently selected <code>NavigationListItem</code>.
	 * @public
	 * @return {sap.tnt.NavigationListItem|null} The selected item or <code>null</code> if nothing is selected
	 */
	NavigationList.prototype.getSelectedItem = function () {
		return Element.getElementById(this.getAssociation("selectedItem")) || null;
	};

	/**
	 * Sets the association for selectedItem. Set <code>null</code> to deselect.
	 * @public
	 * @param {sap.ui.core.ID|sap.tnt.NavigationListItem} oItem The control to be set as selected
	 * @return {sap.tnt.NavigationList|null} The <code>selectedItem</code> association
	 */
	NavigationList.prototype.setSelectedItem = function (oItem) {
		let oSelectedItem;
		if (this._selectedItem) {
			this._selectedItem._toggle(false);
		}

		if (!oItem) {
			this._selectedItem = null;
		}

		const bValidItemType = oItem && oItem.isA && oItem.isA("sap.tnt.NavigationListItem");
		if (typeof oItem != "string" && !bValidItemType) {
			this.setAssociation("selectedItem", null, true);
			this._updateOverflowItems();
			oItem = null;
		}

		this.setAssociation("selectedItem", oItem, true);

		if (typeof oItem == "string") {
			oSelectedItem = Element.getElementById(oItem);
		} else if (bValidItemType) {
			oSelectedItem = oItem;
		} else {
			Log.warning("Type of selectedItem association should be a valid NavigationListItem object or ID. New value was not set.");
			return this;
		}

		this.setProperty("selectedKey", oSelectedItem._getUniqueKey(), true);

		oSelectedItem._toggle(true);
		this._selectedItem = oSelectedItem;
		this._updateOverflowItems();

		return this;
	};

	/**
	 * Opens a popover.
	 * @private
	 */
	NavigationList.prototype._openPopover = function (oOpener, oList) {
		const oOpenerMainRef = oOpener.getDomRef().querySelector(".sapTntNLI");
		oOpenerMainRef.classList.add("sapTntNLIActive");
		let oSelectedItem = oList.getSelectedItem();
		if (oSelectedItem && oList.isGroupSelected) {
			oSelectedItem = null;
		}

		this._oPopover = new Popover({
			showHeader: false,
			horizontalScrolling: false,
			verticalScrolling: true,
			initialFocus: oSelectedItem,
			afterClose: () => {
				if (this._oPopover) {
					this._oPopover.destroy();
					this._oPopover = null;
					oOpenerMainRef.classList.remove("sapTntNLIActive");
				}
			},
			content: oList,
			ariaLabelledBy: InvisibleText.getStaticId("sap.tnt", "NAVIGATION_LIST_DIALOG_TITLE")
		}).addStyleClass("sapContrast sapContrastPlus sapTntNLPopover");

		this._oPopover._adaptPositionParams = this._adaptPopoverPositionParams;
		this._oPopover.openBy(oOpener.getDomRef("a"));
	};

	NavigationList.prototype._closePopover = function () {
		if (this._oPopover) {
			this._oPopover.close();
		}
	};

	NavigationList.prototype._containsIcon = function () {
		const aFound = this.findAggregatedObjects(true,
			(oObject) => oObject.isA("sap.tnt.NavigationListItem") && !oObject._isOverflow && oObject.getProperty("icon")
		);

		return !!aFound.length;
	};

	return NavigationList;
});
