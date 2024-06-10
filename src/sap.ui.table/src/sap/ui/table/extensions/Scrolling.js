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
	"sap/ui/thirdparty/jquery",
	"sap/ui/dom/jquery/scrollLeftRTL" // provides jQuery.fn.scrollLeftRTL
], function(ExtensionBase, TableUtils, library, Device, Interaction, Log, jQuery) {
	"use strict";

	const SharedDomRef = library.SharedDomRef;
	const Hook = TableUtils.Hook.Keys;
	const _private = TableUtils.createWeakMapFacade();

	/*
	 * Maximum width/height of elements in pixel:
	 * Determined with: http://output.jsbin.com/wequmoparo (29.12.2017)
	 *
	 *                             Width      Height
	 * Chrome (63.0.3239.84)  33.554.428  33.554.428
	 * Firefox (57.0.3)       17.895.698  17.895.696
	 */

	/**
	 * Maximum height of the element containing the scrollable rows.
	 *
	 * @constant
	 * @type {int}
	 */
	const MAX_VERTICAL_SCROLL_HEIGHT = 1000000;

	/**
	 * The amount of default row heights reserved to scroll the final vertical overflow.
	 * The final vertical overflow is the content which overflows when the table is scrolled to the last page (the very last row is rendered).
	 * <b>Note: Only has an effect if variable row heights are enabled.</b>
	 *
	 * @constant
	 * @type {int}
	 */
	const VERTICAL_OVERFLOW_BUFFER_LENGTH = 2; // Must be >= 1! A buffer is always required, because at least one row is always in the buffer.

	/**
	 * The timeout for blocking scroll events when the table is scrolled to the beginning or the end (milliseconds).
	 *
	 * @constant
	 * @type {int}
	 */
	const SCROLL_BLOCK_TIMEOUT = 500;

	/**
	 * Scroll directions.
	 *
	 * @enum {string}
	 * @memberOf sap.ui.table.extensions.Scrolling
	 */
	const ScrollDirection = {
		HORIZONAL: "HORIZONTAL",
		VERTICAL: "VERTICAL",
		/** Both horizontal and vertical scroll direction. */
		BOTH: "BOTH"
	};

	/**
	 * The configuration options for event listeners.
	 *
	 * @typedef {object} sap.ui.table.extensions.Scrolling.EventListenerOptions
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
	 * The interface of a process.
	 *
	 * @typedef {object} ProcessInterface
	 * @property {function} cancel Cancels the process.
	 * @property {function():boolean} isCancelled Whether the process is cancelled.
	 * @property {function(function)} addCancelListener Adds a listener that is called when the process is cancelled.
	 * @property {function():boolean} bRunning Whether the process is running.
	 * @property {function():string} getId Returns the ID of the process.
	 * @property {function():Promise} onPromiseCreated Called with the promise of the process after it is created.
	 */

	/**
	 * Information about a process.
	 *
	 * @typedef {object} ProcessInfo
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
		let bRunning = true;
		let bCancelled = false;
		const aCancelListeners = [];
		const oProcessInterface = {
			cancel: function() {
				if (this.isCancelled() || !this.isRunning()) {
					return;
				}

				bCancelled = true;

				for (let i = 0; i < aCancelListeners.length; i++) {
					aCancelListeners[i]();
				}

				log("Process cancelled: " + oProcessInfo.id);
			},
			isCancelled: function() {
				return bCancelled;
			},
			addCancelListener: function(fnCallback) {
				aCancelListeners.push(fnCallback);
			},
			isRunning: function() {
				return bRunning;
			},
			getInfo: function() {
				return oProcessInfo;
			},
			onPromiseCreated: function(oPromise) {}
		};
		let pCancellablePromise;

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

		oProcessInterface.onPromiseCreated(pCancellablePromise);

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
		/** The offset is specified in percentage of the viewport. */
		PercentageOfViewport: "PercentageOfViewport"
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
		const iNewIndex = this.getIndex() + iRows;
		let iNewOffset = this.getOffset();

		if (!this.isOffsetInPixel() || iNewIndex < 0) {
			iNewOffset = 0;
		}

		this.setPosition(Math.max(0, iNewIndex), iNewOffset);
	};

	ScrollPosition._isPositiveNumber = function(nNumber) {
		return typeof nNumber === "number" && !isNaN(nNumber) && nNumber >= 0;
	};

	/**
	 * Helper for vertical scroll update processes.
	 */
	const VerticalScrollProcess = {
		UpdateFromFirstVisibleRow: {id: "UpdateFromFirstVisibleRow", rank: 6},
		UpdateFromScrollPosition: {id: "UpdateFromScrollPosition", rank: 5},
		RestoreScrollPosition: {id: "RestoreScrollPosition", rank: 4},
		AdjustToTotalRowCount: {id: "AdjustToTotalRowCount", rank: 3},
		OnRowsUpdated: {id: "OnRowsUpdated", rank: 3},
		UpdateFromScrollbar: {id: "UpdateFromScrollbar", rank: 2},
		UpdateFromViewport: {id: "UpdateFromViewport", rank: 1},

		canStart: function(oTable, oProcessInfo) {
			const pCurrentProcess = _private(oTable).pVerticalScrollUpdateProcess;
			const oCurrentProcessInfo = pCurrentProcess ? pCurrentProcess.getInfo() : null;

			if (pCurrentProcess && pCurrentProcess.isRunning() && oCurrentProcessInfo.rank > oProcessInfo.rank) {
				log("Cannot start update process " + oProcessInfo.id
					+ " - A higher-ranked update process is currently running (" + oCurrentProcessInfo.id + ")", oTable);
				return false;
			}

			return true;
		},
		start: function(oTable, oProcessInfo, fnProcessExecutor) {
			if (!VerticalScrollProcess.canStart(oTable, oProcessInfo)) {
				return;
			}

			if (_private(oTable).pVerticalScrollUpdateProcess) {
				_private(oTable).pVerticalScrollUpdateProcess.cancel();
			}

			_private(oTable).pVerticalScrollUpdateProcess = new Process(fnProcessExecutor, oProcessInfo);
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
	const HorizontalScrollingHelper = {
		/**
		 * The scrollbar's scroll event handler.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 */
		onScrollbarScroll: function(oEvent) {
			const iNewScrollLeft = oEvent.target.scrollLeft;
			const iOldScrollLeft = oEvent.target._scrollLeft;

			// For interaction detection.
			Interaction.notifyScrollEvent && Interaction.notifyScrollEvent(oEvent);

			if (iNewScrollLeft !== iOldScrollLeft) {
				const aScrollAreas = HorizontalScrollingHelper.getScrollAreas(this);

				oEvent.target._scrollLeft = iNewScrollLeft;

				// Synchronize the scroll positions.
				for (let i = 0; i < aScrollAreas.length; i++) {
					const oScrollArea = aScrollAreas[i];

					if (oScrollArea !== oEvent.target && oScrollArea.scrollLeft !== iNewScrollLeft) {
						oScrollArea.scrollLeft = iNewScrollLeft;
						oScrollArea._scrollLeft = iNewScrollLeft;
					}
				}

				_private(this).iHorizontalScrollPosition = iNewScrollLeft;
			}
		},

		/**
		 * This function can be used to restore the last horizontal scroll position which has been stored.
		 * In case there is no stored scroll position nothing happens.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 */
		restoreScrollPosition: function(oTable) {
			const oScrollExtension = oTable._getScrollExtension();
			const oHSb = oScrollExtension.getHorizontalScrollbar();

			if (oHSb && _private(oTable).iHorizontalScrollPosition !== null) {
				const aScrollTargets = HorizontalScrollingHelper.getScrollAreas(oTable);

				for (let i = 0; i < aScrollTargets.length; i++) {
					const oScrollTarget = aScrollTargets[i];
					delete oScrollTarget._scrollLeft;
				}

				if (oHSb.scrollLeft !== _private(oTable).iHorizontalScrollPosition) {
					oHSb.scrollLeft = _private(oTable).iHorizontalScrollPosition;
				} else {
					const oEvent = jQuery.Event("scroll");
					oEvent.target = oHSb;
					HorizontalScrollingHelper.onScrollbarScroll.call(oTable, oEvent);
				}
			}
		},

		/**
		 * Updates the visibility, position and scroll range of the horizontal scrollbar.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 */
		updateScrollbar: function(oTable) {
			const oScrollExtension = oTable._getScrollExtension();
			const oHSb = oScrollExtension.getHorizontalScrollbar();

			if (!oHSb) {
				return;
			}

			const mTableSizes = oTable._collectTableSizes();
			const $Table = oTable.$();
			let iColsWidth = mTableSizes.tableCtrlScrollWidth;

			if (Device.browser.safari) {
				iColsWidth = Math.max(iColsWidth, oTable._getColumnsWidth(oTable.getComputedFixedColumnCount()));
			}

			const bHorizontalScrollbarRequired = iColsWidth > mTableSizes.tableCtrlScrWidth;

			if (bHorizontalScrollbarRequired) {
				// Show the horizontal scrollbar, if it is not already visible.
				if (!oScrollExtension.isHorizontalScrollbarVisible()) {
					$Table.addClass("sapUiTableHScr");
					oHSb.classList.remove("sapUiTableHidden");

					if (Device.browser.safari) {
						const $sapUiTableColHdr = $Table.find(".sapUiTableCtrlScroll, .sapUiTableColHdrScr > .sapUiTableColHdr");
						// min-width on table elements does not work for safari
						$sapUiTableColHdr.outerWidth(iColsWidth);
					}
				}

				let iScrollPadding = mTableSizes.tableCtrlFixedWidth;
				if ($Table.find(".sapUiTableRowHdrScr").length > 0) {
					iScrollPadding += mTableSizes.tableRowHdrScrWidth;
				}

				if (oTable._bRtlMode) {
					oHSb.style.marginRight = iScrollPadding + "px";
					oHSb.style.marginLeft = "";
				} else {
					oHSb.style.marginLeft = iScrollPadding + "px";
					oHSb.style.marginRight = "";
				}

				const oHSbContent = oTable.getDomRef("hsb-content");
				if (oHSbContent) {
					oHSbContent.style.width = iColsWidth + "px";
				}
			}

			if (!bHorizontalScrollbarRequired && oScrollExtension.isHorizontalScrollbarVisible()) {
				// Hide the horizontal scrollbar, if it is visible.
				$Table.removeClass("sapUiTableHScr");
				oHSb.classList.add("sapUiTableHidden");
				if (Device.browser.safari) {
					// min-width on table elements does not work for safari
					$Table.find(".sapUiTableCtrlScroll, .sapUiTableColHdr").css("width", "");
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
			const oScrollExtension = oTable._getScrollExtension();
			const oHSb = oScrollExtension.getHorizontalScrollbar();
			const aScrollAreas = HorizontalScrollingHelper.getScrollAreas(oTable);

			if (!oScrollExtension._onHorizontalScrollEventHandler) {
				oScrollExtension._onHorizontalScrollEventHandler = HorizontalScrollingHelper.onScrollbarScroll.bind(oTable);
			}

			for (let i = 0; i < aScrollAreas.length; i++) {
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
			const oScrollExtension = oTable._getScrollExtension();
			const oHSb = oScrollExtension.getHorizontalScrollbar();
			const aScrollAreas = HorizontalScrollingHelper.getScrollAreas(oTable);

			if (oScrollExtension._onHorizontalScrollEventHandler) {
				for (let i = 0; i < aScrollAreas.length; i++) {
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
			const oDomRef = oTable.getDomRef();
			let aScrollableColumnAreas;

			if (oDomRef) {
				aScrollableColumnAreas = Array.prototype.slice.call(oTable.getDomRef().querySelectorAll(".sapUiTableCtrlScr"));
			}

			const aScrollAreas = [
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
	const VerticalScrollingHelper = {
		/**
		 * Performs all necessary steps to scroll the table based on the table's <code>firstVisibleRow</code> property.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @param {boolean} [bExpectRowsUpdatedEvent=false] Whether an update of the rows will happen.
		 */
		performUpdateFromFirstVisibleRow: function(oTable, bExpectRowsUpdatedEvent) {
			log("VerticalScrollingHelper.performUpdateFromFirstVisibleRow", oTable);

			VerticalScrollProcess.start(oTable, VerticalScrollProcess.UpdateFromFirstVisibleRow, function(resolve, reject, oProcessInterface) {
				TableUtils.Hook.call(oTable, Hook.Signal, "StartTableUpdate");
				oProcessInterface.onPromiseCreated = function(oPromise) {
					oPromise.finally(function() {
						TableUtils.Hook.call(oTable, Hook.Signal, "EndTableUpdate");
					});
				};

				if (bExpectRowsUpdatedEvent === true) {
					const fnOnRowsUpdatedPreprocessor = function() {
						log("VerticalScrollingHelper.performUpdateFromFirstVisibleRow (async: rows update)", oTable);
						VerticalScrollingHelper._performUpdateFromFirstVisibleRow(oTable, oProcessInterface).then(resolve);
						return false;
					};

					VerticalScrollingHelper.addOnRowsUpdatedPreprocessor(oTable, fnOnRowsUpdatedPreprocessor);

					oProcessInterface.addCancelListener(function() {
						const bRemoved = VerticalScrollingHelper.removeOnRowsUpdatedPreprocessor(oTable, fnOnRowsUpdatedPreprocessor);
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
				return VerticalScrollingHelper.fixTemporaryFirstVisibleRow(oTable, null, oProcessInterface);
			}).then(function() {
				return VerticalScrollingHelper.fixScrollPosition(oTable, oProcessInterface);
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
				TableUtils.Hook.call(oTable, Hook.Signal, "StartTableUpdate");
				oProcessInterface.onPromiseCreated = function(oPromise) {
					oPromise.finally(function() {
						TableUtils.Hook.call(oTable, Hook.Signal, "EndTableUpdate");
					});
				};

				VerticalScrollingHelper.adjustFirstVisibleRowToScrollPosition(oTable, null, oProcessInterface).then(function() {
					if (oProcessInterface.isCancelled()) {
						return;
					}

					const oScrollPosition = _private(oTable).oVerticalScrollPosition;

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
					return VerticalScrollingHelper.fixScrollPosition(oTable, oProcessInterface);
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
			log("VerticalScrollingHelper.performUpdateFromScrollbar", oTable);
			clearTimeout(_private(oTable).mTimeouts.largeDataScrolling);
			delete _private(oTable).mTimeouts.largeDataScrolling;

			VerticalScrollProcess.start(oTable, VerticalScrollProcess.UpdateFromScrollbar, function(resolve, reject, oProcessInterface) {
				TableUtils.Hook.call(oTable, Hook.Signal, "StartTableUpdate");

				oProcessInterface.onPromiseCreated = function(oPromise) {
					oPromise.finally(function() {
						TableUtils.Hook.call(oTable, Hook.Signal, "EndTableUpdate");
					});
				};

				oTable._getKeyboardExtension().setActionMode(false);

				if (oTable._bLargeDataScrolling) {
					_private(oTable).mTimeouts.largeDataScrolling = setTimeout(function() {
						delete _private(oTable).mTimeouts.largeDataScrolling;

						if (oTable._getScrollExtension().getVerticalScrollbar() != null) {
							log("VerticalScrollingHelper.performUpdateFromScrollbar (async: large data scrolling)", oTable);
							VerticalScrollingHelper._performUpdateFromScrollbar(oTable, oProcessInterface).then(resolve);
						} else {
							log("VerticalScrollingHelper.performUpdateFromScrollbar (async: large data scrolling): No scrollbar", oTable);
						}
					}, 300);

					oProcessInterface.addCancelListener(function() {
						if (_private(oTable).mTimeouts.largeDataScrolling != null) {
							clearTimeout(_private(oTable).mTimeouts.largeDataScrolling);
							delete _private(oTable).mTimeouts.largeDataScrolling;
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
				return VerticalScrollingHelper.fixScrollPosition(oTable, oProcessInterface);
			}).then(function() {
				return VerticalScrollingHelper.scrollViewport(oTable, oProcessInterface);
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
				TableUtils.Hook.call(oTable, Hook.Signal, "StartTableUpdate");
				oProcessInterface.onPromiseCreated = function(oPromise) {
					oPromise.finally(function() {
						TableUtils.Hook.call(oTable, Hook.Signal, "EndTableUpdate");
					});
				};

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

			const nNewScrollTop = oEvent.target.scrollTop; // Can be a float if zoomed in Chrome.
			const nOldScrollTop = oEvent.target._scrollTop; // This is set in VerticalScrollingHelper.scrollScrollbar.
			const bScrollWithScrollbar = nNewScrollTop !== nOldScrollTop;

			delete oEvent.target._scrollTop;

			if (nNewScrollTop === 0 && !oEvent.target.isConnected) {
				log("VerticalScrollingHelper.onScrollbarScroll: Scrollbar is not connected with the DOM", this);
			} else if (bScrollWithScrollbar) {
				log("VerticalScrollingHelper.onScrollbarScroll: Scroll position changed to " + nNewScrollTop + " by interaction", this);
				VerticalScrollingHelper.performUpdateFromScrollbar(this);
			} else {
				log("VerticalScrollingHelper.onScrollbarScroll: Scroll position changed to " + nNewScrollTop + " by API", this);
			}
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

			const nNewScrollTop = oEvent.target.scrollTop; // Can be a float if zoomed in Chrome.
			const nOldScrollTop = oEvent.target._scrollTop; // This is set in VerticalScrollingHelper.scrollViewport.

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

			const oScrollPosition = _private(oTable).oVerticalScrollPosition;
			const bOffsetIsInPercentageOfViewport = oScrollPosition.getOffsetType() === ScrollPosition.OffsetType.PercentageOfViewport;
			const iNewIndex = oScrollPosition.getIndex();
			const iOldIndex = oTable.getFirstVisibleRow();
			const bNewIndexIsInBuffer = VerticalScrollingHelper.isIndexInBuffer(oTable, iNewIndex);
			const bNewIndexIsTemporary = bNewIndexIsInBuffer || bOffsetIsInPercentageOfViewport;

			// Depending on the row heights, it can happen that the index needs to be decreased if it is in the buffer, or it needs to be
			// increased if the offset is specified in percentage of the viewport.
			// The firstVisibleRowChanged event needs to be prevented in these cases. It will be fired later in
			// VerticalScrollingHelper.fixTemporaryFirstVisibleRow.
			log("VerticalScrollingHelper.adjustFirstVisibleRowToScrollPosition:"
				+ " Set \"firstVisibleRow\" from " + iOldIndex + " to " + iNewIndex, oTable);
			const bExpectRowsUpdatedEvent = oTable._setFirstVisibleRowIndex(iNewIndex, {
				onScroll: true,
				suppressEvent: bNewIndexIsTemporary,
				suppressRendering: bSuppressRendering
			});

			if (!bExpectRowsUpdatedEvent) {
				if (bNewIndexIsTemporary) {
					return VerticalScrollingHelper.fixTemporaryFirstVisibleRow(oTable, true, oProcessInterface);
				}
				return Promise.resolve();
			}

			return new Promise(function(resolve) {
				const fnOnRowsUpdatedPreprocessor = function(oEvent) {
					log("VerticalScrollingHelper.adjustFirstVisibleRowToScrollPosition (async: rows updated):"
						+ " Reason " + oEvent.getParameters().reason, this);
					if (bNewIndexIsTemporary) {
						VerticalScrollingHelper.fixTemporaryFirstVisibleRow(oTable, true, oProcessInterface).then(resolve);
					} else {
						resolve();
					}
					return false;
				};

				VerticalScrollingHelper.addOnRowsUpdatedPreprocessor(oTable, fnOnRowsUpdatedPreprocessor);

				if (oProcessInterface) {
					oProcessInterface.addCancelListener(function() {
						const bRemoved = VerticalScrollingHelper.removeOnRowsUpdatedPreprocessor(oTable, fnOnRowsUpdatedPreprocessor);
						if (bRemoved) {
							resolve();
						}
					});
				}
			});
		},

		/**
		 * Adjusts the first visible row index to the current scroll position if it is in the buffer, or the offset is specified in percentage of the
		 * viewport. The buffer is reserved to scroll the final overflow, whose actual size is only known when the table is scrolled to the bottom.
		 * In these cases, this method completes adjusting the <code>firstVisibleRow</code> property of the table to the scroll position.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @param {boolean} [bForceFirstVisibleRowChangedEvent=false] Whether to fire the <code>firstVisibleRowChanged</code> event of the table,
		 * @param {ProcessInterface} [oProcessInterface] The interface to the process.
		 * @returns {Promise} A Promise that resolves when the first visible row of the table is set to the correct value.
		 */
		fixTemporaryFirstVisibleRow: function(oTable, bForceFirstVisibleRowChangedEvent, oProcessInterface) {
			if (oProcessInterface && oProcessInterface.isCancelled()) {
				return Promise.resolve();
			}

			bForceFirstVisibleRowChangedEvent = bForceFirstVisibleRowChangedEvent === true;

			const oScrollPosition = _private(oTable).oVerticalScrollPosition;
			const bOffsetIsInPercentageOfViewport = oScrollPosition.getOffsetType() === ScrollPosition.OffsetType.PercentageOfViewport;
			const iIndex = oScrollPosition.getIndex();
			const bIndexIsInBuffer = VerticalScrollingHelper.isIndexInBuffer(oTable, iIndex);
			const bIndexIsTemporary = bIndexIsInBuffer || bOffsetIsInPercentageOfViewport;

			if (!bIndexIsTemporary) {
				log("VerticalScrollingHelper.fixTemporaryFirstVisibleRow: Aborted - The index is already final", oTable);
				return Promise.resolve();
			}

			let iNewIndex = iIndex;
			const iViewportScrollRange = VerticalScrollingHelper.getScrollRangeOfViewport(oTable);
			const iMaxFirstRenderedRowIndex = oTable._getMaxFirstRenderedRowIndex();
			const aRowHeights = oTable._aRowHeights;
			let iRowIndex;

			log("VerticalScrollingHelper.fixTemporaryFirstVisibleRow", oTable);

			if (bOffsetIsInPercentageOfViewport) {
				let nRemaining = iViewportScrollRange * oScrollPosition.getOffset();

				if (bIndexIsInBuffer) {
					iNewIndex = iMaxFirstRenderedRowIndex;
				}

				for (iRowIndex = 0; iRowIndex < aRowHeights.length; iRowIndex++) {
					const nRemainingTemp = nRemaining - aRowHeights[iRowIndex];

					if (nRemainingTemp >= 0) {
						nRemaining = nRemainingTemp;
						iNewIndex++;
					} else {
						break;
					}
				}
			} else if (bIndexIsInBuffer) {
				const iTargetRowIndex = Math.max(0, Math.min(aRowHeights.length - 1, iIndex - iMaxFirstRenderedRowIndex));
				let iViewportVirtualScrollTop = 0;

				for (iRowIndex = 0; iRowIndex < iTargetRowIndex; iRowIndex++) {
					iViewportVirtualScrollTop += aRowHeights[iRowIndex];

					if (iViewportVirtualScrollTop > iViewportScrollRange) {
						// The index is too high. It is not possible to scroll down so far that the row at this index is shown on top.
						iNewIndex = iMaxFirstRenderedRowIndex + iRowIndex;
						break;
					}
				}
			}

			if (iIndex !== iNewIndex || bForceFirstVisibleRowChangedEvent) {
				log("VerticalScrollingHelper.fixTemporaryFirstVisibleRow: Set \"firstVisibleRow\" to " + iNewIndex, oTable);
				oTable._setFirstVisibleRowIndex(iNewIndex, {
					onScroll: true,
					forceEvent: bForceFirstVisibleRowChangedEvent,
					suppressRendering: true
				});
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
			_private(oTable).oVerticalScrollPosition.setPosition(oTable.getFirstVisibleRow());

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

			const oScrollPosition = _private(oTable).oVerticalScrollPosition;
			const nScrollbarScrollTop = VerticalScrollingHelper.getScrollPositionOfScrollbar(oTable);
			const iScrollRange = VerticalScrollingHelper.getScrollRange(oTable);
			const nScrollRangeRowFraction = VerticalScrollingHelper.getScrollRangeRowFraction(oTable);
			let iNewIndex = 0;
			let nNewOffset = 0;
			let sNewOffsetType = ScrollPosition.OffsetType.Percentage;
			let nIndex;

			log("VerticalScrollingHelper.adjustScrollPositionToScrollbar", oTable);

			if (TableUtils.isVariableRowHeightEnabled(oTable)) {
				if (VerticalScrollingHelper.isScrollPositionOfScrollbarInBuffer(oTable)) {
					const iBuffer = VerticalScrollingHelper.getScrollRangeBuffer(oTable);
					const iScrollRangeWithoutBuffer = iScrollRange - iBuffer;
					const nScrolledBuffer = nScrollbarScrollTop - iScrollRangeWithoutBuffer;
					const nScrolledBufferPercentage = nScrolledBuffer / iBuffer;

					iNewIndex = oTable._getMaxFirstRenderedRowIndex();

					if (VerticalScrollingHelper.isIndexInBuffer(oTable, oScrollPosition.getIndex())) {
						const iViewportScrollRange = VerticalScrollingHelper.getScrollRangeOfViewport(oTable);
						let nRemaining = iViewportScrollRange * nScrolledBufferPercentage;
						const aRowHeights = oTable._aRowHeights;

						for (let iRowIndex = 0; iRowIndex < aRowHeights.length; iRowIndex++) {
							const nRemainingTemp = nRemaining - aRowHeights[iRowIndex];

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
						sNewOffsetType = ScrollPosition.OffsetType.PercentageOfViewport;
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
				const nDistanceToMaximumScrollPosition = iScrollRange - nScrollbarScrollTop;
				const bScrolledToBottom = nDistanceToMaximumScrollPosition < 1;

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

			const oScrollPosition = _private(oTable).oVerticalScrollPosition;
			const aRowHeights = oTable._aRowHeights;
			let iNewIndex = oTable._getFirstRenderedRowIndex();
			let iNewOffset = 0;
			let nRemaining = VerticalScrollingHelper.getScrollPositionOfViewport(oTable);

			log("VerticalScrollingHelper.adjustScrollPositionToViewport", oTable);

			for (let iRowIndex = 0; iRowIndex < aRowHeights.length; iRowIndex++) {
				const nRemainingTemp = nRemaining - aRowHeights[iRowIndex];

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
		 * If the offset is specified in percentage, index and offset are recalculated to the actual index and an offset in pixel. The current
		 * state of the viewport including the row heights is taken into account for this correction. The offset is limited to the height of the
		 * row at this index.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @param {ProcessInterface} [oProcessInterface] The interface to the process.
		 * @returns {Promise} A Promise that resolves when the scroll position is set to the correct value.
		 */
		fixScrollPosition: function(oTable, oProcessInterface) {
			if (oProcessInterface && oProcessInterface.isCancelled()) {
				return Promise.resolve();
			}

			const oScrollPosition = _private(oTable).oVerticalScrollPosition;
			const oViewport = oTable.getDomRef("tableCCnt");
			const iViewportScrollRange = VerticalScrollingHelper.getScrollRangeOfViewport(oTable);
			const aRowHeights = oTable._aRowHeights;

			if (!oViewport || !oTable.getBinding()) {
				log("VerticalScrollingHelper.fixScrollPosition: Aborted - Viewport or binding not available", oTable);
				return Promise.resolve();
			}

			log("VerticalScrollingHelper.fixScrollPosition", oTable);

			let iNewIndex = oScrollPosition.getIndex();
			let iNewOffset = oScrollPosition.getOffset();
			let iTargetRowIndex = 0;
			let iRowIndex;
			const iFirstRenderedRowIndex = oTable._getFirstRenderedRowIndex();

			switch (oScrollPosition.getOffsetType()) {
				case ScrollPosition.OffsetType.Pixel:
				case ScrollPosition.OffsetType.Percentage: {
					const iIndex = oScrollPosition.getIndex();
					let iVirtualViewportScrollTop = 0;
					let iCurrentOffsetType = oScrollPosition.getOffsetType();

					if (VerticalScrollingHelper.isIndexInBuffer(oTable, iIndex)) {
						let iVirtualScrollTop = 0;

						iTargetRowIndex = Math.max(0, Math.min(aRowHeights.length - 1, iIndex - iFirstRenderedRowIndex));

						for (iRowIndex = 0; iRowIndex < iTargetRowIndex; iRowIndex++) {
							iVirtualScrollTop += aRowHeights[iRowIndex];

							if (iVirtualScrollTop > iViewportScrollRange) {
								// The index is too high. It is not possible to scroll down so far that the row at this index is shown on top.
								iNewIndex = iFirstRenderedRowIndex + iRowIndex;
								iNewOffset = iViewportScrollRange - iVirtualViewportScrollTop;
								iCurrentOffsetType = ScrollPosition.OffsetType.Pixel;
								iTargetRowIndex = iRowIndex;
								break;
							} else {
								iVirtualViewportScrollTop = iVirtualScrollTop;
							}
						}
					}

					if (iCurrentOffsetType === ScrollPosition.OffsetType.Pixel) {
						// The offset may not be larger than the row.
						iNewOffset = Math.min(iNewOffset, aRowHeights[iTargetRowIndex]);
					} else {
						iNewOffset = aRowHeights[iTargetRowIndex] * iNewOffset;
					}

					iVirtualViewportScrollTop += iNewOffset;

					if (iVirtualViewportScrollTop > iViewportScrollRange && TableUtils.isVariableRowHeightEnabled(oTable)) {
						iNewOffset -= iVirtualViewportScrollTop - iViewportScrollRange;
					}
					break;
				}
				case ScrollPosition.OffsetType.PercentageOfViewport: {
					let nRemaining = iViewportScrollRange * oScrollPosition.getOffset();

					for (iRowIndex = 0; iRowIndex < aRowHeights.length; iRowIndex++) {
						const nRemainingTemp = nRemaining - aRowHeights[iRowIndex];

						if (nRemainingTemp >= 0) {
							nRemaining = nRemainingTemp;
							iTargetRowIndex++;
						} else {
							iNewIndex = iFirstRenderedRowIndex + iTargetRowIndex;
							iNewOffset = Math.round(nRemaining);
							break;
						}
					}
					break;
				}
				default:
			}

			oScrollPosition.setPosition(iNewIndex, iNewOffset);

			return Promise.resolve();
		},

		/**
		 * Scrolls the viewport to match the scroll position. Adjusts the scroll position if the viewport cannot be scrolled to match the scroll
		 * position.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @param {ProcessInterface} [oProcessInterface] The interface to the process.
		 * @returns {Promise} A Promise that resolves when <code>scrollTop</code> of the viewport was set.
		 */
		scrollViewport: function(oTable, oProcessInterface) {
			if (oProcessInterface && oProcessInterface.isCancelled()) {
				return Promise.resolve();
			}

			if (!TableUtils.isVariableRowHeightEnabled(oTable)) {
				log("VerticalScrollingHelper.scrollViewport: Aborted - Variable row height not enabled", oTable);
				return Promise.resolve();
			}

			const oScrollPosition = _private(oTable).oVerticalScrollPosition;
			const oViewport = oTable.getDomRef("tableCCnt");
			const iScrollRange = VerticalScrollingHelper.getScrollRangeOfViewport(oTable);
			const aRowHeights = oTable._aRowHeights;
			let iScrollTop = 0;

			if (iScrollRange === 0) {
				log("VerticalScrollingHelper.scrollViewport: Aborted - No overflow in viewport", oTable);
				oViewport.scrollTop = iScrollTop;
				oViewport._scrollTop = oViewport.scrollTop;
				return Promise.resolve();
			}

			log("VerticalScrollingHelper.scrollViewport", oTable);

			switch (oScrollPosition.getOffsetType()) {
				case ScrollPosition.OffsetType.Pixel: {
					const iIndex = oScrollPosition.getIndex();
					const iTargetRowIndex = Math.max(0, Math.min(aRowHeights.length - 1, iIndex - oTable._getFirstRenderedRowIndex()));

					for (let iRowIndex = 0; iRowIndex < iTargetRowIndex; iRowIndex++) {
						iScrollTop += aRowHeights[iRowIndex];
					}

					iScrollTop += oScrollPosition.getOffset();
					break;
				}
				default:
					log("VerticalScrollingHelper.scrollViewport: The viewport can only be scrolled if the offset is in pixel", oTable);
					return Promise.resolve();
			}

			log("VerticalScrollingHelper.scrollViewport: Scroll from " + oViewport.scrollTop + " to " + iScrollTop, oTable);
			oViewport.scrollTop = iScrollTop;
			oViewport._scrollTop = oViewport.scrollTop;

			return Promise.resolve();
		},

		/**
		 * Scrolls the scrollbar to match the scroll position.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @param {ProcessInterface} [oProcessInterface] The interface to the process.
		 * @returns {Promise} A Promise that resolves when <code>scrollTop</code> of the scrollbar was set.
		 */
		scrollScrollbar: function(oTable, oProcessInterface) {
			if (oProcessInterface && oProcessInterface.isCancelled()) {
				return Promise.resolve();
			}

			const oScrollPosition = _private(oTable).oVerticalScrollPosition;
			const iIndex = oScrollPosition.getIndex();
			const iBuffer = VerticalScrollingHelper.getScrollRangeBuffer(oTable);
			const iScrollRange = VerticalScrollingHelper.getScrollRange(oTable);
			const iScrollRangeWithoutBuffer = iScrollRange - iBuffer;
			let nScrollPosition = 0;
			let iScrollTop = 0;
			const iViewportScrollRange = VerticalScrollingHelper.getScrollRangeOfViewport(oTable);
			const aRowHeights = oTable._aRowHeights;
			let iTargetRowIndex;

			log("VerticalScrollingHelper.scrollScrollbar", oTable);

			if (iScrollRange === 0 || aRowHeights.length === 0) {
				log("VerticalScrollingHelper.scrollScrollbar: No scrollable content", oTable);
				return Promise.resolve();
			}

			switch (oScrollPosition.getOffsetType()) {
				case ScrollPosition.OffsetType.Pixel:
					if (VerticalScrollingHelper.isIndexInBuffer(oTable, iIndex)) {
						let iVirtualViewportScrollTop = 0;

						iTargetRowIndex = Math.max(0, Math.min(aRowHeights.length - 1, iIndex - oTable._getMaxFirstRenderedRowIndex()));

						for (let iRowIndex = 0; iRowIndex < iTargetRowIndex; iRowIndex++) {
							iVirtualViewportScrollTop += aRowHeights[iRowIndex];
						}

						iVirtualViewportScrollTop += Math.min(aRowHeights[iTargetRowIndex], oScrollPosition.getOffset());

						const nScrolledBufferPercentage = Math.min(iVirtualViewportScrollTop / iViewportScrollRange, 1);
						const nScrolledBuffer = iBuffer * nScrolledBufferPercentage;

						nScrollPosition = iScrollRangeWithoutBuffer + nScrolledBuffer;
					} else {
						const nScrollRangeRowFraction = VerticalScrollingHelper.getScrollRangeRowFraction(oTable);

						nScrollPosition = iIndex * nScrollRangeRowFraction;
						iTargetRowIndex = Math.max(0, Math.min(aRowHeights.length - 1, iIndex - oTable._getFirstRenderedRowIndex()));
						nScrollPosition += nScrollRangeRowFraction * Math.min(oScrollPosition.getOffset() / aRowHeights[iTargetRowIndex], 1);
					}
					break;
				default:
					log("VerticalScrollingHelper.scrollViewport: The scrollbar can only be scrolled if the offset is in pixel", oTable);
					return Promise.resolve();
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

			const oVSb = oTable._getScrollExtension().getVerticalScrollbar();
			const bScrollingForward = iScrollTop > oVSb.scrollTop;

			if (oVSb) {
				log("VerticalScrollingHelper.scrollScrollbar: Scroll from " + oVSb.scrollTop + " to " + iScrollTop, oTable);
				oVSb.scrollTop = iScrollTop;
				oVSb._scrollTop = oVSb.scrollTop;
			} else {
				log("VerticalScrollingHelper.scrollScrollbar: Not scrolled - No scrollbar available", oTable);
			}

			let bScrolledToEnd = false;
			if (bScrollingForward) {
				bScrolledToEnd = oVSb.scrollTop === oVSb.scrollHeight - oVSb.offsetHeight;
			} else {
				bScrolledToEnd = oVSb.scrollTop === 0;
			}

			if (bScrolledToEnd && !oVSb._unblockScrolling) {
				if (!oVSb._timeoutBlock) {
					oVSb._timeoutBlock = setTimeout(function() {
						oVSb._unblockScrolling = true;
						oVSb._timeoutBlock = null;
					}, SCROLL_BLOCK_TIMEOUT);
				}
			} else {
				oVSb._unblockScrolling = false;
			}

			return Promise.resolve();
		},

		/**
		 * Gets the vertical scroll range.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @returns {int} The vertical scroll range.
		 */
		getScrollRange: function(oTable) {
			const oScrollExtension = oTable._getScrollExtension();
			const iVerticalScrollRange = oScrollExtension.getVerticalScrollHeight() - oScrollExtension.getVerticalScrollbarHeight();
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
			const oScrollExtension = oTable._getScrollExtension();

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
			const oViewport = oTable ? oTable.getDomRef("tableCCnt") : null;
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
			const oScrollExtension = oTable._getScrollExtension();
			const iVirtualRowCount = oTable._getTotalRowCount() - oTable._getRowCounts()._fullsize;
			let iScrollRangeWithoutBuffer;

			if (TableUtils.isVariableRowHeightEnabled(oTable)) {
				iScrollRangeWithoutBuffer = VerticalScrollingHelper.getScrollRange(oTable) - VerticalScrollingHelper.getScrollRangeBuffer(oTable);

				// The last row is part of the buffer. To correctly calculate the fraction of the scroll range allocated to a row, all rows must be
				// considered. This is not the case if the scroll range is at its maximum, then the buffer must be excluded from calculation
				// completely.
				const bScrollRangeMaxedOut = oScrollExtension.getVerticalScrollHeight() === MAX_VERTICAL_SCROLL_HEIGHT;
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

			const iScrollRange = VerticalScrollingHelper.getScrollRange(oTable);
			const nScrollPosition = VerticalScrollingHelper.getScrollPositionOfScrollbar(oTable);
			const iScrollRangeBuffer = VerticalScrollingHelper.getScrollRangeBuffer(oTable);

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

			let aRowHeights = oTable._aRowHeights;
			const iViewportHeight = oTable._getBaseRowHeight() * oTable._getRowCounts()._fullsize;

			// Only sum rows filled with data, ignore empty rows.
			if (oTable._getRowCounts()._fullsize >= oTable._getTotalRowCount()) {
				aRowHeights = aRowHeights.slice(0, oTable._getTotalRowCount());
			}

			let iInnerVerticalScrollRange = aRowHeights.reduce(function(a, b) { return a + b; }, 0) - iViewportHeight;
			if (iInnerVerticalScrollRange > 0) {
				iInnerVerticalScrollRange = Math.ceil(iInnerVerticalScrollRange);
			}

			return Math.max(0, iInnerVerticalScrollRange);
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
			_private(oTable).aOnRowsUpdatedPreprocessors.push(fnPreprocessor);
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
				_private(oTable).aOnRowsUpdatedPreprocessors = [];
				return false;
			}

			const iIndex = _private(oTable).aOnRowsUpdatedPreprocessors.indexOf(fnPreprocessor);

			if (iIndex > -1) {
				_private(oTable).aOnRowsUpdatedPreprocessors.splice(iIndex, 1);
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

			VerticalScrollingHelper.updateScrollbarVisibility(this);

			if (_private(this).aOnRowsUpdatedPreprocessors.length > 0) {
				log("VerticalScrollingHelper.onRowsUpdated (preprocessors)", this);

				const bExecuteDefault = _private(this).aOnRowsUpdatedPreprocessors.reduce(function(bExecuteDefault, fnPreprocessor) {
					const _bExecuteDefault = fnPreprocessor.call(this, oEvent);
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

			const that = this;

			VerticalScrollProcess.start(this, VerticalScrollProcess.OnRowsUpdated, function(resolve, reject, oProcessInterface) {
				TableUtils.Hook.call(that, Hook.Signal, "StartTableUpdate");
				oProcessInterface.onPromiseCreated = function(oPromise) {
					oPromise.finally(function() {
						TableUtils.Hook.call(that, Hook.Signal, "EndTableUpdate");
					});
				};

				VerticalScrollingHelper.fixScrollPosition(that, oProcessInterface).then(function() {
					return Promise.all([
						VerticalScrollingHelper.adjustFirstVisibleRowToScrollPosition(that, true, oProcessInterface),
						VerticalScrollingHelper.scrollViewport(that, oProcessInterface),
						VerticalScrollingHelper.scrollScrollbar(that, oProcessInterface)
					]);
				}).then(resolve);
			});
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

			VerticalScrollProcess.start(oTable, VerticalScrollProcess.RestoreScrollPosition, function(resolve, reject, oProcessInterface) {
				TableUtils.Hook.call(oTable, Hook.Signal, "StartTableUpdate");

				oProcessInterface.onPromiseCreated = function(oPromise) {
					oPromise.then(function() {
						if (!oProcessInterface.isCancelled()) {
							// Starts a new process.
							VerticalScrollingHelper._restoreScrollPosition(oTable);
						}
					}).finally(function() {
						TableUtils.Hook.call(oTable, Hook.Signal, "EndTableUpdate");
					});
				};

				if (bExpectRowsUpdatedEvent !== true) {
					resolve();
					return;
				}

				const fnOnRowsUpdatedPreprocessor = function() {
					log("VerticalScrollingHelper.restoreScrollPosition (async: rows updated)", oTable);
					resolve();
					return false;
				};

				VerticalScrollingHelper.addOnRowsUpdatedPreprocessor(oTable, fnOnRowsUpdatedPreprocessor);

				oProcessInterface.addCancelListener(function() {
					const bRemoved = VerticalScrollingHelper.removeOnRowsUpdatedPreprocessor(oTable, fnOnRowsUpdatedPreprocessor);
					if (bRemoved) {
						resolve();
					}
				});
			});
		},

		_restoreScrollPosition: function(oTable) {
			const oScrollPosition = _private(oTable).oVerticalScrollPosition;
			const bScrollPositionIsInitial = oScrollPosition.isInitial();

			log("VerticalScrollingHelper.restoreScrollPosition: "
				+ "Scroll position is" + (bScrollPositionIsInitial ? " " : " not ") + "initial", oTable);

			if (bScrollPositionIsInitial) {
				VerticalScrollingHelper.performUpdateFromFirstVisibleRow(oTable);
			} else {
				VerticalScrollingHelper.performUpdateFromScrollPosition(oTable);
			}
		},

		onTotalRowCountChanged: function() {
			VerticalScrollingHelper.adjustToTotalRowCount(this);
		},

		adjustToTotalRowCount: function(oTable) {
			const oScrollExtension = oTable._getScrollExtension();

			log("VerticalScrollingHelper.adjustToTotalRowCount", oTable);
			VerticalScrollingHelper.updateScrollbarVisibility(oTable);
			HorizontalScrollingHelper.updateScrollbar(oTable);
			oScrollExtension.updateVerticalScrollHeight();

			VerticalScrollProcess.start(oTable, VerticalScrollProcess.AdjustToTotalRowCount, function(resolve, reject, oProcessInterface) {
				TableUtils.Hook.call(oTable, Hook.Signal, "StartTableUpdate");

				oProcessInterface.onPromiseCreated = function(oPromise) {
					oPromise.then(function() {
						if (oProcessInterface.isCancelled() || _private(oTable).oVerticalScrollPosition.isInitial()) {
							return;
						}

						// Starts a new process.
						VerticalScrollingHelper.performUpdateFromScrollPosition(oTable);
					}).finally(function() {
						TableUtils.Hook.call(oTable, Hook.Signal, "EndTableUpdate");
					});
				};

				if (_private(oTable).oVerticalScrollPosition.isInitial()) {
					resolve();
				} else {
					const fnOnRowsUpdatedPreprocessor = function() {
						log("VerticalScrollingHelper.adjustToTotalRowCount (async: rows updated)", oTable);
						resolve();
						return false;
					};

					VerticalScrollingHelper.addOnRowsUpdatedPreprocessor(oTable, fnOnRowsUpdatedPreprocessor);

					oProcessInterface.addCancelListener(function() {
						const bRemoved = VerticalScrollingHelper.removeOnRowsUpdatedPreprocessor(oTable, fnOnRowsUpdatedPreprocessor);
						if (bRemoved) {
							resolve();
						}
					});
				}
			});
		},

		/**
		 * This hook is called when the table layout is updated, for example when resizing.
		 *
		 * @param {sap.ui.table.utils.TableUtils.RowsUpdateReason} sReason The reason for updating the table sizes.
		 * @private
		 */
		onUpdateTableSizes: function(sReason) {
			VerticalScrollingHelper.updateScrollbarVisibility(this);
			HorizontalScrollingHelper.updateScrollbar(this);
		},

		updateScrollbarVisibility: function(oTable) {
			const oScrollExtension = oTable._getScrollExtension();
			const oVSb = oScrollExtension.getVerticalScrollbar();
			const oTableElement = oTable ? oTable.getDomRef() : null;

			if (!oVSb || !oTableElement) {
				return;
			}

			const bVerticalScrollbarRequired = oScrollExtension.isVerticalScrollbarRequired();

			oTableElement.classList.toggle("sapUiTableVScr", bVerticalScrollbarRequired && !oScrollExtension.isVerticalScrollbarExternal());
			oVSb.parentElement.classList.toggle("sapUiTableHidden", !bVerticalScrollbarRequired);
		},

		/**
		 * Adds the event listeners which are required for the vertical scrolling.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 */
		addEventListeners: function(oTable) {
			const oScrollExtension = oTable._getScrollExtension();
			const aScrollAreas = VerticalScrollingHelper.getScrollAreas(oTable);
			const oViewport = oTable.getDomRef("tableCCnt");

			if (!oScrollExtension._onVerticalScrollEventHandler) {
				oScrollExtension._onVerticalScrollEventHandler = VerticalScrollingHelper.onScrollbarScroll.bind(oTable);
			}

			for (let i = 0; i < aScrollAreas.length; i++) {
				aScrollAreas[i].addEventListener("scroll", oScrollExtension._onVerticalScrollEventHandler);
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
			const oScrollExtension = oTable._getScrollExtension();
			const aScrollAreas = VerticalScrollingHelper.getScrollAreas(oTable);
			const oViewport = oTable.getDomRef("tableCCnt");

			if (oScrollExtension._onVerticalScrollEventHandler) {
				for (let i = 0; i < aScrollAreas.length; i++) {
					aScrollAreas[i].removeEventListener("scroll", oScrollExtension._onVerticalScrollEventHandler);
				}
				delete oScrollExtension._onVerticalScrollEventHandler;
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
			const aScrollAreas = [
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
	const ScrollingHelper = {
		/**
		 * Handles mouse wheel events.
		 *
		 * @param {sap.ui.table.extensions.Scrolling.EventListenerOptions} mOptions The options.
		 * @param {WheelEvent} oEvent The wheel event object.
		 */
		onMouseWheelScrolling: function(mOptions, oEvent) {
			const oScrollExtension = this._getScrollExtension();
			const bVerticalDelta = Math.abs(oEvent.deltaY) > Math.abs(oEvent.deltaX);
			let iScrollDelta = bVerticalDelta ? oEvent.deltaY : oEvent.deltaX;
			const bHorizontalScrolling = bVerticalDelta && oEvent.shiftKey || !bVerticalDelta;
			const bScrollingForward = iScrollDelta > 0;
			let bScrolledToEnd = false;

			if (iScrollDelta === 0) {
				return;
			}

			if (bHorizontalScrolling && (mOptions.scrollDirection === ScrollDirection.HORIZONAL
										 || mOptions.scrollDirection === ScrollDirection.BOTH)) {
				const oHSb = oScrollExtension.getHorizontalScrollbar();

				if (oEvent.deltaMode !== window.WheelEvent.DOM_DELTA_PIXEL) {
					// For simplicity and performance reasons horizontal line and page scrolling is always performed by the distance of one minimum
					// column width. To determine the real scroll distance reading from the DOM is necessary, but this should be avoided in an
					// event handler.
					const iMinColumnWidth = TableUtils.Column.getMinColumnWidth();
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

				if (oEvent.target instanceof window.HTMLTextAreaElement) {
					const oTextAreaRef = oEvent.target;
					if (oTextAreaRef.clientHeight < oTextAreaRef.scrollHeight) {
						return;
					}
				}

				const oVSb = oScrollExtension.getVerticalScrollbar();
				const oVerticalScrollPosition = _private(this).oVerticalScrollPosition;

				if (bScrollingForward) {
					bScrolledToEnd = oVSb.scrollTop === oVSb.scrollHeight - oVSb.offsetHeight;
				} else {
					bScrolledToEnd = oVSb.scrollTop === 0;
				}

				if (!oScrollExtension.isVerticalScrollbarVisible() || bScrolledToEnd && oVSb._unblockScrolling) {
					return;
				}
				oEvent.preventDefault();
				oEvent.stopPropagation();

				if (oEvent.deltaMode === window.WheelEvent.DOM_DELTA_PIXEL) {
					const nRowsToScroll = iScrollDelta / this._getDefaultRowHeight();

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
					// For simplicity, we assume a page is always the scrollable row count.
					// This is not perfect in case of variable row heights, but perfect pixel-wise scrolling requires a different DOM structure.
					oVerticalScrollPosition.scrollRows(iScrollDelta * this._getRowCounts()._scrollSize);
				}

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
				const oScrollExtension = this._getScrollExtension();
				const oHSb = oScrollExtension.getHorizontalScrollbar();
				const oVSb = oScrollExtension.getVerticalScrollbar();
				const oTouchObject = oEvent.touches ? oEvent.touches[0] : oEvent;

				_private(this).mTouchSessionData = {
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

			const oScrollExtension = this._getScrollExtension();
			const mTouchSessionData = _private(this).mTouchSessionData;

			if (!mTouchSessionData) {
				return;
			}

			const oTouchObject = oEvent.touches ? oEvent.touches[0] : oEvent;
			const iTouchDistanceX = (oTouchObject.pageX - mTouchSessionData.initialPageX);
			const iTouchDistanceY = (oTouchObject.pageY - mTouchSessionData.initialPageY);
			let bScrollingPerformed = false;

			if (!mTouchSessionData.touchMoveDirection) {
				if (iTouchDistanceX === 0 && iTouchDistanceY === 0) {
					return;
				}
				mTouchSessionData.touchMoveDirection = Math.abs(iTouchDistanceX) > Math.abs(iTouchDistanceY) ? "horizontal" : "vertical";
			}

			switch (mTouchSessionData.touchMoveDirection) {
				case "horizontal": {
					const oHSb = oScrollExtension.getHorizontalScrollbar();

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
				}
				case "vertical": {
					const oVSb = oScrollExtension.getVerticalScrollbar();

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
				}
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
			const oScrollExtension = oTable._getScrollExtension();
			const aEventListenerTargets = ScrollingHelper.getEventListenerTargets(oTable);

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
			const fnOnMouseWheelEventHandler = ScrollingHelper.onMouseWheelScrolling.bind(oTable, mOptions);

			for (let i = 0; i < aEventListenerTargets.length; i++) {
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
			const fnOnTouchStartEventHandler = ScrollingHelper.onTouchStart.bind(oTable, mOptions);
			const fnOnTouchMoveEventHandler = ScrollingHelper.onTouchMoveScrolling.bind(oTable, mOptions);
			let mListeners = {};

			for (let i = 0; i < aEventListenerTargets.length; i++) {
				/* Touch events */
				// Chrome on desktops and windows tablets - pointer events.
				// Other browsers and tablets - touch events.
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
			const oScrollExtension = oTable._getScrollExtension();
			const aEventTargets = ScrollingHelper.getEventListenerTargets(oTable);

			function removeEventListener(oTarget, mEventListenerMap) {
				for (const sEventName in mEventListenerMap) {
					const fnListener = mEventListenerMap[sEventName];
					if (fnListener) {
						oTarget.removeEventListener(sEventName, fnListener);
					}
				}
			}

			for (let i = 0; i < aEventTargets.length; i++) {
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
			const aEventListenerTargets = [
				// Safari does not support touch-action:none and touch-action:pan-x/y. That means, the user can scroll by touch actions anywhere
				// in the body of the table.
				oTable.getDomRef("tableCCnt")
			];

			return aEventListenerTargets.filter(function(oEventListenerTarget) {
				return oEventListenerTarget != null;
			});
		}
	};

	const ExtensionDelegate = {
		onBeforeRendering: function(oEvent) {
			this._getScrollExtension()._clearCache();
		},

		onAfterRendering: function(oEvent) {
			const oScrollExtension = this._getScrollExtension();
			const bRenderedRows = oEvent != null && oEvent.isMarked("renderRows");

			if (bRenderedRows) {
				oScrollExtension.updateVerticalScrollbarHeight();
				oScrollExtension.updateVerticalScrollHeight();
			}

			VerticalScrollingHelper.restoreScrollPosition(this, this.getBinding() != null);
			HorizontalScrollingHelper.restoreScrollPosition(this);
		},

		onfocusin: function(oEvent) {
			// Many browsers do not scroll the focused element into the viewport if it is partially visible. With this logic we ensure that the
			// focused cell always gets scrolled into the viewport. If the cell is wider than the row container, no action is performed.
			let oRowContainer;
			const oCellInfo = TableUtils.getCellInfo(oEvent.target);
			const oHSb = this._getScrollExtension().getHorizontalScrollbar();

			if (oCellInfo.isOfType(TableUtils.CELLTYPE.DATACELL)) {
				oRowContainer = this.getDomRef("sapUiTableCtrlScr");
			} else if (oCellInfo.isOfType(TableUtils.CELLTYPE.COLUMNHEADER)) {
				oRowContainer = this.getDomRef("sapUiTableColHdrScr");
			}

			if (oRowContainer && oHSb && oCellInfo.columnIndex >= this.getComputedFixedColumnCount()) {
				const $HSb = jQuery(oHSb);
				const oCell = oCellInfo.cell;
				const iCurrentScrollLeft = this._bRtlMode ? $HSb.scrollLeftRTL() : oHSb.scrollLeft;
				const iRowContainerWidth = oRowContainer.clientWidth;
				const iCellLeft = oCell.offsetLeft;
				const iCellRight = iCellLeft + oCell.offsetWidth;
				const iOffsetLeft = iCellLeft - iCurrentScrollLeft;
				const iOffsetRight = iCellRight - iRowContainerWidth - iCurrentScrollLeft;
				let iNewScrollLeft;

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

			// On focus, the browsers scroll elements which are not visible into the viewport. This causes scrolling inside table cells, which is not
			// desired. Flickering of the cell content cannot be avoided, as the browser performs scrolling after the event. This behavior cannot be
			// prevented, only reverted.
			const $ParentCell = TableUtils.getParentCell(this, oEvent.target);

			if ($ParentCell) {
				const that = this;
				const fnScrollBack = function() {
					const $InnerCellElement = $ParentCell.find(".sapUiTableCellInner");

					if ($InnerCellElement.length > 0) {
						if (that._bRtlMode) {
							$InnerCellElement.scrollLeftRTL($InnerCellElement[0].scrollWidth - $InnerCellElement[0].clientWidth);
						} else {
							$InnerCellElement[0].scrollLeft = 0;
						}
						$InnerCellElement[0].scrollTop = 0;
					}

					TableUtils.Hook.call(that, Hook.Signal, "EndFocusHandling");
					TableUtils.Hook.call(that, Hook.Signal, "EndTableUpdate");
				};

				TableUtils.Hook.call(this, Hook.Signal, "StartTableUpdate");
				TableUtils.Hook.call(this, Hook.Signal, "StartFocusHandling");
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
	 *   <i>Currently known restrictions:</i>
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
	 *  <i>Currently known restrictions:</i>
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
	 *   <i>Currently known restrictions:</i>
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
	const ScrollExtension = ExtensionBase.extend("sap.ui.table.extensions.Scrolling", /** @lends sap.ui.table.extensions.Scrolling.prototype */ {
		/**
		 * @override
		 * @inheritDoc
		 * @returns {string} The name of this extension.
		 */
		_init: function(oTable, sTableType, mSettings) {
			const _ = _private(oTable);

			// Horizontal scrolling
			_.oHorizontalScrollbar = null;
			_.iHorizontalScrollPosition = null;

			// Vertical scrolling
			_.oVerticalScrollbar = null;
			_.oVerticalScrollPosition = new ScrollPosition(oTable);
			_.pVerticalScrollUpdateProcess = null;

			// External vertical scrolling
			_.oExternalVerticalScrollbar = null;
			_.bIsVerticalScrollbarExternal = false;

			// Timers
			_.mTimeouts = {};
			_.mAnimationFrames = {};

			_.mTouchSessionData = null;
			_.aOnRowsUpdatedPreprocessors = [];

			TableUtils.addDelegate(oTable, ExtensionDelegate, oTable);
			return "ScrollExtension";
		},

		/**
		 * @override
		 * @inheritDoc
		 */
		_attachEvents: function() {
			const oTable = this.getTable();

			HorizontalScrollingHelper.addEventListeners(oTable);
			VerticalScrollingHelper.addEventListeners(oTable);
			ScrollingHelper.addEventListeners(oTable);
			TableUtils.Hook.register(oTable, TableUtils.Hook.Keys.Table.TotalRowCountChanged, VerticalScrollingHelper.onTotalRowCountChanged, oTable);
			TableUtils.Hook.register(oTable, TableUtils.Hook.Keys.Table.UpdateSizes, VerticalScrollingHelper.onUpdateTableSizes, oTable);
		},

		/**
		 * @override
		 * @inheritDoc
		 */
		_detachEvents: function() {
			const oTable = this.getTable();

			HorizontalScrollingHelper.removeEventListeners(oTable);
			VerticalScrollingHelper.removeEventListeners(oTable);
			ScrollingHelper.removeEventListeners(oTable);
			TableUtils.Hook.deregister(oTable, TableUtils.Hook.Keys.Table.TotalRowCountChanged, VerticalScrollingHelper.onTotalRowCountChanged, oTable);
			TableUtils.Hook.deregister(oTable, TableUtils.Hook.Keys.Table.UpdateSizes, VerticalScrollingHelper.onUpdateTableSizes, oTable);
		},

		/**
		 * @override
		 * @inheritDoc
		 */
		destroy: function() {
			const oTable = this.getTable();

			this._clearCache();

			if (oTable) {
				TableUtils.removeDelegate(oTable, ExtensionDelegate);

				if (_private(oTable).pVerticalScrollUpdateProcess) {
					_private(oTable).pVerticalScrollUpdateProcess.cancel();
					_private(oTable).pVerticalScrollUpdateProcess = null;
				}
			}

			ExtensionBase.prototype.destroy.apply(this, arguments);
		}
	});

	/**
	 * Scrolls the table by a row or a page. When scrolled down, the viewport is scrolled to the end, otherwise to the top.
	 *
	 * @param {boolean} [bDown=false] If <code>true</code>, the table is scrolled down, otherwise up.
	 * @param {boolean} [bPage=false] If <code>true</code>, the amount of visible scrollable rows (a page) is scrolled,
	 *                                otherwise a single row is scrolled.
	 */
	ScrollExtension.prototype.scrollVertically = function(bDown, bPage) {
		const oTable = this.getTable();

		if (!oTable) {
			return;
		}

		const mRowCounts = oTable._getRowCounts();
		const iFirstRenderedRowIndex = oTable._getFirstRenderedRowIndex();
		const iScrollDistance = bPage === true ? mRowCounts.scrollable : 1;

		if (bDown === true) {
			_private(oTable).oVerticalScrollPosition
							.setPosition(iFirstRenderedRowIndex + iScrollDistance, 1, ScrollPosition.OffsetType.PercentageOfViewport);
		} else {
			_private(oTable).oVerticalScrollPosition.setPosition(Math.max(0, iFirstRenderedRowIndex - iScrollDistance));
		}

		VerticalScrollingHelper.performUpdateFromScrollPosition(oTable);
	};

	/**
	 * Scrolls the table to the end or to the beginning. When scrolled down, the viewport is scrolled to the end, otherwise to the top.
	 *
	 * @param {boolean} [bDown=false] If <code>true</code>, the table is scrolled down, otherwise up.
	 */
	ScrollExtension.prototype.scrollVerticallyMax = function(bDown) {
		const oTable = this.getTable();

		if (!oTable) {
			return;
		}

		if (bDown === true) {
			_private(oTable).oVerticalScrollPosition
							.setPosition(oTable._getMaxFirstRenderedRowIndex(), 1, ScrollPosition.OffsetType.PercentageOfViewport);
		} else {
			_private(oTable).oVerticalScrollPosition.setPosition(0);
		}

		VerticalScrollingHelper.performUpdateFromScrollPosition(oTable);
	};

	/**
	 * Gets DOM reference of the horizontal scrollbar.
	 *
	 * @returns {HTMLElement|null} Returns <code>null</code>, if the horizontal scrollbar does not exist.
	 */
	ScrollExtension.prototype.getHorizontalScrollbar = function() {
		const oTable = this.getTable();

		if (!oTable) {
			return null;
		}

		if (!oTable._bInvalid && !_private(oTable).oHorizontalScrollbar) {
			// If the table is invalid and about to be (re-)rendered, the scrollbar element will be removed from DOM. The reference to the new
			// scrollbar element can be obtained only after rendering.
			// Table#getDomRef (document#getElementById) returns null if the element does not exist in the DOM.
			_private(oTable).oHorizontalScrollbar = oTable.getDomRef(SharedDomRef.HorizontalScrollBar);
		}

		return _private(oTable).oHorizontalScrollbar;
	};

	/**
	 * Gets DOM reference of the vertical scrollbar.
	 *
	 * @returns {HTMLElement|null} Returns <code>null</code>, if the vertical scrollbar does not exist.
	 */
	ScrollExtension.prototype.getVerticalScrollbar = function() {
		const oTable = this.getTable();
		const bIsExternal = this.isVerticalScrollbarExternal();

		if (!oTable) {
			return null;
		}

		if (!oTable._bInvalid && !_private(oTable).oVerticalScrollbar) {
			// The scrollbar element might not yet be in the DOM, for example if it is initially rendered, or going to be re-rendered as a child
			// of a control that is still using the old string-based rendering engine. In these cases, the reference to the new scrollbar element
			// can be obtained only after rendering.
			// Table#getDomRef (document#getElementById) returns null if the element does not exist in the DOM.
			_private(oTable).oVerticalScrollbar = oTable.getDomRef(SharedDomRef.VerticalScrollBar);

			if (!_private(oTable).oVerticalScrollbar && bIsExternal) {
				_private(oTable).oVerticalScrollbar = _private(oTable).oExternalVerticalScrollbar;
			}
		}

		const oScrollbar = _private(oTable).oVerticalScrollbar;

		if (oScrollbar && !bIsExternal && !oScrollbar.isConnected) {
			// The internal scrollbar was removed from DOM without notifying the table.
			// This can be the case, for example, if the parent of the table was made invisible.
			return null;
		}

		return oScrollbar;
	};

	/**
	 * Checks whether the horizontal scrollbar is visible.
	 *
	 * @returns {boolean} Returns <code>true</code>, if the horizontal scrollbar is visible.
	 */
	ScrollExtension.prototype.isHorizontalScrollbarVisible = function() {
		const oHSb = this.getHorizontalScrollbar();
		return oHSb != null && !oHSb.classList.contains("sapUiTableHidden");
	};

	/**
	 * Checks whether the vertical scrollbar is visible.
	 *
	 * @returns {boolean} Returns <code>true</code>, if the vertical scrollbar is visible.
	 */
	ScrollExtension.prototype.isVerticalScrollbarVisible = function() {
		const oVSb = this.getVerticalScrollbar();
		return oVSb != null && !oVSb.parentElement.classList.contains("sapUiTableHidden");
	};

	/**
	 *    Checks whether the vertical scrollbar is external.
	 *
	 * @returns {boolean} Whether the vertical scrollbar is external.
	 */
	ScrollExtension.prototype.isVerticalScrollbarExternal = function() {
		const oTable = this.getTable();
		return oTable ? _private(oTable).bIsVerticalScrollbarExternal : false;
	};

	/**
	 * Marks the vertical scrollbar as external. The reference to the external scrollbar is stored in the extension to be returned by
	 * <code>sap.ui.table.extensions.Scrolling#getVerticalScrollbar</code>
	 *
	 * @param {HTMLElement} oScrollbarElement The reference to the external scrollbar element.
	 */
	ScrollExtension.prototype.markVerticalScrollbarAsExternal = function(oScrollbarElement) {
		const oTable = this.getTable();

		if (oTable && oScrollbarElement) {
			_private(oTable).bIsVerticalScrollbarExternal = true;
			_private(oTable).oExternalVerticalScrollbar = oScrollbarElement;
		}
	};

	/**
	 * Updates the height of the vertical scrollbar.
	 */
	ScrollExtension.prototype.updateVerticalScrollbarHeight = function() {
		const oTable = this.getTable();
		const oVSb = this.getVerticalScrollbar();

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
		const oTable = this.getTable();

		if (!oTable) {
			return 0;
		}

		return oTable._getRowCounts()._scrollSize * oTable._getBaseRowHeight();
	};

	/**
	 * Updates the vertical scroll position.
	 *
	 * @param {boolean} [bExpectRowsUpdatedEvent=false] Whether an update of the rows will happen.
	 */
	ScrollExtension.prototype.updateVerticalScrollPosition = function(bExpectRowsUpdatedEvent) {
		const oTable = this.getTable();

		if (!oTable) {
			return;
		}

		bExpectRowsUpdatedEvent = bExpectRowsUpdatedEvent === true;

		if (bExpectRowsUpdatedEvent || oTable.getBinding()) {
			VerticalScrollingHelper.performUpdateFromFirstVisibleRow(oTable, bExpectRowsUpdatedEvent);
		} else {
			VerticalScrollingHelper.adjustScrollPositionToFirstVisibleRow(oTable);
		}
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
		const oVSb = this.getVerticalScrollbar();
		const oVSbContent = oVSb ? oVSb.firstChild : null;

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
		const oTable = this.getTable();

		if (!oTable) {
			return 0;
		}

		const iTotalRowCount = oTable._getTotalRowCount();
		const mRowCounts = oTable._getRowCounts();
		const iRowCount = Math.max(iTotalRowCount, mRowCounts.count);
		const iBaseRowHeight = oTable._getBaseRowHeight();
		let iScrollHeight;

		if (TableUtils.isVariableRowHeightEnabled(oTable)) {
			iScrollHeight = iBaseRowHeight * (iRowCount - 1 /* The last row is inside the buffer */)
							+ VerticalScrollingHelper.getScrollRangeBuffer(oTable);
		} else {
			iScrollHeight = iBaseRowHeight * iRowCount;
		}

		if (bBoundless === true) {
			return iScrollHeight;
		} else {
			return Math.min(MAX_VERTICAL_SCROLL_HEIGHT, iScrollHeight);
		}
	};

	/**
	 * Checks whether the vertical scrollbar is required.
	 *
	 * @returns {boolean} Returns <code>true</code>, if the vertical scrollbar is required.
	 */
	ScrollExtension.prototype.isVerticalScrollbarRequired = function() {
		const oTable = this.getTable();

		if (!oTable) {
			return false;
		}

		return TableUtils.isVariableRowHeightEnabled(oTable) && VerticalScrollingHelper.getScrollRangeOfViewport(oTable) > 0
			   || oTable._getTotalRowCount() > oTable._getRowCounts()._fullsize;
	};

	/**
	 * Adds mouse wheel event listeners to HTMLElements. Can only be used if synchronization is enabled.
	 *
	 * @param {HTMLElement[]} aEventListenerTargets The elements to add listeners to.
	 * @param {sap.ui.table.extensions.Scrolling.EventListenerOptions} mOptions The options.
	 * @returns {{wheel: Function}|null} A key value map containing the event names as keys and listener functions as values.
	 */
	ScrollExtension.prototype.registerForMouseWheel = function(aEventListenerTargets, mOptions) {
		const oTable = this.getTable();

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
		const oTable = this.getTable();

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
		const oTable = this.getTable();

		if (!oTable) {
			return;
		}

		// Clear cached DOM references.
		_private(oTable).oVerticalScrollbar = null;
		_private(oTable).oHorizontalScrollbar = null;
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