// Note: the HTML page 'AnalyticalTable.html' loads this module via data-sap-ui-on-init

sap.ui.define([
	"sap/ui/core/message/MessageType",
	"sap/m/Button",
	"sap/ui/table/AnalyticalTable",
	"sap/ui/table/library",
	"sap/ui/table/AnalyticalColumn",
	"sap/ui/unified/Currency",
	"sap/ui/model/type/String",
	"sap/m/Label",
	"sap/m/Text",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/table/RowSettings"
], function(MessageType, Button, AnalyticalTable, tableLibrary, AnalyticalColumn, Currency, TypeString, Label, Text, ODataModel, RowSettings) {
	"use strict";

	// shortcut for sap.ui.table.SelectionMode
	const SelectionMode = tableLibrary.SelectionMode;

	(new Button({
		text: "Just a Button before"
	})).placeAt("content");

	var oTable = new AnalyticalTable({
		title: "Title of the Table",
		footer: "Footer of the Table",
		selectionMode: SelectionMode.MultiToggle
	});
	oTable.placeAt("content");
	(new Button({text: "Just a Button after"})).placeAt("content");

	TABLESETTINGS.addServiceSettings(oTable, "AnalyticalTableServiceSettings", updateModel)

	// create columns
	var aColumns = ["CostCenter", "CostCenterText", "CostElement", "CostElementText", "ActualCosts", "Currency", "PlannedCosts", "ValueType", "CurrencyType"];

	for (var i = 0; i < aColumns.length; i++) {
		oTable.addColumn(new AnalyticalColumn({
			label: aColumns[i],
			template: getTemplate(aColumns[i]),
			sortProperty: aColumns[i],
			filterProperty: aColumns[i],
			leadingProperty: aColumns[i],
			width: "200px",
			summed: aColumns[i] === "PlannedCosts"
		}));
	}

	function getTemplate(sField) {
		switch (sField) {
			case "PlannedCosts":
				return new Currency({value: {path: sField, type: new TypeString()}});
			case "Currency":
				//return new sap.m.Text({text: "{" + sField + "}", wrapping: false});
				//return new sap.m.Link({text: "{" + sField + "}"});
				return new Label({text: "{" + sField + "}"});
			default:
				return new Text({text: "{" + sField + "}", wrapping: false});
		}
	}

	// set Model and bind Table

	var oModel;
	var bProvideGrandTotals = true;
	var bSumOnTop = false;

	function updateModel(mServiceSettings) {
		oModel = new ODataModel(mServiceSettings.defaultProxyUrl, true);
		oModel.setDefaultCountMode("Inline");
		oTable.setModel(oModel);
		oTable.bindRows({
			path: "/" + mServiceSettings.collection,
			parameters: {
				provideGrandTotals: bProvideGrandTotals,
				sumOnTop: bSumOnTop
			}
		});
	}

	TABLESETTINGS.init(oTable, function(oButton) {
		oTable.getExtension()[0].addContent(oButton);
	}, {
		GROUPING: {
			hidden: true
		},
		ANALYTICSETTINGS: {
			text: "Analytical Settings",
			group: {
				GRANDTOTALS: {
					text: "Grand Totals",
					value: function() {
						return !!bProvideGrandTotals;
					},
					input: "boolean",
					action: function(oTable, bValue) {
						bProvideGrandTotals = bValue;
						updateModel();
					}
				},
				SUMONTOP: {
					text: "Sum On Top",
					value: function() {
						return !!bSumOnTop;
					},
					input: "boolean",
					action: function(oTable, bValue) {
						bSumOnTop = bValue;
						updateModel();
					}
				}
			}
		},
		AREAS: {
			group: {
				FIXEDROWS: {
					disabled: true
				},
				FIXEDBOTTOMROWS: {
					disabled: true
				},
				NODATA: {
					setData: function(oTable, bClear) {
						if (bClear) {
							oTable.unbindRows();
						} else {
							updateModel();
						}
					}
				}
			}
		},
		ROWSETTINGS: {
			group: {
				HIGHLIGHTS: {
					action: function(oTable, bValue) {
						if (bValue) {
							oTable.setRowSettingsTemplate(new RowSettings({
								highlight: MessageType.Success
							}));
						} else {
							oTable.setRowSettingsTemplate(new RowSettings({
								highlight: MessageType.None
							}));
						}
					}
				}
			}
		},
		CONTEXTMENU: {
			disabled: true
		}
	});
});