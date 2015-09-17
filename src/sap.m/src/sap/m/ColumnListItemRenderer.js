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

	ColumnListItemRenderer.handleNoFlex = function(rm, oLI) {
	};

	// render type content always within a cell
	ColumnListItemRenderer.renderType = function(rm, oLI) {
		rm.write('<td role="gridcell" class="sapMListTblNavCol"');
		
		if (oLI.getSelected()) {
			rm.writeAttribute("aria-selected", "true");
		}
		
		if (!oLI.needsTypeColumn()) {
			rm.writeAttribute("aria-hidden", "true");
		}
		
		rm.write('>');
		
		// let the list item base render the type
		ListItemBaseRenderer.renderType.apply(this, arguments);
		
		rm.write('</td>');
	};

	// wrap mode content with a cell
	ColumnListItemRenderer.renderModeContent = function(rm, oLI) {
		rm.write('<td role="gridcell" class="sapMListTblSelCol"');
		oLI.getSelected() && rm.writeAttribute("aria-selected", "true");
		rm.write('>');
		
		// let the list item base render the mode control
		ListItemBaseRenderer.renderModeContent.apply(this, arguments);
		
		rm.write('</td>');
	};

	// ColumnListItem does not respect counter property of the LIB
	ColumnListItemRenderer.renderCounter = function(rm, oLI) {
	};
	
	// Returns aria accessibility role
	ColumnListItemRenderer.getAriaRole = function(oLI) {
		return "row";
	};
	
	// Returns the inner aria labelledby ids for the accessibility
	ColumnListItemRenderer.getAriaLabelledBy = function(oLI) {
		var oTable = oLI.getTable(); 
		if (!oTable || !oTable.hasPopin()) {
			return;
		}
		
		// when table has pop-in let the screen readers announce it
		return oLI.getId() + " " + oLI.getId() + "-sub";
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
			aCells = oLI.getCells(),
			bSelected = oLI.getSelected();
	
		// remove cloned headers
		oLI.destroyClonedHeaders();
	
		aColumns.forEach(function(oColumn, i) {
			var cls,
				oHeader,
				bRenderCell = true,
				oCell = aCells[oColumn.getInitialOrder()];
	
			if (!oCell || !oColumn.getVisible() || oColumn.isNeverVisible(true) || oColumn.isPopin()) {
				// update the visible index of the column
				oColumn.setIndex(-1);
				return;
			}
	
			rm.write("<td");
			rm.addClass("sapMListTblCell");
			rm.writeAttribute("id", oLI.getId() + "_cell" + i);
			rm.writeAttribute("role", "gridcell");
			
			if (bSelected) {
				// write aria-selected explicitly for the cells
				rm.writeAttribute("aria-selected", "true");
			}
	
			// check column properties
			if (oColumn) {
				cls = oColumn.getStyleClass(true);
				cls && rm.addClass(jQuery.sap.encodeHTML(cls));
				
				// aria for virtual keyboard mode
				oHeader = oColumn.getHeader();
				if (oHeader) {
					rm.writeAttribute("aria-describedby", oHeader.getId());
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
				rm.renderControl(oColumn.applyAlignTo(oCell));
			}
			rm.write("</td>");
		});
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
		oLI._popinId = oLI.getId() + "-sub";
		rm.write("<tr class='sapMListTblSubRow'");
		rm.writeAttribute("id", oLI._popinId);
		rm.writeAttribute("role", "row");
		rm.writeAttribute("tabindex", "-1");
		
		// logical parent of the popin is the base row
		rm.writeAttribute("aria-owns", oLI.getId());
		
		rm.write("><td");
		rm.writeAttribute("role", "gridcell");
		rm.writeAttribute("colspan", oTable.getColCount());
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
				oLI.addClonedHeader(oHeader);
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
				rm.renderControl(oCell);
				rm.write("</div>");
			}
	
			/* row end */
			rm.write("</div>");
		});
	
		rm.write("</div></td></tr>");
	};

	return ColumnListItemRenderer;

}, /* bExport= */ true);
