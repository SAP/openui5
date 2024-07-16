// Note: the HTML page 'TableODataV4.html' loads this module via data-sap-ui-on-init

sap.ui.define([
	"sap/ui/table/plugins/V4Aggregation",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/model/json/JSONModel",
	"sap/ui/table/Table",
	"sap/m/OverflowToolbar",
	"sap/m/Title",
	"sap/m/ToggleButton",
	"sap/m/Select",
	"sap/ui/core/Item",
	"sap/m/ToolbarSpacer",
	"sap/m/Text",
	"sap/ui/table/Column",
	"sap/m/HBox",
	"sap/m/Toolbar",
	"sap/m/VBox",
	"sap/m/FlexItemData",
	"sap/m/Button"
], function(V4Aggregation, ODataModel, JSONModel, Table, OverflowToolbar, Title, ToggleButton, Select, Item, ToolbarSpacer, Text, Column, HBox, Toolbar, VBox, FlexItemData, Button) {
	"use strict";
	var oTable = new Table({
		extension: [
			new OverflowToolbar({
				content: [
					new Title({text: "Title of the Table ({headerContext>$count})"}),
					new ToggleButton({
						text: "V4 plugin active",
						pressed: true,
						press: function(oEvent) {
							var bPressed = oEvent.getParameter("pressed");
							if (window.V4Plugin) {
								if (bPressed) {
									window.V4Plugin.activate();
								} else {
									window.V4Plugin.deactivate();
								}
							}
						}
					}),
					new Select({
						items: [
							new Item({text: "No visual grouping", key: 0}),
							new Item({text: "Group country id", key: 1}),
							new Item({text: "Group country text", key: 2}),
							new Item({text: "Group country id and region", key: 3})
						],
						change: function(oEvent) {
							switch (oEvent.getParameters().selectedItem.getProperty("key")) {
								case "1":
									oAggregationInfo.groupLevels = ["Country"];
									break;
								case "2":
									oAggregationInfo.groupLevels = ["CountryText"];
									break;
								case "3":
									oAggregationInfo.groupLevels = ["Country", "Region"];
									break;
								default:
									oAggregationInfo.groupLevels = [];
							}

							window.V4Plugin.setAggregationInfo(oAggregationInfo);
						}
					}),
					new Select({
						items: [
							new Item({text: "No totals", key: 0}),
							new Item({text: "Grand total only", key: 1}),
							new Item({text: "Grand total and subtotals", key: 2})
						],
						change: function(oEvent) {
							switch (oEvent.getParameters().selectedItem.getProperty("key")) {
								case "1":
									oAggregationInfo.grandTotal = ["SalesAmountLocalCurrency", "SalesAmount"];
									oAggregationInfo.subtotals = [];
									break;

								case "2":
									oAggregationInfo.grandTotal = ["SalesAmountLocalCurrency", "SalesAmount"];
									oAggregationInfo.subtotals = ["SalesAmountLocalCurrency", "SalesAmount"];
									break;

								default:
									oAggregationInfo.grandTotal = [];
									oAggregationInfo.subtotals = [];
							}

							window.V4Plugin.setAggregationInfo(oAggregationInfo);
						}
					}),
					new ToolbarSpacer()
				]
			}),
			new OverflowToolbar({
				content: [
					new Text({text: "TopSum"}),
					new Select({
						items: {
							path: "settings>/totalSummaryOptions",
							template: new Item({
								text: {path: "settings>key"},
								key: {path: "settings>key"}
							})
						},
						selectedKey: "{settings>/totalSummaryOnTop}"
					}),
					new Text({text: "BottomSum"}),
					new Select({
						items: {
							path: "settings>/totalSummaryOptions",
							template: new Item({
								text: {path: "settings>key"},
								key: {path: "settings>key"}
							})
						},
						selectedKey: "{settings>/totalSummaryOnBottom}"
					}),
					new Text({text: "GroupSum"}),
					new Select({
						items: {
							path: "settings>/groupSummaryOptions",
							template: new Item({
								text: {path: "settings>key"},
								key: {path: "settings>key"}
							})
						},
						selectedKey: "{settings>/groupSummary}"
					})
				]
			})
		],
		rowMode: "Auto",
		models: {
			settings: new JSONModel({
				totalSummaryOnTop: V4Aggregation.getMetadata().getProperty("totalSummaryOnTop").getDefaultValue(),
				totalSummaryOnBottom: V4Aggregation.getMetadata().getProperty("totalSummaryOnBottom").getDefaultValue(),
				groupSummary: V4Aggregation.getMetadata().getProperty("groupSummary").getDefaultValue(),
				totalSummaryOptions: [{key: "On"}, {key: "Off"}, {key: "Fixed"}],
				groupSummaryOptions: [{key: "Top"}, {key: "Bottom"}, {key: "TopAndBottom"}, {key: "None"}]
			})
		}
	});
	window.oTable = oTable;

	/* The plugin currently only considers
  - groupable : boolean (default: false)
  - aggregatable : boolean (default: false)
  - aggregationDetails : {
	  grandtotal: boolean (default: true)
	  subtotals: boolean (default: true)

	  // V4 ODLB specific - just for testing.
	  // Each entry creates a menu item with the "alias" key as text. On item select, the corresponding object is
	  // added to "aggregate" (see ODataListBinding#setaggregation)
	  custom: {
		alias: {
		  key: string,
		  with: string,
		  grandTotal: boolean,
		  subtotals: boolean
		},
		otherAlias: {...},
		...
	  }
	}
*/

	oTable.addColumn(new Column({
		label: new Text({text: "Name"}),
		template: new Text({text: "{Name}", wrapping: false}),
		sortProperty: "Name",
		filterProperty: "Name",
		width: "120px"
	}).data("propertyInfo", {
		"Name": {
			groupable: true
		}
	}));

	oTable.addColumn(new Column({
		label: new Text({text: "Country"}),
		template: new Text({text: "{CountryText} ({Country})", wrapping: false}),
		width: "120px"
	}).data("propertyInfo", {
		"Country": {
			groupable: true
		}
	}));

	oTable.addColumn(new Column({
		label: new Text({text: "Region"}),
		template: new Text({
			text: {
				parts: [
					{path: "Region"},
					{path: "Country"}
				],
				formatter: function(sRegion, sCountry) {
					return sRegion + " (" + sCountry + ")";
				}
			},
			wrapping: false
		}),
		filterProperty: "Region",
		width: "180px"
	}).data("propertyInfo", {
		"Region": {
			groupable: true
		},
		"Country": {
			groupable: true
		}
	}));

	oTable.addColumn(new Column({
		label: new Text({text: "Sales Amount"}),
		template: new HBox({
			items: [
				new Text({text: "{SalesAmount}", wrapping: false})
				// TODO: Provide callback or event for app to adjust bindings, e.g. if different properties are needed for normal/group/summary rows?
				//new sap.m.Text({text: ", Min: {= %{SalesAmountMin} }", wrapping: false})
			]
		}),
		sortProperty: "SalesAmount",
		filterProperty: "SalesAmount",
		width: "150px"
	}).data("propertyInfo", {
		"SalesAmount": {
			aggregatable: true,
			aggregationDetails: {
				custom: {
					SalesAmountMin: {
						with: "min",
						key: "SalesAmount",
						subtotals: true
					}
				}
			}
		}
	}));

	oTable.addColumn(new Column({
		label: new Text({text: "Currency"}),
		template: new Text({text: "{Currency}", wrapping: false}),
		sortProperty: "Currency",
		filterProperty: "Currency",
		width: "80px"
	}).data("propertyInfo", {
		"Currency": {
			groupable: true
		}
	}));

	oTable.addColumn(new Column({
		label: new Text({text: "Sales Amount Local Currency (only subtotals)"}),
		template: new Text({text: "{SalesAmountLocalCurrency}", wrapping: false}),
		sortProperty: "SalesAmountLocalCurrency",
		filterProperty: "SalesAmountLocalCurrency",
		width: "120px"
	}).data("propertyInfo", {
		"SalesAmountLocalCurrency": {
			aggregatable: true,
			aggregationDetails: {
				grandtotal: false
			}
		}
	}));

	// The columns below provide insufficient information.
	// The plugin needs to know whether a property is aggregatable or groupable,
	// otherwise it doesn't know where to add the property in the object passed to
	// ODataListBinding#setAggregation (inside "group" or "aggregate", see V4Aggregation#updateAggregation)

	oTable.addColumn(new Column({
		label: new Text({text: "Local Currency"}),
		template: new Text({text: "{LocalCurrency}", wrapping: false}),
		width: "80px"
	}).data("propertyInfo", {
		"LocalCurrency": {}
	}));

	oTable.addColumn(new Column({
		label: new Text({text: "Industry"}),
		template: new Text({text: "{Industry}", wrapping: false}),
		width: "80px"
	}));

	oTable.bindRows({
		path: "/BusinessPartners",
		parameters: {
			$count: true
		}
	});

	function fnRegionFormatter(oContext, sPath) {
		return "Region/Land: " + oContext.getValue(sPath);
	}

	window.V4Plugin = new V4Aggregation({
		totalSummaryOnTop: "{settings>/totalSummaryOnTop}",
		totalSummaryOnBottom: "{settings>/totalSummaryOnBottom}",
		groupSummary: "{settings>/groupSummary}"
	});

	window.V4Plugin.setPropertyInfos([
		{
			key: "Id",
			path: "Id",
			isKey: true,
			groupable: true
		},
		{
			key: "Name",
			path: "Name",
			groupable: true
		},
		{
			key: "Country",
			path: "Country",
			label: "Country",
			text: "CountryText",
			groupable: true
		},
		{
			key: "CountryText",
			path: "CountryText",
			label: "Country Text",
			groupable: true
		},
		{
			key: "Region",
			path: "Region",
			groupable: true,
			groupingDetails: {
				formatter: fnRegionFormatter
			}
		},
		{
			key: "Segment",
			path: "Segment",
			groupable: true
		},
		{
			key: "Industry",
			path: "Industry",
			groupable: true
		},
		{
			key: "AccountResponsible",
			path: "AccountResponsible",
			groupable: true
		},
		{
			key: "SalesNumber",
			path: "SalesNumber",
			aggregatable: true,
			aggregationDetails: {
				customAggregate: {}
			}
		},
		{
			key: "SalesAmount",
			path: "SalesAmount",
			aggregatable: true,
			aggregationDetails: {
				customAggregate: {}
			}
		},
		{
			key: "SalesAmountLocalCurrency",
			path: "SalesAmountLocalCurrency",
			aggregatable: true,
			aggregationDetails: {
				customAggregate: {}
			}
		},
		{
			key: "AmountPerSale",
			path: "AmountPerSale",
			aggregatable: true,
			aggregationDetails: {
				customAggregate: {}
			}
		},
		{
			key: "Currency",
			path: "Currency",
			groupable: true
		},
		{
			key: "LocalCurrency",
			path: "LocalCurrency",
			groupable: true
		}
	]);

	var oAggregationInfo = {
		visible: ["Name", "Country", "CountryText", "Region", "Currency", "LocalCurrency", "SalesAmount", "SalesAmountLocalCurrency", "Industry"],
		subtotals: [],
		grandTotal: [],
		groupLevels: []
	};

	window.V4Plugin.setAggregationInfo(oAggregationInfo);

	// TODO: The "plugins" aggregation is currently of type sap.ui.table.plugins.SelectionPlugin
	oTable.addDependent(window.V4Plugin);

	TABLESETTINGS.addServiceSettings(oTable, "TableODataV4ServiceSettings", function(mServiceSettings) {
		oTable.setModel(new ODataModel({
			serviceUrl: mServiceSettings.defaultProxyUrl,
			operationMode: "Server",
			autoExpandSelect: false
		}));

		oTable.setModel(oTable.getModel(), "headerContext");
		oTable.getExtension()[0].setBindingContext(oTable.getBinding().getHeaderContext(), "headerContext");

		oTable.bindRows({
			path: "/BusinessPartners",
			parameters: {
				$count: false
			}
		});
	});

	TABLESETTINGS.init(oTable, function(oButton) {
		var oToolbar = oTable.getExtension()[0];

		if (!oToolbar) {
			oToolbar = new Toolbar();
			oTable.addExtension(oToolbar);
		}

		oToolbar.addContent(oButton);
	});

	oTable.getBindingInfo("rows");

	new VBox({
		width: "100%",
		items: [
			oTable.setLayoutData(new FlexItemData({growFactor: 1})),
			new Button({text: "Just a Button after"})
		]
	}).placeAt("content");
});