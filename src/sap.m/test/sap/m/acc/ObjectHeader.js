sap.ui.define([
	"sap/m/App",
	"sap/m/library",
	"sap/m/List",
	"sap/m/MessageToast",
	"sap/m/ObjectAttribute",
	"sap/m/ObjectHeader",
	"sap/m/ObjectMarker",
	"sap/m/ObjectStatus",
	"sap/m/Page",
	"sap/m/PageAccessibleLandmarkInfo",
	"sap/m/ResponsivePopover",
	"sap/m/StandardListItem",
	"sap/m/Title",
	"sap/ui/core/library",
	"sap/ui/layout/VerticalLayout"
], function(
	App,
	mobileLibrary,
	List,
	MessageToast,
	ObjectAttribute,
	ObjectHeader,
	ObjectMarker,
	ObjectStatus,
	Page,
	PageAccessibleLandmarkInfo,
	ResponsivePopover,
	StandardListItem,
	Title,
	coreLibrary,
	VerticalLayout
) {
	"use strict";



	// shortcut for sap.m.ObjectMarkerType
	var ObjectMarkerType = mobileLibrary.ObjectMarkerType;

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	// shortcut for sap.m.PlacementType
	var PlacementType = mobileLibrary.PlacementType;

	function handleTitleSelection(oEvent) {
		if (!window.oPopover) {
			window.oPopover = new ResponsivePopover({
				title: "Select title",
				placement: PlacementType.Bottom,
				showHeader: true,
				content: new List({
					mode: "SingleSelectMaster",
					includeItemInSelection: true,
					selectionChange: function (oEvt) {
						oObjectHeaderWithTitleSelector.setTitle(oEvt.getParameter("listItem").getTitle());
						window.oPopover.close();
					},
					items: [
						new StandardListItem({
							title: "First"
						}),
						new StandardListItem({
							title: "Second"
						}),
						new StandardListItem({
							title: "Third"
						})
					]
				})
			});
		}
		window.oPopover.openBy(oEvent.getParameter("domRef"));
	}

	function onPress(oEvent) {
		MessageToast.show(oEvent.getSource().getId() + " pressed");
	}

	function onIconPressHandler(oEvent) {
		MessageToast.show(oEvent.getSource().getId() + "'s icon pressed");
	}

	function onTitlePressHandler(oEvent) {
		MessageToast.show(oEvent.getSource().getId() + "'s title pressed");
	}

	function onIntroPressHandler(oEvent) {
		MessageToast.show(oEvent.getSource().getId() + "'s intro pressed");
	}

	function getTitle(sText) {
		return new Title({
			text: sText
		}).addStyleClass("sapUiMediumMarginTop sapUiTinyMarginBottom");
	}


	// Object Attribute Controls

	var oActiveObjectAttribute1 = new ObjectAttribute({
		active: true,
		title: "Website",
		text: "Take me there",
		press: onPress
	});

	var oActiveObjectAttribute2 = new ObjectAttribute({
		active: true,
		title: "Read more",
		text: "Fruits",
		press: onPress
	});

	var oActiveTitlelessObjectAttribute = new ObjectAttribute({
		active: true,
		text: "Go to wiki page",
		press: onPress
	});

	var oPassiveObjectAttribute = new ObjectAttribute({
		title: "Website",
		text: "Currently offline"
	});

	var oPassiveTitlelessObjectAttribute = new ObjectAttribute({
		text: "Click on the dropdown and choose a new title"
	});


	// Object Status Controls

	var oActiveObjectStatusIconOnly = new ObjectStatus({
		active: true,
		title: "Reputation status",
		icon: "sap-icon://sys-enter",
		tooltip: "Good",
		state: ValueState.Success,
		press: onPress
	});

	var oActiveObjectStatusTextOnly = new ObjectStatus({
		active: true,
		title: "Payment",
		text: "No information",
		state: ValueState.Warning,
		press: onPress
	});

	var oActiveObjectStatusCombined = new ObjectStatus({
		active: true,
		title: "Is better than SAP",
		text: "Impossible",
		icon: "sap-icon://thumb-down",
		state: ValueState.Error,
		press: onPress
	});

	var oActiveTitlelessObjectStatusCombined = new ObjectStatus({
		active: true,
		icon: "sap-icon://cursor-arrow",
		text: "Clickable status",
		state: ValueState.Success,
		press: onPress
	});

	var oPassiveTitlelessObjectStatusIconOnly = new ObjectStatus({
		icon: "sap-icon://time-overtime",
		tooltip: "Overtime required sometimes",
		state: ValueState.Warning
	});

	var oPassiveTitlelessObjectStatusTextOnly = new ObjectStatus({
		text: "Endless learning opportunities",
		state: ValueState.Success
	});

	var oPassiveTitlelessObjectStatusCombined = new ObjectStatus({
		text: "The best company",
		icon: "sap-icon://accept",
		state: ValueState.None
	});


	// Object Header Controls

	var oObjectHeaderWithTitleSelector = new ObjectHeader({
		title: "Products",
		titleLevel: "H2",
		showTitleSelector: true,
		titleSelectorPress: handleTitleSelection,
		titleSelectorTooltip: "Related Options",
		number: "1.000.0000",
		numberUnit: "EUR",
		numberState: ValueState.Warning,
		attributes: oPassiveTitlelessObjectAttribute,
		statuses: oActiveTitlelessObjectStatusCombined
	});

	var oActiveResponsiveObjectHeader = new ObjectHeader({
		responsive: true,
		icon: "sap-icon://building",
		iconAlt: "Building icon",
		iconTooltip: "Building icon",
		iconPress: onIconPressHandler,
		intro: "Google Intro",
		introActive: true,
		introPress: onIntroPressHandler,
		title: "Google Title",
		titleLevel: "H2",
		titleActive: true,
		titlePress: onTitlePressHandler,
		attributes: [
			oActiveObjectAttribute1,
			oActiveTitlelessObjectAttribute
		],
		statuses: [
			oActiveObjectStatusIconOnly,
			oActiveObjectStatusTextOnly,
			oActiveObjectStatusCombined
		]
	});

	var oPassiveResponsiveObjectHeader = new ObjectHeader({
		responsive: true,
		icon: "sap-icon://building",
		iconAlt: "Building icon",
		iconTooltip: "Building icon",
		intro: "Our company",
		title: "SAP",
		titleLevel: "H2",
		attributes: oPassiveObjectAttribute,
		statuses: [
			oPassiveTitlelessObjectStatusIconOnly,
			oPassiveTitlelessObjectStatusTextOnly,
			oPassiveTitlelessObjectStatusCombined
		],
		markers: new ObjectMarker({type: ObjectMarkerType.Favorite})
	});

	var oCondensedObjectHeader = new ObjectHeader({
		condensed: true,
		title: "Banana",
		titleLevel: "H2",
		number: "0.75",
		numberUnit: "LEV",
		attributes: oActiveObjectAttribute2
	});


	// Wrapper

	var oLayout = new VerticalLayout({
		width: "100%",
		content: [
			getTitle("ObjectHeader with title selector:"),
			oObjectHeaderWithTitleSelector,
			getTitle("Responsive ObjectHeader with active elements:"),
			oActiveResponsiveObjectHeader,
			getTitle("Responsive ObjectHeader with inactive elements:"),
			oPassiveResponsiveObjectHeader,
			getTitle("Condensed ObjectHeader:"),
			oCondensedObjectHeader
		]
	}).addStyleClass("sapUiSmallMarginBegin");

	new App({
		pages: new Page({
			landmarkInfo: new PageAccessibleLandmarkInfo({
				rootRole: "Region",
				rootLabel: "Object Header Accessibility Test Page",
				contentRole: "Main",
				contentLabel: "Object Header Instances",
				headerRole: "Region",
				headerLabel: "Object Header Accessibility Test Page Header"
			}),
			title: "ObjectHeader Accessibility Test Page",
			titleLevel: "H1",
			content: oLayout
		})
	}).placeAt("content");
});
