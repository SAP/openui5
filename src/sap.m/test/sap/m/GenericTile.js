sap.ui.define([
	"sap/m/ActionSheet",
	"sap/m/App",
	"sap/m/Button",
	"sap/m/FeedContent",
	"sap/m/GenericTile",
	"sap/m/Input",
	"sap/m/Label",
	"sap/m/library",
	"sap/m/MessageToast",
	"sap/m/NewsContent",
	"sap/m/NumericContent",
	"sap/m/Page",
	"sap/m/Select",
	"sap/m/Switch",
	"sap/m/TextArea",
	"sap/m/TileContent",
	"sap/ui/core/Core",
	"sap/ui/core/Item",
	"sap/ui/core/Theming",
	"sap/ui/core/Title",
	"sap/ui/layout/Grid",
	"sap/ui/layout/form/SimpleForm",
	"sap/ui/model/json/JSONModel",
	"sap/ui/util/Mobile"
], function(
	ActionSheet,
	App,
	Button,
	FeedContent,
	GenericTile,
	Input,
	Label,
	mobileLibrary,
	MessageToast,
	NewsContent,
	NumericContent,
	Page,
	Select,
	Switch,
	TextArea,
	TileContent,
	oCore,
	Item,
	Theming,
	Title,
	Grid,
	SimpleForm,
	JSONModel,
	Mobile
) {
	"use strict";

	// shortcut for sap.m.InputType
	var InputType = mobileLibrary.InputType;

	// shortcut for sap.m.WrappingType
	var WrappingType = mobileLibrary.WrappingType;

	// shortcut for sap.m.DeviationIndicator
	var DeviationIndicator = mobileLibrary.DeviationIndicator;

	// shortcut for sap.m.ValueColor
	var ValueColor = mobileLibrary.ValueColor;

	// shortcut for sap.m.GenericTileScope
	var GenericTileScope = mobileLibrary.GenericTileScope;

	// shortcut for sap.m.LoadState
	var LoadState = mobileLibrary.LoadState;

	// shortcut for sap.m.FrameType
	var FrameType = mobileLibrary.FrameType;

	// shortcut for sap.m.GenericTileMode
	var GenericTileMode = mobileLibrary.GenericTileMode;

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

	var oGenericTileData = {
		mode : GenericTileMode.ContentMode,
		subheader : "Expenses By Region",
		header : "Comparative Annual Totals",
		tooltip : "",
		url : "",
		footerNum : "Actual and Target",
		footerComp : "Compare across regions",
		scale : "MM",
		unit : "EUR",
		value : "17Ñç",
		frameType : FrameType.OneByOne,
		state : LoadState.Loaded,
		scope : GenericTileScope.Display,
		valueColor : ValueColor.Error,
		indicator : DeviationIndicator.Up,
		title : "US Profit Margin",
		footer : "Current Quarter",
		description : "Maximum deviation",
		imageDescription : "",
		backgroundImage : "images/NewsImage1.png",
		width:"174px",
		additionalTooltip: "System U1Y",
		newsTileContent : [{
			footer : "August 21, 2013",
			contentText : "SAP Unveils Powerful New Player Comparison Tool Exclusively on NFL.com",
			subheader : "SAP News"
		}],
		newsTileContent1x1 : [{
			footer : "Footer text lorem ipsum dolor sit amet consectetur adipiscing elit",
			contentText : "Content text lorem ipsum dolor sit amet consectetur adipiscing elit",
			subheader : "Subheader text lorem ipsum dolor sit amet consectetur adipiscing elit"
		}],
		feedTileContent : [{
			footer : "New Notifications",
			contentText : "@@notify Great outcome of the Presentation today. New functionality well received.",
			subheader : "About 1 minute ago in Computer Market"
		}],
		frameTypes : [FrameType.OneByOne, FrameType.TwoByOne],
		indicators: Object.keys(DeviationIndicator),
		modes : Object.keys(GenericTileMode),
		states : Object.keys(LoadState),
		scopes : Object.keys(GenericTileScope),
		wrappingTypes: Object.keys(WrappingType),
		wrappingType: WrappingType.Normal
	};

	var fnPress = function(oEvent) {
		if ((oEvent.getParameter("scope") === GenericTileScope.Actions
			|| oEvent.getParameter("scope") === GenericTileScope.ActionMore)
			&& oEvent.getParameter("action") === "Press") {
			var oActionSheet = new ActionSheet({
				title : "Choose Your Action",
				showCancelButton : true,
				placement : "Bottom",
				buttons : [
					new Button({
						text : "Move"
					}),
					new Button({
						text : "Whatever"
					})
				],
				afterClose : function () {
					oActionSheet.destroy();
				}
			});
			oActionSheet.openBy(oEvent.getParameter("domRef"));
		} else {
			MessageToast.show("Action " + oEvent.getParameter("action") + " on " + oEvent.getSource().getId() + " pressed.");
		}
	};

	function setDefaultParameters(oData) {
		var sName;
		var oUriParameters = new URLSearchParams(window.location.search);

		for (sName in oData) {
			if (oData.hasOwnProperty(sName) && typeof oData[sName] === 'string') {
				if (oUriParameters.get(sName) !== null) {
					oData[sName] = oUriParameters.get(sName);
				}
			}
		}
	}

	setDefaultParameters(oGenericTileData);

	var oGenericTileModel = new JSONModel(oGenericTileData);

	var oNVConfContS = new NumericContent("numeric-cont-l", {
		value : "{/value}",
		scale : "{/scale}",
		indicator : "{/indicator}",
		formatterValue : "{/isFormatterValue}",
		truncateValueTo : "{/truncateValueTo}",
		valueColor : "{/valueColor}"
	});

	var oNVConfS = new TileContent("numeric-tile-cont-l", {
		unit : "{/unit}",
		footer : "{/footerNum}",
		content : oNVConfContS
	});

	var oGenericTile1 = new GenericTile({
		mode : "{/mode}",
		subheader : "{/subheader}",
		frameType : "{/frameType}",
		header : "{/header}",
		tooltip : "{/tooltip}",
		url : "{/url}",
		state : "{/state}",
		scope : "{/scope}",
		headerImage : "{/headerImage}",
		wrappingType: "{/wrappingType}",
		imageDescription : "{/imageDescription}",
		press : fnPress,
		failedText : "{/failedText}",
		additionalTooltip: "{/additionalTooltip}",
		tileContent : [oNVConfS]
	});
	oGenericTile1.addStyleClass("sapUiSmallMargin");

	var oNumCnt2x1 = new NumericContent("numeric-cont-2x1", {
		value : "-431.241.621,5",
		scale : "MM",
		indicator : "{/indicator}",
		truncateValueTo : 14,
		valueColor : "{/valueColor}",
		width : "100%"
	});

	var oTc2x1 = new TileContent("comp-tile-cont-2x1", {
		unit : "{/unit}",
		footer : "{/footerComp}",
		frameType : FrameType.TwoByOne,
		content : oNumCnt2x1
	});

	var oGenericTile2 = new GenericTile({
		mode : "{/mode}",
		tooltip : "{/tooltip}",
		url : "{/url}",
		subheader : "{/subheader}",
		frameType : FrameType.TwoByOne,
		header : "{/header}",
		state : "{/state}",
		scope : "{/scope}",
		headerImage : "{/headerImage}",
		imageDescription : "{/imageDescription}",
		wrappingType: "{/wrappingType}",
		press : fnPress,
		failedText : "{/failedText}",
		additionalTooltip: "{/additionalTooltip}",
		tileContent : [oTc2x1]
	});
	oGenericTile2.addStyleClass("sapUiSmallMargin");

	var oGenericTile3 = new GenericTile({
		mode : "{/mode}",
		tooltip : "{/tooltip}",
		url : "{/url}",
		frameType : FrameType.TwoByOne,
		state : "{/state}",
		scope : "{/scope}",
		headerImage : "{/headerImage}",
		imageDescription : "{/imageDescription}",
		backgroundImage : "{/backgroundImage}",
		wrappingType: "{/wrappingType}",
		press : fnPress,
		failedText : "{/failedText}",
		additionalTooltip: "{/additionalTooltip}",
		tileContent : {
			template : new TileContent("news-tile-cont-2x1",{
				footer : "{footer}",
				frameType : FrameType.TwoByOne,
				content : new NewsContent({
					contentText : "{contentText}",
					subheader : "{subheader}"
				})
			}),
			path : "/newsTileContent"
		}
	});
	oGenericTile3.addStyleClass("sapUiSmallMargin");

	var oFeedTileContent = new TileContent("feed-tile-cont-2x1", {
		footer : "{footer}",
		frameType : FrameType.TwoByOne,
		content : new FeedContent({
			contentText : "{contentText}",
			subheader : "{subheader}"
		})
	});

	var oGenericTile4 = new GenericTile({
		mode : "{/mode}",
		tooltip : "{/tooltip}",
		url : "{/url}",
		header : "{/header}",
		subheader : "{/subheader}",
		frameType : FrameType.TwoByOne,
		state : "{/state}",
		scope : "{/scope}",
		headerImage : "{/headerImage}",
		imageDescription : "{/imageDescription}",
		wrappingType: "{/wrappingType}",
		press : fnPress,
		failedText : "{/failedText}",
		additionalTooltip: "{/additionalTooltip}",
		tileContent : {
			template : oFeedTileContent,
			path : "/feedTileContent"
		}
	});
	oGenericTile4.addStyleClass("sapUiSmallMargin");

	var oGenericTile5 = new GenericTile({
		mode : "{/mode}",
		tooltip : "{/tooltip}",
		url : "{/url}",
		frameType : FrameType.OneByOne,
		state : "{/state}",
		scope : "{/scope}",
		headerImage : "{/headerImage}",
		imageDescription : "{/imageDescription}",
		backgroundImage : "{/backgroundImage}",
		wrappingType: "{/wrappingType}",
		press : fnPress,
		failedText : "{/failedText}",
		additionalTooltip: "{/additionalTooltip}",
		tileContent : {
			template : new TileContent("news-tile-cont-1x1",{
				footer : "{footer}",
				frameType : FrameType.OneByOne,
				content : new NewsContent({
					contentText : "{contentText}",
					subheader : "{subheader}"
				})
			}),
			path : "/newsTileContent1x1"
		}
	});
	oGenericTile5.addStyleClass("sapUiSmallMargin");

	var oModeLabel = new Label({
		id: "mode-label",
		text: "Mode"
	});

	var oModeSelect = new Select({
		items: {
			path: "/modes",
			template: new Item({
				key: "{}",
				text: "{}"
			})
		},
		selectedKey: "{/mode}"
	});

	var oTitleLbl = new Label({
		text : "Header",
		labelFor : "title-value"
	});

	var oTitleInput = new Input("title-value", {
		type : InputType.Text,
		placeholder : 'Enter header ...'
	});
	oTitleInput.bindValue("/header");

	var oAdditionalTooltipLbl = new Label({
		text : "Tooltip to be added",
		labelFor : "additionalTooltip-value"
	});

	var oAdditionalTooltipInput = new Input("additionalTooltip-value", {
		type : InputType.Text,
		placeholder : 'Enter additional tooltip ...'
	});
	oAdditionalTooltipInput.bindValue("/additionalTooltip");

	var oImgSrc = new Label({
		text : "Background Image",
		labelFor : "backgroundImage-value"
	});

	var oImgSrcInput = new Input("backgroundImage-value", {
		type : InputType.Text,
		placeholder : 'Enter URL...'
	});
	oImgSrcInput.bindValue("/backgroundImage");

	var oTitleDscr = new Label({
		text : "Subheader",
		labelFor : "desc-value"
	});

	var oTooltipLbl = new Label({
		text : "Tooltip",
		labelFor : "tooltip-value"
	});

	var oTooltipInput = new Input("tooltip-value", {
		type : InputType.Text,
		placeholder : 'Enter tooltip ...'
	});
	oTooltipInput.bindValue("/tooltip");

	var oUrlLbl = new Label({
		text : "Url",
		labelFor : "url-value"
	});

	var oUrlInput = new Input("url-value", {
		type : InputType.Url,
		placeholder : "Enter an url..."
	});
	oUrlInput.bindValue("/url");

	var oUpdateValueLbl = new Label({
		text : "Update Value",
		labelFor : "update-value"
	});

	var oUpdateValueInput = new Input("update-value", {
		type : InputType.Text,
		placeholder : 'Enter value for update ...'
	});
	oUpdateValueInput.bindValue("/value");

	var oDescInput = new Input("desc-value", {
		type : InputType.Text,
		placeholder : 'Enter description ...'
	});
	oDescInput.bindValue("/subheader");

	var oTitleFoot = new Label({
		text : "Footers",
		labelFor : "footer-value"
	});

	var oFooterInputNum = new Input("footer-num-value", {
		type : InputType.Text,
		placeholder : 'Enter Numeric Footer ...'
	});
	oFooterInputNum.bindValue("/footerNum");

	var oFooterInputComp = new Input("footer-cmp-value", {
		type : InputType.Text,
		placeholder : 'Enter Comp Footer ...'
	});
	oFooterInputComp.bindValue("/footerComp");

	var oTitleUnit = new Label({
		text : "Units",
		labelFor : "unit-value"
	});

	var oUnitInput = new Input("unit-value", {
		type : InputType.Text,
		placeholder : 'Enter Units ...'
	});
	oUnitInput.bindValue("/unit");

	var oFrameTypeLabel = new Label({
		text : "Frame Type",
		labelFor : "ft-value"
	});

	var oFrameTypeSelect = new Select("ft-value", {
		items: {
			path: "/frameTypes",
			template: new Item({
				key: "{}",
				text: "{}"
			})
		},
		selectedKey: "{/frameType}"
	});

	var oPictureLbl = new Label({
		text : "Header Image",
		labelFor : "picture-change"
	});

	var oPictureSlct = new Select("picture-value", {
		change : function(oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			oGenericTileData.headerImage = oSelectedItem.getKey();
			oGenericTileModel.checkUpdate();
		},
		items : [new Item("picture-item-1", {
			key : "",
			text : "No picture"
		}), new Item("picture-item-2", {
			key : "images/grass.jpg",
			text : "Image1"
		}), new Item("picture-item-3", {
			key : "images/headerImg1.png",
			text : "Image2"
		}), new Item("picture-item-4", {
			key : "images/headerImg2.jpg",
			text : "Image3"
		}), new Item("picture-item-5", {
			key : "sap-icon://world",
			text : "Icon1"
		}), new Item("picture-item-6", {
			key : "sap-icon://customer-financial-fact-sheet",
			text : "Icon2"
		}) ],
		selectedItem : "picture-item-1"
	});

	var oImageDescLbl = new Label({
		text : "Image Description",
		labelFor : "imageDesc"
	});

	var oImageDescInput = new TextArea("imageDesc", {
		rows : 1,
		placeholder : '',
		value : "{/imageDescription}"
	});

	var oStateLabel = new Label({
		text : "State",
		labelFor : "loading-state"
	});

	var oStateSelect = new Select("loading-state", {
		items: {
			path: "/states",
			template: new Item({
				key: "{}",
				text: "{}"
			})
		},
		selectedKey: "{/state}"
	});

	var oScopeLabel = new Label({
		text : "Scope",
		labelFor : "scope"
	});

	var oScopeSelect = new Select({
		items: {
			path: "/scopes",
			template: new Item({
				key: "{}",
				text: "{}"
			})
		},
		selectedKey: "{/scope}"
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
				oGenericTile1.attachPress(fnPress);
				oGenericTile2.attachPress(fnPress);
				oGenericTile3.attachPress(fnPress);
			} else {
				oGenericTile1.detachPress(fnPress);
				oGenericTile2.detachPress(fnPress);
				oGenericTile3.detachPress(fnPress);
			}
		}
	});

	var oIndicatorLabel = new Label({
		id: "indicator-label",
		text: "Indicator"
	});

	var oIndicatorSelect = new Select({
		items: {
			path: "/indicators",
			template: new Item({
				key: "{}",
				text: "{}"
			})
		},
		selectedKey: "{/indicator}"
	});

	var oFailedLabel = new Label({
		text : "Failed Text",
		labelFor : "failed-text"
	});

	var oFailedInput = new Input("failed-text", {
		type : InputType.Text,
		placeholder : 'Enter failed message...'
	});
	oFailedInput.bindValue("/failedText");

	var oSizeLbl = new Label({
		text : "Size",
		labelFor : "size-button"
	});

	var bBtnEnabled = (window.innerWidth < 375) ? false : true;
	var oSizeBtn = new Button("size-button", {
		press : function(oEvent) {
			var sTheme = Theming.getTheme();
			Theming.setTheme(sTheme);
			var url = window.location.href;
			//Popup dimensions issue in chrome while using noopener: Chromium bug id=1011688
			window.open(url, "", "height=900,width=370,top=0,left=0,toolbar=no,menubar=no,noopener,noreferrer");
		},
		enabled: bBtnEnabled,
		text: "Open new page with small screen size",
		width: "300px"
	});

	var oControlForm = new Grid("numeric-content-form", {
		defaultSpan : "XL4 L4 M6 S12",
		content : [oGenericTile1, oGenericTile2, oGenericTile3, oGenericTile4, oGenericTile5]
	});

	var oWrappingLabel = new Label({
		text: "Wrapping Type",
		labelFor: "wrapping-type"
	});

	var oWrappingSelect = new Select({
		items: {
			path: "/wrappingTypes",
			template: new Item({
				key: "{}",
				text: "{}"
			})
		},
		selectedKey: "{/wrappingType}"
	});

	var editableSimpleForm = new SimpleForm("controls", {
		maxContainerCols : 2,
		editable : true,
		content : [new Title({ // this starts a new group
			text : "Modify Tile"
		}), oModeLabel, oModeSelect, oTitleLbl, oTitleInput, oTitleDscr, oDescInput, oAdditionalTooltipLbl, oAdditionalTooltipInput, oImgSrc, oImgSrcInput, oTitleFoot, oFooterInputNum, oFooterInputComp, oTooltipLbl, oTooltipInput, oUrlLbl,
			oUrlInput, oUpdateValueLbl, oUpdateValueInput, oTitleUnit, oUnitInput, oFailedLabel, oFailedInput, oFrameTypeLabel, oFrameTypeSelect, oPictureLbl, oPictureSlct,oImageDescLbl,
			oImageDescInput, oStateLabel, oStateSelect, oScopeLabel, oScopeSelect, oPressLbl, oPressSwtch, oIndicatorLabel, oIndicatorSelect, oSizeLbl, oSizeBtn, oWrappingLabel, oWrappingSelect
		]
	});

	var oPage = new Page("initial-page", {
		showHeader : false,
		content : [oControlForm, editableSimpleForm]
	});
	oPage.setModel(oGenericTileModel);

	//create a mobile App embedding the page and place the App into the HTML document
	new App("myApp", {
		pages : [oPage]
	}).placeAt("content");
	setBackgroundColor(oPage);
});
