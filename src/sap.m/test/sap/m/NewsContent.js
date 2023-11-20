sap.ui.define([
	"sap/m/App",
	"sap/m/FlexBox",
	"sap/m/Input",
	"sap/m/Label",
	"sap/m/library",
	"sap/m/MessageToast",
	"sap/m/NewsContent",
	"sap/m/Page",
	"sap/m/Switch",
	"sap/m/Text",
	"sap/m/TextArea",
	"sap/m/TileContent",
	"sap/ui/core/Title",
	"sap/ui/layout/form/SimpleForm",
	"sap/ui/model/json/JSONModel",
	"sap/ui/util/Mobile",
	"sap/ui/ux3/QuickView"
], function(
	App,
	FlexBox,
	Input,
	Label,
	mobileLibrary,
	MessageToast,
	NewsContent,
	Page,
	Switch,
	MText,
	TextArea,
	TileContent,
	Title,
	SimpleForm,
	JSONModel,
	Mobile,
	QuickView
) {
	"use strict";

	// shortcut for sap.m.InputType
	var InputType = mobileLibrary.InputType;

	function setBackgroundColor(oAnyObject) {
		var oColors = {
			white : "#FFFFFF",
			black : "#000000",
			blue : "#6666FF",
			red : "#FF6666",
			green : "#66FF66"
		};
		var sParam = new URLSearchParams(window.location.search).get("sap-ui-suite-background-color");
		if (sParam) {
			var sColor = oColors[sParam.toLowerCase()];
			if (sColor) {
				oAnyObject.addDelegate({
					onAfterRendering : function() {
						oAnyObject.$().css("background-color", sColor);
					}
				});
			}
		}
	}

	Mobile.init();

	var oConfData = {
		contentText : "SAP Unveils Powerful New Player Comparison Tool Exclusively on NFL.com",
		subheader : "August 21, 2013",
		tooltip : "Recent news:\n{AltText}\nClick to follow"
	};

	var oConfModel = new JSONModel(oConfData);
	sap.ui.getCore().setModel(oConfModel);

	var fnPress = function(oEvent) {
		MessageToast.show("The news content is pressed.");
	};

	var oNewsContent = new NewsContent("configurable-news-content-", {
		contentText : "{/contentText}",
		subheader : "{/subheader}",
		tooltip : "{/tooltip}",
		press : fnPress
	});

	var oTileContent = new TileContent({
		content : oNewsContent
	}).addStyleClass("sapUiSmallMargin");

	var oFlexBox = new FlexBox("flexbox", {
		items : [oTileContent],
		alignItems: "Start",
		justifyContent: "SpaceAround"
	});

	var oCTLbl = new Label({
		text : "Content Text",
		labelFor : "content-text-value"
	});

	var oCTInput = new Input("content-text-value", {
		type : InputType.Text,
		placeholder : 'Enter value ...'
	});
	oCTInput.bindValue("/contentText");

	var oSbhLbl = new Label({
		text : "Subheader",
		labelFor : "subheader-value"
	});

	var oSbhInput = new Input("subheader-value", {
		type : InputType.Text,
		placeholder : 'Enter value ...'
	});
	oSbhInput.bindValue("/subheader");

	var oTooltipLbl = new Label({
		text : "Tooltip",
		labelFor : "tooltip"
	});

	var oTooltipInput = new TextArea("tooltip", {
		rows : 3,
		placeholder : 'Enter tooltip (use {AltText} for inserting the default text) ...',
		value : "{/tooltip}"
	});

	var oTooltipSwtchLbl = new Label({
		text : "QuickView Tooltip",
		labelFor : "tooltip-swtch"
	});

	var oTooltipSwtch = new Switch({
		id : "tooltip-swtch",
		state : false,
		name : "QuickView tooltip",
		change : function(oEvent) {
			var bState = oEvent.getParameter("state");
			oNewsContent.setTooltip(bState ? new QuickView({
				content : new MText({
					text : oTooltipInput.getValue().split("{AltText}").join(oNewsContent.getAltText())
				})
			}) : oTooltipInput.getValue());
		}
	});

	var oPressLbl = new Label({
		text : "Press Action",
		labelFor : "press-action"
	});

	var oPressSwtch = new Switch({
		id : "press-action",
		state : true,
		change : function(oEvent) {
			var bState = oEvent.getParameter("state");
			if (bState) {
				oNewsContent.attachPress(fnPress);
			} else {
				oNewsContent.detachPress(fnPress);
			}
		}
	});

	var editableSimpleForm = new SimpleForm("controls", {
		maxContainerCols : 2,
		editable : true,
		content : [new Title({
			text : "Modify News Content"
		}), oCTLbl, oCTInput, oSbhLbl, oSbhInput, oPressLbl, oPressSwtch, oTooltipLbl, oTooltipInput, oTooltipSwtchLbl,
				oTooltipSwtch]
	});

	var oPage = new Page({
		content : [oFlexBox, editableSimpleForm]
	});
	//create a mobile App embedding the page and place the App into the HTML document
	new App("myApp", {
		pages : [oPage]
	}).placeAt("content");
	setBackgroundColor(oPage);
});
