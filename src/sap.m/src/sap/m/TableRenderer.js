/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/core/Renderer", "sap/ui/core/Core", "sap/ui/core/InvisibleText", "./library", "./ListBaseRenderer", "./ColumnListItemRenderer"],
	function(Renderer, Core, InvisibleText, library, ListBaseRenderer, ColumnListItemRenderer) {
	"use strict";


	// shortcut for sap.m.ListKeyboardMode
	var ListKeyboardMode = library.ListKeyboardMode;
	// shortcut for sap.m.MultiSelectMode
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
	var bRtl = Core.getConfiguration().getRTL();
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
	 * @param {string} type Whether "Head" or "Foot"
	 */
	TableRenderer.renderColumns = function(rm, oTable, type) {
		var index = 0,
			hiddens = 0,
			hasPopin = false,
			hasFooter = false,
			mode = oTable.getMode(),
			iModeOrder = ListBaseRenderer.ModeOrder[mode],
			clsPrefix = "sapMListTbl",
			idPrefix = oTable.getId("tbl"),
			cellTag = (type == "Head") ? "th" : "td",
			groupTag = "t" + type.toLowerCase(),
			aColumns = oTable.getColumns(),
			bShouldRenderDummyColumn = oTable.shouldRenderDummyColumn(),
			bHeaderHidden,
			createBlankCell = function(cls, id, bAriaHidden) {
				rm.openStart(cellTag, id && idPrefix + id);
				if (cellTag === "th") {
					rm.class("sapMTableTH");
					rm.attr("role", bAriaHidden ? "presentation" : "columnheader");
					rm.attr("scope", "col");
				} else if (bAriaHidden) { // hidden td
					rm.attr("role", "presentation");
				}
				bAriaHidden && rm.attr("aria-hidden", "true");
				rm.class(clsPrefix + cls);

				if (type === "Foot") {
					if (cls === "HighlightCol") {
						rm.class("sapMTableHighlightFooterCell");
					} else if (cls === "NavigatedCol") {
						rm.class("sapMTableNavigatedFooterCell");
					}
				}

				rm.openEnd();
				rm.close(cellTag);
				index++;
			};

		if (type == "Head") {
			var aVisibleColumns = aColumns.filter(function(oCol){
				return oCol.getVisible();
			});
			var oForcedColumn = aColumns.reduce(function(oRefColumn, oColumn, iOrder) {
				oColumn.setIndex(-1);
				oColumn.setInitialOrder(iOrder);
				oColumn.setForcedColumn(false);
				return (oColumn.getVisible() && oColumn.getCalculatedMinScreenWidth() < oRefColumn.getCalculatedMinScreenWidth()) ? oColumn : oRefColumn;
			}, aVisibleColumns[0]);

			var iHeaderLength = aColumns.filter(function(oColumn) {
				return	oColumn.getVisible() &&
						!oColumn.isPopin() &&
						!oColumn.isHidden();
			}).length;

			if (!iHeaderLength && oForcedColumn) {
				oForcedColumn.setForcedColumn(true);
				iHeaderLength = 1;
			}

			bHeaderHidden = aColumns.every(function(oColumn) {
				return	!oColumn.getHeader() ||
						!oColumn.getHeader().getVisible() ||
						!oColumn.getVisible() ||
						oColumn.isPopin() ||
						oColumn.isHidden();
			});
		}

		rm.openStart(groupTag);

		if (oTable._hasFooter && type === "Foot") {
			rm.class("sapMTableTFoot");

			if (oTable.hasPopin()) {
				rm.class("sapMListTblHasPopin");
			}
		}

		rm.openEnd();

		rm.openStart("tr", oTable.addNavSection(idPrefix + type + "er"));
		rm.attr("tabindex", -1);

		if (bHeaderHidden) {
			rm.class("sapMListTblHeaderNone");
		} else {
			rm.class("sapMListTblRow").class("sapMListTbl" + type + "er");
			rm.class("sapMLIBFocusable").class("sapMTableRowCustomFocus");
		}

		rm.openEnd();

		createBlankCell("HighlightCol", type + "Highlight", true);

		if (iModeOrder == -1) {
			if (mode == "MultiSelect" && type == "Head" && !bHeaderHidden) {
				rm.openStart("th");
				rm.class("sapMTableTH");
				rm.attr("scope", "col");
				rm.attr("aria-hidden", "true");
				rm.class(clsPrefix + "SelCol");
				rm.attr("role", "presentation");
				rm.openEnd();
				rm.renderControl(oTable.getMultiSelectMode() == MultiSelectMode.Default ? oTable._getSelectAllCheckbox() : oTable._getClearAllButton());
				rm.close("th");
				index++;
			} else {
				createBlankCell("SelCol", "", true);
			}
		}

		oTable.getColumns(true).forEach(function(oColumn, order) {
			if (!oColumn.getVisible()) {
				return;
			}
			if (oColumn.isPopin()) {
				hasPopin = true;
				return;
			}
			var bHidden = oColumn.isHidden();
			if (bHidden) {
				hiddens++;
			}

			var control = oColumn["get" + type + "er"](),
				vFixedLayout = oTable.getFixedLayout(),
				width = (iHeaderLength == 1 && vFixedLayout != "Strict") ? "" : oColumn.getWidth(),
				aStyleClass = oColumn.getStyleClass(true).split(" "),
				align = oColumn.getCssAlign();

			oTable._bCheckLastColumnWidth = vFixedLayout == "Strict" && iHeaderLength == 1;

			if (type == "Head") {
				rm.openStart(cellTag, oColumn);
				rm.class("sapMTableTH");
				rm.attr("role", "columnheader");
				rm.attr("scope", "col");
				var sSortIndicator = oColumn.getSortIndicator().toLowerCase();
				sSortIndicator !== "none" && rm.attr("aria-sort", sSortIndicator);
			} else {
				rm.openStart(cellTag);
			}

			aStyleClass && aStyleClass.forEach(function (sClsName) {
				rm.class(sClsName);
			});
			rm.class(clsPrefix + "Cell");
			rm.class(clsPrefix + type + "erCell");
			rm.attr("data-sap-ui-column", oColumn.getId());
			rm.attr("data-sap-width", oColumn.getWidth());
			rm.style("width", width);

			// required to set the correct aligment to the footer cell
			if (align && type !== "Head") {
				rm.style("text-align", align);
			}

			if (bHidden) {
				rm.style("display", "none");
				rm.attr("aria-hidden", "true");
			}

			rm.openEnd();

			if (control) {
				if (type === "Head") {
					rm.openStart("div");
					rm.class("sapMColumnHeader");

					var oMenu = oColumn.getColumnHeaderMenu();
					if ((oTable.bActiveHeaders || oMenu)  && !control.isA("sap.ui.core.InvisibleText")) {
						// add active header attributes and style class
						rm.attr("tabindex", 0);
						rm.attr("role", "button");
						rm.class("sapMColumnHeaderActive");
						rm.attr("aria-haspopup", oMenu ? oMenu.getAriaHasPopupType().toLowerCase() : "dialog");
					} else if (oTable.bFocusableHeaders) {
						rm.attr("tabindex", 0);
						rm.class("sapMColumnHeaderFocusable");
					}

					if (align) {
						rm.style("justify-content", TableRenderer.columnAlign[align]);
						rm.style("text-align", align);
					}

					rm.openEnd();
					rm.renderControl(control.addStyleClass("sapMColumnHeaderContent"));
					rm.close("div");
				} else {
					// rendering of the footer cell
					rm.renderControl(control);
				}
			}

			if (type == "Head" && !hasFooter) {
				hasFooter = !!oColumn.getFooter();
			}

			rm.close(cellTag);
			oColumn.setIndex(index++);
		});

		if (hasPopin && bShouldRenderDummyColumn) {
			createBlankCell("DummyCell", type + "DummyCell", true);
		}

		createBlankCell("NavCol", type + "Nav", true);

		if (iModeOrder == 1) {
			createBlankCell("SelCol", "", true);
		}

		createBlankCell("NavigatedCol", type + "Navigated", true);

		if (!hasPopin && bShouldRenderDummyColumn) {
			createBlankCell("DummyCell", type + "DummyCell", true);
		}

		rm.close("tr");
		rm.close(groupTag);

		if (type === "Head") {
			oTable._hasPopin = hasPopin;
			oTable._colCount = index - hiddens;
			oTable._hasFooter = hasFooter;
			oTable._headerHidden = bHeaderHidden;
		}
	};

	/**
	 * add table container class name
	 */
	TableRenderer.renderContainerAttributes = function(rm, oControl) {
		rm.attr("role", "application").attr("data-sap-ui-pasteregion", "true");
		rm.attr("aria-roledescription", Core.getLibraryResourceBundle("sap.m").getText("TABLE_CONTAINER_ROLE_DESCRIPTION"));
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
		rm.attr("aria-labelledby", oControl.getAriaLabelledBy().concat(this.getAriaLabelledBy(oControl), InvisibleText.getStaticId("sap.m", "TABLE_ARIA_LABEL")).join(" "));
		if (oControl.getFixedLayout() === false) {
			rm.style("table-layout", "auto");
		}

		// make the type column visible if needed
		if (oControl._iItemNeedsColumn) {
			rm.class("sapMListTblHasNav");
		}
	};

	/**
	 * returns aria accessibility role
	 */
	TableRenderer.getAriaRole = function(oControl) {
		return "";
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

		var bRenderDummyColumn = !oControl.hasPopin() && oControl.shouldRenderDummyColumn();

		rm.openStart("td", oControl.getId("nodata-text"));
		rm.attr("colspan", oControl.getColCount() - bRenderDummyColumn);
		rm.class("sapMListTblCell").class("sapMListTblCellNoData");
		rm.openEnd();

		if (!oControl.shouldRenderItems()) {
			var vNoData = oControl.getNoData();
			if (vNoData && typeof vNoData !== "string" && vNoData.isA("sap.m.IllustratedMessage")) {
				rm.renderControl(oControl.getAggregation("_noColumnsMessage"));
			} else {
				rm.text(Core.getLibraryResourceBundle("sap.m").getText("TABLE_NO_COLUMNS"));
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