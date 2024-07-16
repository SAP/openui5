/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/core/Lib",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/core/CustomData",
	"sap/m/ComboBox",
	"sap/m/ComboBoxTextField",
	"sap/m/Label",
	"sap/m/Select",
	"sap/m/Link",
	"sap/m/FormattedText",
	"sap/ui/core/Item",
	"sap/ui/core/ListItem",
	"sap/ui/core/SeparatorItem",
	"sap/ui/model/Sorter",
	"sap/ui/layout/form/SimpleForm",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/base/Event",
	"sap/base/Log",
	"sap/ui/events/KeyCodes",
	"sap/ui/core/util/MockServer",
	"sap/ui/dom/containsOrEquals",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/inputUtils/inputsDefaultFilter",
	"sap/m/inputUtils/ListHelpers",
	"sap/m/inputUtils/itemsVisibilityHandler",
	"sap/ui/Device",
	"sap/m/InputBase",
	'sap/ui/core/ValueStateSupport',
	"sap/ui/core/library",
	"sap/ui/thirdparty/jquery",
	"sap/ui/qunit/utils/nextUIUpdate",
	// provides jQuery.fn.getSelectedText
	"sap/ui/dom/jquery/getSelectedText",
	// provides jQuery.fn.cursorPos
	"sap/ui/dom/jquery/cursorPos"
], function(
	Element,
	Library,
	qutils,
	CustomData,
	ComboBox,
	ComboBoxTextField,
	Label,
	Select,
	Link,
	FormattedText,
	Item,
	ListItem,
	SeparatorItem,
	Sorter,
	SimpleForm,
	JSONModel,
	ODataModel,
	Event,
	Log,
	KeyCodes,
	MockServer,
	containsOrEquals,
	createAndAppendDiv,
	inputsDefaultFilter,
	ListHelpers,
	itemsVisibilityHandler,
	Device,
	InputBase,
	ValueStateSupport,
	coreLibrary,
	jQuery,
	nextUIUpdate
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

	const fnUpdateMockServerResponseTime = (oMockServer, iMiliseconds) => {
		oMockServer._oServer.autoRespondAfter = iMiliseconds;
	};

	const fnRunAllTimersAndRestore = (oClock) => {
		if (!oClock) {
			return;
		}
		oClock.runAll();
		oClock.restore();
	};

	QUnit.test("default values", async function (assert) {

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
		await nextUIUpdate();

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
		assert.strictEqual(oComboBox.getShowClearIcon(), false, 'By default the "showClearIcon" property of the ComboBox control is "false"');

		// cleanup
		oComboBox.destroy();
	});

	QUnit.module("setValue()");

	// BCP 0020751295 0000447582 2016
	QUnit.test("it should update the value after a new binding context is set", async function (assert) {

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
		oComboBox.setModel(oModel);
		oComboBox.setBindingContext(oModel.getContext("/rebum"));
		oComboBox.placeAt("content");
		await nextUIUpdate();

		// assert
		assert.strictEqual(oComboBox.getValue(), "ipsum");

		// act
		oComboBox.setBindingContext(oModel.getContext("/sanctus"));
		await nextUIUpdate();

		// assert
		assert.strictEqual(oComboBox.getValue(), "dolor");

		// cleanup
		oComboBox.destroy();
		oModel.destroy();
	});

	QUnit.test("setting the value should update the effectiveShowClearIcon property", async function (assert) {
		// system under test
		var oComboBox = new ComboBox();

		// arrange
		oComboBox.placeAt("content");
		await nextUIUpdate();

		// act
		oComboBox.setValue("test");

		// assert
		assert.strictEqual(oComboBox.getProperty("effectiveShowClearIcon"), true, "The property effectiveShowClearIcon was updated correctly to true.");

		// act
		oComboBox.setValue("");

		// assert
		assert.strictEqual(oComboBox.getProperty("effectiveShowClearIcon"), false, "The property effectiveShowClearIcon was updated correctly to false.");

		// cleanup
		oComboBox.destroy();
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

	QUnit.test("getSelectedItem()", async function (assert) {

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
		await nextUIUpdate();

		// assert
		assert.ok(oComboBox.getSelectedItem() === oExpectedItem);
		assert.strictEqual(oComboBox.getSelectedItemId(), "item-id");
		assert.strictEqual(oComboBox.getSelectedKey(), "2");
		assert.strictEqual(oComboBox.getValue(), "item 2");
		assert.strictEqual(oComboBox.getProperty("value"), "item 2");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("getSelectedItem()", async function (assert) {

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
		await nextUIUpdate();

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

	QUnit.test("getSelectedItem()", async function (assert) {

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
		await nextUIUpdate();

		// assert
		assert.ok(oComboBox.getSelectedItem() === null);
		assert.strictEqual(oComboBox.getSelectedItemId(), "");
		assert.strictEqual(oComboBox.getSelectedKey(), "");
		assert.strictEqual(oComboBox.getValue(), "");
		assert.strictEqual(oComboBox.getProperty("value"), "");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("getSelectedItem()", async function (assert) {

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
		await nextUIUpdate();

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

	QUnit.test("getSelectedItemId()", async function (assert) {

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
		await nextUIUpdate();

		// assert
		assert.ok(oComboBox.getSelectedItem() === null);
		assert.strictEqual(oComboBox.getSelectedItemId(), "");
		assert.strictEqual(oComboBox.getSelectedKey(), "");
		assert.strictEqual(oComboBox.getValue(), "");
		assert.strictEqual(oComboBox.getProperty("value"), "");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("getSelectedItemId()", async function (assert) {

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
		await nextUIUpdate();

		// assert
		assert.ok(oComboBox.getSelectedItem() === null);
		assert.strictEqual(oComboBox.getSelectedItemId(), "");
		assert.strictEqual(oComboBox.getSelectedKey(), "");
		assert.strictEqual(oComboBox.getValue(), "");
		assert.strictEqual(oComboBox.getProperty("value"), "");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("getSelectedItemId()", async function (assert) {

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
		await nextUIUpdate();

		// assert
		assert.ok(oComboBox.getSelectedItem() === null);
		assert.strictEqual(oComboBox.getSelectedItemId(), "");
		assert.strictEqual(oComboBox.getSelectedKey(), "");
		assert.strictEqual(oComboBox.getValue(), "");
		assert.strictEqual(oComboBox.getProperty("value"), "");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("getSelectedItemId()", async function (assert) {

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
		await nextUIUpdate();

		// assert
		assert.ok(oComboBox.getSelectedItem() === oExpectedItem);
		assert.strictEqual(oComboBox.getSelectedItemId(), "item-id");
		assert.strictEqual(oComboBox.getSelectedKey(), "2");
		assert.strictEqual(oComboBox.getValue(), "item 2");
		assert.strictEqual(oComboBox.getProperty("value"), "item 2");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("getSelectedItemId()", async function (assert) {

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
		await nextUIUpdate();

		// assert
		assert.ok(oComboBox.getSelectedItem() === oExpectedItem);
		assert.strictEqual(oComboBox.getSelectedItemId(), "item-id");
		assert.strictEqual(oComboBox.getSelectedKey(), "3");
		assert.strictEqual(oComboBox.getValue(), "item 3");
		assert.strictEqual(oComboBox.getProperty("value"), "item 3");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("getSelectedItemId()",async function (assert) {

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
		await nextUIUpdate();

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

	QUnit.test("getSelectedItemId()", async function (assert) {

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
		await nextUIUpdate();

		// assert
		assert.ok(oComboBox.getSelectedItem() === null);
		assert.strictEqual(oComboBox.getSelectedItemId(), "");
		assert.strictEqual(oComboBox.getSelectedKey(), "");
		assert.strictEqual(oComboBox.getValue(), "");
		assert.strictEqual(oComboBox.getProperty("value"), "");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("getSelectedItemId()", async function (assert) {

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
		await nextUIUpdate();

		// assert
		assert.ok(oComboBox.getSelectedItem() === null);
		assert.strictEqual(oComboBox.getSelectedItemId(), "");
		assert.strictEqual(oComboBox.getSelectedKey(), "");
		assert.strictEqual(oComboBox.getValue(), "");
		assert.strictEqual(oComboBox.getProperty("value"), "");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("getSelectedItemId()", async function (assert) {

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
		await nextUIUpdate();

		// assert
		assert.ok(oComboBox.getSelectedItem() === null);
		assert.strictEqual(oComboBox.getSelectedItemId(), "");
		assert.strictEqual(oComboBox.getSelectedKey(), "");
		assert.strictEqual(oComboBox.getValue(), "");
		assert.strictEqual(oComboBox.getProperty("value"), "");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("getSelectedItemId()", async function (assert) {

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
		await nextUIUpdate();

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

	QUnit.test("getSelectedKey()", async function (assert) {

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
		await nextUIUpdate();

		// assert
		assert.ok(oComboBox.getSelectedItem() === null);
		assert.strictEqual(oComboBox.getSelectedItemId(), "");
		assert.strictEqual(oComboBox.getSelectedKey(), "");
		assert.strictEqual(oComboBox.getValue(), "");
		assert.strictEqual(oComboBox.getProperty("value"), "");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("getSelectedKey()",async function (assert) {

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
		await nextUIUpdate();

		// assert
		assert.ok(oComboBox.getSelectedItem() === null);
		assert.strictEqual(oComboBox.getSelectedItemId(), "");
		assert.strictEqual(oComboBox.getSelectedKey(), "");
		assert.strictEqual(oComboBox.getValue(), "");
		assert.strictEqual(oComboBox.getProperty("value"), "");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("getSelectedKey()", async function (assert) {

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
		await nextUIUpdate();

		// assert
		assert.ok(oComboBox.getSelectedItem() === oExpectedItem);
		assert.strictEqual(oComboBox.getSelectedItemId(), "item-id");
		assert.strictEqual(oComboBox.getSelectedKey(), "2");
		assert.strictEqual(oComboBox.getValue(), "item 2");
		assert.strictEqual(oComboBox.getProperty("value"), "item 2");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("getSelectedKey()", async function (assert) {

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
		await nextUIUpdate();

		// assert
		assert.ok(oComboBox.getSelectedItem() === oExpectedItem);
		assert.strictEqual(oComboBox.getSelectedItemId(), "item-id");
		assert.strictEqual(oComboBox.getSelectedKey(), "3");
		assert.strictEqual(oComboBox.getValue(), "item 3");
		assert.strictEqual(oComboBox.getProperty("value"), "item 3");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("getSelectedKey()", async function (assert) {

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
		await nextUIUpdate();

		// assert
		assert.ok(oComboBox.getSelectedItem() === oExpectedItem);
		assert.strictEqual(oComboBox.getSelectedItemId(), "item-id");
		assert.strictEqual(oComboBox.getSelectedKey(), "1");
		assert.strictEqual(oComboBox.getValue(), "item 1");
		assert.strictEqual(oComboBox.getProperty("value"), "item 1");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("getSelectedKey()", async function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			items: []
		});

		// arrange
		oComboBox.placeAt("content");
		await nextUIUpdate();

		// assert
		assert.ok(oComboBox.getSelectedItem() === null);
		assert.strictEqual(oComboBox.getSelectedItemId(), "");
		assert.strictEqual(oComboBox.getSelectedKey(), "");
		assert.strictEqual(oComboBox.getValue(), "");
		assert.strictEqual(oComboBox.getProperty("value"), "");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("getSelectedKey()", async function (assert) {

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
		await nextUIUpdate();

		// assert
		assert.ok(oComboBox.getSelectedItem() === null);
		assert.strictEqual(oComboBox.getSelectedItemId(), "");
		assert.strictEqual(oComboBox.getSelectedKey(), "");
		assert.strictEqual(oComboBox.getValue(), "");
		assert.strictEqual(oComboBox.getProperty("value"), "");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("getSelectedKey()", async function (assert) {

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
		await nextUIUpdate();

		// assert
		assert.ok(oComboBox.getSelectedItem() === null);
		assert.strictEqual(oComboBox.getSelectedItemId(), "");
		assert.strictEqual(oComboBox.getSelectedKey(), "");
		assert.strictEqual(oComboBox.getValue(), "");
		assert.strictEqual(oComboBox.getProperty("value"), "");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("getSelectedKey()", async function (assert) {

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
		await nextUIUpdate();

		// assert
		assert.ok(oComboBox.getSelectedItem() === null);
		assert.strictEqual(oComboBox.getSelectedItemId(), "");
		assert.strictEqual(oComboBox.getSelectedKey(), "");
		assert.strictEqual(oComboBox.getValue(), "");
		assert.strictEqual(oComboBox.getProperty("value"), "");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("getSelectedKey()", async function (assert) {

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
		await nextUIUpdate();

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
	QUnit.test("it should synchronize property changes of items to the combo box control", async function (assert) {

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

		oComboBox.placeAt("content");
		await nextUIUpdate();

		// act
		oItem.setKey("GER");
		oItem.setText("Germany");
		await nextUIUpdate();

		// assert
		assert.strictEqual(oComboBox.getSelectedKey(), "GER");
		assert.strictEqual(oComboBox.getSelectedItem().getText(), "Germany");
		assert.strictEqual(oComboBox.getValue(), "Germany");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.module("Cancel selection");

	QUnit.test("it should cancel the selection after closing the dialog with close button", async function (assert) {
		this.clock = sinon.useFakeTimers();
		this.stub(Device, "system").value({
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
		await nextUIUpdate(this.clock);

		oComboBox.setSelectedItem(oItem1);
		this.clock.tick(500);

		//act
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
		fnRunAllTimersAndRestore(this.clock);
	});

	QUnit.module("addItem");

	QUnit.test("addItem()", async function (assert) {

		// system under test
		var oComboBox = new ComboBox();

		oComboBox.placeAt("content");
		await nextUIUpdate();

		// arrange
		var fnAddItemSpy = this.spy(oComboBox, "addItem");
		var oItem = new Item({
			key: "0",
			text: "item 0"
		});

		// act
		oComboBox.addItem(oItem);
		await nextUIUpdate();

		// assert
		assert.ok(oComboBox.getFirstItem() === oItem);
		assert.ok(fnAddItemSpy.returned(oComboBox));
		assert.ok(oItem.hasListeners("_change"));

		// cleanup
		oComboBox.destroy();
	});

	// unit test for CSN 0120031469 0000547938 2014
	QUnit.test("addItem()", async function (assert) {

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
		await nextUIUpdate();

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

	QUnit.test("insertItem()", async function (assert) {

		// system under test
		var oComboBox = new ComboBox();

		oComboBox.placeAt("content");
		await nextUIUpdate();

		// arrange
		var fnInsertItem = this.spy(oComboBox, "insertItem");
		var oItem = new Item({
			key: "0",
			text: "item 0"
		});

		// act
		oComboBox.insertItem(oItem, 0);
		await nextUIUpdate();

		// assert
		assert.ok(oComboBox.getFirstItem() === oItem);
		assert.ok(fnInsertItem.returned(oComboBox), 'oComboBox.insertAggregation() method return the "this" reference');
		assert.ok(oItem.hasListeners("_change"));

		// act
		oComboBox.syncPickerContent();

		// assert
		assert.strictEqual(oComboBox._getList().getItems().length, 1, "List should have 1 item");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.module("cursorPos()");

	QUnit.test("Check the position of the cursor after an item is pressed", async function (assert) {
		this.clock = sinon.useFakeTimers();
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
		await nextUIUpdate(this.clock);
		oComboBox.focus();
		oComboBox.open();
		this.clock.tick(1000);

		// act
		qutils.triggerEvent("tap", oComboBox._getList().getItems()[0].getDomRef());
		this.clock.tick(1000);

		// assert
		assert.strictEqual(jQuery(oComboBox.getFocusDomRef()).cursorPos(), 7, "The text cursor is at the endmost position");

		// cleanup
		oComboBox.destroy();
		fnRunAllTimersAndRestore(this.clock);
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

	QUnit.test("setSelectedItem()", async function (assert) {

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
		await nextUIUpdate();

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

	QUnit.test("setSelectedItem()", async function (assert) {

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
		await nextUIUpdate();

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

	QUnit.test("setSelectedItem() set the selected item when the picker popup is open", async function (assert) {
		this.clock = sinon.useFakeTimers();
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
		await nextUIUpdate(this.clock);

		oComboBox.syncPickerContent();
		oComboBox.open();
		this.clock.tick(1000);

		// act
		oComboBox.setSelectedItem(null);
		await nextUIUpdate(this.clock);

		// assert
		assert.ok(oComboBox.getSelectedItem() === null);
		assert.strictEqual(oComboBox.getSelectedItemId(), "");
		assert.strictEqual(oComboBox.getSelectedKey(), "");
		assert.strictEqual(oComboBox.getValue(), "");
		assert.strictEqual(oComboBox.getProperty("value"), "");
		assert.strictEqual(jQuery(oComboBox.getFocusDomRef()).attr("aria-activedescendant"), undefined, 'The "aria-activedescendant" attribute is set when the active descendant is rendered and visible');

		// cleanup
		oComboBox.destroy();
		fnRunAllTimersAndRestore(this.clock);
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

	QUnit.test("setSelectedItemId()", async function (assert) {

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
		await nextUIUpdate();

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

	QUnit.test("setSelectedItemId()", async function (assert) {

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
		await nextUIUpdate();

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

	QUnit.test("setSelectedItemId() set the selected item when the ComboBox's picker pop-up is open", async function (assert) {
		this.clock = sinon.useFakeTimers();
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
		await nextUIUpdate(this.clock);

		oComboBox.syncPickerContent();
		oComboBox.open();
		this.clock.tick(500);

		// act
		oComboBox.setSelectedItemId("");
		await nextUIUpdate(this.clock);

		// assert
		assert.ok(oComboBox.getSelectedItem() === null);
		assert.strictEqual(oComboBox.getSelectedItemId(), "");
		assert.strictEqual(oComboBox.getSelectedKey(), "");
		assert.strictEqual(oComboBox.getValue(), "");
		assert.strictEqual(oComboBox.getProperty("value"), "");
		assert.strictEqual(jQuery(oComboBox.getFocusDomRef()).attr("aria-activedescendant"), undefined, 'The "aria-activedescendant" attribute is set when the active descendant is rendered and visible');

		// cleanup
		oComboBox.destroy();
		fnRunAllTimersAndRestore(this.clock);
	});

	QUnit.test("setSelectedItemId() should set the value even if the corresponding item doesn't exist", async function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			selectedItemId: "item-id"
		});

		// arrange
		oComboBox.placeAt("content");
		await nextUIUpdate();

		// assertions
		assert.ok(oComboBox.getSelectedItem() === null);
		assert.strictEqual(oComboBox.getSelectedItemId(), "item-id");
		assert.strictEqual(oComboBox.getSelectedKey(), "");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.module("setSelectedKey()");

	QUnit.test("setSelectedKey() first rendering", async function (assert) {

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
		await nextUIUpdate();

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

	QUnit.test("setSelectedKey() after the initial rendering", async function (assert) {

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
		await nextUIUpdate();

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

	QUnit.test("setSelectedKey()", async function (assert) {

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
		await nextUIUpdate();

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

	QUnit.test("setSelectedKey() set the selected item when the picker popup is open test case 1", async function (assert) {
		this.clock = sinon.useFakeTimers();
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
		await nextUIUpdate(this.clock);

		oComboBox.syncPickerContent();
		oComboBox.open();
		this.clock.tick(500);

		// act
		oComboBox.setSelectedKey("");
		await nextUIUpdate(this.clock);

		// assert
		assert.ok(oComboBox.getSelectedItem() === null);
		assert.strictEqual(oComboBox.getSelectedItemId(), "");
		assert.strictEqual(oComboBox.getSelectedKey(), "");
		assert.strictEqual(oComboBox.getValue(), "");
		assert.strictEqual(oComboBox.getProperty("value"), "");
		assert.strictEqual(jQuery(oComboBox.getFocusDomRef()).attr("aria-activedescendant"), undefined, 'The "aria-activedescendant" attribute is set when the active descendant is rendered and visible');

		// cleanup
		oComboBox.destroy();
		fnRunAllTimersAndRestore(this.clock);
	});

	QUnit.test("aria-activedescendant should not be set if item is not focused on open - e.g if the arrow icon is clicked", async function (assert) {
		this.clock = sinon.useFakeTimers();
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
		this.stub(oComboBox, "getSelectedItem").callsFake(function() { return false; });

		// arrange
		oComboBox.placeAt("content");
		await nextUIUpdate(this.clock);

		oComboBox.open();
		this.clock.tick();

		// assert
		assert.notOk(jQuery(oComboBox.getFocusDomRef()).attr("aria-activedescendant"), 'The "aria-activedescendant" attribute is not set when the active descendant list item is not focused');

		// cleanup
		oComboBox.destroy();
		fnRunAllTimersAndRestore(this.clock);
	});

	QUnit.test("aria-activedescendant attribute should not be set if an item is selected but the picker is not opened", async function (assert) {
		this.clock = sinon.useFakeTimers();
		var oComboBox = new ComboBox({
			items: [
				new Item("focusedItem", {
					key: "GER",
					text: "Germany"
				})
			]
		});

		// Arrange
		oComboBox.placeAt("content");
		await nextUIUpdate(this.clock);

		// Act
		oComboBox.focus();
		this.clock.tick();
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN);
		await nextUIUpdate(this.clock);

		this.clock.tick(300);

		// Assert
		assert.notOk(jQuery(oComboBox.getFocusDomRef()).attr("aria-activedescendant"), 'The "aria-activedescendant" attribute is notif an item is selected but te picker is not opened');

		// Cleanup
		oComboBox.destroy();
		fnRunAllTimersAndRestore(this.clock);
	});

	QUnit.test("aria-activedescendant attribute should be set if an item is selected snd then the picker is opened", async function (assert) {
		var oExpectedItem;
		var oComboBox = new ComboBox({
			items: [
				new Item("firstItem", {
					key: "GER",
					text: "Germany"
				}),
				oExpectedItem = new Item("secondItem", {
					key: "BG",
					text: "Bulgaria"
				}),
				new Item("thirdItem", {
					key: "GR",
					text: "Greece"
				})
			]
		});

		// Arrange
		oComboBox.placeAt("content");
		await nextUIUpdate();

		// Act
		oComboBox.focus();
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN);
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN);
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.F4);
		await nextUIUpdate();

		var sExpectedActiveDescendantId = ListHelpers.getListItem(oExpectedItem).getId();

		// Assert
		assert.ok(oComboBox.getProperty("_open"), "The open property should be updated.");
		assert.strictEqual(jQuery(oComboBox.getFocusDomRef()).attr("aria-activedescendant"), sExpectedActiveDescendantId, 'The "aria-activedescendant" attribute is set when the active descendant is rendered and visible');

		// Cleanup
		oComboBox.destroy();
	});


	QUnit.test("setSelectedKey() on unbindObject call", async function (assert) {
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
		await nextUIUpdate();

		oComboBox.unbindObject();
		assert.strictEqual(oComboBox.getModel().oData.context[0].value, "1", "unbindObject doesn't overwrite model");

		oComboBox.destroy();
	});

	QUnit.test("setSelectedKey() on unbindObject call when value is not bound", async function (assert) {
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
		await nextUIUpdate();

		assert.strictEqual(oComboBox.getValue(), "1", "the value is set properly");
		oComboBox.unbindObject();

		assert.strictEqual(oComboBox.getValue(), "", "the value is set properly after unbindObject is called");
		assert.strictEqual(oComboBox.getModel().oData.items[0].value, "1", "unbindObject doesn't overwrite model");

		oComboBox.destroy();
	});

	QUnit.module("setMaxWidth()");

	QUnit.test("setMaxWidth()", async function (assert) {

		// system under test
		var oComboBox = new ComboBox();

		// arrange
		oComboBox.placeAt("content");
		await nextUIUpdate();

		// assert
		assert.strictEqual(oComboBox.getDomRef().style.maxWidth, "100%");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("setMaxWidth()", async function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			maxWidth: "50%"
		});

		// arrange
		oComboBox.placeAt("content");
		await nextUIUpdate();

		// assert
		assert.strictEqual(oComboBox.getDomRef().style.maxWidth, "50%");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("setMaxWidth()", async function (assert) {

		// system under test
		var oComboBox = new ComboBox();

		// arrange
		oComboBox.placeAt("content");
		await nextUIUpdate();

		// act
		oComboBox.setMaxWidth("40%");
		await nextUIUpdate();

		// assert
		assert.strictEqual(oComboBox.getDomRef().style.maxWidth, "40%");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.module("removeItem()");

	QUnit.test("removeItem() it should remove the selected item and change the selection (test case 1)", async function (assert) {

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
		oComboBox.setModel(oModel);
		oComboBox.placeAt("content");

		var oSelectedItem = oComboBox.getItemByKey("8");
		await nextUIUpdate();

		var oEvent = new jQuery.Event("input", {
			target: oComboBox.getFocusDomRef(),
			srcControl: oComboBox
		});

		oComboBox.oninput(oEvent);

		var fnDestroyItems = this.spy(oComboBox._getList(), "destroyItems");

		// act
		oComboBox.removeItem(8);
		await nextUIUpdate();

		// assert
		assert.strictEqual(fnDestroyItems.callCount, 1, "sap.m.List.prototype.destroyItems() method was called");
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

	QUnit.test("removeItem() it should remove the selected item and change the selection (test case 2)", async function (assert) {

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
		oComboBox.setModel(oModel);

		oComboBox.placeAt("content");
		await nextUIUpdate();

		// act
		oComboBox.removeItem(0);
		await nextUIUpdate();

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

	QUnit.test("removeItem() it should remove the selected item and change the selection (test case 3)", async function (assert) {

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
		await nextUIUpdate();

		// act
		oComboBox.removeItem(0);
		await nextUIUpdate();

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

	QUnit.test("removeAllItems()", async function (assert) {

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
		await nextUIUpdate();
		var fnRemoveAllItemsSpy = this.spy(oComboBox, "removeAllItems");
		// var fnListRemoveAllItemsSpy = this.spy(oComboBox._getList(), "removeAllItems");

		// act
		var oRemovedItems = oComboBox.removeAllItems();
		await nextUIUpdate();

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

	QUnit.test("destroyItems()", async function (assert) {
		this.clock = sinon.useFakeTimers();
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
		await nextUIUpdate(this.clock);
		oComboBox.syncPickerContent();
		oComboBox.open();
		this.clock.tick(1000); // wait 1s after the open animation is completed
		var fnDestroyItemsSpy = this.spy(oComboBox, "destroyItems");

		// act
		oComboBox.destroyItems();
		await nextUIUpdate(this.clock);

		// assert
		assert.ok(fnDestroyItemsSpy.returned(oComboBox), "sap.m.ComboBox.prototype.destroyItems() method returns the ComboBox instance");

		for (var i = 0; i < aItems.length; i++) {
			assert.strictEqual(aItems[i].hasListeners("_change"), false);
		}

		assert.strictEqual(oComboBox._getList().getItems().length, 0);

		// cleanup
		oComboBox.destroy();
		fnRunAllTimersAndRestore(this.clock);
	});

	QUnit.module("open()", {
		beforeEach: function () {
			this.clock = sinon.useFakeTimers();
		},
		afterEach: function () {
			fnRunAllTimersAndRestore(this.clock);
		}
	});

	QUnit.test("open()", async function (assert) {
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
		await nextUIUpdate(this.clock);
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

		assert.ok(oComboBox.hasStyleClass(InputBase.ICON_PRESSED_CSS_CLASS), "The correct CSS class was added to the control.");

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

	QUnit.test("open() check whether the active state persist after re-rendering", async function (assert) {
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
		await nextUIUpdate(this.clock);

		oComboBox.syncPickerContent();
		oComboBox.open();
		this.clock.tick(500);

		// act
		oComboBox.invalidate();
		await nextUIUpdate(this.clock);

		// assert
		assert.ok(oComboBox.hasStyleClass(InputBase.ICON_PRESSED_CSS_CLASS), "The correct CSS class was added to the control.");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("open() the picker popup (dropdown list) should automatically size itself to fit its content", async function (assert) {

		this.stub(Device, "system").value({
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
		await nextUIUpdate(this.clock);

		// act
		oComboBox.syncPickerContent();
		oComboBox.open();
		this.clock.tick(500);

		// assert
		assert.ok(oComboBox.getPicker().getDomRef().offsetWidth > 100);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("it should propagate the entered value to the picker text field", async function (assert) {

		this.stub(Device, "system").value({
			desktop: false,
			phone: true,
			tablet: false
		});

		// system under test
		var oComboBox = new ComboBox();

		// arrange
		oComboBox.placeAt("content");
		await nextUIUpdate(this.clock);
		oComboBox.focus();
		var sExpectedValue = "lorem ipsum";
		var oTarget = oComboBox.getFocusDomRef();
		var oPicker = oComboBox.syncPickerContent();

		// act
		oTarget.value = sExpectedValue;
		qutils.triggerEvent("input", oTarget);
		oComboBox.open();
		this.clock.tick(1000); // tick the clock ahead 1 second, after the open animation is completed

		// assert
		assert.strictEqual(oComboBox.getPickerTextField().getValue(), sExpectedValue);
		assert.strictEqual(oPicker.getShowHeader(), true, "it should show the picker header");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("it should show the label text as picker header title", async function (assert) {

		this.stub(Device, "system").value({
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
		await nextUIUpdate(this.clock);
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

	QUnit.test("it should update the header title if the label reference is destroyed", async function (assert) {

		this.stub(Device, "system").value({
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
		await nextUIUpdate(this.clock);

		oComboBox.focus();
		oComboBox.open();
		this.clock.tick(1000); // tick the clock ahead 1 second, after the open animation is completed
		oComboBox.close();
		oLabel.destroy();
		this.clock.tick(1000); // tick the clock ahead 1 second, after the close animation is completed

		// act
		oComboBox.open();
		this.clock.tick(1000); // tick the clock ahead 1 second, after the open animation is completed

		// assert
		assert.strictEqual(oPicker.getShowHeader(), true);
		assert.strictEqual(oComboBox.getPickerTitle().getText(), "Select");

		// cleanup
		oComboBox.destroy();
		oLabel.destroy();
	});

	QUnit.test("it should close the picker when the ENTER key is pressed", async function (assert) {
		// system under test
		this.stub(Device, "system").value({
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
		await nextUIUpdate(this.clock);

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
		qutils.triggerKeydown(oPickerTextFieldDomRef, KeyCodes.I);
		qutils.triggerEvent("input", oPickerTextFieldDomRef);
		this.clock.tick(300);
		qutils.triggerKeydown(oPickerTextFieldDomRef, KeyCodes.ENTER);

		this.clock.tick(300);

		// assert
		assert.strictEqual(fnChangeSpy.callCount, 1, "The change event was fired");
		assert.strictEqual(oComboBox.getSelectedItem().getText(), "Item 0", "The correct item is selected");
		assert.notOk(oComboBox.isOpen(), "The picker is closed");

		// cleanup
		oComboBox.destroy();
		fnChangeSpy.restore();
	});

	QUnit.test("Trigger close only once onItemPress", async function (assert) {
		this.stub(Device, "system").value({
			desktop: false,
			phone: false,
			tablet: true
		});

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
		}),
			 oCloseSpy = this.spy(oComboBox, "close");
		// arrange
		oComboBox.placeAt("content");
		await nextUIUpdate(this.clock);
		// act
		oComboBox.open();
		this.clock.tick(1000);

		oComboBox._getList().getItems()[1].$().trigger("tap");
		await nextUIUpdate(this.clock);
		this.clock.tick(1000);

		// Assert
		assert.strictEqual(oCloseSpy.calledOnce, true, "The close() method has been called once");

		// Cleanup
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

	QUnit.test("getItemAt()", async function (assert) {

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
		await nextUIUpdate();

		// act
		var oItem1 = oComboBox.getItemAt(2);
		var oItem2 = oComboBox.getItemAt(6);

		// assert
		assert.strictEqual(oItem1, oExpectedItem, "Second item is as expected");
		assert.strictEqual(oItem2, null, "Sixth item does not exist");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.module("getFirstItem()");

	QUnit.test("getFirstItem()", async function (assert) {

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
		await nextUIUpdate();

		// act
		var oItem = oComboBox.getFirstItem();

		// assert
		assert.strictEqual(oItem, oExpectedItem, "Fisrt item is as expected");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("getFirstItem() for ComboBox with 0 items", async function (assert) {

		// system under test
		var oComboBox = new ComboBox();

		// arrange
		oComboBox.placeAt("content");
		await nextUIUpdate();

		// act
		var oItem = oComboBox.getFirstItem();

		// assert
		assert.strictEqual(oItem, null, "First item should not exist");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.module("getLastItem()");

	QUnit.test("getLastItem()", async function (assert) {

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
		await nextUIUpdate();

		// act
		var oItem = oComboBox.getLastItem();

		// assert
		assert.strictEqual(oItem, oExpectedItem, "Last item is as expected");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("getLastItem()", async function (assert) {

		// system under test
		var oComboBox = new ComboBox();

		// arrange
		oComboBox.placeAt("content");
		await nextUIUpdate();

		// act
		var oItem = oComboBox.getLastItem();

		// assert
		assert.ok(oItem === null);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.module("getItemByKey()");

	QUnit.test("getItemByKey()", async function (assert) {

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
		await nextUIUpdate();

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
		assert.ok(ListHelpers.getEnabledItems(oComboBox.getItems())[0] === oExpectedItem);

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
		this.stub(Device, "system").value({
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

	QUnit.test("setValue()", async function (assert) {

		// system under test
		var oComboBox = new ComboBox();

		// arrange
		oComboBox.placeAt("content");
		await nextUIUpdate();
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

	QUnit.test("value state and value state message", async function (assert) {
		this.clock = sinon.useFakeTimers();
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
		await nextUIUpdate(this.clock);

		// act
		oErrorComboBox.focus();
		this.clock.tick(500);

		assert.ok(document.getElementById("errorcombobox-message"), "error message popup is open when focusin");

		qutils.triggerKeydown(oErrorComboBox.getFocusDomRef(), KeyCodes.F4);
		this.clock.tick(500);
		assert.ok(!document.getElementById("errorcombobox-message"), "error message popup is not open when list is open");

		oErrorComboBox.getFocusDomRef().blur();
		this.clock.tick(500);
		assert.ok(!document.getElementById("errorcombobox-message"), "no error message popup is closed when focus is out");

		// cleanup
		oErrorComboBox.destroy();
		fnRunAllTimersAndRestore(this.clock);
	});

	QUnit.test("valueState Message popup should be opened on tap", async function(assert) {
		this.clock = sinon.useFakeTimers();
		var oComboBox = new ComboBox("vsm-combo", {
			valueState: ValueState.Information
		});

		oComboBox.placeAt("content");
		await nextUIUpdate(this.clock);

		oComboBox.ontap();
		this.clock.tick(300);

		assert.ok(document.getElementById(oComboBox.getValueStateMessageId()), "ValueState Message is shown on tap");

		oComboBox.destroy();
		fnRunAllTimersAndRestore(this.clock);
	});

	QUnit.test("valueStateText forwarding", async function (assert) {
		this.stub(Device, "system").value({
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
		await nextUIUpdate();

		assert.strictEqual(oComboBox._oSuggestionPopover._getValueStateHeader().getText(), sText,
			"The text is forwarded correctly.");

		// Act
		oComboBox.setValueStateText("");
		oComboBox.setValueState("Error");
		oComboBox.open();
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oComboBox._oSuggestionPopover._getValueStateHeader().getText(), ValueStateSupport.getAdditionalText(oComboBox),
			"The text is set correctly when the state is Error and not specific valueStateText is set.");

		// Act
		oComboBox.setValueStateText(sValueStateText);
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oComboBox._oSuggestionPopover._getValueStateHeader().getText(), sValueStateText, "The text is set correctly when is set from the user.");

		// cleanup
		oComboBox.destroy();
	});


	// BCP 1570763824
	QUnit.test("it should add the corresponding CSS classes", async function (assert) {

		// system under test
		var oComboBox = new ComboBox();

		// arrange
		oComboBox.placeAt("content");
		await nextUIUpdate();

		// act
		oComboBox.setValueState(ValueState.Error);
		await nextUIUpdate();

		// assert
		assert.ok(oComboBox.$("content").hasClass("sapMInputBaseContentWrapperState"));
		assert.ok(oComboBox.$("content").hasClass("sapMInputBaseContentWrapperError"));

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("it should render the picker value state message", async function (assert) {

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
		await nextUIUpdate();


		// Assert
		assert.ok(oErrorComboBox._oSuggestionPopover.getPopover().hasStyleClass(CSS_CLASS_SUGGESTIONS_POPOVER + "ValueState"), "Header has value state class");
		assert.ok(oErrorComboBox._oSuggestionPopover.getPopover().hasStyleClass(CSS_CLASS_SUGGESTIONS_POPOVER + "ErrorState"), "Header has error value state class");

		// Cleanup
		oErrorComboBox.destroy();
	});

	QUnit.test("it should set custom text for valueState", async function (assert) {

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
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oErrorComboBox._getSuggestionsPopover().getPopover().getCustomHeader().getText(), "custom", "text should be custom");

		// Cleanup
		oErrorComboBox.destroy();
	});


	QUnit.module("destroy()");

	QUnit.test("destroy()", async function (assert) {

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
		await nextUIUpdate();

		// act
		oComboBox.destroy();
		await nextUIUpdate();

		// assert
		assert.strictEqual(oComboBox.getItems().length, 0);
		assert.ok(oComboBox.getDomRef() === null);
		assert.ok(oComboBox.getPicker() === null);
		assert.ok(oComboBox._getList() === null);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("calling destroy() when the picker popup is open", async function (assert) {
		this.clock = sinon.useFakeTimers();
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
		await nextUIUpdate(this.clock);

		oComboBox.syncPickerContent();
		oComboBox.open();
		this.clock.tick(1000);

		// act
		oComboBox.destroy();
		await nextUIUpdate(this.clock);

		// assert
		assert.strictEqual(oComboBox.getItems().length, 0);
		assert.ok(oComboBox.getDomRef() === null);
		assert.ok(oComboBox.getPicker() === null);
		assert.ok(oComboBox._getList() === null);
		assert.ok(oComboBox.getAggregation("picker") === null);

		fnRunAllTimersAndRestore(this.clock);
	});

	QUnit.module("addAggregation() + getAggregation()");

	QUnit.test("addAggregation() + getAggregation()", async function (assert) {

		// system under test
		var oComboBox = new ComboBox();
		var oItem = new Item({
			key: "GER",
			text: "Germany"
		});

		// arrange
		oComboBox.placeAt("content");
		await nextUIUpdate();
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

	QUnit.test("addAggregation()", async function (assert) {

		// system under test
		var oComboBox = new ComboBox();
		var oItem = new Item({
			key: "GER",
			text: "Germany"
		});

		// arrange
		oComboBox.placeAt("content");
		await nextUIUpdate();
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
	QUnit.test("updateAggregation() do not clear the selection when items are destroyed", async function (assert) {

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
		await nextUIUpdate();

		// act
		oComboBox.updateAggregation("items");

		// assert
		assert.strictEqual(oComboBox.getSelectedKey(), "CU");

		// cleanup
		oComboBox.destroy();
		oModel.destroy();
		await nextUIUpdate();
	});

	// BCP 1570460580
	QUnit.test("it should not override the selection when binding context is changed", async function (assert) {

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
		oComboBox.setModel(oModel);
		oComboBox.setBindingContext(oModel.getContext("/1"));
		oComboBox.placeAt("content");
		await nextUIUpdate();

		// act
		oComboBox.setBindingContext(oModel.getContext("/0"));
		await nextUIUpdate();

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

	QUnit.test("findAggregatedObjects()", async function (assert) {
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
		await nextUIUpdate();
		oComboBox.open();
		var fnFindAggregatedObjectsSpy = this.spy(oComboBox, "findAggregatedObjects");

		// act
		oComboBox.findAggregatedObjects();
		var oItem = fnFindAggregatedObjectsSpy.returnValues.pop();

		// assert
		assert.strictEqual(oItem[1], oComboBox._getList().getItems()[0], "findAggregatedObjects's should return list with an item.");

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
	QUnit.test("it should set the display of the combobox arrow button to none", async function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			editable: false
		});

		// arrange
		oComboBox.placeAt("content");
		await nextUIUpdate();

		// assert
		assert.strictEqual(getComputedStyle(oComboBox.getDomRef("arrow")).getPropertyValue("opacity"), "0");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.module("disabled");

	// BSP 1670516606
	QUnit.test("it should show the default mouse pointer when disabled", async function (assert) {

		// system under test
		var oComboBox = new ComboBoxTextField({
			enabled: false
		});

		// arrange
		oComboBox.placeAt("content");
		await nextUIUpdate();

		// assert
		assert.strictEqual(getComputedStyle(oComboBox.getDomRef("arrow")).getPropertyValue("cursor"), "default");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.module("loadItems");

	QUnit.test("it should fire the loadItems event", async function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			items: [],

			// enable lazy loading
			loadItems: function () {

			}
		});

		// arrange
		oComboBox.placeAt("content");
		await nextUIUpdate();
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

	QUnit.test("it should not fire the loadItems event", async function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			items: []
		});

		// arrange
		oComboBox.placeAt("content");
		await nextUIUpdate();
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

	QUnit.test("rendering", async function (assert) {

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
		var sAutoCapitalization = Device.browser.firefox ? "none" : "off";

		// arrange
		oComboBox1.placeAt("content");
		oComboBox2.placeAt("content");
		oComboBox3.placeAt("content");
		oComboBox4.placeAt("content");
		oComboBox5.placeAt("content");
		oComboBox6.placeAt("content");
		oComboBox7.placeAt("content");
		oComboBox8.placeAt("content");
		await nextUIUpdate();

		// assert
		aComboBox.forEach(function (oComboBox) {

			if (!oComboBox.getVisible()) {
				return;
			}

			assert.ok(oComboBox.getDomRef(), "The combobox element exists");
			assert.strictEqual(oComboBox.getFocusDomRef().getAttribute("autocomplete"), "off");
			assert.strictEqual(oComboBox.getFocusDomRef().getAttribute("autocorrect"), "off");
			assert.strictEqual(oComboBox.getFocusDomRef().getAttribute("autocapitalize"), sAutoCapitalization);
			assert.strictEqual(oComboBox.getFocusDomRef().getAttribute("aria-expanded"), "false");
			assert.strictEqual(oComboBox.getFocusDomRef().getAttribute("aria-autocomplete"), "both");
			assert.strictEqual(jQuery(oComboBox.getFocusDomRef()).attr("aria-required"), undefined);
			assert.ok(oComboBox.$().hasClass(oComboBox.getRenderer().CSS_CLASS_COMBOBOXBASE), 'The combo box element has the CSS class "' + oComboBox.getRenderer().CSS_CLASS_COMBOBOXBASE + '"');
			assert.ok(oComboBox.getAggregation("_endIcon").length, "The HTML span element for the arrow exists");
			assert.ok(oComboBox.getArrowIcon().getDomRef().classList.contains("sapUiIcon"), 'The arrow button has the CSS class sapUiIcon"');
			assert.ok(oComboBox.getArrowIcon().hasStyleClass("sapMInputBaseIcon"), 'The arrow button has the CSS class sapMInputBaseIcon "');
			assert.strictEqual(oComboBox.getArrowIcon().getNoTabStop(), true, "The arrow button is focusable, but it is not reachable via sequential keyboard navigation");
			assert.strictEqual(oComboBox.getArrowIcon().getDomRef().getAttribute("aria-label"), Library.getResourceBundleFor("sap.m").getText("COMBOBOX_BUTTON"));

			// cleanup
			oComboBox.destroy();
		});
	});

	QUnit.test("The sap.m library resource bundle is loaded", function (assert) {
		var oCoreSpy = this.spy(Library, "getResourceBundleFor" );
		var oComboBox = new ComboBox();

		assert.strictEqual(oCoreSpy.called, true, "getResourceBundleFor");
		assert.strictEqual(oCoreSpy.firstCall.args[0], "sap.m", "sap.m Resource bundle loaded.");

		oCoreSpy.restore();
		oComboBox.destroy();
	});

	QUnit.test("the arrow button should not be visible", async function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			showButton: false
		});

		// arrange
		oComboBox.placeAt("content");
		await nextUIUpdate();

		// assert
		assert.strictEqual(oComboBox.getArrowIcon().getVisible(), false, "Icons visibility is false");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("tap control is not editable", async function (assert) {

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
		await nextUIUpdate();

		qutils.triggerTouchEvent("touchstart", oComboBox.getOpenArea(), {
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

		qutils.triggerTouchEvent("touchend", oComboBox.getOpenArea(), {
			targetTouches: {
				0: {
					pageX: 10,
					length: 1
				},

				length: 1
			}
		});

		qutils.triggerTouchEvent("tap", oComboBox.getOpenArea(), {
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

	QUnit.test("it should update update the value of the input field when the selected item is pressed", async function (assert) {
		this.clock = sinon.useFakeTimers();
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
		await nextUIUpdate(this.clock);

		oComboBox.focus();
		oComboBox.open();
		this.clock.tick(1000); // wait 1s after the open animation is completed
		var oItemDomRef = oItem.getDomRef();
		oComboBox.getFocusDomRef().value = "foo";

		// act
		qutils.triggerTouchEvent("tap", oComboBox._getList().getSelectedItem().getDomRef(), {
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
		fnRunAllTimersAndRestore(this.clock);
	});

	QUnit.test("list items title property should be updated after binding", async function (assert) {

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
		await nextUIUpdate();

		// assert
		assert.strictEqual(oComboBox._getList().getItems()[0].getTitle(), "", "List item title is not updated");

		// act
		var oModel = new JSONModel();
		oModel.setData({
			item1: "Item 1"
		});

		oComboBox.setModel(oModel);
		oComboBox.syncPickerContent(); // Simulate before open of the popover
		await nextUIUpdate();

		// assert
		assert.strictEqual(oComboBox._getList().getItems()[0].getTitle(), "Item 1", "List item title is updated");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("Clear icon is rendered.", async function (assert) {
		var oComboBox = new ComboBox({
			showClearIcon: true
		});
		var aEndIcons;
		var sClearIconAltText = Library.getResourceBundleFor("sap.m").getText("INPUT_CLEAR_ICON_ALT");

		// Arrange
		oComboBox.placeAt("content");
		await nextUIUpdate();

		aEndIcons = oComboBox.getAggregation("_endIcon");

		// Assert
		assert.strictEqual(aEndIcons.length, 2, "There are two end icons.");
		assert.strictEqual(aEndIcons[0].getAlt(), sClearIconAltText, "The first icon is the clear icon.");
		assert.ok(aEndIcons[0].hasStyleClass("sapMComboBoxBaseClearIcon"), "The correct CSS class was added to the clear icon.");
		assert.strictEqual(aEndIcons[0].getVisible(), false, "The clear icon is not visible");
		assert.strictEqual(aEndIcons[1].getVisible(), true, "The arrow icon is visible");

		oComboBox.destroy();
	});

	QUnit.module("onsapshow", {
		beforeEach: function () {
			this.clock = sinon.useFakeTimers();
		},
		afterEach: function () {
			fnRunAllTimersAndRestore(this.clock);
		}
	});

	QUnit.test("onsapshow F4 - open the picker pop-up", async function (assert) {
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
		await nextUIUpdate(this.clock);

		oComboBox.focus();
		var fnShowSpy = this.spy(oComboBox, "onsapshow");

		// assert
		assert.notOk(oComboBox.getProperty("_open"), "The open property should be updated.");

		// act
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.F4);

		// assert
		assert.strictEqual(fnShowSpy.callCount, 1, "onsapshow() method was called exactly once");

		this.clock.tick(1000);

		// assert
		assert.ok(oComboBox.getProperty("_open"), "The open property should be updated.");
		assert.strictEqual(oComboBox.getPicker().oPopup.getOpenState(), OpenState.OPEN, "Control's picker pop-up is open");
		assert.ok(oComboBox.isOpen(), "Control picker pop-up is open");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onsapshow F4 - open the picker pop-up and remove the focus from the input", async function (assert) {
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

		var oComboBox2 = new ComboBox({
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
		oComboBox2.placeAt("content");
		await nextUIUpdate(this.clock);
		oComboBox.focus();

		// act
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.F4);
		this.clock.tick(300);
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN);
		this.clock.tick(300);
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ENTER);
		this.clock.tick(300);

		oComboBox2.focus();
		await nextUIUpdate(this.clock);

		// assert
		assert.notOk(oComboBox.getDomRef().classList.contains("sapMFocus"), "The input field should not have visual focus.");

		// cleanup
		oComboBox.destroy();
		oComboBox2.destroy();
	});

	QUnit.test("onsapshow F4 - when F4 or Alt + DOWN keys are pressed and the control's field is not editable, the picker pop-up should not open", async function (assert) {
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
		await nextUIUpdate(this.clock);
		oComboBox.focus();

		// act
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.F4);
		this.clock.tick(1000);

		// assert
		assert.strictEqual(oComboBox.getPicker().oPopup.getOpenState(), OpenState.CLOSED, "Control's picker pop-up is closed");
		assert.strictEqual(oComboBox.isOpen(), false, "Control picker pop-up is closed");
		assert.strictEqual(oComboBox.getValue(), "", "There is no selected value when the field is not editable");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onsapshow Alt + DOWN - open the picker pop-up", async function (assert) {
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
					text: "item 1"
				})
			]
		});

		// arrange
		oComboBox.placeAt("content");
		await nextUIUpdate(this.clock);
		oComboBox.focus();
		var fnShowSpy = this.spy(oComboBox, "onsapshow");

		// act
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN, false, true);
		await nextUIUpdate(this.clock);

		// arrange
		var sExpectedActiveDescendantId = ListHelpers.getListItem(oExpectedItem).getId();

		// assert
		assert.strictEqual(jQuery(oComboBox.getFocusDomRef()).attr("aria-activedescendant"), sExpectedActiveDescendantId, 'The "aria-activedescendant" attribute is set when the active descendant is rendered and visible');
		assert.strictEqual(fnShowSpy.callCount, 1, "onsapshow() method was called exactly once");

		this.clock.tick(1000);
		assert.strictEqual(oComboBox.getPicker().oPopup.getOpenState(), OpenState.OPEN, "Control picker pop-up is open");
		assert.ok(oComboBox.isOpen(), "ComboBox is open");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onsapshow F4 - when F4 or Alt + DOWN keys are pressed and the control's field is not editable, the picker pop-up should not open", async function (assert) {
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
		await nextUIUpdate(this.clock);
		oComboBox.focus();

		// act
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN, false, true);
		this.clock.tick(1000);

		// assert
		assert.strictEqual(oComboBox.getPicker().oPopup.getOpenState(), OpenState.CLOSED, "Control's picker pop-up is closed");
		assert.strictEqual(oComboBox.isOpen(), false, "Control picker pop-up is closed");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onsapshow F4 - close control's picker pop-up", async function (assert) {
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
		await nextUIUpdate(this.clock);
		oComboBox.focus();
		var fnShowSpy = this.spy(oComboBox, "onsapshow");

		// act

		// open the dropdown list picker
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.F4);

		// close the dropdown list picker
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.F4);
		this.clock.tick(1000);

		// assert
		assert.strictEqual(fnShowSpy.callCount, 2, "onsapshow() method was called twice");
		assert.strictEqual(oComboBox.getPicker().oPopup.getOpenState(), OpenState.CLOSED, "Control's picker pop-up is close");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onsapshow Alt + DOWN or F4 - clear the filter", async function (assert) {
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
		await nextUIUpdate(this.clock);

		oComboBox.focus();
		oComboBox.open();
		this.clock.tick(1000);

		oComboBox.getFocusDomRef().value = "A";
		qutils.triggerEvent("input", oComboBox.getFocusDomRef());

		// act
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.F4);	// close the picker pop-up
		this.clock.tick(1000); // wait 1s after the close animation is completed

		// assert
		assert.strictEqual(ListHelpers.getVisibleItems(oComboBox.getItems()).length, 4, "The filter is cleared");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onsapshow Alt + DOWN - close control's picker pop-up", async function (assert) {

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
		await nextUIUpdate(this.clock);
		oComboBox.focus();
		var fnShowSpy = this.spy(oComboBox, "onsapshow");

		// act

		// open the dropdown list picker
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN, false, true);

		// close the dropdown list picker
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN, false, true);
		this.clock.tick(1000);

		// assert
		assert.strictEqual(fnShowSpy.callCount, 2, "onsapshow() method was called twice");
		assert.strictEqual(oComboBox.getPicker().oPopup.getOpenState(), OpenState.CLOSED, "Control's picker pop-up is close");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("it should open the dropdown list and preselect first item if there is such", async function (assert) {
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
		await nextUIUpdate(this.clock);

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

	QUnit.module("onsaphide", {
		beforeEach: function () {
			this.clock = sinon.useFakeTimers();
		},
		afterEach: function () {
			fnRunAllTimersAndRestore(this.clock);
		}
	});

	QUnit.test("onsaphide Alt + UP - open control's picker pop-up", async function (assert) {

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
		await nextUIUpdate(this.clock);
		oComboBox.focus();
		var fnHideSpy = this.spy(oComboBox, "onsaphide");

		// act
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ARROW_UP, false, true, false);

		// assert
		assert.strictEqual(fnHideSpy.callCount, 1, "onsaphide() method was called exactly once");

		this.clock.tick(1000);
		assert.strictEqual(oComboBox.getPicker().oPopup.getOpenState(), OpenState.OPEN, "Control's picker pop-up is open");
		assert.ok(oComboBox.isOpen(), "Control's picker pop-up is open");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onsaphide Alt + UP - keys are pressed and the control's field is not editable, the picker pop-up should not open", async function (assert) {

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
		await nextUIUpdate(this.clock);
		oComboBox.focus();

		// act
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ARROW_UP, false, true, false);
		this.clock.tick(1000);

		// assert
		assert.strictEqual(oComboBox.getPicker().oPopup.getOpenState(), OpenState.CLOSED, "Control's picker pop-up is closed");
		assert.strictEqual(oComboBox.isOpen(), false, "Control picker pop-up is closed");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onsaphide Alt + UP - close control's picker pop-up", async function (assert) {

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
		await nextUIUpdate(this.clock);
		oComboBox.focus();
		var fnHideSpy = this.spy(oComboBox, "onsaphide");

		// act
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ARROW_UP, false, true, false);
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ARROW_UP, false, true, false);
		this.clock.tick(1000);

		// assert
		assert.strictEqual(fnHideSpy.callCount, 2, "onsaphide() method was called twice");
		assert.strictEqual(oComboBox.getPicker().oPopup.getOpenState(), OpenState.CLOSED, "Control's picker pop-up is close");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.module("onsapescape", {
		beforeEach: function () {
			this.clock = sinon.useFakeTimers();
		},
		afterEach: function () {
			fnRunAllTimersAndRestore(this.clock);
		}
	});

	QUnit.test("onsapescape - close the picker popup", async function (assert) {
		this.clock.restore();
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
		await nextUIUpdate();
		oComboBox.focus();
		var fnEscapeSpy = this.spy(oComboBox, "onsapescape");
		var fnCloseSpy = this.spy(oComboBox, "close");

		// act
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ESCAPE);

		// assert
		assert.strictEqual(fnEscapeSpy.callCount, 1, "onsapescape() method was called exactly once");
		assert.strictEqual(fnCloseSpy.callCount, 0, "close() method is not called");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onsapescape - close the picker popup", async function (assert) {

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
		await nextUIUpdate(this.clock);
		oComboBox.focus();
		oComboBox.open();
		this.clock.tick(1000);
		oComboBox.getFocusDomRef().value = "A";
		qutils.triggerEvent("input", oComboBox.getFocusDomRef());
		var fnEscapeSpy = this.spy(oComboBox, "onsapescape");
		var fnCloseSpy = this.spy(oComboBox, "close");

		// act
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ESCAPE);
		this.clock.tick(1000);	// wait 1s after the close animation is completed

		// assert
		assert.strictEqual(fnEscapeSpy.callCount, 1, "onsapescape() method was called exactly once");
		assert.strictEqual(fnCloseSpy.callCount, 1, "close() method was called exactly once");
		assert.strictEqual(ListHelpers.getVisibleItems(oComboBox.getItems()).length, 4, "The filter is cleared");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onsapescape - when escape is pressed and the controls's field is not editable, the picker pop-up should not close", async function (assert) {

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
		await nextUIUpdate(this.clock);
		oComboBox.focus();
		oComboBox.open();
		this.clock.tick(1000);

		// act
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ESCAPE);

		// assert
		assert.strictEqual(oComboBox.getPicker().oPopup.getOpenState(), OpenState.OPEN, "Control's picker pop-up is open");
		assert.strictEqual(oComboBox.isOpen(), true);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.module("onsapenter", {
		beforeEach: function () {
			this.clock = sinon.useFakeTimers();
		},
		afterEach: function () {
			fnRunAllTimersAndRestore(this.clock);
		}
	});

	QUnit.test("onsapenter - close control's picker pop-up", async function (assert) {

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
		await nextUIUpdate(this.clock);
		oComboBox.focus();
		oComboBox.open();
		this.clock.tick(1000);

		var fnEnterSpy = this.spy(oComboBox, "onsapenter");
		var fnCloseSpy = this.spy(oComboBox, "close");

		// act
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ENTER);

		// assert
		assert.strictEqual(fnEnterSpy.callCount, 1, "onsapenter() method was called exactly once");
		assert.notOk(fnEnterSpy.args[0][0].isMarked(), "The event should not be marked, since there are no modifications");
		assert.strictEqual(fnCloseSpy.callCount, 1, "close() method was called exactly once");

		// cleanup
		fnEnterSpy.restore();
		fnCloseSpy.restore();
		oComboBox.destroy();
	});

	QUnit.test("onsapenter - close control's picker pop-up and clear the filter", async function (assert) {

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
		await nextUIUpdate(this.clock);
		oComboBox.focus();
		oComboBox.getFocusDomRef().value = "A";
		qutils.triggerEvent("input", oComboBox.getFocusDomRef());
		this.clock.tick(1000);

		// act
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ENTER);
		this.clock.tick(1000); // wait 1s after the close animation is completed

		// assert
		assert.strictEqual(ListHelpers.getVisibleItems(oComboBox.getItems()).length, 4, "The filter is cleared");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onsapenter - when enter key is pressed and the control's field is not editable, the control's picker pop-up should not close", async function (assert) {

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
		await nextUIUpdate(this.clock);
		oComboBox.focus();
		oComboBox.open();
		this.clock.tick(1000);

		// act
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ENTER);

		// assert
		assert.strictEqual(oComboBox.getPicker().oPopup.getOpenState(), OpenState.OPEN, "Control's picker pop-up is open");
		assert.strictEqual(oComboBox.isOpen(), true);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onsapenter", async function (assert) {

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
		await nextUIUpdate(this.clock);
		oComboBox.focus();
		oComboBox.open();
		this.clock.tick(1000);
		oComboBox.selectText(0, 6);

		// act
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ENTER);
		// note: after the onsapenter() method is called, the cursor position change

		// assert
		assert.strictEqual(oComboBox.getFocusDomRef().selectionStart, 6, "The text should not be selected");
		assert.strictEqual(oComboBox.getFocusDomRef().selectionEnd, 6, "The text should not be selected");
		assert.strictEqual(jQuery(oComboBox.getFocusDomRef()).cursorPos(), 6, "The cursor position is at the end of the text");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onsapenter", async function (assert) {

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
		await nextUIUpdate(this.clock);
		oComboBox.focus();
		oComboBox.open();
		this.clock.tick(1000);

		// act
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN);
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ENTER);

		// assert
		assert.strictEqual(jQuery(oComboBox.getFocusDomRef()).cursorPos(), 6, "The cursor position is at the end of the text");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onsapenter", async function (assert) {

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
		await nextUIUpdate(this.clock);
		oComboBox.focus();
		this.clock.tick(0);	// tick the clock ahead 0ms millisecond to make sure the async call to .selectText() on the focusin event handler does not override the type ahead

		// act
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN);
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ENTER);

		// assert
		assert.strictEqual(oComboBox.getFocusDomRef().selectionStart, 7, "The text should not be selected");
		assert.strictEqual(oComboBox.getFocusDomRef().selectionEnd, 7, "The text should not be selected");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.module("onsapdown", {
		beforeEach: function () {
			this.clock = sinon.useFakeTimers();
		},
		afterEach: function () {
			fnRunAllTimersAndRestore(this.clock);
		}
	});

	QUnit.test("onsapdown", async function (assert) {

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
		await nextUIUpdate(this.clock);
		oComboBox.focus();
		this.clock.tick(0);	// tick the clock ahead 0ms millisecond to make sure the async call to .selectText() on the focusin event handler does not override the type ahead
		var fnKeyDownSpy = this.spy(oComboBox, "onsapdown");
		var fnFireSelectionChangeSpy = this.spy(oComboBox, "fireSelectionChange");

		// act
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN);

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

	QUnit.test("onsapdown - when keyboard DOWN key is pressed and the control is not editable, the value should not change", async function (assert) {
		this.clock.restore();
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
		await nextUIUpdate();
		oComboBox.focus();
		var fnFireSelectionChangeSpy = this.spy(oComboBox, "fireSelectionChange");

		// act
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN);

		// assert
		assert.strictEqual(fnFireSelectionChangeSpy.callCount, 0, 'The "selectionChange" event was not fired');
		assert.ok(oComboBox.getSelectedItem() === null);
		assert.strictEqual(oComboBox.getFocusDomRef().value, "");
		assert.strictEqual(jQuery(oComboBox.getFocusDomRef()).attr("aria-activedescendant"), undefined, 'The "aria-activedescendant" attribute is set when the active descendant is rendered and visible');

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onsapdown", async function (assert) {
		this.clock.restore();
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
		await nextUIUpdate();
		oComboBox.focus();
		var fnKeyDownSpy = this.stub(oComboBox, "onsapdown");
		var fnFireSelectionChangeSpy = this.spy(oComboBox, "fireSelectionChange");

		// act
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN);

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

	QUnit.test("onsapdown", async function (assert) {

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
		await nextUIUpdate(this.clock);
		oComboBox.focus();
		this.clock.tick(0);	// tick the clock ahead 0ms millisecond to make sure the async call to .selectText() on the focusin event handler does not override the type ahead

		var fnKeyDownSpy = this.spy(oComboBox, "onsapdown");
		var fnFireSelectionChangeSpy = this.spy(oComboBox, "fireSelectionChange");

		// act
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN);

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

	QUnit.test("onsapdown changing the value in attachSelectionChange event handler", async function (assert) {

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
		await nextUIUpdate(this.clock);
		oComboBox.focus();
		this.clock.tick(0);	// tick the clock ahead 0ms millisecond to make sure the async call to .selectText() on the focusin event handler does not override the type ahead

		oComboBox.attachSelectionChange(function (oControlEvent) {
			this.setValue(sExpectedValue);
		}, oComboBox);

		// act
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN);
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN);

		// assert
		assert.strictEqual(oComboBox.getValue(), sExpectedValue);
		assert.strictEqual(oComboBox.getProperty("value"), sExpectedValue);
		assert.strictEqual(jQuery(oComboBox.getFocusDomRef()).getSelectedText(), sExpectedValue);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onsapdown the typed value should not get selected (test case 1)", async function (assert) {

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
		await nextUIUpdate(this.clock);
		oComboBox.focus();
		this.clock.tick(0);	// tick the clock ahead 0ms millisecond to make sure the async call to .selectText() on the focusin event handler does not override the type ahead

		qutils.triggerEvent("keydown", oComboBox.getFocusDomRef(), {
			which: KeyCodes.A
		});
		oComboBox.getFocusDomRef().value = "A";
		qutils.triggerEvent("input", oComboBox.getFocusDomRef());
		this.clock.tick(1000);

		// act
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN);
		await nextUIUpdate(this.clock);

		// assert
		assert.strictEqual(oComboBox.getFocusDomRef().value, "Algeria");
		assert.strictEqual(jQuery(oComboBox.getFocusDomRef()).getSelectedText(), "lgeria");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onsapdown the typed value should not get selected (test case 2)", async function (assert) {

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
		await nextUIUpdate(this.clock);
		oComboBox.focus();
		this.clock.tick(0);	// tick the clock ahead 0ms millisecond to make sure the async call to .selectText() on the focusin event handler does not override the type ahead

		qutils.triggerEvent("keydown", oComboBox.getFocusDomRef(), {
			which: KeyCodes.A
		});
		oComboBox.getFocusDomRef().value = "A";
		qutils.triggerEvent("input", oComboBox.getFocusDomRef());
		this.clock.tick(0);
		jQuery(oComboBox.getFocusDomRef()).cursorPos(0);

		// act
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN);

		// assert
		assert.strictEqual(oComboBox.getFocusDomRef().value, "Algeria");
		assert.strictEqual(jQuery(oComboBox.getFocusDomRef()).getSelectedText(), "");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test('onsapdown the attribute "aria-activedescendant" is set', async function (assert) {

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
		await nextUIUpdate(this.clock);
		oComboBox.focus();
		oComboBox.open();
		this.clock.tick(1000); // wait after the open animation is completed

		var sExpectedActiveDescendantId = ListHelpers.getListItem(oExpectedItem).getId();

		// act
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN);
		await nextUIUpdate(this.clock);

		// assert
		assert.strictEqual(oComboBox.getFocusDomRef().getAttribute("aria-activedescendant"), sExpectedActiveDescendantId);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.module("onsapup");

	QUnit.test("onsapup", async function (assert) {

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
		await nextUIUpdate();
		oComboBox.focus();
		var fnKeyUpSpy = this.spy(oComboBox, "onsapup");
		var fnFireSelectionChangeSpy = this.spy(oComboBox, "fireSelectionChange");

		// act
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ARROW_UP);

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

	QUnit.test("onsapup - when keyboard UP key is pressed and the control is not editable, the value should not change", async function (assert) {

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
		await nextUIUpdate();
		oComboBox.focus();
		var fnFireSelectionChangeSpy = this.spy(oComboBox, "fireSelectionChange");

		// act
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ARROW_UP);

		// assert
		assert.strictEqual(fnFireSelectionChangeSpy.callCount, 0, 'The "selectionChange" event was not fired');
		assert.ok(oComboBox.getSelectedItem() === oExpectedItem);
		assert.strictEqual(oComboBox.getFocusDomRef().value, "item 1");
		assert.strictEqual(jQuery(oComboBox.getFocusDomRef()).attr("aria-activedescendant"), undefined, 'The "aria-activedescendant" attribute is set when the active descendant is rendered and visible');

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onsapup", async function (assert) {

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
		await nextUIUpdate();
		oComboBox.focus();
		var fnKeyUpSpy = this.spy(oComboBox, "onsapup");

		// act
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ARROW_UP);

		// assert
		assert.strictEqual(fnKeyUpSpy.callCount, 1, "onsapup() method was called exactly once");
		assert.ok(oComboBox.getSelectedItem() === null);
		assert.strictEqual(oComboBox.getValue(), "");
		assert.strictEqual(oComboBox.getProperty("value"), "");
		assert.strictEqual(jQuery(oComboBox.getFocusDomRef()).attr("aria-activedescendant"), undefined, 'The "aria-activedescendant" attribute is set when the active descendant is rendered and visible');

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onsapup", async function (assert) {

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
		await nextUIUpdate();
		oComboBox.focus();
		var fnKeyUpSpy = this.stub(oComboBox, "onsapup");
		var fnFireSelectionChangeSpy = this.spy(oComboBox, "fireSelectionChange");

		// act
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ARROW_UP);

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

	QUnit.test("onsapup changing the value in attachSelectionChange event handler", async function (assert) {
		this.clock = sinon.useFakeTimers();
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
		await nextUIUpdate(this.clock);
		oComboBox.focus();
		this.clock.tick(0);	// tick the clock ahead 0ms millisecond to make sure the async call to .selectText() on the focusin event handler does not override the type ahead
		oComboBox.attachSelectionChange(function (oControlEvent) {
			this.setValue(sExpectedValue);
		}, oComboBox);

		// act
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ARROW_UP);
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ARROW_UP);

		// assert
		assert.strictEqual(oComboBox.getValue(), sExpectedValue);
		assert.strictEqual(oComboBox.getProperty("value"), sExpectedValue);
		assert.strictEqual(jQuery(oComboBox.getFocusDomRef()).getSelectedText(), sExpectedValue);

		// cleanup
		oComboBox.destroy();
		fnRunAllTimersAndRestore(this.clock);
	});

	QUnit.test("onsapup the typed value should not gets selected (test case 1)", async function (assert) {
		this.clock = sinon.useFakeTimers();
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
		await nextUIUpdate(this.clock);
		oComboBox.focus();
		this.clock.tick(0);	// tick the clock ahead 0ms millisecond to make sure the async call to .selectText() on the focusin event handler does not override the type ahead
		qutils.triggerEvent("keydown", oComboBox.getFocusDomRef(), {
			which: KeyCodes.A
		});
		oComboBox.getFocusDomRef().value = "A";
		qutils.triggerEvent("input", oComboBox.getFocusDomRef());
		this.clock.tick(1000);

		// act
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN);
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ARROW_UP);

		// assert
		assert.strictEqual(oComboBox.getFocusDomRef().value, "Algeria");
		assert.strictEqual(jQuery(oComboBox.getFocusDomRef()).getSelectedText(), "lgeria");

		// cleanup
		oComboBox.destroy();
		fnRunAllTimersAndRestore(this.clock);
	});

	QUnit.test("onsapup the typed value should not get selected (test case 2)", async function (assert) {
		this.clock = sinon.useFakeTimers();
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
		await nextUIUpdate(this.clock);
		oComboBox.focus();
		this.clock.tick(0);	// tick the clock ahead 0ms millisecond to make sure the async call to .selectText() on the focusin event handler does not override the type ahead
		qutils.triggerEvent("keydown", oComboBox.getFocusDomRef(), {
			which: KeyCodes.A
		});
		oComboBox.getFocusDomRef().value = "A";
		qutils.triggerEvent("input", oComboBox.getFocusDomRef());
		this.clock.tick(0);
		jQuery(oComboBox.getFocusDomRef()).cursorPos(0);
		this.clock.tick(1000);

		// act
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN);
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ARROW_UP);

		// assert
		assert.strictEqual(oComboBox.getFocusDomRef().value, "Algeria");
		assert.strictEqual(jQuery(oComboBox.getFocusDomRef()).getSelectedText(), "");

		// cleanup
		oComboBox.destroy();
		fnRunAllTimersAndRestore(this.clock);
	});

	QUnit.test('onsapup the attribute "aria-activedescendant" is set', async function (assert) {
		this.clock = sinon.useFakeTimers();
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
		await nextUIUpdate(this.clock);
		oComboBox.focus();
		this.clock.tick(0);	// tick the clock ahead 0ms millisecond to make sure the async call to .selectText() on the focusin event handler does not override the type ahead
		oComboBox.open();
		this.clock.tick(1000);	// wait after the open animation is completed
		var sExpectedActiveDescendantId = ListHelpers.getListItem(oExpectedItem).getId();

		// act
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ARROW_UP);
		await nextUIUpdate(this.clock);

		// assert
		assert.strictEqual(oComboBox.getFocusDomRef().getAttribute("aria-activedescendant"), sExpectedActiveDescendantId);

		// cleanup
		oComboBox.destroy();
		fnRunAllTimersAndRestore(this.clock);
	});

	QUnit.module("onsaphome", {
		afterEach: function() {
			fnRunAllTimersAndRestore(this.clock);
		}
	});

	QUnit.test("onsaphome", async function (assert) {
		this.clock = sinon.useFakeTimers();

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
		await nextUIUpdate(this.clock);
		oComboBox.focus();
		this.clock.tick(0);	// tick the clock ahead 0ms millisecond to make sure the async call to .selectText() on the focusin event handler does not override the type ahead
		var fnKeyHomeSpy = this.spy(oComboBox, "onsaphome");
		var fnFireSelectionChangeSpy = this.spy(oComboBox, "fireSelectionChange");

		// act
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.HOME);

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

	QUnit.test("onsaphome - when Home key is pressed and the control's field is not editable, the value should not change", async function (assert) {
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
		await nextUIUpdate();
		oComboBox.focus();
		var fnFireSelectionChangeSpy = this.spy(oComboBox, "fireSelectionChange");

		// act
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.HOME);

		// assert
		assert.strictEqual(fnFireSelectionChangeSpy.callCount, 0, 'The "selectionChange" event was not fired');
		assert.ok(oComboBox.getSelectedItem() === null);
		assert.strictEqual(oComboBox.getFocusDomRef().value, "");
		assert.strictEqual(jQuery(oComboBox.getFocusDomRef()).attr("aria-activedescendant"), undefined, 'The "aria-activedescendant" attribute is set when the active descendant is rendered and visible');

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onsaphome", async function (assert) {
		this.clock = sinon.useFakeTimers();
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
		await nextUIUpdate(this.clock);
		oComboBox.focus();
		this.clock.tick(0);	// tick the clock ahead 0ms millisecond to make sure the async call to .selectText() on the focusin event handler does not override the type ahead
		var fnKeyHomeSpy = this.spy(oComboBox, "onsaphome");
		var fnFireSelectionChangeSpy = this.spy(oComboBox, "fireSelectionChange");

		// act
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.HOME);

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

	QUnit.test("onsaphome changing the value in attachSelectionChange event handler", async function (assert) {
		this.clock = sinon.useFakeTimers();
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
		await nextUIUpdate(this.clock);
		oComboBox.focus();
		this.clock.tick(0);	// tick the clock ahead 0ms millisecond to make sure the async call to .selectText() on the focusin event handler does not override the type ahead

		oComboBox.attachSelectionChange(function (oControlEvent) {
			this.setValue(sExpectedValue);
		}, oComboBox);

		// act
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.HOME);
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.HOME);

		// assert
		assert.strictEqual(oComboBox.getValue(), sExpectedValue);
		assert.strictEqual(oComboBox.getProperty("value"), sExpectedValue);
		assert.strictEqual(oComboBox.getFocusDomRef().selectionStart, 0);
		assert.strictEqual(oComboBox.getFocusDomRef().selectionEnd, sExpectedValue.length);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onsaphome the attribute aria-activedescendant is set", async function (assert) {
		this.clock = sinon.useFakeTimers();
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
		await nextUIUpdate(this.clock);
		oComboBox.focus();
		this.clock.tick(0);	// tick the clock ahead 0ms millisecond to make sure the async call to .selectText() on the focusin event handler does not override the type ahead
		var sExpectedActiveDescendantId = ListHelpers.getListItem(oExpectedItem).getId();


		// act
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.F4);
		this.clock.tick(0);
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.HOME);
		await nextUIUpdate(this.clock);

		// assert
		assert.strictEqual(oComboBox.getFocusDomRef().getAttribute("aria-activedescendant"), sExpectedActiveDescendantId);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.module("onsapend", {
		afterEach: function() {
			fnRunAllTimersAndRestore(this.clock);
		}
	});

	QUnit.test("onsapend", async function (assert) {
		this.clock = sinon.useFakeTimers();
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
		await nextUIUpdate(this.clock);
		oComboBox.focus();
		this.clock.tick(0); // tick the clock ahead 0ms millisecond to make sure the async call to .selectText() on the focusin event handler does not override the type ahead

		var fnKeyEndSpy = this.spy(oComboBox, "onsapend");
		var fnFireSelectionChangeSpy = this.spy(oComboBox, "fireSelectionChange");

		// act
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.END);

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

	QUnit.test("onsapend changing the value in attachSelectionChange event handler", async function (assert) {
		this.clock = sinon.useFakeTimers();
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
		await nextUIUpdate(this.clock);
		oComboBox.focus();
		this.clock.tick(0);	// tick the clock ahead 0ms millisecond to make sure the async call to .selectText() on the focusin event handler does not override the type ahead
		oComboBox.attachSelectionChange(function (oControlEvent) {
			this.setValue(sExpectedValue);
		}, oComboBox);

		// act
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.END);
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.END);

		// assert
		assert.strictEqual(oComboBox.getValue(), sExpectedValue);
		assert.strictEqual(oComboBox.getProperty("value"), sExpectedValue);
		assert.strictEqual(oComboBox.getFocusDomRef().selectionStart, 0);
		assert.strictEqual(oComboBox.getFocusDomRef().selectionEnd, sExpectedValue.length);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onsapend - when end key is pressed and the control's field is not editable, the value should not change", async function (assert) {

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
		await nextUIUpdate();
		var fnFireSelectionChangeSpy = this.spy(oComboBox, "fireSelectionChange");
		oComboBox.focus();

		// act
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.END);

		// assert
		assert.strictEqual(fnFireSelectionChangeSpy.callCount, 0, 'The "selectionChange" event was not fired');
		assert.ok(oComboBox.getSelectedItem() === null);
		assert.strictEqual(oComboBox.getFocusDomRef().value, "");
		assert.strictEqual(jQuery(oComboBox.getFocusDomRef()).attr("aria-activedescendant"), undefined, 'The "aria-activedescendant" attribute is set when the active descendant is rendered and visible');

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onsapend the attribute aria-activedescendant is set", async function (assert) {
		this.clock = sinon.useFakeTimers();
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
		await nextUIUpdate(this.clock);
		oComboBox.focus();
		oComboBox.open();
		this.clock.tick(1000);	// wait after the open animation is completed
		var sExpectedActiveDescendantId = ListHelpers.getListItem(oExpectedItem).getId();

		// act
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.END);
		await nextUIUpdate(this.clock);

		// assert
		assert.strictEqual(oComboBox.getFocusDomRef().getAttribute("aria-activedescendant"), sExpectedActiveDescendantId);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.module("onsappagedown", {
		afterEach: function() {
			fnRunAllTimersAndRestore(this.clock);
		}
	});

	var pageDownTestCase = function (sTestName, mOptions) {
		QUnit.test("onsappagedown", async function (assert) {
			this.clock = sinon.useFakeTimers();
			// system under test
			var oComboBox = mOptions.control;

			// arrange
			oComboBox.placeAt("content");
			await nextUIUpdate(this.clock);
			oComboBox.focus();
			this.clock.tick(0);	// tick the clock ahead 0ms millisecond to make sure the async call to .selectText() on the focusin event handler does not override the type ahead

			var fnPageDownSpy = this.spy(oComboBox, "onsappagedown");
			var fnFireSelectionChangeSpy = this.spy(oComboBox, "fireSelectionChange");

			// act
			qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.PAGE_DOWN);

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

	QUnit.test("onsappagedown changing the value in attachSelectionChange event handler", async function (assert) {
		this.clock = sinon.useFakeTimers();
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
		await nextUIUpdate(this.clock);
		oComboBox.focus();
		this.clock.tick(0);	// tick the clock ahead 0ms millisecond to make sure the async call to .selectText() on the focusin event handler does not override the type ahead

		oComboBox.attachSelectionChange(function (oControlEvent) {
			this.setValue(sExpectedValue);
		}, oComboBox);

		// act
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.PAGE_DOWN);
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.PAGE_DOWN);

		// assert
		assert.strictEqual(oComboBox.getValue(), sExpectedValue);
		assert.strictEqual(oComboBox.getProperty("value"), sExpectedValue);
		assert.strictEqual(oComboBox.getFocusDomRef().selectionStart, 0);
		assert.strictEqual(oComboBox.getFocusDomRef().selectionEnd, sExpectedValue.length);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onsappagedown when page down key is pressed and the control's field is not editable, the value should not change", async function (assert) {

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
		await nextUIUpdate();
		var fnFireSelectionChangeSpy = this.spy(oComboBox, "fireSelectionChange");
		oComboBox.focus();

		// act
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.PAGE_DOWN);

		// assert
		assert.strictEqual(fnFireSelectionChangeSpy.callCount, 0, 'The "selectionChange" event was not fired');
		assert.ok(oComboBox.getSelectedItem() === null);
		assert.strictEqual(oComboBox.getFocusDomRef().value, "");
		assert.strictEqual(jQuery(oComboBox.getFocusDomRef()).attr("aria-activedescendant"), undefined, 'The "aria-activedescendant" attribute is set when the active descendant is rendered and visible');

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onsappagedown the attribute aria-activedescendant is set", async function (assert) {
		this.clock = sinon.useFakeTimers();
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
		await nextUIUpdate(this.clock);
		oComboBox.focus();
		oComboBox.open();
		this.clock.tick(1000);	// wait after the open animation is completed

		var sExpectedActiveDescendantId = ListHelpers.getListItem(oExpectedItem).getId();

		// act
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.PAGE_DOWN);
		await nextUIUpdate(this.clock);

		// assert
		assert.strictEqual(oComboBox.getFocusDomRef().getAttribute("aria-activedescendant"), sExpectedActiveDescendantId);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.module("onsappageup", {
		afterEach: function () {
			fnRunAllTimersAndRestore(this.clock);
		}
	});

	var pageUpTestCase = function (sTestName, mOptions) {
		QUnit.test("onsappageup", async function (assert) {
			this.clock = sinon.useFakeTimers();

			// system under test
			var oComboBox = mOptions.control;

			// arrange
			oComboBox.placeAt("content");
			await nextUIUpdate(this.clock);
			oComboBox.focus();
			this.clock.tick(0);	// tick the clock ahead 0ms millisecond to make sure the async call to .selectText() on the focusin event handler does not override the type ahead
			var fnPageUpSpy = this.spy(oComboBox, "onsappageup");
			var fnFireSelectionChangeSpy = this.spy(oComboBox, "fireSelectionChange");

			// act
			qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.PAGE_UP);

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

	QUnit.test("onsappageup changing the value in attachSelectionChange event handler", async function (assert) {
		this.clock = sinon.useFakeTimers();
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
		await nextUIUpdate(this.clock);
		oComboBox.focus();
		this.clock.tick(0);	// tick the clock ahead 0ms millisecond to make sure the async call to .selectText() on the focusin event handler does not override the type ahead
		oComboBox.attachSelectionChange(function (oControlEvent) {
			this.setValue(sExpectedValue);
		}, oComboBox);

		// act
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.PAGE_UP);
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.PAGE_UP);

		// assert
		assert.strictEqual(oComboBox.getFocusDomRef().value, sExpectedValue);
		assert.strictEqual(oComboBox.getFocusDomRef().selectionStart, 0);
		assert.strictEqual(oComboBox.getFocusDomRef().selectionEnd, sExpectedValue.length);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onsappageup - when page up key is pressed and the control's field is not editable, the value should not change", async function (assert) {

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
		await nextUIUpdate();
		var fnFireSelectionChangeSpy = this.spy(oComboBox, "fireSelectionChange");
		oComboBox.focus();

		// act
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.PAGE_UP);

		// assert
		assert.strictEqual(fnFireSelectionChangeSpy.callCount, 0, 'The "selectionChange" event was not fired');
		assert.ok(oComboBox.getSelectedItem() === null);
		assert.strictEqual(oComboBox.getFocusDomRef().value, "");
		assert.strictEqual(jQuery(oComboBox.getFocusDomRef()).attr("aria-activedescendant"), undefined, 'The "aria-activedescendant" attribute is set when the active descendant is rendered and visible');

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onsappageup the attribute aria-activedescendant is set", async function (assert) {
		this.clock = sinon.useFakeTimers();
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
		await nextUIUpdate(this.clock);
		oComboBox.focus();
		oComboBox.open();
		this.clock.tick(1000);	// wait 1s after the open animation is completed

		var sExpectedActiveDescendantId = ListHelpers.getListItem(oExpectedItem).getId();

		// act
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.PAGE_UP);
		await nextUIUpdate(this.clock);

		// assert
		assert.strictEqual(oComboBox.getFocusDomRef().getAttribute("aria-activedescendant"), sExpectedActiveDescendantId);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.module("oninput", {
		afterEach: function () {
			fnRunAllTimersAndRestore(this.clock);
		}
	});

	QUnit.test("oninput the ComboBox's picker pop-up should open", async function (assert) {
		this.clock = sinon.useFakeTimers();
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
		await nextUIUpdate(this.clock);
		oComboBox.focus();

		var fnOpenSpy = this.spy(oComboBox, "open");
		var fnFireSelectionChangeSpy = this.spy(oComboBox, "fireSelectionChange");

		// act
		oComboBox.getFocusDomRef().value = "G";
		qutils.triggerEvent("input", oComboBox.getFocusDomRef());
		this.clock.tick(1000);	// wait 1s after the open animation is completed

		// assert
		assert.strictEqual(fnOpenSpy.callCount, 1, "open() method was called exactly once");
		assert.strictEqual(fnFireSelectionChangeSpy.callCount, 1, 'The "selectionChange" event is fired');
		assert.strictEqual(ListHelpers.getVisibleItems(oComboBox.getItems()).length, 3, "Three items are visible");
		assert.strictEqual(oComboBox.getFocusDomRef().getAttribute("aria-activedescendant"), null, "The 'aria-activedescendant' attribute is not set if the visual focus is not on the item");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("oninput close the picker popup if there are not suggestions", async function (assert) {
		this.clock = sinon.useFakeTimers();
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
		await nextUIUpdate(this.clock);
		oComboBox.focus();
		oComboBox.open();
		this.clock.tick(1000);
		var fnFireSelectionChangeSpy = this.spy(oComboBox, "fireSelectionChange");
		var fnOpenSpy = this.spy(oComboBox, "open");
		var fnCloseSpy = this.spy(oComboBox, "close");
		var sOpenState = OpenState.CLOSED;

		// act
		oComboBox.getFocusDomRef().value = "v";
		qutils.triggerEvent("input", oComboBox.getFocusDomRef());
		this.clock.tick(1000);

		// assert
		assert.strictEqual(fnOpenSpy.callCount, 0, "open() method was not called");
		assert.strictEqual(fnCloseSpy.callCount, 1, "close() method was called");
		assert.strictEqual(oComboBox.getPicker().oPopup.getOpenState(), sOpenState);
		assert.strictEqual(fnFireSelectionChangeSpy.callCount, 0, 'The "selectionChange" event is not fired');
		assert.strictEqual(jQuery(oComboBox.getFocusDomRef()).attr("aria-activedescendant"), undefined, 'The "aria-activedescendant" attribute is set when the active descendant is rendered and visible');

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("oninput reset the selection when the value of the ComboBox's input field is empty", async function (assert) {

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
		await nextUIUpdate();
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

	QUnit.test("oninput clear the selection and the filter if not match is found", async function (assert) {

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
		await nextUIUpdate();
		oComboBox.focus();

		// act
		oComboBox.getFocusDomRef().value = "v";
		qutils.triggerEvent("input", oComboBox.getFocusDomRef());

		// assert
		assert.ok(oComboBox.getSelectedItem() === null);
		assert.strictEqual(oComboBox.getSelectedItemId(), "");
		assert.strictEqual(oComboBox.getSelectedKey(), "");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("oninput search in both columns if 'filterSecondaryValues' is true", async function (assert) {

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
		await nextUIUpdate();
		oComboBox.focus();

		// act
		oComboBox.getFocusDomRef().value = "D";
		qutils.triggerEvent("input", oComboBox.getFocusDomRef());

		// assert
		assert.strictEqual(oComboBox.getSelectedItem().getText(), "Denmark", "Selected value should be 'Denmark'");
		assert.strictEqual(oComboBox.getSelectedKey(), "DK");
		assert.strictEqual(oComboBox.getValue(), "Denmark");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("oninput the value should be propperly displayed when search in both columns is activated test case 1", async function (assert) {

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
		await nextUIUpdate();
		oComboBox.focus();

		// act
		oComboBox.getFocusDomRef().value = "dk";
		qutils.triggerEvent("input", oComboBox.getFocusDomRef());

		// assert
		assert.ok(oComboBox.getSelectedItem().getText() === "Denmark");
		assert.strictEqual(oComboBox.getSelectedKey(), "DK");
		assert.strictEqual(oComboBox.getValue(), "DK");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("oninput the value should be propperly displayed when search in both columns is activated test case 2", async function (assert) {

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
		await nextUIUpdate();
		oComboBox.focus();

		// act
		oComboBox.getFocusDomRef().value = "dz";
		qutils.triggerEvent("input", oComboBox.getFocusDomRef());

		// assert
		assert.ok(oComboBox.getSelectedItem().getText() === "Algeria");
		assert.strictEqual(oComboBox.getSelectedKey(), "DZ");
		assert.strictEqual(oComboBox.getValue(), "DZ");

		// cleanup
		oComboBox.destroy();
	});

	// BCP 1580015527
	QUnit.test("it should not open the picker pop-up", async function (assert) {

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
		await nextUIUpdate();
		var fnOpenSpy = this.spy(ComboBox.prototype, "open");
		oComboBox.focus();

		// act
		qutils.triggerEvent("input", oComboBox.getFocusDomRef());

		// assert
		assert.strictEqual(fnOpenSpy.callCount, 0);

		// cleanup
		oComboBox.destroy();
	});

	// BCP 1670033530
	QUnit.test("it should not select the disabled item while typing in the text field", async function (assert) {

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
		await nextUIUpdate();
		oComboBox.focus();
		var oTarget = oComboBox.getFocusDomRef();
		oTarget.value = "l";

		// act
		qutils.triggerEvent("input", oTarget);

		// assert
		assert.ok(oComboBox.getSelectedItem() === null);
		assert.strictEqual(oComboBox.getSelectedItemId(), "");
		assert.strictEqual(oComboBox.getSelectedKey(), "");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("it should filter the list on phones", async function (assert) {
		this.clock = sinon.useFakeTimers();
		this.stub(Device, "system").value({
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
		await nextUIUpdate(this.clock);
		oComboBox.focus();
		oComboBox.open();
		this.clock.tick(1000); // tick the clock ahead 1 second, after the open animation is completed
		var oPickerTextField = oComboBox.getPickerTextField();
		oPickerTextField.focus();
		var oPickerTextFieldDomRef = oPickerTextField.getFocusDomRef();
		oPickerTextFieldDomRef.value = "l";

		// act
		qutils.triggerEvent("keydown", oPickerTextFieldDomRef, {
			which: KeyCodes.L,
			srcControl: oPickerTextField
		});
		qutils.triggerEvent("input", oPickerTextFieldDomRef, {
			srcControl: oPickerTextField
		});
		this.clock.tick(1000); // tick the clock ahead 1 second, after the open animation is completed

		// assert
		assert.strictEqual(oPickerTextField.getValue(), sExpectedValue);
		this.clock.tick(300);
		assert.strictEqual(oPickerTextField.getSelectedText(), "orem ipsum");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("Typeahead should be disabled on adroid devices", async function (assert) {
		this.clock = sinon.useFakeTimers();
		this.stub(Device, "system").value({
			desktop: false,
			phone: true,
			tablet: false
		});

		this.stub(Device, "os").value({
			android: true
		});

		// system under test
		var oComboBox = new ComboBox({
			items: [
				new Item({
					text: "ipsum alorem"
				})
			]
		});

		// arrange
		oComboBox.placeAt("content");
		await nextUIUpdate(this.clock);
		oComboBox.focus();

		// act
		qutils.triggerEvent("keydown", oComboBox.getFocusDomRef(), {
			which: KeyCodes.I,
			srcControl: oComboBox.getFocusDomRef()
		});

		// assert
		assert.notOk(oComboBox._bDoTypeAhead, '_bDoTypeAhead should be set to false');

		oComboBox.open();
		this.clock.tick(1000); // tick the clock ahead 1 second, after the open animation is completed

		var oPickerTextField = oComboBox.getPickerTextField();
		oPickerTextField.focus();
		var oPickerTextFieldDomRef = oPickerTextField.getFocusDomRef();

		// act
		qutils.triggerEvent("keydown", oPickerTextFieldDomRef, {
			which: KeyCodes.L,
			srcControl: oPickerTextField
		});

		assert.notOk(oPickerTextField._bDoTypeAhead, '_bDoTypeAhead should be set to false');

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("it should close the dropdown list when the text field is empty and it was opened by typing text", async function (assert) {
		this.clock = sinon.useFakeTimers();
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
		await nextUIUpdate(this.clock);
		oComboBox.focus();

		// act
		oComboBox.getFocusDomRef().value = "G";
		qutils.triggerEvent("input", oComboBox.getFocusDomRef());
		this.clock.tick(1000);	// wait 1s after the open animation is completed

		// act
		oComboBox.getFocusDomRef().value = "";
		qutils.triggerEvent("input", oComboBox.getFocusDomRef());
		this.clock.tick(300);

		// assert
		assert.ok(!oComboBox.isOpen());

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("it should not close the dropdown list when the text field is empty and it was opened by keyboard or by pressing the button", async function (assert) {
		this.clock = sinon.useFakeTimers();
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
		await nextUIUpdate(this.clock);
		oComboBox.focus();

		// act
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN, false, true);
		this.clock.tick(500);

		// act
		oComboBox.getFocusDomRef().value = "";
		qutils.triggerEvent("input", oComboBox.getFocusDomRef());
		this.clock.tick(500);

		// assert
		assert.ok(oComboBox.isOpen());

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("it should not close the dropdown during typing if it was opened by keyboard", async function (assert) {
		this.clock = sinon.useFakeTimers();
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
		await nextUIUpdate(this.clock);
		oComboBox.focus();

		// act
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.F4);	// open the dropdown list

		this.clock.tick(1000);	// wait 1s after the open animation is completed

		// act
		oComboBox.getFocusDomRef().value = "x";
		qutils.triggerEvent("input", oComboBox.getFocusDomRef());
		this.clock.tick(1000);

		// assert
		assert.ok(oComboBox.isOpen());

		// cleanup
		oComboBox.destroy();
	});

	// BCP 1680329042
	QUnit.test("it should clear the selection when the backspace/delete keyboard key is pressed and the remaining text doesn't match any items", async function (assert) {
		this.clock = sinon.useFakeTimers();
		// system under test
		var oItem = new Item({
				text: "lorem ipsum"
			}),
			oComboBox = new ComboBox({
				items: [oItem]
			}),
			oSelectionChangeSpy = this.spy(oComboBox, "fireSelectionChange");

		// arrange
		oComboBox.placeAt("content");
		await nextUIUpdate(this.clock);
		oComboBox.focus();
		var oFocusDomRef = oComboBox.getFocusDomRef();

		// act (type something in the text field input)
		oFocusDomRef.value = "lo";
		qutils.triggerEvent("input", oFocusDomRef, {value: "lo"});

		// wait for the word completion feature
		this.clock.tick(1000);

		// Assert
		assert.ok(oSelectionChangeSpy.calledOnce, "selectionChange fired");
		assert.ok(oComboBox.getSelectedItem() === oItem);

		// remove the autocompleted text ("rem ipsum" by pressing the backspace keyboard key
		qutils.triggerKeydown(oFocusDomRef, KeyCodes.BACKSPACE);
		oFocusDomRef.value = "lo";
		qutils.triggerEvent("input", oFocusDomRef, {value: "lo"});
		this.clock.tick(1000);

		// assert
		assert.ok(oSelectionChangeSpy.calledTwice, "selectionChange fired again");
		assert.ok(oComboBox.getSelectedItem() === null);

		// Clear the input, but do not fire any more events
		qutils.triggerKeydown(oFocusDomRef, KeyCodes.BACKSPACE);
		oFocusDomRef.value = "";
		qutils.triggerEvent("input", oFocusDomRef, {value: ""});
		this.clock.tick(1000);

		// assert
		assert.ok(!oSelectionChangeSpy.calledThrice, "selectionChange did not fire anymore");
		assert.ok(oComboBox.getSelectedItem() === null);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("it should filter with empty value when input is deleted on mobile device", async function (assert) {
		this.clock = sinon.useFakeTimers();
		this.stub(Device, "system").value({
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
		await nextUIUpdate(this.clock);

		oComboBox.focus();
		oComboBox.open();
		this.clock.tick(1000); // tick the clock ahead 1 second, after the open animation is completed
		var oPickerTextField = oComboBox.getPickerTextField();
		oPickerTextField.focus();
		var oPickerTextFieldDomRef = oPickerTextField.getFocusDomRef();
		oPickerTextFieldDomRef.value = "t";

		// act
		qutils.triggerEvent("keydown", oPickerTextFieldDomRef, {
			which: KeyCodes.L,
			srcControl: oPickerTextField
		});
		qutils.triggerEvent("input", oPickerTextFieldDomRef, {
			srcControl: oPickerTextField
		});
		this.clock.tick(1000); // tick the clock ahead 1 second, after the open animation is completed

		assert.strictEqual(ListHelpers.getVisibleItems(oComboBox.getItems()).length, 1, "One item should be visible");
		assert.strictEqual(ListHelpers.getVisibleItems(oComboBox.getItems())[0].getText(), "Test", "Visible item text should be 'Test'");

		// act (clear input value)
		oPickerTextFieldDomRef.value = "";
		qutils.triggerEvent("input", oPickerTextFieldDomRef, {
			srcControl: oPickerTextField
		});

		// wait for the word completion feature
		this.clock.tick(0);

		assert.strictEqual(ListHelpers.getVisibleItems(oComboBox.getItems()).length, 2, "All items should be visible");

		oComboBox.close();
		this.clock.tick(300);

		oComboBox.destroy();
	});

	QUnit.module("onfocusin", {
		afterEach: function () {
			fnRunAllTimersAndRestore(this.clock);
		}
	});

	QUnit.test("onfocusin", async function (assert) {

		this.stub(Device, "system").value({
			desktop: true,
			phone: false,
			tablet: false
		});

		// system under test
		var oComboBox = new ComboBox();

		// arrange
		oComboBox.placeAt("content");
		await nextUIUpdate();

		// act
		qutils.triggerEvent("focusin", oComboBox.getOpenArea(), {
			target: oComboBox.getOpenArea()
		});

		// assert
		assert.ok(document.activeElement === oComboBox.getFocusDomRef(), "If the ComboBox's arrow recive the focusin event, revert it to the input field");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onfocusin select the text", async function (assert) {
		this.clock = sinon.useFakeTimers();

		this.stub(Device, "system").value({
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
		await nextUIUpdate(this.clock);

		// act
		oComboBox.focus();
		oComboBox.onmouseup();
		this.clock.tick(0);	// tick the clock ahead 0ms millisecond to make sure the async call to .selectText() on the focusin event handler does not override the type ahead

		// assert
		assert.strictEqual(oComboBox.getFocusDomRef().selectionStart, 0, "The text should be selected");
		assert.strictEqual(oComboBox.getFocusDomRef().selectionEnd, 7, "The text should be selected");

		// cleanup
		oComboBox.destroy();
	});

	// BCP 1570441294
	QUnit.test("onfocusin it should correctly restore the selection of the text after re-rendering", async function (assert) {
		this.clock = sinon.useFakeTimers();
		this.stub(Device, "system").value({
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
		await nextUIUpdate(this.clock);
		oComboBox.focus();
		qutils.triggerEvent("keydown", oComboBox.getFocusDomRef(), {
			which: KeyCodes.L
		});
		oComboBox.getFocusDomRef().value = "l";
		qutils.triggerEvent("input", oComboBox.getFocusDomRef(), {
			value: "l"
		});

		// act
		oComboBox.invalidate();
		this.clock.tick(0);	// tick the clock ahead 0ms millisecond to make sure the async call to .selectText() in the focusin event handler does not override the type ahead

		// assert
		if (!Device.browser.safari) { // Safari has issues with the cursor when the page is not "manually" focused
			assert.strictEqual(oComboBox.getSelectedText(), "orem ipsum");
		} else {
			assert.ok(true);
		}

		// cleanup
		oComboBox.destroy();
	});

	QUnit.module("onBeforeOpen");

	QUnit.test("onBeforeOpen", async function (assert) {
		// system under test
		var fnOnBeforeOpenSpy = this.spy(ComboBox.prototype, "onBeforeOpen");
		var oComboBox = new ComboBox({
			value: "Germany"
		});

		// arrange
		oComboBox.placeAt("content");
		await nextUIUpdate();
		oComboBox.focus();

		// act
		oComboBox.open();

		// assert
		assert.strictEqual(fnOnBeforeOpenSpy.callCount, 1, "onBeforeOpen() called exactly once");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.module("onAfterOpen", {
		afterEach: function () {
			fnRunAllTimersAndRestore(this.clock);
		}
	});

	QUnit.test("onAfterOpen test case 1", async function (assert) {
		this.clock = sinon.useFakeTimers();

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
		await nextUIUpdate(this.clock);
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

	QUnit.test("onAfterOpen test case 2", async function (assert) {

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
		await nextUIUpdate();
		oComboBox.focus();

		// act
		oComboBox.syncPickerContent();
		oComboBox.open();

		// assert
		assert.strictEqual(oComboBox.getFocusDomRef().getAttribute("aria-activedescendant"), null, "The 'aria-activedescendant' attribute is not set when a suggested item is not focused");

		oComboBox.destroy();
	});

	QUnit.test("onAfterOpen test case 3 - selected item position (sap.m.inputsUtils.scrollToItem)", async function (assert) {
		this.clock = sinon.useFakeTimers();
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
		await nextUIUpdate(this.clock);
		oComboBox.focus();
		oComboBox.open();
		this.clock.tick(1000);

		// asserts
		assert.ok(oComboBox.getPicker().getDomRef("cont").scrollTop < oComboBox._oSuggestionPopover.getItemsContainer().getSelectedItem().getDomRef().offsetTop, "Selected Item should be visible after scrolling");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onAfterOpen should select the value text in the input field", async function (assert) {
		this.clock = sinon.useFakeTimers();
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

		// arrange
		oComboBox.placeAt("content");
		await nextUIUpdate(this.clock);
		oComboBox.focus();

		// act
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.F4);
		this.clock.tick(500);

		// assert
		assert.strictEqual(oSpy.firstCall.args[0], 0, "Selection was called with first argument 0");
		assert.strictEqual(oSpy.firstCall.args[1], 7, "Selection was called with second argument 7");

		// cleanup
		oSpy.restore();
		oComboBox.destroy();
	});

	QUnit.module("onAfterClose", {
		afterEach: function () {
			fnRunAllTimersAndRestore(this.clock);
		}
	});

	QUnit.test("onAfterClose", async function (assert) {
		this.clock = sinon.useFakeTimers();
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
		await nextUIUpdate(this.clock);
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

	QUnit.test("it should set the focus to the body after fired onAfterClose event", async function (assert) {
		this.clock = sinon.useFakeTimers();
		// system under test
		this.stub(Device, "system").value({
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
		await nextUIUpdate(this.clock);
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

	QUnit.test("onBeforeClose", async function (assert) {
		this.clock = sinon.useFakeTimers();
		// system under test
		var fnOnBeforeCloseSpy = this.spy(ComboBox.prototype, "onBeforeClose");
		var oComboBox = new ComboBox();

		// arrange
		oComboBox.placeAt("content");
		await nextUIUpdate(this.clock);
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
		fnRunAllTimersAndRestore(this.clock);
	});

	QUnit.module("change", {
		afterEach: function () {
			fnRunAllTimersAndRestore(this.clock);
		}
	});

	QUnit.test("Should trigger change event only once", async function (assert) {
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

		await nextUIUpdate();

		// Act
		oComboBox.syncPickerContent();
		oComboBox.updateDomValue("desc1");
		oComboBox.onSelectionChange(oMockEvent);
		oComboBox.onItemPress(oMockEvent);

		assert.strictEqual(fnFireChangeSpy.callCount, 1, "Change Event should be called just once");

		// Cleanup
		oComboBox.destroy();
	});

	QUnit.test("onChange is fired after the value changes by pressing arrow down key when the control loses the focus", async function (assert) {
		this.clock = sinon.useFakeTimers();
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
		await nextUIUpdate(this.clock);
		oComboBox.focus();
		var fnFireChangeSpy = this.spy(oComboBox, "fireChange");

		// act
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN);
		oComboBox.getFocusDomRef().blur();
		this.clock.tick(0);	// when a blur event occurs the "sapfocusleave" is fired async

		// assert
		assert.strictEqual(fnFireChangeSpy.callCount, 1, 'The "change" event is fired');
		assert.strictEqual(oComboBox.getValue(), sExpectedValue);
		assert.strictEqual(oComboBox.getProperty("value"), sExpectedValue);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onChange is fired after the value changes by pressing arrow down key and enter", async function (assert) {

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
		await nextUIUpdate();
		oComboBox.focus();
		var fnFireChangeSpy = this.spy(oComboBox, "fireChange");

		// act
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN);
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ENTER);

		// assert
		assert.strictEqual(fnFireChangeSpy.callCount, 1, 'The "change" event is fired');
		assert.strictEqual(oComboBox.getValue(), sExpectedValue);
		assert.strictEqual(oComboBox.getProperty("value"), sExpectedValue);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onChange is fired after the value changes by pressing arrow up key when the control loses the focus", async function (assert) {
		this.clock = sinon.useFakeTimers();
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
		await nextUIUpdate(this.clock);
		oComboBox.focus();
		var fnFireChangeSpy = this.spy(oComboBox, "fireChange");

		// act
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ARROW_UP);
		oComboBox.getFocusDomRef().blur();
		this.clock.tick(0);	// when a blur event occurs the "sapfocusleave" is fired async

		// assert
		assert.strictEqual(fnFireChangeSpy.callCount, 1, 'The "change" event is fired');
		assert.strictEqual(oComboBox.getValue(), sExpectedValue);
		assert.strictEqual(oComboBox.getProperty("value"), sExpectedValue);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onChange is fired after the value changes by pressing arrow up key and enter", async function (assert) {

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
		await nextUIUpdate();
		oComboBox.focus();
		var fnFireChangeSpy = this.spy(oComboBox, "fireChange");

		// act
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ARROW_UP);
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ENTER);

		// assert
		assert.strictEqual(fnFireChangeSpy.callCount, 1, 'The "change" event is fired');
		assert.strictEqual(oComboBox.getValue(), sExpectedValue);
		assert.strictEqual(oComboBox.getProperty("value"), sExpectedValue);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onChange is fired after the value changes by pressing Home key when the control loses the focus", async function (assert) {
		this.clock = sinon.useFakeTimers();
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
		await nextUIUpdate(this.clock);
		oComboBox.focus();
		var fnFireChangeSpy = this.spy(oComboBox, "fireChange");

		// act
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.HOME);
		oComboBox.getFocusDomRef().blur();
		this.clock.tick(0);	// when a blur event occurs the "sapfocusleave" is fired async

		// assert
		assert.strictEqual(fnFireChangeSpy.callCount, 1, 'The "change" event is fired');
		assert.strictEqual(oComboBox.getValue(), sExpectedValue);
		assert.strictEqual(oComboBox.getProperty("value"), sExpectedValue);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onChange is fired after the value changes by pressing Home key and enter", async function (assert) {

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
		await nextUIUpdate();
		oComboBox.focus();
		var fnFireChangeSpy = this.spy(oComboBox, "fireChange");

		// act
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.HOME);
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ENTER);

		// assert
		assert.strictEqual(fnFireChangeSpy.callCount, 1, 'The "change" event is fired');
		assert.strictEqual(oComboBox.getValue(), sExpectedValue);
		assert.strictEqual(oComboBox.getProperty("value"), sExpectedValue);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onChange is fired after the value changes by pressing End key when the control loses the focus", async function (assert) {
		this.clock = sinon.useFakeTimers();
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
		await nextUIUpdate(this.clock);
		oComboBox.focus();
		var fnFireChangeSpy = this.spy(oComboBox, "fireChange");

		// act
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.END);
		oComboBox.getFocusDomRef().blur();
		this.clock.tick(0);	// when a blur event occurs the "sapfocusleave" is fired async

		// assert
		assert.strictEqual(fnFireChangeSpy.callCount, 1, 'The "change" event is fired');
		assert.strictEqual(oComboBox.getValue(), sExpectedValue);
		assert.strictEqual(oComboBox.getProperty("value"), sExpectedValue);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onChange is fired after the value changes by pressing End key and enter", async function (assert) {

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
		await nextUIUpdate();
		oComboBox.focus();
		var fnFireChangeSpy = this.spy(oComboBox, "fireChange");

		// act
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.END);
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ENTER);

		// assert
		assert.strictEqual(fnFireChangeSpy.callCount, 1, 'The "change" event is fired');
		assert.strictEqual(oComboBox.getValue(), sExpectedValue);
		assert.strictEqual(oComboBox.getProperty("value"), sExpectedValue);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onChange is fired after the value changes by pressing pagedown key when the control loses the focus", async function (assert) {
		this.clock = sinon.useFakeTimers();
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
		await nextUIUpdate(this.clock);
		oComboBox.focus();
		var fnFireChangeSpy = this.spy(oComboBox, "fireChange");

		// act
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.PAGE_DOWN);
		oComboBox.getFocusDomRef().blur();
		this.clock.tick(0);	// when a blur event occurs the "sapfocusleave" is fired async

		// assert
		assert.strictEqual(fnFireChangeSpy.callCount, 1, 'The "change" event is fired');
		assert.strictEqual(oComboBox.getValue(), sExpectedValue);
		assert.strictEqual(oComboBox.getProperty("value"), sExpectedValue);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onChange is fired after the value changes by pressing pagedown key and enter", async function (assert) {

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
		await nextUIUpdate();
		oComboBox.focus();
		var fnFireChangeSpy = this.spy(oComboBox, "fireChange");

		// act
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.PAGE_DOWN);
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ENTER);

		// assert
		assert.strictEqual(fnFireChangeSpy.callCount, 1, 'The "change" event is fired');
		assert.strictEqual(oComboBox.getValue(), sExpectedValue);
		assert.strictEqual(oComboBox.getProperty("value"), sExpectedValue);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onChange is fired after the value changes by pressing pageup key when the control loses the focus", async function (assert) {
		this.clock = sinon.useFakeTimers();
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
		await nextUIUpdate(this.clock);
		oComboBox.focus();
		var fnFireChangeSpy = this.spy(oComboBox, "fireChange");

		// act
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.PAGE_UP);
		oComboBox.getFocusDomRef().blur();
		this.clock.tick(0);	// when a blur event occurs the "sapfocusleave" is fired async

		// assert
		assert.strictEqual(fnFireChangeSpy.callCount, 1, 'The "change" event is fired');
		assert.strictEqual(oComboBox.getValue(), sExpectedValue);
		assert.strictEqual(oComboBox.getProperty("value"), sExpectedValue);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onChange is fired after the value changes by pressing pageup key and enter", async function (assert) {

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
		await nextUIUpdate();
		oComboBox.focus();
		var fnFireChangeSpy = this.spy(oComboBox, "fireChange");

		// act
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.PAGE_UP);
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ENTER);

		// assert
		assert.strictEqual(fnFireChangeSpy.callCount, 1, 'The "change" event is fired');
		assert.strictEqual(oComboBox.getValue(), sExpectedValue);
		assert.strictEqual(oComboBox.getProperty("value"), sExpectedValue);

		// cleanup
		oComboBox.destroy();
	});

	// unit test for CSN 0120061532 0001168439 2014
	QUnit.test("onChange is not fired when no changes are made", async function (assert) {
		this.clock = sinon.useFakeTimers();
		// system under test
		var oComboBox = new ComboBox();

		// arrange
		oComboBox.placeAt("content");
		await nextUIUpdate(this.clock);
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
	QUnit.test("it should not fire the change event when the arrow button is pressed", async function (assert) {

		// system under test
		var oComboBox = new ComboBox();

		// arrange
		oComboBox.placeAt("content");
		await nextUIUpdate();
		oComboBox.focus();
		var fnFireChangeSpy = this.spy(oComboBox, "fireChange");
		oComboBox.updateDomValue("lorem ipsum");

		oComboBox.getArrowIcon().firePress();

		// assert
		assert.strictEqual(fnFireChangeSpy.callCount, 0);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("it should change the value and fire the change event", async function (assert) {
		this.clock = sinon.useFakeTimers();
		this.stub(Device, "system").value({
			desktop: false,
			phone: true,
			tablet: false
		});

		// system under test
		var oComboBox = new ComboBox();

		// arrange
		oComboBox.placeAt("content");
		await nextUIUpdate(this.clock);
		oComboBox.focus();
		oComboBox.open();
		this.clock.tick(1000);
		var oPickerTextField = oComboBox.getPickerTextField();
		oPickerTextField.focus();
		var oPickerTextFieldDomRef = oPickerTextField.getFocusDomRef();
		var fnChangeSpy = this.spy(oComboBox, "fireChange");

		// act
		oPickerTextField.getFocusDomRef().value = "lorem ipsum";
		qutils.triggerEvent("input", oPickerTextFieldDomRef);
		qutils.triggerKeydown(oPickerTextFieldDomRef, KeyCodes.ENTER);
		oComboBox.close();
		this.clock.tick(1000);

		// assert
		assert.strictEqual(fnChangeSpy.callCount, 1, "The change event was fired");
		assert.strictEqual(oComboBox.getValue(), "lorem ipsum");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("it should fire the change event after the dialog is closed", async function (assert) {
		this.clock = sinon.useFakeTimers();
		this.stub(Device, "system").value({
			desktop: false,
			phone: true,
			tablet: false
		});

		// system under test
		var oComboBox = new ComboBox();

		// arrange
		oComboBox.placeAt("content");
		await nextUIUpdate(this.clock);
		oComboBox.focus();
		oComboBox.open();
		this.clock.tick(1000); // tick the clock ahead 1 second, after the open animation is completed
		var oPickerTextField = oComboBox.getPickerTextField();
		oPickerTextField.focus();
		var oPickerTextFieldDomRef = oPickerTextField.getFocusDomRef();
		var fnChangeSpy = this.spy(oComboBox, "fireChange");

		// act
		oPickerTextField.getFocusDomRef().value = "lorem ipsum";
		qutils.triggerEvent("input", oPickerTextFieldDomRef);
		oComboBox.getPicker().getButtons()[0].firePress();
		this.clock.tick(1000); // tick the clock ahead 1 second, after the close animation is completed

		// assert
		assert.strictEqual(fnChangeSpy.callCount, 1, "The change event was fired");
		assert.strictEqual(oComboBox.getValue(), "lorem ipsum");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("it should fire the change event when the ENTER key is pressed", async function (assert) {
		this.clock = sinon.useFakeTimers();
		this.stub(Device, "system").value({
			desktop: false,
			phone: true,
			tablet: false
		});

		// system under test
		var oComboBox = new ComboBox();

		// arrange
		oComboBox.placeAt("content");
		await nextUIUpdate(this.clock);
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
		qutils.triggerEvent("input", oPickerTextFieldDomRef, {
			srcControl: oPickerTextField
		});
		qutils.triggerKeydown(oPickerTextFieldDomRef, KeyCodes.ENTER);
		this.clock.tick(1000);

		// assert
		assert.strictEqual(fnChangeSpy.callCount, 1, "The change event was fired");
		assert.strictEqual(oComboBox.getValue(), "lorem ipsum");

		// cleanup
		oComboBox.destroy();
	});

	// BCP 1680061025
	QUnit.test("it should fire the change event after the selection is updated on mobile devices", async function (assert) {
		this.clock = sinon.useFakeTimers();
		var done = assert.async();
		this.stub(Device, "system").value({
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
		await nextUIUpdate(this.clock);
		oComboBox.focus();
		oComboBox.open();
		// tick the clock ahead 1 second, after the open animation is completed
		this.clock.tick(1000);

		var oListItem = ListHelpers.getListItem(oItem).getDomRef();
		var oTouches = {
			0: {
				pageX: 1,
				pageY: 1,
				identifier: 0
			},

			length: 1
		};

		qutils.triggerTouchEvent("touchstart", oListItem, {
			touches: oTouches,
			targetTouches: oTouches
		});

		qutils.triggerTouchEvent("touchend", oListItem, {
			changedTouches: oTouches,
			touches: {
				length: 0
			}
		});

		qutils.triggerTouchEvent("tap", oListItem, {
			changedTouches: oTouches,
			touches: {
				length: 0
			}
		});
		// tick the clock ahead 1 second, after the close animation is completed
		this.clock.tick(1000);
	});

	QUnit.test("it should close the dialog when the close button is pressed", async function (assert) {
		this.clock = sinon.useFakeTimers();
		this.stub(Device, "system").value({
			desktop: false,
			phone: true,
			tablet: false
		});

		// system under test
		var oComboBox = new ComboBox();

		// arrange
		oComboBox.placeAt("content");
		await nextUIUpdate(this.clock);
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
		qutils.triggerTouchEvent("touchstart", oButton.getDomRef(), oParams);
		oButton.focus();
		qutils.triggerTouchEvent("touchend", oButton.getDomRef(), oParams);
		qutils.triggerTouchEvent("tap", oButton.getDomRef(), oParams);
		this.clock.tick(1000);

		// assert
		assert.strictEqual(oComboBox.isOpen(), false);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onChange it should update the value of the comboBox as expected when search in both columns is enabled test case 1", async function (assert) {
		this.clock = sinon.useFakeTimers();
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
		await nextUIUpdate(this.clock);
		oComboBox.focus();

		// act
		oComboBox.getFocusDomRef().value = "D";
		qutils.triggerEvent("input", oComboBox.getFocusDomRef());
		oComboBox.getFocusDomRef().blur();
		this.clock.tick(0);	// when a blur event occurs the "sapfocusleave" is fired async

		// assert
		assert.strictEqual(oComboBox.getValue(), sExpectedValue);
		assert.strictEqual(oComboBox.getProperty("value"), sExpectedValue);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onChange it should update the value of the comboBox as expected when search in both columns is enabled test case 2", async function (assert) {
		this.clock = sinon.useFakeTimers();
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
		await nextUIUpdate(this.clock);
		oComboBox.focus();

		// act
		oComboBox.getFocusDomRef().value = "D";
		qutils.triggerEvent("input", oComboBox.getFocusDomRef());
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN);
		oComboBox.getFocusDomRef().blur();
		this.clock.tick(0);	// when a blur event occurs the "sapfocusleave" is fired async

		// assert
		assert.strictEqual(oComboBox.getValue(), sExpectedValue);
		assert.strictEqual(oComboBox.getProperty("value"), sExpectedValue);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onChange should leave the Input value as is if no match is found", async function (assert) {
		this.clock = sinon.useFakeTimers();
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
		await nextUIUpdate(this.clock);
		oComboBox.focus();

		// act
		oComboBox.getFocusDomRef().value = "Default";
		qutils.triggerEvent("input", oComboBox.getFocusDomRef());
		oComboBox.getFocusDomRef().blur();
		this.clock.tick(0);	// when a blur event occurs the "sapfocusleave" is fired async

		// assert
		assert.strictEqual(oComboBox.getValue(), sExpectedValue);
		assert.strictEqual(oComboBox.getProperty("value"), sExpectedValue);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test('onSelectionChange should pass in the "itemPressed" parameter to the change event handle', async function (assert) {
		this.clock = sinon.useFakeTimers();
		// system under test
		var oItem;
		var oComboBox = new ComboBox({
			items: [
				oItem = new Item({
					text: "lorem ipsum"
				})
			]
		});

		// arrange
		oComboBox.placeAt("content");
		await nextUIUpdate(this.clock);
		oComboBox.focus();
		oComboBox.open();
		this.clock.tick(0);
		var fnFireChangeSpy = this.spy(oComboBox, "fireChange");
		oComboBox.updateDomValue("change the value");
		var oControlEvent = new Event("selectionChange", oComboBox._getList(), {
			listItem: ListHelpers.getListItem(oItem)
		});

		// act
		oComboBox.onSelectionChange(oControlEvent);

		// assert
		assert.strictEqual(fnFireChangeSpy.args[0][0].itemPressed, true);

		// cleanup
		oComboBox.destroy();
		oControlEvent.destroy();
	});

	QUnit.module("onItemPress", {
		beforeEach: function () {
			this.clock = sinon.useFakeTimers();
		},
		afterEach: function () {
			fnRunAllTimersAndRestore(this.clock);
		}
	});

	QUnit.test("onItemPress should fire change when the first filtered item is clicked.", async function (assert) {

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
		await nextUIUpdate(this.clock);

		// act
		oComboBox.focus();
		oComboBox.open();
		this.clock.tick(1000);
		oComboBox.getFocusDomRef().value = "A";
		qutils.triggerEvent("input", oComboBox.getFocusDomRef());
		this.clock.tick(1000);

		var oListItem = ListHelpers.getListItem(oComboBox.getItems()[0]);
		oComboBox._getList().fireItemPress({listItem: oListItem});

		// assert
		assert.strictEqual(fnFireChangeSpy.callCount, 1, 'The "change" event is fired when the first filtered item is pressed');

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("onItemPress should fire change when the first filtered item is clicked - mobile", async function (assert) {
		// system under test
		this.stub(Device, "system").value({
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
		await nextUIUpdate(this.clock);

		// act
		oComboBox.focus();
		oComboBox.open();
		this.clock.tick(1000);
		oComboBox.getFocusDomRef().value = "A";
		qutils.triggerEvent("input", oComboBox.getFocusDomRef());

		var oListItem = ListHelpers.getListItem(oComboBox.getItems()[0]);
		oComboBox._getList().fireItemPress({listItem: oListItem});

		// assert
		assert.strictEqual(fnFireChangeSpy.callCount, 1, 'The "change" event is fired when the first filtered item is pressed');

		// wait 1s before destroying the combobox, so the sap.m.Dialog has time to close
		this.clock.tick(1000);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.module("onPropertyChange");

	QUnit.test("it should propagate some property changes to the picker text field", function (assert) {

		this.stub(Device, "system").value({
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

		this.stub(Device, "system").value({
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

	QUnit.test("restore items visibility after rendering", async function (assert) {

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
		await nextUIUpdate();

		// act
		oItem.bVisible = false;
		oComboBox.invalidate();
		await nextUIUpdate();

		// assert
		assert.strictEqual(oItem.bVisible, false);

		// cleanup
		oComboBox.destroy();
	});

	QUnit.module("getAccessibilityInfo");

	QUnit.test("getAccessibilityInfo", function (assert) {
		var oRb = Library.getResourceBundleFor("sap.m");
		var oComboBox = new ComboBox({
			value: "Value",
			tooltip: "Tooltip",
			placeholder: "Placeholder"
		});
		assert.ok(!!oComboBox.getAccessibilityInfo, "ComboBox has a getAccessibilityInfo function");
		var oInfo = oComboBox.getAccessibilityInfo();
		assert.ok(!!oInfo, "getAccessibilityInfo returns a info object");
		assert.strictEqual(oInfo.role, oComboBox.getRenderer().getAriaRole(), "AriaRole");
		assert.strictEqual(oInfo.type, oRb.getText("ACC_CTR_TYPE_COMBO"), "Type");
		assert.strictEqual(oInfo.description, "Value", "Description");
		assert.strictEqual(oInfo.focusable, true, "Focusable");
		assert.strictEqual(oInfo.enabled, true, "Enabled");
		assert.strictEqual(oInfo.editable, true, "Editable");
		oComboBox.setValue("");
		oComboBox.setEnabled(false);
		oInfo = oComboBox.getAccessibilityInfo();
		assert.strictEqual(oInfo.description, oRb.getText("INPUTBASE_VALUE_EMPTY"), "Description");
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

	QUnit.test("Role combobox should be on the wrapper div of the input", async function (assert) {
		var oComboBox = new ComboBox();
		oComboBox.placeAt("content");
		await nextUIUpdate();

		assert.strictEqual(oComboBox.getFocusDomRef().getAttribute("role"), "combobox", "should be combobox");
		assert.strictEqual(oComboBox.getFocusDomRef().getAttribute("type"), "text", "should be text");
		oComboBox.destroy();
	});

	QUnit.test("Aria-haspopup dialog should be set on the wrapper div of the input", async function (assert) {
		var oComboBox = new ComboBox();
		oComboBox.placeAt("content");
		await nextUIUpdate();

		assert.strictEqual(oComboBox.getFocusDomRef().getAttribute("aria-haspopup"), "dialog", "aria-haspopup should equal to dialog");
		oComboBox.destroy();
	});

	QUnit.test("Arrow down button should be a span with a role button", async function (assert) {
		var oComboBox = new ComboBox(),
			oArrowSpan;

		oComboBox.placeAt("content");
		await nextUIUpdate();
		oArrowSpan = oComboBox.getDomRef("arrow");

		assert.strictEqual(oArrowSpan.tagName.toLowerCase(), "span", "tag should be span");
		assert.strictEqual(oArrowSpan.getAttribute("role"), "button", "role should be button");
		oComboBox.destroy();
	});

	QUnit.test("aria-controls attribute should be set when the picker is open for the first time", async function (assert) {
		//arrange
		var oComboBox = new ComboBox();

		oComboBox.placeAt("content");
		await nextUIUpdate();

		// assert
		assert.notOk(oComboBox.getFocusDomRef().getAttribute("aria-controls"), 'The "aria-controls" should not be set before picker creation');

		//act
		oComboBox.open();
		await nextUIUpdate();

		// assert
		assert.strictEqual(oComboBox.getFocusDomRef().getAttribute("aria-controls"), oComboBox.getPicker().getId(), 'The "aria-controls" should be');

		//clean up
		oComboBox.destroy();
	});

	QUnit.test("It should add a hidden text to the Picker ", async function (assert) {
		var oItem = new Item({
			key: "li",
			text: "lorem ipsum"
		}), oComboBox = new ComboBox({
			items: [
				oItem
			]
		}), oResourceBundle = Library.getResourceBundleFor("sap.m").getText("COMBOBOX_AVAILABLE_OPTIONS");

		oComboBox.placeAt("content");
		await nextUIUpdate();

		assert.equal(Element.getElementById(oComboBox.getPickerInvisibleTextId()).getText(), oResourceBundle, 'popup ariaLabelledBy is set');

		oComboBox.destroy();
	});

	QUnit.test("ariaLabelledBy attribute of the combobox must be set to the according label id", async function (assert) {
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
		await nextUIUpdate();
		var sAriaLabelledBy = oComboBox.getDomRef("arrow").getAttribute("aria-labelledby").split(" ");
		assert.ok(sAriaLabelledBy.indexOf(oLabel.getId()) > -1, "ComboBox aria-labelledby attribute is set to label id");

		oLabel.destroy();
		oComboBox.destroy();
	});

	QUnit.test("Check list 'role' attributes", async function(assert) {
		this.clock = sinon.useFakeTimers();
		// system under test
		var oComboBox = new ComboBox({
			items: [
				new SeparatorItem({
					text: "Group Header"
				}),
				new Item({
					key: "0",
					text: "item 0"
				}),
				new Item({
					key: "1",
					text: "item 1"
				})
			]
		}), oList;

		// arrange
		oComboBox.placeAt("content");
		await nextUIUpdate(this.clock);

		// act
		oComboBox.open();
		this.clock.tick(10);

		oList = oComboBox._getList();

		// Assert
		assert.strictEqual(oList.$('listUl').attr("role"), "listbox", "role='listbox' applied to list control DOM");
		assert.strictEqual(oList.getItems()[0].$().attr("role"), "group", "role='group' applied to the group header");
		assert.strictEqual(oList.getItems()[1].$().attr("role"), "option", "role='option' applied to the items");

		// Cleanup
		oComboBox.destroy();
		fnRunAllTimersAndRestore(this.clock);
	});

	QUnit.test("aria-hidden attribute of the ComboBox dropdown icon must be set to true", async function (assert) {
		var oComboBox = new ComboBox({
			id: "simple-cbox"
		});

		oComboBox.placeAt("content");
		await nextUIUpdate();

		var bAriaHidden = oComboBox.getDomRef().querySelector(".sapMInputBaseIconContainer").getAttribute("aria-hidden");

		assert.strictEqual(bAriaHidden, "true", "aria-hidden is set to true");

		oComboBox.destroy();
	});

	QUnit.module("Integration", {
		afterEach: function () {
			fnRunAllTimersAndRestore(this.clock);
		}
	});

	QUnit.test("Propagate Items to the list", async function (assert) {
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
					new Item({key: "D", text: "Date"}),
					new Item({key: "D1", text: "Disabled 1", enabled: false}),
					new Item({key: "D2", text: "Disabled 2", enabled: false})
				]
			});
		oComboBox.placeAt("content");
		await nextUIUpdate();

		// Assert
		assert.ok(!oComboBox._getList(), "No list available on init (lazy loading)");


		// Act (init the SuggestionPopover with the List)
		oComboBox.syncPickerContent();
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oComboBox.getItems().length - 2, oComboBox._getList().getVisibleItems().length, "On init the List item should be the same as the enabled core items");

		// Act
		oComboBox.open();
		assert.strictEqual(oComboBox.getVisibleItems().length, oComboBox._getList().getVisibleItems().length, "ComboBox should not display disabled items as a suggestions");
		await nextUIUpdate();

		// Act
		vTemp = oComboBox.removeAllItems();
		oComboBox.syncPickerContent();
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oComboBox.getItems().length, oComboBox._getList().getItems().length, "The List item should be the same as core items");
		assert.strictEqual(oComboBox.getItems().length, 0, "The Items aggregation should be empty");
		assert.strictEqual(vTemp.length, 5, "The items from the combobox should be returned by the removeAllItems method");

		// Act
		vTemp = aItems.pop();
		oComboBox.addItem(vTemp);
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oComboBox.getItems().length, oComboBox._getList().getItems().length, "The List item should be the same as core items");
		assert.strictEqual(oComboBox.getItems().length, 1, "The Items aggregation should have 1 item");

		// Act
		oComboBox.removeItem(vTemp);
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oComboBox.getItems().length, oComboBox._getList().getItems().length, "The List item should be the same as core items");
		assert.strictEqual(oComboBox.getItems().length, 0, "The Items aggregation should be empty");

		// Act
		oComboBox.insertItem(aItems[0]);
		oComboBox.insertItem(aItems[1]);
		oComboBox.insertItem(aItems[2], 1);
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oComboBox.getItems().length, oComboBox._getList().getItems().length, "The List item should be the same as core items");
		assert.strictEqual(oComboBox.getItems().length, 3, "The Items aggregation should have 3 items");
		assert.strictEqual(oComboBox._getList().getItems()[0].getTitle(), "List", "Properly insert and position items in the list");

		// Act
		oComboBox.destroyItems();
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oComboBox.getItems().length, oComboBox._getList().getItems().length, "The List item should be the same as core items");
		assert.strictEqual(oComboBox.getItems().length, 0, "The Items aggregation should be empty");

		oComboBox.destroy();
		oComboBox = null;
		await nextUIUpdate();
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

	QUnit.test("Clone combobox with preselected item", async function (assert) {
		var oItem = new Item({
			text: "Dryanovo",
			key: "1"
		});

		var oCB = new ComboBox({
			items: [oItem],
			selectedItem: oItem
		}).placeAt("content");

		await nextUIUpdate();

		var oClone = oCB.clone();
		oClone.placeAt("content");
		await nextUIUpdate();

		assert.strictEqual(oClone.getValue(), "Dryanovo", "Value should be kept");
		assert.strictEqual(oClone.getSelectedItem().getText(), "Dryanovo", "Selected item should be cloned");

		oClone.destroy();
		oCB.destroy();
	});

	QUnit.test("Keep selected value on parent re-render", async function (assert) {
		this.clock = sinon.useFakeTimers();
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
				oForm.invalidate();
			}
		});
		oComboBox.syncPickerContent();


		var oForm = new SimpleForm({
			content: [oComboBox]
		}).placeAt('content');

		await nextUIUpdate(this.clock);

		var oListItem = ListHelpers.getListItem(oComboBox.getItems()[1]);
		oComboBox._getList().fireItemPress({listItem: oListItem});
		oComboBox._getList().fireSelectionChange({listItem: oListItem});
		this.clock.tick(0);

		assert.ok(oComboBox.getValue(), "ComboBox value to be filled in");
		assert.strictEqual(oComboBox.getValue(), oComboBox.getItems()[1].getText(), "ComboBox value to be the same as the selected element");

		oForm.destroy();
		oComboBox.destroy();
		oForm = null;
		oComboBox = null;
	});

	QUnit.test("Keep the focus on the input", async function (assert) {
		this.clock = sinon.useFakeTimers();
		this.stub(Device, "system").value({
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
		await nextUIUpdate(this.clock);

		oCB.focus();

		oCB.open();
		this.clock.tick(500);

		oCB.close();
		this.clock.tick(500);

		assert.ok(containsOrEquals(oCB.getDomRef(), document.activeElement), "Focus is still inside the ComboBox after open and close");

		oCB.destroy();
	});

	QUnit.test("Changing models should not resets the selection if item is not there", async function (assert) {
		this.clock = sinon.useFakeTimers();
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
		await nextUIUpdate(this.clock);
		this.clock.tick(100);

		//Assert
		assert.ok(!oComboBox.getSelectedItem(), "No item is currently selected");
		assert.ok(!oComboBox.getSelectedKey(), "No item is currently selected");

		//Act
		oComboBox.setSelectedKey("1");
		await nextUIUpdate(this.clock);
		this.clock.tick(100);

		//Assert
		assert.ok(oComboBox.getSelectedKey(), "Item is selected");
		assert.strictEqual(oComboBox.getSelectedItem().getKey(), "1", "Item 1 is selected");

		//Act
		oComboBox.getModel().setProperty("/list", [{id: "2", text: "2"}]);
		await nextUIUpdate(this.clock);
		this.clock.tick(100);

		//Assert
		assert.ok(oComboBox.getSelectedItem(), "Item remains selected");
		assert.ok(oComboBox.getSelectedKey(), "selectedKey is not reset");

		//Cleanup
		oComboBox.destroy();
	});

	QUnit.test("Changing models keeps the value", async function (assert) {
		this.clock = sinon.useFakeTimers();
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
		await nextUIUpdate(this.clock);
		this.clock.tick(100);

		//Assert
		assert.ok(!oComboBox.getSelectedKey(), "There is no selected item.");
		assert.ok(!oComboBox.getSelectedItem(), "There is no selected key.");

		oComboBox.setValue("test");

		//Act
		oComboBox.getModel().setProperty("/list", [{id: "2", text: "2"}, {id: "33", text: "33"}]);
		await nextUIUpdate(this.clock);
		this.clock.tick(100);

		//Assert
		assert.ok(!oComboBox.getSelectedKey(), "There is no selected item.");
		assert.ok(!oComboBox.getSelectedItem(), "There is no selected key.");
		assert.strictEqual(oComboBox.getValue(), "test", "Value is not reset.");

		//Cleanup
		oComboBox.destroy();
	});

	QUnit.test("Changing models keeps the selection if item is there", async function (assert) {
		this.clock = sinon.useFakeTimers();
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
		await nextUIUpdate(this.clock);
		this.clock.tick(100);

		//Assert
		assert.ok(oComboBox.getSelectedKey(), "Item is selected");
		assert.strictEqual(oComboBox.getSelectedItem().getKey(), "2", "Item 2 is selected");

		//Act
		oComboBox.getModel().setProperty("/list", [{id: "2", text: "2"}, {id: "33", text: "33"}]);
		await nextUIUpdate(this.clock);
		this.clock.tick(100);

		//Assert
		assert.ok(oComboBox.getSelectedKey(), "Item is still selected");
		assert.strictEqual(oComboBox.getSelectedItem().getKey(), "2", "Item 2 is still selected");

		//Cleanup
		oComboBox.destroy();
	});

	QUnit.test("Changing models reflects on bound selectedKey property", async function (assert) {
		this.clock = sinon.useFakeTimers();
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
		await nextUIUpdate(this.clock);
		this.clock.tick(100);

		//Assert
		assert.ok(oComboBox.getSelectedKey(), "Item is selected");
		assert.strictEqual(oComboBox.getSelectedItem().getKey(), "2", "Item 2 is selected");

		//Act
		oComboBox.getModel().setProperty("/list", [{id: "2", text: "2"}, {id: "3", text: "3"}]);
		oComboBox.getModel().setProperty("/selectedKey", "3");

		await nextUIUpdate(this.clock);
		this.clock.tick(100);

		//Assert
		assert.strictEqual(oComboBox.getSelectedItem().getKey(), "3", "Item 3 is selected");

		//Cleanup
		oComboBox.destroy();
	});

	QUnit.test("Matching item should be selected when deleting input with backspace", async function (assert) {
		// setup
		var oItem = new Item({
			text: "Test",
			key: "T"
		});
		var oComboBox = new ComboBox({
			value: "Testt",
			items: [oItem]
		}).placeAt("content");
		await nextUIUpdate();

		// act
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.BACKSPACE);
		oComboBox.getFocusDomRef().value = "Test";
		qutils.triggerEvent("input", oComboBox.getFocusDomRef(), {
			value: "Test"
		});

		// assert
		assert.ok(oComboBox.getSelectedItem(), "Selected Item should not be falsy");
		assert.equal(oComboBox.getSelectedItem().getText(), oItem.getText(), "First item's text should be selected");
		assert.equal(oComboBox.getSelectedKey(), oItem.getKey(), "First item's key should be selected");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.module("Tablet focus handling", {
		afterEach: function () {
			fnRunAllTimersAndRestore(this.clock);
		}
	});

	QUnit.test("it should not set the focus to the input", async function (assert) {
		this.stub(Device, "system").value({
			desktop: false,
			tablet: true,
			phone: false
		});

		var oComboBox = new ComboBox(),
			oFakeEvent = null,
			oFocusinStub = this.stub(oComboBox, "focus");

		oComboBox.placeAt("content");
		await nextUIUpdate();

		oFakeEvent = {target: oComboBox.getDomRef("arrow")};

		oComboBox.onfocusin(oFakeEvent);

		assert.strictEqual(oFocusinStub.callCount, 0, "Focus should not be called");

		oComboBox.destroy();
	});

	QUnit.test("it should has initial focus set to the input", async function (assert) {
		this.stub(Device, "system").value({
			desktop: false,
			tablet: true,
			phone: false
		});

		var oComboBox = new ComboBox();
		oComboBox.syncPickerContent();

		oComboBox.placeAt("content");
		await nextUIUpdate();

		assert.strictEqual(oComboBox.getPicker().getInitialFocus(), oComboBox.getId());

		oComboBox.destroy();
	});

	QUnit.test("it should initially focus the picker", async function (assert) {
		this.stub(Device, "system").value({
			desktop: false,
			tablet: true,
			phone: false
		});

		var oComboBox = new ComboBox(),
			oFakeEvent;

		oComboBox.syncPickerContent();
		oComboBox.placeAt("content");
		await nextUIUpdate();

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

	QUnit.test("The picker should open when icon is pressed", async function (assert) {
		this.stub(Device, "system").value({
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
		await nextUIUpdate();

		oComboBox._handlePopupOpenAndItemsLoad(false);

		assert.ok(oComboBox.isOpen(), "ComboBox is open");
		assert.ok(oComboBox.$().hasClass(InputBase.ICON_PRESSED_CSS_CLASS));

		oComboBox.destroy();
	});

	QUnit.test("one visual focus should be shown in the control", async function (assert) {
		this.clock = sinon.useFakeTimers();
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
		await nextUIUpdate(this.clock);

		// act
		oComboBox.getFocusDomRef().value = "A";
		qutils.triggerEvent("input", oComboBox.getFocusDomRef());
		await nextUIUpdate(this.clock);

		// assert
		oList = oComboBox._getList();
		assert.ok(oComboBox.$().hasClass("sapMFocus"), "The input field should have visual focus.");
		assert.notOk(oList.hasStyleClass("sapMListFocus"), "The list should not have .sapMListFocus applied.");
		assert.strictEqual(oList.$().find(".sapMLIBSelected").length, 1, "The list items should be selected but without focus outline.");

		// act
		oComboBox.getFocusDomRef().value = "AC";
		qutils.triggerEvent("input", oComboBox.getFocusDomRef());
		await nextUIUpdate(this.clock);

		// assert
		assert.ok(oComboBox.$().hasClass("sapMFocus"), "The input field should have visual focus.");
		assert.notOk(oList.hasStyleClass("sapMListFocus"), "The list should not have .sapMListFocus applied.");
		assert.strictEqual(oList.$().find(".sapMLIBSelected").length, 0, "There is no list items in the list.");

		// clean up
		oComboBox.destroy();
	});

	QUnit.test("one visual focus should be shown in the control after selection", async function (assert) {
		this.clock = sinon.useFakeTimers();
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

		await nextUIUpdate(this.clock);

		// act
		oComboBox.focus();
		oComboBox.open();
		this.clock.tick(2000);

		qutils.triggerEvent("tap", ListHelpers.getListItem(oComboBox.getFirstItem()).getDomRef());
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

	QUnit.test("one visual focus should be shown in the control when an item is selected", async function (assert) {
		this.clock = sinon.useFakeTimers();
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

		await nextUIUpdate(this.clock);

		oComboBox.setSelectedItem(oItem1);
		this.clock.tick(500);

		// act
		oComboBox.focus();
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

	QUnit.test("Disabled ComboBox should not have focus", async function (assert) {

		// system under test
		var oComboBox = new ComboBox({
			enabled: false
		});

		// arrange
		oComboBox.placeAt("content");
		await nextUIUpdate();

		// act
		qutils.triggerEvent("focusin", oComboBox.getOpenArea(), {
			target: oComboBox.getOpenArea()
		});

		// assert
		assert.ok(!oComboBox.$().hasClass("sapMFocus"), "The input field should not have visual focus.");

		// cleanup
		oComboBox.destroy();
	});


	QUnit.module("highlighting", {
		afterEach: function () {
			fnRunAllTimersAndRestore(this.clock);
		}
	});

	QUnit.test("highlightList doesn't throw an error when showSecondaryValues=true and sap.ui.core.Item is set", async function (assert) {
		this.clock = sinon.useFakeTimers();
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
		await nextUIUpdate(this.clock);
		oComboBox.focus();

		// act
		oComboBox.open();
		this.clock.tick(1000);

		// assert
		assert.strictEqual(fnOnAfterOpenSpy.callCount, 1, "onAfterOpen() called exactly once");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("highlightList doesn't throw an error when combobox's value contains special characters", async function (assert) {
		this.clock = sinon.useFakeTimers();
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
		await nextUIUpdate(this.clock);
		oComboBox.highlightList("(T");

		// act
		oComboBox.open();
		this.clock.tick(1000);

		// assert
		assert.strictEqual(fnOnAfterOpenSpy.callCount, 1, "onAfterOpen() called exactly once");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("highlighting first letter of a word should be applied", async function (assert) {
		var oComboBox = new ComboBox({
			items: [
				new Item({ text: "Bulgaria" })
			]
		});

		oComboBox.placeAt("content");
		await nextUIUpdate();

		var oFocusDomRef = oComboBox.getFocusDomRef();

		oFocusDomRef.value = "b";
		qutils.triggerEvent("input", oFocusDomRef);
		await nextUIUpdate();

		var highlightedPart = oComboBox._getList().getItems()[0].getDomRef().querySelector(".sapMInputHighlight");

		assert.strictEqual(highlightedPart.innerText, "B", "B should be highlighted");

		oComboBox.destroy();
	});

	QUnit.module("setFilter", {
		beforeEach: async function () {
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

			this.oComboBox.syncPickerContent();
			this.oComboBox.placeAt("content");
			await nextUIUpdate();
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
			fnWarningSpy = this.spy(log, "warning");

		// null is passed for a filter
		this.oComboBox.setFilterFunction(null);
		assert.notOk(fnWarningSpy.called, "Warning should not be logged in the console when filter is null");

		this.oComboBox.filterItems("");
		assert.notOk(this.oComboBox.fnFilter, "Default text filter should be applied, since fnFilter is not set");

		// undefined is passed for a filter
		this.oComboBox.setFilterFunction(undefined);
		assert.notOk(fnWarningSpy.called, "Warning should not be logged in the console when filter is undefined");

		this.oComboBox.filterItems("");
		assert.notOk(this.oComboBox.fnFilter, "Default text filter should be applied, since fnFilter is not set");

		// wrong filter type is passed
		this.oComboBox.setFilterFunction({});
		assert.ok(fnWarningSpy.called, "Warning should be logged in the console when filter is not a function");

		this.oComboBox.filterItems("");
		assert.notOk(this.oComboBox.fnFilter, "Default text filter should be applied, since fnFilter is not set");
	});

	QUnit.test("Setting a valid filter should apply on items", function (assert) {
		var fnFilterSpy = this.spy();

		// null is passed for a filter
		this.oComboBox.setFilterFunction(fnFilterSpy);

		// act
		var aFilteredItems = this.oComboBox.filterItems("B").items;

		assert.ok(fnFilterSpy.called, "Filter should be called");
		assert.strictEqual(aFilteredItems.length, 0, "Zero items should be filtered");
	});

	QUnit.test("Setting a valid filter should apply on items and their text", async function (assert) {
		this.oComboBox.setFilterSecondaryValues(true);
		await nextUIUpdate();

		// act
		var aFilteredItems = this.oComboBox.filterItems("B").items;

		// assert
		assert.strictEqual(aFilteredItems.length, 2, "Two items should be filtered");
		assert.strictEqual(aFilteredItems[0].getText(), "Baragoi", "Text should start with B");
		assert.strictEqual(aFilteredItems[1].getAdditionalText(), "Bulgaria", "Additional text should start with B");
	});

	QUnit.test("Default filtering should be per term", function (assert) {
		var aFilteredItems = this.oComboBox.filterItems("K").items;

		assert.strictEqual(aFilteredItems.length, 1, "One item should be filtered");
		assert.strictEqual(aFilteredItems[0].getText(), "Hong Kong", "Hong Kong item is matched by 'K'");
	});

	QUnit.test("Adding a special character should not throw an exception", function (assert) {

		var oFocusDomRef = this.oComboBox.getFocusDomRef();

		oFocusDomRef.value = "*";
		qutils.triggerEvent("input", oFocusDomRef);

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

	QUnit.test("handleInputValidation shouldn't throw an error and reset the selection", function (assert) {
		var oFakeEvent = {
			target: {
				value: "k"
			},
			srcControl: this.oComboBox
		},
			oSetSelectionSpy = sinon.spy(this.oComboBox, "setSelection");

		// Arrange
		this.oComboBox._bDoTypeAhead = false;

		// Act
		this.oComboBox.handleInputValidation(oFakeEvent, false);

		// Assert
		assert.ok(oSetSelectionSpy.calledWith(null), "Selected key should be reset");

		oSetSelectionSpy.restore();
	});

	QUnit.module("Input Text Selecting without data binding", {
		beforeEach: async function () {
			this.clock = sinon.useFakeTimers();
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

			await nextUIUpdate(this.clock);
		},
		afterEach: function () {
			this.comboBox.destroy();
			this.comboBox = null;
			fnRunAllTimersAndRestore(this.clock);
		}
	});

	QUnit.test('Selection when typing and focus in', function (assert) {
		// Act
		this.comboBox._$input.trigger("focus").val("a").trigger("input");
		this.clock.tick(100);
		var selectedText = this.comboBox._$input.getSelectedText();

		// Assert
		assert.equal(selectedText, "", "There is no selected text when matching a suggestion");

		// Act
		this.comboBox._$input.trigger("focus").val("aa").trigger("input");
		this.clock.tick(100);
		selectedText = this.comboBox._$input.getSelectedText();

		// Assert
		assert.equal(selectedText, "a", "The next suggestions is autocompleted");

		// Act
		this.comboBox._$input.trigger("focus").val("aaaa").trigger("input");
		this.clock.tick(100);
		selectedText = this.comboBox._$input.getSelectedText();

		// Assert
		assert.equal(selectedText, "", "There is no selected text when matching a suggestion");

		if (!Device.browser.safari) { // Safari has issues with the cursor when the page is not "manually" focused
			// Act
			this.comboBox.onsapfocusleave({});
			this.clock.tick(500);
			this.comboBox._$input.trigger("focus");
			this.comboBox.onfocusin({});
			this.comboBox.onmouseup({});
			this.clock.tick(500);

			selectedText = this.comboBox._$input.getSelectedText();

			// Assert
			assert.equal(selectedText, "aaaa", "The text inside the combo box is selected on focus in");
		}
	});

	QUnit.module("Selection when typing non ASCII characters", {
		beforeEach: async function () {
			this.clock = sinon.useFakeTimers();
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

			await nextUIUpdate(this.clock);
		},
		afterEach: function () {
			this.comboBox.destroy();
			this.comboBox = null;
			fnRunAllTimersAndRestore(this.clock);
		}
	});

	QUnit.test('Input text selection "without" re-rendering on selection change', async function (assert) {
		this.comboBox._$input.trigger("focus").val("n").trigger("input");
		await nextUIUpdate(this.clock);
		this.clock.tick(500);

		var selectedText = this.comboBox._$input.getSelectedText();
		assert.equal(selectedText, "äme", "Selected text is correct");
	});

	QUnit.test('Input text selection "with" re-rendering on selection change', async function (assert) {
		this.comboBox.attachEvent('selectionChange', function () {
			this.comboBox.invalidate();
		}.bind(this));

		this.comboBox._$input.trigger("focus").val("n").trigger("input");
		await nextUIUpdate(this.clock);
		this.clock.tick(500);

		var selectedText = this.comboBox._$input.getSelectedText();
		assert.equal(selectedText, "äme", "Selected text is correct");
	});

	QUnit.module("Composition characters handling", {
		beforeEach: async function () {
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

			await nextUIUpdate();
		},
		afterEach: function () {
			this.comboBox.destroy();
			this.comboBox = null;
			fnRunAllTimersAndRestore(this.clock);
		}
	});

	QUnit.test("Filtering", function (assert) {
		this.comboBox.syncPickerContent();

		// act
		var bMatched = inputsDefaultFilter("서", this.comboBox.getItems()[0], "getText");
		var aFilteredItems = this.comboBox.filterItems("서").items;

		// assert
		assert.ok(bMatched, "'inputsDefaultFilter' should match composite characters");
		assert.strictEqual(aFilteredItems.length, 2, "Two items should be filtered");
		assert.strictEqual(aFilteredItems[0].getText(), "서비스 ID", "Text should start with 서");
	});

	QUnit.test("Composititon events", function (assert) {
		this.clock = sinon.useFakeTimers();
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
			oListItem;

		// act
		oListItem = this.oComboBox._mapItemToListItem(oItem);

		// assert
		assert.ok(oListItem.isA("sap.m.StandardListItem"), "The ListItem is of type 'sap.m.StandardListItem'.");
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
			oListItem;

		// act
		oListItem = this.oComboBox._mapItemToListItem(oItem);

		// assert
		assert.ok(oListItem.isA("sap.m.GroupHeaderListItem"), "The ListItem is of type 'sap.m.GroupHeaderListItem'.");
		assert.strictEqual(oListItem.getTitle(), "Group header text", "The title of the GroupHeaderListItem was set correctly.");
	});

	QUnit.test("forwards custom data to StandardListItem.", async function (assert) {
		//default scenario using strings
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

		// data binding scenario
		var oData = {
				items: [
					{key: "0", text: "Lorem", value: "bindingValue"}
				]
			}, oModel = new JSONModel(oData);

		var oComboBox = new ComboBox({
			items: {
				path: "/items",
				template: new Item({
					key: "{key}",
					text: "{text}",
					customData: [
						new CustomData({
							key:"bindingKey",
							value:"{value}",
							writeToDom: true
						})
					]})
			}
		}).setModel(oModel);
		oComboBox.placeAt("content");
		await nextUIUpdate();

		var oItem1 = oComboBox.getItems()[0],
			oListItem1 = oComboBox._mapItemToListItem(oItem1);

		// assert
		assert.strictEqual(oListItem1.data("bindingKey"), "bindingValue", "The binding was resolved and the resulting value was properly set.");

		oItem.destroy();
		oListItem.destroy();
		oListItem1.destroy();
		oComboBox.destroy();
	});

	QUnit.module("Property forwarding from Item to ListItem", {
		beforeEach: function () {
			this.oComboBox = new ComboBox();
		},
		afterEach: function () {
			this.oComboBox.destroy();
		}
	});

	QUnit.test("Direct property forwarding", async function (assert) {
		// system under test
		var oItem = new Item({
				text: "Item Title",
				enabled: true,
				tooltip: "Tooltip Text"
			}), oListItem;

		this.oComboBox.addItem(oItem);
		oListItem = this.oComboBox._mapItemToListItem(oItem);
		await nextUIUpdate();

		// act
		oItem.setText("New Item Title");
		oItem.setTooltip("New Tooltip Text");
		oItem.setEnabled(false);
		await nextUIUpdate();

		// assert
		assert.strictEqual(oListItem.getTitle(), "New Item Title", "The list item title is updated.");
		assert.strictEqual(oListItem.getTooltip(), "Tooltip Text", "The tooltip is updated.");
		assert.notOk(oListItem.getVisible(), "The list item is not visible.");
	});

	QUnit.test("Additional text forwarding", async function (assert) {
		// system under test
		var oItem = new ListItem({
			text: "Item Title"
		}), oListItem;

		this.oComboBox.addItem(oItem);
		this.oComboBox.setShowSecondaryValues(true);
		oListItem = this.oComboBox._mapItemToListItem(oItem);
		await nextUIUpdate();

		// act
		oItem.setAdditionalText("New additional text");
		await nextUIUpdate();

		// assert
		assert.strictEqual(oListItem.getInfo(), "New additional text", "The list item info is updated.");
	});

	QUnit.test("Item should be marked as selectable after changing of enabled property", async function (assert) {
		this.clock = sinon.useFakeTimers();
		var oItem = new Item({
			text: "Item 2",
			enabled: false
		});

		var oComboBox = new ComboBox({
			items: [
				new Item({
					text: "Item 1"
				}),
				oItem
			]
		});

		var openComboBox = function () {
			oComboBox.focus();
			oComboBox.open();
			this.clock.tick(500);
		}.bind(this);

		oComboBox.placeAt("content");
		await nextUIUpdate(this.clock);
		this.clock.tick(500);

		openComboBox();

		var oList = oComboBox._getList();
		var getVisibleListItems = function () {
			return oList.getItems().filter(function (oElement) {
				return oElement.getVisible();
			}).length;
		};

		assert.strictEqual(getVisibleListItems(), 1, "One item should be visible");

		oItem.setEnabled(true);
		await nextUIUpdate(this.clock);
		oComboBox.close();

		openComboBox();
		assert.strictEqual(getVisibleListItems(), 2, "Two items should be visible");

		oComboBox.destroy();
		fnRunAllTimersAndRestore(this.clock);
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
		beforeEach: async function () {
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
			await nextUIUpdate();
		},
		afterEach: function () {
			// clean
			this.oComboBox.destroy();
			fnRunAllTimersAndRestore(this.clock);
		}
	});

	QUnit.test("Group header's labelledBy", function (assert) {
		var oGroupHeader = this.oComboBox._getList().getItems()[0],
			oListItem = this.oComboBox._getList().getItems()[1],
			sInvisibleTextId = this.oComboBox._getGroupHeaderInvisibleText().getId();

		assert.strictEqual(oGroupHeader.getAriaLabelledBy()[0], sInvisibleTextId, "The correct invisible text is associated with the group item.");
		assert.notOk(oListItem.getAriaLabelledBy().length, "The ListItem should not have an aria-labelledby.");
	});

	QUnit.test("Group header's labelledBy text and aria-activedescendant reference", function (assert) {
		this.clock = sinon.useFakeTimers();
		var oGroupHeaderListItem, oInvisibleText,
			oFocusDomRef = this.oComboBox.getFocusDomRef(),
			oSeparatorItem = this.oComboBox._getList().getItems()[0],
			oExpectedLabel = Library.getResourceBundleFor("sap.m").getText("LIST_ITEM_GROUP_HEADER") + " " + oSeparatorItem.getTitle(),
			sExpectedActiveDescendantId;

		// arrange
		this.oComboBox.focus();
		this.clock.tick();

		// act
		qutils.triggerKeydown(oFocusDomRef, KeyCodes.F4);
		this.clock.tick(500);

		assert.ok(this.oComboBox.isOpen(), "The combo box's picker is opened.");
		qutils.triggerKeydown(oFocusDomRef, KeyCodes.ARROW_UP);

		oGroupHeaderListItem = this.oComboBox._getList().getItems()[0];
		oInvisibleText = Element.getElementById(oGroupHeaderListItem.getAriaLabelledBy()[0]);
		sExpectedActiveDescendantId = oGroupHeaderListItem.getId();

		// assert
		assert.strictEqual(oInvisibleText.getText(), oExpectedLabel, "The correct invisible text is associated with the group item.");
		assert.strictEqual(this.oComboBox.getFocusDomRef().getAttribute("aria-activedescendant"), sExpectedActiveDescendantId, "aria-activedescendent is correctly set to the group header");
	});

	QUnit.test("Group header shown when filtering", function (assert) {
		assert.expect(4);
		var aItems;

		// act
		itemsVisibilityHandler(this.oComboBox.getItems(), this.oComboBox.filterItems("item1"));

		aItems = ListHelpers.getVisibleItems(this.oComboBox.getItems());

		// assert
		this.fnCheckFilterWithGrouping(assert, aItems);
	});

	QUnit.test("onsapdown when picker closed should select first non separator item", function (assert) {
		this.clock = sinon.useFakeTimers();
		assert.expect(3);
		var oExpectedItem = this.oComboBox.getItems()[1],
			sExpectedValue = "item11";

		// arrange
		this.oComboBox.focus();
		this.clock.tick(0);

		// act
		qutils.triggerKeydown(this.oComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN);

		// assert
		this.fnCheckSelectedItemAndValue(assert, oExpectedItem, sExpectedValue);
	});

	QUnit.test("onsapdown when picker opened should move visual focus to the first selectable item (not to the group header)", function (assert) {
		this.clock = sinon.useFakeTimers();
		assert.expect(6);
		var oGroupHeaderItem, aItems, oSelectedItem;

		// arrange
		this.oComboBox.focus();
		this.clock.tick(0);

		// act
		qutils.triggerKeydown(this.oComboBox.getFocusDomRef(), KeyCodes.F4);
		this.clock.tick(500);
		assert.ok(this.oComboBox.isOpen(), "The combo box's picker is opened.");

		aItems = this.oComboBox._getList().getItems();
		oGroupHeaderItem = aItems[0];
		oSelectedItem = aItems[1];

		assert.notOk(oGroupHeaderItem.hasStyleClass("sapMLIBFocused"), "Visual focus moved to the group header item.");
		assert.ok(oSelectedItem.hasStyleClass("sapMLIBFocused"), "Visual focus moved to the first item.");

		// assert
		// no selection was made, the value is empty and the group header has the visual focus
		qutils.triggerKeydown(this.oComboBox.getFocusDomRef(), KeyCodes.ARROW_UP);
		this.fnCheckSelectedItemAndValue(assert, null, "");
	});

	QUnit.test("onsapdown twice when picker opened should move visual focus to the first item", function (assert) {
		this.clock = sinon.useFakeTimers();
		var oExpectedItem = this.oComboBox.getItems()[1],
			sExpectedValue = "item11",
			oExpectedListItem, oGroupHeaderListItem;

		// arrange
		this.oComboBox.focus();
		this.oComboBox.open();
		this.clock.tick(500);

		// act
		qutils.triggerKeydown(this.oComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN);
		this.clock.tick(500);
		qutils.triggerKeydown(this.oComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN);
		this.clock.tick(500);

		assert.ok(this.oComboBox.isOpen(), "The combo box's picker is opened.");
		oExpectedListItem = ListHelpers.getListItem(oExpectedItem);
		oGroupHeaderListItem = this.oComboBox._getList().getItems()[0];


		// assert
		this.fnCheckSelectedItemAndValue(assert, oExpectedItem, sExpectedValue);
		this.fnCheckVisualFocusedMoved(assert, oGroupHeaderListItem, oExpectedListItem);
	});

	QUnit.test("onsapdown when key already selected and picker is opened should move visual focus to the next item", function (assert) {
		this.clock = sinon.useFakeTimers();
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
		qutils.triggerKeydown(this.oComboBox.getFocusDomRef(), KeyCodes.F4);
		this.clock.tick(500);

		// assert
		assert.ok(this.oComboBox.isOpen(), "The combo box's picker is opened.");
		assert.ok(this.oComboBox.getSelectedItem() === oInitiallySelectedItem, "The expected item was initially selected.");
		assert.ok(this.oComboBox._getList().hasStyleClass("sapMListFocus"), "The visual focus was correctly on the combo box's list initially.");

		// act
		qutils.triggerKeydown(this.oComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN);
		oInitiallySelectedListItem = ListHelpers.getListItem(oInitiallySelectedItem);
		oExpectedListItem = ListHelpers.getListItem(oExpectedItem);

		// assert
		this.fnCheckSelectedItemAndValue(assert, oExpectedItem, sExpectedValue);
		this.fnCheckVisualFocusedMoved(assert, oInitiallySelectedListItem, oExpectedListItem);
	});

	QUnit.test("onsapup when key already selected and picker is opened should move visual focus to the previous item", function (assert) {
		this.clock = sinon.useFakeTimers();
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
		qutils.triggerKeydown(this.oComboBox.getFocusDomRef(), KeyCodes.F4);
		this.clock.tick(500);

		// assert
		assert.ok(this.oComboBox.isOpen(), "The combo box's picker is opened.");
		assert.ok(this.oComboBox.getSelectedItem() === oInitiallySelectedItem, "The expected item was initially selected.");
		assert.ok(this.oComboBox._getList().hasStyleClass("sapMListFocus"), "The visual focus was correctly on the combo box's list initially.");

		// act
		qutils.triggerKeydown(this.oComboBox.getFocusDomRef(), KeyCodes.ARROW_UP);
		oExpectedListItem = ListHelpers.getListItem(oExpectedItem);
		oInitiallySelectedListItem = ListHelpers.getListItem(oInitiallySelectedItem);

		// assert
		this.fnCheckSelectedItemAndValue(assert, oExpectedItem, sExpectedValue);
		this.fnCheckVisualFocusedMoved(assert, oInitiallySelectedListItem, oExpectedListItem);
	});

	QUnit.test("onsapup when key already selected and picker is closed should move visual focus to the previous item and skip group items", function (assert) {
		this.clock = sinon.useFakeTimers();
		assert.expect(4);
		var oExpectedItem = this.oComboBox.getItems()[2],
			oInitiallySelectedItem = this.oComboBox.getItems()[4],
			sExpectedValue = "item12";

		// arrange
		this.oComboBox.focus();
		this.oComboBox.setSelectedItem(oInitiallySelectedItem);
		this.clock.tick(0);

		// assert
		assert.ok(this.oComboBox.getSelectedItem() === oInitiallySelectedItem, "The expected item was initially selected.");

		// act
		qutils.triggerKeydown(this.oComboBox.getFocusDomRef(), KeyCodes.ARROW_UP);

		// assert
		this.fnCheckSelectedItemAndValue(assert, oExpectedItem, sExpectedValue);
	});

	QUnit.test("when focusing group header item with some input in the text field the input should stay", function (assert) {
		this.clock = sinon.useFakeTimers();
		var oExpectedItem = this.oComboBox.getItems()[0],
			oExpectedListItem = ListHelpers.getListItem(oExpectedItem),
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
		qutils.triggerKeydown(this.oComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN);

		// assert
		assert.strictEqual(this.oComboBox.getFocusDomRef().value, "it", "The expected text was filled in the combo box.");
		assert.strictEqual(jQuery(this.oComboBox.getFocusDomRef()).getSelectedText(), "", "Correct text was selected in the combo box.");
		assert.ok(this.oComboBox.getSelectedItem() === null, "The expected item was selected.");
		assert.ok(oExpectedListItem.hasStyleClass("sapMLIBFocused"), "The group header has visual focus");
	});

	QUnit.test("when moving through group header, the user input should stay and be autocompleted", function (assert) {
		this.clock = sinon.useFakeTimers();
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

		oExpectedListItem = ListHelpers.getListItem(oExpectedItem);

		this.oComboBox.oninput(oFakeEvent);
		this.clock.tick(0);

		// act
		qutils.triggerKeydown(this.oComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN);
		qutils.triggerKeydown(this.oComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN);

		// assert
		assert.strictEqual(this.oComboBox.getFocusDomRef().value, "item11", "The expected text was filled in the combo box.");
		assert.strictEqual(jQuery(this.oComboBox.getFocusDomRef()).getSelectedText(), "em11", "Correct text was selected in the combo box.");
		assert.ok(this.oComboBox.getSelectedItem() === oExpectedItem, "The expected item was selected.");
		assert.ok(oExpectedListItem.hasStyleClass("sapMLIBFocused"), "The item has visual focus");
	});

	QUnit.test("No double focus when last item before close was group header", function (assert) {
		this.clock = sinon.useFakeTimers();
		var oExpectedItem = this.oComboBox.getItems()[1],
			oExpectedSeparatorItem = this.oComboBox.getItems()[0],
			oFocusDomRef = this.oComboBox.getFocusDomRef(),
			oExpectedListItem, oExpectedListGroupHeader;

		// arrange
		this.oComboBox.focus();

		// act
		// Open it
		qutils.triggerKeydown(oFocusDomRef, KeyCodes.F4);
		this.clock.tick(500);
		// Select group header
		qutils.triggerKeydown(oFocusDomRef, KeyCodes.ARROW_UP);
		// Close it again
		qutils.triggerKeydown(oFocusDomRef, KeyCodes.F4);
		this.clock.tick(500);

		oExpectedListItem = ListHelpers.getListItem(oExpectedItem);
		oExpectedListGroupHeader = ListHelpers.getListItem(oExpectedSeparatorItem);

		// assert
		assert.strictEqual(jQuery(oFocusDomRef).getSelectedText(), "item11", "Correct text was selected in the combo box.");
		assert.ok(this.oComboBox.getSelectedItem() === oExpectedItem, "The expected item was selected.");

		// act
		// When the last item was header and we reopen it, there should not be double focus
		qutils.triggerKeydown(oFocusDomRef, KeyCodes.F4);
		this.clock.tick(500);

		// assert
		assert.ok(oExpectedListItem.hasStyleClass("sapMLIBFocused"), "The item has visual focus");
		assert.ok(!oExpectedListGroupHeader.hasStyleClass("sapMLIBFocused"), "The group header does not have visual focus");
	});

	QUnit.test("Grouping with models", async function (assert) {
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
		await nextUIUpdate();

		// Assert
		assert.ok(oComboBox.getItems().length > 4, "There should be more items as there's a separator item for each group");
		assert.ok(oComboBox.getItems()[0].isA("sap.ui.core.SeparatorItem"), "The first item is a SeparatorItem");

		// Cleanup
		oComboBox.destroy();
	});

	QUnit.module("Group header press" ,{
		beforeEach: function () {
			this.clock = sinon.useFakeTimers();
		},
		afterEach: function () {
			fnRunAllTimersAndRestore(this.clock);
		}
	});

	QUnit.test("group header item press should not close the popover", async function (assert) {
		assert.expect(4);
		// System under test
		var oComboBox = new ComboBox({
			items: [
				new SeparatorItem({text: "Group1"}),
				new Item({text: "item11", key: "key11"})
			]
		});

		oComboBox.placeAt("content");
		await nextUIUpdate(this.clock);

		// arrange
		oComboBox.focus();
		oComboBox.open();
		this.clock.tick(500);

		// act
		qutils.triggerEvent("tap", oComboBox._getList().getItems()[0].getDomRef());
		this.clock.tick(500);

		// assert
		assert.ok(oComboBox.isOpen(), "The combo box's picker is opened.");
		assert.strictEqual(oComboBox.getFocusDomRef().value, "", "The expected text was filled in the combo box.");
		assert.strictEqual(jQuery(oComboBox.getFocusDomRef()).getSelectedText(), "", "Correct text was selected in the combo box.");
		assert.ok(oComboBox.getSelectedItem() === null, "Nothing was selected.");

		// clean up
		oComboBox.destroy();
	});

	QUnit.test("group header item press should not close the dialog on mobile", async function (assert) {
		assert.expect(4);
		// System under test
		this.stub(Device, "system").value({
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
		await nextUIUpdate(this.clock);

		// arrange
		oComboBox.focus();
		oComboBox.open();
		this.clock.tick(500);

		// act
		qutils.triggerEvent("tap", oComboBox._getList().getItems()[0].getDomRef());
		this.clock.tick(500);

		// assert
		assert.ok(oComboBox.isOpen(), "The combo box's picker is opened.");
		assert.strictEqual(oComboBox.getFocusDomRef().value, "", "The expected text was filled in the combo box.");
		assert.strictEqual(jQuery(oComboBox.getFocusDomRef()).getSelectedText(), "", "Correct text was selected in the combo box.");
		assert.ok(oComboBox.getSelectedItem() === null, "Nothing was selected.");

		oComboBox.destroy();
	});

	QUnit.module("showItems functionality", {
		beforeEach: async function () {
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

			await nextUIUpdate();
		},
		afterEach: function () {
			this.oCombobox.destroy();
			this.oCombobox = null;
			fnRunAllTimersAndRestore(this.clock);
		}
	});

	QUnit.test("Should filter internal list properly", async function (assert) {
		this.clock = sinon.useFakeTimers();
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
		await nextUIUpdate(this.clock);

		// Assert
		assert.strictEqual(this.oCombobox._getList().getItems().length, 5, "There should be 5 items in the list...");
		assert.strictEqual(fnFilterVisibleItems(this.oCombobox._getList().getItems()).length, 2, "... but 2 should be visible");

		// Act
		oEvent.target.value = "";
		this.oCombobox.oninput(oEvent);
		this.oCombobox.invalidate();
		this.clock.tick(500);
		await nextUIUpdate(this.clock);

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

	QUnit.test("Should show all the items", async function (assert) {
		// Setup
		var fnGetVisisbleItems = function (aItems) {
			return aItems.filter(function (oItem) {
				return oItem.getVisible();
			});
		};

		// Act
		this.oCombobox.showItems();
		await nextUIUpdate();

		// Assert
		assert.strictEqual(this.oCombobox._getList().getItems().length, 5, "All the items are available");
		assert.strictEqual(fnGetVisisbleItems(this.oCombobox._getList().getItems()).length, 5, "Shows all items");
	});

	QUnit.test("Should filter the items", async function (assert) {
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

		await nextUIUpdate();

		// Assert
		assert.strictEqual(this.oCombobox._getList().getItems().length, 5, "All the items are available");
		assert.strictEqual(fnGetVisisbleItems(this.oCombobox._getList().getItems()).length, 1, "Only the matching items are visible");
	});

	QUnit.test("Destroy & reinit on mobile", async function (assert) {
		// Setup
		this.stub(Device, "system").value({
			desktop: false,
			phone: true,
			tablet: false
		});

		// arrange
		var oComboBox = new ComboBox("test-combobox").placeAt("qunit-fixture");
		await nextUIUpdate();

		// Act
		oComboBox.destroy();
		oComboBox = new ComboBox("test-combobox").placeAt("qunit-fixture");
		await nextUIUpdate();

		// assert
		assert.ok(true, "If there's no exception so far, everything is ok");

		// Cleanup
		oComboBox.destroy();
	});

	QUnit.test("Should call toggleStyleClass correctly in the process of showing items", function (assert) {
		// Setup
		var oSpy = this.spy(this.oCombobox, "toggleStyleClass"),
			sClassName = InputBase.ICON_PRESSED_CSS_CLASS;

		// Act
		this.oCombobox.showItems(function () {
			return true;
		});

		// Assert
		assert.strictEqual(oSpy.callCount, 0, "The toggleStyleClass method was not called.");

		// Act
		this.oCombobox._handlePopupOpenAndItemsLoad(true); // Icon press

		// Assert
		assert.strictEqual(oSpy.callCount, 1, "The toggleStyleClass method was called once:");
		assert.strictEqual(oSpy.getCall(0).args[0], sClassName, "...first time with '" + sClassName + "'.");

		// Arrange
		this.oCombobox._bShouldClosePicker = true;
		this.oCombobox._bItemsShownWithFilter = false;

		// Act
		this.oCombobox._handlePopupOpenAndItemsLoad(); // Icon press

		// Assert
		assert.strictEqual(oSpy.callCount, 2, "The toggleStyleClass method was called twice:");
		assert.strictEqual(oSpy.getCall(1).args[0], sClassName, "...second time with '" + sClassName + "'.");

		// Clean
		oSpy.restore();
	});

	QUnit.test("Should call toggleStyleClass after showItems is called and oninput is triggered.", function (assert) {
		// Setup
		this.clock = sinon.useFakeTimers();
		var oSpy = this.spy(this.oCombobox, "toggleStyleClass"),
			oFakeEvent = {
				isMarked: function () { return false; },
				setMarked: function () { },
				target: {
					value: "A Item"
				},
				srcControl: this.oCombobox
			},
			sClassName = InputBase.ICON_PRESSED_CSS_CLASS;

		// Act
		this.oCombobox.showItems(function () {
			return true;
		});

		// Assert
		assert.strictEqual(oSpy.callCount, 0, "The toggleStyleClass method was not called.");

		// Act
		this.oCombobox.oninput(oFakeEvent); // Fake input
		this.clock.tick(1000);

		// Assert
		assert.strictEqual(oSpy.callCount, 1, "The toggleStyleClass method was called once:");
		assert.strictEqual(oSpy.getCall(0).args[0], sClassName, "...first time with '" + sClassName + "'.");

		// Clean
		oSpy.restore();
	});

	QUnit.test("Should show all items when drop down arrow is pressed after showing filtered list.", async function (assert) {
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
		await nextUIUpdate();

		// Assert
		assert.strictEqual(this.oCombobox._getList().getItems().length, 5, "All the items are available");
		assert.strictEqual(fnGetVisisbleItems(this.oCombobox._getList().getItems()).length, 1, "Only the matching items are visible");

		// Act
		this.oCombobox._handlePopupOpenAndItemsLoad(true); // Icon press
		await nextUIUpdate();

		assert.strictEqual(this.oCombobox._getList().getItems().length, 5, "All the items are available");
		assert.strictEqual(fnGetVisisbleItems(this.oCombobox._getList().getItems()).length, 5, "All items are visible");
	});

	QUnit.test("Should not open the Popover in case of 0 items.", async function (assert) {
		// Act
		this.oCombobox.showItems(function () {
			return false;
		});
		await nextUIUpdate();

		// Assert
		assert.strictEqual(this.oCombobox.isOpen(), false, "The Popover should not be displayed.");
	});

	QUnit.test("Should display the empty item.", async function (assert) {
		var аListItems, oEmptyItem, iItemIdx;

		// Act
		this.oCombobox.addItem(new Item({text: "", key: "emptyItem"}));
		await nextUIUpdate();

		this.oCombobox.open();

		аListItems = this.oCombobox._getList().getItems();
		iItemIdx = аListItems.length - 1;
		oEmptyItem = аListItems[iItemIdx];

		// Assert
		assert.ok(oEmptyItem.getDomRef(), "The empty item is shown");
	});

	QUnit.module("List configuration");

	QUnit.test("List css classes", async function (assert) {
		// setup
		var oComboBox = new ComboBox().placeAt("content");
		await nextUIUpdate();

		oComboBox.open();
		await nextUIUpdate();

		// assert
		assert.ok(oComboBox._getList().hasStyleClass(oComboBox.getRenderer().CSS_CLASS_COMBOBOXBASE + "List"),
			'The combobox list has the CSS class "' + oComboBox.getRenderer().CSS_CLASS_COMBOBOXBASE + "List");

		assert.ok(oComboBox._getList().hasStyleClass(oComboBox.getRenderer().CSS_CLASS_COMBOBOX + "List"),
			'The combobox list has the CSS class "' + oComboBox.getRenderer().CSS_CLASS_COMBOBOX + "List");

		// clean up
		oComboBox.destroy();
	});

	QUnit.module("setFormattedValueStateText()", {
		beforeEach: async function () {
			this.clock = sinon.useFakeTimers();
			this.oFormattedValueStateText = new FormattedText({
				htmlText: "Value state message containing a %%0",
				controls: new Link({
					text: "link",
					href: "#"
				})
			});

			this.oErrorComboBox = new ComboBox("error-combobox", {
				valueState: "Error",
				formattedValueStateText: this.oFormattedValueStateText,
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

			this.oErrorComboBox.placeAt("content");
			await nextUIUpdate(this.clock);
		},
		afterEach: function () {
			this.oErrorComboBox.destroy();
			this.oErrorComboBox = null;
			this.oFormattedValueStateText = null;
			fnRunAllTimersAndRestore(this.clock);
		}
	});

	QUnit.test("Value state message and value state header with sap.m.FormattedText", function (assert) {
		// Arrange
		var oFormattedValueStateText;


		// Act
		qutils.triggerEvent("focusin", this.oErrorComboBox.getDomRef("inner"));
		this.clock.tick(300);

		assert.strictEqual(document.querySelector("#" + this.oErrorComboBox.getValueStateMessageId() + " div").textContent, "Value state message containing a link", "Formatted text value state message popup is displayed on focus");
		assert.strictEqual(document.querySelectorAll("#" + this.oErrorComboBox.getValueStateMessageId() + " a").length, 1, "Value state message link is rendered");

		// Act
		this.oErrorComboBox.closeValueStateMessage();
		this.clock.tick(300);
		this.oErrorComboBox.open();

		oFormattedValueStateText = this.oErrorComboBox._oSuggestionPopover._getValueStateHeader().getFormattedText();

		// Assert
		assert.strictEqual(oFormattedValueStateText.$().text(), "Value state message containing a link", "Formatted text value state message containing a link is displayed in the suggestion popover");
		assert.strictEqual(document.querySelectorAll("#" + oFormattedValueStateText.getId() + " a").length, 1, "Value state message link in suggestion popover header is displayed");
	});

	QUnit.test("Arrow up when the first item is selected should place visible pseudo focus on value state header", function (assert) {
		// Act
		this.oErrorComboBox.focus();
		this.clock.tick();

		qutils.triggerKeydown(this.oErrorComboBox.getFocusDomRef(), KeyCodes.F4);
		this.clock.tick();

		qutils.triggerKeydown(this.oErrorComboBox.getFocusDomRef(), KeyCodes.ARROW_UP);
		this.clock.tick();

		// Assert
		assert.ok(this.oErrorComboBox.getPicker().getCustomHeader().$().hasClass("sapMPseudoFocus"), "Pseudo focus is on value state header");
		assert.strictEqual(this.oErrorComboBox.getFocusDomRef().getAttribute("aria-activedescendant"), this.oErrorComboBox.getPicker().getCustomHeader().getFormattedText().getId(), "Aria attribute of input is the ID of the formatted value state text");
	});

	QUnit.test("Arrow down when the formatted state value text is selected should set the first item", function (assert) {
		// Act
		this.oErrorComboBox.focus();
		this.clock.tick();

		qutils.triggerKeydown(this.oErrorComboBox.getFocusDomRef(), KeyCodes.F4);
		this.clock.tick();

		qutils.triggerKeydown(this.oErrorComboBox.getFocusDomRef(), KeyCodes.ARROW_UP);
		this.clock.tick();

		qutils.triggerKeydown(this.oErrorComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN);
		this.clock.tick();

		// Assert
		assert.ok(ListHelpers.getListItem(this.oErrorComboBox.getItems()[0]).$().hasClass("sapMLIBFocused"), "The visual pseudo focus is on the first item");
		assert.strictEqual(this.oErrorComboBox.getFocusDomRef().getAttribute("aria-activedescendant"), ListHelpers.getListItem(this.oErrorComboBox.getItems()[0]).getId(), "Aria attribute of input is the ID of selected item");
	});

	QUnit.test("Arrow down when the visible focus is on the input should move it to the Value State Header", async function (assert) {
		// Act
		this.oErrorComboBox.open();
		this.clock.tick(500);
		await nextUIUpdate(this.clock);

		qutils.triggerKeydown(this.oErrorComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN);
		this.clock.tick(500);
		await nextUIUpdate(this.clock);

		// Assert
		assert.ok(this.oErrorComboBox.getPicker().getCustomHeader().$().hasClass("sapMPseudoFocus"), "The visual pseudo focus is on the first item");
		assert.strictEqual(this.oErrorComboBox.getFocusDomRef().getAttribute("aria-activedescendant"), this.oErrorComboBox.getPicker().getCustomHeader().getFormattedText().getId(), "Aria attribute of input is the ID of the formatted value state text");
	});

	QUnit.test("Tapping on the input shoould apply the visual focus", async function (assert) {
		// Arrange
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
		await nextUIUpdate(this.clock);

		var oFakeEvent = {
			getEnabled: function () { return true; },
			setMarked: function () { },
			srcControl: oComboBox
		};

		// Act
		oComboBox.focus();
		await nextUIUpdate(this.clock);

		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.F4);
		this.clock.tick();

		// Arrange
		var oFirstListItem = oComboBox._getList().getItems()[0],
			sExpectedActiveDescendantId = oFirstListItem.getId();

		// Assert
		assert.strictEqual(oComboBox.getPicker().oPopup.getOpenState(), OpenState.OPEN, "The picker is open");
		assert.ok(oFirstListItem.hasStyleClass("sapMLIBFocused"), "The visual pseudo focus is on the first item");
		assert.strictEqual(jQuery(oComboBox.getFocusDomRef()).attr("aria-activedescendant"), sExpectedActiveDescendantId, 'The "aria-activedescendant" attribute is set correctly');

		// Act
		oComboBox.ontap(oFakeEvent);
		this.clock.tick();

		// Assert
		assert.notOk(oFirstListItem.hasStyleClass("sapMLIBFocused"), "The visual pseudo focus is removed when the input field is on focus");
		assert.ok(oComboBox.$().hasClass("sapMFocus"), "The visual focus is on the input field");
		assert.strictEqual(jQuery(oComboBox.getFocusDomRef()).attr("aria-activedescendant"), undefined, 'The "aria-activedescendant" attribute is removed when the input field is on focus');

		//clean up
		oComboBox.destroy();
	});

	QUnit.test("Tapping on the disabled input shoould not apply the visual focus", async function (assert) {
		// Arrange
		var oComboBox = new ComboBox({
			enabled: false,
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
		await nextUIUpdate(this.clock);

		// Act
		oComboBox.ontap();
		this.clock.tick();

		// Assert
		assert.strictEqual(oComboBox.getDomRef().classList.contains("sapMFocus"), false, "The visual focus is not applied");

		// Clean
		oComboBox.destroy();
	});

	QUnit.test("Setting new value state formatted text aggregation should be update also the value state header", async function (assert) {
		// Arrange
		var	oSuggPopoverHeaderValueState,
			oFormattedValueStateText;

		// Act
		// Open sugg. popover with the initialy set formatted text value state
		// to switch the FormattedText aggregation to the value state header
		this.oErrorComboBox.open();
		this.clock.tick();
		this.oErrorComboBox.close();
		this.clock.tick();

		oFormattedValueStateText = new FormattedText({
			htmlText: "Another value state message containing %%0 %%1",
			controls: [
				new Link({
					text: "multiple",
					href: "#"
				}),
				new Link({
					text: "links",
					href: "#"
				})
			]
		});

		this.oErrorComboBox.setFormattedValueStateText(oFormattedValueStateText);
		await nextUIUpdate(this.clock);

		this.oErrorComboBox.open();
		this.clock.tick();

		oSuggPopoverHeaderValueState = this.oErrorComboBox._getSuggestionsPopover()._getValueStateHeader().getFormattedText().getDomRef().textContent;

		// Assert
		assert.strictEqual(oSuggPopoverHeaderValueState, "Another value state message containing multiple links", "New FormattedText value state message is correcrtly set in the popover's value state header");
	});
	QUnit.test("Change to the formatted text InputBase aggregation should be forwarded to the value state header", async function (assert) {
		// Arrange
		var	oSuggPopoverHeaderValueState;

		// Act
		this.oErrorComboBox._getFormattedValueStateText().setHtmlText("New value state message containing a %%0");
		await nextUIUpdate(this.clock);

		this.oErrorComboBox.open();
		this.clock.tick();

		oSuggPopoverHeaderValueState = this.oErrorComboBox._getSuggestionsPopover()._getValueStateHeader().getFormattedText().getDomRef().textContent;

		// Assert
		assert.strictEqual(oSuggPopoverHeaderValueState, "New value state message containing a link", "The FormattedText aggregation is correctly forwarded to the popover's value state header");
	});

	QUnit.test("Change to the formatted text InputBase aggregation should should also be reflected in the value state header while it is open", async function (assert) {
		// Arrange
		var oSuggPopoverHeaderValueState;
		var oRenderedValueStateMessage;

		// Act
		this.oErrorComboBox.focus();
		this.oErrorComboBox.open();
		this.clock.tick(1000);

		this.oErrorComboBox._getFormattedValueStateText().setHtmlText("New value state message containing a %%0");
		await nextUIUpdate(this.clock);
		oSuggPopoverHeaderValueState = this.oErrorComboBox._getSuggestionsPopover()._getValueStateHeader().getFormattedText().getDomRef().textContent;

		// Assert
		assert.strictEqual(oSuggPopoverHeaderValueState, "New value state message containing a link", "The FormattedText aggregation is correctly updated in the popover's value state header while it's open");

		// Act
		this.oErrorComboBox.close();
		this.clock.tick(1000);

		// Get the actual rendered value state text from the popup content DOM
		oRenderedValueStateMessage = document.getElementById(this.oErrorComboBox.getValueStateMessageId()).textContent;

		// Assert
		assert.strictEqual(oRenderedValueStateMessage, "New value state message containing a link", "The updated FormattedText aggregation is also correctly displayed in the ComboBox value state popup after the suggestion popover is closed");
	});

	QUnit.test("Should move the visual focus from value state header to the ComboBox input when the user starts typing", function (assert) {
		// Arrange
		var	oValueStateHeader;

		// Act
		this.oErrorComboBox._$input.trigger("focus").val("A").trigger("input");
		this.clock.tick();

		// Select the value state header
		qutils.triggerKeydown(this.oErrorComboBox.getFocusDomRef(), KeyCodes.ARROW_UP);
		this.clock.tick();

		this.oErrorComboBox._$input.trigger("focus").val("Ger").trigger("input");
		this.clock.tick();

		oValueStateHeader = this.oErrorComboBox._getSuggestionsPopover()._getValueStateHeader();

		// Assert
		assert.notOk(oValueStateHeader.$().hasClass("sapMPseudoFocus"), "Pseudo focus is not the value state header");
		assert.notOk(this.oErrorComboBox._getSuggestionsPopover().getItemsContainer().getItems()[0].$().hasClass("sapMLIBFocused"), "The visual pseudo focus is not on the first item");
		assert.ok(this.oErrorComboBox.$().hasClass("sapMFocus"), "The visual pseudo focus is on the input field");
	});

	QUnit.test("onsaphome should move the visual focus on the value state header if links exists", function (assert) {
		// Arrange
		var	oValueStateHeader;

		// Act
		qutils.triggerKeydown(this.oErrorComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN, false, true);
		this.clock.tick();
		qutils.triggerKeydown(this.oErrorComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN);
		this.clock.tick();
		qutils.triggerKeydown(this.oErrorComboBox.getFocusDomRef(), KeyCodes.HOME);
		this.clock.tick();

		oValueStateHeader = this.oErrorComboBox._getSuggestionsPopover()._getValueStateHeader();

		// Assert
		assert.ok(oValueStateHeader.$().hasClass("sapMPseudoFocus"), "Pseudo focus is on the value state header");
		assert.notOk(this.oErrorComboBox._getSuggestionsPopover().getItemsContainer().getItems()[0].$().hasClass("sapMLIBFocused"), "The visual pseudo focus is not on the first item");
		assert.notOk(this.oErrorComboBox.$().hasClass("sapMFocus"), "The visual pseudo focus is not the input field");
	});

	QUnit.test("onsapdown on a link in a value state header message should move the visual focus to the first suggested item", function (assert) {
		// Arrange
		var	oValueStateHeader;

		// Act
		qutils.triggerKeydown(this.oErrorComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN, false, true);
		this.clock.tick();
		qutils.triggerKeydown(this.oErrorComboBox.getFocusDomRef(), KeyCodes.ARROW_UP);
		this.clock.tick();
		qutils.triggerKeydown(this.oErrorComboBox.getFocusDomRef(), KeyCodes.TAB);
		this.clock.tick();


		oValueStateHeader = this.oErrorComboBox._getSuggestionsPopover()._getValueStateHeader();

		// Assert
		assert.strictEqual(oValueStateHeader.getFormattedText().getControls()[0].getDomRef(), document.activeElement, "The link in the value state header has the real focus");

		qutils.triggerKeydown(this.oErrorComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN);
		this.clock.tick();

		// Assert
		assert.notOk(oValueStateHeader.$().hasClass("sapMPseudoFocus"), "Pseudo focus is not on the value state header");
		assert.notOk(this.oErrorComboBox.$().hasClass("sapMFocus"), "The visual pseudo focus is not the input field");
		assert.ok(this.oErrorComboBox._getSuggestionsPopover().getItemsContainer().getItems()[0].$().hasClass("sapMLIBFocused"), "The visual pseudo focus is on the first item");
	});

	QUnit.test("When the FormattedText in the value state header is focused onsapend should move the focus to the last item", function (assert) {
		// Arrange
		var	oValueStateHeader,
			iLastItemIndex;

			// Act
		qutils.triggerKeydown(this.oErrorComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN, false, true);
		this.clock.tick();

		iLastItemIndex = this.oErrorComboBox._getSuggestionsPopover().getItemsContainer().getItems().length - 1;

		qutils.triggerKeydown(this.oErrorComboBox.getFocusDomRef(), KeyCodes.ARROW_UP);
		this.clock.tick();
		qutils.triggerKeydown(this.oErrorComboBox.getFocusDomRef(), KeyCodes.END);
		this.clock.tick();

		oValueStateHeader = this.oErrorComboBox._getSuggestionsPopover()._getValueStateHeader();

		// Assert
		assert.notOk(oValueStateHeader.$().hasClass("sapMPseudoFocus"), "Pseudo focus is not the value state header");
		assert.notOk(this.oErrorComboBox.$().hasClass("sapMFocus"), "The visual pseudo focus is not the input field");
		assert.ok(this.oErrorComboBox._getSuggestionsPopover().getItemsContainer().getItems()[iLastItemIndex].$().hasClass("sapMLIBFocused"), "The visual pseudo focus is on the last item");
	});

	QUnit.test("Should display the correct value state FormattedText message when a value with no matching suggestion is typed in the ComboBox input field", function (assert) {
		// Arrange
		var	oValueStateFormattedText;

		// Act
		this.oErrorComboBox._$input.trigger("focus").val("@").trigger("input");
		this.clock.tick(500);

		oValueStateFormattedText = this.oErrorComboBox.getFormattedValueStateText().getHtmlText();

		// Assert
		assert.strictEqual(oValueStateFormattedText, "Value state message containing a %%0", "The correct value state formatted text message is set to the control");
		assert.strictEqual(document.querySelector("#" + this.oErrorComboBox.getValueStateMessageId() + " div").textContent, "Value state message containing a link", "The correct value state message is rendered and dispaleyd in the popup");
	});

	QUnit.test("Should display the correct value state FormattedText message popup when a value with no matching suggestion is typed in the ComboBox input field after a suggestion item has been already shown prior to that", function (assert) {
		// Arrange
		var	oValueStateFormattedText;
		var	oEventMock = {
				keyCode: KeyCodes.Z,
				srcControl: this.oErrorComboBox,
				stopPropagation: function () {},
				isMarked: function () { },
				target: {}
			};
		oEventMock.target.value = "Gerz";

		// Act
		this.oErrorComboBox._$input.trigger("focus").val("Ger").trigger("input");
		this.clock.tick(500);

		// Assert
		assert.strictEqual(this.oErrorComboBox._getSuggestionsPopover().getItemsContainer().getSelectedItem().getTitle(), "Germany", "Suggestion item has been matched");

		// Add one more character that will make the input value with no matching suggestion item
		this.oErrorComboBox.handleInputValidation(oEventMock, false);
		this.clock.tick(500);

		oValueStateFormattedText = this.oErrorComboBox.getFormattedValueStateText().getHtmlText();

		// Assert
		assert.strictEqual(oValueStateFormattedText, "Value state message containing a %%0", "The correct value state formatted text message is set to the ComboBox");
		assert.strictEqual(document.querySelector("#" + this.oErrorComboBox.getValueStateMessageId() + " div").textContent, "Value state message containing a link", "The correct value state message is rendered and dispaleyd in the popup");
	});

	QUnit.test("Tapping on the input while valeu state header is focused shoould apply the visual focus on the input and remove it from the header", async function (assert) {
		var oFakeEvent = {
			getEnabled: function () { return true; },
			isMarked: function () {},
			stopPropagation: function () {},
			setMarked: function () { },
			srcControl: this.oErrorComboBox,
			preventDefault: function() { return false; }
		};
		var oFirstListItem,
			oValueStateHeader;

		// Act
		this.oErrorComboBox.focus();
		await nextUIUpdate(this.clock);

		qutils.triggerKeydown(this.oErrorComboBox.getFocusDomRef(), KeyCodes.F4);
		this.clock.tick();

		oValueStateHeader = this.oErrorComboBox._oSuggestionPopover._getValueStateHeader();
		this.oErrorComboBox.onsapup(oFakeEvent);
		this.clock.tick();

		// Arrange
		oFirstListItem = this.oErrorComboBox._getList().getItems()[0];

		// Act
		this.oErrorComboBox.ontap(oFakeEvent);
		this.clock.tick();

		// Assert
		assert.notOk(oFirstListItem.hasStyleClass("sapMLIBFocused"), "The visual pseudo focus is removed when the input field is on focus");
		assert.notOk(oValueStateHeader.hasStyleClass("sapMLIBFocused"), "The visual pseudo focus is removed when the input field is on focus");
		assert.ok(this.oErrorComboBox.$().hasClass("sapMFocus"), "The visual focus is on the input field");
		assert.strictEqual(jQuery(this.oErrorComboBox.getFocusDomRef()).attr("aria-activedescendant"), undefined, 'The "aria-activedescendant" attribute is removed when the input field is on focus');
	});


	QUnit.module("selectedKey vs. value behavior", {
		beforeEach: function () {
			this.oData = {
				selectedKey: "2",
				value: "zzzzzzz",
				items: [
					{status: "0", statusText: "Backups"},
					{status: "1", statusText: "Equipment"},
					{status: "2", statusText: "Locations"},
					{status: "3", statusText: "Systems"}
				]
			};
			this.oModel = new JSONModel(this.oData);
		},
		afterEach: function () {
			this.oModel.destroy();
		}
	});

	QUnit.test("Setters: selectedKey + matching item should overwrite the value", async function (assert) {
		// Setup
		var oComboBox = new ComboBox({
			value: "Zzzzzz",
			selectedKey: "2",
			items: {
				path: "/items",
				template: new Item({key: "{status}", text: "{statusText}"})
			}
		})
			.setModel(this.oModel)
			.placeAt("content");
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oComboBox.getSelectedKey(), "2", "selectedKey should remain");
		assert.strictEqual(oComboBox.getValue(), "Locations", "The value should come from the selected key");

		// Cleanup
		oComboBox.destroy();
	});

	QUnit.test("Setters: selectedKey + matching item should overwrite the value (changed setters order)", async function (assert) {
		// Setup
		var oComboBox = new ComboBox({
			selectedKey: "2",
			value: "Zzzzzz",
			items: {
				path: "/items",
				template: new Item({key: "{status}", text: "{statusText}"})
			}
		})
			.setModel(this.oModel)
			.placeAt("content");
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oComboBox.getSelectedKey(), "2", "selectedKey should remain");
		assert.strictEqual(oComboBox.getValue(), "Locations", "The value should come from the selected key");

		// Cleanup
		oComboBox.destroy();
	});

	QUnit.test("Bindings: selectedKey + matching item should overwrite the value", async function (assert) {
		// Setup
		var oComboBox = new ComboBox({
			value: "{/value}",
			selectedKey: "{/selectedKey}",
			items: {
				path: "/items",
				template: new Item({key: "{status}", text: "{statusText}"})
			}
		})
			.setModel(this.oModel)
			.placeAt("content");
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oComboBox.getSelectedKey(), "2", "selectedKey should remain");
		assert.strictEqual(oComboBox.getValue(), "Locations", "The value should come from the selected key");

		// Cleanup
		oComboBox.destroy();
	});

	QUnit.test("Bindings: selectedKey + matching item should overwrite the value (changed binding order)", async function (assert) {
		// Setup
		var oComboBox = new ComboBox({
			selectedKey: "{/selectedKey}",
			value: "{/value}",
			items: {
				path: "/items",
				template: new Item({key: "{status}", text: "{statusText}"})
			}
		})
			.setModel(this.oModel)
			.placeAt("content");
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oComboBox.getSelectedKey(), "2", "selectedKey should remain");
		assert.strictEqual(oComboBox.getValue(), "Locations", "The value should come from the selected key");

		// Cleanup
		oComboBox.destroy();
	});

	QUnit.test("Bindings: Value + No selectedKey: should leave the value as it is", async function (assert) {
		// Setup
		var oComboBox = new ComboBox({
			value: "{/value}",
			items: {
				path: "/items",
				template: new Item({key: "{status}", text: "{statusText}"})
			}
		})
			.setModel(this.oModel)
			.placeAt("content");
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oComboBox.getSelectedKey(), "", "selectedKey should remain");
		assert.strictEqual(oComboBox.getValue(), "zzzzzzz", "The value should come from the selected key");

		// Cleanup
		oComboBox.destroy();
	});

	QUnit.test("Bindings: selectedKey + No Value: should set the value to the matching item", async function (assert) {
		// Setup
		var oComboBox = new ComboBox({
			selectedKey: "{/selectedKey}",
			items: {
				path: "/items",
				template: new Item({key: "{status}", text: "{statusText}"})
			}
		})
			.setModel(this.oModel)
			.placeAt("content");
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oComboBox.getSelectedKey(), "2", "selectedKey should remain");
		assert.strictEqual(oComboBox.getValue(), "Locations", "The value should come from the selected key");

		// Cleanup
		oComboBox.destroy();
	});

	QUnit.test("Mixed: Binding: selectedKey, Setter: Value: should set the value of the matching item", async function (assert) {
		// Setup
		var oComboBox = new ComboBox({
			value: "Zzzzzz",
			selectedKey: "{/selectedKey}",
			items: {
				path: "/items",
				template: new Item({key: "{status}", text: "{statusText}"})
			}
		})
			.setModel(this.oModel)
			.placeAt("content");
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oComboBox.getSelectedKey(), "2", "selectedKey should remain");
		assert.strictEqual(oComboBox.getValue(), "Locations", "The value should come from the selected key");

		// Cleanup
		oComboBox.destroy();
	});

	QUnit.test("Mixed: Setter: selectedKey, Binding: Value: should set the value of the matching item", async function (assert) {
		// Setup
		var oComboBox = new ComboBox({
			value: "{/value}",
			selectedKey: "2",
			items: {
				path: "/items",
				template: new Item({key: "{status}", text: "{statusText}"})
			}
		})
			.setModel(this.oModel)
			.placeAt("content");
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oComboBox.getSelectedKey(), "2", "selectedKey should remain");
		assert.strictEqual(oComboBox.getValue(), "Locations", "The value should come from the selected key");

		// Cleanup
		oComboBox.destroy();
	});

	QUnit.test("User Interaction: Sets value over selectedKey", async function (assert) {
		// Setup
		var oComboBox = new ComboBox({
			selectedKey: "2",
			items: {
				path: "/items",
				template: new Item({key: "{status}", text: "{statusText}"})
			}
		})
			.setModel(this.oModel)
			.placeAt("content");
		await nextUIUpdate();

		// Act
		oComboBox.focus();
		qutils.triggerCharacterInput(oComboBox._$input, "T", "This is a user input");
		await nextUIUpdate();


		// Assert
		assert.strictEqual(oComboBox.getSelectedKey(), "2", "selectedKey should remain");
		assert.strictEqual(oComboBox.getValue(), "This is a user input", "The value should come from the user input");

		// Cleanup
		oComboBox.destroy();
	});

	QUnit.test("User Interaction: Sets value over selectedKey (binding)", async function (assert) {
		// Setup
		var oComboBox = new ComboBox({
				selectedKey: "{/selectedKey}",
				items: {
					path: "/items",
					template: new Item({key: "{status}", text: "{statusText}"})
				}
			})
				.setModel(this.oModel)
				.placeAt("content");
		await nextUIUpdate();

		// Act
		oComboBox.focus();
		qutils.triggerCharacterInput(oComboBox._$input, "T", "This is a user input");
		await nextUIUpdate();


		// Assert
		assert.strictEqual(oComboBox.getSelectedKey(), "2", "selectedKey should remain");
		assert.strictEqual(oComboBox.getValue(), "This is a user input", "The value should come from the user input");

		// Cleanup
		oComboBox.destroy();
	});

	QUnit.test("User Interaction: Binding update should overwrite user value (binding: async)", async function (assert) {
		// Setup
		var oModel = new JSONModel(),
			oComboBox = new ComboBox({
				selectedKey: "{/selectedKey}",
				items: {
					path: "/items",
					template: new Item({key: "{status}", text: "{statusText}"})
				}
			})
				.setModel(oModel)
				.placeAt("content");
		await nextUIUpdate();

		// Act
		oComboBox.focus();
		qutils.triggerCharacterInput(oComboBox._$input, "T", "This is a user input");
		await nextUIUpdate();

		// Act
		oModel.setData(this.oData);
		await nextUIUpdate();


		// Assert
		assert.strictEqual(oComboBox.getSelectedKey(), "2", "selectedKey should remain");
		assert.strictEqual(oComboBox.getValue(), "Locations", "The value should come from the selected key");

		// Cleanup
		oComboBox.destroy();
	});

	QUnit.module("RTL Support");

	QUnit.test("If the sap.ui.core.Item's text direction is set explicitly it should be mapped to the StandardListItem", async function (assert) {
		// Arrange
		var oComboBox = new ComboBox({
			items: [
				new SeparatorItem({
					text: "Countries",
					textDirection: TextDirection.RTL
				}),
				new Item({
					key: "GER",
					text: "Germany",
					textDirection: TextDirection.RTL
				}),
				new Item({
					key: "GAM",
					text: "Gambia"
				})
			]
		}).placeAt("content");
		await nextUIUpdate();

		// Act
		oComboBox.open();
		// Assert
		assert.strictEqual(oComboBox._getList().getItems()[0].getTitleTextDirection(), "RTL", 'RTL direction is correctly mapped from sap.ui.core.SeparatorItem to sap.m.GroupHeaderListItem');
		assert.strictEqual(oComboBox._getList().getItems()[1].getTitleTextDirection(), "RTL", 'RTL direction is correctly mapped from sap.ui.core.Item to sap.m.StandardListItem');

		// Clean
		oComboBox.destroy();
	});

	QUnit.module("Handling curly braces");

	QUnit.test("Braces in binded text and key properties do not cause error", async function(assert) {
		// Arrange
		var oSorter = new Sorter("head", false, true);
		var oModel = new JSONModel({
			items: [
				{
					key: "1 }",
					head: "{ ttt",
					text: "curly braces {{ 1",
					addText: "some curly {{}} 1"
				},
				{
					key: "2 {}",
					head: "{ ttt",
					text: "curly braces {{ 2",
					addText: "some curly {{}} 2"
				}
			]
		});
		var oComboBox = new ComboBox({
			items: {
				path: "/items",
				sorter: oSorter,
				template: new ListItem({
					text: "{text}",
					key: "{key}",
					additionalText: "{addText}"
				})
			},
			showSecondaryValues: true
		});

		oComboBox.setModel(oModel);
		oComboBox.placeAt("content");
		await nextUIUpdate();

		// Act
		oComboBox.showItems();
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oComboBox.getItems()[0].getText(), "{ ttt", "Braces are correctly escaped in the separator item.");
		assert.strictEqual(oComboBox.getItems()[1].getText(), "curly braces {{ 1", "Braces are correctly escaped in the text of the core list item.");
		assert.strictEqual(oComboBox._getSuggestionsPopover().getItemsContainer().getItems()[0].getTitle(), "{ ttt", "Braces are correctly escaped in group header item.");
		assert.strictEqual(oComboBox._getSuggestionsPopover().getItemsContainer().getItems()[1].getTitle(), "curly braces {{ 1", "Braces are correctly escaped in items text.");
		assert.strictEqual(oComboBox._getSuggestionsPopover().getItemsContainer().getItems()[1].getInfo(), "some curly {{}} 1", "Braces are correctly escaped in items text.");

		// Clean
		oSorter.destroy();
		oModel.destroy();
		oComboBox.destroy();
	});

	QUnit.module("ClearIcon");

	QUnit.test("onkeyup setting the effectiveShowClearIcon property - no value", async function(assert) {
		// Arrange
		var oComboBox = new ComboBox({
			showClearIcon: true
		});
		var oSpy;

		oComboBox.placeAt("content");
		await nextUIUpdate();

		oSpy = this.spy(oComboBox, "setProperty");

		// Act
		oComboBox.onkeyup();
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oSpy.called, true, "setProperty was called");
		assert.strictEqual(oSpy.calledWith("effectiveShowClearIcon", false), true, "setProperty was called with the correct arguments");

		// Clean
		oSpy.restore();
		oComboBox.destroy();
	});

	QUnit.test("onkeyup setting the effectiveShowClearIcon property - with value", async function(assert) {
		// Arrange
		var oComboBox = new ComboBox({
			showClearIcon: true,
			value: "test"
		});
		var oSpy;

		oComboBox.placeAt("content");
		await nextUIUpdate();

		oSpy = this.spy(oComboBox, "setProperty");

		// Act
		oComboBox.onkeyup();
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oSpy.called, true, "setProperty was called");
		assert.strictEqual(oSpy.calledWith("effectiveShowClearIcon", true), true, "setProperty was called with the correct arguments");

		// Clean
		oSpy.restore();
		oComboBox.destroy();
	});

	QUnit.test("onkeyup setting the effectiveShowClearIcon property - not editable", async function(assert) {
		// Arrange
		var oComboBox = new ComboBox({
			showClearIcon: true,
			editable: false
		});
		var oSpy;

		oComboBox.placeAt("content");
		await nextUIUpdate();

		oSpy = this.spy(oComboBox, "setProperty");

		// Act
		oComboBox.onkeyup();
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oSpy.called, false, "setProperty was not called");

		// Clean
		oSpy.restore();
		oComboBox.destroy();
	});

	QUnit.test("'setShowClearIcon(false)' should hide the icon even if there is value", async function(assert) {
		// Arrange
		var oComboBox = new ComboBox({
			showClearIcon: true,
			value: "test"
		});
		var oSpy;

		oComboBox.placeAt("content");
		await nextUIUpdate();

		oSpy = this.spy(oComboBox._oClearIcon, "setVisible");

		// Act
		oComboBox.setShowClearIcon(false);
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oSpy.callCount, 1, "setVisible was called exactly 1 time");
		assert.strictEqual(oSpy.calledWith(false), true, "setVisible was called with 'false' as parameter");

		// Clean
		oSpy.restore();
		oComboBox.destroy();
	});

	QUnit.test("'handleClearIconPress' should call clearSelection and setProperty", async function(assert) {
		// Arrange
		var oComboBox = new ComboBox({
			showClearIcon: true,
			value: "test"
		});
		var oClearSelectionSpy, oSetPropertySpy;

		oComboBox.placeAt("content");
		await nextUIUpdate();

		oClearSelectionSpy = this.spy(oComboBox, "clearSelection");
		oSetPropertySpy = this.spy(oComboBox, "setProperty");

		// Act
		oComboBox.handleClearIconPress();
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oClearSelectionSpy.called, true, "clearSelection was called");
		assert.strictEqual(oSetPropertySpy.calledWith('effectiveShowClearIcon', false), true, "setProperty was called with the correct parameters");

		// Clean
		oClearSelectionSpy.restore();
		oSetPropertySpy.restore();
		oComboBox.destroy();
	});

	QUnit.test("'handleClearIconPress' should fire selectionChange and change event when changing the selected item", async function(assert) {
		this.clock = sinon.useFakeTimers();
		// Arrange
		var oItem1 = new Item({
			text: "Lorem ipsum dolor sit amet, duo ut soleat insolens, commodo vidisse intellegam ne usu"
		}), oItem2 = new Item({
			text: "Lorem ipsum dolor sit amet, duo ut soleat insolens, commodo vidisse intellegam ne usu"
		}),
		oComboBox = new ComboBox({
			showClearIcon: true,
			items: [
				oItem1,
				oItem2
			]
		}),
		oSelectionChangeEventSpy, oChangeEventSpy;

		oComboBox.placeAt("content");
		await nextUIUpdate(this.clock);

		// Act
		oComboBox.setSelectedItem(oItem1);
		await nextUIUpdate(this.clock);

		oSelectionChangeEventSpy = this.spy(oComboBox, "fireSelectionChange");
		oChangeEventSpy = this.spy(oComboBox, "fireChange");

		oComboBox.handleClearIconPress();
		await nextUIUpdate(this.clock);

		// Assert
		assert.strictEqual(oSelectionChangeEventSpy.callCount, 1, "selectionChange event is triggered");
		assert.strictEqual(oChangeEventSpy.callCount, 1, "change event is triggered");

		// Act
		oComboBox.getFocusDomRef().blur();
		this.clock.tick(0);

		oComboBox.setValue("test");
		oComboBox.focus();
		await nextUIUpdate(this.clock);

		oComboBox.handleClearIconPress();
		await nextUIUpdate(this.clock);

		// Assert
		assert.strictEqual(oSelectionChangeEventSpy.callCount, 1, "selectionChange event is not triggered when there is no selected item");
		assert.strictEqual(oChangeEventSpy.callCount, 1, "change event is not triggered when there is no selected item");

		// Clean
		oSelectionChangeEventSpy.restore();
		oSelectionChangeEventSpy.restore();
		oComboBox.destroy();
		fnRunAllTimersAndRestore(this.clock);
	});

	QUnit.test("'handleClearIconPress' should not do anything when control is disabled", async function(assert) {
		// Arrange
		var oComboBox = new ComboBox({
			showClearIcon: true,
			value: "test",
			enabled: false
		});
		var oClearSelectionSpy, oSetPropertySpy;

		oComboBox.placeAt("content");
		await nextUIUpdate();

		oClearSelectionSpy = this.spy(oComboBox, "clearSelection");
		oSetPropertySpy = this.spy(oComboBox, "setProperty");

		// Act
		oComboBox.handleClearIconPress();
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oClearSelectionSpy.called, false, "clearSelection was called");
		assert.strictEqual(oSetPropertySpy.calledWith('effectiveShowClearIcon', false), false, "setProperty was called with the correct parameters");

		// Arrange
		oComboBox.setEnabled(true);
		oComboBox.setEditable(false);
		await nextUIUpdate();
		oClearSelectionSpy.reset();
		oSetPropertySpy.reset();

		// Act
		oComboBox.handleClearIconPress();
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oClearSelectionSpy.called, false, "clearSelection was called");
		assert.strictEqual(oSetPropertySpy.calledWith('effectiveShowClearIcon', false), false, "setProperty was called with the correct parameters");

		// Clean
		oClearSelectionSpy.restore();
		oSetPropertySpy.restore();
		oComboBox.destroy();
	});

	QUnit.test("Clear icon should clear the filter and close the suggestions dropdown when open while entering value", async function(assert) {
		// Arrange
		var oComboBox = new ComboBox({
			showClearIcon: true,
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

		oComboBox.placeAt("content");
		await nextUIUpdate();

		// Act
		oComboBox.focus();
		oComboBox.getFocusDomRef().value = "A";
		qutils.triggerEvent("input", oComboBox.getFocusDomRef());


		// Assert
		assert.ok(oComboBox.isOpen(), "ComboBox is open");
		assert.strictEqual(ListHelpers.getVisibleItems(oComboBox.getItems()).length, 3, "The items are filtered");

		// Act
		oComboBox.handleClearIconPress();
		await nextUIUpdate();

		// Assert
		assert.notOk(oComboBox.isOpen(), "ComboBox is closed");
		assert.strictEqual(ListHelpers.getVisibleItems(oComboBox.getItems()).length, 4, "The items are not filtered");

		// Clean
		oComboBox.destroy();
	});

	QUnit.test("Clear icon should clear the filter but not close the suggestions dropdown when open explicitly", async function(assert) {
		this.clock = sinon.useFakeTimers();
		// Arrange
		var oComboBox = new ComboBox({
			showClearIcon: true,
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

		oComboBox.placeAt("content");
		await nextUIUpdate(this.clock);

		// Act
		oComboBox.focus();
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.F4);

		oComboBox.getFocusDomRef().value = "A";
		qutils.triggerEvent("input", oComboBox.getFocusDomRef());
		this.clock.tick(1000);

		// Assert
		assert.ok(oComboBox.isOpen(), "ComboBox is open");
		assert.strictEqual(ListHelpers.getVisibleItems(oComboBox.getItems()).length, 3, "The items are filtered");

		// Act
		oComboBox.handleClearIconPress();
		await nextUIUpdate(this.clock);

		// Assert
		assert.ok(oComboBox.isOpen(), "ComboBox remains open");
		assert.strictEqual(ListHelpers.getVisibleItems(oComboBox.getItems()).length, 4, "The items are not filtered");

		// Clean
		oComboBox.destroy();
		fnRunAllTimersAndRestore(this.clock);
	});

	QUnit.module("List item styles");

	QUnit.test(".sapMLIBFocused should not be applied on second typein", async function (assert) {
		// Arrange
		this.clock = sinon.useFakeTimers();
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
		await nextUIUpdate(this.clock);

		var oFirstMatchingItem;

		// Act - first typein
		oComboBox._$input.trigger("focus").val("i").trigger("input");
		this.clock.tick();

		// Assert
		assert.ok(oComboBox.isOpen(), "ComboBox is open");
		oFirstMatchingItem = oComboBox._getList().getItems()[1];
		assert.notOk(oFirstMatchingItem.hasStyleClass("sapMLIBFocused"), "First matching item should not include .sapMLIBFocused");

		// Act - second typein
		oComboBox._$input.val("it").trigger("input");
		this.clock.tick(1000);

		// Assert
		oFirstMatchingItem = oComboBox._getList().getItems()[1];
		assert.notOk(oFirstMatchingItem.hasStyleClass("sapMLIBFocused"), "First matching item should not include .sapMLIBFocused on second typein");

		oComboBox.destroy();
		fnRunAllTimersAndRestore(this.clock);
	});

	QUnit.module("Asynchronous oData binding handling", {
		before: function() {
			this.oMockServer = fnStartMockServer("/service/", 10);

		},
		after: function() {
			this.oMockServer.stop();
			this.oMockServer.destroy();
		},
		afterEach: function () {
			if (this.oComboBox) {
				this.oComboBox.destroy();
			}
			fnRunAllTimersAndRestore(this.clock);
		}
	});

	QUnit.test("it should correctly set the selection if the items aggregation is bounded to an OData model", function (assert) {
		this.clock = sinon.useFakeTimers();
		var done = assert.async();

		// system under test

		// arrange
		var sUri = "/service/";
		var iAutoRespondAfter = 10;
		const oModel = new ODataModel(sUri, true);

		// tick the clock ahead some ms millisecond (it should be at least more than the auto respond setting
		// to make sure that the data from the OData model is available)
		this.clock.tick(iAutoRespondAfter + 1);

		const oComboBox = new ComboBox({
			items: {
				path: "/Products",
				events: {
					dataReceived: async function() {
						oComboBox.placeAt("content");
						await nextUIUpdate();
						assert.strictEqual(oComboBox.getSelectedItem().getText(), "Monitor Locking Cable");

						oComboBox.destroy();
						oModel.destroy();

						done();
					}
				},
				template: new Item({
					key: "{ProductId}",
					text: "{Name}"
				})
			}
		});
		oComboBox.setModel(oModel);
		oComboBox.setSelectedKey("id_5");

		// assert
		assert.strictEqual(oComboBox.getSelectedKey(), "id_5");
		fnRunAllTimersAndRestore(this.clock);
	});

	QUnit.test("onsapshow Alt + DOWN - open the control's picker pop-up and select the text", async function (assert) {
		this.clock = sinon.useFakeTimers();

		// system under test
		const oComboBox = new ComboBox({
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
		await nextUIUpdate(this.clock);
		oComboBox.focus();

		// tick the clock ahead 0ms millisecond to make sure the async call to .selectText() on the focusin event
		// handler does not override the type ahead
		this.clock.tick(0);

		// open the dropdown list picker
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ARROW_RIGHT);

		// act
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN, false, true /* ctrl key is down */);

		// assert
		assert.strictEqual(oComboBox.getFocusDomRef().selectionStart, 0, "The text should be selected");
		assert.strictEqual(oComboBox.getFocusDomRef().selectionEnd, 7, "The text should be selected");

		// cleanup
		oComboBox.destroy();
	});

	QUnit.test("it should open the dropdown list, show the busy indicator and load the items asynchronous when Alt + Down keys are pressed", function (assert) {
		this.clock = sinon.useFakeTimers();
		var done = assert.async();
		var sUri = "/service/";
		var iAutoRespondAfter = 10;
		const oModel = new ODataModel(sUri);

		const oComboBox = new ComboBox({
			items: {
				path: "/Products",
				template: new Item({
					key: "{ProductId}",
					text: "{Name}"
				}),
				events: {
					dataRequested: function() {
						oComboBox.placeAt("content");
						nextUIUpdate().then(() => {
							oComboBox.focus();

							// act
							qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN, false, true);

							// assert
							assert.ok(oComboBox.isOpen(), "the dropdown list is open");
							assert.strictEqual(oComboBox._getList().getBusy(), true, "the loading indicator in the dropdown list is shown");
							assert.strictEqual(oComboBox.getFocusDomRef().getAttribute("aria-busy"), "true");
						});
					},
					dataReceived: function() {
						nextUIUpdate().then(() => {
							assert.ok(oComboBox.getItems().length > 0, "the items are loaded");
							assert.strictEqual(oComboBox._getList().getBusy(), false, "the loading indicator in the dropdown list is not shown");
							assert.strictEqual(jQuery(oComboBox.getFocusDomRef()).attr("aria-busy"), undefined);

							oComboBox.destroy();
							oModel.destroy();

							done();
						});
					}
				}
			},
			loadItems: function () {
				oComboBox.setModel(oModel);
			}
		});

		oComboBox.setModel(oModel);
		this.clock.tick(iAutoRespondAfter + 1);
		fnRunAllTimersAndRestore(this.clock);
	});

	QUnit.test("it should show busy indicator in the text field if the items are not loaded after a 300ms delay", async function (assert) {
		this.clock = sinon.useFakeTimers();
		// arrange
		var done = assert.async();
		var sUri = "/service/";
		var iAutoRespondAfter = 400;
		const oModel = new ODataModel(sUri, true);
		var that = this;

		var iOriginalAutoResponseTime = this.oMockServer._oServer.autoRespondAfter;

		// For this test increase the server response time to 400ms in order to simulate bigger delay in data loading.
		// Thus after 300ms the loading indicator of the items will be active and itmes will not be loaded yet
		fnUpdateMockServerResponseTime(this.oMockServer, iAutoRespondAfter);

		const oComboBox = new ComboBox({
			items: {
				path: "/Products",
				template: new Item({
					key: "{ProductId}",
					text: "{Name}"
				}),
				events: {
					dataRequested: function () {
						that.clock.tick(300);
						assert.strictEqual(oComboBox.getBusy(), true);
						// Restore original clock after ticking the fake timers otherwise firing of dataReceived event will not happen.
						// If clock is not restored, the test execution hangs with fake timers, causing timeout.
						fnRunAllTimersAndRestore(that.clock);
					},
					dataReceived: function () {
						assert.strictEqual(oComboBox.getBusy(), false);

						oComboBox.destroy();
						oModel.destroy();
						// Restore mock server autoResponse time to initial value of 10ms
						fnUpdateMockServerResponseTime(that.oMockServer, iOriginalAutoResponseTime);

						done();
					}
				}
			},
			loadItems: function () {
				oComboBox.setModel(oModel);
			}
		});

		oComboBox.placeAt("content");
		await nextUIUpdate(this.clock);
		oComboBox.focus();

		// act
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN);

		this.clock.tick(iAutoRespondAfter + 1);
	});

	QUnit.test("it should load the items asynchronous when the Down arrow key is pressed and afterwards process the even", async function (assert) {
		this.clock = sinon.useFakeTimers();
		// arrange
		var done = assert.async();
		var sUri = "/service/";
		var iAutoRespondAfter = 10;
		const oModel = new ODataModel(sUri, true);

		const oComboBox = new ComboBox({
			items: {
				path: "/Products",
				template: new Item({
					key: "{ProductId}",
					text: "{Name}"
				}),
				events: {
					dataReceived: function () {
						// assert
						assert.ok(oComboBox.getItems().length > 0, "the items are loaded");
						assert.strictEqual(oComboBox.getValue(), "Psimax");

						if (!Device.browser.safari) { // Safari has issues with the cursor when the page is not "manually" focused
							assert.strictEqual(oComboBox.getSelectedText(), "Psimax", "the value in the input field is selected");
						}
						assert.strictEqual(oComboBox.getSelectedItem().getText(), "Psimax");
						assert.strictEqual(oComboBox.getSelectedItem().getKey(), "id_2");
						assert.strictEqual(oComboBox.getSelectedKey(), "id_2");

						oComboBox.destroy();
						oModel.destroy();

						done();
					}
				}
			},
			loadItems: function () {
				oComboBox.setModel(oModel);
			}
		});

		oComboBox.placeAt("content");
		await nextUIUpdate(this.clock);
		oComboBox.focus();

		// act
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN);
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN);

		// tick the clock ahead some ms millisecond (it should be at least more than the auto respond setting
		// to make sure that the data from the OData model is available)
		this.clock.tick(iAutoRespondAfter + 1);
		fnRunAllTimersAndRestore(this.clock);
	});

	QUnit.test("it should load the items asynchronous when the Home key is pressed select the first selectable item", async function (assert) {
		this.clock = sinon.useFakeTimers();
		// arrange
		var done = assert.async();
		var sUri = "/service/";
		var iAutoRespondAfter = 10;
		const oModel = new ODataModel(sUri);

		const oComboBox = new ComboBox({
			items: {
				path: "/Products",
				template: new Item({
					key: "{ProductId}",
					text: "{Name}"
				}),
				events: {
					dataReceived: function() {
						// assert
						assert.ok(oComboBox.getItems().length > 0, "the items are loaded");
						assert.strictEqual(oComboBox.getValue(), "Gladiator MX");

						if (!Device.browser.safari) { // Safari has issues with the cursor when the page is not "manually" focused
							assert.strictEqual(oComboBox.getSelectedText(), "Gladiator MX");
						}
						assert.strictEqual(oComboBox.getSelectedItem().getText(), "Gladiator MX");
						assert.strictEqual(oComboBox.getSelectedItem().getKey(), "id_1");
						assert.strictEqual(oComboBox.getSelectedKey(), "id_1");

						oComboBox.destroy();
						oModel.destroy();

						done();
					}
				}
			},
			loadItems: function() {
				oComboBox.setModel(oModel);
			}
		});

		oComboBox.placeAt("content");
		await nextUIUpdate(this.clock);
		oComboBox.focus();

		// act
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.HOME);

		// tick the clock ahead some ms millisecond (it should be at least more than the auto respond setting
		// to make sure that the data from the OData model is available)
		this.clock.tick(iAutoRespondAfter + 1);
		fnRunAllTimersAndRestore(this.clock);
	});

	QUnit.test("it should load the items asynchronous when the End key is pressed and afterwards process the event", async function (assert) {
		this.clock = sinon.useFakeTimers();
		var done = assert.async();
		var sUri = "/service/";
		var iAutoRespondAfter = 10;
		const oModel = new ODataModel(sUri);

		const oComboBox = new ComboBox({
			items: {
				path: "/Products",
				template: new Item({
					key: "{ProductId}",
					text: "{Name}"
				}),
				events: {
					dataReceived: function() {

						assert.ok(oComboBox.getItems().length > 0, "the items are loaded");
						assert.strictEqual(oComboBox.getValue(), "Hardcore Hacker");
						if (!Device.browser.safari) { // Safari has issues with the cursor when the page is not "manually" focused
							assert.strictEqual(oComboBox.getSelectedText(), "Hardcore Hacker", "the value in the input field is selected");
						}
						assert.strictEqual(oComboBox.getSelectedItem().getText(), "Hardcore Hacker");
						assert.strictEqual(oComboBox.getSelectedItem().getKey(), "id_16");
						assert.strictEqual(oComboBox.getSelectedKey(), "id_16");

						oComboBox.destroy();
						oModel.destroy();

						done();
					}
				}
			},
			loadItems: function() {
				oComboBox.setModel(oModel);
			}
		});

		oComboBox.placeAt("content");
		await nextUIUpdate(this.clock);
		oComboBox.focus();

		// act
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.END);

		// tick the clock ahead some ms millisecond (it should be at least more than the auto respond setting
		// to make sure that the data from the OData model is available)
		this.clock.tick(iAutoRespondAfter + 1);
		fnRunAllTimersAndRestore(this.clock);
	});

	QUnit.test("it should load the items asynchronous when the Page Down key is pressed and afterwards process the even", async function (assert) {
		this.clock = sinon.useFakeTimers();
		var done = assert.async();
		var sUri = "/service/";
		var iAutoRespondAfter = 10;
		const oModel = new ODataModel(sUri);

		const oComboBox = new ComboBox({
			items: {
				path: "/Products",
				template: new Item({
					key: "{ProductId}",
					text: "{Name}"
				}),
				events: {
					dataReceived: function() {
						assert.ok(oComboBox.getItems().length > 0, "the items are loaded");
						assert.strictEqual(oComboBox.getValue(), "Laser Allround Pro");

						if (!Device.browser.safari) { // Safari has issues with the cursor when the page is not "manually" focused
							assert.strictEqual(oComboBox.getSelectedText(), "Laser Allround Pro", "the value in the input field is selected");
						}

						assert.strictEqual(oComboBox.getSelectedItem().getText(), "Laser Allround Pro");
						assert.strictEqual(oComboBox.getSelectedItem().getKey(), "id_10");
						assert.strictEqual(oComboBox.getSelectedKey(), "id_10");

						oComboBox.destroy();
						oModel.destroy();

						done();
					}
				}
			},
			loadItems: function() {
				oComboBox.setModel(oModel);
			}
		});

		oComboBox.placeAt("content");
		await nextUIUpdate(this.clock);
		oComboBox.focus();

		// act
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.PAGE_DOWN);

		// tick the clock ahead some ms millisecond (it should be at least more than the auto respond setting
		// to make sure that the data from the OData model is available)
		this.clock.tick(iAutoRespondAfter + 1);
		fnRunAllTimersAndRestore(this.clock);
	});

	QUnit.test("it should load the items asynchronous when the Page Up key is pressed and afterwards process the even", async function (assert) {
		this.clock = sinon.useFakeTimers();

		var done = assert.async();
		var sUri = "/service/";
		var iAutoRespondAfter = 10;
		const oModel = new ODataModel(sUri);

		const oComboBox = new ComboBox({
			items: {
				path: "/Products",
				template: new Item({
					key: "{ProductId}",
					text: "{Name}"
				}),
				events: {
					dataReceived: function() {
						assert.ok(oComboBox.getItems().length > 0, "the items are loaded");
						assert.strictEqual(oComboBox.getValue(), "Gladiator MX");
						if (!Device.browser.safari) { // Safari has issues with the cursor when the page is not "manually" focused
							assert.strictEqual(oComboBox.getSelectedText(), "Gladiator MX", "the value in the input field is selected");
						}
						assert.strictEqual(oComboBox.getSelectedItem().getText(), "Gladiator MX");
						assert.strictEqual(oComboBox.getSelectedItem().getKey(), "id_1");
						assert.strictEqual(oComboBox.getSelectedKey(), "id_1");

						oComboBox.destroy();
						oModel.destroy();

						done();
					}
				}
			},
			loadItems: function() {
				oComboBox.setModel(oModel);
			}
		});

		oComboBox.placeAt("content");
		await nextUIUpdate(this.clock);
		oComboBox.focus();

		// act
		qutils.triggerKeydown(oComboBox.getFocusDomRef(), KeyCodes.PAGE_UP);

		// tick the clock ahead some ms millisecond (it should be at least more than the auto respond setting
		// to make sure that the data from the OData model is available)
		this.clock.tick(iAutoRespondAfter + 1);
		fnRunAllTimersAndRestore(this.clock);
	});

	QUnit.test("it should load the items asynchronous and perform autocomplete", async function (assert) {
		this.clock = sinon.useFakeTimers();
		var done = assert.async();
		var sUri = "/service/";
		var iAutoRespondAfter = 10;
		const oModel = new ODataModel(sUri);

		this.oComboBox = new ComboBox({
			items: {
				path: "/Products",
				template: new Item({
					key: "{ProductId}",
					text: "{Name}"
				}),
				events: {
					dataReceived: function() {
						assert.strictEqual(this.oComboBox.getValue(), "Flat S", "the value is correct");

						if (!Device.browser.safari) { // Safari has issues with the cursor when the page is not "manually" focused
							assert.strictEqual(this.oComboBox.getSelectedText(), "at S", "the word completion is correct");
						}

						assert.strictEqual(this.oComboBox.getSelectedItem().getText(), "Flat S");
						assert.strictEqual(this.oComboBox.getSelectedItem().getKey(), "id_11");
						assert.strictEqual(this.oComboBox.getSelectedKey(), "id_11");
						assert.strictEqual(this.oComboBox.getItems().length, 16, "the items are loaded");
						assert.strictEqual(ListHelpers.getVisibleItems(this.oComboBox.getItems()).length, 3, "the suggestion list is filtered");
						assert.ok(this.oComboBox.isOpen());

						done();
					}.bind(this)
				}
			},
			loadItems: function() {
				this.oComboBox.setModel(oModel);
			}.bind(this)
		});

		this.oComboBox.placeAt("content");
		await nextUIUpdate(this.clock);
		this.oComboBox.focus();
		var oTarget = this.oComboBox.getFocusDomRef();

		// fake user interaction, (the keydown and input events)
		oTarget.value = "F";
		qutils.triggerKeydown(oTarget, KeyCodes.F);
		qutils.triggerEvent("input", oTarget);
		await nextUIUpdate(this.clock);

		oTarget.value = "Fl";
		qutils.triggerKeydown(oTarget, KeyCodes.L);
		qutils.triggerEvent("input", oTarget);
		await nextUIUpdate(this.clock);

		// tick the clock ahead some ms millisecond (it should be at least more than the auto respond setting
		// to make sure that the data from the OData model is available)
		this.clock.tick(iAutoRespondAfter + 2);

		this.clock.runToLast();
		this.clock.restore(); // Restore the normal timers because "dataReceived" function will timeout otherwise
	});

	QUnit.module("General Interaction", {
		beforeEach: async function () {
			this.clock = sinon.useFakeTimers();
			this.oComboBox = new ComboBox({
				value: "1000",
				items: [
					new Item({text: "1000"}),
					new Item({text: "100"})
				]
			}).placeAt("content");
			await nextUIUpdate(this.clock);
		},
		afterEach: function () {
			this.oComboBox.destroy();
			fnRunAllTimersAndRestore(this.clock);
		}
	});

	QUnit.test("it should select item on backspace when having exact match", async function (assert) {
		// Arrange
		const oComboBox = this.oComboBox;
		const oItem = oComboBox.getItems()[0];
		const oFocusDomRef = oComboBox.getFocusDomRef();

		// Act
		oComboBox.setSelectedItem(oItem);
		await nextUIUpdate(this.clock);
		oComboBox.focus();
		qutils.triggerKeydown(oFocusDomRef, KeyCodes.BACKSPACE);
		oFocusDomRef.value = "100";
		qutils.triggerEvent("input", oFocusDomRef, { value: "100" });
		this.clock.tick(0);

		assert.strictEqual(oComboBox.getSelectedItem(), oComboBox.getItems()[1], "The second item should be selected");
	});
});
