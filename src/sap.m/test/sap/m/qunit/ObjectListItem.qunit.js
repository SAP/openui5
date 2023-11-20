/*global QUnit */
sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/List",
	"sap/m/ObjectAttribute",
	"sap/m/ObjectListItem",
	"sap/m/ObjectStatus",
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/library",
	"sap/m/ObjectMarker",
	"sap/m/library",
	"sap/ui/base/ManagedObjectObserver",
	"sap/ui/core/Core"
], function(
	Element,
	qutils,
	createAndAppendDiv,
	List,
	ObjectAttribute,
	ObjectListItem,
	ObjectStatus,
	jQuery,
	coreLibrary,
	ObjectMarker,
	mobileLibrary,
	ManagedObjectObserver,
	oCore
) {
	"use strict";

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	// shortcut for sap.m.ObjectMarkerType
	var ObjectMarkerType = mobileLibrary.ObjectMarkerType;

	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;

	createAndAppendDiv("list");
	createAndAppendDiv("destroy-list");

	var IMAGE_PATH = "test-resources/sap/m/images/";

	var list = new List("test_list");
	var listItemId = "worst_case";
	var attrs = [new ObjectAttribute({id: listItemId + "-firstAttr", text: "attribute text 1"}),
				new ObjectAttribute({id: listItemId + "-secondAttr", text: "attribute text 2"}),
				new ObjectAttribute({id: listItemId + "-firstInvisibleAttr", text: "first invisible attribute", visible: false}),
				new ObjectAttribute({id: listItemId + "-thirdAttr", text: "attribute text 3"}),
				new ObjectAttribute({id: listItemId + "-fourthAttr", text: "attribute text 4"}),
				new ObjectAttribute({id: listItemId + "-secondInvisibleAttr", text: "second invisible attribute", visible: false}),
				new ObjectAttribute({id: listItemId + "-fifthAttr", text: "attribute text 5"})];

	var listItem = new ObjectListItem({
		id: listItemId,
		type: "Active",
		intro: "On behalf of Ivan Dulko",
		title: "Lorem ipsum dolor",
		number: "3.6244",
		numberUnit: "EUR",
		attributes: attrs,
		firstStatus: new ObjectStatus({id: listItemId + "-status1", text: "First status info"}),
		secondStatus: new ObjectStatus({id: listItemId + "-status2", text: "Second status info"}),
		markers: [
			new ObjectMarker( "FavoriteMarker", {
				type: ObjectMarkerType.Favorite
			}),
			new ObjectMarker("FlaggedMarker", {
				type: ObjectMarkerType.Flagged
			})
		]
	});
	list.addItem(listItem);

	list.placeAt("list");

	QUnit.module("Rendering");

	QUnit.test("ControlRendered", function(assert) {
		assert.ok(document.getElementById("test_list"), "List should be rendered.");
		assert.ok(document.getElementById(listItemId), "Worst case list item should be rendered.");
	});

	QUnit.test("IntroRendered", function(assert) {
		assert.notEqual(document.getElementById(listItemId + "-intro"), null, "Worst case list item intro should be rendered.");
	});

	QUnit.test("FlagRendered", function(assert) {
		assert.ok(document.getElementById("FlaggedMarker"), "Flag marker should be rendered.");
		assert.ok(jQuery("#" + "FlaggedMarker").hasClass("sapMObjectMarker"), "Flag is sapMObjectMarker.");
	});

	QUnit.test("FavoriteRendered", function(assert) {
		assert.ok(document.getElementById("FavoriteMarker"), "Favorite marker should be rendered.");
		assert.ok(jQuery("#" + "FavoriteMarker").hasClass("sapMObjectMarker"), "Favorite is sapMObjectMarker.");
	});

	QUnit.test("MarkersOrder", function(assert) {
		var markers = jQuery("#" + listItemId + " .sapUiIcon");
		assert.equal(markers.eq(0).attr("data-sap-ui-icon-content").charCodeAt(0), 57445, "Favorite marker should be rendered first");
		assert.equal(markers.eq(1).attr("data-sap-ui-icon-content").charCodeAt(0), 57514, "Flag marker should be rendered second");
	});

	QUnit.test("FirstStatusRendered", function(assert) {
		assert.ok(document.getElementById(listItemId + "-status1"), "Worst case first status should be rendered.");
	});

	QUnit.test("SecondStatusRendered", function(assert) {
		assert.ok(document.getElementById(listItemId + "-status2"), "Worst case second status should be rendered.");
	});

	QUnit.test("AttributesRendered", function(assert) {

		assert.ok(document.getElementById(listItemId + "-firstAttr"), "Worst case first attribute should be rendered.");
		assert.ok(document.getElementById(listItemId + "-secondAttr"), "Worst case second attribute should be rendered.");
		assert.ok(!document.getElementById(listItemId + "-firstInvisibleAttr"), "Worst case first invisible attribute should not be rendered.");
		assert.ok(document.getElementById(listItemId + "-thirdAttr"), "Worst case third attribute should be rendered.");
		assert.ok(document.getElementById(listItemId + "-fourthAttr"), "Worst case fourth attribute should be rendered.");
		assert.ok(!document.getElementById(listItemId + "-secondInvisibleAttr"), "Worst case second invisible attribute should not be rendered.");
		assert.ok(document.getElementById(listItemId + "-fifthAttr"), "Worst case fifth attribute should be rendered.");
	});

	QUnit.test("ObjectAttributeRowsRendered", function(assert) {

		var $allRows = jQuery("#worst_case .sapMObjectAttributeDiv");
		assert.ok($allRows.length === 5, "There should be five object attribute rows rendered");

	});

	QUnit.test("RenderLockedIcon", function(assert) {
		var lockedOlI = new ObjectListItem( "LockedOLI", {
			icon : IMAGE_PATH + "action.png",
			intro : "On behalf of John Smith",
			title : "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis luctus, turpis vitae porttitor hendrerit, elit dui mollis neque, id suscipit lorem mi in sem.",
			number : "3.624",
			numberUnit : "EUR",
			markers: [
				new ObjectMarker("LockMarker", {
					type: ObjectMarkerType.Locked
				})
			]
		});

		list.addItem(lockedOlI);
		oCore.applyChanges();

		assert.ok(document.getElementById("LockMarker"), "Locked marker should be rendered.");
		assert.ok(jQuery("#" + "LockMarker").hasClass("sapMObjectMarker"), "Locked is sapMObjectMarker.");

		lockedOlI.destroy();
	});

	/************* ARIA Rendering *******************/

	QUnit.test("ARIA attribute 'aria-labelledby' ID Refs list", function(assert) {
		// create ObjectListItem
		var oAttrsAndStatuseListItem = new ObjectListItem({
			id: 'oAttrsAndStatuseListItemId',
			intro: "Intro",
			title: "Title",
			number: "3",
			numberUnit: "EUR",
			markFlagged: true,
			attributes: [new ObjectAttribute({id: "oAttrsAndStatuseListItemId-firstAttr", text: "First attribute text"})],
			firstStatus: new ObjectStatus({id: "oAttrsAndStatuseListItemId-status1", text: "First status info"}),
			secondStatus: new ObjectStatus({id: "oAttrsAndStatuseListItemId-status2", text: "Second status info"}),
			markers: [
				new ObjectMarker("FlagMarker-ARIA", {
					type: ObjectMarkerType.Flagged
				}),
				new ObjectMarker( "FaveMarker-ARIA", {
					type: ObjectMarkerType.Favorite
				})
			]
		});
		list.addItem(oAttrsAndStatuseListItem);

		oCore.applyChanges();

		// Assert ObjectListItem inner nodes ids are added to aria-labelledby attribute
		var sAriaLabelledByValue = oAttrsAndStatuseListItem.$().attr("aria-labelledby");
		assert.ok(sAriaLabelledByValue, "ARIA 'aria-labelledby' is added");

		var sListItemId = oAttrsAndStatuseListItem.getId();
		var sFirstStatusId = oAttrsAndStatuseListItem.getFirstStatus().getId();
		var sSecondStatusId = oAttrsAndStatuseListItem.getSecondStatus().getId();

		assert.ok(sAriaLabelledByValue.indexOf(sListItemId + "-intro") !== -1, "ObjectListItem introId: '" + sListItemId + "-intro" + "' is added to aria-labelledby attribute");
		assert.ok(sAriaLabelledByValue.indexOf(sListItemId + "-titleText") !== -1, "ObjectListItem titleId: '" + sListItemId + "-titleText" + "' is added to 'aria-labelledby' attribute");
		assert.ok(sAriaLabelledByValue.indexOf(sListItemId + "-ObjectNumber") !== -1, "ObjectListItem numberId: '" + sListItemId + "-NumberObject" + "' is added to 'aria-labelledby' attribute");
		assert.ok(sAriaLabelledByValue.indexOf(sFirstStatusId) !== -1, "ObjectListItem firstStatusId: '" + sFirstStatusId + "' is added to 'aria-labelledby' attribute");
		assert.ok(sAriaLabelledByValue.indexOf(sSecondStatusId) !== -1, "ObjectListItem secondStatusId: '" + sSecondStatusId + "' is added to 'aria-labelledby' attribute");
		assert.ok(sAriaLabelledByValue.indexOf("FlagMarker-ARIA-text") !== -1, "ObjectListItem flagId: 'FlagMarker-ARIA-text' is added to aria-labelledby attribute");
		assert.ok(sAriaLabelledByValue.indexOf("FaveMarker-ARIA-text") !== -1, "ObjectListItem flagId: 'FaveMarker-ARIA-text' is added to aria-labelledby attribute");
		oAttrsAndStatuseListItem.getAttributes().forEach(function(attribute) {
			assert.ok(sAriaLabelledByValue.indexOf(attribute.getId()) !== -1, "ObjectListItem attributeId: '" + attribute.getId() + "' is added to 'aria-labelledby' attribute");
		});

		// destroy ObjectListItem
		oAttrsAndStatuseListItem.destroy();
	});

	//BCP: 1770099014
	QUnit.test("Empty attributes and statuses are not used as ARIA labels", function(assert) {
		//arrange
		var oOLI = new ObjectListItem({
				attributes: [
					new ObjectAttribute({
						id: "oa1ID",
						text: "first"
					}),
					new ObjectAttribute({
						id: "oa2ID",
						text: ""
					}),
					new ObjectAttribute({
						id: "oa3ID",
						text: "third"
					})
				],
				firstStatus: new ObjectStatus({
					id: "os1ID",
					text: ""
				}),
				secondStatus: new ObjectStatus({
					id: "os2ID",
					text: "second status"
				})
			}).placeAt('qunit-fixture'),
			sResultARIA;

		oCore.applyChanges();
		sResultARIA = oOLI.$().attr('aria-labelledby');

		//assert
		assert.ok(sResultARIA.indexOf('oa1ID') > -1, 'first attribute used as aria label');
		assert.ok(sResultARIA.indexOf('oa2ID') === -1, 'second attribute not used as aria label');
		assert.ok(sResultARIA.indexOf('oa3ID') > -1, 'third attribute used as aria label');
		assert.ok(sResultARIA.indexOf('os1ID') === -1, 'first status not used as aria label');
		assert.ok(sResultARIA.indexOf('os2ID') > -1, 'second status used as aria label');

		//clean
		oOLI.destroy();
	});

	/*********************************************/

	var showTextDir = new ObjectListItem({
		id: "showTextDir",
		intro: "rtl chars intro",
		introTextDirection: TextDirection.Inherit,
		title: "Title is rtl",
		titleTextDirection: TextDirection.RTL,
		number: "10 000",
		numberTextDirection: TextDirection.LTR,
		numberUnit: "U"
	});
	list.addItem(showTextDir);

	QUnit.test("TitleNumberIntroTextDirection RTL rendering", function(assert) {
		assert.equal(jQuery('#showTextDir-intro>span').attr("dir"), undefined, "intro has no dir attribute");
		assert.equal(jQuery('#showTextDir-titleText').attr("dir"), "rtl", "title has attribute dir=rtl");
		assert.equal(jQuery('#showTextDir-ObjectNumber').attr("dir"), "ltr", "ObjectNumber has attribute dir=ltr");

		showTextDir.setIntroTextDirection(TextDirection.RTL);
		showTextDir.setTitleTextDirection(TextDirection.Inherit);
		showTextDir.setNumberTextDirection(TextDirection.Inherit);
		oCore.applyChanges();

		assert.equal(jQuery('#showTextDir-intro>span').attr("dir"), "rtl", "intro has attribute dir=rtl");
		assert.equal(jQuery('#showTextDir-titleText').attr("dir"), "auto", "title has no dir attribute");
		assert.equal(jQuery('#showTextDir-ObjectNumber').attr("dir"), undefined, "ObjectNumber has no dir attribute");
	});

	QUnit.test("Number properties create a private sap.m.ObjectNumber control", function (assert) {
		var oObjectNumberAggregation = showTextDir.getAggregation("_objectNumber");
		assert.ok(oObjectNumberAggregation && oObjectNumberAggregation.isA("sap.m.ObjectNumber"), "An instance of sap.m.ObjectNumber is created out of number, unit, numberState, numberTextDirection properties");
		assert.strictEqual(oObjectNumberAggregation.getNumber(), showTextDir.getNumber(), "Both 'number' properties are in sync");
		assert.strictEqual(oObjectNumberAggregation.getUnit(), showTextDir.getNumberUnit(), "Both 'unit' properties are in sync");
		assert.strictEqual(oObjectNumberAggregation.getState(), showTextDir.getNumberState(), "Both 'ValueStates' properties are in sync");
		assert.strictEqual(oObjectNumberAggregation.getTextDirection(), showTextDir.getNumberTextDirection(), "Both 'ValueStates' properties are in sync");
	});

	/******************************************************************/
	QUnit.module("Rendering Markers aggregation");

	QUnit.test("Render Draft and Favorite", function(assert) {
		var markersOlI = new ObjectListItem({
			id: "markersOlI",
			title : "Markers agregation",
			number : "3.624",
			numberUnit : "EUR",
			markers: [
				new ObjectMarker("markersOlI-Draft", {
					type: ObjectMarkerType.Draft
				}),
				new ObjectMarker("markersOlI-Favorite", {
					type: ObjectMarkerType.Favorite
				})
			]
		});

		list.addItem(markersOlI);
		oCore.applyChanges();

		assert.ok(document.getElementById("markersOlI-Draft"), "marker draft should be rendered.");
		assert.ok(document.getElementById("markersOlI-Favorite"), "marker favorite should be rendered.");

		markersOlI.destroy();
	});

	QUnit.test("Render marker by setting the markers aggregation", function(assert) {
		var markersOlI = new ObjectListItem({
			id: "markersOlI",
			title : "Markers agregation",
			number : "3.624",
			numberUnit : "EUR"
		});
		var marker = new ObjectMarker("markersOlI-Draft", {
			type: ObjectMarkerType.Draft
		});

		list.addItem(markersOlI);
		oCore.applyChanges();

		var $allRows = jQuery("#markersOlI .sapMObjStatusMarker");
		assert.ok($allRows.length === 0, "There are no markers");

		markersOlI.insertMarker(marker, 0);
		oCore.applyChanges();

		assert.ok(document.getElementById("markersOlI-Draft"), "marker draft should be rendered.");

		markersOlI.destroy();
	});

	QUnit.test("Removing marker", function(assert) {
		var markersOlI = new ObjectListItem({
			id: "markersOlI",
			title : "Markers agregation",
			number : "3.624",
			numberUnit : "EUR",
			markers: [
				new ObjectMarker("markersOlI-Flag", {
					type: ObjectMarkerType.Flagged
				})
			]
		});

		list.addItem(markersOlI);
		oCore.applyChanges();

		assert.ok(document.getElementById("markersOlI-Flag"), "marker flag should be rendered.");

		markersOlI.removeAllMarkers();
		oCore.applyChanges();

		var $allRows = jQuery("#markersOlI .sapMObjStatusMarker");
		assert.ok($allRows.length === 0, "There are no markers");

		markersOlI.destroy();
	});

	QUnit.module("Markers aggregation general");

	QUnit.test("addMarker should add observer for changes in marker properties", function (assert) {
		// Arrange
		var oMarker = new ObjectMarker("marker", { type: ObjectMarkerType.Flagged });
		var oLI = new ObjectListItem();

		// Act
		oLI.addMarker(oMarker);

		// Assert
		assert.ok(oLI._oItemsObservers.marker, "There is key set to the _oItemsObservers that is equal to the marker id");
		assert.ok(oLI._oItemsObservers.marker instanceof ManagedObjectObserver, "observer is set properly for marker with id: marker");

		// Cleanup
		oLI.destroy();
	});

	QUnit.test("insertMarker should add observer for changes in marker properties", function (assert) {
		// Arrange
		var oMarker = new ObjectMarker("marker", { type: ObjectMarkerType.Flagged });
		var oLI = new ObjectListItem();

		// Act
		oLI.insertMarker(oMarker, 0);

		// Assert
		assert.ok(oLI._oItemsObservers.marker, "There is key set to the _oItemsObservers that is equal to the marker id");
		assert.ok(oLI._oItemsObservers.marker instanceof ManagedObjectObserver, "observer is set properly for marker with id: marker");

		// Cleanup
		oLI.destroy();
	});

	QUnit.test("removeMarker should remove observer for changes in marker properties", function (assert) {
		// Arrange
		var oMarker = new ObjectMarker("marker", { type: ObjectMarkerType.Flagged });
		var oLI = new ObjectListItem({ markers: oMarker });

		// Assert
		assert.ok(oLI._oItemsObservers.marker, "There is key set to the _oItemsObservers that is equal to the marker id");
		assert.ok(oLI._oItemsObservers.marker instanceof ManagedObjectObserver, "observer is set properly for marker with id: marker");

		// Act
		oLI.removeMarker(oMarker);

		// Assert
		assert.notOk(oLI._oItemsObservers.marker, "ItemsObservers hashmap should not have marker key");

		// Cleanup
		oLI.destroy();
		oMarker.destroy();
	});

	QUnit.test("removeAllMarkers should remove observer for changes in marker properties", function (assert) {
		// Arrange
		var oMarker1 = new ObjectMarker("marker1", { type: ObjectMarkerType.Flagged });
		var oMarker2 = new ObjectMarker("marker2", { type: ObjectMarkerType.Flagged });
		var oLI = new ObjectListItem({ markers: [oMarker1, oMarker2] });

		// Assert
		assert.ok(oLI._oItemsObservers.marker1, "There is key set to the _oItemsObservers that is equal to the marker1 id");
		assert.ok(oLI._oItemsObservers.marker1 instanceof ManagedObjectObserver, "observer is set properly for marker with id: marker1");
		assert.ok(oLI._oItemsObservers.marker2, "There is key set to the _oItemsObservers that is equal to the marker2 id");
		assert.ok(oLI._oItemsObservers.marker2 instanceof ManagedObjectObserver, "observer is set properly for marker with id: marker2");

		// Act
		oLI.removeAllMarkers();

		// Assert
		assert.notOk(oLI._oItemsObservers.marker1, "ItemsObservers hashmap should not have marker1 key");
		assert.notOk(oLI._oItemsObservers.marker2, "ItemsObservers hashmap should not have marker2 key");

		// Cleanup
		oLI.destroy();
		oMarker1.destroy();
		oMarker2.destroy();
	});

	QUnit.test("destroyMarkers should remove observer for changes in marker properties", function (assert) {
		// Arrange
		var oMarker1 = new ObjectMarker("marker1", { type: ObjectMarkerType.Flagged });
		var oMarker2 = new ObjectMarker("marker2", { type: ObjectMarkerType.Flagged });
		var oLI = new ObjectListItem({ markers: [oMarker1, oMarker2] });

		// Assert
		assert.ok(oLI._oItemsObservers.marker1, "There is key set to the _oItemsObservers that is equal to the marker1 id");
		assert.ok(oLI._oItemsObservers.marker1 instanceof ManagedObjectObserver, "observer is set properly for marker with id: marker1");
		assert.ok(oLI._oItemsObservers.marker2, "There is key set to the _oItemsObservers that is equal to the marker2 id");
		assert.ok(oLI._oItemsObservers.marker2 instanceof ManagedObjectObserver, "observer is set properly for marker with id: marker2");

		// Act
		oLI.destroyMarkers();

		// Assert
		assert.notOk(oLI._oItemsObservers.marker1, "ItemsObservers hashmap should not have marker1 key");
		assert.notOk(oLI._oItemsObservers.marker2, "ItemsObservers hashmap should not have marker2 key");

		// Cleanup
		oLI.destroy();
		oMarker1.destroy();
		oMarker2.destroy();
	});

	// BCP: 1870534226
	QUnit.test("Update Marker, invalidates the ObjectListItem", function (assert) {
		var oMarker = new ObjectMarker("marker", { type: ObjectMarkerType.Flagged });
		var oLI = new ObjectListItem({ markers: oMarker });
		var oLIInvalidateSpy = this.spy(oLI, "invalidate");

		// Act
		oMarker.setVisible(false);

		// Assert
		assert.equal(oLIInvalidateSpy.callCount, 1, "ObjectListItem should be invalidated when ObjectMarker visible property is changed");

		// Cleanup
		oLIInvalidateSpy.restore();
		oLI.destroy();
		oMarker.destroy();
	});

	/******************************************************************/
	QUnit.module("Active state");

	QUnit.test("TestActiveIcon", function(assert) {
		// Setup
		var imageSrc,
			imageOLI1 = new ObjectListItem("imageOLI1", {
				type: "Active",
				icon : IMAGE_PATH + "action.png",
				activeIcon: IMAGE_PATH + "action_pressed.png",
				iconDensityAware: false,
				intro : "On behalf of John Smith",
				title : "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis luctus, turpis vitae porttitor hendrerit, elit dui mollis neque, id suscipit lorem mi in sem.",
				number : "5.624",
				numberUnit : "EUR"
			});

		list.addItem(imageOLI1);
		oCore.applyChanges();

		// Assert
		imageSrc = imageOLI1.$('img').attr('src');
		assert.strictEqual(imageSrc, imageOLI1.getIcon(), "The icon should be inactive");

		// Act
		imageOLI1.setActive(true);
		oCore.applyChanges();

		// Assert
		imageSrc = imageOLI1.$('img').attr('src');
		assert.strictEqual(imageSrc, imageOLI1.getActiveIcon(), "The icon should be active");

		// Act
		imageOLI1.setActive(false);
		oCore.applyChanges();

		// Assert
		imageSrc = imageOLI1.$('img').attr('src');
		assert.strictEqual(imageSrc, imageOLI1.getIcon(), "The icon should be inactive");
	});

	/******************************************************************/

	QUnit.module("Selected state");

	QUnit.test("getContentAnnouncement", function(assert) {
		// Arrange
		var bGetContentAnnouncement = ObjectListItem.prototype.getContentAnnouncement && (typeof ObjectListItem.prototype.getContentAnnouncement === "function");

		// Assert
		assert.ok(bGetContentAnnouncement, "getContentAnnouncement should exist as override");
	});

	/******************************************************************/

	QUnit.module("Icon / Image ratio");

	QUnit.test("Icon has equal width and height", function(assert) {
		var done = assert.async();
		var imageOLIIcon = new ObjectListItem("imageOLIIcon", {
			icon : "sap-icon://hint",
			iconDensityAware: false,
			intro : "On behalf of John Smith",
			title : "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis luctus, turpis vitae porttitor hendrerit, elit dui mollis neque, id suscipit lorem mi in sem.",
			number : "5.624",
			numberUnit : "EUR"
		});
		list.addItem(imageOLIIcon);
		oCore.applyChanges();

		setTimeout(function() {
			var iconWidth = imageOLIIcon.$().find('.sapMObjLIcon').width();
			var iconHeight = imageOLIIcon.$().find('.sapMObjLIcon').height();
			assert.ok(iconWidth == iconHeight, "Icon has equal width and height");
			imageOLIIcon.destroy();
			done();
		},1000);
	});

	QUnit.test("Image has different width and height", function(assert) {
		var done = assert.async();
		var imageOLIImg = new ObjectListItem("imageOLIImg", {
			icon : IMAGE_PATH + "grass.jpg",
			iconDensityAware: false,
			intro : "On behalf of John Smith",
			title : "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis luctus, turpis vitae porttitor hendrerit, elit dui mollis neque, id suscipit lorem mi in sem.",
			number : "5.624",
			numberUnit : "EUR"
		});
		list.addItem(imageOLIImg);
		oCore.applyChanges();

		setTimeout(function() {
			var imageWidth = imageOLIImg.$('img').width();
			var imageHeight = imageOLIImg.$('img').height();
			assert.ok(imageWidth > imageHeight, "The image still has different width and height");
			imageOLIImg.destroy();
			done();
		},1000);
	});

	/******************************************************************/

	QUnit.module("Whitespace Handling");

	var liEmptyStatus1 = new ObjectListItem({
		title: "Empty first status",
		firstStatus: new ObjectStatus("ose1", {
			text: "\n  \n  \t",
			state: ValueState.Success})
	});
	var liEmptyStatus2 = new ObjectListItem({
		title: "Empty second status",
		secondStatus: new ObjectStatus("ose2", {
			text: "\n  \n  \t",
			state: ValueState.Success})
	});
	var liEmptyStatuses = new ObjectListItem({
		title: "Empty statuses",
		firstStatus: new ObjectStatus("ose3", {
			text: "\n  \n  \t",
			state: ValueState.Success}),
		secondStatus: new ObjectStatus("ose4", {
			text: "\n  \n  \t",
			state: ValueState.Success})
	});

	var liEmptyAttr = new ObjectListItem({
		title: "Empty attributes",
		attributes: [new ObjectAttribute({text: "\n  \n  \t"}),
					new ObjectAttribute({text: "\n  \n  \t"})]
	});
	var liEmptyAll = new ObjectListItem({
		title: "Empty attributes and statuses",
		attributes: [new ObjectAttribute({text: "\n  \n  \t"}),
					new ObjectAttribute({text: "\n  \n  \t"})],
		firstStatus: new ObjectStatus("ose5", {
			text: "\n  \n  \t",
			state: ValueState.Success}),
		secondStatus: new ObjectStatus("ose6", {
			text: "\n  \n  \t",
			state: ValueState.Success})
	});

	QUnit.test("TestEmptyOLI", function (assert){

		assert.ok(!liEmptyStatus1._hasStatus(), "Object list item has no rendered statuses");
		assert.ok(!liEmptyStatus2._hasStatus(), "Object list item has no rendered statuses");
		assert.ok(!liEmptyStatuses._hasStatus(), "Object list item has no rendered statuses");

		assert.ok(!liEmptyAttr._hasAttributes(), "Object list item has no rendered attributes");

		assert.ok(!liEmptyAll._hasAttributes(), "Object list item has no rendered attributes");
		assert.ok(!liEmptyAll._hasStatus(), "Object list item has no rendered statuses");
		assert.ok(!liEmptyAll._hasBottomContent(), "Object list item has no bottom content");
	});

	/******************************************************************/

	QUnit.module("Attributes aggregation general");

	QUnit.test("addAttribute should add observer for changes in attribute properties", function (assert) {
		// Arrange
		var oAttribute = new ObjectAttribute("attribute", { text: "test" });
		var oLI = new ObjectListItem();

		// Act
		oLI.addAttribute(oAttribute);

		// Assert
		assert.ok(oLI._oItemsObservers.attribute, "There is key set to the _oItemsObservers that is equal to the attribute id");
		assert.ok(oLI._oItemsObservers.attribute instanceof ManagedObjectObserver, "observer is set properly for attribute with id: attribute");

		// Cleanup
		oLI.destroy();
	});

	QUnit.test("insertAttribute should add observer for changes in attribute properties", function (assert) {
		// Arrange
		var oAttribute = new ObjectAttribute("attribute", { text: "test" });
		var oLI = new ObjectListItem();

		// Act
		oLI.insertAttribute(oAttribute, 0);

		// Assert
		assert.ok(oLI._oItemsObservers.attribute, "There is key set to the _oItemsObservers that is equal to the attribute id");
		assert.ok(oLI._oItemsObservers.attribute instanceof ManagedObjectObserver, "observer is set properly for attribute with id: attribute");

		// Cleanup
		oLI.destroy();
	});

	QUnit.test("removeAttribute should remove observer for changes in attribute properties", function (assert) {
		// Arrange
		var oAttribute = new ObjectAttribute("attribute", { text: "test" });
		var oLI = new ObjectListItem({ attributes: oAttribute });

		// Assert
		assert.ok(oLI._oItemsObservers.attribute, "There is key set to the _oItemsObservers that is equal to the attribute id");
		assert.ok(oLI._oItemsObservers.attribute instanceof ManagedObjectObserver, "observer is set properly for attribute with id: attribute");

		// Act
		oLI.removeAttribute(oAttribute);

		// Assert
		assert.notOk(oLI._oItemsObservers.attribute, "ItemsObservers hashmap should not have attribute key");

		// Cleanup
		oLI.destroy();
		oAttribute.destroy();
	});

	QUnit.test("removeAllAttributes should remove observer for changes in attribite properties", function (assert) {
		// Arrange
		var oAttribute1 = new ObjectAttribute("attribute1", { text: "test1" });
		var oAttribute2 = new ObjectAttribute("attribute2", { text: "test2" });
		var oLI = new ObjectListItem({ attributes: [oAttribute1, oAttribute2] });

		// Assert
		assert.ok(oLI._oItemsObservers.attribute1, "There is key set to the _oItemsObservers that is equal to the attribute1 id");
		assert.ok(oLI._oItemsObservers.attribute1 instanceof ManagedObjectObserver, "observer is set properly for attribute with id: attribute1");
		assert.ok(oLI._oItemsObservers.attribute2, "There is key set to the _oItemsObservers that is equal to the attribute2 id");
		assert.ok(oLI._oItemsObservers.attribute2 instanceof ManagedObjectObserver, "observer is set properly for attribute with id: attribute2");

		// Act
		oLI.removeAllAttributes();

		// Assert
		assert.notOk(oLI._oItemsObservers.attribute1, "MarkersObservers hashmap should not have marker1 key");
		assert.notOk(oLI._oItemsObservers.attribute2, "MarkersObservers hashmap should not have marker2 key");

		// Cleanup
		oLI.destroy();
		oAttribute1.destroy();
		oAttribute2.destroy();
	});

	QUnit.test("destroyAttributes should remove observer for changes in attribute properties", function (assert) {
		// Arrange
		var oAttribute1 = new ObjectAttribute("attribute1", { text: "test1" });
		var oAttribute2 = new ObjectAttribute("attribute2", { text: "test2" });
		var oLI = new ObjectListItem({ attributes: [oAttribute1, oAttribute2] });

		// Assert
		assert.ok(oLI._oItemsObservers.attribute1, "There is key set to the _oItemsObservers that is equal to the attribute1 id");
		assert.ok(oLI._oItemsObservers.attribute1 instanceof ManagedObjectObserver, "observer is set properly for attribute with id: attribute1");
		assert.ok(oLI._oItemsObservers.attribute2, "There is key set to the _oItemsObservers that is equal to the attribute2 id");
		assert.ok(oLI._oItemsObservers.attribute2 instanceof ManagedObjectObserver, "observer is set properly for attribute with id: attribute2");

		// Act
		oLI.destroyAttributes();

		// Assert
		assert.notOk(oLI._oItemsObservers.attribute1, "ItemsObservers hashmap should not have attribute1 key");
		assert.notOk(oLI._oItemsObservers.attribute2, "ItemsObservers hashmap should not have attribute2 key");

		// Cleanup
		oLI.destroy();
		oAttribute1.destroy();
		oAttribute2.destroy();
	});

	/******************************************************************/

	/**
	 * @deprecated as of version 1.42.0, replaced by <code>markers</code> aggregation.
	 */
	QUnit.module("[Deprecated] Dynamic Marker States", {
		before: function() {
			this.markerId = "marker-OLI";
			this.markerOli = new ObjectListItem({
				id: this.markerId,
				title: "Test dynamic marker states",
				markFlagged: true,
				setMarkFavorite: true,
				showMarkers: true
			});
			list.addItem(this.markerOli);
			oCore.applyChanges();
		},
		after: function() {
			this.markerOli.destroy();
		}
	});

	QUnit.test("Flag Marker Set", function(assert) {
		// Arrange
		this.markerOli.setMarkFavorite(false);
		this.markerOli.setMarkFlagged(true);

		// Act
		oCore.applyChanges();

		// Assert
		assert.equal(jQuery("#" + this.markerId + " .sapUiIcon").length, 1, "Only one marker should be rendered");
		assert.ok(document.getElementById(this.markerId + "-flag"), "Flag marker should be rendered.");
	});

	QUnit.test("Flag Marker Unset", function(assert) {
		// Arrange
		this.markerOli.setMarkFavorite(false);
		this.markerOli.setMarkFlagged(false);

		// Act
		oCore.applyChanges();

		// Assert
		assert.equal(jQuery("#" + this.markerId + " .sapUiIcon").length, 0, "No markers should be rendered");
	});

	QUnit.test("Favorite Marker Set", function(assert) {
		// Arrange
		this.markerOli.setMarkFavorite(true);
		this.markerOli.setMarkFlagged(false);

		// Act
		oCore.applyChanges();

		// Assert
		assert.equal(jQuery("#" + this.markerId + " .sapUiIcon").length, 1, "Only one marker should be rendered");
		assert.ok(document.getElementById(this.markerId + "-favorite"), "Favorite marker should be rendered.");
	});

	QUnit.test("Favorite Marker Unset", function(assert) {
		// Arrange
		this.markerOli.setMarkFavorite(false);
		this.markerOli.setMarkFlagged(false);

		// Act
		oCore.applyChanges();

		// Assert
		assert.equal(jQuery("#" + this.markerId + " .sapUiIcon").length, 0, "No markers should be rendered");
	});

	/******************************************************************/
	var iconOLI = new ObjectListItem("iconOLI", {
		title: "Test Exit",
		markers: [
			new ObjectMarker("iconOLI-Locked", {
				type: ObjectMarkerType.Locked
			}),
			new ObjectMarker("iconOLI-Favorite", {
				type: ObjectMarkerType.Favorite
			}),
			new ObjectMarker("iconOLI-Flagged", {
				type: ObjectMarkerType.Flagged
			})
		]
	});

	var imageOLI = new ObjectListItem("imageOLI", {
		icon : IMAGE_PATH + "action.png",
		intro : "On behalf of John Smith",
		title : "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis luctus, turpis vitae porttitor hendrerit, elit dui mollis neque, id suscipit lorem mi in sem.",
		number : "3.624",
		numberUnit : "EUR"
	});

	var titleOLI = new ObjectListItem("titleOLI", {
		title : "Test that title text control is destroyed"
	});

	iconOLI.placeAt("destroy-list");
	imageOLI.placeAt("destroy-list");
	titleOLI.placeAt("destroy-list");

	QUnit.module("Exiting");

	QUnit.test("TestIconExit", function(assert) {

		assert.ok(!(iconOLI === null), "iconOLI is not null");
		assert.ok(Element.getElementById("iconOLI"), "Icon is found in UI5 Core");
		assert.ok(Element.getElementById("iconOLI-Flagged"), "Flag icon is found in UI5 Core");
		assert.ok(Element.getElementById("iconOLI-Favorite"), "Favorite icon is found in UI5 Core");
		assert.ok(Element.getElementById("iconOLI-Locked"), "Locked icon is found in UI5 Core");
		iconOLI.destroy();
		assert.ok(!Element.getElementById("iconOLI-Flagged"), "Flag icon removed from UI5 Core");
		assert.ok(!Element.getElementById("iconOLI-Favorite"), "Favorite icon removed from UI5 Core");
		assert.ok(!Element.getElementById("iconOLI-Locked"), "Locked icon removed from UI5 Core");
	});

	QUnit.test("TestImageExit", function(assert) {

		assert.ok(!(imageOLI === null), "imageOLI is not null");
		assert.ok(Element.getElementById("imageOLI-img"), "Image is found in UI5 Core");
		imageOLI.destroy();
		assert.ok(!Element.getElementById("imageOLI-img"), "Image is removed from UI5 Core");
	});

	QUnit.test("TestTitleExit", function(assert) {

		assert.ok(!(titleOLI === null), "titleOLI is not null");
		assert.ok(Element.getElementById("titleOLI-titleText"), "Title text is found in UI5 Core");
		titleOLI.destroy();
		assert.ok(!Element.getElementById("titleOLI-titleText"), "Title text is removed from UI5 Core");
	});
});