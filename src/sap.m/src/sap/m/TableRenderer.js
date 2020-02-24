/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/core/Renderer", "sap/ui/core/Core", "./library", "./ListBaseRenderer", "./ColumnListItemRenderer"],
	function(Renderer, Core, library, ListBaseRenderer, ColumnListItemRenderer) {
	"use strict";


	// shortcut for sap.m.ListKeyboardMode
	var ListKeyboardMode = library.ListKeyboardMode;


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
	 * @param {String} type Whether "Head" or "Foot"
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
			createBlankCell = function(cls, id, bAriaHidden) {
				rm.openStart(cellTag, id && idPrefix + id);
				if (cellTag === "th") {
					rm.class("sapMTableTH");
					rm.attr("role", bAriaHidden ? "presentation" : "columnheader");
				} else if (bAriaHidden) { // hidden td
					rm.attr("role", "presentation");
				}
				bAriaHidden && rm.attr("aria-hidden", "true");
				rm.class(clsPrefix + cls);
				rm.openEnd();
				rm.close(cellTag);
				index++;
			};

		if (type == "Head") {
			var oForcedColumn = aColumns.reduce(function(oRefColumn, oColumn, iOrder) {
				oColumn.setIndex(-1);
				oColumn.setInitialOrder(iOrder);
				oColumn.setForcedColumn(false);
				return (oColumn.getCalculatedMinScreenWidth() < oRefColumn.getCalculatedMinScreenWidth()) ? oColumn : oRefColumn;
			}, aColumns[0]);

			var iHeaderLength = aColumns.filter(function(oColumn) {
				return	oColumn.getVisible() &&
						!oColumn.isPopin() &&
						!oColumn.isHidden();
			}).length;

			if (!iHeaderLength && oForcedColumn) {
				oForcedColumn.setForcedColumn(true);
				iHeaderLength = 1;
			}

			var bHeaderHidden = aColumns.every(function(oColumn) {
				return	!oColumn.getHeader() ||
						!oColumn.getHeader().getVisible() ||
						!oColumn.getVisible() ||
						oColumn.isPopin() ||
						oColumn.isHidden();
			});
		}

		rm.openStart(groupTag).openEnd();

		rm.openStart("tr", oTable.addNavSection(idPrefix + type + "er"));
		rm.attr("tabindex", -1);

		if (bHeaderHidden) {
			rm.class("sapMListTblHeaderNone");
		} else {
			rm.class("sapMListTblRow").class("sapMLIBFocusable").class("sapMListTbl" + type + "er");
			ColumnListItemRenderer.addLegacyOutlineClass.call(ColumnListItemRenderer, rm);
		}

		rm.openEnd();

		createBlankCell("HighlightCol", type + "Highlight", true);

		if (iModeOrder == -1) {
			if (mode == "MultiSelect" && type == "Head" && !bHeaderHidden) {
				rm.openStart("th");
				rm.class("sapMTableTH");
				rm.attr("aria-hidden", "true");
				rm.class(clsPrefix + "SelCol");
				rm.attr("role", "presentation");
				rm.openEnd();
				rm.renderControl(oTable._getSelectAllCheckbox());
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
			if (oColumn.isHidden()) {
				hiddens++;
			}

			var control = oColumn["get" + type + "er"](),
				width = (iHeaderLength == 1) ? "" : oColumn.getWidth(),
				cls = oColumn.getStyleClass(true),
				align = oColumn.getCssAlign();

			if (type == "Head") {
				rm.openStart(cellTag, oColumn);
				rm.class("sapMTableTH");
				rm.attr("role", "columnheader");
				var sSortIndicator = oColumn.getSortIndicator().toLowerCase();
				sSortIndicator !== "none" && rm.attr("aria-sort", sSortIndicator);
			} else {
				rm.openStart(cellTag);
			}

			cls && rm.class(cls);
			rm.class(clsPrefix + "Cell");
			rm.class(clsPrefix + type + "erCell");
			rm.attr("data-sap-width", oColumn.getWidth());
			rm.style("width", width);

			// required to set the correct aligment to the footer cell
			if (align && type !== "Head") {
				rm.style("text-align", align);
			}

			rm.openEnd();

			if (control) {
				if (type === "Head") {
					rm.openStart("div");
					rm.class("sapMColumnHeader");

					if (oTable.bActiveHeaders) {
						// add active header attributes and style class
						rm.attr("tabindex", 0);
						rm.attr("role", "button");
						rm.attr("aria-haspopup", "dialog");
						rm.class("sapMColumnHeaderActive");
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

		createBlankCell("NavCol", type + "Nav", !oTable._iItemNeedsColumn);

		if (iModeOrder == 1) {
			createBlankCell("SelCol", "", true);
		}

		createBlankCell("NavigatedCol", type + "Navigated", true);

		rm.close("tr");
		rm.close(groupTag);

		if (type == "Head") {
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
		rm.attr("role", "application");
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
	 * returns additional labels for accessibility
	 */
	TableRenderer.getAriaLabelledBy = function(oControl) {
		var sParentLabel = ListBaseRenderer.getAriaLabelledBy.call(this, oControl);
		var sLabel = this.getAriaAnnouncement("TABLE_ROLE_DESCRIPTION");
		if (sParentLabel && sLabel) {
			return sParentLabel + " " + sLabel;
		}
		return sLabel || sParentLabel;
	};

	/**
	 * generate table columns
	 */
	TableRenderer.renderListHeadAttributes = function(rm, oControl) {
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
	};

	/**
	 * render no data
	 */
	TableRenderer.renderNoData = function(rm, oControl) {
		rm.openStart("tr", oControl.getId("nodata"));
		rm.attr("tabindex", oControl.getKeyboardMode() == ListKeyboardMode.Navigation ? -1 : 0);
		rm.class("sapMLIB").class("sapMListTblRow").class("sapMLIBTypeInactive");
		ColumnListItemRenderer.addFocusableClasses.call(ColumnListItemRenderer, rm);
		if (!oControl._headerHidden || (!oControl.getHeaderText() && !oControl.getHeaderToolbar())) {
			rm.class("sapMLIBShowSeparator");
		}
		rm.openEnd();

		rm.openStart("td", oControl.getId("nodata-text"));
		rm.attr("colspan", oControl.getColCount());
		rm.class("sapMListTblCell").class("sapMListTblCellNoData");
		rm.openEnd();

		if (!oControl.shouldRenderItems()) {
			rm.text(Core.getLibraryResourceBundle("sap.m").getText("TABLE_NO_COLUMNS"));
		} else {
			rm.text(oControl.getNoDataText(true));
		}

		rm.close("td");
		rm.close("tr");
	};

	return TableRenderer;

}, /* bExport= */ true);