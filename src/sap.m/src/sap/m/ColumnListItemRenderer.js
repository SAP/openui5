/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Renderer",
	"sap/ui/core/library",
	"sap/ui/core/Core",
	"sap/base/Log",
	"./library",
	"./ListItemBaseRenderer"
],
	function(Renderer, coreLibrary, Core, Log, library, ListItemBaseRenderer) {
	"use strict";

	// shortcut for sap.m.PopinDisplay
	var PopinDisplay = library.PopinDisplay;

	// shortcut for sap.ui.core.VerticalAlign
	var VerticalAlign = coreLibrary.VerticalAlign;

	/**
	 * ColumnListItem renderer.
	 * @namespace
	 */
	var ColumnListItemRenderer = Renderer.extend(ListItemBaseRenderer);
	ColumnListItemRenderer.apiVersion = 2;

	/**
	 * Renders the HTML for the given control, using the provided
	 * {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} rm
	 *            RenderManager that can be used to render the control's DOM
	 * @param {sap.m.ColumnListItem} oLI
	 *            The item to be rendered
	 */
	ColumnListItemRenderer.render = function(rm, oLI) {
		var oTable = oLI.getTable();
		if (!oTable) {
			return;
		}

		ListItemBaseRenderer.render.apply(this, arguments);

		if (oLI.getVisible() && oTable.hasPopin()) {
			this.renderPopin(rm, oLI, oTable);
		}
	};

	// render type highlight always within a cell
	ColumnListItemRenderer.renderHighlight = function(rm, oLI) {
		rm.openStart("td");
		rm.class("sapMListTblHighlightCell");
		rm.attr("role", "presentation");
		rm.attr("aria-hidden", "true");
		rm.openEnd();

		// let the list item base render the highlight
		ListItemBaseRenderer.renderHighlight.apply(this, arguments);

		rm.close("td");
	};

	ColumnListItemRenderer.renderNavigated = function(rm, oLI) {
		rm.openStart("td");
		rm.class("sapMListTblNavigatedCell");
		rm.attr("role", "presentation");
		rm.attr("aria-hidden", "true");
		rm.openEnd();

		// let the list item base render the navigated state
		ListItemBaseRenderer.renderNavigated.apply(this, arguments);

		rm.close("td");
	};

	// render type content always within a cell
	ColumnListItemRenderer.renderType = function(rm, oLI) {
		rm.openStart("td");
		rm.class("sapMListTblNavCol");
		rm.attr("role", "presentation");
		rm.attr("aria-hidden", "true");
		rm.openEnd();

		// let the list item base render the type
		ListItemBaseRenderer.renderType.apply(this, arguments);

		rm.close("td");
	};

	// wrap mode content with a cell
	ColumnListItemRenderer.renderModeContent = function(rm, oLI) {
		rm.openStart("td");
		rm.class("sapMListTblSelCol");
		rm.attr("role", "presentation");
		rm.attr("aria-hidden", "true");
		rm.openEnd();

		// let the list item base render the mode control
		ListItemBaseRenderer.renderModeContent.apply(this, arguments);

		rm.close("td");
	};

	// ColumnListItem does not respect counter property of the LIB
	ColumnListItemRenderer.renderCounter = function(rm, oLI) {
	};

	// Returns aria accessibility role
	ColumnListItemRenderer.getAriaRole = function(oLI) {
		return "";
	};

	ColumnListItemRenderer.renderLIAttributes = function(rm, oLI) {
		rm.class("sapMListTblRow");
		var vAlign = oLI.getVAlign();
		if (vAlign != VerticalAlign.Inherit) {
			rm.class("sapMListTblRow" + vAlign);
		}

		var oTable = oLI.getTable();
		if (oTable && oTable.getAlternateRowColors()) {
			var iPos = oTable.indexOfItem(oLI);
			if (iPos % 2 == 0) {
				rm.class("sapMListTblRowAlternate");
			}
		}
	};


	/**
	 * Overwriting hook method of ListItemBase
	 *
	 * @public
	 *
	 * @param {sap.ui.core.RenderManager} rm RenderManager
	 * @param {sap.m.ListItemBase} oLI List item
	 */
	ColumnListItemRenderer.renderLIContentWrapper = function(rm, oLI) {
		var oTable = oLI.getTable();
		if (!oTable) {
			return;
		}

		var aColumns = oTable.getColumns(true),
			aCells = oLI.getCells();

		// remove cloned headers
		oLI._destroyClonedHeaders();

		aColumns.forEach(function(oColumn, i) {
			var oHeader,
				bRenderCell = true,
				oCell = aCells[oColumn.getInitialOrder()];

			if (!oColumn.getVisible() || !oCell || oColumn.isPopin()) {
				// update the visible index of the column
				oColumn.setIndex(-1);
				return;
			}

			rm.openStart("td", oLI.getId() + "_cell" + i);
			rm.class("sapMListTblCell");
			rm.attr("data-sap-ui-column", oColumn.getId());

			// check column properties
			if (oColumn) {
				var aStyleClass = oColumn.getStyleClass(true).split(" ");
				aStyleClass && aStyleClass.forEach(function(sClassName) {
					rm.class(sClassName);
				});

				// aria for virtual keyboard mode
				oHeader = oColumn.getHeader();
				if (oHeader) {
					rm.attr("headers", oColumn.getId());
				}

				// merge duplicate cells
				if (!oTable.hasPopin() && oColumn.getMergeDuplicates()) {
					var sFuncWithParam = oColumn.getMergeFunctionName(),
						aFuncWithParam = sFuncWithParam.split("#"),
						sFuncParam = aFuncWithParam[1],
						sFuncName = aFuncWithParam[0];

					if (typeof oCell[sFuncName] != "function") {
						Log.warning("mergeFunctionName property is defined on " + oColumn + " but this is not function of " + oCell);
					} else if (oTable._bRendering || !oCell.bOutput) {
						var lastColumnValue = oColumn.getLastValue(),
							cellValue = oCell[sFuncName](sFuncParam);

						if (lastColumnValue === cellValue) {
							// it is not necessary to render the cell content but screen readers need the content to announce it
							bRenderCell = Core.getConfiguration().getAccessibility();
							oCell.addStyleClass("sapMListTblCellDupCnt");
							rm.class("sapMListTblCellDup");
						} else {
							oColumn.setLastValue(cellValue);
						}
					} else if (oCell.hasStyleClass("sapMListTblCellDupCnt")) {
						rm.class("sapMListTblCellDup");
					}
				}

				oColumn.getVAlign() != "Inherit" && rm.style("vertical-align", oColumn.getVAlign().toLowerCase());
				rm.style("text-align", oColumn.getCssAlign());

				if (oColumn.isHidden()) {
					rm.style("display", "none");
					rm.attr("aria-hidden", "true");
				}
			}

			rm.openEnd();

			if (bRenderCell) {
				this.applyAriaLabelledBy(oHeader, oCell);
				rm.renderControl(oCell);
			}

			rm.close("td");
		}, this);
	};

	ColumnListItemRenderer.renderDummyCell = function(rm, oTable) {
		rm.openStart("td");
		rm.class("sapMListTblDummyCell");
		rm.attr("role", "presentation");
		rm.attr("aria-hidden", "true");
		rm.openEnd();
		rm.close("td");
	};

	ColumnListItemRenderer.applyAriaLabelledBy = function(oHeader, oCell) {
		/* add the header as an aria-labelled by association for the cells if it does not already exists */
		/* only set the header text to the aria-labelledby association if the header is a textual control and visible */
		if (oHeader &&
			oHeader.getText &&
			oHeader.getVisible() &&
			oCell.getAriaLabelledBy &&
			(oCell.getAriaLabelledBy() || []).indexOf(oHeader.getId()) == -1) {
			oCell.addAriaLabelledBy(oHeader);
		}
	};

	/**
	 * Renders pop-ins for Table Rows
	 *
	 * @private
	 *
	 * @param {sap.ui.core.RenderManager} rm RenderManager
	 * @param {sap.m.ListItemBase} oLI List item
	 * @param {sap.m.Table} oTable Table control
	 */
	ColumnListItemRenderer.renderPopin = function(rm, oLI, oTable) {
		// remove existing popin first
		oLI.removePopin();

		// popin row
		rm.openStart("tr", oLI.getPopin());
		rm.class("sapMListTblSubRow");
		rm.attr("tabindex", "-1");
		rm.attr("data-sap-ui-related", oLI.getId());

		if (oLI.isSelectable()) {
			rm.attr("aria-selected", oLI.getSelected());
		}

		rm.openEnd();

		this.renderHighlight(rm, oLI);

		// cell
		rm.openStart("td", oLI.getId() + "-subcell");
		rm.class("sapMListTblSubRowCell");
		rm.attr("colspan", oTable.shouldRenderDummyColumn() ? oTable.getColSpan() + 1 : oTable.getColSpan());

		var sPopinLayout = oTable.getPopinLayout();
		rm.attr("aria-labelledby", this.getAriaAnnouncement(null, "TABLE_POPIN_ROLE_DESCRIPTION"));
		rm.openEnd();

		rm.openStart("div");
		rm.class("sapMListTblSubCnt");
		rm.class("sapMListTblSubCnt" + sPopinLayout);
		rm.openEnd();

		var aCells = oLI.getCells(),
			aColumns = oTable.getColumns(true);

		aColumns.forEach(function(oColumn) {
			if (!oColumn.getVisible() || !oColumn.isPopin()) {
				return;
			}

			var oCell = aCells[oColumn.getInitialOrder()],
				oHeader = oColumn.getHeader();

			if (!oHeader && !oCell) {
				return;
			}

			var aStyleClass = oColumn.getStyleClass().split(" "),
				sPopinDisplay = oColumn.getPopinDisplay(),
				oOriginalHeader = oHeader;

			/* row start */
			rm.openStart("div");
			rm.class("sapMListTblSubCntRow");

			if (sPopinDisplay == PopinDisplay.Inline) {
				rm.class("sapMListTblSubCntRowInline");
			}

			aStyleClass && aStyleClass.forEach(function(sClassName) {
				rm.class(sClassName);
			});
			rm.openEnd();

			/* header cell */
			if (oHeader && sPopinDisplay != PopinDisplay.WithoutHeader) {
				rm.openStart("div").class("sapMListTblSubCntHdr").openEnd();
				if (oTable._aPopinHeaders.indexOf(oHeader) === -1) {
					oTable._aPopinHeaders.push(oOriginalHeader);
				}
				oHeader = oHeader.clone();
				oColumn.addDependent(oHeader);
				oLI._addClonedHeader(oHeader);
				rm.renderControl(oHeader);
				rm.openStart("span").class("sapMListTblSubCntSpr");
				rm.attr("data-popin-colon", Core.getLibraryResourceBundle("sap.m").getText("TABLE_POPIN_LABEL_COLON"));
				rm.openEnd().close("span");
				rm.close("div");
			}

			/* value cell */
			if (oCell) {
				rm.openStart("div");
				rm.class("sapMListTblSubCntVal");
				rm.class("sapMListTblSubCntVal" + sPopinDisplay);
				rm.openEnd();
				this.applyAriaLabelledBy(oOriginalHeader, oCell);
				rm.renderControl(oCell);
				rm.close("div");
			}

			/* row end */
			rm.close("div");
		}, this);

		rm.close("div");
		rm.close("td");

		this.renderNavigated(rm, oLI);

		rm.close("tr");
	};

	/**
	 * Overwriting hook method of ListItemBase.
	 *
	 * @param {sap.ui.core.RenderManager} rm RenderManager
	 * @param {sap.m.ListItemBase} [oLI] List item
	 */
	ColumnListItemRenderer.addLegacyOutlineClass = function(rm, oLI) {
		var oTable = oLI.isA("sap.m.Table") ? oLI : oLI.getTable();
		if (oTable && !oTable.hasPopin() && oTable.shouldRenderDummyColumn()) {
			rm.class("sapMTableRowCustomFocus");
		}
	};

	ColumnListItemRenderer.renderContentLatter = function(rm, oLI) {
		var oTable = oLI.getTable();

		if (oTable && oTable.shouldRenderDummyColumn()) {
			if (!oTable.hasPopin()) {
				ListItemBaseRenderer.renderContentLatter.apply(this, arguments);
				ColumnListItemRenderer.renderDummyCell(rm, oTable);
			} else {
				ColumnListItemRenderer.renderDummyCell(rm, oTable);
				ListItemBaseRenderer.renderContentLatter.apply(this, arguments);
			}
		} else {
			ListItemBaseRenderer.renderContentLatter.apply(this, arguments);
		}
	};

	return ColumnListItemRenderer;

}, /* bExport= */ true);