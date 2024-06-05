/*global QUnit, sinon */
sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/Device",
	"sap/ui/core/Element",
	"sap/ui/thirdparty/jquery",
	"sap/m/Menu",
	"sap/m/MenuItem",
	"sap/m/MenuItemGroup",
	"sap/ui/model/json/JSONModel",
	"sap/m/Button",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/Label",
	"sap/ui/core/Item",
	"sap/m/MenuListItem",
	"sap/ui/core/CustomData",
	"sap/ui/core/Control",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(
	merge,
	Device,
	Element,
	jQuery,
	Menu,
	MenuItem,
	MenuItemGroup,
	JSONModel,
	Button,
	Filter,
	FilterOperator,
	Label,
	Item,
	MenuListItem,
	CustomData,
	Control,
	nextUIUpdate
) {
	"use strict";

	function prepareMobilePlatform() {
		var oSystem = {
			desktop : false,
			phone : true,
			tablet : false
		};

		this.stub(Device, "system").value(oSystem);

		jQuery('#qunit-fixture').addClass('sap-phone');
		jQuery('body').addClass('sap-phone');
	}

	function initMenu() {
		this.sut = new Menu({
			title: "Initial page"
		});

		this.sut.addItem(new MenuItem({
			text: "fridge",
			icon: "sap-icon://fridge",
			tooltip: "it's cold in here",
			items: [
				new MenuItem({
					text: "accidental leave",
					icon: "sap-icon://accidental-leave",
					items: [
						new MenuItem({
							icon: "sap-icon://factory",
							text: "factory"
						})
					]
				}),
				new MenuItem({
					text: "accidental leave",
					icon: "sap-icon://accidental-leave"
				})
			]
		}));

		this.sut.addItem(new MenuItem({
			text: "iphone",
			icon: "sap-icon://iphone"
		}));
	}

	async function destroyMenu() {
		this.sut.destroy();
		this.sut = null;
		await nextUIUpdate(this.clock);
	}

	function pressListItemAtIndex(iIndex) {
		var oList = this.sut._getNavContainer().getCurrentPage().getContent()[0],
			oItem = oList.getItems()[iIndex];
		oList.fireItemPress({ listItem: oItem });
	}

	function getFirstModelData() {
		return {
			items: [
				{
					text: "item1",
					icon: "sap-icon://accidental-leave"
				},
				{
					text : "item2",
					icon: "sap-icon://accidental-leave",
					items: [
						{
							text : "sub-item1",
							icon: "sap-icon://accidental-leave",
							items: [
								{
									text : "sub-sub-item1",
									icon: "sap-icon://accidental-leave"
								}
							]
						}
					]
				}
			]
		};
	}

	function getSecondModelData() {
		return {
			items: [
				{
					text: "second-item1",
					icon: "sap-icon://accidental-leave"
				},
				{
					text : "second-item2",
					icon: "sap-icon://accidental-leave",
					items: [
						{
							text : "second-sub-item1",
							icon: "sap-icon://accidental-leave",
							items: [
								{
									text : "second-sub-sub-item1",
									icon: "sap-icon://accidental-leave"
								},
								{
									text : "second-sub-sub-item2",
									icon: "sap-icon://accidental-leave"
								}
							]
						}
					]
				}
			]
		};
	}

	function getThirdModelData() {
		return {
			items: [
				{name : 'abc', type: 'hello'},
				{name : 'abc1', type: 'hello'},
				{name : 'abc2', type: 'hello'},
				{name : 'xyz', type: 'world'},
				{name : 'xyz1', type: 'world'}
			]
		};
	}

	function bindAggregations(oControl) {
		var template = new MenuItem({
			text: "{text}",
			icon: "{icon}",
			items: {
				path: 'items',
				template: new MenuItem({
					text: "{text}",
					icon: "{icon}",
					items: {
						path: 'items',
						template: new MenuItem({
							text: "{text}",
							icon: "{icon}"
						}),
						templateShareable: true
					}
				}),
				templateShareable: true
			}
		});

		var oModel = new JSONModel();
		oModel.setData(this.getFirstModelData());

		oControl.setModel(oModel);
		oControl.bindAggregation("items", "/items", template);
	}

	QUnit.module('[PHONE] Basics', {
		beforeEach: function () {
			prepareMobilePlatform.call(this);
			initMenu.call(this);
		},
		afterEach : async function () {
			await destroyMenu.call(this);

			jQuery('#qunit-fixture').removeClass('sap-phone');
			jQuery('body').removeClass('sap-phone');
		}
	});

	QUnit.test('Opening/closing/reopening', function (assert) {
		var fnFireCloseSpy = sinon.spy(this.sut, "fireClosed");

		//Assert
		assert.strictEqual(this.sut._getVisualParent(), null, 'The menu is not initially rendered');

		this.sut.openBy();
		this.clock.tick(1000);

		//Assert
		assert.strictEqual(jQuery('#' + this.sut._getVisualParent().getId()).length, 1, 'The menu is rendered on "openBy"');

		this.sut.close();
		this.clock.tick(1000);

		//Assert if the close event is fired
		assert.strictEqual(fnFireCloseSpy.calledOnce, true, "Close event is fired menu is closed");

		//Assert
		assert.strictEqual(jQuery('#' + this.sut._getVisualParent().getId()).length, 0, 'The menu is not rendered after "close"');

		this.sut.openBy();
		this.clock.tick(1000);

		//Assert
		assert.strictEqual(jQuery('#' + this.sut._getVisualParent().getId()).length, 1, 'The menu is rendered on "openBy"');
	});

	QUnit.test('isOpen()', function (assert) {
		// Assert that menu is closed
		assert.strictEqual(this.sut._getVisualParent(), null, 'The menu is not initially rendered');
		assert.strictEqual(this.sut.isOpen(), false, 'Menu is closed');

		// Act - Open menu
		this.sut.openBy();
		this.clock.tick(1000);

		// Assert menu is open
		assert.strictEqual(jQuery('#' + this.sut._getVisualParent().getId()).length, 1, 'The menu is rendered on "openBy"');
		assert.strictEqual(this.sut.isOpen(), true, 'Menu is open');
	});

	QUnit.test("visible", function(assert) {
		//Act
		this.sut.getItems()[0].setVisible(false);
		this.sut.openBy();
		var oItemFridge = Element.getElementById(this.sut.getItems()[0]._getVisualControl());

		//Assert
		assert.equal(oItemFridge.getVisible(), false, "menu item is not visible");
	});

	QUnit.test('ARIA attributes', function (assert) {
		var fnSetBackButtonTooltipForPageWithParentSpy = sinon.spy(this.sut, "_setBackButtonTooltipForPageWithParent");
		this.sut.openBy();
		pressListItemAtIndex.call(this, 0);
		this.clock.tick(1000);
		assert.strictEqual(fnSetBackButtonTooltipForPageWithParentSpy.called, true, "Back button tooltip must be set.");
		fnSetBackButtonTooltipForPageWithParentSpy.restore();
	});

	QUnit.module('Basics', {
		beforeEach: function () {
			initMenu.call(this);
		},
		afterEach : async function () {
			await destroyMenu.call(this);
		}
	});

	QUnit.test("tooltip", function(assert) {
		this.sut.openBy();
		var oItemFridge = this.sut._getMenu().getItems()[0];

		//Assert
		assert.equal(oItemFridge.getTooltip(), "it's cold in here", "item has a tooltip");
	});

	QUnit.test("tooltip changed after setTooltip used", function(assert) {
		this.sut.getItems()[1].setTooltip("new tooltip");

		//Assert
		assert.equal(this.sut.getItems()[1].getTooltip(), "new tooltip", "the item's tooltip has changed");
	});

	QUnit.test("tooltip changed after destroyTooltip used", function(assert) {
		this.sut.getItems()[1].setTooltip("new tooltip");
		this.sut.getItems()[1].destroyTooltip();

		//Assert
		assert.equal(this.sut.getItems()[1].getTooltip(), null, "the item's tooltip has changed");
	});

	QUnit.test("visible", function(assert) {
		//Act
		this.sut.getItems()[0].setVisible(false);
		this.sut.openBy();
		var oItemFridge = this.sut._getMenu().getItems()[0];

		//Assert
		assert.equal(oItemFridge.getVisible(), false, "menu item is not visible");
	});

	QUnit.test("enabled", function(assert) {
		//Act
		this.sut.getItems()[0].setEnabled(false);
		this.sut.openBy();
		var oItemFridge = this.sut._getMenu().getItems()[0];

		//Assert
		assert.equal(oItemFridge.getEnabled(), false, "menu item is not enabled");
	});

	QUnit.test("close without open", function(assert) {
		// arrange
		var oMenu = new Menu();

		// act
		oMenu.close();

		// assert
		assert.ok(true, "no exception on close");

		// clean
		oMenu.destroy();
	});

	QUnit.test('Item selection event', function (assert) {
		var fnFireItemSelectedSpy = sinon.spy(this.sut, "fireItemSelected");

		this.sut.openBy();
		this.clock.tick(1000);
		this.sut._getVisualParent().getItems()[0].$().trigger("click");
		this.clock.tick(1000);

		//Assert
		assert.strictEqual(this.sut.getItems()[0].getItems().length, 2, 'The item has sub items');
		assert.strictEqual(fnFireItemSelectedSpy.calledOnce, false, "Item selected event is not fired when item is clicked");

		this.sut._getVisualParent().getItems()[1].$().trigger("click");
		this.clock.tick(1000);

		//Assert
		assert.strictEqual(this.sut.getItems()[1].getItems().length, 0, 'The item does not have sub items');
		assert.strictEqual(fnFireItemSelectedSpy.calledOnce, true, "Item selected event is fired when item is clicked.");

		fnFireItemSelectedSpy.restore();
	});

	QUnit.test('MenuItem press event', function (assert) {
		//prepare
		var oMenu = this.sut; //storing the Menu object in a variable in order to interact with it inside the press event

		//act
		this.sut.addItem(new MenuItem({
			text: "iphone",
			icon: "sap-icon://iphone",
			press: function(){
				oMenu.addItem(new MenuItem({
					text: " another iphone"
				}));
			}
		}));
		this.sut.openBy();
		this.clock.tick(1000);
		this.sut._getVisualParent().getItems()[2].$().trigger("click");
		this.clock.tick(1000);

		//assert
		assert.strictEqual(this.sut.getItems().length, 4, "MenuItem's press event is now handled");
	});

	QUnit.test("Event handlers", function(assert) {
		// Prepare
		var oMenu = this.sut;

		// Assert
		assert.ok(oMenu.hasListeners("propertyChanged"), "The 'propertyChanged' event listener is properly attached");
		assert.ok(oMenu.hasListeners("aggregationChanged"), "The 'aggregationChanged' event listener is properly attached");
	});

	QUnit.test("sap.m.MenuItem change events do not bubble out of the root sap.m.Menu", function(assert) {
		// Prepare
		var Container = Control.extend("my.Container", {
			metadata: {
				aggregations: {
					content: "sap.ui.core.Control"
				},
				events: {
					"propertyChanged": {}
				}
			},
			renderer: {
				apiVersion: 2,
				render: function(rm, container) {
					rm.openStart("div", container).openEnd();
					rm.openStart("div").openEnd().text("Container").close("div");
					container.getContent().forEach(function(oChild) { rm.renderControl(oChild); });
					rm.close("div");
				}
			}
		});

		var oContainer = new Container();
		oContainer.fnPropertyChanged = function() {};
		var oContainerPropertyChangedSpy = this.spy(oContainer, "fnPropertyChanged");
		oContainer.addContent(this.sut);
		oContainer.attachEvent("propertyChanged", oContainer.fnPropertyChanged);
		oContainer.placeAt("qunit-fixture");

		// Act
		this.sut.getItems()[0].getItems()[0].setText("New text");

		// Assert
		assert.ok(oContainerPropertyChangedSpy.notCalled, "sap.m.MenuItem events do bubble properly");

		// Clean
		oContainer.destroy();
	});

	QUnit.test("Clone operation", function(assert) {
		// Prepare
		var oMenu = this.sut,
			oClone;

		// Act
		oMenu.openBy();
		oClone = oMenu.clone();
		oClone.getItems()[0].getItems()[0].setText("New text");

		// Assert
		assert.ok(true, "Error isn't thrown.");
	});

	QUnit.test("Adding event delegates", function(assert) {
		// Prepare
		var oMenuItem = new MenuItem({text: "text"}),
			oBeforeDelegate = {
				onBeforeRendering: function() {}
			},
			oDelegateContext = {test: "test"};

		oMenuItem.addEventDelegate(oBeforeDelegate, oDelegateContext);

		// Act
		var oUnifiedItem = this.sut._createVisualMenuItemFromItem(oMenuItem);

		// Assert
		assert.deepEqual(oMenuItem.aDelegates[0].vThis, oDelegateContext, "The delegate context is supplied");
		assert.strictEqual(oMenuItem.aDelegates.length, oUnifiedItem.aDelegates.length, "Equal number of delegates with the unified item");
		assert.deepEqual(oMenuItem.aDelegates[0], oUnifiedItem.aDelegates[0], "The delegate is added to the unified item");
		assert.deepEqual(oUnifiedItem.aDelegates[0].vThis, oDelegateContext, "The delegate context is supplied to the unified menu item");

		// Act
		var oListItem = this.sut._createMenuListItemFromItem(oMenuItem);

		// Assert
		assert.strictEqual(oMenuItem.aDelegates.length, oListItem.aDelegates.length, "Equal number of delegates with the list item");
		assert.deepEqual(oMenuItem.aDelegates[0], oListItem.aDelegates[0], "The delegate is added to the list item");
		assert.deepEqual(oListItem.aDelegates[0].vThis, oDelegateContext, "The delegate context is supplied to the list item");

		// Act
		oMenuItem.removeEventDelegate(oBeforeDelegate);

		// Assert
		assert.notOk(oMenuItem.aDelegates.length, "There are no delegates left");
	});

	QUnit.module("[PHONE] Custom mutators", {
		beforeEach: function() {
			prepareMobilePlatform.call(this);
			initMenu.call(this);
		},
		afterEach: async function() {
			await destroyMenu.call(this);

			jQuery('#qunit-fixture').removeClass('sap-phone');
			jQuery('body').removeClass('sap-phone');
		},
		openMenu: function() {
			this.sut.openBy();
		},
		newMenuItem: function() {
			return new MenuItem({
				icon: "sap-icon://loan",
				text: "loan"
			});
		},
		getPages: function() {
			var oNavContainer = this.sut._getNavContainer(),
				aPages = [];

			if (oNavContainer) {
				aPages = oNavContainer.getPages();
			}

			return aPages;
		},
		getCurrentPage: function() {
			return this.sut._getNavContainer().getCurrentPage();
		},
		getLastPage: function() {
			var aPages = this.getPages();
			return aPages[aPages.length - 1];
		},
		getListItemAtIndex: function(iIndex) {
			return this.getCurrentPage().getContent()[0].getItems()[iIndex];
		},
		pressListItemAtIndex: function(iIndex) {
			var oList = this.getCurrentPage().getContent()[0],
				oItem = oList.getItems()[iIndex];
			oList.fireItemPress({ listItem: oItem });
		}
	});

	QUnit.test("Menu's addItem adds list item to the correct list", function(assert) {
		var oItem,
			sutListItem;

		this.openMenu();
		oItem = this.newMenuItem();
		this.sut.addAggregation("items", oItem);

		//Assert
		assert.equal(this.getPages().length, 3, "The menu still has 3 pages.");

		sutListItem = this.getListItemAtIndex(2);

		//Assert
		assert.ok(!!sutListItem, "There is a new ui item at the right place");
		assert.equal(sutListItem.getTitle(), oItem.getText(), "UI item has the right text");
	});

	QUnit.test("MenuItem's addItem adds list item to the correct list", function(assert) {
		var oItem,
			sutListItem;
		this.openMenu();
		oItem = this.newMenuItem();
		this.sut.getItems()[0].addAggregation("items", oItem);

		//Assert
		assert.equal(this.getPages().length, 3, "The menu still has 3 pages.");

		this.pressListItemAtIndex(0); //page title: item 1
		sutListItem = this.getListItemAtIndex(2);

		//Assert
		assert.ok(!!sutListItem, "There is a new ui item at the right place");
		assert.equal(sutListItem.getTitle(), oItem.getText(), "UI item has the right text");
	});

	QUnit.test("MenuItem with no items: addItem to it adds a new page", function(assert) {
		var oItem,
			oAddedPage,
			sutListItem;

		assert.equal(this.getPages().length, 0, "The menu has no pages");

		this.openMenu();
		oItem = this.newMenuItem();
		this.sut.getItems()[1].addAggregation("items", oItem);

		//Assert
		assert.equal(this.getPages().length, 4, "The menu has a new page");

		oAddedPage = this.getLastPage();

		//Assert
		assert.equal(oAddedPage.getTitle(), this.sut.getItems()[1].getText(), "Title of the new page is alright");

		this.pressListItemAtIndex(1); //page title: item 2

		//Assert
		assert.equal(this.getCurrentPage().getId(), oAddedPage.getId(), "The press event on the parent item leads to the new page");

		sutListItem = this.getListItemAtIndex(0);

		//Assert
		assert.ok(!!sutListItem, "There is a new ui item at the right place");
		assert.equal(sutListItem.getTitle(), oItem.getText(), "UI item has the right text");
	});

	QUnit.test("Menu with no items: addItem to it adds an item to the empty page", function(assert) {
		//we need an empty menu
		var sut = new Menu({
				title: "Initial page"
			}),
			oItem,
			oSutListItem,
			oNavContainer,
			aPages;

		sut.openBy();
		oItem = this.newMenuItem();
		sut.addAggregation("items", oItem);

		oNavContainer = sut._getNavContainer();
		aPages = oNavContainer.getPages();
		oSutListItem = sut._getNavContainer().getCurrentPage().getContent()[0].getItems()[0];

		//Assert
		assert.equal(aPages.length, 1, "The menu has 1 page");
		assert.ok(!!oSutListItem, "There is a new ui item at the right place");
		assert.equal(oSutListItem.getTitle(), oItem.getText(), "UI item has the right text");

		sut.destroy();
		sut = null;
	});

	// BCP: 0020751294 0000616398 2017
	QUnit.test("Menu with item: removeItem for last item and add new item should recreate the first page", function (assert) {
		// prepare
		var oItem = this.newMenuItem(),
			sut = new Menu({ title: "Initial page", items: [oItem] });

		// act
		sut.openBy();
		sut.removeItem(oItem);
		sut.addAggregation("items", this.newMenuItem());
		sut.openBy();

		// assert
		assert.equal(sut._getNavContainer().getPages().length, 1, "The menu has 1 page");

		// cleanup
		sut.destroy();
	});

	// BCP: 0020751294 0000616398 2017
	QUnit.test("Menu with items: removeAllItems and add them again should recreate the first page", function (assert) {
		// prepare
		var sut = new Menu({ title: "Initial page", items: [this.newMenuItem()] });

		// act
		sut.openBy();
		sut.removeAllItems();
		sut.addAggregation("items", this.newMenuItem());
		sut.openBy();

		// assert
		assert.equal(sut._getNavContainer().getPages().length, 1, "The menu has 1 page");

		// cleanup
		sut.destroy();
	});

	// BCP: 0020751294 0000616398 2017
	QUnit.test("Menu with items and child items: removeAllItems and add them again should recreate the needed pages", function (assert) {
		// prepare
		function createItems() {
			return new MenuItem({
				text: "Parent item",
				items: [new MenuItem({ text: "Child Item" })]
			});
		}
		var sut = new Menu({ title: "Initial page", items: createItems() });

		// act
		sut.openBy();
		sut.removeAllItems();
		sut.addAggregation("items", createItems());
		sut.openBy();

		// assert
		assert.equal(sut._getNavContainer().getPages().length, 2, "The menu has 2 pages");

		// cleanup
		sut.destroy();
	});

	QUnit.module("Data binding", {
		beforeEach : async function () {
			this.sut = new Menu();
			this.oButton = new Button();
			this.oButton.placeAt('qunit-fixture');
			await nextUIUpdate(this.clock);

		},
		afterEach : async function () {
			this.oButton.destroy();
			this.oButton = null;
			await destroyMenu.call(this);
		},
		getFirstModelData: getFirstModelData,
		getSecondModelData: getSecondModelData,
		getThirdModelData: getThirdModelData,
		bindAggregations: function() {
			bindAggregations.call(this, this.sut);
		}
	});

	QUnit.test("Binding items", function (assert) {
		var aItems,
			oItem,
			sTitleSelector,
			oSecondData,
			sSecondItemId,
			oFirstLevelItem,
			oSecondLevelItem,
			sFirstSubItemId,
			sFirstSubSubItemId;

		this.bindAggregations();
		this.sut.openBy(this.oButton);

		aItems = this.sut._getVisualParent().getItems();
		oItem = aItems[0];
		sTitleSelector = "#" + this.sut._getVisualParent().getId() + " .sapUiMnuItmTxt";

		//Assert
		assert.strictEqual(oItem.getText(), this.getFirstModelData()['items'][0]['text'], 'Correct item is being asserted.');
		assert.strictEqual(jQuery("#" + oItem.getId()).length, 1, 'First item is rendered before model property change.');

		oSecondData = this.getSecondModelData()['items'];

		this.sut.getModel().setProperty('/items', oSecondData);

		aItems = this.sut._getVisualParent().getItems();
		oItem = aItems[0];
		sSecondItemId = oItem.getId();

		//Assert
		assert.strictEqual(oItem.getText(), oSecondData[0]['text'], 'Correct item is being asserted.');
		assert.strictEqual(jQuery("#" + sSecondItemId).length, 1, 'Second item is rendered after model property change.');
		assert.strictEqual(jQuery(sTitleSelector).length, 2, 'Starting with two items.');

		oFirstLevelItem = this.sut._getVisualParent().getItems()[1];
		oSecondLevelItem = oFirstLevelItem.getAggregation('submenu').getItems()[0];

		this.sut._getMenu().setHoveredItem(oFirstLevelItem);
		this.sut._getMenu().openSubmenu(oFirstLevelItem);

		oFirstLevelItem.getAggregation('submenu').setHoveredItem(oSecondLevelItem);
		oFirstLevelItem.getAggregation('submenu').openSubmenu(oSecondLevelItem);

		aItems = this.sut._getVisualParent().getItems()[1].getSubmenu().getItems();
		oItem = aItems[0];
		sFirstSubItemId = oItem.getId();

		//Assert
		assert.strictEqual(oItem.getText(), oSecondData[1]['items'][0]['text'], 'Correct item is being asserted.');
		assert.strictEqual(jQuery("#" + sFirstSubItemId).length, 1, 'First sub item is changed in DOM after model property change.');

		aItems = this.sut._getVisualParent().getItems()[1].getSubmenu().getItems()[0].getSubmenu().getItems();
		oItem = aItems[0];
		sFirstSubSubItemId = oItem.getId();

		//Assert
		assert.strictEqual(oItem.getText(), oSecondData[1]['items'][0]['items'][0]['text'], 'Correct item is being asserted.');
		assert.strictEqual(jQuery("#" + sFirstSubSubItemId).length, 1, 'First sub sub item is changed in DOM after model property change.');
	});

	QUnit.test("filtering", async function(assert) {
		var aItems,
			oItemId,
			oThirdData;

		this.bindAggregations();
		this.sut.openBy(this.oButton);

		oThirdData = this.getThirdModelData()['items'];

		this.sut.getModel().setProperty('/items', oThirdData);

		// get visual items
		aItems = this.sut._getVisualParent().getItems();
		// get the item that won't fit in the filtered items and should be destroyed
		oItemId = aItems[2].getId();

		// filter the model
		this.sut.getBinding('items').filter(new Filter("type", FilterOperator.EQ, 'world'));
		await nextUIUpdate(this.clock);

		assert.ok(!Element.getElementById(oItemId), 'The item that does not fit in the filter is destroyed');
	});

	QUnit.module('MenuItem(inside Menu)', {
		beforeEach: async function () {
			this.sut = new MenuItem({
				text: "mi",
				icon: 'sap-icon://accidental-leave',
				items: [
					new MenuItem({
						text: "sub_mi_1",
						icon: 'sap-icon://accidental-leave'
					}),
					new MenuItem({
						text: "sub_mi_2",
						icon: 'sap-icon://accidental-leave'
					})
				]
			});
			// Make sure sap.m.Menu code related to sap.m.MenuItem is considered
			this.sutRootMenu = new Menu({items: this.sut});
			this.oLabel = new Label(); //.openBy needs a reference
			this.sutRootMenu.openBy(this.oLabel);
			await nextUIUpdate(this.clock);
		},
		afterEach : async function () {
			this.sutRootMenu.close();
			this.sut.destroy();
			this.sutRootMenu.destroy();
			this.oLabel.destroy();
			await nextUIUpdate(this.clock);

			this.sut = null;
			this.sutRootMenu = null;
			this.oLabel = null;

		}
	});

	QUnit.test("exit", function(assert) {
		this.sut._setVisualChild("a");
		this.sut._setVisualControl("b");
		this.sut._setVisualParent("c");

		//Act
		this.sut.exit();

		//Assert
		assert.strictEqual(this.sut._getVisualChild(), null, "no visual child");
		assert.strictEqual(this.sut._getVisualControl(), null, "no visual control");
		assert.strictEqual(this.sut._getVisualParent(), null, "no visual parent");
	});

	QUnit.test("_setVisualChild _getVisualChild", function(assert) {
		//Act
		this.sut._setVisualChild("a");

		//Assert
		assert.strictEqual(this.sut._getVisualChild(), "a", "right visual child");
	});

	QUnit.test("_setVisualControl _getVisualControl", function(assert) {
		//Act
		this.sut._setVisualControl("b");

		//Assert
		assert.strictEqual(this.sut._getVisualControl(), "b", "right visual control");
	});

	QUnit.test("_setVisualParent _getVisualParent", function(assert) {
		//Act
		this.sut._setVisualParent("c");

		//Assert
		assert.strictEqual(this.sut._getVisualParent(), "c", "right visual parent");
	});

	QUnit.test("setProperty for property that exists at the internal menu item", function(assert) {
		var oSpyFireEvent = this.spy(this.sut, "fireEvent"),
			sPropertyKey = "text",
			sPropertyValue = "new_mi_text";

		//Act
		this.sut.setProperty(sPropertyKey, sPropertyValue);

		//Assert
		assert.strictEqual(this.sut.getText(), sPropertyValue, "setProperty sets");
		assert.ok(oSpyFireEvent.calledWith("propertyChanged"), "propertyChanged fired");
	});

	QUnit.test("setProperty for property that does not exist at the internal menu item", function(assert) {
		//Prepare
		var sPropertyKey = "key" /*sap.ui.core.Item has it*/,
			sPropertyValue = "new_mi_key_value",
			oSpyCoreItemSetProperty = this.spy(Item.prototype, "setProperty");

		//Act
		this.sut.setProperty(sPropertyKey, sPropertyValue);

		//Assert
		assert.ok(true, "does not throw an exception");
		assert.equal(oSpyCoreItemSetProperty.callCount, 1, " calls sap.ui.core.Items.prototype.setProperty once..");
		assert.equal(oSpyCoreItemSetProperty.getCall(0).args[0], sPropertyKey, "...and with correct parameter 'propertyName'");
	});

	QUnit.test("addAggregation 'items'", function(assert) {
		var oSpyFireEvent = this.spy(this.sut, "fireEvent"),
			oNewMenuItem = new MenuItem({ text: "new item " }),
			sNewItemId = oNewMenuItem.getId();

		//just in this test - verify initial items length
		assert.strictEqual(this.sut.getItems().length, 2, "initial items");

		//Act
		this.sut.addAggregation("items", oNewMenuItem, true);

		//Assert
		assert.strictEqual(this.sut.getItems().length, 3, "more items");
		assert.strictEqual(this.sut.getItems()[2].getId(), sNewItemId, "item added");
		assert.ok(oSpyFireEvent.calledWith("aggregationChanged"), "aggregationChanged fired");
	});

	QUnit.test("insertAggregation 'items'", function(assert) {
		var oSpyFireEvent = this.spy(this.sut, "fireEvent"),
			oNewMenuItem = new MenuItem({ text: "new item " }),
			sNewItemId = oNewMenuItem.getId();

		//Act
		this.sut.insertAggregation("items", oNewMenuItem, 1, true);

		//Assert
		assert.strictEqual(this.sut.getItems().length, 3, "more items");
		assert.strictEqual(this.sut.getItems()[1].getId(), sNewItemId, "item inserted");
		assert.ok(oSpyFireEvent.calledWith("aggregationChanged"), "aggregationChanged fired");
	});

	QUnit.test("removeAggregation 'items'", function(assert) {
		var oSpyFireEvent = this.spy(this.sut, "fireEvent"),
			sSecondItemId = this.sut.getItems()[1].getId(),
			sFirstUnfItemId = this.sut.getItems()[0]._getVisualControl();

		//Act
		this.sut.removeAggregation("items", 0, true);

		//Assert
		assert.strictEqual(this.sut.getItems().length, 1, "less items");
		assert.strictEqual(this.sut.getItems()[0].getId(), sSecondItemId, "item removed");
		assert.ok(oSpyFireEvent.calledWith("aggregationChanged"), "aggregationChanged fired");
		assert.ok(Element.getElementById(sFirstUnfItemId), "should not destroy the connected sap.ui.unified.MenuItem");
	});

	QUnit.test("removeAllAggregation 'items'", function(assert) {
		var oSpyFireEvent = this.spy(this.sut, "fireEvent"),
			aItems = this.sut.getItems(),
			sFirstUnfItemId = aItems[0]._getVisualControl(),
			aResult;

		//Act
		aResult = this.sut.removeAllAggregation("items", true);

		//Assert
		assert.strictEqual(aResult[0].getId(), aItems[0].getId(), "the items are not destroyed and are returned");
		assert.strictEqual(this.sut.getItems().length, 0, "no items");
		assert.ok(oSpyFireEvent.calledWith("aggregationChanged"), "aggregationChanged fired");
		assert.ok(Element.getElementById(sFirstUnfItemId), "should not destroy the connected sap.ui.unified.MenuItem");
	});

	QUnit.test("destroyAggregation 'items'", function(assert) {
		var oSpyFireEvent = this.spy(this.sut, "fireEvent"),
			oFirstItem = this.sut.getItems()[0],
			sFirstUnfItemId = oFirstItem._getVisualControl();

		//Act
		this.sut.destroyAggregation("items", true);

		//Assert
		assert.ok(!Element.getElementById(oFirstItem.getId()), "the items are destroyed");
		assert.strictEqual(this.sut.getItems().length, 0, "no items");
		assert.ok(oSpyFireEvent.calledWith("aggregationChanged"), "aggregationChanged fired");
		assert.equal(Element.getElementById(sFirstUnfItemId), null, "should destroy the connected sap.ui.unified.MenuItem");
	});

	QUnit.test("removeItem and add it later", function(assert) {
		//Prepare
		var aItems = this.sut.getItems(),
			oRemoveItem = aItems[0],
			sRemoveUnfItemId = oRemoveItem._getVisualControl();

		//Act
		this.sut.removeItem(oRemoveItem);
		this.sut.addItem(oRemoveItem);

		//Assert
		assert.equal(oRemoveItem._getVisualControl(), sRemoveUnfItemId,
				"should keep sap.m.MenuItem & sap.ui.unified.MenuItem connected");
		assert.ok(Element.getElementById(sRemoveUnfItemId), "should reuse the existing sap.ui.unified.MenuItem connected" +
			" to the given sap.m.MenuItem");
	});

	QUnit.test("onsapshow closes the menu", function(assert) {
		//arrange
		var fnMenuCloseSpy = sinon.spy(this.sutRootMenu._getVisualParent(), "close");

		//act
		Element.getElementById(this.sut._getVisualControl()).onsapshow(new jQuery.Event('sapshow'));

		//assert
		assert.strictEqual(fnMenuCloseSpy.called, true, "menu is closed after F4 on an item");
		fnMenuCloseSpy.restore();
	});

	QUnit.module('MenuListItem', {
		beforeEach: function () {
			this.menuItem = new MenuItem({
				text: "mi",
				icon: 'sap-icon://accidental-leave',
				items: [
					new MenuItem({
						text: "sub_mi_1",
						icon: 'sap-icon://accidental-leave'
					}),
					new MenuItem({
						text: "sub_mi_2",
						icon: 'sap-icon://accidental-leave'
					})
				]
			});
			this.sut = new MenuListItem({
				title: "mi",
				icon: 'sap-icon://accidental-leave',
				menuItem: this.menuItem.getId()
			});
		},
		afterEach : async function () {
			this.sut.destroy();
			this.menuItem.destroy();
			await nextUIUpdate(this.clock);

			this.sut = null;
			this.menuItem = null;
		}
	});

	QUnit.test("_getImage ", function(assert) {
		var sImageStyleClass = "sapMMenuLIImgThumb",
			oImage = this.sut._getImage(this.sut.getId() + "-img", sImageStyleClass, this.sut.getIcon(), this.sut.getIconDensityAware());

		//Assert
		assert.ok(oImage, "image exists");
		assert.ok(this.sut._image, "image is cached");
		assert.strictEqual(oImage.getUseIconTooltip(), false, "arrow image has no tooltip");
	});

	QUnit.test("_getIconArrowRight", function(assert) {
		var oImage = this.sut._getIconArrowRight();

		//Assert
		assert.ok(oImage, "arrow image exists");
		assert.ok(this.sut._imageRightArrow, "arrow image is cached");
		assert.strictEqual(oImage.getSrc(), "sap-icon://slim-arrow-right", "image has right font symbol");
		assert.strictEqual(oImage.getUseIconTooltip(), false, "arrow image has no tooltip");
	});

	QUnit.test("_hasSubItems", function(assert) {
		//Assert
		assert.strictEqual(this.sut._hasSubItems(), true, "true when its associated MenuItem has sub-items");

		//Act
		this.menuItem.destroyItems();

		//Assert
		assert.strictEqual(this.sut._hasSubItems(), false, "false when its associated MenuItem has no sub-items");

		//Act
		this.sut.setMenuItem(null);

		//Assert
		assert.strictEqual(this.sut._hasSubItems(), false, "false when it has no associated MenuItem");
	});

	QUnit.module("Custom style class support", {
		beforeEach: function () {
			this.oMenu = new Menu();
		},
		afterEach: async function () {
			this.oMenu.destroy();
			this.oMenu = null;
			await nextUIUpdate(this.clock);

		},
		addMenuItems: function () {
			this.oMenu.addItem(new MenuItem({
				text: "fridge",
				icon: "sap-icon://fridge",
				tooltip: "it's cold in here",
				items: [
					new MenuItem({
						text: "accidental leave",
						icon: "sap-icon://accidental-leave",
						items: [
							new MenuItem({
								icon: "sap-icon://factory",
								text: "factory"
							})
						]
					}),
					new MenuItem({
						text: "accidental leave",
						icon: "sap-icon://accidental-leave"
					})
				]
			}));
		},
		getDialog: function () {
			var oDialog = this.oMenu._getDialog();
			if (!oDialog) {
				this.oMenu._initDialog();
				oDialog = this.oMenu._getDialog();
			}
			return oDialog;
		}
	});

	QUnit.test("No renderer", function (oAssert) {
		try {
			var oRenderer = this.oMenu.getMetadata().getRenderer();
			oAssert.notOk(oRenderer, "The menu has no renderer. If this changes, you can remove this test only if you change " +
				"the way the synchronization of CustomStyleClassSupport is handled between " +
				"the sap.m.Menu and the sap.ui.unified.Menu");
		} catch (e) {
			oAssert.ok(true, "The menu has no renderer. If this changes, you can remove this test only if you change " +
				"the way the synchronization of CustomStyleClassSupport is handled between " +
				"the sap.m.Menu and the sap.ui.unified.Menu");
		}
	});

	QUnit.test("Internal Dialog", function (oAssert) {
		// Arrange
		var oDialog = this.getDialog();

		// Act - add style class to the menu control
		this.oMenu.addStyleClass("MYCUSTOMSTYLECLASS");

		// Assert
		oAssert.strictEqual(oDialog.hasStyleClass("MYCUSTOMSTYLECLASS"), true,
			"The style is propagated to the dialog control");
		oAssert.strictEqual(this.oMenu.hasStyleClass("MYCUSTOMSTYLECLASS"), true,
			"The style class is also applied to the control itself");

		// Act - remove style class
		this.oMenu.removeStyleClass("MYCUSTOMSTYLECLASS");

		// Assert
		oAssert.strictEqual(oDialog.hasStyleClass("MYCUSTOMSTYLECLASS"), false,
			"The style class should not be available in the dialog");

		// Act - toggle style class - true bAdd parameter
		this.oMenu.toggleStyleClass("MYCUSTOMSTYLECLASS", true);

		// Assert
		oAssert.strictEqual(oDialog.hasStyleClass("MYCUSTOMSTYLECLASS"), true,
			"The style is propagated to the dialog control");

		// Act - toggle style class - false bAdd parameter
		this.oMenu.toggleStyleClass("MYCUSTOMSTYLECLASS", false);

		// Assert
		oAssert.strictEqual(oDialog.hasStyleClass("MYCUSTOMSTYLECLASS"), false,
			"The style class should not be available in the dialog");
	});

	QUnit.test("Unified Menu", function (oAssert) {
		var iLength,
			i;

		// Arrange
		this.addMenuItems();
		this.oMenu._initAllMenuItems();

		var aSubMenuList = this.oMenu.findAggregatedObjects(true, function (oObject) {
			return oObject.getMetadata().getName() === "sap.ui.unified.Menu";
		});

		// Assert
		oAssert.strictEqual(aSubMenuList.length, 3, "There are 3 sub menu's found");

		// Act
		this.oMenu.addStyleClass("MYCUSTOMSTYLECLASS");

		// Assert
		oAssert.strictEqual(this.oMenu.hasStyleClass("MYCUSTOMSTYLECLASS"), true,
			"The class is applied to the control itself");

		for (i = 0, iLength = aSubMenuList.length; i < iLength; i++) {
			oAssert.strictEqual(aSubMenuList[i].hasStyleClass("MYCUSTOMSTYLECLASS"), true,
				"The style class 'MYCUSTOMSTYLECLASS' should be propagated to sub menu: " + i);

			oAssert.strictEqual(aSubMenuList[i].hasStyleClass("sapMMenu"), true,
				"The style class 'sapMMenu' should be propagated to sub menu: " + i);

			oAssert.strictEqual(aSubMenuList[i].aCustomStyleClasses, this.oMenu.aCustomStyleClasses,
				"Both object properties are reference to the same object so mimic mode is possible");

			oAssert.strictEqual(aSubMenuList[i].mCustomStyleClassMap, this.oMenu.mCustomStyleClassMap,
				"Both object properties are reference to the same object so mimic mode is possible");
		}

		// Act
		this.oMenu.removeStyleClass("MYCUSTOMSTYLECLASS");

		// Assert
		oAssert.strictEqual(this.oMenu.hasStyleClass("MYCUSTOMSTYLECLASS"), false,
			"The class is removed from the control itself");

		for (i = 0, iLength = aSubMenuList.length; i < iLength; i++) {
			oAssert.strictEqual(aSubMenuList[i].hasStyleClass("MYCUSTOMSTYLECLASS"), false,
				"The style class 'MYCUSTOMSTYLECLASS' should be propagated to sub menu: " + i);
		}
	});

	QUnit.module("Custom accessibility functions and custom data", {
		beforeEach: function () {
			this.oMenu = new Menu();
		},
		afterEach: async function () {
			this.oMenu.destroy();
			this.oMenu = null;
			await nextUIUpdate(this.clock);

		}
	});

	QUnit.test("Enhance accessibility functions", function (oAssert) {
		var oButton = new Button(),
			oOrigProps = {type: "button"},
			oAriaProps,
			fnCustomAccFunction = function (oElement, mAriaProps) {
				mAriaProps.controls = "sControlId";
			},
			oUfdMenu;

		// Arrange
		this.oMenu._initAllMenuItems();
		oUfdMenu = this.oMenu._getMenu();

		// Default
		oAriaProps = merge({}, oOrigProps); // clone
		oUfdMenu.enhanceAccessibilityState(oButton, oAriaProps);
		oAssert.deepEqual(oAriaProps, oOrigProps, "Should not modify passed mAriaProps if no custom function is set");

		// Act
		this.oMenu._setCustomEnhanceAccStateFunction(fnCustomAccFunction);
		this.oMenu._initAllMenuItems();
		oUfdMenu = this.oMenu._getMenu();

		// Assert
		oAriaProps = merge({}, oOrigProps); // clone
		oUfdMenu.enhanceAccessibilityState(oButton, oAriaProps);
		oAssert.strictEqual(oAriaProps.controls, "sControlId", "Should also add additional mAriaProps if a custom function is set");
	});

	QUnit.test("Custom data is propagated properly", function (oAssert) {
		var oItem = new MenuItem(),
			oUfdItem;

		// Arrange
		oItem.addCustomData(new CustomData({
			key: "customKey",
			value: "customValue"
		}));
		oUfdItem = this.oMenu._createVisualMenuItemFromItem(oItem);

		// Assert
		oAssert.strictEqual(oUfdItem.data("customKey"), "customValue", "Custom data is propagated properly to the Unified menu item");
	});

	QUnit.test("Custom data is propagated properly when binding with binding string", async function (oAssert) {
		// Arrange
		var oModel = new JSONModel([{
				bar : 'barche'
			},{
				bar : 'barche'
			}]),
			oMenu = new Menu({
				id: "menu",
				items: {
					path:"myModel>/",
					template:new MenuItem({
						text:"test",
						customData : [
							new CustomData({
								id: 'cust',
								key:"foo",
								value:"{path:'myModel>bar'}",
								writeToDom: true
							})
						]
					})
				}
			}),
			oItemCustomData,
			oUnfdItemCustomData,
			oButton = new Button();

		oMenu.setModel(oModel, "myModel");

		oButton.placeAt('qunit-fixture');
		await nextUIUpdate(this.clock);

		// Act
		oMenu.openBy(oButton);
		oItemCustomData = oMenu.getItems()[0].getCustomData()[0];
		oUnfdItemCustomData = oMenu._getMenu().getItems()[0].getCustomData()[0];

		// Assert
		oAssert.strictEqual(oUnfdItemCustomData.getValue(), oItemCustomData.getValue(), "Source data is propagated property to the target data");
		oAssert.strictEqual(oItemCustomData.getValue(), oModel.getData()[0].bar, "Source data is propagated property to the target data");

		// Act
		oMenu.getItems()[0].getCustomData()[0].setValue("newValue");

		// Assert
		oAssert.strictEqual(oUnfdItemCustomData.getValue(), oItemCustomData.getValue(), "Source data is propagated property to the target data");
		oAssert.strictEqual(oItemCustomData.getValue(), "newValue", "Source data is propagated property to the target data");

		// Destroy
		oButton.destroy();
		oMenu.destroy();
	});

	QUnit.module('MenuItem Shortcut', {
		beforeEach: async function () {
			this.sut = new Menu({
				items: [
					new MenuItem({
						text: "Open",
						icon: "sap-icon://open-folder",
						shortcutText: "Ctrl + O"
					}),

					new MenuItem({
						text: "Save",
						shortcutText: "Ctrl + Shift + S",
						items: [
							new MenuItem({
								text: "Save Locally",
								icon: "sap-icon://save",
								shortcutText: "Ctrl + S"
							}),
							new MenuItem({
								text: "Save to Cloud",
								icon: "sap-icon://upload-to-cloud",
								shortcutText: "Alt + S"
							}),
							new MenuItem({
								text: "Save to Memory"
							})
						]
					}),

					new MenuItem({
						text: "Delete"
					})
				]
			});
			this.oLabel = new Label("Opener").placeAt("qunit-fixture");
			await nextUIUpdate(this.clock);

			this.sut.openBy(this.oLabel);
			await nextUIUpdate(this.clock);

		},
		afterEach : async function () {
			this.sut.close();
			this.sut.destroy();
			await nextUIUpdate(this.clock);
			this.oLabel.destroy();
			await nextUIUpdate(this.clock);

			this.sut = null;
			this.oLabel = null;
		}
	});

	QUnit.test("Rendering", function(assert) {
		var oMenu = this.sut._getMenu().getPopup().getContent(),
			aItems = oMenu.getItems();

		//Assert
		assert.strictEqual(aItems[0].getDomRef().querySelector(".sapUiMnuItmSCut").innerHTML, aItems[0].getShortcutText(), "Shortcut Text of the first MenuItem is rendered");
		assert.strictEqual(aItems[1].getDomRef().querySelector(".sapUiMnuItmSCut").innerHTML, "", "Shortcut Text of the second MenuItem is not rendered, because it has submenu");
		assert.strictEqual(aItems[2].getDomRef().querySelector(".sapUiMnuItmSCut").innerHTML, "", "Shortcut Text of the third MenuItem is not rendered because it has no value");

	});

	QUnit.test("Accessibility", function(assert) {
		var oMenu = this.sut._getMenu().getPopup().getContent(),
			aItems = oMenu.getItems();

		//Assert
		assert.strictEqual(aItems[0].getDomRef().getAttribute("aria-keyshortcuts"), aItems[0].getShortcutText(), "Shortcut Text of the first MenuItem is added as aria-keyshortcuts attribute");
		assert.notOk(aItems[1].getDomRef().getAttribute("aria-keyshortcuts"), "aria-keyshortcuts attribute of the second MenuItem is not rendered, because it has submenu");
		assert.notOk(aItems[2].getDomRef().getAttribute("aria-keyshortcuts"), "aria-keyshortcuts attribute of the third MenuItem is not rendered because it has no value");

	});

	QUnit.module("Item Selection", {
		beforeEach: async function() {
			this.oMenu = new Menu({
				items: [
					new MenuItem({text: "Item 1"}),
					new MenuItem({text: "Item 2"}),
					new MenuItem({text: "Item 3"}),
					new MenuItemGroup("singleGroup",{
						itemSelectionMode: "SingleSelect",
						items: [
							new MenuItem({text: "Item 4"}),
							new MenuItem({text: "Item 5"}),
							new MenuItem({text: "Item 6"})
						]
					}),
					new MenuItemGroup("multiGroup",{
						itemSelectionMode: "MultiSelect",
						items: [
							new MenuItem({text: "Item 7"}),
							new MenuItem({text: "Item 8"}),
							new MenuItem({text: "Item 9"})
						]
					}),
					new MenuItemGroup("noneGroup",{
						itemSelectionMode: "None",
						items: [
							new MenuItem({text: "Item 10"}),
							new MenuItem({text: "Item 11"}),
							new MenuItem({text: "Item 12"})
						]
					}),
					new MenuItem({text: "Item 13"})
				]
			}).placeAt("qunit-fixture");
			await nextUIUpdate(this.clock);
		},
		afterEach : async function() {
			this.oMenu.destroy();
			this.oMenu = null;
			await nextUIUpdate(this.clock);
		}
	});

	QUnit.test("All items (including those in groups) are rendered", function(assert) {
		// Act
		this.oMenu.openBy();
		var oUnifiedMenu = this.oMenu._getMenu();

		// Assert
		assert.equal(oUnifiedMenu._getItems().length, 13, "Total number of items is correct");
		assert.equal(oUnifiedMenu.getDomRef().querySelectorAll(".sapUiMnuItm").length, 13, "All items are rendered");
	});

	QUnit.test("Items selection in single-selection group", async function(assert) {
		var oGroup = this.oMenu.getItems()[3],
			aItems = oGroup.getItems(),
			oInnerItem0,
			oInnerItem1,
			oInnerItem2;

		// Act - select one item
		this.oMenu.openBy();
		oInnerItem0 = Element.getElementById(aItems[0]._getVisualControl());
		oInnerItem1 = Element.getElementById(aItems[1]._getVisualControl());
		oInnerItem2 = Element.getElementById(aItems[2]._getVisualControl());

		aItems[0].setSelected(true);
		await nextUIUpdate(this.clock);

		// Assert
		assert.equal(oInnerItem0.getDomRef().getAttribute("aria-checked"), "true", "First item has 'aria-checked' attribute set");
		assert.ok(oInnerItem0.getDomRef().querySelector(".sapUiMnuItmSel"), "First item has selection mark rendered");

		// Act - deselect selected item
		aItems[0].setSelected(false);
		await nextUIUpdate(this.clock);

		// Assert
		assert.notOk(oInnerItem0.getDomRef().getAttribute("aria-checked"), "First item has no 'aria-checked' attribute set");
		assert.notOk(oInnerItem0.getDomRef().querySelector(".sapUiMnuItmSel"), "First item has no selection mark rendered");

		// Act - select more than one item
		aItems[0].setSelected(true);
		aItems[1].setSelected(true);
		aItems[2].setSelected(true);
		await nextUIUpdate(this.clock);

		// Assert
		assert.notOk(oInnerItem0.getDomRef().getAttribute("aria-checked"), "First item has no 'aria-checked' attribute set");
		assert.notOk(oInnerItem0.getDomRef().querySelector(".sapUiMnuItmSel"), "First item has no selection mark rendered");
		assert.notOk(oInnerItem1.getDomRef().getAttribute("aria-checked"), "Second item has no 'aria-checked' attribute set");
		assert.notOk(oInnerItem1.getDomRef().querySelector(".sapUiMnuItmSel"), "Second item has no selection mark rendered");
		assert.equal(oInnerItem2.getDomRef().getAttribute("aria-checked"), "true", "Third item has 'aria-checked' attribute set");
		assert.ok(oInnerItem2.getDomRef().querySelector(".sapUiMnuItmSel"), "Third item has selection mark rendered");
	});

	QUnit.test("Items selection in multi-selection group", async function(assert) {
		var oGroup = this.oMenu.getItems()[4],
			aItems = oGroup.getItems(),
			oInnerItem0,
			oInnerItem1,
			oInnerItem2;

		// Act - select one item
		this.oMenu.openBy();
		oInnerItem0 = Element.getElementById(aItems[0]._getVisualControl());
		oInnerItem1 = Element.getElementById(aItems[1]._getVisualControl());
		oInnerItem2 = Element.getElementById(aItems[2]._getVisualControl());

		aItems[0].setSelected(true);
		await nextUIUpdate(this.clock);

		// Assert
		assert.equal(oInnerItem0.getDomRef().getAttribute("aria-checked"), "true", "First item has 'aria-checked' attribute set");
		assert.ok(oInnerItem0.getDomRef().querySelector(".sapUiMnuItmSel"), "First item has selection mark rendered");

		// Act - deselect selected item
		aItems[0].setSelected(false);
		await nextUIUpdate(this.clock);

		// Assert
		assert.notOk(oInnerItem0.getDomRef().getAttribute("aria-checked"), "First item has no 'aria-checked' attribute set");
		assert.notOk(oInnerItem0.getDomRef().querySelector(".sapUiMnuItmSel"), "First item has no selection mark rendered");

		// Act - select more than one item
		aItems[0].setSelected(true);
		aItems[1].setSelected(true);
		aItems[2].setSelected(true);
		await nextUIUpdate(this.clock);

		// Assert
		assert.equal(oInnerItem0.getDomRef().getAttribute("aria-checked"), "true", "First item has 'aria-checked' attribute set");
		assert.ok(oInnerItem0.getDomRef().querySelector(".sapUiMnuItmSel"), "First item has selection mark rendered");
		assert.equal(oInnerItem1.getDomRef().getAttribute("aria-checked"), "true", "Second item has 'aria-checked' attribute set");
		assert.ok(oInnerItem1.getDomRef().querySelector(".sapUiMnuItmSel"), "Second item has selection mark rendered");
		assert.equal(oInnerItem2.getDomRef().getAttribute("aria-checked"), "true", "Third item has 'aria-checked' attribute set");
		assert.ok(oInnerItem2.getDomRef().querySelector(".sapUiMnuItmSel"), "Third item has selection mark rendered");
	});

	QUnit.test("Items selection in group with no selection set", async function(assert) {
		var oGroup = this.oMenu.getItems()[5],
			oItem0 = oGroup.getItems()[0],
			oInnerItem0;

		// Act - select one item
		this.oMenu.openBy();
		oInnerItem0 = Element.getElementById(oItem0._getVisualControl());

		oItem0.setSelected(true);
		await nextUIUpdate(this.clock);

		// Assert
		assert.notOk(oInnerItem0.getDomRef().getAttribute("aria-checked"), "First item has no 'aria-checked' attribute set");
		assert.notOk(oInnerItem0.getDomRef().querySelector(".sapUiMnuItmSel"), "First item has no selection mark rendered");

		// Act - deselect selected item
		oItem0.setSelected(false);
		await nextUIUpdate(this.clock);

		// Assert
		assert.notOk(oInnerItem0.getDomRef().getAttribute("aria-checked"), "First item has no 'aria-checked' attribute set");
		assert.notOk(oInnerItem0.getDomRef().querySelector(".sapUiMnuItmSel"), "First item has no selection mark rendered");
	});

	QUnit.test("Items selection of item outside of a group", async function(assert) {
		var oItem0 = this.oMenu.getItems()[0],
			oInnerItem0;

		// Act - select one item
		this.oMenu.openBy();
		oInnerItem0 = Element.getElementById(oItem0._getVisualControl());

		oItem0.setSelected(true);
		await nextUIUpdate(this.clock);

		// Assert
		assert.notOk(oInnerItem0.getDomRef().getAttribute("aria-checked"), "First item has no 'aria-checked' attribute set");
		assert.notOk(oInnerItem0.getDomRef().querySelector(".sapUiMnuItmSel"), "First item has no selection mark rendered");

		// Act - deselect selected item
		oItem0.setSelected(false);
		await nextUIUpdate(this.clock);

		// Assert
		assert.notOk(oInnerItem0.getDomRef().getAttribute("aria-checked"), "First item has no 'aria-checked' attribute set");
		assert.notOk(oInnerItem0.getDomRef().querySelector(".sapUiMnuItmSel"), "First item has no selection mark rendered");
	});

	QUnit.test("Items selection with click in single-selection group", async function(assert) {
		var oGroup = this.oMenu.getItems()[3],
			aItems = oGroup.getItems(),
			oInnerItem0,
			oInnerItem1;

		// Act - select one item
		this.oMenu.openBy();
		oInnerItem0 = Element.getElementById(aItems[0]._getVisualControl());
		oInnerItem1 = Element.getElementById(aItems[1]._getVisualControl());

		oInnerItem0.$().trigger("click");
		await nextUIUpdate(this.clock);

		// Assert
		assert.ok(aItems[0].getSelected(), "First item is selected");

		// Act - deselect selected item
		this.oMenu.openBy();
		oInnerItem1.$().trigger("click");
		await nextUIUpdate(this.clock);

		// Assert
		assert.notOk(aItems[0].getSelected(), "First item is not selected");
		assert.ok(aItems[1].getSelected(), "Second item is selected");
	});

	QUnit.test("Items selection with click in multi-selection group", async function(assert) {
		var oGroup = this.oMenu.getItems()[4],
			aItems = oGroup.getItems(),
			oInnerItem0,
			oInnerItem1;

		// Act - select one item
		this.oMenu.openBy();
		oInnerItem0 = Element.getElementById(aItems[0]._getVisualControl());
		oInnerItem1 = Element.getElementById(aItems[1]._getVisualControl());

		oInnerItem0.$().trigger("click");
		await nextUIUpdate(this.clock);

		// Assert
		assert.ok(aItems[0].getSelected(), "First item is selected");

		// Act - deselect selected item
		this.oMenu.openBy();
		oInnerItem1.$().trigger("click");
		await nextUIUpdate(this.clock);

		// Assert
		assert.ok(aItems[0].getSelected(), "First item is selected");
		assert.ok(aItems[1].getSelected(), "Second item is selected");
	});

	QUnit.test("Items selection with click in group with no selection", async function(assert) {
		var oGroup = this.oMenu.getItems()[5],
			oItem0 = oGroup.getItems()[0],
			oInnerItem0;

		// Act - select one item
		this.oMenu.openBy();
		oInnerItem0 = Element.getElementById(oItem0._getVisualControl());

		oInnerItem0.$().trigger("click");
		await nextUIUpdate(this.clock);

		// Assert
		assert.notOk(oItem0.getSelected(), "First item is not selected");
	});

	QUnit.test("Items selection with click for item outside a group", async function(assert) {
		var oItem0 = this.oMenu.getItems()[0],
			oInnerItem0;

		// Act - select one item
		this.oMenu.openBy();
		oInnerItem0 = Element.getElementById(oItem0._getVisualControl());

		oInnerItem0.$().trigger("click");
		await nextUIUpdate(this.clock);

		// Assert
		assert.notOk(oItem0.getSelected(), "First item is not selected");
	});

	QUnit.module('[PHONE] Item Selection', {
		beforeEach: async function () {
			prepareMobilePlatform.call(this);
			this.oMenu = new Menu({
				items: [
					new MenuItem({text: "Item 1"}),
					new MenuItem({text: "Item 2"}),
					new MenuItem({text: "Item 3"}),
					new MenuItemGroup("singleGroup",{
						itemSelectionMode: "SingleSelect",
						items: [
							new MenuItem({text: "Item 4"}),
							new MenuItem({text: "Item 5"}),
							new MenuItem({text: "Item 6"})
						]
					}),
					new MenuItemGroup("multiGroup",{
						itemSelectionMode: "MultiSelect",
						items: [
							new MenuItem({text: "Item 7"}),
							new MenuItem({text: "Item 8"}),
							new MenuItem({text: "Item 9"})
						]
					}),
					new MenuItemGroup("noneGroup",{
						itemSelectionMode: "None",
						items: [
							new MenuItem({text: "Item 10"}),
							new MenuItem({text: "Item 11"}),
							new MenuItem({text: "Item 12"})
						]
					}),
					new MenuItem({text: "Item 13"})
				]
			}).placeAt("qunit-fixture");
			await nextUIUpdate(this.clock);
		},
		afterEach : async function () {
			this.oMenu.destroy();
			this.oMenu = null;
			await nextUIUpdate(this.clock);

			jQuery('#qunit-fixture').removeClass('sap-phone');
			jQuery('body').removeClass('sap-phone');
		}
	});

	QUnit.test("All items (including those in groups) are rendered", function(assert) {
		// Act
		this.oMenu.openBy();
		var oMenuList = this.oMenu._getDialog().getContent()[0].getPages()[0].getContent()[0];

		// Assert
		assert.equal(oMenuList.getItems().length, 13, "Total number of items is correct");
		assert.equal(oMenuList.getDomRef().querySelectorAll(".sapMLIB").length, 13, "All items are rendered");
	});

	QUnit.test("Items selection in single-selection group", async function(assert) {
		var oGroup = this.oMenu.getItems()[3],
			aItems = oGroup.getItems(),
			oInnerItem0,
			oInnerItem1,
			oInnerItem2;

		// Act - select one item
		this.oMenu.openBy();

		oInnerItem0 = Element.getElementById(aItems[0]._getVisualControl());
		oInnerItem1 = Element.getElementById(aItems[1]._getVisualControl());
		oInnerItem2 = Element.getElementById(aItems[2]._getVisualControl());

		aItems[0].setSelected(true);
		await nextUIUpdate(this.clock);

		// Assert
		assert.equal(oInnerItem0.getDomRef().getAttribute("aria-checked"), "true", "First item has 'aria-checked' attribute set");
		assert.ok(oInnerItem0.getDomRef().querySelector(".sapMMenuLISel"), "First item has selection mark rendered");

		// Act - deselect selected item
		aItems[0].setSelected(false);
		await nextUIUpdate(this.clock);

		// Assert
		assert.notOk(oInnerItem0.getDomRef().getAttribute("aria-checked"), "First item has no 'aria-checked' attribute set");
		assert.notOk(oInnerItem0.getDomRef().querySelector(".sapMMenuLISel"), "First item has no selection mark rendered");

		// Act - select more than one item
		aItems[0].setSelected(true);
		aItems[1].setSelected(true);
		aItems[2].setSelected(true);
		await nextUIUpdate(this.clock);

		// Assert
		assert.notOk(oInnerItem0.getDomRef().getAttribute("aria-checked"), "First item has no 'aria-checked' attribute set");
		assert.notOk(oInnerItem0.getDomRef().querySelector(".sapMMenuLISel"), "First item has no selection mark rendered");
		assert.notOk(oInnerItem1.getDomRef().getAttribute("aria-checked"), "Second item has no 'aria-checked' attribute set");
		assert.notOk(oInnerItem1.getDomRef().querySelector(".sapMMenuLISel"), "Second item has no selection mark rendered");
		assert.equal(oInnerItem2.getDomRef().getAttribute("aria-checked"), "true", "Third item has 'aria-checked' attribute set");
		assert.ok(oInnerItem2.getDomRef().querySelector(".sapMMenuLISel"), "Third item has selection mark rendered");

		this.oMenu.close();
		this.clock.tick(1000);
	});

	QUnit.test("Items selection in multi-selection group", async function(assert) {
		var oGroup = this.oMenu.getItems()[4],
			aItems = oGroup.getItems(),
			oInnerItem0,
			oInnerItem1,
			oInnerItem2;

		// Act - select one item
		this.oMenu.openBy();

		oInnerItem0 = Element.getElementById(aItems[0]._getVisualControl());
		oInnerItem1 = Element.getElementById(aItems[1]._getVisualControl());
		oInnerItem2 = Element.getElementById(aItems[2]._getVisualControl());

		aItems[0].setSelected(true);
		await nextUIUpdate(this.clock);

		// Assert
		assert.equal(oInnerItem0.getDomRef().getAttribute("aria-checked"), "true", "First item has 'aria-checked' attribute set");
		assert.ok(oInnerItem0.getDomRef().querySelector(".sapMMenuLISel"), "First item has selection mark rendered");

		// Act - deselect selected item
		aItems[0].setSelected(false);
		await nextUIUpdate(this.clock);

		// Assert
		assert.notOk(oInnerItem0.getDomRef().getAttribute("aria-checked"), "First item has no 'aria-checked' attribute set");
		assert.notOk(oInnerItem0.getDomRef().querySelector(".sapMMenuLISel"), "First item has no selection mark rendered");

		// Act - select more than one item
		aItems[0].setSelected(true);
		aItems[1].setSelected(true);
		aItems[2].setSelected(true);
		await nextUIUpdate(this.clock);

		// Assert
		assert.equal(oInnerItem0.getDomRef().getAttribute("aria-checked"), "true", "First item has 'aria-checked' attribute set");
		assert.ok(oInnerItem0.getDomRef().querySelector(".sapMMenuLISel"), "First item has selection mark rendered");
		assert.equal(oInnerItem1.getDomRef().getAttribute("aria-checked"), "true", "Second item has 'aria-checked' attribute set");
		assert.ok(oInnerItem1.getDomRef().querySelector(".sapMMenuLISel"), "Second item has selection mark rendered");
		assert.equal(oInnerItem2.getDomRef().getAttribute("aria-checked"), "true", "Third item has 'aria-checked' attribute set");
		assert.ok(oInnerItem2.getDomRef().querySelector(".sapMMenuLISel"), "Third item has selection mark rendered");

		this.oMenu.close();
		this.clock.tick(1000);
	});

	QUnit.test("Items selection in group with no selection set", async function(assert) {
		var oGroup = this.oMenu.getItems()[5],
			oItem0 = oGroup.getItems()[0],
			oInnerItem0;

		// Act - select one item
		this.oMenu.openBy();

		oInnerItem0 = Element.getElementById(oItem0._getVisualControl());

		oItem0.setSelected(true);
		await nextUIUpdate(this.clock);

		// Assert
		assert.notOk(oInnerItem0.getDomRef().getAttribute("aria-checked"), "First item has no 'aria-checked' attribute set");
		assert.notOk(oInnerItem0.getDomRef().querySelector(".sapMMenuLISel"), "First item has no selection mark rendered");

		// Act - deselect selected item
		oItem0.setSelected(false);
		await nextUIUpdate(this.clock);

		// Assert
		assert.notOk(oInnerItem0.getDomRef().getAttribute("aria-checked"), "First item has no 'aria-checked' attribute set");
		assert.notOk(oInnerItem0.getDomRef().querySelector(".sapMMenuLISel"), "First item has no selection mark rendered");

		this.oMenu.close();
		this.clock.tick(1000);
	});

	QUnit.test("Items selection of item outside of a group", async function(assert) {
		var oItem0 = this.oMenu.getItems()[0],
			oInnerItem0;

		// Act - select one item
		this.oMenu.openBy();

		oInnerItem0 = Element.getElementById(oItem0._getVisualControl());

		oItem0.setSelected(true);
		await nextUIUpdate(this.clock);

		// Assert
		assert.notOk(oInnerItem0.getDomRef().getAttribute("aria-checked"), "First item has no 'aria-checked' attribute set");
		assert.notOk(oInnerItem0.getDomRef().querySelector(".sapMMenuLISel"), "First item has no selection mark rendered");

		// Act - deselect selected item
		oItem0.setSelected(false);
		await nextUIUpdate(this.clock);

		// Assert
		assert.notOk(oInnerItem0.getDomRef().getAttribute("aria-checked"), "First item has no 'aria-checked' attribute set");
		assert.notOk(oInnerItem0.getDomRef().querySelector(".sapMMenuLISel"), "First item has no selection mark rendered");

		this.oMenu.close();
		this.clock.tick(1000);
	});

	QUnit.module("Group overriden aggregation methods", {
		beforeEach: async function() {
			this.oMenu = new Menu({
				items: [
					new MenuItem({text: "Item 1"}),
					new MenuItem({text: "Item 2"}),
					new MenuItem({text: "Item 3"}),
					new MenuItemGroup("singleGroup",{
						itemSelectionMode: "SingleSelect",
						items: [
							new MenuItem({text: "Group Item 1"}),
							new MenuItem({text: "Group Item 2"}),
							new MenuItem({text: "Group Item 3"})
						]
					}),
					new MenuItem({text: "Last Item"})
				]
			}).placeAt("qunit-fixture");
			await nextUIUpdate(this.clock);
		},
		afterEach : async function() {
			this.oMenu.destroy();
			this.oMenu = null;
			await nextUIUpdate(this.clock);
		}
	});

	QUnit.test("addItem method", function(assert) {
		var oItem = new MenuItem({text: "Group Item 4"}),
			oGroup = this.oMenu.getItems()[3],
			oUnifiedMenu,
			oUnifiedGroup,
			aUnifiedItems;

		// Act
		this.oMenu.openBy();
		oUnifiedMenu = this.oMenu._getMenu();
		oUnifiedGroup = oUnifiedMenu.getItems()[3];
		oGroup.addItem(oItem);
		aUnifiedItems = oUnifiedMenu._getItems();

		// Assert
		assert.equal(this.oMenu._getItems().length, 8, "Item is added to the items aggregation");
		assert.equal(aUnifiedItems.length, 8, "Item is added to unified menu");
		assert.equal(aUnifiedItems[6].getText(), "Group Item 4", "Item is added to the unified menu at right position");
		assert.equal(oUnifiedGroup.getItems().length, 4, "Item is added to the unified menu group");
		assert.equal(oUnifiedGroup.getItems()[3].getText(), "Group Item 4", "Item is added to the unified menu group at right position");
	});

	QUnit.test("insertItem method", function(assert) {
		var oItem = new MenuItem({text: "Group Item 2-3"}),
			oGroup = this.oMenu.getItems()[3],
			oUnifiedMenu,
			oUnifiedGroup,
			aUnifiedItems;

		// Act
		this.oMenu.openBy();
		oUnifiedMenu = this.oMenu._getMenu();
		oUnifiedGroup = oUnifiedMenu.getItems()[3];
		oGroup.insertItem(oItem, 2);
		aUnifiedItems = oUnifiedMenu._getItems();

		// Assert
		assert.equal(this.oMenu._getItems().length, 8, "Item is inserted in the items aggregation");
		assert.equal(aUnifiedItems.length, 8, "Item is inserted in unified menu");
		assert.equal(aUnifiedItems[5].getText(), "Group Item 2-3", "Item is inserted in the unified menu at right position");
		assert.equal(oUnifiedGroup.getItems().length, 4, "Item is inserted in the unified menu group");
		assert.equal(oUnifiedGroup.getItems()[2].getText(), "Group Item 2-3", "Item is inserted in the unified menu group at right position");
	});

	QUnit.test("removeItem method", function(assert) {
		var oGroup = this.oMenu.getItems()[3],
			oUnifiedMenu,
			oUnifiedGroup;

		// Act - remove as object
		this.oMenu.openBy();
		oUnifiedMenu = this.oMenu._getMenu();
		oUnifiedGroup = oUnifiedMenu.getItems()[3];
		oGroup.removeItem(oGroup.getItems()[0]);

		// Assert
		assert.equal(this.oMenu._getItems().length, 6, "Item is removed from the items aggregation");
		assert.equal(oUnifiedMenu._getItems().length, 6, "Item is removed from the unified menu");
		assert.equal(oUnifiedGroup.getItems().length, 2, "Item is removed from the unified menu group");

		// Act remove by index
		oGroup.removeItem(0);

		// Assert
		assert.equal(this.oMenu._getItems().length, 5, "Item is removed from the items aggregation");
		assert.equal(oUnifiedMenu._getItems().length, 5, "Item is removed from the unified menu");
		assert.equal(oUnifiedGroup.getItems().length, 1, "Item is removed from the unified menu group");

		// Act remove by id
		oGroup.removeItem(oGroup.getItems()[0].getId());

		// Assert
		assert.equal(this.oMenu._getItems().length, 4, "Item is removed from the items aggregation");
		assert.equal(oUnifiedMenu._getItems().length, 4, "Item is removed from the unified menu");
		assert.equal(oUnifiedGroup.getItems().length, 0, "Item is removed from the unified menu group");
	});

	QUnit.test("removeAllItems method", function(assert) {
		var oGroup = this.oMenu.getItems()[3],
			oItems,
			oUnifiedMenu,
			oUnifiedGroup;

		// Act - remove as object
		this.oMenu.openBy();
		oUnifiedMenu = this.oMenu._getMenu();
		oUnifiedGroup = oUnifiedMenu.getItems()[3];
		oItems = oGroup.removeAllItems();

		// Assert
		assert.equal(this.oMenu._getItems().length, 4, "All items are removed from the items aggregation");
		assert.equal(oUnifiedMenu._getItems().length, 4, "All items are removed from the unified menu");
		assert.equal(oUnifiedGroup.getItems().length, 0, "All items are removed from the unified menu group");
		assert.equal(oItems.length, 3, "All removed items are returned");
	});

	QUnit.test("destroyItems method", function(assert) {
		var oGroup = this.oMenu.getItems()[3],
			oResult,
			oUnifiedMenu,
			oUnifiedGroup;

		// Act - remove as object
		this.oMenu.openBy();
		oUnifiedMenu = this.oMenu._getMenu();
		oUnifiedGroup = oUnifiedMenu.getItems()[3];
		oResult = oGroup.destroyItems();

		// Assert
		assert.equal(this.oMenu._getItems().length, 4, "All items are removed from the items aggregation");
		assert.equal(oUnifiedMenu._getItems().length, 4, "All items are removed from the unified menu");
		assert.equal(oUnifiedGroup.getItems().length, 0, "All items are removed from the unified menu group");
		assert.equal(oResult.getId(), oGroup.getId(), "Group is returned (as this)");
	});

	QUnit.module("[PHONE] Group overriden aggregation methods", {
		beforeEach: async function() {
			prepareMobilePlatform.call(this);
			this.oMenu = new Menu({
				items: [
					new MenuItem({text: "Item 1"}),
					new MenuItem({text: "Item 2"}),
					new MenuItem({text: "Item 3"}),
					new MenuItemGroup("singleGroup",{
						itemSelectionMode: "SingleSelect",
						items: [
							new MenuItem({text: "Group Item 1"}),
							new MenuItem({text: "Group Item 2"}),
							new MenuItem({text: "Group Item 3"})
						]
					}),
					new MenuItem({text: "Last Item"})
				]
			}).placeAt("qunit-fixture");
			await nextUIUpdate(this.clock);
		},
		afterEach : async function() {
			this.oMenu.destroy();
			this.oMenu = null;
			await nextUIUpdate(this.clock);

			jQuery('#qunit-fixture').removeClass('sap-phone');
			jQuery('body').removeClass('sap-phone');
		}
	});

	QUnit.test("addItem method", function(assert) {
		var oItem = new MenuItem({text: "Group Item 4"}),
			oGroup = this.oMenu.getItems()[3],
			oMenuList,
			aMenuListItems;

		// Act
		this.oMenu.openBy();
		oMenuList = this.oMenu._getDialog().getContent()[0].getPages()[0].getContent()[0];
		oGroup.addItem(oItem);
		aMenuListItems = oMenuList.getItems();

		// Assert
		assert.equal(this.oMenu._getItems().length, 8, "Item is added to the items aggregation");
		assert.equal(aMenuListItems.length, 8, "Item is added to menu");
		assert.equal(aMenuListItems[6].getTitle(), "Group Item 4", "Item is added to the menu at right position");

		this.oMenu.close();
		this.clock.tick(1000);
	});

	QUnit.test("insertItem method", function(assert) {
		var oItem = new MenuItem({text: "Group Item 2-3"}),
			oGroup = this.oMenu.getItems()[3],
			oMenuList,
			aMenuListItems;

		// Act
		this.oMenu.openBy();
		oMenuList = this.oMenu._getDialog().getContent()[0].getPages()[0].getContent()[0];
		oGroup.insertItem(oItem, 2);
		aMenuListItems = oMenuList.getItems();

		// Assert
		assert.equal(this.oMenu._getItems().length, 8, "Item is inserted in the items aggregation");
		assert.equal(oMenuList.getItems().length, 8, "Item is added to menu");
		assert.equal(aMenuListItems[5].getTitle(), "Group Item 2-3", "Item is inserted in the menu at right position");
	});

	QUnit.test("removeItem method", function(assert) {
		var oGroup = this.oMenu.getItems()[3],
			oMenuList;

		// Act - remove as object
		this.oMenu.openBy();
		oMenuList = this.oMenu._getDialog().getContent()[0].getPages()[0].getContent()[0];
		oGroup.removeItem(oGroup.getItems()[0]);

		// Assert
		assert.equal(this.oMenu._getItems().length, 6, "Item is removed from the items aggregation");
		assert.equal(oMenuList.getItems().length, 6, "Item is removed from the menu");

		// Act remove by index
		oGroup.removeItem(0);

		// Assert
		assert.equal(this.oMenu._getItems().length, 5, "Item is removed from the items aggregation");
		assert.equal(oMenuList.getItems().length, 5, "Item is removed from the menu");

		// Act remove by id
		oGroup.removeItem(oGroup.getItems()[0].getId());

		// Assert
		assert.equal(this.oMenu._getItems().length, 4, "Item is removed from the items aggregation");
		assert.equal(oMenuList.getItems().length, 4, "Item is removed from the menu");
	});

	QUnit.test("removeAllItems method", function(assert) {
		var oGroup = this.oMenu.getItems()[3],
			oItems,
			oMenuList;

		// Act - remove as object
		this.oMenu.openBy();
		oMenuList = this.oMenu._getDialog().getContent()[0].getPages()[0].getContent()[0];
		oItems = oGroup.removeAllItems();

		// Assert
		assert.equal(this.oMenu._getItems().length, 4, "All items are removed from the items aggregation");
		assert.equal(oMenuList.getItems().length, 4, "All items are removed from the menu");
		assert.equal(oItems.length, 3, "All removed items are returned");
	});

	QUnit.test("destroyItems method", function(assert) {
		var oGroup = this.oMenu.getItems()[3],
			oMenuList,
			oResult;

		// Act - remove as object
		this.oMenu.openBy();
		oMenuList = this.oMenu._getDialog().getContent()[0].getPages()[0].getContent()[0];
		oResult = oGroup.destroyItems();

		// Assert
		assert.equal(this.oMenu._getItems().length, 4, "All items are removed from the items aggregation");
		assert.equal(oMenuList.getItems().length, 4, "All items are removed from the menu");
		assert.equal(oResult.getId(), oGroup.getId(), "Group is returned (as this)");
	});

});