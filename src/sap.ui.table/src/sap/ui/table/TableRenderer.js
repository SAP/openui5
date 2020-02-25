/*!
 * ${copyright}
 */

//Provides default renderer for control sap.ui.table.Table
sap.ui.define(['sap/ui/core/Control', 'sap/ui/core/theming/Parameters', 'sap/ui/Device', './library', "./Column", './utils/TableUtils', "./extensions/ExtensionBase",
			   'sap/ui/core/Renderer', 'sap/ui/core/IconPool', "sap/base/Log"],
	function(Control, Parameters, Device, library, Column, TableUtils, ExtensionBase, Renderer, IconPool, Log) {
	"use strict";


	// shortcuts
	var VisibleRowCountMode = library.VisibleRowCountMode;
	var SortOrder = library.SortOrder;

	var mFlexCellContentAlignment = {
		Begin: "flex-start",
		End: "flex-end",
		Left: undefined, // Set on every call of TableRenderer#render to respect the current text direction.
		Right: undefined, // Set on every call of TableRenderer#render to respect the current text direction.
		Center: "center"
	};

	/**
	 * Table renderer.
	 *
	 * @namespace
	 * @alias sap.ui.table.TableRenderer
	 */
	var TableRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} rm The RenderManager that can be used for writing to the Render-Output-Buffer.
	 * @param {sap.ui.table.Table} oTable The instance of the table that should be rendered.
	 */
	TableRenderer.render = function(rm, oTable) {
		// Clear cashed header row count
		delete oTable._iHeaderRowCount;

		mFlexCellContentAlignment.Left = oTable._bRtlMode ? "flex-end" : "flex-start";
		mFlexCellContentAlignment.Right = oTable._bRtlMode ? "flex-start" : "flex-end";

		// The resource bundle is required for rendering. In case it is not already loaded, it should be loaded synchronously.
		TableUtils.getResourceBundle();

		// basic table div
		rm.openStart("div", oTable);
		oTable._getAccRenderExtension().writeAriaAttributesFor(rm, oTable, "ROOT");
		rm.class("sapUiTable");

		if (Device.browser.chrome && window.devicePixelRatio < 1) {
			rm.class("sapUiTableZoomout");
		}

		if ('ontouchstart' in document) {
			rm.class("sapUiTableTouch");
		}
		rm.class("sapUiTableSelMode" + oTable.getSelectionMode());

		if (oTable.getColumnHeaderVisible()) {
			rm.class("sapUiTableCHdr"); // show column headers
		}
		if (TableUtils.hasRowHeader(oTable)) {
			rm.class("sapUiTableRowSelectors"); // show row selectors
		}
		if (TableUtils.hasRowHighlights(oTable)) {
			rm.class("sapUiTableRowHighlights"); // show row highlights
		}

		// This class flags whether the sap.m. library is loaded or not.
		var sSapMTableClass = library.TableHelper.addTableClass();
		if (sSapMTableClass) {
			rm.class(sSapMTableClass);
		}

		var oScrollExtension = oTable._getScrollExtension();
		if (oScrollExtension.isVerticalScrollbarRequired() && !oScrollExtension.isVerticalScrollbarExternal()) {
			rm.class("sapUiTableVScr"); // show vertical scrollbar
		}
		if (oTable.getEditable()) {
			rm.class("sapUiTableEdt"); // editable (background color)
		}

		if (TableUtils.hasRowActions(oTable)) {
			var iRowActionCount = TableUtils.getRowActionCount(oTable);
			rm.class(iRowActionCount == 1 ? "sapUiTableRActS" : "sapUiTableRAct");
		} else if (TableUtils.hasRowNavigationIndicators(oTable)){
			rm.class("sapUiTableRowNavIndicator");
		}

		if (TableUtils.isNoDataVisible(oTable) && !TableUtils.hasPendingRequests(oTable)) {
			rm.class("sapUiTableEmpty"); // no data!
		}

		if (oTable.getShowOverlay()) {
			rm.class("sapUiTableOverlay");
		}

		var sModeClass = TableUtils.Grouping.getModeCssClass(oTable);
		if (sModeClass) {
			rm.class(sModeClass);
		}

		rm.style("width", oTable.getWidth());

		oTable._getRowMode().applyTableStyles(rm);

		if (oTable._bFirstRendering) {
			// This class hides the table by setting opacity to 0. It will be removed in Table#_updateTableSizes.
			// Makes initial asynchronous renderings a bit nicer, because the table only shows up after everything is done.
			rm.class("sapUiTableNoOpacity");
		}

		rm.openEnd();

		this.renderTabElement(rm, "sapUiTableOuterBefore");

		rm.renderControl(oTable.getAggregation("_messageStrip"));

		if (oTable.getTitle()) {
			this.renderHeader(rm, oTable, oTable.getTitle());
		}

		if (oTable.getToolbar()) {
			this.renderToolbar(rm, oTable, oTable.getToolbar());
		}

		if (oTable.getExtension() && oTable.getExtension().length > 0) {
			this.renderExtensions(rm, oTable, oTable.getExtension());
		}

		rm.openStart("div", oTable.getId() + "-sapUiTableCnt");
		rm.class("sapUiTableCnt");

		// Define group for F6 handling
		rm.attr("data-sap-ui-fastnavgroup", "true");
		oTable._getAccRenderExtension().writeAriaAttributesFor(rm, oTable, "CONTAINER");
		rm.openEnd();

		rm.openStart("div", oTable.getId() + "-sapUiTableGridCnt");
		oTable._getAccRenderExtension().writeAriaAttributesFor(rm, oTable, "CONTENT");
		rm.openEnd();

		this.renderColRsz(rm, oTable);
		this.renderColHdr(rm, oTable);
		this.renderTable(rm, oTable);

		rm.close("div");

		var oCreationRow = oTable.getCreationRow();
		if (oCreationRow) {
			rm.renderControl(oCreationRow);

			// If the table has a creation row, the horizontal scrollbar needs to be rendered outside the element covered by the busy indicator.
			this.renderHSbBackground(rm, oTable);
			this.renderHSb(rm, oTable);
		}

		oTable._getAccRenderExtension().writeHiddenAccTexts(rm, oTable);

		rm.openStart("div", oTable.getId() + "-overlay");
		rm.class("sapUiTableOverlayArea");
		rm.attr("tabindex", "0");
		oTable._getAccRenderExtension().writeAriaAttributesFor(rm, oTable, "OVERLAY");
		rm.openEnd();
		rm.close("div");

		rm.close("div");

		if (oTable.getFooter()) {
			this.renderFooter(rm, oTable, oTable.getFooter());
		}

		// TODO: Move to "renderTableChildAtBottom" hook in row modes
		if (oTable.getVisibleRowCountMode() == VisibleRowCountMode.Interactive) {
			this.renderVariableHeight(rm ,oTable);
		}

		// TODO: Move to "renderTableChildAtBottom" hook in row modes
		this.renderBottomPlaceholder(rm, oTable);

		//oTable._getRowMode().renderTableChildAtBottom(rm);
		this.renderTabElement(rm, "sapUiTableOuterAfter");
		rm.close("div");
	};

	// =============================================================================
	// BASIC AREAS OF THE TABLE
	// =============================================================================

	TableRenderer.renderHeader = function(rm, oTable, oTitle) {
		rm.openStart("div");
		rm.class("sapUiTableHdr");
		oTable._getAccRenderExtension().writeAriaAttributesFor(rm, oTable, "TABLEHEADER");
		rm.openEnd();

		rm.renderControl(oTitle);

		rm.close("div");
	};

	TableRenderer.renderToolbar = function(rm, oTable, oToolbar) {
		if (!TableUtils.isA(oToolbar, "sap.ui.core.Toolbar")) {
			return;
		}

		rm.openStart("div");
		rm.class("sapUiTableTbr");

		// toolbar has to be embedded (not standalone)!
		if (typeof oToolbar.getStandalone === "function" && oToolbar.getStandalone()) {
			oToolbar.setStandalone(false);
		}

		// set the default design of the toolbar
		if (oToolbar.isA("sap.m.Toolbar")) {
			oToolbar.setDesign("Transparent", true);
			oToolbar.addStyleClass("sapMTBHeader-CTX");
			rm.class("sapUiTableMTbr"); // Just a marker when sap.m toolbar is used
		}

		oTable._getAccRenderExtension().writeAriaAttributesFor(rm, oTable, "TABLESUBHEADER");
		rm.openEnd();
		rm.renderControl(oToolbar);
		rm.close("div");
	};

	TableRenderer.renderExtensions = function(rm, oTable, aExtensions) {
		for (var i = 0, l = aExtensions.length; i < l; i++) {
			this.renderExtension(rm, oTable, aExtensions[i]);
		}
	};

	TableRenderer.renderExtension = function(rm, oTable, oExtension) {
		rm.openStart("div");
		rm.class("sapUiTableExt");
		oTable._getAccRenderExtension().writeAriaAttributesFor(rm, oTable, "TABLESUBHEADER");
		rm.openEnd();

		rm.renderControl(oExtension);

		rm.close("div");
	};

	TableRenderer.renderTable = function(rm, oTable) {
		this.renderTabElement(rm, "sapUiTableCtrlBefore");
		rm.openStart("div", oTable.getId() + "-tableCCnt");
		oTable._getRowMode().applyRowContainerStyles(rm);

		rm.class("sapUiTableCCnt");
		rm.openEnd();

		this.renderTableCCnt(rm, oTable);
		rm.close("div");
		this.renderTabElement(rm, "sapUiTableCtrlAfter");

		if (!oTable._getScrollExtension().isVerticalScrollbarExternal()) {
			this.renderVSbBackground(rm, oTable);
			this.renderVSb(rm, oTable);
		}

		var oCreationRow = oTable.getCreationRow();
		if (!oCreationRow) {
			this.renderHSbBackground(rm, oTable);
			this.renderHSb(rm, oTable);
		}
	};

	TableRenderer.renderTableCCnt = function(rm, oTable) {
		this.renderTableCtrl(rm, oTable);
		this.renderRowHdr(rm, oTable);
		this.renderRowActions(rm, oTable);

		rm.openStart("div", oTable.getId() + "-noDataCnt");
		rm.class("sapUiTableCtrlEmpty");
		rm.attr("tabindex", "0");
		oTable._getAccRenderExtension().writeAriaAttributesFor(rm, oTable, "NODATA");
		rm.openEnd();

		if (oTable.getNoData() instanceof Control && oTable._getVisibleColumns().length > 0) {
			rm.renderControl(oTable.getNoData());
		} else {
			rm.openStart("span", oTable.getId() + "-noDataMsg");
			rm.class("sapUiTableCtrlEmptyMsg");
			rm.openEnd();
			rm.text(TableUtils.getNoDataText(oTable));
			rm.close("span");
		}
		rm.close("div");
	};

	TableRenderer.renderFooter = function(rm, oTable, oFooter) {
		rm.openStart("div");
		rm.class("sapUiTableFtr");
		oTable._getAccRenderExtension().writeAriaAttributesFor(rm, oTable, "TABLEFOOTER");
		rm.openEnd();

		rm.renderControl(oFooter);

		rm.close("div");
	};

	TableRenderer.renderVariableHeight = function(rm, oTable) {
		rm.openStart("div", oTable.getId() + "-sb");
		rm.attr("tabindex", "-1");
		rm.class("sapUiTableHeightResizer");
		rm.style("height", "5px");
		rm.openEnd();
		rm.close("div");
	};

	TableRenderer.renderBottomPlaceholder = function(rm, oTable) {
		var mPlaceholderHeight = oTable._getRowMode().getTableBottomPlaceholderStyles();

		if (mPlaceholderHeight === undefined) {
			return;
		}

		rm.openStart("div", oTable.getId() + "-placeholder-bottom");
		rm.class("sapUiTablePlaceholder");
		oTable._getRowMode().applyTableBottomPlaceholderStyles(rm);
		rm.openEnd();
		rm.close("div");
	};

	// =============================================================================
	// COLUMN HEADER OF THE TABLE
	// =============================================================================

	TableRenderer.renderColHdr = function(rm, oTable) {
		var nRows = TableUtils.getHeaderRowCount(oTable);
		var aCols = oTable.getColumns();
		var iFixedColumnCount = oTable.getComputedFixedColumnCount();

		rm.openStart("div");
		rm.class("sapUiTableColHdrCnt");
		rm.openEnd();

		this.renderColRowHdr(rm, oTable);

		if (iFixedColumnCount > 0) {
			rm.openStart("div");
			rm.class("sapUiTableCHA"); // marker for the column header area
			rm.class("sapUiTableCtrlScrFixed");
			rm.class("sapUiTableNoOpacity");
			rm.openEnd();

			//
			// write fixed table here
			//
			this.renderTableControlCnt(rm, oTable, true, 0, iFixedColumnCount, true, false, 0, nRows, true);
			rm.close("div");
		}

		rm.openStart("div", oTable.getId() + "-sapUiTableColHdrScr");
		rm.class("sapUiTableCHA"); // marker for the column header area
		rm.class("sapUiTableCtrlScr");
		if (aCols.length == 0) {
			rm.class("sapUiTableHasNoColumns");
		}
		if (iFixedColumnCount > 0) {
			if (oTable._bRtlMode) {
				rm.style("margin-right", "0");
			} else {
				rm.style("margin-left", "0");
			}
		}
		rm.openEnd();

		//
		// write scrollable table here
		//
		this.renderTableControlCnt(rm, oTable, false, iFixedColumnCount, aCols.length, false, false, 0, nRows, true);

		rm.close("div");

		rm.openStart("div");
		rm.class("sapUiTableVSbHeader");
		rm.openEnd();
		rm.close("div");

		if (TableUtils.hasRowActions(oTable)) {
			rm.openStart("div");
			rm.attr("id", oTable.getId() + "-rowacthdr");
			oTable._getAccRenderExtension().writeAriaAttributesFor(rm, oTable, "ROWACTIONHEADER");

			rm.class("sapUiTableCell");
			rm.class("sapUiTableHeaderCell");
			rm.class("sapUiTableRowActionHeaderCell");
			rm.openEnd();
			rm.openStart("span");

			rm.openEnd();
			rm.text(TableUtils.getResourceText("TBL_ROW_ACTION_COLUMN_LABEL"));
			rm.close("span");

			rm.close("div");
		}

		rm.close("div");
	};

	TableRenderer.renderColRowHdr = function(rm, oTable) {
		var bEnabled = false;
		var bSelAll = false;
		var mRenderConfig = oTable._getSelectionPlugin().getRenderConfig();

		rm.openStart("div", oTable.getId() + "-selall");

		rm.class("sapUiTableCell");
		rm.class("sapUiTableHeaderCell");
		rm.class("sapUiTableRowSelectionHeaderCell");

		var sSelectAllResourceTextID;
		if (mRenderConfig.headerSelector.visible) {
			var bAllRowsSelected = TableUtils.areAllRowsSelected(oTable);

			if (mRenderConfig.headerSelector.type === "toggle") {
				sSelectAllResourceTextID = bAllRowsSelected ? "TBL_DESELECT_ALL" : "TBL_SELECT_ALL";
			} else if (mRenderConfig.headerSelector.type === "clear") {
				sSelectAllResourceTextID = "TBL_DESELECT_ALL";

				if (!mRenderConfig.headerSelector.enabled) {
					rm.class("sapUiTableSelAllDisabled");
					rm.attr("aria-disabled", "true");
				}
			}

			if (oTable._getShowStandardTooltips() && sSelectAllResourceTextID) {
				rm.attr("title", TableUtils.getResourceText(sSelectAllResourceTextID));
			}
			if (!bAllRowsSelected) {
				rm.class("sapUiTableSelAll");
			} else {
				bSelAll = true;
			}
			rm.class("sapUiTableSelAllVisible");
			bEnabled = true;
		}

		rm.attr("tabindex", "-1");

		oTable._getAccRenderExtension().writeAriaAttributesFor(rm, oTable, "COLUMNROWHEADER", {enabled: bEnabled, checked: bSelAll});

		rm.openEnd();

		if (mRenderConfig.headerSelector.visible) {
			if (mRenderConfig.headerSelector.type === "clear" && mRenderConfig.headerSelector.icon) {
				rm.renderControl(mRenderConfig.headerSelector.icon);
			} else {
				rm.openStart("div");
				rm.class("sapUiTableSelectAllCheckBox");
				rm.openEnd();
				rm.close("div");
			}
		}

		rm.close("div");
	};

	TableRenderer.renderCol = function(rm, oTable, oColumn, iHeader, nSpan, bIsFirstColumn, bIsLastFixedColumn, bIsLastColumn, bRenderIcons) {
		var oLabel,
			bInvisible = !nSpan,
			iIndex = oColumn.getIndex(),
			aLabels = oColumn.getMultiLabels();
		if (aLabels.length > 0) {
			oLabel = aLabels[iHeader];
		} else if (iHeader == 0) {
			oLabel = oColumn.getLabel();
		}

		var sHeaderId = oColumn.getId();
		if (iHeader === 0) {
			rm.openStart("td", oColumn);
		} else {
			sHeaderId = sHeaderId + "_" + iHeader;
			rm.openStart("td", sHeaderId);
		}
		rm.attr('data-sap-ui-colid', oColumn.getId());
		rm.attr("data-sap-ui-colindex", iIndex);

		rm.attr("tabindex", "-1");

		var mAccParams = {
			column: oColumn,
			headerId: sHeaderId,
			index: iIndex
		};

		if (nSpan > 1) {
			rm.attr("colspan", nSpan);
			mAccParams.colspan = true;
		}

		if (bRenderIcons) {
			var bFiltered = oColumn.getFiltered();
			var bSorted = oColumn.getSorted();

			if (bFiltered) {
				rm.class("sapUiTableColFiltered");
			}

			if (bSorted) {
				rm.class("sapUiTableColSorted");

				if (oColumn.getSortOrder() === SortOrder.Descending) {
					rm.class("sapUiTableColSortedD");
				}
			}
		}

		oTable._getAccRenderExtension().writeAriaAttributesFor(rm, oTable, "COLUMNHEADER", mAccParams);

		rm.class("sapUiTableCell");
		rm.class("sapUiTableHeaderCell");
		rm.class("sapUiTableHeaderDataCell");
		if (oTable.getEnableColumnReordering() || oTable.hasListeners("columnSelect") || oColumn._menuHasItems()) {
			rm.class("sapUiTableHeaderCellActive");
		}
		if (bIsFirstColumn) {
			rm.class("sapUiTableCellFirst");
		}
		if (bIsLastFixedColumn) {
			rm.class("sapUiTableCellLastFixed");
		}
		if (bIsLastColumn) {
			rm.class("sapUiTableCellLast");
		}
		if (bInvisible) {
			rm.class("sapUiTableHidden");
		}

		if (oTable.getColumnHeaderHeight() > 0) {
			rm.style("height", oTable.getColumnHeaderHeight() + "px");
		}
		var sTooltip = oColumn.getTooltip_AsString();
		if (sTooltip) {
			rm.attr("title", sTooltip);
		}
		rm.openEnd();

		rm.openStart("div");
		rm.class("sapUiTableCellInner");
		rm.attr("id", sHeaderId + "-inner");

		var sHAlign = oColumn.getHAlign();
		var sTextAlign = Renderer.getTextAlign(sHAlign);

		if (sTextAlign) {
			rm.style("text-align", sTextAlign);
		}

		rm.openEnd();

		rm.openStart("div");
		rm.style("justify-content", mFlexCellContentAlignment[sHAlign]);
		rm.openEnd();

		if (oLabel) {
			rm.renderControl(oLabel);
		}

		rm.close("div");

		rm.close("div");
		rm.close("td");
	};

	TableRenderer.renderColRsz = function(rm, oTable) {
		rm.openStart("div", oTable.getId() + "-rsz");
		rm.class("sapUiTableColRsz");
		rm.openEnd();
		rm.close("div");
	};

	// =============================================================================
	// CONTENT AREA OF THE TABLE
	// =============================================================================

	TableRenderer.renderRowHdr = function(rm, oTable) {
		rm.openStart("div", oTable.getId() + "-sapUiTableRowHdrScr");
		oTable._getAccRenderExtension().writeAriaAttributesFor(rm, oTable, "PRESENTATION");
		rm.class("sapUiTableRowHdrScr");
		rm.class("sapUiTableNoOpacity");
		oTable._getAccRenderExtension().writeAriaAttributesFor(rm, oTable, "ROWHEADER_COL");
		rm.openEnd();

		// start with the first current top visible row
		for (var row = 0, count = oTable.getRows().length; row < count; row++) {
			this.renderRowAddon(rm, oTable, oTable.getRows()[row], row, true);
		}

		rm.close("div");
	};

	TableRenderer.renderRowActions = function(rm, oTable) {
		if (!TableUtils.hasRowActions(oTable) && !TableUtils.hasRowNavigationIndicators(oTable)) {
			return;
		}
		rm.openStart("div", oTable.getId() + "-sapUiTableRowActionScr");
		oTable._getAccRenderExtension().writeAriaAttributesFor(rm, oTable, "PRESENTATION");
		TableUtils.hasRowActions(oTable) ? rm.class("sapUiTableRowWithAction") : rm.class("sapUiTableRowActionScr");
		rm.class("sapUiTableNoOpacity");
		rm.openEnd();

		// start with the first current top visible row
		for (var row = 0, count = oTable.getRows().length; row < count; row++) {
			this.renderRowAddon(rm, oTable, oTable.getRows()[row], row, false);
		}

		rm.close("div");
	};

	TableRenderer.addRowCSSClasses = function(rm, oTable, iIndex) {
		var mRowCounts = oTable._getRowCounts();
		var iFirstFixedBottomRowIndex = TableUtils.getFirstFixedBottomRowIndex(oTable);

		if (iIndex === 0) {
			rm.class("sapUiTableFirstRow");
		} else if (iIndex === oTable.getRows().length - 1) {
			rm.class("sapUiTableLastRow");
		}

		if (mRowCounts.fixedTop > 0) {
			if (iIndex == mRowCounts.fixedTop - 1) {
				rm.class("sapUiTableRowLastFixedTop");
			}
			if (iIndex == mRowCounts.fixedTop) {
				rm.class("sapUiTableRowFirstScrollable");
			}
		}

		if (iFirstFixedBottomRowIndex >= 0 && iFirstFixedBottomRowIndex === iIndex) {
			rm.class("sapUiTableRowFirstFixedBottom");
		} else if (iFirstFixedBottomRowIndex >= 1 && iFirstFixedBottomRowIndex - 1 === iIndex) {
			rm.class("sapUiTableRowLastScrollable");
		}
	};

	TableRenderer.renderRowAddon = function(rm, oTable, oRow, iRowIndex, bHeader) {
		var bRowSelected = oTable._getSelectionPlugin().isIndexSelected(oRow.getIndex());

		rm.openStart("div");
		oTable._getAccRenderExtension().writeAriaAttributesFor(rm, oTable, "TR", {index: iRowIndex, rowHidden: oRow.isEmpty()});
		rm.attr("data-sap-ui-related", oRow.getId());
		rm.attr("data-sap-ui-rowindex", iRowIndex);

		rm.class("sapUiTableRow");
		rm.class("sapUiTableContentRow");

		if (oRow.isContentHidden()) {
			rm.class("sapUiTableRowHidden");
		} else if (bRowSelected) {
			rm.class("sapUiTableRowSel");
		}

		if (iRowIndex % 2 != 0 && oTable.getAlternateRowColors() && !TableUtils.Grouping.isTreeMode(oTable)) {
			rm.class("sapUiTableRowAlternate");
		}

		this.addRowCSSClasses(rm, oTable, iRowIndex);

		rm.openEnd();

		rm.openStart("div", oTable.getId() + (bHeader ? "-rowsel" : "-rowact") + iRowIndex);
		rm.class("sapUiTableCell");
		rm.class("sapUiTableContentCell");
		rm.class(bHeader ? "sapUiTableRowSelectionCell" : "sapUiTableRowActionCell");

		oTable._getRowMode().renderRowStyles(rm);

		rm.attr("tabindex", "-1");

		oTable._getAccRenderExtension().writeAriaAttributesFor(rm, oTable, bHeader ? "ROWHEADER" : "ROWACTION", {rowSelected: bRowSelected, rowHidden: oRow.isEmpty()});

		rm.openEnd();
		if (bHeader) {
			this.writeRowHighlightContent(rm, oTable, oRow, iRowIndex);
			this.writeRowSelectorContent(rm, oTable, oRow, iRowIndex);
		} else {
			var oAction = oRow.getRowAction();
			if (oAction) {
				rm.renderControl(oAction);
			}
			this.writeRowNavigationContent(rm, oTable, oRow, iRowIndex);
		}
		rm.close("div");

		rm.close("div");
	};

	TableRenderer.renderTableCtrl = function(rm, oTable) {
		if (oTable.getComputedFixedColumnCount() > 0) {
			rm.openStart("div");
			rm.attr("id", oTable.getId() + "-sapUiTableCtrlScrFixed");
			rm.class("sapUiTableCtrlScrFixed");
			rm.openEnd();

			this.renderTableControl(rm, oTable, true);

			rm.close("div");
		}

		rm.openStart("div", oTable.getId() + "-sapUiTableCtrlScr");
		rm.class("sapUiTableCtrlScr");
		if (oTable.getComputedFixedColumnCount() > 0) {
			if (oTable._bRtlMode) {
				rm.style("margin-right", "0");
			} else {
				rm.style("margin-left", "0");
			}
		}
		rm.openEnd();

		rm.openStart("div", oTable.getId() + "-tableCtrlCnt");
		rm.class("sapUiTableCtrlCnt");
		rm.openEnd();

		this.renderTableControl(rm, oTable, false);

		rm.close("div");
		rm.close("div");
	};


	TableRenderer.renderTableControl = function(rm, oTable, bFixedTable) {
		var iStartColumn, iEndColumn;

		if (bFixedTable) {
			iStartColumn = 0;
			iEndColumn = oTable.getComputedFixedColumnCount();
		} else {
			iStartColumn = oTable.getComputedFixedColumnCount();
			iEndColumn = oTable.getColumns().length;
		}

		var mRowCounts = oTable._getRowCounts();
		var aRows = oTable.getRows();

		if (mRowCounts.fixedTop > 0) {
			this.renderTableControlCnt(rm, oTable, bFixedTable, iStartColumn, iEndColumn, true, false, 0, mRowCounts.fixedTop);
		}
		this.renderTableControlCnt(rm, oTable, bFixedTable, iStartColumn, iEndColumn, false, false, mRowCounts.fixedTop, aRows.length - mRowCounts.fixedBottom);
		if (mRowCounts.fixedBottom > 0 && aRows.length > 0) {
			this.renderTableControlCnt(rm, oTable, bFixedTable, iStartColumn, iEndColumn, false, true, aRows.length - mRowCounts.fixedBottom, aRows.length);
		}
	};

	TableRenderer.renderTableControlCnt = function(rm, oTable, bFixedTable, iStartColumn, iEndColumn, bFixedRow, bFixedBottomRow, iStartRow, iEndRow, bHeader) {
		var sSuffix = bHeader ? "-header" : "-table";
		var sId = oTable.getId() + sSuffix;
		var sClasses = [];

		if (bFixedTable) {
			sId += "-fixed";
			sClasses.push("sapUiTableCtrlFixed");
		} else {
			sClasses.push("sapUiTableCtrlScroll");
		}
		if (bFixedRow) {
			sId += "-fixrow";
			sClasses.push("sapUiTableCtrlRowFixed");
		} else if (bFixedBottomRow) {
			sId += "-fixrow-bottom";
			sClasses.push("sapUiTableCtrlRowFixedBottom");
		} else {
			sClasses.push("sapUiTableCtrlRowScroll");
		}

		rm.openStart("table", sId);
		sClasses.forEach(function(sClass) {
			rm.class(sClass);
		});

		oTable._getAccRenderExtension().writeAriaAttributesFor(rm, oTable, bHeader ? "COLUMNHEADER_TABLE" : "TABLE");

		rm.class("sapUiTableCtrl");
		if (bHeader) {
			rm.class("sapUiTableCHT"); // marker for the column header table
		}

		rm.style(bFixedTable ? "width" : "min-width", oTable._getColumnsWidth(iStartColumn, iEndColumn) + "px");

		rm.openEnd();

		rm.openStart("thead").openEnd();

		rm.openStart("tr");
		rm.class("sapUiTableCtrlCol");
		if (iStartRow == 0) {
			rm.class("sapUiTableCtrlFirstCol");
		}
		if (bHeader) {
			rm.class("sapUiTableCHTHR"); // marker for the column header row
		}
		rm.openEnd();

		var aCols = oTable.getColumns();
		var aColParams = new Array(iEndColumn);
		var iCol;
		var oColumn;
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
					}
				} else if (bFixedTable) {
					delete oColumn._iFixWidth;
				}
				oColParam.width = sWidth;
			}
			aColParams[iCol] = oColParam;
		}

		if (aCols.length === 0) {
			rm.openStart("th").openEnd().close("th");
		}

		for (iCol = iStartColumn; iCol < iEndColumn; iCol++) {
			sSuffix = bHeader ? "_hdr" : "_col";
			oColumn = aCols[iCol];
			oColParam = aColParams[iCol];

			if (oColParam.shouldRender) {
				if (iStartRow == 0) {
					rm.openStart("th", oTable.getId() + sSuffix + iCol);
					oTable._getAccRenderExtension().writeAriaAttributesFor(rm, oTable, "TH", {column: oColumn});
				} else {
					rm.openStart("th");
				}
				rm.style("width", oColParam.width);
				rm.attr("data-sap-ui-headcolindex", iCol);
				rm.attr("data-sap-ui-colid", oColumn.getId());
				rm.openEnd();
				if (iStartRow == 0 && TableUtils.getHeaderRowCount(oTable) == 0 && !bHeader) {
					if (oColumn.getMultiLabels().length > 0) {
						rm.renderControl(oColumn.getMultiLabels()[0]);
					} else {
						rm.renderControl(oColumn.getLabel());
					}
				}
				rm.close("th");
			}
		}

		// dummy column to fill the table width
		if (bRenderDummyColumn) {
			rm.openStart("th", bHeader && oTable.getId() + "-dummycolhdr");
			oTable._getAccRenderExtension().writeAriaAttributesFor(rm, oTable, "PRESENTATION");
			rm.openEnd().close("th");
		}

		rm.close("tr");
		rm.close("thead");

		rm.openStart("tbody").openEnd();

		var aVisibleColumns = oTable._getVisibleColumns();

		// render the table rows
		var aRows = oTable.getRows();
		var row;
		var count;
		if (bHeader) {
			for (row = iStartRow, count = iEndRow; row < count; row++) {
				this.renderColumnHeaderRow(rm, oTable, row, bFixedTable, iStartColumn, iEndColumn, bRenderDummyColumn, row === count - 1);
			}
		} else {
			// retrieve tooltip and aria texts only once and pass them to the rows _updateSelection function
			var mTooltipTexts = oTable._getAccExtension().getAriaTextsForSelectionMode(true);

			// check whether the row can be clicked to change the selection
			var bSelectOnCellsAllowed = TableUtils.isRowSelectionAllowed(oTable);
			var bRowsDraggable = oTable.getDragDropConfig().some(function(oDragDropInfo) {
				return oDragDropInfo.getMetadata().isInstanceOf("sap.ui.core.dnd.IDragInfo") && oDragDropInfo.getSourceAggregation() === "rows";
			});

			for (row = iStartRow, count = iEndRow; row < count; row++) {
				this.renderTableRow(rm, oTable, aRows[row], row, bFixedTable, iStartColumn, iEndColumn, false, aVisibleColumns, bRenderDummyColumn, mTooltipTexts, bSelectOnCellsAllowed, bRowsDraggable);
			}
		}
		rm.close("tbody");
		rm.close("table");
	};

	TableRenderer.writeRowSelectorContent = function(rm, oTable, oRow, iRowIndex) {
		oTable._getAccRenderExtension().writeAccRowSelectorText(rm, oTable, oRow, iRowIndex);

		if (TableUtils.Grouping.isGroupMode(oTable)) {
			rm.openStart("div");
			rm.class("sapUiTableGroupShield");
			rm.openEnd();
			rm.close("div");
			rm.openStart("div", oRow.getId() + "-groupHeader");
			rm.class("sapUiTableGroupIcon");
			rm.openEnd();
			rm.close("div");

			if (TableUtils.Grouping.showGroupMenuButton(oTable)) {
				var oIconInfo = IconPool.getIconInfo("sap-icon://drop-down-list");
				rm.openStart("div").class("sapUiTableGroupMenuButton").openEnd();
				rm.text(oIconInfo.content);
				rm.close("div");
			}
		}
	};

	/**
	 * Writes the row highlight element (including the accessibility text element) to the render manager.
	 *
	 * @param {sap.ui.core.RenderManager} rm The render manager to write to
	 * @param {sap.ui.table.Table} oTable Instance of the table
	 * @param {sap.ui.table.Row} oRow Instance of the row
	 * @param {int} iRowIndex Index of the row
	 */
	TableRenderer.writeRowHighlightContent = function(rm, oTable, oRow, iRowIndex) {
		if (!TableUtils.hasRowHighlights(oTable)) {
			return;
		}

		var oRowSettings = oRow.getAggregation("_settings");
		var sHighlightClass = oRowSettings._getHighlightCSSClassName();

		rm.openStart("div", oRow.getId() + "-highlight");
		rm.class("sapUiTableRowHighlight");
		rm.class(sHighlightClass);
		rm.openEnd();
		oTable._getAccRenderExtension().writeAccRowHighlightText(rm, oTable, oRow, iRowIndex);
		rm.close("div");
	};

	/**
	 * Writes the navigation indicator for a row (including the accessibility text element) to the render manager.
	 *
	 * @param {sap.ui.core.RenderManager} rm The render manager to which the indicator is written
	 * @param {sap.ui.table.Table} oTable Instance of the table
	 * @param {sap.ui.table.Row} oRow Instance of the row
	 * @param {int} iRowIndex Index of the row
	 */
	TableRenderer.writeRowNavigationContent = function(rm, oTable, oRow, iRowIndex) {
		if (!TableUtils.hasRowNavigationIndicators(oTable)) {
			return;
		}

		var oRowSettings = oRow.getAggregation("_settings");

		rm.openStart("div",  oRow.getId() + "-navIndicator");
		if (oRowSettings.getNavigated()) {
			rm.class("sapUiTableRowNavigated");
		}
		rm.openEnd();
		rm.close("div");
	};

	TableRenderer.renderColumnHeaderRow = function(rm, oTable, iRow, bFixedTable, iStartColumn, iEndColumn, bHasOnlyFixedColumns, bLastRow) {
		rm.openStart("tr");
		rm.class("sapUiTableRow");
		rm.class("sapUiTableHeaderRow");
		rm.class("sapUiTableColHdrTr");
		oTable._getAccRenderExtension().writeAriaAttributesFor(rm, oTable, "COLUMNHEADER_ROW");
		rm.openEnd();

		//
		// Render header cells
		//
		var aColumns,
			nSpan = 0,
			iLastVisibleCol = -1;

		// get columns to render
		aColumns = oTable.getColumns().slice(iStartColumn, iEndColumn).filter(function(oColumn) {
			return oColumn && oColumn.shouldRender();
		});

		// collect header spans and find the last visible column header
		function collectHeaderSpans(oColumn, index, aCols) {
			var colSpan = TableUtils.Column.getHeaderSpan(oColumn, iRow),
				iColIndex;

			if (nSpan < 1) {
				if (colSpan > 1) {
					// In case when a user makes some of the underlying columns invisible, adjust colspan
					iColIndex = oColumn.getIndex();
					colSpan = aCols.slice(index + 1, index + colSpan).reduce(function(span, column){
						return column.getIndex() - iColIndex < colSpan ? span + 1 : span;
					}, 1);
				}

				oColumn._nSpan = nSpan = colSpan;
				iLastVisibleCol = index;
			} else {
				//Render column header but this is invisible because of the previous span
				oColumn._nSpan = 0;
			}
			nSpan--;
		}
		aColumns.forEach(collectHeaderSpans);

		function renderColumn(oColumn, iIndex) {
			this.renderCol(rm, oTable, oColumn, iRow, oColumn._nSpan,
				iIndex === 0,
				bFixedTable && (iIndex == iLastVisibleCol),
				!bFixedTable && (iIndex == iLastVisibleCol),
				oColumn._nSpan === 1 && !oColumn._bIconsRendered);

			oColumn._bIconsRendered = oColumn._bIconsRendered || oColumn._nSpan === 1;
			delete oColumn._nSpan;

			if (bLastRow) {
				delete oColumn._bIconsRendered;
			}
		}
		aColumns.forEach(renderColumn.bind(this));

		if (!bFixedTable && bHasOnlyFixedColumns && aColumns.length > 0) {
			rm.openStart("td").class("sapUiTableCellDummy");
			oTable._getAccRenderExtension().writeAriaAttributesFor(rm, oTable, "PRESENTATION");
			rm.openEnd().close("td");
		}
		rm.close("tr");
	};

	TableRenderer.renderTableRow = function(rm, oTable, oRow, iRowIndex, bFixedTable, iStartColumn, iEndColumn, bFixedRow, aVisibleColumns, bHasOnlyFixedColumns, mTooltipTexts, bSelectOnCellsAllowed, bDraggable) {
		if (!oRow) {
			return;
		}

		var oSelectionPlugin = oTable._getSelectionPlugin();

		if (bFixedTable) {
			rm.openStart("tr", oRow.getId() + "-fixed");
			rm.attr("data-sap-ui-related", oRow.getId());
		} else {
			rm.openStart("tr", oRow);
		}
		if (oRow._bDummyRow) {
			rm.style("opacity", "0");
		}
		rm.class("sapUiTableRow");
		rm.class("sapUiTableContentRow");
		rm.class("sapUiTableTr");
		if (oRow.isContentHidden()) {
			rm.class("sapUiTableRowHidden");
		} else {
			if (bDraggable && bFixedTable) {
				rm.attr("draggable", true);
			}
			if (oSelectionPlugin.isIndexSelected(oRow.getIndex())) {
				rm.class("sapUiTableRowSel");
			}
		}

		if (iRowIndex % 2 != 0 && oTable.getAlternateRowColors() && !TableUtils.Grouping.isTreeMode(oTable)) {
			rm.class("sapUiTableRowAlternate");
		}

		this.addRowCSSClasses(rm, oTable, iRowIndex);

		rm.attr("data-sap-ui-rowindex", iRowIndex);
		oTable._getRowMode().renderRowStyles(rm);

		oTable._getAccRenderExtension().writeAriaAttributesFor(rm, oTable, "TR", {index: iRowIndex, rowHidden: oRow.isEmpty()});

		rm.openEnd();

		var bSelected = !oRow.isEmpty() && oSelectionPlugin.isIndexSelected(oRow.getIndex()); //see TableRenderer.renderRowAddon
		var aCells = oRow.getCells();

		for (var cell = 0, count = aCells.length; cell < count; cell++) {
			this.renderTableCell(rm, oTable, oRow, aCells[cell], cell, bFixedTable, iStartColumn, iEndColumn, aVisibleColumns, bSelected);
		}
		if (!bFixedTable && bHasOnlyFixedColumns && aCells.length > 0) {
			rm.openStart("td").class("sapUiTableCellDummy");
			oTable._getAccRenderExtension().writeAriaAttributesFor(rm, oTable, "PRESENTATION");
			rm.openEnd();
			rm.close("td");
		}
		rm.close("tr");
	};

	TableRenderer.renderTableCell = function(rm, oTable, oRow, oCell, iCellIndex, bFixedTable, iStartColumn, iEndColumn, aVisibleColumns, bSelected) {
		var oColumn = Column.ofCell(oCell);
		var iColIndex = oColumn.getIndex();
		var oLastFixedColumn = oTable.getColumns()[oTable.getFixedColumnCount() - 1];

		if (oColumn.shouldRender() && iStartColumn <= iColIndex && iEndColumn > iColIndex) {
			var sId = oRow.getId() + "-col" + iCellIndex;
			rm.openStart("td", sId);
			rm.attr("tabindex", "-1");
			rm.attr("data-sap-ui-colid", oColumn.getId());

			var nColumns = aVisibleColumns.length;
			var bIsFirstColumn = nColumns > 0 && aVisibleColumns[0] === oColumn;
			var bIsLastColumn = nColumns > 0 && aVisibleColumns[nColumns - 1] === oColumn;
			var bIsLastFixedColumn = bFixedTable & oLastFixedColumn === oColumn;

			oTable._getAccRenderExtension().writeAriaAttributesFor(rm, oTable, "DATACELL", {
				index: iColIndex,
				column: oColumn,
				row: oRow,
				fixed: bFixedTable,
				rowSelected: bSelected
			});

			var sTextAlign = Renderer.getTextAlign(oColumn.getHAlign());
			if (sTextAlign) {
				rm.style("text-align", sTextAlign);
			}

			rm.class("sapUiTableCell");
			rm.class("sapUiTableContentCell");
			rm.class("sapUiTableDataCell");
			if (bIsFirstColumn) {
				rm.class("sapUiTableCellFirst");
			}
			if (bIsLastFixedColumn) {
				rm.class("sapUiTableCellLastFixed");
			}
			if (bIsLastColumn) {
				rm.class("sapUiTableCellLast");
			}

			rm.openEnd();

			rm.openStart("div");
			rm.class("sapUiTableCellInner");
			if (bIsFirstColumn && TableUtils.Grouping.isTreeMode(oTable)) {
				rm.class("sapUiTableCellFlex"); // without flex, icon pushes contents too wide
			}

			oTable._getRowMode().renderCellContentStyles(rm);

			rm.openEnd();
			this.renderTableCellControl(rm, oTable, oCell, bIsFirstColumn);
			rm.close("div");

			rm.close("td");
		}
	};

	TableRenderer.renderTableCellControl = function(rm, oTable, oCell, bIsFirstColumn) {
		if (bIsFirstColumn && TableUtils.Grouping.isTreeMode(oTable) && !oTable._bFlatMode) {
			var oRow = oCell.getParent();
			rm.openStart("span", oRow.getId() + "-treeicon");
			rm.class("sapUiTableTreeIcon");
			rm.attr("tabindex", "-1");
			oTable._getAccRenderExtension().writeAriaAttributesFor(rm, oTable, "TREEICON", {row: oRow});
			rm.openEnd();
			rm.close("span");
		}
		rm.renderControl(oCell);
	};

	TableRenderer.renderVSb = function(rm, oTable, mConfig) {
		mConfig = Object.assign({
			cssClass: "sapUiTableVSb",
			tabIndex: true,
			hidden: true
		}, mConfig);
		mConfig.id = oTable.getId() + "-vsb";

		var oScrollExtension = oTable._getScrollExtension();

		rm.openStart("div", mConfig.id);
		rm.class(mConfig.cssClass);
		if (mConfig.hidden) {
			rm.class("sapUiTableHidden");
		}
		if (mConfig.tabIndex) {
			rm.attr("tabindex", "-1"); // Avoid focusing of the scrollbar in Firefox with tab.
		}
		rm.style("max-height", oScrollExtension.getVerticalScrollbarHeight() + "px");

		var mRowCounts = oTable._getRowCounts();
		if (mRowCounts.fixedTop > 0) {
			oTable._iVsbTop = mRowCounts.fixedTop * oTable._getBaseRowHeight() - 1;
			rm.style("top", oTable._iVsbTop  + 'px');
		}

		rm.openEnd();

		rm.openStart("div", mConfig.id + "-content");
		rm.class("sapUiTableVSbContent");
		rm.style("height", oScrollExtension.getVerticalScrollHeight() + "px");
		rm.openEnd();
		rm.close("div");

		rm.close("div");
	};

	TableRenderer.renderVSbExternal = function(rm, oTable) {
		if (ExtensionBase.isEnrichedWith(oTable, "sap.ui.table.extensions.Synchronization")) {
			this.renderVSb(rm, oTable, {
				cssClass: "sapUiTableVSbExternal",
				tabIndex: false
			});
		} else {
			Log.error("This method can only be used with synchronization enabled.", oTable, "TableRenderer.renderVSbExternal");
		}
	};

	TableRenderer.renderVSbBackground = function(rm, oTable) {
		rm.openStart("div", oTable.getId() + "-vsb-bg");
		rm.class("sapUiTableVSbBg");
		rm.openEnd().close("div");
	};

	TableRenderer.renderHSb = function(rm, oTable, mConfig) {
		mConfig = Object.assign({
			id: oTable.getId() + "-hsb",
			cssClass: "sapUiTableHSb",
			tabIndex: true,
			hidden: true,
			scrollWidth: 0
		}, mConfig);

		rm.openStart("div", mConfig.id);
		rm.class(mConfig.cssClass);
		if (mConfig.hidden) {
			rm.class("sapUiTableHidden");
		}
		if (mConfig.tabIndex) {
			rm.attr("tabindex", "-1"); // Avoid focusing of the scrollbar in Firefox with tab.
		}
		rm.openEnd();

		rm.openStart("div", mConfig.id + "-content");
		rm.class("sapUiTableHSbContent");
		if (mConfig.scrollWidth > 0) {
			rm.style("width", mConfig.scrollWidth + "px");
		}
		rm.openEnd();
		rm.close("div");

		rm.close("div");
	};

	TableRenderer.renderHSbExternal = function(rm, oTable, sId, iScrollWidth) {
		if (ExtensionBase.isEnrichedWith(oTable, "sap.ui.table.extensions.Synchronization")) {
			this.renderHSb(rm, oTable, {
				id: sId,
				cssClass: "sapUiTableHSbExternal",
				tabIndex: false,
				hidden: false,
				scrollWidth: iScrollWidth
			});
		} else {
			Log.error("This method can only be used with synchronization enabled.", oTable, "TableRenderer.renderVSbExternal");
		}
	};


	TableRenderer.renderHSbBackground = function(rm, oTable) {
		rm.openStart("div", oTable.getId() + "-hsb-bg");
		rm.class("sapUiTableHSbBg");
		rm.openEnd().close("div");
	};


	// =============================================================================
	// HELPER FUNCTIONALITY
	// =============================================================================

	/**
	 * Renders an empty area with tabindex=0 and the given class and id.
	 * @private
	 */
	TableRenderer.renderTabElement = function(rm, sClass) {
		rm.openStart("div");
		if (sClass) {
			rm.class(sClass);
		}
		rm.attr("tabindex", "0");
		rm.openEnd().close("div");
	};

	return TableRenderer;

}, /* bExport= */ true);
