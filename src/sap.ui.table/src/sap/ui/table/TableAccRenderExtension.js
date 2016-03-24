/*!
 * ${copyright}
 */

// Provides helper sap.ui.table.TableAccRenderExtension.
sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
	"use strict";

	var _writeAccText = function(oRm, sParentId, sId, sText, aCSSClasses) {
		aCSSClasses = aCSSClasses || [];
		aCSSClasses.push("sapUiInvisibleText");

		oRm.write("<span");
		oRm.writeAttribute("id", sParentId + "-" + sId);
		oRm.writeAttribute("class", aCSSClasses.join(" "));
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

		writeHiddenAccTexts: function(oRm, oTable) {
			if (!oTable._getAccExtension().getAccMode()) {
				return;
			}

			var oBundle = oTable._oResBundle,
				sTableId = oTable.getId();

			oRm.write("<div class='sapUiTableHiddenTexts' style='display:none;'>");

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
			// aria label for row headers
			_writeAccText(oRm, sTableId, "ariarowheaderlabel", oBundle.getText("TBL_ROW_HEADER_LABEL"));
			// aria label for group rows
			_writeAccText(oRm, sTableId, "ariarowgrouplabel", oBundle.getText("TBL_ROW_GROUP_LABEL"));
			// aria label for grand total sums
			_writeAccText(oRm, sTableId, "ariagrandtotallabel", oBundle.getText("TBL_GRAND_TOTAL_ROW"));
			// aria label for group total sums
			_writeAccText(oRm, sTableId, "ariagrouptotallabel", oBundle.getText("TBL_GROUP_TOTAL_ROW"));
			// aria label for column row header
			_writeAccText(oRm, sTableId, "ariacolrowheaderlabel", oBundle.getText("TBL_ROW_COL_HEADER_LABEL"));
			// aria description for table row count
			_writeAccText(oRm, sTableId, "rownumberofrows");
			// aria description for table column count
			_writeAccText(oRm, sTableId, "colnumberofcols");
			// aria description for table cell content
			_writeAccText(oRm, sTableId, "cellacc");
			// aria description for selected row
			_writeAccText(oRm, sTableId, "ariarowselected", oBundle.getText("TBL_ROW_DESC_SELECTED"));
			// aria description for column menu
			_writeAccText(oRm, sTableId, "ariacolmenu", oBundle.getText("TBL_COL_DESC_MENU"));
			// aria description for a filtered column
			_writeAccText(oRm, sTableId, "ariacolfiltered", oBundle.getText("TBL_COL_DESC_FILTERED"));
			// aria description for a sorted column
			_writeAccText(oRm, sTableId, "ariacolsortedasc", oBundle.getText("TBL_COL_DESC_SORTED_ASC"));
			// aria description for a sorted column
			_writeAccText(oRm, sTableId, "ariacolsorteddes", oBundle.getText("TBL_COL_DESC_SORTED_DES"));

			if (oTable.getFixedColumnCount() > 0) {
				// aria description for fixed columns
				_writeAccText(oRm, sTableId, "ariafixedcolumn", oBundle.getText("TBL_FIXED_COLUMN"));
			}

			oRm.write("</div>");
		},

		writeAriaAttributesFor: function(oRm, oTable, sType, mParams) {
			if (!oTable._getAccExtension().getAccMode()) {
				return;
			}

			var mAttributes = oTable._getAccExtension()._getAriaAttributesFor(oTable, sType, mParams);

			var oValue, sKey;
			for (sKey in mAttributes) {
				oValue = mAttributes[sKey];
				if (jQuery.isArray(oValue)) {
					oValue = oValue.join(" ");
				}
				if (oValue) {
					oRm.writeAttributeEscaped(sKey, oValue);
				}
			}
		},

		writeAccRowSelectorText: function(oRm, oTable, oRow, iRowIndex) {
			if (!oTable._getAccExtension().getAccMode()) {
				return "";
			}

			var bIsSelected = oTable.isIndexSelected(iRowIndex);
			var mTooltipTexts = oTable._getAccExtension().getAriaTextsForSelectionMode(true);
			var sText = mTooltipTexts.keyboard[bIsSelected ? "rowDeselect" : "rowSelect"];

			_writeAccText(oRm, oRow.getId(), "rowselecttext", sText, ["sapUiTableAriaRowSel"]);
		}

	};

	return AccRenderExtension;

}, /* bExport= */ true);