// Note: the HTML page 'index.html' loads this module via data-sap-ui-on-init

sap.ui.define([
	"controlEnablementReport/LibraryScanner",
	"sap/ui/core/Core",
	"sap/ui/core/Element",
	"sap/ui/VersionInfo",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Item",
	"sap/m/MultiComboBox",
	"sap/ui/comp/filterbar/FilterBar",
	"sap/ui/comp/filterbar/FilterItem",
	"sap/m/Toolbar",
	"sap/m/Button",
	"sap/ui/table/Table",
	"sap/ui/table/Column",
	"sap/m/Text",
	"sap/ui/layout/VerticalLayout"
], function(LibraryScanner, Core, Element, VersionInfo, JSONModel, Item, MultiComboBox, FilterBar, FilterItem, Toolbar, Button, Table, Column, Text, VerticalLayout) {
	"use strict";
	Core.ready().then(async () => {
		const oVersionInfo = await VersionInfo.load();
		var aLibs = oVersionInfo.libraries.filter(function(sLib) {
			if (
				sLib.name.indexOf("sap.ui.server") === -1 &&
				sLib.name.indexOf("themelib_") === -1 &&
				sLib.name !== "sap.ui.core" &&
				sLib.name !== "sap.ui.fl"
			) {
				return sLib;
			}
		});

		var oJSONModel = new JSONModel({
			libs: aLibs
		});

		var oTemplateItem = new Item({
			key : "{name}",
			text : "{name}"
		});

		var oMultiComboBox = new MultiComboBox("combobox", {
			items : {
				path : "/libs",
				sorter : { path : "Name" },
				template : oTemplateItem
			}
		}).setModel(oJSONModel);

		var oFilterBar = new FilterBar("filterbar", {
			showFilterConfiguration : false,
			showClearButton : true,
			showClearOnFB : true,
			filterBarExpanded : false,
			filterItems : [
				new FilterItem("fbItem", {
					name : "Search",
					label : "Libraries",
					control : oMultiComboBox
				})
			],
			search : function(oEvent) {
				var oStaticReport;
				var oReport;
				var aLibraries = oMultiComboBox.getSelectedKeys();

				oStaticReport = Element.getElementById("statistic");
				if (oStaticReport) {
					oStaticReport.destroy();
				}
				oReport = Element.getElementById("table");
				if (oReport) {
					oReport.destroy();
				}

				var oLibraryEnablementTest2 = new LibraryScanner();

				oLibraryEnablementTest2.run(aLibraries).then(function(oData) {
					var oModel;
					if (oData) {
						oModel = new JSONModel(oData);
					} else {
						oModel = null;
					}

					var fnExportToExcel = function(oEvent) {
						var oExport = new undefined/*Export*/({
							exportType : new undefined/*ExportTypeCSV*/({
								separatorChar : ";"
							}),
							models : oModel,
							rows : {
								path : "/results"
							},
							columns : [
								{
									name : "Name",
									template : {
										content : "{name}"
									}
								},
								{
									name : "Actions",
									template : {
										content : "{actions}"
									}
								}
							]
						});

						oExport.saveFile().catch(function(oError) {
							MessageBox.error("Error when downloading data. Browser might not be supported!\n\n" + oError);
						}).then(function() {
							oExport.destroy();
						});
					};

					var oHeaderToolbar = new Toolbar("toolbar", {
						content : [
							// new sap.m.ToolbarSpacer("toolbar-spacer"),
							new Button("toolbar-export-button", {
								text : "Export to Excel",
								press : fnExportToExcel
							})
						]
					});
					var oReport = new Table("table", {
						extension : [oHeaderToolbar],
						columns : [
							new Column("table-column-name", {
								label : "Name",
								width : "30em",
								sorted : true,
								template : new Text({
									text : "{name}"
								})
							}),
							new Column("table-column-actions", {
								label : "Actions",
								template : new Text({
									text : "{actions}"
								})
							})
						],
						rows : "{path:'/results'}"
					}).setModel(oModel);
					oReport.placeAt("content");
				});
			},
			clear : function(oEvent) {
				oMultiComboBox.clearSelection();
			}
		});

		var oVLayout = new VerticalLayout("layout", {
			width: "100%",
			content : [oFilterBar]
		});

		oVLayout.placeAt("selection");
	});
});