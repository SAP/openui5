/*!
 * ${copyright}
 */

// Provides helper sap.ui.table.TableAccExtension.
sap.ui.define(['jquery.sap.global', 'sap/ui/base/Object', './TableAccRenderExtension', 'sap/ui/core/ValueStateSupport'],
	function(jQuery, BaseObject, TableAccRenderExtension, ValueStateSupport) {
	"use strict";


	var _getInfoOfFocusedCell = function(oTable) {
		var oIN = oTable._oItemNavigation;
		var oTableRef = oTable.getDomRef();
		if (!oTable._bAccMode || !oTableRef || !oIN) {
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
					return {type: "GROUPROWCELL", cell: $Cell};
				}
				return {type: "DATACELL", cell: $Cell};
			}
		} else {
			var $Cell = jQuery(oCellRef);
			if ($Cell.attr("role") == "columnheader") {
				return {type: "COLUMNHEADER", cell: $Cell};
			}
			if ($Cell.hasClass("sapUiTableRowHdr")) {
				if ($Cell.hasClass("sapUiTableGroupHeader")) {
					return {type: "GROUPROWHEADER", cell: $Cell};
				}
				return {type: "ROWHEADER", cell: $Cell};
			}
			if ($Cell.hasClass("sapUiTableColRowHdr")) {
				return {type: "COLUMNROWHEADER", cell: $Cell};
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
			var iColumnNumber = iIndex % oIN.iColumns;
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
			initialLabels : bIsInitial ? (oTable.getAriaLabelledBy().join(" ") + " " + oTable.getId() + "-ariadesc " + oTable.getId() + "-ariacount ") : ""
		};
	};

	var _updateCellAccText = function(oExtension, sText) {
		var oCellAccElem = document.getElementById(oExtension.getTable().getId() + "-cellacc");
		if (oCellAccElem) {
			jQuery(oCellAccElem).text(sText);
		}
	};

	var _cleanupLastFocusedCell = function(oExtension) {
		if (oExtension._cleanupInfo) {
			oExtension._cleanupInfo.cell.attr(oExtension._cleanupInfo.attr);
			oExtension._cleanupInfo = null;
		}
	};


	//********************************************************************

	/**
	 * Extension for sap.ui.zable.Table which handles ACC related things.
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

	TableAccExtension.prototype.getTableAccRole = function() {
		return this._treeMode ? "treegrid" : "grid";
	};

	TableAccExtension.prototype.getTable = function() {
		return this._table;
	};

	TableAccExtension.prototype.getAccRenderExtension = function() {
		return TableAccRenderExtension;
	};

	TableAccExtension.prototype.updateAccForCurrentCell = function(bOnCellFocus) {
		if (!this._accMode) {
			return;
		}
		if (bOnCellFocus) {
			_cleanupLastFocusedCell(this);
		}
		var oInfo = _getInfoOfFocusedCell(this._table);
		if (!oInfo || !oInfo.cell || !oInfo.type || !this["_updateAccFor" + oInfo.type]) {
			return;
		}
		//DATACELL, ROWHEADER, GROUPROWCELL / Not yet handled: GROUPROWHEADER
		this["_updateAccFor" + oInfo.type](oInfo.cell, bOnCellFocus);
	};

	TableAccExtension.prototype._updateAccForDATACELL = function($Cell, bOnCellFocus) {
		var sId = $Cell.attr("id"),
			oTable = this.getTable();

		var aMatches = /.*-row(\d*)-col(\d*)/i.exec(sId);
		if (aMatches) {
			var iRow = aMatches[1];
			var iCol = aMatches[2];
			var oRow = oTable.getRows()[iRow];
			var oCell = oRow && oRow.getCells()[iCol];
			var oColumn = oTable._getVisibleColumns()[iCol];
			var bHidden = $Cell.parent().hasClass("sapUiTableRowHidden");
			var oInfo = bHidden ? null : _getAccessibleInfoOfControl(oCell, oTable._oResBundle);
			var bIsTreeColumnCell = this._treeMode && oTable._getTreeIconAttributes && $Cell.hasClass("sapUiTableTdFirst"); //TreeTable
			var sCellLabels = this.getAccRenderExtension().getCellLabels(oTable, oColumn, iCol < oTable.getFixedColumnCount(), true) || "";
			var sCellDescription = "";
			if (!bHidden) {
				sCellDescription = oInfo ? (oTable.getId() + "-cellacc") : oCell.getId();
			}

			var oCountChangeInfo = _updateRowColCount(this);

			this._cleanupInfo = {
				cell: $Cell,
				attr: {
					"aria-labelledby" : sCellLabels,
					"aria-describedby" : ""
				}
			};

			$Cell.attr("aria-labelledby", oCountChangeInfo.initialLabels + oTable.getId() + "-rownumberofrows " + oTable.getId() + "-colnumberofcols " + sCellLabels +
											" " + sCellDescription + " " + (oInfo && oInfo.labelled ? " " + oInfo.labelled : ""));
			if (bHidden) {
				$Cell.attr("aria-describedby", "");
			} else {
				$Cell.attr("aria-describedby", (oInfo && oInfo.described ? oInfo.described + " " : "") +
							((((!oInfo || oInfo.editable) && !this._readonly) || bIsTreeColumnCell) ? (oTable.getId() + "-toggleedit ") : "") +
							(oTable._getSelectOnCellsAllowed() && oCountChangeInfo.rowChange ? (oRow.getId() + "-rowselecttext") : ""));
			}

			var sTreeText = "";
			if (bIsTreeColumnCell && !bHidden) {
				var oAttributes = oTable._getTreeIconAttributes(oRow);
				if (oAttributes && oAttributes["aria-label"]) {
					sTreeText = oAttributes["aria-label"];
				}
			}

			_updateCellAccText(this, sTreeText + " " + (oInfo ? oInfo.text : " "));
		}
	};

	TableAccExtension.prototype._updateAccForROWHEADER = function($Cell, bOnCellFocus) {
		var oTable = this.getTable();
		var oRow = oTable.getRows()[$Cell.attr("data-sap-ui-rowindex")];
		var bHidden = $Cell.hasClass("sapUiTableRowHidden");

		this._cleanupInfo = {
			cell: $Cell,
			attr: {
				"aria-labelledby" : ""
			}
		};

		var oCountChangeInfo = _updateRowColCount(this);

		$Cell.attr("aria-labelledby", oCountChangeInfo.initialLabels + oTable.getId() + "-cellacc " + oTable.getId() + "-rownumberofrows " + (bHidden ? "" : oRow.getId() + "-rowselecttext"));
		_updateCellAccText(this, oTable._oResBundle.getText("TBL_ROW_HEADER_LABEL"));
	};

	TableAccExtension.prototype._updateAccForCOLUMNHEADER = function($Cell, bOnCellFocus) {
		var oTable = this.getTable(),
			iCol = $Cell.attr("data-sap-ui-colindex"),
			bFixed = iCol < oTable.getFixedColumnCount();

		this._cleanupInfo = {
			cell: $Cell,
			attr: {
				//TBD: cleanup and align TableRenderer.getAriaAttributesForCol
				"aria-labelledby" : bFixed ? ($Cell.attr("id") + " " + oTable.getId() + "-ariafixedcolumn") : ""
			}
		};

		var oCountChangeInfo = _updateRowColCount(this);

		$Cell.attr("aria-labelledby", oCountChangeInfo.initialLabels + oTable.getId() + "-colnumberofcols " + $Cell.attr("id") +
					" " + (bFixed ? oTable.getId() + "-ariafixedcolumn" : ""));
		_updateCellAccText(this, " ");
		//TBD: Improve handling for multiple handling, discuss announcements for menu, sorting state and filter
	};

	TableAccExtension.prototype._updateAccForCOLUMNROWHEADER = function($Cell, bOnCellFocus) {
		var oTable = this.getTable(),
			bEnabled = $Cell.hasClass("sapUiTableSelAllEnabled");

		this._cleanupInfo = {
			cell: $Cell,
			attr: {
				"aria-labelledby" : ""
			}
		};

		var oCountChangeInfo = _updateRowColCount(this);

		$Cell.attr("aria-labelledby", oCountChangeInfo.initialLabels + oTable.getId() + "-cellacc " + (bEnabled ? oTable.getId() + "-ariaselectall" : ""));
		_updateCellAccText(this, oTable._oResBundle.getText("TBL_ROW_COL_HEADER_LABEL"));
	};

	TableAccExtension.prototype._updateAccForGROUPROWCELL = function($Cell, bOnCellFocus) {
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
	};

	return TableAccExtension;

}, /* bExport= */ true);