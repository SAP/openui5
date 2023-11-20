sap.ui.define([
	"./DynamicPageUtility",
	"sap/m/App",
	"sap/m/Button",
	"sap/m/Column",
	"sap/m/ColumnListItem",
	"sap/m/IconTabBar",
	"sap/m/IconTabFilter",
	"sap/m/IconTabSeparator",
	"sap/m/ObjectStatus",
	"sap/m/Page",
	"sap/m/Table",
	"sap/m/Text",
	"sap/ui/core/format/NumberFormat",
	"sap/ui/core/library",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/json/JSONModel"
], function(oDynamicPageUtil, App, Button, Column, ColumnListItem, IconTabBar, IconTabFilter, IconTabSeparator, ObjectStatus, Page, Table, Text, NumberFormat, coreLibrary, Filter, FilterOperator, JSONModel) {
	"use strict";

	var IconColor = coreLibrary.IconColor;

	var oFloat = NumberFormat.getFloatInstance({minFractionDigits: 2, maxFractionDigits: 2});

	var oModel = new JSONModel({
		items: [
			{id: 5163, name: "Lorem Ipsum", amount: 1, price: 23.45, status: "Open"},
			{id: 6342, name: "Dolor Sit Amet", amount: 1, price: 233.22, status: "In Process"},
			{id: 1634, name: "Consectetur Adipisicing", amount: 1, price: 23.45, status: "Shipped"},
			{id: 7856, name: "Elit Sed Do", amount: 3, price: 23.45, status: "Shipped"},
			{id: 7245, name: "Eiusmod Tempor", amount: 1, price: 23.45, status: "Shipped"},
			{id: 8342, name: "Incididunt Ut", amount: 1, price: 23.45, status: "Open"},
			{id: 3462, name: "Labore Et Dolore", amount: 1, price: 23.45, status: "In Process"},
			{id: 4572, name: "Magna Aliqua", amount: 5, price: 23.45, status: "Open"}
		]
	});
	sap.ui.getCore().setModel(oModel);

	var aTabItems = [];
	for (var i = 1; i <= 30; i++) {
		aTabItems.push(new IconTabFilter({
			text: 'Tab ' + i,
			content: new Text({
				text: 'Content ' + i
			})
		}));
	}

	var fnToggleFooter = function () {
		oPage.setShowFooter(!oPage.getShowFooter());
	};

	var oToggleFooterButton = new Button({
		text: "Toggle footer",
		press: fnToggleFooter
	});

	var oTitle = oDynamicPageUtil.getTitle(oToggleFooterButton);
	var oHeader = oDynamicPageUtil.getHeader();
	var oFooter = oDynamicPageUtil.getFooter();
	var oContent = new IconTabBar("itb1", {
		expandable: false,
		items: [
			new IconTabFilter({
				showAll: true,
				count: "8",
				text: "Orders Productive",
				key: "All",
				iconColor: IconColor.Neutral
			}),
			new IconTabSeparator(),
			new IconTabFilter({
				icon: "sap-icon://task",
				iconColor: IconColor.Critical,
				count: "3",
				text: "Open",
				key: "Open"
			}),
			new IconTabFilter("itf1", {
				icon: "sap-icon://instance",
				iconColor: IconColor.Negative,
				count: "2",
				text: "In Process",
				key: "In Process"
			}),
			new IconTabFilter({
				icon: "sap-icon://shipping-status",
				iconColor: IconColor.Positive,
				count: "3",
				text: "Shipped",
				key: "Shipped"
			})
		],
		select: function (oEvent) {
			var oBinding = this.getContent()[0].getBinding("items"),
				sKey = oEvent.getParameter("key"),
				oFilter;
			if (sKey == "All") {
				oBinding.filter([]);
			} else {
				oFilter = new Filter("status", FilterOperator.EQ, sKey);
				oBinding.filter([oFilter]);
			}
		},
		content: new Table("list", {
			growing: true,
			growingThreshold: 200,
			columns: [
				new Column({
					width: "2em",
					header: oDynamicPageUtil.getLabel("ID")
				}),
				new Column({
					width: "7em",
					header: oDynamicPageUtil.getLabel("Name")
				}),
				new Column({
					width: "3em",
					header: oDynamicPageUtil.getLabel("Status")
				}),
				new Column({
					width: "2em",
					minScreenWidth: "Tablet",
					hAlign: "Right",
					header: oDynamicPageUtil.getLabel("Amount")
				}),
				new Column({
					width: "3em",
					hAlign: "Right",
					minScreenWidth: "Tablet",
					header: oDynamicPageUtil.getLabel("Price")
				})
			],
			items: {
				path: "/items",
				template: new ColumnListItem({
					cells: [
						new Text({text: "{id}"}),
						new Text({text: "{name}"}),
						new ObjectStatus({
							text: "{status}",
							state: {
								path: "status",
								formatter: function (value) {
									switch (value) {
										case "Open":
											return "Warning";
										case "In Process":
											return "Error";
										case "Shipped":
											return "Success";
									}
								}
							}
						}),
						new Text({text: "{amount}"}),
						new Text({
							text: {
								path: "price",
								formatter: function (value) {
									if (value !== undefined) {
										return "$ " + oFloat.format(value);
									}
								}
							}
						})
					]
				})
			}
		})
	});

	var oPage = oDynamicPageUtil.getDynamicPage(true, oTitle, oHeader, oContent, oFooter).addStyleClass("sapUiNoContentPadding");

	var oApp = new App();
	oApp.addPage(oPage).placeAt("body");
});
