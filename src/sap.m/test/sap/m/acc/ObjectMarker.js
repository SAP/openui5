sap.ui.define([
	"sap/m/library",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/List",
	"sap/m/ObjectListItem",
	"sap/ui/core/library",
	"sap/ui/layout/VerticalLayout",
	"sap/m/ObjectAttribute",
	"sap/m/ObjectStatus",
	"sap/m/ObjectMarker",
	"sap/m/Panel",
	"sap/m/Page",
	"sap/m/App"
], function(
	mobileLibrary,
	JSONModel,
	MessageToast,
	List,
	ObjectListItem,
	coreLibrary,
	VerticalLayout,
	ObjectAttribute,
	ObjectStatus,
	ObjectMarker,
	Panel,
	Page,
	App
) {
	"use strict";

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	// shortcut for sap.ui.core.TitleLevel
	var TitleLevel = coreLibrary.TitleLevel;

	// shortcut for sap.m.ObjectMarkerType
	var ObjectMarkerType = mobileLibrary.ObjectMarkerType;

	var aData = [
		{ id: 1, lastName: "Dente", name: "Al", type: ObjectMarkerType.Draft},
		{ id: 2, lastName: "Friese", name: "Andy", type: ObjectMarkerType.Favorite},
		{ id: 3, lastName: "Mann", name: "Anita", type: ObjectMarkerType.Flagged},
		{ id: 4, lastName: "Schutt", name: "Doris", type: ObjectMarkerType.Locked},
		{ id: 5, lastName: "Open", name: "Doris", type: ObjectMarkerType.LockedBy},
		{ id: 6, lastName: "Smith", name: "John", type: ObjectMarkerType.Unsaved},
		{ id: 7, lastName: "James", name: "Margaret", type: ObjectMarkerType.UnsavedBy}
	];
	var aMarkerTypes = [
		{type: ObjectMarkerType.Draft},
		{type: ObjectMarkerType.Favorite},
		{type: ObjectMarkerType.Flagged},
		{type: ObjectMarkerType.Locked},
		{type: ObjectMarkerType.LockedBy},
		{type: ObjectMarkerType.Unsaved},
		{type: ObjectMarkerType.UnsavedBy}
	];

	var oModel = new JSONModel();
	oModel.setData({ exampleData: aData, markerTypes: aMarkerTypes });

	var oActiveMarkerHandler = function(oEvent) {
		MessageToast.show(oEvent.getParameter("type") + " marker pressed!");
	};

	var oList = new List();
	oList.bindItems("/exampleData", new ObjectListItem({
		title : "Example OLI",
		number : "100",
		numberUnit : "$",
		intro : "OLI intro text",
		icon : "sap-icon://action",
		numberState : ValueState.Warning,
		attributes : [
			new ObjectAttribute({
				text: "First Object Attribute"
			}),
			new ObjectAttribute({
				text: "Second Object Attribute"
			})
		],
		firstStatus : new ObjectStatus({
			text: "First Object Status",
			state: ValueState.Success
		}),
		secondStatus : new ObjectStatus({
			text: "Second Object Status",
			state: ValueState.Error
		}),
		markers: {
			path: '/markerTypes',
			templateShareable: false,
			template: new ObjectMarker({
				type: "{type}"
			})
		}
	}));

	var oActiveList = new List();
	oActiveList.bindItems("/exampleData", new ObjectListItem({
		title : "Example OLI",
		number : "100",
		numberUnit : "$",
		intro : "OLI intro text",
		icon : "sap-icon://action",
		numberState : ValueState.Warning,
		attributes : [
			new ObjectAttribute({
				text: "First Object Attribute"
			}),
			new ObjectAttribute({
				text: "Second Object Attribute"
			})
		],
		firstStatus : new ObjectStatus({
			text: "First Object Status",
			state: ValueState.Success
		}),
		secondStatus : new ObjectStatus({
			text: "Second Object Status",
			state: ValueState.Error
		}),
		markers: {
			path: '/markerTypes',
			templateShareable: false,
			template: new ObjectMarker({
				type: "{type}",
				press: oActiveMarkerHandler
			})
		}
	}));

	var oStandalonePanel = new Panel("standalone-panel", {
		headerText: "Standalone use case",
		content: [
			new Panel({
				headerText: "Non-interactive markers",
				content: {
					path: "/markerTypes",
					templateShareable: false,
					template: new ObjectMarker({
						type: "{type}"
					})
				}
			})
		]
	});

	var oObjectListItemPanel = new Panel({
		headerText: "In a ObjectListItem use case",
		content: [
			new Panel({
				headerText: "Non-Interactive Markers",
				content: oList
			})
		]
	});

	var oPageLayout = new VerticalLayout({
		content: [
			oStandalonePanel,
			oObjectListItemPanel
		]
	}).addStyleClass("sapUiContentPadding");

	var oPage = new Page("page", {
		title:"ObjectMarker Accessibility Test Page",
		titleLevel: TitleLevel.H1,
		content: [
			oPageLayout
		]
	});

	new App({
		pages: [oPage] ,
		models: oModel
	}).placeAt("body");
});
