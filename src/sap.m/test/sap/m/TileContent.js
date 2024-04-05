sap.ui.define([
	"sap/m/library",
	"sap/m/TileContent",
	"sap/m/NewsContent",
	"sap/m/FeedContent",
	"sap/m/NumericContent",
	"sap/ui/core/Theming",
	"sap/ui/model/json/JSONModel",
	"sap/m/Label",
	"sap/m/Input",
	"sap/m/Select",
	"sap/ui/core/Core",
	"sap/ui/core/Item",
	"sap/m/Button",
	"sap/m/Switch",
	"sap/ui/layout/form/SimpleForm",
	"sap/ui/core/Title",
	"sap/m/FlexBox",
	"sap/ui/layout/ResponsiveFlowLayoutData",
	"sap/m/Page",
	"sap/m/App",
	"sap/ui/util/Mobile"
], function(
	mobileLibrary,
	TileContent,
	NewsContent,
	FeedContent,
	NumericContent,
	Theming,
	JSONModel,
	Label,
	Input,
	Select,
	oCore,
	Item,
	Button,
	Switch,
	SimpleForm,
	Title,
	FlexBox,
	ResponsiveFlowLayoutData,
	Page,
	App,
	Mobile
) {
	"use strict";

	// shortcut for sap.m.InputType
	var InputType = mobileLibrary.InputType;

	// shortcut for sap.m.ValueColor
	var ValueColor = mobileLibrary.ValueColor;

	// shortcut for sap.m.DeviationIndicator
	var DeviationIndicator = mobileLibrary.DeviationIndicator;

	// shortcut for sap.m.LoadState
	var LoadState = mobileLibrary.LoadState;

	Mobile.init();
	var oConfData = {
		scale: "MM",
		unit: "EUR",
		state: LoadState.Loaded,
		indicator: DeviationIndicator.None,
		value: "2435",
		footer: "Current Quarter",
		footerColor: ValueColor.Neutral,
		jc: {
			contentText: "@@notify Great outcome of the Presentation today. The new functionality and the design was well received. Berlin, Tokyo, Rome, Budapest, New York, Munich, London",
			subheader: "about 1 minute ago in Computer Market",
			value: "9"
		},
		nc: {
			contentText: "SAP Unveils Powerful New Player Comparison Tool Exclusively on NFL.com",
			subheader: "SAP News"
		}
	};

	var oNewsTileContent = new TileContent({
		footer: "{/footer}",
		footerColor: "{/footerColor}",
		unit: "{/unit}",
		content: new NewsContent({
			contentText: "{/nc/contentText}",
			subheader: "{/nc/subheader}"
		})
	});
	oNewsTileContent.addStyleClass("sapUiSmallMargin");

	var oFeedTileContent = new TileContent({
		footer: "{/footer}",
		footerColor: "{/footerColor}",
		unit: "{/unit}",
		content: new FeedContent({
			contentText: "{/jc/contentText}",
			subheader: "{/jc/subheader}",
			value: "{/jc/value}"
		})
	});
	oFeedTileContent.addStyleClass("sapUiSmallMargin");

	var oNVConfContS = new NumericContent("configurable-tile-cont-S", {
		value: "{/value}",
		scale: "{/scale}",
		indicator: "{/indicator}",
		formatterValue: "{/isFormatterValue}",
		truncateValueTo: "{/truncateValueTo}"
	});

	var oNVConfS = new TileContent("configurable-tile-num-cont-S", {
		unit: "{/unit}",
		footer: "{/footer}",
		footerColor: "{/footerColor}",
		content: oNVConfContS
	});
	oNVConfS.addStyleClass("sapUiSmallMargin");

	var oConfModel = new JSONModel();
	oConfModel.setData(oConfData);

	var oUnitLbl = new Label({
		text: "Unit",
		labelFor: "unit-value"
	});
	var oUnitInput = new Input("unit-value", {
		type: InputType.Text,
		placeholder: "Enter unit ..."
	});
	oUnitInput.bindValue("/unit");

	var oFooterLbl = new Label({
		text: "Footer",
		labelFor: "footer-value"
	});

	var oFooterInput = new Input("footer-value", {
		type: InputType.Text,
		placeholder: "Enter footer ..."
	});
	oFooterInput.bindValue("/footer");

	var oValueColorLabel = new Label({
		text: "Value Color",
		labelFor: "value-color-change"
	});
	var oValueColorSelect = new Select("value-color-change", {
		change: function(event) {
			var sSelectedItem = event.getParameter("selectedItem").getKey();
			oConfData.footerColor = sSelectedItem;
			oConfModel.checkUpdate();
		},
		items: [
			new Item({
				key: ValueColor.Neutral,
				text: ValueColor.Neutral
			}),
			new Item({
				key: ValueColor.Good,
				text: ValueColor.Good
			}),
			new Item({
				key: ValueColor.Critical,
				text: ValueColor.Critical
			}),
			new Item({
				key: ValueColor.Error,
				text: ValueColor.Error
			})
		],
		selectedKey: ValueColor.Neutral
	});

	var oSizeLbl = new Label({
		text: "Size",
		labelFor: "size-button"
	});

	var bBtnEnabled = (window.innerWidth < 375) ? false : true;
	var oSizeBtn = new Button("size-button", {
		press: function(oEvent) {
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

	var oRenderFooterLbl = new Label({
		text: "Render Footer",
		labelFor: "footer-rendering-button"
	});

	var oRenderFooterSwitch = new Switch({
		id: "footer-rendering-button",
		state: true,
		change: function(oEvent) {
			var bState = oEvent.getParameter("state");
			oNewsTileContent.setRenderFooter(bState);
			oNewsTileContent.invalidate();
			oFeedTileContent.setRenderFooter(bState);
			oFeedTileContent.invalidate();
			oNVConfS.setRenderFooter(bState);
			oNVConfS.invalidate();
		}
	});

	var editableSimpleForm = new SimpleForm("controls", {
		maxContainerCols: 2,
		editable: true,
		content: [
			new Title({ // this starts a new group
				text: "Modify Tiles"
			}), oUnitLbl, oUnitInput, oFooterLbl, oFooterInput, oValueColorLabel, oValueColorSelect,
			oRenderFooterLbl, oRenderFooterSwitch, oSizeLbl, oSizeBtn
		]
	});

	var buildTC = function(oContent) {
		return new FlexBox({
			items: [oContent],
			layoutData: new ResponsiveFlowLayoutData({
				minWidth: 400
			}),
			height: "150px"
		});
	};

	var oControlForm = new SimpleForm("tile-content-form", {
		content: [buildTC(oNVConfS), buildTC(oFeedTileContent), buildTC(oNewsTileContent)]
	});

	var oPage = new Page("initial-page", {
		showHeader: false,
		content: [oControlForm, editableSimpleForm]
	});
	oPage.setModel(oConfModel);

	//create a mobile App embedding the page and place the App into the HTML document
	new App("myApp", {
		pages: [oPage]
	}).placeAt("content");
});
