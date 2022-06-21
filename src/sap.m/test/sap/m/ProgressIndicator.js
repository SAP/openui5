sap.ui.define([
	"sap/ui/core/InvisibleText",
	"sap/m/App",
	"sap/m/Label",
	"sap/m/ProgressIndicator",
	"sap/m/Input",
	"sap/ui/core/library",
	"sap/m/Button",
	"sap/m/Page"
], function(InvisibleText, App, Label, ProgressIndicator, Input, coreLibrary, Button, Page) {
	"use strict";

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	new InvisibleText("input_acc_name", {text: "Change value"}).toStatic();

	var app = new App("myApp", {initialPage:"page1"});

	var label1 = new Label({
		wrapping: true,
		text : "Progress Indicator with 50% neutral"
	});

	// create progressIndicator
	var oProgInd1 = new ProgressIndicator("pi1", {
		percentValue:50,
		displayValue:"50%"
	});

	var oInput = new Input("input", {
		placeholder : "Number",
		ariaLabelledBy: ["input_acc_name"],
		width:"10%"
	});

	var label2 = new Label({
		wrapping: true,
		text : "Progress Indicator with 75% negative without text (suggested normal size)"
	});

	// create progressIndicator
	var oProgInd2 = new ProgressIndicator("pi2", {
		percentValue:75,
		displayValue:"75%",
		state: ValueState.Error
	});

	var label3 = new Label({
		wrapping: true,
		text : "Progress Indicator with 99% positive (suggested small size)"
	});

	// create progressIndicator
	var oProgInd3 = new ProgressIndicator("pi3", {
		height: "1.375rem",
		percentValue:88,
		displayValue:"0.88GB of 1GB",
		state: ValueState.Success
	});

	var label4 = new Label({
		wrapping: true,
		text : "Progress Indicator with 25% critical, 50% width, disabled - no value state shown"
	});

	// create progressIndicator
	var oProgInd4 = new ProgressIndicator("pi4", {
		width:"50%",
		percentValue:25,
		displayValue:"25%",
		state: ValueState.Warning
	});

	/*
	var label5 = new Label({
		wrapping: true,
		text : "Invisible Progress Indicator"
	});
	*/

	var oProgInd5 = new ProgressIndicator("pi5", {
		width:"50%",
		percentValue:99,
		displayValue:"99%",
		showValue:false,
		visible:false
	});

	var label6 = new Label({
		wrapping: true,
		text : "Progress Indicator with 65% negative, disabled - no value state shown"
	});

	// create progressIndicator
	var oProgInd6 = new ProgressIndicator("pi6", {
		width:"80%",
		percentValue:65,
		displayValue:"65%",
		enabled: false,
		state: ValueState.Error
	});

	var label7 = new Label({
		wrapping: true,
		text : "Progress Indicator with 45% critical"
	});

	// create progressIndicator
	var oProgInd7 = new ProgressIndicator("pi7", {
		width:"80%",
		percentValue:45,
		displayValue:"45%",
		state: ValueState.Warning
	});

	var label8 = new Label({
		wrapping: true,
		text : "Progress Indicator with 49% success"
	});

	// create progressIndicator
	var oProgInd8 = new ProgressIndicator("pi8", {
		width:"10%",
		percentValue:49,
		displayValue:"49%",
		state: ValueState.Success
	});

	var label9 = new Label({
		wrapping: true,
		text : "Progress Indicator with 39% information"
	});

	// create progressIndicator
	var oProgInd9 = new ProgressIndicator("pi9", {
		width:"80%",
		percentValue:39,
		displayValue:"39%",
		state: ValueState.Information
	});

	var label10 = new Label({
		wrapping: true,
		text : "Progress Indicator without animation"
	});

	var oProgInd10 = new ProgressIndicator("pi10", {
		percentValue:0,
		displayValue:"0%",
		state: ValueState.Success,
		displayAnimation: false
	});

	var oButton = new Button("button", {
		text:"ChangePI",
		press: function(){
			var sPercent = sap.ui.getCore().byId("input").getValue();
			oProgInd8.setDisplayValue(sPercent + "%");
			oProgInd8.setPercentValue(parseFloat(sPercent));
		}
	});

	var oButton2 = new Button("change_pi", {
		text:"Change PI to 40%",
		press: function(){
			oProgInd8.setDisplayValue("40%");
			oProgInd8.setPercentValue(40);
		}
	});

	var oButton3 = new Button("small_pi", {
		text:"Set PI to small size",
		press: function(){
			oProgInd8.setHeight("1.375rem");
		}
	});

	var oButton4 = new Button("disable_pi", {
		text:"Set PI to disable",
		press: function(){
			oProgInd8.setEnabled(false);
		}
	});

	var oButton5 = new Button("state_pi", {
		text:"Set state",
		press: function(){
			oProgInd8.setState(ValueState.Neutral);
		}
	});

	var oButton6 = new Button("change_pi_empty", {
		text:"Change PI to -20%",
		press: function(){
			oProgInd8.setDisplayValue("-20%");
			oProgInd8.setPercentValue(-20);
		}
	});

	var oButton7 = new Button("change_pi_full", {
		text:"Change PI to 120%",
		press: function(){
			oProgInd8.setDisplayValue("120%");
			oProgInd8.setPercentValue(120);
		}
	});

	var oButton10 = new Button("button_no_animation100", {
		text:"Change PI to 100% without animation",
		press: function(){
			oProgInd10.setDisplayValue("100%");
			oProgInd10.setPercentValue(100);
		}
	});

	var oButton11 = new Button("button_no_animation0", {
		text:"Change PI to 0% without animation",
		press: function(){
			oProgInd10.setDisplayValue("0%");
			oProgInd10.setPercentValue(0);
		}
	}).addStyleClass("sapUiSmallMarginEnd");

	// create page
	var page1 = new Page("page1", {
		title:"Progress Indicator",
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
	});

	app.addPage(page1);

	app.placeAt("body");
});
