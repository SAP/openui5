sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/m/CheckBox",
	"sap/m/Page",
	"sap/m/App",
	"sap/f/GridList",
	"sap/f/GridListItem",
	"sap/m/Text",
	"sap/m/SegmentedButton",
	"sap/m/SegmentedButtonItem"
], function (
	JSONModel,
	CheckBox,
	Page,
	App,
	GridList,
	GridListItem,
	Text,
	SegmentedButton,
	SegmentedButtonItem
) {
	"use strict";
	var oData = [
		{
			"counter": 5,
			"highlight": "Error",
			"type": "Active"
		},
		{
			"highlight": "Warning",
			"type": "Active"
		},
		{
			"counter": 15734,
			"highlight": "None"
		},
		{
			"highlight": "Success",
			"type": "Navigation",
			"type": "Detail"
		},
		{
			"counter": 1,
			"type": "Navigation"
		}
	];

	var	oModel = new JSONModel();
	oModel.setData(oData);

	var oGridList = new GridList("gridList", {
		mode: "None",
		items: {
			path: "/",
			template: new GridListItem({
				counter: "{counter}",
				highlight: "{highlight}",
				type: "{type}",
				content: [
					new Text({ text: "The content can be any control "}).addStyleClass("sapUiSmallMargin")
				]
			})
		}
	});

	var oSegmentedButton = new SegmentedButton({
		items: [
			new SegmentedButtonItem("noneMode", { text: "None" }),
			new SegmentedButtonItem("deleteMode", { text: "Delete" }),
			new SegmentedButtonItem("singleSelectLeftMode", { text: "SingleSelectLeft" }),
			new SegmentedButtonItem("multiSelectMode", { text: "MultiSelect" }),
			new SegmentedButtonItem("singleSelectMasterMode", { text: "SingleSelectMaster" })
		],
		selectionChange: function (oEvent) {
			oGridList.setMode(oEvent.getParameter("item").getText());
			oGridList.getItems()[1].setSelected(true);
		}
	});

	var oPage = new Page({
		title: "Test Page for sap.f.GridListItem",
		content: [ oGridList ],
		headerContent: [ oSegmentedButton ]
	}).addStyleClass("sapUiContentPadding");

	new App({
		pages: [ oPage ]
	}).setModel(oModel).placeAt("body");
});