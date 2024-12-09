sap.ui.define([
	"sap/m/App",
	"sap/m/DynamicDateRange",
	"sap/m/DynamicDate",
	"sap/m/Label",
	"sap/m/Page",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/library"
], function(App, DynamicDateRange, DynamicDate, Label, Page, VerticalLayout, JSONModel, coreLibrary) {
	"use strict";

	// shortcut for sap.ui.core.TitleLevel
	var TitleLevel = coreLibrary.TitleLevel;

	function handleValueChange(oEvent) {
		var oDDR = oEvent.getSource();

		if (oEvent.getParameter("valid")) {
			oDDR.setValueState("None");
			oDDR.setValueStateText("");
		} else {
			oDDR.setValueState("Error");
			oDDR.setValueStateText("Parse error!");
		}
	}

	var oPageLayout = new VerticalLayout({
		content: [
			new Label({
				text: "Choose a date",
				labelFor: "DDR1",
				wrapping: true
			}),
			new DynamicDateRange("DDR1", {
				standardOptions: ["DATE", "TODAY", "LASTDAYS", "LASTQUARTERS", "LASTWEEKSINCLUDED", "LASTWEEKS", "LASTMONTHSINCLUDED", "TODAYFROMTO"],
				value: {
					path: '/val1',
					type: new DynamicDate()
				},
				change: handleValueChange
			}),
			new Label({
				text: "Choose a date",
				labelFor: "DDR2",
				wrapping: true
			}),
			new DynamicDateRange("DDR2",{
				standardOptions: ["DATE", "TODAY", "LASTDAYS","DATETOYEAR", "LASTQUARTERS", "TODAYFROMTO", "SPECIFICMONTH", "SPECIFICMONTHINYEAR","FIRSTDAYWEEK",
					"LASTDAYWEEK", "FIRSTDAYMONTH", "LASTDAYMONTH", "FIRSTDAYQUARTER", "LASTDAYQUARTER", "FIRSTDAYYEAR","LASTDAYYEAR"
					],
				value: {
					path: '/val2',
					type: new DynamicDate({
						date: {
							style: "short"
						},
						month: {
							pattern: "MMM"
						},
						"int": {
							minIntegerDigits: 2
						}
					})
				},
				change: handleValueChange
			}),
			new Label({
				text: "Choose a date",
				labelFor: "DDR3",
				wrapping: true
			}),
			new DynamicDateRange("DDR3", {
				enableGroupHeaders: false,
				change: handleValueChange
			})
		]
	}).addStyleClass("sapUiContentPadding");

	var oModel = new JSONModel({
		val1: {
			operator: "DATE",
			values: [1602277200000]
		},
		val2: {
			operator: "DATE",
			values: [1602277200000]
		}
	});

	var oApp = new App();
	var oPage = new Page({
		title: "DynamicDateRange Accessibility Test Page",
		titleLevel: TitleLevel.H1,
		content: [ oPageLayout ]
	});

	oApp.setModel(oModel);
	oApp.addPage(oPage);
	oApp.placeAt("body");
});
