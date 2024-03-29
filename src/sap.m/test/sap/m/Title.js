sap.ui.require([
	"sap/ui/model/json/JSONModel",
	"sap/ui/layout/form/SimpleForm",
	"sap/m/Label",
	"sap/m/Input",
	"sap/m/CheckBox",
	"sap/ui/core/Item",
	"sap/m/ComboBox",
	"sap/m/Page",
	"sap/m/App",
	"sap/ui/core/library",
	"sap/m/Title",
	"sap/ui/core/HTML",
	"sap/m/VBox"
], function (
	JSONModel,
	SimpleForm,
	Label,
	Input,
	CheckBox,
	Item,
	ComboBox,
	Page,
	App,
	coreLibrary,
	Title,
	HTML,
	VBox
) {
	"use strict";
	var TitleLevel = coreLibrary.TitleLevel;

	var oContent = new VBox("content"),
		iIdCounter = 0,
		oData = {
			text: "This is the text of the title, but in some specific cases it can be very long.",
			width: "",
			visible: true,
			wrapping: false,
			wrappingType: "Normal",
			dir: "Inherit",
			align: "Initial",
			level: "Auto"
		};

	var	oModel = new JSONModel();
	oModel.setData(oData);

	var oSettingsForm = new SimpleForm({
		editable: true,
		layout: "ResponsiveGridLayout",
					width: "50%",
					labelSpanS: 4,
					labelSpanM: 2,
					labelSpanL: 2,
					labelSpanXL: 2,
		content: [
			new Label({editable: false, text: "Text"}),
			new Input("setting1_text", {value: "{/text}"}),
			new Label({text: "Width" }),
			new Input("setting2_width", {value: "{/width}"}),
			new Label({text: "Visible"}),
			new CheckBox("setting3_visible", {selected: "{/visible}"}),
			new Label({text: "Text direction"}),
			new ComboBox("setting_dir", {
				value: "{/dir}",
				items: [
					new Item({text: "Inherit", key: "Inherit"}),
					new Item({text: "LTR", key: "LTR"}),
					new Item({text: "RTL", key: "RTL"})
				]
			}),
			new Label({text: "Align"}),
			new ComboBox("setting4_align", {
				value: "{/align}",
				items: [
					new Item({text: "Begin", key: "Begin"}),
					new Item({text: "End", key: "End"}),
					new Item({text: "Left", key: "Left"}),
					new Item({text: "Right", key: "Right"}),
					new Item({text: "Center", key: "Center"}),
					new Item({text: "Initial", key: "Initial"})
				]
			}),
			new Label({text: "Level"}),
			new ComboBox("setting5_level", {
				value: "{/level}",
				items: [
					new Item({text: "Auto"}),
					new Item({text: "H1"}),
					new Item({text: "H2"}),
					new Item({text: "H3"}),
					new Item({text: "H4"}),
					new Item({text: "H5"}),
					new Item({text: "H6"})
				]
			}),
			new Label({text: "Wrapping"}),
			new CheckBox("setting6_wrapping", {selected: "{/wrapping}"}),
			new Label({text: "WrappingType"}),
			new Input("setting7_wrappingType", {value: "{/wrappingType}"}),
			new Label({text: "Bar Context"}),
			new CheckBox("setting9_barContext", {
				select: function () {
					oContent.$().children().toggleClass("sapMIBar-CTX");
				}
			}),
			new Label({text: "Toolbar Context"}),
			new CheckBox("setting10_toolbarContext", {
				select: function () {
					oContent.$().children().toggleClass("sapMTB-Transparent-CTX");
				}
			})
		]
	}).addStyleClass("sapUiSizeCompact");

	var oPage = new Page({
		title: "Test Page for sap.m.Title",
		content: [
			oSettingsForm,
			new HTML({ content: "<hr/>"}),
			oContent
		]
	});

	// create content
	for (var level in TitleLevel) {
		var oTitle = new Title("title" + iIdCounter, {
			titleStyle: level,
			tooltip: "Title with style '" + level + "'",
			text: "{/text}",
			width: "{/width}",
			visible: "{/visible}",
			wrapping: "{/wrapping}",
			wrappingType: "{/wrappingType}",
			textDirection: "{/dir}",
			textAlign: "{/align}",
			level: "{/level}"
		});

		oContent.addItem(new HTML({ content: "<hr/>"}));
		oContent.addItem(oTitle);
		iIdCounter++;
	}

	// Tests rtl support with mixed texts
	var aMixedTexts = [
			"כמה שפות אתה מדבר? English ועברית.",
			"Do you speak any RTL languages? כן אני כן."
		],
		oContentMixedTexts = new VBox("content-mixed-texts");

	aMixedTexts.forEach(function (sMixedText, iInd) {
		var oTitle = new Title("titleMixed" + iInd, {
			tooltip: "Title for testing mixed ltr and rtl languages",
			text: sMixedText,
			width: "{/width}",
			visible: "{/visible}",
			wrapping: "{/wrapping}",
			wrappingType: "{/wrappingType}",
			textDirection: "{/dir}",
			textAlign: "{/align}"
		});

		oContentMixedTexts.addItem(oTitle);
	});

	oContent.addItem(new HTML({ content: "<hr/>"}));
	oContent.addItem(oContentMixedTexts);

	var oApp = new App({
		pages : [oPage]
	});
	oApp.setModel(oModel);
	oApp.placeAt("body");
});