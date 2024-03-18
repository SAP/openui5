sap.ui.define([
	"sap/m/App",
	"sap/m/Page",
	"sap/m/Text",
	"sap/ui/model/json/JSONModel",
	"sap/tnt/InfoLabel",
	"sap/m/Table",
	"sap/m/ColumnListItem",
	"sap/m/Column",
	"sap/m/Label",
	"sap/m/Button",
	"sap/ui/layout/form/SimpleForm",
	"sap/m/VBox",
	"sap/m/Input"
], function (
	App,
	Page,
	Text,
	JSONModel,
	InfoLabel,
	Table,
	ColumnListItem,
	Column,
	Label,
	Button,
	SimpleForm,
	VBox,
	Input
) {
	"use strict";
		var oData = {
			infoLabels: [
				{ text: "DEFAULT COLOR SCHEME" },
				{ text: "Color scheme 1", colorScheme: 1 },
				{ text: "Color scheme 2", colorScheme: 2 },
				{ text: "Color scheme 3", colorScheme: 3 },
				{ text: "Color scheme 4", colorScheme: 4 },
				{ text: "Color scheme 5", colorScheme: 5 },
				{ text: "Color scheme 6", colorScheme: 6 },
				{ text: "Color scheme 7", colorScheme: 7 },
				{ text: "Color scheme 8", colorScheme: 8 },
				{ text: "Color scheme 9", colorScheme: 9 },
				{ text: "Color scheme 10", colorScheme: 10 },
				{ text: "width is not set - truncate when text is too long", colorScheme: 5 },
				{ text: "width: 70%", colorScheme: 6, width: "70%" },
				{ text: "width: 30%", colorScheme: 7, width: "30%" },
				{ text: "width: 170px", colorScheme: 8, width: "170px" },
				{ text: "displayOnly: true", colorScheme: 9, displayOnly: true },
				{ text: "displayOnly: true, long long long text", colorScheme: 1, displayOnly: true },
				{ text: "displayOnly: true", colorScheme: 2, displayOnly: true, width:"40%" },
				{ text: "9:8", renderMode: "Narrow", colorScheme: 1 },
				{ text: "42k", renderMode: "Narrow", colorScheme: 2 },
				{ text: "100%", colorScheme: 3, renderMode: "Narrow" },
				{ text: "3.141592653589793238462643383279502884197169399375105820974944592307816406286", colorScheme: 4, renderMode: "Narrow", width: "50%" },
				{ text: "3.141592653589793238462643383279502884197169399375105820974944592307816406286", colorScheme: 5, renderMode: "Narrow" },
				{ text: "3.1415926535", colorScheme: 6, renderMode: "Narrow", width: "170px" },
				{ colorScheme: 7 }
			],
			infoLabelsWithIcons: [
				{ text: "color scheme 1", colorScheme: 1, icon: "sap-icon://cause"},
				{ text: "color scheme 2", colorScheme: 2, icon: "sap-icon://add"},
				{ text: "color scheme 3", colorScheme: 3, icon: ""},
				{ text: "color scheme 4", colorScheme: 4, icon: "sap-icon://bubble-chart" },
				{ text: "color scheme 5", colorScheme: 5, icon: "sap-icon://future" },
				{ text: "color scheme 6", colorScheme: 6, icon: "sap-icon://upload-to-cloud" },
				{ text: "color scheme 7", colorScheme: 7, icon: "sap-icon://hide" },
				{ text: "color scheme 8", colorScheme: 8, icon: "sap-icon://key" },
				{ colorScheme: 9, icon: "sap-icon://primary-key" },
				{ colorScheme: 10, icon: "sap-icon://past" }
			]
		};

		var oModel = new JSONModel();
		oModel.setData(oData);



	var oInfoLabelTemplate = new InfoLabel({
			text: "{text}",
			icon: "{icon}",
			colorScheme: "{colorScheme}",
			renderMode: "{renderMode}",
			width: "{width}",
			displayOnly: "{displayOnly}"
		});

		var aColumns = [
			new Column({
				header: new Label({
					text: "LastName"
				})
			}),
			new Column({
				header: new Label({
					text: "FirstName"
				})
			}),
			new Column({
				hAlign: "Center",
				header: new Label({
					text: "Availability"
				})
			})
		];
		var Table1 = new Table({
			id: "tbl1",
			columns: aColumns,
			items: [
				new ColumnListItem({
					cells: [
						new Text({
							text: "Tompson",
							width: "100%"
						}),
						new Label({
							text: "Tom",
							width: "100%"
						}),
						new InfoLabel({
							text: "at the office",
							colorScheme: 8
						})
					]
				}),
				new ColumnListItem({
					cells: [
						new Text({
							text: "Johnson",
							width: "100%"
						}),
						new Label({
							text: "Joe",
							width: "100%"
						}),
						new InfoLabel({
							text: "home office",
							colorScheme: 2
						})
					]
				}),
				new ColumnListItem({
					cells: [
						new Text({
							text: "Doe",
							width: "100%"
						}),
						new Label({
							text: "John",
							width: "100%"
						}),
						new InfoLabel({
							colorScheme: 5,
							icon: "sap-icon://upload-to-cloud"
						})
					]
				}),
				new ColumnListItem({
					cells: [
						new Text({
							text: "Doe",
							width: "100%"
						}),
						new Label({
							text: "John",
							width: "100%"
						}),
						new InfoLabel({
							text: "home office",
							colorScheme: 2,
							icon: "sap-icon://upload-to-cloud"
						})
					]
				})
			]
		});
		var initialPage = new Page("infoLabelPage", {
			title: "InfoLabel Control Test Page",
			headerContent: new Button({text: "focus trap"}),
			content: [
				Table1,
				new SimpleForm("form1", {
					layout: "ResponsiveGridLayout",
					editable: true,
					title: "InfoLabel in SimpleForm",
					content: [
						new Label({ text: "First name" }),
						new Input(),
						new Label({ text: "Last name" }),
						new Input(),
						new Label({ text: "Availability" }),
						new InfoLabel({ text: "On vacation" }),
						new Label({ text: "Status" }),
						new InfoLabel(),
						new Label({ text: "Icon" }),
						new InfoLabel({text: "Some text", icon: "sap-icon://add"}),
						new InfoLabel({icon: "sap-icon://add"})
					]
				}),
				new SimpleForm("form2", {
					layout: "ResponsiveGridLayout",
					editable: false,
					title: "InfoLabel - displayOnly: TRUE in SimpleForm - editable: FALSE",
					content: [
						new Label({ text: "First name" }),
						new Text({ text: "Tom"}),
						new Label({ text: "Last name" }),
						new Text({ text: "Tompson"}),
						new Label({ text: "Availability" }),
						new InfoLabel({ text: "at the office", displayOnly: true }),
						new Label({ text: "Status" }),
						new InfoLabel({ displayOnly: true }),
						new Label({ text: "Icon" }),
						new InfoLabel({text: "some text", icon: "sap-icon://hide",  displayOnly: true}),
						new InfoLabel({icon: "sap-icon://hide",  displayOnly: true})
					]
				}),
				new VBox("vb1", {
					items: {
						path: "/infoLabels",
						template: oInfoLabelTemplate
					},
					width: "200px"
				}).addStyleClass("vBoxBorder"),
				new VBox("vb2", {
					items: {
						path: "/infoLabelsWithIcons",
						template: oInfoLabelTemplate
					},
					width: "200px"
				}).addStyleClass("vBoxBorder")
			]
		});

		var app = new App("myApp", { initialPage: "infoLabelPage" });
		app.setModel(oModel);
		app.placeAt("body");
		app.addPage(initialPage);


	});

