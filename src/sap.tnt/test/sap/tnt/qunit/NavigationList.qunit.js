/*global QUnit sinon */

sap.ui.define([
	'sap/base/Log',
	"sap/ui/core/Core",
	"sap/ui/core/Element",
	"sap/ui/core/Lib",
	"sap/ui/core/library",
	"sap/ui/core/theming/Parameters",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/events/KeyCodes",
	"sap/ui/thirdparty/jquery",
	'sap/m/Text',
	'sap/m/App',
	'sap/m/Page',
	'sap/tnt/NavigationList',
	'sap/tnt/NavigationListItem',
	'sap/tnt/NavigationListGroup',
	'sap/ui/qunit/utils/waitForThemeApplied'
], function(
	Log,
	Core,
	Element,
	Library,
	coreLibrary,
	Parameters,
	QUnitUtils,
	KeyCodes,
	jQuery,
	Text,
	App,
	Page,
	NavigationList,
	NavigationListItem,
	NavigationListGroup,
	waitForThemeApplied
) {
	'use strict';

	// shortcut for sap.ui.core.OpenState
	var OpenState = coreLibrary.OpenState;

	// create and add app
	var oApp = new App("myApp", {initialPage: "navigationListPage"});
	oApp.placeAt("qunit-fixture");

	var oPage = new Page("navigationListPage", {
		title: "Navigation List"
	});
	oApp.addPage(oPage);

	function getNavigationList(selectedKey, collapsed) {
		return new NavigationList({
			selectedKey: selectedKey,
			expanded: !collapsed,
			items: [
				new NavigationListItem({
					text: 'Root 1',
					key: 'rootChild1',
					icon: 'sap-icon://employee',
					href: '#/rootChild1',
					target: '_blank',
					items: [
						new NavigationListItem({
							text: 'Child 1',
							key: 'child1',
							href: '#/child1',
							target: '_self'
						}),
						new NavigationListItem({
							text: 'Disabled Child',
							enabled: false
						}),
						new NavigationListItem({
							text: 'Child 3',
							key: 'child3',
							href: '#/child3'
						})
					]
				}),
				new NavigationListItem({
					text: 'Disabled Root',
					enabled: false,
					icon: 'sap-icon://employee',
					items: [
						new NavigationListItem({
							text: 'Child 1',
							enabled: false
						}),
						new NavigationListItem({
							text: 'Child 2'
						}),
						new NavigationListItem({
							text: 'Child 3'
						})
					]
				}),
				new NavigationListItem("groupItem3", {
					text: 'Root 2',
					key: 'root1',
					href: window.location.pathname + window.location.search + '#/root1', // same url, just different hash
					icon: 'sap-icon://employee',
					items: [
						new NavigationListItem({
							text: 'Child 1',
							enabled: false
						}),
						new NavigationListItem({
							text: 'Child 2'
						}),
						new NavigationListItem({
							text: 'Child 3'
						}),
						new NavigationListItem({
							text: 'Child 1'
						}),
						new NavigationListItem({
							text: 'Child 2'
						}),
						new NavigationListItem({
							text: 'Child 3'
						}),
						new NavigationListItem({
							text: 'Child 1'
						}),
						new NavigationListItem({
							text: 'Child 2'
						}),
						new NavigationListItem({
							text: 'Child 3'
						}),
						new NavigationListItem({
							text: 'Child 1'
						}),
						new NavigationListItem({
							text: 'Child 2'
						}),
						new NavigationListItem({
							text: 'Child 3'
						}),
						new NavigationListItem({
							text: 'Child 1'
						}),
						new NavigationListItem({
							text: 'Child 2'
						}),
						new NavigationListItem({
							text: 'Child 3'
						}),
						new NavigationListItem({
							text: 'Child 1'
						}),
						new NavigationListItem({
							text: 'Child 2'
						}),
						new NavigationListItem({
							text: 'Child 3'
						}),
						new NavigationListItem({
							text: 'Child 1'
						}),
						new NavigationListItem({
							text: 'Child 2'
						}),
						new NavigationListItem({
							text: 'Child 3'
						}),
						new NavigationListItem({
							text: 'Child 1'
						}),
						new NavigationListItem({
							text: 'Child 2'
						}),
						new NavigationListItem({
							text: 'Child 3'
						}),
						new NavigationListItem({
							text: 'Child 1'
						}),
						new NavigationListItem({
							text: 'Child 2'
						}),
						new NavigationListItem({
							text: 'Child 3'
						}),
						new NavigationListItem({
							text: 'Child 1'
						}),
						new NavigationListItem({
							text: 'Child 2'
						}),
						new NavigationListItem({
							text: 'Child 3'
						}),
						new NavigationListItem({
							text: 'Child 1'
						}),
						new NavigationListItem({
							text: 'Child 2'
						}),
						new NavigationListItem({
							text: 'Child 3'
						}),
						new NavigationListItem({
							text: 'Child 1'
						}),
						new NavigationListItem({
							text: 'Child 2'
						}),
						new NavigationListItem({
							text: 'Child 3'
						})
					]
				}),
				new NavigationListItem({
					text: 'Root 3',
					icon: 'sap-icon://employee',
					items: [
						new NavigationListItem({
							text: 'Child 1'
						}),
						new NavigationListItem({
							text: 'Child 2'
						}),
						new NavigationListItem({
							text: 'Child 3'
						})
					]
				}),
				new NavigationListItem({
					text: 'Root 4 - no child items'
				}),
				new NavigationListGroup("navGroup1", {
					text: "Root 5 - group with items",
					items: [
						new NavigationListItem({
							text: 'Child 1'
						}),
						new NavigationListItem({
							text: 'Child 2'
						}),
						new NavigationListItem({
							text: 'Child 3'
						})
					]
				})
			]
		});
	}

	QUnit.module("API and Rendering", {
		beforeEach: function () {
			this.navigationList = getNavigationList();
			oPage.addContent(this.navigationList);

			Core.applyChanges();
		},
		afterEach: function () {
			this.navigationList.destroy();
			this.navigationList = null;

			Core.applyChanges();
		}
	});

	QUnit.test("rendered", function (assert) {
		assert.strictEqual(this.navigationList.$().length, 1, "should render");
	});

	QUnit.test("created", function (assert) {
		assert.ok(Element.getElementById(this.navigationList.getId()), "created");
	});

	QUnit.test("contains elements and classes", function (assert) {
		assert.ok(this.navigationList.$().hasClass("sapTntNL"), "sapTntNL class is set");
		assert.strictEqual(this.navigationList.getDomRef().children.length, 8, "items number is correct");
		assert.strictEqual(this.navigationList.getDomRef().children[0].querySelector(".sapTntNLIItemsContainer").children.length, 3, "first root item's children are correct number");
		assert.strictEqual(this.navigationList.getDomRef().querySelectorAll("#navGroup1 ul li").length, 3, "first group's children are correct number");

		var aLinks = this.navigationList.$().find("a");

		assert.strictEqual(aLinks[0].getAttribute('href'), '#/rootChild1', 'href attr is correct');
		assert.strictEqual(aLinks[0].getAttribute('target'), '_blank', 'target attr is correct');

		assert.strictEqual(aLinks[1].getAttribute('href'), '#/child1', 'href attr is correct');
		assert.strictEqual(aLinks[1].getAttribute('target'), '_self', 'target attr is correct');
	});

	QUnit.test("list.setExpanded(false)", function (assert) {
		assert.notOk(this.navigationList.$().hasClass('sapTntNLCollapsed'), "expanded mode is ok");

		this.navigationList.setExpanded(false);
		Core.applyChanges();

		assert.ok(this.navigationList.$().hasClass('sapTntNLCollapsed'), "collapsed mode is ok");
	});

	QUnit.test("rootItem.setExpanded(false)", function (assert) {
		assert.notOk(this.navigationList.getItems()[2].getDomRef().querySelector(".sapTntNLIItemsContainer").classList.contains("sapTntNLIItemsContainerHidden"), "sapTntNLIItemsContainerHidden class is not set");

		this.navigationList.getItems()[2].setExpanded(false);
		Core.applyChanges();

		assert.ok(this.navigationList.getItems()[2].getDomRef().querySelector(".sapTntNLIItemsContainer").classList.contains("sapTntNLIItemsContainerHidden"), "sapTntNLIItemsContainerHidden class is set");
	});

	QUnit.test("Tooltips when expanded", function (assert) {
		// Arrange
		var oNestedItem = new NavigationListItem({
				text: "nestedItem",
				tooltip: "nestedItemTooltip"
			}),
			oItem = new NavigationListItem({
				text: "item1",
				tooltip: "item1tooltip",
				items: [
					oNestedItem
				]
			}),
			oNL = new NavigationList({
				items: [
					oItem
				]
			});
		oNL.placeAt("qunit-fixture");
		Core.applyChanges();

		// Assert
		assert.strictEqual(oItem.getDomRef("a").title, oItem.getTooltip());
		assert.strictEqual(oNestedItem.getDomRef("a").title, oNestedItem.getTooltip());

		// Clean up
		oNL.destroy();
	});

	QUnit.test("Tooltips when collapsed", function (assert) {
		// Arrange
		var oNestedItem = new NavigationListItem({
				text: "nestedItem",
				tooltip: "nestedItemTooltip"
			}),
			oItem = new NavigationListItem({
				text: "item1",
				tooltip: "item1tooltip",
				items: [
					oNestedItem
				]
			}),
			oNL = new NavigationList({
				expanded: false,
				items: [
					oItem
				]
			});
		oNL.placeAt("qunit-fixture");
		Core.applyChanges();

		// Act
		oItem.$().trigger("tap");
		var oItemInPopover = oNL._oPopover.getContent()[0].getItems()[0],
			oNestedItemInPopover = oNL._oPopover.getContent()[0].getItems()[0].getItems()[0];

		// Assert
		assert.strictEqual(oItemInPopover.getDomRef("a").title, oItem.getTooltip(), "Tooltip of item in popover is set correctly");
		assert.strictEqual(oNestedItemInPopover.getDomRef("a").title, oNestedItem.getTooltip(), "Tooltip of nested item in popover is set correctly");

		// Clean up
		oNL.destroy();
	});

	QUnit.test("Selection Indicator", function (assert) {
		var deferred = new jQuery.Deferred();
		var sExpectedDisplay = Parameters.get({
			name: [ "_sap_tnt_NavigationList_SelectionIndicatorDisplay"],
			callback: function (_sExpectedDisplay) {
				sExpectedDisplay = _sExpectedDisplay;
				deferred.resolve();
			}
		});

		if (sExpectedDisplay !== undefined) {
			deferred.resolve();
		}

		return deferred.then(function () {
			// Arrange
			var oItem = new NavigationListItem({
					text: "item"
				}),
				oNL = new NavigationList({
					items: [
						oItem
					]
				});
			oNL.placeAt("qunit-fixture");
			Core.applyChanges();

			// Assert
			assert.strictEqual(getComputedStyle(oItem.getDomRef().querySelector(".sapTntNLISelectionIndicator")).display, "none", "Selection indicator shouldn't be displayed on non-selected item");

			// Act
			oItem.$().trigger("tap");
			Core.applyChanges();

			// Assert
			assert.strictEqual(getComputedStyle(oItem.getDomRef().querySelector(".sapTntNLISelectionIndicator")).display, sExpectedDisplay, "Selection indicator should be displayed on selected item based on the theme");

			// Clean up
			oNL.destroy();
		});
	});

	QUnit.module("Lifecycle");

	QUnit.test("Popover is destroyed when NavigationList is destroyed", function (assert) {
		// Arrange
		var oItem = new NavigationListItem({
				text: "item",
				items: [
					new NavigationListItem({
						text: "nestedItem",
						tooltip: "nestedItemTooltip"
					})
				]
			}),
			oNL = new NavigationList({
				expanded: false,
				items: [
					oItem
				]
			});
		oNL.placeAt("qunit-fixture");
		Core.applyChanges();

		// Act
		oItem.$().trigger("tap");
		var oSpy = sinon.spy(oNL._oPopover, "destroy");
		oNL.destroy();

		// Assert
		assert.ok(oSpy.called);

		// Clean up
		oSpy.restore();
	});

	QUnit.module("Tab navigation and ARIA settings", {
		beforeEach: function () {
			this.navigationList = getNavigationList('rootChild1');
			oPage.addContent(this.navigationList);

			Core.applyChanges();
		},
		afterEach: function () {
			this.navigationList.destroy();
			this.navigationList = null;

			Core.applyChanges();
		}
	});

	QUnit.test('Tab navigation', function (assert) {
		this.navigationList.$().find('li:not(.sapTntNLISecondLevel)').each(function (index, item) {
			assert.ok(item.getAttribute('tabindex') === null, 'first level "li" element does not have a tab index.');
		});

		this.navigationList.$().find('div.sapTntNLIFirstLevel:not(.sapTntNLIDisabled) a').each(function (index, item) {
			assert.equal(item.getAttribute('tabindex'), '-1', jQuery(item).text() + ' has a tab index.');
		});

		this.navigationList.$().find('div.sapTntNLIFirstLevel.sapTntNLIDisabled a').each(function (index, item) {
			assert.notOk(item.getAttribute('tabindex'), jQuery(item).text() + ' does not have a tab index');
		});

		this.navigationList.$().find('li.sapTntNLISecondLevel:not(.sapTntNLIDisabled) a').each(function (index, item) {
			assert.equal(item.getAttribute('tabindex'), '-1', jQuery(item).text() + ' has a tab index.');
		});

		this.navigationList.$().find('li.sapTntNLISecondLevel.sapTntNLIDisabled a').each(function (index, item) {
			assert.ok(item.getAttribute('tabindex') === null, 'Disabled ' + jQuery(item).text() + ' does not have a tab index.');
		});
	});

	QUnit.test('Focus', function (assert) {
		var oFirstItem = this.navigationList.getItems()[0];
		oFirstItem.getDomRef("a").focus();
		this.clock.tick(500);
		assert.strictEqual(document.activeElement.textContent, "Root 1", "The first item is focused");

		var oDialog = new sap.m.Dialog();
		oFirstItem.attachSelect(function(){oDialog.open();});
		oFirstItem.fireSelect();
		Core.applyChanges();
		this.clock.tick(500);
		assert.ok(document.activeElement.classList.contains("sapMDialog"), "The dialog is focused");

		oDialog.close();
		Core.applyChanges();
		this.clock.tick(500);
		assert.strictEqual(document.activeElement.textContent, "Root 1", "The first item is focused again");
	});

	QUnit.test('ARIA attributes', function (assert) {

		var sExpectedAriaRoleDescription = Library.getResourceBundleFor("sap.tnt")
			.getText("NAVIGATION_LIST_ITEM_ROLE_DESCRIPTION_MENUITEM");

		// roles
		const oDomRef = this.navigationList.getDomRef();

		assert.strictEqual(oDomRef.role, "tree", "contains list with role tree");
		[...oDomRef.children].forEach((oElement) => {
			const sExpectedRole = "none";
			assert.strictEqual(oElement.role, sExpectedRole, `inside the list, elements have role ${sExpectedRole}`);
		});

		[...oDomRef.querySelectorAll(".sapTntNLI a")].forEach((oElement) => {
			assert.strictEqual(oElement.role, "treeitem", "inside the tree, the anchor elements have role treeitem");
		});

		// aria-owns
		const oItemWithChildren = this.navigationList.getItems()[0];
		const oChildrenContainerId = oItemWithChildren.getDomRef().querySelector("a").getAttribute("aria-owns");
		assert.strictEqual(
			document.getElementById(oChildrenContainerId).querySelectorAll(".sapTntNLI").length,
			oItemWithChildren.getItems().length,
			"on an item with nested items, the element with role treeitem correctly points to the list of children");

		// aria-expanded
		let currentItem = this.navigationList.$().find(".sapTntNLIFirstLevel a")[0];
		assert.strictEqual(currentItem.getAttribute("aria-expanded"), "true", jQuery(currentItem).text() + " has ARIA attribute expanded true.");

		// aria-current="page" on selected item
		assert.strictEqual(currentItem.getAttribute("aria-current"), "page", jQuery(currentItem).text() + " has ARIA attribute current=page.");

		const oldSelectedItem = this.navigationList.getItems()[0];
		const newSelectedItem = this.navigationList.getItems()[2];

		this.stub(NavigationListItem.prototype, "_openUrl", function () { });
		QUnitUtils.triggerEvent("tap", newSelectedItem.getDomRef());
		Core.applyChanges();
		this.clock.tick(500);

		assert.strictEqual(newSelectedItem.getDomRef("a").getAttribute("aria-current"), "page", "aria-current is added on newly selected item");
		assert.strictEqual(oldSelectedItem.getDomRef("a").getAttribute("aria-current"), null, "aria-current is removed from the previously selected item");

		QUnitUtils.triggerEvent("tap", oldSelectedItem.getDomRef());
		Core.applyChanges();
		this.clock.tick(500);

		this.navigationList.getItems()[0].setExpanded(false);
		Core.applyChanges();

		const oNavigationListGroup = this.navigationList.getItems()[5];
		assert.strictEqual(oNavigationListGroup.getDomRef("subtree").getAttribute("aria-label"), oNavigationListGroup.getText(), "Group's inner subtree has label containing the text of the group");

		currentItem = this.navigationList.getDomRef().querySelector("li a");
		assert.strictEqual(currentItem.getAttribute("aria-expanded"), "false", jQuery(currentItem).text() + " do not have ARIA attribute expanded.");

		var currentItemNoChildren = this.navigationList.getDomRef().querySelectorAll(".sapTntNLIFirstLevel")[4].querySelector("a");
		assert.strictEqual(currentItemNoChildren.hasAttribute("aria-expanded"), false, jQuery(currentItemNoChildren).text() + " has no ARIA attribute expanded.");

		this.navigationList.setExpanded(false);
		Core.applyChanges();

		var currentItemCollapsed = this.navigationList.getDomRef().querySelectorAll(".sapTntNLIFirstLevel")[2];
		assert.strictEqual(currentItemCollapsed.querySelector("a").hasAttribute("aria-expanded"), false, "Root 2 has no ARIA attribute expanded when NavigationList is collapsed.");
		assert.strictEqual(currentItemCollapsed.querySelector("a").getAttribute("aria-checked"), "false", 'aria-checked is set to false.');

		this.navigationList.getItems()[2]._toggle(true);
		assert.strictEqual(currentItemCollapsed.querySelector("a").getAttribute("aria-checked"), "true" ,"aria-checked is set to true.");
		assert.strictEqual(currentItemCollapsed.querySelector("a").getAttribute("aria-current"), null, "aria-current is not set.");

		//aria-haspopup
		this.navigationList.setExpanded(true);
		Core.applyChanges();

		assert.strictEqual(currentItem.hasAttribute("aria-haspopup"), false, "no aria-haspopup attribute when NavigationList is expanded");

		this.navigationList.setExpanded(false);
		Core.applyChanges();
		assert.strictEqual(currentItem.getAttribute("aria-haspopup"), "tree", "aria-haspopup is of type tree when NavigationList is collapsed");

		//aria-roledescription
		assert.strictEqual(currentItem.getAttribute('aria-roledescription'), sExpectedAriaRoleDescription, jQuery(currentItem).text() + ' has ARIA attribute roledescription.');
	});

	QUnit.module("ARIA", {
		beforeEach: function () {
			this.navigationList = getNavigationList();
			oPage.addContent(this.navigationList);

			Core.applyChanges();
		},
		afterEach: function () {
			this.navigationList.destroy();
			this.navigationList = null;

			Core.applyChanges();
		}
	});

	QUnit.test("Focus is prevented when clicking on <a> element", function (assert) {
		// Arrange
		var groupItem = this.navigationList.getItems()[0],
			anchor = groupItem.getDomRef().querySelector("a"),
			spy = sinon.spy(jQuery.Event.prototype, "preventDefault");

		// Act
		QUnitUtils.triggerMouseEvent(anchor, "mousedown");

		// Assert
		assert.ok(spy.called);

		// Clean up
		spy.restore();
	});

	QUnit.test('Anchors inside NavigationListItems should have correct roles and aria-role', function (assert) {
		var groupItem = this.navigationList.getItems()[0];

		var groupItemAnchorElement = groupItem.getDomRef().getElementsByTagName("a")[0];
		assert.equal(groupItemAnchorElement.getAttribute("role"), 'treeitem', "The anchor is with correct role");

		var secondLevelItemAnchorElement = groupItem.getDomRef().getElementsByTagName("a")[1];
		assert.equal(secondLevelItemAnchorElement.getAttribute("role"), 'treeitem', "The anchor is with correct role");

		this.navigationList.setExpanded(false);
		Core.applyChanges();

		groupItem = this.navigationList.getItems()[0];
		groupItemAnchorElement = groupItem.getDomRef().getElementsByTagName("a")[0];
		assert.strictEqual(groupItemAnchorElement.getAttribute("role"), "menuitemradio", "The anchor is with correct role");
	});

	QUnit.module('SelectedItem association', {
		beforeEach: function () {
			this.navigationList = getNavigationList();

			Core.applyChanges();
		},
		afterEach: function () {
			this.navigationList.destroy();
			this.navigationList = null;

			Core.applyChanges();
		}
	});

	QUnit.test('Passing a NavigationListItem for selectedItem', function (assert) {
		// arrange
		var result;
		var logSpy = sinon.spy(Log, 'warning');
		var listItem = this.navigationList.getItems()[2];

		// act
		result = this.navigationList.setSelectedItem(listItem);

		// assert
		assert.strictEqual(this.navigationList._selectedItem, listItem, 'The _selectedItem should be set');
		assert.strictEqual(this.navigationList.getSelectedItem().getId(), listItem.getId(), 'The association should be set');
		assert.strictEqual(logSpy.callCount, 0, 'No warning should be raised');
		assert.strictEqual(this.navigationList, result, 'The setSelectedItem should return this pointer');

		// clean
		Log.warning.restore();
	});

	QUnit.test("Passing a NavigationListItem's ID for selectedItem", function (assert) {
		// arrange
		var result;
		var logSpy = sinon.spy(Log, 'warning');
		var listItem = this.navigationList.getItems()[2].getId();

		// act
		result = this.navigationList.setSelectedItem(listItem);

		// assert
		assert.strictEqual(this.navigationList._selectedItem.getId(), listItem, 'The _selectedItem should be set');
		assert.strictEqual(this.navigationList.getSelectedItem().getId(), listItem, 'The association should be set');
		assert.strictEqual(logSpy.callCount, 0, 'No warning should be raised');
		assert.strictEqual(this.navigationList, result, 'The setSelectedItem should return this pointer');

		// clean
		Log.warning.restore();
	});

	QUnit.test('Passing a null should deselect the selected item', function (assert) {
		// arrange
		var result;
		var listItem = this.navigationList.getItems()[2];

		// act
		this.navigationList.setSelectedItem(listItem);

		// assert
		assert.strictEqual(this.navigationList.getSelectedItem().getId(), listItem.getId(), 'The selected item should be set');
		var toggleSpy = sinon.spy(listItem, '_toggle');

		// act
		result = this.navigationList.setSelectedItem(null);

		// assert
		assert.strictEqual(this.navigationList.getSelectedItem(), null, 'The selected item should be deselected');
		assert.strictEqual(this.navigationList, result, 'The setSelectedItem should return this pointer after deselecting the item');
		assert.strictEqual(toggleSpy.callCount, 1, 'The _toggle method of the item should be called');
		assert.ok(toggleSpy.calledWith(false), 'The _toggle method should be called to deselect');

		// clean
		listItem._toggle.restore();
	});

	QUnit.test('Passing an unexpected parameter type should trigger a warning', function (assert) {
		// arrange
		var result;
		var logSpy = sinon.spy(Log, 'warning');

		// act
		result = this.navigationList.setSelectedItem(1234);

		// assert
		assert.strictEqual(this.navigationList.getSelectedItem(), null, 'No item should be selected');
		assert.strictEqual(this.navigationList, result, 'The setSelectedItem should return "this" pointer despite the parameter being wrong');
		assert.strictEqual(logSpy.callCount, 1, 'A warning should be raised');

		// clean
		Log.warning.restore();
	});

	QUnit.test('Passing an unexpected parameter type should trigger a warning', function (assert) {
		// arrange
		var result;
		var logSpy = sinon.spy(Log, 'warning');

		// act
		result = this.navigationList.setSelectedItem(new Text());

		// assert
		assert.strictEqual(this.navigationList.getSelectedItem(), null, 'No item should be selected');
		assert.strictEqual(this.navigationList, result, 'The setSelectedItem should return "this" pointer despite the parameter being wrong');
		assert.strictEqual(logSpy.callCount, 1, 'A warning should be raised');

		// clean
		Log.warning.restore();
	});

	QUnit.test('Calling setSelectedItem before the NavigationList is rendered', function (assert) {
		// arrange
		const navigationList = new NavigationList({
			expanded: false
		});

		navigationList.placeAt("qunit-fixture");
		Core.applyChanges();

		const item = new NavigationListItem({ key: "itemKey" });
		const parentItem = new NavigationListItem({
			items: [item]
		});
		navigationList.addItem(parentItem);

		// act
		navigationList.setSelectedItem(item);

		// assert
		assert.ok(true, "There is no error");

		// act
		Core.applyChanges();

		// assert
		assert.strictEqual(navigationList.getSelectedItem() , item, "selectedItem is successfully set");
		assert.strictEqual(navigationList.getSelectedKey() , "itemKey", "selectedKey is successfully set");

		// clean up
		navigationList.destroy();
	});

	QUnit.module('selectedKey property', {
		beforeEach: function () {
		},
		afterEach: function () {
			this.navigationList.destroy();
			this.navigationList = null;
		}
	});

	QUnit.test('api', function (assert) {

		this.navigationList = getNavigationList('child1');
		oPage.addContent(this.navigationList);
		Core.applyChanges();

		assert.strictEqual(this.navigationList._selectedItem.getText(), 'Child 1', 'initial selection is correct');

		this.navigationList.setSelectedKey('child3');
		Core.applyChanges();

		assert.strictEqual(this.navigationList._selectedItem.getText(), 'Child 3', 'selection is correct');

		this.navigationList.setSelectedKey('');
		Core.applyChanges();

		assert.notOk(this.navigationList._selectedItem,'selection is removed');
	});

	QUnit.test('interaction', function (assert) {
		this.navigationList = getNavigationList();

		var oStub = sinon.stub(NavigationListItem.prototype, "_openUrl", function () { });

		oPage.addContent(this.navigationList);
		Core.applyChanges();

		assert.notOk(this.navigationList._selectedItem, 'no initial selection');

		this.navigationList.getItems()[0].getItems()[0]._selectItem();

		assert.strictEqual(this.navigationList.getSelectedKey(), 'child1', 'selection is correct');

		assert.ok(oStub.calledOnce, 'url is open');

		oStub.restore();
	});

	QUnit.module("Interaction", {
		beforeEach: function () {
			this.navigationList = getNavigationList();
			oPage.addContent(this.navigationList);

			Core.applyChanges();
		},
		afterEach: function () {
			this.navigationList.destroy();
			this.navigationList = null;

			Core.applyChanges();
		}
	});

	QUnit.test("click group expander", function (assert) {
		// arrange
		this.clock.restore(); // use real timeouts for this test
		const done = assert.async();

		// assert
		const oItem = this.navigationList.getItems()[3];
		const oItemChildrenContainer = oItem.getDomRef("subtree");
		assert.strictEqual(oItemChildrenContainer.classList.contains("sapTntNLIItemsContainerHidden"), false, "sapTntNLIItemsContainerHidden class is not set");

		// arrange
		const $expanderIcon = jQuery(oItem.getDomRef().querySelector(".sapTntNLIExpandIcon"));

		// act
		$expanderIcon.trigger("tap");

		Core.applyChanges();

		setTimeout(function () {
			// assert
			const oItem = this.navigationList.getItems()[3];
			const oItemChildrenContainer = oItem.getDomRef("subtree");
			assert.strictEqual(oItemChildrenContainer.classList.contains("sapTntNLIItemsContainerHidden"), true, "sapTntNLIItemsContainerHidden class is set");

			done();
		}.bind(this), 1000);
	});

	QUnit.test("Expand/collapse with keyboard", function (assert) {
		// Arrange
		var oItem = Element.getElementById("groupItem3"),
			$item = oItem.$(),
			$focusableElement = $item.find(".sapTntNLIFirstLevel [tabindex]");

		$focusableElement.trigger("focus");

		// Act collapse
		QUnitUtils.triggerKeydown($item, KeyCodes.ARROW_LEFT);
		Core.applyChanges();
		this.clock.tick(500);

		// Assert collapsed
		assert.strictEqual(oItem.getExpanded(), false, "The item collapses when left arrow is pressed");
		assert.ok($focusableElement.is(":focus"), "The item is still focused");


		// Act expand
		QUnitUtils.triggerKeydown($item, KeyCodes.ARROW_RIGHT);
		Core.applyChanges();
		this.clock.tick(500);

		// Assert expanded
		assert.strictEqual(oItem.getExpanded(), true, "The item expands when right arrow is pressed");
		assert.ok($focusableElement.is(":focus"), "The item is still focused");
	});

	QUnit.test("Expand/collapse with mouse", function (assert) {
		// Arrange
		var oItem = Element.getElementById("groupItem3"),
			$item = oItem.$(),
			$icon = $item.find(".sapTntNLIFirstLevel .sapTntNLIExpandIcon"),
			$iconTitle = $item.find(".sapTntNLIFirstLevel .sapTntNLIExpandIcon .sapUiIconTitle");
			// oGroup = Core.byId("navGroup1"),
			// $groupTitle = oGroup.$().find(".sapTntNLGroupText");

		// Act collapse
		QUnitUtils.triggerEvent("tap", $icon);
		Core.applyChanges();
		this.clock.tick(500);

		// Assert collapsed
		assert.notOk(oItem.getExpanded(), "The item collapses");

		// Act expand
		QUnitUtils.triggerEvent("tap", $icon);
		Core.applyChanges();
		this.clock.tick(500);

		// Assert expanded
		assert.ok(oItem.getExpanded(), "The item expands");

		// Act collapse
		QUnitUtils.triggerEvent("tap", $iconTitle);
		Core.applyChanges();
		this.clock.tick(500);

		// Assert collapsed
		assert.notOk(oItem.getExpanded(), "The item collapses");


		// Act expand
		QUnitUtils.triggerEvent("tap", $iconTitle);
		Core.applyChanges();
		this.clock.tick(500);

		// Assert expanded
		assert.ok(oItem.getExpanded(), "The item expands");

		// // Assert expanded
		// assert.ok(oItem.getExpanded(), "The group is expanded");

		// QUnitUtils.triggerEvent("tap", $groupTitle);
		// Core.applyChanges();
		// this.clock.tick(500);

		// // Assert expanded
		// assert.notOk(oItem.getExpanded(), "The group is now collapsed");
	});


	QUnit.test("select group", function (assert) {

		var bPassedArg,
			fnEventSpy = sinon.spy(function (oEvent) {
				bPassedArg = oEvent.getParameter("item");
			}),
			oStub = sinon.stub(NavigationListItem.prototype, "_openUrl", function () { });

		this.navigationList.attachItemSelect(fnEventSpy);

		const oTargetItem = this.navigationList.getItems()[0].getDomRef().querySelector(".sapTntNLI");
		assert.notOk(oTargetItem.classList.contains("sapTntNLISelected"), "sapTntNLISelected class is not set");

		var $group = jQuery(oTargetItem.querySelector("a"));
		$group.trigger("tap");

		Core.applyChanges();

		// wait 500ms
		this.clock.tick(500);

		assert.ok(oTargetItem.classList.contains("sapTntNLISelected"), "sapTntNLISelected class is set");

		assert.strictEqual(fnEventSpy.callCount, 1, "should fire select event once");
		assert.strictEqual(bPassedArg.getText(), "Root 1", "should pass the first item as argument");

		assert.ok(oStub.calledOnce, "url is open");

		oStub.restore();
	});

	QUnit.test("select group item", function (assert) {

		var bPassedArg,
			fnEventSpy = sinon.spy(function (oEvent) {
				bPassedArg = oEvent.getParameter('item');
			}),
			oStub = sinon.stub(NavigationListItem.prototype, "_openUrl", function () { });

		this.navigationList.attachItemSelect(fnEventSpy);

		var $groupItem = jQuery('.sapTntNL .sapTntNLISecondLevel').first();

		assert.notOk($groupItem.hasClass('sapTntNLISelected'), "sapTntNLISelected class is not set");

		$groupItem.trigger('tap');

		Core.applyChanges();

		// wait 500ms
		this.clock.tick(500);

		assert.ok($groupItem.hasClass('sapTntNLISelected'), "sapTntNLISelected class is set");

		assert.strictEqual(fnEventSpy.callCount, 1, "should fire select event once");
		assert.strictEqual(bPassedArg.getText(), 'Child 1', "should pass the first group item as argument");

		assert.ok(oStub.calledOnce, 'url is open');

		oStub.restore();
	});

	QUnit.test("popup list", function (assert) {
		assert.notOk(jQuery(".sapTntNLPopup").length, "popup list is not shown");
		assert.ok(!this.navigationList._oPopover, "should have no popover reference");

		var oStub = sinon.stub(NavigationListItem.prototype, "_openUrl", function () { });

		this.navigationList.setExpanded(false);
		Core.applyChanges();

		var $item = jQuery(".sapTntNL .sapTntNLIFirstLevel a").first();
		$item.trigger("tap");

		Core.applyChanges();
		// wait 500ms
		this.clock.tick(500);

		var oList = this.navigationList._oPopover.getContent(),
			oInnerListItem = oList[0].getItems()[0].getItems()[0],
			$InnerListItem = oInnerListItem.$("a")[0],
			$list = oList[0].$()[0];

		assert.strictEqual(jQuery(".sapTntNLPopup").length, 1, "popup list is shown");
		assert.ok(this.navigationList._oPopover, "should save popover reference");

		var $groupItem = jQuery(".sapTntNL .sapTntNLISecondLevel a").first();
		var popover = Element.closestTo($groupItem.closest(".sapMPopover")[0]);

		var sExpectedAriaRoleDescription = Library.getResourceBundleFor("sap.tnt")
			.getText("NAVIGATION_LIST_ITEM_ROLE_DESCRIPTION_TREE");

		assert.strictEqual($list.getAttribute("role"), "tree", "Role of the popup ul should be menubar");
		assert.strictEqual($list.getAttribute("aria-roledescription"), sExpectedAriaRoleDescription, "Role description of the popup is as expected");

		assert.strictEqual($InnerListItem.getAttribute("role"), "treeitem", "Role of the popup li should be treeitem");

		assert.strictEqual(popover.oPopup.getOpenState(), OpenState.OPEN, "should change popover status to OPEN");

		$groupItem.trigger("tap");

		Core.applyChanges();

		// wait 500ms
		this.clock.tick(500);

		assert.ok(popover.bIsDestroyed, "popover should be destroyed");
		assert.ok(!this.navigationList._oPopover, "should clean popover reference");

		assert.ok(oStub.calledTwice, "2 urls are open");

		oStub.restore();
	});

	QUnit.test("Click on item with 'href' set", function (assert) {
		// Arrange
		var anchor = Element.getElementById("groupItem3").getDomRef().querySelector("a"),
			sCurrHref = window.location.href;

		// Act
		anchor.click();

		// Assert
		assert.strictEqual(window.location.href, sCurrHref, "Default action when clicking on anchor tag is prevented.");
	});

	QUnit.module("Overflow behavior", {
		beforeEach: function () {
			this.navigationList = getNavigationList(undefined, true);
			oPage.addContent(this.navigationList);

			Core.applyChanges();
		},
		afterEach: function () {
			this.navigationList.destroy();
			this.navigationList = null;

			Core.applyChanges();
		}
	});

	QUnit.test("Resize", function (assert) {
		var navListDomRef = this.navigationList.getDomRef(),
			overflowItemDomRef = navListDomRef.querySelector(".sapTntNLOverflow");

		assert.ok(overflowItemDomRef, "Overflow item is created");
		assert.ok(overflowItemDomRef.classList.contains("sapTntNLIHidden"), "Overflow item is hidden");
		assert.notOk(navListDomRef.querySelectorAll("li.sapTntNLIHidden:not(.sapTntNLOverflow)").length, "there are no hidden items");

		navListDomRef.style.height = "100px";
		this.navigationList._updateOverflowItems();

		overflowItemDomRef = navListDomRef.querySelector(".sapTntNLOverflow");

		assert.ok(overflowItemDomRef, "Overflow item is created");
		assert.notOk(overflowItemDomRef.classList.contains("sapTntNLIHidden"), "Overflow item is visible");

		assert.strictEqual(navListDomRef.querySelectorAll(".sapTntNLIHidden:not(.sapTntNLOverflow)").length, 9, "9 items are hidden");

		navListDomRef.style.height = "500px";
		this.navigationList._updateOverflowItems();

		overflowItemDomRef = navListDomRef.querySelector(".sapTntNLOverflow");

		assert.ok(overflowItemDomRef.classList.contains("sapTntNLIHidden"), "Overflow item is hidden");
		assert.notOk(navListDomRef.querySelectorAll("li.sapTntNLIHidden:not(.sapTntNLOverflow)").length, "there are no hidden items");
	});

	QUnit.test("Selecting items", function (assert) {
		var navListDomRef = this.navigationList.getDomRef(),
			items = this.navigationList.getItems();

		navListDomRef.style.height = "100px";
		this.navigationList._updateOverflowItems();

		assert.notOk(items[0].getDomRef().classList.contains("sapTntNLIHidden"), "item 0 is visible");
		assert.ok(items[2].getDomRef().classList.contains("sapTntNLIHidden"), "item 2 is hidden");

		this.navigationList._selectItem({ item: items[2]});

		assert.ok(items[0].getDomRef().classList.contains("sapTntNLIHidden"), "item 0 is hidden");
		assert.notOk(items[2].getDomRef().classList.contains("sapTntNLIHidden"), "item 2 is visible");
	});

	QUnit.test("Overflow menu", function (assert) {
		var navListDomRef = this.navigationList.getDomRef(),
			items = this.navigationList.getItems(),
			overflowItemDomRef = navListDomRef.querySelector(".sapTntNLOverflow"),
			menu,
			menuDomRef;

		navListDomRef.style.height = "100px"; // Only first item and the overflow are visible
		this.navigationList._updateOverflowItems();

		QUnitUtils.triggerEvent("tap", overflowItemDomRef);

		menuDomRef = document.querySelector(".sapUiMnu");
		menu = Element.closestTo(menuDomRef);

		const aExpectedMenuItems = items.reduce((aResult, oItem) => {
			const oReturned = oItem.isA("sap.tnt.NavigationListGroup") ? [...oItem.getItems()] : oItem;
			return aResult.concat(oReturned);
		}, []);

		menu.getParent().getItems().forEach(function (item, index) {
			assert.strictEqual(item._navItem.getText(), aExpectedMenuItems[index + 1].getText(), "correct menu item is created");

			item.getItems().forEach(function(subItem, subItemIndex) {
				assert.strictEqual(subItem._navItem.getText(), item._navItem.getItems()[subItemIndex].getText(), "correct menu sub item is created");
			});
		});

		assert.ok(menuDomRef, "overflow menu is shown");

		QUnitUtils.triggerEvent("click", document.querySelector(".sapUiMnuItm:nth-child(2)"));

		Core.applyChanges();
		this.clock.tick(500);

		assert.notOk(document.querySelector(".sapUiMnu"), "overflow menu is destroyed");

		assert.ok(items[0].getDomRef().classList.contains("sapTntNLIHidden"), "item 0 is hidden");
		assert.notOk(items[2].getDomRef().classList.contains("sapTntNLIHidden"), "item 2 is visible");

		const oSelectedItem = items[4];
		this.navigationList._selectItem({ item: oSelectedItem});

		menu = this.navigationList._createOverflowMenu();

		const aExpectedMenuItemsAfterSelection = items.reduce((aResult, oItem) => {
			if (oItem === oSelectedItem) {
				return aResult;
			}

			const oReturned = oItem.isA("sap.tnt.NavigationListGroup") ? [...oItem.getItems()] : oItem;
			return aResult.concat(oReturned);
		}, []);

		menu.getItems().forEach(function (item, index) {
			assert.strictEqual(item._navItem.getText(), aExpectedMenuItemsAfterSelection[index].getText(), "correct menu item is created");

			item.getItems().forEach(function(subItem, subItemIndex) {
				assert.strictEqual(subItem._navItem.getText(), item._navItem.getItems()[subItemIndex].getText(), "correct menu sub item is created");
			});
		});

		menu.destroy();
	});

	QUnit.module("Navigation List Group", {
		beforeEach: function () {
			this.navigationList = getNavigationList();
			oPage.addContent(this.navigationList);

			Core.applyChanges();
		},
		afterEach: function () {
			this.navigationList.destroy();
			this.navigationList = null;

			Core.applyChanges();
		}
	});

	QUnit.test("On Collapsed NL, only the group children are visible", function (assert) {
		// arrange
		this.navigationList.setExpanded(false);
		Core.applyChanges();

		const oNavigationListGroup = this.navigationList.getItems()[5],
			aExpectedVisibleItems = oNavigationListGroup.getItems().map((oItem) => oItem.getDomRef()),
			oNavListDomRef = this.navigationList.getDomRef();

		assert.notOk(oNavigationListGroup.getDomRef(), "a dom ref for the group is not rendered");
		assert.strictEqual(aExpectedVisibleItems.every((oItem) => oNavListDomRef.contains(oItem)), true, "the children of the group are still rendered");
	});

	QUnit.test("On Expanded NL, the group title is also visible", function (assert) {
		this.navigationList.setExpanded(true);
		Core.applyChanges();

		const oNavigationListGroup = this.navigationList.getItems()[5],
			aExpectedVisibleItems = oNavigationListGroup.getItems().map((oItem) => oItem.getDomRef()),
			oNavListDomRef = this.navigationList.getDomRef();

		assert.ok(oNavigationListGroup.getDomRef().querySelector(".sapTntNLGroupText"), oNavigationListGroup.getText(), "the title of the group is rendered");
		assert.strictEqual(aExpectedVisibleItems.every((oItem) => oNavListDomRef.contains(oItem)), true, "the children of the group are still rendered");
	});

	QUnit.test("Groups can be collapsed and expanded to show/hide children", function (assert) {
		// arrange
		this.clock.restore(); // use real timeouts for this test
		const done = assert.async();

		const oNavigationListGroup = this.navigationList.getItems()[5],
			oDomRef = oNavigationListGroup.getDomRef();

		assert.strictEqual(oNavigationListGroup.getExpanded(), true, "expanded is set to true");
		assert.strictEqual(oDomRef.querySelector(".sapTntNLIItemsContainer").classList.contains("sapTntNLIItemsContainerHidden"), false, "the children are visible");
		QUnitUtils.triggerEvent("tap", oDomRef.querySelector(".sapTntNLI"));

		Core.applyChanges();

		setTimeout(() => {
			assert.strictEqual(oNavigationListGroup.getExpanded(), false, "expanded is set to false");
			assert.strictEqual(oDomRef.querySelector(".sapTntNLIItemsContainer").classList.contains("sapTntNLIItemsContainerHidden"), true, "the children are not visible");

			done();
		}, 500);

	});

	QUnit.test("When a group is in the Overflow, its children are directly placed in the overflow", function (assert) {
		this.navigationList.setExpanded(false);
		Core.applyChanges();

		const oNavListDomRef = this.navigationList.getDomRef(),
			oNavigationListGroup = this.navigationList.getItems()[5],
			overflowItemDomRef = oNavListDomRef.querySelector(".sapTntNLOverflow");

		oNavListDomRef.style.height = "100px"; // Only first item and the overflow are visible
		this.navigationList._updateOverflowItems();

		QUnitUtils.triggerEvent("tap", overflowItemDomRef);

		const oMenuDomRef = document.querySelector(".sapUiMnu"),
			oMenu = Element.closestTo(oMenuDomRef),
			aItemsInOverflow = oMenu.getParent().getItems().map((oMenuItem) => oMenuItem._navItem),
			aGroupItems = oNavigationListGroup.getItems();

		assert.strictEqual(aItemsInOverflow.includes(oNavigationListGroup), false, "group itself is not in the overflow");
		assert.strictEqual(aGroupItems.every((oItem) => aItemsInOverflow.includes(oItem)), true, "group items are in the overflow");
	});

	return waitForThemeApplied();
});
