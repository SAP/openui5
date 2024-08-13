/*global QUnit, sinon*/
sap.ui.define([
	"sap/ui/core/ControlBehavior",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/thirdparty/jquery",
	'sap/ui/qunit/QUnitUtils',
	"sap/f/FlexibleColumnLayout",
	"sap/f/FlexibleColumnLayoutAccessibleLandmarkInfo",
	"sap/f/FlexibleColumnLayoutSemanticHelper",
	"sap/f/FlexibleColumnLayoutData",
	"sap/f/FlexibleColumnLayoutDataForTablet",
	"sap/m/Page",
	"sap/m/Button",
	"sap/ui/core/ResizeHandler",
	'sap/ui/events/KeyCodes',
	"sap/f/library"
],
function(
	ControlBehavior,
	nextUIUpdate,
	$,
	QUnitUtils,
	FlexibleColumnLayout,
	FlexibleColumnLayoutAccessibleLandmarkInfo,
	FlexibleColumnLayoutSemanticHelper,
	FlexibleColumnLayoutData,
	FlexibleColumnLayoutDataForTablet,
	Page,
	Button,
	ResizeHandler,
	KeyCodes,
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
		VISIBLE_COLUMNS = {
			EndColumnFullScreen: 1,
			MidColumnFullScreen: 1,
			OneColumn: 1,
			ThreeColumnsBeginExpandedEndHidden: 2,
			ThreeColumnsEndExpanded: 3,
			ThreeColumnsMidExpanded: 3,
			ThreeColumnsMidExpandedEndHidden: 2,
			TwoColumnsBeginExpanded: 2,
			TwoColumnsMidExpanded: 2
		};

	var fnCreatePage = function (sId, oContent) {
		return new Page(sId, {
			title: "Page: " + sId,
			content: oContent || [
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
		nextUIUpdate.runSync()/*fake timer is used in module*/;
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
		var bBeginOK =
		(!oFCL.$("beginColumn").hasClass("sapFFCLColumnHidden")) ===
		!!iBeginVisible,
	  bMidOK =
		(!oFCL.$("midColumn").hasClass("sapFFCLColumnHidden")) ===
		!!iMidVisible,
	  bEndOK =
		(!oFCL.$("endColumn").hasClass("sapFFCLColumnHidden") === !!iEndVisible);

		assert.ok(bBeginOK, "The begin column is " + (iBeginVisible ? "" : " not ") +  " visible");
		assert.ok(bMidOK, "The mid column is " + (iMidVisible ? "" : " not ") +  " visible");
		assert.ok(bEndOK, "The end column is " + (iEndVisible ? "" : " not ") +  " visible");
	};

	/**
	 * Utility function to easily verify arrows visibility
	 * @param {object} assert - the assert object passed to the test case
	 * @param {object} oFCL - the instance that is tested upon
	 * @param {int} iBeginColumnSeparatorVisible - whether we expect the begin-separator to be visible
	 * @param {int} iMidColumnSeparatorVisible - whether we expect the end-separator to be visible
	 */
	var assertSeparatorVisibility = function(assert, oFCL, iBeginColumnSeparatorVisible, iMidColumnSeparatorVisible) {
		var bBeginSeparatorOK = oFCL.$("separator-begin").is(":visible") === !!iBeginColumnSeparatorVisible,
			bMidSeparatorOK = oFCL.$("separator-end").is(":visible") === !!iMidColumnSeparatorVisible;

		assert.ok(bBeginSeparatorOK, "The begin separator is " + (iBeginColumnSeparatorVisible ? "" : " not ") +  " visible");
		assert.ok(bMidSeparatorOK, "The end separator is " + (iMidColumnSeparatorVisible ? "" : " not ") +  " visible");
	};

	function dragSeparator(sSeparatorName, iPx, oFCL) {

		var oSeparator = oFCL._oColumnSeparators[sSeparatorName][0],
			iStartX = oSeparator.getBoundingClientRect().x,
			iEndX = iStartX + iPx;

		oFCL._onColumnSeparatorMoveStart({pageX: iStartX}, oSeparator);
		oFCL._onColumnSeparatorMove({pageX: iEndX});
		oFCL._onColumnSeparatorMoveEnd({pageX: iEndX});
	}

	QUnit.module("DESKTOP - API", {
		beforeEach: function () {
			this.sOldAnimationSetting = $("html").attr("data-sap-ui-animation");
			this.sOldAnimationMode = ControlBehavior.getAnimationMode();
			$("html").attr("data-sap-ui-animation", "off");
			$("#" + sQUnitFixture).width(DESKTOP_SIZE); // > 1280px
			ControlBehavior.setAnimationMode("none");

			this.getBeginColumnBackArrow = function () { return this.oFCL.getAggregation("_beginColumnBackArrow"); };
			this.getMidColumnBackArrow = function () { return this.oFCL.getAggregation("_midColumnBackArrow"); };
			this.getMidColumnForwardArrow = function () { return this.oFCL.getAggregation("_midColumnForwardArrow"); };
			this.getEndColumnForwardArrow = function () { return this.oFCL.getAggregation("_endColumnForwardArrow"); };
		},
		afterEach: function () {
			$("html").attr("data-sap-ui-animation", this.sOldAnimationSetting);
			$("#" + sQUnitFixture).width("");
			ControlBehavior.setAnimationMode(this.sOldAnimationMode);
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

		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Assert backgroundDesign
		assert.ok(this.oFCL.$().hasClass("sapFFCLBackgroundDesignSolid"), "Solid background is set in the  DOM");
		assert.ok(!this.oFCL.$().hasClass("sapFFCLBackgroundDesignTranslucent"), "Translucent background is Not set in the  DOM");

		// Act: change backgroundDesign to Translucent
		this.oFCL.setBackgroundDesign("Translucent");

		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Assert backgroundDesign
		assert.ok(this.oFCL.$().hasClass("sapFFCLBackgroundDesignTranslucent"), "Translucent background is set in the  DOM");
		assert.ok(!this.oFCL.$().hasClass("sapFFCLBackgroundDesignSolid"), "Solid background is Not set in the  DOM");
	});

	QUnit.test("Layout: OneColumn", function (assert) {

		this.oFCL = oFactory.createFCL({
			layout: LT.OneColumn
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

	QUnit.test("Separators - 1 column", function (assert) {
		this.oFCL = oFactory.createFCL();
		assertSeparatorVisibility(assert, this.oFCL, 0, 0);
	});

	QUnit.test("Separators - 2 columns", function (assert) {
		this.oFCL = oFactory.createFCL({
			layout: LT.TwoColumnsBeginExpanded,
			beginColumnPages: [new Page()]
		});
		this.oFCL._onNavContainerRendered({srcControl: this.oFCL.getAggregation("_beginColumnNav")});

		assertSeparatorVisibility(assert, this.oFCL, 1, 0);
	});

	QUnit.test("Separators - 2 columns operations", function (assert) {
		this.oFCL = oFactory.createFCL({
			layout: LT.TwoColumnsBeginExpanded,
			beginColumnPages: [new Page()]
		});
		this.oFCL._onNavContainerRendered({srcControl: this.oFCL.getAggregation("_beginColumnNav")});

		dragSeparator("begin", -700, this.oFCL);
		assertSeparatorVisibility(assert, this.oFCL, 1, 0);
		assert.equal(this.oFCL.getLayout(), LT.TwoColumnsMidExpanded);

		dragSeparator("begin", 700, this.oFCL);
		assertSeparatorVisibility(assert, this.oFCL, 1, 0);
		assert.equal(this.oFCL.getLayout(), LT.TwoColumnsBeginExpanded);
	});

	QUnit.test("Separators - 3 columns (mid column Expanded, not-fixed 3-column layout)", function (assert) {
		this.oFCL = oFactory.createFCL({
			layout: LT.ThreeColumnsMidExpanded,
			beginColumnPages: [new Page()]
		});
		this.oFCL._onNavContainerRendered({srcControl: this.oFCL.getAggregation("_beginColumnNav")});

		assertSeparatorVisibility(assert, this.oFCL, 1, 1);
	});

	QUnit.test("Separators - 3 columns operation (not-fixed 3-column layout)", function (assert) {
		this.clock = sinon.useFakeTimers();

		this.oFCL = oFactory.createFCL({
			layout: LT.ThreeColumnsMidExpanded,
			beginColumnPages: [new Page()]
		});
		this.oFCL._onNavContainerRendered({srcControl: this.oFCL.getAggregation("_beginColumnNav")});

		dragSeparator("begin", 200, this.oFCL);
		assertSeparatorVisibility(assert, this.oFCL, 1, 1);
		assertColumnsVisibility(assert, this.oFCL, 1, 1, 0); // End column is gone
		assert.equal(this.oFCL.getLayout(), LT.ThreeColumnsMidExpandedEndHidden);

		// drag the same separator further
		dragSeparator("begin", 700, this.oFCL);
		assertSeparatorVisibility(assert, this.oFCL, 1, 0);
		assert.equal(this.oFCL.getLayout(), LT.ThreeColumnsBeginExpandedEndHidden);

		dragSeparator("begin", -400, this.oFCL);
		assertSeparatorVisibility(assert, this.oFCL, 1, 1);
		assert.equal(this.oFCL.getLayout(), LT.ThreeColumnsMidExpandedEndHidden);

		dragSeparator("end", -200, this.oFCL);
		assertSeparatorVisibility(assert, this.oFCL, 1, 1);
		assertColumnsVisibility(assert, this.oFCL, 1, 1, 1); // End column is back
		assert.equal(this.oFCL.getLayout(), LT.ThreeColumnsMidExpanded);

		dragSeparator("end", -400, this.oFCL);
		assertSeparatorVisibility(assert, this.oFCL, 0, 1);
		assert.equal(this.oFCL.getLayout(), LT.ThreeColumnsEndExpanded);

		dragSeparator("end", 200, this.oFCL);
		assertSeparatorVisibility(assert, this.oFCL, 1, 1);
		assert.equal(this.oFCL.getLayout(), LT.ThreeColumnsMidExpanded);
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
		nextUIUpdate.runSync()/*fake timer is used in module*/;

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
		nextUIUpdate.runSync()/*fake timer is used in module*/;

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

	QUnit.test("stateChange event is fired upon drag to a new layout", function (assert) {
		this.oFCL = oFactory.createFCL({
			layout: LT.ThreeColumnsMidExpanded
		});
		var oEventSpy = this.spy(this.oFCL, "fireStateChange");

		dragSeparator("begin", 100, this.oFCL);
		assert.ok(oEventSpy.called, "Layout change event fired");
	});

	QUnit.test("_liveStateChange event is fired upon drag to a new layout", function (assert) {
		var sInitLayout = LT.ThreeColumnsMidExpanded;
		this.oFCL = oFactory.createFCL({
			layout: sInitLayout
		});
		var oEventSpy = this.spy(this.oFCL, "fireEvent");

		var oSeparator = this.oFCL._oColumnSeparators["begin"][0],
			iStartX = oSeparator.getBoundingClientRect().x,
			// end position corresponds to a new layout
			iEndX = iStartX + 100;

		// simulate user draggs the begin separator
		// to a position that involves layout change
		this.oFCL._onColumnSeparatorMoveStart({pageX: iStartX}, oSeparator);
		this.oFCL._onColumnSeparatorMove({pageX: iEndX});

		// assert event fires BEFORE the user stops dragging
		assert.ok(oEventSpy.calledWithMatch("_liveStateChange"), "Live layout change event fired while user is still dragging");

		// simulate user stops dragging
		this.oFCL._onColumnSeparatorMoveEnd({pageX: iEndX});
		assert.notEqual(this.oFCL.getLayout(), sInitLayout, "Layout has changed");
		assert.ok(oEventSpy.calledWithMatch("stateChange"), "Layout change event fired");
	});

	QUnit.test("_liveStateChange event is not fired upon drag within the same layout", function (assert) {
		var sInitLayout = LT.ThreeColumnsMidExpanded;
		this.oFCL = oFactory.createFCL({
			layout: sInitLayout
		});
		var oEventSpy = this.spy(this.oFCL, "fireEvent");

		var oSeparator = this.oFCL._oColumnSeparators["begin"][0],
			iStartX = oSeparator.getBoundingClientRect().x,
			// end position corresponds to the same layout
			iEndX = iStartX + 2;

		// simulate user draggs the begin separator
		// to a position that does NOT involve layout change
		this.oFCL._onColumnSeparatorMoveStart({pageX: iStartX}, oSeparator);
		this.oFCL._onColumnSeparatorMove({pageX: iEndX});

		// check state BEFORE the user stops dragging
		assert.notOk(oEventSpy.called, "Live layout change event is not fired");

		// simulate user stops dragging
		this.oFCL._onColumnSeparatorMoveEnd({pageX: iEndX});
		assert.equal(this.oFCL.getLayout(), sInitLayout, "Layout has not changed");
		assert.notOk(oEventSpy.calledWithMatch("stateChange"), "Layout change event is not fired");
	});

	QUnit.test("columnsDistributionChange event is fired upon dragging to change the width of a column", function (assert) {
		this.oFCL = oFactory.createFCL({
			layout: LT.TwoColumnsBeginExpanded,
			beginColumnPages: [new Page()]
		});
		var oEventSpy = this.spy(this.oFCL, "fireEvent"),
			fnDone = assert.async(),
			oColumnPercentWidths,
			sNewWidthsDistribution,
			iBeginColumnWidth,
			iMidColumnWidth;


		dragSeparator("begin", -150, this.oFCL);
		this.oFCL._attachAfterAllColumnsResizedOnce(function() {
			iBeginColumnWidth = this.oFCL.$("beginColumn").width();
			iMidColumnWidth = this.oFCL.$("midColumn").width();

			oColumnPercentWidths = this.oFCL._convertColumnPxWidthToPercent({ begin: iBeginColumnWidth, mid: iMidColumnWidth, end: 0 }, LT.TwoColumnsBeginExpanded);
			sNewWidthsDistribution = Object.values(oColumnPercentWidths).join("/");

			// assert
			assert.ok(oEventSpy.calledWithMatch("columnsDistributionChange", { media: "desktop", layout: LT.TwoColumnsBeginExpanded, columnsSizes: sNewWidthsDistribution }),
				"columnsDistributionChange event is fired with correct parameters uppon dragging to change the width of a column");

			fnDone();
		}.bind(this), 500);
	});

	QUnit.module("TABLET - API", {
		beforeEach: function () {
			this.sOldAnimationSetting = $("html").attr("data-sap-ui-animation");
			this.sOldAnimationMode = ControlBehavior.getAnimationMode();
			$("html").attr("data-sap-ui-animation", "off");
			$("#" + sQUnitFixture).width(TABLET_SIZE); // Between 960 and 1280
			ControlBehavior.setAnimationMode("none");
		},
		afterEach: function () {
			$("html").attr("data-sap-ui-animation", this.sOldAnimationSetting);
			$("#" + sQUnitFixture).width("");
			ControlBehavior.setAnimationMode(this.sOldAnimationMode);
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
			beginColumnPages: [new Page()]
		});
		this.oFCL._onNavContainerRendered({srcControl: this.oFCL.getAggregation("_beginColumnNav")});

		assertSeparatorVisibility(assert, this.oFCL, 1, 0);
	});

	QUnit.test("Column separators - 2 columns operations", function (assert) {
		this.oFCL = oFactory.createFCL({
			layout: LT.TwoColumnsBeginExpanded,
			beginColumnPages: [new Page()]
		});
		this.oFCL._onNavContainerRendered({srcControl: this.oFCL.getAggregation("_beginColumnNav")});

		dragSeparator("begin", -700, this.oFCL);
		assertSeparatorVisibility(assert, this.oFCL, 1, 0);
		assert.equal(this.oFCL.getLayout(), LT.TwoColumnsMidExpanded);

		dragSeparator("begin", 700, this.oFCL);
		assertSeparatorVisibility(assert, this.oFCL, 1, 0);
		assert.equal(this.oFCL.getLayout(), LT.TwoColumnsBeginExpanded);
	});

	QUnit.test("Navigation arrows - 3 columns", function (assert) {
		this.oFCL = oFactory.createFCL({
			layout: LT.ThreeColumnsMidExpanded,
			beginColumnPages: [new Page()]
		});
		this.oFCL._onNavContainerRendered({srcControl: this.oFCL.getAggregation("_beginColumnNav")});

		assertSeparatorVisibility(assert, this.oFCL, 1, 1);
	});

	QUnit.test("Navigation arrows - 3 columns operation", function (assert) {
		this.clock = sinon.useFakeTimers();

		this.oFCL = oFactory.createFCL({
			layout: LT.ThreeColumnsMidExpanded,
			beginColumnPages: [new Page()]
		});
		this.oFCL._onNavContainerRendered({srcControl: this.oFCL.getAggregation("_beginColumnNav")});

		dragSeparator("begin", 100, this.oFCL);
		assertSeparatorVisibility(assert, this.oFCL, 1, 1);
		assertColumnsVisibility(assert, this.oFCL, 1, 1, 0); // End column is gone
		assert.equal(this.oFCL.getLayout(), LT.ThreeColumnsMidExpandedEndHidden);

		// drag it again
		dragSeparator("begin", 300, this.oFCL);
		assertSeparatorVisibility(assert, this.oFCL, 1, 0);
		assert.equal(this.oFCL.getLayout(), LT.ThreeColumnsBeginExpandedEndHidden);

		dragSeparator("begin", -300, this.oFCL);
		assertSeparatorVisibility(assert, this.oFCL, 1, 1);
		assert.equal(this.oFCL.getLayout(), LT.ThreeColumnsMidExpandedEndHidden);

		dragSeparator("end", -100, this.oFCL);
		assertSeparatorVisibility(assert, this.oFCL, 1, 1);
		assertColumnsVisibility(assert, this.oFCL, 0, 1, 1); // End column is back
		assert.equal(this.oFCL.getLayout(), LT.ThreeColumnsMidExpanded);

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
			$("#" + sQUnitFixture).width("");
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
		assertSeparatorVisibility(assert, this.oFCL, 0, 0, 0, 0);
	});

	QUnit.test("Navigation arrows - 2 columns", function (assert) {
		this.oFCL = oFactory.createFCL({
			layout: LT.TwoColumnsBeginExpanded
		});
		assertSeparatorVisibility(assert, this.oFCL, 0, 0, 0, 0);
	});

	QUnit.test("Navigation arrows - 3 columns", function (assert) {
		this.oFCL = oFactory.createFCL({
			layout: LT.ThreeColumnsMidExpanded
		});

		assertSeparatorVisibility(assert, this.oFCL, 0, 0, 0, 0);
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

	QUnit.test("ResizeHandler's suspend method is called for pinned columns", function (assert) {
		// Arrange
		var oSpySuspendHandler = this.spy(ResizeHandler, "suspend");

		this.stub(this.oFCL, "_shouldRevealColumn").returns(true); // mock pinnable column

		// Act
		this.oFCL._resizeColumns();

		// Assert
		assert.ok(oSpySuspendHandler.called, "suspend resizeHandler for pinned column too (all columns have ResizeHandlers suspended, when animations are on");
	});

	QUnit.test("Suspending and resuming ResizeHandler upon column layout change", function (assert) {
		// assert
		assert.expect(2);

		// arrange
		var fnDone = assert.async(),
			oBeginColumn = this.oFCL._$columns["begin"],
			oBeginColumnDomRef = oBeginColumn.get(0),
			oSuspendSpy = this.spy(ResizeHandler, "suspend"),
			oResumeSpy = this.spy(ResizeHandler, "resume");

		// act
		this.oFCL.setLayout(LT.TwoColumnsMidExpanded);

		// assert
		assert.ok(oSuspendSpy.calledWith(oBeginColumnDomRef), "ResizeHandler suspended for column");
		this.oFCL._attachAfterAllColumnsResizedOnce(function() {
			setTimeout(function() { // wait for FCL promise to complete
				assert.ok(oResumeSpy.calledWith(oBeginColumnDomRef), "ResizeHandler resumed for column");
				fnDone();
			}, 0);
		});
	});

	QUnit.test("_getPreviousLayout", function (assert) {
		var sLayoutBeforeUpdate = this.oFCL.getLayout();
		this.oFCL.setLayout(LT.TwoColumnsMidExpanded);
		assert.strictEqual(this.oFCL._getPreviousLayout(), sLayoutBeforeUpdate, "previous layout is correct");
	});

	QUnit.test("_getMaxColumnsCountForLayout", function (assert) {
		assert.strictEqual(this.oFCL._getMaxColumnsCountForLayout(LT.TwoColumnsBeginExpanded, FlexibleColumnLayout.DESKTOP_BREAKPOINT),
			2, "The default TwoColumnsBeginExpanded layout has 2 columns");
		assert.strictEqual(this.oFCL._getMaxColumnsCountForLayout(LT.ThreeColumnsMidExpanded, FlexibleColumnLayout.DESKTOP_BREAKPOINT),
			3, "ThreeColumnsMidExpanded layout has 3 columns");
		assert.strictEqual(this.oFCL._getMaxColumnsCountForLayout(LT.EndColumnFullScreen, FlexibleColumnLayout.DESKTOP_BREAKPOINT),
			1, "EndColumnFullScreen has only 1 visible column");
	});

	QUnit.test("_getLastVisibleColumnForLayout", function (assert) {
		assert.strictEqual(this.oFCL._getLastVisibleColumnForLayout(LT.TwoColumnsBeginExpanded),
			"mid", "The TwoColumnsBeginExpanded layout has the 'mid' column as the last visible column");
		assert.strictEqual(this.oFCL._getLastVisibleColumnForLayout(LT.ThreeColumnsMidExpanded),
			"end", "The ThreeColumnsMidExpanded layout has the 'mid' column as the last visible column");
		assert.strictEqual(this.oFCL._getLastVisibleColumnForLayout(LT.EndColumnFullScreen),
			"end", "The EndColumnFullScreen layout has the 'mid' column as the last visible column");
	});

	QUnit.test("_shouldRevealColumn", function (assert) {
		// Simulate last column and switch to a layout with more columns
		assert.strictEqual(this.oFCL._shouldRevealColumn("end", LT.ThreeColumnsMidExpanded, LT.TwoColumnsBeginExpanded),
			true, "Third column should be pinned if any ThreeColumn layout is opened");
		assert.strictEqual(this.oFCL._shouldRevealColumn("end", LT.ThreeColumnsMidExpanded, LT.TwoColumnsMidExpanded),
			true, "Third column should be pinned if any ThreeColumn layout is opened");

		// New layout has more columns, but we are not testing the last column
		assert.strictEqual(this.oFCL._shouldRevealColumn("begin", LT.ThreeColumnsMidExpanded, LT.TwoColumnsBeginExpanded),
			false, "First or second columns shouldn't be pinned for ThreeColumn layouts");
		assert.strictEqual(this.oFCL._shouldRevealColumn("mid", LT.ThreeColumnsMidExpanded, LT.TwoColumnsBeginExpanded),
			false, "First or second columns shouldn't be pinned for ThreeColumn layouts");

		// New layout has less columns than the current one
		assert.strictEqual(this.oFCL._shouldRevealColumn("end", LT.TwoColumnsMidExpanded, LT.ThreeColumnsMidExpanded),
			false, "No revealing should be done when the new layout has fewer columns");

		// Returning from a fullscreen layout
		assert.strictEqual(this.oFCL._shouldRevealColumn("mid", LT.TwoColumnsBeginExpanded, LT.MidColumnFullScreen),
			false, "No pinning should be done when closing a fullscreen layout");

		// Returning from a fullscreen layout
		assert.strictEqual(this.oFCL._shouldRevealColumn("mid", LT.TwoColumnsMidExpanded, LT.OneColumn),
			true, "Second column should be pinned when going from OneColumn to TwoColumnsMidExpanded");

		// Going from fullscreen to another fullscreen
		assert.strictEqual(this.oFCL._shouldRevealColumn("mid", LT.MidColumnFullScreen, LT.OneColumn),
		true, "Second column should be pinned when going from OneColumn fullscreen to TwoColumn fullscreen");

		// Going back from fullscreen to another fullscreen
		assert.strictEqual(this.oFCL._shouldRevealColumn("begin", LT.OneColumn, LT.MidColumnFullScreen),
		true, "First column should be pinned when going from TwoColumn fullscreen to OneColumn fullscreen");

		// Going from fullscreen to another fullscreen
		assert.strictEqual(this.oFCL._shouldRevealColumn("end", LT.EndColumnFullScreen, LT.MidColumnFullScreen),
		true, "Third column should be pinned when going from TwoColumn fullscreen to ThreeColumn fullscreen");

		// Going back from fullscreen to another fullscreen
		assert.strictEqual(this.oFCL._shouldRevealColumn("mid", LT.MidColumnFullScreen, LT.EndColumnFullScreen),
		true, "Second column should be pinned when going from ThreeColumn fullscreen to TwoColumn fullscreen");
	});

	QUnit.test("_shouldConcealColumn", function (assert) {
		assert.strictEqual(this.oFCL._shouldConcealColumn("end", LT.TwoColumnsMidExpanded, LT.ThreeColumnsMidExpanded),
			true, "Third column should be pinned if any TwoColumn layout is opened");
		assert.strictEqual(this.oFCL._shouldConcealColumn("end", LT.TwoColumnsBeginExpanded, LT.ThreeColumnsMidExpanded),
			true, "Third column should be pinned if any TwoColumn layout is opened");

		// New layout has more columns, but we are not testing the last column
		assert.strictEqual(this.oFCL._shouldConcealColumn("begin", LT.TwoColumnsMidExpanded, LT.ThreeColumnsMidExpanded),
			false, "First or second columns shouldn't be pinned for ThreeColumn layouts");
		assert.strictEqual(this.oFCL._shouldConcealColumn("mid", LT.TwoColumnsMidExpanded, LT.ThreeColumnsMidExpanded),
			false, "First or second columns shouldn't be pinned for ThreeColumn layouts");

		// New layout has more columns than the current one
		assert.strictEqual(this.oFCL._shouldConcealColumn("end", LT.ThreeColumnsMidExpanded, LT.TwoColumnsMidExpanded),
			false, "No concealing should be done when the new layout has more columns");

		// Returning from a fullscreen layout
		assert.strictEqual(this.oFCL._shouldConcealColumn("mid", LT.OneColumn, LT.TwoColumnsMidExpanded),
			true, "Second column should be pinned when going from TwoColumnsMidExpanded to OneColumn");

		// Returning from a fullscreen layout
		assert.strictEqual(this.oFCL._shouldConcealColumn("mid", LT.TwoColumnsBeginExpanded, LT.MidColumnFullScreen),
			false, "No pinning should be done when closing a fullscreen layout");

		// Going from fullscreen to another fullscreen
		assert.strictEqual(this.oFCL._shouldConcealColumn("begin", LT.MidColumnFullScreen, LT.OneColumn),
		true, "First column should be pinned when going from OneColumn fullscreen to TwoColumn fullscreen");

		// Going back from fullscreen to another fullscreen
		assert.strictEqual(this.oFCL._shouldConcealColumn("mid", LT.OneColumn, LT.MidColumnFullScreen),
		true, "Second column should be pinned when going back from TwpColumn fullscreen to OneColumn fullscreen");

		// Going from fullscreen to another fullscreen
		assert.strictEqual(this.oFCL._shouldConcealColumn("mid", LT.EndColumnFullScreen, LT.MidColumnFullScreen),
		true, "Second column should be pinned when going from TwoColumn fullscreen to ThreeColumn fullscreen");


		// Going back from fullscreen to another fullscreen
		assert.strictEqual(this.oFCL._shouldConcealColumn("end", LT.MidColumnFullScreen, LT.EndColumnFullScreen),
		true, "Third column should be pinned when going back from ThreeColumn fullscreen to TwoColumn fullscreen");
	});

	QUnit.test("Conceal effect layout changes", function(assert) {
		//arrange
		var $endColumn = this.oFCL._$columns["end"],
		fnDone = assert.async();

		this.stub(this.oFCL, "_getControlWidth").returns(parseInt(DESKTOP_SIZE));
		//assert.expect(8);

		this.oFCL.setLayout(LT.ThreeColumnsMidExpanded);

		//the animation hasn't been executed so the three columns are visible
		assertColumnsVisibility(assert, this.oFCL, 1, 1, 1);
		assert.ok($endColumn.hasClass("sapFFCLPinnedColumn"),
			"End column should have the 'sapFFCLPinnedColumn' class applied.");

		this.oFCL.setLayout(LT.TwoColumnsMidExpanded);

		this.oFCL._oAnimationEndListener.waitForAllColumnsResizeEnd().then(function() {
			setTimeout(function() { // wait for all app callbacks for same event to be called
				//assert
				assertColumnsVisibility(assert, this.oFCL, 1, 1, 0); // End column is gone
				assert.notOk($endColumn.hasClass("sapFFCLPinnedColumn"),
					"End column should not have the 'sapFFCLPinnedColumn' class applied.");

				fnDone();
			}.bind(this), 1000);
		}.bind(this));
	});

	//BCP: 1970178100
	QUnit.test(
		"Conceal effect layout changes - simulate navigation from detailDetail to about page with two initial columns setup",
		function(assert) {

		// arrange
		var fnDone = assert.async();

		this.oFCL = oFactory.createFCL({
			layout: LT.TwoColumnsBeginExpanded
		});

		// act
		this.oFCL.setLayout(LT.EndColumnFullScreen);

		this.oFCL._oAnimationEndListener.waitForAllColumnsResizeEnd().then(function() {
			// assert
			assertColumnsVisibility(assert, this.oFCL, 0, 0, 1);
			fnDone();
		}.bind(this));
	});

	//BCP: 1980006195
	QUnit.test("Columns with width 0 should have the sapFFCLColumnHidden class applied", function(assert){
		// arrange
		var fnDone = assert.async();

		this.oFCL = oFactory.createFCL({
			layout: LT.MidColumnFullScreen
		});


		this.oFCL._oAnimationEndListener.waitForAllColumnsResizeEnd().then(function() {
			// assert
			assertColumnsVisibility(assert, this.oFCL, 0, 1, 0);
			assert.ok(this.oFCL._$columns["begin"].hasClass('sapFFCLColumnHidden'));
			assert.notOk(this.oFCL._$columns["mid"].hasClass('sapFFCLColumnHidden'));
			assert.ok(this.oFCL._$columns["end"].hasClass('sapFFCLColumnHidden'));

			// act
			this.oFCL._afterColumnResize("end", 100);

			// assert
			assert.notOk(this.oFCL._$columns["end"].hasClass('sapFFCLColumnHidden'),
				"When width is updated, 'sapFFCLColumnHidden' class should be removed");

			fnDone();
		}.bind(this));
	});

	QUnit.test("FCL does not have animations with animationMode=minimal", function(assert){
		// arrange
		var oSpy = this.spy(this.oFCL._oAnimationEndListener, "waitForColumnResizeEnd"),
			sOriginalAnimationMode = ControlBehavior.getAnimationMode();

		ControlBehavior.setAnimationMode("minimal");
		assert.expect(1);

		// act
		this.oFCL.setLayout(LT.ThreeColumnsMidExpanded);

		// assert
		assert.ok(oSpy.notCalled, "waitForColumnResize is not called when animationMode=minimal");

		// clean-up
		ControlBehavior.setAnimationMode(sOriginalAnimationMode);
	});

	QUnit.test("Contextual settings are always updated during live column resize", function (assert) {
		var sLayoutBeforeDrag = this.oFCL.getLayout(),
			oSpyUpdateContextualSettings = this.spy(this.oFCL, "_updateColumnContextualSettings"),
			oSeparator = this.oFCL._oColumnSeparators.begin[0],
			iStartX = oSeparator.getBoundingClientRect().x,
			iEndX = iStartX + 1; // resize 1px only to remain within the same layout

		// Act: mock life-resize by 1px within the same layout
		this.oFCL._onColumnSeparatorMoveStart({pageX: iStartX}, oSeparator);
		this.oFCL._onColumnSeparatorMove({pageX: iEndX});

		// Assert
		assert.strictEqual(this.oFCL.getLayout(), sLayoutBeforeDrag, "layout is unchanged");
		assert.strictEqual(oSpyUpdateContextualSettings.callCount, 2, "contextual settings are updated for visible columns");
	});

	QUnit.test("Contextual settings are updated after column resize without layout update", function (assert) {
		var sLayoutBeforeDrag = this.oFCL.getLayout(),
			oSpyUpdateContextualSettings = this.spy(this.oFCL, "_updateColumnContextualSettings");

		// Act: resize to a width that does not lead to change of <code>layoutType</code>
		dragSeparator("begin", 10, this.oFCL);

		// Assert
		assert.strictEqual(this.oFCL.getLayout(), sLayoutBeforeDrag, "layout is unchanged");
		assert.strictEqual(oSpyUpdateContextualSettings.callCount, 4, "contextual settings are updated for visible columns");
	});

	QUnit.test("Contextual settings are updated after column resize with layout update", function (assert) {
		var sLayoutBeforeDrag = this.oFCL.getLayout(),
			oSpyUpdateContextualSettings = this.spy(this.oFCL, "_updateColumnContextualSettings"),
			fnDone = assert.async();

		// Act: resize to a width that leads to change of <code>layoutType</code>
		dragSeparator("begin", -700, this.oFCL);

		// Assert
		assert.notEqual(this.oFCL.getLayout(), sLayoutBeforeDrag, "layout is not changed");
		this.oFCL._attachAfterAllColumnsResizedOnce(function() {
			setTimeout(function() { // wait for FCL promise to complete
				assert.strictEqual(oSpyUpdateContextualSettings.callCount, 4, "contextual settings are updated for visible columns");
				fnDone();
			}, 0);
		});
	});

	QUnit.test("User setting for Begin column width is passed through layouts", function (assert) {
		var iPreviousFixtureWidth = $("#" + sQUnitFixture).width(),
			fnDone = assert.async(),
			iPercentBeginColumnUserWidth;

		assert.expect(1);

		$("#" + sQUnitFixture).width(DESKTOP_SIZE);

		setTimeout(function () {
			// Assert
			dragSeparator("begin", -500, this.oFCL);
			this.oFCL._attachAfterAllColumnsResizedOnce(function() {
				iPercentBeginColumnUserWidth = this.oFCL._getColumnWidthDistributionForLayout("TwoColumnsMidExpanded", true, 3)[0];

				// Act
				this.oFCL.setLayout("ThreeColumnsMidExpanded");

				this.oFCL._attachAfterAllColumnsResizedOnce(function () {
					assert.strictEqual(iPercentBeginColumnUserWidth, this.oFCL._getColumnWidthDistributionForLayout("ThreeColumnsMidExpanded", true, 3)[0],
						"User setting for Begin column width is saved, when switching layouts");

					// Clean up
					$("#" + sQUnitFixture).width(iPreviousFixtureWidth);
					fnDone();
				}.bind(this));
			}.bind(this));
		}.bind(this), 500);
	});

	QUnit.test("Synchronous switching TwoColumnsMidExpanded/ThreeColumnsMidExpanded",
		function(assert) {

		// arrange
		var fnDone = assert.async();

		this.oFCL = oFactory.createFCL({
			layout: LT.OneColumn
		});

		// act
		this.oFCL.setLayout(LT.TwoColumnsMidExpanded);
		this.oFCL.setLayout(LT.ThreeColumnsMidExpanded);

		this.oFCL._oAnimationEndListener.waitForAllColumnsResizeEnd().then(function() {
			// assert
			assert.strictEqual(this.oFCL._$columns["mid"][0].querySelector(".sapFFCLColumnContent").style.width, "", "mid column has auto size");
			this.oFCL.destroy();
			fnDone();
		}.bind(this));
	});

	QUnit.test("prevents resize in invalid direction", function(assert){
		// arrange
		var fnDone = assert.async();

		this.oFCL = oFactory.createFCL({
			layout: LT.ThreeColumnsMidExpandedEndHidden
		});


		this.oFCL._oAnimationEndListener.waitForAllColumnsResizeEnd().then(function() {
			// assert
			assertColumnsVisibility(assert, this.oFCL, 1, 1, 0);

			// act: drag towards outside the viewport (invalid direction)
			dragSeparator("end", 1, this.oFCL);

			// assert: no change in columns visibility
			assertColumnsVisibility(assert, this.oFCL, 1, 1, 0);

			fnDone();
		}.bind(this));
	});

	QUnit.module("Livecycle", {
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

	QUnit.test("move listeners are detached on destroy", function (assert) {
		var oSpyMoveListener = this.spy(this.oFCL, "_boundColumnSeparatorMove"),
			oSeparator = this.oFCL._oColumnSeparators.begin[0],
			iStartX = oSeparator.getBoundingClientRect().x;

		// mock resize start
		this.oFCL._onColumnSeparatorMoveStart({pageX: iStartX}, oSeparator);

		// Act: destroy before resize completed
		this.oFCL.destroy();
		oSpyMoveListener.resetHistory();

		// mock mousemove event after destroy
		document.dispatchEvent(new MouseEvent("mousemove"));

		// Assert
		assert.strictEqual(oSpyMoveListener.callCount, 0, "listener is not called");
	});

	QUnit.module("ScreenReader basic supprot", {
		beforeEach: function () {
			this.oFCL = oFactory.createFCL();
		},
		afterEach: function () {
			this.oFCL = null;
		}
	});

	QUnit.test("Each column has correct region role and it's labeled correctly when there is no Landmark Info", function (assert) {
		var fnGetLabelText = function (sColumnName) {
			return this.oFCL.$(sColumnName).attr("aria-label");
		}.bind(this);

		assert.strictEqual(this.oFCL.$("beginColumn").attr("role"), "region", "Begin column has correct role");
		assert.strictEqual(this.oFCL.$("midColumn").attr("role"), "region", "Middle column has correct role");
		assert.strictEqual(this.oFCL.$("endColumn").attr("role"), "region", "End column has correct role");

		assert.strictEqual(fnGetLabelText("beginColumn"), fnGetResourceBundleText("FCL_BEGIN_COLUMN_REGION_TEXT"), "Begin column is labeled correctly");
		assert.strictEqual(fnGetLabelText("midColumn"), fnGetResourceBundleText("FCL_MID_COLUMN_REGION_TEXT"), "Middle column is labeled correctly");
		assert.strictEqual(fnGetLabelText("endColumn"), fnGetResourceBundleText("FCL_END_COLUMN_REGION_TEXT"), "End column is labeled correctly");
	});

	QUnit.test("Each column is labeled correctly when there is Landmark Info", function (assert) {
		// Arrange
		var sTestFirstColumnLabel = "This is test first column label",
			sTestLastColumnLabel = "This is custom last column label",
			oLandmarkInfo = new FlexibleColumnLayoutAccessibleLandmarkInfo({
				firstColumnLabel: sTestFirstColumnLabel,
				lastColumnLabel: sTestLastColumnLabel
			});

		// Act
		this.oFCL.setLandmarkInfo(oLandmarkInfo);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Helper function
		var fnGetLabelText = function (sColumnName) {
			return this.oFCL.$(sColumnName).attr("aria-label");
		}.bind(this);

		// Assert
		assert.strictEqual(fnGetLabelText("beginColumn"), sTestFirstColumnLabel, "Begin column has its label changed by the Landmark Info");
		assert.strictEqual(fnGetLabelText("midColumn"), fnGetResourceBundleText("FCL_MID_COLUMN_REGION_TEXT"), "Middle column remains untouched with its default label");
		assert.strictEqual(fnGetLabelText("endColumn"), sTestLastColumnLabel, "End column has its label changed by the Landmark Info");
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
		nextUIUpdate.runSync()/*fake timer is used in module*/;
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
		nextUIUpdate.runSync()/*fake timer is used in module*/;
	});

	QUnit.test("SemanticHelper provides correct default action buttons info", function (assert) {
		var sId = "myFCL",
			oFCL,
			defaultButtonsConfig = {
				midColumn: {
					closeColumn: null, exitFullScreen: null, fullScreen: null
				},
				endColumn: {
					closeColumn: null, exitFullScreen: null, fullScreen: null
				}
			},
			oExpectedButtonsInfo = {
				[LT.OneColumn]: defaultButtonsConfig,
				[LT.TwoColumnsBeginExpanded]: Object.assign({}, defaultButtonsConfig, {
					midColumn: {
						closeColumn: "OneColumn", fullScreen: "MidColumnFullScreen", exitFullScreen: null
					}
				}),
				[LT.TwoColumnsMidExpanded]: Object.assign({}, defaultButtonsConfig, {
					midColumn: {
						closeColumn: "OneColumn", fullScreen: "MidColumnFullScreen", exitFullScreen: null
					}
				}),
				[LT.ThreeColumnsBeginExpandedEndHidden]: Object.assign({}, defaultButtonsConfig, {
					midColumn: {
						closeColumn: "OneColumn", fullScreen: "MidColumnFullScreen", exitFullScreen: null
					}
				}),
				[LT.ThreeColumnsMidExpandedEndHidden]: Object.assign({}, defaultButtonsConfig, {
					midColumn: {
						closeColumn: "OneColumn", fullScreen: "MidColumnFullScreen", exitFullScreen: null
					}
				}),
				[LT.ThreeColumnsMidExpanded]: Object.assign({}, defaultButtonsConfig, {
					endColumn: {
						closeColumn: "TwoColumnsMidExpanded", fullScreen: "EndColumnFullScreen", exitFullScreen: null
					}
				}),
				[LT.ThreeColumnsEndExpanded]: Object.assign({}, defaultButtonsConfig, {
					endColumn: {
						closeColumn: "TwoColumnsMidExpanded", fullScreen: "EndColumnFullScreen", exitFullScreen: null
					}
				}),
				[LT.MidColumnFullScreen]: Object.assign({}, defaultButtonsConfig, {
					midColumn: {
						closeColumn: "OneColumn", exitFullScreen: "TwoColumnsMidExpanded", fullScreen: null
					}
				}),
				[LT.EndColumnFullScreen]: Object.assign({}, defaultButtonsConfig, {
					endColumn: {
						closeColumn: "TwoColumnsMidExpanded", exitFullScreen: "ThreeColumnsMidExpanded", fullScreen: null
					}
				})
			};

		// setup
		oFCL = new FlexibleColumnLayout(sId);

		// act
		var oHelper = FlexibleColumnLayoutSemanticHelper.getInstanceFor(oFCL, {
			defaultThreeColumnLayoutType: "ThreeColumnsMidExpanded",
			defaultTwoColumnLayoutType: "TwoColumnsMidExpanded"
		});

		// assert
		Object.keys(library.LayoutType).forEach(function(sLayoutType) {
			var oButtonsInfo = oHelper._getUIStateForLayout(sLayoutType).actionButtonsInfo;
			assert.propEqual(oButtonsInfo, oExpectedButtonsInfo[sLayoutType]);
		});

		// act again
		oFCL.destroy();

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
		nextUIUpdate.runSync()/*fake timer is used in module*/;

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
		var oSpy;

		this.oFCL = new FlexibleColumnLayout();
		oSpy = this.spy(this.oFCL, "_measureControlWidth");
		this.stub(this.oFCL, "$").callsFake(function() {
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
		this.oFCL.destroy();
	});

	QUnit.test("_onNavContainerRendered", function (assert) {
		// setup
		this.oFCL = new FlexibleColumnLayout();
		var oEventSpy = this.spy(this.oFCL, "_hideShowColumnSeparators");

		// assert
		assert.equal(this.oFCL._hasAnyColumnPagesRendered(), false, "_isAnyColumnContentRendered is false before first invocation");

		// act
		this.oFCL._onNavContainerRendered({srcControl: this.oFCL.getAggregation("_beginColumnNav")});

		// assert
		assert.equal(this.oFCL._hasAnyColumnPagesRendered(), false, "_hasAnyColumnPagesRendered is false when container empty");
		assert.strictEqual(oEventSpy.callCount, 0, "_hideShowColumnSeparators is not called");

		// act
		this.oFCL.addBeginColumnPage(new Page());
		this.oFCL._onNavContainerRendered({srcControl: this.oFCL.getAggregation("_beginColumnNav")});

		// assert
		assert.equal(this.oFCL._hasAnyColumnPagesRendered(), true, "_hasAnyColumnPagesRendered is true");
		assert.strictEqual(oEventSpy.callCount, 1, "_hideShowColumnSeparators is called");
	});

	QUnit.test("_getColumnWidthDistributionForLayout converts percent widths to integers", function (assert) {
		// setup
		this.oFCL = new FlexibleColumnLayout({
			layoutData: new FlexibleColumnLayoutData({
				tabletLayoutData: new FlexibleColumnLayoutDataForTablet({
					twoColumnsMidExpanded: "33.5/66.5/0"
				})
			})
		});

		var oExpectedResult = [34, 66, 0];

		this.oFCL.placeAt(sQUnitFixture);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// assert
		assert.deepEqual(this.oFCL._getColumnWidthDistributionForLayout(LT.TwoColumnsMidExpanded, true, 2),
			oExpectedResult, "conversion to integer is correct");
	});

	QUnit.module("Focus handling");

	QUnit.test("AutoFocus - Should synchronize with NavContainer instances", function (assert) {
		//arrange
		var oFCL = oFactory.createFCL({
				autoFocus: false
			}),
			aNavContainers = oFCL._getNavContainers(),
			fnCheckNavContainersAutoFocus = function (bExpectedValue) {
				aNavContainers.forEach(function (oContainer) {
					// assert
					assert.strictEqual(oContainer.getAutoFocus(), bExpectedValue, "Container autoFocus property is synchronized with FLC");
				});
			};

		// assert
		fnCheckNavContainersAutoFocus(false);

		// act
		oFCL.setAutoFocus(true);

		// assert
		fnCheckNavContainersAutoFocus(true);

		//cleanup
		oFCL.destroy();
	});

	QUnit.test("Event delegates of nav containers should be removed on destroy of the FCL", function (assert) {
		// Arrange
		var oFCL = oFactory.createFCL(),
			sSpyName;

		FlexibleColumnLayout.COLUMN_ORDER.forEach(function(sColumnName){
			this["_" + sColumnName + "ColumnRemoveEventDelegateSpy"] = this.spy(oFCL._getColumnByStringName(sColumnName), "removeEventDelegate");
		}, this);

		// Act
		oFCL.destroy();

		// Assert
		FlexibleColumnLayout.COLUMN_ORDER.forEach(function(sColumnName){
			sSpyName = "_" + sColumnName + "ColumnRemoveEventDelegateSpy";
			assert.strictEqual(this[sSpyName].calledOnce, true,"removeEventDelegate is called only once on " + sColumnName + " column.");
			assert.strictEqual(this[sSpyName].calledWithExactly(oFCL["_" + sColumnName + "ColumnFocusOutDelegate"]), true,
				"removeEventDelegate is called with the exact: _" + sColumnName + "ColumnFocusOutDelegate function.");
			this[sSpyName] = null;
		}, this);
	});

	QUnit.module("Keyboard Handling", {
		beforeEach: function () {
			this.oFCL = oFactory.createFCL({
				layout: LT.TwoColumnsBeginExpanded
			});
			this.beginSeparatorDOM = this.oFCL._oColumnSeparators.begin[0];
			this.beginColumnDOM = this.oFCL._$columns.begin[0];
			this.midColumnDOM = this.oFCL._$columns.mid[0];
			this.beginColumnInitialWidth = this.beginColumnDOM.offsetWidth;
		}, afterEach: function () {
			this.oFCL.destroy();
			this.beginSeparatorDOM = null;
			this.beginColumnDOM = null;
			this.midColumnDOM = null;
			this.beginColumnInitialWidth = null;
		}
	});

	QUnit.test("Left arrow", function (assert) {
		QUnitUtils.triggerKeydown(this.beginSeparatorDOM, KeyCodes.ARROW_LEFT);
		assert.strictEqual(this.beginColumnDOM.offsetWidth, this.beginColumnInitialWidth - 20,
			"Column's width should be 20 pixels less");
	});

	QUnit.test("Right arrow", function (assert) {
		QUnitUtils.triggerKeydown(this.beginSeparatorDOM, KeyCodes.ARROW_RIGHT);
		assert.strictEqual(this.beginColumnDOM.offsetWidth, this.beginColumnInitialWidth + 20,
			"Column's width should be 20 pixels bigger");
	});

	QUnit.test("Shift + Left arrow", function (assert) {
		QUnitUtils.triggerKeydown(this.beginSeparatorDOM, KeyCodes.ARROW_LEFT, true);
		assert.strictEqual(this.beginColumnDOM.offsetWidth, this.beginColumnInitialWidth - 1,
			"Column's width should be 1 pixel less");
	});

	QUnit.test("Shift + Right arrow", function (assert) {
		QUnitUtils.triggerKeydown(this.beginSeparatorDOM, KeyCodes.ARROW_RIGHT, true);
		assert.strictEqual(this.beginColumnDOM.offsetWidth, this.beginColumnInitialWidth + 1,
			"Column's width should be 1 pixel bigger");
	});

	QUnit.test("Home", function (assert) {
		QUnitUtils.triggerKeydown(this.beginSeparatorDOM, KeyCodes.HOME);
		assert.strictEqual(this.beginColumnDOM.offsetWidth, FlexibleColumnLayout.COLUMN_MIN_WIDTH,
			"Begin column should have the minimal allowed width");
	});

	QUnit.test("End", function (assert) {
		QUnitUtils.triggerKeydown(this.beginSeparatorDOM, KeyCodes.END);
		assert.strictEqual(this.midColumnDOM.offsetWidth, FlexibleColumnLayout.COLUMN_MIN_WIDTH,
			"Mid column should have the minimal allowed width");
	});

	QUnit.module("columnResize", {
		beforeEach: function () {
			this.oFCL = new FlexibleColumnLayout();
			this.oEventSpy = this.spy(this.oFCL, "fireColumnResize");
			this.iPreviousFixtureWidth = $("#" + sQUnitFixture).width();
			$("#" + sQUnitFixture).width(DESKTOP_SIZE);
		},

		afterEach: function () {
			this.oFCL.destroy();
			$("#" + sQUnitFixture).width(this.iPreviousFixtureWidth);
		}
	});

	QUnit.test("no pointer events on content during column resize", function (assert) {
		this.oFCL.placeAt(sQUnitFixture);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		assert.expect(6);
		var done = assert.async();

		this.oFCL._oAnimationEndListener.waitForAllColumnsResizeEnd().then(function () {
			var oMockEvent = {pageX: 10},
				oMovedSeparator = this.oFCL.getDomRef().querySelector(".sapFFCLColumnSeparator"),
				aColumnContentWrappers = this.oFCL.getDomRef().querySelectorAll(".sapFFCLColumnContent");

			// mock start separator movement
			this.oFCL._onColumnSeparatorMoveStart(oMockEvent, oMovedSeparator, false);
			aColumnContentWrappers.forEach(function(wrapperElement) {
				assert.strictEqual(getComputedStyle(wrapperElement).pointerEvents, "none", "pointer events are disabled");
			});

			// mock end separator movement
			this.oFCL._exitInteractiveResizeMode();
			aColumnContentWrappers.forEach(function(wrapperElement) {
				assert.strictEqual(getComputedStyle(wrapperElement).pointerEvents, "auto", "pointer events are restored");
			});
			done();
		}.bind(this));
	});

	QUnit.test("columnResize event is fired after resize", function (assert) {
		assert.expect(1);
		// setup
		var fnDone = assert.async(),
			oResizeFunctionSpy = this.spy(ResizeHandler, "resume"),
			fnCallback = function () {
				this.oFCL.detachColumnResize(fnCallback);
				// assert
				assert.ok(this.oEventSpy.calledAfter(oResizeFunctionSpy), "event is fired after ResizeHandler.resume");
				fnDone();
			}.bind(this);

		this.oFCL.placeAt(sQUnitFixture);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		this.oFCL._oAnimationEndListener.waitForAllColumnsResizeEnd().then(function () {
			this.oEventSpy.resetHistory();
			this.oFCL.attachColumnResize(fnCallback);
			this.oFCL.setLayout(LT.TwoColumnsBeginExpanded);
		}.bind(this));
	});

	QUnit.test("columnResize event is fired after resize of all animated columns", function (assert) {
		assert.expect(3);
		// setup
		var fnDone = assert.async(),
			oResizeFunctionSpy = this.spy(ResizeHandler, "resume"),
			iEventsCount = 0,
			fnCallback = function () {
				iEventsCount++;
				if (iEventsCount == 3) {
					this.oFCL.detachColumnResize(fnCallback);
					// assert
					assert.ok(oResizeFunctionSpy.withArgs(this.oFCL._$columns['begin'].get(0)).calledOnce);
					assert.ok(oResizeFunctionSpy.withArgs(this.oFCL._$columns['mid'].get(0)).calledOnce);
					assert.ok(oResizeFunctionSpy.withArgs(this.oFCL._$columns['end'].get(0)).calledOnce);
					fnDone();
				}
			}.bind(this);

		this.oFCL.setLayout(LT.TwoColumnsMidExpanded);
		this.oFCL.placeAt(sQUnitFixture);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		this.oFCL._oAnimationEndListener.waitForAllColumnsResizeEnd().then(function () {
			oResizeFunctionSpy.resetHistory();
			this.oFCL.attachColumnResize(fnCallback);
			this.oFCL.setLayout(LT.ThreeColumnsMidExpanded);
		}.bind(this));
	});

	QUnit.test("cancel resize animations", function (assert) {
		assert.expect(1);
		// setup
		var fnDone = assert.async(),
			oFirstLayoutAnimationEnd = this.spy();

		this.oFCL.setLayout(LT.TwoColumnsMidExpanded);
		this.oFCL.placeAt(sQUnitFixture);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Setup: change to a layout that requires animation
		this.oFCL.setLayout(LT.OneColumn);
		this.oFCL._oAnimationEndListener.waitForAllColumnsResizeEnd().then(oFirstLayoutAnimationEnd);

		// Act: set a different layout that requires a different animation
		this.oFCL.setLayout(LT.ThreeColumnsMidExpanded);
		this.oFCL._oAnimationEndListener.waitForAllColumnsResizeEnd().then(function() {
			assert.strictEqual(oFirstLayoutAnimationEnd.callCount, 0, "callback for cancelled resize is not called");
			fnDone();
		});
	});

	QUnit.test("setting two layouts synchronously", function (assert) {
		assert.expect(1);
		// setup
		var fnDone = assert.async();

		this.oFCL.setLayout(LT.OneColumn);
		this.oFCL.placeAt(sQUnitFixture);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Setup: change to layouts that requires animation
		this.oFCL.setLayout(LT.TwoColumnsMidExpanded);
		this.oFCL.setLayout(LT.ThreeColumnsMidExpanded);

		setTimeout(function () {
			assert.strictEqual(this.oFCL._verifyColumnWidthsMatchLayout(this.oFCL._oColumnWidthInfo, LT.ThreeColumnsMidExpanded), true, "Three columns layout is set");
			fnDone();
		}.bind(this), 1000);
	});

	QUnit.test("Switching layout from OneColumn to ThreeColumnsEndExpanded", function (assert) {
		assert.expect(1);
		var fnDone = assert.async(),
		fnCallback = function () {
			// assert
			assert.strictEqual(this.oEventSpy.callCount, VISIBLE_COLUMNS[LT.ThreeColumnsEndExpanded], "Event is fired " + VISIBLE_COLUMNS[LT.ThreeColumnsEndExpanded] + " times for layout: " + LT.ThreeColumnsEndExpanded);

			fnDone();
		};

		this.oFCL.placeAt(sQUnitFixture);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		this.oEventSpy.resetHistory();
		this.oFCL.setLayout(LT.ThreeColumnsEndExpanded);
		this.oFCL._oAnimationEndListener.waitForAllColumnsResizeEnd().then(fnCallback.bind(this));
	});

	QUnit.test("Switching layout from OneColumn to TwoColumnsBeginExpanded", function (assert) {
		assert.expect(1);
		var fnDone = assert.async(),
		fnCallback = function () {
			// assert
			assert.strictEqual(this.oEventSpy.callCount, VISIBLE_COLUMNS[LT.TwoColumnsBeginExpanded], "Event is fired " + VISIBLE_COLUMNS[LT.TwoColumnsBeginExpanded] + " times for layout: " + LT.TwoColumnsBeginExpanded);

			fnDone();
		};

		this.oFCL.placeAt(sQUnitFixture);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		this.oEventSpy.resetHistory();
		this.oFCL.setLayout(LT.TwoColumnsBeginExpanded);
		this.oFCL._oAnimationEndListener.waitForAllColumnsResizeEnd().then(fnCallback.bind(this));
	});

	QUnit.test("Switching layout from OneColumn to ThreeColumnsMidExpandedEndHidden", function (assert) {
		assert.expect(1);
		var fnDone = assert.async(),
		fnCallback = function () {
			// assert
			assert.strictEqual(this.oEventSpy.callCount, VISIBLE_COLUMNS[LT.ThreeColumnsMidExpandedEndHidden], "Event is fired " + VISIBLE_COLUMNS[LT.ThreeColumnsMidExpandedEndHidden] + " times for layout: " + LT.ThreeColumnsMidExpandedEndHidden);

			fnDone();
		};

		this.oFCL.placeAt(sQUnitFixture);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		this.oEventSpy.resetHistory();
		this.oFCL.setLayout(LT.ThreeColumnsMidExpandedEndHidden);
		this.oFCL._oAnimationEndListener.waitForAllColumnsResizeEnd().then(fnCallback.bind(this));
	});

	QUnit.test("columnResize event is fired after resize without layoutType change", function (assert) {
		assert.expect(1);
		// setup
		var fnDone = assert.async(),
			iEventsCount = 0,
			fnCallback = function () {
				iEventsCount++;
				if (iEventsCount == 2) {
					this.oFCL.detachColumnResize(fnCallback);
					// assert
					assert.equal(iEventsCount, 2, "columnResize event is fired for all resized columns");
					fnDone();
				}
			}.bind(this);

		this.oFCL = oFactory.createFCL({
			layout: LT.TwoColumnsBeginExpanded
		});
		this.oFCL.placeAt(sQUnitFixture);
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		this.oFCL.attachColumnResize(fnCallback);

		// Act: resize to a width that does not lead to <code>layoutType</code> chage
		dragSeparator("begin", 10, this.oFCL);
	});

	(function () {
		Object.keys(LT).forEach(function(sLayoutName) {
			_testDifferentLayoutsInitialColumnResizeEvent(sLayoutName);
		});
	})();

	function _testDifferentLayoutsInitialColumnResizeEvent(sLayoutName) {
		QUnit.test(sLayoutName, function (assert) {
			assert.expect(1);

			var fnDone = assert.async(),
			fnCallback = function () {
				// assert
				assert.strictEqual(this.oEventSpy.callCount, VISIBLE_COLUMNS[sLayoutName], "Event is fired " + VISIBLE_COLUMNS[sLayoutName] + " times for layout: " + sLayoutName);
				fnDone();
			};

			this.oFCL.setLayout(sLayoutName);
			this.oFCL.placeAt(sQUnitFixture);
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			this.oFCL._oAnimationEndListener.waitForAllColumnsResizeEnd().then(fnCallback.bind(this));
		});
	}


	QUnit.module("_getColumnWidth", {
		beforeEach: function () {

			// Arrange
			this.oPage1 = oFactory.createPage("page1", this.oBtn1);
			this.oPage2 = oFactory.createPage("page2", this.oBtn2);
			this.oPage3 = oFactory.createPage("page3", this.oBtn3);

			this.oFCL = oFactory.createFCL({
				beginColumnPages: this.oPage1,
				midColumnPages: this.oPage2,
				endColumnPages: this.oPage3
			});
			this.iPreviousFixtureWidth = $("#" + sQUnitFixture).width();
			$("#" + sQUnitFixture).width(DESKTOP_SIZE);
			this.sOldAnimationSetting = $("html").attr("data-sap-ui-animation");
			this._sOrigAminationMode = ControlBehavior.getAnimationMode();
			ControlBehavior.setAnimationMode("none");
			$("html").attr("data-sap-ui-animation", "off");


			this.oFCL.placeAt(sQUnitFixture);
			nextUIUpdate.runSync()/*fake timer is used in module*/;
		},
		afterEach: function () {

			// Clean Up
			this.oFCL.destroy();
			$("#" + sQUnitFixture).width(this.iPreviousFixtureWidth);
			ControlBehavior.setAnimationMode(this._sOrigAminationMode);
			$("html").attr("data-sap-ui-animation", this.sOldAnimationSetting);
		}
	});

	(function () {
		Object.keys(LT).forEach(function(sLayoutName) {
			_testDifferentLayoutColumnWidths(sLayoutName);
		});
	})();

	function _testDifferentLayoutColumnWidths(sLayoutName) {
		QUnit.test(sLayoutName, function (assert) {

			this.oFCL.setLayout(sLayoutName);

			FlexibleColumnLayout.COLUMN_ORDER.forEach(function(sColumn) {
				var oColumn = this.oFCL._$columns[sColumn],
					iExpectedColumnWidth = parseInt(oColumn.css("width")),
					iActualColumnWidth = this.oFCL._getColumnWidth(sColumn);
				assert.strictEqual(iActualColumnWidth, iExpectedColumnWidth, "correct with for " + sColumn);
			}, this);
		});
	}

	QUnit.test("after resize", function (assert) {

		var iOldWidth = this.oFCL.$().width(),
			iNewWidth = iOldWidth - 10;

		this.oFCL.setLayout(LT.OneColumn);

		this.oFCL.$().width(iNewWidth + "px");
		this.oFCL._onResize({
			size: {width: iNewWidth},
			oldSize: {width: iOldWidth}
		});

		FlexibleColumnLayout.COLUMN_ORDER.forEach(function(sColumn) {
			var oColumn = this.oFCL._$columns[sColumn],
				iExpectedColumnWidth = oColumn.width(),
				iActualColumnWidth = this.oFCL._getColumnWidth(sColumn);
			assert.strictEqual(iActualColumnWidth, iExpectedColumnWidth, "correct with for " + sColumn);
		}, this);
	});

	QUnit.module("Focus handling with enabled 'restoreFocusOnBackNavigation' property", {
		beforeEach: function () {

			// Arrange
			this.oBtn1 = new Button({text: "Button1"});
			this.oBtn2 = new Button({text: "Button2"});
			this.oBtn3 = new Button({text: "Button3"});
			this.firstFocusableBtn = new Button({text: "Focus Btn"});

			this.oPage1 = oFactory.createPage("page1", this.oBtn1);
			this.oPage2 = oFactory.createPage("page2", [this.firstFocusableBtn, this.oBtn2]);
			this.oPage3 = oFactory.createPage("page3", this.oBtn3);

			this.oFCL = oFactory.createFCL({
				beginColumnPages: this.oPage1,
				midColumnPages: this.oPage2,
				endColumnPages: this.oPage3,
				layout: LT.OneColumn,
				initialBeginColumnPage: "page1",
				restoreFocusOnBackNavigation: true
			});
			this.iPreviousFixtureWidth = $("#" + sQUnitFixture).width();
			$("#" + sQUnitFixture).width(DESKTOP_SIZE);
			this.sOldAnimationSetting = $("html").attr("data-sap-ui-animation");
			this._sOrigAminationMode = ControlBehavior.getAnimationMode();
			ControlBehavior.setAnimationMode("none");
			$("html").attr("data-sap-ui-animation", "off");
		},
		afterEach: function () {

			// Clean Up
			this.oFCL.destroy();
			$("#" + sQUnitFixture).width(this.iPreviousFixtureWidth);
			ControlBehavior.setAnimationMode(this._sOrigAminationMode);
			$("html").attr("data-sap-ui-animation", this.sOldAnimationSetting);
		}
	});

	QUnit.test("Should restore focus on back navigation", function (assert) {
		// Arrange
		var oSpy = this.spy(this.oFCL, "_restoreFocusToColumn"),
			oStub,
			oCall;

		// Act
		this.oBtn1.$().trigger("focus");

		// Opening two columns
		this.oFCL.setLayout(LT.TwoColumnsBeginExpanded);
		this.oBtn2.$().trigger("focus");

		oStub = this.stub($.prototype, "trigger");

		// Back to first column
		this.oFCL.setLayout(LT.OneColumn);

		// Assert
		oCall = oStub.getCalls()[0];
		assert.ok(oSpy.calledWith("begin"), "_restoreFocusToColumn is called with 'begin' column");
		assert.ok(oCall.calledWith("focus") && oCall.thisValue[0] === this.oBtn1.getDomRef(), "Focus is restored to begin column");

		// Clean up
		oStub.restore();
	});

	QUnit.test("Should preserve existing focus in previous of current column on back navigation", function (assert) {
		// Arrange
		var oSpy = this.spy(this.oFCL, "_restoreFocusToColumn"),
			oStub,
			oCall;

		// Act
		this.oBtn1.$().trigger("focus");

		// Opening two columns
		this.oFCL.setLayout(LT.TwoColumnsBeginExpanded);
		this.oBtn2.$().trigger("focus");

		// Opening three columns
		this.oFCL.setLayout(LT.ThreeColumnsEndExpanded);
		this.oBtn3.$().trigger("focus");

		// Back to two columns
		oStub = this.stub($.prototype, "trigger");
		this.oFCL.setLayout(LT.TwoColumnsBeginExpanded);

		// Assert
		oCall = oStub.getCalls()[0];
		assert.ok(oSpy.calledWith("mid"), "_restoreFocusToColumn is called with 'mid' column");
		assert.ok(oCall.calledWith("focus") && oCall.thisValue[0] === this.oBtn2.getDomRef(),
			"Focus is preserved to begin column after navigating back from end to mid");

		// Clean up
		oStub.restore();
	});

	QUnit.test("Should restore focus after exiting full screen", function (assert) {
		// Arrange
		var oSpy = this.spy(this.oFCL, "_restoreFocusToColumn"),
			oStub,
			oCall;

		// Act
		this.oFCL.setLayout(LT.TwoColumnsBeginExpanded);
		this.oBtn1.$().trigger("focus");

		// Opening mid molumn full screen
		this.oFCL.setLayout(LT.MidColumnFullScreen);
		this.oBtn2.$().trigger("focus");

		// Back to first column
		oStub = this.stub($.prototype, "trigger");
		this.oFCL.setLayout(LT.OneColumn);

		// Assert
		oCall = oStub.getCalls()[0];
		assert.ok(oSpy.calledWith("begin"), "_restoreFocusToColumn is called with 'begin' column");
		assert.ok(oCall.calledWith("focus") && oCall.thisValue[0] === this.oBtn1.getDomRef(),
			"Focus is restored to begin column after exiting from mid's fullscreen.");

		// Clean up
		oStub.restore();
	});

	QUnit.test("Should restore focus when navigating back on the first focusable element if no element was stored", function (assert) {
		// Arrange
		var oStub,
			oCall,
			oExpectedFocusedElement;

		// Act
		this.oFCL.setLayout(LT.TwoColumnsMidExpanded);

		// should focus element in the current column, because of the check in
		// _isFocusInSomeOfThePreviousColumns which if true, does not restore the focus
		this.oBtn2.focus();

		oExpectedFocusedElement = this.oFCL._getFirstFocusableElement('begin');

		// Act
		this.oFCL._oColumnFocusInfo.begin = {}; // reset if there is a stored element
		oStub = this.stub($.prototype, "trigger");
		this.oFCL.setLayout(LT.OneColumn);

		// Assert
		oCall = oStub.getCalls()[0];
		assert.ok(oCall.calledWith("focus") && oCall.thisValue[0] === oExpectedFocusedElement,
			"Focus is restored to first focusable element, even if there are no store elements");

		// Clean up
		oStub.restore();
	});

	QUnit.test("Should keep focus if it is already in the current column", function (assert) {
		// Arrange
		var oExpectedFocusedElement = this.oBtn2.getDomRef();

		// Act
		this.oFCL.setLayout(LT.MidColumnFullScreen);

		this.oBtn2.focus();
		this.oFCL.setLayout(LT.TwoColumnsMidExpanded);

		// Assert
		assert.ok(document.activeElement === oExpectedFocusedElement,
   "Focus is saved on the same element as before the resize, because it was already in the current column");
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
			nextUIUpdate.runSync()/*fake timer is used in module*/;

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

		assert.equal(parseInt($beginColumn[0].style.width), $beginColumn.get(0).offsetWidth, "Begin column width correct");
		assert.equal($midColumn[0].style.width, "", "Mid column width correct"); // mid has auto-width
		assert.equal(parseInt($endColumn[0].style.width), $endColumn.get(0).offsetWidth, "End column width correct");
		assert.ok(oFCL._iWidth > oFCL._getTotalColumnsWidth(oFCL.getLayout()), "Some space for arrows is allocated");
		assert.ok(oFCL._getVisibleColumnSeparatorsCount() > 0, "Visible arrows count is greater than 0");
	}

	QUnit.module("ScreenReader aria-valuenow DESKTOP SIZE", {
		beforeEach: function () {
			this.sOldAnimationSetting = $("html").attr("data-sap-ui-animation");
			this.sOldAnimationMode = ControlBehavior.getAnimationMode();
			$("html").attr("data-sap-ui-animation", "off");
			$("#" + sQUnitFixture).width(DESKTOP_SIZE); // > 1280px
			ControlBehavior.setAnimationMode("none");
		},
		afterEach: function () {
			$("html").attr("data-sap-ui-animation", this.sOldAnimationSetting);
			$("#" + sQUnitFixture).width("");
			ControlBehavior.setAnimationMode(this.sOldAnimationMode);
			this.oFCL.destroy();
			window.localStorage.removeItem(FlexibleColumnLayout.STORAGE_PREFIX_DESKTOP + "-begin");
		}
	});

	QUnit.test("begin separator in two-column layouts", function (assert) {
		var iSeparatorValuenow;
		this.oFCL = oFactory.createFCL({
			layout: LT.TwoColumnsBeginExpanded,
			beginColumnPages: [new Page()]
		});
		this.oFCL._onNavContainerRendered({srcControl: this.oFCL.getAggregation("_beginColumnNav")});

		// check initial valuenow
		iSeparatorValuenow = parseFloat(this.oFCL._oColumnSeparators.begin.get(0).getAttribute("aria-valuenow"));
		assert.ok(iSeparatorValuenow > 0, "valuenow attribute shows begin column is expanded");
		assert.ok(iSeparatorValuenow < 100, "valuenow attribute shows begin column not fully expanded");

		// act
		dragSeparator("begin", 10, this.oFCL); // drag to expand the begin column slightly
		assertSeparatorVisibility(assert, this.oFCL, 1, 0);
		assert.equal(this.oFCL.getLayout(), LT.TwoColumnsBeginExpanded, "assert setup is as expected");

		// check
		iSeparatorValuenow = parseFloat(this.oFCL._oColumnSeparators.begin.get(0).getAttribute("aria-valuenow"));
		assert.ok(iSeparatorValuenow > 0, "valuenow attribute shows begin column is expanded");
		assert.ok(iSeparatorValuenow < 100, "valuenow attribute shows begin column not fully expanded");
	});

	QUnit.test("begin separator min value in two-column layouts", function (assert) {
		var iSeparatorValuenow;
		this.oFCL = oFactory.createFCL({
			layout: LT.TwoColumnsBeginExpanded,
			beginColumnPages: [new Page()]
		});
		this.oFCL._onNavContainerRendered({srcControl: this.oFCL.getAggregation("_beginColumnNav")});

		// act
		dragSeparator("begin", -1000, this.oFCL); // drag to the earliest possible possition (shrink begin column to the min)
		assertSeparatorVisibility(assert, this.oFCL, 1, 0);
		assert.equal(this.oFCL.getLayout(), LT.TwoColumnsMidExpanded, "assert setup is as expected");
		assert.equal(this.oFCL._$columns.begin.get(0).offsetWidth, FlexibleColumnLayout.COLUMN_MIN_WIDTH, "begin column is shrinked to the min");

		// check
		iSeparatorValuenow = parseFloat(this.oFCL._oColumnSeparators.begin.get(0).getAttribute("aria-valuenow"));
		assert.equal(iSeparatorValuenow, 0.00, "valuenow attribute shows begin column is shrinked to the min");
	});

	QUnit.test("begin separator max value in two-column layouts", function (assert) {
		var iSeparatorValuenow;
		this.oFCL = oFactory.createFCL({
			layout: LT.TwoColumnsBeginExpanded,
			beginColumnPages: [new Page()]
		});
		this.oFCL._onNavContainerRendered({srcControl: this.oFCL.getAggregation("_beginColumnNav")});

		// act
		dragSeparator("begin", 1000, this.oFCL); // drag to the farthest possible possition (expand begin column to the max)
		assertSeparatorVisibility(assert, this.oFCL, 1, 0);
		assert.equal(this.oFCL.getLayout(), LT.TwoColumnsBeginExpanded, "assert setup is as expected");
		assert.equal(this.oFCL._$columns.mid.get(0).offsetWidth, FlexibleColumnLayout.COLUMN_MIN_WIDTH, "mid column is shrinked to the min");

		// check
		iSeparatorValuenow = parseFloat(this.oFCL._oColumnSeparators.begin.get(0).getAttribute("aria-valuenow"));
		assert.equal(iSeparatorValuenow, 100.00, "valuenow attribute shows begin column is expanded to the max");
	});

	QUnit.test("begin separator in three-column layouts", function (assert) {
		var iSeparatorValuenow;
		this.oFCL = oFactory.createFCL({
			layout: LT.ThreeColumnsMidExpanded,
			beginColumnPages: [new Page()]
		});
		this.oFCL._onNavContainerRendered({srcControl: this.oFCL.getAggregation("_beginColumnNav")});

		// check initial valuenow
		iSeparatorValuenow = parseFloat(this.oFCL._oColumnSeparators.begin.get(0).getAttribute("aria-valuenow"));
		assert.ok(iSeparatorValuenow > 0, "valuenow attribute shows begin column is expanded");
		assert.ok(iSeparatorValuenow < 100, "valuenow attribute shows begin column not fully expanded");

		// act
		dragSeparator("begin", 10, this.oFCL); // drag to expand the begin column slightly
		assertSeparatorVisibility(assert, this.oFCL, 1, 1);
		assert.equal(this.oFCL.getLayout(), LT.ThreeColumnsMidExpanded, "assert setup is as expected");

		// check
		iSeparatorValuenow = parseFloat(this.oFCL._oColumnSeparators.begin.get(0).getAttribute("aria-valuenow"));
		assert.ok(iSeparatorValuenow > 0, "valuenow attribute shows begin column is expanded");
		assert.ok(iSeparatorValuenow < 100, "valuenow attribute shows begin column not fully expanded");
	});

	QUnit.test("begin separator min value in three-column layout", function (assert) {
		var iSeparatorValuenow;
		this.oFCL = oFactory.createFCL({
			layout: LT.ThreeColumnsMidExpanded,
			beginColumnPages: [new Page()]
		});
		this.oFCL._onNavContainerRendered({srcControl: this.oFCL.getAggregation("_beginColumnNav")});

		// act
		dragSeparator("begin", -1000, this.oFCL); // drag to the earliest possible possition (shrink begin column to the min)
		assertSeparatorVisibility(assert, this.oFCL, 1, 1);
		assert.equal(this.oFCL.getLayout(), LT.ThreeColumnsMidExpanded, "assert setup is as expected");
		assert.equal(this.oFCL._$columns.begin.get(0).offsetWidth, FlexibleColumnLayout.COLUMN_MIN_WIDTH, "begin column is shrinked to the min");

		// check
		iSeparatorValuenow = parseFloat(this.oFCL._oColumnSeparators.begin.get(0).getAttribute("aria-valuenow"));
		assert.equal(iSeparatorValuenow, 0.00, "valuenow attribute shows begin column is shrinked to the min");
	});

	QUnit.test("begin separator max value in three-column layouts", function (assert) {
		var iSeparatorValuenow;
		this.oFCL = oFactory.createFCL({
			layout: LT.ThreeColumnsBeginExpandedEndHidden,
			beginColumnPages: [new Page()]
		});
		this.oFCL._onNavContainerRendered({srcControl: this.oFCL.getAggregation("_beginColumnNav")});

		dragSeparator("begin", 1000, this.oFCL); // drag to the farthest possible possition (expand begin column to the max)
		assertSeparatorVisibility(assert, this.oFCL, 1, 0);
		assert.equal(this.oFCL.getLayout(), LT.ThreeColumnsBeginExpandedEndHidden, "assert setup is as expected");

		// check
		iSeparatorValuenow = parseFloat(this.oFCL._oColumnSeparators.begin.get(0).getAttribute("aria-valuenow"));
		assert.equal(this.oFCL._$columns.mid.get(0).offsetWidth, FlexibleColumnLayout.COLUMN_MIN_WIDTH, "mid column is shrinked to the min");
		assert.equal(iSeparatorValuenow, 100.00, "valuenow attribute shows begin column is expanded to the max");
	});

	QUnit.test("end separator in three-column layouts", function (assert) {
		var iSeparatorValuenow;
		this.oFCL = oFactory.createFCL({
			layout: LT.ThreeColumnsMidExpanded,
			beginColumnPages: [new Page()],
			endColumnPages: [new Page()]
		});
		this.oFCL._onNavContainerRendered({srcControl: this.oFCL.getAggregation("_beginColumnNav")});
		this.oFCL._onNavContainerRendered({srcControl: this.oFCL.getAggregation("_endColumnNav")});

		// check initial valuenow
		iSeparatorValuenow = parseFloat(this.oFCL._oColumnSeparators.end.get(0).getAttribute("aria-valuenow"));
		assert.ok(iSeparatorValuenow > 0, "valuenow attribute shows mid column is expanded");
		assert.ok(iSeparatorValuenow < 100, "valuenow attribute shows mid column not fully expanded");

		// act
		dragSeparator("end", -10, this.oFCL); // drag to shrink the mid column slightly
		assertSeparatorVisibility(assert, this.oFCL, 1, 1);
		assert.equal(this.oFCL.getLayout(), LT.ThreeColumnsMidExpanded, "assert setup is as expected");

		// check
		iSeparatorValuenow = parseFloat(this.oFCL._oColumnSeparators.end.get(0).getAttribute("aria-valuenow"));
		assert.ok(iSeparatorValuenow > 0, "valuenow attribute shows mid column is expanded");
		assert.ok(iSeparatorValuenow < 100, "valuenow attribute shows mid column not fully expanded");
	});

	QUnit.test("end separator min value in three-column layouts", function (assert) {
		var iSeparatorValuenow;
		this.oFCL = oFactory.createFCL({
			layout: LT.ThreeColumnsEndExpanded,
			beginColumnPages: [new Page()],
			endColumnPages: [new Page()]
		});
		this.oFCL._onNavContainerRendered({srcControl: this.oFCL.getAggregation("_beginColumnNav")});
		this.oFCL._onNavContainerRendered({srcControl: this.oFCL.getAggregation("_endColumnNav")});

		// act
		dragSeparator("end", -1000, this.oFCL); // drag to shrink the mid column to the min
		assertSeparatorVisibility(assert, this.oFCL, 0, 1);
		assert.equal(this.oFCL.getLayout(), LT.ThreeColumnsEndExpanded, "assert setup is as expected");

		// check
		iSeparatorValuenow = parseFloat(this.oFCL._oColumnSeparators.end.get(0).getAttribute("aria-valuenow"));
		assert.strictEqual(iSeparatorValuenow,  0.00, "valuenow attribute shows mid column is shrinked to the min");
	});

	QUnit.test("end separator max value in three-column layouts", function (assert) {
		var iSeparatorValuenow;
		this.oFCL = oFactory.createFCL({
			layout: LT.ThreeColumnsMidExpanded,
			beginColumnPages: [new Page()],
			endColumnPages: [new Page()]
		});
		this.oFCL._onNavContainerRendered({srcControl: this.oFCL.getAggregation("_beginColumnNav")});
		this.oFCL._onNavContainerRendered({srcControl: this.oFCL.getAggregation("_endColumnNav")});

		// act
		dragSeparator("end", 1000, this.oFCL); // drag to expand the mid column to the max
		assertSeparatorVisibility(assert, this.oFCL, 1, 1);
		assert.equal(this.oFCL.getLayout(), LT.ThreeColumnsMidExpanded, "assert setup is as expected");

		// check
		iSeparatorValuenow = parseFloat(this.oFCL._oColumnSeparators.end.get(0).getAttribute("aria-valuenow"));
		assert.strictEqual(iSeparatorValuenow,  100.00, "valuenow attribute shows mid column is expanded to the max");
	});

	QUnit.module("ScreenReader aria-valuenow TABLET SIZE", {
		beforeEach: function () {
			this.sOldAnimationSetting = $("html").attr("data-sap-ui-animation");
			this.sOldAnimationMode = ControlBehavior.getAnimationMode();
			$("html").attr("data-sap-ui-animation", "off");
			$("#" + sQUnitFixture).width(TABLET_SIZE); // Between 960 and 1280
			ControlBehavior.setAnimationMode("none");
		},
		afterEach: function () {
			$("html").attr("data-sap-ui-animation", this.sOldAnimationSetting);
			$("#" + sQUnitFixture).width("");
			ControlBehavior.setAnimationMode(this.sOldAnimationMode);
			this.oFCL.destroy();
			window.localStorage.removeItem(FlexibleColumnLayout.STORAGE_PREFIX_TABLET + "-begin");
		}
	});

	QUnit.test("begin separator in three-column layouts", function (assert) {
		var iSeparatorValuenow;
		this.oFCL = oFactory.createFCL({
			layout: LT.ThreeColumnsMidExpanded,
			beginColumnPages: [new Page()],
			midColumnPages: [new Page()]
		});
		this.oFCL._onNavContainerRendered({srcControl: this.oFCL.getAggregation("_beginColumnNav")});
		this.oFCL._onNavContainerRendered({srcControl: this.oFCL.getAggregation("_midColumnNav")});

		iSeparatorValuenow = parseFloat(this.oFCL._oColumnSeparators.begin.get(0).getAttribute("aria-valuenow"));
		assert.strictEqual(iSeparatorValuenow, 0.00, "valuenow attribute shows begin column is shrinked to the min");

		// act
		dragSeparator("begin", 10, this.oFCL); // drag to expand the begin column slightly
		assertSeparatorVisibility(assert, this.oFCL, 1, 1);
		assert.equal(this.oFCL.getLayout(), LT.ThreeColumnsMidExpandedEndHidden, "assert setup is as expected");

		// check
		iSeparatorValuenow = parseFloat(this.oFCL._oColumnSeparators.begin.get(0).getAttribute("aria-valuenow"));
		assert.ok(iSeparatorValuenow > 0, "valuenow attribute shows begin column is expanded");
		assert.ok(iSeparatorValuenow < 100, "valuenow attribute shows begin column not fully expanded");
	});

	QUnit.test("begin separator min value in three-column layouts", function (assert) {
		var iSeparatorValuenow;
		this.oFCL = oFactory.createFCL({
			layout: LT.ThreeColumnsMidExpandedEndHidden,
			beginColumnPages: [new Page()],
			midColumnPages: [new Page()]
		});
		this.oFCL._onNavContainerRendered({srcControl: this.oFCL.getAggregation("_beginColumnNav")});
		this.oFCL._onNavContainerRendered({srcControl: this.oFCL.getAggregation("_midColumnNav")});

		iSeparatorValuenow = parseFloat(this.oFCL._oColumnSeparators.begin.get(0).getAttribute("aria-valuenow"));
		assert.ok(iSeparatorValuenow > 0, "valuenow attribute shows begin column is expanded");
		assert.ok(iSeparatorValuenow < 100, "valuenow attribute shows begin column not fully expanded");

		// act
		dragSeparator("begin", -1000, this.oFCL); // drag to completely hide the begin column
		assertSeparatorVisibility(assert, this.oFCL, 1, 1);
		assert.equal(this.oFCL.getLayout(), LT.ThreeColumnsMidExpanded, "assert layout is as expected");

		// check
		iSeparatorValuenow = parseFloat(this.oFCL._oColumnSeparators.begin.get(0).getAttribute("aria-valuenow"));
		assert.strictEqual(iSeparatorValuenow, 0, "valuenow attribute shows begin column is shrinked to the min");
	});

	QUnit.test("begin separator max value in three-column layouts", function (assert) {
		var iSeparatorValuenow;
		this.oFCL = oFactory.createFCL({
			layout: LT.ThreeColumnsBeginExpandedEndHidden,
			beginColumnPages: [new Page()],
			midColumnPages: [new Page()]
		});
		this.oFCL._onNavContainerRendered({srcControl: this.oFCL.getAggregation("_beginColumnNav")});
		this.oFCL._onNavContainerRendered({srcControl: this.oFCL.getAggregation("_midColumnNav")});

		iSeparatorValuenow = parseFloat(this.oFCL._oColumnSeparators.begin.get(0).getAttribute("aria-valuenow"));
		assert.ok(iSeparatorValuenow > 0, "valuenow attribute shows begin column is expanded");
		assert.ok(iSeparatorValuenow < 100, "valuenow attribute shows begin column not fully expanded");

		// act
		dragSeparator("begin", 1200, this.oFCL); // drag to expand the begin column to the max
		assertSeparatorVisibility(assert, this.oFCL, 1, 0);
		assert.equal(this.oFCL.getLayout(), LT.ThreeColumnsBeginExpandedEndHidden, "assert layout is as expected");

		// check
		iSeparatorValuenow = parseFloat(this.oFCL._oColumnSeparators.begin.get(0).getAttribute("aria-valuenow"));
		assert.strictEqual(iSeparatorValuenow, 100.00, "valuenow attribute shows begin column is expanded to the max");
	});

	QUnit.test("end separator in three-column layouts", function (assert) {
		var iSeparatorValuenow;
		this.oFCL = oFactory.createFCL({
			layout: LT.ThreeColumnsMidExpandedEndHidden,
			beginColumnPages: [new Page()],
			midColumnPages: [new Page()]
		});
		this.oFCL._onNavContainerRendered({srcControl: this.oFCL.getAggregation("_beginColumnNav")});
		this.oFCL._onNavContainerRendered({srcControl: this.oFCL.getAggregation("_midColumnNav")});

		iSeparatorValuenow = parseFloat(this.oFCL._oColumnSeparators.end.get(0).getAttribute("aria-valuenow"));
		assert.strictEqual(iSeparatorValuenow, 100.00, "valuenow attribute shows mid column is fully expanded");

		// act
		dragSeparator("end", -10, this.oFCL); // drag to expand the end column slightly
		assertSeparatorVisibility(assert, this.oFCL, 1, 1);
		assert.equal(this.oFCL.getLayout(), LT.ThreeColumnsMidExpanded, "assert setup is as expected");

		// check
		iSeparatorValuenow = parseFloat(this.oFCL._oColumnSeparators.end.get(0).getAttribute("aria-valuenow"));
		assert.ok(iSeparatorValuenow > 0, "valuenow attribute shows mid column is expanded");
		assert.ok(iSeparatorValuenow < 100, "valuenow attribute shows mid column not fully expanded");
	});

	QUnit.test("end separator min value in three-column layouts", function (assert) {
		var iSeparatorValuenow;
		this.oFCL = oFactory.createFCL({
			layout: LT.ThreeColumnsEndExpanded,
			beginColumnPages: [new Page()],
			midColumnPages: [new Page()]
		});
		this.oFCL._onNavContainerRendered({srcControl: this.oFCL.getAggregation("_beginColumnNav")});
		this.oFCL._onNavContainerRendered({srcControl: this.oFCL.getAggregation("_midColumnNav")});

		iSeparatorValuenow = parseFloat(this.oFCL._oColumnSeparators.end.get(0).getAttribute("aria-valuenow"));
		assert.ok(iSeparatorValuenow > 0, "valuenow attribute shows mid column is expanded");
		assert.ok(iSeparatorValuenow < 100, "valuenow attribute shows mid column not fully expanded");

		// act
		dragSeparator("end", -1000, this.oFCL); // drag to shrink the mid column to the min
		assertSeparatorVisibility(assert, this.oFCL, 0, 1);
		assert.equal(this.oFCL.getLayout(), LT.ThreeColumnsEndExpanded, "assert setup is as expected");

		// check
		iSeparatorValuenow = parseFloat(this.oFCL._oColumnSeparators.end.get(0).getAttribute("aria-valuenow"));
		assert.strictEqual(iSeparatorValuenow, 0.00, "valuenow attribute shows mid column is shrinked to the min");
	});
});
