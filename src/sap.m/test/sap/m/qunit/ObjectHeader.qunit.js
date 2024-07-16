/*global QUnit */
sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/core/IconPool",
	"sap/m/ObjectAttribute",
	"sap/m/ObjectStatus",
	"sap/ui/core/library",
	"sap/m/ProgressIndicator",
	"sap/m/ObjectHeader",
	"sap/m/library",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/thirdparty/jquery",
	"sap/m/ObjectNumber",
	"sap/m/ObjectMarker",
	"sap/m/Label",
	"sap/ui/events/KeyCodes"
], function(
	Element,
	qutils,
	IconPool,
	ObjectAttribute,
	ObjectStatus,
	coreLibrary,
	ProgressIndicator,
	ObjectHeader,
	mobileLibrary,
	nextUIUpdate,
	jQuery,
	ObjectNumber,
	ObjectMarker,
	Label,
	KeyCodes
) {
	"use strict";

	// shortcut for sap.m.ObjectMarkerType
	var ObjectMarkerType = mobileLibrary.ObjectMarkerType;

	// shortcut for sap.ui.core.TitleLevel
	var TitleLevel = coreLibrary.TitleLevel;

	// shortcut for sap.m.BackgroundDesign
	var BackgroundDesign = mobileLibrary.BackgroundDesign;

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	// Event handler
	var domRef = null;
	var eventHandler = function(oEvent) {
		domRef = oEvent.getParameters().domRef;
	};


	QUnit.module("Rendering All Fields", {
		beforeEach: async function () {
			this.sID = "oOHBasic";
			this.oOH = new ObjectHeader(this.sID, {
				intro : "On behalf of John Smith",
				title : "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis luctus, turpis vitae porttitor hendrerit, elit dui mollis neque, id suscipit lorem mi in sem.",
				showTitleSelector : true,
				number : "3.624",
				numberUnit : "EUR",
				numberState : ValueState.Success,
				icon : IconPool.getIconURI("attachment"),
				tooltip : "Test tooltip for the header",
				backgroundDesign : BackgroundDesign.Solid
			}).placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oOH.destroy();
		}
	});

	QUnit.test("ControlRendered", function(assert) {

		assert.notEqual(this.oOH.getDomRef(), null, "ObjectHeader Basic should be rendered.");
	});

	QUnit.test("TooltipRendered", function(assert) {
		assert.equal(this.oOH.$().children()[0].title, "Test tooltip for the header", "Tooltip should be rendered.");
	});

	QUnit.test("IntroRendered", function(assert) {

		assert.notEqual(this.oOH.getDomRef("intro"), null, "Intro should be rendered.");
	});

	QUnit.test("TitleRendered", function(assert) {

		assert.notEqual(this.oOH._titleText.getDomRef(), null, "Title should be rendered.");
	});

	QUnit.test("NumberRendered", function(assert) {

		assert.notEqual(this.oOH.getDomRef("number"), null, "Number should be rendered.");
		assert.ok(this.oOH.$("number").hasClass("sapMObjectNumber"), "Number is sap.m.ObjectNumber");
	});

	QUnit.test("AttributesRendered", async function(assert) {
		// Arrange
		var oOA1 = new ObjectAttribute("oa1", {
				text : "Contract #D1234567890"
			}),
			oOA2 = new ObjectAttribute("oa2", {
				text : "Created by John Doe",
				active: true
			});

		// Act
		this.oOH.addAttribute(oOA1);
		this.oOH.addAttribute(oOA2);

		await nextUIUpdate();

		// Assert
		assert.notEqual(document.getElementById("oa1"), null, "Object attribute #1 should be rendered.");
		assert.notEqual(document.getElementById("oa2"), null, "Object attribute #2 should be rendered.");
	});

	QUnit.test("Attribute rerendered after being empty", async function(assert) {
		var oOA = new ObjectAttribute({text: "Test"});
		var oOHEmpty = new ObjectHeader({attributes: [oOA]});

		oOHEmpty.placeAt("qunit-fixture");
		await nextUIUpdate();

		oOHEmpty.invalidate();
		oOA.setText("");
		await nextUIUpdate();

		oOA.setText("rerendered");
		await nextUIUpdate();

		// assert
		assert.strictEqual(oOA.$("text")[0].textContent, "rerendered", "Attribute is rendered inside ObjectHeader");

		// cleanup
		oOHEmpty.destroy();
	});

	QUnit.test("StatusesRendered", async function(assert) {
		// Arrange
		var oOS1 = new ObjectStatus("os1", {
				text : "Statuses 1",
				state : ValueState.Success
			}),
			oOS2 = new ObjectStatus("os2", {
				text : "Statuses 2",
				state : ValueState.Success
			}),
			oOA =  new ObjectAttribute("oa1", {
				text : "Should not be displayed"
			});

		// Act
		this.oOH.addStatus(oOS1);
		this.oOH.addStatus(oOS2);
		this.oOH.addStatus(oOA);

		await nextUIUpdate();

		// Assert
		assert.notEqual(document.getElementById("os1"), null, "Object statuses #1 should be rendered.");
		assert.notEqual(document.getElementById("os2"), null, "Object statuses #2 should be rendered.");
		assert.equal(document.getElementById("oa1"), null, "Object attribute should not be rendered.");
	});

	QUnit.test("Flag Rendering Position", async function(assert) {
		// Arrange - Mark Flagged and add Attribute
		var oAttr = new ObjectAttribute(this.sID + "-attr1", {
				text : "Attribute number 1"
			}),
			oFlagMarker = new ObjectMarker(this.sID + "-flag", {
				type: ObjectMarkerType.Flagged
			});

		this.oOH.addAttribute(oAttr);
		this.oOH.addMarker(oFlagMarker);

		// Act
		await nextUIUpdate();

		assert.ok(Math.abs(jQuery("#" + this.sID + "-attr1")[0].offsetTop - jQuery("#" + this.sID + "-flag")[0].offsetTop) <= 2,
		"Attribute and flag should be rendered on the same row");
	});

	QUnit.test("ProgressIndicatorRendered", async function(assert) {
		// Arrange
		var oProgIndicator = new ProgressIndicator(this.sID + "-pi", {
			visible : true,
			enabled : true,
			state : ValueState.NEUTRAL,
			displayValue : '80%',
			percentValue : 80,
			showValue : true,
			width : '100%',
			height : '1.375rem'
		});

		this.oOH.addStatus(oProgIndicator);

		// Act
		await nextUIUpdate();

		// Assert
		assert.notEqual(document.getElementById(this.sID + "-pi"), null, "Progress Indicator should be rendered.");
		assert.ok(!jQuery(jQuery("#" + this.sID + " .sapMOHStatusFixedWidth")[4]).attr("style"), "Progress Indicator only use 35% width.");
		assert.equal(jQuery("#" + this.sID + " .sapMOHStatusFixedWidth .sapMPI").css("float"), "right", "Progress Indicator is floating right");
	});

	QUnit.test("NumberStateColorRendered", function(assert) {

		assert.notEqual(this.oOH.getDomRef("number"), null, "Number should be rendered.");
		assert.ok(this.oOH.$("number").hasClass("sapMObjectNumberStatusSuccess"), "Number color uses value state success color.");
	});

	QUnit.test("Placeholders for invisible attributes", async function(assert) {
		// Arrange
		var oOA = new ObjectAttribute("invisibleAttr", {
				text : "Invisible attribute",
				visible : false
			});

		this.oOH.addAttribute(oOA);

		// Act
		await nextUIUpdate();

		// Assert
		assert.ok(jQuery('#' + this.sID + ' > .sapMOHBottomRow > .sapMOHAttrRow').length === 0, "The attribute row should not be rendered");
	});

	QUnit.test("Placeholders for invisible status", async function(assert) {
		// Arrange
		var oOS = new ProgressIndicator({
				percentValue : 99,
				state : ValueState.Error,
				visible : false
			});

		this.oOH.addStatus(oOS);

		// Act
		await nextUIUpdate();

		// Assert
		assert.ok(jQuery('#' + this.sID + ' > .sapMOHBottomRow > .sapMOHAttrRow > .sapMOHStatusFixedWidth').length === 0, "The status should not be rendered");

	});

	QUnit.test("Placeholders for invisible attribute with visible status", async function(assert) {
		// Arrange
		var oOS = new ObjectStatus({
				text : "Visible status",
				state : ValueState.Success,
				visible : true
			}),
			oOA1 = new ObjectAttribute({
				text : "First invisible attribute",
				visible : false
			}),
			oOA2 = new ObjectAttribute({
				text : "First visible attribute",
				visible : true
			});

		this.oOH.addStatus(oOS);
		this.oOH.addAttribute(oOA1);
		this.oOH.addAttribute(oOA2);

		// Act
		await nextUIUpdate();

		// Assert
		assert.ok(jQuery('#' + this.sID + ' > .sapMOH .sapMOHBottomRow > .sapMOHAttrRow').length === 1, "Invisible attribute should not cause new row.");
	});

	QUnit.test("Placeholders for invisible status with visible attribute", async function(assert) {
		// Arrange
		var oPI = new ProgressIndicator({
				displayValue : '30%',
				percentValue : 30,
				state : ValueState.Error,
				visible : false
			}),
			oPI2 = new ProgressIndicator({
				displayValue : '90%',
				percentValue : 90,
				state : ValueState.Error,
				visible : true
			}),
			oOA = new ObjectAttribute({
				text : "Visible attribute",
				visible : true
			});

		this.oOH.addStatus(oPI);
		this.oOH.addStatus(oPI2);
		this.oOH.addAttribute(oOA);

		// Act
		await nextUIUpdate();

		// Assert
		assert.ok(jQuery('#' + this.sID + ' > .sapMOH .sapMOHBottomRow > .sapMOHAttrRow').length === 1, "Invisible status should not cause new row.");
	});

	/******************************************************************/

	QUnit.module("Rendering condensed Object Header", {
		beforeEach: async function () {
			this.sID = "oOHCondensed";
			this.oOH = new ObjectHeader(this.sID, {
				title : "Condensed Object header with attribute, number and number unit",
				number : "3.628.000",
				numberUnit : "EUR",
				backgroundDesign : BackgroundDesign.Transparent,
				condensed : true,
				attributes : [
					new ObjectAttribute({
						text : "This is the only attribute in the object header"
					})
				]
			}).placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oOH.destroy();
		}
	});

	QUnit.test("Object Header has condensed style", function(assert) {
		assert.equal(jQuery("#" + this.sID + " > .sapMOHC").length, 1, "Object Header with condensed style is rendered");
	});

	QUnit.test("Object Header attribute is displayed under title", function(assert) {

		assert.equal(jQuery("#" + this.sID + " > .sapMOHC > .sapMOHAttr").length, 1, "Object Header attribute is displayed under title");
	});

	QUnit.test("NumberRendered", function(assert) {

		assert.notEqual(document.getElementById(this.sID + "-number"), null, "Number should be rendered.");
		assert.ok(jQuery("#" + this.sID + "-number").hasClass("sapMObjectNumber"), "Number is sap.m.ObjectNumber");
	});

	QUnit.test("Background is transparent", function(assert) {

		assert.equal(jQuery("#" + this.sID + " > .sapMOHBgTransparent").length, 1, "Transparent background style should be set.");

		// in some browsers css("background-color") instead of "transparent" returns "rgba(0, 0, 0, 0)"
		var bBackgroundTransparent = (jQuery("#" + this.sID).css("background-color") == "transparent") || (jQuery("#" + this.sID).css("background-color") == "rgba(0, 0, 0, 0)");
		assert.ok(bBackgroundTransparent, "Background color is transparent");
	});

	QUnit.test("Background is solid", async function(assert) {

		this.oOH.setBackgroundDesign(BackgroundDesign.Solid);
		await nextUIUpdate();

		assert.equal(jQuery("#" + this.sID + " > .sapMOHBgSolid").length, 1, "Solid background style should be set.");
	});

	/******************************************************************/

	QUnit.module("Internal API", {
		beforeEach: async function() {
			this.sID = "oOHSimple";
			this.oOH = new ObjectHeader(this.sID, {
				title : "Simple ObjectHeader",
				backgroundDesign : BackgroundDesign.Transparent
			}).placeAt("qunit-fixture");

			await nextUIUpdate();
		},
		afterEach: function() {
			this.oOH.destroy();
		}
	});

	QUnit.test("Attribute and Flag API", async function(assert) {
		// Arrange
		var oOA = new ObjectAttribute({
				text : "A regular attribute"
			}),
			oFlagMarker = new ObjectMarker(this.sID + "-flag", {
				type: ObjectMarkerType.Flagged
			});

		this.oOH.addAttribute(oOA);
		this.oOH.addMarker(oFlagMarker);

		// Act
		await nextUIUpdate();

		// Assert
		assert.ok(this.oOH._hasBottomContent(), "Object header has bottom content");
		assert.ok(this.oOH._hasAttributes(), "Object header has attributes");
		assert.equal(this.oOH.getMarkers()[0].getId(), this.sID + "-flag", "Object header has flag marker");
	});

	QUnit.test("With empty status", async function(assert) {

		var emptyStatus = new ObjectStatus("ose1", {
				text : "\n  \n  \t",
				state : ValueState.Success
			});

		this.oOH.addStatus(emptyStatus);

		await nextUIUpdate();

		assert.notOk(this.oOH._hasStatus(), "Object header has no rendered statuses");

	});

	QUnit.test("With empty attribute", async function(assert) {

		var emptyAttr1 = new ObjectAttribute("oae1", {
				text : "\n  \n  \t"
			}),
			emptyAttr2 = new ObjectAttribute("oae2", {
				text : "\n  \n  \t"
			});

		this.oOH.addAttribute(emptyAttr1);
		this.oOH.addAttribute(emptyAttr2);

		await nextUIUpdate();

		assert.notOk(this.oOH._hasAttributes(), "Object header has no rendered attributes");

	});

	QUnit.test("With empty attributes and statuses", async function(assert) {
		var emptyAttr1 = new ObjectAttribute("oae1", {
				text : "\n  \n  \t"
			}),
			emptyAttr2 = new ObjectAttribute("oae2", {
				text : "\n  \n  \t"
			}),
			emptyStatus1 = new ObjectStatus("ose1", {
				text : "\n  \n  \t",
				state : ValueState.Success
			}),
			emptyStatus2 = new ObjectStatus("ose2", {
				text : "\n  \n  \t",
				state : ValueState.Error
			});

		this.oOH.addAttribute(emptyAttr1);
		this.oOH.addAttribute(emptyAttr2);
		this.oOH.addStatus(emptyStatus1);
		this.oOH.addStatus(emptyStatus2);

		await nextUIUpdate();

		assert.notOk(this.oOH._hasStatus(), "Object header has no rendered statuses");
		assert.notOk(this.oOH._hasAttributes(), "Object header has no rendered attributes");
		assert.notOk(this.oOH._hasBottomContent(), "Object header has no bottom content");
	});

	QUnit.test("With a non-empty ObjectStatus", async function(assert) {

		var emptyStatus = new ObjectStatus("ose8", {
				text : "\n  \n  \t",
				state : ValueState.Error
			}),
			regularStatus = new ObjectStatus({
				text : "Statuses 1",
				state : ValueState.Success
			});

		this.oOH.addStatus(emptyStatus);
		this.oOH.addStatus(regularStatus);

		await nextUIUpdate();

		assert.ok(this.oOH._hasStatus(), "Object header has rendered statuses");
	});

	QUnit.test("With a ProgressIndicator", async function(assert) {

		var progressIndicator = new ProgressIndicator({
				percentValue : 99,
				state : ValueState.Error
			});

		this.oOH.addStatus(progressIndicator);

		await nextUIUpdate();

		assert.ok(this.oOH._hasStatus(), "Object header has rendered statuses if only ProgressIndicator is present");
	});

	QUnit.test("Title gets all length when no number", function(assert) {
		// Arrange
		var $objectHeader = this.oOH.$("titlediv");

		// Act
		assert.ok($objectHeader.hasClass("sapMOHTitleDivFull"), "title occupies the whole available space");
	});

	QUnit.test("Title gets all length when no number in Condensed OH", async function(assert) {
		// Arrange
		this.oOH.setCondensed(true);

		// Act
		await nextUIUpdate();
		var $objectHeader = this.oOH.$("titlediv");

		// Assert
		assert.ok($objectHeader.hasClass("sapMOHTitleDivFull"), "title occupies the whole available space");
	});

	/******************************************************************/

	QUnit.module("Events", {
		beforeEach: async function() {
			this.sID = "oOHEvents";
			this.oOH = new ObjectHeader(this.sID, {
				intro : "On behalf of John Smith",
				introActive : true,
				introPress : eventHandler,
				title : "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis luctus, turpis vitae porttitor hendrerit, elit dui mollis neque, id suscipit lorem mi in sem.",
				titleActive : true,
				titlePress : eventHandler,
				icon : IconPool.getIconURI("attachment"),
				iconActive : true,
				iconPress : eventHandler
			}).placeAt("qunit-fixture");

			await nextUIUpdate();
		},
		afterEach: function() {
			this.oOH.destroy();
		}
	});

	QUnit.test("Title is active", function(assert) {
		// Arrange
		var $objectHeaderTitle = this.oOH.$("title");

		// Assert
		assert.ok($objectHeaderTitle.hasClass("sapMOHTitleActive"), "Title div has class \"sapMOHTitleActive\".");
	});

	QUnit.test("Title rendered as active but it's not a link", function(assert) {
		assert.equal(this.oOH.$("title").attr("href"), undefined, "Title attribute href is not a link.");
	});

	QUnit.test("TestTitleTap", function(assert) {

		qutils.triggerEvent("tap", this.sID + "-title");
		assert.ok(domRef, "domRef is set");
		assert.equal(domRef.id, this.sID + "-title", "Title should be clickable");
		domRef = null;

		qutils.triggerEvent("tap", this.sID + "-titleText-inner");
		assert.ok(domRef, "domRef is set");
		assert.equal(domRef.id, this.sID + "-title", "When clicking inner text div event should return outer div as source");
		domRef = null;

		this.oOH.setTitleActive(false);
		qutils.triggerEvent("tap", this.sID + "-title");
		assert.ok(domRef === null, this.sID + " Title should not be clickable");
	});

	QUnit.test("TestIntroTap", function(assert) {

		qutils.triggerEvent("tap", this.sID + "-intro");
		assert.ok(domRef, "domRef is set");
		assert.equal(domRef.id, this.sID + "-intro", "Intro should be clickable");
		domRef = null;

		this.oOH.setIntroActive(false);
		qutils.triggerEvent("tap", this.sID + "-intro");
		assert.ok(domRef === null, this.sID + " intro should not be clickable");
		domRef = null;
	});

	QUnit.test("TestIconTap", async function(assert) {
		this.oOH._oImageControl.firePress();

		// Assert - OH with active icon should be clickable
		assert.ok(domRef, "domRef is set");
		assert.equal(domRef.id, this.sID + "-img", "Icon should be clickable");
		domRef = null;

		var oOHIconNotActive = new ObjectHeader("iconNotActive", {
			icon : IconPool.getIconURI("attachment"),
			iconPress : eventHandler
		}).placeAt("qunit-fixture");

		await nextUIUpdate();
		oOHIconNotActive._oImageControl.firePress();

		// Assert - OH with no active icon should not be clickable
		assert.ok(domRef === null, "Icon should not be clickable");

		// Cleanup
		domRef = null;
		oOHIconNotActive.destroy();
	});

	QUnit.test("TestIcon pressing Space when responsive=true", function(assert) {
		// Arrange
		this.oOH.setResponsive(true);

		//Act
		var $oImageControlRef = this.oOH._oImageControl.$();
		$oImageControlRef.trigger("focus");
		qutils.triggerKeydown($oImageControlRef, KeyCodes.SPACE);
		qutils.triggerKeyup($oImageControlRef, KeyCodes.SPACE);

		//Assert
		assert.ok(domRef, "Icon should fire 'iconPress' event when object header is responsive");
		if (domRef) {
			assert.equal(domRef.id, this.sID + "-img", "Icon should fire 'iconPress' event when object header is responsive and the event's source is the image");
		}
	});

	QUnit.test("TestTitleSelectorTap", async function(assert) {
		var oOH2 = new ObjectHeader("oOH2", {
			title : "Im a title.",
			showTitleSelector : true,
			titleSelectorPress : eventHandler
		}).placeAt("qunit-fixture");

		await nextUIUpdate();

		var oFakeEvent = {
			target: oOH2.getDomRef().querySelector(".sapUiIconTitle")
		};

		oOH2.ontap(oFakeEvent);
		assert.ok(domRef, "oTitleArrowDomRef is set to titleArrow");
		assert.equal(domRef.id, "oOH2" + "-titleArrow", "Title Arrow should be clickable");

		oOH2.destroy();
	});

	QUnit.test("TestTitleSelector pressing SPACE", async function(assert) {
		//Arrange
		var oSpy = this.spy();
		var oArrowOH = new ObjectHeader("arrowOH", {
			title : "Title Arrow test, pressing space key.",
			showTitleSelector : true,
			titleSelectorPress : oSpy
		});

		// System under test
		oArrowOH.placeAt("qunit-fixture");
		await nextUIUpdate();

		var oArrow = jQuery("#arrowOH-titleArrow")[0];
		oArrow.focus(); // set focus on the arrow

		// Assert
		qutils.triggerKeyup(oArrow, KeyCodes.SPACE);
		assert.strictEqual(oSpy.callCount, 1, "SPACE is pressed, titleSelectorPress event was fired");

		// clean up
		oArrowOH.destroy();
	});

	QUnit.test("TestTitleSelector pressing ENTER", async function(assert) {
		//Arrange
		var oSpy = this.spy();
		var oArrowOH = new ObjectHeader("arrowOH", {
			title : "Title Arrow test, pressing enter key.",
			showTitleSelector : true,
			titleSelectorPress : oSpy
		});

		// System under test
		oArrowOH.placeAt("qunit-fixture");
		await nextUIUpdate();

		var oArrow = jQuery("#arrowOH-titleArrow")[0];
		oArrow.focus(); // set focus on the arrow

		// Assert
		qutils.triggerKeydown(oArrow, KeyCodes.ENTER);
		assert.strictEqual(oSpy.callCount, 1, "ENTER is pressed, titleSelectorPress event was fired");

		// clean up
		oArrowOH.destroy();
	});

	/******************************************************************/

	QUnit.module("TitleArrow", {
		beforeEach: async function() {
			this.sID = "titleArrowOH";
			this.oOH = new ObjectHeader(this.sID, {
				title : "Title Arrow reset to false and should not be displayed.",
				number : "3.624",
				numberUnit : "EUR",
				showTitleSelector : true,
				titleSelectorPress : eventHandler
			}).placeAt("qunit-fixture");

			await nextUIUpdate();
		},
		afterEach: function() {
			this.oOH.destroy();
		}
	});

	QUnit.test("TestTitleArrowResetToFalse", function(assert) {
		var done = assert.async();

		this.oOH.setShowTitleSelector(false);

		setTimeout(function() {
			assert.equal(jQuery("#titleArrowOH-titleArrow").length, 0, " The titleArrowOH showTitleSelector is set to false and is not rendered.");
			done();
		}, 100);

	});

	/******************************************************************/

	QUnit.module("OH Screen Reader support");

	QUnit.test("OH has aria-labelledby", async function(assert){
		var sID = "oOHBasic",
			oObjectHeader = new ObjectHeader(sID, {
				title : "Test Title."
			}).placeAt("qunit-fixture");

		await nextUIUpdate();

		assert.ok(jQuery("#" + sID + ">.sapMOH").attr("aria-labelledby"), "OH has attribute aria-labelledby");

		oObjectHeader.destroy();
	});

	QUnit.test("OH has attribute role=region", async function(assert){
		var sID = "oOHBasic",
			oObjectHeader = new ObjectHeader(sID, {
				title : "Test Title."
			}).placeAt("qunit-fixture");

		await nextUIUpdate();

		assert.ok(jQuery("#" + sID + ">.sapMOH").attr("role"), "OH has attribute role");
		assert.equal(jQuery("#" + sID + ">.sapMOH").attr("role"), "region", "role is region");

		oObjectHeader.destroy();
	});

	QUnit.test("OH Condensed has aria-labelledby", async function(assert){
		var sID = "oOHCondensed",
			oObjectHeader = new ObjectHeader(sID, {
				title : "Test Title.",
				condensed : true
			}).placeAt("qunit-fixture");

		await nextUIUpdate();

		assert.ok(jQuery("#" + sID + ">.sapMOH").attr("aria-labelledby"), "OH condensed has attribute aria-labelledby");

		oObjectHeader.destroy();
	});

	QUnit.test("OH Condensed has attribute role=region", async function(assert){
		var sID = "oOHCondensed",
			oObjectHeader = new ObjectHeader(sID, {
				title : "Test Title.",
				condensed : true
			}).placeAt("qunit-fixture");

		await nextUIUpdate();

		assert.ok(jQuery("#" + sID + ">.sapMOH").attr("role"), "OH condensed has attribute role");
		assert.equal(jQuery("#" + sID + ">.sapMOH").attr("role"), "region", "role is region");

		oObjectHeader.destroy();
	});

	QUnit.test("Active title has aria attributes", async function(assert){
		var sID = "oOHBasic",
			oObjectHeader = new ObjectHeader(sID, {
				title : "Test Title.",
				titleActive : true
			}).placeAt("qunit-fixture");

		await nextUIUpdate();
		assert.equal(jQuery("#" + sID + "-title").attr("role"), "link", "OH has role=link");

		oObjectHeader.destroy();
	});

	QUnit.test("Active icon has aria attributes", async function(assert){
		var sID = "oOHBasic",
			oObjectHeader = new ObjectHeader(sID, {
				title : "Test Title.",
				icon : IconPool.getIconURI("attachment"),
				iconActive : true
			}).placeAt("qunit-fixture");

		await nextUIUpdate();
		assert.equal(jQuery(".sapMOHIcon.sapMPointer .sapUiIcon.sapUiIconPointer").attr("role"), "button", "OH has role=button");

		oObjectHeader.destroy();
	});

	QUnit.test("Title has level H1", async function(assert){
		// Arrange
		var oObjectHeader = new ObjectHeader({
				title: "Test title level"
			});

		// System under test
		oObjectHeader.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Assert
		var $sTitle = oObjectHeader.$("title");
		assert.ok($sTitle.find( "h1" ), "Title has the default titleLevel H1");

		// Cleanup
		oObjectHeader.destroy();
	});

	QUnit.test("Title has level H3", async function(assert){
		// Arrange
		var oObjectHeader = new ObjectHeader({
				title: "Test title level",
				titleLevel: TitleLevel.H3
			});

		// System under test
		oObjectHeader.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Assert
		var $sTitle = oObjectHeader.$("title");
		assert.ok($sTitle.find( "h3" ), "Title has titleLevel H3");

		// Cleanup
		oObjectHeader.destroy();
	});

	QUnit.test("Title level is set correctly", async function(assert){
		// Arrange
		var oObjectHeader = new ObjectHeader({
				title: "Test title level"
			});

		// System under test
		oObjectHeader.placeAt("qunit-fixture");
		await nextUIUpdate();

		oObjectHeader.setTitleLevel("H4");
		await nextUIUpdate();

		// Assert
		var $sTitle = oObjectHeader.$("title");
		assert.ok($sTitle.find( "h4" ), "Title has titleLevel H4");

		// Cleanup
		oObjectHeader.destroy();
	});

	QUnit.test("When set to Auto title has level H1", async function(assert){
		// Arrange
		var oObjectHeader = new ObjectHeader({
				title: "Test title level",
				titleLevel: TitleLevel.Auto
			});

		// System under test
		oObjectHeader.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Assert
		var $sTitle = oObjectHeader.$("title");
		assert.ok($sTitle.find( "h1" ), "Title has titleLevel H1");

		// Cleanup
		oObjectHeader.destroy();
	});

	QUnit.test("Decorative property of the image is set to false", function(assert){
		// Arrange
		var oObjectHeader = new ObjectHeader({
				title: "Test title level",
				icon : "../images/action.png",
				iconTooltip: "test tooltip"
			});

		// Assert
		assert.strictEqual(oObjectHeader._getImageControl().getDecorative(), false, "The image has property decorative set to false");

		// Cleanup
		oObjectHeader.destroy();
	});

	// Related to: 002075129500008606402021
	QUnit.test("The initial 'iconAlt' property value could be overridden", async function(assert){
		// Arrange
		var oObjectHeader = new ObjectHeader({
				icon : "non existing path/icon.png",
				iconDensityAware: false
			}),
			oImage = oObjectHeader._getImageControl();

		oObjectHeader.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Act
		oImage.onerror();

		// Assert
		assert.notOk(oImage.getDomRef().classList.contains("sapMNoImg"));

		// Act
		oObjectHeader.setIconAlt("");
		await nextUIUpdate();
		oImage.onerror();

		// Assert
		assert.ok(oImage.getDomRef().classList.contains("sapMNoImg"));

		// Cleanup
		oObjectHeader.destroy();
	});

	QUnit.test("aria-labelledby contains title reference", async function(assert){
		// Arrange
		var sId = "OHID",
			oObjectHeader = new ObjectHeader(sId, {
				numberUnit: "Views",
				number: "454"
			}).placeAt("qunit-fixture");
		await nextUIUpdate();

		// Assert
		assert.notOk(jQuery("#" + sId + ">.sapMOH").attr("aria-labelledby"), "There is no reference when there is no title");

		// Arrange
		oObjectHeader.setTitle("Test title level");
		await nextUIUpdate();

		// Assert
		assert.strictEqual(jQuery("#" + sId + ">.sapMOH").attr("aria-labelledby"), "OHID-titleText-inner", "There is a reference, when there is a title");

		// Clean up
		oObjectHeader.destroy();
	});

	QUnit.test("Presence of ariaLabelledBy references", async function (assert) {
		var oLabel = new Label("label", { text: "Label" }),
			oOH = new ObjectHeader("objectHeader", { title: "Title", titleActive: true, ariaLabelledBy: "label" });

		oLabel.placeAt("qunit-fixture");
		oOH.placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.strictEqual(jQuery("#objectHeader>.sapMOH").attr("aria-labelledby").includes("label"), true,
				"Reference added via ariaLabelledBy has been added in aria-labelledby");

		oOH.destroy();
		oLabel.destroy();
	});

	/******************************************************************/

	QUnit.module("Exiting");

	QUnit.test("TestIconExit", async function(assert) {
		var iconOH = new ObjectHeader("iconOH", {
			icon : IconPool.getIconURI("pdf-attachment"),
			intro : "On behalf of John Smith",
			title : "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis luctus, turpis vitae porttitor hendrerit, elit dui mollis neque, id suscipit lorem mi in sem.",
			number : "3.624",
			numberUnit : "EUR",
			markers: [
				new ObjectMarker("iconOH-flag", {
					type: ObjectMarkerType.Flagged
				}),
				new ObjectMarker("iconOH-favorite", {
					type: ObjectMarkerType.Favorite
				})
			]
		}).placeAt("qunit-fixture");

		await nextUIUpdate();

		var $sImg = iconOH.$("img");
		assert.ok(!(iconOH === null), "iconOH is not null");
		assert.ok(Element.getElementById("iconOH"), "Icon is found in UI5 Core");
		assert.ok(!$sImg.attr("title"), "Icon has no tooltip");
		assert.ok(Element.getElementById("iconOH-flag"), "Flag icon is found in UI5 Core");
		assert.ok(Element.getElementById("iconOH-favorite"), "Favorite icon is found in UI5 Core");
		iconOH.destroy();
		assert.notOk(Element.getElementById("iconOH-flag"), "Flag icon is not found in UI5 Core");
		assert.notOk(Element.getElementById("iconOH-favorite"), "Favorite icon is not found in UI5 Core");
	});

	QUnit.test("TestImageExit", async function(assert) {
		var imageOH = new ObjectHeader("imageOH", {
			icon : "../images/action.png",
			iconTooltip: "test tooltip",
			intro : "On behalf of John Smith",
			title : "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis luctus, turpis vitae porttitor hendrerit, elit dui mollis neque, id suscipit lorem mi in sem.",
			number : "3.624",
			numberUnit : "EUR"
		}).placeAt("qunit-fixture");

		await nextUIUpdate();

		var $sImg = imageOH.$("img");
		assert.ok(!(imageOH === null), "imageOH is not null");
		assert.ok(Element.getElementById("imageOH"), "Image is found in UI5 Core");
		assert.equal($sImg.attr("title"), "test tooltip", "Image has tooltip");
		imageOH.destroy();
		assert.notOk(Element.getElementById("imageOH"), "Image is removed from UI5 Core");
	});

	QUnit.test("Title selector icon size", async function(assert) {
		// arrange
		var oObjectHeader = new ObjectHeader({
			showTitleSelector: true,
			condensed: false
		}).placeAt("qunit-fixture");

		// system under test
		await nextUIUpdate();

		// assert: default in constructor
		assert.strictEqual(oObjectHeader._oTitleArrowIcon.getSize(), "1.375rem", "for a standard object header the icon size is 1.375rem");

		// assert: setter false
		oObjectHeader.setCondensed(false);
		await nextUIUpdate();
		assert.strictEqual(oObjectHeader._oTitleArrowIcon.getSize(), "1.375rem", "for a standard object header the icon size is 1.375rem again");

		// cleanup
		oObjectHeader.destroy();
	});

	/******************************************************************/

	QUnit.module("AdditionalNumbers aggregations rendering");

	QUnit.test("additionalNumbers should be rendered", async function (assert) {
		// Arrange
		var oObjectHeader = new ObjectHeader({
			title: "test additional numbers",
			additionalNumbers: [
				new ObjectNumber({
					number: "2134",
					unit: "Conversion rate"
				})
			]
		});

		// System under test
		oObjectHeader.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Assert
		var oAdditionalNum = oObjectHeader.$().find(".additionalOHNumberDiv");
		assert.ok(oAdditionalNum.length, "One additional number is rendered.");

		// cleanup
		oObjectHeader.destroy();
	});

	QUnit.test("additionalNumbers shouldn't be rendered if no aggregation is set", async function (assert) {
		// Arrange
		var oObjectHeader = new ObjectHeader({
			title: "Test numbers",
			number: "3213",
			numberUnit: "EUR"
		});

		// System under test
		oObjectHeader.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Assert
		var oAdditionalNum = oObjectHeader.$().find(".additionalOHNumberDiv");
		assert.ok(!oAdditionalNum.length, "Zero additionalNumbers are rendered.");

		// cleanup
		oObjectHeader.destroy();
	});

	QUnit.test("additionalNumbers shouldn't be rendered if the condensed property is set to true", async function (assert) {
		// Arrange
		var oObjectHeader = new ObjectHeader({
			title: "test additional numbers",
			condensed: true,
			additionalNumbers: [
				new ObjectNumber({
					number: "2134",
					unit: "Conversion rate"
				})
			]
		});

		// System under test
		oObjectHeader.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Assert
		var oAdditionalNum = oObjectHeader.$().find(".additionalOHNumberDiv");
		assert.ok(!oAdditionalNum.length, "Zero additionalNumbers are rendered.");

		// cleanup
		oObjectHeader.destroy();
	});

	QUnit.test("additionalNumbers shouldn't be rendered if the responsive property is set to true", async function (assert) {
		// Arrange
		var oObjectHeader = new ObjectHeader({
			title: "test additional numbers",
			responsive: true,
			additionalNumbers: [
				new ObjectNumber({
					number: "2134",
					unit: "Conversion rate"
				})
			]
		});

		// System under test
		oObjectHeader.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Assert
		var oAdditionalNum = oObjectHeader.$().find(".additionalOHNumberDiv");
		assert.ok(!oAdditionalNum.length, "Zero additionalNumbers are rendered.");

		// cleanup
		oObjectHeader.destroy();
	});

	QUnit.test("additionalNumber should be rendered after insertAdditionalNumber", async function (assert) {
		// Arrange
		var oObjectHeader = new ObjectHeader({
			title: "Test numbers"
		});
		var oNum = new ObjectNumber({
			number: "2134",
			unit: "Conversion rate"
		});
		oObjectHeader.insertAdditionalNumber(oNum, 0);

		// System under test
		oObjectHeader.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Assert
		var oAdditionalNum = oObjectHeader.$().find(".additionalOHNumberDiv");
		assert.ok(oAdditionalNum.length, "One additional number is rendered.");
	});

	QUnit.test("additionalNumber should be removed: removeAdditionalNumber", async function (assert) {
		// Arrange
		var oObjectHeader = new ObjectHeader({
			title: "Test numbers"
		});
		var oNum = new ObjectNumber({
			number: "2134",
			unit: "Conversion rate"
		});
		oObjectHeader.insertAdditionalNumber(oNum, 0);

		// System under test
		oObjectHeader.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Assert
		var oAdditionalNum = oObjectHeader.$().find(".additionalOHNumberDiv");
		assert.ok((oAdditionalNum.length == 1), "One additional number is rendered.");

		oObjectHeader.removeAdditionalNumber(oNum);
		await nextUIUpdate();

		// Assert
		oAdditionalNum = oObjectHeader.$().find(".additionalOHNumberDiv");
		assert.ok(!oAdditionalNum.length, "The additional number is removed.");
	});

	QUnit.test("additionalNumber should be removed: removeAllAdditionalNumbers", async function (assert) {
		// Arrange
		var oObjectHeader = new ObjectHeader({
			title: "test additional numbers",
			additionalNumbers: [
				new ObjectNumber({
					number: "2134",
					unit: "Conversion rate"
				}),
				new ObjectNumber({
					number: "4344",
					unit: "Local currency"
				})
			]
		});

		// System under test
		oObjectHeader.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Assert
		var oAdditionalNum = oObjectHeader.$().find(".additionalOHNumberDiv");
		assert.ok((oAdditionalNum.length == 2), "Two additional numbers are rendered.");

		oObjectHeader.removeAllAdditionalNumbers();
		await nextUIUpdate();

		// Assert
		oAdditionalNum = oObjectHeader.$().find(".additionalOHNumberDiv");
		assert.ok(!oAdditionalNum.length, "All additional numbers are removed.");
	});

	QUnit.test("removeAllAdditionalNumbers when no additional numbers at all", async function (assert) {
		// Arrange
		var oObjectHeader = new ObjectHeader({
			title: "Test numbers"
		});

		// System under test
		oObjectHeader.placeAt("qunit-fixture");
		await nextUIUpdate();

		oObjectHeader.removeAllAdditionalNumbers();
		await nextUIUpdate();

		// Assert
		var oAdditionalNum = oObjectHeader.$().find(".additionalOHNumberDiv");
		assert.ok(!oAdditionalNum.length, "No error is raised when executing removeAllAttributes");
	});

	QUnit.test("AdditionalNumbers should be destroyed: destroyAdditionalNumbers", async function (assert) {
		// Arrange
		var oObjectHeader = new ObjectHeader({
			title: "test additional numbers",
			additionalNumbers: [
				new ObjectNumber({
					number: "2134",
					unit: "Conversion rate"
				}),
				new ObjectNumber({
					number: "4344",
					unit: "Local currency"
				})
			]
		});

		// System under test
		oObjectHeader.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Assert
		var oAdditionalNum = oObjectHeader.$().find(".additionalOHNumberDiv");
		assert.ok((oAdditionalNum.length == 2), "Two additional numbers are rendered.");

		oObjectHeader.destroyAdditionalNumbers();
		await nextUIUpdate();

		// Assert
		oAdditionalNum = oObjectHeader.$().find(".additionalOHNumberDiv");
		assert.ok(!oAdditionalNum.length, "All additional numbers are destroyed.");
	});

	QUnit.test("Separator should be rendered when there is one additionalNumber", async function (assert) {
		// Arrange
		var oObjectHeader = new ObjectHeader({
			title: "test additional numbers",
			additionalNumbers: [
				new ObjectNumber({
					number: "2134",
					unit: "Conversion rate"
				})
			]
		});

		// System under test
		oObjectHeader.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Assert
		var oSeparator = oObjectHeader.$().find(".additionalOHNumberSeparatorDiv");
		assert.ok(oSeparator.length === 1, "Separator is rendered.");

		// cleanup
		oObjectHeader.destroy();
	});

	QUnit.test("Separator shouldn't be rendered when there is more than one additionalNumber", async function (assert) {
		// Arrange
		var oObjectHeader = new ObjectHeader({
			title: "test additional numbers",
			additionalNumbers: [
				new ObjectNumber({
					number: "2134",
					unit: "Conversion rate"
				}),
				new ObjectNumber({
					number: "1232134",
					unit: "EUR"
				})
			]
		});

		// System under test
		oObjectHeader.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Assert
		var oSeparator = oObjectHeader.$().find(".additionalOHNumberSeparatorDiv");
		assert.ok(!oSeparator.length, "Separator is not rendered.");

		// cleanup
		oObjectHeader.destroy();
	});

	/******************************************************************/

	QUnit.module("Contrast container in Belize");

	QUnit.test("Contrast container should be set when Background is not transparent", async function (assert) {
		// Arrange
		var oObjectHeader = new ObjectHeader({
			id: "contrastId",
			title: "test contrast container",
			backgroundDesign: BackgroundDesign.Solid
		});

		// System under test
		oObjectHeader.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Assert
		assert.ok(jQuery("#" + "contrastId >").hasClass("sapContrastPlus"), "Contrast container class is rendered");

		// cleanup
		oObjectHeader.destroy();
	});

	QUnit.test("Contrast container should not be set when Background transparent", async function (assert) {
		// Arrange
		// Create non responsive ObjectHeader which has Transparent background by default
		var oObjectHeader = new ObjectHeader({
			id: "contrastId",
			title: "test contrast container"
		});

		// System under test
		oObjectHeader.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Assert
		assert.ok(!jQuery("#" + "contrastId >").hasClass("sapContrastPlus"), "Contrast container class is not rendered since the background is Transparent");

		// cleanup
		oObjectHeader.destroy();
	});

	QUnit.test("Contrast container should be set when Background is changed from transparent to solid", async function (assert) {
		// Arrange
		// Create non responsive ObjectHeader which has Transparent background by default
		var oObjectHeader = new ObjectHeader({
			id: "contrastId",
			title: "test contrast container"
		});

		// System under test
		oObjectHeader.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Assert
		assert.ok(!jQuery("#" + "contrastId >").hasClass("sapContrastPlus"), "Contrast container class is not rendered since the background is Transparent");

		oObjectHeader.setBackgroundDesign(BackgroundDesign.Solid);
		await nextUIUpdate();

		// Assert
		assert.ok(jQuery("#" + "contrastId >").hasClass("sapContrastPlus"), "Contrast container class is rendered when the background is Solid");

		// cleanup
		oObjectHeader.destroy();
	});

	QUnit.module("Rendering Markers aggregation");

	QUnit.test("Render Draft and Unsaved", async function(assert) {
		var oObjectHeader = new ObjectHeader({
			id: "markersOH",
			title : "Markers agregation",
			number : "3.624",
			numberUnit : "EUR",
			markers: [
				new ObjectMarker({id: "draft", type: ObjectMarkerType.Draft}),
				new ObjectMarker({id: "unsaved", type: ObjectMarkerType.Unsaved})
			]
		});

		// System under test
		oObjectHeader.placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.ok(document.getElementById("draft"), "marker draft should be rendered.");
		assert.ok(document.getElementById("unsaved"), "marker unsaved should be rendered.");

		oObjectHeader.destroy();
	});

	QUnit.test("Test _hasMarkers function", async function(assert) {

		var oObjectHeader = new ObjectHeader({
			title : "Markers agregation",
			markers: [
				new ObjectMarker({id: "draft", type: ObjectMarkerType.Draft}),
				new ObjectMarker({id: "unsaved", type: ObjectMarkerType.Unsaved})
			]
		});

		// System under test
		oObjectHeader.placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.ok(oObjectHeader._hasMarkers(), "_hasMarker will return true for - ObjectHeader with markers aggregation and showMarkers property set to false");

		oObjectHeader.removeAggregation("markers");
		assert.ok(oObjectHeader._hasMarkers(), "_hasMarker will return false for - ObjectHeader with no markers aggregation");

		oObjectHeader.destroy();
	});

	/******************************************************************/

	QUnit.module("Responsive Padding Enablement");

	QUnit.test("_initResponsivePaddingsEnablement is called on init", function (assert) {
		// Arrange
		var oSpy = this.spy(ObjectHeader.prototype, "_initResponsivePaddingsEnablement"),
			oTestPage = new ObjectHeader({}).placeAt("qunit-fixture");

		// Assert
		assert.strictEqual(oSpy.callCount, 1, "Method _initResponsivePaddingsEnablement called on init of control");
		assert.ok(oSpy.calledOn(oTestPage), "The spy is called on the tested control instance");

		//clean
		oTestPage.destroy();
	});
});