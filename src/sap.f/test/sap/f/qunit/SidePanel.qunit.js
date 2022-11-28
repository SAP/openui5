/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/f/library",
	"sap/ui/Device",
	"sap/m/Button",
	"sap/m/Label",
	"sap/m/Text",
	"sap/m/VBox",
	"sap/f/SidePanel",
	"sap/f/SidePanelItem",
	"sap/ui/events/KeyCodes",
	"sap/ui/core/Core"
], function(
	qutils,
	createAndAppendDiv,
	fLibrary,
	Device,
	Button,
	Label,
	Text,
	VBox,
	SidePanel,
	SidePanelItem,
	KeyCodes,
	oCore
) {
	"use strict";

	var aItems = [
		{
			icon: "sap-icon://physical-activity",
			text: "Run"
		},
		{
			icon: "sap-icon://addresses",
			text: "Go home"
		},
		{
			icon: "sap-icon://building",
			text: "Go to the office"
		},
		{
			icon: "sap-icon://bed",
			text: "Go to sleep"
		},
		{
			icon: "sap-icon://flight",
			text: "Fly abroad"
		},
		{
			icon: "sap-icon://cargo-train",
			text: "Travel"
		},
		{
			icon: "sap-icon://cart",
			text: "Go to the mall"
		},
		{
			icon: "sap-icon://car-rental",
			text: "Drive your car"
		},
		{
			icon: "sap-icon://create-leave-request",
			text: "Go on vacation"
		},
		{
			icon: "sap-icon://family-protection",
			text: "Meet your family"
		},
		{
			icon: "sap-icon://lab",
			text: "Do a research"
		},
		{
			icon: "sap-icon://theater",
			text: "Go to the theater"
		},
		{
			icon: "sap-icon://taxi",
			text: "Take a taxi"
		},
		{
			icon: "sap-icon://vehicle-repair",
			text: "Repair your car"
		},
		{
			icon: "sap-icon://wounds-doc",
			text: "Visit a doctor"
		},
		{
			icon: "sap-icon://umbrella",
			text: "Take an umbrella"
		},
		{
			icon: "sap-icon://puzzle",
			text: "Solve a puzzle"
		},
		{
			icon: "sap-icon://picture",
			text: "Draw a picture"
		}
	];

	var parentDiv = createAndAppendDiv("test-parent");
	parentDiv.style.height = "400px";

	// Helper Functions

	// Adds specified amount of action items to the side panel
	function addItems(oSidePanel, iCount) {
		var iAdded = 0;

		if (!iCount) {
			iCount = aItems.length;
		}
		do {
			oSidePanel.addItem(new SidePanelItem({
				text: aItems[iAdded].text,
				icon: aItems[iAdded].icon
			}));
			iAdded++;
		} while (iAdded < iCount && iAdded < aItems.length);
	}

	// Tests

	QUnit.module("Public API", {
		beforeEach : function() {
			this.oSP = new SidePanel();
			addItems(this.oSP, 3);
			this.oSP.placeAt("test-parent");
			oCore.applyChanges();
			this.oSPDomRef = this.oSP.getDomRef();
		},
		afterEach : function() {
			this.oSP.destroy();
		}
	});

	QUnit.test("actionBarExpanded", function (assert) {
		var iSideBarWidth = this.oSPDomRef.querySelector(".sapFSPSide").clientWidth,
			iSidePanelWidth;

		// setup
		this.oSP.setSidePanelWidth("320px");
		oCore.applyChanges();

		iSidePanelWidth = parseInt(this.oSP.getSidePanelWidth());

		// assert
		assert.strictEqual(this.oSPDomRef.querySelector(".sapFSPActionBar").clientWidth, iSideBarWidth, "Action bar is not expanded initially");
		assert.notOk(this.oSPDomRef.classList.contains("sapFSPActionBarExpanded"), "CSS class for action bar expansion is not added");

		// act
		this.oSP.setActionBarExpanded(true);
		oCore.applyChanges();

		// assert
		assert.strictEqual(this.oSPDomRef.querySelector(".sapFSPActionBar").clientWidth, iSidePanelWidth, "Action bar is expanded");
		assert.ok(this.oSPDomRef.classList.contains("sapFSPActionBarExpanded"), "CSS class for action bar expansion is added");

		// act
		this.oSP.setActionBarExpanded(false);
		oCore.applyChanges();

		// assert
		assert.strictEqual(this.oSPDomRef.querySelector(".sapFSPActionBar").clientWidth, iSideBarWidth, "Action bar is not expanded");
		assert.notOk(this.oSP.getDomRef().classList.contains("sapFSPActionBarExpanded"), "CSS class for action bar expansion is not added");
	});

	QUnit.test("sidePanelWidth", function (assert) {
		// act
		this.oSP.setSidePanelWidth("400px");
		this.oSP.setActionBarExpanded(true);
		oCore.applyChanges();

		// assert
		assert.strictEqual(this.oSPDomRef.querySelector(".sapFSPActionBar").clientWidth, 320, "The width of expanded action bar is not affected when side content is not expanded");

		// act
		this.oSP.setActionBarExpanded(false);
		this.oSP.setSelectedItem(this.oSP.getItems()[0]);
		oCore.applyChanges();

		// assert
		assert.strictEqual(this.oSPDomRef.querySelector(".sapFSPSideInner").clientWidth, 400, "The width of expanded side content is proper");

		// act
		this.oSP.setActionBarExpanded(true);
		oCore.applyChanges();

		// assert
		assert.strictEqual(this.oSPDomRef.querySelector(".sapFSPActionBar").clientWidth, 400, "The width of expanded action bar equal to side panel width when this width is less than 560px");

		// act
		this.oSP.setSidePanelWidth("600px");
		oCore.applyChanges();

		// assert
		assert.strictEqual(this.oSPDomRef.querySelector(".sapFSPActionBar").clientWidth, 320, "The width of expanded action bar is not affected when side content is expanded, and its width is more than 560px");

	});

	QUnit.test("setSelectedItem", function (assert) {
		var	oSelectedItem = this.oSP.getItems()[1], // action item with index '1' will be selected later
			sSideContentHeaderId = this.oSP.getId() + "-header";

		// assert
		assert.notOk(this.oSP.getSelectedItem(), "There is no selected action item");
		assert.notOk(this.oSP._getSideContentExpanded(), "The side content is not expanded");
		assert.notOk(document.getElementById(sSideContentHeaderId), "Side content title doesn't exists");

		// act - select action item
		this.oSP.setSelectedItem(oSelectedItem.getId());
		oCore.applyChanges();

		// assert
		assert.strictEqual(this.oSP.getSelectedItem(), oSelectedItem.getId(), "Proper action item is selected");
		assert.ok(this.oSP._getSideContentExpanded(), "The side content is expanded");
		assert.ok(document.getElementById(sSideContentHeaderId), "Side content title exists");
		assert.strictEqual(document.getElementById(sSideContentHeaderId).querySelector(".sapMTitle > span").innerText, oSelectedItem.getText(), "Proper title is placed in the header side content");

		// act - deselect action item
		this.oSP.setSelectedItem();
		oCore.applyChanges();

		// assert
		assert.notOk(this.oSP.getSelectedItem(), "There is no selected action item");
		assert.notOk(this.oSP._getSideContentExpanded(), "The side content is not expanded");
		assert.notOk(document.getElementById(sSideContentHeaderId), "Side content title doesn't exists");
	});

	QUnit.test("ariaLabel", function (assert) {
		// Act
		this.oSP.setAriaLabel("My Side Panel");
		oCore.applyChanges();

		// Assert
		assert.strictEqual(this.oSPDomRef.querySelector(".sapFSPSide").getAttribute("aria-label"), "My Side Panel", "Side panel aria-label is properly set");
	});

	QUnit.module("Event", {
		beforeEach : function() {
			this.oSP = new SidePanel();
			this.mEventParameters = [];
			this.bPreventExpand = false;
			this.bPreventCollapse = false;
			addItems(this.oSP, 3);
			this.oSP.placeAt("test-parent");
			oCore.applyChanges();
			this.oSPDomRef = this.oSP.getDomRef();
			this.oSP.attachToggle(function(oEvent) {
				var mParameters = oEvent.getParameters(),
					bExpanded = mParameters["expanded"];

				if (!bExpanded) {
					if (this.bPreventCollapse) {
						this.bPreventCollapse = false;
						oEvent.preventDefault();
					}
				} else {
					if (this.bPreventExpand) {
						this.bPreventExpand = false;
						oEvent.preventDefault();
					}
				}

				this.mEventParameters.push(mParameters);
			}.bind(this));
		},
		afterEach : function() {
			this.oSP.destroy();
		}
	});

	QUnit.test("toggle event firing without preventing", function (assert) {
		var	oSelectedItem = this.oSP.getItems()[1]; // action item with index '1' will be selected later

		// act - select action item
		this.oSP.setSelectedItem(oSelectedItem.getId());
		oCore.applyChanges();

		// assert
		assert.strictEqual(this.oSP.getSelectedItem(), oSelectedItem.getId(), "Proper action item is selected");
		assert.ok(this.oSP._getSideContentExpanded(), "The side content is expanded");

		// act - deselect action item
		this.oSP.setSelectedItem();
		oCore.applyChanges();

		// assert
		assert.notOk(this.oSP.getSelectedItem(), "There is no action item selected");
		assert.notOk(this.oSP._getSideContentExpanded(), "The side content is collapsed");
	});

	QUnit.test("toggle event firing with preventing", function (assert) {
		var	oSelectedItem = this.oSP.getItems()[1]; // action item with index '1' will be selected later

		// act - select action item and prevent the event
		this.bPreventExpand = true;
		this.oSP.setSelectedItem(oSelectedItem.getId());
		oCore.applyChanges();

		// assert
		assert.strictEqual(this.oSP.getSelectedItem(), oSelectedItem.getId(), "Proper action item is selected");
		assert.notOk(this.oSP._getSideContentExpanded(), "The side content is not expanded because of prevention");

		// act - select the same action item now without preventing the event
		this.oSP.setSelectedItem();
		this.oSP.setSelectedItem(oSelectedItem.getId());
		oCore.applyChanges();

		// act - deselect action item and prevent the event
		this.bPreventCollapse = true;
		this.oSP.setSelectedItem();
		oCore.applyChanges();

		// assert
		assert.strictEqual(this.oSP.getSelectedItem(), oSelectedItem.getId(), "Selected action item is not deselected because of prevention");
		assert.ok(this.oSP._getSideContentExpanded(), "The side content is not collapsed because of prevention");
	});

	QUnit.module("Rendering", {
		beforeEach : function() {
			this.oSP = new SidePanel();
			this.oSP.placeAt("test-parent");
			oCore.applyChanges();
		},
		afterEach : function() {
			this.oSP.destroy();
		}
	});

	QUnit.test("Side panel when there is no action icon added", function (assert) {
		var oSPDomRef = this.oSP.getDomRef();

		// Assert
		assert.notOk(oSPDomRef.querySelector(".sapFSPSide"), "There is no side panel rendered");
	});

	QUnit.test("Side panel when there is one action icon added", function (assert) {
		var oSPDomRef = this.oSP.getDomRef(),
			oExpandCollapseButton = this.oSP.getAggregation("_arrowButton"),
			sSideContentHeaderId = this.oSP.getId() + "-header",
			oCloseButton,
			oSelectedItem;

		addItems(this.oSP, 1);
		oCore.applyChanges();

		oSelectedItem = this.oSP.getItems()[0]; // first/only action item

		// Assert
		assert.notOk(oSPDomRef.querySelector(".sapFSPItem"), "There is no action item rendered");

		// Act
		oExpandCollapseButton.firePress();
		oCore.applyChanges();
		oCloseButton = this.oSP.getAggregation("_closeButton");

		// Assert
		assert.ok(this.oSP._getSideContentExpanded(), "Pressing the Expand/Collapse button expands side content");
		assert.ok(document.getElementById(sSideContentHeaderId), "Side content title exists");
		assert.strictEqual(document.getElementById(sSideContentHeaderId).querySelector(".sapMTitle > span").innerText, oSelectedItem.getText(), "Proper title is placed in the header side content");
		assert.strictEqual(window.getComputedStyle(oExpandCollapseButton.getDomRef())["display"], "none", "Expand/Collapse button is not visible");
		assert.strictEqual(oCloseButton.getIcon(), "sap-icon://navigation-right-arrow", "Close button have the same icon as Expand/Collapse button should have");
	});

	QUnit.test("Side panel when there are many action icons added", function (assert) {
		var iVisibleItems = 0,
			oOverflowItemDomRef,
			oOverflowMenu,
			oSPDomRef,
			iOverflowMenuItems;

		addItems(this.oSP);
		oCore.applyChanges();
		oSPDomRef = this.oSP.getDomRef();
		oOverflowMenu = this.oSP.getAggregation("_overflowMenu");
		oOverflowItemDomRef = this.oSP.getAggregation("_overflowItem").getDomRef();

		// Act - open overflow menu
		oOverflowMenu.openBy(oOverflowItemDomRef);
		oOverflowMenu.close();
		oCore.applyChanges();

		// Get overflow menu items
		iOverflowMenuItems = oOverflowMenu.getItems().length;

		// Get visible action items
		oSPDomRef.querySelectorAll(".sapFSPItem:not(.sapFSPOverflowItem)").forEach(function(item) {
			if (item.style.display !== 'none') {
				iVisibleItems++;
			}
		});

		// Assert
		assert.ok(oOverflowItemDomRef, "Overflow item exists");
		assert.strictEqual(this.oSP.getItems().length - iVisibleItems, iOverflowMenuItems, "All invisible action items are added as overflow menu items");
		assert.strictEqual(window.getComputedStyle(oOverflowItemDomRef)["visibility"], "visible", "Overflow item is visible");
	});

	QUnit.test("Resize bar when side panel is resizable", function (assert) {

		// Act
		addItems(this.oSP);
		this.oSP.setSelectedItem(this.oSP.getItems()[0]);

		// Assert
		assert.notOk(this.oSP.getDomRef().querySelector(".sapFSPSplitterBar"), "There is no resize bar when the side panel is not resizable");

		// Act
		this.oSP.setSidePanelResizable(true);
		oCore.applyChanges();

		// Assert
		assert.ok(this.oSP.getDomRef().querySelector(".sapFSPSplitterBar"), "There is resize bar when the side panel is resizable");
	});

	QUnit.test("Side content and action bar", function (assert) {
		var done = assert.async(),
			oSPDomRef = this.oSP.getDomRef();

		addItems(this.oSP);

		// Act
		this.oSP.setSidePanelWidth("560px");
		this.oSP.setActionBarExpanded(true);
		oCore.applyChanges();

		// Assert
		assert.strictEqual(parseInt(window.getComputedStyle(oSPDomRef.querySelector(".sapFSPActionBar")).width), 320, "Action bar has width 320px when the side content is not expanded");

		// Act
		this.oSP.setSelectedItem(this.oSP.getItems()[0]);
		this.oSP.setActionBarExpanded(true);
		oCore.applyChanges();

		// Assert
		assert.notOk(oSPDomRef.querySelector(".sapFSPSide").classList.contains("sapFSPSplitView"), "There is no class added for side content and action bar split view");
		assert.strictEqual(parseInt(window.getComputedStyle(oSPDomRef.querySelector(".sapFSPActionBar")).width), 560, "Action bar takes the whole width when the side panel width is < 561px");

		// Act
		this.oSP.setSidePanelWidth("561px");
		oCore.applyChanges();

		// Assert
		setTimeout(function(){
			assert.ok(this.oSP.getDomRef().querySelector(".sapFSPSide").classList.contains("sapFSPSplitView"), "There is proper class added for side content and action bar split view");
			assert.strictEqual(parseInt(window.getComputedStyle(oSPDomRef.querySelector(".sapFSPActionBar")).width), 320, "Action bar has width 320px when the side panel width is >= 561px");
			done();
		}.bind(this), 0);
	});

	QUnit.test("Context menu", function (assert) {
		var oResizeBar;

		addItems(this.oSP);
		this.oSP.setSidePanelResizable(true);
		this.oSP.setSelectedItem(this.oSP.getItems()[0]);
		oCore.applyChanges();

		oResizeBar = this.oSP.getDomRef().querySelector(".sapFSPSplitterBar");
		oResizeBar.focus();

		// Act (Shift + F10)
		qutils.triggerKeydown(oResizeBar, KeyCodes.F10, true);
		oCore.applyChanges();

		assert.ok(document.querySelector(".sapMMenu"), "Context menu is opened after pressing Shift + F10");
	});

	QUnit.module("Resizing", {
		beforeEach : function() {
			this.oSP = new SidePanel();
			addItems(this.oSP, 3);
			this.oSP.placeAt("test-parent");
			oCore.applyChanges();
			this.oSPDomRef = this.oSP.getDomRef();
		},
		afterEach : function() {
			this.oSP.destroy();
		}
	});

	QUnit.test("Keyboard interactions", function (assert) {
		var oResizeBar,
			oSidePanel = this.oSPDomRef.querySelector(".sapFSPSide"),
			iMinWidth = 200,
			iMaxWidth = 600,
			iWidth = 400,
			iStep = this.oSP.getSidePanelResizeStep(),
			iLargerStep = this.oSP.getSidePanelResizeLargerStep();

		this.oSP.setSidePanelMinWidth(iMinWidth + "px");
		this.oSP.setSidePanelMaxWidth(iMaxWidth + "px");
		this.oSP.setSidePanelWidth(iWidth + "px");
		this.oSP.setSidePanelResizable(true);
		this.oSP.setSelectedItem(this.oSP.getItems()[0]);
		oCore.applyChanges();

		oResizeBar = this.oSPDomRef.querySelector(".sapFSPSplitterBar");
		oResizeBar.focus();

		// Act (Arrow Left)
		qutils.triggerKeydown(oResizeBar, KeyCodes.ARROW_LEFT);

		// Assert
		assert.strictEqual(parseInt(window.getComputedStyle(oSidePanel).width), iWidth + iStep, "Side panel width is increased with regular step when Arrow Left is pressed");

		// Act (Arrow Right)
		qutils.triggerKeydown(oResizeBar, KeyCodes.ARROW_RIGHT);

		// Assert
		assert.strictEqual(parseInt(window.getComputedStyle(oSidePanel).width), iWidth, "Side panel width is decreased with regular step when Arrow Right is pressed");

		// Act (Shift + Arrow Left)
		qutils.triggerKeydown(oResizeBar, KeyCodes.ARROW_LEFT, true);

		// Assert
		assert.strictEqual(parseInt(window.getComputedStyle(oSidePanel).width), iWidth + iLargerStep, "Side panel width is increased with larger step when Shift + Arrow Left is pressed");

		// Act (Shift + Arrow Right)
		qutils.triggerKeydown(oResizeBar, KeyCodes.ARROW_RIGHT, true);

		// Assert
		assert.strictEqual(parseInt(window.getComputedStyle(oSidePanel).width), iWidth, "Side panel width is decreased with larger step when Shift + Arrow Right is pressed");

		// Act (Home)
		qutils.triggerKeydown(oResizeBar, KeyCodes.HOME);

		// Assert
		assert.strictEqual(parseInt(window.getComputedStyle(oSidePanel).width), iMinWidth, "Side panel width is set to minimum width when Home is pressed");

		// Act (End)
		qutils.triggerKeydown(oResizeBar, KeyCodes.END);

		// Assert
		assert.strictEqual(parseInt(window.getComputedStyle(oSidePanel).width), iMaxWidth, "Side panel width is set to maximum width when End is pressed");

		// Act (Home)
		qutils.triggerKeydown(oResizeBar, KeyCodes.ENTER);

		// Assert
		assert.strictEqual(parseInt(window.getComputedStyle(oSidePanel).width), iWidth, "Side panel width is set to default width when Enter is pressed");

	});

	QUnit.module("Accessibility", {
		beforeEach : function() {
			this.oSP = new SidePanel();
			addItems(this.oSP);
			this.oSP.placeAt("test-parent");
			oCore.applyChanges();
			this.oSPDomRef = this.oSP.getDomRef();
		},
		afterEach : function() {
			this.oSP.destroy();
		}
	});

	QUnit.test("F6 Fast navigation groups", function (assert) {
		// Assert
		assert.strictEqual(this.oSPDomRef.querySelector(".sapFSPMain").getAttribute("data-sap-ui-fastnavgroup"), "true", "Main content is included in fast navigation");
		assert.strictEqual(this.oSPDomRef.querySelector(".sapFSPSide").getAttribute("data-sap-ui-fastnavgroup"), "true", "Side panel is included in fast navigation");

		// Act - open side content
		this.oSP.setSelectedItem(this.oSP.getItems()[1].getId());
		oCore.applyChanges();

		// Assert
		assert.strictEqual(this.oSPDomRef.querySelector(".sapFSPSideContent").getAttribute("data-sap-ui-fastnavgroup"), "true", "Side content is included in fast navigation");
	});

	QUnit.test("Role attributes", function (assert) {
		var oOverflowItemDomRef = this.oSP.getAggregation("_overflowItem").getDomRef();

		// Assert
		assert.strictEqual(this.oSPDomRef.querySelector(".sapFSPSide").getAttribute("role"), "region", "Side panel has proper role");
		assert.strictEqual(this.oSPDomRef.querySelector(".sapFSPActionBarListWrapper").getAttribute("role"), "toolbar", "Action bar wrapper has proper role");
		assert.strictEqual(this.oSPDomRef.querySelector(".sapFSPActionBarList").getAttribute("role"), "listbox", "Action bar has proper role");
		assert.strictEqual(this.oSPDomRef.querySelector(".sapFSPItem").getAttribute("role"), "option", "Action item has proper role");
		assert.strictEqual(oOverflowItemDomRef.getAttribute("role"), "button", "Overflow button has proper role");

		// Act - open side content
		this.oSP.setSelectedItem(this.oSP.getItems()[1].getId());
		oCore.applyChanges();

		// Assert
		assert.strictEqual(this.oSPDomRef.querySelector(".sapFSPSideContent").getAttribute("role"), "region", "Side content has proper role");
	});

	QUnit.test("ARIA attributes", function (assert) {
		var oResourceBundle = oCore.getLibraryResourceBundle("sap.f"),
			oOverflowItemDomRef = this.oSP.getAggregation("_overflowItem").getDomRef(),
			aItems = this.oSP.getItems(),
			sSPId = this.oSP.getId(),
			oResizeBar;

		// Assert
		assert.strictEqual(this.oSPDomRef.querySelector("#" + sSPId + "-expandCollapseButton").getAttribute("aria-label"), oResourceBundle.getText("SIDEPANEL_EXPAND_BUTTON_TEXT"), "Expand/Collapse button has proper aria-label when the action bar is collapsed");
		assert.strictEqual(this.oSPDomRef.querySelector("#" + sSPId + "-expandCollapseButton").getAttribute("aria-expanded"), "false", "Expand/Collapse button has proper aria-expanded attribute when the action bar is collapsed");

		// Act - expand action bar
		this.oSP.setActionBarExpanded(true);
		oCore.applyChanges();

		// Assert
		assert.strictEqual(this.oSPDomRef.querySelector("#" + sSPId + "-expandCollapseButton").getAttribute("aria-label"), oResourceBundle.getText("SIDEPANEL_COLLAPSE_BUTTON_TEXT"), "Expand/Collapse button has proper aria-label when the action bar is expanded");
		assert.strictEqual(this.oSPDomRef.querySelector("#" + sSPId + "-expandCollapseButton").getAttribute("aria-expanded"), "true", "Expand/Collapse button has proper aria-expanded attribute when the action bar is expanded");

		// Act - open side content
		this.oSP.setSelectedItem(aItems[1].getId());
		oCore.applyChanges();

		// Assert
		assert.strictEqual(this.oSPDomRef.querySelector(".sapFSPSide").getAttribute("aria-label"), oResourceBundle.getText("SIDEPANEL_DEFAULT_ARIA_LABEL"), "Side panel has default aria-label");
		assert.strictEqual(this.oSPDomRef.querySelector(".sapFSPSideContent").getAttribute("aria-label"), aItems[1].getText(), "Side content has default aria-label");
		assert.strictEqual(oOverflowItemDomRef.getAttribute("aria-haspopup"), "menu", "Overflow button has proper aria-haspopup attribute");
		assert.strictEqual(oOverflowItemDomRef.getAttribute("aria-expanded"), "false", "Overflow button has proper aria-expanded attribute when overflow menu is closed");

		// Act - make side panel resizable
		this.oSP.setSidePanelResizable(true);
		oCore.applyChanges();
		oResizeBar = this.oSPDomRef.querySelector(".sapFSPSplitterBar");

		// Assert
		assert.strictEqual(oResizeBar.getAttribute("aria-orientation"), "vertical", "Side panel resize bar has proper aria-orientation");
		assert.strictEqual(oResizeBar.getAttribute("aria-roledescription"), "splitter separator", "Side panel resize bar has proper aria-roledescription");
		assert.ok(oResizeBar.getAttribute("aria-valuenow"), "Side panel resize bar has aria-valuenow attribute");
		assert.ok(oResizeBar.getAttribute("aria-valuemin"), "Side panel resize bar has aria-valuemin attribute");
		assert.ok(oResizeBar.getAttribute("aria-valuemax"), "Side panel resize bar has aria-valuemax attribute");

	});

	QUnit.test("Action items title attributes", function (assert) {
		// Assert
		assert.strictEqual(this.oSPDomRef.querySelectorAll(".sapFSPItem")[0].getAttribute("title"), this.oSP.getItems()[0].getText(), "When action bar is not expanded, action items should have title");

		// Act - expand action bar
		this.oSP.setActionBarExpanded(true);
		oCore.applyChanges();

		// Assert
		assert.notOk(this.oSPDomRef.querySelectorAll(".sapFSPItem")[0].getAttribute("title"), "When action bar is expanded, action items shouldn't have title");
	});

	QUnit.module("Misc", {
		beforeEach : function() {
			this.oSP = new SidePanel();
			addItems(this.oSP, 3);
		},
		afterEach : function() {
			this.oSP.destroy();
		}
	});

	QUnit.test("Calculating and storing default side panel width", function (assert) {
		// act
		this.oSP.setSidePanelWidth("50%");

		// assert
		assert.notOk(this.oSP._sSidePanelWidth, "if the control is not rendered yet, the width cannot be calculated and stored properly");

		// act
		this.oSP.placeAt("test-parent");
		oCore.applyChanges();

		// assert
		assert.ok(this.oSP._sSidePanelWidth, "After the rendering of the control, the width can be calculated and stored properly");

	});

});