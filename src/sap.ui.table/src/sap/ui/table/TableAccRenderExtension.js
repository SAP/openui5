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
							oTable.getTitle().getText() :
							oBundle.getText("TBL_TABLE");
			_writeAccText(oRm, sTableId, "ariadesc", sDesc);
			// aria description for the row count
			_writeAccText(oRm, sTableId, "ariacount");
			// aria description for toggling the edit mode
			_writeAccText(oRm, sTableId, "toggleedit", oBundle.getText("TBL_TOGGLE_EDIT_KEY"));
			/*// aria description for row selection behavior with no line selected
			_writeAccText(oRm, sTableId, "selectrow", oBundle.getText("TBL_ROW_SELECT_KEY"));
			// aria description for row selection behavior with line selected
			_writeAccText(oRm, sTableId, "selectrowmulti", oBundle.getText("TBL_ROW_SELECT_MULTI_KEY"));
			// aria description for row deselection behavior with no line selected
			_writeAccText(oRm, sTableId, "deselectrow", oBundle.getText("TBL_ROW_DESELECT_KEY"));
			// aria description for row deselection behavior with line selected
			_writeAccText(oRm, sTableId, "deselectrowmulti", oBundle.getText("TBL_ROW_DESELECT_MULTI_KEY"));*/
			// aria description for table row count
			_writeAccText(oRm, sTableId, "rownumberofrows");
			// aria description for table cell content
			_writeAccText(oRm, sTableId, "cellacc");

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
		}

	};

	return AccRenderExtension;

}, /* bExport= */ true);