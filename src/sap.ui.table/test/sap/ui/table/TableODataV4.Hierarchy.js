// Note: the HTML page 'TableODataV4.Hierarchy.html' loads this module via data-sap-ui-on-init

sap.ui.define([
	"sap/ui/table/Table",
	"sap/ui/table/TreeTable",
	"sap/ui/table/Column",
	"sap/ui/table/plugins/V4Aggregation",
	"sap/ui/table/plugins/ODataV4Selection",
	"sap/m/OverflowToolbar",
	"sap/m/Title",
	"sap/m/ToggleButton",
	"sap/m/Text",
	"sap/m/HBox",
	"sap/ui/table/qunit/TableQUnitUtils.ODataV4"
], function(
	Table,
	TreeTable,
	Column,
	V4Aggregation,
	ODataV4Selection,
	OverflowToolbar,
	Title,
	ToggleButton,
	Text,
	HBox,
	TableQUnitUtils
) {
	"use strict";
	const oTable = new Table({
		...TableQUnitUtils.createSettingsForHierarchy(),
		extension: [
			new OverflowToolbar({
				content: [
					new Title({text: "Products"})
				]
			})
		],
		rowMode: "Auto",
		enableBusyIndicator: true,
		busyIndicatorDelay: 0,
		dependents: [
			new V4Aggregation(),
			new ODataV4Selection({enableNotification: true})
		]
	});
	window.oTable = oTable;

	TABLESETTINGS.init(oTable, function(oButton) {
		let oToolbar = oTable.getExtension()[0];

		if (!oToolbar) {
			oToolbar = new OverflowToolbar();
			oTable.addExtension(oToolbar);
		}

		oToolbar.addContent(oButton);
	});

	oTable.getBinding().resume();
	//oTable.placeAt("content");

	const oTreeTable = new TreeTable({
		...TableQUnitUtils.createSettingsForHierarchy(),
		extension: [
			new OverflowToolbar({
				content: [
					new Title({text: "Products (TreeTable)"})
				]
			})
		],
		rowMode: "Auto",
		enableBusyIndicator: true,
		busyIndicatorDelay: 0,
		dependents: [
			new ODataV4Selection({enableNotification: true})
		]
	});
	window.oTreeTable = oTreeTable;

	oTreeTable._oProxy._bEnableV4 = true;
	oTreeTable.getBinding().resume();

	new HBox({
		items: [
			oTable,
			oTreeTable
		],
		height: "100%",
		gap: "1rem"
	}).placeAt("content");
});