/*!
 * ${copyright}
 */

// Provides helper sap.ui.table.extensions.Accessibility.
sap.ui.define([
	"./ExtensionBase",
	"./AccessibilityRender",
	"../utils/TableUtils",
	"../library",
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/Configuration"
], function(ExtensionBase, AccRenderExtension, TableUtils, library, jQuery, Configuration) {
	"use strict";

	// shortcuts
	var SelectionMode = library.SelectionMode;
	var CellType = TableUtils.CELLTYPE;

	/*
	 * Provides utility functions to handle acc info objects.
	 * @see sap.ui.core.Control#getAccessibilityInfo
	 */
	var ACCInfoHelper = {

		/*
		 * Returns a flattened acc info object (infos of children are merged together)
		 * Note: The info object does only contain a focusable flag (true if one of the children is focusable)
		 *       and a combined description.
		 * @see sap.ui.core.Control#getAccessibilityInfo
		 */
		getAccInfoOfControl: function(oControl) {
			var oAccInfo = null;

			if (oControl && typeof oControl.getAccessibilityInfo === "function") {
				if (typeof oControl.getVisible === "function" && !oControl.getVisible()) {
					oAccInfo = ACCInfoHelper._normalize({});
				} else {
					var oSource = oControl.getAccessibilityInfo();
					if (oSource) {
						var oTarget = {};
						ACCInfoHelper._flatten(oSource, oTarget);
						oAccInfo = oTarget;
					}
				}
				if (oAccInfo && !oAccInfo.description) {
					oAccInfo.description = TableUtils.getResourceText("TBL_CTRL_STATE_EMPTY");
				}
			}

			return oAccInfo;
		},

		/*
		 * Normalizes the given acc info object and ensures that all the defaults are set.
		 */
		_normalize: function(oInfo) {
			if (!oInfo) {
				return null;
			}

			if (oInfo._normalized) {
				return oInfo;
			}

			oInfo.role = oInfo.role || "";
			oInfo.type = oInfo.type || "";
			oInfo.description = oInfo.description || "";
			oInfo.enabled = (oInfo.enabled === true || oInfo.enabled === false) ? oInfo.enabled : null;
			oInfo.editable = (oInfo.editable === true || oInfo.editable === false) ? oInfo.editable : null;
			oInfo.children = oInfo.children || [];
			oInfo._normalized = true;

			return oInfo;
		},

		/*
		 * Merges the focusable flag and the descriptions of the source and its children into the given target.
		 */
		_flatten: function(oSourceInfo, oTargetInfo, iLevel) {
			iLevel = iLevel ? iLevel : 0;

			ACCInfoHelper._normalize(oSourceInfo);
			if (iLevel == 0) {
				ACCInfoHelper._normalize(oTargetInfo);
				oTargetInfo._descriptions = [];
			}

			oTargetInfo._descriptions.push(ACCInfoHelper._getFullDescription(oSourceInfo));

			oSourceInfo.children.forEach(function(oChild) {
				if (!oChild.getAccessibilityInfo || (oChild.getVisible && !oChild.getVisible())) {
					return;
				}

				var oChildInfo = oChild.getAccessibilityInfo();
				if (oChildInfo) {
					ACCInfoHelper._flatten(oChildInfo, oTargetInfo, iLevel + 1);
				}
			});

			if (iLevel == 0) {
				oTargetInfo.description = oTargetInfo._descriptions.join(" ").trim();
				oTargetInfo._descriptions = undefined;
			}
		},

		/*
		 * Returns the full control description incl. control type and enabled/editable state based
		 * on the information of the given acc info object
		 * Note: The description does not include the description of the children (if available).
		 */
		_getFullDescription: function(oInfo) {
			var sDesc = oInfo.type + " " + oInfo.description;
			if (oInfo.enabled === false) {
				sDesc = sDesc + " " + TableUtils.getResourceText("TBL_CTRL_STATE_DISABLED");
			} else if (oInfo.editable === false) {
				sDesc = sDesc + " " + TableUtils.getResourceText("TBL_CTRL_STATE_READONLY");
			} else if (oInfo.required === true) {
				sDesc = sDesc + " " + TableUtils.getResourceText("TBL_CTRL_STATE_REQUIRED");
			}
			return sDesc.trim();
		}

	};

	/*
	 * Provides utility functions used by this extension
	 */
	var ExtensionHelper = {

		/**
		 * Returns the index of the column (in the array of visible columns (see Table._getVisibleColumns())) of the current focused cell
		 * In case the focused cell is a row action the given index equals the length of the visible columns.
		 * This function must not be used if the focus is on a row header.
		 * @param {sap.ui.table.extensions.Accessibility} oExtension The accessibility extension.
		 * @returns {int}
		 */
		getColumnIndexOfFocusedCell: function(oExtension) {
			var oTable = oExtension.getTable();
			var oInfo = TableUtils.getFocusedItemInfo(oTable);
			return oInfo.cellInRow - (TableUtils.hasRowHeader(oTable) ? 1 : 0);
		},

		/**
		 * If the current focus is on a cell of the table, this function returns
		 * the cell type and the jQuery wrapper object of the corresponding cell:
		 *
		 * @param {sap.ui.table.extensions.Accessibility} oExtension The accessibility extension.
		 * @returns {sap.ui.table.utils.TableUtils.CellInfo} An object containing information about the cell.
		 */
		getInfoOfFocusedCell: function(oExtension) {
			var oTable = oExtension.getTable();
			var oIN = oTable._getItemNavigation();
			var oTableRef = oTable.getDomRef();

			if (!oExtension.getAccMode() || !oTableRef || !oIN) {
				return null;
			}
			var oCellRef = oIN.getFocusedDomRef();
			if (!oCellRef || oCellRef !== document.activeElement) {
				return null;
			}

			return TableUtils.getCellInfo(oCellRef);
		},

		/*
		 * Returns the IDs of the column headers which are relevant for the given column (esp. in multi header case).
		 */
		getRelevantColumnHeaders: function(oTable, oColumn) {
			var aLabels = [];

			if (!oTable || !oColumn || !oTable.getColumnHeaderVisible()) {
				return aLabels;
			}

			var iHeaderRowCount = TableUtils.getHeaderRowCount(oTable);

			if (iHeaderRowCount > 0) {
				var sColumnId = oColumn.getId();
				aLabels.push(sColumnId);

				for (var i = 1; i < iHeaderRowCount; i++) {
					aLabels.push(sColumnId + "_" + i);
				}

				var aSpans = TableUtils.Column.getParentSpannedColumns(oTable, sColumnId);

				if (aSpans && aSpans.length) {
					for (var j = 0; j < aSpans.length; j++) {
						var iLevel = aSpans[j].level;
						var sParentId = aSpans[j].column.getId();
						aLabels[iLevel] = iLevel === 0 ? sParentId : (sParentId + "_" + iLevel);
					}
				}
			}

			return aLabels;
		},

		/*
		 * Returns whether the given cell is hidden
		 */
		isHiddenCell: function($Cell, oCell) {
			var bGroup = TableUtils.Grouping.isInGroupHeaderRow($Cell);
			var bSum = TableUtils.Grouping.isInSummaryRow($Cell);
			var bSupportStyleClass = !!oCell && !!oCell.hasStyleClass;

			var bIsRowHidden = $Cell.parent().hasClass("sapUiTableRowHidden");
			var bIsCellHidden = $Cell.hasClass("sapUiTableCellHidden");
			var bGroupCellHiddenByApp = bGroup && bSupportStyleClass && oCell.hasStyleClass("sapUiAnalyticalTableGroupCellHidden");
			var bSumCellHiddenByApp = bSum && bSupportStyleClass && oCell.hasStyleClass("sapUiAnalyticalTableSumCellHidden");

			return bIsRowHidden || bIsCellHidden || bGroupCellHiddenByApp || bSumCellHiddenByApp;
		},

		/*
		 * Returns whether the given cell is in the tree column of a TreeTable
		 */
		isTreeColumnCell: function(oExtension, $Cell) {
			return TableUtils.Grouping.isInTreeMode(oExtension.getTable()) && $Cell.hasClass("sapUiTableCellFirst");
		},

		/*
		 * Returns the tooltip of the column or the contained label, if any and if it differs from the label itself.
		 */
		getColumnTooltip: function(oColumn) {
			if (!oColumn) {
				return null;
			}

			var oLabel = oColumn.getLabel();

			function isTooltipEqualToLabel(sTooltip) {
				if (!sTooltip) {
					return false;
				}
				var sText = oLabel && oLabel.getText ? oLabel.getText() : "";
				return sTooltip == sText;
			}

			var sTooltip = oColumn.getTooltip_AsString();
			if (!isTooltipEqualToLabel(sTooltip)) {
				return sTooltip;
			}

			if (TableUtils.isA(oLabel, "sap.ui.core.Control")) {
				sTooltip = oLabel.getTooltip_AsString();
			}
			if (!isTooltipEqualToLabel(sTooltip)) {
				return sTooltip;
			}

			return null;
		},

		/**
		 * Gets the aria-relevant numbers of columns and rows in the table, taking into account virtualization and internal columns like the row
		 * action column.
		 *
		 * @returns {{columnCount: int, rowCount: int}}
		 */
		getGridSize: function(oTable) {
			var bHasRowHeader = TableUtils.hasRowHeader(oTable);
			var bHasRowActions = TableUtils.hasRowActions(oTable);
			var iColumnCount = TableUtils.getVisibleColumnCount(oTable) + (bHasRowHeader ? 1 : 0) + (bHasRowActions ? 1 : 0);
			var iContentRowCount = TableUtils.isNoDataVisible(oTable) ? 0 : Math.max(oTable._getTotalRowCount(), oTable._getRowCounts()._fullsize);

			return {
				columnCount: iColumnCount,
				rowCount: TableUtils.getHeaderRowCount(oTable) + iContentRowCount
			};
		},

		/**
		 * Gets the aria-relevant index of a row, taking into account virtualization and the number of header rows.
		 *
		 * @returns {int}
		 */
		getRowIndex: function(oRow) {
			return oRow.getIndex() + 1 + TableUtils.getHeaderRowCount(oRow.getTable());
		},

		/**
		 * Determines the current row and column and updates the hidden description texts of the table accordingly.
		 * @param {sap.ui.table.extensions.Accessibility} oExtension The accessibility extension.
		 */
		updateRowColCount: function(oExtension) {
			var oTable = oExtension.getTable(),
				oIN = oTable._getItemNavigation(),
				bIsRowChanged = false,
				bIsColChanged = false,
				bIsInitial = false,
				bHasRowHeader = TableUtils.hasRowHeader(oTable);

			if (oIN) {
				// +1 -> we want to announce a count and not the index, the action column is handled like a normal column
				var iColumnNumber = ExtensionHelper.getColumnIndexOfFocusedCell(oExtension) + 1 + (bHasRowHeader ? 1 : 0);
				var oRow = oTable.getRows()[TableUtils.getRowIndexOfFocusedCell(oTable)];
				var iRowNumber = oRow ? ExtensionHelper.getRowIndex(oRow) : 0;
				var mGridSize = ExtensionHelper.getGridSize(oTable);

				bIsRowChanged = oExtension._iLastRowNumber != iRowNumber || (oExtension._iLastRowNumber == iRowNumber && oExtension._iLastColumnNumber == iColumnNumber);
				bIsColChanged = oExtension._iLastColumnNumber != iColumnNumber;
				bIsInitial = oExtension._iLastRowNumber == null && oExtension._iLastColumnNumber == null;
				oTable.$("rownumberofrows").text(bIsRowChanged && iRowNumber > 0 ? TableUtils.getResourceText("TBL_ROW_ROWCOUNT", [iRowNumber, mGridSize.rowCount]) : " ");
				oTable.$("colnumberofcols").text(bIsColChanged ? TableUtils.getResourceText("TBL_COL_COLCOUNT", [iColumnNumber, mGridSize.columnCount]) : " ");
				oTable.$("ariacount").text(bIsInitial ? TableUtils.getResourceText("TBL_DATA_ROWS_COLS", [mGridSize.rowCount, mGridSize.columnCount]) : " ");

				oExtension._iLastRowNumber = iRowNumber;
				oExtension._iLastColumnNumber = iColumnNumber;
			}

			return {
				rowChange: bIsRowChanged,
				colChange: bIsColChanged,
				initial: bIsInitial
			};
		},

		/**
		 * Removes the acc modifications of the cell which had the focus before.
		 * @param {sap.ui.table.extensions.Accessibility} oExtension The accessibility extension.
		 */
		cleanupCellModifications: function(oExtension) {
			if (oExtension._cleanupInfo) {
				oExtension._cleanupInfo.cell.attr(oExtension._cleanupInfo.attr);
				oExtension._cleanupInfo = null;
			}
		},

		/*
		 * Stores the defaults before modifications of a cell for later cleanup
		 * @see ExtensionHelper.cleanupCellModifications
		 */
		storeDefaultsBeforeCellModifications: function(oExtension, $Cell, aDefaultLabels, aDefaultDescriptions) {
			oExtension._cleanupInfo = {
				cell: $Cell,
				attr: {
					"aria-labelledby": aDefaultLabels && aDefaultLabels.length ? aDefaultLabels.join(" ") : null,
					"aria-describedby": aDefaultDescriptions && aDefaultDescriptions.length ? aDefaultDescriptions.join(" ") : null
				}
			};
		},

		/*
		 * Updates the row / column counters, adapts the labels and descriptions of the given cell and stores the the
		 * given defaults before the modification.
		 * @see ExtensionHelper.updateRowColCount
		 * @see ExtensionHelper.storeDefaultsBeforeCellModifications
		 */
		performCellModifications: function(oExtension, $Cell, aDefaultLabels, aDefaultDescriptions, aLabels, aDescriptions, sText, fAdapt) {
			ExtensionHelper.storeDefaultsBeforeCellModifications(oExtension, $Cell, aDefaultLabels, aDefaultDescriptions);
			var oCountChangeInfo = ExtensionHelper.updateRowColCount(oExtension);
			var oTable = oExtension.getTable();
			oTable.$("cellacc").text(sText || " "); //set the custom text to the prepared hidden element

			if (fAdapt) { //Allow to adapt the labels / descriptions based on the changed row / column count
				fAdapt(aLabels, aDescriptions, oCountChangeInfo.rowChange, oCountChangeInfo.colChange, oCountChangeInfo.initial);
			}

			var sLabel = "";
			if (oCountChangeInfo.initial) {
				sLabel = oTable.getId() + "-ariacount";
				if (oTable.getSelectionMode() !== SelectionMode.None) {
					sLabel = sLabel + " " + oTable.getId() + "-ariaselection";
				}
			}

			if (aLabels && aLabels.length) {
				sLabel = sLabel + " " + aLabels.join(" ");
			}

			if (oCountChangeInfo.initial || oCountChangeInfo.rowChange) {
				if (TableUtils.hasRowNavigationIndicators(oTable)) {
					var oCellInfo = TableUtils.getCellInfo($Cell);
					if (oCellInfo.type !== TableUtils.CELLTYPE.COLUMNHEADER && oCellInfo.type !== TableUtils.CELLTYPE.COLUMNROWHEADER) {
						var oRowSettings = oTable.getRows()[oCellInfo.rowIndex].getAggregation("_settings");
						if (oRowSettings.getNavigated()) {
							sLabel = sLabel + " " + oTable.getId() + "-rownavigatedtext";
						}
					}
				}
			}

			$Cell.attr({
				"aria-labelledby": sLabel ? sLabel : null,
				"aria-describedby": aDescriptions && aDescriptions.length ? aDescriptions.join(" ") : null
			});
		},

		/*
		 * Modifies the labels and descriptions of a data cell.
		 * @see ExtensionHelper.performCellModifications
		 */
		modifyAccOfDATACELL: function(oCellInfo) {
			var oTable = this.getTable();
			var sTableId = oTable.getId();
			var oIN = oTable._getItemNavigation();
			var $Cell = oCellInfo.cell;

			if (!oIN) {
				return;
			}

			var iRow = TableUtils.getRowIndexOfFocusedCell(oTable),
				iCol = ExtensionHelper.getColumnIndexOfFocusedCell(this), // Because we are on a data cell this is the index in the visible columns
																		  // array
				oTableInstances = TableUtils.getRowColCell(oTable, iRow, iCol, false),
				oInfo = null,
				oRow = oTableInstances.row,
				sRowId = oRow.getId(),
				bHidden = ExtensionHelper.isHiddenCell($Cell, oTableInstances.cell),
				bIsTreeColumnCell = ExtensionHelper.isTreeColumnCell(this, $Cell),
				aDefaultLabels = ExtensionHelper.getAriaAttributesFor(this, AccExtension.ELEMENTTYPES.DATACELL, {
						index: iCol,
						column: oTableInstances.column,
						fixed: TableUtils.isFixedColumn(oTable, iCol)
					})["aria-labelledby"] || [],
				aDescriptions = [],
				aLabels = [sTableId + "-rownumberofrows", sTableId + "-colnumberofcols"],
				bIsGroupHeader = oRow.isGroupHeader(),
				bIsSummary = oRow.isSummary();

			if (bIsGroupHeader) {
				aLabels.push(sTableId + "-ariarowgrouplabel");
			} else if (oRow.isTotalSummary()) {
				aLabels.push(sTableId + "-ariagrandtotallabel");
			} else if (oRow.isGroupSummary()) {
				aLabels.push(sTableId + "-ariagrouptotallabel");
			}

			if (TableUtils.hasRowHighlights(oTable) && !bIsGroupHeader && !bIsSummary) {
				aLabels.push(sRowId + "-highlighttext");
			}

			aLabels = aLabels.concat(aDefaultLabels);

			if (!bHidden) {
				oInfo = ACCInfoHelper.getAccInfoOfControl(oTableInstances.cell);
				aLabels.push(oInfo ? (sTableId + "-cellacc") : oTableInstances.cell.getId());

				// Possible later extension for aria-labelledby and aria-describedby support
				// if (oInfo && oInfo.labelled) { aLabels.push(oInfo.labelled); }
				// if (oInfo && oInfo.described) { aDescriptions.push(oInfo.described); }

				if (TableUtils.getInteractiveElements($Cell) !== null) {
					aLabels.push(sTableId + "-toggleedit");
				}
			}

			var sText = oInfo ? oInfo.description : " ";
			if (bIsTreeColumnCell && !bHidden) {
				var oAttributes = ExtensionHelper.getAriaAttributesFor(this, AccExtension.ELEMENTTYPES.TREEICON, {row: oTableInstances.row});
				if (oAttributes && oAttributes["aria-label"]) {
					sText = oAttributes["aria-label"] + " " + sText;
				}
			}

			ExtensionHelper.performCellModifications(this, $Cell, aDefaultLabels, null, aLabels, aDescriptions, sText,
				function(aLabels, aDescriptions, bRowChange, bColChange) {
					if (bIsGroupHeader && bRowChange) {
						aLabels.splice(3, 0, sRowId + "-groupHeader");
					}
					var bContainsTreeIcon = $Cell.find(".sapUiTableTreeIcon").not(".sapUiTableTreeIconLeaf").length == 1;

					if ((bContainsTreeIcon || bIsGroupHeader) && (bRowChange || bColChange)) {
						aDescriptions.push(oTable.getId() + (!oRow.isExpanded() ? "-rowexpandtext" : "-rowcollapsetext"));
					} else if (!bHidden && !bIsGroupHeader && !bIsSummary && TableUtils.isRowSelectionAllowed(oTable) && bRowChange) {
						aLabels.push(sRowId + "-rowselecttext");
					}
				}
			);
		},

		/*
		 * Modifies the labels and descriptions of a row header cell.
		 * @see ExtensionHelper.performCellModifications
		 */
		modifyAccOfROWHEADER: function(oCellInfo) {
			var oTable = this.getTable();
			var sTableId = oTable.getId();
			var $Cell = oCellInfo.cell;
			var oRow = oTable.getRows()[oCellInfo.rowIndex];
			var sRowId = oRow.getId();
			var aDefaultLabels = ExtensionHelper.getAriaAttributesFor(this, AccExtension.ELEMENTTYPES.ROWHEADER)["aria-labelledby"] || [];
			var aLabels = aDefaultLabels.concat([sTableId + "-rownumberofrows", sTableId + "-colnumberofcols"]);

			if (!oRow.isSummary() && !oRow.isGroupHeader() && !oRow.isContentHidden()) {
				aLabels.push(sRowId + "-rowselecttext");

				if (TableUtils.hasRowHighlights(oTable)) {
					aLabels.push(sRowId + "-highlighttext");
				}
			}

			if (oRow.isGroupHeader()) {
				aLabels.push(sTableId + "-ariarowgrouplabel");
				aLabels.push(sRowId + "-groupHeader");
				aLabels.push(sTableId + (oRow.isExpanded() ? "-rowcollapsetext" : "-rowexpandtext"));
			}

			if (oRow.isTotalSummary()) {
				aLabels.push(sTableId + "-ariagrandtotallabel");
			} else if (oRow.isGroupSummary()) {
				aLabels.push(sTableId + "-ariagrouptotallabel");
			}

			ExtensionHelper.performCellModifications(this, $Cell, aDefaultLabels, null, aLabels, null, null);
		},

		/*
		 * Modifies the labels and descriptions of a column header cell.
		 * @see ExtensionHelper.performCellModifications
		 */
		modifyAccOfCOLUMNHEADER: function(oCellInfo) {
			var oTable = this.getTable();
			var $Cell = oCellInfo.cell;
			var oColumn = sap.ui.getCore().byId($Cell.attr("data-sap-ui-colid"));
			var oColumnLabel = TableUtils.Column.getHeaderLabel(oColumn);
			var mAttributes = ExtensionHelper.getAriaAttributesFor(this, AccExtension.ELEMENTTYPES.COLUMNHEADER, {
					headerId: $Cell.attr("id"),
					column: oColumn,
					index: $Cell.attr("data-sap-ui-colindex")
				});
			var sText = ExtensionHelper.getColumnTooltip(oColumn);
			var aLabels = [oTable.getId() + "-colnumberofcols"].concat(mAttributes["aria-labelledby"]);
			var iSpan = oCellInfo.columnSpan;

			if (TableUtils.isA(oColumnLabel, "sap.m.Label") && oColumnLabel.getRequired()) {
				aLabels.push(oTable.getId() + "-ariarequired");
			}

			if (iSpan > 1) {
				aLabels.push(oTable.getId() + "-ariacolspan");
				// Update Span information
				oTable.$("ariacolspan").text(TableUtils.getResourceText("TBL_COL_DESC_SPAN", ["" + iSpan]));
			}

			if (sText) {
				aLabels.push(oTable.getId() + "-cellacc");
			}

			if (iSpan <= 1 && oColumn && oColumn.getFiltered()) {
				aLabels.push(oTable.getId() + "-ariacolfiltered");
			}

			ExtensionHelper.performCellModifications(this, $Cell, mAttributes["aria-labelledby"], mAttributes["aria-describedby"],
				aLabels, mAttributes["aria-describedby"], sText
			);
		},

		/*
		 * Modifies the labels and descriptions of the column row header.
		 * @see ExtensionHelper.performCellModifications
		 */
		modifyAccOfCOLUMNROWHEADER: function(oCellInfo) {
			var oTable = this.getTable();
			var $Cell = oCellInfo.cell;
			var bEnabled = $Cell.hasClass("sapUiTableSelAllVisible");

			var mAttributes = ExtensionHelper.getAriaAttributesFor(
				this, AccExtension.ELEMENTTYPES.COLUMNROWHEADER,
				{enabled: bEnabled, checked: bEnabled && !oTable.$().hasClass("sapUiTableSelAll")}
			);
			var aLabels = [oTable.getId() + "-colnumberofcols"].concat(mAttributes["aria-labelledby"]);
			ExtensionHelper.performCellModifications(this, $Cell, mAttributes["aria-labelledby"], mAttributes["aria-describedby"],
				aLabels, mAttributes["aria-describedby"], null
			);
		},

		/*
		 * Modifies the labels and descriptions of a row action cell.
		 * @see ExtensionHelper.performCellModifications
		 */
		modifyAccOfROWACTION: function(oCellInfo) {
			var oTable = this.getTable();
			var sTableId = oTable.getId();
			var $Cell = oCellInfo.cell;
			var oRow = oTable.getRows()[oCellInfo.rowIndex];
			var sRowId = oRow.getId();
			var bHidden = ExtensionHelper.isHiddenCell($Cell);
			var aDefaultLabels = ExtensionHelper.getAriaAttributesFor(this, AccExtension.ELEMENTTYPES.ROWACTION)["aria-labelledby"] || [];
			var aLabels = [sTableId + "-rownumberofrows", sTableId + "-colnumberofcols"].concat(aDefaultLabels);
			var aDescriptions = [];
			var bIsGroupHeader = oRow.isGroupHeader();

			if (bIsGroupHeader) {
				aLabels.push(sTableId + "-ariarowgrouplabel");
				aLabels.push(sTableId + (oRow.isExpanded() ? "-rowcollapsetext" : "-rowexpandtext"));
			}

			if (oRow.isTotalSummary()) {
				aLabels.push(sTableId + "-ariagrandtotallabel");
			} else if (oRow.isGroupSummary()) {
				aLabels.push(sTableId + "-ariagrouptotallabel");
			}

			if (TableUtils.hasRowHighlights(oTable) && !oRow.isGroupHeader() && !oRow.isSummary()) {
				aLabels.push(sRowId + "-highlighttext");
			}

			var sText = "";
			if (!bHidden) {
				var oRowAction = oRow.getRowAction();
				if (oRowAction) {
					var oInfo = oRowAction.getAccessibilityInfo();
					if (oInfo) {
						aLabels.push(sTableId + "-cellacc");
						sText = oInfo.description;
						if (TableUtils.getInteractiveElements($Cell) !== null) {
							aDescriptions.push(sTableId + "-toggleedit");
						}
					}
				}
			}

			ExtensionHelper.performCellModifications(this, $Cell, aDefaultLabels, [], aLabels, aDescriptions, sText,
				function(aLabels, aDescriptions, bRowChange) {
					if (bIsGroupHeader && bRowChange) {
						var iIndex = aLabels.indexOf(sTableId + "-ariarowgrouplabel") + 1;
						aLabels.splice(iIndex, 0, sRowId + "-groupHeader");
					}
				}
			);
		},

		/**
		 * Returns the default aria attributes for the given element type with the given settings.
		 * @see sap.ui.table.extensions.Accessibility.ELEMENTTYPES
		 * @param {sap.ui.table.extensions.Accessibility} oExtension The accessibility extension.
		 * @param {string} sType
		 * @param {object} [mParams]
		 */
		getAriaAttributesFor: function(oExtension, sType, mParams) {
			var mAttributes = {},
				oTable = oExtension.getTable(),
				sTableId = oTable.getId();

			function addAriaForOverlayOrNoData(oTable, mAttr, bOverlay, bNoData) {
				var sMarker = "";
				if (bOverlay && bNoData) {
					sMarker = "overlay,nodata";
				} else if (bOverlay && !bNoData) {
					sMarker = "overlay";
				} else if (!bOverlay && bNoData) {
					sMarker = "nodata";
				}

				var bHidden = false;
				if (bOverlay && oTable.getShowOverlay() || bNoData && TableUtils.isNoDataVisible(oTable)) {
					bHidden = true;
				}

				if (bHidden) {
					mAttributes["aria-hidden"] = "true";
				}
				if (sMarker) {
					mAttributes["data-sap-ui-table-acc-covered"] = sMarker;
				}
			}

			switch (sType) {
				case AccExtension.ELEMENTTYPES.COLUMNROWHEADER:
					var mRenderConfig = oTable._getSelectionPlugin().getRenderConfig();

					if (mRenderConfig.headerSelector.visible) {
						if (mRenderConfig.headerSelector.type === "toggle") {
							mAttributes["role"] = ["checkbox"];
							if (mParams && mParams.enabled) {
								mAttributes["aria-checked"] = mParams.checked ? "true" : "false";
							}
						} else if (mRenderConfig.headerSelector.type === "clear") {
							mAttributes["role"] = ["button"];
							if (!mParams || !mParams.enabled) {
								mAttributes["aria-disabled"] = "true";
							}
						}
					}
					break;

				case AccExtension.ELEMENTTYPES.ROWHEADER:
					mAttributes["role"] = "gridcell";
					mAttributes["aria-colindex"] = 1;
					if (TableUtils.hasRowHeader(oTable) && oTable.getSelectionMode() === SelectionMode.None) {
						mAttributes["aria-labelledby"] = [sTableId + "-rowselecthdr"];
					}
					break;

				case AccExtension.ELEMENTTYPES.ROWACTION:
					mAttributes["role"] = "gridcell";
					mAttributes["aria-colindex"] = TableUtils.getVisibleColumnCount(oTable) + 1 + (TableUtils.hasRowHeader(oTable) ? 1 : 0);
					mAttributes["aria-labelledby"] = [sTableId + "-rowacthdr"];
					break;

				case AccExtension.ELEMENTTYPES.COLUMNHEADER:
					var oColumn = mParams && mParams.column;
					var bHasColSpan = mParams && mParams.colspan;

					mAttributes["role"] = "columnheader";
					mAttributes["aria-colindex"] = mParams.index + 1 + (TableUtils.hasRowHeader(oTable) ? 1 : 0);
					var aLabels = [];

					if (mParams && mParams.headerId) {
						var aHeaders = ExtensionHelper.getRelevantColumnHeaders(oTable, oColumn);
						var iIdx = aHeaders.indexOf(mParams.headerId);
						aLabels = iIdx > 0 ? aHeaders.slice(0, iIdx + 1) : [mParams.headerId];
					}
					for (var i = 0; i < aLabels.length; i++) {
						aLabels[i] = aLabels[i] + "-inner";
					}
					mAttributes["aria-labelledby"] = aLabels;

					if (mParams && (mParams.index < oTable.getComputedFixedColumnCount())) {
						mAttributes["aria-labelledby"].push(sTableId + "-ariafixedcolumn");
					}

					if (!bHasColSpan && oColumn) {
						mAttributes["aria-sort"] = oColumn.getSortOrder().toLowerCase();
						/** @deprecated As of version 1.120 */
						if (!oColumn.getSorted()) {
							delete mAttributes["aria-sort"];
						}
					}

					if (!bHasColSpan && oColumn) {
						var oColumnHeaderMenu = oColumn.getHeaderMenuInstance();
						if (oColumnHeaderMenu) {
							var sPopupType = oColumnHeaderMenu.getAriaHasPopupType();
							if (sPopupType !== "None") {
								mAttributes["aria-haspopup"] = sPopupType.toLowerCase();
							}
						}
						/**
						 * @deprecated As of Version 1.117
						 */
						if (!oColumnHeaderMenu && oColumn._menuHasItems()) {
							mAttributes["aria-haspopup"] = "menu";
						}
					}
					break;

				case AccExtension.ELEMENTTYPES.DATACELL:
					mAttributes["role"] = "gridcell";
					mAttributes["aria-colindex"] = mParams.index + 1 + (TableUtils.hasRowHeader(oTable) ? 1 : 0);

					if (mParams.column) {
						var aLabels = ExtensionHelper.getRelevantColumnHeaders(oTable, mParams.column);

						for (var i = 0; i < aLabels.length; i++) {
							aLabels[i] = aLabels[i] + "-inner";
						}

						if (mParams && mParams.fixed) {
							aLabels.push(sTableId + "-ariafixedcolumn");
						}

						mAttributes["aria-labelledby"] = aLabels;
					}
					break;

				case AccExtension.ELEMENTTYPES.ROOT: //The tables root dom element
					break;

				case AccExtension.ELEMENTTYPES.TABLE: //The "real" table element(s)
					mAttributes["role"] = "presentation";
					addAriaForOverlayOrNoData(oTable, mAttributes, true, true);
					break;

				case AccExtension.ELEMENTTYPES.CONTAINER: //The table container
					break;

				case AccExtension.ELEMENTTYPES.CONTENT: //The content area of the table which contains all the table elements, rowheaders, columnheaders, etc
					mAttributes["role"] = TableUtils.Grouping.isInGroupMode(oTable) || TableUtils.Grouping.isInTreeMode(oTable) ? "treegrid" : "grid";

					mAttributes["aria-labelledby"] = [].concat(oTable.getAriaLabelledBy());
					if (oTable.getTitle()) {
						mAttributes["aria-labelledby"].push(oTable.getTitle().getId());
					}

					if (oTable.getSelectionMode() === SelectionMode.MultiToggle) {
						mAttributes["aria-multiselectable"] = "true";
					}

					var mRowCounts = oTable._getRowCounts();
					var bHasFixedColumns = TableUtils.hasFixedColumns(oTable);
					var bHasFixedTopRows = mRowCounts.fixedTop > 0;
					var bHasFixedBottomRows = mRowCounts.fixedBottom > 0;
					var bHasRowHeader = TableUtils.hasRowHeader(oTable);
					var bHasRowActions = TableUtils.hasRowActions(oTable);
					var mGridSize = ExtensionHelper.getGridSize(oTable);

					mAttributes["aria-owns"] = [sTableId + "-table"];
					if (bHasFixedColumns) {
						mAttributes["aria-owns"].push(sTableId + "-table-fixed");
					}
					if (bHasFixedTopRows) {
						mAttributes["aria-owns"].push(sTableId + "-table-fixrow");
						if (bHasFixedColumns) {
							mAttributes["aria-owns"].push(sTableId + "-table-fixed-fixrow");
						}
					}
					if (bHasFixedBottomRows) {
						mAttributes["aria-owns"].push(sTableId + "-table-fixrow-bottom");
						if (bHasFixedColumns) {
							mAttributes["aria-owns"].push(sTableId + "-table-fixed-fixrow-bottom");
						}
					}
					if (bHasRowHeader) {
						mAttributes["aria-owns"].push(sTableId + "-sapUiTableRowHdrScr");
					}
					if (bHasRowActions) {
						mAttributes["aria-owns"].push(sTableId + "-sapUiTableRowActionScr");
					}

					mAttributes["aria-rowcount"] = mGridSize.rowCount;
					mAttributes["aria-colcount"] = mGridSize.columnCount;

					if (oTable.isA("sap.ui.table.AnalyticalTable")) {
						mAttributes["aria-roledescription"] = TableUtils.getResourceText("TBL_ANALYTICAL_TABLE_ROLE_DESCRIPTION");
					}
					break;

				case AccExtension.ELEMENTTYPES.TABLEHEADER: //The table header area
					mAttributes["role"] = "heading";
					mAttributes["aria-level"] = "2"; // Level is mandatory for headings with ARIA 1.1 and the default is 2
					addAriaForOverlayOrNoData(oTable, mAttributes, true, false);
					break;

				case AccExtension.ELEMENTTYPES.COLUMNHEADER_TBL: //Table of column headers
					mAttributes["role"] = "presentation";
					break;

				case AccExtension.ELEMENTTYPES.COLUMNHEADER_ROW: //The area which contains the column headers
					mAttributes["role"] = "row";
					addAriaForOverlayOrNoData(oTable, mAttributes, true, false);
					break;

				case AccExtension.ELEMENTTYPES.CREATIONROW_TBL: // Table of the creation row
					mAttributes["role"] = "presentation";
					break;

				case AccExtension.ELEMENTTYPES.CREATIONROW: // Root of the creation row
					mAttributes["role"] = "form";
					mAttributes["aria-labelledby"] = mParams.creationRow.getId() + "-label";
					addAriaForOverlayOrNoData(oTable, mAttributes, true, false);
					break;

				case AccExtension.ELEMENTTYPES.ROWHEADER_COL: //The area which contains the row headers
					addAriaForOverlayOrNoData(oTable, mAttributes, true, true);
					break;

				case AccExtension.ELEMENTTYPES.TH: //The "technical" column headers
					mAttributes["role"] = "presentation";
					mAttributes["scope"] = "col";
					mAttributes["aria-hidden"] = "true";
					break;

				case AccExtension.ELEMENTTYPES.TR: //The rows
					mAttributes["role"] = "row";
					if (mParams.rowNavigated) {
						mAttributes["aria-current"] = true;
					}

					if (!mParams.fixedCol) {
						mAttributes["aria-owns"] = [];
						if (TableUtils.hasRowHeader(oTable)) {
							mAttributes["aria-owns"].push(sTableId + "-rowsel" + mParams.index);
						}
						if (TableUtils.hasFixedColumns(oTable)) {
							for (var j = 0; j < oTable.getComputedFixedColumnCount(); j++) {
								mAttributes["aria-owns"].push(sTableId + "-rows-row" + mParams.index + "-col" + j);
							}
						}
						if (TableUtils.hasRowActions(oTable)) {
							mAttributes["aria-owns"].push(sTableId + "-rowact" + mParams.index);
						}
					}
					break;

				case AccExtension.ELEMENTTYPES.TREEICON: //The expand/collapse icon in the TreeTable
					if (TableUtils.Grouping.isInTreeMode(oTable)) {
						mAttributes = {
							"aria-label": "",
							"title": "",
							"role": ""
						};
						if (oTable.getBinding()) {
							if (mParams && mParams.row) {
								if (mParams.row.isExpandable()) {
									var sText = TableUtils.getResourceText("TBL_COLLAPSE_EXPAND");
									mAttributes["title"] = sText;

									mAttributes["aria-expanded"] = "" + (!!mParams.row.isExpanded());
									mAttributes["aria-hidden"] = "false";
									mAttributes["role"] = "button";
								} else {
									mAttributes["aria-label"] = TableUtils.getResourceText("TBL_LEAF");
									mAttributes["aria-hidden"] = "true";
								}
							}
						}
					}
					break;

				case AccExtension.ELEMENTTYPES.NODATA: //The no data container
					var vNoContentMessage = TableUtils.getNoContentMessage(oTable);
					var aLabels = [];

					mAttributes["role"] = "gridcell";

					if (TableUtils.isA(vNoContentMessage, "sap.ui.core.Control")) {
						if (vNoContentMessage.getAccessibilityReferences instanceof Function) {
							var oAccRef = vNoContentMessage.getAccessibilityReferences();
							aLabels.push(oAccRef.title);
							aLabels.push(oAccRef.description);
						} else {
							aLabels.push(vNoContentMessage.getId());
						}
					} else {
						aLabels.push(sTableId + "-noDataMsg");
					}

					mAttributes["aria-labelledby"] = aLabels;
					addAriaForOverlayOrNoData(oTable, mAttributes, true, false);
					break;

				case AccExtension.ELEMENTTYPES.OVERLAY: //The overlay container
					mAttributes["role"] = "region";
					mAttributes["aria-labelledby"] = [].concat(oTable.getAriaLabelledBy());
					if (oTable.getTitle()) {
						mAttributes["aria-labelledby"].push(oTable.getTitle().getId());
					}
					mAttributes["aria-labelledby"].push(sTableId + "-ariainvalid");
					break;

				case AccExtension.ELEMENTTYPES.TABLEFOOTER: //The table footer area
				case AccExtension.ELEMENTTYPES.TABLESUBHEADER: //The table toolbar and extension areas
					addAriaForOverlayOrNoData(oTable, mAttributes, true, false);
					break;

				case AccExtension.ELEMENTTYPES.ROWACTIONHEADER: // The header of the row action column
					mAttributes["aria-hidden"] = "true";
					break;

				case "PRESENTATION":
					mAttributes["role"] = "presentation";
					break;
			}

			return mAttributes;
		}

	};

	/**
	 * Extension for sap.ui.table.Table which handles ACC related things.
	 * <b>This is an internal class that is only intended to be used inside the sap.ui.table library! Any usage outside the sap.ui.table library is
	 * strictly prohibited!</b>
	 *
	 * @class Extension for sap.ui.table.Table which handles ACC related things.
	 * @extends sap.ui.table.extensions.ExtensionBase
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @alias sap.ui.table.extensions.Accessibility
	 */
	var AccExtension = ExtensionBase.extend("sap.ui.table.extensions.Accessibility", /** @lends sap.ui.table.extensions.Accessibility.prototype */ {
		/**
		 * @override
		 * @inheritDoc
		 * @returns {string} The name of this extension.
		 */
		_init: function(oTable, sTableType, mSettings) {
			this._accMode = Configuration.getAccessibility();
			this._busyCells = [];

			TableUtils.addDelegate(oTable, this);

			// Initialize Render extension
			ExtensionBase.enrich(oTable, AccRenderExtension);

			return "AccExtension";
		},

		/**
		 * @override
		 * @inheritDoc
		 */
		_attachEvents: function() {
			TableUtils.Hook.register(this.getTable(), TableUtils.Hook.Keys.Table.TotalRowCountChanged, this._updateAriaRowCount, this);
		},

		/**
		 * @override
		 * @inheritDoc
		 */
		_detachEvents: function() {
			TableUtils.Hook.deregister(this.getTable(), TableUtils.Hook.Keys.Table.TotalRowCountChanged, this._updateAriaRowCount, this);
		},

		/**
		 * Enables debugging for the extension. Internal helper classes become accessible.
		 *
		 * @private
		 */
		_debug: function() {
			this._ExtensionHelper = ExtensionHelper;
			this._ACCInfoHelper = ACCInfoHelper;
		},

		/**
		 * @override
		 * @inheritDoc
		 */
		destroy: function() {
			this.getTable().removeEventDelegate(this);
			this._busyCells = [];

			ExtensionBase.prototype.destroy.apply(this, arguments);
		},

		/**
		 * Provide protected access for the accessibility render extension.
		 *
		 * @param {sap.ui.table.extensions.Accessibility.ELEMENTTYPES} sType The type of the table area to get the aria attributes for.
		 * @param {Object} mParams Accessibility parameters.
		 * @returns {Object} The aria attributes.
		 * @see ExtensionHelper.getAriaAttributesFor
		 * @protected
		 */
		getAriaAttributesFor: function(sType, mParams) {
			return ExtensionHelper.getAriaAttributesFor(this, sType, mParams);
		},

		/**
		 * Delegate for the focusin event.
		 *
		 * @private
		 * @param {jQuery.Event} oEvent The event object.
		 */
		onfocusin: function(oEvent) {
			var oTable = this.getTable();
			if (!oTable || TableUtils.getCellInfo(oEvent.target).cell == null) {
				return;
			}
			if (oTable._mTimeouts._cleanupACCExtension) {
				clearTimeout(oTable._mTimeouts._cleanupACCExtension);
				oTable._mTimeouts._cleanupACCExtension = null;
			}
			this.updateAccForCurrentCell("Focus");
		},

		/**
		 * Delegate for the focusout event.
		 *
		 * @private
		 * @param {jQuery.Event} oEvent The event object.
		 */
		onfocusout: function(oEvent) {
			var oTable = this.getTable();
			if (!oTable) {
				return;
			}

			oTable._mTimeouts._cleanupACCExtension = setTimeout(function() {
				var oTable = this.getTable();
				if (!oTable) {
					return;
				}
				this._iLastRowNumber = null;
				this._iLastColumnNumber = null;
				ExtensionHelper.cleanupCellModifications(this);
				oTable._mTimeouts._cleanupACCExtension = null;
			}.bind(this), 100);
		}
	});

	/**
	 * Known element types (DOM areas) in the table.
	 *
	 * @type {{DATACELL: string, COLUMNHEADER: string, ROWHEADER: string, ROWACTION: string, COLUMNROWHEADER: string, ROOT: string, CONTENT: string,
	 *     TABLE: string, TABLEHEADER: string, TABLEFOOTER: string, TABLESUBHEADER: string, COLUMNHEADER_TBL: string, COLUMNHEADER_ROW: string,
	 *     CREATIONROW_TBL: string, ROWHEADER_COL: string, TH: string, TR: string, TREEICON: string, ROWACTIONHEADER: string,
	 *     NODATA: string, OVERLAY: string}|*}
	 * @see sap.ui.table.extensions.AccessibilityRender.writeAriaAttributesFor
	 * @public
	 */
	AccExtension.ELEMENTTYPES = {
		DATACELL: "DATACELL",					// Standard data cell (standard, group or sum)
		COLUMNHEADER: "COLUMNHEADER", 			// Column header
		ROWHEADER: "ROWHEADER", 				// Row header (standard, group or sum)
		ROWACTION: "ROWACTION", 				// Row action (standard, group or sum)
		COLUMNROWHEADER: "COLUMNROWHEADER",		// Select all row selector (top left cell)
		ROOT: "ROOT",							// The tables root dom element
		CONTAINER: "CONTAINER",					// The table container
		CONTENT: "CONTENT",						// The content area of the table which contains all the table elements, rowheaders, columnheaders, etc
		TABLE: "TABLE",							// The "real" table element(s)
		TABLEHEADER: "TABLEHEADER", 			// The table header area
		TABLEFOOTER: "TABLEFOOTER", 			// The table footer area
		TABLESUBHEADER: "TABLESUBHEADER", 		// The table toolbar and extension areas
		COLUMNHEADER_TBL: "COLUMNHEADER_TABLE", // The table with the column headers
		COLUMNHEADER_ROW: "COLUMNHEADER_ROW", 	// The table row with the column headers
		CREATIONROW_TBL: "CREATIONROW_TABLE",	// The table with the creation row
		CREATIONROW: "CREATIONROW",				// The root of the creation row
		ROWHEADER_COL: "ROWHEADER_COL", 		// The area which contains the row headers
		TH: "TH", 								// The "technical" column headers
		TR: "TR", 								// The rows
		TREEICON: "TREEICON", 					// The expand/collapse icon in the TreeTable
		ROWACTIONHEADER: "ROWACTIONHEADER", 	// The header of the row action column
		NODATA: "NODATA",						// The no data container
		OVERLAY: "OVERLAY"						// The overlay container
	};

	/**
	 * Returns whether the accessibility mode is turned on.
	 *
	 * @public
	 * @returns {boolean} Returns <code>true</code>, if the accessibility mode is turned on.
	 */
	AccExtension.prototype.getAccMode = function() {
		return this._accMode;
	};

	/**
	 * Updates the aria-rowindex for each row in the table
	 * @private
	 */
	AccExtension.prototype._updateAriaRowIndices = function() {
		if (!this._accMode) {
			return;
		}

		var oTable = this.getTable();
		var aRows = oTable.getRows();
		var oRow, i, $Ref;

		for (i = 0; i < aRows.length; i++) {
			oRow = aRows[i];
			$Ref = oRow.getDomRefs(true);
			$Ref.row.not($Ref.rowHeaderPart).not($Ref.rowActionPart).attr("aria-rowindex", ExtensionHelper.getRowIndex(oRow));
		}
	};

	/**
	 * Updates the aria-rowcount for the content area of the table
	 * @private
	 */
	AccExtension.prototype._updateAriaRowCount = function() {
		var oTable = this.getTable();
		var $Table = oTable.$("sapUiTableGridCnt");

		if ($Table) {
			$Table.attr("aria-rowcount", ExtensionHelper.getGridSize(oTable).rowCount);
		}
	};

	/**
	 * Determines the current focused cell and modifies the labels and descriptions if needed.
	 *
	 * @param {sap.ui.table.utils.TableUtils.RowsUpdateReason} sReason Why the accessibility information of the cell needs to be updated. Additionally
	 * to the reasons in {@link sap.ui.table.utils.TableUtils.RowsUpdateReason RowsUpdateReason}, also \"Focus\" is possible.
	 * @public
	 */
	AccExtension.prototype.updateAccForCurrentCell = function(sReason) {
		if (!this._accMode || !this.getTable()._getItemNavigation()) {
			return;
		}

		if (sReason === "Focus" || sReason === TableUtils.RowsUpdateReason.Expand || sReason === TableUtils.RowsUpdateReason.Collapse) {
			ExtensionHelper.cleanupCellModifications(this);
		}

		var oInfo = ExtensionHelper.getInfoOfFocusedCell(this);
		var sCellType;

		if (!oInfo || !oInfo.isOfType(CellType.ANY)) {
			return;
		}

		if (oInfo.isOfType(CellType.DATACELL)) {
			sCellType = AccExtension.ELEMENTTYPES.DATACELL;
		} else if (oInfo.isOfType(CellType.COLUMNHEADER)) {
			sCellType = AccExtension.ELEMENTTYPES.COLUMNHEADER;
		} else if (oInfo.isOfType(CellType.ROWHEADER)) {
			sCellType = AccExtension.ELEMENTTYPES.ROWHEADER;
		} else if (oInfo.isOfType(CellType.ROWACTION)) {
			sCellType = AccExtension.ELEMENTTYPES.ROWACTION;
		} else if (oInfo.isOfType(CellType.COLUMNROWHEADER)) {
			sCellType = AccExtension.ELEMENTTYPES.COLUMNROWHEADER;
		}

		if (!ExtensionHelper["modifyAccOf" + sCellType]) {
			return;
		}

		if (sReason !== "Focus" && sReason !== TableUtils.RowsUpdateReason.Expand && sReason !== TableUtils.RowsUpdateReason.Collapse) {
			// when the focus stays on the same cell and only the content is replaced (e.g. on scroll or expand),
			// to force screenreader announcements
			if (oInfo.isOfType(CellType.ANYCONTENTCELL)) {
				oInfo.cell.attr("role", "status");
				oInfo.cell.attr("role", "gridcell");
			} else {
				return;
			}
		}

		ExtensionHelper["modifyAccOf" + sCellType].apply(this, [oInfo]);
	};

	/**
	 * Is called by the column whenever the sort or filter state is changed and updates the corresponding ARIA attributes.
	 *
	 * @param {sap.ui.table.Column} oColumn Instance of the column.
	 * @public
	 */
	AccExtension.prototype.updateAriaStateOfColumn = function(oColumn) {
		if (!this._accMode) {
			return;
		}

		var mAttributes = ExtensionHelper.getAriaAttributesFor(this, AccExtension.ELEMENTTYPES.COLUMNHEADER, {
			headerId: oColumn.getId(),
			column: oColumn,
			index: this.getTable().indexOfColumn(oColumn)
		});

		var aHeaders = ExtensionHelper.getRelevantColumnHeaders(this.getTable(), oColumn);
		for (var i = 0; i < aHeaders.length; i++) {
			var $Header = jQuery(document.getElementById(aHeaders[i]));
			if (!$Header.attr("colspan")) {
				$Header.attr({
					"aria-sort": mAttributes["aria-sort"] || null
				});
			}
		}
	};

	/**
	 * Updates the row tooltips to match the selection state.
	 *
	 * @param {sap.ui.table.Row} oRow Instance of the row.
	 * @param {jQuery} $Ref The jQuery references to the DOM areas of the row.
	 * @param {string} sTextMouse The text for the tooltip.
	 * @public
	 */
	AccExtension.prototype.updateRowTooltips = function(oRow, $Ref, sTextMouse) {
		if (!this._accMode) {
			return;
		}

		var oTable = this.getTable();
		var bShowRowTooltips = !oRow.isEmpty() && !oRow.isGroupHeader() && !oRow.isSummary() && !oTable._getHideStandardTooltips();

		if ($Ref.row) {
			if (bShowRowTooltips && TableUtils.isRowSelectionAllowed(oTable) && !$Ref.row.hasClass("sapUiTableRowHidden")) {
				$Ref.row.attr("title", sTextMouse);
			} else {
				$Ref.row.removeAttr("title");
			}
		}

		if ($Ref.rowSelector) {
			if (bShowRowTooltips && TableUtils.isRowSelectorSelectionAllowed(oTable)) {
				$Ref.rowSelector.attr("title", sTextMouse);
			} else {
				$Ref.rowSelector.removeAttr("title");
			}
		}

		if ($Ref.rowScrollPart) {
			var $Row = $Ref.rowScrollPart.add($Ref.rowFixedPart).add($Ref.rowActionPart);

			if (bShowRowTooltips && TableUtils.isRowSelectionAllowed(oTable)) {
				// the row requires a tooltip for selection if the cell selection is allowed
				$Row.attr("title", sTextMouse);
			} else {
				$Row.removeAttr("title");
			}
		}
	};

	/**
	 * Is called by the row whenever the selection state is changed and updates the corresponding ARIA attributes and tooltips.
	 *
	 * @param {sap.ui.table.Row} oRow Instance of the row.
	 * @param {jQuery} $Ref The jQuery references to the DOM areas of the row.
	 * @param {boolean} bIsSelected Whether the row is selected.
	 * @public
	 */
	AccExtension.prototype.updateSelectionStateOfRow = function(oRow) {
		if (!this._accMode) {
			return;
		}

		var $Ref = oRow.getDomRefs(true);
		var sTextKeyboard = "";
		var sTextMouse = "";

		if (!oRow.isEmpty() && !oRow.isGroupHeader() && !oRow.isSummary()) {
			var mTooltipTexts = this.getAriaTextsForSelectionMode(true);
			var oTable = this.getTable();
			var bIsSelected = oTable._getSelectionPlugin().isSelected(oRow);

			if ($Ref.row) {
				$Ref.row.not($Ref.rowHeaderPart).not($Ref.rowActionPart).add($Ref.row.children(".sapUiTableCell")).attr("aria-selected", bIsSelected ? "true" : "false");
			}

			if (!bIsSelected) {
				sTextKeyboard = mTooltipTexts.keyboard["rowSelect"];
				sTextMouse = mTooltipTexts.mouse["rowSelect"];
			} else {
				sTextKeyboard = mTooltipTexts.keyboard["rowDeselect"];
				sTextMouse = mTooltipTexts.mouse["rowDeselect"];
			}
		}

		if ($Ref.rowSelectorText) {
			$Ref.rowSelectorText.text(sTextKeyboard);
		}
		this.updateRowTooltips(oRow, $Ref, sTextMouse);
	};

	/**
	 * Updates the expand state and level for accessibility in case of grouping.
	 *
	 * @param {sap.ui.table.Row} oRow Instance of the row.
	 * @public
	 */
	AccExtension.prototype.updateAriaExpandAndLevelState = function(oRow) {
		if (!this._accMode) {
			return;
		}

		var oDomRefs = oRow.getDomRefs(true);
		var $TreeIcon = oDomRefs.row.find(".sapUiTableTreeIcon");

		if (oDomRefs.rowHeaderPart) {
			oDomRefs.rowHeaderPart.attr({
				"aria-haspopup": oRow.isGroupHeader() ? "menu" : null
			});
		}

		oDomRefs.row.not(oDomRefs.rowHeaderPart).not(oDomRefs.rowActionPart).attr({
			"aria-expanded": oRow.isExpandable() ? oRow.isExpanded() + "" : null,
			"aria-level": oRow.getLevel()
		});

		if ($TreeIcon) {
			$TreeIcon.attr(ExtensionHelper.getAriaAttributesFor(this, AccExtension.ELEMENTTYPES.TREEICON, {row: oRow}));
		}
	};

	/**
	 * Updates the row highlight state.
	 *
	 * @param {sap.ui.table.RowSettings} oRowSettings The row settings.
	 * @public
	 */
	AccExtension.prototype.updateAriaStateOfRowHighlight = function(oRowSettings) {
		if (!this._accMode || !oRowSettings) {
			return;
		}

		var oRow = oRowSettings._getRow();
		var oHighlightTextElement = oRow ? oRow.getDomRef("highlighttext") : null;

		if (oHighlightTextElement) {
			oHighlightTextElement.innerText = oRowSettings._getHighlightText();
		}
	};

	/**
	 * Updates the aria state of the navigated row.
	 *
	 * @param {sap.ui.table.RowSettings} oRowSettings The row settings.
	 * @private
	 */
	AccExtension.prototype._updateAriaStateOfNavigatedRow = function(oRowSettings) {
		if (!this._accMode || !oRowSettings) {
			return;
		}

		var oRow = oRowSettings._getRow();
		var bNavigated = oRowSettings.getNavigated();

		oRow.getDomRefs(true).row.attr("aria-current", bNavigated ? true : null);
	};

	/**
	 * Updates the relevant aria-properties in case of overlay or noData is set / reset.
	 *
	 * @public
	 */
	AccExtension.prototype.updateAriaStateForOverlayAndNoData = function() {
		var oTable = this.getTable();

		if (!oTable || !oTable.getDomRef() || !this._accMode) {
			return;
		}

		if (oTable.getShowOverlay()) {
			oTable.$().find("[data-sap-ui-table-acc-covered*='overlay']").attr("aria-hidden", "true");
		} else {
			oTable.$().find("[data-sap-ui-table-acc-covered*='overlay']").removeAttr("aria-hidden");
			if (TableUtils.isNoDataVisible(oTable)) {
				oTable.$().find("[data-sap-ui-table-acc-covered*='nodata']").attr("aria-hidden", "true");
			} else {
				oTable.$().find("[data-sap-ui-table-acc-covered*='nodata']").removeAttr("aria-hidden");
			}
		}
	};

	/**
	 * Retrieve Aria descriptions from resource bundle for a certain selection mode.
	 *
	 * @param {boolean} [bConsiderSelectionState] Set to <code>true</code>, to consider the current selection state of the table.
	 * @param {string} [sSelectionMode] If no selection mode is set, the current selection mode of the table is used.
	 * @returns {{mouse: {rowSelect: string, rowDeselect: string}, keyboard: {rowSelect: string, rowDeselect: string}}} Tooltip texts.
	 * @public
	 */
	AccExtension.prototype.getAriaTextsForSelectionMode = function(bConsiderSelectionState, sSelectionMode) {
		var oTable = this.getTable();

		if (!sSelectionMode) {
			sSelectionMode = oTable.getSelectionMode();
		}

		var bShowTooltips = !oTable._getHideStandardTooltips();
		var mTooltipTexts = {
			mouse: {
				rowSelect: "",
				rowDeselect: ""
			},
			keyboard: {
				rowSelect: "",
				rowDeselect: ""
			}
		};

		var iSelectedCount = oTable._getSelectionPlugin().getSelectedCount();

		if (sSelectionMode === SelectionMode.Single) {
			mTooltipTexts.mouse.rowSelect = bShowTooltips ? TableUtils.getResourceText("TBL_ROW_SELECT") : "";
			mTooltipTexts.mouse.rowDeselect = bShowTooltips ? TableUtils.getResourceText("TBL_ROW_DESELECT") : "";
			mTooltipTexts.keyboard.rowSelect = TableUtils.getResourceText("TBL_ROW_SELECT_KEY");
			mTooltipTexts.keyboard.rowDeselect = TableUtils.getResourceText("TBL_ROW_DESELECT_KEY");
		} else if (sSelectionMode === SelectionMode.MultiToggle) {
			mTooltipTexts.mouse.rowSelect = bShowTooltips ? TableUtils.getResourceText("TBL_ROW_SELECT_MULTI_TOGGLE") : "";
			// text for de-select is the same like for single selection
			mTooltipTexts.mouse.rowDeselect = bShowTooltips ? TableUtils.getResourceText("TBL_ROW_DESELECT") : "";
			mTooltipTexts.keyboard.rowSelect = TableUtils.getResourceText("TBL_ROW_SELECT_KEY");
			// text for de-select is the same like for single selection
			mTooltipTexts.keyboard.rowDeselect = TableUtils.getResourceText("TBL_ROW_DESELECT_KEY");

			if (bConsiderSelectionState === true && iSelectedCount === 0) {
				// if there is no row selected yet, the selection is like in single selection case
				mTooltipTexts.mouse.rowSelect = bShowTooltips ? TableUtils.getResourceText("TBL_ROW_SELECT") : "";
			}
		}

		return mTooltipTexts;
	};

	/**
	 * Applies corresponding ARIA properties of the given state to the select all button.
	 *
	 * @param {boolean} bSelectAll The select all state to be applied to the select all button.
	 * @public
	 */
	AccExtension.prototype.setSelectAllState = function(bSelectAll) {
		var oTable = this.getTable();

		if (this._accMode && oTable) {
			oTable.$("selall").attr("aria-checked", bSelectAll ? "true" : "false");
		}
	};

	/**
	 * Adds the column header / label of a column to the ariaLabelledBy association (if exists) of the given control.
	 *
	 * @param {sap.ui.table.Column} oColumn Instance of the column.
	 * @param {sap.ui.core.Control} oControl Instance of the control.
	 */
	AccExtension.prototype.addColumnHeaderLabel = function(oColumn, oControl) {
		var oTable = this.getTable();
		if (!this._accMode || !oControl.getAriaLabelledBy || !oTable) {
			return;
		}

		var sLabel = oTable.getColumnHeaderVisible() ? oColumn.getId() : null;
		if (!sLabel) {
			var oLabel = oColumn.getAggregation("label");
			if (oLabel) {
				sLabel = oLabel.getId();
			}
		}
		var aLabels = oControl.getAriaLabelledBy();
		if (sLabel && aLabels.indexOf(sLabel) < 0) {
			oControl.addAriaLabelledBy(sLabel);
		}
	};

	return AccExtension;
});

/**
 * Gets the accessibility extension.
 *
 * @name sap.ui.table.Table#_getAccExtension
 * @function
 * @returns {sap.ui.table.extensions.Accessibility} The accessibility extension.
 * @private
 */