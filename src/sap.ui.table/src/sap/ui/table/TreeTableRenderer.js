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
			rm.write("<span");
			rm.addClass("sapUiTableTreeIcon");
			rm.addClass("sapUiTableTreeIconLeaf");
			rm.writeClasses();
			rm.writeAttribute("tabindex", -1);
			rm.write(">&nbsp;</span>");
		}
		rm.renderControl(oCell);
	};
	

	return TreeTableRenderer;

}, /* bExport= */ true);
