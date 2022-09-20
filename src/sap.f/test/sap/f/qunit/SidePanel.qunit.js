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
	"sap/f/SidePanelActionItem",
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
	SidePanelActionItem,
	KeyCodes,
	oCore
) {
	"use strict";

	var aActionItems = [
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
	function addActionItems(oSidePanel, iCount) {
		var iAdded = 0;

		if (!iCount) {
			iCount = aActionItems.length;
		}
		do {
			oSidePanel.addActionItem(new SidePanelActionItem({
				text: aActionItems[iAdded].text,
				icon: aActionItems[iAdded].icon
			}));
			iAdded++;
		} while (iAdded < iCount && iAdded < aActionItems.length);
	}

	// Tests

	QUnit.module("Public API", {
		beforeEach : function() {
			this.oSP = new SidePanel();
			addActionItems(this.oSP, 3);
			this.oSP.placeAt("test-parent");
			oCore.applyChanges();
			this.oSPDomRef = this.oSP.getDomRef();
		},
		afterEach : function() {
			this.oSP.destroy();
		}
	});

	QUnit.test("sideContentExpanded", function (assert) {
		// assert
		assert.notOk(this.oSPDomRef.querySelector(".sapFSPSideContent"), "Side content is not expanded initially");
		assert.notOk(this.oSPDomRef.classList.contains("sapFSPSideContentExpanded"), "CSS class for side content expansion is not added");

		// act
		this.oSP.setSideContentExpanded(true);
		oCore.applyChanges();

		// assert
		assert.ok(this.oSPDomRef.querySelector(".sapFSPSideContent"), "Side content is expanded");
		assert.ok(this.oSPDomRef.classList.contains("sapFSPSideContentExpanded"), "CSS class for side content expansion is added");

		// act
		this.oSP.setSideContentExpanded(false);
		oCore.applyChanges();

		// assert
		assert.notOk(this.oSPDomRef.querySelector(".sapFSPSideContent"), "Side content is not expanded");
		assert.notOk(this.oSP.getDomRef().classList.contains("sapFSPSideContentExpanded"), "CSS class for side content expansion is not added");
	});

	QUnit.test("actionBarExpanded", function (assert) {
		var iSideBarWidth = this.oSPDomRef.querySelector(".sapFSPSide").clientWidth,
			iSidePanelWidth;

		// setup
		this.oSP.setSidePanelWidth("320px");
		oCore.applyChanges();

		iSidePanelWidth = parseInt(this.oSP.getSidePanelWidth());

		// assert
		assert.strictEqual(this.oSPDomRef.querySelector(".sapFSPActionBarWrapper").clientWidth, iSideBarWidth, "Action bar is not expanded initially");
		assert.notOk(this.oSPDomRef.classList.contains("sapFSPActionBarExpanded"), "CSS class for action bar expansion is not added");

		// act
		this.oSP.setActionBarExpanded(true);
		oCore.applyChanges();

		// assert
		assert.strictEqual(this.oSPDomRef.querySelector(".sapFSPActionBarWrapper").clientWidth, iSidePanelWidth, "Action bar is expanded");
		assert.ok(this.oSPDomRef.classList.contains("sapFSPActionBarExpanded"), "CSS class for action bar expansion is added");

		// act
		this.oSP.setActionBarExpanded(false);
		oCore.applyChanges();

		// assert
		assert.strictEqual(this.oSPDomRef.querySelector(".sapFSPActionBarWrapper").clientWidth, iSideBarWidth, "Action bar is not expanded");
		assert.notOk(this.oSP.getDomRef().classList.contains("sapFSPActionBarExpanded"), "CSS class for action bar expansion is not added");
	});

	QUnit.test("sidePanelWidth", function (assert) {
		// act
		this.oSP.setSidePanelWidth("400px");
		this.oSP.setActionBarExpanded(true);
		oCore.applyChanges();

		// assert
		assert.strictEqual(this.oSPDomRef.querySelector(".sapFSPActionBarWrapper").clientWidth, 400, "The width of expanded action bar is proper");

		// act
		this.oSP.setActionBarExpanded(false);
		this.oSP.setSideContentExpanded(true);
		oCore.applyChanges();

		// assert
		assert.strictEqual(this.oSPDomRef.querySelector(".sapFSPSideInner").clientWidth, 400, "The width of expanded side content is proper");
	});

	QUnit.test("selectActionItem", function (assert) {
		var	oSelectedActionItem = this.oSP.getActionItems()[1], // action item with index '1' will be selected later
			sSideContentHeaderId = this.oSP.getId() + "-header";

		// assert
		assert.notOk(this.oSP.getSelectedActionItem(), "There is no selected action item");
		assert.notOk(this.oSP.getSideContentExpanded(), "The side content is not expanded");
		assert.notOk(document.getElementById(sSideContentHeaderId), "Side content title doesn't exists");

		// act - select action item
		this.oSP.selectActionItem(oSelectedActionItem.getId());
		oCore.applyChanges();

		// assert
		assert.strictEqual(this.oSP.getSelectedActionItem(), oSelectedActionItem.getId(), "Proper action item is selected");
		assert.ok(this.oSP.getSideContentExpanded(), "The side content is expanded");
		assert.ok(document.getElementById(sSideContentHeaderId), "Side content title exists");
		assert.strictEqual(document.getElementById(sSideContentHeaderId).querySelector(".sapMTitle > span").innerText, oSelectedActionItem.getText(), "Proper title is placed in the header side content");

		// act - deselect action item
		this.oSP.selectActionItem();
		oCore.applyChanges();

		// assert
		assert.notOk(this.oSP.getSelectedActionItem(), "There is no selected action item");
		assert.notOk(this.oSP.getSideContentExpanded(), "The side content is not expanded");
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
			addActionItems(this.oSP, 3);
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
		var	oSelectedActionItem = this.oSP.getActionItems()[1]; // action item with index '1' will be selected later

		// act - select action item
		this.oSP.selectActionItem(oSelectedActionItem.getId());
		oCore.applyChanges();

		// assert
		assert.strictEqual(this.oSP.getSelectedActionItem(), oSelectedActionItem.getId(), "Proper action item is selected");
		assert.ok(this.oSP.getSideContentExpanded(), "The side content is expanded");

		// act - deselect action item
		this.oSP.selectActionItem();
		oCore.applyChanges();

		// assert
		assert.notOk(this.oSP.getSelectedActionItem(), "There is no action item selected");
		assert.notOk(this.oSP.getSideContentExpanded(), "The side content is collapsed");
	});

	QUnit.test("toggle event firing with preventing", function (assert) {
		var	oSelectedActionItem = this.oSP.getActionItems()[1]; // action item with index '1' will be selected later

		// act - select action item and prevent the event
		this.bPreventExpand = true;
		this.oSP.selectActionItem(oSelectedActionItem.getId());
		oCore.applyChanges();

		// assert
		assert.strictEqual(this.oSP.getSelectedActionItem(), oSelectedActionItem.getId(), "Proper action item is selected");
		assert.notOk(this.oSP.getSideContentExpanded(), "The side content is not expanded because of prevention");

		// act - select the same action item now without preventing the event
		this.oSP.selectActionItem();
		this.oSP.selectActionItem(oSelectedActionItem.getId());
		oCore.applyChanges();

		// act - deselect action item and prevent the event
		this.bPreventCollapse = true;
		this.oSP.selectActionItem();
		oCore.applyChanges();

		// assert
		assert.strictEqual(this.oSP.getSelectedActionItem(), oSelectedActionItem.getId(), "Selected action item is not deselected because of prevention");
		assert.ok(this.oSP.getSideContentExpanded(), "The side content is not collapsed because of prevention");
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

	QUnit.test("Rendering of the side panel when there is no action icon added", function (assert) {
		var oSPDomRef = this.oSP.getDomRef();

		// Assert
		assert.notOk(oSPDomRef.querySelector(".sapFSPSide"), "There is no side panel rendered");
	});

	QUnit.test("Rendering of the side panel when there is one action icon added", function (assert) {
		var oSPDomRef = this.oSP.getDomRef(),
			oExpandCollapseButton = this.oSP.getAggregation("_arrowButton"),
			sSideContentHeaderId = this.oSP.getId() + "-header",
			oCloseButton,
			oSelectedActionItem;

		addActionItems(this.oSP, 1);
		this.oSP.placeAt("test-parent");
		oCore.applyChanges();

		oSelectedActionItem = this.oSP.getActionItems()[0]; // first/only action item

		// Assert
		assert.notOk(oSPDomRef.querySelector(".sapFSPActionItem"), "There is no action item rendered");

		// Act
		oExpandCollapseButton.firePress();
		oCore.applyChanges();
		oCloseButton = this.oSP.getAggregation("_closeButton");

		// Assert
		assert.ok(this.oSP.getSideContentExpanded(), "Pressing the Expand/Collapse button expands side content");
		assert.ok(document.getElementById(sSideContentHeaderId), "Side content title exists");
		assert.strictEqual(document.getElementById(sSideContentHeaderId).querySelector(".sapMTitle > span").innerText, oSelectedActionItem.getText(), "Proper title is placed in the header side content");
		assert.strictEqual(window.getComputedStyle(oExpandCollapseButton.getDomRef())["display"], "none", "Expand/Collapse button is not visible");
		assert.strictEqual(oCloseButton.getIcon(), "sap-icon://navigation-right-arrow", "Close button have the same icon as Expand/Collapse button should have");
	});

	QUnit.test("Rendering of the side panel when there are many action icons added", function (assert) {
		var iVisibleItems = 0,
			oOverflowItemDomRef,
			oOverflowMenu,
			oSPDomRef,
			iOverflowMenuItems;

		addActionItems(this.oSP);
		this.oSP.placeAt("test-parent");
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
		oSPDomRef.querySelectorAll(".sapFSPActionItem:not(.sapFSPOverflowActionItem)").forEach(function(item) {
			if (item.style.display !== 'none') {
				iVisibleItems++;
			}
		});

		// Assert
		assert.ok(oOverflowItemDomRef, "Overflow item exists");
		assert.strictEqual(window.getComputedStyle(oOverflowItemDomRef)["visibility"], "visible", "Overflow item is visible");
		assert.strictEqual(this.oSP.getActionItems().length - iVisibleItems, iOverflowMenuItems, "All invisible action items are added as overflow menu items");
	});

	QUnit.module("Accessibility", {
		beforeEach : function() {
			this.oSP = new SidePanel();
			addActionItems(this.oSP);
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
		this.oSP.selectActionItem(this.oSP.getActionItems()[1].getId());
		oCore.applyChanges();

		// Assert
		assert.strictEqual(this.oSPDomRef.querySelector(".sapFSPSideContent").getAttribute("data-sap-ui-fastnavgroup"), "true", "Side content is included in fast navigation");
	});

	QUnit.test("Role attributes", function (assert) {
		var oOverflowItemDomRef = this.oSP.getAggregation("_overflowItem").getDomRef();

		// Assert
		assert.strictEqual(this.oSPDomRef.querySelector(".sapFSPSide").getAttribute("role"), "region", "Side panel has proper role");
		assert.strictEqual(this.oSPDomRef.querySelector(".sapFSPActionBarWrapper").getAttribute("role"), "toolbar", "Action bar wrapper has proper role");
		assert.strictEqual(this.oSPDomRef.querySelector(".sapFSPActionBar").getAttribute("role"), "listbox", "Action bar has proper role");
		assert.strictEqual(this.oSPDomRef.querySelector(".sapFSPActionItem").getAttribute("role"), "option", "Action item has proper role");
		assert.strictEqual(oOverflowItemDomRef.getAttribute("role"), "button", "Overflow button has proper role");

		// Act - open side content
		this.oSP.selectActionItem(this.oSP.getActionItems()[1].getId());
		oCore.applyChanges();

		// Assert
		assert.strictEqual(this.oSPDomRef.querySelector(".sapFSPSideContent").getAttribute("role"), "region", "Side content has proper role");
	});

	QUnit.test("ARIA attributes", function (assert) {
		var oResourceBundle = oCore.getLibraryResourceBundle("sap.f"),
			oOverflowItemDomRef = this.oSP.getAggregation("_overflowItem").getDomRef(),
			aActionItems = this.oSP.getActionItems(),
			sSPId = this.oSP.getId();

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
		this.oSP.selectActionItem(aActionItems[1].getId());
		oCore.applyChanges();

		// Assert
		assert.strictEqual(this.oSPDomRef.querySelector(".sapFSPSide").getAttribute("aria-label"), oResourceBundle.getText("SIDEPANEL_DEFAULT_ARIA_LABEL"), "Side panel has default aria-label");
		assert.strictEqual(this.oSPDomRef.querySelector(".sapFSPSideContent").getAttribute("aria-label"), aActionItems[1].getText(), "Side content has default aria-label");
		assert.strictEqual(oOverflowItemDomRef.getAttribute("aria-haspopup"), "menu", "Overflow button has proper aria-haspopup attribute");
		assert.strictEqual(oOverflowItemDomRef.getAttribute("aria-expanded"), "false", "Overflow button has proper aria-expanded attribute when overflow menu is closed");
	});

	QUnit.test("Action items title attributes", function (assert) {
		// Assert
		assert.strictEqual(this.oSPDomRef.querySelectorAll(".sapFSPActionItem")[0].getAttribute("title"), this.oSP.getActionItems()[0].getText(), "When action bar is not expanded, action items should have title");

		// Act - expand action bar
		this.oSP.setActionBarExpanded(true);
		oCore.applyChanges();

		// Assert
		assert.notOk(this.oSPDomRef.querySelectorAll(".sapFSPActionItem")[0].getAttribute("title"), "When action bar is expanded, action items shouldn't have title");
	});

});