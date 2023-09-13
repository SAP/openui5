/*global QUnit sinon */

sap.ui.define([
	'sap/base/Log',
	"sap/ui/core/Core",
	"sap/ui/core/Element",
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
	'sap/ui/qunit/utils/waitForThemeApplied'
], function(
	Log,
	Core,
	Element,
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
		}
	});

	QUnit.test("rendered", function (assert) {
		assert.strictEqual(this.navigationList.$().length, 1, "should render");
	});

	QUnit.test("created", function (assert) {
		assert.ok(Core.byId(this.navigationList.getId()), "created");
	});

	QUnit.test("contains elements and classes", function (assert) {
		assert.ok(this.navigationList.$().hasClass('sapTntNavLI'), "sapTntNavLI class is set");
		assert.strictEqual(this.navigationList.$().children().length, 5, "groups number is correct");
		assert.strictEqual(this.navigationList.$().children()[0].children[1].children.length, 3, "first group children are ok");

		var aLinks = this.navigationList.$().find('a');

		assert.strictEqual(aLinks[0].getAttribute('href'), '#/rootChild1', 'href attr is correct');
		assert.strictEqual(aLinks[0].getAttribute('target'), '_blank', 'target attr is correct');

		assert.strictEqual(aLinks[1].getAttribute('href'), '#/child1', 'href attr is correct');
		assert.strictEqual(aLinks[1].getAttribute('target'), '_self', 'target attr is correct');
	});

	QUnit.test("list.setExpanded(false)", function (assert) {

		assert.notOk(this.navigationList.$().hasClass('sapTntNavLICollapsed'), "expanded mode is ok");

		this.navigationList.setExpanded(false);
		Core.applyChanges();

		assert.ok(this.navigationList.$().hasClass('sapTntNavLICollapsed'), "collapsed mode is ok");
	});

	QUnit.test("group.setExpanded(false)", function (assert) {

		assert.notOk(jQuery(this.navigationList.$().children()[2].children[1]).hasClass('sapTntNavLIHiddenGroupItems'), "sapTntNavLIHiddenGroupItems class is not set");

		this.navigationList.getItems()[2].setExpanded(false);
		Core.applyChanges();

		assert.ok(jQuery(this.navigationList.$().children()[2].children[1]).hasClass('sapTntNavLIHiddenGroupItems'), "sapTntNavLIHiddenGroupItems class is set");
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
		assert.strictEqual(oItem.$().find(".sapTntNavLIGroup").get(0).title, oItem.getTooltip());
		assert.strictEqual(oNestedItem.getDomRef().title, oNestedItem.getTooltip());

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
		var oItemInPopover = oNL._popover.getContent()[0].getItems()[0],
			oNestedItemInPopover = oNL._popover.getContent()[0].getItems()[0].getItems()[0];

		// Assert
		assert.strictEqual(oItemInPopover.$().find(".sapTntNavLIGroup").get(0).title, oItem.getTooltip(), "Tooltip of item in popover is set correctly");
		assert.strictEqual(oNestedItemInPopover.getDomRef().title, oNestedItem.getTooltip(), "Tooltip of nested item in popover is set correctly");

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
			assert.strictEqual(getComputedStyle(oItem.getDomRef().querySelector(".sapTntNavLISelectionIndicator")).display, "none", "Selection indicator shouldn't be displayed on non-selected item");

			// Act
			oItem.$().trigger("tap");
			Core.applyChanges();

			// Assert
			assert.strictEqual(getComputedStyle(oItem.getDomRef().querySelector(".sapTntNavLISelectionIndicator")).display, sExpectedDisplay, "Selection indicator should be displayed on selected item based on the theme");

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
		var oSpy = sinon.spy(oNL._popover, "destroy");
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
		}
	});

	QUnit.test('Tab navigation', function (assert) {

		this.navigationList.$().find('li:not(.sapTntNavLIGroupItem)').each(function (index, item) {
			assert.ok(item.getAttribute('tabindex') === null, 'first level "li" element does not have a tab index.');
		});

		this.navigationList.$().find('div.sapTntNavLIGroup:not(.sapTntNavLIItemDisabled)').each(function (index, item) {
			assert.equal(item.getAttribute('tabindex'), '-1', jQuery(item).text() + ' has a tab index.');
		});

		this.navigationList.$().find('div.sapTntNavLIGroup.sapTntNavLIItemDisabled').each(function (index, item) {
			assert.notOk(item.getAttribute('tabindex'), jQuery(item).text() + ' does not have a tab index');
		});

		this.navigationList.$().find('li.sapTntNavLIGroupItem:not(.sapTntNavLIItemDisabled)').each(function (index, item) {
			assert.equal(item.getAttribute('tabindex'), '-1', jQuery(item).text() + ' has a tab index.');
		});

		this.navigationList.$().find('li.sapTntNavLIGroupItem.sapTntNavLIItemDisabled').each(function (index, item) {
			assert.ok(item.getAttribute('tabindex') === null, 'Disabled ' + jQuery(item).text() + ' does not have a tab index.');
		});
	});

	QUnit.test('Focus', function (assert) {
		var oFirstItem = this.navigationList.getItems()[0];
		oFirstItem.getDomRef().getElementsByClassName("sapTntNavLIItem ")[0].focus();
		this.clock.tick(500);
		assert.strictEqual(document.activeElement.title, "Root 1", "The first item is focused");

		var oDialog = new sap.m.Dialog();
		oFirstItem.attachSelect(function(){oDialog.open();});
		oFirstItem.fireSelect();
		Core.applyChanges();
		this.clock.tick(500);
		assert.ok(document.activeElement.classList.contains("sapMDialog"), "The dialog is focused");

		oDialog.close();
		Core.applyChanges();
		this.clock.tick(500);
		assert.strictEqual(document.activeElement.title, "Root 1", "The first item is focused again");
	});

	QUnit.test('ARIA attributes', function (assert) {

		var sExpectedAriaRoleDescription = Core.getLibraryResourceBundle("sap.tnt")
			.getText("NAVIGATION_LIST_ITEM_ROLE_DESCRIPTION_MENUITEM");

		// aria-level
		this.navigationList.$().find('li:not(.sapTntNavLIGroupItem)').each(function (index, item) {
			assert.ok(item.getAttribute('aria-level') === null, 'first level "li" element does not have ARIA attributes.');
			assert.strictEqual(item.getAttribute('aria-hidden'), 'true', 'first level "li" element has aria-hidden="true"');
		});

		this.navigationList.$().find('div.sapTntNavLIGroup').each(function (index, item) {
			assert.equal(item.getAttribute('aria-level'), '1', jQuery(item).text() + ' has  ARIA attributes.');
		});


		this.navigationList.$().find('li.sapTntNavLIGroupItem').each(function (index, item) {
			assert.equal(item.getAttribute('aria-level'), '2', jQuery(item).text() + ' has ARIA attributes.');
		});

		// aria-expanded
		var currentItem = this.navigationList.$().find('div.sapTntNavLIGroup')[0];
		assert.equal(currentItem.getAttribute('aria-expanded'), 'true', jQuery(currentItem).text() + ' has ARIA attribute expanded true.');

		// aria-selected
		assert.strictEqual(currentItem.getAttribute('aria-selected'), 'true', jQuery(currentItem).text() + ' has ARIA attribute selected true.');

		this.navigationList.getItems()[0].setExpanded(false);
		Core.applyChanges();
		currentItem = this.navigationList.$().find('li')[0];
		assert.notOk(currentItem.getAttribute('aria-expanded'), jQuery(currentItem).text() + ' do not have ARIA attribute expanded.');

		var currentItemNoChildren = this.navigationList.$().find('div.sapTntNavLIGroup')[4];
		assert.notOk(currentItemNoChildren.getAttribute('aria-expanded'), jQuery(currentItemNoChildren).text() + ' has no ARIA attribute expanded.');

		this.navigationList.setExpanded(false);
		Core.applyChanges();
		var currentItemCollapsed = this.navigationList.$().find('div.sapTntNavLIGroup')[2];
		assert.notOk(currentItemCollapsed.getAttribute('aria-expanded'), 'Root 2 has no ARIA attribute expanded when NavigationList is collapsed.');
		assert.strictEqual(currentItemCollapsed.parentElement.getAttribute('aria-checked'), 'false', 'aria-checked is set to false.');

		this.navigationList.getItems()[2]._select();
		assert.strictEqual(currentItemCollapsed.parentElement.getAttribute('aria-checked'), 'true' ,'aria-checked is set to true.');

		//aria-haspopup
		this.navigationList.setExpanded(true);
		Core.applyChanges();
		assert.strictEqual(currentItem.getAttribute("aria-haspopup"), null, "no aria-haspopup attribute when NavigationList is expanded");

		this.navigationList.setExpanded(false);
		Core.applyChanges();
		assert.strictEqual(currentItem.getAttribute("aria-haspopup"), "tree", "aria-haspopup is of type tree when NavigationList is collapsed");

		//aria-roledescription
		assert.equal(currentItem.getAttribute('aria-roledescription'), sExpectedAriaRoleDescription, jQuery(currentItem).text() + ' has ARIA attribute roledescription.');
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
		}
	});

	QUnit.test('Accessibility Text', function (assert) {
		var groupItem = this.navigationList.getItems()[0];
		var invisibleTextIdInitial = groupItem.getDomRef().getElementsByClassName("sapTntNavLIItem ")[0].getAttribute("aria-labelledby");
		var invisibleTextInitial = document.getElementById(invisibleTextIdInitial);

		assert.notOk(invisibleTextInitial, "accessibility text is initially empty");

		var groupItem = this.navigationList.getItems()[0];

		groupItem.onfocusin({
			srcControl: groupItem
		});

		var invisibleTextId = groupItem.getDomRef().getElementsByClassName("sapTntNavLIItem ")[0].getAttribute("aria-labelledby");
		var invisibleText = document.getElementById(invisibleTextId);

		assert.equal(invisibleText.innerText, 'Tree Item  Root 1 1 of 5', "accessibility text is correct");

		var secondLevelItem = groupItem.getItems()[2];

		this.navigationList.setSelectedItem(secondLevelItem);
		Core.applyChanges();

		secondLevelItem.onfocusin({
			srcControl: secondLevelItem
		});

		assert.equal(invisibleText.innerText, 'Tree Item Selected Child 3 3 of 3', "accessibility text is correct");

		this.navigationList.setExpanded(false);
		Core.applyChanges();

		groupItem.onfocusin({
			srcControl: groupItem
		});

		assert.equal(invisibleText.innerText, '', "accessibility text is empty");
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
		assert.equal(groupItemAnchorElement.getAttribute("role"), 'link', "The anchor is with correct role");

		var secondLevelItemAnchorElement = groupItem.getDomRef().getElementsByTagName("a")[1];
		assert.equal(secondLevelItemAnchorElement.getAttribute("role"), 'link', "The anchor is with correct role");

		this.navigationList.setExpanded(false);
		Core.applyChanges();

		groupItem = this.navigationList.getItems()[0];
		groupItemAnchorElement = groupItem.getDomRef().getElementsByTagName("a")[0];
		assert.equal(groupItemAnchorElement.getAttribute("role"), 'link', "The anchor is with correct role");
		assert.ok(groupItemAnchorElement.getAttribute("aria-hidden"), "The anchor is with correct value of aria-hidden attribute");
	});

	QUnit.module('SelectedItem association', {
		beforeEach: function () {
			this.navigationList = getNavigationList();
		},
		afterEach: function () {
			this.navigationList.destroy();
			this.navigationList = null;
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

	QUnit.test('Passing a NavigationListItem\'s ID for selectedItem', function (assert) {
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
		var selectSpy = sinon.spy(listItem, '_unselect');

		// act
		this.navigationList.setSelectedItem(listItem);

		// assert
		assert.strictEqual(this.navigationList.getSelectedItem().getId(), listItem.getId(), 'The selected item should be set');

		// act
		result = this.navigationList.setSelectedItem(null);

		// assert
		assert.strictEqual(this.navigationList.getSelectedItem(), null, 'The selected item should be deselected');
		assert.strictEqual(this.navigationList, result, 'The setSelectedItem should return this pointer after deselecting the item');
		assert.strictEqual(selectSpy.callCount, 1, 'The _unselect method of the item should be called');

		// clean
		listItem._unselect.restore();
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
		}
	});

	QUnit.test("click group expander", function (assert) {
		// arrange
		this.clock.restore(); // use real timeouts for this test
		var done = assert.async();

		// assert
		assert.notOk(jQuery(this.navigationList.$().children()[0].children[1]).hasClass('sapTntNavLIHiddenGroupItems'), "sapTntNavLIHiddenGroupItems class is not set");

		// arrange
		var $groupIcon = jQuery('.sapTntNavLI .sapTntNavLIExpandIcon').first();

		// act
		$groupIcon.trigger('tap');

		Core.applyChanges();

		setTimeout(function () {
			// assert
			assert.ok(jQuery(this.navigationList.$().children()[0].children[1]).hasClass('sapTntNavLIHiddenGroupItems'), "sapTntNavLIHiddenGroupItems class is set");

			done();
		}.bind(this), 1000);

	});

	QUnit.test("Expand/collapse with keyboard", function (assert) {
		// Arrange
		var oItem = Core.byId("groupItem3"),
			$item = oItem.$(),
			$focusableElement = $item.find(".sapTntNavLIGroup");

		$focusableElement.trigger("focus");

		// Act collapse
		QUnitUtils.triggerKeydown($item, KeyCodes.ARROW_LEFT);
		this.clock.tick(500);

		// Assert collapsed
		assert.strictEqual(oItem.getExpanded(), false, "The item collapses when left arrow is pressed");
		assert.ok($focusableElement.is(":focus"), "The item is still focused");


		// Act expand
		QUnitUtils.triggerKeydown($item, KeyCodes.ARROW_RIGHT);
		this.clock.tick(500);

		// Assert expanded
		assert.strictEqual(oItem.getExpanded(), true, "The item expands when right arrow is pressed");
		assert.ok($focusableElement.is(":focus"), "The item is still focused");
	});

	QUnit.test("Expand/collapse with mouse", function (assert) {
		// Arrange
		var oItem = Core.byId("groupItem3"),
			$item = oItem.$(),
			$icon = $item.find(".sapTntNavLIGroup .sapTntNavLIExpandIcon"),
			$iconTitle = $item.find(".sapTntNavLIGroup .sapTntNavLIExpandIcon .sapUiIconTitle");

		// Act collapse
		QUnitUtils.triggerEvent("tap", $icon);
		this.clock.tick(500);

		// Assert collapsed
		assert.notOk(oItem.getExpanded(), "The item collapses");


		// Act expand
		QUnitUtils.triggerEvent("tap", $icon);
		this.clock.tick(500);

		// Assert expanded
		assert.ok(oItem.getExpanded(), "The item expands");

		// Act collapse
		QUnitUtils.triggerEvent("tap", $iconTitle);
		this.clock.tick(500);

		// Assert collapsed
		assert.notOk(oItem.getExpanded(), "The item collapses");


		// Act expand
		QUnitUtils.triggerEvent("tap", $iconTitle);
		this.clock.tick(500);

		// Assert expanded
		assert.ok(oItem.getExpanded(), "The item expands");
	});

	QUnit.test("select group", function (assert) {

		var bPassedArg,
			fnEventSpy = sinon.spy(function (oEvent) {
				bPassedArg = oEvent.getParameter('item');
			}),
			oStub = sinon.stub(NavigationListItem.prototype, "_openUrl", function () { });

		this.navigationList.attachItemSelect(fnEventSpy);

		assert.notOk(jQuery(this.navigationList.$().children()[0].children[1].firstChild).hasClass('sapTntNavLIItemSelected'), "sapTntNavLIItemSelected class is not set");

		var $group = jQuery('.sapTntNavLI li div').first();

		$group.trigger('tap');

		Core.applyChanges();

		// wait 500ms
		this.clock.tick(500);

		assert.ok(jQuery(this.navigationList.$().children()[0].firstChild).hasClass('sapTntNavLIItemSelected'), "sapTntNavLIItemSelected class is set");

		assert.strictEqual(fnEventSpy.callCount, 1, "should fire select event once");
		assert.strictEqual(bPassedArg.getText(), 'Root 1', "should pass the first item as argument");

		assert.ok(oStub.calledOnce, 'url is open');

		oStub.restore();
	});

	QUnit.test("select group item", function (assert) {

		var bPassedArg,
			fnEventSpy = sinon.spy(function (oEvent) {
				bPassedArg = oEvent.getParameter('item');
			}),
			oStub = sinon.stub(NavigationListItem.prototype, "_openUrl", function () { });

		this.navigationList.attachItemSelect(fnEventSpy);

		var $groupItem = jQuery('.sapTntNavLI .sapTntNavLIGroupItem').first();

		assert.notOk($groupItem.hasClass('sapTntNavLIItemSelected'), "sapTntNavLIItemSelected class is not set");

		$groupItem.trigger('tap');

		Core.applyChanges();

		// wait 500ms
		this.clock.tick(500);

		assert.ok($groupItem.hasClass('sapTntNavLIItemSelected'), "sapTntNavLIItemSelected class is set");

		assert.strictEqual(fnEventSpy.callCount, 1, "should fire select event once");
		assert.strictEqual(bPassedArg.getText(), 'Child 1', "should pass the first group item as argument");

		assert.ok(oStub.calledOnce, 'url is open');

		oStub.restore();
	});

	QUnit.test("popup list", function (assert) {

		assert.notOk(jQuery('.sapTntNavLIPopup').length, "popup list is not shown");
		assert.ok(!this.navigationList._popover, "should have no popover reference");

		var oStub = sinon.stub(NavigationListItem.prototype, "_openUrl", function () { });

		this.navigationList.setExpanded(false);
		Core.applyChanges();

		var $item = jQuery('.sapTntNavLI .sapTntNavLIGroup').first();
		$item.trigger('tap');

		Core.applyChanges();

		// wait 500ms
		this.clock.tick(500);

		var oList = this.navigationList._popover.getContent(),
			oInnerListItem = oList[0].getItems()[0].getItems()[0],
			$InnerListItem = oInnerListItem.$()[0],
			$list = oList[0].$();

		assert.strictEqual(jQuery('.sapTntNavLIPopup').length, 1, "popup list is shown");
		assert.ok(this.navigationList._popover, "should save popover reference");

		var $groupItem = jQuery('.sapTntNavLI .sapTntNavLIGroupItem').first();
		var popover = Element.closestTo($groupItem.closest('.sapMPopover')[0]);

		var sExpectedAriaRoleDescription = Core.getLibraryResourceBundle("sap.tnt")
			.getText("NAVIGATION_LIST_ITEM_ROLE_DESCRIPTION_TREE");

		assert.strictEqual($list[0].getAttribute("role"), "tree", "Role of the popup ul should be menubar");
		assert.strictEqual($list[0].getAttribute("aria-roledescription"), sExpectedAriaRoleDescription, "Role description of the popup is as expected");

		sExpectedAriaRoleDescription = Core.getLibraryResourceBundle("sap.tnt")
			.getText("NAVIGATION_LIST_ITEM_ROLE_DESCRIPTION_TREE_ITEM");

		assert.strictEqual($InnerListItem.getAttribute("role"), "treeitem", "Role of the popup li should be treeitem");
		assert.strictEqual($InnerListItem.getAttribute("aria-roledescription"), sExpectedAriaRoleDescription, "Role description of the popup is as expected");

		assert.ok(popover.oPopup.getOpenState() === OpenState.OPEN, "should change popover status to OPEN");

		$groupItem.trigger('tap');

		Core.applyChanges();

		// wait 500ms
		this.clock.tick(500);

		assert.ok(popover.bIsDestroyed, "popover should be destroyed");
		assert.ok(!this.navigationList._popover, "should clean popover reference");

		assert.ok(oStub.calledTwice, '2 urls are open');

		oStub.restore();
	});

	QUnit.test("Click on item with 'href' set", function (assert) {
		// Arrange
		var anchor = Core.byId("groupItem3").getDomRef().querySelector("a"),
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
		}
	});

	QUnit.test("Resize", function (assert) {
		var navListDomRef = this.navigationList.getDomRef(),
			overflowItemDomRef = navListDomRef.querySelector(".sapTnTNavLIOverflow");

		assert.ok(overflowItemDomRef, "Overflow item is created");
		assert.ok(overflowItemDomRef.classList.contains("sapTnTNavLIHiddenItem"), "Overflow item is hidden");
		assert.notOk(navListDomRef.querySelectorAll("li.sapTnTNavLIHiddenItem:not(.sapTnTNavLIOverflow)").length, "there are no hidden items");

		navListDomRef.style.height = "100px";
		this.navigationList._updateOverflowItems();

		overflowItemDomRef = navListDomRef.querySelector(".sapTnTNavLIOverflow");

		assert.ok(overflowItemDomRef, "Overflow item is created");
		assert.notOk(overflowItemDomRef.classList.contains("sapTnTNavLIHiddenItem"), "Overflow item is visible");

		assert.strictEqual(navListDomRef.querySelectorAll("li.sapTnTNavLIHiddenItem:not(.sapTnTNavLIOverflow)").length, 4, "4 items are hidden");

		navListDomRef.style.height = "500px";
		this.navigationList._updateOverflowItems();

		overflowItemDomRef = navListDomRef.querySelector(".sapTnTNavLIOverflow");

		assert.ok(overflowItemDomRef.classList.contains("sapTnTNavLIHiddenItem"), "Overflow item is hidden");
		assert.notOk(navListDomRef.querySelectorAll("li.sapTnTNavLIHiddenItem:not(.sapTnTNavLIOverflow)").length, "there are no hidden items");
	});

	QUnit.test("Selecting items", function (assert) {
		var navListDomRef = this.navigationList.getDomRef(),
			items = this.navigationList.getItems();

		navListDomRef.style.height = "100px";
		this.navigationList._updateOverflowItems();

		assert.notOk(items[0].getDomRef().classList.contains("sapTnTNavLIHiddenItem"), "item 0 is visible");
		assert.ok(items[2].getDomRef().classList.contains("sapTnTNavLIHiddenItem"), "item 2 is hidden");

		this.navigationList._selectItem({ item: items[2]});

		assert.ok(items[0].getDomRef().classList.contains("sapTnTNavLIHiddenItem"), "item 0 is hidden");
		assert.notOk(items[2].getDomRef().classList.contains("sapTnTNavLIHiddenItem"), "item 2 is visible");
	});

	QUnit.test("Overflow menu", function (assert) {
		var navListDomRef = this.navigationList.getDomRef(),
			items = this.navigationList.getItems(),
			overflowItemDomRef = navListDomRef.querySelector(".sapTnTNavLIOverflow"),
			menu,
			menuDomRef;

		navListDomRef.style.height = "100px";
		this.navigationList._updateOverflowItems();

		QUnitUtils.triggerEvent("tap", overflowItemDomRef);

		menuDomRef = document.querySelector(".sapUiMnu");
		menu = Element.closestTo(menuDomRef);

		menu.getParent().getItems().forEach(function (item, index) {
			assert.strictEqual(item._navItem, items[index + 1], "correct menu item is created");

			item.getItems().forEach(function(subItem, subItemIndex) {
				assert.strictEqual(subItem._navItem, item._navItem.getItems()[subItemIndex], "correct menu sub item is created");
			});
		});

		assert.ok(menuDomRef, "overflow menu is shown");

		QUnitUtils.triggerEvent("click", document.querySelector(".sapUiMnuItm:nth-child(2)"));

		Core.applyChanges();
		this.clock.tick(500);

		assert.notOk(document.querySelector(".sapUiMnu"), "overflow menu is destroyed");

		assert.ok(items[0].getDomRef().classList.contains("sapTnTNavLIHiddenItem"), "item 0 is hidden");
		assert.notOk(items[2].getDomRef().classList.contains("sapTnTNavLIHiddenItem"), "item 2 is visible");

		this.navigationList._selectItem({ item: items[4]});

		menu = this.navigationList._createOverflowMenu();

		menu.getItems().forEach(function (item, index) {
			assert.strictEqual(item._navItem, items[index], "correct menu item is created");

			item.getItems().forEach(function(subItem, subItemIndex) {
				assert.strictEqual(subItem._navItem, item._navItem.getItems()[subItemIndex], "correct menu sub item is created");
			});
		});

		menu.destroy();
	});

	return waitForThemeApplied();
});
