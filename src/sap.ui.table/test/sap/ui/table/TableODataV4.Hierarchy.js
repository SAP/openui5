// Note: the HTML page 'TableODataV4.Hierarchy.html' loads this module via data-sap-ui-on-init

sap.ui.define([
	"sap/ui/table/Table",
	"sap/ui/table/plugins/ODataV4Hierarchy",
	"sap/ui/table/plugins/ODataV4MultiSelection",
	"sap/m/OverflowToolbar",
	"sap/m/Title",
	"sap/ui/table/qunit/TableQUnitUtils.ODataV4"
], function(
	Table,
	ODataV4Hierarchy,
	ODataV4MultiSelection,
	OverflowToolbar,
	Title,
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
			new ODataV4Hierarchy(),
			new ODataV4MultiSelection({enableNotification: true})
		]
	});
	oTable.getColumns().forEach((oColumn) => {oColumn.setWidth();});
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
	oTable.placeAt("content");
});