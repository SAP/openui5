/*global QUnit sinon */
sap.ui.define([
	'sap/tnt/SideNavigation',
	'sap/tnt/NavigationList',
	'sap/tnt/NavigationListItem',
	"sap/ui/core/Element",
	"sap/ui/core/Lib",
	'sap/ui/qunit/utils/nextUIUpdate',
	"sap/ui/qunit/QUnitUtils"
], function(
	SideNavigation,
	NavigationList,
	NavigationListItem,
	Element,
	Library,
	nextUIUpdate,
	QUnitUtils) {
	'use strict';

	var DOM_RENDER_LOCATION = 'qunit-fixture';

	/**
	 * In some tests that are using fake timers, it might happen that a rendering task is queued by
	 * creating a fake timer. Without an appropriate clock.tick call, this timer might not execute
	 * and a later nextUIUpdate with real timers would wait endlessly.
	 * To prevent this, after each such test a sync rendering is executed which will clear any pending
	 * fake timer. The rendering itself should not be needed by the tests, if they are properly
	 * isolated.
	 *
	 * This function is used as an indicator for such cases. It's just a wrapper around nextUIUpdate.
	 */
	function clearPendingUIUpdates(clock) {
		return nextUIUpdate(clock);
	}

	//================================================================================
	// Carousel Properties
	//================================================================================
	QUnit.module('API', {
		beforeEach: async function () {
			this.sideNavigation = new SideNavigation({
				item: new NavigationList(),
				fixedItem: new NavigationList()
			});
			this.sideNavigation.placeAt(DOM_RENDER_LOCATION);
			await nextUIUpdate(); // no fake timer active in beforeEach
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
		var oRB = Library.getResourceBundleFor("sap.tnt");

		this.sideNavigation.getItem().addItem(new NavigationListItem({ text: "Text"}));
		this.sideNavigation.getFixedItem().addItem(new NavigationListItem({ text: "Fixed Text"}));
		this.sideNavigation.setExpanded(true);

		this.clock.tick(1000);

		assert.strictEqual(this.sideNavigation.getDomRef().classList.contains("sapTntSideNavigationNotExpanded"), false, 'should not have "sapTntSideNavigationNotExpanded" class');
		assert.strictEqual(this.sideNavigation.getAggregation('item').getExpanded(), true, 'should not collapse the NavigationList in item aggregation');
		assert.strictEqual(this.sideNavigation.getAggregation('fixedItem').getExpanded(), true, 'should not collapse the NavigationList in fixedItem aggregation');

		this.sideNavigation.$().find('.sapTntNL').each(function (index, item) {
			assert.strictEqual(item.getAttribute('role'), 'tree', 'ul should have role "tree"');
			assert.strictEqual(item.getAttribute('aria-roledescription'), oRB.getText("NAVIGATION_LIST_ITEM_ROLE_DESCRIPTION_TREE"), 'ul should have aria-roledescription "Navigation list tree"');
		});

		this.sideNavigation.$().find('.sapTntNLIFirstLevel.sapTntNLI a').each(function (index, item) {
			assert.strictEqual(item.getAttribute('role'), 'treeitem', 'li should have role "treeitem"');
		});
	});

	QUnit.test('SetExpanded false', function (assert) {
		// arrange
		var oRB = Library.getResourceBundleFor("sap.tnt");
		this.clock.restore(); // using real timeouts for this test
		var done = assert.async();

		// act
		this.sideNavigation.getItem().addItem(new NavigationListItem({ text: "Text"}));
		this.sideNavigation.getFixedItem().addItem(new NavigationListItem({ text: "Fixed Text"}));
		this.sideNavigation.setExpanded(false);

		setTimeout(function() {
			// assert
			assert.strictEqual(this.sideNavigation.getDomRef().classList.contains('sapTntSideNavigationNotExpanded'), true, 'should has "sapTntSideNavigationNotExpanded" class');
			assert.strictEqual(this.sideNavigation.getAggregation('item').getExpanded(), false, 'should collapse the NavigationList in item aggregation');
			assert.strictEqual(this.sideNavigation.getAggregation('fixedItem').getExpanded(), false, 'should collapse the NavigationList in fixedItem aggregation');

			this.sideNavigation.$().find('.sapTntNL').each(function (index, item) {
				assert.strictEqual(item.getAttribute('role'), 'menubar', 'ul should have role "menubar"');
				assert.strictEqual(item.getAttribute('aria-roledescription'), oRB.getText("NAVIGATION_LIST_ITEM_ROLE_DESCRIPTION_MENUBAR"), 'ul should have aria-roledescription "Navigation list menu bar"');
			});

			this.sideNavigation.$().find("li:not(.sapTntNLOverflow) a").each(function (index, item) {
				assert.strictEqual(item.getAttribute('role'), 'menuitemradio', 'li should have role "menuitemradio"');
				assert.strictEqual(item.getAttribute('aria-roledescription'), oRB.getText("NAVIGATION_LIST_ITEM_ROLE_DESCRIPTION_MENUITEM"), 'li should have aria-roledescription "Navigation list menu item"');
			});

			this.sideNavigation.$().find(".sapTntNLOverflow").each(function (index, item) {
				assert.strictEqual(item.querySelector("a").getAttribute('role'), 'menuitem', 'li should have role "menuitem"');
				assert.strictEqual(item.querySelector("a").getAttribute('aria-roledescription'), oRB.getText("NAVIGATION_LIST_ITEM_ROLE_DESCRIPTION_MENUITEM"), 'li should have aria-roledescription "Navigation list menu item"');
				assert.strictEqual(item.querySelector("a").getAttribute('aria-label'), oRB.getText("NAVIGATION_LIST_OVERFLOW_ITEM_LABEL"), 'li should have aria-label "Displays remaining navigation items"');
				assert.ok(item.classList.contains("sapTntNLIHidden"), 'overflow item is hidden');
			});

			done();
		}.bind(this), 1000);
	});

	QUnit.test('Switch between active items from item and fixed item aggregation', async function (assert) {
		// arrange
		var listItem = new NavigationListItem({text: 'List Item'});
		var fixedListItem = new NavigationListItem({text: 'Fixed List Item'});

		// act
		this.sideNavigation.getItem().addItem(listItem);
		this.sideNavigation.getFixedItem().addItem(fixedListItem);
		await nextUIUpdate(this.clock);

		this.sideNavigation.setSelectedItem(listItem);
		this.sideNavigation.setSelectedItem(fixedListItem);
		this.sideNavigation.setSelectedItem(listItem);

		// assert
		assert.strictEqual(this.sideNavigation.getSelectedItem(), listItem.getId(), 'The correct item should be selected');
		assert.strictEqual(listItem.$().find('.sapTntNLIFirstLevel').hasClass('sapTntNLISelected'), true, 'The item should have class "sapTntNLISelected"');
		assert.strictEqual(fixedListItem.$().hasClass('sapTntNLISelected'), false, 'The class "sapTntNLISelected" should be removed from the deselected item');
	});

	QUnit.test("Switch Between active items without fixedItem aggregation", async function(assert) {

		// arrange
		var listItem = new NavigationListItem({text: 'List Item'});
		var listItem1 = new NavigationListItem({text: 'List Item'});

		// act
		this.sideNavigation.getItem().addItem(listItem);
		this.sideNavigation.getItem().addItem(listItem1);

		//remove the fixedItem aggregation from the sideNavigation
		this.sideNavigation.setAggregation('fixedItem', null);

		this.sideNavigation.setSelectedItem(listItem);
		await nextUIUpdate(this.clock);

		// assert
		assert.strictEqual(this.sideNavigation.getSelectedItem(), listItem.getId(), 'The correct item should be selected');
		assert.strictEqual(listItem.$().find('.sapTntNLIFirstLevel').hasClass('sapTntNLISelected'), true, 'The item should have class "sapTntNLISelected"');
		assert.strictEqual(listItem.$().find('.sapTntNLIFirstLevel').hasClass('sapTntNLISelected'), true, 'The class "sapTntNLISelected" should be removed from the deselected item');
	});

	QUnit.test('Passing null should deselect the selected item', async function (assert) {
		// arrange
		var listItem = new NavigationListItem({text: 'List Item'});
		var fixedListItem = new NavigationListItem({text: 'Fixed List Item'});

		// act
		this.sideNavigation.getItem().addItem(listItem);
		this.sideNavigation.getFixedItem().addItem(fixedListItem);
		await nextUIUpdate(this.clock);

		// assert
		this.sideNavigation.setSelectedItem(listItem);
		assert.strictEqual(this.sideNavigation.getSelectedItem(), listItem.getId(), 'The correct item should be selected');
		assert.strictEqual(listItem.$().find('.sapTntNLIFirstLevel').hasClass('sapTntNLISelected'), true, 'The item should have class "sapTntNLISelected"');

		this.sideNavigation.setSelectedItem(null);
		assert.strictEqual(this.sideNavigation.getSelectedItem(), null, 'The item should be deselected');
		assert.strictEqual(listItem.$().hasClass('sapTntNLISelected'), false, 'The item should have class "sapTntNLISelected"');

		this.sideNavigation.setSelectedItem(fixedListItem);
		assert.strictEqual(this.sideNavigation.getSelectedItem(), fixedListItem.getId(), 'The correct item should be selected');
		assert.strictEqual(fixedListItem.$().find('.sapTntNLIFirstLevel').hasClass('sapTntNLISelected'), true, 'The item should have class "sapTntNLISelected"');

		this.sideNavigation.setSelectedItem(null);
		assert.strictEqual(this.sideNavigation.getSelectedItem(), null, 'The item should be deselected');
		assert.strictEqual(fixedListItem.$().hasClass('sapTntNLISelected'), false, 'The class "sapTntNLISelected" should be removed from the deselected item');
	});

	QUnit.test('Passing a string as "selectedItem" id should set the selected item', async function (assert) {
		// arrange
		var listItem = new NavigationListItem({text: 'List Item'});
		var fixedListItem = new NavigationListItem({text: 'Fixed List Item'});

		// act
		this.sideNavigation.getItem().addItem(listItem);
		this.sideNavigation.getFixedItem().addItem(fixedListItem);
		await nextUIUpdate(this.clock);

		// assert
		this.sideNavigation.setSelectedItem(listItem.getId());
		assert.strictEqual(this.sideNavigation.getSelectedItem(), listItem.getId(), 'The correct item should be selected');
	});

	QUnit.test('Passing null on empty control (empty aggregations) should not throw error', async function (assert) {
		var oEmptySideNav = new SideNavigation();
		oEmptySideNav.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate(this.clock);

		oEmptySideNav.setSelectedItem(null);
		assert.ok(true, "No error was thrown");

		oEmptySideNav.destroy();
		await clearPendingUIUpdates(this.clock);
	});

	QUnit.test('Action navigation list item', async function (assert) {

		this.sideNavigation.getFixedItem().addItem(new NavigationListItem('actionItem', {
			text: 'Action Item',
			icon: 'sap-icon://write-new',
			design: "Action"
		}));
		await nextUIUpdate(this.clock);

		const oActionItem = this.sideNavigation.getFixedItem().getItems()[0].getDomRef().querySelector(".sapTntNLI");
		assert.ok(oActionItem.classList.contains("sapTntNLIAction"), "sapTntNLIAction class is set when item has design = Action");
	});

	QUnit.module('Events', {
		beforeEach: async function () {
			this.sideNavigation = new SideNavigation({
				item: new NavigationList({
				}),
				fixedItem: new NavigationList()
			});
			this.sideNavigation.placeAt(DOM_RENDER_LOCATION);
			await nextUIUpdate(); // no fake timer active in beforeEach
		},
		afterEach: function () {
			this.sideNavigation.destroy();
		}
	});

	QUnit.test('Select group item', function (assert) {
		var oItem = new NavigationListItem({ text: "item" });

		var eventMock = {
			getSource: function () {
				return this;
			},
			getId: function () {
				return 'mock';
			},
			getParameter: function () {
				return oItem;
			}
		};

		var eventSpy = sinon.spy(function (oEvent) {
		});

		this.sideNavigation.attachItemSelect(eventSpy);

		this.sideNavigation._itemSelectionHandler(eventMock);

		assert.strictEqual(eventSpy.callCount, 1, 'should fire select event once');
	});

	QUnit.test("Press event", async function (assert) {
		this.sideNavigation.getFixedItem().addItem(new NavigationListItem('actionItem', {
			text: 'Action Item',
			icon: 'sap-icon://write-new',
			design: "Action"
		}));
		await nextUIUpdate(this.clock);

		const oActionItem = this.sideNavigation.getFixedItem().getItems()[0];
		const oAttachPressSpy = this.spy(oActionItem, "firePress");
		QUnitUtils.triggerEvent("tap", oActionItem.getDomRef().querySelector(".sapTntNLI"));
		await nextUIUpdate(this.clock);
		assert.ok(oAttachPressSpy.called, "press event is fired on the action item");
	});

	QUnit.test('itemPressed event', async function (assert) {
		const oUnselectableParentItem = new NavigationListItem('parentUnselectable',{
			text: 'Parent Item',
			selectable: false,
			items: [
				new NavigationListItem('child1', {
					text: 'Child Item'
				})
			]
		});

		const oSelectableParentItem = new NavigationListItem('parentSelectable',{
			text: 'Parent Item',
			items: [
				new NavigationListItem('child', {
					text: 'Child Item'
				})
			]
		});

		const oFixedItemSelectable = new NavigationListItem('simpleSelectableItem', {
			text: 'Fixed Item'
		});

		this.sideNavigation.getItem().addItem(oUnselectableParentItem);
		this.sideNavigation.getItem().addItem(oSelectableParentItem);
		this.sideNavigation.getFixedItem().addItem(oFixedItemSelectable);
		await nextUIUpdate(this.clock);

		const oAttachItemPressedSpy = this.spy(this.sideNavigation, "fireItemPress");

		//click on simple selectable item
		const oActionItem = this.sideNavigation.getDomRef().querySelector("#simpleSelectableItem");
		QUnitUtils.triggerEvent("tap", oActionItem.querySelector(".sapTntNLI"));
		await nextUIUpdate(this.clock);

		assert.strictEqual(oAttachItemPressedSpy.callCount, 1, "itemPress event is fired if selectable item is clicked");

		//click on unselectable parent item
		const oParentUnselectable = this.sideNavigation.getDomRef().querySelector("#parentUnselectable");
		QUnitUtils.triggerEvent("tap", oParentUnselectable.querySelector(".sapTntNLI"));
		await nextUIUpdate(this.clock);

		assert.strictEqual(oAttachItemPressedSpy.callCount, 2, "itemPress event is fired if unselectable parent item is clicked");

		//click on selectable parent item
		const oParentSelectable = this.sideNavigation.getDomRef().querySelector("#parentSelectable");
		QUnitUtils.triggerEvent("tap", oParentSelectable.querySelector(".sapTntNLI"));
		await nextUIUpdate(this.clock);

		assert.strictEqual(oAttachItemPressedSpy.callCount, 3, "itemPress event is fired if selectable parent item is clicked");

		//click on child item
		const oChildItem = this.sideNavigation.getDomRef().querySelector("#parentSelectable #child");
		QUnitUtils.triggerEvent("tap", oChildItem);
		await nextUIUpdate(this.clock);

		assert.strictEqual(oAttachItemPressedSpy.callCount, 4, "itemPress event is fired if child item is clicked");
	});

	QUnit.module('SelectedKey', {
		beforeEach: async function () {
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
						}),
						new NavigationListItem({
							text: 'Root2',
							key: 'root2'
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
			await nextUIUpdate(); // no fake timer active in beforeEach
		},
		afterEach: function () {
			this.sideNavigation.destroy();
			this.sideNavigation = null;
		}
	});

	QUnit.test('api', async function (assert) {
		this.sideNavigation.setWidth("20rem");
		await nextUIUpdate(this.clock);

		assert.strictEqual(this.sideNavigation.getDomRef().style.width, '20rem', 'width is set');

		var selectedItem = Element.getElementById(this.sideNavigation.getSelectedItem());
		assert.strictEqual(selectedItem.getText(), 'Root', 'initial selection is correct');

		this.sideNavigation.setSelectedKey('fixed1');
		await nextUIUpdate(this.clock);

		selectedItem = Element.getElementById(this.sideNavigation.getSelectedItem());
		assert.strictEqual(selectedItem.getText(), 'Fixed 1', 'selection is correct');
		assert.notOk(this.sideNavigation.getItem()._selectedItem, 'selection is removed');
		assert.strictEqual(this.sideNavigation.getFixedItem()._selectedItem.getKey(), 'fixed1', 'selection is set');

		this.sideNavigation.setSelectedKey('child2');
		await nextUIUpdate(this.clock);

		selectedItem = Element.getElementById(this.sideNavigation.getSelectedItem());
		assert.strictEqual(selectedItem.getText(), 'Child 2', 'selection is correct');
		assert.notOk(this.sideNavigation.getFixedItem()._selectedItem, 'selection is removed');
		assert.strictEqual(this.sideNavigation.getItem()._selectedItem.getKey(), 'child2', 'selection is set');
	});

	QUnit.test('aria-selected is correctly set', async function (assert) {
		const selectedItem = Element.getElementById(this.sideNavigation.getSelectedItem());
		assert.strictEqual(selectedItem.getDomRef().querySelector("a").getAttribute('aria-selected'), 'true', 'initial selected item has aria-selected="true"');

		const getAllItems = (list) =>
			list.getItems().flatMap((item) => [item, ...getAllItems(item)]);

		const allItems = getAllItems(this.sideNavigation.getItem());
		const nonSelectedItems = allItems.filter((item) => item.getKey() !== selectedItem.getKey());

		assert.ok(
			nonSelectedItems.every((item) => item.getDomRef().querySelector("a").getAttribute('aria-selected') === 'false'),
			'all non-selected items have aria-selected="false"'
		);

		this.sideNavigation.setSelectedKey('root2');
		await nextUIUpdate(this.clock);

		const newSelectedItem = Element.getElementById(this.sideNavigation.getSelectedItem());
		assert.strictEqual(newSelectedItem.getDomRef().querySelector("a").getAttribute('aria-selected'), 'true', 'new selected item has aria-selected="true"');
		assert.strictEqual(selectedItem.getDomRef().querySelector("a").getAttribute('aria-selected'), 'false', 'initial selected item has aria-selected="false" after changing selection');
	});

	QUnit.test('interaction', async function (assert) {

		this.sideNavigation.getFixedItem().getItems()[0]._selectItem();
		await nextUIUpdate(this.clock);

		var selectedItem = Element.getElementById(this.sideNavigation.getSelectedItem());
		assert.strictEqual(selectedItem.getText(), 'Fixed 1', 'selection is correct');
		assert.notOk(this.sideNavigation.getItem()._selectedItem, 'selection is removed');
		assert.strictEqual(this.sideNavigation.getFixedItem()._selectedItem.getKey(), 'fixed1', 'selection is set');

		this.sideNavigation.getItem().getItems()[0].getItems()[1]._selectItem();
		await nextUIUpdate(this.clock);

		selectedItem = Element.getElementById(this.sideNavigation.getSelectedItem());
		assert.strictEqual(selectedItem.getText(), 'Child 2', 'selection is correct');
		assert.notOk(this.sideNavigation.getFixedItem()._selectedItem, 'selection is removed');
		assert.strictEqual(this.sideNavigation.getItem()._selectedItem.getKey(), 'child2', 'selection is set');
	});

	QUnit.test('no flexible items', async function (assert) {
		var selectedItem = this.sideNavigation.getFixedItem().getItems()[0];
		this.sideNavigation.setItem(null);
		this.sideNavigation.setSelectedItem(selectedItem);
		assert.strictEqual(this.sideNavigation.getSelectedItem(), selectedItem.sId, 'selection is correct');

		await clearPendingUIUpdates(this.clock);
	});

	QUnit.test('Selected key set, no items, no fixedItem', async function (assert) {
		this.sideNavigation.getItem().destroyItems();
		this.sideNavigation.getFixedItem().destroy();
		this.sideNavigation.setFixedItem(null);
		this.sideNavigation.setSelectedKey("some_key");
		assert.ok(true, '_findItemByKey was NOT called on fixedItem');

		await clearPendingUIUpdates(this.clock);
	});

	QUnit.module('Changing properties', {
		beforeEach: async function () {

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
			await nextUIUpdate(); // no fake timer active in beforeEach
		},
		afterEach: async function () {
			this.sideNavigation.destroy();
			this.sideNavigation = null;

			await nextUIUpdate(); // no fake timer active in afterEach
			sinon.config.useFakeTimers = true;
		}
	});

	QUnit.test('collapsed - hidden - expanded - visible', async function (assert) {
		var done = assert.async();

		assert.strictEqual(this.sideNavigation.$().find('.sapTntNL').attr('role'), 'tree', 'control should be initially expanded');

		this.sideNavigation.setExpanded(false);
		await nextUIUpdate(); // no fake timer in this QUnit.module

		setTimeout(async function () {

			this.sideNavigation.setVisible(false);
			await nextUIUpdate(); // no fake timer in this QUnit.module

			this.sideNavigation.setExpanded(true);
			await nextUIUpdate(); // no fake timer in this QUnit.module

			this.sideNavigation.setVisible(true);
			await nextUIUpdate(); // no fake timer in this QUnit.module

			assert.strictEqual(this.sideNavigation.$().find('.sapTntNL').attr('role'), 'tree', 'control should be expanded');

			done();

		}.bind(this), 500);
	});

	QUnit.test('expanded - hidden - collapsed - visible', function (assert) {

		var done = assert.async();

		setTimeout(async function () {

			this.sideNavigation.setVisible(false);
			await nextUIUpdate(); // no fake timer in this QUnit.module

			this.sideNavigation.setExpanded(false);
			await nextUIUpdate(); // no fake timer in this QUnit.module

			this.sideNavigation.setVisible(true);
			await nextUIUpdate(); // no fake timer in this QUnit.module

			assert.strictEqual(this.sideNavigation.$().find('.sapTntNL').attr('role'), 'menubar', 'control should be collapsed');

			done();

		}.bind(this), 500);
	});

	QUnit.test('Selected key removed from fixed items list if flexible item is selected', async function (assert) {
		this.sideNavigation.getFixedItem().getItems()[0]._selectItem();
		await nextUIUpdate(); // no fake timer in this QUnit.module
		assert.strictEqual(this.sideNavigation.getFixedItem().getSelectedKey(), 'fixed1', 'Item is selected from the fixed items list');


		this.sideNavigation.getItem().getItems()[0]._selectItem();
		await nextUIUpdate(); // no fake timer in this QUnit.module

		this.sideNavigation.setExpanded(false);
		await nextUIUpdate(); // no fake timer in this QUnit.module

		assert.strictEqual(this.sideNavigation.getItem().getSelectedKey(), 'root', 'Flexible list item is selected');
		assert.strictEqual(this.sideNavigation.getFixedItem().getSelectedKey(), undefined, 'No selected items in the fixed items list');

	});

	QUnit.test('Selected key removed from flexible items list if fixed item is selected', async function (assert) {

		this.sideNavigation.getItem().getItems()[0]._selectItem();
		await nextUIUpdate(); // no fake timer in this QUnit.module
		assert.strictEqual(this.sideNavigation.getItem().getSelectedKey(), 'root', 'Item is selected from the flexible items list');

		this.sideNavigation.getFixedItem().getItems()[0]._selectItem();
		await nextUIUpdate(); // no fake timer in this QUnit.module

		this.sideNavigation.setExpanded(false);
		await nextUIUpdate(); // no fake timer in this QUnit.module

		assert.strictEqual(this.sideNavigation.getFixedItem().getSelectedKey(), 'fixed1', 'Fixed list item is selected');
		assert.strictEqual(this.sideNavigation.getItem().getSelectedKey(), undefined, 'No selected items in the flexible items list');

	});

	QUnit.module("Accessibility", {
		beforeEach: async function () {
			this.sideNavigation = new SideNavigation({
				item: new NavigationList(),
				fixedItem: new NavigationList()
			});
			this.sideNavigation.placeAt(DOM_RENDER_LOCATION);
			await nextUIUpdate(); // no fake timer active in beforeEach
		},
		afterEach: function () {
			this.sideNavigation.destroy();
		}
	});

	QUnit.test("Aria attributes - aria-roledescription", function (assert) {

		var sExpectedAriaRoleDescription = Library.getResourceBundleFor("sap.tnt")
			.getText("NAVIGATION_LIST_ITEM_ROLE_DESCRIPTION_TREE");

		this.sideNavigation.setExpanded(true);
		this.clock.tick(1000);

		this.sideNavigation.$().find('.sapTntNL').each(function (index, item) {
			assert.strictEqual(item.getAttribute('aria-roledescription'), sExpectedAriaRoleDescription, 'aria-roledescription is as expected');
		});
	});

	QUnit.test("Aria attributes - aria-label", async function (assert) {
		const oRB = Library.getResourceBundleFor("sap.tnt");
		var label = "Side navigation menu with options";

		assert.notOk(this.sideNavigation.$().attr('aria-label'),  'aria-label is not set initially');

		this.sideNavigation.setAriaLabel(label);
		await nextUIUpdate(this.clock);

		assert.strictEqual(this.sideNavigation.$().attr('aria-label'), label, 'aria-label is as expected');
		assert.strictEqual(this.sideNavigation.getAggregation("item").$().attr('aria-label'), oRB.getText("SIDE_NAVIGATION_FLEXIBLE_LIST_LABEL"), 'ul for flexible list should have aria-label "Primary Navigation Menu"');
		assert.strictEqual(this.sideNavigation.getAggregation("fixedItem").$().attr('aria-label'), oRB.getText("SIDE_NAVIGATION_FIXED_LIST_LABEL"), 'ul for fixed list should have aria-label "Footer Navigation Menu"');
	});
});