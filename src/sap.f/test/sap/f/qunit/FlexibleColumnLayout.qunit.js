/*global QUnit, sinon*/
sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/f/FlexibleColumnLayout",
	"sap/f/FlexibleColumnLayoutSemanticHelper",
	"sap/m/Page",
	"sap/m/Button",
	"sap/ui/core/Core",
	"sap/f/library"
],
function (
	$,
	FlexibleColumnLayout,
	FlexibleColumnLayoutSemanticHelper,
	Page,
	Button,
	Core,
	library
) {
	"use strict";

	// shortcut for sap.f.LayoutType
	var LT = library.LayoutType;

	var sQUnitFixture = "qunit-fixture",
		DESKTOP_SIZE = "1300px",
		TABLET_SIZE = "1200px",
		PHONE_SIZE = "900px",
		ANIMATION_WAIT_TIME = 500,
		COLUMN_RESIZING_ANIMATION_DURATION = 560;

	var fnCreatePage = function (sId) {
		return new Page(sId, {
			title: "Page: " + sId,
			content: [
				new Button({text: "Button"})
			]
		});
	};

	var fnGetResourceBundleText = function (sResourceBundleKey){
		return FlexibleColumnLayout._getResourceBundle().getText(sResourceBundleKey);
	};

	var fnCreateFCL = function (oMetadata) {
		oMetadata = oMetadata || {};
		var oFCL = new FlexibleColumnLayout(oMetadata);
		oFCL.placeAt(sQUnitFixture);
		Core.applyChanges();
		return oFCL;
	};

	var oFactory = {
		createPage: fnCreatePage,
		createFCL: fnCreateFCL
	};

	/**
	 * Utility function to easily verify the visibility of the 3 columns with less code
	 * @param {object} assert - the assert object passed to the test case
	 * @param {object} oFCL - the instance that is tested upon
	 * @param {int} iBeginVisible - whether we expect the begin column to be visible or not
	 * @param {int} iMidVisible - whether we expect the mid column to be visible or not
	 * @param {int} iEndVisible - whether we expect the end column to be visible or not
	 */
	var assertColumnsVisibility = function(assert, oFCL, iBeginVisible, iMidVisible, iEndVisible) {
		var bBeginOK = (oFCL.$("beginColumn").width() > 0) === !!iBeginVisible,
			bMidOK = (oFCL.$("midColumn").width() > 0) === !!iMidVisible,
			bEndOK = (oFCL.$("endColumn").width() > 0) === !!iEndVisible;

		assert.ok(bBeginOK, "The begin column is " + (iBeginVisible ? "" : " not ") +  " visible");
		assert.ok(bMidOK, "The mid column is " + (iMidVisible ? "" : " not ") +  " visible");
		assert.ok(bEndOK, "The end column is " + (iEndVisible ? "" : " not ") +  " visible");
	};

	/**
	 * Utility function to easily verify arrows visibility
	 * @param {object} assert - the assert object passed to the test case
	 * @param {object} oFCL - the instance that is tested upon
	 * @param {int} iBeginColumnBackArrowVisible - whether we expect the _beginColumnBackArrow to be visible or not
	 * @param {int} iMidColumnBackArrowVisible - whether we expect the _midColumnBackArrow to be visible or not
	 * @param {int} iMidColumnForwardArrowVisible - whether we expect the _midColumnForwardArrow to be visible or not
	 * @param {int} iEndColumnForwardArrowVisible - whether we expect the _endColumnForwardArrow to be visible or not
	 */
	var assertArrowsVisibility = function(assert, oFCL, iBeginColumnBackArrowVisible, iMidColumnBackArrowVisible, iMidColumnForwardArrowVisible, iEndColumnForwardArrowVisible) {
		var bBBArrowOK = oFCL.getAggregation("_beginColumnBackArrow").$().is(":visible") === !!iBeginColumnBackArrowVisible,
			bMBArrowOK = oFCL.getAggregation("_midColumnBackArrow").$().is(":visible") === !!iMidColumnBackArrowVisible,
			bMFArrowOK = oFCL.getAggregation("_midColumnForwardArrow").$().is(":visible") === !!iMidColumnForwardArrowVisible,
			bEFArrowOK = oFCL.getAggregation("_endColumnForwardArrow").$().is(":visible") === !!iEndColumnForwardArrowVisible;

		assert.ok(bBBArrowOK, "The _beginColumnBackArrow is " + (iBeginColumnBackArrowVisible ? "" : " not ") +  " visible");
		assert.ok(bMBArrowOK, "The _midColumnBackArrow is " + (iMidColumnBackArrowVisible ? "" : " not ") +  " visible");
		assert.ok(bMFArrowOK, "The _midColumnForwardArrow is " + (iMidColumnForwardArrowVisible ? "" : " not ") +  " visible");
		assert.ok(bEFArrowOK, "The _endColumnForwardArrow is " + (iEndColumnForwardArrowVisible ? "" : " not ") +  " visible");

	};



	QUnit.module("DESKTOP - API", {
		beforeEach: function () {
			this.sOldAnimationSetting = $("html").attr("data-sap-ui-animation");
			$("html").attr("data-sap-ui-animation", "off");
			$("#" + sQUnitFixture).width(DESKTOP_SIZE); // > 1280px

			this.getBeginColumnBackArrow = function () { return this.oFCL.getAggregation("_beginColumnBackArrow"); };
			this.getMidColumnBackArrow = function () { return this.oFCL.getAggregation("_midColumnBackArrow"); };
			this.getMidColumnForwardArrow = function () { return this.oFCL.getAggregation("_midColumnForwardArrow"); };
			this.getEndColumnForwardArrow = function () { return this.oFCL.getAggregation("_endColumnForwardArrow"); };
		},
		afterEach: function () {
			$("html").attr("data-sap-ui-animation", this.sOldAnimationSetting);
			$("#" + sQUnitFixture).width("auto");
			this.oFCL.destroy();
		}
	});

	QUnit.test("Instantiation", function (assert) {
		this.oFCL = oFactory.createFCL();
		assert.ok(this.oFCL, "Instantiated successfully");
		assert.ok(this.oFCL.$().length, "In the DOM");

		// Assert backgroundDesign
		assert.strictEqual(this.oFCL.getBackgroundDesign(), "Transparent", "The default backgroundDesign is Transparent");
		assert.ok(!this.oFCL.$().hasClass("sapFFCLBackgroundDesignTranslucent"), "Translucent background is Not set in the  DOM");
		assert.ok(!this.oFCL.$().hasClass("sapFFCLBackgroundDesignSolid"), "Solid background is Not set in the  DOM");

		// Act: change backgroundDesign to Solid
		this.oFCL.setBackgroundDesign("Solid");

		Core.applyChanges();

		// Assert backgroundDesign
		assert.ok(this.oFCL.$().hasClass("sapFFCLBackgroundDesignSolid"), "Solid background is set in the  DOM");
		assert.ok(!this.oFCL.$().hasClass("sapFFCLBackgroundDesignTranslucent"), "Translucent background is Not set in the  DOM");

		// Act: change backgroundDesign to Translucent
		this.oFCL.setBackgroundDesign("Translucent");

		Core.applyChanges();

		// Assert backgroundDesign
		assert.ok(this.oFCL.$().hasClass("sapFFCLBackgroundDesignTranslucent"), "Translucent background is set in the  DOM");
		assert.ok(!this.oFCL.$().hasClass("sapFFCLBackgroundDesignSolid"), "Solid background is Not set in the  DOM");
	});

	QUnit.test("Layout: OneColumn", function (assert) {

		this.oFCL = oFactory.createFCL({
			Layout: LT.OneColumn
		});
		assertColumnsVisibility(assert, this.oFCL, 1, 0, 0);
	});

	QUnit.test("Layout: TwoColumnsBeginExpanded", function (assert) {

		this.oFCL = oFactory.createFCL({
			layout: LT.TwoColumnsBeginExpanded
		});
		assertColumnsVisibility(assert, this.oFCL, 1, 1, 0);
		assert.ok(this.oFCL.$("beginColumn").width() > this.oFCL.$("midColumn").width());
	});

	QUnit.test("Layout: TwoColumnsMidExpanded", function (assert) {

		this.oFCL = oFactory.createFCL({
			layout: LT.TwoColumnsMidExpanded
		});
		assertColumnsVisibility(assert, this.oFCL, 1, 1, 0);
		assert.ok(this.oFCL.$("beginColumn").width() < this.oFCL.$("midColumn").width());
	});

	QUnit.test("Layout: MidColumnFullScreen", function (assert) {

		this.oFCL = oFactory.createFCL({
			layout: LT.MidColumnFullScreen
		});
		assertColumnsVisibility(assert, this.oFCL, 0, 1, 0);
	});

	QUnit.test("Layout: ThreeColumnsMidExpanded", function (assert) {

		this.oFCL = oFactory.createFCL({
			layout: LT.ThreeColumnsMidExpanded
		});
		assertColumnsVisibility(assert, this.oFCL, 1, 1, 1);
		assert.ok(this.oFCL.$("beginColumn").width() < this.oFCL.$("midColumn").width());
		assert.ok(this.oFCL.$("endColumn").width() < this.oFCL.$("midColumn").width());
	});

	QUnit.test("Layout: ThreeColumnsEndExpanded", function (assert) {

		this.oFCL = oFactory.createFCL({
			layout: LT.ThreeColumnsEndExpanded
		});
		assertColumnsVisibility(assert, this.oFCL, 1, 1, 1);
		assert.ok(this.oFCL.$("beginColumn").width() < this.oFCL.$("endColumn").width());
		assert.ok(this.oFCL.$("midColumn").width() < this.oFCL.$("endColumn").width());
	});

	QUnit.test("Layout: ThreeColumnsMidExpandedEndHidden", function (assert) {

		this.oFCL = oFactory.createFCL({
			layout: LT.ThreeColumnsMidExpandedEndHidden
		});
		assertColumnsVisibility(assert, this.oFCL, 1, 1, 0);
		assert.ok(this.oFCL.$("beginColumn").width() < this.oFCL.$("midColumn").width());
	});

	QUnit.test("Layout: ThreeColumnsBeginExpandedEndHidden", function (assert) {

		this.oFCL = oFactory.createFCL({
			layout: LT.ThreeColumnsBeginExpandedEndHidden
		});
		assertColumnsVisibility(assert, this.oFCL, 1, 1, 0);
		assert.ok(this.oFCL.$("midColumn").width() < this.oFCL.$("beginColumn").width());
	});

	QUnit.test("Layout: EndColumnFullScreen", function (assert) {

		this.oFCL = oFactory.createFCL({
			layout: LT.EndColumnFullScreen
		});
		assertColumnsVisibility(assert, this.oFCL, 0, 0, 1);
	});

	QUnit.test("Navigation arrows - 1 column", function (assert) {
		this.oFCL = oFactory.createFCL();
		assertArrowsVisibility(assert, this.oFCL, 0, 0, 0, 0);
	});

	QUnit.test("Navigation arrows - 2 columns", function (assert) {
		this.oFCL = oFactory.createFCL({
			layout: LT.TwoColumnsBeginExpanded,
			beginColumnPages: [new sap.m.Page()]
		});
		this.oFCL._onNavContainerRendered({srcControl: this.oFCL.getAggregation("_beginColumnNav")});

		assertArrowsVisibility(assert, this.oFCL, 1, 0, 0, 0);
	});

	QUnit.test("Navigation arrows - 2 columns operations", function (assert) {
		this.oFCL = oFactory.createFCL({
			layout: LT.TwoColumnsBeginExpanded,
			beginColumnPages: [new sap.m.Page()]
		});
		this.oFCL._onNavContainerRendered({srcControl: this.oFCL.getAggregation("_beginColumnNav")});

		this.getBeginColumnBackArrow().firePress();
		assertArrowsVisibility(assert, this.oFCL, 0, 0, 1, 0);

		this.getMidColumnForwardArrow().firePress();
		assertArrowsVisibility(assert, this.oFCL, 1, 0, 0, 0);
	});

	QUnit.test("Navigation arrows - 3 columns (mid column Expanded, not-fixed 3-column layout)", function (assert) {
		this.oFCL = oFactory.createFCL({
			layout: LT.ThreeColumnsMidExpanded,
			beginColumnPages: [new sap.m.Page()]
		});
		this.oFCL._onNavContainerRendered({srcControl: this.oFCL.getAggregation("_beginColumnNav")});

		assertArrowsVisibility(assert, this.oFCL, 0, 1, 1, 0);
	});

	QUnit.test("Navigation arrows - 3 columns operation (not-fixed 3-column layout)", function (assert) {
		this.clock = sinon.useFakeTimers();

		this.oFCL = oFactory.createFCL({
			layout: LT.ThreeColumnsMidExpanded,
			beginColumnPages: [new sap.m.Page()]
		});
		this.oFCL._onNavContainerRendered({srcControl: this.oFCL.getAggregation("_beginColumnNav")});

		this.getMidColumnForwardArrow().firePress();
		assertArrowsVisibility(assert, this.oFCL, 0, 1, 1, 0);

		//since the last column is concealed we must wait for all animations to end.
		this.clock.tick(COLUMN_RESIZING_ANIMATION_DURATION);
		assertColumnsVisibility(assert, this.oFCL, 1, 1, 0); // End column is gone

		// Click it again
		this.getMidColumnForwardArrow().firePress();
		assertArrowsVisibility(assert, this.oFCL, 1, 0, 0, 0);

		this.getBeginColumnBackArrow().firePress();
		assertArrowsVisibility(assert, this.oFCL, 0, 1, 1, 0);

		this.getMidColumnBackArrow().firePress();
		assertArrowsVisibility(assert, this.oFCL, 0, 1, 1, 0);
		assertColumnsVisibility(assert, this.oFCL, 1, 1, 1); // End column is back

		this.getMidColumnBackArrow().firePress();
		assertArrowsVisibility(assert, this.oFCL, 0, 0, 0, 1);

		this.getEndColumnForwardArrow().firePress();
		assertArrowsVisibility(assert, this.oFCL, 0, 1, 1, 0);
		this.clock.restore();
	});

	QUnit.test("Resizing the control triggers a layout change - phone", function (assert) {
		var fnDone = assert.async(),
			$qunitFixture = $("#" + sQUnitFixture),
			iInitialWidth = $qunitFixture.width();

		assert.expect(3);

		this.oFCL = oFactory.createFCL({
			layout: LT.ThreeColumnsMidExpanded
		});

		$qunitFixture.width(PHONE_SIZE);

		setTimeout(function () {
			assertColumnsVisibility(assert, this.oFCL, 0, 0, 1);
			$qunitFixture.width(iInitialWidth);
			fnDone();
		}.bind(this), ANIMATION_WAIT_TIME);
	});

	QUnit.test("Resizing the control triggers a layout change - tablet", function (assert) {
		var fnDone = assert.async(),
			$qunitFixture = $("#" + sQUnitFixture),
			iInitialWidth = $qunitFixture.width();

		assert.expect(3);

		this.oFCL = oFactory.createFCL({
			layout: LT.ThreeColumnsMidExpanded
		});

		$qunitFixture.width(TABLET_SIZE);

		setTimeout(function () {
			assertColumnsVisibility(assert, this.oFCL, 0, 1, 1);
			$qunitFixture.width(iInitialWidth);
			fnDone();
		}.bind(this), ANIMATION_WAIT_TIME);
	});

	QUnit.test("Resizing the control triggers a layout change - desktop", function (assert) {
		var fnDone = assert.async(),
			$qunitFixture = $("#" + sQUnitFixture),
			iInitialWidth = $qunitFixture.width();

		assert.expect(3);

		this.oFCL = oFactory.createFCL({
			layout: LT.ThreeColumnsMidExpanded
		});

		$("#" + sQUnitFixture).width(DESKTOP_SIZE);

		setTimeout(function () {
			assertColumnsVisibility(assert, this.oFCL, 1, 1, 1);
			$qunitFixture.width(iInitialWidth);
			fnDone();
		}.bind(this), ANIMATION_WAIT_TIME);
	});

	QUnit.test("stateChange event is fired on the first load", function (assert) {

		this.oFCL = new FlexibleColumnLayout();
		var oEventSpy = this.spy(this.oFCL, "fireStateChange");

		this.oFCL.placeAt(sQUnitFixture);
		Core.applyChanges();

		assert.ok(oEventSpy.called, "Layout change event fired");
	});

	QUnit.test("stateChange event is not fired when setLayout is called", function (assert) {
		this.oFCL = oFactory.createFCL();
		var oEventSpy = this.spy(this.oFCL, "fireStateChange");

		this.oFCL.setLayout(LT.TwoColumnsBeginExpanded);
		assert.ok(!oEventSpy.called, "Layout change event not fired");
	});

	QUnit.test("stateChange event is fired on resize events that trigger a breakpoint change", function (assert) {
		this.clock = sinon.useFakeTimers();

		this.oFCL = oFactory.createFCL({
			layout: LT.ThreeColumnsMidExpanded
		});
		var oEventSpy = this.spy(this.oFCL, "fireStateChange");

		// Should be fired when a resize causes a layout change
		$("#" + sQUnitFixture).width(TABLET_SIZE);
		this.clock.tick(ANIMATION_WAIT_TIME);
		assert.ok(oEventSpy.called, "Layout change event fired");

		this.clock.restore();
	});

	QUnit.test("stateChange event is not fired on resize events that do not trigger a breakpoint change", function (assert) {
		this.clock = sinon.useFakeTimers();

		this.oFCL = oFactory.createFCL({
			layout: LT.ThreeColumnsMidExpanded
		});
		var oEventSpy = this.spy(this.oFCL, "fireStateChange");

		// Should be fired when a resize causes a layout change
		$("#" + sQUnitFixture).width(TABLET_SIZE + 1); // Still on desktop
		this.clock.tick(ANIMATION_WAIT_TIME);
		assert.ok(!oEventSpy.called, "Layout change event not fired");

		this.clock.restore();
	});

	QUnit.test("stateChange event is not fired while the control has 0 width", function (assert) {
		this.clock = sinon.useFakeTimers();

		var $fixture = $("#" + sQUnitFixture),
			iOldWidth = $fixture.width();

		$fixture.width(0);

		this.oFCL = new FlexibleColumnLayout();
		var oEventSpy = this.spy(this.oFCL, "fireStateChange");

		this.oFCL.placeAt(sQUnitFixture);
		Core.applyChanges();

		assert.ok(!oEventSpy.called, "Layout change event from onAfterRendering not fired");

		this.oFCL.setLayout(LT.ThreeColumnsEndExpanded);
		assert.ok(!oEventSpy.called, "Layout change event from calling setLayout not fired");

		// Should be fired when the control is resized to non-zero width
		$fixture.width(PHONE_SIZE);
		this.clock.tick(ANIMATION_WAIT_TIME);
		assert.ok(oEventSpy.called, "Layout change event fired");

		$fixture.width(iOldWidth);
		this.clock.restore();
	});

	QUnit.test("stateChange event is fired on navigation arrow click", function (assert) {
		this.oFCL = oFactory.createFCL({
			layout: LT.ThreeColumnsMidExpanded
		});
		var oEventSpy = this.spy(this.oFCL, "fireStateChange");

		this.getMidColumnForwardArrow().firePress();
		assert.ok(oEventSpy.called, "Layout change event fired");
	});

	QUnit.module("TABLET - API", {
		beforeEach: function () {
			this.sOldAnimationSetting = $("html").attr("data-sap-ui-animation");
			$("html").attr("data-sap-ui-animation", "off");
			$("#" + sQUnitFixture).width(TABLET_SIZE); // Between 960 and 1280

			this.getBeginColumnBackArrow = function () { return this.oFCL.getAggregation("_beginColumnBackArrow"); };
			this.getMidColumnBackArrow = function () { return this.oFCL.getAggregation("_midColumnBackArrow"); };
			this.getMidColumnForwardArrow = function () { return this.oFCL.getAggregation("_midColumnForwardArrow"); };
			this.getEndColumnForwardArrow = function () { return this.oFCL.getAggregation("_endColumnForwardArrow"); };
		},
		afterEach: function () {
			$("html").attr("data-sap-ui-animation", this.sOldAnimationSetting);
			$("#" + sQUnitFixture).width("auto");
			this.oFCL.destroy();
		}
	});

	QUnit.test("Layout: OneColumn", function (assert) {

		this.oFCL = oFactory.createFCL({
			layout: LT.OneColumn
		});
		assertColumnsVisibility(assert, this.oFCL, 1, 0, 0);
	});

	QUnit.test("Layout: TwoColumnsBeginExpanded", function (assert) {

		this.oFCL = oFactory.createFCL({
			layout: "TwoColumnsBeginExpanded"
		});
		assertColumnsVisibility(assert, this.oFCL, 1, 1, 0);
		assert.ok(this.oFCL.$("beginColumn").width() > this.oFCL.$("midColumn").width());
	});

	QUnit.test("Layout: TwoColumnsMidExpanded", function (assert) {

		this.oFCL = oFactory.createFCL({
			layout: "TwoColumnsMidExpanded"
		});
		assertColumnsVisibility(assert, this.oFCL, 1, 1, 0);
		assert.ok(this.oFCL.$("beginColumn").width() < this.oFCL.$("midColumn").width());
	});

	QUnit.test("Layout: MidColumnFullScreen", function (assert) {

		this.oFCL = oFactory.createFCL({
			layout: LT.MidColumnFullScreen
		});
		assertColumnsVisibility(assert, this.oFCL, 0, 1, 0);
	});

	QUnit.test("Layout: ThreeColumnsMidExpanded", function (assert) {

		this.oFCL = oFactory.createFCL({
			layout: LT.ThreeColumnsMidExpanded
		});
		assertColumnsVisibility(assert, this.oFCL, 0, 1, 1);
		assert.ok(this.oFCL.$("endColumn").width() < this.oFCL.$("midColumn").width());
	});

	QUnit.test("Layout: ThreeColumnsEndExpanded", function (assert) {

		this.oFCL = oFactory.createFCL({
			layout: LT.ThreeColumnsEndExpanded
		});
		assertColumnsVisibility(assert, this.oFCL, 0, 1, 1);
		assert.ok(this.oFCL.$("midColumn").width() < this.oFCL.$("endColumn").width());
	});

	QUnit.test("Layout: ThreeColumnsMidExpandedEndHidden", function (assert) {

		this.oFCL = oFactory.createFCL({
			layout: LT.ThreeColumnsMidExpandedEndHidden
		});
		assertColumnsVisibility(assert, this.oFCL, 1, 1, 0);
		assert.ok(this.oFCL.$("beginColumn").width() < this.oFCL.$("midColumn").width());
	});

	QUnit.test("Layout: ThreeColumnsBeginExpandedEndHidden", function (assert) {

		this.oFCL = oFactory.createFCL({
			layout: LT.ThreeColumnsBeginExpandedEndHidden
		});
		assertColumnsVisibility(assert, this.oFCL, 1, 1, 0);
		assert.ok(this.oFCL.$("midColumn").width() < this.oFCL.$("beginColumn").width());
	});

	QUnit.test("Layout: EndColumnFullScreen", function (assert) {

		this.oFCL = oFactory.createFCL({
			layout: LT.EndColumnFullScreen
		});
		assertColumnsVisibility(assert, this.oFCL, 0, 0, 1);
	});

	QUnit.test("Navigation arrows - 2 columns", function (assert) {
		this.oFCL = oFactory.createFCL({
			layout: LT.TwoColumnsBeginExpanded,
			beginColumnPages: [new sap.m.Page()]
		});
		this.oFCL._onNavContainerRendered({srcControl: this.oFCL.getAggregation("_beginColumnNav")});

		assertArrowsVisibility(assert, this.oFCL, 1, 0, 0, 0);
	});

	QUnit.test("Navigation arrows - 2 columns operations", function (assert) {
		this.oFCL = oFactory.createFCL({
			layout: LT.TwoColumnsBeginExpanded,
			beginColumnPages: [new sap.m.Page()]
		});
		this.oFCL._onNavContainerRendered({srcControl: this.oFCL.getAggregation("_beginColumnNav")});

		this.getBeginColumnBackArrow().firePress();
		assertArrowsVisibility(assert, this.oFCL, 0, 0, 1, 0);

		this.getMidColumnForwardArrow().firePress();
		assertArrowsVisibility(assert, this.oFCL, 1, 0, 0, 0);
	});

	QUnit.test("Navigation arrows - 3 columns", function (assert) {
		this.oFCL = oFactory.createFCL({
			layout: LT.ThreeColumnsMidExpanded,
			beginColumnPages: [new sap.m.Page()]
		});
		this.oFCL._onNavContainerRendered({srcControl: this.oFCL.getAggregation("_beginColumnNav")});

		assertArrowsVisibility(assert, this.oFCL, 0, 1, 1, 0);
	});

	QUnit.test("Navigation arrows - 3 columns operation", function (assert) {
		this.clock = sinon.useFakeTimers();

		this.oFCL = oFactory.createFCL({
			layout: LT.ThreeColumnsMidExpanded,
			beginColumnPages: [new sap.m.Page()]
		});
		this.oFCL._onNavContainerRendered({srcControl: this.oFCL.getAggregation("_beginColumnNav")});

		this.getMidColumnForwardArrow().firePress();
		assertArrowsVisibility(assert, this.oFCL, 0, 1, 1, 0);

		//since the last column is concealed we must wait for all animations to end.
		this.clock.tick(COLUMN_RESIZING_ANIMATION_DURATION);
		assertColumnsVisibility(assert, this.oFCL, 1, 1, 0); // End column is gone

		// Click it again
		this.getMidColumnForwardArrow().firePress();
		assertArrowsVisibility(assert, this.oFCL, 1, 0, 0, 0);

		this.getBeginColumnBackArrow().firePress();
		assertArrowsVisibility(assert, this.oFCL, 0, 1, 1, 0);

		this.getMidColumnBackArrow().firePress();
		assertArrowsVisibility(assert, this.oFCL, 0, 1, 1, 0);
		assertColumnsVisibility(assert, this.oFCL, 0, 1, 1); // End column is back
		this.clock.restore();
	});

	QUnit.module("PHONE - API", {
		beforeEach: function () {
			this.sOldAnimationSetting = $("html").attr("data-sap-ui-animation");
			$("html").attr("data-sap-ui-animation", "off");
			$("#" + sQUnitFixture).width(PHONE_SIZE); // < 960px
		},
		afterEach: function () {
			$("html").attr("data-sap-ui-animation", this.sOldAnimationSetting);
			$("#" + sQUnitFixture).width("auto");
			this.oFCL.destroy();
		}
	});

	QUnit.test("Layout: OneColumn", function (assert) {

		this.oFCL = oFactory.createFCL({
			layout: LT.OneColumn
		});
		assertColumnsVisibility(assert, this.oFCL, 1, 0, 0);
	});

	QUnit.test("Layout: TwoColumnsBeginExpanded", function (assert) {

		this.oFCL = oFactory.createFCL({
			layout: "TwoColumnsBeginExpanded"
		});
		assertColumnsVisibility(assert, this.oFCL, 0, 1, 0);
	});

	QUnit.test("Layout: TwoColumnsMidExpanded", function (assert) {

		this.oFCL = oFactory.createFCL({
			layout: "TwoColumnsMidExpanded"
		});
		assertColumnsVisibility(assert, this.oFCL, 0, 1, 0);
	});

	QUnit.test("Layout: MidColumnFullScreen", function (assert) {

		this.oFCL = oFactory.createFCL({
			layout: LT.MidColumnFullScreen
		});
		assertColumnsVisibility(assert, this.oFCL, 0, 1, 0);
	});

	QUnit.test("Layout: ThreeColumnsMidExpanded", function (assert) {

		this.oFCL = oFactory.createFCL({
			layout: LT.ThreeColumnsMidExpanded
		});
		assertColumnsVisibility(assert, this.oFCL, 0, 0, 1);
	});

	QUnit.test("Layout: ThreeColumnsEndExpanded", function (assert) {

		this.oFCL = oFactory.createFCL({
			layout: LT.ThreeColumnsEndExpanded
		});
		assertColumnsVisibility(assert, this.oFCL, 0, 0, 1);
	});

	QUnit.test("Layout: ThreeColumnsMidExpandedEndHidden", function (assert) {

		this.oFCL = oFactory.createFCL({
			layout: LT.ThreeColumnsMidExpandedEndHidden
		});
		assertColumnsVisibility(assert, this.oFCL, 0, 0, 1);
	});

	QUnit.test("Layout: ThreeColumnsBeginExpandedEndHidden", function (assert) {

		this.oFCL = oFactory.createFCL({
			layout: LT.ThreeColumnsBeginExpandedEndHidden
		});
		assertColumnsVisibility(assert, this.oFCL, 0, 0, 1);
	});

	QUnit.test("Layout: EndColumnFullScreen", function (assert) {

		this.oFCL = oFactory.createFCL({
			layout: LT.EndColumnFullScreen
		});
		assertColumnsVisibility(assert, this.oFCL, 0, 0, 1);
	});

	QUnit.test("Navigation arrows - 1 column", function (assert) {
		this.oFCL = oFactory.createFCL();
		assertArrowsVisibility(assert, this.oFCL, 0, 0, 0, 0);
	});

	QUnit.test("Navigation arrows - 2 columns", function (assert) {
		this.oFCL = oFactory.createFCL({
			layout: LT.TwoColumnsBeginExpanded
		});
		assertArrowsVisibility(assert, this.oFCL, 0, 0, 0, 0);
	});

	QUnit.test("Navigation arrows - 3 columns", function (assert) {
		this.oFCL = oFactory.createFCL({
			layout: LT.ThreeColumnsMidExpanded
		});

		assertArrowsVisibility(assert, this.oFCL, 0, 0, 0, 0);
	});

	QUnit.module("Nav containers proxying", {
		beforeEach: function () {
			this.sOldAnimationSetting = $("html").attr("data-sap-ui-animation");
			$("html").attr("data-sap-ui-animation", "off");
			$("#" + sQUnitFixture).width(DESKTOP_SIZE);
		},
		afterEach: function () {
			$("html").attr("data-sap-ui-animation", this.sOldAnimationSetting);
			this.oFCL.destroy();
		}
	});

	QUnit.test("Begin column nav container proxying works", function (assert) {
		this.clock = sinon.useFakeTimers();

		var oPage1 = oFactory.createPage("page1"),
			oPage2 = oFactory.createPage("page2"),
			oSpyNavigate = this.spy(),
			oSpyAfterNavigate = this.spy(),
			oSpyTo,
			oSpyBack;

		this.oFCL = oFactory.createFCL({
			beginColumnPages: [oPage1, oPage2],
			initialBeginColumnPage: "page2",
			defaultTransitionNameBeginColumn: "fade",
			beginColumnNavigate: oSpyNavigate,
			afterBeginColumnNavigate: oSpyAfterNavigate
		});

		oSpyTo = this.spy(this.oFCL._getBeginColumn(), "to");
		oSpyBack = this.spy(this.oFCL._getBeginColumn(), "backToPage");

		assert.strictEqual(this.oFCL._getBeginColumn().getInitialPage(), "page2", "The initial page was correctly set");

		var sPagesIds = this.oFCL._getBeginColumn().getPages().map(function(oPage) {
			return oPage.getId();
		}).join("");
		assert.strictEqual(sPagesIds, "page1page2", "All given pages are in the Begin column nav container");

		assert.strictEqual(this.oFCL._getBeginColumn().getDefaultTransitionName(), "fade", "The default transition was set to Begin column nav container");

		this.oFCL.to("page1");
		assert.ok(oSpyTo.called, "The proper to method was called");
		assert.ok(oSpyNavigate.called, "Navigate spy called");

		this.clock.tick(5000);
		assert.ok(oSpyAfterNavigate.called, "After navigate spy called");

		this.oFCL.backToPage("page2");
		assert.ok(oSpyBack.called, "The proper backToPage method was called");

		this.clock.restore();
	});

	QUnit.test("Mid column nav container proxying works", function (assert) {
		this.clock = sinon.useFakeTimers();

		var oPage1 = oFactory.createPage("page1"),
			oPage2 = oFactory.createPage("page2"),
			oSpyNavigate = this.spy(),
			oSpyAfterNavigate = this.spy(),
			oSpyTo,
			oSpyBack;

		this.oFCL = oFactory.createFCL({
			midColumnPages: [oPage1, oPage2],
			initialMidColumnPage: "page2",
			defaultTransitionNameMidColumn: "fade",
			midColumnNavigate: oSpyNavigate,
			afterMidColumnNavigate: oSpyAfterNavigate
		});

		oSpyTo = this.spy(this.oFCL._getMidColumn(), "to");
		oSpyBack = this.spy(this.oFCL._getMidColumn(), "backToPage");

		assert.strictEqual(this.oFCL._getMidColumn().getInitialPage(), "page2", "The initial page was correctly set");

		var sPagesIds = this.oFCL._getMidColumn().getPages().map(function(oPage) {
			return oPage.getId();
		}).join("");
		assert.strictEqual(sPagesIds, "page1page2", "All given pages are in the Mid column nav container");

		assert.strictEqual(this.oFCL._getMidColumn().getDefaultTransitionName(), "fade", "The default transition was set to Mid column nav container");

		this.oFCL.to("page1");
		assert.ok(oSpyTo.called, "The proper to method was called");
		assert.ok(oSpyNavigate.called, "Navigate spy called");

		this.clock.tick(5000);
		assert.ok(oSpyAfterNavigate.called, "After navigate spy called");

		this.oFCL.backToPage("page2");
		assert.ok(oSpyBack.called, "The proper backToPage method was called");

		this.clock.restore();
	});

	QUnit.test("End column nav container proxying works", function (assert) {
		this.clock = sinon.useFakeTimers();

		var oPage1 = oFactory.createPage("page1"),
			oPage2 = oFactory.createPage("page2"),
			oSpyNavigate = this.spy(),
			oSpyAfterNavigate = this.spy(),
			oSpyTo,
			oSpyBack;

		this.oFCL = oFactory.createFCL({
			endColumnPages: [oPage1, oPage2],
			initialEndColumnPage: "page2",
			defaultTransitionNameEndColumn: "fade",
			endColumnNavigate: oSpyNavigate,
			afterEndColumnNavigate: oSpyAfterNavigate
		});

		oSpyTo = this.spy(this.oFCL._getEndColumn(), "to");
		oSpyBack = this.spy(this.oFCL._getEndColumn(), "backToPage");

		assert.strictEqual(this.oFCL._getEndColumn().getInitialPage(), "page2", "The initial page was correctly set");

		var sPagesIds = this.oFCL._getEndColumn().getPages().map(function(oPage) {
			return oPage.getId();
		}).join("");
		assert.strictEqual(sPagesIds, "page1page2", "All given pages are in the End column nav container");

		assert.strictEqual(this.oFCL._getEndColumn().getDefaultTransitionName(), "fade", "The default transition was set to End column nav container");

		this.oFCL.to("page1");
		assert.ok(oSpyTo.called, "The proper to method was called");
		assert.ok(oSpyNavigate.called, "Navigate spy called");

		this.clock.tick(5000);
		assert.ok(oSpyAfterNavigate.called, "After navigate spy called");

		this.oFCL.backToPage("page2");
		assert.ok(oSpyBack.called, "The proper backToPage method was called");

		this.clock.restore();
	});

	QUnit.module("Layout changes", {
		beforeEach: function () {
			this.oFCL = oFactory.createFCL({
				layout: LT.TwoColumnsBeginExpanded
			});
		},
		afterEach: function () {
			this.oFCL.destroy();
			this.oFCL = null;
		}
	});

	QUnit.test("ResizeHandler's resume method is not called before the toggling of pin column class", function (assert) {
		// Arrange
		var $column = this.oFCL._$columns["begin"],
			oSpyResizeHandler = this.spy(this.oFCL, "_resumeResizeHandler"),
			oStubToggleClass = this.stub($column, "toggleClass", function () {
				// Assert
				assert.ok(oSpyResizeHandler.notCalled,
					"ResizeHandler's resume method is not called before the toggling of pin column class");
			});

		// Act
		this.oFCL._adjustColumnAfterAnimation(false, "300px", 400, $column, $column.get(0));

		// Clean up
		oSpyResizeHandler.restore();
		oStubToggleClass.restore();
	});


	QUnit.test("Suspending and resuming ResizeHandler upon column layout change", function (assert) {
		// assert
		assert.expect(6);

		// arrange
		var fnDone = assert.async(),
			iAnimationDelay = 600,
			oBeginColumnArrow =  this.oFCL.getAggregation("_beginColumnBackArrow"),
			aColumns = ["begin", "mid", "end"];

		// аct
		oBeginColumnArrow.firePress();

		// assert
		aColumns.forEach(function (sColumn) {
			assert.notEqual(this.oFCL._$columns[sColumn]._iResumeResizeHandlerTimeout, null,
				"ResizeHandler suspended for column '" + sColumn + "' and resume scheduled.");
		}.bind(this));

		setTimeout(function() {
			aColumns.forEach(function (sColumn) {
				// assert
				assert.strictEqual(this.oFCL._$columns[sColumn]._iResumeResizeHandlerTimeout, null,
					"ResizeHandler resumed for column '" + sColumn + "'.");
			}.bind(this));

			fnDone();
		}.bind(this), iAnimationDelay);
	});

	QUnit.test("Storing resize information for the reveal effect", function (assert) {
		assert.strictEqual(this.oFCL._iPreviousVisibleColumnsCount, 2, "The default TwoColumnsBeginExpanded layout has 2 columns");
		assert.strictEqual(this.oFCL._bWasFullScreen, false, "TwoColumnsBeginExpanded isn't a fullscreen layout");

		this.oFCL.setLayout(LT.ThreeColumnsMidExpanded);
		assert.strictEqual(this.oFCL._iPreviousVisibleColumnsCount, 3, "ThreeColumnsMidExpanded has 3 columns");
		assert.strictEqual(this.oFCL._bWasFullScreen, false, "ThreeColumnsMidExpanded isn't a fullscreen layout");

		this.oFCL.setLayout(LT.EndColumnFullScreen);
		assert.strictEqual(this.oFCL._iPreviousVisibleColumnsCount, 1, "EndColumnFullScreen has only 1 visible column");
		assert.strictEqual(this.oFCL._bWasFullScreen, true, "EndColumnFullScreen is a fullscreen layout");
	});

	QUnit.test("Storing resize information for the conceal effect", function (assert) {
		assert.strictEqual(this.oFCL._iPreviousVisibleColumnsCount, 2, "The default TwoColumnsBeginExpanded layout has 2 columns");
		assert.strictEqual(this.oFCL._bWasFullScreen, false, "TwoColumnsBeginExpanded isn't a fullscreen layout");
		assert.strictEqual(this.oFCL._sPreviuosLastVisibleColumn, "mid",
			"The default TwoColumnsBeginExpanded layout has the 'mid' column as the last visible column");

		this.oFCL.setLayout(LT.ThreeColumnsMidExpanded);
		assert.strictEqual(this.oFCL._iPreviousVisibleColumnsCount, 3, "ThreeColumnsMidExpanded has 3 columns");
		assert.strictEqual(this.oFCL._bWasFullScreen, false, "ThreeColumnsMidExpanded isn't a fullscreen layout");
		assert.strictEqual(this.oFCL._sPreviuosLastVisibleColumn, "end",
			"The ThreeColumnsMidExpanded layout has the 'end' column as the last visible column");
	});

	QUnit.test("Reveal effect pinning decision", function (assert) {
		// Simulate last column and switch to a layout with more columns
		assert.strictEqual(this.oFCL._shouldRevealColumn(3, true), true, "Third column should be pinned if any ThreeColumn layout is opened");

		// New layout has more columns, but we are not testing the last column
		assert.strictEqual(this.oFCL._shouldRevealColumn(3, false), false, "First or second columns shouldn't be pinned for ThreeColumn layouts");

		// New layout has less columns than the current one
		assert.strictEqual(this.oFCL._shouldRevealColumn(1, true), false, "No pinning should be done when the new column has fewer columns");

		// Set a fullscreen layout
		this.oFCL.setLayout(LT.MidColumnFullScreen);
		assert.strictEqual(this.oFCL._shouldRevealColumn(2, true), false, "No pinning should be done when closing a fullscreen layout");
	});

	QUnit.test("Conceal effect layout changes", function(assert) {
		//arrange
		var $endColumn = this.oFCL._$columns["end"],
			fnDone = assert.async();

		assert.expect(8);

		this.oFCL.setLayout(LT.ThreeColumnsMidExpanded);

		//the animation hasn't been executed so the three columns are visible
		assertColumnsVisibility(assert, this.oFCL, 1, 1, 1);
		assert.ok($endColumn.hasClass("sapFFCLPinnedColumn"),
			"End column should have the 'sapFFCLPinnedColumn' class applied.");

		this.oFCL.getAggregation("_midColumnForwardArrow").firePress();
		setTimeout(function() {
			//assert
			assertColumnsVisibility(assert, this.oFCL, 1, 1, 0); // End column is gone
			assert.notOk($endColumn.hasClass("sapFFCLPinnedColumn"),
				"End column should not have the 'sapFFCLPinnedColumn' class applied.");

			fnDone();
		}.bind(this), COLUMN_RESIZING_ANIMATION_DURATION);
	});

	//BCP: 1970178100
	QUnit.test(
		"Conceal effect layout changes - simulate navigation from detailDetail to about page with two initial columns setup",
		function(assert) {

		// arrange
		var fnDone = assert.async(),
			iAnimationDelay = COLUMN_RESIZING_ANIMATION_DURATION + 100;

		this.oFCL = oFactory.createFCL({
			layout: LT.TwoColumnsBeginExpanded
		});

		// act
		this.oFCL.setLayout(LT.EndColumnFullScreen);

		setTimeout(function() {
			// assert
			assertColumnsVisibility(assert, this.oFCL, 0, 0, 1);
			fnDone();
		}.bind(this), iAnimationDelay);
	});

	//BCP: 1980006195
	QUnit.test("Columns with width 0 should have the sapFFCLColumnHidden class applied", function(assert){
		// arrange
		var fnDone = assert.async(),
			iAnimationDelay = COLUMN_RESIZING_ANIMATION_DURATION + 100;

		this.oFCL = oFactory.createFCL({
			layout: LT.MidColumnFullScreen
		});


		setTimeout(function() {
			// assert
			assertColumnsVisibility(assert, this.oFCL, 0, 1, 0);
			assert.ok(this.oFCL._$columns["begin"].hasClass('sapFFCLColumnHidden'));
			assert.notOk(this.oFCL._$columns["mid"].hasClass('sapFFCLColumnHidden'));
			assert.ok(this.oFCL._$columns["end"].hasClass('sapFFCLColumnHidden'));

			// act
			this.oFCL._adjustColumnDisplay(this.oFCL._$columns["end"], 100);

			// assert
			assert.notOk(this.oFCL._$columns["end"].hasClass('sapFFCLColumnHidden'),
				"When width is updated, 'sapFFCLColumnHidden' class should be removed");

			fnDone();
		}.bind(this), iAnimationDelay);
	});

	QUnit.module("ScreenReader supprot", {
		beforeEach: function () {
			this.oFCL = oFactory.createFCL();
		},
		afterEach: function () {
			this.oFCL = null;
		}
	});

	QUnit.test("Each column has correct region role and it's labeled correctly", function (assert) {
		var fnGetLabelText = function (sColumnName) {
			return Core.byId(this.oFCL.$(sColumnName).attr("aria-labelledby")).getText();
		}.bind(this);

		assert.strictEqual(this.oFCL.$("beginColumn").attr("role"), "region", "Begin column has correct role");
		assert.strictEqual(this.oFCL.$("midColumn").attr("role"), "region", "Middle column has correct role");
		assert.strictEqual(this.oFCL.$("endColumn").attr("role"), "region", "End column has correct role");

		assert.strictEqual(fnGetLabelText("beginColumn"), fnGetResourceBundleText("FCL_BEGIN_COLUMN_REGION_TEXT"), "Begin column is labeled correctly");
		assert.strictEqual(fnGetLabelText("midColumn"), fnGetResourceBundleText("FCL_MID_COLUMN_REGION_TEXT"), "Middle column is labeled correctly");
		assert.strictEqual(fnGetLabelText("endColumn"), fnGetResourceBundleText("FCL_END_COLUMN_REGION_TEXT"), "End column is labeled correctly");
	});

	QUnit.test("Navigation buttons have correct tooltips", function (assert) {
		var fnGetButtonTooltip = function (sAggregationName) {
			return this.oFCL.getAggregation(sAggregationName).getTooltip();
		}.bind(this);

		assert.strictEqual(fnGetButtonTooltip("_beginColumnBackArrow"),
			fnGetResourceBundleText("FCL_BEGIN_COLUMN_BACK_ARROW"), "Begin column back arrow has correct tooltip");
		assert.strictEqual(fnGetButtonTooltip("_midColumnBackArrow"),
			fnGetResourceBundleText("FCL_MID_COLUMN_BACK_ARROW"), "Mid column back arrow has correct tooltip");
		assert.strictEqual(fnGetButtonTooltip("_midColumnForwardArrow"),
			fnGetResourceBundleText("FCL_MID_COLUMN_FORWARD_ARROW"), "Mid column forward arrow has correct tooltip");
		assert.strictEqual(fnGetButtonTooltip("_endColumnForwardArrow"),
			fnGetResourceBundleText("FCL_END_COLUMN_FORWARD_ARROW"), "End column forward arrow has correct tooltip");
	});

	QUnit.module("FlexibleColumnLayoutSemanticHelper");

	QUnit.test("SemanticHelper cleans destroyed FCL instance data", function (assert) {
		var sId = "myFCL",
			oFCL;

		// setup
		oFCL = new FlexibleColumnLayout(sId);

		// act
		FlexibleColumnLayoutSemanticHelper.getInstanceFor(oFCL);

		// assert
		assert.ok(FlexibleColumnLayoutSemanticHelper._oInstances[sId], "Semantic helper has an entry for this FCL");

		// act again
		oFCL.destroy();

		// assert the opposite
		assert.ok(!FlexibleColumnLayoutSemanticHelper._oInstances[sId], "Semantic helper no longer has an entry for this FCL");
	});

	QUnit.test("SemanticHelper whenDOMReady", function (assert) {
		assert.expect(3);
		var fnDone = assert.async();

		var sId = "myFCL";

		// setup
		var oFCL = new FlexibleColumnLayout(sId);


		var oFlexibleColumnLayoutSemanticHelper = FlexibleColumnLayoutSemanticHelper.getInstanceFor(oFCL);

		oFlexibleColumnLayoutSemanticHelper.whenDOMReady()
			.then(function () {
				assert.ok(oFlexibleColumnLayoutSemanticHelper.isDOMReady(), 'The FlexibleColumnLayout instance is now rendered');

				oFCL.destroy();

				oFlexibleColumnLayoutSemanticHelper.whenDOMReady()
					.catch(function () {
						assert.notOk(oFlexibleColumnLayoutSemanticHelper.isDOMReady(), 'The FlexibleColumnLayout was destroyed and its DOM was removed');

						fnDone();
					});

			});

		assert.notOk(oFlexibleColumnLayoutSemanticHelper.isDOMReady(), 'The FlexibleColumnLayout instance is not yet rendered');

		// act
		oFCL.placeAt(sQUnitFixture);
		Core.applyChanges();
	});

	QUnit.test("SemanticHelper whenReady", function (assert) {
		assert.expect(3);
		var fnDone = assert.async();

		var sId = "myFCL";

		// setup
		var oFCL = new FlexibleColumnLayout(sId);


		var oFlexibleColumnLayoutSemanticHelper = FlexibleColumnLayoutSemanticHelper.getInstanceFor(oFCL);

		oFlexibleColumnLayoutSemanticHelper.whenReady()
			.then(function () {
				assert.ok(oFlexibleColumnLayoutSemanticHelper.isReady(), 'The FlexibleColumnLayout instance is now ready');

				oFCL.destroy();

				oFlexibleColumnLayoutSemanticHelper.whenReady()
					.catch(function () {
						assert.notOk(oFlexibleColumnLayoutSemanticHelper.isReady(), 'The FlexibleColumnLayout was destroyed and is not ready any more');

						fnDone();
					});

			});

		assert.notOk(oFlexibleColumnLayoutSemanticHelper.isReady(), 'The FlexibleColumnLayout instance is not yet ready');

		// act
		oFCL.placeAt(sQUnitFixture);
		Core.applyChanges();
	});

	QUnit.module("Private API", {
		afterEach: function () {
			this.oFCL.destroy();
		}
	});

	QUnit.test("Width caching", function (assert) {
		// setup
		var iNewWidth = "600",
			iCurrentWidth;

		this.oFCL = new FlexibleColumnLayout();

		// assert
		assert.strictEqual(this.oFCL._getControlWidth(), 0, "Initial width before rendering is 0px");

		// act
		this.oFCL.placeAt(sQUnitFixture);
		Core.applyChanges();

		// assert
		iCurrentWidth = this.oFCL._getControlWidth();
		assert.ok(iCurrentWidth > 0, "Width is > 0px after rendering");

		// act
		this.oFCL._onResize({
			oldSize: {
				 width: iCurrentWidth
				},
			size: {
				width: iNewWidth
			}});

		// assert
		assert.strictEqual(this.oFCL._getControlWidth(), iNewWidth, "After resizing the new width is correct");
		assert.ok(iCurrentWidth !== iNewWidth, "The width has been changed");

		// clean-up
		this.oFCL.destroy();
	});

	QUnit.test("Measuring width when FCL is visible", function (assert) {
		// setup
		var oSpy,
			oStub;

		this.oFCL = new FlexibleColumnLayout();
		oSpy = this.spy(this.oFCL, "_measureControlWidth");
		oStub = this.stub(this.oFCL, "$", function() {
			return {
				is: function() { return true; },
				width: function() {
					// assert
					assert.ok(true, "width() is only called, when control is visible");
				}
			};
		});

		// act
		this.oFCL._getControlWidth();

		// assert
		assert.ok(oSpy.called, "When _iWidth is 0, width is measured from the DOM until the control gets visible");

		// clean-up
		oSpy.restore();
		oStub.restore();
		this.oFCL.destroy();
	});

	QUnit.test("_onNavContainerRendered", function (assert) {
		// setup
		this.oFCL = new FlexibleColumnLayout();
		var oEventSpy = this.spy(this.oFCL, "_hideShowArrows");

		// assert
		assert.equal(this.oFCL._hasAnyColumnPagesRendered(), false, "_isAnyColumnContentRendered is false before first invocation");

		// act
		this.oFCL._onNavContainerRendered({srcControl: this.oFCL.getAggregation("_beginColumnNav")});

		// assert
		assert.equal(this.oFCL._hasAnyColumnPagesRendered(), false, "_hasAnyColumnPagesRendered is false when container empty");
		assert.strictEqual(oEventSpy.callCount, 0, "_hideShowArrows is not called");

		// act
		this.oFCL.addBeginColumnPage(new sap.m.Page());
		this.oFCL._onNavContainerRendered({srcControl: this.oFCL.getAggregation("_beginColumnNav")});

		// assert
		assert.equal(this.oFCL._hasAnyColumnPagesRendered(), true, "_hasAnyColumnPagesRendered is true");
		assert.strictEqual(oEventSpy.callCount, 1, "_hideShowArrows is called");
	});

	QUnit.module("Column width calculations", {
		beforeEach: function () {
			this.oFCL = new FlexibleColumnLayout();
		},

		afterEach: function () {
			this.oFCL.destroy();
		}
	});

	(function () {
		var oFullscreenLayouts = ["OneColumn", "MidColumnFullScreen", "EndColumnFullScreen"],
			_oSplitScreenLayouts = Object.keys(library.LayoutType).filter(function(sLayout) {
				return oFullscreenLayouts.indexOf(sLayout) < 0;
		});
		Object.keys(_oSplitScreenLayouts).forEach(function(sLayoutName) {
			_testDifferentLayoutsWidth(_oSplitScreenLayouts[sLayoutName]);
		});
	})();

	function _testDifferentLayoutsWidth(sLayoutName) {
		QUnit.test("Layout: " + sLayoutName, function (assert) {
			// setup

			this.oFCL.setLayout(sLayoutName);

			this.oFCL.placeAt(sQUnitFixture);
			Core.applyChanges();

			// assert
			_widthComparisonAssertions(this.oFCL, assert);
		});
	}

	function _widthComparisonAssertions(oFCL, assert) {

		// setup
		var $beginColumn,
			$midColumn,
			$endColumn;

		$beginColumn = oFCL.$("beginColumn");
		$midColumn = oFCL.$("midColumn");
		$endColumn = oFCL.$("endColumn");

		assert.equal(parseInt($beginColumn[0].style.width), $beginColumn.width(), "Begin column width correct");
		assert.equal(parseInt($midColumn[0].style.width), $midColumn.width(), "Mid column width correct");
		assert.equal(parseInt($endColumn[0].style.width), $endColumn.width(), "End column width correct");
	}
});
