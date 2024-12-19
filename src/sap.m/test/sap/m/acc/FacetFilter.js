sap.ui.define([
	"sap/m/App",
	"sap/m/Page",
	"sap/m/FacetFilter",
	"sap/m/FacetFilterList",
	"sap/m/FacetFilterItem",
	"sap/m/VBox",
	"sap/ui/core/Element",
	"sap/m/library",
	"sap/ui/core/library"
], function(App, Page, FacetFilter, FacetFilterList, FacetFilterItem, VBox, Element, mobileLibrary, coreLibrary) {
	"use strict";

	// shortcut for sap.ui.core.TitleLevel
	var TitleLevel = coreLibrary.TitleLevel;

	// shortcut for sap.m.FacetFilterType
	var FacetFilterType = mobileLibrary.FacetFilterType;

	var handleFacetFilterReset = function(oEvent) {
		var oFacetFilter = Element.getElementById(oEvent.getParameter("id")),
			aFacetFilterLists = oFacetFilter.getLists();

		for (var i = 0; i < aFacetFilterLists.length; i++) {
			aFacetFilterLists[i].setSelectedKeys();
		}
	};

	var oFF1 = new FacetFilter({
		showPersonalization : true,
		liveSearch : false,
		showPopoverOKButton: true,
		reset: handleFacetFilterReset
	});

	var oFFL1 = new FacetFilterList({
		title: "Products",
		key: "ProductID",
		items: [
			new FacetFilterItem({key: "1", text: "Notebooks"}),
			new FacetFilterItem({key: "2", text: "Desktops"}),
			new FacetFilterItem({key: "3", text: "Tablets"}),
			new FacetFilterItem({key: "4", text: "Monitors"}),
			new FacetFilterItem({key: "5", text: "Printers"}),
			new FacetFilterItem({key: "6", text: "Scanners"}),
			new FacetFilterItem({key: "7", text: "Projectors"}),
			new FacetFilterItem({key: "8", text: "Telephones"}),
			new FacetFilterItem({key: "9", text: "Accessories"}),
			new FacetFilterItem({key: "10", text: "Software"}),
			new FacetFilterItem({key: "11", text: "Books"}),
			new FacetFilterItem({key: "12", text: "Others"})
		]
	});

	oFF1.addList(oFFL1);

	var oFF2 = new FacetFilter({
		type: FacetFilterType.Light,
		showPersonalization : true,
		liveSearch : false,
		showPopoverOKButton: true,
		reset: handleFacetFilterReset
	});

	var oFFL2 = new FacetFilterList({
		title: "Products",
		key: "ProductID",
		items: [
			new FacetFilterItem({key: "1", text: "Notebooks"}),
			new FacetFilterItem({key: "2", text: "Desktops"}),
			new FacetFilterItem({key: "3", text: "Tablets"}),
			new FacetFilterItem({key: "4", text: "Monitors"}),
			new FacetFilterItem({key: "5", text: "Printers"}),
			new FacetFilterItem({key: "6", text: "Scanners"}),
			new FacetFilterItem({key: "7", text: "Projectors"}),
			new FacetFilterItem({key: "8", text: "Telephones"}),
			new FacetFilterItem({key: "9", text: "Accessories"}),
			new FacetFilterItem({key: "10", text: "Software"}),
			new FacetFilterItem({key: "11", text: "Books"}),
			new FacetFilterItem({key: "12", text: "Others"})
		]
	});

	oFF2.addList(oFFL2);

	var oPageLayout = new VBox({
		items: [
			oFF1,
			oFF2
		]
	}).addStyleClass("sapUiSmallMargin");

	var oApp = new App();
	var oPage = new Page({
		title: "FacetFilter Accessibility Test Page",
		titleLevel: TitleLevel.H1,
		content: oPageLayout
	});

	oApp.addPage(oPage);
	oApp.placeAt("body");
});
