/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/m/changeHandler/MoveTableColumns",
	"sap/m/changeHandler/AddTableColumn"
], function (MoveTableColumns, AddTableColumn) {
	"use strict";

	return {
		"hideControl": "default",
		"unhideControl": "default",
		"moveTableColumns": MoveTableColumns,
		"addTableColumn": AddTableColumn
	};
}, /* bExport= */ true);