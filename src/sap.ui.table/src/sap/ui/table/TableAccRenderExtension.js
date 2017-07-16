/*!
 * ${copyright}
 */

// Provides helper sap.ui.table.TableAccRenderExtension.
sap.ui.define([
	"jquery.sap.global", "./TableExtension", "./library"
], function(jQuery, TableExtension, library) {
	"use strict";

	// Shortcuts
	var SelectionMode = library.SelectionMode;

	/*
	 * Renders a hidden element with the given id, text and css classes.
	 */
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
	 * Extension for sap.ui.table.TableRenderer which handles ACC related things.
	 * <b>This is an internal class that is only intended to be used inside the sap.ui.table library! Any usage outside the sap.ui.table library is
	 * strictly prohibited!</b>
	 *
	 * @class Extension for sap.ui.table.TableRenderer which handles ACC related things.
	 * @extends sap.ui.table.TableExtension
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @alias sap.ui.table.TableAccRenderExtension
	 */
	var AccRenderExtension = TableExtension.extend("sap.ui.table.TableAccRenderExtension",
		/** @lends sap.ui.table.TableAccRenderExtension.prototype */ {
		/**
		 * @override
		 * @inheritDoc
		 * @returns {string} The name of this extension.
		 */
		_init: function(oTable, sTableType, mSettings) {
			return "AccRenderExtension";
		},

		/**
		 * Renders all necessary hidden text elements of the table.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the Render-Output-Buffer.
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @public
		 */
		writeHiddenAccTexts: function(oRm, oTable) {
			if (!oTable._getAccExtension().getAccMode()) {
				return;
			}

			var oBundle = oTable._oResBundle,
				sTableId = oTable.getId();

			oRm.write("<div class='sapUiTableHiddenTexts' style='display:none;' aria-hidden='true'>");

			// aria description for the table
			var sDesc = oTable.getTitle() && oTable.getTitle().getText && oTable.getTitle().getText() != "" ? oTable.getTitle().getText() : "";
			_writeAccText(oRm, sTableId, "ariadesc", sDesc);
			// aria description for the row and column count
			_writeAccText(oRm, sTableId, "ariacount");
			// aria description for toggling the edit mode
			_writeAccText(oRm, sTableId, "toggleedit", oBundle.getText("TBL_TOGGLE_EDIT_KEY"));
			// aria description for select all button
			_writeAccText(oRm, sTableId, "ariaselectall", oBundle.getText("TBL_SELECT_ALL"));
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
			// aria description for column header span
			_writeAccText(oRm, sTableId, "ariacolspan");
			// aria description for a filtered column
			_writeAccText(oRm, sTableId, "ariacolfiltered", oBundle.getText("TBL_COL_DESC_FILTERED"));
			// aria description for a sorted column
			_writeAccText(oRm, sTableId, "ariacolsortedasc", oBundle.getText("TBL_COL_DESC_SORTED_ASC"));
			// aria description for a sorted column
			_writeAccText(oRm, sTableId, "ariacolsorteddes", oBundle.getText("TBL_COL_DESC_SORTED_DES"));
			// aria description for invalid table (table with overlay)
			_writeAccText(oRm, sTableId, "ariainvalid", oBundle.getText("TBL_TABLE_INVALID"));

			var oSelectionMode = oTable.getSelectionMode();
			if (oSelectionMode !== SelectionMode.None) {
				// aria description for selection mode in table
				_writeAccText(oRm, sTableId, "ariaselection", oBundle.getText(oSelectionMode == SelectionMode.MultiToggle ? "TBL_TABLE_SELECTION_MULTI" : "TBL_TABLE_SELECTION_SINGLE"));
			}

			if (oTable.getFixedColumnCount() > 0) {
				// aria description for fixed columns
				_writeAccText(oRm, sTableId, "ariafixedcolumn", oBundle.getText("TBL_FIXED_COLUMN"));
			}

			oRm.write("</div>");
		},

		/**
		 * Renders the default aria attributes of the element with the given type and settings.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the Render-Output-Buffer.
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @param {sap.ui.table.TableAccExtension.ELEMENTTYPES} sType The type of the table area to write the aria attributes for.
		 * @param {Object} mParams Accessibility parameters.
		 * @public
		 * @see sap.ui.table.TableAccExtension#getAriaAttributesFor
		 */
		writeAriaAttributesFor: function(oRm, oTable, sType, mParams) {
			var oExtension = oTable._getAccExtension();

			if (!oExtension.getAccMode()) {
				return;
			}

			var mAttributes = oExtension.getAriaAttributesFor(sType, mParams);

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

		/**
		 * Renders the default row selector content.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the Render-Output-Buffer.
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @param {sap.ui.table.Row} oRow Instance of the row.
		 * @param {int} iRowIndex The index of the row.
		 * @public
		 * @see sap.ui.table.TableRenderer.writeRowSelectorContent
		 */
		writeAccRowSelectorText: function(oRm, oTable, oRow, iRowIndex) {
			if (!oTable._getAccExtension().getAccMode()) {
				return;
			}

			var bIsSelected = oTable.isIndexSelected(iRowIndex);
			var mTooltipTexts = oTable._getAccExtension().getAriaTextsForSelectionMode(true);
			var sText = mTooltipTexts.keyboard[bIsSelected ? "rowDeselect" : "rowSelect"];

			_writeAccText(oRm, oRow.getId(), "rowselecttext", oRow._bHidden ? "" : sText, ["sapUiTableAriaRowSel"]);
		},

		/**
		 * Renders the default row highlight content.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the Render-Output-Buffer.
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @param {sap.ui.table.Row} oRow Instance of the row.
		 * @param {int} iRowIndex The index of the row.
		 * @public
		 * @see sap.ui.table.TableRenderer#writeRowHighlightContent
		 */
		writeAccRowHighlightText: function(oRm, oTable, oRow, iRowIndex) {
			if (!oTable._getAccExtension().getAccMode()) {
				return;
			}

			var oRowSettings = oRow.getAggregation("_settings");
			var sHighlightText = oRowSettings._getHighlightText();

			_writeAccText(oRm, oRow.getId(), "highlighttext", sHighlightText);
		}
	});

	return AccRenderExtension;
});

/**
 * Gets the accessibility render extension.
 *
 * @name sap.ui.table.Table#_getAccRenderExtension
 * @function
 * @returns {sap.ui.table.TableScrollExtension} The accesibility render extension.
 * @private
 */