/*global QUnit sinon */
sap.ui.define([
	'sap/tnt/SideNavigation',
	'sap/tnt/SideNavigationSearchField',
	'sap/tnt/NavigationList',
	'sap/tnt/NavigationListItem',
	"sap/ui/core/Element",
	"sap/ui/core/Lib",
	"sap/ui/core/ControlBehavior",
	"sap/ui/core/AnimationMode",
	"sap/ui/dom/units/Rem",
	"sap/ui/test/utils/nextUIUpdate",
	"sap/ui/qunit/QUnitUtils"
], function(
	SideNavigation,
	SideNavigationSearchField,
	NavigationList,
	NavigationListItem,
	Element,
	Library,
	ControlBehavior,
	AnimationMode,
	Rem,
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
		this.sideNavigation.getItem().addItem(new NavigationListItem({ text: "Text"}));
		this.sideNavigation.getFixedItem().addItem(new NavigationListItem({ text: "Fixed Text"}));
		this.sideNavigation.setExpanded(true);

		this.clock.tick(1000);

		assert.strictEqual(this.sideNavigation.getDomRef().classList.contains("sapTntSideNavigationNotExpanded"), false, 'should not have "sapTntSideNavigationNotExpanded" class');
		assert.strictEqual(this.sideNavigation.getAggregation('item').getExpanded(), true, 'should not collapse the NavigationList in item aggregation');
		assert.strictEqual(this.sideNavigation.getAggregation('fixedItem').getExpanded(), true, 'should not collapse the NavigationList in fixedItem aggregation');

		this.sideNavigation.$().find('.sapTntSideNavigationFlexible .sapTntNL').each(function (index, item) {
			assert.strictEqual(item.getAttribute('role'), 'tree', 'flexible ul should have role "tree"');
		});

		this.sideNavigation.$().find('.sapTntSideNavigationFixed .sapTntNL').each(function (index, item) {
			assert.strictEqual(item.getAttribute('role'), 'tree', 'fixed ul should have role "tree"');
		});

		this.sideNavigation.$().find('.sapTntNLIFirstLevel.sapTntNLI a').each(function (index, item) {
			assert.strictEqual(item.getAttribute('role'), 'treeitem', 'li should have role "treeitem"');
		});
	});

	QUnit.test('Inner flexible and fixed regions keep the expanded width during the collapse animation', async function (assert) {
		// arrange - measure the expanded width of the inner regions
		this.sideNavigation.getItem().addItem(new NavigationListItem({ text: "Text" }));
		this.sideNavigation.getFixedItem().addItem(new NavigationListItem({ text: "Fixed Text" }));
		await nextUIUpdate(this.clock);

		let oFlexibleRef = this.sideNavigation.getDomRef().querySelector('.sapTntSideNavigationFlexible');
		let oFixedRef = this.sideNavigation.getDomRef().querySelector('.sapTntSideNavigationFixed');
		const iExpandedFlexibleWidth = oFlexibleRef.offsetWidth;
		const iExpandedFixedWidth = oFixedRef.offsetWidth;

		// act - collapse
		this.sideNavigation.setExpanded(false);
		await nextUIUpdate(this.clock);

		// assert - the animating class is added and inner regions keep expanded width
		const oNavRef = this.sideNavigation.getDomRef();
		assert.ok(oNavRef.classList.contains('sapTntSideNavigationAnimating'), 'animating class is added');

		oFlexibleRef = oNavRef.querySelector('.sapTntSideNavigationFlexible');
		oFixedRef = oNavRef.querySelector('.sapTntSideNavigationFixed');
		assert.strictEqual(oFlexibleRef.offsetWidth, iExpandedFlexibleWidth, 'flexible region keeps expanded width');
		assert.strictEqual(oFixedRef.offsetWidth, iExpandedFixedWidth, 'fixed region keeps expanded width');
	});

	QUnit.test('Animating class is removed on width transitionend', async function (assert) {
		this.sideNavigation.setExpanded(false);
		await nextUIUpdate(this.clock);

		const oNavRef = this.sideNavigation.getDomRef();
		assert.ok(oNavRef.classList.contains('sapTntSideNavigationAnimating'), 'animating class is added on collapse');

		// act - simulate the browser's transitionend for the width property
		oNavRef.dispatchEvent(new TransitionEvent('transitionend', { propertyName: 'width' }));

		assert.notOk(oNavRef.classList.contains('sapTntSideNavigationAnimating'), 'animating class is removed on transitionend');
	});

	QUnit.test('Inner flexible and fixed regions keep the expanded width during the expand animation', async function (assert) {
		// arrange - start collapsed, then measure inner regions at expanded state
		this.sideNavigation.getItem().addItem(new NavigationListItem({ text: "Text" }));
		this.sideNavigation.getFixedItem().addItem(new NavigationListItem({ text: "Fixed Text" }));
		await nextUIUpdate(this.clock);

		let oFlexibleRef = this.sideNavigation.getDomRef().querySelector('.sapTntSideNavigationFlexible');
		let oFixedRef = this.sideNavigation.getDomRef().querySelector('.sapTntSideNavigationFixed');
		const iExpandedFlexibleWidth = oFlexibleRef.offsetWidth;
		const iExpandedFixedWidth = oFixedRef.offsetWidth;

		// arrange - collapse and finish that transition before testing the expand
		this.sideNavigation.setExpanded(false);
		await nextUIUpdate(this.clock);
		this.sideNavigation.getDomRef().dispatchEvent(new TransitionEvent('transitionend', { propertyName: 'width' }));

		// act - expand
		this.sideNavigation.setExpanded(true);
		await nextUIUpdate(this.clock);

		// assert - the animating class is added and inner regions are at expanded width from the start
		const oNavRef = this.sideNavigation.getDomRef();
		assert.ok(oNavRef.classList.contains('sapTntSideNavigationAnimating'), 'animating class is added on expand');

		oFlexibleRef = oNavRef.querySelector('.sapTntSideNavigationFlexible');
		oFixedRef = oNavRef.querySelector('.sapTntSideNavigationFixed');
		assert.strictEqual(oFlexibleRef.offsetWidth, iExpandedFlexibleWidth, 'flexible region is at expanded width');
		assert.strictEqual(oFixedRef.offsetWidth, iExpandedFixedWidth, 'fixed region is at expanded width');
	});

	QUnit.test('Animating class is removed on width transitionend after expand', async function (assert) {
		// arrange - collapse first so we can test the expand direction
		this.sideNavigation.setExpanded(false);
		await nextUIUpdate(this.clock);
		this.sideNavigation.getDomRef().dispatchEvent(new TransitionEvent('transitionend', { propertyName: 'width' }));

		// act - expand
		this.sideNavigation.setExpanded(true);
		await nextUIUpdate(this.clock);

		const oNavRef = this.sideNavigation.getDomRef();
		assert.ok(oNavRef.classList.contains('sapTntSideNavigationAnimating'), 'animating class is added on expand');

		oNavRef.dispatchEvent(new TransitionEvent('transitionend', { propertyName: 'width' }));

		assert.notOk(oNavRef.classList.contains('sapTntSideNavigationAnimating'), 'animating class is removed on transitionend');
	});

	QUnit.test('Custom width property is exposed as CSS variable and applied to inner regions while animating', async function (assert) {
		// arrange - set custom width
		this.sideNavigation.setWidth('20rem');
		this.sideNavigation.getItem().addItem(new NavigationListItem({ text: "Text" }));
		await nextUIUpdate(this.clock);

		const oNavRef = this.sideNavigation.getDomRef();
		assert.strictEqual(oNavRef.style.getPropertyValue('--sapTntSideNavigation_ExpandedWidth'), '20rem', 'CSS variable reflects custom width');

		// act - collapse and inspect inner regions during animation
		this.sideNavigation.setExpanded(false);
		await nextUIUpdate(this.clock);

		const oFlexibleRef = oNavRef.querySelector('.sapTntSideNavigationFlexible');
		const oFixedRef = oNavRef.querySelector('.sapTntSideNavigationFixed');
		const sFlexibleWidth = window.getComputedStyle(oFlexibleRef).width;
		const sFixedWidth = window.getComputedStyle(oFixedRef).width;

		assert.strictEqual(sFlexibleWidth, sFixedWidth, 'inner regions resolve to the same width');
		assert.ok(parseFloat(sFlexibleWidth) > Rem.toPx(15), 'inner regions reflect the 20rem custom value');
	});

	QUnit.test('Without custom width, --sapTntSideNavigation_ExpandedWidth is not set inline', function (assert) {
		const oNavRef = this.sideNavigation.getDomRef();

		assert.strictEqual(oNavRef.style.getPropertyValue('--sapTntSideNavigation_ExpandedWidth'), '', 'CSS variable not set inline');
	});

	QUnit.test('Animating class is not added on the initial render of a collapsed SideNavigation', async function (assert) {
		// arrange
		this.sideNavigation.destroy();
		this.sideNavigation = new SideNavigation({
			expanded: false,
			item: new NavigationList({ items: [new NavigationListItem({ text: "Text" })] })
		});
		this.sideNavigation.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate(this.clock);

		// assert
		assert.notOk(this.sideNavigation.getDomRef().classList.contains('sapTntSideNavigationAnimating'),
			'animating class must not be present on the initial render');
	});

	QUnit.test('Animating class is not added when animation mode is "minimal"', async function (assert) {
		const oStub = sinon.stub(ControlBehavior, 'getAnimationMode').returns(AnimationMode.minimal);

		// act - collapse
		this.sideNavigation.setExpanded(false);
		await nextUIUpdate(this.clock);

		// assert - the class must not be left stuck
		const oNavRef = this.sideNavigation.getDomRef();
		assert.notOk(oNavRef.classList.contains('sapTntSideNavigationAnimating'),
			'animating class must not be added in minimal animation mode');
		assert.notOk(this.sideNavigation._bAnimating, '_bAnimating flag is reset');

		oStub.restore();
	});

	QUnit.test('Animating class is not added when animation mode is "none"', async function (assert) {
		// arrange
		const oStub = sinon.stub(ControlBehavior, 'getAnimationMode').returns(AnimationMode.none);

		// act - collapse
		this.sideNavigation.setExpanded(false);
		await nextUIUpdate(this.clock);

		// assert
		const oNavRef = this.sideNavigation.getDomRef();
		assert.notOk(oNavRef.classList.contains('sapTntSideNavigationAnimating'),
			'animating class must not be added in none animation mode');
		assert.notOk(this.sideNavigation._bAnimating, '_bAnimating flag is reset');

		oStub.restore();
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

			this.sideNavigation.$().find('.sapTntSideNavigationFlexible .sapTntNL').each(function (index, item) {
				assert.strictEqual(item.getAttribute('role'), 'menubar', 'flexible ul should have role "menubar"');
			});

			this.sideNavigation.$().find('.sapTntSideNavigationFixed .sapTntNL').each(function (index, item) {
				assert.strictEqual(item.getAttribute('role'), 'menubar', 'fixed ul should have role "menubar"');
			});

			this.sideNavigation.$().find("li:not(.sapTntNLOverflow) a").each(function (index, item) {
				assert.strictEqual(item.getAttribute('role'), 'menuitemradio', 'li should have role "menuitemradio"');
			});

			this.sideNavigation.$().find(".sapTntNLOverflow").each(function (index, item) {
				assert.strictEqual(item.querySelector("a").getAttribute('role'), 'menuitem', 'li should have role "menuitem"');
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

		assert.strictEqual(this.sideNavigation.getDomRef().style.getPropertyValue('--sapTntSideNavigation_ExpandedWidth'), '20rem', 'width is set');

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
				item: new NavigationList({
					items: [new NavigationListItem({ text: "Item" })]
				}),
				fixedItem: new NavigationList({
					items: [new NavigationListItem({ text: "Fixed Item" })]
				})
			});
			this.sideNavigation.placeAt(DOM_RENDER_LOCATION);
			await nextUIUpdate(); // no fake timer active in beforeEach
		},
		afterEach: function () {
			this.sideNavigation.destroy();
		}
	});

	QUnit.test("Aria attributes - aria-label", async function (assert) {
		const oRB = Library.getResourceBundleFor("sap.tnt");
		var label = "Side navigation menu with options";
		const getNavigation = () => this.sideNavigation.getDomRef("navigation");

		assert.strictEqual(getNavigation().getAttribute("role"), "navigation", "the navigation landmark wraps the lists");
		assert.strictEqual(getNavigation().getAttribute("aria-label"), oRB.getText("SIDE_NAVIGATION_LABEL_EXPANDED"), "navigation aria-label defaults to the expanded label");

		this.sideNavigation.setExpanded(false);
		await nextUIUpdate(this.clock);

		assert.strictEqual(getNavigation().getAttribute("aria-label"), oRB.getText("SIDE_NAVIGATION_LABEL_COLLAPSED"), "navigation aria-label switches to the collapsed label when collapsed");

		this.sideNavigation.setExpanded(true);
		this.sideNavigation.setAriaLabel(label);
		await nextUIUpdate(this.clock);

		assert.strictEqual(getNavigation().getAttribute("aria-label"), label, "an explicitly set aria-label takes precedence over the default");

		const sDescriptionId = getNavigation().getAttribute("aria-describedby");
		assert.ok(sDescriptionId, "aria-describedby is set on the navigation landmark");
		assert.strictEqual(document.getElementById(sDescriptionId).textContent, oRB.getText("SIDE_NAVIGATION_DESCRIPTION"), "aria-describedby points to the invisible description text");

		assert.notOk(this.sideNavigation.getDomRef().getAttribute("aria-label"), "the outer element no longer carries the navigation label");

		assert.strictEqual(this.sideNavigation.getAggregation("item").$().attr('aria-label'), oRB.getText("SIDE_NAVIGATION_FLEXIBLE_LIST_LABEL"), 'ul for flexible list should have aria-label "Primary Navigation Menu"');
		assert.strictEqual(this.sideNavigation.getAggregation("fixedItem").$().attr('aria-label'), oRB.getText("SIDE_NAVIGATION_FIXED_LIST_LABEL"), 'ul for fixed list should have aria-label "Footer Navigation Menu"');

		this.sideNavigation.setExpanded(false);
		await nextUIUpdate(this.clock);

		assert.strictEqual(this.sideNavigation.getAggregation("item").$().attr('aria-label'), oRB.getText("SIDE_NAVIGATION_FLEXIBLE_LIST_LABEL_COLLAPSED"), 'collapsed flexible list (menubar) uses the dedicated "Primary Navigation Menu" label');
	});

	QUnit.test("collapsed flexible list renders as a menubar with the dedicated label", async function (assert) {
		const oRB = Library.getResourceBundleFor("sap.tnt");
		const oFlexibleList = this.sideNavigation.getItem();

		// While expanded, the flexible list is a tree carrying its default label.
		assert.strictEqual(oFlexibleList.$().attr("role"), "tree", "expanded flexible list is a tree");
		assert.notOk(oFlexibleList.$().attr("aria-orientation"), "expanded tree has no explicit orientation");
		assert.strictEqual(oFlexibleList.$().attr("aria-label"), oRB.getText("SIDE_NAVIGATION_FLEXIBLE_LIST_LABEL"), "expanded flexible list uses the default label");

		// Collapsing it turns the flexible list into a vertical menubar with the dedicated collapsed label.
		this.sideNavigation.setExpanded(false);
		await nextUIUpdate(this.clock);

		assert.strictEqual(oFlexibleList.$().attr("role"), "menubar", "collapsed flexible list renders as a menubar");
		assert.strictEqual(oFlexibleList.$().attr("aria-orientation"), "vertical", "collapsed menubar has vertical orientation");
		assert.strictEqual(oFlexibleList.$().attr("aria-label"), oRB.getText("SIDE_NAVIGATION_FLEXIBLE_LIST_LABEL_COLLAPSED"), "collapsed flexible list uses the dedicated collapsed label");
	});

	QUnit.test("flexible list keeps its label even when it is the only list", async function (assert) {
		const oRB = Library.getResourceBundleFor("sap.tnt");
		const oFlexibleList = this.sideNavigation.getItem();
		const oFixedList = this.sideNavigation.getFixedItem();

		// With items in both lists, the flexible list carries its own label.
		assert.strictEqual(oFlexibleList.$().attr("aria-label"), oRB.getText("SIDE_NAVIGATION_FLEXIBLE_LIST_LABEL"), "flexible list has its label while the fixed list has items");

		// Emptying the fixed list makes the flexible list the only list, but it keeps its label so the
		// tree stays named for assistive technology.
		oFixedList.removeAllItems();
		await nextUIUpdate(this.clock);

		assert.strictEqual(oFlexibleList.$().attr("aria-label"), oRB.getText("SIDE_NAVIGATION_FLEXIBLE_LIST_LABEL"), "flexible list keeps its label once the fixed list is empty");

		// Adding an item back to the fixed list leaves the flexible list's label unchanged.
		oFixedList.addItem(new NavigationListItem({ text: "Fixed Item" }));
		await nextUIUpdate(this.clock);

		assert.strictEqual(oFlexibleList.$().attr("aria-label"), oRB.getText("SIDE_NAVIGATION_FLEXIBLE_LIST_LABEL"), "flexible list still has its label when the fixed list has items again");
	});

	QUnit.module("Rendering", {
		beforeEach: async function () {
			this.sideNavigation = new SideNavigation({
				item: new NavigationList(),
				fixedItem: new NavigationList()
			});
			this.sideNavigation.placeAt(DOM_RENDER_LOCATION);
			await nextUIUpdate();
		},
		afterEach: function () {
			this.sideNavigation.destroy();
		}
	});

	QUnit.test("Separator and fixed list are hidden via CSS when fixedItem has no items", function (assert) {
		const oDomRef = this.sideNavigation.getDomRef();
		const oSeparator = oDomRef.querySelector(".sapTntSideNavigationSeparator");
		const oFixedListNL = oDomRef.querySelector(".sapTntSideNavigationFixed .sapTntNL");

		assert.ok(oSeparator, "Separator element is always rendered");
		assert.strictEqual(window.getComputedStyle(oSeparator).display, "none", "Separator has display:none when fixedItem has no visible items");
		assert.ok(oFixedListNL, "Fixed list NavigationList element exists in the DOM");
		assert.strictEqual(window.getComputedStyle(oFixedListNL).display, "none", "Fixed list has display:none when fixedItem has no items");
	});

	QUnit.module("filterSection", {
		beforeEach: async function () {
			this.oSearchField = new SideNavigationSearchField();
			this.sideNavigation = new SideNavigation({
				filterSection: this.oSearchField,
				item: new NavigationList({
					items: [
						new NavigationListItem({ text: "Item 1", key: "item1" }),
						new NavigationListItem({ text: "Item 2", key: "item2" })
					]
				}),
				fixedItem: new NavigationList({
					items: [
						new NavigationListItem({ text: "Fixed Item", key: "fixed1" })
					]
				})
			});
			this.sideNavigation.placeAt(DOM_RENDER_LOCATION);
			await nextUIUpdate(); // no fake timer active in beforeEach
		},
		afterEach: function () {
			this.sideNavigation.destroy();
		}
	});

	QUnit.test("filterSection is rendered when expanded", function (assert) {
		const oFilterSection = this.sideNavigation.getDomRef().querySelector(".sapTntSideNavigationFilterSection");

		assert.ok(oFilterSection, "filterSection container is rendered");
		assert.ok(oFilterSection.contains(this.oSearchField.getDomRef()), "Search field is rendered inside filterSection");
	});

	QUnit.test("filterSection is not rendered when collapsed", function (assert) {
		this.clock.restore();
		const done = assert.async();

		this.sideNavigation.setExpanded(false);

		setTimeout(function () {
			const oFilterSection = this.sideNavigation.getDomRef().querySelector(".sapTntSideNavigationFilterSection");
			assert.notOk(oFilterSection, "filterSection is not rendered when SideNavigation is collapsed");
			done();
		}.bind(this), 1000);
	});

	QUnit.test("filterSection is rendered before the flexible list", function (assert) {
		const oDomRef = this.sideNavigation.getDomRef();
		const oFilterSection = oDomRef.querySelector(".sapTntSideNavigationFilterSection");
		const oFlexibleList = oDomRef.querySelector(".sapTntSideNavigationFlexible");

		// The flexible list now lives inside the navigation landmark wrapper, so compare
		// document order rather than direct-sibling index.
		const bFilterBeforeList = !!(oFilterSection.compareDocumentPosition(oFlexibleList) & Node.DOCUMENT_POSITION_FOLLOWING);
		assert.ok(bFilterBeforeList, "filterSection is rendered before the flexible list");
	});

	QUnit.test("getFilterSection returns the aggregated control", function (assert) {
		assert.strictEqual(this.sideNavigation.getFilterSection(), this.oSearchField, "getFilterSection returns the search field");
	});

	QUnit.test("setFilterSection replaces the control", async function (assert) {
		const oNewSearchField = new SideNavigationSearchField();
		this.sideNavigation.setFilterSection(oNewSearchField);
		await nextUIUpdate(this.clock);

		assert.strictEqual(this.sideNavigation.getFilterSection(), oNewSearchField, "Aggregation is updated");
		assert.ok(
			this.sideNavigation.getDomRef().querySelector(".sapTntSideNavigationFilterSection").contains(oNewSearchField.getDomRef()),
			"New search field is rendered"
		);
	});

	QUnit.test("setFilterSection to null removes the section", async function (assert) {
		this.sideNavigation.setFilterSection(null);
		await nextUIUpdate(this.clock);

		const oFilterSection = this.sideNavigation.getDomRef().querySelector(".sapTntSideNavigationFilterSection");
		assert.notOk(oFilterSection, "filterSection is not rendered when set to null");
	});

	QUnit.test("destroyFilterSection removes the section", async function (assert) {
		this.sideNavigation.destroyFilterSection();
		await nextUIUpdate(this.clock);

		assert.notOk(this.sideNavigation.getFilterSection(), "getFilterSection returns null after destroy");
		assert.notOk(
			this.sideNavigation.getDomRef().querySelector(".sapTntSideNavigationFilterSection"),
			"filterSection is not rendered after destroy"
		);
	});

	QUnit.test("filterSection does not affect item selection", function (assert) {
		this.sideNavigation.setSelectedKey("item1");
		assert.strictEqual(this.sideNavigation.getSelectedKey(), "item1", "Selection works with filterSection present");

		this.sideNavigation.setSelectedKey("fixed1");
		assert.strictEqual(this.sideNavigation.getSelectedKey(), "fixed1", "Fixed item selection works with filterSection present");
	});

	QUnit.test("filterSection does not affect itemSelect event", function (assert) {
		const oSpy = sinon.spy();
		this.sideNavigation.attachItemSelect(oSpy);

		const oItem = this.sideNavigation.getItem().getItems()[1];
		oItem._selectItem();

		assert.strictEqual(oSpy.callCount, 1, "itemSelect event fires correctly with filterSection present");
		assert.strictEqual(oSpy.firstCall.args[0].getParameter("item"), oItem, "Correct item is passed in the event");
	});

	QUnit.test("filterSection reappears after collapse and expand", function (assert) {
		this.clock.restore();
		const done = assert.async();

		this.sideNavigation.setExpanded(false);

		setTimeout(function () {
			assert.notOk(
				this.sideNavigation.getDomRef().querySelector(".sapTntSideNavigationFilterSection"),
				"filterSection is hidden when collapsed"
			);

			this.sideNavigation.setExpanded(true);

			setTimeout(function () {
				assert.ok(
					this.sideNavigation.getDomRef().querySelector(".sapTntSideNavigationFilterSection"),
					"filterSection reappears after re-expanding"
				);
				done();
			}.bind(this), 500);
		}.bind(this), 500);
	});

	QUnit.module("Empty fixed list (merged search)", {
		beforeEach: async function () {
			this.oSearchField = new SideNavigationSearchField();
			this.sideNavigation = new SideNavigation({
				filterSection: this.oSearchField,
				item: new NavigationList({
					items: [
						new NavigationListItem({ text: "Item 1", key: "item1" }),
						new NavigationListItem({ text: "Item 2", key: "item2" })
					]
				}),
				fixedItem: new NavigationList({
					items: [
						new NavigationListItem({ text: "Fixed Item", key: "fixed1" })
					]
				})
			});
			this.sideNavigation.placeAt(DOM_RENDER_LOCATION);
			await nextUIUpdate(); // no fake timer active in beforeEach
		},
		afterEach: function () {
			this.sideNavigation.destroy();
		}
	});

	QUnit.test("swapping or clearing the fixedItem aggregation updates the rendering", async function (assert) {
		const oRB = Library.getResourceBundleFor("sap.tnt");
		const oFlexibleList = this.sideNavigation.getItem();
		const oOriginalFixedList = this.sideNavigation.getFixedItem();

		// Removing the whole fixed list aggregation makes the flexible list the only list.
		this.sideNavigation.setFixedItem(null);
		await nextUIUpdate(this.clock);

		assert.strictEqual(oFlexibleList.$().attr("aria-label"), oRB.getText("SIDE_NAVIGATION_FLEXIBLE_LIST_LABEL"), "flexible list keeps its label once the fixed list aggregation is removed");
		assert.notOk(this.sideNavigation.getDomRef().querySelector(".sapTntSideNavigationFixed"), "no fixed list is rendered once the aggregation is removed");
		assert.notOk(this.sideNavigation.getDomRef().querySelector(".sapTntSideNavigationSeparator"), "no separator is rendered once the fixed list aggregation is removed");

		oOriginalFixedList.destroy();

		// Setting a fresh, non-empty fixed list renders it with the separator visible again.
		this.sideNavigation.setFixedItem(new NavigationList({
			items: [new NavigationListItem({ text: "New Fixed Item" })]
		}));
		await nextUIUpdate(this.clock);

		const oSeparator = this.sideNavigation.getDomRef().querySelector(".sapTntSideNavigationSeparator");
		assert.strictEqual(oFlexibleList.$().attr("aria-label"), oRB.getText("SIDE_NAVIGATION_FLEXIBLE_LIST_LABEL"), "flexible list keeps its label once a non-empty fixed list is set");
		assert.ok(this.sideNavigation.getDomRef().querySelector(".sapTntSideNavigationFixed .sapTntNL"), "the newly set fixed list is rendered");
		assert.ok(oSeparator, "the separator is rendered for the newly set fixed list");
		assert.notStrictEqual(window.getComputedStyle(oSeparator).display, "none", "the separator is visible once a non-empty fixed list is set");

		// Emptying the newly set list hides the separator again via CSS.
		this.sideNavigation.getFixedItem().removeAllItems();
		await nextUIUpdate(this.clock);

		assert.strictEqual(window.getComputedStyle(this.sideNavigation.getDomRef().querySelector(".sapTntSideNavigationSeparator")).display, "none", "separator is hidden again once the newly set fixed list is emptied");
	});

	QUnit.test("emptying and re-filling the fixed list toggles the separator and the fixed list visibility", async function (assert) {
		const oRB = Library.getResourceBundleFor("sap.tnt");
		const oFlexibleList = this.sideNavigation.getItem();
		const getFixedListUl = () => this.sideNavigation.getDomRef().querySelector(".sapTntSideNavigationFixed .sapTntNL");
		const getSeparator = () => this.sideNavigation.getDomRef().querySelector(".sapTntSideNavigationSeparator");

		// While both lists have items, the flexible list carries its label, the fixed list is visible
		// and the separator is visible.
		assert.strictEqual(oFlexibleList.$().attr("aria-label"), oRB.getText("SIDE_NAVIGATION_FLEXIBLE_LIST_LABEL"), "flexible list carries its label while the fixed list has items");
		assert.notStrictEqual(window.getComputedStyle(getFixedListUl()).display, "none", "fixed list is visible while it has items");
		assert.notStrictEqual(window.getComputedStyle(getSeparator()).display, "none", "separator is visible while the fixed list has items");

		// Emptying the fixed list makes the flexible list the only list: it keeps its label, and both
		// the fixed list and the separator are hidden via CSS (.sapTntNL:empty and the :has selector).
		this.sideNavigation.getFixedItem().removeAllItems();
		await nextUIUpdate(this.clock);

		assert.strictEqual(oFlexibleList.$().attr("aria-label"), oRB.getText("SIDE_NAVIGATION_FLEXIBLE_LIST_LABEL"), "flexible list keeps its aria-label when it is the only list");
		assert.strictEqual(oFlexibleList.$().attr("role"), "tree", "flexible list stays a real tree when it is the only list");
		assert.strictEqual(window.getComputedStyle(getFixedListUl()).display, "none", "fixed list is hidden once it is empty");
		assert.strictEqual(window.getComputedStyle(getSeparator()).display, "none", "separator is hidden once the fixed list is empty");

		// Adding an item back restores the fixed list's and the separator's visibility.
		this.sideNavigation.getFixedItem().addItem(new NavigationListItem({ text: "Fixed Item" }));
		await nextUIUpdate(this.clock);

		assert.strictEqual(oFlexibleList.$().attr("aria-label"), oRB.getText("SIDE_NAVIGATION_FLEXIBLE_LIST_LABEL"), "flexible list keeps its label once the fixed list has items again");
		assert.notStrictEqual(window.getComputedStyle(getFixedListUl()).display, "none", "fixed list is visible again once it has items");
		assert.notStrictEqual(window.getComputedStyle(getSeparator()).display, "none", "separator is visible again once the fixed list has items");
	});

	QUnit.test("there is exactly one navigation landmark and the outer element is not one", function (assert) {
		const oDomRef = this.sideNavigation.getDomRef();
		const aLandmarks = oDomRef.querySelectorAll('[role="navigation"]');

		assert.strictEqual(aLandmarks.length, 1, "exactly one navigation landmark is rendered");
		assert.strictEqual(aLandmarks[0], this.sideNavigation.getDomRef("navigation"), "the landmark is the inner navigation wrapper");

		assert.strictEqual(oDomRef.tagName, "DIV", "the outer element is a plain div, not a nav element");
		assert.notOk(oDomRef.getAttribute("role"), "the outer element does not carry a role, so it is not an implicit landmark");
	});
});