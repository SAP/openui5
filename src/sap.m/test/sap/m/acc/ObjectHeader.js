sap.ui.define([
	"sap/m/App",
	"sap/m/library",
	"sap/m/MessageToast",
	"sap/m/ObjectAttribute",
	"sap/m/ObjectHeader",
	"sap/m/ObjectMarker",
	"sap/m/ObjectStatus",
	"sap/m/Page",
	"sap/m/PageAccessibleLandmarkInfo",
	"sap/m/Title",
	"sap/ui/core/library",
	"sap/ui/layout/VerticalLayout"
], function(
	App,
	mobileLibrary,
	MessageToast,
	ObjectAttribute,
	ObjectHeader,
	ObjectMarker,
	ObjectStatus,
	Page,
	PageAccessibleLandmarkInfo,
	Title,
	coreLibrary,
	VerticalLayout
) {
	"use strict";

	// shortcut for sap.ui.core.TitleLevel
	var TitleLevel = coreLibrary.TitleLevel;

	// shortcut for sap.m.ObjectMarkerType
	var ObjectMarkerType = mobileLibrary.ObjectMarkerType;

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

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
			level: TitleLevel.H2,
			titleStyle: TitleLevel.H5,
			text: sText,
			wrapping: true
		}).addStyleClass("sapUiMediumMarginTop sapUiTinyMarginBottom");
	}

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
		titleLevel: TitleLevel.H2,
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
		titleLevel: TitleLevel.H2,
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
		titleLevel: TitleLevel.H2,
		number: "0.75",
		numberUnit: "LEV",
		attributes: oActiveObjectAttribute2
	});

	var oLayout = new VerticalLayout({
		width: "100%",
		content: [
			getTitle("Responsive ObjectHeader with active elements:"),
			oActiveResponsiveObjectHeader,
			getTitle("Responsive ObjectHeader with inactive elements:"),
			oPassiveResponsiveObjectHeader,
			getTitle("Condensed ObjectHeader:"),
			oCondensedObjectHeader
		]
	}).addStyleClass("sapUiContentPadding");

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
			titleLevel: TitleLevel.H1,
			content: oLayout
		})
	}).placeAt("body");
});
