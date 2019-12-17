/*global QUnit sinon */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	'jquery.sap.global',
	'sap/base/Log',
	"sap/ui/core/Core",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/events/KeyCodes",
	'sap/ui/model/json/JSONModel',
	'sap/m/Text',
	'sap/m/App',
	'sap/m/Page',
	'sap/tnt/NavigationList',
	'sap/tnt/NavigationListItem',
	'sap/ui/qunit/utils/waitForThemeApplied'
], function(
	jQuery,
	Log,
	Core,
	QUnitUtils,
	KeyCodes,
	JSONModel,
	Text,
	App,
	Page,
	NavigationList,
	NavigationListItem,
	waitForThemeApplied) {
	'use strict';

	// create JSON model instance
	var oModel = new JSONModel();

	// create and add app
	var oApp = new App("myApp", {initialPage: "navigationListPage"});
	oApp.placeAt("qunit-fixture");

	var oPage = new Page("navigationListPage", {
		title: "Navigation List"
	});
	oApp.addPage(oPage);

	function getNavigationList(selectedKey) {
		return new NavigationList({
			selectedKey: selectedKey,
			items: [
				new NavigationListItem({
					text: 'Root 1',
					icon: 'sap-icon://employee',
					items: [
						new NavigationListItem({
							text: 'Child 1',
							key: 'child1'
						}),
						new NavigationListItem({
							text: 'Disabled Child',
							enabled: false
						}),
						new NavigationListItem({
							text: 'Child 3',
							key: 'child3'
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

			sap.ui.getCore().applyChanges();
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
		assert.ok(sap.ui.getCore().byId(this.navigationList.getId()), "created");
	});

	QUnit.test("contains elements and classes", function (assert) {
		assert.ok(this.navigationList.$().hasClass('sapTntNavLI'), "sapTntNavLI class is set");
		assert.strictEqual(this.navigationList.$().children().length, 5, "groups number is correct");
		assert.strictEqual(this.navigationList.$().children()[0].children[1].children.length, 3, "first group children are ok");
	});

	QUnit.test("list.setExpanded(false)", function (assert) {

		assert.notOk(this.navigationList.$().hasClass('sapTntNavLICollapsed'), "expanded mode is ok");

		this.navigationList.setExpanded(false);
		sap.ui.getCore().applyChanges();

		assert.ok(this.navigationList.$().hasClass('sapTntNavLICollapsed'), "collapsed mode is ok");
	});

	QUnit.test("group.setExpanded(false)", function (assert) {

		assert.notOk(jQuery(this.navigationList.$().children()[2].children[1]).hasClass('sapTntNavLIHiddenGroupItems'), "sapTntNavLIHiddenGroupItems class is not set");

		this.navigationList.getItems()[2].setExpanded(false);
		sap.ui.getCore().applyChanges();

		assert.ok(jQuery(this.navigationList.$().children()[2].children[1]).hasClass('sapTntNavLIHiddenGroupItems'), "sapTntNavLIHiddenGroupItems class is set");
	});

	QUnit.module("Tab navigation and ARIA settings", {
		beforeEach: function () {
			this.navigationList = getNavigationList();
			oPage.addContent(this.navigationList);

			sap.ui.getCore().applyChanges();
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

	QUnit.test('ARIA attributes', function (assert) {

		// aria-level
		this.navigationList.$().find('li:not(.sapTntNavLIGroupItem)').each(function (index, item) {
			assert.ok(item.getAttribute('aria-level') === null, 'first level "li" element does not have ARIA attributes.');
		});

		this.navigationList.$().find('div.sapTntNavLIGroup').each(function (index, item) {
			assert.equal(item.getAttribute('aria-level'), '1', jQuery(item).text() + ' has  ARIA attributes.');
		});


		this.navigationList.$().find('li.sapTntNavLIGroupItem').each(function (index, item) {
			assert.equal(item.getAttribute('aria-level'), '2', jQuery(item).text() + ' has ARIA attributes.');
		});

		//aria-expanded
		var currentItem = this.navigationList.$().find('div.sapTntNavLIGroup')[0];
		assert.equal(currentItem.getAttribute('aria-expanded'), 'true', jQuery(currentItem).text() + ' has ARIA attribute expanded true.');

		this.navigationList.getItems()[0].setExpanded(false);
		sap.ui.getCore().applyChanges();
		currentItem = this.navigationList.$().find('div.sapTntNavLIGroup')[0];
		assert.equal(currentItem.getAttribute('aria-expanded'), 'false', jQuery(currentItem).text() + ' has ARIA attribute expanded false.');

		var currentItemNoChildren = this.navigationList.$().find('div.sapTntNavLIGroup')[4];
		assert.notOk(currentItemNoChildren.getAttribute('aria-expanded'), jQuery(currentItemNoChildren).text() + ' has no ARIA attribute expanded.');

		this.navigationList.setExpanded(false);
		sap.ui.getCore().applyChanges();
		var currentItemCollapsed = this.navigationList.$().find('div.sapTntNavLIGroup')[2];
		assert.notOk(currentItemCollapsed.getAttribute('aria-expanded'), 'Root 2 has no ARIA attribute expanded when NavigationList is collapsed.');
	});

	QUnit.test('ARIA - Accessibility Text', function (assert) {
		var invisibleText = NavigationListItem._getInvisibleText();
		assert.equal(invisibleText.getText(), '', "accessibility text is initially empty");

		var groupItem = this.navigationList.getItems()[0];

		groupItem.onfocusin({
			srcControl: groupItem
		});

		assert.equal(invisibleText.getText(), 'Tree Item 1 of 5  Root 1', "accessibility text is correct");

		var secondLevelItem = groupItem.getItems()[2];

		this.navigationList.setSelectedItem(secondLevelItem);

		secondLevelItem.onfocusin({
			srcControl: secondLevelItem
		});

		assert.equal(invisibleText.getText(), 'Tree Item 3 of 3 Selected Child 3', "accessibility text is correct");
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
		sap.ui.getCore().applyChanges();

		assert.strictEqual(this.navigationList._selectedItem.getText(), 'Child 1', 'initial selection is correct');

		this.navigationList.setSelectedKey('child3');
		sap.ui.getCore().applyChanges();

		assert.strictEqual(this.navigationList._selectedItem.getText(), 'Child 3', 'selection is correct');

		this.navigationList.setSelectedKey('');
		sap.ui.getCore().applyChanges();

		assert.notOk(this.navigationList._selectedItem,'selection is removed');
	});

	QUnit.test('interaction', function (assert) {
		this.navigationList = getNavigationList();

		oPage.addContent(this.navigationList);
		sap.ui.getCore().applyChanges();

		assert.notOk(this.navigationList._selectedItem, 'no initial selection');

		this.navigationList.getItems()[0].getItems()[0]._selectItem();

		assert.strictEqual(this.navigationList.getSelectedKey(), 'child1', 'selection is correct');
	});

	QUnit.module("Interaction", {
		beforeEach: function () {
			this.navigationList = getNavigationList();
			oPage.addContent(this.navigationList);

			sap.ui.getCore().applyChanges();
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

		sap.ui.getCore().applyChanges();

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

		$focusableElement.focus();

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

	QUnit.test("select group", function (assert) {

		var bPassedArg,
			fnEventSpy = sinon.spy(function (oEvent) {
				bPassedArg = oEvent.getParameter('item');
			});

		this.navigationList.attachItemSelect(fnEventSpy);

		assert.notOk(jQuery(this.navigationList.$().children()[0].children[1]).hasClass('sapTntNavLIItemSelected'), "sapTntNavLIItemSelected class is not set");

		var $group = jQuery('.sapTntNavLI li div').first();

		$group.trigger('tap');

		sap.ui.getCore().applyChanges();

		// wait 500ms
		this.clock.tick(500);

		assert.ok(jQuery(this.navigationList.$().children()[0]).hasClass('sapTntNavLIItemSelected'), "sapTntNavLIItemSelected class is set");

		assert.strictEqual(fnEventSpy.callCount, 1, "should fire select event once");
		assert.strictEqual(bPassedArg.getText(), 'Root 1', "should pass the first item as argument");
	});

	QUnit.test("select group item", function (assert) {

		var bPassedArg,
			fnEventSpy = sinon.spy(function (oEvent) {
				bPassedArg = oEvent.getParameter('item');
			});

		this.navigationList.attachItemSelect(fnEventSpy);

		var $groupItem = jQuery('.sapTntNavLI .sapTntNavLIGroupItem').first();

		assert.notOk($groupItem.hasClass('sapTntNavLIItemSelected'), "sapTntNavLIItemSelected class is not set");

		$groupItem.trigger('tap');

		sap.ui.getCore().applyChanges();

		// wait 500ms
		this.clock.tick(500);

		assert.ok($groupItem.hasClass('sapTntNavLIItemSelected'), "sapTntNavLIItemSelected class is set");

		assert.strictEqual(fnEventSpy.callCount, 1, "should fire select event once");
		assert.strictEqual(bPassedArg.getText(), 'Child 1', "should pass the first group item as argument");
	});

	QUnit.test("popup list", function (assert) {

		assert.notOk(jQuery('.sapTntNavLIPopup').length, "popup list is not shown");
		assert.ok(!this.navigationList._popover, "should have no popover reference");

		this.navigationList.setExpanded(false);
		sap.ui.getCore().applyChanges();

		var $item = jQuery('.sapTntNavLI .sapTntNavLIGroup').first();
		$item.trigger('tap');

		sap.ui.getCore().applyChanges();

		// wait 500ms
		this.clock.tick(500);


		var oList = this.navigationList._popover.getContent(),
			oInnerListItem = oList[0].getItems()[0].getItems()[0],
			$InnerListItem = oInnerListItem.$()[0],
			$list = oList[0].$();

		assert.strictEqual(jQuery('.sapTntNavLIPopup').length, 1, "popup list is shown");
		assert.ok(this.navigationList._popover, "should save popover reference");

		var $groupItem = jQuery('.sapTntNavLI .sapTntNavLIGroupItem').first();
		var popover = $groupItem.closest('.sapMPopover').control()[0];


		assert.strictEqual($list[0].getAttribute("role"), "menubar", "Role of the popup ul should be menubar");
		assert.strictEqual($InnerListItem.getAttribute("role"), "menuitem", "Role of the popup li should be menuitem");
		assert.ok(popover.oPopup.getOpenState() === sap.ui.core.OpenState.OPEN, "should change popover status to OPEN");

		$groupItem.trigger('tap');

		sap.ui.getCore().applyChanges();

		// wait 500ms
		this.clock.tick(500);

		assert.ok(popover.bIsDestroyed, "popover should be destroyed");
		assert.ok(!this.navigationList._popover, "should clean popover reference");
	});

	return waitForThemeApplied();
});
