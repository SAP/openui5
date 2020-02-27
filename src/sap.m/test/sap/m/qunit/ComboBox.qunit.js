/*global QUnit */
sap.ui.define([
	"sap/m/ComboBoxBase",
	"sap/m/ComboBox",
	"sap/m/ComboBoxTextField",
	"sap/m/Label",
	"sap/m/Select",
	"sap/ui/core/Item",
	"sap/ui/core/ListItem",
	"sap/ui/layout/form/SimpleForm",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/ODataModel",
	"sap/ui/base/Event",
	"sap/base/Log",
	"sap/base/strings/capitalize",
	"sap/ui/events/KeyCodes",
	"sap/ui/core/util/MockServer",
	"sap/ui/thirdparty/sinon",
	"sap/ui/dom/containsOrEquals",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/Device",
	"sap/m/InputBase",
	"sap/ui/core/library",
	"sap/ui/events/jquery/EventExtension",
	"sap/ui/qunit/qunit-css",
	"sap/ui/thirdparty/qunit",
	"sap/ui/qunit/qunit-junit",
	"sap/ui/qunit/qunit-coverage",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/thirdparty/sinon-qunit"
], function(
	ComboBoxBase,
	ComboBox,
	ComboBoxTextField,
	Label,
	Select,
	Item,
	ListItem,
	SimpleForm,
	JSONModel,
	ODataModel,
	Event,
	Log,
	Capitalize,
	KeyCodes,
	MockServer,
	sinon,
	containsOrEquals,
	createAndAppendDiv,
	Device,
	InputBase,
	coreLibrary,
	EventExtension
) {
	"use strict";

	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;

	// shortcut for sap.ui.core.TextAlign
	var TextAlign = coreLibrary.TextAlign;

	// shortcut for sap.ui.core.OpenState
	var OpenState = coreLibrary.OpenState;

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	document.body.insertBefore(createAndAppendDiv("content"), document.body.firstChild);


	window._setTimeout = this.setTimeout;


	// make jQuery.now work with Sinon fake timers (since jQuery 2.x, jQuery.now caches the native Date.now)
	jQuery.now = function () {
		return Date.now();
	};



	var fnStartMockServer = function (sUri, iAutoRespondAfter) {
		var sMetadataUrl = "test-resources/sap/m/qunit/data/metadata.xml";
		sUri = sUri || "/service/";

		// configure respond to requests delay
		MockServer.config({
			autoRespond: true,
			autoRespondAfter: iAutoRespondAfter || 10
		});

		// create mock server
		var oMockServer = new MockServer({
			rootUri: sUri
		});

		// start and return
		oMockServer.simulate(sMetadataUrl, "test-resources/sap/m/qunit/data");
		oMockServer.start();
		return oMockServer;
	};


	QUnit.test("default values", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "0",
					text: "item 0"
				}),

				new Item({
					key: "1",
					text: "item 1",
					enabled: false
				}),

				new Item({
					key: "2",
					text: "item 2"
				})
			]
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(oComboBox.getName(), "", 'Default name is ""');
		assert.strictEqual(oComboBox.getVisible(), true, "By default the ComboBox control is visible");
		assert.strictEqual(oComboBox.getEnabled(), true, "By default the ComboBox control is enabled");
		assert.strictEqual(oComboBox.getWidth(), "", 'By default the "width" of the ComboBox control is ""');
		assert.strictEqual(oComboBox.getMaxWidth(), "100%", 'By default the "max-width" of the ComboBox control is "100%"');
		assert.ok(oComboBox.getSelectedItem() === null, "By default the selected items of the ComboBox control is null");
		assert.strictEqual(oComboBox.getSelectedItemId(), "", 'By default the selected items id of the ComboBox control is ""');
		assert.strictEqual(oComboBox.getSelectedKey(), "", 'By default the selected key of the ComboBox control is ""');
		assert.strictEqual(oComboBox.getList().getBusyIndicatorDelay(), 0);
		assert.strictEqual(oComboBox.getList().getWidth(), "100%");
		assert.ok(oComboBox.getList().hasStyleClass(oComboBox.getRenderer().CSS_CLASS_COMBOBOXBASE + "List"));
		assert.ok(oComboBox.getList().hasStyleClass(oComboBox.getRenderer().CSS_CLASS_COMBOBOX + "List"));
		assert.strictEqual(oComboBox.getShowSecondaryValues(), false, 'By default the showSecondaryValues property of the ComboBox control is "false"');
		assert.strictEqual(oComboBox.getFilterSecondaryValues(), false, 'By default the filterSecondaryValues property of the ComboBox control is "false"');

		// cleanup
		oComboBox.destroy();
	});

	QUnit.module("setValue()");

	// CSN 0120031469 0000547938 2014
	// do not override the binding for the value property
	QUnit.test("it should not override the value", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			selectedKey: {
				path: "/selected",
				template: "{selected}"
			},

			items: {
				path: "/items",
				template: new Item({
					key: "{value}",
					text: "{text}"
				})
			},

			value: {
				path: "/value"
			}
		});

		// arrange
		var oModel = new JSONModel();
		var mData = {
			"items": [
				{
					"value": "GER",
					"text": "Germany"
				},

				{
					"value": "CU",
					"text": "Cuba"
				}
			],

			"selected": "GER",
			"value": "other value"
		};

		oModel.setData(mData);
		sap.ui.getCore().setModel(oModel);
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(oComboBox.getValue(), "other value");

		// cleanup
		oComboBox.destroy();
		oModel.destroy();
	});

	// BCP 0020751295 0000447582 2016
	QUnit.test("it should update the value after a new binding context is set", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			selectedKey: "b",
			items: {
				path: "items",
				template: new Item({
					key: "{key}",
					text: "{text}"
				})
			}
		});

		// arrange
		var oModel = new JSONModel();
		var mData = {
			"rebum": {
				"items": [
					{
						"key": "a",
						"text": "lorem"
					},
					{
						"key": "b",
						"text": "ipsum"
					}
				]
			},
			"sanctus": {
				"items": [
					{
						"key": "b",
						"text": "dolor"
					},
					{
						"key": "a",
						"text": "sadipscing"
					}
				]
			}
		};

		oModel.setData(mData);
		sap.ui.getCore().setModel(oModel);
		oComboBox.setBindingContext(oModel.getContext("/rebum"));
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(oComboBox.getValue(), "ipsum");

		// act
		oComboBox.setBindingContext(oModel.getContext("/sanctus"));
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(oComboBox.getValue(), "dolor");

		// cleanup
		oComboBox.destroy();
		oModel.destroy();
	});

	QUnit.module("getSelectedItem()");

	QUnit.test("getSelectedItem()", function (assert) {

		// system under test
		var oExpectedItem;
		var oComboBox = new ComboBox({
			items: [
				oExpectedItem = new Item({
					id: "item-id",
					key: "0",
					text: "item 0"
				})
			],

			selectedItem: oExpectedItem
		});

		// assert
		assert.ok(oComboBox.getSelectedItem() === oExpectedItem);
		assert.strictEqual(oComboBox.getSelectedItemId(), "item-id");
		assert.strictEqual(oComboBox.getSelectedKey(), "0");
		assert.ok(oComboBox.getList().getSelectedItem() === oExpectedItem);
		assert.strictEqual(oComboBox.getValue(), "item 0");
		assert.strictEqual(oComboBox.getProperty("value"), "item 0");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("getSelectedItem()", function (assert) {

		// system under test
		var oExpectedItem;
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "0",
					text: "item 0"
				}),

				new Item({
					key: "1",
					text: "item 1"
				}),

				oExpectedItem = new Item({
					id: "item-id",
					key: "2",
					text: "item 2"
				}),

				new Item({
					key: "3",
					text: "item 3"
				})
			],

			selectedItem: "item-id"
		});

		// assert
		assert.ok(oComboBox.getSelectedItem() === oExpectedItem);
		assert.strictEqual(oComboBox.getSelectedItemId(), "item-id");
		assert.strictEqual(oComboBox.getSelectedKey(), "2");
		assert.strictEqual(oComboBox.getValue(), "item 2");
		assert.strictEqual(oComboBox.getProperty("value"), "item 2");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("getSelectedItem()", function (assert) {

		// system under test
		var oExpectedItem;
		var oComboBox = new ComboBox({
			selectedItem: "item-id",
			items: [
				new Item({
					key: "0",
					text: "item 0"
				}),

				new Item({
					key: "1",
					text: "item 1"
				}),

				oExpectedItem = new Item({
					id: "item-id",
					key: "2",
					text: "item 2"
				}),

				new Item({
					key: "3",
					text: "item 3"
				})
			]
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(oComboBox.getSelectedItem() === oExpectedItem);
		assert.strictEqual(oComboBox.getSelectedItemId(), "item-id");
		assert.strictEqual(oComboBox.getSelectedKey(), "2");
		assert.ok(oComboBox.getList().getSelectedItem() === oExpectedItem);
		assert.strictEqual(oComboBox.getValue(), "item 2");
		assert.strictEqual(oComboBox.getProperty("value"), "item 2");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("getSelectedItem()", function (assert) {

		// system under test
		var oExpectedItem;
		var oComboBox = new ComboBox({
			selectedKey: "1",

			items: [
				new Item({
					key: "0",
					text: "item 0"
				}),

				oExpectedItem = new Item({
					id: "item-id",
					key: "1",
					text: "item 1"
				}),

				new Item({
					key: "2",
					text: "item 2"
				})
			]
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(oComboBox.getSelectedItem() === oExpectedItem);
		assert.strictEqual(oComboBox.getSelectedItemId(), "item-id");
		assert.strictEqual(oComboBox.getSelectedKey(), "1");
		assert.ok(oComboBox.getList().getSelectedItem() === oExpectedItem);
		assert.strictEqual(oComboBox.getValue(), "item 1");
		assert.strictEqual(oComboBox.getProperty("value"), "item 1");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("getSelectedItem()", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			items: []
		});

		// assert
		assert.ok(oComboBox.getSelectedItem() === null);
		assert.strictEqual(oComboBox.getSelectedItemId(), "");
		assert.strictEqual(oComboBox.getSelectedKey(), "");
		assert.ok(oComboBox.getList().getSelectedItem() === null);
		assert.strictEqual(oComboBox.getValue(), "");
		assert.strictEqual(oComboBox.getProperty("value"), "");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("getSelectedItem()", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "0",
					text: "item 0"
				}),

				new Item({
					key: "1",
					text: "item 1"
				}),

				new Item({
					key: "2",
					text: "item 2"
				})
			],

			selectedItem: null
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(oComboBox.getSelectedItem() === null);
		assert.strictEqual(oComboBox.getSelectedItemId(), "");
		assert.strictEqual(oComboBox.getSelectedKey(), "");
		assert.ok(oComboBox.getList().getSelectedItem() === null);
		assert.strictEqual(oComboBox.getValue(), "");
		assert.strictEqual(oComboBox.getProperty("value"), "");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("getSelectedItem()", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "0",
					text: "item 0"
				}),

				new Item({
					key: "1",
					text: "item 1"
				}),

				new Item({
					key: "2",
					text: "item 2"
				})
			],

			selectedKey: ""
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(oComboBox.getSelectedItem() === null);
		assert.strictEqual(oComboBox.getSelectedItemId(), "");
		assert.strictEqual(oComboBox.getSelectedKey(), "");
		assert.ok(oComboBox.getList().getSelectedItem() === null);
		assert.strictEqual(oComboBox.getValue(), "");
		assert.strictEqual(oComboBox.getProperty("value"), "");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.module("getSelectedItemId()");

	QUnit.test("getSelectedItemId()", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "0",
					text: "item 0"
				}),

				new Item({
					key: "1",
					text: "item 1"
				}),

				new Item({
					key: "2",
					text: "item 2"
				})
			],

			selectedItemId: undefined
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(oComboBox.getSelectedItem() === null);
		assert.strictEqual(oComboBox.getSelectedItemId(), "");
		assert.strictEqual(oComboBox.getSelectedKey(), "");
		assert.ok(oComboBox.getList().getSelectedItem() === null);
		assert.strictEqual(oComboBox.getValue(), "");
		assert.strictEqual(oComboBox.getProperty("value"), "");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("getSelectedItemId()", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "0",
					text: "item 0"
				}),

				new Item({
					key: "1",
					text: "item 1"
				}),

				new Item({
					key: "2",
					text: "item 2"
				})
			],

			selectedItemId: ""
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(oComboBox.getSelectedItem() === null);
		assert.strictEqual(oComboBox.getSelectedItemId(), "");
		assert.strictEqual(oComboBox.getSelectedKey(), "");
		assert.ok(oComboBox.getList().getSelectedItem() === null);
		assert.strictEqual(oComboBox.getValue(), "");
		assert.strictEqual(oComboBox.getProperty("value"), "");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("getSelectedItemId()", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "5",
					text: "item 5"
				})
			]
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(oComboBox.getSelectedItem() === null);
		assert.strictEqual(oComboBox.getSelectedItemId(), "");
		assert.strictEqual(oComboBox.getSelectedKey(), "");
		assert.ok(oComboBox.getList().getSelectedItem() === null);
		assert.strictEqual(oComboBox.getValue(), "");
		assert.strictEqual(oComboBox.getProperty("value"), "");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("getSelectedItemId()", function (assert) {

		// system under test
		var oExpectedItem;
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "0",
					text: "item 0"
				}),

				new Item({
					key: "1",
					text: "item 1"
				}),

				oExpectedItem = new Item({
					id: "item-id",
					key: "2",
					text: "item 2"
				}),

				new Item({
					key: "3",
					text: "item 3"
				})
			],

			selectedItem: "item-id"
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(oComboBox.getSelectedItem() === oExpectedItem);
		assert.strictEqual(oComboBox.getSelectedItemId(), "item-id");
		assert.strictEqual(oComboBox.getSelectedKey(), "2");
		assert.ok(oComboBox.getList().getSelectedItem() === oExpectedItem);
		assert.strictEqual(oComboBox.getValue(), "item 2");
		assert.strictEqual(oComboBox.getProperty("value"), "item 2");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("getSelectedItemId()", function (assert) {

		// system under test
		var oExpectedItem;
		var oComboBox = new ComboBox({
			selectedItem: "item-id",

			items: [
				new Item({
					key: "0",
					text: "item 0"
				}),

				new Item({
					key: "1",
					text: "item 1"
				}),

				new Item({
					key: "2",
					text: "item 2"
				}),

				oExpectedItem = new Item({
					id: "item-id",
					key: "3",
					text: "item 3"
				})
			]
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(oComboBox.getSelectedItem() === oExpectedItem);
		assert.strictEqual(oComboBox.getSelectedItemId(), "item-id");
		assert.strictEqual(oComboBox.getSelectedKey(), "3");
		assert.ok(oComboBox.getList().getSelectedItem() === oExpectedItem);
		assert.strictEqual(oComboBox.getValue(), "item 3");
		assert.strictEqual(oComboBox.getProperty("value"), "item 3");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("getSelectedItemId()", function (assert) {

		// system under test
		var oExpectedItem;
		var oComboBox = new ComboBox({
			selectedKey: "1",

			items: [
				new Item({
					key: "0",
					text: "item 0"
				}),

				oExpectedItem = new Item({
					id: "item-id",
					key: "1",
					text: "item 1"
				}),

				new Item({
					key: "2",
					text: "item 2"
				})
			]
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(oComboBox.getSelectedItem() === oExpectedItem);
		assert.strictEqual(oComboBox.getSelectedItemId(), "item-id");
		assert.strictEqual(oComboBox.getSelectedKey(), "1");
		assert.ok(oComboBox.getList().getSelectedItem() === oExpectedItem);
		assert.strictEqual(oComboBox.getValue(), "item 1");
		assert.strictEqual(oComboBox.getProperty("value"), "item 1");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("getSelectedItemId()", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			items: []
		});

		// assert
		assert.ok(oComboBox.getSelectedItem() === null);
		assert.strictEqual(oComboBox.getSelectedItemId(), "");
		assert.strictEqual(oComboBox.getSelectedKey(), "");
		assert.ok(oComboBox.getList().getSelectedItem() === null);
		assert.strictEqual(oComboBox.getValue(), "");
		assert.strictEqual(oComboBox.getProperty("value"), "");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("getSelectedItemId()", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "0",
					text: "item 0"
				}),

				new Item({
					key: "1",
					text: "item 1"
				}),

				new Item({
					key: "2",
					text: "item 2"
				})
			],

			selectedItem: null
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(oComboBox.getSelectedItem() === null);
		assert.strictEqual(oComboBox.getSelectedItemId(), "");
		assert.strictEqual(oComboBox.getSelectedKey(), "");
		assert.ok(oComboBox.getList().getSelectedItem() === null);
		assert.strictEqual(oComboBox.getValue(), "");
		assert.strictEqual(oComboBox.getProperty("value"), "");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("getSelectedItemId()", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "0",
					text: "item 0"
				}),

				new Item({
					key: "1",
					text: "item 1"
				}),

				new Item({
					key: "2",
					text: "item 2"
				})
			],

			selectedItemId: undefined
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(oComboBox.getSelectedItem() === null);
		assert.strictEqual(oComboBox.getSelectedItemId(), "");
		assert.strictEqual(oComboBox.getSelectedKey(), "");
		assert.ok(oComboBox.getList().getSelectedItem() === null);
		assert.strictEqual(oComboBox.getValue(), "");
		assert.strictEqual(oComboBox.getProperty("value"), "");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("getSelectedItemId()", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "0",
					text: "item 0"
				}),

				new Item({
					key: "1",
					text: "item 1"
				}),

				new Item({
					key: "2",
					text: "item 2"
				})
			],

			selectedItemId: ""
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(oComboBox.getSelectedItem() === null);
		assert.strictEqual(oComboBox.getSelectedItemId(), "");
		assert.strictEqual(oComboBox.getSelectedKey(), "");
		assert.ok(oComboBox.getList().getSelectedItem() === null);
		assert.strictEqual(oComboBox.getValue(), "");
		assert.strictEqual(oComboBox.getProperty("value"), "");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("getSelectedItemId()", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "0",
					text: "item 0"
				}),

				new Item({
					key: "1",
					text: "item 1"
				}),

				new Item({
					key: "2",
					text: "item 2"
				})
			],

			selectedKey: undefined
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(oComboBox.getSelectedItem() === null);
		assert.strictEqual(oComboBox.getSelectedItemId(), "");
		assert.strictEqual(oComboBox.getSelectedKey(), "");
		assert.ok(oComboBox.getList().getSelectedItem() === null);
		assert.strictEqual(oComboBox.getValue(), "");
		assert.strictEqual(oComboBox.getProperty("value"), "");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("getSelectedItemId()", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "0",
					text: "item 0"
				}),

				new Item({
					key: "1",
					text: "item 1"
				}),

				new Item({
					key: "2",
					text: "item 2"
				})
			],

			selectedKey: ""
		});

		// assert
		assert.ok(oComboBox.getSelectedItem() === null);
		assert.strictEqual(oComboBox.getSelectedItemId(), "");
		assert.strictEqual(oComboBox.getSelectedKey(), "");
		assert.ok(oComboBox.getList().getSelectedItem() === null);
		assert.strictEqual(oComboBox.getValue(), "");
		assert.strictEqual(oComboBox.getProperty("value"), "");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.module("getSelectedKey()");

	QUnit.test("getSelectedKey()", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "0",
					text: "item 0"
				}),

				new Item({
					key: "1",
					text: "item 1"
				}),

				new Item({
					key: "2",
					text: "item 2"
				})
			],

			selectedKey: undefined
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(oComboBox.getSelectedItem() === null);
		assert.strictEqual(oComboBox.getSelectedItemId(), "");
		assert.strictEqual(oComboBox.getSelectedKey(), "");
		assert.ok(oComboBox.getList().getSelectedItem() === null);
		assert.strictEqual(oComboBox.getValue(), "");
		assert.strictEqual(oComboBox.getProperty("value"), "");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("getSelectedKey()", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "0",
					text: "item 0"
				})
			]
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(oComboBox.getSelectedItem() === null);
		assert.strictEqual(oComboBox.getSelectedItemId(), "");
		assert.strictEqual(oComboBox.getSelectedKey(), "");
		assert.ok(oComboBox.getList().getSelectedItem() === null);
		assert.strictEqual(oComboBox.getValue(), "");
		assert.strictEqual(oComboBox.getProperty("value"), "");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("getSelectedKey()", function (assert) {

		// system under test
		var oExpectedItem;
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "0",
					text: "item 0"
				}),

				new Item({
					key: "1",
					text: "item 1"
				}),

				oExpectedItem = new Item({
					id: "item-id",
					key: "2",
					text: "item 2"
				}),

				new Item({
					key: "3",
					text: "item 3"
				})
			],

			selectedItem: "item-id"
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(oComboBox.getSelectedItem() === oExpectedItem);
		assert.strictEqual(oComboBox.getSelectedItemId(), "item-id");
		assert.strictEqual(oComboBox.getSelectedKey(), "2");
		assert.ok(oComboBox.getList().getSelectedItem() === oExpectedItem);
		assert.strictEqual(oComboBox.getValue(), "item 2");
		assert.strictEqual(oComboBox.getProperty("value"), "item 2");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("getSelectedKey()", function (assert) {

		// system under test
		var oExpectedItem;
		var oComboBox = new ComboBox({
			selectedItem: "item-id",

			items: [
				new Item({
					key: "0",
					text: "item 0"
				}),

				new Item({
					key: "1",
					text: "item 1"
				}),

				new Item({
					key: "2",
					text: "item 2"
				}),

				oExpectedItem = new Item({
					id: "item-id",
					key: "3",
					text: "item 3"
				})
			]
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(oComboBox.getSelectedItem() === oExpectedItem);
		assert.strictEqual(oComboBox.getSelectedItemId(), "item-id");
		assert.strictEqual(oComboBox.getSelectedKey(), "3");
		assert.ok(oComboBox.getList().getSelectedItem() === oExpectedItem);
		assert.strictEqual(oComboBox.getValue(), "item 3");
		assert.strictEqual(oComboBox.getProperty("value"), "item 3");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("getSelectedKey()", function (assert) {

		// system under test
		var oExpectedItem;
		var oComboBox = new ComboBox({
			selectedKey: "1",

			items: [
				new Item({
					key: "0",
					text: "item 0"
				}),

				oExpectedItem = new Item({
					id: "item-id",
					key: "1",
					text: "item 1"
				}),

				new Item({
					key: "2",
					text: "item 2"
				})
			]
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(oComboBox.getSelectedItem() === oExpectedItem);
		assert.strictEqual(oComboBox.getSelectedItemId(), "item-id");
		assert.strictEqual(oComboBox.getSelectedKey(), "1");
		assert.ok(oComboBox.getList().getSelectedItem() === oExpectedItem);
		assert.strictEqual(oComboBox.getValue(), "item 1");
		assert.strictEqual(oComboBox.getProperty("value"), "item 1");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("getSelectedKey()", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			items: []
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(oComboBox.getSelectedItem() === null);
		assert.strictEqual(oComboBox.getSelectedItemId(), "");
		assert.strictEqual(oComboBox.getSelectedKey(), "");
		assert.ok(oComboBox.getList().getSelectedItem() === null);
		assert.strictEqual(oComboBox.getValue(), "");
		assert.strictEqual(oComboBox.getProperty("value"), "");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("getSelectedKey()", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "0",
					text: "item 0"
				}),

				new Item({
					key: "1",
					text: "item 1"
				}),

				new Item({
					key: "2",
					text: "item 2"
				})
			],

			selectedItem: null
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(oComboBox.getSelectedItem() === null);
		assert.strictEqual(oComboBox.getSelectedItemId(), "");
		assert.strictEqual(oComboBox.getSelectedKey(), "");
		assert.ok(oComboBox.getList().getSelectedItem() === null);
		assert.strictEqual(oComboBox.getValue(), "");
		assert.strictEqual(oComboBox.getProperty("value"), "");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("getSelectedKey()", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "0",
					text: "item 0"
				}),

				new Item({
					key: "1",
					text: "item 1"
				}),

				new Item({
					key: "2",
					text: "item 2"
				})
			],

			selectedItemId: undefined
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(oComboBox.getSelectedItem() === null);
		assert.strictEqual(oComboBox.getSelectedItemId(), "");
		assert.strictEqual(oComboBox.getSelectedKey(), "");
		assert.ok(oComboBox.getList().getSelectedItem() === null);
		assert.strictEqual(oComboBox.getValue(), "");
		assert.strictEqual(oComboBox.getProperty("value"), "");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("getSelectedKey()", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "0",
					text: "item 0"
				}),

				new Item({
					key: "1",
					text: "item 1"
				}),

				new Item({
					key: "2",
					text: "item 2"
				})
			],

			selectedItemId: ""
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(oComboBox.getSelectedItem() === null);
		assert.strictEqual(oComboBox.getSelectedItemId(), "");
		assert.strictEqual(oComboBox.getSelectedKey(), "");
		assert.ok(oComboBox.getList().getSelectedItem() === null);
		assert.strictEqual(oComboBox.getValue(), "");
		assert.strictEqual(oComboBox.getProperty("value"), "");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("getSelectedKey()", function (assert) {

		// system under test
		var oExpectedItem;
		var oComboBox = new ComboBox({
			items: [
				oExpectedItem = new Item({
					id: "item-id",
					key: "0",
					text: "item 0"
				}),

				new Item({
					key: "1",
					text: "item 1"
				}),

				new Item({
					key: "2",
					text: "item 2"
				})
			],

			selectedKey: "0"
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(oComboBox.getSelectedItem() === oExpectedItem);
		assert.strictEqual(oComboBox.getSelectedItemId(), "item-id");
		assert.strictEqual(oComboBox.getSelectedKey(), "0");
		assert.ok(oComboBox.getList().getSelectedItem() === oExpectedItem);
		assert.strictEqual(oComboBox.getValue(), "item 0");
		assert.strictEqual(oComboBox.getProperty("value"), "item 0");

		// cleanup
		oComboBox.destroy();
	});

	// BCP 1570460580
	QUnit.test("it should synchronize property changes of items to the combo box control", function (assert) {

		// system under test
		var oItem;
		var oComboBox = new ComboBox({
			items: [
				oItem = new Item({
					key: "CU",
					text: "Cuba"
				})
			],
			selectedKey: "CU"
		});

		// act
		oItem.setKey("GER");
		oItem.setText("Germany");

		// assert
		assert.strictEqual(oComboBox.getSelectedKey(), "GER");
		assert.strictEqual(oComboBox.getSelectedItem().getText(), "Germany");
		assert.strictEqual(oComboBox.getValue(), "Germany");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.module("Cancel selection");

	QUnit.test("it should cancel the selection after closing the dialog with close button", function (assert) {
		this.stub(Device, "system", {
			desktop: false,
			phone: true,
			tablet: false
		});

		// system under test
		var oItem1 = new Item({
			text: "Lorem ipsum dolor sit amet, duo ut soleat insolens, commodo vidisse intellegam ne usu"
		}), oItem2 = new Item({
			text: "Lorem ipsum dolor sit amet, duo ut soleat insolens, commodo vidisse intellegam ne usu"
		}), oComboBox = new ComboBox({
			items: [
				oItem1,
				oItem2
			]
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.setSelectedItem(oItem1);
		this.clock.tick(500);

		// act
		oComboBox.open();
		this.clock.tick(500);

		assert.strictEqual(oComboBox.getPickerTextField().getValue(), oItem1.getText(), "Picker's textfield should have value as the selected item's text");

		oComboBox.setSelectedItem(oItem2);
		oComboBox.getPicker().getCustomHeader().getContentRight()[0].firePress();
		this.clock.tick(500);

		assert.equal(oComboBox.getSelectedItem(), oItem1, "First item should be selected");
		assert.strictEqual(oComboBox.getValue(), oItem1.getText(), "Value of the combo box text field should be first item's text");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.module("addItem");

	QUnit.test("addItem()", function (assert) {

		// system under test
		var oComboBox = new ComboBox();

		// arrange
		var fnAddItemSpy = this.spy(oComboBox, "addItem");
		var oItem = new Item({
			key: "0",
			text: "item 0"
		});

		// act
		oComboBox.addItem(oItem);

		// assert
		assert.ok(oComboBox.getFirstItem() === oItem);
		assert.ok(oComboBox.getList().getFirstItem() === oItem);
		assert.ok(fnAddItemSpy.returned(oComboBox));
		assert.ok(oItem.hasListeners("_change"));
		assert.ok(oComboBox.isItemVisible(oItem));

		// cleanup
		oComboBox.destroy();
	});

	// unit test for CSN 0120031469 0000547938 2014
	QUnit.test("addItem()", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			value: "input field value",
			items: [
				new Item({
					text: "item 0"
				})
			]
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(oComboBox.getSelectedItem() === null);
		assert.strictEqual(oComboBox.getSelectedItemId(), "");
		assert.strictEqual(oComboBox.getSelectedKey(), "");
		assert.ok(oComboBox.getList().getSelectedItem() === null);
		assert.strictEqual(oComboBox.getValue(), "input field value");
		assert.strictEqual(oComboBox.getProperty("value"), "input field value");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.module("insertItem");

	QUnit.test("insertItem()", function (assert) {

		// system under test
		var oComboBox = new ComboBox();

		// arrange
		var fnInsertItem = this.spy(oComboBox, "insertItem");
		var oItem = new Item({
			key: "0",
			text: "item 0"
		});

		// act
		oComboBox.insertItem(oItem, 0);

		// assert
		assert.ok(oComboBox.getFirstItem() === oItem);
		assert.ok(oComboBox.getList().getFirstItem() === oItem);
		assert.ok(fnInsertItem.returned(oComboBox), 'oComboBox.insertAggregation() method return the "this" reference');
		assert.ok(oItem.hasListeners("_change"));
		assert.ok(oComboBox.isItemVisible(oItem));

		// cleanup
		oComboBox.destroy();
	});

	QUnit.module("cursorPos()");

	QUnit.test("Check the position of the cursor after an item is pressed", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "GER",
					text: "Germany"
				})
			]
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();
		oComboBox.open();
		this.clock.tick(1000);

		// act
		sap.ui.test.qunit.triggerEvent("tap", oComboBox.getFirstItem().getDomRef());

		// assert
		assert.strictEqual(jQuery(oComboBox.getFocusDomRef()).cursorPos(), 7, "The text cursor is at the endmost position");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.module("setSelectedItem()");

	QUnit.test("setSelectedItem()", function (assert) {

		// system under test
		var oExpectedItem;
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "0",
					text: "item 0"
				}),

				oExpectedItem = new Item({
					id: "item-id",
					key: "1",
					text: "item 1"
				}),

				new Item({
					key: "2",
					text: "item 2",
					enabled: false
				})
			]
		});

		// arrange
		var fnSetPropertySpy = this.spy(oComboBox, "setProperty"),
			fnFireChangeSpy = this.spy(oComboBox, "fireChange"),
			fnSetSelectedItemSpy = this.spy(oComboBox, "setSelectedItem");

		// act
		oComboBox.setSelectedItem(oComboBox.getItemAt(1));

		// assert
		assert.ok(fnSetPropertySpy.calledWith("selectedKey", "1"));
		assert.ok(fnSetPropertySpy.calledWith("selectedItemId", "item-id"));
		assert.ok(oComboBox.getSelectedItem() === oExpectedItem);
		assert.strictEqual(oComboBox.getSelectedItemId(), "item-id");
		assert.strictEqual(oComboBox.getSelectedKey(), "1");
		assert.ok(oComboBox.getList().getSelectedItem() === oExpectedItem);
		assert.strictEqual(oComboBox.getValue(), "item 1");
		assert.strictEqual(oComboBox.getProperty("value"), "item 1");
		assert.strictEqual(jQuery(oComboBox.getFocusDomRef()).attr("aria-activedescendant"), undefined, 'The "aria-activedescendant" attribute is set when the active descendant is rendered and visible');
		assert.ok(fnSetSelectedItemSpy.returned(oComboBox), 'sap.m.ComboBox.prototype.setSelectedItem() method return the "this" reference');
		assert.strictEqual(fnFireChangeSpy.callCount, 0, "The change event was not fired");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("setSelectedItem()", function (assert) {

		// system under test
		var oExpectedItem;
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "0",
					text: "item 0"
				}),

				oExpectedItem = new Item({
					id: "item-id",
					key: "1",
					text: "item 1"
				}),

				new Item({
					key: "2",
					text: "item 2",
					enabled: false
				})
			]
		});

		// arrange
		var fnSetPropertySpy = this.spy(oComboBox, "setProperty"),
			fnSetAssociationSpy = this.spy(oComboBox, "setAssociation"),
			fnFireChangeSpy = this.spy(oComboBox, "fireChange"),
			fnSetSelectedItemSpy = this.spy(oComboBox, "setSelectedItem");

		// act
		oComboBox.setSelectedItem("item-id");

		// assert
		assert.ok(fnSetPropertySpy.calledWith("selectedKey", "1"));
		assert.ok(fnSetPropertySpy.calledWith("selectedItemId", "item-id"));
		assert.ok(fnSetAssociationSpy.calledWith("selectedItem", oExpectedItem));
		assert.ok(oComboBox.getSelectedItem() === oExpectedItem);
		assert.strictEqual(oComboBox.getSelectedItemId(), "item-id");
		assert.strictEqual(oComboBox.getSelectedKey(), "1");
		assert.ok(oComboBox.getList().getSelectedItem() === oExpectedItem);
		assert.strictEqual(oComboBox.getValue(), "item 1");
		assert.strictEqual(oComboBox.getProperty("value"), "item 1");
		assert.strictEqual(jQuery(oComboBox.getFocusDomRef()).attr("aria-activedescendant"), undefined, 'The "aria-activedescendant" attribute is set when the active descendant is rendered and visible');
		assert.ok(fnSetSelectedItemSpy.returned(oComboBox), 'sap.m.ComboBox.prototype.setSelectedItem() method return the "this" reference');
		assert.strictEqual(fnFireChangeSpy.callCount, 0, "The change event was not fired");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("setSelectedItem()", function (assert) {

		// system under test
		var oExpectedItem;
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "0",
					text: "item 0"
				}),

				new Item({
					key: "1",
					text: "item 1"
				}),

				oExpectedItem = new Item({
					id: "item-id",
					key: "2",
					text: "item 2"
				})
			]
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		oComboBox.setSelectedItem(oComboBox.getLastItem());

		// assert
		assert.ok(oComboBox.getSelectedItem() === oExpectedItem);
		assert.strictEqual(oComboBox.getSelectedItemId(), "item-id");
		assert.strictEqual(oComboBox.getSelectedKey(), "2");
		assert.ok(oComboBox.getList().getSelectedItem() === oExpectedItem);
		assert.strictEqual(oComboBox.getValue(), "item 2");
		assert.strictEqual(oComboBox.getProperty("value"), "item 2");
		assert.strictEqual(jQuery(oComboBox.getFocusDomRef()).attr("aria-activedescendant"), undefined, 'The "aria-activedescendant" attribute is set when the active descendant is rendered and visible');

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("setSelectedItem()", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "0",
					text: "item 0"
				}),

				new Item({
					key: "1",
					text: "item 1"
				}),

				new Item({
					key: "2",
					text: "item 2"
				})
			],

			selectedKey: "2"
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		oComboBox.setSelectedItem(null);

		// assert
		assert.ok(oComboBox.getSelectedItem() === null);
		assert.strictEqual(oComboBox.getSelectedItemId(), "");
		assert.strictEqual(oComboBox.getSelectedKey(), "");
		assert.ok(oComboBox.getList().getSelectedItem() === null);
		assert.strictEqual(oComboBox.getValue(), "");
		assert.strictEqual(oComboBox.getProperty("value"), "");
		assert.strictEqual(jQuery(oComboBox.getFocusDomRef()).attr("aria-activedescendant"), undefined, 'The "aria-activedescendant" attribute is set when the active descendant is rendered and visible');

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("setSelectedItem() set the selected item when the picker popup is open", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "0",
					text: "item 0"
				}),

				new Item({
					key: "1",
					text: "item 1"
				}),

				new Item({
					key: "2",
					text: "item 2"
				})
			],

			selectedKey: "2"
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		oComboBox.open();
		this.clock.tick(1000);

		// act
		oComboBox.setSelectedItem(null);

		// assert
		assert.ok(oComboBox.getSelectedItem() === null);
		assert.strictEqual(oComboBox.getSelectedItemId(), "");
		assert.strictEqual(oComboBox.getSelectedKey(), "");
		assert.ok(oComboBox.getList().getSelectedItem() === null);
		assert.strictEqual(oComboBox.getValue(), "");
		assert.strictEqual(oComboBox.getProperty("value"), "");
		assert.strictEqual(jQuery(oComboBox.getFocusDomRef()).attr("aria-activedescendant"), undefined, 'The "aria-activedescendant" attribute is set when the active descendant is rendered and visible');

		// cleanup
		oComboBox.destroy();
	});

	QUnit.module("setSelectedItemId()");

	QUnit.test("setSelectedItemId()", function (assert) {

		// system under test
		var oExpectedItem;
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "0",
					text: "item 0"
				}),

				oExpectedItem = new Item({
					id: "item-id",
					key: "1",
					text: "item 1"
				}),

				new Item({
					key: "2",
					text: "item 2",
					enabled: false
				})
			]
		});

		// arrange
		var fnFireChangeSpy = this.spy(oComboBox, "fireChange"),
			fnSetSelectedItemIdSpy = this.spy(oComboBox, "setSelectedItemId");

		// act
		oComboBox.setSelectedItemId("item-id");

		// assert
		assert.strictEqual(fnFireChangeSpy.callCount, 0, "The change event was not fired");
		assert.ok(fnSetSelectedItemIdSpy.returned(oComboBox), 'sap.m.ComboBox.prototype.setSelectedItemId() method return the "this" reference');
		assert.ok(oComboBox.getSelectedItem() === oExpectedItem);
		assert.strictEqual(oComboBox.getSelectedItemId(), "item-id");
		assert.strictEqual(oComboBox.getSelectedKey(), "1");
		assert.ok(oComboBox.getList().getSelectedItem() === oExpectedItem);
		assert.strictEqual(oComboBox.getValue(), "item 1");
		assert.strictEqual(oComboBox.getProperty("value"), "item 1");
		assert.strictEqual(jQuery(oComboBox.getFocusDomRef()).attr("aria-activedescendant"), undefined, 'The "aria-activedescendant" attribute is set when the active descendant is rendered and visible');

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("setSelectedItemId()", function (assert) {

		// system under test
		var oExpectedItem;
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "0",
					text: "item 0"
				}),

				new Item({
					key: "1",
					text: "item 1"
				}),

				oExpectedItem = new Item({
					id: "item-id",
					key: "2",
					text: "item 2"
				})
			]
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		oComboBox.setSelectedItemId("item-id");

		// assert
		assert.ok(oComboBox.getSelectedItem() === oExpectedItem);
		assert.strictEqual(oComboBox.getSelectedItemId(), "item-id");
		assert.strictEqual(oComboBox.getSelectedKey(), "2");
		assert.ok(oComboBox.getList().getSelectedItem() === oExpectedItem);
		assert.strictEqual(oComboBox.getValue(), "item 2");
		assert.strictEqual(oComboBox.getProperty("value"), "item 2");
		assert.strictEqual(jQuery(oComboBox.getFocusDomRef()).attr("aria-activedescendant"), undefined, 'The "aria-activedescendant" attribute is set when the active descendant is rendered and visible');

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("setSelectedItemId()", function (assert) {

		//system under test
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "0",
					text: "item 0"
				}),

				new Item({
					key: "1",
					text: "item 1"
				}),

				new Item({
					key: "2",
					text: "item 2"
				})
			],

			selectedKey: "2"
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		oComboBox.setSelectedItemId("");

		// assert
		assert.ok(oComboBox.getSelectedItem() === null);
		assert.strictEqual(oComboBox.getSelectedItemId(), "");
		assert.strictEqual(oComboBox.getSelectedKey(), "");
		assert.ok(oComboBox.getList().getSelectedItem() === null);
		assert.strictEqual(oComboBox.getValue(), "");
		assert.strictEqual(oComboBox.getProperty("value"), "");
		assert.strictEqual(jQuery(oComboBox.getFocusDomRef()).attr("aria-activedescendant"), undefined, 'The "aria-activedescendant" attribute is set when the active descendant is rendered and visible');

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("setSelectedItemId() set the selected item when the ComboBox's picker pop-up is open", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "0",
					text: "item 0"
				}),

				new Item({
					key: "1",
					text: "item 1"
				}),

				new Item({
					key: "2",
					text: "item 2"
				})
			],

			selectedKey: "2"
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		oComboBox.open();
		this.clock.tick(500);

		// act
		oComboBox.setSelectedItemId("");

		// assert
		assert.ok(oComboBox.getSelectedItem() === null);
		assert.strictEqual(oComboBox.getSelectedItemId(), "");
		assert.strictEqual(oComboBox.getSelectedKey(), "");
		assert.ok(oComboBox.getList().getSelectedItem() === null);
		assert.strictEqual(oComboBox.getValue(), "");
		assert.strictEqual(oComboBox.getProperty("value"), "");
		assert.strictEqual(jQuery(oComboBox.getFocusDomRef()).attr("aria-activedescendant"), undefined, 'The "aria-activedescendant" attribute is set when the active descendant is rendered and visible');

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("setSelectedItemId() should set the value even if the corresponding item doesn't exist", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			selectedItemId: "item-id"
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assertions
		assert.ok(oComboBox.getSelectedItem() === null);
		assert.strictEqual(oComboBox.getSelectedItemId(), "item-id");
		assert.strictEqual(oComboBox.getSelectedKey(), "");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.module("setSelectedKey()");

	QUnit.test("setSelectedKey() first rendering", function (assert) {

		// system under test
		var oExpectedItem;
		var oComboBox = new ComboBox({

			selectedKey: "2",

			items: [
				new Item({
					key: "0",
					text: "item 0"
				}),

				new Item({
					key: "1",
					text: "item 1"
				}),

				oExpectedItem = new Item({
					id: "item-id",
					key: "2",
					text: "item 2"
				})
			]
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(oComboBox.getSelectedItem() === oExpectedItem);
		assert.strictEqual(oComboBox.getSelectedItemId(), "item-id");
		assert.strictEqual(oComboBox.getSelectedKey(), "2");
		assert.ok(oComboBox.getList().getSelectedItem() === oExpectedItem);
		assert.strictEqual(oComboBox.getValue(), "item 2");
		assert.strictEqual(oComboBox.getProperty("value"), "item 2");
		assert.strictEqual(jQuery(oComboBox.getFocusDomRef()).attr("aria-activedescendant"), undefined, 'The "aria-activedescendant" attribute is set when the active descendant is rendered and visible');

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("setSelectedKey() no rendering", function (assert) {

		// system under test
		var oExpectedItem;
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "0",
					text: "item 0"
				}),

				oExpectedItem = new Item({
					id: "item-id",
					key: "1",
					text: "item 1"
				}),

				new Item({
					key: "2",
					text: "item 2"
				})
			],

			selectedKey: "1"
		});

		// assert
		assert.ok(oComboBox.getSelectedItem() === oExpectedItem);
		assert.strictEqual(oComboBox.getSelectedItemId(), "item-id");
		assert.strictEqual(oComboBox.getSelectedKey(), "1");
		assert.ok(oComboBox.getList().getSelectedItem() === oExpectedItem);
		assert.strictEqual(oComboBox.getValue(), "item 1");
		assert.strictEqual(oComboBox.getProperty("value"), "item 1");
		assert.strictEqual(jQuery(oComboBox.getFocusDomRef()).attr("aria-activedescendant"), undefined, 'The "aria-activedescendant" attribute is set when the active descendant is rendered and visible');

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("setSelectedKey() after the initial rendering", function (assert) {

		// system under test
		var oExpectedItem;
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "0",
					text: "item 0"
				}),

				oExpectedItem = new Item({
					id: "item-id",
					key: "1",
					text: "item 1"
				}),

				new Item({
					key: "2",
					text: "item 2"
				})
			]
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		var fnSetPropertySpy = this.spy(oComboBox, "setProperty"),
			fnSetAssociationSpy = this.spy(oComboBox, "setAssociation"),
			fnFireChangeSpy = this.spy(oComboBox, "fireChange"),
			fnSetSelectedKeySpy = this.spy(oComboBox, "setSelectedKey");

		// act
		oComboBox.setSelectedKey("1");

		// assert
		assert.strictEqual(fnFireChangeSpy.callCount, 0, "The change event was not fired");

		assert.ok(fnSetPropertySpy.calledWith("selectedKey", "1"));
		assert.ok(fnSetPropertySpy.calledWith("selectedItemId", "item-id"));
		assert.ok(fnSetAssociationSpy.calledWith("selectedItem", oExpectedItem));
		assert.ok(fnSetSelectedKeySpy.returned(oComboBox), 'sap.m.ComboBox.prototype.setSelectedKey() method return the "this" reference');
		assert.ok(oComboBox.getSelectedItem() === oExpectedItem);
		assert.strictEqual(oComboBox.getSelectedItemId(), "item-id");
		assert.strictEqual(oComboBox.getSelectedKey(), "1");
		assert.ok(oComboBox.getList().getSelectedItem() === oExpectedItem);
		assert.strictEqual(oComboBox.getValue(), "item 1");
		assert.strictEqual(oComboBox.getProperty("value"), "item 1");
		assert.strictEqual(jQuery(oComboBox.getFocusDomRef()).attr("aria-activedescendant"), undefined, 'The "aria-activedescendant" attribute is set when the active descendant is rendered and visible');

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("setSelectedKey()", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "0",
					text: "item 0"
				}),

				new Item({
					key: "1",
					text: "item 1"
				}),

				new Item({
					key: "2",
					text: "item 2"
				})
			],

			selectedKey: "2"
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		oComboBox.setSelectedKey("");

		// assert
		assert.ok(oComboBox.getSelectedItem() === null);
		assert.strictEqual(oComboBox.getSelectedItemId(), "");
		assert.strictEqual(oComboBox.getSelectedKey(), "");
		assert.ok(oComboBox.getList().getSelectedItem() === null);
		assert.strictEqual(oComboBox.getValue(), "");
		assert.strictEqual(oComboBox.getProperty("value"), "");
		assert.strictEqual(jQuery(oComboBox.getFocusDomRef()).attr("aria-activedescendant"), undefined, 'The "aria-activedescendant" attribute is set when the active descendant is rendered and visible');

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("setSelectedKey() set the selected item when the picker popup is open test case 1", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "0",
					text: "item 0"
				}),

				new Item({
					key: "1",
					text: "item 1"
				}),

				new Item({
					key: "2",
					text: "item 2"
				})
			],

			selectedKey: "2"
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		oComboBox.open();
		this.clock.tick(500);

		// act
		oComboBox.setSelectedKey("");

		// assert
		assert.ok(oComboBox.getSelectedItem() === null);
		assert.strictEqual(oComboBox.getSelectedItemId(), "");
		assert.strictEqual(oComboBox.getSelectedKey(), "");
		assert.ok(oComboBox.getList().getSelectedItem() === null);
		assert.strictEqual(oComboBox.getValue(), "");
		assert.strictEqual(oComboBox.getProperty("value"), "");
		assert.strictEqual(jQuery(oComboBox.getFocusDomRef()).attr("aria-activedescendant"), undefined, 'The "aria-activedescendant" attribute is set when the active descendant is rendered and visible');

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("setSelectedKey() set the selected item when the picker popup is open test case 2", function (assert) {

		// system under test
		var oExpectedItem;
		var oComboBox = new ComboBox({
			items: [
				oExpectedItem = new Item({
					key: "GER",
					text: "Germany"
				})
			],

			selectedKey: "GER"
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		var sExpectedActiveDescendantId = oExpectedItem.getId();

		oComboBox.open();
		this.clock.tick(1000); // wait 1s after the open animation is completed

		// assert
		assert.strictEqual(jQuery(oComboBox.getFocusDomRef()).attr("aria-activedescendant"), sExpectedActiveDescendantId, 'The "aria-activedescendant" attribute is set when the active descendant is rendered and visible');

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("setSelectedKey() on unbindObject call", function (assert) {
		var oComboBox = new ComboBox({
			selectedKey: "{value}",
			value: "{value}"
		});

		var oData = {
			"context": [
				{ "value": "1" },
				{ "value": "2" }
			]
		};
		var oModel = new JSONModel(oData);

		oComboBox.setModel(oModel);
		oComboBox.bindObject("/context/0");

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		oComboBox.unbindObject();
		assert.strictEqual(oComboBox.getModel().oData.context[0].value, "1", "unbindObject doesn't overwrite model");

		oComboBox.destroy();
	});

	QUnit.test("setSelectedKey() on unbindObject call when value is not bound", function (assert) {
		var oComboBox = new ComboBox({
			selectedKey: "{value}",
			items: {
				path: "/items",
				template: new Item({
					key: "{value}",
					text: "{value}"
				})
			}
		});

		var oData = {
			"items": [
				{ "value": "1" },
				{ "value": "2" }
			]
		};
		var oModel = new JSONModel(oData);

		oComboBox.setModel(oModel);
		oComboBox.bindObject("/items/0");

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		assert.strictEqual(oComboBox.getValue(), "1", "the value is set properly");
		oComboBox.unbindObject();

		assert.strictEqual(oComboBox.getValue(), "", "the value is set properly after unbindObject is called");
		assert.strictEqual(oComboBox.getModel().oData.items[0].value, "1", "unbindObject doesn't overwrite model");

		oComboBox.destroy();
	});

	QUnit.module("setMaxWidth()");

	QUnit.test("setMaxWidth()", function (assert) {

		// system under test
		var oComboBox = new ComboBox();

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(oComboBox.getDomRef().style.maxWidth, "100%");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("setMaxWidth()", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			maxWidth: "50%"
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(oComboBox.getDomRef().style.maxWidth, "50%");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("setMaxWidth()", function (assert) {

		// system under test
		var oComboBox = new ComboBox();

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		oComboBox.setMaxWidth("40%");
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(oComboBox.getDomRef().style.maxWidth, "40%");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.module("removeItem()");

	QUnit.test("removeItem() it should return null when called with an invalid input argument value", function (assert) {

		// system under test
		var oComboBox = new ComboBox();

		// arrange
		var fnRemoveAggregationSpy = this.spy(oComboBox.getList(), "removeAggregation");
		var fnRemoveItemSpy = this.spy(oComboBox, "removeItem");
		var fnFireChangeSpy = this.spy(oComboBox, "fireChange");

		// act
		oComboBox.removeItem(undefined);

		// assert
		assert.strictEqual(fnRemoveAggregationSpy.callCount, 1, "sap.m.SelectList.removeAggregation() method was called");
		assert.ok(fnRemoveAggregationSpy.calledWith("items", undefined), "sap.m.SelectList.prototype.removeAggregation() method was called with the expected argument");
		assert.strictEqual(fnFireChangeSpy.callCount, 0, "The change event is not fired");
		assert.ok(fnRemoveItemSpy.returned(null), "sap.m.ComboBox.prototype.removeItem() method returns null");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("removeItem() it should remove the selected item and change the selection (test case 1)", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			items: {
				path: "/items",
				template: new Item({
					key: "{value}",
					text: "{text}"
				})
			},

			selectedKey: {
				path: "/selected",
				template: "{selected}"
			}
		});

		// arrange
		var oModel = new JSONModel();
		var fnRemoveAggregationSpy = this.spy(oComboBox.getList(), "removeAggregation");
		var mData = {
			"items": [
				{
					"value": "0",
					"text": "item 0"
				},

				{
					"value": "1",
					"text": "item 1"
				},

				{
					"value": "2",
					"text": "item 2"
				},

				{
					"value": "3",
					"text": "item 3"
				},

				{
					"value": "4",
					"text": "item 4"
				},

				{
					"value": "5",
					"text": "item 5"
				},

				{
					"value": "6",
					"text": "item 6"
				},

				{
					"value": "7",
					"text": "item 7"
				},

				{
					"value": "8",
					"text": "item 8"
				}
			],

			"selected": "8"
		};

		oModel.setData(mData);
		sap.ui.getCore().setModel(oModel);
		oComboBox.placeAt("content");
		var oSelectedItem = oComboBox.getItemByKey("8");
		sap.ui.getCore().applyChanges();

		// act
		oComboBox.removeItem(8);

		// assert
		assert.strictEqual(fnRemoveAggregationSpy.callCount, 1, "sap.m.SelectList.prototype.removeAggregation() method was called");
		assert.ok(fnRemoveAggregationSpy.calledWith("items", 8), "sap.m.SelectList.prototype.removeAggregation() method was called with the expected argument");
		assert.ok(oComboBox.getSelectedItem() === null);
		assert.strictEqual(oComboBox.getSelectedItemId(), "");
		assert.strictEqual(oComboBox.getSelectedKey(), "");
		assert.ok(oComboBox.getList().getSelectedItem() === null);
		assert.strictEqual(oComboBox.getValue(), "item 8");
		assert.strictEqual(oComboBox.getProperty("value"), "item 8");
		assert.strictEqual(oSelectedItem.hasListeners("_change"), false);

		// cleanup
		oComboBox.destroy();
		oModel.destroy();
	});

	QUnit.test("removeItem() it should remove the selected item and change the selection (test case 2)", function (assert) {

		// system under test
		var oComboBox = new ComboBox({

			items: {
				path: "/items",
				template: new Item({
					key: "{value}",
					text: "{text}"
				})
			},

			selectedKey: {
				path: "/selected",
				template: "{selected}"
			},

			change: function (oControlEvent) {
				Log.info('Event fired: "change" value property to ' + oControlEvent.getParameter("selectedItem"));
			}
		});

		// arrange
		var oModel = new JSONModel();

		var mData = {
			"items": [
				{
					"value": "0",
					"text": "item 0"
				},

				{
					"value": "1",
					"text": "item 1"
				},

				{
					"value": "2",
					"text": "item 2"
				},

				{
					"value": "3",
					"text": "item 3"
				}
			],

			"selected": "0"
		};

		oModel.setData(mData);
		sap.ui.getCore().setModel(oModel);

		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		oComboBox.removeItem(0);
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(oComboBox.getSelectedItem() === null);
		assert.strictEqual(oComboBox.getSelectedItemId(), "");
		assert.strictEqual(oComboBox.getSelectedKey(), "");
		assert.ok(oComboBox.getList().getSelectedItem() === null);
		assert.strictEqual(oComboBox.getValue(), "item 0");
		assert.strictEqual(oComboBox.getProperty("value"), "item 0");

		// cleanup
		oComboBox.destroy();
		oModel.destroy();
	});

	QUnit.test("removeItem() it should remove the selected item and change the selection (test case 3)", function (assert) {

		// system under test
		var oExpectedItem;
		var oComboBox = new ComboBox({
			items: [
				oExpectedItem = new Item({
					key: "0",
					text: "item 0"
				})
			]
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		oComboBox.removeItem(0);
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(oComboBox.getSelectedItem() === null);
		assert.strictEqual(oComboBox.getSelectedItemId(), "");
		assert.strictEqual(oComboBox.getSelectedKey(), "");
		assert.ok(oComboBox.getList().getSelectedItem() === null);
		assert.strictEqual(oComboBox.getValue(), "");
		assert.strictEqual(oComboBox.getProperty("value"), "");
		assert.ok(oExpectedItem.getDomRef() === null);
		assert.strictEqual(oExpectedItem.hasListeners("_change"), false);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.module("removeAllItems()");

	QUnit.test("removeAllItems()", function (assert) {

		// system under test
		var aItems = [
			new Item({
				key: "0",
				text: "item 0"
			}),

			new Item({
				key: "1",
				text: "item 1"
			}),

			new Item({
				key: "2",
				text: "item 2"
			})
		];

		var oComboBox = new ComboBox({
			items: aItems
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		var fnRemoveAllItemsSpy = this.spy(oComboBox, "removeAllItems");
		var fnListRemoveAllItemsSpy = this.spy(oComboBox.getList(), "removeAllItems");

		// act
		var oRemovedItems = oComboBox.removeAllItems();
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(fnListRemoveAllItemsSpy.callCount, 1, "sap.m.SelectList.prototype.removeAllItems() method was called");
		assert.ok(fnRemoveAllItemsSpy.returned(aItems), "sap.m.ComboBox.prototype.removeAllItems() method returns an array of the removed items");
		assert.ok(oComboBox.getSelectedItem() === null);
		assert.strictEqual(oComboBox.getSelectedItemId(), "");
		assert.strictEqual(oComboBox.getSelectedKey(), "");
		assert.ok(oComboBox.getList().getSelectedItem() === null);
		assert.strictEqual(oComboBox.getValue(), "");
		assert.strictEqual(oComboBox.getProperty("value"), "");

		for (var i = 0; i < oRemovedItems.length; i++) {
			assert.strictEqual(oRemovedItems[i].hasListeners("_change"), false);
		}

		// cleanup
		oComboBox.destroy();
	});

	QUnit.module("destroyItems()");

	QUnit.test("destroyItems()", function (assert) {

		// system under test
		var aItems = [
			new Item({
				key: "0",
				text: "item 0"
			}),

			new Item({
				key: "1",
				text: "item 1"
			}),

			new Item({
				key: "2",
				text: "item 2"
			})
		];

		var oComboBox = new ComboBox({
			items: aItems,
			selectedKey: "2"
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.open();
		this.clock.tick(1000); // wait 1s after the open animation is completed
		var fnDestroyItemsSpy = this.spy(oComboBox, "destroyItems");

		// act
		oComboBox.destroyItems();
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(fnDestroyItemsSpy.returned(oComboBox), "sap.m.ComboBox.prototype.destroyItems() method returns the ComboBox instance");
		assert.ok(oComboBox.getList().getSelectedItem() === null);

		for (var i = 0; i < aItems.length; i++) {
			assert.strictEqual(aItems[i].hasListeners("_change"), false);
		}

		assert.strictEqual(oComboBox.getList().getDomRef().childElementCount, 0);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.module("open()");

	QUnit.test("open()", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "0",
					text: "item 0"
				}),

				new Item({
					key: "1",
					text: "item 1"
				}),

				new Item({
					key: "2",
					text: "item 2"
				})
			]
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		document.documentElement.style.overflow = "hidden"; // hide scrollbar during test

		// act
		oComboBox.open();
		this.clock.tick(1000);

		// assert
		assert.ok(oComboBox.isOpen(), "ComboBox is open");

		if (!Device.system.phone) {
			assert.strictEqual(document.activeElement, oComboBox.getFocusDomRef(), "The ComboBox should get the focus");
		}

		assert.ok(oComboBox.hasStyleClass(InputBase.ICON_PRESSED_CSS_CLASS));

		if (Device.system.desktop || Device.system.tablet) {
			assert.strictEqual(oComboBox.$().outerWidth(), oComboBox.getPicker().$().outerWidth(), "The width of the picker pop-up is strictEqual to the width of the input");
			assert.strictEqual(document.activeElement, oComboBox.getFocusDomRef(), "The ComboBox should get the focus");
		} else if (Device.system.phone) {
			assert.strictEqual(oComboBox.getPicker().$().width(), jQuery(window).width(), "The width of the picker pop-up is strictEqual to the width of the browser view port");
		}

		// cleanup
		oComboBox.destroy();
		document.documentElement.style.overflow = ""; // restore scrollbar after test
	});

	QUnit.test("open() check whether the active state persist after re-rendering", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "0",
					text: "item 0"
				}),

				new Item({
					key: "1",
					text: "item 1"
				}),

				new Item({
					key: "2",
					text: "item 2"
				})
			]
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		oComboBox.open();
		this.clock.tick(500);

		// act
		oComboBox.rerender();
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(oComboBox.hasStyleClass(InputBase.ICON_PRESSED_CSS_CLASS));

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("open() the picker popup (dropdown list) should automatically size itself to fit its content", function (assert) {

		this.stub(Device, "system", {
			desktop: true,
			phone: false,
			tablet: false
		});

		// system under test
		var oComboBox = new ComboBox({
			width: "100px",
			items: [
				new Item({
					text: "Lorem ipsum dolor sit amet, duo ut soleat insolens, commodo vidisse intellegam ne usu"
				})
			]
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		oComboBox.open();
		this.clock.tick(500);

		// assert
		assert.ok(oComboBox.getPicker().getDomRef().offsetWidth > 100);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("it should propagate the entered value to the picker text field", function (assert) {

		this.stub(Device, "system", {
			desktop: false,
			phone: true,
			tablet: false
		});

		// system under test
		var oComboBox = new ComboBox();

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();
		var sExpectedValue = "lorem ipsum";
		var oTarget = oComboBox.getFocusDomRef();
		var oPicker = oComboBox.getPicker();

		// act
		oTarget.value = sExpectedValue;
		sap.ui.qunit.QUnitUtils.triggerEvent("input", oTarget);
		oComboBox.open();
		this.clock.tick(1000); // tick the clock ahead 1 second, after the open animation is completed

		// assert
		assert.strictEqual(oComboBox.getPickerTextField().getValue(), sExpectedValue);
		assert.strictEqual(oPicker.getShowHeader(), true, "it should show the picker header");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("it should show the label text as picker header title", function (assert) {

		this.stub(Device, "system", {
			desktop: false,
			phone: true,
			tablet: false
		});

		// system under test
		var oComboBox = new ComboBox();
		var sExpectedTitle = "lorem ipsum";
		var oLabel = new Label({
			text: sExpectedTitle,
			labelFor: oComboBox
		});
		var oPicker = oComboBox.getPicker();

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();

		// act
		oComboBox.open();
		this.clock.tick(1000); // tick the clock ahead 1 second, after the open animation is completed

		// assert
		assert.ok(oPicker.getShowHeader());
		assert.strictEqual(oComboBox.getPickerTitle().getText(), sExpectedTitle);

		// cleanup
		oComboBox.destroy();
		oLabel.destroy();
	});

	QUnit.test("it should update the header title if the label reference is destroyed", function (assert) {

		this.stub(Device, "system", {
			desktop: false,
			phone: true,
			tablet: false
		});

		// system under test
		var oComboBox = new ComboBox();
		var sExpectedTitle = "lorem ipsum";
		var oLabel = new Label({
			text: sExpectedTitle,
			labelFor: oComboBox
		});
		var oPicker = oComboBox.getPicker();

		// arrange
		oComboBox.placeAt("content");
		oLabel.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();
		oComboBox.open();
		this.clock.tick(1000); // tick the clock ahead 1 second, after the open animation is completed
		oComboBox.close();
		oLabel.destroy();
		this.clock.tick(1000); // tick the clock ahead 1 second, after the close animation is completed

		// act
		oComboBox.open();
		this.clock.tick(1000); // tick the clock ahead 1 second, after the close animation is completed

		// assert
		assert.strictEqual(oPicker.getShowHeader(), true);
		assert.strictEqual(oComboBox.getPickerTitle().getText(), "Select");

		// cleanup
		oComboBox.destroy();
		oLabel.destroy();
	});

	QUnit.test("Trigger close only once onItemPress", function (assert) {
		this.stub(Device, "system", {
			desktop: false,
			phone: false,
			tablet: true
		});

		// system under test
		var oTextSelectionSpy,
			oComboBox = new ComboBox({
				items: [
					new Item({
						key: "0",
						text: "item 0"
					}),
					new Item({
						key: "1",
						text: "item 1"
					})
				]
			}),
			oCloseSpy = this.spy(oComboBox, "close");
		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		oComboBox.open();
		this.clock.tick(1000);

		oTextSelectionSpy = this.spy(oComboBox, "selectText");
		oComboBox._oList.getItems()[1].$().trigger("tap");
		sap.ui.getCore().applyChanges();
		this.clock.tick(1000);

		// Assert
		assert.strictEqual(oCloseSpy.callCount, 1, "The close() method has been called once");
		assert.strictEqual(oTextSelectionSpy.callCount, 0, "The selectText() should not be called on tablet");

		// Cleanup
		oComboBox.destroy();
	});

	QUnit.module("findFirstEnabledItem()");

	QUnit.test("findFirstEnabledItem()", function (assert) {

		// system under test
		var oExpectedItem;
		var aItems = [
			oExpectedItem = new Item({
				key: "0",
				text: "item 0"
			}),

			new Item({
				key: "1",
				text: "item 1"
			}),

			new Item({
				key: "2",
				text: "item 2",
				enabled: false
			})
		];

		var oComboBox = new ComboBox({
			items: aItems
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		var oFirstEnabledItem = oComboBox.findFirstEnabledItem(aItems);

		// assert
		assert.ok(oFirstEnabledItem === oExpectedItem);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("findFirstEnabledItem()", function (assert) {

		// system under test
		var aItems = [
			new Item({
				key: "0",
				text: "item 0",
				enabled: false
			}),

			new Item({
				key: "1",
				text: "item 1",
				enabled: false
			}),

			new Item({
				key: "2",
				text: "item 2",
				enabled: false
			})
		];

		var oComboBox = new ComboBox({
			items: aItems
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		var oFirstEnabledItem = oComboBox.findFirstEnabledItem(aItems);

		// assert
		assert.ok(oFirstEnabledItem === null);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("findFirstEnabledItem()", function (assert) {

		// system under test
		var oComboBox = new ComboBox();

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		var oFirstEnabledItem = oComboBox.findFirstEnabledItem([]);

		// assert
		assert.ok(oFirstEnabledItem === null);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.module("findLastEnabledItem()");

	QUnit.test("findLastEnabledItem()", function (assert) {

		// system under test
		var oExpectedItem;
		var aItems = [
			new Item({
				key: "0",
				text: "item 0",
				enabled: false
			}),

			new Item({
				key: "1",
				text: "item 1",
				enabled: false
			}),

			oExpectedItem = new Item({
				key: "2",
				text: "item 2"
			})
		];

		var oComboBox = new ComboBox({
			items: aItems
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		var oLastEnabledItem = oComboBox.findLastEnabledItem(aItems);

		// assert
		assert.ok(oLastEnabledItem === oExpectedItem);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("findLastEnabledItem()", function (assert) {

		// system under test
		var aItems = [
			new Item({
				key: "0",
				text: "item 0",
				enabled: false
			}),

			new Item({
				key: "1",
				text: "item 1",
				enabled: false
			}),

			new Item({
				key: "2",
				text: "item 2",
				enabled: false
			})
		];

		var oComboBox = new ComboBox({
			items: aItems
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		var oLastEnabledItem = oComboBox.findLastEnabledItem(aItems);

		// assert
		assert.ok(oLastEnabledItem === null, 'The last enabled item is "null"');

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("findLastEnabledItem()", function (assert) {

		// system under test
		var oComboBox = new ComboBox();

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		var oLastEnabledItem = oComboBox.findLastEnabledItem([]);

		// assert
		assert.ok(oLastEnabledItem === null, 'The last enabled item is "null"');

		// cleanup
		oComboBox.destroy();
	});

	QUnit.module("setSelectedIndex()");

	var setSelectedIndexTestCase = function (sTestName, mOptions) {
		QUnit.test("setSelectedIndex()", function (assert) {

			// system under test
			var oComboBox = mOptions.control;

			// act
			oComboBox.setSelectedIndex(mOptions.input);

			// assert
			assert.ok(oComboBox.getSelectedItem() === mOptions.output, sTestName);

			// cleanup
			oComboBox.destroy();
		});
	};

	(function () {
		var oExpectedItem;
		var aItems = [
			new Item({
				key: "0",
				text: "item 0",
				enabled: false
			}),

			new Item({
				key: "1",
				text: "item 1"
			}),

			oExpectedItem = new Item({
				key: "3",
				text: "item 3"
			}),

			new Item({
				key: "2",
				text: "item 2"
			})
		];

		setSelectedIndexTestCase("", {
			control: new Select({
				items: aItems
			}),
			input: 2,
			output: oExpectedItem
		});
	}());

	setSelectedIndexTestCase("", {
		control: new Select(),
		input: 2,
		output: null
	});

	(function () {
		var oExpectedItem;
		var aItems = [
			new Item({
				key: "0",
				text: "item 0",
				enabled: false
			}),

			new Item({
				key: "1",
				text: "item 1"
			}),

			new Item({
				key: "3",
				text: "item 3"
			}),

			oExpectedItem = new Item({
				key: "2",
				text: "item 2"
			})
		];

		setSelectedIndexTestCase("The provided index is bigger than the last item's index", {
			control: new Select({
				items: aItems
			}),
			input: 10,
			output: oExpectedItem
		});
	}());

	QUnit.module("getItemAt()");

	QUnit.test("getItemAt()", function (assert) {

		// system under test
		var oExpectedItem;
		var aItems = [
			new Item({
				key: "0",
				text: "item 0",
				enabled: false
			}),

			new Item({
				key: "1",
				text: "item 1",
				enabled: false
			}),

			oExpectedItem = new Item({
				key: "2",
				text: "item 2"
			})
		];

		var oComboBox = new ComboBox({
			items: aItems
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		var oItem1 = oComboBox.getItemAt(2);
		var oItem2 = oComboBox.getItemAt(6);

		// assert
		assert.ok(oItem1 === oExpectedItem);
		assert.ok(oItem2 === null);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.module("getFirstItem()");

	QUnit.test("getFirstItem()", function (assert) {

		// system under test
		var oExpectedItem;
		var aItems = [
			oExpectedItem = new Item({
				key: "0",
				text: "item 0"
			}),

			new Item({
				key: "1",
				text: "item 1"
			}),

			new Item({
				key: "2",
				text: "item 2"
			})
		];

		var oComboBox = new ComboBox({
			items: aItems
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		var oItem = oComboBox.getFirstItem();

		// assert
		assert.ok(oItem === oExpectedItem);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("getFirstItem()", function (assert) {

		// system under test
		var oComboBox = new ComboBox();

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		var oItem = oComboBox.getFirstItem();

		// assert
		assert.ok(oItem === null);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.module("getLastItem()");

	QUnit.test("getLastItem()", function (assert) {

		// system under test
		var oExpectedItem;
		var aItems = [
			new Item({
				key: "0",
				text: "item 0"
			}),

			new Item({
				key: "1",
				text: "item 1"
			}),

			oExpectedItem = new Item({
				key: "2",
				text: "item 2"
			})
		];

		var oComboBox = new ComboBox({
			items: aItems
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		var oItem = oComboBox.getLastItem();

		// assert
		assert.ok(oItem === oExpectedItem);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("getLastItem()", function (assert) {

		// system under test
		var oComboBox = new ComboBox();

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		var oItem = oComboBox.getLastItem();

		// assert
		assert.ok(oItem === null);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.module("getItemByKey()");

	QUnit.test("getItemByKey()", function (assert) {

		// system under test
		var oExpectedItem1;
		var oExpectedItem2;
		var oExpectedItem3;
		var aItems = [
			oExpectedItem1 = new Item({
				key: "0",
				text: "item 0"
			}),

			oExpectedItem2 = new Item({
				key: "1",
				text: "item 1"
			}),

			oExpectedItem3 = new Item({
				key: "2",
				text: "item 2"
			})
		];

		var oComboBox = new ComboBox({
			items: aItems
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		var oItem1 = oComboBox.getItemByKey("0"),
			oItem2 = oComboBox.getItemByKey("1"),
			oItem3 = oComboBox.getItemByKey("2"),
			oItem4 = oComboBox.getItemByKey("3");

		// assert
		assert.ok(oItem1 === oExpectedItem1);
		assert.ok(oItem2 === oExpectedItem2);
		assert.ok(oItem3 === oExpectedItem3);
		assert.ok(oItem4 === null);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.module("getEnabledItems()");

	QUnit.test("getEnabledItems()", function (assert) {

		// system under test
		var oExpectedItem;
		var aItems = [
			oExpectedItem = new Item({
				key: "0",
				text: "item 0"
			}),

			new Item({
				key: "1",
				text: "item 1",
				enabled: false
			})
		];

		var oComboBox = new ComboBox({
			items: aItems
		});

		// assert + act
		assert.ok(oComboBox.getEnabledItems()[0] === oExpectedItem);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.module("destroy()");

	QUnit.test("it should cleans up the value of some internal properties before destruction", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			items: []
		});

		// arrange
		oComboBox.aMessageQueue.push(function () { });

		// act
		oComboBox.destroy();

		// assert
		assert.ok(oComboBox.aMessageQueue === null);
		assert.ok(oComboBox._oSelectedItemBeforeOpen === null);
	});

	QUnit.test("it should not throw errors when methods are called after the control is destroyed", function (assert) {

		// arrange
		this.stub(Device, "system", {
			desktop: false,
			phone: true,
			tablet: false
		});

		// system under test
		var oComboBox = new ComboBox();

		// act
		oComboBox.destroy();

		// assert
		assert.ok(oComboBox.getPickerTitle() === null);
	});

	QUnit.module("setValue()");

	QUnit.test("setValue()", function (assert) {

		// system under test
		var oComboBox = new ComboBox();

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		var fnSetValueSpy = this.spy(oComboBox, "setValue");

		// act
		oComboBox.setValue("new value");

		// assert
		assert.strictEqual(oComboBox.getValue(), "new value");
		assert.strictEqual(oComboBox.getProperty("value"), "new value");
		assert.strictEqual(oComboBox.getFocusDomRef().value, "new value");
		assert.ok(fnSetValueSpy.returned(oComboBox), "sap.m.ComboBox.prototype.setValue() method return this to allow method chaining");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.module("setValueState()");

	QUnit.test("value state and value state message", function (assert) {
		var oErrorComboBox = new ComboBox("errorcombobox", {
			valueState: "Error",
			valueStateText: "Error Message",
			items: [
				new Item({
					key: "DZ",
					text: "Algeria"
				}),
				new Item({
					key: "GER",
					text: "Germany"
				}),
				new Item({
					key: "CU",
					text: "Cuba"
				})
			]
		});

		// arrange
		oErrorComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		oErrorComboBox.open();
		this.clock.tick(1000);
		assert.ok(!document.getElementById("errorcombobox-message"), "error message popup is not open when list is open");

		oErrorComboBox.close();
		this.clock.tick(1000);

		/* TODO remove after 1.62 version */
		// workaround to fix failing test in IE9-11
		if (Device.browser.msie) {
			oErrorComboBox.focus();
			this.clock.tick(1000);
		}

		assert.ok(document.getElementById("errorcombobox-message"), "error message popup is open when list is closed and focus is back to input");

		oErrorComboBox.focus();
		this.clock.tick(500);
		assert.ok(document.getElementById("errorcombobox-message"), "error message popup is open when focusin");
		assert.equal(oErrorComboBox.getValueStateText(), "Error Message", "error message is correct");

		oErrorComboBox.getFocusDomRef().blur();
		this.clock.tick(500);
		assert.ok(!document.getElementById("errorcombobox-message"), "no error message popup is closed when focus is out");

		// cleanup
		oErrorComboBox.destroy();
	});

	QUnit.test("in 'None' valueState don't showValueState message ", function (assert) {
		var oComboBox = new ComboBox("errorcombobox", {
			valueState: "Error",
			showValueStateMessage: true,
			valueStateText: "Error Message"
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		var fnShowValueStateTextSpy = this.spy(oComboBox, "_showValueStateText");
		oComboBox.setValueState("None");
		assert.ok(fnShowValueStateTextSpy.calledWith(false));

		// cleanup
		oComboBox.destroy();
	});

	// BCP 1570763824
	QUnit.test("it should add the corresponding CSS classes", function (assert) {

		// system under test
		var oComboBox = new ComboBox();

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		oComboBox.setValueState(ValueState.Error);

		// assert
		assert.ok(oComboBox.$("content").hasClass("sapMInputBaseContentWrapperState"));
		assert.ok(oComboBox.$("content").hasClass("sapMInputBaseContentWrapperError"));

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("it should render the picker value state message", function (assert) {

		// System under test
		var oErrorComboBox = new ComboBox({
			valueState: "Error",
			items: [
				new Item({
					key: "DZ",
					text: "Algeria"
				}),
				new Item({
					key: "GER",
					text: "Germany"
				}),
				new Item({
					key: "CU",
					text: "Cuba"
				})
			]
		});

		// Arrange
		oErrorComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		// Assert
		assert.ok(oErrorComboBox.getPicker().getShowHeader(), "Header should be shown");
		assert.ok(oErrorComboBox._getPickerCustomHeader().hasStyleClass(oErrorComboBox.getRenderer().CSS_CLASS_COMBOBOXBASE + "PickerValueState"), "Header has value state class");
		assert.ok(oErrorComboBox._getPickerCustomHeader().hasStyleClass(oErrorComboBox.getRenderer().CSS_CLASS_COMBOBOXBASE + "PickerErrorState"), "Header has error value state class");

		// Cleanup
		oErrorComboBox.destroy();
	});

	QUnit.test("it should not render the dropdown list header if the valuestate property is set to none", function (assert) {

		// System under test
		var oErrorComboBox = new ComboBox({
			valueState: "None",
			items: [
				new Item({
					key: "DZ",
					text: "Algeria"
				})
			]
		});

		// Arrange
		oErrorComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		// Assert
		assert.notOk(oErrorComboBox.getPicker().getCustomHeader().getVisible(), "Header should not be visible");

		// Cleanup
		oErrorComboBox.destroy();
	});

	QUnit.test("it should not render the dropdown list header if the property showValueStateMessage is set to false", function (assert) {

		// System under test
		var oErrorComboBox = new ComboBox({
			showValueStateMessage: false,
			items: [
				new Item({
					key: "DZ",
					text: "Algeria"
				})
			]
		});

		// Arrange
		oErrorComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		// Assert
		assert.notOk(oErrorComboBox.getPicker().getCustomHeader().getVisible(), "Header should not be visible");

		// Cleanup
		oErrorComboBox.destroy();
	});

	QUnit.test("it should set custom text for valueState", function (assert) {

		// System under test
		var oErrorComboBox = new ComboBox({
			valueState: "Error",
			valueStateText: "custom",
			items: [
				new Item({
					key: "DZ",
					text: "Algeria"
				})
			]
		});

		// Arrange
		oErrorComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		// Assert
		assert.strictEqual(oErrorComboBox.getPicker().getCustomHeader().getContentLeft()[0].getText(), "custom", "text should be custom");

		// Cleanup
		oErrorComboBox.destroy();
	});

	QUnit.module("destroy()");

	QUnit.test("destroy()", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "0",
					text: "item 0"
				}),

				new Item({
					key: "1",
					text: "item 1"
				}),

				new Item({
					key: "2",
					text: "item 2"
				})
			]
		});

		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		oComboBox.destroy();
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(oComboBox.getItems().length, 0);
		assert.ok(oComboBox.getDomRef() === null);
		assert.ok(oComboBox.getPicker() === null);
		assert.ok(oComboBox.getList() === null);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("calling destroy() when the picker popup is open", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "0",
					text: "item 0"
				}),

				new Item({
					key: "1",
					text: "item 1"
				}),

				new Item({
					key: "2",
					text: "item 2"
				})
			]
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		oComboBox.open();
		this.clock.tick(1000);

		// act
		oComboBox.destroy();
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(oComboBox.getItems().length, 0);
		assert.ok(oComboBox.getDomRef() === null);
		assert.ok(oComboBox.getPicker() === null);
		assert.ok(oComboBox.getList() === null);
		assert.ok(oComboBox.getAggregation("picker") === null);
	});

	QUnit.module("addAggregation() + getAggregation()");

	QUnit.test("addAggregation() + getAggregation()", function (assert) {

		// system under test
		var oComboBox = new ComboBox();
		var oItem = new Item({
			key: "GER",
			text: "Germany"
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		var fnAddAggregationSpy = this.spy(oComboBox, "addAggregation");
		var fnInvalidateSpy = this.spy(oComboBox, "invalidate");

		// act
		oComboBox.addAggregation("items", oItem);

		// assert
		assert.ok(fnAddAggregationSpy.returned(oComboBox), "sap.m.ComboBox.prototype.addAggregation() returns this to allow method chaining");
		assert.ok(fnInvalidateSpy.calledWithExactly(oItem));
		assert.ok(oComboBox.getAggregation("items")[0] === oItem);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("addAggregation()", function (assert) {

		// system under test
		var oComboBox = new ComboBox();
		var oItem = new Item({
			key: "GER",
			text: "Germany"
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		var fnAddAggregationSpy = this.spy(oComboBox, "addAggregation");
		var fnInvalidateSpy = this.spy(oComboBox, "invalidate");

		// act
		oComboBox.addAggregation("items", oItem, true);

		// assert
		assert.ok(fnAddAggregationSpy.returned(oComboBox), "sap.m.ComboBox.prototype.addAggregation() returns this to allow method chaining");
		assert.ok(!fnInvalidateSpy.calledWithExactly(oItem));
		assert.ok(oComboBox.getAggregation("items")[0] === oItem);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.module("setAssociation() + getAssociation()");

	QUnit.test("setAssociation() + getAssociation()", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "CU",
					text: "Cuba"
				}),
				new Item({
					id: "item-id",
					key: "GER",
					text: "Germany"
				})
			]
		});

		// arrange
		var fnSetAssociationSpy = this.spy(oComboBox, "setAssociation");

		// act
		oComboBox.setAssociation("selectedItem", "item-id");

		// assert
		assert.ok(fnSetAssociationSpy.returned(oComboBox), "sap.m.ComboBox.prototype.setAssociation() returns this to allow method chaining");
		assert.ok(oComboBox.getAssociation("selectedItem") === "item-id");
		assert.ok(oComboBox.getList().getAssociation("selectedItem") === "item-id");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("setAssociation() + getAssociation()", function (assert) {

		// system under test
		var oItem;
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "CU",
					text: "Cuba"
				}),
				oItem = new Item({
					id: "item-id",
					key: "GER",
					text: "Germany"
				})
			]
		});

		// arrange
		var fnSetAssociationSpy = this.spy(oComboBox, "setAssociation");

		// act
		oComboBox.setAssociation("selectedItem", oItem);

		// assert
		assert.ok(fnSetAssociationSpy.returned(oComboBox), "sap.m.ComboBox.prototype.setAssociation() returns this to allow method chaining");
		assert.ok(oComboBox.getAssociation("selectedItem") === "item-id");
		assert.ok(oComboBox.getList().getAssociation("selectedItem") === "item-id");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.module("updateAggregation()");

	// Do not clear the selection when items are destroyed.
	// When using Two-Way Data Binding and the binding are refreshed,
	// the items will be destroyed and the aggregation items is filled again.
	QUnit.test("updateAggregation() do not clear the selection when items are destroyed", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			items: {
				path: "/contries",
				template: new Item({
					key: "{code}",
					text: "{name}"
				})
			},
			selectedKey: {
				path: "/selected"
			}
		});

		// arrange
		var oModel = new JSONModel();
		var mData = {
			"contries": [
				{
					"code": "GER",
					"name": "Germany"
				},
				{
					"code": "CU",
					"name": "Cuba"
				}
			],

			// path : selectedKey
			"selected": "CU"
		};

		oModel.setData(mData);
		oComboBox.setModel(oModel);
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		oComboBox.updateAggregation("items");

		// assert
		assert.strictEqual(oComboBox.getSelectedKey(), "CU");

		// cleanup
		oComboBox.destroy();
		oModel.destroy();
		sap.ui.getCore().applyChanges();
	});

	QUnit.test("it should correctly set the selection if the items aggregation is bounded to an OData model", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			items: {
				path: "/Products",
				template: new Item({
					key: "{ProductId}",
					text: "{Name}"
				})
			}
		});

		// arrange
		var sUri = "/service/";
		var iAutoRespondAfter = 10;
		var oMockServer = fnStartMockServer(sUri, iAutoRespondAfter);
		var oModel = new ODataModel(sUri, true);
		oComboBox.setModel(oModel);

		// IDs and names of the products in the model:
		//
		// id_1  Gladiator MX
		// id_2  Psimax
		// id_3  Hurricane GX
		// id_4  Webcam
		// id_5  Monitor Locking Cable
		// id_6  Laptop Case
		// id_7  Removable CD/DVD
		// id_8  USB Stick 16 GByte
		// id_9  Deskjet Super Highspeed
		// id_10 Laser Allround Pro
		// id_11 Flat S
		// id_12 Flat Medium
		// id_13 Flat X-large II
		// id_14 High End Laptop 2b
		// id_15 Very Natural Keyboard
		// id_16 Hardcore Hacker

		oComboBox.setSelectedKey("id_5");
		oComboBox.placeAt("content");

		// tick the clock ahead some ms millisecond (it should be at least more than the auto respond setting
		// to make sure that the data from the OData model is available)
		this.clock.tick(iAutoRespondAfter + 1);

		// assert
		assert.strictEqual(oComboBox.getSelectedKey(), "id_5");
		assert.strictEqual(oComboBox.getSelectedItem().getText(), "Monitor Locking Cable");

		// cleanup
		oMockServer.stop();
		oMockServer.destroy();
		oComboBox.destroy();
		oModel.destroy();
	});

	// BCP 1570460580
	QUnit.test("it should not override the selection when binding context is changed", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			selectedKey: "{selected}",
			items: {
				path: "entries",
				template: new Item({
					key: "{key}",
					text: "{country}"
				})
			}
		});

		// arrange
		var oModel = new JSONModel([
			{
				selected: "DZ",
				entries: [
					{
						"key": "DZ",
						"country": "Algeria"
					},
					{
						"key": "AR",
						"country": "Argentina"
					},
					{
						"key": "AU",
						"country": "Australia"
					}
				]
			},
			{
				selected: "BA",
				entries: [
					{
						"key": "AT",
						"country": "Austria"
					},

					{
						"key": "BH",
						"country": "Bahrain"
					},

					{
						"key": "BE",
						"country": "Belgium"
					},

					{
						"key": "BA",
						"country": "Bosnia and Herzegovina"
					}
				]
			}
		]);

		oModel.setDefaultBindingMode("OneWay");
		sap.ui.getCore().setModel(oModel);
		oComboBox.setBindingContext(oModel.getContext("/1"));
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		oComboBox.setBindingContext(oModel.getContext("/0"));
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(oComboBox.getSelectedKey(), "DZ");
		assert.strictEqual(oComboBox.getValue(), "Algeria");

		// cleanup
		oComboBox.destroy();
		oModel.destroy();
	});

	QUnit.module("destroyAggregation()");

	QUnit.test("destroyAggregation()", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "GER",
					text: "Germany"
				})
			]
		});

		// arrange
		var fnDestroyAggregationSpy = this.spy(oComboBox, "destroyAggregation");
		var fnInvalidateSpy = this.spy(oComboBox, "invalidate");

		// act
		oComboBox.destroyAggregation("items");

		// assert
		assert.ok(fnDestroyAggregationSpy.returned(oComboBox), "sap.m.ComboBox.prototype.destroyAggregation() returns this to allow method chaining");
		assert.strictEqual(fnInvalidateSpy.callCount, 0, "destroying the items in the list should not invalidate the input field");
		assert.strictEqual(oComboBox.getItems().length, 0);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("destroyAggregation()", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "GER",
					text: "Germany"
				})
			]
		});

		// arrange
		var fnDestroyAggregationSpy = this.spy(oComboBox, "destroyAggregation");
		var fnInvalidateSpy = this.spy(oComboBox, "invalidate");

		// act
		oComboBox.destroyAggregation("items", true);

		// assert
		assert.ok(fnDestroyAggregationSpy.returned(oComboBox), "sap.m.ComboBox.prototype.destroyAggregation() returns this to allow method chaining");
		assert.ok(!fnInvalidateSpy.calledOnce);
		assert.strictEqual(oComboBox.getItems().length, 0);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.module("findAggregatedObjects()");

	QUnit.test("findAggregatedObjects()", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "GER",
					text: "Germany"
				})
			]
		});

		// arrange
		var fnFindAggregatedObjectsSpy = this.spy(oComboBox, "findAggregatedObjects");

		// act
		oComboBox.findAggregatedObjects();

		// assert
		assert.ok(fnFindAggregatedObjectsSpy.returned(oComboBox.getItems()));

		// cleanup
		oComboBox.destroy();
	});

	QUnit.module("getBinding() + getBindingInfo() + getBindingPath()");

	QUnit.test("getBinding() + getBindingInfo() + getBindingPath()", function (assert) {

		// system under test
		var oComboBox = new ComboBox();

		// arrange
		var oModel = new JSONModel();
		var mData = {
			"countries": [
				{
					"value": "GER",
					"text": "Germany"
				}
			],
			"selected": "GER"
		};
		var oItemTemplate = new Item({
			key: "{select-model>value}",
			text: "{select-model>text}"
		});

		oModel.setData(mData);
		oComboBox.setModel(oModel, "select-model");

		// act
		oComboBox.bindItems({
			path: "select-model>/countries",
			template: oItemTemplate
		});

		oComboBox.bindProperty("selectedKey", {
			path: "select-model>/selected"
		});

		// assert
		assert.ok(oComboBox.getBinding("selectedKey"));
		assert.ok(oComboBox.getBinding("items"));
		assert.ok(oComboBox.getBindingInfo("selectedKey"));
		assert.ok(oComboBox.getBindingInfo("items"));
		assert.strictEqual(oComboBox.getBindingPath("selectedKey"), "/selected");
		assert.strictEqual(oComboBox.getBindingPath("items"), "/countries");
		assert.ok(oComboBox.isBound("selectedKey"));
		assert.ok(oComboBox.isBound("items"));

		// cleanup
		oComboBox.destroy();
		oModel.destroy();
	});

	QUnit.module("setProperty() + getProperty()");

	QUnit.test('setProperty() + getProperty() test for "selectedKey" property', function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "CU",
					text: "Cuba"
				}),
				new Item({
					key: "GER",
					text: "Germany"
				})
			]
		});

		// arrange
		var fnInvalidateSpy = this.spy(oComboBox, "invalidate");

		// act
		oComboBox.setProperty("selectedKey", "GER");

		// assert
		assert.strictEqual(oComboBox.getSelectedKey(), "GER");
		assert.strictEqual(oComboBox.getProperty("selectedKey"), "GER");
		assert.strictEqual(oComboBox.getList().getSelectedKey(), "GER");
		assert.strictEqual(oComboBox.getList().getProperty("selectedKey"), "GER");
		assert.ok(fnInvalidateSpy.called);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test('setProperty() + getProperty() test for "selectedItemId" property', function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			items: [
				new Item({
					id: "item-cu",
					key: "CU",
					text: "Cuba"
				}),
				new Item({
					id: "item-ger",
					key: "GER",
					text: "Germany"
				})
			]
		});

		// act
		oComboBox.setProperty("selectedItemId", "item-ger", true);

		// assert
		assert.strictEqual(oComboBox.getSelectedItemId(), "item-ger");
		assert.strictEqual(oComboBox.getProperty("selectedItemId"), "item-ger");
		assert.strictEqual(oComboBox.getList().getSelectedItemId(), "item-ger");
		assert.strictEqual(oComboBox.getList().getProperty("selectedItemId"), "item-ger");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.module("indexOfAggregation()");

	QUnit.test("indexOfAggregation()", function (assert) {

		// system under test
		var oExpectedItem;
		var oComboBox = new ComboBox({
			items: [
				new Item({
					text: "Cuba"
				}),
				oExpectedItem = new Item({
					text: "Germany"
				})
			]
		});

		// assert
		assert.strictEqual(oComboBox.indexOfAggregation("items", oExpectedItem), 1);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.module("insertAggregation()");

	QUnit.test("insertAggregation()", function (assert) {

		// system under test
		var oComboBox = new ComboBox();
		var oItem = new Item({
			text: "Germany"
		});

		// act
		oComboBox.insertAggregation("items", oItem);

		// assert
		assert.ok(oComboBox.getItems()[0] === oItem);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.module("removeAggregation()");

	QUnit.test("removeAggregation()", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "GER",
					text: "Germany"
				})
			]
		});

		// act
		oComboBox.removeAggregation("items", 0);

		// assert
		assert.strictEqual(oComboBox.getItems().length, 0);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.module("removeAllAggregation()");

	QUnit.test("removeAllAggregation()", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "GER",
					text: "Germany"
				}),
				new Item({
					key: "CU",
					text: "Cuba"
				})
			]
		});

		// act
		oComboBox.removeAllAggregation("items");

		// assert
		assert.strictEqual(oComboBox.getItems().length, 0);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.module("removeAllAssociation()");

	QUnit.test("removeAllAssociation()", function (assert) {

		// system under test
		var oExpectedItem;
		var oComboBox = new ComboBox({
			items: [
				new Item({
					id: "ger-id",
					key: "GER",
					text: "Germany"
				}),
				oExpectedItem = new Item({
					id: "cu-id",
					key: "CU",
					text: "Cuba"
				})
			],

			selectedItem: oExpectedItem
		});

		// arrange
		var fnRemoveAllAssociationSpy = this.spy(oComboBox, "removeAllAssociation");

		// act
		oComboBox.removeAllAssociation("selectedItem");

		// assert
		assert.ok(oComboBox.getSelectedItem() === null);
		assert.ok(oComboBox.getList().getSelectedItem() === null);
		assert.ok(fnRemoveAllAssociationSpy.returned("cu-id"));

		// cleanup
		oComboBox.destroy();
	});

	QUnit.module("unbindProperty()");

	QUnit.test("unbindProperty()", function (assert) {

		// system under test
		var oComboBox = new ComboBox();

		// arrange
		var oModel = new JSONModel();
		var mData = {
			"countries": [
				{
					"code": "GER",
					"name": "Germany"
				},
				{
					"code": "CU",
					"name": "Cuba"
				}
			],
			"selected": "CU"
		};

		var oItemTemplate = new Item({
			key: "{code}",
			text: "{name}"
		});

		oComboBox.bindItems({
			path: "/countries",
			template: oItemTemplate
		});

		oComboBox.bindProperty("selectedKey", {
			path: "/selected"
		});

		oModel.setData(mData);
		oComboBox.setModel(oModel);

		// act
		oComboBox.unbindProperty("selectedKey");

		// assert
		assert.strictEqual(oComboBox.isBound("selectedKey"), false, "The property is not bound");
		assert.strictEqual(oComboBox.getProperty("selectedKey"), "", 'Property "selectedKey" is reset to the default value');

		// cleanup
		oComboBox.destroy();
		oModel.destroy();
	});

	QUnit.module("unbindAggregation()");

	QUnit.test("unbindAggregation()", function (assert) {

		// system under test
		var oComboBox = new ComboBox();

		// arrange
		var oModel = new JSONModel();
		var mData = {
			"countries": [
				{
					"code": "GER",
					"name": "Germany"
				},
				{
					"code": "CU",
					"name": "Cuba"
				}
			],
			"selected": "CU"
		};

		var oItemTemplate = new Item({
			key: "{code}",
			text: "{name}"
		});

		oComboBox.bindItems({
			path: "/countries",
			template: oItemTemplate
		});

		oModel.setData(mData);
		oComboBox.setModel(oModel);

		// act
		oComboBox.unbindAggregation("items");

		// assert
		assert.strictEqual(oComboBox.isBound("items"), false, 'The aggregation "items" is not bound');
		assert.strictEqual(oComboBox.getAggregation("items", []).length, 0, 'The aggregation "items" must be reset');

		// cleanup
		oComboBox.destroy();
		oModel.destroy();
	});

	QUnit.module("setEditable()");

	// BSP 1570011983
	QUnit.test("it should set the display of the combobox arrow button to none", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			editable: false
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(getComputedStyle(oComboBox.getDomRef("arrow")).getPropertyValue("display"), "none");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.module("disabled");

	// BSP 1670516606
	QUnit.test("it should show the default mouse pointer when disabled", function (assert) {

		// system under test
		var oComboBox = new ComboBoxTextField({
			enabled: false
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(getComputedStyle(oComboBox.getDomRef("arrow")).getPropertyValue("cursor"), "default");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.module("loadItems");

	QUnit.test("it should fire the loadItems event", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			items: [],

			// enable lazy loading
			loadItems: function () {

			}
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();
		var fnLoadItemsSpy = this.spy(oComboBox, "fireLoadItems");

		// act
		oComboBox.open();

		// assert
		assert.strictEqual(fnLoadItemsSpy.callCount, 1, 'The "loadItems" event was fired');

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("it should not fire the loadItems event", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			items: []
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();
		var fnLoadItemsSpy = this.spy(oComboBox, "fireLoadItems");

		// act
		oComboBox.open();

		// assert
		assert.strictEqual(fnLoadItemsSpy.callCount, 0);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.module("rendering");

	QUnit.test("rendering", function (assert) {

		// system under test
		var oComboBox1 = new ComboBox({
			width: "50%",
			items: [
				new Item({
					key: "3",
					text: "item 3 item is not visible"
				})
			],
			visible: false
		});

		var oComboBox2 = new ComboBox({
			items: [
				new Item({
					key: "4",
					text: "item 4"
				}),

				new Item({
					key: "5",
					text: "item 5"
				}),

				new Item({
					key: "6",
					text: "item 6"
				}),

				new Item({
					key: "7",
					text: "item 7"
				}),

				new Item({
					key: "8",
					text: "item 8"
				})
			]
		});

		var oComboBox3 = new ComboBox({
			items: [
				new Item({
					key: "9",
					text: "item 9"
				})
			]
		});

		var oComboBox4 = new ComboBox({
			items: [
				new Item({
					key: "10",
					text: "item 10"
				}),

				new Item({
					key: "11",
					text: "item 11"
				}),

				new Item({
					key: "12",
					text: "item 12"
				}),

				new Item({
					key: "13",
					text: "item 13"
				})
			],

			selectedKey: "13"
		});

		var oComboBox5 = new ComboBox({
			width: "13rem",
			items: [
				new Item({
					key: "14",
					text: "item 14"
				}),

				new Item({
					key: "15",
					text: "item 15"
				}),

				new Item({
					key: "16",
					text: "item 16"
				}),

				new Item({
					key: "17",
					text: "item 17"
				})
			]
		});

		var oComboBox6 = new ComboBox({
			width: "200px",
			selectedItem: "item20",

			items: [
				new Item({
					key: "18",
					text: "item 18"
				}),

				new Item({
					key: "19",
					text: "item 19"
				}),

				new Item({
					key: "20",
					text: "item 20"
				}),

				new Item({
					key: "21",
					text: "item 21"
				})
			]
		});

		var oComboBox7 = new ComboBox({
			selectedKey: "23",

			items: [
				new Item({
					key: "22",
					text: "item 22"
				}),

				new Item({
					key: "23",
					text: "item 23"
				}),

				new Item({
					key: "24",
					text: "item 24"
				})
			]
		});

		var oComboBox8 = new ComboBox({
			items: [
				new Item({
					key: "52",
					text: "item 52"
				}),

				new Item({
					key: "53",
					text: "item 53"
				}),

				new Item({
					key: "54",
					text: "item 54"
				})
			]
		});

		var aComboBox = [oComboBox1, oComboBox2, oComboBox3, oComboBox4, oComboBox5, oComboBox6, oComboBox7, oComboBox8];

		// arrange
		oComboBox1.placeAt("content");
		oComboBox2.placeAt("content");
		oComboBox3.placeAt("content");
		oComboBox4.placeAt("content");
		oComboBox5.placeAt("content");
		oComboBox6.placeAt("content");
		oComboBox7.placeAt("content");
		oComboBox8.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		aComboBox.forEach(function (oComboBox) {

			if (!oComboBox.getVisible()) {
				return;
			}

			assert.ok(oComboBox.getDomRef(), "The combobox element exists");
			assert.strictEqual(oComboBox.getFocusDomRef().getAttribute("autocomplete"), "off");
			assert.strictEqual(oComboBox.getFocusDomRef().getAttribute("autocorrect"), "off");
			assert.strictEqual(oComboBox.getFocusDomRef().getAttribute("autocapitalize"), "off");
			assert.strictEqual(oComboBox.getFocusDomRef().getAttribute("aria-expanded"), "false");
			assert.strictEqual(oComboBox.getFocusDomRef().getAttribute("aria-autocomplete"), "both");
			assert.strictEqual(jQuery(oComboBox.getFocusDomRef()).attr("aria-required"), undefined);
			assert.ok(oComboBox.$().hasClass(oComboBox.getRenderer().CSS_CLASS_COMBOBOXBASE), 'The combo box element has the CSS class "' + oComboBox.getRenderer().CSS_CLASS_COMBOBOXBASE + '"');
			assert.ok(oComboBox.getAggregation("_endIcon").length, "The HTML span element for the arrow exists");
			assert.ok(oComboBox.getAggregation("_endIcon")[0].getDomRef().classList.contains("sapUiIcon"), 'The arrow button has the CSS class sapUiIcon"');
			assert.ok(oComboBox.getAggregation("_endIcon")[0].hasStyleClass("sapMInputBaseIcon"), 'The arrow button has the CSS class sapMInputBaseIcon "');
			assert.strictEqual(oComboBox.getAggregation("_endIcon")[0].getNoTabStop(), true, "The arrow button is focusable, but it is not reachable via sequential keyboard navigation");
			assert.strictEqual(oComboBox.getAggregation("_endIcon")[0].getDomRef().getAttribute("aria-labelledby"), " " + oComboBox.getAggregation("_endIcon")[0].getDomRef().children[0].id);

			// cleanup
			oComboBox.destroy();
		});
	});

	QUnit.test("the arrow button should not be visible", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			showButton: false
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(oComboBox.getIcon().getVisible(), false, "Icons visibility is false");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("tap control is not editable", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			editable: false,
			items: [
				new Item({
					key: "0",
					text: "item 0"
				}),

				new Item({
					key: "1",
					text: "item 1"
				}),

				new Item({
					key: "2",
					text: "item 2"
				})
			]
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		sap.ui.test.qunit.triggerTouchEvent("touchstart", oComboBox.getOpenArea(), {
			touches: {
				0: {
					pageX: 10,
					length: 1
				},

				length: 1
			},

			targetTouches: {
				0: {
					pageX: 10,
					length: 1
				},

				length: 1
			}
		});

		sap.ui.test.qunit.triggerTouchEvent("touchend", oComboBox.getOpenArea(), {
			targetTouches: {
				0: {
					pageX: 10,
					length: 1
				},

				length: 1
			}
		});

		sap.ui.test.qunit.triggerTouchEvent("tap", oComboBox.getOpenArea(), {
			targetTouches: {
				0: {
					pageX: 10,
					length: 1
				},

				length: 1
			}
		});

		// assert
		assert.strictEqual(oComboBox.isOpen(), false, "Control picker pop-up is closed");
		assert.ok(!oComboBox.$().hasClass(oComboBox.getRenderer().CSS_CLASS_COMBOBOXBASE + "Pressed"), "The ComboBox's input field must not have the css class '" + oComboBox.getRenderer().CSS_CLASS_COMBOBOXBASE + "Pressed'");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("it should update update the value of the input field when the selected item is pressed", function (assert) {

		// system under test
		var oItem;
		var oComboBox = new ComboBox({
			items: [
				oItem = new Item({
					key: "li",
					text: "lorem ipsum"
				})
			],
			selectedKey: "li"
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();
		oComboBox.open();
		this.clock.tick(1000); // wait 1s after the open animation is completed
		var oItemDomRef = oItem.getDomRef();
		oComboBox.getFocusDomRef().value = "foo";

		// act
		sap.ui.test.qunit.triggerTouchEvent("tap", oComboBox.getList().getDomRef(), {
			srcControl: oItem,
			changedTouches: {
				0: {
					pageX: 1,
					pageY: 1,
					identifier: 0,
					target: oItemDomRef
				},

				length: 1
			},

			touches: {
				length: 0
			}
		});

		this.clock.tick(0);

		// assert
		assert.strictEqual(oComboBox.getValue(), "lorem ipsum");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.module("onsapshow");

	QUnit.test("onsapshow F4 - open the picker pop-up", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "0",
					text: "item 0"
				}),

				new Item({
					key: "1",
					text: "item 1"
				})
			]
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();
		var fnShowSpy = this.spy(oComboBox, "onsapshow");

		// act
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.F4);

		// assert
		assert.strictEqual(fnShowSpy.callCount, 1, "onsapshow() method was called exactly once");

		if (jQuery.support.cssAnimations) {
			assert.strictEqual(oComboBox.getPicker().oPopup.getOpenState(), OpenState.OPENING, "Control's picker pop-up is opening");
		}

		this.clock.tick(1000);
		assert.strictEqual(oComboBox.getPicker().oPopup.getOpenState(), OpenState.OPEN, "Control's picker pop-up is open");
		assert.ok(oComboBox.isOpen(), "Control picker pop-up is open");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onsapshow F4 - when F4 or Alt + DOWN keys are pressed and the control's field is not editable, the picker pop-up should not open", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			editable: false,
			items: [
				new Item({
					key: "0",
					text: "item 0"
				}),

				new Item({
					key: "1",
					text: "item 1"
				})
			]
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();

		// act
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.F4);

		// assert
		this.clock.tick(1000);
		assert.strictEqual(oComboBox.getPicker().oPopup.getOpenState(), OpenState.CLOSED, "Control's picker pop-up is closed");
		assert.strictEqual(oComboBox.isOpen(), false, "Control picker pop-up is closed");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onsapshow Alt + DOWN - open the picker pop-up", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "0",
					text: "item 0"
				}),

				new Item({
					key: "1",
					text: "item 1"
				})
			]
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();
		var fnShowSpy = this.spy(oComboBox, "onsapshow");

		// act
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN, false, true);

		// assert
		assert.strictEqual(fnShowSpy.callCount, 1, "onsapshow() method was called exactly once");

		if (jQuery.support.cssAnimations) {
			assert.strictEqual(oComboBox.getPicker().oPopup.getOpenState(), OpenState.OPENING, "Control's picker pop-up is opening");
		}

		this.clock.tick(1000);
		assert.strictEqual(oComboBox.getPicker().oPopup.getOpenState(), OpenState.OPEN, "Control picker pop-up is open");
		assert.ok(oComboBox.isOpen(), "ComboBox is open");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onsapshow F4 - when F4 or Alt + DOWN keys are pressed and the control's field is not editable, the picker pop-up should not open", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			editable: false,
			items: [
				new Item({
					key: "0",
					text: "item 0"
				}),

				new Item({
					key: "1",
					text: "item 1"
				})
			]
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();

		// act
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN, false, true);

		// assert
		this.clock.tick(1000);
		assert.strictEqual(oComboBox.getPicker().oPopup.getOpenState(), OpenState.CLOSED, "Control's picker pop-up is closed");
		assert.strictEqual(oComboBox.isOpen(), false, "Control picker pop-up is closed");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onsapshow F4 - close control's picker pop-up", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "0",
					text: "item 0"
				}),

				new Item({
					key: "1",
					text: "item 1"
				})
			]
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();
		var fnShowSpy = this.spy(oComboBox, "onsapshow");

		// act

		// open the dropdown list picker
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.F4);

		// close the dropdown list picker
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.F4);
		this.clock.tick(1000);

		// assert
		assert.strictEqual(fnShowSpy.callCount, 2, "onsapshow() method was called twice");
		assert.strictEqual(oComboBox.getPicker().oPopup.getOpenState(), OpenState.CLOSED, "Control's picker pop-up is close");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onsapshow Alt + DOWN or F4 - clear the filter", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			items: [
				new Item({
					text: "Algeria"
				}),

				new Item({
					text: "Argentina"
				}),

				new Item({
					text: "Australia"
				}),

				new Item({
					text: "Germany"
				})
			]
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();
		oComboBox.open();
		this.clock.tick(1000);
		oComboBox.getFocusDomRef().value = "A";
		sap.ui.qunit.QUnitUtils.triggerEvent("input", oComboBox.getFocusDomRef());

		// act
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.F4);	// close the picker pop-up
		this.clock.tick(1000); // wait 1s after the close animation is completed

		// assert
		assert.strictEqual(oComboBox.getVisibleItems().length, 4, "The filter is cleared");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onsapshow Alt + DOWN - close control's picker pop-up", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "0",
					text: "item 0"
				}),

				new Item({
					key: "1",
					text: "item 1"
				})
			]
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();
		var fnShowSpy = this.spy(oComboBox, "onsapshow");

		// act

		// open the dropdown list picker
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN, false, true);

		// close the dropdown list picker
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN, false, true);
		this.clock.tick(1000);

		// assert
		assert.strictEqual(fnShowSpy.callCount, 2, "onsapshow() method was called twice");
		assert.strictEqual(oComboBox.getPicker().oPopup.getOpenState(), OpenState.CLOSED, "Control's picker pop-up is close");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onsapshow Alt + DOWN - open the control's picker pop-up and select the text", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "GER",
					text: "Germany"
				})
			],
			selectedKey: "GER"
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();

		// tick the clock ahead 0ms millisecond to make sure the async call to .selectText() on the focusin event
		// handler does not override the type ahead
		this.clock.tick(0);

		// open the dropdown list picker
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ARROW_RIGHT);

		// act
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN, false, true /* ctrl key is down */);

		// assert
		assert.strictEqual(oComboBox.getFocusDomRef().selectionStart, 0, "The text should be selected");
		assert.strictEqual(oComboBox.getFocusDomRef().selectionEnd, 7, "The text should be selected");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("it should open the dropdown list, show the busy indicator and load the items asynchronous when Alt + Down keys are pressed", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			items: {
				path: "/Products",
				template: new Item({
					key: "{ProductId}",
					text: "{Name}"
				})
			},
			loadItems: function () {
				oComboBox.setModel(oModel);
			}
		});

		// arrange
		var sUri = "/service/";
		var iAutoRespondAfter = 10;
		var oMockServer = fnStartMockServer(sUri, iAutoRespondAfter);
		var oModel = new ODataModel(sUri, true);
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();

		// act
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN, false, true);

		// assert
		assert.ok(oComboBox.isOpen(), "the dropdown list is open");
		assert.strictEqual(oComboBox.getList().getBusy(), true, "the loading indicator in the dropdown list is shown");
		assert.strictEqual(oComboBox.getFocusDomRef().getAttribute("aria-busy"), "true");

		// tick the clock ahead some ms millisecond (it should be at least more than the auto respond setting
		// to make sure that the data from the OData model is available)
		this.clock.tick(iAutoRespondAfter + 1);

		assert.ok(oComboBox.getItems().length > 0, "the items are loaded");
		assert.strictEqual(oComboBox.getList().getBusy(), false, "the loading indicator in the dropdown list is not shown");
		assert.strictEqual(jQuery(oComboBox.getFocusDomRef()).attr("aria-busy"), undefined);

		// cleanup
		oMockServer.stop();
		oMockServer.destroy();
		oComboBox.destroy();
		oModel.destroy();
	});

	QUnit.test("it should open the dropdown list and preselect first item if there is such", function (assert) {
		// arrange
		var oItem = new Item({
			text: "Example"
		}),
			oComboBox = new ComboBox({
				items: [oItem]
			}), oFakeEvent = {
				setMarked: function () { },
				keyCode: 111 // dummy code (not F4 - 115)
			},
			oSelectionChangeSpy = this.spy(oComboBox, "fireSelectionChange"),
			oSelectionSpy = this.spy(oComboBox, "setSelection"),
			oDomUpdateSpy = this.spy(oComboBox, "updateDomValue"),
			oSelectTextSpy = this.spy(oComboBox, "selectText");

		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		oComboBox.onsapshow(oFakeEvent);
		this.clock.tick(300);

		// assert
		assert.ok(oSelectionChangeSpy.called, "Selection should be triggered");
		assert.ok(oSelectionSpy.calledWith(oItem), "First item should be selected");
		assert.ok(oDomUpdateSpy.calledWith("Example"), "Dom value should be updated with first item's text");
		assert.ok(oSelectTextSpy.calledWith(0, 7), "Text selection should be performed for the first 7 symbols");

		// cleanup
		oComboBox.destroy();
		oSelectionChangeSpy.restore();
		oSelectionSpy.restore();
		oDomUpdateSpy.restore();
		oSelectTextSpy.restore();
	});

	QUnit.module("onsaphide");

	QUnit.test("onsaphide Alt + UP - open control's picker pop-up", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "0",
					text: "item 0"
				}),

				new Item({
					key: "1",
					text: "item 1"
				})
			]
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();
		var fnHideSpy = this.spy(oComboBox, "onsaphide");

		// act
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ARROW_UP, false, true, false);

		// assert
		assert.strictEqual(fnHideSpy.callCount, 1, "onsaphide() method was called exactly once");

		if (jQuery.support.cssAnimations) {
			assert.strictEqual(oComboBox.getPicker().oPopup.getOpenState(), OpenState.OPENING, "Control's picker pop-up is opening");
		}

		this.clock.tick(1000);
		assert.strictEqual(oComboBox.getPicker().oPopup.getOpenState(), OpenState.OPEN, "Control's picker pop-up is open");
		assert.ok(oComboBox.isOpen(), "Control's picker pop-up is open");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onsaphide Alt + UP - keys are pressed and the control's field is not editable, the picker pop-up should not open", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			editable: false,
			items: [
				new Item({
					key: "0",
					text: "item 0"
				}),

				new Item({
					key: "1",
					text: "item 1"
				})
			]
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();

		// act
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ARROW_UP, false, true, false);

		// assert
		this.clock.tick(1000);
		assert.strictEqual(oComboBox.getPicker().oPopup.getOpenState(), OpenState.CLOSED, "Control's picker pop-up is closed");
		assert.strictEqual(oComboBox.isOpen(), false, "Control picker pop-up is closed");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onsaphide Alt + UP - close control's picker pop-up", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "0",
					text: "item 0"
				}),

				new Item({
					key: "1",
					text: "item 1"
				})
			]
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();
		var fnHideSpy = this.spy(oComboBox, "onsaphide");

		// act
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ARROW_UP, false, true, false);
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ARROW_UP, false, true, false);
		this.clock.tick(1000);

		// assert
		assert.strictEqual(fnHideSpy.callCount, 2, "onsaphide() method was called twice");
		assert.strictEqual(oComboBox.getPicker().oPopup.getOpenState(), OpenState.CLOSED, "Control's picker pop-up is close");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.module("onsapescape");

	QUnit.test("onsapescape - close the picker popup", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "0",
					text: "item 0"
				}),

				new Item({
					key: "1",
					text: "item 1"
				})
			]
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();
		var fnEscapeSpy = this.spy(oComboBox, "onsapescape");
		var fnCloseSpy = this.spy(oComboBox, "close");

		// act
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ESCAPE);

		// assert
		assert.strictEqual(fnEscapeSpy.callCount, 1, "onsapescape() method was called exactly once");
		assert.strictEqual(fnCloseSpy.callCount, 0, "close() method is not called");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onsapescape - close the picker popup", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			items: [
				new Item({
					text: "Algeria"
				}),

				new Item({
					text: "Argentina"
				}),

				new Item({
					text: "Australia"
				}),

				new Item({
					text: "Germany"
				})
			]
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();
		oComboBox.open();
		this.clock.tick(1000);
		oComboBox.getFocusDomRef().value = "A";
		sap.ui.qunit.QUnitUtils.triggerEvent("input", oComboBox.getFocusDomRef());
		var fnEscapeSpy = this.spy(oComboBox, "onsapescape");
		var fnCloseSpy = this.spy(oComboBox, "close");

		// act
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ESCAPE);
		this.clock.tick(1000);	// wait 1s after the close animation is completed

		// assert
		assert.strictEqual(fnEscapeSpy.callCount, 1, "onsapescape() method was called exactly once");
		assert.strictEqual(fnCloseSpy.callCount, 1, "close() method was called exactly once");
		assert.strictEqual(oComboBox.getVisibleItems().length, 4, "The filter is cleared");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onsapescape - when escape is pressed and the controls's field is not editable, the picker pop-up should not close", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			editable: false,
			items: [
				new Item({
					key: "0",
					text: "item 0"
				}),

				new Item({
					key: "1",
					text: "item 1"
				})
			]
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();
		oComboBox.open();
		this.clock.tick(1000);

		// act
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ESCAPE);

		// assert
		assert.strictEqual(oComboBox.getPicker().oPopup.getOpenState(), OpenState.OPEN, "Control's picker pop-up is open");
		assert.strictEqual(oComboBox.isOpen(), true);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.module("onsapenter");

	QUnit.test("onsapenter - close control's picker pop-up", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "0",
					text: "item 0"
				})
			]
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();
		oComboBox.open();
		this.clock.tick(1000);

		var fnEnterSpy = this.spy(oComboBox, "onsapenter");
		var fnCloseSpy = this.spy(oComboBox, "close");

		// act
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ENTER);

		// assert
		assert.strictEqual(fnEnterSpy.callCount, 1, "onsapenter() method was called exactly once");
		assert.strictEqual(fnCloseSpy.callCount, 1, "close() method was called exactly once");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onsapenter - close control's picker pop-up and clear the filter", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			items: [
				new Item({
					text: "Algeria"
				}),

				new Item({
					text: "Argentina"
				}),

				new Item({
					text: "Australia"
				}),

				new Item({
					text: "Germany"
				})
			]
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();
		oComboBox.getFocusDomRef().value = "A";
		sap.ui.qunit.QUnitUtils.triggerEvent("input", oComboBox.getFocusDomRef());
		this.clock.tick(1000);

		// act
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ENTER);
		this.clock.tick(1000);	// wait 1s after the close animation is completed

		// assert
		assert.strictEqual(oComboBox.getVisibleItems().length, 4, "The filter is cleared");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onsapenter - when enter key is pressed and the control's field is not editable, the control's picker pop-up should not close", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			editable: false,
			items: [
				new Item({
					key: "0",
					text: "item 0"
				})
			]
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();
		oComboBox.open();
		this.clock.tick(1000);

		// act
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ENTER);

		// assert
		assert.strictEqual(oComboBox.getPicker().oPopup.getOpenState(), OpenState.OPEN, "Control's picker pop-up is open");
		assert.strictEqual(oComboBox.isOpen(), true);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onsapenter", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "0",
					text: "item 0"
				})
			],

			selectedKey: "0"
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();
		oComboBox.open();
		this.clock.tick(1000);
		oComboBox.selectText(0, 6);

		// act
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ENTER);
		// note: after the onsapenter() method is called, the cursor position change

		// assert
		assert.strictEqual(oComboBox.getFocusDomRef().selectionStart, 6, "The text should not be selected");
		assert.strictEqual(oComboBox.getFocusDomRef().selectionEnd, 6, "The text should not be selected");
		assert.strictEqual(jQuery(oComboBox.getFocusDomRef()).cursorPos(), 6, "The cursor position is at the end of the text");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onsapenter", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "0",
					text: "item 0"
				})
			]
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();
		oComboBox.open();
		this.clock.tick(1000);

		// act
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN);
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ENTER);

		// assert
		assert.strictEqual(jQuery(oComboBox.getFocusDomRef()).cursorPos(), 6, "The cursor position is at the end of the text");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onsapenter", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "GER",
					text: "Germany"
				}),
				new Item({
					key: "CU",
					text: "Cuba"
				})
			]
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();
		this.clock.tick(0);	// tick the clock ahead 0ms millisecond to make sure the async call to .selectText() on the focusin event handler does not override the type ahead

		// act
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN);
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ENTER);

		// assert
		assert.strictEqual(oComboBox.getFocusDomRef().selectionStart, 7, "The text should not be selected");
		assert.strictEqual(oComboBox.getFocusDomRef().selectionEnd, 7, "The text should not be selected");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.module("onsapdown");

	QUnit.test("onsapdown", function (assert) {

		// system under test
		var oExpectedItem;
		var sExpectedValue = "item 1 is selected";
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "0",
					text: "item 0",
					enabled: false
				}),

				oExpectedItem = new Item({
					key: "1",
					text: "item 1 is selected"
				}),

				new Item({
					key: "2",
					text: "item 2"
				})
			]
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();
		this.clock.tick(0);	// tick the clock ahead 0ms millisecond to make sure the async call to .selectText() on the focusin event handler does not override the type ahead
		var fnKeyDownSpy = this.spy(oComboBox, "onsapdown");
		var fnFireSelectionChangeSpy = this.spy(oComboBox, "fireSelectionChange");

		// act
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN);

		// assert
		assert.strictEqual(fnKeyDownSpy.callCount, 1, "onsapdown() method was called exactly once");
		assert.strictEqual(fnFireSelectionChangeSpy.callCount, 1, 'The "selectionChange" event is fired');
		assert.strictEqual(jQuery(oComboBox.getFocusDomRef()).getSelectedText(), sExpectedValue);
		assert.ok(oComboBox.getSelectedItem() === oExpectedItem);
		assert.ok(oComboBox.getList().getSelectedItem() === oExpectedItem);
		assert.strictEqual(oComboBox.getFocusDomRef().value, sExpectedValue);
		assert.strictEqual(jQuery(oComboBox.getFocusDomRef()).attr("aria-activedescendant"), undefined, 'The "aria-activedescendant" attribute is set when the active descendant is rendered and visible');

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onsapdown - when keyboard DOWN key is pressed and the control is not editable, the value should not change", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			editable: false,
			items: [
				new Item({
					key: "0",
					text: "item 0"
				})
			]
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();
		var fnFireSelectionChangeSpy = this.spy(oComboBox, "fireSelectionChange");

		// act
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN);

		// assert
		assert.strictEqual(fnFireSelectionChangeSpy.callCount, 0, 'The "selectionChange" event was not fired');
		assert.ok(oComboBox.getSelectedItem() === null);
		assert.ok(oComboBox.getList().getSelectedItem() === null);
		assert.strictEqual(oComboBox.getFocusDomRef().value, "");
		assert.strictEqual(jQuery(oComboBox.getFocusDomRef()).attr("aria-activedescendant"), undefined, 'The "aria-activedescendant" attribute is set when the active descendant is rendered and visible');

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onsapdown", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "0",
					text: "item 0",
					enabled: false
				}),

				new Item({
					key: "1",
					text: "item 1",
					enabled: false
				}),

				new Item({
					key: "2",
					text: "item 2",
					enabled: false
				})
			]
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();
		var fnKeyDownSpy = this.stub(oComboBox, "onsapdown");
		var fnFireSelectionChangeSpy = this.spy(oComboBox, "fireSelectionChange");

		// act
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN);

		// assert
		assert.strictEqual(fnKeyDownSpy.callCount, 1, "onsapdown() method was called exactly once");
		assert.strictEqual(fnFireSelectionChangeSpy.callCount, 0, 'The "selectionChange" event is not fired');
		assert.ok(oComboBox.getSelectedItem() === null);
		assert.ok(oComboBox.getList().getSelectedItem() === null);
		assert.strictEqual(oComboBox.getValue(), "");
		assert.strictEqual(oComboBox.getProperty("value"), "");
		assert.strictEqual(jQuery(oComboBox.getFocusDomRef()).attr("aria-activedescendant"), undefined, 'The "aria-activedescendant" attribute is set when the active descendant is rendered and visible');

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onsapdown", function (assert) {

		// system under test
		var oExpectedItem;
		var oComboBox = new ComboBox({
			items: [
				oExpectedItem = new Item({
					key: "0",
					text: "item 0"
				}),

				new Item({
					key: "1",
					text: "item 1",
					enabled: false
				}),

				new Item({
					key: "2",
					text: "item 2",
					enabled: false
				})
			]
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();
		this.clock.tick(0);	// tick the clock ahead 0ms millisecond to make sure the async call to .selectText() on the focusin event handler does not override the type ahead
		var fnKeyDownSpy = this.spy(oComboBox, "onsapdown");
		var fnFireSelectionChangeSpy = this.spy(oComboBox, "fireSelectionChange");

		// act
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN);

		// assert
		assert.strictEqual(fnKeyDownSpy.callCount, 1, "onsapdown() method was called exactly once");
		assert.strictEqual(fnFireSelectionChangeSpy.callCount, 1, 'The "selectionChange" event is fired');
		assert.strictEqual(jQuery(oComboBox.getFocusDomRef()).getSelectedText(), "item 0");
		assert.ok(oComboBox.getSelectedItem() === oExpectedItem);
		assert.strictEqual(oComboBox.getFocusDomRef().value, "item 0");
		assert.ok(oComboBox.getList().getSelectedItem() === oExpectedItem);
		assert.strictEqual(jQuery(oComboBox.getFocusDomRef()).attr("aria-activedescendant"), undefined, 'The "aria-activedescendant" attribute is set when the active descendant is rendered and visible');

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onsapdown changing the value in attachSelectionChange event handler", function (assert) {

		// system under test
		var sExpectedValue = "GER Germany";
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "GER",
					text: "Germany"
				})
			]
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();
		this.clock.tick(0);	// tick the clock ahead 0ms millisecond to make sure the async call to .selectText() on the focusin event handler does not override the type ahead
		oComboBox.attachSelectionChange(function (oControlEvent) {
			this.setValue(sExpectedValue);
		}, oComboBox);

		// act
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN);
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN);

		// assert
		assert.strictEqual(oComboBox.getValue(), sExpectedValue);
		assert.strictEqual(oComboBox.getProperty("value"), sExpectedValue);
		assert.strictEqual(jQuery(oComboBox.getFocusDomRef()).getSelectedText(), sExpectedValue);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onsapdown the typed value should not get selected (test case 1)", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			items: [
				new Item({
					text: "Algeria"
				}),

				new Item({
					text: "Argentina"
				}),

				new Item({
					text: "Australia"
				}),

				new Item({
					text: "Germany"
				})
			]
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();
		this.clock.tick(0);	// tick the clock ahead 0ms millisecond to make sure the async call to .selectText() on the focusin event handler does not override the type ahead
		sap.ui.qunit.QUnitUtils.triggerEvent("keydown", oComboBox.getFocusDomRef(), {
			which: KeyCodes.A
		});
		oComboBox.getFocusDomRef().value = "A";
		sap.ui.qunit.QUnitUtils.triggerEvent("input", oComboBox.getFocusDomRef());
		this.clock.tick(1000);

		// act
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN);

		// assert
		assert.strictEqual(oComboBox.getFocusDomRef().value, "Algeria");
		assert.strictEqual(jQuery(oComboBox.getFocusDomRef()).getSelectedText(), "lgeria");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onsapdown the typed value should not get selected (test case 2)", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			items: [
				new Item({
					text: "Algeria"
				}),

				new Item({
					text: "Argentina"
				}),

				new Item({
					text: "Australia"
				}),

				new Item({
					text: "Germany"
				})
			]
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();
		this.clock.tick(0);	// tick the clock ahead 0ms millisecond to make sure the async call to .selectText() on the focusin event handler does not override the type ahead
		sap.ui.qunit.QUnitUtils.triggerEvent("keydown", oComboBox.getFocusDomRef(), {
			which: KeyCodes.A
		});
		oComboBox.getFocusDomRef().value = "A";
		sap.ui.qunit.QUnitUtils.triggerEvent("input", oComboBox.getFocusDomRef());
		this.clock.tick(0);
		jQuery(oComboBox.getFocusDomRef()).cursorPos(0);

		// act
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN);

		// assert
		assert.strictEqual(oComboBox.getFocusDomRef().value, "Algeria");
		assert.strictEqual(jQuery(oComboBox.getFocusDomRef()).getSelectedText(), "");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test('onsapdown the attribute "aria-activedescendant" is set', function (assert) {

		// system under test
		var oExpectedItem;
		var oComboBox = new ComboBox({
			items: [
				oExpectedItem = new Item({
					text: "Algeria"
				})
			]
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();
		oComboBox.open();
		this.clock.tick(1000); // wait after the open animation is completed
		var sExpectedActiveDescendantId = oExpectedItem.getId();

		// act
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN);

		// assert
		assert.strictEqual(oComboBox.getFocusDomRef().getAttribute("aria-activedescendant"), sExpectedActiveDescendantId);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("it should load the items asynchronous when the Down arrow key is pressed and afterwards process the even", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			items: {
				path: "/Products",
				template: new Item({
					key: "{ProductId}",
					text: "{Name}"
				})
			},
			loadItems: function () {
				oComboBox.setModel(oModel);
			}
		});

		// arrange
		var sUri = "/service/";
		var iAutoRespondAfter = 10;
		var oMockServer = fnStartMockServer(sUri, iAutoRespondAfter);
		var oModel = new ODataModel(sUri, true);
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();

		// act
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN);
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN);

		// tick the clock ahead some ms millisecond (it should be at least more than the auto respond setting
		// to make sure that the data from the OData model is available)
		this.clock.tick(iAutoRespondAfter + 1);

		// assert
		assert.ok(oComboBox.getItems().length > 0, "the items are loaded");
		assert.strictEqual(oComboBox.getValue(), "Psimax");
		assert.strictEqual(oComboBox.getSelectedText(), "Psimax", "the value in the input field is selected");
		assert.strictEqual(oComboBox.getSelectedItem().getText(), "Psimax");
		assert.strictEqual(oComboBox.getSelectedItem().getKey(), "id_2");
		assert.strictEqual(oComboBox.getSelectedKey(), "id_2");
		assert.strictEqual(oComboBox.getList().getSelectedItem().getText(), "Psimax");
		assert.strictEqual(oComboBox.getList().getSelectedItem().getKey(), "id_2");
		assert.strictEqual(oComboBox.getList().getSelectedKey(), "id_2");

		// cleanup
		oMockServer.stop();
		oMockServer.destroy();
		oComboBox.destroy();
		oModel.destroy();
	});

	QUnit.test("it should show busy indicator in the text field if the items are not loaded after a 300ms delay", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			items: {
				path: "/Products",
				template: new Item({
					key: "{ProductId}",
					text: "{Name}"
				})
			},
			loadItems: function () {
				oComboBox.setModel(oModel);
			}
		});

		// arrange
		var sUri = "/service/";
		var iAutoRespondAfter = 400;
		var oMockServer = fnStartMockServer(sUri, iAutoRespondAfter);
		var oModel = new ODataModel(sUri, true);
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();

		// act
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN);

		// tick the clock ahead some ms millisecond
		this.clock.tick(300);

		// assert
		assert.strictEqual(oComboBox.getBusy(), true);
		this.clock.tick(iAutoRespondAfter);
		assert.strictEqual(oComboBox.getBusy(), false);

		// cleanup
		oMockServer.stop();
		oMockServer.destroy();
		oComboBox.destroy();
		oModel.destroy();
	});

	QUnit.module("onsapup");

	QUnit.test("onsapup", function (assert) {

		// system under test
		var oItem;
		var oExpectedItem;
		var oComboBox = new ComboBox({
			items: [
				oExpectedItem = new Item({
					key: "0",
					text: "item 0 is selected"
				}),

				new Item({
					key: "1",
					text: "item 1",
					enabled: false
				}),

				oItem = new Item({
					key: "2",
					text: "item 2"
				})
			],

			selectedItem: oItem
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();
		var fnKeyUpSpy = this.spy(oComboBox, "onsapup");
		var fnFireSelectionChangeSpy = this.spy(oComboBox, "fireSelectionChange");

		// act
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ARROW_UP);

		// assert
		assert.strictEqual(fnKeyUpSpy.callCount, 1, "onsapup() method was called exactly once");
		assert.strictEqual(fnFireSelectionChangeSpy.callCount, 1, 'The "selectionChange" event was fired');
		assert.strictEqual(jQuery(oComboBox.getFocusDomRef()).getSelectedText(), "item 0 is selected");
		assert.ok(oComboBox.getSelectedItem() === oExpectedItem);
		assert.strictEqual(oComboBox.getFocusDomRef().value, "item 0 is selected");
		assert.ok(oComboBox.getList().getSelectedItem() === oExpectedItem);
		assert.strictEqual(jQuery(oComboBox.getFocusDomRef()).attr("aria-activedescendant"), undefined, 'The "aria-activedescendant" attribute is set when the active descendant is rendered and visible');

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onsapup - when keyboard UP key is pressed and the control is not editable, the value should not change", function (assert) {

		// system under test
		var oExpectedItem;
		var oComboBox = new ComboBox({
			editable: false,
			items: [
				new Item({
					key: "0",
					text: "item 0 is selected"
				}),

				oExpectedItem = new Item({
					key: "1",
					text: "item 1"
				})
			],

			selectedItem: oExpectedItem
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();
		var fnFireSelectionChangeSpy = this.spy(oComboBox, "fireSelectionChange");

		// act
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ARROW_UP);

		// assert
		assert.strictEqual(fnFireSelectionChangeSpy.callCount, 0, 'The "selectionChange" event was not fired');
		assert.ok(oComboBox.getSelectedItem() === oExpectedItem);
		assert.strictEqual(oComboBox.getFocusDomRef().value, "item 1");
		assert.ok(oComboBox.getList().getSelectedItem() === oExpectedItem);
		assert.strictEqual(jQuery(oComboBox.getFocusDomRef()).attr("aria-activedescendant"), undefined, 'The "aria-activedescendant" attribute is set when the active descendant is rendered and visible');

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onsapup", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "0",
					text: "item 0",
					enabled: false
				}),

				new Item({
					key: "1",
					text: "item 1",
					enabled: false
				}),

				new Item({
					key: "2",
					text: "item 2",
					enabled: false
				})
			]
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();
		var fnKeyUpSpy = this.spy(oComboBox, "onsapup");

		// act
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ARROW_UP);

		// assert
		assert.strictEqual(fnKeyUpSpy.callCount, 1, "onsapup() method was called exactly once");
		assert.ok(oComboBox.getSelectedItem() === null);
		assert.ok(oComboBox.getList().getSelectedItem() === null);
		assert.strictEqual(oComboBox.getValue(), "");
		assert.strictEqual(oComboBox.getProperty("value"), "");
		assert.strictEqual(jQuery(oComboBox.getFocusDomRef()).attr("aria-activedescendant"), undefined, 'The "aria-activedescendant" attribute is set when the active descendant is rendered and visible');

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onsapup", function (assert) {

		// system under test
		var oExpectedItem;
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "0",
					text: "item 0",
					enabled: false
				}),

				new Item({
					key: "1",
					text: "item 1",
					enabled: false
				}),

				oExpectedItem = new Item({
					key: "2",
					text: "item 2"
				})
			],

			selectedItem: oExpectedItem
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();
		var fnKeyUpSpy = this.stub(oComboBox, "onsapup");
		var fnFireSelectionChangeSpy = this.spy(oComboBox, "fireSelectionChange");

		// act
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ARROW_UP);

		// assert
		assert.strictEqual(fnKeyUpSpy.callCount, 1, "onsapup() method was called exactly once");
		assert.strictEqual(fnFireSelectionChangeSpy.callCount, 0, 'The "selectionChange" event is not fired');
		assert.ok(oComboBox.getSelectedItem() === oExpectedItem);
		assert.ok(oComboBox.getList().getSelectedItem() === oExpectedItem);
		assert.strictEqual(oComboBox.getValue(), "item 2");
		assert.strictEqual(oComboBox.getProperty("value"), "item 2");
		assert.strictEqual(jQuery(oComboBox.getFocusDomRef()).attr("aria-activedescendant"), undefined, 'The "aria-activedescendant" attribute is set when the active descendant is rendered and visible');

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onsapup changing the value in attachSelectionChange event handler", function (assert) {

		// system under test
		var sExpectedValue = "GER Germany";
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "GER",
					text: "Germany"
				}),

				new Item({
					key: "CU",
					text: "Cuba"
				})
			],

			selectedKey: "CU"
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();
		this.clock.tick(0);	// tick the clock ahead 0ms millisecond to make sure the async call to .selectText() on the focusin event handler does not override the type ahead
		oComboBox.attachSelectionChange(function (oControlEvent) {
			this.setValue(sExpectedValue);
		}, oComboBox);

		// act
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ARROW_UP);
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ARROW_UP);

		// assert
		assert.strictEqual(oComboBox.getValue(), sExpectedValue);
		assert.strictEqual(oComboBox.getProperty("value"), sExpectedValue);
		assert.strictEqual(jQuery(oComboBox.getFocusDomRef()).getSelectedText(), sExpectedValue);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onsapup the typed value should not gets selected (test case 1)", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			items: [
				new Item({
					text: "Algeria"
				}),

				new Item({
					text: "Argentina"
				}),

				new Item({
					text: "Australia"
				}),

				new Item({
					key: "GER",
					text: "Germany"
				})
			]
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();
		this.clock.tick(0);	// tick the clock ahead 0ms millisecond to make sure the async call to .selectText() on the focusin event handler does not override the type ahead
		sap.ui.qunit.QUnitUtils.triggerEvent("keydown", oComboBox.getFocusDomRef(), {
			which: KeyCodes.A
		});
		oComboBox.getFocusDomRef().value = "A";
		sap.ui.qunit.QUnitUtils.triggerEvent("input", oComboBox.getFocusDomRef());
		this.clock.tick(1000);

		// act
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN);
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ARROW_UP);

		// assert
		assert.strictEqual(oComboBox.getFocusDomRef().value, "Algeria");
		assert.strictEqual(jQuery(oComboBox.getFocusDomRef()).getSelectedText(), "lgeria");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onsapup the typed value should not get selected (test case 2)", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			items: [
				new Item({
					text: "Algeria"
				}),

				new Item({
					text: "Argentina"
				}),

				new Item({
					text: "Australia"
				}),

				new Item({
					key: "GER",
					text: "Germany"
				})
			]
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();
		this.clock.tick(0);	// tick the clock ahead 0ms millisecond to make sure the async call to .selectText() on the focusin event handler does not override the type ahead
		sap.ui.qunit.QUnitUtils.triggerEvent("keydown", oComboBox.getFocusDomRef(), {
			which: KeyCodes.A
		});
		oComboBox.getFocusDomRef().value = "A";
		sap.ui.qunit.QUnitUtils.triggerEvent("input", oComboBox.getFocusDomRef());
		this.clock.tick(0);
		jQuery(oComboBox.getFocusDomRef()).cursorPos(0);
		this.clock.tick(1000);

		// act
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN);
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ARROW_UP);

		// assert
		assert.strictEqual(oComboBox.getFocusDomRef().value, "Algeria");
		assert.strictEqual(jQuery(oComboBox.getFocusDomRef()).getSelectedText(), "");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test('onsapup the attribute "aria-activedescendant" is set', function (assert) {

		// system under test
		var oExpectedItem;
		var oComboBox = new ComboBox({
			items: [
				oExpectedItem = new Item({
					text: "Algeria"
				}),
				new Item({
					key: "AR",
					text: "Argentina"
				})
			],
			selectedKey: "AR"
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();
		this.clock.tick(0);	// tick the clock ahead 0ms millisecond to make sure the async call to .selectText() on the focusin event handler does not override the type ahead
		oComboBox.open();
		this.clock.tick(1000);	// wait after the open animation is completed
		var sExpectedActiveDescendantId = oExpectedItem.getId();

		// act
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ARROW_UP);

		// assert
		assert.strictEqual(oComboBox.getFocusDomRef().getAttribute("aria-activedescendant"), sExpectedActiveDescendantId);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.module("onsaphome");

	QUnit.test("onsaphome", function (assert) {

		// system under test
		var oExpectedItem;
		var oItem;
		var oComboBox = new ComboBox({
			items: [
				oExpectedItem = new Item({
					key: "0",
					text: "item 0 is selected"
				}),

				new Item({
					key: "1",
					text: "item 1"
				}),

				new Item({
					key: "2",
					text: "item 2",
					enabled: false
				}),

				oItem = new Item({
					key: "3",
					text: "item 3"
				}),

				new Item({
					key: "4",
					text: "item 4",
					enabled: false
				})
			],

			selectedItem: oItem
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();
		this.clock.tick(0);	// tick the clock ahead 0ms millisecond to make sure the async call to .selectText() on the focusin event handler does not override the type ahead
		var fnKeyHomeSpy = this.spy(oComboBox, "onsaphome");
		var fnFireSelectionChangeSpy = this.spy(oComboBox, "fireSelectionChange");

		// act
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.HOME);

		// assert
		assert.strictEqual(fnKeyHomeSpy.callCount, 1, "onsaphome() method was called exactly once");
		assert.strictEqual(fnFireSelectionChangeSpy.callCount, 1, 'The "selectionChange" event is fired');
		assert.strictEqual(oComboBox.getFocusDomRef().selectionStart, 0);
		assert.strictEqual(oComboBox.getFocusDomRef().selectionEnd, 18);
		assert.ok(oComboBox.getSelectedItem() === oExpectedItem);
		assert.ok(oComboBox.getList().getSelectedItem() === oExpectedItem);
		assert.strictEqual(oComboBox.getFocusDomRef().value, "item 0 is selected");
		assert.strictEqual(jQuery(oComboBox.getFocusDomRef()).attr("aria-activedescendant"), undefined, 'The "aria-activedescendant" attribute is set when the active descendant is rendered and visible');

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onsaphome - when Home key is pressed and the control's field is not editable, the value should not change", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			editable: false,
			items: [
				new Item({
					text: "item 0"
				})
			]
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();
		var fnFireSelectionChangeSpy = this.spy(oComboBox, "fireSelectionChange");

		// act
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.HOME);

		// assert
		assert.strictEqual(fnFireSelectionChangeSpy.callCount, 0, 'The "selectionChange" event was not fired');
		assert.ok(oComboBox.getSelectedItem() === null);
		assert.ok(oComboBox.getList().getSelectedItem() === null);
		assert.strictEqual(oComboBox.getFocusDomRef().value, "");
		assert.strictEqual(jQuery(oComboBox.getFocusDomRef()).attr("aria-activedescendant"), undefined, 'The "aria-activedescendant" attribute is set when the active descendant is rendered and visible');

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onsaphome", function (assert) {

		// system under test
		var oExpectedItem;
		var oItem;
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "0",
					text: "item 0",
					enabled: false
				}),

				oExpectedItem = new Item({
					key: "1",
					text: "item 1 is selected"
				}),

				new Item({
					key: "2",
					text: "item 2"
				}),

				new Item({
					key: "3",
					text: "item 3"
				}),

				oItem = new Item({
					key: "4",
					text: "item 4"
				})
			],

			selectedItem: oItem
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();
		this.clock.tick(0);	// tick the clock ahead 0ms millisecond to make sure the async call to .selectText() on the focusin event handler does not override the type ahead
		var fnKeyHomeSpy = this.spy(oComboBox, "onsaphome");
		var fnFireSelectionChangeSpy = this.spy(oComboBox, "fireSelectionChange");

		// act
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.HOME);

		// assert
		assert.strictEqual(fnKeyHomeSpy.callCount, 1, "onsaphome() method was called exactly once");
		assert.strictEqual(fnFireSelectionChangeSpy.callCount, 1, 'The "selectionChange" event is fired');
		assert.strictEqual(oComboBox.getFocusDomRef().selectionStart, 0);
		assert.strictEqual(oComboBox.getFocusDomRef().selectionEnd, 18);
		assert.ok(oComboBox.getSelectedItem() === oExpectedItem);
		assert.ok(oComboBox.getList().getSelectedItem() === oExpectedItem);
		assert.strictEqual(oComboBox.getFocusDomRef().value, "item 1 is selected");
		assert.strictEqual(jQuery(oComboBox.getFocusDomRef()).attr("aria-activedescendant"), undefined, 'The "aria-activedescendant" attribute is set when the active descendant is rendered and visible');

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onsaphome changing the value in attachSelectionChange event handler", function (assert) {

		// system under test
		var sExpectedValue = "0 item 0 is selected";
		var oItem;
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "0",
					text: "item 0 is selected"
				}),

				new Item({
					key: "1",
					text: "item 1"
				}),

				new Item({
					key: "2",
					text: "item 2"
				}),

				new Item({
					key: "3",
					text: "item 3"
				}),

				oItem = new Item({
					key: "4",
					text: "item 4"
				})
			],

			selectedItem: oItem
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();
		this.clock.tick(0);	// tick the clock ahead 0ms millisecond to make sure the async call to .selectText() on the focusin event handler does not override the type ahead
		oComboBox.attachSelectionChange(function (oControlEvent) {
			this.setValue(sExpectedValue);
		}, oComboBox);

		// act
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.HOME);
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.HOME);

		// assert
		assert.strictEqual(oComboBox.getValue(), sExpectedValue);
		assert.strictEqual(oComboBox.getProperty("value"), sExpectedValue);
		assert.strictEqual(oComboBox.getFocusDomRef().selectionStart, 0);
		assert.strictEqual(oComboBox.getFocusDomRef().selectionEnd, sExpectedValue.length);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onsaphome the attribute aria-activedescendant is set", function (assert) {

		// system under test
		var oExpectedItem;
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "0",
					text: "item 0",
					enabled: false
				}),

				oExpectedItem = new Item({
					key: "1",
					text: "item 1 is selected"
				}),

				new Item({
					key: "2",
					text: "item 2"
				}),

				new Item({
					key: "3",
					text: "item 3"
				})
			],

			selectedKey: "3"
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();
		this.clock.tick(0);	// tick the clock ahead 0ms millisecond to make sure the async call to .selectText() on the focusin event handler does not override the type ahead
		oComboBox.open();
		this.clock.tick(1000);	// wait after the open animation is completed
		var sExpectedActiveDescendantId = oExpectedItem.getId();

		// act
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.HOME);

		// assert
		assert.strictEqual(oComboBox.getFocusDomRef().getAttribute("aria-activedescendant"), sExpectedActiveDescendantId);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("it should load the items asynchronous when the Home key is pressed select the first selectable item", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			items: {
				path: "/Products",
				template: new Item({
					key: "{ProductId}",
					text: "{Name}"
				})
			},
			loadItems: function () {
				oComboBox.setModel(oModel);
			}
		});

		// arrange
		var sUri = "/service/";
		var iAutoRespondAfter = 10;
		var oMockServer = fnStartMockServer(sUri, iAutoRespondAfter);
		var oModel = new ODataModel(sUri, true);
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();

		// act
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.HOME);

		// tick the clock ahead some ms millisecond (it should be at least more than the auto respond setting
		// to make sure that the data from the OData model is available)
		this.clock.tick(iAutoRespondAfter + 1);

		// assert
		assert.ok(oComboBox.getItems().length > 0, "the items are loaded");
		assert.strictEqual(oComboBox.getValue(), "Gladiator MX");
		assert.strictEqual(oComboBox.getSelectedText(), "Gladiator MX");
		assert.strictEqual(oComboBox.getSelectedItem().getText(), "Gladiator MX");
		assert.strictEqual(oComboBox.getSelectedItem().getKey(), "id_1");
		assert.strictEqual(oComboBox.getSelectedKey(), "id_1");
		assert.strictEqual(oComboBox.getList().getSelectedItem().getText(), "Gladiator MX");
		assert.strictEqual(oComboBox.getList().getSelectedItem().getKey(), "id_1");
		assert.strictEqual(oComboBox.getList().getSelectedKey(), "id_1");

		// cleanup
		oMockServer.stop();
		oMockServer.destroy();
		oComboBox.destroy();
		oModel.destroy();
	});

	QUnit.module("onsapend");

	QUnit.test("onsapend", function (assert) {

		// system under test
		var oExpectedItem;
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "0",
					text: "item 0",
					enabled: false
				}),

				new Item({
					key: "1",
					text: "item 1"
				}),

				new Item({
					key: "2",
					text: "item 2"
				}),

				new Item({
					key: "3",
					text: "item 3"
				}),

				oExpectedItem = new Item({
					key: "4",
					text: "item 4 is selected"
				})
			]
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();
		this.clock.tick(0); // tick the clock ahead 0ms millisecond to make sure the async call to .selectText() on the focusin event handler does not override the type ahead
		var fnKeyEndSpy = this.spy(oComboBox, "onsapend");
		var fnFireSelectionChangeSpy = this.spy(oComboBox, "fireSelectionChange");

		// act
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.END);

		// assert
		assert.strictEqual(fnKeyEndSpy.callCount, 1, "onsapend() method was called exactly once");
		assert.strictEqual(fnFireSelectionChangeSpy.callCount, 1, 'The "selectionChange" event is fired');
		assert.strictEqual(oComboBox.getFocusDomRef().selectionStart, 0);
		assert.strictEqual(oComboBox.getFocusDomRef().selectionEnd, 18);
		assert.ok(oComboBox.getSelectedItem() === oExpectedItem);
		assert.ok(oComboBox.getList().getSelectedItem() === oExpectedItem);
		assert.strictEqual(jQuery(oComboBox.getFocusDomRef()).attr("aria-activedescendant"), undefined, 'The "aria-activedescendant" attribute is set when the active descendant is rendered and visible');
		assert.strictEqual(oComboBox.getFocusDomRef().value, "item 4 is selected");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onsapend changing the value in attachSelectionChange event handler", function (assert) {

		// system under test
		var sExpectedValue = "4 item 4 is selected";
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "0",
					text: "item 0"
				}),

				new Item({
					key: "1",
					text: "item 1"
				}),

				new Item({
					key: "2",
					text: "item 2"
				}),

				new Item({
					key: "3",
					text: "item 3"
				}),

				new Item({
					key: "4",
					text: "item 4 is selected"
				})
			]
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();
		this.clock.tick(0);	// tick the clock ahead 0ms millisecond to make sure the async call to .selectText() on the focusin event handler does not override the type ahead
		oComboBox.attachSelectionChange(function (oControlEvent) {
			this.setValue(sExpectedValue);
		}, oComboBox);

		// act
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.END);
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.END);

		// assert
		assert.strictEqual(oComboBox.getValue(), sExpectedValue);
		assert.strictEqual(oComboBox.getProperty("value"), sExpectedValue);
		assert.strictEqual(oComboBox.getFocusDomRef().selectionStart, 0);
		assert.strictEqual(oComboBox.getFocusDomRef().selectionEnd, sExpectedValue.length);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onsapend - when end key is pressed and the control's field is not editable, the value should not change", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			editable: false,
			items: [
				new Item({
					key: "0",
					text: "item 0"
				}),

				new Item({
					key: "1",
					text: "item 1"
				}),

				new Item({
					key: "2",
					text: "item 2"
				})
			]
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		var fnFireSelectionChangeSpy = this.spy(oComboBox, "fireSelectionChange");
		oComboBox.focus();

		// act
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.END);

		// assert
		assert.strictEqual(fnFireSelectionChangeSpy.callCount, 0, 'The "selectionChange" event was not fired');
		assert.ok(oComboBox.getSelectedItem() === null);
		assert.ok(oComboBox.getList().getSelectedItem() === null);
		assert.strictEqual(oComboBox.getFocusDomRef().value, "");
		assert.strictEqual(jQuery(oComboBox.getFocusDomRef()).attr("aria-activedescendant"), undefined, 'The "aria-activedescendant" attribute is set when the active descendant is rendered and visible');

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onsapend the attribute aria-activedescendant is set", function (assert) {

		// system under test
		var oExpectedItem;
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "0",
					text: "item 0"
				}),

				new Item({
					key: "1",
					text: "item 1"
				}),

				oExpectedItem = new Item({
					key: "2",
					text: "item 2"
				})
			]
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();
		oComboBox.open();
		this.clock.tick(1000);	// wait after the open animation is completed
		var sExpectedActiveDescendantId = oExpectedItem.getId();

		// act
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.END);

		// assert
		assert.strictEqual(oComboBox.getFocusDomRef().getAttribute("aria-activedescendant"), sExpectedActiveDescendantId);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("it should load the items asynchronous when the End key is pressed and afterwards process the event", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			items: {
				path: "/Products",
				template: new Item({
					key: "{ProductId}",
					text: "{Name}"
				})
			},
			loadItems: function () {
				oComboBox.setModel(oModel);
			}
		});

		// arrange
		var sUri = "/service/";
		var iAutoRespondAfter = 10;
		var oMockServer = fnStartMockServer(sUri, iAutoRespondAfter);
		var oModel = new ODataModel(sUri, true);
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();

		// act
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.END);

		// tick the clock ahead some ms millisecond (it should be at least more than the auto respond setting
		// to make sure that the data from the OData model is available)
		this.clock.tick(iAutoRespondAfter + 1);

		// assert
		assert.ok(oComboBox.getItems().length > 0, "the items are loaded");
		assert.strictEqual(oComboBox.getValue(), "Hardcore Hacker");
		assert.strictEqual(oComboBox.getSelectedText(), "Hardcore Hacker", "the value in the input field is selected");
		assert.strictEqual(oComboBox.getSelectedItem().getText(), "Hardcore Hacker");
		assert.strictEqual(oComboBox.getSelectedItem().getKey(), "id_16");
		assert.strictEqual(oComboBox.getSelectedKey(), "id_16");
		assert.strictEqual(oComboBox.getList().getSelectedItem().getText(), "Hardcore Hacker");
		assert.strictEqual(oComboBox.getList().getSelectedItem().getKey(), "id_16");
		assert.strictEqual(oComboBox.getList().getSelectedKey(), "id_16");

		// cleanup
		oMockServer.stop();
		oMockServer.destroy();
		oComboBox.destroy();
		oModel.destroy();
	});

	QUnit.module("onsappagedown");

	var pageDownTestCase = function (sTestName, mOptions) {
		QUnit.test("onsappagedown", function (assert) {

			// system under test
			var oComboBox = mOptions.control;

			// arrange
			oComboBox.placeAt("content");
			sap.ui.getCore().applyChanges();
			oComboBox.focus();
			this.clock.tick(0);	// tick the clock ahead 0ms millisecond to make sure the async call to .selectText() on the focusin event handler does not override the type ahead
			var fnPageDownSpy = this.spy(oComboBox, "onsappagedown");
			var fnFireSelectionChangeSpy = this.spy(oComboBox, "fireSelectionChange");

			// act
			sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.PAGE_DOWN);

			// assert
			assert.strictEqual(fnPageDownSpy.callCount, 1, "onsappagedown() method was called exactly once");
			assert.strictEqual(fnFireSelectionChangeSpy.callCount, 1, 'The "selectionChange" event is fired');
			assert.strictEqual(oComboBox.getFocusDomRef().selectionStart, 0);
			assert.strictEqual(oComboBox.getFocusDomRef().selectionEnd, oComboBox.getFocusDomRef().value.length);
			assert.ok(oComboBox.getSelectedItem() === mOptions.output);
			assert.strictEqual(oComboBox.getSelectedItemId(), mOptions.output.getId());
			assert.strictEqual(oComboBox.getSelectedKey(), mOptions.output.getKey());
			assert.ok(oComboBox.getList().getSelectedItem() === mOptions.output);
			assert.strictEqual(oComboBox.getFocusDomRef().value, mOptions.output.getText());

			// cleanup
			oComboBox.destroy();
		});
	};

	(function () {

		var oExpectedItem;

		// test cases
		pageDownTestCase("", {
			control: new ComboBox({
				items: [
					new Item({
						key: "DZ",
						text: "Algeria"
					}),

					new Item({
						key: "AR",
						text: "Argentina"
					}),

					new Item({
						key: "AU",
						text: "Australia"
					}),

					new Item({
						key: "AT",
						text: "Austria"
					}),

					new Item({
						key: "BH",
						text: "Bahrain"
					}),

					new Item({
						key: "BE",
						text: "Belgium"
					}),

					new Item({
						key: "BA",
						text: "Bosnia and Herzegovina"
					}),

					new Item({
						key: "BR",
						text: "Brazil"
					}),

					new Item({
						key: "BG",
						text: "Bulgaria"
					}),

					oExpectedItem = new Item({
						key: "CA",
						text: "Canada"
					}),

					new Item({
						key: "CL",
						text: "Chile"
					}),

					new Item({
						key: "CO",
						text: "Colombia"
					}),

					new Item({
						key: "HR",
						text: "Croatia"
					}),

					new Item({
						key: "CU",
						text: "Cuba"
					}),

					new Item({
						key: "CZ",
						text: "Czech Republic"
					}),

					new Item({
						key: "DK",
						text: "Denmark"
					}),

					new Item({
						key: "EG",
						text: "Egypt"
					}),

					new Item({
						key: "EE",
						text: "Estonia"
					}),

					new Item({
						key: "FI",
						text: "Finland"
					}),

					new Item({
						key: "FR",
						text: "France",
						enabled: false
					}),

					new Item({
						key: "GH",
						text: "Ghana"
					}),

					new Item({
						key: "DZ",
						text: "Algeria"
					})
				]
			}),

			output: oExpectedItem
		});
	}());

	QUnit.test("onsappagedown changing the value in attachSelectionChange event handler", function (assert) {

		// system under test
		var sExpectedValue = "BH Bahrain is selected";
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "DZ",
					text: "Algeria"
				}),

				new Item({
					key: "AR",
					text: "Argentina"
				}),

				new Item({
					key: "AU",
					text: "Australia"
				}),

				new Item({
					key: "AT",
					text: "Austria"
				}),

				new Item({
					key: "BH",
					text: "Bahrain is selected"
				})
			]
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();
		this.clock.tick(0);	// tick the clock ahead 0ms millisecond to make sure the async call to .selectText() on the focusin event handler does not override the type ahead
		oComboBox.attachSelectionChange(function (oControlEvent) {
			this.setValue(sExpectedValue);
		}, oComboBox);

		// act
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.PAGE_DOWN);
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.PAGE_DOWN);

		// assert
		assert.strictEqual(oComboBox.getValue(), sExpectedValue);
		assert.strictEqual(oComboBox.getProperty("value"), sExpectedValue);
		assert.strictEqual(oComboBox.getFocusDomRef().selectionStart, 0);
		assert.strictEqual(oComboBox.getFocusDomRef().selectionEnd, sExpectedValue.length);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onsappagedown when page down key is pressed and the control's field is not editable, the value should not change", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			editable: false,
			items: [
				new Item({
					key: "DZ",
					text: "Algeria"
				}),

				new Item({
					key: "AR",
					text: "Argentina"
				}),

				new Item({
					key: "AU",
					text: "Australia"
				}),

				new Item({
					key: "AT",
					text: "Austria"
				}),

				new Item({
					key: "BH",
					text: "Bahrain is selected"
				})
			]
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		var fnFireSelectionChangeSpy = this.spy(oComboBox, "fireSelectionChange");
		oComboBox.focus();

		// act
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.PAGE_DOWN);

		// assert
		assert.strictEqual(fnFireSelectionChangeSpy.callCount, 0, 'The "selectionChange" event was not fired');
		assert.ok(oComboBox.getSelectedItem() === null);
		assert.ok(oComboBox.getList().getSelectedItem() === null);
		assert.strictEqual(oComboBox.getFocusDomRef().value, "");
		assert.strictEqual(jQuery(oComboBox.getFocusDomRef()).attr("aria-activedescendant"), undefined, 'The "aria-activedescendant" attribute is set when the active descendant is rendered and visible');

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onsappagedown the attribute aria-activedescendant is set", function (assert) {

		// system under test
		var oExpectedItem;
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "DZ",
					text: "Algeria"
				}),

				new Item({
					key: "AR",
					text: "Argentina"
				}),

				new Item({
					key: "AU",
					text: "Australia"
				}),

				new Item({
					key: "AT",
					text: "Austria"
				}),

				oExpectedItem = new Item({
					key: "BH",
					text: "Bahrain is selected"
				})
			]
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();
		oComboBox.open();
		this.clock.tick(1000);	// wait after the open animation is completed
		var sExpectedActiveDescendantId = oExpectedItem.getId();

		// act
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.PAGE_DOWN);

		// assert
		assert.strictEqual(oComboBox.getFocusDomRef().getAttribute("aria-activedescendant"), sExpectedActiveDescendantId);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("it should load the items asynchronous when the Page Down key is pressed and afterwards process the even", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			items: {
				path: "/Products",
				template: new Item({
					key: "{ProductId}",
					text: "{Name}"
				})
			},
			loadItems: function () {
				oComboBox.setModel(oModel);
			}
		});

		// arrange
		var sUri = "/service/";
		var iAutoRespondAfter = 10;
		var oMockServer = fnStartMockServer(sUri, iAutoRespondAfter);
		var oModel = new ODataModel(sUri, true);
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();

		// act
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.PAGE_DOWN);

		// tick the clock ahead some ms millisecond (it should be at least more than the auto respond setting
		// to make sure that the data from the OData model is available)
		this.clock.tick(iAutoRespondAfter + 1);

		// assert
		assert.ok(oComboBox.getItems().length > 0, "the items are loaded");
		assert.strictEqual(oComboBox.getValue(), "Laser Allround Pro");
		assert.strictEqual(oComboBox.getSelectedText(), "Laser Allround Pro", "the value in the input field is selected");
		assert.strictEqual(oComboBox.getSelectedItem().getText(), "Laser Allround Pro");
		assert.strictEqual(oComboBox.getSelectedItem().getKey(), "id_10");
		assert.strictEqual(oComboBox.getSelectedKey(), "id_10");
		assert.strictEqual(oComboBox.getList().getSelectedItem().getText(), "Laser Allround Pro");
		assert.strictEqual(oComboBox.getList().getSelectedItem().getKey(), "id_10");
		assert.strictEqual(oComboBox.getList().getSelectedKey(), "id_10");

		// cleanup
		oMockServer.stop();
		oMockServer.destroy();
		oComboBox.destroy();
		oModel.destroy();
	});

	QUnit.module("onsappageup");

	var pageUpTestCase = function (sTestName, mOptions) {
		QUnit.test("onsappageup", function (assert) {

			// system under test
			var oComboBox = mOptions.control;

			// arrange
			oComboBox.placeAt("content");
			sap.ui.getCore().applyChanges();
			oComboBox.focus();
			this.clock.tick(0);	// tick the clock ahead 0ms millisecond to make sure the async call to .selectText() on the focusin event handler does not override the type ahead
			var fnPageUpSpy = this.spy(oComboBox, "onsappageup");
			var fnFireSelectionChangeSpy = this.spy(oComboBox, "fireSelectionChange");

			// act
			sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.PAGE_UP);

			// assert
			assert.strictEqual(fnPageUpSpy.callCount, 1, "onsappageup() method was called exactly once");
			assert.strictEqual(fnFireSelectionChangeSpy.callCount, 1, 'The "selectionChange" event is fired');
			assert.strictEqual(oComboBox.getFocusDomRef().selectionStart, 0);
			assert.strictEqual(oComboBox.getFocusDomRef().selectionEnd, oComboBox.getFocusDomRef().value.length);
			assert.ok(oComboBox.getSelectedItem() === mOptions.output);
			assert.strictEqual(oComboBox.getSelectedItemId(), mOptions.output.getId());
			assert.strictEqual(oComboBox.getSelectedKey(), mOptions.output.getKey());
			assert.ok(oComboBox.getList().getSelectedItem() === mOptions.output);
			assert.strictEqual(oComboBox.getFocusDomRef().value, mOptions.output.getText());

			// cleanup
			oComboBox.destroy();
		});
	};

	(function () {

		var oExpectedItem;

		// test cases
		pageUpTestCase("", {
			control: new ComboBox({
				items: [
					new Item({
						key: "DZ",
						text: "Algeria",
						enabled: false
					}),

					new Item({
						key: "AR",
						text: "Argentina"
					}),

					new Item({
						key: "AU",
						text: "Australia"
					}),

					new Item({
						key: "AT",
						text: "Austria"
					}),

					new Item({
						key: "BH",
						text: "Bahrain"
					}),

					new Item({
						key: "BE",
						text: "Belgium"
					}),

					new Item({
						key: "BA",
						text: "Bosnia and Herzegovina"
					}),

					new Item({
						key: "BR",
						text: "Brazil"
					}),

					new Item({
						key: "BG",
						text: "Bulgaria"
					}),

					new Item({
						key: "CA",
						text: "Canada"
					}),

					oExpectedItem = new Item({
						key: "CL",
						text: "Chile"
					}),

					new Item({
						key: "CO",
						text: "Colombia"
					}),

					new Item({
						key: "HR",
						text: "Croatia"
					}),

					new Item({
						key: "CU",
						text: "Cuba"
					}),

					new Item({
						key: "CZ",
						text: "Czech Republic"
					}),

					new Item({
						key: "DK",
						text: "Denmark"
					}),

					new Item({
						key: "EG",
						text: "Egypt"
					}),

					new Item({
						key: "EE",
						text: "Estonia"
					}),

					new Item({
						key: "FI",
						text: "Finland"
					}),

					new Item({
						key: "FR",
						text: "France"
					}),

					new Item({
						key: "GH",
						text: "Ghana"
					}),

					new Item({
						key: "DZ",
						text: "Algeria"
					})
				],

				selectedKey: "GH"
			}),

			output: oExpectedItem
		});
	}());

	QUnit.test("onsappageup changing the value in attachSelectionChange event handler", function (assert) {

		// system under test
		var sExpectedValue = "DZ Algeria is selected";
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "DZ",
					text: "Algeria is selected"
				}),

				new Item({
					key: "AR",
					text: "Argentina"
				}),

				new Item({
					key: "AU",
					text: "Australia"
				}),

				new Item({
					key: "AT",
					text: "Austria"
				}),

				new Item({
					key: "BH",
					text: "Bahrain"
				})
			],

			selectedKey: "BH"
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();
		this.clock.tick(0);	// tick the clock ahead 0ms millisecond to make sure the async call to .selectText() on the focusin event handler does not override the type ahead
		oComboBox.attachSelectionChange(function (oControlEvent) {
			this.setValue(sExpectedValue);
		}, oComboBox);

		// act
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.PAGE_UP);
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.PAGE_UP);

		// assert
		assert.strictEqual(oComboBox.getFocusDomRef().value, sExpectedValue);
		assert.strictEqual(oComboBox.getFocusDomRef().selectionStart, 0);
		assert.strictEqual(oComboBox.getFocusDomRef().selectionEnd, sExpectedValue.length);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onsappageup - when page up key is pressed and the control's field is not editable, the value should not change", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			editable: false,
			items: [
				new Item({
					key: "DZ",
					text: "Algeria"
				}),

				new Item({
					key: "AR",
					text: "Argentina"
				}),

				new Item({
					key: "AU",
					text: "Australia"
				}),

				new Item({
					key: "AT",
					text: "Austria"
				}),

				new Item({
					key: "BH",
					text: "Bahrain"
				})
			]
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		var fnFireSelectionChangeSpy = this.spy(oComboBox, "fireSelectionChange");
		oComboBox.focus();

		// act
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.PAGE_UP);

		// assert
		assert.strictEqual(fnFireSelectionChangeSpy.callCount, 0, 'The "selectionChange" event was not fired');
		assert.ok(oComboBox.getSelectedItem() === null);
		assert.ok(oComboBox.getList().getSelectedItem() === null);
		assert.strictEqual(oComboBox.getFocusDomRef().value, "");
		assert.strictEqual(jQuery(oComboBox.getFocusDomRef()).attr("aria-activedescendant"), undefined, 'The "aria-activedescendant" attribute is set when the active descendant is rendered and visible');

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onsappageup the attribute aria-activedescendant is set", function (assert) {

		// system under test
		var oExpectedItem;
		var oComboBox = new ComboBox({
			items: [
				oExpectedItem = new Item({
					key: "DZ",
					text: "Algeria"
				}),

				new Item({
					key: "AR",
					text: "Argentina"
				}),

				new Item({
					key: "AU",
					text: "Australia"
				}),

				new Item({
					key: "AT",
					text: "Austria"
				}),

				new Item({
					key: "BH",
					text: "Bahrain is selected"
				})
			],
			selectedKey: "BH"
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();
		oComboBox.open();
		this.clock.tick(1000);	// wait 1s after the open animation is completed
		var sExpectedActiveDescendantId = oExpectedItem.getId();

		// act
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.PAGE_UP);

		// assert
		assert.strictEqual(oComboBox.getFocusDomRef().getAttribute("aria-activedescendant"), sExpectedActiveDescendantId);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("it should load the items asynchronous when the Page Up key is pressed and afterwards process the even", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			items: {
				path: "/Products",
				template: new Item({
					key: "{ProductId}",
					text: "{Name}"
				})
			},
			loadItems: function () {
				oComboBox.setModel(oModel);
			}
		});

		// arrange
		var sUri = "/service/";
		var iAutoRespondAfter = 10;
		var oMockServer = fnStartMockServer(sUri, iAutoRespondAfter);
		var oModel = new ODataModel(sUri, true);
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();

		// act
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.PAGE_UP);

		// tick the clock ahead some ms millisecond (it should be at least more than the auto respond setting
		// to make sure that the data from the OData model is available)
		this.clock.tick(iAutoRespondAfter + 1);

		// assert
		assert.ok(oComboBox.getItems().length > 0, "the items are loaded");
		assert.strictEqual(oComboBox.getValue(), "Gladiator MX");
		assert.strictEqual(oComboBox.getSelectedText(), "Gladiator MX", "the value in the input field is selected");
		assert.strictEqual(oComboBox.getSelectedItem().getText(), "Gladiator MX");
		assert.strictEqual(oComboBox.getSelectedItem().getKey(), "id_1");
		assert.strictEqual(oComboBox.getSelectedKey(), "id_1");
		assert.strictEqual(oComboBox.getList().getSelectedItem().getText(), "Gladiator MX");
		assert.strictEqual(oComboBox.getList().getSelectedItem().getKey(), "id_1");
		assert.strictEqual(oComboBox.getList().getSelectedKey(), "id_1");

		// cleanup
		oMockServer.stop();
		oMockServer.destroy();
		oComboBox.destroy();
		oModel.destroy();
	});

	QUnit.module("oninput");

	QUnit.test("oninput the ComboBox's picker pop-up should open", function (assert) {

		// system under test
		var oExpectedItem;
		var oComboBox = new ComboBox({
			items: [
				new Item({
					text: "Egypt"
				}),
				oExpectedItem = new Item({
					text: "Germany"
				}),
				new Item({
					text: "Ghana"
				}),
				new Item({
					text: "Greece"
				})
			]
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();
		var fnOpenSpy = this.spy(oComboBox, "open");
		var fnFireSelectionChangeSpy = this.spy(oComboBox, "fireSelectionChange");
		var sExpectedActiveDescendantId = oExpectedItem.getId();

		// act
		oComboBox.getFocusDomRef().value = "G";
		sap.ui.qunit.QUnitUtils.triggerEvent("input", oComboBox.getFocusDomRef());
		this.clock.tick(1000);	// wait 1s after the open animation is completed

		// assert
		assert.strictEqual(fnOpenSpy.callCount, 1, "open() method was called exactly once");
		assert.strictEqual(fnFireSelectionChangeSpy.callCount, 1, 'The "selectionChange" event is fired');
		assert.strictEqual(oComboBox.getVisibleItems().length, 3, "Three items are visible");
		assert.strictEqual(oComboBox.getFocusDomRef().getAttribute("aria-activedescendant"), sExpectedActiveDescendantId);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("oninput close the picker popup if there are not suggestions", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "GER",
					text: "Germany"
				})
			]
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();
		oComboBox.open();
		this.clock.tick(1000);
		var fnFireSelectionChangeSpy = this.spy(oComboBox, "fireSelectionChange");
		var fnOpenSpy = this.spy(oComboBox, "open");
		var fnCloseSpy = this.spy(oComboBox, "close");
		var sOpenState = !jQuery.support.cssAnimations ? OpenState.CLOSED : OpenState.CLOSING;	// no animation on ie9

		// act
		oComboBox.getFocusDomRef().value = "v";
		sap.ui.qunit.QUnitUtils.triggerEvent("input", oComboBox.getFocusDomRef());

		// assert
		assert.strictEqual(fnOpenSpy.callCount, 0, "open() method was not called");
		assert.strictEqual(fnCloseSpy.callCount, 1, "close() method was called");
		assert.strictEqual(oComboBox.getPicker().oPopup.getOpenState(), sOpenState);
		assert.strictEqual(fnFireSelectionChangeSpy.callCount, 0, 'The "selectionChange" event is not fired');
		assert.strictEqual(jQuery(oComboBox.getFocusDomRef()).attr("aria-activedescendant"), undefined, 'The "aria-activedescendant" attribute is set when the active descendant is rendered and visible');

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("oninput reset the selection when the value of the ComboBox's input field is empty", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "GER",
					text: "Germany"
				})
			],

			selectedKey: "GER"
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();
		var oEvent = new jQuery.Event("input", {
			target: oComboBox.getFocusDomRef()
		});

		// act
		oComboBox.setValue("");
		oComboBox.oninput(oEvent);

		// assert
		assert.ok(oComboBox.getSelectedItem() === null);
		assert.strictEqual(oComboBox.getSelectedItemId(), "");
		assert.strictEqual(oComboBox.getSelectedKey(), "");
		assert.ok(oComboBox.getList().getSelectedItem() === null);
		assert.strictEqual(oComboBox.getValue(), "");
		assert.strictEqual(oComboBox.getProperty("value"), "");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("oninput clear the selection and the filter if not match is found", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "GER",
					text: "Germany"
				})
			],
			selectedKey: "GER"
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();

		// act
		oComboBox.getFocusDomRef().value = "v";
		sap.ui.qunit.QUnitUtils.triggerEvent("input", oComboBox.getFocusDomRef());

		// assert
		assert.ok(oComboBox.getSelectedItem() === null);
		assert.strictEqual(oComboBox.getSelectedItemId(), "");
		assert.strictEqual(oComboBox.getSelectedKey(), "");
		assert.ok(oComboBox.getList().getSelectedItem() === null);
		assert.strictEqual(oComboBox.isFiltered(), false);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("oninput search in both columns if 'filterSecondaryValues' is true", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			filterSecondaryValues: true,
			items: [
				new ListItem({
					key: "GER",
					text: "Germany",
					additionalText: "GER"
				}),
				new ListItem({
					key: "BG",
					text: "Bulgaria",
					additionalText: "BG"
				}),
				new ListItem({
					key: "DZ",
					text: "Algeria",
					additionalText: "DZ"
				}),
				new ListItem({
					key: "DK",
					text: "Denmark",
					additionalText: "DK"
				})
			]
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();

		// act
		oComboBox.getFocusDomRef().value = "D";
		sap.ui.qunit.QUnitUtils.triggerEvent("input", oComboBox.getFocusDomRef());

		// assert
		assert.strictEqual(oComboBox.getSelectedItem().getText(), "Denmark", "Selected value should be 'Denmark'");
		assert.strictEqual(oComboBox.getSelectedKey(), "DK");
		assert.strictEqual(oComboBox.isFiltered(), true);
		assert.strictEqual(oComboBox.getValue(), "Denmark");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("oninput the value should be propperly displayed when search in both columns is activated test case 1", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			filterSecondaryValues: true,
			items: [
				new ListItem({
					key: "GER",
					text: "Germany",
					additionalText: "GER"
				}),
				new ListItem({
					key: "BG",
					text: "Bulgaria",
					additionalText: "BG"
				}),
				new ListItem({
					key: "DZ",
					text: "Algeria",
					additionalText: "DZ"
				}),
				new ListItem({
					key: "DK",
					text: "Denmark",
					additionalText: "DK"
				})
			]
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();

		// act
		oComboBox.getFocusDomRef().value = "dk";
		sap.ui.qunit.QUnitUtils.triggerEvent("input", oComboBox.getFocusDomRef());

		// assert
		assert.ok(oComboBox.getSelectedItem().getText() === "Denmark");
		assert.strictEqual(oComboBox.getSelectedKey(), "DK");
		assert.strictEqual(oComboBox.isFiltered(), true);
		assert.strictEqual(oComboBox.getValue(), "DK");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("oninput the value should be propperly displayed when search in both columns is activated test case 2", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			filterSecondaryValues: true,
			items: [
				new ListItem({
					key: "GER",
					text: "Germany",
					additionalText: "GER"
				}),
				new ListItem({
					key: "BG",
					text: "Bulgaria",
					additionalText: "BG"
				}),
				new ListItem({
					key: "DZ",
					text: "Algeria",
					additionalText: "DZ"
				}),
				new ListItem({
					key: "DK",
					text: "Denmark",
					additionalText: "DK"
				})
			]
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();

		// act
		oComboBox.getFocusDomRef().value = "dz";
		sap.ui.qunit.QUnitUtils.triggerEvent("input", oComboBox.getFocusDomRef());

		// assert
		assert.ok(oComboBox.getSelectedItem().getText() === "Algeria");
		assert.strictEqual(oComboBox.getSelectedKey(), "DZ");
		assert.strictEqual(oComboBox.isFiltered(), true);
		assert.strictEqual(oComboBox.getValue(), "DZ");

		// cleanup
		oComboBox.destroy();
	});

	// BCP 1580015527
	QUnit.test("it should not open the picker pop-up", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			editable: false,
			items: [
				new Item({
					text: ""
				})
			]
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		var fnOpenSpy = this.spy(ComboBox.prototype, "open");
		oComboBox.focus();

		// act
		sap.ui.qunit.QUnitUtils.triggerEvent("input", oComboBox.getFocusDomRef());

		// assert
		assert.strictEqual(fnOpenSpy.callCount, 0);

		// cleanup
		oComboBox.destroy();
	});

	// BCP 1670033530
	QUnit.test("it should not select the disabled item while typing in the text field", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			items: [
				new Item({
					text: "lorem ipsum",
					enabled: false
				})
			]
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();
		var oTarget = oComboBox.getFocusDomRef();
		oTarget.value = "l";

		// act
		sap.ui.qunit.QUnitUtils.triggerEvent("input", oTarget);

		// assert
		assert.ok(oComboBox.getSelectedItem() === null);
		assert.strictEqual(oComboBox.getSelectedItemId(), "");
		assert.strictEqual(oComboBox.getSelectedKey(), "");
		assert.ok(oComboBox.getList().getSelectedItem() === null);
		assert.strictEqual(oComboBox.getList().getSelectedItemId(), "");
		assert.strictEqual(oComboBox.getList().getSelectedKey(), "");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("it should load the items asynchronous and perform autocomplete", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			items: {
				path: "/Products",
				template: new Item({
					key: "{ProductId}",
					text: "{Name}"
				})
			},
			loadItems: function () {
				oComboBox.setModel(oModel);
			}
		});

		// arrange
		var sUri = "/service/";
		var iAutoRespondAfter = 10;
		var oMockServer = fnStartMockServer(sUri, iAutoRespondAfter);
		var oModel = new ODataModel(sUri, true);
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();
		var oTarget = oComboBox.getFocusDomRef();

		// act

		// fake user interaction, (the keydown and input events)
		oTarget.value = "F";
		sap.ui.qunit.QUnitUtils.triggerKeydown(oTarget, KeyCodes.F);
		sap.ui.qunit.QUnitUtils.triggerEvent("input", oTarget);

		oTarget.value = "Fl";
		sap.ui.qunit.QUnitUtils.triggerKeydown(oTarget, KeyCodes.L);
		sap.ui.qunit.QUnitUtils.triggerEvent("input", oTarget);

		// tick the clock ahead some ms millisecond (it should be at least more than the auto respond setting
		// to make sure that the data from the OData model is available)
		this.clock.tick(iAutoRespondAfter + 2);

		// assert
		assert.strictEqual(oComboBox.getValue(), "Flat S", "the value is correct");
		assert.strictEqual(oComboBox.getSelectedText(), "at S", "the word completion is correct");
		assert.strictEqual(oComboBox.getSelectedItem().getText(), "Flat S");
		assert.strictEqual(oComboBox.getSelectedItem().getKey(), "id_11");
		assert.strictEqual(oComboBox.getSelectedKey(), "id_11");
		assert.strictEqual(oComboBox.getList().getSelectedItem().getText(), "Flat S");
		assert.strictEqual(oComboBox.getList().getSelectedItem().getKey(), "id_11");
		assert.strictEqual(oComboBox.getList().getSelectedKey(), "id_11");
		assert.strictEqual(oComboBox.getItems().length, 16, "the items are loaded");
		assert.strictEqual(oComboBox.getVisibleItems().length, 3, "the suggestion list is filtered");
		assert.ok(oComboBox.isOpen());

		// cleanup
		oMockServer.stop();
		oMockServer.destroy();
		oComboBox.destroy();
		oModel.destroy();
	});

	QUnit.test("it should filter the list on phones", function (assert) {

		this.stub(Device, "system", {
			desktop: false,
			phone: true,
			tablet: false
		});

		// system under test
		var sExpectedValue = "lorem ipsum";
		var oComboBox = new ComboBox({
			items: [
				new Item({
					text: sExpectedValue
				}),
				new Item({
					text: "ipsum alorem"
				})
			]
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();
		oComboBox.open();
		this.clock.tick(1000); // tick the clock ahead 1 second, after the open animation is completed
		var oPickerTextField = oComboBox.getPickerTextField();
		oPickerTextField.focus();
		var oPickerTextFieldDomRef = oPickerTextField.getFocusDomRef();
		oPickerTextFieldDomRef.value = "l";

		// act
		sap.ui.qunit.QUnitUtils.triggerEvent("keydown", oPickerTextFieldDomRef, {
			which: KeyCodes.L,
			srcControl: oPickerTextField
		});
		sap.ui.qunit.QUnitUtils.triggerEvent("input", oPickerTextFieldDomRef, {
			srcControl: oPickerTextField
		});
		this.clock.tick(1000); // tick the clock ahead 1 second, after the open animation is completed

		// assert
		assert.strictEqual(oPickerTextField.getValue(), sExpectedValue);
		assert.ok(oComboBox.isFiltered());
		this.clock.tick(300);
		assert.strictEqual(oPickerTextField.getSelectedText(), "orem ipsum");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("it should close the dropdown list when the text field is empty and it was opened by typing text", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			items: [
				new Item({
					text: "Egypt"
				}),
				new Item({
					text: "Germany"
				}),
				new Item({
					text: "Ghana"
				}),
				new Item({
					text: "Greece"
				})
			]
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();

		// act
		oComboBox.getFocusDomRef().value = "G";
		sap.ui.qunit.QUnitUtils.triggerEvent("input", oComboBox.getFocusDomRef());
		this.clock.tick(1000);	// wait 1s after the open animation is completed

		// act
		oComboBox.getFocusDomRef().value = "";
		sap.ui.qunit.QUnitUtils.triggerEvent("input", oComboBox.getFocusDomRef());
		this.clock.tick(300);

		// assert
		assert.ok(!oComboBox.isOpen());

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("it should not close the dropdown list when the text field is empty and it was opened by keyboard or by pressing the button", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			items: [
				new Item({
					text: "Egypt"
				}),
				new Item({
					text: "Germany"
				}),
				new Item({
					text: "Ghana"
				}),
				new Item({
					text: "Greece"
				})
			]
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();

		// act
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN, false, true);
		this.clock.tick(500);

		// act
		oComboBox.getFocusDomRef().value = "";
		sap.ui.qunit.QUnitUtils.triggerEvent("input", oComboBox.getFocusDomRef());
		this.clock.tick(500);

		// assert
		assert.ok(oComboBox.isOpen());

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("it should not close the dropdown during typing if it was opened by keyboard", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			items: [
				new Item({
					text: "lorem ipsum"
				})
			]
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();

		// act
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.F4);	// open the dropdown list
		this.clock.tick(1000);	// wait 1s after the open animation is completed

		// act
		oComboBox.getFocusDomRef().value = "x";
		sap.ui.qunit.QUnitUtils.triggerEvent("input", oComboBox.getFocusDomRef());
		this.clock.tick(1000);

		// assert
		assert.ok(oComboBox.isOpen());

		// cleanup
		oComboBox.destroy();
	});

	// BCP 1680329042
	QUnit.test("it should clear the selection when the backspace/delete keyboard key is pressed and the remaining text doesn't match any items", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			items: [
				new Item({
					text: "lorem ipsum"
				})
			]
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();
		var oFocusDomRef = oComboBox.getFocusDomRef();

		// act (type something in the text field input)
		oFocusDomRef.value = "lo";
		sap.ui.qunit.QUnitUtils.triggerEvent("input", oFocusDomRef, { value: "lo" });

		// wait for the word completion feature
		this.clock.tick(0);

		// remove the autocompleted text ("rem ipsum" by pressing the backspace keyboard key
		sap.ui.qunit.QUnitUtils.triggerKeydown(oFocusDomRef, KeyCodes.BACKSPACE);
		oFocusDomRef.value = "lo";
		sap.ui.qunit.QUnitUtils.triggerEvent("input", oFocusDomRef, { value: "lo" });

		// assert
		assert.ok(oComboBox.getSelectedItem() === null);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("it should filter with empty value when input is deleted on mobile device", function (assert) {

		this.stub(Device, "system", {
			desktop: false,
			phone: true,
			tablet: false
		});

		var oComboBox = new ComboBox({
			items: [
				new Item({
					text: "Test"
				}),
				new Item({
					text: "aaa"
				})
			],
			value: "t"
		});

		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		oComboBox.focus();
		oComboBox.open();
		this.clock.tick(1000); // tick the clock ahead 1 second, after the open animation is completed
		var oPickerTextField = oComboBox.getPickerTextField();
		oPickerTextField.focus();
		var oPickerTextFieldDomRef = oPickerTextField.getFocusDomRef();
		oPickerTextFieldDomRef.value = "t";

		// act
		sap.ui.qunit.QUnitUtils.triggerEvent("keydown", oPickerTextFieldDomRef, {
			which: KeyCodes.L,
			srcControl: oPickerTextField
		});
		sap.ui.qunit.QUnitUtils.triggerEvent("input", oPickerTextFieldDomRef, {
			srcControl: oPickerTextField
		});
		this.clock.tick(1000); // tick the clock ahead 1 second, after the open animation is completed

		assert.strictEqual(oComboBox.getVisibleItems().length, 1, "One item should be visible");
		assert.strictEqual(oComboBox.getVisibleItems()[0].getText(), "Test", "Visible item text should be 'Test'");

		// act (clear input value)
		oPickerTextFieldDomRef.value = "";
		sap.ui.qunit.QUnitUtils.triggerEvent("input", oPickerTextFieldDomRef, {
			srcControl: oPickerTextField
		});

		// wait for the word completion feature
		this.clock.tick(0);

		assert.strictEqual(oComboBox.getVisibleItems().length, 2, "All items should be visible");

		oComboBox.close();
		this.clock.tick(300);

		oComboBox.destroy();
	});

	QUnit.module("onfocusin");

	QUnit.test("onfocusin", function (assert) {

		this.stub(Device, "system", {
			desktop: true,
			phone: false,
			tablet: false
		});

		// system under test
		var oComboBox = new ComboBox();

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		sap.ui.qunit.QUnitUtils.triggerEvent("focusin", oComboBox.getOpenArea(), {
			target: oComboBox.getOpenArea()
		});

		// assert
		assert.ok(document.activeElement === oComboBox.getFocusDomRef(), "If the ComboBox's arrow recive the focusin event, revert it to the input field");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onfocusin select the text", function (assert) {

		this.stub(Device, "system", {
			desktop: true,
			phone: false,
			tablet: false
		});

		// system under test
		var oComboBox = new ComboBox({
			value: "Germany"
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		oComboBox.focus();
		this.clock.tick(0);	// tick the clock ahead 0ms millisecond to make sure the async call to .selectText() on the focusin event handler does not override the type ahead

		// assert
		assert.strictEqual(oComboBox.getFocusDomRef().selectionStart, 0, "The text should be selected");
		assert.strictEqual(oComboBox.getFocusDomRef().selectionEnd, 7, "The text should be selected");

		// cleanup
		oComboBox.destroy();
	});

	// BCP 1570441294
	QUnit.test("onfocusin it should correctly restore the selection of the text after re-rendering", function (assert) {

		this.stub(Device, "system", {
			desktop: true,
			phone: false,
			tablet: false
		});

		// system under test
		var oComboBox = new ComboBox({
			items: [
				new Item({
					text: "lorem ipsum"
				})
			]
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();
		sap.ui.qunit.QUnitUtils.triggerEvent("keydown", oComboBox.getFocusDomRef(), {
			which: KeyCodes.L
		});
		oComboBox.getFocusDomRef().value = "l";
		sap.ui.qunit.QUnitUtils.triggerEvent("input", oComboBox.getFocusDomRef(), {
			value: "l"
		});

		// act
		oComboBox.rerender();
		this.clock.tick(0);	// tick the clock ahead 0ms millisecond to make sure the async call to .selectText() in the focusin event handler does not override the type ahead

		// assert
		assert.strictEqual(oComboBox.getSelectedText(), "orem ipsum");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.module("onBeforeOpen");

	QUnit.test("onBeforeOpen", function (assert) {

		// system under test
		var fnOnBeforeOpenSpy = this.spy(ComboBox.prototype, "onBeforeOpen");
		var oComboBox = new ComboBox({
			value: "Germany"
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();

		// act
		oComboBox.open();

		// assert
		assert.strictEqual(fnOnBeforeOpenSpy.callCount, 1, "onBeforeOpen() called exactly once");
		assert.strictEqual(oComboBox.getFocusDomRef().getAttribute("aria-owns"), oComboBox.getList().getId(), 'the attribute "aria-owns" is set after the list is rendered');

		// cleanup
		oComboBox.destroy();
	});

	QUnit.module("onAfterOpen");

	QUnit.test("onAfterOpen test case 1", function (assert) {

		// system under test
		var fnOnAfterOpenSpy = this.spy(ComboBox.prototype, "onAfterOpen");
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "GER",
					text: "Germany"
				})
			]
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();

		// act
		oComboBox.open();
		this.clock.tick(1000);

		// assert
		assert.strictEqual(fnOnAfterOpenSpy.callCount, 1, "onAfterOpen() called exactly once");
		assert.strictEqual(oComboBox.getFocusDomRef().getAttribute("aria-expanded"), "true");
		assert.strictEqual(oComboBox.$("inner").attr("aria-activedescendant"), undefined, 'The "aria-activedescendant" attribute is set when the active descendant is rendered and visible');

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onAfterOpen test case 2", function (assert) {

		// system under test
		var oExpectedItem;
		var oComboBox = new ComboBox({
			items: [
				oExpectedItem = new Item({
					key: "GER",
					text: "Germany"
				})
			],
			selectedKey: "GER"
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();
		var sExpectedActiveDescendantId = oExpectedItem.getId();

		// act
		oComboBox.open();
		this.clock.tick(1000);

		// assert
		assert.strictEqual(oComboBox.$("inner").attr("aria-activedescendant"), sExpectedActiveDescendantId);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onAfterOpen test case 3 - selected item position", function (assert) {

		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "DZ",
					text: "Algeria",
					enabled: false
				}),

				new Item({
					key: "AR",
					text: "Argentina"
				}),

				new Item({
					key: "AU",
					text: "Australia"
				}),

				new Item({
					key: "AT",
					text: "Austria"
				}),

				new Item({
					key: "BH",
					text: "Bahrain"
				}),

				new Item({
					key: "BE",
					text: "Belgium"
				}),

				new Item({
					key: "BA",
					text: "Bosnia and Herzegovina"
				}),

				new Item({
					key: "BR",
					text: "Brazil"
				}),

				new Item({
					key: "BG",
					text: "Bulgaria"
				}),

				new Item({
					key: "CA",
					text: "Canada"
				}),

				new Item({
					key: "CL",
					text: "Chile"
				}),

				new Item({
					key: "CO",
					text: "Colombia"
				}),

				new Item({
					key: "HR",
					text: "Croatia"
				}),

				new Item({
					key: "CU",
					text: "Cuba"
				}),

				new Item({
					key: "CZ",
					text: "Czech Republic"
				}),

				new Item({
					key: "DK",
					text: "Denmark"
				}),

				new Item({
					key: "EG",
					text: "Egypt"
				}),

				new Item({
					key: "EE",
					text: "Estonia"
				}),

				new Item({
					key: "FI",
					text: "Finland"
				}),

				new Item({
					key: "FR",
					text: "France"
				}),

				new Item({
					key: "GH",
					text: "Ghana"
				}),

				new Item({
					key: "DZ",
					text: "Algeria"
				}),

				new Item({
					key: "TN",
					text: "Tunisia"
				}),

				new Item({
					key: "TR",
					text: "Turkey"
				}),

				new Item({
					key: "UG",
					text: "Uganda"
				}),

				new Item({
					key: "AE",
					text: "United Arab Emirates"
				}),

				new Item({
					key: "GB",
					text: "United Kingdom"
				}),

				new Item({
					key: "YE",
					text: "Yemen"
				})

			],

			selectedKey: "AR"
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();
		oComboBox.open();
		this.clock.tick(1000);

		// asserts
		assert.ok(oComboBox.getPicker().getDomRef("cont").scrollTop < oComboBox.getSelectedItem().getDomRef().offsetTop);

		// cleanup
		oComboBox.destroy();

	});

	QUnit.module("onAfterClose");

	QUnit.test("onAfterClose", function (assert) {

		// system under test
		var fnOnAfterCloseSpy = this.spy(ComboBox.prototype, "onAfterClose");
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "GER",
					text: "Germany"
				})
			]
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();
		oComboBox.open();

		// act
		oComboBox.close();

		if (jQuery.support.cssAnimations) {	// no animation on IE9
			this.clock.tick(1000);
		}

		// assert
		assert.strictEqual(fnOnAfterCloseSpy.callCount, 1, "onAfterClose() called exactly once");
		assert.strictEqual(oComboBox.getFocusDomRef().getAttribute("aria-expanded"), "false");
		assert.strictEqual(oComboBox.$("inner").attr("aria-activedescendant"), undefined, 'The "aria-activedescendant" attribute is set when the active descendant is rendered and visible');

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("it should set the focus to the body after fired onAfterClose event", function(assert) {

		// system under test
		this.stub(Device, "system", {
			desktop: false,
			phone: true,
			tablet: false
		});

		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "GER",
					text: "Germany"
				})
			]
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.open();

		// act
		oComboBox.close();
		this.clock.tick(1000);

		// assert
		assert.strictEqual(document.activeElement.tagName.toLowerCase(), "body", "After closing the dialog, the focus should not be on an input");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.module("onBeforeClose");

	QUnit.test("onBeforeClose", function (assert) {

		// system under test
		var fnOnBeforeCloseSpy = this.spy(ComboBox.prototype, "onBeforeClose");
		var oComboBox = new ComboBox();

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();
		oComboBox.open();
		this.clock.tick(1000);

		// act
		oComboBox.close();

		// assert
		assert.strictEqual(fnOnBeforeCloseSpy.callCount, 1, "onBeforeClose() called exactly once");
		assert.strictEqual(oComboBox.$().attr("aria-owns"), undefined);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.module("change");

	QUnit.test("onChange is fired after the value changes by pressing arrow down key when the control loses the focus", function (assert) {

		// system under test
		var sExpectedValue = "Algeria";
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "DZ",
					text: "Algeria"
				})
			]
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();
		var fnFireChangeSpy = this.spy(oComboBox, "fireChange");

		// act
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN);
		oComboBox.getFocusDomRef().blur();
		this.clock.tick(0);	// when a blur event occurs the "sapfocusleave" is fired async

		// assert
		assert.strictEqual(fnFireChangeSpy.callCount, 1, 'The "change" event is fired');
		assert.strictEqual(oComboBox.getValue(), sExpectedValue);
		assert.strictEqual(oComboBox.getProperty("value"), sExpectedValue);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onChange is fired after the value changes by pressing arrow down key and enter", function (assert) {

		// system under test
		var sExpectedValue = "Algeria";
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "DZ",
					text: "Algeria"
				})
			]
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();
		var fnFireChangeSpy = this.spy(oComboBox, "fireChange");

		// act
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN);
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ENTER);

		// assert
		assert.strictEqual(fnFireChangeSpy.callCount, 1, 'The "change" event is fired');
		assert.strictEqual(oComboBox.getValue(), sExpectedValue);
		assert.strictEqual(oComboBox.getProperty("value"), sExpectedValue);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onChange is fired after the value changes by pressing arrow up key when the control loses the focus", function (assert) {

		// system under test
		var sExpectedValue = "Algeria";
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "DZ",
					text: "Algeria"
				}),
				new Item({
					key: "GER",
					text: "Germany"
				})
			],
			selectedKey: "GER"
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();
		var fnFireChangeSpy = this.spy(oComboBox, "fireChange");

		// act
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ARROW_UP);
		oComboBox.getFocusDomRef().blur();
		this.clock.tick(0);	// when a blur event occurs the "sapfocusleave" is fired async

		// assert
		assert.strictEqual(fnFireChangeSpy.callCount, 1, 'The "change" event is fired');
		assert.strictEqual(oComboBox.getValue(), sExpectedValue);
		assert.strictEqual(oComboBox.getProperty("value"), sExpectedValue);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onChange is fired after the value changes by pressing arrow up key and enter", function (assert) {

		// system under test
		var sExpectedValue = "Algeria";
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "DZ",
					text: "Algeria"
				}),
				new Item({
					key: "GER",
					text: "Germany"
				})
			],
			selectedKey: "GER"
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();
		var fnFireChangeSpy = this.spy(oComboBox, "fireChange");

		// act
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ARROW_UP);
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ENTER);

		// assert
		assert.strictEqual(fnFireChangeSpy.callCount, 1, 'The "change" event is fired');
		assert.strictEqual(oComboBox.getValue(), sExpectedValue);
		assert.strictEqual(oComboBox.getProperty("value"), sExpectedValue);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onChange is fired after the value changes by pressing Home key when the control loses the focus", function (assert) {

		// system under test
		var sExpectedValue = "Algeria";
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "DZ",
					text: "Algeria"
				}),
				new Item({
					key: "GER",
					text: "Germany"
				})
			],
			selectedKey: "GER"
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();
		var fnFireChangeSpy = this.spy(oComboBox, "fireChange");

		// act
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.HOME);
		oComboBox.getFocusDomRef().blur();
		this.clock.tick(0);	// when a blur event occurs the "sapfocusleave" is fired async

		// assert
		assert.strictEqual(fnFireChangeSpy.callCount, 1, 'The "change" event is fired');
		assert.strictEqual(oComboBox.getValue(), sExpectedValue);
		assert.strictEqual(oComboBox.getProperty("value"), sExpectedValue);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onChange is fired after the value changes by pressing Home key and enter", function (assert) {

		// system under test
		var sExpectedValue = "Algeria";
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "DZ",
					text: "Algeria"
				}),
				new Item({
					key: "GER",
					text: "Germany"
				})
			],
			selectedKey: "GER"
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();
		var fnFireChangeSpy = this.spy(oComboBox, "fireChange");

		// act
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.HOME);
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ENTER);

		// assert
		assert.strictEqual(fnFireChangeSpy.callCount, 1, 'The "change" event is fired');
		assert.strictEqual(oComboBox.getValue(), sExpectedValue);
		assert.strictEqual(oComboBox.getProperty("value"), sExpectedValue);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onChange is fired after the value changes by pressing End key when the control loses the focus", function (assert) {

		// system under test
		var sExpectedValue = "Germany";
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "DZ",
					text: "Algeria"
				}),
				new Item({
					key: "GER",
					text: "Germany"
				})
			],
			selectedKey: "DZ"
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();
		var fnFireChangeSpy = this.spy(oComboBox, "fireChange");

		// act
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.END);
		oComboBox.getFocusDomRef().blur();
		this.clock.tick(0);	// when a blur event occurs the "sapfocusleave" is fired async

		// assert
		assert.strictEqual(fnFireChangeSpy.callCount, 1, 'The "change" event is fired');
		assert.strictEqual(oComboBox.getValue(), sExpectedValue);
		assert.strictEqual(oComboBox.getProperty("value"), sExpectedValue);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onChange is fired after the value changes by pressing End key and enter", function (assert) {

		// system under test
		var sExpectedValue = "Germany";
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "DZ",
					text: "Algeria"
				}),
				new Item({
					key: "GER",
					text: "Germany"
				})
			],
			selectedKey: "DZ"
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();
		var fnFireChangeSpy = this.spy(oComboBox, "fireChange");

		// act
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.END);
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ENTER);

		// assert
		assert.strictEqual(fnFireChangeSpy.callCount, 1, 'The "change" event is fired');
		assert.strictEqual(oComboBox.getValue(), sExpectedValue);
		assert.strictEqual(oComboBox.getProperty("value"), sExpectedValue);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onChange is fired after the value changes by pressing pagedown key when the control loses the focus", function (assert) {

		// system under test
		var sExpectedValue = "Cuba";
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "DZ",
					text: "Algeria"
				}),
				new Item({
					key: "GER",
					text: "Germany"
				}),
				new Item({
					key: "CU",
					text: "Cuba"
				})
			],
			selectedKey: "DZ"
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();
		var fnFireChangeSpy = this.spy(oComboBox, "fireChange");

		// act
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.PAGE_DOWN);
		oComboBox.getFocusDomRef().blur();
		this.clock.tick(0);	// when a blur event occurs the "sapfocusleave" is fired async

		// assert
		assert.strictEqual(fnFireChangeSpy.callCount, 1, 'The "change" event is fired');
		assert.strictEqual(oComboBox.getValue(), sExpectedValue);
		assert.strictEqual(oComboBox.getProperty("value"), sExpectedValue);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onChange is fired after the value changes by pressing pagedown key and enter", function (assert) {

		// system under test
		var sExpectedValue = "Cuba";
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "DZ",
					text: "Algeria"
				}),
				new Item({
					key: "GER",
					text: "Germany"
				}),
				new Item({
					key: "CU",
					text: "Cuba"
				})
			],
			selectedKey: "DZ"
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();
		var fnFireChangeSpy = this.spy(oComboBox, "fireChange");

		// act
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.PAGE_DOWN);
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ENTER);

		// assert
		assert.strictEqual(fnFireChangeSpy.callCount, 1, 'The "change" event is fired');
		assert.strictEqual(oComboBox.getValue(), sExpectedValue);
		assert.strictEqual(oComboBox.getProperty("value"), sExpectedValue);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onChange is fired after the value changes by pressing pageup key when the control loses the focus", function (assert) {

		// system under test
		var sExpectedValue = "Algeria";
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "DZ",
					text: "Algeria"
				}),
				new Item({
					key: "GER",
					text: "Germany"
				}),
				new Item({
					key: "CU",
					text: "Cuba"
				})
			],
			selectedKey: "CU"
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();
		var fnFireChangeSpy = this.spy(oComboBox, "fireChange");

		// act
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.PAGE_UP);
		oComboBox.getFocusDomRef().blur();
		this.clock.tick(0);	// when a blur event occurs the "sapfocusleave" is fired async

		// assert
		assert.strictEqual(fnFireChangeSpy.callCount, 1, 'The "change" event is fired');
		assert.strictEqual(oComboBox.getValue(), sExpectedValue);
		assert.strictEqual(oComboBox.getProperty("value"), sExpectedValue);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onChange is fired after the value changes by pressing pageup key and enter", function (assert) {

		// system under test
		var sExpectedValue = "Algeria";
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "DZ",
					text: "Algeria"
				}),
				new Item({
					key: "GER",
					text: "Germany"
				}),
				new Item({
					key: "CU",
					text: "Cuba"
				})
			],
			selectedKey: "CU"
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();
		var fnFireChangeSpy = this.spy(oComboBox, "fireChange");

		// act
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.PAGE_UP);
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ENTER);

		// assert
		assert.strictEqual(fnFireChangeSpy.callCount, 1, 'The "change" event is fired');
		assert.strictEqual(oComboBox.getValue(), sExpectedValue);
		assert.strictEqual(oComboBox.getProperty("value"), sExpectedValue);

		// cleanup
		oComboBox.destroy();
	});

	// unit test for CSN 0120061532 0001168439 2014
	QUnit.test("onChange is not fired when no changes are made", function (assert) {

		// system under test
		var oComboBox = new ComboBox();

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();
		var fnFireChangeSpy = this.spy(oComboBox, "fireChange");
		oComboBox.updateDomValue("Germany");
		oComboBox.getFocusDomRef().blur();	// on blur the DOM value has changed => the change event is fired

		// act
		oComboBox.focus();
		oComboBox.getFocusDomRef().blur();	// the DOM value has not changed => the change event should not be fired again
		this.clock.tick(0);	// when a blur event occurs the "sapfocusleave" is fired async

		// assert
		assert.strictEqual(fnFireChangeSpy.callCount, 1, 'The "change" event is not fired');

		// cleanup
		oComboBox.destroy();
	});

	// BCP 1570522570
	QUnit.test("it should not fire the change event when the arrow button is pressed", function (assert) {

		// system under test
		var oComboBox = new ComboBox();

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();
		var fnFireChangeSpy = this.spy(oComboBox, "fireChange");
		oComboBox.updateDomValue("lorem ipsum");

		oComboBox.getIcon().firePress();

		// assert
		assert.strictEqual(fnFireChangeSpy.callCount, 0);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("it should change the value and fire the change event", function (assert) {

		this.stub(Device, "system", {
			desktop: false,
			phone: true,
			tablet: false
		});

		// system under test
		var oComboBox = new ComboBox();

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();
		oComboBox.open();
		this.clock.tick(1000);
		var oPickerTextField = oComboBox.getPickerTextField();
		oPickerTextField.focus();
		var oPickerTextFieldDomRef = oPickerTextField.getFocusDomRef();
		var fnChangeSpy = this.spy(oComboBox, "fireChange");

		// act
		oPickerTextField.getFocusDomRef().value = "lorem ipsum";
		sap.ui.qunit.QUnitUtils.triggerEvent("input", oPickerTextFieldDomRef);
		sap.ui.test.qunit.triggerKeydown(oPickerTextFieldDomRef, KeyCodes.ENTER);
		oComboBox.close();
		this.clock.tick(1000);

		// assert
		assert.strictEqual(fnChangeSpy.callCount, 1, "The change event was fired");
		assert.strictEqual(oComboBox.getValue(), "lorem ipsum");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("it should fire the change event after the dialog is closed", function (assert) {

		this.stub(Device, "system", {
			desktop: false,
			phone: true,
			tablet: false
		});

		// system under test
		var oComboBox = new ComboBox();

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();
		oComboBox.open();
		this.clock.tick(1000); // tick the clock ahead 1 second, after the open animation is completed
		var oPickerTextField = oComboBox.getPickerTextField();
		oPickerTextField.focus();
		var oPickerTextFieldDomRef = oPickerTextField.getFocusDomRef();
		var fnChangeSpy = this.spy(oComboBox, "fireChange");

		// act
		oPickerTextField.getFocusDomRef().value = "lorem ipsum";
		sap.ui.qunit.QUnitUtils.triggerEvent("input", oPickerTextFieldDomRef);
		oComboBox.getPicker().getButtons()[0].firePress();
		this.clock.tick(1000); // tick the clock ahead 1 second, after the close animation is completed

		// assert
		assert.strictEqual(fnChangeSpy.callCount, 1, "The change event was fired");
		assert.strictEqual(oComboBox.getValue(), "lorem ipsum");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("it should fire the change event when the ENTER key is pressed", function (assert) {

		this.stub(Device, "system", {
			desktop: false,
			phone: true,
			tablet: false
		});

		// system under test
		var oComboBox = new ComboBox();

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();
		oComboBox.open();

		// tick the clock ahead 1 second, after the open animation is completed
		this.clock.tick(1000);
		var oPickerTextField = oComboBox.getPickerTextField();
		oPickerTextField.focus();
		var oPickerTextFieldDomRef = oPickerTextField.getFocusDomRef();
		var fnChangeSpy = this.spy(oComboBox, "fireChange");

		// act
		oPickerTextField.getFocusDomRef().value = "lorem ipsum";
		sap.ui.qunit.QUnitUtils.triggerEvent("input", oPickerTextFieldDomRef, {
			srcControl: oPickerTextField
		});
		sap.ui.test.qunit.triggerKeydown(oPickerTextFieldDomRef, KeyCodes.ENTER);
		this.clock.tick(1000);

		// assert
		assert.strictEqual(fnChangeSpy.callCount, 1, "The change event was fired");
		assert.strictEqual(oComboBox.getValue(), "lorem ipsum");

		// cleanup
		oComboBox.destroy();
	});

	// BCP 1680061025
	QUnit.test("it should fire the change event after the selection is updated on mobile devices", function (assert) {
		var done = assert.async();
		this.stub(Device, "system", {
			desktop: false,
			phone: true,
			tablet: false
		});

		// system under test
		var oItem = new Item({
			key: "li",
			text: "lorem ipsum"
		});

		var oComboBox = new ComboBox({
			items: [
				oItem
			],
			change: function () {

				// assert
				assert.strictEqual(oComboBox.getSelectedKey(), "li");

				// cleanup
				oComboBox.destroy();
				done();
			}
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();
		oComboBox.open();

		// tick the clock ahead 1 second, after the open animation is completed
		this.clock.tick(1000);

		var oListDomRef = oComboBox.getList().getDomRef();
		var oTouches = {
			0: {
				pageX: 1,
				pageY: 1,
				identifier: 0,
				target: oItem.getDomRef()
			},

			length: 1
		};

		sap.ui.test.qunit.triggerTouchEvent("touchstart", oListDomRef, {
			srcControl: oItem,
			touches: oTouches,
			targetTouches: oTouches
		});

		sap.ui.test.qunit.triggerTouchEvent("touchend", oListDomRef, {
			srcControl: oItem,
			changedTouches: oTouches,
			touches: {
				length: 0
			}
		});

		sap.ui.test.qunit.triggerTouchEvent("tap", oListDomRef, {
			srcControl: oItem,
			changedTouches: oTouches,
			touches: {
				length: 0
			}
		});

		// tick the clock ahead 1 second, after the close animation is completed
		this.clock.tick(1000);
	});

	QUnit.test("it should close the dialog when the close button is pressed", function (assert) {

		this.stub(Device, "system", {
			desktop: false,
			phone: true,
			tablet: false
		});

		// system under test
		var oComboBox = new ComboBox();

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.open();
		var oParams = {
			touches: {
				0: {
					pageX: 10,
					length: 1
				},

				length: 1
			},

			targetTouches: {
				0: {
					pageX: 10,
					length: 1
				},

				length: 1
			}
		};

		var oButton = oComboBox.getPicker().getButtons()[0];

		// act
		sap.ui.test.qunit.triggerTouchEvent("touchstart", oButton.getDomRef(), oParams);
		oButton.focus();
		sap.ui.test.qunit.triggerTouchEvent("touchend", oButton.getDomRef(), oParams);
		sap.ui.test.qunit.triggerTouchEvent("tap", oButton.getDomRef(), oParams);
		this.clock.tick(1000);

		// assert
		assert.strictEqual(oComboBox.isOpen(), false);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onChange it should update the value of the comboBox as expected when search in both columns is enabled test case 1", function (assert) {

		// system under test
		var sExpectedValue = "Denmark";
		var oComboBox = new ComboBox({
			filterSecondaryValues: true,
			items: [
				new ListItem({
					key: "GER",
					text: "Germany",
					additionalText: "GER"
				}),
				new ListItem({
					key: "BG",
					text: "Bulgaria",
					additionalText: "BG"
				}),
				new ListItem({
					key: "DZ",
					text: "Algeria",
					additionalText: "DZ"
				}),
				new ListItem({
					key: "DK",
					text: "Denmark",
					additionalText: "DK"
				})
			]
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();

		// act
		oComboBox.getFocusDomRef().value = "D";
		sap.ui.qunit.QUnitUtils.triggerEvent("input", oComboBox.getFocusDomRef());
		oComboBox.getFocusDomRef().blur();
		this.clock.tick(0);	// when a blur event occurs the "sapfocusleave" is fired async

		// assert
		assert.strictEqual(oComboBox.getValue(), sExpectedValue);
		assert.strictEqual(oComboBox.getProperty("value"), sExpectedValue);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onChange it should update the value of the comboBox as expected when search in both columns is enabled test case 2", function (assert) {

		// system under test
		var sExpectedValue = "Algeria";
		var oComboBox = new ComboBox({
			filterSecondaryValues: true,
			items: [
				new ListItem({
					key: "GER",
					text: "Germany",
					additionalText: "GER"
				}),
				new ListItem({
					key: "BG",
					text: "Bulgaria",
					additionalText: "BG"
				}),
				new ListItem({
					key: "DZ",
					text: "Algeria",
					additionalText: "DZ"
				}),
				new ListItem({
					key: "DK",
					text: "Denmark",
					additionalText: "DK"
				})
			]
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();

		// act
		oComboBox.getFocusDomRef().value = "D";
		sap.ui.qunit.QUnitUtils.triggerEvent("input", oComboBox.getFocusDomRef());
		sap.ui.test.qunit.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ARROW_UP);
		oComboBox.getFocusDomRef().blur();
		this.clock.tick(0);	// when a blur event occurs the "sapfocusleave" is fired async

		// assert
		assert.strictEqual(oComboBox.getValue(), sExpectedValue);
		assert.strictEqual(oComboBox.getProperty("value"), sExpectedValue);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onChange should leave the Input value as is if no match is found", function (assert) {

		// system under test
		var sExpectedValue = "Default";
		var oComboBox = new ComboBox({
			filterSecondaryValues: true,
			items: [
				new ListItem({
					key: "BG",
					text: "Bulgaria",
					additionalText: "BG"
				})
			]
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();

		// act
		oComboBox.getFocusDomRef().value = "Default";
		sap.ui.qunit.QUnitUtils.triggerEvent("input", oComboBox.getFocusDomRef());
		oComboBox.getFocusDomRef().blur();
		this.clock.tick(0);	// when a blur event occurs the "sapfocusleave" is fired async

		// assert
		assert.strictEqual(oComboBox.getValue(), sExpectedValue);
		assert.strictEqual(oComboBox.getProperty("value"), sExpectedValue);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test('onSelectionChange should pass in the "itemPressed" parameter to the change event handle', function (assert) {

		// system under test
		var oItem;
		var oComboBox = new ComboBox({
			items: [
				oItem = new ListItem({
					text: "lorem ipsum"
				})
			]
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();
		var fnFireChangeSpy = this.spy(oComboBox, "fireChange");
		oComboBox.updateDomValue("change the value");
		var oControlEvent = new Event("selectionChange", oComboBox.getList(), {
			selectedItem: oItem
		});

		// act
		oComboBox.onSelectionChange(oControlEvent);

		// assert
		assert.strictEqual(fnFireChangeSpy.args[0][0].itemPressed, true);

		// cleanup
		oComboBox.destroy();
		oControlEvent.destroy();
	});

	QUnit.module("onItemPress");

	QUnit.test("onItemPress should fire change when the first filtered item is clicked.", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			items: [
				new Item({
					text: "Algeria"
				}),

				new Item({
					text: "Argentina"
				}),

				new Item({
					text: "Germany"
				})
			]
		}), fnFireChangeSpy = this.spy(oComboBox, "fireChange");

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		oComboBox.focus();
		oComboBox.open();
		this.clock.tick(1000);
		oComboBox.getFocusDomRef().value = "A";
		sap.ui.qunit.QUnitUtils.triggerEvent("input", oComboBox.getFocusDomRef());
		oComboBox._oList.fireItemPress({ item: oComboBox.getItems()[0] });

		// assert
		assert.strictEqual(fnFireChangeSpy.callCount, 1, 'The "change" event is fired when the first filtered item is pressed');

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onItemPress should fire change when the first filtered item is clicked - mobile", function (assert) {
		// system under test
		this.stub(Device, "system", {
			desktop: false,
			phone: true,
			tablet: false
		});

		var oComboBox = new ComboBox({
			items: [
				new Item({
					text: "Algeria"
				}),

				new Item({
					text: "Argentina"
				}),

				new Item({
					text: "Germany"
				})
			]
		}), fnFireChangeSpy = this.spy(oComboBox, "fireChange");

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		oComboBox.focus();
		oComboBox.open();
		this.clock.tick(1000);
		oComboBox.getFocusDomRef().value = "A";
		sap.ui.qunit.QUnitUtils.triggerEvent("input", oComboBox.getFocusDomRef());
		oComboBox._oList.fireItemPress({ item: oComboBox.getItems()[0] });

		// assert
		assert.strictEqual(fnFireChangeSpy.callCount, 1, 'The "change" event is fired when the first filtered item is pressed');

		// cleanup
		oComboBox.destroy();
	});

	QUnit.module("onPropertyChange");

	QUnit.test("it should propagate some property changes to the picker text field", function (assert) {

		this.stub(Device, "system", {
			desktop: false,
			phone: true,
			tablet: false
		});

		// system under test
		var oComboBox = new ComboBox({
			value: "value",
			enabled: false,
			name: "name",
			placeholder: "placeholder",
			editable: false,
			textAlign: TextAlign.Center,
			textDirection: TextDirection.LTR
		});

		// arrange
		var oComboBoxPickerTextField = oComboBox.getPickerTextField();

		// assert
		assert.strictEqual(oComboBoxPickerTextField.getValue(), "value");
		assert.strictEqual(oComboBoxPickerTextField.getEnabled(), false);
		assert.strictEqual(oComboBoxPickerTextField.getName(), "name");
		assert.strictEqual(oComboBoxPickerTextField.getPlaceholder(), "placeholder");
		assert.strictEqual(oComboBoxPickerTextField.getEditable(), false);
		assert.strictEqual(oComboBoxPickerTextField.getTextAlign(), TextAlign.Center);
		assert.strictEqual(oComboBoxPickerTextField.getTextDirection(), TextDirection.LTR);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("it should propagate some property changes to the picker text field", function (assert) {

		this.stub(Device, "system", {
			desktop: false,
			phone: true,
			tablet: false
		});

		// system under test
		var oComboBox = new ComboBox({
			value: "value",
			enabled: false,
			name: "name",
			placeholder: "placeholder",
			editable: false,
			textAlign: TextAlign.Center,
			textDirection: TextDirection.LTR
		});

		// arrange
		var oComboBoxPickerTextField = oComboBox.getPickerTextField();

		// act
		oComboBox.setValue("new value");
		oComboBox.setEnabled(true);
		oComboBox.setName("new name");
		oComboBox.setPlaceholder("new placeholder");
		oComboBox.setEditable(true);
		oComboBox.setTextAlign(TextAlign.Initial);
		oComboBox.setTextDirection(TextDirection.RTL);

		// assert
		assert.strictEqual(oComboBoxPickerTextField.getValue(), "new value");
		assert.strictEqual(oComboBoxPickerTextField.getEnabled(), true);
		assert.strictEqual(oComboBoxPickerTextField.getName(), "new name");
		assert.strictEqual(oComboBoxPickerTextField.getPlaceholder(), "new placeholder");
		assert.strictEqual(oComboBoxPickerTextField.getEditable(), true);
		assert.strictEqual(oComboBoxPickerTextField.getTextAlign(), TextAlign.Initial);
		assert.strictEqual(oComboBoxPickerTextField.getTextDirection(), TextDirection.RTL);

		// cleanup
		oComboBox.destroy();
	});

	/* ------------------------------ */
	/* others                         */
	/* ------------------------------ */

	QUnit.test("restore items visibility after rendering", function (assert) {

		// system under test
		var oItem;
		var oComboBox = new ComboBox({
			items: [
				oItem = new Item({
					key: "GER",
					text: "Germany"
				})
			]
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		oItem.bVisible = false;
		oComboBox.rerender();
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(oComboBox.isItemVisible(oItem), false);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.module("getAccessibilityInfo");

	QUnit.test("getAccessibilityInfo", function (assert) {
		var oComboBox = new ComboBox({
			value: "Value",
			tooltip: "Tooltip",
			placeholder: "Placeholder"
		});
		assert.ok(!!oComboBox.getAccessibilityInfo, "ComboBox has a getAccessibilityInfo function");
		var oInfo = oComboBox.getAccessibilityInfo();
		assert.ok(!!oInfo, "getAccessibilityInfo returns a info object");
		assert.strictEqual(oInfo.role, oComboBox.getRenderer().getAriaRole(), "AriaRole");
		assert.strictEqual(oInfo.type, sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("ACC_CTR_TYPE_COMBO"), "Type");
		assert.strictEqual(oInfo.description, "Value Placeholder Tooltip", "Description");
		assert.strictEqual(oInfo.focusable, true, "Focusable");
		assert.strictEqual(oInfo.enabled, true, "Enabled");
		assert.strictEqual(oInfo.editable, true, "Editable");
		oComboBox.setValue("");
		oComboBox.setEnabled(false);
		oInfo = oComboBox.getAccessibilityInfo();
		assert.strictEqual(oInfo.description, "Placeholder Tooltip", "Description");
		assert.strictEqual(oInfo.focusable, false, "Focusable");
		assert.strictEqual(oInfo.enabled, false, "Enabled");
		assert.strictEqual(oInfo.editable, false, "Editable");
		oComboBox.setEnabled(true);
		oComboBox.setEditable(false);
		oInfo = oComboBox.getAccessibilityInfo();
		assert.strictEqual(oInfo.focusable, true, "Focusable");
		assert.strictEqual(oInfo.enabled, true, "Enabled");
		assert.strictEqual(oInfo.editable, false, "Editable");
		oComboBox.destroy();
	});

	QUnit.test("Role combobox should be on the wrapper div of the input", function (assert) {
		var oComboBox = new ComboBox();
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		assert.strictEqual(oComboBox.getDomRef().getAttribute("role"), "combobox", "should be combobox");
		assert.strictEqual(oComboBox.getFocusDomRef().getAttribute("type"), "text", "should be text");
		oComboBox.destroy();
	});

	QUnit.test("Arrow down button should be a span with a role button", function (assert) {
		var oComboBox = new ComboBox(),
			oArrowSpan;

		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oArrowSpan = oComboBox.getDomRef("arrow");

		assert.strictEqual(oArrowSpan.tagName.toLowerCase(), "span", "tag should be span");
		assert.strictEqual(oArrowSpan.getAttribute("role"), "button", "role should be button");
		oComboBox.destroy();
	});

	QUnit.test("It should add a hidden text to the Picker ", function (assert) {
		var oItem = new Item({
			key: "li",
			text: "lorem ipsum"
		}), oComboBox = new ComboBox({
			items: [
				oItem
			]
		}), oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("COMBOBOX_AVAILABLE_OPTIONS");

		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		assert.equal(sap.ui.getCore().byId(oComboBox.getPickerInvisibleTextId()).getText(), oResourceBundle, 'popup ariaLabelledBy is set');

		oComboBox.destroy();
	});

	QUnit.test("ariaLabelledBy attribute of the combobox must be set to the according label id", function (assert) {
		var oLabel = new Label({
			id: "country",
			text: "Country",
			labelFor: "apa"
		});
		var oComboBox = new ComboBox({
			id: "apa"
		});

		oLabel.placeAt("content");
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		var sAriaLabelledBy = oComboBox.getDomRef("arrow").getAttribute("aria-labelledby").split(" ");
		assert.ok(sAriaLabelledBy.indexOf(oLabel.getId()) > -1, "Combobox aria-labelledby attribute is set to label id");

		oLabel.destroy();
		oComboBox.destroy();
	});

	QUnit.module("Integration");

	QUnit.test("Keep selected value on parent re-render", function (assert) {
		var oComboBox = new ComboBox({
			items: [
				new Item({ key: "A", text: "Amount" }),
				new Item({ key: "C", text: "Checkbox" }),
				new Item({ key: "D", text: "Date" }),
				new Item({ key: "E", text: "Email Address" }),
				new Item({ key: "L", text: "List" }),
				new Item({ key: "N", text: "Number" }),
				new Item({ key: "Q", text: "Quantity" }),
				new Item({ key: "T1", text: "Text" })
			],
			selectionChange: function onSelectionChange() {
				oForm.rerender();
			}
		});


		var oForm = new SimpleForm({
			content: [oComboBox]
		}).placeAt('content');

		sap.ui.getCore().applyChanges();

		oComboBox._oList.fireItemPress({ item: oComboBox.getItems()[1] });
		oComboBox._oList.fireSelectionChange({ selectedItem: oComboBox.getItems()[1] });

		assert.ok(oComboBox.getValue(), "ComboBox value to be filled in");
		assert.strictEqual(oComboBox.getValue(), oComboBox.getItems()[1].getText(), "ComboBox value to be the same as the selected element");

		oForm.destroy();
		oForm = null;
		oComboBox = null;
	});

	QUnit.test("Keep the focus on the input", function (assert) {
		this.stub(Device, "system", {
			desktop: false,
			phone: false,
			tablet: true,
			combi: false
		});

		var oCB = new ComboBox();
		var aValues = ["00:00", "00:30", "01:00", "01:30", "02:00", "02:30", "03:00", "03:30", "04:00"];
		for (var i = 0; i < aValues.length; i++) {
			var oItem = new ListItem();
			oItem.setKey(i);
			oItem.setText(aValues[i]);

			oCB.addItem(oItem);
		}
		oCB.placeAt('content');
		sap.ui.getCore().applyChanges();

		oCB.focus();

		oCB.open();
		this.clock.tick(500);

		oCB.close();
		this.clock.tick(500);

		assert.ok(containsOrEquals(oCB.getDomRef(), document.activeElement), "Focus is still inside the ComboBox after open and close");

		oCB.destroy();
	});

	QUnit.test("Changing models resets the selection if item is not there", function (assert) {
		//Setup
		var oData = { list: [{ id: "1", text: "1" }] },
			oModel = new JSONModel(oData),
			oItemsTemplate = new Item({ key: "{id}", text: "{text}" }),
			oComboBox = new ComboBox({
				items: {
					path: "/list",
					template: oItemsTemplate
				}
			});

		oComboBox.setModel(oModel);
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		this.clock.tick(100);

		//Assert
		assert.ok(!oComboBox.getSelectedItem(), "No item is currently selected");
		assert.ok(!oComboBox.getSelectedKey(), "No item is currently selected");

		//Act
		oComboBox.setSelectedKey("1");
		sap.ui.getCore().applyChanges();
		this.clock.tick(100);

		//Assert
		assert.ok(oComboBox.getSelectedKey(), "Item is selected");
		assert.strictEqual(oComboBox.getSelectedItem().getKey(), "1", "Item 1 is selected");

		//Act
		oComboBox.getModel().setProperty("/list", [{ id: "2", text: "2" }]);
		sap.ui.getCore().applyChanges();
		this.clock.tick(100);

		//Assert
		assert.ok(!oComboBox.getSelectedItem(), "No item is currently selected");
		assert.ok(!oComboBox.getSelectedKey(), "No item is currently selected");

		//Cleanup
		oComboBox.destroy();
	});

	QUnit.test("Changing models keeps the selection if item is there", function (assert) {
		//Setup
		var oData = { list: [{ id: "1", text: "1" }, { id: "2", text: "2" }] },
			oModel = new JSONModel(oData),
			oItemsTemplate = new Item({ key: "{id}", text: "{text}" }),
			oComboBox = new ComboBox({
				items: {
					path: "/list",
					template: oItemsTemplate
				}
			});

		//Act
		oComboBox.setModel(oModel);
		oComboBox.placeAt("content");
		oComboBox.setSelectedKey("2");
		sap.ui.getCore().applyChanges();
		this.clock.tick(100);

		//Assert
		assert.ok(oComboBox.getSelectedKey(), "Item is selected");
		assert.strictEqual(oComboBox.getSelectedItem().getKey(), "2", "Item 2 is selected");

		//Act
		oComboBox.getModel().setProperty("/list", [{ id: "2", text: "2" }, { id: "33", text: "33" }]);
		sap.ui.getCore().applyChanges();
		this.clock.tick(100);

		//Assert
		assert.ok(oComboBox.getSelectedKey(), "Item is still selected");
		assert.strictEqual(oComboBox.getSelectedItem().getKey(), "2", "Item 2 is still selected");

		//Cleanup
		oComboBox.destroy();
	});

	QUnit.test("Changing models reflects on bound selectedKey property", function (assert) {
		//Setup
		var oData = {
			list: [{ id: "1", text: "1" }, { id: "2", text: "2" }],
			selectedKey: "2"
		},
			oModel = new JSONModel(oData),
			oItemsTemplate = new Item({ key: "{id}", text: "{text}" }),
			oComboBox = new ComboBox({
				selectedKey: "{/selectedKey}",
				items: {
					path: "/list",
					template: oItemsTemplate
				}
			});

		//Act
		oComboBox.setModel(oModel);
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		this.clock.tick(100);

		//Assert
		assert.ok(oComboBox.getSelectedKey(), "Item is selected");
		assert.strictEqual(oComboBox.getSelectedItem().getKey(), "2", "Item 2 is selected");

		//Act
		oComboBox.getModel().setProperty("/list", [{ id: "2", text: "2" }, { id: "3", text: "3" }]);
		oComboBox.getModel().setProperty("/selectedKey", "3");

		sap.ui.getCore().applyChanges();
		this.clock.tick(100);

		//Assert
		assert.strictEqual(oComboBox.getSelectedItem().getKey(), "3", "Item 3 is selected");

		//Cleanup
		oComboBox.destroy();
	});

	QUnit.test("Matching item should be selected when deleting input with backspace", function (assert) {
		// setup
		var oItem = new Item({
			text: "Test",
			key: "T"
		});
		var oComboBox = new ComboBox({
			value: "Testt",
			items: [oItem]
		}).placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		sap.ui.qunit.QUnitUtils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.BACKSPACE);
		oComboBox.getFocusDomRef().value = "Test";
		sap.ui.qunit.QUnitUtils.triggerEvent("input", oComboBox.getFocusDomRef(), {
			value: "Test"
		});

		// assert
		assert.ok(oComboBox.getSelectedItem(), "Selected Item should not be falsy");
		assert.equal(oComboBox.getSelectedItem().getText(), oItem.getText(), "First item's text should be selected");
		assert.equal(oComboBox.getSelectedKey(), oItem.getKey(), "First item's key should be selected");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.module("Tablet focus handling");

	QUnit.test("it should not set the focus to the input", function (assert) {
		this.stub(Device, "system", {
			desktop: false,
			tablet: true,
			phone: false
		});

		var oComboBox = new ComboBox(),
			oFakeEvent = null,
			oFocusinStub = this.stub(oComboBox, "focus");

		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		oFakeEvent = { target: oComboBox.getDomRef("arrow") };

		oComboBox.onfocusin(oFakeEvent);

		assert.strictEqual(oFocusinStub.callCount, 0, "Focus should not be called");

		oComboBox.destroy();
	});

	QUnit.test("it should has initial focus set to the input", function (assert) {
		this.stub(Device, "system", {
			desktop: false,
			tablet: true,
			phone: false
		});

		var oComboBox = new ComboBox();

		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		assert.strictEqual(oComboBox.getPicker().getInitialFocus(), oComboBox.getId());

		oComboBox.destroy();
	});

	QUnit.test("it should initially focus the picker", function (assert) {
		this.stub(Device, "system", {
			desktop: false,
			tablet: true,
			phone: false
		});

		var oComboBox = new ComboBox(),
			oFakeEvent;

		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		oFakeEvent = {
			target: oComboBox.getFocusDomRef(),
			setMarked: function () {
			},
			srcControl: oComboBox
		};

		oComboBox.ontap(oFakeEvent);

		assert.strictEqual(oComboBox.getPicker().getInitialFocus(), oComboBox.getId());

		oComboBox.destroy();
	});

	QUnit.test("one visual focus should be shown in the control", function (assert) {
		var oList,
			oComboBox = new ComboBox({
				items: [
					new Item({ text: "AAA", key: "AAA" }),
					new Item({ text: "ABB", key: "ABB" }),
					new Item({ text: "CCC", key: "CCC" })
				]
			});

		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		oComboBox.getFocusDomRef().value = "A";
		sap.ui.qunit.QUnitUtils.triggerEvent("input", oComboBox.getFocusDomRef());
		sap.ui.getCore().applyChanges();

		// assert
		oList = oComboBox.getList();
		assert.ok(oComboBox.$().hasClass("sapMFocus"), "The input field should have visual focus.");
		assert.notOk(oList.hasStyleClass("sapMSelectListFocus"), "A list item should not have visual focus.");
		assert.strictEqual(oList.$().find(".sapMSelectListItemBaseSelected").length, 1, "A list item should be selected.");

		// act
		oComboBox.getFocusDomRef().value = "AC";
		sap.ui.qunit.QUnitUtils.triggerEvent("input", oComboBox.getFocusDomRef());
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(oComboBox.$().hasClass("sapMFocus"), "The input field should have visual focus.");
		assert.strictEqual(oList.$().find(".sapMSelectListItemBaseSelected").length, 0, "No list item should have visual focus.");

		// clean up
		oComboBox.destroy();
	});

	QUnit.test("one visual focus should be shown in the control after selection", function (assert) {
		var oList,
			oComboBox = new ComboBox({
				items: [
					new Item({ text: "AAA", key: "AAA" }),
					new Item({ text: "ABB", key: "ABB" }),
					new Item({ text: "CCC", key: "CCC" })
				]
			});

		oComboBox.placeAt("content");
		oList = oComboBox.getList();

		sap.ui.getCore().applyChanges();

		// act
		oComboBox.open();
		this.clock.tick(2000);

		sap.ui.test.qunit.triggerEvent("tap", oComboBox.getFirstItem().getDomRef());

		this.clock.tick(2000);

		// assert
		assert.notOk(oComboBox.isOpen(), "The picker is closed.");
		assert.ok(oComboBox.$().hasClass("sapMFocus"), "The input field should have visual focus.");

		// act
		oComboBox.open();

		// assert
		assert.notOk(oComboBox.$().hasClass("sapMFocus"), "The input field shouldn't have visual focus.");
		assert.ok(oList.hasStyleClass("sapMSelectListFocus"), "A list item should have visual focus.");
		assert.strictEqual(oList.$().find(".sapMSelectListItemBaseSelected").length, 1, "One list item should have visual focus.");

		// clean up
		oComboBox.destroy();
	});

	QUnit.test("one visual focus should be shown in the control when an item is selected", function (assert) {

		// system under test
		var oList,
			oItem1 = new Item({
				text: "Lorem ipsum dolor sit amet, duo ut soleat insolens, commodo vidisse intellegam ne usu"
			}), oItem2 = new Item({
				text: "Lorem ipsum dolor sit amet, duo ut soleat insolens, commodo vidisse intellegam ne usu"
			}), oComboBox = new ComboBox({
				items: [
					oItem1,
					oItem2
				]
			});

		// arrange
		oComboBox.placeAt("content");
		oList = oComboBox.getList();

		sap.ui.getCore().applyChanges();

		oComboBox.setSelectedItem(oItem1);
		this.clock.tick(500);

		// act
		oComboBox.open();
		this.clock.tick(500);

		// assert
		assert.equal(oComboBox.isOpen(), true, "The picker is opened.");
		assert.notOk(oComboBox.$().hasClass("sapMFocus"), "The input field shouldn't have visual focus.");
		assert.ok(oList.hasStyleClass("sapMSelectListFocus"), "A list item should have visual focus.");
		assert.strictEqual(oList.$().find(".sapMSelectListItemBaseSelected").length, 1, "One list item should have visual focus.");

		oComboBox.close();
		this.clock.tick(1000);

		// assert
		assert.notOk(oComboBox.isOpen(), "The picker is closed.");
		assert.ok(oComboBox.$().hasClass("sapMFocus"), "The input field should have visual focus.");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.module("highlighting");

	QUnit.test("_boldItemRef should return a bold string", function (assert) {
		var oFunctionRef = ComboBox.prototype._boldItemRef;

		assert.strictEqual(oFunctionRef("Test", /^t/i, 1), "<b>T</b>est");
		assert.strictEqual(oFunctionRef("Test", /^Test/i, 4), "<b>Test</b>");
		assert.strictEqual(oFunctionRef("Test", /^/i, 0), "Test");
		assert.strictEqual(oFunctionRef("Test (TE)", /^Test/i, 4), "<b>Test</b>&#x20;&#x28;TE&#x29;");

	});

	QUnit.test("_boldItemRef bold starts with per term", function (assert) {
		var oFunctionRef = ComboBox.prototype._boldItemRef,
			sItemText = "Hong Kong China",
			sQuery1 = "Kong",
			sQuery2 = "Hong",
			sQuery3 = "ong",
			sQuery4 = "Ch",
			sQuery5 = "i";

		assert.strictEqual(oFunctionRef(sItemText, /\bKong/gi, sQuery1.length), "Hong&#x20;<b>Kong</b>&#x20;China");
		assert.strictEqual(oFunctionRef(sItemText, /\bHong/gi, sQuery2.length), "<b>Hong</b>&#x20;Kong&#x20;China");
		assert.strictEqual(oFunctionRef(sItemText, /\bong/gi, sQuery3.length), "Hong&#x20;Kong&#x20;China");
		assert.strictEqual(oFunctionRef(sItemText, /\bCh/gi, sQuery4.length), "Hong&#x20;Kong&#x20;<b>Ch</b>ina");
		assert.strictEqual(oFunctionRef(sItemText, /\bi/gi, sQuery5.length), "Hong&#x20;Kong&#x20;China");
	});

	QUnit.test("_highlightList should call _boldItemRef on items", function (assert) {
		// arrange
		var oComboBox = new ComboBox(),
			oFakeDom = document.createElement("li"),
			oItem = new Item({
				text: "test"
			}),
			oGetVisibleItemsStub = this.stub(oComboBox, "getVisibleItems"),
			оItemRefStub = this.stub(oItem, "getDomRef");

		// act
		oFakeDom.innerHTML = "Test";
		oGetVisibleItemsStub.withArgs().returns([oItem]);
		оItemRefStub.withArgs().returns(oFakeDom);
		oComboBox._highlightList("T");

		// assert
		assert.strictEqual(oFakeDom.innerHTML, "<b>t</b>est", "highlighting should be dont on the dom ref");

		// cleanup
		oGetVisibleItemsStub.restore();
		оItemRefStub.restore();
		oComboBox.destroy();
		oItem.destroy();
		oFakeDom = null;
	});

	QUnit.test("_highlightList doesn't throw an error when showSecondaryValues=true and sap.ui.core.Item is set", function (assert) {

		// system under test
		var fnOnAfterOpenSpy = this.spy(ComboBox.prototype, "onAfterOpen");
		var oComboBox = new ComboBox({
			showSecondaryValues: true,
			items: [
				new Item({
					key: "GER",
					text: "Germany"
				})
			]
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();

		// act
		oComboBox.open();
		this.clock.tick(1000);

		// assert
		assert.strictEqual(fnOnAfterOpenSpy.callCount, 1, "onAfterOpen() called exactly once");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("_highlightList doesn't throw an error when combobox's value contains special characters", function (assert) {

		// system under test
		var fnOnAfterOpenSpy = this.spy(ComboBox.prototype, "onAfterOpen");
		var oComboBox = new ComboBox({
			showSecondaryValues: true,
			items: [
				new Item({
					key: "GER",
					text: "Germany"
				})
			]
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox._highlightList("(T");

		// act
		oComboBox.open();
		this.clock.tick(1000);

		// assert
		assert.strictEqual(fnOnAfterOpenSpy.callCount, 1, "onAfterOpen() called exactly once");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.module("setFilter", {
		beforeEach: function () {
			this.oComboBox = new ComboBox({
				items: [
					new ListItem({
						text: "Hong Kong",
						additionalText: "China",
						key: "key1"
					}),
					new ListItem({
						text: "Baragoi",
						additionalText: "Kenya",
						key: "key2"

					}),
					new ListItem({
						text: "Haskovo",
						additionalText: "Bulgaria",
						key: "key3"
					})
				]
			});

			this.oComboBox.placeAt("content");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oComboBox.destroy();
		}
	});

	QUnit.test("Setting a filter function should update the internal variable", function (assert) {
		this.oComboBox.setFilterFunction(function () { return true; });

		assert.ok(this.oComboBox.fnFilter, "Filter should not be falsy value");
	});

	QUnit.test("Setting an invalid filter should fallback to default text filter", function (assert) {
		var log = sap.ui.require('sap/base/Log'),
			fnWarningSpy = this.spy(log, "warning"),
			fnDefaultFilterSpy = this.stub(ComboBoxBase, "DEFAULT_TEXT_FILTER");

		// null is passed for a filter
		this.oComboBox.setFilterFunction(null);
		assert.notOk(fnWarningSpy.called, "Warning should not be logged in the console when filter is null");

		this.oComboBox.filterItems({ value: "", properties: this.oComboBox._getFilters() });
		assert.ok(fnDefaultFilterSpy.called, "Default text filter should be applied");

		// undefined is passed for a filter
		this.oComboBox.setFilterFunction(undefined);
		assert.notOk(fnWarningSpy.called, "Warning should not be logged in the console when filter is undefined");

		this.oComboBox.filterItems({ value: "", properties: this.oComboBox._getFilters() });
		assert.ok(ComboBoxBase.DEFAULT_TEXT_FILTER.called, "Default text filter should be applied");

		// wrong filter type is passed
		this.oComboBox.setFilterFunction({});
		assert.ok(fnWarningSpy.called, "Warning should be logged in the console when filter is not a function");

		this.oComboBox.filterItems({ value: "", properties: this.oComboBox._getFilters() });
		assert.ok(ComboBoxBase.DEFAULT_TEXT_FILTER.called, "Default text filter should be applied");
	});

	QUnit.test("Setting a valid filter should apply on items", function (assert) {
		var fnFilterSpy = this.spy();

		// null is passed for a filter
		this.oComboBox.setFilterFunction(fnFilterSpy);

		// act
		var aFilteredItems = this.oComboBox.filterItems({ value: "B", properties: this.oComboBox._getFilters() });

		assert.ok(fnFilterSpy.called, "Filter should be called");
		assert.strictEqual(aFilteredItems.length, 0, "Zero items should be filtered");
	});

	QUnit.test("Setting a valid filter should apply on items and their text", function (assert) {
		this.oComboBox.setFilterSecondaryValues(true);
		sap.ui.getCore().applyChanges();

		// act
		var aFilteredItems = this.oComboBox.filterItems({ value: "B", properties: this.oComboBox._getFilters() });

		// assert
		assert.strictEqual(aFilteredItems.length, 2, "Two items should be filtered");
		assert.strictEqual(aFilteredItems[0].getText(), "Baragoi", "Text should start with B");
		assert.strictEqual(aFilteredItems[1].getAdditionalText(), "Bulgaria", "Additional text should start with B");
	});

	QUnit.test("Default filtering should be per term", function (assert) {
		var aFilteredItems = this.oComboBox.filterItems({ value: "K", properties: this.oComboBox._getFilters() });

		assert.strictEqual(aFilteredItems.length, 1, "One item should be filtered");
		assert.strictEqual(aFilteredItems[0].getText(), "Hong Kong", "Hong Kong item is matched by 'K'");
	});

	QUnit.test("Adding a special character should not throw an exception", function (assert) {

		var oFocusDomRef = this.oComboBox.getFocusDomRef();

		oFocusDomRef.value = "*";
		sap.ui.qunit.QUnitUtils.triggerEvent("input", oFocusDomRef);

		assert.ok(true, "No exception should be thrown");
	});

	QUnit.test("Filtering should clear the key if the selected item is no longer amongs the visible in the list ", function (assert) {
		var oFakeEvent = {
			target: {
				value: "k"
			},
			srcControl: this.oComboBox
		};

		// Arrange
		this.oComboBox.setSelectedItem(this.oComboBox.getItems()[2]);
		assert.strictEqual(this.oComboBox.getSelectedKey(), "key3", "Initially a key is selected");

		// Act
		this.oComboBox.handleInputValidation(oFakeEvent, false);

		// Assert
		assert.strictEqual(this.oComboBox.getSelectedKey(), "", "Selected key should be reset");
	});

	QUnit.module("Input Text Selecting without data binding", {
		beforeEach: function () {
			this.comboBox = new ComboBox({
				items: [
					new Item({
						key: 'a',
						text: 'a'
					}),
					new Item({
						key: 'aa',
						text: 'aa'
					}),
					new Item({
						key: 'aaa',
						text: 'aaa'
					}),
					new Item({
						key: 'b',
						text: 'b'
					}),
					new Item({
						key: 'c',
						text: 'c'
					})
				],
				selectionChange: function () {
					this.invalidate();
				}
			}).placeAt("content");

			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.comboBox.destroy();
			this.comboBox = null;
		}
	});

	QUnit.test('Selection when typing and focus in', function (assert) {
		this.comboBox._$input.focus().val("a").trigger("input");
		sap.ui.getCore().applyChanges();
		this.clock.tick(500);

		this.comboBox._$input.focus().val("aa").trigger("input");
		sap.ui.getCore().applyChanges();
		this.clock.tick(500);

		var selectedText = this.comboBox._$input.getSelectedText();
		assert.equal(selectedText, "", "There is no selected text while typing");

		this.comboBox._$input.blur();
		this.clock.tick(500);
		this.comboBox._$input.focus();
		this.comboBox.onfocusin({});

		this.clock.tick(500);

		selectedText = this.comboBox._$input.getSelectedText();
		assert.equal(selectedText, "aa", "The text inside the combo box is selected on focus in");
	});

	QUnit.module("Selection when typing non ASCII characters", {
		beforeEach: function () {
			var oSpecialCharsModel = new JSONModel({
				"special": [
					{ "text": "product", "key": "productId" },
					{ "text": "näme", "key": "name" },
					{ "text": "näme1", "key": "name1" },
					{ "text": "näme11", "key": "name11" }
				]
			});

			this.comboBox = new ComboBox({
				items: {
					path: "/special",
					template: new ListItem({
						key: "{key}",
						text: "{text}"
					})
				}
			}).placeAt("content");

			this.comboBox.setModel(oSpecialCharsModel);

			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.comboBox.destroy();
			this.comboBox = null;
		}
	});

	QUnit.test('Input text selection "without" re-rendering on selection change', function (assert) {

		this.comboBox._$input.focus().val("n").trigger("input");
		sap.ui.getCore().applyChanges();
		this.clock.tick(500);

		var selectedText = this.comboBox._$input.getSelectedText();
		assert.equal(selectedText, "äme", "Selected text is correct");
	});

	QUnit.test('Input text selection "with" re-rendering on selection change', function (assert) {
		this.comboBox.attachEvent('selectionChange', function () {
			this.comboBox.rerender();
		}.bind(this));

		this.comboBox._$input.focus().val("n").trigger("input");
		sap.ui.getCore().applyChanges();
		this.clock.tick(500);

		var selectedText = this.comboBox._$input.getSelectedText();
		assert.equal(selectedText, "äme", "Selected text is correct");
	});

	QUnit.module("Composition characters handling", {
		beforeEach: function () {
			this.comboBox = new ComboBox({
				items: [
					new Item({
						key: '1',
						text: '서비스 ID' //tjqltm ID
					}),
					new Item({
						key: '2',
						text: '서비스 유헝' // tjqltm
					}),
					new Item({
						key: '3',
						text: '성별' // tjd quf
					})
				]
			}).placeAt("content");

			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.comboBox.destroy();
			this.comboBox = null;
		}
	});

	QUnit.test("Filtering", function (assert) {

		// act
		var bMatched = ComboBoxBase.DEFAULT_TEXT_FILTER("서", this.comboBox.getItems()[0], "getText");
		var aFilteredItems = this.comboBox.filterItems({ value: "서", properties: this.comboBox._getFilters() });

		// assert
		assert.ok(bMatched, "'DEFAULT_TEXT_FILTER' should match composite characters");
		assert.strictEqual(aFilteredItems.length, 2, "Two items should be filtered");
		assert.strictEqual(aFilteredItems[0].getText(), "서비스 ID", "Text should start with 서");
	});

	QUnit.test("Composititon events", function (assert) {
		var oFakeEvent = {
			isMarked: function () { },
			setMarked: function () { },
			srcControl: this.comboBox,
			target: {
				value: "서"
			}
		},
		oHandleInputEventSpy = this.spy(this.comboBox, "handleInputValidation"),
		oUpdateDomValueSpy = this.spy(this.comboBox, "updateDomValue");

	this.comboBox._bDoTypeAhead = true;

	// act
	this.comboBox.oncompositionstart(oFakeEvent);
	this.comboBox.oninput(oFakeEvent);
	this.clock.tick(300);

	// assert
	assert.ok(oHandleInputEventSpy.called, "handleInputValidation should be called on input");
	assert.notOk(oUpdateDomValueSpy.called, "Type ahead should not be called while composing");

	});
});