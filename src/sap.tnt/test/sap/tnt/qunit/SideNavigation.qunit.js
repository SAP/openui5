(function () {
	'use strict';

	var DOM_RENDER_LOCATION = 'qunit-fixture';

	//================================================================================
	// Carousel Properties
	//================================================================================
	QUnit.module('API', {
		setup: function () {
			this.sideNavigation = new sap.tnt.SideNavigation({
				item: new sap.tnt.NavigationList(),
				fixedItem: new sap.tnt.NavigationList()
			});
			this.sideNavigation.placeAt(DOM_RENDER_LOCATION);
			sap.ui.getCore().applyChanges();
		},
		teardown: function () {
			this.sideNavigation.destroy();
		}
	});

	QUnit.test('SetAggregation', function (assert) {
		assert.ok(this.sideNavigation.getAggregation('item'), 'should add aggregation to "item"');
		assert.ok(this.sideNavigation.getAggregation('fixedItem'), 'should add aggregation "fixedItem"');
	});

	QUnit.test('SetExpanded ', function (assert) {
		this.sideNavigation.setExpanded(true);

		assert.strictEqual(this.sideNavigation.getDomRef().classList.contains('sapMSideNavigationNotExpanded'), false, 'should not has "sapMSideNavigationNotExpanded" class');
		assert.strictEqual(this.sideNavigation.getAggregation('item').getExpanded(), true, 'should not collapse the NavigationList in item aggregation');
		assert.strictEqual(this.sideNavigation.getAggregation('fixedItem').getExpanded(), true, 'should not collapse the NavigationList in fixedItem aggregation');
	});

	QUnit.test('SetExpanded ', function (assert) {
		this.sideNavigation.setExpanded(false);

		assert.strictEqual(this.sideNavigation.getDomRef().classList.contains('sapMSideNavigationNotExpanded'), true, 'should has "sapMSideNavigationNotExpanded" class');
		assert.strictEqual(this.sideNavigation.getAggregation('item').getExpanded(), false, 'should collapse the NavigationList in item aggregation');
		assert.strictEqual(this.sideNavigation.getAggregation('fixedItem').getExpanded(), false, 'should collapse the NavigationList in fixedItem aggregation');
	});

	QUnit.module('Events', {
		setup: function () {
			this.sideNavigation = new sap.tnt.SideNavigation({
				item: new sap.tnt.NavigationList(),
				fixedItem: new sap.tnt.NavigationList()
			});
			this.sideNavigation.placeAt(DOM_RENDER_LOCATION);
			sap.ui.getCore().applyChanges();
		},
		teardown: function () {
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
		setup: function () {
			this.sideNavigation = new sap.tnt.SideNavigation({
				item: new sap.tnt.NavigationList(),
				fixedItem: new sap.tnt.NavigationList()
			});
			this.sideNavigation.placeAt(DOM_RENDER_LOCATION);
			sap.ui.getCore().applyChanges();
		},
		teardown: function () {
			this.sideNavigation.destroy();
		}
	});
})();
