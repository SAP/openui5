/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', './ListItemBaseRenderer', './ListRenderer', 'sap/ui/core/Renderer'],
	function(jQuery, ListItemBaseRenderer, ListRenderer, Renderer) {
	"use strict";

	/**
	 * ColumnListItem renderer.
	 * @namespace
	 */
	var ColumnListItemRenderer = Renderer.extend(ListItemBaseRenderer);

	// determines whether given control is a textual control or not
	// TODO: Change with a better way (e.g. Text Marker Interface)
	ColumnListItemRenderer.isTextualControl = function(oControl) {
		var mConstructors = [sap.m.Text, sap.m.Label, sap.m.Link, sap.m.Title];
		return mConstructors.some(function(fnConstructor) {
			return fnConstructor && oControl instanceof fnConstructor;
		});
	};

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

	ColumnListItemRenderer.openItemTag = function(rm, oLI) {
		rm.write("<tr");
	};

	ColumnListItemRenderer.closeItemTag = function(rm, oLI) {
		rm.write("</tr>");
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
		if (vAlign != sap.ui.core.VerticalAlign.Inherit) {
			rm.addClass("sapMListTblRow" + vAlign);
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
		if (oHeader &&
			oCell.getAriaLabelledBy &&
			this.isTextualControl(oHeader)) {

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
		rm.writeAttribute("colspan", oTable.getColCount() - 1);
		rm.write("><div class='sapMListTblSubCnt'>");

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
			if (oHeader && sPopinDisplay != sap.m.PopinDisplay.WithoutHeader) {
				rm.write("<div");
				rm.addClass("sapMListTblSubCntHdr");
				rm.writeClasses();
				rm.write(">");
				oHeader = oHeader.clone();
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
