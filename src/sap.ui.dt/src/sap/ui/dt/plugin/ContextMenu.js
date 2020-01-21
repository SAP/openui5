/*
 * ! ${copyright}
 */
sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/dt/Plugin",
	"sap/ui/dt/ContextMenuControl",
	"sap/ui/dt/Util",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/Device",
	"sap/base/assert",
	"sap/ui/events/KeyCodes",
	"sap/base/util/restricted/_debounce"
], function(
	jQuery,
	Plugin,
	ContextMenuControl,
	DtUtil,
	OverlayRegistry,
	Device,
	assert,
	KeyCodes,
	_debounce
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
	 * @experimental Since 1.53. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var ContextMenu = Plugin.extend("sap.ui.dt.plugin.ContextMenu", /** @lends sap.ui.rta.plugin.ContextMenu.prototype */ {
		metadata: {
			properties: {
				contextElement: {
					type: "object"
				},
				styleClass: {
					type: "string"
				},
				openOnHover: {
					type: "boolean",
					defaultValue: true
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

	ContextMenu.prototype.init = function () {
		this.iMenuHoverOpeningDelay = 500;
		this.iMenuHoverClosingDelay = 250; //Should be lower than iMenuHoverOpeningDelay, otherwise ContextMenu is instantly closed

		this.oContextMenuControl = new ContextMenuControl({
			maxButtonsDisplayed: 4 //The maximum number of buttons which should be displayed in the collapsed version of the ContextMenu (including overflow-button)
		});

		this.oContextMenuControl.attachClosed(this._contextMenuClosed, this);
		this.oContextMenuControl.attachOverflowButtonPressed(this._pressedOverflowButton, this);

		this._aMenuItems = [];
		this._aGroupedItems = [];
		this._aSubMenus = [];
	};

	ContextMenu.prototype.exit = function () {
		this._clearHoverTimeout();
		delete this._aMenuItems;
		if (this.oContextMenuControl) {
			this.oContextMenuControl.detachClosed(this._contextMenuClosed, this);
			this.oContextMenuControl.detachOverflowButtonPressed(this._pressedOverflowButton, this);
			this.oContextMenuControl.destroy();
			delete this.oContextMenuControl;
		}
	};

	/**
	 * Add menu items in the following format:
	 *
	 * @param {object} mMenuItem json object with the menu item settings
	 * @param {string} mMenuItem.id id, which corresponds to the text key
	 * @param {string} mMenuItems.text menu item text (translated)
	 * @param {string} mMenuItems.icon a icon for the button
	 * @param {function} mMenuItem.handler event handler if menu is selected, the element for which the menu was opened is passed to the handler
	 * @param {function} mMenuItem.startSection? function to determine if a new section should be started, the element for which the menu was opened
	 *        is passed to the handler, default false
	 * @param {function} mMenuItem.enabled? function to determine if the menu entry should be enabled, the element for which the menu should be opened
	 *        is passed, default true
	 * @param {boolean} bRetrievedFromPlugin flag to mark if a menu item was retrieved from a plugin (in runtime)
	 * @param {boolena} bPersistOneTime flag to mark that the Button persist the next Menu clearing
	 */
	ContextMenu.prototype.addMenuItem = function (mMenuItem, bRetrievedFromPlugin, bPersistOneTime) {
		var mMenuItemEntry = {
			menuItem: mMenuItem,
			fromPlugin: !!bRetrievedFromPlugin,
			bPersistOneTime: bPersistOneTime
		};
		this._aMenuItems.push(mMenuItemEntry);
	};

	/**
	 * Register an overlay
	 *
	 * @param {sap.ui.dt.Overlay} oOverlay overlay object
	 * @override
	 */
	ContextMenu.prototype.registerElementOverlay = function (oOverlay) {
		oOverlay.attachBrowserEvent("click", this._onContextMenuOrClick, this);
		oOverlay.attachBrowserEvent("touchstart", this._onContextMenuOrClick, this);
		oOverlay.attachBrowserEvent("contextmenu", this._onContextMenuOrClick, this);
		// oOverlay.attachBrowserEvent("mouseover", this._onHover, this); FIXME: wait for hover PoC from UX colleagues
		// oOverlay.attachBrowserEvent("mouseout", this._clearHoverTimeout, this);
		oOverlay.attachBrowserEvent("keydown", this._onKeyDown, this);
		oOverlay.attachBrowserEvent("keyup", this._onKeyUp, this);
	};


	/**
	 * Additionally to super->deregisterOverlay this method detaches the browser events
	 *
	 * @param {sap.ui.dt.Overlay} oOverlay overlay object
	 * @override
	 */
	ContextMenu.prototype.deregisterElementOverlay = function (oOverlay) {
		oOverlay.detachBrowserEvent("click", this._onContextMenuOrClick, this);
		oOverlay.detachBrowserEvent("touchstart", this._onContextMenuOrClick, this);
		oOverlay.detachBrowserEvent("contextmenu", this._onContextMenuOrClick, this);
		// oOverlay.detachBrowserEvent("mouseover", this._onHover, this); FIXME: wait for hover PoC from UX colleagues
		// oOverlay.detachBrowserEvent("mouseout", this._clearHoverTimeout, this);
		oOverlay.detachBrowserEvent("keydown", this._onKeyDown, this);
		oOverlay.detachBrowserEvent("keyup", this._onKeyUp, this);
	};

	/**
	 * Opens the Context Menu
	 * @param {object} mPosition position of the element triggering the open
	 * @param {sap.ui.dt.Overlay} oOverlay overlay object
	 * @param {boolean} bContextMenu whether the control should be opened as a context menu
	 * @param {boolean} bIsSubMenu whether the new ContextMenu is a SubMenu opened by a button inside another ContextMenu
	 */
	ContextMenu.prototype.open = function (mPosition, oOverlay, bContextMenu, bIsSubMenu) {
		this._bContextMenu = !!bContextMenu;

		this.setContextElement(oOverlay.getElement());

		this.getDesignTime().getSelectionManager().attachChange(this._onSelectionChanged, this);

		var aSelectedOverlays = this.getSelectedOverlays().filter(function (oElementOverlay) {
			return oElementOverlay !== oOverlay;
		});
		aSelectedOverlays.unshift(oOverlay);

		//IE sometimes returns null for document.activeElement
		if (document.activeElement) {
			document.activeElement.blur();
		}

		//Remove all previous entries retrieved by plugins (the list should always be rebuilt)
		this._aMenuItems = this._aMenuItems.filter(function (mMenuItemEntry) {
			if (mMenuItemEntry.bPersistOneTime) {
				mMenuItemEntry.bPersistOneTime = false;
				return true;
			}
			return !mMenuItemEntry.fromPlugin;
		});

		var oPromise = Promise.resolve();
		if (!bIsSubMenu) {
			oPromise = DtUtil.waitForSynced(this.getDesignTime())()
				.then(function() {
					this._aGroupedItems = [];
					this._aSubMenus = [];
					var aPluginItemPromises = [];
					var oPlugins = this.getDesignTime().getPlugins();
					oPlugins.forEach(function (oPlugin) {
						var vMenuItems = oPlugin.getMenuItems(aSelectedOverlays);
						if (!(vMenuItems instanceof Promise)) {
							vMenuItems = Promise.resolve(vMenuItems);
						}
						aPluginItemPromises.push(vMenuItems);
					});
					return Promise.all(aPluginItemPromises);
				}.bind(this))
				.then(function(aPluginMenuItems) {
					return aPluginMenuItems.reduce(function(aConcatinatedMenuItems, aMenuItems) {
						return aConcatinatedMenuItems.concat(aMenuItems);
					});
				})
				.then(function(aPluginMenuItems) {
					aPluginMenuItems.forEach(function (mMenuItem) {
						if (mMenuItem.group !== undefined && !bContextMenu) {
							this._addMenuItemToGroup(mMenuItem);
						} else if (mMenuItem.submenu !== undefined) {
							this._addSubMenu(mMenuItem, mPosition, oOverlay);
						} else {
							this.addMenuItem(mMenuItem, true);
						}
					}.bind(this));

					this._addItemGroupsToMenu(mPosition, oOverlay);
				}.bind(this));
		}

		oPromise.then(function() {
			var aMenuItems = this._aMenuItems.map(function (mMenuItemEntry) {
				return mMenuItemEntry.menuItem;
			});

			if (aMenuItems.length > 0) {
				aMenuItems = this._sortMenuItems(aMenuItems);
				this.oContextMenuControl.setButtons(aMenuItems, this._onItemSelected.bind(this), aSelectedOverlays);
				this.oContextMenuControl.setStyleClass(this.getStyleClass());

				this.oContextMenuControl.show(oOverlay, bContextMenu, {
					x: mPosition.clientX,
					y: mPosition.clientY
				});
			}

			this.fireOpenedContextMenu();
		}.bind(this))
		.catch(function(oError) {
			throw DtUtil.createError(
				"ContextMenu#open",
				"An error occured during calling getMenuItems: " + oError
			);
		});
	};

	/**
	 * Collect menu items sorted by rank (entries without rank come first)
	 * @param  {object[]} aMenuItems List of menu items
	 * @return {object[]}            Returned a sorted list of menu items; higher rank come later
	 */
	ContextMenu.prototype._sortMenuItems = function (aMenuItems) {
		return aMenuItems.sort(function (mFirstEntry, mSecondEntry) {
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
	 * Funcion is called when "_onContextMenu" is fired -> opens the ContextMenu
	 * @param {sap.ui.base.Event} oEvent Event object
	 * @private
	 */
	ContextMenu.prototype._onContextMenu = function (oEvent) {
		var oOverlay = OverlayRegistry.getOverlay(oEvent.currentTarget.id);
		var mPosition = {
			clientX: oEvent.clientX,
			clientY: oEvent.clientY
		};
		this._openContextMenu(oEvent, oOverlay, mPosition);
	};

	/**
	 * Called when a context menu item gets selected by user
	 * @param {sap.ui.base.Event} oEventItem event object
	 * @override
	 * @private
	 */
	ContextMenu.prototype._onItemSelected = function (oEventItem) {
		this.oContextMenuControl.close(true);
		this._ensureSelection(this._oCurrentOverlay);
		this.setFocusLock(true);

		var aSelection = [];
		var oContextElement = this.getContextElement();
		var sSelectedButtonId = oEventItem.data("id");

		this._aMenuItems.some(function (mMenuItemEntry) {
			if (sSelectedButtonId === mMenuItemEntry.menuItem.id) {
				var oItem = mMenuItemEntry.menuItem;
				aSelection = this.getSelectedOverlays();
				assert(aSelection.length > 0, "sap.ui.rta - Opening context menu, with empty selection - check event order");
				var mPropertiesBag = {};
				mPropertiesBag.eventItem = oEventItem;
				mPropertiesBag.contextElement = oContextElement;
				oItem.handler(aSelection, mPropertiesBag);
				oItem = null;
				return true;
			}
		}, this);
	};

	ContextMenu.prototype._onContextMenuOrClick = function(oEvent) {
		if (!this.fnDebounced) {
			this.fnDebounced = _debounce(function() {
				if (this._oCurrentEvent.type === "contextmenu") {
					this._onContextMenu(this._oCurrentEvent);
				} else {
					this._onClickorTouch(this._oCurrentEvent);
				}
				this._oCurrentEvent = undefined;
				this.fnDebounced = undefined;
			}.bind(this), 50);
		}

		var oOverlay = OverlayRegistry.getOverlay(oEvent.currentTarget.id);
		if (oOverlay && oOverlay.isSelectable() && oOverlay.getSelected()) {
			this._oCurrentEvent = oEvent;
			oEvent.stopPropagation();
			this.fnDebounced();
		}
	};

	/**
	 * Called when the user clicks or touches an overlay
	 * @param {sap.ui.base.Event} oEvent event object
	 * @private
	 */
	ContextMenu.prototype._onClickorTouch = function (oEvent) {
		if (this.getOpenOnClick()) {
			if (this.isMenuOpeningLocked()) {
				this.unlockMenuOpening();
				this.oContextMenuControl.close();
			}
			this._startOpening(oEvent);
		}
	};

	/**
	 * Called before the ContextMenu is opened (except by contextMenu event)
	 * Checks whether a new ContextMenu should been opened and does so, if check returned true
	 * @param {sap.ui.base.Event} oEvent event object
	 * @param {boolean} bLockOpening should the Opening of the ContextMenu be locked
	 * @return {boolean} Whether a new ContextMenu has been opened or not
	 * @private
	 */
	ContextMenu.prototype._startOpening = function (oEvent, bLockOpening) {
		clearTimeout(this.hoverTimeout);
		this._bOpenedByHover = false;

		this._oTempTarget = oEvent.currentTarget.id;

		var oOverlay = OverlayRegistry.getOverlay(oEvent.currentTarget.id);
		var sTargetClasses = oEvent.target.className;

		if (oOverlay && oOverlay.isSelectable() && sTargetClasses.indexOf("sapUiDtOverlay") > -1 && (!this.isMenuOpeningLocked())) {
			oEvent.stopPropagation();

			if (this._shouldContextMenuOpen(oEvent)) {
				this._ensureSelection(oOverlay);
				if (this._oCurrentOverlay.isSelected() || Device.os.android) {
					if (bLockOpening) {
						this.lockMenuOpening();
					}
					this.open(
						{
							clientX: oEvent.clientX,
							clientY: oEvent.clientY
						},
						oOverlay
					);

					return true;
				}
			}
		}
	};

	/**
	 * Called when the user hovers over an overlay
	 * @param {sap.ui.base.Event} oEvent event object
	 * @private
	 */
	ContextMenu.prototype._onHover = function (oEvent) {
		var oOverlay = OverlayRegistry.getOverlay(oEvent.currentTarget.id);
		if (oOverlay && oOverlay.isSelectable() && !oEvent.ctrlKey && this.getOpenOnHover()) {
			oEvent.stopPropagation();
			if (this._shouldContextMenuOpen(oEvent, true)) {
				if (this.iMenuHoverClosingDelay >= this.iMenuHoverOpeningDelay) {
					jQuery.error("sap.ui.dt ContextMenu iMenuHoverClosingDelay is bigger or equal to iMenuHoverOpeningDelay!");
				}

				if (this.oContextMenuControl.getPopover().isOpen()) {
					this._closingTimeout = setTimeout(function () {
						if (this.oContextMenuControl.getPopover().isOpen()) {
							this.oContextMenuControl.close();
						}
					}.bind(this), this.iMenuHoverClosingDelay);
				}

				this.hoverTimeout = setTimeout(function () {
					OverlayRegistry.getOverlay(oEvent.currentTarget.id).focus();
					this._startOpening(oEvent);
					this._bOpenedByHover = true;
				}.bind(this), this.iMenuHoverOpeningDelay);
			}
		}
	};

	/**
	 * Called when the user stops hovering over an overlay
	 * @private
	 */
	ContextMenu.prototype._clearHoverTimeout = function () {
		if (this.hoverTimeout) {
			clearTimeout(this.hoverTimeout);
			this.hoverTimeout = null;
		}
		if (this._closingTimeout) {
			clearTimeout(this._closingTimeout);
			this._closingTimeout = null;
		}
	};

	/**
	 * Called when user presses key on keyboard.
	 * Opens the Compact ContextMenu on ENTER or SPACE when no other plugin is active
	 * Opens the Context Menu when user presses SHIFT-F10
	 * @param {sap.ui.base.Event} oEvent the event which was fired
	 */
	ContextMenu.prototype._onKeyUp = function (oEvent) {
		var oOverlay = OverlayRegistry.getOverlay(oEvent.currentTarget.id);
		if ((oEvent.keyCode === KeyCodes.SPACE || oEvent.keyCode === KeyCodes.ENTER) &&
			(oEvent.shiftKey === false) &&
			(oEvent.altKey === false) &&
			(oEvent.ctrlKey === false)) {
			if (oOverlay && oOverlay.isSelectable() && !this._checkForPluginLock()) {
				this._startOpening(oEvent, true);
				oEvent.stopPropagation();
				oEvent.preventDefault();
			}
		}
		if ((oEvent.keyCode === KeyCodes.F10) &&
			(oEvent.shiftKey === true) &&
			(oEvent.altKey === false) &&
			(oEvent.ctrlKey === false)) {
			if (oOverlay && oOverlay.isSelectable()) {
				oEvent.preventDefault();

				var mPosition = {
					clientX: "not set",
					clientY: "not set"
				};

				this._openContextMenu(oEvent, oOverlay, mPosition);
			}
		}
	};

	/**
	 * Called when user presses key on keyboard.
	 * Needed for suppressing the scrolling on pressing SPACE when no other plugin is active.
	 * @param {sap.ui.base.Event} oEvent the event which was fired
	 */
	ContextMenu.prototype._onKeyDown = function (oEvent) {
		var oOverlay = OverlayRegistry.getOverlay(oEvent.currentTarget.id);
		if ((oEvent.keyCode === KeyCodes.SPACE) &&
			(oEvent.shiftKey === false) &&
			(oEvent.altKey === false) &&
			(oEvent.ctrlKey === false)) {
			if (oOverlay && oOverlay.isSelectable() && !this._checkForPluginLock()) {
				oEvent.stopPropagation();
				oEvent.preventDefault();
			}
		}
	};

	/**
	 * Checks whether a new ContextMenu should be opened
	 * @param {sap.ui.base.Event} oEvent event object
	 * @param {boolean} onHover if true, the new overlay doesn't get stored in this._oCurrentOverlay
	 * @return {boolean} whether the check was sucessfull and a new ContextMenu should be opened
	 * @private
	 */
	ContextMenu.prototype._shouldContextMenuOpen = function (oEvent, onHover) {
		if ((!this._checkForPluginLock() && !this.isMenuOpeningLocked())) {
			if (!onHover) {
				this._oCurrentOverlay = OverlayRegistry.getOverlay(oEvent.currentTarget.id);
			}
			return true;
		}
		return false;
	};

	/**
	 * Called when overflow button is pressed on compact ContextMenu
	 * @param {sap.ui.base.Event} oEvent event object
	 * @private
	 */
	ContextMenu.prototype._pressedOverflowButton = function (oEvent) {
		this.lockMenuOpening();
		var oOverlay = OverlayRegistry.getOverlay(oEvent.oSource._oTarget.getAttribute("overlay"));
		var mPosition = {
			clientX: oEvent.mParameters.oButton.$().offset().left,
			clientY: oEvent.mParameters.oButton.$().offset().top
		};
		this._openContextMenu(oEvent, oOverlay, mPosition);

		this.setFocusLock(true);
	};

	ContextMenu.prototype._openContextMenu = function(oEvent, oOverlay, mPosition) {
		if (oOverlay && oOverlay.isSelectable()) {
			oEvent.preventDefault();
			this._oCurrentOverlay = oOverlay;
			this.oContextMenuControl.close(true);
			this._bOpenedByHover = false;

			clearTimeout(this.hoverTimeout);

			this._ensureSelection(oOverlay);

			this.lockMenuOpening();
			this.open(mPosition, oOverlay, true);
			if (oEvent.stopPropagation) {
				oEvent.stopPropagation();
			}
		}
	};

	/**
	 * Called when ContextMenu gets closed
	 */
	ContextMenu.prototype._contextMenuClosed = function () {
		this.unlockMenuOpening();
		this.setFocusLock(false);
	};

	/**
	 * Called when the selection changes
	 */
	ContextMenu.prototype._onSelectionChanged = function() {
		this.oContextMenuControl.close(true);
		this.getDesignTime().getSelectionManager().detachChange(this._onSelectionChanged, this);
	};

	/**
	 * Locks the Opening of the ContextMenu, no new one gets opened
	 * Note: should be called BEFORE a new ContextMenu is opened
	 * @param {boolean} bOverwriteOpenValue overwrites the "isOpen" value from the ContextMenuControl
	 */
	ContextMenu.prototype.lockMenuOpening = function (bOverwriteOpenValue) {
		if ((this.oContextMenuControl.getPopover(true).isOpen() ||
			this.oContextMenuControl.getPopover(false).isOpen()) &&
			bOverwriteOpenValue !== true) { // sometimes this function needs to be called after the old ContextMenu is closed
			this._bAsyncLock = true;
		} else {
			this._bOpeningLocked = true;
		}
	};

	/**
	 * Unlocks the Opening of the ContextMenu
	 */
	ContextMenu.prototype.unlockMenuOpening = function () {
		this._bOpeningLocked = false;
		if (this._bAsyncLock) {
			this.lockMenuOpening(true);
		}
		this._bAsyncLock = false;
	};

	/**
	 * @return {boolean} whether the Opening is locked or not
	 */
	ContextMenu.prototype.isMenuOpeningLocked = function () {
		return this._bOpeningLocked;
	};

	/**
	 * Locks/ Unlocks the focus reset
	 * @param {boolean} bIsLocked whether the Focus should be locked on the ContextMenu or not
	 */
	ContextMenu.prototype.setFocusLock = function (bIsLocked) {
		this._bFocusLocked = bIsLocked;
	};

	/**
	 * checks wehther the given Overlay is selected, if not it does so
	 * @param {object} oOverlay the Overlay which should be checked for
	 */
	ContextMenu.prototype._ensureSelection = function (oOverlay) {
		if (oOverlay && !oOverlay.isSelected()) {
			oOverlay.setSelected(true);
		}
	};

	/**
	 * checks whether a Plugin locks the opening of a new ContextMenu
	 * @param {object} oOverlay the Overlay which should be checked for
	 * @return {boolean} true, if locked; false if not
	 */

	ContextMenu.prototype._checkForPluginLock = function () {
		//As long as Selection doesn't work correctly on ios we need to ensure that the ContextMenu opens even if a plugin mistakenly locks it
		if (Device.os.ios) {
			return false;
		}

		if (this.getDesignTime().getBusyPlugins().length) {
			return true;
		}

		this.setFocusLock(false);
		return false;
	};

	/**
	 * Adds single items to an array of groups
	 * @param {object} mMenuItem The menu item to add to a group
	 */
	ContextMenu.prototype._addMenuItemToGroup = function (mMenuItem) {
		var bGroupExists = this._aGroupedItems.some(function (_oGroupedItem) {
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
	 * @param {object} mPosition The position where the submenu should be opened
	 * @param {sap.ui.dt.Overlay} oOverlay The Overlay on which the ContextMenu was opened
	 */
	ContextMenu.prototype._addSubMenu = function (mMenuItem, mPosition, oOverlay) {
		mMenuItem.submenu.forEach(function (oSubMenuItem) {
			oSubMenuItem.handler = mMenuItem.handler;
		});

		mMenuItem.handler = function (sMenuItemId, mPosition, oOverlay) {
			this._aSubMenus.some(function (_oMenuItem) {
				if (_oMenuItem.sSubMenuId === sMenuItemId) {
					_oMenuItem.aSubMenuItems.forEach(function (oSubMenuItem) {
						this.addMenuItem(oSubMenuItem, true, true);
					}.bind(this));
					return true;
				}
			}.bind(this));

			if (!this._bContextMenu) {
				mPosition.clientX = null;
				mPosition.clientY = null;
			}

			this.oContextMenuControl.close();
			setTimeout(function () {
				this.open(mPosition, oOverlay, true, true);
			}.bind(this), 0);
			this.lockMenuOpening();
		}.bind(this, mMenuItem.id, mPosition, oOverlay);

		this._aSubMenus.push({
			sSubMenuId: mMenuItem.id,
			aSubMenuItems: mMenuItem.submenu
		});

		this.addMenuItem(mMenuItem, true);
	};

	/**
	 * Adds the grouped Button to the collapsed version of a ContextMenu
	 * @param {object} mPosition The position where the menu is opened
	 * @param {sap.ui.dt.Overlay} oOverlay The Overlay on which the ContextMenu was opened
	 */
	ContextMenu.prototype._addItemGroupsToMenu = function (mPosition, oOverlay) {
		this._aGroupedItems.forEach(function (oGroupedItem, iIndex) {
			//If there is only one button that belongs to a group we don't need that group
			if (oGroupedItem.aGroupedItems.length === 1) {
				this.addMenuItem(oGroupedItem.aGroupedItems[0], true, false);
			} else {
				var fHandlerForGroupedButton = function (iIndex, mPosition, oOverlay) {
					this._aGroupedItems[iIndex].aGroupedItems.forEach(function (mMenuItem) {
						this.addMenuItem(mMenuItem, true, true);
					}.bind(this));

					this.oContextMenuControl.close();
					setTimeout(function () {
						this.open(mPosition, oOverlay, true, true);
					}.bind(this), 0);
					this.lockMenuOpening();
				};

				this.addMenuItem({
					id: oGroupedItem.sGroupName + "-groupButton",
					enabled: true,
					text: oGroupedItem.sGroupName,
					icon: oGroupedItem.aGroupedItems[0].icon,
					rank: oGroupedItem.aGroupedItems[0].rank,
					handler: fHandlerForGroupedButton.bind(this, iIndex, mPosition, oOverlay)
				}, true);
			}
		}.bind(this));
	};

	return ContextMenu;
});
