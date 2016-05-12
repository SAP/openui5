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

	var fnCreateFCL = function (oBegin, oMid, oEnd, sFullScreen) {
		var oFCL = new FlexibleColumnLayout({
			beginColumn: oBegin,
			midColumn: oMid,
			endColumn: oEnd,
			fullScreenColumn: sFullScreen
		});
		oFCL.placeAt(sQUnitFixture);
		oCore.applyChanges();
		return oFCL;
	};

	var oFactory = {
		createPage: fnCreatePage,
		createFCL: fnCreateFCL
	};

	QUnit.module("Instantiation & API", {
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
			if (!this.bSuppressDestroy) { // This is a flag used for debugging a particular test
				$("#" + sQUnitFixture).width("auto");
				this.oFCL.destroy();
			}
		}
	});

	QUnit.test("Instantiation", function (assert) {
		this.oFCL = oFactory.createFCL();

		assert.ok(this.oFCL, "Instantiated successfully");
		assert.ok(this.oFCL.$().length, "In the DOM");
	});

	QUnit.test("Constructor - 1 column", function (assert) {
		var oBeginPage = oFactory.createPage("begin");
		this.oFCL = oFactory.createFCL(oBeginPage);

		assert.ok(oBeginPage.$().width() > 0, "The begin page is visible");
	});

	QUnit.test("Constructor - 2 columns", function (assert) {
		var oBeginPage = oFactory.createPage("begin");
		var oMidPage = oFactory.createPage("mid");
		this.oFCL = oFactory.createFCL(oBeginPage, oMidPage);

		assert.ok(oBeginPage.$().width() > 0, "The begin page is visible");
		assert.ok(oMidPage.$().width() > 0, "The mid page is visible");
	});

	QUnit.test("Constructor - 3 columns", function (assert) {
		var oBeginPage = oFactory.createPage("begin");
		var oMidPage = oFactory.createPage("mid");
		var oEndPage = oFactory.createPage("end");
		this.oFCL = oFactory.createFCL(oBeginPage, oMidPage, oEndPage);

		assert.ok(oBeginPage.$().width() > 0, "The begin page is visible");
		assert.ok(oMidPage.$().width() > 0, "The mid page is visible");
		assert.ok(oEndPage.$().width() > 0, "The end page is visible");
	});

	QUnit.test("Constructor - 3 columns and fullscreen", function (assert) {
		var oBeginPage = oFactory.createPage("begin");
		var oMidPage = oFactory.createPage("mid");
		var oEndPage = oFactory.createPage("end");
		this.oFCL = oFactory.createFCL(oBeginPage, oMidPage, oEndPage, "mid");

		assert.ok(oBeginPage.$().width() === 0, "The begin page is not visible");
		assert.ok(oMidPage.$().width() > 0, "The mid page is visible");
		assert.ok(oEndPage.$().width() === 0, "The end page is not visible");
	});

	QUnit.test("API call - begin column", function (assert) {

		var oBeginPage = oFactory.createPage("begin");

		this.oFCL = oFactory.createFCL();

		// Add first column
		this.oFCL.setBeginColumn(oBeginPage);

		assert.ok(oBeginPage.$().width() > 0, "The begin page is visible");
	});

	QUnit.test("API call - mid column", function (assert) {

		var oBeginPage = oFactory.createPage("begin");
		var oMidPage = oFactory.createPage("mid");

		this.oFCL = oFactory.createFCL();

		// Add first column
		this.oFCL.setBeginColumn(oBeginPage);

		// Add second column
		this.oFCL.setMidColumn(oMidPage);

		assert.ok(oBeginPage.$().width() > 0, "The begin page is visible");
		assert.ok(oMidPage.$().width() > 0, "The mid page is visible");
	});

	QUnit.test("API call - end column", function (assert) {

		var oBeginPage = oFactory.createPage("begin");
		var oMidPage = oFactory.createPage("mid");
		var oEndPage = oFactory.createPage("end");

		this.oFCL = oFactory.createFCL();

		// Add first column
		this.oFCL.setBeginColumn(oBeginPage);

		// Add second column
		this.oFCL.setMidColumn(oMidPage);

		// Add end column
		this.oFCL.setEndColumn(oEndPage);

		assert.ok(oBeginPage.$().width() > 0, "The begin page is visible");
		assert.ok(oMidPage.$().width() > 0, "The mid page is visible");
		assert.ok(oEndPage.$().width() > 0, "The end page is visible");
	});

	QUnit.test("API calls - full screen", function (assert) {

		var oBeginPage = oFactory.createPage("begin");
		var oMidPage = oFactory.createPage("mid");
		var oEndPage = oFactory.createPage("end");
		this.oFCL = oFactory.createFCL(oBeginPage, oMidPage, oEndPage);

		// Initially all columns are visible
		assert.ok(oBeginPage.$().width() > 0, "The begin page is visible");
		assert.ok(oMidPage.$().width() > 0, "The mid page is visible");
		assert.ok(oEndPage.$().width() > 0, "The end page is visible");

		// Set the first column to full screen
		this.oFCL.setFullScreenColumn("begin");
		assert.ok(oBeginPage.$().width() > 0, "The begin page is visible");
		assert.ok(oMidPage.$().width() === 0, "The mid page is not visible");
		assert.ok(oEndPage.$().width() === 0, "The end page is not visible");

		// Set the second column to full screen
		this.oFCL.setFullScreenColumn("mid");
		assert.ok(oBeginPage.$().width() === 0, "The begin page is not visible");
		assert.ok(oMidPage.$().width() > 0, "The mid page is visible");
		assert.ok(oEndPage.$().width() === 0, "The end page is not visible");

		// Set the last column to full screen
		this.oFCL.setFullScreenColumn("end");
		assert.ok(oBeginPage.$().width() === 0, "The begin page is not visible");
		assert.ok(oMidPage.$().width() === 0, "The mid page is not visible");
		assert.ok(oEndPage.$().width() > 0, "The end page is visible");

		// Remove full screen
		this.oFCL.setFullScreenColumn(null);
		assert.ok(oBeginPage.$().width() > 0, "The begin page is visible");
		assert.ok(oMidPage.$().width() > 0, "The mid page is visible");
		assert.ok(oEndPage.$().width() > 0, "The end page is visible");
	});

	QUnit.test("Navigation arrows - 2 columns visibility", function (assert) {
		var oBeginPage = oFactory.createPage("begin");
		var oMidPage = oFactory.createPage("mid");
		this.oFCL = oFactory.createFCL(oBeginPage, oMidPage);

		// Only the first arrow is visible
		assert.ok(this.getBeginColumnBackArrow().$().is(":visible"), "The _beginColumnBackArrow is visible");
		assert.ok(!this.getMidColumnBackArrow().$().is(":visible"), "The _midColumnBackArrow is not visible");
		assert.ok(!this.getMidColumnForwardArrow().$().is(":visible"), "The _midColumnForwardArrow is not visible");
		assert.ok(!this.getEndColumnForwardArrow().$().is(":visible"), "The _endColumnForwardArrow is not visible");
	});

	QUnit.test("Navigation arrows - 2 columns operation", function (assert) {
		var oBeginPage = oFactory.createPage("begin");
		var oMidPage = oFactory.createPage("mid");
		this.oFCL = oFactory.createFCL(oBeginPage, oMidPage);

		this.getBeginColumnBackArrow().firePress();
		assert.ok(!this.getBeginColumnBackArrow().$().is(":visible"), "The _beginColumnBackArrow is not visible");
		assert.ok(!this.getMidColumnBackArrow().$().is(":visible"), "The _midColumnBackArrow is not visible");
		assert.ok(this.getMidColumnForwardArrow().$().is(":visible"), "The _midColumnForwardArrow is visible");
		assert.ok(!this.getEndColumnForwardArrow().$().is(":visible"), "The _endColumnForwardArrow is not visible");

		this.getMidColumnForwardArrow().firePress();
		assert.ok(this.getBeginColumnBackArrow().$().is(":visible"), "The _beginColumnBackArrow is visible");
		assert.ok(!this.getMidColumnBackArrow().$().is(":visible"), "The _midColumnBackArrow is not visible");
		assert.ok(!this.getMidColumnForwardArrow().$().is(":visible"), "The _midColumnForwardArrow is not visible");
		assert.ok(!this.getEndColumnForwardArrow().$().is(":visible"), "The _endColumnForwardArrow is not visible");

	});

	QUnit.test("Navigation arrows - 3 columns visibility (mid column emphasized, fixed 3-column layout)", function (assert) {
		var oBeginPage = oFactory.createPage("begin");
		var oMidPage = oFactory.createPage("mid");
		var oEndPage = oFactory.createPage("end");

		this.oFCL = new FlexibleColumnLayout({
			beginColumn: oBeginPage,
			midColumn: oMidPage,
			endColumn: oEndPage,
			threeColumnLayoutType: sap.m.ThreeColumnLayoutType.MidColumnEmphasized,
			threeColumnLayoutTypeFixed: true
		});
		this.oFCL.placeAt(sQUnitFixture);
		oCore.applyChanges();

		// Only the first arrow is visible
		assert.ok(!this.getBeginColumnBackArrow().$().is(":visible"), "The _beginColumnBackArrow is not visible");
		assert.ok(!this.getMidColumnBackArrow().$().is(":visible"), "The _midColumnBackArrow is not visible");
		assert.ok(this.getMidColumnForwardArrow().$().is(":visible"), "The _midColumnForwardArrow is visible");
		assert.ok(!this.getEndColumnForwardArrow().$().is(":visible"), "The _endColumnForwardArrow is not visible");
	});

	QUnit.test("Navigation arrows - 3 columns visibility (mid column emphasized, not-fixed 3-column layout)", function (assert) {
		var oBeginPage = oFactory.createPage("begin");
		var oMidPage = oFactory.createPage("mid");
		var oEndPage = oFactory.createPage("end");

		this.oFCL = new FlexibleColumnLayout({
			beginColumn: oBeginPage,
			midColumn: oMidPage,
			endColumn: oEndPage,
			threeColumnLayoutType: sap.m.ThreeColumnLayoutType.MidColumnEmphasized,
			threeColumnLayoutTypeFixed: false
		});
		this.oFCL.placeAt(sQUnitFixture);
		oCore.applyChanges();

		// Only the first arrow is visible
		assert.ok(!this.getBeginColumnBackArrow().$().is(":visible"), "The _beginColumnBackArrow is not visible");
		assert.ok(this.getMidColumnBackArrow().$().is(":visible"), "The _midColumnBackArrow is visible");
		assert.ok(this.getMidColumnForwardArrow().$().is(":visible"), "The _midColumnForwardArrow is visible");
		assert.ok(!this.getEndColumnForwardArrow().$().is(":visible"), "The _endColumnForwardArrow is not visible");
	});

	QUnit.test("Navigation arrows - 3 columns visibility (end column emphasized, fixed 3-column layout)", function (assert) {
		var oBeginPage = oFactory.createPage("begin");
		var oMidPage = oFactory.createPage("mid");
		var oEndPage = oFactory.createPage("end");

		this.oFCL = new FlexibleColumnLayout({
			beginColumn: oBeginPage,
			midColumn: oMidPage,
			endColumn: oEndPage,
			threeColumnLayoutType: sap.m.ThreeColumnLayoutType.EndColumnEmphasized,
			threeColumnLayoutTypeFixed: true
		});
		this.oFCL.placeAt(sQUnitFixture);
		oCore.applyChanges();

		// Only the first arrow is visible
		assert.ok(!this.getBeginColumnBackArrow().$().is(":visible"), "The _beginColumnBackArrow is not visible");
		assert.ok(!this.getMidColumnBackArrow().$().is(":visible"), "The _midColumnBackArrow is not visible");
		assert.ok(!this.getMidColumnForwardArrow().$().is(":visible"), "The _midColumnForwardArrow is not visible");
		assert.ok(this.getEndColumnForwardArrow().$().is(":visible"), "The _endColumnForwardArrow is visible");

	});

	QUnit.test("Navigation arrows - 3 columns visibility (end column emphasized, not-fixed 3-column layout)", function (assert) {
		var oBeginPage = oFactory.createPage("begin");
		var oMidPage = oFactory.createPage("mid");
		var oEndPage = oFactory.createPage("end");

		this.oFCL = new FlexibleColumnLayout({
			beginColumn: oBeginPage,
			midColumn: oMidPage,
			endColumn: oEndPage,
			threeColumnLayoutType: sap.m.ThreeColumnLayoutType.EndColumnEmphasized,
			threeColumnLayoutTypeFixed: false
		});
		this.oFCL.placeAt(sQUnitFixture);
		oCore.applyChanges();

		// Only the first arrow is visible
		assert.ok(!this.getBeginColumnBackArrow().$().is(":visible"), "The _beginColumnBackArrow is not visible");
		assert.ok(!this.getMidColumnBackArrow().$().is(":visible"), "The _midColumnBackArrow is not visible");
		assert.ok(!this.getMidColumnForwardArrow().$().is(":visible"), "The _midColumnForwardArrow is not visible");
		assert.ok(this.getEndColumnForwardArrow().$().is(":visible"), "The _endColumnForwardArrow is visible");
	});

	QUnit.test("Navigation arrows - 3 columns operation (fixed 3-column layout)", function (assert) {
		var oBeginPage = oFactory.createPage("begin");
		var oMidPage = oFactory.createPage("mid");
		var oEndPage = oFactory.createPage("end");

		this.oFCL = new FlexibleColumnLayout({
			beginColumn: oBeginPage,
			midColumn: oMidPage,
			endColumn: oEndPage,
			threeColumnLayoutType: sap.m.ThreeColumnLayoutType.MidColumnEmphasized,
			threeColumnLayoutTypeFixed: true
		});
		this.oFCL.placeAt(sQUnitFixture);
		oCore.applyChanges();

		this.getMidColumnForwardArrow().firePress();
		assert.ok(!this.getBeginColumnBackArrow().$().is(":visible"), "The _beginColumnBackArrow is not visible");
		assert.ok(this.getMidColumnBackArrow().$().is(":visible"), "The _midColumnBackArrow is visible");
		assert.ok(this.getMidColumnForwardArrow().$().is(":visible"), "The _midColumnForwardArrow is visible");
		assert.ok(!this.getEndColumnForwardArrow().$().is(":visible"), "The _endColumnForwardArrow is not visible");
		assert.ok(oEndPage.$().width() === 0, "The end page is not visible");

		// Click it again
		this.getMidColumnForwardArrow().firePress();
		assert.ok(this.getBeginColumnBackArrow().$().is(":visible"), "The _beginColumnBackArrow is visible");
		assert.ok(!this.getMidColumnBackArrow().$().is(":visible"), "The _midColumnBackArrow is not visible");
		assert.ok(!this.getMidColumnForwardArrow().$().is(":visible"), "The _midColumnForwardArrow is not visible");
		assert.ok(!this.getEndColumnForwardArrow().$().is(":visible"), "The _endColumnForwardArrow is not visible");

		this.getBeginColumnBackArrow().firePress();
		assert.ok(!this.getBeginColumnBackArrow().$().is(":visible"), "The _beginColumnBackArrow is not visible");
		assert.ok(this.getMidColumnBackArrow().$().is(":visible"), "The _midColumnBackArrow is visible");
		assert.ok(this.getMidColumnForwardArrow().$().is(":visible"), "The _midColumnForwardArrow is visible");
		assert.ok(!this.getEndColumnForwardArrow().$().is(":visible"), "The _endColumnForwardArrow is not visible");

		this.getMidColumnBackArrow().firePress();
		assert.ok(!this.getBeginColumnBackArrow().$().is(":visible"), "The _beginColumnBackArrow is not visible");
		assert.ok(!this.getMidColumnBackArrow().$().is(":visible"), "The _midColumnBackArrow is not visible");
		assert.ok(this.getMidColumnForwardArrow().$().is(":visible"), "The _midColumnForwardArrow is visible");
		assert.ok(!this.getEndColumnForwardArrow().$().is(":visible"), "The _endColumnForwardArrow is not visible");
		assert.ok(oEndPage.$().width() > 0, "The end page is visible again");
	});

	QUnit.test("Navigation arrows - 3 columns operation (not-fixed 3-column layout)", function (assert) {
		var oBeginPage = oFactory.createPage("begin");
		var oMidPage = oFactory.createPage("mid");
		var oEndPage = oFactory.createPage("end");

		this.oFCL = new FlexibleColumnLayout({
			beginColumn: oBeginPage,
			midColumn: oMidPage,
			endColumn: oEndPage,
			threeColumnLayoutType: sap.m.ThreeColumnLayoutType.MidColumnEmphasized,
			threeColumnLayoutTypeFixed: false
		});
		this.oFCL.placeAt(sQUnitFixture);
		oCore.applyChanges();

		this.getMidColumnForwardArrow().firePress();
		assert.ok(!this.getBeginColumnBackArrow().$().is(":visible"), "The _beginColumnBackArrow is not visible");
		assert.ok(this.getMidColumnBackArrow().$().is(":visible"), "The _midColumnBackArrow is visible");
		assert.ok(this.getMidColumnForwardArrow().$().is(":visible"), "The _midColumnForwardArrow is visible");
		assert.ok(!this.getEndColumnForwardArrow().$().is(":visible"), "The _endColumnForwardArrow is not visible");
		assert.ok(oEndPage.$().width() === 0, "The end page is not visible");

		// Click it again
		this.getMidColumnForwardArrow().firePress();
		assert.ok(this.getBeginColumnBackArrow().$().is(":visible"), "The _beginColumnBackArrow is visible");
		assert.ok(!this.getMidColumnBackArrow().$().is(":visible"), "The _midColumnBackArrow is not visible");
		assert.ok(!this.getMidColumnForwardArrow().$().is(":visible"), "The _midColumnForwardArrow is not visible");
		assert.ok(!this.getEndColumnForwardArrow().$().is(":visible"), "The _endColumnForwardArrow is not visible");

		this.getBeginColumnBackArrow().firePress();
		assert.ok(!this.getBeginColumnBackArrow().$().is(":visible"), "The _beginColumnBackArrow is not visible");
		assert.ok(this.getMidColumnBackArrow().$().is(":visible"), "The _midColumnBackArrow is visible");
		assert.ok(this.getMidColumnForwardArrow().$().is(":visible"), "The _midColumnForwardArrow is visible");
		assert.ok(!this.getEndColumnForwardArrow().$().is(":visible"), "The _endColumnForwardArrow is not visible");

		this.getMidColumnBackArrow().firePress();
		assert.ok(!this.getBeginColumnBackArrow().$().is(":visible"), "The _beginColumnBackArrow is not visible");
		assert.ok(this.getMidColumnBackArrow().$().is(":visible"), "The _midColumnBackArrow is visible");
		assert.ok(this.getMidColumnForwardArrow().$().is(":visible"), "The _midColumnForwardArrow is visible");
		assert.ok(!this.getEndColumnForwardArrow().$().is(":visible"), "The _endColumnForwardArrow is not visible");
		assert.ok(oEndPage.$().width() > 0, "The end page is visible again");

		this.getMidColumnBackArrow().firePress();
		assert.ok(!this.getBeginColumnBackArrow().$().is(":visible"), "The _beginColumnBackArrow is not visible");
		assert.ok(!this.getMidColumnBackArrow().$().is(":visible"), "The _midColumnBackArrow is not visible");
		assert.ok(!this.getMidColumnForwardArrow().$().is(":visible"), "The _midColumnForwardArrow is not visible");
		assert.ok(this.getEndColumnForwardArrow().$().is(":visible"), "The _endColumnForwardArrow is visible");

		this.getEndColumnForwardArrow().firePress();
		assert.ok(!this.getBeginColumnBackArrow().$().is(":visible"), "The _beginColumnBackArrow is not visible");
		assert.ok(this.getMidColumnBackArrow().$().is(":visible"), "The _midColumnBackArrow is visible");
		assert.ok(this.getMidColumnForwardArrow().$().is(":visible"), "The _midColumnForwardArrow is visible");
		assert.ok(!this.getEndColumnForwardArrow().$().is(":visible"), "The _endColumnForwardArrow is not visible");
	});

	QUnit.test("twoColumnLayoutOnDesktop triggers tablet logic", function (assert) {
		var oBeginPage = oFactory.createPage("begin");
		var oMidPage = oFactory.createPage("mid");
		var oEndPage = oFactory.createPage("end");

		this.oFCL = new FlexibleColumnLayout({
			beginColumn: oBeginPage,
			midColumn: oMidPage,
			endColumn: oEndPage,
			twoColumnLayoutOnDesktop: true
		});

		this.oFCL.placeAt(sQUnitFixture);
		oCore.applyChanges();

		assert.ok(this.oFCL._getMaxColumns() === 2, "Despite the desktop size the maximum number of columns is 2");
		assert.ok(oBeginPage.$().width() === 0, "The begin page is not visible (as on desktop)");
	});

	QUnit.test("Resizing the control triggers a layout change", function (assert) {
		this.clock = sinon.useFakeTimers();

		var oBeginPage = oFactory.createPage("begin");
		var oMidPage = oFactory.createPage("mid");
		var oEndPage = oFactory.createPage("end");

		this.oFCL = oFactory.createFCL(oBeginPage, oMidPage, oEndPage);
		this.clock.tick(ANIMATION_WAIT_TIME);

		$("#" + sQUnitFixture).width(TABLET_SIZE);
		this.clock.tick(ANIMATION_WAIT_TIME);

		assert.ok(oBeginPage.$().width() === 0, "The begin page is not visible");
		assert.ok(oMidPage.$().width() > 0, "The mid page is visible");
		assert.ok(oEndPage.$().width() > 0, "The end page is visible");

		$("#" + sQUnitFixture).width(PHONE_SIZE);
		this.clock.tick(ANIMATION_WAIT_TIME);

		assert.ok(oBeginPage.$().width() === 0, "The begin page is not visible");
		assert.ok(oMidPage.$().width() === 0, "The mid page is not visible");
		assert.ok(oEndPage.$().width() > 0, "The end page is visible");

		$("#" + sQUnitFixture).width(TABLET_SIZE);
		this.clock.tick(ANIMATION_WAIT_TIME);

		assert.ok(oBeginPage.$().width() === 0, "The begin page is not visible");
		assert.ok(oMidPage.$().width() > 0, "The mid page is visible");
		assert.ok(oEndPage.$().width() > 0, "The end page is visible");

		$("#" + sQUnitFixture).width(DESKTOP_SIZE);
		this.clock.tick(ANIMATION_WAIT_TIME);

		assert.ok(oBeginPage.$().width() > 0, "The begin page is visible");
		assert.ok(oMidPage.$().width() > 0, "The mid page is visible");
		assert.ok(oEndPage.$().width() > 0, "The end page is visible");

		this.clock.restore();
	});

	QUnit.test("Setting twoColumnLayoutOnDesktop triggers a layout change", function (assert) {
		var oBeginPage = oFactory.createPage("begin");
		var oMidPage = oFactory.createPage("mid");
		var oEndPage = oFactory.createPage("end");

		this.oFCL = new FlexibleColumnLayout({
			beginColumn: oBeginPage,
			midColumn: oMidPage,
			endColumn: oEndPage,
			twoColumnLayoutOnDesktop: false
		});

		this.oFCL.placeAt(sQUnitFixture);
		oCore.applyChanges();

		this.oFCL.setTwoColumnLayoutOnDesktop(true);

		assert.ok(this.oFCL._getMaxColumns() === 2, "Despite the desktop size the maximum number of columns is 2");
		assert.ok(oBeginPage.$().width() === 0, "The begin page is not visible (as on desktop)");
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
			if (!this.bSuppressDestroy) { // This is a flag used for debugging a particular test
				$("#" + sQUnitFixture).width("auto");
				this.oFCL.destroy();
			}
		}
	});

	QUnit.test("Constructor - 3 columns", function (assert) {

		var oBeginPage = oFactory.createPage("begin");
		var oMidPage = oFactory.createPage("mid");
		var oEndPage = oFactory.createPage("end");
		this.oFCL = oFactory.createFCL(oBeginPage, oMidPage, oEndPage);

		assert.ok(oBeginPage.$().width() === 0, "The begin page is not visible");
		assert.ok(oMidPage.$().width() > 0, "The mid page is visible");
		assert.ok(oEndPage.$().width() > 0, "The end page is visible");
	});

	QUnit.test("API call - begin column", function (assert) {

		var oBeginPage = oFactory.createPage("begin");

		this.oFCL = oFactory.createFCL();

		// Add first column
		this.oFCL.setBeginColumn(oBeginPage);

		assert.ok(oBeginPage.$().width() > 0, "The begin page is visible");
	});

	QUnit.test("API call - mid column", function (assert) {

		var oBeginPage = oFactory.createPage("begin");
		var oMidPage = oFactory.createPage("mid");

		this.oFCL = oFactory.createFCL();

		// Add first column
		this.oFCL.setBeginColumn(oBeginPage);

		// Add second column
		this.oFCL.setMidColumn(oMidPage);

		assert.ok(oBeginPage.$().width() > 0, "The begin page is visible");
		assert.ok(oMidPage.$().width() > 0, "The mid page is visible");
	});

	QUnit.test("API call - end column", function (assert) {

		var oBeginPage = oFactory.createPage("begin");
		var oMidPage = oFactory.createPage("mid");
		var oEndPage = oFactory.createPage("end");

		this.oFCL = oFactory.createFCL();

		// Add first column
		this.oFCL.setBeginColumn(oBeginPage);

		// Add second column
		this.oFCL.setMidColumn(oMidPage);

		// Add end column
		this.oFCL.setEndColumn(oEndPage);

		assert.ok(oBeginPage.$().width() === 0, "The begin page is not visible");
		assert.ok(oMidPage.$().width() > 0, "The mid page is visible");
		assert.ok(oEndPage.$().width() > 0, "The end page is visible");
	});

	QUnit.test("API calls - full screen", function (assert) {

		var oBeginPage = oFactory.createPage("begin");
		var oMidPage = oFactory.createPage("mid");
		var oEndPage = oFactory.createPage("end");
		this.oFCL = oFactory.createFCL(oBeginPage, oMidPage, oEndPage);

		// Initially second and last columns are visible
		assert.ok(oBeginPage.$().width() === 0, "The begin page is not visible");
		assert.ok(oMidPage.$().width() > 0, "The mid page is visible");
		assert.ok(oEndPage.$().width() > 0, "The end page is visible");

		// Set the first column to full screen
		this.oFCL.setFullScreenColumn("begin");
		assert.ok(oBeginPage.$().width() > 0, "The begin page is visible");
		assert.ok(oMidPage.$().width() === 0, "The mid page is not visible");
		assert.ok(oEndPage.$().width() === 0, "The end page is not visible");

		// Set the second column to full screen
		this.oFCL.setFullScreenColumn("mid");
		assert.ok(oBeginPage.$().width() === 0, "The begin page is not visible");
		assert.ok(oMidPage.$().width() > 0, "The mid page is visible");
		assert.ok(oEndPage.$().width() === 0, "The end page is not visible");

		// Set the last column to full screen
		this.oFCL.setFullScreenColumn("end");
		assert.ok(oBeginPage.$().width() === 0, "The begin page is not visible");
		assert.ok(oMidPage.$().width() === 0, "The mid page is not visible");
		assert.ok(oEndPage.$().width() > 0, "The end page is visible");

		// Remove full screen
		this.oFCL.setFullScreenColumn(null);
		assert.ok(oBeginPage.$().width() === 0, "The begin page is not visible");
		assert.ok(oMidPage.$().width() > 0, "The mid page is visible");
		assert.ok(oEndPage.$().width() > 0, "The end page is visible");
	});

	QUnit.test("Navigation arrows - 2 columns visibility", function (assert) {
		var oBeginPage = oFactory.createPage("begin");
		var oMidPage = oFactory.createPage("mid");
		this.oFCL = oFactory.createFCL(oBeginPage, oMidPage);

		assert.ok(!this.getBeginColumnBackArrow().$().is(":visible"), "The _beginColumnBackArrow is not visible");
		assert.ok(this.getMidColumnBackArrow().$().is(":visible"), "The _midColumnBackArrow is visible");
		assert.ok(!this.getMidColumnForwardArrow().$().is(":visible"), "The _midColumnForwardArrow is not visible");
		assert.ok(!this.getEndColumnForwardArrow().$().is(":visible"), "The _endColumnForwardArrow is not visible");
	});

	QUnit.test("Navigation arrows - 2 columns operation", function (assert) {
		var oBeginPage = oFactory.createPage("begin");
		var oMidPage = oFactory.createPage("mid");
		this.oFCL = oFactory.createFCL(oBeginPage, oMidPage);

		this.getMidColumnBackArrow().firePress();
		assert.ok(!this.getBeginColumnBackArrow().$().is(":visible"), "The _beginColumnBackArrow is not visible");
		assert.ok(!this.getMidColumnBackArrow().$().is(":visible"), "The _midColumnBackArrow is not visible");
		assert.ok(this.getMidColumnForwardArrow().$().is(":visible"), "The _midColumnForwardArrow is visible");
		assert.ok(!this.getEndColumnForwardArrow().$().is(":visible"), "The _endColumnForwardArrow is not visible");

		this.getMidColumnForwardArrow().firePress();
		assert.ok(!this.getBeginColumnBackArrow().$().is(":visible"), "The _beginColumnBackArrow is not visible");
		assert.ok(this.getMidColumnBackArrow().$().is(":visible"), "The _midColumnBackArrow is visible");
		assert.ok(!this.getMidColumnForwardArrow().$().is(":visible"), "The _midColumnForwardArrow is not visible");
		assert.ok(!this.getEndColumnForwardArrow().$().is(":visible"), "The _endColumnForwardArrow is not visible");
	});

	QUnit.test("Navigation arrows - 3 columns visibility", function (assert) {
		var oBeginPage = oFactory.createPage("begin");
		var oMidPage = oFactory.createPage("mid");
		var oEndPage = oFactory.createPage("end");
		this.oFCL = oFactory.createFCL(oBeginPage, oMidPage, oEndPage);

		assert.ok(!this.getBeginColumnBackArrow().$().is(":visible"), "The _beginColumnBackArrow is not visible");
		assert.ok(!this.getMidColumnBackArrow().$().is(":visible"), "The _midColumnBackArrow is not visible");
		assert.ok(this.getMidColumnForwardArrow().$().is(":visible"), "The _midColumnForwardArrow is visible");
		assert.ok(!this.getEndColumnForwardArrow().$().is(":visible"), "The _endColumnForwardArrow is not visible");
	});

	QUnit.test("Navigation arrows - 3 columns operation", function (assert) {
		var oBeginPage = oFactory.createPage("begin");
		var oMidPage = oFactory.createPage("mid");
		var oEndPage = oFactory.createPage("end");
		this.oFCL = oFactory.createFCL(oBeginPage, oMidPage, oEndPage);

		this.getMidColumnForwardArrow().firePress();
		assert.ok(!this.getBeginColumnBackArrow().$().is(":visible"), "The _beginColumnBackArrow is not visible");
		assert.ok(this.getMidColumnBackArrow().$().is(":visible"), "The _midColumnBackArrow is visible");
		assert.ok(this.getMidColumnForwardArrow().$().is(":visible"), "The _midColumnForwardArrow is visible");
		assert.ok(!this.getEndColumnForwardArrow().$().is(":visible"), "The _endColumnForwardArrow is not visible");
		assert.ok(oEndPage.$().width() === 0, "The end page is not visible");

		// Click it again
		this.getMidColumnForwardArrow().firePress();
		assert.ok(this.getBeginColumnBackArrow().$().is(":visible"), "The _beginColumnBackArrow not visible");
		assert.ok(!this.getMidColumnBackArrow().$().is(":visible"), "The _midColumnBackArrow is not visible");
		assert.ok(!this.getMidColumnForwardArrow().$().is(":visible"), "The _midColumnForwardArrow is not visible");
		assert.ok(!this.getEndColumnForwardArrow().$().is(":visible"), "The _endColumnForwardArrow is not visible");

		this.getBeginColumnBackArrow().firePress();
		assert.ok(!this.getBeginColumnBackArrow().$().is(":visible"), "The _beginColumnBackArrow is not visible");
		assert.ok(this.getMidColumnBackArrow().$().is(":visible"), "The _midColumnBackArrow is visible");
		assert.ok(this.getMidColumnForwardArrow().$().is(":visible"), "The _midColumnForwardArrow is visible");
		assert.ok(!this.getEndColumnForwardArrow().$().is(":visible"), "The _endColumnForwardArrow is not visible");

		this.getMidColumnBackArrow().firePress();
		assert.ok(!this.getBeginColumnBackArrow().$().is(":visible"), "The _beginColumnBackArrow is not visible");
		assert.ok(!this.getMidColumnBackArrow().$().is(":visible"), "The _midColumnBackArrow is not visible");
		assert.ok(this.getMidColumnForwardArrow().$().is(":visible"), "The _midColumnForwardArrow is visible");
		assert.ok(!this.getEndColumnForwardArrow().$().is(":visible"), "The _endColumnForwardArrow is not visible");
		assert.ok(oBeginPage.$().width() === 0, "The begin page is not visible");
		assert.ok(oEndPage.$().width() > 0, "The end page is visible again");
	});


	QUnit.module("PHONE - API", {
		beforeEach: function () {
			this.sOldAnimationSetting = $("html").attr("data-sap-ui-animation");
			$("html").attr("data-sap-ui-animation", "off");
			$("#" + sQUnitFixture).width(PHONE_SIZE); // < 960px
		},
		afterEach: function () {
			$("html").attr("data-sap-ui-animation", this.sOldAnimationSetting);
			if (!this.bSuppressDestroy) { // This is a flag used for debugging a particular test
				$("#" + sQUnitFixture).width("auto");
				this.oFCL.destroy();
			}
		}
	});

	QUnit.test("Constructor - 2 columns", function (assert) {

		var oBeginPage = oFactory.createPage("begin");
		var oMidPage = oFactory.createPage("mid");
		this.oFCL = oFactory.createFCL(oBeginPage, oMidPage);

		assert.ok(oBeginPage.$().width() === 0, "The begin page is not visible");
		assert.ok(oMidPage.$().width() > 0, "The mid page is visible");
	});

	QUnit.test("Constructor - 3 columns", function (assert) {

		var oBeginPage = oFactory.createPage("begin");
		var oMidPage = oFactory.createPage("mid");
		var oEndPage = oFactory.createPage("end");
		this.oFCL = oFactory.createFCL(oBeginPage, oMidPage, oEndPage);

		assert.ok(oBeginPage.$().width() === 0, "The begin page is not visible");
		assert.ok(oMidPage.$().width() === 0, "The mid page is not visible");
		assert.ok(oEndPage.$().width() > 0, "The end page is visible");
	});

	QUnit.test("API call - begin column", function (assert) {

		var oBeginPage = oFactory.createPage("begin");

		this.oFCL = oFactory.createFCL();

		// Add first column
		this.oFCL.setBeginColumn(oBeginPage);

		assert.ok(oBeginPage.$().width() > 0, "The begin page is visible");
	});

	QUnit.test("API call - mid column", function (assert) {

		var oBeginPage = oFactory.createPage("begin");
		var oMidPage = oFactory.createPage("mid");

		this.oFCL = oFactory.createFCL();

		// Add first column
		this.oFCL.setBeginColumn(oBeginPage);

		// Add second column
		this.oFCL.setMidColumn(oMidPage);

		assert.ok(oBeginPage.$().width() === 0, "The begin page is not visible");
		assert.ok(oMidPage.$().width() > 0, "The mid page is visible");
	});

	QUnit.test("API call - end column", function (assert) {

		var oBeginPage = oFactory.createPage("begin");
		var oMidPage = oFactory.createPage("mid");
		var oEndPage = oFactory.createPage("end");

		this.oFCL = oFactory.createFCL();

		// Add first column
		this.oFCL.setBeginColumn(oBeginPage);

		// Add second column
		this.oFCL.setMidColumn(oMidPage);

		// Add end column
		this.oFCL.setEndColumn(oEndPage);

		assert.ok(oBeginPage.$().width() === 0, "The begin page is not visible");
		assert.ok(oMidPage.$().width() === 0, "The mid page is not visible");
		assert.ok(oEndPage.$().width() > 0, "The end page is visible");
	});


}(jQuery, QUnit, sinon, sap.m.FlexibleColumnLayout, sap.m.Page, sap.m.Button, false));