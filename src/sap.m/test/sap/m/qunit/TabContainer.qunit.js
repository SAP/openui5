/*global QUnit */
sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/core/ElementRegistry",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/model/json/JSONModel",
	"sap/m/TabContainerItem",
	"sap/m/Text",
	"sap/m/Slider",
	"sap/m/Link",
	"sap/m/TabContainer",
	"sap/m/TabStripItem",
	"sap/ui/core/CustomData",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/Device",
	"sap/m/Button",
	"sap/m/library",
	"sap/ui/thirdparty/jquery"
], function(
	Library,
	ElementRegistry,
	qutils,
	createAndAppendDiv,
	JSONModel,
	TabContainerItem,
	Text,
	Slider,
	Link,
	TabContainer,
	TabStripItem,
	CustomData,
	nextUIUpdate,
	Device,
	Button,
	mobileLibrary,
	jQuery
) {
	"use strict";

	// shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;

	createAndAppendDiv("visible-content").style.paddingLeft = "800px";



	const oModel = new JSONModel({
		"ProductCollection": [
			{
				"ProductId": "1239102",
				"Name": "Power Projector 4713",
				"Category": "Projector",
				"SupplierName": "Titanium",
				"Description": "A very powerful projector with special features for Internet usability, USB",
				"Price": 856.49,
				"CurrencyCode": "EUR"
			},
			{
				"ProductId": "2212-121-828",
				"Name": "Gladiator MX",
				"Category": "Graphics Card",
				"SupplierName": "Technocom",
				"Description": "Gladiator MX: DDR2 RoHS 128MB Supporting 512MB Clock rate: 350 MHz Memory Clock: 533 MHz, Bus Type: PCI-Express, Memory Type: DDR2 Memory Bus: 32-bit Highlighted Features: DVI Out, TV Out , HDTV",
				"Price": 81.7,
				"CurrencyCode": "EUR",
				"modified" : true
			},
			{
				"ProductId": "K47322.1",
				"Name": "Hurricane GX",
				"Category": "Graphics Card",
				"SupplierName": "Red Point Stores",
				"Description": "Hurricane GX: DDR2 RoHS 512MB Supporting 1024MB Clock rate: 550 MHz Memory Clock: 933 MHz, Bus Type: PCI-Express, Memory Type: DDR2 Memory Bus: 64-bit Highlighted Features: DVI Out, TV-In, TV-Out, HDTV",
				"Price": 219,
				"CurrencyCode": "EUR"
			},
			{
				"ProductId": "KTZ-12012.V2",
				"Name": "Deskjet Super Highspeed",
				"Category": "Printer",
				"SupplierName": "Red Point Stores",
				"Description": "1200 dpi x 1200 dpi - up to 25 ppm (mono) / up to 24 ppm (colour) - capacity: 100 sheets - Hi-Speed USB2.0, Ethernet",
				"Price": 117.19,
				"CurrencyCode": "EUR"
			},
			{
				"Name": "Laser Allround Pro",
				"Category": "Printer",
				"SupplierName": "Red Point Stores",
				"Description": "Should be one line in height",
				"Price": 39.99,
				"CurrencyCode": "EUR"
			}
		]
	});

	var oTemplate = new TabContainerItem({
		name: "{Name}",
		modified: "{modified}",
		content: [
			new Text({ text: "{Description}" }),
			new Slider(),
			new Link({ text: "{SupplierName}" })
		]
	});

	QUnit.module("Deletion", {
		beforeEach: async function () {
			this.oTabContainer = new TabContainer({
				items: {
					path: "/ProductCollection",
					template: oTemplate,
					templateShareable: true
				},
				showAddNewButton: true
			});
			this.oTabContainer.setModel(oModel);
			this.oTabContainer.placeAt("qunit-fixture");
			await nextUIUpdate(this.clock);
		},
		afterEach: async function () {
			this.oTabContainer.destroy();
			this.oTabContainer = null;
			await nextUIUpdate(this.clock);
		}
	});

	QUnit.test("Default behavior", function (assert) {
		var oTabStrip = this.oTabContainer._getTabStrip();
		var oFirstItem = this.oTabContainer.getItems()[0];
		var oCloseButton = this.oTabContainer._toTabStripItem(oFirstItem).getAggregation("_closeButton");
		var sName = oFirstItem.getName();

		assert.strictEqual(this.oTabContainer.getSelectedItem(),oFirstItem.getId(),
				"The default selected tab is the first one");

		assert.equal(jQuery( "div." + TabStripItem.CSS_CLASS_LABEL + ":contains(" + sName + ")").length, 1, 'Element with name "' + sName + '" is in the DOM.');
		var aTargetTouches = [{pageX: oCloseButton.$().offset().left + 2}];

		//when removing an item, the _moveToNextItem function is called where the focus is handled
		//triggerTouchEvent removes the item but can't handle the focus part so we need to focus the item
		oTabStrip._oItemNavigation.focusItem(0);
		qutils.triggerTouchEvent('touchstart', oTabStrip.getDomRef(), {changedTouches: aTargetTouches, target: oCloseButton.getDomRef()});
		qutils.triggerTouchEvent('touchend', oTabStrip.getDomRef(), {changedTouches: aTargetTouches, target: oCloseButton.getDomRef()});

		this.clock.tick(1000);

		assert.equal(jQuery( "div." + TabStripItem.CSS_CLASS_LABEL + ":contains(" + sName + ")").length, 1, 'Element with name "' + sName + '" is still in the DOM.');

		var oMessageBundle = Library.getResourceBundleFor("sap.m"),
			oSelectDomRef = this.oTabContainer._getTabStrip().getAggregation('_select').getFocusDomRef();
		assert.strictEqual(jQuery(oSelectDomRef).attr('title'),
				oMessageBundle.getText("TABSTRIP_OPENED_TABS"),
				"The select button tooltip is correct");

		assert.strictEqual(jQuery(this.oTabContainer._getTabStrip().getAggregation('addButton').$()).attr('title'),
				oMessageBundle.getText("TABCONTAINER_ADD_NEW_TAB"),
				"The add button tooltip is correct");

	});

	QUnit.test("Deletion prevented", function (assert) {
		var oItem = this.oTabContainer._getTabStrip().getItems()[0];
		var sName = oItem.getText();

		this.oTabContainer.attachItemClose(function (oEvent) {oEvent.preventDefault();});
		qutils.triggerEvent("tap", oItem.getAggregation('_closeButton').$());

		assert.equal(jQuery( "div." + TabStripItem.CSS_CLASS_LABEL + ":contains(" + sName + ")").length, 1, 'Element with name "' + sName + '" is in the DOM.');
	});

	QUnit.test("removeItem by index should remove item if 0 is passed", function (assert) {
		// prepare
		var oActualRemovedItem,
			oExpectedRemovedItem = this.oTabContainer.getAggregation("items")[0];

		// act
		oActualRemovedItem = this.oTabContainer.removeItem(0);

		// assert
		assert.equal(oActualRemovedItem, oExpectedRemovedItem, "first item should be removed");

		// cleanup
		oActualRemovedItem = null;
		oExpectedRemovedItem = null;
	});

	QUnit.test("removeItem", function(assert) {
		// prepare
		var sSelectedItemId = this.oTabContainer.getSelectedItem(),
			oTabStrip = this.oTabContainer._getTabStrip();

		// act
		this.oTabContainer.removeItem(ElementRegistry.get(sSelectedItemId));

		// assert
		assert.equal(oTabStrip.getSelectedItem(), undefined, "Selected item id is removed");
	});

	QUnit.module("Misc", {
		beforeEach: async function () {
			this.oTabContainer = new TabContainer({
				items: {
					path: "/ProductCollection",
					template: oTemplate,
					templateShareable: true
				}
			});

			this.oTabContainer.setModel(oModel);
			this.oTabContainer.placeAt("qunit-fixture");
			await nextUIUpdate(this.clock);
		},
		afterEach: async function () {
			this.oTabContainer.destroy();
			this.oTabContainer = null;
			await nextUIUpdate(this.clock);
		}
	});

	//BCP:1770122667
	QUnit.test("removeItem works before rendering", function(assert) {
		//arrange
		var bException = false,
			oItem = new TabContainerItem({
				name: 'name1',
				key: 'key1'
			}),
			oTabContainer = new TabContainer({
				items: [oItem]
			});

		//act
		try {
			oTabContainer.removeItem(oItem);
		} catch (e){

			bException = true;
			throw e;
		}

		//assert
		assert.ok(!bException, "removeItem doesn't throw an exception");

		//clean
		oTabContainer.destroy();
	});

	QUnit.test("Initialization without parameters", function (assert) {
		var oTabContainer = new TabContainer();
		assert.strictEqual(typeof oTabContainer === 'object', true, 'Sucessfully initialized.');
		oTabContainer.destroy();
		oTabContainer = null;
	});

	QUnit.test("Rerendering", function (assert) {
		var oTabStrip = this.oTabContainer._getTabStrip();
		assert.ok(oTabStrip.$().hasClass('sapMTabStrip'), 'TabStrip is initially rendered.');
		this.oTabContainer.destroyAggregation('_tabStrip');
		assert.strictEqual(oTabStrip.$().length, 0, 'TabStrip is not re-rendered upon TabContainer re-rendering after TabStrip was destroyed.');
	});

	QUnit.test("F6", function(assert) {
		assert.equal(this.oTabContainer.$().attr("data-sap-ui-fastnavgroup"), "true", 'TabContainer is a fast navigation group.');
	});

	QUnit.test("_initResponsivePaddingsEnablement is called on init", function (assert) {
		// Arrange
		var oSpy = this.spy(TabContainer.prototype, "_initResponsivePaddingsEnablement"),
			oTestPage = new TabContainer({}).placeAt("qunit-fixture");

		// Assert
		assert.strictEqual(oSpy.callCount, 1, "Method _initResponsivePaddingsEnablement called on init of control");
		assert.ok(oSpy.calledOn(oTestPage), "The spy is called on the tested control instance");

		//clean
		oTestPage.destroy();
	});

	QUnit.test("Add button rendering in nested TabContainer with binding", async function (assert) {
		//arrange
		var oTemplate2,
			oTabContainer2,
			oItems;

		oTemplate2 = new TabContainerItem({
			name: "{Name}",
			content:[ new TabContainer({
						showAddNewButton: true,
						items: [
								new TabContainerItem({
									name: "Plus button in nested tab container",
									content: [
										new Text({text: "plus button should be rendered" })
									]
								})
							]
						})
					]
			});

		oTabContainer2 = new TabContainer({
			id: "test",
			showAddNewButton: true,
			items: {
				path: "/ProductCollection",
				template: oTemplate2
			}
		});

		oTabContainer2.setModel(oModel);
		oTabContainer2.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);

		oItems = oTabContainer2.getItems();

		//assert
		assert.ok(oItems[0].getContent()[0].getShowAddNewButton(), "showAddNewButton is set to true");
		assert.strictEqual(oItems[0].getContent()[0]._getTabStrip().$().find(".sapMTSAddNewTabBtn").length, 1, "Add new button is rendered and it is only one");

		// clean up
		oTabContainer2.destroy();
		oTabContainer2 = null;
	});

	QUnit.test("modified property rerenders the control", function(assert) {
		//Arrange
		var oSpy = this.spy(this.oTabContainer.getItems()[0], "invalidate");

		// Act
		this.oTabContainer.getItems()[0].setModified(true);

		// Assert
		assert.equal(oSpy.calledOnce, true, 'Invalidate method called when the modified property is changed.');
	});

	QUnit.test("additionally added customData is forwarded inner items5", async function(assert) {
		//Arrange
		var aItems = this.oTabContainer.getItems(),
			aInnerItems = this.oTabContainer._getTabStrip().getItems();

		// Act
		aItems[0].addCustomData(new CustomData({
			key: "custom0",
			value: "data0",
			writeToDom: true
		}));

		await nextUIUpdate(this.clock);

		// Assert
		assert.strictEqual(aInnerItems[0].getCustomData()[0].getKey(), "custom0", 'Inner item has proper customData key');
		assert.strictEqual(aInnerItems[0].getCustomData()[0].getValue(), "data0", 'Inner item has proper customData value');
		assert.strictEqual(aInnerItems[0].getDomRef().getAttribute("data-custom0"), "data0", 'Inner item has customData value rendered in an attribute');
	});

	QUnit.module("Focus", {
		beforeEach: async function () {
			this.oTabContainer = new TabContainer({
				items: {
					path: "/ProductCollection",
					template: oTemplate,
					templateShareable: true
				}
			});

			this.oTabContainer.setModel(oModel);
			this.oTabContainer.placeAt("qunit-fixture");
			this.oTabStrip = this.oTabContainer._getTabStrip();
			this.items = this.oTabContainer.getItems();
			await nextUIUpdate(this.clock);
		},
		afterEach: async function () {
			this.oTabContainer.destroy();
			this.oTabContainer = null;
			await nextUIUpdate(this.clock);
		}
	});

	QUnit.test("Selection prevented", async function (assert) {
		var oTabContainer = new TabContainer({
			items: {
				path: "/ProductCollection",
				template: oTemplate,
				templateShareable: true
			},
			itemSelect: function (oEvent) {
				oEvent.preventDefault();
			}
		});

		oTabContainer.setModel(oModel);
		oTabContainer.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);

		var oItem = oTabContainer._getTabStrip().getItems()[1];
		var oTabStrip = oTabContainer._getTabStrip();


		assert.strictEqual(oItem.getId() === oTabContainer.getSelectedItem(), false);

		var aTargetTouches = [{pageX: oItem.$().offset().left + 2}];
		qutils.triggerTouchEvent('touchstart', oTabStrip.getDomRef(), {changedTouches: aTargetTouches, target: oItem.getDomRef()}, 'on', true);
		qutils.triggerTouchEvent('touchend', oTabStrip.getDomRef(), {changedTouches: aTargetTouches, target: oItem.getDomRef()}, 'on', true);

		this.clock.tick(1000);

		assert.strictEqual(oItem.getId() === oTabContainer.getSelectedItem(), false);
		oTabContainer.destroy();
		oTabContainer = null;
	});

	QUnit.test("Add button", function (assert) {
		//arrange
		var oButton = new Button("addButton", {
			type: ButtonType.Transparent
		});
		this.oTabContainer.setAddButton(oButton);

		//assert
		assert.strictEqual( this.oTabContainer._getTabStrip().getAddButton().getId(), oButton.getId(),
				"The add button is set");
		assert.strictEqual( this.oTabContainer.getAddButton().getId(), oButton.getId(),
				"The add button is get");
	});

	QUnit.module("Items synchronization", {
		beforeEach: async function () {
			this.oTabContainer = new TabContainer({
			});

			this.oTabContainer.setModel(oModel);
			this.oTabContainer.placeAt("qunit-fixture");
			this.oTabStrip = this.oTabContainer._getTabStrip();
			this.items = this.oTabContainer.getItems();
			await nextUIUpdate(this.clock);
		},
		afterEach: async function () {
			this.oTabContainer.destroy();
			this.oTabContainer = null;
			await nextUIUpdate(this.clock);
		}
	});

	QUnit.test("Insert items", function (assert) {

		this.oTabContainer.destroyItems();
		//assert
		assert.strictEqual( this.oTabContainer._getTabStrip().getItems().length, 0,
				"All items are destroyed");

		//arrange
		this.oTabContainer.insertItem(new TabContainerItem({
					name: "Apple",
					content: new Text({ text: "Apple tab" })
				}),
				0);

		assert.strictEqual( this.oTabContainer._getTabStrip().getItems().length, 1,
				"An item is successfully added");

		this.oTabContainer.removeAllItems();
		//assert
		assert.strictEqual( this.oTabContainer._getTabStrip().getItems().length, 0,
				"All items are removed");
	});


	QUnit.test("TabContainerItems are in sync with TabStripItems when TabContainerItem.key is null", function (assert) {
		var oTabContainerItem;

		//arrange
		oTabContainerItem = new TabContainerItem({
			name: "Ghost"
		});

		//act
		this.oTabContainer.addItem(oTabContainerItem);

		assert.strictEqual(this.oTabContainer._getTabStrip().getItems().length, 1,
				"An item in TabStrip is successfully added");
		assert.strictEqual(this.oTabContainer.getItems().length, 1,
				"An item in TabContainer is successfully added");

		oTabContainerItem.setKey(null);
		this.oTabContainer.removeItem(oTabContainerItem);

		//assert
		assert.strictEqual( this.oTabContainer.getItems().length, 0,
				"Item in TabContainer is removed");
		assert.strictEqual( this.oTabContainer._getTabStrip().getItems().length, 0,
				"Item in TabStrip is removed");

	});

	QUnit.test("TabContainerItem properties are in sync with TabStripItem properties", function (assert) {
		var oTabContainerAddedItem,
			oTabContainerInsertedItem;

		//arrange
		oTabContainerAddedItem = new TabContainerItem({
			name: "Apple",
			additionalText: "test",
			icon: "sap-icon://syringe",
			tooltip: "added item",
			customData: new CustomData({
				key:"customData",
				value:"customValue",
				writeToDom:true
			})
		});
		oTabContainerInsertedItem = new TabContainerItem({
			name: "Apple",
			additionalText: "test",
			icon: "sap-icon://syringe",
			tooltip: "inserted item",
			customData: new CustomData({
				key:"customData",
				value:"customValue",
				writeToDom:true
			})
		});
		this.oTabContainer.addItem(oTabContainerAddedItem);
		this.oTabContainer.insertItem(oTabContainerInsertedItem, 0);

		//act
		oTabContainerAddedItem.setKey(null);
		oTabContainerAddedItem.setModified(!oTabContainerAddedItem.getModified());
		oTabContainerAddedItem.setName("Android");
		oTabContainerAddedItem.setAdditionalText("intro");

		oTabContainerInsertedItem.setKey(null);
		oTabContainerInsertedItem.setModified(!oTabContainerInsertedItem.getModified());
		oTabContainerInsertedItem.setName("Android");
		oTabContainerAddedItem.setIcon("sap-icon://decline");

		//assert
		assert.equal(this.oTabStrip.getItems()[1].getKey(), oTabContainerAddedItem.getId(), "Added TabContainerItem.id should be propagated to TabStripItem.key");
		assert.equal(this.oTabStrip.getItems()[1].getText(), oTabContainerAddedItem.getName(), "Added TabContainerItem.name should be propagated to TabStripItem.text");
		assert.equal(this.oTabStrip.getItems()[1].getAdditionalText(), oTabContainerAddedItem.getAdditionalText(), "Added TabContainerItem.additionalText should be propagated to TabStripItem.additionalText");
		assert.equal(this.oTabStrip.getItems()[1].getIcon(), oTabContainerAddedItem.getIcon(), "Added TabContainerItem.icon should be propagated to TabStripItem.icon");
		assert.equal(this.oTabStrip.getItems()[1].getModified(), oTabContainerAddedItem.getModified(), "Added TabContainerItem.modified should be propagated to TabStripItem.modified");
		assert.equal(this.oTabStrip.getItems()[1].getTooltip(), oTabContainerAddedItem.getTooltip(), "Added TabContainerItem.tooltip should be propagated to TabStripItem.tooltip");
		assert.equal(this.oTabStrip.getItems()[1].getCustomData()[0].getValue(), "customValue", "Added TabContainerItem.customData should be propagated to TabStripItem.customData");

		assert.equal(this.oTabStrip.getItems()[0].getKey(), oTabContainerInsertedItem.getId(), "Inserted TabContainerItem.id should be propagated to TabStripItem.key");
		assert.equal(this.oTabStrip.getItems()[0].getText(), oTabContainerInsertedItem.getName(), "Inserted TabContainerItem.name should be propagated to TabStripItem.text");
		assert.equal(this.oTabStrip.getItems()[0].getAdditionalText(), oTabContainerInsertedItem.getAdditionalText(), "Inserted TabContainerItem.additionalText should be propagated to TabStripItem.additionalText");
		assert.equal(this.oTabStrip.getItems()[0].getIcon(), oTabContainerInsertedItem.getIcon(), "Inserted TabContainerItem.icon should be propagated to TabStripItem.icon");
		assert.equal(this.oTabStrip.getItems()[0].getModified(), oTabContainerInsertedItem.getModified(), "Inserted TabContainerItem.modified should be propagated to TabStripItem.modified");
		assert.equal(this.oTabStrip.getItems()[0].getTooltip(), oTabContainerInsertedItem.getTooltip(), "Inserted TabContainerItem.tooltip should be propagated to TabStripItem.tooltip");
		assert.equal(this.oTabStrip.getItems()[0].getCustomData()[0].getValue(), "customValue", "Inserted TabContainerItem.customData should be propagated to TabStripItem.customData");
	});

	QUnit.module("Constructing with array of items", {
		beforeEach: async function () {
			this.item = new TabContainerItem({
				id: 'test2',
				name: 'test2'
			});

			this.oTabContainer = new TabContainer({
				items: [
					this.item,
					new TabContainerItem({
						id: 'test1',
						name: 'test1'
					}),
					new TabContainerItem({
						id: 'test3',
						name: 'test3'
					})
				],
				selectedItem: this.item
			});

			this.oTabContainer.setModel(oModel);
			this.oTabContainer.placeAt("qunit-fixture");
			this.oTabStrip = this.oTabContainer._getTabStrip();
			this.items = this.oTabContainer.getItems();
			await nextUIUpdate(this.clock);
		},
		afterEach: async function () {
			this.oTabContainer.destroy();
			this.oTabContainer 	= null;
			this.oTabStrip 		= null;
			this.items 			= null;
			this.item 			= null;
			await nextUIUpdate(this.clock);
		}
	});

	QUnit.test("Default selected item", function (assert) {
		//arrange
		var sConstructorSelectedItemName 	= this.item.getName();
		var sContainerSelectedItem 			= this.oTabContainer.getSelectedItem();
		var sSelectSelectedItemText 		= this.oTabContainer._getTabStrip().getAggregation('_select').getSelectedItem().getText();

		assert.strictEqual(sConstructorSelectedItemName, sSelectSelectedItemText, 'Default selected items is the one passed to the constructor.');
		assert.strictEqual(sContainerSelectedItem, sSelectSelectedItemText, 'Default selected items is propagated to the select list.');
	});

	QUnit.test("Selected item association is cleared when items are destroyed.", function (assert) {
		//prepare
		var oTabStripDestroySpy = this.spy(this.oTabContainer._getTabStrip(), "destroyItems");
		//act
		this.oTabContainer.destroyItems();

		//assert
		assert.equal(this.oTabContainer.getSelectedItem(), undefined, 'Selected item should not be set when items are destroyed.');
		assert.equal(oTabStripDestroySpy.callCount, 1, "destroyItems() in TabContainer should call the destryItems() in TabStrip");
	});

	QUnit.module("Others");

	QUnit.test("showAddNewButton", function(assert) {
		// preapre
		var oTabContainer = new TabContainer();

		// act
		oTabContainer.setShowAddNewButton(true);
		// assert
		assert.ok(oTabContainer.getAddButton() !== null, "Add button object is created");

		// act
		oTabContainer.setShowAddNewButton(false);
		// assert
		assert.ok(oTabContainer.getAddButton() === null, "Add button object is destroyed");

		// clean
		oTabContainer.destroy();
	});

	QUnit.test("showAddNewButton on mobile", async function(assert) {
		// preapre
		this.stub(Device.system, "phone").value(true);
		this.stub(Device.system, "desktop").value(false);

		var oTabContainer = new TabContainer({
			showAddNewButton: true
		}).placeAt("qunit-fixture");

		await nextUIUpdate(this.clock);
		jQuery('body').addClass('sap-phone');

		// act
		// assert
		assert.ok(oTabContainer.getDomRef().classList.contains("sapUiShowAddNewButton"), "sapUiShowAddNewButton class is added to the DOM element");

		// clean
		oTabContainer.destroy();
		jQuery('body').removeClass('sap-phone');
		await nextUIUpdate(this.clock);
	});

	QUnit.test("Closing the only item, resets the selected item", async function(assert) {
		//arrange
		var oTabContainer = new TabContainer({
			items: [
				new TabContainerItem({
					id: 'test1',
					name: 'test1',
					content: [
						new Text({text: 'test text'})
					]
				})
			]
		}),
			oTabStripItemToRemove;

		oTabContainer.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);

		//act
		oTabStripItemToRemove = oTabContainer._toTabStripItem(oTabContainer.getItems()[0]);
		oTabContainer._getTabStrip()._removeItem(oTabStripItemToRemove);
		await nextUIUpdate(this.clock);

		//assert
		assert.equal(oTabContainer.getSelectedItem(), undefined, "content is empty after the last tab is closed");

		//clean
		oTabContainer.destroy();
		oTabContainer = null;
		await nextUIUpdate(this.clock);
	});

	QUnit.test("Removing several items from the model keeps a selected item", async function(assert) {
		//arrange
		var oModel = new JSONModel();
		oModel.setData({
			employees: [
				{
					id: 1,
					name: "Jean Doe",
					empFirstName: "Jean",
					empLastName: "Doe",
					salary: 1455.22
				},
				{
					id: 2,
					name: "John Smith",
					empFirstName: "John",
					empLastName: "Smith",
					salary: 1390.77,
					modified: true
				},
				{
					id: 3,
					name: "Particia Clark",
					empFirstName: "Particia",
					empLastName: "Clark",
					salary: 1189.00
				}

			]
		});
		var oTabContainer = new TabContainer({
			items: {
				path: '/employees',
				template: new TabContainerItem({
					key: '{id}',
					name: '{name}'
				})
			}
		});

		oTabContainer.setModel(oModel);
		oTabContainer.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);
		oTabContainer.setSelectedItem(oTabContainer.getItems()[2]);
		var sFirstItemDomId = oTabContainer.getItems()[0].getId();
		await nextUIUpdate(this.clock);

		//act
		var data = oModel.getData();
		data.employees.splice(1, 2); //remove the 2nd and 3rd items
		oModel.setData(data);
		await nextUIUpdate(this.clock);

		//assert
		assert.equal(oTabContainer.getSelectedItem(), sFirstItemDomId, "there is a selected and existing item after removing several items from the model");

		//clean
		oTabContainer.destroy();
		oTabContainer = null;
		oModel = null;
		await nextUIUpdate(this.clock);
	});
});