/*!
 * ${copyright}
 */

// Provides helper sap.ui.table.TableKeyboardExtension.
sap.ui.define([
	"./TableExtension",
	"sap/ui/core/delegate/ItemNavigation",
	"./TableUtils",
	"./TableKeyboardDelegate2",
	"sap/ui/Device",
	"sap/ui/dom/containsOrEquals",
	"sap/ui/thirdparty/jquery"
], function(
	TableExtension,
	ItemNavigation,
	TableUtils,
	TableKeyboardDelegate,
	Device,
	containsOrEquals,
	jQuery
) {
	"use strict";

	var bIEFocusOutlineWorkaroundApplied = false;

	function applyIEFocusOutlineWorkaround(oElement) {
		/*
		 * In Internet Explorer there are problems with the focus outline on tables.
		 * The following seems to help because it forces a repaint.
		 *
		 * The following conditions must be fullfilled:
		 * - The function must be called after the item navigation has handled the focusin event (see below)
		 * - An attribute (here data-sap-ui-table-focus) must be changed on focus
		 * - And a CSS declaration (separate from CSS of table library) must be available with attribute selector
		 *   (the prefix (here .sapUiTableStatic) doesn't matter)
		 */
		if (Device.browser.msie) {
			if (!bIEFocusOutlineWorkaroundApplied) {
				jQuery("head").append(
					"<style type=\"text/css\">" +
					"/* Avoid focus outline problems in tables */\n" +
					".sapUiTableStatic[data-sap-ui-table-focus]{}" +
					"</style>"
				);
				bIEFocusOutlineWorkaroundApplied = true;
			}
			var oCellInfo = TableUtils.getCellInfo(oElement) || {};
			if (oCellInfo.cell) {
				oCellInfo.cell.attr("data-sap-ui-table-focus", Date.now());
			}
		}
	}

	/*
	 * Wrapper for event handling of the item navigation.
	 * Allows to selectively forward the events to the item navigation.
	 * "this" in the function context is the table instance
	 */
	var ItemNavigationDelegate = {
		_forward: function(oTable, oEvent) {
			var oIN = oTable._getItemNavigation();

			if (oIN != null
				&& !oTable._getKeyboardExtension()._isItemNavigationSuspended()
				&& !oEvent.isMarked("sapUiTableSkipItemNavigation")) {

				oIN["on" + oEvent.type](oEvent);
			}
		},
		onfocusin: function(oEvent) {
			ItemNavigationDelegate._forward(this, oEvent);
			applyIEFocusOutlineWorkaround(oEvent.target);
		},
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
	var ExtensionDelegate = {
		onfocusin: function(oEvent) {
			var oExtension = this._getKeyboardExtension();

			if (!oExtension._bIgnoreFocusIn) {
				oExtension.initItemNavigation();
				if (ExtensionHelper.isItemNavigationInvalid(this)) {
					oEvent.setMarked("sapUiTableInitItemNavigation");
				}
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
	var ExtensionHelper = {
		/*
		 * Initialize ItemNavigations (content and header) and transfer relevant dom elements.
		 * TabIndexes are set by the ItemNavigation.
		 */
		_initItemNavigation: function(oExtension) {
			var oTable = oExtension.getTable();
			var $Table = oTable.$();
			var iColumnCount = TableUtils.getVisibleColumnCount(oTable);
			var iTotalColumnCount = iColumnCount;
			var bHasRowHeader = TableUtils.hasRowHeader(oTable);
			var bHasRowActions = TableUtils.hasRowActions(oTable);
			var bHasFixedColumns = TableUtils.hasFixedColumns(oTable);

			// create the list of item dom refs
			var aItemDomRefs = [],
				aRowHdrDomRefs, aRowActionDomRefs, $topLeft, $middleLeft, $bottomLeft;

			if (bHasFixedColumns) {
				$topLeft = $Table.find(".sapUiTableCtrlFixed.sapUiTableCtrlRowFixed:not(.sapUiTableCHT)");
				$middleLeft = $Table.find(".sapUiTableCtrlFixed.sapUiTableCtrlRowScroll:not(.sapUiTableCHT)");
				$bottomLeft = $Table.find(".sapUiTableCtrlFixed.sapUiTableCtrlRowFixedBottom:not(.sapUiTableCHT)");
			}

			var $topRight = $Table.find(".sapUiTableCtrlScroll.sapUiTableCtrlRowFixed:not(.sapUiTableCHT)");
			var $middleRight = $Table.find(".sapUiTableCtrlScroll.sapUiTableCtrlRowScroll:not(.sapUiTableCHT)");
			var $bottomRight = $Table.find(".sapUiTableCtrlScroll.sapUiTableCtrlRowFixedBottom:not(.sapUiTableCHT)");

			if (bHasRowHeader) {
				aRowHdrDomRefs = $Table.find(".sapUiTableRowHdr").get();
				iTotalColumnCount++;
			}

			if (bHasRowActions) {
				aRowActionDomRefs = $Table.find(".sapUiTableRowAction").get();
				iTotalColumnCount++;
			}

			for (var i = 0; i < oTable.getVisibleRowCount(); i++) {
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
				var aHeaderDomRefs = [];

				// Returns the .sapUiTableColHdr elements (.sapUiTableColHdrCnt .sapUiTableCtrlFixed .sapUiTableColHdrTr)
				var $FixedHeaders = $Table.find(".sapUiTableCHT.sapUiTableCtrlFixed>tbody>tr");
				// Returns the .sapUiTableColHdr elements (.sapUiTableColHdrCnt .sapUiTableCtrlScr .sapUiTableColHdrTr)
				var $ScrollHeaders = $Table.find(".sapUiTableCHT.sapUiTableCtrlScroll>tbody>tr");

				for (var i = 0; i < TableUtils.getHeaderRowCount(oTable); i++) {
					if (bHasRowHeader) {
						aHeaderDomRefs.push(oTable.getDomRef("selall"));
					}

					if ($FixedHeaders.length) {
						aHeaderDomRefs = aHeaderDomRefs.concat(jQuery($FixedHeaders.get(i)).find(".sapUiTableCol").get());
					}
					if ($ScrollHeaders.length) {
						aHeaderDomRefs = aHeaderDomRefs.concat(jQuery($ScrollHeaders.get(i)).find(".sapUiTableCol").get());
					}

					if (bHasRowActions) {
						// Only add a dummy (inivisible inner text) to fullfill matrix for item navigation.
						// Header should not be focuable.
						aHeaderDomRefs.push($Table.find(".sapUiTableRowActionHeader").children().get(0));
					}
				}

				aItemDomRefs = aHeaderDomRefs.concat(aItemDomRefs);
			}

			// initialization of item navigation for the Table control
			if (!oExtension._itemNavigation) {
				oExtension._itemNavigation = new ItemNavigation();
				oExtension._itemNavigation.setTableMode(true);
				oExtension._itemNavigation.attachEvent(ItemNavigation.Events.AfterFocus, function(oEvent) {
					var oInfo = TableUtils.getFocusedItemInfo(oTable);
					oInfo.header = TableUtils.getHeaderRowCount(oTable);
					oInfo.domRef = null; //Do not keep dom references

					if (oInfo.row >= oInfo.header) {
						oExtension._oLastFocusedCellInfo = oInfo;
					}
				}, oTable);
			}

			// configure the item navigation
			oExtension._itemNavigation.setColumns(iTotalColumnCount);
			oExtension._itemNavigation.setRootDomRef($Table.find(".sapUiTableCnt").get(0));
			oExtension._itemNavigation.setItemDomRefs(aItemDomRefs);
			oExtension._itemNavigation.setFocusedIndex(ExtensionHelper.getInitialItemNavigationIndex(oExtension));

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
	 * @extends sap.ui.table.TableExtension
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @alias sap.ui.table.TableKeyboardExtension
	 */
	var TableKeyboardExtension = TableExtension.extend("sap.ui.table.TableKeyboardExtension",
		/** @lends sap.ui.table.TableKeyboardExtension.prototype */ {
		/**
		 * @override
		 * @inheritDoc
		 * @returns {string} The name of this extension.
		 */
		_init: function(oTable, sTableType, mSettings) {
			this._itemNavigation = null;
			this._itemNavigationInvalidated = false; // determines whether item navigation should be reapplied from scratch
			this._itemNavigationSuspended = false; // switch off event forwarding to item navigation
			this._delegate = new TableKeyboardDelegate(sTableType);
			this._actionMode = false;

			// Register the delegates in correct order
			TableUtils.addDelegate(ExtensionDelegate, oTable, true);
			TableUtils.addDelegate(this._delegate, oTable, true);
			TableUtils.addDelegate(ItemNavigationDelegate, oTable, true);

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
			var oTable = this.getTable();
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

			TableExtension.prototype.destroy.apply(this, arguments);
		}
	});

	/**
	 * Check whether item navigation should be reapplied from scratch and initializes it if needed.
	 *
	 * @public
	 */
	TableKeyboardExtension.prototype.initItemNavigation = function() {
		if (ExtensionHelper.isItemNavigationInvalid(this)) {
			ExtensionHelper._initItemNavigation(this);
		}
	};

	/**
	 * Invalidates the item navigation (forces a re-initialization with the next initItemNavigation call).
	 *
	 * @public
	 */
	TableKeyboardExtension.prototype.invalidateItemNavigation = function() {
		this._itemNavigationInvalidated = true;
	};

	/**
	 * Makes the table enter or leave the action mode.
	 *
	 * Hooks:
	 * <code>enterActionMode()</code> - Called when trying to enter the action mode. The action mode will only be entered if this hook returns
	 * <code>true</code>.
	 * <code>leaveActionMode()</code> - Called when leaving the action mode.
	 * Additional parameters passed after <code>bEnter</code> will be forwarded to the calls of the hooks.
	 *
	 * In the action mode the user can navigate through the interactive controls of the table.
	 *
	 * @param {boolean} bEnter If set to <code>true</code>, the table will try to enter the action mode, otherwise the table will leave the action
	 *     mode.
	 * @public (Part of the API for Table control only!)
	 */
	TableKeyboardExtension.prototype.setActionMode = function(bEnter) {
		if (bEnter === true && !this._actionMode && this._delegate.enterActionMode) {
			this._actionMode = this._delegate.enterActionMode.apply(this.getTable(), Array.prototype.slice.call(arguments, 1)) === true;
		} else if (bEnter === false && this._actionMode && this._delegate.leaveActionMode) {
			this._actionMode = false;
			this._delegate.leaveActionMode.apply(this.getTable(), Array.prototype.slice.call(arguments, 1));
		}
	};

	/**
	 * Returns whether the table is in action mode.
	 *
	 * @returns {boolean} Returns <code>true</code>, if the table is in action mode.
	 * @public
	 */
	TableKeyboardExtension.prototype.isInActionMode = function() {
		return this._actionMode;
	};

	/**
	 * Sets the focus depending on the noData or overlay mode.
	 * The previous focused element is given (potentially this is not anymore the active focused element,
	 * e.g. see Table.setShowOverlay -> tue to CSS changes the focused element might be hidden which forces a focus change).
	 *
	 * @param {HTMLElement} oPreviousFocusRef The previously focused element.
	 * @public
	 */
	TableKeyboardExtension.prototype.updateNoDataAndOverlayFocus = function(oPreviousFocusRef) {
		var oTable = this.getTable();
		if (!oTable || !oTable.getDomRef()) {
			return;
		}

		if (oTable.getShowOverlay()) {
			// The overlay is shown
			if (containsOrEquals(oTable.getDomRef(), oPreviousFocusRef)) {
				oTable.$("overlay").focus(); // Set focus on Overlay Container if it was somewhere in the table before
			}
		} else if (TableUtils.isNoDataVisible(oTable)) {
			// The noData area is shown
			if (containsOrEquals(oTable.getDomRef("sapUiTableCnt"), oPreviousFocusRef)) {
				oTable.$("noDataCnt").focus(); // Set focus on NoData Container if it was on the content before
			}
		} else if (containsOrEquals(oTable.getDomRef("noDataCnt"), oPreviousFocusRef)
				   || containsOrEquals(oTable.getDomRef("overlay"), oPreviousFocusRef)) {
			// The overlay or noData area is not shown but was shown before
			TableUtils.focusItem(oTable, ExtensionHelper.getInitialItemNavigationIndex(this)); // Set focus on first focusable element
		}
	};

	/**
	 * Suspends the event handling of the item navigation.
	 *
	 * @protected
	 */
	TableKeyboardExtension.prototype._suspendItemNavigation = function() {
		this._itemNavigationSuspended = true;
	};

	/**
	 * Resumes the event handling of the item navigation.
	 *
	 * @protected
	 */
	TableKeyboardExtension.prototype._resumeItemNavigation = function() {
		this._itemNavigationSuspended = false;
	};

	/**
	 * Returns whether the item navigation is suspended.
	 *
	 * @returns {boolean} Returns <code>true</code>, if the item navigation is suspended.
	 * @protected
	 */
	TableKeyboardExtension.prototype._isItemNavigationSuspended = function() {
		return this._itemNavigationSuspended;
	};

	/**
	 * Returns the combined info about the last focused data cell (based on the item navigation).
	 *
	 * @returns {sap.ui.table.TableUtils.FocusedItemInfo} The cell info of the last focused cell.
	 * @protected
	 */
	TableKeyboardExtension.prototype._getLastFocusedCellInfo = function() {
		var iHeader = TableUtils.getHeaderRowCount(this.getTable());
		if (!this._oLastFocusedCellInfo || this._oLastFocusedCellInfo.header != iHeader) {
			var oInfo = TableUtils.getFocusedItemInfo(this.getTable());
			var iDfltIdx = ExtensionHelper.getInitialItemNavigationIndex(this);

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
	 * @protected
	 */
	TableKeyboardExtension.prototype._setSilentFocus = function(oElement) {
		this._bIgnoreFocusIn = true;
		this._setFocus(oElement);
		this._bIgnoreFocusIn = false;
	};

	/**
	 * Sets the focus to the specified element.
	 *
	 * @param {jQuery|HTMLElement} oElement The element to be focused.
	 * @protected
	 */
	TableKeyboardExtension.prototype._setFocus = function(oElement) {
		if (!oElement) {
			return;
		}

		var oTable = this.getTable();
		var oCellInfo = TableUtils.getCellInfo(oElement);

		if (oCellInfo.cell && oTable) {
			var $Elem = jQuery(oElement);

			if ($Elem.attr("tabindex") != "0") {
				var oItemNav = oTable._getItemNavigation();

				if (oItemNav && oItemNav.aItemDomRefs) {
					for (var i = 0; i < oItemNav.aItemDomRefs.length; i++) {
						if (oItemNav.aItemDomRefs[i]) {
							oItemNav.aItemDomRefs[i].setAttribute("tabindex", "-1");
						}
					}
				}
				$Elem.attr("tabindex", "0");
			}
		}

		oElement.focus();
	};

	/*
	 * Returns the type of the related table.
	 *
	 * @returns {sap.ui.table.TableExtension.TABLETYPES} The type of the table.
	 * @protected
	 */
	TableKeyboardExtension.prototype._getTableType = function() {
		return this._type;
	};

	return TableKeyboardExtension;
	});

/**
 * Gets the keyboard extension.
 *
 * @name sap.ui.table.Table#_getKeyboardExtension
 * @function
 * @returns {sap.ui.table.TableKeyboardExtension} The keyboard extension.
 * @private
 */