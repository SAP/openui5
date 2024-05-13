sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/core/InvisibleText",
	"sap/m/App",
	"sap/m/Label",
	"sap/m/ProgressIndicator",
	"sap/m/Input",
	"sap/ui/core/library",
	"sap/m/Button",
	"sap/m/Page"
], function (Element, InvisibleText, App, Label, ProgressIndicator, Input, coreLibrary, Button, Page) {
	"use strict";

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	new InvisibleText("input_acc_name", { text: "Change value" }).toStatic();

	var app = new App("myApp", { initialPage: "page1" });

	var label1 = new Label({
		wrapping: true,
		text: "Progress Indicator with 50% neutral"
	});

	var oProgInd1 = new ProgressIndicator("pi1", {
		percentValue: 50,
		displayValue: "50%",
		tooltip: "Progress indicator with value 50% in neutral state"
	});

	var oInput = new Input("input", {
		placeholder: "Number",
		ariaLabelledBy: ["input_acc_name"],
		width: "8rem"
	});

	var label2 = new Label({
		wrapping: true,
		text: "Progress Indicator with 75% negative without text"
	});

	var oProgInd2 = new ProgressIndicator("pi2", {
		percentValue: 75,
		displayValue: "75%",
		state: ValueState.Error,
		tooltip: "Progress indicator with value 75% in error state"
	});

	var label3 = new Label({
		wrapping: true,
		text: "Progress Indicator with 88% positive"
	});

	var oProgInd3 = new ProgressIndicator("pi3", {
		height: "1.375rem",
		percentValue: 88,
		displayValue: "0.88GB of 1GB",
		state: ValueState.Success,
		tooltip: "Progress indicator with value 88% in success state"
	});

	var label4 = new Label({
		wrapping: true,
		text: "Progress Indicator with 25% critical, 50% width, disabled - no value state shown"
	});

	var oProgInd4 = new ProgressIndicator("pi4", {
		width: "50%",
		percentValue: 25,
		displayValue: "25%",
		state: ValueState.Warning,
		tooltip: "Progress indicator with value 25% in warning state with width of 50%",
		enabled: false
	});

	/*
	var label5 = new Label({
		wrapping: true,
		text : "Invisible Progress Indicator"
	});
	*/

	var oProgInd5 = new ProgressIndicator("pi5", {
		percentValue: 99,
		displayValue: "99%",
		showValue: false,
		visible: false,
		tooltip: "Progress indicator with value 99% with no value state and width of 50%"
	});

	var label6 = new Label({
		wrapping: true,
		text: "Progress Indicator with 65% negative, disabled - no value state shown"
	});

	var oProgInd6 = new ProgressIndicator("pi6", {
		percentValue: 65,
		displayValue: "65%",
		enabled: false,
		state: ValueState.Error,
		tooltip: "Progress indicator with value 65% in error state and width of 80%"
	});

	var label7 = new Label({
		wrapping: true,
		text: "Progress Indicator with 45% critical"
	});

	var oProgInd7 = new ProgressIndicator("pi7", {
		percentValue: 45,
		displayValue: "45%",
		state: ValueState.Warning,
		tooltip: "Progress indicator with value 45% in warning state and width of 80%"
	});

	var label8 = new Label({
		wrapping: true,
		text: "Progress Indicator with 49% success"
	});

	var oProgInd8 = new ProgressIndicator("pi8", {
		percentValue: 49,
		displayValue: "49%",
		state: ValueState.Success,
		tooltip: "Progress indicator with value 94% in success state and width of 10%"
	});

	var label9 = new Label({
		wrapping: true,
		text: "Progress Indicator with 39% information"
	});

	var oProgInd9 = new ProgressIndicator("pi9", {
		percentValue: 39,
		displayValue: "39%",
		state: ValueState.Information,
		tooltip: "Progress indicator with value 39% in informaton state and width of 80%"
	});

	var label10 = new Label({
		wrapping: true,
		text: "Progress Indicator without animation"
	});

	var oProgInd10 = new ProgressIndicator("pi10", {
		percentValue: 0,
		displayValue: "0%",
		state: ValueState.Success,
		displayAnimation: false,
		tooltip: "Progress indicator with value 0% in success state"
	});

	var oButton = new Button("button", {
		text: "ChangePI",
		press: function () {
			var sPercent = Element.getElementById("input").getValue();
			oProgInd8.setDisplayValue(sPercent + "%");
			oProgInd8.setPercentValue(parseFloat(sPercent));
		}
	});

	var oButton2 = new Button("change_pi", {
		text: "Change PI to 40%",
		press: function () {
			oProgInd8.setDisplayValue("40%");
			oProgInd8.setPercentValue(40);
		}
	});

	var oButton3 = new Button("small_pi", {
		text: "Set PI to small size",
		press: function () {
			oProgInd8.setHeight("1.375rem");
		}
	});

	var oButton4 = new Button("disable_pi", {
		text: "Set PI to disable",
		press: function () {
			oProgInd8.setEnabled(false);
		}
	});

	var oButton5 = new Button("state_pi", {
		text: "Set state",
		press: function () {
			oProgInd8.setState(ValueState.Neutral);
		}
	});

	var oButton6 = new Button("change_pi_empty", {
		text: "Change PI to -20%",
		press: function () {
			oProgInd8.setDisplayValue("-20%");
			oProgInd8.setPercentValue(-20);
		}
	});

	var oButton7 = new Button("change_pi_full", {
		text: "Change PI to 120%",
		press: function () {
			oProgInd8.setDisplayValue("120%");
			oProgInd8.setPercentValue(120);
		}
	});

	var oButton10 = new Button("button_no_animation100", {
		text: "Change PI to 100% without animation",
		press: function () {
			oProgInd10.setDisplayValue("100%");
			oProgInd10.setPercentValue(100);
		}
	});

	var oButton11 = new Button("button_no_animation0", {
		text: "Change PI to 0% without animation",
		press: function () {
			oProgInd10.setDisplayValue("0%");
			oProgInd10.setPercentValue(0);
		}
	}).addStyleClass("sapUiSmallMarginEnd");

	// create page
	var page1 = new Page("page1", {
		title: "Progress Indicator",
		titleLevel: "H1",
		content: [
			label2,
			oProgInd2,
			label3,
			oProgInd3,
			label4,
			oProgInd4,
			//label5,
			oProgInd5,
			label1,
			oProgInd1,
			label6,
			oProgInd6,
			label7,
			oProgInd7,
			label9,
			oProgInd9,
			label10,
			label8,
			oProgInd8,
			oInput,
			oButton,
			oButton2,
			oButton3,
			oButton4,
			oButton5,
			oButton6,
			oButton7,
			oProgInd10,
			oButton11,
			oButton10
		]
	}).addStyleClass("sapUiContentPadding");

	app.addPage(page1);
	app.placeAt("body");
});
