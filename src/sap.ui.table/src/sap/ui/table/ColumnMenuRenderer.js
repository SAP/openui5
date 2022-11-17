/*!
 * ${copyright}
 */

// Provides default renderer for control sap.ui.table.ColumnMenu
sap.ui.define(['sap/ui/table/ColumnMenu'], function(Menu) {
	"use strict";
	// Renderer defined already in ColumnMenu.js -> Keep this file for legacy purposes (e.g. AMD module dependencies)
	return Menu.getMetadata().getRenderer();
}, /* bExport= */ true);