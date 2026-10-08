/*!
 * ${copyright}
 */

sap.ui.define([
	"./Column",
	"./utils/TableUtils",
	"./extensions/ExtensionBase",
	"sap/ui/core/Renderer",
	"sap/ui/core/library",
	"sap/ui/Device",
	"sap/base/Log"
], function(
	Column,
	TableUtils,
	ExtensionBase,
	Renderer,
	CoreLibrary,
	Device,
	Log
) {
	"use strict";

	const SortOrder = CoreLibrary.SortOrder;
	const mFlexCellContentAlignment = {
		Begin: "flex-start",
		End: "flex-end",
		Left: undefined, // Set on every call of TableRenderer#render to respect the current text direction.
		Right: undefined, // Set on every call of TableRenderer#render to respect the current text direction.
		Center: "center"
	};
	const Hook = TableUtils.Hook.Keys.TableRenderer;

	/**
	 * Table renderer.
	 *
	 * @namespace
	 * @alias sap.ui.table.TableRenderer
	 */
	const TableRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the table.
	 *
	 * @param {sap.ui.core.RenderManager} rm RenderManager instance
	 * @param {sap.ui.table.Table} oTable Table instance
	 * @private
	 */
	TableRenderer.render = function(rm, oTable) {
		// Clear cashed header row count
		delete oTable._iHeaderRowCount;

		mFlexCellContentAlignment.Left = oTable._bRtlMode ? "flex-end" : "flex-start";
		mFlexCellContentAlignment.Right = oTable._bRtlMode ? "flex-start" : "flex-end";

		rm.openStart("div", oTable);
		this._decorateRootElement(rm, oTable);
		rm.openEnd();
		this.renderTabElement(rm, {className: "sapUiTableOuterBefore"});
		this._renderTopSection(rm, oTable);
		this._renderMainSection(rm, oTable);
		this._renderBottomSection(rm, oTable);
		this.renderTabElement(rm, {className: "sapUiTableOuterAfter"});
		rm.close("div");
	};

	/**
	 * Decorates the table's root element with attributes, styles and CSS classes.
	 *
	 * @param {sap.ui.core.RenderManager} rm RenderManager instance
	 * @param {sap.ui.table.Table} oTable Table instance
	 * @private
	 */
	TableRenderer._decorateRootElement = function(rm, oTable) {
		rm.class("sapUiTable");

		this._addBrowserSpecificClasses(rm);
		this._addTableStateClasses(rm, oTable);

		if (oTable._bFirstRendering) {
			rm.class("sapUiTableNoOpacity");
		}

		rm.style("width", oTable.getWidth());
		TableUtils.Hook.call(oTable, Hook.RenderTableStyles, rm);
	};

	/**
	 * Adds browser or environment specific CSS classes.
	 *
	 * @param {sap.ui.core.RenderManager} rm RenderManager instance
	 * @private
	 */
	TableRenderer._addBrowserSpecificClasses = function(rm) {
		if (Device.browser.chrome && window.devicePixelRatio < 1) {
			rm.class("sapUiTableZoomout");
		}

		if ('ontouchstart' in document) {
			rm.class("sapUiTableTouch");
		}
	};

	/**
	 * Adds table state related CSS classes.
	 *
	 * @param {sap.ui.core.RenderManager} rm RenderManager instance
	 * @param {sap.ui.table.Table} oTable Table instance
	 * @private
	 */
	TableRenderer._addTableStateClasses = function(rm, oTable) {
		rm.class("sapUiTableSelMode" + oTable.getSelectionMode());

		if (oTable.getColumnHeaderVisible()) {
			rm.class("sapUiTableCHdr");
		}
		if (TableUtils.hasRowHeader(oTable)) {
			rm.class("sapUiTableRowSelectors");
		}
		if (TableUtils.hasRowHighlights(oTable)) {
			rm.class("sapUiTableRowHighlights");
		}
		if (TableUtils.isNoDataVisible(oTable) && !oTable._isWaitingForData()) {
			rm.class("sapUiTableEmpty");
		}
		if (oTable.getShowOverlay()) {
			rm.class("sapUiTableOverlay");
		}

		const oScrollExtension = oTable._getScrollExtension();
		if (oScrollExtension.isVerticalScrollbarRequired() && !oScrollExtension.isVerticalScrollbarExternal()) {
			rm.class("sapUiTableVScr");
		}

		this._addRowActionClasses(rm, oTable);

		const sModeClass = TableUtils.Grouping.getModeCssClass(oTable);
		if (sModeClass) {
			rm.class(sModeClass);
		}
	};

	/**
	 * Adds CSS classes indicating available row actions or navigation indicators.
	 *
	 * @param {sap.ui.core.RenderManager} rm RenderManager instance
	 * @param {sap.ui.table.Table} oTable Table instance
	 * @private
	 */
	TableRenderer._addRowActionClasses = function(rm, oTable) {
		if (TableUtils.hasRowActions(oTable)) {
			rm.class("sapUiTableRAct");
			switch (oTable.getRowActionCount()) {
				case 1:
					rm.class("sapUiTableRActS");
					break;
				case 2:
					rm.class("sapUiTableRActM");
					break;
				default:
					rm.class("sapUiTableRActL");
			}
		}

		if (TableUtils.hasRowNavigationIndicators(oTable)) {
			rm.class("sapUiTableRowNavIndicator");
		}
	};

	/**
	 * Renders the top area containing, for example, extensions.
	 *
	 * @param {sap.ui.core.RenderManager} rm RenderManager instance
	 * @param {sap.ui.table.Table} oTable Table instance
	 * @private
	 */
	TableRenderer._renderTopSection = function(rm, oTable) {
		rm.openStart("div", oTable.getId() + "-before");
		rm.class("sapUiTableBefore");
		rm.openEnd();
		rm.renderControl(oTable.getAggregation("_messageStrip"));
		this.renderExtensions(rm, oTable);
		rm.close("div");
	};

	/**
	 * Renders the main content area containing the actual table.
	 *
	 * @param {sap.ui.core.RenderManager} rm RenderManager instance
	 * @param {sap.ui.table.Table} oTable Table instance
	 * @private
	 */
	TableRenderer._renderMainSection = function(rm, oTable) {
		const oAccRenderExtension = oTable._getAccRenderExtension();
		const bHasFocusableContent = oTable.getRows().length || oTable.getColumnHeaderVisible();

		rm.openStart("div", oTable.getId() + "-sapUiTableCnt");
		rm.class("sapUiTableCnt");
		rm.attr("data-sap-ui-fastnavgroup", "true");
		rm.attr("data-sap-ui-pasteregion", "true");
		rm.openEnd();

		if (!oTable._getScrollExtension().isVerticalScrollbarExternal()) {
			this.renderVSb(rm, oTable);
		}

		this.renderTabElement(rm, {className: "sapUiTableCtrlBefore", tabIndex: bHasFocusableContent ? "0" : "-1"});

		rm.openStart("div", oTable.getId() + "-sapUiTableGridCnt");
		oAccRenderExtension.writeAriaAttributesFor(rm, oTable, "Content");
		rm.openEnd();
		this.renderColumnResizer(rm, oTable);
		this.renderColumnHeader(rm, oTable);
		this.renderTable(rm, oTable);
		rm.close("div");

		this.renderTabElement(rm, {className: "sapUiTableCtrlAfter", tabIndex: bHasFocusableContent ? "0" : "-1"});
		this.renderTabElement(rm, {tabIndex: "-1", id: oTable.getId() + "-focusDummy"});

		const oCreationRow = oTable.getCreationRow();
		if (oCreationRow && oCreationRow.getVisible()) {
			rm.renderControl(oCreationRow);
		}

		this.renderHSbBackground(rm, oTable);
		this.renderHSb(rm, oTable);
		this._renderOverlay(rm, oTable);
		oAccRenderExtension.writeHiddenAccTexts(rm, oTable);

		rm.close("div");
	};

	/**
	 * Renders the column resize handle.
	 *
	 * @param {sap.ui.core.RenderManager} rm RenderManager instance
	 * @param {sap.ui.table.Table} oTable Table instance
	 * @private
	 */
	TableRenderer.renderColumnResizer = function(rm, oTable) {
		rm.openStart("div", oTable.getId() + "-rsz");
		rm.class("sapUiTableColRsz");
		rm.openEnd();
		rm.close("div");
	};

	/**
	 * Renders the column header rows.
	 *
	 * @param {sap.ui.core.RenderManager} rm RenderManager instance
	 * @param {sap.ui.table.Table} oTable Table instance
	 * @private
	 */
	TableRenderer.renderColumnHeader = function(rm, oTable) {
		const iHeaderRowCount = TableUtils.getHeaderRowCount(oTable);
		const iFixedColumnCount = oTable.getComputedFixedColumnCount();

		rm.openStart("div", oTable.getId() + "-sapUiTableColHdrCnt");
		rm.class("sapUiTableColHdrCnt");
		rm.openEnd();
		this._renderSelectionHeader(rm, oTable);
		this._renderFixedColumnHeader(rm, oTable, {
			fixedColumnCount: iFixedColumnCount,
			headerRowCount: iHeaderRowCount
		});
		this._renderScrollableColumnHeader(rm, oTable, {
			fixedColumnCount: iFixedColumnCount,
			headerRowCount: iHeaderRowCount
		});
		this._renderRowActionHeader(rm, oTable);
		this._renderVSbHeader(rm);
		rm.close("div");
	};

	/**
	 * Renders the overlay area.
	 *
	 * @param {sap.ui.core.RenderManager} rm RenderManager instance
	 * @param {sap.ui.table.Table} oTable Table instance
	 * @private
	 */
	TableRenderer._renderOverlay = function(rm, oTable) {
		rm.openStart("div", oTable.getId() + "-overlay");
		rm.class("sapUiTableOverlayArea");
		rm.attr("tabindex", "0");
		oTable._getAccRenderExtension().writeAriaAttributesFor(rm, oTable, "Overlay");
		rm.openEnd();
		// When the overlay is empty JAWS does not announce the labels associated via aria-labelledby, so we add a non-breaking space as workaround.
		// (DINC0913798)
		rm.text("\u00a0");
		rm.close("div");
	};

	/**
	 * Renders the bottom area containing, for example, the footer.
	 *
	 * @param {sap.ui.core.RenderManager} rm RenderManager instance
	 * @param {sap.ui.table.Table} oTable Table instance
	 * @private
	 */
	TableRenderer._renderBottomSection = function(rm, oTable) {
		rm.openStart("div", oTable.getId() + "-after");
		rm.openEnd();
		this.renderFooter(rm, oTable);
		TableUtils.Hook.call(oTable, Hook.RenderInTableBottomArea, rm);
		rm.close("div");
	};

	/**
	 * Renders all extension controls of the table.
	 *
	 * @param {sap.ui.core.RenderManager} rm RenderManager instance
	 * @param {sap.ui.table.Table} oTable Table instance providing the extensions
	 * @private
	 */
	TableRenderer.renderExtensions = function(rm, oTable) {
		for (const oExtension of oTable.getExtension() ?? []) {
			this.renderExtension(rm, oTable, oExtension);
		}
	};

	/**
	 * Renders one extension control.
	 *
	 * @param {sap.ui.core.RenderManager} rm RenderManager instance
	 * @param {sap.ui.table.Table} oTable Table instance
	 * @param {sap.ui.core.Control} oExtension Extension control
	 * @private
	 */
	TableRenderer.renderExtension = function(rm, oTable, oExtension) {
		rm.openStart("div");
		rm.class("sapUiTableExt");
		oTable._getAccRenderExtension().writeAriaAttributesFor(rm, oTable, "TableSubHeader");
		rm.openEnd();
		rm.renderControl(oExtension);
		rm.close("div");
	};

	/**
	 * Renders the footer of the table.
	 *
	 * @param {sap.ui.core.RenderManager} rm RenderManager instance
	 * @param {sap.ui.table.Table} oTable Table instance
	 * @private
	 */
	TableRenderer.renderFooter = function(rm, oTable) {
		const oFooter = oTable.getFooter();

		if (!oFooter) {
			return;
		}

		rm.openStart("div");
		rm.class("sapUiTableFtr");
		oTable._getAccRenderExtension().writeAriaAttributesFor(rm, oTable, "TableFooter");
		rm.openEnd();
		rm.renderControl(oFooter);
		rm.close("div");
	};

	/**
	 * Renders the area containing the content rows.
	 *
	 * @param {sap.ui.core.RenderManager} rm RenderManager instance
	 * @param {sap.ui.table.Table} oTable Table instance
	 * @private
	 */
	TableRenderer.renderTable = function(rm, oTable) {
		rm.openStart("div", oTable.getId() + "-tableCCnt");
		TableUtils.Hook.call(oTable, Hook.RenderRowContainerStyles, rm);
		rm.class("sapUiTableCCnt");
		rm.openEnd();
		this.renderTableCCnt(rm, oTable);
		rm.close("div");
	};

	/**
	 * Renders the table content components.
	 *
	 * @param {sap.ui.core.RenderManager} rm RenderManager instance
	 * @param {sap.ui.table.Table} oTable Table instance
	 * @private
	 */
	TableRenderer.renderTableCCnt = function(rm, oTable) {
		this.renderTableCtrl(rm, oTable);
		this.renderRowHeader(rm, oTable);
		this.renderRowActions(rm, oTable);
		this._renderNoData(rm, oTable);
	};

	/**
	 * Renders the NoData element.
	 *
	 * @param {sap.ui.core.RenderManager} rm RenderManager instance
	 * @param {sap.ui.table.Table} oTable Table instance
	 * @private
	 */
	TableRenderer._renderNoData = function(rm, oTable) {
		rm.openStart("div", oTable.getId() + "-noDataCnt");
		rm.class("sapUiTableCtrlEmpty");
		rm.attr("tabindex", "0");
		oTable._getAccRenderExtension().writeAriaAttributesFor(rm, oTable, "NoData");
		rm.openEnd();

		const vNoContentMessage = TableUtils.getNoContentMessage(oTable);

		if (TableUtils.isA(vNoContentMessage, "sap.ui.core.Control")) {
			rm.renderControl(vNoContentMessage);
		} else {
			rm.openStart("span", oTable.getId() + "-noDataMsg");
			rm.class("sapUiTableCtrlEmptyMsg");
			rm.openEnd();
			rm.text(vNoContentMessage);
			rm.close("span");
		}

		rm.close("div");
	};

	/**
	 * Renders the fixed columns portion of the column header if there are fixed columns.
	 *
	 * @param {sap.ui.core.RenderManager} rm RenderManager instance
	 * @param {sap.ui.table.Table} oTable Table instance
	 * @param {object} mConfig Configuration object
	 * @param {int} mConfig.fixedColumnCount Number of fixed columns
	 * @param {int} mConfig.headerRowCount Number of header rows
	 * @private
	 */
	TableRenderer._renderFixedColumnHeader = function(rm, oTable, mConfig) {
		if (mConfig.fixedColumnCount === 0) {
			return;
		}

		rm.openStart("div");
		rm.class("sapUiTableCHA"); // marker for the column header area
		rm.class("sapUiTableCtrlScrFixed");
		rm.class("sapUiTableNoOpacity");
		rm.openEnd();
		this.renderTableElement(rm, oTable, {
			fixedColumns: true,
			startColumnIndex: 0,
			endColumnIndex: mConfig.fixedColumnCount,
			fixedTopRows: true,
			fixedBottomRows: false,
			startRowIndex: 0,
			endRowIndex: mConfig.headerRowCount,
			header: true
		});
		rm.close("div");
	};

	/**
	 * Renders the scrollable portion of the column header.
	 *
	 * @param {sap.ui.core.RenderManager} rm RenderManager instance
	 * @param {sap.ui.table.Table} oTable Table instance
	 * @param {object} mConfig Configuration object
	 * @param {int} mConfig.fixedColumnCount Number of fixed columns
	 * @param {int} mConfig.headerRowCount Number of header rows
	 * @private
	 */
	TableRenderer._renderScrollableColumnHeader = function(rm, oTable, mConfig) {
		const aColumns = oTable.getColumns();

		rm.openStart("div", oTable.getId() + "-sapUiTableColHdrScr");
		rm.class("sapUiTableCHA"); // marker for the column header area
		rm.class("sapUiTableCtrlScr");

		if (aColumns.length === 0) {
			rm.class("sapUiTableHasNoColumns");
		}

		if (mConfig.fixedColumnCount > 0) {
			if (oTable._bRtlMode) {
				rm.style("margin-right", "0");
			} else {
				rm.style("margin-left", "0");
			}
		}

		rm.openEnd();
		this.renderTableElement(rm, oTable, {
			fixedColumns: false,
			startColumnIndex: mConfig.fixedColumnCount,
			endColumnIndex: aColumns.length,
			fixedTopRows: false,
			fixedBottomRows: false,
			startRowIndex: 0,
			endRowIndex: mConfig.headerRowCount,
			header: true
		});
		rm.close("div");
	};

	/**
	 * Renders the row action header cell when row actions are enabled.
	 *
	 * @param {sap.ui.core.RenderManager} rm RenderManager instance
	 * @param {sap.ui.table.Table} oTable Table instance
	 * @private
	 */
	TableRenderer._renderRowActionHeader = function(rm, oTable) {
		if (!TableUtils.hasRowActions(oTable)) {
			return;
		}

		rm.openStart("div", oTable.getId() + "-rowacthdr");
		oTable._getAccRenderExtension().writeAriaAttributesFor(rm, oTable, "RowActionHeader");
		rm.class("sapUiTableCell");
		rm.class("sapUiTableHeaderCell");
		rm.class("sapUiTableRowActionHeaderCell");
		rm.attr("tabindex", "-1");
		rm.attr("aria-label", TableUtils.getResourceText("TBL_ROW_ACTION_COLUMN_LABEL"));
		rm.openEnd();
		rm.close("div");
	};

	/**
	 * Renders a placeholder header cell for the internal vertical scrollbar.
	 *
	 * @param {sap.ui.core.RenderManager} rm RenderManager instance
	 * @private
	 */
	TableRenderer._renderVSbHeader = function(rm) {
		rm.openStart("div");
		rm.class("sapUiTableVSbHeader");
		rm.openEnd();
		rm.close("div");
	};

	/**
	 * Renders the row selection header area.
	 *
	 * @param {sap.ui.core.RenderManager} rm RenderManager instance
	 * @param {sap.ui.table.Table} oTable Table instance
	 * @private
	 */
	TableRenderer._renderSelectionHeader = function(rm, oTable) {
		const oAccRenderExtension = oTable._getAccRenderExtension();

		rm.openStart("div");
		oAccRenderExtension.writeAriaAttributesFor(rm, oTable, "ColumnRowHeaderRow");
		rm.openEnd();

		const iHeaderRowCount = TableUtils.getHeaderRowCount(oTable);
		if (iHeaderRowCount > 1) {
			// In multi label scenario extra hidden cells are rendered in order to maintain correct aria-ownns relationship for each header row. They
			// are rendered in the same row which does not affect the announcement because the row has aria-hidden.
			for (let i = 0; i < iHeaderRowCount - 1; i++) {
				rm.openStart("div", oTable.getId() + "-rowcolhdr" + i);
				oAccRenderExtension.writeAriaAttributesFor(rm, oTable, "ColumnRowHeaderCell", {bLabel: false});
				rm.openEnd();
				rm.close("div");
			}
			rm.openStart("div", oTable.getId() + "-rowcolhdr" + (iHeaderRowCount - 1));
		} else {
			rm.openStart("div", oTable.getId() + "-rowcolhdr");
		}

		oAccRenderExtension.writeAriaAttributesFor(rm, oTable, "ColumnRowHeaderCell", {bLabel: true});
		rm.openEnd();
		rm.renderControl(oTable._getHeaderSelector());
		rm.close("div");
		rm.close("div");
	};

	/**
	 * Renders the row header area containing row header cells for each data row.
	 *
	 * @param {sap.ui.core.RenderManager} rm RenderManager instance
	 * @param {sap.ui.table.Table} oTable Table instance
	 * @private
	 */
	TableRenderer.renderRowHeader = function(rm, oTable) {
		const oAccRenderExtension = oTable._getAccRenderExtension();
		const aRows = oTable.getRows();

		rm.openStart("div", oTable.getId() + "-sapUiTableRowHdrScr");
		oAccRenderExtension.writeAriaAttributesFor(rm, oTable, "Presentation");
		rm.class("sapUiTableRowHdrScr");
		rm.class("sapUiTableNoOpacity");
		oAccRenderExtension.writeAriaAttributesFor(rm, oTable, "RowHeaderCol");
		rm.openEnd();

		for (let iRowIndex = 0, iRowCount = aRows.length; iRowIndex < iRowCount; iRowIndex++) {
			this.renderRowAddon(rm, oTable, aRows[iRowIndex], {rowIndex: iRowIndex, isRowHeader: true});
		}

		rm.close("div");
	};

	/**
	 * Renders the row action area containing row action cells for each data row.
	 *
	 * @param {sap.ui.core.RenderManager} rm RenderManager instance
	 * @param {sap.ui.table.Table} oTable Table instance
	 * @private
	 */
	TableRenderer.renderRowActions = function(rm, oTable) {
		if (!TableUtils.hasRowActions(oTable) && !TableUtils.hasRowNavigationIndicators(oTable)) {
			return;
		}

		const aRows = oTable.getRows();

		rm.openStart("div", oTable.getId() + "-sapUiTableRowActionScr");
		oTable._getAccRenderExtension().writeAriaAttributesFor(rm, oTable, "Presentation");
		if (TableUtils.hasRowActions(oTable)) {
			rm.class("sapUiTableRowWithAction");
		} else {
			rm.class("sapUiTableRowActionScr");
		}
		rm.class("sapUiTableNoOpacity");
		rm.openEnd();

		for (let iRowIndex = 0, iRowCount = aRows.length; iRowIndex < iRowCount; iRowIndex++) {
			this.renderRowAddon(rm, oTable, aRows[iRowIndex], {rowIndex: iRowIndex, isRowHeader: false});
		}

		rm.close("div");
	};

	/**
	 * Renders a row addon entry for either the row header or the row action area.
	 *
	 * @param {sap.ui.core.RenderManager} rm RenderManager instance
	 * @param {sap.ui.table.Table} oTable Table instance
	 * @param {sap.ui.table.Row} oRow Row instance
	 * @param {object} mConfig Configuration object
	 * @param {int} mConfig.rowIndex Index of the row in the aggregation
	 * @param {boolean} mConfig.isRowHeader True for row header area; false for action area
	 * @private
	 */
	TableRenderer.renderRowAddon = function(rm, oTable, oRow, mConfig) {
		const bRowSelected = oRow._isSelected();
		const oAccRenderExtension = oTable._getAccRenderExtension();

		rm.openStart("div");
		oAccRenderExtension.writeAriaAttributesFor(rm, oTable, "RowAddon");
		rm.attr("data-sap-ui-related", oRow.getId());
		rm.attr("data-sap-ui-rowindex", mConfig.rowIndex);

		rm.class("sapUiTableRow");
		rm.class("sapUiTableContentRow");

		if (oRow.isContentHidden()) {
			rm.class("sapUiTableRowHidden");
		} else if (bRowSelected) {
			rm.class("sapUiTableRowSel");
		}

		if (mConfig.rowIndex % 2 !== 0 && oTable.getAlternateRowColors() && !TableUtils.Grouping.isInTreeMode(oTable)) {
			rm.class("sapUiTableRowAlternate");
		}

		this.addRowClasses(rm, oTable, mConfig.rowIndex);

		rm.openEnd();
		rm.openStart("div", oTable.getId() + (mConfig.isRowHeader ? "-rowsel" : "-rowact") + mConfig.rowIndex);
		rm.class("sapUiTableCell");
		rm.class("sapUiTableContentCell");
		rm.class(mConfig.isRowHeader ? "sapUiTableRowSelectionCell" : "sapUiTableRowActionCell");

		TableUtils.Hook.call(oTable, Hook.RenderRowStyles, rm);

		rm.attr("tabindex", "-1");

		oAccRenderExtension.writeAriaAttributesFor(rm, oTable, mConfig.isRowHeader ? "RowHeader" : "RowAction", {
			rowSelected: bRowSelected,
			rowHidden: oRow.isEmpty()
		});

		rm.openEnd();
		if (mConfig.isRowHeader) {
			this.writeRowHighlightContent(rm, oTable, oRow);
			this.writeRowSelectorContent(rm, oTable, oRow);
		} else {
			const oAction = oRow.getRowAction();
			if (oAction) {
				rm.renderControl(oAction);
			}
			this.writeRowNavigationContent(rm, oTable, oRow);
		}
		rm.close("div");

		rm.close("div");
	};

	/**
	 * Renders the table control area containing fixed and scrollable data sections.
	 *
	 * @param {sap.ui.core.RenderManager} rm RenderManager instance
	 * @param {sap.ui.table.Table} oTable Table instance
	 * @private
	 */
	TableRenderer.renderTableCtrl = function(rm, oTable) {
		if (oTable.getComputedFixedColumnCount() > 0) {
			rm.openStart("div", oTable.getId() + "-sapUiTableCtrlScrFixed");
			rm.class("sapUiTableCtrlScrFixed");
			rm.openEnd();
			this.renderTableControl(rm, oTable, {fixedColumns: true});
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
		this.renderTableControl(rm, oTable, {fixedColumns: false});
		rm.close("div");

		rm.close("div");
	};

	/**
	 * Renders a table control section (either fixed columns or scrollable columns).
	 *
	 * @param {sap.ui.core.RenderManager} rm RenderManager instance
	 * @param {sap.ui.table.Table} oTable Table instance
	 * @param {object} mConfig Configuration object
	 * @param {boolean} mConfig.fixedColumns True if fixed columns area
	 * @private
	 */
	TableRenderer.renderTableControl = function(rm, oTable, mConfig) {
		const mRowCounts = oTable._getRowCounts();
		const aRows = oTable.getRows();
		let iStartColumnIndex;
		let iEndColumnIndex;

		if (mConfig.fixedColumns) {
			iStartColumnIndex = 0;
			iEndColumnIndex = oTable.getComputedFixedColumnCount();
		} else {
			iStartColumnIndex = oTable.getComputedFixedColumnCount();
			iEndColumnIndex = oTable.getColumns().length;
		}

		if (mRowCounts.fixedTop > 0) {
			this.renderTableElement(rm, oTable, {
				fixedColumns: mConfig.fixedColumns,
				startColumnIndex: iStartColumnIndex,
				endColumnIndex: iEndColumnIndex,
				fixedTopRows: true,
				fixedBottomRows: false,
				startRowIndex: 0,
				endRowIndex: mRowCounts.fixedTop,
				header: false
			});
		}

		this.renderTableElement(rm, oTable, {
			fixedColumns: mConfig.fixedColumns,
			startColumnIndex: iStartColumnIndex,
			endColumnIndex: iEndColumnIndex,
			fixedTopRows: false,
			fixedBottomRows: false,
			startRowIndex: mRowCounts.fixedTop,
			endRowIndex: aRows.length - mRowCounts.fixedBottom,
			header: false
		});

		if (mRowCounts.fixedBottom > 0 && aRows.length > 0) {
			this.renderTableElement(rm, oTable, {
				fixedColumns: mConfig.fixedColumns,
				startColumnIndex: iStartColumnIndex,
				endColumnIndex: iEndColumnIndex,
				fixedTopRows: false,
				fixedBottomRows: true,
				startRowIndex: aRows.length - mRowCounts.fixedBottom,
				endRowIndex: aRows.length,
				header: false
			});
		}
	};

	/**
	 * Renders an table element covering a defined column and row slice.
	 *
	 * @param {sap.ui.core.RenderManager} rm RenderManager instance
	 * @param {sap.ui.table.Table} oTable Table instance
	 * @param {object} mConfig Configuration object
	 * @param {boolean} mConfig.fixedColumns True if segment is in fixed columns area
	 * @param {boolean} mConfig.fixedTopRows True if segment shows fixed top rows
	 * @param {boolean} mConfig.fixedBottomRows True if segment shows fixed bottom rows
	 * @param {int} mConfig.startColumnIndex Start column index (inclusive)
	 * @param {int} mConfig.endColumnIndex End column index (exclusive)
	 * @param {int} mConfig.startRowIndex Start row index (inclusive)
	 * @param {int} mConfig.endRowIndex End row index (exclusive)
	 * @param {boolean} mConfig.header True if header segment
	 * @private
	 */
	TableRenderer.renderTableElement = function(rm, oTable, mConfig) {
		const {fixedColumns, startColumnIndex, endColumnIndex, fixedTopRows, fixedBottomRows, startRowIndex, endRowIndex, header} = mConfig;
		const sId = this._buildTableSectionId(oTable, {fixedColumns, fixedTopRows, fixedBottomRows, header});

		rm.openStart("table", sId);
		this._decorateTableElement(rm, oTable, {fixedColumns, fixedTopRows, fixedBottomRows, startColumnIndex, endColumnIndex, header});
		rm.openEnd();
		this._renderTableHead(rm, oTable, {fixedColumns, startColumnIndex, endColumnIndex, startRowIndex, header});
		this._renderTableBody(rm, oTable, {fixedColumns, startColumnIndex, endColumnIndex, startRowIndex, endRowIndex, header});
		rm.close("table");
	};

	/**
	 * Builds the table section ID.
	 *
	 * @param {sap.ui.table.Table} oTable Table instance
	 * @param {object} mConfig Configuration object
	 * @param {boolean} mConfig.fixedColumns True if fixed columns area
	 * @param {boolean} mConfig.fixedTopRows True if fixed top rows area
	 * @param {boolean} mConfig.fixedBottomRows True if fixed bottom rows area
	 * @param {boolean} mConfig.header True if header section
	 * @returns {string} Table section ID
	 * @private
	 */
	TableRenderer._buildTableSectionId = function(oTable, mConfig) {
		const {fixedColumns, fixedTopRows, fixedBottomRows, header} = mConfig;
		const suffix = header ? "-header" : "-table";
		let id = oTable.getId() + suffix;

		if (fixedColumns) {
			id += "-fixed";
		}

		if (fixedTopRows) {
			id += "-fixrow";
		} else if (fixedBottomRows) {
			id += "-fixrow-bottom";
		}

		return id;
	};

	/**
	 * Decorates the table element with attributes, styles and CSS classes.
	 *
	 * @param {sap.ui.core.RenderManager} rm RenderManager instance
	 * @param {sap.ui.table.Table} oTable Table instance
	 * @param {object} mConfig Configuration object
	 * @param {boolean} mConfig.fixedColumns True if fixed columns area
	 * @param {boolean} mConfig.fixedTopRows True if fixed top rows area
	 * @param {boolean} mConfig.fixedBottomRows True if fixed bottom rows area
	 * @param {int} mConfig.startColumnIndex Start column index (inclusive)
	 * @param {int} mConfig.endColumnIndex End column index (exclusive)
	 * @param {boolean} mConfig.header True if header table
	 * @private
	 */
	TableRenderer._decorateTableElement = function(rm, oTable, mConfig) {
		rm.class(mConfig.fixedColumns ? "sapUiTableCtrlFixed" : "sapUiTableCtrlScroll");

		if (mConfig.fixedTopRows) {
			rm.class("sapUiTableCtrlRowFixed");
		} else if (mConfig.fixedBottomRows) {
			rm.class("sapUiTableCtrlRowFixedBottom");
		} else {
			rm.class("sapUiTableCtrlRowScroll");
		}

		if (mConfig.header) {
			rm.class("sapUiTableCHT");
		}

		rm.class("sapUiTableCtrl");
		oTable._getAccRenderExtension().writeAriaAttributesFor(rm, oTable, mConfig.header ? "Presentation" : "Table");
		rm.style(mConfig.fixedColumns ? "width" : "min-width", oTable._getColumnsWidth(mConfig.startColumnIndex, mConfig.endColumnIndex) + "px");
	};

	/**
	 * Renders the table head section.
	 *
	 * @param {sap.ui.core.RenderManager} rm RenderManager instance
	 * @param {sap.ui.table.Table} oTable Table instance
	 * @param {object} mConfig Configuration object
	 * @param {boolean} mConfig.fixedColumns True if fixed columns area
	 * @param {int} mConfig.startColumnIndex Start column index (inclusive)
	 * @param {int} mConfig.endColumnIndex End column index (exclusive)
	 * @param {int} mConfig.startRowIndex Start row index (inclusive)
	 * @param {boolean} mConfig.header True if header table
	 * @private
	 */
	TableRenderer._renderTableHead = function(rm, oTable, mConfig) {
		rm.openStart("thead").openEnd();
		const {fixedColumns, startColumnIndex, endColumnIndex, startRowIndex, header} = mConfig;
		this._renderTableHeaderRow(rm, oTable, {fixedColumns, startColumnIndex, endColumnIndex, startRowIndex, header});
		rm.close("thead");
	};

	/**
	 * Renders the table header row.
	 *
	 * @param {sap.ui.core.RenderManager} rm RenderManager instance
	 * @param {sap.ui.table.Table} oTable Table instance
	 * @param {object} mConfig Configuration object
	 * @param {boolean} mConfig.fixedColumns True if fixed columns area
	 * @param {int} mConfig.startColumnIndex Start column index (inclusive)
	 * @param {int} mConfig.endColumnIndex End column index (exclusive)
	 * @param {int} mConfig.startRowIndex Start row index (inclusive)
	 * @param {boolean} mConfig.header True if header table
	 * @private
	 */
	TableRenderer._renderTableHeaderRow = function(rm, oTable, mConfig) {
		rm.openStart("tr");
		rm.class("sapUiTableCtrlCol");
		if (mConfig.startRowIndex === 0) {
			rm.class("sapUiTableCtrlFirstCol");
		}
		if (mConfig.header) {
			rm.class("sapUiTableCHTHR");
		}
		rm.openEnd();

		const {fixedColumns, startColumnIndex, endColumnIndex, startRowIndex, header} = mConfig;
		const mColumnData = this._prepareColumnData(oTable, {fixedColumns, startColumnIndex, endColumnIndex});
		this._renderTableColumns(rm, oTable, {columnData: mColumnData, startColumnIndex, endColumnIndex, startRowIndex, header});

		if (mColumnData.bRenderDummyColumn) {
			this._renderDummyColumnHeaderCell(rm, oTable, {header});
		}

		rm.close("tr");
	};

	/**
	 * Prepares per-column metadata needed for rendering.
	 *
	 * @param {sap.ui.table.Table} oTable Table instance
	 * @param {object} mConfig Configuration object
	 * @param {boolean} mConfig.fixedColumns True if preparing data for the fixed columns area
	 * @param {int} mConfig.startColumnIndex Start column index (inclusive)
	 * @param {int} mConfig.endColumnIndex End column index (exclusive)
	 * @returns {object} Object containing:
	 *   {sap.ui.table.Column[]} aCols All columns of the table
	 *   {object[]} aColParams Per-column params with properties {shouldRender:boolean, width:string|undefined}
	 *   {boolean} bRenderDummyColumn True if dummy column should be rendered for variable-width balancing
	 *   {sap.ui.table.Column[]} aVisibleColumns Currently visible columns
	 * @private
	 */
	TableRenderer._prepareColumnData = function(oTable, mConfig) {
		const aCols = oTable.getColumns();
		const aColParams = new Array(mConfig.endColumnIndex);
		let bRenderDummyColumn = !mConfig.fixedColumns && mConfig.endColumnIndex > mConfig.startColumnIndex;

		for (let iCol = mConfig.startColumnIndex; iCol < mConfig.endColumnIndex; iCol++) {
			const oColumn = aCols[iCol];
			const oColParam = {
				shouldRender: !!(oColumn && oColumn.shouldRender())
			};

			if (oColParam.shouldRender) {
				let sWidth = oColumn.getWidth();
				if (TableUtils.isVariableWidth(sWidth)) {
					bRenderDummyColumn = false;
					if (mConfig.fixedColumns) {
						oColumn._iFixWidth = oColumn._iFixWidth || 160;
						sWidth = oColumn._iFixWidth + "px";
					}
				} else if (mConfig.fixedColumns) {
					delete oColumn._iFixWidth;
				}
				oColParam.width = sWidth;
			}
			aColParams[iCol] = oColParam;
		}

		return {
			aCols,
			aColParams,
			bRenderDummyColumn,
			aVisibleColumns: oTable._getVisibleColumns()
		};
	};

	/**
	 * Renders table columns.
	 *
	 * @param {sap.ui.core.RenderManager} rm RenderManager instance
	 * @param {sap.ui.table.Table} oTable Table instance
	 * @param {object} mConfig Configuration object
	 * @param {object} mConfig.columnData Prepared column data
	 * @param {int} mConfig.startColumnIndex Start column index (inclusive)
	 * @param {int} mConfig.endColumnIndex End column index (exclusive)
	 * @param {int} mConfig.startRowIndex Start row index (inclusive)
	 * @param {boolean} mConfig.header True if header table
	 * @private
	 */
	TableRenderer._renderTableColumns = function(rm, oTable, mConfig) {
		const {columnData, startColumnIndex, endColumnIndex, startRowIndex, header} = mConfig;
		const {aCols, aColParams, aVisibleColumns} = columnData;
		const oAccRenderExtension = oTable._getAccRenderExtension();

		if (aCols.length === 0) {
			rm.openStart("th").openEnd().close("th");
			return;
		}

		for (let iCol = startColumnIndex; iCol < endColumnIndex; iCol++) {
			const sSuffix = header ? "_hdr" : "_col";
			const oColumn = aCols[iCol];
			const oColParam = aColParams[iCol];

			if (oColParam.shouldRender) {
				if (startRowIndex === 0) {
					rm.openStart("th", oTable.getId() + sSuffix + iCol);
					oAccRenderExtension.writeAriaAttributesFor(rm, oTable, "Th", {column: oColumn});
				} else {
					rm.openStart("th");
				}

				rm.style("width", oColParam.width);
				rm.attr("data-sap-ui-headcolindex", iCol);
				rm.attr("data-sap-ui-colid", oColumn.getId());

				if (oColumn === aVisibleColumns[0]) {
					rm.class("sapUiTableFirstVisibleColumnTH");
				}

				rm.openEnd();

				if (startRowIndex === 0 && TableUtils.getHeaderRowCount(oTable) === 0 && !header) {
					if (oColumn.getMultiLabels().length > 0) {
						rm.renderControl(oColumn.getMultiLabels()[0]);
					} else {
						rm.renderControl(oColumn.getLabel());
					}
				}

				rm.close("th");
			}
		}
	};

	/**
	 * Renders the header cell of the dummy column.
	 *
	 * @param {sap.ui.core.RenderManager} rm RenderManager instance
	 * @param {sap.ui.table.Table} oTable Table instance
	 * @param {object} mConfig Configuration object
	 * @param {boolean} mConfig.header True if header table
	 * @private
	 */
	TableRenderer._renderDummyColumnHeaderCell = function(rm, oTable, mConfig) {
		rm.openStart("th", mConfig.header && oTable.getId() + "-dummycolhdr");
		oTable._getAccRenderExtension().writeAriaAttributesFor(rm, oTable, "Presentation");
		rm.openEnd();
		rm.close("th");
	};

	/**
	 * Renders the body rows (either header rows for a header segment or data rows for a data segment).
	 *
	 * @param {sap.ui.core.RenderManager} rm RenderManager instance
	 * @param {sap.ui.table.Table} oTable Table instance
	 * @param {object} mConfig Configuration object
	 * @param {boolean} mConfig.fixedColumns True if fixed columns area
	 * @param {int} mConfig.startColumnIndex Start column index (inclusive)
	 * @param {int} mConfig.endColumnIndex End column index (exclusive)
	 * @param {int} mConfig.startRowIndex Start row index (inclusive)
	 * @param {int} mConfig.endRowIndex End row index (exclusive)
	 * @param {boolean} mConfig.header True if rendering a header segment
	 * @private
	 */
	TableRenderer._renderTableBody = function(rm, oTable, mConfig) {
		const {fixedColumns, startColumnIndex, endColumnIndex, startRowIndex, endRowIndex} = mConfig;
		const mColumnData = this._prepareColumnData(oTable, {fixedColumns, startColumnIndex, endColumnIndex});

		rm.openStart("tbody");
		rm.openEnd();

		if (mConfig.header) {
			this._renderHeaderRows(rm, oTable, {
				fixedColumns,
				startColumnIndex,
				endColumnIndex,
				startRowIndex,
				endRowIndex,
				renderDummyColumn: mColumnData.bRenderDummyColumn
			});
		} else {
			this._renderDataRows(rm, oTable, {
				fixedColumns,
				startColumnIndex,
				endColumnIndex,
				startRowIndex,
				endRowIndex,
				visibleColumns: mColumnData.aVisibleColumns,
				renderDummyColumn: mColumnData.bRenderDummyColumn
			});
		}

		rm.close("tbody");
	};

	/**
	 * Renders all header rows for a header table segment.
	 *
	 * @param {sap.ui.core.RenderManager} rm RenderManager instance
	 * @param {sap.ui.table.Table} oTable Table instance
	 * @param {object} mConfig Configuration object
	 * @param {boolean} mConfig.fixedColumns True if fixed columns area
	 * @param {int} mConfig.startColumnIndex Start column index (inclusive)
	 * @param {int} mConfig.endColumnIndex End column index (exclusive)
	 * @param {int} mConfig.startRowIndex First header row index (inclusive)
	 * @param {int} mConfig.endRowIndex One past last header row index (exclusive)
	 * @param {boolean} mConfig.renderDummyColumn True if dummy column should be rendered
	 * @private
	 */
	TableRenderer._renderHeaderRows = function(rm, oTable, mConfig) {
		const {fixedColumns, startColumnIndex, endColumnIndex, renderDummyColumn} = mConfig;
		for (let iRowIndex = mConfig.startRowIndex; iRowIndex < mConfig.endRowIndex; iRowIndex++) {
			this.renderColumnHeaderRow(rm, oTable, {
				rowIndex: iRowIndex,
				fixedColumns,
				startColumnIndex,
				endColumnIndex,
				renderDummyColumn,
				isLastRow: iRowIndex === mConfig.endRowIndex - 1
			});
		}
	};
	/**
	 * Renders data rows for a data table segment.
	 *
	 * @param {sap.ui.core.RenderManager} rm RenderManager instance
	 * @param {sap.ui.table.Table} oTable Table instance
	 * @param {object} mConfig Configuration object
	 * @param {boolean} mConfig.fixedColumns True if fixed columns area
	 * @param {int} mConfig.startColumnIndex Start column index (inclusive)
	 * @param {int} mConfig.endColumnIndex End column index (exclusive)
	 * @param {int} mConfig.startRowIndex Start row index (inclusive)
	 * @param {int} mConfig.endRowIndex End row index (exclusive)
	 * @param {sap.ui.table.Column[]} mConfig.visibleColumns Visible columns
	 * @param {boolean} mConfig.renderDummyColumn True if dummy column should be rendered
	 * @private
	 */
	TableRenderer._renderDataRows = function(rm, oTable, mConfig) {
		const {fixedColumns, startColumnIndex, endColumnIndex, visibleColumns, renderDummyColumn} = mConfig;
		const aRows = oTable.getRows();

		if (aRows.length === 0) {
			return;
		}

		const bRowsDraggable = oTable.getDragDropConfig().some((oDragDropInfo) => oDragDropInfo.isDraggable(oTable, "rows"));
		const iLastFixedColumnIndex = this.getLastFixedColumnIndex(oTable);

		for (let iRowIndex = mConfig.startRowIndex; iRowIndex < mConfig.endRowIndex; iRowIndex++) {
			this.renderDataRow(rm, oTable, aRows[iRowIndex], {
				rowIndex: iRowIndex,
				fixedColumns,
				startColumnIndex: startColumnIndex,
				endColumnIndex: endColumnIndex,
				visibleColumns,
				lastFixedColumnIndex: iLastFixedColumnIndex,
				renderDummyColumn,
				draggable: bRowsDraggable
			});
		}
	};

	/**
	 * Writes the content of a row selector cell including group icons and accessibility text.
	 *
	 * @param {sap.ui.core.RenderManager} rm RenderManager instance
	 * @param {sap.ui.table.Table} oTable Table instance
	 * @param {sap.ui.table.Row} oRow Row instance
	 */
	TableRenderer.writeRowSelectorContent = function(rm, oTable, oRow) {
		if (TableUtils.Grouping.isInGroupMode(oTable)) {
			rm.openStart("div");
			rm.class("sapUiTableGroupShield");
			rm.openEnd();
			rm.close("div");
			rm.openStart("div", oRow.getId() + "-groupHeader");
			rm.class("sapUiTableGroupIcon");
			rm.openEnd();
			rm.openStart("span");
			rm.class("sapUiTableGroupHeaderText");
			rm.openEnd();
			rm.close("span");
			rm.close("div");
		}
	};

	/**
	 * Writes the row highlight element (including the accessibility text element) to the render manager.
	 *
	 * @param {sap.ui.core.RenderManager} rm RenderManager instance
	 * @param {sap.ui.table.Table} oTable Table instance
	 * @param {sap.ui.table.Row} oRow Row instance
	 */
	TableRenderer.writeRowHighlightContent = function(rm, oTable, oRow) {
		if (!TableUtils.hasRowHighlights(oTable)) {
			return;
		}

		const oRowSettings = oRow.getAggregation("_settings");
		const sHighlightClass = oRowSettings._getHighlightCSSClassName();

		rm.openStart("div", oRow.getId() + "-highlight");
		rm.class("sapUiTableRowHighlight");
		rm.class(sHighlightClass);
		rm.openEnd();
		oTable._getAccRenderExtension().writeAccRowHighlightText(rm, oTable, oRow);
		rm.close("div");
	};

	/**
	 * Writes the navigation indicator for a row (including the accessibility text element) to the render manager.
	 *
	 * @param {sap.ui.core.RenderManager} rm RenderManager instance
	 * @param {sap.ui.table.Table} oTable Table instance
	 * @param {sap.ui.table.Row} oRow Row instance
	 */
	TableRenderer.writeRowNavigationContent = function(rm, oTable, oRow) {
		if (!TableUtils.hasRowNavigationIndicators(oTable)) {
			return;
		}

		const oRowSettings = oRow.getAggregation("_settings");

		rm.openStart("div", oRow.getId() + "-navIndicator");
		if (oRowSettings.getNavigated()) {
			rm.class("sapUiTableRowNavigated");
		}
		rm.openEnd();
		rm.close("div");
	};

	/**
	 * Renders a column header row.
	 *
	 * @param {sap.ui.core.RenderManager} rm RenderManager instance
	 * @param {sap.ui.table.Table} oTable Table instance
	 * @param {object} mConfig Configuration object
	 * @param {boolean} mConfig.fixedColumns True if fixed columns area
	 * @param {int} mConfig.startColumnIndex Start column index (inclusive)
	 * @param {int} mConfig.endColumnIndex End column index (exclusive)
	 * @param {boolean} mConfig.renderDummyColumn True if only fixed columns are present
	 * @param {boolean} mConfig.isLastRow True if last header row
	 * @private
	 */
	TableRenderer.renderColumnHeaderRow = function(rm, oTable, mConfig) {
		const {rowIndex, fixedColumns, startColumnIndex, endColumnIndex, isLastRow} = mConfig;
		const oAccRenderExtension = oTable._getAccRenderExtension();

		rm.openStart("tr");
		rm.class("sapUiTableRow");
		rm.class("sapUiTableHeaderRow");
		rm.class("sapUiTableColHdrTr");
		oAccRenderExtension.writeAriaAttributesFor(rm, oTable, "ColumnHeaderRow", {rowIndex, fixedCol: fixedColumns});
		rm.openEnd();

		const aColumns = this.getColumnsToRender(oTable, startColumnIndex, endColumnIndex);
		const iLastVisibleColumnIndex = this._collectHeaderSpans(aColumns, rowIndex);
		this._renderHeaderColumns(rm, oTable, aColumns, {rowIndex, fixedColumns, lastVisibleColumnIndex: iLastVisibleColumnIndex, isLastRow});

		if (!fixedColumns && mConfig.renderDummyColumn && aColumns.length > 0) {
			this._renderDummyColumnContentCell(rm, oTable);
		}

		rm.close("tr");
	};

	/**
	 * Calculates column spans for header cells in multi-label scenarios and returns the index of the last visible column.
	 *
	 * @param {sap.ui.table.Column[]} aColumns Array of columns to process
	 * @param {int} iRowIndex Header row index
	 * @returns {int} Index of the last visible column
	 * @private
	 */
	TableRenderer._collectHeaderSpans = function(aColumns, iRowIndex) {
		let nSpan = 0;
		let iLastVisibleCol = -1;

		for (const [index, oColumn] of aColumns.entries()) {
			let colSpan = TableUtils.Column.getHeaderSpan(oColumn, iRowIndex);
			let iColIndex;

			if (nSpan < 1) {
				if (colSpan > 1) {
					// In case when a user makes some of the underlying columns invisible, adjust colspan
					iColIndex = oColumn.getIndex();
					colSpan = aColumns.slice(index + 1, index + colSpan).reduce((span, column) => {
						return column.getIndex() - iColIndex < colSpan ? span + 1 : span;
					}, 1);
				}

				oColumn._nSpan = nSpan = colSpan;
				iLastVisibleCol = index;
			} else {
				// Render column header but this is invisible because of the previous span
				oColumn._nSpan = 0;
			}
			nSpan--;
		}

		return iLastVisibleCol;
	};

	/**
	 * Renders all column headers in a header row.
	 *
	 * @param {sap.ui.core.RenderManager} rm RenderManager instance
	 * @param {sap.ui.table.Table} oTable Table instance
	 * @param {sap.ui.table.Column[]} aColumns Array of columns to render
	 * @param {object} mConfig Configuration object
	 * @param {int} mConfig.rowIndex Header row index
	 * @param {boolean} mConfig.fixedColumns True if fixed columns area
	 * @param {int} mConfig.lastVisibleColumnIndex Index of the last visible column
	 * @param {boolean} mConfig.isLastRow True if last header row
	 * @private
	 */
	TableRenderer._renderHeaderColumns = function(rm, oTable, aColumns, mConfig) {
		aColumns.forEach((oColumn, iIndex) => {
			this.renderColumnHeaderCell(rm, oTable, oColumn, {
				rowIndex: mConfig.rowIndex,
				span: oColumn._nSpan,
				isFirstColumn: iIndex === 0,
				isLastFixedColumn: mConfig.fixedColumns && (iIndex === mConfig.lastVisibleColumnIndex),
				isLastColumn: !mConfig.fixedColumns && (iIndex === mConfig.lastVisibleColumnIndex),
				renderIcons: oColumn._nSpan === 1 && !oColumn._bIconsRendered
			});
			oColumn._bIconsRendered = oColumn._bIconsRendered || oColumn._nSpan === 1;
			delete oColumn._nSpan;

			if (mConfig.isLastRow) {
				delete oColumn._bIconsRendered;
			}
		});
	};

	/**
	 * Renders a column header cell.
	 *
	 * @param {sap.ui.core.RenderManager} rm RenderManager instance
	 * @param {sap.ui.table.Table} oTable Table instance
	 * @param {sap.ui.table.Column} oColumn Column instance to render
	 * @param {object} mConfig Configuration object
	 * @param {int} mConfig.rowIndex Header row index
	 * @param {int} mConfig.span Computed column span (0 = hidden in this row)
	 * @param {boolean} mConfig.isFirstColumn True if first visible column in area
	 * @param {boolean} mConfig.isLastFixedColumn True if last visible fixed column
	 * @param {boolean} mConfig.isLastColumn True if last visible column overall
	 * @param {boolean} mConfig.renderIcons True if sort/filter icons should be rendered
	 * @private
	 */
	TableRenderer.renderColumnHeaderCell = function(rm, oTable, oColumn, mConfig) {
		const sHeaderId = mConfig.rowIndex === 0 ? oColumn.getId() : `${oColumn.getId()}_${mConfig.rowIndex}`;

		rm.openStart("td", mConfig.rowIndex === 0 ? oColumn : sHeaderId);
		this._decorateColumnHeaderCell(rm, oTable, oColumn, {
			span: mConfig.span,
			isFirstColumn: mConfig.isFirstColumn,
			isLastFixedColumn: mConfig.isLastFixedColumn,
			isLastColumn: mConfig.isLastColumn,
			renderIcons: mConfig.renderIcons,
			headerId: sHeaderId
		});
		rm.openEnd();

		rm.openStart("div", sHeaderId + "-inner");
		this._decorateColumnHeaderCellInner(rm, oTable, oColumn, {isFirstColumn: mConfig.isFirstColumn});
		rm.openEnd();
		rm.openStart("div");
		rm.style("justify-content", mFlexCellContentAlignment[oColumn.getHAlign()]);
		rm.openEnd();
		this._renderColumnHeaderCellContent(rm, oColumn, {rowIndex: mConfig.rowIndex});
		rm.close("div");
		rm.close("div");

		rm.close("td");
	};

	/**
	 * Decorates a column header cell with attributes, styles and CSS classes.
	 *
	 * @param {sap.ui.core.RenderManager} rm RenderManager instance
	 * @param {sap.ui.table.Table} oTable Table instance
	 * @param {sap.ui.table.Column} oColumn Column instance
	 * @param {object} mConfig Configuration object
	 * @param {int} mConfig.span Computed column span (0 = hidden in this row)
	 * @param {boolean} mConfig.isFirstColumn True if first column
	 * @param {boolean} mConfig.isLastFixedColumn True if last fixed column
	 * @param {boolean} mConfig.isLastColumn True if last column
	 * @param {boolean} mConfig.renderIcons True if sort and filter icons should be rendered
	 * @param {string} mConfig.headerId Header ID
	 * @private
	 */
	TableRenderer._decorateColumnHeaderCell = function(rm, oTable, oColumn, mConfig) {
		const {span, headerId, isFirstColumn, isLastFixedColumn, isLastColumn, renderIcons} = mConfig;

		this._setColumnHeaderCellAttributes(rm, oTable, oColumn, {span, headerId});
		this._setColumnHeaderCellStyles(rm, oTable);
		this._addColumnHeaderCellClasses(rm, oTable, oColumn, {
			isFirstColumn,
			isLastFixedColumn,
			isLastColumn,
			isHiddenBySpan: !span,
			renderIcons
		});
	};

	/**
	 * Sets column header cell attributes.
	 *
	 * @param {sap.ui.core.RenderManager} rm RenderManager instance
	 * @param {sap.ui.table.Table} oTable Table instance
	 * @param {sap.ui.table.Column} oColumn Column instance
	 * @param {object} mConfig Configuration object
	 * @param {int} mConfig.span Computed column span (0 = hidden in this row)
	 * @param {string} mConfig.headerId Header ID
	 * @private
	 */
	TableRenderer._setColumnHeaderCellAttributes = function(rm, oTable, oColumn, mConfig) {
		rm.attr('data-sap-ui-related', oColumn.getId());
		rm.attr('data-sap-ui-colid', oColumn.getId());
		rm.attr("data-sap-ui-colindex", oColumn.getIndex());
		rm.attr("tabindex", "-1");

		if (mConfig.span > 1) {
			rm.attr("colspan", mConfig.span);
		}

		const sTooltip = oColumn.getTooltip_AsString();
		if (sTooltip) {
			rm.attr("title", sTooltip);
		}

		oTable._getAccRenderExtension().writeAriaAttributesFor(rm, oTable, "ColumnHeader", {
			column: oColumn,
			headerId: mConfig.headerId,
			colspan: mConfig.span > 1
		});
	};

	/**
	 * Sets column header cell styles.
	 *
	 * @param {sap.ui.core.RenderManager} rm RenderManager instance
	 * @param {sap.ui.table.Table} oTable Table instance
	 * @private
	 */
	TableRenderer._setColumnHeaderCellStyles = function(rm, oTable) {
		const iColumnHeaderHeight = oTable.getColumnHeaderHeight();

		if (iColumnHeaderHeight > 0) {
			rm.style("height", iColumnHeaderHeight + "px");
		}
	};

	/**
	 * Adds column header cell CSS classes.
	 *
	 * @param {sap.ui.core.RenderManager} rm RenderManager instance
	 * @param {sap.ui.table.Table} oTable Table instance
	 * @param {sap.ui.table.Column} oColumn Column instance
	 * @param {object} mConfig Configuration object
	 * @param {boolean} mConfig.isFirstColumn True if first column
	 * @param {boolean} mConfig.isLastFixedColumn True if last fixed column
	 * @param {boolean} mConfig.isLastColumn True if last column
	 * @param {boolean} mConfig.isHiddenBySpan True if hidden because of span
	 * @param {boolean} mConfig.renderIcons True if sort and filter icons should be rendered
	 * @private
	 */
	TableRenderer._addColumnHeaderCellClasses = function(rm, oTable, oColumn, mConfig) {
		rm.class("sapUiTableCell");
		rm.class("sapUiTableHeaderCell");
		rm.class("sapUiTableHeaderDataCell");

		const oColumnHeaderMenu = oColumn.getHeaderMenuInstance();
		if (oTable.getEnableColumnReordering() || oColumnHeaderMenu && oColumnHeaderMenu.getAriaHasPopupType() !== "None") {
			rm.class("sapUiTableHeaderCellActive");
		}

		if (mConfig.isHiddenBySpan) {
			rm.class("sapUiTableHidden");
		}

		const {isFirstColumn, isLastFixedColumn, isLastColumn} = mConfig;
		this._addCellPositionClasses(rm, {isFirstColumn, isLastFixedColumn, isLastColumn});

		if (mConfig.renderIcons) {
			this._addColumnSortAndFilterClasses(rm, oColumn);
		}
	};

	/**
	 * Adds sorting and filtering marker CSS classes to a header cell.
	 *
	 * @param {sap.ui.core.RenderManager} rm RenderManager instance
	 * @param {sap.ui.table.Column} oColumn Column instance
	 * @private
	 */
	TableRenderer._addColumnSortAndFilterClasses = function(rm, oColumn) {
		const bFiltered = oColumn.getFiltered();
		const bSorted = oColumn.getSortOrder() !== SortOrder.None;

		if (bFiltered) {
			rm.class("sapUiTableColFiltered");
		}

		if (bSorted) {
			rm.class("sapUiTableColSorted");
			if (oColumn.getSortOrder() === SortOrder.Descending) {
				rm.class("sapUiTableColSortedD");
			}
		}
	};

	/**
	 * Decorates the cell content wrapper of a column header cell with attributes, styles and CSS classes.
	 *
	 * @param {sap.ui.core.RenderManager} rm RenderManager instance
	 * @param {sap.ui.table.Table} oTable Table instance
	 * @param {sap.ui.table.Column} oColumn Column instance
	 * @param {object} mConfig Configuration object
	 * @param {boolean} mConfig.isFirstColumn True if first visible column in area
	 * @private
	 */
	TableRenderer._decorateColumnHeaderCellInner = function(rm, oTable, oColumn, mConfig) {
		const sHAlign = oColumn.getHAlign();

		rm.class("sapUiTableCellInner");

		if (!TableUtils.hasRowHeader(oTable) && mConfig.isFirstColumn &&
			!TableUtils.hasRowHighlights(oTable) && !TableUtils.Grouping.isInTreeMode(oTable)) {
			rm.class("sapUiTableFirstColumnCell");
		}

		const sTextAlign = Renderer.getTextAlign(sHAlign);
		if (sTextAlign) {
			rm.style("text-align", sTextAlign);
		}
	};

	/**
	 * Renders the content of a column header cell.
	 *
	 * @param {sap.ui.core.RenderManager} rm RenderManager instance
	 * @param {sap.ui.table.Column} oColumn Column instance
	 * @param {object} mConfig Configuration object
	 * @param {int} mConfig.rowIndex Header row index
	 * @private
	 */
	TableRenderer._renderColumnHeaderCellContent = function(rm, oColumn, mConfig) {
		const oAction = oColumn.getAggregation("_action");
		const oLabel = this._getColumnLabel(oColumn, mConfig.rowIndex);

		if (oAction && mConfig.rowIndex === 0) {
			if (oColumn.getMultiLabels().length > 0) {
				Log.error(`${oColumn}: ColumnAIAction is not compatible with multi labels`);
			} else {
				rm.renderControl(oAction);
			}
		}

		if (oLabel) {
			rm.renderControl(oLabel);
		}
	};

	/**
	 * Gets the label for a column header.
	 *
	 * @param {sap.ui.table.Column} oColumn Column instance
	 * @param {int} iHeader Header index
	 * @returns {sap.ui.core.Control|undefined} Header label control or undefined if none exists
	 * @private
	 */
	TableRenderer._getColumnLabel = function(oColumn, iHeader) {
		const aLabels = oColumn.getMultiLabels();

		if (aLabels.length > 0) {
			return aLabels[iHeader];
		} else if (iHeader === 0) {
			return oColumn.getLabel();
		}

		return undefined;
	};

	/**
	 * Renders a data row.
	 *
	 * @param {sap.ui.core.RenderManager} rm RenderManager instance
	 * @param {sap.ui.table.Table} oTable Table instance
	 * @param {sap.ui.table.Row} oRow Row instance
	 * @param {object} mConfig Configuration object
	 * @param {int} mConfig.rowIndex Index of the row in the aggregation
	 * @param {boolean} mConfig.fixedColumns True if rendering in the fixed columns area
	 * @param {int} mConfig.startColumnIndex Start column index (inclusive)
	 * @param {int} mConfig.endColumnIndex End column index (exclusive)
	 * @param {sap.ui.table.Column[]} mConfig.visibleColumns Visible columns
	 * @param {int|undefined} mConfig.lastFixedColumnIndex Index of last fixed column (or undefined if none)
	 * @param {boolean} mConfig.renderDummyColumn True if a dummy column should be rendered (scrollable area balancing)
	 * @param {boolean} mConfig.draggable True if row is draggable
	 * @private
	 */
	TableRenderer.renderDataRow = function(rm, oTable, oRow, mConfig) {
		const {rowIndex, fixedColumns, draggable} = mConfig;

		if (fixedColumns) {
			rm.openStart("tr", oRow.getId() + "-fixed");
		} else {
			rm.openStart("tr", oRow);
		}

		this._decorateDataRow(rm, oTable, oRow, {rowIndex, fixedColumns, draggable});
		rm.openEnd();

		const {startColumnIndex, endColumnIndex, visibleColumns, lastFixedColumnIndex, renderDummyColumn} = mConfig;
		this._renderDataCells(rm, oTable, oRow, {
			fixedColumns,
			startColumnIndex,
			endColumnIndex,
			visibleColumns,
			lastFixedColumnIndex,
			renderDummyColumn
		});

		rm.close("tr");
	};

	/**
	 * Decorates a data row with attributes, styles and CSS classes.
	 *
	 * @param {sap.ui.core.RenderManager} rm RenderManager instance
	 * @param {sap.ui.table.Table} oTable Table instance
	 * @param {sap.ui.table.Row} oRow Row instance
	 * @param {object} mConfig Configuration object
	 * @param {int} mConfig.rowIndex Index of the row in the aggregation
	 * @param {boolean} mConfig.fixedColumns True if rendering in the fixed columns area
	 * @param {boolean} mConfig.draggable True if row is draggable
	 * @private
	 */
	TableRenderer._decorateDataRow = function(rm, oTable, oRow, mConfig) {
		const {rowIndex, fixedColumns, draggable} = mConfig;

		this._setDataRowAttributes(rm, oTable, oRow, {rowIndex, fixedColumns, draggable});
		this._addDataRowClasses(rm, oTable, oRow, {rowIndex});
		TableUtils.Hook.call(oTable, Hook.RenderRowStyles, rm);
	};

	/**
	 * Sets data row attributes.
	 *
	 * @param {sap.ui.core.RenderManager} rm RenderManager instance
	 * @param {sap.ui.table.Table} oTable Table instance
	 * @param {sap.ui.table.Row} oRow Row instance
	 * @param {object} mConfig Configuration object
	 * @param {int} mConfig.rowIndex Index of the row in the aggregation
	 * @param {boolean} mConfig.fixedColumns True if rendering in the fixed columns area
	 * @param {boolean} mConfig.draggable True if row is draggable
	 * @private
	 */
	TableRenderer._setDataRowAttributes = function(rm, oTable, oRow, mConfig) {
		rm.attr("data-sap-ui-rowindex", mConfig.rowIndex);

		if (mConfig.fixedColumns) {
			rm.attr("data-sap-ui-related", oRow.getId());
		}

		if (mConfig.draggable && mConfig.fixedColumns) {
			rm.attr("draggable", "true");
			rm.attr("data-sap-ui-draggable", "true");
		}

		oTable._getAccRenderExtension().writeAriaAttributesFor(rm, oTable, "Tr", {
			index: mConfig.rowIndex,
			fixedCol: mConfig.fixedColumns,
			rowNavigated: oRow.getAggregation("_settings")?.getNavigated() ?? false
		});
	};

	/**
	 * Adds CSS classes to a data row.
	 *
	 * @param {sap.ui.core.RenderManager} rm RenderManager instance
	 * @param {sap.ui.table.Table} oTable Table instance
	 * @param {sap.ui.table.Row} oRow Row instance
	 * @param {object} mConfig Configuration object
	 * @param {int} mConfig.rowIndex Index of the row in the aggregation
	 * @private
	 */
	TableRenderer._addDataRowClasses = function(rm, oTable, oRow, mConfig) {
		rm.class("sapUiTableRow");
		rm.class("sapUiTableContentRow");
		rm.class("sapUiTableTr");

		if (oRow.isContentHidden()) {
			rm.class("sapUiTableRowHidden");
		} else if (oRow._isSelected()) {
			rm.class("sapUiTableRowSel");
		}

		if (mConfig.rowIndex % 2 !== 0 && oTable.getAlternateRowColors() && !TableUtils.Grouping.isInTreeMode(oTable)) {
			rm.class("sapUiTableRowAlternate");
		}

		this.addRowClasses(rm, oTable, mConfig.rowIndex);
	};

	/**
	 * Adds CSS classes to a row based on its position and table state.
	 *
	 * @param {sap.ui.core.RenderManager} rm RenderManager instance
	 * @param {sap.ui.table.Table} oTable Table instance
	 * @param {int} iIndex Index of the row in the aggregation
	 * @private
	 */
	TableRenderer.addRowClasses = function(rm, oTable, iIndex) {
		const mRowCounts = oTable._getRowCounts();
		const iFirstFixedBottomRowIndex = TableUtils.getFirstFixedBottomRowIndex(oTable);

		if (iIndex === 0) {
			rm.class("sapUiTableFirstRow");
		} else if (iIndex === oTable.getRows().length - 1) {
			rm.class("sapUiTableLastRow");
		}

		if (mRowCounts.fixedTop > 0) {
			if (iIndex === mRowCounts.fixedTop - 1) {
				rm.class("sapUiTableRowLastFixedTop");
			}
			if (iIndex === mRowCounts.fixedTop) {
				rm.class("sapUiTableRowFirstScrollable");
			}
		}

		if (iFirstFixedBottomRowIndex >= 0 && iFirstFixedBottomRowIndex === iIndex) {
			rm.class("sapUiTableRowFirstFixedBottom");
		} else if (iFirstFixedBottomRowIndex >= 1 && iFirstFixedBottomRowIndex - 1 === iIndex) {
			rm.class("sapUiTableRowLastScrollable");
		}
	};

	/**
	 * Renders all data cells for a row.
	 *
	 * @param {sap.ui.core.RenderManager} rm RenderManager instance
	 * @param {sap.ui.table.Table} oTable Table instance
	 * @param {sap.ui.table.Row} oRow Row instance
	 * @param {object} mConfig Configuration object
	 * @param {boolean} mConfig.fixedColumns True if fixed column area
	 * @param {int} mConfig.startColumnIndex Start column index
	 * @param {int} mConfig.endColumnIndex End column index
	 * @param {sap.ui.table.Column[]} mConfig.visibleColumns Visible columns array
	 * @param {int|undefined} mConfig.lastFixedColumnIndex Index of last fixed column
	 * @param {boolean} mConfig.renderDummyColumn True if only fixed columns exist in this area
	 */
	TableRenderer._renderDataCells = function(rm, oTable, oRow, mConfig) {
		const aCells = oRow.getCells();
		const {fixedColumns, startColumnIndex, endColumnIndex, visibleColumns, lastFixedColumnIndex} = mConfig;

		for (let iCellIndex = 0, iCellCount = aCells.length; iCellIndex < iCellCount; iCellIndex++) {
			this._renderDataCell(rm, oTable, oRow, aCells[iCellIndex], {
				cellIndex: iCellIndex,
				fixedColumns,
				startColumnIndex,
				endColumnIndex,
				visibleColumns,
				lastFixedColumnIndex
			});
		}

		if (!mConfig.fixedColumns && mConfig.renderDummyColumn && aCells.length > 0) {
			this._renderDummyColumnContentCell(rm, oTable);
		}
	};

	/**
	 * Renders a content cell of the dummy column.
	 *
	 * @param {sap.ui.core.RenderManager} rm RenderManager instance
	 * @param {sap.ui.table.Table} oTable Table instance
	 * @private
	 */
	TableRenderer._renderDummyColumnContentCell = function(rm, oTable) {
		rm.openStart("td").class("sapUiTableCellDummy");
		oTable._getAccRenderExtension().writeAriaAttributesFor(rm, oTable, "Presentation");
		rm.openEnd();
		rm.close("td");
	};

	/**
	 * Renders a data cell.
	 *
	 * @param {sap.ui.core.RenderManager} rm RenderManager instance
	 * @param {sap.ui.table.Table} oTable Table instance
	 * @param {sap.ui.table.Row} oRow Parent row instance
	 * @param {sap.ui.core.Control} oCell Cell control to render
	 * @param {object} mConfig Configuration object
	 * @param {int} mConfig.cellIndex Index of the cell within the row
	 * @param {boolean} mConfig.fixedColumns True if in fixed columns area
	 * @param {int} mConfig.startColumnIndex Start column index
	 * @param {int} mConfig.endColumnIndex End column index
	 * @param {sap.ui.table.Column[]} mConfig.visibleColumns Visible columns
	 * @param {int|undefined} mConfig.lastFixedColumnIndex Last fixed column index
	 */
	TableRenderer._renderDataCell = function(rm, oTable, oRow, oCell, mConfig) {
		const oColumn = Column.ofCell(oCell);
		const iColumnIndex = oColumn.getIndex();
		const bShouldRenderCell = oColumn.shouldRender() && mConfig.startColumnIndex <= iColumnIndex && mConfig.endColumnIndex > iColumnIndex;

		if (!bShouldRenderCell) {
			return;
		}

		const iVisibleColumnCount = mConfig.visibleColumns.length;
		const bIsFirstColumn = iVisibleColumnCount > 0 && mConfig.visibleColumns[0] === oColumn;
		const bIsLastColumn = iVisibleColumnCount > 0 && mConfig.visibleColumns[iVisibleColumnCount - 1] === oColumn;
		const bIsLastFixedColumn = mConfig.fixedColumns && mConfig.lastFixedColumnIndex === iColumnIndex;

		rm.openStart("td", oRow.getId() + "-col" + mConfig.cellIndex);
		this._decorateDataCell(rm, oTable, oColumn, {
			isFirstColumn: bIsFirstColumn,
			isLastFixedColumn: bIsLastFixedColumn,
			isLastColumn: bIsLastColumn
		});
		rm.openEnd();
		this._renderDataCellContent(rm, oTable, oCell, oColumn, mConfig.visibleColumns);
		rm.close("td");
	};

	/**
	 * Decorates a data cell with attributes, styles and CSS classes.
	 *
	 * @param {sap.ui.core.RenderManager} rm RenderManager instance
	 * @param {sap.ui.table.Table} oTable Table instance
	 * @param {sap.ui.table.Column} oColumn Column instance
	 * @param {object} mConfig Configuration object
	 * @param {boolean} mConfig.isFirstColumn True if first visible column
	 * @param {boolean} mConfig.isLastFixedColumn True if last fixed column
	 * @param {boolean} mConfig.isLastColumn True if last visible column overall
	 * @private
	 */
	TableRenderer._decorateDataCell = function(rm, oTable, oColumn, mConfig) {
		const {isFirstColumn, isLastFixedColumn, isLastColumn} = mConfig;

		this._setDataCellAttributes(rm, oTable, oColumn);
		this._setDataCellStyles(rm, oColumn);
		this._addDataCellClasses(rm, oTable, {isFirstColumn, isLastFixedColumn, isLastColumn});
	};

	/**
	 * Writes data cell attributes.
	 *
	 * @param {sap.ui.core.RenderManager} rm RenderManager instance
	 * @param {sap.ui.table.Table} oTable Table instance
	 * @param {sap.ui.table.Column} oColumn Column instance
	 * @private
	 */
	TableRenderer._setDataCellAttributes = function(rm, oTable, oColumn) {
		rm.attr("tabindex", "-1");
		rm.attr("data-sap-ui-colid", oColumn.getId());
		oTable._getAccRenderExtension().writeAriaAttributesFor(rm, oTable, "DataCell", {
			column: oColumn
		});
	};

	/**
	 * Sets data cell styles.
	 *
	 * @param {sap.ui.core.RenderManager} rm RenderManager instance
	 * @param {sap.ui.table.Column} oColumn Column instance
	 * @private
	 */
	TableRenderer._setDataCellStyles = function(rm, oColumn) {
		const sTextAlign = Renderer.getTextAlign(oColumn.getHAlign());

		if (sTextAlign) {
			rm.style("text-align", sTextAlign);
		}
	};

	/**
	 * Adds data cell CSS classes.
	 *
	 * @param {sap.ui.core.RenderManager} rm RenderManager instance
	 * @param {sap.ui.table.Table} oTable Table instance
	 * @param {object} mConfig Configuration object
	 * @param {boolean} mConfig.isFirstColumn True if first visible column
	 * @param {boolean} mConfig.isLastFixedColumn True if last fixed column
	 * @param {boolean} mConfig.isLastColumn True if last visible column overall
	 * @private
	 */
	TableRenderer._addDataCellClasses = function(rm, oTable, mConfig) {
		rm.class("sapUiTableCell");
		rm.class("sapUiTableContentCell");
		rm.class("sapUiTableDataCell");

		const {isFirstColumn, isLastFixedColumn, isLastColumn} = mConfig;
		this._addCellPositionClasses(rm, {isFirstColumn, isLastFixedColumn, isLastColumn});

		if (mConfig.isFirstColumn && TableUtils.Grouping.isInTreeMode(oTable)) {
			rm.class("sapUiTableCellFlex"); // without flex, icon pushes contents too wide
		}
	};

	/**
	 * Adds positional marker CSS classes for a cell.
	 *
	 * @param {sap.ui.core.RenderManager} rm RenderManager instance
	 * @param {object} mConfig Configuration object
	 * @param {boolean} mConfig.isFirstColumn True if first visible column
	 * @param {boolean} mConfig.isLastFixedColumn True if last fixed column
	 * @param {boolean} mConfig.isLastColumn True if last visible column overall
	 */
	TableRenderer._addCellPositionClasses = function(rm, mConfig) {
		if (mConfig.isFirstColumn) {
			rm.class("sapUiTableCellFirst");
		}
		if (mConfig.isLastFixedColumn) {
			rm.class("sapUiTableCellLastFixed");
		}
		if (mConfig.isLastColumn) {
			rm.class("sapUiTableCellLast");
		}
	};

	/**
	 * Renders the content of a data cell.
	 *
	 * @param {sap.ui.core.RenderManager} rm RenderManager instance
	 * @param {sap.ui.table.Table} oTable Table instance
	 * @param {sap.ui.core.Control} oCell Cell control
	 * @param {sap.ui.table.Column} oColumn Column instance
	 * @param {sap.ui.table.Column[]} aVisibleColumns Visible columns
	 * @private
	 */
	TableRenderer._renderDataCellContent = function(rm, oTable, oCell, oColumn, aVisibleColumns) {
		const nColumns = aVisibleColumns.length;
		const bIsFirstColumn = nColumns > 0 && aVisibleColumns[0] === oColumn;

		rm.openStart("div");
		rm.class("sapUiTableCellInner");

		if (!TableUtils.hasRowHeader(oTable) && bIsFirstColumn && !TableUtils.hasRowHighlights(oTable) && !TableUtils.Grouping.isInTreeMode(oTable)) {
			rm.class("sapUiTableFirstColumnCell");
		}

		TableUtils.Hook.call(oTable, Hook.RenderCellContentStyles, rm);

		rm.openEnd();
		this.renderDataCellControl(rm, oTable, oCell, {isFirstColumn: bIsFirstColumn});
		rm.close("div");
	};

	/**
	 * Renders the inner control of a data cell including optional tree icon.
	 *
	 * @param {sap.ui.core.RenderManager} rm RenderManager instance
	 * @param {sap.ui.table.Table} oTable Table instance
	 * @param {sap.ui.core.Control} oCell Cell control
	 * @param {object} mConfig Configuration object
	 * @param {boolean} mConfig.isFirstColumn True if first visible column
	 */
	TableRenderer.renderDataCellControl = function(rm, oTable, oCell, mConfig) {
		if (mConfig.isFirstColumn && TableUtils.Grouping.isInTreeMode(oTable)) {
			const oRow = oCell.getParent();

			rm.openStart("span", oRow.getId() + "-treeicon");
			rm.class("sapUiTableTreeIcon");
			rm.attr("tabindex", "0");
			oTable._getAccRenderExtension().writeAriaAttributesFor(rm, oTable, "TreeIcon", {row: oRow});
			rm.openEnd();
			rm.close("span");
		}

		rm.renderControl(oCell);
	};

	/**
	 * Renders the vertical scrollbar (internal container and content) of the table.
	 *
	 * @param {sap.ui.core.RenderManager} rm RenderManager instance
	 * @param {sap.ui.table.Table} oTable Table instance
	 * @param {object} [mConfig] Optional configuration object
	 * @param {string} [mConfig.cssClass] Additional CSS class to apply
	 * @private
	 */
	TableRenderer.renderVSb = function(rm, oTable, mConfig) {
		const oScrollExtension = oTable._getScrollExtension();

		rm.openStart("div");
		rm.class("sapUiTableVSbContainer");
		if (!oScrollExtension.isVerticalScrollbarRequired()) {
			rm.class("sapUiTableHidden");
		}
		rm.class(mConfig?.cssClass);
		rm.openEnd();

		rm.openStart("div", oTable.getId() + "-vsb");
		rm.class("sapUiTableVSb");
		rm.style("max-height", oScrollExtension.getVerticalScrollbarHeight() + "px");

		// https://bugzilla.mozilla.org/show_bug.cgi?id=1069739
		// Avoid focusing of the scrollbar with tab.
		rm.attr("tabindex", "-1");
		rm.openEnd();
		rm.openStart("div");
		rm.class("sapUiTableVSbContent");
		rm.style("height", oScrollExtension.getVerticalScrollHeight() + "px");
		rm.openEnd();
		rm.close("div");
		rm.close("div");

		rm.close("div");
	};

	/**
	 * Renders an external vertical scrollbar for synchronization scenarios.
	 *
	 * @param {sap.ui.core.RenderManager} rm RenderManager instance
	 * @param {sap.ui.table.Table} oTable Table instance
	 * @private
	 */
	TableRenderer.renderVSbExternal = function(rm, oTable) {
		if (ExtensionBase.isEnrichedWith(oTable, "sap.ui.table.extensions.Synchronization")) {
			this.renderVSb(rm, oTable, {
				cssClass: "sapUiTableVSbExternal"
			});
		} else {
			Log.error("This method can only be used with synchronization enabled.", oTable, "TableRenderer.renderVSbExternal");
		}
	};

	/**
	 * Renders the horizontal scrollbar of the table.
	 *
	 * @param {sap.ui.core.RenderManager} rm RenderManager instance
	 * @param {sap.ui.table.Table} oTable Table instance
	 * @param {object} [mConfig] Optional configuration object
	 * @param {string} [mConfig.id] Scrollbar ID
	 * @param {string} [mConfig.cssClass] Additional CSS class
	 * @param {boolean} [mConfig.hidden=true] True if scrollbar initially hidden
	 * @param {int} [mConfig.scrollWidth=0] Scroll content width
	 * @private
	 */
	TableRenderer.renderHSb = function(rm, oTable, mConfig) {
		mConfig = Object.assign({
			id: oTable.getId() + "-hsb",
			cssClass: "sapUiTableHSb",
			hidden: true,
			scrollWidth: 0
		}, mConfig);

		rm.openStart("div", mConfig.id);
		rm.class(mConfig.cssClass);
		if (mConfig.hidden) {
			rm.class("sapUiTableHidden");
		}
		rm.attr("tabindex", "-1"); // Avoid focusing of the scrollbar with tab.
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

	/**
	 * Renders an external horizontal scrollbar for synchronization scenarios.
	 *
	 * @param {sap.ui.core.RenderManager} rm RenderManager instance
	 * @param {sap.ui.table.Table} oTable Table instance
	 * @param {object} mConfig Configuration object
	 * @param {string} mConfig.id Scrollbar ID
	 * @param {int} mConfig.scrollWidth Scroll content width
	 */
	TableRenderer.renderHSbExternal = function(rm, oTable, mConfig) {
		if (ExtensionBase.isEnrichedWith(oTable, "sap.ui.table.extensions.Synchronization")) {
			this.renderHSb(rm, oTable, {
				id: mConfig.id,
				cssClass: "sapUiTableHSbExternal",
				hidden: false,
				scrollWidth: mConfig.scrollWidth
			});
		} else {
			Log.error("This method can only be used with synchronization enabled.", oTable, "TableRenderer.renderHSbExternal");
		}
	};

	/**
	 * Renders the horizontal scrollbar background area.
	 *
	 * @param {sap.ui.core.RenderManager} rm RenderManager instance
	 * @param {sap.ui.table.Table} oTable Table instance
	 * @private
	 */
	TableRenderer.renderHSbBackground = function(rm, oTable) {
		rm.openStart("div", oTable.getId() + "-hsb-bg");
		rm.class("sapUiTableHSbBg");
		rm.openEnd();
		rm.close("div");
	};

	/**
	 * Renders an empty area with tabindex=0 and the given class and id.
	 *
	 * @param {sap.ui.core.RenderManager} rm RenderManager instance
	 * @param {object} mConfig Configuration object
	 * @param {string} [mConfig.className] Optional CSS class name
	 * @param {string|int} [mConfig.tabIndex="0"] Tab index to apply
	 * @param {string} [mConfig.id] Optional ID to apply
	 * @private
	 */
	TableRenderer.renderTabElement = function(rm, mConfig) {
		rm.openStart("div", mConfig.id);
		if (mConfig.className) {
			rm.class(mConfig.className);
		}
		rm.attr("role", "none");
		rm.attr("tabindex", mConfig.tabIndex == null ? "0" : String(mConfig.tabIndex));
		rm.openEnd().close("div");
	};

	/**
	 * Returns the columns with indices in the range between iStartIndex and iEndIndex that should be rendered.
	 *
	 * @param {sap.ui.table.Table} oTable Table instance
	 * @param {int} iStartIndex Start index (inclusive)
	 * @param {int} iEndIndex End index (exclusive)
	 * @returns {sap.ui.table.Column[]} Columns to render
	 * @private
	 */
	TableRenderer.getColumnsToRender = function(oTable, iStartIndex, iEndIndex) {
		return oTable.getColumns().slice(iStartIndex, iEndIndex).filter((oColumn) => oColumn && oColumn.shouldRender());
	};

	/**
	 * Returns the index of the last fixed column.
	 *
	 * @param {sap.ui.table.Table} oTable Table instance
	 * @returns {int} Index of last fixed column or -1 if there are no fixed columns
	 * @private
	 */
	TableRenderer.getLastFixedColumnIndex = function(oTable) {
		const iFixedColumnCount = oTable.getComputedFixedColumnCount();
		const aColumns = oTable.getColumns();
		let iLastFixedColumnIndex = -1;

		for (let i = iFixedColumnCount - 1; i >= 0; i--) {
			if (aColumns[i].shouldRender()) {
				iLastFixedColumnIndex = i;
				break;
			}
		}

		return iLastFixedColumnIndex;
	};

	return TableRenderer;
});