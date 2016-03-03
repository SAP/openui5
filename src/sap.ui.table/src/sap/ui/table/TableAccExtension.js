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

	var _getAccessibleInfoOfControl = function(oControl, oBundle) {
		if (!oControl) {
			return null;
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
					text: oBundle.getText("TBL_CTR_TYPE_BUTTON") + " " + (oControl.getText() || oControl.getTooltipAsString()) +
							" " + (!oControl.getEnabled() ? oBundle.getText("TBL_CTRL_STATE_DISABLED") : "")
				};
			case "sap.m.Input":
			case "sap.ui.commons.TextField":
				return {
					editable: oControl.getEnabled() && oControl.getEditable(),
					text: oBundle.getText("TBL_CTR_TYPE_INPUT") + " " + oControl.getValue() + (oControl.getDescription ? oControl.getDescription() || "" : "") +
							" " + (!(oControl.getEnabled() && oControl.getEditable()) ? oBundle.getText("TBL_CTRL_STATE_DISABLED") : "")
				};
			case "sap.m.RatingIndicator":
				return {
					editable: oControl.getEnabled(),
					text: oBundle.getText("TBL_CTR_TYPE_RATING") + " " + oBundle.getText("TBL_CTRL_STATE_RATING", [oControl.getValue(), oControl.getMaxValue()]) +
							" " + (!oControl.getEnabled() ? oBundle.getText("TBL_CTRL_STATE_DISABLED") : "")
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
			//TBD: Do this for all supported table cell controls:
			//Icon
			//DatePicker
			//Select
			//ComboBox
			//MultiComboBox
			//CheckBox
			//Link
			//ProgressBar
		}
		return null;
	};

	var _updateRowCount = function(oExtension) {
		var oTable = oExtension.getTable(),
			oIN = oTable._oItemNavigation,
			bIsRowChanged = false;

		if (oIN) {
			var oRowNoElem = document.getElementById(oTable.getId() + "-rownumberofrows");

			var iIndex = oIN.getFocusedIndex();
			var iColumnNumber = iIndex % oIN.iColumns;
			var iFirstVisibleRow = oTable.getFirstVisibleRow();
			var iTotalRowCount = oTable._getRowCount();
			var iRowIndex = Math.floor(iIndex / oIN.iColumns) + iFirstVisibleRow + 1 - oTable._getHeaderRowCount();
			var sRowCountText = oTable._oResBundle.getText("TBL_ROW_ROWCOUNT", [iRowIndex, iTotalRowCount]);

			bIsRowChanged = oExtension._iLastRowIndex != iRowIndex || (oExtension._iLastRowIndex == iRowIndex && oExtension._iLastColumnNumber == iColumnNumber);

			oRowNoElem.innerText = bIsRowChanged ? sRowCountText : " ";

			oExtension._iLastRowIndex = iRowIndex;
			oExtension._iLastColumnNumber = iColumnNumber;
		}

		return bIsRowChanged;
	};

	var _updateCellAccText = function(oExtension, sText) {
		var oCellAccElem = document.getElementById(oExtension.getTable().getId() + "-cellacc");
		if (oCellAccElem) {
			oCellAccElem.innerText = sText;
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
		var oInfo = _getInfoOfFocusedCell(this._table);
		if (!oInfo || !oInfo.cell || !oInfo.type || !this["_updateAccFor" + oInfo.type]) {
			return;
		}
		//DATACELL, ROWHEADER, GROUPROWCELL / Not yet handled: COLUMNHEADER, COLUMNROWHEADER, GROUPROWHEADER
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
			//var oColumn = oTable._getVisibleColumns()[iCol];
			var oInfo = _getAccessibleInfoOfControl(oCell, oTable._oResBundle);
			var bIsTreeColumnCell = this._treeMode && oTable._getTreeIconAttributes && $Cell.hasClass("sapUiTableTdFirst"); //TreeTable

			var bRowChanged = _updateRowCount(this);

			$Cell.attr("aria-labelledby", (oCell._sLabelledBy || "") + (oInfo ? " " + oTable.getId() + "-cellacc" : oCell.getId()) + (oInfo && oInfo.labelled ? " " + oInfo.labelled : ""));
			$Cell.attr("aria-describedby", (oInfo && oInfo.described ? oInfo.described + " " : "") +
											((((!oInfo || oInfo.editable) && !this._readonly) || bIsTreeColumnCell) ? (oTable.getId() + "-toggleedit ") : "") +
											(oTable._getSelectOnCellsAllowed() && bRowChanged ? (oRow.getId() + "-rowselecttext") : ""));

			var sTreeText = "";
			if (bIsTreeColumnCell) {
				var oAttributes = oTable._getTreeIconAttributes(oRow);
				if (oAttributes && oAttributes["aria-label"]) {
					sTreeText = oAttributes["aria-label"];
				}
			}

			_updateCellAccText(this, sTreeText + " " + (oInfo ? oInfo.text : " "));
		}
	};

	TableAccExtension.prototype._updateAccForROWHEADER = function($Cell, bOnCellFocus) {
		_updateCellAccText(this, this.getTable()._oResBundle.getText("TBL_ROW_HEADER_LABEL"));
		_updateRowCount(this);
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
			//var oColumn = oTable._getVisibleColumns()[iCol];
			var oInfo = _getAccessibleInfoOfControl(oCell);
			var sRowHeaderId = oTable.getId() + "-rows-row" + iRow + "-groupHeader";
			var sSumId = oTable.getId() + "-rows-row" + iRow + "-col" + iCol + "-ariaTextForSum";
			var sLabelId = jQuery.sap.domById(sSumId) ? sSumId : sRowHeaderId;

			$Cell.attr("aria-labelledby", (oCell._sLabelledBy || "") + " " + sLabelId + " " + oTable.getId() + "-cellacc" + (oInfo && oInfo.labelled ? " " + oInfo.labelled : ""));
			$Cell.attr("aria-describedby", oInfo && oInfo.described ? " " + oInfo.described : "");

			_updateCellAccText(this, oTable._oResBundle.getText("TBL_ROW_GROUP_LABEL") + " " + (oInfo ? oInfo.text : " "));
			_updateRowCount(this);
		}
	};

	return TableAccExtension;

}, /* bExport= */ true);