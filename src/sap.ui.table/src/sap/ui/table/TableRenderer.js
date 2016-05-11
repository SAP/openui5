/*!
 * ${copyright}
 */

//Provides default renderer for control sap.ui.table.Table
sap.ui.define(['jquery.sap.global', 'sap/ui/core/theming/Parameters'],
	function(jQuery, Parameters) {
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
		if (oTable.getSelectionMode() !== sap.ui.table.SelectionMode.None &&
				oTable.getSelectionBehavior() !== sap.ui.table.SelectionBehavior.RowOnly) {
			rm.addClass("sapUiTableRSel"); // show row selector
		}

		// This class flags whether the sap.m. library is loaded or not.
		var sSapMTableClass = sap.ui.table.TableHelper.addTableClass();
		if (sSapMTableClass) {
			rm.addClass(sSapMTableClass);
		}

		rm.addClass("sapUiTableSelMode" + oTable.getSelectionMode()); // row selection mode
		if (oTable._isVSbRequired()) {
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

		if (oTable.getWidth()) {
			rm.addStyle("width", oTable.getWidth());
		}

		if (oTable.getVisibleRowCountMode() == sap.ui.table.VisibleRowCountMode.Auto) {
			rm.addStyle("height", "0px");
			if (oTable._bFirstRendering) {
				rm.addClass("sapUiTableNoOpacity");
			}
		}

		rm.writeClasses();
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

		rm.write("</div>");

		if (oTable.getNavigationMode() === sap.ui.table.NavigationMode.Paginator) {
			rm.write("<div");
			rm.addClass("sapUiTablePaginator");
			rm.writeClasses();
			rm.write(">");
			if (!oTable._oPaginator) {
				jQuery.sap.require("sap.ui.commons.Paginator");
				oTable._oPaginator = new sap.ui.commons.Paginator(oTable.getId() + "-paginator");
				oTable._oPaginator.attachPage(jQuery.proxy(oTable.onpscroll, oTable));
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
		rm.write(">");

		// toolbar has to be embedded (not standalone)!
		if (typeof oToolbar.getStandalone === "function" && oToolbar.getStandalone()) {
			oToolbar.setStandalone(false);
		}

		// set the default design of the toolbar
		if (sap.m && sap.m.Toolbar && oToolbar instanceof sap.m.Toolbar) {
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
		this.renderHSb(rm, oTable);
	};

	TableRenderer.renderTableCCnt = function(rm, oTable) {
		rm.write("<div");
		rm.addClass("sapUiTableCtrlBefore");
		rm.writeClasses();
		rm.writeAttribute("tabindex", "0");
		rm.write("></div>");

		this.renderTableCtrl(rm, oTable);
		this.renderRowHdr(rm, oTable);
		this.renderVSb(rm, oTable);
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
		rm.write("<div");
		rm.addClass("sapUiTableColHdrCnt");
		rm.writeClasses();
		if (oTable.getColumnHeaderHeight() > 0) {
			rm.addStyle("height", (oTable.getColumnHeaderHeight() * oTable._getHeaderRowCount()) + "px");
		}
		oTable._getAccRenderExtension().writeAriaAttributesFor(rm, oTable, "COLUMNHEADER_ROW");
		rm.writeStyles();
		rm.write(">");

		this.renderColRowHdr(rm, oTable);

		var aCols = oTable.getColumns();

		var iFixedColumnCount = oTable.getFixedColumnCount();
		var iFixedColumnsWidth = oTable._getColumnsWidth(0, iFixedColumnCount);

		if (iFixedColumnCount > 0) {
			rm.write("<div");
			rm.addClass("sapUiTableColHdrFixed");
			rm.addClass("sapUiTableNoOpacity");
			rm.writeClasses();
			rm.write(">");

			for (var h = 0; h < oTable._getHeaderRowCount(); h++) {
				rm.write("<div");
				rm.addClass("sapUiTableColHdr");
				rm.addClass("sapUiTableNoOpacity");
				rm.writeClasses();
				rm.addStyle("min-width", iFixedColumnsWidth + "px");
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
								iSpan = parseInt(aCols[i].getHeaderSpan(), 10) + 1;
							}
						} else {
							//Render column header but this is invisible because of the span
							this.renderCol(rm, oTable, aCols[i], i, h, true);
						}

						iSpan--;
					}
				}
				rm.write("</div>");

			}

			rm.write("</div>");
		}

		rm.write("<div");
		rm.writeAttribute("id", oTable.getId() + "-sapUiTableColHdrScr");
		rm.addClass("sapUiTableColHdrScr");
		if (aCols.length == 0) {
			rm.addClass("sapUiTableHasNoColumns");
		}
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
			rm.addClass("sapUiTableNoOpacity");
			rm.writeClasses();
			rm.write(">");

			var iSpan = 1;
			for (var i = iFixedColumnCount, l = aCols.length; i < l; i++) {
				if (aCols[i].shouldRender()) {
					if (iSpan <= 1) {
						this.renderCol(rm, oTable, aCols[i], i, h);
						var aHeaderSpan = aCols[i].getHeaderSpan();
						if (jQuery.isArray(aHeaderSpan)) {
							iSpan = aCols[i].getHeaderSpan()[h] + 1;
						} else {
							iSpan = parseInt(aCols[i].getHeaderSpan(), 10) + 1;
						}
					} else {
						//Render column header but this is invisible because of the span
						this.renderCol(rm, oTable, aCols[i], i, h, true);
					}
					iSpan--;
				}
			}
			rm.write("</div>");

		}

		rm.write("</div>");

		rm.write("</div>");

	};

	TableRenderer.renderColRowHdr = function(rm, oTable) {
		rm.write("<div");
		rm.writeAttribute("id", oTable.getId() + "-selall");
		var oSelMode = oTable.getSelectionMode();
		var bEnabled = false;
		if ((oSelMode == "Multi" || oSelMode == "MultiToggle") && oTable.getEnableSelectAll()) {
			rm.writeAttributeEscaped("title", oTable._oResBundle.getText("TBL_SELECT_ALL"));
			//TODO: remove second _getSelectableRowCount Call!
			if (oTable._getSelectableRowCount() == 0 || oTable._getSelectableRowCount() !== oTable.getSelectedIndices().length) {
				rm.addClass("sapUiTableSelAll");
			}
			rm.addClass("sapUiTableSelAllEnabled");
			bEnabled = true;
		} else {
			rm.addClass("sapUiTableSelAllDisabled");
		}
		rm.addClass("sapUiTableColRowHdr");
		rm.writeClasses();

		rm.writeAttribute("tabindex", "-1");

		oTable._getAccRenderExtension().writeAriaAttributesFor(rm, oTable, "COLUMNROWHEADER", {enabled: bEnabled});

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
		rm.write(">");

		// start with the first current top visible row
		for (var row = 0, count = oTable.getRows().length; row < count; row++) {
			this.renderRowHdrRow(rm, oTable, oTable.getRows()[row], row);
		}

		rm.write("</div>");
	};

	TableRenderer._addFixedRowCSSClasses = function(rm, oTable, iIndex) {
		var iFixedRowCount = oTable.getFixedRowCount();
		var iFixedBottomRowCount = oTable.getFixedBottomRowCount();
		var iVisibleRowCount = oTable.getVisibleRowCount();
		var iFirstVisibleRow = oTable.getFirstVisibleRow();

		if (iFixedRowCount > 0) {
			if (iIndex < iFixedRowCount) {
				rm.addClass("sapUiTableFixedTopRow");
			}

			if (iIndex == iFixedRowCount - 1) {
				rm.addClass("sapUiTableFixedLastTopRow");
			}
		}

		if (iFixedBottomRowCount > 0) {
			var bIsPreBottomRow = false;
			var oBinding = oTable.getBinding("rows");
			if (oBinding) {
				if (oTable._iBindingLength >= iVisibleRowCount) {
					bIsPreBottomRow = (iIndex == iVisibleRowCount - iFixedBottomRowCount - 1);
				} else {
					bIsPreBottomRow = (iFirstVisibleRow + iIndex) == (oTable._iBindingLength - iFixedBottomRowCount - 1) && (oTable.getFirstVisibleRow() + iIndex) < oTable._iBindingLength;
				}
			}

			if (bIsPreBottomRow) {
				rm.addClass("sapUiTableFixedPreBottomRow");
			}
		}
	};

	TableRenderer.renderRowHdrRow = function(rm, oTable, oRow, iRowIndex) {
		rm.write("<div");
		rm.writeAttribute("id", oTable.getId() + "-rowsel" + iRowIndex);
		rm.writeAttribute("data-sap-ui-rowindex", iRowIndex);
		rm.addClass("sapUiTableRowHdr");
		this._addFixedRowCSSClasses(rm, oTable, iRowIndex);
		var bRowSelected = false;
		if (oRow._bHidden) {
			rm.addClass("sapUiTableRowHidden");
		} else {
			if (oTable.isIndexSelected(oTable._getAbsoluteRowIndex(iRowIndex))) {
				rm.addClass("sapUiTableRowSel");
				bRowSelected = true;
			}
		}

		rm.writeClasses();
		if (oTable.getRowHeight() > 0) {
			rm.addStyle("height", oTable.getRowHeight() + "px");
		}

		rm.writeAttribute("tabindex", "-1");

		oTable._getAccRenderExtension().writeAriaAttributesFor(rm, oTable, "ROWHEADER", {rowSelected: bRowSelected});

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
		if (oTable._iTableRowContentHeight && (sVisibleRowCountMode == sap.ui.table.VisibleRowCountMode.Fixed || sVisibleRowCountMode == sap.ui.table.VisibleRowCountMode.Interactive)) {
			var sStyle = "height";
			if (oTable.getVisibleRowCountMode() == sap.ui.table.VisibleRowCountMode.Fixed) {
				sStyle = "min-height";
			}
			rm.addStyle(sStyle, oTable._iTableRowContentHeight + "px");
			rm.writeStyles();
		}
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
		if (iFixedBottomRows > 0 && aRows.length > 0) {
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

		oTable._getAccRenderExtension().writeAriaAttributesFor(rm, oTable, "TABLE");

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
			if (iStartRow == 0) {
				oTable._getAccRenderExtension().writeAriaAttributesFor(rm, oTable, "TH");
				rm.writeAttribute("id", oTable.getId() + "-colsel");
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

		for (var col = iStartColumn, count = iEndColumn; col < count; col++) {
			var oColumn = aCols[col];
			if (oColumn && oColumn.shouldRender()) {
				rm.write("<th");
				rm.addStyle("width", oColumn.getWidth());
				rm.writeStyles();
				if (iStartRow == 0) {
					oTable._getAccRenderExtension().writeAriaAttributesFor(rm, oTable, "TH", {column: oColumn});
					rm.writeAttribute("id", oTable.getId() + "_col" + col);
				}
				rm.writeAttribute("data-sap-ui-headcolindex", col);
				rm.writeAttribute("data-sap-ui-colid", oColumn.getId());
				rm.write(">");
				if (iStartRow == 0 && oTable._getHeaderRowCount() == 0) {
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

		var aVisibleColumns = oTable._getVisibleColumns();
		var bHasOnlyFixedColumns = oTable._hasOnlyFixColumnWidths();

		// render the table rows
		var aRows = oTable.getRows();
		if (aRows.length == 0) {
			// For the very first rendering in visibleRowCountMode Auto, there are no rows which can be rendered but
			// it's required to have a dummy row rendered to determine the default/expected row height since the controls
			// of the column template may expand the rowHeight.
			aRows = [oTable._getDummyRow()];
			iEndRow = 1;
		}
		// retrieve tooltip and aria texts only once and pass them to the rows _updateSelection function
		var mTooltipTexts = oTable._getAccExtension().getAriaTextsForSelectionMode(true);

		// check whether the row can be clicked to change the selection
		var bSelectOnCellsAllowed = oTable._getSelectOnCellsAllowed();
		for (var row = iStartRow, count = iEndRow; row < count; row++) {
			this.renderTableRow(rm, oTable, aRows[row], row, bFixedTable, iStartColumn, iEndColumn, false, aVisibleColumns, bHasOnlyFixedColumns, mTooltipTexts, bSelectOnCellsAllowed);
		}

		rm.write("</tbody>");
		rm.write("</table>");
	};

	TableRenderer.addTrClasses = function(rm, oTable, oRow, iRowIndex) {
		return;
	};

	TableRenderer.writeRowSelectorContent = function(rm, oTable, oRow, iRowIndex) {
		oTable._getAccRenderExtension().writeAccRowSelectorText(rm, oTable, oRow, iRowIndex);
	};

	TableRenderer.renderTableRow = function(rm, oTable, oRow, iRowIndex, bFixedTable, iStartColumn, iEndColumn, bFixedRow, aVisibleColumns, bHasOnlyFixedColumns, mTooltipTexts, bSelectOnCellsAllowed) {
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
			if (oTable.isIndexSelected(oTable._getAbsoluteRowIndex(iRowIndex))) {
				rm.addClass("sapUiTableRowSel");
			}

			this.addTrClasses(rm, oTable, oRow, iRowIndex);
		}

		if (iRowIndex % 2 === 0) {
			rm.addClass("sapUiTableRowEven");
		} else {
			rm.addClass("sapUiTableRowOdd");
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
		if ((oTable.getSelectionMode() !== sap.ui.table.SelectionMode.None &&
			oTable.getSelectionBehavior() !== sap.ui.table.SelectionBehavior.RowOnly) ||
			aCells.length === 0) {
			rm.write("<td");
			oTable._getAccRenderExtension().writeAriaAttributesFor(rm, oTable, "ROWHEADER_TD", {
				rowSelected: !oRow._bHidden && oTable.isIndexSelected(oTable._getAbsoluteRowIndex(iRowIndex)), //see TableRenderer.renderRowHdrRow
				index: iRowIndex
			});
			rm.write("></td>");
		}

		for (var cell = 0, count = aCells.length; cell < count; cell++) {
			this.renderTableCell(rm, oTable, oRow, aCells[cell], cell, bFixedTable, iStartColumn, iEndColumn, aVisibleColumns);
		}
		if (!bFixedTable && bHasOnlyFixedColumns && aCells.length > 0) {
			rm.write("<td");
			rm.addClass("sapUiTableTDDummy");
			rm.writeClasses();
			rm.write(">");
			rm.write("</td>");
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

			var bIsFirstColumn = aVisibleColumns.length > 0 && aVisibleColumns[0] === oColumn;

			oTable._getAccRenderExtension().writeAriaAttributesFor(rm, oTable, "DATACELL", {
				index: iColIndex,
				column: oColumn,
				row: oRow,
				fixed: bFixedTable,
				firstCol: bIsFirstColumn
			});

			var sHAlign = this.getHAlign(oColumn.getHAlign(), oTable._bRtlMode);
			if (sHAlign) {
				rm.addStyle("text-align", sHAlign);
			}
			rm.writeStyles();
			rm.addClass("sapUiTableTd");
			if (bIsFirstColumn) {
				rm.addClass("sapUiTableTdFirst");
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

			rm.writeClasses();

			if (oTable.getRowHeight() && oTable.getVisibleRowCountMode() == sap.ui.table.VisibleRowCountMode.Auto) {
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
		rm.writeAttribute("id", oTable.getId() + "-vsb");
		rm.write(">");

		rm.write("<div");
		rm.writeAttribute("id", oTable.getId() + "-vsb-content");
		rm.addClass("sapUiTableVSbContent");
		rm.writeClasses();
		rm.write(">");
		rm.write("</div>");
		rm.write("</div>");
	};

	TableRenderer.renderHSb = function(rm, oTable) {
		rm.write("<div");
		rm.addClass("sapUiTableHSb");
		rm.writeClasses();
		rm.writeAttribute("id", oTable.getId() + "-hsb");
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
