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
	"sap/ui/model/resource/ResourceModel",
	"sap/m/Button",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/Label",
	"sap/ui/core/Item",
	"sap/m/MenuListItem",
	"sap/ui/core/CustomData",
	"sap/ui/core/Control",
	"sap/ui/test/utils/nextUIUpdate"
], function(
	merge,
	Device,
	Element,
	jQuery,
	Menu,
	MenuItem,
	MenuItemGroup,
	JSONModel,
	ResourceModel,
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

	function pressItemAtIndex(iIndex) {
		var oItem = this.sut.getItems()[iIndex];
		oItem.firePress({});
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
		var	sId = this.sut.getId() + "-rp-dialog",
			done = assert.async();

		this.sut.attachClosed(function() {
			//Assert if the close event is fired
			assert.strictEqual(fnFireCloseSpy.calledOnce, true, "Close event is fired menu is closed");

			//Assert
			assert.strictEqual(jQuery('#' + sId).length, 0, 'The menu is not rendered after "close"');

			this.sut.openBy();

			//Assert
			assert.strictEqual(jQuery('#' + sId).length, 1, 'The menu is rendered on "openBy"');
			done();
		}.bind(this));

		//Assert
		assert.ok(this.sut.getAggregation("_popover"), 'The popover object is created');
		assert.strictEqual(jQuery('#' + sId).length, 0, 'The menu is not initially rendered');

		this.sut.openBy();

		//Assert
		assert.strictEqual(jQuery('#' + sId).length, 1, 'The menu is rendered on "openBy"');

		this.sut.close();

	});

	QUnit.test('isOpen()', function (assert) {
		// Assert that menu is closed
		assert.strictEqual(this.sut.isOpen(), false, 'Menu is closed');

		// Act - Open menu
		this.sut.openBy();

		// Assert menu is open
		assert.strictEqual(jQuery('#' + this.sut.getId() + "-rp-dialog").length, 1, 'The menu is rendered on "openBy"');
		assert.strictEqual(this.sut.isOpen(), true, 'Menu is open');
	});

	QUnit.test('ARIA attributes', function (assert) {
		var fnGetBackButtonTooltipForPageWithParentSpy = sinon.spy(this.sut.getItems()[0], "_getBackButtonTooltipForPageWithParent");
		// act
		this.sut.openBy();
		pressItemAtIndex.call(this, 0);

		// assert
		assert.strictEqual(fnGetBackButtonTooltipForPageWithParentSpy.called, true, "Back button tooltip must be set.");

		// cleanup
		fnGetBackButtonTooltipForPageWithParentSpy.restore();
	});

	QUnit.test('beforeClose event (phone)', function (assert) {
		var fnFireBeforeCloseSpy = sinon.spy(this.sut, "fireBeforeClose"),
			oCancelButton;

		// Act
		this.sut.openBy();

		oCancelButton = this.sut._getPopover().getEndButton();
		oCancelButton.firePress();

		// Assert
		assert.strictEqual(fnFireBeforeCloseSpy.calledOnce, true, "beforeClose event is fired when the inner Dialog tries to close.");
		assert.notOk(this.sut.isOpen(), "Dialog is closed.");

		// Act
		this.sut.attachBeforeClose(function(oEvent) {
			oEvent.preventDefault();
		});
		this.sut.openBy();

		oCancelButton.firePress();

		// Assert
		assert.strictEqual(fnFireBeforeCloseSpy.calledTwice, true, "beforeClose event is fired when the inner Dialog tries to close.");
		assert.ok(this.sut.isOpen(), "Dialog is not closed.");

		fnFireBeforeCloseSpy.restore();
	});

	QUnit.module('Basics', {
		beforeEach: function () {
			initMenu.call(this);
		},
		afterEach : async function () {
			await destroyMenu.call(this);
		}
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
		this.sut.getItems()[0].$().trigger("click");

		//Assert
		assert.strictEqual(this.sut.getItems()[0].getItems().length, 2, 'The item has sub items');
		assert.strictEqual(fnFireItemSelectedSpy.calledOnce, false, "Item selected event is not fired when item is clicked");

		this.sut.getItems()[1].$().trigger("click");

		//Assert
		assert.strictEqual(this.sut.getItems()[1].getItems().length, 0, 'The item does not have sub items');
		assert.strictEqual(fnFireItemSelectedSpy.calledOnce, true, "Item selected event is fired when item is clicked.");

		fnFireItemSelectedSpy.restore();
	});

	QUnit.test('beforeClose event (non-phone)', function (assert) {
		var fnFireBeforeCloseSpy = sinon.spy(this.sut, "fireBeforeClose"),
			fnFireClosedSpy = sinon.spy(this.sut, "fireClosed");

		// Act
		this.sut.openBy();
		this.sut.getItems()[1].$().trigger("click");

		// Assert
		assert.strictEqual(fnFireBeforeCloseSpy.calledOnce, true, "beforeClose event is fired when item is clicked.");
		assert.strictEqual(fnFireClosedSpy.calledOnce, true, "close method is called when item is clicked.");

		// Act
		this.sut.attachBeforeClose(function(oEvent) {
			oEvent.preventDefault();
		});
		this.sut.openBy();
		this.sut.getItems()[1].$().trigger("click");

		// Assert
		assert.strictEqual(fnFireBeforeCloseSpy.calledTwice, true, "beforeClose event is fired when item is clicked.");
		assert.strictEqual(fnFireClosedSpy.calledOnce, true, "close method is not called when beforeClose event is prevented.");

		fnFireBeforeCloseSpy.restore();
		fnFireClosedSpy.restore();
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
		this.sut.getItems()[2].$().trigger("click");

		//assert
		assert.strictEqual(this.sut.getItems().length, 4, "MenuItem's press event is now handled");
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
			sItemSelector,
			oSecondData,
			sSecondItemId,
			oFirstLevelItem,
			oSecondLevelItem,
			sFirstSubItemId,
			sFirstSubSubItemId;

		this.bindAggregations();
		this.sut.openBy(this.oButton);

		aItems = this.sut.getItems();
		oItem = aItems[0];
		sItemSelector = ".sapMMenu .sapMMenuItemText";

		//Assert
		assert.strictEqual(oItem.getText(), this.getFirstModelData()['items'][0]['text'], 'Correct item is being asserted.');
		assert.strictEqual(jQuery("#" + oItem.getId()).length, 1, 'First item is rendered before model property change.');

		oSecondData = this.getSecondModelData()['items'];

		this.sut.getModel().setProperty('/items', oSecondData);

		aItems = this.sut.getItems();
		oItem = aItems[0];
		sSecondItemId = oItem.getId();

		//Assert
		assert.strictEqual(oItem.getText(), oSecondData[0]['text'], 'Correct item is being asserted.');
		assert.strictEqual(jQuery("#" + sSecondItemId).length, 1, 'Second item is rendered after model property change.');
		assert.strictEqual(jQuery(sItemSelector).length, 2, 'Starting with two items.');

		oFirstLevelItem = this.sut.getItems()[1];
		oSecondLevelItem = oFirstLevelItem.getAggregation('items')[0];

		oFirstLevelItem._openSubmenu();

		oSecondLevelItem._openSubmenu();

		aItems = this.sut.getItems()[1].getItems();
		oItem = aItems[0];
		sFirstSubItemId = oItem.getId();

		//Assert
		assert.strictEqual(oItem.getText(), oSecondData[1]['items'][0]['text'], 'Correct item is being asserted.');
		assert.strictEqual(jQuery("#" + sFirstSubItemId).length, 1, 'First sub item is changed in DOM after model property change.');

		aItems = this.sut.getItems()[1].getItems()[0].getItems();
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
		aItems = this.sut.getItems();
		// get the item that won't fit in the filtered items and should be destroyed
		oItemId = aItems[2].getId();

		// filter the model
		this.sut.getBinding('items').filter(new Filter("type", FilterOperator.EQ, 'world'));
		await nextUIUpdate(this.clock);

		assert.ok(!Element.getElementById(oItemId), 'The item that does not fit in the filter is destroyed');
	});

	QUnit.test("_handleSettingsValue when creating internal controls", async function(assert) {
		var oData = {
				item0: "[test{test1]",
				item1: "[test{test2]",
				item2: "[test test3]"
			},
			oModel = new JSONModel(oData),
			oInternalMenuItems;

		// Act
		this.sut.setModel(oModel);
		this.sut.addItem(new MenuItem({ text: "{/item0}" }));
		this.sut.addItem(new MenuItem({ text: "{/item1}" }));
		this.sut.addItem(new MenuItem({ text: "{/item2}" }));
		this.sut.openBy(this.oButton);
		await nextUIUpdate(this.clock);
		oInternalMenuItems = this.sut.getItems();

		// Assert
		assert.strictEqual(oInternalMenuItems[0].getText(), oData.item0, 'The first item text was escaped with escapeSettingsValue since it is not valid binding string');
		assert.strictEqual(oInternalMenuItems[1].getText(), oData.item1, 'The second item text was escaped with escapeSettingsValue since it is not valid binding string');
		assert.strictEqual(oInternalMenuItems[2].getText(), oData.item2, 'The third item text was not escaped since it is valid binding string');

		// Cleanup
		oModel.destroy();
		oModel = null;
	});

	QUnit.test("_handleSettingsValue when creating internal controls binding i18n text", async function(assert) {
		var i18n = new ResourceModel({
				bundleName: "resourceroot.data.i18n.i18n_menu"
			}),
			oInternalMenuItems;

		// Act
		this.sut.setModel(i18n, "i18n");
		this.sut.addItem(new MenuItem({ text: "{i18n>MENU_ITEM1}" }));
		await nextUIUpdate(this.clock);
		this.sut.openBy(this.oButton);
		await nextUIUpdate(this.clock);
		oInternalMenuItems = this.sut.getItems();

		// Assert
		assert.strictEqual(oInternalMenuItems[0].getText(), "menu item1", 'The first item text was not escaped since it is a valid binding string');

		// Cleanup
		i18n.destroy();
		i18n = null;
	});

	QUnit.module("EndContent accessibility functions", {
		beforeEach: function () {
			this.oMenu = new Menu();
		},
		afterEach: async function () {
			this.oMenu.destroy();
			this.oMenu = null;
			await nextUIUpdate(this.clock);

		}
	});

	QUnit.test("EndContent is propagated properly when binding with binding string", async function (oAssert) {
		// Arrange
		var oModel = new JSONModel([{
				icon : 'sap-icon://open-folder'
			},{
				icon : 'sap-icon://open-folder'
			}]),
			oMenu = new Menu({
				id: "menu",
				items: {
					path:"myModel>/",
					template:new MenuItem({
						text:"test",
						endContent : [
							new Button({
								icon:"{path:'myModel>icon'}"
							})
						]
					})
				}
			}),
			oItemEndContent,
			oButton = new Button();

		oMenu.setModel(oModel, "myModel");

		oButton.placeAt('qunit-fixture');
		await nextUIUpdate(this.clock);

		// Act
		oMenu.openBy(oButton);
		oItemEndContent = oMenu.getItems()[0].getEndContent()[0];

		// Assert
		oAssert.strictEqual(oItemEndContent.getIcon(), oModel.getData()[0].icon, "Source data is propagated property to the target data");

		// Act
		oMenu.getItems()[0].getEndContent()[0].setIcon("sap-icon://home");

		// Assert
		oAssert.strictEqual(oItemEndContent.getIcon(), "sap-icon://home", "Source data is propagated property to the target data");

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
		var oMenu = this.sut,
			aItems = oMenu.getItems();

		//Assert
		assert.strictEqual(aItems[0].getDomRef().querySelector(".sapMMenuItemShortcut").innerHTML, aItems[0].getShortcutText(), "Shortcut Text of the first MenuItem is rendered");
		assert.notOk(aItems[1].getDomRef().querySelector(".sapMMenuItemShortcut"), "Shortcut Text of the second MenuItem is not rendered, because it has submenu");
		assert.notOk(aItems[2].getDomRef().querySelector(".sapMMenuItemShortcut"), "Shortcut Text of the third MenuItem is not rendered because it has no value");

	});

	QUnit.test("Accessibility", function(assert) {
		var oMenu = this.sut,
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

	QUnit.test("All items (including those in groups) are rendered", async function(assert) {
		// Act
		this.oMenu.openBy();
		await nextUIUpdate(this.clock);

		// Assert
		assert.equal(this.oMenu._getItems().length, 13, "Total number of items is correct");
		assert.equal(this.oMenu._getPopover().getDomRef().querySelectorAll(".sapMMenuItem").length, 13, "All items are rendered");
	});

	QUnit.test("Items selection in single-selection group", async function(assert) {
		var oGroup = this.oMenu.getItems()[3],
			aItems = oGroup.getItems();

		// Act - select one item
		this.oMenu.openBy();
		aItems[0].setSelected(true);
		await nextUIUpdate(this.clock);

		// Assert
		assert.equal(aItems[0].getDomRef().getAttribute("aria-checked"), "true", "First item has 'aria-checked' attribute set");
		assert.ok(aItems[0].getDomRef().querySelector(".sapMMenuItemSelected"), "First item has selection mark rendered");

		// Act - deselect selected item
		aItems[0].setSelected(false);
		await nextUIUpdate(this.clock);

		// Assert
		assert.notOk(aItems[0].getDomRef().getAttribute("aria-checked"), "First item has no 'aria-checked' attribute set");
		assert.notOk(aItems[0].getDomRef().querySelector(".sapMMenuItemSelected"), "First item has no selection mark rendered");

		// Act - select more than one item
		aItems[0].setSelected(true);
		aItems[1].setSelected(true);
		aItems[2].setSelected(true);
		await nextUIUpdate(this.clock);

		// Assert
		assert.notOk(aItems[0].getDomRef().getAttribute("aria-checked"), "First item has no 'aria-checked' attribute set");
		assert.notOk(aItems[0].getDomRef().querySelector(".sapMMenuItemSelected"), "First item has no selection mark rendered");
		assert.notOk(aItems[1].getDomRef().getAttribute("aria-checked"), "Second item has no 'aria-checked' attribute set");
		assert.notOk(aItems[1].getDomRef().querySelector(".sapMMenuItemSelected"), "Second item has no selection mark rendered");
		assert.equal(aItems[2].getDomRef().getAttribute("aria-checked"), "true", "Third item has 'aria-checked' attribute set");
		assert.ok(aItems[2].getDomRef().querySelector(".sapMMenuItemSelected"), "Third item has selection mark rendered");
	});

	QUnit.test("Items selection in multi-selection group", async function(assert) {
		var oGroup = this.oMenu.getItems()[4],
			aItems = oGroup.getItems();

		// Act - select one item
		this.oMenu.openBy();
		aItems[0].setSelected(true);
		await nextUIUpdate(this.clock);

		// Assert
		assert.equal(aItems[0].getDomRef().getAttribute("aria-checked"), "true", "First item has 'aria-checked' attribute set");
		assert.ok(aItems[0].getDomRef().querySelector(".sapMMenuItemSelected"), "First item has selection mark rendered");

		// Act - deselect selected item
		aItems[0].setSelected(false);
		await nextUIUpdate(this.clock);

		// Assert
		assert.notOk(aItems[0].getDomRef().getAttribute("aria-checked"), "First item has no 'aria-checked' attribute set");
		assert.notOk(aItems[0].getDomRef().querySelector(".sapMMenuItemSelected"), "First item has no selection mark rendered");

		// Act - select more than one item
		aItems[0].setSelected(true);
		aItems[1].setSelected(true);
		aItems[2].setSelected(true);
		await nextUIUpdate(this.clock);

		// Assert
		assert.equal(aItems[0].getDomRef().getAttribute("aria-checked"), "true", "First item has 'aria-checked' attribute set");
		assert.ok(aItems[0].getDomRef().querySelector(".sapMMenuItemSelected"), "First item has selection mark rendered");
		assert.equal(aItems[1].getDomRef().getAttribute("aria-checked"), "true", "Second item has 'aria-checked' attribute set");
		assert.ok(aItems[1].getDomRef().querySelector(".sapMMenuItemSelected"), "Second item has selection mark rendered");
		assert.equal(aItems[2].getDomRef().getAttribute("aria-checked"), "true", "Third item has 'aria-checked' attribute set");
		assert.ok(aItems[2].getDomRef().querySelector(".sapMMenuItemSelected"), "Third item has selection mark rendered");
	});

	QUnit.test("Items selection in group with no selection set", async function(assert) {
		var oGroup = this.oMenu.getItems()[5],
			oItem0 = oGroup.getItems()[0];

		// Act - select one item
		this.oMenu.openBy();

		oItem0.setSelected(true);
		await nextUIUpdate(this.clock);

		// Assert
		assert.notOk(oItem0.getDomRef().getAttribute("aria-checked"), "First item has no 'aria-checked' attribute set");
		assert.notOk(oItem0.getDomRef().querySelector(".sapMMenuItemSelected"), "First item has no selection mark rendered");

		// Act - deselect selected item
		oItem0.setSelected(false);
		await nextUIUpdate(this.clock);

		// Assert
		assert.notOk(oItem0.getDomRef().getAttribute("aria-checked"), "First item has no 'aria-checked' attribute set");
		assert.notOk(oItem0.getDomRef().querySelector(".sapMMenuItemSelected"), "First item has no selection mark rendered");
	});

	QUnit.test("Items selection of item outside of a group", async function(assert) {
		var oItem0 = this.oMenu.getItems()[0];

		// Act - select one item
		this.oMenu.openBy();

		oItem0.setSelected(true);
		await nextUIUpdate(this.clock);

		// Assert
		assert.notOk(oItem0.getDomRef().getAttribute("aria-checked"), "First item has no 'aria-checked' attribute set");
		assert.notOk(oItem0.getDomRef().querySelector(".sapMMenuItemSelected"), "First item has no selection mark rendered");

		// Act - deselect selected item
		oItem0.setSelected(false);
		await nextUIUpdate(this.clock);

		// Assert
		assert.notOk(oItem0.getDomRef().getAttribute("aria-checked"), "First item has no 'aria-checked' attribute set");
		assert.notOk(oItem0.getDomRef().querySelector(".sapMMenuItemSelected"), "First item has no selection mark rendered");
	});

	QUnit.test("Items selection with click in single-selection group", async function(assert) {
		var oGroup = this.oMenu.getItems()[3],
			aItems = oGroup.getItems();

		// Act - select one item
		this.oMenu.openBy();

		aItems[0].$().trigger("click");
		await nextUIUpdate(this.clock);

		// Assert
		assert.ok(aItems[0].getSelected(), "First item is selected");

		// Act - deselect selected item
		this.oMenu.openBy();
		aItems[1].$().trigger("click");
		await nextUIUpdate(this.clock);

		// Assert
		assert.notOk(aItems[0].getSelected(), "First item is not selected");
		assert.ok(aItems[1].getSelected(), "Second item is selected");
	});

	QUnit.test("Items selection with click in multi-selection group", async function(assert) {
		var oGroup = this.oMenu.getItems()[4],
			aItems = oGroup.getItems();

		// Act - select one item
		this.oMenu.openBy();

		aItems[0].$().trigger("click");
		await nextUIUpdate(this.clock);

		// Assert
		assert.ok(aItems[0].getSelected(), "First item is selected");

		// Act - deselect selected item
		this.oMenu.openBy();
		aItems[1].$().trigger("click");
		await nextUIUpdate(this.clock);

		// Assert
		assert.ok(aItems[0].getSelected(), "First item is selected");
		assert.ok(aItems[1].getSelected(), "Second item is selected");
	});

	QUnit.test("Items selection with click in group with no selection", async function(assert) {
		var oGroup = this.oMenu.getItems()[5],
			oItem0 = oGroup.getItems()[0];

		// Act - select one item
		this.oMenu.openBy();

		oItem0.$().trigger("click");
		await nextUIUpdate(this.clock);

		// Assert
		assert.notOk(oItem0.getSelected(), "First item is not selected");
	});

	QUnit.test("Items selection with click for item outside a group", async function(assert) {
		var oItem0 = this.oMenu.getItems()[0];

		// Act - select one item
		this.oMenu.openBy();

		oItem0.$().trigger("click");
		await nextUIUpdate(this.clock);

		// Assert
		assert.notOk(oItem0.getSelected(), "First item is not selected");
	});

	QUnit.module("Miscellaneous", {
		beforeEach: async function () {
			this.oMenu = new Menu({
				items: [
					new MenuItem("Item1::some-addon::some-more-addon", {
						text: "Item 1"
					}),
					new MenuItem("Item2", {
						text: "Item 2",
						items: [
							new MenuItem("Item21", {
								text: "Item 2.1"
							})
						]
					})
				]
			}).placeAt("qunit-fixture");
			await nextUIUpdate(this.clock);
		},
		afterEach: async function () {
			this.oMenu.destroy();
			this.oMenu = null;
			await nextUIUpdate(this.clock);
		}
	});

	QUnit.test("MenuWrapper's onclick does not throw JS error", async function (assert) {
		// Arrange
		var oMenuWrapper = this.oMenu._getMenuWrapper(),
			oEvent = {
				preventDefault: function () {},
				stopPropagation: function () {}
			};


		this.oMenu.openBy(document.body);
		await nextUIUpdate(this.clock);

		// simulate click on the first menu item
		oEvent.target = this.oMenu.getItems()[0].getDomRef();

		try {
			oMenuWrapper.onclick(oEvent);
			assert.ok(true, "No error thrown in onclick");
		} catch (e) {
			assert.ok(false, "Error thrown: " + e.message);
		}

	});

	QUnit.test("MenuWrapper's _closeOpenedSubmenu does not throw JS error when item set to oOpenedSubmenuParent does not exist anymore", function (assert) {
		// Arrange
		var oMenuWrapper = this.oMenu._getMenuWrapper();

		// set opened submenu parent to an existing item
		oMenuWrapper.oOpenedSubmenuParent = this.oMenu.getItems()[1].getItems()[0];

		// destroy this item
		oMenuWrapper.oOpenedSubmenu = this.oMenu.getItems()[1].destroyAggregation("items");

		try {
			oMenuWrapper._closeOpenedSubmenu();
			assert.ok(true, "No error thrown in _closeOpenedSubmenu");
		} catch (e) {
			assert.ok(false, "Error thrown: " + e.message);
		}

	});

});