/*!
 * ${copyright}
 */

//Provides default renderer for control sap.ui.table.CreationRow
sap.ui.define([
	"./TableRenderer",
	"./TableUtils",
	"sap/ui/core/Renderer"
], function(TableRenderer, TableUtils, Renderer) {
	"use strict";

	/**
	 * CreationRow renderer.
	 *
	 * @namespace
	 * @alias sap.ui.table.CreationRowRenderer
	 */
	var CreationRowRenderer = {};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.table.CreationRow} oCreationRow The <code>CreationRow</code> that should be rendered
	 */
	CreationRowRenderer.render = function(oRm, oCreationRow) {
		var oTable = oCreationRow._getTable();

		if (!oTable) {
			return;
		}

		oRm.write("<div");
		oRm.writeElementData(oCreationRow);
		oRm.writeAttribute("data-sap-ui-fastnavgroup", "true");
		oTable._getAccRenderExtension().writeAriaAttributesFor(oRm, oTable, "CREATIONROW", {creationRow: oCreationRow});
		oRm.addClass("sapUiTableCreationRow");
		oRm.writeClasses();
		oRm.write(">");

		this.renderBeginSection(oRm);
		this.renderMiddleSection(oRm, oCreationRow, oTable);
		this.renderEndSection(oRm, oTable);

		oTable._getAccRenderExtension().writeAccCreationRowText(oRm, oTable, oCreationRow);

		oRm.write("</div>");
	};

	CreationRowRenderer.renderBeginSection = function(oRm) {
		oRm.write("<div");
		oRm.addClass("sapUiTableCreationRowBeginSection");
		oRm.addClass("sapUiTableRowHdrScr");
		oRm.writeClasses();
		oRm.write(">");
		oRm.write("</div>");
	};

	CreationRowRenderer.renderMiddleSection = function(oRm, oCreationRow, oTable) {
		oRm.write("<div");
		oRm.addClass("sapUiTableCreationRowMiddleSection");
		oRm.writeClasses();
		oRm.write(">");
		this.renderForm(oRm, oCreationRow, oTable);
		this.renderToolbar(oRm, oCreationRow);
		oRm.write("</div>");
	};

	CreationRowRenderer.renderEndSection = function(oRm, oTable) {
		oRm.write("<div");
		oRm.addClass("sapUiTableCreationRowEndSection");
		if (TableUtils.hasRowActions(oTable)) {
			oRm.addClass("sapUiTableCell");
			oRm.addClass("sapUiTableRowActionHeaderCell");
		} else {
			oRm.addClass("sapUiTableVSbBg");
		}
		oRm.writeClasses();
		oRm.write(">");
		oRm.write("</div>");
	};

	CreationRowRenderer.renderForm = function(oRm, oCreationRow, oTable) {
		if (oCreationRow.getCells().length === 0) {
			return;
		}

		oRm.write("<div");
		oRm.addClass("sapUiTableCreationRowForm");
		oRm.writeClasses();
		oRm.write(">");

		if (oTable.getComputedFixedColumnCount() > 0) {
			this.renderRowFormTable(oRm, oTable, true);
		}

		oRm.write("<div");
		oRm.addClass("sapUiTableCtrlScr");
		oRm.writeClasses();
		oRm.write(">");
		this.renderRowFormTable(oRm, oTable, false);
		oRm.write("</div>");

		oRm.write("</div>");
	};

	CreationRowRenderer.renderRowFormTable = function(oRm, oTable, bFixedTable) {
		// This method is very similar to TableRenderer.renderTableControlCnt, but could not be reused without bloating it up heavily. A reusable
		// solution requires major refactoring.

		var iStartColumnIndex = bFixedTable ? 0 : oTable.getComputedFixedColumnCount();
		var iEndColumnIndex = bFixedTable ? oTable.getComputedFixedColumnCount() : oTable.getColumns().length;
		var oCreationRow = oTable.getCreationRow();

		oRm.write("<table");
		oTable._getAccRenderExtension().writeAriaAttributesFor(oRm, oTable, "CREATIONROW_TABLE");
		oRm.addClass("sapUiTableCtrl");
		oRm.writeClasses();
		oRm.addStyle(bFixedTable ? "width" : "min-width", oTable._getColumnsWidth(iStartColumnIndex, iEndColumnIndex) + "px");
		oRm.writeStyles();
		oRm.write(">");

		oRm.write("<thead>");
		oRm.write("<tr");
		oRm.addClass("sapUiTableCtrlCol");
		oRm.writeClasses();
		oRm.write(">");

		var aColumns = oTable.getColumns();
		var aColumnParams = new Array(iEndColumnIndex);
		var iColumnIndex;
		var oColumn;
		var bRenderDummyColumn = !bFixedTable && iEndColumnIndex > iStartColumnIndex;
		var oColParam;

		for (iColumnIndex = iStartColumnIndex; iColumnIndex < iEndColumnIndex; iColumnIndex++) {
			oColumn = aColumns[iColumnIndex];
			oColParam = {
				shouldRender: !!(oColumn && oColumn.shouldRender())
			};
			if (oColParam.shouldRender) {
				var sWidth = oColumn.getWidth();
				if (TableUtils.isVariableWidth(sWidth)) {
					// if some of the columns have variable width, they serve as the dummy column
					// and take available place. Do not render a dummy column in this case.
					bRenderDummyColumn = false;
					// in fixed area, use stored fixed width or 10rem:
					if (bFixedTable) {
						oColumn._iFixWidth = oColumn._iFixWidth || 160;
						sWidth = oColumn._iFixWidth + "px";
					}
				} else if (bFixedTable) {
					delete oColumn._iFixWidth;
				}
				oColParam.width = sWidth;
			}
			aColumnParams[iColumnIndex] = oColParam;
		}

		for (iColumnIndex = iStartColumnIndex; iColumnIndex < iEndColumnIndex; iColumnIndex++) {
			oColumn = aColumns[iColumnIndex];
			oColParam = aColumnParams[iColumnIndex];

			if (oColParam.shouldRender) {
				oRm.write("<th");
				if (oColParam.width) {
					oRm.addStyle("width", oColParam.width);
					oRm.writeStyles();
				}
				oRm.writeAttribute("data-sap-ui-headcolindex", iColumnIndex);
				oRm.writeAttribute("data-sap-ui-colid", oColumn.getId());
				oRm.write("></th>");
			}
		}

		// dummy column to fill the table width
		if (bRenderDummyColumn) {
			oRm.write("<th");
			oRm.write("></th>");
		}

		oRm.write("</tr>");
		oRm.write("</thead>");

		oRm.write("<tbody>");

		oRm.write("<tr");
		oRm.addClass("sapUiTableTr");
		oRm.writeClasses();
		oRm.write(">");

		var aCells = oCreationRow.getCells();
		var aVisibleColumns = oTable._getVisibleColumns();

		for (iColumnIndex = iStartColumnIndex; iColumnIndex < iEndColumnIndex; iColumnIndex++) {
			oColumn = aColumns[iColumnIndex];
			oColParam = aColumnParams[iColumnIndex];

			if (oColParam.shouldRender) {
				oRm.write("<td");
				oRm.writeAttribute("data-sap-ui-colid", oColumn.getId());

				var oCell = oCreationRow._getCell(iColumnIndex);
				var nColumns = aVisibleColumns.length;
				var bIsFirstColumn = nColumns > 0 && aVisibleColumns[0] === oColumn;
				var bIsLastColumn = nColumns > 0 && aVisibleColumns[nColumns - 1] === oColumn;
				var oLastFixedColumn = aColumns[oTable.getFixedColumnCount() - 1];
				var bIsLastFixedColumn = bFixedTable & oLastFixedColumn === oColumn;
				var sHAlign = Renderer.getTextAlign(oColumn.getHAlign(), oCell && oCell.getTextDirection && oCell.getTextDirection());

				if (sHAlign) {
					oRm.addStyle("text-align", sHAlign);
				}
				oRm.writeStyles();

				oRm.addClass("sapUiTableCell");
				oRm.addClass("sapUiTablePseudoCell");
				if (bIsFirstColumn) {
					oRm.addClass("sapUiTableCellFirst");
				}
				if (bIsLastFixedColumn) {
					oRm.addClass("sapUiTableCellLastFixed");
				}
				if (bIsLastColumn) {
					oRm.addClass("sapUiTableCellLast");
				}
				oRm.writeClasses();

				oRm.write(">");

				if (oCell) {
					oRm.write("<div");
					oRm.addClass("sapUiTableCellInner");
					oRm.writeClasses();
					oRm.write(">");
					TableRenderer.renderTableCellControl(oRm, oTable, oCell, bIsFirstColumn);
					oRm.write("</div>");
				}

				oRm.write("</td>");
			}
		}

		if (!bFixedTable && bRenderDummyColumn && aCells.length > 0) {
			oRm.write("<td class=\"sapUiTableCellDummy\"></td>");
		}
		oRm.write("</tr>");

		oRm.write("</tbody>");
		oRm.write("</table>");
	};

	CreationRowRenderer.renderToolbar = function(oRm, oCreationRow) {
		oRm.renderControl(oCreationRow._getToolbar());
	};

	return CreationRowRenderer;

}, /* bExport= */ true);