/*!
 * ${copyright}
 */

// Provides control sap.tnt.NavigationList
sap.ui.define([
	"sap/ui/thirdparty/jquery",
	'./library',
	'sap/ui/core/Core',
	'sap/ui/core/Element',
	'sap/ui/core/Control',
	'sap/ui/core/ResizeHandler',
	'sap/ui/core/Popup',
	'sap/m/Popover',
	'sap/ui/core/delegate/ItemNavigation',
	'sap/ui/core/InvisibleText',
	"./NavigationListItem",
	"./NavigationListRenderer",
	"sap/m/Menu",
	"sap/m/MenuItem",
	"sap/base/Log"
],
	function(
		jQuery,
		library,
		Core,
		Element,
		Control,
		ResizeHandler,
		Popup,
		Popover,
		ItemNavigation,
		InvisibleText,
		NavigationListItem,
		NavigationListRenderer,
		Menu,
		MenuItem,
		Log
	) {
		"use strict";

		/**
		 * Constructor for a new NavigationList.
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
		var NavigationList = Control.extend("sap.tnt.NavigationList", /** @lends sap.tnt.NavigationList.prototype */ {
			metadata: {
				library: "sap.tnt",
				properties: {
					/**
					 * Specifies the width of the control.
					 */
					width: {type: "sap.ui.core.CSSSize", group: "Dimension"},
					/**
					 * Specifies if the control is in expanded or collapsed mode.
					 */
					expanded: {type: "boolean", group: "Misc", defaultValue: true},
					/**
					 * Specifies the currently selected key.
					 *
					 * @since 1.62.0
					 */
					selectedKey: {type: "string", group: "Data"}
				},
				defaultAggregation: "items",
				aggregations: {

					/**
					 * The items displayed in the list.
					 */
					items: {type: "sap.tnt.NavigationListItem", multiple: true, singularName: "item"},

					/**
					 * The overflow item.
					 */
					_overflowItem: {type: "sap.tnt.NavigationListItem", multiple: false, visibility: "hidden"}
				},
				associations: {
					/**
					 * Association to controls / IDs, which describe this control (see WAI-ARIA attribute aria-describedby).
					 */
					ariaDescribedBy: {type: "sap.ui.core.Control", multiple: true, singularName: "ariaDescribedBy"},

					/**
					 * Association to controls / IDs, which label this control (see WAI-ARIA attribute aria-labelledby).
					 */
					ariaLabelledBy: {type: "sap.ui.core.Control", multiple: true, singularName: "ariaLabelledBy"},

					/**
					 * The currently selected <code>NavigationListItem</code>.
					 *
					 * @since 1.52.0
					 */
					selectedItem: {type: "sap.tnt.NavigationListItem", multiple: false}
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
							item: {type: "sap.ui.core.Item"}
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
			this._itemNavigation = new ItemNavigation();
			this._itemNavigation.setCycling(false);
			this.addEventDelegate(this._itemNavigation);

			this._itemNavigation.setPageSize(10);
			this._itemNavigation.setDisabledModifiers({
				sapnext: ["alt", "meta"],
				sapprevious: ["alt", "meta"]
			});
		};

		/**
		 * Called before the control is rendered.
		 */
		NavigationList.prototype.onBeforeRendering = function () {
			this._deregisterResizeHandler();

			// make sure the initial selected item (if any) is correct
			var selectedKey = this.getSelectedKey();
			this.setSelectedKey(selectedKey);
		};

		/**
		 * Called after the control is rendered.
		 */
		NavigationList.prototype.onAfterRendering = function () {
			this._itemNavigation.setRootDomRef(this.getDomRef());
			this._itemNavigation.setItemDomRefs(this._getDomRefs());

			if (this.getExpanded()) {
				return;
			}

			// clear the vertical scroll when collapsed
			this.getDomRef().scrollTop = 0;
			this._resizeListenerId = ResizeHandler.register(this.getDomRef().parentNode, this._resize.bind(this));

			if (Core.isThemeApplied()) {
				this._updateOverflowItems();
			} else {
				Core.attachThemeChanged(this._handleThemeLoad, this);
			}
		};

		NavigationList.prototype._deregisterResizeHandler = function () {
			if (this._resizeListenerId) {
				ResizeHandler.deregister(this._resizeListenerId);
				this._resizeListenerId = null;
			}
		};

		NavigationList.prototype._handleThemeLoad = function () {
			this._updateOverflowItems();
			Core.detachThemeChanged(this._handleThemeLoad, this);
		};

		NavigationList.prototype._resize = function () {
			this._updateOverflowItems();
		};

		NavigationList.prototype._updateOverflowItems = function () {
			var domRef = this.getDomRef(),
				computedStyle,
				items,
				overflowItem,
				selectedItem,
				listHeight,
				itemsHeight = 0;

			if (this.getExpanded() || !domRef) {
				return;
			}

			items = domRef.querySelectorAll("li:not(.sapTnTNavLIOverflow)");
			overflowItem = domRef.querySelector(".sapTnTNavLIOverflow");

			if (!overflowItem) {
				return;
			}

			overflowItem.classList.add("sapTnTNavLIHiddenItem");

			items.forEach(function (item) {
				item.classList.remove("sapTnTNavLIHiddenItem");
				itemsHeight += item.offsetHeight;
			});

			computedStyle = window.getComputedStyle(domRef);
			listHeight = domRef.offsetHeight - parseFloat(computedStyle.paddingTop) - parseFloat(computedStyle.paddingBottom);

			if (listHeight >= itemsHeight) {
				return;
			}

			overflowItem.classList.remove("sapTnTNavLIHiddenItem");
			itemsHeight = overflowItem.offsetHeight;

			selectedItem = domRef.querySelector(".sapTntNavLIItemSelected");
			if (selectedItem) {
				selectedItem = selectedItem.parentNode;
				itemsHeight += selectedItem.offsetHeight;
				computedStyle = window.getComputedStyle(selectedItem);
				itemsHeight += parseFloat(computedStyle.marginTop) + parseFloat(computedStyle.marginBottom);
			}

			items.forEach(function (item) {
				if (item === selectedItem) {
					return;
				}

				itemsHeight += item.offsetHeight;
				computedStyle = window.getComputedStyle(item);
				itemsHeight += parseFloat(computedStyle.marginTop) + parseFloat(computedStyle.marginBottom);

				if (itemsHeight >= listHeight) {
					item.classList.add("sapTnTNavLIHiddenItem");
				}
			});
		};

		NavigationList.prototype._getOverflowItem = function () {
			var overflowItem = this.getAggregation("_overflowItem");
			if (!overflowItem) {
				overflowItem = new NavigationListItem({
					text: Core.getLibraryResourceBundle("sap.tnt").getText("NAVIGATION_LIST_NAVIGATION_OVERFLOW"),
					icon: "sap-icon://overflow",
					selectable: false,
					select: this._overflowPress.bind(this)
				});

				overflowItem._isOverflow = true;

				this.setAggregation("_overflowItem", overflowItem);
			}

			return overflowItem;
		};

		NavigationList.prototype._overflowPress = function (event) {
			var menu = this._createOverflowMenu();
			menu.openBy(event.getSource(), false, Popup.Dock.EndCenter);
		};

		NavigationList.prototype._createOverflowMenu = function () {
			var menu = new Menu({
				items: this._createNavigationMenuItems(),
				itemSelected: function (event) {
					var selectedItem = event.getParameter("item"),
						selectedItemDomRef;

					this._selectItem({
						item: selectedItem._navItem
					});

					selectedItemDomRef = this.getDomRef().querySelector(".sapTntNavLIItemSelected");

					if (selectedItemDomRef) {
						selectedItemDomRef.parentNode.focus();
					}

					menu.close();
					menu.destroy();
				}.bind(this)
			});

			menu.addStyleClass("sapTntNavLIMenu");

			// override this method, so we can have a selection
			// on a menu item with subitems
			menu._handleMenuItemSelect = function(oEvent) {
				var oUnfdItem = oEvent.getParameter("item"),
					oMenuItem;

				if (!oUnfdItem) {
					return;
				}

				oMenuItem = this._findMenuItemByUnfdMenuItem(oUnfdItem);

				if (oMenuItem) {
					this.fireItemSelected({item: oMenuItem});
				}
			}.bind(menu);

			this.addDependent(menu);

			return menu;
		};

		NavigationList.prototype._createNavigationMenuItems = function () {
			var items = this.getItems(),
				menuItems = [];

			items.forEach(function (item) {
				if (!item.getVisible() || !item.getDomRef().classList.contains("sapTnTNavLIHiddenItem")) {
					return;
				}

				var menuItem = new MenuItem({
					icon: item.getIcon(),
					text: item.getText(),
					enabled: item.getEnabled()
				});
				menuItem._navItem = item;

				item.getItems().forEach(function (subItem) {
					var subMenuItem = new MenuItem({
						icon: subItem.getIcon(),
						text: subItem.getText(),
						enabled: subItem.getEnabled()
					});
					subMenuItem._navItem = subItem;

					menuItem.addItem(subMenuItem);
				});

				menuItems.push(menuItem);
			});

			return menuItems;
		};

		NavigationList.prototype._updateNavItems = function () {
			this._itemNavigation.setItemDomRefs(this._getDomRefs());
		};

		/**
		 * Gets DOM references of the navigation items.
		 * @private
		 */
		NavigationList.prototype._getDomRefs = function () {
			var domRefs = [],
				items = this.getItems(),
				isExpanded = this.getExpanded(),
				overflowItemDomRef = this.getAggregation("_overflowItem").getDomRef();

			for (var i = 0; i < items.length; i++) {
				if (isExpanded) {
					jQuery.merge(domRefs, items[i]._getDomRefs());
				} else {
					domRefs.push(items[i].getDomRef());
				}
			}

			if (!isExpanded && overflowItemDomRef) {
				domRefs.push(overflowItemDomRef);
			}

			return domRefs;
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
		 * Clears the control dependencies.
		 * @private
		 */
		NavigationList.prototype.exit = function () {
			if (this._itemNavigation) {
				this._itemNavigation.destroy();
			}

			if (this._popover) {
				this._popover.destroy();
			}

			this._deregisterResizeHandler();
		};

		/**
		 * Selects an item.
		 * @private
		 */
		NavigationList.prototype._selectItem = function (params) {
			this.fireItemSelect(params);

			var item = params.item;
			this.setSelectedItem(item, true);
		};

		NavigationList.prototype._findItemByKey = function (selectedKey) {
			var groupItems = this.getItems(),
				groupItem,
				items,
				item,
				i,
				j;

			for (i = 0; i < groupItems.length; i++) {
				groupItem = groupItems[i];
				if (groupItem._getUniqueKey() === selectedKey) {
					return groupItem;
				}

				items = groupItem.getItems();

				for (j = 0; j < items.length; j++) {
					item = items[j];
					if (item._getUniqueKey() === selectedKey) {
						return item;
					}
				}
			}

			return null;
		};

		/**
		 * Sets the selected item based on a key.
		 * @public
		 * @param {string} selectedKey The key of the item to be selected
		 * @return {this} this pointer for chaining
		 */
		NavigationList.prototype.setSelectedKey = function (selectedKey) {

			var item = this._findItemByKey(selectedKey);
			this.setSelectedItem(item, true);

			this.setProperty('selectedKey', selectedKey, true);

			return this;
		};

		/**
		 * Gets the currently selected <code>NavigationListItem</code>.
		 * @public
		 * @return {sap.tnt.NavigationListItem|null} The selected item or <code>null</code> if nothing is selected
		 */
		NavigationList.prototype.getSelectedItem = function () {
			var selectedItem = this.getAssociation('selectedItem');

			if (!selectedItem) {
				return null;
			}

			return sap.ui.getCore().byId(selectedItem);
		};

		/**
		 * Sets the association for selectedItem. Set <code>null</code> to deselect.
		 * @public
		 * @param {string|sap.tnt.NavigationListItem} selectedItem The control to be set as selected
		 * @return {sap.tnt.NavigationList|null} The <code>selectedItem</code> association
		 */
		NavigationList.prototype.setSelectedItem = function (selectedItem) {
			var navigationListItem,
				selectedKey,
				isNavigationListItem;

			if (this._selectedItem) {
				this._selectedItem._unselect();
			}

			if (!selectedItem) {
				this._selectedItem = null;
			}

			isNavigationListItem = selectedItem instanceof Element && selectedItem.isA("sap.tnt.NavigationListItem");

			if (typeof selectedItem !== 'string' && !isNavigationListItem) {
				Log.warning('Type of selectedItem association should be string or instance of sap.tnt.NavigationListItem. New value was not set.');
				this.setAssociation('selectedItem', null, true);

				this._updateOverflowItems();

				return this;
			}

			this.setAssociation('selectedItem', selectedItem, true);

			if (typeof selectedItem === 'string') {
				navigationListItem = sap.ui.getCore().byId(selectedItem);
			} else {
				navigationListItem = selectedItem;
			}

			selectedKey = navigationListItem ? navigationListItem._getUniqueKey() : '';
			this.setProperty('selectedKey', selectedKey, true);

			if (navigationListItem) {
				navigationListItem._select();
				this._selectedItem = navigationListItem;

				this._updateOverflowItems();

				return this;
			}

			Log.warning('Type of selectedItem association should be a valid NavigationListItem object or ID. New value was not set.');
			return this;
		};

		/**
		 * Opens a popover.
		 * @private
		 */
		NavigationList.prototype._openPopover = function (source, list) {

			var that = this;
			var $sourceItem = source.$().find(".sapTntNavLIItem").addClass("sapTntNavLIActive");
			var selectedItem = list.getSelectedItem();
			if (selectedItem && list.isGroupSelected) {
				selectedItem = null;
			}

			var popover = this._popover = new Popover({
				showHeader: false,
				horizontalScrolling: false,
				verticalScrolling: true,
				initialFocus: selectedItem,
				afterClose: function () {
					if (that._popover) {
						that._popover.destroy();
						that._popover = null;
						$sourceItem.removeClass("sapTntNavLIActive");
					}
				},
				content: list,
				ariaLabelledBy: InvisibleText.getStaticId("sap.tnt", "NAVIGATION_LIST_DIALOG_TITLE")
			}).addStyleClass('sapContrast sapContrastPlus');

			popover._adaptPositionParams = this._adaptPopoverPositionParams;
			popover.openBy(source);
		};

		NavigationList.prototype._closePopover = function () {
			if (this._popover) {
				this._popover.close();
			}
		};

		return NavigationList;

	});