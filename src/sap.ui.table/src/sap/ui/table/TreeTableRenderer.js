/*!
 * ${copyright}
 */

//Provides default renderer for control sap.ui.table.TreeTable
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Renderer', './TableRenderer'],
	function(jQuery, Renderer, TableRenderer) {
	"use strict";


	/**
	 * TreeTable renderer.
	 * @namespace
	 */
	var TreeTableRenderer = Renderer.extend(TableRenderer);


	TreeTableRenderer.renderTableCellControl = function(rm, oTable, oCell, iCellIndex) {
		if (oTable.isTreeBinding("rows") && iCellIndex === 0 && !oTable.getUseGroupMode()) {
			var oRow = oCell.getParent();
			rm.write("<span");
			rm.addClass("sapUiTableTreeIcon");
			rm.addClass(oCell.getParent()._sTreeIconClass);
			rm.writeClasses();
			var aLevelIndentCSS = oTable._getLevelIndentCSS(oRow);
			if (aLevelIndentCSS) {
				rm.addStyle.apply(rm, aLevelIndentCSS);
				rm.writeStyles();
			}
			rm.writeAttribute("tabindex", -1);
			oTable._getAccRenderExtension().writeAriaAttributesFor(rm, oTable, "TREEICON", {row: oRow});
			rm.write(">&nbsp;</span>");
		}
		rm.renderControl(oCell);
	};


	return TreeTableRenderer;

}, /* bExport= */ true);
