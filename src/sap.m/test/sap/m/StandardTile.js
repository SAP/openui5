sap.ui.define(["sap/ui/core/IconPool", "sap/m/StandardTile", "sap/m/App", "sap/m/Page", "sap/m/TileContainer"], function(IconPool, StandardTile, App, Page, TileContainer) {
	"use strict";

	function handlePress(oEvent) {
		//alert('tile ' + oEvent.getSource().getTitle() + ' pressed');
	}

	var tiles = [];

	var worstCase = new StandardTile("worst_case", {
		icon : IconPool.getIconURI("inbox"),
		number : "999,999,999",
		numberUnit : "ÑpQrtasbdcsytes",
		title : "ÑagçyfLoremipsumTitleÑag text",
		info : "Four score and seven years ago",
		infoState : "Success",
		press : handlePress
	});
	tiles.push(worstCase);

	var largeNum = new StandardTile("large_num", {
		icon : IconPool.getIconURI("inbox"),
		number : "90,0",
		numberUnit : "euro",
		title : "Ñagçyf Lorem ipsum Title Ñagçyfox text",
		info : "1 day ago"
	});
	tiles.push(largeNum);

	var mediumNum = new StandardTile("medium_num", {
		icon : IconPool.getIconURI("inbox"),
		number : "9000090",
		numberUnit : "euro",
		title : "Ñagçyf Lorem ipsum Title Ñagçyfox text",
		info : "1 day ago",
		infoState : "Warning"
	});
	tiles.push(mediumNum);

	var titleOnly = new StandardTile("title_only", {
		title : "Ñagçyf Lorem ipsum Title Ñagçyfox text"
	});
	tiles.push(titleOnly);


	var iconOnlyTopRow = new StandardTile("icon_only_top_row", {
		type : "Create",
		title : "Create Purchase Orders",
		info : "4 Requisitions Released"
	});
	tiles.push(iconOnlyTopRow);

	var iconTitle = new StandardTile("icon_title", {
		icon : IconPool.getIconURI("inbox"),
		title : "Open Purchase Orders",
		type : "Monitor"
	});
	tiles.push(iconTitle);

	var iconNumTitle = new StandardTile("icon_num_title", {
		icon : IconPool.getIconURI("inbox"),
		number : "2226,7",
		numberUnit : "euro",
		title : "Late Purchase Orders"
	});
	tiles.push(iconNumTitle);

	var iconNumTitleInfo = new StandardTile("icon_num_title_info", {
		icon : IconPool.getIconURI("inbox"),
		number : "9999",
		title : "Overdue Purchase Requisitions",
		info : "Ñagçyf status",
		infoState : "Error"
	});
	tiles.push(iconNumTitleInfo);

	var numericallyLargeNum = new StandardTile("numerically_large_num", {
		icon : IconPool.getIconURI("inbox"),
		number : "99999999999",
		numberUnit : "euro",
		title : "Max numerically large number",
		info : "Four score and seven years ago",
		infoState : "Success"
	});
	tiles.push(numericallyLargeNum);

	var app = new App();
	var page = new Page({
		enableScrolling : false,
		showHeader: true,
		title: "Some Standard Tiles",
		content: [
			new TileContainer({ tiles: tiles })
		]
	});

	app.setInitialPage(page.getId());
	app.addPage(page);
	app.placeAt('body');
});
