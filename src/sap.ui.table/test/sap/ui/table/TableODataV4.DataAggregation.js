// Note: the HTML page 'TableODataV4.DataAggregation.html' loads this module via data-sap-ui-on-init

sap.ui.define([
	"sap/ui/table/Table",
	"sap/ui/table/Column",
	"sap/ui/table/rowmodes/Fixed",
	"sap/ui/table/plugins/V4Aggregation",
	"sap/ui/table/plugins/ODataV4Selection",
	"sap/m/OverflowToolbar",
	"sap/m/Title",
	"sap/m/Text",
	"sap/m/MessageBox",
	"sap/ui/model/odata/type/Currency",
	"sap/ui/table/qunit/TableQUnitUtils.ODataV4"
], function(
	Table,
	Column,
	FixedRowMode,
	V4Aggregation,
	ODataV4Selection,
	OverflowToolbar,
	Title,
	Text,
	MessageBox,
	CurrencyType,
	TableQUnitUtils
) {
	"use strict";
	const mTableSettingsForDataAggregation = TableQUnitUtils.createSettingsForDataAggregation();

	mTableSettingsForDataAggregation.rows.events = {
		dataReceived: function(oEvent) {
			const sErrorMessage = oEvent.getParameter("error")?.message;

			if (sErrorMessage) {
				MessageBox.show(sErrorMessage, {
					icon: MessageBox.Icon.ERROR,
					actions: [MessageBox.Action.OK]
				});
			}
		}
	};

	const oTable = new Table({
		...mTableSettingsForDataAggregation,
		columns: mTableSettingsForDataAggregation.columns.concat([
			new Column({
				label: new Title({text: "Segment"}),
				template: new Text({text: "{Segment}"})
			}),
			new Column({
				label: new Title({text: "Sales Amount (local currency)"}),
				template: new Text({
					text: {
						parts: [
							{path: 'SalesAmountLocalCurrency'},
							{path: 'LocalCurrency'},
							{path: '/##@@requestCurrencyCodes', mode: 'OneTime', targetType: 'any'}
						],
						type: new CurrencyType()
					}
				})
			}),
			new Column({
				label: new Title({text: "Sales Number"}),
				template: new Text({text: "{SalesNumber}"})
			}),
			new Column({
				label: new Title({text: "Account Responsible"}),
				template: new Text({text: "{AccountResponsible}"})
			})
		]),
		extension: [
			new OverflowToolbar({
				content: [
					new Title({text: "Products"})
				]
			})
		],
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
	oTable.placeAt("content");
});