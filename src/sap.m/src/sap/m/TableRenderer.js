/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', 'sap/ui/core/Renderer', './ListBaseRenderer'],
	function(jQuery, Renderer, ListBaseRenderer) {
	"use strict";


	/**
	 * @class List renderer.
	 * @static
	 *
	 * TableRenderer extends the ListBaseRenderer
	 */
	var TableRenderer = Renderer.extend(ListBaseRenderer);
	
	
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
			clsPrefix = "sapMListTbl",
			idPrefix = oTable.getId("tbl"),
			cellTag = (type == "Head") ? "th" : "td",
			groupTag = "t" + type.toLowerCase(),
			aColumns = oTable.getColumns(),
			isHeaderHidden = (type == "Head") && aColumns.every(function(oColumn) {
				return	!oColumn.getHeader() ||
						!oColumn.getVisible() ||
						oColumn.isPopin() ||
						oColumn.isNeverVisible() ||
						oColumn.isHidden();
			}),
			hasOneHeader = (type == "Head") && aColumns.filter(function(oColumn) {
				return	oColumn.getVisible() &&
						!oColumn.isPopin() &&
						!oColumn.isNeverVisible() &&
						!oColumn.isHidden();
			}).length == 1,
			createBlankCell = function(cls, id) {
				rm.write("<");
				rm.write(cellTag);
				id && rm.writeAttribute("id", idPrefix + id);
				rm.addClass(clsPrefix + cls);
				rm.writeClasses();
				rm.write("></");
				rm.write(cellTag);
				rm.write(">");
				index++;
			};
	
		rm.write("<" + groupTag + ">");
		rm.write("<tr");
		rm.writeAttribute("tabindex", -1);
		rm.writeAttribute("id", oTable.addNavSection(idPrefix + type + "er" ));
	
		if (isHeaderHidden) {
			rm.addClass("sapMListTblHeaderNone");
		} else {
			rm.addClass("sapMListTblRow sapMListTbl" + type + "er");
		}
	
		rm.writeClasses();
		rm.write(">");
	
		if (mode != "None" && mode != "SingleSelect" && mode != "Delete") {
			if (mode == "SingleSelectMaster") {
				createBlankCell("None");
				hiddens++;
			} else if (mode == "MultiSelect" && type == "Head" && !isHeaderHidden) {
				rm.write("<th class='" + clsPrefix + "SelCol'><div class='sapMLIBSelectM'>");
				rm.renderControl(oTable._getSelectAllCheckbox());
				rm.write("</div></th>");
				index++;
			} else {
				createBlankCell("SelCol");
			}
		}
	
		if (sap.ui.core.theming.Parameters.get("sapUiLIUnreadAsBubble") == "true" && oTable.getShowUnread()) {
			createBlankCell("UnreadCol");
		}
	
		aColumns.forEach(function(oColumn, order) {
			oColumn.setIndex(-1);
			oColumn.setInitialOrder(order);
		});
	
		oTable.getColumns(true).forEach(function(oColumn, order) {
			if (!oColumn.getVisible()) {
				return;
			}
			if (oColumn.isPopin()) {
				hasPopin = true;
				return;
			}
			if (oColumn.isNeverVisible()) {
				return;
			}
			if (oColumn.isHidden()) {
				hiddens++;
			}
	
			var control = oColumn["get" + type + "er"](),
				width = hasOneHeader ? "" : oColumn.getWidth(),
				cls = oColumn.getStyleClass(true);
	
			rm.write("<" + cellTag);
			cls && rm.addClass(cls);
			rm.addClass(clsPrefix + "Cell");
			rm.addClass(clsPrefix + type + "erCell");
			rm.writeAttribute("id", idPrefix + type + index);
			rm.writeAttribute("data-sap-orig-width", oColumn.getWidth());
			width && rm.addStyle("width", width);
			rm.addStyle("text-align", oColumn.getCssAlign());
			rm.writeClasses();
			rm.writeStyles();
			rm.write(">");
			if (control) {
				oColumn.applyAlignTo(control);
				rm.renderControl(control);
			}
			if (type == "Head" && !hasFooter) {
				hasFooter = !!oColumn.getFooter();
			}
			rm.write("</" + cellTag + ">");
			oColumn.setIndex(index++);
		});
	
		createBlankCell("NavCol", type + "Nav");
	
		if (mode == "SingleSelect" || mode == "Delete") {
			createBlankCell("SelCol");
		}
	
		rm.write("</tr></" + groupTag + ">");
	
		if (type == "Head") {
			oTable._hasPopin = hasPopin;
			oTable._colCount = index - hiddens;
			oTable._hasFooter = hasFooter;
			oTable._headerHidden = isHeaderHidden;
		}
	};
	
	
	/**
	 * add table container class name
	 */
	TableRenderer.renderContainerAttributes = function(rm, oControl) {
		oControl._bRendering = true;
		rm.addClass("sapMListTblCnt");
	};
	
	/**
	 * render table tag and add required classes
	 */
	TableRenderer.renderListStartAttributes = function(rm, oControl) {
		rm.write("<table");
		rm.addClass("sapMListTbl");
		rm.addStyle("table-layout", oControl.getFixedLayout() ? "fixed" : "auto");
	};
	
	/**
	 * generate table columns
	 */
	TableRenderer.renderListHeadAttributes = function(rm, oControl) {
		this.renderColumns(rm, oControl, "Head");
		rm.write("<tbody");
		rm.writeAttribute("id", oControl.addNavSection(oControl.getId("tblBody")));
		rm.write(">");
	};
	
	/**
	 * render footer and finish rendering table
	 */
	TableRenderer.renderListEndAttributes = function(rm, oControl) {
		rm.write("</tbody>");	// items should be rendered before foot
		oControl._hasFooter && this.renderColumns(rm, oControl, "Foot");
		oControl._bRendering = false;
		rm.write("</table>");
	};
	
	/**
	 * render no data
	 */
	TableRenderer.renderNoData = function(rm, oControl) {
		rm.write("<tr");
		rm.writeAttribute("id", oControl.getId("nodata"));
		rm.addClass("sapMLIB sapMListTblRow sapMLIBTypeInactive");
		if (!oControl._headerHidden || (!oControl.getHeaderText() && !oControl.getHeaderToolbar()) ) {
			rm.addClass("sapMLIBShowSeparator");
		}
		rm.writeClasses();
		rm.write("><td");
		rm.writeAttribute("id", oControl.getId("nodata-text"));
		rm.writeAttribute("colspan", oControl.getColCount());
		rm.addClass("sapMListTblCell sapMListTblCellNoData");
		rm.writeClasses();
		rm.write(">");
		rm.writeEscaped(oControl.getNoDataText());
		rm.write("</td></tr>");
	};

	return TableRenderer;

}, /* bExport= */ true);
