/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', 'sap/ui/core/Renderer', './ListBaseRenderer', './ColumnListItemRenderer', './ColumnHeader', 'sap/m/library'],
	function(jQuery, Renderer, ListBaseRenderer, ColumnListItemRenderer, ColumnHeader, library) {
	"use strict";


	// shortcut for sap.m.ListKeyboardMode
	var ListKeyboardMode = library.ListKeyboardMode;


	/**
	 * List renderer.
	 * @namespace
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
			iModeOrder = ListBaseRenderer.ModeOrder[mode],
			clsPrefix = "sapMListTbl",
			idPrefix = oTable.getId("tbl"),
			cellTag = (type == "Head") ? "th" : "td",
			groupTag = "t" + type.toLowerCase(),
			aColumns = oTable.getColumns(),
			isHeaderHidden = (type == "Head") && aColumns.every(function(oColumn) {
				return	!oColumn.getHeader() ||
						!oColumn.getHeader().getVisible() ||
						!oColumn.getVisible() ||
						oColumn.isPopin() ||
						oColumn.isHidden();
			}),
			hasOneHeader = (type == "Head") && aColumns.filter(function(oColumn) {
				return	oColumn.getVisible() &&
						!oColumn.isPopin() &&
						!oColumn.isHidden();
			}).length == 1,
			createBlankCell = function(cls, id, bAriaHidden) {
				rm.write("<");
				rm.write(cellTag);
				if (cellTag === "th") {
					rm.addClass("sapMTableTH");
				}
				bAriaHidden && rm.writeAttribute("aria-hidden", "true");
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
			rm.addClass("sapMListTblRow sapMLIBFocusable sapMListTbl" + type + "er");
			ColumnListItemRenderer.addLegacyOutlineClass.call(ColumnListItemRenderer, rm);
		}

		rm.writeClasses();
		rm.write(">");

		createBlankCell("HighlightCol", type + "Highlight", !oTable._iItemNeedsHighlight);

		if (iModeOrder == -1) {
			if (mode == "MultiSelect" && type == "Head" && !isHeaderHidden) {
				rm.write("<th");
				rm.addClass("sapMTableTH");
				rm.writeAttribute("aria-hidden", "true");
				rm.addClass(clsPrefix + "SelCol");
				rm.writeClasses();
				rm.write(">");
				rm.renderControl(oTable._getSelectAllCheckbox());
				rm.write("</th>");
				index++;
			} else {
				createBlankCell("SelCol");
			}
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
			if (oColumn.isHidden()) {
				hiddens++;
			}

			var control = oColumn["get" + type + "er"](),
				width = hasOneHeader ? "" : oColumn.getWidth(),
				cls = oColumn.getStyleClass(true),
				align = oColumn.getCssAlign();

			rm.write("<" + cellTag);
			cls && rm.addClass(jQuery.sap.encodeHTML(cls));

			if (type === "Head") {
				rm.writeElementData(oColumn);
				rm.addClass("sapMTableTH");
				// adding ColumnHeader specific class in order to overwrite the padding of the cell
				if (control instanceof ColumnHeader) {
					rm.addClass(clsPrefix + "CellCH");
				}
			}

			rm.addClass(clsPrefix + "Cell");
			rm.addClass(clsPrefix + type + "erCell");
			rm.writeAttribute("data-sap-width", oColumn.getWidth());
			width && rm.addStyle("width", width);

			if (align) {
				rm.addStyle("text-align", align);
			}

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

		createBlankCell("NavCol", type + "Nav", !oTable._iItemNeedsColumn);

		if (iModeOrder == 1) {
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
		rm.addClass("sapMListTblCnt");
	};

	/**
	 * render table tag and add required classes
	 */
	TableRenderer.renderListStartAttributes = function(rm, oControl) {
		rm.write("<table");
		rm.addClass("sapMListTbl");
		rm.addClass(oControl.getStickyStyleClass());
		if (oControl.getFixedLayout() === false) {
			rm.addStyle("table-layout", "auto");
		}

		// make the type column visible if needed
		if (oControl._iItemNeedsColumn) {
			rm.addClass("sapMListTblHasNav");
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
		this.renderColumns(rm, oControl, "Head");
		rm.write("<tbody");
		rm.writeAttribute("id", oControl.addNavSection(oControl.getId("tblBody")));
		if (oControl.getAlternateRowColors()) {
			rm.addClass(oControl._getAlternateRowColorsClass());
			rm.writeClasses();
		}
		rm.write(">");
	};

	/**
	 * render footer and finish rendering table
	 */
	TableRenderer.renderListEndAttributes = function(rm, oControl) {
		rm.write("</tbody>");	// items should be rendered before foot
		oControl._hasFooter && this.renderColumns(rm, oControl, "Foot");
		rm.write("</table>");
	};

	/**
	 * render no data
	 */
	TableRenderer.renderNoData = function(rm, oControl) {
		rm.write("<tr");
		rm.writeAttribute("tabindex", oControl.getKeyboardMode() == ListKeyboardMode.Navigation ? -1 : 0);
		rm.writeAttribute("id", oControl.getId("nodata"));
		rm.addClass("sapMLIB sapMListTblRow sapMLIBTypeInactive");
		ColumnListItemRenderer.addFocusableClasses.call(ColumnListItemRenderer, rm);
		if (!oControl._headerHidden || (!oControl.getHeaderText() && !oControl.getHeaderToolbar())) {
			rm.addClass("sapMLIBShowSeparator");
		}
		rm.writeClasses();
		rm.write(">");

		rm.write("<td");
		rm.writeAttribute("id", oControl.getId("nodata-text"));
		rm.writeAttribute("colspan", oControl.getColCount());
		rm.addClass("sapMListTblCell sapMListTblCellNoData");
		rm.writeClasses();
		rm.write(">");
		rm.writeEscaped(oControl.getNoDataText(true));
		rm.write("</td>");

		rm.write("</tr>");
	};

	return TableRenderer;

}, /* bExport= */ true);
