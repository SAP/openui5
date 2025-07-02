/*global QUnit sinon */

sap.ui.define([
	'sap/base/Log',
	"sap/ui/core/Element",
	"sap/ui/core/Lib",
	"sap/ui/core/library",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/events/KeyCodes",
	"sap/ui/thirdparty/jquery",
	'sap/m/Text',
	'sap/m/Dialog',
	'sap/tnt/NavigationList',
	'sap/tnt/NavigationListItem',
	'sap/tnt/NavigationListGroup',
	'sap/tnt/NavigationListMenuItem',
	"sap/ui/test/utils/nextUIUpdate",
	"sap/ui/test/utils/waitForThemeApplied"
], function(
	Log,
	Element,
	Library,
	coreLibrary,
	QUnitUtils,
	KeyCodes,
	jQuery,
	Text,
	Dialog,
	NavigationList,
	NavigationListItem,
	NavigationListGroup,
	NavigationListMenuItem,
	nextUIUpdate,
	waitForThemeApplied
) {
	'use strict';

	// shortcut for sap.ui.core.OpenState
	var OpenState = coreLibrary.OpenState;

	const nextJQuerySlideUp = () => {
		const { promise, resolve } = Promise.withResolvers();
		const fnOriginalSlideUp = jQuery.fn.slideUp;
		const stub = sinon.stub(jQuery.fn, "slideUp", function () {
			fnOriginalSlideUp.apply(this, arguments)
				.promise()
				.done(() => {
					stub.restore();
					resolve();
				});
		});

		return promise;
	};

	const nextJQuerySlideDown = () => {
		const { promise, resolve } = Promise.withResolvers();
		const fnOriginalSlideDown = jQuery.fn.slideDown;
		const stub = sinon.stub(jQuery.fn, "slideDown", function () {
			fnOriginalSlideDown.apply(this, arguments)
				.promise()
				.done(() => {
					stub.restore();
					resolve();
				});
		});

		return promise;
	};

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

	function getNavigationList(selectedKey, collapsed) {
		return new NavigationList({
			selectedKey: selectedKey,
			expanded: !collapsed,
			items: [
				new NavigationListItem("groupItem1", {
					text: 'Root 1',
					key: 'rootChild1',
					icon: 'sap-icon://employee',
					href: '#/rootChild1',
					target: '_blank',
					ariaHasPopup: 'Tree',
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
					tooltip: 'Root 3 - custom tooltip',
					icon: 'sap-icon://employee',
					items: [
						new NavigationListItem({
							text: 'Child 1'
						}),
						new NavigationListItem({
							text: 'Child 2',
							tooltip: 'Child 2 - custom tooltip'
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
							href: '#/rootChild1',
							target: '_blank',
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
					text: 'External Link',
					id: 'externalLinkItem',
					selectable: false,
					target: "_blank",
					href: "https://sap.com",
					icon: "sap-icon://attachment"
				})
			]
		});
	}

	function getSecondNavigationList () {
		return new NavigationList({
			expanded: true,
			items: [
				new NavigationListItem("nonSelectableItem", {
					text: 'Root 5',
					selectable: false,
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
				new NavigationListItem("selectableItem", {
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
				new NavigationListItem('actionItem', {
					text: 'Action Item',
					icon: 'sap-icon://write-new',
					design: "Action"
				}),
				new NavigationListItem('defaultItem', {
					text: 'Default Item',
					icon: 'sap-icon://write-new'
				})
			]
		});
	}

	QUnit.module("API and Rendering", {
		beforeEach: async function () {
			this.navigationList = getNavigationList();
			this.navigationList.placeAt("qunit-fixture");
			await nextUIUpdate();
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
		assert.ok(Element.getElementById(this.navigationList.getId()), "created");
	});

	QUnit.test("contains elements and classes", function (assert) {
		assert.ok(this.navigationList.$().hasClass("sapTntNL"), "sapTntNL class is set");
		assert.strictEqual(this.navigationList.getDomRef().children.length, 9, "items number is correct");
		assert.strictEqual(this.navigationList.getDomRef().children[0].querySelector(".sapTntNLIItemsContainer").children.length, 3, "first root item's children are correct number");
		assert.strictEqual(this.navigationList.getDomRef().querySelectorAll("#navGroup1 ul li").length, 3, "first group's children are correct number");

		var aLinks = this.navigationList.$().find("a");

		assert.strictEqual(aLinks[0].getAttribute('href'), '#/rootChild1', 'href attr is correct');
		assert.strictEqual(aLinks[0].getAttribute('target'), '_blank', 'target attr is correct');

		assert.strictEqual(aLinks[1].getAttribute('href'), '#/child1', 'href attr is correct');
		assert.strictEqual(aLinks[1].getAttribute('target'), '_self', 'target attr is correct');

		var firstItemDomRef = this.navigationList.getItems()[0].getDomRef();
		var computedStyle = getComputedStyle(firstItemDomRef.querySelector(".sapTntNLI"), ":before");

		assert.strictEqual(computedStyle.pointerEvents, "none", "pointer events are disabled");
	});

	QUnit.test("list.setExpanded(false)", async function (assert) {
		assert.notOk(this.navigationList.$().hasClass('sapTntNLCollapsed'), "expanded mode is ok");

		this.navigationList.setExpanded(false);
		await nextUIUpdate();

		assert.ok(this.navigationList.$().hasClass('sapTntNLCollapsed'), "collapsed mode is ok");
	});

	QUnit.test("rootItem.setExpanded(false)", async function (assert) {
		assert.notOk(this.navigationList.getItems()[2].getDomRef().querySelector(".sapTntNLIItemsContainer").classList.contains("sapTntNLIItemsContainerHidden"), "sapTntNLIItemsContainerHidden class is not set");

		this.navigationList.getItems()[2].setExpanded(false);
		await nextUIUpdate();

		assert.ok(this.navigationList.getItems()[2].getDomRef().querySelector(".sapTntNLIItemsContainer").classList.contains("sapTntNLIItemsContainerHidden"), "sapTntNLIItemsContainerHidden class is set");
	});

	QUnit.test("Tooltips when expanded", async function (assert) {
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
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oItem.getDomRef("a").title, oItem.getTooltip());
		assert.strictEqual(oNestedItem.getDomRef("a").title, oNestedItem.getTooltip());

		// Clean up
		oNL.destroy();
	});

	QUnit.test("Tooltips when collapsed", async function (assert) {
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
		await nextUIUpdate();

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

	QUnit.test("Items in popover have 'sapTntNLIInPopover' class", async function (assert) {
		// Arrange
		const oNestedItem = new NavigationListItem({
			text: "nestedItem"
		});
		const oItem = new NavigationListItem({
			text: "item1",
			items: [
				oNestedItem
			]
		});
		const oNL = new NavigationList({
			expanded: false,
			items: [
				oItem
			]
		});

		oNL.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Act
		oItem.$().trigger("tap");
		const oItemInPopover = oNL._oPopover.getContent()[0].getItems()[0];
		const oNestedItemInPopover = oNL._oPopover.getContent()[0].getItems()[0].getItems()[0];

		// Assert
		assert.ok(oItemInPopover.getDomRef().firstElementChild.classList.contains("sapTntNLIInPopover"), "'sapTntNLIInPopover' should be set");
		assert.ok(oNestedItemInPopover.getDomRef().classList.contains("sapTntNLIInPopover"), "'sapTntNLIInPopover' should be set");

		// Clean up
		oNL.destroy();
		await clearPendingUIUpdates();
	});

	QUnit.module("Lifecycle");

	QUnit.test("Popover is destroyed when NavigationList is destroyed", async function (assert) {
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
		await nextUIUpdate();

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
		beforeEach: async function () {
			this.navigationList = getNavigationList('rootChild1');
			this.navigationList.placeAt("qunit-fixture");

			await nextUIUpdate();

			this.clock = sinon.useFakeTimers();
		},
		afterEach: async function () {
			this.navigationList.destroy();
			this.navigationList = null;

			await clearPendingUIUpdates(this.clock);
			this.clock.restore();
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
			assert.equal(item.getAttribute('tabindex'), '-1', jQuery(item).text() + ' has a tab index');
			assert.ok(item.getAttribute('aria-disabled'), jQuery(item).text() + ' has aria-disabled attribute.');
		});

		this.navigationList.$().find('li.sapTntNLISecondLevel:not(.sapTntNLIDisabled) a').each(function (index, item) {
			assert.equal(item.getAttribute('tabindex'), '-1', jQuery(item).text() + ' has a tab index.');
		});

		this.navigationList.$().find('li.sapTntNLISecondLevel.sapTntNLIDisabled a').each(function (index, item) {
			assert.equal(item.getAttribute('tabindex'), '-1', 'Disabled ' + jQuery(item).text() + ' has a tab index.');
			assert.ok(item.getAttribute('aria-disabled'), jQuery(item).text() + ' has aria-disabled attribute.');
		});
	});

	QUnit.test('Focus', async function (assert) {
		var oFirstItem = this.navigationList.getItems()[0];
		oFirstItem.getDomRef("a").focus();
		this.clock.tick(500);
		assert.strictEqual(document.activeElement.textContent, "Root 1", "The first item is focused");

		var oDialog = new Dialog();
		oFirstItem.attachSelect(function(){oDialog.open();});
		oFirstItem.fireSelect();
		await nextUIUpdate(this.clock);
		this.clock.tick(500);
		assert.ok(document.activeElement.classList.contains("sapMDialog"), "The dialog is focused");

		oDialog.close();
		await nextUIUpdate(this.clock);
		this.clock.tick(500);
		assert.strictEqual(document.activeElement.textContent, "Root 1", "The first item is focused again");
	});

	QUnit.test('ARIA attributes', async function (assert) {

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
		await nextUIUpdate(this.clock);
		this.clock.tick(500);

		assert.strictEqual(newSelectedItem.getDomRef("a").getAttribute("aria-current"), "page", "aria-current is added on newly selected item");
		assert.strictEqual(oldSelectedItem.getDomRef("a").getAttribute("aria-current"), null, "aria-current is removed from the previously selected item");

		QUnitUtils.triggerEvent("tap", oldSelectedItem.getDomRef());
		await nextUIUpdate(this.clock);
		this.clock.tick(500);

		this.navigationList.getItems()[0].setExpanded(false);
		await nextUIUpdate(this.clock);

		const oNavigationListGroup = this.navigationList.getItems()[5];
		assert.strictEqual(oNavigationListGroup.getDomRef("subtree").getAttribute("aria-label"), oNavigationListGroup.getText(), "Group's inner subtree has label containing the text of the group");

		currentItem = this.navigationList.getDomRef().querySelector("li a");
		assert.strictEqual(currentItem.getAttribute("aria-expanded"), "false", jQuery(currentItem).text() + " do not have ARIA attribute expanded.");

		var currentItemNoChildren = this.navigationList.getDomRef().querySelectorAll(".sapTntNLIFirstLevel")[4].querySelector("a");
		assert.strictEqual(currentItemNoChildren.hasAttribute("aria-expanded"), false, jQuery(currentItemNoChildren).text() + " has no ARIA attribute expanded.");

		this.navigationList.setExpanded(false);
		await nextUIUpdate(this.clock);

		var currentItemCollapsed = this.navigationList.getDomRef().querySelectorAll(".sapTntNLIFirstLevel")[2];
		assert.strictEqual(currentItemCollapsed.querySelector("a").hasAttribute("aria-expanded"), false, "Root 2 has no ARIA attribute expanded when NavigationList is collapsed.");
		assert.strictEqual(currentItemCollapsed.querySelector("a").getAttribute("aria-checked"), "false", 'aria-checked is set to false.');

		this.navigationList.getItems()[2]._toggle(true);
		assert.strictEqual(currentItemCollapsed.querySelector("a").getAttribute("aria-checked"), "true" ,"aria-checked is set to true.");
		assert.strictEqual(currentItemCollapsed.querySelector("a").getAttribute("aria-current"), null, "aria-current is not set.");

		//aria-haspopup
		this.navigationList.setExpanded(true);
		await nextUIUpdate(this.clock);

		assert.strictEqual(this.navigationList.getItems()[1].getDomRef().querySelector("li a").getAttribute("aria-haspopup"), null, "aria-haspopup is not set");

		//aria-describedby for external links
		const sExpectedAriaRoleDescribedby = Library.getResourceBundleFor("sap.tnt")
			.getText("NAVIGATION_LIST_EXTERNAL_LINK_DESCRIPTION");

		const oExternalLinkItemRef = this.navigationList.getDomRef().querySelector("#externalLinkItem a");
		assert.ok(oExternalLinkItemRef.getAttribute("aria-describedby"), "aria-describedby is set");
		const oInvisibleTextId = oExternalLinkItemRef.getAttribute("aria-describedby");
		const oInvisibleTextRef = document.getElementById(oInvisibleTextId);
		assert.strictEqual(oInvisibleTextRef.innerText, sExpectedAriaRoleDescribedby, "aria-describedby is set to the correct value");

		this.navigationList.setExpanded(false);
		await nextUIUpdate(this.clock);
		assert.strictEqual(currentItem.getAttribute("aria-haspopup"), "tree", "aria-haspopup is of correct type");
		const oItem = this.navigationList.getItems()[1];
		oItem.setAriaHasPopup("Dialog");
		await nextUIUpdate(this.clock);
		oItem.getDomRef().querySelector("li a");
		assert.strictEqual(currentItem.getAttribute("aria-haspopup"), "tree", "aria-haspopup is of correct type when setting different value in collapsed mode");

		//aria-roledescription
		assert.strictEqual(currentItem.getAttribute('aria-roledescription'), sExpectedAriaRoleDescription, jQuery(currentItem).text() + ' has ARIA attribute roledescription.');
	});

	QUnit.module("ARIA", {
		beforeEach: async function () {
			this.navigationList = getNavigationList();
			this.navigationList.placeAt("qunit-fixture");

			await nextUIUpdate();
		},
		afterEach: function () {
			this.navigationList.destroy();
			this.navigationList = null;
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

	QUnit.test('Anchors inside NavigationListItems should have correct roles and aria-role', async function (assert) {
		var groupItem = this.navigationList.getItems()[0];

		var groupItemAnchorElement = groupItem.getDomRef().getElementsByTagName("a")[0];
		assert.equal(groupItemAnchorElement.getAttribute("role"), 'treeitem', "The anchor is with correct role");

		var secondLevelItemAnchorElement = groupItem.getDomRef().getElementsByTagName("a")[1];
		assert.equal(secondLevelItemAnchorElement.getAttribute("role"), 'treeitem', "The anchor is with correct role");

		this.navigationList.setExpanded(false);
		await nextUIUpdate();

		groupItem = this.navigationList.getItems()[0];
		groupItemAnchorElement = groupItem.getDomRef().getElementsByTagName("a")[0];
		assert.strictEqual(groupItemAnchorElement.getAttribute("role"), "menuitemradio", "The anchor is with correct role");
	});

	QUnit.module('SelectedItem association', {
		beforeEach: async function () {
			this.navigationList = getNavigationList();

			await nextUIUpdate();
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

	QUnit.test('Calling setSelectedItem before the NavigationList is rendered', async function (assert) {
		// arrange
		const navigationList = new NavigationList({
			expanded: false
		});

		navigationList.placeAt("qunit-fixture");
		await nextUIUpdate();

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
		await nextUIUpdate();

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

	QUnit.test('api', async function (assert) {
		this.navigationList = getNavigationList('child1');
		this.navigationList.placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.strictEqual(this.navigationList._selectedItem.getText(), 'Child 1', 'initial selection is correct');

		this.navigationList.setSelectedKey('child3');
		await nextUIUpdate();

		assert.strictEqual(this.navigationList._selectedItem.getText(), 'Child 3', 'selection is correct');

		this.navigationList.setSelectedKey('');
		await nextUIUpdate();

		assert.notOk(this.navigationList._selectedItem,'selection is removed');
	});

	QUnit.test('interaction', async function (assert) {
		this.navigationList = getNavigationList();

		var oStub = sinon.stub(NavigationListItem.prototype, "_openUrl", function () { });

		this.navigationList.placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.notOk(this.navigationList._selectedItem, 'no initial selection');

		this.navigationList.getItems()[0].getItems()[0]._selectItem();

		assert.strictEqual(this.navigationList.getSelectedKey(), 'child1', 'selection is correct');

		assert.ok(oStub.calledOnce, 'url is open');

		oStub.restore();
	});

	QUnit.module("Interaction", {
		beforeEach: async function () {
			this.navigationList = getNavigationList();
			this.navigationList.placeAt("qunit-fixture");

			await nextUIUpdate();

			this.clock = sinon.useFakeTimers();
		},
		afterEach: async function () {
			this.navigationList.destroy();
			this.navigationList = null;

			await clearPendingUIUpdates(this.clock);
			this.clock.restore();
		}
	});

	QUnit.test("Rerender during expansion of unselectable parent item", async function (assert) {
		// Arrange
		const done = assert.async();

		const unselectableParentItem = this.navigationList.getItems()[0];
		unselectableParentItem.setProperty("selectable", false);

		await nextUIUpdate(this.clock);

		// Simulate rerender
		const originalExpand = unselectableParentItem.expand;
		unselectableParentItem.expand = function () {
			originalExpand.apply(this, arguments);
			this.getNavigationList().setProperty("width", "15rem");
		};

		const $expanderIcon = jQuery(unselectableParentItem.getDomRef().querySelector(".sapTntNLIExpandIcon"));

		// Act: Trigger expansion
		$expanderIcon.trigger("tap");
		await nextUIUpdate(this.clock);

		const oContainer = unselectableParentItem.getDomRef().querySelector(".sapTntNLIItemsContainer");
		assert.ok(oContainer, "The container exists after rerender");
		assert.notOk(oContainer.classList.contains("sapTntNLIItemsContainerHidden"), "The container is visible after rerender");

		done();
	});

	QUnit.test("click group expander", async function (assert) {
		// arrange
		this.clock.restore(); // use real timeouts for this test

		// assert
		const oItem = this.navigationList.getItems()[3];
		const oItemChildrenContainer = oItem.getDomRef("subtree");
		assert.strictEqual(oItemChildrenContainer.classList.contains("sapTntNLIItemsContainerHidden"), false, "sapTntNLIItemsContainerHidden class is not set");

		// arrange
		const $expanderIcon = jQuery(oItem.getDomRef().querySelector(".sapTntNLIExpandIcon"));

		// act
		$expanderIcon.trigger("tap");
		await Promise.all([nextUIUpdate(), nextJQuerySlideUp()]);

		// assert
		assert.strictEqual(oItemChildrenContainer.classList.contains("sapTntNLIItemsContainerHidden"), true, "sapTntNLIItemsContainerHidden class is set");
	});

	QUnit.test("Expand/collapse with keyboard", async function (assert) {
		// Arrange
		var oItem = Element.getElementById("groupItem3"),
			$item = oItem.$(),
			$focusableElement = $item.find(".sapTntNLIFirstLevel [tabindex]");

		$focusableElement.trigger("focus");

		// Act collapse
		QUnitUtils.triggerKeydown($item, KeyCodes.ARROW_LEFT);
		await nextUIUpdate(this.clock);
		this.clock.tick(500);

		// Assert collapsed
		assert.strictEqual(oItem.getExpanded(), false, "The item collapses when left arrow is pressed");
		assert.ok($focusableElement.is(":focus"), "The item is still focused");


		// Act expand
		QUnitUtils.triggerKeydown($item, KeyCodes.ARROW_RIGHT);
		await nextUIUpdate(this.clock);
		this.clock.tick(500);

		// Assert expanded
		assert.strictEqual(oItem.getExpanded(), true, "The item expands when right arrow is pressed");
		assert.ok($focusableElement.is(":focus"), "The item is still focused");

		// Act move focus to child item
		QUnitUtils.triggerKeydown($item, KeyCodes.ARROW_DOWN);
		await nextUIUpdate(this.clock);
		this.clock.tick(500);


		var focusedElement = document.activeElement;

		QUnitUtils.triggerKeydown(focusedElement, KeyCodes.ARROW_RIGHT);
		await nextUIUpdate(this.clock);
		this.clock.tick(500);

		var focusedElement2 = document.activeElement;

		assert.strictEqual(focusedElement, focusedElement2, "focus is not moved by pressing right arrow key");

		QUnitUtils.triggerKeydown(focusedElement, KeyCodes.ARROW_LEFT);
		await nextUIUpdate(this.clock);
		this.clock.tick(500);

		var focusedElement3 = document.activeElement;

		assert.strictEqual(focusedElement2, focusedElement3, "focus is not moved by pressing left arrow key");
	});

	QUnit.test("Expand/collapse with mouse", async function (assert) {
		// Arrange
		var oItem = Element.getElementById("groupItem3"),
			$item = oItem.$(),
			$icon = $item.find(".sapTntNLIFirstLevel .sapTntNLIExpandIcon"),
			$iconTitle = $item.find(".sapTntNLIFirstLevel .sapTntNLIExpandIcon .sapUiIconTitle");

		// Act collapse
		QUnitUtils.triggerEvent("tap", $icon);
		await nextUIUpdate(this.clock);
		this.clock.tick(500);

		// Assert collapsed
		assert.notOk(oItem.getExpanded(), "The item collapses");

		// Act expand
		QUnitUtils.triggerEvent("tap", $icon);
		await nextUIUpdate(this.clock);
		this.clock.tick(500);

		// Assert expanded
		assert.ok(oItem.getExpanded(), "The item expands");

		// Act collapse
		QUnitUtils.triggerEvent("tap", $iconTitle);
		await nextUIUpdate(this.clock);
		this.clock.tick(500);

		// Assert collapsed
		assert.notOk(oItem.getExpanded(), "The item collapses");


		// Act expand
		QUnitUtils.triggerEvent("tap", $iconTitle);
		await nextUIUpdate(this.clock);
		this.clock.tick(500);

		// Assert expanded
		assert.ok(oItem.getExpanded(), "The item expands");
	});


	QUnit.test("select group", async function (assert) {

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

		await nextUIUpdate(this.clock);

		// wait 500ms
		this.clock.tick(500);

		assert.ok(oTargetItem.classList.contains("sapTntNLISelected"), "sapTntNLISelected class is set");

		assert.strictEqual(fnEventSpy.callCount, 1, "should fire select event once");
		assert.strictEqual(bPassedArg.getText(), "Root 1", "should pass the first item as argument");

		assert.ok(oStub.calledOnce, "url is open");

		oStub.restore();
	});

	QUnit.test("select group with Enter", function (assert) {
		// Arrange
		const fnEventSpy = sinon.spy();
		const oStub = sinon.stub(NavigationListItem.prototype, "_openUrl", function () { });
		const oTargetItem = this.navigationList.getItems()[3];
		this.navigationList.attachItemSelect(fnEventSpy);

		// Act
		QUnitUtils.triggerKeydown(oTargetItem.getDomRef().querySelector(".sapTntNLI"), KeyCodes.ENTER);

		// Assert
		assert.strictEqual(fnEventSpy.callCount, 1, "should fire select event once");
		fnEventSpy.reset();

		// Act
		QUnitUtils.triggerKeyup(oTargetItem.getDomRef().querySelector(".sapTntNLI"), KeyCodes.ENTER);

		// Assert
		assert.strictEqual(fnEventSpy.callCount, 0, "select event should NOT be fired");

		// Clean up
		oStub.restore();
	});

	QUnit.test("enter on external link styles", function (assert) {
		// Arrange
		const fnEventSpy = sinon.spy();
		const oStub = sinon.stub(NavigationListItem.prototype, "_openUrl", function () { });
		const oTargetItem = this.navigationList.getItems()[6];
		this.navigationList.attachItemSelect(fnEventSpy);

		// Act
		QUnitUtils.triggerKeydown(oTargetItem.getDomRef().querySelector(".sapTntNLI"), KeyCodes.ENTER);

		// Assert
		assert.notOk(oTargetItem.getDomRef().classList.contains("sapTntNLIActive"), "sapTntNLIActive class is NOT set");
		assert.strictEqual(fnEventSpy.callCount, 0, "select event should NOT be fired");

		// Clean up
		oStub.restore();
	});

	QUnit.test("select group with Space", function (assert) {
		// Arrange
		const fnEventSpy = sinon.spy();
		const oStub = sinon.stub(NavigationListItem.prototype, "_openUrl", function () { });
		const oTargetItem = this.navigationList.getItems()[3];
		this.navigationList.attachItemSelect(fnEventSpy);

		// Act
		QUnitUtils.triggerKeydown(oTargetItem.getDomRef().querySelector(".sapTntNLI"), KeyCodes.SPACE);

		// Assert
		assert.strictEqual(fnEventSpy.callCount, 0, "select event should NOT be fired");

		// Act
		QUnitUtils.triggerKeyup(oTargetItem.getDomRef().querySelector(".sapTntNLI"), KeyCodes.SPACE);

		// Assert
		assert.strictEqual(fnEventSpy.callCount, 1, "should fire select event once");

		// Clean up
		oStub.restore();
	});

	QUnit.test("Default action of Space keydown is prevented", function (assert) {
		// Arrange
		const oStub = sinon.stub(NavigationListItem.prototype, "_openUrl", function () { });
		const oTargetItem = this.navigationList.getItems()[3];
		const oFakeEvent = new KeyboardEvent("keydown", {
			keyCode: KeyCodes.SPACE,
			bubbles: true,
			cancelable: true
		});

		// Act
		oTargetItem.getDomRef().querySelector(".sapTntNLI").dispatchEvent(oFakeEvent);

		// Assert
		assert.ok(oFakeEvent.defaultPrevented, "Default action of Space keydown is prevented");

		// Clean up
		oStub.restore();
	});

	QUnit.test("select group item", async function (assert) {

		var bPassedArg,
			fnEventSpy = sinon.spy(function (oEvent) {
				bPassedArg = oEvent.getParameter('item');
			}),
			oStub = sinon.stub(NavigationListItem.prototype, "_openUrl", function () { });

		this.navigationList.attachItemSelect(fnEventSpy);

		var $groupItem = jQuery('.sapTntNL .sapTntNLISecondLevel').first();

		assert.notOk($groupItem.hasClass('sapTntNLISelected'), "sapTntNLISelected class is not set");

		$groupItem.trigger('tap');

		await nextUIUpdate(this.clock);

		// wait 500ms
		this.clock.tick(500);

		assert.ok($groupItem.hasClass('sapTntNLISelected'), "sapTntNLISelected class is set");

		assert.strictEqual(fnEventSpy.callCount, 1, "should fire select event once");
		assert.strictEqual(bPassedArg.getText(), 'Child 1', "should pass the first group item as argument");

		assert.ok(oStub.calledOnce, 'url is open');

		oStub.restore();
	});

	QUnit.test("popup list", async function (assert) {
		assert.notOk(jQuery(".sapTntNLPopup").length, "popup list is not shown");
		assert.ok(!this.navigationList._oPopover, "should have no popover reference");

		var oStub = sinon.stub(NavigationListItem.prototype, "_openUrl", function () { });

		this.navigationList.setExpanded(false);
		await nextUIUpdate(this.clock);

		var $item = jQuery(".sapTntNL .sapTntNLIFirstLevel a").first();
		$item.trigger("tap");

		await nextUIUpdate(this.clock);

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

		await nextUIUpdate(this.clock);

		// wait 500ms
		this.clock.tick(500);

		assert.ok(popover.bIsDestroyed, "popover should be destroyed");
		assert.ok(!this.navigationList._oPopover, "should clean popover reference");

		assert.ok(oStub.calledTwice, "2 urls are open");

		QUnitUtils.triggerKeydown($item, KeyCodes.ARROW_RIGHT);
		await nextUIUpdate(this.clock);
		this.clock.tick(500);

		var $focusedElement = document.activeElement;
		assert.strictEqual(jQuery(".sapTntNLPopup").length, 1, "popup is shown");
		assert.strictEqual(jQuery(".sapTntNLPopup li ul li a").first()[0], document.activeElement, "Child 1 is focused");

		QUnitUtils.triggerKeydown($focusedElement, KeyCodes.ARROW_RIGHT);
		await nextUIUpdate(this.clock);
		this.clock.tick(500);

		assert.strictEqual(jQuery(".sapTntNLPopup li ul li a").first()[0], document.activeElement, "Child 1 is still focused");

		QUnitUtils.triggerKeydown($focusedElement, KeyCodes.ARROW_LEFT);
		await nextUIUpdate(this.clock);
		this.clock.tick(500);

		assert.strictEqual(jQuery(".sapTntNLPopup").length, 0, "popup is closed");

		var focusedElement2 = document.activeElement;
		QUnitUtils.triggerKeydown(focusedElement2, KeyCodes.ARROW_LEFT);
		await nextUIUpdate(this.clock);
		this.clock.tick(500);

		var focusedElement3 = document.activeElement;
		assert.strictEqual(focusedElement2, focusedElement3, "focus is not moved by pressing left arrow key");

		oStub.restore();
	});

	QUnit.test("open and close popover with Enter pressed twice quickly", async function (assert) {
		assert.notOk(jQuery(".sapTntNLPopup").length, "popup list is not shown");
		assert.ok(!this.navigationList._oPopover, "should have no popover reference");

		this.navigationList.setExpanded(false);

		await nextUIUpdate(this.clock);

		var $item = jQuery(".sapTntNL .sapTntNLIFirstLevel a").first();
		$item.trigger("tap");

		await nextUIUpdate(this.clock);

		this.clock.tick(500);

		assert.strictEqual(jQuery(".sapTntNLPopup").length, 1, "popup list is shown");
		assert.ok(this.navigationList._oPopover, "should save popover reference");

		// Simulate pressing Enter twice quickly
		QUnitUtils.triggerKeydown($item, KeyCodes.ENTER);
		QUnitUtils.triggerKeydown($item, KeyCodes.ENTER);

		await nextUIUpdate(this.clock);

		// Validate if the popover was opened after pressing the Enter key twice.
		assert.strictEqual(jQuery(".sapTntNLPopup").length, 1, "popup list is shown");
		assert.ok(this.navigationList._oPopover, "popover should be open");
	});

	QUnit.test("Press event on items in popover", async function (assert) {
		const unselectableParentItem = new NavigationListItem({
			text: 'Unselectable Parent',
			selectable: false,
			items: [
				new NavigationListItem({
					text: 'Child 1'
				}),
				new NavigationListItem({
					text: 'Child 2'
				})
			]
		});

		const navigationList = new NavigationList({
			expanded: false,
			items: [
				unselectableParentItem
			]
		});
		navigationList.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);

		// Act
		QUnitUtils.triggerEvent("tap", unselectableParentItem.getFocusDomRef());
		await nextUIUpdate(this.clock);

		const itemInPopover = navigationList._oPopover.getContent()[0].getItems()[0];
		const oAttachPressSpy = this.spy(itemInPopover, "firePress");

		// Act
		QUnitUtils.triggerEvent("tap", itemInPopover.getDomRef().querySelector(".sapTntNLI"));
		await nextUIUpdate(this.clock);

		// Assert
		assert.ok(oAttachPressSpy.called, "press event is fired on the popover item");

		navigationList._oPopover.close();
		await nextUIUpdate(this.clock);
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

	QUnit.test("External link icon", function (assert) {
		// Arrange
		var sExternalLinkWithTarget = Element.getElementById("groupItem1").getDomRef().querySelector("a").children[2].classList.contains("sapTntNLIExternalLinkIcon"),
			sExternalLinkWithoutTarget = Element.getElementById("groupItem3").getDomRef().querySelector("a").children[2].classList.contains("sapTntNLIExternalLinkIcon");

		// Assert
		assert.ok(sExternalLinkWithTarget, "External link icon is rendered when href is set and 'target=_blank'");
		assert.notOk(sExternalLinkWithoutTarget, "External link icon is rendered when href is set but target is not '_blank'.");
	});

	QUnit.module("Overflow behavior", {
		beforeEach: async function () {
			this.navigationList = getNavigationList(undefined, true);
			this.navigationList.placeAt("qunit-fixture");

			await nextUIUpdate();
			this.clock = sinon.useFakeTimers();
		},
		afterEach: async function () {
			this.navigationList.destroy();
			this.navigationList = null;
			await clearPendingUIUpdates(this.clock);
			this.clock.restore();
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
		const allItems = navListDomRef.querySelectorAll("li").length;
		const visibleItems = navListDomRef.querySelectorAll("li:not(.sapTntNLIHidden)").length;
		const hiddenItems = navListDomRef.querySelectorAll("li.sapTntNLIHidden:not(.sapTntNLOverflow)").length;

		overflowItemDomRef = navListDomRef.querySelector(".sapTntNLOverflow");

		assert.ok(overflowItemDomRef, "Overflow item is created");
		assert.notOk(overflowItemDomRef.classList.contains("sapTntNLIHidden"), "Overflow item is visible");
		assert.strictEqual(hiddenItems, allItems - visibleItems, "9 items are hidden");

		navListDomRef.style.height = "500px";
		this.navigationList._updateOverflowItems();

		overflowItemDomRef = navListDomRef.querySelector(".sapTntNLOverflow");

		assert.ok(overflowItemDomRef.classList.contains("sapTntNLIHidden"), "Overflow item is hidden");
		assert.notOk(navListDomRef.querySelectorAll("li.sapTntNLIHidden:not(.sapTntNLOverflow)").length, "there are no hidden items");
	});

	QUnit.test("Selecting items", function (assert) {
		const navListDomRef = this.navigationList.getDomRef(),
			items = this.navigationList.getItems();
		let iInitialHeight = 50;

		navListDomRef.style.height = `${iInitialHeight}px`;
		this.navigationList._updateOverflowItems();

		assert.ok(items[0].getDomRef().classList.contains("sapTntNLIHidden"), "item 0 is hidden");

		while (items[0].getDomRef().classList.contains("sapTntNLIHidden")) {
			iInitialHeight += 25;
			navListDomRef.style.height = `${iInitialHeight}px`;
			this.navigationList._updateOverflowItems();
		}

		assert.notOk(items[0].getDomRef().classList.contains("sapTntNLIHidden"), "item 0 is visible");
		assert.ok(items[2].getDomRef().classList.contains("sapTntNLIHidden"), "item 2 is hidden");

		this.navigationList._selectItem({ item: items[2]});

		assert.ok(items[0].getDomRef().classList.contains("sapTntNLIHidden"), "item 0 is hidden");
		assert.notOk(items[2].getDomRef().classList.contains("sapTntNLIHidden"), "item 2 is visible");
	});

	QUnit.test("Overflow menu", async function (assert) {
		var navListDomRef = this.navigationList.getDomRef(),
			items = this.navigationList.getItems(),
			overflowItemDomRef = navListDomRef.querySelector(".sapTntNLOverflow"),
			menu,
			menuDomRef;
		let iInitialHeight = 50;

		// Only first item and the overflow are visible
		navListDomRef.style.height = `${iInitialHeight}px`;
		this.navigationList._updateOverflowItems();
		while (items[0].getDomRef().classList.contains("sapTntNLIHidden")) {
			iInitialHeight += 25;
			navListDomRef.style.height = `${iInitialHeight}px`;
			this.navigationList._updateOverflowItems();
		}

		const oOverflowItem = this.navigationList._getOverflowItem();
		const oAttachOverflowItemPressSpy = this.spy(oOverflowItem, "firePress");

		QUnitUtils.triggerEvent("tap", overflowItemDomRef);

		assert.notOk(oAttachOverflowItemPressSpy.called, "Press event is not fired on the overflow item");

		await nextUIUpdate(this.clock);
		menuDomRef = document.querySelector(".sapMMenuList");

		var bIsExternalLinkRendered = menuDomRef.children[4].classList.contains("sapTntNavMenuItemExternalLink");

		// Assert
		assert.ok(bIsExternalLinkRendered, "External link icon is rendered in the overflow");
		assert.strictEqual(menuDomRef.children[1].title, "Root 2", "The default tooltip of the second item in the overflow menu is correct");
		assert.strictEqual(menuDomRef.children[2].title, "Root 3 - custom tooltip", "The custom tooltip of the third item in the overflow menu is correct");

		menu = Element.closestTo(menuDomRef);

		const aExpectedMenuItems = items.reduce((aResult, oItem) => {
			const oReturned = oItem.isA("sap.tnt.NavigationListGroup") ? [...oItem.getItems()] : oItem;
			return aResult.concat(oReturned);
		}, []);

		menu.getItems().forEach(function (item, index) {
			assert.strictEqual(item._navItem.getText(), aExpectedMenuItems[index + 1].getText(), "correct menu item is created");

			item.getItems().forEach(function(subItem, subItemIndex) {
				assert.strictEqual(subItem._navItem.getText(), item._navItem.getItems()[subItemIndex].getText(), "correct menu sub item is created");
			});
		});

		assert.ok(menuDomRef, "overflow menu is shown");

		QUnitUtils.triggerEvent("click", document.querySelector(".sapMMenuItem:nth-child(2)"));

		await nextUIUpdate(this.clock);
		this.clock.tick(500);

		navListDomRef.style.height = `${iInitialHeight}px`;
		this.navigationList._updateOverflowItems();

		assert.notOk(document.querySelector(".sapMMenu"), "overflow menu is destroyed");

		assert.ok(items[0].getDomRef().classList.contains("sapTntNLIHidden"), "item 0 is hidden");
		assert.notOk(items[2].getDomRef().classList.contains("sapTntNLIHidden"), "item 2 is visible");

		const oSelectedItem = items[4];
		this.navigationList._selectItem({ item: oSelectedItem});

		// Assert
		assert.ok(menu.isDestroyed(), "overflow menu is destroyed");

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

		overflowItemDomRef = navListDomRef.querySelector(".sapTntNLOverflow");

		QUnitUtils.triggerEvent("tap", overflowItemDomRef);

		menuDomRef = document.querySelector(".sapMMenuList");
		assert.ok(menuDomRef, "overflow menu is shown");

		const oMenuNavigationItem = menu.getItems()[2]._navItem;
		const oAttachItemPressSpy = this.spy(oMenuNavigationItem, "_firePress");
		const oAttachItemPressedSpy = this.spy(this.navigationList, "fireItemPress");

		QUnitUtils.triggerEvent("click", document.querySelector(".sapMMenuItem:nth-child(3)"), {
			ctrlKey: true,
			shiftKey: true,
			altKey: true,
			metaKey: false
		});
		await nextUIUpdate(this.clock);

		assert.ok(oAttachItemPressSpy.called, "press event is fired on the parent item in the overflow");
		const eventParams = oAttachItemPressSpy.args[0][0];
		assert.ok(eventParams.ctrlKey, "ctrlKey parameter is true");
		assert.ok(eventParams.shiftKey, "shiftKey parameter is true");
		assert.ok(eventParams.altKey, "altKey parameter is true");
		assert.notOk(eventParams.metaKey, "metaKey parameter is false");

		assert.strictEqual(oAttachItemPressedSpy.callCount, 1, "itemPress event is fired if the parent item in the overflow is clicked");

		this.navigationList.getDomRef().style.height = `${iInitialHeight}px`;
		this.navigationList._updateOverflowItems();
		await nextUIUpdate(this.clock);

		QUnitUtils.triggerEvent("tap", overflowItemDomRef);
		await nextUIUpdate(this.clock);

		const oMenuSubNavigationItem = menu.getItems()[3].getItems()[2]._navItem;
		const oAttachSubItemPressSpy = this.spy(oMenuSubNavigationItem, "_firePress");

		const initiallySelectedImId = this.navigationList.getSelectedItem().sId;
		menu = Element.closestTo(document.querySelector(".sapMMenu")).getParent().getParent();

		assert.ok(menu.getItems()[2].getDomRef().querySelector(".sapMMenuItemSubMenu"), "correct class is added to the expand icon in the menu item");
		assert.notOk(menu.getItems()[7].getDomRef().querySelector(".sapMMenuItemSubMenu"), "correct class is added to the expand icon in the menu item");

		menu.getItems()[2]._openSubmenu();

		assert.strictEqual(document.querySelector(".sapMSubmenu").getElementsByTagName("li")[2].title, "Child 3", "The correct default tooltip is set");
		assert.strictEqual(document.querySelector(".sapMSubmenu").getElementsByTagName("li")[1].title, "Child 2 - custom tooltip", "The correct default tooltip is set");
		QUnitUtils.triggerEvent("click",  document.querySelector(".sapMSubmenu").getElementsByTagName("li")[2]);
		assert.notEqual(this.navigationList.getSelectedItem().sId, initiallySelectedImId, "The sub item is selected");

		assert.ok(oAttachSubItemPressSpy.called, "press event is fired on the sub item in the overflow menu");
		assert.strictEqual(oAttachItemPressedSpy.callCount, 2, "itemPress event is fired if the sub item in the overflow is clicked");
	});

	QUnit.test("Click on external link item in the overflow", async function (assert) {
		this.stub(NavigationListMenuItem.prototype, "_openUrl", function () { });
		this.clock.restore();

		// Arrange
		var navListDomRef = this.navigationList.getDomRef(),
			overflowItemDomRef = navListDomRef.querySelector(".sapTntNLOverflow"),
			items = this.navigationList.getItems(),
			iInitialHeight = 50;
			navListDomRef.style.height = `${iInitialHeight}px`;

		this.navigationList._updateOverflowItems();
		while (items[0].getDomRef().classList.contains("sapTntNLIHidden")) {
			iInitialHeight += 25;
			navListDomRef.style.height = `${iInitialHeight}px`;
			this.navigationList._updateOverflowItems();
		}

		// Act
		QUnitUtils.triggerEvent("tap", overflowItemDomRef);
		await nextUIUpdate(this.clock);

		var menuDomRef = document.querySelector(".sapMMenuList"),
			item = menuDomRef.children[4],
			anchor = menuDomRef.children[4].querySelector("a");

		assert.ok(anchor, "Anchor tag is rendered");

		// Act
		const event = new jQuery.Event("click", { target: item });
		jQuery(item).trigger(event);

		// Assert
		assert.ok(event.isDefaultPrevented(), "Default action when clicking on anchor tag is prevented.");
	});

	QUnit.module("Navigation List Group", {
		beforeEach: async function () {
			this.navigationList = getNavigationList();
			this.navigationList.placeAt("qunit-fixture");

			await nextUIUpdate();
		},
		afterEach: function () {
			this.navigationList.destroy();
			this.navigationList = null;
		}
	});

	QUnit.test("On Collapsed NL, only the group children are visible", async function (assert) {
		// arrange
		this.navigationList.setExpanded(false);
		await nextUIUpdate();

		const oNavigationListGroup = this.navigationList.getItems()[5],
			aExpectedVisibleItems = oNavigationListGroup.getItems().map((oItem) => oItem.getDomRef()),
			oNavListDomRef = this.navigationList.getDomRef();

		assert.notOk(oNavigationListGroup.getDomRef(), "a dom ref for the group is not rendered");
		assert.strictEqual(aExpectedVisibleItems.every((oItem) => oNavListDomRef.contains(oItem)), true, "the children of the group are still rendered");
	});

	QUnit.test("On Expanded NL, the group title is also visible", async function (assert) {
		this.navigationList.setExpanded(true);
		await nextUIUpdate();

		const oNavigationListGroup = this.navigationList.getItems()[5],
			aExpectedVisibleItems = oNavigationListGroup.getItems().map((oItem) => oItem.getDomRef()),
			oNavListDomRef = this.navigationList.getDomRef();

		assert.ok(oNavigationListGroup.getDomRef().querySelector(".sapTntNLGroupText"), oNavigationListGroup.getText(), "the title of the group is rendered");
		assert.strictEqual(aExpectedVisibleItems.every((oItem) => oNavListDomRef.contains(oItem)), true, "the children of the group are still rendered");
	});

	QUnit.test("Groups can be collapsed and expanded to show/hide children", async function (assert) {
		// arrange
		const oNavigationListGroup = this.navigationList.getItems()[5],
			oDomRef = oNavigationListGroup.getDomRef();

		assert.strictEqual(oNavigationListGroup.getExpanded(), true, "expanded is set to true");
		assert.strictEqual(oDomRef.querySelector(".sapTntNLIItemsContainer").classList.contains("sapTntNLIItemsContainerHidden"), false, "the children are visible");

		QUnitUtils.triggerEvent("tap", oDomRef.querySelector(".sapTntNLI"));
		await Promise.all([nextUIUpdate(), nextJQuerySlideUp()]);

		assert.strictEqual(oNavigationListGroup.getExpanded(), false, "expanded is set to false");
		assert.strictEqual(oDomRef.querySelector(".sapTntNLIItemsContainer").classList.contains("sapTntNLIItemsContainerHidden"), true, "the children are not visible");
	});

	QUnit.test("Groups expanding/collapsing doesn't reveal items' subitems", async function (assert) {
		// arrange
		const oItem = new NavigationListItem({
			text: "Item 1",
			expanded: false,
			items: [
				new NavigationListItem({ text: "Subitem 1" }),
				new NavigationListItem({ text: "Subitem 2" })
			]
		});
		const oGroup = new NavigationListGroup({
			text: "Group 1",
			expanded: true,
			items: [oItem]
		});
		const oNavigationList = new NavigationList({
			items: [oGroup]
		});
		oNavigationList.placeAt("qunit-fixture");
		await nextUIUpdate();

		// assert
		assert.notOk(oGroup.getDomRef().querySelector(".sapTntNLIItemsContainer").classList.contains("sapTntNLIItemsContainerHidden"), "group children are visible");
		assert.ok(oItem.getDomRef().querySelector(".sapTntNLIItemsContainer").classList.contains("sapTntNLIItemsContainerHidden"), "item children are not visible");

		// act
		QUnitUtils.triggerEvent("tap", oGroup.getDomRef().querySelector(".sapTntNLI"));
		await Promise.all([nextUIUpdate(), nextJQuerySlideUp()]);

		// assert
		assert.ok(oGroup.getDomRef().querySelector(".sapTntNLIItemsContainer").classList.contains("sapTntNLIItemsContainerHidden"), "group children are not visible");

		// act
		QUnitUtils.triggerEvent("tap", oGroup.getDomRef().querySelector(".sapTntNLI"));
		await Promise.all([nextUIUpdate(), nextJQuerySlideDown()]);

		// assert
		assert.notOk(oGroup.getDomRef().querySelector(".sapTntNLIItemsContainer").classList.contains("sapTntNLIItemsContainerHidden"), "group children are visible");
		assert.ok(oItem.getDomRef().querySelector(".sapTntNLIItemsContainer").classList.contains("sapTntNLIItemsContainerHidden"), "item children are not visible");
	});

	QUnit.test("When a group is in the Overflow, its children are directly placed in the overflow", async function (assert) {
		this.navigationList.setExpanded(false);
		await nextUIUpdate();

		const oNavListDomRef = this.navigationList.getDomRef(),
			oNavigationListGroup = this.navigationList.getItems()[5],
			overflowItemDomRef = oNavListDomRef.querySelector(".sapTntNLOverflow");

		oNavListDomRef.style.height = "100px"; // Only first item and the overflow are visible
		this.navigationList._updateOverflowItems();

		QUnitUtils.triggerEvent("tap", overflowItemDomRef);

		const oMenuDomRef = document.querySelector(".sapMMenu"),
			oMenu = Element.closestTo(oMenuDomRef),
			aItemsInOverflow = oMenu.getParent().getParent().getItems().map((oMenuItem) => oMenuItem._navItem),
			aGroupItems = oNavigationListGroup.getItems();

		assert.strictEqual(aItemsInOverflow.includes(oNavigationListGroup), false, "group itself is not in the overflow");
		assert.strictEqual(aGroupItems.every((oItem) => aItemsInOverflow.includes(oItem)), true, "group items are in the overflow");
	});

	QUnit.module("Item Designs", {
		beforeEach: async function () {
			this.navigationList = getSecondNavigationList();
			this.navigationList.placeAt("qunit-fixture");

			await nextUIUpdate();
		},
		afterEach: function () {
			this.navigationList.destroy();
			this.navigationList = null;
		}
	});

	QUnit.test("selectable items", async function (assert) {

		const oNonSelectableItem = this.navigationList.getItems()[0].getDomRef().querySelector(".sapTntNLI");
		const oSelectableItem = this.navigationList.getItems()[1].getDomRef().querySelector(".sapTntNLI");
		const oActionItem = this.navigationList.getItems()[2].getDomRef().querySelector(".sapTntNLI");
		const oDefaultItem = this.navigationList.getItems()[3].getDomRef().querySelector(".sapTntNLI");

		QUnitUtils.triggerEvent("tap", oSelectableItem);

		await nextUIUpdate();

		assert.ok(oSelectableItem.classList.contains("sapTntNLISelected"), "sapTntNLISelected class is set when item has selectable = false");

		QUnitUtils.triggerEvent("tap", oNonSelectableItem);
		await nextUIUpdate();

		assert.notOk(oNonSelectableItem.classList.contains("sapTntNLISelected"), "sapTntNLISelected class is not set when item has selectable = false");

		assert.ok(oSelectableItem.classList.contains("sapTntNLITwoClickAreas"), "sapTntNLITwoClickAreas class is set when item has selectable = true");
		assert.notOk(oNonSelectableItem.classList.contains("sapTntNLITwoClickAreas"), "sapTntNLITwoClickAreas class is not set when item has selectable = false");
		assert.notOk(oActionItem.classList.contains("sapTntNLITwoClickAreas"), "sapTntNLITwoClickAreas class is not set when item is with design='Action'");
		assert.notOk(oDefaultItem.classList.contains("sapTntNLITwoClickAreas"), "sapTntNLITwoClickAreas class is not set when item has no children");
	});

	QUnit.test("Design Action", function (assert) {

		const oActionItem = this.navigationList.getItems()[2].getDomRef().querySelector(".sapTntNLI");
		const oDefaultItem = this.navigationList.getItems()[3].getDomRef().querySelector(".sapTntNLI");
		assert.ok(oActionItem.classList.contains("sapTntNLIAction"), "sapTntNLIAction class is set when item has design = Action");
		assert.notOk(oDefaultItem.classList.contains("sapTntNLIAction"), "sapTntNLIAction class is not set when item has design = Default");
	});

	QUnit.test("Press event", async function (assert) {
		await Promise.all(
			this.navigationList.getItems().map(async (item) => {
				const oAttachPressSpy = this.spy(item, "firePress");
				QUnitUtils.triggerEvent("tap", item.getDomRef().querySelector(".sapTntNLI"));
				await nextUIUpdate();
				assert.ok(oAttachPressSpy.called, "press event is fired");
			})
		);
	});

	QUnit.test("Press event on child items", async function (assert) {
		await Promise.all(
			this.navigationList.getItems().map(async (item) => {
				const oAttachPressSpy = this.spy(item, "firePress");
				if (item.getItems().length) {
					QUnitUtils.triggerEvent("tap", item.getItems()[0].getDomRef());
					await nextUIUpdate();
					assert.notOk(oAttachPressSpy.calledOnce, "press event is not fired on parent item if child item is pressed");
				}
			})
		);
	});

	QUnit.test("Press event parameters include key modifiers", function (assert) {
		// Arrange
		const oTestItem = this.navigationList.getItems()[1];
		const oAttachPressSpy = this.spy(oTestItem, "firePress");

		// Act
		QUnitUtils.triggerEvent("tap", oTestItem.getDomRef().querySelector(".sapTntNLI"), { ctrlKey: true, shiftKey: true, altKey: false, metaKey: false });

		// Assert
		assert.ok(oAttachPressSpy.calledOnce, "Press event is fired");
		const eventParams = oAttachPressSpy.args[0][0];
		assert.ok(eventParams.ctrlKey, "ctrlKey parameter is true");
		assert.ok(eventParams.shiftKey, "shiftKey parameter is true");
		assert.notOk(eventParams.altKey, "altKey parameter is false");
		assert.notOk(eventParams.metaKey, "metaKey parameter is false");
	});

	QUnit.test("Press event with key modifiers on child item in collapsed", async function (assert) {
		// Arrange
		this.navigationList.setExpanded(false);
		await nextUIUpdate();

		const oParentItem = this.navigationList.getItems()[0]; // Assuming the first item is the parent
		const oChildItem = oParentItem.getItems()[0]; // First child item
		const oAttachPressSpy = this.spy(oChildItem, "firePress");

		QUnitUtils.triggerEvent("tap", oParentItem.getDomRef().querySelector(".sapTntNLI"));
		await nextUIUpdate();

		assert.ok(this.navigationList._oPopover.isOpen(), "Popover is opened");

		// Act
		const oChildItemInPopover = this.navigationList._oPopover.getContent()[0].getItems()[0].getItems()[0];
		QUnitUtils.triggerEvent("tap", oChildItemInPopover.getDomRef(), { ctrlKey: true, shiftKey: true, altKey: true, metaKey: false });
		await nextUIUpdate();

		// Assert
		assert.ok(oAttachPressSpy.calledOnce, "Press event is fired for the child item");
		const eventParams = oAttachPressSpy.args[0][0];
		assert.ok(eventParams.ctrlKey, "ctrlKey parameter is true");
		assert.ok(eventParams.shiftKey, "shiftKey parameter is true");
		assert.ok(eventParams.altKey, "altKey parameter is true");
		assert.notOk(eventParams.metaKey, "metaKey parameter is false");

		this.navigationList._oPopover.close();
		await nextUIUpdate();
	});

	QUnit.module("Unselectable parent items in collapsed Side Navigation", {
		beforeEach: async function () {
			this.unselectableParentItem = new NavigationListItem({
				text: 'Unselectable Parent',
				selectable: false,
				items: [
					new NavigationListItem({
						text: 'Child 1'
					}),
					new NavigationListItem({
						text: 'Child 2'
					})
				]
			});

			this.navigationList = new NavigationList({
				expanded: false,
				items: [
					this.unselectableParentItem
				]
			});
			this.navigationList.placeAt("content");

			await nextUIUpdate();
		},
		afterEach: function () {
			this.navigationList.destroy();
		}
	});

	QUnit.test("Unselectable parent interaction", async function (assert) {
		// Act
		QUnitUtils.triggerEvent("tap", this.unselectableParentItem.getFocusDomRef());

		// Assert
		assert.notOk(this.unselectableParentItem.getDomRef().classList.contains("sapTntNLISelected"), "Unselectable parent item should not be selected");
		assert.ok(this.navigationList._oPopover.isOpen(), "Popover is opened");

		const itemInPopover = this.navigationList._oPopover.getContent()[0].getItems()[0];
		const focusableDomRefs = itemInPopover._getFocusDomRefs();

		// Assert
		assert.strictEqual(focusableDomRefs.length, 2, "There are 2 focusable elements in the popover");
		assert.ok(focusableDomRefs[0].textContent.includes("Child 1"), "First focusable element is the first child item");
		assert.ok(focusableDomRefs[1].textContent.includes("Child 2"), "Second focusable element is the second child item");

		// Act
		QUnitUtils.triggerEvent("tap", itemInPopover.getFocusDomRef());

		// Assert
		assert.ok(this.navigationList._oPopover.isOpen(), "Popover is still opened");

		this.navigationList._oPopover.close();
		await nextUIUpdate();
	});

	QUnit.test("Unselectable parent interaction in overflow", async function (assert) {
		// Arrange
		this.navigationList.getDomRef().style.height = "10px";
		this.navigationList._updateOverflowItems();

		QUnitUtils.triggerEvent("tap", this.navigationList._getOverflowItem().getDomRef());

		const overflowMenu = this.navigationList.getDependents()[0];
		const itemInOverflowMenu = document.querySelector(".sapMMenu").querySelector(".sapMMenuItem");

		// Assert
		assert.ok(overflowMenu.isOpen(), "Overflow menu should be open");

		// Act
		QUnitUtils.triggerEvent("click", itemInOverflowMenu);

		// Assert
		assert.ok(overflowMenu.isOpen(), "Overflow menu should still be open");

		overflowMenu.close();
		await nextUIUpdate();
	});

	QUnit.module("Collapsed parent items in expanded Side Navigation", {
		beforeEach: async function () {
			this.navigationList = getSecondNavigationList();
			this.navigationList.placeAt("qunit-fixture");

			await nextUIUpdate();
		},
		afterEach: function () {
			this.navigationList.destroy();
		}
	});

	QUnit.test("selected child items", async function (assert) {

		const oSelectedItem = this.navigationList.getItems()[1].getItems()[0].getDomRef();
		const expandIcon = this.navigationList.getItems()[1].getDomRef().querySelector(".sapTntNLIExpandIcon");

		QUnitUtils.triggerEvent("tap", oSelectedItem);
		await nextUIUpdate();

		assert.notOk(this.navigationList.getItems()[1].getDomRef().querySelector(".sapTntNLIFirstLevel").classList.contains("sapTntNLISelected"), "sapTntNLISelected class is not set on parent item");
		assert.ok(oSelectedItem.classList.contains("sapTntNLISelected"), "sapTntNLISelected class is set on selected child item ");

		QUnitUtils.triggerEvent("tap", expandIcon);
		await nextUIUpdate();

		assert.ok(this.navigationList.getItems()[1].getDomRef().querySelector(".sapTntNLIFirstLevel").classList.contains("sapTntNLISelected"), "sapTntNLISelected class is set on parent item");
	});

	QUnit.module("Tooltips for truncated text", {
		beforeEach: async function () {
			this.oItem = new NavigationListItem({
				id: "parentItem",
				selectable: false,
				text: 'Parent lorem ipsum dolor sit amet',
				items: [
					new NavigationListItem({
						id: "nativeTooltip",
						text: 'Child 1 lorem ipsum dolor sit amet',
						tooltip: "Test"
					}),
					new NavigationListItem({
						text: 'Child 2'
					})
				]
			});

			this.navigationList = new NavigationList({
				width: "100px",
				items: [
					this.oItem
				]
			});
			this.navigationList.placeAt("content");

			await nextUIUpdate();
		},
		afterEach: function () {
			this.navigationList.destroy();
		}
	});

	QUnit.test("Tooltip should be available for long text on mouseover", function (assert) {
		const oTarget = this.oItem.getDomRef().querySelector("#parentItem-a .sapMText"),
			oTooltipElement = this.oItem._getTooltipElement();

		QUnitUtils.triggerEvent("mouseover", oTarget);
		assert.strictEqual(oTooltipElement.getAttribute("title"), "Parent lorem ipsum dolor sit amet", "The tooltip is present");

		QUnitUtils.triggerEvent("mouseout", oTarget);
		assert.notOk(oTooltipElement.getAttribute("title"), "The tooltip removed");
	});

	QUnit.test("Extended tooltip should be available for long text on mouseover", async function (assert) {
		this.oItem.setTooltip("Test");

		await nextUIUpdate();

		const oTarget = this.oItem.getDomRef().querySelector("#nativeTooltip-a .sapMText"),
			oTooltipElement = this.oItem._getTooltipElement();

		assert.strictEqual(oTooltipElement.getAttribute("title"), "Test", "The tooltip should be set initially");

		QUnitUtils.triggerEvent("mouseover", oTarget);
		assert.ok(oTooltipElement.getAttribute("title"), "Child 1 lorem ipsum dolor sit amet - Test", "The extended tooltip should be present");

		QUnitUtils.triggerEvent("mouseout", oTarget);
		assert.ok(oTooltipElement.getAttribute("title"), "Test", "The user provided tooltip is available");
	});

	return waitForThemeApplied();
});
