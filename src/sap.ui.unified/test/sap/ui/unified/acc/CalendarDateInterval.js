sap.ui.define([
	"sap/m/HBox",
	"sap/m/Label",
	"sap/m/MessageToast",
	"sap/ui/core/library",
	"sap/ui/Device",
	"sap/ui/unified/CalendarDateInterval",
	"sap/ui/core/date/UI5Date",
	"sap/m/App",
	"sap/m/Page"
], function(
		HBox,
		Label,
		MessageToast,
		coreLibrary,
		Device,
		CalendarDateInterval,
		UI5Date,
		App,
		Page
		) {
	"use strict";

	// shortcut for sap.ui.core.TitleLevel
	var TitleLevel = coreLibrary.TitleLevel;

	var oCal = new CalendarDateInterval("Cal1",{
		width: "320px",
		legend: "Legend1",
		cancel: function(oEvent){
			MessageToast.show("Cancel");
		}
	});

	var oHbox1 = new HBox({
		items: [
			oCal
		]
	});

	// single interval selection
	var oStartDate = UI5Date.getInstance();
	oStartDate.setDate(oStartDate.getDate() - 1);
	var oCal2 = new CalendarDateInterval("Cal2", {
		width: Device.system.phone ? "340px" : "464px",
		startDate: oStartDate,
		days: 14,
		intervalSelection: true
	});

	var oHbox2 = new HBox({
		items: [
			oCal2
		]
	});

	var oCal3 = new CalendarDateInterval("Cal3",{
		width: Device.system.phone ? "340px" : "1000px",
		days: 40,
		intervalSelection: false,
		singleSelection: false
	});

	var oHbox3 = new HBox({
		items: [
			oCal3
		]
	});

	var app = new App("myApp");
	var page = new Page("page", {
		title: "Test Page for sap.ui.unified.CalendarDateInterval",
		titleLevel: TitleLevel.H1,
		content: [
			new Label({
				text: "Single day Selection Calendar",
				labelFor: "Cal1"
			}).addStyleClass("sapUiSmallMarginTop"),
			oHbox1,
			new Label({
				text: "Single interval Selection Calendar",
				labelFor: "Cal2"
			}).addStyleClass("sapUiSmallMarginTop"),
			oHbox2,
			new Label({
				text: "Single day Selection in multiple month Calendar",
				labelFor: "Cal3"
			}).addStyleClass("sapUiSmallMarginTop"),
			oHbox3
		]
	});
	page.addStyleClass("sapUiContentPadding");
	app.addPage(page);
	app.placeAt("body");
});