/*!
 * ${copyright}
 */

//Provides default renderer for control sap.ui.table.Table
sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
	"use strict";


	/**
	 * Table renderer.
	 * @namespace
	 */
	var TableRenderer = {};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oTable an object representation of the control that should be rendered
	 */
	TableRenderer.render = function(rm, oTable) {
		// create the rows of the table
		// (here we could think about a swith to allow the programmatic usage of the table)
		oTable._createRows();

		// basic table div
		rm.write("<div");
		if (oTable._bAccMode) {
			var aAriaOwnsIds = [];
			if (oTable.getToolbar()) {
				aAriaOwnsIds.push(oTable.getToolbar().getId());
			}
			aAriaOwnsIds.push(oTable.getId() + "-table");
			rm.writeAttribute("aria-owns", aAriaOwnsIds.join(" "));
			rm.writeAttribute("aria-readonly", "true");
			if (oTable.getTitle()) {
				rm.writeAttribute("aria-labelledby", oTable.getTitle().getId());
			}
			if (oTable.getSelectionMode() === sap.ui.table.SelectionMode.Multi) {
				rm.writeAttribute("aria-multiselectable", "true");
			}
		}
		rm.writeControlData(oTable);
		rm.addClass("sapUiTable");
		rm.addClass("sapUiTableSelMode" + oTable.getSelectionMode());
		if (oTable.getColumnHeaderVisible()) {
			rm.addClass("sapUiTableCHdr"); // show column headers
		}
		if (oTable.getSelectionMode() !== sap.ui.table.SelectionMode.None &&
				oTable.getSelectionBehavior() !== sap.ui.table.SelectionBehavior.RowOnly) {
			rm.addClass("sapUiTableRSel"); // show row selector
		}
		rm.addClass("sapUiTableSelMode" + oTable.getSelectionMode()); // row selection mode
		//rm.addClass("sapUiTableHScr"); // show horizontal scrollbar
		if (oTable.getNavigationMode() === sap.ui.table.NavigationMode.Scrollbar) {
			rm.addClass("sapUiTableVScr"); // show vertical scrollbar
		}
		if (oTable.getEditable()) {
			rm.addClass("sapUiTableEdt"); // editable (background color)
		}
		rm.addClass("sapUiTableShNoDa");
		if (oTable.getShowNoData() && oTable._getRowCount() === 0) {
			rm.addClass("sapUiTableEmpty"); // no data!
		}
		if (oTable.getEnableGrouping()) {
			rm.addClass("sapUiTableGrouping");
		}
		rm.writeClasses();
		if (oTable.getWidth()) {
			rm.addStyle("width", oTable.getWidth());
		}
		rm.writeStyles();
		rm.write(">");

		if (oTable.getTitle()) {
			this.renderHeader(rm, oTable, oTable.getTitle());
		}

		if (oTable.getToolbar()) {
			this.renderToolbar(rm, oTable, oTable.getToolbar());
		}

		if (oTable.getExtension() && oTable.getExtension().length > 0) {
			this.renderExtensions(rm, oTable, oTable.getExtension());
		}

		rm.write("<div");
		rm.addClass("sapUiTableCnt");
		rm.writeClasses();
		// Define group for F6 handling
		rm.writeAttribute("data-sap-ui-fastnavgroup", "true");
		if (oTable._bAccMode) {
			rm.writeAttribute("aria-describedby", oTable.getId() + "-ariacount");
		}
		rm.write(">");

		this.renderColHdr(rm, oTable);

		this.renderTable(rm, oTable);

		if (oTable._bAccMode) {
			// aria description for the row count
			rm.write("<span");
			rm.writeAttribute("id", oTable.getId() + "-ariadesc");
			rm.addStyle("position", "absolute");
			rm.addStyle("top", "-20000px");
			rm.writeStyles();
			rm.write(">");
			rm.write(oTable._oResBundle.getText("TBL_TABLE"));
			rm.write("</span>");
			// aria description for the row count
			rm.write("<span");
			rm.writeAttribute("id", oTable.getId() + "-ariacount");
			rm.addStyle("position", "absolute");
			rm.addStyle("top", "-20000px");
			rm.writeStyles();
			rm.write(">");
			rm.write("</span>");
			// aria description for toggling the edit mode
			rm.write("<span");
			rm.writeAttribute("id", oTable.getId() + "-toggleedit");
			rm.addStyle("position", "absolute");
			rm.addStyle("top", "-20000px");
			rm.writeStyles();
			rm.write(">");
			rm.write(oTable._oResBundle.getText("TBL_TOGGLE_EDIT_KEY"));
			rm.write("</span>");
			// aria description for row selection behavior with no line selected
			rm.write("<span");
			rm.writeAttribute("id", oTable.getId() + "-selectrow");
			rm.addStyle("position", "absolute");
			rm.addStyle("top", "-20000px");
			rm.writeStyles();
			rm.write(">");
			rm.write(oTable._oResBundle.getText("TBL_ROW_SELECT_KEY"));
			rm.write("</span>");
			// aria description for row selection behavior with line selected
			rm.write("<span");
			rm.writeAttribute("id", oTable.getId() + "-selectrowmulti");
			rm.addStyle("position", "absolute");
			rm.addStyle("top", "-20000px");
			rm.writeStyles();
			rm.write(">");
			rm.write(oTable._oResBundle.getText("TBL_ROW_SELECT_MULTI_KEY"));
			rm.write("</span>");
			// aria description for row deselection behavior with no line selected
			rm.write("<span");
			rm.writeAttribute("id", oTable.getId() + "-deselectrow");
			rm.addStyle("position", "absolute");
			rm.addStyle("top", "-20000px");
			rm.writeStyles();
			rm.write(">");
			rm.write(oTable._oResBundle.getText("TBL_ROW_DESELECT_KEY"));
			rm.write("</span>");
			// aria description for row deselection behavior with line selected
			rm.write("<span");
			rm.writeAttribute("id", oTable.getId() + "-deselectrowmulti");
			rm.addStyle("position", "absolute");
			rm.addStyle("top", "-20000px");
			rm.writeStyles();
			rm.write(">");
			rm.write(oTable._oResBundle.getText("TBL_ROW_DESELECT_MULTI_KEY"));
			rm.write("</span>");
		}

		rm.write("</div>");

		if (oTable.getNavigationMode() === sap.ui.table.NavigationMode.Paginator) {
			rm.write("<div");
			rm.addClass("sapUiTablePaginator");
			rm.writeClasses();
			rm.write(">");
			if (!oTable._oPaginator) {
				jQuery.sap.require("sap.ui.commons.Paginator");
				oTable._oPaginator = new sap.ui.commons.Paginator(oTable.getId() + "-paginator");
				oTable._oPaginator.attachPage(jQuery.proxy(oTable.onvscroll, oTable));
			}
			rm.renderControl(oTable._oPaginator);
			rm.write("</div>");
		}

		if (oTable.getFooter()) {
			this.renderFooter(rm, oTable, oTable.getFooter());
		}

		if (oTable.getVisibleRowCountMode() == sap.ui.table.VisibleRowCountMode.Interactive) {
			this.renderVariableHeight(rm ,oTable);
		}

		rm.write("</div>");

	};

	// =============================================================================
	// BASIC AREAS OF THE TABLE
	// =============================================================================

	TableRenderer.renderHeader = function(rm, oTable, oTitle) {
		rm.write("<div");
		rm.addClass("sapUiTableHdr");
		rm.writeClasses();
		if (oTable._bAccMode) {
			rm.writeAttribute("role", "heading");
		}
		rm.write(">");

		rm.renderControl(oTitle);

		rm.write("</div>");
	};

	TableRenderer.renderToolbar = function(rm, oTable, oToolbar) {
		rm.write("<div");
		rm.addClass("sapUiTableTbr");
		if (typeof oToolbar.getStandalone !== "function") {
			// for the mobile toolbar we add another class
			rm.addClass("sapUiTableMTbr");
		}
		rm.writeClasses();
		rm.write(">");

		// toolbar has to be embedded (not standalone)!
		if (typeof oToolbar.getStandalone === "function" && oToolbar.getStandalone()) {
			oToolbar.setStandalone(false);
		}

		rm.renderControl(oToolbar);

		rm.write("</div>");
	};

	TableRenderer.renderExtensions = function(rm, oTable, aExtensions) {
		for (var i = 0, l = aExtensions.length; i < l; i++) {
			this.renderExtension(rm, oTable, aExtensions[i]);
		}
	};

	TableRenderer.renderExtension = function(rm, oTable, oExtension) {
		rm.write("<div");
		rm.addClass("sapUiTableExt");
		rm.writeClasses();
		rm.write(">");

		rm.renderControl(oExtension);

		rm.write("</div>");
	};

	TableRenderer.renderTable = function(rm, oTable) {
		rm.write("<div");
		rm.addClass("sapUiTableCCnt");
		rm.writeClasses();
		rm.write(">");

		rm.write("<div");
		rm.addClass("sapUiTableCtrlBefore");
		rm.writeClasses();
		rm.writeAttribute("tabindex", "0");
		rm.write("></div>");

		this.renderRowHdr(rm, oTable);
		this.renderTableCtrl(rm, oTable);
		this.renderVSb(rm, oTable);

		rm.write("</div>");

		this.renderHSb(rm, oTable);

	};

	TableRenderer.renderFooter = function(rm, oTable, oFooter) {
		rm.write("<div");
		rm.addClass("sapUiTableFtr");
		rm.writeClasses();
		rm.write(">");

		rm.renderControl(oFooter);

		rm.write("</div>");
	};

	TableRenderer.renderVariableHeight = function(rm, oTable) {
		rm.write('<div id="' + oTable.getId() + '-sb" tabIndex="-1"');
		rm.addClass("sapUiTableSplitterBar");
		rm.addStyle("height", "5px");
		rm.writeClasses();
		rm.writeStyles();
		rm.write(">");
		rm.write("</div>");
	};

	// =============================================================================
	// COLUMN HEADER OF THE TABLE
	// =============================================================================

	TableRenderer.renderColHdr = function(rm, oTable) {

		rm.write("<div");
		rm.addClass("sapUiTableColHdrCnt");
		rm.writeClasses();
		if (oTable.getColumnHeaderHeight() > 0) {
			rm.addStyle("height", (oTable.getColumnHeaderHeight() * oTable._getHeaderRowCount()) + "px");
		}
		if (oTable._bAccMode &&
			 (oTable.getSelectionMode() === sap.ui.table.SelectionMode.None ||
					 oTable.getSelectionBehavior() === sap.ui.table.SelectionBehavior.RowOnly)) {
			rm.writeAttribute("role", "row");
		}
		rm.writeStyles();
		rm.write(">");

		this.renderColRowHdr(rm, oTable);

		var aCols = oTable.getColumns();

		if (oTable.getFixedColumnCount() > 0) {
			rm.write("<div");
			rm.addClass("sapUiTableColHdrFixed");
			rm.writeClasses();
			rm.write(">");

			for (var h = 0; h < oTable._getHeaderRowCount(); h++) {

				rm.write("<div");
				rm.addClass("sapUiTableColHdr");
				rm.writeClasses();
				rm.addStyle("min-width", oTable._getColumnsWidth(0, oTable.getFixedColumnCount()) + "px");
				rm.writeStyles();
				rm.write(">");

				var iSpan = 1;
				for (var i = 0, l = oTable.getFixedColumnCount(); i < l; i++) {
					if (aCols[i] && aCols[i].shouldRender()) {
						if (iSpan <= 1) {
							this.renderCol(rm, oTable, aCols[i], i, h);
							var aHeaderSpan = aCols[i].getHeaderSpan();
							if (jQuery.isArray(aHeaderSpan)) {
								iSpan = aCols[i].getHeaderSpan()[h] + 1;
							} else {
								iSpan = aCols[i].getHeaderSpan() + 1;
							}
						} else {
							//Render column header but this is invisible because of the span
							this.renderCol(rm, oTable, aCols[i], i, h, true);
						}
						if (h == 0) {
							this.renderColRsz(rm, oTable, aCols[i], i);
						}
						iSpan--;
					}
				}

				rm.write("<p style=\"clear: both;\"></p>");
				rm.write("</div>");

			}

			rm.write("</div>");
		}

		rm.write("<div");
		rm.addClass("sapUiTableColHdrScr");
		rm.writeClasses();
		if (oTable.getFixedColumnCount() > 0) {
			if (oTable._bRtlMode) {
				rm.addStyle("margin-right", "0");
			} else {
				rm.addStyle("margin-left", "0");
			}
			rm.writeStyles();
		}
		rm.write(">");

		for (var h = 0; h < oTable._getHeaderRowCount(); h++) {

			rm.write("<div");
			rm.addClass("sapUiTableColHdr");
			rm.writeClasses();
			rm.addStyle("min-width", oTable._getColumnsWidth(oTable.getFixedColumnCount(), aCols.length) + "px");
			rm.writeStyles();
			rm.write(">");

			var iSpan = 1;
			for (var i = oTable.getFixedColumnCount(), l = aCols.length; i < l; i++) {
				if (aCols[i].shouldRender()) {
					if (iSpan <= 1) {
						this.renderCol(rm, oTable, aCols[i], i, h);
						var aHeaderSpan = aCols[i].getHeaderSpan();
						if (jQuery.isArray(aHeaderSpan)) {
							iSpan = aCols[i].getHeaderSpan()[h] + 1;
						} else {
							iSpan = aCols[i].getHeaderSpan() + 1;
						}
					} else {
						//Render column header but this is invisible because of the span
						this.renderCol(rm, oTable, aCols[i], i, h, true);
					}
					if (h == 0) {
						this.renderColRsz(rm, oTable, aCols[i], i);
					}
					iSpan--;
				}
			}

			rm.write("<p style=\"clear: both;\"></p>");
			rm.write("</div>");

		}

		rm.write("</div>");

		rm.write("</div>");

	};

	TableRenderer.renderColRowHdr = function(rm, oTable) {
		rm.write("<div");
		rm.writeAttribute("id", oTable.getId() + "-selall");
		var oSelMode = oTable.getSelectionMode();
		if ((oSelMode == "Multi" || oSelMode == "MultiToggle") && oTable.getEnableSelectAll()) {
			rm.writeAttributeEscaped("title", oTable._oResBundle.getText("TBL_SELECT_ALL"));
			if (oTable._getSelectableRowCount() == 0 || oTable._getSelectableRowCount() !== oTable.getSelectedIndices().length) {
				rm.addClass("sapUiTableSelAll");
			}
			rm.addClass("sapUiTableSelAllEnabled");
		}
		rm.addClass("sapUiTableColRowHdr");
		rm.writeClasses();
		if (oTable._bAccMode) {
			rm.writeAttribute("tabindex", "-1");
			rm.writeAttributeEscaped("aria-label", oTable._oResBundle.getText("TBL_SELECT_ALL_KEY"));
		}
		rm.write(">");
		if (oTable.getSelectionMode() !== sap.ui.table.SelectionMode.Single) {
			rm.write("<div");
			rm.addClass("sapUiTableColRowHdrIco");
			rm.writeClasses();
			if (oTable.getColumnHeaderHeight() > 0) {
				rm.addStyle("height", oTable.getColumnHeaderHeight() + "px");
			}
			rm.write(">");
			rm.write("</div>");
		}
		rm.write("</div>");
	};

	TableRenderer.renderCol = function(rm, oTable, oColumn, iIndex, iHeader, bInvisible) {
		var oLabel;
		if (oColumn.getMultiLabels().length > 0) {
			oLabel = oColumn.getMultiLabels()[iHeader];
		} else if (iHeader == 0) {
			oLabel = oColumn.getLabel();
		}

		rm.write("<div");
		if (iHeader === 0) {
			rm.writeElementData(oColumn);
		} else {
			// TODO: we need a writeElementData with suffix - it is another HTML element
			//       which belongs to the same column but it is not in one structure!
			rm.writeAttribute('id', oColumn.getId() + "_" + iHeader);
		}
		rm.writeAttribute('data-sap-ui-colid', oColumn.getId());
		rm.writeAttribute("data-sap-ui-colindex", iIndex);
		if (oTable._bAccMode) {
			if (!!sap.ui.Device.browser.internet_explorer) {
				rm.writeAttribute("role", "columnheader");
			}
			// TODO: determine if the column has a column menu
			rm.writeAttribute("aria-haspopup", "true");
			rm.writeAttribute("tabindex", "-1");
		}
		rm.addClass("sapUiTableCol");
		rm.writeClasses();
		rm.addStyle("width", oColumn.getWidth());
		if (oTable.getColumnHeaderHeight() > 0) {
			rm.addStyle("height", oTable.getColumnHeaderHeight() + "px");
		}
		if (bInvisible) {
			rm.addStyle("display", "none");
		}
		rm.writeStyles();
		var sTooltip = oColumn.getTooltip_AsString();
		if (sTooltip) {
			rm.writeAttributeEscaped("title", sTooltip);
		}
		rm.write("><div");
		rm.addClass("sapUiTableColCell");
		rm.writeClasses();
		var sHAlign = this.getHAlign(oColumn.getHAlign(), oTable._bRtlMode);
		if (sHAlign) {
			rm.addStyle("text-align", sHAlign);
		}
		rm.writeStyles();
		rm.write(">");

		// TODO: rework column sort / filter status integration
		rm.write("<div id=\"" + oColumn.getId() + "-icons\" class=\"sapUiTableColIcons\"></div>");

		if (oLabel) {
			rm.renderControl(oLabel);
		}

		rm.write("</div></div>");
	};

	TableRenderer.renderColRsz = function(rm, oTable, oColumn, iIndex) {
		if (oColumn.getResizable()) {
			rm.write("<div");
			rm.writeAttribute("id", oColumn.getId() + "-rsz");
			rm.writeAttribute("data-sap-ui-colindex", iIndex);
			rm.writeAttribute("tabindex", "-1");
			rm.addClass("sapUiTableColRsz");
			rm.writeClasses();
			rm.addStyle("left", oTable._bRtlMode ? "99000px" : "-99000px");
			rm.writeStyles();
			rm.write("></div>");
		}
	};


	// =============================================================================
	// CONTENT AREA OF THE TABLE
	// =============================================================================

	TableRenderer.renderRowHdr = function(rm, oTable) {
		rm.write("<div");
		rm.addClass("sapUiTableRowHdrScr");
		rm.writeClasses();
		rm.write(">");

		// start with the first current top visible row
		for (var row = 0, count = oTable.getRows().length; row < count; row++) {
			this.renderRowHdrRow(rm, oTable, oTable.getRows()[row], row);
		}

		rm.write("</div>");
	};

	TableRenderer.renderRowHdrRow = function(rm, oTable, oRow, iRowIndex) {
		rm.write("<div");
		rm.writeAttribute("id", oTable.getId() + "-rowsel" + iRowIndex);
		rm.writeAttribute("data-sap-ui-rowindex", iRowIndex);
		rm.addClass("sapUiTableRowHdr");
		if (oRow._bHidden) {
			rm.addClass("sapUiTableRowHidden");
		}
		rm.writeClasses();
		if (oTable.getRowHeight() > 0) {
			rm.addStyle("height", oTable.getRowHeight() + "px");
		}
		if (oTable._bAccMode) {
			// defined via ARIA spec but not yet supported
			var aCellIds = [];
			jQuery.each(oRow.getCells(), function(iIndex, oCell) {
				aCellIds.push(oRow.getId() + "-col" + iIndex);
			});
			if (oTable.getSelectionMode() === sap.ui.table.SelectionMode.Multi) {
				rm.writeAttribute("aria-selected", "false");
			}
			if (oTable.getSelectionMode() !== sap.ui.table.SelectionMode.None) {
				rm.writeAttributeEscaped("title", oTable._oResBundle.getText("TBL_ROW_SELECT"));
				if (oTable.getSelectionMode() === sap.ui.table.SelectionMode.Multi && oTable._oSelection.getSelectedIndices().length > 1) {
					rm.writeAttributeEscaped("aria-label", oTable._oResBundle.getText("TBL_ROW_SELECT_MULTI_KEY"));
				} else {
					rm.writeAttributeEscaped("aria-label", oTable._oResBundle.getText("TBL_ROW_SELECT_KEY"));
				}
			}
			rm.writeAttribute("tabindex", "-1");
		}
		rm.writeStyles();
		rm.write("></div>");
	};

	TableRenderer.renderTableCtrl = function(rm, oTable) {

		if (oTable.getFixedColumnCount() > 0) {
			rm.write("<div");
			rm.addClass("sapUiTableCtrlScrFixed");
			rm.writeClasses();
			rm.write(">");

			this.renderTableControl(rm, oTable, true);

			rm.write("</div>");
		}

		rm.write("<div");
		rm.addClass("sapUiTableCtrlScr");
		rm.writeClasses();
		if (oTable.getFixedColumnCount() > 0) {
			if (oTable._bRtlMode) {
				rm.addStyle("margin-right", "0");
			} else {
				rm.addStyle("margin-left", "0");
			}
			rm.writeStyles();
		}
		rm.write(">");

		rm.write("<div");
		rm.addClass("sapUiTableCtrlCnt");
		rm.writeClasses();
		rm.write(">");

		this.renderTableControl(rm, oTable, false);

		rm.write("</div>");

		rm.write("<div");
		rm.addClass("sapUiTableCtrlAfter");
		rm.writeClasses();
		rm.writeAttribute("tabindex", "0");
		rm.write("></div>");
		rm.write("</div>");

		rm.write("<div");
		rm.addClass("sapUiTableCtrlEmpty");
		rm.writeClasses();
		rm.writeAttribute("tabindex", "0");
		rm.write(">");
		if (oTable.getNoData() && oTable.getNoData() instanceof sap.ui.core.Control) {
			rm.renderControl(oTable.getNoData());
		} else {
			rm.write("<span");
			rm.addClass("sapUiTableCtrlEmptyMsg");
			rm.writeClasses();
			rm.write(">");
			if (typeof oTable.getNoData() === "string" || oTable.getNoData() instanceof String) {
				rm.writeEscaped(oTable.getNoData());
			} else if (oTable.getNoDataText()) {
				rm.writeEscaped(oTable.getNoDataText());
			} else {
				rm.writeEscaped(oTable._oResBundle.getText("TBL_NO_DATA"));
			}
			rm.write("</span>");
		}
		rm.write("</div>");
	};


	TableRenderer.renderTableControl = function(rm, oTable, bFixedTable) {
		var iStartColumn, iEndColumn;
		if (bFixedTable) {
			iStartColumn = 0;
			iEndColumn = oTable.getFixedColumnCount();
		} else {
			iStartColumn = oTable.getFixedColumnCount();
			iEndColumn = oTable.getColumns().length;
		}
		var iFixedRows = oTable.getFixedRowCount();
		var iFixedBottomRows = oTable.getFixedBottomRowCount();
		var aRows = oTable.getRows();

		if (iFixedRows > 0) {
			this.renderTableControlCnt(rm, oTable, bFixedTable, iStartColumn, iEndColumn, true, false, 0, iFixedRows);
		}
		this.renderTableControlCnt(rm, oTable, bFixedTable, iStartColumn, iEndColumn, false, false, iFixedRows, aRows.length - iFixedBottomRows);
		if (iFixedBottomRows > 0) {
			this.renderTableControlCnt(rm, oTable, bFixedTable, iStartColumn, iEndColumn, false, true, aRows.length - iFixedBottomRows, aRows.length);
		}
	};

	TableRenderer.renderTableControlCnt = function(rm, oTable, bFixedTable, iStartColumn, iEndColumn, bFixedRow, bFixedBottomRow, iStartRow, iEndRow) {
		rm.write("<table");
		var sId = oTable.getId() + "-table";
		if (bFixedTable) {
			sId += "-fixed";
			rm.addClass("sapUiTableCtrlFixed");
		} else {
			rm.addClass("sapUiTableCtrlScroll");
		}
		if (bFixedRow) {
			sId += "-fixrow";
			rm.addClass("sapUiTableCtrlRowFixed");
		} else if (bFixedBottomRow) {
			sId += "-fixrow-bottom";
			rm.addClass("sapUiTableCtrlRowFixedBottom");
		} else {
			rm.addClass("sapUiTableCtrlRowScroll");
		}
		rm.writeAttribute("id", sId);
		if (oTable._bAccMode) {
			rm.writeAttribute("role", "grid");
		}
		rm.addClass("sapUiTableCtrl");
		rm.writeClasses();
		rm.addStyle("min-width", oTable._getColumnsWidth(iStartColumn, iEndColumn) + "px");
		//Firefox and chrome and safari need a defined width for the fixed table
		if (bFixedTable && (!!sap.ui.Device.browser.firefox || !!sap.ui.Device.browser.chrome || !!sap.ui.Device.browser.safari)) {
			rm.addStyle("width", oTable._getColumnsWidth(iStartColumn, iEndColumn) + "px");
		}
		rm.writeStyles();
		rm.write(">");

		rm.write("<thead>");

		rm.write("<tr");
		rm.addClass("sapUiTableCtrlCol");
		if (iStartRow == 0) {
			rm.addClass("sapUiTableCtrlFirstCol");
		}
		rm.writeClasses();
		rm.write(">");

		var aCols = oTable.getColumns();
		if (oTable.getSelectionMode() !== sap.ui.table.SelectionMode.None &&
				oTable.getSelectionBehavior() !== sap.ui.table.SelectionBehavior.RowOnly) {
			rm.write("<th");
			rm.addStyle("width", "0px");
			rm.writeStyles();
			if (oTable._bAccMode && iStartRow == 0) {
				rm.writeAttribute("role", "columnheader");
				rm.writeAttribute("scope", "col");
				rm.writeAttribute("id", oTable.getId() + "_colsel");
			}
			rm.write("></th>");
		} else {
			if (aCols.length === 0) {
				// no cols => render th => avoids rendering issue in firefox
				rm.write("<th></th>");
			}
		}

		for (var col = iStartColumn, count = iEndColumn; col < count; col++) {
			var oColumn = aCols[col];
			if (oColumn && oColumn.shouldRender()) {
				rm.write("<th");
				rm.addStyle("width", oColumn.getWidth());
				rm.writeStyles();
				if (iStartRow == 0) {
					if (oTable._bAccMode) {
						rm.writeAttribute("aria-owns", oColumn.getId());
						rm.writeAttribute("aria-labelledby", oColumn.getId());
						rm.writeAttribute("role", "columnheader");
						rm.writeAttribute("scope", "col");
						rm.writeAttribute("id", oTable.getId() + "_col" + col);
					}
				}
				rm.writeAttribute("data-sap-ui-headcolindex", col);
				rm.write(">");
				if (iStartRow == 0) {
					if (oColumn.getMultiLabels().length > 0) {
						rm.renderControl(oColumn.getMultiLabels()[0]);
					} else {
						rm.renderControl(oColumn.getLabel());
					}
				}
				rm.write("</th>");
			}
		}

		// dummy column to fill the table width
		if (!bFixedTable && oTable._hasOnlyFixColumnWidths() && aCols.length > 0) {
			rm.write("<th></th>");
		}

		rm.write("</tr>");
		rm.write("</thead>");

		rm.write("<tbody>");

		// render the table rows
		var aRows = oTable.getRows();
		for (var row = iStartRow, count = iEndRow; row < count; row++) {
			this.renderTableRow(rm, oTable, aRows[row], row, bFixedTable, iStartColumn, iEndColumn, false);
		}

		rm.write("</tbody>");
		rm.write("</table>");
	};

	TableRenderer.renderTableRow = function(rm, oTable, oRow, iRowIndex, bFixedTable, iStartColumn, iEndColumn, bFixedRow) {

		rm.write("<tr");
		rm.addClass("sapUiTableTr");
		if (bFixedTable) {
			rm.writeAttribute("id", oRow.getId() + "-fixed");
		} else {
			rm.writeElementData(oRow);
		}
		if (oRow._bHidden) {
			rm.addClass("sapUiTableRowHidden");
		}
		if (iRowIndex % 2 === 0) {
			rm.addClass("sapUiTableRowEven");
		} else {
			rm.addClass("sapUiTableRowOdd");
		}
		rm.writeClasses();
		rm.writeAttribute("data-sap-ui-rowindex", iRowIndex);
		if (oTable.getRowHeight() > 0) {
			rm.addStyle("height", oTable.getRowHeight() + "px");
		}
		rm.writeStyles();
		if (oTable._bAccMode) {
			rm.writeAttribute("role", "row");
			if (oTable.getSelectionMode() === sap.ui.table.SelectionMode.Multi) {
				rm.writeAttribute("aria-selected", "false");
			}
	//		if (oTable.getSelectionMode() !== sap.ui.table.SelectionMode.None) {
	//			rm.writeAttributeEscaped("title", oTable._oResBundle.getText("TBL_ROW_SELECT"));
	//			rm.writeAttributeEscaped("aria-label", oTable._oResBundle.getText("TBL_ROW_SELECT_KEY"));
	//		}
		}
		rm.write(">");
		var aCells = oRow.getCells();
		if (oTable.getSelectionMode() !== sap.ui.table.SelectionMode.None &&
				oTable.getSelectionBehavior() !== sap.ui.table.SelectionBehavior.RowOnly) {
			rm.write("<td");
			if (oTable._bAccMode) {
				rm.writeAttribute("role", "gridcell");
				rm.writeAttribute("headers", oTable.getId() + "_colsel");
				rm.writeAttribute("aria-owns", oTable.getId() + "-rowsel" + iRowIndex);
				if (oTable.getSelectionMode() === sap.ui.table.SelectionMode.Multi) {
					rm.writeAttribute("aria-selected", "false");
				}
			}
			rm.write(">");
			if (oTable._bAccMode) {
				rm.write("<div");
				rm.addClass("sapUiTableAriaRowSel");
				rm.writeClasses();
				rm.write(">");
				rm.write(oTable._oResBundle.getText("TBL_ROW_SELECT_KEY"));
				rm.write("</div>");
			}
			rm.write("</td>");
		} else {
			if (aCells.length === 0) {
				rm.write("<td");
				if (oTable._bAccMode) {
					rm.writeAttribute("role", "gridcell");
					rm.writeAttribute("headers", oTable.getId() + "_colsel");
					rm.writeAttribute("aria-owns", oTable.getId() + "-rowsel" + iRowIndex);
					if (oTable.getSelectionMode() === sap.ui.table.SelectionMode.Multi) {
						rm.writeAttribute("aria-selected", "false");
					}
				}
				rm.write(">");
				if (oTable._bAccMode) {
					rm.write("<div");
					rm.addClass("sapUiTableAriaRowSel");
					rm.writeClasses();
					rm.write(">");
					rm.write(oTable._oResBundle.getText("TBL_ROW_SELECT_KEY"));
					rm.write("</div>");
				}
				rm.write("</td>");
			}
		}
		for (var cell = 0, count = aCells.length; cell < count; cell++) {
			this.renderTableCell(rm, oTable, oRow, aCells[cell], cell, bFixedTable, iStartColumn, iEndColumn);
		}
		if (!bFixedTable && oTable._hasOnlyFixColumnWidths() && aCells.length > 0) {
			rm.write("<td></td>");
		}
		rm.write("</tr>");

	};

	TableRenderer.renderTableCell = function(rm, oTable, oRow, oCell, iCellIndex, bFixedTable, iStartColumn, iEndColumn) {
		var iColIndex = oCell.data("sap-ui-colindex");
		var oColumn = oTable.getColumns()[iColIndex];
		if (oColumn.shouldRender() && iStartColumn <= iColIndex && iEndColumn > iColIndex) {
			rm.write("<td");
			var sId = oRow.getId() + "-col" + iCellIndex;
			rm.writeAttribute("id", sId);
			if (oTable._bAccMode) {
				// correct would be aria-labelledby but doesn't work for JAWS
				rm.writeAttribute("headers", oTable.getId() + "_col" + iColIndex);
				rm.writeAttribute("role", "gridcell");
				var sLabelledBy = oTable.getId() + "-ariadesc " + oColumn.getId();
				var iMultiLabels = oColumn.getMultiLabels().length;
				if (iMultiLabels > 1) {
					for (var i = 1; i < iMultiLabels; i++) {
						sLabelledBy +=  " " + oColumn.getId() + "_" + i;
					}
				}
				sLabelledBy +=  " " + oCell.getId();
				rm.writeAttribute("aria-labelledby", sLabelledBy);
				rm.writeAttribute("aria-describedby", oTable.getId() + "-toggleedit");
				rm.writeAttribute("aria-activedescendant", oCell.getId());
				rm.writeAttribute("tabindex", "-1");
				if (oTable.getSelectionMode() === sap.ui.table.SelectionMode.Multi) {
					rm.writeAttribute("aria-selected", "false");
				}
			}
			var sHAlign = this.getHAlign(oColumn.getHAlign(), oTable._bRtlMode);
			if (sHAlign) {
				rm.addStyle("text-align", sHAlign);
			}
			rm.writeStyles();
			var aVisibleColumns = oTable._getVisibleColumns();
			if (aVisibleColumns.length > 0 && aVisibleColumns[0] === oColumn) {
				rm.addClass("sapUiTableTdFirst");
			}
			// grouping support to show/hide values of grouped columns
			if (oColumn.getGrouped()) {
				rm.addClass("sapUiTableTdGroup");
			}
			rm.writeClasses();
			rm.write("><div");
			rm.addClass("sapUiTableCell");
			
			rm.writeClasses();
			
			if (oTable.getRowHeight() && oTable.getVisibleRowCountMode() == sap.ui.table.VisibleRowCountMode.Auto) {
				rm.addStyle("height", oTable.getRowHeight() + "px");
				rm.addStyle("max-height", oTable.getRowHeight() + "px");
			}
			rm.writeStyles();
			
			rm.write(">");
			this.renderTableCellControl(rm, oTable, oCell, iCellIndex);
			rm.write("</div></td>");
		}
	};

	TableRenderer.renderTableCellControl = function(rm, oTable, oCell, iCellIndex) {
		rm.renderControl(oCell);
	};

	TableRenderer.renderVSb = function(rm, oTable) {
		rm.write("<div");
		rm.addClass("sapUiTableVSb");
		rm.writeClasses();
		rm.write(">");
		rm.renderControl(oTable._oVSb);
		rm.write("</div>");
	};

	TableRenderer.renderHSb = function(rm, oTable) {
		rm.write("<div");
		rm.addClass("sapUiTableHSb");
		rm.writeClasses();
		rm.write(">");
		rm.renderControl(oTable._oHSb);
		rm.write("</div>");
	};


	// =============================================================================
	// HELPER FUNCTIONALITY
	// =============================================================================

	/**
	 * Returns the value for the HTML "align" attribute according to the given
	 * horizontal alignment and RTL mode, or NULL if the HTML default is fine.
	 *
	 * @param {sap.ui.core.HorizontalAlign} oHAlign
	 * @param {boolean} bRTL
	 * @type string
	 */
	TableRenderer.getHAlign = function(oHAlign, bRTL) {
	  switch (oHAlign) {
		case sap.ui.core.HorizontalAlign.Center:
		  return "center";
		case sap.ui.core.HorizontalAlign.End:
		case sap.ui.core.HorizontalAlign.Right:
		  return bRTL ? "left" : "right";
	  }
	  // case sap.ui.core.HorizontalAlign.Left:
	  // case sap.ui.core.HorizontalAlign.Begin:
	  return bRTL ? "right" : "left";
	};


	return TableRenderer;

}, /* bExport= */ true);
