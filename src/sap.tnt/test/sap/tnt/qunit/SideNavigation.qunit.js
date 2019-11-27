/*global QUnit sinon */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	'jquery.sap.global',
	'sap/tnt/SideNavigation',
	'sap/tnt/NavigationList',
	'sap/tnt/NavigationListItem'
], function(
	jQuery,
	SideNavigation,
	NavigationList,
	NavigationListItem) {
	'use strict';

	var DOM_RENDER_LOCATION = 'qunit-fixture';

	//================================================================================
	// Carousel Properties
	//================================================================================
	QUnit.module('API', {
		beforeEach: function () {
			this.sideNavigation = new SideNavigation({
				item: new NavigationList(),
				fixedItem: new NavigationList()
			});
			this.sideNavigation.placeAt(DOM_RENDER_LOCATION);
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.sideNavigation.destroy();
		}
	});

	QUnit.test('SetAggregation', function (assert) {
		assert.ok(this.sideNavigation.getAggregation('item'), 'should add aggregation to "item"');
		assert.ok(this.sideNavigation.getAggregation('fixedItem'), 'should add aggregation "fixedItem"');
	});

	QUnit.test('SetExpanded true', function (assert) {
		this.sideNavigation.setExpanded(true);

		this.clock.tick(1000);

		assert.strictEqual(this.sideNavigation.getDomRef().classList.contains('sapTntSideNavigationNotExpanded'), false, 'should not has "sapTntSideNavigationNotExpanded" class');
		assert.strictEqual(this.sideNavigation.getAggregation('item').getExpanded(), true, 'should not collapse the NavigationList in item aggregation');
		assert.strictEqual(this.sideNavigation.getAggregation('fixedItem').getExpanded(), true, 'should not collapse the NavigationList in fixedItem aggregation');

		this.sideNavigation.$().find('.sapTntNavLI').each(function (index, item) {
			assert.strictEqual(item.getAttribute('role'), 'tree', 'ul should have role "tree"');
		});

		this.sideNavigation.$().find('.sapTntNavLIGroup.sapTntNavLIItem').each(function (index, item) {
			assert.strictEqual(item.getAttribute('role'), 'treeitem', 'li should have role "treeitem"');
		});
	});

	QUnit.test('SetExpanded false', function (assert) {
		// arrange
		this.clock.restore(); // using real timeouts for this test
		var done = assert.async();

		// act
		this.sideNavigation.setExpanded(false);

		setTimeout(function() {
			// assert
			assert.strictEqual(this.sideNavigation.getDomRef().classList.contains('sapTntSideNavigationNotExpanded'), true, 'should has "sapTntSideNavigationNotExpanded" class');
			assert.strictEqual(this.sideNavigation.getAggregation('item').getExpanded(), false, 'should collapse the NavigationList in item aggregation');
			assert.strictEqual(this.sideNavigation.getAggregation('fixedItem').getExpanded(), false, 'should collapse the NavigationList in fixedItem aggregation');

			this.sideNavigation.$().find('.sapTntNavLI').each(function (index, item) {
				assert.strictEqual(item.getAttribute('role'), 'menubar', 'ul should have role "menubar"');
			});

			this.sideNavigation.$().find('.sapTntNavLIGroup.sapTntNavLIItem').each(function (index, item) {
				assert.strictEqual(item.getAttribute('role'), 'menuitem', 'li should have role "menuitem"');
			});
			done();
		}.bind(this), 1000);
	});

	QUnit.test('Switch between active items from item and fixed item aggregation', function (assert) {
		// arrange
		var listItem = new NavigationListItem({text: 'List Item'});
		var fixedListItem = new NavigationListItem({text: 'Fixed List Item'});

		// act
		this.sideNavigation.getItem().addItem(listItem);
		this.sideNavigation.getFixedItem().addItem(fixedListItem);
		sap.ui.getCore().applyChanges();

		this.sideNavigation.setSelectedItem(listItem);
		this.sideNavigation.setSelectedItem(fixedListItem);
		this.sideNavigation.setSelectedItem(listItem);

		// assert
		assert.strictEqual(this.sideNavigation.getSelectedItem(), listItem.getId(), 'The correct item should be selected');
		assert.strictEqual(listItem.$().hasClass('sapTntNavLIItemSelected'), true, 'The item should have class "sapTntNavLIItemSelected"');
		assert.strictEqual(fixedListItem.$().hasClass('sapTntNavLIItemSelected'), false, 'The class "sapTntNavLIItemSelected" should be removed from the deselected item');
	});

	QUnit.test("Switch Between active items without fixedItem aggregation", function(assert) {

		// arrange
		var listItem = new NavigationListItem({text: 'List Item'});
		var listItem1 = new NavigationListItem({text: 'List Item'});

		// act
		this.sideNavigation.getItem().addItem(listItem);
		this.sideNavigation.getItem().addItem(listItem1);

		//remove the fixedItem aggregation from the sideNavigation
		this.sideNavigation.setAggregation('fixedItem', null);

		this.sideNavigation.setSelectedItem(listItem);
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(this.sideNavigation.getSelectedItem(), listItem.getId(), 'The correct item should be selected');
		assert.strictEqual(listItem.$().hasClass('sapTntNavLIItemSelected'), true, 'The item should have class "sapTntNavLIItemSelected"');
		assert.strictEqual(listItem.$().hasClass('sapTntNavLIItemSelected'), true, 'The class "sapTntNavLIItemSelected" should be removed from the deselected item');
	});

	QUnit.test('Passing null should deselect the selected item', function (assert) {
		// arrange
		var listItem = new NavigationListItem({text: 'List Item'});
		var fixedListItem = new NavigationListItem({text: 'Fixed List Item'});

		// act
		this.sideNavigation.getItem().addItem(listItem);
		this.sideNavigation.getFixedItem().addItem(fixedListItem);
		sap.ui.getCore().applyChanges();

		// assert
		this.sideNavigation.setSelectedItem(listItem);
		assert.strictEqual(this.sideNavigation.getSelectedItem(), listItem.getId(), 'The correct item should be selected');
		assert.strictEqual(listItem.$().hasClass('sapTntNavLIItemSelected'), true, 'The item should have class "sapTntNavLIItemSelected"');

		this.sideNavigation.setSelectedItem(null);
		assert.strictEqual(this.sideNavigation.getSelectedItem(), null, 'The item should be deselected');
		assert.strictEqual(listItem.$().hasClass('sapTntNavLIItemSelected'), false, 'The item should have class "sapTntNavLIItemSelected"');

		this.sideNavigation.setSelectedItem(fixedListItem);
		assert.strictEqual(this.sideNavigation.getSelectedItem(), fixedListItem.getId(), 'The correct item should be selected');
		assert.strictEqual(fixedListItem.$().hasClass('sapTntNavLIItemSelected'), true, 'The item should have class "sapTntNavLIItemSelected"');

		this.sideNavigation.setSelectedItem(null);
		assert.strictEqual(this.sideNavigation.getSelectedItem(), null, 'The item should be deselected');
		assert.strictEqual(fixedListItem.$().hasClass('sapTntNavLIItemSelected'), false, 'The class "sapTntNavLIItemSelected" should be removed from the deselected item');
	});

	QUnit.module('Events', {
		beforeEach: function () {
			this.sideNavigation = new SideNavigation({
				item: new NavigationList(),
				fixedItem: new NavigationList()
			});
			this.sideNavigation.placeAt(DOM_RENDER_LOCATION);
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.sideNavigation.destroy();
		}
	});

	QUnit.test('Select group item', function (assert) {
		var eventMock = {
			getSource: function () {
				return this;
			},
			getId: function () {
				return 'mock';
			},
			getParameter: function () {
				return 'mockId';
			}
		};
		var eventSpy = sinon.spy(function (oEvent) {
		});

		this.sideNavigation.attachItemSelect(eventSpy);

		this.sideNavigation._itemSelectionHandler(eventMock);

		assert.strictEqual(eventSpy.callCount, 1, 'should fire select event once');
	});

	QUnit.module('SelectedKey', {
		beforeEach: function () {
			this.sideNavigation = new SideNavigation({
				selectedKey: 'root',
				item: new NavigationList({
					items: [
						new NavigationListItem({
							text: 'Root',
							key: 'root',
							items: [
								new NavigationListItem({
									text: 'Child 1',
									key: 'child1'
								}),
								new NavigationListItem({
									text: 'Child 2',
									key: 'child2'
								})
							]
						})
					]
				}),
				fixedItem: new NavigationList({
					items: [
						new NavigationListItem({
							text: 'Fixed 1',
							key: 'fixed1'
						}),
						new NavigationListItem({
							text: 'Fixed 2',
							key: 'fixed2'
						})
					]
				})
			});
			this.sideNavigation.placeAt(DOM_RENDER_LOCATION);
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.sideNavigation.destroy();
			this.sideNavigation = null;
		}
	});

	QUnit.test('api', function (assert) {

		var selectedItem = sap.ui.getCore().byId(this.sideNavigation.getSelectedItem());
		assert.strictEqual(selectedItem.getText(), 'Root', 'initial selection is correct');

		this.sideNavigation.setSelectedKey('fixed1');
		sap.ui.getCore().applyChanges();

		selectedItem = sap.ui.getCore().byId(this.sideNavigation.getSelectedItem());
		assert.strictEqual(selectedItem.getText(), 'Fixed 1', 'selection is correct');
		assert.notOk(this.sideNavigation.getItem()._selectedItem, 'selection is removed');
		assert.strictEqual(this.sideNavigation.getFixedItem()._selectedItem.getKey(), 'fixed1', 'selection is set');

		this.sideNavigation.setSelectedKey('child2');
		sap.ui.getCore().applyChanges();

		selectedItem = sap.ui.getCore().byId(this.sideNavigation.getSelectedItem());
		assert.strictEqual(selectedItem.getText(), 'Child 2', 'selection is correct');
		assert.notOk(this.sideNavigation.getFixedItem()._selectedItem, 'selection is removed');
		assert.strictEqual(this.sideNavigation.getItem()._selectedItem.getKey(), 'child2', 'selection is set');
	});

	QUnit.test('interaction', function (assert) {

		this.sideNavigation.getFixedItem().getItems()[0]._selectItem();
		sap.ui.getCore().applyChanges();

		var selectedItem = sap.ui.getCore().byId(this.sideNavigation.getSelectedItem());
		assert.strictEqual(selectedItem.getText(), 'Fixed 1', 'selection is correct');
		assert.notOk(this.sideNavigation.getItem()._selectedItem, 'selection is removed');
		assert.strictEqual(this.sideNavigation.getFixedItem()._selectedItem.getKey(), 'fixed1', 'selection is set');

		this.sideNavigation.getItem().getItems()[0].getItems()[1]._selectItem();
		sap.ui.getCore().applyChanges();

		selectedItem = sap.ui.getCore().byId(this.sideNavigation.getSelectedItem());
		assert.strictEqual(selectedItem.getText(), 'Child 2', 'selection is correct');
		assert.notOk(this.sideNavigation.getFixedItem()._selectedItem, 'selection is removed');
		assert.strictEqual(this.sideNavigation.getItem()._selectedItem.getKey(), 'child2', 'selection is set');
	});

	QUnit.test('no flexible items', function (assert) {
		var selectedItem = this.sideNavigation.getFixedItem().getItems()[0];
		this.sideNavigation.setItem(null);
		this.sideNavigation.setSelectedItem(selectedItem);
		assert.strictEqual(this.sideNavigation.getSelectedItem(), selectedItem.sId, 'selection is correct');
	});


	QUnit.module('Changing properties', {
		beforeEach: function () {

			sinon.config.useFakeTimers = false;

			this.sideNavigation = new SideNavigation({
				selectedKey: 'root',
				item: new NavigationList({
					items: [
						new NavigationListItem({
							text: 'Root',
							key: 'root',
							items: [
								new NavigationListItem({
									text: 'Child 1',
									key: 'child1'
								}),
								new NavigationListItem({
									text: 'Child 2',
									key: 'child2'
								})
							]
						})
					]
				}),
				fixedItem: new NavigationList({
					items: [
						new NavigationListItem({
							text: 'Fixed 1',
							key: 'fixed1'
						}),
						new NavigationListItem({
							text: 'Fixed 2',
							key: 'fixed2'
						})
					]
				})
			});
			this.sideNavigation.placeAt(DOM_RENDER_LOCATION);
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.sideNavigation.destroy();
			this.sideNavigation = null;

			sinon.config.useFakeTimers = true;
		}
	});

	QUnit.test('collapsed - hidden - expanded - visible', function (assert) {

		var done = assert.async();

		assert.strictEqual(this.sideNavigation.$().find('.sapTntNavLI').attr('role'), 'tree', 'control should be initially expanded');

		this.sideNavigation.setExpanded(false);
		sap.ui.getCore().applyChanges();

		setTimeout(function () {

			this.sideNavigation.setVisible(false);
			sap.ui.getCore().applyChanges();

			this.sideNavigation.setExpanded(true);
			sap.ui.getCore().applyChanges();

			this.sideNavigation.setVisible(true);
			sap.ui.getCore().applyChanges();

			assert.strictEqual(this.sideNavigation.$().find('.sapTntNavLI').attr('role'), 'tree', 'control should be expanded');

			done();

		}.bind(this), 500);
	});

	QUnit.test('expanded - hidden - collapsed - visible', function (assert) {

		var done = assert.async();

		setTimeout(function () {

			this.sideNavigation.setVisible(false);
			sap.ui.getCore().applyChanges();

			this.sideNavigation.setExpanded(false);
			sap.ui.getCore().applyChanges();

			this.sideNavigation.setVisible(true);
			sap.ui.getCore().applyChanges();

			assert.strictEqual(this.sideNavigation.$().find('.sapTntNavLI').attr('role'), 'menubar', 'control should be collapsed');

			done();

		}.bind(this), 500);
	});
});