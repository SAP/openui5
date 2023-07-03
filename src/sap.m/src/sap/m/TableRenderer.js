/*!
 * ${copyright}
 */

sap.ui.define(["sap/base/i18n/Localization", "sap/ui/core/Renderer", "sap/ui/core/InvisibleText", "./library", "./ListBaseRenderer", "./ColumnListItemRenderer", "sap/ui/core/Lib"],
	function(Localization, Renderer, InvisibleText, library, ListBaseRenderer, ColumnListItemRenderer, Library) {
	"use strict";


	var ListKeyboardMode = library.ListKeyboardMode;
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
			bHasPopin = false,
			bHasFooter = false,
			bHeaderHidden = false,
			bHasFlexibleColumn,
			sMode = oTable.getMode(),
			iModeOrder = ListBaseRenderer.ModeOrder[sMode],
			sClassPrefix = "sapMListTbl",
			sIdPrefix = oTable.getId("tbl"),
			sCellTag = (sType == "Head") ? "th" : "td",
			sTypeTag = "t" + sType.toLowerCase(),
			aColumns = oTable.getColumns(),
			vFixedLayout = oTable.getFixedLayout(),
			createBlankCell = function(sClass, sId, bAriaHidden) {
				rm.openStart(sCellTag, sId && sIdPrefix + sId);
				if (sCellTag === "th") {
					rm.class("sapMTableTH");
					rm.attr("role", bAriaHidden ? "presentation" : "columnheader");
					rm.attr("scope", "col");
				} else if (bAriaHidden) {
					rm.attr("role", "presentation");
				}
				bAriaHidden && rm.attr("aria-hidden", "true");
				rm.class(sClassPrefix + sClass);
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
			if (iRenderedColumnsLength == 1 && vFixedLayout == "Strict") {
				oTable._bCheckLastColumnWidth = true;
			}

			bHeaderHidden = !iRenderedColumnsLength || aColumns.every(function(oColumn) {
				return !oColumn.getHeader() || !oColumn.getHeader().getVisible() || !oColumn.getVisible() || oColumn.isHidden();
			});
		}

		rm.openStart(sTypeTag);
		if (oTable._hasFooter && sType === "Foot") {
			rm.class("sapMTableTFoot");
			if (oTable.hasPopin()) {
				rm.class("sapMListTblHasPopin");
			}
		}
		rm.openEnd();

		rm.openStart("tr", oTable.addNavSection(sIdPrefix + sType + "er"));
		if (bHeaderHidden) {
			rm.class("sapMListTblHeaderNone");
			rm.attr("aria-hidden", true);
		} else {
			rm.attr("tabindex", -1);
			rm.class("sapMListTblRow").class("sapMListTbl" + sType + "er");
			rm.class("sapMLIBFocusable").class("sapMTableRowCustomFocus");
		}
		rm.openEnd();

		createBlankCell("HighlightCol", sType + "Highlight", true);

		if (iModeOrder == -1) {
			if (sMode == "MultiSelect" && sType == "Head" && !bHeaderHidden) {
				rm.openStart("th");
				rm.class("sapMTableTH");
				rm.attr("scope", "col");
				rm.attr("aria-hidden", "true");
				rm.class(sClassPrefix + "SelCol");
				rm.attr("role", "presentation");
				rm.openEnd();
				rm.renderControl(oTable.getMultiSelectMode() == MultiSelectMode.ClearAll ? oTable._getClearAllButton() : oTable._getSelectAllCheckbox());
				rm.close("th");
				iIndex++;
			} else {
				createBlankCell("SelCol", "", true);
			}
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
				sWidth = (iRenderedColumnsLength == 1 && vFixedLayout != "Strict") ? "" : oColumn.getWidth(),
				aStyleClass = oColumn.getStyleClass().split(" ").filter(Boolean),
				sAlign = oColumn.getCssAlign();

			if (sType == "Head") {
				rm.openStart(sCellTag, oColumn);
				rm.class("sapMTableTH");
				rm.attr("role", "columnheader");
				rm.attr("scope", "col");
				var sSortIndicator = oColumn.getSortIndicator().toLowerCase();
				sSortIndicator !== "none" && rm.attr("aria-sort", sSortIndicator);
				if (!bHasFlexibleColumn) {
					bHasFlexibleColumn = !sWidth || sWidth == "auto";
				}
			} else {
				rm.openStart(sCellTag);
			}

			aStyleClass.forEach(function (sClass) {
				rm.class(sClass);
			});
			rm.class(sClassPrefix + "Cell");
			rm.class(sClassPrefix + sType + "erCell");
			rm.attr("data-sap-ui-column", oColumn.getId());
			rm.style("width", sWidth);
			if (sAlign && sType !== "Head") {
				rm.style("text-align", sAlign);
			}
			rm.openEnd();

			if (oControl) {
				if (sType === "Head") {
					rm.openStart("div", oColumn.getId() + "-ah");
					rm.class("sapMColumnHeader");

					var oMenu = oColumn._getHeaderMenuInstance();
					if ((oTable.bActiveHeaders || oMenu)  && !oControl.isA("sap.ui.core.InvisibleText")) {
						rm.attr("tabindex", 0);
						rm.attr("role", "button");
						rm.class("sapMColumnHeaderActive");
						rm.attr("aria-haspopup", oMenu ? oMenu.getAriaHasPopupType().toLowerCase() : "dialog");
						if (oControl.isA("sap.m.Label") && oControl.getRequired()) {
							rm.attr("aria-describedby", InvisibleText.getStaticId("sap.m", "CONTROL_IN_COLUMN_REQUIRED"));
						}
					} else if (oTable.bFocusableHeaders) {
						rm.attr("tabindex", 0);
						rm.class("sapMColumnHeaderFocusable");
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

			if (sType == "Head" && !bHasFooter) {
				bHasFooter = !!oColumn.getFooter();
			}

			rm.close(sCellTag);
			oColumn.setIndex(iIndex++);
		});

		if (sType == "Head") {
			oTable._dummyColumn = (bHasFlexibleColumn != undefined && !bHasFlexibleColumn && vFixedLayout == "Strict");
		}

		if (bHasPopin && oTable._dummyColumn) {
			createBlankCell("DummyCell", sType + "DummyCell", true);
		}

		createBlankCell("NavCol", sType + "Nav", true);

		if (iModeOrder == 1) {
			createBlankCell("SelCol", "", true);
		}

		createBlankCell("NavigatedCol", sType + "Navigated", true);

		if (!bHasPopin && oTable._dummyColumn) {
			createBlankCell("DummyCell", sType + "DummyCell", true);
		}

		rm.close("tr");
		rm.close(sTypeTag);

		if (sType === "Head") {
			oTable._colCount = iIndex;
			oTable._hasPopin = bHasPopin;
			oTable._hasFooter = bHasFooter;
			oTable._headerHidden = bHeaderHidden;
		}
	};

	/**
	 * add table container class name
	 */
	TableRenderer.renderContainerAttributes = function(rm, oControl) {
		rm.attr("role", "application").attr("data-sap-ui-pasteregion", "true");
		rm.attr("aria-roledescription", Library.getResourceBundleFor("sap.m").getText("TABLE_CONTAINER_ROLE_DESCRIPTION"));
		rm.class("sapMListTblCnt");

		// write accessibility state for the table container
		rm.accessibilityState(oControl, this.getAccessibilityState(oControl));
	};

	/**
	 * render table tag and add required classes
	 */
	TableRenderer.renderListStartAttributes = function(rm, oControl) {
		rm.openStart("table", oControl.getId("listUl"));
		rm.class("sapMListTbl");
		var aLabels = oControl.getAriaLabelledBy().concat(this.getAriaLabelledBy(oControl), InvisibleText.getStaticId("sap.m", "TABLE_ARIA_LABEL"));
		rm.attr("aria-labelledby", aLabels.filter(Boolean).join(" "));
		if (oControl.getFixedLayout() === false) {
			rm.style("table-layout", "auto");
		}

		// make the type column visible if needed
		if (oControl._iItemNeedsColumn) {
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
		if (oControl.getAlternateRowColors()) {
			rm.class(oControl._getAlternateRowColorsClass());
		}
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
		rm.attr("tabindex", oControl.getKeyboardMode() == ListKeyboardMode.Navigation ? -1 : 0);
		rm.class("sapMLIB").class("sapMListTblRow").class("sapMLIBTypeInactive");
		ColumnListItemRenderer.addFocusableClasses(rm, oControl);
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