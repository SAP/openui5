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

	// wrap type content with a cell always
	ColumnListItemRenderer.renderType = function(rm, oLI) {
		rm.write('<td class="sapMListTblNavCol">');
		ListItemBaseRenderer.renderType.apply(this, arguments);
		rm.write('</td>');
	};

	// wrap mode content with a cell
	ColumnListItemRenderer.renderModeContent = function(rm, oLI) {
		rm.write('<td class="sapMListTblSelCol">');
		ListItemBaseRenderer.renderModeContent.apply(this, arguments);
		rm.write('</td>');
	};

	// ColumnListItem does not respect counter property of the LIB
	ColumnListItemRenderer.renderCounter = function(rm, oLI) {
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
		oLI.destroyClonedHeaders();
	
		// remove pop-in if list is not in rendering phase
		// in rendering phase all pop-ins are already removed
		if (!oTable._bRendering) {
			oLI.removePopin();
		}
	
		aColumns.forEach(function(oColumn, i) {
			var cls,
				bRenderCell = true,
				oCell = aCells[oColumn.getInitialOrder()];
	
			if (!oCell || !oColumn.getVisible() || oColumn.isNeverVisible(true) || oColumn.isPopin()) {
				return;
			}
	
			rm.write("<td");
			rm.addClass("sapMListTblCell");
			rm.writeAttribute("id", oLI.getId() + "_cell" + i);
	
			// check column properties
			if (oColumn) {
				cls = oColumn.getStyleClass(true);
				cls && rm.addClass(cls);
	
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
							bRenderCell = false;
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
		rm.write("><td");
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
			sStyleClass && rm.addClass(sStyleClass);
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
