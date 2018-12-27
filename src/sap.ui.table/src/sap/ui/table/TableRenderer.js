/*!
 * ${copyright}
 */

//Provides default renderer for control sap.ui.table.Table
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Control', 'sap/ui/core/theming/Parameters', 'sap/ui/Device', './library', './TableUtils', 'sap/ui/core/Renderer', 'sap/ui/core/IconPool'],
	function(jQuery, Control, Parameters, Device, library, TableUtils, Renderer, IconPool) {
	"use strict";


	// shortcuts
	var SelectionMode = library.SelectionMode,
		VisibleRowCountMode = library.VisibleRowCountMode;

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
		// basic table div
		rm.write("<div");
		oTable._getAccRenderExtension().writeAriaAttributesFor(rm, oTable, "ROOT");
		rm.writeControlData(oTable);
		rm.addClass("sapUiTable");
		if ('ontouchstart' in document) {
			rm.addClass("sapUiTableTouch");
		}
		rm.addClass("sapUiTableSelMode" + oTable.getSelectionMode());

		if (oTable.getColumnHeaderVisible()) {
			rm.addClass("sapUiTableCHdr"); // show column headers
		}
		if (TableUtils.hasRowHeader(oTable)) {
			rm.addClass("sapUiTableRSel"); // show row selector
		}

		// This class flags whether the sap.m. library is loaded or not.
		var sSapMTableClass = library.TableHelper.addTableClass();
		if (sSapMTableClass) {
			rm.addClass(sSapMTableClass);
		}

		if (oTable._isVSbRequired()) {
			rm.addClass("sapUiTableVScr"); // show vertical scrollbar
		}
		if (oTable.getEditable()) {
			rm.addClass("sapUiTableEdt"); // editable (background color)
		}

		if (TableUtils.isNoDataVisible(oTable)) {
			rm.addClass("sapUiTableEmpty"); // no data!
		}

		if (oTable.getShowOverlay()) {
			rm.addClass("sapUiTableOverlay");
		}

		var sModeClass = TableUtils.Grouping.getModeCssClass(oTable);
		if (sModeClass) {
			rm.addClass(sModeClass);
		}

		if (oTable.getWidth()) {
			rm.addStyle("width", oTable.getWidth());
		}

		if (oTable.getVisibleRowCountMode() == VisibleRowCountMode.Auto) {
			rm.addStyle("height", "0px");
			if (oTable._bFirstRendering) {
				rm.addClass("sapUiTableNoOpacity");
			}
		}

		rm.writeClasses();
		rm.writeStyles();
		rm.write(">");

		this.renderTabElement(rm, "sapUiTableOuterBefore");

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
		rm.writeAttribute("id", oTable.getId() + "-sapUiTableCnt");
		rm.addClass("sapUiTableCnt");
		rm.writeClasses();

		oTable._getAccRenderExtension().writeAriaAttributesFor(rm, oTable, "CONTENT");

		// Define group for F6 handling
		rm.writeAttribute("data-sap-ui-fastnavgroup", "true");
		rm.write(">");

		this.renderColRsz(rm, oTable);
		this.renderColHdr(rm, oTable);
		this.renderTable(rm, oTable);

		oTable._getAccRenderExtension().writeHiddenAccTexts(rm, oTable);

		rm.write("<div");
		rm.addClass("sapUiTableOverlayArea");
		rm.writeClasses();
		rm.writeAttribute("tabindex", "0");
		rm.writeAttribute("id", oTable.getId() + "-overlay");
		oTable._getAccRenderExtension().writeAriaAttributesFor(rm, oTable, "OVERLAY");
		rm.write("></div>");

		rm.write("</div>");

		if (oTable.getFooter()) {
			this.renderFooter(rm, oTable, oTable.getFooter());
		}

		if (oTable.getVisibleRowCountMode() == VisibleRowCountMode.Interactive) {
			this.renderVariableHeight(rm ,oTable);
		}

		this.renderTabElement(rm, "sapUiTableOuterAfter");

		rm.write("</div>");
	};

	// =============================================================================
	// BASIC AREAS OF THE TABLE
	// =============================================================================

	TableRenderer.renderHeader = function(rm, oTable, oTitle) {
		rm.write("<div");
		rm.addClass("sapUiTableHdr");
		rm.writeClasses();
		oTable._getAccRenderExtension().writeAriaAttributesFor(rm, oTable, "TABLEHEADER");
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
		oTable._getAccRenderExtension().writeAriaAttributesFor(rm, oTable, "TABLESUBHEADER");
		rm.write(">");

		// toolbar has to be embedded (not standalone)!
		if (typeof oToolbar.getStandalone === "function" && oToolbar.getStandalone()) {
			oToolbar.setStandalone(false);
		}

		// set the default design of the toolbar
		if (TableUtils.isInstanceOf(oToolbar, "sap/m/Toolbar")) {
			oToolbar.setDesign(Parameters.get("sapUiTableToolbarDesign"), true);
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
		oTable._getAccRenderExtension().writeAriaAttributesFor(rm, oTable, "TABLESUBHEADER");
		rm.write(">");

		rm.renderControl(oExtension);

		rm.write("</div>");
	};

	TableRenderer.renderTable = function(rm, oTable) {
		rm.write("<div");
		rm.writeAttribute("id", oTable.getId() + "-tableCCnt");
		rm.addClass("sapUiTableCCnt");
		rm.writeClasses();
		rm.write(">");

		this.renderTableCCnt(rm, oTable);
		rm.write("</div>");
		this.renderVSb(rm, oTable);
		this.renderHSb(rm, oTable);
	};

	TableRenderer.renderTableCCnt = function(rm, oTable) {
		this.renderTabElement(rm, "sapUiTableCtrlBefore");
		this.renderTableCtrl(rm, oTable);
		this.renderRowHdr(rm, oTable);
		this.renderTabElement(rm, "sapUiTableCtrlAfter");

		rm.write("<div");
		rm.addClass("sapUiTableCtrlEmpty");
		rm.writeClasses();
		rm.writeAttribute("tabindex", "0");
		rm.writeAttribute("id", oTable.getId() + "-noDataCnt");
		oTable._getAccRenderExtension().writeAriaAttributesFor(rm, oTable, "NODATA");
		rm.write(">");
		if (oTable.getNoData() instanceof Control) {
			rm.renderControl(oTable.getNoData());
		} else {
			rm.write("<span");
			rm.writeAttribute("id", oTable.getId() + "-noDataMsg");
			rm.addClass("sapUiTableCtrlEmptyMsg");
			rm.writeClasses();
			rm.write(">");
			rm.writeEscaped(TableUtils.getNoDataText(oTable));
			rm.write("</span>");
		}
		rm.write("</div>");
	};

	TableRenderer.renderFooter = function(rm, oTable, oFooter) {
		rm.write("<div");
		rm.addClass("sapUiTableFtr");
		rm.writeClasses();
		oTable._getAccRenderExtension().writeAriaAttributesFor(rm, oTable, "TABLEFOOTER");
		rm.write(">");

		rm.renderControl(oFooter);

		rm.write("</div>");
	};

	TableRenderer.renderVariableHeight = function(rm, oTable) {
		rm.write('<div id="' + oTable.getId() + '-sb" tabIndex="-1"');
		rm.addClass("sapUiTableHeightResizer");
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
		var nRows = TableUtils.getHeaderRowCount(oTable);
		var aCols = oTable.getColumns();
		var iFixedColumnCount = oTable.getFixedColumnCount();

		rm.write("<div");
		rm.addClass("sapUiTableColHdrCnt");
		rm.writeClasses();
		if (oTable.getColumnHeaderHeight() > 0) {
			rm.addStyle("height", (oTable.getColumnHeaderHeight() * nRows) + "px");
		}
		rm.writeStyles();
		rm.write(">");

		this.renderColRowHdr(rm, oTable);

		if (iFixedColumnCount > 0) {
			rm.write("<div");
			rm.addClass("sapUiTableCHA"); // marker for the column header area
			rm.addClass("sapUiTableCtrlScrFixed");
			rm.addClass("sapUiTableNoOpacity");
			rm.writeClasses();
			rm.write(">");

			//
			// write fixed table here
			//
			this.renderTableControlCnt(rm, oTable, true, 0, iFixedColumnCount, true, false, 0, nRows, true);
			rm.write("</div>");
		}

		rm.write("<div");
		rm.writeAttribute("id", oTable.getId() + "-sapUiTableColHdrScr");
		rm.addClass("sapUiTableCHA"); // marker for the column header area
		rm.addClass("sapUiTableCtrlScr");
		if (aCols.length == 0) {
			rm.addClass("sapUiTableHasNoColumns");
		}
		rm.writeClasses();
		if (iFixedColumnCount > 0) {
			if (oTable._bRtlMode) {
				rm.addStyle("margin-right", "0");
			} else {
				rm.addStyle("margin-left", "0");
			}
			rm.writeStyles();
		}
		rm.write(">");

		//
		// write scrollable table here
		//
		this.renderTableControlCnt(rm, oTable, false, iFixedColumnCount, aCols.length, false, false, 0, nRows, true);

		rm.write("</div>");

		rm.write("</div>");

	};

	TableRenderer.renderColRowHdr = function(rm, oTable) {
		var bEnabled = false;
		var bSelAll = false;

		rm.write("<div");
		rm.writeAttribute("id", oTable.getId() + "-selall");

		if (TableUtils.hasSelectAll(oTable)) {
			var bAllRowsSelected = TableUtils.areAllRowsSelected(oTable);
			var sSelectAllResourceTextID = bAllRowsSelected ? "TBL_DESELECT_ALL" : "TBL_SELECT_ALL";

			rm.writeAttributeEscaped("title", oTable._oResBundle.getText(sSelectAllResourceTextID));
			if (!bAllRowsSelected) {
				rm.addClass("sapUiTableSelAll");
			} else {
				bSelAll = true;
			}
			rm.addClass("sapUiTableSelAllEnabled");
			bEnabled = true;
		} else {
			rm.addClass("sapUiTableSelAllDisabled");
		}

		rm.addClass("sapUiTableColRowHdr");
		rm.writeClasses();

		rm.writeAttribute("tabindex", "-1");

		oTable._getAccRenderExtension().writeAriaAttributesFor(rm, oTable, "COLUMNROWHEADER", {enabled: bEnabled, checked: bSelAll});

		rm.write(">");
		if (oTable.getSelectionMode() !== SelectionMode.Single) {
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

	TableRenderer.renderCol = function(rm, oTable, oColumn, iIndex, iHeader, nSpan, bInvisible) {
		var oLabel,
			aLabels = oColumn.getMultiLabels();
		if (aLabels.length > 0) {
			oLabel = aLabels[iHeader];
		} else if (iHeader == 0) {
			oLabel = oColumn.getLabel();
		}

		rm.write("<td");
		var sHeaderId = oColumn.getId();
		if (iHeader === 0) {
			rm.writeElementData(oColumn);
		} else {
			// TODO: we need a writeElementData with suffix - it is another HTML element
			//       which belongs to the same column but it is not in one structure!
			sHeaderId = sHeaderId + "_" + iHeader;
			rm.writeAttribute('id', sHeaderId);
		}
		rm.writeAttribute('data-sap-ui-colid', oColumn.getId());
		rm.writeAttribute("data-sap-ui-colindex", iIndex);

		rm.writeAttribute("tabindex", "-1");

		if (!bInvisible && nSpan > 1) {
			rm.writeAttribute("colspan", nSpan);
		}

		oTable._getAccRenderExtension().writeAriaAttributesFor(rm, oTable, "COLUMNHEADER", {
			column: oColumn,
			headerId: sHeaderId,
			index: iIndex
		});

		rm.addClass("sapUiTableCol");
		if (oTable.getFixedColumnCount() === iIndex + 1) {
			rm.addClass("sapUiTableColLastFixed");
		}

		rm.writeClasses();
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
		var sHAlign = Renderer.getTextAlign(oColumn.getHAlign(), oLabel && oLabel.getTextDirection && oLabel.getTextDirection());
		if (sHAlign) {
			rm.addStyle("text-align", sHAlign);
		}
		rm.writeStyles();
		rm.write(">");

		if (oLabel) {
			rm.renderControl(oLabel);
		}

		rm.write("</div></td>");
	};

	TableRenderer.renderColRsz = function(rm, oTable) {
		rm.write("<div");
		rm.writeAttribute("id", oTable.getId() + "-rsz");
		rm.writeAttribute("tabindex", "-1");
		rm.addClass("sapUiTableColRsz");
		rm.writeClasses();
		rm.write("></div>");
	};

	// =============================================================================
	// CONTENT AREA OF THE TABLE
	// =============================================================================

	TableRenderer.renderRowHdr = function(rm, oTable) {
		rm.write("<div");
		rm.writeAttribute("id", oTable.getId() + "-sapUiTableRowHdrScr");
		rm.addClass("sapUiTableRowHdrScr");
		rm.addClass("sapUiTableNoOpacity");
		rm.writeClasses();
		oTable._getAccRenderExtension().writeAriaAttributesFor(rm, oTable, "ROWHEADER_COL");
		rm.write(">");

		// start with the first current top visible row
		for (var row = 0, count = oTable.getRows().length; row < count; row++) {
			this.renderRowHdrRow(rm, oTable, oTable.getRows()[row], row);
		}

		rm.write("</div>");
	};

	TableRenderer._addFixedRowCSSClasses = function(rm, oTable, iIndex) {
		var iFixedRowCount = oTable.getFixedRowCount();
		var iFirstFixedButtomRowIndex = TableUtils.getFirstFixedButtomRowIndex(oTable);

		if (iFixedRowCount > 0) {
			if (iIndex < iFixedRowCount) {
				rm.addClass("sapUiTableFixedTopRow");
			}

			if (iIndex == iFixedRowCount - 1) {
				rm.addClass("sapUiTableFixedLastTopRow");
			}
		}

		if (iFirstFixedButtomRowIndex >= 0 && iFirstFixedButtomRowIndex === iIndex) {
			rm.addClass("sapUiTableFixedFirstBottomRow");
		} else if (iFirstFixedButtomRowIndex >= 1 && iFirstFixedButtomRowIndex - 1 === iIndex) {
			rm.addClass("sapUiTableFixedPreBottomRow");
		}
	};

	TableRenderer.renderRowHdrRow = function(rm, oTable, oRow, iRowIndex) {
		rm.write("<div");
		rm.writeAttribute("id", oTable.getId() + "-rowsel" + iRowIndex);
		rm.writeAttribute("data-sap-ui-rowindex", iRowIndex);
		rm.addClass("sapUiTableRowHdr");
		this._addFixedRowCSSClasses(rm, oTable, iRowIndex);
		var bRowSelected = false;
		var bRowHidden = false;
		if (oRow._bHidden) {
			rm.addClass("sapUiTableRowHidden");
			bRowHidden = true;
		} else {
			if (oTable.isIndexSelected(oRow.getIndex())) {
				rm.addClass("sapUiTableRowSel");
				bRowSelected = true;
			}
		}

		rm.writeClasses();
		if (oTable.getRowHeight() > 0) {
			rm.addStyle("height", oTable.getRowHeight() + "px");
		}

		rm.writeAttribute("tabindex", "-1");

		oTable._getAccRenderExtension().writeAriaAttributesFor(rm, oTable, "ROWHEADER", {rowSelected: bRowSelected, rowHidden: bRowHidden});

		var aCellIds = [];
		jQuery.each(oRow.getCells(), function(iIndex, oCell) {
			aCellIds.push(oRow.getId() + "-col" + iIndex);
		});

		rm.writeStyles();
		rm.write(">");
		this.writeRowSelectorContent(rm, oTable, oRow, iRowIndex);
		rm.write("</div>");
	};

	TableRenderer.renderTableCtrl = function(rm, oTable) {

		if (oTable.getFixedColumnCount() > 0) {
			rm.write("<div");
			rm.writeAttribute("id", oTable.getId() + "-sapUiTableCtrlScrFixed");
			rm.addClass("sapUiTableCtrlScrFixed");
			rm.writeClasses();
			rm.write(">");

			this.renderTableControl(rm, oTable, true);

			rm.write("</div>");
		}

		rm.write("<div");
		rm.writeAttribute("id", oTable.getId() + "-sapUiTableCtrlScr");
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
		rm.writeAttribute("id", oTable.getId() + "-tableCtrlCnt");
		rm.addClass("sapUiTableCtrlCnt");
		rm.writeClasses();
		var sVisibleRowCountMode = oTable.getVisibleRowCountMode();
		if (oTable._iTableRowContentHeight && (sVisibleRowCountMode == VisibleRowCountMode.Fixed || sVisibleRowCountMode == VisibleRowCountMode.Interactive)) {
			var sStyle = "height";
			if (oTable.getVisibleRowCountMode() == VisibleRowCountMode.Fixed) {
				sStyle = "min-height";
			}
			rm.addStyle(sStyle, oTable._iTableRowContentHeight + "px");
			rm.writeStyles();
		}
		rm.write(">");

		this.renderTableControl(rm, oTable, false);

		rm.write("</div></div>");
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
		if (iFixedBottomRows > 0 && aRows.length > 0) {
			this.renderTableControlCnt(rm, oTable, bFixedTable, iStartColumn, iEndColumn, false, true, aRows.length - iFixedBottomRows, aRows.length);
		}
	};

	TableRenderer.renderTableControlCnt = function(rm, oTable, bFixedTable, iStartColumn, iEndColumn, bFixedRow, bFixedBottomRow, iStartRow, iEndRow, bHeader) {
		rm.write("<table");
		var suffix = bHeader ? "-header" : "-table";
		var sId = oTable.getId() + suffix;

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

		oTable._getAccRenderExtension().writeAriaAttributesFor(rm, oTable, bHeader ? "COLUMNHEADER_TABLE" : "TABLE");

		rm.addClass("sapUiTableCtrl");
		if (bHeader) {
			rm.addClass("sapUiTableCHT"); // marker for the column header table
		}
		rm.writeClasses();

		rm.addStyle(bFixedTable ? "width" : "min-width", oTable._getColumnsWidth(iStartColumn, iEndColumn) + "px");
		rm.writeStyles();

		rm.write(">");

		rm.write("<thead>");

		rm.write("<tr");
		rm.addClass("sapUiTableCtrlCol");
		if (iStartRow == 0) {
			rm.addClass("sapUiTableCtrlFirstCol");
		}
		if (bHeader) {
			rm.addClass("sapUiTableCHTHR"); // marker for the column header row
		}
		rm.writeClasses();
		rm.write(">");

		var aCols = oTable.getColumns();
		var aColParams = new Array(iEndColumn);
		var iCol;
		var oColumn;
		var bHasPercentageWidths = false;

		var bRenderDummyColumn = !bFixedTable && iEndColumn > iStartColumn;

		for (iCol = iStartColumn; iCol < iEndColumn; iCol++) {
			oColumn = aCols[iCol];
			var oColParam = {
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
					} else if (sWidth && sWidth.indexOf("%") > 0) {
						bHasPercentageWidths = true;
					}
				} else if (bFixedTable) {
					delete oColumn._iFixWidth;
				}
				oColParam.width = sWidth;
			}
			aColParams[iCol] = oColParam;
		}


		if (TableUtils.hasRowHeader(oTable) && !bHeader) { // not needed for column headers
			rm.write("<th");
			if (bHasPercentageWidths) {
				// Edge and IE - 0px width is not respected if some other columns have width in %
				rm.addStyle("width", "0%");
			} else {
				rm.addStyle("width", "0px");
			}
			rm.writeStyles();
			if (iStartRow == 0) {
				oTable._getAccRenderExtension().writeAriaAttributesFor(rm, oTable, "TH");
				if (!bHeader) {
					rm.writeAttribute("id", oTable.getId() + "-colsel");
				}
				rm.addClass("sapUiTableColSel");
				rm.writeClasses();
			}
			rm.write("></th>");
		} else {
			if (aCols.length === 0) {
				// no cols => render th => avoids rendering issue in firefox
				rm.write("<th></th>");
			}
		}

		for (iCol = iStartColumn; iCol < iEndColumn; iCol++) {

			suffix = bHeader ? "_hdr" : "_col";
			oColumn = aCols[iCol];
			oColParam = aColParams[iCol];

			if (oColParam.shouldRender) {
				rm.write("<th");
				if (oColParam.width) {
					rm.addStyle("width", oColParam.width);
					rm.writeStyles();
				}
				if (iStartRow == 0) {
					oTable._getAccRenderExtension().writeAriaAttributesFor(rm, oTable, "TH", {column: oColumn});
					rm.writeAttribute("id", oTable.getId() + suffix + iCol);
				}
				rm.writeAttribute("data-sap-ui-headcolindex", iCol);
				rm.writeAttribute("data-sap-ui-colid", oColumn.getId());
				rm.write(">");
				if (iStartRow == 0 && TableUtils.getHeaderRowCount(oTable) == 0 && !bHeader) {
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
		if (bRenderDummyColumn) {
			rm.write("<th");
			oTable._getAccRenderExtension().writeAriaAttributesFor(rm, oTable, "PRESENTATION");
			rm.write("></th>");
		}

		rm.write("</tr>");
		rm.write("</thead>");

		rm.write("<tbody>");

		var aVisibleColumns = oTable._getVisibleColumns();

		// render the table rows
		var aRows = oTable.getRows();
		var row;
		var count;
		if (bHeader) {
			for (row = iStartRow, count = iEndRow; row < count; row++) {
				this.renderColumnHeaderRow(rm, oTable, row, bFixedTable, iStartColumn, iEndColumn, bRenderDummyColumn);
			}
		} else {
			// retrieve tooltip and aria texts only once and pass them to the rows _updateSelection function
			var mTooltipTexts = oTable._getAccExtension().getAriaTextsForSelectionMode(true);

			// check whether the row can be clicked to change the selection
			var bSelectOnCellsAllowed = TableUtils.isRowSelectionAllowed(oTable);
			for (row = iStartRow, count = iEndRow; row < count; row++) {
				this.renderTableRow(rm, oTable, aRows[row], row, bFixedTable, iStartColumn, iEndColumn, false, aVisibleColumns, bRenderDummyColumn, mTooltipTexts, bSelectOnCellsAllowed);
			}
		}
		rm.write("</tbody>");
		rm.write("</table>");
	};

	TableRenderer.addTrClasses = function(rm, oTable, oRow, iRowIndex) {
		return;
	};

	TableRenderer.writeRowSelectorContent = function(rm, oTable, oRow, iRowIndex) {
		oTable._getAccRenderExtension().writeAccRowSelectorText(rm, oTable, oRow, iRowIndex);

		if (TableUtils.Grouping.isGroupMode(oTable)) {
			rm.write("<div");
			rm.writeAttribute("class", "sapUiTableGroupShield");
			rm.write("></div>");
			rm.write("<div");
			rm.writeAttribute("id", oRow.getId() + "-groupHeader");
			rm.writeAttribute("class", "sapUiTableGroupIcon");
			rm.write("></div>");

			if (TableUtils.Grouping.showGroupMenuButton(oTable)) {
				var oIconInfo = IconPool.getIconInfo("sap-icon://drop-down-list");
				rm.write("<div class='sapUiTableGroupMenuButton'>");
				rm.writeEscaped(oIconInfo.content);
				rm.write("</div>");
			}
		}
	};
	TableRenderer.renderColumnHeaderRow = function(rm, oTable, iRow, bFixedTable, iStartColumn, iEndColumn, bHasOnlyFixedColumns) {
		rm.write("<tr");
		rm.addClass("sapUiTableColHdrTr");
		rm.writeClasses();
		oTable._getAccRenderExtension().writeAriaAttributesFor(rm, oTable, "COLUMNHEADER_ROW");
		rm.write(">");

		//
		// Render header cells
		//
		var aColumns = oTable.getColumns();
		var oColumn,
			bInvisible = false,
			nSpan = 0;

		for (var iIndex = iStartColumn; iIndex < iEndColumn; iIndex++) {
			oColumn = aColumns[iIndex];
			if (oColumn && oColumn.shouldRender()) {
				if (nSpan < 1) {
					nSpan = TableUtils.Column.getHeaderSpan(oColumn, iRow);
					bInvisible = false;
				} else {
					//Render column header but this is invisible because of the span
					bInvisible = true;
				}
				this.renderCol(rm, oTable, oColumn, iIndex, iRow, nSpan, bInvisible);
				nSpan--;
			}
		}


		if (!bFixedTable && bHasOnlyFixedColumns && aColumns.length > 0) {
			rm.write('<td class="sapUiTableTDDummy"');
			oTable._getAccRenderExtension().writeAriaAttributesFor(rm, oTable, "PRESENTATION");
			rm.write('></td>');
		}
		rm.write("</tr>");
	};

	TableRenderer.renderTableRow = function(rm, oTable, oRow, iRowIndex, bFixedTable, iStartColumn, iEndColumn, bFixedRow, aVisibleColumns, bHasOnlyFixedColumns, mTooltipTexts, bSelectOnCellsAllowed) {
		if (!oRow) {
			return;
		}
		rm.write("<tr");
		if (oRow._bDummyRow) {
			rm.addStyle("opacity", "0");
		}
		rm.addClass("sapUiTableTr");
		if (bFixedTable) {
			rm.writeAttribute("id", oRow.getId() + "-fixed");
		} else {
			rm.writeElementData(oRow);
		}
		if (oRow._bHidden) {
			rm.addClass("sapUiTableRowHidden");
		} else {
			if (oTable.isIndexSelected(oRow.getIndex())) {
				rm.addClass("sapUiTableRowSel");
			}

			this.addTrClasses(rm, oTable, oRow, iRowIndex);
		}

		if (iRowIndex % 2 === 0) {
			rm.addClass("sapUiTableRowEven");
		} else {
			rm.addClass("sapUiTableRowOdd");
		}

		var aRows = oTable.getRows();
		var iRowCount = aRows.length;
		if (iRowCount > 0 && aRows[iRowCount - 1] === oRow) {
			rm.addClass("sapUiTableLastRow");
		} else if (iRowCount > 0 && aRows[0] === oRow) {
			rm.addClass("sapUiTableFirstRow");
		}

		this._addFixedRowCSSClasses(rm, oTable, iRowIndex);

		rm.writeClasses();
		rm.writeAttribute("data-sap-ui-rowindex", iRowIndex);
		var iTableRowHeight = oTable.getRowHeight();
		if (iTableRowHeight > 0) {
			rm.addStyle("height", iTableRowHeight + "px");
		}
		rm.writeStyles();

		oTable._getAccRenderExtension().writeAriaAttributesFor(rm, oTable, "TR", {index: iRowIndex});

		rm.write(">");
		var aCells = oRow.getCells();
		// render the row headers
		if (TableUtils.hasRowHeader(oTable) || aCells.length === 0) {
			rm.write("<td");
			oTable._getAccRenderExtension().writeAriaAttributesFor(rm, oTable, "ROWHEADER_TD", {
				rowSelected: !oRow._bHidden && oTable.isIndexSelected(oRow.getIndex()), //see TableRenderer.renderRowHdrRow
				index: iRowIndex
			});
			rm.write("></td>");
		}

		for (var cell = 0, count = aCells.length; cell < count; cell++) {
			this.renderTableCell(rm, oTable, oRow, aCells[cell], cell, bFixedTable, iStartColumn, iEndColumn, aVisibleColumns);
		}
		if (!bFixedTable && bHasOnlyFixedColumns && aCells.length > 0) {
			rm.write('<td class="sapUiTableTDDummy"');
			oTable._getAccRenderExtension().writeAriaAttributesFor(rm, oTable, "PRESENTATION");
			rm.write('></td>');
		}
		rm.write("</tr>");
	};

	TableRenderer.renderTableCell = function(rm, oTable, oRow, oCell, iCellIndex, bFixedTable, iStartColumn, iEndColumn, aVisibleColumns) {
		var iColIndex = oCell.data("sap-ui-colindex");
		var oColumn = oTable.getColumns()[iColIndex];
		if (oColumn.shouldRender() && iStartColumn <= iColIndex && iEndColumn > iColIndex) {
			rm.write("<td");
			var sId = oRow.getId() + "-col" + iCellIndex;
			rm.writeAttribute("id", sId);
			rm.writeAttribute("tabindex", "-1");
			rm.writeAttribute("data-sap-ui-colid", oColumn.getId());

			var nColumns = aVisibleColumns.length;
			var bIsFirstColumn = nColumns > 0 && aVisibleColumns[0] === oColumn;
			var bIsLastColumn = nColumns > 0 && aVisibleColumns[nColumns - 1] === oColumn;

			oTable._getAccRenderExtension().writeAriaAttributesFor(rm, oTable, "DATACELL", {
				index: iColIndex,
				column: oColumn,
				row: oRow,
				fixed: bFixedTable,
				firstCol: bIsFirstColumn
			});

			var sHAlign = Renderer.getTextAlign(oColumn.getHAlign(), oCell && oCell.getTextDirection && oCell.getTextDirection());
			if (sHAlign) {
				rm.addStyle("text-align", sHAlign);
			}
			rm.writeStyles();
			rm.addClass("sapUiTableTd");
			if (bIsFirstColumn) {
				rm.addClass("sapUiTableTdFirst");
			}
			if (bIsLastColumn) {
				rm.addClass("sapUiTableTdLast");
			}
			// grouping support to show/hide values of grouped columns
			if (oColumn.getGrouped()) {
				rm.addClass("sapUiTableTdGroup");
			}

			var oBinding = oTable.getBinding("rows");
			if (oBinding && oColumn.getLeadingProperty && oBinding.isMeasure(oColumn.getLeadingProperty())) {
				// for AnalyticalTable
				rm.addClass("sapUiTableMeasureCell");
			}

			rm.writeClasses();
			rm.write("><div");
			rm.addClass("sapUiTableCell");
			if (bIsFirstColumn && TableUtils.Grouping.isTreeMode(oTable)) {
				rm.addClass("sapUiTableCellFlex"); // without flex, icon pushes contents too wide
			}

			rm.writeClasses();

			if (oTable.getRowHeight() && oTable.getVisibleRowCountMode() == VisibleRowCountMode.Auto) {
				rm.addStyle("max-height", oTable.getRowHeight() + "px");
			}
			rm.writeStyles();

			rm.write(">");
			this.renderTableCellControl(rm, oTable, oCell, bIsFirstColumn);
			rm.write("</div></td>");
		}
	};

	TableRenderer.renderTableCellControl = function(rm, oTable, oCell, bIsFirstColumn) {
		if (TableUtils.Grouping.isTreeMode(oTable) && bIsFirstColumn) {
			var oRow = oCell.getParent();
			rm.write("<span class='sapUiTableTreeIcon' tabindex='-1' id='" + oRow.getId() + "-treeicon'");
			oTable._getAccRenderExtension().writeAriaAttributesFor(rm, oTable, "TREEICON", {row: oRow});
			rm.write("></span>");
		}
		rm.renderControl(oCell);
	};

	TableRenderer.renderVSb = function(rm, oTable) {

		rm.write("<div");
		rm.addClass("sapUiTableVSb");
		rm.writeClasses();
		rm.writeAttribute("id", oTable.getId() + "-vsb");
		rm.writeAttribute("tabindex", "-1"); // Avoid focusing in Firefox
		rm.addStyle("max-height", oTable._getVSbHeight() + "px");

		if (oTable.getFixedRowCount() > 0) {
			oTable._iVsbTop = (oTable.getFixedRowCount() * oTable._getDefaultRowHeight()) - 1;
			rm.addStyle("top", oTable._iVsbTop  + 'px');
		}

		rm.writeStyles();
		rm.write(">");

		rm.write("<div");
		rm.writeAttribute("id", oTable.getId() + "-vsb-content");
		rm.addClass("sapUiTableVSbContent");
		rm.writeClasses();
		rm.addStyle("height", oTable._getTotalScrollRange() + "px");
		rm.writeStyles();
		rm.write(">");
		rm.write("</div>");
		rm.write("</div>");
	};

	TableRenderer.renderHSb = function(rm, oTable) {
		rm.write("<div");
		rm.addClass("sapUiTableHSb");
		rm.writeClasses();
		rm.writeAttribute("id", oTable.getId() + "-hsb");
		rm.writeAttribute("tabindex", "-1"); // Avoid focusing in Firefox
		rm.write(">");
		rm.write("<div");
		rm.writeAttribute("id", oTable.getId() + "-hsb-content");
		rm.addClass("sapUiTableHSbContent");
		rm.writeClasses();
		rm.write(">");
		rm.write("</div>");
		rm.write("</div>");
	};


	// =============================================================================
	// HELPER FUNCTIONALITY
	// =============================================================================

	/**
	 * Renders an empty area with tabindex=0 and the given class and id.
	 * @private
	 */
	TableRenderer.renderTabElement = function(rm, sClass) {
		rm.write("<div");
		if (sClass) {
			rm.addClass(sClass);
			rm.writeClasses();
		}
		rm.writeAttribute("tabindex", "0");
		rm.write("></div>");
	};

	return TableRenderer;

}, /* bExport= */ true);
