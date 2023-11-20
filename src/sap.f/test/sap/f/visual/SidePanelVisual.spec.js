/*global describe,it,element,by,takeScreenshot,expect,browser*/

describe("sap.f.SidePanelVisual", function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.f.SidePanel';
	var iDefaultTimeout = 50000; // timeout for test execution in milliseconds

	// do tests for Right (default) position of the SidePanels
	_doTests();

	// do tests for Left position of the SidePanels
	_doTests(true);

	/**
	 * Calls all tests and makes all snapshots.
	 *
	 * In order to avoid code and test duplication, the tests are placed in a separate function that is called twice:
	 * - First call is without parameter, and makes snapshots of all tests for Right position of the SidePanels
	 * - Second call is with parameter, and makes snapshots of all tests for Left position of the SidePanels
	 *
	 * @param {boolean} bLeftPosition whether to toggle Side Panels positions to Left
	 */
	function _doTests(bLeftPosition) {
		var sPicAddon = bLeftPosition ? "-l" : "";
		var sTestAddon = bLeftPosition ? " (Left position)" : " (Right position)";

		// change position to Left if necessary
		bLeftPosition && _togglePosition();

		// Tests begin here

		// SidePanel with many action items

		it("SidePanel (many action items and overflow menu) - initial" + sTestAddon, function() {
			var oSidePanel1 = element(by.css("#SidePanel1 .sapFSPSide"));

			expect(takeScreenshot(oSidePanel1)).toLookAs("sidepanel_many_initial" + sPicAddon);

		}, iDefaultTimeout);

		it("SidePanel (many action items and overflow menu) - expand and collapse action bar" + sTestAddon, function() {
			var oSidePanel1 = element(by.css("#SidePanel1 .sapFSPSide")),
				oExpandCollapse1 = element(by.id("SidePanel1-expandCollapseButton"));

			oExpandCollapse1.click();
			expect(takeScreenshot(oSidePanel1)).toLookAs("sidepanel_many_actionbar_expanded" + sPicAddon);

			oExpandCollapse1.click();
			expect(takeScreenshot(oSidePanel1)).toLookAs("sidepanel_many_actionbar_collapsed" + sPicAddon);

		}, iDefaultTimeout);

		it("SidePanel (many action items and overflow menu) - select/deselect action item" + sTestAddon, function() {
			var oSidePanel1 = element(by.css("#SidePanel1 .sapFSPSide")),
				oItem1 = element(by.css("#SidePanel1 .sapFSPItem"));

			oItem1.click();
			expect(takeScreenshot(oSidePanel1)).toLookAs("sidepanel_many_select_actionitem" + sPicAddon);

			oItem1.click();
			expect(takeScreenshot(oSidePanel1)).toLookAs("sidepanel_many_deselect_actionitem" + sPicAddon);

		}, iDefaultTimeout);

		it("SidePanel (many action items and overflow menu) - select/deselect overflow action item" + sTestAddon, function() {
			var oSidePanel1 = element(by.css("#SidePanel1 .sapFSPSide")),
				oItem1 = element(by.css("#SidePanel1 .sapFSPOverflowItem")),
				oMenu1;

			oItem1.click();
			expect(takeScreenshot(oSidePanel1)).toLookAs("sidepanel_many_select_overflowitem" + sPicAddon);

			oMenu1 = element(by.css(".sapMMenu"));
			expect(takeScreenshot(oMenu1)).toLookAs("sidepanel_many_overflowmenu" + sPicAddon);

			oItem1.click();
			expect(takeScreenshot(oSidePanel1)).toLookAs("sidepanel_many_deselect_overflowitem" + sPicAddon);

		}, iDefaultTimeout);

		it("SidePanel - try to select disabled action item" + sTestAddon, function() {
			var oSidePanel1 = element(by.css("#SidePanel1 .sapFSPSide")),
				oDiabledItem = element(by.css("#SidePanel1 .sapFSPItem.sapFSPDisabled"));

			oDiabledItem.click();
			expect(takeScreenshot(oSidePanel1)).toLookAs("sidepanel_disabled_item_not_selected" + sPicAddon);

		}, iDefaultTimeout);

		// SidePanel with single action item

		it("SidePanel (single action item) - initial" + sTestAddon, function() {
			var oSidePanel2 = element(by.css("#SidePanel2 .sapFSPSide"));

			expect(takeScreenshot(oSidePanel2)).toLookAs("sidepanel_single_initial" + sPicAddon);

		}, iDefaultTimeout);

		it("SidePanel (single action item) - expand and collapse action bar" + sTestAddon, function() {
			var oSidePanel2 = element(by.css("#SidePanel2 .sapFSPSide")),
				oExpandCollapse2 = element(by.id("SidePanel2-expandCollapseButton")),
				oClose2;

			oExpandCollapse2.click();
			expect(takeScreenshot(oSidePanel2)).toLookAs("sidepanel_single_actionbar_expanded" + sPicAddon);

			oClose2 = element(by.id("SidePanel2-closeButton"));
			oClose2.click();
			expect(takeScreenshot(oSidePanel2)).toLookAs("sidepanel_single_actionbar_collapsed" + sPicAddon);

		}, iDefaultTimeout);

		// Tests end here

		// toggle position back to Right if necessary
		bLeftPosition && _togglePosition();

		/**
		 * Toggles Side Panels positions
		 */
		function _togglePosition() {
			// This is a dummy test that just toggles Side Panels positions
			it("(dummy) Toggle SidePanel positions", function() {
				var oPositionButton = element(by.css("#PositionButton"));
				oPositionButton.click();
			}, iDefaultTimeout);
		}
	}

});