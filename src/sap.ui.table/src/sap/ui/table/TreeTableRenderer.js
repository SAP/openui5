/*!
 * ${copyright}
 */

// Provides default renderer for control sap.ui.table.TreeTable
sap.ui.define(['sap/ui/table/TreeTable'], function(Table) {
	"use strict";
	// Renderer defined already in TreeTable.js -> Keep this file for legacy purposes (e.g. AMD module dependencies)
	return Table.getMetadata().getRenderer();
}, /* bExport= */ true);