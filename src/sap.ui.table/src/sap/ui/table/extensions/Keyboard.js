/*!
 * ${copyright}
 */

// Provides helper sap.ui.table.extensions.Keyboard.
sap.ui.define([
	"./ExtensionBase",
	"./KeyboardDelegate",
	"../utils/TableUtils",
	"sap/ui/core/delegate/ItemNavigation",
	"sap/ui/Device",
	"sap/ui/dom/containsOrEquals",
	"sap/ui/thirdparty/jquery"
], function(
	ExtensionBase,
	KeyboardDelegate,
	TableUtils,
	ItemNavigation,
	Device,
	containsOrEquals,
	jQuery
) {
	"use strict";

	/*
	 * Wrapper for event handling of the item navigation.
	 * Allows to selectively forward the events to the item navigation.
	 * "this" in the function context is the table instance
	 */
	const ItemNavigationDelegate = {
		_forward: function(oTable, oEvent) {
			const oIN = oTable._getItemNavigation();

			if (oIN != null
				&& !oTable._getKeyboardExtension().isItemNavigationSuspended()
				&& !oEvent.isMarked("sapUiTableSkipItemNavigation")) {

				oIN["on" + oEvent.type](oEvent);
			}
		},
		onfocusin: function(oEvent) { ItemNavigationDelegate._forward(this, oEvent); },
		onsapfocusleave: function(oEvent) { ItemNavigationDelegate._forward(this, oEvent); },
		onmousedown: function(oEvent) { ItemNavigationDelegate._forward(this, oEvent); },
		onsapnext: function(oEvent) { ItemNavigationDelegate._forward(this, oEvent); },
		onsapnextmodifiers: function(oEvent) { ItemNavigationDelegate._forward(this, oEvent); },
		onsapprevious: function(oEvent) { ItemNavigationDelegate._forward(this, oEvent); },
		onsappreviousmodifiers: function(oEvent) { ItemNavigationDelegate._forward(this, oEvent); },
		onsappageup: function(oEvent) { ItemNavigationDelegate._forward(this, oEvent); },
		onsappagedown: function(oEvent) { ItemNavigationDelegate._forward(this, oEvent); },
		onsaphome: function(oEvent) { ItemNavigationDelegate._forward(this, oEvent); },
		onsaphomemodifiers: function(oEvent) { ItemNavigationDelegate._forward(this, oEvent); },
		onsapend: function(oEvent) { ItemNavigationDelegate._forward(this, oEvent); },
		onsapendmodifiers: function(oEvent) { ItemNavigationDelegate._forward(this, oEvent); },
		onsapkeyup: function(oEvent) { ItemNavigationDelegate._forward(this, oEvent); }
	};

	/*
	 * Event handling which is independent of the used keyboard delegate.
	 * "this" in the function context is the table instance.
	 */
	const ExtensionDelegate = {
		onBeforeRendering: function(oEvent) {
			/*
			 * In a normal rendering, the process is as follows:
			 * 2. The onAfterRendering delegates of rendered controls are called by the sap.ui.core.RenderManager after writing to DOM.
			 * 3. The KeyboardExtension invalidates the ItemNavigation in its onAfterRendering delegate.
			 * 4. The RenderManager calls sap.ui.core.FocusHandler#restoreFocus.
			 *
			 * If only the rows are rendered:
			 * 2. The table calls sap.ui.core.RenderManager#flush to write to DOM.
			 * 3. The RenderManager calls sap.ui.core.FocusHandler#restoreFocus.
			 * 4. The table calls the "onAfterRendering" delegate.
			 * 5. The KeyboardExtension invalidates the ItemNavigation in its onAfterRendering delegate.
			 *
			 * As a consequence, the focus is restored with the information from an ItemNavigation that is in a state where it should be marked as
			 * invalid. To correctly restore the focus, first the ItemNavigation must be invalidated and then the focus must be set (or trigger
			 * the jQuery focus event, if the focus is already on the correct element).
			 */

			this._oStoredFocusInfo = this.getFocusInfo();
		},
		onAfterRendering: function(oEvent) {
			const bRenderedRows = oEvent && oEvent.isMarked("renderRows");

			this._getKeyboardExtension().invalidateItemNavigation();

			// The presence of the "customId" property in the focus info indicates that the table had the focus before rendering.
			// Reapply the focus info to the table only in this case.
			if (this._oStoredFocusInfo && this._oStoredFocusInfo.customId) {
				if (bRenderedRows) {
					this.applyFocusInfo(this._oStoredFocusInfo);
				} else {
					ExtensionHelper.initItemNavigation(this._getKeyboardExtension(), true);
				}
			}

			delete this._oStoredFocusInfo;
		},
		onfocusin: function(oEvent) {
			const oExtension = this._getKeyboardExtension();

			if (!oExtension._bIgnoreFocusIn) {
				ExtensionHelper.initItemNavigation(this._getKeyboardExtension());
			} else {
				oEvent.setMarked("sapUiTableIgnoreFocusIn");
			}

			if (oEvent.target && oEvent.target.id === this.getId() + "-rsz") {
				// prevent that the ItemNavigation grabs the focus!
				// only for the column resizing
				oEvent.preventDefault();
				oEvent.setMarked("sapUiTableSkipItemNavigation");
			}
		}
	};

	/*
	 * Provides utility functions used this extension
	 */
	const ExtensionHelper = {
		initItemNavigation: function(oExtension, bSkipInitFocusedIndex) {
			if (ExtensionHelper.isItemNavigationInvalid(oExtension)) {
				ExtensionHelper._initItemNavigation(oExtension, bSkipInitFocusedIndex);
			}
		},

		/*
		 * Initialize ItemNavigations (content and header) and transfer relevant dom elements.
		 * TabIndexes are set by the ItemNavigation.
		 */
		// eslint-disable-next-line complexity
		_initItemNavigation: function(oExtension, bSkipInitFocusedIndex) {
			const oTable = oExtension.getTable();

			if (!oTable) {
				return;
			}

			const $Table = oTable.$();
			const iRowCount = oTable.getRows().length;
			let iColumnCount = TableUtils.getVisibleColumnCount(oTable);
			const bHasRowHeader = TableUtils.hasRowHeader(oTable);
			const bHasRowActions = TableUtils.hasRowActions(oTable);
			const bHasFixedColumns = TableUtils.hasFixedColumns(oTable);
			let i;

			// create the list of item dom refs
			let aItemDomRefs = [];
			let aRowHdrDomRefs; let aRowActionDomRefs; let $topLeft; let $middleLeft; let $bottomLeft;

			if (bHasFixedColumns) {
				$topLeft = $Table.find(".sapUiTableCtrlFixed.sapUiTableCtrlRowFixed:not(.sapUiTableCHT)");
				$middleLeft = $Table.find(".sapUiTableCtrlFixed.sapUiTableCtrlRowScroll:not(.sapUiTableCHT)");
				$bottomLeft = $Table.find(".sapUiTableCtrlFixed.sapUiTableCtrlRowFixedBottom:not(.sapUiTableCHT)");
			}

			const $topRight = $Table.find(".sapUiTableCtrlScroll.sapUiTableCtrlRowFixed:not(.sapUiTableCHT)");
			const $middleRight = $Table.find(".sapUiTableCtrlScroll.sapUiTableCtrlRowScroll:not(.sapUiTableCHT)");
			const $bottomRight = $Table.find(".sapUiTableCtrlScroll.sapUiTableCtrlRowFixedBottom:not(.sapUiTableCHT)");

			if (bHasRowHeader) {
				aRowHdrDomRefs = $Table.find(".sapUiTableRowSelectionCell").get();
				iColumnCount++;
			}

			if (bHasRowActions) {
				aRowActionDomRefs = $Table.find(".sapUiTableRowActionCell").get();
				iColumnCount++;
			}

			for (i = 0; i < iRowCount; i++) {
				if (bHasRowHeader) {
					aItemDomRefs.push(aRowHdrDomRefs[i]);
				}
				if (bHasFixedColumns) {
					aItemDomRefs = aItemDomRefs.concat($topLeft.find("tr[data-sap-ui-rowindex=\"" + i + "\"]").find("td[tabindex]").get());
				}
				aItemDomRefs = aItemDomRefs.concat($topRight.find("tr[data-sap-ui-rowindex=\"" + i + "\"]").find("td[tabindex]").get());
				if (bHasFixedColumns) {
					aItemDomRefs = aItemDomRefs.concat($middleLeft.find("tr[data-sap-ui-rowindex=\"" + i + "\"]").find("td[tabindex]").get());
				}
				aItemDomRefs = aItemDomRefs.concat($middleRight.find("tr[data-sap-ui-rowindex=\"" + i + "\"]").find("td[tabindex]").get());
				if (bHasFixedColumns) {
					aItemDomRefs = aItemDomRefs.concat($bottomLeft.find("tr[data-sap-ui-rowindex=\"" + i + "\"]").find("td[tabindex]").get());
				}
				aItemDomRefs = aItemDomRefs.concat($bottomRight.find("tr[data-sap-ui-rowindex=\"" + i + "\"]").find("td[tabindex]").get());
				if (bHasRowActions) {
					aItemDomRefs.push(aRowActionDomRefs[i]);
				}
			}

			// add the column headers and select all
			if (oTable.getColumnHeaderVisible()) {
				let aHeaderDomRefs = [];

				// Returns the .sapUiTableColHdr elements (.sapUiTableColHdrCnt .sapUiTableCtrlFixed .sapUiTableColHdrTr)
				const $FixedHeaders = $Table.find(".sapUiTableCHT.sapUiTableCtrlFixed>tbody>tr");
				// Returns the .sapUiTableColHdr elements (.sapUiTableColHdrCnt .sapUiTableCtrlScr .sapUiTableColHdrTr)
				const $ScrollHeaders = $Table.find(".sapUiTableCHT.sapUiTableCtrlScroll>tbody>tr");
				const iHeaderRowCount = TableUtils.getHeaderRowCount(oTable);

				for (i = 0; i < iHeaderRowCount; i++) {
					if (bHasRowHeader) {
						aHeaderDomRefs.push(oTable.getDomRef("selall"));
					}

					if ($FixedHeaders.length) {
						aHeaderDomRefs = aHeaderDomRefs.concat(jQuery($FixedHeaders.get(i)).find(".sapUiTableHeaderCell").get());
					}
					if ($ScrollHeaders.length) {
						aHeaderDomRefs = aHeaderDomRefs.concat(jQuery($ScrollHeaders.get(i)).find(".sapUiTableHeaderCell").get());
					}

					if (bHasRowActions) {
						// Only add a dummy (inivisible inner text) to fullfill matrix for item navigation.
						// Header should not be focuable.
						aHeaderDomRefs.push($Table.find(".sapUiTableRowActionHeaderCell").children().get(0));
					}
				}

				aItemDomRefs = aHeaderDomRefs.concat(aItemDomRefs);
			}

			// initialization of item navigation for the Table control
			if (!oExtension._itemNavigation) {
				oExtension._itemNavigation = new ItemNavigation();
				oExtension._itemNavigation.setTableMode(true);
				oExtension._itemNavigation.attachEvent(ItemNavigation.Events.AfterFocus, function(oEvent) {
					const oInfo = TableUtils.getFocusedItemInfo(oTable);
					oInfo.header = TableUtils.getHeaderRowCount(oTable);
					oInfo.domRef = null; //Do not keep dom references

					if (oInfo.row >= oInfo.header) {
						oExtension._oLastFocusedCellInfo = oInfo;
					}
				}, oTable);
			}

			// configure the item navigation
			oExtension._itemNavigation.setColumns(iColumnCount);
			oExtension._itemNavigation.setRootDomRef($Table.find(".sapUiTableCnt").get(0));
			oExtension._itemNavigation.setItemDomRefs(aItemDomRefs);

			if (!bSkipInitFocusedIndex) {
				oExtension._itemNavigation.setFocusedIndex(ExtensionHelper.getInitialItemNavigationIndex(oExtension));
			}

			// revert invalidation flag
			oExtension._itemNavigationInvalidated = false;
		},

		getInitialItemNavigationIndex: function(oExtension) {
			return TableUtils.hasRowHeader(oExtension.getTable()) ? 1 : 0;
		},

		isItemNavigationInvalid: function(oExtension) {
			return !oExtension._itemNavigation || oExtension._itemNavigationInvalidated;
		}
	};

	/**
	 * Extension for sap.ui.table.Table which handles keyboard related things.
	 * <b>This is an internal class that is only intended to be used inside the sap.ui.table library! Any usage outside the sap.ui.table library is
	 * strictly prohibited!</b>
	 *
	 * @class Extension for sap.ui.table.Table which handles keyboard related things.
	 * @extends sap.ui.table.extensions.ExtensionBase
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @alias sap.ui.table.extensions.Keyboard
	 */
	const KeyboardExtension = ExtensionBase.extend("sap.ui.table.extensions.Keyboard",
		/** @lends sap.ui.table.extensions.Keyboard.prototype */ {
		/**
		 * @override
		 * @inheritDoc
		 * @returns {string} The name of this extension.
		 */
		_init: function(oTable, sTableType, mSettings) {
			this._itemNavigation = null;
			this._itemNavigationInvalidated = false; // determines whether item navigation should be reapplied from scratch
			this._itemNavigationSuspended = false; // switch off event forwarding to item navigation
			this._delegate = new KeyboardDelegate(sTableType);
			this._actionMode = false;

			// Register the delegates in correct order
			TableUtils.addDelegate(oTable, ExtensionDelegate, oTable);
			TableUtils.addDelegate(oTable, this._delegate, oTable);
			TableUtils.addDelegate(oTable, ItemNavigationDelegate, oTable);

			/**
			 * Gets the item navigation.
			 *
			 * @alias sap.ui.table.Table#_getItemNavigation
			 * @returns {sap.ui.core.delegate.ItemNavigation} The item navigation.
			 * @private
			 */
			oTable._getItemNavigation = function() {
				return this._itemNavigation;
			}.bind(this);

			return "KeyboardExtension";
		},

		/**
		 * Enables debugging for the extension. Internal helper classes become accessible.
		 *
		 * @private
		 */
		_debug: function() {
			this._ExtensionHelper = ExtensionHelper;
			this._ItemNavigationDelegate = ItemNavigationDelegate;
			this._ExtensionDelegate = ExtensionDelegate;
		},

		/**
		 * @override
		 * @inheritDoc
		 */
		destroy: function() {
			// Deregister the delegates
			const oTable = this.getTable();
			if (oTable) {
				oTable.removeEventDelegate(ExtensionDelegate);
				oTable.removeEventDelegate(this._delegate);
				oTable.removeEventDelegate(ItemNavigationDelegate);
			}

			if (this._itemNavigation) {
				this._itemNavigation.destroy();
				this._itemNavigation = null;
			}

			if (this._delegate) {
				this._delegate.destroy();
				this._delegate = null;
			}

			ExtensionBase.prototype.destroy.apply(this, arguments);
		}
	});

	/**
	 * Check whether item navigation should be reapplied from scratch and initializes it if needed.
	 */
	KeyboardExtension.prototype.initItemNavigation = function() {
		ExtensionHelper.initItemNavigation(this);
	};

	/**
	 * Invalidates the item navigation (forces a re-initialization with the next initItemNavigation call).
	 */
	KeyboardExtension.prototype.invalidateItemNavigation = function() {
		this._itemNavigationInvalidated = true;
	};

	/**
	 * Makes the table enter or leave the action mode.
	 *
	 * Hooks:
	 * <code>enterActionMode()</code> - Called when trying to enter the action mode. The action mode will only be entered if this hook returns
	 * <code>true</code>.
	 * <code>leaveActionMode(bKeepFocus: boolean)</code> - Called when leaving the action mode.
	 * Additional parameters passed after <code>bEnter</code> will be forwarded to the calls of the hooks.
	 *
	 * In the action mode the user can navigate through the interactive controls of the table.
	 *
	 * @param {boolean} bEnter Whether to enter or leave the action mode.
	 * @param {boolean} [bKeepFocus=false] Whether to keep the focus unchanged.
	 */
	KeyboardExtension.prototype.setActionMode = function(bEnter, bKeepFocus) {
		if (!this._delegate) {
			return;
		}
		if (bEnter === true && !this._actionMode && this._delegate.enterActionMode) {
			this._actionMode = this._delegate.enterActionMode.call(this.getTable()) === true;
		} else if (bEnter === false && this._actionMode && this._delegate.leaveActionMode) {
			this._actionMode = false;
			this._delegate.leaveActionMode.call(this.getTable(), bKeepFocus === true);
		}
	};

	/**
	 * Returns whether the table is in action mode.
	 *
	 * @returns {boolean} Returns <code>true</code>, if the table is in action mode.
	 */
	KeyboardExtension.prototype.isInActionMode = function() {
		return this._actionMode;
	};

	/**
	 * Sets the focus depending on the noData or overlay mode.
	 * The previous focused element is given (potentially this is not anymore the active focused element,
	 * e.g. see Table.setShowOverlay -> tue to CSS changes the focused element might be hidden which forces a focus change).
	 *
	 * @param {HTMLElement} oPreviousFocusRef The previously focused element.
	 */
	KeyboardExtension.prototype.updateNoDataAndOverlayFocus = function() {
		const oTable = this.getTable();
		const oActiveElement = document.activeElement;

		if (!oTable || !oTable.getDomRef()) {
			return;
		}

		if (oTable.getShowOverlay()) {
			if (containsOrEquals(oTable.getDomRef(), oActiveElement) && oTable.$("overlay")[0] !== oActiveElement) {
				this._oLastFocus = {Ref: oActiveElement, Pos: "overlay"};
				oTable.getDomRef("overlay").focus();
			}
		} else if (TableUtils.isNoDataVisible(oTable)) {
			if (oTable.$("noDataCnt")[0] === oActiveElement) {
				return;
			}
			if (containsOrEquals(oTable.getDomRef("tableCCnt"), oActiveElement)) {
				this._oLastFocus = {Ref: oActiveElement, Pos: "table content"};
				if (Device.browser.safari) {
					oTable.getDomRef("noDataCnt").getBoundingClientRect();
				}
				oTable.getDomRef("noDataCnt").focus();
			} else if (oTable.$("overlay")[0] === oActiveElement) {
				setFocusFallback(oTable, this);
			} else if (oTable._bApplyFocusInfoFailed) {
				this._oLastFocus = {Ref: oActiveElement, Pos: "table content"};
				delete oTable._bApplyFocusInfoFailed;
				oTable.getDomRef("noDataCnt").focus();
			}
		} else if (this._oLastFocus) {
			if (this._oLastFocus.Pos === "table content") {
				if (containsOrEquals(oTable.getDomRef("tableCCnt"), this._oLastFocus.Ref)) {
					restoreFocusToDataCell(oTable, this);
				} else if (oTable.getRows()[0] && oTable.getRows()[0].getDomRef("col0")) {
					oTable.getRows()[0].getDomRef("col0").focus();
					this._oLastFocus = null;
				}
			} else if (this._oLastFocus.Pos === "overlay") {
				if (containsOrEquals(oTable.getDomRef(), this._oLastFocus.Ref)) {
					restoreFocusToDataCell(oTable, this);
				} else {
					setFocusFallback(oTable, this);
				}
			}
		}
	};

	function restoreFocusToDataCell(oTable, oKeyboardExtension) {
		if (!jQuery(oKeyboardExtension._oLastFocus.Ref).hasClass("sapUiTableCell")) {
			const oParentCell = TableUtils.getParentCell(oTable, oKeyboardExtension._oLastFocus.Ref);

			if (oParentCell && oParentCell[0] && jQuery(oParentCell[0]).hasClass("sapUiTableCell")) {
				oParentCell[0].focus();
			} else {
				oKeyboardExtension._oLastFocus.Ref.focus();
			}
		} else {
			oKeyboardExtension._oLastFocus.Ref.focus();
		}
		oKeyboardExtension._oLastFocus = null;
	}

	function setFocusFallback(oTable, oKeyboardExtension) {
		if (oTable.getColumnHeaderVisible()) {
			TableUtils.focusItem(oTable, ExtensionHelper.getInitialItemNavigationIndex(oKeyboardExtension));
			oKeyboardExtension._oLastFocus = null;
		} else if (TableUtils.isNoDataVisible(oTable)) {
			oTable.getDomRef("noDataCnt").focus();
			oKeyboardExtension._oLastFocus = null;
		} else if (oTable.getRows()[0] && oTable.getRows()[0].getDomRef("col0")) {
			oTable.getRows()[0].getDomRef("col0").focus();
			oKeyboardExtension._oLastFocus = null;
		}
	}

	/**
	 * Suspends the event handling of the item navigation.
	 */
	KeyboardExtension.prototype.suspendItemNavigation = function() {
		this._itemNavigationSuspended = true;
	};

	/**
	 * Resumes the event handling of the item navigation.
	 */
	KeyboardExtension.prototype.resumeItemNavigation = function() {
		this._itemNavigationSuspended = false;
	};

	/**
	 * Returns whether the item navigation is suspended.
	 *
	 * @returns {boolean} Returns <code>true</code>, if the item navigation is suspended.
	 */
	KeyboardExtension.prototype.isItemNavigationSuspended = function() {
		return this._itemNavigationSuspended;
	};

	/**
	 * Returns the combined info about the last focused data cell (based on the item navigation).
	 *
	 * @returns {sap.ui.table.utils.TableUtils.FocusedItemInfo} The cell info of the last focused cell.
	 */
	KeyboardExtension.prototype.getLastFocusedCellInfo = function() {
		const iHeader = TableUtils.getHeaderRowCount(this.getTable());
		if (!this._oLastFocusedCellInfo || this._oLastFocusedCellInfo.header !== iHeader) {
			const oInfo = TableUtils.getFocusedItemInfo(this.getTable());
			const iDfltIdx = ExtensionHelper.getInitialItemNavigationIndex(this);

			return {
				cellInRow: iDfltIdx,
				row: iHeader,
				header: iHeader,
				cellCount: oInfo.cellCount,
				columnCount: oInfo.columnCount,
				cell: oInfo.columnCount * iHeader + iDfltIdx
			};
		}
		return this._oLastFocusedCellInfo;
	};

	/**
	 * Sets the focus to the specified element and marks the resulting focus event to be ignored.
	 *
	 * @param {jQuery|HTMLElement} oElement The element to be focused.
	 */
	KeyboardExtension.prototype.setSilentFocus = function(oElement) {
		this._bIgnoreFocusIn = true;
		this.setFocus(oElement);
		this._bIgnoreFocusIn = false;
	};

	/**
	 * Sets the focus to the specified element.
	 *
	 * @param {jQuery|HTMLElement} oElement The element to be focused.
	 */
	KeyboardExtension.prototype.setFocus = function(oElement) {
		if (!oElement) {
			return;
		}

		const oTable = this.getTable();
		const oCellInfo = TableUtils.getCellInfo(oElement);

		if (oCellInfo.isOfType(TableUtils.CELLTYPE.ANY) && oTable) {
			const $Elem = jQuery(oElement);

			if ($Elem.attr("tabindex") !== "0") {
				const oItemNav = oTable._getItemNavigation();

				if (oItemNav && oItemNav.aItemDomRefs) {
					for (let i = 0; i < oItemNav.aItemDomRefs.length; i++) {
						if (oItemNav.aItemDomRefs[i]) {
							oItemNav.aItemDomRefs[i].setAttribute("tabindex", "-1");
						}
					}
				}
				$Elem.attr("tabindex", "0");
			}
		}

		if (oElement instanceof HTMLElement) {
			oElement.focus();
		} else {
			oElement.trigger("focus");
		}
	};

	return KeyboardExtension;
});

/**
 * Gets the keyboard extension.
 *
 * @name sap.ui.table.Table#_getKeyboardExtension
 * @function
 * @returns {sap.ui.table.extensions.Keyboard} The keyboard extension.
 * @private
 */