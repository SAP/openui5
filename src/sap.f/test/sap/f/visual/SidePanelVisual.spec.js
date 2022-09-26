/*global describe,it,element,by,takeScreenshot,expect,browser*/

describe("sap.f.SidePanelVisual", function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.f.SidePanel';
	var iDefaultTimeout = 30000; // timeout for test execution in milliseconds

	// SidePanel with many action items

	it("SidePanel (many action items and overflow menu) - initial", function() {
		var oSidePanel1 = element(by.css("#SidePanel1 .sapFSPSide"));

		expect(takeScreenshot(oSidePanel1)).toLookAs("sidepanel_many_initial");

	}, iDefaultTimeout);

	it("SidePanel (many action items and overflow menu) - expand and collapse action bar", function() {
		var oSidePanel1 = element(by.css("#SidePanel1 .sapFSPSide")),
			oExpandCollapse1 = element(by.id("SidePanel1-expandCollapseButton"));

		oExpandCollapse1.click();
		expect(takeScreenshot(oSidePanel1)).toLookAs("sidepanel_many_actionbar_expanded");

		oExpandCollapse1.click();
		expect(takeScreenshot(oSidePanel1)).toLookAs("sidepanel_many_actionbar_collapsed");

	}, iDefaultTimeout);

	it("SidePanel (many action items and overflow menu) - select/deselect action item", function() {
		var oSidePanel1 = element(by.css("#SidePanel1 .sapFSPSide")),
			oItem1 = element(by.css("#SidePanel1 .sapFSPItem"));

		oItem1.click();
		expect(takeScreenshot(oSidePanel1)).toLookAs("sidepanel_many_select_actionitem");

		oItem1.click();
		expect(takeScreenshot(oSidePanel1)).toLookAs("sidepanel_many_deselect_actionitem");

	}, iDefaultTimeout);

	it("SidePanel (many action items and overflow menu) - select/deselect overflow action item", function() {
		var oSidePanel1 = element(by.css("#SidePanel1 .sapFSPSide")),
			oItem1 = element(by.css("#SidePanel1 .sapFSPOverflowItem")),
			oMenu1;

		oItem1.click();
		expect(takeScreenshot(oSidePanel1)).toLookAs("sidepanel_many_select_overflowitem");

		oMenu1 = element(by.css(".sapMMenu"));
		expect(takeScreenshot(oMenu1)).toLookAs("sidepanel_many_overflowmenu");

		oItem1.click();
		expect(takeScreenshot(oSidePanel1)).toLookAs("sidepanel_many_deselect_overflowitem");

	}, iDefaultTimeout);


	// SidePanel with single action item

	it("SidePanel (single action item) - initial", function() {
		var oSidePanel2 = element(by.css("#SidePanel2 .sapFSPSide"));

		expect(takeScreenshot(oSidePanel2)).toLookAs("sidepanel_single_initial");

	}, iDefaultTimeout);

	it("SidePanel (single action item) - expand and collapse action bar", function() {
		var oSidePanel2 = element(by.css("#SidePanel2 .sapFSPSide")),
			oExpandCollapse2 = element(by.id("SidePanel2-expandCollapseButton")),
			oClose2;

		oExpandCollapse2.click();
		expect(takeScreenshot(oSidePanel2)).toLookAs("sidepanel_single_actionbar_expanded");

		oClose2 = element(by.id("SidePanel2-closeButton"));
		oClose2.click();
		expect(takeScreenshot(oSidePanel2)).toLookAs("sidepanel_single_actionbar_collapsed");

	}, iDefaultTimeout);


});