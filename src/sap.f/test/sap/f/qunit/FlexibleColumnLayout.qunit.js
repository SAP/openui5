(function ($, QUnit, sinon, FlexibleColumnLayout, Page, Button, NavContainer, LT, bDebugMode) {
	"use strict";
	var oCore = sap.ui.getCore(),
		sQUnitFixture = bDebugMode ? "qunit-fixture-visible" : "qunit-fixture",
		DESKTOP_SIZE = "1300px",
		TABLET_SIZE = "1200px",
		PHONE_SIZE = "900px",
		ANIMATION_WAIT_TIME = 500;

	var fnCreatePage = function (sId) {
		return new Page(sId, {
			title: "Page: " + sId,
			content: [
				new Button({text: "Button"})
			]
		});
	};

	var fnCreateFCL = function (oMetadata) {
		oMetadata = oMetadata || {};
		var oFCL = new FlexibleColumnLayout(oMetadata);
		oFCL.placeAt(sQUnitFixture);
		oCore.applyChanges();
		return oFCL;
	};

	var oFactory = {
		createPage: fnCreatePage,
		createFCL: fnCreateFCL
	};

	/**
	 * Utility function to easily verify the visibility of the 3 columns with less code
	 * @param assert - the assert object passed to the test case
	 * @param oFCL - the instance that is tested upon
	 * @param vBeginVisible - whether we expect the begin column to be visible or not
	 * @param vMidVisible - whether we expect the mid column to be visible or not
	 * @param vEndVisible - whether we expect the end column to be visible or not
	 */
	var assertColumnsVisibility = function(assert, oFCL, vBeginVisible, vMidVisible, vEndVisible) {
		var bBeginOK = (oFCL.$("beginColumn").width() > 0) === !!vBeginVisible,
			bMidOK = (oFCL.$("midColumn").width() > 0) === !!vMidVisible,
			bEndOK = (oFCL.$("endColumn").width() > 0) === !!vEndVisible;

		assert.ok(bBeginOK, "The begin column is " + (vBeginVisible ? "" : " not ") +  " visible");
		assert.ok(bMidOK, "The mid column is " + (vMidVisible ? "" : " not ") +  " visible");
		assert.ok(bEndOK, "The end column is " + (vEndVisible ? "" : " not ") +  " visible");
	};

	/**
	 * Utility function to easily verify arrows visibility
	 * @param assert - the assert object passed to the test case
	 * @param oFCL - the instance that is tested upon
	 * @param vBeginColumnBackArrowVisible - whether we expect the _beginColumnBackArrow to be visible or not
	 * @param vMidColumnBackArrowVisible - whether we expect the _midColumnBackArrow to be visible or not
	 * @param vMidColumnForwardArrowVisible - whether we expect the _midColumnForwardArrow to be visible or not
	 * @param vEndColumnForwardArrowVisible - whether we expect the _endColumnForwardArrow to be visible or not
	 */
	var assertArrowsVisibility = function(assert, oFCL, vBeginColumnBackArrowVisible, vMidColumnBackArrowVisible, vMidColumnForwardArrowVisible, vEndColumnForwardArrowVisible) {
		var bBBArrowOK = oFCL.getAggregation("_beginColumnBackArrow").$().is(":visible") === !!vBeginColumnBackArrowVisible,
			bMBArrowOK = oFCL.getAggregation("_midColumnBackArrow").$().is(":visible") === !!vMidColumnBackArrowVisible,
			bMFArrowOK = oFCL.getAggregation("_midColumnForwardArrow").$().is(":visible") === !!vMidColumnForwardArrowVisible,
			bEFArrowOK = oFCL.getAggregation("_endColumnForwardArrow").$().is(":visible") === !!vEndColumnForwardArrowVisible;

		assert.ok(bBBArrowOK, "The _beginColumnBackArrow is " + (vBeginColumnBackArrowVisible ? "" : " not ") +  " visible");
		assert.ok(bMBArrowOK, "The _midColumnBackArrow is " + (vMidColumnBackArrowVisible ? "" : " not ") +  " visible");
		assert.ok(bMFArrowOK, "The _midColumnForwardArrow is " + (vMidColumnForwardArrowVisible ? "" : " not ") +  " visible");
		assert.ok(bEFArrowOK, "The _endColumnForwardArrow is " + (vEndColumnForwardArrowVisible ? "" : " not ") +  " visible");

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
			layout: LT.TwoColumnsBeginExpanded
		});
		assertArrowsVisibility(assert, this.oFCL, 1, 0, 0, 0);
	});

	QUnit.test("Navigation arrows - 2 columns operations", function (assert) {
		this.oFCL = oFactory.createFCL({
			layout: LT.TwoColumnsBeginExpanded
		});

		this.getBeginColumnBackArrow().firePress();
		assertArrowsVisibility(assert, this.oFCL, 0, 0, 1, 0);

		this.getMidColumnForwardArrow().firePress();
		assertArrowsVisibility(assert, this.oFCL, 1, 0, 0, 0);
	});

	QUnit.test("Navigation arrows - 3 columns (mid column Expanded, not-fixed 3-column layout)", function (assert) {
		this.oFCL = oFactory.createFCL({
			layout: LT.ThreeColumnsMidExpanded
		});

		assertArrowsVisibility(assert, this.oFCL, 0, 1, 1, 0);
	});

	QUnit.test("Navigation arrows - 3 columns operation (not-fixed 3-column layout)", function (assert) {
		this.oFCL = oFactory.createFCL({
			layout: LT.ThreeColumnsMidExpanded
		});

		this.getMidColumnForwardArrow().firePress();
		assertArrowsVisibility(assert, this.oFCL, 0, 1, 1, 0);
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
	});

	QUnit.test("Resizing the control triggers a layout change", function (assert) {
		this.clock = sinon.useFakeTimers();

		this.oFCL = oFactory.createFCL({
			layout: LT.ThreeColumnsMidExpanded
		});

		$("#" + sQUnitFixture).width(TABLET_SIZE);
		this.clock.tick(ANIMATION_WAIT_TIME);
		assertColumnsVisibility(assert, this.oFCL, 0, 1, 1);

		$("#" + sQUnitFixture).width(PHONE_SIZE);
		this.clock.tick(ANIMATION_WAIT_TIME);
		assertColumnsVisibility(assert, this.oFCL, 0, 0, 1);

		$("#" + sQUnitFixture).width(TABLET_SIZE);
		this.clock.tick(ANIMATION_WAIT_TIME);
		assertColumnsVisibility(assert, this.oFCL, 0, 1, 1);

		$("#" + sQUnitFixture).width(DESKTOP_SIZE);
		this.clock.tick(ANIMATION_WAIT_TIME);
		assertColumnsVisibility(assert, this.oFCL, 1, 1, 1);

		this.clock.restore();
	});

	QUnit.test("stateChange event is fired on the first load", function (assert) {

		this.oFCL = new FlexibleColumnLayout();
		var oEventSpy = this.spy(this.oFCL, "fireStateChange");

		this.oFCL.placeAt(sQUnitFixture);
		oCore.applyChanges();

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
		oCore.applyChanges();

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

	QUnit.test("Mid column is loaded lazily", function (assert) {

		this.oFCL = oFactory.createFCL({
			defaultTransitionNameMidColumn: "fade"
		});

		assert.ok(!this.oFCL.getAggregation("_midColumnNav"), "Initially no Mid column NavContainer is created");

		var aPages = this.oFCL.getMidColumnPages();
		assert.ok(!this.oFCL.getAggregation("_midColumnNav"), "Calling getMidColumnPages does not force a NavContainer creation");
		assert.ok(aPages.constructor === Array && aPages.length === 0, "getMidColumnPages returns an empty array");

		var oEventSpy = this.spy(this.oFCL, "onAfterRendering");

		this.oFCL.addMidColumnPage(oFactory.createPage("mid"));
		oCore.applyChanges();
		assert.ok(this.oFCL.getAggregation("_midColumnNav") instanceof sap.m.NavContainer, "There is a NavContainer in the column");
		assert.ok(this.oFCL.getAggregation("_midColumnNav").$().length, "The NavContainer is rendered");
		assert.equal(this.oFCL.getAggregation("_midColumnNav").getDefaultTransitionName(), "fade", "The correct default transition name was applied");
		assert.ok(!oEventSpy.called, "The control was not rerendered");
	});

	QUnit.test("End column is loaded lazily", function (assert) {

		this.oFCL = oFactory.createFCL({
			defaultTransitionNameEndColumn: "fade"
		});

		assert.ok(!this.oFCL.getAggregation("_endColumnNav"), "Initially no End column NavContainer is created");

		var aPages = this.oFCL.getEndColumnPages();
		assert.ok(!this.oFCL.getAggregation("_endColumnNav"), "Calling getEndColumnPages does not force a NavContainer creation");
		assert.ok(aPages.constructor === Array && aPages.length === 0, "getEndColumnPages returns an empty array");

		var oEventSpy = this.spy(this.oFCL, "onAfterRendering");

		this.oFCL.addEndColumnPage(oFactory.createPage("end"));
		oCore.applyChanges();
		assert.ok(this.oFCL.getAggregation("_endColumnNav") instanceof sap.m.NavContainer, "There is a NavContainer in the column");
		assert.ok(this.oFCL.getAggregation("_endColumnNav").$().length, "The NavContainer is rendered");
		assert.equal(this.oFCL.getAggregation("_endColumnNav").getDefaultTransitionName(), "fade", "The correct default transition name was applied");
		assert.ok(!oEventSpy.called, "The control was not rerendered");
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
			layout: LT.TwoColumnsBeginExpanded
		});
		assertArrowsVisibility(assert, this.oFCL, 1, 0, 0, 0);
	});

	QUnit.test("Navigation arrows - 2 columns operations", function (assert) {
		this.oFCL = oFactory.createFCL({
			layout: LT.TwoColumnsBeginExpanded
		});

		this.getBeginColumnBackArrow().firePress();
		assertArrowsVisibility(assert, this.oFCL, 0, 0, 1, 0);

		this.getMidColumnForwardArrow().firePress();
		assertArrowsVisibility(assert, this.oFCL, 1, 0, 0, 0);
	});

	QUnit.test("Navigation arrows - 3 columns", function (assert) {
		this.oFCL = oFactory.createFCL({
			layout: LT.ThreeColumnsMidExpanded
		});

		assertArrowsVisibility(assert, this.oFCL, 0, 1, 1, 0);
	});

	QUnit.test("Navigation arrows - 3 columns operation", function (assert) {
		this.oFCL = oFactory.createFCL({
			layout: LT.ThreeColumnsMidExpanded
		});

		this.getMidColumnForwardArrow().firePress();
		assertArrowsVisibility(assert, this.oFCL, 0, 1, 1, 0);
		assertColumnsVisibility(assert, this.oFCL, 1, 1, 0); // End column is gone

		// Click it again
		this.getMidColumnForwardArrow().firePress();
		assertArrowsVisibility(assert, this.oFCL, 1, 0, 0, 0);

		this.getBeginColumnBackArrow().firePress();
		assertArrowsVisibility(assert, this.oFCL, 0, 1, 1, 0);

		this.getMidColumnBackArrow().firePress();
		assertArrowsVisibility(assert, this.oFCL, 0, 1, 1, 0);
		assertColumnsVisibility(assert, this.oFCL, 0, 1, 1); // End column is back
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


}(jQuery, QUnit, sinon, sap.f.FlexibleColumnLayout, sap.m.Page, sap.m.Button, sap.m.NavContainer, sap.f.LayoutType, false));