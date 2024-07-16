sap.ui.define([
	"sap/m/Button",
	"sap/m/CheckBox",
	"sap/m/Image",
	"sap/m/Input",
	"sap/m/RatingIndicator",
	"sap/m/Slider",
	"sap/m/Text",
	"sap/m/TextArea",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/core/library"
], function(Button, CheckBox, Image, Input, RatingIndicator, Slider, Text, TextArea, VerticalLayout, coreLibrary) {
	"use strict";

	// shortcut for sap.ui.core.Wrapping
	const Wrapping = coreLibrary.Wrapping;

	new VerticalLayout("Layout1", {
		content: [
			new Button({text:"Press me", tooltip:"Button tooltip"}),
			new Input({value:"Test"}),
			new Image({src:"http://www.sap.com/global/images/SAPLogo.gif"})
		]
	}).placeAt("uiArea1");

	new VerticalLayout("Layout2", {
		width: "200px",
		content: [
			new Slider({value:25, tooltip:"Slider tooltip", width: "300px"}),
			new TextArea({value:"This text is longer than the width of the VerticalLayout.\nSo it should be cut.\n1\n2\n3\n4\n5\n6\n7\n8\n9", width: "300px", height: "150px", wrapping: Wrapping.Off}),
			new RatingIndicator({value: 4}),
			new CheckBox({text: "Test"}),
			new Text({text: "This text is longer than the width of the VerticalLayout.\nSo it should be cut.", width: "300px", wrapping: false})
		]
	}).placeAt("uiArea2");
	new VerticalLayout("Layout3", {
		content: [
			new Button({text:"Press me", tooltip:"Button tooltip"}),
			new Input({value:"This input is invisible and its vertical layout cell should not have padding", visible: false}),
			new Image({src:"http://www.sap.com/global/images/SAPLogo.gif"})
		]
	}).addStyleClass("sapUiContentPadding").placeAt("uiArea3");
});