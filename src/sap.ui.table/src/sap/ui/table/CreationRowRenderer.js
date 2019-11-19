/*!
 * ${copyright}
 */

//Provides default renderer for control sap.ui.table.CreationRow
sap.ui.define([
	"./TableRenderer",
	"./utils/TableUtils",
	"sap/ui/core/Renderer"
], function(TableRenderer, TableUtils, Renderer) {
	"use strict";

	/**
	 * CreationRow renderer.
	 *
	 * @namespace
	 * @alias sap.ui.table.CreationRowRenderer
	 */
	var CreationRowRenderer = {
		apiVersion: 2
	};

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

		oRm.openStart("div", oCreationRow);
		oRm.attr("data-sap-ui-fastnavgroup", "true");
		oTable._getAccRenderExtension().writeAriaAttributesFor(oRm, oTable, "CREATIONROW", {creationRow: oCreationRow});
		oRm.class("sapUiTableCreationRow");
		oRm.openEnd();

		this.renderBeginSection(oRm);
		this.renderMiddleSection(oRm, oCreationRow, oTable);
		this.renderEndSection(oRm, oTable);

		oTable._getAccRenderExtension().writeAccCreationRowText(oRm, oTable, oCreationRow);

		oRm.close("div");
	};

	CreationRowRenderer.renderBeginSection = function(oRm) {
		oRm.openStart("div");
		oRm.class("sapUiTableCreationRowBeginSection");
		oRm.class("sapUiTableRowHdrScr");
		oRm.openEnd();
		oRm.close("div");
	};

	CreationRowRenderer.renderMiddleSection = function(oRm, oCreationRow, oTable) {
		oRm.openStart("div");
		oRm.class("sapUiTableCreationRowMiddleSection");
		oRm.openEnd();
		this.renderForm(oRm, oCreationRow, oTable);
		this.renderToolbar(oRm, oCreationRow);
		oRm.close("div");
	};

	CreationRowRenderer.renderEndSection = function(oRm, oTable) {
		oRm.openStart("div");
		oRm.class("sapUiTableCreationRowEndSection");
		if (TableUtils.hasRowActions(oTable)) {
			oRm.class("sapUiTableCell");
			oRm.class("sapUiTableRowActionHeaderCell");
		} else {
			oRm.class("sapUiTableVSbBg");
		}
		oRm.openEnd();
		oRm.close("div");
	};

	CreationRowRenderer.renderForm = function(oRm, oCreationRow, oTable) {
		if (oCreationRow.getCells().length === 0) {
			return;
		}

		oRm.openStart("div");
		oRm.class("sapUiTableCreationRowForm");
		oRm.openEnd();

		if (oTable.getComputedFixedColumnCount() > 0) {
			this.renderRowFormTable(oRm, oTable, true);
		}

		oRm.openStart("div");
		oRm.class("sapUiTableCtrlScr");
		oRm.openEnd();
		this.renderRowFormTable(oRm, oTable, false);
		oRm.close("div");

		oRm.close("div");
	};

	CreationRowRenderer.renderRowFormTable = function(oRm, oTable, bFixedTable) {
		// This method is very similar to TableRenderer.renderTableControlCnt, but could not be reused without bloating it up heavily. A reusable
		// solution requires major refactoring.

		var iStartColumnIndex = bFixedTable ? 0 : oTable.getComputedFixedColumnCount();
		var iEndColumnIndex = bFixedTable ? oTable.getComputedFixedColumnCount() : oTable.getColumns().length;
		var oCreationRow = oTable.getCreationRow();

		oRm.openStart("table");
		oTable._getAccRenderExtension().writeAriaAttributesFor(oRm, oTable, "CREATIONROW_TABLE");
		oRm.class("sapUiTableCtrl");
		oRm.style(bFixedTable ? "width" : "min-width", oTable._getColumnsWidth(iStartColumnIndex, iEndColumnIndex) + "px");
		oRm.openEnd();

		oRm.openStart("thead").openEnd();
		oRm.openStart("tr");
		oRm.class("sapUiTableCtrlCol");
		oRm.openEnd();

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
				oRm.openStart("th");
				oRm.style("width", oColParam.width);
				oRm.attr("data-sap-ui-headcolindex", iColumnIndex);
				oRm.attr("data-sap-ui-colid", oColumn.getId());
				oRm.openEnd();
				oRm.close("th");
			}
		}

		// dummy column to fill the table width
		if (bRenderDummyColumn) {
			oRm.openStart("th").openEnd().close("th");
		}

		oRm.close("tr");
		oRm.close("thead");

		oRm.openStart("tbody").openEnd();

		oRm.openStart("tr");
		oRm.class("sapUiTableTr");
		oRm.openEnd();

		var aCells = oCreationRow.getCells();
		var aVisibleColumns = oTable._getVisibleColumns();

		for (iColumnIndex = iStartColumnIndex; iColumnIndex < iEndColumnIndex; iColumnIndex++) {
			oColumn = aColumns[iColumnIndex];
			oColParam = aColumnParams[iColumnIndex];

			if (oColParam.shouldRender) {
				oRm.openStart("td");
				oRm.attr("data-sap-ui-colid", oColumn.getId());

				var oCell = oCreationRow._getCell(iColumnIndex);
				var nColumns = aVisibleColumns.length;
				var bIsFirstColumn = nColumns > 0 && aVisibleColumns[0] === oColumn;
				var bIsLastColumn = nColumns > 0 && aVisibleColumns[nColumns - 1] === oColumn;
				var oLastFixedColumn = aColumns[oTable.getFixedColumnCount() - 1];
				var bIsLastFixedColumn = bFixedTable & oLastFixedColumn === oColumn;
				var sHAlign = Renderer.getTextAlign(oColumn.getHAlign(), oCell && oCell.getTextDirection && oCell.getTextDirection());

				oRm.style("text-align", sHAlign);

				oRm.class("sapUiTableCell");
				oRm.class("sapUiTablePseudoCell");
				if (bIsFirstColumn) {
					oRm.class("sapUiTableCellFirst");
				}
				if (bIsLastFixedColumn) {
					oRm.class("sapUiTableCellLastFixed");
				}
				if (bIsLastColumn) {
					oRm.class("sapUiTableCellLast");
				}

				oRm.openEnd();

				if (oCell) {
					oRm.openStart("div");
					oRm.class("sapUiTableCellInner");
					oRm.openEnd();
					TableRenderer.renderTableCellControl(oRm, oTable, oCell, bIsFirstColumn);
					oRm.close("div");
				}

				oRm.close("td");
			}
		}

		if (!bFixedTable && bRenderDummyColumn && aCells.length > 0) {
			oRm.openStart("td").class("sapUiTableCellDummy").openEnd().close("td");
		}
		oRm.close("tr");

		oRm.close("tbody");
		oRm.close("table");
	};

	CreationRowRenderer.renderToolbar = function(oRm, oCreationRow) {
		oRm.renderControl(oCreationRow._getToolbar());
	};

	return CreationRowRenderer;

}, /* bExport= */ true);