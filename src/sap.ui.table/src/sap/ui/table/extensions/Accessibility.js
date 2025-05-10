/*!
 * ${copyright}
 */

// Provides helper sap.ui.table.extensions.Accessibility.
sap.ui.define([
	"./ExtensionBase",
	"./AccessibilityRender",
	"../utils/TableUtils",
	"../library",
	"sap/ui/core/ControlBehavior",
	"sap/ui/core/Element",
	"sap/ui/thirdparty/jquery"
], function(ExtensionBase, AccRenderExtension, TableUtils, library, ControlBehavior, Element, jQuery) {
	"use strict";

	// shortcuts
	const SelectionMode = library.SelectionMode;
	const CellType = TableUtils.CELLTYPE;

	/*
	 * Provides utility functions to handle acc info objects.
	 * @see sap.ui.core.Control#getAccessibilityInfo
	 */
	const ACCInfoHelper = {

		/*
		 * Returns a flattened acc info object (infos of children are merged together)
		 * Note: The info object does only contain a focusable flag (true if one of the children is focusable)
		 *       and a combined description.
		 * @see sap.ui.core.Control#getAccessibilityInfo
		 */
		getAccInfoOfControl: function(oControl) {
			let oAccInfo = null;

			if (oControl && typeof oControl.getAccessibilityInfo === "function") {
				if (typeof oControl.getVisible === "function" && !oControl.getVisible()) {
					oAccInfo = ACCInfoHelper._normalize({});
				} else {
					const oSource = oControl.getAccessibilityInfo();
					if (oSource) {
						const oTarget = {};
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
			if (iLevel === 0) {
				ACCInfoHelper._normalize(oTargetInfo);
				oTargetInfo._descriptions = [];
			}

			oTargetInfo._descriptions.push(ACCInfoHelper._getFullDescription(oSourceInfo));

			oSourceInfo.children.forEach(function(oChild) {
				if (!oChild.getAccessibilityInfo || (oChild.getVisible && !oChild.getVisible())) {
					return;
				}

				const oChildInfo = oChild.getAccessibilityInfo();
				if (oChildInfo) {
					ACCInfoHelper._flatten(oChildInfo, oTargetInfo, iLevel + 1);
				}
			});

			if (iLevel === 0) {
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
			let sDesc = oInfo.type + " " + oInfo.description;
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

	const addAriaForOverlayOrNoData = function(oTable, mAttributes, bOverlay, bNoData) {
		const bHidden = bOverlay && oTable.getShowOverlay() || bNoData && TableUtils.isNoDataVisible(oTable);
		if (bHidden) {
			mAttributes["aria-hidden"] = "true";
		}

		let sMarker = "";
		if (bOverlay) {
			sMarker = "overlay";
		}
		if (bNoData) {
			sMarker = bOverlay ? sMarker.concat(",", "nodata") : "nodata";
		}
		if (sMarker) {
			mAttributes["data-sap-ui-table-acc-covered"] = sMarker;
		}
	};

	/*
	 * Provides utility functions used by this extension
	 */
	const ExtensionHelper = {

		/**
		 * Returns the index of the column (in the array of visible columns (see Table._getVisibleColumns())) of the current focused cell
		 * In case the focused cell is a row action the given index equals the length of the visible columns.
		 * This function must not be used if the focus is on a row header.
		 * @param {sap.ui.table.extensions.Accessibility} oExtension The accessibility extension
		 * @returns {int} The column index of the focused cell
		 */
		getColumnIndexOfFocusedCell: function(oExtension) {
			const oTable = oExtension.getTable();
			const oInfo = TableUtils.getFocusedItemInfo(oTable);
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
			const oTable = oExtension.getTable();
			const oIN = oTable._getItemNavigation();
			const oTableRef = oTable.getDomRef();

			if (!oExtension.getAccMode() || !oTableRef || !oIN) {
				return null;
			}
			const oCellRef = oIN.getFocusedDomRef();
			if (!oCellRef || oCellRef !== document.activeElement) {
				return null;
			}

			return TableUtils.getCellInfo(oCellRef);
		},

		/*
		 * Returns the IDs of the column headers which are relevant for the given column (esp. in multi header case).
		 */
		getRelevantColumnHeaders: function(oTable, oColumn) {
			const aLabels = [];

			if (!oTable || !oColumn || !oTable.getColumnHeaderVisible()) {
				return aLabels;
			}

			const iHeaderRowCount = TableUtils.getHeaderRowCount(oTable);

			if (iHeaderRowCount > 0) {
				const sColumnId = oColumn.getId();
				aLabels.push(sColumnId);

				for (let i = 1; i < iHeaderRowCount; i++) {
					aLabels.push(sColumnId + "_" + i);
				}

				const aSpans = TableUtils.Column.getParentSpannedColumns(oTable, sColumnId);

				if (aSpans && aSpans.length) {
					for (let j = 0; j < aSpans.length; j++) {
						const iLevel = aSpans[j].level;
						const sParentId = aSpans[j].column.getId();
						aLabels[iLevel] = iLevel === 0 ? sParentId : (sParentId + "_" + iLevel);
					}
				}
			}

			return aLabels;
		},

		/**
		 * Checks whether the given cell is hidden.
		 *
		 * @param {jQuery} $Cell The cell DOM element
		 * @param {sap.ui.table.Column} oCell The control in the cell
		 * @param {sap.ui.table.Row} oRow The row the cell is inside
		 * @returns {boolean} Whether the cell is hidden
		 */
		isHiddenCell: function($Cell, oCell, oRow) {
			const bIsCellHidden = $Cell.hasClass("sapUiTableCellHidden");
			const bGroupCellHiddenByApp = oRow.isGroupHeader() && (oCell?.hasStyleClass?.("sapUiAnalyticalTableGroupCellHidden") ?? false);
			const bSumCellHiddenByApp = oRow.isSummary() && (oCell?.hasStyleClass?.("sapUiAnalyticalTableSumCellHidden") ?? false);

			return oRow.isContentHidden() || bIsCellHidden || bGroupCellHiddenByApp || bSumCellHiddenByApp;
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

			const oLabel = oColumn.getLabel();

			function isTooltipEqualToLabel(sTooltip) {
				if (!sTooltip) {
					return false;
				}
				const sText = oLabel && oLabel.getText ? oLabel.getText() : "";
				return sTooltip === sText;
			}

			let sTooltip = oColumn.getTooltip_AsString();
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
		 * @param {sap.ui.table.Table} oTable The table instance
		 * @returns {{columnCount: int, rowCount: int}} The grid size
		 */
		getGridSize: function(oTable) {
			const bHasRowHeader = TableUtils.hasRowHeader(oTable);
			const bHasRowActions = TableUtils.hasRowActions(oTable);
			const iColumnCount = TableUtils.getVisibleColumnCount(oTable) + (bHasRowHeader ? 1 : 0) + (bHasRowActions ? 1 : 0);
			const iContentRowCount = TableUtils.isNoDataVisible(oTable) ? 0 : Math.max(oTable._getTotalRowCount(), oTable._getRowCounts()._fullsize);

			return {
				columnCount: iColumnCount,
				rowCount: TableUtils.getHeaderRowCount(oTable) + iContentRowCount
			};
		},

		/**
		 * Gets the aria-relevant index of a row, taking into account virtualization and the number of header rows.
		 *
		 * @param {sap.ui.table.Row} oRow The row instance
		 * @returns {int} The row index
		 */
		getRowIndex: function(oRow) {
			return oRow.getIndex() + 1 + TableUtils.getHeaderRowCount(oRow.getTable());
		},

		/**
		 * Determines whether the user navigates to the table initially, changes to another row or column.
		 * @param {sap.ui.table.extensions.Accessibility} oExtension The accessibility extension
		 * @returns {{rowChange: boolean, colChange: boolean, initial: boolean}} An object containing information about the change
		 */
		getRowColChange: function(oExtension) {
			const oTable = oExtension.getTable();
			const oIN = oTable._getItemNavigation();
			let bIsRowChanged = false;
			let bIsColChanged = false;
			let bIsInitial = false;
			const bHasRowHeader = TableUtils.hasRowHeader(oTable);

			if (oIN) {
				// +1 -> we want to announce a count and not the index, the action column is handled like a normal column
				const iColumnNumber = ExtensionHelper.getColumnIndexOfFocusedCell(oExtension) + 1 + (bHasRowHeader ? 1 : 0);
				const oRow = oTable.getRows()[TableUtils.getRowIndexOfFocusedCell(oTable)];
				const iRowNumber = oRow ? ExtensionHelper.getRowIndex(oRow) : 0;

				bIsRowChanged = oExtension._iLastRowNumber !== iRowNumber ||
								(oExtension._iLastRowNumber === iRowNumber && oExtension._iLastColumnNumber === iColumnNumber);
				bIsColChanged = oExtension._iLastColumnNumber !== iColumnNumber;
				bIsInitial = oExtension._iLastRowNumber == null && oExtension._iLastColumnNumber == null;

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
		 * @see ExtensionHelper.getRowColChange
		 * @see ExtensionHelper.storeDefaultsBeforeCellModifications
		 */
		performCellModifications: function(oExtension, $Cell, aDefaultLabels, aDefaultDescriptions, aLabels, aDescriptions, sText, fAdapt) {
			ExtensionHelper.storeDefaultsBeforeCellModifications(oExtension, $Cell, aDefaultLabels, aDefaultDescriptions);
			const oChangeInfo = ExtensionHelper.getRowColChange(oExtension);
			const oTable = oExtension.getTable();
			const sTableId = oTable.getId();
			oTable.$("cellacc").text(sText || "."); //set the custom text to the prepared hidden element

			if (fAdapt) { //Allow to adapt the labels / descriptions based on the changed row / column count
				fAdapt(aLabels, aDescriptions, oChangeInfo.rowChange, oChangeInfo.colChange, oChangeInfo.initial);
			}

			if (oChangeInfo.initial || oChangeInfo.rowChange) {
				if (TableUtils.hasRowNavigationIndicators(oTable)) {
					const oCellInfo = TableUtils.getCellInfo($Cell);
					if (oCellInfo.type !== TableUtils.CELLTYPE.COLUMNHEADER && oCellInfo.type !== TableUtils.CELLTYPE.COLUMNROWHEADER) {
						const oRowSettings = oTable.getRows()[oCellInfo.rowIndex].getAggregation("_settings");
						if (oRowSettings.getNavigated()) {
							aLabels.push(sTableId + "-rownavigatedtext");
						}
					}
				}
			}

			const sLabel = aLabels && aLabels.length ? aLabels.join(" ") : null;

			$Cell.attr({
				"aria-labelledby": sLabel,
				"aria-describedby": aDescriptions && aDescriptions.length ? aDescriptions.join(" ") : null
			});
		},

		/*
		 * Modifies the labels and descriptions of a data cell.
		 * @see ExtensionHelper.performCellModifications
		 */
		modifyAccOfDataCell: function(oCellInfo) {
			const oTable = this.getTable();
			const sTableId = oTable.getId();
			const oIN = oTable._getItemNavigation();

			if (!oIN) {
				return;
			}

			const $Cell = jQuery(oCellInfo.cell);
			const iRow = TableUtils.getRowIndexOfFocusedCell(oTable);
			const iCol = ExtensionHelper.getColumnIndexOfFocusedCell(this); // This is the index in the visible columns	array
			const oTableInstances = TableUtils.getRowColCell(oTable, iRow, iCol, false);
			let oInfo = null;
			const oRow = oTableInstances.row;
			const sRowId = oRow.getId();
			const bHidden = ExtensionHelper.isHiddenCell($Cell, oTableInstances.cell, oRow);
			const bIsTreeColumnCell = ExtensionHelper.isTreeColumnCell(this, $Cell);
			const aDefaultLabels = ExtensionHelper.getAriaAttributesForDataCell(this, {
					index: iCol,
					column: oTableInstances.column,
					fixed: TableUtils.isFixedColumn(oTable, iCol)
				})["aria-labelledby"] || [];
			const aDescriptions = [];
			let aLabels = [];
			const bIsGroupHeader = oRow.isGroupHeader();
			const bIsSummary = oRow.isSummary();

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
			}

			let sText = "";
			if (oInfo) {
				sText = oInfo.description;
				if (TableUtils.getInteractiveElements($Cell) !== null) {
					sText = TableUtils.getResourceText("TBL_CELL_INCLUDES", [sText]);
				}
			}

			if (bIsTreeColumnCell && !bHidden) {
				const oAttributes = ExtensionHelper.getAriaAttributesForTreeIcon(this, {row: oTableInstances.row});
				if (oAttributes && oAttributes["aria-label"]) {
					sText = oAttributes["aria-label"].concat(" ", sText);
				}
			}

			ExtensionHelper.performCellModifications(this, $Cell, aDefaultLabels, null, aLabels, aDescriptions, sText,
				function(aLabels, aDescriptions, bRowChange, bColChange) {
					if (bIsGroupHeader && bRowChange) {
						aLabels.splice(1, 0, sRowId + "-groupHeader");
					}
					const bContainsTreeIcon = $Cell.find(".sapUiTableTreeIcon").not(".sapUiTableTreeIconLeaf").length === 1;

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
		modifyAccOfRowHeader: function(oCellInfo) {
			const oTable = this.getTable();
			const sTableId = oTable.getId();
			const $Cell = jQuery(oCellInfo.cell);
			const oRow = oTable.getRows()[oCellInfo.rowIndex];
			const sRowId = oRow.getId();
			const aDefaultLabels = ExtensionHelper.getAriaAttributesForRowHeader(this)["aria-labelledby"] || [];
			const aLabels = [].concat(aDefaultLabels);

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
		modifyAccOfColumnHeader: function(oCellInfo) {
			const oTable = this.getTable();
			const $Cell = jQuery(oCellInfo.cell);
			const oColumn = Element.getElementById($Cell.attr("data-sap-ui-colid"));
			const oColumnLabel = TableUtils.Column.getHeaderLabel(oColumn);
			const mAttributes = ExtensionHelper.getAriaAttributesForColumnHeader(this, {
					headerId: $Cell.attr("id"),
					column: oColumn,
					index: $Cell.attr("data-sap-ui-colindex")
				});
			const sText = ExtensionHelper.getColumnTooltip(oColumn);
			const aLabels = mAttributes["aria-labelledby"] || [];
			const iSpan = oCellInfo.columnSpan;

			if (oColumnLabel?.getRequired?.()) {
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

			if (aLabels.length > 0) {
				aLabels.unshift($Cell.attr("id") + "-inner");
			}

			ExtensionHelper.performCellModifications(this, $Cell, mAttributes["aria-labelledby"], mAttributes["aria-describedby"],
				aLabels, mAttributes["aria-describedby"], sText
			);
		},

		/*
		 * Modifies the labels and descriptions of the column row header.
		 * @see ExtensionHelper.performCellModifications
		 */
		modifyAccOfColumnRowHeader: function(oCellInfo) {
			const oTable = this.getTable();
			const $Cell = jQuery(oCellInfo.cell);
			const bEnabled = $Cell.hasClass("sapUiTableSelAllVisible");

			const mAttributes = ExtensionHelper.getAriaAttributesForColumnRowHeader(
				this,
				{enabled: bEnabled, checked: bEnabled && !oTable.$().hasClass("sapUiTableSelAll")}
			);
			const aLabels = mAttributes["aria-labelledby"] || [];
			ExtensionHelper.performCellModifications(this, $Cell, [], mAttributes["aria-describedby"],
				aLabels, mAttributes["aria-describedby"], null
			);
		},

		/*
		 * Modifies the labels and descriptions of a row action cell.
		 * @see ExtensionHelper.performCellModifications
		 */
		modifyAccOfRowAction: function(oCellInfo) {
			const oTable = this.getTable();
			const sTableId = oTable.getId();
			const $Cell = jQuery(oCellInfo.cell);
			const oRow = oTable.getRows()[oCellInfo.rowIndex];
			const sRowId = oRow.getId();
			const bHidden = ExtensionHelper.isHiddenCell($Cell, null, oRow);
			const aDefaultLabels = ExtensionHelper.getAriaAttributesForRowAction(this)["aria-labelledby"] || [];
			const aLabels = [].concat(aDefaultLabels);
			const aDescriptions = [];
			const bIsGroupHeader = oRow.isGroupHeader();

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

			let sText = "";
			if (!bHidden) {
				const oRowAction = oRow.getRowAction();
				if (oRowAction) {
					const oInfo = oRowAction.getAccessibilityInfo();
					if (oInfo) {
						aLabels.push(sTableId + "-cellacc");
						sText = oInfo.description;
					}
				}
			}

			ExtensionHelper.performCellModifications(this, $Cell, aDefaultLabels, [], aLabels, aDescriptions, sText,
				function(aLabels, aDescriptions, bRowChange) {
					if (bIsGroupHeader && bRowChange) {
						const iIndex = aLabels.indexOf(sTableId + "-ariarowgrouplabel") + 1;
						aLabels.splice(iIndex, 0, sRowId + "-groupHeader");
					}
				}
			);
		},

		/**
		 * Returns the aria attributes for the tr element that contains the column row header cell.
		 * @returns {object} An object containing the aria attributes
		 */
		getAriaAttributesForColumnRowHeaderRow: function() {
			return {
				"role": "row",
				"aria-hidden": "true"
			};
		},

		/**
		 * Returns the aria attributes for the column row header cell.
		 * @returns {object} An object containing the aria attributes
		 */
		getAriaAttributesForColumnRowHeaderCell: function() {
			return {"role": "columnheader"};
		},

		/**
		 * Returns the aria attributes for the column row header content (select all checkbox/deselect all icon).
		 *
		 * @param {sap.ui.table.extensions.Accessibility} oExtension The accessibility extension
		 * @param {{enabled: boolean, checked: boolean}} mParams Whether the select all checkbox is enabled and checked
		 * @returns {object} An object containing the aria attributes
		 */
		getAriaAttributesForColumnRowHeader: function(oExtension, mParams) {
			const mAttributes = {};
			const oTable = oExtension.getTable();

			const mRenderConfig = oTable._getSelectionPlugin().getRenderConfig();

			if (oTable.getSelectionMode() !== SelectionMode.None) {
				mAttributes["aria-label"] = TableUtils.getResourceText("TBL_TABLE_SELECTION_COLUMNHEADER");
			}

			if (mRenderConfig.headerSelector.visible) {
				if (mRenderConfig.headerSelector.type === "toggle") {
					mAttributes["role"] = ["checkbox"];
					if (mParams && mParams.enabled) {
						mAttributes["aria-checked"] = mParams.checked ? "true" : "false";
					}
				} else if (mRenderConfig.headerSelector.type === "custom") {
					mAttributes["role"] = ["button"];
					if (!mParams || !mParams.enabled) {
						mAttributes["aria-disabled"] = "true";
					}
				}
			}
			return mAttributes;
		},

		/**
		 * Returns the aria attributes for a row addon (header, actions).
		 * @returns {object} An object containing the aria attributes
		 */
		getAriaAttributesForRowAddon: function() {
			return {
				"role": "row",
				"aria-hidden": "true"
			};
		},

		/**
		 * Returns the aria attributes for a row header cell.
		 *
		 * @param {sap.ui.table.extensions.Accessibility} oExtension The accessibility extension
		 * @returns {object} An object containing the aria attributes
		 */
		getAriaAttributesForRowHeader: function(oExtension) {
			const mAttributes = {};
			const oTable = oExtension.getTable();
			const sTableId = oTable.getId();

			mAttributes["role"] = "gridcell";
			mAttributes["aria-colindex"] = 1;
			if (TableUtils.hasRowHeader(oTable) && oTable.getSelectionMode() === SelectionMode.None) {
				mAttributes["aria-labelledby"] = [sTableId + "-rowselecthdr"];
			}
			return mAttributes;
		},

		/**
		 * Returns the aria attributes for a row action cell.
		 *
		 * @param {sap.ui.table.extensions.Accessibility} oExtension The accessibility extension
		 * @returns {object} An object containing the aria attributes
		 */
		getAriaAttributesForRowAction: function(oExtension) {
			const mAttributes = {};
			const oTable = oExtension.getTable();
			const sTableId = oTable.getId();

			mAttributes["role"] = "gridcell";
			mAttributes["aria-colindex"] = TableUtils.getVisibleColumnCount(oTable) + 1 + (TableUtils.hasRowHeader(oTable) ? 1 : 0);
			mAttributes["aria-labelledby"] = [sTableId + "-rowacthdr"];

			return mAttributes;
		},

		/**
		 * Returns the aria attributes for a column header.
		 *
		 * @param {sap.ui.table.extensions.Accessibility} oExtension The accessibility extension
		 * @param {{column: sap.ui.table.Column, headerId: string, index: int, colspan: boolean}} mParams An object containing the instance of the
		 * column, the id of the header cell, the index of the column and whether the column has span
		 * @returns {object} An object containing the aria attributes
		 */
		getAriaAttributesForColumnHeader: function(oExtension, mParams) {
			const mAttributes = {};
			const oTable = oExtension.getTable();
			const sTableId = oTable.getId();

			const oColumn = mParams && mParams.column;
			const bHasColSpan = mParams && mParams.colspan;

			mAttributes["role"] = "columnheader";
			mAttributes["aria-colindex"] = mParams.index + 1 + (TableUtils.hasRowHeader(oTable) ? 1 : 0);

			if (mParams && (mParams.index < oTable.getComputedFixedColumnCount())) {
				mAttributes["aria-labelledby"] = [sTableId + "-ariafixedcolumn"];
			}

			if (!bHasColSpan && oColumn) {
				mAttributes["aria-sort"] = oColumn.getSortOrder().toLowerCase();
				const oColumnHeaderMenu = oColumn.getHeaderMenuInstance();
				if (oColumnHeaderMenu) {
					const sPopupType = oColumnHeaderMenu.getAriaHasPopupType();
					if (sPopupType !== "None") {
						mAttributes["aria-haspopup"] = sPopupType.toLowerCase();
					}
				}
			}
			return mAttributes;
		},

		/**
		 * Returns the aria attributes for a data cell.
		 *
		 * @param {sap.ui.table.extensions.Accessibility} oExtension The accessibility extension
		 * @param {{index: int, column: sap.ui.table.Column, row: sap.ui.table.Row,	fixed: boolean,	rowSelected: boolean}} mParams An object
		 * containing the index of the row, the instance of the column, the instance of the row, whether the column is fixed and whether the row is
		 * selected
		 * @returns {object} An object containing the aria attributes
		 */
		getAriaAttributesForDataCell: function(oExtension, mParams) {
			const mAttributes = {};
			const oTable = oExtension.getTable();
			const sTableId = oTable.getId();

			mAttributes["role"] = "gridcell";
			mAttributes["aria-colindex"] = mParams.index + 1 + (TableUtils.hasRowHeader(oTable) ? 1 : 0);

			if (mParams.column && mParams.fixed) {
				mAttributes["aria-labelledby"] = [sTableId + "-ariafixedcolumn"];
			}
			return mAttributes;
		},

		/**
		 * Returns the aria attributes for the table element that wraps the content.
		 *
		 * @param {sap.ui.table.extensions.Accessibility} oExtension The accessibility extension
		 * @returns {object} An object containing the aria attributes
		 */
		getAriaAttributesForTable: function(oExtension) {
			const mAttributes = {"role": "presentation"};
			const oTable = oExtension.getTable();

			addAriaForOverlayOrNoData(oTable, mAttributes, true, true);
			return mAttributes;
		},

		/**
		 * Returns the aria attributes for the container that wraps the data cells.
		 *
		 * @param {sap.ui.table.extensions.Accessibility} oExtension The accessibility extension
		 * @returns {object} An object containing the aria attributes
		 */
		getAriaAttributesForContent: function(oExtension) {
			const mAttributes = {};
			const oTable = oExtension.getTable();
			const sTableId = oTable.getId();

			mAttributes["role"] = TableUtils.Grouping.isInGroupMode(oTable) || TableUtils.Grouping.isInTreeMode(oTable) ? "treegrid" : "grid";
			mAttributes["aria-describedby"] = [sTableId + "-ariaselection"];
			mAttributes["aria-labelledby"] = [].concat(oTable.getAriaLabelledBy());

			if (oTable.getSelectionMode() === SelectionMode.MultiToggle) {
				mAttributes["aria-multiselectable"] = "true";
			}

			const mRowCounts = oTable._getRowCounts();
			const bHasFixedColumns = TableUtils.hasFixedColumns(oTable);
			const bHasFixedTopRows = mRowCounts.fixedTop > 0;
			const bHasFixedBottomRows = mRowCounts.fixedBottom > 0;
			const bHasRowHeader = TableUtils.hasRowHeader(oTable);
			const bHasRowActions = TableUtils.hasRowActions(oTable);
			const mGridSize = ExtensionHelper.getGridSize(oTable);

			mAttributes["aria-owns"] = [sTableId + "-sapUiTableColHdrCnt", sTableId + "-table"];
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
			return mAttributes;
		},

		/**
		 * Returns the aria attributes for the table header.
		 *
		 * @param {sap.ui.table.extensions.Accessibility} oExtension The accessibility extension
		 * @returns {object} An object containing the aria attributes
		 */
		getAriaAttributesForTableHeader: function(oExtension) {
			const mAttributes = {
				"role": "heading",
				"aria-level": "2" // Level is mandatory for headings with ARIA 1.1 and the default is 2
			};
			const oTable = oExtension.getTable();

			addAriaForOverlayOrNoData(oTable, mAttributes, true, false);
			return mAttributes;
		},

		/**
		 * Returns the aria attributes for the row that contains the column headers.
		 *
		 * @param {sap.ui.table.extensions.Accessibility} oExtension The accessibility extension
		 * @param {object} mParams An object for additional parameters
		 * @param {int} mParams.rowIndex The index of the row
		 * @returns {object} An object containing the aria attributes
		 */
		getAriaAttributesForColumnHeaderRow: function(oExtension, mParams) {
			const mAttributes = {"role": "row"};
			const oTable = oExtension.getTable();
			const sTableId = oTable.getId();

			mAttributes["aria-rowindex"] = mParams.rowIndex + 1;
			mAttributes["aria-owns"] = [];
			if (TableUtils.hasRowHeader(oTable)) {
				mAttributes["aria-owns"].push(sTableId + "-rowcolhdr");
			}

			for (let j = 0; j < TableUtils.getVisibleColumnCount(oTable); j++) {
				mAttributes["aria-owns"].push(oTable._getVisibleColumns()[j].getId());
			}

			if (TableUtils.hasRowActions(oTable)) {
				mAttributes["aria-owns"].push(sTableId + "-rowacthdr");
			}

			addAriaForOverlayOrNoData(oTable, mAttributes, true, false);
			return mAttributes;
		},

		/**
		 * Returns the aria attributes for the creation row.
		 *
		 * @param {sap.ui.table.extensions.Accessibility} oExtension The accessibility extension
		 * @param {{creationRow: sap.ui.table.CreationRow}} mParams An object containing the instance of the creation row
		 * @returns {object} An object containing the aria attributes
		 */
		getAriaAttributesForCreationRow: function(oExtension, mParams) {
			const mAttributes = {};
			const oTable = oExtension.getTable();
			mAttributes["role"] = "form";
			mAttributes["aria-labelledby"] = mParams.creationRow.getId() + "-label";
			addAriaForOverlayOrNoData(oTable, mAttributes, true, false);
			return mAttributes;
		},

		/**
		 * Returns the aria attributes for the container element that contains the row headers.
		 *
		 * @param {sap.ui.table.extensions.Accessibility} oExtension The accessibility extension
		 * @returns {object} An object containing the aria attributes
		 */
		getAriaAttributesForRowHeaderCol: function(oExtension) {
			const mAttributes = {};
			const oTable = oExtension.getTable();
			addAriaForOverlayOrNoData(oTable, mAttributes, true, true);
			return mAttributes;
		},

		/**
		 * Returns the aria attributes for a column header.
		 *
		 * @returns {object} An object containing the aria attributes
		 */
		getAriaAttributesForTh: function() {
			return {
				"role": "presentation",
				"scope": "col",
				"aria-hidden": "true"
			};
		},

		/**
		 * Returns the aria attributes for the scrollable part of a row.
		 *
		 * @param {sap.ui.table.extensions.Accessibility} oExtension The accessibility extension
		 * @param {{index: int, fixedCol: boolean, rowNavigated: boolean}} mParams An object containing the index of the row, whether the row is fixed
		 * and whether the row is navigated
		 * @returns {object} An object containing the aria attributes
		 */
		getAriaAttributesForTr: function(oExtension, mParams) {
			const mAttributes = {};
			const oTable = oExtension.getTable();
			const sTableId = oTable.getId();

			mAttributes["role"] = "row";
			if (mParams.rowNavigated) {
				mAttributes["aria-current"] = true;
			}

			mAttributes["aria-owns"] = [];
			if (TableUtils.hasRowHeader(oTable)) {
				mAttributes["aria-owns"].push(sTableId + "-rowsel" + mParams.index);
			}

			for (let j = 0; j < TableUtils.getVisibleColumnCount(oTable); j++) {
				mAttributes["aria-owns"].push(sTableId + "-rows-row" + mParams.index + "-col" + j);
			}

			if (TableUtils.hasRowActions(oTable)) {
				mAttributes["aria-owns"].push(sTableId + "-rowact" + mParams.index);
			}

			return mAttributes;
		},

		/**
		 * Returns the aria attributes for a tree icon (expand/collapse).
		 *
		 * @param {sap.ui.table.extensions.Accessibility} oExtension The accessibility extension
		 * @param {{oRow: sap.ui.table.Row}} mParams An object containing the instance of the row
		 * @returns {object} An object containing the aria attributes
		 */
		getAriaAttributesForTreeIcon: function(oExtension, mParams) {
			let mAttributes = {};
			const oTable = oExtension.getTable();

			if (TableUtils.Grouping.isInTreeMode(oTable)) {
				mAttributes = {
					"aria-label": "",
					"title": "",
					"role": ""
				};
				if (oTable.getBinding()) {
					if (mParams && mParams.row) {
						if (mParams.row.isExpandable()) {
							const sText = TableUtils.getResourceText("TBL_COLLAPSE_EXPAND");
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
			return mAttributes;
		},

		/**
		 * Returns the aria attributes for the no data container.
		 *
		 * @param {sap.ui.table.extensions.Accessibility} oExtension The accessibility extension
		 * @returns {object} An object containing the aria attributes
		 */
		getAriaAttributesForNoData: function(oExtension) {
			const mAttributes = {};
			const oTable = oExtension.getTable();
			const sTableId = oTable.getId();

			const vNoContentMessage = TableUtils.getNoContentMessage(oTable);
			const aLabels = [];

			mAttributes["role"] = "gridcell";

			if (TableUtils.isA(vNoContentMessage, "sap.ui.core.Control")) {
				if (vNoContentMessage.getAccessibilityReferences instanceof Function) {
					const oAccRef = vNoContentMessage.getAccessibilityReferences();
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
			return mAttributes;
		},

		/**
		 * Returns the aria attributes for the overlay.
		 *
		 * @param {sap.ui.table.extensions.Accessibility} oExtension The accessibility extension
		 * @returns {object} An object containing the aria attributes
		 */
		getAriaAttributesForOverlay: function(oExtension) {
			const mAttributes = {};
			const oTable = oExtension.getTable();
			const sTableId = oTable.getId();

			mAttributes["role"] = "region";
			mAttributes["aria-labelledby"] = [].concat(oTable.getAriaLabelledBy());
			mAttributes["aria-labelledby"].push(sTableId + "-ariainvalid");
			return mAttributes;
		},

		/**
		 * Returns the aria attributes for the table footer.
		 *
		 * @param {sap.ui.table.extensions.Accessibility} oExtension The accessibility extension
		 * @returns {object} An object containing the aria attributes
		 */
		getAriaAttributesForTableFooter: function(oExtension) {
			const mAttributes = {};
			const oTable = oExtension.getTable();

			addAriaForOverlayOrNoData(oTable, mAttributes, true, false);
			return mAttributes;
		},

		/**
		 * Returns the aria attributes for a sub header.
		 *
		 * @param {sap.ui.table.extensions.Accessibility} oExtension The accessibility extension
		 * @returns	{object} An object containing the aria attributes
		 */
		getAriaAttributesForTableSubHeader: function(oExtension) {
			const mAttributes = {};
			const oTable = oExtension.getTable();

			addAriaForOverlayOrNoData(oTable, mAttributes, true, false);
			return mAttributes;
		},

		/**
		 * Returns the aria attributes for the header of the row actions column.
		 *
		 * @param {sap.ui.table.extensions.Accessibility} oExtension The accessibility extension
		 * @returns {object} An object containing the aria attributes
		 */
		getAriaAttributesForRowActionHeader: function(oExtension) {
			const oTable = oExtension.getTable();
			return {
				"role": "columnheader",
				"aria-colindex": TableUtils.getVisibleColumnCount(oTable) + 1 + (TableUtils.hasRowHeader(oTable) ? 1 : 0)
			};
		},

		/**
		 * Returns the aria attributes for a presentational element that needs to be hidden for screen readers.
		 *
		 * @returns {object} An object containing the aria attributes
		 */
		getAriaAttributesForPresentation: function() {
			return {"role": "presentation"};
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
	const AccExtension = ExtensionBase.extend("sap.ui.table.extensions.Accessibility", /** @lends sap.ui.table.extensions.Accessibility.prototype */ {
		/**
		 * @override
		 * @inheritDoc
		 * @returns {string} The name of this extension.
		 */
		_init: function(oTable, sTableType, mSettings) {
			this._accMode = ControlBehavior.isAccessibilityEnabled();
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
			return ExtensionHelper["getAriaAttributesFor" + sType](this, mParams);
		},

		/**
		 * Delegate for the focusin event.
		 *
		 * @private
		 * @param {jQuery.Event} oEvent The event object.
		 */
		onfocusin: function(oEvent) {
			const oTable = this.getTable();
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
			const oTable = this.getTable();
			if (!oTable || oEvent.target.classList.contains("sapUiTableCtrlBefore")) {
				return;
			}

			oTable._mTimeouts._cleanupACCExtension = setTimeout(function() {
				const oTable = this.getTable();
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
	 * @type {{DATACELL: string, COLUMNHEADER: string, ROWHEADER: string, ROWACTION: string, COLUMNROWHEADER: string}|*}
	 * @see sap.ui.table.extensions.AccessibilityRender.writeAriaAttributesFor
	 * @public
	 */
	AccExtension.ELEMENTTYPES = {
		DATACELL: "DataCell",				// Standard data cell (standard, group or sum)
		COLUMNHEADER: "ColumnHeader", 		// Column header
		ROWHEADER: "RowHeader", 			// Row header (standard, group or sum)
		ROWACTION: "RowAction",				// Row action (standard, group or sum)
		COLUMNROWHEADER: "ColumnRowHeader"	// Select all row selector content
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

		const oTable = this.getTable();
		const aRows = oTable.getRows();
		let oRow; let i; let $Ref;

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
		const oTable = this.getTable();
		const $Table = oTable.$("sapUiTableGridCnt");

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

		const oInfo = ExtensionHelper.getInfoOfFocusedCell(this);
		let sCellType;

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
				oInfo.cell.setAttribute("role", "status");
				oInfo.cell.setAttribute("role", "gridcell");
			} else {
				return;
			}
		}

		ExtensionHelper["modifyAccOf" + sCellType].apply(this, [oInfo]);
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

		const $Ref = oRow.getDomRefs(true);
		let sTextKeyboard = "";

		if (!oRow.isEmpty() && !oRow.isGroupHeader() && !oRow.isSummary()) {
			const mKeyboardTexts = this.getKeyboardTexts();
			const bIsSelected = oRow._isSelected();

			if ($Ref.row) {
				$Ref.row.not($Ref.rowHeaderPart).not($Ref.rowActionPart).add(
					$Ref.row.children(".sapUiTableCell")
				).attr("aria-selected", bIsSelected ? "true" : "false");
			}

			sTextKeyboard = bIsSelected ? mKeyboardTexts.rowDeselect : mKeyboardTexts.rowSelect;
		}

		if ($Ref.rowSelectorText) {
			$Ref.rowSelectorText.text(sTextKeyboard);
		}
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

		const oDomRefs = oRow.getDomRefs(true);
		const $TreeIcon = oDomRefs.row.find(".sapUiTableTreeIcon");

		oDomRefs.row.not(oDomRefs.rowHeaderPart).not(oDomRefs.rowActionPart).attr({
			"aria-expanded": oRow.isExpandable() ? oRow.isExpanded() + "" : null,
			"aria-level": oRow.getLevel()
		});

		if ($TreeIcon) {
			$TreeIcon.attr(ExtensionHelper.getAriaAttributesForTreeIcon(this, {row: oRow}));
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

		const oRow = oRowSettings._getRow();
		const oHighlightTextElement = oRow ? oRow.getDomRef("highlighttext") : null;

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

		const oRow = oRowSettings._getRow();
		const bNavigated = oRowSettings.getNavigated();

		oRow.getDomRefs(true).row.attr("aria-current", bNavigated ? true : null);
	};

	/**
	 * Updates the relevant aria-properties in case of overlay or noData is set / reset.
	 *
	 * @public
	 */
	AccExtension.prototype.updateAriaStateForOverlayAndNoData = function() {
		const oTable = this.getTable();

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
	 * Retrieve descriptions for keyboard interactions.
	 *
	 * @returns {{rowSelect: string, rowDeselect: string}} Text descriptions.
	 * @public
	 */
	AccExtension.prototype.getKeyboardTexts = function() {
		const sSelectionMode = this.getTable().getSelectionMode();
		const mTexts = {
			rowSelect: "",
			rowDeselect: ""
		};

		if (sSelectionMode === SelectionMode.None) {
			return mTexts;
		}

		mTexts.rowSelect = TableUtils.getResourceText("TBL_ROW_SELECT_KEY");
		mTexts.rowDeselect = TableUtils.getResourceText("TBL_ROW_DESELECT_KEY");

		return mTexts;
	};

	/**
	 * Applies corresponding ARIA properties of the given state to the select all button.
	 *
	 * @param {boolean} bSelectAll The select all state to be applied to the select all button.
	 * @public
	 */
	AccExtension.prototype.setSelectAllState = function(bSelectAll) {
		const oTable = this.getTable();

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
		const oTable = this.getTable();
		if (!this._accMode || !oControl.getAriaLabelledBy || !oTable) {
			return;
		}

		let sLabel = oTable.getColumnHeaderVisible() ? oColumn.getId() : null;
		if (!sLabel) {
			const oLabel = oColumn.getAggregation("label");
			if (oLabel) {
				sLabel = oLabel.getId();
			}
		}
		const aLabels = oControl.getAriaLabelledBy();
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