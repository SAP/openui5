/*global QUnit, sinon */
sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/Device",
	"sap/ui/core/Element",
	"sap/ui/thirdparty/jquery",
	"sap/m/Input",
	"sap/m/Menu",
	"sap/m/MenuItem",
	"sap/m/MenuItemGroup",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/resource/ResourceModel",
	"sap/m/Button",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/Label",
	"sap/ui/events/KeyCodes",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/core/Core"
], function(
	merge,
	Device,
	Element,
	jQuery,
	Input,
	Menu,
	MenuItem,
	MenuItemGroup,
	JSONModel,
	ResourceModel,
	Button,
	Filter,
	FilterOperator,
	Label,
	KeyCodes,
	nextUIUpdate,
	oCore
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

	QUnit.test('open event', function (assert) {
		var fnFireOpenSpy = sinon.spy(this.sut, "fireOpen"),
			done = assert.async();

		this.sut.attachOpen(function() {
			// Assert
			assert.strictEqual(fnFireOpenSpy.calledOnce, true, "open event is fired when menu is opened");
			assert.strictEqual(this.sut.isOpen(), true, "Menu is open when the event is fired");

			fnFireOpenSpy.restore();
			done();
		}.bind(this));

		// Act
		this.sut.openBy();
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

	QUnit.test("Accessibility", async function(assert) {
		var oMenu = this.sut,
			aItems = oMenu.getItems();

		//Assert
		assert.strictEqual(aItems[0].getDomRef().getAttribute("aria-keyshortcuts"), aItems[0].getShortcutText(), "Shortcut Text of the first MenuItem is added as aria-keyshortcuts attribute");
		assert.notOk(aItems[1].getDomRef().getAttribute("aria-keyshortcuts"), "aria-keyshortcuts attribute of the second MenuItem is not rendered, because it has submenu");
		assert.strictEqual(aItems[1].getDomRef().getAttribute("aria-expanded"), "false", "aria-expanded attribute of the second MenuItem is rendered, because it has submenu");
		assert.notOk(aItems[2].getDomRef().getAttribute("aria-keyshortcuts"), "aria-keyshortcuts attribute of the third MenuItem is not rendered because it has no value");

		// Act
		aItems[1].$().trigger("click");
		await nextUIUpdate(this.clock);

		//Assert
		assert.strictEqual(aItems[1].getDomRef().getAttribute("aria-expanded"), "true", "aria-expanded attribute of the second MenuItem is rendered with value true, because it has open submenu");

		// Act
		aItems[1]._closeSubmenu();
		await nextUIUpdate(this.clock);

		//Assert
		assert.strictEqual(aItems[1].getDomRef().getAttribute("aria-expanded"), "false", "aria-expanded attribute of the second MenuItem is rendered with value false, because it has close submenu");
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
		assert.equal(aItems[0].getDomRef().getAttribute("aria-checked"), "false", "First item has 'aria-checked=false' attribute set");
		assert.notOk(aItems[0].getDomRef().querySelector(".sapMMenuItemSelected"), "First item has no selection mark rendered");

		// Act - select more than one item
		aItems[0].setSelected(true);
		aItems[1].setSelected(true);
		aItems[2].setSelected(true);
		await nextUIUpdate(this.clock);

		// Assert
		assert.equal(aItems[0].getDomRef().getAttribute("aria-checked"), "false", "First item has 'aria-checked=false' attribute set");
		assert.notOk(aItems[0].getDomRef().querySelector(".sapMMenuItemSelected"), "First item has no selection mark rendered");
		assert.equal(aItems[1].getDomRef().getAttribute("aria-checked"), "false", "Second item has 'aria-checked=false' attribute set");
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
		assert.equal(aItems[0].getDomRef().getAttribute("aria-checked"), "false", "First item has 'aria-checked=false' attribute set");
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

		// Act - deselect selected item
		this.oMenu.openBy();
		aItems[0].$().trigger({type: "click", shiftKey: true});
		await nextUIUpdate(this.clock);

		// Assert
		assert.ok(aItems[0].getSelected(), "First item is selected");
		assert.notOk(aItems[1].getSelected(), "Second item is not selected");
		assert.ok(this.oMenu.isOpen(), "Menu remains open after item selection in single-selection group");
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

		// Act - deselect selected item
		this.oMenu.openBy();
		aItems[1].$().trigger({type: "click", shiftKey: true});
		await nextUIUpdate(this.clock);

		// Assert
		assert.ok(aItems[0].getSelected(), "First item is selected");
		assert.notOk(aItems[1].getSelected(), "Second item is not selected");
		assert.ok(this.oMenu.isOpen(), "Menu remains open after item selection in multi-selection group");
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

		// Act - deselect selected item
		this.oMenu.openBy();
		oItem0.$().trigger({type: "click", shiftKey: true});
		await nextUIUpdate(this.clock);

		// Assert
		assert.notOk(oItem0.getSelected(), "First item is selected");
		assert.notOk(this.oMenu.isOpen(), "Menu is closed after click on item in group with no selection");
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

	QUnit.test("Group role and aria-label for different itemSelectionMode", async function(assert) {
		this.oMenu.openBy();
		await nextUIUpdate(this.clock);

		var oSingleSelectionGroupDomRef = this.oMenu.getItems()[3].getItems()[0].getDomRef().parentNode,
			oMultiSelectionGroupDomRef = this.oMenu.getItems()[4].getItems()[0].getDomRef().parentNode,
			oNoneSelectionGroupDomRef = this.oMenu.getItems()[5].getItems()[0].getDomRef().parentNode,
			oRb = this.oMenu._getMenuWrapper()._oRb;

		assert.strictEqual(oSingleSelectionGroupDomRef.getAttribute("role"), "group", "Group with itemSelectionMode = SingleSelect has role=group");
		assert.strictEqual(oSingleSelectionGroupDomRef.getAttribute("aria-label"), oRb.getText("MENU_ITEM_GROUP_SINGLE_ACCESSIBLE_NAME"), "Group with itemSelectionMode = SingleSelect has proper aria-label");

		assert.strictEqual(oMultiSelectionGroupDomRef.getAttribute("role"), "group", "Group with itemSelectionMode = MultiSelect has role=group");
		assert.strictEqual(oMultiSelectionGroupDomRef.getAttribute("aria-label"), oRb.getText("MENU_ITEM_GROUP_MULTI_ACCESSIBLE_NAME"), "Group with itemSelectionMode = MultiSelect has proper aria-label");

		assert.strictEqual(oNoneSelectionGroupDomRef.getAttribute("role"), "group", "Group with itemSelectionMode = None has role=group");
		assert.strictEqual(oNoneSelectionGroupDomRef.getAttribute("aria-label"), oRb.getText("MENU_ITEM_GROUP_NONE_ACCESSIBLE_NAME"), "Group with itemSelectionMode = None has proper aria-label");
	});

	QUnit.test("Separator hr element has aria-hidden", async function(assert) {
		this.oMenu.openBy();
		await nextUIUpdate(this.clock);

		assert.strictEqual(this.oMenu._getPopover().getDomRef().querySelector(".sapMMenuSeparator hr").getAttribute("aria-hidden"), "true", "Separator hr element has aria-hidden='true'");
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

	QUnit.test("MenuWrapper's _handleSubmenusAppearance clears stale oOpenedSubmenuParent reference", async function (assert) {
		const oMenuWrapper = this.oMenu._getMenuWrapper();

		this.oMenu.openBy(document.body);
		await nextUIUpdate(this.clock);

		const oStaleItem = new MenuItem({ text: "stale", items: [new MenuItem({ text: "sub" })] });
		oMenuWrapper.oOpenedSubmenuParent = oStaleItem;

		const oCurrentItem = this.oMenu.getItems()[0];

		oMenuWrapper._handleSubmenusAppearance(oCurrentItem, false, false);

		assert.strictEqual(oMenuWrapper.oOpenedSubmenuParent, null,
			"Stale oOpenedSubmenuParent is cleared when item is no longer among current items");

		oStaleItem.destroy();
	});

	QUnit.test("MenuWrapper respects sapUiSizeCompact class", async function (assert) {
		var _bSetCompact = false;

		// Arrange
		if (!document.body.classList.contains("sapUiSizeCompact")) {
			document.body.classList.add("sapUiSizeCompact");
			_bSetCompact = true;
		}

		await nextUIUpdate(this.clock);
		var oMenuWrapper = this.oMenu._getMenuWrapper();

		this.oMenu.openBy(document.body);
		await nextUIUpdate(this.clock);

		assert.ok(oMenuWrapper.hasStyleClass("sapUiSizeCompact"), "menu wrapper has 'sapUiSizeCompact' class");

		// clean up
		if (_bSetCompact) {
			document.body.classList.remove("sapUiSizeCompact");
		}
	});

	QUnit.test("Menu style classes are propagated to inner submenus", async function (assert) {
		// Arrange
		var sCustomClass = "customClass";

		// Act - add custom class to the main menu when it is closed
		this.oMenu.addStyleClass(sCustomClass);
		await nextUIUpdate(this.clock);

		// Assert
		assert.ok(this.oMenu._getPopover().hasStyleClass(sCustomClass), "The class is propagated to the main menu's popover");

		// Act - open the menu and click on the second item to open its submenu
		this.oMenu.openBy(document.body);
		await nextUIUpdate(this.clock);
		this.oMenu.getItems()[1].$().trigger("click");
		await nextUIUpdate(this.clock);

		// Assert - check if the class is propagated to the submenu's popover
		assert.ok(this.oMenu.getItems()[1]._getPopover().hasStyleClass(sCustomClass), "The class is propagated to the submenu's popover");

		// Act - remove the class to the main menu when it is open
		this.oMenu.removeStyleClass(sCustomClass);
		await nextUIUpdate(this.clock);

		// Assert
		assert.notOk(this.oMenu._getPopover().hasStyleClass(sCustomClass), "The class is removed from the main menu's popover");
		assert.notOk(this.oMenu.getItems()[1]._getPopover().hasStyleClass(sCustomClass), "The class is removed from the submenu's popover");

		// Act - add custom class to the main menu when it is opened and the submenu is opened
		this.oMenu.addStyleClass(sCustomClass);
		await nextUIUpdate(this.clock);

		// Assert
		assert.ok(this.oMenu._getPopover().hasStyleClass(sCustomClass), "The class is propagated to the main menu's popover");
		assert.ok(this.oMenu.getItems()[1]._getPopover().hasStyleClass(sCustomClass), "The class is propagated to the submenu's popover");
	});

	QUnit.test("'openAsContextMenu' positions menu properly when different type of objects are provided", async function (assert) {
		// Arrange
		var oOffsetCoordinates = { offsetX: 100, offsetY: 200 },
			oWrongCoordinates1 = { offsetX: 100, pageY: 40 },
			oWrongCoordinates2 = { offsetY: 200, pageX: 20 },
			oOpener;

		// Act
		this.oMenu.openAsContextMenu(oOffsetCoordinates);
		await nextUIUpdate(this.clock);
		oOpener = this.oMenu._getPopover()._oControl._getOpenByDomRef();

		// Assert
		assert.strictEqual(oOpener.style.insetInlineStart, oOffsetCoordinates.offsetX + "px", "[offsetX/offsetY only] X coordinate is set correctly");
		assert.strictEqual(oOpener.style.insetBlockStart, oOffsetCoordinates.offsetY + "px", "[offsetX/offsetY only] Y coordinate is set correctly");

		// Act
		this.oMenu.openAsContextMenu(oWrongCoordinates1);
		await nextUIUpdate(this.clock);
		oOpener = this.oMenu._getPopover()._oControl._getOpenByDomRef();

		// Assert
		assert.strictEqual(oOpener.style.insetInlineStart, "0px", "object containing just offsetX  - X coordinate is set to 0px");
		assert.strictEqual(oOpener.style.insetBlockStart, "0px", "object containing just offsetX  - Y coordinate is set to 0px");

		// Act
		this.oMenu.openAsContextMenu(oWrongCoordinates2);
		await nextUIUpdate(this.clock);
		oOpener = this.oMenu._getPopover()._oControl._getOpenByDomRef();

		// Assert
		assert.strictEqual(oOpener.style.insetInlineStart, "0px", "object containing just offsetY  - X coordinate is set to 0px");
		assert.strictEqual(oOpener.style.insetBlockStart, "0px", "object containing just offsetY  - Y coordinate is set to 0px");
	});

	QUnit.test("'openAsContextMenu' positions menu properly when PointerEvent object is provided", async function (assert) {
		var oButton = new Button({
				text: "Button"
			}),
			oPointerEvent = {
				type: "contextmenu",
				button: 2 // right click
			},
			oButtonDomRef,
			oOpener,
			oQunitFixture = document.getElementById("qunit-fixture");

		// Arrange

		oQunitFixture.style.top = "0px"; // first move qunit-fixture to "known" position
		oQunitFixture.style.left = "0px";

		oButton.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);
		oButtonDomRef = oButton.getDomRef();

		// Simulate a right-click at specific coordinates relative to the button
		oPointerEvent.target = oButtonDomRef;
		oPointerEvent.pageX = 10; // 10px from the left edge of the button
		oPointerEvent.pageY = 10; // 10px from the top edge of the button
		oPointerEvent.clientX = 10; // 10px from the left edge of the button
		oPointerEvent.clientY = 10; // 10px from the top edge of the button

		// Act
		this.oMenu.openAsContextMenu(oPointerEvent);
		await nextUIUpdate(this.clock);

		// Get the internal opener element of the popover
		oOpener = this.oMenu._getPopover()._oControl._getOpenByDomRef();

		// Assert
		assert.strictEqual(oOpener.style.insetInlineStart, oPointerEvent.pageX + "px", "X coordinate is set correctly");
		assert.strictEqual(oOpener.style.insetBlockStart, oPointerEvent.pageY + "px", "Y coordinate is set correctly");

		// Cleanup
		oButton.destroy();
		oButton = null;
	});

	QUnit.test("'openAsContextMenu' positions menu properly when different type of objects are provided (RTL)", async function (assert) {
		var oOffsetCoordinates = { offsetX: 100, offsetY: 200 },
			oWrongCoordinates1 = { offsetX: 100, pageY: 40 },
			oWrongCoordinates2 = { offsetY: 200, pageX: 20 },
			oOpener,
			oCoreConfig = oCore.getConfiguration(),
			bOriginalRTL = oCoreConfig.getRTL();

		// enable RTL for the test
		oCoreConfig.setRTL(true);

		// Act
		this.oMenu.openAsContextMenu(oOffsetCoordinates);
		await nextUIUpdate(this.clock);
		oOpener = this.oMenu._getPopover()._oControl._getOpenByDomRef();

		// Assert - insetInlineStart/insetBlockStart should reflect offsetX/offsetY in RTL as well
		assert.strictEqual(oOpener.style.insetInlineStart, oOffsetCoordinates.offsetX + "px", "[offsetX/offsetY only] X coordinate is set correctly (RTL)");
		assert.strictEqual(oOpener.style.insetBlockStart, oOffsetCoordinates.offsetY + "px", "[offsetX/offsetY only] Y coordinate is set correctly (RTL)");

		// Act - malformed objects should fall back to 0px
		this.oMenu.openAsContextMenu(oWrongCoordinates1);
		await nextUIUpdate(this.clock);
		oOpener = this.oMenu._getPopover()._oControl._getOpenByDomRef();

		// Assert
		assert.strictEqual(oOpener.style.insetInlineStart, "0px", "object containing just offsetX  - X coordinate is set to 0px (RTL)");
		assert.strictEqual(oOpener.style.insetBlockStart, "0px", "object containing just offsetX  - Y coordinate is set to 0px (RTL)");

		// Act
		this.oMenu.openAsContextMenu(oWrongCoordinates2);
		await nextUIUpdate(this.clock);
		oOpener = this.oMenu._getPopover()._oControl._getOpenByDomRef();

		// Assert
		assert.strictEqual(oOpener.style.insetInlineStart, "0px", "object containing just offsetY  - X coordinate is set to 0px (RTL)");
		assert.strictEqual(oOpener.style.insetBlockStart, "0px", "object containing just offsetY  - Y coordinate is set to 0px (RTL)");

		// restore original RTL setting
		oCoreConfig.setRTL(bOriginalRTL);
	});

	QUnit.test("'openAsContextMenu' positions menu properly when PointerEvent object is provided (RTL)", async function (assert) {
		var oButton = new Button({
				text: "Button"
			}),
			oPointerEvent = {
				type: "contextmenu",
				button: 2 // right click
			},
			oButtonDomRef,
			oOpener,
			oQunitFixture = document.getElementById("qunit-fixture"),
			oCoreConfig = oCore.getConfiguration(),
			bOriginalRTL = oCoreConfig.getRTL();

		// Arrange
		oQunitFixture.style.top = "0px";
		oQunitFixture.style.left = "0px";

		oButton.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);
		oButtonDomRef = oButton.getDomRef();

		// Simulate a right-click at specific coordinates relative to the button
		oPointerEvent.target = oButtonDomRef;
		oPointerEvent.pageX = 10;
		oPointerEvent.pageY = 10;
		oPointerEvent.clientX = 10;
		oPointerEvent.clientY = 10;

		// enable RTL for the test
		oCoreConfig.setRTL(true);

		// Act
		this.oMenu.openAsContextMenu(oPointerEvent);
		await nextUIUpdate(this.clock);

		// Get the internal opener element of the popover
		oOpener = this.oMenu._getPopover()._oControl._getOpenByDomRef();

		// Compute expected values according to RTL calculation in the implementation
		var oOpenerData = oButtonDomRef.getBoundingClientRect(),
			iScrollX = document.documentElement.scrollLeft || document.body.scrollLeft,
			iScrollY = document.documentElement.scrollTop || document.body.scrollTop,
			iPageX = (oPointerEvent.pageX || oPointerEvent.clientX) + iScrollX,
			iPageY = (oPointerEvent.pageY || oPointerEvent.clientY) + iScrollY,
			// RTL expected: distance from opener's right edge to pointer
			iExpectedX = document.getElementById("qunit-fixture").getBoundingClientRect().width - Math.round(iPageX - (oOpenerData.right + iScrollX)),
			iExpectedY = Math.round(iPageY - (oOpenerData.top + iScrollY));

		assert.strictEqual(oOpener.style.insetInlineStart, iExpectedX + "px", "X coordinate is set correctly (RTL)");
		assert.strictEqual(oOpener.style.insetBlockStart, iExpectedY + "px", "Y coordinate is set correctly (RTL)");

		// Cleanup & restore RTL
		oButton.destroy();
		oCoreConfig.setRTL(bOriginalRTL);
	});

	QUnit.test("'openAsContextMenu' does not remove pointer element of another menu instance", async function (assert) {
		// Prepare
		const oMenu2 = new Menu({
			items: [new MenuItem({ text: "Second menu item" })]
		}).placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);

		const oEvent = {
			type: "contextmenu",
			button: 2,
			pageX: 10,
			pageY: 10,
			clientX: 10,
			clientY: 10
		};

		// Act — open first menu
		this.oMenu.openAsContextMenu(oEvent);
		await nextUIUpdate(this.clock);

		const oFirstPointer = this.oMenu._oPointerElement;
		assert.ok(oFirstPointer && oFirstPointer.isConnected, "First menu's pointer element is in the DOM");

		// Act — open second menu while first is still open
		oMenu2.openAsContextMenu(oEvent);
		await nextUIUpdate(this.clock);

		// Assert — first menu's pointer is gone (it closed), second menu has its own pointer
		assert.ok(oMenu2._oPointerElement && oMenu2._oPointerElement.isConnected, "Second menu's pointer element is in the DOM");
		assert.notEqual(oMenu2._oPointerElement, oFirstPointer, "Second menu uses its own pointer element, not the first menu's");

		// Act — close the second menu and verify its pointer is cleaned up
		oMenu2.close();
		await nextUIUpdate(this.clock);

		assert.notOk(oMenu2._oPointerElement, "Second menu's pointer element is cleared after close");

		// Cleanup
		oMenu2.destroy();
	});

	QUnit.test("focus management", async function (assert) {
		// Arrange
		const oMenu = this.oMenu;
		var oStub = this.stub(oMenu, "_openDuration").value(null);
		const oButton = new Button({
				text: "Open Menu"
			});
		const oInput = new Input();

		oButton.placeAt("qunit-fixture");
		oInput.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);

		// Act - open the menu
		oMenu.openBy(oButton);
		await nextUIUpdate(this.clock);

		// Act - close the menu
		oInput.getFocusDomRef().focus();
		await nextUIUpdate(this.clock);

		// Assert - focus is on the input field
		assert.strictEqual(document.activeElement, oInput.getFocusDomRef(), "Focus is on input");
		assert.notStrictEqual(document.activeElement, oButton.getDomRef(), "Button is not allowed to have focus");

		// Act - open the menu
		oMenu.openBy(oButton);
		await nextUIUpdate(this.clock);

		// Act - select the first item in the menu and close the menu
		oMenu.getItems()[0].$().trigger("click");
		await nextUIUpdate(this.clock);

		// Assert - focus is on the button
		assert.notStrictEqual(document.activeElement, oInput.getFocusDomRef(), "Focus is not on input");
		assert.strictEqual(document.activeElement, oButton.getDomRef(), "Button is allowed to have focus");

		// Act - open the menu again
		oMenu.openBy(oButton);
		await nextUIUpdate(this.clock);

		// Act - close the menu with ESCAPE key
		oMenu.getItems()[0].$().trigger({type: "keydown", keyCode: KeyCodes.ESCAPE});
		await nextUIUpdate(this.clock);

		// Assert - focus is back on the button
		assert.notStrictEqual(document.activeElement, oInput.getFocusDomRef(), "Focus is not on input");
		assert.strictEqual(document.activeElement, oButton.getDomRef(), "Button is allowed to have focus");

		oMenu.destroy();
		oButton.destroy();
		oInput.destroy();
		oStub.restore();
	});

	QUnit.test("F2 on EndContent item should focus the parent menu item", async function (assert) {
		// Arrange
		const oPressSpy = sinon.spy();
		const oMenu = new Menu({
				items: [
					new MenuItem({
						text: "Item with EndContent",
						endContent: [
							new Button({
								icon: "sap-icon://accept",
								press: oPressSpy
							})
						]
					})
				]
			}),
			oButton = new Button({ text: "Open Menu" }).placeAt("qunit-fixture");

		await nextUIUpdate(this.clock);

		oMenu.openBy(oButton);
		await nextUIUpdate(this.clock);

		const oEndContentButton = oMenu.getItems()[0].getEndContent()[0];
		const $EndContentButton = jQuery(oEndContentButton.getDomRef());

		// Ensure the first menu item is focused/hovered
		const oItem = oMenu.getItems()[0];
		oItem.getDomRef().focus();
		await nextUIUpdate(this.clock);

		// Navigate to the endContent via Right Arrow
		oItem.$().trigger({ type: "keydown", keyCode: KeyCodes.ARROW_RIGHT });
		await nextUIUpdate(this.clock);

		// Assert focus moved to the endContent button
		assert.strictEqual(document.activeElement, oEndContentButton.getDomRef(), "Focus moved to EndContent button after Right Arrow");

		// Press F2 on the endContent to move focus back to parent menu item
		$EndContentButton.trigger({ type: "keydown", keyCode: KeyCodes.F2 });
		await nextUIUpdate(this.clock);

		// Assert focus returned to the parent menu item
		assert.strictEqual(document.activeElement, oItem.getDomRef(), "F2 on EndContent moved focus back to the parent menu item");

		// Cleanup
		oMenu.destroy();
		oButton.destroy();
		oEndContentButton.destroy();

	});

	QUnit.test("EndContent Button press event fires on mouse and keyboard", async function(assert) {
		// Arrange
		var oPressSpy = sinon.spy();
		var oMenu = new Menu({
				items: [
					new MenuItem({
						text: "Item with EndContent",
						endContent: [
							new Button({
								icon: "sap-icon://accept",
								press: oPressSpy
							})
						]
					})
				]
			}),
			oButton = new Button({ text: "Open Menu" }).placeAt("qunit-fixture");

		await nextUIUpdate(this.clock);

		oMenu.openBy(oButton);
		await nextUIUpdate(this.clock);

		var oEndContentButton = oMenu.getItems()[0].getEndContent()[0];
		var $EndContentButton = jQuery(oEndContentButton.getDomRef());

		// Act: Mouse click
		$EndContentButton.trigger("mousedown");
		$EndContentButton.trigger("mouseup");
		$EndContentButton.trigger("click");
		await nextUIUpdate(this.clock);

		// Assert: Mouse click fires press
		assert.ok(oPressSpy.calledOnce, "Press event fired on mouse click");

		// Act: Keyboard (Enter)
		oMenu.openBy(oButton);
		await nextUIUpdate(this.clock);

		$EndContentButton.trigger({ type: "keydown", key: "Enter", keyCode: 13, which: 13 });
		await nextUIUpdate(this.clock);

		// Assert: Keyboard fires press
		assert.ok(oPressSpy.calledTwice, "Press event fired on keyboard Enter");

		// Cleanup
		oMenu.destroy();
		oButton.destroy();
		oEndContentButton.destroy();
	});

	QUnit.test("MenuItem ariaDescribedBy renders aria-describedby attribute on the DOM element", async function(assert) {
		// Arrange
		const oDescribingLabel = new Label({ text: "Description text" }).placeAt("qunit-fixture"),
			oButton = new Button({ text: "Open Menu" }).placeAt("qunit-fixture"),
			oMenu = new Menu({
				items: [
					new MenuItem({ text: "Item with description" })
				]
			});

		await nextUIUpdate(this.clock);

		const oItem = oMenu.getItems()[0];
		oItem.addAriaDescribedBy(oDescribingLabel);

		oMenu.openBy(oButton);
		await nextUIUpdate(this.clock);

		// Assert
		assert.strictEqual(
			oItem.getDomRef().getAttribute("aria-describedby"),
			oDescribingLabel.getId(),
			"aria-describedby attribute is rendered with the associated label's ID"
		);

		// Cleanup
		oMenu.destroy();
		oButton.destroy();
		oDescribingLabel.destroy();
	});

	QUnit.test("MenuItem ariaDescribedBy with multiple controls renders all IDs in aria-describedby", async function(assert) {
		// Arrange
		const oLabel1 = new Label({ text: "First description" }).placeAt("qunit-fixture"),
			oLabel2 = new Label({ text: "Second description" }).placeAt("qunit-fixture"),
			oButton = new Button({ text: "Open Menu" }).placeAt("qunit-fixture"),
			oMenu = new Menu({
				items: [
					new MenuItem({
						text: "Item with multiple descriptions",
						ariaDescribedBy: [oLabel1, oLabel2]
					})
				]
			});

		await nextUIUpdate(this.clock);

		oMenu.openBy(oButton);
		await nextUIUpdate(this.clock);

		const oItem = oMenu.getItems()[0];
		const sDescribedBy = oItem.getDomRef().getAttribute("aria-describedby") || "";

		// Assert
		assert.ok(sDescribedBy.includes(oLabel1.getId()), "First label's ID is included in aria-describedby");
		assert.ok(sDescribedBy.includes(oLabel2.getId()), "Second label's ID is included in aria-describedby");

		// Cleanup
		oMenu.destroy();
		oButton.destroy();
		oLabel1.destroy();
		oLabel2.destroy();
	});

	QUnit.test("F2 on menu item focuses the first focusable endContent item", async function(assert) {
		// Arrange
		const oMenu = new Menu({
				items: [
					new MenuItem({
						text: "Item with EndContent",
						endContent: [
							new Button({ icon: "sap-icon://accept" })
						]
					})
				]
			}),
			oButton = new Button({ text: "Open Menu" }).placeAt("qunit-fixture");

		await nextUIUpdate(this.clock);

		oMenu.openBy(oButton);
		await nextUIUpdate(this.clock);

		const oItem = oMenu.getItems()[0];
		const oEndContentButton = oItem.getEndContent()[0];

		// Focus the menu item
		oItem.getDomRef().focus();
		await nextUIUpdate(this.clock);

		// Press F2 on the menu item to enter endContent
		oItem.$().trigger({ type: "keydown", keyCode: KeyCodes.F2 });
		await nextUIUpdate(this.clock);

		// Assert
		assert.strictEqual(document.activeElement, oEndContentButton.getDomRef(), "F2 on menu item moves focus to the first focusable endContent item");

		// Cleanup
		oMenu.destroy();
		oButton.destroy();
	});

	QUnit.test("Right Arrow navigates between endContent items", async function(assert) {
		// Arrange
		const oMenu = new Menu({
				items: [
					new MenuItem({
						text: "Item with multiple endContent",
						endContent: [
							new Button({ icon: "sap-icon://accept" }),
							new Button({ icon: "sap-icon://decline" })
						]
					})
				]
			}),
			oButton = new Button({ text: "Open Menu" }).placeAt("qunit-fixture");

		await nextUIUpdate(this.clock);

		oMenu.openBy(oButton);
		await nextUIUpdate(this.clock);

		const oItem = oMenu.getItems()[0];
		const aEndContent = oItem.getEndContent();

		// Focus menu item and navigate to first endContent
		oItem.getDomRef().focus();
		oItem.$().trigger({ type: "keydown", keyCode: KeyCodes.ARROW_RIGHT });
		await nextUIUpdate(this.clock);

		assert.strictEqual(document.activeElement, aEndContent[0].getDomRef(), "Right Arrow from menu item focuses the first endContent item");

		// Navigate to second endContent item
		jQuery(aEndContent[0].getDomRef()).trigger({ type: "keydown", keyCode: KeyCodes.ARROW_RIGHT });
		await nextUIUpdate(this.clock);

		assert.strictEqual(document.activeElement, aEndContent[1].getDomRef(), "Right Arrow moves focus to the next endContent item");

		// Right Arrow on last item should not move focus
		jQuery(aEndContent[1].getDomRef()).trigger({ type: "keydown", keyCode: KeyCodes.ARROW_RIGHT });
		await nextUIUpdate(this.clock);

		assert.strictEqual(document.activeElement, aEndContent[1].getDomRef(), "Right Arrow on the last endContent item keeps focus on that item");

		// Cleanup
		oMenu.destroy();
		oButton.destroy();
	});

	QUnit.test("Left Arrow in endContent moves focus backward or returns to the menu item", async function(assert) {
		// Arrange
		const oMenu = new Menu({
				items: [
					new MenuItem({
						text: "Item with multiple endContent",
						endContent: [
							new Button({ icon: "sap-icon://accept" }),
							new Button({ icon: "sap-icon://decline" })
						]
					})
				]
			}),
			oButton = new Button({ text: "Open Menu" }).placeAt("qunit-fixture");

		await nextUIUpdate(this.clock);

		oMenu.openBy(oButton);
		await nextUIUpdate(this.clock);

		const oItem = oMenu.getItems()[0];
		const aEndContent = oItem.getEndContent();

		// Navigate to first endContent, then Right Arrow to second
		oItem.getDomRef().focus();
		oItem.$().trigger({ type: "keydown", keyCode: KeyCodes.ARROW_RIGHT });
		await nextUIUpdate(this.clock);

		jQuery(aEndContent[0].getDomRef()).trigger({ type: "keydown", keyCode: KeyCodes.ARROW_RIGHT });
		await nextUIUpdate(this.clock);

		assert.strictEqual(document.activeElement, aEndContent[1].getDomRef(), "Focus is on second endContent item");

		// Left Arrow from second goes back to first
		jQuery(aEndContent[1].getDomRef()).trigger({ type: "keydown", keyCode: KeyCodes.ARROW_LEFT });
		await nextUIUpdate(this.clock);

		assert.strictEqual(document.activeElement, aEndContent[0].getDomRef(), "Left Arrow moves focus to the previous endContent item");

		// Left Arrow from first returns focus to the menu item
		jQuery(aEndContent[0].getDomRef()).trigger({ type: "keydown", keyCode: KeyCodes.ARROW_LEFT });
		await nextUIUpdate(this.clock);

		assert.strictEqual(document.activeElement, oItem.getDomRef(), "Left Arrow on the first endContent item returns focus to the menu item");

		// Cleanup
		oMenu.destroy();
		oButton.destroy();
	});

	QUnit.test("Tab key cycles forward through endContent items", async function(assert) {
		// Arrange
		const oMenu = new Menu({
				items: [
					new MenuItem({
						text: "Item with multiple endContent",
						endContent: [
							new Button({ icon: "sap-icon://accept" }),
							new Button({ icon: "sap-icon://decline" })
						]
					})
				]
			}),
			oButton = new Button({ text: "Open Menu" }).placeAt("qunit-fixture");

		await nextUIUpdate(this.clock);

		oMenu.openBy(oButton);
		await nextUIUpdate(this.clock);

		const oItem = oMenu.getItems()[0];
		const aEndContent = oItem.getEndContent();

		// Navigate to first endContent via Right Arrow
		oItem.getDomRef().focus();
		oItem.$().trigger({ type: "keydown", keyCode: KeyCodes.ARROW_RIGHT });
		await nextUIUpdate(this.clock);

		assert.strictEqual(document.activeElement, aEndContent[0].getDomRef(), "Focus is on first endContent item");

		// Tab moves to second endContent item
		jQuery(aEndContent[0].getDomRef()).trigger({ type: "keydown", keyCode: KeyCodes.TAB });
		await nextUIUpdate(this.clock);

		assert.strictEqual(document.activeElement, aEndContent[1].getDomRef(), "Tab moves focus to the next endContent item");

		// Tab from last item wraps to first
		jQuery(aEndContent[1].getDomRef()).trigger({ type: "keydown", keyCode: KeyCodes.TAB });
		await nextUIUpdate(this.clock);

		assert.strictEqual(document.activeElement, aEndContent[0].getDomRef(), "Tab from the last endContent item wraps focus back to the first");

		// Cleanup
		oMenu.destroy();
		oButton.destroy();
	});

	QUnit.test("Shift+Tab key cycles backward through endContent items", async function(assert) {
		// Arrange
		const oMenu = new Menu({
				items: [
					new MenuItem({
						text: "Item with multiple endContent",
						endContent: [
							new Button({ icon: "sap-icon://accept" }),
							new Button({ icon: "sap-icon://decline" })
						]
					})
				]
			}),
			oButton = new Button({ text: "Open Menu" }).placeAt("qunit-fixture");

		await nextUIUpdate(this.clock);

		oMenu.openBy(oButton);
		await nextUIUpdate(this.clock);

		const oItem = oMenu.getItems()[0];
		const aEndContent = oItem.getEndContent();

		// Navigate to first endContent
		oItem.getDomRef().focus();
		oItem.$().trigger({ type: "keydown", keyCode: KeyCodes.ARROW_RIGHT });
		await nextUIUpdate(this.clock);

		// Shift+Tab from first item wraps to last
		jQuery(aEndContent[0].getDomRef()).trigger({ type: "keydown", keyCode: KeyCodes.TAB, shiftKey: true });
		await nextUIUpdate(this.clock);

		assert.strictEqual(document.activeElement, aEndContent[1].getDomRef(), "Shift+Tab from the first endContent item wraps focus to the last");

		// Shift+Tab from last goes to first
		jQuery(aEndContent[1].getDomRef()).trigger({ type: "keydown", keyCode: KeyCodes.TAB, shiftKey: true });
		await nextUIUpdate(this.clock);

		assert.strictEqual(document.activeElement, aEndContent[0].getDomRef(), "Shift+Tab moves focus to the previous endContent item");

		// Cleanup
		oMenu.destroy();
		oButton.destroy();
	});

	QUnit.test("End key does not throw when a menu item has visible=false", async function (assert) {
		// Arrange
		const oMenu = new Menu({
			items: [
				new MenuItem({ text: "Item 1" }),
				new MenuItem({ text: "Item 2", visible: false }),
				new MenuItem({ text: "Item 3" })
			]
		}).placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);

		oMenu.openBy(document.body);
		await nextUIUpdate(this.clock);

		const oWrapper = oMenu._getMenuWrapper();

		// Act - trigger End key; before the fix this threw a TypeError because
		// _getPrevFocusableItem was called with _getItems().length (3) as the
		// starting index, but iterates over _getVisibleItems() (length 2), so
		// aItems[2] was undefined.
		try {
			oMenu.getItems()[0].$().trigger({ type: "keydown", keyCode: KeyCodes.END });
			await nextUIUpdate(this.clock);
			assert.ok(true, "No error thrown when pressing End with a hidden item in the list");
		} catch (e) {
			assert.ok(false, "Error thrown: " + e.message);
		}

		// Assert - hover lands on the last visible focusable item ("Item 3")
		assert.strictEqual(oWrapper.oHoveredItem, oMenu.getItems()[2],
			"Hovered item is the last visible item after pressing End");

		// Cleanup
		oMenu.destroy();
	});

	QUnit.module("Page navigation", {
		beforeEach: async function () {
			// 6 items: items[0..5], all focusable
			this.oMenu = new Menu({
				items: [
					new MenuItem({ text: "Item 1" }),
					new MenuItem({ text: "Item 2" }),
					new MenuItem({ text: "Item 3" }),
					new MenuItem({ text: "Item 4" }),
					new MenuItem({ text: "Item 5" }),
					new MenuItem({ text: "Item 6" })
				]
			}).placeAt("qunit-fixture");
			await nextUIUpdate(this.clock);

			this.oMenu.openBy(document.body);
			await nextUIUpdate(this.clock);

			this.oWrapper = this.oMenu._getMenuWrapper();
			// 5 visible items → step = 4
			this._oCountStub = sinon.stub(this.oWrapper, "_getVisibleItemCount").returns(5);
		},
		afterEach: async function () {
			this._oCountStub.restore();
			this.oMenu.destroy();
			this.oMenu = null;
			await nextUIUpdate(this.clock);
		}
	});

	QUnit.test("PAGE_DOWN advances by visibleItemCount - 1 steps", function (assert) {
		const aItems = this.oWrapper._getVisibleItems();
		// step=4, from index 0 → lands on index 4
		assert.strictEqual(this.oWrapper._getPageItem(0, true), aItems[4], "PAGE_DOWN from first item lands 4 steps forward");
	});

	QUnit.test("PAGE_DOWN falls back to last item when fewer items remain than a full step", function (assert) {
		const aItems = this.oWrapper._getVisibleItems();
		// step=4, from index 2 → only 3 items remain, lands on last (index 5)
		assert.strictEqual(this.oWrapper._getPageItem(2, true), aItems[5], "PAGE_DOWN lands on last item when step exceeds remaining items");
	});

	QUnit.test("PAGE_DOWN from last item returns undefined", function (assert) {
		// step=4, from index 5 → no items ahead
		assert.strictEqual(this.oWrapper._getPageItem(5, true), undefined, "PAGE_DOWN from last item returns undefined");
	});

	QUnit.test("PAGE_UP advances by visibleItemCount - 1 steps backward", function (assert) {
		const aItems = this.oWrapper._getVisibleItems();
		// step=4, from index 5 → lands on index 1
		assert.strictEqual(this.oWrapper._getPageItem(5, false), aItems[1], "PAGE_UP from last item lands 4 steps backward");
	});

	QUnit.test("PAGE_UP falls back to first item when fewer items remain than a full step", function (assert) {
		const aItems = this.oWrapper._getVisibleItems();
		// step=4, from index 3 → only 3 items before, lands on first (index 0)
		assert.strictEqual(this.oWrapper._getPageItem(3, false), aItems[0], "PAGE_UP lands on first item when step exceeds remaining items");
	});

	QUnit.test("PAGE_UP from first item returns undefined", function (assert) {
		// step=4, from index 0 → no items before
		assert.strictEqual(this.oWrapper._getPageItem(0, false), undefined, "PAGE_UP from first item returns undefined");
	});

	QUnit.test("_navigateToPageItem focuses the target item", function (assert) {
		const aItems = this.oWrapper._getVisibleItems();
		this.oWrapper.oHoveredItem = aItems[0];
		const oFocusStub = sinon.stub(aItems[4].getDomRef(), "focus");

		// step=4, from index 0 → target is index 4
		this.oWrapper._navigateToPageItem(0, true);

		assert.ok(oFocusStub.calledOnce, "focus() is called on the target item");
		assert.strictEqual(this.oWrapper.oHoveredItem, aItems[4], "oHoveredItem is updated to target item");

		oFocusStub.restore();
	});

});