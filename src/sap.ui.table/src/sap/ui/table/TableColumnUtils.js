/*!
 * ${copyright}
 */

// Provides helper sap.ui.table.TableUtils.
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Element', 'sap/ui/Device', './library'],
	function(jQuery, Element, Device, library) {
		"use strict";

		/**
		 * Static collection of utility functions related to column of sap.ui.table.Table, ...
		 *
		 * Note: Do not access the function of this helper directly but via <code>sap.ui.table.TableUtils.Column...</code>
		 *
		 * @author SAP SE
		 * @version ${version}
		 * @namespace
		 * @name sap.ui.table.TableColumnUtils
		 * @private
		 */
		var TableColumnUtils = {

			TableUtils : null, // Avoid cyclic dependency. Will be filled by TableUtils

			/**
			 * Collects and updates the column info object when it's not yet defined
			 * @param {sap.ui.table.Table} oTable instance of the table
			 * @private
			 */
			initColumnUtils : function(oTable) {
				if (!oTable._oColumnInfo) {
					TableColumnUtils.updateColumnInfo(oTable, TableColumnUtils.collectColumnInfo(oTable));
				}
			},

			/**
			 * Invalidates the cached column utils information on changes.
			 * @param {sap.ui.table.Table} oTable instance of the table
			 * @private
			 */
			invalidateColumnUtils : function(oTable) {
				oTable._oColumnInfo = null;
			},

			//TBD: @type definitions below does not work with the JSDoc generation -> should be cleaned up
			//     but not so important because the functions are anyhow private

			/**
			 * Updates the column info object
			 * @param {sap.ui.table.Table} oTable instance of the table
			 * @param {ColumnInfo} oColumnInfo column info object
			 *
			 * @type {Object} ColumnInfo
			 * @type {int} ColumnInfo.columnCount Number of columns in the columns aggregation
			 * @type {int} ColumnInfo.visibleColumnCount Number of columns which should be rendered
			 * @type {ColumnMap} ColumnInfo.columnMap Map of detailed column information
			 * @private
			 */
			updateColumnInfo : function(oTable, oColumnInfo) {
				oTable._oColumnInfo = oColumnInfo;
			},

			/**
			 * Collects and returns column info
			 * @param {sap.ui.table.Table} oTable instance of the table
			 *
			 * @returns {ColumnInfo} Map of detailed column information
			 * @private
			 */
			collectColumnInfo : function(oTable) {
				return {
					columnCount: oTable.getColumns().length,
					visibleColumnCount: TableColumnUtils.TableUtils.getVisibleColumnCount(oTable),
					columnMap : TableColumnUtils._getColumnMap(oTable)
				};
			},

			/**
			 * Collects and returns information about the current column configuration of the table
			 * @param {sap.ui.table.Table} oTable instance of the table
			 *
			 * @type {Object} ColumnMapItemLevelInfo
			 * @type {sap.ui.table.Column[]} ColumnMapItemLevelInfo.spannedColumns Array of columns which are spanned by the source column
			 *
			 * @type {Object} ColumnMapItemParents
			 * @type {sap.ui.table.Column} ColumnMapItemParents.column Column reference
			 * @type {int} ColumnMapItemParents.level Level as which the parent resides
			 *
			 * @type {Object} ColumnMapItem
			 * @type {string} oColumnMapItem.id Column ID
			 * @type {sap.ui.table.Column} oColumnManItem.column Column instance
			 * @type {ColumnMapItemLevelInfo[]} oColumnMapItem.levelInfo Array of level information. Each index represents one level of headers
			 * @type {ColumnMapItemParents[]} oColumnMapItem.parents Array of parents of the source column
			 *
			 * @type {Object.<string, ColumnMapItem>} ColumnMap
			 * @type {ColumnMapItem} ColumnMap.<columnID> Object with information about column where the column ID is the key
			 *
			 * @returns {ColumnMap} Map of column information where the key is the column ID
			 * @private
			 */
			_getColumnMap : function(oTable) {
				var i;
				var oColumn;
				var oColumnMapItem = {};
				var oColumnMap = {};
				var aColumns = oTable.getColumns();

				var iMaxLevel = TableColumnUtils.TableUtils.getHeaderRowCount(oTable);

				var oParentReferences = {};

				for (var iColumnIndex = 0; iColumnIndex < aColumns.length; iColumnIndex++) {
					oColumn = aColumns[iColumnIndex];
					oColumnMapItem = {};
					oColumnMapItem.id = oColumn.getId();
					oColumnMapItem.column = oColumn;
					oColumnMapItem.levelInfo = [];
					oColumnMapItem.parents = [];

					for (var iLevel = 0; iLevel < iMaxLevel; iLevel++) {
						oColumnMapItem.levelInfo[iLevel] = {};
						oColumnMapItem.levelInfo[iLevel].spannedColumns = [];

						var iHeaderSpan = TableColumnUtils.getHeaderSpan(oColumn, iLevel);
						// collect columns which are spanned by the current column
						for (i = 1; i < iHeaderSpan; i++) {
							var oSpannedColumn = aColumns[iColumnIndex + i];
							if (oSpannedColumn) {
								var sPannedColumnId = oSpannedColumn.getId();
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

				var aColumnIds = Object.keys(oParentReferences);
				for (i = 0; i < aColumnIds.length; i++) {
					var sColumnId = aColumnIds[i];
					oColumnMap[sColumnId].parents = oParentReferences[sColumnId];
				}

				return oColumnMap;
			},

			/**
			 * Get the column map item for the column identified by <code>sColumnId</code>
			 * @param {sap.ui.table.Table} oTable instance of the table
			 * @param {string} sColumnId ID of the column
			 * @returns {ColumnMapItem|undefined} Column map item with detailed column information
			 * @private
			 */
			_getColumnMapItem : function (oTable, sColumnId) {
				TableColumnUtils.initColumnUtils(oTable);
				var oSourceColumnMapItem = oTable._oColumnInfo.columnMap[sColumnId];
				if (!oSourceColumnMapItem) {
					jQuery.sap.log.error("Column with ID '" + sColumnId + "' not found", oTable);
				} else {
					return oSourceColumnMapItem;
				}
			},

			/**
			 * Returns an array of the column information about all columns which span the column identified by sColumnId.
			 * If there is no "parent", it returns undefined
			 * @param {sap.ui.table.Table} oTable Table instance
			 * @param {string} sColumnId ID of the column for which the Span-parent shall be found
			 * @param {int} [iLevel] level where the parent is looked up
			 *
			 * @returns {Array.<{column: sap.ui.table.Column, level: int}>|undefined} Array of column information
			 * @private
			 */
			getParentSpannedColumns : function(oTable, sColumnId, iLevel) {
				var oColumnMapItem = TableColumnUtils._getColumnMapItem(oTable, sColumnId);
				if (!oColumnMapItem) {
					return undefined;
				}

				var aParents = [];
				for (var i = 0; i < oColumnMapItem.parents.length; i++) {
					var oParent = oColumnMapItem.parents[i];
					if (iLevel === undefined || oParent.level === iLevel) {
						aParents.push(oParent);
					}
				}

				return aParents;
			},

			/**
			 * Returns an array of the column information about all columns which are spanned by the column identified by sColumnId.
			 * If there is no "parent", it returns undefined
			 * @param {sap.ui.table.Table} oTable Table instance
			 * @param {string} sColumnId ID of the column for which the Span-parent shall be found
			 * @param {int} [iLevel] level where the parent is looked up
			 *
			 * @returns {Array.<{column: sap.ui.table.Column, level: int}>|undefined} Array of column information
			 * @private
			 */
			getChildrenSpannedColumns : function(oTable, sColumnId, iLevel) {
				var oColumnMapItem = TableColumnUtils._getColumnMapItem(oTable, sColumnId);
				if (!oColumnMapItem) {
					return undefined;
				}

				var aChildren = [];
				var iEnd;
				if (iLevel === undefined) {
					iEnd = oColumnMapItem.levelInfo.length;
				} else {
					iEnd = iLevel + 1;
				}

				for (var i = iLevel || 0; i < iEnd; i++) {
					var oLevelInfo = oColumnMapItem.levelInfo[i];
					for (var j = 0; j < oLevelInfo.spannedColumns.length; j++) {
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
			 * @param {sap.ui.table.Column} oColumn Column of which the header span shall be returned
			 * @param {int} [iLevel=0] Zero-based index of the header span for multi-labels
			 * @returns {int} Header span
			 * @private
			 */
			getHeaderSpan : function(oColumn, iLevel) {
				var vHeaderSpans = oColumn.getHeaderSpan();
				var iHeaderSpan;

				if (!vHeaderSpans) {
					return 1;
				}

				if (!Array.isArray(vHeaderSpans)) {
					vHeaderSpans = (vHeaderSpans + "").split(",");
				}

				function getSpan(sSpan) {
					var result = parseInt(sSpan, 10);
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
			 * Returns the total header span of a column across all header levels
			 * @param {sap.ui.table.Column} oColumn column of which the max header span shall be determined
			 * @returns {int} Total header span of the column
			 * @private
			 */
			getMaxHeaderSpan : function(oColumn) {
				return TableColumnUtils.getHeaderSpan(oColumn);
			},

			/**
			 * Returns true if the column has a higher header span than 1
			 * @param {sap.ui.table.Column} oColumn column of the table
			 * @returns {boolean} True if the column has a higher header span than 1
			 * @private
			 */
			hasHeaderSpan : function(oColumn) {
				return TableColumnUtils.getHeaderSpan(oColumn) > 1;
			},

			/**
			 * Returns a map of the column boundaries for the column identified by <code>sColumnId</code>.
			 * This function considers all overlapping spans of columns to determine the start and end indeces
			 *
			 * @param {sap.ui.table.Table} oTable Instance of the table
			 * @param {string} sColumnId ID of the column
			 * @returns {{startColumn: sap.ui.table.Column, startIndex: int, endColumn: sap.ui.table.Column, endIndex: int}|undefined} Map of column boundaries
			 * @private
			 */
			getColumnBoundaries : function(oTable, sColumnId) {
				var oColumnMapItem = TableColumnUtils._getColumnMapItem(oTable, sColumnId);
				if (!oColumnMapItem) {
					return undefined;
				}

				var mColumns = {};
				if (sColumnId) {
					// initialize the column map with the start column for which the boundaries shall be determined
					mColumns[sColumnId] = oColumnMapItem.column;
				}

				var fnTraverseColumnRelations = function (mColumns, aNewRelations) {
					var oColumn;
					var i;
					var aDirectRelations = [];
					aNewRelations = aNewRelations || [];

					// get the direct relations for all collected columns
					// columns have a logical relation with each other, if they are spanned by other column headers or
					// of they by itself are spanning other columns. Since those columns are logically tightly coupled,
					// they can be seen as an immutable block of columns.
					for (i = 0; i < aNewRelations.length; i++) {
						oColumn = mColumns[aNewRelations[i]];
						aDirectRelations = aDirectRelations.concat(TableColumnUtils.getParentSpannedColumns(oTable, oColumn.getId()));
						aDirectRelations = aDirectRelations.concat(TableColumnUtils.getChildrenSpannedColumns(oTable, oColumn.getId()));
					}

					aNewRelations = [];
					for (i = 0; i < aDirectRelations.length; i++) {
						oColumn = aDirectRelations[i].column;
						var sColumnId = oColumn.getId();
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
				var iColumnIndex = oTable.indexOfColumn(oColumnMapItem.column);
				var mBoundaries = {startColumn: oColumnMapItem.column, startIndex: iColumnIndex, endColumn: oColumnMapItem.column, endIndex: -1};
				var aColumns = oTable.getColumns();
				var aKeys = Object.getOwnPropertyNames(mColumns);
				for (var i = 0; i < aKeys.length; i++) {
					var oColumn = mColumns[aKeys[i]];
					iColumnIndex = oTable.indexOfColumn(oColumn);
					var iHeaderSpan = TableColumnUtils.getMaxHeaderSpan(oColumn);
					// start
					if (iColumnIndex < mBoundaries.startIndex) {
						mBoundaries.startIndex = iColumnIndex;
						mBoundaries.startColumn = oColumn;
					}

					var iEndIndex = iColumnIndex + iHeaderSpan - 1;
					// end
					if (iEndIndex > mBoundaries.endIndex) {
						mBoundaries.endIndex = iEndIndex;
						mBoundaries.endColumn = aColumns[iEndIndex];
					}
				}

				return mBoundaries;
			},

			/**
			 * Returns true if the column can be moved to another position
			 * @param {sap.ui.table.Column} oColumn column of the table
			 * @returns {boolean} True if the column can be moved to another position
			 * @private
			 */
			isColumnMovable : function(oColumn) {
				var oTable = oColumn.getParent();
				if (!oTable || !oTable.getEnableColumnReordering()) {
					// Column reordering is not active at all
					return false;
				}

				var iCurrentIndex = oTable.indexOfColumn(oColumn);

				if (iCurrentIndex < oTable.getFixedColumnCount() || iCurrentIndex < oTable._iFirstReorderableIndex) {
					// No movement of fixed columns or e.g. the first column in the TreeTable
					return false;
				}

				if (TableColumnUtils.hasHeaderSpan(oColumn)
					|| TableColumnUtils.getParentSpannedColumns(oTable, oColumn.getId()).length != 0) {
					// No movement if the column is spanned by an other column or itself defines a span
					return false;
				}
				return true;
			},

			/**
			 * Checks and adapts the given index if needed.
			 * @param {sap.ui.table.Column} oColumn column of the table
			 * @param {int} iNewIndex the desired new index of the column in the CURRENT table setup
			 * @returns {int} the corrected index
			 * @private
			 */
			_normalizeColumnMoveTargetIndex : function(oColumn, iNewIndex) {
				var oTable = oColumn.getParent(),
					iCurrentIndex = oTable.indexOfColumn(oColumn),
					aColumns = oTable.getColumns();

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
			 * @param {sap.ui.table.Column} oColumn column of the table
			 * @param {int} iNewIndex the desired new index of the column in the CURRENT table setup
			 * @returns {boolean} True if the column can be moved to the desired position
			 * @private
			 */
			isColumnMovableTo : function(oColumn, iNewIndex) {
				var oTable = oColumn.getParent();

				if (!oTable || iNewIndex === undefined || !TableColumnUtils.isColumnMovable(oColumn)) {
					// Column is not movable at all
					return false;
				}

				iNewIndex = TableColumnUtils._normalizeColumnMoveTargetIndex(oColumn, iNewIndex);

				if (iNewIndex < oTable.getFixedColumnCount() || iNewIndex < oTable._iFirstReorderableIndex) {
					// No movement of fixed columns or e.g. the first column in the TreeTable
					return false;
				}

				var iCurrentIndex = oTable.indexOfColumn(oColumn),
					aColumns = oTable.getColumns();

				if (iNewIndex > iCurrentIndex) { // Column moved to higher index
					var oBeforeColumn = aColumns[iNewIndex >= aColumns.length ? aColumns.length - 1 : iNewIndex]; // The column to be moved will appear after this column.
					var oTargetBoundaries = TableColumnUtils.getColumnBoundaries(oTable, oBeforeColumn.getId());
					if (TableColumnUtils.hasHeaderSpan(oBeforeColumn) || oTargetBoundaries.endIndex > iNewIndex) {
						return false;
					}
				} else {
					var oAfterColumn = aColumns[iNewIndex]; // The column to be moved will appear before this column.
					if (TableColumnUtils.getParentSpannedColumns(oTable, oAfterColumn.getId()).length != 0) {
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
			 * @param {sap.ui.table.Column} oColumn column of the table
			 * @param {sap.ui.table.Column} iNewIndex the desired new index of the column in the CURRENT table setup
			 * @returns {boolean} True if the column was moved to the desired position
			 * @private
			 */
			moveColumnTo : function(oColumn, iNewIndex) {
				if (!TableColumnUtils.isColumnMovableTo(oColumn, iNewIndex)) {
					return false;
				}

				var oTable = oColumn.getParent(),
					iCurrentIndex = oTable.indexOfColumn(oColumn);

				if (iNewIndex === iCurrentIndex) {
					return false;
				}

				iNewIndex = TableColumnUtils._normalizeColumnMoveTargetIndex(oColumn, iNewIndex);

				var bExecuteDefault = oTable.fireColumnMove({
					column: oColumn,
					newPos: iNewIndex
				});

				if (!bExecuteDefault) {
					// No execution of the movement when event default is prevented
					return false;
				}

				oTable._bReorderInProcess = true;
				oTable.removeColumn(oColumn);
				oTable.insertColumn(oColumn, iNewIndex);
				oTable._bReorderInProcess = false;

				return true;
			},

			/**
			 * Returns the minimal possible column width in pixels.
			 *
			 * @returns {int} The minimal possible column width in pixels
			 * @private
			 */
			getMinColumnWidth: function() {
				if (this._iColMinWidth) {
					return this._iColMinWidth;
				}
				this._iColMinWidth = 48;
				if (!Device.system.desktop) {
					this._iColMinWidth = 88;
				}
				return this._iColMinWidth;
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
			 * @param {int} iColumnIndex The index of a column. Must the index of a visible column.
			 * @param {int} iWidth The width in pixel to set the column or column span to. Must be greater than 0.
			 * @param {boolean} [bFireEvent=true] Whether the ColumnResize event should be fired. The event will be fired for every resized column.
			 * @param {int} [iColumnSpan=1] The span of columns to resize beginning from <code>iColumnIndex</code>.
			 * @return {boolean} Returns <code>true</code>, if at least one column has been resized.
			 * @private
			 */
			resizeColumn: function(oTable, iColumnIndex, iWidth, bFireEvent, iColumnSpan) {
				if (oTable == null ||
					iColumnIndex == null || iColumnIndex < 0 ||
					iWidth == null || iWidth <= 0) {
					return false;
				}
				if (iColumnSpan == null || iColumnSpan <= 0) {
					iColumnSpan = 1;
				}
				if (bFireEvent == null) {
					bFireEvent = true;
				}

				var aColumns = oTable.getColumns();
				if (iColumnIndex >= aColumns.length || !aColumns[iColumnIndex].getVisible()) {
					return false;
				}

				var aVisibleColumns = [];
				for (var i = iColumnIndex; i < aColumns.length; i++) {
					var oColumn = aColumns[i];

					if (oColumn.getVisible()) {
						aVisibleColumns.push(oColumn);

						// Consider only the required amount of visible columns.
						if (aVisibleColumns.length === iColumnSpan) {
							break;
						}
					}
				}

				var aResizableColumns = [];
				for (var i = 0; i < aVisibleColumns.length; i++) {
					var oVisibleColumn = aVisibleColumns[i];
					if (oVisibleColumn.getResizable()) {
						aResizableColumns.push(oVisibleColumn);
					}
				}
				if (aResizableColumns.length === 0) {
					return false;
				}

				var iSpanWidth = 0;
				for (var i = 0; i < aVisibleColumns.length; i++) {
					var oVisibleColumn = aVisibleColumns[i];
					iSpanWidth += TableColumnUtils.getColumnWidth(oTable, oVisibleColumn.getIndex());
				}

				var iPixelDelta = iWidth - iSpanWidth;
				var iSharedPixelDelta = Math.round(iPixelDelta / aResizableColumns.length);
				var bResizeWasPerformed = false;

				var oTableElement = oTable.getDomRef();

				// Fix Auto Columns if a column in the scrollable area was resized:
				// Set minimum widths of all columns with variable width except those in aResizableColumns.
				// As a result, flexible columns cannot shrink smaller as their current width after the resize
				// (see setMinColWidths in Table.js).
				if (!TableColumnUtils.TableUtils.isFixedColumn(oTable, iColumnIndex)) {
					oTable._getVisibleColumns().forEach(function (col) {
						var width = col.getWidth(),
							colElement;
						if (oTableElement && aResizableColumns.indexOf(col) < 0 && TableColumnUtils.TableUtils.isVariableWidth(width)) {
							colElement = oTableElement.querySelector('th[data-sap-ui-colid="' + col.getId() + '"]');
							if (colElement) {
								col._minWidth = Math.max(colElement.offsetWidth, TableColumnUtils.getMinColumnWidth());
							}
						}
					});
				}

				// Resize all resizable columns. Share the width change (pixel delta) between them.
				for (var i = 0; i < aResizableColumns.length; i++) {
					var oResizableColumn = aResizableColumns[i];
					var iColumnWidth = TableColumnUtils.getColumnWidth(oTable, oResizableColumn.getIndex());

					var iNewWidth = iColumnWidth + iSharedPixelDelta;
					var iColMinWidth = TableColumnUtils.getMinColumnWidth();
					if (iNewWidth < iColMinWidth) {
						iNewWidth = iColMinWidth;
					}

					var iWidthChange = iNewWidth - iColumnWidth;

					// Distribute any remaining delta to the remaining columns.
					if (Math.abs(iWidthChange) < Math.abs(iSharedPixelDelta)) {
						var iRemainingColumnCount = aResizableColumns.length - (i + 1);
						iPixelDelta -= iWidthChange;
						iSharedPixelDelta = Math.round(iPixelDelta / iRemainingColumnCount);
					}

					if (iWidthChange !== 0) {
						var bExecuteDefault = true;
						var sWidth = iNewWidth + "px";

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
			 * @returns {int|null} Returns <code>null</code> if <code>iColumnIndex</code> is out of bound.
			 * 					   Returns 0, if the column is not visible, or not yet rendered, and its width is not specified in pixels.
			 * @private
			 */
			getColumnWidth: function(oTable, iColumnIndex) {
				if (oTable == null ||
					iColumnIndex == null || iColumnIndex < 0) {
					return null;
				}

				var aColumns = oTable.getColumns();
				if (iColumnIndex >= aColumns.length) {
					return null;
				}

				var oColumn = aColumns[iColumnIndex];
				var sColumnWidth = oColumn.getWidth();

				// If the columns width is "auto" or specified in percentage, get the width from the DOM.
				if (sColumnWidth === "" || sColumnWidth === "auto" || sColumnWidth.match(/%$/)) {
					if (oColumn.getVisible()) {
						var oColumnElement = oColumn.getDomRef();
						return oColumnElement != null ? oColumnElement.offsetWidth : 0;
					} else {
						return 0;
					}
				} else {
					return oTable._CSSSizeToPixel(sColumnWidth);
				}
			},

			/**
			 * Returns the number of fixed columns depending on the parameter <code>bConsiderVisibility</code>.
			 *
			 * @param {sap.ui.table.Table} oTable Instance of the table.
			 * @param {boolean} bConsiderVisibility If <code>false</code> the result of the <code>getFixedColumnCount</code> function of the table is returned.
			 * 										If <code>true</code> the visibility is included into the determination of the count.
			 * @returns {int} Returns the number of fixed columns depending on the parameter <code>bConsiderVisibility</code>.
			 * @private
			 */
			getFixedColumnCount: function(oTable, bConsiderVisibility) {
				var iFixed = oTable.getFixedColumnCount();

				if (!bConsiderVisibility) {
					return iFixed;
				}

				if (iFixed <= 0 || oTable._bIgnoreFixedColumnCount) {
					return 0;
				}

				var aColumns = oTable.getColumns();
				var iVisibleFixedColumnCount = 0;
				iFixed = Math.min(iFixed, aColumns.length);

				for (var i = 0; i < iFixed; i++) {
					if (aColumns[i].shouldRender()) {
						iVisibleFixedColumnCount++;
					}
				}

				return iVisibleFixedColumnCount;
			}
		};

		return TableColumnUtils;

	}, /* bExport= */ true);