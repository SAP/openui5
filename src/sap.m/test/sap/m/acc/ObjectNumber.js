sap.ui.define([
	"sap/m/Label",
	"sap/m/ObjectNumber",
	"sap/ui/core/library",
	"sap/m/App",
	"sap/m/Page",
	"sap/ui/layout/VerticalLayout"
], function(Label, ObjectNumber, coreLibrary, App, Page, VerticalLayout) {
	"use strict";

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	// shortcut for sap.ui.core.TextAlign
	var TextAlign = coreLibrary.TextAlign;

	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;

	// shortcut for sap.ui.core.TitleLevel
	var TitleLevel = coreLibrary.TitleLevel;

	var txt1 = new Label({text:"ObjectNumber (emphasized by default):", wrapping: true});
	var on1 = new ObjectNumber("on1", {
		number: "12",
		unit: "Euro",
		emptyIndicatorMode: "Auto"
	});

	var txt2 = new Label({text:"Non-emphasized ObjectNumber:", wrapping: true});
	var on2 = new ObjectNumber("on2", {
		number: "1.50",
		unit: "Euro",
		emphasized: false
	});

	var txt23 = new Label({text:"Empty Text ObjectNumber:", wrapping: true});
	var on23 = new ObjectNumber("on23", {
		number: "",
		unit: "Euro",
		emptyIndicatorMode: "On"
	});

	var txt4 = new Label({text: "textDirection: LTR, textAlign: Begin", wrapping: true});
	var on4 = new ObjectNumber("on4", {
		number: "1.50",
		unit: "Euro",
		emphasized: true,
		textDirection: TextDirection.LTR,
		textAlign: TextAlign.Begin
	});

	var txt5 = new Label({text: "textDirection: LTR, textAlign: End", wrapping: true});
	var on5 = new ObjectNumber("on5", {
		number: "1.50",
		unit: "Euro",
		emphasized: true,
		textDirection: TextDirection.LTR,
		textAlign: TextAlign.End
	});

	var txt8 = new Label({text: "textDirection: RTL, textAlign: Left", wrapping: true});
	var on8 = new ObjectNumber("on8", {
		number: "1.50",
		unit: "וְהָיוּ הַדְּבָרִים",
		emphasized: true,
		textDirection: TextDirection.RTL,
		textAlign: TextAlign.Left
	});

	var txt10 = new Label({text: "Active ObjectNumber", wrapping: true, labelFor: "on10"});
	var on10 = new ObjectNumber("on10", {
		number: "1.50",
		active: true
	});

	var txt11 = new Label({text: "Inverted ObjectNumber", wrapping: true});
	var on11 = new ObjectNumber("on11", {
		number: "1.50",
		inverted: true
	});

	var txt12 = new Label({text: "Large ObjectNumber", wrapping: true});
	var on12 = new ObjectNumber("on12", {
		number: "1.50"
	}).addStyleClass("sapMObjectNumberLarge");

	var txt13 = new Label({text: "Inverted active ObjectNumber", wrapping: true, labelFor: "on13"});
	var on13 = new ObjectNumber("on13", {
		number: "1.50",
		active: true,
		inverted: true
	});

	var txt14 = new Label({text: "Active large ObjectNumber", wrapping: true, labelFor: "on14"});
	var on14 = new ObjectNumber("on14", {
		number: "1.50",
		state: ValueState.Error,
		active: true
	}).addStyleClass("sapMObjectNumberLarge");

	var txt15 = new Label({text: "Inverted large ObjectNumber", wrapping: true });
	var on15 = new ObjectNumber("on15", {
		number: "1.50",
		inverted: true
	}).addStyleClass("sapMObjectNumberLarge");

	var txt16 = new Label({text: "Inverted active large ObjectNumber", wrapping: true, labelFor: "on16"});
	var on16 = new ObjectNumber("on16", {
		number: "1.50",
		state: ValueState.Success,
		active: true,
		inverted: true
	}).addStyleClass("sapMObjectNumberLarge");

	var oApp = new App();
	var oPageLayout = new VerticalLayout({
		content: [
			txt1, on1,
			txt2, on2,
			txt23, on23,
			txt4, on4,
			txt5, on5,
			txt8, on8,
			txt10, on10,
			txt11, on11,
			txt12, on12,
			txt13, on13,
			txt14, on14,
			txt15, on15,
			txt16, on16
		]
	}).addStyleClass("sapUiContentPadding");

	var oPage = new Page({
		title: "ObjectNumber Accessibility Test Page",
		titleLevel: TitleLevel.H1,
		enableScrolling : true,
		content: [ oPageLayout ]
	});
	oApp.addPage(oPage);
	oApp.placeAt('body');
});
