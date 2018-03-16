/* global QUnit,sinon*/

(function () {
	'use strict';

	var DOM_RENDER_LOCATION = 'qunit-fixture';

	//================================================================================
	// Carousel Properties
	//================================================================================
	QUnit.module('API', {
		beforeEach: function () {
			this.sideNavigation = new sap.tnt.SideNavigation({
				item: new sap.tnt.NavigationList(),
				fixedItem: new sap.tnt.NavigationList()
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

	QUnit.test('SetExpanded ', function (assert) {
		this.sideNavigation.setExpanded(true);

		this.clock.tick(1000);

		assert.strictEqual(this.sideNavigation.getDomRef().classList.contains('sapTntSideNavigationNotExpanded'), false, 'should not has "sapTntSideNavigationNotExpanded" class');
		assert.strictEqual(this.sideNavigation.getAggregation('item').getExpanded(), true, 'should not collapse the NavigationList in item aggregation');
		assert.strictEqual(this.sideNavigation.getAggregation('fixedItem').getExpanded(), true, 'should not collapse the NavigationList in fixedItem aggregation');
	});

	QUnit.test('SetExpanded ', function (assert) {
		this.sideNavigation.setExpanded(false);

		this.clock.tick(1000);

		assert.strictEqual(this.sideNavigation.getDomRef().classList.contains('sapTntSideNavigationNotExpanded'), true, 'should has "sapTntSideNavigationNotExpanded" class');
		assert.strictEqual(this.sideNavigation.getAggregation('item').getExpanded(), false, 'should collapse the NavigationList in item aggregation');
		assert.strictEqual(this.sideNavigation.getAggregation('fixedItem').getExpanded(), false, 'should collapse the NavigationList in fixedItem aggregation');
	});

	QUnit.test('Switch between active items from item and fixed item aggregation', function (assert) {
		// arrange
		var listItem = new sap.tnt.NavigationListItem({text: 'List Item'});
		var fixedListItem = new sap.tnt.NavigationListItem({text: 'Fixed List Item'});

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
		var listItem = new sap.tnt.NavigationListItem({text: 'List Item'});
		var listItem1 = new sap.tnt.NavigationListItem({text: 'List Item'});

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
		var listItem = new sap.tnt.NavigationListItem({text: 'List Item'});
		var fixedListItem = new sap.tnt.NavigationListItem({text: 'Fixed List Item'});

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
			this.sideNavigation = new sap.tnt.SideNavigation({
				item: new sap.tnt.NavigationList(),
				fixedItem: new sap.tnt.NavigationList()
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

	QUnit.module('Privet methods', {
		beforeEach: function () {
			this.sideNavigation = new sap.tnt.SideNavigation({
				item: new sap.tnt.NavigationList(),
				fixedItem: new sap.tnt.NavigationList()
			});
			this.sideNavigation.placeAt(DOM_RENDER_LOCATION);
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.sideNavigation.destroy();
		}
	});
})();
