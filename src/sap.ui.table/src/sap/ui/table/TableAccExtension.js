/*!
 * ${copyright}
 */

// Provides helper sap.ui.table.TableAccExtension.
sap.ui.define(['jquery.sap.global', 'sap/ui/base/Object', './TableAccRenderExtension', 'sap/ui/core/ValueStateSupport'],
	function(jQuery, BaseObject, TableAccRenderExtension, ValueStateSupport) {
	"use strict";

	var CELLTYPES = {
		DATACELL : "DATACELL", // standard data cell
		GROUPROWCELL : "GROUPROWCELL", // cell in a grouping row
		COLUMNHEADER : "COLUMNHEADER", // column header
		ROWHEADER : "ROWHEADER", // row header
		GROUPROWHEADER : "GROUPROWHEADER", // row header of a grouping row
		COLUMNROWHEADER : "COLUMNROWHEADER" // select all row selector (top left cell)
	};

	var _getInfoOfFocusedCell = function(oExtension) {
		var oTable = oExtension.getTable();
		var oIN = oTable._oItemNavigation;
		var oTableRef = oTable.getDomRef();
		if (!oExtension.getAccMode() || !oTableRef || !oIN) {
			return null;
		}
		var oCellRef = oIN.getFocusedDomRef();
		if (!oCellRef || oCellRef !== document.activeElement) {
			return null;
		}

		if (oCellRef.nodeName.toLowerCase() == "td") {
			var $Cell = jQuery(oCellRef);
			if ($Cell.attr("role") == "gridcell") {
				if ($Cell.parent().hasClass("sapUiTableGroupHeader")) {
					return {type: CELLTYPES.GROUPROWCELL, cell: $Cell};
				}
				return {type: CELLTYPES.DATACELL, cell: $Cell};
			}
		} else {
			var $Cell = jQuery(oCellRef);
			if ($Cell.attr("role") == "columnheader") {
				return {type: CELLTYPES.COLUMNHEADER, cell: $Cell};
			}
			if ($Cell.hasClass("sapUiTableRowHdr")) {
				if ($Cell.hasClass("sapUiTableGroupHeader")) {
					return {type: CELLTYPES.GROUPROWHEADER, cell: $Cell};
				}
				return {type: CELLTYPES.ROWHEADER, cell: $Cell};
			}
			if ($Cell.hasClass("sapUiTableColRowHdr")) {
				return {type: CELLTYPES.COLUMNROWHEADER, cell: $Cell};
			}
		}

		return null;
	};

	//TODO: Maybe spread this over the controls later
	var _getAccessibleInfoOfControl = function(oControl, oBundle) {
		if (!oControl) {
			return null;
		}

		function getEnabledStateText() {
			var bEnabled = oControl.getEnabled ? oControl.getEnabled() : true;
			if (oControl.getEditable) {
				bEnabled = bEnabled && oControl.getEditable();
			}
			return bEnabled ? "" : " " + oBundle.getText("TBL_CTRL_STATE_DISABLED");
		}

		switch (oControl.getMetadata().getName()) {
			case "sap.m.Text":
			case "sap.m.Label":
			case "sap.ui.commons.TextView":
				return {
					editable: false,
					text: oControl.getText()
				};
			case "sap.m.Button":
			case "sap.ui.commons.Button":
				return {
					editable: oControl.getEnabled(),
					text: oBundle.getText("TBL_CTR_TYPE_BUTTON") + " " + (oControl.getText() || oControl.getTooltip_AsString()) + getEnabledStateText()
				};
			case "sap.m.Input":
			case "sap.ui.commons.TextField":
				return {
					editable: oControl.getEnabled() && oControl.getEditable(),
					text: oBundle.getText("TBL_CTR_TYPE_INPUT") + " " + oControl.getValue() + (oControl.getDescription ? oControl.getDescription() || "" : "")
							+ getEnabledStateText()
				};
			case "sap.m.DatePicker":
			case "sap.ui.commons.DatePicker":
				return {
					editable: oControl.getEnabled() && oControl.getEditable(),
					text: oBundle.getText("TBL_CTR_TYPE_DATEINPUT") + " " + oControl.getValue() + getEnabledStateText()
				};
			case "sap.m.RatingIndicator":
				return {
					editable: oControl.getEnabled(),
					text: oBundle.getText("TBL_CTR_TYPE_RATING") + " " + oBundle.getText("TBL_CTRL_STATE_RATING", [oControl.getValue(), oControl.getMaxValue()])
							+ getEnabledStateText()
				};
			case "sap.m.ObjectStatus":
				var sState = oControl.getState() != sap.ui.core.ValueState.None ? ValueStateSupport.getAdditionalText(oControl.getState()) : "";
				return {
					editable: false,
					text: (oControl.getTitle() || "") + " " + (oControl.getText() || "") + " " + sState
				};
			case "sap.ui.unified.Currency":
				return {
					editable: false,
					text: (oControl.getFormattedValue() || "") + " " + (oControl.getCurrency() || "")
				};
			case "sap.m.Link":
			case "sap.ui.commons.Link":
				return {
					editable: oControl.getEnabled(),
					text: oBundle.getText("TBL_CTR_TYPE_LINK") + " " + (oControl.getText() || "") + getEnabledStateText()
				};
			case "sap.ui.core.Icon":
				var oAtts = oControl._getAccessibilityAttributes();
				return {
					editable : oAtts.role === "button",
					text: oBundle.getText(oAtts.role === "button" ? "TBL_CTR_TYPE_BUTTON" : "TBL_CTR_TYPE_IMAGE") + " " + (oAtts.label || ""),
					labelled : oAtts.labelledby || null
				};
			case "sap.m.CheckBox":
			case "sap.ui.commons.CheckBox":
				var bChecked = oControl.getChecked ? oControl.getChecked() : oControl.getSelected();
				return {
					editable : oControl.getEnabled() && oControl.getEditable(),
					text: oBundle.getText("TBL_CTR_TYPE_CHECKBOX") + " " + (oControl.getText() || "")
							+ " " + (bChecked ? oBundle.getText("TBL_CTRL_STATE_CHECKBOX") : "")
				};
			case "sap.m.ProgressIndicator":
				return {
					editable: oControl.getEnabled(),
					text: oBundle.getText("TBL_CTR_TYPE_PROGRESS") + " " + oBundle.getText("TBL_CTRL_STATE_PROGRESS", oControl.getPercentValue())
							+ getEnabledStateText()
				};
			case "sap.m.ComboBox":
			case "sap.ui.commons.ComboBox":
			case "sap.ui.commons.DropdownBox":
				return {
					editable: oControl.getEnabled() && oControl.getEditable(),
					text: oBundle.getText("TBL_CTR_TYPE_COMBO") + " " + oControl.getValue() + getEnabledStateText()
				};
			case "sap.m.Select":
				if (oControl.getType() === "IconOnly") {
					var sTooltip = oControl.getTooltip_AsString();
					if (!sTooltip) {
						var oIconInfo = sap.ui.core.IconPool.getIconInfo(oControl.getIcon());
						sTooltip = oIconInfo && oIconInfo.text ? oIconInfo.text : "";
					}
					return {
						editable: oControl.getEnabled(),
						text: oBundle.getText("TBL_CTR_TYPE_BUTTON") + " " + sTooltip + getEnabledStateText()
					};
				} else {
					return {
						editable: oControl.getEnabled(),
						text: oBundle.getText("TBL_CTR_TYPE_COMBO") + " " + oControl._getSelectedItemText() + getEnabledStateText()
					};
				}
				break;
			case "sap.m.MultiComboBox":
				var aSelectedItems = oControl.getSelectedItems();
				var sText = "";
				if (aSelectedItems) {
					for (var i = 0; i < aSelectedItems.length; i++) {
						var oItem = sap.ui.getCore().byId(aSelectedItems[i]);
						if (oItem) {
							sText = sText + (oItem.getText() || "") + " ";
						}
					}
				}
				return {
					editable: oControl.getEnabled() && oControl.getEditable(),
					text: oBundle.getText("TBL_CTR_TYPE_MULTICOMBO") + " " + sText + getEnabledStateText()
				};
			case "sap.m.MultiInput":
				var aTokens = oControl.getTokens();
				var sText = "";
				if (aTokens) {
					for (var i = 0; i < aTokens.length; i++) {
						var oToken = sap.ui.getCore().byId(aTokens[i]);
						if (oToken) {
							sText = sText + (oToken.getText() || "") + " ";
						}
					}
				}
				return {
					editable: oControl.getEnabled() && oControl.getEditable(),
					text: oBundle.getText("TBL_CTR_TYPE_MULTIINPUT") + " " + sText + getEnabledStateText()
				};
		}
		return null;
	};

	var _updateRowColCount = function(oExtension) {
		var oTable = oExtension.getTable(),
			oIN = oTable._oItemNavigation,
			bIsRowChanged = false,
			bIsColChanged = false,
			bIsInitial = false;

		if (oIN) {
			var $RowNoElem = oTable.$("rownumberofrows");
			var $ColNoElem = oTable.$("colnumberofcols");
			var $RowColNoElem = oTable.$("ariacount");

			var iIndex = oIN.getFocusedIndex();
			var bHasRowHeader = oTable.getSelectionMode() !== sap.ui.table.SelectionMode.None && oTable.getSelectionBehavior() !== sap.ui.table.SelectionBehavior.RowOnly;
			var iColumnNumber = iIndex % oIN.iColumns + (bHasRowHeader ? 0 : 1);
			var iFirstVisibleRow = oTable.getFirstVisibleRow();
			var iTotalRowCount = oTable._getRowCount();
			var iRowIndex = Math.floor(iIndex / oIN.iColumns) + iFirstVisibleRow + 1 - oTable._getHeaderRowCount();

			bIsRowChanged = oExtension._iLastRowNumber != iRowIndex || (oExtension._iLastRowNumber == iRowIndex && oExtension._iLastColumnNumber == iColumnNumber);
			bIsColChanged = oExtension._iLastColumnNumber != iColumnNumber;
			bIsInitial = !oExtension._iLastRowNumber && !oExtension._iLastColumnNumber;

			$RowNoElem.text(bIsRowChanged ? oTable._oResBundle.getText("TBL_ROW_ROWCOUNT", [iRowIndex, Math.max(iTotalRowCount, oTable.getVisibleRowCount())]) : " ");
			$ColNoElem.text(bIsColChanged ? oTable._oResBundle.getText("TBL_COL_COLCOUNT", [iColumnNumber, oTable._getVisibleColumnCount()]) : " ");
			$RowColNoElem.text(bIsInitial ? oTable._oResBundle.getText("TBL_DATA_ROWS_COLS", [Math.max(iTotalRowCount, oTable.getVisibleRowCount()), oTable._getVisibleColumnCount()]) : " ");

			oExtension._iLastRowNumber = iRowIndex;
			oExtension._iLastColumnNumber = iColumnNumber;
		}

		return {
			rowChange: bIsRowChanged,
			colChange: bIsColChanged,
			initial: bIsInitial,
			initialLabels : bIsInitial ? (oTable.getAriaLabelledBy().join(" ") + " " + oTable.getId() + "-ariadesc " + oTable.getId() + "-ariacount") : ""
		};
	};

	var _cleanupLastFocusedCell = function(oExtension) {
		if (oExtension._cleanupInfo) {
			oExtension._cleanupInfo.cell.attr(oExtension._cleanupInfo.attr);
			oExtension._cleanupInfo = null;
		}
	};

	var _updateCell = function(oExtension, $Cell, aDefaultLabels, aDefaultDescriptions, aLabels, aDescriptions, sText, fAdapt) {
		oExtension._cleanupInfo = {
			cell: $Cell,
			attr: {
				"aria-labelledby" : aDefaultLabels && aDefaultLabels.length ? aDefaultLabels.join(" ") : null,
				"aria-describedby" : aDefaultDescriptions && aDefaultDescriptions.length ? aDefaultDescriptions.join(" ") : null
			}
		};

		var oCountChangeInfo = _updateRowColCount(oExtension);
		oExtension.getTable().$("cellacc").text(sText || " ");

		if (fAdapt) {
			fAdapt(oExtension, $Cell, oCountChangeInfo, aLabels, aDescriptions);
		}

		var sLabel = oCountChangeInfo.initialLabels ? oCountChangeInfo.initialLabels + " " : "";
		if (aLabels && aLabels.length) {
			sLabel = sLabel + aLabels.join(" ");
		}

		$Cell.attr({
			"aria-labelledby" : sLabel ? sLabel : null,
			"aria-describedby" : aDescriptions && aDescriptions.length ? aDescriptions.join(" ") : null
		});
	};


	//********************************************************************

	/**
	 * Extension for sap.ui.table.Table which handles ACC related things.
	 *
	 * @class Extension for sap.ui.zable.Table which handles ACC related things.
	 *
	 * @extends sap.ui.base.Object
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @alias sap.ui.table.TableAccExtension
	 */
	var TableAccExtension = BaseObject.extend("sap.ui.table.TableAccExtension", /* @lends sap.ui.table.TableAccExtension */ {
		constructor : function(oTable) {
			BaseObject.call(this);
			this._table = oTable;
			this._accMode = sap.ui.getCore().getConfiguration().getAccessibility();

			var that = this;

			this._table.addEventDelegate({
				onfocusin : function(oEvent) {
					if (that._table._mTimeouts._cleanupACCExtension) {
						jQuery.sap.clearDelayedCall(that._table._mTimeouts._cleanupACCExtension);
						that._table._mTimeouts._cleanupACCExtension = null;
					}
					that.updateAccForCurrentCell(true);
				},
				onfocusout: function(oEvent) {
					that._table._mTimeouts._cleanupACCExtension = jQuery.sap.delayedCall(100, that, function(){
						this._iLastRowNumber = null;
						this._iLastColumnNumber = null;
						_cleanupLastFocusedCell(this);
						this._table._mTimeouts._cleanupACCExtension = null;
					});
				}
			});
		}
	});

	TableAccExtension.CELLTYPES = CELLTYPES;
	TableAccRenderExtension.CELLTYPES = CELLTYPES;

	/**
	 * @see sap.ui.base.Object#destroy
	 */
	TableAccExtension.prototype.destroy = function() {
		this._table = null;
		this._readonly = false;
		this._treeMode = false;
		BaseObject.prototype.destroy.apply(this, arguments);
	};

	/**
	 * @see sap.ui.base.Object#getInterface
	 */
	TableAccExtension.prototype.getInterface = function() {
		return this;
	};

	TableAccExtension.prototype.setReadOnly = function(bReadOnly) {
		this._readonly = !!bReadOnly;
	};

	TableAccExtension.prototype.setTreeMode = function(bTreeMode) {
		this._treeMode = !!bTreeMode;
	};

	TableAccExtension.prototype.getAccMode = function() {
		return this._accMode;
	};

	TableAccExtension.prototype.getTable = function() {
		return this._table;
	};

	TableAccExtension.prototype.getAccRenderExtension = function() {
		return TableAccRenderExtension;
	};

	TableAccExtension.prototype.updateAriaStateOfColumn = function(oColumn) {
		if (!this._accMode) {
			return;
		}

		var mAttributes = this._getAriaAttributesFor(this.getTable(), "COLUMNHEADER", {
			headerId: oColumn.getId(),
			column: oColumn,
			index: this.getTable().indexOfColumn(oColumn)
		});

		oColumn.$().attr({
			"aria-sort" : mAttributes["aria-sort"] || null,
			"aria-labelledby" : mAttributes["aria-labelledby"] || null
		});
	};

	TableAccExtension.prototype.updateAccForCurrentCell = function(bOnCellFocus) {
		if (!this._accMode) {
			return;
		}
		if (bOnCellFocus) {
			_cleanupLastFocusedCell(this);
		}
		var oInfo = _getInfoOfFocusedCell(this);
		if (!oInfo || !oInfo.cell || !oInfo.type || !this["_updateAccFor" + oInfo.type]) {
			return;
		}
		//Not yet handled: GROUPROWHEADER
		this["_updateAccFor" + oInfo.type](oInfo.cell, bOnCellFocus);
	};

	/**
	 * Retrieve Aria descriptions from resource bundle for a certain selection mode
	 * @param {Boolean} [bConsiderSelectionState] set to true if the current selection state of the table shall be considered
	 * @param {String} [sSelectionMode] optional parameter. If no selection mode is set, the current selection mode of the table is used
	 * @returns {{mouse: {rowSelect: string, rowDeselect: string}, keyboard: {rowSelect: string, rowDeselect: string}}}
	 * @private
	 */
	TableAccExtension.prototype.getAriaTextsForSelectionMode = function (bConsiderSelectionState, sSelectionMode) {
		var oTable = this.getTable();

		if (!sSelectionMode) {
			sSelectionMode = oTable.getSelectionMode();
		}

		var oResBundle = oTable._oResBundle;
		var mTooltipTexts = {
			mouse: {
				rowSelect: "",
				rowDeselect: ""
			},
			keyboard: {
				rowSelect: "",
				rowDeselect: ""
			}};

		if (sSelectionMode === sap.ui.table.SelectionMode.Single) {
			mTooltipTexts.mouse.rowSelect = oResBundle.getText("TBL_ROW_SELECT");
			mTooltipTexts.mouse.rowDeselect = oResBundle.getText("TBL_ROW_DESELECT");
			mTooltipTexts.keyboard.rowSelect = oResBundle.getText("TBL_ROW_SELECT_KEY");
			mTooltipTexts.keyboard.rowDeselect = oResBundle.getText("TBL_ROW_DESELECT_KEY");
		} else if (sSelectionMode === sap.ui.table.SelectionMode.Multi) {
			mTooltipTexts.mouse.rowSelect = oResBundle.getText("TBL_ROW_SELECT_MULTI");
			mTooltipTexts.mouse.rowDeselect = oResBundle.getText("TBL_ROW_DESELECT_MULTI");
			mTooltipTexts.keyboard.rowSelect = oResBundle.getText("TBL_ROW_SELECT_MULTI_KEY");
			mTooltipTexts.keyboard.rowDeselect = oResBundle.getText("TBL_ROW_DESELECT_MULTI_KEY");

			if (bConsiderSelectionState === true) {
				if (oTable.getSelectedIndices().length === 1) {
					// in multi selection case, if there is only one row selected it's not required
					// to press CTRL in order to only deselect this single row hence use the description text
					// of the single de-selection.
					// for selection it's different since the description for SHIFT/CTRL handling is required
					mTooltipTexts.mouse.rowDeselect = oResBundle.getText("TBL_ROW_DESELECT");
					mTooltipTexts.keyboard.rowDeselect = oResBundle.getText("TBL_ROW_DESELECT_KEY");
				} else if (oTable.getSelectedIndices().length === 0) {
					// if there are no rows selected in multi selection mode, it's not required to press CTRL or SHIFT
					// in order to enhance the selection.
					mTooltipTexts.mouse.rowSelect = oResBundle.getText("TBL_ROW_SELECT");
					mTooltipTexts.keyboard.rowSelect = oResBundle.getText("TBL_ROW_SELECT_KEY");
				}
			}

		} else if (sSelectionMode === sap.ui.table.SelectionMode.MultiToggle) {
			mTooltipTexts.mouse.rowSelect = oResBundle.getText("TBL_ROW_SELECT_MULTI_TOGGLE");
			// text for de-select is the same like for single selection
			mTooltipTexts.mouse.rowDeselect = oResBundle.getText("TBL_ROW_DESELECT");
			mTooltipTexts.keyboard.rowSelect = oResBundle.getText("TBL_ROW_SELECT_MULTI_TOGGLE_KEY");
			// text for de-select is the same like for single selection
			mTooltipTexts.keyboard.rowDeselect = oResBundle.getText("TBL_ROW_DESELECT_KEY");

			if (bConsiderSelectionState === true && oTable.getSelectedIndices().length === 0) {
				// if there is no row selected yet, the selection is like in single selection case
				mTooltipTexts.mouse.rowSelect = oResBundle.getText("TBL_ROW_SELECT");
				mTooltipTexts.keyboard.rowSelect = oResBundle.getText("TBL_ROW_SELECT_KEY");
			}
		}

		return mTooltipTexts;
	};

	//*****************************************************************************************

	TableAccExtension.prototype._getAriaAttributesFor = function(oTable, sType, mParams) {
		var mAttributes = {},
			sTableId = oTable.getId();

		switch (sType) {
			case CELLTYPES.COLUMNROWHEADER:
				mAttributes["aria-labelledby"] = [sTableId + "-ariacolrowheaderlabel"];
				if (mParams && mParams.enabled) {
					mAttributes["aria-labelledby"].push(sTableId + "-ariaselectall");
				}
				break;
			case CELLTYPES.ROWHEADER:
				mAttributes["aria-labelledby"] = [sTableId + "-ariarowheaderlabel"];
				if (oTable.getSelectionMode() !== sap.ui.table.SelectionMode.None) {
					var bSelected = mParams && mParams.rowSelected;
					mAttributes["aria-selected"] = "" + bSelected;
					var mTooltipTexts = this.getAriaTextsForSelectionMode(true);
					mAttributes["title"] = mTooltipTexts.mouse[bSelected ? "rowDeselect" : "rowSelect"];
				}
				break;
			case CELLTYPES.COLUMNHEADER:
				var oColumn = mParams && mParams.column;
				var bIsMainHeader = oColumn && oColumn.getId() === mParams.headerId;
				mAttributes["role"] = "columnheader";
				mAttributes["aria-labelledby"] = mParams && mParams.headerId ?  [mParams.headerId] : [];
				if (oColumn && oColumn._menuHasItems()) {
					mAttributes["aria-haspopup"] = "true";
					mAttributes["aria-describedby"] = [sTableId + "-ariacolmenu"];
				}
				if (mParams && (mParams.index < oTable.getFixedColumnCount())) {
					mAttributes["aria-labelledby"].push(sTableId + "-ariafixedcolumn");
				}
				if (bIsMainHeader && oColumn.getSorted()) {
					mAttributes["aria-sort"] = oColumn.getSortOrder() === "Ascending" ? "ascending" : "descending";
					mAttributes["aria-labelledby"].push(sTableId + (oColumn.getSortOrder() === "Ascending" ? "-ariacolsortedasc" : "-ariacolsorteddes"));
				}
				if (bIsMainHeader && oColumn.getFiltered()) {
					mAttributes["aria-labelledby"].push(sTableId + "-ariacolfiltered");
				}
				break;
			case "ROOT": //The tables root dom element
				//TBD: Taken directly from TableRenderer, Clarify whether all this is really necessary on the root element
				mAttributes["aria-readonly"] = "true";
				if (oTable.getSelectionMode() === sap.ui.table.SelectionMode.Multi) {
					mAttributes["aria-multiselectable"] = "true";
				}
				mAttributes["aria-labelledby"] = [].concat(oTable.getAriaLabelledBy());
				if (oTable.getTitle()) {
					mAttributes["aria-labelledby"].push(oTable.getTitle().getId());
				}
				mAttributes["aria-labelledby"] = [].concat(oTable.getAriaLabelledBy());
				var aAriaOwns = [];
				if (oTable.getToolbar()) {
					aAriaOwns.push(oTable.getToolbar().getId());
				}
				aAriaOwns.push(oTable.getId() + "-table");
				mAttributes["aria-owns"] = aAriaOwns;
				break;
			case "TABLE": //The "real" table element(s)
				mAttributes["role"] = this._treeMode ? "treegrid" : "grid";
				break;
			case "TH": //The "technical" column headers
				mAttributes["role"] = "columnheader";
				mAttributes["scope"] = "col";
				if (mParams && mParams.column) {
					mAttributes["aria-owns"] = mParams.column.getId();
					mAttributes["aria-labelledby"] = mParams.column.getId();
				}
				break;
			case "ROWHEADER_TD": //The "technical" row headers
				mAttributes["role"] = "rowheader";
				mAttributes["headers"] = oTable.getId() + "-colsel";
				if (mParams && typeof mParams.index === "number") {
					mAttributes["aria-owns"] = oTable.getId() + "-rowsel" + mParams.index;
				}
				if (oTable.getSelectionMode() !== sap.ui.table.SelectionMode.None) {
					var bSelected = mParams && mParams.rowSelected;
					mAttributes["aria-selected"] = "" + bSelected;
				}
				break;
			case "TR": //The rows
				mAttributes["role"] = "row";
				var bSelected = false;
				if (mParams && typeof mParams.index === "number" && oTable.getSelectionMode() !== sap.ui.table.SelectionMode.None && oTable.isIndexSelected(mParams.index)) {
					mAttributes["aria-selected"] = "true";
					bSelected = true;
				}
				if (oTable._getSelectOnCellsAllowed()) {
					var mTooltipTexts = this.getAriaTextsForSelectionMode(true);
					mAttributes["title"] = mTooltipTexts.mouse[bSelected ? "rowDeselect" : "rowSelect"];
				}
				break;
		}

		return mAttributes;
	};

	TableAccExtension.prototype._updateAccForDATACELL = function($Cell, bOnCellFocus) {
		var oTable = this.getTable(),
			oIN = oTable._oItemNavigation;

		if (!oIN) {
			return;
		}

		var bHasRowHeader = oTable.getSelectionMode() !== sap.ui.table.SelectionMode.None && oTable.getSelectionBehavior() !== sap.ui.table.SelectionBehavior.RowOnly,
			iRow = Math.floor(oIN.iFocusedIndex / oIN.iColumns) - oTable._getHeaderRowCount(),
			iCol = (oIN.iFocusedIndex % oIN.iColumns) - (bHasRowHeader ? 1 : 0),
			oRow = oTable.getRows()[iRow],
			oColumn = oTable._getVisibleColumns()[iCol],
			oCell = oRow && oRow.getCells()[iCol],
			oInfo = null,
			bHidden = $Cell.parent().hasClass("sapUiTableRowHidden"),
			bIsTreeColumnCell = this._treeMode && oTable._getTreeIconAttributes && $Cell.hasClass("sapUiTableTdFirst"), //TreeTable
			aDefaultLabels = this.getAccRenderExtension().getCellLabels(oTable, oColumn, iCol < oTable.getFixedColumnCount(), false) || [],
			aDescriptions = [],
			aLabels = [oTable.getId() + "-rownumberofrows", oTable.getId() + "-colnumberofcols"].concat(aDefaultLabels);

		//TBD: Clarify why this is needed!
		if (oCell.data("sap-ui-colid") != oColumn.getId()) {
			var aCells = oRow.getCells();
			for (var i = 0; i < aCells.length; i++) {
				if (aCells[i].data("sap-ui-colid") === oColumn.getId()) {
					oCell = aCells[i];
					break;
				}
			}
		}

		if (!bHidden) {
			oInfo = _getAccessibleInfoOfControl(oCell, oTable._oResBundle);
			aLabels.push(oInfo ? (oTable.getId() + "-cellacc") : oCell.getId());

			if (oInfo && oInfo.labelled) {
				aLabels.push(oInfo.labelled);
			}
			if (oInfo && oInfo.described) {
				aDescriptions.push(oInfo.described);
			}
			if (((!oInfo || oInfo.editable) && !this._readonly) || bIsTreeColumnCell) {
				aDescriptions.push(oTable.getId() + "-toggleedit");
			}
		}

		var sText = oInfo ? oInfo.text : " ";
		if (bIsTreeColumnCell && !bHidden) {
			var oAttributes = oTable._getTreeIconAttributes(oRow);
			if (oAttributes && oAttributes["aria-label"]) {
				sText = oAttributes["aria-label"] + " " + sText;
			}
		}

		_updateCell(this, $Cell, aDefaultLabels, null, aLabels, aDescriptions, sText, function(oExtension, $Cell, oCountChangeInfo, aLabels, aDescriptions) {
			if (!bHidden && oTable._getSelectOnCellsAllowed() && oCountChangeInfo.rowChange) {
				aDescriptions.push(oRow.getId() + "-rowselecttext");
			}
		});
	};

	TableAccExtension.prototype._updateAccForROWHEADER = function($Cell, bOnCellFocus) {
		var oTable = this.getTable(),
			aDefaultLabels = this._getAriaAttributesFor(this.getTable(), "ROWHEADER")["aria-labelledby"] || [],
			aLabels = aDefaultLabels.concat([oTable.getId() + "-rownumberofrows"]);

		if (!$Cell.hasClass("sapUiTableRowHidden")) {
			var oRow = oTable.getRows()[$Cell.attr("data-sap-ui-rowindex")];
			aLabels.push(oRow.getId() + "-rowselecttext");
		}

		if ($Cell.attr("aria-selected") == "true") {
			aLabels.push(oTable.getId() + "-ariarowselected");
		}

		_updateCell(this, $Cell, aDefaultLabels, null, aLabels, null, null);
	};

	TableAccExtension.prototype._updateAccForCOLUMNHEADER = function($Cell, bOnCellFocus) {
		var oTable = this.getTable(),
			mAttributes = this._getAriaAttributesFor(oTable, "COLUMNHEADER", {
				headerId: $Cell.attr("id"),
				column: sap.ui.getCore().byId($Cell.attr("data-sap-ui-colid")),
				index: $Cell.attr("data-sap-ui-colindex")
			}),
			aLabels = [oTable.getId() + "-colnumberofcols"].concat(mAttributes["aria-labelledby"]);

		//TBD: Improve handling for multiple headers
		_updateCell(this, $Cell, mAttributes["aria-labelledby"], mAttributes["aria-describedby"], aLabels, mAttributes["aria-describedby"], null);
	};

	TableAccExtension.prototype._updateAccForCOLUMNROWHEADER = function($Cell, bOnCellFocus) {
		var mAttributes = this._getAriaAttributesFor(this.getTable(), "COLUMNROWHEADER", {enabled: $Cell.hasClass("sapUiTableSelAllEnabled")});
		_updateCell(this, $Cell, mAttributes["aria-labelledby"], mAttributes["aria-describedby"], mAttributes["aria-labelledby"], mAttributes["aria-describedby"], null);
	};

/*	TableAccExtension.prototype._updateAccForGROUPROWCELL = function($Cell, bOnCellFocus) {
		var sId = $Cell.attr("id"),
			oTable = this.getTable();

		var aMatches = /.*-row(\d*)-col(\d*)/i.exec(sId);
		if (aMatches) {
			var iRow = aMatches[1];
			var iCol = aMatches[2];
			var oRow = oTable.getRows()[iRow];
			var oCell = oRow && oRow.getCells()[iCol];
			var oColumn = oTable._getVisibleColumns()[iCol];
			var oInfo = _getAccessibleInfoOfControl(oCell);
			var sRowHeaderId = oTable.getId() + "-rows-row" + iRow + "-groupHeader";
			var sSumId = oTable.getId() + "-rows-row" + iRow + "-col" + iCol + "-ariaTextForSum";
			var sLabelId = jQuery.sap.domById(sSumId) ? sSumId : sRowHeaderId;
			var sCellLabels = this.getAccRenderExtension().getCellLabels(oTable, oColumn, iCol < oTable.getFixedColumnCount(), true) || "";

			this._cleanupInfo = {
				cell: $Cell,
				attr: {
					"aria-labelledby" : sCellLabels || "",
					"aria-describedby" : ""
				}
			};

			$Cell.attr("aria-labelledby", sCellLabels + " " + sLabelId + " " + oTable.getId() + "-cellacc" + (oInfo && oInfo.labelled ? " " + oInfo.labelled : ""));
			$Cell.attr("aria-describedby", oInfo && oInfo.described ? " " + oInfo.described : "");

			_updateCellAccText(this, oTable._oResBundle.getText("TBL_ROW_GROUP_LABEL") + " " + (oInfo ? oInfo.text : " "));
			_updateRowColCount(this);
		}
	};*/

	return TableAccExtension;

}, /* bExport= */ true);