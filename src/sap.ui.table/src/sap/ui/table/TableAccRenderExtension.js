/*!
 * ${copyright}
 */

// Provides helper sap.ui.table.TableAccRenderExtension.
sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
	"use strict";

	var _writeAccText = function(oRm, sTableId, sId, sText) {
		oRm.write("<span");
		oRm.writeAttribute("id", sTableId + "-" + sId);
		oRm.writeAttribute("class", "sapUiInvisibleText");
		oRm.writeAttribute("aria-hidden", "true");
		oRm.write(">");
		if (sText) {
			oRm.writeEscaped(sText);
		}
		oRm.write("</span>");
	};

	//********************************************************************

	/**
	 * Extension for sap.ui.zable.TableRenderer which handles ACC related things.
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @namespace
	 * @private
	 * @alias sap.ui.table.TableAccRenderExtension
	 */
	var AccRenderExtension = {

		writeTableAccRole: function(oRm, oTable) {
			var oExtension = oTable._getAccExtension();
			if (oExtension.getAccMode()) {
				oRm.writeAttribute("role", oExtension.getTableAccRole());
			}
		},

		writeHiddenAccTexts: function(oRm, oTable) {
			if (!oTable._getAccExtension().getAccMode()) {
				return;
			}

			var oBundle = oTable._oResBundle,
				sTableId = oTable.getId();

			oRm.write("<div style='display:none;'>");

			// aria description for the table
			var sDesc = oTable.getTitle() && oTable.getTitle().getText && oTable.getTitle().getText() != "" ?
							oTable.getTitle().getText() : "";
			_writeAccText(oRm, sTableId, "ariadesc", sDesc);
			// aria description for the row and column count
			_writeAccText(oRm, sTableId, "ariacount");
			// aria description for toggling the edit mode
			_writeAccText(oRm, sTableId, "toggleedit", oBundle.getText("TBL_TOGGLE_EDIT_KEY"));
			// aria description for toggling the edit mode
			_writeAccText(oRm, sTableId, "ariaselectall", oBundle.getText("TBL_SELECT_ALL_KEY"));
			// aria description for table row count
			_writeAccText(oRm, sTableId, "rownumberofrows");
			// aria description for table column count
			_writeAccText(oRm, sTableId, "colnumberofcols");
			// aria description for table cell content
			_writeAccText(oRm, sTableId, "cellacc");
			if (oTable.getFixedColumnCount() > 0) {
				// aria description for fixed columns
				_writeAccText(oRm, sTableId, "ariafixedcolumn", oBundle.getText("TBL_FIXED_COLUMN"));
			}

			oRm.write("</div>");
		},

		getAccRowSelectorText: function(oTable, oRow, iRowIndex) {
			if (!oTable._getAccExtension().getAccMode()) {
				return "";
			}

			var bIsSelected = oTable.isIndexSelected(iRowIndex);

			var sText = "<div id='" + oRow.getId() + "-rowselecttext' aria-hidden='true' class='sapUiTableAriaRowSel sapUiInvisibleText'>";
			var mTooltipTexts = oTable._getAriaTextsForSelectionMode(true);
			sText += mTooltipTexts.keyboard[bIsSelected ? "rowDeselect" : "rowSelect"];
			return sText + "</div>";
		},

		getCellLabels: function(oTable, oColumn, bFixedColumn, bJoin) {
			var aLabels = [];

			var aMultiLabels = oColumn.getMultiLabels();
			var iMultiLabels = aMultiLabels.length;

			// get IDs of column labels
			if (oTable.getColumnHeaderVisible()) {
				var sColumnId = oColumn.getId();
				aLabels.push(sColumnId); // first column header has no suffix, just the column ID
				if (iMultiLabels > 1) {
					for (var i = 1; i < iMultiLabels; i++) {
						aLabels.push(sColumnId + "_" + i); // for all other column header rows we add the suffix
					}
				}
			} else {
				// column header is not rendered therefore there is no <div> tag. Link aria description to label
				var oLabel;
				if (iMultiLabels == 0) {
					oLabel = oColumn.getLabel();
					if (oLabel) {
						aLabels.push(oLabel.getId());
					}
				} else {
					for (var i = 0; i < iMultiLabels; i++) {
						// for all other column header rows we add the suffix
						oLabel = aMultiLabels[i];
						if (oLabel) {
							aLabels.push(oLabel.getId());
						}
					}
				}
			}

			if (bFixedColumn) {
				aLabels.push(oTable.getId() + "-ariafixedcolumn");
			}

			return bJoin ? aLabels.join(" ") : aLabels;
		}

	};

	return AccRenderExtension;

}, /* bExport= */ true);