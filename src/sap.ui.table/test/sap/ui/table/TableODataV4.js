// Note: the HTML page 'TableODataV4.html' loads this module via data-sap-ui-on-init

sap.ui.define([
	"sap/ui/table/Table",
	"sap/ui/table/Column",
	"sap/ui/table/plugins/ODataV4Selection",
	"sap/m/OverflowToolbar",
	"sap/m/Title",
	"sap/m/ToggleButton",
	"sap/m/Text",
	"sap/ui/table/qunit/TableQUnitUtils.ODataV4"
], function(
	Table,
	Column,
	ODataV4Selection,
	OverflowToolbar,
	Title,
	ToggleButton,
	Text,
	TableQUnitUtils
) {
	"use strict";
	const oTable = new Table({
		...TableQUnitUtils.createSettingsForList(),
		extension: [
			new OverflowToolbar({
				content: [
					new Title({text: "Products (count: {headerContext>$count})"})
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
	window.oTable = oTable;

	oTable.setModel(oTable.getModel(), "headerContext");
	oTable.setBindingContext(oTable.getBinding().getHeaderContext(), "headerContext");

	TABLESETTINGS.init(oTable, function(oButton) {
		let oToolbar = oTable.getExtension()[0];

		if (!oToolbar) {
			oToolbar = new OverflowToolbar();
			oTable.addExtension(oToolbar);
		}

		oToolbar.addContent(oButton);
	});

	oTable.placeAt("content");
});