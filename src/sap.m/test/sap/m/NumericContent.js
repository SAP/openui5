sap.ui.define([
	"sap/m/App",
	"sap/m/Button",
	"sap/m/CheckBox",
	"sap/m/FlexBox",
	"sap/m/Input",
	"sap/m/Label",
	"sap/m/library",
	"sap/m/MessageToast",
	"sap/m/NumericContent",
	"sap/m/Page",
	"sap/m/Select",
	"sap/m/Switch",
	"sap/m/Text",
	"sap/m/TextArea",
	"sap/ui/core/Configuration",
	"sap/ui/core/Core",
	"sap/ui/core/Item",
	"sap/ui/core/Title",
	"sap/ui/layout/form/SimpleForm",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/type/Integer",
	"sap/ui/util/Mobile",
	"sap/ui/ux3/QuickView"
], function(
	App,
	Button,
	CheckBox,
	FlexBox,
	Input,
	Label,
	mobileLibrary,
	MessageToast,
	NumericContent,
	Page,
	Select,
	Switch,
	MText,
	TextArea,
	Configuration,
	oCore,
	Item,
	Title,
	SimpleForm,
	JSONModel,
	Integer,
	Mobile,
	QuickView
) {
	"use strict";

	// shortcut for sap.m.LoadState
	var LoadState = mobileLibrary.LoadState;

	// shortcut for sap.m.InputType
	var InputType = mobileLibrary.InputType;

	// shortcut for sap.m.ValueColor
	var ValueColor = mobileLibrary.ValueColor;

	// shortcut for sap.m.DeviationIndicator
	var DeviationIndicator = mobileLibrary.DeviationIndicator;

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
		scale : "Mio",
		indicator : DeviationIndicator.Up,
		isFormatterValue : false,
		truncateValueTo : 5,
		nullifyValue : true,
		value : "-88.88",
		valueColor : ValueColor.Good,
		tooltip : "EMEA income\n{AltText}\ncalculated in EURO",
		iconDesc : "icon image",
		withMargin : true,
		icon: "sap-icon://travel-expense"
	};
	var oConfModel = new JSONModel();
	oConfModel.setData(oConfData);
	oCore.setModel(oConfModel);
	var fnPress = function(oEvent) {
		MessageToast.show("The numeric content is pressed.");
	};
	var oNumericContent = new NumericContent("configurable-nc-", {
		formatterValue : "{/isFormatterValue}",
		icon : "{/icon}",
		indicator : "{/indicator}",
		nullifyValue : "{/nullifyValue}",
		scale : "{/scale}",
		state : "{/state}",
		truncateValueTo : "{/truncateValueTo}",
		value : "{/value}",
		valueColor : "{/valueColor}",
		tooltip : "{/tooltip}",
		iconDescription : "{/iconDesc}",
		withMargin : "{/withMargin}",
		press : fnPress
	});
	oNumericContent.addStyleClass("sapUiSmallMargin");
	var oFlexBox = new FlexBox("nc-fb", {
		items : [ oNumericContent ],
		alignItems: "Start",
		justifyContent: "SpaceAround"
	});
	var oControlForm = new SimpleForm("numeric-content-form", {
		content : [ oFlexBox ]
	});
	var oScaleLbl = new Label({
		text : "Scale",
		labelFor : "scale-value"
	});
	var oScaleInput = new Input("scale-value", {
		type : InputType.Text,
		placeholder : 'Enter scale ...'
	});
	oScaleInput.bindValue("/scale");
	var oValueLbl = new Label({
		text : "Value",
		labelFor : "value-value"
	});
	var oValueInput = new Input("value-value", {
		type : InputType.Text,
		placeholder : 'Enter value ...'
	});
	oValueInput.bindValue("/value");
	var oTruncateLbl = new Label({
		text : "Truncate value to",
		labelFor : "truncate-value-to"
	});
	var oTruncateInput = new Input("truncate-value-to", {
		type : InputType.Number,
		value : {
			path : "/truncateValueTo",
			type : new Integer()
		},
		liveChange: function(oControlEvent) {
			if (oControlEvent.getParameter("newValue") === "") {
				oConfData.truncateValueTo = undefined;
				oConfModel.checkUpdate();
			}
		}
	});
	var oTriggerLoadLbl = new Label({
		text : "State",
		labelFor : "loading-state"
	});
	var oTriggerLoadSlct = new Select("loading-state", {
		change : function(oE) {
			var selectedItem = oE.getParameter("selectedItem");
			oConfData.state = selectedItem.getKey();
			oConfModel.checkUpdate();
		},
		items : [ new Item({
			key : LoadState.Loaded,
			text : LoadState.Loaded
		}), new Item({
			key : LoadState.Loading,
			text : LoadState.Loading
		}), new Item({
			key : LoadState.Failed,
			text : LoadState.Failed
		}) ]
	});
	var oValueColorChangeLbl = new Label({
		text : "Value Color",
		labelFor : "value-color-change"
	});
	var oValueColorChangeSlct = new Select("value-color-change", {
		change : function(oE) {
			var sSelectedItem = oE.getParameter("selectedItem").getKey();
			oConfData.valueColor = (sSelectedItem == "NoColor") ? undefined : sSelectedItem;
			oConfModel.checkUpdate();
		},
		items : [
			new Item("actual-value-color-no-color", {
				key : "NoColor",
				text : "No color"
			}),
			new Item("actual-value-color-" + ValueColor.Neutral, {
				key : ValueColor.Neutral,
				text : ValueColor.Neutral
			}),
			new Item("actual-value-color-" + ValueColor.Good, {
				key : ValueColor.Good,
				text : ValueColor.Good
			}),
			new Item("actual-value-color-" + ValueColor.Critical, {
				key : ValueColor.Critical,
				text : ValueColor.Critical
			}),
			new Item("actual-value-color-" + ValueColor.Error, {
				key : ValueColor.Error,
				text : ValueColor.Error
			})
		],
		selectedItem : "actual-value-color-Good"
	});
	var oDeviationChangeLbl = new Label({
		text : "Deviation",
		labelFor : "deviation-change"
	});
	var oDeviationChangeSlct = new Select("deviation-change", {
		change : function(oE) {
			var oSelectedItem = oE.getParameter("selectedItem");
			oConfData.indicator = oSelectedItem.getKey();
			oConfModel.checkUpdate();
		},
		items : [
			new Item("deviation-change-"
					+ DeviationIndicator.None, {
				key : DeviationIndicator.None,
				text : DeviationIndicator.None
			}),
			new Item("deviation-change-"
					+ DeviationIndicator.Up, {
				key : DeviationIndicator.Up,
				text : DeviationIndicator.Up
			}),
			new Item("deviation-change-"
					+ DeviationIndicator.Down, {
				key : DeviationIndicator.Down,
				text : DeviationIndicator.Down
			})
		],
		selectedItem : "deviation-change-Up"
	});
	var oFormatterValueChangeLbl = new Label({
		text : "Is value set by formatter",
		labelFor : "formatter-cb"
	});
	var oFormattedCheckBox = new CheckBox("formatter-cb", {
		selected : true,
		visible : true,
		enabled : true
	});
	oFormattedCheckBox.bindProperty("selected", "/isFormatterValue");
	var oWithMarginCheckBox = new CheckBox("withMargin-cb", {
		selected : "{/withMargin}"
	});
	var oNullifyLbl = new Label({
		text : "Nullify the value",
		labelFor : "nullify-cb"
	});
	var oNullifyCheckBox = new CheckBox("nullify-cb", {
		selected : true,
		visible : true,
		enabled : true
	});
	oNullifyCheckBox.bindProperty("selected", "/nullifyValue");
	var oIconLbl = new Label({
		text : "Icon",
		labelFor : "icon-change"
	});
	var oIconSlct = new Select("icon-change", {
		change : function(oE) {
			var sSelectedItem = oE.getParameter("selectedItem").getKey();
			oConfData.icon = sSelectedItem;
			oConfModel.checkUpdate();
		},
		items : [
			new Item("icon-item-1", {
				key : undefined,
				text : "No icon"
			}), new Item("icon-item-2", {
				key : "images/grass.jpg",
				text : "grass"
			}), new Item("icon-item-3", {
				key : "images/analytics_64.png",
				text : "analytics"
			}), new Item("icon-item-4", {
				key : "sap-icon://travel-expense",
				text : "travel-expense"
			}), new Item("icon-item-5", {
				key : "sap-icon://customer-financial-fact-sheet",
				text : "customer-financial-fact-sheet"
			})
		],
		selectedItem : "icon-item-4"
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
				oNumericContent.attachPress(fnPress);
			} else {
				oNumericContent.detachPress(fnPress);
			}
		}
	});
	var oTooltipLbl = new Label({
		text : "Tooltip",
		labelFor : "tooltip"
	});
	var oTooltipInput = new TextArea("tooltip", {
		rows : 3,
		placeholder : "Enter tooltip (use {AltText} for inserting the default text) ...",
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
			oNumericContent.setTooltip(bState ? new QuickView({
				content : new MText({
					text : oTooltipInput.getValue().split("{AltText}")
							.join(oNumericContent.getAltText())
				})
			}) : oTooltipInput.getValue());
		}
	});
	var oIconDescLbl = new Label({
		text : "Icon Description",
		labelFor : "iconDesc"
	});
	var oIconDescInput = new TextArea("iconDesc", {
		rows : 1,
		value : "{/iconDesc}"
	});
	var oSizeLbl = new Label({
		text : "Size",
		labelFor : "size-value"
	});
	var bBtnEnabled = (window.innerWidth < 375) ? false : true;
	var oSizeButton = new Button("size-button", {
		press : function(oEvent) {
			var sTheme = Configuration.getTheme();
			oCore.applyTheme(sTheme);
			var url = window.location.href;
			//Popup dimensions issue in chrome while using noopener: Chromium bug id=1011688
			window.open(url, "", "height=900,width=370,top=0,left=0,toolbar=no,menubar=no,noopener,noreferrer");
		},
		enabled: bBtnEnabled,
		text: "Open new page with small screen size",
		width: "300px"
	});
	var oInputForm = new SimpleForm("controls", {
		maxContainerCols : 2,
		editable : true,
		content : [
			new Title({
				text : "Modify Numeric Content"
			}),
			oScaleLbl,
			oScaleInput,
			oValueLbl,
			oValueInput,
			oTriggerLoadLbl,
			oTriggerLoadSlct,
			oValueColorChangeLbl,
			oValueColorChangeSlct,
			oTruncateLbl,
			oTruncateInput,
			oDeviationChangeLbl,
			oDeviationChangeSlct,
			oFormatterValueChangeLbl,
			oFormattedCheckBox,
			oNullifyLbl,
			oNullifyCheckBox,
			oIconLbl,
			oIconSlct,
			oIconDescLbl,
			oIconDescInput,
			oPressLbl,
			oPressSwtch,
			oTooltipLbl,
			oTooltipInput,
			oTooltipSwtchLbl,
			oTooltipSwtch,
			new Label({
				text : "With Margin"
			}),
			oWithMarginCheckBox,
			oSizeLbl,
			oSizeButton
		]
	});
	var oPage = new Page("initial-page", {
		showHeader : false,
		content : [ oControlForm, oInputForm ]
	});
	//create a mobile App embedding the page and place the App into the HTML document
	new App("myApp", {
		pages : [oPage]
	}).placeAt("content");
	setBackgroundColor(oControlForm);
});
