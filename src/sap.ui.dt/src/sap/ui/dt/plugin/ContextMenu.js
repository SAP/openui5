/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/assert",
	"sap/m/Button",
	"sap/m/Menu",
	"sap/m/MenuItem",
	"sap/ui/base/DesignTime",
	"sap/ui/core/Lib",
	"sap/ui/dt/util/_createPromise",
	"sap/ui/dt/Plugin",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/Util",
	"sap/ui/events/KeyCodes",
	"sap/ui/Device"
], function(
	assert,
	Button,
	Menu,
	MenuItem,
	BaseDesignTime,
	Lib,
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
	const ContextMenu = Plugin.extend("sap.ui.dt.plugin.ContextMenu", /** @lends sap.ui.dt.plugin.ContextMenu.prototype */ {
		metadata: {
			library: "sap.ui.dt",
			properties: {
				contextElement: {
					type: "object"
				},
				openOnClick: {
					type: "boolean",
					defaultValue: true
				},
				/**
				 * Callback object for change visualization integration.
				 * Expects an object with:
				 * - findOverlayWithChanges(oOverlay): sap.ui.dt.ElementOverlay|null
				 * - openPopup(oOverlay, mContextMenuRect, oOpenerEvent, oOpenerOverlay): void
				 */
				changeVisualizationCallbackFunctions: {
					type: "object",
					defaultValue: null
				}
			},
			events: {
				openedContextMenu: {},
				closedContextMenu: {}
			}
		}
	});

	const sMainStyleClass = "sapUiDtContextMenu";
	const oTextResources = Lib.getResourceBundleFor("sap.ui.dt");

	ContextMenu.prototype.init = function() {
		this.oContextMenuControl = new Menu(`${this.getId()}-menu`);
		this.oContextMenuControl.attachItemSelected(this._onItemSelected, this);
		this.oContextMenuControl.attachClosed(this._contextMenuClosed, this);
		this.oContextMenuControl.attachOpen(this._contextMenuOpened, this);
		this.oContextMenuControl.addStyleClass(sMainStyleClass);
		this._aMenuItems = [];
		this._aGroupedItems = [];
		this._aSubMenus = [];
		this._sMenuIdPrefix = `${this.oContextMenuControl.getId()}-`;
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

	function createAdditionalInfo(oMenuItem) {
		const oAdditionalInfoButton = new Button({
			id: `${this.sId}-${oMenuItem.id}-additionalInfo-button`,
			icon: "sap-icon://message-information",
			visible: !oMenuItem.submenu,
			type: "Transparent",
			ariaLabelledBy: this.getId()
		});
		oAdditionalInfoButton.setTooltip(oMenuItem.additionalInfo);
		oAdditionalInfoButton.setEnabled(false);
		return oAdditionalInfoButton;
	}

	function collectPropagatedMenuItemPromises(aPlugins, oSelectedOverlay) {
		return aPlugins.map((oPlugin) => {
			const oPropagatedActionInfo = oPlugin.getPropagatedActionInfo(oSelectedOverlay);
			if (oPropagatedActionInfo) {
				const oPropagatingControlOverlay = OverlayRegistry.getOverlay(oPropagatedActionInfo.propagatingControl);
				let vPropagatedMenuItems = oPlugin.getMenuItems([oPropagatingControlOverlay]);
				if (!(vPropagatedMenuItems instanceof Promise)) {
					vPropagatedMenuItems = Promise.resolve(vPropagatedMenuItems);
				}
				return new Promise((resolve, reject) => {
					vPropagatedMenuItems.then((aMenuItems) => {
						const aMenuItemsWithPropagatingControl = aMenuItems.map((oMenuItem) => {
							oMenuItem.propagatingControl = oPropagatedActionInfo.propagatingControl;
							oMenuItem.propagatingControlName = oPropagatedActionInfo.propagatingControlName;
							if (BaseDesignTime.isDesignModeEnabled() || !oMenuItem.propagatingControlName) {
								// in design mode we use the technical name of the propagating control
								// if no name is provided by the plugin
								oMenuItem.propagatingControlName =
									oPropagatedActionInfo.propagatingControl.getMetadata().getName().split(".").pop();
							}
							return oMenuItem;
						});
						resolve(aMenuItemsWithPropagatingControl);
					}).catch(reject);
				});
			}
			return null;
		}).filter(Boolean);
	}
	/**
	 * Opens the Context Menu
	 * @param {sap.ui.dt.Overlay} oOverlay - Overlay object
	 * @param {boolean} bIsSubMenu - Whether the new ContextMenu is a SubMenu opened by a menu item inside another ContextMenu
	 * @param {object} oEvent - Click event of the menu
	 */
	ContextMenu.prototype.open = function(oOverlay, bIsSubMenu, oEvent) {
		let aSelectedOverlays;
		const sExtendedMenuTitle = oTextResources.getText("CTX_EXTENDED_ACTIONS_HEADER");
		const sExtendedMenuTooltip = oTextResources.getText("CTX_EXTENDED_ACTIONS_HEADER_DESCRIPTION");
		const oElement = oOverlay.getElement();
		const oElementDesignTimeMetadata = oOverlay.getDesignTimeMetadata();
		this.sSelectedControlName = oElementDesignTimeMetadata.getName(oElement)?.singular
			|| oElement.getMetadata().getName().split(".").pop();
		this.bHasExtendedActionsTitleSet = false;

		function addMenuItems(oMenu, aMenuItems, sPropagatedControlName, bIsSubMenu, bAddAsNormalActions) {
			const fnRemoveFocusability = function() {
				return false;
			};
			if (sPropagatedControlName) {
				// Extended Actions for a propagated control
				if (!bAddAsNormalActions) {
					// only add the title once, not for each propagated control
					if (!this.bHasExtendedActionsTitleSet) {
						this.bHasExtendedActionsTitleSet = true;
						const oExtendedActionsItem = new MenuItem({
							key: "CTX_EXTENDED_MENU_TITLE",
							id: `${this._sMenuIdPrefix}CTX_EXTENDED_MENU_TITLE`,
							text: sExtendedMenuTitle,
							enabled: false
						});
						oExtendedActionsItem.addStyleClass("sapUiDtContextMenuExtendedActionsTitle");
						oExtendedActionsItem.setTooltip(sExtendedMenuTooltip);
						// prevent focusability of the title item
						oExtendedActionsItem.isFocusable = fnRemoveFocusability;
						oMenu.addItem(oExtendedActionsItem);
					}
					// we have to provide a unique ID for each propagated control
					// (in case there are multiple propagated controls in the menu)
					const sId = `CTX_PROPAGATED_CONTROL_NAME_${sPropagatedControlName.replace(/[\.\s]/g, "_").toUpperCase()}`;
					const oTitleMenuItem = new MenuItem({
						key: sId,
						id: `${this._sMenuIdPrefix}${sId}`,
						text: sPropagatedControlName,
						enabled: false
					});
					oTitleMenuItem.addStyleClass("sapUiDtContextMenuPropagatedControlTitle");
					// prevent focusability of the title item
					oTitleMenuItem.isFocusable = fnRemoveFocusability;
					oMenu.addItem(oTitleMenuItem);
				}
				aMenuItems.forEach(function(oMenuItem) {
					const oTargetOverlay = OverlayRegistry.getOverlay(oMenuItem.propagatingControl);
					const aTargetSelectedOverlays = [oTargetOverlay];
					const sText = typeof oMenuItem.text === "function" ? oMenuItem.text(oTargetOverlay) : oMenuItem.text;
					const bEnabled = typeof oMenuItem.enabled === "function"
						? oMenuItem.enabled(aTargetSelectedOverlays, oMenuItem)
						: oMenuItem.enabled;
					const oMenuItemInstance = new MenuItem({
						key: oMenuItem.id,
						id: `${this._sMenuIdPrefix}${oMenuItem.id}`,
						icon: oMenuItem.icon,
						text: sText,
						enabled: bEnabled,
						press: () => {} // enables FESR tracking on menu item level
					});

					if (!bAddAsNormalActions) {
						oMenuItemInstance.addStyleClass("sapUiDtContextMenuPropagatedItem");
					}
					oMenu.addItem(oMenuItemInstance);
					// Add end content to the menu item
					if (oMenuItem.additionalInfo) {
						const oAdditionalInfoButton = createAdditionalInfo.call(this, oMenuItem);
						oMenuItemInstance.addEndContent(oAdditionalInfoButton);
					}
				}.bind(this));
			} else {
				// Standard actions for the current context element
				const aTargetSelectedOverlays = aSelectedOverlays;
				if (!bIsSubMenu) {
					const oTitleMenuItem = new MenuItem({
						key: "CTX_CONTROL_NAME",
						id: `${this._sMenuIdPrefix}CTX_CONTROL_NAME`,
						text: this.sSelectedControlName
					});
					oTitleMenuItem.addStyleClass("sapUiDtContextMenuControlTitle");
					// Add "View Changes" button if change visualization callback is set and element has changes
					const oCallbackFunctions = this.getChangeVisualizationCallbackFunctions();
					const oOverlayWithChanges = oCallbackFunctions?.findOverlayWithChanges(this._oCurrentOverlay);
					if (oOverlayWithChanges) {
						const oViewChangesButton = new Button({
							id: `${this.sId}-viewChanges-button`,
							tooltip: oTextResources.getText("CTX_VIEW_CHANGES"),
							icon: "sap-icon://show-edit",
							type: "Transparent",
							press: function() {
								oCallbackFunctions.openPopup(
									oOverlayWithChanges,
									this._mContextMenuRect,
									this._oOpenerEvent,
									this._oOpenerOverlay);
							}.bind(this)
						});
						oViewChangesButton.addStyleClass("sapUiDtContextMenuViewChanges");
						oTitleMenuItem.addEndContent(oViewChangesButton);
					} else {
						// prevent focusability and interactivity of the title item
						// when no "View Changes" button is shown to avoid confusion that the title item is clickable
						oTitleMenuItem.isFocusable = fnRemoveFocusability;
						oTitleMenuItem.isInteractive = fnRemoveFocusability;
					}
					oMenu.addItem(oTitleMenuItem);
				}
				aMenuItems.forEach(function(oMenuItem, index) {
					const sText = typeof oMenuItem.text === "function" ? oMenuItem.text(oOverlay) : oMenuItem.text;
					const bEnabled = typeof oMenuItem.enabled === "function"
						? oMenuItem.enabled(aTargetSelectedOverlays, oMenuItem)
						: oMenuItem.enabled;
					const mMenuItemSettings = {
						key: oMenuItem.id,
						icon: oMenuItem.icon,
						text: sText,
						enabled: bEnabled,
						press: () => {} // enables FESR tracking on menu item level
					};
					if (!bIsSubMenu) {
						mMenuItemSettings.id = `${this._sMenuIdPrefix}${oMenuItem.id}`;
					}
					const oMenuItemInstance = new MenuItem(mMenuItemSettings);

					oMenu.addItem(oMenuItemInstance);

					// Add end content to the menu item
					if (oMenuItem.additionalInfo) {
						const oAdditionalInfoButton = createAdditionalInfo.call(this, oMenuItem);
						oMenuItemInstance.addEndContent(oAdditionalInfoButton);
					}

					if (oMenuItem.submenu) {
						const bIsSubMenu = true;
						// we need to add one to the index, because we added the control name as first item
						addMenuItems.call(this, oMenu.getItems()[index + 1], oMenuItem.submenu, undefined, bIsSubMenu);
					}
				}.bind(this));
			}
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

		this.oContextMenuControl.destroyItems();

		let oPromise = Promise.resolve();
		if (!bIsSubMenu) {
			const oDtSyncPromise = _createPromise(function(resolve, reject) {
				DtUtil.waitForSynced(this.getDesignTime())().then(resolve).catch(reject);
			}.bind(this));
			this._fnCancelMenuPromise = oDtSyncPromise.cancel;
			oPromise = oDtSyncPromise.promise
			.then(function() {
				this._aSubMenus = [];
				const aPluginItemPromises = [];
				const aPlugins = this.getDesignTime().getPlugins();
				aPlugins.forEach(function(oPlugin) {
					let vMenuItems = oPlugin.getMenuItems(aSelectedOverlays);
					if (!(vMenuItems instanceof Promise)) {
						vMenuItems = Promise.resolve(vMenuItems);
					}
					aPluginItemPromises.push(vMenuItems);
				});

				// Propagated actions are only possible for single selection
				let aPropagatedMenuItemPromises = [];
				if (aSelectedOverlays.length === 1) {
					aPropagatedMenuItemPromises = collectPropagatedMenuItemPromises(aPlugins, aSelectedOverlays[0]);
				}
				const oPluginItemsPromise = _createPromise(function(resolve, reject) {
					aPluginItemPromises.push(...aPropagatedMenuItemPromises);
					Promise.all(aPluginItemPromises).then(resolve).catch(reject);
				});
				this._fnCancelMenuPromise = oPluginItemsPromise.cancel;
				return oPluginItemsPromise.promise;
			}.bind(this))
			.then(function(aPluginMenuItems) {
				if (aPluginMenuItems.length > 0) {
					return aPluginMenuItems.reduce(function(aConcatinatedMenuItems, aMenuItems) {
						return aConcatinatedMenuItems.concat(aMenuItems);
					});
				}
				return aPluginMenuItems;
			})
			.then(function(aPluginMenuItems) {
				aPluginMenuItems.forEach(function(mMenuItem) {
					if (mMenuItem.submenu !== undefined) {
						this._addSubMenu(mMenuItem);
					} else if (mMenuItem.propagatingControlName !== undefined) {
						this._addMenuItemToGroup(mMenuItem);
						this.addMenuItem(mMenuItem, true);
					} else {
						this.addMenuItem(mMenuItem, true);
					}
				}.bind(this));

				delete this._fnCancelMenuPromise;
			}.bind(this));
		}

		oPromise.then(function() {
			const aAllMenuItems = this._aMenuItems.map(function(mMenuItemEntry) {
				return mMenuItemEntry.menuItem;
			});

			if (aAllMenuItems.length > 0) {
				const bIsSubMenu = false;
				const aMenuItems = this._sortMenuItems(aAllMenuItems.filter((mMenuItem) => !mMenuItem.propagatingControl));
				addMenuItems.call(this, this.oContextMenuControl, aMenuItems, undefined, bIsSubMenu);
				this._aGroupedItems.forEach(function(oPropagatedMenuItemGroup) {
					const bAddAsNormalActions = (oPropagatedMenuItemGroup.sGroupName === this.sSelectedControlName);
					addMenuItems.call(
						this,
						this.oContextMenuControl,
						oPropagatedMenuItemGroup.aGroupedItems,
						oPropagatedMenuItemGroup.sGroupName,
						bIsSubMenu,
						bAddAsNormalActions
					);
				}.bind(this));
				// we have to distinguish between the mouse and the keyboard event
				const oOpenerRef = (oEvent.type === "keyup") ? oOverlay : undefined;
				// Set focus to the overlay before opening the context menu to ensure that the keyboard
				// navigation works properly after closing, as the popover restores the focus
				// to the last focused element before opening (which can be a non-selectable overlay).
				oOverlay.focus();
				this.oContextMenuControl.openAsContextMenu(oEvent, oOpenerRef);
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
	 * @return {object[]} Returns a sorted list of menu items; higher rank comes later
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

		function callHandler(oMenuItem, sSelectedItemId) {
			let aSelection;
			if (oMenuItem.propagatingControl) {
				aSelection = [OverlayRegistry.getOverlay(oMenuItem.propagatingControl)];
			} else {
				aSelection = oMenuItem.responsible || this.getSelectedOverlays() || [];
			}
			assert(aSelection.length > 0, "sap.ui.rta - Opening context menu, with empty selection - check event order");
			const mPropertyBag = {
				menuItem: oMenuItem,
				// Generic payload: the key of the selected menu item (equals oMenuItem.id / submenu entry id).
				// Plugins that need it (e.g. variant switch) read payload.key; others ignore it.
				payload: { key: sSelectedItemId },
				contextElement: this.getContextElement()
			};
			oMenuItem.handler(aSelection, mPropertyBag);
		}

		const sSelectedItemId = oEventItem.getParameter("item").getKey();
		if (sSelectedItemId === "CTX_CONTROL_NAME") {
			// user selected the Title. This is only possible when we have the button "Show Changes"
			// Emulate button click
			const oCallbackFunctions = this.getChangeVisualizationCallbackFunctions();
			const oOverlayWithChanges = oCallbackFunctions?.findOverlayWithChanges(this._oCurrentOverlay);
			oCallbackFunctions?.openPopup(oOverlayWithChanges, this._mContextMenuRect, this._oOpenerEvent, this._oOpenerOverlay);
		}

		this._aMenuItems.some(function(mMenuItemEntry) {
			const oItem = mMenuItemEntry.menuItem;
			if (sSelectedItemId === mMenuItemEntry.menuItem.id) {
				callHandler.apply(this, [oItem, sSelectedItemId]);
				return true;
			} else if (oItem.submenu) {
				oItem.submenu.some(function(mSubMenuItem) {
					if (sSelectedItemId === mSubMenuItem.id) {
						callHandler.apply(this, [mSubMenuItem, sSelectedItemId]);
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
		// on macintosh os cmd-key is used instead of ctrl-key
		const bCtrlKey = Device.os.macintosh ? oEvent.metaKey : oEvent.ctrlKey;
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
			(bCtrlKey === false)) {
			if (!this._checkForPluginLock()) {
				this._openContextMenu(oEvent);
				oEvent.stopPropagation();
				oEvent.preventDefault();
			}
		}
		if ((oEvent.keyCode === KeyCodes.F10) &&
			(oEvent.shiftKey === true) &&
			(oEvent.altKey === false) &&
			(bCtrlKey === false)) {
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
		// on macintosh os cmd-key is used instead of ctrl-key
		const bCtrlKey = Device.os.macintosh ? oEvent.metaKey : oEvent.ctrlKey;
		if ((oEvent.keyCode === KeyCodes.SPACE) &&
			(oEvent.shiftKey === false) &&
			(oEvent.altKey === false) &&
			(bCtrlKey === false)) {
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
			// store the opener Event & Overlay for later use (reopen the menu from changes list popover in CViz)
			this._oOpenerEvent = oEvent;
			this._oOpenerOverlay = oOverlay;
			this.open(oOverlay, undefined, oEvent);
		}
	};

	/**
	 * Called when ContextMenu gets closed
	 */
	ContextMenu.prototype._contextMenuClosed = function() {
		this._aGroupedItems = [];
		this.fireClosedContextMenu();
	};

	/**
	 * Called when ContextMenu gets opened
	 */
	ContextMenu.prototype._contextMenuOpened = function() {
		// store the position of the context menu for later use (open change list popover via "Show Changes" button)
		const oMenuDomRef = document.querySelector(".sapMPopover.sapUiDtContextMenu");
		this._mContextMenuRect = oMenuDomRef ? oMenuDomRef.getBoundingClientRect() : null;
		// set the focus on the first item in list (move focus from title)
		this.oContextMenuControl.getItems()[1]?.focus();
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
		// As long as Selection doesn't work correctly on ios we need to ensure that the
		// ContextMenu opens even if a plugin mistakenly locks it
		if (Device.os.ios) {
			return false;
		}
		return !!this.getDesignTime().getBusyPlugins().length;
	};

	/**
	 * Adds single item to an array of groups
	 * @param {object} mMenuItem The menu item to add to a group
	 */
	ContextMenu.prototype._addMenuItemToGroup = function(mMenuItem) {
		const sGroupName = mMenuItem.propagatingControlName;
		const bGroupExists = this._aGroupedItems.some(function(_oGroupedItem) {
			if (_oGroupedItem.sGroupName === sGroupName) {
				_oGroupedItem.aGroupedItems.push(mMenuItem);
				return true;
			}
		});

		if (!bGroupExists) {
			if (sGroupName !== this.sSelectedControlName) {
				this._aGroupedItems.push({
					sGroupName: mMenuItem.propagatingControlName,
					aGroupedItems: [mMenuItem]
				});
			} else {
				// ensure that the group with the same name as the current control is always on top
				this._aGroupedItems.unshift({
					sGroupName: mMenuItem.propagatingControlName,
					aGroupedItems: [mMenuItem]
				});
			}
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

	return ContextMenu;
});