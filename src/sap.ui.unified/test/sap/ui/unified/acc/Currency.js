sap.ui.define([
	"sap/base/i18n/Formatting",
	"sap/m/App",
	"sap/m/Column",
	"sap/m/ColumnListItem",
	"sap/m/Label",
	"sap/m/library",
	"sap/m/Page",
	"sap/m/Table",
	"sap/m/Text",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/type/String",
	"sap/ui/unified/Currency",
	"sap/ui/core/library"
], function(Formatting, App, Column, ColumnListItem, Label, mobileLibrary, Page, Table, Text, VerticalLayout, JSONModel, TypeString, Currency, coreLibrary) {
	"use strict";

	// shortcut for sap.ui.core.TitleLevel
	const TitleLevel = coreLibrary.TitleLevel;

	const EmptyIndicatorMode = mobileLibrary.EmptyIndicatorMode;

	let oModel = new JSONModel({
		modelData: [
			{
				value: 3000.56,
				currency: 'JPY',
				useSymbol: true
			},
			{
				value: 3000.56,
				currency: 'JPY',
				useSymbol: false
			},
			{
				value: 33.5,
				currency: 'EUR',
				useSymbol: true
			},
			{
				currency: 'USD',
				useSymbol: true

			},
			{
				value: '*',
				currency: '*',
				useSymbol: true
			}
		]
	});

	Formatting.setCustomCurrencies({ "BGN4":{"digits": 4}, "Coins":{"digits": 5}});

	const oCurrencyWithSymbol = new VerticalLayout({
		content: {
			path: "/modelData",
			template: new Currency({
				value: {
					path: 'value',
					type: new TypeString()
				},
				currency: '{currency}',
				useSymbol: '{useSymbol}'
			})
		}
	}).setModel(oModel).placeAt("content").addStyleClass("sapUiSmallMarginBottom");

	oModel = new JSONModel({
		modelData: [
			{id: Math.random(), lastName: "Dente", currency: "EUR", useSymbol: true},
			{id: Math.random(), lastName: "Friese", money: -10.45, currency: "EUR", useSymbol: true},
			{id: Math.random(), lastName: "Mann", money: 1345.212, currency: "EUR", useSymbol: true},
			{id: Math.random(), lastName: "Schutt", money: 100.1, currency: "USD", useSymbol: true},
			{id: Math.random(), lastName: "Open", money: 55663.1, currency: "USD", useSymbol: true},
			{id: Math.random(), lastName: "Dewit", money: 34.23, currency: "EUR", useSymbol: true},
			{id: Math.random(), lastName: "Zar", money: 123, currency: "EUR", useSymbol: true},
			{id: Math.random(), lastName: "Burr", money: 678.45, currency: "DEM", type: "Inactive", useSymbol: false},
			{id: Math.random(), lastName: "Hughes", money: 123.45, currency: "EUR", type: "Inactive", useSymbol: false},
			{id: Math.random(), lastName: "Town", money: 678.90, currency: "JPY", type: "Inactive", useSymbol: false},
			{id: Math.random(), lastName: "Case", money: 8756.2, currency: "EUR", type: "Inactive", useSymbol: false},
			{id: Math.random(), lastName: "Time", money: -836.4, currency: "EUR", type: "Inactive", useSymbol: false},
			{id: Math.random(), lastName: "Barr", money: 9.3, currency: "USD", type: "Inactive", useSymbol: false},
			{id: Math.random(), lastName: "Poole", money: 6344.21, currency: "EUR", type: "Inactive", useSymbol: false},
			{id: Math.random(), lastName: "Ander", money: 563.2, currency: "JPY", type: "Inactive", useSymbol: false},
			{id: Math.random(), lastName: "Early", money: 8564.4, currency: "EUR", type: "Inactive", useSymbol: false},
			{id: Math.random(), lastName: "Dewit", money: 34.23, currency: "EUR", type: "Inactive", useSymbol: false},
			{id: Math.random(), lastName: "Turner", money: 5.67, currency: "שקל‎‎", type: "Inactive", useSymbol: false},
			{id: Math.random(), lastName: "Piers", money: 51.6745, currency: "BGN4", type: "Inactive", useSymbol: false},
			{id: Math.random(), lastName: "Angels", money: 542.678912, currency: "Coins", type: "Inactive", useSymbol: false}
		]
	});

	const oTable = new Table({
		columns : [
			new Column({
				header : new Label({
					text : "LastName"
				})
			}),
			new Column({
				hAlign: "Right",
				header : new Label({
					text : "Loan"
				}),
				minScreenWidth : "Desktop",
				popinDisplay : "Inline",
				demandPopin : true
			})
		]
	});

	const oTemplateTbl = new ColumnListItem({
		vAlign: "Middle",
		cells : [
			new Text({
				text : "{lastName}",
				wrapping : false
			}),
			new Currency({
				value : "{money}",
				currency : "{currency}",
				useSymbol : "{useSymbol}",
				emptyIndicatorMode: EmptyIndicatorMode.On
			})
		]
	});
	oTable.setModel(oModel);
	oTable.bindItems({
		path: "/modelData",
		template : oTemplateTbl,
		key: "id"
	});

	const oPage = new Page({
		title: "Currency Accessibility Test page",
		titleLevel: TitleLevel.H1,
		enableScrolling : true,
		content : [oCurrencyWithSymbol, oTable]
	}).addStyleClass("sapUiContentPadding");
	const oApp = new App();
	oApp.addPage(oPage).placeAt("content");
});
