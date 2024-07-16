/*global QUnit */
sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/layout/DynamicSideContent",
	"sap/ui/layout/library",
	"sap/m/Button",
	"sap/m/List",
	"sap/m/Panel",
	"sap/m/Page",
	"sap/m/StandardListItem",
	"sap/ui/Device",
	"sap/ui/core/ResizeHandler",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/thirdparty/jquery"
], function(Library, DynamicSideContent, layoutLibrary, Button, List, Panel, Page, StandardListItem, Device, ResizeHandler, nextUIUpdate, $) {
	"use strict";

	var SideContentFallDown = layoutLibrary.SideContentFallDown;
	var SideContentPosition = layoutLibrary.SideContentPosition;
	var SideContentVisibility = layoutLibrary.SideContentVisibility;

	var	S = "S",
		M = "M",
		L = "L",
		XL = "XL",
		SPAN_SIZE_3 = 3,
		SPAN_SIZE_4 = 4,
		SPAN_SIZE_6 = 6,
		SPAN_SIZE_8 = 8,
		SPAN_SIZE_9 = 9,
		SPAN_SIZE_12 = 12,
		MC_FIXED_CLASS = "sapUiDSCMCFixed",
		SC_FIXED_CLASS = "sapUiDSCSCFixed",
		INVALID_BREAKPOINT_ERROR_MSG = "Invalid Breakpoint. Expected: S, M, L or XL",
		SIDE_CONTENT_LABEL = "SIDE_CONTENT_LABEL";

	QUnit.module("Public API", {
		beforeEach : async function() {
			// Replacing jQuery width method to report stable browser screen resolution for the test
			var that = this;
			this._ojQueryWidthMethod = $.fn.width;
			$.fn.width = function (sWidth) {
				if (!sWidth && this[0] === window) {
					return 1440;
				}
				return that._ojQueryWidthMethod.apply(this, arguments);
			};

			this._oDSC = new DynamicSideContent();
			this._oFixture = document.getElementById("qunit-fixture");
			this._oDSC.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach : function () {
			this._oDSC.destroy();
			this._oDSC = null;

			// Restoring jQuery width method to the original one
			$.fn.width = this._ojQueryWidthMethod;
		}
	});

	QUnit.test("Default values",function(assert) {
		assert.strictEqual(this._oDSC.isSideContentVisible(), true, "'showSideContent' property default value should be 'true'");
		assert.strictEqual(this._oDSC.isMainContentVisible(), true, "'showMainContent' property default value should be 'true'");
		assert.strictEqual(this._oDSC.getSideContentVisibility(), SideContentVisibility.ShowAboveS, "'showMainContent' property default value should be 'ShowAboveS'");
		assert.strictEqual(this._oDSC.getSideContentFallDown(), SideContentFallDown.OnMinimumWidth, "'showMainContent' property default value should be 'onMinimumWidth'");
		assert.strictEqual(this._oDSC.getEqualSplit(), false, "'equalSplit' property default value should be false");
		assert.strictEqual(this._oDSC.getContainerQuery(), false, "'containerQuery' property default value should be false");
		assert.strictEqual(this._oDSC.getSideContentPosition(), SideContentPosition.End, "'sideContentPosition' property default value should be 'false'");
	});

	QUnit.test("'sideContentPosition' property set to End by default",function(assert) {
		var oSideContent = this._oDSC.$("SCGridCell"),
			oMainContent = this._oDSC.$("MCGridCell");

		assert.ok(oSideContent.position().left > oMainContent.position().left, "Main content is before the side content by default");
	});

	QUnit.test("'sideContentPosition' property set to Begin",async function(assert) {

		this._oDSC.setSideContentPosition(SideContentPosition.Begin);
		await nextUIUpdate();

		var oSideContent = this._oDSC.$("SCGridCell"),
		oMainContent = this._oDSC.$("MCGridCell");

		assert.ok(oSideContent.position().left < oMainContent.position().left, "Side content is before the main content");
	});

	QUnit.test("'ShowSideContent' property is set correctly",function(assert) {
		var bSuppressVisualUpdate = false;
		this.spy(this._oDSC, "_changeGridState");

		this._oDSC.setShowSideContent(false, bSuppressVisualUpdate);
		assert.strictEqual(this._oDSC.isSideContentVisible(), false, "'showSideContent' property is set to false");
		assert.ok(this._oDSC._changeGridState.calledOnce, "_changeGridState is called when side content is not visible");

		this._oDSC._changeGridState.resetHistory();

		this._oDSC.setShowSideContent(true, bSuppressVisualUpdate);
		assert.strictEqual(this._oDSC.isSideContentVisible(), true, "'showSideContent' property is set to true");
		assert.ok(this._oDSC._changeGridState.calledOnce, "_changeGridState is called when side content is visible and suppressVisualUpdate is false");

		this._oDSC._changeGridState.resetHistory();

		bSuppressVisualUpdate = true;
		this._oDSC.setShowSideContent(false, bSuppressVisualUpdate);
		assert.ok(!this._oDSC._changeGridState.calledOnce, "_changeGridState is not called when suppressVisualUpdate is true");
	});

	QUnit.test("'ShowMainContent' property is set correctly",function(assert) {
		var bSuppressInvalidate = false;

		this.spy(this._oDSC, "_changeGridState");

		this._oDSC.setShowMainContent(false, bSuppressInvalidate);
		assert.strictEqual(this._oDSC.isMainContentVisible(), false, "'showMainContent' property is set to false");
		assert.ok(this._oDSC._changeGridState.calledOnce, "_changeGridState is called when main content is not visible");

		this._oDSC._changeGridState.resetHistory();

		bSuppressInvalidate = true;
		this._oDSC._MCVisible = true;
		assert.ok(!this._oDSC._changeGridState.calledOnce, "_changeGridState is not called when suppressVisualUpdate is true");

		this._oDSC._changeGridState.resetHistory();

		bSuppressInvalidate = false;
		this._oDSC.setShowMainContent(true, bSuppressInvalidate);
		assert.strictEqual(this._oDSC.isMainContentVisible(), true, "'showMainContent' property is set to true");
		assert.ok(this._oDSC._changeGridState.calledOnce, "_changeGridState is called when main content is visible and suppressVisualUpdate is false");
	});

	QUnit.test("'EqualSplit' property is set correctly",function(assert) {
		this.spy(this._oDSC, "_setResizeData");
		this.spy(this._oDSC, "_changeGridState");

		this._oDSC.setEqualSplit(true);
		assert.strictEqual(this._oDSC.getEqualSplit(), true, "'equalSplit' property is set to true");
		assert.strictEqual(this._oDSC.isSideContentVisible(), true, "Side content should be visible");
		assert.strictEqual(this._oDSC.isMainContentVisible(), true, "Main content should be visible");

		this._oDSC._currentBreakpoint = XL;
		assert.ok(this._oDSC._setResizeData.calledOnce, "_setResizeData is called");
		assert.ok(this._oDSC._changeGridState.calledOnce, "_changeGridState is called");

		this._oDSC._setResizeData.resetHistory();
		this._oDSC._changeGridState.resetHistory();

		this._oDSC._currentBreakpoint = null;
		this._oDSC.setEqualSplit(false);
		assert.ok(!this._oDSC._setResizeData.calledOnce, "_setResizeData is not called when no breakpoint is set");
		assert.ok(!this._oDSC._changeGridState.calledOnce, "_changeGridState is not called when no breakpoint is set");
	});

	QUnit.test("'sideContentWidthM' property sets correct side content width for M breakpoint",async function(assert) {
		// act
		this._oDSC.setSideContentFallDown("BelowM");
		this._oDSC.setContainerQuery(true);
		this._oFixture.style.width = "900px"; // M breakpoint, mainContent and sideContent are side by side
		this._oDSC._adjustToScreenSize();
		this._oDSC.setSideContentWidthM("256px");
		this._oDSC.setSideContentWidthL("356px");
		this._oDSC.setSideContentWidthXL("456px");
		await nextUIUpdate();

		// assert
		assert.notEqual(this._oDSC.getDomRef("SCGridCell").getAttribute("style").indexOf("width: 256px"), -1, "Side content width for M breakpoint is properly set");

		// act
		this._oDSC.setEqualSplit(true);
		await nextUIUpdate();

		// assert
		assert.strictEqual(this._oDSC.getDomRef("SCGridCell").getAttribute("style").indexOf("width: 256px"), -1, "Side content width for M breakpoint is removed when equalSplit is set");

		// act
		this._oDSC.setEqualSplit(false);
		await nextUIUpdate();

		// assert
		assert.notEqual(this._oDSC.getDomRef("SCGridCell").getAttribute("style").indexOf("width: 256px"), -1, "Side content width for M breakpoint is properly set when equalSplit is removed");

		// act
		this._oDSC.setShowMainContent(false);
		await nextUIUpdate();

		// assert
		assert.strictEqual(this._oDSC.getDomRef("SCGridCell").getAttribute("style").indexOf("width: 256px"), -1, "Side content width for M breakpoint is removed when main content is hidden");

		// act
		this._oDSC.setShowMainContent(true);
		await nextUIUpdate();

		// assert
		assert.notEqual(this._oDSC.getDomRef("SCGridCell").getAttribute("style").indexOf("width: 256px"), -1, "Side content width for M breakpoint is properly set when main content is visible again");
	});

	QUnit.test("'sideContentWidthL' property sets correct side content width for L breakpoint",async function(assert) {
		// act
		this._oFixture.style.width = "1100px"; // L breakpoint, mainContent and sideContent are side by side
		this._oDSC._adjustToScreenSize();
		this._oDSC.setContainerQuery(true);
		this._oDSC.setSideContentWidthM("256px");
		this._oDSC.setSideContentWidthL("356px");
		this._oDSC.setSideContentWidthXL("456px");
		await nextUIUpdate();

		// assert
		assert.notEqual(this._oDSC.getDomRef("SCGridCell").getAttribute("style").indexOf("width: 356px"), -1, "Side content width for L breakpoint is properly set");

		// act
		this._oDSC.setEqualSplit(true);
		await nextUIUpdate();

		// assert
		assert.strictEqual(this._oDSC.getDomRef("SCGridCell").getAttribute("style").indexOf("width: 356px"), -1, "Side content width for L breakpoint is removed when equalSplit is set");

		// act
		this._oDSC.setEqualSplit(false);
		await nextUIUpdate();

		// assert
		assert.notEqual(this._oDSC.getDomRef("SCGridCell").getAttribute("style").indexOf("width: 356px"), -1, "Side content width for L breakpoint is properly set when equalSplit is removed");

		// act
		this._oDSC.setShowMainContent(false);
		await nextUIUpdate();

		// assert
		assert.strictEqual(this._oDSC.getDomRef("SCGridCell").getAttribute("style").indexOf("width: 356px"), -1, "Side content width for L breakpoint is removed when main content is hidden");

		// act
		this._oDSC.setShowMainContent(true);
		await nextUIUpdate();

		// assert
		assert.notEqual(this._oDSC.getDomRef("SCGridCell").getAttribute("style").indexOf("width: 356px"), -1, "Side content width for L breakpoint is properly set when main content is visible again");
	});

	QUnit.test("'sideContentWidthXL' property sets correct side content width for XL breakpoint",async function(assert) {
		// prepare
		this._oFixture.style.width = "1500px"; // XL breakpoint, mainContent and sideContent are side by side
		this._oDSC._adjustToScreenSize();
		this._oDSC.setContainerQuery(true);
		this._oDSC.setSideContentWidthM("256px");
		this._oDSC.setSideContentWidthL("356px");
		this._oDSC.setSideContentWidthXL("456px");
		await nextUIUpdate();

		// assert
		assert.notEqual(this._oDSC.getDomRef("SCGridCell").getAttribute("style").indexOf("width: 456px"), -1, "Side content width for XL breakpoint is properly set");

		// act
		this._oDSC.setEqualSplit(true);
		await nextUIUpdate();

		// assert
		assert.strictEqual(this._oDSC.getDomRef("SCGridCell").getAttribute("style").indexOf("width: 456px"), -1, "Side content width for XL breakpoint is removed when equalSplit is set");

		// act
		this._oDSC.setEqualSplit(false);
		await nextUIUpdate();

		// assert
		assert.notEqual(this._oDSC.getDomRef("SCGridCell").getAttribute("style").indexOf("width: 456px"), -1, "Side content width for XL breakpoint is properly set when equalSplit is removed");

		// act
		this._oDSC.setShowMainContent(false);
		await nextUIUpdate();

		// assert
		assert.strictEqual(this._oDSC.getDomRef("SCGridCell").getAttribute("style").indexOf("width: 456px"), -1, "Side content width for XL breakpoint is removed when main content is hidden");

		// act
		this._oDSC.setShowMainContent(true);
		await nextUIUpdate();

		// assert
		assert.notEqual(this._oDSC.getDomRef("SCGridCell").getAttribute("style").indexOf("width: 456px"), -1, "Side content width for XL breakpoint is properly set when main content is visible again");
	});

	QUnit.test("'SideContent' aggregation is set correctly",function(assert) {
		var oButton = new Button("button1");

		this.spy(this._oDSC, "_rerenderControl");

		this._oDSC.addSideContent(oButton);
		assert.strictEqual(this._oDSC.getSideContent()[0], oButton, "'SideContent' aggregation is set with button1");
		assert.ok(this._oDSC._rerenderControl.calledOnce, "_rerenderControl is called");

		oButton.destroy();
		oButton = null;
	});

	QUnit.test("'MainContent' aggregation is set correctly",function(assert) {
		var oButton = new Button("button1");

		this.spy(this._oDSC, "_rerenderControl");

		this._oDSC.addMainContent(oButton);
		assert.strictEqual(this._oDSC.getMainContent()[0], oButton, "'MainContent' aggregation is set with button1");
		assert.ok(this._oDSC._rerenderControl.calledOnce, "_rerenderControl is called");

		oButton.destroy();
		oButton = null;
	});

	QUnit.test("'Toggle' button functionality",function(assert) {
		// 1
		this.spy(this._oDSC, "_changeGridState");
		this._oDSC.setEqualSplit(true);
		this._oDSC._currentBreakpoint = S;
		this._oDSC._MCVisible = true;
		this._oDSC._SCVisible = false;

		this._oDSC.toggle();

		assert.ok(
			this._oDSC._changeGridState.called,
			"_changeGridState is called only when EqualSplit mode is true and current breakpoint is 'S'"
		);

		assert.strictEqual(this._oDSC._MCVisible, false, "'showMainContent' property is 'false'");
		assert.strictEqual(this._oDSC._SCVisible, true, "'showSideContent' property is 'true'");

		this._oDSC._MCVisible = false;
		this._oDSC._SCVisible = true;

		this._oDSC.toggle();

		assert.strictEqual(this._oDSC._MCVisible, true, "'showMainContent' property is 'true'");
		assert.strictEqual(this._oDSC._SCVisible, false, "'showSideContent' property is 'false'");

		// 2
		this._oDSC._changeGridState.resetHistory();

		this._oDSC.setEqualSplit(false);
		this._oDSC._currentBreakpoint = M;

		assert.ok(!this._oDSC._rerenderControl.calledOnce, "_changeGridState is not called when EqualSplit mode is false");

		// 3
		this._oDSC._changeGridState.resetHistory();

		this._oDSC.setEqualSplit(true);
		this._oDSC._currentBreakpoint = M;

		assert.ok(!this._oDSC._rerenderControl.calledOnce, "_changeGridState is not called when current breakpoint is different than 'S'");

		// 4
		this._oDSC.setEqualSplit(false);
		this._oDSC.setShowSideContent(false);
		this._oDSC._currentBreakpoint = S;
		this._oDSC.toggle();
		assert.ok(this._oDSC.isSideContentVisible(), "Side content should be visible when toggled");
		assert.ok(this._oDSC._SCVisible, "Side content internal visible property should be true");
		assert.ok(!this._oDSC.isMainContentVisible(), "Main content should not be visible when toggled");
		assert.ok(!this._oDSC._MCVisible, "Main content internal visible property should be false");

	});

	QUnit.test("setSideContentVisibility functionality",function(assert) {
		this._oDSC._currentBreakpoint = L;

		// assert if both "contents" are visible on L size
		assert.strictEqual(this._oDSC._MCVisible, true, "'showMainContent' property is 'true'");
		assert.strictEqual(this._oDSC._SCVisible, true, "'showSideContent' property is 'true'");

		// set property sideContetnVisibility to "neverShow"
		this._oDSC.setSideContentVisibility("NeverShow");

		// assert that only the main content is visible on L size
		assert.strictEqual(this._oDSC._MCVisible, true, "'showMainContent' property is 'true'");
		assert.strictEqual(this._oDSC._SCVisible, false, "'showSideContent' property is 'false'");

	});

	QUnit.module("Scroll delegate", {
		beforeEach: async function() {
			this.oList = new List("list1", {
				items: new StandardListItem({
					title : "123 456"
				})
			});
			this.oDSC = new DynamicSideContent({
				containerQuery: true,
				sideContentFallDown: "BelowM"
			});
			this.oPage = new Page({
				content: this.oDSC
			});
			this.oFixture = document.getElementById("qunit-fixture");
			this.oPage.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oList.destroy();
			this.oList = null;
			this.oDSC.destroy();
			this.oDSC = null;
			this.oPage.destroy();
			this.oPage = null;
		}
	});

	QUnit.test("getScrollDelegate: List in mainContent, mainContent take the whole DSC height",async function(assert) {
		// prepare
		this.oDSC.addMainContent(this.oList);
		await nextUIUpdate();

		// act
		this.oFixture.style.width = "1500px"; // XL breakpoint, mainContent and sideContent are side by side
		this.oDSC._adjustToScreenSize();
		await nextUIUpdate();

		// assert
		assert.strictEqual(this.oDSC.getScrollDelegate(this.oList), this.oDSC._oMCScroller,
			"XL breakpoint: getScrollDelegate returns the scroll delegate of the DSC's mainContent aggregation");

		// act
		this.oFixture.style.width = "1200px"; // L breakpoint, mainContent and sideContent are side by side
		this.oDSC._adjustToScreenSize();
		await nextUIUpdate();

		// assert
		assert.strictEqual(this.oDSC.getScrollDelegate(this.oList), this.oDSC._oMCScroller,
			"L breakpoint: getScrollDelegate returns the scroll delegate of the DSC's mainContent aggregation");

		// act
		this.oFixture.style.width = "900px"; // M breakpoint, mainContent and sideContent are side by side
		this.oDSC._adjustToScreenSize();
		await nextUIUpdate();

		// assert
		assert.strictEqual(this.oDSC.getScrollDelegate(this.oList), this.oDSC._oMCScroller,
			"M breakpoint: getScrollDelegate returns the scroll delegate of the DSC's mainContent aggregation");

		// act
		this.oFixture.style.width = "700px"; // L breakpoint, mainContent and sideContent are side by side
		this.oDSC._adjustToScreenSize();
		await nextUIUpdate();

		// assert
		assert.strictEqual(this.oDSC.getScrollDelegate(this.oList), this.oDSC._oMCScroller,
			"S breakpoint: getScrollDelegate returns the scroll delegate of the DSC's mainContent aggregation");
	});

	QUnit.test("getScrollDelegate: List in mainContent, mainContent is above the sideContent",async function(assert) {
		// prepare
		this.oDSC.addMainContent(this.oList);
		await nextUIUpdate();

		this.oDSC.setSideContentFallDown("BelowXL"); // sideContent goes below mainContent on L, M, S
		this.oDSC.setSideContentVisibility("AlwaysShow"); // sideContent is dislayed always
		await nextUIUpdate();

		// act
		this.oFixture.style.width = "1200px"; // L breakpoint
		this.oDSC._adjustToScreenSize();
		await nextUIUpdate();

		// assert
		assert.strictEqual(this.oDSC.getScrollDelegate(this.oList), this.oPage.getScrollDelegate(),
			"L breakpoint: getScrollDelegate returns the scroll delegate of the parent Page control");

		// act
		this.oFixture.style.width = "900px"; // M breakpoint
		this.oDSC._adjustToScreenSize();
		await nextUIUpdate();

		// assert
		assert.strictEqual(this.oDSC.getScrollDelegate(this.oList), this.oPage.getScrollDelegate(),
			"M breakpoint: getScrollDelegate returns the scroll delegate of the parent Page control");

		// act
		this.oFixture.style.width = "700px"; // L breakpoint
		this.oDSC._adjustToScreenSize();
		await nextUIUpdate();

		// assert
		assert.strictEqual(this.oDSC.getScrollDelegate(this.oList), this.oPage.getScrollDelegate(),
			"S breakpoint: getScrollDelegate returns the scroll delegate of the parent Page control");
	});

	QUnit.test("getScrollDelegate: List in sideContent, sideContent take the whole DSC height",async function(assert) {
		// prepare
		this.oDSC.addSideContent(this.oList);
		await nextUIUpdate();

		// act
		this.oFixture.style.width = "1500px"; // XL breakpoint, mainContent and sideContent are side by side
		this.oDSC._adjustToScreenSize();
		await nextUIUpdate();

		// assert
		assert.strictEqual(this.oDSC.getScrollDelegate(this.oList), this.oDSC._oSCScroller,
			"XL breakpoint: getScrollDelegate returns the scroll delegate of the DSC's sideContent aggregation");

		// act
		this.oFixture.style.width = "1200px"; // L breakpoint, mainContent and sideContent are side by side
		this.oDSC._adjustToScreenSize();
		await nextUIUpdate();

		// assert
		assert.strictEqual(this.oDSC.getScrollDelegate(this.oList), this.oDSC._oSCScroller,
			"L breakpoint: getScrollDelegate returns the scroll delegate of the DSC's sideContent aggregation");

		// act
		this.oFixture.style.width = "900px"; // M breakpoint, mainContent and sideContent are side by side
		this.oDSC._adjustToScreenSize();
		await nextUIUpdate();

		// assert
		assert.strictEqual(this.oDSC.getScrollDelegate(this.oList), this.oDSC._oSCScroller,
			"M breakpoint: getScrollDelegate returns the scroll delegate of the DSC's sideContent aggregation");

		// act
		this.oFixture.style.width = "700px"; // L breakpoint, mainContent and sideContent are side by side
		this.oDSC._adjustToScreenSize();
		this.oDSC.toggle(); // displays sideContent instead of mainContent
		await nextUIUpdate();

		// assert
		assert.strictEqual(this.oDSC.getScrollDelegate(this.oList), this.oDSC._oSCScroller,
			"S breakpoint: getScrollDelegate returns the scroll delegate of the DSC's sideContent aggregation");
	});

	QUnit.test("getScrollDelegate: List in sideContent, mainContent is above the sideContent",async function(assert) {
		// prepare
		this.oDSC.addSideContent(this.oList);
		await nextUIUpdate();

		this.oDSC.setSideContentFallDown("BelowXL"); // sideContent goes below mainContent on L, M, S
		this.oDSC.setSideContentVisibility("AlwaysShow"); // sideContent is dislayed always
		await nextUIUpdate();

		// act
		this.oFixture.style.width = "1200px"; // L breakpoint
		this.oDSC._adjustToScreenSize();
		await nextUIUpdate();

		// assert
		assert.strictEqual(this.oDSC.getScrollDelegate(this.oList), this.oPage.getScrollDelegate(),
			"L breakpoint: getScrollDelegate returns the scroll delegate of the parent Page control");

		// act
		this.oFixture.style.width = "900px"; // M breakpoint
		this.oDSC._adjustToScreenSize();
		await nextUIUpdate();

		// assert
		assert.strictEqual(this.oDSC.getScrollDelegate(this.oList), this.oPage.getScrollDelegate(),
			"M breakpoint: getScrollDelegate returns the scroll delegate of the parent Page control");

		// act
		this.oFixture.style.width = "700px"; // L breakpoint
		this.oDSC._adjustToScreenSize();
		await nextUIUpdate();

		// assert
		assert.strictEqual(this.oDSC.getScrollDelegate(this.oList), this.oPage.getScrollDelegate(),
			"S breakpoint: getScrollDelegate returns the scroll delegate of the parent Page control");
	});

	QUnit.test("getScrollDelegate: List in Panel in mainContent",async function(assert) {
		var oPanel = new Panel({
			content: this.oList
		});

		// prepare
		this.oDSC.addMainContent(oPanel);
		await nextUIUpdate();

		// act
		this.oFixture.style.width = "1500px"; // XL breakpoint, mainContent and sideContent are side by side
		this.oDSC._adjustToScreenSize();
		await nextUIUpdate();

		// assert
		assert.strictEqual(this.oDSC.getScrollDelegate(this.oList), this.oDSC._oMCScroller,
			"XL breakpoint: getScrollDelegate returns the scroll delegate of the DSC's mainContent aggregation");

		// act
		this.oFixture.style.width = "1200px"; // L breakpoint, mainContent and sideContent are side by side
		this.oDSC._adjustToScreenSize();
		await nextUIUpdate();

		// assert
		assert.strictEqual(this.oDSC.getScrollDelegate(this.oList), this.oDSC._oMCScroller,
			"L breakpoint: getScrollDelegate returns the scroll delegate of the DSC's mainContent aggregation");

		// act
		this.oFixture.style.width = "900px"; // M breakpoint, mainContent and sideContent are side by side
		this.oDSC._adjustToScreenSize();
		await nextUIUpdate();

		// assert
		assert.strictEqual(this.oDSC.getScrollDelegate(this.oList), this.oDSC._oMCScroller,
			"M breakpoint: getScrollDelegate returns the scroll delegate of the DSC's mainContent aggregation");

		// act
		this.oFixture.style.width = "700px"; // L breakpoint, mainContent and sideContent are side by side
		this.oDSC._adjustToScreenSize();
		await nextUIUpdate();

		// assert
		assert.strictEqual(this.oDSC.getScrollDelegate(this.oList), this.oDSC._oMCScroller,
			"S breakpoint: getScrollDelegate returns the scroll delegate of the DSC's mainContent aggregation");
	});

	QUnit.test("getScrollDelegate: List in Panel in sideContent",async function(assert) {
		var oPanel = new Panel({
			content: this.oList
		});

		// prepare
		this.oDSC.addSideContent(oPanel);
		await nextUIUpdate();

		// act
		this.oFixture.style.width = "1500px"; // XL breakpoint, mainContent and sideContent are side by side
		this.oDSC._adjustToScreenSize();
		await nextUIUpdate();

		// assert
		assert.strictEqual(this.oDSC.getScrollDelegate(this.oList), this.oDSC._oSCScroller,
			"XL breakpoint: getScrollDelegate returns the scroll delegate of the DSC's sideContent aggregation");

		// act
		this.oFixture.style.width = "1200px"; // L breakpoint, mainContent and sideContent are side by side
		this.oDSC._adjustToScreenSize();
		await nextUIUpdate();

		// assert
		assert.strictEqual(this.oDSC.getScrollDelegate(this.oList), this.oDSC._oSCScroller,
			"L breakpoint: getScrollDelegate returns the scroll delegate of the DSC's sideContent aggregation");

		// act
		this.oFixture.style.width = "900px"; // M breakpoint, mainContent and sideContent are side by side
		this.oDSC._adjustToScreenSize();
		await nextUIUpdate();

		// assert
		assert.strictEqual(this.oDSC.getScrollDelegate(this.oList), this.oDSC._oSCScroller,
			"M breakpoint: getScrollDelegate returns the scroll delegate of the DSC's sideContent aggregation");

		// act
		this.oFixture.style.width = "700px"; // L breakpoint, mainContent and sideContent are side by side
		this.oDSC._adjustToScreenSize();
		this.oDSC.toggle(); // displays sideContent instead of mainContent
		await nextUIUpdate();

		// assert
		assert.strictEqual(this.oDSC.getScrollDelegate(this.oList), this.oDSC._oSCScroller,
			"S breakpoint: getScrollDelegate returns the scroll delegate of the DSC's sideContent aggregation");
	});

	QUnit.module("Helper functionality", {
		beforeEach : async function() {
			// Replacing jQuery width method to report stable browser screen resolution for the test
			var that = this;
			this._ojQueryWidthMethod = $.fn.width;
			$.fn.width = function (sWidth) {
				if (!sWidth && this[0] === window) {
					return 500;
				}
				return that._ojQueryWidthMethod.apply(this, arguments);
			};

			this._oDSC = new DynamicSideContent();
			this._oDSC.placeAt("qunit-fixture");

			await nextUIUpdate();
		},
		afterEach : function () {
			this._oDSC.destroy();
			this._oDSC = null;

			// Restoring jQuery width method to the original one
			$.fn.width = this._ojQueryWidthMethod;
		},
		assertOnSideContentVisibility : function(sBreakpoint, sideContentVisibility, bExpectedResult, bIsInComparisonMode, assert) {
			this._oDSC.setSideContentVisibility(sideContentVisibility);
			this._oDSC._setResizeData(sBreakpoint, bIsInComparisonMode);

			assert.strictEqual(
					this._oDSC._SCVisible,
					bExpectedResult,
					"Side content is hidden on " + "'" + sBreakpoint + "'" + " breakpoint when 'SideContentVisibility' property it set to " + sideContentVisibility
			);
		},
		assertOnMainContentVisibility : function(sBreakpoint, bExpectedResult, bIsInComparisonMode, assert) {
			this._oDSC._setResizeData(sBreakpoint, bIsInComparisonMode);

			assert.strictEqual(
					this._oDSC._MCVisible,
					bExpectedResult,
					"Main content is hidden on " + "'" + sBreakpoint + "'"
			);
		},
		assertOnContentSpanSize : function(sContentName, sSpanPropertyName, sBreakpoint, sideContentFallDown, bExpectedResult, bIsInComparisonMode, assert) {
			this._oDSC.setSideContentFallDown(sideContentFallDown);
			this._oDSC._setResizeData(sBreakpoint, bIsInComparisonMode);

			assert.strictEqual(
					this._oDSC.getProperty(sSpanPropertyName),
					bExpectedResult,
					sContentName + " content span size is set to " + bExpectedResult + " when breakpoint is " + "'" + sBreakpoint + "'" + " and 'SideContentFallDown' property is set to " + sideContentFallDown
			);
		}
	});

	QUnit.test("Control should work with 0px width", function (assert) {
		var sBreakpoint;

		// _getBreakPointFromWidth
		sBreakpoint = this._oDSC._getBreakPointFromWidth(0);
		assert.strictEqual(sBreakpoint, S, "If parent container's width is 0px, the breakpoint should default to 'S'");

		// _setBreakpointFromWidth
		this._oDSC._setBreakpointFromWidth(0);
		assert.strictEqual(this._oDSC.getCurrentBreakpoint(), S, "If setting the breakpoint from width 0px, the breakpoint should default to 'S'");
	});

	QUnit.test("Calculate breakpoint from width",function(assert) {
		var sBreakpoint;

		// test S breakpoint
		sBreakpoint = this._oDSC._getBreakPointFromWidth(200);
		assert.strictEqual(sBreakpoint, S, "If parent container's width is under 720px, the breakpoint should be 'S'");

		sBreakpoint = this._oDSC._getBreakPointFromWidth(720);
		assert.strictEqual(sBreakpoint, S, "If parent container's width is equal to 720px, the breakpoint should be 'S'");

		// test M breakpoint
		sBreakpoint = this._oDSC._getBreakPointFromWidth(800);
		assert.strictEqual(sBreakpoint, M, "If parent container's width is in the range 720px-1024px includingly, the breakpoint should be 'M'");

		sBreakpoint = this._oDSC._getBreakPointFromWidth(1024);
		assert.strictEqual(sBreakpoint, M, "If parent container's width is in the range 720px-1024px includingly, the breakpoint should be 'M'");

		// test L breakpoint
		sBreakpoint = this._oDSC._getBreakPointFromWidth(1060);
		assert.strictEqual(sBreakpoint, L, "If parent container's width is in the range 1024px-1440px includingly, the breakpoint should be 'L'");

		sBreakpoint = this._oDSC._getBreakPointFromWidth(1440);
		assert.strictEqual(sBreakpoint, L, "If parent container's width is in the range 1024px-1440px includingly, the breakpoint should be 'L'");

		// test XL breakpoint
		sBreakpoint = this._oDSC._getBreakPointFromWidth(1500);
		assert.strictEqual(sBreakpoint, XL, "If parent container's width is above 1440px, the breakpoint should be 'XL'");

	});

	QUnit.test("The size of the main and side content is calculated correctly, according to the current breakpoint",function(assert) {
		var bIsInComparisonMode = false;

		// S breakpoint
		this._oDSC._setResizeData(S, bIsInComparisonMode);

		assert.strictEqual(this._oDSC.getProperty("mcSpan"), SPAN_SIZE_12, "Main content span size is set to 12 when breakpoint is 'S'");
		assert.strictEqual(this._oDSC.getProperty("scSpan"), SPAN_SIZE_12, "Side content span size is set to 12 when breakpoint is 'S'.");
		assert.strictEqual(this._oDSC._SCVisible, false, "Side content is not visible.");

		// M breakpoint
		this.assertOnContentSpanSize("Main", "mcSpan", M, SideContentFallDown.BelowL, SPAN_SIZE_12, false, assert);
		this.assertOnContentSpanSize("Side", "scSpan", M, SideContentFallDown.BelowL, SPAN_SIZE_12, false, assert);

		this.assertOnContentSpanSize("Main", "mcSpan", M, SideContentFallDown.BelowXL, SPAN_SIZE_12, false, assert);
		this.assertOnContentSpanSize("Side", "scSpan", M, SideContentFallDown.BelowXL, SPAN_SIZE_12, false, assert);

		this.assertOnContentSpanSize("Main", "mcSpan", M, SideContentFallDown.BelowM, SPAN_SIZE_8, false, assert);
		this.assertOnContentSpanSize("Side", "scSpan", M, SideContentFallDown.BelowM, SPAN_SIZE_4, false, assert);

		this.assertOnSideContentVisibility(M, SideContentVisibility.ShowAboveS, true, false, assert);
		this.assertOnSideContentVisibility(M, SideContentVisibility.AlwaysShow, true, false, assert);
		this.assertOnSideContentVisibility(M, SideContentVisibility.NeverShow, false, false, assert);
		this.assertOnSideContentVisibility(M, SideContentVisibility.ShowAboveL, false, false, assert);
		this.assertOnSideContentVisibility(M, SideContentVisibility.ShowAboveM, false, false, assert);

		// L breakpoint
		this.assertOnContentSpanSize("Main", "mcSpan", L, SideContentFallDown.BelowXL, SPAN_SIZE_12, false, assert);
		this.assertOnContentSpanSize("Side", "scSpan", L, SideContentFallDown.BelowXL, SPAN_SIZE_12, false, assert);

		this.assertOnContentSpanSize("Main", "mcSpan", L, SideContentFallDown.BelowL, SPAN_SIZE_8, false, assert);
		this.assertOnContentSpanSize("Side", "scSpan", L, SideContentFallDown.BelowL, SPAN_SIZE_4, false, assert);

		this.assertOnContentSpanSize("Main", "mcSpan", L, SideContentFallDown.BelowM, SPAN_SIZE_8, false, assert);
		this.assertOnContentSpanSize("Side", "scSpan", L, SideContentFallDown.BelowM, SPAN_SIZE_4, false, assert);

		this.assertOnSideContentVisibility(L, SideContentVisibility.ShowAboveS, true, false, assert);
		this.assertOnSideContentVisibility(L, SideContentVisibility.ShowAboveM, true, false, assert);
		this.assertOnSideContentVisibility(L, SideContentVisibility.AlwaysShow, true, false, assert);
		this.assertOnSideContentVisibility(L, SideContentVisibility.ShowAboveL, false, false, assert);
		this.assertOnSideContentVisibility(L, SideContentVisibility.NeverShow, false, false, assert);

		// XL breakpoint
		this.assertOnContentSpanSize("Main", "mcSpan", XL, SideContentFallDown.BelowM, SPAN_SIZE_9, false, assert);
		this.assertOnContentSpanSize("Side", "scSpan", XL, SideContentFallDown.BelowM, SPAN_SIZE_3, false, assert);

		this.assertOnContentSpanSize("Main", "mcSpan", XL, SideContentFallDown.BelowL, SPAN_SIZE_9, false, assert);
		this.assertOnContentSpanSize("Side", "scSpan", XL, SideContentFallDown.BelowL, SPAN_SIZE_3, false, assert);

		this.assertOnContentSpanSize("Main", "mcSpan", XL, SideContentFallDown.BelowXL, SPAN_SIZE_9, false, assert);
		this.assertOnContentSpanSize("Side", "scSpan", XL, SideContentFallDown.BelowXL, SPAN_SIZE_3, false, assert);

		this.assertOnSideContentVisibility(XL, SideContentVisibility.NeverShow, false, false, assert);
		this.assertOnSideContentVisibility(XL, SideContentVisibility.AlwaysShow, true, false, assert);
		this.assertOnSideContentVisibility(XL, SideContentVisibility.ShowAboveL, true, false, assert);
		this.assertOnSideContentVisibility(XL, SideContentVisibility.ShowAboveM, true, false, assert);
		this.assertOnSideContentVisibility(XL, SideContentVisibility.ShowAboveS, true, false, assert);

		// EqualSplit mode S breakpoint

		this.assertOnContentSpanSize("Main", "mcSpan", S, SideContentFallDown.BelowL, SPAN_SIZE_12, true, assert);
		this.assertOnContentSpanSize("Side", "scSpan", S, SideContentFallDown.BelowL, SPAN_SIZE_12, true, assert);

		this.assertOnContentSpanSize("Main", "mcSpan", S, SideContentFallDown.BelowM, SPAN_SIZE_12, true, assert);
		this.assertOnContentSpanSize("Side", "scSpan", S, SideContentFallDown.BelowM, SPAN_SIZE_12, true, assert);

		this.assertOnContentSpanSize("Main", "mcSpan", S, SideContentFallDown.BelowXL, SPAN_SIZE_12, true, assert);
		this.assertOnContentSpanSize("Side", "scSpan", S, SideContentFallDown.BelowXL, SPAN_SIZE_12, true, assert);

		// EqualSplit mode other than S
		this.assertOnSideContentVisibility(S, SideContentVisibility.NeverShow, false, true, assert);
		this.assertOnSideContentVisibility(S, SideContentVisibility.AlwaysShow, false, true, assert);
		this.assertOnSideContentVisibility(S, SideContentVisibility.ShowAboveL, false, true, assert);
		this.assertOnSideContentVisibility(S, SideContentVisibility.ShowAboveM, false, true, assert);
		this.assertOnSideContentVisibility(S, SideContentVisibility.ShowAboveS, false, true, assert);

		assert.throws(function () {
			this._oDSC._setResizeData("invalid breakpoint", false);
		}, INVALID_BREAKPOINT_ERROR_MSG);

		// EqualSplit mode other than S
		this.assertOnContentSpanSize("Main", "mcSpan", M, SideContentFallDown.BelowL, SPAN_SIZE_6, true, assert);
		this.assertOnContentSpanSize("Side", "scSpan", M, SideContentFallDown.BelowL, SPAN_SIZE_6, true, assert);

		this.assertOnContentSpanSize("Main", "mcSpan", M, SideContentFallDown.BelowM, SPAN_SIZE_6, true, assert);
		this.assertOnContentSpanSize("Side", "scSpan", M, SideContentFallDown.BelowM, SPAN_SIZE_6, true, assert);

		this.assertOnContentSpanSize("Main", "mcSpan", M, SideContentFallDown.BelowXL, SPAN_SIZE_6, true, assert);
		this.assertOnContentSpanSize("Side", "scSpan", M, SideContentFallDown.BelowXL, SPAN_SIZE_6, true, assert);

		this.assertOnContentSpanSize("Main", "mcSpan", L, SideContentFallDown.BelowL, SPAN_SIZE_6, true, assert);
		this.assertOnContentSpanSize("Side", "scSpan", L, SideContentFallDown.BelowL, SPAN_SIZE_6, true, assert);

		this.assertOnContentSpanSize("Main", "mcSpan", L, SideContentFallDown.BelowM, SPAN_SIZE_6, true, assert);
		this.assertOnContentSpanSize("Side", "scSpan", L, SideContentFallDown.BelowM, SPAN_SIZE_6, true, assert);

		this.assertOnContentSpanSize("Main", "mcSpan", L, SideContentFallDown.BelowXL, SPAN_SIZE_6, true, assert);
		this.assertOnContentSpanSize("Side", "scSpan", L, SideContentFallDown.BelowXL, SPAN_SIZE_6, true, assert);

		this.assertOnContentSpanSize("Main", "mcSpan", XL, SideContentFallDown.BelowL, SPAN_SIZE_6, true, assert);
		this.assertOnContentSpanSize("Side", "scSpan", XL, SideContentFallDown.BelowL, SPAN_SIZE_6, true, assert);

		this.assertOnContentSpanSize("Main", "mcSpan", XL, SideContentFallDown.BelowM, SPAN_SIZE_6, true, assert);
		this.assertOnContentSpanSize("Side", "scSpan", XL, SideContentFallDown.BelowM, SPAN_SIZE_6, true, assert);

		this.assertOnContentSpanSize("Main", "mcSpan", XL, SideContentFallDown.BelowXL, SPAN_SIZE_6, true, assert);
		this.assertOnContentSpanSize("Side", "scSpan", XL, SideContentFallDown.BelowXL, SPAN_SIZE_6, true, assert);

		this.assertOnSideContentVisibility(M, SideContentVisibility.NeverShow, true, true, assert);
		this.assertOnSideContentVisibility(M, SideContentVisibility.AlwaysShow, true, true, assert);
		this.assertOnSideContentVisibility(M, SideContentVisibility.ShowAboveL, true, true, assert);
		this.assertOnSideContentVisibility(M, SideContentVisibility.ShowAboveM, true, true, assert);
		this.assertOnSideContentVisibility(M, SideContentVisibility.ShowAboveS, true, true, assert);

		this.assertOnSideContentVisibility(L, SideContentVisibility.NeverShow, true, true, assert);
		this.assertOnSideContentVisibility(L, SideContentVisibility.AlwaysShow, true, true, assert);
		this.assertOnSideContentVisibility(L, SideContentVisibility.ShowAboveL, true, true, assert);
		this.assertOnSideContentVisibility(L, SideContentVisibility.ShowAboveM, true, true, assert);
		this.assertOnSideContentVisibility(L, SideContentVisibility.ShowAboveS, true, true, assert);

		this.assertOnSideContentVisibility(XL, SideContentVisibility.NeverShow, true, true, assert);
		this.assertOnSideContentVisibility(XL, SideContentVisibility.AlwaysShow, true, true, assert);
		this.assertOnSideContentVisibility(XL, SideContentVisibility.ShowAboveL, true, true, assert);
		this.assertOnSideContentVisibility(XL, SideContentVisibility.ShowAboveM, true, true, assert);
		this.assertOnSideContentVisibility(XL, SideContentVisibility.ShowAboveS, true, true, assert);

		this.assertOnMainContentVisibility(M, true, true, assert);
		this.assertOnMainContentVisibility(L, true, true, assert);
		this.assertOnMainContentVisibility(XL, true, true, assert);
	});

	QUnit.test("Grid state",function(assert) {
		var SC_GRID_CELL_SELECTOR = "SCGridCell",
			MC_GRID_CELL_SELECTOR = "MCGridCell",
			HIDDEN_CLASS = "sapUiHidden",
			SPAN_SIZE_12_CLASS = "sapUiDSCSpan12",
			$sideContent = this._oDSC.$(SC_GRID_CELL_SELECTOR),
			$mainContent = this._oDSC.$(MC_GRID_CELL_SELECTOR);

		// both main and side content are visible
		this._oDSC._SCVisible = true;
		this._oDSC._MCVisible = true;

		$mainContent.addClass("test1 test2");
		$sideContent.addClass("test1 test2");

		this._oDSC._changeGridState();

		assert.ok(!$mainContent.hasClass("test1"), "Main content should not have 'test1' class");
		assert.ok(!$mainContent.hasClass("test2"), "Main content should not have 'test2' class");

		assert.ok(!$sideContent.hasClass("test1"), "Side content should not have 'test1' class");
		assert.ok(!$sideContent.hasClass("test2"), "Side content should not have 'test2' class");

		assert.ok($mainContent.hasClass("sapUiDSCSpan" + this._oDSC.getProperty("mcSpan")), "Main content has class 'sapUiDSCSpan" + this._oDSC.getProperty("mcSpan") + "' if both main and side content are visible");
		assert.ok($sideContent.hasClass("sapUiDSCSpan" + this._oDSC.getProperty("scSpan")), "Side content has class 'sapUiDSCSpan" + this._oDSC.getProperty("scSpan") + "' if both main and side content are visible");

		// both main and side content are hidden
		this._oDSC._SCVisible = false;
		this._oDSC._MCVisible = false;

		this._oDSC._changeGridState();

		assert.ok($mainContent.hasClass(HIDDEN_CLASS), "Main content has class '" + HIDDEN_CLASS + "' if both main and side content are hidden");
		assert.ok($sideContent.hasClass(HIDDEN_CLASS), "Side content has class '" + HIDDEN_CLASS + "' if both main and side content are hidden");

		// only main content is visible
		this._oDSC._SCVisible = false;
		this._oDSC._MCVisible = true;

		$mainContent.addClass("test1 test2");

		this._oDSC._changeGridState();

		assert.ok(!$mainContent.hasClass("test1"), "Main content should not have 'test1' class");
		assert.ok(!$mainContent.hasClass("test2"), "Main content should not have 'test2' class");

		assert.ok($mainContent.hasClass(SPAN_SIZE_12_CLASS), "Main content has class '" + SPAN_SIZE_12_CLASS + "' if only main content is visible");
		assert.ok($sideContent.hasClass(HIDDEN_CLASS), "Side content has class '" + HIDDEN_CLASS + "' if side content is hidden");

		// only side content is visible
		this._oDSC._SCVisible = true;
		this._oDSC._MCVisible = false;

		$sideContent.addClass("test1 test2");

		this._oDSC._changeGridState();

		assert.ok(!$sideContent.hasClass("test1"), "Side content should not have 'test1' class");
		assert.ok(!$sideContent.hasClass("test2"), "Side content should not have 'test2' class");

		assert.ok($mainContent.hasClass(HIDDEN_CLASS), "Main content has class '" + HIDDEN_CLASS + "' if side content is hidden");
		assert.ok($sideContent.hasClass(SPAN_SIZE_12_CLASS), "Side content has class '" + SPAN_SIZE_12_CLASS + "' if only side content is visible");

		this._oDSC._SCVisible = true;
		this._oDSC._MCVisible = true;
		this._oDSC.setSideContentFallDown(SideContentFallDown.BelowM);
		this._oDSC._bFixedSideContent = true;

		this._oDSC._changeGridState();

		assert.ok($mainContent.hasClass(MC_FIXED_CLASS), "Main content has class '" + MC_FIXED_CLASS + "' if side content is fixed size");
		assert.ok($sideContent.hasClass(SC_FIXED_CLASS), "Side content has class '" + SC_FIXED_CLASS + "' if main content is fixed size");

	});

	QUnit.test("Check if height should be set",function(assert) {
		this._oDSC.setProperty("scSpan", SPAN_SIZE_6);
		this._oDSC.setProperty("mcSpan", SPAN_SIZE_6);
		this._oDSC._MCVisible = true;
		this._oDSC._SCVisible = true;
		assert.ok(this._oDSC._shouldSetHeight(), "Height should be set if MCSpan and SCSPan equal 12 spans and both main and side content are visible.");

		this._oDSC.setProperty("scSpan", SPAN_SIZE_3);
		this._oDSC.setProperty("mcSpan", SPAN_SIZE_6);
		this._oDSC._MCVisible = true;
		this._oDSC._SCVisible = true;
		assert.ok(!this._oDSC._shouldSetHeight(), "Height should not be set if MCSpan and SCSPan do not equal 12 spans.");

		this._oDSC.setProperty("scSpan", SPAN_SIZE_6);
		this._oDSC.setProperty("mcSpan", SPAN_SIZE_6);
		this._oDSC._MCVisible = false;
		this._oDSC._SCVisible = true;
		assert.ok(this._oDSC._shouldSetHeight(), "Height should be set if either main or side is visible.");

		this._oDSC.setProperty("scSpan", SPAN_SIZE_6);
		this._oDSC.setProperty("mcSpan", SPAN_SIZE_6);
		this._oDSC._MCVisible = true;
		this._oDSC._SCVisible = false;
		assert.ok(this._oDSC._shouldSetHeight(), "Height should be set if either main or side is visible.");

		this._oDSC._bFixedSideContent = true;
		this._oDSC._MCVisible = true;
		this._oDSC._SCVisible = true;
		assert.ok(this._oDSC._shouldSetHeight(), "Height should be set if fixed side content is set.");

		this._oDSC.setSideContentVisibility(SideContentVisibility.NeverShow);
		this._oDSC._MCVisible = true;
		this._oDSC._SCVisible = true;
		assert.ok(this._oDSC._shouldSetHeight(), "Height should be set if side content and main content visible " +
				"but side content visibility is set to NeverShow.");
	});

	QUnit.test("Set main and side content span sizes",function(assert) {
		this._oDSC._setSpanSize(SPAN_SIZE_3, SPAN_SIZE_9);

		assert.strictEqual(this._oDSC.getProperty("mcSpan"), SPAN_SIZE_9, "Main content span size should be equal to " + SPAN_SIZE_9);
		assert.strictEqual(this._oDSC.getProperty("scSpan"), SPAN_SIZE_3, "Side content span size should be equal to " + SPAN_SIZE_3);
	});

	QUnit.module("Content Query", {
		beforeEach : async function() {
			this._oDSC = new DynamicSideContent({
				containerQuery: true
			});
			this.spy(this._oDSC, "_adjustToScreenSize");
			$("#qunit-fixture").width(960);
			this._oDSC.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach : function () {
			$("#qunit-fixture").width(1000); // Reset qunit fixture size to original (1000px);
			this._oDSC.destroy();
			this._oDSC = null;
		}
	});

	QUnit.test("On init with contentQuery _adjustToScreenSize method should be called", function (assert) {
		assert.ok(this._oDSC._adjustToScreenSize.called, "The resize event handler is fired once initially");
		assert.strictEqual(this._oDSC.getCurrentBreakpoint(), M, "The current breakpoint in this setup should be 'M'");
	});

	QUnit.module("Content positioning after rerendering", {
		beforeEach : async function() {
			this._oDSC = new DynamicSideContent({
				containerQuery: true,
				sideContentFallDown: "BelowM"
			});
			$("#qunit-fixture").width(200);
			this._oDSC.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach : function () {
			$("#qunit-fixture").width(1000); // Reset qunit fixture size to original (1000px);
			this._oDSC.destroy();
			this._oDSC = null;
		}
	});

	QUnit.test("After rerendering the visibility of the contents remains the same",async function(assert) {
		this._oDSC.invalidate();
		await nextUIUpdate();
		assert.ok(this._oDSC._MCVisible, "The main content is visible");
		assert.notOk(this._oDSC._SCVisible, "The side content is not visible");
	});

	QUnit.module("Construction / Destruction", {
		beforeEach : async function() {
			this._oDSC = new DynamicSideContent();
			this._oDSC.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach : function () {
			this._oDSC = null;
		}
	});

	QUnit.test("Dynamic side content is created",function(assert) {
		assert.strictEqual(this._oDSC.$().length, 1, "Dynamic side content is created in the dom.");
	});

	QUnit.test("Current breakpoint is set",function(assert) {
		assert.ok(this._oDSC.getCurrentBreakpoint(), "The current breakpoint of the page is set");
	});

	QUnit.test("Calculate the size of the main and side content according to the current breakpoint",function(assert) {
		this.spy(this._oDSC, "_setResizeData");

		assert.ok(!this._oDSC._setResizeData.calledOnce, "The size of the main and side content are set");
	});

	QUnit.test("Main content and Side content sliders are initialized",function(assert) {
		assert.ok(this._oDSC._oMCScroller, "Main content slider is set");
		assert.ok(this._oDSC._oSCScroller, "Side content slider is set");
	});

	QUnit.test("dispose",function(assert) {
		this._oDSC.destroy();
		this._oDSC.setContainerQuery(true);

		assert.strictEqual(this._oDSC._oSCScroller, null, "Side content scroller is null");
		assert.strictEqual(this._oDSC._oMCScroller, null, "Main content scroller is null");
	});

	QUnit.module("Interaction", {
		beforeEach : async function() {
			this._oDSC = new DynamicSideContent();
			this._oDSC.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach : function () {
			this._oDSC.destroy();
			this._oDSC = null;
		}
	});

	QUnit.test("setShowSideContent consistent visibility on breakpoint change and toggling",function(assert) {
		this._oDSC._currentBreakpoint = XL;
		this._oDSC.setShowSideContent(false);

		assert.ok(!this._oDSC.isSideContentVisible(), "Side content should be hidden");

		this._oDSC._currentBreakpoint = L;
		this._oDSC._changeGridState();
		assert.ok(!this._oDSC.isSideContentVisible(), "Side content should be hidden when changing to L breakpoint");

		this._oDSC._currentBreakpoint = M;
		this._oDSC._changeGridState();
		assert.ok(!this._oDSC.isSideContentVisible(), "Side content should be hidden when changing to M breakpoint");

		this._oDSC._currentBreakpoint = S;
		this._oDSC._changeGridState();
		assert.ok(!this._oDSC.isSideContentVisible(), "Side content should be hidden when changing to S breakpoint");

		this._oDSC._currentBreakpoint = M;
		this._oDSC._changeGridState();
		assert.ok(!this._oDSC.isSideContentVisible(), "Side content should be hidden after switching to M breakpoint");

		this._oDSC._currentBreakpoint = S;
		this._oDSC._changeGridState();
		this._oDSC.toggle();
		assert.ok(this._oDSC.isSideContentVisible(), "Side content should be now visible when changing to S breakpoint and toggling");
		assert.ok(!this._oDSC.isMainContentVisible(), "Main content should be now hidden when changing to S breakpoint and toggling");

		this._oDSC._currentBreakpoint = M;
		this._oDSC._changeGridState();
		assert.ok(this._oDSC.isSideContentVisible(), "Side content should be now visible after switching to M breakpoint after toggling on S breakpoint");

		this._oDSC._currentBreakpoint = S;
		this._oDSC._changeGridState();
		this._oDSC.toggle();
		this._oDSC.setShowSideContent(false);
		assert.ok(!this._oDSC.isSideContentVisible(), "Side content should be now hidden when changing to S breakpoint, toggling and closing the side content");
		assert.ok(this._oDSC.isMainContentVisible(), "Main content should be now visible when changing to S breakpoint, toggling and closing the side content");

	});

	QUnit.test("breakpointChanged is fired after the resizing is done", function (assert) {
		// prepare
		// first set to M so the both contents are visible
		this._oDSC._currentBreakpoint = M;
		this._oDSC._changeGridState();

		// Replacing jQuery width method to report stable browser screen resolution for the test
		var that = this;
		this._ojQueryWidthMethod = $.fn.width;
		$.fn.width = function (sWidth) {
			if (!sWidth && this[0] === window) {
				return 719;
			}
			return that._ojQueryWidthMethod.apply(this, arguments);
		};

		// Act
		this._oDSC.attachBreakpointChanged(function (oEvent) {
			// Assert
			// this will be called after _adjustToScreenSize
			assert.strictEqual(oEvent.getParameters().currentBreakpoint, "S", "Current breakpoint is S");
			assert.strictEqual(that._oDSC.isSideContentVisible(), false, "SideContent is hidden, when the breakpointChanged is fired on break point 'S'");
		});

		// Act
		this._oDSC._adjustToScreenSize();

		// clean up
		$.fn.width = this._ojQueryWidthMethod;
	});

	QUnit.test("breakpointChange event not fired initially", async function(assert) {
		var fnDone = assert.async(2),
			oDSC = new DynamicSideContent({containerQuery: true}),
			oBreakpointChangedSpy = this.spy(oDSC, "fireBreakpointChanged"),
			oSetBreakpointFromWidthSpy = this.spy(oDSC, "_setBreakpointFromWidth"),
			oContainer = document.getElementById("content"),
			sResizeListenerId,
			oAfterRenderingDelegate = {
				onAfterRendering: function () {
					sResizeListenerId = ResizeHandler.register(oDSC.getDomRef(), function() {
						// assert
						assert.ok(oSetBreakpointFromWidthSpy.callCount > oBreakpointChangedSpy.callCount, "breakpoinChange event is not fired initially");
						// clean
						oContainer.style.width = "";
						oDSC.removeDelegate(oAfterRenderingDelegate);
						ResizeHandler.deregister(sResizeListenerId);
						oDSC.destroy();
						fnDone();
					});

					// act
					oContainer.style.width = "50px";
				}
			};

		// prepare
		oDSC.addDelegate(oAfterRenderingDelegate);
		oDSC.placeAt("content");
		await nextUIUpdate();
	});

	QUnit.module("Screen reader", {
		beforeEach : async function() {
			this._oDSC = new DynamicSideContent({containerQuery: true});
			this._oDSC.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach : function () {
			this._oDSC = null;
		}
	});

	QUnit.test("Side Content has correct aria attributes",function(assert) {
		var sSideContentTag = Device.browser.firefox ? "div" : "aside",
				$sideContent = $("#" + this._oDSC.getId() + "-SCGridCell"),
		//$sideContent = this.oDSC.$().find("> aside"),
				oMessageBundle = Library.getResourceBundleFor("sap.ui.layout");

		assert.strictEqual($sideContent.length, 1, "Side Content has correct " + sSideContentTag + " tag");
		assert.strictEqual($sideContent.attr("role"), "complementary", "Side Content has correct role 'complementary'");
		assert.strictEqual($sideContent.attr("aria-label"), oMessageBundle.getText(SIDE_CONTENT_LABEL), "Side Content has correct 'aria-role' " + oMessageBundle.getText(SIDE_CONTENT_LABEL));
	});

	QUnit.module("Invalidation", {
		beforeEach : async function() {
			this._oDSC = new DynamicSideContent({showSideContent: false, containerQuery: true});
			this._oDSC.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach : function () {
			this._oDSC = null;
		}
	});

	QUnit.test("Side Content invisible after invalidation",async function(assert) {
		var SC_GRID_CELL_SELECTOR = "SCGridCell",
			HIDDEN_CLASS = "sapUiHidden";

		this._oDSC.invalidate();
		await nextUIUpdate();

		assert.ok(this._oDSC.$(SC_GRID_CELL_SELECTOR).hasClass(HIDDEN_CLASS), "Side content in invisible");
	});

});