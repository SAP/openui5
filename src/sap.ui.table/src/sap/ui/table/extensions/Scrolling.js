/*!
 * ${copyright}
 */

// Provides helper sap.ui.table.extensions.Scrolling.
sap.ui.define([
	"./ExtensionBase",
	"../utils/TableUtils",
	"../library",
	"sap/ui/Device",
	"sap/ui/performance/trace/Interaction",
	"sap/base/Log",
	"sap/ui/thirdparty/jquery"
], function(ExtensionBase, TableUtils, library, Device, Interaction, Log, jQuery) {
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
	 * @memberOf sap.ui.table.extensions.Scrolling
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
	 * @typedef {Object} sap.ui.table.extensions.Scrolling.EventListenerOptions
	 * @property {sap.ui.table.extensions.Scrolling.ScrollDirection} scrollDirection The scroll direction.
	 * @private
	 */

	/**
	 * Writes a log message for this extension.
	 *
	 * @param {string} sMessage The message to log.
	 * @param {sap.ui.table.Table} oTable Instance of the table producing the log entry.
	 */
	function log(sMessage, oTable) {
		Log.debug("sap.ui.table.extensions.Scrolling", sMessage, oTable);
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
	 * The interface of a process.
	 *
	 * @typedef {Object} ProcessInterface
	 * @property {function} cancel Cancels the process.
	 * @property {function():boolean} isCancelled Whether the process is cancelled.
	 * @property {function(function)} addCancelListener Adds a listener that is called when the process is cancelled.
	 * @property {function():boolean} bRunning Whether the process is running.
	 * @property {function():string} getId Returns the ID of the process.
	 */

	/**
	 * Information about a process.
	 *
	 * @typedef {Object} ProcessInfo
	 * @property {string} id The id.
	 * @property {int} rank The rank.
	 * @property {boolean} cancellable Whether the process can be cancelled.
	 */

	/**
	 * A function to be executed by a <code>Process</code>.
	 *
	 * @callback Executor
	 * @param {function} fnResolve
	 * @param {function} fnReject
	 * @param {ProcessInterface} oProcessInterface
	 */

	/**
	 * Constructor for a Process.
	 *
	 * @param {Executor} fnExecutor The function to be executed.
	 * @param {ProcessInfo} oProcessInfo The process information.
	 * @returns {Promise} The process promise.
	 * @constructor
	 */
	function Process(fnExecutor, oProcessInfo) {
		var bRunning = true;
		var bCancelled = false;
		var aListeners = [];
		var oProcessInterface = {
			cancel: function() {
				if (this.isCancelled() || !this.isRunning()) {
					return;
				}

				bCancelled = true;

				for (var i = 0; i < aListeners.length; i++) {
					aListeners[i]();
				}

				log("Process cancelled: " + oProcessInfo.id);
			},
			isCancelled: function() {
				return bCancelled;
			},
			addCancelListener: function(fnCallback) {
				aListeners.push(fnCallback);
			},
			isRunning: function() {
				return bRunning;
			},
			getInfo: function() {
				return oProcessInfo;
			}
		};
		var pCancellablePromise;

		log("Process started: " + oProcessInfo.id);

		if (typeof fnExecutor === "function") {
			pCancellablePromise = new Promise(function() {
				fnExecutor.apply(this, Array.prototype.slice.call(arguments).concat(oProcessInterface));
			});
		} else {
			pCancellablePromise = Promise.resolve();
		}

		Object.assign(pCancellablePromise, oProcessInterface);

		pCancellablePromise.then(function() {
			if (oProcessInterface.isCancelled()) {
				log("Process finished due to cancellation: " + oProcessInfo.id);
			} else {
				log("Process finished: " + oProcessInfo.id);
			}
			bRunning = false;
		});

		return pCancellablePromise;
	}

	/**
	 * Scroll position
	 *
	 * @class
	 */
	function ScrollPosition() {
		this.iIndex = 0;
		this.nOffset = 0;
		this.sOffsetType = ScrollPosition.OffsetType.Pixel;
		this.bIsInitial = true;
	}

	/**
	 * Type of the buffer.
	 *
	 * @readonly
	 * @enum {string}
	 */
	ScrollPosition.OffsetType = {
		/** The offset is specified in pixels. */
		Pixel: "Pixel",
		/** The offset is specified in percentage of the row. */
		Percentage: "Percentage",
		/** The offset is specified in percentage of the buffer. */
		PercentageOfBuffer: "PercentageOfBuffer"
	};

	/**
	 * The index of the first visible element.
	 *
	 * @return {int} The index.
	 */
	ScrollPosition.prototype.getIndex = function() {
		return this.iIndex;
	};

	/**
	 * The distance that is scrolled starting from the top of the first visible element. The value is
	 * always positive. It is always an integer if it is a pixel value (e.g. 12 for 12px), and can be a float if it is a percentage value (e.g.
	 * 0.5 for 50%). A percentage value is based on the height of the first visible element and cannot be more than 100%.
	 *
	 * @return {number} The offset.
	 */
	ScrollPosition.prototype.getOffset = function() {
		return this.nOffset;
	};

	/**
	 * Gets the offset type.
	 *
	 * @return {ScrollPosition.OffsetType} The offset type.
	 */
	ScrollPosition.prototype.getOffsetType = function() {
		return this.sOffsetType;
	};

	/**
	 * Indicates whether the offset is a pixel value.
	 *
	 * @return {boolean} Whether the offset is specified in pixels.
	 */
	ScrollPosition.prototype.isOffsetInPixel = function() {
		return this.sOffsetType === ScrollPosition.OffsetType.Pixel;
	};

	/**
	 * Indicates whether the scroll position has been changed once.
	 *
	 * @return {boolean} Whether the scroll position is initial.
	 */
	ScrollPosition.prototype.isInitial = function() {
		return this.bIsInitial;
	};

	/**
	 * Sets the scroll position.
	 *
	 * @param {int} iIndex The index of the first visible element.
	 * @param {number} [nOffset=0] The distance that is scrolled starting from the top of the first visible element. The value is
	 * always positive. It is always an integer if it is a pixel value, and can be a float if it is a percentage value.
	 * @param {ScrollPosition.OffsetType} [sOffsetType=ScrollPosition.OffsetType.Pixel] The type of the offset.
	 */
	ScrollPosition.prototype.setPosition = function(iIndex, nOffset, sOffsetType) {
		log("ScrollPosition#setPosition(index: " + iIndex + ", offset: " + nOffset + ", offsetType: " + sOffsetType + ")");

		if (!ScrollPosition._isPositiveNumber(iIndex)) {
			return;
		}

		if (!ScrollPosition._isPositiveNumber(nOffset)) {
			this.nOffset = 0;
		}

		this.setIndex(iIndex);
		this.setOffset(nOffset, sOffsetType);
	};

	/**
	 * Sets the index.
	 *
	 * @param {int} iIndex The index of the first visible element.
	 */
	ScrollPosition.prototype.setIndex = function(iIndex) {
		log("ScrollPosition#setIndex(index: " + iIndex + ")");

		if (!ScrollPosition._isPositiveNumber(iIndex)) {
			return;
		}

		this.bIsInitial = false;
		this.iIndex = iIndex;
	};

	/**
	 * Sets the offset.
	 *
	 * @param {number} nOffset The distance that is scrolled starting from the top of the first visible element. The value is
	 * always positive. It is always an integer if it is a pixel value, and can be a float if it is a percentage value.
	 * @param {ScrollPosition.OffsetType} [sOffsetType=ScrollPosition.OffsetType.Pixel] The type of the offset.
	 */
	ScrollPosition.prototype.setOffset = function(nOffset, sOffsetType) {
		log("ScrollPosition#setOffset(offset: " + nOffset + ", offsetType: " + sOffsetType + ")");

		if (!ScrollPosition._isPositiveNumber(nOffset)) {
			return;
		}

		this.bIsInitial = false;
		this.sOffsetType = sOffsetType in ScrollPosition.OffsetType ? sOffsetType : ScrollPosition.OffsetType.Pixel;

		if (this.isOffsetInPixel()) {
			this.nOffset = Math.round(nOffset);
		} else {
			this.nOffset = Math.min(nOffset, 1);
		}
	};

	/**
	 * Changes the scroll position according to the specified positive or negative amount of rows. Keeps the offset, if possible. The offset is
	 * set to 0 when the scroll position is changed to the start.
	 *
	 * @param {int} iRows The number of rows to scroll.
	 */
	ScrollPosition.prototype.scrollRows = function(iRows) {
		var iNewIndex = this.getIndex() + iRows;
		var iNewOffset = this.getOffset();

		if (!this.isOffsetInPixel() || iNewIndex < 0) {
			iNewOffset = 0;
		}

		this.setPosition(Math.max(0, iNewIndex), iNewOffset);
	};

	ScrollPosition._isPositiveNumber = function(nNumber) {
		return typeof nNumber === "number" && !isNaN(nNumber) && nNumber >= 0;
	};

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
				// Horizontal scrolling
				oHorizontalScrollbar: null,
				iHorizontalScrollPosition: null,

				// Vertical scrolling
				oVerticalScrollbar: null,
				oVerticalScrollPosition: new ScrollPosition(oTable),
				bIsScrolledVerticallyByWheel: false,
				bIsScrolledVerticallyByKeyboard: false,
				pVerticalScrollUpdateProcess: null,

				// External vertical scrolling
				oExternalVerticalScrollbar: null,
				bIsVerticalScrollbarExternal: false,

				// Timers
				mTimeouts: {},
				mAnimationFrames: {},

				mTouchSessionData: null,
				aOnRowsUpdatedPreprocessors: []
			});
		}

		return internalMap.get(oTable);
	};
	internal.destroy = function(oTable) {
		delete internalMap.delete(oTable);
	};

	/**
	 * Helper for vertical scroll update processes.
	 */
	var VerticalScrollProcess = {
		UpdateFromFirstVisibleRow: {id: "UpdateFromFirstVisibleRow", rank: 6},
		UpdateFromScrollPosition: {id: "UpdateFromScrollPosition", rank: 5},
		RestoreScrollPosition: {id: "RestoreScrollPosition", rank: 4},
		AdjustToTotalRowCount: {id: "AdjustToTotalRowCount", rank: 3},
		OnRowsUpdated: {id: "OnRowsUpdated", rank: 3},
		UpdateFromScrollbar: {id: "UpdateFromScrollbar", rank: 2},
		UpdateFromViewport: {id: "UpdateFromViewport", rank: 1},

		canStart: function(oTable, oProcessInfo) {
			var pCurrentProcess = internal(oTable).pVerticalScrollUpdateProcess;
			var oCurrentProcessInfo = pCurrentProcess ? pCurrentProcess.getInfo() : null;

			if (pCurrentProcess && pCurrentProcess.isRunning() && oCurrentProcessInfo.rank > oProcessInfo.rank) {
				log("Cannot start update process " + oProcessInfo.id
					+ " - A higher-ranked update process is currently running (" + oCurrentProcessInfo.id + ")", oTable);
				return false;
			}

			return true;
		},
		start: function(oTable, oProcessInfo, fnProcessExecutor) {
			if (!VerticalScrollProcess.canStart(oTable, oProcessInfo)) {
				return null;
			}

			if (internal(oTable).pVerticalScrollUpdateProcess) {
				internal(oTable).pVerticalScrollUpdateProcess.cancel();
			}
			internal(oTable).pVerticalScrollUpdateProcess = new Process(fnProcessExecutor, oProcessInfo);

			return internal(oTable).pVerticalScrollUpdateProcess;
		}
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
		 * The scrollbar's scroll event handler.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 */
		onScrollbarScroll: function(oEvent) {
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
					HorizontalScrollingHelper.onScrollbarScroll.call(oTable, oEvent);
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
				oScrollExtension._onHorizontalScrollEventHandler = HorizontalScrollingHelper.onScrollbarScroll.bind(oTable);
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
		 * Performs all necessary steps to scroll the table based on the table's <code>firstVisibleRow</code> property.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @param {boolean} [bExpectRowsUpdatedEvent=false] Whether an update of the rows will happen.
		 */
		performUpdateFromFirstVisibleRow: function(oTable, bExpectRowsUpdatedEvent) {
			log("VerticalScrollingHelper.performUpdateFromFirstVisibleRow", oTable);

			VerticalScrollProcess.start(oTable, VerticalScrollProcess.UpdateFromFirstVisibleRow, function(resolve, reject, oProcessInterface) {
				if (bExpectRowsUpdatedEvent === true) {
					var fnOnRowsUpdatedPreprocessor = function() {
						log("VerticalScrollingHelper.performUpdateFromFirstVisibleRow (async: rows update)", oTable);
						VerticalScrollingHelper._performUpdateFromFirstVisibleRow(oTable, oProcessInterface).then(resolve);
						return false;
					};

					VerticalScrollingHelper.addOnRowsUpdatedPreprocessor(oTable, fnOnRowsUpdatedPreprocessor);

					oProcessInterface.addCancelListener(function() {
						var bRemoved = VerticalScrollingHelper.removeOnRowsUpdatedPreprocessor(oTable, fnOnRowsUpdatedPreprocessor);
						if (bRemoved) {
							resolve();
						}
					});
				} else {
					VerticalScrollingHelper._performUpdateFromFirstVisibleRow(oTable, oProcessInterface).then(resolve);
				}
			});
		},

		_performUpdateFromFirstVisibleRow: function(oTable, oProcessInterface) {
			return VerticalScrollingHelper.adjustScrollPositionToFirstVisibleRow(oTable, oProcessInterface).then(function() {
				if (VerticalScrollingHelper.isIndexInBuffer(oTable, oTable.getFirstVisibleRow())) {
					return VerticalScrollingHelper.adjustFirstVisibleRowToScrollPositionInBuffer(oTable, oProcessInterface);
				}
				return Promise.resolve();
			}).then(function() {
				return Promise.all([
					VerticalScrollingHelper.scrollViewport(oTable, oProcessInterface),
					VerticalScrollingHelper.scrollScrollbar(oTable, oProcessInterface)
				]);
			});
		},

		/**
		 * Performs all necessary steps to scroll the table based on the extension's internal scroll position.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 */
		performUpdateFromScrollPosition: function(oTable) {
			log("VerticalScrollingHelper.performUpdateFromScrollPosition", oTable);

			VerticalScrollProcess.start(oTable, VerticalScrollProcess.UpdateFromScrollPosition, function(resolve, reject, oProcessInterface) {
				VerticalScrollingHelper.adjustFirstVisibleRowToScrollPosition(oTable, null, oProcessInterface).then(function() {
					if (oProcessInterface.isCancelled()) {
						return;
					}

					var oScrollPosition = internal(oTable).oVerticalScrollPosition;

					log("VerticalScrollingHelper.performUpdateFromScrollPosition (async: firstVisibleRow update)", oTable);

					if (oScrollPosition.getIndex() > oTable.getFirstVisibleRow()) {
						// The scroll position is set too high and has to be adjusted.
						oScrollPosition.setIndex(oTable.getFirstVisibleRow());

						if (TableUtils.isVariableRowHeightEnabled(oTable)) {
							oScrollPosition.setOffset(1, ScrollPosition.OffsetType.Percentage);
						} else {
							oScrollPosition.setOffset(0);
						}
					}
				}).then(function() {
					return Promise.all([
						VerticalScrollingHelper.scrollViewport(oTable, oProcessInterface),
						VerticalScrollingHelper.scrollScrollbar(oTable, oProcessInterface)
					]);
				}).then(resolve);
			});
		},

		/**
		 * Performs all necessary steps to scroll the table based on the scrollbar's scroll position.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 */
		performUpdateFromScrollbar: function(oTable) {
			var _internal = internal(oTable);

			log("VerticalScrollingHelper.performUpdateFromScrollbar", oTable);
			clearTimeout(_internal.mTimeouts.largeDataScrolling);
			delete _internal.mTimeouts.largeDataScrolling;

			VerticalScrollProcess.start(oTable, VerticalScrollProcess.UpdateFromScrollbar, function(resolve, reject, oProcessInterface) {
				if (oTable._bLargeDataScrolling && !internal(oTable).bIsScrolledVerticallyByWheel) {
					_internal.mTimeouts.largeDataScrolling = setTimeout(function() {
						delete _internal.mTimeouts.largeDataScrolling;

						if (oTable._getScrollExtension().getVerticalScrollbar() != null) {
							log("VerticalScrollingHelper.performUpdateFromScrollbar (async: large data scrolling)", oTable);
							VerticalScrollingHelper._performUpdateFromScrollbar(oTable, oProcessInterface).then(resolve);
						} else {
							log("VerticalScrollingHelper.performUpdateFromScrollbar (async: large data scrolling): No scrollbar", oTable);
						}
					}, 300);

					oProcessInterface.addCancelListener(function() {
						if (_internal.mTimeouts.largeDataScrolling != null) {
							clearTimeout(_internal.mTimeouts.largeDataScrolling);
							delete _internal.mTimeouts.largeDataScrolling;
							resolve();
						}
					});
				} else {
					VerticalScrollingHelper._performUpdateFromScrollbar(oTable, oProcessInterface).then(resolve);
				}
			});
		},

		_performUpdateFromScrollbar: function(oTable, oProcessInterface) {
			return VerticalScrollingHelper.adjustScrollPositionToScrollbar(oTable, oProcessInterface).then(function() {
				return VerticalScrollingHelper.adjustFirstVisibleRowToScrollPosition(oTable, null, oProcessInterface);
			}).then(function() {
				if (TableUtils.isVariableRowHeightEnabled(oTable)) {
					return VerticalScrollingHelper.scrollViewport(oTable, oProcessInterface);
				}

				if (oProcessInterface.isCancelled()) {
					return Promise.resolve();
				}

				var oScrollPosition = internal(oTable).oVerticalScrollPosition;
				var iIndex = oScrollPosition.getIndex();
				var iMaxFirstRenderedRowIndex = oTable._getMaxFirstRenderedRowIndex();
				var aRowHeights = oTable._aRowHeights;

				switch (oScrollPosition.getOffsetType()) {
					case ScrollPosition.OffsetType.Percentage:
						var iTargetRowIndex = Math.max(0, Math.min(aRowHeights.length - 1, iIndex - iMaxFirstRenderedRowIndex));
						oScrollPosition.setOffset(aRowHeights[iTargetRowIndex] * oScrollPosition.getOffset());
						break;
					case ScrollPosition.OffsetType.PercentageOfBuffer:
						oScrollPosition.setOffset(0);
						break;
					default:
				}

				return Promise.resolve();
			});
		},

		/**
		 * Performs all necessary steps to scroll the table based on the viewport's scroll position.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 */
		performUpdateFromViewport: function(oTable) {
			log("VerticalScrollingHelper.performUpdateFromViewport", oTable);

			VerticalScrollProcess.start(oTable, VerticalScrollProcess.UpdateFromViewport, function(resolve, reject, oProcessInterface) {
				VerticalScrollingHelper.adjustScrollPositionToViewport(oTable, oProcessInterface).then(function() {
					return VerticalScrollingHelper.adjustFirstVisibleRowToScrollPosition(oTable, true, oProcessInterface);
				}).then(function() {
					return VerticalScrollingHelper.scrollScrollbar(oTable, oProcessInterface);
				}).then(resolve);
			});
		},

		/**
		 * The scrollbar's scroll event handler.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @see VerticalScrollingHelper.scrollScrollbar
		 */
		onScrollbarScroll: function(oEvent) {
			// For interaction detection.
			Interaction.notifyScrollEvent && Interaction.notifyScrollEvent(oEvent);

			if (!VerticalScrollProcess.canStart(this, VerticalScrollProcess.UpdateFromScrollbar)) {
				return;
			}

			if (internal(this).bIsScrolledVerticallyByKeyboard) {
				// When scrolling with the keyboard the first visible row is already correct and does not need adjustment.
				log("VerticalScrollingHelper.onScrollbarScroll: Aborted - Scrolled by keyboard", this);
				return;
			}

			// Do not scroll in action mode, if scrolling was not initiated by a keyboard action!
			// Might cause loss of user input and other undesired behavior.
			this._getKeyboardExtension().setActionMode(false);

			var nNewScrollTop = oEvent.target.scrollTop; // Can be a float if zoomed in Chrome.
			var nOldScrollTop = oEvent.target._scrollTop; // This is set in VerticalScrollingHelper.scrollScrollbar.
			var bScrollWithScrollbar = nNewScrollTop !== nOldScrollTop;

			delete oEvent.target._scrollTop;

			if (nNewScrollTop === 0 && !isConnected(oEvent.target)) {
				log("VerticalScrollingHelper.onScrollbarScroll: Scrollbar is not connected with the DOM", this);
			} else if (bScrollWithScrollbar) {
				log("VerticalScrollingHelper.onScrollbarScroll: Scroll position changed to " + nNewScrollTop + " by interaction", this);
				VerticalScrollingHelper.performUpdateFromScrollbar(this);
			} else {
				log("VerticalScrollingHelper.onScrollbarScroll: Scroll position changed to " + nNewScrollTop + " by API", this);
			}

			internal(this).bIsScrolledVerticallyByWheel = false;
		},

		/**
		 * The viewport's scroll event handler.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @see VerticalScrollingHelper.scrollViewport
		 */
		onViewportScroll: function(oEvent) {
			if (!VerticalScrollProcess.canStart(this, VerticalScrollProcess.UpdateFromViewport)) {
				return;
			}

			var nNewScrollTop = oEvent.target.scrollTop; // Can be a float if zoomed in Chrome.
			var nOldScrollTop = oEvent.target._scrollTop; // This is set in VerticalScrollingHelper.scrollViewport.

			delete oEvent.target._scrollTop;

			if (nNewScrollTop !== nOldScrollTop) {
				log("VerticalScrollingHelper.onViewportScroll: Scroll position changed to " + nNewScrollTop + " by interaction", this);
				VerticalScrollingHelper.performUpdateFromViewport(this);
			} else {
				log("VerticalScrollingHelper.onViewportScroll: Scroll position changed to " + nNewScrollTop + " by API", this);
			}
		},

		/**
		 * Adjusts the first visible row to the current scroll position.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @param {boolean} [bSuppressRendering=false] Whether the <vode>firstVisibleRow</vode> property should only be set without rendering.
		 * @param {ProcessInterface} [oProcessInterface] The interface to the process.
		 * @returns {Promise} A Promise that resolves when the first visible row of the table is set to the correct value and is rendered.
		 */
		adjustFirstVisibleRowToScrollPosition: function(oTable, bSuppressRendering, oProcessInterface) {
			if (oProcessInterface && oProcessInterface.isCancelled()) {
				return Promise.resolve();
			}

			bSuppressRendering = bSuppressRendering === true;

			var oScrollPosition = internal(oTable).oVerticalScrollPosition;
			var iNewIndex = oScrollPosition.getIndex();
			var iOldIndex = oTable.getFirstVisibleRow();
			var bNewIndexIsInBuffer = VerticalScrollingHelper.isIndexInBuffer(oTable, iNewIndex);
			var bSuppressFirstVisibleRowChangedEvent = bNewIndexIsInBuffer;

			// If the index is in the buffer, it might happen that it needs to be corrected to a lower index, depending on the row heights.
			// Therefore, prevent the firstVisibleRowChanged event in this case. It will be fired later in
			// VerticalScrollingHelper.adjustFirstVisibleRowToScrollPositionInBuffer.
			log("VerticalScrollingHelper.adjustFirstVisibleRowToScrollPosition:"
				+ " Set \"firstVisibleRow\" from " + iOldIndex + " to " + iNewIndex, oTable);
			var bExpectRowsUpdatedEvent = oTable._setFirstVisibleRowIndex(iNewIndex, true, bSuppressFirstVisibleRowChangedEvent, bSuppressRendering);

			if (!bExpectRowsUpdatedEvent) {
				if (bNewIndexIsInBuffer) {
					VerticalScrollingHelper.adjustFirstVisibleRowToScrollPositionInBuffer(oTable, true, bSuppressRendering);
				}
				return Promise.resolve();
			}

			return new Promise(function(resolve) {
				var fnOnRowsUpdatedPreprocessor = function(oEvent) {
					log("VerticalScrollingHelper.adjustFirstVisibleRowToScrollPosition (async: rows updated):"
						+ " Reason " + oEvent.getParameters().reason, this);
					if (bNewIndexIsInBuffer) {
						VerticalScrollingHelper.adjustFirstVisibleRowToScrollPositionInBuffer(oTable, true);
					}
					resolve();
					return false;
				};

				VerticalScrollingHelper.addOnRowsUpdatedPreprocessor(oTable, fnOnRowsUpdatedPreprocessor);

				if (oProcessInterface) {
					oProcessInterface.addCancelListener(function() {
						var bRemoved = VerticalScrollingHelper.removeOnRowsUpdatedPreprocessor(oTable, fnOnRowsUpdatedPreprocessor);
						if (bRemoved) {
							resolve();
						}
					});
				}
			});
		},

		/**
		 * Adjusts the first visible row to the current scroll position if it is in the buffer. The buffer is reserved to scroll the final
		 * overflow whose actual size is only known when the table is scrolled to the bottom. In this case, this method completes adjusting the
		 * <code>firstVisibleRow</code> property of the table to the scroll position.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @param {boolean} [bForceFirstVisibleRowChangedEvent=false] Whether to fire the <code>firstVisibleRowChanged</code> event of the table,
		 * @param {boolean} [bSuppressRendering=false] Whether the <vode>firstVisibleRow</vode> property should only be set without rendering.
		 * regardless of whether the first visible row has changed.
		 * @param {ProcessInterface} [oProcessInterface] The interface to the process.
		 * @returns {Promise} A Promise that resolves when the first visible row of the table is set to the correct value.
		 */
		adjustFirstVisibleRowToScrollPositionInBuffer: function(oTable, bForceFirstVisibleRowChangedEvent, bSuppressRendering,
																oProcessInterface) {
			if (oProcessInterface && oProcessInterface.isCancelled()) {
				return Promise.resolve();
			}

			bForceFirstVisibleRowChangedEvent = bForceFirstVisibleRowChangedEvent === true;
			bSuppressRendering = bSuppressRendering === true;

			var oScrollPosition = internal(oTable).oVerticalScrollPosition;
			var iIndex = oScrollPosition.getIndex();

			if (!VerticalScrollingHelper.isIndexInBuffer(oTable, iIndex)) {
				log("VerticalScrollingHelper.adjustFirstVisibleRowToScrollPositionInBuffer:"
					+ " Aborted - Scroll position is not in buffer", oTable);
				return Promise.resolve();
			}

			var iNewIndex = iIndex;
			var iViewportScrollRange = VerticalScrollingHelper.getScrollRangeOfViewport(oTable);
			var iMaxFirstRenderedRowIndex = oTable._getMaxFirstRenderedRowIndex();
			var aRowHeights = oTable._aRowHeights;
			var iRowIndex;

			log("VerticalScrollingHelper.adjustFirstVisibleRowToScrollPositionInBuffer");

			if (oScrollPosition.getOffsetType() === ScrollPosition.OffsetType.PercentageOfBuffer) {
				var nRemaining = iViewportScrollRange * oScrollPosition.getOffset();

				iNewIndex = iMaxFirstRenderedRowIndex;

				for (iRowIndex = 0; iRowIndex < aRowHeights.length; iRowIndex++) {
					var nRemainingTemp = nRemaining - aRowHeights[iRowIndex];

					if (nRemainingTemp >= 0) {
						nRemaining = nRemainingTemp;
						iNewIndex++;
					} else {
						break;
					}
				}
			} else {
				var iTargetRowIndex = Math.max(0, Math.min(aRowHeights.length - 1, iIndex - iMaxFirstRenderedRowIndex));
				var iViewportVirtualScrollTop = 0;

				for (iRowIndex = 0; iRowIndex < iTargetRowIndex; iRowIndex++) {
					iViewportVirtualScrollTop += aRowHeights[iRowIndex];

					if (iViewportVirtualScrollTop > iViewportScrollRange) {
						// The index is too high. It is not possible to scroll down so far that the row at this index is shown on top.
						iNewIndex = iMaxFirstRenderedRowIndex + iRowIndex;
						break;
					}
				}
			}

			if (bForceFirstVisibleRowChangedEvent) {
				oTable.setProperty("firstVisibleRow", -1, true);
			}

			if (iIndex !== iNewIndex || bForceFirstVisibleRowChangedEvent) {
				log("VerticalScrollingHelper.adjustFirstVisibleRowToScrollPositionInBuffer:"
					+ " Set \"firstVisibleRow\" to " + iNewIndex, oTable);
				oTable._setFirstVisibleRowIndex(iNewIndex, true, null, bSuppressRendering);
			}

			return Promise.resolve();
		},

		/**
		 * Adjusts the scroll position to the <code>firstVisibleRow</code> property of the table.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @param {ProcessInterface} [oProcessInterface] The interface to the process.
		 * @returns {Promise} A Promise that resolves when the scroll position is adjusted to the first visible row.
		 */
		adjustScrollPositionToFirstVisibleRow: function(oTable, oProcessInterface) {
			if (oProcessInterface && oProcessInterface.isCancelled()) {
				return Promise.resolve();
			}

			log("VerticalScrollingHelper.adjustScrollPositionToFirstVisibleRow", oTable);
			internal(oTable).oVerticalScrollPosition.setPosition(oTable.getFirstVisibleRow());

			return Promise.resolve();
		},

		/**
		 * Adjusts the scroll position to the scroll position of the scrollbar.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @param {ProcessInterface} [oProcessInterface] The interface to the process.
		 * @returns {Promise} A Promise that resolves when the scroll position is adjusted to the scrollbar.
		 */
		adjustScrollPositionToScrollbar: function(oTable, oProcessInterface) {
			if (oProcessInterface && oProcessInterface.isCancelled()) {
				return Promise.resolve();
			}

			var oScrollPosition = internal(oTable).oVerticalScrollPosition;
			var nScrollbarScrollTop = VerticalScrollingHelper.getScrollPositionOfScrollbar(oTable);
			var iScrollRange = VerticalScrollingHelper.getScrollRange(oTable);
			var nScrollRangeRowFraction = VerticalScrollingHelper.getScrollRangeRowFraction(oTable);
			var iNewIndex = 0;
			var nNewOffset = 0;
			var sNewOffsetType = ScrollPosition.OffsetType.Percentage;
			var nIndex;

			log("VerticalScrollingHelper.adjustScrollPositionToScrollbar", oTable);

			if (TableUtils.isVariableRowHeightEnabled(oTable)) {
				if (VerticalScrollingHelper.isScrollPositionOfScrollbarInBuffer(oTable)) {
					var iBuffer = VerticalScrollingHelper.getScrollRangeBuffer(oTable);
					var iScrollRangeWithoutBuffer = iScrollRange - iBuffer;
					var nScrolledBuffer = nScrollbarScrollTop - iScrollRangeWithoutBuffer;
					var nScrolledBufferPercentage = nScrolledBuffer / iBuffer;

					iNewIndex = oTable._getMaxFirstRenderedRowIndex();

					if (VerticalScrollingHelper.isIndexInBuffer(oTable, oScrollPosition.getIndex())) {
						var iViewportScrollRange = VerticalScrollingHelper.getScrollRangeOfViewport(oTable);
						var nRemaining = iViewportScrollRange * nScrolledBufferPercentage;
						var aRowHeights = oTable._aRowHeights;

						for (var iRowIndex = 0; iRowIndex < aRowHeights.length; iRowIndex++) {
							var nRemainingTemp = nRemaining - aRowHeights[iRowIndex];

							if (nRemainingTemp >= 0) {
								nRemaining = nRemainingTemp;
								iNewIndex++;
							} else {
								nNewOffset = Math.round(nRemaining);
								sNewOffsetType = ScrollPosition.OffsetType.Pixel;
								break;
							}
						}
					} else {
						nNewOffset = nScrolledBufferPercentage;
						sNewOffsetType = ScrollPosition.OffsetType.PercentageOfBuffer;
					}
				} else {
					nIndex = nScrollbarScrollTop / nScrollRangeRowFraction;
					iNewIndex = Math.floor(nIndex);
					nNewOffset = nIndex - iNewIndex;
				}
			} else {
				// Calculation of the row index can be inaccurate if scrolled to the end. This can happen due to rounding errors in case of
				// large data or when zoomed in Chrome. In this case the table cannot be scrolled to the last row. To overcome this issue, we
				// consider the table to be scrolled to the end if the scroll position is less than 1 pixel away from the maximum.
				var nDistanceToMaximumScrollPosition = iScrollRange - nScrollbarScrollTop;
				var bScrolledToBottom = nDistanceToMaximumScrollPosition < 1;

				if (bScrolledToBottom) {
					iNewIndex = oTable._getMaxFirstVisibleRowIndex();
					nNewOffset = 0;
					sNewOffsetType = ScrollPosition.OffsetType.Pixel;
				} else {
					nIndex = nScrollbarScrollTop / nScrollRangeRowFraction;
					iNewIndex = Math.floor(nIndex);
					nNewOffset = nIndex - iNewIndex;
				}
			}

			oScrollPosition.setPosition(iNewIndex, nNewOffset, sNewOffsetType);

			return Promise.resolve();
		},

		/**
		 * Adjusts the scroll position to the scroll position of the viewport.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @param {ProcessInterface} [oProcessInterface] The interface to the process.
		 * @returns {Promise} A Promise that resolves when the scroll position is adjusted to the scrollbar.
		 */
		adjustScrollPositionToViewport: function(oTable, oProcessInterface) {
			if (oProcessInterface && oProcessInterface.isCancelled()) {
				return Promise.resolve();
			}

			var oScrollPosition = internal(oTable).oVerticalScrollPosition;
			var aRowHeights = oTable._aRowHeights;
			var iNewIndex = oTable._iRenderedFirstVisibleRow;
			var iNewOffset = 0;
			var nRemaining = VerticalScrollingHelper.getScrollPositionOfViewport(oTable);

			log("VerticalScrollingHelper.adjustScrollPositionToViewport", oTable);

			for (var iRowIndex = 0; iRowIndex < aRowHeights.length; iRowIndex++) {
				var nRemainingTemp = nRemaining - aRowHeights[iRowIndex];

				if (nRemainingTemp >= 0) {
					nRemaining = nRemainingTemp;
					iNewIndex++;
				} else {
					iNewOffset = Math.round(nRemaining);
					break;
				}
			}

			oScrollPosition.setPosition(iNewIndex, iNewOffset);

			return Promise.resolve();
		},

		/**
		 * Scrolls the viewport to match the scroll position. Adjusts the scroll position if the viewport cannot be scrolled to match the scroll
		 * position.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @param {ProcessInterface} [oProcessInterface} The interface to the process.
		 * @returns {Promise} A Promise that resolves when <code>scrollTop</code> of the viewport was set.
		 */
		scrollViewport: function(oTable, oProcessInterface) {
			if (oProcessInterface && oProcessInterface.isCancelled()) {
				return Promise.resolve();
			}

			var oScrollPosition = internal(oTable).oVerticalScrollPosition;
			var oViewport = oTable.getDomRef("tableCCnt");
			var iScrollRange = VerticalScrollingHelper.getScrollRangeOfViewport(oTable);
			var aRowHeights = oTable._aRowHeights;

			if (!TableUtils.isVariableRowHeightEnabled(oTable) || !oViewport) {
				log("VerticalScrollingHelper.scrollViewport: Aborted - Guard clause not passed", oTable);
				return Promise.resolve();
			}

			// Only update the scroll position of the viewport if no update is scheduled.
			if (oTable._getFirstRenderedRowIndex() !== oTable._iRenderedFirstVisibleRow) {
				log("VerticalScrollingHelper.scrollViewport: Aborted - Rows will be updated", oTable);
				return Promise.resolve();
			}

			if (iScrollRange === 0) {
				// Heights of empty rows are not included into the inner vertical scroll range. But because of them, the scroll position may be
				// greater than 0, even though the calculated range is 0, so the browser does not automatically adjust it. Therefore, the inner scroll
				// position should be reset.

				log("VerticalScrollingHelper.scrollViewport: No overflow in viewport - Scroll to 0", oTable);
				oTable._setFirstVisibleRowIndex(0, true);
				oScrollPosition.setPosition(0);
				oViewport.scrollTop = 0;

				return Promise.resolve();
			}

			var iIndex = oScrollPosition.getIndex();
			var iMaxFirstRenderedRowIndex = oTable._getMaxFirstRenderedRowIndex();
			var iScrollTop = 0;
			var iTargetRowIndex = 0;
			var iRowIndex;

			log("VerticalScrollingHelper.scrollViewport");

			switch (oScrollPosition.getOffsetType()) {
				case ScrollPosition.OffsetType.Pixel:
				case ScrollPosition.OffsetType.Percentage:
					if (VerticalScrollingHelper.isIndexInBuffer(oTable, iIndex)) {
						var iVirtualScrollTop = 0;

						iTargetRowIndex = Math.max(0, Math.min(aRowHeights.length - 1, iIndex - iMaxFirstRenderedRowIndex));

						for (iRowIndex = 0; iRowIndex < iTargetRowIndex; iRowIndex++) {
							iVirtualScrollTop += aRowHeights[iRowIndex];

							if (iVirtualScrollTop > iScrollRange) {
								// The index is too high. It is not possible to scroll down so far that the row at this index is shown on top.
								oScrollPosition.setPosition(iMaxFirstRenderedRowIndex + iRowIndex, iScrollRange - iScrollTop);
								iTargetRowIndex = iRowIndex;
								break;
							} else {
								iScrollTop = iVirtualScrollTop;
							}
						}
					}

					if (oScrollPosition.isOffsetInPixel()) {
						// The offset may not be larger than the row.
						oScrollPosition.setOffset(Math.min(oScrollPosition.getOffset(), aRowHeights[iTargetRowIndex]));
					} else {
						oScrollPosition.setOffset(aRowHeights[iTargetRowIndex] * oScrollPosition.getOffset());
					}

					iScrollTop += oScrollPosition.getOffset();

					if (iScrollTop > iScrollRange) {
						oScrollPosition.setOffset(oScrollPosition.getOffset() - (iScrollTop - iScrollRange));
						iScrollTop = iScrollRange;
					}
					break;
				case ScrollPosition.OffsetType.PercentageOfBuffer:
					if (!VerticalScrollingHelper.isIndexInBuffer(oTable, iIndex)) {
						oScrollPosition.setOffset(0);
						break;
					}

					var nRemaining = iScrollRange * oScrollPosition.getOffset();

					iScrollTop = Math.round(nRemaining);

					for (iRowIndex = 0; iRowIndex < aRowHeights.length; iRowIndex++) {
						var nRemainingTemp = nRemaining - aRowHeights[iRowIndex];

						if (nRemainingTemp >= 0) {
							nRemaining = nRemainingTemp;
							iTargetRowIndex++;
						} else {
							oScrollPosition.setPosition(iMaxFirstRenderedRowIndex + iTargetRowIndex, Math.round(nRemaining));
							break;
						}
					}
					break;
				default:
			}

			log("VerticalScrollingHelper.scrollViewport: Scroll from " + oViewport.scrollTop + " to " + iScrollTop, oTable);
			if (oViewport.scrollTop !== iScrollTop) {
				oViewport.scrollTop = iScrollTop;
				oViewport._scrollTop = oViewport.scrollTop;
			}

			return Promise.resolve();
		},

		/**
		 * Scrolls the scrollbar to match the scroll position.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @param {ProcessInterface} [oProcessInterface} The interface to the process.
		 * @returns {Promise} A Promise that resolves when <code>scrollTop</code> of the scrollbar was set.
		 */
		scrollScrollbar: function(oTable, oProcessInterface) {
			if (oProcessInterface && oProcessInterface.isCancelled()) {
				return Promise.resolve();
			}

			var _internal = internal(oTable);
			var oScrollPosition = _internal.oVerticalScrollPosition;
			var iIndex = oScrollPosition.getIndex();
			var iBuffer = VerticalScrollingHelper.getScrollRangeBuffer(oTable);
			var iScrollRange = VerticalScrollingHelper.getScrollRange(oTable);
			var iScrollRangeWithoutBuffer = iScrollRange - iBuffer;
			var nScrollPosition = 0;
			var iScrollTop = 0;
			var iViewportScrollRange = VerticalScrollingHelper.getScrollRangeOfViewport(oTable);
			var aRowHeights = oTable._aRowHeights;
			var iTargetRowIndex;

			log("VerticalScrollingHelper.scrollScrollbar", oTable);

			if (iScrollRange === 0 || aRowHeights.length === 0) {
				log("VerticalScrollingHelper.scrollScrollbar: No scrollable content", oTable);
				return Promise.resolve();
			}

			switch (oScrollPosition.getOffsetType()) {
				case ScrollPosition.OffsetType.Pixel:
				case ScrollPosition.OffsetType.Percentage:
					if (VerticalScrollingHelper.isIndexInBuffer(oTable, iIndex)) {
						var iVirtualViewportScrollTop = 0;

						iTargetRowIndex = Math.max(0, Math.min(aRowHeights.length - 1, iIndex - oTable._getMaxFirstRenderedRowIndex()));

						for (var iRowIndex = 0; iRowIndex < iTargetRowIndex; iRowIndex++) {
							iVirtualViewportScrollTop += aRowHeights[iRowIndex];
						}

						if (oScrollPosition.isOffsetInPixel()) {
							iVirtualViewportScrollTop += Math.min(aRowHeights[iTargetRowIndex], oScrollPosition.getOffset());
						} else {
							iVirtualViewportScrollTop += aRowHeights[iTargetRowIndex] * oScrollPosition.getOffset();
						}

						var nScrolledBufferPercentage = Math.min(iVirtualViewportScrollTop / iViewportScrollRange, 1);
						var nScrolledBuffer = iBuffer * nScrolledBufferPercentage;

						nScrollPosition = iScrollRangeWithoutBuffer + nScrolledBuffer;
					} else {
						var nScrollRangeRowFraction = VerticalScrollingHelper.getScrollRangeRowFraction(oTable);

						nScrollPosition = iIndex * nScrollRangeRowFraction;

						if (oScrollPosition.isOffsetInPixel()) {
							iTargetRowIndex = Math.max(0, Math.min(aRowHeights.length - 1, iIndex - oTable._iRenderedFirstVisibleRow));
							nScrollPosition += nScrollRangeRowFraction * Math.min(oScrollPosition.getOffset() / aRowHeights[iTargetRowIndex], 1);
						} else {
							nScrollPosition += nScrollRangeRowFraction * oScrollPosition.getOffset();
						}
					}

					break;
				case ScrollPosition.OffsetType.PercentageOfBuffer:
					if (VerticalScrollingHelper.isIndexInBuffer(oTable, iIndex)) {
						nScrollPosition = iScrollRangeWithoutBuffer + Math.round(iViewportScrollRange * oScrollPosition.getOffset());
					}
					break;
				default:
			}

			// As soon as the scroll position is > 0, scrollTop must be set to 1. Otherwise the user cannot scroll back to the first row with
			// the scrollbar. The same applies vice versa if the scroll position is at the bottom.
			if (nScrollPosition > 0 && nScrollPosition < 0.5) {
				iScrollTop = 1;
			} else if (nScrollPosition >= iScrollRange - 0.5 && nScrollPosition < iScrollRange) {
				iScrollTop = iScrollRange - 1;
			} else {
				iScrollTop = Math.round(nScrollPosition);
			}

			window.cancelAnimationFrame(_internal.mAnimationFrames.verticalScrollbarUpdate);
			delete _internal.mAnimationFrames.verticalScrollbarUpdate;

			return new Promise(function(resolve) {
				_internal.mAnimationFrames.verticalScrollbarUpdate = window.requestAnimationFrame(function() {
					var oVSb = oTable._getScrollExtension().getVerticalScrollbar();

					delete _internal.mAnimationFrames.verticalScrollbarUpdate;

					if (oVSb) {
						log("VerticalScrollingHelper.scrollScrollbar (async): Scroll from " + oVSb.scrollTop + " to " + iScrollTop, oTable);
						oVSb.scrollTop = iScrollTop;
						oVSb._scrollTop = oVSb.scrollTop;
					} else {
						log("VerticalScrollingHelper.scrollScrollbar (async): Not scrolled - No scrollbar available", oTable);
					}

					resolve();
				});

				if (oProcessInterface) {
					oProcessInterface.addCancelListener(function() {
						if (_internal.mAnimationFrames.verticalScrollbarUpdate != null) {
							window.cancelAnimationFrame(_internal.mAnimationFrames.verticalScrollbarUpdate);
							delete _internal.mAnimationFrames.verticalScrollbarUpdate;
							resolve();
						}
					});
				}
			});
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
		 * Gets the current scroll position of the vertical scrollbar.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @returns {number} The vertical scroll position.
		 */
		getScrollPositionOfScrollbar: function(oTable) {
			var oScrollExtension = oTable._getScrollExtension();

			if (oScrollExtension.isVerticalScrollbarVisible()) {
				return oScrollExtension.getVerticalScrollbar().scrollTop;
			} else {
				return 0;
			}
		},

		/**
		 * Gets the current scroll position of the viewport.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @returns {number} The scroll position.
		 */
		getScrollPositionOfViewport: function(oTable) {
			var oViewport = oTable ? oTable.getDomRef("tableCCnt") : null;
			return oViewport ? oViewport.scrollTop : 0;
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
		 * Checks whether the scroll position of the scrollbar is in the buffer that is reserved to scroll the final overflow.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @returns {boolean} Returns <code>true</code>, if the scroll position is in the buffer.
		 */
		isScrollPositionOfScrollbarInBuffer: function(oTable) {
			if (!TableUtils.isVariableRowHeightEnabled(oTable)) {
				return false;
			}

			var iScrollRange = VerticalScrollingHelper.getScrollRange(oTable);
			var nScrollPosition = VerticalScrollingHelper.getScrollPositionOfScrollbar(oTable);
			var iScrollRangeBuffer = VerticalScrollingHelper.getScrollRangeBuffer(oTable);

			return iScrollRange - nScrollPosition <= iScrollRangeBuffer;
		},

		/**
		 * Checks whether the index is in the buffer that is reserved to scroll the final overflow.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @param {int} iIndex The index to check.
		 * @return {boolean} Whether the index is in the buffer.
		 */
		isIndexInBuffer: function(oTable, iIndex) {
			if (!TableUtils.isVariableRowHeightEnabled(oTable)) {
				return false;
			}

			return iIndex >= oTable._getMaxFirstRenderedRowIndex();
		},

		/**
		 * Gets the inner vertical scroll range. This is the amount of pixels that the rows overflow their container.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @returns {int} The inner vertical scroll range.
		 */
		getScrollRangeOfViewport: function(oTable) {
			if (!oTable || !oTable._aRowHeights) {
				return 0;
			}

			var aRowHeights = oTable._aRowHeights;
			var iViewportHeight = oTable._getBaseRowHeight() * oTable._getRowCounts().count;

			// Only sum rows filled with data, ignore empty rows.
			if (oTable._getRowCounts().count >= oTable._getTotalRowCount()) {
				aRowHeights = aRowHeights.slice(0, oTable._getTotalRowCount());
			}

			var iInnerVerticalScrollRange = aRowHeights.reduce(function(a, b) { return a + b; }, 0) - iViewportHeight;
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
		 * Adds an event handler that is called before the <code>VerticalScrollingHelper.onRowsUpdated</code> handler. The event object is passed
		 * as the first argument. A preprocessor is called only once and is then removed automatically. If the preprocessor returns false, the
		 * <code>onRowsUpdated</code> handler will not be executed.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @param {Function} fnPreprocessor The function to call.
		 * @private
		 */
		addOnRowsUpdatedPreprocessor: function(oTable, fnPreprocessor) {
			internal(oTable).aOnRowsUpdatedPreprocessors.push(fnPreprocessor);
		},

		/**
		 * Removes an <code>VerticalScrollingHelper.onRowsUpdated</code> preprocessor. Returns <code>true</code>, if <code>fnPreprocessor</code>
		 * is removed. Removes all preprocessors if no preprocessor is specified.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @param {Function} [fnPreprocessor] The preprocessor to remove.
		 * @returns {boolean} Whether <code>fnPreprocessor</code> was removed. Always returns <code>false</code> if <code>fnPreprocessor</code>
		 *                    is not specified.
		 * @private
		 */
		removeOnRowsUpdatedPreprocessor: function(oTable, fnPreprocessor) {
			if (!fnPreprocessor) {
				internal(oTable).aOnRowsUpdatedPreprocessors = [];
				return false;
			}

			var iIndex = internal(oTable).aOnRowsUpdatedPreprocessors.indexOf(fnPreprocessor);

			if (iIndex > -1) {
				internal(oTable).aOnRowsUpdatedPreprocessors.splice(iIndex, 1);
				return true;
			}

			return false;
		},

		/**
		 * Handles the <code>Table#_rowsUpdated</code> event.
		 *
		 * @param {Object} oEvent The event object.
		 * @private
		 */
		onRowsUpdated: function(oEvent) {
			log("VerticalScrollingHelper.onRowsUpdated: Reason " + oEvent.getParameters().reason, this);

			if (internal(this).aOnRowsUpdatedPreprocessors.length > 0) {
				log("VerticalScrollingHelper.onRowsUpdated (preprocessors)", this);

				var bExecuteDefault = internal(this).aOnRowsUpdatedPreprocessors.reduce(function(bExecuteDefault, fnPreprocessor) {
					var _bExecuteDefault = fnPreprocessor.call(this, oEvent);
					return !(bExecuteDefault && !_bExecuteDefault);
				}, true);

				VerticalScrollingHelper.removeOnRowsUpdatedPreprocessor(this);

				if (!bExecuteDefault) {
					log("VerticalScrollingHelper.onRowsUpdated (preprocessors): Default prevented", this);
					return;
				}
			}

			if (!TableUtils.isVariableRowHeightEnabled(this)) {
				log("VerticalScrollingHelper.onRowsUpdated: Aborted - Variable row heights not enabled", this);
				return;
			}

			VerticalScrollProcess.start(this, VerticalScrollProcess.OnRowsUpdated, function(resolve, reject, oProcessInterface) {
				VerticalScrollingHelper.scrollViewport(this, oProcessInterface).then(function() {
					return Promise.all([
						VerticalScrollingHelper.adjustFirstVisibleRowToScrollPosition(this, true, oProcessInterface),
						VerticalScrollingHelper.scrollScrollbar(this, oProcessInterface)
					]);
				}.bind(this)).then(resolve);
			}.bind(this));
		},

		/**
		 * This function can be used to restore the last vertical scroll position which has been stored.
		 * In case there is no stored scroll position, the scroll position is calculated depending on the value of <code>firstVisibleRow</code>.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @param {boolean} [bExpectRowsUpdatedEvent=false] Whether an update of the rows will happen.
		 */
		restoreScrollPosition: function(oTable, bExpectRowsUpdatedEvent) {
			log("VerticalScrollingHelper.restoreScrollPosition", oTable);

			var pProcess = VerticalScrollProcess.start(oTable, VerticalScrollProcess.RestoreScrollPosition, function(resolve, reject, oProcessInterface) {
				if (bExpectRowsUpdatedEvent !== true) {
					resolve(oProcessInterface);
					return;
				}

				var fnOnRowsUpdatedPreprocessor = function() {
					log("VerticalScrollingHelper.restoreScrollPosition (async: rows updated)", oTable);
					resolve(oProcessInterface);
					return false;
				};

				VerticalScrollingHelper.addOnRowsUpdatedPreprocessor(oTable, fnOnRowsUpdatedPreprocessor);

				oProcessInterface.addCancelListener(function() {
					var bRemoved = VerticalScrollingHelper.removeOnRowsUpdatedPreprocessor(oTable, fnOnRowsUpdatedPreprocessor);
					if (bRemoved) {
						resolve(oProcessInterface);
					}
				});
			});

			if (pProcess) {
				pProcess.then(function(oProcessInterface) {
					if (!oProcessInterface.isCancelled()) {
						VerticalScrollingHelper._restoreScrollPosition(oTable);
					}
				});
			}
		},

		_restoreScrollPosition: function(oTable) {
			var oScrollPosition = internal(oTable).oVerticalScrollPosition;
			var bScrollPositionIsInitial = oScrollPosition.isInitial();

			log("VerticalScrollingHelper.restoreScrollPosition: "
				+ "Scroll position is" + (bScrollPositionIsInitial ? " " : " not ") + "initial", oTable);

			if (bScrollPositionIsInitial) {
				VerticalScrollingHelper.performUpdateFromFirstVisibleRow(oTable);
			} else {
				VerticalScrollingHelper.performUpdateFromScrollPosition(oTable);
			}
		},

		adjustToTotalRowCount: function(oTable) {
			log("VerticalScrollingHelper.adjustToTotalRowCount", oTable);

			var oScrollExtension = oTable._getScrollExtension();
			oScrollExtension.updateVerticalScrollbarVisibility();
			oScrollExtension.updateVerticalScrollHeight();

			var pProcess = VerticalScrollProcess.start(oTable, VerticalScrollProcess.AdjustToTotalRowCount, function(resolve, reject, oProcessInterface) {
				if (internal(oTable).oVerticalScrollPosition.isInitial()) {
					resolve(oProcessInterface);
				} else {
					var fnOnRowsUpdatedPreprocessor = function() {
						log("VerticalScrollingHelper.adjustToTotalRowCount (async: rows updated)", oTable);
						resolve(oProcessInterface);
						return false;
					};

					VerticalScrollingHelper.addOnRowsUpdatedPreprocessor(oTable, fnOnRowsUpdatedPreprocessor);

					oProcessInterface.addCancelListener(function() {
						var bRemoved = VerticalScrollingHelper.removeOnRowsUpdatedPreprocessor(oTable, fnOnRowsUpdatedPreprocessor);
						if (bRemoved) {
							resolve(oProcessInterface);
						}
					});
				}
			});

			if (pProcess) {
				pProcess.then(function(oProcessInterface) {
					if (oProcessInterface.isCancelled() || internal(oTable).oVerticalScrollPosition.isInitial()) {
						return;
					}

					// TODO: Avoid usage of scrollViewport.
					VerticalScrollingHelper.scrollViewport(oTable);
					VerticalScrollingHelper.performUpdateFromScrollPosition(oTable);
				});
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
			var oViewport = oTable.getDomRef("tableCCnt");

			if (!oScrollExtension._onVerticalScrollEventHandler) {
				oScrollExtension._onVerticalScrollEventHandler = VerticalScrollingHelper.onScrollbarScroll.bind(oTable);
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

			if (oViewport) {
				if (!oScrollExtension._onViewportScrollEventHandler) {
					oScrollExtension._onViewportScrollEventHandler = VerticalScrollingHelper.onViewportScroll.bind(oTable);
				}
				oViewport.addEventListener("scroll", oScrollExtension._onViewportScrollEventHandler);
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
			var oViewport = oTable.getDomRef("tableCCnt");

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

			if (oViewport && oScrollExtension._onViewportScrollEventHandler) {
				oViewport.removeEventListener("scroll", oScrollExtension._onViewportScrollEventHandler);
				delete oScrollExtension._onViewportScrollEventHandler;
			}

			oTable.detachEvent("_rowsUpdated", VerticalScrollingHelper.onRowsUpdated);
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
		 * @param {sap.ui.table.extensions.Scrolling.EventListenerOptions} mOptions The options.
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

				if (oEvent.deltaMode !== window.WheelEvent.DOM_DELTA_PIXEL) {
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
				var oVerticalScrollPosition = internal(this).oVerticalScrollPosition;

				if (bScrollingForward) {
					bScrolledToEnd = oVSb.scrollTop === oVSb.scrollHeight - oVSb.offsetHeight;
				} else {
					bScrolledToEnd = oVSb.scrollTop === 0;
				}

				if (!oScrollExtension.isVerticalScrollbarVisible() || bScrolledToEnd) {
					return;
				}
				oEvent.preventDefault();
				oEvent.stopPropagation();

				if (oEvent.deltaMode === window.WheelEvent.DOM_DELTA_PIXEL) {
					var nRowsToScroll = iScrollDelta / this._getDefaultRowHeight();

					// Always scroll full rows.
					// This is not perfect in case of variable row heights, but perfect pixel-wise scrolling requires a different DOM structure.
					if (nRowsToScroll >= 0) {
						oVerticalScrollPosition.scrollRows(Math.max(1, Math.floor(nRowsToScroll)));
					} else {
						oVerticalScrollPosition.scrollRows(Math.min(-1, Math.ceil(nRowsToScroll)));
					}
				} else if (oEvent.deltaMode === window.WheelEvent.DOM_DELTA_LINE) {
					oVerticalScrollPosition.scrollRows(iScrollDelta);
				} else if (oEvent.deltaMode === window.WheelEvent.DOM_DELTA_PAGE) {
					// For simplicity, we assume a page is always the row count.
					// This is not perfect in case of variable row heights, but perfect pixel-wise scrolling requires a different DOM structure.
					oVerticalScrollPosition.scrollRows(iScrollDelta * this._getRowCounts().count);
				}

				internal(this).bIsScrolledVerticallyByWheel = true;
				internal(this).bIsScrolledVerticallyByKeyboard = false;

				this._getKeyboardExtension().setActionMode(false);

				VerticalScrollingHelper.performUpdateFromScrollPosition(this);
			}
		},

		/**
		 * Handles touch start events.
		 *
		 * @param {sap.ui.table.extensions.Scrolling.EventListenerOptions} mOptions The options.
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
		 * @param {sap.ui.table.extensions.Scrolling.EventListenerOptions} mOptions The options.
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
		 * @param {sap.ui.table.extensions.Scrolling.EventListenerOptions} mOptions The options.
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
		 * @param {sap.ui.table.extensions.Scrolling.EventListenerOptions} mOptions The options.
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
			this._getScrollExtension()._clearCache();
		},

		onAfterRendering: function(oEvent) {
			var oScrollExtension = this._getScrollExtension();
			var bRenderedRows = oEvent != null && oEvent.isMarked("renderRows");

			if (bRenderedRows) {
				oScrollExtension.updateVerticalScrollbarHeight();
				oScrollExtension.updateVerticalScrollHeight();
			} else {
				VerticalScrollingHelper.restoreScrollPosition(this, true);
			}

			HorizontalScrollingHelper.restoreScrollPosition(this);
		},

		onfocusin: function(oEvent) {
			// Many browsers do not scroll the focused element into the viewport if it is partially visible. With this logic we ensure that the
			// focused cell always gets scrolled into the viewport. If the cell is wider than the row container, no action is performed.
			var oRowContainer;
			var oCellInfo = TableUtils.getCellInfo(oEvent.target);
			var oHSb = this._getScrollExtension().getHorizontalScrollbar();

			if (oCellInfo.isOfType(TableUtils.CELLTYPE.DATACELL)) {
				oRowContainer = this.getDomRef("sapUiTableCtrlScr");
			} else if (oCellInfo.isOfType(TableUtils.CELLTYPE.COLUMNHEADER)) {
				oRowContainer = this.getDomRef("sapUiTableColHdrScr");
			}

			if (oRowContainer && oHSb && oCellInfo.columnIndex >= this.getComputedFixedColumnCount()) {
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
	 *   Only the contexts are updated while rows and cells are reused. The main task of this extension in this process is to calculate and apply the
	 *   correct value for the <code>firstVisibleRow</code> property.
	 *
	 * - Because the maximum height of elements is limited in browsers, the height of the container of the scrollable rows is also limited. To
	 *   still be able to scroll large data (number of rows > maximum element height / base row height), this extension relies on floating-point
	 *   arithmetic. The maximum amount of scrollable rows is therefore limited by the precision of the floating-point arithmetic in JavaScript.
	 *   The floating-point based algorithm seems to allow to scroll about 10.000.000.000.000.000 rows.
	 *   At higher numbers, an important base value loses too much of its precision
	 *   (see <code>sap.ui.table.extensions.Scrolling#getVerticalScrollRangeRowFraction</code>). This number is by no means suitable for external
	 *   communication as it is merely the result of minor manual tests.
	 *
	 * - Support for variable row heights.
	 *   Rows are allowed to be scrolled partially. To do this, one more row than the <code>visibleRowCount</code> is rendered, so there is an
	 *   overflow in the container of the scrollable rows which can be scrolled.
	 *   The bigger the height of a row, the faster it is scrolled. This is because every row is scrolled through by the same fraction of the
	 *   vertical scroll range. The rows in the final overflow are scrolled in a similar way. For them, a certain amount of the vertical scroll
	 *   range is reserved at the bottom (buffer).
	 *   The final overflow is the content which overflows when the table is scrolled to the last set of rows which can be rendered. The last row
	 *   is always in the buffer, so there is always an overflow.
	 *
	 *   <i>Currently known limitations:</i>
	 *   - Experimental implementation!
	 *   - Fixed rows are not supported.
	 *   - Keyboard navigation is not fully supported.
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
	 * @extends sap.ui.table.extensions.ExtensionBase
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @alias sap.ui.table.extensions.Scrolling
	 */
	var ScrollExtension = ExtensionBase.extend("sap.ui.table.extensions.Scrolling", /** @lends sap.ui.table.extensions.Scrolling.prototype */ {
		/**
		 * @override
		 * @inheritDoc
		 * @returns {string} The name of this extension.
		 */
		_init: function(oTable, sTableType, mSettings) {
			TableUtils.addDelegate(oTable, ExtensionDelegate, oTable);
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
		 * @override
		 * @inheritDoc
		 */
		destroy: function() {
			var oTable = this.getTable();

			TableUtils.removeDelegate(oTable, ExtensionDelegate);
			this._clearCache();

			if (internal(oTable).pVerticalScrollUpdateProcess) {
				internal(oTable).pVerticalScrollUpdateProcess.cancel();
				internal(oTable).pVerticalScrollUpdateProcess = null;
			}
			internal.destroy(oTable);

			ExtensionBase.prototype.destroy.apply(this, arguments);
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
	ScrollExtension.prototype.scrollVertically = function(bDown, bPage, bIsKeyboardScroll, bAsync, fnBeforeScroll) {
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
	ScrollExtension.prototype.scrollVerticallyMax = function(bDown, bIsKeyboardScroll) {
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
	ScrollExtension.prototype.getHorizontalScrollbar = function() {
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
	ScrollExtension.prototype.getVerticalScrollbar = function(bIgnoreDOMConnection) {
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
	ScrollExtension.prototype.isHorizontalScrollbarVisible = function() {
		var oHSb = this.getHorizontalScrollbar();
		return oHSb != null && !oHSb.classList.contains("sapUiTableHidden");
	};

	/**
	 * Checks whether the vertical scrollbar is visible.
	 *
	 * @returns {boolean} Returns <code>true</code>, if the vertical scrollbar is visible.
	 */
	ScrollExtension.prototype.isVerticalScrollbarVisible = function() {
		var oVSb = this.getVerticalScrollbar();
		return oVSb != null && !oVSb.classList.contains("sapUiTableHidden");
	};

	/**
	 *    Checks whether the vertical scrollbar is external.
	 *
	 * @returns {boolean} Whether the vertical scrollbar is external.
	 */
	ScrollExtension.prototype.isVerticalScrollbarExternal = function() {
		return internal(this.getTable()).bIsVerticalScrollbarExternal;
	};

	/**
	 * Marks the vertical scrollbar as external. The reference to the external scrollbar is stored in the extension to be returned by
	 * <code>sap.ui.table.extensions.Scrolling#getVerticalScrollbar</code>
	 *
	 * @param {HTMLElement} oScrollbarElement The reference to the external scrollbar element.
	 */
	ScrollExtension.prototype.markVerticalScrollbarAsExternal = function(oScrollbarElement) {
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
	ScrollExtension.prototype.updateHorizontalScrollbar = function(oTableSizes) {
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
	 */
	ScrollExtension.prototype.updateVerticalScrollbarHeight = function() {
		var oTable = this.getTable();
		var oVSb = this.getVerticalScrollbar();

		if (!oTable || !oVSb) {
			return;
		}

		oVSb.style.maxHeight = this.getVerticalScrollbarHeight() + "px";
		oVSb._scrollTop = oVSb.scrollTop;
	};

	/**
	 * Gets the height of the vertical scrollbar.
	 *
	 * @returns {int} The height of the scrollbar.
	 */
	ScrollExtension.prototype.getVerticalScrollbarHeight = function() {
		var oTable = this.getTable();

		if (!oTable) {
			return 0;
		}

		return oTable._getRowCounts().scrollable * oTable._getBaseRowHeight();
	};

	/**
	 * Updates the position of the vertical scrollbar.
	 */
	ScrollExtension.prototype.updateVerticalScrollbarPosition = function() {
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
	 *
	 * @param {boolean} bExpectRowsUpdatedEvent Whether an update of the rows will happen.
	 */
	ScrollExtension.prototype.updateVerticalScrollPosition = function(bExpectRowsUpdatedEvent) {
		var oTable = this.getTable();

		if (!oTable) {
			return;
		}

		VerticalScrollingHelper.performUpdateFromFirstVisibleRow(oTable, bExpectRowsUpdatedEvent);
	};

	/**
	 * Adjusts the scrollbar and the scroll position to the total row count. Expects that rows will be updated.
	 */
	ScrollExtension.prototype.adjustToTotalRowCount = function() {
		VerticalScrollingHelper.adjustToTotalRowCount(this.getTable());
	};

	/**
	 * Restores the vertical scroll position.
	 */
	ScrollExtension.prototype.restoreVerticalScrollPosition = function() {
		VerticalScrollingHelper.restoreScrollPosition(this.getTable());
	};

	/**
	 * Updates the vertical scroll height. This is the content height of the vertical scrollbar.
	 */
	ScrollExtension.prototype.updateVerticalScrollHeight = function() {
		var oVSb = this.getVerticalScrollbar();
		var oVSbContent = oVSb ? oVSb.firstChild : null;

		if (!oVSbContent) {
			return;
		}

		oVSbContent.style.height = this.getVerticalScrollHeight() + "px";
		oVSb._scrollTop = oVSb.scrollTop;
	};

	/**
	 * Gets the vertical scroll height.
	 *
	 * @param {boolean} [bBoundless=false] If set to <code>true</code>, the exact scroll height is returned, ignoring any UI related boundaries.
	 * @returns {int} The vertical scroll height.
	 */
	ScrollExtension.prototype.getVerticalScrollHeight = function(bBoundless) {
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
	ScrollExtension.prototype.updateVerticalScrollbarVisibility = function() {
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
	ScrollExtension.prototype.isVerticalScrollbarRequired = function() {
		var oTable = this.getTable();

		if (!oTable) {
			return false;
		}

		return TableUtils.isVariableRowHeightEnabled(oTable) && VerticalScrollingHelper.getScrollRangeOfViewport(oTable) > 0
			   || oTable._getTotalRowCount() > oTable._getRowCounts().count;
	};

	/**
	 * Adds mouse wheel event listeners to HTMLElements. Can only be used if synchronization is enabled.
	 *
	 * @param {HTMLElement[]} aEventListenerTargets The elements to add listeners to.
	 * @param {sap.ui.table.extensions.Scrolling.EventListenerOptions} mOptions The options.
	 * @returns {{wheel: Function}|null} A key value map containing the event names as keys and listener functions as values.
	 */
	ScrollExtension.prototype.registerForMouseWheel = function(aEventListenerTargets, mOptions) {
		var oTable = this.getTable();

		if (ExtensionBase.isEnrichedWith(oTable, "sap.ui.table.extensions.Synchronization")) {
			return ScrollingHelper.addMouseWheelEventListener(aEventListenerTargets, oTable, mOptions);
		} else {
			Log.error("This method can only be used with synchronization enabled.", oTable, "sap.ui.table.extensions.Scrolling#registerForMouseWheel");
			return null;
		}
	};

	/**
	 * Adds touch event listeners to HTMLElements. Can only be used if synchronization is enabled.
	 *
	 * @param {HTMLElement[]} aEventListenerTargets The elements to add listeners to.
	 * @param {sap.ui.table.extensions.Scrolling.EventListenerOptions} mOptions The options.
	 * @returns {{pointerdown: Function,
	 *            pointermove: Function,
	 *            touchstart: Function,
	 *            touchmove: Function}|null} A key value map containing the event names as keys and listener functions as values.
	 */
	ScrollExtension.prototype.registerForTouch = function(aEventListenerTargets, mOptions) {
		var oTable = this.getTable();

		if (ExtensionBase.isEnrichedWith(oTable, "sap.ui.table.extensions.Synchronization")) {
			return ScrollingHelper.addTouchEventListener(aEventListenerTargets, oTable, mOptions);
		} else {
			Log.error("This method can only be used with synchronization enabled.", oTable, "sap.ui.table.extensions.Scrolling#registerForTouch");
			return null;
		}
	};

	/**
	 * Clears the cache of this extension (e.g. DOM references).
	 *
	 * @private
	 */
	ScrollExtension.prototype._clearCache = function() {
		// Clear cached DOM references.
		internal(this.getTable()).oVerticalScrollbar = null;
		internal(this.getTable()).oHorizontalScrollbar = null;
	};

	ScrollExtension.ScrollDirection = ScrollDirection;

	return ScrollExtension;
});

/**
 * Gets the scroll extension.
 *
 * @name sap.ui.table.Table#_getScrollExtension
 * @function
 * @returns {sap.ui.table.extensions.Scrolling} The scroll extension.
 * @private
 */