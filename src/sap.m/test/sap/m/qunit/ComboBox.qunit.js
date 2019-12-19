/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/core/CustomData",
	"sap/m/ComboBoxBase",
	"sap/m/ComboBox",
	"sap/m/ComboBoxTextField",
	"sap/m/Label",
	"sap/m/Select",
	"sap/m/StandardListItem",
	"sap/m/GroupHeaderListItem",
	"sap/ui/core/Item",
	"sap/ui/core/ListItem",
	"sap/ui/core/SeparatorItem",
	"sap/ui/model/Sorter",
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
	'sap/ui/core/ValueStateSupport',
	"sap/ui/core/library",
	"sap/ui/events/jquery/EventExtension",
	"sap/ui/qunit/qunit-css",
	"sap/ui/thirdparty/qunit",
	"sap/ui/qunit/qunit-junit",
	"sap/ui/qunit/qunit-coverage",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/thirdparty/sinon-qunit"
], function (
	qutils,
	CustomData,
	ComboBoxBase,
	ComboBox,
	ComboBoxTextField,
	Label,
	Select,
	StandardListItem,
	GroupHeaderListItem,
	Item,
	ListItem,
	SeparatorItem,
	Sorter,
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
	ValueStateSupport,
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

	var CSS_CLASS_SUGGESTIONS_POPOVER = "sapMSuggestionsPopover";

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
		oComboBox.syncPickerContent();
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
		assert.strictEqual(oComboBox._getList().getBusyIndicatorDelay(), 0);
		assert.strictEqual(oComboBox._getList().getWidth(), "100%");
		assert.strictEqual(oComboBox.getShowSecondaryValues(), false, 'By default the showSecondaryValues property of the ComboBox control is "false"');
		assert.strictEqual(oComboBox.getFilterSecondaryValues(), false, 'By default the filterSecondaryValues property of the ComboBox control is "false"');
		assert.ok(jQuery(oComboBox.getOpenArea()).hasClass("sapMInputBaseIconContainer"), "The correct dom is returned for the open area");

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
		oComboBox.syncPickerContent();
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
		assert.ok(fnInsertItem.returned(oComboBox), 'oComboBox.insertAggregation() method return the "this" reference');
		assert.ok(oItem.hasListeners("_change"));
		assert.ok(oComboBox.isItemVisible(oItem));

		// act
		oComboBox.syncPickerContent();

		// assert
		assert.strictEqual(oComboBox._getList().getItems().length, 1, "List should have 1 item");

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
		sap.ui.test.qunit.triggerEvent("tap", oComboBox._getList().getItems()[0].getDomRef());
		this.clock.tick(1000);

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

		oComboBox.syncPickerContent();
		oComboBox.open();
		this.clock.tick(1000);

		// act
		oComboBox.setSelectedItem(null);

		// assert
		assert.ok(oComboBox.getSelectedItem() === null);
		assert.strictEqual(oComboBox.getSelectedItemId(), "");
		assert.strictEqual(oComboBox.getSelectedKey(), "");
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

		oComboBox.syncPickerContent();
		oComboBox.open();
		this.clock.tick(500);

		// act
		oComboBox.setSelectedItemId("");

		// assert
		assert.ok(oComboBox.getSelectedItem() === null);
		assert.strictEqual(oComboBox.getSelectedItemId(), "");
		assert.strictEqual(oComboBox.getSelectedKey(), "");
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

		oComboBox.syncPickerContent();
		oComboBox.open();
		this.clock.tick(500);

		// act
		oComboBox.setSelectedKey("");

		// assert
		assert.ok(oComboBox.getSelectedItem() === null);
		assert.strictEqual(oComboBox.getSelectedItemId(), "");
		assert.strictEqual(oComboBox.getSelectedKey(), "");
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

		oComboBox.syncPickerContent();
		oComboBox.open();
		this.clock.tick(1000); // wait 1s after the open animation is completed
		var sExpectedActiveDescendantId = oComboBox.getListItem(oExpectedItem).getId();

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
				{"value": "1"},
				{"value": "2"}
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
				{"value": "1"},
				{"value": "2"}
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
		oComboBox.syncPickerContent();
		var fnRemoveAggregationSpy = this.spy(oComboBox._getList(), "removeAggregation");
		var fnRemoveItemSpy = this.spy(oComboBox, "removeItem");
		var fnFireChangeSpy = this.spy(oComboBox, "fireChange");

		// act
		oComboBox.removeItem(undefined);

		// assert
		assert.strictEqual(fnRemoveAggregationSpy.callCount, 1, "sap.m.List.removeAggregation() method was called");
		assert.ok(fnRemoveAggregationSpy.calledWith("items", null), "sap.m.List.prototype.removeAggregation() method was called with the expected argument");
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
		oComboBox.syncPickerContent();
		var oModel = new JSONModel();
		var fnRemoveAggregationSpy = this.spy(oComboBox._getList(), "removeAggregation");
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
		var oExpectedItem = oComboBox.removeItem(8);

		// assert
		assert.strictEqual(fnRemoveAggregationSpy.callCount, 1, "sap.m.List.prototype.removeAggregation() method was called");
		assert.ok(fnRemoveAggregationSpy.calledWith("items", oComboBox.getListItem(oExpectedItem)), "sap.m.List.prototype.removeAggregation() method was called with the expected argument");
		assert.ok(oComboBox.getSelectedItem() === null);
		assert.strictEqual(oComboBox.getSelectedItemId(), "");
		assert.strictEqual(oComboBox.getSelectedKey(), "");
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
		// var fnListRemoveAllItemsSpy = this.spy(oComboBox._getList(), "removeAllItems");

		// act
		var oRemovedItems = oComboBox.removeAllItems();
		sap.ui.getCore().applyChanges();

		// assert
		// assert.strictEqual(fnListRemoveAllItemsSpy.callCount, 1, "sap.m.List.prototype.removeAllItems() method was called");
		assert.ok(fnRemoveAllItemsSpy.returned(aItems), "sap.m.ComboBox.prototype.removeAllItems() method returns an array of the removed items");
		assert.ok(oComboBox.getSelectedItem() === null);
		assert.strictEqual(oComboBox.getSelectedItemId(), "");
		assert.strictEqual(oComboBox.getSelectedKey(), "");
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
		oComboBox.syncPickerContent();
		oComboBox.open();
		this.clock.tick(1000); // wait 1s after the open animation is completed
		var fnDestroyItemsSpy = this.spy(oComboBox, "destroyItems");

		// act
		oComboBox.destroyItems();
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(fnDestroyItemsSpy.returned(oComboBox), "sap.m.ComboBox.prototype.destroyItems() method returns the ComboBox instance");

		for (var i = 0; i < aItems.length; i++) {
			assert.strictEqual(aItems[i].hasListeners("_change"), false);
		}

		assert.strictEqual(oComboBox._getList().getItems().length, 0);

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
		oComboBox.syncPickerContent();
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

		oComboBox.syncPickerContent();
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
		oComboBox.syncPickerContent();
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
		var oPicker = oComboBox.syncPickerContent();

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
		var oPicker = oComboBox.syncPickerContent();

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
		var oPicker = oComboBox.syncPickerContent();

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

	QUnit.test("it should close the picker when the ENTER key is pressed", function (assert) {

		// system under test
		this.stub(Device, "system", {
			desktop: false,
			phone: true,
			tablet: false
		});

		// arrange
		var aItems = [
				new Item({
					key: "0",
					text: "Item 0"
				}),

				new Item({
					key: "1",
					text: "Item 1"
				}),

				new Item({
					key: "2",
					text: "Item 2"
				})
			],
			oPickerTextField,
			oPickerTextFieldDomRef,
			fnChangeSpy,
			oComboBox = new ComboBox({
				items: aItems
			});

		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		oComboBox.focus();
		oComboBox.open();
		// tick the clock ahead 1000 miliseconds, after the open animation is completed
		this.clock.tick(1000);

		oPickerTextField = oComboBox.getPickerTextField();
		oPickerTextField.focus();
		oPickerTextFieldDomRef = oPickerTextField.getFocusDomRef();
		fnChangeSpy = this.spy(oComboBox, "fireChange");

		oPickerTextFieldDomRef.value = "I";
		sap.ui.qunit.QUnitUtils.triggerKeydown(oPickerTextFieldDomRef, KeyCodes.I);
		sap.ui.qunit.QUnitUtils.triggerEvent("input", oPickerTextFieldDomRef);
		this.clock.tick(300);
		sap.ui.test.qunit.triggerKeydown(oPickerTextFieldDomRef, KeyCodes.ENTER);
		this.clock.tick(300);

		// assert
		assert.strictEqual(fnChangeSpy.callCount, 1, "The change event was fired");
		assert.strictEqual(oComboBox.getSelectedItem().getText(), "Item 0", "The correct item is selected");
		assert.notOk(oComboBox.isOpen(), "The picker is closed");

		// cleanup
		oComboBox.destroy();
		fnChangeSpy.restore();
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
		oComboBox.aMessageQueue.push(function () {
		});

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

	QUnit.test("valueStateText forwarding", function (assert) {
		this.stub(Device, "system", {
			desktop: false,
			phone: true,
			tablet: false
		});

		var sText = "Error Message",
			oComboBox = new ComboBox("comboBoxVS", {
				valueStateText: sText
			});
		// Arrange
		var sValueStateText = "Error message. Extra long text used as an error message. Extra long text used as an error message - 2. Extra long text used as an error message - 3.";
		oComboBox.placeAt("content");
		oComboBox.syncPickerContent();
		sap.ui.getCore().applyChanges();

		assert.strictEqual(oComboBox._oSuggestionPopover._getPickerValueStateText().getText(), sText,
			"The text is forwarded correctly.");

		// Act
		oComboBox.setValueStateText("");
		oComboBox.setValueState("Error");

		// Assert
		assert.strictEqual(oComboBox._oSuggestionPopover._getPickerValueStateText().getText(), ValueStateSupport.getAdditionalText(oComboBox),
			"The text is set correctly when the state is Error and not specific valueStateText is set.");

		// Act
		oComboBox.setValueStateText(sValueStateText);

		// Assert
		assert.strictEqual(oComboBox._oSuggestionPopover._getPickerValueStateText().getText(), sValueStateText, "The text is set correctly when is set from the user.");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("in 'None' valueState don't showValueState message ", function (assert) {
		var oComboBox = new ComboBox("errorcombobox", {
			valueState: "Error",
			showValueStateMessage: true,
			valueStateText: "Error Message"
		});

		// Arrange
		oComboBox.placeAt("content");
		oComboBox.syncPickerContent();
		sap.ui.getCore().applyChanges();

		var fnShowValueStateTextSpy = this.spy(oComboBox._oSuggestionPopover, "_showValueStateText");
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
		oErrorComboBox.syncPickerContent();
		oErrorComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		// Assert
		assert.ok(oErrorComboBox._oSuggestionPopover._oSimpleFixFlex.getFixContent().hasStyleClass(CSS_CLASS_SUGGESTIONS_POPOVER + "ValueState"), "Header has value state class");
		assert.ok(oErrorComboBox._oSuggestionPopover._oSimpleFixFlex.getFixContent().hasStyleClass(CSS_CLASS_SUGGESTIONS_POPOVER + "ErrorState"), "Header has error value state class");

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
		oErrorComboBox.syncPickerContent();
		oErrorComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		// Assert
		assert.strictEqual(oErrorComboBox._getSuggestionsPopover()._oSimpleFixFlex.getFixContent().getText(), "custom", "text should be custom");

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
		assert.ok(oComboBox._getList() === null);

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

		oComboBox.syncPickerContent();
		oComboBox.open();
		this.clock.tick(1000);

		// act
		oComboBox.destroy();
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(oComboBox.getItems().length, 0);
		assert.ok(oComboBox.getDomRef() === null);
		assert.ok(oComboBox.getPicker() === null);
		assert.ok(oComboBox._getList() === null);
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
		// var fnInvalidateSpy = this.spy(oComboBox, "invalidate");

		// act
		oComboBox.destroyAggregation("items");

		// assert
		assert.ok(fnDestroyAggregationSpy.returned(oComboBox), "sap.m.ComboBox.prototype.destroyAggregation() returns this to allow method chaining");
		// assert.strictEqual(fnInvalidateSpy.callCount, 0, "destroying the items in the list should not invalidate the input field");
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

	QUnit.skip("findAggregatedObjects()", function (assert) {

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
		// assert.strictEqual(oComboBox._getList().getSelectedKey(), "GER");
		// assert.strictEqual(oComboBox._getList().getProperty("selectedKey"), "GER");
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
		oComboBox.syncPickerContent();
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
		oComboBox.syncPickerContent();
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
			assert.strictEqual(oComboBox.getRoleComboNodeDomRef().getAttribute("aria-expanded"), "false");
			assert.strictEqual(oComboBox.getRoleComboNodeDomRef().getAttribute("aria-autocomplete"), "inline");
			assert.strictEqual(jQuery(oComboBox.getFocusDomRef()).attr("aria-required"), undefined);
			assert.ok(oComboBox.$().hasClass(oComboBox.getRenderer().CSS_CLASS_COMBOBOXBASE), 'The combo box element has the CSS class "' + oComboBox.getRenderer().CSS_CLASS_COMBOBOXBASE + '"');
			assert.ok(oComboBox.getAggregation("_endIcon").length, "The HTML span element for the arrow exists");
			assert.ok(oComboBox.getAggregation("_endIcon")[0].getDomRef().classList.contains("sapUiIcon"), 'The arrow button has the CSS class sapUiIcon"');
			assert.ok(oComboBox.getAggregation("_endIcon")[0].hasStyleClass("sapMInputBaseIcon"), 'The arrow button has the CSS class sapMInputBaseIcon "');
			assert.strictEqual(oComboBox.getAggregation("_endIcon")[0].getNoTabStop(), true, "The arrow button is focusable, but it is not reachable via sequential keyboard navigation");
			assert.strictEqual(oComboBox.getAggregation("_endIcon")[0].getDomRef().getAttribute("aria-label"), sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("COMBOBOX_BUTTON"));

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

	QUnit.skip("it should update update the value of the input field when the selected item is pressed", function (assert) {

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
		sap.ui.test.qunit.triggerTouchEvent("tap", oComboBox._getList().getDomRef(), {
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

	QUnit.test("list items title property should be updated after binding", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			items: [
				new Item({
					key: "item1",
					text: "{/item1}"
				})
			]
		});

		// arrange
		oComboBox.syncPickerContent();
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(oComboBox._getList().getItems()[0].getTitle(), "", "List item title is not updated");

		// act
		var oModel = new JSONModel();
		oModel.setData({
			item1: "Item 1"
		});

		oComboBox.setModel(oModel);
		oComboBox._fillList(); // Simulate before open of the popover
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(oComboBox._getList().getItems()[0].getTitle(), "Item 1", "List item title is updated");

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
		assert.strictEqual(oComboBox.getValue(), "", "There is no selected value when the field is not editable");

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
		oComboBox.syncPickerContent();
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
		assert.strictEqual(oComboBox._getList().getBusy(), true, "the loading indicator in the dropdown list is shown");
		assert.strictEqual(oComboBox.getFocusDomRef().getAttribute("aria-busy"), "true");

		// tick the clock ahead some ms millisecond (it should be at least more than the auto respond setting
		// to make sure that the data from the OData model is available)
		this.clock.tick(iAutoRespondAfter + 1);

		assert.ok(oComboBox.getItems().length > 0, "the items are loaded");
		assert.strictEqual(oComboBox._getList().getBusy(), false, "the loading indicator in the dropdown list is not shown");
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
				setMarked: function () {
				},
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
		oComboBox.syncPickerContent();
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
		oComboBox.syncPickerContent();
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
		var sExpectedActiveDescendantId = oComboBox.getListItem(oExpectedItem).getId();

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
		oComboBox.syncPickerContent();
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();
		this.clock.tick(0);	// tick the clock ahead 0ms millisecond to make sure the async call to .selectText() on the focusin event handler does not override the type ahead
		oComboBox.open();
		this.clock.tick(1000);	// wait after the open animation is completed
		var sExpectedActiveDescendantId = oComboBox.getListItem(oExpectedItem).getId();

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
		oComboBox.syncPickerContent();
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();
		this.clock.tick(0);	// tick the clock ahead 0ms millisecond to make sure the async call to .selectText() on the focusin event handler does not override the type ahead
		oComboBox.open();
		this.clock.tick(1000);	// wait after the open animation is completed
		var sExpectedActiveDescendantId = oComboBox.getListItem(oExpectedItem).getId();

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
		var sExpectedActiveDescendantId = oComboBox.getListItem(oExpectedItem).getId();

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
		var sExpectedActiveDescendantId = oComboBox.getListItem(oExpectedItem).getId();

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
		oComboBox.syncPickerContent();
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();
		oComboBox.open();
		this.clock.tick(1000);	// wait 1s after the open animation is completed
		var sExpectedActiveDescendantId = oComboBox.getListItem(oExpectedItem).getId();

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

		// act
		oComboBox.getFocusDomRef().value = "G";
		sap.ui.qunit.QUnitUtils.triggerEvent("input", oComboBox.getFocusDomRef());
		this.clock.tick(1000);	// wait 1s after the open animation is completed
		var sExpectedActiveDescendantId = oComboBox.getListItem(oExpectedItem).getId();

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
		var sOpenState = OpenState.CLOSED;

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
		sap.ui.qunit.QUnitUtils.triggerEvent("input", oFocusDomRef, {value: "lo"});

		// wait for the word completion feature
		this.clock.tick(0);

		// remove the autocompleted text ("rem ipsum" by pressing the backspace keyboard key
		sap.ui.qunit.QUnitUtils.triggerKeydown(oFocusDomRef, KeyCodes.BACKSPACE);
		oFocusDomRef.value = "lo";
		sap.ui.qunit.QUnitUtils.triggerEvent("input", oFocusDomRef, {value: "lo"});

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
		assert.strictEqual(oComboBox.getRoleComboNodeDomRef().getAttribute("aria-expanded"), "true");
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

		// act
		oComboBox.syncPickerContent();
		oComboBox.open();
		this.clock.tick(1000);
		var sExpectedActiveDescendantId = oComboBox.getListItem(oExpectedItem).getId();

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
				}),
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
				}),
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
				})

			],

			selectedKey: "7"
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();
		oComboBox.open();
		this.clock.tick(1000);

		// asserts
		assert.ok(oComboBox._oSuggestionPopover._getScrollableContent().scrollTop, "The picker was scrolled");
		assert.ok(oComboBox._oSuggestionPopover._getScrollableContent().scrollTop < oComboBox.getListItem(oComboBox.getSelectedItem()).getDomRef().offsetTop,
				"The selected item is on the viewport");

		// cleanup
		oComboBox.destroy();

	});

	QUnit.test("onAfterOpen should select the value text in the input field", function (assert) {

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
		var oSpy = this.spy(oComboBox, "selectText");
		var oStub = this.stub(oComboBox, "_getSelectionRange").returns({
			start: 7,
			end: 7
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();
		oComboBox.focus();

		// act
		oComboBox.syncPickerContent();
		oComboBox.open();
		this.clock.tick(1000);

		// assert
		assert.strictEqual(oSpy.firstCall.args[0], 0, "Selection was called with first argument 0");
		assert.strictEqual(oSpy.firstCall.args[1], 7, "Selection was called with second argument 7");

		// cleanup
		oSpy.restore();
		oStub.restore();
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
		assert.strictEqual(oComboBox.getRoleComboNodeDomRef().getAttribute("aria-expanded"), "false");
		assert.strictEqual(oComboBox.$("inner").attr("aria-activedescendant"), undefined, 'The "aria-activedescendant" attribute is set when the active descendant is rendered and visible');

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("it should set the focus to the body after fired onAfterClose event", function (assert) {

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

	QUnit.test("Should trigger change event only once", function (assert) {
		// system under test
		var oComboBox = new ComboBox({
				items: [
					new Item({key: 1, text: "desc1"}),
					new Item({key: 2, text: "desc12"}),
					new Item({key: 3, text: "desc13"}),
					new Item({key: 4, text: "desc14"})
				]
			}).placeAt("content"),
			oMockEvent = {
				getParameter: function () {
					return oComboBox._getList().getItems()[2];
				}
			},
			fnFireChangeSpy = this.spy(oComboBox, "fireChange");

		sap.ui.getCore().applyChanges();

		// Act
		oComboBox.syncPickerContent();
		oComboBox.updateDomValue("desc1");
		oComboBox.onSelectionChange(oMockEvent);
		oComboBox.onItemPress(oMockEvent);

		assert.strictEqual(fnFireChangeSpy.callCount, 1, "Change Event should be called just once");

		// Cleanup
		oComboBox.destroy();
	});

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
	QUnit.skip("it should fire the change event after the selection is updated on mobile devices", function (assert) {
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

		var oListDomRef = oComboBox._getList().getDomRef();
		var oListItem = oComboBox.getListItem(oItem);
		var oTouches = {
			0: {
				pageX: 1,
				pageY: 1,
				identifier: 0,
				target: oListItem.getDomRef()
			},

			length: 1
		};

		sap.ui.test.qunit.triggerTouchEvent("touchstart", oListDomRef, {
			srcControl: oListItem,
			touches: oTouches,
			targetTouches: oTouches
		});

		sap.ui.test.qunit.triggerTouchEvent("touchend", oListDomRef, {
			srcControl: oListItem,
			changedTouches: oTouches,
			touches: {
				length: 0
			}
		});

		sap.ui.test.qunit.triggerTouchEvent("tap", oListDomRef, {
			srcControl: oListItem,
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
		var oControlEvent = new Event("selectionChange", oComboBox._getList(), {
			listItem: oComboBox.getListItem(oItem)
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

		var oListItem = oComboBox.getListItem(oComboBox.getItems()[0]);
		oComboBox._oList.fireItemPress({listItem: oListItem});

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

		var oListItem = oComboBox.getListItem(oComboBox.getItems()[0]);
		oComboBox._oList.fireItemPress({listItem: oListItem});

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
		oComboBox.syncPickerContent();
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
		oComboBox.syncPickerContent();
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
		assert.strictEqual(oInfo.description, "Value", "Description");
		assert.strictEqual(oInfo.focusable, true, "Focusable");
		assert.strictEqual(oInfo.enabled, true, "Enabled");
		assert.strictEqual(oInfo.editable, true, "Editable");
		oComboBox.setValue("");
		oComboBox.setEnabled(false);
		oInfo = oComboBox.getAccessibilityInfo();
		assert.strictEqual(oInfo.description, "", "Description");
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

		assert.strictEqual(oComboBox.getRoleComboNodeDomRef().getAttribute("role"), "combobox", "should be combobox");
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
		assert.ok(sAriaLabelledBy.indexOf(oLabel.getId()) > -1, "ComboBox aria-labelledby attribute is set to label id");

		oLabel.destroy();
		oComboBox.destroy();
	});

	if (Device.browser.internet_explorer) {
		QUnit.test("AriaDescribedBy", function (assert) {
			var oComboBox = new ComboBox(),
				oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("ACC_CTR_TYPE_COMBO");

			oComboBox.placeAt("content");
			sap.ui.getCore().applyChanges();

			var oInvisibleText = oComboBox.oInvisibleText;

			//Assert
			assert.ok(oComboBox.$("inner").attr("aria-describedby").length > 0, "Property aria-describedby should exist");
			assert.strictEqual(oInvisibleText.getText(), oResourceBundle, "'ComboBox' is announced.");

			//Cleanup
			oComboBox.destroy();
		});
	}

	if (Device.browser.internet_explorer) {
		QUnit.test("setTooltip()", function (assert) {
			var oComboBox = new ComboBox({
				value: "Value",
				tooltip: "Tooltip",
				placeholder: "Placeholder"
			});

			oComboBox.placeAt("content");
			sap.ui.getCore().applyChanges();

			oComboBox.setTooltip('');
			sap.ui.getCore().applyChanges();

			//Assert
			assert.strictEqual(oComboBox.getTooltip(), null, 'setTooltip() method should not throw an error');

			//Cleanup
			oComboBox.destroy();
		});
	}

	QUnit.module("Integration");

	QUnit.test("Propagate Items to the list", function (assert) {
		// Setup
		var vTemp,
			aItems = [
				new Item({key: "E", text: "Email Address"}),
				new Item({key: "L", text: "List"}),
				new Item({key: "N", text: "Number"}),
				new Item({key: "Q", text: "Quantity"}),
				new Item({key: "T1", text: "Text"})
			],
			oComboBox = new ComboBox({
				items: [
					new Item({key: "A", text: "Amount"}),
					new Item({key: "C", text: "Checkbox"}),
					new Item({key: "D", text: "Date"})
				]
			});
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		// Assert
		assert.ok(!oComboBox._getList(), "No list available on init (lazy loading)");


		// Act (init the SuggestionPopover with the List)
		oComboBox.syncPickerContent();

		// Assert
		assert.strictEqual(oComboBox.getItems().length, oComboBox._getList().getItems().length, "On init the List item should be the same as core items");

		// Act
		vTemp = oComboBox.removeAllItems();

		// Assert
		assert.strictEqual(oComboBox.getItems().length, oComboBox._getList().getItems().length, "The List item should be the same as core items");
		assert.strictEqual(oComboBox.getItems().length, 0, "The Items aggregation should be empty");
		assert.strictEqual(vTemp.length, 3, "The items from the combobox should be returned by the removeAllItems method");

		// Act
		vTemp = aItems.pop();
		oComboBox.addItem(vTemp);

		// Assert
		assert.strictEqual(oComboBox.getItems().length, oComboBox._getList().getItems().length, "The List item should be the same as core items");
		assert.strictEqual(oComboBox.getItems().length, 1, "The Items aggregation should have 1 item");

		// Act
		oComboBox.removeItem(vTemp);

		// Assert
		assert.strictEqual(oComboBox.getItems().length, oComboBox._getList().getItems().length, "The List item should be the same as core items");
		assert.strictEqual(oComboBox.getItems().length, 0, "The Items aggregation should be empty");

		// Act
		oComboBox.insertItem(aItems[0]);
		oComboBox.insertItem(aItems[1]);
		oComboBox.insertItem(aItems[2], 1);

		// Assert
		assert.strictEqual(oComboBox.getItems().length, oComboBox._getList().getItems().length, "The List item should be the same as core items");
		assert.strictEqual(oComboBox.getItems().length, 3, "The Items aggregation should have 3 items");
		assert.strictEqual(oComboBox._getList().getItems()[0].getTitle(), "List", "Properly insert and position items in the list");

		// Act
		oComboBox.destroyItems();

		// Assert
		assert.strictEqual(oComboBox.getItems().length, oComboBox._getList().getItems().length, "The List item should be the same as core items");
		assert.strictEqual(oComboBox.getItems().length, 0, "The Items aggregation should be empty");

		oComboBox.destroy();
		oComboBox = null;
		sap.ui.getCore().applyChanges();
	});

	QUnit.test("Object cloning", function (assert) {
		// Setup
		var oComboBoxClone,
			oComboBox = new ComboBox({
				items: [
					new Item({key: "A", text: "Amount"}),
					new Item({key: "C", text: "Checkbox"}),
					new Item({key: "D", text: "Date"}),
					new Item({key: "E", text: "Email Address"}),
					new Item({key: "L", text: "List"}),
					new Item({key: "N", text: "Number"}),
					new Item({key: "Q", text: "Quantity"}),
					new Item({key: "T1", text: "Text"})
				]
			});

		assert.ok(!oComboBox._getList(), "The List is not yet loaded");

		// Act
		oComboBox.open();
		oComboBox.close();

		// Assert
		assert.ok(oComboBox._getList(), "The List got loaded");

		// Act
		oComboBoxClone = oComboBox.clone();

		// Assert
		assert.ok(oComboBoxClone._getList(), "The List got clonned");
		assert.strictEqual(oComboBoxClone._getList().getItems().length, 8, "List items were clonned");

		// Cleanup
		oComboBoxClone.destroy();
		oComboBox.destroy();
	});

	QUnit.test("Keep selected value on parent re-render", function (assert) {
		var oComboBox = new ComboBox({
			items: [
				new Item({key: "A", text: "Amount"}),
				new Item({key: "C", text: "Checkbox"}),
				new Item({key: "D", text: "Date"}),
				new Item({key: "E", text: "Email Address"}),
				new Item({key: "L", text: "List"}),
				new Item({key: "N", text: "Number"}),
				new Item({key: "Q", text: "Quantity"}),
				new Item({key: "T1", text: "Text"})
			],
			selectionChange: function onSelectionChange() {
				oForm.rerender();
			}
		});
		oComboBox.syncPickerContent();


		var oForm = new SimpleForm({
			content: [oComboBox]
		}).placeAt('content');

		sap.ui.getCore().applyChanges();

		var oListItem = oComboBox.getListItem(oComboBox.getItems()[1]);
		oComboBox._oList.fireItemPress({listItem: oListItem});
		oComboBox._oList.fireSelectionChange({listItem: oListItem});

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
		var oData = {list: [{id: "1", text: "1"}]},
			oModel = new JSONModel(oData),
			oItemsTemplate = new Item({key: "{id}", text: "{text}"}),
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
		oComboBox.getModel().setProperty("/list", [{id: "2", text: "2"}]);
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
		var oData = {list: [{id: "1", text: "1"}, {id: "2", text: "2"}]},
			oModel = new JSONModel(oData),
			oItemsTemplate = new Item({key: "{id}", text: "{text}"}),
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
		oComboBox.getModel().setProperty("/list", [{id: "2", text: "2"}, {id: "33", text: "33"}]);
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
				list: [{id: "1", text: "1"}, {id: "2", text: "2"}],
				selectedKey: "2"
			},
			oModel = new JSONModel(oData),
			oItemsTemplate = new Item({key: "{id}", text: "{text}"}),
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
		oComboBox.getModel().setProperty("/list", [{id: "2", text: "2"}, {id: "3", text: "3"}]);
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

		oFakeEvent = {target: oComboBox.getDomRef("arrow")};

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
		oComboBox.syncPickerContent();

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

		oComboBox.syncPickerContent();
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

	QUnit.test("The picker should open when icon is pressed", function (assert) {
		this.stub(Device, "system", {
			desktop: false,
			tablet: true,
			phone: false
		});

		var oComboBox = new ComboBox({
			items: [
				new SeparatorItem({text: "Group1"}),
				new Item({text: "item11", key: "key11"}),
				new Item({text: "item12", key: "key12"}),
				new SeparatorItem({text: "Group2"}),
				new Item({text: "item21", key: "key21"}),
				new Item({text: "item22", key: "key22"})
			]
		});
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		oComboBox._handlePopupOpenAndItemsLoad(false);

		assert.ok(oComboBox.isOpen(), "ComboBox is open");
		assert.ok(oComboBox.$().hasClass(InputBase.ICON_PRESSED_CSS_CLASS));

		oComboBox.destroy();
	});

	QUnit.test("one visual focus should be shown in the control", function (assert) {
		var oList,
			oComboBox = new ComboBox({
				items: [
					new Item({text: "AAA", key: "AAA"}),
					new Item({text: "ABB", key: "ABB"}),
					new Item({text: "CCC", key: "CCC"})
				]
			});

		oComboBox.syncPickerContent();
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		oComboBox.getFocusDomRef().value = "A";
		sap.ui.qunit.QUnitUtils.triggerEvent("input", oComboBox.getFocusDomRef());
		sap.ui.getCore().applyChanges();

		// assert
		oList = oComboBox._getList();
		assert.ok(oComboBox.$().hasClass("sapMFocus"), "The input field should have visual focus.");
		assert.notOk(oList.hasStyleClass("sapMListFocus"), "The list should not have .sapMListFocus applied.");
		assert.strictEqual(oList.$().find(".sapMLIBSelected").length, 1, "The list items should be selected but without focus outline.");

		// act
		oComboBox.getFocusDomRef().value = "AC";
		sap.ui.qunit.QUnitUtils.triggerEvent("input", oComboBox.getFocusDomRef());
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(oComboBox.$().hasClass("sapMFocus"), "The input field should have visual focus.");
		assert.notOk(oList.hasStyleClass("sapMListFocus"), "The list should not have .sapMListFocus applied.");
		assert.strictEqual(oList.$().find(".sapMLIBSelected").length, 0, "There is no list items in the list.");

		// clean up
		oComboBox.destroy();
	});

	QUnit.test("one visual focus should be shown in the control after selection", function (assert) {
		var oList,
			oComboBox = new ComboBox({
				items: [
					new Item({text: "AAA", key: "AAA"}),
					new Item({text: "ABB", key: "ABB"}),
					new Item({text: "CCC", key: "CCC"})
				]
			});

		oComboBox.syncPickerContent();
		oComboBox.placeAt("content");
		oList = oComboBox._getList();

		sap.ui.getCore().applyChanges();

		// act
		oComboBox.open();
		this.clock.tick(2000);

		sap.ui.test.qunit.triggerEvent("tap", oComboBox.getListItem(oComboBox.getFirstItem()).getDomRef());

		this.clock.tick(2000);

		// assert
		assert.notOk(oComboBox.isOpen(), "The picker is closed.");
		assert.ok(oComboBox.$().hasClass("sapMFocus"), "The input field should have visual focus.");

		// act
		oComboBox.open();

		// assert
		assert.notOk(oComboBox.$().hasClass("sapMFocus"), "The input field shouldn't have visual focus.");
		assert.ok(oList.hasStyleClass("sapMListFocus"), "The list should have .sapMListFocus applied.");
		assert.strictEqual(oList.$().find(".sapMLIBSelected").length, 1, "There is one selected list items in the list.");

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
		oComboBox.syncPickerContent();
		oComboBox.placeAt("content");
		oList = oComboBox._getList();

		sap.ui.getCore().applyChanges();

		oComboBox.setSelectedItem(oItem1);
		this.clock.tick(500);

		// act
		oComboBox.open();
		this.clock.tick(500);

		// assert
		assert.equal(oComboBox.isOpen(), true, "The picker is opened.");
		assert.notOk(oComboBox.$().hasClass("sapMFocus"), "The input field shouldn't have visual focus.");
		assert.ok(oList.hasStyleClass("sapMListFocus"), "The list should have .sapMListFocus applied.");
		assert.strictEqual(oList.$().find(".sapMLIBSelected").length, 1, "There is one selected list items in the list.");

		oComboBox.close();
		this.clock.tick(1000);

		// assert
		assert.notOk(oComboBox.isOpen(), "The picker is closed.");
		assert.ok(oComboBox.$().hasClass("sapMFocus"), "The input field should have visual focus.");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("Disabled ComboBox should not have focus", function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			enabled: false
		});

		// arrange
		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		sap.ui.qunit.QUnitUtils.triggerEvent("focusin", oComboBox.getOpenArea(), {
			target: oComboBox.getOpenArea()
		});

		// assert
		assert.ok(!oComboBox.$().hasClass("sapMFocus"), "The input field should not have visual focus.");

		// cleanup
		oComboBox.destroy();
	});


	QUnit.module("highlighting");

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
		oComboBox.syncPickerContent();

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
						additionalText: "China"
					}),
					new ListItem({
						text: "Baragoi",
						additionalText: "Kenya"
					}),
					new ListItem({
						text: "Haskovo",
						additionalText: "Bulgaria"
					})
				]
			});

			this.oComboBox.syncPickerContent();
			this.oComboBox.placeAt("content");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oComboBox.destroy();
		}
	});

	QUnit.test("Setting a filter function should update the internal variable", function (assert) {
		this.oComboBox.setFilterFunction(function () {
			return true;
		});

		assert.ok(this.oComboBox.fnFilter, "Filter should not be falsy value");
	});

	QUnit.test("Setting an invalid filter should fallback to default text filter", function (assert) {
		var log = sap.ui.require('sap/base/Log'),
			fnWarningSpy = this.spy(log, "warning"),
			fnDefaultFilterSpy = this.stub(ComboBoxBase, "DEFAULT_TEXT_FILTER");

		// null is passed for a filter
		this.oComboBox.setFilterFunction(null);
		assert.notOk(fnWarningSpy.called, "Warning should not be logged in the console when filter is null");

		this.oComboBox.filterItems({value: "", properties: this.oComboBox._getFilters()});
		assert.ok(fnDefaultFilterSpy.called, "Default text filter should be applied");

		// undefined is passed for a filter
		this.oComboBox.setFilterFunction(undefined);
		assert.notOk(fnWarningSpy.called, "Warning should not be logged in the console when filter is undefined");

		this.oComboBox.filterItems({value: "", properties: this.oComboBox._getFilters()});
		assert.ok(ComboBoxBase.DEFAULT_TEXT_FILTER.called, "Default text filter should be applied");

		// wrong filter type is passed
		this.oComboBox.setFilterFunction({});
		assert.ok(fnWarningSpy.called, "Warning should be logged in the console when filter is not a function");

		this.oComboBox.filterItems({value: "", properties: this.oComboBox._getFilters()});
		assert.ok(ComboBoxBase.DEFAULT_TEXT_FILTER.called, "Default text filter should be applied");
	});

	QUnit.test("Setting a valid filter should apply on items", function (assert) {
		var fnFilterSpy = this.spy();

		// null is passed for a filter
		this.oComboBox.setFilterFunction(fnFilterSpy);

		// act
		var aFilteredItems = this.oComboBox.filterItems({value: "B", properties: this.oComboBox._getFilters()});

		assert.ok(fnFilterSpy.called, "Filter should be called");
		assert.strictEqual(aFilteredItems.length, 0, "Zero items should be filtered");
	});

	QUnit.test("Setting a valid filter should apply on items and their text", function (assert) {
		this.oComboBox.setFilterSecondaryValues(true);
		sap.ui.getCore().applyChanges();

		// act
		var aFilteredItems = this.oComboBox.filterItems({value: "B", properties: this.oComboBox._getFilters()});

		// assert
		assert.strictEqual(aFilteredItems.length, 2, "Two items should be filtered");
		assert.strictEqual(aFilteredItems[0].getText(), "Baragoi", "Text should start with B");
		assert.strictEqual(aFilteredItems[1].getAdditionalText(), "Bulgaria", "Additional text should start with B");
	});

	QUnit.test("Default filtering should be per term", function (assert) {
		var aFilteredItems = this.oComboBox.filterItems({value: "K", properties: this.oComboBox._getFilters()});

		assert.strictEqual(aFilteredItems.length, 1, "One item should be filtered");
		assert.strictEqual(aFilteredItems[0].getText(), "Hong Kong", "Hong Kong item is matched by 'K'");
	});

	QUnit.test("Adding a special character should not throw an exception", function (assert) {

		var oFocusDomRef = this.oComboBox.getFocusDomRef();

		oFocusDomRef.value = "*";
		sap.ui.qunit.QUnitUtils.triggerEvent("input", oFocusDomRef);

		assert.ok(true, "No exception should be thrown");
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
						key: 'aaa',
						text: 'aaa'
					}),
					new Item({
						key: 'aaaa',
						text: 'aaaa'
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
		// Act
		this.comboBox._$input.focus().val("a").trigger("input");
		var selectedText = selectedText = this.comboBox._$input.getSelectedText();

		// Assert
		assert.equal(selectedText, "", "There is no selected text when matching a suggestion");

		// Act
		this.comboBox._$input.focus().val("aa").trigger("input");
		selectedText = this.comboBox._$input.getSelectedText();

		// Assert
		assert.equal(selectedText, "a", "The next suggestions is autocompleted");

		// Act
		this.comboBox._$input.focus().val("aaaa").trigger("input");
		selectedText = this.comboBox._$input.getSelectedText();

		// Assert
		assert.equal(selectedText, "", "There is no selected text when matching a suggestion");

		// Act
		this.comboBox.onsapfocusleave({});
		this.clock.tick(500);
		this.comboBox._$input.focus();
		this.comboBox.onfocusin({});
		this.clock.tick(500);

		selectedText = this.comboBox._$input.getSelectedText();

		// Assert
		assert.equal(selectedText, "aaaa", "The text inside the combo box is selected on focus in");
	});

	QUnit.module("Selection when typing non ASCII characters", {
		beforeEach: function () {
			var oSpecialCharsModel = new JSONModel({
				"special": [
					{"text": "product", "key": "productId"},
					{"text": "näme", "key": "name"},
					{"text": "näme1", "key": "name1"},
					{"text": "näme11", "key": "name11"}
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
		this.comboBox.syncPickerContent();

		// act
		var bMatched = ComboBoxBase.DEFAULT_TEXT_FILTER("서", this.comboBox.getItems()[0], "getText");
		var aFilteredItems = this.comboBox.filterItems({value: "서", properties: this.comboBox._getFilters()});

		// assert
		assert.ok(bMatched, "'DEFAULT_TEXT_FILTER' should match composite characters");
		assert.strictEqual(aFilteredItems.length, 2, "Two items should be filtered");
		assert.strictEqual(aFilteredItems[0].getText(), "서비스 ID", "Text should start with 서");
	});

	QUnit.test("Composititon events", function (assert) {
		var oFakeEvent = {
				isMarked: function () {
				},
				setMarked: function () {
				},
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

	QUnit.module("Deprecated methods");

	QUnit.test("log warning when trying to use ComboBox.getList().", function (assert) {
		assert.expect(4);
		var fnWarningSpy = this.spy(Log, "warning");

		var oComboBox = new ComboBox();

		oComboBox.getList();

		assert.strictEqual(fnWarningSpy.callCount, 1, "Exactly 1 warning has been logged");
		assert.strictEqual(fnWarningSpy.firstCall.args[0], "[Warning]:", "First argument correct.");
		assert.strictEqual(fnWarningSpy.firstCall.args[1], "You are attempting to use deprecated method 'getList()', please refer to SAP note 2746748.", "Second argument correct.");
		assert.strictEqual(fnWarningSpy.firstCall.args[2], oComboBox, "Third argument correct.");

		oComboBox.destroy();
	});

	QUnit.module("_mapItemToListItem", {
		beforeEach: function () {
			this.oComboBox = new ComboBox();
		},
		afterEach: function () {
			this.oComboBox.destroy();
		}
	});

	QUnit.test("returns StandardListItem when called with Item.", function (assert) {
		// system under test
		var oItem = new Item({
				text: "text",
				key: "key"
			}),
			sClass = this.oComboBox.getRenderer().CSS_CLASS_COMBOBOXBASE + "Item",
			oListItem;

		// act
		oListItem = this.oComboBox._mapItemToListItem(oItem);

		// assert
		assert.ok(oListItem.isA("sap.m.StandardListItem"), "The ListItem is of type 'sap.m.StandardListItem'.");
		assert.ok(oListItem.aCustomStyleClasses.indexOf(sClass) > -1, "Class " + sClass + " was added to the ListItem");
		assert.strictEqual(oListItem.getTitle(), "text", "The title of the ListItem was set correctly.");
	});

	QUnit.test("returns StandardListItem when called with ListItem with additional text", function (assert) {
		// system under test
		var oItem = new ListItem({
				text: "text",
				key: "key",
				additionalText: "additional text"
			}),
			oListItem;

		this.oComboBox.setShowSecondaryValues(true);

		// act
		oListItem = this.oComboBox._mapItemToListItem(oItem);

		// assert
		assert.ok(oListItem.isA("sap.m.StandardListItem"), "The ListItem is of type 'sap.m.StandardListItem'.");
		assert.strictEqual(oListItem.getTitle(), "text", "The title of the ListItem was set correctly.");
		assert.strictEqual(oListItem.getInfo(), "additional text", "The info of the ListItem was set correctly.");
	});

	QUnit.test("returns GroupHeaderListItem when called with SeparatorItem with text", function (assert) {
		// system under test
		var oItem = new SeparatorItem({
				text: "Group header text",
				key: "key"
			}),
			sClass = this.oComboBox.getRenderer().CSS_CLASS_COMBOBOXBASE + "NonInteractiveItem",
			oListItem;

		// act
		oListItem = this.oComboBox._mapItemToListItem(oItem);

		// assert
		assert.ok(oListItem.isA("sap.m.GroupHeaderListItem"), "The ListItem is of type 'sap.m.GroupHeaderListItem'.");
		assert.ok(oListItem.aCustomStyleClasses.indexOf(sClass) > -1, "Class " + sClass + " was added to the ListItem");
		assert.strictEqual(oListItem.getTitle(), "Group header text", "The title of the GroupHeaderListItem was set correctly.");
	});

	QUnit.test("returns GroupHeaderListItem when called with SeparatorItem without text", function (assert) {
		// system under test
		var oItem = new SeparatorItem(),
			sClass = this.oComboBox.getRenderer().CSS_CLASS_COMBOBOXBASE + "NonInteractiveItem",
			sAdditionalClass = this.oComboBox.getRenderer().CSS_CLASS_COMBOBOXBASE + "SeparatorItemNoText",
			oListItem;

		// act
		oListItem = this.oComboBox._mapItemToListItem(oItem);

		// assert
		assert.ok(oListItem.isA("sap.m.GroupHeaderListItem"), "The ListItem is of type 'sap.m.GroupHeaderListItem'.");
		assert.ok(oListItem.aCustomStyleClasses.indexOf(sClass) > -1, "Class " + sClass + " was added to the ListItem");
		assert.ok(oListItem.aCustomStyleClasses.indexOf(sAdditionalClass) > -1, "Class " + sAdditionalClass + " was added to the ListItem");
	});

	QUnit.test("forwards custom data to StandardListItem.", function (assert) {
		// system under test
		var oItem = new Item({
				text: "text",
				key: "key"
			}).addCustomData(new CustomData({
				key: "customInfo",
				value: "first-item",
				writeToDom: true
			})),
			oListItem = this.oComboBox._mapItemToListItem(oItem);

		// assert
		assert.strictEqual(oListItem.data("customInfo"), "first-item", "The custom data is forwarded.");

		oItem.destroy();
		oListItem.destroy();
	});

	QUnit.module("Property forwarding from Item to ListItem", {
		beforeEach: function () {
			this.oComboBox = new ComboBox();
		},
		afterEach: function () {
			this.oComboBox.destroy();
		}
	});

	QUnit.test("Direct property forwarding", function (assert) {
		// system under test
		var oItem = new Item({
				text: "Item Title",
				enabled: true,
				tooltip: "Tooltip Text"
			}), oListItem;

		this.oComboBox.addItem(oItem);
		oListItem = this.oComboBox._mapItemToListItem(oItem);
		sap.ui.getCore().applyChanges();

		// act
		oItem.setText("New Item Title");
		oItem.setTooltip("New Tooltip Text");
		oItem.setEnabled(false);
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(oListItem.getTitle(), "New Item Title", "The list item title is updated.");
		assert.strictEqual(oListItem.getTooltip(), "Tooltip Text", "The tooltip is updated.");
		assert.notOk(oListItem.getVisible(), "The list item is not visible.");
	});

	QUnit.test("Additional text forwarding", function (assert) {
		// system under test
		var oItem = new ListItem({
			text: "Item Title"
		}), oListItem;

		this.oComboBox.addItem(oItem);
		this.oComboBox.setShowSecondaryValues(true);
		oListItem = this.oComboBox._mapItemToListItem(oItem);
		sap.ui.getCore().applyChanges();

		// act
		oItem.setAdditionalText("New additional text");
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(oListItem.getInfo(), "New additional text", "The list item info is updated.");
	});

	QUnit.module("Input field text selection", {
		beforeEach: function () {
			this.oComboBox = new ComboBox();

			// Mocked control data
			this.oFakeFocusDomRef = {
				selectionStart: 0,
				selectionEnd: 0,
				value: {
					substring: function () {
					}
				}
			};
			this.oFakeControl = {
				getFocusDomRef: function () {
					return this.oFakeFocusDomRef;
				}.bind(this),
				_itemsTextStartsWithTypedValue: function () {
					return true;
				},
				_bIsLastFocusedItemHeader: false,
				getValue: function () {
					return "";
				},
				_getSelectionRange: function (oComboBox) {
					return oComboBox._getSelectionRange.call(this);
				},
				_shouldResetSelectionStart: function (oComboBox) {
					return oComboBox._shouldResetSelectionStart.call(this);
				}
			};
		},
		afterEach: function () {
			this.oComboBox.destroy();
			this.oFakeFocusDomRef = null;
			this.oFakeControl = null;
		}
	});

	QUnit.test("_itemsTextStartsWithTypedValue - items text starts with sTypedText", function (assert) {
		// system under test
		var oItem = new Item({
				text: "value1",
				key: "key1"
			}),
			sTypedValue = "va";

		// assert
		assert.ok(this.oComboBox._itemsTextStartsWithTypedValue(oItem, sTypedValue), "Items text starts with sTypedText");
	});

	QUnit.test("_itemsTextStartsWithTypedValue - items text does not start with sTypedText", function (assert) {
		// system under test
		var oItem = new Item({
				text: "1value1",
				key: "key1"
			}),
			sTypedValue = "va";

		// assert
		assert.ok(!this.oComboBox._itemsTextStartsWithTypedValue(oItem, sTypedValue), "Items text does not start with sTypedText");
	});

	QUnit.test("_itemsTextStartsWithTypedValue - no item provided should result in false", function (assert) {
		// system under test
		var log = sap.ui.require('sap/base/Log'),
			sTypedValue = "va",
			fnErrorSpy = this.spy(log, "error");

		// assert
		assert.ok(!this.oComboBox._itemsTextStartsWithTypedValue(null, sTypedValue), "Correct 'false' returned");
		assert.strictEqual(fnErrorSpy.callCount, 0, "No error was logged in the console.");
	});

	QUnit.test("_getSelectionRange - should return correct values scenario 1", function (assert) {
		// assert
		assert.strictEqual(this.oFakeControl._getSelectionRange(this.oComboBox).start, 0, "Correct start value returned");
		assert.strictEqual(this.oFakeControl._getSelectionRange(this.oComboBox).end, 0, "Correct end value returned");
	});

	QUnit.test("_getSelectionRange - should return correct values scenario 2", function (assert) {
		// arrange
		this.oFakeFocusDomRef.selectionStart = 2;
		this.oFakeFocusDomRef.selectionEnd = 2;

		// assert
		assert.strictEqual(this.oFakeControl._getSelectionRange(this.oComboBox).start, 2, "Correct value returned");
		assert.strictEqual(this.oFakeControl._getSelectionRange(this.oComboBox).end, 2, "Correct value returned");

		// arrange
		this.oFakeFocusDomRef.selectionStart = 1;
		this.oFakeFocusDomRef.selectionEnd = 5;

		// assert
		assert.strictEqual(this.oFakeControl._getSelectionRange(this.oComboBox).start, 1, "Correct value returned");
		assert.strictEqual(this.oFakeControl._getSelectionRange(this.oComboBox).end, 5, "Correct value returned");
	});

	QUnit.test("_getSelectionRange (IE & Edge) - should return correct values scenario 1", function (assert) {
		this.stub(Device, "browser", {
			msie: true
		});

		// assert
		assert.strictEqual(this.oFakeControl._getSelectionRange(this.oComboBox).start, 0, "Correct value returned");
		assert.strictEqual(this.oFakeControl._getSelectionRange(this.oComboBox).end, 0, "Correct value returned");

	});

	QUnit.test("_getSelectionRange (IE & Edge) - should return correct values scenario 2", function (assert) {
		this.stub(Device, "browser", {
			msie: true
		});
		this.oFakeFocusDomRef.selectionStart = 2;
		this.oFakeFocusDomRef.selectionEnd = 2;

		// assert
		assert.strictEqual(this.oFakeControl._getSelectionRange(this.oComboBox).start, 2, "Correct value returned");
		assert.strictEqual(this.oFakeControl._getSelectionRange(this.oComboBox).end, 2, "Correct value returned");

		// arrange
		this.oFakeFocusDomRef.selectionStart = 1;
		this.oFakeFocusDomRef.selectionEnd = 5;

		// assert
		assert.strictEqual(this.oFakeControl._getSelectionRange(this.oComboBox).start, 1, "Correct value returned");
		assert.strictEqual(this.oFakeControl._getSelectionRange(this.oComboBox).end, 5, "Correct value returned");
	});

	QUnit.test("_getSelectionRange (IE & Edge) - should return correct values scenario 3 (last focused item is header; value = 'some')", function (assert) {
		this.stub(Device, "browser", {
			msie: true
		});
		this.oFakeControl._bIsLastFocusedItemHeader = true;
		this.oFakeControl.getValue = function () {
			return 'some';
		};

		// assert
		assert.strictEqual(this.oFakeControl._getSelectionRange(this.oComboBox).start, 4, "Correct value returned");
		assert.strictEqual(this.oFakeControl._getSelectionRange(this.oComboBox).end, 4, "Correct value returned");
	});

	QUnit.module("Reset selection", {
		beforeEach: function () {
			this.oComboBox = new ComboBox();

			// Mocked control data
			this.oFakeFocusDomRef = {
				selectionStart: 0,
				selectionEnd: 0,
				value: {
					substring: function () {
					}
				}
			};
			this.oFakeControl = {
				getFocusDomRef: function () {
					return this.oFakeFocusDomRef;
				}.bind(this),
				_itemsTextStartsWithTypedValue: function () {
					return true;
				},
				_bIsLastFocusedItemHeader: false,
				getValue: function () {
					return "";
				},
				_getSelectionRange: function () {
					return {
						start: this.getFocusDomRef().selectionStart,
						end: this.getFocusDomRef().selectionEnd
					};
				}
			};
		},
		afterEach: function () {
			this.oComboBox.destroy();
			this.oFakeFocusDomRef = null;
			this.oFakeControl = null;
		}
	});

	QUnit.test("shouldResetSelectionStart - scenario 1: Typed value with selected text and item starting with the typed value.", function (assert) {
		// system under test
		this.oFakeFocusDomRef.selectionStart = 2;
		this.oFakeFocusDomRef.selectionEnd = 6;

		// assert
		assert.ok(!this.oComboBox._shouldResetSelectionStart.call(this.oFakeControl), "Selection should not be reset");
	});

	QUnit.test("shouldResetSelectionStart - scenario 2: Typed value without selected text and item starting with the typed value.", function (assert) {
		// assert
		assert.ok(this.oComboBox._shouldResetSelectionStart.call(this.oFakeControl), "Selection should be reset");
	});

	QUnit.test("shouldResetSelectionStart - scenario 3: Typed value without selected text, matching item and previous item was a group header item.", function (assert) {
		// System under test
		this.oFakeFocusDomRef.selectionStart = 2;
		this.oFakeFocusDomRef.selectionEnd = 2;
		this.oFakeControl._bIsLastFocusedItemHeader = true;

		// assert
		assert.ok(!this.oComboBox._shouldResetSelectionStart.call(this.oFakeControl), "Selection should not be reset");
	});

	QUnit.test("shouldResetSelectionStart - scenario 4: No item that starts with the typed value.", function (assert) {
		// System under test
		this.oFakeControl._itemsTextStartsWithTypedValue = function () {
			return false;
		};

		// assert
		assert.ok(this.oComboBox._shouldResetSelectionStart.call(this.oFakeControl), "Selection should be reset");
	});

	QUnit.module("addItemGroup", {
		beforeEach: function () {
			this.oComboBox = new ComboBox();
		},
		afterEach: function () {
			this.oComboBox.destroy();
		}
	});

	QUnit.test("adds new SeparatorItem to the items aggregation.", function (assert) {
		// system under test
		var oGroup1 = {
				text: "Group header text",
				key: "key"
			},
			oGroup2 = {
				key: "key"
			},
			oSeparatorItem1, oSeparatorItem2;

		// act
		oSeparatorItem1 = this.oComboBox.addItemGroup(oGroup1);
		oSeparatorItem2 = this.oComboBox.addItemGroup(oGroup2);

		// assert
		assert.ok(oSeparatorItem1.isA("sap.ui.core.SeparatorItem"), "The ListItem is of type 'sap.ui.core.SeparatorItem'.");
		assert.strictEqual(oSeparatorItem1.getText(), "Group header text", "The title of the GroupHeaderListItem was set correctly.");

		assert.ok(oSeparatorItem2.isA("sap.ui.core.SeparatorItem"), "The ListItem is of type 'sap.ui.core.SeparatorItem'.");
		assert.strictEqual(oSeparatorItem2.getText(), "key", "The title of the GroupHeaderListItem was set correctly.");

		assert.strictEqual(this.oComboBox.getItems().length, 2, "There are only two items the items aggregation");
		assert.strictEqual(this.oComboBox.getItems()[0], oSeparatorItem1, "First item is correct");
		assert.strictEqual(this.oComboBox.getItems()[1], oSeparatorItem2, "Second item is correct");
	});

	QUnit.module("Group headers and separators", {
		beforeEach: function () {
			// system under test
			this.oComboBox = new ComboBox({
				items: [
					new SeparatorItem({text: "Group1"}),
					new Item({text: "item11", key: "key11"}),
					new Item({text: "item12", key: "key12"}),
					new SeparatorItem({text: "Group2"}),
					new Item({text: "item21", key: "key21"}),
					new Item({text: "item22", key: "key22"})
				]
			});
			this.oComboBox.syncPickerContent();

			// Checkes if the header and the two items which text starts with "item1" are present after filtering
			this.fnCheckFilterWithGrouping = function (assert, aItems) {
				assert.strictEqual(aItems.length, 3, "There should be 3 items after the filtering.");
				assert.strictEqual(aItems[0].getText(), "Group1", "The first item's text is correct.");
				assert.strictEqual(aItems[1].getText(), "item11", "The second item's text is correct.");
				assert.strictEqual(aItems[2].getText(), "item12", "The second item's text is correct.");
			};

			// Checkes if the expected value was filled in and the expected item selected in the combo box
			this.fnCheckSelectedItemAndValue = function (assert, oExpectedItem, sExpectedValue) {
				assert.strictEqual(this.oComboBox.getFocusDomRef().value, sExpectedValue, "The expected text was filled in the combo box.");
				assert.strictEqual(jQuery(this.oComboBox.getFocusDomRef()).getSelectedText(), sExpectedValue, "Correct text was selected in the combo box.");
				assert.ok(this.oComboBox.getSelectedItem() === oExpectedItem, "The expected item was selected.");
			};

			// Checkes if the visual focus was moved from one item to another
			this.fnCheckVisualFocusedMoved = function (assert, oInitiallySelectedListItem, oNextListItem) {
				assert.ok(oNextListItem.hasStyleClass("sapMLIBFocused"), "Visual focus moved to the next list item.");
				assert.ok(!oInitiallySelectedListItem.hasStyleClass("sapMLIBFocused"), "Visual focus removed from the previously selected list item.");
			};

			this.oComboBox.placeAt("content");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			// clean
			this.oComboBox.destroy();
		}
	});

	QUnit.test("Group header's labelledBy", function (assert) {
		var oGroupHeader = this.oComboBox._getList().getItems()[0],
			sInvisibleTextId = this.oComboBox._getGroupHeaderInvisibleText().getId();

		assert.strictEqual(oGroupHeader.getAriaLabelledBy()[0], sInvisibleTextId, "The correct invisible text is associated with the group item.");
	});

	QUnit.test("Group header's labelledBy text", function (assert) {
		var oGroupHeaderListItem, oInvisibleText,
			oFocusDomRef = this.oComboBox.getFocusDomRef(),
			oSeparatorItem = this.oComboBox._getList().getItems()[0],
			oExpectedLabel = sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("LIST_ITEM_GROUP_HEADER") + " " + oSeparatorItem.getTitle();

		// arrange
		this.oComboBox.focus();
		this.clock.tick();

		// act
		sap.ui.test.qunit.triggerKeydown(oFocusDomRef, KeyCodes.F4);
		this.clock.tick(500);

		assert.ok(this.oComboBox.isOpen(), "The combo box's picker is opened.");
		sap.ui.test.qunit.triggerKeydown(oFocusDomRef, KeyCodes.ARROW_UP);

		oGroupHeaderListItem = this.oComboBox._oList.getItems()[0];
		oInvisibleText = sap.ui.getCore().byId(oGroupHeaderListItem.getAriaLabelledBy()[0]);

		// assert
		assert.strictEqual(oInvisibleText.getText(), oExpectedLabel, "The correct invisible text is associated with the group item.");
	});


	QUnit.test("getNonSeparatorSelectableItems should return array with non separator items only.", function (assert) {
		var aItems = this.oComboBox.getNonSeparatorSelectableItems(this.oComboBox.getSelectableItems());
		assert.strictEqual(aItems.length, 4, "Items of type sap.ui.core.Separator items are filtered out.");
	});

	QUnit.test("Group header shown when filtering", function (assert) {
		assert.expect(4);
		var aItems;

		// act
		this.oComboBox.filterItems({
			properties: this.oComboBox._getFilters(),
			value: "item1"
		});

		aItems = this.oComboBox.getVisibleItems();

		// assert
		this.fnCheckFilterWithGrouping(assert, aItems);
	});

	QUnit.test("Visual separator items not part of the filtering", function (assert) {
		assert.expect(5);
		var aItems,
			oItem = new SeparatorItem();

		// act
		this.oComboBox.insertItem(oItem, 1);
		aItems = this.oComboBox.getVisibleItems();

		// assert
		assert.strictEqual(aItems.length, 7, "There should be 7 items initially");

		// act
		this.oComboBox.filterItems({
			properties: this.oComboBox._getFilters(),
			value: "item1"
		});
		aItems = this.oComboBox.getVisibleItems();

		// assert
		// Note: The separator items were not part of the filtering even before
		// and are hidden when the user starts filtering
		this.fnCheckFilterWithGrouping(assert, aItems);
	});

	QUnit.test("onsapdown when picker closed should select first non separator item", function (assert) {
		assert.expect(3);
		var oExpectedItem = this.oComboBox.getItems()[1],
			sExpectedValue = "item11";

		// arrange
		this.oComboBox.focus();
		this.clock.tick(0);

		// act
		sap.ui.test.qunit.triggerKeydown(this.oComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN);

		// assert
		this.fnCheckSelectedItemAndValue(assert, oExpectedItem, sExpectedValue);
	});

	QUnit.test("onsapdown when picker opened should move visual focus to the first selectable item (not to the group header)", function (assert) {
		assert.expect(6);
		var oGroupHeaderItem, aItems, oSelectedItem;

		// arrange
		this.oComboBox.focus();
		this.clock.tick(0);

		// act
		sap.ui.test.qunit.triggerKeydown(this.oComboBox.getFocusDomRef(), KeyCodes.F4);
		this.clock.tick(500);

		assert.ok(this.oComboBox.isOpen(), "The combo box's picker is opened.");

		aItems = this.oComboBox._oList.getItems();
		oGroupHeaderItem = aItems[0];
		oSelectedItem = aItems[1];


		assert.notOk(oGroupHeaderItem.hasStyleClass("sapMLIBFocused"), "Visual focus moved to the group header item.");
		assert.ok(oSelectedItem.hasStyleClass("sapMLIBFocused"), "Visual focus moved to the first item.");

		// assert
		// no selection was made, the value is empty and the group header has the visual focus
		sap.ui.test.qunit.triggerKeydown(this.oComboBox.getFocusDomRef(), KeyCodes.ARROW_UP);
		this.fnCheckSelectedItemAndValue(assert, null, "");
	});

	QUnit.test("onsapdown twice when picker opened should move visual focus to the first item", function (assert) {
		var oExpectedItem = this.oComboBox.getItems()[1],
			sExpectedValue = "item11",
			oExpectedListItem, oGroupHeaderListItem;

		// arrange
		this.oComboBox.focus();
		this.clock.tick(0);

		// act
		sap.ui.test.qunit.triggerKeydown(this.oComboBox.getFocusDomRef(), KeyCodes.F4);
		this.clock.tick(500);

		assert.ok(this.oComboBox.isOpen(), "The combo box's picker is opened.");
		oExpectedListItem = this.oComboBox.getListItem(oExpectedItem);
		oGroupHeaderListItem = this.oComboBox._oList.getItems()[0];


		// assert
		this.fnCheckSelectedItemAndValue(assert, oExpectedItem, sExpectedValue);
		this.fnCheckVisualFocusedMoved(assert, oGroupHeaderListItem, oExpectedListItem);
	});

	QUnit.test("onsapdown when key already selected and picker is opened should move visual focus to the next item", function (assert) {
		assert.expect(8);
		var oExpectedItem = this.oComboBox.getItems()[5],
			oInitiallySelectedItem = this.oComboBox.getItems()[4],
			oExpectedListItem,
			oInitiallySelectedListItem,
			sExpectedValue = "item22";

		// arrange
		this.oComboBox.focus();
		this.oComboBox.setSelectedItem(oInitiallySelectedItem);
		this.clock.tick(0);

		// act
		sap.ui.test.qunit.triggerKeydown(this.oComboBox.getFocusDomRef(), KeyCodes.F4);
		this.clock.tick(500);

		// assert
		assert.ok(this.oComboBox.isOpen(), "The combo box's picker is opened.");
		assert.ok(this.oComboBox.getSelectedItem() === oInitiallySelectedItem, "The expected item was initially selected.");
		assert.ok(this.oComboBox._oList.hasStyleClass("sapMListFocus"), "The visual focus was correctly on the combo box's list initially.");

		// act
		sap.ui.test.qunit.triggerKeydown(this.oComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN);
		oInitiallySelectedListItem = this.oComboBox.getListItem(oInitiallySelectedItem);
		oExpectedListItem = this.oComboBox.getListItem(oExpectedItem);

		// assert
		this.fnCheckSelectedItemAndValue(assert, oExpectedItem, sExpectedValue);
		this.fnCheckVisualFocusedMoved(assert, oInitiallySelectedListItem, oExpectedListItem);
	});

	QUnit.test("onsapup when key already selected and picker is opened should move visual focus to the previous item", function (assert) {
		assert.expect(8);
		var oExpectedItem = this.oComboBox.getItems()[4],
			oInitiallySelectedItem = this.oComboBox.getItems()[5],
			oExpectedListItem,
			oInitiallySelectedListItem,
			sExpectedValue = "item21";

		// arrange
		this.oComboBox.focus();
		this.oComboBox.setSelectedItem(oInitiallySelectedItem);
		this.clock.tick(0);	// tick the clock ahead 0ms millisecond to make sure the async call to .selectText() on the focusin event handler does not override the type ahead

		// act
		sap.ui.test.qunit.triggerKeydown(this.oComboBox.getFocusDomRef(), KeyCodes.F4);
		this.clock.tick(500);

		// assert
		assert.ok(this.oComboBox.isOpen(), "The combo box's picker is opened.");
		assert.ok(this.oComboBox.getSelectedItem() === oInitiallySelectedItem, "The expected item was initially selected.");
		assert.ok(this.oComboBox._oList.hasStyleClass("sapMListFocus"), "The visual focus was correctly on the combo box's list initially.");

		// act
		sap.ui.test.qunit.triggerKeydown(this.oComboBox.getFocusDomRef(), KeyCodes.ARROW_UP);
		oExpectedListItem = this.oComboBox.getListItem(oExpectedItem);
		oInitiallySelectedListItem = this.oComboBox.getListItem(oInitiallySelectedItem);

		// assert
		this.fnCheckSelectedItemAndValue(assert, oExpectedItem, sExpectedValue);
		this.fnCheckVisualFocusedMoved(assert, oInitiallySelectedListItem, oExpectedListItem);
	});

	QUnit.test("onsapup when key already selected and picker is closed should move visual focus to the previous item and skip group items", function (assert) {
		assert.expect(6);
		var oExpectedItem = this.oComboBox.getItems()[2],
			oInitiallySelectedItem = this.oComboBox.getItems()[4],
			oExpectedListItem,
			oInitiallySelectedListItem,
			sExpectedValue = "item12";

		// arrange
		this.oComboBox.focus();
		this.oComboBox.setSelectedItem(oInitiallySelectedItem);
		this.clock.tick(0);

		// assert
		assert.ok(this.oComboBox.getSelectedItem() === oInitiallySelectedItem, "The expected item was initially selected.");

		// act
		sap.ui.test.qunit.triggerKeydown(this.oComboBox.getFocusDomRef(), KeyCodes.ARROW_UP);
		oExpectedListItem = this.oComboBox.getListItem(oExpectedItem);
		oInitiallySelectedListItem = this.oComboBox.getListItem(oInitiallySelectedItem);

		// assert
		this.fnCheckSelectedItemAndValue(assert, oExpectedItem, sExpectedValue);
		this.fnCheckVisualFocusedMoved(assert, oInitiallySelectedListItem, oExpectedListItem);
	});

	QUnit.test("when focusing group header item with some input in the text field the input should stay", function (assert) {
		var oExpectedItem = this.oComboBox.getItems()[0],
			oExpectedListItem = this.oComboBox.getListItem(oExpectedItem),
			oFakeEvent = {
				target: {
					value: "it"
				},
				srcControl: this.oComboBox,
				setMarked: function () {
				},
				isMarked: function () {
				}
			};

		// arrange
		this.oComboBox.focus();
		this.oComboBox.oninput(oFakeEvent);
		this.clock.tick(0);

		// act
		sap.ui.test.qunit.triggerKeydown(this.oComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN);

		// assert
		assert.strictEqual(this.oComboBox.getFocusDomRef().value, "it", "The expected text was filled in the combo box.");
		assert.strictEqual(jQuery(this.oComboBox.getFocusDomRef()).getSelectedText(), "", "Correct text was selected in the combo box.");
		assert.ok(this.oComboBox.getSelectedItem() === null, "The expected item was selected.");
		assert.ok(oExpectedListItem.hasStyleClass("sapMLIBFocused"), "The group header has visual focus");
	});

	QUnit.test("when moving through group header, the user input should stay and be autocompleted", function (assert) {
		var oExpectedItem = this.oComboBox.getItems()[1],
			oExpectedListItem,
			oFakeEvent = {
				target: {
					value: "it"
				},
				srcControl: this.oComboBox,
				setMarked: function () {
				},
				isMarked: function () {
				}
			};

		// arrange
		this.oComboBox.focus();
		this.oComboBox.open();
		this.clock.tick(500);

		oExpectedListItem = this.oComboBox.getListItem(oExpectedItem);

		this.oComboBox.oninput(oFakeEvent);
		this.clock.tick(0);

		// act
		sap.ui.test.qunit.triggerKeydown(this.oComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN);
		sap.ui.test.qunit.triggerKeydown(this.oComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN);

		// assert
		assert.strictEqual(this.oComboBox.getFocusDomRef().value, "item11", "The expected text was filled in the combo box.");
		assert.strictEqual(jQuery(this.oComboBox.getFocusDomRef()).getSelectedText(), "em11", "Correct text was selected in the combo box.");
		assert.ok(this.oComboBox.getSelectedItem() === oExpectedItem, "The expected item was selected.");
		assert.ok(oExpectedListItem.hasStyleClass("sapMLIBFocused"), "The item has visual focus");
	});

	QUnit.test("No double focus when last item before close was group header", function (assert) {
		var oExpectedItem = this.oComboBox.getItems()[1],
			oExpectedSeparatorItem = this.oComboBox.getItems()[0],
			oFocusDomRef = this.oComboBox.getFocusDomRef(),
			oExpectedListItem, oExpectedListGroupHeader;

		// arrange
		this.oComboBox.focus();

		// act
		// Open it
		sap.ui.test.qunit.triggerKeydown(oFocusDomRef, KeyCodes.F4);
		this.clock.tick(500);
		// Select group header
		sap.ui.test.qunit.triggerKeydown(oFocusDomRef, KeyCodes.ARROW_UP);
		// Close it again
		sap.ui.test.qunit.triggerKeydown(oFocusDomRef, KeyCodes.F4);
		this.clock.tick(500);

		oExpectedListItem = this.oComboBox.getListItem(oExpectedItem);
		oExpectedListGroupHeader = this.oComboBox.getListItem(oExpectedSeparatorItem);

		// assert
		assert.strictEqual(jQuery(oFocusDomRef).getSelectedText(), "item11", "Correct text was selected in the combo box.");
		assert.ok(this.oComboBox.getSelectedItem() === oExpectedItem, "The expected item was selected.");

		// act
		// When the last item was header and we reopen it, there should not be double focus
		sap.ui.test.qunit.triggerKeydown(oFocusDomRef, KeyCodes.F4);
		this.clock.tick(500);

		// assert
		assert.ok(oExpectedListItem.hasStyleClass("sapMLIBFocused"), "The item has visual focus");
		assert.ok(!oExpectedListGroupHeader.hasStyleClass("sapMLIBFocused"), "The group header does not have visual focus");
	});

	QUnit.test("Grouping with models", function (assert) {
		// Setup
		var oData = {
				data: [
					{key: 1, text: "Test 1", group: "Group 1"},
					{key: 2, text: "Test 2", group: "Group 1"},
					{key: 3, text: "Test 3", group: "Group 2"},
					{key: 4, text: "Test 4", group: "Group 3"}
				]
			},
			oComboBox = new ComboBox({
				items: {
					path: '/data',
					sorter: new Sorter({
						path: 'group',
						descending: false,
						group: function (oContext) {
							return oContext.getProperty('group');
						}
					}),
					template: new Item({key: "{key}", text: "{text}"})
				}
			}).setModel(new JSONModel(oData)).placeAt("content");
		sap.ui.getCore().applyChanges();

		// Assert
		assert.ok(oComboBox.getItems().length > 4, "There should be more items as there's a separator item for each group");
		assert.ok(oComboBox.getItems()[0].isA("sap.ui.core.SeparatorItem"), "The first item is a SeparatorItem");

		// Cleanup
		oComboBox.destroy();
	});

	QUnit.module("Group header press");

	QUnit.test("group header item press should not close the popover", function (assert) {
		assert.expect(4);
		// System under test
		var oComboBox = new ComboBox({
			items: [
				new SeparatorItem({text: "Group1"}),
				new Item({text: "item11", key: "key11"})
			]
		});

		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		// arrange
		oComboBox.focus();
		oComboBox.open();
		this.clock.tick(500);

		// act
		sap.ui.test.qunit.triggerEvent("tap", oComboBox._oList.getItems()[0].getDomRef());
		this.clock.tick(500);

		// assert
		assert.ok(oComboBox.isOpen(), "The combo box's picker is opened.");
		assert.strictEqual(oComboBox.getFocusDomRef().value, "", "The expected text was filled in the combo box.");
		assert.strictEqual(jQuery(oComboBox.getFocusDomRef()).getSelectedText(), "", "Correct text was selected in the combo box.");
		assert.ok(oComboBox.getSelectedItem() === null, "Nothing was selected.");

		// clean up
		oComboBox.destroy();
	});

	QUnit.test("group header item press should not close the dialog on mobile", function (assert) {
		assert.expect(4);
		// System under test
		this.stub(Device, "system", {
			desktop: false,
			phone: true,
			tablet: false
		});
		var oComboBox = new ComboBox({
			items: [
				new SeparatorItem({text: "Group1"}),
				new Item({text: "item11", key: "key11"})
			]
		});

		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		// arrange
		oComboBox.focus();
		oComboBox.open();
		this.clock.tick(500);

		// act
		sap.ui.test.qunit.triggerEvent("tap", oComboBox._oList.getItems()[0].getDomRef());
		this.clock.tick(500);

		// assert
		assert.ok(oComboBox.isOpen(), "The combo box's picker is opened.");
		assert.strictEqual(oComboBox.getFocusDomRef().value, "", "The expected text was filled in the combo box.");
		assert.strictEqual(jQuery(oComboBox.getFocusDomRef()).getSelectedText(), "", "Correct text was selected in the combo box.");
		assert.ok(oComboBox.getSelectedItem() === null, "Nothing was selected.");

		oComboBox.destroy();
	});

	QUnit.module("Separator item no text");

	QUnit.test("should be have styleClass 'SeparatorItemNoText'.", function (assert) {
		// System under test
		var oComboBox = new ComboBox({
			items: [
				new Item({text: "item1", key: "key1"}),
				new SeparatorItem(),
				new Item({text: "item2", key: "key2"})
			]
		});
		oComboBox.syncPickerContent();
		var oItem = oComboBox.getItems()[1],
			oListItem = oComboBox.getListItem(oItem);

		oComboBox.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(oListItem.hasStyleClass("sapMComboBoxBaseSeparatorItemNoText"), "The separator item has the correct style class 'SeparatorItemNoText'.");

		// clean up
		oComboBox.destroy();
	});

	QUnit.module("showItems functionality", {
		beforeEach: function () {
			var aData = [
					{
						name: "A Item 1", key: "a-item-1", group: "A"
					}, {
						name: "A Item 2", key: "a-item-2", group: "A"
					}, {
						name: "B Item 1", key: "a-item-1", group: "B"
					}, {
						name: "B Item 2", key: "a-item-2", group: "B"
					}, {
						name: "Other Item", key: "ab-item-1", group: "A B"
					}
				],
				oModel = new JSONModel(aData);

			this.oCombobox = new ComboBox({
				items: {
					path: "/",
					template: new Item({text: "{name}", key: "{key}"})
				}
			}).setModel(oModel).placeAt("content");

			sap.ui.getCore().applyChanges();

		},
		afterEach: function () {
			this.oCombobox.destroy();
			this.oCombobox = null;
		}
	});

	QUnit.test("Should filter internal list properly", function (assert) {
		// Setup
		var oEvent = {
				target: {value: "A Item"},
				srcControl: this.oCombobox,
				isMarked: function () {
				},
				setMarked:  function () {
				}
			},
			fnFilterVisibleItems = function (aItems) {
				return aItems.filter(function (oItem) {
					return oItem.getVisible();
				});
			};

		// Act
		this.oCombobox.oninput(oEvent);
		this.oCombobox.invalidate();
		this.clock.tick(500);
		sap.ui.getCore().applyChanges();

		// Assert
		assert.strictEqual(this.oCombobox._getList().getItems().length, 5, "There should be 5 items in the list...");
		assert.strictEqual(fnFilterVisibleItems(this.oCombobox._getList().getItems()).length, 2, "... but 2 should be visible");

		// Act
		oEvent.target.value = "";
		this.oCombobox.oninput(oEvent);
		this.oCombobox.invalidate();
		this.clock.tick(500);
		sap.ui.getCore().applyChanges();

		// Assert
		assert.strictEqual(fnFilterVisibleItems(this.oCombobox._getList().getItems()).length, 5, "All items should be visible");
	});

	QUnit.test("Should restore default filtering function", function (assert) {
		// Setup
		var fnFilter = this.oCombobox.fnFilter;

		// Act
		this.oCombobox.showItems(function () {
			return true;
		});

		// Assert
		assert.strictEqual(this.oCombobox.fnFilter, fnFilter, "Default function has been restored");

		// Act
		fnFilter = function (sValue, oItem) {
			return oItem.getText() === "A Item 1";
		};
		this.oCombobox.setFilterFunction(fnFilter);
		this.oCombobox.showItems(function () {
			return false;
		});

		// Assert
		assert.strictEqual(this.oCombobox.fnFilter, fnFilter, "Custom filter function has been restored");
	});

	QUnit.test("Should show all the items", function (assert) {
		// Setup
		var fnGetVisisbleItems = function (aItems) {
			return aItems.filter(function (oItem) {
				return oItem.getVisible();
			});
		};

		// Act
		this.oCombobox.showItems();
		sap.ui.getCore().applyChanges();

		// Assert
		assert.strictEqual(this.oCombobox._oList.getItems().length, 5, "All the items are available");
		assert.strictEqual(fnGetVisisbleItems(this.oCombobox._oList.getItems()).length, 5, "Shows all items");
	});

	QUnit.test("Should filter the items", function (assert) {
		// Setup
		var fnGetVisisbleItems = function (aItems) {
			return aItems.filter(function (oItem) {
				return oItem.getVisible();
			});
		};

		// Act
		this.oCombobox.showItems(function (sValue, oItem) {
			return oItem.getText() === "A Item 1";
		});
		sap.ui.getCore().applyChanges();

		// Assert
		assert.strictEqual(this.oCombobox._oList.getItems().length, 5, "All the items are available");
		assert.strictEqual(fnGetVisisbleItems(this.oCombobox._oList.getItems()).length, 1, "Only the matching items are visible");
	});

	QUnit.test("Destroy & reinit on mobile", function (assert) {
		// Setup
		this.stub(Device, "system", {
			desktop: false,
			phone: true,
			tablet: false
		});

		// arrange
		var oComboBox = new ComboBox("test-combobox").placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Act
		oComboBox.destroy();
		oComboBox = new ComboBox("test-combobox").placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(true, "If there's no exception so far, everything is ok");

		// Cleanup
		oComboBox.destroy();
	});

	QUnit.test("Should call toggleIconPressedState correctly in the process of showing items", function (assert) {
		// Setup
		var oSpy = new sinon.spy(this.oCombobox, "toggleIconPressedStyle");

		// Act
		this.oCombobox.showItems(function () {
			return true;
		});

		// Assert
		assert.strictEqual(oSpy.callCount, 0, "The toggleIconPressedStyle method was not called.");

		// Act
		this.oCombobox._handlePopupOpenAndItemsLoad(true); // Icon press

		// Assert
		assert.strictEqual(oSpy.callCount, 1, "The toggleIconPressedStyle method was called once:");
		assert.strictEqual(oSpy.getCall(0).args[0], true, "...first time with 'true'.");

		// Arrange
		this.oCombobox._bShouldClosePicker = true;
		this.oCombobox._bItemsShownWithFilter = false;

		// Act
		this.oCombobox._handlePopupOpenAndItemsLoad(); // Icon press

		// Assert
		assert.strictEqual(oSpy.callCount, 2, "The toggleIconPressedStyle method was called twice:");
		assert.strictEqual(oSpy.getCall(1).args[0], false, "...second time with 'false'.");

		// Clean
		oSpy.restore();
	});

	QUnit.test("Should call toggleIconPressedState after showItems is called and oninput is triggered.", function (assert) {
		// Setup
		var oSpy = new sinon.spy(this.oCombobox, "toggleIconPressedStyle"),
			oFakeEvent = {
				isMarked: function () {return false;},
				setMarked: function () {},
				target: {
					value: "A Item"
				},
				srcControl: this.oCombobox
			};

		// Act
		this.oCombobox.showItems(function () {
			return true;
		});

		// Assert
		assert.strictEqual(oSpy.callCount, 0, "The toggleIconPressedStyle method was not called.");

		// Act
		this.oCombobox.oninput(oFakeEvent); // Fake input

		// Assert
		assert.strictEqual(oSpy.callCount, 1, "The toggleIconPressedStyle method was called once:");
		assert.strictEqual(oSpy.getCall(0).args[0], true, "...first time with 'true'.");

		// Clean
		oSpy.restore();
	});

	QUnit.test("Should show all items when drop down arrow is pressed after showing filtered list.", function (assert) {
		// Setup
		var fnGetVisisbleItems = function (aItems) {
			return aItems.filter(function (oItem) {
				return oItem.getVisible();
			});
		};

		// Act
		this.oCombobox.showItems(function (sValue, oItem) {
			return oItem.getText() === "A Item 1";
		});
		sap.ui.getCore().applyChanges();

		// Assert
		assert.strictEqual(this.oCombobox._oList.getItems().length, 5, "All the items are available");
		assert.strictEqual(fnGetVisisbleItems(this.oCombobox._oList.getItems()).length, 1, "Only the matching items are visible");

		// Act
		this.oCombobox._handlePopupOpenAndItemsLoad(true); // Icon press
		sap.ui.getCore().applyChanges();

		assert.strictEqual(this.oCombobox._oList.getItems().length, 5, "All the items are available");
		assert.strictEqual(fnGetVisisbleItems(this.oCombobox._oList.getItems()).length, 5, "All items are visible");
	});

	QUnit.module("List configuration");

	QUnit.test("List css classes", function (assert) {
		// setup
		var oComboBox = new ComboBox().placeAt("content");
		sap.ui.getCore().applyChanges();

		oComboBox.open();
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(oComboBox._getList().hasStyleClass(oComboBox.getRenderer().CSS_CLASS_COMBOBOXBASE + "List"),
			'The combobox list has the CSS class "' + oComboBox.getRenderer().CSS_CLASS_COMBOBOXBASE + "List");

		assert.ok(oComboBox._getList().hasStyleClass(oComboBox.getRenderer().CSS_CLASS_COMBOBOX + "List"),
			'The combobox list has the CSS class "' + oComboBox.getRenderer().CSS_CLASS_COMBOBOX + "List");

		// clean up
		oComboBox.destroy();
	});
});