/*!
 * ${copyright}
 */

sap.ui.define([
	"jquery.sap.global",
	"sap/ui/core/Renderer",
	"sap/ui/core/library",
	"sap/ui/Device",
	"./library",
	"./ListItemBaseRenderer",
	"./Label"
],
	function(jQuery, Renderer, coreLibrary, Device, library, ListItemBaseRenderer, Label) {
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
		rm.write('<td class="sapMListTblHighlightCell" aria-hidden="true">');

		// let the list item base render the highlight
		ListItemBaseRenderer.renderHighlight.apply(this, arguments);

		rm.write('</td>');
	};

	// render type content always within a cell
	ColumnListItemRenderer.renderType = function(rm, oLI) {
		rm.write('<td class="sapMListTblNavCol" aria-hidden="true">');

		// let the list item base render the type
		ListItemBaseRenderer.renderType.apply(this, arguments);

		rm.write('</td>');
	};

	// wrap mode content with a cell
	ColumnListItemRenderer.renderModeContent = function(rm, oLI) {
		rm.write('<td class="sapMListTblSelCol" aria-hidden="true">');

		// let the list item base render the mode control
		ListItemBaseRenderer.renderModeContent.apply(this, arguments);

		rm.write('</td>');
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
		rm.addClass("sapMListTblRow");
		var vAlign = oLI.getVAlign();
		if (vAlign != VerticalAlign.Inherit) {
			rm.addClass("sapMListTblRow" + vAlign);
		}

		var oTable = oLI.getTable();
		if (oTable && oTable.getAlternateRowColors()) {
			var iPos = oTable.indexOfItem(oLI);
			if (iPos % 2 == 0) {
				rm.addClass("sapMListTblRowAlternate");
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
			var cls,
				oHeader,
				bRenderCell = true,
				oCell = aCells[oColumn.getInitialOrder()];

			if (!oCell || !oColumn.getVisible() || oColumn.isPopin()) {
				// update the visible index of the column
				oColumn.setIndex(-1);
				return;
			}

			rm.write("<td");
			rm.addClass("sapMListTblCell");
			rm.writeAttribute("id", oLI.getId() + "_cell" + i);
			rm.writeAttribute("data-sap-ui-column", oColumn.getId());

			// check column properties
			if (oColumn) {
				cls = oColumn.getStyleClass(true);
				cls && rm.addClass(jQuery.sap.encodeHTML(cls));

				// aria for virtual keyboard mode
				oHeader = oColumn.getHeader();
				if (oHeader) {
					rm.writeAttribute("headers", oHeader.getId());
				}

				// merge duplicate cells
				if (!oTable.hasPopin() && oColumn.getMergeDuplicates()) {
					var sFuncWithParam = oColumn.getMergeFunctionName(),
						aFuncWithParam = sFuncWithParam.split("#"),
						sFuncParam = aFuncWithParam[1],
						sFuncName = aFuncWithParam[0];

					if (typeof oCell[sFuncName] != "function") {
						jQuery.sap.log.warning("mergeFunctionName property is defined on " + oColumn + " but this is not function of " + oCell);
					} else {
						var lastColumnValue = oColumn.getLastValue(),
							cellValue = oCell[sFuncName](sFuncParam);

						if (lastColumnValue === cellValue) {
							// it is not necessary to render cell content but
							// screen readers need content to announce it
							bRenderCell = sap.ui.getCore().getConfiguration().getAccessibility();
							oCell.addStyleClass("sapMListTblCellDupCnt");
							rm.addClass("sapMListTblCellDup");
						} else {
							oColumn.setLastValue(cellValue);
						}
					}
				}

				oColumn.getVAlign() != "Inherit" && rm.addStyle("vertical-align", oColumn.getVAlign().toLowerCase());
				var sAlign = oColumn.getCssAlign();
				if (sAlign) {
					rm.addStyle("text-align", sAlign);
				}

				rm.writeStyles();
			}

			rm.writeClasses();
			rm.write(">");

			if (bRenderCell) {
				this.applyAriaLabelledBy(oHeader, oCell);
				rm.renderControl(oColumn.applyAlignTo(oCell));
			}

			rm.write("</td>");
		}, this);
	};

	ColumnListItemRenderer.applyAriaLabelledBy = function(oHeader, oCell) {
		if (oCell) {
			oCell.removeAssociation("ariaLabelledBy", oCell.data("ariaLabelledBy") || undefined, true);
		}

		/* add the header as an aria-labelled by association for the cells */
		/* only set the header text to the aria-labelled association if the header is a textual control and is visible */
		if (oHeader &&
			oHeader.getText &&
			oCell.getAriaLabelledBy &&
			oHeader.getVisible()) {

			// suppress the invalidation during the rendering
			oCell.addAssociation("ariaLabelledBy", oHeader, true);
			oCell.data("ariaLabelledBy", oHeader.getId());
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
		rm.write("<tr");
		rm.addClass("sapMListTblSubRow");
		rm.writeElementData(oLI.getPopin());
		rm.writeAttribute("tabindex", "-1");

		if (oLI.isSelectable()) {
			rm.writeAttribute("aria-selected", oLI.getSelected());
		}

		rm.writeClasses();
		rm.write(">");

		this.renderHighlight(rm, oLI);

		// cell
		rm.write("<td");
		rm.writeAttribute("id", oLI.getId() + "-subcell");
		rm.writeAttribute("colspan", oTable.getColSpan());

		var sPopinLayout = oTable.getPopinLayout();
		// overwrite sPopinLayout=Block to avoid additional margin-top in IE and Edge
		if (Device.browser.msie || Device.browser.edge) {
			sPopinLayout = PopinLayout.Block;
		}
		rm.write("><div");
		rm.addClass("sapMListTblSubCnt");
		rm.addClass("sapMListTblSubCnt" + sPopinLayout);
		rm.writeClasses();
		rm.write(">");

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
			rm.write("<div");
			rm.addClass("sapMListTblSubCntRow");
			sStyleClass && rm.addClass(jQuery.sap.encodeHTML(sStyleClass));
			rm.writeClasses();
			rm.write(">");

			/* header cell */
			if (oHeader && sPopinDisplay != PopinDisplay.WithoutHeader) {
				rm.write("<div");
				rm.addClass("sapMListTblSubCntHdr");
				rm.writeClasses();
				rm.write(">");

				var fnColumnHeaderClass = sap.ui.require("sap/m/ColumnHeader");
				if (typeof fnColumnHeaderClass == "function" && oHeader instanceof fnColumnHeaderClass) {
					var sColumnHeaderTitle = oHeader.getText();
					oHeader = new Label({text: sColumnHeaderTitle});
				} else {
					oHeader = oHeader.clone();
				}

				oColumn.addDependent(oHeader);
				oLI._addClonedHeader(oHeader);
				oColumn.applyAlignTo(oHeader, "Begin");
				rm.renderControl(oHeader);
				rm.write("</div>");

				/* separator cell */
				rm.write("<div class='sapMListTblSubCntSpr'>:</div>");
			}

			/* value cell */
			if (oCell) {
				rm.write("<div");
				rm.addClass("sapMListTblSubCntVal");
				rm.addClass("sapMListTblSubCntVal" + sPopinDisplay);
				rm.writeClasses();
				rm.write(">");
				oColumn.applyAlignTo(oCell, "Begin");
				this.applyAriaLabelledBy(oHeader, oCell);
				rm.renderControl(oCell);
				rm.write("</div>");
			}

			/* row end */
			rm.write("</div>");
		}, this);

		rm.write("</div></td></tr>");
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
