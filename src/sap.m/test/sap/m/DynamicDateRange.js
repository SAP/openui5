sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/core/Messaging",
	"sap/m/DynamicDate",
	"sap/m/Label",
	"sap/m/DynamicDateRange",
	"sap/m/App",
	"sap/m/Page",
	"sap/m/TextArea",
	"sap/ui/Device",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/date/UI5Date",
	"sap/ui/core/library"
], function(
	Element,
	Messaging,
	DynamicDate,
	Label,
	DynamicDateRange,
	App,
	Page,
	TextArea,
	Device,
	JSONModel,
	UI5Date,
	coreLibrary
) {
	"use strict";

	var TitleLevel = coreLibrary.TitleLevel;

	function handleValueChange(oEvent) {
		var sDDRValue = JSON.stringify(oEvent.getParameter("value"), null, 2);
		var oTextArea = Element.getElementById("txt1");
		var oDDR = oEvent.getSource();

		oTextArea.setValue(sDDRValue + "\n" + oTextArea.getValue());

		if (oEvent.getParameter("valid")) {
			oDDR.setValueState("None");
			oDDR.setValueStateText("");
		} else {
			oDDR.setValueState("Error");
			oDDR.setValueStateText("Parse error!");
		}
	}

	var oToday = UI5Date.getInstance();
	var oBefore5Days = UI5Date.getInstance(oToday.getFullYear(), oToday.getMonth(), oToday.getDate() - 5);
	var oAfter5Days = UI5Date.getInstance(oToday.getFullYear(), oToday.getMonth(), oToday.getDate() + 6);

	var oDDR1 = new DynamicDateRange({
			value: {
				path: '/val1',
				type: new DynamicDate(null, {
					"minimum": oBefore5Days.getTime(),
					"maximum": oAfter5Days.getTime()
				})
			},
			change: handleValueChange
		}),
		oDDR2 = new DynamicDateRange({
			standardOptions: ["DATE", "TODAY", "LASTDAYS", "LASTQUARTERS", "LASTWEEKSINCLUDED", "LASTWEEKS", "LASTMONTHSINCLUDED", "TODAYFROMTO"],
			value: {
				path: '/val2',
				type: new DynamicDate()
			},
			change: handleValueChange
		}),
		oDDR3 = new DynamicDateRange({
			standardOptions: ["DATE", "TODAY", "LASTDAYS","DATETOYEAR", "LASTQUARTERS", "TODAYFROMTO", "SPECIFICMONTH", "SPECIFICMONTHINYEAR","FIRSTDAYWEEK",
				"LASTDAYWEEK", "FIRSTDAYMONTH", "LASTDAYMONTH", "FIRSTDAYQUARTER", "LASTDAYQUARTER", "FIRSTDAYYEAR","LASTDAYYEAR"
				],
			value: {
				path: '/val3',
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
		oDDR4 = new DynamicDateRange({
			enableGroupHeaders: false,
			value: {
				path: '/val4',
				type: new DynamicDate()
			},
			change: handleValueChange
		}),
		oApp = new App("myApp", {
			initialPage:"myPage1"
		}),
		oPage1 = new Page("myPage1", {
			title: "DynamicDateRange Control",
			titleLevel: TitleLevel.H1,
			content: [
				new Label({ labelFor: oDDR1, text: "All keys & message handling"}),
				oDDR1,
				new Label({ labelFor: oDDR2, text: "Custom options"}),
				oDDR2,
				new Label({ labelFor: oDDR3, text: "Different format"}),
				oDDR3,
				new Label({ labelFor: oDDR4, text: "No group headers"}),
				oDDR4,
				new Label({labelFor: "txt1", text: "Selected values: "}),
				new TextArea("txt1", { height: "300px"})
			]
		});

	var oMessageManager = Messaging;
	oMessageManager.registerObject(oDDR1, true);

	var oModel = new JSONModel({
			val1: {
				operator: "DATE",
				values: [1602277200000]
			},
			val2: {
				operator: "DATE",
				values: [1602277200000]
			},
			val3: {
				operator: "DATE",
				values: [1602277200000]
			},
			val4: {
				operator: "DATE",
				values: [1602277200000]
			}
		});

	oApp.addPage(oPage1);
	oApp.setModel(oModel);

	oApp.placeAt("body");
});
