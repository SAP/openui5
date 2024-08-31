/*!
 * ${copyright}
 */

// Provides helper sap.ui.table.utils._ColumnUtils.
sap.ui.define([
	"sap/ui/Device",
	"../library",
	"sap/base/Log"
], function(Device, library, Log) {
	"use strict";

	/**
	 * Static collection of utility functions related to column of sap.ui.table.Table, ...
	 *
	 * Note: Do not access the functions of this helper directly, but via <code>sap.ui.table.utils.TableUtils.Column...</code>
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @namespace
	 * @alias sap.ui.table.utils._ColumnUtils
	 * @private
	 */
	const ColumnUtils = {

		TableUtils: null, // Avoid cyclic dependency. Will be filled by TableUtils

		/**
		 * Collects and updates the column info object if it's not yet defined.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @private
		 */
		initColumnUtils: function(oTable) {
			if (!oTable._oColumnInfo) {
				ColumnUtils.updateColumnInfo(oTable, ColumnUtils.collectColumnInfo(oTable));
			}
		},

		/**
		 * Invalidates the cached column utils information on changes.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 */
		invalidateColumnUtils: function(oTable) {
			oTable._oColumnInfo = null;
		},

		// TODO: @type definitions below does not work with the JSDoc generation -> should be cleaned up
		//  but not so important because the functions are anyhow private

		/**
		 * A Column info object.
		 * @typedef sap.ui.table.ColumnInfo
		 * @property {int} columnCount Number of columns in the columns aggregation.
		 * @property {int} visibleColumnCount Number of columns which should be rendered.
		 * @property {Object.<string, sap.ui.table.ColumnMapItem>} columnMap Map of detailed column information, keyed by column IDs
		 * @private
		 */

		/**
		 * Updates the column info object.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @param {sap.ui.table.ColumnInfo} oColumnInfo Column info object.
		 * @private
		 */
		updateColumnInfo: function(oTable, oColumnInfo) {
			oTable._oColumnInfo = oColumnInfo;
		},

		/**
		 * Collects and returns column info.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @returns {sap.ui.table.ColumnInfo} Map of detailed column information.
		 * @private
		 */
		collectColumnInfo: function(oTable) {
			return {
				columnCount: oTable.getColumns().length,
				visibleColumnCount: ColumnUtils.TableUtils.getVisibleColumnCount(oTable),
				columnMap: ColumnUtils.getColumnMap(oTable)
			};
		},

		/**
		 * @typedef sap.ui.table.ColumnMapItemLevelInfo
		 * @property {sap.ui.table.Column[]} spannedColumns Array of columns which are spanned by the source column
		 * @private
		 */

		/**
		 * @typedef sap.ui.table.ColumnMapItemParents
		 * @property {sap.ui.table.Column} column Column reference
		 * @property {int} level Level as which the parent resides
		 * @private
		 */

		/**
		 * Object with information about a column.
		 *
		 * @typedef sap.ui.table.ColumnMapItem
		 * @property {string} id Column ID
		 * @property {sap.ui.table.Column} column Column instance
		 * @property {sap.ui.table.ColumnMapItemLevelInfo[]} levelInfo Array of level information. Each index represents one level of headers
		 * @property {sap.ui.table.ColumnMapItemParents[]} parents Array of parents of the source column
		 * @private
		 */

		/**
		 * Collects and returns information about the current column configuration of the table.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @returns {Object.<string, sap.ui.table.ColumnMapItem>} Map of column information where the key is the column ID, and the value is a
		 * @private
		 */
		getColumnMap: function(oTable) {
			let i;
			let oColumn;
			let oColumnMapItem = {};
			const oColumnMap = {};
			const aColumns = oTable.getColumns();

			const iMaxLevel = ColumnUtils.TableUtils.getHeaderRowCount(oTable);

			const oParentReferences = {};

			for (let iColumnIndex = 0; iColumnIndex < aColumns.length; iColumnIndex++) {
				oColumn = aColumns[iColumnIndex];
				oColumnMapItem = {};
				oColumnMapItem.id = oColumn.getId();
				oColumnMapItem.column = oColumn;
				oColumnMapItem.levelInfo = [];
				oColumnMapItem.parents = [];

				for (let iLevel = 0; iLevel < iMaxLevel; iLevel++) {
					oColumnMapItem.levelInfo[iLevel] = {};
					oColumnMapItem.levelInfo[iLevel].spannedColumns = [];

					const iHeaderSpan = ColumnUtils.getHeaderSpan(oColumn, iLevel);
					// collect columns which are spanned by the current column
					for (i = 1; i < iHeaderSpan; i++) {
						const oSpannedColumn = aColumns[iColumnIndex + i];
						if (oSpannedColumn) {
							const sPannedColumnId = oSpannedColumn.getId();
							oColumnMapItem.levelInfo[iLevel].spannedColumns.push(aColumns[iColumnIndex + i]);
							if (!oParentReferences[sPannedColumnId]) {
								oParentReferences[sPannedColumnId] = [];
							}
							oParentReferences[sPannedColumnId].push({column: oColumn, level: iLevel});
						}
					}
				}

				oColumnMap[oColumnMapItem.id] = oColumnMapItem;
			}

			const aColumnIds = Object.keys(oParentReferences);
			for (i = 0; i < aColumnIds.length; i++) {
				const sColumnId = aColumnIds[i];
				oColumnMap[sColumnId].parents = oParentReferences[sColumnId];
			}

			return oColumnMap;
		},

		/**
		 * Get the column map item for the column identified by <code>sColumnId</code>.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @param {string} sColumnId ID of the column.
		 * @returns {sap.ui.table.ColumnMapItem | undefined} Column map item with detailed column information.
		 * @private
		 */
		getColumnMapItem: function(oTable, sColumnId) {
			ColumnUtils.initColumnUtils(oTable);
			const oSourceColumnMapItem = oTable._oColumnInfo.columnMap[sColumnId];
			if (!oSourceColumnMapItem) {
				Log.error("Column with ID '" + sColumnId + "' not found", oTable);
			} else {
				return oSourceColumnMapItem;
			}
		},

		/**
		 * Returns an array of the column information about all columns which span the column identified by sColumnId.
		 * If there is no "parent", it returns undefined.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @param {string} sColumnId ID of the column for which the Span-parent shall be found.
		 * @param {int} [iLevel] Level where the parent is looked up.
		 * @returns {Array.<{column: sap.ui.table.Column, level: int}>|undefined} Array of column information.
		 */
		getParentSpannedColumns: function(oTable, sColumnId, iLevel) {
			const oColumnMapItem = ColumnUtils.getColumnMapItem(oTable, sColumnId);
			if (!oColumnMapItem) {
				return undefined;
			}

			const aParents = [];
			for (let i = 0; i < oColumnMapItem.parents.length; i++) {
				const oParent = oColumnMapItem.parents[i];
				if (iLevel === undefined || oParent.level === iLevel) {
					aParents.push(oParent);
				}
			}

			return aParents;
		},

		/**
		 * Returns an array of the column information about all columns which are spanned by the column identified by sColumnId.
		 * If there is no "parent", it returns undefined.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @param {string} sColumnId ID of the column for which the Span-parent shall be found.
		 * @param {int} [iLevel] level where the parent is looked up.
		 * @returns {Array.<{column: sap.ui.table.Column, level: int}>|undefined} Array of column information.
		 * @private
		 */
		getChildrenSpannedColumns: function(oTable, sColumnId, iLevel) {
			const oColumnMapItem = ColumnUtils.getColumnMapItem(oTable, sColumnId);
			if (!oColumnMapItem) {
				return undefined;
			}

			const aChildren = [];
			let iEnd;
			if (iLevel === undefined) {
				iEnd = oColumnMapItem.levelInfo.length;
			} else {
				iEnd = iLevel + 1;
			}

			for (let i = iLevel || 0; i < iEnd; i++) {
				const oLevelInfo = oColumnMapItem.levelInfo[i];
				for (let j = 0; j < oLevelInfo.spannedColumns.length; j++) {
					aChildren.push({column: oLevelInfo.spannedColumns[j], level: i});
				}
			}

			return aChildren;
		},

		/**
		 * Returns the header span of a given column. If <code>iLevel</code> is provided, the header span of that
		 * header row is returned if there is any defined, otherwise the maximum header span is returned.
		 * If there is no header span for the level, 1 is returned as a default value.
		 *
		 * @param {sap.ui.table.Column} oColumn Column of which the header span shall be returned.
		 * @param {int} [iLevel=0] Zero-based index of the header span for multi-labels.
		 * @returns {int} Header span.
		 */
		getHeaderSpan: function(oColumn, iLevel) {
			let vHeaderSpans = oColumn.getHeaderSpan();
			let iHeaderSpan;

			if (!vHeaderSpans) {
				return 1;
			}

			if (!Array.isArray(vHeaderSpans)) {
				vHeaderSpans = (vHeaderSpans + "").split(",");
			}

			function getSpan(sSpan) {
				const result = parseInt(sSpan);
				return isNaN(result) ? 1 : result;
			}

			if (isNaN(iLevel)) { // find max value of all spans in the header
				iHeaderSpan = Math.max.apply(null, vHeaderSpans.map(getSpan));
			} else {
				iHeaderSpan = getSpan(vHeaderSpans[iLevel]);
			}

			return Math.max(iHeaderSpan, 1);
		},

		/**
		 * Returns the total header span of a column across all header levels.
		 *
		 * @param {sap.ui.table.Column} oColumn column of which the max header span shall be determined.
		 * @returns {int} Total header span of the column.
		 * @private
		 */
		getMaxHeaderSpan: function(oColumn) {
			return ColumnUtils.getHeaderSpan(oColumn);
		},

		/**
		 * Returns true if the column has a higher header span than 1.
		 *
		 * @param {sap.ui.table.Column} oColumn Column of the table.
		 * @returns {boolean} Whether the column has a higher header span than 1.
		 * @private
		 */
		hasHeaderSpan: function(oColumn) {
			return ColumnUtils.getHeaderSpan(oColumn) > 1;
		},

		/**
		 * Returns a map of the column boundaries for the column identified by <code>sColumnId</code>.
		 * This function considers all overlapping spans of columns to determine the start and end indices.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @param {string} sColumnId ID of the column.
		 * @returns {{startColumn: sap.ui.table.Column, startIndex: int, endColumn: sap.ui.table.Column, endIndex: int}|undefined}
		 * Map of column boundaries.
		 * @private
		 */
		getColumnBoundaries: function(oTable, sColumnId) {
			const oColumnMapItem = ColumnUtils.getColumnMapItem(oTable, sColumnId);
			if (!oColumnMapItem) {
				return undefined;
			}

			let mColumns = {};
			if (sColumnId) {
				// initialize the column map with the start column for which the boundaries shall be determined
				mColumns[sColumnId] = oColumnMapItem.column;
			}

			const fnTraverseColumnRelations = function(mColumns, aNewRelations) {
				let oColumn;
				let i;
				let aDirectRelations = [];
				aNewRelations = aNewRelations || [];

				// get the direct relations for all collected columns
				// columns have a logical relation with each other, if they are spanned by other column headers or
				// of they by itself are spanning other columns. Since those columns are logically tightly coupled,
				// they can be seen as an immutable block of columns.
				for (i = 0; i < aNewRelations.length; i++) {
					oColumn = mColumns[aNewRelations[i]];
					aDirectRelations = aDirectRelations.concat(ColumnUtils.getParentSpannedColumns(oTable, oColumn.getId()));
					aDirectRelations = aDirectRelations.concat(ColumnUtils.getChildrenSpannedColumns(oTable, oColumn.getId()));
				}

				aNewRelations = [];
				for (i = 0; i < aDirectRelations.length; i++) {
					oColumn = aDirectRelations[i].column;
					const sColumnId = oColumn.getId();
					if (!mColumns[sColumnId]) {
						// keep track about new found relations for later recursion to avoid collecting information about
						// already known related columns again.
						aNewRelations.push(sColumnId);
						mColumns[sColumnId] = oColumn;
					}
				}

				if (aNewRelations.length > 0) {
					// if new relations where found, another round of recursion is required to get the related columns
					// of the new relations. Afterwards merge the result with the already known related columns
					return fnTraverseColumnRelations(mColumns, aNewRelations);
				} else {
					return mColumns;
				}
			};

			mColumns = fnTraverseColumnRelations(mColumns, [sColumnId]);

			// all columns which are somehow related to each other by spanning column headers are collected now.
			// It is time to calculate the boundaries, which is the start index and the end index in the columns aggregation
			// of the table
			let iColumnIndex = oTable.indexOfColumn(oColumnMapItem.column);
			const mBoundaries = {startColumn: oColumnMapItem.column, startIndex: iColumnIndex, endColumn: oColumnMapItem.column, endIndex: -1};
			const aColumns = oTable.getColumns();
			const aKeys = Object.getOwnPropertyNames(mColumns);
			for (let i = 0; i < aKeys.length; i++) {
				const oColumn = mColumns[aKeys[i]];
				iColumnIndex = oTable.indexOfColumn(oColumn);
				const iHeaderSpan = ColumnUtils.getMaxHeaderSpan(oColumn);
				// start
				if (iColumnIndex < mBoundaries.startIndex) {
					mBoundaries.startIndex = iColumnIndex;
					mBoundaries.startColumn = oColumn;
				}

				const iEndIndex = iColumnIndex + iHeaderSpan - 1;
				// end
				if (iEndIndex > mBoundaries.endIndex) {
					mBoundaries.endIndex = iEndIndex;
					mBoundaries.endColumn = aColumns[iEndIndex];
				}
			}

			return mBoundaries;
		},

		/**
		 * Returns true if the column can be moved to another position.
		 *
		 * @param {sap.ui.table.Column} oColumn Column of the table.
		 * @param {boolean} [bIgnoreReorderingProperty=false] Indicates whether the table's <code>enableColumnReordering</code> property
		 * should be ignored for determining a movable column, regardless of whether it is enabled or not.
		 * @returns {boolean} Whether the column can be moved to another position.
		 */
		isColumnMovable: function(oColumn, bIgnoreReorderingProperty) {
			const oTable = oColumn._getTable();

			if (!oTable || (!oTable.getEnableColumnReordering() && !bIgnoreReorderingProperty)) {
				// Column reordering is not active at all
				return false;
			}

			const iCurrentIndex = oTable.indexOfColumn(oColumn);

			if (iCurrentIndex < oTable.getComputedFixedColumnCount() || iCurrentIndex < oTable._iFirstReorderableIndex) {
				// No movement of fixed columns or e.g. the first column in the TreeTable
				return false;
			}

			if (ColumnUtils.hasHeaderSpan(oColumn)
				|| ColumnUtils.getParentSpannedColumns(oTable, oColumn.getId()).length !== 0) {
				// No movement if the column is spanned by an other column or itself defines a span
				return false;
			}
			return true;
		},

		/**
		 * Checks and adapts the given index if needed.
		 *
		 * @param {sap.ui.table.Column} oColumn Column of the table.
		 * @param {int} iNewIndex The desired new index of the column in the current table setup.
		 * @returns {int} The corrected index.
		 * @private
		 */
		normalizeColumnMoveTargetIndex: function(oColumn, iNewIndex) {
			const oTable = oColumn._getTable();
			const iCurrentIndex = oTable.indexOfColumn(oColumn);
			const aColumns = oTable.getColumns();

			if (iNewIndex > iCurrentIndex) {
				// The index is always given for the current table setup
				// -> A move consists of a remove and an insert, so if a column is moved to a higher index the index must be shifted
				iNewIndex--;
			}
			if (iNewIndex < 0) {
				iNewIndex = 0;
			} else if (iNewIndex > aColumns.length) {
				iNewIndex = aColumns.length;
			}

			return iNewIndex;
		},

		/**
		 * Returns true if the column can be moved to the desired position.
		 *
		 * Note: The index must be given for the current table setup (which includes the column itself).
		 *
		 * @param {sap.ui.table.Column} oColumn Column of the table.
		 * @param {int} iNewIndex the desired new index of the column in the current table setup.
		 * @param {boolean} [bIgnoreReorderingProperty=false] Indicates whether the table's <code>enableColumnReordering</code> property
		 * should be ignored for determining a movable column, regardless of whether it is enabled or not.
		 * @returns {boolean} Whether the column can be moved to the desired position.
		 */
		isColumnMovableTo: function(oColumn, iNewIndex, bIgnoreReorderingProperty) {
			const oTable = oColumn._getTable();

			if (!oTable || iNewIndex === undefined || !ColumnUtils.isColumnMovable(oColumn, bIgnoreReorderingProperty)) {
				// Column is not movable at all
				return false;
			}

			iNewIndex = ColumnUtils.normalizeColumnMoveTargetIndex(oColumn, iNewIndex);

			if (iNewIndex < oTable.getComputedFixedColumnCount() || iNewIndex < oTable._iFirstReorderableIndex) {
				// No movement of fixed columns or e.g. the first column in the TreeTable
				return false;
			}

			const iCurrentIndex = oTable.indexOfColumn(oColumn);
			const aColumns = oTable.getColumns();

			if (iNewIndex > iCurrentIndex) { // Column moved to higher index
				// The column to be moved will appear after this column.
				const oBeforeColumn = aColumns[iNewIndex >= aColumns.length ? aColumns.length - 1 : iNewIndex];
				const oTargetBoundaries = ColumnUtils.getColumnBoundaries(oTable, oBeforeColumn.getId());
				if (ColumnUtils.hasHeaderSpan(oBeforeColumn) || oTargetBoundaries.endIndex > iNewIndex) {
					return false;
				}
			} else {
				const oAfterColumn = aColumns[iNewIndex]; // The column to be moved will appear before this column.
				if (ColumnUtils.getParentSpannedColumns(oTable, oAfterColumn.getId()).length !== 0) {
					// If column which is currently at the desired target position is spanned by previous columns
					// also the column to reorder would be spanned after the move.
					return false;
				}
			}

			return true;
		},

		/**
		 * Moves the column to the desired position.
		 *
		 * Note: The index must be given for the current table setup (which includes the column itself).
		 *
		 * @param {sap.ui.table.Column} oColumn Column of the table.
		 * @param {sap.ui.table.Column} iNewIndex the desired new index of the column in the current table setup.
		 * @returns {boolean} Whether the column was moved to the desired position.
		 */
		moveColumnTo: function(oColumn, iNewIndex) {
			if (!ColumnUtils.isColumnMovableTo(oColumn, iNewIndex)) {
				return false;
			}

			const oTable = oColumn._getTable();
			const iCurrentIndex = oTable.indexOfColumn(oColumn);

			if (iNewIndex === iCurrentIndex) {
				return false;
			}

			iNewIndex = ColumnUtils.normalizeColumnMoveTargetIndex(oColumn, iNewIndex);

			const bExecuteDefault = oTable.fireColumnMove({
				column: oColumn,
				newPos: iNewIndex
			});

			if (!bExecuteDefault) {
				// No execution of the movement when event default is prevented
				return false;
			}

			oTable._bReorderInProcess = true;

			/* The AnalyticalBinding does not support calls like:
			 * oBinding.updateAnalyticalInfo(...);
			 * oBinding.getContexts(...);
			 * oBinding.updateAnalyticalInfo(...);
			 * oBinding.getContexts(...);
			 * A call chain like above can lead to some problems:
			 * - A request according to the analytical info passed in line 1 would be sent, but not for the info in line 3.
			 * - After the change event (updateRows) the binding returns an incorrect length of 0.
			 * The solution is to only trigger a request at the end of a process.
			 */
			oTable.removeColumn(oColumn, true);
			oTable.insertColumn(oColumn, iNewIndex);

			oTable._bReorderInProcess = false;

			return true;
		},

		/**
		 * Returns the minimal possible column width in pixels.
		 *
		 * @returns {int} The minimal possible column width in pixels.
		 */
		getMinColumnWidth: function() {
			return Device.system.desktop ? 48 : 88;
		},

		/**
		 * Resizes the given column to its optimal width.
		 * Cleans up the state which is created while resizing a column via drag&drop
		 * and sets the new width to the column.
		 *
		 * @param {sap.ui.table.Column} oColumn The column which should be resized
		 * @private
		 */
		autoResizeColumn: function(oColumn) {
			const oTable = oColumn._getTable();
			const sCurrentWidth = oColumn.getWidth();
			const iNewWidth = ColumnUtils._calculateColumnWidth(oColumn);

			if (iNewWidth + "px" !== sCurrentWidth) {
				ColumnUtils.resizeColumn(oTable, oColumn, iNewWidth);
			}
		},

		/**
		 * Calculates the widest content width of the currently visible column cells including headers.
		 * Headers with column span are not taken into account.
		 *
		 * @param {sap.ui.table.Column} oColumn The column control
		 * @returns {int} iWidth Calculated column width
		 * @private
		 */
		_calculateColumnWidth: function(oColumn) {
			const oTableElement = oColumn._getTable().getDomRef();
			const oHiddenArea = document.createElement("div");

			oHiddenArea.classList.add("sapUiTableHiddenSizeDetector", "sapUiTableHeaderDataCell", "sapUiTableDataCell");
			oTableElement.appendChild(oHiddenArea);

			// Create a copy of all visible cells in the column, including the header cells without colspan
			const aCells = Array.from(oTableElement.querySelectorAll(`td[data-sap-ui-colid="${oColumn.getId()}"]:not([colspan])`))
				.filter((element) => !element.classList.contains("sapUiTableHidden"))
				.map((element) => element.firstElementChild.cloneNode(true));

			aCells.forEach((cell) => {
				cell.removeAttribute('id');
				oHiddenArea.appendChild(cell);
			});

			// Determine the column width
			let iWidth = oHiddenArea.getBoundingClientRect().width + 4; // widest cell + 4px for borders and rounding
			const iTableWidth = oTableElement.querySelector('.sapUiTableCnt').getBoundingClientRect().width;
			iWidth = Math.min(iWidth, iTableWidth); // no wider as the table
			iWidth = Math.max(iWidth, ColumnUtils.getMinColumnWidth()); // not too small

			oTableElement.removeChild(oHiddenArea);

			return Math.round(iWidth);
		},

		/**
		 * Resizes one or more visible columns to the specified amount of pixels.
		 *
		 * In case a column span is specified:
		 * The span covers only visible columns. If columns directly after the column with index <code>iColumnIndex</code> are invisible they
		 * will be skipped and not be considered for resizing.
		 * The new width <code>iWidth</code> will be equally applied among all resizable columns in the span of visible columns,
		 * considering the minimum column width. The actual resulting width might differ due to rounding errors and the minimum column width.
		 *
		 * Resizing of a column won't be performed if the ColumnResize event is fired
		 * and execution of the default action is prevented in the event handler.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @param {int} oColumn The column which should be resized
		 * @param {int} iWidth The width in pixel to set the column or column span to. Must be greater than 0.
		 * @param {boolean} [bFireEvent=true] Whether the ColumnResize event should be fired. The event will be fired for every resized column.
		 * @param {int} [iColumnSpan=1] The span of columns to resize beginning from <code>iColumnIndex</code>.
		 * @returns {boolean} Returns <code>true</code>, if at least one column has been resized.
		 */
		resizeColumn: function(oTable, oColumn, iWidth, bFireEvent = true, iColumnSpan = 1) {
			if (!oTable || !oColumn ||
				iWidth == null || iWidth <= 0) {
				return false;
			}

			const aVisibleColumns = ColumnUtils._getVisibleColumnsInSpan(oTable, oColumn.getIndex(), iColumnSpan);
			const aResizableColumns = ColumnUtils._getResizableColumns(aVisibleColumns);

			if (aResizableColumns.length === 0) {
				return false;
			}

			const iSpanWidth = ColumnUtils._calculateSpanWidth(oTable, aVisibleColumns);

			if (!ColumnUtils.TableUtils.isFixedColumn(oTable, oColumn.getIndex())) {
				ColumnUtils._fixAutoColumns(oTable, aResizableColumns);
			}

			const iPixelDelta = iWidth - iSpanWidth;
			return ColumnUtils._performResize(oTable, aResizableColumns, iPixelDelta, bFireEvent);
		},

		/**
		 * Returns an <code>Array</code> of visible columns inside the resized column by the number of <code>iColumnSpan</code>.
		 * The <code>iColumnSpan</code> is used when the table has multiple headers and one of this header gets
		 * resized via keyboard. If due so we resize all columns represented in the <code>iColumnSpan</code> uniformly.
		 *
		 * Assuming iColumnIndex = 1 and iColumnSpan = 2
		 * |--          --|--       Multi Header      --|--          --|
		 * |--          --|--          Span 2         --|--          --|
		 * |-- Column A --|-- Column B --|-- Column C --|-- Column D --|
		 * |-- Index 0  --|-- Index 1  --|-- Index 2  --|-- Inddex 3 --|
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table
		 * @param {int} iColumnIndex Starting column index
		 * @param {int} iColumnSpan Number of columns within the header span beginning from <code>iColumnIndex</code>
		 * @returns {sap.ui.table.Column[]} aVisibleColumns Array of visible columns
		 * @private
		 */
		_getVisibleColumnsInSpan: function(oTable, iColumnIndex, iColumnSpan) {
			const aColumns = oTable.getColumns();
			if (iColumnIndex >= aColumns.length || !aColumns[iColumnIndex].getVisible()) {
				return false;
			}

			const aVisibleColumns = [];
			for (let i = iColumnIndex; i < aColumns.length; i++) {
				const oColumn = aColumns[i];

				if (oColumn.getVisible()) {
					aVisibleColumns.push(oColumn);

					// Consider only the required amount of visible columns.
					if (aVisibleColumns.length === iColumnSpan) {
						break;
					}
				}
			}
			return aVisibleColumns;
		},

		/**
		 * Returns an <code>Array</code> of <code>sap.ui.table.Column</code> which property
		 * <code>resizable</code> is set to <code>true</code>.
		 *
		 * @param {sap.ui.table.Column[]} aVisibleColumns Array of visible columns
		 * @returns {sap.ui.table.Column[]} aResizableColumns Array of resizable columns
		 * @private
		 */
		_getResizableColumns: function(aVisibleColumns) {
			const aResizableColumns = [];

			for (let i = 0; i < aVisibleColumns.length; i++) {
				const oVisibleColumn = aVisibleColumns[i];
				if (oVisibleColumn.getResizable()) {
					aResizableColumns.push(oVisibleColumn);
				}
			}
			return aResizableColumns;
		},

		/**
		 * Fix Columns with property <code>{@link sap.ui.table.Column#getWidth} = auto<code>.
		 * If a column was resized in the scrollable area:
		 * Set minimum widths of all columns with variable width except those in aResizableColumns.
		 * As a result, flexible columns cannot shrink smaller as their current width after the resize
		 * (see {@link sap.ui.table.Table#setMinColWidths}).
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table
		 * @param {sap.ui.table.Column[]} aResizableColumns Array of resizable columns
		 */
		_fixAutoColumns: function(oTable, aResizableColumns) {
			const oTableElement = oTable.getDomRef();

			oTable._getVisibleColumns().forEach(function(oColumn) {
				const sWidth = oColumn.getWidth();
				let $columnElement;

				if (oTableElement && aResizableColumns.indexOf(oColumn) < 0 && ColumnUtils.TableUtils.isVariableWidth(sWidth)) {
					$columnElement = oTableElement.querySelector("th[data-sap-ui-colid=\"" + oColumn.getId() + "\"]");
					if ($columnElement) {
						oColumn._minWidth = Math.max($columnElement.offsetWidth, ColumnUtils.getMinColumnWidth());
					}
				}
			});
		},

		/**
		 * Calculate and returns the actual width of the header span which is getting resized.
		 * The amount is a sum of the column widths of all columns within in the header span.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table
		 * @param {sap.ui.table.Column[]} aVisibleColumns Array of visible columns within the header span
		 * @returns {int} iSpanWidth The width of the resizing header span
		 * @private
		 */
		_calculateSpanWidth: function(oTable, aVisibleColumns) {
			let iSpanWidth = 0;
			for (let i = 0; i < aVisibleColumns.length; i++) {
				const oVisibleColumn = aVisibleColumns[i];
				iSpanWidth += ColumnUtils.getColumnWidth(oTable, oVisibleColumn.getIndex());
			}

			return iSpanWidth;
		},

		/**
		 * Sets the new width to one or more columns.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table
		 * @param {sap.ui.table.Column[]} aResizableColumns Array of resizable columns
		 * @param {int} iPixelDelta The new calculated width which should be destributed by the number of <code>aResizableColumns</code>
		 * @param {boolean} bFireEvent Whether the ColumnResize event should be fired. The event will be fired for every resized column.
		 * @returns {boolean} Returns <code>true</code>, if at least one column has been resized.
		 */
		_performResize: function(oTable, aResizableColumns, iPixelDelta, bFireEvent) {
			// when resizing a header span the new width must be destributed by the number of underlying columns
			// of course when resizing a single column via D&D iPixelDelta is automatically the new column width
			let iSharedPixelDelta = Math.round(iPixelDelta / aResizableColumns.length);
			let bResizeWasPerformed = false;

			// Resize all resizable columns. Share the width change (pixel delta) between them.
			for (let i = 0; i < aResizableColumns.length; i++) {
				const oResizableColumn = aResizableColumns[i];
				const iColumnWidth = ColumnUtils.getColumnWidth(oTable, oResizableColumn.getIndex());
				let iNewWidth = iColumnWidth + iSharedPixelDelta;
				const iColMinWidth = ColumnUtils.getMinColumnWidth();

				if (iNewWidth < iColMinWidth) {
					iNewWidth = iColMinWidth;
				}

				const iWidthChange = iNewWidth - iColumnWidth;

				// Distribute any remaining delta to the remaining columns.
				if (Math.abs(iWidthChange) < Math.abs(iSharedPixelDelta)) {
					const iRemainingColumnCount = aResizableColumns.length - (i + 1);
					iPixelDelta -= iWidthChange;
					iSharedPixelDelta = Math.round(iPixelDelta / iRemainingColumnCount);
				}

				if (iWidthChange !== 0) {
					let bExecuteDefault = true;
					const sWidth = iNewWidth + "px";

					if (bFireEvent) {
						bExecuteDefault = oTable.fireColumnResize({
							column: oResizableColumn,
							width: sWidth
						});
					}

					if (bExecuteDefault) {
						oResizableColumn.setWidth(sWidth);
						bResizeWasPerformed = true;
					}
				}
			}

			return bResizeWasPerformed;
		},

		/**
		 * Returns the width of a visible column in pixels.
		 * In case the width is set to auto or in percentage, the <code>offsetWidth</code> of the columns DOM element will be returned.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @param {int} iColumnIndex The index of a column. Must be a visible column.
		 * @returns {int | null} Returns <code>null</code> if <code>iColumnIndex</code> is out of bound.
		 *                       Returns 0, if the column is not visible, or not yet rendered, and its width is not specified in pixels.
		 */
		getColumnWidth: function(oTable, iColumnIndex) {
			if (!oTable ||
				iColumnIndex == null || iColumnIndex < 0) {
				return null;
			}

			const aColumns = oTable.getColumns();
			if (iColumnIndex >= aColumns.length) {
				return null;
			}

			const oColumn = aColumns[iColumnIndex];
			const sColumnWidth = oColumn.getWidth();

			// If the columns width is "auto" or specified in percentage, get the width from the DOM.
			if (sColumnWidth === "" || sColumnWidth === "auto" || sColumnWidth.match(/%$/)) {
				if (oColumn.getVisible()) {
					const oColumnElement = oColumn.getDomRef();
					return oColumnElement ? oColumnElement.offsetWidth : 0;
				} else {
					return 0;
				}
			} else {
				return ColumnUtils.TableUtils.convertCSSSizeToPixel(sColumnWidth);
			}
		},

		/**
		 * Returns one of the following starting with highest priority:
		 * <ul>
		 * <li>name of the column</li>
		 * <li>Last label of the column with a span equal to 1, if the column has multiLabels</li>
		 * <li>label</li>
		 * </ul>
		 *
		 * @param {sap.ui.table.Column} oColumn Instance of the column
		 * @returns {string} Returns the column header text
		 */
		getHeaderText: function(oColumn) {
			return oColumn.getName() || ColumnUtils.getHeaderLabel(oColumn)?.getText?.() || "";
		},

		/**
		 * Returns one of the following starting with highest priority:
		 * <ul>
		 * <li>Last label of the column with a span equal to 1, if the column has multiLabels</li>
		 * <li>label control</li>
		 * </ul>
		 *
		 * @param {sap.ui.table.Column} oColumn Instance of the column
		 * @returns {sap.ui.core.Control | null} Returns the column header label, or <code>null</code> if no label is found
		 */
		getHeaderLabel: function(oColumn) {
			let oLabel;
			const aMultiLabels = oColumn.getMultiLabels();

			for (let i = aMultiLabels.length - 1; i >= 0; i--) {
				if (ColumnUtils.getHeaderSpan(oColumn, i) === 1) {
					oLabel = aMultiLabels[i];
					break;
				}
			}

			if (!oLabel) {
				oLabel = oColumn.getLabel();
			}

			return oLabel;
		}
	};

	return ColumnUtils;

});