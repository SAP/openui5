/*!
 * ${copyright}
 */

// Provides control sap.m.Menu.
sap.ui.define([
	'./library',
	'sap/ui/core/library',
	'sap/ui/core/Control',
	'./Button',
	'./Dialog',
	'./NavContainer',
	'./List',
	'./Page',
	'./MenuListItem',
	"sap/ui/core/Lib",
	'sap/ui/unified/Menu',
	'sap/ui/unified/MenuItem',
	'sap/ui/unified/MenuItemGroup',
	'sap/ui/Device',
	'sap/ui/core/EnabledPropagator',
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/Popup",
	"sap/ui/core/Element"
],
	function(
		library,
		coreLibrary,
		Control,
		Button,
		Dialog,
		NavContainer,
		List,
		Page,
		MenuListItem,
		Library,
		UfdMenu,
		UfdMenuItem,
		UfdMenuItemGroup,
		Device,
		EnabledPropagator,
		jQuery,
		Popup,
		Element
	) {
		"use strict";

		// shortcut for sap.ui.core.Popup.Dock
		var Dock = Popup.Dock;

		// shortcut for sap.m.ListType
		var ListType = library.ListType;

		// shortcut for sap.m.ListMode
		var ListMode = library.ListMode;

		// shortcut for sap.ui.core.ItemSelectionMode
		var ItemSelectionMode = coreLibrary.ItemSelectionMode;

		/**
		 * Constructor for a new Menu.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * The <code>sap.m.Menu</code> control represents a hierarchical menu.
		 * When opened on mobile devices it occupies the whole screen.
		 *
		 * <b>Note:</b> The application developer should add dependency to <code>sap.ui.unified</code> library
		 * on application level to ensure that the library is loaded before the module dependencies will be required.
		 * If the <code>sap.ui.unified</code> library is not loaded in advance, this
		 * could lead to CSP compliance issues and adds an additional waiting time.
		 * To prevent this, ensure that the <code>sap.ui.unified</code> library is loaded in advance.
		 *
		 * @extends sap.ui.core.Control
		 * @implements sap.ui.core.IContextMenu
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @alias sap.m.Menu
		 */
		var Menu = Control.extend("sap.m.Menu", /** @lends sap.m.Menu.prototype */ {
			metadata : {
				interfaces: [
					"sap.ui.core.IContextMenu"
				],
				library : "sap.m",
				properties : {
					/**
					 * Defines the <code>Menu</code> title.
					 */
					title : { type : "string", group : "Misc", defaultValue : null }
				},
				defaultAggregation: "items",
				aggregations: {
					/**
					 * Defines the items contained within this control.
					 */
					items: { type: "sap.m.IMenuItem", multiple: true, singularName: "item", bindable: "bindable" },

					/**
					 * Internal aggregation that contains the inner <code>sap.m.Dialog</code> for mobile.
					 */
					_dialog: { type: "sap.m.Dialog", multiple: false, visibility: "hidden" },

					/**
					 * Internal aggregation that contains the inner <code>sap.ui.unified.Menu</code> for desktop and tablet.
					 */
					_menu: { type: "sap.ui.unified.Menu", multiple: false, visibility: "hidden" }
				},
				events: {
					/**
					 * Fired when a <code>MenuItem</code> is selected.
					 */
					itemSelected: {
						parameters: {
							/**
							 * The <code>MenuItem</code> which was selected.
							 */
							item : {type : "sap.m.MenuItem" }
						}
					},

					/**
					 * Fired when the menu is closed.
					 */
					closed: {}
				}
			},
			renderer: null // this is a popup control without a renderer
		});

		EnabledPropagator.call(Menu.prototype);


		/**
		 * Unified Menu items ID prefix.
		 *
		 * @type {string}
		 */
		Menu.UNIFIED_MENU_ITEMS_ID_SUFFIX = '-unifiedmenu';

		/**
		 * Map of all available properties in the sap.ui.unified.MenuItem.
		 * Needed when syncs between sap.m.MenuItem and unified.MenuItem are performed.
		 * @type {Object<string,Object>}
		 * @private
		 */
		Menu.UNFIFIED_MENU_ITEMS_PROPS = UfdMenuItem.getMetadata().getAllProperties();

		/**
		 * List items ID prefix.
		 *
		 * @type {string}
		 */
		Menu.LIST_ITEMS_ID_SUFFIX = '-menuinnerlist';


		/**
		 * Map of all available properties in the sap.m.MenuListItem
		 * Needed when syncs between sap.m.MenuItem and sap.m.MenuListItem are performed.
		 * @type {Object<string,Object>}
		 * @private
		 */
		Menu.MENU_LIST_ITEMS_PROPS = MenuListItem.getMetadata().getAllProperties();

		/**
		 * Initializes the control.
		 * @public
		 */
		Menu.prototype.init = function() {
			if (Device.system.phone) {
				this._initDialog();
			}
			this._bIsInitialized = false;
			// attach event handlers responsible for keeping sap.m.MenuItem and sap.ui.unified.MenuItem, sap.m.MenuListItem instances at sync
			this.attachEvent("propertyChanged", this._onPropertyChanged, this);
			this.attachEvent("aggregationChanged", this._onAggregationChanged, this);
		};

		/**
		 * Called from parent if the control is destroyed.
		 */
		Menu.prototype.exit = function() {
			if (this._navContainerId) {
				this._navContainerId = null;
			}
			if (this._bIsInitialized) {
				this._bIsInitialized = null;
			}

			if (this._getMenu() && this._getMenu().getPopup()) {
				this._getMenu().getPopup().detachClosed(this._menuClosed, this);
			}
		};

		Menu.prototype.invalidate = function() {
			//the parent control is most probably the menu opener, so do not invalidate it,
			//let it do it's own changes when the menu is open
		};

		/**
		 * Sets the title of the <code>Menu</code>.
		 * @param {string} sTitle The new title of the <code>Menu</code>
		 * @returns {this} <code>this</code> to allow method chaining
		 * @public
		 */
		Menu.prototype.setTitle = function(sTitle) {
			var oNavContainer = this._getNavContainer();

			this.setProperty("title", sTitle, true);

			if (oNavContainer && oNavContainer.getPages().length) {
				oNavContainer.getPages()[0].setTitle(sTitle);
			}

			return this;
		};

		/**
		 * Opens the <code>Menu</code> next to the given control.
		 * @param {sap.ui.core.Control} oControl The control that defines the position for the menu
		 * @param {boolean} bWithKeyboard Whether the menu is opened with a shortcut or not
		 * @param {sap.ui.core.Dock} [sDockMy=sap.ui.core.Popup.Dock.BeginTop] The reference docking location
		 * of the <code>Menu</code> for positioning the menu on the screen
		 * @param {sap.ui.core.Dock} [sDockAt=sap.ui.core.Popup.Dock.BeginBottom] The <code>oControl</code>
		 * reference docking location for positioning the menu on the screen
		 * @param {string} [sOffset="0 -2"] The offset relative to the docking point,
		 * specified as a string with space-separated pixel values (e.g. "0 10" to move the popup 10 pixels to the right).
		 * If the docking of both "my" and "at" is RTL-sensitive ("begin" or "end"), this offset is automatically mirrored in the RTL case as well.
		 * @public
		 */
		Menu.prototype.openBy = function(oControl, bWithKeyboard, sDockMy, sDockAt, sOffset) {
			if (Device.system.phone) {
				this._openDialog();
			} else {
				if (!this._bIsInitialized) {
					this._initAllMenuItems();
					this._bIsInitialized = true;
				}

				if (!sDockMy) {
					sDockMy = Dock.BeginTop;
				}
				if (!sDockAt) {
					sDockAt = Dock.BeginBottom;
				}
				if (!sOffset) {
					sOffset = "0 -2";
				}
				this._getMenu().open(bWithKeyboard, oControl, sDockMy, sDockAt, oControl, sOffset);
			}
		};

		/**
		 * Closes the <code>Menu</code>.
		 * @public
		 */
		Menu.prototype.close = function() {
			if (Device.system.phone) {
				this._getDialog() && this._getDialog().close();
			} else {
				this._getVisualParent() && this._getVisualParent().close();
			}
		};

		/**
		 * Returns whether the <code>Menu</code> is currently open.
		 * @returns {boolean} true if menu is open
		 * @public
		 */
		Menu.prototype.isOpen = function() {
			if (Device.system.phone) {
				return this._getDialog() && this._getDialog().isOpen();
			} else {
				return this._getVisualParent() && this._getVisualParent().isOpen();
			}
		};

		/**
		 * Creates the dialog that contains the actual menu for mobile.
		 * @private
		 */
		Menu.prototype._initDialog = function() {
			var oDialog = new Dialog({
				showHeader: false,
				stretch: true,
				content: this._initNavContainer(),
				buttons: [
					this._initCloseButton()
				]
			});
			oDialog.addStyleClass("sapMRespMenuDialog");
			// remove padding for the menu on phone
			oDialog.addStyleClass("sapUiNoContentPadding");
			this.setAggregation("_dialog", oDialog, true);
			oDialog.attachAfterClose(this._menuClosed, this);
		};

		/**
		 * Gets the internal dialog.
		 * @returns {sap.m.Dialog} The internal _dialog aggregation
		 * @private
		 */
		Menu.prototype._getDialog = function() {
			return this.getAggregation("_dialog");
		};

		/**
		 * Opens the internal dialog.
		 * @private
		 */
		Menu.prototype._openDialog = function() {
			if (!this._bIsInitialized) {
				this._initAllPages();
				this._bIsInitialized = true;
			}

			//reset to first page
			this._getNavContainer().to(this._getNavContainer().getPages()[0]);
			this._getDialog().open();
		};

		Menu.prototype._initAllMenuItems = function() {
			this._initMenuForItems(this.getItems());
		};

		/**
		 * Allows for any custom function to be called back when accessibility attributes
		 * of underlying menu are about to be rendered.
		 * The function is called once per MenuItem
		 *
		 * @param {function} fn The callback function
		 * @private
		 * @ui5-restricted ObjectPageLayoutABHelper
		 * @returns {void}
		 */
		Menu.prototype._setCustomEnhanceAccStateFunction = function(fn) {
			this._fnEnhanceUnifiedMenuAccState = fn;
		};

		Menu.prototype._initMenuForItems = function(aItems, oParentMenuItem) {
			var oMenu = new UfdMenu();
			oMenu._setCustomEnhanceAccStateFunction(this._fnEnhanceUnifiedMenuAccState);
			oMenu.isCozy = this._isMenuCozy.bind(this, oMenu);

			// Keep in mind that we are adding the style class to sap.m.Menu as the CustomStyleClassSupport is sync
			// in a Mimic mode so only styles added to sap.m.Menu will be applied.
			this.addStyleClass('sapMMenu');

			// Every new menu style class properties should be a reference to the control style class properties.
			// This is needed because every menu level has a new popup like DOM structure in the static area and it's
			// a sibling and not a child of the previous menu. Keep in mind that if the sap.m.Menu introduces a renderer
			// in the future this must not be propagated like this not to pollute the control itself with classes
			// from the children.
			oMenu.aCustomStyleClasses = this.aCustomStyleClasses;
			oMenu.mCustomStyleClassMap = this.mCustomStyleClassMap;

			aItems.forEach(function(oItem) {
				if (this._isMenuItemGroup(oItem)) {
					this._addVisualMenuItemGroupFromItemsGroup(oItem, oMenu);
				} else {
					this._addVisualMenuItemFromItem(oItem, oMenu);
				}
			}.bind(this));

			if (oParentMenuItem) {
				oParentMenuItem.setSubmenu(oMenu);
			} else {
				oMenu.getPopup().attachClosed(this._menuClosed, this);
				this.setAggregation('_menu', oMenu, true);
			}

			oMenu.attachItemSelect(this._handleMenuItemSelect, this);
		};

		Menu.prototype._menuClosed = function() {
			this.fireClosed();
		};

		Menu.prototype._getMenu = function() {
			return this.getAggregation("_menu");
		};

		Menu.prototype._initCloseButton = function() {
			var oRB = Library.getResourceBundleFor("sap.m");

			return new Button({
				text: oRB.getText("MENU_CLOSE"),
				press: fnBtnClosePressHandler.bind(this)
			});
		};

		function fnBtnClosePressHandler() {
			this._getDialog().close();
		}

		Menu.prototype._initNavContainer = function() {
			var oNavContainer = new NavContainer();
			this._navContainerId = oNavContainer.getId();
			return oNavContainer;
		};

		/**
		 * Gets the internal <code>sap.m.NavContainer</code> for mobile.
		 * @returns {sap.m.NavContainer} The sap.m.NavContainer
		 * @private
		 */
		Menu.prototype._getNavContainer = function() {
			return Element.getElementById(this._navContainerId);
		};

		Menu.prototype._initAllPages = function() {
			this._initPageForParent(this);
		};

		Menu.prototype._initPageForParent = function(oParent) {
			var aItems = oParent.getItems(),
				isRootPage = oParent instanceof Menu,
				sPageTitle = isRootPage ? oParent.getTitle() : oParent.getText(),
				oList = new List({
					mode: ListMode.None
				}),
				oPage = new Page({
					title: sPageTitle,
					showNavButton: !isRootPage,
					content: oList
				});

			if (!isRootPage) {
				this._setBackButtonTooltipForPageWithParent(oParent, oPage);
			}

			oPage.attachNavButtonPress(function() {
				this._getNavContainer().back();
			}, this);

			this._getNavContainer().addPage(oPage);

			aItems.forEach(function(oItem) {
				this._addListItemFromItem(oItem, oPage);
			}, this);

			this._updateListInset(oList);

			oList.attachEvent("itemPress", this._handleListItemPress, this);

			return oPage;
		};

		Menu.prototype._handleListItemPress = function(oEvent) {
			var oListItem = oEvent.getParameter("listItem"),
				oMenuItem = Element.getElementById(oListItem.getMenuItem()),
				pageId = oMenuItem._getItems().length ? oMenuItem._getVisualChild() : null,
				bSelected = !oListItem.getProperty("selected");

			if (pageId) {
				this._getNavContainer().to(pageId);
			} else {
				this._getDialog().close();
				if (oListItem._getItemSelectionMode() !== ItemSelectionMode.None) {
					oListItem.setSelected(bSelected);
					oMenuItem.setSelected(bSelected);
				}

				this.fireItemSelected({ item: oMenuItem });
			}
			oMenuItem.firePress();
		};

		/**
		 * Sets an ARIA tooltip for a back button of a page.
		 * @param {object} oParent The parent item for the page
		 * @param {object} oPage The page
		 * @private
		 */
		Menu.prototype._setBackButtonTooltipForPageWithParent = function(oParent, oPage) {
			var oParentParent = oParent.getParent(),
				oRb = Library.getResourceBundleFor("sap.m"),
				sParentPageTitle;

			sParentPageTitle = oParentParent instanceof Menu ? oParentParent.getTitle() : oParentParent.getText();
			sParentPageTitle = oRb.getText("MENU_PAGE_BACK_BUTTON") + " " + sParentPageTitle;
			oPage.setNavButtonTooltip(sParentPageTitle);
		};

		/**
		 * Checks if an item is a MenuItemGroup or not.
		 * @param {sap.m.IMenuItem} oItem The item to be checked
		 * @returns {boolean} Whether the item is a MenuItemGroup or not
		 * @private
		 */
		Menu.prototype._isMenuItemGroup = function(oItem) {
			return !!oItem.getItemSelectionMode;
		};

		Menu.prototype._createMenuListItemFromItem = function(oItem) {
			var sMenuListItemId = this._generateListItemId(oItem.getId()),
				oListItem = Element.getElementById(sMenuListItemId),
				oItemGroup = Element.getElementById(oItem.getAssociation("_group"));

			if (oListItem) {
				return oListItem;
			}

			oListItem = new MenuListItem({
				id  : sMenuListItemId,
				type: oItem.getEnabled() ? ListType.Active : ListType.Inactive,
				icon: oItem.getIcon(),
				title: oItem.getText(),
				selected: oItem.getSelected(),
				startsSection: oItem.getStartsSection(),
				menuItem: oItem,
				tooltip: oItem.getTooltip(),
				visible: oItem.getVisible(),
				enabled: oItem.getEnabled()
			});

			oListItem.setAssociation("_group", oItemGroup);

			oItem.aDelegates.forEach(function(oDelegateObject) {
				oListItem.addEventDelegate(oDelegateObject.oDelegate, oDelegateObject.vThis);
			});

			return oListItem;
		};

		Menu.prototype._createVisualMenuItemFromItem = function(oItem) {
			var sUfdMenuItemId = this._generateUnifiedMenuItemId(oItem.getId()),
				oUfdMenuItem = Element.getElementById(sUfdMenuItemId),
				aCustomData = oItem.getCustomData();

			if (oUfdMenuItem) {
				return oUfdMenuItem;
			}

			oUfdMenuItem = new UfdMenuItem({
				id: sUfdMenuItemId,
				icon: oItem.getIcon(),
				text: oItem.getText(),
				selected: oItem.getSelected(),
				shortcutText: oItem.getShortcutText(),
				startsSection: oItem.getStartsSection(),
				tooltip: oItem.getTooltip(),
				visible: oItem.getVisible(),
				enabled: oItem.getEnabled()
			});

			for (var i = 0; i < aCustomData.length; i++) {
				oItem._addCustomData(oUfdMenuItem, aCustomData[i]);
			}

			oItem.aDelegates.forEach(function(oDelegateObject) {
				oUfdMenuItem.addEventDelegate(oDelegateObject.oDelegate, oDelegateObject.vThis);
			});

			return oUfdMenuItem;
		};

		Menu.prototype._addVisualMenuItemFromItem = function(oItem, oMenuOrGroup, iIndex) {
			var oMenuItem = this._createVisualMenuItemFromItem(oItem),
				oMenuParent = this._isMenuItemGroup(oMenuOrGroup) ? oMenuOrGroup.getParent() : oMenuOrGroup,
				aItemItems = oItem.getItems(),
				oFirstItem;

			oItem._setVisualParent(oMenuParent);
			oItem._setVisualControl(oMenuItem);

			if (aItemItems.length) {
				oFirstItem = aItemItems[0];
				if (this._isMenuItemGroup(oFirstItem)) {
					var aGroupItems = oFirstItem.getItems();
					oFirstItem = aGroupItems.length ? aGroupItems[0] : null;
				}
				this._initMenuForItems(aItemItems, oMenuItem);
				oFirstItem && oItem._setVisualChild(oFirstItem._getVisualParent());
			}

			iIndex === undefined ? oMenuOrGroup.addItem(oMenuItem) : oMenuOrGroup.insertItem(oMenuItem, iIndex);
		};

		Menu.prototype._createVisualMenuItemGroupFromItemsGroup = function(oGroup) {
			var sUfdMenuItemGroupId = this._generateUnifiedMenuItemId(oGroup.getId()),
				oUfdMenuItemGroup = Element.getElementById(sUfdMenuItemGroupId),
				aCustomData = oGroup.getCustomData();

			if (oUfdMenuItemGroup) {
				return oUfdMenuItemGroup;
			}

			oUfdMenuItemGroup = new UfdMenuItemGroup({
				id: sUfdMenuItemGroupId,
				itemSelectionMode: oGroup.getItemSelectionMode()
			});

			oGroup._setVisualControl(oUfdMenuItemGroup);
			oGroup._setParentMenu(this);

			for (var i = 0; i < aCustomData.length; i++) {
				oGroup._addCustomData(oUfdMenuItemGroup, aCustomData[i]);
			}

			return oUfdMenuItemGroup;
		};

		Menu.prototype._addVisualMenuItemGroupFromItemsGroup = function(oGroup, oMenu, iIndex) {
			var oMenuItemGroup = this._createVisualMenuItemGroupFromItemsGroup(oGroup),
				aItems = oGroup.getItems();

			iIndex === undefined ? oMenu.addItem(oMenuItemGroup) : oMenu.insertItem(oMenuItemGroup, iIndex);

			for (var i = 0; i < aItems.length; i++) {
				this._addVisualMenuItemFromItem(aItems[i], oMenuItemGroup);
			}

		};

		Menu.prototype._addListItemFromItem = function(oItem, oPage, iIndex) {
			var aItemItems = oItem.getItems(),
				bItemIsGroup = this._isMenuItemGroup(oItem),
				oFirstItem;

			if (bItemIsGroup) {
				oItem._setParentMenu(this);
				oItem.getItems().forEach((oItem) => {
					this._addListItemFromItem(oItem, oPage, iIndex);
					if (iIndex !== undefined) {
						iIndex++;
					}
				});
				return;
			}

			var oMenuListItem = this._createMenuListItemFromItem(oItem),
				oList = oPage.getContent()[0];

			oItem._setVisualParent(oPage);
			oItem._setVisualControl(oMenuListItem);

			if (aItemItems.length) {
				this._initPageForParent(oItem);
				oFirstItem = aItemItems[0];
				if (this._isMenuItemGroup(oFirstItem)) {
					aItemItems = oFirstItem.getItems();
					oFirstItem = aItemItems.length ? aItemItems[0] : null;
				}
				if (oFirstItem) {
					oItem._setVisualChild(oFirstItem._getVisualParent());
				}
			}

			if (iIndex === undefined) {
				oList.addItem(oMenuListItem);
			} else {
				oList.insertItem(oMenuListItem, iIndex);
			}

			oList.invalidate();
		};

		/**
		 * Connects an instance of sap.ui.unified.MenuItem for given sap.m.MenuItem.
		 * The sap.ui.unified.MenuItem is rendered to the end-user.
		 * If there is an instance of sap.ui.unified.MenuItem already connected, this method does nothing.
		 * @param {sap.m.MenuItem} oItem the item to assign a visual item for
		 * @param {sap.ui.core.Control} oControl the container control
		 * @param {int} iIndex the index of the given item inside the aggregation <items>
		 * @private
		 */
		Menu.prototype._connectVisualItem = function(oItem, oControl, iIndex) {
			if (!oControl || Element.getElementById(oItem._getVisualControl())) {
				return;
			}

			if (Device.system.phone) {
				this._addListItemFromItem(oItem, oControl, iIndex);
				var oList = oControl.getContent()[0];
				this._updateListInset(oList);
			} else { //desktop & tablet
				this._addVisualMenuItemFromItem(oItem, oControl, iIndex);
			}
		};

		Menu.prototype._updateListInset = function(oList) {
			var bHasIcons = false,
				sInsetClass = "sapMListIcons",
				aItems = oList.getItems();

			for (var i = 0; i < aItems.length; i++) {
				if (aItems[i].getIcon()) {
					bHasIcons = true;
					break;
				}
			}

			if (bHasIcons) {
				oList.addStyleClass(sInsetClass);
			} else {
				oList.removeStyleClass(sInsetClass);
			}
		};

		/**
		 * Returns list of items stored in <code>items</code> aggregation. If there are group items,
		 * the items of the group are returned instead of their group item.
		 *
		 * @returns {sap.ui.unified.MenuItem} List of all menu items
		 * @private
		 */
		Menu.prototype._getItems = function() {
			var aItems = [];

			const findItems = (aItemItems) => {
				aItemItems.forEach((oItem) => {
					if (!this._isMenuItemGroup(oItem)) {
						aItems.push(oItem);
					} else {
						findItems(oItem.getItems());
					}
				});
			};

			findItems(this.getItems());

			return aItems;
		};

		Menu.prototype._handleMenuItemSelect = function(oEvent) {
			var oUnfdItem = oEvent.getParameter("item"),
				oMenuItem;

			if (!oUnfdItem) {
				return;
			}

			oMenuItem = this._findMenuItemByUnfdMenuItem(oUnfdItem);

			oMenuItem.setSelected(oUnfdItem.getSelected());


			if (oMenuItem && !oMenuItem._getItems().length) {
				this.fireItemSelected({item: oMenuItem});
			}
			if (oMenuItem) {
				oMenuItem.firePress();
			}
		};

		Menu.prototype._generateListItemId = function (sMenuItemId) {
			return sMenuItemId + Menu.LIST_ITEMS_ID_SUFFIX;
		};

		Menu.prototype._generateUnifiedMenuItemId = function (sMenuItemId) {
			return sMenuItemId + Menu.UNIFIED_MENU_ITEMS_ID_SUFFIX;
		};

		Menu.prototype._findMenuItemByUnfdMenuItem = function(oUnfdMenuItem) {
			var sId = oUnfdMenuItem.getId().slice(0, -Menu.UNIFIED_MENU_ITEMS_ID_SUFFIX.length);
			return Element.getElementById(sId);
		};

		/**
		 * Checks whether the <code>Menu</code> should run with cozy design.
		 * This function must only be called on the root menu (<code>getRootMenu</code>) to get proper results.
		 * @param {object} oMenu The <code>Menu</code> which is checked
		 * @returns {boolean} If the <code>Menu</code> should run with cozy design
		 * @private
		 */
		Menu.prototype._isMenuCozy = function(oMenu) {
			if (!oMenu.bCozySupported) {
				return false;
			}

			if (oMenu.hasStyleClass("sapUiSizeCozy")) {
				return true;
			}

			if (checkCozyMode(oMenu.oOpenerRef)) {
				return true;
			}

			return false;
		};

		function checkCozyMode(oRef) {
			if (!oRef) {
				return false;
			}
			oRef = oRef.$ ? oRef.$() : jQuery(oRef);
			var $ClosestParent = oRef.closest(".sapUiSizeCompact,.sapUiSizeCondensed,.sapUiSizeCozy");
			return (!$ClosestParent.hasClass("sapUiSizeCompact") && !$ClosestParent.hasClass("sapUiSizeCondensed"))
				|| $ClosestParent.hasClass("sapUiSizeCozy");
		}

		Menu.prototype.addAggregation = function(sAggregationName, oObject, bSuppressInvalidate) {
			Control.prototype.addAggregation.apply(this, arguments);

			if (sAggregationName === "items") {
				this._connectVisualItem(oObject, this._getVisualParent());
			}

			return this;
		};

		Menu.prototype.insertAggregation = function(sAggregationName, oObject, iIndex, bSuppressInvalidate) {
			Control.prototype.insertAggregation.apply(this, arguments);

			if (sAggregationName === "items") {
				this._connectVisualItem(oObject, this._getVisualParent(), iIndex);
			}

			return this;
		};

		Menu.prototype.removeAggregation = function(sAggregationName, vObject, bSuppressInvalidate) {
			var oItem = Control.prototype.removeAggregation.apply(this, arguments);

			if (sAggregationName === "items") {
				this._removeVisualItem(oItem);
			}

			return oItem;
		};

		Menu.prototype.removeAllAggregation = function(sAggregationName, bSuppressInvalidate) {
			var aItems = Control.prototype.removeAllAggregation.apply(this, arguments);

			if (sAggregationName === "items") {
				for (var i = 0; i < aItems.length; i++) {
					this._removeVisualItem(aItems[i]);
				}
			}

			return aItems;
		};

		Menu.prototype._removeVisualItem = function(oItem, oParentItem) {
			var oVisualItem = Element.getElementById(oItem._getVisualControl()),
				vMenuOrList;

			if (oVisualItem) {
				vMenuOrList = oVisualItem.getParent();
				vMenuOrList.removeItem(oVisualItem);

				if (Device.system.phone) {
					this._removeSubPageForItem(oItem);

					//if this is the last item in the page, remove the page
					if (vMenuOrList.getItems().length === 0) {
						// now we need to update its parent list item - no to render its arrow and reset its visual child ref
						if (oParentItem) {
							oParentItem._setVisualChild(null);
							Element.getElementById(oParentItem._getVisualControl()).invalidate();
						}
					}

					if (vMenuOrList) { //if it is not destroyed already in the statement above
						vMenuOrList.invalidate();
					}
				}
			}
		};

		Menu.prototype.destroyAggregation = function(sAggregationName, bSuppressInvalidate) {
			if (sAggregationName === "items") {
				for (var i = 0; i < this.getItems().length; i++) {
					this._removeVisualItem(this.getItems()[i]);
				}
			}

			return Control.prototype.destroyAggregation.apply(this, arguments);
		};

		Menu.prototype._removeSubPageForItem = function(oItem, bSkipChildren) {
			var oSubMenuPage;

			if (!bSkipChildren) {
				for (var i = 0; i < oItem.getItems().length; i++) {
					this._removeSubPageForItem(oItem.getItems()[i]);
				}
			}

			if (oItem._getVisualChild()) {
				oSubMenuPage = Element.getElementById(oItem._getVisualChild());
				if (this._getNavContainer() && oSubMenuPage) {
					this._getNavContainer().removePage(oSubMenuPage);
				}
				!!oSubMenuPage && oSubMenuPage.destroy();
			}
		};

		Menu.prototype._getVisualParent = function() {
			var oNavContainer = this._getNavContainer(),
				oMenu = this._getMenu();

			if (oNavContainer && oNavContainer.getPages().length) { //mobile
				return oNavContainer.getPages()[0];
			} else {
				return oMenu;
			}
		};

		/**
		 * Handle the event of changing any property of any menu items and sub-items.
		 * @param {object} oEvent The event data object
		 * @private
		 */
		Menu.prototype._onPropertyChanged = function (oEvent) {
			oEvent.cancelBubble();
			var sPropertyKey = oEvent.getParameter("propertyKey"),
				oPropertyValue = oEvent.getParameter("propertyValue"),
				mTargetMenuItemProps = Device.system.phone ? Menu.MENU_LIST_ITEMS_PROPS : Menu.UNFIFIED_MENU_ITEMS_PROPS,
				fnGenerateTargetItemId = Device.system.phone ? this._generateListItemId : this._generateUnifiedMenuItemId,
				sTargetItemId, oTargetItem;

			if (Device.system.phone && sPropertyKey === 'text') {
				sPropertyKey = 'title';
			}

			if (!mTargetMenuItemProps[sPropertyKey]) {
				return;
			}
			sTargetItemId = fnGenerateTargetItemId(oEvent.getSource().getId());
			oTargetItem = Element.getElementById(sTargetItemId);

			if (oTargetItem) {
				// Private aggregations are not going to get cloned if ManagedObject.prototype.clone method gets called.
				// This would mean that it is possible to not have a sap.ui.unified.Menu instance and the corresponding
				// sap.ui.unified.MenuItem instances at that point in time.
				oTargetItem.setProperty(sPropertyKey, oPropertyValue);
				if (Device.system.phone && this._getDialog().isOpen()) {
					this._getDialog().close();
				}
			}
		};

		/**
		* Handle the event of changing any aggregation of any menu items and sub-items.
		* @param {object} oEvent The event data object
		* @private
		*/
		Menu.prototype._onAggregationChanged = function(oEvent) {
			oEvent.cancelBubble();
			var sAggregationname = oEvent.getParameter("aggregationName");

			switch (sAggregationname) {
				case 'items':
					this._onItemsAggregationChanged(oEvent);
					break;
				case 'tooltip':
					this._onTooltipAggregationChanged(oEvent);
					break;
				default:
			}
		};

		/**
		 * Handle the event of changing the "tooltip" aggregation of any menu items and sub-items.
		 * @param {object} oEvent The event data object
		 * @private
		 */
		Menu.prototype._onTooltipAggregationChanged = function(oEvent) {
			var sVisualItemId = oEvent.getSource()._getVisualControl(),
				methodName = oEvent.getParameter("methodName"),
				methodParams = oEvent.getParameter("methodParams"),
				oVisualItem;

			if (!sVisualItemId) {
				return;
			}

			oVisualItem = Element.getElementById(sVisualItemId);

			if (methodName === "set") {
				oVisualItem.setTooltip(methodParams.item);
			}
			if (methodName === "destroy") {
				oVisualItem.destroyTooltip();
			}
		};

		/**
		 * Handle the event of changing the "items" aggregation of any menu items and sub-items.
		 * @param {object} oEvent The event data object
		 * @private
		 */
		Menu.prototype._onItemsAggregationChanged = function(oEvent) {
			var oItem = oEvent.getSource(),
				methodName = oEvent.getParameter("methodName"),
				methodParams = oEvent.getParameter("methodParams"),
				iInsertIndex;

			if (methodName === "add" || methodName === "insert") {
				if (methodName === "insert") {
					iInsertIndex = methodParams.index;
				}
				this._addOrInsertItem(oItem, methodParams.item, iInsertIndex);
			}
			if (methodName === "remove") {
				this._removeVisualItem(methodParams.item, oItem);
			}
			if (methodName === "removeall") {
				for (var i = 0; i < methodParams.items.length; i++) {
					this._removeVisualItem(methodParams.items[i], oItem);
				}
			}
			if (methodName === "destroy") {
				this._destroyItem(oItem);
			}
		};

		Menu.prototype._addOrInsertItem = function(oParentItem, oNewItem, iInsertIndex) {
			var oLI;

			if (oParentItem._getVisualChild()) { //this is not the first sub-item that is added
				this._connectVisualItem(oNewItem, Element.getElementById(oParentItem._getVisualChild()), iInsertIndex);
			} else {
				if (Device.system.phone) {
					this._initPageForParent(oParentItem);
					oParentItem._setVisualChild(oParentItem.getItems()[0]._getVisualParent());
					oLI = Element.getElementById(oParentItem._getVisualControl());
					oLI && oLI.invalidate();
				} else {
					this._initMenuForItems(oParentItem.getItems(), Element.getElementById(oParentItem._getVisualControl()));
					oParentItem._setVisualChild(oParentItem._getItems()[0]._getVisualParent());
				}
			}
		};

		Menu.prototype._destroyItem = function(oItem) {
			//destroy is handled recursively from the item itself (managed object)
			//so here we receive multiple aggregationChanged events, each one for a separate item

			//in the time we re-render the visual item, it's menuitem still has its subitems, so remove the ref for a while
			var oVisualItem = Element.getElementById(oItem._getVisualControl());
			if (oVisualItem && oVisualItem.setMenuItem) {
				oVisualItem.setMenuItem(null);
			}

			this._removeSubPageForItem(oItem, true);

			// now we need to update its parent list item - no to render its arrow and reset its visual child ref
			oItem._setVisualChild(null);

			if (oVisualItem && oVisualItem.setMenuItem) {
				oVisualItem.invalidate();
				oVisualItem.setMenuItem(oItem);
			}
		};

		/**
		 * Provides a DOM reference ID of the menu container.
		 * @returns {string} The DOM reference ID of the menu container
		 */
		Menu.prototype.getDomRefId = function() {
			if (Device.system.phone) {
				return this._getDialog().getId();
			} else {
				return this._getMenu().getId();
			}
		};

		/**
		 * Opens the menu as a context menu.
		 * @param {jQuery.Event | object} oEvent The event object or an object containing offsetX, offsetY
		 * values and left, top values of the element's position
		 * @param {sap.ui.core.Element|HTMLElement} oOpenerRef The reference of the opener
		 * @public
		 */
		Menu.prototype.openAsContextMenu = function(oEvent, oOpenerRef) {

			if (Device.system.phone) {
				this._openDialog();
			} else {
				if (!this._bIsInitialized) {
					this._initAllMenuItems();
					this._bIsInitialized = true;
				}

				this._getMenu().openAsContextMenu(oEvent, oOpenerRef);
			}
		};

		/**
		 * Override mutator public methods for CustomStyleClassSupport so it's properly propagated to the dialog.
		 * Keep in mind we don't overwrite <code>hasStyleClass</code> method - we are only propagating the state
		 * we don't mimic the dialog custom style class support.
		 * @override
		 */
		["addStyleClass", "removeStyleClass", "toggleStyleClass"].forEach(function (sMethodName) {
			Menu.prototype[sMethodName] = function (sClass, bSuppressInvalidate) {
				var oDialog = this._getDialog();

				Control.prototype[sMethodName].apply(this, arguments);
				if (oDialog) {
					oDialog[sMethodName].apply(oDialog, arguments);
				}

				return this;
			};
		});

		/**
		 * Returns an array containing the selected menu items.
		 * <b>Note:</b> Only items with <code>selected</code> property set that are members of <code>MenuItemGroup</code> with <code>ItemSelectionMode</code> property
		 * set to {@link sap.ui.core.ItemSelectionMode.SingleSelect} or {@link sap.ui.unified.ItemSelectionMode.MultiSelect}> are taken into account.
		 * @since 1.127.0
		 * @public
		 * @returns {Array} Array of all selected items
		 */
		Menu.prototype.getSelectedItems = function() {
			return this._getItems().filter((oItem) => oItem.getSelected && oItem.getSelected() && oItem._getItemSelectionMode() !== ItemSelectionMode.None);
		};

		return Menu;
	});