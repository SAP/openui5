sap.ui.define([
	"sap/ui/core/IconPool",
	"sap/m/ObjectAttribute",
	"sap/m/ObjectStatus",
	"sap/m/List",
	"sap/m/ObjectListItem",
	"sap/ui/core/library",
	"sap/m/ObjectMarker",
	"sap/m/library",
	"sap/m/App",
	"sap/m/Page",
	"sap/m/CheckBox",
	"sap/m/ToggleButton",
	"sap/m/Label"
], function(
	IconPool,
	ObjectAttribute,
	ObjectStatus,
	List,
	ObjectListItem,
	coreLibrary,
	ObjectMarker,
	mobileLibrary,
	App,
	Page,
	CheckBox,
	ToggleButton,
	Label
) {
	"use strict";

	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;

	// shortcut for sap.m.ObjectMarkerType
	var ObjectMarkerType = mobileLibrary.ObjectMarkerType;

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	// shortcut for sap.ui.core.TitleLevel
	var TitleLevel = coreLibrary.TitleLevel;

	var list = new List("test_list");

	var newMarkers = new ObjectListItem({
		title: "New markers aggregation",
		number: "802",
		numberUnit: "Euro",
		numberState : ValueState.Success,
		attributes: [
			new ObjectAttribute({text: "First Attribute."}),
			new ObjectAttribute({text: "Second Attribute"})
		],
		firstStatus: new ObjectStatus({text: "Critical Status", state: "Error"}),
		markers: [
					 new ObjectMarker({type: ObjectMarkerType.Favorite}),
					 new ObjectMarker({type: ObjectMarkerType.Flagged}),
					 new ObjectMarker({type: ObjectMarkerType.Draft})
				 ]
	});
	list.addItem(newMarkers);

	var lockedItem = new ObjectListItem({
		intro: "Optional Intro Text",
		title: "Sed ut perspiciatis, unde omnis iste natus",
		number: "802",
		numberUnit: "Euro",
		numberState : ValueState.Success,
		attributes: [
			new ObjectAttribute({text: "First Attribute Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."}),
			new ObjectAttribute({text: "Second Attribute"})
		],
		firstStatus: new ObjectStatus({text: "Critical Status", state: "Error"}),
		showMarkers: true,
		markFlagged: true,
		markFavorite: true,
		markLocked: true
	});
	list.addItem(lockedItem);


	var rtlTestItem = new ObjectListItem({
		intro: "0882 13 14 15",
		icon: IconPool.getIconURI("inbox"),
		title: "0882 13 14 15",
		number: "0882 13 14 15",
		numberState : ValueState.Success,
		attributes: [ new ObjectAttribute({text: "+359 04 05 06", textDirection: TextDirection.LTR })],
		firstStatus: new ObjectStatus({text: "+359 04 05 06", state: "Success", textDirection: TextDirection.LTR }),
		secondStatus: new ObjectStatus({title: "לִהְיוֹת לָכֶם לֵאלֹהִים",
			text: "+359 04 05 06", state: "Warning", textDirection: TextDirection.LTR }),
		showMarkers: true,
		markFlagged: true,
		markFavorite: true,
		titleTextDirection: TextDirection.LTR,
		introTextDirection: TextDirection.LTR,
		numberTextDirection: TextDirection.LTR
	});
	list.addItem(rtlTestItem);

	var worstCaseAttrs = [
		new ObjectAttribute({text: "attribute text 1 attribute text 1"}),
		new ObjectAttribute({text: "attribute text 2 attribute text 1"}),
		new ObjectAttribute({text: "Seven_seven-seven-seven-seven-seven_sevens_even years ago our fathers brought forth on this continent, a new nation, conceived in Liberty, and dedicated to the proposition that all men are created equal."})
	];

	var worstCase = new ObjectListItem({
		intro: "On behalf of John Smith, Ñagçyfox",
		icon: IconPool.getIconURI("inbox"),
		title: "Ñorst case item with all fields, large number, Ñagçyfox",
		number: "Ñ999999999",
		numberUnit: "Euro",
		numberState : ValueState.Success,
		attributes: worstCaseAttrs,
		firstStatus: new ObjectStatus({text: "Positive Ñagçyfox", state: "Success"}),
		secondStatus: new ObjectStatus({text: "Negative Ñagçyfox", state: "Error"}),
		showMarkers: true,
		markFlagged: true,
		markFavorite: true
	});
	list.addItem(worstCase);

	var longWordTitle = new ObjectListItem({
		icon: IconPool.getIconURI("inbox"),
		title: "123456789012345678901234567890123456789012345678901234567890 This long word should be wrapped to another line",
		number: "Ñ999999999",
		numberUnit: "Euro",
		numberState : ValueState.Success,
		attributes: [new ObjectAttribute({text: "attribute text 1 attribute text 1"})],
		firstStatus: new ObjectStatus({text: "Positive Ñagçyfox", state: "Success"}),
		showMarkers: true,
		markFlagged: true,
		markFavorite: true
	});
	list.addItem(longWordTitle);

	var longWordTitleNoNumber = new ObjectListItem({
		icon: IconPool.getIconURI("inbox"),
		title: "123456789012345678901234567890123456789012345678901234567890 This long word should be wrapped to another line",
		attributes: [new ObjectAttribute({text: "attribute text 1 attribute text 1"})],
		firstStatus: new ObjectStatus({text: "Positive Ñagçyfox", state: "Success"}),
		showMarkers: true,
		markFlagged: true,
		markFavorite: true
	});
	list.addItem(longWordTitleNoNumber);

	var longWordTitleOnly = new ObjectListItem({
		title: "123456789012345678901234567890123456789012345678901234567890 This long word should be wrapped to another line",
		attributes: [new ObjectAttribute({text: "attribute text 1 attribute text 1"})],
		firstStatus: new ObjectStatus({text: "Positive Ñagçyfox", state: "Success"}),
		showMarkers: true,
		markFlagged: true,
		markFavorite: true
	});
	list.addItem(longWordTitleOnly);

	var bestCase = new ObjectListItem({
		title: "Best case item with minimal fields, medium number",
		number: "3.62449",
		numberState : ValueState.Success
	});
	list.addItem(bestCase);

	var withImgIcon = new ObjectListItem({
		intro: "On behalf of John Smith, Ñagçyfox",
		icon: "images/action.png",
		activeIcon: "images/action_pressed.png",
		title: "Using image instead of icon font",
		number: "103",
		numberUnit: "%",
		numberState : ValueState.Success
	});
	list.addItem(withImgIcon);


	var bestVariation1 = new ObjectListItem({
		intro: "On behalf of John Smith",
		title: "Best case item with number unit, small number",
		number: "-900,000,000.01",
		numberUnit: "Euro",
		numberState : ValueState.Error
	});
	list.addItem(bestVariation1);

	var bestVariation2 = new ObjectListItem({
		intro: "On behalf of John Smith",
		title: "Best case item adding number unit",
		number: "3.6244",
		numberUnit: "Euro",
		numberState : ValueState.Error
	});
	list.addItem(bestVariation2);


	var bestVariation3Attrs = [
		new ObjectAttribute({text: "attribute text 1"}),
		new ObjectAttribute({text: "attribute text 2"}),
		new ObjectAttribute({text: "attribute text 3"})
	];
	var bestVariation3 = new ObjectListItem({
		intro: "On behalf of John Smith",
		title: "Best case item adding attributes aggregation only",
		number: "3.6244",
		numberUnit: "Euro",
		numberState : ValueState.Error,
		attributes: bestVariation3Attrs
	});
	list.addItem(bestVariation3);

	var bestVariation4 = new ObjectListItem({
		intro: "On behalf of John Smith",
		title: "Best case item adding first and second status",
		number: "3.6244",
		numberUnit: "Euro",
		numberState : ValueState.Success,
		firstStatus: new ObjectStatus({text: "Status state warning", state: "Warning"}),
		secondStatus: new ObjectStatus({text: "Status state none", state: "None"})
	});
	list.addItem(bestVariation4);

	var bestVariation5 = new ObjectListItem({
		intro: "On behalf of John Smith",
		title: "Best case item adding second status only",
		number: "3.6244",
		numberUnit: "Euro",
		numberState : ValueState.Success,
		secondStatus: new ObjectStatus({text: "Second status"})
	});
	list.addItem(bestVariation5);

	var moreThanThreeAttrs = [
		new ObjectAttribute({text: "attribute text 1 Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."}),
		new ObjectAttribute({text: "attribute text 2"}),
		new ObjectAttribute({text: "attribute text 3"}),
		new ObjectAttribute({text: "attribute text 4"}),
		new ObjectAttribute({text: "attribute text 5"})
	];

	function handlePress(oEvent) {
		if (!bestVariation6.getIntro()) {
			bestVariation6.setIntro("I am impressed.");
		} else {
			bestVariation6.setIntro(undefined);
		}
	}

	var bestVariation6 = new ObjectListItem({
		intro: "On behalf of John Smith",
		title: "More than three attributes & press",
		number: "3.6244",
		numberUnit: "Euro",
		attributes: moreThanThreeAttrs,
		press: handlePress
	});
	list.addItem(bestVariation6);

	var bestVariation8 = new ObjectListItem({
		intro: "On behalf of John Smith",
		title: "No attributes, second status only",
		number: "3.6244",
		numberUnit: "Euro",
		secondStatus: new ObjectStatus({text: "Second status"})
	});
	list.addItem(bestVariation8);

	var bestVariation9 = new ObjectListItem({
		intro: "On behalf of John Smith",
		title: "No attributes, first status only",
		number: "3.6244",
		numberUnit: "Euro",
		firstStatus: new ObjectStatus({text: "First status info", state: "Success"})
	});
	list.addItem(bestVariation9);

	var withFirstStatusIcon = new ObjectListItem({
		intro: "On behalf of John Smith",
		title: "First status using icon font",
		number: "3.62449",
		firstStatus: new ObjectStatus({icon: IconPool.getIconURI("inbox")}).setTooltip("inbox")
	});
	list.addItem(withFirstStatusIcon);

	var emptyAttributes = [
		new ObjectAttribute({text: ""}),
		new ObjectAttribute({text: ""}),
		new ObjectAttribute({text: ""})
	];

	var emptyAttributes = new ObjectListItem({
		intro: "On behalf of John Smith, Ñagçyfox",
		title: "3 Attributes with empty string & no status",
		number: "9999999999",
		numberUnit: "Euro",
		attributes: emptyAttributes
	});
	list.addItem(emptyAttributes);

	emptyAttributes = [
		new ObjectAttribute({text: ""}),
		new ObjectAttribute({text: ""}),
		new ObjectAttribute({text: ""})
	];

	var emptyAttributesFirstStatus = new ObjectListItem({
		intro: "On behalf of John Smith, Ñagçyfox",
		title: "3 Attributes with empty string with first status",
		number: "9999999999",
		numberUnit: "Euro",
		attributes: emptyAttributes,
		firstStatus: new ObjectStatus({text: "First status info"})
	});
	list.addItem(emptyAttributesFirstStatus);

	var oneAttributeWithRestEmpty = [
		new ObjectAttribute({text: "First attrib val"}),
		new ObjectAttribute({text: ""}),
		new ObjectAttribute({text: ""})
	];

	var firstAttributeFirstStatus = new ObjectListItem({
		intro: "On behalf of John Smith, Ñagçyfox",
		title: "1 Attribute and 2 empty, first status",
		number: "9999999999",
		numberUnit: "Euro",
		attributes: oneAttributeWithRestEmpty,
		firstStatus: new ObjectStatus({text: "First status info"})
	});
	list.addItem(firstAttributeFirstStatus);


	var withFirstStatusImage = new ObjectListItem({
		intro: "On behalf of John Smith",
		title: "First status using image",
		number: "3.62449",
		firstStatus: new ObjectStatus({icon: "images/favorite_24.png"}).setTooltip("golden star")
	});
	list.addItem(withFirstStatusImage);


	var allMarkersShown = new ObjectListItem({
		intro: "On behalf of John Smith, Ñagçyfox",
		title: "All possible markers shown initially, no attributes",
		number: "12",
		numberUnit: "Milo",
		showMarkers: true,
		markFlagged: true,
		markFavorite: true
	});
	list.addItem(allMarkersShown);

	var flagMarkerOnly = new ObjectListItem({
		intro: "On behalf of John Smith, Ñagçyfox",
		title: "Flagged only",
		number: "12",
		numberUnit: "Milo",
		showMarkers: true,
		markFlagged: true
	});
	list.addItem(flagMarkerOnly);

	var favoriteMarkerOnly = new ObjectListItem({
		intro: "On behalf of John Smith, Ñagçyfox",
		title: "Favorite only",
		number: "12",
		numberUnit: "Milo",
		showMarkers: true,
		markFavorite: true
	});
	list.addItem(favoriteMarkerOnly);

	var emptyFirstStatus = new ObjectListItem({
		title: "Empty first status and set second status",
		number: "20",
		firstStatus: new ObjectStatus({
			text: "",
			state: "Error"
		}),
		secondStatus: new ObjectStatus({
			text: "Second Status",
			state: "None"
		}),
		attributes: new ObjectAttribute({
			text: "Object Attribute with a very long text. Object Attribute with a very long text. Object Attribute with a very long text. Object Attribute with a very long text. Object Attribute with a very long text."
		})
	});
	list.addItem(emptyFirstStatus);

	var markersAndStatuses = new ObjectListItem({
		intro: "On behalf of John Smith, Ñagçyfox",
		title: "Markers and statuses, no attributes",
		number: "12",
		numberUnit: "Milo",
		firstStatus: new ObjectStatus({text: "First status info"}),
		secondStatus: new ObjectStatus({text: "Second status info"}),
		showMarkers: true
	});
	list.addItem(markersAndStatuses);

	var app = new App();
	var page = new Page("testPage", {
		title: "Object List Item Test",
		titleLevel: TitleLevel.H1
	});
	app.setInitialPage(page.getId());
	page.setEnableScrolling(true);
	app.addPage(page);
	page.addContent(list);

	page.addContent(new Label({
		text: "Show Markers",
		labelFor: "showMarkersCheckbox"
	}));

	page.addContent(new CheckBox("showMarkersCheckbox", {
		text: "Show Markers",
		selected: false,
		select: function() {}
	}));

	page.addContent(new ToggleButton({
		id: "flag-button",
		text: "Flag",
		tooltip: "Set mark flag",
		pressed: false,
		press: function (oEvent) {
			if (oEvent.getParameter("pressed"))
				{}
		}
	}));

	page.addContent(new ToggleButton({
		id: "favorite-button",
		text: "Favorite",
		tooltip: "Set Favorite flag",
		pressed: false,
		press: function (oEvent) {
			if (oEvent.getParameter("pressed"))
				{}
		}
	}));

	page.addContent(new ToggleButton({
		id: "locked-button",
		text: "Locked",
		tooltip: "Set Locked flag",
		pressed: false,
		press: function (oEvent) {
			if (oEvent.getParameter("pressed"))
				{}
		}
	}));

	app.placeAt('body');
});
