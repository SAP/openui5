sap.ui.define([
	"sap/m/Label",
	"sap/m/ObjectNumber",
	"sap/ui/core/library",
	"sap/ui/core/Item",
	"sap/m/Select",
	"sap/m/App",
	"sap/m/Page",
	"sap/m/Title",
	"sap/m/VBox"
], function(Label, ObjectNumber, coreLibrary, Item, Select, App, Page, Title, VBox) {
	"use strict";

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	// shortcut for sap.ui.core.TextAlign
	var TextAlign = coreLibrary.TextAlign;

	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;

	// shortcut for sap.ui.core.TitleLevel
	var TitleLevel = coreLibrary.TitleLevel;

	var txt1 = new Label({text:"ObjectNumber (emphasized by default):"});

	var on1 = new ObjectNumber("on1", {
		number: "12",
		unit: "Euro",
		emptyIndicatorMode: "Auto"
	});

	var txt2 = new Label({text:"Non-emphasized ObjectNumber:"});

	var on2 = new ObjectNumber("on2", {
		number: "1.50",
		unit: "Euro",
		emphasized: false
	});

	var txt23 = new Label({text:"Empty Text ObjectNumber:"});

	var on23 = new ObjectNumber("on23", {
		number: "",
		unit: "Euro",
		emptyIndicatorMode: "On"
	});

	var txt3 = new Title({
		text:"ObjectNumber state changes"
	});

	var on3 = new ObjectNumber("on3", {
		number: "1.50",
		unit: "Euro",
		emphasized: false
	});

	var txt4 = new Label({text: "textDirection: LTR, textAlign: Begin"});

	var on4 = new ObjectNumber("on4", {
		number: "1.50",
		unit: "Euro",
		emphasized: true,
		textDirection: TextDirection.LTR,
		textAlign: TextAlign.Begin
	});

	var txt5 = new Label({text: "textDirection: LTR, textAlign: End"});

	var on5 = new ObjectNumber("on5", {
		number: "1.50",
		unit: "Euro",
		emphasized: true,
		textDirection: TextDirection.LTR,
		textAlign: TextAlign.End
	});

	var txt6 = new Label({text: "textDirection: RTL, textAlign: Begin"});

	var on6 = new ObjectNumber("on6", {
		number: "1.50",
		unit: "וְהָיוּ הַדְּבָרִים",
		emphasized: true,
		textDirection: TextDirection.RTL,
		textAlign: TextAlign.Begin
	});

	var txt7 = new Label({text: "textDirection: RTL, textAlign: End"});

	var on7 = new ObjectNumber("on7", {
		number: "1.50",
		unit: "וְהָיוּ הַדְּבָרִים",
		emphasized: true,
		textDirection: TextDirection.RTL,
		textAlign: TextAlign.End
	});

	var txt8 = new Label({text: "textDirection: RTL, textAlign: Left"});

	var on8 = new ObjectNumber("on8", {
		number: "1.50",
		unit: "וְהָיוּ הַדְּבָרִים",
		emphasized: true,
		textDirection: TextDirection.RTL,
		textAlign: TextAlign.Left
	});

	var txt9 = new Label({text: "textDirection: RTL, textAlign: Right"});

	var on9 = new ObjectNumber("on9", {
		number: "1.50",
		unit: "וְהָיוּ הַדְּבָרִים",
		emphasized: true,
		textDirection: TextDirection.RTL,
		textAlign: TextAlign.Right
	});

	var txt10 = new Label({text: "Active ObjectNumber", labelFor: "on10"});

	var on10 = new ObjectNumber("on10", {
		number: "1.50",
		active: true
	});

	var on102 = new ObjectNumber("on102", {
		number: "1.50",
		unit: "EUR",
		active: true
	});

	var txt11 = new Label({text: "Inverted ObjectNumber"});

	var on11 = new ObjectNumber("on11", {
		number: "1.50",
		inverted: true
	});

	var txt12 = new Label({text: "Large ObjectNumber"});

	var on12 = new ObjectNumber("on12", {
		number: "1.50"
	}).addStyleClass("sapMObjectNumberLarge");

	var txt13 = new Label({text: "Inverted active ObjectNumber", labelFor: "on13"});

	var on13 = new ObjectNumber("on13", {
		number: "1.50",
		active: true,
		inverted: true
	});

	var txt14 = new Label({text: "Active large ObjectNumber", labelFor: "on14"});

	var on14 = new ObjectNumber("on14", {
		number: "1.50",
		active: true
	}).addStyleClass("sapMObjectNumberLarge");

	var on142 = new ObjectNumber("on142", {
		number: "1.50",
		unit: "EUR",
		active: true
	}).addStyleClass("sapMObjectNumberLarge");

	var txt15 = new Label({text: "Inverted large ObjectNumber"});

	var on15 = new ObjectNumber("on15", {
		number: "1.50",
		inverted: true
	}).addStyleClass("sapMObjectNumberLarge");

	var txt16 = new Label({text: "Inverted active large ObjectNumber", labelFor: "on16"});

	var on16 = new ObjectNumber("on16", {
		number: "1.50",
		active: true,
		inverted: true
	}).addStyleClass("sapMObjectNumberLarge");

	// items
	var oItemNone = new Item({
		key: ValueState.None,
		text: "None"
	}),

	oItemWarning = new Item({
		key: ValueState.Warning,
		text: "Warning"
	}),

	oItemError = new Item({
		key: ValueState.Error,
		text: "Error"
	}),

	oItemSuccess = new Item({
		key: ValueState.Success,
		text: "Success"
	}),

	//Object Number control to demonstrate state changes
	oSelectLabel = new Label({
		text:"Select a state from the dropdown:",
		labelFor: "select"
	}),

	oStateSelect = new Select("select", {
		name: "select-object-state",
		tooltip: "Object Number state",
		items: [oItemNone, oItemWarning, oItemError, oItemSuccess],
		change: function(oControlEvent) {
			on3.setState(oControlEvent.getParameter("selectedItem").getKey());
		}
	});

	var oVBox = new VBox().addStyleClass("sapUiSmallMargin");
		oVBox.addItem(txt3);
		oVBox.addItem(oSelectLabel);
		oVBox.addItem(oStateSelect);
		oVBox.addItem(on3.addStyleClass("sapUiTinyMarginTop"));

	var app = new App();
	var page = new Page({
		title: "Object Number",
		titleLevel: TitleLevel.H1,
		enableScrolling : true,
		content: [
			txt1,
			on1,
			txt2,
			on2,
			txt23,
			on23,
			oVBox,
			txt4,
			on4,
			txt5,
			on5,
			txt6,
			on6,
			txt7,
			on7,
			txt8,
			on8,
			txt9,
			on9,
			txt10,
			on10,
			on102,
			txt11,
			on11,
			txt12,
			on12,
			txt13,
			on13,
			txt14,
			on14,
			on142,
			txt15,
			on15,
			txt16,
			on16
		]
	});
	app.setInitialPage(page.getId());
	app.addPage(page);

	app.placeAt('body');
});
