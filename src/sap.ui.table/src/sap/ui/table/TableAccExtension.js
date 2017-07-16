/*!
 * ${copyright}
 */

// Provides helper sap.ui.table.TableAccExtension.
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Control', './library', './TableExtension', './TableAccRenderExtension', './TableUtils'],
	function(jQuery, Control, library, TableExtension, TableAccRenderExtension, TableUtils) {
	"use strict";

	// shortcuts
	var SelectionMode = library.SelectionMode;

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
		getAccInfoOfControl: function(oControl, oBundle) {
			if (oControl && typeof oControl.getAccessibilityInfo === "function") {
				if (typeof oControl.getVisible === "function" && !oControl.getVisible()) {
					return ACCInfoHelper._normalize({});
				}
				var oSource = oControl.getAccessibilityInfo();
				if (oSource) {
					var oTarget = {};
					ACCInfoHelper._flatten(oSource, oTarget, oBundle);
					return oTarget;
				}
			}
			return null;
		},

		/*
		 * Normalizes the given acc info object and ensures that all the defaults are set.
		 */
		_normalize : function(oInfo) {
			if (!oInfo) {
				return null;
			}

			if (oInfo._normalized) {
				return oInfo;
			}

			oInfo.role = oInfo.role || "";
			oInfo.type = oInfo.type || "";
			oInfo.description = oInfo.description || "";
			oInfo.focusable = !!oInfo.focusable;
			oInfo.enabled = (oInfo.enabled === true || oInfo.enabled === false) ? oInfo.enabled : null;
			oInfo.editable = (oInfo.editable === true || oInfo.editable === false) ? oInfo.editable : null;
			oInfo.children = oInfo.children || [];
			oInfo._normalized = true;

			return oInfo;
		},

		/*
		 * Merges the focusable flag and the descriptions of the source and its children into the given target.
		 */
		_flatten : function(oSourceInfo, oTargetInfo, oBundle, iLevel) {
			iLevel = iLevel ? iLevel : 0;

			ACCInfoHelper._normalize(oSourceInfo);
			if (iLevel == 0) {
				ACCInfoHelper._normalize(oTargetInfo);
				oTargetInfo._descriptions = [];
			}

			oTargetInfo.focusable = oTargetInfo.focusable || oSourceInfo.focusable;
			oTargetInfo._descriptions.push(ACCInfoHelper._getFullDescription(oSourceInfo, oBundle));

			oSourceInfo.children.forEach(function(oChild) {
				if (!oChild.getAccessibilityInfo || (oChild.getVisible && !oChild.getVisible())) {
					return;
				}

				var oChildInfo = oChild.getAccessibilityInfo();
				if (oChildInfo) {
					ACCInfoHelper._flatten(oChildInfo, oTargetInfo, oBundle, iLevel + 1);
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
		_getFullDescription : function(oInfo, oBundle) {
			var sDesc = oInfo.type + " " + oInfo.description;
			if (oInfo.enabled != null && !oInfo.enabled) {
				sDesc = sDesc + " " + oBundle.getText("TBL_CTRL_STATE_DISABLED");
			} else if (oInfo.editable != null && !oInfo.editable) {
				sDesc = sDesc + " " + oBundle.getText("TBL_CTRL_STATE_READONLY");
			}
			return sDesc.trim();
		}

	};


	/*
	 * Provides utility functions used this extension
	 */
	var ExtensionHelper = {

		/*
		 * Returns the index of the column (in the array of visible columns (see Table._getVisibleColumns())) of the current focused cell
		 * In case the focused cell is a row action the given index equals the length of the visible columns.
		 * This function must not be used if the focus is on a row header.
		 * @return {int}
		 */
		getColumnIndexOfFocusedCell : function(oExtension) {
			var oTable = oExtension.getTable();
			var oInfo = TableUtils.getFocusedItemInfo(oTable);
			return oInfo.cellInRow - (TableUtils.hasRowHeader(oTable) ? 1 : 0);
		},

		/*
		 * If the current focus is on a cell of the table, this function returns
		 * the cell type and the jQuery wrapper object of the corresponding cell:
		 * {type: <TYPE>, cell: <$CELL>}
		 */
		getInfoOfFocusedCell : function(oExtension) {
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
		getRelevantColumnHeaders : function(oTable, oColumn) {
			if (!oTable || !oColumn) {
				return [];
			}

			var iHeaderRowCount = TableUtils.getHeaderRowCount(oTable),
				sColumnId = oColumn.getId(),
				aLabels = [sColumnId];

			if (iHeaderRowCount > 1) {
				for (var i = 1; i < iHeaderRowCount; i++) {
					aLabels.push(sColumnId + "_" + i);
				}

				var aSpans = TableUtils.Column.getParentSpannedColumns(oTable, sColumnId);
				if (aSpans && aSpans.length) {
					for (var i = 0; i < aSpans.length; i++) {
						var iLevel = aSpans[i].level;
						var sParentId = aSpans[i].column.getId();
						aLabels[iLevel] = iLevel === 0 ? sParentId : (sParentId + "_" + iLevel);
					}
				}
			}

			return aLabels;
		},

		/*
		 * Returns whether the given cell is hidden
		 */
		isHiddenCell : function($Cell, oCell) {
			var bGroup = TableUtils.Grouping.isInGroupingRow($Cell);
			var bSum = TableUtils.Grouping.isInSumRow($Cell);
			var bSupportStyleClass = !!oCell && !!oCell.hasStyleClass;

			var bIsRowHidden = $Cell.parent().hasClass("sapUiTableRowHidden");
			var bIsCellHidden = $Cell.hasClass("sapUiTableCellHidden");
			var bNoMeasureInFirstCellInGroup = bGroup && $Cell.hasClass("sapUiTableTdFirst") && !$Cell.hasClass("sapUiTableMeasureCell");
			var bGroupCellHiddenByApp = bGroup && bSupportStyleClass && oCell.hasStyleClass("sapUiAnalyticalTableGroupCellHidden");
			var bSumCellHiddenByApp = bSum && bSupportStyleClass && oCell.hasStyleClass("sapUiAnalyticalTableSumCellHidden");

			return bIsRowHidden || bIsCellHidden || bNoMeasureInFirstCellInGroup || bGroupCellHiddenByApp || bSumCellHiddenByApp;
		},

		/*
		 * Returns whether the given cell is in the tree column of a TreeTable
		 */
		isTreeColumnCell : function(oExtension, $Cell) {
			return TableUtils.Grouping.isTreeMode(oExtension.getTable()) && $Cell.hasClass("sapUiTableTdFirst");
		},

		/*
		 * Returns the tooltip of the column or the contained label, if any.
		 */
		getColumnTooltip : function(oColumn) {
			if (!oColumn) {
				return null;
			}

			var sTooltip = oColumn.getTooltip_AsString();
			if (sTooltip) {
				return sTooltip;
			}

			var oLabel = oColumn.getLabel();
			if (oLabel instanceof Control) {
				sTooltip = oLabel.getTooltip_AsString();
			}
			if (sTooltip) {
				return sTooltip;
			}

			return null;
		},

		/*
		 * Determines the current row and column and updates the hidden description texts of the table accordingly.
		 */
		updateRowColCount : function(oExtension) {
			var oTable = oExtension.getTable(),
				oIN = oTable._getItemNavigation(),
				bIsRowChanged = false,
				bIsColChanged = false,
				bIsInitial = false;

			if (oIN) {
				var iColumnNumber = ExtensionHelper.getColumnIndexOfFocusedCell(oExtension) + 1; //+1 -> we want to announce a count and not the index, the action column is handled like a normal column
				var iRowNumber = TableUtils.getRowIndexOfFocusedCell(oTable) + oTable.getFirstVisibleRow() + 1; //same here + take virtualization into account
				var iColCount = TableUtils.getVisibleColumnCount(oTable) + (TableUtils.hasRowActions(oTable) ? 1 : 0);
				var iRowCount = TableUtils.isNoDataVisible(oTable) ? 0 : TableUtils.getTotalRowCount(oTable, true);

				bIsRowChanged = oExtension._iLastRowNumber != iRowNumber || (oExtension._iLastRowNumber == iRowNumber && oExtension._iLastColumnNumber == iColumnNumber);
				bIsColChanged = oExtension._iLastColumnNumber != iColumnNumber;
				bIsInitial = !oExtension._iLastRowNumber && !oExtension._iLastColumnNumber;

				oTable.$("rownumberofrows").text(bIsRowChanged ? oTable._oResBundle.getText("TBL_ROW_ROWCOUNT", [iRowNumber, iRowCount]) : " ");
				oTable.$("colnumberofcols").text(bIsColChanged ? oTable._oResBundle.getText("TBL_COL_COLCOUNT", [iColumnNumber, iColCount]) : " ");
				oTable.$("ariacount").text(bIsInitial ? oTable._oResBundle.getText("TBL_DATA_ROWS_COLS", [iRowCount, iColCount]) : " ");

				oExtension._iLastRowNumber = iRowNumber;
				oExtension._iLastColumnNumber = iColumnNumber;
			}

			return {
				rowChange: bIsRowChanged,
				colChange: bIsColChanged,
				initial: bIsInitial
			};
		},

		/*
		 * Removes the acc modifications of the cell which had the focus before.
		 */
		cleanupCellModifications : function(oExtension) {
			if (oExtension._cleanupInfo) {
				oExtension._cleanupInfo.cell.attr(oExtension._cleanupInfo.attr);
				oExtension._cleanupInfo = null;
			}
		},

		/*
		 * Stores the defaults before modifications of a cell for later cleanup
		 * @see ExtensionHelper.cleanupCellModifications
		 */
		storeDefaultsBeforeCellModifications : function(oExtension, $Cell, aDefaultLabels, aDefaultDescriptions) {
			oExtension._cleanupInfo = {
				cell: $Cell,
				attr: {
					"aria-labelledby" : aDefaultLabels && aDefaultLabels.length ? aDefaultLabels.join(" ") : null,
					"aria-describedby" : aDefaultDescriptions && aDefaultDescriptions.length ? aDefaultDescriptions.join(" ") : null
				}
			};
		},

		/*
		 * Updates the row / column counters, adapts the labels and descriptions of the given cell and stores the the
		 * given defaults before the modification.
		 * @see ExtensionHelper.updateRowColCount
		 * @see ExtensionHelper.storeDefaultsBeforeCellModifications
		 */
		performCellModifications : function(oExtension, $Cell, aDefaultLabels, aDefaultDescriptions, aLabels, aDescriptions, sText, fAdapt) {
			ExtensionHelper.storeDefaultsBeforeCellModifications(oExtension, $Cell, aDefaultLabels, aDefaultDescriptions);
			var oCountChangeInfo = ExtensionHelper.updateRowColCount(oExtension);
			oExtension.getTable().$("cellacc").text(sText || " "); //set the custom text to the prepared hidden element

			if (fAdapt) { //Allow to adapt the labels / descriptions based on the changed row / column count
				fAdapt(aLabels, aDescriptions, oCountChangeInfo.rowChange, oCountChangeInfo.colChange, oCountChangeInfo.initial);
			}

			var sLabel = "";
			if (oCountChangeInfo.initial) {
				var oTable = oExtension.getTable();
				sLabel = oTable.getAriaLabelledBy().join(" ") + " " + oTable.getId() + "-ariadesc " + oTable.getId() + "-ariacount";
			}

			if (aLabels && aLabels.length) {
				sLabel = sLabel + " " + aLabels.join(" ");
			}

			$Cell.attr({
				"aria-labelledby" : sLabel ? sLabel : null,
				"aria-describedby" : aDescriptions && aDescriptions.length ? aDescriptions.join(" ") : null
			});
		},

		/*
		 * Modifies the labels and descriptions of a data cell.
		 * @see ExtensionHelper.performCellModifications
		 */
		modifyAccOfDATACELL : function($Cell, bOnCellFocus) {
			var oTable = this.getTable(),
				sTableId = oTable.getId(),
				oIN = oTable._getItemNavigation();

			if (!oIN) {
				return;
			}

			var iRow = TableUtils.getRowIndexOfFocusedCell(oTable),
				iCol = ExtensionHelper.getColumnIndexOfFocusedCell(this), // Because we are on a data cell this is the index in the visible columns array
				oTableInstances = TableUtils.getRowColCell(oTable, iRow, iCol, false),
				oInfo = null,
				bHidden = ExtensionHelper.isHiddenCell($Cell, oTableInstances.cell),
				bIsTreeColumnCell = ExtensionHelper.isTreeColumnCell(this, $Cell),
				bIsInGroupingRow = TableUtils.Grouping.isInGroupingRow($Cell),
				bIsInSumRow = TableUtils.Grouping.isInSumRow($Cell),
				aDefaultLabels = ExtensionHelper.getAriaAttributesFor(this, TableAccExtension.ELEMENTTYPES.DATACELL, {
					index: iCol,
					column: oTableInstances.column,
					fixed: TableUtils.isFixedColumn(oTable, iCol)
				})["aria-labelledby"] || [],
				aDescriptions = [],
				aLabels = [sTableId + "-rownumberofrows", sTableId + "-colnumberofcols"];

			if (bIsInGroupingRow) {
				aLabels.push(sTableId + "-ariarowgrouplabel");
				aLabels.push(sTableId + "-rows-row" + iRow + "-groupHeader");
			}

			if (bIsInSumRow) {
				var iLevel = $Cell.parent().data("sap-ui-level");
				if (iLevel == 0) {
					aLabels.push(sTableId + "-ariagrandtotallabel");
				} else if (iLevel > 0) {
					aLabels.push(sTableId + "-ariagrouptotallabel");
					aLabels.push(sTableId + "-rows-row" + iRow + "-groupHeader");
				}
			}

			if (TableUtils.hasRowHighlights(oTable) && !bIsInGroupingRow && !bIsInSumRow) {
				aLabels.push(oTableInstances.row.getId() + "-highlighttext");
			}

			aLabels = aLabels.concat(aDefaultLabels);

			if (!bHidden) {
				oInfo = ACCInfoHelper.getAccInfoOfControl(oTableInstances.cell, oTable._oResBundle);
				aLabels.push(oInfo ? (sTableId + "-cellacc") : oTableInstances.cell.getId());

				// Possible later extension for aria-labelledby and aria-describedby support
				// if (oInfo && oInfo.labelled) { aLabels.push(oInfo.labelled); }
				// if (oInfo && oInfo.described) { aDescriptions.push(oInfo.described); }

				if (((!oInfo || oInfo.focusable) && !this._readonly) || (bIsTreeColumnCell && oTableInstances.row && oTableInstances.row._bHasChildren)) {
					aDescriptions.push(sTableId + "-toggleedit");
				}
			}

			var sText = oInfo ? oInfo.description : " ";
			if (bIsTreeColumnCell && !bHidden) {
				var oAttributes = ExtensionHelper.getAriaAttributesFor(this, TableAccExtension.ELEMENTTYPES.TREEICON, {row: oTableInstances.row});
				if (oAttributes && oAttributes["aria-label"]) {
					sText = oAttributes["aria-label"] + " " + sText;
				}
			}

			ExtensionHelper.performCellModifications(this, $Cell, aDefaultLabels, null, aLabels, aDescriptions, sText,
				function (aLabels, aDescriptions, bRowChange, bColChange, bInitial) {
					if (!bHidden && TableUtils.isRowSelectionAllowed(oTable) && bRowChange) {
						aDescriptions.push(oTableInstances.row.getId() + "-rowselecttext");
					}
				}
			);
		},

		/*
		 * Modifies the labels and descriptions of a row header cell.
		 * @see ExtensionHelper.performCellModifications
		 */
		modifyAccOfROWHEADER : function($Cell, bOnCellFocus) {
			var oTable = this.getTable(),
				sTableId = oTable.getId(),
				bIsInGroupingRow = TableUtils.Grouping.isInGroupingRow($Cell),
				bIsInSumRow = TableUtils.Grouping.isInSumRow($Cell),
				oRow = oTable.getRows()[$Cell.attr("data-sap-ui-rowindex")],
				aDefaultLabels = ExtensionHelper.getAriaAttributesFor(this, TableAccExtension.ELEMENTTYPES.ROWHEADER)["aria-labelledby"] || [],
				aLabels = aDefaultLabels.concat([sTableId + "-rownumberofrows"]);

			if (!bIsInSumRow && !bIsInGroupingRow) {
				if ($Cell.attr("aria-selected") == "true") {
					aLabels.push(sTableId + "-ariarowselected");
				}
				if (!$Cell.hasClass("sapUiTableRowHidden")) {
					aLabels.push(oRow.getId() + "-rowselecttext");

					if (TableUtils.hasRowHighlights(oTable)) {
						aLabels.push(oRow.getId() + "-highlighttext");
					}
				}
			}

			if (bIsInGroupingRow) {
				aLabels.push(sTableId + "-ariarowgrouplabel");
				//aLabels.push(oRow.getId() + "-groupHeader"); //Not needed: Screenreader seems to announce this automatically
			}

			if (bIsInSumRow) {
				var iLevel = $Cell.data("sap-ui-level");
				if (iLevel == 0) {
					aLabels.push(sTableId + "-ariagrandtotallabel");
				} else if (iLevel > 0) {
					aLabels.push(sTableId + "-ariagrouptotallabel");
					//aLabels.push(oRow.getId() + "-groupHeader"); //Not needed: Screenreader seems to announce this automatically
				}
			}

			ExtensionHelper.performCellModifications(this, $Cell, aDefaultLabels, null, aLabels, null, null);
		},

		/*
		 * Modifies the labels and descriptions of a column header cell.
		 * @see ExtensionHelper.performCellModifications
		 */
		modifyAccOfCOLUMNHEADER : function($Cell, bOnCellFocus) {
			var oTable = this.getTable(),
				oColumn = sap.ui.getCore().byId($Cell.attr("data-sap-ui-colid")),
				mAttributes = ExtensionHelper.getAriaAttributesFor(this, TableAccExtension.ELEMENTTYPES.COLUMNHEADER, {
					headerId: $Cell.attr("id"),
					column: oColumn,
					index: $Cell.attr("data-sap-ui-colindex")
				}),
				sText = ExtensionHelper.getColumnTooltip(oColumn),
				aLabels = [oTable.getId() + "-colnumberofcols"].concat(mAttributes["aria-labelledby"]),
				oHeaderInfo = TableUtils.getColumnHeaderCellInfo($Cell),
				iSpan = oHeaderInfo ? oHeaderInfo.span : 1;

			if (iSpan > 1) {
				aLabels.push(oTable.getId() + "-ariacolspan");
				// Update Span information
				oTable.$("ariacolspan").text(oTable._oResBundle.getText("TBL_COL_DESC_SPAN", ["" + iSpan]));
			}

			if (sText) {
				aLabels.push(oTable.getId() + "-cellacc");
			}

			if (iSpan <= 1 && oColumn && oColumn.getSorted()) {
				aLabels.push(oTable.getId() + (oColumn.getSortOrder() === "Ascending" ? "-ariacolsortedasc" : "-ariacolsorteddes"));
			}
			if (iSpan <= 1 && oColumn && oColumn.getFiltered()) {
				aLabels.push(oTable.getId() + "-ariacolfiltered");
			}

			if (iSpan <= 1 && $Cell.attr("aria-haspopup") === "true") {
				aLabels.push(oTable.getId() + "-ariacolmenu");
			}

			ExtensionHelper.performCellModifications(this, $Cell, mAttributes["aria-labelledby"], mAttributes["aria-describedby"],
				aLabels, mAttributes["aria-describedby"], sText);
		},

		/*
		 * Modifies the labels and descriptions of the column row header.
		 * @see ExtensionHelper.performCellModifications
		 */
		modifyAccOfCOLUMNROWHEADER : function($Cell, bOnCellFocus) {
			var oTable = this.getTable(),
				bEnabled = $Cell.hasClass("sapUiTableSelAllEnabled");
			var mAttributes = ExtensionHelper.getAriaAttributesFor(this, TableAccExtension.ELEMENTTYPES.COLUMNROWHEADER, {enabled: bEnabled, checked: bEnabled && !oTable.$().hasClass("sapUiTableSelAll")});
			ExtensionHelper.performCellModifications(this, $Cell, mAttributes["aria-labelledby"], mAttributes["aria-describedby"],
				mAttributes["aria-labelledby"], mAttributes["aria-describedby"], null);
		},

		/*
		 * Modifies the labels and descriptions of a row action cell.
		 * @see ExtensionHelper.performCellModifications
		 */
		modifyAccOfROWACTION : function($Cell, bOnCellFocus) {
			var oTable = this.getTable(),
				sTableId = oTable.getId(),
				bIsInGroupingRow = TableUtils.Grouping.isInGroupingRow($Cell),
				bIsInSumRow = TableUtils.Grouping.isInSumRow($Cell),
				iRow = $Cell.attr("data-sap-ui-rowindex"),
				oRow = oTable.getRows()[iRow],
				bHidden = ExtensionHelper.isHiddenCell($Cell),
				aDefaultLabels = ExtensionHelper.getAriaAttributesFor(this, TableAccExtension.ELEMENTTYPES.ROWACTION)["aria-labelledby"] || [],
				aLabels = [sTableId + "-rownumberofrows", sTableId + "-colnumberofcols"].concat(aDefaultLabels),
				aDescriptions = [];

			if (bIsInGroupingRow) {
				aLabels.push(sTableId + "-ariarowgrouplabel");
				aLabels.push(sTableId + "-rows-row" + iRow + "-groupHeader");
			}

			if (bIsInSumRow) {
				var iLevel = $Cell.data("sap-ui-level");
				if (iLevel == 0) {
					aLabels.push(sTableId + "-ariagrandtotallabel");
				} else if (iLevel > 0) {
					aLabels.push(sTableId + "-ariagrouptotallabel");
					aLabels.push(sTableId + "-rows-row" + iRow + "-groupHeader");
				}
			}

			if (!bIsInSumRow && !bIsInGroupingRow && $Cell.attr("aria-selected") == "true") {
				aLabels.push(sTableId + "-ariarowselected");
			}

			if (TableUtils.hasRowHighlights(oTable) && !bIsInGroupingRow && !bIsInSumRow) {
				aLabels.push(oRow.getId() + "-highlighttext");
			}

			var sText = "";
			if (!bHidden) {
				var oRowAction = oRow.getAggregation("_rowAction");
				if (oRowAction) {
					var oInfo = oRowAction.getAccessibilityInfo();
					if (oInfo) {
						aLabels.push(sTableId + "-cellacc");
						sText = oInfo.description;
						if (oInfo.focusable) {
							aDescriptions.push(sTableId + "-toggleedit");
						}
					}
				}
			}

			ExtensionHelper.performCellModifications(this, $Cell, aDefaultLabels, [], aLabels, aDescriptions, sText);
		},

		/*
		 * Returns the default aria attibutes for the given element type with the given settings.
		 * @see TableAccExtension.ELEMENTTYPES
		 */
		getAriaAttributesFor : function(oExtension, sType, mParams) {
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
				case TableAccExtension.ELEMENTTYPES.COLUMNROWHEADER:
					mAttributes["aria-labelledby"] = [sTableId + "-ariacolrowheaderlabel"];

					var bAddSelectAllLabel = false;
					mAttributes["role"] = ["button"];
					if (mParams && mParams.enabled) {
						mAttributes["aria-pressed"] = mParams.checked ? "true" : "false";
					} else {
						bAddSelectAllLabel = true;
						mAttributes["aria-disabled"] = "true";
						mAttributes["aria-pressed"] = "false";
					}
					if (bAddSelectAllLabel || !oTable._getShowStandardTooltips()) {
						mAttributes["aria-labelledby"].push(sTableId + "-ariaselectall");
					}
					break;

				case TableAccExtension.ELEMENTTYPES.ROWHEADER:
					mAttributes["aria-labelledby"] = [sTableId + "-ariarowheaderlabel"];
					if (!TableUtils.Grouping.isTreeMode(oTable)) { // Otherwise there are strange announcements of the whole content in AnalyticalTable
						mAttributes["role"] = ["rowheader"];
					}
					if (oTable.getSelectionMode() !== SelectionMode.None && (!mParams || !mParams.rowHidden)) {
						var bSelected = mParams && mParams.rowSelected;
						mAttributes["aria-selected"] = "" + bSelected;
						var mTooltipTexts = oExtension.getAriaTextsForSelectionMode(true);
						mAttributes["title"] = mTooltipTexts.mouse[bSelected ? "rowDeselect" : "rowSelect"];
					}
					break;

				case TableAccExtension.ELEMENTTYPES.ROWACTION:
					mAttributes["role"] = ["gridcell"];
					mAttributes["aria-labelledby"] = [sTableId + "-rowacthdr"];
					if (oTable.getSelectionMode() !== SelectionMode.None && (!mParams || !mParams.rowHidden)) {
						var bSelected = mParams && mParams.rowSelected;
						mAttributes["aria-selected"] = "" + bSelected;
					}
					break;

				case TableAccExtension.ELEMENTTYPES.COLUMNHEADER:
					var oColumn = mParams && mParams.column;
					var bHasColSpan = mParams && mParams.colspan;

					mAttributes["role"] = "columnheader";
					var aLabels = [];

					if (mParams && mParams.headerId) {
						var aHeaders = ExtensionHelper.getRelevantColumnHeaders(oTable, oColumn);
						var iIdx = jQuery.inArray(mParams.headerId, aHeaders);
						aLabels = iIdx > 0 ? aHeaders.slice(0, iIdx + 1) : [mParams.headerId];
					}
					for (var i = 0; i < aLabels.length; i++) {
						aLabels[i] = aLabels[i] + "-inner";
					}
					mAttributes["aria-labelledby"] = aLabels;

					if (mParams && (mParams.index < oTable.getFixedColumnCount())) {
						mAttributes["aria-labelledby"].push(sTableId + "-ariafixedcolumn");
					}

					if (!bHasColSpan && oColumn && oColumn.getSorted()) {
						mAttributes["aria-sort"] = oColumn.getSortOrder() === "Ascending" ? "ascending" : "descending";
					}

					if (!bHasColSpan && oColumn && oColumn._menuHasItems()) {
						mAttributes["aria-haspopup"] = "true";
					}
					break;

				case TableAccExtension.ELEMENTTYPES.DATACELL:
					mAttributes["role"] = "gridcell";
					if (mParams && typeof mParams.index === "number") {
						mAttributes["headers"] = sTableId + "_col" + mParams.index;
					}

					var aLabels = [],
						oColumn = mParams && mParams.column ? mParams.column : null;

					if (oColumn) {
						aLabels = ExtensionHelper.getRelevantColumnHeaders(oTable, oColumn);
						for (var i = 0; i < aLabels.length; i++) {
							aLabels[i] = aLabels[i] + "-inner";
						}

						if (mParams && mParams.fixed) {
							aLabels.push(sTableId + "-ariafixedcolumn");
						}
					}

					mAttributes["aria-labelledby"] = aLabels;

					/*if (oTable.getSelectionMode() !== SelectionMode.None) {
						mAttributes["aria-selected"] = "false";
					}*/

					// Handle expand state for first Column in TreeTable
					if (TableUtils.Grouping.isTreeMode(oTable) && mParams && mParams.firstCol && mParams.row) {
						var oBindingInfo = oTable.mBindingInfos["rows"];
						if (mParams.row.getBindingContext(oBindingInfo && oBindingInfo.model)) {
							mAttributes["aria-level"] = mParams.row._iLevel + 1;
							mAttributes["aria-expanded"] = "" + mParams.row._bIsExpanded;
						}
					}
					break;

				case TableAccExtension.ELEMENTTYPES.ROOT: //The tables root dom element
					break;

				case TableAccExtension.ELEMENTTYPES.TABLE: //The "real" table element(s)
					mAttributes["role"] = "presentation";
					addAriaForOverlayOrNoData(oTable, mAttributes, true, true);
					break;

				case TableAccExtension.ELEMENTTYPES.CONTENT: //The content area of the table which contains all the table elements, rowheaders, columnheaders, etc
					mAttributes["role"] = TableUtils.Grouping.isGroupMode(oTable) || TableUtils.Grouping.isTreeMode(oTable) ? "treegrid" : "grid";
					mAttributes["aria-labelledby"] = [].concat(oTable.getAriaLabelledBy());
					if (oTable.getTitle()) {
						mAttributes["aria-labelledby"].push(oTable.getTitle().getId());
					}
					if (oTable.getSelectionMode() === SelectionMode.Multi || oTable.getSelectionMode() === SelectionMode.MultiToggle) {
						mAttributes["aria-multiselectable"] = "true";
					}
					break;

				case TableAccExtension.ELEMENTTYPES.TABLEHEADER: //The table header area
					mAttributes["role"] = "heading";
					addAriaForOverlayOrNoData(oTable, mAttributes, true, false);
					break;

				case TableAccExtension.ELEMENTTYPES.COLUMNHEADER_TBL: //Table of column headers
					mAttributes["role"] = "presentation";
					break;

				case TableAccExtension.ELEMENTTYPES.COLUMNHEADER_ROW: //The area which contains the column headers (TableUtils.CELLTYPES.COLUMNHEADER)
					if (!TableUtils.hasRowHeader(oTable)) {
						mAttributes["role"] = "row";
					}
					addAriaForOverlayOrNoData(oTable, mAttributes, true, false);
					break;

				case TableAccExtension.ELEMENTTYPES.ROWHEADER_COL: //The area which contains the row headers (TableUtils.CELLTYPES.ROWHEADER)
					addAriaForOverlayOrNoData(oTable, mAttributes, true, true);
					break;

				case TableAccExtension.ELEMENTTYPES.TH: //The "technical" column headers
					var bHasFixedColumns = oTable.getFixedColumnCount() > 0;
					mAttributes["role"] = bHasFixedColumns ? "columnheader" : "presentation";
					mAttributes["scope"] = "col";
					if (bHasFixedColumns) {
						if (mParams && mParams.column) {
							mAttributes["aria-owns"] = mParams.column.getId();
							mAttributes["aria-labelledby"] = [mParams.column.getId()];
						}
					} else {
						mAttributes["aria-hidden"] = "true";
					}
					break;

				case TableAccExtension.ELEMENTTYPES.ROWHEADER_TD: //The "technical" row headers
					mAttributes["role"] = "rowheader";
					mAttributes["aria-labelledby"] = [sTableId + "-ariarowheaderlabel"];
					mAttributes["headers"] = sTableId + "-colsel";
					if (mParams && typeof mParams.index === "number") {
						mAttributes["aria-owns"] = sTableId + "-rowsel" + mParams.index;
					}
					if (oTable.getSelectionMode() !== SelectionMode.None) {
						var bSelected = mParams && mParams.rowSelected;
						mAttributes["aria-selected"] = "" + bSelected;
					}
					break;

				case TableAccExtension.ELEMENTTYPES.TR: //The rows
					mAttributes["role"] = "row";
					var bSelected = false;
					if (mParams && typeof mParams.index === "number" && oTable.getSelectionMode() !== SelectionMode.None && oTable.isIndexSelected(mParams.index)) {
						mAttributes["aria-selected"] = "true";
						bSelected = true;
					}
					if (TableUtils.isRowSelectionAllowed(oTable)) {
						var mTooltipTexts = oExtension.getAriaTextsForSelectionMode(true);
						mAttributes["title"] = mTooltipTexts.mouse[bSelected ? "rowDeselect" : "rowSelect"];
					}
					break;

				case TableAccExtension.ELEMENTTYPES.TREEICON: //The expand/collapse icon in the TreeTable
					if (TableUtils.Grouping.isTreeMode(oTable)) {
						mAttributes = {
							"aria-label" : "",
							"title" : "",
							"role" : ""
						};
						if (oTable.getBinding("rows")) {
							mAttributes["role"] = "button";
							if (mParams && mParams.row) {
								if (mParams.row._bHasChildren) {
									var sText = oTable._oResBundle.getText(mParams.row._bIsExpanded ? "TBL_COLLAPSE" : "TBL_EXPAND");
									if (oTable._getShowStandardTooltips()) {
										mAttributes["title"] = sText;
									} else {
										mAttributes["aria-label"] = sText;
									}
									mAttributes["aria-expanded"] = "" + (!!mParams.row._bIsExpanded);
								} else {
									mAttributes["aria-label"] = oTable._oResBundle.getText("TBL_LEAF");
								}
							}
						}
					}
					break;

				case TableAccExtension.ELEMENTTYPES.NODATA: //The no data container
					mAttributes["role"] = "gridcell";
					var oNoData = oTable.getNoData();
					mAttributes["aria-labelledby"] = [oNoData instanceof Control ? oNoData.getId() : (sTableId + "-noDataMsg")];
					addAriaForOverlayOrNoData(oTable, mAttributes, true, false);
					break;

				case TableAccExtension.ELEMENTTYPES.OVERLAY: //The overlay container
					mAttributes["role"] = "region";
					mAttributes["aria-labelledby"] = [].concat(oTable.getAriaLabelledBy());
					if (oTable.getTitle()) {
						mAttributes["aria-labelledby"].push(oTable.getTitle().getId());
					}
					mAttributes["aria-labelledby"].push(sTableId + "-ariainvalid");
					break;

				case TableAccExtension.ELEMENTTYPES.TABLEFOOTER: //The table footer area
				case TableAccExtension.ELEMENTTYPES.TABLESUBHEADER: //The table toolbar and extension areas
					addAriaForOverlayOrNoData(oTable, mAttributes, true, false);
					break;

				case TableAccExtension.ELEMENTTYPES.ROWACTIONHEADER: // The header of the row action column
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
	 *
	 * @class Extension for sap.ui.table.Table which handles ACC related things.
	 *
	 * @extends sap.ui.table.TableExtension
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @alias sap.ui.table.TableAccExtension
	 */
	var TableAccExtension = TableExtension.extend("sap.ui.table.TableAccExtension", /* @lends sap.ui.table.TableAccExtension */ {

		/*
		 * @see TableExtension._init
		 */
		_init : function(oTable, sTableType, mSettings) {
			this._accMode = sap.ui.getCore().getConfiguration().getAccessibility();
			this._readonly = sTableType == TableExtension.TABLETYPES.ANALYTICAL ? true : false;

			oTable.addEventDelegate(this);

			// Initialize Render extension
			TableExtension.enrich(oTable, TableAccRenderExtension);

			return "AccExtension";
		},

		/*
		 * @see sap.ui.base.Object#destroy
		 */
		destroy : function() {
			this.getTable().removeEventDelegate(this);

			this._readonly = false;

			TableExtension.prototype.destroy.apply(this, arguments);
		},

		/*
		 * Enables debugging for the extension
		 */
		_debug : function() {
			this._ExtensionHelper = ExtensionHelper;
			this._ACCInfoHelper = ACCInfoHelper;
		},

		/*
		 * Provide protected access for TableACCRenderExtension
		 * @see ExtensionHelper.getAriaAttributesFor
		 */
		_getAriaAttributesFor : function(sType, mParams) {
			return ExtensionHelper.getAriaAttributesFor(this, sType, mParams);
		},

		/*
		 * Delegate function for focusin event
		 * @public (Part of the API for Table control only!)
		 */
		onfocusin : function(oEvent) {
			var oTable = this.getTable();
			if (!oTable || !TableUtils.getCellInfo(oEvent.target)) {
				return;
			}
			if (oTable._mTimeouts._cleanupACCExtension) {
				jQuery.sap.clearDelayedCall(oTable._mTimeouts._cleanupACCExtension);
				oTable._mTimeouts._cleanupACCExtension = null;
			}
			this.updateAccForCurrentCell(true);
		},

		/*
		 * Delegate function for focusout event
		 * @public (Part of the API for Table control only!)
		 */
		onfocusout: function(oEvent) {
			var oTable = this.getTable();
			if (!oTable) {
				return;
			}
			oTable._mTimeouts._cleanupACCExtension = jQuery.sap.delayedCall(100, this, function() {
				var oTable = this.getTable();
				if (!oTable) {
					return;
				}
				this._iLastRowNumber = null;
				this._iLastColumnNumber = null;
				ExtensionHelper.cleanupCellModifications(this);
				oTable._mTimeouts._cleanupACCExtension = null;
			});
		}
	});

	/*
	 * Known element types (DOM areas) in the table
	 * @see TableAccRenderExtension.writeAriaAttributesFor
	 * @public (Part of the API for Table control only!)
	 */
	TableAccExtension.ELEMENTTYPES = {
		DATACELL : 			TableUtils.CELLTYPES.DATACELL, 			// @see TableUtils.CELLTYPES
		COLUMNHEADER : 		TableUtils.CELLTYPES.COLUMNHEADER, 		// @see TableUtils.CELLTYPES
		ROWHEADER : 		TableUtils.CELLTYPES.ROWHEADER, 		// @see TableUtils.CELLTYPES
		ROWACTION : 		TableUtils.CELLTYPES.ROWACTION, 		// @see TableUtils.CELLTYPES
		COLUMNROWHEADER : 	TableUtils.CELLTYPES.COLUMNROWHEADER, 	// @see TableUtils.CELLTYPES
		ROOT : 				"ROOT", 								// The tables root dom element
		CONTENT: 			"CONTENT",								// The content area of the table which contains all the table elements, rowheaders, columnheaders, etc
		TABLE : 			"TABLE", 								// The "real" table element(s)
		TABLEHEADER : 		"TABLEHEADER", 							// The table header area
		TABLEFOOTER : 		"TABLEFOOTER", 							// The table footer area
		TABLESUBHEADER : 	"TABLESUBHEADER", 						// The table toolbar and extension areas
		COLUMNHEADER_TBL :  "COLUMNHEADER_TABLE", 					// The table with the column headers
		COLUMNHEADER_ROW : 	"COLUMNHEADER_ROW", 					// The table row with the column headers (TableUtils.CELLTYPES.COLUMNHEADER)
		ROWHEADER_COL : 	"ROWHEADER_COL", 						// The area which contains the row headers (TableUtils.CELLTYPES.ROWHEADER)
		TH : 				"TH", 									// The "technical" column headers
		ROWHEADER_TD : 		"ROWHEADER_TD", 						// The "technical" row headers
		TR : 				"TR", 									// The rows
		TREEICON : 			"TREEICON", 							// The expand/collapse icon in the TreeTable
		ROWACTIONHEADER : 	"ROWACTIONHEADER", 						// The header of the row action column
		NODATA :			"NODATA",								// The no data container
		OVERLAY :			"OVERLAY"								// The overlay container
	};

	/*
	 * Returns whether acc mode is switched on ore not.
	 * @public (Part of the API for Table control only!)
	 */
	TableAccExtension.prototype.getAccMode = function() {
		return this._accMode;
	};

	/*
	 * Determines the current focused cell and modifies the labels and descriptions if needed.
	 * @public (Part of the API for Table control only!)
	 */
	TableAccExtension.prototype.updateAccForCurrentCell = function(bOnCellFocus) {
		if (!this._accMode || !this.getTable()._getItemNavigation()) {
			return;
		}

		var oTable = this.getTable();

		if (oTable._mTimeouts._cleanupACCFocusRefresh) {
			jQuery.sap.clearDelayedCall(oTable._mTimeouts._cleanupACCFocusRefresh);
			oTable._mTimeouts._cleanupACCFocusRefresh = null;
		}

		if (bOnCellFocus) {
			ExtensionHelper.cleanupCellModifications(this);
		}

		var oInfo = ExtensionHelper.getInfoOfFocusedCell(this);
		if (!oInfo || !oInfo.cell || !oInfo.type || !ExtensionHelper["modifyAccOf" + oInfo.type]) {
			return;
		}

		if (!bOnCellFocus) {
			// Delayed reinitialize the focus when scrolling (focus stays on the same cell, only content is replaced)
			// to force screenreader announcements
			if (oInfo.type === TableUtils.CELLTYPES.DATACELL || TableUtils.CELLTYPES.ROWHEADER) {
				oTable._mTimeouts._cleanupACCFocusRefresh = jQuery.sap.delayedCall(100, this, function($Cell) {
					var oTable = this.getTable();
					if (!oTable) {
						return;
					}
					var oInfo = ExtensionHelper.getInfoOfFocusedCell(this);
					if (oInfo && oInfo.cell && oInfo.type && oInfo.cell.get(0) && $Cell.get(0) === oInfo.cell.get(0)) {
						oInfo.cell.blur().focus();
					}
					oTable._mTimeouts._cleanupACCFocusRefresh = null;
				}, [oInfo.cell]);
			}
			return;
		}

		ExtensionHelper["modifyAccOf" + oInfo.type].apply(this, [oInfo.cell, bOnCellFocus]);
	};

	/*
	 * Is called by the Column whenever the sort or filter state is changed and updates the corresponding
	 * ARIA attributes.
	 * @public (Part of the API for Table control only!)
	 */
	TableAccExtension.prototype.updateAriaStateOfColumn = function(oColumn) {
		if (!this._accMode) {
			return;
		}

		var mAttributes = ExtensionHelper.getAriaAttributesFor(this, TableAccExtension.ELEMENTTYPES.COLUMNHEADER, {
			headerId: oColumn.getId(),
			column: oColumn,
			index: this.getTable().indexOfColumn(oColumn)
		});

		var aHeaders = ExtensionHelper.getRelevantColumnHeaders(this.getTable(), oColumn);
		for (var i = 0; i < aHeaders.length; i++) {
			var $Header = jQuery.sap.byId(aHeaders[i]);
			if (!$Header.attr("colspan")) {
				$Header.attr({
					"aria-sort" : mAttributes["aria-sort"] || null
				});
			}
		}
	};

	/*
	 * Is called by the Row whenever the selection state is changed and updates the corresponding
	 * ARIA attributes.
	 * @public (Part of the API for Table control only!)
	 */
	TableAccExtension.prototype.updateAriaStateOfRow = function(oRow, $Ref, bIsSelected) {
		if (!this._accMode) {
			return;
		}

		if (!$Ref) {
			$Ref = oRow.getDomRefs(true);
		}

		if ($Ref.row) {
			$Ref.row.children("td").add($Ref.row).attr("aria-selected", bIsSelected ? "true" : null);
		}
	};

	/*
	 * Updates the expand state and level for accessibility in case of grouping
	 * @public (Part of the API for Table control only!)
	 */
	TableAccExtension.prototype.updateAriaExpandAndLevelState = function(oRow, $ScrollRow, $RowHdr, $FixedRow, $RowAct, bGroup, bExpanded, iLevel, $TreeIcon) {
		if (!this._accMode) {
			return;
		}

		var sTitle = null,
			oTable = this.getTable(),
			aRefs = [$ScrollRow, $ScrollRow.children(), $RowHdr, $FixedRow, $FixedRow ? $FixedRow.children() : null, $RowAct],
			bTreeMode = !!$TreeIcon,
			oBinding = oTable.getBinding("rows");

		if (!bGroup && $RowHdr && !bTreeMode) {
			var iIndex = $RowHdr.attr("data-sap-ui-rowindex");
			var mAttributes = ExtensionHelper.getAriaAttributesFor(this, TableAccExtension.ELEMENTTYPES.ROWHEADER, {rowSelected: !oRow._bHidden && oTable.isIndexSelected(iIndex)});
			sTitle = mAttributes["title"] || null;
		}

		if ($RowHdr && !bTreeMode) {
			$RowHdr.attr({
				"aria-haspopup" : bGroup ? "true" : null,
				"title" : sTitle
			});
		}

		if (oBinding && oBinding.hasTotaledMeasures && iLevel > 0 && (!oBinding.bProvideGrandTotals || !oBinding.hasTotaledMeasures())) {
			// Summary top-level row is not displayed (always has level 0) -> for aria we can shift all the levels 1 step up;
			iLevel = iLevel - 1;
		}

		for (var i = 0; i < aRefs.length; i++) {
			if (aRefs[i]) {
				aRefs[i].attr({
					"aria-expanded" : bGroup ? bExpanded + "" : null,
					"aria-level": iLevel < 0 ? null : (iLevel + 1)
				});
			}
		}

		if (bTreeMode) {
			$TreeIcon.attr(ExtensionHelper.getAriaAttributesFor(this, TableAccExtension.ELEMENTTYPES.TREEICON, {row: oRow}));
		}
	};

	/*
	 * Updates the row highlight state.
	 * @public (Part of the API for Table control only!)
	 */
	TableAccExtension.prototype.updateAriaStateOfRowHighlight = function(oRowSettings) {
		if (!this._accMode || oRowSettings == null) {
			return;
		}

		var oRow = oRowSettings._getRow();
		if (oRow != null) {
			var oHighlightTextElement = oRow.getDomRef("highlighttext");
			oHighlightTextElement.innerText = oRowSettings._getHighlightText();
		}
	};

	/*
	 * Updates the relevant aria-properties in case of overlay or noData is set / reset.
	 * @public (Part of the API for Table control only!)
	 */
	TableAccExtension.prototype.updateAriaStateForOverlayAndNoData = function() {
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

	/*
	 * Retrieve Aria descriptions from resource bundle for a certain selection mode
	 * @param {Boolean} [bConsiderSelectionState] set to true if the current selection state of the table shall be considered
	 * @param {String} [sSelectionMode] optional parameter. If no selection mode is set, the current selection mode of the table is used
	 * @returns {{mouse: {rowSelect: string, rowDeselect: string}, keyboard: {rowSelect: string, rowDeselect: string}}}
	 * @public (Part of the API for Table control only!)
	 */
	TableAccExtension.prototype.getAriaTextsForSelectionMode = function (bConsiderSelectionState, sSelectionMode) {
		var oTable = this.getTable();

		if (!sSelectionMode) {
			sSelectionMode = oTable.getSelectionMode();
		}

		var oResBundle = oTable._oResBundle;
		var bShowTooltips = oTable._getShowStandardTooltips();
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

		var iSelectedIndicesCount = oTable._getSelectedIndicesCount();

		if (sSelectionMode === SelectionMode.Single) {
			mTooltipTexts.mouse.rowSelect = bShowTooltips ? oResBundle.getText("TBL_ROW_SELECT") : "";
			mTooltipTexts.mouse.rowDeselect = bShowTooltips ? oResBundle.getText("TBL_ROW_DESELECT") : "";
			mTooltipTexts.keyboard.rowSelect = oResBundle.getText("TBL_ROW_SELECT_KEY");
			mTooltipTexts.keyboard.rowDeselect = oResBundle.getText("TBL_ROW_DESELECT_KEY");
		} else if (sSelectionMode === SelectionMode.MultiToggle) {
			mTooltipTexts.mouse.rowSelect = bShowTooltips ? oResBundle.getText("TBL_ROW_SELECT_MULTI_TOGGLE") : "";
			// text for de-select is the same like for single selection
			mTooltipTexts.mouse.rowDeselect = bShowTooltips ? oResBundle.getText("TBL_ROW_DESELECT") : "";
			mTooltipTexts.keyboard.rowSelect = oResBundle.getText("TBL_ROW_SELECT_MULTI_TOGGLE_KEY");
			// text for de-select is the same like for single selection
			mTooltipTexts.keyboard.rowDeselect = oResBundle.getText("TBL_ROW_DESELECT_KEY");

			if (bConsiderSelectionState === true && iSelectedIndicesCount === 0) {
				// if there is no row selected yet, the selection is like in single selection case
				mTooltipTexts.mouse.rowSelect = bShowTooltips ? oResBundle.getText("TBL_ROW_SELECT") : "";
				mTooltipTexts.keyboard.rowSelect = oResBundle.getText("TBL_ROW_SELECT_KEY");
			}
		}

		return mTooltipTexts;
	};

	/*
	 * Applies corresponding ARIA properties of the given state to the select all button.
	 * @param {boolean} bSelectAll the select all state which should be applied to the select all button
	 * @public (Part of the API for Table control only!)
	 */
	TableAccExtension.prototype.setSelectAllState = function (bSelectAll) {
		var oTable = this.getTable();
		if (oTable) {
			oTable.$("selall").attr("aria-pressed", bSelectAll ? "true" : "false");
		}
	};

	/*
	 * Adds the column header / label of the given column to the ariaLabelledBy association (if exists)
	 * of the given control.
	 */
	TableAccExtension.prototype.addColumnHeaderLabel = function(oColumn, oControl) {
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
		if (sLabel && jQuery.inArray(sLabel, aLabels) < 0) {
			oControl.addAriaLabelledBy(sLabel);
		}
	};

	return TableAccExtension;

});
