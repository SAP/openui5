/*!
 * ${copyright}
 */

sap.ui.define(["sap/base/i18n/Localization", "sap/ui/core/Renderer", "sap/ui/core/InvisibleText", "sap/ui/Device", "./library", "./ListBaseRenderer", "./ColumnListItemRenderer", "sap/ui/core/Lib"],
	function(Localization, Renderer, InvisibleText, Device, library, ListBaseRenderer, ColumnListItemRenderer, Library) {
	"use strict";


	var MultiSelectMode = library.MultiSelectMode;

	/**
	 * Table renderer.
	 *
	 * TableRenderer extends the ListBaseRenderer
	 *
	 * @namespace
	 */
	var TableRenderer = Renderer.extend(ListBaseRenderer);
	TableRenderer.apiVersion = 2;

	// store the flex alignment for the column header based on the RTL mode
	var bRtl = Localization.getRTL();
	TableRenderer.columnAlign = {
		left: bRtl ? "flex-end" : "flex-start",
		center: "center",
		right: bRtl ? "flex-start" : "flex-end"
	};


	/**
	 * Renders the Header and/or Footer of the Table like List Control
	 *
	 * @param {sap.ui.core.RenderManager} rm RenderManager
	 * @param {sap.m.ListBase} oTable Table control
	 * @param {string} sType Whether "Head" or "Foot"
	 */
	TableRenderer.renderColumns = function(rm, oTable, sType) {
		var iIndex = 0,
			aAriaOwns = [],
			bHasPopin = false,
			bHasFlexibleColumn,
			bHeaderHidden = false,
			bRenderAriaSelected = false,
			bColumnHeadersActive = false,
			bHasFooter = (sType == "Foot"),
			sMode = oTable.getMode(),
			iModeOrder = ListBaseRenderer.ModeOrder[sMode],
			sClassPrefix = "sapMListTbl",
			sIdPrefix = oTable.getId("tbl"),
			sCellTag = (sType == "Head") ? "th" : "td",
			sTypeTag = "t" + sType.toLowerCase(),
			aColumns = oTable.getColumns(),
			vFixedLayout = oTable.getFixedLayout(),
			openStartCell = function(vIdSuffixOrControl, sClassSuffix, sLabelKey) {
				var sAriaOwns, vIdOrControl;
				if (typeof vIdSuffixOrControl == "string") {
					sAriaOwns = vIdOrControl = sIdPrefix + sType + vIdSuffixOrControl;
				} else {
					vIdOrControl = vIdSuffixOrControl;
					sAriaOwns = vIdOrControl.getId();
				}
				rm.openStart(sCellTag, vIdOrControl);
				rm.class(sClassPrefix + sClassSuffix);
				rm.attr("aria-colindex", aAriaOwns.push(sAriaOwns));
				if (!bHeaderHidden) {
					ColumnListItemRenderer.makeFocusable(rm);
				}
				if (sLabelKey) {
					rm.attr("aria-label", Library.getResourceBundleFor("sap.m").getText(sLabelKey));
				}
				if (sType == "Head") {
					rm.class("sapMTableTH");
					rm.attr("role", "columnheader");
					if (bRenderAriaSelected) {
						rm.attr("aria-selected", "false");
					}
				} else {
					rm.attr("role", "gridcell");
				}
				return rm;
			},
			createBlankCell = function(sIdSuffix, sClassSuffix) {
				rm.openStart(sCellTag, sIdPrefix + sType + sIdSuffix);
				sType == "Head" && rm.class("sapMTableTH");
				rm.class(sClassPrefix + sClassSuffix);
				rm.attr("role", "presentation");
				rm.openEnd();
				rm.close(sCellTag);
				iIndex++;
			};

		if (sType == "Head") {
			var oFirstVisibleColumn = aColumns.find(function(oColumn) {
				return oColumn.getVisible();
			});
			var oForcedColumn = aColumns.reduce(function(oRefColumn, oColumn, iOrder) {
				oColumn.setIndex(-1);
				oColumn.setInitialOrder(iOrder);
				oColumn.setForcedColumn(false);
				return (oColumn.getVisible() && oColumn.getCalculatedMinScreenWidth() < oRefColumn.getCalculatedMinScreenWidth()) ? oColumn : oRefColumn;
			}, oFirstVisibleColumn);

			var iRenderedColumnsLength = aColumns.filter(function(oColumn) {
				return oColumn.getVisible() && !oColumn.isHidden();
			}).length;
			if (!iRenderedColumnsLength && oForcedColumn) {
				oForcedColumn.setForcedColumn(true);
				iRenderedColumnsLength = 1;
			}
			if (iRenderedColumnsLength == 1 && vFixedLayout === "Strict") {
				oTable._bCheckLastColumnWidth = true;
			}

			bHeaderHidden = !iRenderedColumnsLength || aColumns.every(function(oColumn) {
				return !oColumn.getHeader() || !oColumn.getHeader().getVisible() || !oColumn.getVisible() || oColumn.isHidden();
			});
		}

		rm.openStart(sTypeTag).class("sapMTableT" + sType).openEnd();

		rm.openStart("tr", oTable.addNavSection(sIdPrefix + sType + "er"));
		rm.attr("role", "row");
		if (bHeaderHidden) {
			rm.class("sapMListTblHeaderNone");
			rm.attr("aria-hidden", "true");
		} else {
			rm.class("sapMListTblRow").class("sapMListTbl" + sType + "er");
			if (Device.system.desktop) {
				rm.attr("tabindex", "-1");
				rm.class("sapMLIBFocusable").class("sapMTableRowCustomFocus");
			}
			if (sType == "Head") {
				rm.attr("aria-rowindex", "1");
				if (oTable._bSelectionMode) {
					rm.attr("aria-selected", "false");
					bRenderAriaSelected = true;
				}
			} else {
				rm.attr("aria-rowindex", oTable.getVisibleItems().length + !oTable._headerHidden + 1);
			}
		}
		rm.openEnd();

		createBlankCell("Highlight", "HighlightCol");

		if (iModeOrder == -1) {
			openStartCell("ModeCol", "SelCol", "TABLE_SELECTION_COLUMNHEADER").openEnd();
			if (bRenderAriaSelected && sMode == "MultiSelect") {
				rm.renderControl(oTable.getMultiSelectMode() == MultiSelectMode.ClearAll ? oTable._getClearAllButton() : oTable._getSelectAllCheckbox());
			}
			rm.close(sCellTag);
			iIndex++;
		}

		oTable.getColumns(true).forEach(function(oColumn) {
			if (!oColumn.getVisible()) {
				return;
			}
			if (oColumn.isPopin()) {
				bHasPopin = true;
				return;
			}
			if (oColumn.isHidden()) {
				return;
			}

			var oControl = oColumn["get" + sType + "er"](),
				sWidth = (iRenderedColumnsLength == 1 && vFixedLayout !== "Strict") ? "" : oColumn.getWidth(),
				aStyleClass = oColumn.getStyleClass().split(" ").filter(Boolean),
				sAlign = oColumn.getCssAlign(),
				bActiveHeader = false;

			if (sType == "Head") {
				openStartCell(oColumn, "Cell");
				var sSortIndicator = oColumn.getSortIndicator().toLowerCase();
				if (sSortIndicator != "none") {
					rm.attr("aria-sort", sSortIndicator);
				}
				if (oControl) {
					var oMenu = oColumn.getHeaderMenuInstance();
					bActiveHeader = (oMenu || oTable.bActiveHeaders) && !oControl.isA("sap.ui.core.InvisibleText");
					if (bActiveHeader) {
						rm.attr("aria-haspopup", oMenu ? oMenu.getAriaHasPopupType().toLowerCase() : "dialog");
						bColumnHeadersActive = true;
					}
					if (oControl.isA("sap.m.Label") && oControl.getRequired()) {
						rm.attr("aria-describedby", InvisibleText.getStaticId("sap.m", "CONTROL_IN_COLUMN_REQUIRED"));
					}
				}
				if (!bHasFlexibleColumn) {
					bHasFlexibleColumn = !sWidth || sWidth == "auto";
				}
				if (!bHasFooter) {
					bHasFooter = !!oColumn.getFooter();
				}
			} else {
				openStartCell(oColumn.getId() + "-footer", "Cell");
				rm.style("text-align", sAlign);
			}

			aStyleClass.forEach(function (sClass) {
				rm.class(sClass);
			});
			rm.class(sClassPrefix + sType + "erCell");
			rm.attr("data-sap-ui-column", oColumn.getId());
			rm.style("width", sWidth);
			rm.openEnd();

			if (oControl) {
				if (sType === "Head") {
					rm.openStart("div", oColumn.getId() + "-ah");
					rm.class("sapMColumnHeader");
					if (bActiveHeader) {
						rm.class("sapMColumnHeaderActive");
					}
					if (sAlign) {
						rm.style("justify-content", TableRenderer.columnAlign[sAlign]);
						rm.style("text-align", sAlign);
					}
					rm.openEnd();
					rm.renderControl(oControl.addStyleClass("sapMColumnHeaderContent"));
					rm.close("div");
				} else {
					rm.renderControl(oControl);
				}
			}

			rm.close(sCellTag);
			oColumn.setIndex(iIndex++);
		});

		if (sType == "Head") {
			oTable._dummyColumn = (bHasFlexibleColumn != undefined && !bHasFlexibleColumn && vFixedLayout === "Strict");
		}

		if (bHasPopin && oTable._dummyColumn) {
			createBlankCell("DummyCell", "DummyCell");
		}

		if (oTable.doItemsNeedTypeColumn()) {
			openStartCell("Nav", "NavCol", "TABLE_ROW_ACTION").openEnd().close(sCellTag);
			iIndex++;
		}

		if (iModeOrder == 1) {
			openStartCell("ModeCol", "SelCol", sMode == "Delete" ? "TABLE_ROW_ACTION" : "TABLE_SELECTION_COLUMNHEADER").openEnd().close(sCellTag);
			iIndex++;
		}

		createBlankCell("Navigated", "NavigatedCol");

		if (!bHasPopin && oTable._dummyColumn) {
			createBlankCell("DummyCell", "DummyCell");
		}

		rm.close("tr");

		if (bHasPopin) {
			var sPopinColumnHeaderId = sIdPrefix + "Popin" + sType;
			rm.openStart("tr").attr("role", "none").openEnd();
			rm.openStart("td").attr("role", "none").attr("colspan", iIndex).class("sapMTablePopinColumn").class("sapMTblItemNav").openEnd();
			if (sType == "Head") {
				rm.openStart("div", sPopinColumnHeaderId);
				rm.class("sapMListTblHeaderNone");
				rm.attr("role", sType == "Head" ? "columnheader" : "gridcell");
				rm.attr("aria-colindex", aAriaOwns.push(sPopinColumnHeaderId));
				rm.attr("aria-label", Library.getResourceBundleFor("sap.m").getText("TABLE_COLUMNHEADER_POPIN"));
				rm.openEnd();
				rm.close("div");
			}
			rm.close("td");
			rm.close("tr");
		}

		rm.close(sTypeTag);

		if (sType === "Head") {
			oTable._colCount = iIndex;
			oTable._hasPopin = bHasPopin;
			oTable._hasFooter = bHasFooter;
			oTable._headerHidden = bHeaderHidden;
			oTable._colHeaderAriaOwns = aAriaOwns;
			oTable._columnHeadersActive = bColumnHeadersActive;
		}
	};

	/**
	 * add table container class name
	 */
	TableRenderer.renderContainerAttributes = function(rm, oControl) {
		rm.attr("data-sap-ui-pasteregion", "true");
		rm.class("sapMListTblCnt");
	};

	/**
	 * render table tag and add required classes
	 */
	TableRenderer.renderListStartAttributes = function(rm, oControl) {
		rm.openStart("table", oControl.getId("listUl"));
		rm.accessibilityState(oControl, this.getAccessibilityState(oControl));
		rm.attr("aria-roledescription", Library.getResourceBundleFor("sap.m").getText("TABLE_ROLE_DESCRIPTION"));
		rm.class("sapMListTbl");

		if (oControl.getFixedLayout() === false) {
			rm.style("table-layout", "auto");
		}
		if (oControl.doItemsNeedTypeColumn()) {
			rm.class("sapMListTblHasNav");
		}
	};

	/**
	 * generate table columns
	 */
	TableRenderer.renderListHeadAttributes = function(rm, oControl) {
		oControl._aPopinHeaders = [];
		this.renderColumns(rm, oControl, "Head");
		rm.openStart("tbody", oControl.addNavSection(oControl.getId("tblBody")));
		rm.class("sapMListItems");
		rm.class("sapMTableTBody");
		if (oControl.hasPopin()) {
			rm.class("sapMListTblHasPopin");
		}
		rm.openEnd();
	};

	/**
	 * render footer and finish rendering table
	 */
	TableRenderer.renderListEndAttributes = function(rm, oControl) {
		rm.close("tbody"); // items should be rendered before foot
		oControl._hasFooter && this.renderColumns(rm, oControl, "Foot");
		rm.close("table");

		// render popin headers in a separate div element for ACC
		this.renderPopinColumnHeaders(rm, oControl);
	};

	/**
	 * Renders the actual column header control that is moved to the pop-in area.
	 * This ensure correct accessibility mappings to focusable content in the pop-in area.
	 * @param {sap.ui.core.RenderManager} rm RenderManager instance
	 * @param {sap.m.Table} oControl the table instance
	 */
	TableRenderer.renderPopinColumnHeaders = function(rm, oControl) {
		if (!oControl._aPopinHeaders || !oControl._aPopinHeaders.length) {
			return;
		}

		rm.openStart("div", oControl.getId("popin-headers"));
		rm.class("sapMTablePopinHeaders");
		rm.attr("aria-hidden", "true");
		rm.openEnd();

		oControl._aPopinHeaders.forEach(function(oHeader) {
			rm.renderControl(oHeader);
		});

		rm.close("div");
	};

	/**
	 * render no data
	 */
	TableRenderer.renderNoData = function(rm, oControl) {
		rm.openStart("tr", oControl.getId("nodata"));
		rm.class("sapMLIB").class("sapMListTblRow").class("sapMLIBTypeInactive");
		if (Device.system.desktop) {
			rm.attr("tabindex", "-1");
			rm.class("sapMLIBFocusable").class("sapMTableRowCustomFocus");
		}
		if (!oControl._headerHidden || (!oControl.getHeaderText() && !oControl.getHeaderToolbar())) {
			rm.class("sapMLIBShowSeparator");
		}
		rm.openEnd();

		var bRenderDummyColumn = oControl.shouldRenderDummyColumn();
		rm.openStart("td", oControl.getId("nodata-text"));
		rm.attr("colspan", oControl.getColCount() - bRenderDummyColumn);
		rm.class("sapMListTblCell").class("sapMListTblCellNoData");
		rm.openEnd();

		if (!oControl.shouldRenderItems()) {
			if (oControl.getAggregation("_noColumnsMessage")) {
				// If _noColumnsMessage is set, there is for sure an IllustratedMessage used for no data visualization
				rm.renderControl(oControl.getAggregation("_noColumnsMessage"));
			} else {
				rm.text(Library.getResourceBundleFor("sap.m").getText("TABLE_NO_COLUMNS"));
			}
		} else {
			this.renderNoDataArea(rm, oControl);
		}

		rm.close("td");

		if (bRenderDummyColumn) {
			ColumnListItemRenderer.renderDummyCell(rm, oControl);
		}

		rm.close("tr");
	};

	return TableRenderer;

}, /* bExport= */ true);