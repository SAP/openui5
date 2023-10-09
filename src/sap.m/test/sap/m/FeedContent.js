sap.ui.define([
	"sap/m/App",
	"sap/m/FeedContent",
	"sap/m/FlexBox",
	"sap/m/Input",
	"sap/m/Label",
	"sap/m/library",
	"sap/m/MessageToast",
	"sap/m/Page",
	"sap/m/Select",
	"sap/m/Switch",
	"sap/m/Text",
	"sap/m/TextArea",
	"sap/ui/core/Item",
	"sap/ui/core/Title",
	"sap/ui/layout/form/SimpleForm",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/type/Integer",
	"sap/ui/util/Mobile",
	"sap/ui/ux3/QuickView",
	"sap/ui/base/ManagedObject"
], function(
	App,
	FeedContent,
	FlexBox,
	Input,
	Label,
	mobileLibrary,
	MessageToast,
	Page,
	Select,
	Switch,
	MText,
	TextArea,
	Item,
	Title,
	SimpleForm,
	JSONModel,
	Integer,
	Mobile,
	QuickView,
	ManagedObject
) {
	"use strict";

	// shortcut for sap.m.InputType
	var InputType = mobileLibrary.InputType;

	// shortcut for sap.m.ValueColor
	var ValueColor = mobileLibrary.ValueColor;

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
		contentText : "@@notify Great outcome of the Presentation today. The new functionality and the new design was well received.",
		subheader : "about 1 minute ago in Computer Market",
		valueColor : ValueColor.Neutral,
		truncateValueTo : 4,
		tooltip : "New message:\n{AltText}\nClick to follow"
	};

	var oConfModel = new JSONModel(oConfData);
	ManagedObject.setModel(oConfModel);

	var fnPress = function(oEvent) {
		MessageToast.show("The feed content is pressed.");
	};

	var oFeedContent = new FeedContent("configurable-feed-content", {
		contentText : "{/contentText}",
		subheader : "{/subheader}",
		value : "{/value}",
		truncateValueTo : "{/truncateValueTo}",
		valueColor : "{/valueColor}",
		tooltip : "{/tooltip}",
		press : fnPress
	});
	oFeedContent.addStyleClass("sapUiSmallMargin");

	var oFlexBox = new FlexBox("flexbox", {
		items : [oFeedContent],
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

	var oValueLbl = new Label({
		text : "Value",
		labelFor : "value-value"
	});

	var oValueInput = new Input("value-value", {
		type : InputType.Text,
		placeholder : 'Enter value ...'
	});
	oValueInput.bindValue("/value");

	var oTooltipLbl = new Label({
		text : "Tooltip",
		labelFor : "tooltip"
	});

	var oTooltipInput = new TextArea("tooltip",{
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
			oFeedContent.setTooltip(bState ? new QuickView({
				content : new MText({
					text : oTooltipInput.getValue().split("{AltText}").join(oFeedContent.getAltText())
				})
			}) : oTooltipInput.getValue());
		}
	});

	var oTruncateLbl = new Label({
		text : "Truncate value to",
		labelFor : "truncate-value-to"
	});

	var oTruncateInput = new Input("truncate-value-to", {
		type : InputType.Number,
		value : {
			path : "/truncateValueTo",
			type : new Integer()
		}
	});

	var oValueColorChangeLbl = new Label({
		text : "Value Color",
		labelFor : "value-color-change"
	});

	var oValueColorChangeSlct = new Select("value-color-change", {
		change : function(oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			oConfData.valueColor = oSelectedItem.getKey();
			oConfModel.checkUpdate();
		},
		items : [
				new Item("actual-value-color-"
						+ ValueColor.Neutral, {
					key : ValueColor.Neutral,
					text : ValueColor.Neutral
				}),
				new Item("actual-value-color-"
						+ ValueColor.Good, {
					key : ValueColor.Good,
					text : ValueColor.Good
				}),
				new Item("actual-value-color-"
						+ ValueColor.Critical, {
					key : ValueColor.Critical,
					text : ValueColor.Critical
				}),
				new Item("actual-value-color-"
						+ ValueColor.Error, {
					key : ValueColor.Error,
					text : ValueColor.Error
				}) ],
		selectedItem : "actual-value-color-" + ValueColor.Neutral
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
				oFeedContent.attachPress(fnPress);
			} else {
				oFeedContent.detachPress(fnPress);
			}
		}
	});

	var editableSimpleForm = new SimpleForm("controls", {
		maxContainerCols : 2,
		editable : true,
		content : [ new Title({
			text : "Modify Feed Content"
		}), oCTLbl, oCTInput, oSbhLbl, oSbhInput, oValueLbl, oValueInput,
				oValueColorChangeLbl, oValueColorChangeSlct, oTruncateLbl,
				oTruncateInput, oPressLbl, oPressSwtch, oTooltipLbl,
				oTooltipInput, oTooltipSwtchLbl, oTooltipSwtch ]
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
