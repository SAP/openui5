/*!
 * ${copyright}
 */

// Provides helper sap.ui.table.TableScrollExtension.
sap.ui.define(['jquery.sap.global', './TableExtension', './TableUtils', 'sap/ui/Device', './library'],
	function(jQuery, TableExtension, TableUtils, Device, library) {
	"use strict";

	// Shortcuts
	var SharedDomRef = library.SharedDomRef;

	/*
	 * Provides utility functions used by this extension.
	 */
	var ExtensionHelper = {
		onFixedAreaHorizontalScrolling: function(oEvent) {
			oEvent.target.scrollLeft = 0;
		},

		/**
		 * Will be called when scrolled horizontally. Because the table does not render/update the data of all columns (only the visible ones),
		 * we need to update the content of the columns which became visible.
		 * @param oEvent
		 */
		onHorizontalScrolling: function(oEvent) {
			var oScrollExtension = this._getScrollExtension();

			// For interaction detection.
			jQuery.sap.interaction.notifyScrollEvent && jQuery.sap.interaction.notifyScrollEvent(oEvent);

			if (this._bOnAfterRendering) {
				return;
			}

			var sTableId = this.getId();
			var sHsbId = sTableId + "-" + SharedDomRef.HorizontalScrollBar;
			var sHeaderScrollId = sTableId + "-sapUiTableColHdrScr";
			var sContentScrollId = sTableId + "-sapUiTableCtrlScr";

			// Prevent that the synchronization of the scrolling positions causes subsequent synchronizations
			// due to triggering the scroll events of the other scrollable areas.
			if (oEvent.target.id === sHsbId) {
				if (oScrollExtension._bHScrollHsbBlocked) {
					oScrollExtension._bHScrollHsbBlocked = false;
					return;
				} else {
					oScrollExtension._bHScrollHeaderBlocked = true;
					oScrollExtension._bHScrollContentBlocked = true;
				}
			} else if (oEvent.target.id === sHeaderScrollId) {
				if (oScrollExtension._bHScrollHeaderBlocked) {
					oScrollExtension._bHScrollHeaderBlocked = false;
					return;
				} else {
					oScrollExtension._bHScrollHsbBlocked = true;
					oScrollExtension._bHScrollContentBlocked = true;
				}
			} else if (oEvent.target.id === sContentScrollId) {
				if (oScrollExtension._bHScrollContentBlocked) {
					oScrollExtension._bHScrollContentBlocked = false;
					return;
				} else {
					oScrollExtension._bHScrollHsbBlocked = true;
					oScrollExtension._bHScrollHeaderBlocked = true;
				}
			}

			// Synchronize the scroll positions.
			var iScrollLeft = oEvent.target.scrollLeft;
			if (oEvent.target.id !== sHsbId) {
				document.getElementById(sHsbId).scrollLeft = iScrollLeft;
			}
			if (oEvent.target.id !== sHeaderScrollId) {
				document.getElementById(sHeaderScrollId).scrollLeft = iScrollLeft;
			}
			if (oEvent.target.id !== sContentScrollId) {
				document.getElementById(sContentScrollId).scrollLeft = iScrollLeft;
			}

			this._determineVisibleCols(this._collectTableSizes());
		},

		/**
		 * Will be called when scrolled vertically. Updates the visualized data by applying the first visible row from the vertical scrollbar.
		 * @param oEvent
		 */
		onVerticalScrolling: function(oEvent) {
			var oScrollExtension = this._getScrollExtension();

			// For interaction detection.
			jQuery.sap.interaction.notifyScrollEvent && jQuery.sap.interaction.notifyScrollEvent(oEvent);

			// Do not scroll in action mode!
			this._getKeyboardExtension().setActionMode(false);

			/**
			 * Adjusts the first visible row to the new horizontal scroll position.
			 * @param {sap.ui.table.Table} oTable Instance of the table.
			 */
			function updateVisibleRow(oTable) {
				var oVSb = oTable.getDomRef(SharedDomRef.VerticalScrollBar);

				if (!oVSb) {
					return;
				}

				var iScrollTop = oVSb.scrollTop;

				if (TableUtils.isVariableRowHeightEnabled(oTable)) {
					oTable._iScrollTop = iScrollTop;
					oTable._adjustTablePosition(iScrollTop, oTable._aRowHeights);
				}

				oTable.setFirstVisibleRow(oTable._getFirstVisibleRowByScrollTop(iScrollTop), true);
			}

			if (this._bLargeDataScrolling && !this._bIsScrolledByWheel) {
				window.clearTimeout(oScrollExtension._mTimeouts.scrollUpdateTimerId);
				oScrollExtension._mTimeouts.scrollUpdateTimerId = window.setTimeout(function () {
					updateVisibleRow(this);
					oScrollExtension._mTimeouts._sScrollUpdateTimerId = null;
				}.bind(this), 300);
			} else {
				updateVisibleRow(this);
			}
			this._bIsScrolledByWheel = false;
		},

		/**
		 * Will be called when scrolled with the mouse wheel.
		 * @param oEvent
		 */
		onMouseWheelScrolling: function(oEvent) {
				var oOriginalEvent = oEvent.originalEvent;
				var bIsHorizontal = oOriginalEvent.shiftKey;
				var iScrollDelta = 0;

				if (bIsHorizontal) {
					iScrollDelta = oOriginalEvent.deltaX;
				} else {
					iScrollDelta = oOriginalEvent.deltaY;
				}

				if (bIsHorizontal) {
					var oHsb = this.getDomRef(SharedDomRef.HorizontalScrollBar);
					if (oHsb) {
						oHsb.scrollLeft = oHsb.scrollLeft + iScrollDelta;
					}
				} else {
					var oVsb = this.getDomRef(SharedDomRef.VerticalScrollBar);
					if (oVsb) {
						this._bIsScrolledByWheel = true;
						var iRowsPerStep = iScrollDelta / this._getDefaultRowHeight();
						// If at least one row is scrolled, floor to full rows.
						// Below one row, we scroll pixels.
						if (iRowsPerStep > 1) {
							iRowsPerStep = Math.floor(iRowsPerStep);
						}
						oVsb.scrollTop += iRowsPerStep * this._getScrollingPixelsForRow();
					}
				}

				oEvent.preventDefault();
				oEvent.stopPropagation();
		}
	};

	/*
	 * Event handling for scrolling.
	 * "this" in the function context is the table instance.
	 */
	var ExtensionDelegate = {
		ontouchstart: function(oEvent) {
			if (this._isTouchMode(oEvent)) {
				this._aTouchStartPosition = null;
				this._bIsScrollVertical = null;
				var $scrollTargets = this._getScrollTargets();
				var bDoScroll = jQuery(oEvent.target).closest($scrollTargets).length > 0;
				if (bDoScroll) {
					var oTouch = oEvent.targetTouches[0];
					this._aTouchStartPosition = [oTouch.pageX, oTouch.pageY];
					var oVsb = this.getDomRef(SharedDomRef.VerticalScrollBar);
					if (oVsb) {
						this._iTouchScrollTop = oVsb.scrollTop;
					}

					var oHsb = this.getDomRef(SharedDomRef.HorizontalScrollBar);
					if (oHsb) {
						this._iTouchScrollLeft = oHsb.scrollLeft;
					}
				}
			}
		},

		ontouchmove: function(oEvent) {
			if (this._isTouchMode(oEvent) && this._aTouchStartPosition) {
				var oTouch = oEvent.targetTouches[0];
				var iDeltaX = (oTouch.pageX - this._aTouchStartPosition[0]);
				var iDeltaY = (oTouch.pageY - this._aTouchStartPosition[1]);
				if (this._bIsScrollVertical == null) {
					this._bIsScrollVertical = Math.abs(iDeltaY) > Math.abs(iDeltaX);
				}

				if (this._bIsScrollVertical) {
					var oVsb = this.getDomRef(SharedDomRef.VerticalScrollBar);
					if (oVsb) {
						var iScrollTop = this._iTouchScrollTop - iDeltaY;

						if (iScrollTop > 0 && iScrollTop < (this.getDomRef("vsb-content").clientHeight - oVsb.clientHeight) - 1) {
							oEvent.preventDefault();
							oEvent.stopPropagation();
						}
						oVsb.scrollTop = iScrollTop;
					}
				} else {
					var oHsb = this.getDomRef(SharedDomRef.HorizontalScrollBar);
					if (oHsb) {
						var iScrollLeft = this._iTouchScrollLeft - iDeltaX;

						if (iScrollLeft > 0 && iScrollLeft < (this.getDomRef("hsb-content").clientWidth - oHsb.clientWidth) - 1) {
							oEvent.preventDefault();
							oEvent.stopPropagation();
						}
						oHsb.scrollLeft = iScrollLeft;
					}
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
		 * @see TableExtension._init
		 */
		_init : function(oTable, sTableType, mSettings) {
			this._type = sTableType;
			this._delegate = ExtensionDelegate;

			// Register the delegate
			oTable.addEventDelegate(this._delegate, oTable);

			return "ScrollExtension";
		},

		/*
		 * @see TableExtension._attachEvents
		 */
		_attachEvents : function() {
			var oTable = this.getTable();
			var $Table = oTable.$();

			// Horizontal scrolling
			var $HSb = jQuery(oTable.getDomRef(SharedDomRef.HorizontalScrollBar));
			var $HeaderScroll = jQuery(oTable.getDomRef("sapUiTableColHdrScr"));
			var $FixedHeaderScroll = $Table.find(".sapUiTableColHdrFixed");
			var $ContentScroll = jQuery(oTable.getDomRef("sapUiTableCtrlScr"));
			var $FixedContentScroll = jQuery(oTable.getDomRef("sapUiTableCtrlScrFixed"));

			$HSb.on("scroll.sapUiTableHScroll", ExtensionHelper.onHorizontalScrolling.bind(oTable));
			$HeaderScroll.on("scroll", ExtensionHelper.onHorizontalScrolling.bind(oTable));
			$ContentScroll.on("scroll", ExtensionHelper.onHorizontalScrolling.bind(oTable));
			$FixedContentScroll.on("scroll", ExtensionHelper.onHorizontalScrolling.bind(oTable));
			$FixedHeaderScroll.on("scroll.sapUiTableFixedHeaderHScroll", ExtensionHelper.onFixedAreaHorizontalScrolling);
			$FixedContentScroll.on("scroll.sapUiTableFixedContentHScroll", ExtensionHelper.onFixedAreaHorizontalScrolling);

			// Vertical scrolling
			var $VSb = jQuery(oTable.getDomRef(SharedDomRef.VerticalScrollBar));
			$VSb.on("scroll.sapUiTableVScroll", ExtensionHelper.onVerticalScrolling.bind(oTable));

			// Mouse wheel
			oTable._getScrollTargets().on("wheel.sapUiTableMouseWheel", ExtensionHelper.onMouseWheelScrolling.bind(oTable));
		},

		/*
		 * @see TableExtension._detachEvents
		 */
		_detachEvents : function() {
			var oTable = this.getTable();
			var $Table = oTable.$();

			// Horizontal scrolling
			var $HSb = jQuery(oTable.getDomRef(SharedDomRef.HorizontalScrollBar));
			var $HeaderScroll = jQuery(oTable.getDomRef("sapUiTableColHdrScr"));
			var $FixedHeaderScroll = $Table.find(".sapUiTableColHdrFixed");
			var $ContentScroll = jQuery(oTable.getDomRef("sapUiTableCtrlScr"));
			var $FixedContentScroll = jQuery(oTable.getDomRef("sapUiTableCtrlScrFixed"));

			$HSb.off("scroll.sapUiTableHScroll");
			$HeaderScroll.off("scroll");
			$ContentScroll.off("scroll");
			$FixedContentScroll.off("scroll");
			$FixedHeaderScroll.off("scroll.sapUiTableFixedHeaderHScroll");
			$FixedContentScroll.off("scroll.sapUiTableFixedContentHScroll");

			// Vertical scrolling
			var $VSb = jQuery(oTable.getDomRef(SharedDomRef.VerticalScrollBar));

			$VSb.off("scroll.sapUiTableVScroll");

			// Mouse wheel
			oTable._getScrollTargets().off("wheel.sapUiTableMouseWheel");
		},

		/*
		 * Enables debugging for the extension.
		 */
		_debug : function() {
			this._ExtensionHelper = ExtensionHelper;
			this._ExtensionDelegate = ExtensionDelegate;
		},

		/*
		 * @see sap.ui.base.Object#destroy
		 */
		destroy : function() {
			// Deregister the delegates
			var oTable = this.getTable();
			if (oTable) {
				oTable.removeEventDelegate(this._delegate);
			}
			this._delegate = null;

			TableExtension.prototype.destroy.apply(this, arguments);
		}

		// "Public" functions which allow the table to communicate with this extension should go here

	});

	return TableScrollExtension;

}, /* bExport= */ true);