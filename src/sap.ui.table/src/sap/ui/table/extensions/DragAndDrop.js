/*!
 * ${copyright}
 */

// Provides helper sap.ui.table.extensions.DragAndDrop.
sap.ui.define([
	"./ExtensionBase", "../utils/TableUtils", "sap/ui/core/library"
], function(ExtensionBase, TableUtils, CoreLibrary) {
	"use strict";

	const SESSION_DATA_KEY_NAMESPACE = "sap.ui.table";
	const DropPosition = CoreLibrary.dnd.DropPosition;

	const ExtensionHelper = {
		/**
		 * Gets the session data from the drag session. To get the session data that is shared by all table instances, do not specify a key.
		 *
		 * @param {Object} oDragSession The drag session.
		 * @param {string} [sKey=undefined] The key of the session data.
		 * @returns {any} The session data.
		 */
		getSessionData: function(oDragSession, sKey) {
			return oDragSession.getComplexData(SESSION_DATA_KEY_NAMESPACE + (sKey == null ? "" : "-" + sKey));
		},

		/**
		 * Sets the session data to the drag session. To set the session data that is shared by all table instances, do not specify a key.
		 *
		 * @param {Object} oDragSession The drag session.
		 * @param {any} oSessionData The session data.
		 * @param {string} [sKey=undefined] The key of the session data.
		 */
		setSessionData: function(oDragSession, oSessionData, sKey) {
			oDragSession.setComplexData(SESSION_DATA_KEY_NAMESPACE + (sKey == null ? "" : "-" + sKey), oSessionData);
		},

		/**
		 * Gets the session data of an instance from the drag session.
		 *
		 * @param {Object} oDragSession The drag session.
		 * @param {sap.ui.table.Table} oTable The instance of the table, for which to get the session data.
		 * @returns {any} The session data.
		 */
		getInstanceSessionData: function(oDragSession, oTable) {
			return this.getSessionData(oDragSession, oTable.getId());
		},

		/**
		 * Sets the session data of an instance to the drag session.
		 *
		 * @param {Object} oDragSession The drag session.
		 * @param {sap.ui.table.Table} oTable The instance of the table, for which to set the session data.
		 * @param {any} oSessionData The session data.
		 */
		setInstanceSessionData: function(oDragSession, oTable, oSessionData) {
			this.setSessionData(oDragSession, oSessionData, oTable.getId());
		},

		scrollVertically: TableUtils.throttle(function(oTable, bDown, iBase, iPercentage) {
			const oVerticalScrollbar = oTable._getScrollExtension().getVerticalScrollbar();
			oVerticalScrollbar.scrollTop += this.calculateScrollDistance(iBase, iPercentage) * (bDown ? 1 : -1);
		}, 50),

		scrollHorizontally: TableUtils.throttle(function(oTable, bRight, iBase, iPercentage) {
			const oHorizontalScrollbar = oTable._getScrollExtension().getHorizontalScrollbar();
			oHorizontalScrollbar.scrollLeft += this.calculateScrollDistance(iBase, iPercentage) * (bRight ? 1 : -1);
		}, 50),

		calculateScrollDistance: function(iBase, iPercentage) {
			const iMinDistance = 2;
			const iMaxDistance = 50;
			const nRate = iPercentage / iBase;

			return Math.max(iMinDistance, Math.round(iMaxDistance * nRate));
		}
	};

	const ExtensionDelegate = {
		ondragstart: function(oEvent) {
			const oDragSession = oEvent.dragSession;

			if (!oDragSession || !oDragSession.getDragControl()) {
				return;
			}

			const oDraggedControl = oDragSession.getDragControl();
			const oSessionData = {};

			if (oDraggedControl.isA("sap.ui.table.Row")) {
				if (oDraggedControl.isEmpty() || oDraggedControl.isGroupHeader() || oDraggedControl.isSummary()) {
					oEvent.preventDefault();
					return;
				} else {
					// To be able to identify whether a row is dropped on itself we need to compare the contexts. The row index is not reliable. The
					// indexing of the table can change, for example by expanding a node.
					oSessionData.draggedRowContext = oDraggedControl.getRowBindingContext();
				}
			}

			ExtensionHelper.setInstanceSessionData(oDragSession, this, oSessionData);
		},

		ondragenter: function(oEvent) {
			const oDragSession = oEvent.dragSession;

			if (!oDragSession || !oDragSession.getDropControl()) {
				return;
			}

			let oSessionData = ExtensionHelper.getInstanceSessionData(oDragSession, this);
			const oDraggedControl = oDragSession.getDragControl();
			const oDropControl = oDragSession.getDropControl();

			if (!oSessionData) {
				oSessionData = {};
			}

			if (oDropControl.isA("sap.ui.table.Row")) {
				/*
				 * Rows which must not be droppable:
				 * - Itself // TODO: Should this be possible, e.g. for copying a row/node next to or into itself?
				 * - Empty rows (rows without context), if the drop position is "On"
				 * - Group header rows
				 * - Sum rows
				 */
				const oDraggedRowContext = oSessionData.draggedRowContext;
				const oDropRowContext = oDropControl.getRowBindingContext();
				const sDropPosition = oDragSession.getDropInfo().getDropPosition();

				if ((oDropControl.isEmpty() && sDropPosition === DropPosition.On && TableUtils.hasData(this)) // On empty row, table has data
					|| (oDraggedRowContext && oDraggedRowContext === oDropRowContext) // The dragged row itself
					|| oDropControl.isGroupHeader()
					|| oDropControl.isSummary()) {
					oEvent.setMarked("NonDroppable");
				} else {
					// If dragging over an empty row with a drop position other than "On", the drop control should be the first non-empty row. If
					// all rows are empty, the drop target should be the table to perform a drop in aggregation.
					if (!oDropRowContext) {
						const oLastNonEmptyRow = this.getRows()[TableUtils.getNonEmptyRowCount(this) - 1];
						oDragSession.setDropControl(oLastNonEmptyRow || this);
					}

					// Because the vertical scrollbar can appear after expanding rows on "longdragover", the dimensions of the drop indicator
					// always need to be updated. The only exception is when all rows are empty. In this case a "drop in aggregation" will be
					// performed, for which no indicator adjustment is necessary.
					if (oDragSession.getDropControl() !== this) {
						const bVerticalScrollbarVisible = this.getDomRef().classList.contains("sapUiTableVScr");
						const mTableCntRect = this.getDomRef("sapUiTableCnt").getBoundingClientRect();
						oDragSession.setIndicatorConfig({
							width: mTableCntRect.width - (bVerticalScrollbarVisible ? 16 : 0),
							left: mTableCntRect.left + (this._bRtlMode && bVerticalScrollbarVisible ? 16 : 0)
						});
					}
				}
			} else if (oDropControl.isA("sap.ui.table.Column")) {
				const iTargetColumnIndex = TableUtils.getCellInfo(TableUtils.getCell(this, oEvent.target)).columnIndex;

				if (oDraggedControl.isA("sap.ui.table.Column")
					&& !TableUtils.Column.isColumnMovableTo(oDraggedControl, iTargetColumnIndex, true)) {
					oEvent.setMarked("NonDroppable");
					return;
				}

				const mTableCntRect = this.getDomRef("sapUiTableCnt").getBoundingClientRect();
				oDragSession.setIndicatorConfig({
					height: mTableCntRect.height - (this._getScrollExtension().isHorizontalScrollbarVisible() ? 16 : 0)
				});
			} else if (oDraggedControl === oDropControl) {
				oEvent.setMarked("NonDroppable");
			}

			/*
			 * Add common drag session data:
			 * - Boundaries for vertical scrolling
			 * - Boundaries for horizontal scrolling
			 */

			// TODO: The updates of session data can be done more efficiently by remembering the scrollbar visibilities and only update if needed.

			// It is unlikely, that during a drag&drop action the horizontal scrollbar appears or disappears,
			// therefore the vertical scroll edge only needs to be set once.
			if (!oSessionData.verticalScrollEdge) {
				const iPageYOffset = window.pageYOffset;
				const mVerticalScrollRect = this.getDomRef("table").getBoundingClientRect();
				oSessionData.verticalScrollEdge = {
					bottom: mVerticalScrollRect.bottom + iPageYOffset,
					top: mVerticalScrollRect.top + iPageYOffset
				};
			}

			// Because the vertical scrollbar can appear after expanding rows on "longdragover",
			// the horizontal scroll edge always needs to be updated.
			const iPageXOffset = window.pageXOffset;
			const mHorizontalScrollRect = this.getDomRef("sapUiTableCtrlScr").getBoundingClientRect();
			oSessionData.horizontalScrollEdge = {
				left: mHorizontalScrollRect.left + iPageXOffset,
				right: mHorizontalScrollRect.right + iPageXOffset
			};

			ExtensionHelper.setInstanceSessionData(oDragSession, this, oSessionData);
		},

		ondragover: function(oEvent) {
			const oDragSession = oEvent.dragSession;

			if (!oDragSession) {
				return;
			}

			const oSessionData = ExtensionHelper.getInstanceSessionData(oDragSession, this);

			if (!oSessionData) {
				return;
			}

			const iThreshold = 50;
			const oDropControl = oDragSession.getDropControl();
			const oScrollExtension = this._getScrollExtension();
			const oVerticalScrollbar = oScrollExtension.getVerticalScrollbar();
			const oHorizontalScrollbar = oScrollExtension.getHorizontalScrollbar();
			const oVerticalScrollEdge = oSessionData.verticalScrollEdge;
			const oHorizontalScrollEdge = oSessionData.horizontalScrollEdge;

			if (oVerticalScrollEdge && oVerticalScrollbar && oDropControl !== this) {
				const iPageY = oEvent.pageY;

				if (iPageY >= oVerticalScrollEdge.top - iThreshold && iPageY <= oVerticalScrollEdge.top + iThreshold) {
					ExtensionHelper.scrollVertically(this, false, iThreshold * 2, oVerticalScrollEdge.top + iThreshold - iPageY);
				} else if (iPageY <= oVerticalScrollEdge.bottom + iThreshold && iPageY >= oVerticalScrollEdge.bottom - iThreshold) {
					ExtensionHelper.scrollVertically(this, true, iThreshold * 2, iPageY - oVerticalScrollEdge.bottom + iThreshold);
				}
			}

			if (oHorizontalScrollEdge && oHorizontalScrollbar && oDropControl !== this) {
				const iPageX = oEvent.pageX;

				if (iPageX >= oHorizontalScrollEdge.left - iThreshold && iPageX <= oHorizontalScrollEdge.left + iThreshold) {
					ExtensionHelper.scrollHorizontally(this, false, iThreshold * 2, oHorizontalScrollEdge.left + iThreshold - iPageX);
				} else if (iPageX <= oHorizontalScrollEdge.right + iThreshold && iPageX >= oHorizontalScrollEdge.right - iThreshold) {
					ExtensionHelper.scrollHorizontally(this, true, iThreshold * 2, iPageX - oHorizontalScrollEdge.right + iThreshold);
				}
			}
		},

		onlongdragover: function(oEvent) {
			const oDragSession = oEvent.dragSession;

			if (!oDragSession) {
				return;
			}

			const $Cell = TableUtils.getCell(this, oEvent.target);
			const iRowIndex = TableUtils.getCellInfo($Cell).rowIndex;
			const oRow = iRowIndex == null ? null : this.getRows()[iRowIndex];
			const oDropControl = oDragSession.getDropControl();

			if (oRow && (oDropControl === oRow || !oDropControl)) {
				oRow.expand();
			}
		},

		ondragend: function(oEvent) {
			ExtensionHelper.scrollVertically.cancel();
			ExtensionHelper.scrollHorizontally.cancel();
		}
	};

	/**
	 * Extension for sap.ui.table.Table which handles drag and drop.
	 *
	 * @class Extension for sap.ui.table.Table which handles drag and drop.
	 *
	 * @extends sap.ui.table.extensions.ExtensionBase
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @alias sap.ui.table.extensions.DragAndDrop
	 */
	const DragAndDropExtension = ExtensionBase.extend("sap.ui.table.extensions.DragAndDrop",
		/** @lends sap.ui.table.extensions.DragAndDrop.prototype */ {
		/**
		 * @override
		 * @inheritDoc
		 * @returns {string} The name of this extension.
		 */
		_init: function(oTable, sTableType, mSettings) {
			this._oDelegate = ExtensionDelegate;

			TableUtils.addDelegate(oTable, this._oDelegate, oTable);

			return "DragAndDropExtension";
		},

		/**
		 * Enables debugging for the extension. Internal helper classes become accessible.
		 *
		 * @private
		 */
		_debug: function() {
			this._ExtensionDelegate = ExtensionDelegate;
		},

		/**
		 * @override
		 * @inheritDoc
		 */
		destroy: function() {
			const oTable = this.getTable();

			if (oTable) {
				oTable.removeEventDelegate(this._oDelegate);
			}

			ExtensionHelper.scrollVertically.cancel();
			ExtensionHelper.scrollHorizontally.cancel();
			this._oDelegate = null;
			ExtensionBase.prototype.destroy.apply(this, arguments);
		}
	});

	return DragAndDropExtension;

	});

/**
 * Gets the drag & drop extension.
 *
 * @name sap.ui.table.Table#_getDragAndDropExtension
 * @function
 * @returns {sap.ui.table.extensions.DragAndDrop} The drag & drop extension.
 * @private
 */