/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Renderer",
	"sap/ui/core/library",
	"sap/ui/core/Core",
	"sap/ui/Device",
	"sap/base/Log",
	"./library",
	"./ListItemBaseRenderer"
],
	function(Renderer, coreLibrary, Core, Device, Log, library, ListItemBaseRenderer) {
	"use strict";

	// shortcut for sap.m.PopinDisplay
	var PopinDisplay = library.PopinDisplay;

	// shortcut for sap.ui.core.VerticalAlign
	var VerticalAlign = coreLibrary.VerticalAlign;

	// shortcut for sap.m.PopinLayout
	var PopinLayout = library.PopinLayout;

	/**
	 * ColumnListItem renderer.
	 * @namespace
	 */
	var ColumnListItemRenderer = Renderer.extend(ListItemBaseRenderer);
	ColumnListItemRenderer.apiVersion = 2;

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

	/**
	 * Renders the HTML for the given control, using the provided
	 * {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager}
	 *            oRenderManager the RenderManager that can be used for writing to
	 *            the Render-Output-Buffer
	 * @param {sap.ui.core.Control}
	 *            oControl an object representation of the control that should be
	 *            rendered
	 */
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

			if (!oCell || !oColumn.getVisible() || oColumn.isPopin()) {
				// update the visible index of the column
				oColumn.setIndex(-1);
				return;
			}

			rm.openStart("td", oLI.getId() + "_cell" + i);
			rm.class("sapMListTblCell");
			rm.attr("data-sap-ui-column", oColumn.getId());

			// check column properties
			if (oColumn) {
				rm.class(oColumn.getStyleClass(true));

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
			}

			rm.openEnd();

			if (bRenderCell) {
				this.applyAriaLabelledBy(oHeader, oCell);
				rm.renderControl(oCell);
			}

			rm.close("td");
		}, this);
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

		if (oLI.isSelectable()) {
			rm.attr("aria-selected", oLI.getSelected());
		}

		rm.openEnd();

		this.renderHighlight(rm, oLI);

		// cell
		rm.openStart("td", oLI.getId() + "-subcell");
		rm.attr("colspan", oTable.getColSpan());

		var sPopinLayout = oTable.getPopinLayout();
		// overwrite sPopinLayout=Block to avoid additional margin-top in IE and Edge
		if (Device.browser.msie || (Device.browser.edge && Device.browser.version < 16)) {
			sPopinLayout = PopinLayout.Block;
		}

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

			var sStyleClass = oColumn.getStyleClass(),
				sPopinDisplay = oColumn.getPopinDisplay();

			/* row start */
			rm.openStart("div");
			rm.class("sapMListTblSubCntRow");
			sStyleClass && rm.class(sStyleClass);
			rm.openEnd();

			/* header cell */
			if (oHeader && sPopinDisplay != PopinDisplay.WithoutHeader) {
				rm.openStart("div").class("sapMListTblSubCntHdr").openEnd();
				oHeader = oHeader.clone();
				oColumn.addDependent(oHeader);
				oLI._addClonedHeader(oHeader);
				rm.renderControl(oHeader);
				rm.close("div");

				rm.openStart("div").class("sapMListTblSubCntSpr").openEnd();
				rm.text(":");
				rm.close("div");
			}

			/* value cell */
			if (oCell) {
				rm.openStart("div");
				rm.class("sapMListTblSubCntVal");
				rm.class("sapMListTblSubCntVal" + sPopinDisplay);
				rm.openEnd();
				this.applyAriaLabelledBy(oHeader, oCell);
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
	};

	return ColumnListItemRenderer;

}, /* bExport= */ true);