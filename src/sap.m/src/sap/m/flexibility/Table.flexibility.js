/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/m/changeHandler/MoveTableColumns",
	"sap/m/changeHandler/AddTableColumn",
	"sap/m/flexibility/EngineFlex",
	"sap/ui/fl/apply/api/DelegateMediatorAPI"
], function (MoveTableColumns, AddTableColumn, EngineFlex, DelegateMediatorAPI) {
	"use strict";

	DelegateMediatorAPI.registerWriteDelegate({
		controlType: "sap.m.Table",
		delegate: "sap/ui/comp/smartfield/flexibility/SmartFieldWriteDelegate",
		requiredLibraries: {
			"sap.ui.comp": {
				minVersion: "1.81",
				lazy: false
			}
		}
	});

	return Object.assign(EngineFlex, {
		"hideControl": "default",
		"unhideControl": "default",
		"moveTableColumns": MoveTableColumns,
		"addTableColumn": AddTableColumn
	});
});