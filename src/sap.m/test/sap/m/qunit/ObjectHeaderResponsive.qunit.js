/*global QUnit, sinon */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/ObjectHeader",
	"sap/m/ObjectStatus",
	"sap/ui/core/library",
	"sap/m/ObjectAttribute",
	"sap/ui/core/IconPool",
	"jquery.sap.global",
	"sap/ui/Device",
	"sap/m/ObjectMarker",
	"sap/m/library"
], function(
	qutils,
	createAndAppendDiv,
	ObjectHeader,
	ObjectStatus,
	coreLibrary,
	ObjectAttribute,
	IconPool,
	jQuery,
	Device,
	ObjectMarker,
	mobileLibrary
) {
	// shortcut for sap.m.ObjectMarkerType
	var ObjectMarkerType = mobileLibrary.ObjectMarkerType;

	// shortcut for sap.ui.core.TitleLevel
	var TitleLevel = coreLibrary.TitleLevel;

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	createAndAppendDiv("content");


	var sControlId = "ROHId",
		oCore = sap.ui.getCore();

	// Creates a ResponsiveObjectHeader with generic properties
	// Config object can be passed as argument. If some property already exist it will be overridden
	function createObjectHeader(oProps) {
		var oHeaderProps = {
			title: "Responsive Object Header",
			number: "1000",
			numberUnit: "EUR",
			responsive: true
		};
		oProps && jQuery.extend(oHeaderProps, oProps);

		return new ObjectHeader(sControlId, oHeaderProps);
	}

	// Adds iCount statuses to the oObjectHeader
	function addStatuses(oResponsiveObjectHeader, iCount) {
		for (var i = 1; i <= iCount; i++) {
			oResponsiveObjectHeader.addStatus(
					new ObjectStatus({
						text: "Status " + i,
						state: ValueState.Success
					})
			);
		}
	}

	// Adds iCount attributes to the oResponsiveObjectHeader
	function addAttributes(oResponsiveObjectHeader, iCount) {
		for (var i = 1; i <= iCount; i++) {
			oResponsiveObjectHeader.addAttribute(
					new ObjectAttribute({
						text: "Contract #D" + i
					})
			);
		}
	}

	// It's used many times and save a lot of line that's why has long name and do more than one thing
	function getColsCountAfterAddingStates(iStatusCount, iAttrCount, sCssQuery) {
		var oObjectHeader = oCore.byId(sControlId);

		addStatuses(oObjectHeader, iStatusCount);
		addAttributes(oObjectHeader, iAttrCount);
		oCore.applyChanges();

		return oObjectHeader.$().find(sCssQuery).length;
	}

	QUnit.module("Basic rendering");

	QUnit.test("Responsive header", function(assert){
		// Arrange
		var oObjectHeader = createObjectHeader();

		// System under test
		oObjectHeader.placeAt("qunit-fixture");
		oCore.applyChanges();

		// Assert
		var $objectHeader = oObjectHeader.$();

		assert.ok($objectHeader.hasClass("sapMOHROuter"), "Object header is rendered in responsive mode.");

		// Clean up
		oObjectHeader.destroy();
	});

	QUnit.test("Tooltip rendering", function(assert) {
		// Arrange
		var oObjectHeader = createObjectHeader({
			tooltip: "Test tooltip for the header"
		});

		// System under test
		oObjectHeader.placeAt("qunit-fixture");
		oCore.applyChanges();

		// Assert
		assert.equal(jQuery("#" + sControlId).attr("title"), "Test tooltip for the header", "Tooltip should is rendered.");

		// Clean up
		oObjectHeader.destroy();
	});

	QUnit.test("Title text div is not rendered when there is no text for the title", function (assert){
		// Arrange
		var oObjectHeader = createObjectHeader({
			title: ""
		});

		// System under test
		oObjectHeader.placeAt("qunit-fixture");
		oCore.applyChanges();

		// Assert
		var $sTitle = oObjectHeader.$("txt");
		assert.ok(!$sTitle.attr("href"), "No title text div is rendered");

		// Clean up
		oObjectHeader.destroy();
	});

	QUnit.test("Icon should be rendered", function (assert){
		// Arrange
		var oObjectHeader = createObjectHeader({
			icon: IconPool.getIconURI("inbox")
		});

		// System under test
		oObjectHeader.placeAt("qunit-fixture");
		oCore.applyChanges();

		// Assert
		var iconEl = jQuery.sap.domById(sControlId + "-img");
		assert.ok(iconEl, "Icon is rendered.");
		assert.ok(!oObjectHeader.$("img").attr("title"), "icon has no tooltip");

		// Clean up
		oObjectHeader.destroy();
	});

	QUnit.test("Title Icon has tooltip", function(assert){
		// Arrange
		var oObjectHeader = createObjectHeader({
			icon: IconPool.getIconURI("inbox"),
			iconTooltip: "test tooltip"
		});

		// System under Test
		oObjectHeader.placeAt("qunit-fixture");
		oCore.applyChanges();

		var $sImg = oObjectHeader.$("img");
		assert.equal($sImg.attr("title"), "test tooltip", "icon has tooltip");

		// Clean up
		oObjectHeader.destroy();
	});

	QUnit.test("Icon shouldn't be rendered", function (assert){
		// Arrange
		var oObjectHeader = createObjectHeader();

		// System under test
		oObjectHeader.placeAt("qunit-fixture");
		oCore.applyChanges();

		// Assert
		var iconEl = jQuery.sap.domById(sControlId + "-img");
		assert.ok(!iconEl, "Icon isn't rendered.");

		// Clean up
		oObjectHeader.destroy();
	});

	QUnit.test("Image shape", function(assert){
		// Arrange
		var oObjectHeader = createObjectHeader({
			icon: "../images/SAPUI5.jpg"
		});

		// System under Test
		oObjectHeader.placeAt("qunit-fixture");
		oCore.applyChanges();

		// Assert
		var $objectHeader = oObjectHeader.$("titleIcon");
		assert.ok($objectHeader.hasClass("sapMOHRIcon" + oObjectHeader.getImageShape()), "Object has class \"sapMOHRIconSquare\".");

		//Act
		oObjectHeader.setImageShape(sap.m.ObjectHeaderPictureShape.Circle);
		oCore.applyChanges();

		// Assert
		$objectHeader = oObjectHeader.$("titleIcon");
		assert.ok($objectHeader.hasClass("sapMOHRIcon" + oObjectHeader.getImageShape()), "Object has class \"sapMOHRIconCircle\".");

		// Clean up
		oObjectHeader.destroy();
	});

	QUnit.test("Title with icon should be rendered", function(assert){
		// Arrange
		var oObjectHeader = new ObjectHeader({
			title: "title",
			icon: "sap-icon://instance",
			responsive : true
		});

		// System under test
		oObjectHeader.placeAt("qunit-fixture");
		oCore.applyChanges();

		// Assert
		var $objectHeader = oObjectHeader.$("titlediv");

		assert.ok($objectHeader.hasClass("sapMOHRTitleIcon"), "Object has class \"sapMOHRTitleIcon\".");

		// Clean up
		oObjectHeader.destroy();
	});

	QUnit.test("Title without icon should be rendered", function(assert){
		// Arrange
		var oObjectHeader = new ObjectHeader({
			title: "title",
			responsive : true
		});

		// System under test
		oObjectHeader.placeAt("qunit-fixture");
		oCore.applyChanges();

		// Assert
		var $objectHeader = oObjectHeader.$("titlediv");

		assert.ok(!$objectHeader.hasClass("sapMOHRTitleIcon"), "Object doesn't have class \"sapMOHRTitleIcon\".");

		// Clean up
		oObjectHeader.destroy();
	});

	QUnit.test("Title occupies the whole available space when no number", function(assert){
		// arrange
		var oObjectHeader = new ObjectHeader({
			title: "Full title test",
			responsive: true
		});

		// system under test
		oObjectHeader.placeAt("qunit-fixture");
		oCore.applyChanges();

		// Assert
		var $objectHeader = oObjectHeader.$("titlediv");

		assert.ok($objectHeader.hasClass("sapMOHRTitleDivFull"), "title occupies the whole available space");
		assert.equal($objectHeader.width(), oObjectHeader.$("titlenumdiv").width(), "title div width is equal to titleNumber div");

		// Clean up
		oObjectHeader.destroy();
	});

	QUnit.test("Title arrow should be rendered", function (assert){
		// Arrange
		var oObjectHeader = createObjectHeader({
			showTitleSelector: true
		});

		// System under test
		oObjectHeader.placeAt("qunit-fixture");
		oCore.applyChanges();

		// Assert
		var titleSelectorEl = jQuery.sap.domById(sControlId + "-titleArrow");
		assert.ok(titleSelectorEl, "Title arrow is rendered.");

		// Clean up
		oObjectHeader.destroy();
	});

	QUnit.test("Title arrow shouldn't be rendered", function (assert){
		// Arrange
		var oObjectHeader = createObjectHeader();

		// System under test
		oObjectHeader.placeAt("qunit-fixture");
		oCore.applyChanges();

		// Assert
		var titleSelectorEl = jQuery.sap.domById(sControlId + "-titleArrow");
		assert.ok(!titleSelectorEl, "Title arrow is not rendered.");

		// Clean up
		oObjectHeader.destroy();
	});

	QUnit.test("Info should be rendered", function (assert){
		var sIntro = "Some intro text that describes the object!";

		// Arrange
		var oObjectHeader = createObjectHeader({
			intro: sIntro
		});

		// System under test
		oObjectHeader.placeAt("qunit-fixture");
		oCore.applyChanges();

		// Assert
		var introEl = jQuery.sap.domById(sControlId + "-intro");
		assert.ok(introEl, "Intro is rendered");
		assert.equal(introEl.textContent, sIntro, "Intro exist and it is with the right value.");

		// Clean up
		oObjectHeader.destroy();
	});

	QUnit.test("Info shouldn't be rendered", function (assert){

		// Arrange
		var oObjectHeader = createObjectHeader();

		// System under test
		oObjectHeader.placeAt("qunit-fixture");
		oCore.applyChanges();

		// Assert
		var introEl = jQuery.sap.domById(sControlId + "-intro");
		assert.ok(!introEl, "Intro isn't rendered");

		// Clean up
		oObjectHeader.destroy();
	});

	QUnit.test("Title is active and is rendered as a link", function (assert){
		// Arrange
		var oObjectHeader = createObjectHeader({
			title: "OH title",
			titleActive: true,
			titleHref: "http://www.sap.com"
		});

		// System under test
		oObjectHeader.placeAt("qunit-fixture");
		oCore.applyChanges();

		// Assert
		var $sTitle = oObjectHeader.$("txt");
		assert.ok($sTitle.attr("href"), "Title has attribute href and is a link.");

		// Clean up
		oObjectHeader.destroy();
	});

	QUnit.test("Title is active but it's not a link", function (assert){
		// Arrange
		var oObjectHeader = createObjectHeader({
			title: "OH title",
			titleActive: true
		});

		// System under test
		oObjectHeader.placeAt("qunit-fixture");
		oCore.applyChanges();

		// Assert
		var $sTitle = oObjectHeader.$("txt");
		assert.equal($sTitle.attr("href"), undefined, "Title attribute href is not a link.");

		// Clean up
		oObjectHeader.destroy();
	});

	QUnit.test("titleActive is set to true but no Title is provided", function (assert){
		// Arrange
		var oObjectHeader = createObjectHeader({
			title: "",
			titleActive: true
		});

		// System under test
		oObjectHeader.placeAt("qunit-fixture");
		oCore.applyChanges();

		// Assert
		var $objectHeader = oObjectHeader.$("title");
		assert.ok(!$objectHeader.hasClass("sapMOHRTitleActive"), "Title div doesn't have the active class \"sapMOHRTitleActive\".");

		// Clean up
		oObjectHeader.destroy();
	});

	QUnit.test("Intro is sap.mLink when it is active", function (assert){
		// Arrange
		var oObjectHeader = createObjectHeader({
			intro: "OH intro text",
			introActive: true
		});

		// System under test
		oObjectHeader.placeAt("qunit-fixture");
		oCore.applyChanges();

		// Assert
		var $sIntro = oObjectHeader.$("intro");
		assert.ok($sIntro.hasClass("sapMLnk"), "Intro is sap.m.Link");

		// Clean up
		oObjectHeader.destroy();
	});

	QUnit.test("Active title tap", function(assert){
		var domRef = null;
		var eventHandler = function(oEvent) {
			domRef = oEvent.getParameters().domRef;
		};

		var oObjectHeader = createObjectHeader({
			title: "OH title - last word will be cut from the rest of the title",
			titleActive: true,
			titlePress: eventHandler,
			showMarkers: true,
			markFlagged: true,
			markFavorite: true
		});

		// System under test
		oObjectHeader.placeAt("qunit-fixture");
		oCore.applyChanges();

		sap.ui.test.qunit.triggerEvent("tap", oObjectHeader.$("txt"));
		assert.equal(domRef.id, oObjectHeader.$("txt").attr("id"), "Title should be clickable when clicking on \"a\" element");
		domRef = null;

		qutils.triggerEvent("tap", oObjectHeader.$("txt").children(0));
		assert.equal(domRef.id, oObjectHeader.$("txt").attr("id"), "When clicking inner span element of the \"a\" element event should return \"a\" element id as source");
		domRef = null;

		// Clean up
		oObjectHeader.destroy();
	});

	QUnit.test("Active title getFocusDomRef", function(assert){
		var oObjectHeader = createObjectHeader({
			title: "OH title",
			titleActive: true
		});

		// System under test
		oObjectHeader.placeAt("qunit-fixture");
		oCore.applyChanges();

		assert.equal(oObjectHeader.getFocusDomRef().attr("id"), oObjectHeader.$("txt").attr("id"), "Focus domRef is correct");

		// Clean up
		oObjectHeader.destroy();
	});

	QUnit.test("Tap on ObjectHeader title arrow span should lead to preventing default action", function(assert){
		var oEvent_title_arrow,
			oSpyPreventDefaultTitleArrow,
			oObjectHeader = createObjectHeader({
				title: "OH title",
				responsive: true,
				titleActive: true
			});

		// System under test
		oObjectHeader.placeAt("qunit-fixture");
		oCore.applyChanges();

		// click on title arrow div
		oEvent_title_arrow = {
			setMarked: function(){},
			preventDefault: function(){},
			stopPropagation: function(){},
			target: oObjectHeader.$("title-arrow").get(0)
		};

		oSpyPreventDefaultTitleArrow = this.spy(oEvent_title_arrow, "preventDefault");

		oObjectHeader.ontap(oEvent_title_arrow);
		assert.equal(oSpyPreventDefaultTitleArrow.callCount, 1, ".. prevents default browser action");

		// Clean up
		oSpyPreventDefaultTitleArrow.restore();
		oObjectHeader.destroy();
	});

	QUnit.test("Tap on ObjectAttribute should not lead to preventing default action", function(assert){
		var oEvent_attr,
			oSpyPreventDefaultOA,
			oa1 = new ObjectAttribute("attrId", {title: "title", text: "link", active: true}),
			oObjectHeader = createObjectHeader({
				title: "OH title",
				responsive: true,
				titleActive: true,
				attributes: [oa1]
			});

		// System under test
		oObjectHeader.placeAt("qunit-fixture");
		oCore.applyChanges();

		// click on ObjectAttribute link
		oEvent_attr = {
			setMarked: function(){},
			preventDefault: function(){},
			stopPropagation: function(){},
			target: oa1.$().children()[2]
		};

		oSpyPreventDefaultOA = this.spy(oEvent_attr, "preventDefault");

		oObjectHeader.ontap(oEvent_attr);
		assert.equal(oSpyPreventDefaultOA.callCount, 0, "preventDefault wasn't called");

		// Clean up
		oSpyPreventDefaultOA.restore();
		oObjectHeader.destroy();
	});

	QUnit.module("Basic aggregations rendering", {
		afterEach: function () {
			oCore.byId(sControlId).destroy();
		}
	});

	QUnit.test("Attribute should be rendered", function (assert){
		// Arrange
		var oObjectHeader = createObjectHeader({
			attributes: [
				new ObjectAttribute({
					title: "Manufacturer",
					text: "ACME Corp",
					active: true
				})
			]
		});

		// System under test
		oObjectHeader.placeAt("qunit-fixture");
		oCore.applyChanges();

		// Assert
		var attr = oObjectHeader.$().find(".sapMOHRAttr");
		assert.ok(attr.length, "One attribute is rendered.");
	});

	QUnit.test("Attribute shouldn't be rendered", function (assert){
		// Arrange
		var oObjectHeader = createObjectHeader();

		// System under test
		oObjectHeader.placeAt("qunit-fixture");
		oCore.applyChanges();

		// Assert
		var attr = oObjectHeader.$().find(".sapMOHRAttr");
		assert.ok(!attr.length, "Zero attributes are rendered.");
	});

	QUnit.test("Attribute shouldn't be rendered if it has empty title and text", function (assert){
		// Arrange
		var oObjectHeader = createObjectHeader();
		var oAttr = new ObjectAttribute({
			title: "",
			text: ""
		});
		oObjectHeader.insertAttribute(oAttr, 0);

		// System under test
		oObjectHeader.placeAt("qunit-fixture");
		oCore.applyChanges();

		// Assert
		var attr = oObjectHeader.$().find(".sapMOHRAttr");
		assert.ok(!attr.length, "Zero attributes are rendered.");
	});

	QUnit.test("Attribute should be rendered after insertAttribute", function (assert){
		// Arrange
		var oObjectHeader = createObjectHeader();
		var oAttr = new ObjectAttribute({
			title: "Manufacturer",
			text: "ACME Corp",
			active: true
		});
		oObjectHeader.insertAttribute(oAttr, 0);

		// System under test
		oObjectHeader.placeAt("qunit-fixture");
		oCore.applyChanges();

		// Assert
		var attr = oObjectHeader.$().find(".sapMOHRAttr");
		assert.ok(attr.length, "One attribute is rendered.");
	});

	QUnit.test("Attribute should be removed: removeAttribute", function (assert){
		// Arrange
		var oObjectHeader = createObjectHeader();
		var oAttr = new ObjectAttribute({
			title: "Manufacturer",
			text: "ACME Corp",
			active: true
		});
		oObjectHeader.insertAttribute(oAttr, 0);

		// System under test
		oObjectHeader.placeAt("qunit-fixture");
		oCore.applyChanges();

		// Assert
		var attr = oObjectHeader.$().find(".sapMOHRAttr");
		assert.ok((attr.length == 1), "One attribute is rendered.");

		oObjectHeader.removeAttribute(oAttr);
		oCore.applyChanges();

		// Assert
		attr = oObjectHeader.$().find(".sapMOHRAttr");
		assert.ok(!attr.length, "The attribute is removed.");
	});

	QUnit.test("Attributes should be removed: removeAllAttributes", function (assert){
		// Arrange
		var oObjectHeader = createObjectHeader();
		addAttributes(oObjectHeader, 2);

		// System under test
		oObjectHeader.placeAt("qunit-fixture");
		oCore.applyChanges();

		// Assert
		var attr = oObjectHeader.$().find(".sapMOHRAttr");
		assert.ok((attr.length == 2), "Two attributes are rendered.");

		oObjectHeader.removeAllAttributes();
		oCore.applyChanges();

		// Assert
		attr = oObjectHeader.$().find(".sapMOHRAttr");
		assert.ok(!attr.length, "All attributes are removed.");
	});

	QUnit.test("removeAllAttributes when no attributes at all", function (assert){
		// Arrange
		var oObjectHeader = createObjectHeader();

		// System under test
		oObjectHeader.placeAt("qunit-fixture");
		oCore.applyChanges();

		oObjectHeader.removeAllAttributes();
		oCore.applyChanges();

		// Assert
		var attr = oObjectHeader.$().find(".sapMOHRAttr");
		assert.ok(!attr.length, "No error is raised when executing removeAllAttributes");
	});

	QUnit.test("Attributes should be destroyed: destroyAttributes", function (assert){
		// Arrange
		var oObjectHeader = createObjectHeader();
		addAttributes(oObjectHeader, 2);

		// System under test
		oObjectHeader.placeAt("qunit-fixture");
		oCore.applyChanges();

		// Assert
		var attr = oObjectHeader.$().find(".sapMOHRAttr");
		assert.ok((attr.length == 2), "Two attributes are rendered.");

		oObjectHeader.destroyAttributes();
		oCore.applyChanges();

		// Assert
		attr = oObjectHeader.$().find(".sapMOHRAttr");
		assert.ok(!attr.length, "All attributes are destroyed.");
	});

	QUnit.test("Status should be rendered", function (assert){
		// Arrange
		var oObjectHeader = createObjectHeader({
			statuses: [
				new ObjectStatus({
					title: "Approval",
					text: "Pending",
					state: ValueState.Warning
				})
			]
		});

		// System under test
		oObjectHeader.placeAt("qunit-fixture");
		oCore.applyChanges();

		// Assert
		var status = oObjectHeader.$().find(".sapMOHRStatus");
		assert.ok(status.length, "Status is rendered.");
	});

	QUnit.test("Status shouldn't be rendered", function (assert){
		// Arrange
		var oObjectHeader = createObjectHeader();

		// System under test
		oObjectHeader.placeAt("qunit-fixture");
		oCore.applyChanges();

		// Assert
		var status = oObjectHeader.$().find(".sapMOHRStatus");
		assert.ok(!status.length, "Zero statuses are rendered.");
	});

	QUnit.test("Status shouldn't be rendered if the title and text are empty", function (assert){
		// Arrange
		var oObjectHeader = createObjectHeader();
		var oStatus = new ObjectStatus({
			title: "",
			text: ""
		});
		var oAttr = new ObjectAttribute({
			title: "",
			text: ""
		});
		oObjectHeader.insertAttribute(oAttr, 0);
		oObjectHeader.insertStatus(oStatus, 0);

		// System under test
		oObjectHeader.placeAt("qunit-fixture");
		oCore.applyChanges();

		// Assert
		var status = oObjectHeader.$().find(".sapMOHRStatus");
		assert.ok(!status.length, "Zero statuses are rendered.");
	});

	QUnit.test("Status should be rendered after insertStatus", function (assert){
		// Arrange
		var oObjectHeader = createObjectHeader();
		var oStatus = new ObjectStatus({
			title: "Approval",
			text: "Pending",
			state: ValueState.Warning
		});
		oObjectHeader.insertStatus(oStatus, 0);

		// System under test
		oObjectHeader.placeAt("qunit-fixture");
		oCore.applyChanges();

		// Assert
		var status = oObjectHeader.$().find(".sapMOHRStatus");
		assert.ok(status.length, "Status is rendered.");
	});

	QUnit.test("Status should be removed: removeStatus", function (assert){
		// Arrange
		var oObjectHeader = createObjectHeader();
		var oStatus = new ObjectStatus({
			title: "Approval",
			text: "Pending",
			state: ValueState.Warning
		});
		oObjectHeader.insertStatus(oStatus, 0);

		// System under test
		oObjectHeader.placeAt("qunit-fixture");
		oCore.applyChanges();

		// Assert
		var status = oObjectHeader.$().find(".sapMOHRStatus");
		assert.ok((status.length === 1), "One status is rendered.");

		oObjectHeader.removeStatus(oStatus);
		oCore.applyChanges();

		// Assert
		status = oObjectHeader.$().find(".sapMOHRStatus");
		assert.ok(!status.length, "The status is removed.");
	});

	QUnit.test("Statuses should be removed: removeAllStatuses", function (assert){
		// Arrange
		var oObjectHeader = createObjectHeader();
		addStatuses(oObjectHeader, 2);

		// System under test
		oObjectHeader.placeAt("qunit-fixture");
		oCore.applyChanges();

		// Assert
		var status = oObjectHeader.$().find(".sapMOHRStatus");
		assert.ok(status.length === 2, "Two statuses are rendered.");

		oObjectHeader.removeAllStatuses();
		oCore.applyChanges();

		// Assert
		status = oObjectHeader.$().find(".sapMOHRStatus");
		assert.ok(!status.length, "All statuses are removed.");
	});

	QUnit.test("removeAllStatuses when no statuses at all", function (assert){
		// Arrange
		var oObjectHeader = createObjectHeader();

		// System under test
		oObjectHeader.placeAt("qunit-fixture");
		oCore.applyChanges();

		oObjectHeader.removeAllStatuses();
		oCore.applyChanges();

		// Assert
		var status = oObjectHeader.$().find(".sapMOHRStatus");
		assert.ok(!status.length, "No error is raised when executing removeAllStatuses");
	});

	QUnit.test("Statuses should be destroyed: destroyStatuses", function (assert){
		// Arrange
		var oObjectHeader = createObjectHeader();
		addStatuses(oObjectHeader, 2);

		// System under test
		oObjectHeader.placeAt("qunit-fixture");
		oCore.applyChanges();

		// Assert
		var status = oObjectHeader.$().find(".sapMOHRStatus");
		assert.ok(status.length === 2, "Two statuses are rendered.");

		oObjectHeader.destroyStatuses();
		oCore.applyChanges();

		// Assert
		status = oObjectHeader.$().find(".sapMOHRStatus");
		assert.ok(!status.length, "All statuses are destroyed.");
	});

	QUnit.module("Desktop master detail rendering", {
		beforeEach: function () {
			var oObjectHeader = createObjectHeader();
			oObjectHeader.placeAt("qunit-fixture");
		},
		afterEach: function () {
			oCore.byId(sControlId).destroy();
		}
	});

	QUnit.test("3 states rendered in 2 columns", function (assert){
		var count = getColsCountAfterAddingStates(1, 2, ".sapMOHRTwoCols");

		// Assert
		assert.equal(count, 2, "States are rendered in 2 columns.");
		assert.notEqual(count, 3, "States aren't rendered in 3 columns.");
	});

	QUnit.test("5 states rendered in 3 columns", function (assert){
		var count = getColsCountAfterAddingStates(2, 3, ".sapMOHRThreeCols");

		// Assert
		assert.equal(count, 3, "States are rendered in 3 columns.");
		assert.notEqual(count, 2, "States aren't rendered in 2 columns.");
	});

	QUnit.module("Desktop fullScreenOptimized rendering", {
		beforeEach: function () {
			var oObjectHeader = createObjectHeader({
				fullScreenOptimized: true
			});

			oObjectHeader.placeAt("qunit-fixture");
			oCore.applyChanges();
		},
		afterEach: function () {
			oCore.byId(sControlId).destroy();
		}
	});

	QUnit.test("2 states rendered next to title block", function (assert){
		var count = getColsCountAfterAddingStates(1, 1, ".sapMOHRStatesOneOrThree .sapMOHROneCols");
		var count2 = getColsCountAfterAddingStates(1, 1, "sapMOHRTwoCols");

		// Assert
		assert.equal(count, 1, "2 states are rendered next to title block");
		assert.equal(count2, 0, "2 states aren't rendered below the title block in two columns");
	});

	QUnit.test("5 states rendered in 4 columns", function (assert){
		var count = getColsCountAfterAddingStates(3, 2, ".sapMOHRFourCols");

		// Assert
		assert.equal(count, 4, "5 states are rendered in 4 columns");
		assert.notEqual(count, 3, "States aren't rendered in 3 columns.");
	});

	QUnit.module("Desktop on Combi device (e.g. both system Desktop and Tablet return true) - master detail rendering", {
		beforeEach: function () {
			this.bSystemDesktop = Device.system.desktop;
			this.bSystemTablet = Device.system.tablet;

			Device.system.desktop = true;
			Device.system.tablet = true;

			var oObjectHeader = createObjectHeader();
			oObjectHeader.placeAt("qunit-fixture");
		},
		afterEach: function () {
			Device.system.desktop = this.bSystemDesktop;
			Device.system.tablet = this.bSystemTablet;
			oCore.byId(sControlId).destroy();
		}
	});

	QUnit.test("3 states rendered in 2 columns", function (assert){
		var count = getColsCountAfterAddingStates(1, 2, ".sapMOHRTwoCols");

		// Assert
		assert.equal(count, 2, "States are rendered in 2 columns.");
		assert.notEqual(count, 3, "States aren't rendered in 3 columns.");
	});

	QUnit.test("5 states rendered in 3 columns", function (assert){
		var count = getColsCountAfterAddingStates(2, 3, ".sapMOHRThreeCols");

		// Assert
		assert.equal(count, 3, "States are rendered in 3 columns.");
		assert.notEqual(count, 2, "States aren't rendered in 2 columns.");
	});

	QUnit.module("Desktop on Combi device (e.g. both system Desktop and Tablet return true) - fullScreenOptimized should be rendered as on a 'normal' device", {
		beforeEach: function () {
			this.bSystemDesktop = Device.system.desktop;
			this.bSystemTablet = Device.system.tablet;

			Device.system.desktop = true;
			Device.system.tablet = true;

			var oObjectHeader = createObjectHeader({
				fullScreenOptimized: true
			});

			oObjectHeader.placeAt("qunit-fixture");
			oCore.applyChanges();
		},
		afterEach: function () {
			Device.system.desktop = this.bSystemDesktop;
			Device.system.tablet = this.bSystemTablet;
			oCore.byId(sControlId).destroy();
		}
	});

	QUnit.test("2 states rendered next to title block", function (assert){
		var count = getColsCountAfterAddingStates(1, 1, ".sapMOHRStatesOneOrThree .sapMOHROneCols");
		var count2 = getColsCountAfterAddingStates(1, 1, "sapMOHRTwoCols");

		// Assert
		assert.equal(count, 1, "2 states are rendered next to title block");
		assert.equal(count2, 0, "2 states aren't rendered below the title block in two columns");
	});

	QUnit.test("5 states rendered in 4 columns", function (assert){
		var count = getColsCountAfterAddingStates(3, 2, ".sapMOHRFourCols");

		// Assert
		assert.equal(count, 4, "5 states are rendered in 4 columns");
		assert.notEqual(count, 3, "States aren't rendered in 3 columns.");
	});

	QUnit.module("Desktop rendering resized to Tablet size", {
		beforeEach: function () {
			this.oStub = sinon.stub(ObjectHeader.prototype, "_isMediaSize");
			this.oStub.withArgs("Desktop").returns(false).withArgs("Tablet").returns(true).withArgs("Phone").returns(false);
		},
		afterEach: function () {
			this.oStub.restore();

			oCore.byId(sControlId).destroy();
		}
	});

	QUnit.test("Master detail rendering: 3 states rendered in 2 columns", function (assert){
		var oObjectHeader = createObjectHeader();

		// System Under Test
		oObjectHeader.placeAt("qunit-fixture");
		oCore.applyChanges();

		var count = getColsCountAfterAddingStates(2, 1, ".sapMOHRTwoCols");

		// Assert
		assert.equal(count, 2, "3 states are rendered in two columns");
		assert.notEqual(count, 1, "States aren't rendered in 1 column.");
	});

	QUnit.test("2 states in fullScreenOptimized mode rendered in 2 columns", function (assert){

		var oObjectHeader = createObjectHeader({
			fullScreenOptimized: true
		});

		// System Under Test
		oObjectHeader.placeAt("qunit-fixture");
		oCore.applyChanges();

		var count = getColsCountAfterAddingStates(1, 1, ".sapMOHRTwoCols");

		//Assert
		assert.equal(count, 2, "2 states are rendered in two columns in FullscreenOptimized mode (desktop - tablet size)");
		assert.notEqual(count, 1, "States aren't rendered in 1 column.");
	});

	QUnit.test("5 states in fullScreenOptimized mode rendered in 3 columns", function (assert){

		var oObjectHeader = createObjectHeader({
			fullScreenOptimized: true
		});

		// System Under Test
		oObjectHeader.placeAt("qunit-fixture");
		oCore.applyChanges();

		var count = getColsCountAfterAddingStates(3, 2, ".sapMOHRThreeCols");

		//Assert
		assert.equal(count, 3, "5 states are rendered in three columns in FullscreenOptimized mode (desktop - tablet size)");
		assert.notEqual(count, 4, "States aren't rendered in 4 columns.");
	});

	QUnit.module("Desktop rendering resized to Phone size", {
		beforeEach: function () {
			this.oStub = sinon.stub(ObjectHeader.prototype, "_isMediaSize");
			this.oStub.withArgs("Desktop").returns(false).withArgs("Tablet").returns(false).withArgs("Phone").returns(true);
		},
		afterEach: function () {
			this.oStub.restore();

			oCore.byId(sControlId).destroy();
		}
	});

	QUnit.test("5 states rendered in 1 column", function (assert){
		var oObjectHeader = createObjectHeader();

		// System under Test
		oObjectHeader.placeAt("qunit-fixture");
		oCore.applyChanges();

		var count = getColsCountAfterAddingStates(2, 3,".sapMOHROneCols");
		// Assert
		assert.equal(count, 1, "5 states are rendered in one column on desktop - phone size");
		assert.notEqual(count, 2, "States aren't rendered in 2 columns.");
	});


	QUnit.module("Tablet rendering", {
		beforeEach: function () {
			this.oStub = sinon.stub(ObjectHeader.prototype, "_isMediaSize");
			this.oStub.withArgs("Desktop").returns(false).withArgs("Tablet").returns(true).withArgs("Phone").returns(false);
		},
		afterEach: function () {
			this.oStub.restore();

			oCore.byId(sControlId).destroy();
		}
	});

	QUnit.test("Master detail rendering: 3 states rendered in 2 columns", function (assert){
		var oObjectHeader = createObjectHeader();

		// System Under Test
		oObjectHeader.placeAt("qunit-fixture");
		oCore.applyChanges();

		var count = getColsCountAfterAddingStates(2, 1, ".sapMOHRTwoCols");

		// Assert
		assert.equal(count, 2, "3 states are rendered in two columns");
		assert.notEqual(count, 3, "States aren't rendered in 3 columns.");
	});

	QUnit.test("4 states in fullScreenOptimized mode rendered in 2 columns in portrait mode", function (assert){
		Device.orientation.landscape = false;
		Device.orientation.portrait = true;


		var oObjectHeader = createObjectHeader({
			fullScreenOptimized: true
		});

		// System Under Test
		oObjectHeader.placeAt("qunit-fixture");
		oCore.applyChanges();

		var count = getColsCountAfterAddingStates(2, 2, ".sapMOHRTwoCols");

		//Assert
		assert.equal(count, 2, "4 states are rendered in two columns in portrait mode");
		assert.notEqual(count, 4, "States aren't rendered in 4 columns.");
	});

	QUnit.test("2 states in fullScreenOptimized mode rendered in 2 columns in landscape mode", function (assert){
		Device.orientation.landscape = true;
		Device.orientation.portrait = false;

		var oObjectHeader = createObjectHeader({
			fullScreenOptimized: true
		});

		// System under Test
		oObjectHeader.placeAt("qunit-fixture");
		oCore.applyChanges();

		var count = getColsCountAfterAddingStates(1, 1, ".sapMOHRTwoCols");

		// Assert
		assert.equal(count, 2, "2 states are rendered in two columns in landscape mode");
		assert.notEqual(count, 1, "States aren't rendered in 1 column.");
	});

	QUnit.test("5 states in fullScreenOptimized mode rendered in 3 columns in landscape mode", function (assert){
		Device.orientation.landscape = true;
		Device.orientation.portrait = false;

		var oObjectHeader = createObjectHeader({
			fullScreenOptimized: true
		});

		// System under Test
		oObjectHeader.placeAt("qunit-fixture");
		oCore.applyChanges();

		var count = getColsCountAfterAddingStates(3, 2, ".sapMOHRThreeCols");

		// Assert
		assert.equal(count, 3, "5 states are rendered in 3 columns in landscape mode");
		assert.notEqual(count, 2, "States aren't rendered in 2 columns.");
	});


	QUnit.module("Phone rendering", {
			beforeEach: function () {
				this.oStub = sinon.stub(ObjectHeader.prototype, "_isMediaSize");
				this.oStub.withArgs("Desktop").returns(false).withArgs("Tablet").returns(false).withArgs("Phone").returns(true);

				Device.orientation.landscape = false;
				Device.orientation.portrait = true;
			},
			afterEach: function () {
				this.oStub.restore();

				Device.orientation.landscape = true;
				Device.orientation.portrait = false;

				oCore.byId(sControlId).destroy();
			}
		});

	QUnit.test("6 states rendered in 1 column", function (assert){
		var oObjectHeader = createObjectHeader();

		// System under Test
		oObjectHeader.placeAt("qunit-fixture");
		oCore.applyChanges();

		var count = getColsCountAfterAddingStates(3, 3,".sapMOHROneCols");
		// Assert
		assert.equal(count, 1, "6 states are rendered in one column on phone");
		assert.notEqual(count, 3, "States aren't rendered in 3 columns.");
	});


	/******************************************************************/
	QUnit.module("OH Screen Reader support", {
		afterEach: function () {
			oCore.byId(sControlId).destroy();
		}
	});

	QUnit.test("OH has aria-labelledby", function(assert){
		// Arrange
		var oObjectHeader = createObjectHeader();

		// System under Test
		oObjectHeader.placeAt("qunit-fixture");
		oCore.applyChanges();

		assert.ok(oObjectHeader.$().attr("aria-labelledby"), "OH has attribute aria-labelledby");
	});

	QUnit.test("OH has attribute role=region", function(assert){
		// Arrange
		var oObjectHeader = createObjectHeader();

		// System under Test
		oObjectHeader.placeAt("qunit-fixture");
		oCore.applyChanges();

		var $objectHeader = oObjectHeader.$();

		assert.ok($objectHeader.attr("role"), "OH has attribute role");
		assert.equal($objectHeader.attr("role"), "region", "role is region");
	});

	QUnit.test("Active title has aria attributes", function(assert){
		// Arrange
		var oObjectHeader = createObjectHeader({
			title: "OH title",
			titleActive: true
		});

		// System under test
		oObjectHeader.placeAt("qunit-fixture");
		oCore.applyChanges();

		// Assert
		var $sTitle = oObjectHeader.$("txt");
		assert.ok($sTitle.attr("aria-haspopup"), "ActiveTitle has attribute aria-haspopup");
		assert.equal($sTitle.attr("role"), "link", "ActiveTitle has role=link");
	});

	QUnit.test("Active icon has aria attributes", function(assert){
		// Arrange
		var oObjectHeader = createObjectHeader({
			icon: IconPool.getIconURI("inbox"),
			iconActive: true
		});

		// System under test
		oObjectHeader.placeAt("qunit-fixture");
		oCore.applyChanges();

		// Assert
		assert.equal(jQuery(".sapMOHRIcon.sapMPointer .sapUiIcon.sapUiIconPointer").attr("role"), "button", "ActiveIcon has role=button");
	});

	QUnit.test("Title Image has aria-labelledby and tooltip", function(assert){
		// Arrange
		var oObjectHeader = createObjectHeader({
			icon: "../images/SAPUI5.jpg",
			iconAlt: "test image",
			iconTooltip: "test tooltip"
		});

		// System under Test
		oObjectHeader.placeAt("qunit-fixture");
		oCore.applyChanges();

		var $sImg = oObjectHeader.$("img");
		assert.ok($sImg.attr("aria-label"), "image has attribute aria-label");
		assert.equal($sImg.attr("title"), "test tooltip", "image has tooltip");
	});

	QUnit.test("Title has level H1", function(assert){
		// Arrange
		var oObjectHeader = createObjectHeader({
			title: "OH title"
		});

		// System under test
		oObjectHeader.placeAt("qunit-fixture");
		oCore.applyChanges();

		// Assert
		var $sTitle = oObjectHeader.$("title");
		assert.ok($sTitle.find( "h1" ), "Title has the default titleLevel H1");
	});

	QUnit.test("Title has level H3", function(assert){
		// Arrange
		var oObjectHeader = createObjectHeader({
			title: "OH title",
			titleLevel: TitleLevel.H3
		});

		// System under test
		oObjectHeader.placeAt("qunit-fixture");
		oCore.applyChanges();

		// Assert
		var $sTitle = oObjectHeader.$("title");
		assert.ok($sTitle.find( "h3" ), "Title has titleLevel H13");
	});

	QUnit.test("Title level is set correctly", function(assert){
		// Arrange
		var oObjectHeader = createObjectHeader({
			title: "OH title"
		});

		// System under test
		oObjectHeader.placeAt("qunit-fixture");
		oCore.applyChanges();

		oObjectHeader.setTitleLevel("H4");
		oCore.applyChanges();

		// Assert
		var $sTitle = oObjectHeader.$("title");
		assert.ok($sTitle.find( "h4" ), "Title has titleLevel H4");
	});

	QUnit.test("When set to Auto title has level H1", function(assert){
		// Arrange
		var oObjectHeader = createObjectHeader({
			title: "OH title",
			titleLevel: TitleLevel.Auto
		});

		// System under test
		oObjectHeader.placeAt("qunit-fixture");
		oCore.applyChanges();

		// Assert
		var $sTitle = oObjectHeader.$("title");
		assert.ok($sTitle.find( "h1" ), "Title has titleLevel H1");
	});

	QUnit.module("Rendering Markers aggregation");

	QUnit.test("Render Draft and Favorite", function(assert){
		var oObjectHeader = createObjectHeader({
			title : "Markers agregation",
			number : "3.624",
			numberUnit : "EUR",
			markers: [
					new ObjectMarker({id: "draft", type: ObjectMarkerType.Draft}),
					new ObjectMarker({id: "favorite", type: ObjectMarkerType.Favorite})
					]
		});

		// System under test
		oObjectHeader.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		assert.ok(jQuery.sap.domById("draft"), "marker draft should be rendered.");
		assert.ok(jQuery.sap.domById("favorite"), "marker favorite should be rendered.");

		oObjectHeader.destroy();
	});

	QUnit.test("Render marker by setting the markers aggregation", function(assert){
		var oObjectHeader = createObjectHeader({
			id: "markersOH",
			title : "Markers agregation",
			number : "3.624",
			numberUnit : "EUR"
		});
		var marker = new ObjectMarker({id: "draft", type: ObjectMarkerType.Draft});

		// System under test
		oObjectHeader.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		var $allRows = jQuery("#markersOH .sapMObjStatusMarker");
		assert.ok($allRows.length === 0, "There are no markers");

		oObjectHeader.insertMarker(marker, 0);
		sap.ui.getCore().applyChanges();

		assert.ok(jQuery.sap.domById("draft"), "marker draft should be rendered.");

		oObjectHeader.destroy();
	});

	QUnit.test("Removing marker", function(assert){
		var oObjectHeader = createObjectHeader({
			id: "markersOlI",
			title : "Markers agregation",
			number : "3.624",
			numberUnit : "EUR",
			markers: [
					new ObjectMarker({id: "flag", type: ObjectMarkerType.Flagged})
					]
		});

		// System under test
		oObjectHeader.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		assert.ok(jQuery.sap.domById("flag"), "marker flag should be rendered.");

		oObjectHeader.removeAllMarkers();
		sap.ui.getCore().applyChanges();

		var $allRows = jQuery("#markersOH .sapMObjStatusMarker");
		assert.ok($allRows.length === 0, "There are no markers");

		oObjectHeader.destroy();
	});
});