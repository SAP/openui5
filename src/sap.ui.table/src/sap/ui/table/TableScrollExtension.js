/*!
 * ${copyright}
 */

// Provides helper sap.ui.table.TableScrollExtension.
sap.ui.define([
	"jquery.sap.global", "./TableExtension", "./TableUtils", "sap/ui/Device", "./library", "jquery.sap.trace", "jquery.sap.events"
], function(jQuery, TableExtension, TableUtils, Device, library) {
	"use strict";

	// Shortcuts
	var SharedDomRef = library.SharedDomRef;

	// Constants
	var MAX_VERTICAL_SCROLL_HEIGHT = 1000000; // maximum px height of a DOM element in FF/IE/Chrome

	/**
	 * Provides almost the full functionality which is required for the horizontal scrolling within the table.
	 * Find the remaining functionality in the <code>ScrollingHelper</code> and the <code>ExtensionDelegate</code>.
	 *
	 * @see ScrollingHelper#onMouseWheelScrolling
	 * @see ExtensionDelegate#onAfterRendering
	 * @private
	 */
	var HorizontalScrollingHelper = {
		/**
		 * Will be called if scrolled horizontally. Because the table does not render/update the data of all columns (only the visible ones),
		 * we need to update the content of the columns which became visible.
		 *
		 * @param {jQuery.Event} oEvent The event object.
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
				var aScrollAreas = HorizontalScrollingHelper.getScrollAreas(this);

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
		 * @see HorizontalScrollingHelper#onScroll
		 */
		restoreScrollPosition: function(oTable) {
			var oScrollExtension = oTable._getScrollExtension();
			var oHSb = oScrollExtension.getHorizontalScrollbar();

			if (oHSb !== null && oScrollExtension._iHorizontalScrollPosition !== null) {
				var aScrollTargets = HorizontalScrollingHelper.getScrollAreas(oTable);

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
			var aScrollAreas = HorizontalScrollingHelper.getScrollAreas(oTable);

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
			var aScrollAreas = HorizontalScrollingHelper.getScrollAreas(oTable);

			if (oScrollExtension._onHorizontalScrollEventHandler != null) {
				for (var i = 0; i < aScrollAreas.length; i++) {
					aScrollAreas[i].removeEventListener("scroll", oScrollExtension._onHorizontalScrollEventHandler);
					delete aScrollAreas[i]._scrollLeft;
				}
				delete oScrollExtension._onHorizontalScrollEventHandler;
			}
		},

		/**
		 * Gets the areas of the table which can be scrolled horizontally.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @returns {HTMLElement[]} Returns only elements which exist in the DOM.
		 * @private
		 */
		getScrollAreas: function(oTable) {
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
	 * Find the remaining functionality in the <code>ScrollingHelper</code> and the <code>ExtensionDelegate</code>.
	 *
	 * @see ScrollingHelper#onMouseWheelScrolling
	 * @see ExtensionDelegate#onAfterRendering
	 * @private
	 */
	var VerticalScrollingHelper = {
		/**
		 * Will be called if scrolled vertically. Updates the visualized data by applying the first visible row from the vertical scrollbar.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 */
		onScroll: function(oEvent) {
			var oScrollExtension = this._getScrollExtension();

			// For interaction detection.
			jQuery.sap.interaction.notifyScrollEvent && jQuery.sap.interaction.notifyScrollEvent(oEvent);

			if (oScrollExtension._bIsScrolledVerticallyByKeyboard) {
				return;
			}

			// Do not scroll in action mode, if scrolling was not initiated by a keyboard action!
			// Might cause loss of user input and other undesired behavior.
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

				var iNewFirstVisibleRowIndex = oScrollExtension.getRowIndexAtScrollPosition(iScrollTop);
				var iOldFirstVisibleRowIndex = oTable.getFirstVisibleRow();
				var bFirstVisibleRowChanged = iNewFirstVisibleRowIndex !== iOldFirstVisibleRowIndex;

				if (bFirstVisibleRowChanged) {
					oTable.setFirstVisibleRow(iNewFirstVisibleRowIndex, true);

					if (TableUtils.isVariableRowHeightEnabled(oTable)) {
						oTable.attachEventOnce("_rowsUpdated", function() {
							oScrollExtension.updateInnerVerticalScrollPosition(this._aRowHeights);
						});
					}

				} else if (TableUtils.isVariableRowHeightEnabled(oTable)) {
					oScrollExtension.updateInnerVerticalScrollPosition(oTable._aRowHeights);
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
		 * Will be called if the vertical scrollbar is clicked.
		 * Resets the vertical scroll flags.
		 *
		 * @param {jQuery.Event} oEvent The mouse event object.
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
		 * @see VerticalScrollingHelper#onScroll
		 * @see sap.ui.table.Table#updateVerticalScrollPosition
		 */
		restoreScrollPosition: function(oTable) {
			var oScrollExtension = oTable._getScrollExtension();

			if (oScrollExtension._iVerticalScrollPosition !== null) {
				oScrollExtension.updateVerticalScrollPosition(oScrollExtension._iVerticalScrollPosition);
			} else {
				oScrollExtension.updateVerticalScrollPosition();
			}
		},

		/**
		 * Adds the event listeners which are required for the vertical scrolling.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 */
		addEventListeners: function(oTable) {
			var oScrollExtension = oTable._getScrollExtension();
			var aScrollAreas = VerticalScrollingHelper.getScrollAreas(oTable);
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
			var aScrollAreas = VerticalScrollingHelper.getScrollAreas(oTable);
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
		 * Gets the areas of the table which can be scrolled vertically.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @returns {HTMLElement[]} Returns only elements which exist in the DOM.
		 * @private
		 */
		getScrollAreas: function(oTable) {
			var aScrollAreas = [
				oTable._getScrollExtension().getVerticalScrollbar()
			];

			return aScrollAreas.filter(function(oScrollArea) {
				return oScrollArea != null;
			});
		}
	};

	/**
	 * Provides mouse wheel and touch event handlers for scrolling.
	 *
	 * @private
	 */
	var ScrollingHelper = {
		/**
		 * Handles mouse wheel events.
		 *
		 * @param {WheelEvent} oEvent The wheel event object.
		 */
		onMouseWheelScrolling: function(oEvent) {
			var oScrollExtension = this._getScrollExtension();
			var bVerticalDelta = Math.abs(oEvent.deltaY) > Math.abs(oEvent.deltaX);
			var iScrollDelta = bVerticalDelta ? oEvent.deltaY : oEvent.deltaX;
			var bHorizontalScrolling = bVerticalDelta && oEvent.shiftKey || !bVerticalDelta;
			var bScrollingForward = iScrollDelta > 0;
			var bScrolledToEnd = false;

			if (iScrollDelta === 0) {
				return;
			}

			if (bHorizontalScrolling) {
				var oHSb = oScrollExtension.getHorizontalScrollbar();

				if (oEvent.deltaMode > 0 /* Not DOM_DELTA_PIXEL */) {
					// For simplicity and performance reasons horizontal line and page scrolling is always performed by the distance of one minimum
					// column width. To determine the real scroll distance reading from the DOM is necessary, but this should be avoided in an
					// event handler.
					var iMinColumnWidth = TableUtils.Column.getMinColumnWidth();
					iScrollDelta = bScrollingForward ? iMinColumnWidth : -iMinColumnWidth;
				}

				if (bScrollingForward) {
					bScrolledToEnd = oHSb.scrollLeft === oHSb.scrollWidth - oHSb.offsetWidth;
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

				if (oEvent.deltaMode === 1 /* DOM_DELTA_LINE */) {
					iScrollDelta *= oScrollExtension.getVerticalScrollRangeRowFraction();
				} else if (oEvent.deltaMode === 2 /* DOM_DELTA_PAGE */) {
					iScrollDelta *= oScrollExtension.getVerticalScrollRangeRowFraction() * this.getVisibleRowCount();
				}

				if (bScrollingForward) {
					bScrolledToEnd = oVSb.scrollTop === oVSb.scrollHeight - oVSb.offsetWidth;
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
					oVSb.scrollTop += iRowsPerStep * oScrollExtension.getVerticalScrollRangeRowFraction();
				}
			}
		},

		/**
		 * Handles touch start events.
		 *
		 * @param {jQuery.Event} oEvent The touch or pointer event object.
		 */
		onTouchStart: function(oEvent) {
			if (oEvent.type === "touchstart" || oEvent.pointerType === "touch") {
				var oScrollExtension = this._getScrollExtension();
				var oHSb = oScrollExtension.getHorizontalScrollbar();
				var oVSb = oScrollExtension.getVerticalScrollbar();
				var oTouchObject = oEvent.touches ? oEvent.touches[0] : oEvent;

				oScrollExtension._mTouchSessionData = {
					initialPageX: oTouchObject.pageX,
					initialPageY: oTouchObject.pageY,
					initialScrollTop: oVSb == null ? 0 : oVSb.scrollTop,
					initialScrollLeft: oHSb == null ? 0 : oHSb.scrollLeft,
					initialScrolledToEnd: null,
					touchMoveDirection: null
				};
			}
		},

		/**
		 * Handles touch move events.
		 *
		 * @param {jQuery.Event} oEvent The touch or pointer event object.
		 */
		onTouchMoveScrolling: function(oEvent) {
			if (oEvent.type === "touchmove" || oEvent.pointerType === "touch") {
				var oScrollExtension = this._getScrollExtension();
				var mTouchSessionData = oScrollExtension._mTouchSessionData;

				if (mTouchSessionData == null) {
					return;
				}

				var oTouchObject = oEvent.touches ? oEvent.touches[0] : oEvent;
				var iTouchDistanceX = (oTouchObject.pageX - mTouchSessionData.initialPageX);
				var iTouchDistanceY = (oTouchObject.pageY - mTouchSessionData.initialPageY);
				var bScrolledToEnd = false;
				var bScrollingPerformed = false;

				if (mTouchSessionData.touchMoveDirection === null) {
					if (iTouchDistanceX === 0 && iTouchDistanceY === 0) {
						return;
					}
					mTouchSessionData.touchMoveDirection = Math.abs(iTouchDistanceX) > Math.abs(iTouchDistanceY) ? "horizontal" : "vertical";
				}

				switch (mTouchSessionData.touchMoveDirection) {
					case "horizontal":
						var oHSb = oScrollExtension.getHorizontalScrollbar();

						if (oHSb != null) {
							if (iTouchDistanceX < 0) { // Scrolling to the right.
								bScrolledToEnd = oHSb.scrollLeft === oHSb.scrollWidth - oHSb.offsetWidth;
							} else { // Scrolling to the left.
								bScrolledToEnd = oHSb.scrollLeft === 0;
							}

							if (mTouchSessionData.initialScrolledToEnd === null) {
								mTouchSessionData.initialScrolledToEnd = bScrolledToEnd;
							}

							if (!bScrolledToEnd && !mTouchSessionData.initialScrolledToEnd) {
								oHSb.scrollLeft = mTouchSessionData.initialScrollLeft - iTouchDistanceX;
								bScrollingPerformed = true;
							}
						}
						break;

					case "vertical":
						var oVSb = oScrollExtension.getVerticalScrollbar();

						if (oVSb != null) {
							if (iTouchDistanceY < 0) { // Scrolling down.
								bScrolledToEnd = oVSb.scrollTop === oVSb.scrollHeight - oVSb.offsetHeight;
							} else { // Scrolling up.
								bScrolledToEnd = oVSb.scrollTop === 0;
							}

							if (mTouchSessionData.initialScrolledToEnd === null) {
								mTouchSessionData.initialScrolledToEnd = bScrolledToEnd;
							}

							if (!bScrolledToEnd && !mTouchSessionData.initialScrolledToEnd) {
								oVSb.scrollTop = mTouchSessionData.initialScrollTop - iTouchDistanceY;
								bScrollingPerformed = true;
							}
						}
						break;
					default:
				}

				if (bScrollingPerformed) {
					oEvent.preventDefault();
				}
			}
		},

		/**
		 * Adds mouse wheel and touch event listeners.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 */
		addEventListeners: function(oTable) {
			var oScrollExtension = oTable._getScrollExtension();
			var aEventListenerTargets = ScrollingHelper.getEventListenerTargets(oTable);

			if (oScrollExtension._onMouseWheelEventHandler == null) {
				oScrollExtension._onMouseWheelEventHandler = ScrollingHelper.onMouseWheelScrolling.bind(oTable);
			}
			if (oScrollExtension._onTouchStartEventHandler == null) {
				oScrollExtension._onTouchStartEventHandler = ScrollingHelper.onTouchStart.bind(oTable);
			}
			if (oScrollExtension._onTouchMoveEventHandler == null) {
				oScrollExtension._onTouchMoveEventHandler = ScrollingHelper.onTouchMoveScrolling.bind(oTable);
			}

			for (var i = 0; i < aEventListenerTargets.length; i++) {
				aEventListenerTargets[i].addEventListener("wheel", oScrollExtension._onMouseWheelEventHandler);

				/* Touch events */
				// IE/Edge and Chrome on desktops and windows tablets - pointer events;
				// other browsers and tablets - touch events.
				if (Device.support.pointer && Device.system.desktop) {
					aEventListenerTargets[i].addEventListener("pointerdown", oScrollExtension._onTouchStartEventHandler);
					aEventListenerTargets[i].addEventListener("pointermove", oScrollExtension._onTouchMoveEventHandler,
						Device.browser.chrome ? {passive: true} : false);
				} else if (Device.support.touch) {
					aEventListenerTargets[i].addEventListener("touchstart", oScrollExtension._onTouchStartEventHandler);
					aEventListenerTargets[i].addEventListener("touchmove", oScrollExtension._onTouchMoveEventHandler);
				}
			}
		},

		/**
		 * Removes mouse wheel and touch event listeners.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 */
		removeEventListeners: function(oTable) {
			var oScrollExtension = oTable._getScrollExtension();
			var aEventTargets = ScrollingHelper.getEventListenerTargets(oTable);

			for (var i = 0; i < aEventTargets.length; i++) {
				if (oScrollExtension._onMouseWheelEventHandler != null) {
					aEventTargets[i].removeEventListener("wheel", oScrollExtension._onMouseWheelEventHandler);
				}

				if (oScrollExtension._onTouchStartEventHandler != null && oScrollExtension._onTouchMoveEventHandler != null) {
					/* Touch events */
					if (Device.support.pointer && Device.system.desktop) {
						aEventTargets[i].removeEventListener("pointerdown", oScrollExtension._onTouchStartEventHandler);
						aEventTargets[i].removeEventListener("pointermove", oScrollExtension._onTouchMoveEventHandler,
							Device.browser.chrome ? {passive: true} : false);
					} else if (Device.support.touch) {
						aEventTargets[i].removeEventListener("touchstart", oScrollExtension._onTouchStartEventHandler);
						aEventTargets[i].removeEventListener("touchmove", oScrollExtension._onTouchMoveEventHandler);
					}
				}
			}

			delete oScrollExtension._onMouseWheelEventHandler;
			delete oScrollExtension._onTouchStartEventHandler;
			delete oScrollExtension._onTouchMoveEventHandler;
		},

		/**
		 * Gets the DOM elements on which mouse wheel or touch events should scroll the table.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @returns {HTMLElement[]} The DOM elements relevant for mouse wheel and touch scrolling.
		 * @private
		 */
		getEventListenerTargets: function(oTable) {
			var aEventListenerTargets = [
				// Safari does not support touch-action:none and touch-action:pan-x/y. That means, the user can scroll by touch actions anywhere
				// in the body of the table.
				oTable.getDomRef("tableCCnt")
			];

			return aEventListenerTargets.filter(function(oEventListenerTarget) {
				return oEventListenerTarget != null;
			});
		}
	};

	var ExtensionDelegate = {
		onBeforeRendering: function(oEvent) {
			this._getScrollExtension()._clearCache();
		},

		onAfterRendering: function(oEvent) {
			VerticalScrollingHelper.restoreScrollPosition(this);
			HorizontalScrollingHelper.restoreScrollPosition(this);
		},

		onfocusin: function(oEvent) {
			// Many browsers do not scroll the focused element into the viewport if it is partially visible. With this logic we ensure that the
			// focused cell always gets scrolled into the viewport. If the cell is wider than the row container, no action is performed.
			var oRowContainer;
			var oCellInfo = TableUtils.getCellInfo(oEvent.target);

			if (oCellInfo.isOfType(TableUtils.CELLTYPE.DATACELL)) {
				oRowContainer = this.getDomRef("sapUiTableCtrlScr");
			} else if (oCellInfo.isOfType(TableUtils.CELLTYPE.COLUMNHEADER)) {
				oRowContainer = this.getDomRef("sapUiTableColHdrScr");
			}

			if (oRowContainer != null && oCellInfo.columnIndex >= this.getFixedColumnCount()) {
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

			// On focus, the browsers scroll elements which are not visible into the viewport (IE also scrolls if elements are partially visible).
			// This causes scrolling inside table cells, which is not desired.
			// Flickering of the cell content cannot be avoided, as the browser performs scrolling after the event. This behavior cannot be
			// prevented, only reverted.
			var $ParentCell = TableUtils.getParentCell(this, oEvent.target);

			if ($ParentCell != null) {
				Promise.resolve().then(function() {
					var oInnerCellElement = $ParentCell.find(".sapUiTableCell")[0];

					if (oInnerCellElement != null) {
						oInnerCellElement.scrollLeft = 0;
						oInnerCellElement.scrollTop = 0;
					}
				});
			}
		}
	};

	/**
	 * Extension for sap.ui.table.Table which handles scrolling.
	 * <b>This is an internal class that is only intended to be used inside the sap.ui.table library! Any usage outside the sap.ui.table library
	 * is strictly prohibited!</b>
	 *
	 * @class Extension for sap.ui.table.Table which handles scrolling.
	 * @extends sap.ui.table.TableExtension
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @alias sap.ui.table.TableScrollExtension
	 */
	var TableScrollExtension = TableExtension.extend("sap.ui.table.TableScrollExtension", /** @lends sap.ui.table.TableScrollExtension.prototype */ {
		/**
		 * @override
		 * @inheritDoc
		 * @returns {string} The name of this extension.
		 */
		_init: function(oTable, sTableType, mSettings) {
			this._delegate = ExtensionDelegate;
			this._oVerticalScrollbar = null;
			this._oHorizontalScrollbar = null;
			this._iHorizontalScrollPosition = null;
			this._iVerticalScrollPosition = null;
			this._iInnerVerticalScrollRange = 0;
			this._bIsScrolledVerticallyByWheel = false;
			this._bIsScrolledVerticallyByKeyboard = false;
			this._mTouchSessionData = null;

			oTable.addEventDelegate(this._delegate, oTable);

			return "ScrollExtension";
		},

		/**
		 * @override
		 * @inheritDoc
		 */
		_attachEvents: function() {
			var oTable = this.getTable();

			HorizontalScrollingHelper.addEventListeners(oTable);
			VerticalScrollingHelper.addEventListeners(oTable);
			ScrollingHelper.addEventListeners(oTable);
		},

		/**
		 * @override
		 * @inheritDoc
		 */
		_detachEvents: function() {
			var oTable = this.getTable();

			HorizontalScrollingHelper.removeEventListeners(oTable);
			VerticalScrollingHelper.removeEventListeners(oTable);
			ScrollingHelper.removeEventListeners(oTable);
		},

		/**
		 * Enables debugging for the extension. Internal helper classes become accessible.
		 *
		 * @private
		 */
		_debug: function() {
			this._ScrollingHelper = ScrollingHelper;
			this._ExtensionDelegate = ExtensionDelegate;
			this._HorizontalScrollingHelper = HorizontalScrollingHelper;
			this._VerticalScrollingHelper = VerticalScrollingHelper;
		},

		/**
		 * @override
		 * @inheritDoc
		 */
		destroy: function() {
			var oTable = this.getTable();

			if (oTable != null) {
				oTable.removeEventDelegate(this._delegate);
			}
			this._delegate = null;
			this._clearCache();

			TableExtension.prototype.destroy.apply(this, arguments);
		}
	});

	/**
	 * Scrolls the table vertically by setting the property <code>firstVisibleRow</code>.
	 *
	 * @param {boolean} [bDown=false] If <code>true</code>, the table will be scrolled down, otherwise it is scrolled up.
	 * @param {boolean} [bPage=false] If <code>true</code>, the amount of visible scrollable rows (a page) is scrolled,
	 *                                otherwise a single row is scrolled.
	 * @param {boolean} [bIsKeyboardScroll=false] Indicates whether scrolling is initiated by a keyboard action.
	 * @returns {boolean} Returns <code>true</code>, if scrolling was actually performed.
	 */
	TableScrollExtension.prototype.scrollVertically = function(bDown, bPage, bIsKeyboardScroll) {
		var oTable = this.getTable();

		if (oTable == null) {
			return false;
		}

		if (bDown == null) {
			bDown = false;
		}
		if (bPage == null) {
			bPage = false;
		}
		if (bIsKeyboardScroll == null) {
			bIsKeyboardScroll = false;
		}

		var bScrolled = false;
		var iRowCount = oTable._getTotalRowCount();
		var iVisibleRowCount = oTable.getVisibleRowCount();
		var iScrollableRowCount = iVisibleRowCount - oTable.getFixedRowCount() - oTable.getFixedBottomRowCount();
		var iFirstVisibleScrollableRow = oTable.getFirstVisibleRow();
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
	};

	/**
	 * Scrolls the table vertically to the end or to the beginning by setting the property <code>firstVisibleRow</code>.
	 *
	 * @param {boolean} [bDown=false] If <code>true</code>, the table will be scrolled down, otherwise it is scrolled up.
	 * @param {boolean} [bIsKeyboardScroll=false] Indicates whether scrolling is initiated by a keyboard action.
	 * @returns {boolean} Returns <code>true</code>, if scrolling was actually performed.
	 */
	TableScrollExtension.prototype.scrollVerticallyMax = function(bDown, bIsKeyboardScroll) {
		var oTable = this.getTable();

		if (oTable == null) {
			return false;
		}

		if (bDown == null) {
			bDown = false;
		}
		if (bIsKeyboardScroll == null) {
			bIsKeyboardScroll = false;
		}

		var bScrolled = false;
		var iFirstVisibleScrollableRow = oTable.getFirstVisibleRow();

		if (bDown) {
			var iFirstVisibleRow = oTable._getTotalRowCount() - TableUtils.getNonEmptyVisibleRowCount(oTable);
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
	};

	/**
	 * Gets DOM reference of the horizontal scrollbar.
	 *
	 * @returns {HTMLElement|null} Returns <code>null</code>, if the horizontal scrollbar does not exist.
	 */
	TableScrollExtension.prototype.getHorizontalScrollbar = function() {
		var oTable = this.getTable();

		if (oTable != null && this._oHorizontalScrollbar === null) {
			// Table#getDomRef (document#getElementById) returns null if the element does not exist in the DOM.
			this._oHorizontalScrollbar = oTable.getDomRef(SharedDomRef.HorizontalScrollBar);
		}

		return this._oHorizontalScrollbar;
	};

	/**
	 * Gets DOM reference of the vertical scrollbar.
	 *
	 * @returns {HTMLElement|null} Returns <code>null</code>, if the vertical scrollbar does not exist.
	 */
	TableScrollExtension.prototype.getVerticalScrollbar = function() {
		var oTable = this.getTable();

		if (oTable != null && this._oVerticalScrollbar === null) {
			// Table#getDomRef (document#getElementById) returns null if the element does not exist in the DOM.
			this._oVerticalScrollbar = oTable.getDomRef(SharedDomRef.VerticalScrollBar);
		}

		return this._oVerticalScrollbar;
	};

	/**
	 * Checks whether the horizontal scrollbar is visible.
	 *
	 * @returns {boolean} Returns <code>true</code>, if the horizontal scrollbar is visible.
	 */
	TableScrollExtension.prototype.isHorizontalScrollbarVisible = function() {
		var oTable = this.getTable();
		var oTableElement = oTable == null ? null : oTable.getDomRef();

		if (oTableElement == null) {
			return false;
		}

		return oTableElement.classList.contains("sapUiTableHScr");
	};

	/**
	 * Checks whether the vertical scrollbar is visible.
	 *
	 * @returns {boolean} Returns <code>true</code>, if the vertical scrollbar is visible.
	 */
	TableScrollExtension.prototype.isVerticalScrollbarVisible = function() {
		var oTable = this.getTable();
		var oTableElement = oTable == null ? null : oTable.getDomRef();

		if (oTableElement == null) {
			return false;
		}

		return oTableElement.classList.contains("sapUiTableVScr");
	};

	/**
	 * Updates the visibility, position and range of the horizontal scrollbar.
	 *
	 * @param {Object} oTableSizes The object containing the table sizes.
	 */
	TableScrollExtension.prototype.updateHorizontalScrollbar = function(oTableSizes) {
		var oTable = this.getTable();
		var oHSb = this.getHorizontalScrollbar();

		if (oTable == null || oHSb == null || oTableSizes == null) {
			return;
		}

		// get the width of the container
		var $Table = oTable.$();
		var iColsWidth = oTableSizes.tableCtrlScrollWidth;
		if (Device.browser.safari) {
			iColsWidth = Math.max(iColsWidth, oTable._getColumnsWidth(oTable.getFixedColumnCount()));
		}

		var bHorizontalScrollbarRequired = iColsWidth > oTableSizes.tableCtrlScrWidth;

		if (bHorizontalScrollbarRequired) {
			// Show the horizontal scrollbar, if it is not already visible.
			if (!this.isHorizontalScrollbarVisible()) {
				$Table.addClass("sapUiTableHScr");

				if (Device.browser.safari) {
					var $sapUiTableColHdr = $Table.find(".sapUiTableCtrlScroll, .sapUiTableColHdrScr > .sapUiTableColHdr");
					// min-width on table elements does not work for safari
					$sapUiTableColHdr.outerWidth(iColsWidth);
				}
			}

			var iScrollPadding = oTableSizes.tableCtrlFixedWidth;
			if ($Table.find(".sapUiTableRowHdrScr").length > 0) {
				iScrollPadding += oTableSizes.tableRowHdrScrWidth;
			}

			if (oTable.getRows().length > 0) {
				if (oTable._bRtlMode) {
					oHSb.style.marginRight = iScrollPadding + "px";
					oHSb.style.marginLeft = "";
				} else {
					oHSb.style.marginLeft = iScrollPadding + "px";
					oHSb.style.marginRight = "";
				}
			}

			var oHSbContent = oTable.getDomRef("hsb-content");
			if (oHSbContent) {
				oHSbContent.style.width = iColsWidth + "px";
			}
		}

		if (!bHorizontalScrollbarRequired && this.isHorizontalScrollbarVisible()) {
			// Hide the horizontal scrollbar, if it is visible.
			$Table.removeClass("sapUiTableHScr");
			if (Device.browser.safari) {
				// min-width on table elements does not work for safari
				$Table.find(".sapUiTableCtrlScroll, .sapUiTableColHdr").css("width", "");
			}
		}
	};

	/**
	 * Updates the height of the vertical scrollbar.
	 *
	 * @see TableScrollExtension#getVerticalScrollbarHeight
	 */
	TableScrollExtension.prototype.updateVerticalScrollbarHeight = function() {
		var oTable = this.getTable();
		var oVSb = this.getVerticalScrollbar();

		if (oTable == null || oVSb == null) {
			return;
		}

		oVSb.style.maxHeight = this.getVerticalScrollbarHeight() + "px";
	};

	/**
	 * Gets the height of the vertical scrollbar.
	 *
	 * @returns {int} The height of the scrollbar.
	 */
	TableScrollExtension.prototype.getVerticalScrollbarHeight = function() {
		var oTable = this.getTable();

		if (oTable == null) {
			return 0;
		}

		return oTable._getScrollableRowCount() * oTable._getDefaultRowHeight();
	};

	/**
	 * Updates the position of the vertical scrollbar.
	 */
	TableScrollExtension.prototype.updateVerticalScrollbarPosition = function() {
		var oTable = this.getTable();
		var oVSb = this.getVerticalScrollbar();

		if (oTable == null || oVSb == null) {
			return;
		}

		var oTableCCnt = oTable.getDomRef("tableCCnt");
		if (oTableCCnt) {
			var iTop = oTableCCnt.offsetTop;
			var oVSbBg = oTable.getDomRef("vsb-bg");
			oVSbBg.style.top = iTop + "px";

			var iFixedRows = oTable.getFixedRowCount();
			if (iFixedRows > 0) {
				iTop += oTable._iVsbTop;
			}
			oVSb.style.top = iTop + "px";
		}
	};

	/**
	 * Updates the vertical scroll position.
	 *
	 * @param {int} [iScrollTop=undefined] The new vertical scroll position. If <code>undefined</code>, the new scroll position will be calculated
	 *                                     based on the first visible row.
	 */
	TableScrollExtension.prototype.updateVerticalScrollPosition = function(iScrollTop) {
		var oTable = this.getTable();
		var oVSb = this.getVerticalScrollbar();

		if (oTable == null || oVSb == null || !this.isVerticalScrollbarRequired()) {
			return;
		}

		if (iScrollTop == null) {
			iScrollTop = Math.ceil(oTable.getFirstVisibleRow() * this.getVerticalScrollRangeRowFraction());
		}

		this._iVerticalScrollPosition = null;

		window.requestAnimationFrame(function() {
			oVSb.scrollTop = iScrollTop;
		});
	};

	/**
	 * Updates the vertical scroll height. This is the content height of the vertical scrollbar.
	 *
	 * @see TableScrollExtension#getVerticalScrollHeight
	 */
	TableScrollExtension.prototype.updateVerticalScrollHeight = function() {
		var oTable = this.getTable();
		var oVSbContent = oTable == null ? null : oTable.getDomRef("vsb-content");

		if (oVSbContent == null) {
			return;
		}

		oVSbContent.style.height = this.getVerticalScrollHeight() + "px";
	};

	/**
	 * Gets the vertical scroll height.
	 *
	 * @returns {int} The vertical scroll height.
	 */
	TableScrollExtension.prototype.getVerticalScrollHeight = function() {
		var oTable = this.getTable();

		if (oTable == null) {
			return 0;
		}

		var iVisibleRowCount = oTable.getVisibleRowCount();

		if (TableUtils.isVariableRowHeightEnabled(oTable)) {
			iVisibleRowCount++;
		}

		var iRowCount = Math.max(oTable._getTotalRowCount(), iVisibleRowCount);
		var iScrollRange = oTable._getDefaultRowHeight() * iRowCount;
		return Math.min(MAX_VERTICAL_SCROLL_HEIGHT, iScrollRange);
	};

	/**
	 * Updates the visibility of the vertical scrollbar.
	 */
	TableScrollExtension.prototype.updateVerticalScrollbarVisibility = function() {
		var oTable = this.getTable();
		var oTableElement = oTable == null ? null : oTable.getDomRef();
		var oVSb = this.getVerticalScrollbar();

		if (oTableElement == null || oVSb == null) {
			return;
		}

		var bVerticalScrollbarRequired = this.isVerticalScrollbarRequired();

		if (bVerticalScrollbarRequired && !this.isVerticalScrollbarVisible()) {
			oTableElement.classList.add("sapUiTableVScr");
			this.updateVerticalScrollPosition(0);
		}

		if (!bVerticalScrollbarRequired && this.isVerticalScrollbarVisible()) {
			oTableElement.classList.remove("sapUiTableVScr");
		}
	};

	/**
	 * Checks whether the vertical scrollbar is required.
	 *
	 * @returns {boolean} Returns <code>true</code>, if the vertical scrollbar is required.
	 */
	TableScrollExtension.prototype.isVerticalScrollbarRequired = function() {
		var oTable = this.getTable();

		if (oTable == null) {
			return false;
		}

		return this._iInnerVerticalScrollRange > 0 || (oTable._getTotalRowCount() > oTable.getVisibleRowCount());
	};

	/**
	 * Gets the index of the row at a particular scroll position.
	 *
	 * @param {int} iScrollPosition The scroll position.
	 * @returns {int} The index of the row, or <code>-1</code> if the index could not be determined.
	 */
	TableScrollExtension.prototype.getRowIndexAtScrollPosition = function(iScrollPosition) {
		var oTable = this.getTable();

		if (oTable == null) {
			return -1;
		}

		var iMaxRowIndex = oTable._getMaxRowIndex();

		if (iMaxRowIndex === 0) {
			return 0;
		} else {
			var iRowIndex = Math.floor(iScrollPosition / this.getVerticalScrollRangeRowFraction());
			var nDistanceToMaximumScrollPosition = this.getVerticalScrollRange() - iScrollPosition;

			// Calculation of the row index can be inaccurate if scrolled to the end. This can happen due to rounding errors in case of
			// large data or when zoomed in Chrome. In this case it can not be scrolled to the last row. To overcome this issue we consider the table
			// to be scrolled to the end, if the scroll position is less than 1 pixel away from the maximum.
			var bScrolledToBottom = nDistanceToMaximumScrollPosition < 1;

			return bScrolledToBottom ? iMaxRowIndex : Math.min(iMaxRowIndex, iRowIndex);
		}
	};

	/**
	 * Gets the vertical scroll range.
	 *
	 * @returns {int} The vertical scroll range.
	 */
	TableScrollExtension.prototype.getVerticalScrollRange = function() {
		var oTable = this.getTable();

		if (oTable == null) {
			return 0;
		}

		var iVerticalScrollRange = this.getVerticalScrollHeight() - this.getVerticalScrollbarHeight();

		if (TableUtils.isVariableRowHeightEnabled(oTable)) {
			iVerticalScrollRange = iVerticalScrollRange - this._iInnerVerticalScrollRange;
		}

		return Math.max(1, iVerticalScrollRange);
	};

	/**
	 * Gets the fraction of the vertical scroll range which corresponds to a row. This value specifies how many pixels must be scrolled to
	 * scroll one row.
	 *
	 * @returns {int} The fraction of the vertical scroll range which corresponds to a row.
	 */
	TableScrollExtension.prototype.getVerticalScrollRangeRowFraction = function() {
		var oTable = this.getTable();

		if (oTable == null) {
			return 0;
		}

		return Math.max(1, this.getVerticalScrollRange()) / Math.max(1, oTable._getMaxRowIndex());
	};

	/**
	 * Gets the amount of pixels which are used for the correction of the row heights delta.
	 *
	 * @returns {int} The amount in pixels.
	 */
	TableScrollExtension.prototype.getVerticalScrollRangeDelta = function() {
		var oTable = this.getTable();

		if (oTable == null) {
			return 0;
		}

		var iVerticalScrollRange = this.getVerticalScrollHeight() - this.getVerticalScrollbarHeight();

		if (oTable._getTotalRowCount() > oTable.getVisibleRowCount()) {
			iVerticalScrollRange -= this.getVerticalScrollRange();
		}

		return Math.max(0, iVerticalScrollRange);
	};

	/**
	 * Updates the vertical scroll position of the content rows in their container according to the delta of the estimated row heights to actual row
	 * heights. The table simulates the pixel-based scrolling by adjusting the vertical scroll position of the inner scrolling areas.
	 * Additionally, if there are rows which have a larger height than estimated, this will also be corrected and leads to a bigger vertical shift.
	 *
	 * @param {int[]} aRowHeights The heights of the currently visible rows.
	 */
	TableScrollExtension.prototype.updateInnerVerticalScrollPosition = function(aRowHeights) {
		var oTable = this.getTable();

		if (oTable == null) {
			return;
		}

		var iScrollTop = this._iVerticalScrollPosition == null ? 0 : this._iVerticalScrollPosition;
		var bScrollPositionAtVirtualRange = iScrollTop < this.getVerticalScrollRange();
		var bVirtualScrollingNeeded = oTable._getTotalRowCount() > oTable.getVisibleRowCount();

		// Only update table scroll simulation if table is not waiting for an update of rows.
		if (bScrollPositionAtVirtualRange && oTable.getFirstVisibleRow() != oTable._iRenderedFirstVisibleRow) {
			return;
		}

		var iInnerVerticalScrollPosition = null;

		if (bScrollPositionAtVirtualRange && bVirtualScrollingNeeded) {
			var iFirstRowHeight = aRowHeights[0];
			var iScrollingPixelsForRow = this.getVerticalScrollRangeRowFraction();
			var iPixelOnCurrentRow = iScrollTop - (oTable.getFirstVisibleRow() * iScrollingPixelsForRow);
			var iPercentOfFirstRowReached = iPixelOnCurrentRow / iScrollingPixelsForRow;

			iInnerVerticalScrollPosition = Math.ceil(iPercentOfFirstRowReached * iFirstRowHeight);

			// If the first row is scrolled out of the viewport, do nothing until performUpdateRows.
			if (iInnerVerticalScrollPosition > iFirstRowHeight) {
				iInnerVerticalScrollPosition = null;
			}
		} else if (this._iInnerVerticalScrollRange >= 0) {
			// Correct the total amount of RowHeightsDelta over the overflow scroll area.
			var iScrollPositionAtOverflowRange = bVirtualScrollingNeeded ? iScrollTop - this.getVerticalScrollRange() : iScrollTop;
			iInnerVerticalScrollPosition = (this._iInnerVerticalScrollRange / this.getVerticalScrollRangeDelta()) * iScrollPositionAtOverflowRange;
		}

		if (iInnerVerticalScrollPosition != null && iInnerVerticalScrollPosition > -1) {
			oTable.$().find(".sapUiTableCCnt").scrollTop(iInnerVerticalScrollPosition);
		}
	};

	/**
	 * Updates the cached value of the inner vertical scroll range.
	 *
	 * @param {int[]} aRowHeights The heights of the currently visible rows.
	 */
	TableScrollExtension.prototype.updateInnerVerticalScrollRangeCache = function(aRowHeights) {
		var oTable = this.getTable();

		if (oTable == null) {
			this._iInnerVerticalScrollRange = 0;
			return;
		}

		var iEstimatedViewportHeight = oTable._getDefaultRowHeight() * oTable.getVisibleRowCount();

		// Only sum rows filled with data, ignore empty rows.
		if (oTable.getVisibleRowCount() >= oTable._getTotalRowCount()) {
			aRowHeights = aRowHeights.slice(0, oTable._getTotalRowCount());
		}

		var iNewInnerVerticalScrollRange = aRowHeights.reduce(function(a, b) { return a + b; }, 0) - iEstimatedViewportHeight;
		if (iNewInnerVerticalScrollRange > 0) {
			iNewInnerVerticalScrollRange = Math.ceil(iNewInnerVerticalScrollRange);
		}

		this._iInnerVerticalScrollRange = Math.max(0, iNewInnerVerticalScrollRange);
	};

	/**
	 * Clears the cache of this extension (e.g. DOM references).
	 *
	 * @private
	 */
	TableScrollExtension.prototype._clearCache = function() {
		// Clear cached DOM references.
		this._oVerticalScrollbar = null;
		this._oHorizontalScrollbar = null;
	};

	return TableScrollExtension;
	});

/**
 * Gets the scroll extension.
 *
 * @name sap.ui.table.Table#_getScrollExtension
 * @function
 * @returns {sap.ui.table.TableScrollExtension} The scroll extension.
 * @private
 */