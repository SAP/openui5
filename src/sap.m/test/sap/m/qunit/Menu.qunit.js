/*global QUnit, sinon */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/Device",
	"jquery.sap.mobile",
	"sap/m/Menu",
	"sap/m/MenuItem",
	"sap/ui/model/json/JSONModel",
	"sap/m/Button",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/Label",
	"sap/ui/core/Item",
	"sap/ui/events/jquery/EventExtension",
	"sap/m/MenuListItem",
	"sap/ui/core/CustomData"
], function(
	qutils,
	Device,
	jQuery,
	Menu,
	MenuItem,
	JSONModel,
	Button,
	Filter,
	FilterOperator,
	Label,
	Item,
	EventExtension,
	MenuListItem,
	CustomData
) {
	var oCore = sap.ui.getCore();

	function prepareMobilePlatform() {
		var oSystem = {
			desktop : false,
			phone : true,
			tablet : false
		};

		this.sandbox = sinon.sandbox;
		this.sandbox.stub(Device, "system", oSystem);
		this.sandbox.stub(jQuery.device, "is", oSystem);

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

	function destroyMenu() {
		this.sut.destroy();
		this.sut = null;
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
		afterEach : function () {
			destroyMenu.call(this);

			jQuery('#qunit-fixture').removeClass('sap-phone');
			jQuery('body').removeClass('sap-phone');

			this.sandbox.restore();
			this.sandbox = null;
		}
	});

	QUnit.test('Opening/closing/reopening', function (assert) {
		//Assert
		assert.strictEqual(this.sut._getVisualParent(), null, 'The menu is not initially rendered');

		this.sut.openBy();
		this.clock.tick(1000);

		//Assert
		assert.strictEqual(jQuery('#' + this.sut._getVisualParent().getId()).length, 1, 'The menu is rendered on "openBy"');

		this.sut.close();
		this.clock.tick(1000);

		//Assert
		assert.strictEqual(jQuery('#' + this.sut._getVisualParent().getId()).length, 0, 'The menu is not rendered after "close"');

		this.sut.openBy();
		this.clock.tick(1000);

		//Assert
		assert.strictEqual(jQuery('#' + this.sut._getVisualParent().getId()).length, 1, 'The menu is rendered on "openBy"');
	});

	QUnit.test("visible", function(assert) {
		//Act
		this.sut.getItems()[0].setVisible(false);
		this.sut.openBy();
		var oItemFridge = sap.ui.getCore().byId(this.sut.getItems()[0]._getVisualControl());

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
		afterEach : function () {
			destroyMenu.call(this);
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

	QUnit.test('Opening/closing/reopening', function (assert) {
		//Assert
		assert.strictEqual(this.sut._getVisualParent(), null, 'The menu is not initially rendered');

		this.sut.openBy();
		this.clock.tick(1000);

		//Assert
		assert.strictEqual(jQuery('#' + this.sut._getVisualParent().getId()).length, 1, 'The menu is rendered on "openBy"');

		this.sut.close();
		this.clock.tick(1000);

		//Assert
		assert.strictEqual(jQuery('#' + this.sut._getVisualParent().getId()).length, 0, 'The menu is not rendered after "focus" is changed');

		this.sut.openBy();
		this.clock.tick(1000);

		//Assert
		assert.strictEqual(jQuery('#' + this.sut._getVisualParent().getId()).length, 1, 'The menu is rendered on "openBy"');
	});

	QUnit.test('Item selection event', function (assert) {
		var fnFireItemSelectedSpy = sinon.spy(this.sut, "fireItemSelected");

		this.sut.openBy();
		this.clock.tick(1000);
		this.sut._getVisualParent().getItems()[0].$().click();
		this.clock.tick(1000);

		//Assert
		assert.strictEqual(this.sut.getItems()[0].getItems().length, 2, 'The item has sub items');
		assert.strictEqual(fnFireItemSelectedSpy.calledOnce, false, "Item selected event is not fired when item is clicked");

		this.sut._getVisualParent().getItems()[1].$().click();
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
		this.sut._getVisualParent().getItems()[2].$().click();
		this.clock.tick(1000);

		//assert
		assert.strictEqual(this.sut.getItems().length, 4, "MenuItem's press event is now handled");
	});

	QUnit.module("[PHONE] Custom mutators", {
		beforeEach: function() {
			prepareMobilePlatform.call(this);
			initMenu.call(this);
		},
		afterEach: function() {
			destroyMenu.call(this);

			jQuery('#qunit-fixture').removeClass('sap-phone');
			jQuery('body').removeClass('sap-phone');

			this.sandbox.restore();
			this.sandbox = null;
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
		beforeEach : function () {
			this.sut = new Menu();
			this.oButton = new Button();
			this.oButton.placeAt('qunit-fixture');
			sap.ui.getCore().applyChanges();

		},
		afterEach : function () {
			this.oButton.destroy();
			this.oButton = null;
			destroyMenu.call(this);
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

	QUnit.test("filtering", function(assert) {
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
		sap.ui.getCore().applyChanges();

		assert.ok(!sap.ui.getCore().byId(oItemId), 'The item that does not fit in the filter is destroyed');
	});

	QUnit.module("[PHONE] Data binding", {
		beforeEach : function () {
			prepareMobilePlatform.call(this);

			this.sut = new Menu();
			this.oButton = new Button();
			this.oButton.placeAt('qunit-fixture');
			sap.ui.getCore().applyChanges();

		},
		afterEach : function () {
			this.oButton.destroy();
			this.oButton = null;
			destroyMenu.call(this);

			jQuery('#qunit-fixture').removeClass('sap-phone');
			jQuery('body').removeClass('sap-phone');

			this.sandbox.restore();
			this.sandbox = null;
		},
		getFirstModelData: getFirstModelData,
		getSecondModelData: getSecondModelData,
		bindAggregations: function() {
			bindAggregations.call(this, this.sut);
		}
	});

	QUnit.test("Change items in the model", function (assert) {
		var aItems,
			oItem,
			sTitleSelector,
			oSecondData,
			sSecondItemId;

		this.bindAggregations();
		this.sut.openBy(this.oButton);

		aItems = this.sut._getVisualParent().getContent()[0].getItems();
		oItem = aItems[0];
		sTitleSelector = "#" + this.sut._getVisualParent().getId() + " .sapMSLITitleOnly";

		//Assert
		assert.strictEqual(oItem.getTitle(), this.getFirstModelData()['items'][0]['text'], 'Correct item is being asserted.');
		assert.strictEqual(jQuery("#" + oItem.getId()).length, 1, 'First item is rendered before model property change.');

		oSecondData = this.getSecondModelData()['items'];

		this.sut.getModel().setProperty('/items', oSecondData);

		aItems = this.sut._getVisualParent().getContent()[0].getItems();
		oItem = aItems[0];
		sSecondItemId = oItem.getId();

		//Assert
		assert.strictEqual(oItem.getTitle(), oSecondData[0]['text'], 'Correct item is being asserted.');
		assert.strictEqual(jQuery("#" + sSecondItemId).length, 1, 'Second item is rendered after model property change.');
		assert.strictEqual(jQuery(sTitleSelector).length, 2, 'Starting with two items.');

		oSecondData.push({
			text: 'second-item3',
			icon: 'sap-icon://accidental-leave'
		});
		this.sut.getModel().setProperty('/items', oSecondData);

		//Assert
		assert.strictEqual(jQuery(sTitleSelector).length, 3, 'Item was successfully added.');
	});

	QUnit.module('MenuItem(inside Menu)', {
		beforeEach: function () {
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
			sap.ui.getCore().applyChanges();
		},
		afterEach : function () {
			this.sutRootMenu.close();
			this.sut.destroy();
			this.sutRootMenu.destroy();
			this.oLabel.destroy();

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
		assert.ok(sap.ui.getCore().byId(sFirstUnfItemId), "should not destroy the connected sap.ui.unified.MenuItem");
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
		assert.ok(sap.ui.getCore().byId(sFirstUnfItemId), "should not destroy the connected sap.ui.unified.MenuItem");
	});

	QUnit.test("destroyAggregation 'items'", function(assert) {
		var oSpyFireEvent = this.spy(this.sut, "fireEvent"),
			oFirstItem = this.sut.getItems()[0],
			sFirstUnfItemId = oFirstItem._getVisualControl();

		//Act
		this.sut.destroyAggregation("items", true);

		//Assert
		assert.ok(!sap.ui.getCore().byId(oFirstItem.getId()), "the items are destroyed");
		assert.strictEqual(this.sut.getItems().length, 0, "no items");
		assert.ok(oSpyFireEvent.calledWith("aggregationChanged"), "aggregationChanged fired");
		assert.equal(sap.ui.getCore().byId(sFirstUnfItemId), null, "should destroy the connected sap.ui.unified.MenuItem");
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
		assert.ok(sap.ui.getCore().byId(sRemoveUnfItemId), "should reuse the existing sap.ui.unified.MenuItem connected" +
			" to the given sap.m.MenuItem");
	});

	QUnit.test("onsapshow closes the menu", function(assert) {
		//arrange
		var fnMenuCloseSpy = sinon.spy(this.sutRootMenu._getVisualParent(), "close");

		//act
		sap.ui.getCore().byId(this.sut._getVisualControl()).onsapshow(new jQuery.Event('sapshow'));

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
		afterEach : function () {
			this.sut.destroy();
			this.menuItem.destroy();
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
		afterEach: function () {
			this.oMenu.destroy();
			this.oMenu = null;
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
			this.oMenu.getMetadata().getRenderer();
		} catch (e) {
			oAssert.ok(true, "The menu has no renderer. If this changes you can remove this test only if you change " +
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
		afterEach: function () {
			this.oMenu.destroy();
			this.oMenu = null;
		}
	});

	QUnit.test("Enhance accessibility functions", function (oAssert) {
		var oButton = new Button(),
			oAriaProps = {type: "button"},
			fnCustomAccFunction = function (oElement, mAriaProps) {
				mAriaProps.controls = "sControlId";
				return mAriaProps;
			},
			oUfdMenu;

		// Arrange
		this.oMenu._initAllMenuItems();
		oUfdMenu = this.oMenu._getMenu();

		// Default
		assert.strictEqual(oUfdMenu.enhanceAccessibilityState(oButton, oAriaProps), oAriaProps, "Should return passed mAriaProps if no custom function is set");

		// Act
		this.oMenu._setCustomEnhanceAccStateFunction(fnCustomAccFunction);
		this.oMenu._initAllMenuItems();
		oUfdMenu = this.oMenu._getMenu();

		// Assert
		assert.strictEqual(oUfdMenu.enhanceAccessibilityState(oButton, oAriaProps).controls, "sControlId", "Should return also the additional mAriaProps if a custom function is set");
	});

	QUnit.test("Custom data is propagated properly", function (oAssert) {
		var oItem = new MenuItem(),
			oUfdItem,
			oUfdItemCustomData;

		// Arrange
		oItem.addCustomData(new CustomData({
			key: "customKey",
			value: "customValue",
			writeToDom: true
		}));

		oUfdItem = this.oMenu._createVisualMenuItemFromItem(oItem);
		oUfdItemCustomData = oUfdItem.getCustomData()[0];

		// Assert
		assert.strictEqual(oUfdItemCustomData.getKey(), "customKey", "Custom data's key is propagated properly to the Unified menu item");
		assert.strictEqual(oUfdItemCustomData.getValue(), "customValue", "Custom data's value is propagated properly to the Unified menu item");
		assert.strictEqual(oUfdItemCustomData.getWriteToDom(), true, "Custom data's writeToDom is propagated properly to the Unified menu item");
	});
});