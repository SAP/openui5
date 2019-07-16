/*!
 * ${copyright}
 */

// Provides helper sap.ui.table.TableScrollExtension.
sap.ui.define([
	"./TableExtension",
	"./TableUtils",
	"sap/ui/Device",
	"./library",
	"sap/ui/performance/trace/Interaction",
	"sap/base/Log",
	"sap/ui/thirdparty/jquery"
], function(TableExtension, TableUtils, Device, library, Interaction, Log, jQuery) {
	"use strict";

	// Shortcuts
	var SharedDomRef = library.SharedDomRef;

	/*
	 * Maximum width/height of elements in pixel:
	 * Determined with: http://output.jsbin.com/wequmoparo (29.12.2017)
	 *
	 *                             Width      Height
	 * Chrome (63.0.3239.84)  33.554.428  33.554.428
	 * Firefox (57.0.3)       17.895.698  17.895.696
	 * EdgeHTML (14.14393)     1.533.917   1.533.917
	 * Internet Explorer 11    1.533.917   1.533.917
	 */

	/**
	 * Maximum height of the element containing the scrollable rows.
	 *
	 * @constant
	 * @type {int}
	 */
	var MAX_VERTICAL_SCROLL_HEIGHT = 1000000;

	/**
	 * The amount of default row heights reserved to scroll the final vertical overflow.
	 * The final vertical overflow is the content which overflows when the table is scrolled to the last page (the very last row is rendered).
	 * <b>Note: Only has an effect if variable row heights are enabled.</b>
	 *
	 * @constant
	 * @type {int}
	 */
	var VERTICAL_OVERFLOW_BUFFER_LENGTH = 2; // Must be >= 1! A buffer is always required, because at least one row is always in the buffer.

	/**
	 * Scroll directions.
	 *
	 * @enum {string}
	 * @memberOf sap.ui.table.TableScrollExtension
	 */
	var ScrollDirection = {
		HORIZONAL: "HORIZONTAL",
		VERTICAL: "VERTICAL",
		/** Both horizontal and vertical scroll direction. */
		BOTH: "BOTH"
	};

	/**
	 * The configuration options for event listeners.
	 *
	 * @typedef {Object} TableScrollExtension.EventListenerOptions
	 * @property {ScrollDirection} scrollDirection The scroll direction.
	 * @private
	 */

	/**
	 * Operational elements that can trigger scrolling.
	 *
	 * @typedef ScrollTrigger
	 * @enum {string}
	 */
	var ScrollTrigger = {
		SCROLLBAR: "Scrollbar",
		KEYBOARD: "Keyboard",
		MOUSEWHEEL: "MouseWheel",
		TOUCH: "Touch",
		FOCUS: "Focus",
		EXTENSION: "Extension",
		TABLE: "Table"
	};

	/**
	 * Writes a log message for this extension.
	 *
	 * @param {string} sMessage The message to log.
	 * @param {sap.ui.table.Table} oTable Instance of the table producing the log entry.
	 */
	function log(sMessage, oTable) {
		Log.debug("sap.ui.table.TableScrollExtension", sMessage, oTable);
	}

	/**
	 * Checks whether an element is connected with the DOM.
	 *
	 * @param {HTMLElement} oElement The element to check.
	 * @returns {boolean} Whether the element is connected with the DOM.
	 */
	function isConnected(oElement) {
		return typeof oElement.isConnected === "boolean" && oElement.isConnected || /* IE */ document.body.contains(oElement);
	}

	/**
	 * Static object to store internal instance information that should not be exposed but be hidden in this extension.
	 */
	var internalMap = new window.WeakMap();
	var internal = function(oTable) {
		if (!oTable) {
			return {};
		}

		if (!internalMap.has(oTable)) {
			internalMap.set(oTable, {
				oHorizontalScrollbar: null,
				iHorizontalScrollPosition: null,

				bVerticalScrollingSuspended: false,
				oVerticalScrollbar: null,
				oExternalVerticalScrollbar: null,
				nVerticalScrollPosition: null,
				iVerticalScrollHeight: null,
				iVerticalScrollbarHeight: null,
				iFirstVisibleRowInBuffer: null,

				bIsScrolledVerticallyByWheel: false,
				bIsScrolledVerticallyByKeyboard: false,
				mTouchSessionData: null,

				bIsVerticalScrollbarExternal: false,

				fnOnRowsUpdatedPreprocessor: null
			});
		}

		return internalMap.get(oTable);
	};
	internal.destroy = function(oTable) {
		delete internalMap.delete(oTable);
	};

	/**
	 * Provides the functionality which is required for the horizontal scrolling within the table.
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
			var iNewScrollLeft = oEvent.target.scrollLeft;
			var iOldScrollLeft = oEvent.target._scrollLeft;

			// For interaction detection.
			Interaction.notifyScrollEvent && Interaction.notifyScrollEvent(oEvent);

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

				internal(this).iHorizontalScrollPosition = iNewScrollLeft;
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

			if (oHSb && internal(oTable).iHorizontalScrollPosition !== null) {
				var aScrollTargets = HorizontalScrollingHelper.getScrollAreas(oTable);

				for (var i = 0; i < aScrollTargets.length; i++) {
					var oScrollTarget = aScrollTargets[i];
					delete oScrollTarget._scrollLeft;
				}

				if (oHSb.scrollLeft !== internal(oTable).iHorizontalScrollPosition) {
					oHSb.scrollLeft = internal(oTable).iHorizontalScrollPosition;
				} else {
					var oEvent = jQuery.Event("scroll");
					oEvent.target = oHSb;
					HorizontalScrollingHelper.onScroll.call(oTable, oEvent);
				}
			}
		},

		/**
		 * Will be called if the horizontal scrollbar is clicked.
		 *
		 * @param {jQuery.Event} oEvent The mouse event object.
		 */
		onScrollbarMouseDown: function(oEvent) {
			this._getKeyboardExtension().setActionMode(false);
		},

		/**
		 * Adds a horizontal <code>scroll</code> event listener to all horizontal scroll areas of a table.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 */
		addEventListeners: function(oTable) {
			var oScrollExtension = oTable._getScrollExtension();
			var oHSb = oScrollExtension.getHorizontalScrollbar();
			var aScrollAreas = HorizontalScrollingHelper.getScrollAreas(oTable);

			if (!oScrollExtension._onHorizontalScrollEventHandler) {
				oScrollExtension._onHorizontalScrollEventHandler = HorizontalScrollingHelper.onScroll.bind(oTable);
			}

			for (var i = 0; i < aScrollAreas.length; i++) {
				aScrollAreas[i].addEventListener("scroll", oScrollExtension._onHorizontalScrollEventHandler);
			}

			if (oHSb) {
				if (!oScrollExtension._onHorizontalScrollbarMouseDownEventHandler) {
					oScrollExtension._onHorizontalScrollbarMouseDownEventHandler = HorizontalScrollingHelper.onScrollbarMouseDown.bind(oTable);
				}
				oHSb.addEventListener("mousedown", oScrollExtension._onHorizontalScrollbarMouseDownEventHandler);
			}
		},

		/**
		 * Removes the horizontal <code>scroll</code> event listener from all horizontal scroll areas of a table.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 */
		removeEventListeners: function(oTable) {
			var oScrollExtension = oTable._getScrollExtension();
			var oHSb = oScrollExtension.getHorizontalScrollbar();
			var aScrollAreas = HorizontalScrollingHelper.getScrollAreas(oTable);

			if (oScrollExtension._onHorizontalScrollEventHandler) {
				for (var i = 0; i < aScrollAreas.length; i++) {
					aScrollAreas[i].removeEventListener("scroll", oScrollExtension._onHorizontalScrollEventHandler);
					delete aScrollAreas[i]._scrollLeft;
				}
				delete oScrollExtension._onHorizontalScrollEventHandler;
			}

			if (oHSb && oScrollExtension._onHorizontalScrollbarMouseDownEventHandler) {
				oHSb.removeEventListener("mousedown", oScrollExtension._onHorizontalScrollbarMouseDownEventHandler);
				delete oScrollExtension._onHorizontalScrollbarMouseDownEventHandler;
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
			var oDomRef = oTable.getDomRef();
			var aScrollableColumnAreas;

			if (oDomRef) {
				aScrollableColumnAreas = Array.prototype.slice.call(oTable.getDomRef().querySelectorAll(".sapUiTableCtrlScr"));
			}

			var aScrollAreas = [
				oTable._getScrollExtension().getHorizontalScrollbar()
			].concat(aScrollableColumnAreas);

			return aScrollAreas.filter(function(oScrollArea) {
				return oScrollArea != null;
			});
		}
	};

	/**
	 * Provides the functionality which is required for the vertical scrolling within the table.
	 * Find the remaining functionality in the <code>ScrollingHelper</code> and the <code>ExtensionDelegate</code>.
	 *
	 * @see ScrollingHelper#onMouseWheelScrolling
	 * @see ExtensionDelegate#onAfterRendering
	 * @private
	 */
	var VerticalScrollingHelper = {
		/**
		 * Updates the vertical scroll position.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @param {number} [nScrollPosition=undefined] The new vertical scroll position. If not specified, the new scroll position will be calculated
		 *                                             based on the first visible row.
		 * @param {ScrollTrigger} [sTrigger=ScrollTrigger.EXTENSION] The operational element that triggers scrolling.
		 * @param {boolean} [bPreventScroll=false] Whether scrolling the table should be prevented.
		 */
		updateScrollPosition: function(oTable, nScrollPosition, sTrigger, bPreventScroll) {
			sTrigger = sTrigger == null ? ScrollTrigger.EXTENSION : sTrigger;

			var oScrollExtension = oTable ? oTable._getScrollExtension() : null;
			var oVSb = oScrollExtension ? oScrollExtension.getVerticalScrollbar(true) : null;

			if (!oTable || !oVSb || !oScrollExtension.isVerticalScrollbarRequired() || internal(oTable).bVerticalScrollingSuspended) {
				log("VerticalScrollingHelper#updateScrollPosition: Not executed - Guard clause not passed", oTable);
				return;
			}

			var nOldScrollPosition = internal(oTable).nVerticalScrollPosition;
			var iMaxScrollPosition = VerticalScrollingHelper.getScrollRange(oTable);

			if (nScrollPosition == null) {
				var iFirstVisibleRowIndex = oTable.getFirstVisibleRow();
				var iMaxFirstRenderedRowIndex = oTable._getMaxFirstRenderedRowIndex();

				if (iFirstVisibleRowIndex > iMaxFirstRenderedRowIndex) {
					// The first visible row is inside the buffer. The table will be scrolled to the maximum possible first rendered row to receive the
					// heights of the rows in the buffer. The first visible row will then be correctly displayed on top when the inner scroll position
					// is updated. oScrollExtension process is not required for the first row in the buffer.
					nScrollPosition = iMaxScrollPosition;
					internal(oTable).iFirstVisibleRowInBuffer = iFirstVisibleRowIndex - iMaxFirstRenderedRowIndex;
				} else {
					nScrollPosition = iFirstVisibleRowIndex * VerticalScrollingHelper.getScrollRangeRowFraction(oTable);
					internal(oTable).iFirstVisibleRowInBuffer = null;
				}
			} else {
				internal(oTable).iFirstVisibleRowInBuffer = null;
			}
			internal(oTable).nVerticalScrollPosition = Math.min(Math.max(0, nScrollPosition), iMaxScrollPosition);

			log("VerticalScrollingHelper#updateScrollPosition: From " + nOldScrollPosition + " to " + internal(oTable).nVerticalScrollPosition
				+ " (diff: " + (internal(oTable).nVerticalScrollPosition - nOldScrollPosition) + ", trigger: " + sTrigger + ")", oTable);

			if (bPreventScroll === true) {
				log("VerticalScrollingHelper#updateScrollPosition: Scrolling prevented", oTable);
				return;
			}

			if (!isConnected(oVSb)) {
				log("VerticalScrollingHelper#updateScrollPosition: Scrollbar is not connected with the DOM", oTable);
				return;
			}

			window.cancelAnimationFrame(oTable._mAnimationFrames.verticalScrollUpdate);
			delete oTable._mAnimationFrames.verticalScrollUpdate;

			switch (sTrigger) {
				case ScrollTrigger.SCROLLBAR:
					clearTimeout(oTable._mTimeouts.largeDataScrolling);
					delete oTable._mTimeouts.largeDataScrolling;

					if (oTable._bLargeDataScrolling && !internal(oTable).bIsScrolledVerticallyByWheel) {
						oTable._mTimeouts.largeDataScrolling = setTimeout(function() {
							delete oTable._mTimeouts.largeDataScrolling;
							VerticalScrollingHelper.updateFirstVisibleRow(oTable);
						}, 300);
					} else {
						VerticalScrollingHelper.updateFirstVisibleRow(oTable);
					}
					break;
				case ScrollTrigger.KEYBOARD:
				case ScrollTrigger.MOUSEWHEEL:
				case ScrollTrigger.TOUCH:
				case ScrollTrigger.EXTENSION:
				case ScrollTrigger.TABLE:
					var iNewScrollTop = 0;
					var iVerticalScrollRange = VerticalScrollingHelper.getScrollRange(oTable);

					// As soon as the scroll position is > 0, scrollTop must be set to 1. Otherwise the user cannot scroll back to the first row with the
					// scrollbar. The same applies vice versa if the scroll position is at the bottom.
					if (internal(oTable).nVerticalScrollPosition > 0 && internal(oTable).nVerticalScrollPosition < 0.5) {
						iNewScrollTop = 1;
					} else if (internal(oTable).nVerticalScrollPosition >= iVerticalScrollRange - 0.5
							   && internal(oTable).nVerticalScrollPosition < iVerticalScrollRange) {
						iNewScrollTop = iVerticalScrollRange - 1;
					} else {
						iNewScrollTop = Math.round(internal(oTable).nVerticalScrollPosition);
					}

					if (oVSb.scrollTop !== iNewScrollTop) {
						log("VerticalScrollingHelper#updateScrollPosition: scrollTop will be set asynchronously", oTable);

						oTable._mAnimationFrames.verticalScrollUpdate = window.requestAnimationFrame(function() {
							var nOldScrollTop = oVSb.scrollTop;

							delete oTable._mAnimationFrames.verticalScrollUpdate;

							log("VerticalScrollingHelper#updateScrollPosition: (async) Set scrollTop from " + nOldScrollTop + " to " + iNewScrollTop,
								oTable);

							oVSb.scrollTop = iNewScrollTop;
							oVSb._scrollTop = oVSb.scrollTop;

							//if (iNewScrollTop === iVerticalScrollRange && iNewScrollTop !== oVSb.scrollTop) {
							//	log("VerticalScrollingHelper#updateScrollPosition: (async) Adjusted from "
							//		+ internal(oTable).nVerticalScrollPosition + " to " + oVSb.scrollTop, oTable);
							//	internal(oTable).nVerticalScrollPosition = oVSb.scrollTop;
							//}

							VerticalScrollingHelper.updateFirstVisibleRow(oTable);
						});
					} else if (internal(oTable).nVerticalScrollPosition !== nOldScrollPosition) {
						log("VerticalScrollingHelper#updateScrollPosition: firstVisibleRow will be set asynchronously", oTable);

						oTable._mAnimationFrames.verticalScrollUpdate = window.requestAnimationFrame(function() {
							delete oTable._mAnimationFrames.verticalScrollUpdate;
							VerticalScrollingHelper.updateFirstVisibleRow(oTable);
						});
					} else {
						log("VerticalScrollingHelper#updateScrollPosition: scrollTop and nVerticalScrollPosition not changed"
							+ " -> update inner vertical scroll position", oTable);

						// Even if the scroll position did not change, the inner scroll position might need to be updated. For example, because it
						// could have been reset to 0 by a re-rendering.
						oScrollExtension.updateInnerVerticalScrollPosition();
					}
					break;
				default:
			}
		},

		/**
		 * Will be called if scrolled vertically. Updates the visualized data by applying the first visible row from the vertical scrollbar.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 */
		onScroll: function(oEvent) {
			// For interaction detection.
			Interaction.notifyScrollEvent && Interaction.notifyScrollEvent(oEvent);

			if (internal(this).bIsScrolledVerticallyByKeyboard) {
				// When scrolling with the keyboard the first visible row is already correct and does not need adjustment.
				log("Vertical scroll event handler: Aborted - Scrolled by keyboard", this);
				return;
			}

			// Do not scroll in action mode, if scrolling was not initiated by a keyboard action!
			// Might cause loss of user input and other undesired behavior.
			this._getKeyboardExtension().setActionMode(false);

			var nNewScrollTop = oEvent.target.scrollTop; // Can be a float if zoomed in Chrome.
			var nOldScrollTop = oEvent.target._scrollTop; // This will be set in VerticalScrollingHelper#updateScrollPosition.
			var bScrollWithScrollbar = nNewScrollTop !== nOldScrollTop;

			if (nNewScrollTop === 0 && !isConnected(oEvent.target)) {
				log("Vertical scroll event handler: Scrollbar is not connected with the DOM", this);
			} else if (bScrollWithScrollbar) {
				log("Vertical scroll event handler: Scroll position changed by scrolling with the scrollbar:"
					+ " From " + internal(this).nVerticalScrollPosition + " to " + nNewScrollTop, this);
				delete oEvent.target._scrollTop;
				VerticalScrollingHelper.updateScrollPosition(this, nNewScrollTop, ScrollTrigger.SCROLLBAR);
			} else {
				log("Vertical scroll event handler: Scroll position changed by scrolling with VerticalScrollingHelper#updateScrollPosition", this);
			}

			internal(this).bIsScrolledVerticallyByWheel = false;
		},

		/**
		 * Adjusts the first visible row to the current vertical scroll position.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 */
		updateFirstVisibleRow: function(oTable) {
			var oScrollExtension = oTable._getScrollExtension();
			var iMaxFirstRenderedRowIndex = oTable._getMaxFirstRenderedRowIndex();
			var iNewFirstVisibleRowIndex = VerticalScrollingHelper.getRowIndexAtCurrentScrollPosition(oTable);
			var iOldFirstVisibleRowIndex = oTable.getFirstVisibleRow();
			var bNewFirstVisibleRowInBuffer = iNewFirstVisibleRowIndex < 0;
			var bOldFirstVisibleRowInBuffer = iOldFirstVisibleRowIndex >= iMaxFirstRenderedRowIndex;
			var bFirstVisibleRowChanged = iNewFirstVisibleRowIndex !== iOldFirstVisibleRowIndex;
			var bRowsUpdateRequired = bFirstVisibleRowChanged && !(bNewFirstVisibleRowInBuffer && bOldFirstVisibleRowInBuffer);

			if (bRowsUpdateRequired) {
				var bExpectRowsUpdatedEvent = !bOldFirstVisibleRowInBuffer || iNewFirstVisibleRowIndex !== iMaxFirstRenderedRowIndex;

				if (bNewFirstVisibleRowInBuffer) {
					// The actual new first visible row cannot be determined yet. It will be done when the inner scroll position gets updated.
					iNewFirstVisibleRowIndex = iMaxFirstRenderedRowIndex;
				}

				log("updateFirstVisibleRow: From " + iOldFirstVisibleRowIndex + " to " + iNewFirstVisibleRowIndex, oTable);

				oTable.setFirstVisibleRow(iNewFirstVisibleRowIndex, true, bNewFirstVisibleRowInBuffer);

				if (bExpectRowsUpdatedEvent) {
					VerticalScrollingHelper.setOnRowsUpdatedPreprocessor(oTable, function(oEvent) {
						log("updateFirstVisibleRow - onRowsUpdatedPreprocessor: Reason " + oEvent.getParameters().reason, this);

						oScrollExtension.updateInnerVerticalScrollPosition();

						if (bNewFirstVisibleRowInBuffer) {
							var iCurrentFirstVisibleRow = this.getFirstVisibleRow();
							var bFirstVisibleRowNotChanged = iNewFirstVisibleRowIndex === iCurrentFirstVisibleRow;

							// The firstVisibleRow was previously set to the maximum first visible row index while suppressing the event. If the first
							// visible row is not adjusted in #updateInnerVerticalScrollPosition, make sure the event is called here.
							if (bFirstVisibleRowNotChanged) {
								this.setProperty("firstVisibleRow", -1, true);
								this.setFirstVisibleRow(iCurrentFirstVisibleRow, true);
							}
						}

						return false;
					});
				} else {
					log("updateFirstVisibleRow: Update inner vertical scroll position", oTable);
					oScrollExtension.updateInnerVerticalScrollPosition();
				}

			} else if (TableUtils.isVariableRowHeightEnabled(oTable)) {
				log("updateFirstVisibleRow: Update inner vertical scroll position", oTable);
				oScrollExtension.updateInnerVerticalScrollPosition();
			}
		},

		/**
		 * Gets the index of the row at the current vertical scroll position.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @returns {int} The index of the row, or -1 if the index could not be determined.
		 */
		getRowIndexAtCurrentScrollPosition: function(oTable) {
			var oScrollExtension = oTable._getScrollExtension();
			var iMaxRowIndex = oTable._getMaxFirstVisibleRowIndex();

			if (iMaxRowIndex === 0) {
				return 0;
			} else {
				var nScrollPosition = VerticalScrollingHelper.getScrollPosition(oTable);
				var iScrollRange = VerticalScrollingHelper.getScrollRange(oTable);
				var nScrollRangeRowFraction = VerticalScrollingHelper.getScrollRangeRowFraction(oTable);

				if (TableUtils.isVariableRowHeightEnabled(oTable)) {
					if (VerticalScrollingHelper.isScrollPositionInBuffer(oTable)) {
						return -1;
					} else {
						return Math.min(iMaxRowIndex, Math.floor(nScrollPosition / nScrollRangeRowFraction));
					}
				} else {
					var iRowIndex = Math.floor(nScrollPosition / nScrollRangeRowFraction);

					// Calculation of the row index can be inaccurate if scrolled to the end. This can happen due to rounding errors in case of
					// large data or when zoomed in Chrome. In this case it can not be scrolled to the last row. To overcome this issue we consider the
					// table to be scrolled to the end, if the scroll position is less than 1 pixel away from the maximum.
					var nDistanceToMaximumScrollPosition = iScrollRange - nScrollPosition;
					var bScrolledViaScrollTop = oScrollExtension.getVerticalScrollbar(true)._scrollTop == null
												|| internal(oTable).bIsScrolledVerticallyByWheel;
					var bScrolledToBottom = nDistanceToMaximumScrollPosition < 1 && bScrolledViaScrollTop
											|| nDistanceToMaximumScrollPosition < 0.01;

					if (bScrolledToBottom) {
						// If zoomed in Chrome, scrollTop might not be accurate enough to correctly restore the scroll position after rendering.
						VerticalScrollingHelper.updateScrollPosition(oTable, iScrollRange, null, true);
					}

					return bScrolledToBottom ? iMaxRowIndex : Math.min(iMaxRowIndex, iRowIndex);
				}
			}
		},

		/**
		 * Gets the vertical scroll range.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @returns {int} The vertical scroll range.
		 */
		getScrollRange: function(oTable) {
			var oScrollExtension = oTable._getScrollExtension();
			var iVerticalScrollRange = oScrollExtension.getVerticalScrollHeight() - oScrollExtension.getVerticalScrollbarHeight();
			return Math.max(0, iVerticalScrollRange);
		},

		/**
		 * Gets the buffer of the vertical scroll range reserved to scroll the final overflow.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @returns {int} The buffer to scroll the final overflow.
		 */
		getScrollRangeBuffer: function(oTable) {
			if (!TableUtils.isVariableRowHeightEnabled(oTable)) {
				return 0;
			}

			return VERTICAL_OVERFLOW_BUFFER_LENGTH * oTable._getBaseRowHeight();
		},

		/**
		 * Gets the current vertical scroll position. This must not be the current <code>scrollTop</code> value, but can be a memorized value.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @returns {number} The vertical scroll position.
		 */
		getScrollPosition: function(oTable) {
			var oScrollExtension = oTable._getScrollExtension();

			if (internal(oTable).nVerticalScrollPosition != null) {
				return internal(oTable).nVerticalScrollPosition;
			} else if (oScrollExtension.isVerticalScrollbarVisible()) {
				return oScrollExtension.getVerticalScrollbar().scrollTop;
			} else {
				return 0;
			}
		},

		/**
		 * Gets the fraction of the vertical scroll range which corresponds to a row. This value specifies how many pixels must be scrolled to
		 * scroll one row.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @returns {number} The fraction of the vertical scroll range which corresponds to a row.
		 */
		getScrollRangeRowFraction: function(oTable) {
			var oScrollExtension = oTable._getScrollExtension();
			var iVirtualRowCount = oTable._getTotalRowCount() - oTable._getRowCounts().count;
			var iScrollRangeWithoutBuffer;

			if (TableUtils.isVariableRowHeightEnabled(oTable)) {
				iScrollRangeWithoutBuffer = VerticalScrollingHelper.getScrollRange(oTable) - VerticalScrollingHelper.getScrollRangeBuffer(oTable);

				// The last row is part of the buffer. To correctly calculate the fraction of the scroll range allocated to a row, all rows must be
				// considered. This is not the case if the scroll range is at its maximum, then the buffer must be excluded from calculation
				// completely.
				var bScrollRangeMaxedOut = oScrollExtension.getVerticalScrollHeight() === MAX_VERTICAL_SCROLL_HEIGHT;
				if (!bScrollRangeMaxedOut) {
					iScrollRangeWithoutBuffer += oTable._getBaseRowHeight();
				}
			} else {
				iScrollRangeWithoutBuffer = VerticalScrollingHelper.getScrollRange(oTable);
			}

			return iScrollRangeWithoutBuffer / Math.max(1, iVirtualRowCount);
		},

		/**
		 * Checks whether the vertical scroll position is in the buffer reserved to scroll the final overflow.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @returns {boolean} Returns <code>true</code>, if the vertical scroll position is in the buffer.
		 */
		isScrollPositionInBuffer: function(oTable) {
			if (!TableUtils.isVariableRowHeightEnabled(oTable)) {
				return false;
			}

			var iScrollRange = VerticalScrollingHelper.getScrollRange(oTable);
			var nScrollPosition = VerticalScrollingHelper.getScrollPosition(oTable);
			var iScrollRangeBugger = VerticalScrollingHelper.getScrollRangeBuffer(oTable);

			return iScrollRange - nScrollPosition <= iScrollRangeBugger;
		},

		/**
		 * Gets the inner vertical scroll range. This is the amount of pixels that the rows overflow their container.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @returns {int} The inner vertical scroll range.
		 */
		getInnerScrollRange: function(oTable) {
			if (!oTable || !oTable._aRowHeights) {
				return 0;
			}

			var aRowHeights = oTable._aRowHeights;
			var iEstimatedViewportHeight = oTable._getBaseRowHeight() * oTable._getRowCounts().count;

			// Only sum rows filled with data, ignore empty rows.
			if (oTable._getRowCounts().count >= oTable._getTotalRowCount()) {
				aRowHeights = aRowHeights.slice(0, oTable._getTotalRowCount());
			}

			var iInnerVerticalScrollRange = aRowHeights.reduce(function(a, b) { return a + b; }, 0) - iEstimatedViewportHeight;
			if (iInnerVerticalScrollRange > 0) {
				iInnerVerticalScrollRange = Math.ceil(iInnerVerticalScrollRange);
			}

			return Math.max(0, iInnerVerticalScrollRange);
		},

		/**
		 * Will be called if the vertical scrollbar is clicked.
		 * Resets the vertical scroll flags.
		 *
		 * @param {jQuery.Event} oEvent The mouse event object.
		 */
		onScrollbarMouseDown: function(oEvent) {
			internal(this).bIsScrolledVerticallyByWheel = false;
			internal(this).bIsScrolledVerticallyByKeyboard = false;
		},

		/**
		 * Sets an event handler that is called before the <code>VerticalScrollingHelper.onRowsUpdated</code> handler. The event object is passed
		 * as the first argument. A preprocessor is called only once and is then removed automatically. If the preprocessor returns false, the
		 * <code>onRowsUpdated</code> handler will not be executed.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @param {Function} fnPreprocessor The function to call.
		 * @private
		 */
		setOnRowsUpdatedPreprocessor: function(oTable, fnPreprocessor) {
			internal(oTable).fnOnRowsUpdatedPreprocessor = fnPreprocessor;
		},

		/**
		 * If a preprocessor was set, it is called and afterwards removed.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @param {Object} oEvent The event object.
		 * @returns {boolean} Whether the default action should be executed.
		 */
		runOnRowsUpdatedPreprocessor: function(oTable, oEvent) {
			var bExecuteDefault = true;
			if (internal(oTable).fnOnRowsUpdatedPreprocessor != null) {
				bExecuteDefault = internal(oTable).fnOnRowsUpdatedPreprocessor.call(oTable, oEvent) !== false;
			}
			internal(oTable).fnOnRowsUpdatedPreprocessor = null;
			return bExecuteDefault;
		},

		/**
		 * Handles the <code>Table#_rowsUpdated</code> event.
		 *
		 * @param {Object} oEvent The event object.
		 * @private
		 */
		onRowsUpdated: function(oEvent) {
			var oScrollExtension = this._getScrollExtension();
			var bExecuteDefault = VerticalScrollingHelper.runOnRowsUpdatedPreprocessor(this, oEvent);

			if (!TableUtils.isVariableRowHeightEnabled(this) || !bExecuteDefault) {
				return;
			}

			var sReason = oEvent.getParameters().reason;
			var bRowExpandedOrCollapsed = sReason === TableUtils.RowsUpdateReason.Expand || sReason === TableUtils.RowsUpdateReason.Collapse;
			var iFirstVisibleRowIndexInBuffer = this.getFirstVisibleRow() - this._getMaxFirstRenderedRowIndex();

			log("onRowsUpdated: Reason " + sReason, this);

			if (iFirstVisibleRowIndexInBuffer >= 0 && bRowExpandedOrCollapsed) {
				internal(this).iFirstVisibleRowInBuffer = iFirstVisibleRowIndexInBuffer;
				oScrollExtension.updateInnerVerticalScrollPosition();
			}
		},

		/**
		 * This function can be used to restore the last vertical scroll position which has been stored.
		 * In case there is no stored scroll position, the scroll position is calculated depending on the value of <code>firstVisibleRow</code>.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @see VerticalScrollingHelper#onScroll
		 * @see VerticalScrollingHelper#updateScrollPosition
		 */
		restoreScrollPosition: function(oTable) {
			VerticalScrollingHelper.updateScrollPosition(oTable, internal(oTable).nVerticalScrollPosition);
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

			if (!oScrollExtension._onVerticalScrollEventHandler) {
				oScrollExtension._onVerticalScrollEventHandler = VerticalScrollingHelper.onScroll.bind(oTable);
			}

			for (var i = 0; i < aScrollAreas.length; i++) {
				aScrollAreas[i].addEventListener("scroll", oScrollExtension._onVerticalScrollEventHandler);
			}

			if (oVSb) {
				if (!oScrollExtension._onVerticalScrollbarMouseDownEventHandler) {
					oScrollExtension._onVerticalScrollbarMouseDownEventHandler = VerticalScrollingHelper.onScrollbarMouseDown.bind(oTable);
				}
				oVSb.addEventListener("mousedown", oScrollExtension._onVerticalScrollbarMouseDownEventHandler);
			}

			oTable.attachEvent("_rowsUpdated", VerticalScrollingHelper.onRowsUpdated);
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

			if (oScrollExtension._onVerticalScrollEventHandler) {
				for (var i = 0; i < aScrollAreas.length; i++) {
					aScrollAreas[i].removeEventListener("scroll", oScrollExtension._onVerticalScrollEventHandler);
				}
				delete oScrollExtension._onVerticalScrollEventHandler;
			}

			if (oVSb && oScrollExtension._onVerticalScrollbarMouseDownEventHandler) {
				oVSb.removeEventListener("mousedown", oScrollExtension._onVerticalScrollbarMouseDownEventHandler);
				delete oScrollExtension._onVerticalScrollbarMouseDownEventHandler;
			}

			oTable.detachEvent("_rowsUpdated", VerticalScrollingHelper.onRowsUpdated);
		},

		/**
		 * Checks whether an update of the scroll position (incl. the firstVisibleRow property) is scheduled.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @returns {boolean} Returns <code>true</code>, if an update is pending.
		 */
		isUpdatePending: function(oTable) {
			return !!(oTable && oTable._mAnimationFrames.verticalScrollUpdate);
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
		 * @param {TableScrollExtension.EventListenerOptions} mOptions The options.
		 * @param {WheelEvent} oEvent The wheel event object.
		 */
		onMouseWheelScrolling: function(mOptions, oEvent) {
			var oScrollExtension = this._getScrollExtension();
			var bVerticalDelta = Math.abs(oEvent.deltaY) > Math.abs(oEvent.deltaX);
			var iScrollDelta = bVerticalDelta ? oEvent.deltaY : oEvent.deltaX;
			var bHorizontalScrolling = bVerticalDelta && oEvent.shiftKey || !bVerticalDelta;
			var bScrollingForward = iScrollDelta > 0;
			var bScrolledToEnd = false;

			if (iScrollDelta === 0) {
				return;
			}

			if (bHorizontalScrolling && (mOptions.scrollDirection === ScrollDirection.HORIZONAL
										 || mOptions.scrollDirection === ScrollDirection.BOTH)) {
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
					oEvent.preventDefault();
					oEvent.stopPropagation();

					this._getKeyboardExtension().setActionMode(false);
					oHSb.scrollLeft = oHSb.scrollLeft + iScrollDelta;
				}

			} else if (!bHorizontalScrolling && (mOptions.scrollDirection === ScrollDirection.VERTICAL
												 || mOptions.scrollDirection === ScrollDirection.BOTH)) {
				var oVSb = oScrollExtension.getVerticalScrollbar();
				var iMaxFirstRenderedRowIndex = this._getMaxFirstRenderedRowIndex();
				var bIsScrollPositionInBuffer = TableUtils.isVariableRowHeightEnabled(this)
												&& this._getFirstRenderedRowIndex() === iMaxFirstRenderedRowIndex;
				var nScrollRangeRowFraction = VerticalScrollingHelper.getScrollRangeRowFraction(this);
				var nScrollDeltaFactor = bIsScrollPositionInBuffer ? this._getBaseRowHeight() : nScrollRangeRowFraction;

				if (oEvent.deltaMode === 1 /* DOM_DELTA_LINE */) {
					iScrollDelta *= nScrollDeltaFactor;
				} else if (oEvent.deltaMode === 2 /* DOM_DELTA_PAGE */) {
					iScrollDelta *= nScrollDeltaFactor * this._getRowCounts().count;
				}

				if (bScrollingForward) {
					bScrolledToEnd = oVSb.scrollTop === oVSb.scrollHeight - oVSb.offsetHeight;
				} else {
					bScrolledToEnd = oVSb.scrollTop === 0;
				}

				if (oScrollExtension.isVerticalScrollbarVisible() && !bScrolledToEnd) {
					oEvent.preventDefault();
					oEvent.stopPropagation();

					var nScrollPosition = VerticalScrollingHelper.getScrollPosition(this);
					var nVirtualScrollPosition = nScrollPosition - (iMaxFirstRenderedRowIndex * nScrollRangeRowFraction);
					var nPixelsToScroll = iScrollDelta;

					if (!bIsScrollPositionInBuffer || (bIsScrollPositionInBuffer && nVirtualScrollPosition === 0 && !bScrollingForward)) {
						var nRowsToScroll = iScrollDelta / (oEvent.deltaMode === 0 ? this._getBaseRowHeight() : nScrollRangeRowFraction);

						// If at least one row is scrolled, floor to full rows. Below one row, we scroll pixels.
						if (nRowsToScroll > 1) {
							nRowsToScroll = Math.floor(nRowsToScroll);
						} else if (nRowsToScroll < -1) {
							nRowsToScroll = Math.ceil(nRowsToScroll);
						}

						nPixelsToScroll = nRowsToScroll * nScrollRangeRowFraction;

					} else if (!bScrollingForward) {  // Vertical scroll position is in buffer.
						if (nVirtualScrollPosition + nPixelsToScroll < 0) {
							nPixelsToScroll = -nVirtualScrollPosition;
						}
					}

					internal(this).bIsScrolledVerticallyByWheel = true;
					internal(this).bIsScrolledVerticallyByKeyboard = false;

					this._getKeyboardExtension().setActionMode(false);

					VerticalScrollingHelper.updateScrollPosition(this, nScrollPosition + nPixelsToScroll, ScrollTrigger.MOUSEWHEEL);
				}
			}
		},

		/**
		 * Handles touch start events.
		 *
		 * @param {TableScrollExtension.EventListenerOptions} mOptions The options.
		 * @param {jQuery.Event} oEvent The touch or pointer event object.
		 */
		onTouchStart: function(mOptions, oEvent) {
			if (oEvent.type === "touchstart" || oEvent.pointerType === "touch") {
				var oScrollExtension = this._getScrollExtension();
				var oHSb = oScrollExtension.getHorizontalScrollbar();
				var oVSb = oScrollExtension.getVerticalScrollbar();
				var oTouchObject = oEvent.touches ? oEvent.touches[0] : oEvent;

				internal(this).mTouchSessionData = {
					initialPageX: oTouchObject.pageX,
					initialPageY: oTouchObject.pageY,
					initialScrollTop: oVSb ? oVSb.scrollTop : 0,
					initialScrollLeft: oHSb ? oHSb.scrollLeft : 0,
					initialScrolledToEnd: null,
					touchMoveDirection: null
				};
			}
		},

		/**
		 * Handles touch move events.
		 *
		 * @param {TableScrollExtension.EventListenerOptions} mOptions The options.
		 * @param {jQuery.Event} oEvent The touch or pointer event object.
		 */
		onTouchMoveScrolling: function(mOptions, oEvent) {
			if (oEvent.type !== "touchmove" && oEvent.pointerType !== "touch") {
				return;
			}

			var oScrollExtension = this._getScrollExtension();
			var mTouchSessionData = internal(this).mTouchSessionData;

			if (!mTouchSessionData) {
				return;
			}

			var oTouchObject = oEvent.touches ? oEvent.touches[0] : oEvent;
			var iTouchDistanceX = (oTouchObject.pageX - mTouchSessionData.initialPageX);
			var iTouchDistanceY = (oTouchObject.pageY - mTouchSessionData.initialPageY);
			var bScrollingPerformed = false;

			if (!mTouchSessionData.touchMoveDirection) {
				if (iTouchDistanceX === 0 && iTouchDistanceY === 0) {
					return;
				}
				mTouchSessionData.touchMoveDirection = Math.abs(iTouchDistanceX) > Math.abs(iTouchDistanceY) ? "horizontal" : "vertical";
			}

			switch (mTouchSessionData.touchMoveDirection) {
				case "horizontal":
					var oHSb = oScrollExtension.getHorizontalScrollbar();

					if (oHSb && (mOptions.scrollDirection === ScrollDirection.HORIZONAL
								 || mOptions.scrollDirection === ScrollDirection.BOTH)) {
						this._getKeyboardExtension().setActionMode(false);

						if (mTouchSessionData.initialScrolledToEnd == null) {
							if (iTouchDistanceX < 0) { // Scrolling to the right.
								mTouchSessionData.initialScrolledToEnd = oHSb.scrollLeft === oHSb.scrollWidth - oHSb.offsetWidth;
							} else { // Scrolling to the left.
								mTouchSessionData.initialScrolledToEnd = oHSb.scrollLeft === 0;
							}
						}

						if (!mTouchSessionData.initialScrolledToEnd) {
							oHSb.scrollLeft = mTouchSessionData.initialScrollLeft - iTouchDistanceX;
							bScrollingPerformed = true;
						}
					}
					break;

				case "vertical":
					var oVSb = oScrollExtension.getVerticalScrollbar();

					if (oVSb && (mOptions.scrollDirection === ScrollDirection.VERTICAL
								 || mOptions.scrollDirection === ScrollDirection.BOTH)) {
						this._getKeyboardExtension().setActionMode(false);

						if (mTouchSessionData.initialScrolledToEnd == null) {
							if (iTouchDistanceY < 0) { // Scrolling down.
								mTouchSessionData.initialScrolledToEnd = oVSb.scrollTop === oVSb.scrollHeight - oVSb.offsetHeight;
							} else { // Scrolling up.
								mTouchSessionData.initialScrolledToEnd = oVSb.scrollTop === 0;
							}
						}

						if (!mTouchSessionData.initialScrolledToEnd) {
							VerticalScrollingHelper.updateScrollPosition(this, mTouchSessionData.initialScrollTop - iTouchDistanceY,
								ScrollTrigger.TOUCH);
							bScrollingPerformed = true;
						}
					}
					break;
				default:
			}

			if (bScrollingPerformed) {
				oEvent.preventDefault();
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

			oScrollExtension._mMouseWheelEventListener = this.addMouseWheelEventListener(aEventListenerTargets, oTable, {
				scrollDirection: ScrollDirection.BOTH
			});
			oScrollExtension._mTouchEventListener = this.addTouchEventListener(aEventListenerTargets, oTable, {
				scrollDirection: ScrollDirection.BOTH
			});
		},

		/**
		 * Adds mouse wheel event listeners to HTMLElements.
		 *
		 * @param {HTMLElement[]} aEventListenerTargets The elements to add listeners to.
		 * @param {sap.ui.table.Table} oTable The table instance to be set as the context of the listeners.
		 * @param {TableScrollExtension.EventListenerOptions} mOptions The options.
		 * @returns {{wheel: Function}} A key value map containing the event names as keys and listener functions as values.
		 */
		addMouseWheelEventListener: function(aEventListenerTargets, oTable, mOptions) {
			var fnOnMouseWheelEventHandler = ScrollingHelper.onMouseWheelScrolling.bind(oTable, mOptions);

			for (var i = 0; i < aEventListenerTargets.length; i++) {
				aEventListenerTargets[i].addEventListener("wheel", fnOnMouseWheelEventHandler);
			}

			return {wheel: fnOnMouseWheelEventHandler};
		},

		/**
		 * Adds touch event listeners to HTMLElements.
		 *
		 * @param {HTMLElement[]} aEventListenerTargets The elements to add listeners to.
		 * @param {sap.ui.table.Table} oTable The table instance to be set as the context of the listeners.
		 * @param {TableScrollExtension.EventListenerOptions} mOptions The options.
		 * @returns {{pointerdown: Function,
		 *            pointermove: Function,
		 *            touchstart: Function,
		 *            touchmove: Function}} A key value map containing the event names as keys and listener functions as values.
		 */
		addTouchEventListener: function(aEventListenerTargets, oTable, mOptions) {
			var fnOnTouchStartEventHandler = ScrollingHelper.onTouchStart.bind(oTable, mOptions);
			var fnOnTouchMoveEventHandler = ScrollingHelper.onTouchMoveScrolling.bind(oTable, mOptions);
			var mListeners = {};

			for (var i = 0; i < aEventListenerTargets.length; i++) {
				/* Touch events */
				// IE/Edge and Chrome on desktops and windows tablets - pointer events;
				// other browsers and tablets - touch events.
				if (Device.support.pointer && Device.system.desktop) {
					aEventListenerTargets[i].addEventListener("pointerdown", fnOnTouchStartEventHandler);
					aEventListenerTargets[i].addEventListener("pointermove", fnOnTouchMoveEventHandler,
						Device.browser.chrome ? {passive: true} : false);
				} else if (Device.support.touch) {
					aEventListenerTargets[i].addEventListener("touchstart", fnOnTouchStartEventHandler);
					aEventListenerTargets[i].addEventListener("touchmove", fnOnTouchMoveEventHandler);
				}
			}

			if (Device.support.pointer && Device.system.desktop) {
				mListeners = {pointerdown: fnOnTouchStartEventHandler, pointermove: fnOnTouchMoveEventHandler};
			} else if (Device.support.touch) {
				mListeners = {touchstart: fnOnTouchStartEventHandler, touchmove: fnOnTouchMoveEventHandler};
			}

			return mListeners;
		},

		/**
		 * Removes mouse wheel and touch event listeners.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 */
		removeEventListeners: function(oTable) {
			var oScrollExtension = oTable._getScrollExtension();
			var aEventTargets = ScrollingHelper.getEventListenerTargets(oTable);

			function removeEventListener(oTarget, mEventListenerMap) {
				for (var sEventName in mEventListenerMap) {
					var fnListener = mEventListenerMap[sEventName];
					if (fnListener) {
						oTarget.removeEventListener(sEventName, fnListener);
					}
				}
			}

			for (var i = 0; i < aEventTargets.length; i++) {
				removeEventListener(aEventTargets[i], oScrollExtension._mMouseWheelEventListener);
				removeEventListener(aEventTargets[i], oScrollExtension._mTouchEventListener);
			}

			delete oScrollExtension._mMouseWheelEventListener;
			delete oScrollExtension._mTouchEventListener;
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
			var oScrollExtension = this._getScrollExtension();
			var bRenderedRows = oEvent != null && oEvent.isMarked("renderRows");

			oScrollExtension._clearCache();

			if (!bRenderedRows) {
				internal(this).bVerticalScrollingSuspended = true;
				this.attachEventOnce("_rowsUpdated", function() {
					internal(this).bVerticalScrollingSuspended = false;
					VerticalScrollingHelper.restoreScrollPosition(this);
				});
			}
		},

		onAfterRendering: function(oEvent) {
			var oScrollExtension = this._getScrollExtension();
			var bRenderedRows = oEvent != null && oEvent.isMarked("renderRows");

			if (bRenderedRows) {
				oScrollExtension.updateVerticalScrollbarHeight();
				oScrollExtension.updateVerticalScrollHeight();
			}

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

			if (oRowContainer && oCellInfo.columnIndex >= this.getComputedFixedColumnCount()) {
				var oHSb = this._getScrollExtension().getHorizontalScrollbar();
				var $HSb = jQuery(oHSb);
				var oCell = oCellInfo.cell[0];

				var iCurrentScrollLeft = this._bRtlMode ? $HSb.scrollLeftRTL() : oHSb.scrollLeft;
				var iRowContainerWidth = oRowContainer.clientWidth;
				var iCellLeft = oCell.offsetLeft;
				var iCellRight = iCellLeft + oCell.offsetWidth;
				var iOffsetLeft = iCellLeft - iCurrentScrollLeft;
				var iOffsetRight = iCellRight - iRowContainerWidth - iCurrentScrollLeft;
				var iNewScrollLeft;

				if (iOffsetLeft < 0 && iOffsetRight < 0) {
					iNewScrollLeft = iCurrentScrollLeft + iOffsetLeft;
				} else if (iOffsetRight > 0 && iOffsetLeft > 0) {
					iNewScrollLeft = iCurrentScrollLeft + iOffsetRight;
				}

				if (iNewScrollLeft != null) {
					if (this._bRtlMode) {
						$HSb.scrollLeftRTL(iNewScrollLeft);
					} else {
						oHSb.scrollLeft = iNewScrollLeft;
					}
				}
			}

			// On focus, the browsers scroll elements which are not visible into the viewport (IE also scrolls if elements are partially visible).
			// This causes scrolling inside table cells, which is not desired.
			// Flickering of the cell content cannot be avoided, as the browser performs scrolling after the event. This behavior cannot be
			// prevented, only reverted.
			var $ParentCell = TableUtils.getParentCell(this, oEvent.target);

			if ($ParentCell) {
				var that = this;
				var fnScrollBack = function() {
					var $InnerCellElement = $ParentCell.find(".sapUiTableCellInner");

					if ($InnerCellElement.length > 0) {
						if (that._bRtlMode) {
							$InnerCellElement.scrollLeftRTL($InnerCellElement[0].scrollWidth - $InnerCellElement[0].clientWidth);
						} else {
							$InnerCellElement[0].scrollLeft = 0;
						}
						$InnerCellElement[0].scrollTop = 0;
					}
				};

				Promise.resolve().then(function() {
					if (Device.browser.safari) {
						window.setTimeout(fnScrollBack, 0);
					} else {
						fnScrollBack();
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
	 * <b>Enables vertical scrolling.</b>
	 *
	 * - Vertical scrolling is virtualized.
	 *   Only the contexts are updated while rows and cells are reused. The task of this extension in this process is to calculate and apply the
	 *   correct value for the <code>firstVisibleRow</code> property.
	 *
	 * - The floating-point based algorithm seems to allow to scroll about 10.000.000.000.000.000 rows.
	 *   At higher numbers, an important base value loses too much of its precision
	 *   (see <code>TableScrollExtension#getVerticalScrollRangeRowFraction</code>). This number is by no means suitable for external communication as
	 *   it is merely the result of minor manual tests.
	 *   Because the maximum height of elements is limited in browsers, the container of the scrollable rows is also limited. To still be able to
	 *   scroll large data (number of rows > maximum element height / row height), this extension relies on floating-point arithmetic. The maximum
	 *   amount of scrollable rows is therefore limited by the precision of the floating-point arithmetic in JavaScript.
	 *
	 *   <i>Currently known limitations:</i>
	 *   - The restoration of the scroll position after resizing can be inaccurate. Inaccuracies can be favored by the amount of data,
	 *     zooming in Chrome, and in case of resizing by <code>visibleRowCountMode="Auto"</code>. Changing the zoom factor in Chrome can also
	 *     change the scroll position for small data in any <code>visibleRowCountMode</code> due to rounding errors.
	 *     QUnit tests showing the failure:
	 *     - "Restore scroll position when VisibleRowCount changed in Fixed mode; Large data; Fixed row heights"
	 *     - "Restore scroll position when VisibleRowCount changed in Auto mode; Small data; Fixed row heights"
	 *     - "Restore scroll position when VisibleRowCount changed in Auto mode; Large data; Fixed row heights"
	 *     - "Restore scroll position on binding length change; Small data; Fixed row heights"
	 *     - "Restore scroll position on binding length change; Large data; Fixed row heights"
	 *
	 * - Support for variable row heights.
	 *   Rows are allowed to be scrolled partially. To do this, one more row than the <code>visibleRowCount</code> is rendered, so there is an
	 *   overflow in the container of the scrollable rows which can be scrolled (inner scroll position).
	 *   The bigger the height of a row, the faster it is scrolled. This is because every row is scrolled through by the same fraction of the
	 *   vertical scroll range. The rows in the final overflow are scrolled im a similar way. For them a certain amount of the vertical scroll
	 *   range is reserved at the bottom (buffer).
	 *   The final overflow is the content which overflows when the table is scrolled to the last set or rows which can be rendered. The last row
	 *   is always in the buffer, so there is always an overflow.
	 *
	 *   <i>Currently known limitations:</i>
	 *   - Experimental implementation!
	 *   - Fixed rows are not supported.
	 *   - Keyboard navigation is not fully supported.
	 *   - Focus handling is not supported. Browsers scroll focused elements into the viewport. This changes the inner vertical scroll position.
	 *   - If either the binding length, or the tables height changes, the inner vertical scroll position cannot be restored and is therefore
	 *     discarded. This means, that the current first visible row will "snap to top".
	 *   - Because rendering and setting the inner vertical scroll position might not always happen synchronously, there is a chance to see a brief
	 *     flickering.
	 *
	 * - Management of the vertical scrollbar (size, position, visibility).
	 *
	 * <b>Enables horizontal scrolling.</b>
	 *
	 *  <i>Currently known limitations:</i>
	 *   - If the total width of all scrollable columns exceeds the maximum width of an element (limited by the browser), horizontal scrolling does
	 *     no longer work.
	 *
	 * - Synchronization of the scroll positions of the 4 elements containing the scrollable columns (header / fixed top / scrollable / fixed bottom).
	 *
	 * - Management of the horizontal scrollbar (size, position, visibility).
	 *
	 * <b>Enables mouse wheel scrolling.</b>
	 *   All delta modes are supported (pixel, line, page).
	 *   When variable row heights are enabled, full rows are scrolled when the delta is at least one default row height, otherwise the rows are
	 *   partially scrolled.
	 *
	 *   <i>Currently known limitations:</i>
	 *   - For performance reasons, horizontal line and page scrolling is performed by the distance of one minimum column width, regardless of the
	 *     number of lines or pages.
	 *   - When variable row heights are enabled, the scroll distance can be irregular on the transition between the final overflow and the rest
	 *     of the scroll range. Also, the final overflow cannot be scrolled row-wise, but only pixel-wise.
	 *
	 * <b>Enables touch scrolling.</b>
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
			TableUtils.addDelegate(oTable, this._delegate, oTable);

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

			if (oTable) {
				oTable.removeEventDelegate(this._delegate);
			}
			this._delegate = null;
			this._clearCache();
			internal.destroy(oTable);

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
	 * @param {boolean} [bAsync=false] Whether to set the first visible row asynchronously.
	 * @param {function} [fnBeforeScroll] Callback that is called synchronously before the property <code>firstVisibleRow</code> is set.
	 * @returns {boolean} Returns <code>true</code>, if scrolling was actually performed.
	 */
	TableScrollExtension.prototype.scrollVertically = function(bDown, bPage, bIsKeyboardScroll, bAsync, fnBeforeScroll) {
		var oTable = this.getTable();

		if (!oTable) {
			return false;
		}

		bDown = bDown === true;
		bPage = bPage === true;
		bIsKeyboardScroll = bIsKeyboardScroll === true;
		bAsync = bAsync === true;

		var bScrolled = false;
		var iTotalRowCount = oTable._getTotalRowCount();
		var mRowCounts = oTable._getRowCounts();
		var iFirstVisibleScrollableRow = oTable.getFirstVisibleRow();
		var iSize = bPage ? mRowCounts.scrollable : 1;

		if (bDown) {
			if (iFirstVisibleScrollableRow + mRowCounts.count < iTotalRowCount) {
				if (fnBeforeScroll) {
					fnBeforeScroll();
				}
				if (bAsync) {
					setTimeout(function() {
						oTable.setFirstVisibleRow(Math.min(iFirstVisibleScrollableRow + iSize, iTotalRowCount - mRowCounts.count));
					}, 0);
				} else {
					oTable.setFirstVisibleRow(Math.min(iFirstVisibleScrollableRow + iSize, iTotalRowCount - mRowCounts.count));
				}
				bScrolled = true;
			}
		} else if (iFirstVisibleScrollableRow > 0) {
			if (fnBeforeScroll) {
				fnBeforeScroll();
			}
			if (bAsync) {
				setTimeout(function() {
					oTable.setFirstVisibleRow(Math.max(iFirstVisibleScrollableRow - iSize, 0));
				}, 0);
			} else {
				oTable.setFirstVisibleRow(Math.max(iFirstVisibleScrollableRow - iSize, 0));
			}
			bScrolled = true;
		}

		if (bScrolled && bIsKeyboardScroll) {
			internal(oTable).bIsScrolledVerticallyByKeyboard = true;
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

		if (!oTable) {
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
			internal(oTable).bIsScrolledVerticallyByKeyboard = true;
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

		if (oTable && !oTable._bInvalid && !internal(oTable).oHorizontalScrollbar) {
			// If the table is invalid and about to be (re-)rendered, the scrollbar element will be removed from DOM. The reference to the new
			// scrollbar element can be obtained only after rendering.
			// Table#getDomRef (document#getElementById) returns null if the element does not exist in the DOM.
			internal(oTable).oHorizontalScrollbar = oTable.getDomRef(SharedDomRef.HorizontalScrollBar);
		}

		return internal(oTable).oHorizontalScrollbar || null;
	};

	/**
	 * Gets DOM reference of the vertical scrollbar.
	 *
	 * @param {boolean} [bIgnoreDOMConnection=false] Whether the scrollbar should also be returned if it is not connected with the DOM. This can
	 *                                               happen if the table's DOM is removed without notifying the table. For example, if the parent
	 *                                               of the table is made invisible.
	 * @returns {HTMLElement|null} Returns <code>null</code>, if the vertical scrollbar does not exist.
	 */
	TableScrollExtension.prototype.getVerticalScrollbar = function(bIgnoreDOMConnection) {
		var oTable = this.getTable();
		var bIsExternal = this.isVerticalScrollbarExternal();

		if (oTable && !oTable._bInvalid && !internal(oTable).oVerticalScrollbar) {
			// If the table is invalid and about to be (re-)rendered, the scrollbar element will be removed from DOM. The reference to the new
			// scrollbar element can be obtained only after rendering.
			// Table#getDomRef (document#getElementById) returns null if the element does not exist in the DOM.
			internal(oTable).oVerticalScrollbar = oTable.getDomRef(SharedDomRef.VerticalScrollBar);

			if (!internal(oTable).oVerticalScrollbar && bIsExternal) {
				internal(oTable).oVerticalScrollbar = internal(oTable).oExternalVerticalScrollbar;
			}
		}

		var oScrollbar = internal(oTable).oVerticalScrollbar;

		if (oScrollbar && !bIsExternal && !bIgnoreDOMConnection && !isConnected(oScrollbar)) {
			// The internal scrollbar was removed from DOM without notifying the table.
			// This can be the case, for example, if the parent of the table was made invisible.
			return null;
		}

		return oScrollbar || null;
	};

	/**
	 * Checks whether the horizontal scrollbar is visible.
	 *
	 * @returns {boolean} Returns <code>true</code>, if the horizontal scrollbar is visible.
	 */
	TableScrollExtension.prototype.isHorizontalScrollbarVisible = function() {
		var oHSb = this.getHorizontalScrollbar();
		return oHSb != null && !oHSb.classList.contains("sapUiTableHidden");
	};

	/**
	 * Checks whether the vertical scrollbar is visible.
	 *
	 * @returns {boolean} Returns <code>true</code>, if the vertical scrollbar is visible.
	 */
	TableScrollExtension.prototype.isVerticalScrollbarVisible = function() {
		var oVSb = this.getVerticalScrollbar();
		return oVSb != null && !oVSb.classList.contains("sapUiTableHidden");
	};

	/**
	 *    Checks whether the vertical scrollbar is external.
	 *
	 * @returns {boolean} Whether the vertical scrollbar is external.
	 */
	TableScrollExtension.prototype.isVerticalScrollbarExternal = function() {
		return internal(this.getTable()).bIsVerticalScrollbarExternal;
	};

	/**
	 * Marks the vertical scrollbar as external. The reference to the external scrollbar is stored in the extension to be returned by
	 * <code>TableScrollExtension#getVerticalScrollbar</code>
	 *
	 * @param {HTMLElement} oScrollbarElement The reference to the external scrollbar element.
	 */
	TableScrollExtension.prototype.markVerticalScrollbarAsExternal = function(oScrollbarElement) {
		if (oScrollbarElement) {
			internal(this.getTable()).bIsVerticalScrollbarExternal = true;
			internal(this.getTable()).oExternalVerticalScrollbar = oScrollbarElement;
		}
	};

	/**
	 * Updates the visibility, position and range of the horizontal scrollbar.
	 *
	 * @param {Object} oTableSizes The object containing the table sizes.
	 */
	TableScrollExtension.prototype.updateHorizontalScrollbar = function(oTableSizes) {
		var oTable = this.getTable();
		var oHSb = this.getHorizontalScrollbar();

		if (!oTable || !oHSb || !oTableSizes) {
			return;
		}

		// get the width of the container
		var $Table = oTable.$();
		var iColsWidth = oTableSizes.tableCtrlScrollWidth;
		if (Device.browser.safari) {
			iColsWidth = Math.max(iColsWidth, oTable._getColumnsWidth(oTable.getComputedFixedColumnCount()));
		}

		var bHorizontalScrollbarRequired = iColsWidth > oTableSizes.tableCtrlScrWidth;

		if (bHorizontalScrollbarRequired) {
			// Show the horizontal scrollbar, if it is not already visible.
			if (!this.isHorizontalScrollbarVisible()) {
				$Table.addClass("sapUiTableHScr");
				oHSb.classList.remove("sapUiTableHidden");

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

			if (oTable._bRtlMode) {
				oHSb.style.marginRight = iScrollPadding + "px";
				oHSb.style.marginLeft = "";
			} else {
				oHSb.style.marginLeft = iScrollPadding + "px";
				oHSb.style.marginRight = "";
			}

			var oHSbContent = oTable.getDomRef("hsb-content");
			if (oHSbContent) {
				oHSbContent.style.width = iColsWidth + "px";
			}
		}

		if (!bHorizontalScrollbarRequired && this.isHorizontalScrollbarVisible()) {
			// Hide the horizontal scrollbar, if it is visible.
			$Table.removeClass("sapUiTableHScr");
			oHSb.classList.add("sapUiTableHidden");
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

		if (!oTable || !oVSb) {
			return;
		}

		var iNewVerticalScrollbarHeight = this.getVerticalScrollbarHeight();

		oVSb.style.maxHeight = iNewVerticalScrollbarHeight + "px";

		if (internal(oTable).iVerticalScrollbarHeight !== iNewVerticalScrollbarHeight) {
			internal(oTable).iVerticalScrollbarHeight = iNewVerticalScrollbarHeight;

			// Since a base value for the calculations has changed, the scroll position must be adjusted to prevent unintentional changes of the
			// scroll position. The first visible row should remain stable.
			// In case of variable row heights, the exact inner scroll position cannot be restored and is therefore discarded.
			VerticalScrollingHelper.updateScrollPosition(oTable);
		}
	};

	/**
	 * Gets the height of the vertical scrollbar.
	 *
	 * @returns {int} The height of the scrollbar.
	 */
	TableScrollExtension.prototype.getVerticalScrollbarHeight = function() {
		var oTable = this.getTable();

		if (!oTable) {
			return 0;
		}

		return oTable._getRowCounts().scrollable * oTable._getBaseRowHeight();
	};

	/**
	 * Updates the position of the vertical scrollbar.
	 */
	TableScrollExtension.prototype.updateVerticalScrollbarPosition = function() {
		var oTable = this.getTable();
		var oVSb = this.getVerticalScrollbar();

		if (!oTable || !oVSb) {
			return;
		}

		var oTableCCnt = oTable.getDomRef("tableCCnt");

		if (oTableCCnt) {
			var iTop = oTableCCnt.offsetTop;

			var oVSbBg = oTable.getDomRef("vsb-bg");
			if (oVSbBg) {
				oVSbBg.style.top = iTop + "px";
			}

			if (oTable._getRowCounts().fixedTop > 0) {
				iTop += oTable._iVsbTop;
			}

			oVSb.style.top = iTop + "px";
		}
	};

	/**
	 * Updates the vertical scroll position.
	 */
	TableScrollExtension.prototype.updateVerticalScrollPosition = function() {
		VerticalScrollingHelper.updateScrollPosition(this.getTable(), undefined, ScrollTrigger.TABLE);
	};

	/**
	 * Restores the vertical scroll position.
	 */
	TableScrollExtension.prototype.restoreVerticalScrollPosition = function() {
		VerticalScrollingHelper.restoreScrollPosition(this.getTable());
	};

	/**
	 * Updates the vertical scroll height. This is the content height of the vertical scrollbar.
	 *
	 * @see TableScrollExtension#getVerticalScrollHeight
	 */
	TableScrollExtension.prototype.updateVerticalScrollHeight = function() {
		var oVSb = this.getVerticalScrollbar();
		var oVSbContent = oVSb ? oVSb.firstChild : null;

		if (!oVSbContent) {
			return;
		}

		var iNewVerticalScrollHeight = this.getVerticalScrollHeight(true);

		oVSbContent.style.height = this.getVerticalScrollHeight() + "px";

		if (internal(this.getTable()).iVerticalScrollHeight !== iNewVerticalScrollHeight) {
			internal(this.getTable()).iVerticalScrollHeight = iNewVerticalScrollHeight;

			// Since a base value for the calculations has changed, the scroll position must be adjusted to prevent unintentional changes of the
			// scroll position. In case of variable row heights, the exact inner scroll position cannot be restored and is therefore discarded.
			VerticalScrollingHelper.updateScrollPosition(this.getTable());
		}
	};

	/**
	 * Gets the vertical scroll height.
	 *
	 * @param {boolean} [bBoundless=false] If set to <code>true</code>, the exact scroll height is returned, ignoring any UI related boundaries.
	 * @returns {int} The vertical scroll height.
	 */
	TableScrollExtension.prototype.getVerticalScrollHeight = function(bBoundless) {
		var oTable = this.getTable();

		if (!oTable) {
			return 0;
		}

		var iTotalRowCount = oTable._getTotalRowCount();
		var iVisibleRowCount = oTable._getRowCounts().count;
		var iBaseRowHeight = oTable._getBaseRowHeight();
		var iRowCount;
		var iScrollHeight;

		if (TableUtils.isVariableRowHeightEnabled(oTable)) {
			iRowCount = Math.max(iTotalRowCount, iVisibleRowCount + 1);
			iScrollHeight = iBaseRowHeight * (iRowCount - 1 /* The last row is inside the buffer */)
							+ VerticalScrollingHelper.getScrollRangeBuffer(oTable);
		} else {
			iRowCount = Math.max(iTotalRowCount, iVisibleRowCount);
			iScrollHeight = iBaseRowHeight * iRowCount;
		}

		if (bBoundless === true) {
			return iScrollHeight;
		} else {
			return Math.min(MAX_VERTICAL_SCROLL_HEIGHT, iScrollHeight);
		}
	};

	/**
	 * Updates the visibility of the vertical scrollbar.
	 */
	TableScrollExtension.prototype.updateVerticalScrollbarVisibility = function() {
		var oTable = this.getTable();
		var oTableElement = oTable ? oTable.getDomRef() : null;
		var oVSb = this.getVerticalScrollbar();

		if (!oTableElement || !oVSb) {
			return;
		}

		var bVerticalScrollbarRequired = this.isVerticalScrollbarRequired();

		// Show the currently invisible scrollbar.
		if (bVerticalScrollbarRequired && !this.isVerticalScrollbarVisible()) {
			if (!this.isVerticalScrollbarExternal()) {
				oTableElement.classList.add("sapUiTableVScr");
			}
			oVSb.classList.remove("sapUiTableHidden");
		}

		// Hide the currently visible scrollbar.
		if (!bVerticalScrollbarRequired && this.isVerticalScrollbarVisible()) {
			oTableElement.classList.remove("sapUiTableVScr");
			oVSb.classList.add("sapUiTableHidden");
		}
	};

	/**
	 * Checks whether the vertical scrollbar is required.
	 *
	 * @returns {boolean} Returns <code>true</code>, if the vertical scrollbar is required.
	 */
	TableScrollExtension.prototype.isVerticalScrollbarRequired = function() {
		var oTable = this.getTable();

		if (!oTable) {
			return false;
		}

		return TableUtils.isVariableRowHeightEnabled(oTable) && VerticalScrollingHelper.getInnerScrollRange(oTable) > 0
				|| (oTable._getTotalRowCount() > oTable._getRowCounts().count);
	};

	/**
	 * Updates the vertical scroll position of the content rows in their container according to the delta of the estimated row heights to actual row
	 * heights. The table simulates the pixel-based scrolling by adjusting the vertical scroll position of the inner scrolling areas.
	 * Additionally, if there are rows which have a larger height than estimated, this will also be corrected and leads to a bigger vertical shift.
	 */
	TableScrollExtension.prototype.updateInnerVerticalScrollPosition = function() {
		var oTable = this.getTable();
		var oContentDomRef = oTable ? oTable.getDomRef("tableCCnt") : null;

		if (!TableUtils.isVariableRowHeightEnabled(oTable) || !oContentDomRef || VerticalScrollingHelper.isUpdatePending(oTable)) {
			return;
		}

		// Only update the inner scroll position if the table is not going to update the rows.
		if (oTable._getFirstRenderedRowIndex() !== oTable._iRenderedFirstVisibleRow) {
			log("updateInnerVerticalScrollPosition: Skipped, because rows will be updated", oTable);
			return;
		}

		var iInnerVerticalScrollRange = VerticalScrollingHelper.getInnerScrollRange(oTable);

		if (iInnerVerticalScrollRange === 0) {
			// Heights of empty rows are not included into the inner vertical scroll range. But because of them the inner scroll position might be
			// bigger than 0, even though the calculated range is 0, so the browser does not automatically adjust it. Therefore the inner scroll
			// position should be reset.

			log("updateInnerVerticalScrollPosition: 0", oTable);
			oTable.setFirstVisibleRow(0, true);
			this._nVerticalScrollPosition = 0;
			oContentDomRef.scrollTop = 0;
			return;
		}

		var iFirstVisibleRowIndex = oTable.getFirstVisibleRow();
		var nScrollPosition = VerticalScrollingHelper.getScrollPosition(oTable);
		var bScrollPositionInBuffer = VerticalScrollingHelper.isScrollPositionInBuffer(oTable);
		var nVirtualScrollPosition = 0;
		var iInnerScrollRange;
		var nInnerScrollPercentage;
		var iInnerScrollPosition = null;
		var aRowHeights = oTable._aRowHeights;

		if (!bScrollPositionInBuffer) {
			var nScrollRangeRowFraction = VerticalScrollingHelper.getScrollRangeRowFraction(oTable);

			nVirtualScrollPosition = nScrollPosition - (iFirstVisibleRowIndex * nScrollRangeRowFraction);
			iInnerScrollRange = aRowHeights[0];
			nInnerScrollPercentage = Math.max(0, Math.min(nVirtualScrollPosition / nScrollRangeRowFraction, 1));
			iInnerScrollPosition = Math.round(iInnerScrollRange * nInnerScrollPercentage);

		} else { // Vertical scroll position is in buffer.
			var iScrollableRows = 0;
			var iScrollableRowsHeight = 0;
			var i;

			for (i = 0; i < aRowHeights.length && iScrollableRowsHeight < iInnerVerticalScrollRange; i++) {
				iScrollableRows++;
				iScrollableRowsHeight += aRowHeights[i];
			}

			var nScrollRange = VerticalScrollingHelper.getScrollRange(oTable);
			var iBuffer = VerticalScrollingHelper.getScrollRangeBuffer(oTable);
			var nBufferRangeRowFraction = iBuffer / iScrollableRows;

			if (internal(oTable).iFirstVisibleRowInBuffer == null) {
				nVirtualScrollPosition = nScrollPosition - nScrollRange + iBuffer;
				var nFirstVisibleRowIndexInBuffer = nVirtualScrollPosition / nBufferRangeRowFraction;
				var iFirstVisibleRowIndexInBuffer;

				if (Math.ceil(nFirstVisibleRowIndexInBuffer) - nFirstVisibleRowIndexInBuffer < 0.00001) {
					iFirstVisibleRowIndexInBuffer = Math.ceil(nVirtualScrollPosition / nBufferRangeRowFraction);
				} else {
					iFirstVisibleRowIndexInBuffer =  Math.floor(nVirtualScrollPosition / nBufferRangeRowFraction);
				}
				iFirstVisibleRowIndexInBuffer = Math.min(iFirstVisibleRowIndexInBuffer, iScrollableRows);

				iInnerScrollRange = aRowHeights[iFirstVisibleRowIndexInBuffer] || 0;
				nInnerScrollPercentage = Math.max(0, Math.min((nVirtualScrollPosition - (nBufferRangeRowFraction * iFirstVisibleRowIndexInBuffer))
															  / nBufferRangeRowFraction, 1));

				for (i = 0; i < iFirstVisibleRowIndexInBuffer; i++) {
					iInnerScrollPosition += aRowHeights[i];
				}
				iInnerScrollPosition += iInnerScrollRange * nInnerScrollPercentage;
				iInnerScrollPosition = Math.min(iInnerScrollPosition, iInnerVerticalScrollRange);

				var iNewFirstVisibleRowIndex = oTable._getMaxFirstRenderedRowIndex() + iFirstVisibleRowIndexInBuffer;
				if (iNewFirstVisibleRowIndex !== iFirstVisibleRowIndex) {
					log("updateInnerVerticalScrollPosition: Set firstVisibleRow from " + iFirstVisibleRowIndex + " to " + iNewFirstVisibleRowIndex,
						oTable);
					oTable.setFirstVisibleRow(iNewFirstVisibleRowIndex, true);
				}
			} else {
				var nScrollRangeWithoutBuffer = nScrollRange - iBuffer;
				nVirtualScrollPosition = internal(oTable).iFirstVisibleRowInBuffer * nBufferRangeRowFraction;
				var nNewScrollPosition = nScrollRangeWithoutBuffer + nVirtualScrollPosition;
				nInnerScrollPercentage = 0;

				log("updateInnerVerticalScrollPosition: Set scroll position to " + nNewScrollPosition, oTable);
				VerticalScrollingHelper.updateScrollPosition(oTable, nNewScrollPosition);
				return;
			}
		}

		log("updateInnerVerticalScrollPosition: " + iInnerScrollPosition + " of " + iInnerScrollRange + " (" + (nInnerScrollPercentage * 100) + "%)"
			+ " (in buffer: " + bScrollPositionInBuffer + ")", oTable);

		oContentDomRef.scrollTop = iInnerScrollPosition;

		// Temporarily disabled. A change of the inner vertical scroll position by focus change is currently not handled.
		// As soon as this works, synchronization of the inner vertical scroll position should be triggered by the scroll extension, not by the
		// sync extension.
		// BLI: CPOUIFTEAMB-667
		//TableUtils.dynamicCall(oTable._getSyncExtension, function(oSyncExtension) {
		//	oSyncExtension.syncInnerVerticalScrollPosition(iInnerScrollPosition);
		//});
	};

	/**
	 * Adds mouse wheel event listeners to HTMLElements. Can only be used if synchronization is enabled.
	 *
	 * @param {HTMLElement[]} aEventListenerTargets The elements to add listeners to.
	 * @param {TableScrollExtension.EventListenerOptions} mOptions The options.
	 * @returns {{wheel: Function}|null} A key value map containing the event names as keys and listener functions as values.
	 */
	TableScrollExtension.prototype.registerForMouseWheel = function(aEventListenerTargets, mOptions) {
		var oTable = this.getTable();

		if (TableExtension.isEnrichedWith(oTable, "sap.ui.table.TableSyncExtension")) {
			return ScrollingHelper.addMouseWheelEventListener(aEventListenerTargets, oTable, mOptions);
		} else {
			Log.error("This method can only be used with synchronization enabled.", oTable, "TableScrollExtension#registerForMouseWheel");
			return null;
		}
	};

	/**
	 * Adds touch event listeners to HTMLElements. Can only be used if synchronization is enabled.
	 *
	 * @param {HTMLElement[]} aEventListenerTargets The elements to add listeners to.
	 * @param {TableScrollExtension.EventListenerOptions} mOptions The options.
	 * @returns {{pointerdown: Function,
	 *            pointermove: Function,
	 *            touchstart: Function,
	 *            touchmove: Function}|null} A key value map containing the event names as keys and listener functions as values.
	 */
	TableScrollExtension.prototype.registerForTouch = function(aEventListenerTargets, mOptions) {
		var oTable = this.getTable();

		if (TableExtension.isEnrichedWith(oTable, "sap.ui.table.TableSyncExtension")) {
			return ScrollingHelper.addTouchEventListener(aEventListenerTargets, oTable, mOptions);
		} else {
			Log.error("This method can only be used with synchronization enabled.", oTable, "TableScrollExtension#registerForTouch");
			return null;
		}
	};

	/**
	 * Clears the cache of this extension (e.g. DOM references).
	 *
	 * @private
	 */
	TableScrollExtension.prototype._clearCache = function() {
		// Clear cached DOM references.
		internal(this.getTable()).oVerticalScrollbar = null;
		internal(this.getTable()).oHorizontalScrollbar = null;
	};

	TableScrollExtension.ScrollDirection = ScrollDirection;

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