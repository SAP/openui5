(function ($, QUnit, sinon, FlexibleColumnLayout, Page, Button, bDebugMode) {
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

	QUnit.test("Constructor - 1 column", function (assert) {

		this.oFCL = oFactory.createFCL();
		assertColumnsVisibility(assert, this.oFCL, 1, 0, 0);
	});

	QUnit.test("Constructor - 2 columns", function (assert) {

		this.oFCL = oFactory.createFCL({
			showMidColumn: true
		});
		assertColumnsVisibility(assert, this.oFCL, 1, 1, 0);
	});

	QUnit.test("Constructor - 2 columns and begin column is in fullscreen", function (assert) {

		this.oFCL = oFactory.createFCL({
			showMidColumn: true,
			fullScreenColumn: sap.f.FlexibleColumn.Begin
		});
		assertColumnsVisibility(assert, this.oFCL, 1, 0, 0);
	});

	QUnit.test("Constructor - 2 columns and mid column is in fullscreen", function (assert) {

		this.oFCL = oFactory.createFCL({
			showMidColumn: true,
			fullScreenColumn: sap.f.FlexibleColumn.Mid
		});
		assertColumnsVisibility(assert, this.oFCL, 0, 1, 0);
	});

	QUnit.test("Constructor - 3 columns", function (assert) {

		this.oFCL = oFactory.createFCL({
			showMidColumn: true,
			showEndColumn: true
		});
		assertColumnsVisibility(assert, this.oFCL, 1, 1, 1);
	});

	QUnit.test("Constructor - 3 columns and begin column is in fullscreen", function (assert) {

		this.oFCL = oFactory.createFCL({
			showMidColumn: true,
			showEndColumn: true,
			fullScreenColumn: sap.f.FlexibleColumn.Begin
		});
		assertColumnsVisibility(assert, this.oFCL, 1, 0, 0);
	});

	QUnit.test("Constructor - 3 columns and mid column is in fullscreen", function (assert) {

		this.oFCL = oFactory.createFCL({
			showMidColumn: true,
			showEndColumn: true,
			fullScreenColumn: sap.f.FlexibleColumn.Mid
		});
		assertColumnsVisibility(assert, this.oFCL, 0, 1, 0);
	});

	QUnit.test("Constructor - 3 columns and end column is in fullscreen", function (assert) {

		this.oFCL = oFactory.createFCL({
			showMidColumn: true,
			showEndColumn: true,
			fullScreenColumn: sap.f.FlexibleColumn.End
		});
		assertColumnsVisibility(assert, this.oFCL, 0, 0, 1);
	});

	QUnit.test("API call - showMidColumn", function (assert) {
		this.clock = sinon.useFakeTimers();

		this.oFCL = oFactory.createFCL();

		// Show the mid column
		this.oFCL.setShowMidColumn(true);
		this.clock.tick(sap.f.FlexibleColumnLayout.ADJUST_LAYOUT_TIMEOUT);
		assertColumnsVisibility(assert, this.oFCL, 1, 1, 0);

		// Hide the mid column
		this.oFCL.setShowMidColumn(false);
		this.clock.tick(sap.f.FlexibleColumnLayout.ADJUST_LAYOUT_TIMEOUT);
		assertColumnsVisibility(assert, this.oFCL, 1, 0, 0);

		this.clock.restore();
	});

	QUnit.test("API call - showEndColumn", function (assert) {
		this.clock = sinon.useFakeTimers();

		this.oFCL = oFactory.createFCL({
			showMidColumn: true
		});

		// Show the end column
		this.oFCL.setShowEndColumn(true);
		this.clock.tick(sap.f.FlexibleColumnLayout.ADJUST_LAYOUT_TIMEOUT);
		assertColumnsVisibility(assert, this.oFCL, 1, 1, 1);

		// Hide the end column
		this.oFCL.setShowEndColumn(false);
		this.clock.tick(sap.f.FlexibleColumnLayout.ADJUST_LAYOUT_TIMEOUT);
		assertColumnsVisibility(assert, this.oFCL, 1, 1, 0);

		this.clock.restore();
	});

	QUnit.test("API call - showEndColumn and showMidColumn interaction", function (assert) {
		this.clock = sinon.useFakeTimers();

		this.oFCL = oFactory.createFCL();

		// Show the end column (without showing the mid column first)
		this.oFCL.setShowEndColumn(true);
		this.clock.tick(sap.f.FlexibleColumnLayout.ADJUST_LAYOUT_TIMEOUT);
		assertColumnsVisibility(assert, this.oFCL, 1, 0, 0);

		// Now show the mid column
		this.oFCL.setShowMidColumn(true);
		this.clock.tick(sap.f.FlexibleColumnLayout.ADJUST_LAYOUT_TIMEOUT);
		assertColumnsVisibility(assert, this.oFCL, 1, 1, 1);

		// Hide the mid column again
		this.oFCL.setShowMidColumn(false);
		this.clock.tick(sap.f.FlexibleColumnLayout.ADJUST_LAYOUT_TIMEOUT);
		assertColumnsVisibility(assert, this.oFCL, 1, 0, 0);

		this.clock.restore();
	});

	QUnit.test("API call - fullScreenColumn", function (assert) {
		this.clock = sinon.useFakeTimers();

		this.oFCL = oFactory.createFCL({
			showMidColumn: true,
			showEndColumn: true
		});

		// Set the begin column to fullscreen
		this.oFCL.setFullScreenColumn(sap.f.FlexibleColumn.Begin);
		this.clock.tick(sap.f.FlexibleColumnLayout.ADJUST_LAYOUT_TIMEOUT);
		assertColumnsVisibility(assert, this.oFCL, 1, 0, 0);

		// Remove fullscreen
		this.oFCL.setFullScreenColumn(sap.f.FlexibleColumn.None);
		this.clock.tick(sap.f.FlexibleColumnLayout.ADJUST_LAYOUT_TIMEOUT);
		assertColumnsVisibility(assert, this.oFCL, 1, 1, 1);

		// Set the mid column to fullscreen
		this.oFCL.setFullScreenColumn(sap.f.FlexibleColumn.Mid);
		this.clock.tick(sap.f.FlexibleColumnLayout.ADJUST_LAYOUT_TIMEOUT);
		assertColumnsVisibility(assert, this.oFCL, 0, 1, 0);

		// Set the end column to fullscreen
		this.oFCL.setFullScreenColumn(sap.f.FlexibleColumn.End);
		this.clock.tick(sap.f.FlexibleColumnLayout.ADJUST_LAYOUT_TIMEOUT);
		assertColumnsVisibility(assert, this.oFCL, 0, 0, 1);

		// Remove fullscreen again
		this.oFCL.setFullScreenColumn(sap.f.FlexibleColumn.None);
		this.clock.tick(sap.f.FlexibleColumnLayout.ADJUST_LAYOUT_TIMEOUT);
		assertColumnsVisibility(assert, this.oFCL, 1, 1, 1);

		this.clock.restore();
	});


	QUnit.test("API call - fullScreenColumn overrides showMidColumn and showEndColumn", function (assert) {
		this.clock = sinon.useFakeTimers();

		this.oFCL = oFactory.createFCL();

		// Set the mid column to fullscreen although showMidColumn is false
		this.oFCL.setFullScreenColumn(sap.f.FlexibleColumn.Mid);
		this.clock.tick(sap.f.FlexibleColumnLayout.ADJUST_LAYOUT_TIMEOUT);
		assertColumnsVisibility(assert, this.oFCL, 0, 1, 0);

		// Set the end column to fullscreen although showMidColumn and showEndColumn are both false
		this.oFCL.setFullScreenColumn(sap.f.FlexibleColumn.End);
		this.clock.tick(sap.f.FlexibleColumnLayout.ADJUST_LAYOUT_TIMEOUT);
		assertColumnsVisibility(assert, this.oFCL, 0, 0, 1);

		// Remove fullscreen again
		this.oFCL.setFullScreenColumn(sap.f.FlexibleColumn.None);
		this.clock.tick(sap.f.FlexibleColumnLayout.ADJUST_LAYOUT_TIMEOUT);
		assertColumnsVisibility(assert, this.oFCL, 1, 0, 0);

		this.clock.restore();
	});

	QUnit.test("Navigation arrows - 1 column", function (assert) {
		this.oFCL = oFactory.createFCL();
		assertArrowsVisibility(assert, this.oFCL, 0, 0, 0, 0);
	});

	QUnit.test("Navigation arrows - 2 columns", function (assert) {
		this.oFCL = oFactory.createFCL({
			showMidColumn: true
		});
		assertArrowsVisibility(assert, this.oFCL, 1, 0, 0, 0);
	});

	QUnit.test("Navigation arrows - 2 columns operations", function (assert) {
		this.oFCL = oFactory.createFCL({
			showMidColumn: true
		});

		this.getBeginColumnBackArrow().firePress();
		assertArrowsVisibility(assert, this.oFCL, 0, 0, 1, 0);

		this.getMidColumnForwardArrow().firePress();
		assertArrowsVisibility(assert, this.oFCL, 1, 0, 0, 0);
	});

	QUnit.test("Navigation arrows - 3 columns (mid column emphasized, fixed 3-column layout)", function (assert) {
		this.oFCL = oFactory.createFCL({
			showMidColumn: true,
			showEndColumn: true,
			threeColumnLayoutType: sap.f.ThreeColumnLayoutType.MidColumnEmphasized,
			threeColumnLayoutTypeFixed: true
		});

		assertArrowsVisibility(assert, this.oFCL, 0, 0, 1, 0);
	});

	QUnit.test("Navigation arrows - 3 columns (mid column emphasized, not-fixed 3-column layout)", function (assert) {
		this.oFCL = oFactory.createFCL({
			showMidColumn: true,
			showEndColumn: true,
			threeColumnLayoutType: sap.f.ThreeColumnLayoutType.MidColumnEmphasized,
			threeColumnLayoutTypeFixed: false
		});

		assertArrowsVisibility(assert, this.oFCL, 0, 1, 1, 0);
	});

	QUnit.test("Navigation arrows - 3 columns (end column emphasized, fixed 3-column layout)", function (assert) {
		this.oFCL = oFactory.createFCL({
			showMidColumn: true,
			showEndColumn: true,
			threeColumnLayoutType: sap.f.ThreeColumnLayoutType.EndColumnEmphasized,
			threeColumnLayoutTypeFixed: true
		});

		assertArrowsVisibility(assert, this.oFCL, 0, 0, 0, 1);
	});

	QUnit.test("Navigation arrows - 3 columns (end column emphasized, not-fixed 3-column layout)", function (assert) {
		this.oFCL = oFactory.createFCL({
			showMidColumn: true,
			showEndColumn: true,
			threeColumnLayoutType: sap.f.ThreeColumnLayoutType.EndColumnEmphasized,
			threeColumnLayoutTypeFixed: false
		});

		assertArrowsVisibility(assert, this.oFCL, 0, 0, 0, 1);
	});

	QUnit.test("Navigation arrows - 3 columns operation (fixed 3-column layout)", function (assert) {
		this.oFCL = oFactory.createFCL({
			showMidColumn: true,
			showEndColumn: true,
			threeColumnLayoutType: sap.f.ThreeColumnLayoutType.MidColumnEmphasized,
			threeColumnLayoutTypeFixed: true
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
		assertArrowsVisibility(assert, this.oFCL, 0, 0, 1, 0);
		assertColumnsVisibility(assert, this.oFCL, 1, 1, 1); // End column is back
	});


	QUnit.test("Navigation arrows - 3 columns operation (not-fixed 3-column layout)", function (assert) {
		this.oFCL = oFactory.createFCL({
			showMidColumn: true,
			showEndColumn: true,
			threeColumnLayoutType: sap.f.ThreeColumnLayoutType.MidColumnEmphasized,
			threeColumnLayoutTypeFixed: false
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

	QUnit.test("twoColumnLayoutOnDesktop forces 2 columns even on desktop", function (assert) {
		this.oFCL = oFactory.createFCL({
			showMidColumn: true,
			showEndColumn: true,
			twoColumnLayoutOnDesktop: true
		});

		assertColumnsVisibility(assert, this.oFCL, 0, 1, 1);
		assert.ok(this.oFCL._getMaxColumnsCount() === 2, "Despite the desktop size the maximum number of columns is 2");
	});

	QUnit.test("Setting twoColumnLayoutOnDesktop triggers a layout change", function (assert) {
		this.clock = sinon.useFakeTimers();

		this.oFCL = oFactory.createFCL({
			showMidColumn: true,
			showEndColumn: true
		});

		assertColumnsVisibility(assert, this.oFCL, 1, 1, 1);

		this.oFCL.setTwoColumnLayoutOnDesktop(true);
		this.clock.tick(sap.f.FlexibleColumnLayout.ADJUST_LAYOUT_TIMEOUT);

		assertColumnsVisibility(assert, this.oFCL, 0, 1, 1);
		assert.equal(this.oFCL._getMaxColumnsCount(), 2, "Despite the desktop size the maximum number of columns is 2");

		this.clock.restore();
	});

	QUnit.test("Resizing the control triggers a layout change", function (assert) {
		this.clock = sinon.useFakeTimers();

		this.oFCL = oFactory.createFCL({
			showMidColumn: true,
			showEndColumn: true
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

	QUnit.test("API call - setLayout", function (assert) {
		this.oFCL = oFactory.createFCL({
			showMidColumn: true,
			showEndColumn: true
		});

		// using a valid config
		this.oFCL.setLayout({beginColumnWidth: 67, midColumnWidth: 33, endColumnWidth: 0});
		assertColumnsVisibility(assert, this.oFCL, 1, 1, 0);
		assert.ok(this.oFCL._sLayout === "67/33/0", "The new layout is correctly set");

		// using an invalid input
		this.oFCL.setLayout("INVALID INPUT");
		assertColumnsVisibility(assert, this.oFCL, 1, 1, 1);
		assert.ok(this.oFCL._sLayout === "25/50/25", "On invalid input we fallback to the default value");

		// using a valid config again
		this.oFCL.setLayout({beginColumnWidth: 33, midColumnWidth: 67, endColumnWidth: 0});
		assertColumnsVisibility(assert, this.oFCL, 1, 1, 0);
		assert.ok(this.oFCL._sLayout === "33/67/0", "The new layout is correctly set");
	});


	QUnit.test("API call - setLayout works with asynchronous property setters", function (assert) {
		this.oFCL = oFactory.createFCL({
			threeColumnLayoutTypeFixed: false
		});

		// using a valid config
		this.oFCL.setShowMidColumn(true);
		this.oFCL.setShowEndColumn(true);
		this.oFCL.setLayout({beginColumnWidth: 25, midColumnWidth: 25, endColumnWidth: 50});

		assertColumnsVisibility(assert, this.oFCL, 1, 1, 1);
		assert.equal(this.oFCL._sLayout, "25/25/50", "The new layout is correctly set");
	});

	QUnit.test("layoutChange event is fired on the first load", function (assert) {

		this.oFCL = new FlexibleColumnLayout();
		var oEventSpy = this.spy(this.oFCL, "fireLayoutChange");

		this.oFCL.placeAt(sQUnitFixture);
		oCore.applyChanges();

		assert.ok(oEventSpy.called, "Layout change event fired");
	});

	QUnit.test("layoutChange event is fired on API calls that change the layout", function (assert) {
		this.clock = sinon.useFakeTimers();

		this.oFCL = oFactory.createFCL();
		var oEventSpy = this.spy(this.oFCL, "fireLayoutChange");

		// Should be fired when the API causes a layout change
		this.oFCL.setShowMidColumn(true);
		this.clock.tick(sap.f.FlexibleColumnLayout.ADJUST_LAYOUT_TIMEOUT);
		assert.ok(oEventSpy.called, "Layout change event fired");

		this.clock.restore();
	});

	QUnit.test("layoutChange event is fired on resize", function (assert) {
		this.clock = sinon.useFakeTimers();

		this.oFCL = oFactory.createFCL({
			showMidColumn: true,
			showEndColumn: true
		});
		var oEventSpy = this.spy(this.oFCL, "fireLayoutChange");

		// Should be fired when a resize causes a layout change
		$("#" + sQUnitFixture).width(TABLET_SIZE);
		this.clock.tick(ANIMATION_WAIT_TIME);
		assert.ok(oEventSpy.called, "Layout change event fired");

		this.clock.restore();
	});

	QUnit.test("layoutChange event is fired on navigation arrow click", function (assert) {
		this.clock = sinon.useFakeTimers();

		this.oFCL = oFactory.createFCL({
			showMidColumn: true,
			showEndColumn: true
		});
		var oEventSpy = this.spy(this.oFCL, "fireLayoutChange");

		this.getMidColumnForwardArrow().firePress();
		assert.ok(oEventSpy.called, "Layout change event fired");

		this.clock.restore();
	});

	QUnit.test("layoutChange event is fired on setLayout calls", function (assert) {
		this.clock = sinon.useFakeTimers();

		this.oFCL = oFactory.createFCL({
			showMidColumn: true,
			showEndColumn: true
		});
		var oEventSpy = this.spy(this.oFCL, "fireLayoutChange");

		this.oFCL.setLayout({beginColumnWidth: 67, midColumnWidth: 33, endColumnWidth: 0});
		assert.ok(oEventSpy.called, "Layout change event fired");

		this.clock.restore();
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

	QUnit.test("Constructor - 3 columns", function (assert) {

		this.oFCL = oFactory.createFCL({
			showMidColumn: true,
			showEndColumn: true
		});
		assertColumnsVisibility(assert, this.oFCL, 0, 1, 1);
	});


	QUnit.test("API call - showMidColumn", function (assert) {
		this.clock = sinon.useFakeTimers();

		this.oFCL = oFactory.createFCL();

		// Show the mid column
		this.oFCL.setShowMidColumn(true);
		this.clock.tick(sap.f.FlexibleColumnLayout.ADJUST_LAYOUT_TIMEOUT);
		assertColumnsVisibility(assert, this.oFCL, 1, 1, 0);

		// Hide the mid column
		this.oFCL.setShowMidColumn(false);
		this.clock.tick(sap.f.FlexibleColumnLayout.ADJUST_LAYOUT_TIMEOUT);
		assertColumnsVisibility(assert, this.oFCL, 1, 0, 0);

		this.clock.restore();
	});

	QUnit.test("API call - showEndColumn", function (assert) {
		this.clock = sinon.useFakeTimers();

		this.oFCL = oFactory.createFCL({
			showMidColumn: true
		});

		// Show the end column
		this.oFCL.setShowEndColumn(true);
		this.clock.tick(sap.f.FlexibleColumnLayout.ADJUST_LAYOUT_TIMEOUT);
		assertColumnsVisibility(assert, this.oFCL, 0, 1, 1);

		// Hide the end column
		this.oFCL.setShowEndColumn(false);
		this.clock.tick(sap.f.FlexibleColumnLayout.ADJUST_LAYOUT_TIMEOUT);
		assertColumnsVisibility(assert, this.oFCL, 1, 1, 0);

		this.clock.restore();
	});


	QUnit.test("API call - fullScreenColumn", function (assert) {
		this.clock = sinon.useFakeTimers();

		this.oFCL = oFactory.createFCL({
			showMidColumn: true,
			showEndColumn: true
		});

		// Show the begin column to fullscreen
		this.oFCL.setFullScreenColumn(sap.f.FlexibleColumn.Begin);
		this.clock.tick(sap.f.FlexibleColumnLayout.ADJUST_LAYOUT_TIMEOUT);
		assertColumnsVisibility(assert, this.oFCL, 1, 0, 0);

		// Remove fullscreen
		this.oFCL.setFullScreenColumn(sap.f.FlexibleColumn.None);
		this.clock.tick(sap.f.FlexibleColumnLayout.ADJUST_LAYOUT_TIMEOUT);
		assertColumnsVisibility(assert, this.oFCL, 0, 1, 1);

		// Show the mid column to fullscreen
		this.oFCL.setFullScreenColumn(sap.f.FlexibleColumn.Mid);
		this.clock.tick(sap.f.FlexibleColumnLayout.ADJUST_LAYOUT_TIMEOUT);
		assertColumnsVisibility(assert, this.oFCL, 0, 1, 0);

		// Show the end column to fullscreen
		this.oFCL.setFullScreenColumn(sap.f.FlexibleColumn.End);
		this.clock.tick(sap.f.FlexibleColumnLayout.ADJUST_LAYOUT_TIMEOUT);
		assertColumnsVisibility(assert, this.oFCL, 0, 0, 1);

		// Remove fullscreen again
		this.oFCL.setFullScreenColumn(sap.f.FlexibleColumn.None);
		this.clock.tick(sap.f.FlexibleColumnLayout.ADJUST_LAYOUT_TIMEOUT);
		assertColumnsVisibility(assert, this.oFCL, 0, 1, 1);

		this.clock.restore();
	});

	QUnit.test("Navigation arrows - 2 columns", function (assert) {
		this.oFCL = oFactory.createFCL({
			showMidColumn: true
		});
		assertArrowsVisibility(assert, this.oFCL, 0, 1, 0, 0);
	});

	QUnit.test("Navigation arrows - 2 columns operations", function (assert) {
		this.oFCL = oFactory.createFCL({
			showMidColumn: true
		});

		this.getMidColumnBackArrow().firePress();
		assertArrowsVisibility(assert, this.oFCL, 0, 0, 1, 0);

		this.getMidColumnForwardArrow().firePress();
		assertArrowsVisibility(assert, this.oFCL, 0, 1, 0, 0);
	});

	QUnit.test("Navigation arrows - 3 columns", function (assert) {
		this.oFCL = oFactory.createFCL({
			showMidColumn: true,
			showEndColumn: true
		});

		assertArrowsVisibility(assert, this.oFCL, 0, 0, 1, 0);
	});

	QUnit.test("Navigation arrows - 3 columns operation", function (assert) {
		this.oFCL = oFactory.createFCL({
			showMidColumn: true,
			showEndColumn: true
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
		assertArrowsVisibility(assert, this.oFCL, 0, 0, 1, 0);
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

	QUnit.test("Constructor - 1 column", function (assert) {

		this.oFCL = oFactory.createFCL();
		assertColumnsVisibility(assert, this.oFCL, 1, 0, 0);
		assertArrowsVisibility(assert, this.oFCL, 0, 0, 0, 0);
	});

	QUnit.test("Constructor - 2 columns", function (assert) {

		this.oFCL = oFactory.createFCL({
			showMidColumn: true
		});
		assertColumnsVisibility(assert, this.oFCL, 0, 1, 0);
		assertArrowsVisibility(assert, this.oFCL, 0, 0, 0, 0);
	});

	QUnit.test("Constructor - 3 columns", function (assert) {

		this.oFCL = oFactory.createFCL({
			showMidColumn: true,
			showEndColumn: true
		});
		assertColumnsVisibility(assert, this.oFCL, 0, 0, 1);
		assertArrowsVisibility(assert, this.oFCL, 0, 0, 0, 0);
	});

	QUnit.test("API call - showMidColumn", function (assert) {
		this.clock = sinon.useFakeTimers();

		this.oFCL = oFactory.createFCL();

		// Show the mid column
		this.oFCL.setShowMidColumn(true);
		this.clock.tick(sap.f.FlexibleColumnLayout.ADJUST_LAYOUT_TIMEOUT);
		assertColumnsVisibility(assert, this.oFCL, 0, 1, 0);

		// Hide the mid column
		this.oFCL.setShowMidColumn(false);
		this.clock.tick(sap.f.FlexibleColumnLayout.ADJUST_LAYOUT_TIMEOUT);
		assertColumnsVisibility(assert, this.oFCL, 1, 0, 0);

		this.clock.restore();
	});

	QUnit.test("API call - showEndColumn", function (assert) {
		this.clock = sinon.useFakeTimers();

		this.oFCL = oFactory.createFCL({
			showMidColumn: true
		});

		// Show the end column
		this.oFCL.setShowEndColumn(true);
		this.clock.tick(sap.f.FlexibleColumnLayout.ADJUST_LAYOUT_TIMEOUT);
		assertColumnsVisibility(assert, this.oFCL, 0, 0, 1);

		// Hide the end column
		this.oFCL.setShowEndColumn(false);
		this.clock.tick(sap.f.FlexibleColumnLayout.ADJUST_LAYOUT_TIMEOUT);
		assertColumnsVisibility(assert, this.oFCL, 0, 1, 0);

		this.clock.restore();
	});


	QUnit.test("API call - fullScreenColumn", function (assert) {
		this.clock = sinon.useFakeTimers();

		this.oFCL = oFactory.createFCL({
			showMidColumn: true,
			showEndColumn: true
		});

		// Show the begin column to fullscreen
		this.oFCL.setFullScreenColumn(sap.f.FlexibleColumn.Begin);
		this.clock.tick(sap.f.FlexibleColumnLayout.ADJUST_LAYOUT_TIMEOUT);
		assertColumnsVisibility(assert, this.oFCL, 1, 0, 0);

		// Remove fullscreen
		this.oFCL.setFullScreenColumn(sap.f.FlexibleColumn.None);
		this.clock.tick(sap.f.FlexibleColumnLayout.ADJUST_LAYOUT_TIMEOUT);
		assertColumnsVisibility(assert, this.oFCL, 0, 0, 1);

		// Show the mid column to fullscreen
		this.oFCL.setFullScreenColumn(sap.f.FlexibleColumn.Mid);
		this.clock.tick(sap.f.FlexibleColumnLayout.ADJUST_LAYOUT_TIMEOUT);
		assertColumnsVisibility(assert, this.oFCL, 0, 1, 0);

		// Show the end column to fullscreen
		this.oFCL.setFullScreenColumn(sap.f.FlexibleColumn.End);
		this.clock.tick(sap.f.FlexibleColumnLayout.ADJUST_LAYOUT_TIMEOUT);
		assertColumnsVisibility(assert, this.oFCL, 0, 0, 1);

		// Remove fullscreen again
		this.oFCL.setFullScreenColumn(sap.f.FlexibleColumn.None);
		this.clock.tick(sap.f.FlexibleColumnLayout.ADJUST_LAYOUT_TIMEOUT);
		assertColumnsVisibility(assert, this.oFCL, 0, 0, 1);

		this.clock.restore();
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


}(jQuery, QUnit, sinon, sap.f.FlexibleColumnLayout, sap.m.Page, sap.m.Button, false));