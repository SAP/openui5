sap.ui.define([
	"sap/m/library",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/List",
	"sap/m/ObjectListItem",
	"sap/ui/core/library",
	"sap/m/ObjectAttribute",
	"sap/m/ObjectStatus",
	"sap/m/ObjectMarker",
	"sap/m/Table",
	"sap/m/Column",
	"sap/m/Label",
	"sap/m/ColumnListItem",
	"sap/m/Text",
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
	ObjectAttribute,
	ObjectStatus,
	ObjectMarker,
	Table,
	Column,
	Label,
	ColumnListItem,
	MText,
	Panel,
	Page,
	App
) {
	"use strict";

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

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
	sap.ui.getCore().setModel(oModel);

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

	var oTable = new Table({
		columns : [
			new Column({
				header : new Label({
					text: "Last name",
					wrapping: true
				})
			}),
			new Column({
				header : new Label({
					text: "First name",
					wrapping: true
				})
			}),
			new Column({
				header : new Label({
					text: "Non-interactive usage",
					wrapping: true
				})
			}),
			new Column({
				header : new Label({
					text: "Interactive usage",
					wrapping: true
				})
			})
		]
	});

	oTable.bindItems("/exampleData", new ColumnListItem({
		vAlign: "Middle",
		cells : [
			new MText({
				text : "{lastName}",
				wrapping : false
			}),
			new MText({
				text : "{name}",
				wrapping : false
			}),
			new ObjectMarker({
				type: "{type}"
			}),
			new ObjectMarker({
				type: "{type}",
				press: oActiveMarkerHandler
			})
		]
	}));

	var oStandalonePanel = new Panel("standalone-panel", {
		headerText: "Standalone use case",
		expandable: true,
		expanded: false,
		content: [
			new Panel({
				headerText: "Non-interactive markers",
				expandable: true,
				expanded: false,
				content: {
					path: "/markerTypes",
					templateShareable: false,
					template: new ObjectMarker({
						type: "{type}"
					})
				}
			}),
			new Panel({
				headerText: "Interactive markers",
				expandable: true,
				expanded: false,
				content: {
					path: "/markerTypes",
					templateShareable: false,
					template: new ObjectMarker({
						type: "{type}",
						press: oActiveMarkerHandler
					})
				}
			})
		]
	});

	var oObjectListItemPanel = new Panel({
		headerText: "In a ObjectListItem use case",
		expandable: true,
		expanded: false,
		content: [
			new Panel({
				headerText: "Non-Interactive Markers",
				expandable: true,
				expanded: false,
				content: oList
			}),
			new Panel({
				headerText: "Interactive Markers",
				expandable: true,
				expanded: false,
				content: oActiveList
			})
		]
	});

	var oTablePanel = new Panel({
		headerText: "In a Table use case",
		expandable: true,
		expanded: false,
		content: oTable
	});

	var oPage = new Page("page", {
		title:"Object Marker",
		content: [
			oStandalonePanel,
			oObjectListItemPanel,
			oTablePanel
		]
	});

	new App({
		initialPage: "page",
		pages: oPage
	}).placeAt("body");
});
