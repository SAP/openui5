/*!
 * ${copyright}
 */

// Provides control sap.m.MenuWrapper
sap.ui.define([
	'sap/ui/core/library',
	'sap/ui/core/Control',
	'sap/m/MenuWrapperRenderer',
	'sap/ui/dom/containsOrEquals',
	'sap/ui/events/KeyCodes',
	'sap/ui/Device',
	'sap/ui/core/Lib',
	'sap/base/i18n/Localization',
	'sap/ui/events/PseudoEvents'
], function(
	coreLibrary,
	Control,
	MenuWraperRenderer,
	containsOrEquals,
	KeyCodes,
	Device,
	Library,
	Localization,
	PseudoEvents
) {
	"use strict";

	// shortcut for sap.ui.core.ItemSelectionMode
	const ItemSelectionMode = coreLibrary.ItemSelectionMode;

	const DELAY_SUBMENU_TIMER = 300;

	/**
	 * Constructor for a new MenuWrapper.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The <code>sap.m.MenuWrapper</code> control represents a single-level menu with menu items.
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.136.0
	 * @alias sap.m.MenuWrapper
	 */
	const MenuWrapper = Control.extend("sap.m.MenuWrapper", /** @lends sap.m.MenuWrapper.prototype */ {
		metadata : {
			library : "sap.m",
			properties: {

				/**
				 * Specifies the title to be displayed when the menu is viewed on mobile devices within this wrapper.
				 * <b>Note:</b> This property is only used when the menu is opened on mobile devices.
				 */
				title: { type: "string", defaultValue: "" },

				/**
				 * Defines whether the menu in this wrapper is a sub-menu or not.
				 */
				isSubmenu: { type: "boolean", defaultValue: false }

			},
			aggregations: {

				/**
				 * Defines the items contained within this control.
				 */
				items: { type: "sap.m.IMenuItem", multiple: true, singularName: "item", bindable: "bindable" }

			},
			events: {
				/**
				 * Fired when a <code>MenuItem</code> is selected.
				 */
				itemSelected: {
					enableEventBubbling: true,
					parameters: {
						/**
						 * The <code>MenuItem</code> which was selected.
						 */
						item : {type : "sap.m.IMenuItem" }
					}
				},
				/**
				 * Fired when the menu popover must be closed.
				 *
				 * @since 1.136.0
				 */
				closePopover: {
					enableEventBubbling: true,
					parameters: {
						/**
						 * Whether to bubble the event to the root <code>Menu</code>.
						 */
						bubbleToRoot : {type : "boolean" },
						/**
						 * The menu item that triggered the submenu close (if any).
						 */
						origin: {type: "sap.m.IMenuItem"}
					}
				},

				/**
				 * Fired when the submenu must be closed.
				 * Because of possible top menu beforeClose prevention, the submenu close should be done by the top menu.
				 * That's why this event is fired to propagate the item to the top menu.
				 *
				 * @since 1.136.0
				 */
				closeItemSubmenu: {
					enableEventBubbling: true,
					parameters: {
						/**
						 * Item to be propagated to the top menu.
						 */
						item: {type: "sap.m.IMenuItem"}
					}
				}
			},
			renderer: MenuWraperRenderer
		}
	});

	MenuWrapper.prototype.init = function() {
		this._aStyleClasses = [];
		this._oRb = Library.getResourceBundleFor("sap.m");
	};

	MenuWrapper.prototype.exit = function() {
		this._oScrollContainer = undefined;
	};

	MenuWrapper.prototype.onBeforeRendering = function() {
		const aGroups = this.getItems().filter(function(oItem) {
			return oItem.isA("sap.m.MenuItemGroup");
		});

		// associate menu items with their respective group and ensure single selection for menu items in groups configured with single selection mode
		aGroups.forEach(function(oGroup) {
			const aItems = oGroup.getItems();
			aItems.forEach(function(oItem) {
				oItem.setAssociation("_group", oGroup);
				oItem._itemSelectionMode = oGroup.getItemSelectionMode();
			});
			if (oGroup.getItemSelectionMode() === ItemSelectionMode.SingleSelect) {
				oGroup._ensureSingleSelection();
			}
		});
	};

	MenuWrapper.prototype.onAfterRendering = function() {
		if (document.body.classList.contains("sapUiSizeCompact") || this.hasStyleClass("sapUiSizeCompact") || this.getDomRef()?.closest(".sapUiSizeCompact")) {
			this.addStyleClass("sapUiSizeCompact");
		}
		this._iVisibleItemCount = undefined;
	};

	MenuWrapper.prototype.onmouseover = function(oEvent) {
		const oItem = this.getItemByDomRef(oEvent.target);

		if (!oItem) {
			return;
		}

		if (oItem !== this.oHoveredItem) {
			this._setHoveredItem(oItem);
		}
		this._handleSubmenusAppearance(oItem, false/*, true*/);
	};

	MenuWrapper.prototype.onclick = function(oEvent) {
		const oItem = this.getItemByDomRef(oEvent.target);
		if (!oItem) {
			return;
		}

		if (oEvent.target.closest(`#${CSS.escape(oItem.getId())}-endContent`)) {
			this.fireClosePopover({ bubbleToRoot: true });
			return;
		}


		// If Shift is pressed, and the item is in Single- or Multi- selectable group,
		// the menu popover should not be closed.
		this._bPreventPopoverClose = this._isShiftKeyPressed(oEvent);

		this._selectItem(oItem, true);
		oEvent.preventDefault();
		oEvent.stopPropagation();
	};

	MenuWrapper.prototype.onsapselect = function(oEvent) {
		this._sapSelectOnKeyDown = true;
		oEvent.preventDefault();
		oEvent.stopPropagation();
	};

	MenuWrapper.prototype.onsapselectmodifiers = function(oEvent) {
		this._sapSelectOnKeyDown = true;

		// If Shift is pressed, and the item is in Single- or Multi- selectable group,
		// the menu popover should not be closed.
		this._bPreventPopoverClose = this._isShiftKeyPressed(oEvent);

		oEvent.preventDefault();
		oEvent.stopPropagation();
	};

	MenuWrapper.prototype.onkeydown = function(oEvent) {
		const iIdx = this.oHoveredItem ? this._getVisibleItems().indexOf(this.oHoveredItem) : -1,
			bRtl = Localization.getRTL(),
			iLeftArrow = bRtl ? KeyCodes.ARROW_RIGHT : KeyCodes.ARROW_LEFT,
			iRightArrow = bRtl ? KeyCodes.ARROW_LEFT : KeyCodes.ARROW_RIGHT;
		let bPreventDefault = true;

		if (iIdx === -1) {
			return;
		}

		if (!oEvent.altKey && oEvent.keyCode === KeyCodes.ARROW_DOWN) {
			// Go to the next selectable item
			this._setHoveredItem(this._getNextFocusableItem(iIdx, 1), true);
		} else if (!oEvent.altKey && oEvent.keyCode === KeyCodes.ARROW_UP) {
			// Go to the previous selectable item
			this._setHoveredItem(this._getPrevFocusableItem(iIdx, 1), true);
		} else if (oEvent.keyCode === iLeftArrow) {
			if (this.oFocusedEndContentItem) {
				// Navigate backward through endContent; if at first, return to menu item
				const aEndContent = this._getFocusableEndContentItems();
				const iContentIdx = aEndContent.indexOf(this.oFocusedEndContentItem);
				if (iContentIdx > 0) {
					this._focusEndContentItem(aEndContent[iContentIdx - 1]);
				} else {
					this.oHoveredItem.focus();
					this.oFocusedEndContentItem = null;
				}
			} else if (this.getIsSubmenu()) {
				this.fireClosePopover();
			}
		} else if (oEvent.keyCode === iRightArrow) {
			if (this.oFocusedEndContentItem) {
				// Navigate forward through endContent actions
				const aEndContent = this._getFocusableEndContentItems();
				const iContentIdx = aEndContent.indexOf(this.oFocusedEndContentItem);
				if (iContentIdx < aEndContent.length - 1) {
					this._focusEndContentItem(aEndContent[iContentIdx + 1]);
				}
			} else if (this.oHoveredItem && this.oHoveredItem._hasSubmenu()) {
				this._handleSubmenusAppearance(this.oHoveredItem, true);
			} else if (this.oHoveredItem) {
				// Enter endContent from menu item
				const aEndContent = this._getFocusableEndContentItems();
				if (aEndContent.length) {
					this._focusEndContentItem(aEndContent[0]);
				}
			}
		} else if (oEvent.keyCode === KeyCodes.ESCAPE) {
			this.fireClosePopover();
		} else if (this._bOpenedByMenuButton && (oEvent.keyCode === KeyCodes.F4 || (oEvent.altKey && (oEvent.keyCode === KeyCodes.ARROW_UP || oEvent.keyCode === KeyCodes.ARROW_DOWN)))) {
			// Close menu on F4 or Alt+Arrow Up/Down when opened by MenuButton
			this.fireClosePopover();
		} else if (oEvent.keyCode === KeyCodes.HOME) {
			// Go to the first selectable item
			this._setHoveredItem(this._getNextFocusableItem(-1, 1), true);
		} else if (oEvent.keyCode === KeyCodes.END) {
			// Go to the last selectable item
			this._setHoveredItem(this._getPrevFocusableItem(this._getVisibleItems().length, 1), true);
		} else if (oEvent.keyCode === KeyCodes.PAGE_UP) {
			// Go to the first item in the visible viewport, or to the first item
			this._navigateToPageItem(iIdx, false);
		} else if (oEvent.keyCode === KeyCodes.PAGE_DOWN) {
			// Go to the last item in the visible viewport, or to the last item
			this._navigateToPageItem(iIdx, true);
		} else if (oEvent.keyCode === KeyCodes.TAB) {
			if (this.oFocusedEndContentItem) {
				// Cycle through focusable endContent actions with Tab/Shift+Tab
				const aFocusable = this._getFocusableEndContentItems();
				if (aFocusable.length) {
					const iIdx = aFocusable.indexOf(this.oFocusedEndContentItem);
					let iNewIdx;
					if (oEvent.shiftKey) {
						iNewIdx = iIdx - 1 < 0 ? aFocusable.length - 1 : iIdx - 1;
					} else {
						iNewIdx = (iIdx + 1) % aFocusable.length;
					}
					this._focusEndContentItem(aFocusable[iNewIdx]);
				}
				oEvent.preventDefault();
			} else {
				// Close the popover and focus the next/previous element
				if (this.getIsSubmenu()) {
					oEvent.preventDefault();
				}
				this.fireClosePopover();
			}
		} else if (oEvent.keyCode === KeyCodes.F2) {
			if (this.oFocusedEndContentItem) {
				// Return focus to the menu item
				this.oHoveredItem.focus();
				this.oFocusedEndContentItem = null;
			} else if (this.oHoveredItem) {
				// Move focus to the first focusable endContent control
				const aEndContent = this.oHoveredItem.getEndContent();
				const oFirstFocusable = aEndContent.find((oControl) => oControl.isFocusable && oControl.isFocusable());
				if (oFirstFocusable) {
					this._focusEndContentItem(oFirstFocusable);
				}
			}
		} else {
			// Do not prevent default for keys that are not handled by the menu
			bPreventDefault = false;
		}

		if (bPreventDefault && !oEvent.metaKey && !oEvent.altKey) {
			oEvent.preventDefault();
			oEvent.stopPropagation();
		}
	};

	MenuWrapper.prototype.onkeyup = function(oEvent) {
		// Similar to sapselect, but executed on keyup:
		// Using keydown causes side effects such as:
		// If the selection results in closing the menu and the focus returns to the initiating element (e.g., a button),
		// the keyup event may trigger on the caller. In Firefox, this can fire a click event on the button — undesirable behavior.
		// The attribute _sapSelectOnKeyDown helps prevent issues in the reverse scenario. For example, when the spacebar is pressed
		// on a Button, opening the menu may cause the space keyup event to select the first item immediately.
		// Device checks are in place due to new functionality in iOS 13, which introduces desktop view functionality for tablets.
		if (!this._sapSelectOnKeyDown && !this._bPreventPopoverClose) {
			return;
		} else {
			this._sapSelectOnKeyDown = false;
		}
		if (!PseudoEvents.events.sapselect.fnCheck(oEvent) && oEvent.keyCode !== KeyCodes.ENTER && !this._bPreventPopoverClose) {
			return;
		}

		this._selectItem(this.oHoveredItem, false, true);

		oEvent.preventDefault();
		oEvent.stopPropagation();
	};

	MenuWrapper.prototype.onsapbackspacemodifiers = MenuWrapper.prototype.onsapbackspace;

	MenuWrapper.prototype.onfocusin = function(oEvent) {
		const oTarget = this.getItemByDomRef(oEvent.target);

		if (oTarget) {
			this.oHoveredItem = oTarget;
		}
	};

	/**
	 * Returns the menu item that corresponds to the given DOM reference.
	 *
	 * @param {HTMLElement} oDomRef The DOM reference
	 * @returns {sap.m.IMenuItem | null} The menu item that corresponds to the given DOM reference
	 */
	MenuWrapper.prototype.getItemByDomRef = function(oDomRef) {
		const oItems = this._getItems();

		for (let i = 0; i < oItems.length; i++) {
			const oItem = oItems[i],
				oItemRef = oItem.getDomRef();
			if (containsOrEquals(oItemRef, oDomRef)) {
				return oItem;
			}
		}
		return null;
	};

	/**
	 * Determines whether only the Shift key is pressed during the event.
	 * @param {jQuery.Event} oEvent Keyboard event.
	 * @private
	 * @returns {boolean} True if only the Shift key is pressed, false otherwise
	 */
	MenuWrapper.prototype._isShiftKeyPressed = function(oEvent) {
		return oEvent.shiftKey && !oEvent.metaKey && !oEvent.altKey && !oEvent.ctrlKey;
	};

	/**
	 * Adds, removes, toggles, or sets class name(s) in the internal _aStyleClasses array.
	 * <b>Note: </b> Later these classes should be applied when menu item open its submenu popover.
	 * @param {string} sClassNames - Class name(s) as a string (space-separated for multiple)
	 * @param {"addStyleClass"|"removeStyleClass"|"toggleStyleClass"|"setStyleClass"} sMethod - Operation mode: add, remove, toggle, or set a class name(s)
	 * @private
	 */
	MenuWrapper.prototype._processStyleClasses = function(sClassNames, sMethod) {
		if (sMethod === "setStyleClass") {
			this._aStyleClasses = [];
			sMethod = "addStyleClass";
		}

		if (sClassNames === "") {
			return;
		}

		const aClassNames = sClassNames.split(/\s+/).filter(Boolean);
		const sCurrentStyleClasses = this._aStyleClasses.join(" ");

		aClassNames.forEach((sClass) => {
			const iIdx = this._aStyleClasses.indexOf(sClass);
			const bAddOperation = (sMethod === "addStyleClass" || sMethod === "toggleStyleClass")  && iIdx === -1;
			const bRemoveOperation = (sMethod === "removeStyleClass" || sMethod === "toggleStyleClass")  && iIdx !== -1;
			if (bAddOperation) {
				this._aStyleClasses.push(sClass);
			} else if (bRemoveOperation) {
				this._aStyleClasses.splice(iIdx, 1);
			}
		});

		if (this.oOpenedSubmenuParent) {
			const sNewStyleClasses = this._aStyleClasses.join(" ");
			const oPopover = this.oOpenedSubmenuParent._getPopover();
			this.oOpenedSubmenuParent._getMenuWrapper()._processStyleClasses(sCurrentStyleClasses, "removeStyleClass");
			this.oOpenedSubmenuParent._getMenuWrapper()._processStyleClasses(this._aStyleClasses.join(" "), "addStyleClass");
			if (oPopover) {
				oPopover.removeStyleClass(sCurrentStyleClasses);
				oPopover.addStyleClass(sNewStyleClasses);
			}
		}
	};

	/**
	 * Menu item selection handler.
	 *
	 * @param {sap.m.IMenuItem} oItem The selected menu item
	 * @param {boolean} bWithClick Whether the selection is done with click or not
	 * @param {boolean} bSkipDelay Whether the submenu opening delay should be skipped or not
	 * @private
	 */
	MenuWrapper.prototype._selectItem = function(oItem, bWithClick, bSkipDelay) {
		if (this.oFocusedEndContentItem) { // selected end content item
			this.fireClosePopover({ bubbleToRoot: true });
			return;
		}

		if (!oItem || !oItem.getEnabled()) { // item is disabled
			return;
		}

		if (oItem._hasSubmenu()) { // item has submenu
			this._handleSubmenusAppearance(oItem, !bWithClick/*, !bSkipDelay*/);
		} else if (oItem.isInteractive && oItem.isInteractive()) { // item is allowed to be pressed

			if (oItem._getItemSelectionMode && oItem._getItemSelectionMode() !== ItemSelectionMode.None) {
				oItem.setSelected(!oItem.getSelected());
			} else {
				this._bPreventPopoverClose = false;
			}

			this.fireItemSelected({item: oItem});
			oItem.firePress({item: oItem});

			if (!this._bPreventPopoverClose) {
				this.fireClosePopover({ bubbleToRoot: true, origin: oItem });
			}
			this._bPreventPopoverClose = false;
		}
	};

	/**
	 * Closes any opened submenu (if any) and afterwards opens submenu for the given item (if any).
	 *
	 * @param {sap.m.IMenuItem} oItem the item which submenu should be opened
	 * @param {boolean} bWithKeyboard Whether the submenu is opened via keyboard
	 * @param {boolean } bDelayed whether the submenu is opened with delay or not
	 * @private
	 */
	MenuWrapper.prototype._handleSubmenusAppearance = function(oItem, bWithKeyboard, bDelayed) {
		if (this.oOpenedSubmenuParent && !this.getItems().includes(this.oOpenedSubmenuParent)) {
			this.oOpenedSubmenuParent = null;
		}
		if (this.oOpenedSubmenuParent && this.oOpenedSubmenuParent._hasSubmenu() && !this.oOpenedSubmenuParent._getPopover().isOpen()) {
			this.oOpenedSubmenuParent.removeStyleClass("sapMMenuItemSubMenuOpen");
			this.oOpenedSubmenuParent = null;
		}

		if (!bWithKeyboard && !Device.system.phone && oItem === this.oOpenedSubmenuParent) {
			return;
		}

		const bHasSubmenu = oItem._hasSubmenu();
		this._closeOpenedSubmenu(/*!bWithKeyboard && bHasSubmenu*/);

		this._discardOpenSubmenuDelayed();
		if (!bHasSubmenu || !oItem.getEnabled()) {
			return;
		}

		if (bDelayed) {
			this._openSubmenuDelayed(oItem, bWithKeyboard);
		} else {
			this._openSubmenu(oItem, bWithKeyboard);
		}
	};

	/**
	 * Returns list of items stored in <code>items</code> aggregation. If any items are part of a group,
	 * it returns the individual items within the group instead of the group item itself.
	 *
	 * @returns {sap.m.MenuItem} List of all menu items
	 * @private
	 */
	MenuWrapper.prototype._getItems = function() {
		const aItems = [];

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

	/**
	 * Returns the list of visible menu items.
	 *
	 * @returns {sap.m.MenuItem} List of visible menu items
	 * @private
	 */
	MenuWrapper.prototype._getVisibleItems = function() {
		return this._getItems().filter((oItem) => oItem.getVisible());
	};

	/**
	 * Returns the previous focusable menu item in this menu (if any).
	 *
	 * @param {number} iIdx The index of currently selectable menu item.
	 * @param {number} iStep The step to decrease index with
	 * @returns {sap.m.IMenuItem} the previous selectable menu item
	 * @private
	 */
	MenuWrapper.prototype._getPrevFocusableItem = function(iIdx, iStep) {
		const aItems = this._getVisibleItems();
		let iPrevIdx = iIdx,
			iCurrentIdx = iIdx;

		if (!aItems.length) {
			return undefined;
		}

		while (iCurrentIdx > 0 && iStep > 0) {
			iCurrentIdx--;
			if (aItems[iCurrentIdx].isFocusable && aItems[iCurrentIdx].isFocusable()) {
				iStep--;
				iPrevIdx = iCurrentIdx;
			}
		}

		return iPrevIdx !== iIdx ? aItems[iPrevIdx] : undefined;
	};

	/**
	 * Returns the next focusable menu item in this menu (if any).
	 *
	 * @param {number} iIdx The index of currently selectable menu item
	 * @param {number} iStep The increment value used to increase the index
	 * @returns {sap.m.IMenuItem} The next selectable menu item located at the resulting index after applying the increment value
	 * @private
	 */
	MenuWrapper.prototype._getNextFocusableItem = function(iIdx, iStep) {
		const aItems = this._getVisibleItems();
		let iNextIdx = iIdx,
			iCurrentIdx = iIdx;

		if (!aItems.length) {
			return undefined;
		}

		while (iCurrentIdx < aItems.length - 1 && iStep > 0) {
			iCurrentIdx++;
			if (aItems[iCurrentIdx].isFocusable && aItems[iCurrentIdx].isFocusable()) {
				iStep--;
				iNextIdx = iCurrentIdx;
			}
		}

		return iNextIdx !== iIdx ? aItems[iNextIdx] : undefined;
	};

	/**
	 * Sets the hovered menu item.
	 *
	 * @param {sap.m.IMenuItem} oItem the menu item to be set as hovered
	 * @param {boolean}	bCloseOpenedSubmenu whether the opened submenu should be closed or not
	 * @private
	 */
	MenuWrapper.prototype._setHoveredItem = function(oItem, bCloseOpenedSubmenu) {
		if (!oItem || oItem === this.oHoveredItem) {
			return;
		}

		if (oItem) {
			bCloseOpenedSubmenu && this._closeOpenedSubmenu();
			this.oHoveredItem = oItem;
			oItem.focus();
			this.oFocusedEndContentItem = null;
		}
	};

	/**
	 * Checks if an item is a MenuItemGroup or not.
	 *
	 * @param {sap.m.IMenuItem} oItem The item to be checked
	 * @returns {boolean} Whether the item is a MenuItemGroup or not
	 * @private
	 */
	MenuWrapper.prototype._isMenuItemGroup = function(oItem) {
		return !!oItem.getItemSelectionMode;
	};

	/**
	 * Returns the scroll container element by walking up the DOM from the <code>&lt;ul&gt;</code>
	 * until the first ancestor with <code>overflow-y: auto</code> or <code>scroll</code> is found.
	 *
	 * @returns {HTMLElement|null} The scrollable ancestor, or null if none found
	 * @private
	 */
	MenuWrapper.prototype._getScrollContainer = function() {
		if (this._oScrollContainer !== undefined) {
			return this._oScrollContainer;
		}
		let oEl = this.getDomRef()?.parentElement;
		while (oEl) {
			const sOverflow = window.getComputedStyle(oEl).overflowY;
			if (sOverflow === "auto" || sOverflow === "scroll") {
				this._oScrollContainer = oEl;
				return oEl;
			}
			oEl = oEl.parentElement;
		}
		this._oScrollContainer = null;
		return null;
	};

	/**
	 * Returns the number of fully visible items in the scroll container at the time of the first call,
	 * cached for the lifetime of the menu open session.
	 *
	 * @returns {number} The count of fully visible focusable items
	 * @private
	 */
	MenuWrapper.prototype._getVisibleItemCount = function() {
		if (this._iVisibleItemCount !== undefined) {
			return this._iVisibleItemCount;
		}
		const oScrollContainer = this._getScrollContainer();
		if (!oScrollContainer) {
			this._iVisibleItemCount = this._getVisibleItems().filter((oItem) => oItem.isFocusable && oItem.isFocusable()).length;
			return this._iVisibleItemCount;
		}
		const oContainerRect = oScrollContainer.getBoundingClientRect();
		this._iVisibleItemCount = this._getVisibleItems().filter((oItem) => {
			if (!oItem.isFocusable || !oItem.isFocusable()) {
				return false;
			}
			const oRect = oItem.getDomRef().getBoundingClientRect();
			return oRect.top >= oContainerRect.top && oRect.bottom <= oContainerRect.bottom;
		}).length;
		return this._iVisibleItemCount;
	};

	/**
	 * Returns the target item for PAGE_DOWN (forward) or PAGE_UP (backward) keyboard navigation.
	 *
	 * The step is <code>visibleItemCount - 1</code>. If fewer items remain in that direction,
	 * falls back to the last/first focusable item.
	 *
	 * @param {number} iIdx Index of the currently hovered item in the visible items array
	 * @param {boolean} bForward Whether to navigate forward (PAGE_DOWN) or backward (PAGE_UP)
	 * @returns {sap.m.IMenuItem|undefined} The target item
	 * @private
	 */
	MenuWrapper.prototype._getPageItem = function(iIdx, bForward) {
		const iStep = Math.max(1, this._getVisibleItemCount() - 1);
		return bForward
			? this._getNextFocusableItem(iIdx, iStep)
			: this._getPrevFocusableItem(iIdx, iStep);
	};

	/**
	 * Navigates to the page item in the given direction and scrolls it into view.
	 *
	 * @param {number} iIdx Index of the currently hovered item in the visible items array
	 * @param {boolean} bForward Whether to navigate forward (PAGE_DOWN) or backward (PAGE_UP)
	 * @private
	 */
	MenuWrapper.prototype._navigateToPageItem = function(iIdx, bForward) {
		const oTargetItem = this._getPageItem(iIdx, bForward);
		if (!oTargetItem) {
			return;
		}

		this._closeOpenedSubmenu();
		this.oHoveredItem = oTargetItem;
		oTargetItem.getDomRef().focus();
		this.oFocusedEndContentItem = null;
	};

	/**
	 * Returns the focusable end content controls of the currently hovered menu item.
	 *
	 * @returns {sap.ui.core.Control[]} The focusable end content controls
	 * @private
	 */
	MenuWrapper.prototype._getFocusableEndContentItems = function() {
		return this.oHoveredItem ? this.oHoveredItem.getEndContent().filter((oControl) => oControl.isFocusable && oControl.isFocusable()) : [];
	};

	/**
	 * Sets the focused end content item and moves focus to it.
	 *
	 * @param {sap.ui.core.Control} oItem The end content control to focus
	 * @private
	 */
	MenuWrapper.prototype._focusEndContentItem = function(oItem) {
		this.oFocusedEndContentItem = oItem;
		oItem.focus();
	};

	/**
	 * Closes already opened submenu (if any).
	 *
	 * @param {boolean} bDelayed Whether the submenu is closed with delay or not
	 * @private
	 */
	MenuWrapper.prototype._closeOpenedSubmenu = function(bDelayed) {
		if (this.oOpenedSubmenuParent) {
			const oSubmenuPopover = this.oOpenedSubmenuParent._getPopover(),
				oMenuWrapper = this.getItems().includes(this.oOpenedSubmenuParent) ? this.oOpenedSubmenuParent._getMenuWrapper() : null;

			if (oSubmenuPopover && oSubmenuPopover._oControl) {
				oSubmenuPopover._oControl._oPreviousFocus = undefined;
			}

			this.oOpenedSubmenuParent = null;
			if (!oMenuWrapper) {
				return;
			}

			if (bDelayed) {
				setTimeout(() => {
					oMenuWrapper.fireClosePopover();
				}, DELAY_SUBMENU_TIMER);
			} else {
				oMenuWrapper.fireClosePopover();
			}
		}
	};

	/**
	 * Opens the submenu of the given item (if any).
	 *
	 * @param {Object} oItem The item opener
	 * @param {boolean} bWithKeyboard Whether the submenu is opened via keyboard
	 *
	 * @private
	 */
	MenuWrapper.prototype._openSubmenu = function(oItem, bWithKeyboard) {
		if (!oItem) {
			return;
		}

		const oPopover = oItem._getPopover();

		oItem._getMenuWrapper()._processStyleClasses(this._aStyleClasses.join(" "), "setStyleClass");

		oPopover.setInitialFocus(bWithKeyboard ? null : oItem);
		oItem._openSubmenu();
		oItem._setExtraContent(this.getDomRef());
		this.oOpenedSubmenuParent = oItem;
		oItem.oParentWrapper = this;
	};

	/**
	 * Opens the submenu of the given item with a delay.
	 *
	 * @param {sap.m.IMenuItem} oItem The item that have submenu
	 * @param {boolean} bWithKeyboard Whether the submenu is opened via keyboard
	 */
	MenuWrapper.prototype._openSubmenuDelayed = function(oItem, bWithKeyboard) {
		this._delayedSubmenuTimer = setTimeout(() => this._openSubmenu(oItem, bWithKeyboard) , DELAY_SUBMENU_TIMER);
	};

	/**
	 * Discards the delayed submenu opening.
	 *
	 * @private
	 */
	MenuWrapper.prototype._discardOpenSubmenuDelayed = function() {
		if (this._delayedSubmenuTimer) {
			clearTimeout(this._delayedSubmenuTimer);
			this._delayedSubmenuTimer = null;
		}
	};

	/**
	 * Returns the number of items with icon in the menu.
	 *
	 * @returns {number} The number of items with icon
	 * @private
	 */
	MenuWrapper.prototype._getItemsWithIconCount = function() {
		return this._getVisibleItems().filter((oItem) => oItem.getIcon && oItem.getIcon()).length;
	};

	MenuWrapper.prototype._getAccessibilityEnabled = function() {
	};

	/**
	 * Configures the accessibility information necessary for rendering the menu items.
	 *
	 * @private
	 */
	MenuWrapper.prototype._prepareItemsAccessibilityInfo = function() {
		const aItems = this._getVisibleItems(),
			iFocusableItemsCount = aItems.filter((oItem) => oItem.isCountable && oItem.isCountable()).length;
		let iIndex = 1;

		aItems.forEach((oItem) => {
			const oAccInfo = {
					bAccessible: true
				};
			if (oItem.isCountable && oItem.isCountable()) {
				oAccInfo["posinset"] = iIndex;
				oAccInfo["setsize"] = iFocusableItemsCount;
				iIndex++;
			}
			oItem._oAccInfo = oAccInfo;
		});
	};

	return MenuWrapper;
});