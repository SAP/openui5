/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/m/changeHandler/MoveTableColumns",
	"sap/m/changeHandler/AddTableColumn",
	"sap/m/flexibility/EngineFlex"
], function (MoveTableColumns, AddTableColumn, EngineFlex) {
	"use strict";

	return Object.assign(EngineFlex, {
		"hideControl": "default",
		"unhideControl": "default",
		"moveTableColumns": MoveTableColumns,
		"addTableColumn": AddTableColumn
	});
}, /* bExport= */ true);