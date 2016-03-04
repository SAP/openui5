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
			bIsRowChanged = false;

		if (oIN) {
			var oRowNoElem = document.getElementById(oTable.getId() + "-rownumberofrows");
			var oColNoElem = document.getElementById(oTable.getId() + "-colnumberofcols");

			var iIndex = oIN.getFocusedIndex();
			var iColumnNumber = iIndex % oIN.iColumns;
			var iFirstVisibleRow = oTable.getFirstVisibleRow();
			var iTotalRowCount = oTable._getRowCount();
			var iRowIndex = Math.floor(iIndex / oIN.iColumns) + iFirstVisibleRow + 1 - oTable._getHeaderRowCount();

			bIsRowChanged = oExtension._iLastRowNumber != iRowIndex || (oExtension._iLastRowNumber == iRowIndex && oExtension._iLastColumnNumber == iColumnNumber);

			oRowNoElem.innerText = bIsRowChanged ? oTable._oResBundle.getText("TBL_ROW_ROWCOUNT", [iRowIndex, iTotalRowCount]) : " ";
			oColNoElem.innerText = oExtension._iLastColumnNumber != iColumnNumber ? oTable._oResBundle.getText("TBL_COL_COLCOUNT", [iColumnNumber, oTable._getVisibleColumnCount()]) : " ";

			oExtension._iLastRowNumber = iRowIndex;
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
		if (bOnCellFocus) {
			if (this._cleanupInfo) {
				this._cleanupInfo.cell.attr(this._cleanupInfo.attr);
				this._cleanupInfo = null;
			}
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

			var bRowChanged = _updateRowColCount(this);

			this._cleanupInfo = {
				cell: $Cell,
				attr: {
					"aria-labelledby" : oCell._sLabelledBy || "",
					"aria-describedby" : ""
				}
			};

			$Cell.attr("aria-labelledby", oTable.getId() + "-rownumberofrows " + oTable.getId() + "-colnumberofcols " + (oCell._sLabelledBy || "") +
											(oInfo ? " " + oTable.getId() + "-cellacc" : oCell.getId()) +
											(oInfo && oInfo.labelled ? " " + oInfo.labelled : ""));
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
		var oTable = this.getTable();
		var oRow = oTable.getRows()[$Cell.attr("data-sap-ui-rowindex")];

		this._cleanupInfo = {
			cell: $Cell,
			attr: {
				"aria-labelledby" : ""
			}
		};

		$Cell.attr("aria-labelledby", oTable.getId() + "-cellacc " + oTable.getId() + "-rownumberofrows " + oRow.getId() + "-rowselecttext");
		_updateCellAccText(this, this.getTable()._oResBundle.getText("TBL_ROW_HEADER_LABEL"));
		_updateRowColCount(this);
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

			this._cleanupInfo = {
				cell: $Cell,
				attr: {
					"aria-labelledby" : oCell._sLabelledBy || "",
					"aria-describedby" : ""
				}
			};

			$Cell.attr("aria-labelledby", (oCell._sLabelledBy || "") + " " + sLabelId + " " + oTable.getId() + "-cellacc" + (oInfo && oInfo.labelled ? " " + oInfo.labelled : ""));
			$Cell.attr("aria-describedby", oInfo && oInfo.described ? " " + oInfo.described : "");

			_updateCellAccText(this, oTable._oResBundle.getText("TBL_ROW_GROUP_LABEL") + " " + (oInfo ? oInfo.text : " "));
			_updateRowColCount(this);
		}
	};

	return TableAccExtension;

}, /* bExport= */ true);