sap.ui.define([
	"sap/ui/core/IconPool",
	"sap/m/StandardTile",
	"sap/m/App",
	"sap/m/Page",
	"sap/m/TileContainer",
	"sap/m/MessageToast",
	"sap/ui/core/library"
], function(
	IconPool,
	StandardTile,
	App,
	Page,
	TileContainer,
	MessageToast,
	coreLibrary
) {
	"use strict";

	// shortcut for sap.ui.core.TitleLevel
	var TitleLevel = coreLibrary.TitleLevel;

	function handlePress(oEvent) {
		MessageToast.show("AppointmentSelect event fired: " + oEvent.getSource().getTitle());
	}

	var worstCase = new StandardTile("worst_case", {
		icon : IconPool.getIconURI("inbox"),
		number : "999,999,999",
		numberUnit : "ÑpQrtasbdcsytes",
		title : "ÑagçyfLoremipsumTitleÑag text",
		info : "Four score and seven years ago",
		infoState : "Success",
		press : handlePress
	});

	var largeNum = new StandardTile("large_num", {
		icon : IconPool.getIconURI("inbox"),
		number : "90,0",
		numberUnit : "euro",
		title : "Ñagçyf Lorem ipsum Title Ñagçyfox text",
		info : "1 day ago",
		press : handlePress
	});

	var mediumNum = new StandardTile("medium_num", {
		icon : IconPool.getIconURI("inbox"),
		number : "9000090",
		numberUnit : "euro",
		title : "Ñagçyf Lorem ipsum Title Ñagçyfox text",
		info : "1 day ago",
		infoState : "Warning",
		press : handlePress
	});

	var titleOnly = new StandardTile("title_only", {
		title : "Ñagçyf Lorem ipsum Title Ñagçyfox text"
	});

	var iconOnlyTopRow = new StandardTile("icon_only_top_row", {
		type : "Create",
		title : "Create Purchase Orders",
		info : "4 Requisitions Released",
		press : handlePress
	});

	var iconTitle = new StandardTile("icon_title", {
		icon : IconPool.getIconURI("inbox"),
		title : "Open Purchase Orders",
		type : "Monitor",
		press : handlePress
	});

	var iconNumTitle = new StandardTile("icon_num_title", {
		icon : IconPool.getIconURI("inbox"),
		number : "2226,7",
		numberUnit : "euro",
		title : "Late Purchase Orders",
		press : handlePress
	});

	var iconNumTitleInfo = new StandardTile("icon_num_title_info", {
		icon : IconPool.getIconURI("inbox"),
		number : "9999",
		title : "Overdue Purchase Requisitions",
		info : "Ñagçyf status",
		infoState : "Error",
		press : handlePress
	});

	var numericallyLargeNum = new StandardTile("numerically_large_num", {
		icon : IconPool.getIconURI("inbox"),
		number : "99999999999",
		numberUnit : "euro",
		title : "Max numerically large number",
		info : "Four score and seven years ago",
		infoState : "Success",
		press : handlePress
	});

	var oTileContainer = new TileContainer({ tiles: [
		worstCase, largeNum, mediumNum, titleOnly, iconOnlyTopRow, iconTitle, iconNumTitle, iconNumTitleInfo, numericallyLargeNum
	]}).addStyleClass("sapUiMediumMargin");

	var oPage = new Page({
		enableScrolling : false,
		showHeader: true,
		title: "StandardTile Accessibility Test Page",
		titleLevel: TitleLevel.H1,
		content: [oTileContainer]
	});
	var oApp = new App();
	oApp.addPage(oPage);
	oApp.placeAt('body');
});
