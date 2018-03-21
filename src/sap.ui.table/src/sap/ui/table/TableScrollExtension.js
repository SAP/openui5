/*!
 * ${copyright}
 */

// Provides helper sap.ui.table.TableScrollExtension.
sap.ui.define([
	'jquery.sap.global', './TableExtension', './TableUtils', 'sap/ui/Device', './library'
], function(jQuery, TableExtension, TableUtils, Device, library) {
	"use strict";

	// Shortcuts
	var SharedDomRef = library.SharedDomRef;

	/**
	 * Provides almost the full functionality which is required for the horizontal scrolling within the table.
	 * Find the remaining functionality in the <code>ExtensionHelper</code> and the <code>ExtensionDelegate</code>.
	 *
	 * @see ExtensionHelper#onMouseWheelScrolling
	 * @see ExtensionDelegate#onAfterRendering
	 */
	var HorizontalScrollingHelper = {
		/**
		 * Will be called when scrolled horizontally. Because the table does not render/update the data of all columns (only the visible ones),
		 * we need to update the content of the columns which became visible.
		 *
		 * @param {UIEvent} oEvent The event object.
		 */
		onScroll: function(oEvent) {
			var oScrollExtension = this._getScrollExtension();

			// For interaction detection.
			jQuery.sap.interaction.notifyScrollEvent && jQuery.sap.interaction.notifyScrollEvent(oEvent);

			if (this._bOnAfterRendering) {
				return;
			}

			var iNewScrollLeft = oEvent.target.scrollLeft;
			var iOldScrollLeft = oEvent.target._scrollLeft;

			if (iNewScrollLeft !== iOldScrollLeft) {
				var aScrollAreas = HorizontalScrollingHelper._getScrollAreas(this);

				oEvent.target._scrollLeft = iNewScrollLeft;

				// Synchronize the scroll positions.
				for (var i = 0; i < aScrollAreas.length; i++) {
					var oScrollArea = aScrollAreas[i];

					if (oScrollArea !== oEvent.target && oScrollArea.scrollLeft !== iNewScrollLeft) {
						oScrollArea.scrollLeft = iNewScrollLeft;
						oScrollArea._scrollLeft = iNewScrollLeft;
					}
				}

				oScrollExtension._iHorizontalScrollPosition = iNewScrollLeft;
				this._determineVisibleCols(this._collectTableSizes());
			}
		},

		/**
		 * This function can be used to restore the last horizontal scroll position which has been stored.
		 * In case there is no stored scroll position nothing happens.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 *
		 * @see HorizontalScrollingHelper#onScroll
		 */
		restoreScrollPosition: function(oTable) {
			var oScrollExtension = oTable._getScrollExtension();
			var oHSb = oScrollExtension.getHorizontalScrollbar();

			if (oHSb !== null && oScrollExtension._iHorizontalScrollPosition !== null) {
				var aScrollTargets = HorizontalScrollingHelper._getScrollAreas(oTable);

				for (var i = 0; i < aScrollTargets.length; i++) {
					var oScrollTarget = aScrollTargets[i];
					delete oScrollTarget._scrollLeft;
				}

				if (oHSb.scrollLeft !== oScrollExtension._iHorizontalScrollPosition) {
					oHSb.scrollLeft = oScrollExtension._iHorizontalScrollPosition;
				} else {
					var oEvent = jQuery.Event("scroll");
					oEvent.target = oHSb;
					HorizontalScrollingHelper.onScroll.call(oTable, oEvent);
				}
			}
		},

		/**
		 * Adds a horizontal <code>scroll</code> event listener to all horizontal scroll areas of a table.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 */
		addEventListeners: function(oTable) {
			var oScrollExtension = oTable._getScrollExtension();
			var aScrollAreas = HorizontalScrollingHelper._getScrollAreas(oTable);

			if (oScrollExtension._onHorizontalScrollEventHandler == null) {
				oScrollExtension._onHorizontalScrollEventHandler = HorizontalScrollingHelper.onScroll.bind(oTable);
			}

			for (var i = 0; i < aScrollAreas.length; i++) {
				aScrollAreas[i].addEventListener("scroll", oScrollExtension._onHorizontalScrollEventHandler);
			}
		},

		/**
		 * Removes the horizontal <code>scroll</code> event listener from all horizontal scroll areas of a table.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 */
		removeEventListeners: function(oTable) {
			var oScrollExtension = oTable._getScrollExtension();
			var aScrollAreas = HorizontalScrollingHelper._getScrollAreas(oTable);

			if (oScrollExtension._onHorizontalScrollEventHandler != null) {
				for (var i = 0; i < aScrollAreas.length; i++) {
					aScrollAreas[i].removeEventListener("scroll", oScrollExtension._onHorizontalScrollEventHandler);
					delete aScrollAreas[i]._scrollLeft;
				}
				delete oScrollExtension._onHorizontalScrollEventHandler;
			}
		},

		/**
		 * Returns the areas of the table which can be scrolled horizontally.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @returns {Array.<HTMLElement>} Returns only elements which exist in the DOM.
		 * @private
		 */
		_getScrollAreas: function(oTable) {
			var aScrollAreas = [
				oTable._getScrollExtension().getHorizontalScrollbar(),
				oTable.getDomRef("sapUiTableColHdrScr"), // Column header scroll area.
				oTable.getDomRef("sapUiTableCtrlScr") // Content scroll area.
			];

			return aScrollAreas.filter(function(oScrollArea) {
				return oScrollArea != null;
			});
		}
	};

	/**
	 * Provides almost the full functionality which is required for the vertical scrolling within the table.
	 * Find the remaining functionality in the <code>ExtensionHelper</code> and the <code>ExtensionDelegate</code>.
	 *
	 * @see ExtensionHelper#onMouseWheelScrolling
	 * @see ExtensionDelegate#onAfterRendering
	 */
	var VerticalScrollingHelper = {
		/**
		 * Will be called when scrolled vertically. Updates the visualized data by applying the first visible row from the vertical scrollbar.
		 *
		 * @param {UIEvent} oEvent The event object.
		 */
		onScroll: function(oEvent) {
			var oScrollExtension = this._getScrollExtension();

			// For interaction detection.
			jQuery.sap.interaction.notifyScrollEvent && jQuery.sap.interaction.notifyScrollEvent(oEvent);

			if (oScrollExtension._bIsScrolledVerticallyByKeyboard) {
				return;
			}

			// Do not scroll in action mode when scrolling was not initiated by a keyboard action! Might cause loss of user input and other undesired behavior.
			this._getKeyboardExtension().setActionMode(false);

			/**
			 * Adjusts the first visible row to the new horizontal scroll position.
			 * @param {sap.ui.table.Table} oTable Instance of the table.
			 */
			function updateVisibleRow(oTable) {
				var oVSb = oTable._getScrollExtension().getVerticalScrollbar();

				if (!oVSb) {
					return;
				}

				var iScrollTop = oVSb.scrollTop;
				oScrollExtension._iVerticalScrollPosition = iScrollTop;

				var iNewFirstVisibleRowIndex = oTable._getFirstVisibleRowByScrollTop(iScrollTop);
				var iOldFirstVisibleRowIndex = oTable.getFirstVisibleRow();
				var bFirstVisibleRowChanged = iNewFirstVisibleRowIndex !== iOldFirstVisibleRowIndex;

				if (bFirstVisibleRowChanged) {
					oTable.setFirstVisibleRow(iNewFirstVisibleRowIndex, true);

					if (TableUtils.isVariableRowHeightEnabled(oTable)) {
						oTable.attachEventOnce("_rowsUpdated", function() {
							// Do not use iScrollTop from the closure. The scroll position might have been changed already.
							this._adjustTablePosition(oVSb.scrollTop, this._aRowHeights);
						});
					}

				} else if (TableUtils.isVariableRowHeightEnabled(oTable)) {
					oTable._adjustTablePosition(iScrollTop, oTable._aRowHeights);
				}
			}

			if (this._bLargeDataScrolling && !oScrollExtension._bIsScrolledVerticallyByWheel) {
				jQuery.sap.clearDelayedCall(this._mTimeouts.scrollUpdateTimerId);
				this._mTimeouts.scrollUpdateTimerId = jQuery.sap.delayedCall(300, this, function() {
					updateVisibleRow(this);
					delete this._mTimeouts.scrollUpdateTimerId;
				}.bind(this));
			} else {
				updateVisibleRow(this);
			}

			oScrollExtension._bIsScrolledVerticallyByWheel = false;
		},

		/**
		 * Will be called when the vertical scrollbar is clicked.
		 * Resets the vertical scroll flags.
		 *
		 * @param {MouseEvent} oEvent The event object.
		 */
		onScrollbarMouseDown: function(oEvent) {
			var oScrollExtension = this._getScrollExtension();

			oScrollExtension._bIsScrolledVerticallyByWheel = false;
			oScrollExtension._bIsScrolledVerticallyByKeyboard = false;
		},

		/**
		 * This function can be used to restore the last vertical scroll position which has been stored.
		 * In case there is no stored scroll position, the scroll position is calculated depending on the value of <code>firstVisibleRow</code>.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 *
		 * @see VerticalScrollingHelper#onScroll
		 * @see sap.ui.table.Table#_updateVSbScrollTop
		 */
		restoreScrollPosition: function(oTable) {
			var oScrollExtension = oTable._getScrollExtension();

			if (oScrollExtension._iVerticalScrollPosition !== null) {
				oTable._updateVSbScrollTop(oScrollExtension._iVerticalScrollPosition);
			} else {
				oTable._updateVSbScrollTop();
			}
		},

		/**
		 * Adds the event listeners which are required for the vertical scrolling.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 */
		addEventListeners: function(oTable) {
			var oScrollExtension = oTable._getScrollExtension();
			var aScrollAreas = VerticalScrollingHelper._getScrollAreas(oTable);
			var oVSb = oScrollExtension.getVerticalScrollbar();

			if (oScrollExtension._onVerticalScrollEventHandler == null) {
				oScrollExtension._onVerticalScrollEventHandler = VerticalScrollingHelper.onScroll.bind(oTable);
			}

			for (var i = 0; i < aScrollAreas.length; i++) {
				aScrollAreas[i].addEventListener("scroll", oScrollExtension._onVerticalScrollEventHandler);
			}

			if (oVSb !== null) {
				if (oScrollExtension._onVerticalScrollbarMouseDownEventHandler == null) {
					oScrollExtension._onVerticalScrollbarMouseDownEventHandler = VerticalScrollingHelper.onScrollbarMouseDown.bind(oTable);
				}
				oVSb.addEventListener("mousedown", oScrollExtension._onVerticalScrollbarMouseDownEventHandler);
			}
		},

		/**
		 * Removes event listeners which are required for the vertical scrolling.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 */
		removeEventListeners: function(oTable) {
			var oScrollExtension = oTable._getScrollExtension();
			var aScrollAreas = VerticalScrollingHelper._getScrollAreas(oTable);
			var oVSb = oScrollExtension.getVerticalScrollbar();

			if (oScrollExtension._onVerticalScrollEventHandler != null) {
				for (var i = 0; i < aScrollAreas.length; i++) {
					aScrollAreas[i].removeEventListener("scroll", oScrollExtension._onVerticalScrollEventHandler);
				}
				delete oScrollExtension._onVerticalScrollEventHandler;
			}

			if (oVSb !== null && oScrollExtension._onVerticalScrollbarMouseDownEventHandler != null) {
				oVSb.removeEventListener("mousedown", oScrollExtension._onVerticalScrollbarMouseDownEventHandler);
				delete oScrollExtension._onVerticalScrollbarMouseDownEventHandler;
			}
		},

		/**
		 * Returns the areas of the table which can be scrolled vertically.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @returns {Array.<HTMLElement>} Returns only elements which exist in the DOM.
		 * @private
		 */
		_getScrollAreas: function(oTable) {
			var aScrollAreas = [
				oTable._getScrollExtension().getVerticalScrollbar()
			];

			return aScrollAreas.filter(function(oScrollArea) {
				return oScrollArea != null;
			});
		}
	};

	/*
	 * Provides utility functions used by this extension.
	 */
	var ExtensionHelper = {
		/**
		 * Will be called when scrolled with the mouse wheel.
		 * @param {WheelEvent} oEvent The event object.
		 */
		onMouseWheelScrolling: function(oEvent) {
			var oScrollExtension = this._getScrollExtension();
			var bVerticalDelta = Math.abs(oEvent.originalEvent.deltaY) > Math.abs(oEvent.originalEvent.deltaX);
			var iScrollDelta = bVerticalDelta ? oEvent.originalEvent.deltaY : oEvent.originalEvent.deltaX;
			var bHorizontalScrolling = bVerticalDelta && oEvent.originalEvent.shiftKey || !bVerticalDelta;
			var bScrollingForward = iScrollDelta > 0;
			var bScrolledToEnd = false;

			if (iScrollDelta === 0) {
				return;
			}

			if (bHorizontalScrolling) {
				var oHSb = oScrollExtension.getHorizontalScrollbar();

				if (oEvent.originalEvent.deltaMode > 0 /* Not DOM_DELTA_PIXEL */) {
					// For simplicity and performance reasons horizontal line and page scrolling is always performed by the distance of one minimum
					// column width. To determine the real scroll distance reading from the DOM is necessary, but this should be avoided in an
					// event handler.
					var iMinColumnWidth = TableUtils.Column.getMinColumnWidth();
					iScrollDelta = bScrollingForward ? iMinColumnWidth : -iMinColumnWidth;
				}

				if (bScrollingForward) {
					bScrolledToEnd = oHSb.scrollLeft === oHSb.scrollWidth - oHSb.clientWidth;
				} else {
					bScrolledToEnd = oHSb.scrollLeft === 0;
				}

				if (oScrollExtension.isHorizontalScrollbarVisible() && !bScrolledToEnd) {
					oHSb.scrollLeft = oHSb.scrollLeft + iScrollDelta;
				}

				oEvent.preventDefault();
				oEvent.stopPropagation();

			} else { // Vertical scrolling
				var oVSb = oScrollExtension.getVerticalScrollbar();

				if (oEvent.originalEvent.deltaMode === 1 /* DOM_DELTA_LINE */) {
					iScrollDelta *= this._getScrollingPixelsForRow();
				} else if (oEvent.originalEvent.deltaMode === 2 /* DOM_DELTA_PAGE */) {
					iScrollDelta *= this._getScrollingPixelsForRow() * this.getVisibleRowCount();
				}

				if (bScrollingForward) {
					bScrolledToEnd = oVSb.scrollTop === oVSb.scrollHeight - oVSb.clientHeight;
				} else {
					bScrolledToEnd = oVSb.scrollTop === 0;
				}

				if (oScrollExtension.isVerticalScrollbarVisible() && !bScrolledToEnd) {
					oEvent.preventDefault();
					oEvent.stopPropagation();

					var iRowsPerStep = iScrollDelta / this._getDefaultRowHeight();

					// If at least one row is scrolled, floor to full rows.
					// Below one row, we scroll pixels.
					if (iRowsPerStep > 1) {
						iRowsPerStep = Math.floor(iRowsPerStep);
					}

					oScrollExtension._bIsScrolledVerticallyByWheel = true;
					oScrollExtension._bIsScrolledVerticallyByKeyboard = false;
					oVSb.scrollTop += iRowsPerStep * this._getScrollingPixelsForRow();
				}
			}
		}
	};

	/*
	 * Event handling for scrolling.
	 * "this" in the function context is the table instance.
	 */
	function onTouchStart(oEvent) {
		if (oEvent.type === "touchstart" || oEvent.pointerType === "touch") {
			this._bIsScrollVertical = null;
			var oTouch = oEvent.touches ? oEvent.touches[0] : oEvent;
			this._aTouchStartPosition = [oTouch.pageX, oTouch.pageY];
			if (this._oVSb) {
				this._iTouchScrollTop = this._oVSb.scrollTop;
			}
			if (this._oHSb) {
				this._iTouchScrollLeft = this._oHSb.scrollLeft;
			}
		}
	}

	function onTouchMove(oEvent) {
		if ((oEvent.type === "touchmove" || oEvent.pointerType === "touch") && this._aTouchStartPosition) {
			var oTouch = oEvent.touches ? oEvent.touches[0] : oEvent;
			var iDeltaX = (oTouch.pageX - this._aTouchStartPosition[0]);
			var iDeltaY = (oTouch.pageY - this._aTouchStartPosition[1]);

			if (this._bIsScrollVertical === null) {
				if (iDeltaX === 0 && iDeltaY === 0) {
					return;
				}
				this._bIsScrollVertical = Math.abs(iDeltaY) >= Math.abs(iDeltaX);
			}

			if (this._bIsScrollVertical && this._oVSb) {
				this._oVSb.scrollTop = this._iTouchScrollTop - iDeltaY;
				if (Device.browser.safari) { // Safari does not support touch-action:none and touch-action:pan-x/y
					oEvent.preventDefault();
				}
			} else if (!this._bIsScrollVertical && this._oHSb) {
				this._oHSb.scrollLeft = this._iTouchScrollLeft - iDeltaX;
				if (Device.browser.safari) { // Safari does not support touch-action:none and touch-action:pan-x/y
					oEvent.preventDefault();
				}
			}
		}
	}

	var ExtensionDelegate = {
		_ontouchstart: onTouchStart, // qUnit helper
		_ontouchmove: onTouchMove,   // qUnit helper
		onAfterRendering: function(oEvent) {
			VerticalScrollingHelper.restoreScrollPosition(this);
			HorizontalScrollingHelper.restoreScrollPosition(this);

			this._oVSb = this._getScrollExtension().getVerticalScrollbar();
			this._oHSb = this._getScrollExtension().getHorizontalScrollbar();

			// touch target - tableCCnt contains all scrollable regions
			var oDomRef = this.getDomRef("tableCCnt");

			// Process touch actions:
			// IE/Edge and Chrome on desktops and windows tablets - pointer events;
			// other browsers and tablets - touch events.
			if (Device.support.pointer && Device.system.desktop) {
				oDomRef.addEventListener("pointerdown", onTouchStart.bind(this));
				oDomRef.addEventListener("pointermove", onTouchMove.bind(this), Device.browser.chrome ? {passive: true} : false);
			} else if (Device.support.touch) {
				oDomRef.addEventListener("touchstart", onTouchStart.bind(this));
				oDomRef.addEventListener("touchmove", onTouchMove.bind(this));
			}
		},

		onfocusin: function(oEvent) {
			// Many browsers do not scroll the focused element into the viewport if it is partially visible. With this logic we ensure that the
			// focused cell always gets scrolled into the viewport. If the cell is wider than the row container, no action is performed.
			var oRowContainer;
			var oCellInfo = TableUtils.getCellInfo(oEvent.target);
			var iColumnIndex;

			if (oCellInfo === null) {
				return;
			}

			if (oCellInfo.type === TableUtils.CELLTYPES.DATACELL) {
				oRowContainer = this.getDomRef("sapUiTableCtrlScr");
				iColumnIndex = TableUtils.getDataCellInfo(this, oCellInfo.cell).columnIndex;
			} else if (oCellInfo.type === TableUtils.CELLTYPES.COLUMNHEADER) {
				oRowContainer = this.getDomRef("sapUiTableColHdrScr");
				iColumnIndex = TableUtils.getColumnHeaderCellInfo(oCellInfo.cell).index;
			}

			if (oRowContainer != null && iColumnIndex >= this.getFixedColumnCount()) {
				var oCell = oCellInfo.cell[0];
				var iScrollLeft = oRowContainer.scrollLeft;
				var iRowContainerWidth = oRowContainer.clientWidth;
				var iCellLeft = oCell.offsetLeft;
				var iCellRight = iCellLeft + oCell.offsetWidth;
				var iOffsetLeft = iCellLeft - iScrollLeft;
				var iOffsetRight = iCellRight - iRowContainerWidth - iScrollLeft;
				var oHSb = this._getScrollExtension().getHorizontalScrollbar();

				if (iOffsetLeft < 0 && iOffsetRight < 0) {
					oHSb.scrollLeft = iScrollLeft + iOffsetLeft;
				} else if (iOffsetRight > 0 && iOffsetLeft > 0) {
					oHSb.scrollLeft = iScrollLeft + iOffsetRight;
				}
			}
		}
	};

	/**
	 * Extension for sap.ui.table.Table which handles scrolling.
	 *
	 * @class Extension for sap.ui.table.Table which handles scrolling.
	 *
	 * @extends sap.ui.table.TableExtension
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @alias sap.ui.table.TableScrollExtension
	 */
	var TableScrollExtension = TableExtension.extend("sap.ui.table.TableScrollExtension", /* @lends sap.ui.table.TableScrollExtension */ {
		/*
		 * @see sap.ui.table.TableExtension#_init
		 */
		_init: function(oTable, sTableType, mSettings) {
			this._type = sTableType;
			this._delegate = ExtensionDelegate;
			this._iHorizontalScrollPosition = null;
			this._iVerticalScrollPosition = null;
			this._bIsScrolledVerticallyByWheel = false;
			this._bIsScrolledVerticallyByKeyboard = false;

			// Register the delegate.
			oTable.addEventDelegate(this._delegate, oTable);

			return "ScrollExtension";
		},

		/*
		 * @see sap.ui.table.TableExtension#_attachEvents
		 */
		_attachEvents: function() {
			var oTable = this.getTable();

			HorizontalScrollingHelper.addEventListeners(oTable);
			VerticalScrollingHelper.addEventListeners(oTable);

			// Mouse wheel
			oTable._getScrollTargets().on("wheel", ExtensionHelper.onMouseWheelScrolling.bind(oTable));
		},

		/*
		 * @see sap.ui.table.TableExtension#_detachEvents
		 */
		_detachEvents: function() {
			var oTable = this.getTable();

			HorizontalScrollingHelper.removeEventListeners(oTable);
			VerticalScrollingHelper.removeEventListeners(oTable);

			// Mouse wheel
			oTable._getScrollTargets().off("wheel");
		},

		/*
		 * Enables debugging for the extension.
		 */
		_debug: function() {
			this._ExtensionHelper = ExtensionHelper;
			this._ExtensionDelegate = ExtensionDelegate;
			this._HorizontalScrollingHelper = HorizontalScrollingHelper;
			this._VerticalScrollingHelper = VerticalScrollingHelper;
		},

		/*
		 * @see sap.ui.base.Object#destroy
		 */
		destroy: function() {
			// Deregister the delegate.
			var oTable = this.getTable();
			if (oTable) {
				oTable.removeEventDelegate(this._delegate);
			}
			this._delegate = null;

			TableExtension.prototype.destroy.apply(this, arguments);
		},

		// "Public" functions which allow the table to communicate with this extension should go here.

		/**
		 * Scrolls the data in the table forward or backward by setting the property <code>firstVisibleRow</code>.
		 *
		 * @param {boolean} [bDown=false] Whether to scroll down or up.
		 * @param {boolean} [bPage=false] If <code>true</code>, the amount of visible scrollable rows (a page) is scrolled, otherwise a single row is
		 *     scrolled.
		 * @param {boolean} [bIsKeyboardScroll=false] Indicates whether scrolling is initiated by a keyboard action.
		 * @return {boolean} Returns <code>true</code>, if scrolling was actually performed.
		 * @private
		 */
		scroll: function(bDown, bPage, bIsKeyboardScroll) {
			if (bDown == null) {
				bDown = false;
			}
			if (bPage == null) {
				bPage = false;
			}
			if (bIsKeyboardScroll == null) {
				bIsKeyboardScroll = false;
			}

			var oTable = this.getTable();
			var bScrolled = false;
			var iRowCount = oTable._getRowCount();
			var iVisibleRowCount = oTable.getVisibleRowCount();
			var iScrollableRowCount = iVisibleRowCount - oTable.getFixedRowCount() - oTable.getFixedBottomRowCount();
			var iFirstVisibleScrollableRow = oTable._getSanitizedFirstVisibleRow();
			var iSize = bPage ? iScrollableRowCount : 1;

			if (bDown) {
				if (iFirstVisibleScrollableRow + iVisibleRowCount < iRowCount) {
					oTable.setFirstVisibleRow(Math.min(iFirstVisibleScrollableRow + iSize, iRowCount - iVisibleRowCount));
					bScrolled = true;
				}
			} else if (iFirstVisibleScrollableRow > 0) {
				oTable.setFirstVisibleRow(Math.max(iFirstVisibleScrollableRow - iSize, 0));
				bScrolled = true;
			}

			if (bScrolled && bIsKeyboardScroll) {
				this._bIsScrolledVerticallyByKeyboard = true;
			}

			return bScrolled;
		},

		/**
		 * Scrolls the data in the table to the end or to the beginning by setting the property <code>firstVisibleRow</code>.
		 *
		 * @param {boolean} [bDown=false] Whether to scroll down or up.
		 * @param {boolean} [bIsKeyboardScroll=false] Indicates whether scrolling is initiated by a keyboard action.
		 * @returns {boolean} Returns <code>true</code>, if scrolling was actually performed.
		 * @private
		 */
		scrollMax: function(bDown, bIsKeyboardScroll) {
			if (bDown == null) {
				bDown = false;
			}
			if (bIsKeyboardScroll == null) {
				bIsKeyboardScroll = false;
			}

			var oTable = this.getTable();
			var bScrolled = false;
			var iFirstVisibleScrollableRow = oTable._getSanitizedFirstVisibleRow();

			if (bDown) {
				var iFirstVisibleRow = oTable._getRowCount() - TableUtils.getNonEmptyVisibleRowCount(oTable);
				if (iFirstVisibleScrollableRow < iFirstVisibleRow) {
					oTable.setFirstVisibleRow(iFirstVisibleRow);
					bScrolled = true;
				}
			} else if (iFirstVisibleScrollableRow > 0) {
				oTable.setFirstVisibleRow(0);
				bScrolled = true;
			}

			if (bScrolled && bIsKeyboardScroll) {
				this._bIsScrolledVerticallyByKeyboard = true;
			}

			return bScrolled;
		},

		/**
		 * Returns the horizontal scrollbar.
		 *
		 * @returns {HTMLElement|null} Returns <code>null</code>, if the horizontal scrollbar does not exist.
		 * @private
		 */
		getHorizontalScrollbar: function() {
			var oTable = this.getTable();

			if (oTable != null) {
				var oVSb = oTable.getDomRef(SharedDomRef.HorizontalScrollBar);

				if (oVSb != null) {
					return oVSb;
				}
			}

			return null;
		},

		/**
		 * Returns the vertical scrollbar.
		 *
		 * @returns {HTMLElement|null} Returns <code>null</code>, if the vertical scrollbar does not exist.
		 * @private
		 */
		getVerticalScrollbar: function() {
			var oTable = this.getTable();

			if (oTable != null) {
				var oVSb = oTable.getDomRef(SharedDomRef.VerticalScrollBar);

				if (oVSb != null) {
					return oVSb;
				}
			}

			return null;
		},

		/**
		 * Checks whether the horizontal scrollbar is visible.
		 *
		 * @returns {boolean} Returns <code>true</code>, if the horizontal scrollbar is visible.
		 * @private
		 */
		isHorizontalScrollbarVisible: function() {
			var oTable = this.getTable();

			if (oTable != null) {
				var oTableElement = oTable.getDomRef();

				if (oTableElement != null) {
					return oTableElement.classList.contains("sapUiTableHScr");
				}
			}

			return false;
		},

		/**
		 * Checks whether the vertical scrollbar is visible.
		 *
		 * @returns {boolean} Returns <code>true</code>, if the vertical scrollbar is visible.
		 * @private
		 */
		isVerticalScrollbarVisible: function() {
			var oTable = this.getTable();

			if (oTable != null) {
				var oTableElement = oTable.getDomRef();

				if (oTableElement != null) {
					return oTableElement.classList.contains("sapUiTableVScr");
				}
			}

			return false;
		},

		/**
		 * Update the height of the vertical scrollbar by setting its <code>max-height</code> value.
		 *
		 * @private
		 *
		 * @see sap.ui.table.Table#_getVSbHeight
		 */
		updateVerticalScrollbarHeight: function() {
			var oTable = this.getTable();
			oTable.getDomRef(SharedDomRef.VerticalScrollBar).style.maxHeight = oTable._getVSbHeight() + "px";
		}
	});

	return TableScrollExtension;

}, /* bExport= */ true);