/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/assert",
	"sap/m/Menu",
	"sap/m/MenuItem",
	"sap/ui/base/DesignTime",
	"sap/ui/dt/util/_createPromise",
	"sap/ui/dt/Plugin",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/Util",
	"sap/ui/events/KeyCodes",
	"sap/ui/Device"
], function(
	assert,
	Menu,
	MenuItem,
	BaseDesignTime,
	_createPromise,
	Plugin,
	OverlayRegistry,
	DtUtil,
	KeyCodes,
	Device
) {
	"use strict";

	/**
	 * Constructor for a new ContextMenu.
	 *
	 * @param {string} [sId] id for the new object, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new object
	 * @class The ContextMenu registers event handler to open the context menu. Menu entries can dynamically be added
	 * @extends sap.ui.dt.Plugin
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.53
	 * @alias sap.ui.dt.plugin.ContextMenu
	 */
	const ContextMenu = Plugin.extend("sap.ui.dt.plugin.ContextMenu", /** @lends sap.ui.rta.plugin.ContextMenu.prototype */ {
		metadata: {
			library: "sap.ui.dt",
			properties: {
				contextElement: {
					type: "object"
				},
				openOnClick: {
					type: "boolean",
					defaultValue: true
				}
			},
			events: {
				openedContextMenu: {},
				closedContextMenu: {}
			}
		}

	});

	const sMainStyleClass = "sapUiDtContextMenu";

	ContextMenu.prototype.init = function() {
		this.oContextMenuControl = new Menu();
		this.oContextMenuControl.attachItemSelected(this._onItemSelected, this);
		this.oContextMenuControl.attachClosed(this._contextMenuClosed, this);
		this.oContextMenuControl.addStyleClass(sMainStyleClass);
		this._aMenuItems = [];
		this._aGroupedItems = [];
		this._aSubMenus = [];
	};

	ContextMenu.prototype.exit = function() {
		delete this._aMenuItems;
		if (this.oContextMenuControl) {
			this.oContextMenuControl.destroy();
		}
	};

	/**
	 * Add menu items in the following format:
	 *
	 * @param {object} mMenuItem json object with the menu item settings
	 * @param {string} mMenuItem.id id, which corresponds to the text key
	 * @param {string} mMenuItem.text menu item text (translated)
	 * @param {string} mMenuItem.icon a icon for the menu item
	 * @param {function} mMenuItem.handler event handler if menu is selected, the element for which the menu was opened is passed to the handler
	 * @param {function} [mMenuItem.startSection] function to determine if a new section should be started, the element for which the menu was opened
	 *        is passed to the handler, default false
	 * @param {function} [mMenuItem.enabled] function to determine if the menu entry should be enabled, the element for which the menu should be opened
	 *        is passed, default true
	 * @param {boolean} bRetrievedFromPlugin flag to mark if a menu item was retrieved from a plugin (in runtime)
	 * @param {boolean} bPersistOneTime flag to mark that the Button persist the next Menu clearing
	 */
	ContextMenu.prototype.addMenuItem = function(mMenuItem, bRetrievedFromPlugin, bPersistOneTime) {
		const mMenuItemEntry = {
			menuItem: mMenuItem,
			fromPlugin: !!bRetrievedFromPlugin,
			bPersistOneTime
		};
		this._aMenuItems.push(mMenuItemEntry);
	};

	/**
	 * Register an overlay
	 *
	 * @param {sap.ui.dt.Overlay} oOverlay overlay object
	 * @override
	 */
	ContextMenu.prototype.registerElementOverlay = function(oOverlay) {
		oOverlay.attachBrowserEvent("click", this._openContextMenu, this);
		oOverlay.attachBrowserEvent("touchstart", this._openContextMenu, this);
		oOverlay.attachBrowserEvent("contextmenu", this._openContextMenu, this);
		oOverlay.attachBrowserEvent("keydown", this._onKeyDown, this);
		oOverlay.attachBrowserEvent("keyup", this._onKeyUp, this);
	};

	/**
	 * Additionally to super->deregisterOverlay this method detaches the browser events
	 *
	 * @param {sap.ui.dt.Overlay} oOverlay overlay object
	 * @override
	 */
	ContextMenu.prototype.deregisterElementOverlay = function(oOverlay) {
		oOverlay.detachBrowserEvent("click", this._openContextMenu, this);
		oOverlay.detachBrowserEvent("touchstart", this._openContextMenu, this);
		oOverlay.detachBrowserEvent("contextmenu", this._openContextMenu, this);
		oOverlay.detachBrowserEvent("keydown", this._onKeyDown, this);
		oOverlay.detachBrowserEvent("keyup", this._onKeyUp, this);
	};

	/**
	 * Opens the Context Menu
	 * @param {sap.ui.dt.Overlay} oOverlay - Overlay object
	 * @param {boolean} bIsSubMenu - Whether the new ContextMenu is a SubMenu opened by a menu item inside another ContextMenu
	 * @param {object} oEvent - Click event of the menu
	 */
	ContextMenu.prototype.open = function(oOverlay, bIsSubMenu, oEvent) {
		let aSelectedOverlays;
		function addMenuItems(oMenu, aMenuItems) {
			aMenuItems.forEach(function(oMenuItem, index) {
				const sText = typeof oMenuItem.text === "function" ? oMenuItem.text(oOverlay) : oMenuItem.text;
				const bEnabled = typeof oMenuItem.enabled === "function" ? oMenuItem.enabled(aSelectedOverlays) : oMenuItem.enabled;
				oMenu.addItem(
					new MenuItem({
						key: oMenuItem.id,
						icon: oMenuItem.icon,
						text: sText,
						enabled: bEnabled
					})
				);
				if (oMenuItem.submenu) {
					addMenuItems(oMenu.getItems()[index], oMenuItem.submenu);
				}
			});
		}

		const oNewContextElement = oOverlay.getElement();
		if (this._fnCancelMenuPromise) {
			// Menu is still opening
			if (this.getContextElement() === oNewContextElement) {
				// Same context element, first opening request is still valid
				return;
			}
			this._fnCancelMenuPromise();
			delete this._fnCancelMenuPromise;
		}

		this.setContextElement(oNewContextElement);
		this.getDesignTime().getSelectionManager().attachChange(this._onSelectionChanged, this);

		aSelectedOverlays = this.getSelectedOverlays().filter(function(oElementOverlay) {
			return oElementOverlay !== oOverlay;
		});
		aSelectedOverlays.unshift(oOverlay);

		// Keep all persisted menu items
		this._aMenuItems = this._aMenuItems.filter(function(mMenuItemEntry) {
			if (mMenuItemEntry.bPersistOneTime) {
				mMenuItemEntry.bPersistOneTime = false;
				return true;
			}
			return !mMenuItemEntry.fromPlugin;
		});

		// Remove all previous entries retrieved by plugins (the list should always be rebuilt)
		this.oContextMenuControl.destroyItems();

		let oPromise = Promise.resolve();
		if (!bIsSubMenu) {
			const oDtSyncPromise = _createPromise(function(resolve, reject) {
				DtUtil.waitForSynced(this.getDesignTime())().then(resolve).catch(reject);
			}.bind(this));
			this._fnCancelMenuPromise = oDtSyncPromise.cancel;
			oPromise = oDtSyncPromise.promise
			.then(function() {
				this._aGroupedItems = [];
				this._aSubMenus = [];
				const aPluginItemPromises = [];
				const oPlugins = this.getDesignTime().getPlugins();
				oPlugins.forEach(function(oPlugin) {
					let vMenuItems = oPlugin.getMenuItems(aSelectedOverlays);
					if (!(vMenuItems instanceof Promise)) {
						vMenuItems = Promise.resolve(vMenuItems);
					}
					aPluginItemPromises.push(vMenuItems);
				});

				const oPluginItemsPromise = _createPromise(function(resolve, reject) {
					Promise.all(aPluginItemPromises).then(resolve).catch(reject);
				});
				this._fnCancelMenuPromise = oPluginItemsPromise.cancel;
				return oPluginItemsPromise.promise;
			}.bind(this))
			.then(function(aPluginMenuItems) {
				return aPluginMenuItems.reduce(function(aConcatinatedMenuItems, aMenuItems) {
					return aConcatinatedMenuItems.concat(aMenuItems);
				});
			})
			.then(function(aPluginMenuItems) {
				aPluginMenuItems.forEach(function(mMenuItem) {
					if (mMenuItem.submenu !== undefined) {
						this._addSubMenu(mMenuItem);
					} else {
						this.addMenuItem(mMenuItem, true);
					}
				}.bind(this));

				this._addItemGroupsToMenu();
				delete this._fnCancelMenuPromise;
			}.bind(this));
		}

		oPromise.then(function() {
			let aMenuItems = this._aMenuItems.map(function(mMenuItemEntry) {
				return mMenuItemEntry.menuItem;
			});

			if (aMenuItems.length > 0) {
				aMenuItems = this._sortMenuItems(aMenuItems);
				addMenuItems(this.oContextMenuControl, aMenuItems);
				this.oContextMenuControl.openAsContextMenu(oEvent, oOverlay);
			}

			this.fireOpenedContextMenu();
		}.bind(this))
		.catch(function(oError) {
			throw DtUtil.createError(
				"ContextMenu#open",
				`An error occurred during calling getMenuItems: ${oError}`
			);
		});
	};

	/**
	 * Collect menu items sorted by rank (entries without rank come first)
	 * @param  {object[]} aMenuItems List of menu items
	 * @return {object[]}            Returned a sorted list of menu items; higher rank come later
	 */
	ContextMenu.prototype._sortMenuItems = function(aMenuItems) {
		return aMenuItems.sort(function(mFirstEntry, mSecondEntry) {
			// Both entries do not have rank, do not change the order
			if (!mFirstEntry.rank && !mSecondEntry.rank) {
				return 0;
			}
			// One entry does not have rank, push it to the front
			if (!mFirstEntry.rank && mSecondEntry.rank) {
				return -1;
			}
			if (mFirstEntry.rank && !mSecondEntry.rank) {
				return 1;
			}
			return mFirstEntry.rank - mSecondEntry.rank;
		});
	};

	/**
	 * Called when a context menu item gets selected by user
	 * @param {sap.ui.base.Event} oEventItem event object
	 * @override
	 * @private
	 */
	ContextMenu.prototype._onItemSelected = function(oEventItem) {
		this._ensureSelection(this._oCurrentOverlay);

		function callHandler(oMenuItem, oEventItem) {
			const aSelection = oMenuItem.responsible || this.getSelectedOverlays() || [];
			assert(aSelection.length > 0, "sap.ui.rta - Opening context menu, with empty selection - check event order");
			const mPropertiesBag = {};
			mPropertiesBag.eventItem = oEventItem;
			mPropertiesBag.contextElement = this.getContextElement();
			oMenuItem.handler(aSelection, mPropertiesBag);
		}

		const sSelectedItemId = oEventItem.getParameter("item").getKey();

		this._aMenuItems.some(function(mMenuItemEntry) {
			const oItem = mMenuItemEntry.menuItem;
			if (sSelectedItemId === mMenuItemEntry.menuItem.id) {
				callHandler.apply(this, [oItem, oEventItem]);
				return true;
			} else if (oItem.submenu) {
				oItem.submenu.some(function(mSubMenuItem) {
					if (sSelectedItemId === mSubMenuItem.id) {
						callHandler.apply(this, [mSubMenuItem, oEventItem]);
						return true;
					}
				}.bind(this));
			}
		}, this);
	};

	/**
	 * Called when user presses key on keyboard.
	 * Opens the Compact ContextMenu on ENTER or SPACE when no other plugin is active
	 * Opens the Context Menu when user presses SHIFT-F10
	 * @param {sap.ui.base.Event} oEvent the event which was fired
	 */
	ContextMenu.prototype._onKeyUp = function(oEvent) {
		const oOverlay = OverlayRegistry.getOverlay(oEvent.currentTarget.id);
		// Prevents that the context menu opens after finishing a rename with ENTER
		if (oEvent.keyCode === KeyCodes.ENTER && oOverlay.getIgnoreEnterKeyUpOnce()) {
			oOverlay.setIgnoreEnterKeyUpOnce(false);
			oEvent.stopPropagation();
			oEvent.preventDefault();
			return;
		}
		if ((oEvent.keyCode === KeyCodes.SPACE || oEvent.keyCode === KeyCodes.ENTER) &&
			(oEvent.shiftKey === false) &&
			(oEvent.altKey === false) &&
			(oEvent.ctrlKey === false)) {
			if (!this._checkForPluginLock()) {
				this._openContextMenu(oEvent);
				oEvent.stopPropagation();
				oEvent.preventDefault();
			}
		}
		if ((oEvent.keyCode === KeyCodes.F10) &&
			(oEvent.shiftKey === true) &&
			(oEvent.altKey === false) &&
			(oEvent.ctrlKey === false)) {
			if (!this._checkForPluginLock()) {
				this._openContextMenu(oEvent);
				oEvent.stopPropagation();
				oEvent.preventDefault();
			}
		}
	};

	/**
	 * Called when user presses key on keyboard.
	 * Needed for suppressing the scrolling on pressing SPACE when no other plugin is active.
	 * @param {sap.ui.base.Event} oEvent the event which was fired
	 */
	ContextMenu.prototype._onKeyDown = function(oEvent) {
		const oOverlay = OverlayRegistry.getOverlay(oEvent.currentTarget.id);
		if ((oEvent.keyCode === KeyCodes.SPACE) &&
			(oEvent.shiftKey === false) &&
			(oEvent.altKey === false) &&
			(oEvent.ctrlKey === false)) {
			if (oOverlay && oOverlay.isSelectable() && !this._checkForPluginLock()) {
				oOverlay.setSelected(true);
				oEvent.stopPropagation();
				oEvent.preventDefault();
			}
		}
	};

	/**
	 * Called when user presses key on keyboard.
	 * Opens the ContextMenu on Click or Shift-F10 when no other plugin is active
	 * @param {sap.ui.base.Event} oEvent the event which was fired
	 */
	ContextMenu.prototype._openContextMenu = function(oEvent) {
		// Left mouse click in design mode should not open the context menu
		if (oEvent.type === "click" && BaseDesignTime.isDesignModeEnabled()) {
			return;
		}
		const oOverlay = OverlayRegistry.getOverlay(oEvent.currentTarget.id);
		if (oOverlay && oOverlay.isSelectable() && oOverlay.getSelected()) {
			this._oCurrentOverlay = oOverlay;
			this.open(oOverlay, undefined, oEvent);
		}
	};

	/**
	 * Called when ContextMenu gets closed
	 */
	ContextMenu.prototype._contextMenuClosed = function() {
		this.fireClosedContextMenu();
	};

	/**
	 * Called when the selection changes
	 */
	ContextMenu.prototype._onSelectionChanged = function() {
		this.getDesignTime().getSelectionManager().detachChange(this._onSelectionChanged, this);
	};

	/**
	 * checks whether the given Overlay is selected, if not it does so
	 * @param {object} oOverlay the Overlay which should be checked for
	 */
	ContextMenu.prototype._ensureSelection = function(oOverlay) {
		if (oOverlay && !oOverlay.isSelected()) {
			oOverlay.setSelected(true);
		}
	};

	/**
	 * checks whether a Plugin locks the opening of a new ContextMenu
	 * @return {boolean} true, if locked; false if not
	 */
	ContextMenu.prototype._checkForPluginLock = function() {
		// As long as Selection doesn't work correctly on ios we need to ensure that the ContextMenu opens even if a plugin mistakenly locks it
		if (Device.os.ios) {
			return false;
		}

		if (this.getDesignTime().getBusyPlugins().length) {
			return true;
		}

		return false;
	};

	/**
	 * Adds single item to an array of groups
	 * @param {object} mMenuItem The menu item to add to a group
	 */
	ContextMenu.prototype._addMenuItemToGroup = function(mMenuItem) {
		const bGroupExists = this._aGroupedItems.some(function(_oGroupedItem) {
			if (_oGroupedItem.sGroupName === mMenuItem.group) {
				_oGroupedItem.aGroupedItems.push(mMenuItem);
				return true;
			}
		});

		if (!bGroupExists) {
			this._aGroupedItems.push({
				sGroupName: mMenuItem.group,
				aGroupedItems: [mMenuItem]
			});
		}
	};

	/**
	 * Adds a submenu to the list of submenus
	 * @param {object} mMenuItem The menu item to add to a group
	 */
	ContextMenu.prototype._addSubMenu = function(mMenuItem) {
		mMenuItem.submenu.forEach(function(oSubMenuItem) {
			oSubMenuItem.handler ||= mMenuItem.handler;
		});

		this._aSubMenus.push({
			sSubMenuId: mMenuItem.id,
			aSubMenuItems: mMenuItem.submenu
		});

		this.addMenuItem(mMenuItem, true);
	};

	/**
	 * Adds the grouped menu item to the collapsed version of a ContextMenu
	 */
	ContextMenu.prototype._addItemGroupsToMenu = function() {
		this._aGroupedItems.forEach(function(oGroupedItem) {
			// If there is only one menu item that belongs to a group we don't need that group
			if (oGroupedItem.aGroupedItems.length === 1) {
				this.addMenuItem(oGroupedItem.aGroupedItems[0], true);
			} else {
				this.addMenuItem({
					id: `${oGroupedItem.sGroupName}-groupItem`,
					enabled: true,
					text: oGroupedItem.sGroupName,
					icon: oGroupedItem.aGroupedItems[0].icon,
					rank: oGroupedItem.aGroupedItems[0].rank,
					submenu: oGroupedItem.aGroupedItems
				}, true);
			}
		}.bind(this));
	};

	return ContextMenu;
});
