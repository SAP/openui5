/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/core/ControlBehavior",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/MultiComboBox",
	"sap/ui/core/Item",
	"sap/ui/core/Element",
	"sap/ui/model/json/JSONModel",
	"sap/m/ComboBoxBaseRenderer",
	"sap/ui/Device",
	"sap/ui/thirdparty/jquery",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/core/library",
	"sap/m/InputBase",
	"sap/m/Input",
	"sap/m/Link",
	"sap/ui/base/Event",
	"sap/base/Log",
	"sap/ui/events/KeyCodes",
	"sap/m/MultiComboBoxRenderer",
	"sap/m/Button",
	"sap/m/FormattedText",
	"sap/m/Tokenizer",
	"sap/ui/model/SimpleType",
	"sap/ui/core/ListItem",
	"sap/ui/dom/containsOrEquals",
	"sap/m/inputUtils/inputsDefaultFilter",
	"sap/m/inputUtils/ListHelpers",
	"sap/m/inputUtils/itemsVisibilityHandler",
	"sap/m/inputUtils/getTokenByItem",
	"sap/ui/core/SeparatorItem",
	"sap/ui/core/InvisibleText",
	"sap/m/library",
	"sap/ui/core/Lib"
], async function(
	ControlBehavior,
	qutils,
	createAndAppendDiv,
	MultiComboBox,
	Item,
	Element,
	JSONModel,
	ComboBoxBaseRenderer,
	Device,
	jQuery,
	nextUIUpdate,
	coreLibrary,
	InputBase,
	Input,
	Link,
	Event,
	Log,
	KeyCodes,
	MultiComboBoxRenderer,
	Button,
	FormattedText,
	Tokenizer,
	SimpleType,
	ListItem,
	containsOrEquals,
	inputsDefaultFilter,
	ListHelpers,
	itemsVisibilityHandler,
	getTokenByItem,
	SeparatorItem,
	InvisibleText,
	mLibrary,
	Library
) {
	"use strict";

	// shortcut for sap.ui.core.OpenState
	var OpenState = coreLibrary.OpenState;

	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	var nPopoverAnimationTick = 300;

	var TokenizerRenderMode = mLibrary.TokenizerRenderMode;

	createAndAppendDiv("MultiComboBoxContent").setAttribute("class", "select-content");

	function runAllTimersAndRestore(oClock) {
		if (!oClock) {
			return;
		}

		oClock.runAll();
		oClock.restore();
	}

	// make jQuery.now work with Sinon fake timers (since jQuery 2.x, jQuery.now caches the native Date.now)
	jQuery.now = function () {
		return Date.now();
	};

	await Library.load({ name: "sap.m" });
	var oResourceBundle = Library.getResourceBundleFor("sap.m");

	// =========================================================== //
	// Check UX requirements on                                    //
	// =========================================================== //

	// =========================================================== //
	// API module                                                  //
	// =========================================================== //

	QUnit.module("API", {
		afterEach: function () {
			runAllTimersAndRestore(this.clock);
		}
	});

	// ------------------------------ //
	// tests for default values       //
	// ------------------------------ //
	QUnit.test("constructor - items : []", function(assert) {

		// system under test
		var oMultiComboBox = new MultiComboBox({
			items : []
		});

		// arrange
		//oMultiComboBox.placeAt("MultiComboBoxContent");
		//await nextUIUpdate();

		// assertions
		assert.strictEqual(oMultiComboBox.getName(), "", 'Default name is ""');
		assert.strictEqual(oMultiComboBox.getVisible(), true, "By default the MultiComboBox control is visible");
		assert.strictEqual(oMultiComboBox.getEnabled(), true, "By default the MultiComboBox control is enabled");
		assert.strictEqual(oMultiComboBox.getWidth(), "100%", 'By default the "width" of the MultiComboBox control is ""');
		assert.strictEqual(oMultiComboBox.getValue(), "", 'By default the "value" of the MultiComboBox control is ""');
		assert.strictEqual(oMultiComboBox.getMaxWidth(), "100%",
				'By default the "max-width" of the MultiComboBox control is "100%"');
		assert.deepEqual(oMultiComboBox.getSelectedItems(), [],
				"By default the selected items of the MultiComboBox control is null");
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), [], 'By default the selected keys of the MultiComboBox control is ""');

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("constructor - items : [aItems]", async function(assert) {

		// system under test
		var oMultiComboBox = new MultiComboBox({
			items : [new Item({
				id : "item00000",
				key : "0",
				text : "item 0"
			}),

			new Item({
				id : "my-custom-item11111",
				key : "1",
				text : "item 1",
				enabled : false
			}),

			new Item({
				id : "item11111",
				key : "2",
				text : "item 2"
			})]
		});

		// arrange
		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate();

		// assertions
		assert.strictEqual(oMultiComboBox.getName(), "", 'Default name is ""');
		assert.strictEqual(oMultiComboBox.getVisible(), true, "By default the MultiComboBox control is visible");
		assert.strictEqual(oMultiComboBox.getEnabled(), true, "By default the MultiComboBox control is enabled");
		assert.strictEqual(oMultiComboBox.getWidth(), "100%", 'By default the "width" of the MultiComboBox control is ""');
		assert.strictEqual(oMultiComboBox.getValue(), "", 'By default the "value" of the MultiComboBox control is ""');
		assert.strictEqual(oMultiComboBox.getMaxWidth(), "100%",
				'By default the "max-width" of the MultiComboBox control is "100%"');
		assert.deepEqual(oMultiComboBox.getSelectedItems(), [],
				"By default the selected items of the MultiComboBox control is null");
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), [], 'By default the selected keys of the MultiComboBox control is ""');

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("constructor - selectedItems : [Item]", function(assert) {

		// system under test
		var oItem = new Item({
			key : "0",
			text : "item 0"
		});
		var oMultiComboBox = new MultiComboBox({
			selectedItems : [oItem]
		});

		// assertions
		assert.strictEqual(oMultiComboBox.getName(), "", 'Default name is ""');
		assert.strictEqual(oMultiComboBox.getVisible(), true, "By default the MultiComboBox control is visible");
		assert.strictEqual(oMultiComboBox.getEnabled(), true, "By default the MultiComboBox control is enabled");
		assert.strictEqual(oMultiComboBox.getWidth(), "100%", 'By default the "width" of the MultiComboBox control is ""');
		assert.strictEqual(oMultiComboBox.getValue(), "", 'By default the "value" of the MultiComboBox control is ""');
		assert.strictEqual(oMultiComboBox.getMaxWidth(), "100%",
				'By default the "max-width" of the MultiComboBox control is "100%"');
		assert.deepEqual(oMultiComboBox.getSelectedItems(), [oItem],
				"By default the selected items of the MultiComboBox control is null");
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), [oItem.getKey()],
				'By default the selected keys of the MultiComboBox control is ""');

		// cleanup
		oMultiComboBox.destroy();
	});
	QUnit.test("constructor - items : [Item], selectedItems : [Item]", function(assert) {

		// system under test
		var oItem;
		var oMultiComboBox = new MultiComboBox({
			items : [oItem = new Item({
				key : "0",
				text : "item 0"
			})],

			selectedItems : [oItem]
		});

		// assertions
		assert.deepEqual(oMultiComboBox.getSelectedItems(), [oItem]);
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), [oItem.getKey()]);

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("constructor - selectedItems : [Id], items : [Item]", function(assert) {

		// system under test
		var oItem;
		var oMultiComboBox = new MultiComboBox({
			selectedItems : ["item00000"],
			items : [oItem = new Item({
				id : "item00000",
				key : "0",
				text : "item 0"
			})]
		});

		// assertions
		assert.deepEqual(oMultiComboBox.getSelectedItems(), [oItem]);
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), [oItem.getKey()]);

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("constructor - selectedItems without keys: [Item1, Item2], selectedItems : [Item1, Item2]", function(assert) {

		// system under test
		var oItem1, oItem2;
		var oMultiComboBox = new MultiComboBox({
			selectedItems : [oItem1 = new Item({
				text : "item 1"
			}), oItem2 = new Item({
				text : "item 2"
			})],
			items : [oItem1, oItem2]
		});

		// assertions
		assert.deepEqual(oMultiComboBox.getSelectedItems(), [oItem1, oItem2]);
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), ["", ""]);

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("constructor - selectedItems : [Item], items : [Item], setSelectedKey programatically - check fired events", function(assert) {

				// system under test
				var oItem;
				var oMultiComboBox = new MultiComboBox({
					selectedItems : ["item00000"],
					items : [oItem = new Item({
						id : "item00000",
						key : "0",
						text : "item 0"
					})]
				});
				var fnFireSelectionChangeSpy = this.spy(oMultiComboBox, "fireSelectionChange");
				var fnFireSelectionFinishSpy = this.spy(oMultiComboBox, "fireSelectionFinish");

				// act
				oMultiComboBox.setSelectedKeys(["0"]);

				// assertions
				assert.strictEqual(fnFireSelectionChangeSpy.callCount, 0, "The selection change event was not fired");
				assert.strictEqual(fnFireSelectionFinishSpy.callCount, 0, "The selection finish event was not fired");
				assert.deepEqual(oMultiComboBox.getSelectedKeys(), ["0"]);
				assert.deepEqual(oMultiComboBox.getSelectedItems(), [oItem]);

				// cleanup
				fnFireSelectionChangeSpy.restore();
				fnFireSelectionFinishSpy.restore();
				oMultiComboBox.destroy();
			});

	QUnit.test("constructor - selectedItems : [Item], items : [Item], removeSelectedKey programatically - check fired events",
			function(assert) {

				// system under test
				var oMultiComboBox = new MultiComboBox({
					selectedItems : ["item00000"],
					items : [new Item({
						id : "item00000",
						key : "0",
						text : "item 0"
					})]
				});

				var fnFireSelectionChangeSpy = this.spy(oMultiComboBox, "fireSelectionChange");
				var fnFireSelectionFinishSpy = this.spy(oMultiComboBox, "fireSelectionFinish");

				// act
				oMultiComboBox.removeSelectedKeys(["0"]);

				// assertions
				assert.strictEqual(fnFireSelectionChangeSpy.callCount, 0, "The change event was not fired");
				assert.strictEqual(fnFireSelectionFinishSpy.callCount, 0, "The selection finish event was not fired");
				assert.deepEqual(oMultiComboBox.getSelectedKeys(), []);
				assert.deepEqual(oMultiComboBox.getSelectedItems(), []);

				// cleanup
				fnFireSelectionChangeSpy.restore();
				fnFireSelectionFinishSpy.restore();
				oMultiComboBox.destroy();
	});

	QUnit.test("constructor - selectedItems : [Item], items : [Item], removeSelectedKey via UI - check fired events",
		async function(assert) {

			// system under test
			var oModel = new JSONModel({
				"items" : [{
					"key" : "AL",
					"text" : "Algeria"
				}, {
					"key" : "AR",
					"text" : "Argentina"
				}, {
					"key" : "BH",
					"text" : "Bahrain"
				}]
			});
			var oMultiComboBox = new MultiComboBox({
				items : {
					path : "/items",
					template : new Item({
						key : "{key}",
						text : "{text}"
					})
				}
			});
			oMultiComboBox.setModel(oModel);

			// arrange
			oMultiComboBox.syncPickerContent();
			oMultiComboBox.placeAt("MultiComboBoxContent");
			await nextUIUpdate();

			var fnFireSelectionChangeSpy = this.spy(oMultiComboBox, "fireSelectionChange");

			// act
			qutils.triggerCharacterInput(oMultiComboBox.getFocusDomRef(), "Algeria");
			qutils.triggerKeydown(oMultiComboBox.getDomRef(), KeyCodes.ENTER); //onsapenter

			// assertions
			assert.strictEqual(fnFireSelectionChangeSpy.callCount, 1, "The selection change event was fired");
			assert.strictEqual(fnFireSelectionChangeSpy.args[0][0].changedItem, oMultiComboBox.getSelectedItems()[0],
					"The selection change event parameter was passed");

			// cleanup
			fnFireSelectionChangeSpy.restore();
			oMultiComboBox.destroy();
	});

	QUnit.test("constructor, check selectedKeys - items:[Items]", async function(assert) {

		// system under test
		var oItem0, oItem1, oItem2, oItem3;
		var oMultiComboBox = new MultiComboBox({
			items: [
				oItem0 = new Item({
					key: "0",
					text: "item 0"
				}),

				oItem1 = new Item({
					key: "1",
					text: "item 1"
				}),

				oItem2 = new Item({
					key: "2",
					text: "item 2"
				}),

				oItem3 = new Item({
					key: "",
					text: "item 3"
				})
			]
		}).placeAt("MultiComboBoxContent");
		await nextUIUpdate();

		// assertions
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), []);
		assert.deepEqual(oMultiComboBox.getSelectedItems(), []);

		oMultiComboBox.setSelectedKeys(["0"]);
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), ["0"]);
		assert.deepEqual(oMultiComboBox.getSelectedItems(), [oItem0]);
		assert.deepEqual(oItem0.data(ListHelpers.CSS_CLASS + "Token"), getTokenByItem(oItem0));
		assert.deepEqual(oItem1.data(ListHelpers.CSS_CLASS + "Token"), null);
		assert.deepEqual(oItem2.data(ListHelpers.CSS_CLASS + "Token"), null);

		oMultiComboBox.setSelectedKeys(["0", "1"]);
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), ["0", "1"]);
		assert.deepEqual(oMultiComboBox.getSelectedItems(), [oItem0, oItem1]);
		assert.deepEqual(oItem0.data(ListHelpers.CSS_CLASS + "Token"), getTokenByItem(oItem0));
		assert.deepEqual(oItem1.data(ListHelpers.CSS_CLASS + "Token"), getTokenByItem(oItem1));
		assert.deepEqual(oItem2.data(ListHelpers.CSS_CLASS + "Token"), null);

		oMultiComboBox.setSelectedKeys(null); // enforce default value
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), []);
		assert.deepEqual(oMultiComboBox.getSelectedItems(), []);
		assert.deepEqual(oItem0.data(ListHelpers.CSS_CLASS + "Token"), null);
		assert.deepEqual(oItem1.data(ListHelpers.CSS_CLASS + "Token"), null);
		assert.deepEqual(oItem2.data(ListHelpers.CSS_CLASS + "Token"), null);

		oMultiComboBox.setSelectedKeys(["0"]);
		oMultiComboBox.setSelectedKeys(["dummy"]);
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), ["dummy"]);
		assert.deepEqual(oMultiComboBox.getSelectedItems(), []);
		assert.deepEqual(oItem0.data(ListHelpers.CSS_CLASS + "Token"), null);
		assert.deepEqual(oItem1.data(ListHelpers.CSS_CLASS + "Token"), null);
		assert.deepEqual(oItem2.data(ListHelpers.CSS_CLASS + "Token"), null);

		oMultiComboBox.setSelectedKeys(["0"]);
		oMultiComboBox.setSelectedKeys([""]);
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), [""]);
		assert.deepEqual(oMultiComboBox.getSelectedItems(), [oItem3]);
		assert.deepEqual(oItem0.data(ListHelpers.CSS_CLASS + "Token"), null);
		assert.deepEqual(oItem1.data(ListHelpers.CSS_CLASS + "Token"), null);
		assert.deepEqual(oItem2.data(ListHelpers.CSS_CLASS + "Token"), null);

		oMultiComboBox.setSelectedKeys(["0", "1"]);
		oMultiComboBox.removeSelectedKeys(["1"]);
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), ["0"]);
		assert.deepEqual(oMultiComboBox.getSelectedItems(), [oItem0]);
		assert.deepEqual(oItem0.data(ListHelpers.CSS_CLASS + "Token"), getTokenByItem(oItem0));
		assert.deepEqual(oItem1.data(ListHelpers.CSS_CLASS + "Token"), null);
		assert.deepEqual(oItem2.data(ListHelpers.CSS_CLASS + "Token"), null);

		oMultiComboBox.removeSelectedKeys(["dummy"]);
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), ["0"]);
		assert.deepEqual(oMultiComboBox.getSelectedItems(), [oItem0]);
		assert.deepEqual(oItem0.data(ListHelpers.CSS_CLASS + "Token"), getTokenByItem(oItem0));
		assert.deepEqual(oItem1.data(ListHelpers.CSS_CLASS + "Token"), null);
		assert.deepEqual(oItem2.data(ListHelpers.CSS_CLASS + "Token"), null);

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("constructor, check selectedItems - items:[Items]", function(assert) {

		// system under test
		var oItem0, oItem1, oItem2, oItemDummy = new Item({
			text : "dummy"
		});
		var oMultiComboBox = new MultiComboBox({
			items : [oItem0 = new Item({
				text : "item 0"
			}), oItem1 = new Item({
				text : "item 1"
			}), oItem2 = new Item({
				text : "item 2"
			})]
		});

		// assertions
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), []);
		assert.deepEqual(oMultiComboBox.getSelectedItems(), []);

		oMultiComboBox.setSelectedItems([oItem0]);
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), [""]);
		assert.deepEqual(oMultiComboBox.getSelectedItems(), [oItem0]);

		oMultiComboBox.setSelectedItems([oItem0, oItem1]);
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), ["", ""]);
		assert.deepEqual(oMultiComboBox.getSelectedItems(), [oItem0, oItem1]);

		oMultiComboBox.setSelectedItems([null]);
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), []);
		assert.deepEqual(oMultiComboBox.getSelectedItems(), []);

		oMultiComboBox.setSelectedItems([oItem2, null, oItem1]);
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), ["", ""]);
		assert.deepEqual(oMultiComboBox.getSelectedItems(), [oItem2, oItem1]);

		oMultiComboBox.setSelectedItems([oItem0]);
		oMultiComboBox.setSelectedItems([oItemDummy]);
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), [""]);
		assert.deepEqual(oMultiComboBox.getSelectedItems(), [oItemDummy]);

		oMultiComboBox.setSelectedItems([oItem0]);
		oMultiComboBox.setSelectedItems([""]);
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), []);
		assert.deepEqual(oMultiComboBox.getSelectedItems(), []);

		oMultiComboBox.setSelectedItems([oItem0, oItem1]);
		oMultiComboBox.removeSelectedItem(oItem1);
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), [""]);
		assert.deepEqual(oMultiComboBox.getSelectedItems(), [oItem0]);

		oMultiComboBox.removeSelectedKeys(["dummy"]);
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), [""]);
		assert.deepEqual(oMultiComboBox.getSelectedItems(), [oItem0]);

		// cleanup
		oMultiComboBox.destroy();
	});

	// ------------------------------ //
	// xxxMaxWidth()                  //
	// ------------------------------ //

	QUnit.test("method: xxxMaxWidth() - maxWidth", async function(assert) {

		// system under test
		var oMultiComboBox = new MultiComboBox({
			items : [new Item({
				key : "0",
				text : "item 0"
			})],
			maxWidth : "300px"
		});

		// arrange
		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate();

		// assertions
		assert.strictEqual(oMultiComboBox.getMaxWidth(), "300px");
		assert.strictEqual(oMultiComboBox.getDomRef().style.maxWidth, "300px");

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("method: xxxMaxWidth() - maxWidth", async function(assert) {

		// system under test
		var oMultiComboBox = new MultiComboBox();

		// arrange
		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate();

		// act
		oMultiComboBox.setMaxWidth("30%");
		await nextUIUpdate();

		// assertions
		assert.strictEqual(oMultiComboBox.getMaxWidth(), "30%");
		assert.strictEqual(oMultiComboBox.getDomRef().style.maxWidth, "30%");

		// cleanup
		oMultiComboBox.destroy();
	});

	// ------------------------------ //
	// getSelectedXXX()               //
	// ------------------------------ //

	QUnit.test("method: getSelectedXXX() - items : [Item], selectedItems : [Item]", function(assert) {

		// system under test
		var oItem;
		var oMultiComboBox = new MultiComboBox({
			items : [oItem = new Item({
				key : "0",
				text : "item 0"
			})],

			selectedItems : [oItem]
		});

		// assertions
		assert.deepEqual(oMultiComboBox.getSelectedItems(), [oItem]);
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), [oItem.getKey()]);

		// cleanup
		oMultiComboBox.destroy();
	});
	QUnit.test("method: getSelectedXXX() - items : [Item], selectedItems : [Item] - setSelectedItems(DummyItem)", function(assert) {

		// system under test
		var oItem, oItemDummy;
		var oMultiComboBox = new MultiComboBox({
			items : [oItem = new Item({
				key : "0",
				text : "item 0"
			})],
			selectedItems : [oItem]
		});
		oMultiComboBox.setSelectedItems([oItemDummy = new Item({
			key : "Dummy",
			text : "Dummy item 1"
		})]);

		// assertions
		assert.deepEqual(oMultiComboBox.getSelectedItems(), [oItemDummy]);
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), [oItemDummy.getKey()]);

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("method: getSelectedXXX() - items : [Item], selectedItems : DummyId", function(assert) {

		// system under test
		var oMultiComboBox = new MultiComboBox({
			items : [new Item({
				key : "0",
				text : "item 0"
			})],

			selectedItems : "Dummy"
		});

		// assertions
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), []);
		assert.deepEqual(oMultiComboBox.getSelectedItems(), []);

		// cleanup
		oMultiComboBox.destroy();
	});
	QUnit.test("method: getSelectedXXX() - items : [Items], selectedItems : [Items]", function(assert) {

		// system under test
		var oItem, oItem2;
		var oMultiComboBox = new MultiComboBox({
			items : [oItem = new Item({
				key : "0",
				text : "item 0"
			}),

			new Item({
				key : "1",
				text : "item 1"
			}),

			oItem2 = new Item({
				id : "myItem0",
				key : "2",
				text : "item 2"
			}),

			new Item({
				key : "3",
				text : "item 3"
			})],

			selectedItems : [oItem, oItem2]
		});

		// assertions
		assert.deepEqual(oMultiComboBox.getSelectedItems(), [oItem, oItem2]);
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), [oItem.getKey(), oItem2.getKey()]);

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("method: getSelectedXXX() - selectedItems : Id, items : [Items]", function(assert) {

		// system under test
		var oItem;
		var oMultiComboBox = new MultiComboBox({

			selectedItems : "myItem2",

			items : [new Item({
				key : "0",
				text : "item 0"
			}),

			new Item({
				key : "1",
				text : "item 1"
			}),

			oItem = new Item({
				id : "myItem2",
				key : "2",
				text : "item 2"
			}),

			new Item({
				key : "3",
				text : "item 3"
			})]
		});

		// arrange
		//oMultiComboBox.placeAt("MultiComboBoxContent");
		//await nextUIUpdate();

		// assertions
		assert.deepEqual(oMultiComboBox.getSelectedItems(), [oItem]);
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), [oItem.getKey()]);

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("method: getSelectedXXX() - selectedItems : [dummy], items : [Items]", function(assert) {

		// system under test
		var oMultiComboBox = new MultiComboBox({

			selectedItems : "dummy",

			items : [new Item({
				key : "0",
				text : "item 0"
			}),

			new Item({
				key : "1",
				text : "item 1"
			}),

			new Item({
				id : "myItem2",
				key : "2",
				text : "item 2"
			}),

			new Item({
				key : "3",
				text : "item 3"
			})]
		});

		// assertions
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), []);
		assert.deepEqual(oMultiComboBox.getSelectedItems(), []);

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("method: getSelectedXXX() - items : []", function(assert) {

		// system under test
		var oMultiComboBox = new MultiComboBox({
			items : []
		});

		// assertions
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), []);
		assert.deepEqual(oMultiComboBox.getSelectedItems(), []);

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("method: getSelectedXXX() - items, selectedItems : null", function(assert) {

		// system under test
		var oMultiComboBox = new MultiComboBox({
			items : [new Item({
				key : "0",
				text : "item 0"
			}),

			new Item({
				key : "1",
				text : "item 1"
			}),

			new Item({
				key : "2",
				text : "item 2"
			})],

			selectedItems : null
		});

		// arrange
		//oMultiComboBox.placeAt("MultiComboBoxContent");
		//await nextUIUpdate();

		// assertions
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), []);
		assert.deepEqual(oMultiComboBox.getSelectedItems(), []);

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test('method: getSelectedXXX() - items - addSelectedItem', function(assert) {

		// system under test
		var oItem;
		var oMultiComboBox = new MultiComboBox({
			items : [oItem = new Item({
				key : "0",
				text : "item 0"
			}),

			new Item({
				key : "1",
				text : "item 1"
			}),

			new Item({
				key : "2",
				text : "item 2"
			})]
		});
		oMultiComboBox.addSelectedItem(oItem);
		oMultiComboBox.addSelectedItem(oItem);

		// assertions
		assert.deepEqual(oMultiComboBox.getSelectedItems(), [oItem]);
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), [oItem.getKey()]);

		// cleanup
		oMultiComboBox.destroy();
	});

	// ------------------------------ //
	// addItem                        //
	// ------------------------------ //

	QUnit.test("method: addItem() - with key and text", async function(assert) {

		// system under test
		var oMultiComboBox = new MultiComboBox();

		oMultiComboBox.placeAt("MultiComboBoxContent");

		// arrange
		var fnAddAggregationSpy = this.spy(oMultiComboBox, "addAggregation");
		var fnAddItemSpy = this.spy(oMultiComboBox, "addItem");
		var oItem = new Item({
			key : "0",
			text : "item 0"
		});

		oMultiComboBox.syncPickerContent();
		await nextUIUpdate();
		var fnListAddAggregationSpy = this.spy(oMultiComboBox._getList(), "addAggregation");

		// act
		oMultiComboBox.addItem(oItem);
		await nextUIUpdate();

		oMultiComboBox.open();
		await nextUIUpdate();

		// assertions
		assert.ok(fnAddAggregationSpy.calledWith("items", oItem),
				"sap.m.MultiComboBox.addAggregation() method was called with the expected arguments");
		assert.ok(fnListAddAggregationSpy.calledWith("items", ListHelpers.getListItem(oItem)),
				"sap.m.List.addAggregation() method was called with the expected arguments");
		assert.ok(fnAddItemSpy.returned(oMultiComboBox));
		assert.deepEqual(oMultiComboBox.getAggregation("items"), [oItem]);
		assert.deepEqual(oMultiComboBox.getItems(), [oItem]);
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), []);
		assert.deepEqual(oMultiComboBox.getSelectedItems(), []);
		assert.equal(oMultiComboBox.getItems()[0].getKey(), "0", "key is not empty");
		assert.equal(oMultiComboBox.getItems()[0].getText(), "item 0", "text is not empty");

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("method: addItem() - with text", async function(assert) {

		// system under test
		var oMultiComboBox = new MultiComboBox();

		// arrange
		oMultiComboBox.syncPickerContent();
		var fnAddAggregationSpy = this.spy(oMultiComboBox, "addAggregation");
		var fnListAddAggregationSpy = this.spy(oMultiComboBox._getList(), "addAggregation");
		var fnAddItemSpy = this.spy(oMultiComboBox, "addItem");
		var oItem = new Item({
			text : "item 0"
		});

		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate();

		// act
		oMultiComboBox.addItem(oItem);
		await nextUIUpdate();

		// assertions
		assert.ok(fnAddAggregationSpy.calledWith("items", oItem),
				"sap.m.MultiComboBox.addAggregation() method was called with the expected arguments");
		assert.ok(fnListAddAggregationSpy.calledWith("items", ListHelpers.getListItem(oItem)),
				"sap.m.List.addAggregation() method was called with the expected arguments");
		assert.ok(fnAddItemSpy.returned(oMultiComboBox));
		assert.deepEqual(oMultiComboBox.getAggregation("items"), [oItem]);
		assert.deepEqual(oMultiComboBox.getItems(), [oItem]);
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), []);
		assert.deepEqual(oMultiComboBox.getSelectedItems(), []);
		assert.equal(oMultiComboBox.getItems()[0].getKey(), "", "key is empty");
		assert.equal(oMultiComboBox.getItems()[0].getText(), "item 0", "text is not empty");

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("method: addItem()", async function(assert) {

		// system under test
		var oMultiComboBox = new MultiComboBox();

		// arrange
		oMultiComboBox.syncPickerContent();
		var fnAddAggregationSpy = this.spy(oMultiComboBox, "addAggregation");
		var fnListAddAggregationSpy = this.spy(oMultiComboBox._getList(), "addAggregation");
		var fnAddItemSpy = this.spy(oMultiComboBox, "addItem");
		var oItem = new Item();

		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate();

		// act
		oMultiComboBox.addItem(oItem);
		await nextUIUpdate();

		// assertions
		assert.ok(fnAddAggregationSpy.calledWith("items", oItem),
				"sap.m.MultiComboBox.addAggregation() method was called with the expected arguments");
		assert.ok(fnListAddAggregationSpy.calledWith("items", ListHelpers.getListItem(oItem)),
				"sap.m.List.addAggregation() method was called with the expected arguments");
		assert.ok(fnAddItemSpy.returned(oMultiComboBox));
		assert.deepEqual(oMultiComboBox.getAggregation("items"), [oItem]);
		assert.deepEqual(oMultiComboBox.getItems(), [oItem]);
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), []);
		assert.deepEqual(oMultiComboBox.getSelectedItems(), []);
		assert.equal(oMultiComboBox.getItems()[0].getKey(), "", "key is empty");
		assert.equal(oMultiComboBox.getItems()[0].getText(), "", "text is empty");

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("method: addItem() - twice", async function(assert) {

		// system under test
		var oMultiComboBox = new MultiComboBox();

		// arrange
		oMultiComboBox.syncPickerContent();

		var fnAddAggregationSpy = this.spy(oMultiComboBox, "addAggregation");
		var fnListAddAggregationSpy = this.spy(oMultiComboBox._getList(), "addAggregation");
		var fnAddItemSpy = this.spy(oMultiComboBox, "addItem");
		var oItem = new Item({
			key : "0",
			text : "item 0"
		});

		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate();

		// act
		oMultiComboBox.addItem(oItem);
		oMultiComboBox.addItem(oItem);
		await nextUIUpdate();

		// assertions
		assert.ok(fnAddAggregationSpy.calledWith("items", oItem),
				"sap.m.MultiComboBox.addAggregation() method was called with the expected arguments");
		assert.ok(fnListAddAggregationSpy.calledWith("items", ListHelpers.getListItem(oItem)),
				"sap.m.List.addAggregation() method was called with the expected arguments");
		assert.ok(fnAddItemSpy.returned(oMultiComboBox));
		assert.deepEqual(oMultiComboBox.getAggregation("items"), [oItem]);
		assert.deepEqual(oMultiComboBox.getItems(), [oItem]);
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), []);
		assert.deepEqual(oMultiComboBox.getSelectedItems(), []);

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("method: addItem(null)", async function(assert) {

		// system under test
		var oMultiComboBox = new MultiComboBox();

		// arrange
		oMultiComboBox.syncPickerContent();
		var fnAddAggregationSpy = this.spy(oMultiComboBox, "addAggregation");
		var fnAddItemSpy = this.spy(oMultiComboBox, "addItem");

		// act
		oMultiComboBox.addItem(null);
		await nextUIUpdate();

		// assertions
		assert.ok(fnAddAggregationSpy.calledWith("items", null),
				"sap.m.MultiComboBox.addAggregation() method was called with the expected arguments");
		assert.ok(fnAddItemSpy.returned(oMultiComboBox));
		assert.deepEqual(oMultiComboBox.getAggregation("items"), []);
		assert.deepEqual(oMultiComboBox.getItems(), []);
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), []);
		assert.deepEqual(oMultiComboBox.getSelectedItems(), []);

		// cleanup
		oMultiComboBox.destroy();
	});

	// ------------------------------ //
	// removeXXX                      //
	// ------------------------------ //
	QUnit.test("method: removeItem(oItem)", async function(assert) {

		// system under test
		var oItem, oItemRemoved;
		var oMultiComboBox = new MultiComboBox({
			items : [oItem = new Item()],
			selectedItems : [oItem]
		});

		// arrange

		// act
		oItemRemoved = oMultiComboBox.removeItem(oItem);
		await nextUIUpdate();

		// assertions
		assert.strictEqual(oItemRemoved, oItem);
		assert.deepEqual(oMultiComboBox.getAggregation("items"), []);
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), []);
		assert.deepEqual(oMultiComboBox.getSelectedItems(), []);
		assert.deepEqual(oMultiComboBox.getAggregation("tokenizer").getTokens(), []);

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("method: removeItem(oItemDummy)", function(assert) {

		// system under test
		var oItem, oItemRemoved, oItemDummy = new Item();
		var oMultiComboBox = new MultiComboBox({
			items : [oItem = new Item()],
			selectedItems : [oItem]
		});

		// arrange

		// act
		oItemRemoved = oMultiComboBox.removeItem(oItemDummy);

		// assertions
		assert.strictEqual(oItemRemoved, null);
		assert.deepEqual(oMultiComboBox.getAggregation("items"), [oItem]);
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), [oItem.getKey()]);
		assert.deepEqual(oMultiComboBox.getSelectedItems(), [oItem]);
		assert.deepEqual(oMultiComboBox.getAggregation("tokenizer").getTokens(), [getTokenByItem(oItem)]);

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("method: removeItem(null)", function(assert) {

		// system under test
		var oItem, oItemRemoved;
		var oMultiComboBox = new MultiComboBox({
			items : [oItem = new Item()],
			selectedItems : [oItem]
		});

		// arrange

		// act
		oItemRemoved = oMultiComboBox.removeItem(null);

		// assertions
		assert.strictEqual(oItemRemoved, null);
		assert.deepEqual(oMultiComboBox.getAggregation("items"), [oItem]);
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), [oItem.getKey()]);
		assert.deepEqual(oMultiComboBox.getSelectedItems(), [oItem]);
		assert.deepEqual(oMultiComboBox.getAggregation("tokenizer").getTokens(), [getTokenByItem(oItem)]);

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("method: removeAllItems()", async function(assert) {

		// system under test
		var oItem, aItems;
		var oMultiComboBox = new MultiComboBox({
			items : [oItem = new Item()],
			selectedItems : [oItem]
		});

		// arrange

		// act
		aItems = oMultiComboBox.removeAllItems();
		await nextUIUpdate();

		// assertions
		assert.deepEqual(aItems, [oItem]);
		assert.deepEqual(oMultiComboBox.getItems(), []);
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), []);
		assert.deepEqual(oMultiComboBox.getSelectedItems(), []);
		assert.deepEqual(oMultiComboBox.getAggregation("tokenizer").getTokens(), []);

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("method: removeSelectedItem(oItem)", function(assert) {

		// system under test
		var oItem, oItemRemoved;
		var oMultiComboBox = new MultiComboBox({
			items : [oItem = new Item()],
			selectedItems : [oItem]
		});

		// arrange

		// act
		oItemRemoved = oMultiComboBox.removeSelectedItem(oItem);

		// assertions
		assert.strictEqual(oItem, oItemRemoved);
		assert.deepEqual(oMultiComboBox.getAggregation("items"), [oItem]);
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), []);
		assert.deepEqual(oMultiComboBox.getSelectedItems(), []);
		assert.deepEqual(oMultiComboBox.getAggregation("tokenizer").getTokens(), []);

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("method: removeSelectedItem(oItemDummy)", function(assert) {

		// system under test
		var oItem, oItemRemoved, oItemDummy = new Item();
		var oMultiComboBox = new MultiComboBox({
			items : [oItem = new Item()],
			selectedItems : [oItem]
		});

		// arrange

		// act
		oItemRemoved = oMultiComboBox.removeSelectedItem(oItemDummy);

		// assertions
		assert.strictEqual(oItemRemoved, null);
		assert.deepEqual(oMultiComboBox.getAggregation("items"), [oItem]);
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), [oItem.getKey()]);
		assert.deepEqual(oMultiComboBox.getSelectedItems(), [oItem]);
		assert.deepEqual(oMultiComboBox.getAggregation("tokenizer").getTokens(), [getTokenByItem(oItem)]);

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("method: removeSelectedItem(null)", function(assert) {

		// system under test
		var oItem, oItemRemoved;
		var oMultiComboBox = new MultiComboBox({
			items : [oItem = new Item()],
			selectedItems : [oItem]
		});

		// arrange

		// act
		oItemRemoved = oMultiComboBox.removeSelectedItem(null);

		// assertions
		assert.strictEqual(oItemRemoved, null);
		assert.deepEqual(oMultiComboBox.getAggregation("items"), [oItem]);
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), [oItem.getKey()]);
		assert.deepEqual(oMultiComboBox.getSelectedItems(), [oItem]);
		assert.deepEqual(oMultiComboBox.getAggregation("tokenizer").getTokens(), [getTokenByItem(oItem)]);

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("method: removeSelectedItem(oItem) with customer key", function(assert) {

		// system under test
		var oItem, oItemRemoved;
		var oMultiComboBox = new MultiComboBox({
			items : [oItem = new Item()],
			selectedKeys : ["dummyKey"],
			selectedItems : [oItem]
		});

		// arrange

		// act
		oItemRemoved = oMultiComboBox.removeSelectedItem(oItem);

		// assertions
		assert.strictEqual(oItemRemoved, oItem);
		assert.deepEqual(oMultiComboBox.getAggregation("items"), [oItem]);
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), ["dummyKey"]);
		assert.deepEqual(oMultiComboBox.getSelectedItems(), []);
		assert.deepEqual(oMultiComboBox.getAggregation("tokenizer").getTokens(), []);

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("method: removeAllSelectedItems()", function(assert) {

		// system under test
		var oItem, aIds;
		var oMultiComboBox = new MultiComboBox({
			items : [oItem = new Item()],
			selectedItems : [oItem]
		});

		// arrange

		// act
		aIds = oMultiComboBox.removeAllSelectedItems();

		// assertions
		assert.deepEqual(aIds, [oItem.getId()]);
		assert.deepEqual(oMultiComboBox.getAggregation("items"), [oItem]);
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), []);
		assert.deepEqual(oMultiComboBox.getSelectedItems(), []);
		assert.deepEqual(oMultiComboBox.getAggregation("tokenizer").getTokens(), []);

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("method: removeAllSelectedItems() with customer key", function(assert) {

		// system under test
		var oItem, aIds;
		var oMultiComboBox = new MultiComboBox({
			items : [oItem = new Item()],
			selectedKeys : ["dummyKey"],
			selectedItems : [oItem]
		});

		// arrange

		// act
		aIds = oMultiComboBox.removeAllSelectedItems();

		// assertions
		assert.deepEqual(aIds, [oItem.getId()]);
		assert.deepEqual(oMultiComboBox.getAggregation("items"), [oItem]);
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), ["dummyKey"]);
		assert.deepEqual(oMultiComboBox.getSelectedItems(), []);
		assert.deepEqual(oMultiComboBox.getAggregation("tokenizer").getTokens(), []);

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("method: destroyItems()", async function(assert) {

		// system under test
		var oItem;
		var oMultiComboBox = new MultiComboBox({
			items : [oItem = new Item({ key: "a" })],
			selectedItems : [oItem]
		});

		// arrange
		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate();

		// act
		oMultiComboBox.destroyItems();
		await nextUIUpdate();

		// assertions
		assert.deepEqual(oMultiComboBox.getItems(), []);
		assert.deepEqual(oMultiComboBox.getAggregation("items"), []);
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), []);
		assert.deepEqual(oMultiComboBox.getSelectedItems(), []);
		assert.deepEqual(oMultiComboBox.getAggregation("tokenizer").getTokens(), []);

		// cleanup
		oMultiComboBox.destroy();
	});

	// ------------------------------ //
	// insertItem                     //
	// ------------------------------ //

	QUnit.test("method: insertItem()", async function(assert) {

		// system under test
		var oMultiComboBox = new MultiComboBox();

		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate();

		// arrange
		oMultiComboBox.syncPickerContent();
		await nextUIUpdate();

		var fnInsertAggregation = this.spy(oMultiComboBox, "insertAggregation");
		var fnInsertItem = this.spy(oMultiComboBox, "insertItem");
		var oItem = new Item({
			key : "0",
			text : "item 0"
		});

		// act
		oMultiComboBox.insertItem(oItem, 0);
		await nextUIUpdate();

		oMultiComboBox.syncPickerContent(true);
		await nextUIUpdate();

		// assertions
		assert.ok(fnInsertAggregation.calledWith("items", oItem, 0),
				"oMultiComboBox.insertAggregation() method was called with the expected arguments");
		assert.ok(fnInsertItem.returned(oMultiComboBox), 'oMultiComboBox.insertAggregation() method return the "this" reference');
		assert.strictEqual(oMultiComboBox._getList().getItems().length, 1, 'One item should be availble in the list');

		// cleanup
		oMultiComboBox.destroy();
	});

	//------------------------------ //
	// _isListInSuggestMode          //
	// ------------------------------ //

	QUnit.test("method: _isListInSuggestMode - complete list", async function(assert) {
		this.clock = sinon.useFakeTimers();

		// system under test
		var oMultiComboBox = new MultiComboBox({
			items : [new Item({
				text : "item1"
			}), new Item({
				text : "item2"
			}), new Item({
				text : "item3"
			})]
		});

		// arrange
		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate(this.clock);

		// act
		oMultiComboBox.open();
		this.clock.tick(500);

		// assertions
		assert.ok(!oMultiComboBox._isListInSuggestMode(), 'Complete list is displayed');

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("method: _isListInSuggestMode complete list with disabled item", async function(assert) {
		this.clock = sinon.useFakeTimers();
		// system under test
		var oMultiComboBox = new MultiComboBox({
			items : [new Item({
				text : "item1",
				enabled : false
			}), new Item({
				text : "item2"
			}), new Item({
				text : "item3"
			})]
		});

		// arrange
		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate(this.clock);

		// act
		oMultiComboBox.open();
		this.clock.tick(500);

		// assertions
		assert.ok(!oMultiComboBox._isListInSuggestMode(), 'Complete list is displayed');

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("method: _isListInSuggestMode suggest list", async function(assert) {
		this.clock = sinon.useFakeTimers();
		// system under test
		var oMultiComboBox = new MultiComboBox({
			items : [new Item({
				text : "item1"
			}), new Item({
				text : "item2"
			}), new Item({
				text : "item3"
			})]
		});

		// arrange
		oMultiComboBox.syncPickerContent();
		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate(this.clock);

		// act
		ListHelpers.getListItem(oMultiComboBox.getFirstItem()).setVisible(false);
		oMultiComboBox.open();
		this.clock.tick(500);

		// assertions
		assert.ok(oMultiComboBox._isListInSuggestMode(), 'Suggest list is displayed');

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("method: _isListInSuggestMode suggest list with disabled item", async function(assert) {
		this.clock = sinon.useFakeTimers();
		// system under test
		var oMultiComboBox = new MultiComboBox({
			items : [new Item({
				text : "item1"
			}), new Item({
				text : "item2",
				enabled : false
			}), new Item({
				text : "item3"
			})]
		});

		// arrange
		oMultiComboBox.syncPickerContent();
		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate(this.clock);

		// act
		ListHelpers.getListItem(oMultiComboBox.getFirstItem()).setVisible(false);
		oMultiComboBox.open();
		this.clock.tick(500);

		// assertions
		assert.ok(oMultiComboBox._isListInSuggestMode(), 'Suggest list is displayed');

		// cleanup
		oMultiComboBox.destroy();
	});

	// ------------------------------ //
	// setSelectedItems()              //
	// ------------------------------ //

	QUnit.test("method: setSelectedItems() - [null] : should give an warning when called with faulty parameter", function(assert) {
		// system under test
		var oMultiComboBox = new MultiComboBox();

		// arrange
		var fnSetPropertySpy = this.spy(oMultiComboBox, "setProperty");
		var fnSetAssociationSpy = this.spy(oMultiComboBox, "setAssociation");
		var fnErrorSpy = this.spy(Log, "warning");
		var fnFireChangeSpy = this.spy(oMultiComboBox, "fireChange");
		var fnSetSelectedItemsSpy = this.spy(oMultiComboBox, "setSelectedItems");

		// act
		oMultiComboBox.setSelectedItems([null]);

		// assertions
		assert.strictEqual(fnErrorSpy.callCount, 1, "Log.warning() method was called");
		assert.strictEqual(fnSetPropertySpy.callCount, 0, "sap.m.MultiComboBox.prototype.setProperty() method was not called");
		assert.strictEqual(fnSetAssociationSpy.callCount, 0,
				"sap.m.MultiComboBox.prototype.setAssociation() method was not called");
		assert.strictEqual(fnFireChangeSpy.callCount, 0, "The change event was not fired");
		//assert.strictEqual(oMultiComboBox.getSelectedItemId(), "");
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), []);
		assert.deepEqual(oMultiComboBox.getSelectedItems(), []);
		assert.ok(fnSetSelectedItemsSpy.returned(oMultiComboBox),
				'sap.m.MultiComboBox.prototype.setSelectedItems() method return the "this" reference');

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("method: setSelectedItems() - [two items with same text] : should take over", async function(assert) {

		// system under test
		var oItem1, oItem2;
		var oMultiComboBox = new MultiComboBox({
			items : [oItem1 = new Item({
				key : "0",
				text : "same text"
			}),

			oItem2 = new Item({
				key : "1",
				text : "same item"
			}),

			new Item({
				key : "2",
				text : "item"
			})]
		});

		oMultiComboBox.setSelectedItems([oItem1, oItem2]);
		// arrange
		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate();

		// assertions
		assert.deepEqual(oMultiComboBox.getSelectedItems(), [oItem1, oItem2], "Should have both items");
		assert.strictEqual(oMultiComboBox.getAggregation("tokenizer").getTokens().length, 2, "should have two item");

		// cleanup
		oMultiComboBox.destroy();
	});
	QUnit.test("method: setSelectedKeys() - {} : should give an warning when called with faulty parameter", function(assert) {
		// system under test
		var oMultiComboBox = new MultiComboBox();

		// arrange
		var fnSetAssociationSpy = this.spy(oMultiComboBox, "setAssociation");
		var fnFireChangeSpy = this.spy(oMultiComboBox, "fireChange");
		var fnSetSelectedKeysSpy = this.spy(oMultiComboBox, "setSelectedKeys");

		// act
		oMultiComboBox.setSelectedKeys(null);

		// assertions
		assert.strictEqual(fnSetAssociationSpy.callCount, 0,
				"sap.m.MultiComboBox.prototype.setAssociation() method was not called");
		assert.strictEqual(fnFireChangeSpy.callCount, 0, "The change event was not fired");
		//assert.strictEqual(oMultiComboBox.getSelectedItemId(), "");
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), []);
		assert.deepEqual(oMultiComboBox.getSelectedItems(), []);
		assert.ok(fnSetSelectedKeysSpy.returned(oMultiComboBox),
				'sap.m.MultiComboBox.prototype.setSelectedKeys() method return the "this" reference');

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("method: setSelectedItems() - [oItem]", function(assert) {

		// system under test
		var oItem;
		var oMultiComboBox = new MultiComboBox({
			items : [new Item({
				key : "0",
				text : "item 0"
			}),

			oItem = new Item({
				id : "myItem1",
				key : "1",
				text : "item 1"
			}),

			new Item({
				key : "2",
				text : "item 2",
				enabled : false
			})]
		});

		// arrange
		//var fnSetPropertySpy = this.spy(oMultiComboBox, "setProperty");
		var fnAddAssociationSpy = this.spy(oMultiComboBox, "addAssociation");
		var fnFireChangeSpy = this.spy(oMultiComboBox, "fireChange");
		var fnSetSelectedItemsSpy = this.spy(oMultiComboBox, "setSelectedItems");

		// act
		oMultiComboBox.setSelectedItems([oItem]);

		// assertions
		//assert.ok(fnSetPropertySpy.calledWith("selectedKeys", [ oItem.getKey() ], true));
		//assert.ok(fnSetPropertySpy.calledWith("selectedItemId", "myItem1"));
		assert.ok(fnAddAssociationSpy.calledWith("selectedItems", oItem));
		assert.ok(fnSetSelectedItemsSpy.returned(oMultiComboBox),
				'sap.m.MultiComboBox.prototype.setSelectedItems() method return the "this" reference');

		assert.deepEqual(oMultiComboBox.getSelectedKeys(), [oItem.getKey()]);
		assert.deepEqual(oMultiComboBox.getSelectedItems(), [oItem]);

		assert.strictEqual(fnFireChangeSpy.callCount, 0, "The change event was not fired");

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("method: setSelectedItems() - [Id]", function(assert) {

		// system under test
		var oItem;
		var oMultiComboBox = new MultiComboBox({
			items : [new Item({
				key : "0",
				text : "item 0"
			}),

			oItem = new Item({
				id : "myItem1-1",
				key : "1",
				text : "item 1"
			}),

			new Item({
				key : "2",
				text : "item 2",
				enabled : false
			})]
		});

		// arrange
		var fnAddAssociationSpy = this.spy(oMultiComboBox, "addAssociation");
		var fnFireChangeSpy = this.spy(oMultiComboBox, "fireChange");
		var fnSetSelectedItemsSpy = this.spy(oMultiComboBox, "setSelectedItems");

		// act
		oMultiComboBox.setSelectedItems([oItem.getId()]);

		// assertions
		assert.ok(fnAddAssociationSpy.calledWith("selectedItems", oItem));
		assert.ok(fnSetSelectedItemsSpy.returned(oMultiComboBox),
				'sap.m.MultiComboBox.prototype.setSelectedItems() method return the "this" reference');

		assert.deepEqual(oMultiComboBox.getSelectedKeys(), [oItem.getKey()]);
		assert.deepEqual(oMultiComboBox.getSelectedItems(), [oItem]);
		assert.strictEqual(fnFireChangeSpy.callCount, 0, "The change event was not fired");

		//await nextUIUpdate();
		//assert.strictEqual(oMultiComboBox.getValue(), "item 1");

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("Firing event: setSelectedItems() set the selected item when the MultiComboBox popup menu is open", async function(assert) {

		// system under test
		var oItem;
		var oMultiComboBox = new MultiComboBox({
			items : [new Item({
				key : "0",
				text : "item 0"
			}),

			new Item({
				key : "1",
				text : "item 1"
			}),

			oItem = new Item({
				key : "2",
				text : "item 2"
			})]
		});

		// arrange
		oMultiComboBox.setSelectedKeys(["1"]);
		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate();

		oMultiComboBox.open();

		// act
		oMultiComboBox.setSelectedKeys([oItem.getKey()]);

		// assertion
		// 1. the popup should not be closed
		// 2. new selection should be took over
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), [oItem.getKey()]);
		assert.deepEqual(oMultiComboBox.getSelectedItems(), [oItem]);

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("method: getSelectedKeys()", function(assert) {

		// system under test
		var oMultiComboBox = new MultiComboBox({
			items : [new Item({
				key : "0",
				text : "item 0"
			})]
		});

		// assertions
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), []);

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("method: getSelectedKeys()", function(assert) {

		// system under test
		var oItem;
		var oMultiComboBox = new MultiComboBox({
			items : [new Item({
				key : "0",
				text : "item 0"
			}),

			new Item({
				key : "1",
				text : "item 1"
			}),

			oItem = new Item({
				key : "2",
				text : "item 2"
			}),

			new Item({
				key : "3",
				text : "item 3"
			})],

			selectedItems : oItem.getId()
		});

		// assertions
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), ["2"]);

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("method: getSelectedKeys()", function(assert) {

		// system under test
		var oMultiComboBox = new MultiComboBox({
			selectedItems : "myItem3",

			items : [new Item({
				key : "0",
				text : "item 0"
			}),

			new Item({
				key : "1",
				text : "item 1"
			}),

			new Item({
				key : "2",
				text : "item 2"
			}),

			new Item({
				id : "myItem3",
				key : "3",
				text : "item 3"
			})]
		});

		// assertions
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), ["3"]);

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("method: getSelectedKeys()", function(assert) {

		// system under test
		var oMultiComboBox = new MultiComboBox({
			items : []
		});

		// assertions
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), []);

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("method: getSelectedKeys()", function(assert) {

		// system under test
		var oMultiComboBox = new MultiComboBox({
			items : [new Item({
				key : "25",
				text : "item 25"
			}),

			new Item({
				key : "26",
				text : "item 26"
			}),

			new Item({
				key : "27",
				text : "item 27"
			})],

			selectedItems : null
		});

		// assertions
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), []);
		assert.deepEqual(oMultiComboBox.getSelectedItems(), []);

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("constructor - items:[] selectedKeys[sKey]", function(assert) {

		// system under test
		var oMultiComboBox = new MultiComboBox({
			items : []
		});
		oMultiComboBox.setSelectedKeys(["01"]);

		// assertions
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), ["01"]);
		assert.deepEqual(oMultiComboBox.getSelectedItems(), []);

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("constructor - items:[] selectedKeys[sKey] - addItem(oItem)", async function(assert) {

		// system under test
		var oItem;
		var oMultiComboBox = new MultiComboBox({
			items : []
		});
		oMultiComboBox.setSelectedKeys(["01"]);

		// arrange
		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate();
		oMultiComboBox.addItem(oItem = new Item({
			key : "01",
			text : "selected item"
		}));
		oMultiComboBox.addItem(new Item({
			key : "02",
			text : "item"
		}));
		oMultiComboBox.syncPickerContent();
		await nextUIUpdate();

		// assertions
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), ["01"]);
		assert.deepEqual(oMultiComboBox.getSelectedItems(), [oItem]);

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("constructor - items:[] selectedItems[oItem] selectedKeys[sKey] - addItem(oItem)", async function(assert) {

		// system under test
		var oItem1, oItem2;
		var oMultiComboBox = new MultiComboBox({
			items : [],
			selectedItems : [oItem1 = new Item({
				key : "01",
				text : "selected item"
			})]
		});
		oMultiComboBox.addSelectedKeys(["02"]);

		// arrange
		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate();
		oMultiComboBox.addItem(oItem1);
		oMultiComboBox.addItem(oItem2 = new Item({
			key : "02",
			text : "selected item"
		}));
		oMultiComboBox.syncPickerContent();
		await nextUIUpdate();

		// assertions
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), ["01", "02"]);
		assert.deepEqual(oMultiComboBox.getSelectedItems(), [oItem1, oItem2]);

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("it should not purge selected keys from the items", async function (assert) {
		// system under test
		var oMultiComboBox = new MultiComboBox({
			items: [
				new Item({key: "1", text: "1"}),
				new Item({key: "2", text: "2"})
			]
		}).placeAt("MultiComboBoxContent");

		await nextUIUpdate();

		// Act
		oMultiComboBox.addSelectedKeys(["", "", "1", "2", ""]);
		await nextUIUpdate();

		assert.strictEqual(oMultiComboBox.getSelectedKeys().length, 5, "To have 5 items as selected keys");
		assert.strictEqual(oMultiComboBox.getSelectedItems().length, 2, "There are 2 real selected items");

		// cleanup
		oMultiComboBox.destroy();
	});

	// BCP 0020079747 0000613914 2015
	QUnit.test("it should not throw an exception, when the undefined value is passed in as an argument to the addSelectedKeys() method", function(assert) {

		// system under test
		var oMultiComboBox = new MultiComboBox();

		// act
		oMultiComboBox.addSelectedKeys(undefined);

		// assert
		assert.ok(Array.isArray(oMultiComboBox.getSelectedKeys()));

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("constructor - binding", async function(assert) {

		// system under test
		var oModel = new JSONModel({
			"selected" : ["AR", "BH"],
			"items" : [{
				"key" : "AL",
				"text" : "Algeria"
			}, {
				"key" : "AR",
				"text" : "Argentina"
			}, {
				"key" : "BH",
				"text" : "Bahrain"
			}]
		});
		var oMultiComboBox = new MultiComboBox({
			items : {
				path : "/items",
				template : new Item({
					key : "{key}",
					text : "{text}"
				})
			},
			selectedKeys : {
				path : "/selected"
			}
		});
		oMultiComboBox.setModel(oModel);

		// arrange
		oMultiComboBox.syncPickerContent();
		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate();

		// act
		qutils.triggerCharacterInput(oMultiComboBox.getFocusDomRef(), "Algeria");
		qutils.triggerKeydown(oMultiComboBox.getDomRef(), KeyCodes.ENTER); //onsapenter

		// assertions
		assert.deepEqual(oModel.getData().selected, ["AR", "BH", "AL"]);

		// cleanup
		oMultiComboBox.destroy();
		oModel.destroy();
	});

	QUnit.test("constructor - binding - destroyItems", async function(assert) {

		// system under test
		var oModel = new JSONModel({
			"selected" : ["AR", "BH"],
			"items" : [{
				"key" : "AL",
				"text" : "Algeria"
			}, {
				"key" : "AR",
				"text" : "Argentina"
			}, {
				"key" : "BH",
				"text" : "Bahrain"
			}]
		});
		var oMultiComboBox = new MultiComboBox({
			items : {
				path : "/items",
				template : new Item({
					key : "{key}",
					text : "{text}"
				})
			},
			selectedKeys : {
				path : "/selected"
			}
		});
		oMultiComboBox.setModel(oModel);

		// arrange
		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate();

		// act
		oMultiComboBox.destroyItems();

		// assertions
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), []);

		// cleanup
		oMultiComboBox.destroy();
		oModel.destroy();
	});

	QUnit.test("constructor - selectedItems : [Item], items : [Item], removeSelectedKey via UI - check fired events",
		async function(assert) {

			// system under test
			var oModel = new JSONModel({
				"items" : [{
					"key" : "AL",
					"text" : "Algeria"
				}, {
					"key" : "AR",
					"text" : "Argentina"
				}, {
					"key" : "BH",
					"text" : "Bahrain"
				}]
			});
			var oMultiComboBox = new MultiComboBox({
				items : {
					path : "/items",
					template : new Item({
						key : "{key}",
						text : "{text}"
					})
				}
			});
			oMultiComboBox.setModel(oModel);

			// arrange
			oMultiComboBox.syncPickerContent();
			oMultiComboBox.placeAt("MultiComboBoxContent");
			await nextUIUpdate();

			var fnFireSelectionChangeSpy = this.spy(oMultiComboBox, "fireSelectionChange");
			var fnFireSelectionFinishSpy = this.spy(oMultiComboBox, "fireSelectionFinish");

			// act
			qutils.triggerCharacterInput(oMultiComboBox.getFocusDomRef(), "Algeria");
			qutils.triggerKeydown(oMultiComboBox.getDomRef(), KeyCodes.ENTER); //onsapenter

			// assertions
			assert.strictEqual(fnFireSelectionChangeSpy.callCount, 1, "The selection change event was fired");
			assert.strictEqual(fnFireSelectionFinishSpy.callCount, 1, "The selection change event was fired");
			assert.strictEqual(fnFireSelectionChangeSpy.args[0][0].changedItem, oMultiComboBox.getSelectedItems()[0],
					"The selection change event parameter was passed");
			assert.strictEqual(fnFireSelectionChangeSpy.args[0][0].selected, true,
					"The selection change event parameter was passed");
			assert.deepEqual(fnFireSelectionFinishSpy.args[0][0].selectedItems, oMultiComboBox.getSelectedItems());

			// cleanup
			fnFireSelectionChangeSpy.restore();
			fnFireSelectionFinishSpy.restore();
			oMultiComboBox.destroy();
	});

	//------------------------------ //
	// _getXXXVisibleItemOf          //
	// ----------------------------- //
	QUnit.test("_getNextVisibleItemOf", async function(assert) {

		// system under test
		var oItem1, oItem2, oItem3;
		var oMultiComboBox = new MultiComboBox({
			items : [oItem1 = new Item({
				key : "01",
				text : "item1"
			}), oItem2 = new Item({
				key : "02",
				text : "item2"
			}), oItem3 = new Item({
				key : "03",
				text : "item3"
			})]
		});

		// arrange
		oMultiComboBox.syncPickerContent();
		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate();

		// assertions
		assert.deepEqual(oMultiComboBox._getNextVisibleItemOf(oItem1), oItem2);
		assert.deepEqual(oMultiComboBox._getNextVisibleItemOf(oItem2), oItem3);
		assert.deepEqual(oMultiComboBox._getNextVisibleItemOf(oItem3), null);
		assert.deepEqual(oMultiComboBox._getNextVisibleItemOf(null), null);
		assert.deepEqual(oMultiComboBox._getNextVisibleItemOf(new Item({
			key : "dummy"
		})), null);
		assert.deepEqual(oMultiComboBox._getNextVisibleItemOf(), null);

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("_getPreviousVisibleItemOf", async function(assert) {

		// system under test
		var oItem1, oItem2, oItem3;
		var oMultiComboBox = new MultiComboBox({
			items : [oItem1 = new Item({
				key : "01",
				text : "item1"
			}), oItem2 = new Item({
				key : "02",
				text : "item2"
			}), oItem3 = new Item({
				key : "03",
				text : "item3"
			})]
		});

		// arrange
		oMultiComboBox.syncPickerContent();
		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate();

		// assertions
		assert.deepEqual(oMultiComboBox._getPreviousVisibleItemOf(oItem1), null);
		assert.deepEqual(oMultiComboBox._getPreviousVisibleItemOf(oItem2), oItem1);
		assert.deepEqual(oMultiComboBox._getPreviousVisibleItemOf(oItem3), oItem2);
		assert.deepEqual(oMultiComboBox._getPreviousVisibleItemOf(null), null);
		assert.deepEqual(oMultiComboBox._getPreviousVisibleItemOf(new Item({
			key : "dummy"
		})), null);
		assert.deepEqual(oMultiComboBox._getNextVisibleItemOf(), null);

		// cleanup
		oMultiComboBox.destroy();
	});

	//------------------------------ //
	// DisabledListItem              //
	// ----------------------------- //
	QUnit.test("DisabledListItem 'LIST_ITEM_VISUALISATION' - constructor",
			async function(assert) {
				this.clock = sinon.useFakeTimers();
				// system under test
				var oItem1, oItem2, oItem3;
				var oMultiComboBox = new MultiComboBox({
					items : [oItem1 = new Item({
						text : "item1",
						enabled : false
					}), oItem2 = new Item({
						text : "item2"
					}), oItem3 = new Item({
						text : "item3"
					})]
				});

				// arrange
				oMultiComboBox.placeAt("MultiComboBoxContent");
				await nextUIUpdate(this.clock);
				oMultiComboBox.open();
				this.clock.tick(500);

				// assertions
				assert.equal(oMultiComboBox._getList().$().find("#" + ListHelpers.getListItem(oItem1).getId()).length, 0,
						'The first Listitem should not be shown');
				assert.equal(oMultiComboBox._getList().$().find("#" + ListHelpers.getListItem(oItem2).getId()).length, 1,
						'The second Listitem should be shown');
				assert.equal(oMultiComboBox._getList().$().find("#" + ListHelpers.getListItem(oItem3).getId()).length, 1,
						'The third Listitem should be shown');
				assert.ok(!oMultiComboBox._getList().$().find("#" + ListHelpers.getListItem(oItem3).getId()).hasClass(
						"sapMComboBoxBaseItemDisabled"),
						'The third Listitem must not have the css class sapMComboBoxBaseItemDisabled');

				// cleanup
				oMultiComboBox.destroy();
	});

	QUnit.test("DisabledListItem 'LIST_ITEM_VISUALISATION' - should not be shown in suggest list", async function(assert) {
		this.clock = sinon.useFakeTimers();
		// system under test
		var oItem1, oItem2, oItem3;
		var oMultiComboBox = new MultiComboBox({
			value : "a",
			items : [oItem1 = new Item({
				key : "DZ",
				text : "Algeria",
				enabled : false
			}), oItem2 = new Item({
				key : "AR",
				text : "Argentina"
			}), oItem3 = new Item({
				key : "BA",
				text : "Barahin"
			})]
		});

		// arrange
		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate(this.clock);

		// act
		qutils.triggerEvent("input", oMultiComboBox.getFocusDomRef());
		this.clock.tick(500);

		// assertions
		assert.ok(oMultiComboBox._isListInSuggestMode(), 'Suggest list is open');
		assert.equal(oMultiComboBox._getList().$().find("#" + ListHelpers.getListItem(oItem1).getId()).length, 0,
				'The first Listitem should not be shown');
		assert.equal(oMultiComboBox._getList().$().find("#" + ListHelpers.getListItem(oItem2).getId()).length, 1,
				'The second Listitem should be shown');
		assert.equal(oMultiComboBox._getList().$().find("#" + ListHelpers.getListItem(oItem3).getId()).length, 0,
				'The third Listitem should not be shown');

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("DisabledListItem 'LIST_ITEM_VISUALISATION' - set disabled via API", async function(assert) {
		this.clock = sinon.useFakeTimers();
		var oSystem = {
			desktop : true,
			phone : false,
			tablet : false
		};
		this.stub(Device, "system").value(oSystem);

		// system under test
		var oItem1, oItem2, oItem3;
		var oMultiComboBox = new MultiComboBox({
			items : [oItem1 = new Item({
				text : "item1"
			}), oItem2 = new Item({
				text : "item2"
			}), oItem3 = new Item({
				text : "item3"
			})]
		});

		// arrange
		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate(this.clock);

		// act
		oItem1.setEnabled(false); //leads to invalidate of control
		this.clock.tick(500);
		oMultiComboBox.open();
		this.clock.tick(500);

		// assertions
		assert.equal(oMultiComboBox._getList().$().find("#" + ListHelpers.getListItem(oItem1).getId()).length, 0,
				'The first Listitem should not be shown');
		assert.equal(oMultiComboBox._getList().$().find("#" + ListHelpers.getListItem(oItem2).getId()).length, 1,
				'The second Listitem should be shown');
		assert.equal(oMultiComboBox._getList().$().find("#" + ListHelpers.getListItem(oItem3).getId()).length, 1,
				'The third Listitem should be shown');

		// cleanup
		oMultiComboBox.destroy();
	});

	//------------------------------ //
	// Selectable Item             //
	// ----------------------------- //
	QUnit.test("setSelectable Item 'LIST_ITEM_VISUALISATION'", async function(assert) {
		this.clock = sinon.useFakeTimers();
		// system under test
		var oItem1, oItem2, oItem3;
		var oMultiComboBox = new MultiComboBox({
			items : [oItem1 = new Item({
				text : "item1"
			}), oItem2 = new Item({
				text : "item2"
			}), oItem3 = new Item({
				text : "item3"
			})]
		});

		// arrange
		oMultiComboBox.syncPickerContent();
		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate(this.clock);

		// act
		oMultiComboBox.setSelectable(oItem3, false);
		oMultiComboBox.open();
		this.clock.tick(500);

		// assertions
		assert.equal(oMultiComboBox._getList().$().find("#" + ListHelpers.getListItem(oItem1).getId()).length, 1,
				'The first Listitem should be shown');
		assert.equal(oMultiComboBox._getList().$().find("#" + ListHelpers.getListItem(oItem2).getId()).length, 1,
				'The second Listitem should be shown');
		assert.equal(oMultiComboBox._getList().$().find("#" + ListHelpers.getListItem(oItem3).getId()).length, 0,
				'The third Listitem should not be shown');

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("setSelectable Dummy Item 'LIST_ITEM_VISUALISATION'", async function(assert) {
		this.clock = sinon.useFakeTimers();
		// system under test
		var oItem1, oItem2, oItem3;
		var oMultiComboBox = new MultiComboBox({
			items : [oItem1 = new Item({
				text : "item1"
			}), oItem2 = new Item({
				text : "item2"
			}), oItem3 = new Item({
				text : "item3"
			})]
		});

		// arrange
		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate(this.clock);

		// act
		oMultiComboBox.setSelectable(new Item({
			text : "Dummy"
		}), false);
		oMultiComboBox.open();
		this.clock.tick(500);

		// assertions
		assert.equal(oMultiComboBox._getList().$().find("#" + ListHelpers.getListItem(oItem1).getId()).length, 1,
				'The first Listitem should be shown');
		assert.equal(oMultiComboBox._getList().$().find("#" + ListHelpers.getListItem(oItem2).getId()).length, 1,
				'The second Listitem should be shown');
		assert.equal(oMultiComboBox._getList().$().find("#" + ListHelpers.getListItem(oItem3).getId()).length, 1,
				'The third Listitem should be shown');

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("setSelectable Item 'LIST_ITEM_VISUALISATION'", async function(assert) {
		this.clock = sinon.useFakeTimers();
		// system under test
		var oItem1, oItem2, oItem3;
		var oMultiComboBox = new MultiComboBox({
			items : [oItem1 = new Item({
				text : "item1"
			}), oItem2 = new Item({
				text : "item2"
			}), oItem3 = new Item({
				text : "item3"
			})]
		});

		// arrange
		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate(this.clock);

		// act
		oMultiComboBox.setSelectable(oItem3, false);
		oMultiComboBox.setSelectable(oItem3, true);
		oMultiComboBox.open();
		this.clock.tick(500);

		// assertions
		assert.equal(oMultiComboBox._getList().$().find("#" + ListHelpers.getListItem(oItem1).getId()).length, 1,
				'The first Listitem should be shown');
		assert.equal(oMultiComboBox._getList().$().find("#" + ListHelpers.getListItem(oItem2).getId()).length, 1,
				'The second Listitem should be shown');
		assert.equal(oMultiComboBox._getList().$().find("#" + ListHelpers.getListItem(oItem3).getId()).length, 1,
				'The third Listitem should be shown');

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("setSelectable Item 'LIST_ITEM_VISUALISATION' - selection is stored", async function(assert) {
		this.clock = sinon.useFakeTimers();
		// system under test
		var oItem1, oItem2, oItem3;
		var oMultiComboBox = new MultiComboBox({
			items : [oItem1 = new Item({
				text : "item1"
			}), oItem2 = new Item({
				text : "item2"
			}), oItem3 = new Item({
				text : "item3"
			})],
			selectedItems : [oItem1]
		});

		// arrange
		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate(this.clock);

		// act
		oMultiComboBox.setSelectable(oItem1, false);
		oMultiComboBox.setSelectable(oItem1, true);
		oMultiComboBox.open();
		this.clock.tick(500);

		// assertions
		assert.equal(oMultiComboBox._getList().$().find("#" + ListHelpers.getListItem(oItem1).getId()).length, 1,
				'The first Listitem should be shown');
		assert.equal(oMultiComboBox._getList().$().find("#" + ListHelpers.getListItem(oItem2).getId()).length, 1,
				'The second Listitem should be shown');
		assert.equal(oMultiComboBox._getList().$().find("#" + ListHelpers.getListItem(oItem3).getId()).length, 1,
				'The third Listitem should be shown');

		// cleanup
		oMultiComboBox.destroy();
	});

	//------------------------------ //
	// clearFilter                   //
	// ----------------------------- //
	QUnit.test("clearFilter", async function(assert) {
		this.clock = sinon.useFakeTimers();
		// system under test
		var oItem1, oItem2, oItem3;
		var oMultiComboBox = new MultiComboBox({
			items : [oItem1 = new Item({
				text : "item1"
			}), oItem2 = new Item({
				text : "item2"
			}), oItem3 = new Item({
				text : "item3"
			})]
		});

		// arrange
		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate(this.clock);

		// act
		oMultiComboBox.clearFilter();
		oMultiComboBox.open();
		this.clock.tick(500);

		// assertions
		assert.equal(oMultiComboBox._getList().$().find("#" + ListHelpers.getListItem(oItem1).getId()).length, 1,
				'The first Listitem should be shown');
		assert.equal(oMultiComboBox._getList().$().find("#" + ListHelpers.getListItem(oItem2).getId()).length, 1,
				'The second Listitem should be shown');
		assert.equal(oMultiComboBox._getList().$().find("#" + ListHelpers.getListItem(oItem3).getId()).length, 1,
				'The third Listitem should be shown');

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("clearFilter - after invisible", async function(assert) {
		this.clock = sinon.useFakeTimers();
		// system under test
		var oItem1, oItem2, oItem3;
		var oMultiComboBox = new MultiComboBox({
			items : [oItem1 = new Item({
				text : "item1"
			}), oItem2 = new Item({
				text : "item2"
			}), oItem3 = new Item({
				text : "item3"
			})]
		});

		// arrange
		oMultiComboBox.syncPickerContent();
		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate(this.clock);

		// act
		ListHelpers.getListItem(oMultiComboBox.getFirstItem()).setVisible(false);
		oMultiComboBox.clearFilter();
		oMultiComboBox.open();
		this.clock.tick(500);

		// assertions
		assert.equal(oMultiComboBox._getList().$().find("#" + ListHelpers.getListItem(oItem1).getId()).length, 1,
				'The first Listitem should be shown');
		assert.equal(oMultiComboBox._getList().$().find("#" + ListHelpers.getListItem(oItem2).getId()).length, 1,
				'The second Listitem should be shown');
		assert.equal(oMultiComboBox._getList().$().find("#" + ListHelpers.getListItem(oItem3).getId()).length, 1,
				'The third Listitem should be shown');

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("clearFilter - disabled item", async function(assert) {
		this.clock = sinon.useFakeTimers();
		// system under test
		var oItem1, oItem2, oItem3;
		var oMultiComboBox = new MultiComboBox({
			items : [oItem1 = new Item({
				text : "item1",
				enabled : false
			}), oItem2 = new Item({
				text : "item2"
			}), oItem3 = new Item({
				text : "item3"
			})]
		});

		// arrange
		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate(this.clock);

		// act
		oMultiComboBox.clearFilter();
		oMultiComboBox.open();
		this.clock.tick(500);

		// assertions
		assert.equal(oMultiComboBox._getList().$().find("#" + ListHelpers.getListItem(oItem1).getId()).length, 0,
				'The first Listitem should not be shown');
		assert.equal(oMultiComboBox._getList().$().find("#" + ListHelpers.getListItem(oItem2).getId()).length, 1,
				'The second Listitem should be shown');
		assert.equal(oMultiComboBox._getList().$().find("#" + ListHelpers.getListItem(oItem3).getId()).length, 1,
				'The third Listitem should be shown');

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("clearFilter - disabled item after invisible", async function(assert) {
		this.clock = sinon.useFakeTimers();
		// system under test
		var oItem1, oItem2, oItem3;
		var oMultiComboBox = new MultiComboBox({
			items : [oItem1 = new Item({
				text : "item1",
				enabled : false
			}), oItem2 = new Item({
				text : "item2"
			}), oItem3 = new Item({
				text : "item3"
			})]
		});

		// arrange
		oMultiComboBox.syncPickerContent();
		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate(this.clock);

		// act
		ListHelpers.getListItem(oMultiComboBox.getFirstItem()).setVisible(false);
		oMultiComboBox.clearFilter();
		oMultiComboBox.open();
		this.clock.tick(500);

		// assertions
		assert.equal(oMultiComboBox._getList().$().find("#" + ListHelpers.getListItem(oItem1).getId()).length, 0,
				'The first Listitem should not be shown');
		assert.equal(oMultiComboBox._getList().$().find("#" + ListHelpers.getListItem(oItem2).getId()).length, 1,
				'The second Listitem should be shown');
		assert.equal(oMultiComboBox._getList().$().find("#" + ListHelpers.getListItem(oItem3).getId()).length, 1,
				'The third Listitem should be shown');

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("clearFilter - disabled item after invisible", async function(assert) {
		this.clock = sinon.useFakeTimers();
		// system under test
		var oItem1, oItem2, oItem3;
		var oMultiComboBox = new MultiComboBox({
			items : [oItem1 = new Item({
				text : "item1",
				enabled : false
			}), oItem2 = new Item({
				text : "item2"
			}), oItem3 = new Item({
				text : "item3"
			})]
		});

		// arrange
		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate(this.clock);

		// act
		oItem1.setEnabled(true);
		this.clock.tick(500);
		oMultiComboBox.syncPickerContent();
		ListHelpers.getListItem(oMultiComboBox.getFirstItem()).setVisible(false);
		oMultiComboBox.clearFilter();
		oMultiComboBox.open();
		this.clock.tick(500);

		// assertions
		assert.equal(oMultiComboBox._getList().$().find("#" + ListHelpers.getListItem(oItem1).getId()).length, 1,
				'The first Listitem should be shown');
		assert.equal(oMultiComboBox._getList().$().find("#" + ListHelpers.getListItem(oItem2).getId()).length, 1,
				'The second Listitem should be shown');
		assert.equal(oMultiComboBox._getList().$().find("#" + ListHelpers.getListItem(oItem3).getId()).length, 1,
				'The third Listitem should be shown');

		// cleanup
		oMultiComboBox.destroy();
	});

	// ------------------------------ //
	// Scenarios - specification      //
	// ------------------------------ //
	//
	QUnit.test("Enter completely new value should refilter the picker", async function(assert) {
		this.clock = sinon.useFakeTimers();
		var oMultiComboBox = new MultiComboBox({
			items: [
				new Item({ text: "lest" }),
				new Item({ text: "lest2" }),
				new Item({ text: "test" })
			]
		});
		var oFakeEvent = {
			target: {
				value: "l"
			},
			setMarked: function () { },
			srcControl: oMultiComboBox
		};

		oMultiComboBox.placeAt("MultiComboBoxContent");
		oMultiComboBox.setValue("l");
		await nextUIUpdate(this.clock);
		oMultiComboBox.open();
		this.clock.tick(nPopoverAnimationTick);

		oMultiComboBox.fireChange({ value: "l" });
		oMultiComboBox.oninput(oFakeEvent);
		await nextUIUpdate(this.clock);

		oFakeEvent.target.value = "t";
		oMultiComboBox.fireChange({ value: "t" });
		oMultiComboBox.oninput(oFakeEvent);
		oMultiComboBox.setValue("t");
		await nextUIUpdate(this.clock);

		assert.strictEqual(ListHelpers.getSelectableItems(oMultiComboBox.getItems()).length, 1, "1 item should be available");
		assert.strictEqual(ListHelpers.getSelectableItems(oMultiComboBox.getItems())[0].getText(), "test", "selectable item should be test");

		oMultiComboBox.destroy();
	});

	QUnit.test("Scenario 'FIXED_CHAR': add invalid character.", async function(assert) {
		this.clock = sinon.useFakeTimers();
		// system under test
		var sInitValue = "Algeri";
		var oMultiComboBox = new MultiComboBox({
			value : sInitValue,
			items : [new Item({
				key : "DZ",
				text : "Algeria"
			})]
		});

		// arrange
		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate(this.clock);

		var oTarget = oMultiComboBox.getFocusDomRef();
		var fnOninputSpy = this.spy(oMultiComboBox, "oninput");
		var fnOnkeyupSpy = this.spy(oMultiComboBox, "onkeyup");

		// act
		qutils.triggerKeyup(oTarget, ''); // store old value
		oTarget.value = "Algeriz";
		qutils.triggerEvent("input", oTarget);

		await nextUIUpdate(this.clock);

		// assertions
		assert.strictEqual(fnOninputSpy.callCount, 1, "The oninput was called");
		assert.strictEqual(fnOnkeyupSpy.callCount, 1, "The onkeyup was called");
		assert.strictEqual(oMultiComboBox.getValue(), sInitValue,
				"Input value is returned to the inital value after wrong character was typed");
		assert.strictEqual(oMultiComboBox.getFocusDomRef().value, oMultiComboBox.getValue(),
				"Dom value and value property are same after wrong character was typed");
		assert.ok(oMultiComboBox.$("content").hasClass("sapMInputBaseContentWrapperError"),
				'The MultiComboBox must have the css class sapMInputBaseContentWrapperError');
		this.clock.tick(1100);
		assert.ok(!oMultiComboBox.$("content").hasClass("sapMInputBaseContentWrapperError"),
				'The MultiComboBox must not have the css class sapMComboBoxTextFieldError after 1000 msec');

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("Scenario 'FIXED_CHAR': overwrite selected character with invalid one.", async function(assert) {
		this.clock = sinon.useFakeTimers();
		// system under test
		var sInitValue = "Algeri";
		var oMultiComboBox = new MultiComboBox({
			value : sInitValue,
			items : [new Item({
				key : "DZ",
				text : "Algeria"
			})]
		});

		// arrange
		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate(this.clock);
		oMultiComboBox.selectText(1, 2);
		var oTarget = oMultiComboBox.getFocusDomRef();
		var fnOninputSpy = this.spy(oMultiComboBox, "oninput");
		var fnOnkeyupSpy = this.spy(oMultiComboBox, "onkeyup");

		// act
		qutils.triggerKeyup(oTarget, ''); // store old value
		oTarget.value = "Azgeri";
		qutils.triggerEvent("input", oTarget);
		await nextUIUpdate(this.clock);

		// assertions
		assert.strictEqual(fnOninputSpy.callCount, 1, "The oninput was called");
		assert.strictEqual(fnOnkeyupSpy.callCount, 1, "The onkeyup was called");
		assert.strictEqual(oMultiComboBox.getValue(), sInitValue,
				"Input value is returned to the inital value after wrong character was typed");
		assert.strictEqual(oMultiComboBox.getFocusDomRef().value, oMultiComboBox.getValue(),
				"Dom value and value property are same after wrong character was typed");
		assert.ok(oMultiComboBox.$("content").hasClass("sapMInputBaseContentWrapperError"),
				'The MultiComboBox must have the css class sapMInputBaseContentWrapperError');
		this.clock.tick(1100);
		assert.ok(!oMultiComboBox.$("content").hasClass("sapMInputBaseContentWrapperError"),
				'The MultiComboBox must not have the css class sapMInputBaseContentWrapperError after 1000 msec');

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("Scenario 'TOKEN_ORDER': Order of tokens is the order how the items were selected", async function(assert) {

		// system under test
		var oItem1, oItem2, oItem3;
		var oMultiComboBox = new MultiComboBox({
			items : [oItem1 = new Item({
				key : "DZ",
				text : "Algeria"
			}), oItem2 = new Item({
				key : "AR",
				text : "Argentina"
			}), oItem3 = new Item({
				key : "AU",
				text : "Australia"
			})]
		});

		// arrange
		oMultiComboBox.syncPickerContent();
		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate();

		// act
		qutils.triggerCharacterInput(oMultiComboBox.getFocusDomRef(), oItem1.getText());
		qutils.triggerKeydown(oMultiComboBox.getDomRef(), KeyCodes.ENTER); //onsapenter

		qutils.triggerCharacterInput(oMultiComboBox.getFocusDomRef(), oItem2.getText());
		qutils.triggerKeydown(oMultiComboBox.getDomRef(), KeyCodes.ENTER); //onsapenter

		qutils.triggerCharacterInput(oMultiComboBox.getFocusDomRef(), oItem3.getText());
		qutils.triggerKeydown(oMultiComboBox.getDomRef(), KeyCodes.ENTER); //onsapenter

		// assertions
		var aTokens = oMultiComboBox.getAggregation("tokenizer").getTokens();
		assert.strictEqual(aTokens[0].getKey(), oItem1.getKey());
		assert.strictEqual(aTokens[1].getKey(), oItem2.getKey());
		assert.strictEqual(aTokens[2].getKey(), oItem3.getKey());

		// arrange
		oMultiComboBox.removeAllSelectedItems();
		await nextUIUpdate();

		// act
		qutils.triggerCharacterInput(oMultiComboBox.getFocusDomRef(), oItem3.getText());
		qutils.triggerKeydown(oMultiComboBox.getDomRef(), KeyCodes.ENTER); //onsapenter

		qutils.triggerCharacterInput(oMultiComboBox.getFocusDomRef(), oItem2.getText());
		qutils.triggerKeydown(oMultiComboBox.getDomRef(), KeyCodes.ENTER); //onsapenter

		qutils.triggerCharacterInput(oMultiComboBox.getFocusDomRef(), oItem1.getText());
		qutils.triggerKeydown(oMultiComboBox.getDomRef(), KeyCodes.ENTER); //onsapenter

		// assertions
		aTokens = oMultiComboBox.getAggregation("tokenizer").getTokens();
		assert.strictEqual(aTokens[0].getKey(), oItem3.getKey());
		assert.strictEqual(aTokens[1].getKey(), oItem2.getKey());
		assert.strictEqual(aTokens[2].getKey(), oItem1.getKey());

		// cleanup
		oMultiComboBox.destroy();
	});

	// ------------------------------ //
	// Scenarios - event handling     //
	// ------------------------------ //

	QUnit.test("Scenario 'EVENT_VALUE_ENTER': 'Algeria' + ENTER", async function(assert) {

		// system under test
		var oItem;
		var oMultiComboBox = new MultiComboBox({
			items : [oItem = new Item({
				key : "DZ",
				text : "Algeria"
			})]
		});

		// arrange
		oMultiComboBox.syncPickerContent();
		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate();

		var fnFireChangeSpy = this.spy(oMultiComboBox, "fireChange");
		var fnFireSelectionChangeSpy = this.spy(oMultiComboBox, "fireSelectionChange");
		var fnFireSelectionFinishSpy = this.spy(oMultiComboBox, "fireSelectionFinish");

		// act
		qutils.triggerCharacterInput(oMultiComboBox.getFocusDomRef(), oItem.getText());
		qutils.triggerKeydown(oMultiComboBox.getDomRef(), KeyCodes.ENTER);

		// assertions
		assert.deepEqual(oMultiComboBox.getSelectedItems(), [oItem]);
		assert.strictEqual(fnFireChangeSpy.callCount, 1, "The change event was fired");
		assert.strictEqual(fnFireSelectionChangeSpy.callCount, 1, "The selection change event was fired");
		assert.strictEqual(fnFireSelectionFinishSpy.callCount, 1, "The selection finish event was fired");

		// cleanup
		fnFireSelectionChangeSpy.restore();
		fnFireSelectionFinishSpy.restore();
		oMultiComboBox.destroy();
	});

	QUnit.test("Scenario 'EVENT_VALUE_DUMMY_ENTER': 'dummy' + ENTER", async function(assert) {

		// system under test
		var oMultiComboBox = new MultiComboBox({
			items : [new Item({
				key : "DZ",
				text : "Algeria"
			})]
		});

		// arrange
		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate();

		var fnFireChangeSpy = this.spy(oMultiComboBox, "fireChange");
		var fnFireSelectionChangeSpy = this.spy(oMultiComboBox, "fireSelectionChange");
		var fnFireSelectionFinishSpy = this.spy(oMultiComboBox, "fireSelectionFinish");

		// act
		qutils.triggerCharacterInput(oMultiComboBox.getFocusDomRef(), 'dummy');
		qutils.triggerKeydown(oMultiComboBox.getDomRef(), KeyCodes.ENTER); //onsapenter

		// assertions
		assert.deepEqual(oMultiComboBox.getSelectedItems(), []);
		assert.strictEqual(fnFireChangeSpy.callCount, 1, "The change event was fired");
		assert.strictEqual(fnFireSelectionChangeSpy.callCount, 0, "The selection change event was not fired");
		assert.strictEqual(fnFireSelectionFinishSpy.callCount, 0, "The selection finish event was not fired");

		// cleanup
		fnFireSelectionChangeSpy.restore();
		fnFireSelectionFinishSpy.restore();
		oMultiComboBox.destroy();
	});

	QUnit.test("Scenario 'EVENT_VALUE_SELECT_ENTER': 'Algeria' + select 'lgeria' + 'ustralia' + ENTER", async function(assert) {

		// system under test
		var oItem1;
		var oMultiComboBox = new MultiComboBox({
			items : [oItem1 = new Item({
				key : "DZ",
				text : "Algeria"
			}), new Item({
				key : "AU",
				text : "Australia"
			})]
		});

		// arrange
		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate();

		var fnFireChangeSpy = this.spy(oMultiComboBox, "fireChange");
		var fnFireSelectionChangeSpy = this.spy(oMultiComboBox, "fireSelectionChange");
		var fnFireSelectionFinishSpy = this.spy(oMultiComboBox, "fireSelectionFinish");

		// act
		qutils.triggerCharacterInput(oMultiComboBox.getFocusDomRef(), oItem1.getText());
		oMultiComboBox.selectText(1, oMultiComboBox.getValue().length);
		qutils.triggerCharacterInput(oMultiComboBox.getFocusDomRef(), "ustralia");

		// assertions
		assert.strictEqual(fnFireChangeSpy.callCount, 0, "The change event was not fired");
		assert.strictEqual(fnFireSelectionChangeSpy.callCount, 0, "The selection change event was not fired");
		assert.strictEqual(fnFireSelectionFinishSpy.callCount, 0, "The selection finish event was not fired");
		qutils.triggerKeydown(oMultiComboBox.getDomRef(), KeyCodes.ENTER);

		// assertions
		assert.deepEqual(oMultiComboBox.getSelectedItems(), []);
		assert.strictEqual(fnFireChangeSpy.callCount, 1, "The change event was fired");
		assert.strictEqual(fnFireSelectionChangeSpy.callCount, 0, "The selection change event was not fired");
		assert.strictEqual(fnFireSelectionFinishSpy.callCount, 0, "The selection finish event was not fired");

		// cleanup
		fnFireSelectionChangeSpy.restore();
		fnFireSelectionFinishSpy.restore();
		oMultiComboBox.destroy();
	});

	QUnit.test("Scenario 'EVENT_VALUE_PASTE': CTRL+V 'Algeria' ", async function(assert) {
		// system under test
		var oMultiComboBox = new MultiComboBox({
			items: [
				new Item({key : "DZ",text : "Algeria"})
			]
		});

		// arrange
		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate();

		var fnFireSelectionChangeSpy = this.spy(oMultiComboBox, "fireSelectionChange");
		var fnFireSelectionFinishSpy = this.spy(oMultiComboBox, "fireSelectionFinish");

		// act
		qutils.triggerEvent("paste", oMultiComboBox.getFocusDomRef(), {
			originalEvent : {
				clipboardData : {
					getData : function() {
						return "Algeria";
					}
				}
			}
		});

		// assertions
		assert.strictEqual(fnFireSelectionChangeSpy.callCount, 0, "The selection change event was not fired");
		assert.strictEqual(fnFireSelectionFinishSpy.callCount, 0, "The selection finish event was not fired");
		assert.deepEqual(oMultiComboBox.getSelectedItems().length, 0, "A token should not be created");

		// cleanup
		fnFireSelectionChangeSpy.restore();
		fnFireSelectionFinishSpy.restore();
		oMultiComboBox.destroy();
	});


	QUnit.test("Paste clipboard data from excel from several rows and columns info multiple tokens", async function(assert) {
		var oMultiComboBox = new MultiComboBox({
			items: [
				new Item({key : "1",text : "1"}),
				new Item({key : "2",text : "2"}),
				new Item({key : "3",text : "3"}),
				new Item({key : "4",text : "4"})
			]
		});
		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate();

		var sPastedString = '1\t\t2\r\n\t\t\r\n3\t\t4\r\n';
		var fnFireSelectionChangeSpy = this.spy(oMultiComboBox, "fireSelectionChange");
		var fnFireSelectionFinishSpy = this.spy(oMultiComboBox, "fireSelectionFinish");

		//act
		qutils.triggerEvent("paste", oMultiComboBox.getFocusDomRef(), {
			originalEvent: {
				clipboardData: {
					getData: function () {
						return sPastedString;
					}
				}
			}
		});

		// assert
		assert.strictEqual(fnFireSelectionChangeSpy.callCount, 4, "The selection change event was fired");
		assert.strictEqual(fnFireSelectionFinishSpy.callCount, 4, "The selection finish event was fired");
		assert.equal(oMultiComboBox.getSelectedItems().length, 4, "4 tokens should be added to MultiComboBox");

		// cleanup
		fnFireSelectionChangeSpy.restore();
		fnFireSelectionFinishSpy.restore();
		oMultiComboBox.destroy();
	});

	QUnit.test("Paste value behaviour", function (assert) {
		this.clock = sinon.useFakeTimers();
		var oMultiComboBox = new MultiComboBox({
			items : [new Item({
				key : "DZ",
				text : "Algeria"
			})]
		});

		var oFakeEvent = {
			isMarked: function () { },
			setMarked: function () { },
			srcControl: oMultiComboBox,
			target: {
				value: "Al"
			}
		},
			oHandleInputEventSpy = this.spy(oMultiComboBox, "handleInputValidation"),
			oHandleTypeAheadSpy = this.spy(oMultiComboBox, "_handleTypeAhead"),
			oUpdateDomValueSpy = this.spy(oMultiComboBox, "updateDomValue");

		oMultiComboBox._bDoTypeAhead = true;
		oMultiComboBox._bIsPasteEvent = true;

		// act
		oMultiComboBox.oncompositionstart(oFakeEvent);
		oMultiComboBox.oninput(oFakeEvent);
		this.clock.tick(nPopoverAnimationTick);

		// assert
		assert.ok(oHandleInputEventSpy.called, "handleInputValidation should be called on input");
		assert.ok(oUpdateDomValueSpy.called, "Update DOM value should be called while pasting value");
		assert.ok(oHandleTypeAheadSpy.called, "Type ahead should be called while pasting value");
		oMultiComboBox.destroy();
	});

	QUnit.test("Paste and select behaviour", async function (assert) {
		var oMultiComboBox = new MultiComboBox({
			items: [new Item({
				key: "DZ",
				text: "Algeria"
			})]
		}).placeAt("MultiComboBoxContent");
		await nextUIUpdate();

		var oEventStub = this.stub({
			stopPropagation: function () {
			},
			preventDefault: function () {
			},
			originalEvent: {
				clipboardData: {
					getData: function () {
						return "Algeria\n";
					}
				}
			}
		});

		// Act
		window.clipboardData = null;
		oMultiComboBox.onpaste(oEventStub);
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oMultiComboBox.getSelectedItems().length, 1, "Should have one selected item");
		assert.strictEqual(oMultiComboBox.getValue(), "", "Input's value should be empty");
		assert.ok(oEventStub.stopPropagation.calledOnce, "Value paste should have been prevented");

		// Cleanup
		oMultiComboBox.destroy();
	});


	QUnit.test("Focus out cleanup", function (assert) {
		this.clock = sinon.useFakeTimers();
		// Arrange
		var oMultiComboBox = new MultiComboBox();
		oMultiComboBox._bIsPasteEvent = true;
		oMultiComboBox.sUpdateValue = "Test";
		var oUpdateDomValueSpy = this.spy(oMultiComboBox, "updateDomValue");

		// Act
		oMultiComboBox._handleInputFocusOut();
		this.clock.tick(nPopoverAnimationTick);

		// Assert
		assert.notOk(oMultiComboBox._bIsPasteEvent, "Should reset _bIsPasteEvent variable");
		assert.ok(oUpdateDomValueSpy.called, "DOM value should be called");
		assert.ok(oUpdateDomValueSpy.calledWith(""), "DOM value should be updated");
		oMultiComboBox.destroy();
	});

	QUnit.test("Scenario 'EVENT_VALUE_LINE_BREAK_PASTE': CTRL+V 'item1 item2' ", async function(assert) {
		// system under test
		var oItem1, oItem2;
		var oMultiComboBox = new MultiComboBox({
			items : [oItem1 = new Item({
				key : "key1",
				text : "item1"
			}),
			oItem2 = new Item({
				key : "key2",
				text : "item2"
			})]
		});

		// arrange
		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate();

		var fnFireSelectionChangeSpy = this.spy(oMultiComboBox, "fireSelectionChange");
		var fnFireSelectionFinishSpy = this.spy(oMultiComboBox, "fireSelectionFinish");

		// act
		qutils.triggerEvent("paste", oMultiComboBox.getFocusDomRef(), {
			originalEvent : {
				clipboardData : {
					getData : function() {
						return "item1\ritem2";
					}
				}
			}
		});

		// assertions
		assert.strictEqual(fnFireSelectionChangeSpy.callCount, 2, "The selection change event was fired");
		assert.strictEqual(fnFireSelectionFinishSpy.callCount, 2, "The selection finish event was fired");

		var selectedItems = oMultiComboBox.getSelectedItems();
		assert.strictEqual(selectedItems[0].getKey(), oItem1.getKey(), "The first key should be 'key1'");
		assert.strictEqual(selectedItems[1].getKey(), oItem2.getKey(), "The second key should be 'key2'");

		assert.strictEqual(selectedItems[0].getText(), oItem1.getText(), "The first item text should be 'item1'");
		assert.strictEqual(selectedItems[1].getText(), oItem2.getText(), "The second item text should be 'item2'");

		// cleanup
		fnFireSelectionChangeSpy.restore();
		fnFireSelectionFinishSpy.restore();
		oMultiComboBox.destroy();
	});

	QUnit.test("Scenario 'EVENT_VALUE_FOCUSOUT': 'Algeria' + FOCUSOUT", async function(assert) {
		this.clock = sinon.useFakeTimers();
		// system under test
		var oItem;
		var oMultiComboBox = new MultiComboBox({
			items : [oItem = new Item({
				key : "DZ",
				text : "Algeria"
			})]
		});

		// arrange
		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate(this.clock);

		var fnFireChangeSpy = this.spy(oMultiComboBox, "fireChange");
		var fnFireSelectionChangeSpy = this.spy(oMultiComboBox, "fireSelectionChange");
		var fnFireSelectionFinishSpy = this.spy(oMultiComboBox, "fireSelectionFinish");

		// act
		oMultiComboBox.getFocusDomRef().focus();
		this.clock.tick(500);
		qutils.triggerCharacterInput(oMultiComboBox.getFocusDomRef(), oItem.getText());
		this.clock.tick(1000);
		oMultiComboBox.getFocusDomRef().blur();
		this.clock.tick(500);

		// assertions
		var aSelectedItems = oMultiComboBox.getSelectedItems();
		assert.strictEqual(aSelectedItems.length, 0, "No token was selected on Focus Out");
		assert.strictEqual(fnFireChangeSpy.callCount, 1, "The change event was not fired");
		assert.strictEqual(fnFireSelectionChangeSpy.callCount, 0, "The selection change event was not fired");
		assert.strictEqual(fnFireSelectionFinishSpy.callCount, 0, "The selection finish event was not fired");

		// cleanup
		fnFireSelectionChangeSpy.restore();
		fnFireSelectionFinishSpy.restore();
		oMultiComboBox.destroy();
	});

	QUnit.test("Scenario 'EVENT_TOKEN_BACKSPACE': Token 'Algeria' + BACKSPACE + BACKSPACE", async function(assert) {

		// system under test
		var oItem;
		var oMultiComboBox = new MultiComboBox({
			items : [oItem = new Item({
				key : "DZ",
				text : "Algeria"
			})],
			selectedItems : [oItem]
		});

		// arrange
		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate();

		var fnFireChangeSpy = this.spy(oMultiComboBox, "fireChange");
		var fnFireSelectionChangeSpy = this.spy(oMultiComboBox, "fireSelectionChange");
		var fnFireSelectionFinishSpy = this.spy(oMultiComboBox, "fireSelectionFinish");

		// act
		oMultiComboBox.focus();
		qutils.triggerKeydown(oMultiComboBox.getFocusDomRef(), KeyCodes.BACKSPACE); // select last token
		await nextUIUpdate();

		// assert
		assert.strictEqual(document.activeElement, oMultiComboBox.getAggregation("tokenizer").getTokens()[0].getDomRef(),
			"The focus is forwarded to the token.");

		// act
		qutils.triggerKeydown(document.activeElement, KeyCodes.BACKSPACE); // delete selected token
		await nextUIUpdate();

		// assertions
		assert.deepEqual(oMultiComboBox.getSelectedItems(), []);
		assert.strictEqual(fnFireChangeSpy.callCount, 1, "The change event was fired");
		assert.strictEqual(fnFireSelectionChangeSpy.callCount, 1, "The selection change event was fired");
		assert.strictEqual(fnFireSelectionFinishSpy.callCount, 1, "The selection finish event was fired");

		// cleanup
		fnFireSelectionChangeSpy.restore();
		fnFireSelectionFinishSpy.restore();
		oMultiComboBox.destroy();
	});

	QUnit.test("Scenario 'EVENT_TOKEN_DELETE': Token 'Algeria' + BACKSPACE + DELETE", async function(assert) {

		// system under test
		var oItem;
		var oMultiComboBox = new MultiComboBox({
			items : [oItem = new Item({
				key : "DZ",
				text : "Algeria"
			})],
			selectedItems : [oItem]
		});

		// arrange
		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate();

		var fnFireChangeSpy = this.spy(oMultiComboBox, "fireChange");
		var fnFireSelectionChangeSpy = this.spy(oMultiComboBox, "fireSelectionChange");
		var fnFireSelectionFinishSpy = this.spy(oMultiComboBox, "fireSelectionFinish");

		// act
		oMultiComboBox.focus();
		qutils.triggerKeydown(oMultiComboBox.getDomRef(), KeyCodes.BACKSPACE); // select last token
		// assert
		assert.strictEqual(document.activeElement, oMultiComboBox.getAggregation("tokenizer").getTokens()[0].getDomRef(),
			"The focus is forwarded to the token.");

		// act
		qutils.triggerKeydown(document.activeElement, KeyCodes.DELETE); // delete selected token
		await nextUIUpdate();

		// assertions
		assert.deepEqual(oMultiComboBox.getSelectedItems(), []);
		assert.strictEqual(fnFireChangeSpy.callCount, 1, "The change event was fired");
		assert.strictEqual(fnFireSelectionChangeSpy.callCount, 1, "The selection change event was fired");
		assert.strictEqual(fnFireSelectionFinishSpy.callCount, 1, "The selection finish event was fired");

		// cleanup
		fnFireSelectionChangeSpy.restore();
		fnFireSelectionFinishSpy.restore();
		oMultiComboBox.destroy();
	});

	QUnit.test("Scenario 'EVENT_TOKENS_DELETE': 3 Tokens + CTRL+A + DELETE", async function(assert) {

		// system under test
		var oItem1, oItem2, oItem3;
		var oMultiComboBox = new MultiComboBox({
			items : [oItem1 = new Item({
				key : "DZ",
				text : "Algeria"
			}), oItem2 = new Item({
				key : "AR",
				text : "Argentina"
			}), oItem3 = new Item({
				key : "AU",
				text : "Australia"
			})],
			selectedItems : [oItem1, oItem2, oItem3]
		});

		// arrange
		oMultiComboBox.syncPickerContent();
		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate();

		var fnFireChangeSpy = this.spy(oMultiComboBox, "fireChange");
		var fnFireSelectionChangeSpy = this.spy(oMultiComboBox, "fireSelectionChange");
		var fnFireSelectionFinishSpy = this.spy(oMultiComboBox, "fireSelectionFinish");

		// act
		oMultiComboBox.focus();
		qutils.triggerKeydown(oMultiComboBox.getDomRef(), KeyCodes.A, false, false, true); // select all tokens
		await nextUIUpdate();
		qutils.triggerKeydown(oMultiComboBox.getDomRef(), KeyCodes.DELETE); // delete selected tokens
		await nextUIUpdate();

		// assertions
		assert.deepEqual(oMultiComboBox.getSelectedItems(), []);
		assert.strictEqual(fnFireChangeSpy.callCount, 1, "The change event was fired");
		assert.strictEqual(fnFireSelectionChangeSpy.callCount, 3, "The selection change event was fired");
		assert.strictEqual(fnFireSelectionFinishSpy.callCount, 3, "The selection finish event was fired");

		// cleanup
		fnFireSelectionChangeSpy.restore();
		fnFireSelectionFinishSpy.restore();
		oMultiComboBox.destroy();
	});

	QUnit.test("Scenario 'EVENT_TOKEN_DELETE_BUTTON': Token 'Algeria' + delete button on token", async function(assert) {

		// system under test
		var oItem;
		var oMultiComboBox = new MultiComboBox({
			items : [oItem = new Item({
				key : "DZ",
				text : "Algeria"
			})],
			selectedItems : [oItem]
		});

		// arrange
		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate();

		var fnFireChangeSpy = this.spy(oMultiComboBox, "fireChange");
		var fnFireSelectionChangeSpy = this.spy(oMultiComboBox, "fireSelectionChange");
		var fnFireSelectionFinishSpy = this.spy(oMultiComboBox, "fireSelectionFinish");

		// act
		var oTokenIcon = jQuery.find(".sapMTokenIcon")[0];
		qutils.triggerEvent("click", oTokenIcon);

		// assertions
		assert.deepEqual(oMultiComboBox.getSelectedItems(), []);
		assert.strictEqual(fnFireChangeSpy.callCount, 1, "The change event was fired");
		assert.strictEqual(fnFireSelectionChangeSpy.callCount, 1, "The selection change event was fired");
		assert.strictEqual(fnFireSelectionFinishSpy.callCount, 1, "The selection finish event was fired");

		// cleanup
		fnFireSelectionChangeSpy.restore();
		fnFireSelectionFinishSpy.restore();
		oMultiComboBox.destroy();
	});

	QUnit.test("Scenario 'EVENT_VALUE_ESCAPE': 'Algeria' change to 'Dummy' + ESCAPE", async function(assert) {

		// system under test
		var sInitValue = "Algeria";
		var oMultiComboBox = new MultiComboBox({
			value : sInitValue,
			items : [new Item({
				key : "DZ",
				text : "Algeria"
			})]
		});

		// arrange
		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate();

		var fnFireChangeSpy = this.spy(oMultiComboBox, "fireChange");
		var fnFireSelectionChangeSpy = this.spy(oMultiComboBox, "fireSelectionChange");
		var fnFireSelectionFinishSpy = this.spy(oMultiComboBox, "fireSelectionFinish");
		var fnFireEventSpy = this.spy(oMultiComboBox, "fireEvent");

		// act
		oMultiComboBox.getFocusDomRef().value = "Dummy";

		// act
		qutils.triggerKeydown(oMultiComboBox.getFocusDomRef(), KeyCodes.ESCAPE);

		// assertions
		assert.deepEqual(oMultiComboBox.getSelectedItems(), []);

		assert.strictEqual(oMultiComboBox.getValue(), sInitValue, "Input value is returned to the inital value after escape.");
		assert.strictEqual(oMultiComboBox.getFocusDomRef().value, oMultiComboBox.getValue(),
				"Dom value and value property are same after escape.");
		assert.ok(fnFireEventSpy.calledWith("liveChange"), "Private liveChange event is fired on escape");
		assert.strictEqual(fnFireEventSpy.callCount, 1, "LiveChange event is fired once");

		assert.strictEqual(fnFireChangeSpy.callCount, 0, "The change event was fired");
		assert.strictEqual(fnFireSelectionChangeSpy.callCount, 0, "The selection change event was fired");
		assert.strictEqual(fnFireSelectionFinishSpy.callCount, 0, "The selection finish event was fired");

		// cleanup
		fnFireSelectionChangeSpy.restore();
		fnFireSelectionFinishSpy.restore();
		oMultiComboBox.destroy();
	});

	QUnit.test("Scenario 'EVENT_VALUE_ENTER_OPENLIST': 'alg' + ENTER", async function(assert) {
		this.clock = sinon.useFakeTimers();
		var oSystem = {
			desktop : true,
			phone : false,
			tablet : false
		};
		this.stub(Device, "system").value(oSystem);

		// system under test
		var oMultiComboBox = new MultiComboBox({
			items : [new Item({
				key : "DZ",
				text : "Algeria"
			})]
		});

		// arrange
		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate(this.clock);
		oMultiComboBox.focus();

		var fnFireSelectionChangeSpy = this.spy(oMultiComboBox, "fireSelectionChange");

		// act - 'alg' + OpenList + Enter
		qutils.triggerCharacterInput(oMultiComboBox.getFocusDomRef(), "alg");
		qutils.triggerKeydown(oMultiComboBox.getFocusDomRef(), KeyCodes.ENTER);
		this.clock.tick(500);

		// assertions
		assert.deepEqual(oMultiComboBox.getSelectedItems(), []);
		assert.strictEqual(fnFireSelectionChangeSpy.callCount, 0, "The selection change event was not fired");

		// cleanup
		fnFireSelectionChangeSpy.restore();
		oMultiComboBox.destroy();
	});

	QUnit.test("Read-only popover should be opened on ENTER keypress", async function (assert) {
		this.clock = sinon.useFakeTimers();
		// arrange
		var aItems = [
				new Item("it1", {text: "this is a long text"}),
				new Item("it2", {text: "this is another long text"})
			], oMCB = new MultiComboBox({
				width: "8rem",
				editable: false,
				items: aItems,
				selectedItems: ["it1", "it2"]
			}),
		oTokenizer = oMCB.getAggregation("tokenizer");

		// act
		oMCB.placeAt("MultiComboBoxContent");
		await nextUIUpdate(this.clock);
		var oHandleIndicatorPressSpy = this.spy(oTokenizer, "_togglePopup");

		// assert
		assert.ok(oTokenizer.getTokensPopup(), "Readonly Popover should be created");

		// act
		qutils.triggerKeydown(oMCB.getFocusDomRef(), KeyCodes.ENTER);
		this.clock.tick(500);

		// assert
		assert.ok(containsOrEquals(oTokenizer.getTokensPopup().getDomRef(), document.activeElement),
			"Popover should be on focus when opened");
		assert.ok(oHandleIndicatorPressSpy.called, "MultiComboBox's _handleIndicatorPress is called");

		// delete
		oMCB.destroy();
	});

	QUnit.test("Scenario 'EVENT_VALUE_ENTER_OPENLIST': 'alg' + ALT+DOWNKEY + ENTER + ALT+UPKEY Case insensitive", async function(assert) {
		var oSystem = {
			desktop : true,
			phone : false,
			tablet : false
		};
		this.stub(Device, "system").value(oSystem);

		// system under test
		var oItem2;
		var oMultiComboBox = new MultiComboBox({
			items : [new Item({
				key : "DZ",
				text : "Algeria"
			}), oItem2 = new Item({
				key : "DZ",
				text : "Alg"
			})]
		});

		// arrange
		oMultiComboBox.syncPickerContent();
		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate();
		oMultiComboBox.focus();

		// act - 'alg' + OpenList + Enter
		qutils.triggerCharacterInput(document.activeElement, "alg");
		qutils.triggerKeydown(document.activeElement, KeyCodes.ENTER);
		qutils.triggerKeydown(document.activeElement, KeyCodes.ARROW_DOWN, false, true);
		qutils.triggerKeydown(document.activeElement, KeyCodes.ARROW_UP, false, true);
		await nextUIUpdate();

		// assertions
		assert.deepEqual(oMultiComboBox.getSelectedItems(), [oItem2]);

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("Scenario 'EVENT_VALUE_ENTER_OPENLIST': 'al' + ALT+DOWNKEY + ENTER + ALT+UPKEY", async function(assert) {
		this.clock = sinon.useFakeTimers();
		var oSystem = {
			desktop : true,
			phone : false,
			tablet : false
		};
		this.stub(Device, "system").value(oSystem);

		// system under test
		var oMultiComboBox = new MultiComboBox({
			items : [new Item({
				key : "DZ",
				text : "Algeria"
			}), new Item({
				key : "DZ",
				text : "Alg"
			})]
		});

		// arrange
		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate(this.clock);
		oMultiComboBox.focus();

		// act - 'al' + OpenList + Enter
		qutils.triggerCharacterInput(document.activeElement, "al");
		qutils.triggerKeydown(document.activeElement, KeyCodes.ENTER);
		qutils.triggerKeydown(document.activeElement, KeyCodes.ARROW_DOWN, false, true);
		qutils.triggerKeydown(document.activeElement, KeyCodes.ARROW_UP, false, true);
		this.clock.tick(500);

		// assertions
		assert.deepEqual(oMultiComboBox.getSelectedItems(), [], "should not select anything");
		assert.strictEqual(oMultiComboBox.getValue(), "al", "Value should not be deleted");

		// cleanup
		qutils.triggerKeydown(oMultiComboBox.getFocusDomRef(), KeyCodes.ESCAPE);
		this.clock.tick(500);
		oMultiComboBox.destroy();
	});

	QUnit.test("Scenario 'EVENT_SELECTION_SPACE': ALT+DOWNKEY + SelectItem + ALT+UPKEY", async function(assert) {
		this.clock = sinon.useFakeTimers();
		var oSystem = {
			desktop : true,
			phone : false,
			tablet : false
		};
		this.stub(Device, "system").value(oSystem);

		// system under test
		var oItem;
		var oMultiComboBox = new MultiComboBox({
			items : [oItem = new Item({
				key : "DZ",
				text : "Algeria"
			})]
		});

		// arrange
		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate(this.clock);
		oMultiComboBox.focus();

		var fnFireChangeSpy = this.spy(oMultiComboBox, "fireChange");
		var fnFireSelectionChangeSpy = this.spy(oMultiComboBox, "fireSelectionChange");
		var fnFireSelectionFinishSpy = this.spy(oMultiComboBox, "fireSelectionFinish");

		// act - 'alg' + OpenList + TAP
		qutils.triggerKeydown(oMultiComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN, false, true);
		this.clock.tick(500);
		var oDomListItem = ListHelpers.getListItem(oMultiComboBox.getFirstItem()).getDomRef();
		var oListItem = Element.getElementById(oDomListItem.id);
		qutils.triggerTouchEvent("tap", oDomListItem, {
			srcControl : oListItem
		});

		// assertions
		assert.deepEqual(oMultiComboBox.getSelectedItems(), [oItem]);
		assert.strictEqual(fnFireChangeSpy.callCount, 1, "The change event was fired");
		assert.strictEqual(fnFireSelectionChangeSpy.callCount, 1, "The selection change event was fired");
		assert.strictEqual(fnFireSelectionFinishSpy.callCount, 0, "The selection finish event was fired");

		// act - CloseList
		qutils.triggerKeydown(oMultiComboBox.getFocusDomRef(), KeyCodes.ARROW_UP, false, true);
		this.clock.tick(500);

		// assertions
		assert.strictEqual(fnFireSelectionFinishSpy.callCount, 1, "The selection finish event was fired");

		// cleanup
		fnFireSelectionChangeSpy.restore();
		fnFireSelectionFinishSpy.restore();
		oMultiComboBox.destroy();
	});

	QUnit.test("Scenario 'EVENT_DESELECTION_SPACE': SelectedItem + ALT+DOWNKEY + DeselectItem + ALT+UPKEY", async function(assert) {
		this.clock = sinon.useFakeTimers();
		var oSystem = {
			desktop : true,
			phone : false,
			tablet : false
		};
		this.stub(Device, "system").value(oSystem);

		// system under test
		var oItem;
		var oMultiComboBox = new MultiComboBox({
			items : [oItem = new Item({
				key : "DZ",
				text : "Algeria"
			})],
			selectedItems : [oItem]
		});

		// arrange
		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate(this.clock);
		oMultiComboBox.focus();

		var fnFireChangeSpy = this.spy(oMultiComboBox, "fireChange");
		var fnFireSelectionChangeSpy = this.spy(oMultiComboBox, "fireSelectionChange");
		var fnFireSelectionFinishSpy = this.spy(oMultiComboBox, "fireSelectionFinish");

		// act - 'alg' + OpenList + TAP
		qutils.triggerKeydown(oMultiComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN, false, true);
		this.clock.tick(500);
		var oDomListItem = ListHelpers.getListItem(oMultiComboBox.getFirstItem()).getDomRef();
		var oListItem = Element.getElementById(oDomListItem.id);
		qutils.triggerTouchEvent("tap", oDomListItem, {
			srcControl : oListItem
		});

		// assertions
		assert.deepEqual(oMultiComboBox.getSelectedItems(), []);
		assert.strictEqual(fnFireChangeSpy.callCount, 1, "The change event was fired");
		assert.strictEqual(fnFireSelectionChangeSpy.callCount, 1, "The selection change event was fired");
		assert.strictEqual(fnFireSelectionFinishSpy.callCount, 0, "The selection finish event was fired");

		// act - CloseList
		qutils.triggerKeydown(oMultiComboBox.getFocusDomRef(), KeyCodes.ARROW_UP, false, true);
		this.clock.tick(500);

		// assertions
		assert.strictEqual(fnFireSelectionFinishSpy.callCount, 1, "The selection finish event was fired");

		// cleanup
		fnFireSelectionChangeSpy.restore();
		fnFireSelectionFinishSpy.restore();
		oMultiComboBox.destroy();
	});

	QUnit.test("Scenario CLICK_INPUT: tap into control", async function(assert) {
		this.clock = sinon.useFakeTimers();
		// system under test
		var oMultiComboBox = new MultiComboBox({
			items : [new Item({
				key : "DZ",
				text : "Algeria"
			})]
		});

		// arrange
		oMultiComboBox.syncPickerContent();
		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate(this.clock);
		var fnTapSpy = this.spy(oMultiComboBox, "ontap");
		var fnOpenSpy = this.spy(oMultiComboBox.getPicker(), "open");

		// act - clicking on control
		qutils.triggerTouchEvent("tap", oMultiComboBox.getFocusDomRef(), {
			srcControl: oMultiComboBox,
			target: oMultiComboBox.getFocusDomRef()
		});
		this.clock.tick(500);

		// assertions
		assert.strictEqual(fnTapSpy.callCount, 1, "ontap event was called exactly once on " + oMultiComboBox);
		assert.strictEqual(fnOpenSpy.callCount, 0, "open was not called");
		assert.strictEqual(oMultiComboBox.getPicker().oPopup.getOpenState(), OpenState.CLOSED, "Popup is closed");
		assert.ok(!oMultiComboBox.isOpen(), "oMultiComboBox is closed");
		assert.ok(!oMultiComboBox.$().hasClass(InputBase.ICON_PRESSED_CSS_CLASS),
			'The MultiComboBox must not have the css class “' + InputBase.ICON_PRESSED_CSS_CLASS);

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("setSelection should trigger Tokenizer's scrollToEnd", async function (assert) {
		this.clock = sinon.useFakeTimers();
		var oFakeEvent = new Event();

		// system under test
		var oItem = new Item({
				key : "DZ",
				text : "Algeria"
			}),
			oMultiComboBox = new MultiComboBox({
				items : [oItem]
			});

		// arrange
		oMultiComboBox.placeAt("MultiComboBoxContent");
		oMultiComboBox.setSelectedItems([oItem]);

		var oSpy = this.spy(oMultiComboBox.getAggregation("tokenizer"), "scrollToEnd");
		var oStubSetSelection = this.stub(Event.prototype, "getParameters");

		await nextUIUpdate(this.clock);

		oStubSetSelection.withArgs("id").returns(oItem.getId());
		oStubSetSelection.withArgs("item").returns(oItem);
		oStubSetSelection.withArgs("listItemUpdated").returns(true);

		this.clock.tick(500);
		oMultiComboBox.setSelection(oFakeEvent);

		assert.ok(oSpy.called, "Tokenizer's scrollToEnd should be called when a new token is added");

		// cleanup
		oSpy.restore();
		oFakeEvent.destroy();
		oMultiComboBox.destroy();
	});

	QUnit.test("Clicking on token should not throw an exception", async function(assert) {
		this.clock = sinon.useFakeTimers();
		// system under test
		var oItem = new Item({
				key : "DZ",
				text : "Algeria"
			}),
			oMultiComboBox = new MultiComboBox({
				items : [oItem]
			}), oToken;

		// arrange
		oMultiComboBox.placeAt("MultiComboBoxContent");
		oMultiComboBox.setSelectedItems([oItem]);
		await nextUIUpdate(this.clock);

		// act - clicking on control
		oToken = oMultiComboBox.getAggregation("tokenizer").getTokens()[0];
		qutils.triggerTouchEvent("tap", oMultiComboBox.getFocusDomRef(), {
			srcControl: oToken,
			target: oToken.getFocusDomRef()
		});
		this.clock.tick(500);

		assert.ok(true, "The test should not throw and exception");

		// cleanup
		oMultiComboBox.destroy();
	});

	// --------------------------------- //
	// Scenarios - opening dropdown list //
	// --------------------------------- //

	QUnit.test("Scenario OPEN_ALTDOWN", async function(assert) {
		this.clock = sinon.useFakeTimers();
		var oSystem = {
			desktop : true,
			phone : false,
			tablet : false
		};
		this.stub(Device, "system").value(oSystem);

		// system under test
		var oMultiComboBox = new MultiComboBox({
			items : [new Item({
				key : "DZ",
				text : "Algeria"
			})]
		});

		// arrange
		oMultiComboBox.syncPickerContent();
		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate(this.clock);

		var fnShowSpy = this.spy(oMultiComboBox, "onsapshow");
		var fnOpenSpy = this.spy(oMultiComboBox.getPicker(), "open");

		// act
		qutils.triggerKeydown(oMultiComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN, false, true);
		this.clock.tick(500);

		// assertions
		assert.strictEqual(fnShowSpy.callCount, 1, "onsapshow was called exactly once");
		assert.strictEqual(fnOpenSpy.callCount, 1, "openwas called exactly once");
		assert.strictEqual(oMultiComboBox.getPicker().oPopup.getOpenState(), OpenState.OPEN, "Popup is open");
		assert.ok(oMultiComboBox.isOpen(), "oMultiComboBox is open");
		assert.ok(oMultiComboBox.$().hasClass(InputBase.ICON_PRESSED_CSS_CLASS),
				'The MultiComboBox must have the css class “' + InputBase.ICON_PRESSED_CSS_CLASS);
		assert.strictEqual(oMultiComboBox.getFocusDomRef().getAttribute("aria-expanded"), "true", "aria-expanded should be true");
		assert.ok(!oMultiComboBox._isListInSuggestMode(), 'Complete list is open');

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("Scenario OPEN_ALTUP", async function(assert) {
		this.clock = sinon.useFakeTimers();
		var oSystem = {
			desktop : true,
			phone : false,
			tablet : false
		};
		this.stub(Device, "system").value(oSystem);

		// system under test
		var oMultiComboBox = new MultiComboBox({
			items : [new Item({
				key : "DZ",
				text : "Algeria"
			})]
		});

		// arrange
		oMultiComboBox.syncPickerContent();
		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate(this.clock);

		var fnHideSpy = this.spy(oMultiComboBox, "onsaphide");
		var fnOpenSpy = this.spy(oMultiComboBox.getPicker(), "open");

		// act
		qutils.triggerKeydown(oMultiComboBox.getFocusDomRef(), KeyCodes.ARROW_UP, false, true);
		this.clock.tick(500);

		// assertions
		assert.strictEqual(fnHideSpy.callCount, 1, "onsaphide was called exactly once");
		assert.strictEqual(fnOpenSpy.callCount, 1, "openwas called exactly once");
		assert.strictEqual(oMultiComboBox.getPicker().oPopup.getOpenState(), OpenState.OPEN, "Popup is open");
		assert.ok(oMultiComboBox.isOpen(), "oMultiComboBox is open");
		assert.ok(oMultiComboBox.$().hasClass(InputBase.ICON_PRESSED_CSS_CLASS),
				'The MultiComboBox must have the css class “' + InputBase.ICON_PRESSED_CSS_CLASS);
		assert.strictEqual(oMultiComboBox.getFocusDomRef().getAttribute("aria-expanded"), "true", "aria-expanded should be true");
		assert.ok(!oMultiComboBox._isListInSuggestMode(), 'Complete list is open');

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("Scenario OPEN_F4", async function(assert) {
		this.clock = sinon.useFakeTimers();
		var oSystem = {
			desktop : true,
			phone : false,
			tablet : false
		};
		this.stub(Device, "system").value(oSystem);

		// system under test
		var oMultiComboBox = new MultiComboBox({
			items : [new Item({
				key : "DZ",
				text : "Algeria"
			})]
		});

		// arrange
		oMultiComboBox.syncPickerContent();
		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate(this.clock);

		var fnShowSpy = this.spy(oMultiComboBox, "onsapshow");
		var fnOpenSpy = this.spy(oMultiComboBox.getPicker(), "open");

		// act
		qutils.triggerKeydown(oMultiComboBox.getFocusDomRef(), KeyCodes.F4);
		this.clock.tick(500);
		var oItemDomRef = oMultiComboBox._getList().getItems()[0].getDomRef();

		// assertions
		assert.strictEqual(fnShowSpy.callCount, 1, "onsapshow was called exactly once");
		assert.strictEqual(fnOpenSpy.callCount, 1, "open was called exactly once");
		assert.strictEqual(oMultiComboBox.getPicker().oPopup.getOpenState(), OpenState.OPEN, "Popup is open");
		assert.ok(oMultiComboBox.isOpen(), "oMultiComboBox is open");
		assert.ok(oMultiComboBox.$().hasClass(InputBase.ICON_PRESSED_CSS_CLASS),
			'The MultiComboBox must have the css class “' + InputBase.ICON_PRESSED_CSS_CLASS);
		assert.strictEqual(oMultiComboBox.getFocusDomRef().getAttribute("aria-expanded"), "true", "aria-expanded should be true");
		assert.ok(!oMultiComboBox._isListInSuggestMode(), 'Complete list is open');
		assert.strictEqual(document.activeElement, oItemDomRef, "The first item in the list is focused");
		assert.ok(oItemDomRef.hasAttribute("aria-labelledby"), "The first item has an aria-labelledby attribute");

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("Scenario onsapshow with no items", async function(assert) {
		this.clock = sinon.useFakeTimers();
		var oSystem = {
			desktop : true,
			phone : false,
			tablet : false
		};
		this.stub(Device, "system").value(oSystem);

		// system under test
		var oMultiComboBox = new MultiComboBox({
			items : []
		});

		// arrange
		oMultiComboBox.syncPickerContent();
		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate(this.clock);

		// act
		qutils.triggerKeydown(oMultiComboBox.getFocusDomRef(), KeyCodes.F4);
		this.clock.tick(500);

		// assertions
		assert.strictEqual(document.activeElement, oMultiComboBox.getFocusDomRef(), "The focus is on the MultiComboBox");

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("Scenario OPEN_ARROW: tap on arrow", async function(assert) {
		this.clock = sinon.useFakeTimers();
		var oSystem = {
			desktop : true,
			phone : false,
			tablet : false
		};
		this.stub(Device, "system").value(oSystem);

		// system under test
		var oMultiComboBox = new MultiComboBox({
			items : [new Item({
				key : "DZ",
				text : "Algeria"
			})]
		});

		// arrange
		oMultiComboBox.syncPickerContent();
		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate(this.clock);
		var fnOpenSpy = this.spy(oMultiComboBox.getPicker(), "open");

		// act - clicking on arrow
		qutils.triggerTouchEvent("click", oMultiComboBox.getDomRef("arrow"), {
			srcControl: oMultiComboBox,
			target: oMultiComboBox.getDomRef("arrow")
		});
		this.clock.tick(500);

		// assertions
		assert.strictEqual(fnOpenSpy.callCount, 1, "open was called exactly once");
		assert.strictEqual(oMultiComboBox.getPicker().oPopup.getOpenState(), OpenState.OPEN, "Popup is open");
		assert.ok(oMultiComboBox.isOpen(), "oMultiComboBox is open");
		assert.ok(oMultiComboBox.$().hasClass(InputBase.ICON_PRESSED_CSS_CLASS),
			'The MultiComboBox must have the css class “' + InputBase.ICON_PRESSED_CSS_CLASS);
		assert.strictEqual(oMultiComboBox.getFocusDomRef().getAttribute("aria-expanded"), "true", "aria-expanded should be true");
		assert.ok(!oMultiComboBox._isListInSuggestMode(), 'Complete list is open');

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("Scenario OPEN_VALUE: Typing valid letters into InputField", async function(assert) {
		this.clock = sinon.useFakeTimers();
		var oSystem = {
			desktop : true,
			phone : false,
			tablet : false
		};
		this.stub(Device, "system").value(oSystem);

		// system under test
		var oMultiComboBox = new MultiComboBox({
			value : "algeria",
			items : [new Item({
				key : "DZ",
				text : "Algeria"
			}), new Item({
				key : "AR",
				text : "Argentina"
			})]
		});

		// arrange
		oMultiComboBox.syncPickerContent();
		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate(this.clock);
		var fnOpenSpy = this.spy(oMultiComboBox.getPicker(), "open");

		// act
		qutils.triggerEvent("input", oMultiComboBox.getFocusDomRef());
		this.clock.tick(500);

		// assertions
		assert.strictEqual(fnOpenSpy.callCount, 1, "open was called exactly once");
		assert.strictEqual(oMultiComboBox.getPicker().oPopup.getOpenState(), OpenState.OPEN, "Popup is open");
		assert.ok(oMultiComboBox.isOpen(), "oMultiComboBox is open");
		assert.ok(oMultiComboBox.$().hasClass(InputBase.ICON_PRESSED_CSS_CLASS),
			'The MultiComboBox must have the css class “' + InputBase.ICON_PRESSED_CSS_CLASS);
		assert.strictEqual(oMultiComboBox.getFocusDomRef().getAttribute("aria-expanded"), "true", "aria-expanded should be true");
		assert.ok(oMultiComboBox._isListInSuggestMode(), 'Suggest list is open');

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("Scenario OPEN_VALUE: Type valid letter into InputField and delete it", async function(assert) {
		this.clock = sinon.useFakeTimers();
		var oSystem = {
			desktop : true,
			phone : false,
			tablet : false
		};
		this.stub(Device, "system").value(oSystem);

		// system under test
		var oMultiComboBox = new MultiComboBox({
			value : "a",
			items : [new Item({
				key : "DZ",
				text : "Algeria"
			}), new Item({
				key : "BA",
				text : "Barahin"
			})]
		});

		// arrange
		oMultiComboBox.syncPickerContent();
		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate(this.clock);
		qutils.triggerEvent("input", oMultiComboBox.getFocusDomRef());
		this.clock.tick(500);

		// assertions
		assert.ok(oMultiComboBox._isListInSuggestMode(), 'Suggest list is open');

		// act
		oMultiComboBox.setValue("");
		qutils.triggerEvent("input", oMultiComboBox.getFocusDomRef());
		this.clock.tick(500);

		// assertions
		assert.ok(!oMultiComboBox.isOpen(), "oMultiComboBox is closed");

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("Scenario OPEN_VALUE: Open MCB by Arrow + Down / F4 or by clicking arrow then type valid letter and delete it", async function (assert) {
		this.clock = sinon.useFakeTimers();
		var oSystem = {
			desktop : true,
			phone : false,
			tablet : false
		};
		this.stub(Device, "system").value(oSystem);

		// system under test
		var oMultiComboBox = new MultiComboBox({
			value : "a",
			items : [new Item({
				key : "DZ",
				text : "Algeria"
			}), new Item({
				key : "BA",
				text : "Barahin"
			})]
		});

		// arrange
		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate(this.clock);
		oMultiComboBox.focus();

		qutils.triggerKeydown(oMultiComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN, false, true);
		this.clock.tick(500);

		// act
		oMultiComboBox.getFocusDomRef().value = "";
		qutils.triggerEvent("input", oMultiComboBox.getFocusDomRef());
		this.clock.tick(500);

		assert.ok(oMultiComboBox.isOpen(), "oMultiComboBox is opened");

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("Scenario OPEN_SUGGEST_SPACE: Pushing SPACE on item in suggest list - suggest list is closing first and complete list is opening then", async function(assert) {
				this.clock = sinon.useFakeTimers();
				var oSystem = {
					desktop : true,
					phone : false,
					tablet : false
				};
				this.stub(Device, "system").value(oSystem);

				// system under test
				var oMultiComboBox = new MultiComboBox({
					value : "al",
					items : [new Item({
						key : "DZ",
						text : "Algeria"
					}), new Item({
						key : "AR",
						text : "Argentina"
					})]
				});

				// arrange
				oMultiComboBox.syncPickerContent();
				oMultiComboBox.placeAt("MultiComboBoxContent");
				await nextUIUpdate(this.clock);
				var fnOpenSpy = this.spy(oMultiComboBox.getPicker(), "open");

				// act
				qutils.triggerEvent("input", oMultiComboBox.getFocusDomRef());
				this.clock.tick(500);

				// assertions
				assert.ok(oMultiComboBox._isListInSuggestMode(), 'Suggest list is open');

				// act
				var oDomListItem = ListHelpers.getListItem(oMultiComboBox.getFirstItem()).getDomRef();
				qutils.triggerKeyup(oDomListItem, KeyCodes.SPACE);
				this.clock.tick(500);

				// assertions
				assert.strictEqual(fnOpenSpy.callCount, 2, "open was called exactly once");
				assert.strictEqual(oMultiComboBox.getPicker().oPopup.getOpenState(), OpenState.OPEN, "Popup is open");
				assert.ok(oMultiComboBox.isOpen(), "oMultiComboBox is open");
				assert.ok(oMultiComboBox.$().hasClass(InputBase.ICON_PRESSED_CSS_CLASS),
					'The MultiComboBox must have the css class “' + InputBase.ICON_PRESSED_CSS_CLASS);

				// cleanup
				oMultiComboBox.destroy();
					});

	QUnit.test("Scenario OPEN_SUGGEST_ARROW: Pushing twice ALT+DOWN etc. in suggest list - suggest list is closing first and complete list is opening then",
			async function(assert) {
				this.clock = sinon.useFakeTimers();
				var oSystem = {
					desktop : true,
					phone : false,
					tablet : false
				};
				this.stub(Device, "system").value(oSystem);

				// system under test
				var oMultiComboBox = new MultiComboBox({
					value : "al",
					items : [new Item({
						key : "DZ",
						text : "Algeria"
					}), new Item({
						key : "AR",
						text : "Argentina"
					})]
				});

				// arrange
				oMultiComboBox.syncPickerContent();
				oMultiComboBox.placeAt("MultiComboBoxContent");
				await nextUIUpdate(this.clock);
				oMultiComboBox.focus();
				var fnOpenSpy = this.spy(oMultiComboBox.getPicker(), "open");

				// act
				qutils.triggerEvent("input", oMultiComboBox.getFocusDomRef());
				this.clock.tick(500);

				// assertions
				assert.ok(oMultiComboBox._isListInSuggestMode(), 'Suggest list is open');

				// act
				qutils.triggerKeydown(oMultiComboBox.getFocusDomRef(), KeyCodes.ARROW_UP, false,
						true); // close list
				this.clock.tick(500);
				qutils.triggerKeydown(oMultiComboBox.getFocusDomRef(), KeyCodes.ARROW_UP, false,
						true); // open list
				this.clock.tick(500);

				// assertions
				assert.strictEqual(fnOpenSpy.callCount, 2, "open was called exactly twice");
				assert.strictEqual(oMultiComboBox.getPicker().oPopup.getOpenState(), OpenState.OPEN, "Popup is open");
				assert.ok(oMultiComboBox.isOpen(), "oMultiComboBox is open");
				assert.ok(oMultiComboBox.$().hasClass(InputBase.ICON_PRESSED_CSS_CLASS),
					'The MultiComboBox must have the css class “' + InputBase.ICON_PRESSED_CSS_CLASS);
				assert.ok(!oMultiComboBox._isListInSuggestMode(), 'Complete list is open');

				// cleanup
				oMultiComboBox.destroy();
					});

	QUnit.test("Scenario 'CLOSE_TAP': closing list via tapping on list item", async function(assert) {
		this.clock = sinon.useFakeTimers();
		var oSystem = {
			desktop : true,
			phone : false,
			tablet : false
		};
		this.stub(Device, "system").value(oSystem);

		// system under test
		var oMultiComboBox = new MultiComboBox({
			items : [new Item({
				text : "Algeria"
			}), new Item({
				text : "Argentina"
			})]
		});

		// arrange
		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate(this.clock);
		oMultiComboBox.getFocusDomRef().focus();
		oMultiComboBox.open();
		this.clock.tick(500);

		// act
		var oDomListItem = ListHelpers.getListItem(oMultiComboBox.getFirstItem()).getDomRef();
		var oListItem = Element.getElementById(oDomListItem.id);
		qutils.triggerEvent("tap", oDomListItem, {
			srcControl : oListItem
		});
		this.clock.tick(500);

		// assertions
		assert.ok(!oMultiComboBox.isOpen(), "oMultiComboBox is closed");
		assert.strictEqual(oMultiComboBox.getFocusDomRef().getAttribute("aria-expanded"), "false", "aria-expanded should be false");
		assert.equal(oMultiComboBox.getFocusDomRef().id, document.activeElement.id, "Input field has focus");

		// cleanup
		oMultiComboBox.destroy();
	});

	// --------------------------------- //
	// Scenarios - closing dropdown list //
	// --------------------------------- //

	/*test("Scenario CLOSE_FOCUSLEAVE", function() {

		  // system under test
		  var oMultiComboBox = new MultiComboBox({
				 items : [ new Item({
						key : "DZ",
						text : "Algeria"
				 }) ]
		  });

		  // arrange
		  oMultiComboBox.placeAt("MultiComboBoxContent");
		  await nextUIUpdate();
		  oMultiComboBox.focus();

		  var fnOpenSpy = this.spy(oMultiComboBox.getPicker(), "open");
		  var fnCloseSpy = this.spy(oMultiComboBox.getPicker(), "close");

		  // act
		  oMultiComboBox.open();
		  this.clock.tick(1000);
		  qutils.triggerEvent("focusout", oMultiComboBox.getFocusDomRef());
		  this.clock.tick(1000);

		  // assertions
		  assert.strictEqual(fnCloseSpy.callCount, 1, "close was called exactly once");
		  assert.strictEqual(oMultiComboBox.getPicker().oPopup.getOpenState(), OpenState.CLOSED, "Popup is closed");
		  assert.ok(!oMultiComboBox.isOpen(), "oMultiComboBox is closed");
		  assert.ok(!oMultiComboBox.$().hasClass(ComboBoxBaseRenderer.CSS_CLASS_COMBOBOXBASE), 'The MultiComboBox must not have the css class “'
						+ ComboBoxBaseRenderer.CSS_CLASS_COMBOBOXBAS);

		  // cleanup
		  oMultiComboBox.destroy();
	});*/

	// --------------------------------- //
	// Arrow - pressed state             //
	// --------------------------------- //
	QUnit.test("Arrow - pressed on arrow", async function(assert) {

		// system under test
		var oMultiComboBox = new MultiComboBox({
			items : [new Item({
				key : "DZ",
				text : "Algeria"
			})]
		});

		// arrange
		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate();
		oMultiComboBox.focus();

		// act
		var oDomRefArrow = oMultiComboBox.getDomRef("arrow");
		qutils.triggerTouchEvent("click", oDomRefArrow, {
			target : oDomRefArrow
		});

		// assertions
		assert.ok(oMultiComboBox.isOpen(), "oMultiComboBox is open");
		assert.ok(oMultiComboBox.$().hasClass(InputBase.ICON_PRESSED_CSS_CLASS),
				'The MultiComboBox must have the css class "' + InputBase.ICON_PRESSED_CSS_CLASS + '"');
		assert.strictEqual(oMultiComboBox.getFocusDomRef().getAttribute("aria-expanded"), "true", "aria-expanded should be true");

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("Arrow - pressed on control", async function(assert) {

		// system under test
		var oMultiComboBox = new MultiComboBox({
			items : [new Item({
				key : "DZ",
				text : "Algeria"
			})]
		});

		// arrange
		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate();
		oMultiComboBox.focus();

		// act
		var oDomRef = oMultiComboBox.getFocusDomRef();
		qutils.triggerTouchEvent("touchstart", oDomRef, {
			target : oDomRef
		});

		// assertions
		assert.ok(!oMultiComboBox.isOpen(), "oMultiComboBox is closed");
		assert.ok(!oMultiComboBox.$().hasClass(InputBase.ICON_PRESSED_CSS_CLASS),
				'The MultiComboBox must not have the css class "' + InputBase.ICON_PRESSED_CSS_CLASS + '"');
		assert.strictEqual(oMultiComboBox.getFocusDomRef().getAttribute("aria-expanded"), "false", "aria-expanded should be false");

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("Arrow - tap on list item in suggest mode", async function(assert) {
		this.clock = sinon.useFakeTimers();
		var oSystem = {
			desktop : true,
			phone : false,
			tablet : false
		};
		this.stub(Device, "system").value(oSystem);

		// system under test
		var oMultiComboBox = new MultiComboBox({
			value : "a",
			items : [new Item({
				key : "DZ",
				text : "Algeria"
			}), new Item({
				key : "BA",
				text : "Barahin"
			})]
		});

		// arrange
		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate(this.clock);
		qutils.triggerEvent("input", oMultiComboBox.getFocusDomRef());
		this.clock.tick(500);

		// act
		var oDomListItem = ListHelpers.getListItem(oMultiComboBox.getFirstItem()).getDomRef();
		var oListItem = Element.getElementById(oDomListItem.id);
		oListItem.focus();
		qutils.triggerTouchEvent("tap", oDomListItem, {
			srcControl : oListItem
		});
		this.clock.tick(500);

		// assertions
		assert.ok(oMultiComboBox.isOpen(), "oMultiComboBox is open");
		assert.ok(!oMultiComboBox._isListInSuggestMode(), 'Complete list is open');
		assert.ok(oMultiComboBox.$().hasClass(InputBase.ICON_PRESSED_CSS_CLASS),
				'The MultiComboBox must have the css class "' + InputBase.ICON_PRESSED_CSS_CLASS + '"');

		// cleanup
		oMultiComboBox.destroy();
	});
	// --------------------------------- //
	// Focus - border                    //
	// --------------------------------- //
	QUnit.test("FocusBorder - pressed on control", async function(assert) {

		// system under test
		var oMultiComboBox = new MultiComboBox({
			items : [new Item({
				key : "DZ",
				text : "Algeria"
			})]
		});

		// arrange
		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate();
		oMultiComboBox.focus();

		// act
		var oDomRef = oMultiComboBox.getFocusDomRef();
		qutils.triggerTouchEvent("touchstart", oDomRef, {
			target : oDomRef
		});

		// assertions
		assert.ok(oMultiComboBox.$().hasClass("sapMFocus"), 'The MultiComboBox has the CSS class "sapMFocus"');

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("FocusBorder - pressed on read-only control", async function(assert) {

		// system under test
		var oMultiComboBox = new MultiComboBox({
			items : [new Item({
				key : "DZ",
				text : "Algeria"
			})],
			editable: false
		});

		// arrange
		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate();
		oMultiComboBox.focus();

		// act
		var oDomRef = oMultiComboBox.getFocusDomRef();
		qutils.triggerTouchEvent("touchstart", oDomRef, {
			target : oDomRef
		});

		// assertions
		assert.ok(oMultiComboBox.$().hasClass("sapMFocus"), 'The MultiComboBox has the CSS class "sapMFocus"');

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("FocusBorder - pressed on arrow", async function(assert) {

		// system under test
		var oMultiComboBox = new MultiComboBox({
			items : [new Item({
				key : "DZ",
				text : "Algeria"
			})]
		});

		// arrange
		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate();
		oMultiComboBox.focus();

		// act
		var oDomRefArrow = oMultiComboBox.getDomRef("arrow");
		qutils.triggerTouchEvent("touchstart", oDomRefArrow, {
			target : oDomRefArrow
		});

		// assertions
		assert.ok(oMultiComboBox.$().hasClass("sapMFocus"), 'The MultiComboBox has the CSS class "sapMFocus"');

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("FocusBorder - focus on list item", async function(assert) {
		this.clock = sinon.useFakeTimers();
		// system under test
		var oMultiComboBox = new MultiComboBox({
			items : [new Item({
				key : "DZ",
				text : "Algeria"
			})]
		});

		// arrange
		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate(this.clock);
		oMultiComboBox.focus();

		// act
		qutils.triggerKeydown(oMultiComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN, false, true);
		this.clock.tick(500);
		var oDomListItem = ListHelpers.getListItem(oMultiComboBox.getFirstItem()).getDomRef();
		var oListItem = Element.getElementById(oDomListItem.id);
		qutils.triggerTouchEvent("tap", oDomListItem, {
			srcControl : oListItem
		});

		// assertions
		assert.ok(oMultiComboBox.$().hasClass(MultiComboBoxRenderer.CSS_CLASS_MULTICOMBOBOX + "Focused"),
				'The MultiComboBox must have the css class “' + MultiComboBoxRenderer.CSS_CLASS_MULTICOMBOBOX + 'Focused”');

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("FocusBorder - arrow + leave", async function(assert) {

		// system under test
		var oMultiComboBox = new MultiComboBox({
			items : [new Item({
				key : "DZ",
				text : "Algeria"
			})]
		});

		// arrange
		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate();
		oMultiComboBox.focus();

		// act
		var oDomRefArrow = oMultiComboBox.getDomRef("arrow");
		qutils.triggerTouchEvent("touchstart", oDomRefArrow, {
			target : oDomRefArrow
		});
		qutils.triggerEvent("focusout", oMultiComboBox.getDomRef());

		// assertions
		assert.ok(!oMultiComboBox.$().hasClass(MultiComboBoxRenderer.CSS_CLASS_MULTICOMBOBOX + "Focused"),
				'The MultiComboBox must not have the css class “' + MultiComboBoxRenderer.CSS_CLASS_MULTICOMBOBOX + 'Focused”');

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("FocusBorder - control + leave", async function(assert) {
		// system under test
		var oMultiComboBox = new MultiComboBox({
			items : [new Item({
				key : "DZ",
				text : "Algeria"
			})]
		});

		// arrange
		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate();
		oMultiComboBox.focus();

		// act
		var oDomRef = oMultiComboBox.getFocusDomRef();
		qutils.triggerTouchEvent("touchstart", oDomRef, {
			target : oDomRef
		});
		qutils.triggerEvent("focusout", oDomRef);

		// assertions
		assert.ok(!oMultiComboBox.$().hasClass(MultiComboBoxRenderer.CSS_CLASS_MULTICOMBOBOX + "Focused"),
				'The MultiComboBox must not have the css class “' + MultiComboBoxRenderer.CSS_CLASS_MULTICOMBOBOX + 'Focused”');

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("Input Value - reset on focus out", async function(assert) {
		this.clock = sinon.useFakeTimers();
		// system under test
		var oMultiComboBox = new MultiComboBox({
			items : [new Item({
				key : "DZ",
				text : "Algeria"
			})]
		});

		var oMultiComboBoxNext = new MultiComboBox({
			items : [new Item({
				key : "DZ",
				text : "Algeria"
			})]
		});

		// arrange
		oMultiComboBox.placeAt("MultiComboBoxContent");
		oMultiComboBoxNext.placeAt("MultiComboBoxContent");

		await nextUIUpdate(this.clock);
		oMultiComboBox.setValue("Foo");

		// act
		oMultiComboBox.getFocusDomRef().focus();
		this.clock.tick(500);
		oMultiComboBox.getFocusDomRef().blur();
		this.clock.tick(500);

		// assertions
		assert.strictEqual(oMultiComboBox.getValue(), "",
				'The InputValue of the MultiComboBox must be resetted (empty) when it loses the focus.');

		// cleanup
		oMultiComboBox.destroy();
		oMultiComboBoxNext.destroy();
	});

	QUnit.test("Input Value - select Item on Tab out", async function(assert) {

		// system under test
		var oMultiComboBox = new MultiComboBox({
			items : [new Item({
				key : "DZ",
				text : "Algeria"
			})]
		});

		var oMultiComboBoxNext = new MultiComboBox({
			items : [new Item({
				key : "DZ",
				text : "Algeria"
			})]
		});

		// arrange
		oMultiComboBox.placeAt("MultiComboBoxContent");
		oMultiComboBoxNext.placeAt("MultiComboBoxContent");

		oMultiComboBox.syncPickerContent();
		await nextUIUpdate();

		// act
		oMultiComboBox.getFocusDomRef().focus();
		qutils.triggerCharacterInput(oMultiComboBox.getFocusDomRef(), "Algeria");
		qutils.triggerKeydown(oMultiComboBox.getDomRef(), KeyCodes.TAB);

		// assertions
		assert.strictEqual(oMultiComboBox.getValue(), "",
				'The InputValue of the MultiComboBox must be resetted (empty) when user tabs to next control.');
		assert.strictEqual(oMultiComboBox.getSelectedItems()[0].getKey(), "DZ");

		// cleanup
		oMultiComboBox.destroy();
		oMultiComboBoxNext.destroy();
	});

	QUnit.test("Keep picker open after re-rendering", async function(assert) {
		this.clock = sinon.useFakeTimers();
		// system under test
		var oMultiComboBox = new MultiComboBox({
			items : [new Item({
				key : "DZ",
				text : "Algeria"
			})]
		});

		// arrange
		oMultiComboBox.placeAt("MultiComboBoxContent");

		await nextUIUpdate(this.clock);

		oMultiComboBox.focus();

		oMultiComboBox.open();

		this.clock.tick(500);
		oMultiComboBox._getList().getItems()[0].focus();

		// act
		oMultiComboBox.invalidate();

		this.clock.tick(500);

		// assertions
		assert.ok(oMultiComboBox.isOpen(), "oMultiComboBox is open");
		assert.ok(oMultiComboBox._getList().getItems()[0].getDomRef() === document.activeElement, "First Item of list is focused");

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("Cancel selection", async function(assert) {
		this.clock = sinon.useFakeTimers();
		// system under test
		this.stub(Device, "system").value({
			desktop: false,
			phone: true,
			tablet: false
		});

		var oItem = new Item({
				key : "DZ",
				text : "Algeria"
			}),
			oMultiComboBox = new MultiComboBox({
			items : [oItem]
		});

		// arrange
		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate(this.clock);
		this.clock.tick(nPopoverAnimationTick);

		oMultiComboBox.open();
		this.clock.tick(1000);


		oMultiComboBox.setSelectedItems([oItem]);
		oMultiComboBox.getPicker().getCustomHeader().getContentRight()[0].firePress();
		this.clock.tick(nPopoverAnimationTick);

		assert.strictEqual(oMultiComboBox.getSelectedItems().length, 0, "No items selected after cancel selection");

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("method: _setContainerSizes() - Calculating correct sizes", async function(assert) {
		this.clock = sinon.useFakeTimers();
		// system under test
		var oSystem = {
			desktop : false,
			phone : true,
			tablet : false
		};

		this.stub(Device, "system").value(oSystem);

		var oMultiComboBox = new MultiComboBox({
			id : "MultiComboBox",
			width : "400px",
			placeholder : "Choose your country"
		});

		// arrange
		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate(this.clock);
		this.clock.tick(1000);

		// assertions
		assert.ok(oMultiComboBox.getDomRef().clientWidth >= oMultiComboBox.$().find(".sapMInputBaseInner")[0].clientWidth,
			"Check if the size of the container is calculated correctly.");

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("setSelection + Popover close race condition", async function (assert) {
		this.clock = sinon.useFakeTimers();
		// system under test
		this.stub(Device, "system").value({
			desktop: true,
			phone: false,
			tablet: true
		});

		var oItem = new Item({text: "Example"});
		var oMCB = new MultiComboBox({
			items: [oItem]
		}).placeAt("MultiComboBoxContent");
		oMCB.syncPickerContent();

		var oSpyFireSelectionFinish = this.spy(oMCB, "fireSelectionFinish");
		var oSpySetSelection = this.spy(oMCB, "setSelection");
		var oList = oMCB._getList();

		await nextUIUpdate(this.clock);

		oMCB.open();
		await nextUIUpdate(this.clock);
		this.clock.tick(500);

		var oFakeEvent = {
			id: oList.getId(),
			listItem: oList.getItems()[0],
			getParameter: function (sParam) {
				if (sParam === "listItem") {
					return oList.getItems()[0];
				}
				if (sParam === "selectAll") {
					return false;
				}

				return true;
			}
		};

		oMCB._handleSelectionLiveChange(oFakeEvent);

		//Assert
		assert.strictEqual(oSpySetSelection.callCount, 1, "setSelection executed");
		assert.strictEqual(oSpyFireSelectionFinish.callCount, 0, "fireSelectionFinish not called yet");

		//Act. Close the popover
		oMCB.close();
		oMCB._handleItemPress(oFakeEvent);
		this.clock.tick(500);

		//Assert
		assert.ok(oSpySetSelection.calledBefore(oSpyFireSelectionFinish), "setSelection should be called before fireSelectionFinish.");
		assert.strictEqual(oSpySetSelection.callCount, 1, "setSelection executed last run.");
		assert.strictEqual(oSpyFireSelectionFinish.callCount, 1, "fireSelectionFinish is called async after setSelection");
		assert.ok(oSpyFireSelectionFinish.calledWithMatch({selectedItems: [oItem]}), "fireSelectionFinish should return an array within object containing the selected items.");

		oMCB.destroy();
	});

	QUnit.test("Selecting an item should close the picker and clean the input", async function(assert) {
		this.clock = sinon.useFakeTimers();
		var oFakeEvent = new Event(),
			oItem = new Item({
				text: "test1"
			}),
			oMultiComboBox = new MultiComboBox({
				items: [
					oItem,
					new Item({
						text: "a"
					})
				]
			}),
			oFakeInput = {
				target: {
					value: "t"
				},
				setMarked: function () {},
				srcControl: oMultiComboBox
			};

		var oHandleTokensStub = this.stub(Event.prototype, "getParameter");

		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate(this.clock);

		oMultiComboBox.open();
		this.clock.tick(nPopoverAnimationTick);

		oMultiComboBox._sOldValue = "t";
		oMultiComboBox._bCheckBoxClicked = false;
		oMultiComboBox.setValue("t");
		oMultiComboBox.fireChange({ value: "t" });
		oMultiComboBox.oninput(oFakeInput);
		await nextUIUpdate(this.clock);

		oHandleTokensStub.withArgs("listItem").returns(ListHelpers.getListItem(oItem));
		oHandleTokensStub.withArgs("selected").returns(true);

		oMultiComboBox._handleSelectionLiveChange(oFakeEvent);
		await nextUIUpdate(this.clock);
		this.clock.tick(nPopoverAnimationTick);

		assert.strictEqual(oMultiComboBox.isOpen(), false, "Picker should close after selection");
		assert.strictEqual(oMultiComboBox.getValue(), "", "Value should be empty");

		oFakeInput = null;
		oMultiComboBox.destroy();
	});

	QUnit.test("Selecting an item checkbox should not close the picker", async function(assert) {
		this.clock = sinon.useFakeTimers();
		var oFakeEvent = new Event(),
			oItem = new Item({
				text: "test1"
			}),
			oMultiComboBox = new MultiComboBox({
				items: [
					oItem,
					new Item({
						text: "a"
					})
				]
			}),
			oFakeInput = {
				target: {
					value: "t"
				},
				setMarked: function () { },
				srcControl: oMultiComboBox
			};

		var oHandleTokensStub = this.stub(Event.prototype, "getParameter");

		this.stub(MultiComboBox.prototype, "onfocusin");

		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate(this.clock);

		oMultiComboBox.open();
		this.clock.tick(nPopoverAnimationTick);

		oMultiComboBox._sOldValue = "t";
		oMultiComboBox._bCheckBoxClicked = true;
		oMultiComboBox.setValue("t");
		oMultiComboBox.fireChange({ value: "t" });
		oMultiComboBox.oninput(oFakeInput);
		await nextUIUpdate(this.clock);

		oHandleTokensStub.withArgs("listItem").returns(ListHelpers.getListItem(oItem));
		oHandleTokensStub.withArgs("selected").returns(true);

		oMultiComboBox._handleSelectionLiveChange(oFakeEvent);
		await nextUIUpdate(this.clock);
		this.clock.tick(nPopoverAnimationTick);

		assert.strictEqual(oMultiComboBox.isOpen(), true, "Picker should not close after selection");
		assert.strictEqual(oMultiComboBox.getValue(), "t", "Value should be t");

		oFakeInput = null;
		oMultiComboBox.destroy();
	});

	QUnit.test("Selecting an item checkbox should not add the old input value in the field", async function(assert) {
		this.clock = sinon.useFakeTimers();
		// arrange
		var oFakeEvent = new Event(),
			oItem = new Item({
				text: "test1"
			}),
			oMultiComboBox = new MultiComboBox({
				items: [oItem]
			}),
			oFakeInput = {
				target: {
					value: "t"
				},
				setMarked: function () { },
				srcControl: oMultiComboBox
			},
			oHandleTokensStub = this.stub(Event.prototype, "getParameter");

		this.stub(MultiComboBox.prototype, "onfocusin");


		// act
		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate(this.clock);
		oMultiComboBox.getFocusDomRef().focus();

		oMultiComboBox.setValue("t");
		oMultiComboBox.fireChange({ value: "t" });
		oMultiComboBox.oninput(oFakeInput);

		oHandleTokensStub.withArgs("listItem").returns(ListHelpers.getListItem(oItem));
		oHandleTokensStub.withArgs("selected").returns(true);

		oMultiComboBox.getFocusDomRef().blur();
		this.clock.tick(nPopoverAnimationTick);

		oMultiComboBox.open();
		this.clock.tick(nPopoverAnimationTick);

		oMultiComboBox._handleSelectionLiveChange(oFakeEvent);
		await nextUIUpdate(this.clock);

		// assert
		assert.strictEqual(oMultiComboBox.getValue(), "", "Value should be cleared");

		// clean up
		oFakeInput = null;
		oMultiComboBox.destroy();
	});

	QUnit.test("onAfterRenderingList should check properly the focused item", async function(assert) {
		this.clock = sinon.useFakeTimers();
		// arrange
		var oMultiComboBox = new MultiComboBox({
				items: [new Item({text: "test1"})]
			}).placeAt("MultiComboBoxContent"),
			iTestFocusIndex = 100,
			oFocusSpy;

		this.stub(oMultiComboBox, "getFocusDomRef");

		await nextUIUpdate(this.clock);
		oMultiComboBox.open();
		this.clock.tick(nPopoverAnimationTick);

		oFocusSpy = this.spy(oMultiComboBox._getList().getItems()[0], "focus");

		// act
		oMultiComboBox._iFocusedIndex = iTestFocusIndex;

		document.body.focus();

		oMultiComboBox.onAfterRenderingList();
		await nextUIUpdate(this.clock);

		// assert
		assert.notOk(oFocusSpy.calledOnce, "The item should not be focused");
		assert.strictEqual(oMultiComboBox._iFocusedIndex, iTestFocusIndex, "should not reset the focused index");

		// arrange
		oMultiComboBox._iFocusedIndex = 0;

		// act
		oMultiComboBox.onAfterRenderingList();
		await nextUIUpdate(this.clock);

		// assert
		assert.ok(oFocusSpy.calledOnce, "The item should be focused");
		assert.strictEqual(oMultiComboBox._iFocusedIndex, null, "should reset the focused index");

		// clean up
		oMultiComboBox.destroy();
	});

	QUnit.test("hasSelection - MultiComboBox with no pre-selected items", async function(assert) {
		this.clock = sinon.useFakeTimers();
		// arrange
		var oMultiComboBox = new MultiComboBox({
				items: [
					new Item({key: "Item1", text: "Item1"}),
					new Item({key: "Item2", text: "Item2"})
				]
			}).placeAt("MultiComboBoxContent");

		await nextUIUpdate(this.clock);
		oMultiComboBox.open();
		this.clock.tick(nPopoverAnimationTick);

		// assert
		assert.notOk(oMultiComboBox.getProperty("hasSelection"), "The property should be correctly set on initial loading.");
		assert.notOk(oMultiComboBox.$().hasClass("sapMMultiComboBoxHasToken"), "The property should be correctly set to true.");

		var oListItem = oMultiComboBox._getList().getItems()[0];
		var oDomListItem = oListItem.getDomRef();

		qutils.triggerTouchEvent("tap", oDomListItem, {
			srcControl : oListItem
		});

		this.clock.tick(200);

		// assert
		assert.ok(oMultiComboBox.getProperty("hasSelection"), "The property should be correctly set to true.");
		assert.ok(oMultiComboBox.$().hasClass("sapMMultiComboBoxHasToken"), "The control should have a class set.");

		oMultiComboBox.focus();
		qutils.triggerKeydown(document.activeElement, KeyCodes.BACKSPACE);
		qutils.triggerKeydown(document.activeElement, KeyCodes.BACKSPACE);

		this.clock.tick(500);

		// assert
		assert.notOk(oMultiComboBox.getProperty("hasSelection"), "The property should be correctly set on item delete.");
		assert.notOk(oMultiComboBox.$().hasClass("sapMMultiComboBoxHasToken"), "The control should not have the class set.");

		// clean up
		oMultiComboBox.destroy();
	});

	QUnit.test("hasSelection - MultiComboBox with pre-selected items", async function(assert) {
		this.clock = sinon.useFakeTimers();
		// arrange
		var oSpy;
		var oMultiComboBox = new MultiComboBox({
				items: [
					new Item({key: "Item1", text: "Item1"}),
					new Item({key: "Item2", text: "Item2"})
				],
				selectedKeys: ["Item1"]
			}).placeAt("MultiComboBoxContent");

		await nextUIUpdate(this.clock);

		// assert
		assert.ok(oMultiComboBox.getProperty("hasSelection"), "The property should be correctly set to true.");
		assert.ok(oMultiComboBox.$().hasClass("sapMMultiComboBoxHasToken"), "The control should have a class set.");

		oMultiComboBox.focus();
		qutils.triggerKeydown(document.activeElement, KeyCodes.BACKSPACE);
		qutils.triggerKeydown(document.activeElement, KeyCodes.BACKSPACE);

		this.clock.tick(500);

		// assert
		assert.notOk(oMultiComboBox.getProperty("hasSelection"), "The property should be correctly set on item delete.");
		assert.notOk(oMultiComboBox.$().hasClass("sapMMultiComboBoxHasToken"), "The control should not have the class set.");

		oMultiComboBox.open();
		oSpy = this.spy(oMultiComboBox._getSuggestionsPopover(), "addContent");

		oMultiComboBox.setProperty("hasSelection", true);
		await nextUIUpdate(this.clock);

		assert.strictEqual(oSpy.notCalled, true ,"The popover is not re-rendered after unnecessary content aggregation update");

		// clean up
		oSpy.restore();
		oMultiComboBox.destroy();
	});

	QUnit.module("Focus handling", {
		afterEach: function () {
			runAllTimersAndRestore(this.clock);
		}
	});

	QUnit.test("Focusing a token inside the MCB should not add css focus indication to the MCB itself", async function(assert) {
		var oItem = new Item({ text: "test" }),
			oFakeEvent = new Event(),
			oMultiComboBox = new MultiComboBox({
				items: [oItem]
			}).placeAt("MultiComboBoxContent");

		var oHandleTokenFocusStub = this.stub(Event.prototype, "getParameter");

		await nextUIUpdate();

		oMultiComboBox.setSelectedItems([oItem]);

		oHandleTokenFocusStub.withArgs("type", "focusin");
		oHandleTokenFocusStub.withArgs("target", oMultiComboBox.getAggregation("tokenizer").getTokens()[0].getDomRef());

		oMultiComboBox.onfocusin(oFakeEvent);

		assert.notOk(oMultiComboBox.$().hasClass("sapMMultiComboBoxFocus"), "The MCB must not have the css sapMMultiComboBoxFocus");

		//cleanup
		oFakeEvent.destroy();
		oMultiComboBox.destroy();
	});

	QUnit.test("Invalidating MCB should not set the focus to it when the focus has been outside it", async function(assert) {
		this.clock = sinon.useFakeTimers();
		// system under test
		this.stub(Device, "system").value({
			desktop: true,
			phone: false,
			tablet: true
		});

		var oButton = new Button({
			press: function() {
				oMultiComboBox.invalidate();
			}
		}).placeAt("MultiComboBoxContent"),
			oMultiComboBox = new MultiComboBox({
				items: [
					new Item({
						text: "Example"
					})
				]
			}).placeAt("MultiComboBoxContent");

		await nextUIUpdate(this.clock);

		oButton.focus();
		// we need to render the list once
		oMultiComboBox.open();
		this.clock.tick(500);
		oMultiComboBox.close();
		this.clock.tick(500);

		oButton.firePress();
		this.clock.tick(500);

		// assert
		assert.ok(document.activeElement === oButton.getFocusDomRef(), "Focus should stay on the button");

		oMultiComboBox.destroy();
		oButton.destroy();
	});

	QUnit.test("Tokenizer should scroll to end when focus is outside MCB", async function(assert) {
		this.clock = sinon.useFakeTimers();
		var oFakeEvent = new Event(),
			oMultiComboBox = new MultiComboBox({
				items: [
					new Item({
						text: "Example"
					})
				]
			}).placeAt("MultiComboBoxContent");

		var oSpy = this.spy(oMultiComboBox.getAggregation("tokenizer"), "scrollToEnd");
		var oHandleFocusleaveStub = this.stub(Event.prototype, "getParameter");

		await nextUIUpdate(this.clock);

		oHandleFocusleaveStub.withArgs("relatedControlId").returns(null);
		oMultiComboBox.onsapfocusleave(oFakeEvent);

		// assert
		this.clock.tick();
		assert.ok(oSpy.called, "Tokenizer's scrollToEnd should be called when focus is outside MCB");

		// cleanup
		oSpy.restore();
		oMultiComboBox.destroy();
	});

	QUnit.test("Change event should be called on focusleave", async function (assert) {
		var oMultiComboBox = new MultiComboBox({ value: "A" }).placeAt("MultiComboBoxContent"),
			oStub = this.stub(oMultiComboBox, "fireChangeEvent"),
			oFakeEvent = {};

		// act
		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate();

		//act
		oMultiComboBox.onsapfocusleave(oFakeEvent);

		// assert
		assert.ok(oStub.called, "change should be called");
		assert.ok(oStub.calledWith("", { value: "A" }), "change should be called with empty values");

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("Change event should not be called if the old value does not differ from the current one", async function (assert) {
		var oMultiComboBox = new MultiComboBox().placeAt("MultiComboBoxContent"),
			oStub = this.stub(oMultiComboBox, "fireChangeEvent"),
			oFakeEvent = {};

		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate();

		// act
		oMultiComboBox.onsapfocusleave(oFakeEvent);

		// assert
		assert.notOk(oStub.called, "change should be called");

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test('Endless focus loop should not be triggered when Dialog is opened on mobile', async function(assert) {
		this.clock = sinon.useFakeTimers();
		// system under test
		this.stub(Device, "system").value({
			desktop: false,
			phone: true,
			tablet: false
		});
		var oMultiComboBox = new MultiComboBox().placeAt("MultiComboBoxContent"),
			oStub = this.stub(MultiComboBox.prototype, "onfocusin");

		await nextUIUpdate(this.clock);

		oMultiComboBox.open();
		this.clock.tick(500);

		assert.ok(!oStub.called, "onfocusin of the MCB should not be triggered after dialog is opened");

		oMultiComboBox.close();
		this.clock.tick(500);

		oMultiComboBox.destroy();
	});

	QUnit.test('Endless focus loop should not be triggered when token is deleted on phone', async function(assert) {
		this.clock = sinon.useFakeTimers();
		// system under test
		this.stub(Device, "system").value({
			desktop: false,
			phone: true,
			tablet: false
		});
		var oItem = new Item({ text: "test" }),
			oFakeEvent = new Event(),
			oMultiComboBox = new MultiComboBox({
				items: [oItem]
			}).placeAt("MultiComboBoxContent"),
			oSpy = this.spy(MultiComboBox.prototype, "focus"),
			oHandleTokensStub = this.stub(Event.prototype, "getParameter");

		oMultiComboBox.setSelectedItems([oItem]);
		await nextUIUpdate(this.clock);

		oHandleTokensStub.withArgs("tokens").returns([]);
		oMultiComboBox._handleTokenDelete(oFakeEvent);
		this.clock.tick(nPopoverAnimationTick);

		assert.ok(!oSpy.called, "onfocusin of the MCB should not be triggered after a token is deleted");

		oFakeEvent.destroy();
		oSpy.restore();
		oMultiComboBox.destroy();
	});

	QUnit.test("Focus should be set to the first item of the list if no item is selected", async function(assert) {
		this.clock = sinon.useFakeTimers();
		// arrange
		var oItem = new Item(),
			oMultiComboBox = new MultiComboBox({
				items: [ oItem ]
			}),
			oFakeEvent = {
				preventDefault: function () {},
				setMarked: function () {},
				keyCode: 111 // dommy code
			};
		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate(this.clock);

		// act
		oMultiComboBox.onsapshow(oFakeEvent);
		this.clock.tick(500);

		// assert
		assert.strictEqual(oMultiComboBox._getList().getItemNavigation().iSelectedIndex, 0, "Initial index should be 0");

		//delete
		oMultiComboBox.destroy();
	});

	QUnit.test("Focus should be set to the first selected item if there are any selected", async function(assert) {
		this.clock = sinon.useFakeTimers();
		// arrange
		var oItem = new Item(),
			oMultiComboBox = new MultiComboBox({
				items: [ new Item(), oItem ],
				selectedItems: [ oItem ]
			}),
			oFakeEvent = {
				preventDefault: function () {},
				setMarked: function () {},
				keyCode: 111 // dommy code
			};
		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate(this.clock);

		// act
		oMultiComboBox.onsapshow(oFakeEvent);
		this.clock.tick(500);

		// assert
		assert.strictEqual(oMultiComboBox._getList().getItemNavigation().iSelectedIndex, 1, "Initial index should be 1");

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("Focus should be set to the item for which a token have been focused", async function(assert) {
		this.clock = sinon.useFakeTimers();
		var oItem1 = new Item( { text: "1" }),
			oItem2 = new Item( { text: "2" }),
			oMultiComboBox = new MultiComboBox({
				items: [ new Item({ text: "3" }), oItem1,  oItem2],
				selectedItems: [ oItem1, oItem2 ]
			}),
			oFakeEvent = {
				preventDefault: function () {},
				setMarked: function () {},
				keyCode: 111 // dommy code
			};
		oMultiComboBox.syncPickerContent();
		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate(this.clock);

		oMultiComboBox.getAggregation("tokenizer").getTokens()[1].focus();
		this.clock.tick(1000);

		// act
		oMultiComboBox.onsapshow(oFakeEvent);
		this.clock.tick(1000);

		// assert
		assert.strictEqual(oMultiComboBox._getList().getItemNavigation().iSelectedIndex, 2, "Initial index should be 2");

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("focusin triggers tokenizer scrolling only once", async function(assert) {
		this.clock = sinon.useFakeTimers();
		// arrange
		var done = assert.async(),
			oMultiComboBox = new MultiComboBox({
				selectedKeys: ["Item1", "Item2"],
				items: [
					new Item({key: "Item1", text: "Item1"}),
					new Item({key: "Item2", text: "Item2"})
				]
			}), oTokenizer = oMultiComboBox.getAggregation("tokenizer"),
				oSpy;

		oMultiComboBox.syncPickerContent();
		oMultiComboBox.placeAt("MultiComboBoxContent");
		this.clock.tick(500);

		await nextUIUpdate(this.clock);

		oSpy = this.spy(oTokenizer, "scrollToEnd");
		oTokenizer.getTokens()[0].focus();
		await nextUIUpdate(this.clock);

		// assert
		setTimeout(function(){
			assert.strictEqual(oSpy.callCount, 0, "Tokenizer's scrollToEnd should not be called.");
			done();
			oSpy.restore();
			oMultiComboBox.destroy();
			runAllTimersAndRestore(this.clock);
		}.bind(this), 0);

		this.clock.tick();
	});

	QUnit.test("After pressing arrow down/up and expanding the dropdown, the focused item should be the selected item in the input", async function(assert) {
		this.clock = sinon.useFakeTimers();
		var aItems = [
			new Item({key: "Item1", text: "Item1"}),
			new Item({key: "Item2", text: "Item2"}),
			new Item({key: "Item3", text: "Item3"}),
			new Item({key: "Item4", text: "Item4"})
		];

		// Arrange
		var oMultiComboBox = new MultiComboBox({items: aItems}).placeAt("MultiComboBoxContent");
		await nextUIUpdate(this.clock);

		qutils.triggerKeydown(oMultiComboBox.getDomRef(), KeyCodes.ARROW_DOWN);
		qutils.triggerKeydown(oMultiComboBox.getDomRef(), KeyCodes.ARROW_DOWN);
		qutils.triggerKeydown(oMultiComboBox.getDomRef(), KeyCodes.ARROW_DOWN);
		qutils.triggerKeydown(oMultiComboBox.getDomRef(), KeyCodes.ARROW_UP);
		this.clock.tick(100);

		// Act
		qutils.triggerKeydown(oMultiComboBox.getDomRef(), KeyCodes.F4);
		this.clock.tick(100);

		assert.strictEqual(oMultiComboBox._getFocusedItem(), aItems[1], "The second item should be focused");

		// clean
		oMultiComboBox.destroy();
	});

	QUnit.test("Picker icon user interaction tests", async function(assert) {
		this.clock = sinon.useFakeTimers();
		var aItems = [
			new Item({key: "Item1", text: "Item1"}),
			new Item({key: "Item2", text: "Item2"}),
			new Item({key: "Item3", text: "Item3"}),
			new Item({key: "Item4", text: "Item4"})
		];

		// Arrange
		var oMultiComboBox = new MultiComboBox({items: aItems}).placeAt("MultiComboBoxContent");
		await nextUIUpdate(this.clock);

		qutils.triggerKeydown(oMultiComboBox.getDomRef(), KeyCodes.ARROW_DOWN);
		qutils.triggerKeydown(oMultiComboBox.getDomRef(), KeyCodes.ARROW_DOWN);
		qutils.triggerKeydown(oMultiComboBox.getDomRef(), KeyCodes.ARROW_DOWN);
		qutils.triggerKeydown(oMultiComboBox.getDomRef(), KeyCodes.ARROW_UP);
		this.clock.tick(300);

		// Act
		oMultiComboBox._handlePopupOpenAndItemsLoad(true); // Icon press
		this.clock.tick(300);

		assert.strictEqual(oMultiComboBox._getFocusedItem(), aItems[1], "The second item should be focused on icon press");

		// Act
		oMultiComboBox._bShouldClosePicker = true; // Simulate opened picker
		oMultiComboBox._handlePopupOpenAndItemsLoad(true); // Icon press
		this.clock.tick(300);

		assert.strictEqual(oMultiComboBox.getValue(), "", "The value should be cleared when closing the picker with icon press");

		// clean
		oMultiComboBox.destroy();
	});

	QUnit.test("Opening picker via dropdown icon on mobile devices should not throw error", async function(assert) {
		this.clock = sinon.useFakeTimers();
		// Arrange
		this.stub(Device, "system").value({
			desktop: false,
			phone: true,
			tablet: false
		});

		var aItems = [new Item({key: "Item1", text: "Item1"})],
			oEventMock = {
				preventDefault: function () {},
				setMarked: function() {
					return false;
				}
			},
			oMultiComboBox = new MultiComboBox({items: aItems}).placeAt("MultiComboBoxContent");

		await nextUIUpdate(this.clock);
		oMultiComboBox.onsapshow(oEventMock);
		this.clock.tick(300);

		// Assert
		assert.ok(true, "The picker is opening without throwing an error on mobile devices");

		// Act
		oMultiComboBox.close();
		this.clock.tick(300);

		// Clean
		oMultiComboBox.destroy();
	});

	QUnit.test("Focus should be on the selected visible item in the list", async function(assert) {
		this.clock = sinon.useFakeTimers();
		// Arrange
		var aItems = [
			new Item({key: "Text1", text: "Text1"}),
			new Item({key: "Text2", text: "Text2"}),
			new Item({key: "Text3", text: "Text3"}),
			new Item({key: "Text4", text: "Text4"}),

			new Item({key: "Item1", text: "Item1"}),
			new Item({key: "Item2", text: "Item2"}),
			new Item({key: "Item3", text: "Item3"}),
			new Item({key: "Item4", text: "Item4"})
		];
		var oMultiComboBox = new MultiComboBox({items: aItems}).placeAt("MultiComboBoxContent");
		var oItemToBeFocused, aListItems;

		await nextUIUpdate(this.clock);

		// Act
		oMultiComboBox.getFocusDomRef().value = "I";
		qutils.triggerEvent("input", oMultiComboBox.getFocusDomRef());

		aListItems = oMultiComboBox._getList().getItems();
		aListItems[4].getDomRef().focus(); // Focus random item just so that the focus is not in the input for the check in onAfterRenderingList();
		oItemToBeFocused = aListItems[7].getDomRef();

		oMultiComboBox._iFocusedIndex = 3;
		oMultiComboBox.onAfterRenderingList();
		this.clock.tick(1000);

		// Assert
		assert.strictEqual(document.activeElement, oItemToBeFocused, "The 4th visible item is focused");

		// Clean
		oMultiComboBox.destroy();
	});

	QUnit.test("Focus should be restored to tokenizer after invalidation", async function(assert) {
		this.clock = sinon.useFakeTimers();
		var aTokens;
		var oMCB = new MultiComboBox({
			selectionChange: function (oEvent) {
				oEvent.getSource().invalidate();
			},
			items: [
				new Item({ text: "One", key: "1" }),
				new Item({ text: "two", key: "2" })
			],
			selectedKeys: ["1", "2"]
		}).placeAt("MultiComboBoxContent");

		await nextUIUpdate(this.clock);
		this.clock.tick(10);

		aTokens = oMCB.getAggregation("tokenizer").getTokens();

		aTokens[1].focus();
		await nextUIUpdate(this.clock);
		this.clock.tick(10);

		qutils.triggerKeydown(aTokens[1].getDomRef(), KeyCodes.BACKSPACE);
		await nextUIUpdate(this.clock);
		this.clock.tick(10);

		// store tokens again as list is recreated
		aTokens = oMCB.getAggregation("tokenizer").getTokens();

		assert.strictEqual(aTokens[0].getDomRef(), document.activeElement, "Focus is restored to the first token");

		oMCB.destroy();
	});

	QUnit.test("Focus should not go to list after token deletion", async function(assert) {
		this.clock = sinon.useFakeTimers();
		var oMCB = new MultiComboBox({
			selectionChange: function (oEvent) {
				oEvent.getSource().invalidate();
			},
			items: [
				new Item({ text: "Item 1", key: "1" }),
				new Item({ text: "Item 2", key: "2" }),
				new Item({ text: "Item 3", key: "3" })
			],
			selectedKeys: ["1", "2", "3"]
		}).placeAt("MultiComboBoxContent");

		await nextUIUpdate(this.clock);
		this.clock.tick(10);

		oMCB.open();
		await nextUIUpdate(this.clock);
		this.clock.tick(300);

		var triggerBackspaceOnLastToken = async function () {
			var aTokens = oMCB.getAggregation("tokenizer").getTokens();

			aTokens[aTokens.length - 1].focus();
			await nextUIUpdate(this.clock);
			this.clock.tick(10);

			qutils.triggerKeydown(aTokens[aTokens.length - 1].getDomRef(), KeyCodes.BACKSPACE);
			await nextUIUpdate(this.clock);
			this.clock.tick(10);
		}.bind(this);

		await triggerBackspaceOnLastToken();
		await nextUIUpdate(this.clock);

		// arrange
		oMCB._iFocusedIndex = 1;

		await triggerBackspaceOnLastToken();
		await nextUIUpdate(this.clock);

		// arrange
		oMCB._iFocusedIndex = 0;

		assert.strictEqual(document.activeElement, oMCB.getAggregation("tokenizer").getTokens()[0].getDomRef(), "First token is focused");

		oMCB.destroy();
	});

	QUnit.module("Accessibility", {
		afterEach: function () {
			runAllTimersAndRestore(this.clock);
		}
	});

	QUnit.test("getAccessibilityInfo", async function(assert) {
		this.clock = sinon.useFakeTimers();
		var oMultiComboBox = new MultiComboBox({
			value: "Value",
			tooltip: "Tooltip",
			placeholder: "Placeholder",
			items: [
				new SeparatorItem({text: "Group Header"}),
				new Item({key: "Item1", text: "Item1"}),
				new Item({key: "Item2", text: "Item2"}),
				new Item({key: "Item3", text: "Item3"})
			]
		});

		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate(this.clock);

		assert.ok(!!oMultiComboBox.getAccessibilityInfo, "MultiComboBox has a getAccessibilityInfo function");
		var oInfo = oMultiComboBox.getAccessibilityInfo();
		assert.ok(!!oInfo, "getAccessibilityInfo returns a info object");
		assert.strictEqual(oInfo.role, oMultiComboBox.getRenderer().getAriaRole(), "AriaRole");
		assert.strictEqual(oInfo.type, oResourceBundle.getText("ACC_CTR_TYPE_MULTICOMBO"), "Type");
		assert.strictEqual(oMultiComboBox.getFocusDomRef().getAttribute("aria-roledescription"), oResourceBundle.getText("MULTICOMBOBOX_ARIA_ROLE_DESCRIPTION"), "aria-roledescription attribute is rendered correctly in the DOM");
		assert.strictEqual(oInfo.description, "Value", "Description");
		assert.strictEqual(oInfo.focusable, true, "Focusable");
		assert.strictEqual(oInfo.enabled, true, "Enabled");
		assert.strictEqual(oInfo.editable, true, "Editable");
		oMultiComboBox.setValue("");
		oMultiComboBox.setEnabled(false);
		oInfo = oMultiComboBox.getAccessibilityInfo();
		assert.strictEqual(oInfo.description, oResourceBundle.getText("INPUTBASE_VALUE_EMPTY"), "Description - Empty as there are no tokens and no value");
		assert.strictEqual(oInfo.focusable, false, "Focusable");
		assert.strictEqual(oInfo.enabled, false, "Enabled");
		assert.strictEqual(oInfo.editable, false, "Editable");
		oMultiComboBox.setEnabled(true);
		oMultiComboBox.setEditable(false);
		oInfo = oMultiComboBox.getAccessibilityInfo();
		assert.strictEqual(oInfo.focusable, true, "Focusable");
		assert.strictEqual(oInfo.enabled, true, "Enabled");
		assert.strictEqual(oInfo.editable, false, "Editable");
		oMultiComboBox.setEditable(true);
		oMultiComboBox.setSelectedKeys(["Item1", "Item2"]);
		oInfo = oMultiComboBox.getAccessibilityInfo();
		assert.strictEqual(oInfo.description, "Item1 Item2", "Description");

		oMultiComboBox.open();
		this.clock.tick(10);

		var oList = oMultiComboBox._getList();
		assert.ok(oList, "List control available");
		assert.strictEqual(oList.$("listUl").attr("role"), "listbox", "role='listbox' applied to the list");
		assert.strictEqual(oList.getItems()[0].$().attr("role"), "group", "role='group' applied to the group header");
		assert.strictEqual(oList.getItems()[1].$().attr("role"), "option", "role='option' applied to the items");

		oMultiComboBox.close();
		oMultiComboBox.destroy();
	});

	QUnit.test("aria-keyshortcuts attribute", async function(assert) {
		// Arrange
		this.clock = sinon.useFakeTimers();
		var oItem0, oItem1, oItem2, oItem3, sKeyShortcut,
			oMultiComboBox = new MultiComboBox({
				items: [
					oItem0 = new Item({key: "Item0", text: "Long text"}),
					oItem1 = new Item({key: "Item1", text: "Very long text"}),
					oItem2 = new Item({key: "Item2", text: "Very, very long text"}),
					oItem3 = new Item({key: "Item3", text: "Very, very, very long text"})
				]
			});

		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate(this.clock);

		// Act
		oMultiComboBox.setSelectedItems([oItem0, oItem1, oItem2, oItem3]);
		await nextUIUpdate(this.clock);

		oMultiComboBox.setEditable(false);
		oMultiComboBox.setWidth("50px");
		await nextUIUpdate(this.clock);
		this.clock.tick(300);

		sKeyShortcut = oMultiComboBox.getFocusDomRef().getAttribute('aria-keyshortcuts');
		await nextUIUpdate(this.clock);

		// Assert
		assert.strictEqual(sKeyShortcut, "Enter", "'aria-keyshortcuts' attribute should be presented with the correct value");

		// Act
		oMultiComboBox.setEnabled(false);
		await nextUIUpdate(this.clock);
		sKeyShortcut = oMultiComboBox.getFocusDomRef().getAttribute('aria-keyshortcuts');

		//Assert
		assert.notOk(sKeyShortcut, "'aria-keyshortcuts' attribute should not be presented.");

		// Act
		oMultiComboBox.setEnabled(true);
		oMultiComboBox.setEditable(true);
		await nextUIUpdate(this.clock);
		sKeyShortcut = oMultiComboBox.getFocusDomRef().getAttribute('aria-keyshortcuts');

		//Assert
		assert.notOk(sKeyShortcut, "'aria-keyshortcuts' attribute should not be presented.");
		oMultiComboBox.destroy();
	});

	QUnit.test("aria-controls attribute should be set when the picker is open for the first time", async function (assert) {
		//arrange
		var oMultiComboBox = new MultiComboBox();

		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate();

		// assert
		assert.notOk(oMultiComboBox.getFocusDomRef().getAttribute("aria-controls"), 'The "aria-controls" should not be set before picker creation');

		//act
		oMultiComboBox.open();
		await nextUIUpdate();

		// assert
		assert.strictEqual(oMultiComboBox.getFocusDomRef().getAttribute("aria-controls"), oMultiComboBox.getPicker().getId(), 'The "aria-controls" should be');

		//clean up
		oMultiComboBox.destroy();
	});

	QUnit.test("Tokens information should be read out", async function(assert) {
		this.clock = sinon.useFakeTimers();
		var oItem1 = new Item({key: "Item1", text: "Item1"}),
			oItem2 = new Item({key: "Item2", text: "Item2"}),
			oMultiComboBox = new MultiComboBox({
				items: [oItem1, oItem2]
			}),
			sInvisibleTextId = oMultiComboBox.getAggregation("tokenizer").getTokensInfoId(),
			oInvisibleText = Element.getElementById(sInvisibleTextId);

		oMultiComboBox.placeAt("MultiComboBoxContent");

		// assert
		assert.strictEqual(oInvisibleText.getText(), oResourceBundle.getText("TOKENIZER_ARIA_NO_TOKENS"), "'MultiComboBox no tokens' text is set.");

		// act
		oMultiComboBox.setSelectedKeys(["Item1"]);
		await nextUIUpdate(this.clock);

		// assert
		assert.strictEqual(oInvisibleText.getText(), oResourceBundle.getText("TOKENIZER_ARIA_CONTAIN_ONE_TOKEN"), "'MultiComboBox contains 1 token' text is set.");

		// act
		oMultiComboBox.setSelectedKeys(["Item1", "Item2"]);

		await nextUIUpdate(this.clock);

		// assert
		assert.strictEqual(oInvisibleText.getText(), oResourceBundle.getText("TOKENIZER_ARIA_CONTAIN_SEVERAL_TOKENS", 2), "'MultiComboBox contains N tokens' text is set.");

		//arrange
		var sInvisibleTextId1 = InvisibleText.getStaticId("sap.m", "MULTICOMBOBOX_OPEN_NMORE_POPOVER"),
			sAriaDescribedBy = sInvisibleTextId + " " + sInvisibleTextId1;

		// act
		oMultiComboBox.setEditable(false);
		oMultiComboBox.setWidth("50px");

		await nextUIUpdate(this.clock);
		this.clock.tick(nPopoverAnimationTick);

		//assert
		assert.ok(oMultiComboBox.getFocusDomRef().getAttribute('aria-describedby').indexOf(sInvisibleTextId1) !== -1, "Input has aria-describedby attribute to indicate Enter press possibility");
		assert.strictEqual(oMultiComboBox.getFocusDomRef().getAttribute('aria-describedby'), sAriaDescribedBy, "Both references are added to the aria-describedby attribute");

		// destroy
		oItem1.destroy();
		oItem2.destroy();
		oMultiComboBox.destroy();
	});

	QUnit.test("MultiComboBox aria-describedby attribute", async function(assert) {
		var oItem1 = new Item({key: "Item1", text: "Item1"});
		var oMultiComboBox = new MultiComboBox({
			valueState: "Warning",
			items: [oItem1],
			selectedItems: [oItem1]
		});

		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate();

		var sValueStateAccNodeId = oMultiComboBox.getValueStateMessageId() + "-sr";
		var sInvisibleTextId = oMultiComboBox.getAggregation("tokenizer").getTokensInfoId();
		var sAriaDescribedBy = sValueStateAccNodeId + " " + sInvisibleTextId;

		assert.strictEqual(oMultiComboBox.getFocusDomRef().getAttribute('aria-describedby'), sAriaDescribedBy, "Aria-describedby attribute value is correct");

		oMultiComboBox.destroy();
	});

	QUnit.test("MultiComboBox with accessibility=false", async function(assert) {
		var oMultiComboBox = new MultiComboBox();
		this.stub(ControlBehavior, "isAccessibilityEnabled").returns(false);

		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate();

		assert.ok(!!oMultiComboBox.getDomRef(), "The MultiComboBox should be rendered, when accessibility is off.");

		oMultiComboBox.destroy();
	});

	QUnit.test("aria-hidden attribute of the MultiComboBox dropdown icon must be set to true", async function (assert) {
		var oMultiComboBox = new MultiComboBox({
			id: "simple-mcbox"
		});

		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate();

		var bAriaHidden = oMultiComboBox.getDomRef().querySelector(".sapMInputBaseIconContainer").getAttribute("aria-hidden");

		assert.strictEqual(bAriaHidden, "true", "aria-hidden is set to true");

		oMultiComboBox.destroy();
	});


	QUnit.module("Keyboard handling", {
		beforeEach: async function(){
			this.oFirstItem = new Item({key: "Item1", text: "Item1"});
			this.oLastItem = new Item({key: "Item3", text: "Item3"});
			this.oMultiComboBox = new MultiComboBox({
				items: [
					this.oFirstItem,
					new Item({key: "Item2", text: "Item2"}),
					this.oLastItem
				]
			});
			this.oTokenizer = this.oMultiComboBox.getAggregation("tokenizer");
			this.oMultiComboBox.placeAt("MultiComboBoxContent");
			await nextUIUpdate();
		}, afterEach: function() {
			this.oMultiComboBox.destroy();
			runAllTimersAndRestore(this.clock);
		}
	});

	QUnit.test("_getNextTraversalItem should return the right traversal item", async function (assert) {
		this.oMultiComboBox.syncPickerContent();

		var oNextItem = this.oMultiComboBox._getNextTraversalItem(),
				oPreviousItem = this.oMultiComboBox._getPreviousTraversalItem(),
				aItems = this.oMultiComboBox.getItems();

		// Assert
		assert.strictEqual(oNextItem.getText(), 'Item1', "Should return the first item");
		assert.strictEqual(oPreviousItem.getText(), 'Item3', "Should return the last item");

		// Act
		this.oMultiComboBox.setSelectedItems([aItems[0], aItems[2]]); // The first and last item
		await nextUIUpdate();

		// Assert
		oNextItem = this.oMultiComboBox._getNextTraversalItem();
		oPreviousItem = this.oMultiComboBox._getPreviousTraversalItem();
		assert.ok(oNextItem.getText() !== 'Item1', "Should not return the first item anymore as it's selected already");
		assert.ok(oPreviousItem.getText() !== 'Item3', "Should not return the last item anymore as it's selected already");
	});

	QUnit.test("_getNextTraversalItem should return the group header item when not opened", async function (assert) {
		// Arrange
		var oGroupHeaderItem = new SeparatorItem({text: "Group Header"}),
			oNextItem, oPreviousItem, aItems;

		this.oMultiComboBox.insertItem(oGroupHeaderItem, 0);
		this.oMultiComboBox.syncPickerContent();
		await nextUIUpdate();

		oNextItem = this.oMultiComboBox._getNextTraversalItem();
		oPreviousItem = this.oMultiComboBox._getPreviousTraversalItem();
		aItems = this.oMultiComboBox.getItems();

		// Assert
		assert.strictEqual(oNextItem.getText(), 'Item1', "Should return the first item");
		assert.strictEqual(oPreviousItem.getText(), 'Item3', "Should return the last item");

		// Act
		this.oMultiComboBox.setSelectedItems([aItems[1], aItems[3]]); // The first and last item
		await nextUIUpdate();

		// Assert
		oNextItem = this.oMultiComboBox._getNextTraversalItem();
		oPreviousItem = this.oMultiComboBox._getPreviousTraversalItem();
		assert.ok(oNextItem.getText() !== 'Item1', "Should not return the first item anymore as it's selected already");
		assert.ok(oPreviousItem.getText() !== 'Item3', "Should not return the last item anymore as it's selected already");
	});

	QUnit.test("_getNextTraversalItem should return the first non group item when opened", async function (assert) {
		// Arrange
		var oGroupHeaderItem = new SeparatorItem({text: "Group Header"}),
			oNextItem, oPreviousItem, aItems;

		this.oMultiComboBox.insertItem(oGroupHeaderItem, 0);
		this.oMultiComboBox.open();
		await nextUIUpdate();

		oNextItem = this.oMultiComboBox._getNextTraversalItem();
		oPreviousItem = this.oMultiComboBox._getPreviousTraversalItem();
		aItems = this.oMultiComboBox.getItems();

		// Assert
		assert.strictEqual(oNextItem.getText(), 'Item1', "Should return the first item");
		assert.strictEqual(oPreviousItem.getText(), 'Item3', "Should return the last item");

		// Act
		this.oMultiComboBox.setSelectedItems([aItems[1], aItems[3]]); // The first and last item
		await nextUIUpdate();

		// Assert
		oNextItem = this.oMultiComboBox._getNextTraversalItem();
		oPreviousItem = this.oMultiComboBox._getPreviousTraversalItem();
		assert.ok(oNextItem.getText() !== 'Item1', "Should not return the first item anymore as it's selected already");
		assert.ok(oNextItem.getText() === 'Item2', "Should return the group header item's text");
		assert.ok(oPreviousItem.getText() !== 'Item3', "Should not return the last item anymore as it's selected already");
	});

	QUnit.test("_getNextTraversalItem/_getPreviousTraversalItem should not exclude items with no values", async function (assert) {
		// Arrange
		var oItem = new Item({text: ""}),
			oNextItem, oPreviousItem;

		this.oMultiComboBox.insertItem(oItem, 0);
		this.oMultiComboBox.addItem(oItem);
		this.oMultiComboBox.syncPickerContent();
		await nextUIUpdate();

		oNextItem = this.oMultiComboBox._getNextTraversalItem();
		oPreviousItem = this.oMultiComboBox._getPreviousTraversalItem();

		// Assert
		assert.ok(oNextItem, "Should return an item");
		assert.ok(oPreviousItem, "Should return the an item");
	});

	QUnit.test("onsapend should focus the input if the tokenizer has forwarded the focus", function (assert) {
		this.clock = sinon.useFakeTimers();
		var oEvent = {isMarked: function(sKey){ if (sKey === "forwardFocusToParent") { return true;}}};

		this.oMultiComboBox.onsapend(oEvent);
		this.clock.tick();

		assert.strictEqual(this.oMultiComboBox.getFocusDomRef(), document.activeElement, "The input is focused");
	});

	QUnit.test("onsaphome should trigger Tokenizer's onsaphome", async function (assert) {
		this.clock = sinon.useFakeTimers();
		var oToken,
			oSapHomeSpy = this.spy(Tokenizer.prototype, "onsaphome"),
			oItem = new Item({text: "text123", key: "key123"});

		// setup
		this.oMultiComboBox.addItem(oItem);
		this.oMultiComboBox.setSelectedItems([oItem]);

		this.oMultiComboBox.setValue("text");

		/**
		 * Invalidate the UIArea to trigger
		 * the rerendering required by the test
		 * in order for the focusin event to be fired.
		 *
		 * Otherwise the control is not rerendered,
		 * focus is never lost and the focusin is never
		 * fired after migration to semantic rendering.
		 */
		this.oMultiComboBox.getParent().invalidate();

		await nextUIUpdate(this.clock);

		// act
		oToken = this.oMultiComboBox.getAggregation("tokenizer").getTokens()[0];
		qutils.triggerKeydown(this.oMultiComboBox.getDomRef(), KeyCodes.HOME);
		this.clock.tick();

		qutils.triggerKeydown(this.oMultiComboBox.getDomRef(), KeyCodes.HOME);
		this.clock.tick();

		// assert
		assert.strictEqual(oToken.getDomRef(), document.activeElement, "The first token is selected");
		assert.ok(oSapHomeSpy.called, "onsaphome of the Tokenizer should be called");
		assert.ok(oSapHomeSpy.calledOn(this.oTokenizer), "onsapend should be called on the internal Tokenizer");
	});

	QUnit.test("onsapdown should update input's value with first item's text", function (assert) {
		this.clock = sinon.useFakeTimers();
		qutils.triggerKeydown(this.oMultiComboBox.getDomRef(), KeyCodes.ARROW_DOWN);
		this.clock.tick(100);

		assert.strictEqual(this.oFirstItem.getText(), this.oMultiComboBox.getValue(), "Item's text should be the same as input's value");
	});

	QUnit.test("onsapdown should not skip items with no values", async function (assert) {
		this.clock = sinon.useFakeTimers();
		var oItem = new Item({text: ""});

		// setup
		this.oMultiComboBox.insertItem(oItem, 0);
		await nextUIUpdate(this.clock);

		qutils.triggerKeydown(this.oMultiComboBox.getDomRef(), KeyCodes.ARROW_DOWN);
		this.clock.tick(100);

		assert.notEqual(this.oFirstItem.getText(), this.oMultiComboBox.getValue(), "The first item should not be skipped, even though it has no value");
		assert.strictEqual(oItem, this.oMultiComboBox._oTraversalItem, "The traversal item should be set correctly");
		assert.strictEqual(this.oMultiComboBox.getValue(), "", "The item value should be set correctly as an input value");


		qutils.triggerKeydown(this.oMultiComboBox.getDomRef(), KeyCodes.ARROW_DOWN);
		this.clock.tick(100);

		assert.strictEqual(this.oFirstItem.getText(), this.oMultiComboBox.getValue(), "The second item value should be set as an input value");
	});

	QUnit.test("onsapup should not skip items with no values", async function (assert) {
		this.clock = sinon.useFakeTimers();
		var oItem = new Item({text: ""});

		// setup
		this.oMultiComboBox.addItem(oItem);
		await nextUIUpdate(this.clock);

		qutils.triggerKeydown(this.oMultiComboBox.getDomRef(), KeyCodes.ARROW_UP);
		this.clock.tick(100);

		assert.notEqual(this.oLastItem.getText(), this.oMultiComboBox.getValue(), "The last item should not be skipped, even though it has no value");
		assert.strictEqual(oItem, this.oMultiComboBox._oTraversalItem, "The traversal item should be set correctly");
		assert.strictEqual(this.oMultiComboBox.getValue(), "", "The item value should be set correctly as an input value");

		qutils.triggerKeydown(this.oMultiComboBox.getDomRef(), KeyCodes.ARROW_UP);
		this.clock.tick(100);

		assert.strictEqual(this.oLastItem.getText(), this.oMultiComboBox.getValue(), "The new item value should be set as an input value");
	});

	QUnit.test("onsapup should update input's value with previous selectable item's text", function (assert) {
		this.clock = sinon.useFakeTimers();
		qutils.triggerKeydown(this.oMultiComboBox.getDomRef(), KeyCodes.ARROW_DOWN);
		qutils.triggerKeydown(this.oMultiComboBox.getDomRef(), KeyCodes.ARROW_DOWN);
		this.clock.tick(100);

		qutils.triggerKeydown(this.oMultiComboBox.getDomRef(), KeyCodes.ARROW_UP);
		this.clock.tick(100);

		assert.strictEqual(this.oFirstItem.getText(), this.oMultiComboBox.getValue(), "Item's text should be the same as input's value");
	});

	QUnit.test("onsapup should update input's value with last item in the list, when input is empty", function (assert) {
		this.clock = sinon.useFakeTimers();
		qutils.triggerKeydown(this.oMultiComboBox.getDomRef(), KeyCodes.ARROW_UP);
		this.clock.tick(100);

		assert.strictEqual(this.oLastItem.getText(), this.oMultiComboBox.getValue(), "Item's text should be the same as input's value");
	});

	QUnit.test("onsapenter should not trigger invalidation if value is empty", function(assert) {
		// arrange
		var oFakeEvent = {
			setMarked: function() {}
		}, oSelectItemStub = this.stub(this.oMultiComboBox, "_selectItemByKey");

		// act
		this.oMultiComboBox.onsapenter(oFakeEvent);

		// assert
		assert.notOk(oSelectItemStub.called, "selection should not be called");
	});

	QUnit.test("onsapenter should deselect already selected item", async function(assert) {
		var oFirstListItem;
		var oMultiComboBox = new MultiComboBox({
			selectedKeys: ["GER"],
			items: [
				new Item({
					key: "GER",
					text: "Germany"
				})
			]
		});

		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate();

		oMultiComboBox.open();
		oFirstListItem = oMultiComboBox._getList().getItems()[0].getDomRef();

		qutils.triggerKeydown(oMultiComboBox.getDomRef(), KeyCodes.ARROW_DOWN);
		qutils.triggerKeydown(oFirstListItem, KeyCodes.ENTER);

		assert.strictEqual(oMultiComboBox.getSelectedKeys().length, 0, "The item is deselected");
		oMultiComboBox.destroy();
	});

	QUnit.test("onsaptabprevious should select the highlighted item", async function (assert) {
		// Assert
		assert.strictEqual(this.oMultiComboBox.getSelectedKeys().length, 0, "No items should be selected");

		// Act
		this.oMultiComboBox.open();
		this.oMultiComboBox.focus();
		this.oMultiComboBox.setValue("Item1");
		this.oMultiComboBox.onkeydown({});

		this.oMultiComboBox.onsaptabprevious();

		await nextUIUpdate();

		// Assert
		assert.strictEqual(this.oMultiComboBox.getSelectedKeys().length, 1, "The first item should be selected");
		assert.strictEqual(this.oMultiComboBox.getSelectedItems()[0].getText(), "Item1", "The first item should be selected");
	});

	QUnit.test("onsaptabnext on item from the list should close the picker", function (assert) {
		this.clock = sinon.useFakeTimers();
		// Arrange
		this.oMultiComboBox.open();
		this.clock.tick(300);

		var oPicker = this.oMultiComboBox.getPicker();
		var spy = this.spy(oPicker, "close");

		// Act
		qutils.triggerKeydown(this.oMultiComboBox._getList().getItems()[0].getDomRef(), KeyCodes.TAB);
		this.clock.tick(300);

		// Assert
		assert.strictEqual(spy.callCount, 1, "The picker should be closed once");
	});

	QUnit.test("onsaptabnext - multiple items starting with the user input", async function (assert) {
		this.clock = sinon.useFakeTimers();
		// Arrange
		var oMultiComboBox = new MultiComboBox({
			items: [
				new Item({
					text: "Item 1",
					key: "1"
				}),
				new Item({
					text: "Item 1 2",
					key: "2"
				}),
				new Item({
					text: "Item 3",
					key: "3"
				})
			]
		});
		var oSpy = this.spy(oMultiComboBox, "_selectItemByKey");

		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate(this.clock);
		this.clock.tick(300);

		// Act
		qutils.triggerKeydown(oMultiComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN);
		this.clock.tick(300);
		qutils.triggerKeydown(oMultiComboBox.getFocusDomRef(), KeyCodes.TAB);
		this.clock.tick(300);

		// Assert
		assert.strictEqual(oSpy.callCount, 1, "_selectItemByKey method should be called once");

		// Clean
		oSpy.restore();
		oMultiComboBox.destroy();
	});


	QUnit.test("Properly destroy tokens only when allowed", async function (assert) {
		// arrange
		var oToken, oTokenizer,oTokenSpy,
			oCoreItem = new Item({text: "My Item"}),
			oMultiComboBox = new MultiComboBox({
				items: [oCoreItem],
				selectedItems: [oCoreItem]
			}).placeAt("MultiComboBoxContent");
		await nextUIUpdate();

		oTokenizer = oMultiComboBox.getAggregation("tokenizer");
		oToken = oTokenizer.getTokens()[0];
		oTokenSpy = this.spy(oToken, "destroy");

		// Act
		oMultiComboBox.setEditable(false);
		oMultiComboBox._removeSelection([oToken]);
		await nextUIUpdate();

		// assert
		assert.notOk(oTokenSpy.calledOnce, "Token destroyed is omitted");
		assert.deepEqual(oTokenizer.getTokens(), [oToken], "The tokenizer should remain untouched");

		// Act
		oMultiComboBox.setEditable(true);
		oMultiComboBox.setEnabled(false);
		oMultiComboBox._removeSelection([oToken]);
		await nextUIUpdate();
		//
		// assert
		assert.notOk(oTokenSpy.calledOnce, "Token destroyed is omitted");
		assert.deepEqual(oTokenizer.getTokens(), [oToken], "The tokenizer should remain untouched");

		// Act
		oMultiComboBox.setEnabled(true);
		oCoreItem.setEnabled(false);
		oMultiComboBox._removeSelection([oToken]);
		await nextUIUpdate();

		// assert
		assert.notOk(oTokenSpy.calledOnce, "Token destroyed is omitted");
		assert.deepEqual(oTokenizer.getTokens(), [oToken], "The tokenizer should remain untouched");

		// Act
		oCoreItem.setEnabled(true);
		oToken.setEditable(false);
		oMultiComboBox._removeSelection([oToken]);
		await nextUIUpdate();

		// assert
		assert.notOk(oTokenSpy.calledOnce, "Token destroyed is omitted");
		assert.deepEqual(oTokenizer.getTokens(), [oToken], "The tokenizer should remain untouched");


		// Act
		oToken.setEditable(true);
		oMultiComboBox._removeSelection([oToken]);
		await nextUIUpdate();

		// assert
		assert.ok(oTokenSpy.calledOnce, "Token should be destroyed this time");
		assert.deepEqual(oTokenizer.getTokens(), [], "Tokens aggregation should be empty");
		//
		// Cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("Focus handling - ARROW keys", async function (assert) {
		this.clock = sinon.useFakeTimers();
		// Arrange
		var oGroupHeaderItem = new SeparatorItem({text: "Group Header"});
		this.oMultiComboBox.setShowSelectAll(true);
		this.oMultiComboBox.setValueState("Warning");
		this.oMultiComboBox.insertItem(oGroupHeaderItem, 0);
		this.oMultiComboBox.syncPickerContent();
		await nextUIUpdate(this.clock);

		this.oMultiComboBox.open();
		this.clock.tick();

		// Act
		qutils.triggerKeydown(this.oMultiComboBox.getDomRef(), KeyCodes.ARROW_DOWN);
		this.clock.tick(500);
		// Assert
		assert.strictEqual(this.oMultiComboBox._getSuggestionsPopover()._getValueStateHeader().getDomRef(), document.activeElement, "The value state message should be focused");

		// Act
		qutils.triggerKeydown(document.activeElement, KeyCodes.ARROW_DOWN);
		this.clock.tick(500);
		// Assert
		assert.strictEqual(this.oMultiComboBox.getSelectAllCheckbox().getFocusDomRef(), document.activeElement, "The select all checkbox should be focused");

		// Act
		qutils.triggerKeydown(document.activeElement, KeyCodes.ARROW_DOWN);
		this.clock.tick(500);
		// Assert
		assert.strictEqual(this.oMultiComboBox._getList().getItems()[0].getDomRef(), document.activeElement, "The first item in the list should be focused");

		// Act
		qutils.triggerKeydown(document.activeElement, KeyCodes.ARROW_UP);
		this.clock.tick(500);
		// Assert
		assert.strictEqual(this.oMultiComboBox.getSelectAllCheckbox().getFocusDomRef(), document.activeElement, "The select all checkbox should be focused");

		// Act
		qutils.triggerKeydown(document.activeElement, KeyCodes.ARROW_UP);
		this.clock.tick(500);
		// Assert
		assert.strictEqual(this.oMultiComboBox._getSuggestionsPopover()._getValueStateHeader().getDomRef(), document.activeElement, "The value state message should be focused");

		// Act
		qutils.triggerKeydown(document.activeElement, KeyCodes.ARROW_UP);
		this.clock.tick(500);
		// Assert
		assert.strictEqual(this.oMultiComboBox.getFocusDomRef(), document.activeElement, "The input field should be focused");

		this.oMultiComboBox.setValueState("None");
		await nextUIUpdate(this.clock);

		this.oMultiComboBox.open();
		this.clock.tick();

		// Act
		qutils.triggerKeydown(document.activeElement, KeyCodes.ARROW_DOWN);
		this.clock.tick(500);
		// Assert
		assert.strictEqual(this.oMultiComboBox.getSelectAllCheckbox().getFocusDomRef(), document.activeElement, "The select all checkbox should be focused");

		// Act
		qutils.triggerKeydown(document.activeElement, KeyCodes.ARROW_DOWN);
		this.clock.tick(500);
		// Assert
		assert.strictEqual(this.oMultiComboBox._getList().getItems()[0].getDomRef(), document.activeElement, "The first item in the list should be focused");

		// Act
		qutils.triggerKeydown(document.activeElement, KeyCodes.ARROW_UP);
		this.clock.tick(500);
		// Assert
		assert.strictEqual(this.oMultiComboBox.getSelectAllCheckbox().getFocusDomRef(), document.activeElement, "The select all checkbox should be focused");

		// Act
		qutils.triggerKeydown(document.activeElement, KeyCodes.ARROW_UP);
		this.clock.tick(500);
		// Assert
		assert.strictEqual(this.oMultiComboBox.getFocusDomRef(), document.activeElement, "The input field should be focused");
	});

	QUnit.test("Focus handling - HOME and END keys", async function (assert) {
		this.clock = sinon.useFakeTimers();
		// Arrange
		this.oMultiComboBox.setValueState("Warning");
		this.oMultiComboBox.setShowSelectAll(true);
		await nextUIUpdate(this.clock);

		this.oMultiComboBox.open();
		this.clock.tick();

		// Act
		qutils.triggerKeydown(this.oMultiComboBox.getDomRef(), KeyCodes.ARROW_DOWN);
		this.clock.tick(500);
		// Assert
		assert.strictEqual(this.oMultiComboBox._getSuggestionsPopover()._getValueStateHeader().getDomRef(), document.activeElement, "The value state message should be focused");

		// Act
		qutils.triggerKeydown(document.activeElement, KeyCodes.END);
		this.clock.tick(500);
		// Assert
		assert.strictEqual(this.oMultiComboBox._getList().getItems()[this.oMultiComboBox._getList().getItems().length - 1].getDomRef(), document.activeElement, "The last item in the list should be focused");

		// Act
		qutils.triggerKeydown(document.activeElement, KeyCodes.HOME);
		this.clock.tick(500);
		// Assert
		assert.strictEqual(this.oMultiComboBox._getSuggestionsPopover()._getValueStateHeader().getDomRef(), document.activeElement, "The value state message should be focused");

		// Act
		qutils.triggerKeydown(document.activeElement, KeyCodes.ARROW_DOWN);
		this.clock.tick(500);
		// Assert
		assert.strictEqual(this.oMultiComboBox.getSelectAllCheckbox().getFocusDomRef(), document.activeElement, "The select all checkbox should be focused");

		// Act
		qutils.triggerKeydown(document.activeElement, KeyCodes.HOME);
		this.clock.tick(500);
		// Assert
		assert.strictEqual(this.oMultiComboBox._getSuggestionsPopover()._getValueStateHeader().getDomRef(), document.activeElement, "The value state message should be focused");

		// Act
		qutils.triggerKeydown(document.activeElement, KeyCodes.ARROW_DOWN);
		this.clock.tick(500);
		qutils.triggerKeydown(document.activeElement, KeyCodes.END);
		this.clock.tick(500);
		// Assert
		assert.strictEqual(this.oMultiComboBox._getList().getItems()[this.oMultiComboBox._getList().getItems().length - 1].getDomRef(), document.activeElement, "The last item in the list should be focused");

		// Arrange
		this.oMultiComboBox.setValueState("None");
		await nextUIUpdate(this.clock);

		// Act
		qutils.triggerKeydown(document.activeElement, KeyCodes.HOME);
		this.clock.tick(500);
		// Assert
		assert.strictEqual(this.oMultiComboBox.getSelectAllCheckbox().getFocusDomRef(), document.activeElement, "The select all checkbox should be focused");
	});

	QUnit.module("Mobile mode (dialog)", {
		afterEach: function (){
			runAllTimersAndRestore(this.clock);
		}
	});

	QUnit.test("Prevent endless focus loop on mobile", async function(assert) {
		this.clock = sinon.useFakeTimers();
		//arrange
		this.stub(Device, "system").value({
			desktop: false,
			phone: true,
			tablet: false
		});
		var oMultiComboBox = new MultiComboBox( "multi", {
				items: [
					new Item({
						text: "Example"
					})
				]
			}).placeAt("MultiComboBoxContent"),
			oFakeEvent = new Event(),
			fnTapSpy = this.spy(oMultiComboBox, "onfocusin");

		oMultiComboBox.syncPickerContent();
		oFakeEvent.relatedControlId = oMultiComboBox.getPicker().getId();
		await nextUIUpdate(this.clock);

		//act
		qutils.triggerTouchEvent("tap", oMultiComboBox.getFocusDomRef(), {
			srcControl: oMultiComboBox,
			target: oMultiComboBox.getFocusDomRef()
		});
		this.clock.tick(500);
		oMultiComboBox.onsapfocusleave(oFakeEvent);

		//assert
		assert.strictEqual(fnTapSpy.callCount, 0 , "onsapfocusleave should not trigger onfocusin on mobile");

		//clean up
		oMultiComboBox.destroy();
	});

	QUnit.test("Tap on input field on mobile", async function(assert) {
		//arrange
		this.stub(Device, "system").value({
			desktop: false,
			phone: true,
			tablet: false
		});
		var oMultiComboBox = new MultiComboBox().placeAt("MultiComboBoxContent"),
			fnOpenSpy = this.spy(oMultiComboBox, "open");

		await nextUIUpdate();

		//act
		var oFakeEvent = {
			target: oMultiComboBox.getDomRef(),
			setMarked: function () { },
			srcControl: oMultiComboBox
		};

		oMultiComboBox.ontap(oFakeEvent);

		//assert
		assert.strictEqual(fnOpenSpy.callCount, 1 , "tap on the input field should open the picker dialog");

		//clean up
		oMultiComboBox.destroy();
	});

	QUnit.test("Pressing the OK button should tokenize the value if matching a suggestion", async function(assert) {
		this.clock = sinon.useFakeTimers();
		//arrange
		this.stub(Device, "system").value({
			desktop: false,
			phone: true,
			tablet: false
		});
		var oMultiComboBox = new MultiComboBox({
			items: [
				new Item({
					text: "Item 1",
					key: "1"
				}),
				new Item({
					text: "Item 2",
					key: "2"
				}),
				new Item({
					text: "Item 3",
					key: "3"
				})
			]
		}),
		oSuggestionPopover,
		aTokens;

		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate(this.clock);

		//act
		oMultiComboBox.open();
		this.clock.tick();

		qutils.triggerCharacterInput(oMultiComboBox.getPickerTextField().getFocusDomRef(), "I");
		qutils.triggerEvent("input", oMultiComboBox.getPickerTextField().getFocusDomRef());

		//arrange
		oSuggestionPopover = oMultiComboBox._getSuggestionsPopover();

		//act
		oSuggestionPopover._oPopover.getBeginButton().firePress();
		await nextUIUpdate(this.clock);

		//arrange
		aTokens = oMultiComboBox.getAggregation("tokenizer").getTokens();

		//assert
		assert.strictEqual(aTokens.length, 1 , "The dialog is closed and the value is tokenized");
		assert.strictEqual(aTokens[0].getText(), "Item 1" , "The correct item is selected");

		//clean up
		oMultiComboBox.close();
		this.clock.tick(nPopoverAnimationTick);
		oMultiComboBox.destroy();
	});

	QUnit.test("If_handleInputFocusOut oEvent is missing the logic should be fullfiled", function(assert) {
		//arrange
		this.stub(Device, "system").value({
			desktop: false,
			phone: true,
			tablet: false
		});
		var oEvent,
			oMultiComboBox = new MultiComboBox();
		this.stub(oMultiComboBox, "getPickerTextField").returns(new Input());

		oMultiComboBox._handleInputFocusOut(oEvent);

		//assert
		assert.strictEqual(oMultiComboBox.bOkButtonPressed, undefined , "The Ok button is undefined since there was no oEvent");
		assert.strictEqual(oMultiComboBox._bIsPasteEvent, null, "The logic of the function is fullfiled");

		//clean up
		oMultiComboBox.destroy();
	});

	QUnit.test("_filterSelectedItems()", async function(assert) {
		this.clock = sinon.useFakeTimers();
		this.stub(Device, "system").value({
			desktop: false,
			tablet: false,
			phone: true
		});

		var oFirstItem = new Item({key: "Item1", text: "Item1"}),
			oMultiComboBox = new MultiComboBox({
			items: [
				oFirstItem,
				new Item({key: "Item2", text: "Item2"}),
				new Item({key: "Item3", text: "Item3"})
			]
		});

		oMultiComboBox.syncPickerContent();

		var oSelectedButton = oMultiComboBox._getSuggestionsPopover().getFilterSelectedButton();
		var oSelectButtonTooltipText = oResourceBundle.getText("SHOW_SELECTED_BUTTON");

		assert.strictEqual(oSelectedButton.getTooltip(), oSelectButtonTooltipText, "Button's tooltip is set correctly");

		var oFakeEvent = {
			target: {
				value: "I"
			},
			setMarked: function () { },
			srcControl: oMultiComboBox
		};
		oMultiComboBox.setSelectedItems([oFirstItem]);

		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate(this.clock);

		oMultiComboBox.open();
		this.clock.tick(nPopoverAnimationTick);
		oSelectedButton.setPressed(true);
		oMultiComboBox._filterSelectedItems({"oSource": oSelectedButton});
		await nextUIUpdate(this.clock);
		this.clock.tick(nPopoverAnimationTick);

		assert.strictEqual(ListHelpers.getVisibleItems(oMultiComboBox.getItems()).length, 1, "Only one item should be visible");
		assert.strictEqual(oSelectedButton.getPressed(),true,"the SelectedButton is pressed");

		oMultiComboBox.fireChange({ value: "I" });
		oMultiComboBox.oninput(oFakeEvent);
		await nextUIUpdate(this.clock);

		assert.strictEqual(ListHelpers.getVisibleItems(oMultiComboBox.getItems()).length, 3, "All three items are visible");
		assert.strictEqual(oSelectedButton.getPressed(), false, "the SelectedButton is not pressed");
		this.clock.tick(nPopoverAnimationTick);

		oMultiComboBox.close();
		this.clock.tick(nPopoverAnimationTick);

		oMultiComboBox.destroy();
	});

	QUnit.test("_filterSelectedItems() with grouping", async function(assert) {
		this.clock = sinon.useFakeTimers();
		this.stub(Device, "system").value({
			desktop: false,
			tablet: false,
			phone: true
		});

		var oFirstItem = new Item({key: "Item1", text: "Item1"}),
			oMultiComboBox = new MultiComboBox({
			items: [
				new SeparatorItem({ text: "First Group" }),
				oFirstItem,
				new Item({key: "Item2", text: "Item2"}),
				new SeparatorItem({ text: "Second Group" }),
				new Item({key: "Item3", text: "Item3"}),
				new SeparatorItem({ text: "Third Group" }),
				new Item({key: "XXX", text: "XXX"})
			]
		});

		oMultiComboBox.syncPickerContent();

		var oSelectedButton = oMultiComboBox._getSuggestionsPopover().getFilterSelectedButton();

		var oFakeEvent = {
			target: {
				value: "I"
			},
			setMarked: function () { },
			srcControl: oMultiComboBox
		};
		oMultiComboBox.setSelectedItems([oFirstItem]);

		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate(this.clock);

		oMultiComboBox.open();
		this.clock.tick(nPopoverAnimationTick);
		oSelectedButton.setPressed(true);
		oMultiComboBox._filterSelectedItems({"oSource": oSelectedButton});
		await nextUIUpdate(this.clock);
		this.clock.tick(nPopoverAnimationTick);

		assert.strictEqual(oMultiComboBox.getSelectedItems().length, 1, "There is one selected item");
		assert.strictEqual(ListHelpers.getVisibleItems(oMultiComboBox.getItems()).length, 2, "Only one item should be visible");
		assert.strictEqual(oSelectedButton.getPressed(),true,"the SelectedButton is pressed");

		oMultiComboBox.oninput(oFakeEvent);
		await nextUIUpdate(this.clock);

		assert.strictEqual(ListHelpers.getVisibleItems(oMultiComboBox.getItems()).length, 5, "All three items are visible");
		assert.strictEqual(oSelectedButton.getPressed(), false, "the SelectedButton is not pressed");
		this.clock.tick(nPopoverAnimationTick);

		oMultiComboBox.close();
		this.clock.tick(nPopoverAnimationTick);

		oMultiComboBox.destroy();
	});

	QUnit.test("_selectItemByKey should set items with valid keys only", async function(assert) {
		this.clock = sinon.useFakeTimers();
		// Arrange
		var oMultiComboBox = new MultiComboBox();
		var oAddAssociationStub = this.stub(oMultiComboBox, "addAssociation");
		var oFakeEvent = {
			setMarked: function () {}
		};
		var fnTestFunction = function() {
			return "Test";
		};
		var fnData = function() {
			return {
				getSelected: function () {
					return false;
				}
			};
		};
		var aMockItems = [
			{
				getId: fnTestFunction,
				getText: fnTestFunction,
				data: fnData,
				getKey: function () {
					return null;
				},
				isA: function () {
					return false;
				},
				sId: "item1"
			},
			{
				getId: fnTestFunction,
				getText: fnTestFunction,
				data: fnData,
				getKey: function () {
					return undefined;
				},
				isA: function () {
					return false;
				},
				sId: "item2"
			},
			{
				getId: fnTestFunction,
				getText: fnTestFunction,
				data: fnData,
				getKey: function () {
					return "";
				},
				isA: function () {
					return false;
				},
				sId: "Test"
			},
			{
				getId: fnTestFunction,
				getText: fnTestFunction,
				data: fnData,
				getKey: fnTestFunction,
				isA: function () {
					return false;
				},
				sId: "item3"
			}
		];

		var oSetSelectionSpy = this.spy(oMultiComboBox, "setSelection");
		this.stub(oMultiComboBox, "_getUnselectedItems").returns(aMockItems);
		this.stub(oMultiComboBox, "getEnabled").returns(true);
		this.stub(oMultiComboBox, "getValue").callsFake(fnTestFunction);

		// Act
		oMultiComboBox._selectItemByKey(oFakeEvent);
		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate(this.clock);
		this.clock.tick(nPopoverAnimationTick);

		// Assert
		assert.ok(oAddAssociationStub.calledOnce, "addAssociation was called once");
		assert.strictEqual(oAddAssociationStub.firstCall.args[1], aMockItems[2], "... with the correct item");


		assert.ok(oSetSelectionSpy.calledOnce, "setSelection was called once");
		assert.ok(oSetSelectionSpy.calledWith({
			item: aMockItems[2],
			id: "Test",
			key: "",
			fireChangeEvent: true,
			fireFinishEvent: true,
			suppressInvalidate: true,
			listItemUpdated: false
		}), "Selection should be called with item which does not have 'null' or 'undefined' as a key");

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("_selectItemByKey should set sap.ui.coreItems only", async function(assert) {
		this.clock = sinon.useFakeTimers();
		// Arrange
		var oMultiComboBox = new MultiComboBox();
		var oAddAssociationStub = this.stub(oMultiComboBox, "addAssociation");
		var oFakeEvent = {
			setMarked: function () {}
		};
		var fnTestFunction = function() {
			return "Test";
		};
		var fnData = function() {
			return {
				getSelected: function () {
					return false;
				}
			};
		};
		var aMockItems = [
			{
				getId: fnTestFunction,
				getText: fnTestFunction,
				data: fnData,
				getKey: function () {
					return "test";
				},
				isA: function () {
					return true;
				},
				sId: "item1"
			},
			{
				getId: fnTestFunction,
				getText: fnTestFunction,
				data: fnData,
				getKey: fnTestFunction,
				isA: function () {
					return false;
				},
				sId: "Test"
			},
			{
				getId: fnTestFunction,
				getText: fnTestFunction,
				data: fnData,
				getKey: fnTestFunction,
				isA: function () {
					return false;
				},
				sId: "item2"
			}
		];

		var oSetSelectionSpy = this.spy(oMultiComboBox, "setSelection");
		this.stub(oMultiComboBox, "_getUnselectedItems").returns(aMockItems);
		this.stub(oMultiComboBox, "getEnabled").returns(true);
		this.stub(oMultiComboBox, "getValue").callsFake(fnTestFunction);

		// Act
		oMultiComboBox._selectItemByKey(oFakeEvent);
		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate(this.clock);
		this.clock.tick(nPopoverAnimationTick);

		// Assert
		assert.ok(oAddAssociationStub.calledOnce, "addAssociation was called once");
		assert.strictEqual(oAddAssociationStub.firstCall.args[1], aMockItems[1], "... with the correct item");


		assert.ok(oSetSelectionSpy.calledOnce, "setSelection was called once");
		assert.ok(oSetSelectionSpy.calledWith({
			item: aMockItems[1],
			id: "Test",
			key: "Test",
			fireChangeEvent: true,
			fireFinishEvent: true,
			suppressInvalidate: true,
			listItemUpdated: false
		}), "Selection should be called with item which does not have 'null' or 'undefined' as a key");

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("onsapenter on mobile device", async function(assert) {
		this.clock = sinon.useFakeTimers();
		// system under test
		this.stub(Device, "system").value({
			desktop: false,
			tablet: false,
			phone: true
		});

		// arrange
		var oPickerTextField,
			oPickerTextFieldDomRef,
			oFirstItem = new Item({key: "Item1", text: "Item1"}),
			oMultiComboBox = new MultiComboBox({
				items: [
					new SeparatorItem({ text: "First Group" }),
					oFirstItem,
					new Item({key: "Item2", text: "Item2"}),
					new SeparatorItem({ text: "Second Group" }),
					new Item({key: "Item3", text: "Item3"}),
					new SeparatorItem({ text: "Third Group" }),
					new Item({key: "XXX", text: "XXX"})
				]
			});

		// act
		oMultiComboBox.setSelectedItems([oFirstItem]);

		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate(this.clock);

		oMultiComboBox.open();
		this.clock.tick(nPopoverAnimationTick);

		oPickerTextField = oMultiComboBox.getPickerTextField();
		oPickerTextField.focus();
		oPickerTextFieldDomRef = oPickerTextField.getFocusDomRef();

		oPickerTextFieldDomRef.value = "I";
		qutils.triggerEvent("input", oPickerTextFieldDomRef);
		this.clock.tick(nPopoverAnimationTick);
		qutils.triggerKeydown(oPickerTextFieldDomRef, KeyCodes.ENTER); //onsapenter
		this.clock.tick(nPopoverAnimationTick);

		// assert
		assert.strictEqual(oMultiComboBox.getSelectedItems().length, 2, "There are two selected item");
		assert.notOk(oMultiComboBox.isOpen(), "The picker is closed");

		// clean up
		oMultiComboBox.destroy();
	});


	QUnit.test("Popup should have ariaLabelledBy that points to the PopupHiddenLabelId", async function(assert) {
		var oItem = new Item({
			key: "li",
			text: "lorem ipsum"
		}), oMultiComboBox = new MultiComboBox({
				items: [
					oItem
				]
		}), oResourceBundleOptions = oResourceBundle.getText("COMBOBOX_AVAILABLE_OPTIONS");

		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate();

		assert.equal(Element.getElementById(oMultiComboBox.getPickerInvisibleTextId()).getText(), oResourceBundleOptions, 'popup ariaLabelledBy is set');
		oMultiComboBox.destroy();
	});


	QUnit.module("Integrations");

	QUnit.test("Object cloning", function (assert) {
		// Setup
		var oMultiComboBoxClone,
			oMultiComboBox = new MultiComboBox({
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

		assert.ok(!oMultiComboBox._getList(), "The List is not yet loaded");

		// Act
		oMultiComboBox.open();
		oMultiComboBox.close();

		// Assert
		assert.ok(oMultiComboBox._getList(), "The List got loaded");

		// Act
		oMultiComboBoxClone = oMultiComboBox.clone();

		// Assert
		assert.ok(oMultiComboBoxClone._getList(), "The List got clonned");
		assert.strictEqual(oMultiComboBoxClone._getList().getItems().length, 8, "List items were clonned");

		// Cleanup
		oMultiComboBoxClone.destroy();
		oMultiComboBox.destroy();
	});

	QUnit.test("Object cloning + selectedKeys", function (assert) {
		// Setup
		var oMultiComboBoxClone,
			oMultiComboBox = new MultiComboBox({
				selectedKeys: ["A"],
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

		assert.ok(!oMultiComboBox._getList(), "The List is not yet loaded");

		// Act
		oMultiComboBox.open();
		oMultiComboBox.close();

		// Assert
		assert.ok(oMultiComboBox._getList(), "The List got loaded");

		// Act
		oMultiComboBoxClone = oMultiComboBox.clone();

		// Assert
		assert.ok(oMultiComboBoxClone._getList(), "The List got clonned");
		assert.strictEqual(oMultiComboBoxClone._getList().getItems().length, 8, "List items were clonned");

		// Cleanup
		oMultiComboBoxClone.destroy();
		oMultiComboBox.destroy();
	});

	QUnit.test("Data binding: update model data", async function (assert) {
		var oData = {
				"ProductCollection": [
					{
						"ProductId": "1234567",
						"Name": "Power Projector 5"
					},
					{
						"ProductId": "123",
						"Name": "Power Projector 1"
					}
					, {
						"ProductId": "1234",
						"Name": "Power Projector 2"
					}
					, {
						"ProductId": "12345",
						"Name": "Power Projector 3"
					}
					, {
						"ProductId": "123456",
						"Name": "Power Projector 4"
					}
				],
				"selectedCustomKeys": [
					"1234567"
				]
			},
			oData2 = [
				{
					"ProductId": "Zzz1",
					"Name": "Something absolutely different 1"
				},
				{
					"ProductId": "Zzz2",
					"Name": "Something absolutely different 2"
				},
				{
					"ProductId": "Zzz3",
					"Name": "Something absolutely different 3"
				},
				{
					"ProductId": "1234567",
					"Name": "Power Projector 5"
				}
			];

		var oMultiCombo = new MultiComboBox({
			items: {
				path: '/ProductCollection',
				template: new Item({key: "{ProductId}", text: "{Name}"})
			},
			selectedKeys: "{/selectedCustomKeys}"
		});
		var oModel = new JSONModel(oData);
		oMultiCombo.setModel(oModel);
		oMultiCombo.placeAt("MultiComboBoxContent");
		await nextUIUpdate();

		assert.strictEqual(oMultiCombo.getSelectedKeys().length, 1, "Selected keys are set to 1 item.");
		assert.strictEqual(oMultiCombo.getSelectedItems().length, 1, "Selected items are set to 1 item.");
		assert.deepEqual(oMultiCombo.getSelectedKeys(), oData.selectedCustomKeys, "Selected keys are properly propagated.");
		assert.strictEqual(oMultiCombo.getSelectedItems()[0].getKey(), oData.selectedCustomKeys[0], "Selected items are properly propagated.");

		oModel.setProperty("/ProductCollection", oData2);
		await nextUIUpdate();

		assert.strictEqual(oMultiCombo.getSelectedKeys().length, 1, "Selected keys remain to 1.");
		assert.strictEqual(oMultiCombo.getSelectedItems().length, 1, "Selected keys remain to 1.");
		assert.deepEqual(oMultiCombo.getSelectedKeys(), oData.selectedCustomKeys, "Selected keys are not changed as the same item is in the new data.");
		assert.strictEqual(oMultiCombo.getSelectedItems()[0].getKey(), oData.selectedCustomKeys[0], "Selected items are not changed as the same item is in the new data.");

		oMultiCombo.destroy();
		oModel.destroy();
	});

	QUnit.test("Data binding: update model data and selected items", async function (assert) {
		var oData = {
			"ProductCollection": [
				{
					"ProductId": "1234567",
					"Name": "Power Projector 5"
				},
				{
					"ProductId": "123",
					"Name": "Power Projector 1"
				}
				, {
					"ProductId": "1234",
					"Name": "Power Projector 2"
				}
				, {
					"ProductId": "12345",
					"Name": "Power Projector 3"
				}
				, {
					"ProductId": "123456",
					"Name": "Power Projector 4"
				}
			],
			"selectedCustomKeys": [
				"1234567", "Zzz3"
			]
		};

		var oMultiCombo = new MultiComboBox({
			selectedKeys: "{/selectedCustomKeys}",
			items: {
				path: '/ProductCollection',
				template: new Item({key: "{ProductId}", text: "{Name}"})
			}
		});
		var oModel = new JSONModel(oData);
		oMultiCombo.setModel(oModel);
		oMultiCombo.placeAt("MultiComboBoxContent");
		await nextUIUpdate();

		assert.strictEqual(oMultiCombo.getSelectedKeys().length, 2, "Selected keys are set to 2 items.");
		assert.strictEqual(oMultiCombo.getSelectedItems().length, 1, "Selected items are set to 1 item.");
		assert.deepEqual(oMultiCombo.getSelectedKeys(), oData.selectedCustomKeys, "Selected keys are properly propagated.");
		assert.strictEqual(oMultiCombo.getSelectedItems()[0].getKey(), oData.selectedCustomKeys[0], "Selected items are properly propagated.");

		var oData2 = Object.assign({}, oData);
		oData2.ProductCollection.push({ProductId: "Zzz3", Name: "New Item"});
		oModel.setProperty("/ProductCollection", oData2.ProductCollection);
		await nextUIUpdate();

		assert.strictEqual(oMultiCombo.getSelectedKeys().length, 2, "Selected keys remain to 2.");
		assert.strictEqual(oMultiCombo.getSelectedItems().length, 2, "Selected keys are updated to 2.");
		assert.deepEqual(oMultiCombo.getSelectedKeys(), oData.selectedCustomKeys, "Selected keys are not changed as the same item is in the new data.");
		assert.strictEqual(oMultiCombo.getSelectedItems()[1].getKey(), oData.selectedCustomKeys[1], "Selected items are not changed as the same item is in the new data.");

		oMultiCombo.destroy();
		oModel.destroy();
	});

	QUnit.test("Data binding: update seelctedkeys after model's value is formatted", async function (assert) {
		// arrange
		var oFlatArrayDatatype = SimpleType.extend("example.FlatArray", {
			formatValue: function(vValue, sInternalType) {
				return vValue ? vValue.split(",") : [];
			},
			parseValue: function(vValue, sInternalType) {
				return vValue ? vValue.join(",") : null;
			},
			validateValue: function(vValue) {}
		  });

		var oMultiComboBox = new MultiComboBox({
			items: {
				path: "/items",
				template: new Item({
					key: "{}",
					text: "{}"
				})
			},
			selectedKeys: {
			path: "/selectedKeys",
				type: new oFlatArrayDatatype()
			}
		});

		var oModel = new JSONModel({
				items: ["sap", "ui", "5"],
				selectedKeys: ""
		});

		oMultiComboBox.setModel(oModel);

		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate();

		var oNewSelectedItem = oMultiComboBox.getItems()[0];

		// act
		var oFakeParams = {
			item: oNewSelectedItem,
			id: oNewSelectedItem.getId(),
			key: oNewSelectedItem.getKey(),
			fireChangeEvent: true,
			suppressInvalidate: true,
			listItemUpdated: true
		};

		oMultiComboBox.setSelection(oFakeParams);
		await nextUIUpdate();

		// assert
		assert.strictEqual(oMultiComboBox.getAggregation("tokenizer").getTokens().length, 1, 'Only one token should be shown');

		// cleanup
		oMultiComboBox.destroy();
		oModel.destroy();
	});

	QUnit.module("highlighting", {
		beforeEach: function(){
			this.clock = sinon.useFakeTimers();
		},
		afterEach: function(){
			runAllTimersAndRestore(this.clock);
		}
	});

	QUnit.test("highlightList doesn't throw an error when showSecondaryValues=true and sap.ui.core.Item is set", async function(assert) {
		// system under test
		var fnOnAfterOpenSpy = this.spy(MultiComboBox.prototype, "onAfterOpen");
		var oMultiComboBox = new MultiComboBox({
			items: [
				new Item({
					key: "GER",
					text: "Germany"
				})
			]
		});

		// arrange
		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate(this.clock);
		oMultiComboBox.focus();

		// act
		oMultiComboBox.open();
		this.clock.tick(1000);

		// assert
		assert.strictEqual(fnOnAfterOpenSpy.callCount, 1, "onAfterOpen() called exactly once");

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("highlightList doesn't throw an error when combobox's value contains special characters", async function(assert) {

		// system under test
		var fnOnAfterOpenSpy = this.spy(MultiComboBox.prototype, "onAfterOpen");
		var oMultiComboBox = new MultiComboBox({
			showSecondaryValues: true,
			items: [
				new Item({
					key: "GER",
					text: "Germany"
				})
			]
		});

		// arrange
		oMultiComboBox.syncPickerContent();
		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate(this.clock);
		oMultiComboBox.highlightList("(T");

		// act
		oMultiComboBox.open();
		this.clock.tick(1000);

		// assert
		assert.strictEqual(fnOnAfterOpenSpy.callCount, 1, "onAfterOpen() called exactly once");

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("Clearing values after highlighting", async function(assert) {
		var oMultiComboBox = new MultiComboBox({
			items: [
				new Item({
					key: "ALG",
					text: "Algeria"
				})
			]
		}), oFakeEvent = {
				target: {
					value: "a"
				},
				setMarked: function () { },
				srcControl: oMultiComboBox
			};

		// arrange
		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate(this.clock);

		oMultiComboBox.oninput(oFakeEvent);
		this.clock.tick(100);

		oMultiComboBox.getFocusDomRef().blur();
		this.clock.tick(100);

		// assert
		assert.strictEqual(oMultiComboBox._getSuggestionsPopover()._sTypedInValue, "", "The input value is deleted");

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("The tokens are rendered after opening the picker", async function (assert) {
		//arrange
		var aTokens,
			aItems = [
				new Item("mcb-it1", {text: "text 1"}),
				new Item("mcb-it2", {text: "text 2"})
			], oMCB = new MultiComboBox({
				width: "20rem",
				items: aItems,
				selectedItems: ["mcb-it1", "mcb-it2"]
			});

		oMCB.placeAt("MultiComboBoxContent");
		await nextUIUpdate(this.clock);

		oMCB.open();
		this.clock.tick();

		aTokens = oMCB.getAggregation("tokenizer").getTokens();
		assert.ok(aTokens[0].getDomRef(), "The first token is rendered");
		assert.ok(aTokens[1].getDomRef(), "The second token is rendered");

		// clean up
		oMCB.destroy();
	});

	QUnit.module("setFilter", {
		beforeEach: function () {
			this.oMultiComboBox = new MultiComboBox({
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

			this.oMultiComboBox.syncPickerContent();
		},
		afterEach: function () {
			this.oMultiComboBox.destroy();
		}
	});

	QUnit.test("Setting a filter function should update the internal variable", function (assert) {
		this.oMultiComboBox.setFilterFunction(function () { return true; });

		assert.ok(this.oMultiComboBox.fnFilter, "Filter should not be falsy value");
	});

	QUnit.test("Setting an invalid filter should fallback to default text filter", function (assert) {
		var log = sap.ui.require('sap/base/Log'),
			fnWarningSpy = this.spy(log, "warning");

		// null is passed for a filter
		this.oMultiComboBox.setFilterFunction(null);
		assert.notOk(fnWarningSpy.called, "Warning should not be logged in the console when filter is null");

		this.oMultiComboBox.filterItems({ value:  "", items: this.oMultiComboBox.getItems() });
		assert.notOk(this.oMultiComboBox.fnFilter, "Default text filter should be applied, since fnFilter is not set");

		// undefined is passed for a filter
		this.oMultiComboBox.setFilterFunction(undefined);
		assert.notOk(fnWarningSpy.called, "Warning should not be logged in the console when filter is undefined");

		this.oMultiComboBox.filterItems({ value:  "", items: this.oMultiComboBox.getItems() });
		assert.notOk(this.oMultiComboBox.fnFilter, "Default text filter should be applied, since fnFilter is not set");

		// wrong filter type is passed
		this.oMultiComboBox.setFilterFunction({});
		assert.ok(fnWarningSpy.called, "Warning should be logged in the console when filter is not a function");

		this.oMultiComboBox.filterItems({ value:  "", items: this.oMultiComboBox.getItems() });
		assert.notOk(this.oMultiComboBox.fnFilter, "Default text filter should be applied, since fnFilter is not set");
	});

	QUnit.test("Setting a valid filter should apply on items", function (assert) {
		var fnFilterSpy = this.spy();

		// null is passed for a filter
		this.oMultiComboBox.setFilterFunction(fnFilterSpy);

		// act
		var aFilteredItems = this.oMultiComboBox.filterItems({ value: "B", items: this.oMultiComboBox.getItems() });

		assert.ok(fnFilterSpy.called, "Filter should be called");
		assert.strictEqual(aFilteredItems.items.length, 0, "Zero items should be filtered");
	});

	QUnit.test("Setting a valid filter should apply on items and their text", function (assert) {
		// arrange
		this.oMultiComboBox.addItem(new Item({ text: "Bbbb" }));

		// act
		var aFilteredItems = this.oMultiComboBox.filterItems({ value: "B", items: this.oMultiComboBox.getItems() }).items;

		// assert
		assert.strictEqual(aFilteredItems.length, 2, "Two items should be filtered");
		assert.strictEqual(aFilteredItems[0].getText(), "Baragoi", "Text should start with B");
		assert.strictEqual(aFilteredItems[1].getText(), "Bbbb", "Text text should start with B");
	});

	QUnit.test("Filtered values should be grouped", function(assert) {
		this.oMultiComboBox = new MultiComboBox({
			items: [
				new SeparatorItem({ text: "China-Cities" }),
				new ListItem({
					text: "Hong Kong",
					additionalText: "China"
				}),
				new ListItem({
					text: "Haskovo",
					additionalText: "Bulgaria"
				}),
				new SeparatorItem({ text: "Kenya-Cities" }),
				new ListItem({
					text: "Baragoi",
					additionalText: "Kenya"
				}),
				new SeparatorItem({ text: "Belgium-Cities" }),
				new ListItem({
					text: "Brussel",
					additionalText: "Belgium"

				})
			]
		});

		// Act
		this.oMultiComboBox.syncPickerContent();
		var aFilteredItems = this.oMultiComboBox.filterItems({ value: "B", items: this.oMultiComboBox.getItems() });
		itemsVisibilityHandler(this.oMultiComboBox.getItems(), aFilteredItems);

		// Assert
		assert.strictEqual(aFilteredItems.items.length, 2, "Two items should be filtered");
		assert.strictEqual(ListHelpers.getVisibleItems(this.oMultiComboBox.getItems()).length, 4, "There are two visible items with their group names");
	});

	QUnit.test("Default filtering should be per term", function (assert) {
		var aFilteredItems = this.oMultiComboBox.filterItems({ value: "K", items: this.oMultiComboBox.getItems() }).items;

		assert.strictEqual(aFilteredItems.length, 1, "One item should be filtered");
		assert.strictEqual(aFilteredItems[0].getText(), "Hong Kong", "Hong Kong item is matched by 'K'");
	});


	QUnit.module("Tablet focus handling");

	QUnit.test("it should not set the focus to the input", async function(assert) {
		this.stub(Device, "system").value({
			desktop: false,
			tablet: true,
			phone: false
		});

		var oMultiComboBox = new MultiComboBox(),
			oFakeEvent = null,
			oFocusinStub = this.stub(oMultiComboBox, "focus");

		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate();

		oFakeEvent = { target: oMultiComboBox.getDomRef("arrow") };

		oMultiComboBox.onfocusin(oFakeEvent);

		assert.strictEqual(oFocusinStub.callCount, 0, "Focus should not be called");

		oMultiComboBox.destroy();
	});

	QUnit.module("Collapsed state (N-more)", {
		beforeEach : async function() {
			var aItems = [new Item("firstItem", {text: "XXXX"}),
				new Item({text: "XXXX"}),
				new Item({text: "XXXX"}),
				new Item({text: "XXXX"})];

			this.oMCB1 = new MultiComboBox({
				items: aItems,
				selectedItems: aItems,
				width: "200px"
			});
			this.oMCB1.placeAt("MultiComboBoxContent");

			await nextUIUpdate();
		},
		afterEach : function() {
			this.oMCB1.destroy();
			runAllTimersAndRestore(this.clock);
		}
	});

	QUnit.test("onfocusin", async function(assert) {
		var oIndicator = this.oMCB1.$().find(".sapMTokenizerIndicator"),
			oEventMock = {
				target : this.oMCB1.getFocusDomRef()
			};

		//assert
		assert.ok(oIndicator[0], "A n-more label is rendered");

		//close and open the picker
		this.oMCB1.onfocusin(oEventMock);
		await nextUIUpdate();

		// assert
		assert.ok(oIndicator.hasClass("sapUiHidden"), "The n-more label is hidden on focusin.");
	});

	QUnit.test("Focus on a token", function(assert) {
		// arrange
		var oIndicator = this.oMCB1.$().find(".sapMTokenizerIndicator");

		// act
		this.oMCB1.getAggregation("tokenizer").getTokens()[2].focus();

		// assert
		assert.notOk(oIndicator.hasClass("sapUiHidden"), "The n-more label is not hidden on focusin.");
	});

	QUnit.test("SelectedItems Popover's interaction", function(assert) {
		this.clock = sinon.useFakeTimers();
		// act
		this.oMCB1.$().find(".sapMTokenizerIndicator")[0].click();

		// deselect the first item
		jQuery(this.oMCB1.getPicker().getContent()[0].getItems()[0]).tap();
		this.clock.tick(200);

		// assert
		assert.strictEqual(this.oMCB1.getSelectedItems().length, 3, "A selected item was removed after deselecting an item from the popover");
	});

	QUnit.test("_calculateSpaceForTokenizer", async function(assert) {
		var oMultiComboBox = new MultiComboBox({
				width: "500px"
			});

		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate();

		oMultiComboBox.$().find(".sapMMultiComboBoxInputContainer").removeClass("sapMMultiComboBoxInputContainer");
		await nextUIUpdate();

		assert.strictEqual(oMultiComboBox._calculateSpaceForTokenizer(), "406px", "_calculateSpaceForTokenizer returns a correct px value");

		oMultiComboBox.destroy();
	});

	QUnit.test("_calculateSpaceForTokenizer with null DOM element reference", async function(assert) {
		var oMultiComboBox = new MultiComboBox(),
			output;

		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate();

		oMultiComboBox.$().find(".sapMMultiComboBoxInputContainer").removeClass("sapMMultiComboBoxInputContainer");
		await nextUIUpdate();

		output = oMultiComboBox._calculateSpaceForTokenizer();

		assert.strictEqual(isNaN(parseInt(output)), false, "_calculateSpaceForTokenizer returns a valid value");

		oMultiComboBox.destroy();
	});

	QUnit.test("_calculateSpaceForTokenizer with negative tokenizer space", async function(assert) {
		var oMultiComboBox = new MultiComboBox({
			width: "30px"
		});

		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate();

		assert.strictEqual(oMultiComboBox._calculateSpaceForTokenizer(), "0px", "_calculateSpaceForTokenizer returns a non negative value");

		oMultiComboBox.destroy();
	});

	QUnit.test("N-more popover transition from read-only to edit mode", async function (assert) {
		this.clock = sinon.useFakeTimers();
		//arrange
		var oReadOnlyPopover,
			aReadOnlyContent,
			aEditModeContent,
			aItems = [
				new Item("it1111", {text: "this is a long text"}),
				new Item("it2111", {text: "this is another long text"})
			], oMCB = new MultiComboBox({
				width: "8rem",
				editable: false,
				items: aItems,
				selectedItems: ["it1111", "it2111"]
			}),
			oTokenizer = oMCB.getAggregation("tokenizer");

		oMCB.placeAt("MultiComboBoxContent");
		await nextUIUpdate(this.clock);

		oTokenizer._handleNMoreIndicatorPress();
		this.clock.tick(200);

		oReadOnlyPopover = oTokenizer.getTokensPopup();
		aReadOnlyContent = oReadOnlyPopover.getContent();
		assert.strictEqual(aReadOnlyContent.length, 1, "The read-only popover has content.");
		assert.ok(aReadOnlyContent[0].isA("sap.m.List"), "The read-only popover aggregated a list.");
		assert.strictEqual(aReadOnlyContent[0].getMode(), "None", "The list is in mode 'None'.");
		assert.strictEqual(aReadOnlyContent[0].getItems().length, 2, "The list has 2 items.");

		oReadOnlyPopover.close();
		oMCB.setEditable(true);
		await nextUIUpdate(this.clock);

		oTokenizer._oIndicator.trigger("click");
		this.clock.tick(1000);

		aEditModeContent = oMCB.getPicker().getContent()[0];
		assert.ok(aEditModeContent.isA("sap.m.List"), "The popover aggregated a list.");
		assert.strictEqual(aEditModeContent.getMode(), "MultiSelect", "The list is in mode 'MultiSelect'.");
		assert.strictEqual(aEditModeContent.getItems().length, 2, "The list has 2 items.");
		assert.ok(aEditModeContent.getItems()[0].getSelected(), "The first item is selected.");
		assert.ok(aEditModeContent.getItems()[1].getSelected(), "The second item is selected.");

		// clean up
		oMCB.destroy();
	});

	QUnit.test("tokenizer's adjustTokensVisibility is called on initial rendering", async function (assert) {
		this.clock = sinon.useFakeTimers();
		//arrange
		var oMCB = new MultiComboBox({
			items: [
				new Item({key: "key", text: "text"})
			],
			selectedKeys: ["key"]
		});
		var oTokenizer = oMCB.getAggregation("tokenizer");
		var oTokenizerSpy = this.spy(oTokenizer, "_adjustTokensVisibility");

		// act
		oMCB.placeAt("MultiComboBoxContent");
		await nextUIUpdate(this.clock);
		this.clock.tick(300);

		// assert
		assert.strictEqual(oTokenizer.getRenderMode(), TokenizerRenderMode.Narrow, "the tokenizer is in Narrow mode");
		assert.ok(oTokenizerSpy.called, "tokenizer's _adjustTokensVisibility is called");

		// clean up
		oMCB.destroy();
	});

	QUnit.test("Sync Items with Tokens", async function (assert) {
		// Setup
		var oIndicator = this.oMCB1.$().find(".sapMTokenizerIndicator");

		// Act
		this.oMCB1.setWidth("30px");
		await nextUIUpdate();

		// assert
		assert.strictEqual(oIndicator.text(), oResourceBundle.getText("TOKENIZER_SHOW_ALL_ITEMS", 4));

		// Act
		this.oMCB1.getItems()[0].setEnabled(false);
		await nextUIUpdate();

		// assert
		oIndicator = this.oMCB1.$().find(".sapMTokenizerIndicator");
		assert.strictEqual(oIndicator.text(), oResourceBundle.getText("TOKENIZER_SHOW_ALL_ITEMS", 3));
	});

	QUnit.module("Expanded state (N-more)", {
		beforeEach : async function() {
			this.clock = sinon.useFakeTimers();
			var aItems = [
				new SeparatorItem({ text: "First Group" }),
				new Item('item1', {text: "XXXX"}),
				new Item('item2', {text: "XXXX"}),
				new SeparatorItem({ text: "Second Group" }),
				new Item('item3', {text: "XXXX"}),
				new SeparatorItem({ text: "Third Group" }),
				new Item('item4', {text: "XXXX"})];

			this.oMCB1 = new MultiComboBox({
				items: aItems,
				selectedItems: ['item1', 'item3'],
				width: "200px"
			});
			this.oMCB1.placeAt("MultiComboBoxContent");

			await nextUIUpdate(this.clock);
		},
		afterEach : function() {
			this.oMCB1.destroy();
			runAllTimersAndRestore(this.clock);
		}
	});

	QUnit.test("Desktop: Selected items are grouped when picker is opened", function(assert) {
		this.stub(Device, "system").value({
			desktop: true,
			phone: false,
			tablet: false
		});

		this.oMCB1.syncPickerContent();

		this.oMCB1.$().find(".sapMTokenizerIndicator")[0].click();
		this.clock.tick(200);

		//assert
		assert.strictEqual(this.oMCB1.getSelectedItems().length, 2, "There are two selected items");
		assert.strictEqual(ListHelpers.getVisibleItems(this.oMCB1.getItems()).length, 4, "The selected items are shown grouped");
	});

	QUnit.test("Phone: Selected items are grouped when picker is opened", async function (assert) {
		this.stub(Device, "system").value({
			desktop: false,
			phone: true,
			tablet: false
		});

		var oMultiComboBox = new MultiComboBox({
			items: [
				new SeparatorItem({text: "First Group"}),
				new Item('iitem1', {text: "XXXX"}),
				new Item('iitem2', {text: "XXXX"}),
				new SeparatorItem({text: "Second Group"}),
				new Item('iitem3', {text: "XXXX"}),
				new SeparatorItem({text: "Third Group"}),
				new Item('iitem4', {text: "XXXX"})],
			selectedItems: ['iitem1', 'iitem3'],
			width: "200px"
		});

		oMultiComboBox.syncPickerContent();
		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate(this.clock);

		oMultiComboBox.$().find(".sapMTokenizerIndicator").trigger("click");
		this.clock.tick(600);

		//assert
		assert.strictEqual(oMultiComboBox.getSelectedItems().length, 2, "There are two selected items");
		assert.strictEqual(ListHelpers.getVisibleItems(oMultiComboBox.getItems()).length, 4, "The selected items are shown grouped");

		oMultiComboBox.close();
		this.clock.tick(500);
		oMultiComboBox.destroy();
	});

	QUnit.module("Type-ahead", {
		beforeEach: function() {
			this.clock = sinon.useFakeTimers();
		},
		afterEach: function(){
			runAllTimersAndRestore(this.clock);
		}
	});

	QUnit.test("Desktop: Basic interaction", async function (assert) {
		var oSystem = {
			desktop : true,
			phone : false,
			tablet : false
		},
		oMultiComboBox = new MultiComboBox({
			items : [new Item({
				key : "DZ",
				text : "Algeria"
			}), new Item({
				key : "AR",
				text : "Argentina"
			}), new Item({
				key : "AU",
				text : "Australia"
			})]
		}), oInputDomRef,
			oFakeEvent = {
				target: {
					value: "A"
				},
				srcControl: oMultiComboBox,
				setMarked: function () {}
			};

		this.stub(Device, "system").value(oSystem);

		// arrange
		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate(this.clock);

		// act
		oInputDomRef = oMultiComboBox.getDomRef("inner");
		oMultiComboBox.oninput(oFakeEvent);
		this.clock.tick(500);
		// assert
		assert.strictEqual(oInputDomRef.value, "Algeria", "Correct value autocompleted on input.");

		// act
		qutils.triggerKeydown(oMultiComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN, false, false);
		this.clock.tick(500);
		// assert
		assert.strictEqual(oInputDomRef.value, "A", "Autocompleted text is removed after navigation into options list.");

		// act
		qutils.triggerKeydown(oMultiComboBox._getList().getItems()[0].getDomRef(), KeyCodes.ARROW_UP, false, false);
		this.clock.tick(500);
		// assert
		assert.strictEqual(oInputDomRef.value, "Algeria", "Correct value autocompleted when navigating with arrow from list item to input field.");

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("Desktop: Autocomplete + Item selection", async function (assert) {
		var oSystem = {
			desktop : true,
			phone : false,
			tablet : false
		},
		oMultiComboBox = new MultiComboBox({
			items : [new Item({
				key : "DZ",
				text : "Algeria"
			}), new Item({
				key : "AR",
				text : "Argentina"
			}), new Item({
				key : "AU",
				text : "Australia"
			})]
		}), oInputDomRef,
			oInputEvent = {
				target: {
					value: "A"
				},
				srcControl: oMultiComboBox,
				setMarked: function () {}
			};

		this.stub(Device, "system").value(oSystem);

		// arrange
		oMultiComboBox.syncPickerContent();
		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate(this.clock);

		// act
		oInputDomRef = oMultiComboBox.getDomRef("inner");

		oMultiComboBox.oninput(oInputEvent);
		this.clock.tick(500);
		// assert
		assert.strictEqual(oInputDomRef.value, "Algeria",
				"Correct value autocompleted on input.");

		// act - select item from list
		oMultiComboBox._getList().setSelectedItem(oMultiComboBox._getList().getItems()[0], true, true);
		this.clock.tick(500);
		// assert
		assert.strictEqual(oInputDomRef.value, "A",
				"Autocompleted value removed after item selection by checkbox press.");

		// act
		oMultiComboBox.oninput(oInputEvent);
		this.clock.tick(500);
		// assert
		assert.strictEqual(oInputDomRef.value, "Argentina",
				"Next match autocompleted, if the first one is already selected.");

		// act - tap in item from list
		oMultiComboBox._bCheckBoxClicked = false;
		oMultiComboBox._getList().setSelectedItem(oMultiComboBox._getList().getItems()[1], true, true);
		this.clock.tick(500);
		// assert
		assert.strictEqual(oInputDomRef.value, "",
				"Autocompleted value removed after item selection by pressing an list item.");

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("Phone: Autocomplete + Item selection", async function (assert) {
		var oSystem = {
			desktop : false,
			phone : true,
			tablet : false
		};
		this.stub(Device, "system").value(oSystem);

		var oPickerTextFieldDomRef,
			oMultiComboBox = new MultiComboBox({
				items : [ new Item({
					key : "DZ",
					text : "Algeria"
				}), new Item({
					key : "AR",
					text : "Argentina"
				}), new Item({
					key : "AU",
					text : "Australia"
				})]
			});

		oMultiComboBox.syncPickerContent();

		var	oList = oMultiComboBox._getList(), aListItems,
			oInputEvent = {
				target: {
					value: "A"
				},
				srcControl: oMultiComboBox.getPickerTextField(),
				isMarked: function () {
					return false;
				},
				setMarked: function () {}
			};

		// arrange
		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate(this.clock);

		// act
		oMultiComboBox.open();
		this.clock.tick(900);

		aListItems = oList.getItems();
		oPickerTextFieldDomRef = oMultiComboBox.getPickerTextField().getDomRef("inner");

		oMultiComboBox.oninput(oInputEvent);
		this.clock.tick(500);
		// assert
		assert.strictEqual(oPickerTextFieldDomRef.value, "Algeria",
				"Correct value autocompleted on input.");

		// act - select item from list
		oList.setSelectedItem(aListItems[0], true, true);
		this.clock.tick(500);
		// assert
		assert.strictEqual(oPickerTextFieldDomRef.value, "A",
				"Autocompleted value removed after item selection by pressing a checkbox.");

		// act
		oMultiComboBox.oninput(oInputEvent);
		this.clock.tick(500);
		// assert
		assert.strictEqual(oPickerTextFieldDomRef.value,
				"Argentina", "Next match autocompleted, if the first one is already selected.");


		// act - tap in item from list
		oMultiComboBox._bCheckBoxClicked = false;
		oList.setSelectedItem(aListItems[1], true, true);
		this.clock.tick(500);
		// assert
		assert.strictEqual(oMultiComboBox.getDomRef("inner").value, "",
				"Autocompleted value removed after item selection by pressing an list item.");

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("Typeahead should be disabled on adroid devices", async function (assert) {
		this.stub(Device, "system").value({
			desktop: false,
			phone: true,
			tablet: false
		});

		this.stub(Device, "os").value({
			android: true
		});

		var oMultiComboBox = new MultiComboBox({
			items: [
				new Item({
					key: "1",
					text: "ipsum alorem"
				})
			]
		});

		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate(this.clock);
		oMultiComboBox.focus();
		oMultiComboBox.open();
		this.clock.tick(500);
		var oPickerTextField = oMultiComboBox.getPickerTextField();
		oPickerTextField.focus();
		var oPickerTextFieldDomRef = oPickerTextField.getFocusDomRef();

		// act
		qutils.triggerEvent("keydown", oPickerTextFieldDomRef, {
			which: KeyCodes.L,
			srcControl: oPickerTextField
		});

		oMultiComboBox.close();
		this.clock.tick(500);

		// assert
		assert.notOk(oPickerTextField._bDoTypeAhead, '_bDoTypeAhead should be set to false');

		// act
		qutils.triggerEvent("keydown", oMultiComboBox.getFocusDomRef(), {
			which: KeyCodes.I,
			srcControl: oMultiComboBox.getFocusDomRef()
		});

		// assert
		assert.notOk(oMultiComboBox._bDoTypeAhead, '_bDoTypeAhead should be set to false');

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.module("Two Column Layout", {
		beforeEach: async function(){
			this.clock = sinon.useFakeTimers();
			this.oMultiComboBox = new MultiComboBox({
				showSecondaryValues: true,
				items: [
					new ListItem({
						key: "001",
						text: "Algeria",
						additionalText: "AL"
					}),
					new ListItem({
						key: "002",
						text: "Argentina",
						additionalText: "AR"
					}),
					new ListItem({
						key: "003",
						text: "Qatar",
						additionalText: "QA"
					})
				]
			}).placeAt("MultiComboBoxContent");
			await nextUIUpdate(this.clock);
		},
		afterEach: function(){
			this.oMultiComboBox.destroy();
			runAllTimersAndRestore(this.clock);
		}
	});

	QUnit.test("Highlighting", function(assert){
		var oFakeEvent = {
			target: {
				value: "a"
			},
			setMarked: function () { },
			srcControl: this.oMultiComboBox
		}, oListItemRef;

		this.oMultiComboBox.oninput(oFakeEvent);
		this.clock.tick(2000);

		oListItemRef = this.oMultiComboBox._getList().getItems()[0].$();
		assert.strictEqual(oListItemRef.find(".sapMSLITitleOnly [id$=-titleText]")[0].innerHTML,
			"<span class=\"sapMInputHighlight\">A</span>lgeria", "The main text is correctly highlighted.");

		assert.strictEqual(oListItemRef.find(".sapMSLIInfo [id$=-infoText]")[0].innerHTML,
			"<span class=\"sapMInputHighlight\">A</span>L", "The additional text is correctly highlighted.");
	});

	QUnit.test("StandardListItem mapping", function(assert){
		var aListItems = [],
			aSuggestions = this.oMultiComboBox.getItems();

		this.oMultiComboBox.open();
		this.clock.tick(2000);

		aListItems = this.oMultiComboBox._getList().getItems();

		for (var i = 0; i < 3; i++) {
			assert.strictEqual(aListItems[i].getTitle(), aSuggestions[i].getText(), "Item " + i + " text is correctly mapped.");
			assert.strictEqual(aListItems[i].getInfo(), aSuggestions[i].getAdditionalText(), "Item " + i + " info is correctly mapped.");
		}
	});

	QUnit.module("Grouping", {
		beforeEach : async function() {
			this.oMultiComboBox = new MultiComboBox({
				items: [
					new SeparatorItem({ text: "Asia-Countries" }),
					new ListItem({
						text: "Hong Kong",
						additionalText: "China"
					}),
					new ListItem({
						text: "Haskovo",
						additionalText: "Bulgaria"
					}),
					new SeparatorItem({ text: "Africa-Countries" }),
					new ListItem({
						text: "Baragoi",
						additionalText: "Kenya"
					}),
					new SeparatorItem({ text: "Europe-Countries" }),
					new ListItem({
						text: "Brussel",
						additionalText: "Belgium"
					})
				]
			});
			this.oMultiComboBox.placeAt("MultiComboBoxContent");

			await nextUIUpdate();
		},
		afterEach : function() {
			this.oMultiComboBox.destroy();
		}
	});

	QUnit.test("The groups names are not filtered", function(assert) {
		this.oMultiComboBox.syncPickerContent();
		var aFilteredItems = this.oMultiComboBox.filterItems({ value: "A", items: this.oMultiComboBox.getItems() }).items;
		assert.strictEqual(aFilteredItems.length, 0, "There is no filtered items");
	});

	QUnit.test("_mapItemToList()", function(assert) {
		this.oMultiComboBox.syncPickerContent();
		var groupHeader = this.oMultiComboBox._getList().getItems()[0];
		assert.ok(groupHeader.isA("sap.m.GroupHeaderListItem"), "The control used for the group name is instance of sap.m.GroupHeaderListItem");
	});

	QUnit.test("_mapItemToListItem() - Data Binding works correct ", async function(assert) {

		// JSON sample data
		var aData = [
				{
					lastName:"Doe", gender:"Male{"
				}, {
					lastName:"Ali{", gender:"Female"
				}
		], oModel = new JSONModel(aData);

		// arrange
		this.multiComboBox = new MultiComboBox({
			items: {
				path: "/",
				template: new ListItem({text: "{lastName}", additionalText: "{gender}"})
			},
			showSecondaryValues: true
		}).setModel(oModel).placeAt("MultiComboBoxContent");
		await nextUIUpdate();

		this.multiComboBox.open();

		// assert
		assert.ok(true, "If there's no exception so far, values ending with curly brackets could be used.");

		// destroy
		this.multiComboBox.destroy();
		this.multiComboBox = null;
	});



	QUnit.module("Value State Error", {
		beforeEach : async function() {
			var oItem4;
			this.oMultiComboBox = new MultiComboBox({
				items: [
					new SeparatorItem({ text: "Asia-Countries" }),
					new ListItem({
						text: "Hong Kong",
						additionalText: "China"
					}),
					new ListItem({
						text: "Haskovo",
						additionalText: "Bulgaria"
					}),
					new SeparatorItem({ text: "Africa-Countries" }),
					new ListItem({
						text: "Baragoi",
						additionalText: "Kenya"
					}),
					new SeparatorItem({ text: "Europe-Countries" }),
					oItem4 = new ListItem({
						text: "Brussel",
						additionalText: "Belgium"
					})
				],
				selectedItems: [oItem4]
			});
			this.oMultiComboBox.placeAt("MultiComboBoxContent");

			await nextUIUpdate();
		},
		afterEach : function() {
			this.oMultiComboBox.destroy();
			runAllTimersAndRestore(this.clock);
		}
	});

	QUnit.test("onsapenter should trigger invalidation if the item is already selected", function(assert) {
		// arrange
		var oAlreadySelectedItemSpy = this.spy(this.oMultiComboBox, "_showAlreadySelectedVisualEffect");

		// act
		qutils.triggerCharacterInput(this.oMultiComboBox.getFocusDomRef(), "Brussel");
		qutils.triggerKeydown(this.oMultiComboBox.getDomRef(), KeyCodes.ENTER); //onsapenter

		// assert
		assert.strictEqual(oAlreadySelectedItemSpy.callCount, 1, "_showAlreadySelectedVisualEffect() should be called exactly once");
		assert.strictEqual(this.oMultiComboBox.getValueState(), ValueState.Error, "The value is already selected");
		assert.strictEqual(this.oMultiComboBox.getValue(), "Brussel", "The value is not deleted");
	});

	QUnit.test("onsapenter should not reset the initially set value to None", async function(assert) {
		this.oMultiComboBox.setValueState("Information");
		await nextUIUpdate();
		// arrange
		var oAlreadySelectedItemSpy = this.spy(this.oMultiComboBox, "_showAlreadySelectedVisualEffect");

		// act
		qutils.triggerKeydown(this.oMultiComboBox.getFocusDomRef(), KeyCodes.ENTER); //onsapenter
		await nextUIUpdate();

		// assert
		assert.strictEqual(oAlreadySelectedItemSpy.callCount, 1, "_showAlreadySelectedVisualEffect() should be called exactly once");
		assert.strictEqual(this.oMultiComboBox.getValueState(), ValueState.Information, "The value state is the initially set one");
	});

	QUnit.test("oninput the value state message should not be visible", async function(assert) {
		// act
		this.oMultiComboBox._$input.trigger("focus").val("Brussel").trigger("input");
		qutils.triggerKeydown(this.oMultiComboBox.getDomRef(), KeyCodes.ENTER);
		this.oMultiComboBox._$input.trigger("focus").val("H").trigger("input");
		await nextUIUpdate();

		// assert
		assert.strictEqual(this.oMultiComboBox.getValueState(), ValueState.None, "The value state is reset to none.");
	});

	QUnit.test("oninput the value state should be reset to the initial one", async function(assert) {
		this.oMultiComboBox.setValueState("Warning");
		await nextUIUpdate();

		var oFakeEvent = {
			isMarked: function () {return false;},
			setMarked: function () {},
			target: {
				value: "A"
			},
			srcControl: this.oMultiComboBox
		};

		// act
		qutils.triggerCharacterInput(this.oMultiComboBox.getFocusDomRef(), "Brussel");
		qutils.triggerKeydown(this.oMultiComboBox.getDomRef(), KeyCodes.ENTER);

		await nextUIUpdate();

		this.oMultiComboBox.oninput(oFakeEvent); // Fake input
		await nextUIUpdate();

		assert.strictEqual(this.oMultiComboBox.getValueState(), ValueState.Warning, "The value state is reset.");
	});

	QUnit.test("value state message should be opened if the input field is on focus", async function(assert) {
		this.clock = sinon.useFakeTimers();
		// act
		this.oMultiComboBox.focus();
		this.oMultiComboBox.open();
		await nextUIUpdate(this.clock);
		this.clock.tick(500);

		qutils.triggerCharacterInput(this.oMultiComboBox.getFocusDomRef(), "Brussel");
		qutils.triggerKeydown(this.oMultiComboBox.getDomRef(), KeyCodes.ENTER);

		this.oMultiComboBox.close();
		this.clock.tick(500);

		// assert
		assert.strictEqual(document.activeElement, this.oMultiComboBox.getFocusDomRef(), "Focus is set to the input field");
		assert.strictEqual(this.oMultiComboBox.getValueState(), ValueState.Error, "The value state is error");
		assert.strictEqual(this.oMultiComboBox.getValueStateText(), oResourceBundle.getText("VALUE_STATE_ERROR_ALREADY_SELECTED"), "Value State message is correct");
		assert.strictEqual(this.oMultiComboBox.getValue(), "Brussel", "The invalid value is corrected");
	});

	QUnit.test("Value state should reset to None when not set onfocusout", async function(assert) {
		this.clock = sinon.useFakeTimers();
		// act
		this.oMultiComboBox.focus();
		this.oMultiComboBox.open();
		await nextUIUpdate(this.clock);
		this.clock.tick(500);

		qutils.triggerCharacterInput(this.oMultiComboBox.getFocusDomRef(), "Brussel");
		qutils.triggerKeydown(this.oMultiComboBox.getDomRef(), KeyCodes.ENTER);
		qutils.triggerKeydown(this.oMultiComboBox.getDomRef(), KeyCodes.ENTER);
		qutils.triggerKeydown(this.oMultiComboBox.getDomRef(), KeyCodes.ENTER);

		this.oMultiComboBox.getFocusDomRef().blur();
		this.clock.tick(500);

		// assert
		assert.strictEqual(this.oMultiComboBox.getValueState(), "None", "Value state should be reset to None");
	});

	QUnit.test("Value state should reset to inintial value state set by the application onfocusout", async function(assert) {
		this.clock = sinon.useFakeTimers();
		this.oMultiComboBox.setValueState("Warning");
		await nextUIUpdate(this.clock);

		// act
		this.oMultiComboBox.focus();
		this.oMultiComboBox.open();
		await nextUIUpdate(this.clock);
		this.clock.tick(500);

		qutils.triggerCharacterInput(this.oMultiComboBox.getFocusDomRef(), "Brussel");
		qutils.triggerKeydown(this.oMultiComboBox.getDomRef(), KeyCodes.ENTER);
		qutils.triggerKeydown(this.oMultiComboBox.getDomRef(), KeyCodes.ENTER);
		qutils.triggerKeydown(this.oMultiComboBox.getDomRef(), KeyCodes.ENTER);

		this.oMultiComboBox.getFocusDomRef().blur();
		this.clock.tick(500);

		// assert
		assert.strictEqual(this.oMultiComboBox.getValueState(), "Warning", "Value state should be reset to None");
	});

	QUnit.test("value state message for invalid input should be overwritten by the applications", async function(assert) {
		this.clock = sinon.useFakeTimers();
		var sCustomText = "This is application text. This is application text. This is application text. This is application text. This is application text. This is application text. This is application text.";

		// act
		this.oMultiComboBox.setValueStateText(sCustomText);
		await nextUIUpdate(this.clock);

		var oFakeEvent = {
			isMarked: function () { },
			setMarked: function () { },
			srcControl: this.oMultiComboBox,
			target: {
				value: "Roma"
			}
		};

		this.oMultiComboBox.focus();
		this.oMultiComboBox.open();
		this.clock.tick(500);

		this.oMultiComboBox.setValue(oFakeEvent.value);
		this.oMultiComboBox.oninput(oFakeEvent);

		await nextUIUpdate(this.clock);

		// assert
		assert.strictEqual(this.oMultiComboBox.getValueStateText(), sCustomText, "Value State message is correct.");

		// act
		oFakeEvent.value = "Brussel";
		this.oMultiComboBox.setValue(oFakeEvent.value);
		qutils.triggerKeydown(this.oMultiComboBox.getFocusDomRef(), KeyCodes.ENTER);
		await nextUIUpdate(this.clock);

		// assert
		assert.strictEqual(this.oMultiComboBox.getValueStateText(),
			oResourceBundle.getText("VALUE_STATE_ERROR_ALREADY_SELECTED"),
			"Already selected value message is correct.");

		// act
		oFakeEvent.value = "Roma";

		this.oMultiComboBox.setValue(oFakeEvent.value);
		this.oMultiComboBox.oninput(oFakeEvent);
		await nextUIUpdate(this.clock);

		// assert
		assert.strictEqual(this.oMultiComboBox.getValueStateText(), sCustomText, "Value State message is correct.");
	});

	QUnit.test("onfocusout value should be deleted", async function(assert) {
		this.clock = sinon.useFakeTimers();
		this.oMultiComboBox.setValueState("Success");
		await nextUIUpdate(this.clock);

		// act
		this.oMultiComboBox.open();
		await nextUIUpdate(this.clock);
		this.clock.tick(500);

		qutils.triggerCharacterInput(this.oMultiComboBox.getFocusDomRef(), "Brussel");
		qutils.triggerKeydown(this.oMultiComboBox.getDomRef(), KeyCodes.ENTER);

		this.oMultiComboBox.getFocusDomRef().blur();
		this.clock.tick(500);


		// assert
		assert.notEqual(document.activeElement, this.oMultiComboBox.getFocusDomRef(), "Focus is not in the input field");
		assert.strictEqual(this.oMultiComboBox.getValueState(), ValueState.Success, "The value state is reset");
		assert.strictEqual(this.oMultiComboBox.getValue(), "", "The input value is deleted");
	});

	QUnit.test("onfocusout value should be cleared", async function(assert) {
		this.clock = sinon.useFakeTimers();
		//arrange
		var oFocusedDomRef = this.oMultiComboBox.getFocusDomRef();

		// act
		this.oMultiComboBox.open();
		await nextUIUpdate(this.clock);
		this.clock.tick(500);

		qutils.triggerCharacterInput(oFocusedDomRef, "Brussel");
		qutils.triggerKeydown(oFocusedDomRef, KeyCodes.BACKSPACE);
		qutils.triggerKeydown(oFocusedDomRef, KeyCodes.ENTER);

		this.oMultiComboBox.getFocusDomRef().blur();
		this.clock.tick(500);

		// assert
		assert.notEqual(document.activeElement, this.oMultiComboBox.getFocusDomRef(), "Focus is not in the input field");
		assert.strictEqual(this.oMultiComboBox.getValue(), "", "The input value is deleted");
	});

	QUnit.module("Value State Containing links", {
		beforeEach : async function() {
			this.oMultiComboBox = new MultiComboBox({
				items: [
					new ListItem({
						text: "Hong Kong",
						additionalText: "China"
					}),
					new ListItem({
						text: "Haskovo",
						additionalText: "Bulgaria"
					}),
					new ListItem({
						text: "Baragoi",
						additionalText: "Kenya"
					}),
					new ListItem({
						text: "Brussel",
						additionalText: "Belgium"
					})
				]
			});

			var oFormattedValueStateText = new FormattedText({
				htmlText: "Value state message containing %%0 %%1",
				controls: [new Link({
					text: "multiple",
					href: "#"
				}),
				new Link({
					text: "links",
					href: "#"
				})]
			});

			this.oMultiComboBox.setShowValueStateMessage(true);
			this.oMultiComboBox.setValueState("Warning");
			this.oMultiComboBox.setFormattedValueStateText(oFormattedValueStateText);
			this.oMultiComboBox.placeAt("MultiComboBoxContent");

			await nextUIUpdate();
		},
		afterEach : function() {
			this.oMultiComboBox.destroy();
			runAllTimersAndRestore(this.clock);
		}
	});

	QUnit.test("onkeydown should focus the formatted value state header if the current focus is on the input", function(assert) {
		this.clock = sinon.useFakeTimers();
		// Act
		this.oMultiComboBox.open();
		this.clock.tick();

		qutils.triggerKeydown(this.oMultiComboBox.getDomRef(), KeyCodes.ARROW_DOWN);

		this.clock.tick();

		// Assert
		assert.strictEqual(this.oMultiComboBox._getSuggestionsPopover()._getValueStateHeader().getDomRef(), document.activeElement, "The formatted value state message is focused");
	});

	QUnit.test("tab key pressed on the last link in the value state message should close the picker", function(assert) {
		this.clock = sinon.useFakeTimers();
		// Act
		this.oMultiComboBox.open();
		this.clock.tick();

		// this.oMultiComboBox._getSuggestionsPopover()._getValueStateHeader().getFormattedText().getControls()[1].getDomRef().focus();
		this.oMultiComboBox._handleFormattedTextNav();
		qutils.triggerKeydown(this.oMultiComboBox._getSuggestionsPopover()._getValueStateHeader().getFormattedText().getControls()[1].getDomRef(), KeyCodes.TAB);

		// Assert
		assert.ok(!this.oMultiComboBox.isOpen(), "Popover is closed");
	});

	QUnit.test("when the focus is on the first item it should go to the value state header containing a link on arrow up", function(assert) {
		// Act
		this.oMultiComboBox.getFocusDomRef().focus();
		qutils.triggerKeydown(document.activeElement, KeyCodes.ARROW_DOWN, false, true);
		qutils.triggerKeydown(ListHelpers.getListItem(this.oMultiComboBox.getItems()[0]).getDomRef(), KeyCodes.ARROW_UP);

		// Assert
		assert.strictEqual(this.oMultiComboBox._getSuggestionsPopover()._getValueStateHeader().getDomRef(), document.activeElement, "Value state header is focused");
	});

	QUnit.test("Value state header containing links should be focusable but not part of the tab chain", function(assert) {
		this.clock = sinon.useFakeTimers();
		// Act
		this.oMultiComboBox.open();
		this.clock.tick(1000);

		qutils.triggerKeydown(this.oMultiComboBox.getDomRef(), KeyCodes.ARROW_DOWN);
		this.clock.tick(1000);

		// Assert
		assert.strictEqual(this.oMultiComboBox._getSuggestionsPopover()._getValueStateHeader().$().attr("tabindex"), "-1", "Value state message is focusable but not part of the tab chain");
		assert.ok(this.oMultiComboBox._getSuggestionsPopover()._getValueStateHeader().$().hasClass("sapMFocusable"), "sapMFocusable class is applied to the value state header");
	});

	QUnit.test("when the suggestions popover is opened CTRL+A should select/deselect all items and create tokens", async function(assert) {
		// Arrange
		var oEventMock = {
			isMarked: function () { },
			setMarked: function () { },
			preventDefault: function() {return false; }
		};
		var oGroupHeaderItem = new SeparatorItem({text: "Group Header"});

		this.oMultiComboBox.insertItem(oGroupHeaderItem, 0);
		await nextUIUpdate();

		// Act
		this.oMultiComboBox.onsapshow(oEventMock);


		qutils.triggerKeydown(ListHelpers.getListItem(this.oMultiComboBox.getItems()[0]).getDomRef(), KeyCodes.A, false, false, true);

		// Assert
		assert.strictEqual(this.oMultiComboBox.getSelectedItems().length, 4, "All items are selected");
	});

	QUnit.module("Composition characters handling", {
		beforeEach: async function () {
			this.multiComboBox = new MultiComboBox({
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
			}).placeAt("MultiComboBoxContent");

			await nextUIUpdate();
		},
		afterEach: function () {
			this.multiComboBox.destroy();
			runAllTimersAndRestore(this.clock);
		}
	});

	QUnit.test("Filtering", function (assert) {
		this.multiComboBox.syncPickerContent();
		// act
		var bMatched = inputsDefaultFilter("서", this.multiComboBox.getItems()[0]);
		var aFilteredItems = this.multiComboBox.filterItems({value: "서", items: this.multiComboBox.getItems()}).items;

		// assert
		assert.ok(bMatched, "'inputsDefaultFilter' should match composite characters");
		assert.strictEqual(aFilteredItems.length, 2, "Two items should be filtered");
		assert.strictEqual(aFilteredItems[0].getText(), "서비스 ID", "Text should start with 서");
	});

	QUnit.test("Composititon events", function (assert) {
		this.clock = sinon.useFakeTimers();
		var oFakeEvent = {
			isMarked: function () { },
			setMarked: function () { },
			srcControl: this.multiComboBox,
			target: {
				value: "서"
			}
		},
			oHandleInputEventSpy = this.spy(this.multiComboBox, "handleInputValidation"),
			oHandleTypeAheadSpy = this.spy(this.multiComboBox, "_handleTypeAhead"),
			oHandleFieldValueStateSpy = this.spy(this.multiComboBox, "_handleFieldValidationState");

		this.multiComboBox._bDoTypeAhead = true;
		this.multiComboBox._bIsPasteEvent = false;

		// act
		this.multiComboBox.oncompositionstart(oFakeEvent);
		this.multiComboBox.oninput(oFakeEvent);
		this.clock.tick(nPopoverAnimationTick);

		// assert
		assert.ok(oHandleInputEventSpy.called, "handleInputValidation should be called on input");
		assert.notOk(oHandleTypeAheadSpy.called, "Type ahed should not be called while composing");
		assert.notOk(oHandleFieldValueStateSpy.called, "Field Validation should not be called while composing");
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

			this.oMultiComboBox = new MultiComboBox({
				items: {
					path: "/",
					template: new Item({text: "{name}", key: "{key}"})
				}
			}).setModel(oModel).placeAt("MultiComboBoxContent");

			await nextUIUpdate();
		},
		afterEach: function () {
			this.oMultiComboBox.destroy();
		}
	});

	QUnit.test("Should restore default filtering function", function (assert) {
		// Setup
		var fnFilter = this.oMultiComboBox.fnFilter;

		// Act
		this.oMultiComboBox.showItems(function () {
			return true;
		});

		// Assert
		assert.strictEqual(this.oMultiComboBox.fnFilter, fnFilter, "Default function has been restored");

		// Act
		fnFilter = function (sValue, oItem) {
			return oItem.getText() === "A Item 1";
		};
		this.oMultiComboBox.setFilterFunction(fnFilter);
		this.oMultiComboBox.showItems(function () {
			return false;
		});

		// Assert
		assert.strictEqual(this.oMultiComboBox.fnFilter, fnFilter, "Custom filter function has been restored");
	});

	QUnit.test("Should show all the items", async function (assert) {
		// Setup
		var fnGetVisisbleItems = function (aItems) {
			return aItems.filter(function (oItem) {
				return oItem.getVisible();
			});
		};

		// Act
		this.oMultiComboBox.showItems();
		await nextUIUpdate();

		// Assert
		assert.strictEqual(this.oMultiComboBox._getList().getItems().length, 5, "All the items are available");
		assert.strictEqual(fnGetVisisbleItems(this.oMultiComboBox._getList().getItems()).length, 5, "Shows all items");
	});

	QUnit.test("Should filter the items", async function (assert) {
		// Setup
		var fnGetVisisbleItems = function (aItems) {
			return aItems.filter(function (oItem) {
				return oItem.getVisible();
			});
		};

		// Act
		this.oMultiComboBox.showItems(function (sValue, oItem) {
			return oItem.getText() === "A Item 1";
		});
		await nextUIUpdate();

		// Assert
		assert.strictEqual(this.oMultiComboBox._getList().getItems().length, 5, "All the items are available");
		assert.strictEqual(fnGetVisisbleItems(this.oMultiComboBox._getList().getItems()).length, 1, "Only the matching items are visible");
	});

	QUnit.test("Should call toggleStyleClass correctly in the process of showing items", function (assert) {
		// Setup
		var oSpy = this.spy(this.oMultiComboBox, "toggleStyleClass"),
			sClassName = InputBase.ICON_PRESSED_CSS_CLASS;

		// Act
		this.oMultiComboBox.showItems(function () {
			return true;
		});

		// Assert
		assert.strictEqual(oSpy.callCount, 0, "The toggleStyleClass method was not called.");

		// Act
		this.oMultiComboBox._handlePopupOpenAndItemsLoad(true); // Icon press

		// Assert
		assert.strictEqual(oSpy.callCount, 1, "The toggleStyleClass method was called once:");
		assert.strictEqual(oSpy.getCall(0).args[0], sClassName, "...first time with '" + sClassName + "'.");

		// Arrange
		this.oMultiComboBox._bShouldClosePicker = true;
		this.oMultiComboBox._bItemsShownWithFilter = false;

		// Act
		this.oMultiComboBox._handlePopupOpenAndItemsLoad(); // Icon press

		// Assert
		assert.strictEqual(oSpy.callCount, 2, "The toggleStyleClass method was called twice:");
		assert.strictEqual(oSpy.getCall(1).args[0], sClassName, "...second time with '" + sClassName + "'.");

		oSpy.restore();
	});

	QUnit.test("Should call toggleStyleClass after showItems is called and oninput is triggered.", async function (assert) {
		// Setup
		var oSpy = this.spy(this.oMultiComboBox, "toggleStyleClass"),
			oFakeEvent = {
				isMarked: function () {return false;},
				setMarked: function () {},
				target: {
					value: "A Item"
				},
				srcControl: this.oMultiComboBox
			},
			sClassName = InputBase.ICON_PRESSED_CSS_CLASS;

		// Act
		this.oMultiComboBox.showItems(function () {
			return true;
		});

		// Assert
		assert.strictEqual(oSpy.callCount, 0, "The toggleStyleClass method was not called.");

		// Act
		this.oMultiComboBox.oninput(oFakeEvent); // Fake input

		// Assert
		assert.strictEqual(oSpy.callCount, 1, "The toggleStyleClass method was called once:");
		assert.strictEqual(oSpy.getCall(0).args[0], sClassName, "...first time with '" + sClassName + "'.");

		oSpy.restore();
		await nextUIUpdate();
	});


	QUnit.test("Should show all items when drop down arrow is pressed after showing filtered list.", async function (assert) {
		// Setup
		var fnGetVisisbleItems = function (aItems) {
			return aItems.filter(function (oItem) {
				return oItem.getVisible();
			});
		};

		// Act
		this.oMultiComboBox.showItems(function (sValue, oItem) {
			return oItem.getText() === "A Item 1";
		});
		await nextUIUpdate();

		// Assert
		assert.strictEqual(this.oMultiComboBox._getList().getItems().length, 5, "All the items are available");
		assert.strictEqual(fnGetVisisbleItems(this.oMultiComboBox._getList().getItems()).length, 1, "Only the matching items are visible");

		// Act
		this.oMultiComboBox._handlePopupOpenAndItemsLoad(true); // Icon press
		await nextUIUpdate();

		assert.strictEqual(this.oMultiComboBox._getList().getItems().length, 5, "All the items are available");
		assert.strictEqual(fnGetVisisbleItems(this.oMultiComboBox._getList().getItems()).length, 5, "All items are visible");
	});

	QUnit.test("Should not open the Popover in case of 0 items.", async function (assert) {
		// Act
		this.oMultiComboBox.showItems(function () {
			return false;
		});
		await nextUIUpdate();

		// Assert
		assert.strictEqual(this.oMultiComboBox.isOpen(), false, "The Popover should not be displayed.");
	});

	QUnit.module("selectedKeys");

	QUnit.test("Should select keys & items", async function (assert) {
		var oClone,
			oMultiComboBox = new MultiComboBox({
				selectedKeys: ["1", "3"],
				items: [
					new Item({key: "1", text: "1"}),
					new Item({key: "2", text: "2"}),
					new Item({key: "3", text: "3"}),
					new Item({key: "4", text: "4"})
				]
			}).placeAt("MultiComboBoxContent"),
			oTokenizer = oMultiComboBox.getAggregation("tokenizer");
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oMultiComboBox.getSelectedKeys().length, oMultiComboBox.getSelectedItems().length, "Selection should be in sync");
		assert.strictEqual(oMultiComboBox.getSelectedKeys().length, oTokenizer.getTokens().length, "Selection should be in sync");

		// Act
		oClone = oMultiComboBox.clone();

		// Assert
		assert.strictEqual(oMultiComboBox.getSelectedKeys().length, oClone.getSelectedKeys().length, "Clones should inherit selections");
		assert.strictEqual(oMultiComboBox.getSelectedItems().length, oClone.getSelectedItems().length, "Clones should inherit selections");
		assert.strictEqual(oTokenizer.getTokens().length, oClone.getAggregation("tokenizer").getTokens().length, "Clones should inherit selections");

		oMultiComboBox.destroy();
		oClone.destroy();
	});

	QUnit.test("Should be able to sync mixed properties", async function (assert) {
		var oItem = new Item({key: "1", text: "1"}),
			oMultiComboBox = new MultiComboBox({
				selectedKeys: ["2", "3"],
				selectedItems: [oItem],
				items: [
					oItem,
					new Item({key: "2", text: "2"}),
					new Item({key: "3", text: "3"}),
					new Item({key: "4", text: "4"})
				]
			}).placeAt("MultiComboBoxContent");
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oMultiComboBox.getSelectedKeys().length, 3, "Selection should be in sync");
		assert.strictEqual(oMultiComboBox.getSelectedKeys().length, oMultiComboBox.getSelectedItems().length, "Selection should be in sync");

		oMultiComboBox.destroy();
	});

	QUnit.test("Tokenizer's _bShouldRenderTabIndex should be set to false and tabindex should not be rendered", async function (assert) {
		var oItem = new Item({key: "1", text: "1"}),
			oMultiComboBox = new MultiComboBox({
				selectedKeys: ["2", "3"],
				items: [
					oItem,
					new Item({key: "2", text: "2"}),
					new Item({key: "3", text: "3"}),
					new Item({key: "4", text: "4"})
				]
			}).placeAt("MultiComboBoxContent");

		await nextUIUpdate();

		// Assert
		assert.strictEqual(oMultiComboBox.getAggregation("tokenizer")._bShouldRenderTabIndex, false, "_bShouldRenderTabIndex is correctly set to false");
		assert.strictEqual(oMultiComboBox.getAggregation("tokenizer").getDomRef().hasAttribute("tabindex"), false, "tabindex is not rendered");

		oMultiComboBox.destroy();
	});

	QUnit.test("Should be able to sync predefined selectedKey", async function (assert) {
		var oItem = new Item({key: "1", text: "1"}),
			oMultiComboBox = new MultiComboBox({
				selectedKeys: ["1"],
				items: [
					new Item({key: "2", text: "2"}),
					new Item({key: "3", text: "3"}),
					new Item({key: "4", text: "4"})
				]
			}).placeAt("MultiComboBoxContent");
		await nextUIUpdate();

		// Assert
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), ["1"], "There should be selected key defined");
		assert.strictEqual(oMultiComboBox.getSelectedItems().length, 0, "But ther should not be selectedItems as there's no match");

		// Act
		oMultiComboBox.addItem(oItem);
		await nextUIUpdate();

		// Assert
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), ["1"], "There should be selected key defined");
		assert.strictEqual(oMultiComboBox.getSelectedItems().length, 1, "There should be selected item now");
		assert.deepEqual(oMultiComboBox.getSelectedItems()[0], oItem, "Recent item shoud be selected");


		// Act
		oMultiComboBox.removeItem(oItem);
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oMultiComboBox.getSelectedKeys().length, 0, "Selected keys should be empty");
		assert.strictEqual(oMultiComboBox.getSelectedItems().length, 0, "Selected items should be empty");


		oMultiComboBox.destroy();
	});

	QUnit.test("API use should sync with the token", async function (assert) {
		var oMultiComboBox = new MultiComboBox({
			items: [
				new Item({key: "2", text: "2"}),
				new Item({key: "3", text: "3"}),
				new Item({key: "4", text: "4"})
			]
		}).placeAt("MultiComboBoxContent"),
		oTokenizer = oMultiComboBox.getAggregation("tokenizer");
		await nextUIUpdate();

		// Act
		oMultiComboBox.addSelectedKeys(["2", "3"]);
		await nextUIUpdate();

		assert.deepEqual(oMultiComboBox.getSelectedKeys(), ["2", "3"], "SelectedKeys should be saved");
		assert.strictEqual(oMultiComboBox.getSelectedItems().length, 2, "selectedItems should be there");
		assert.strictEqual(oMultiComboBox.getSelectedItems().length, oTokenizer.getTokens().length, "Selected items should be visible as tokens");

		// Act
		oMultiComboBox.setSelectedKeys([]);
		await nextUIUpdate();

		assert.strictEqual(oMultiComboBox.getSelectedKeys().length, 0, "SelectedKeys should be empty");
		assert.strictEqual(oMultiComboBox.getSelectedItems().length, 0, "selectedItems should be empty");
		assert.strictEqual(oMultiComboBox.getSelectedItems().length, oTokenizer.getTokens().length, "Selected items should be removed");

		oMultiComboBox.destroy();
	});

	QUnit.test("Items without keys", async function (assert) {
		var oItem = new Item({key: "1", text: "1"}),
			aItems = [
				new Item({key: "2", text: "2"}),
				new Item({key: "3", text: "3"}),
				new Item({key: "4", text: "4"})
			],
			oMultiComboBox = new MultiComboBox({
				selectedItems: aItems,
				selectedKeys: ["1"],
				items: aItems
			}).placeAt("MultiComboBoxContent");
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oMultiComboBox.getItems().length, 3, "Items should be 3");
		assert.strictEqual(oMultiComboBox.getSelectedKeys().length, 4, "SelectedKeys should be 4");
		assert.strictEqual(oMultiComboBox.getSelectedItems().length, 3, "The available selectedItems should be 3");

		// Act
		oMultiComboBox.addItem(oItem);
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oMultiComboBox.getItems().length, 4, "Items should be 4");
		assert.strictEqual(oMultiComboBox.getSelectedKeys().length, 4, "SelectedKeys should be 4");
		assert.strictEqual(oMultiComboBox.getSelectedItems().length, 4, "The available selectedItems should be 4");

		// Act
		oMultiComboBox.removeItem(aItems[0]);
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oMultiComboBox.getItems().length, 3, "Items should be 3");
		assert.strictEqual(oMultiComboBox.getSelectedKeys().length, 3, "SelectedKeys should be 3");
		assert.strictEqual(oMultiComboBox.getSelectedItems().length, 3, "The available selectedItems should be 3");

		// Act
		oMultiComboBox.removeSelectedItem(aItems[0]); // This item has already been removed, but let's give it another try
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oMultiComboBox.getItems().length, 3, "Items should be 3");
		assert.strictEqual(oMultiComboBox.getSelectedKeys().length, 3, "SelectedKeys should be 3");
		assert.strictEqual(oMultiComboBox.getSelectedItems().length, 3, "The available selectedItems should be 3");

		// Act
		oMultiComboBox.removeSelectedItem(aItems[1]);
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oMultiComboBox.getItems().length, 3, "Items should be 3");
		assert.strictEqual(oMultiComboBox.getSelectedKeys().length, 2, "SelectedKeys should be 2");
		assert.strictEqual(oMultiComboBox.getSelectedItems().length, 2, "The available selectedItems should be 2");

		oMultiComboBox.destroy();
	});

	QUnit.test("Sync selectedKeys' items before MultiComboBox has been rendered", async function (assert) {
		// Setup
		var oMultiComboBox = new MultiComboBox(),
			oTokenizer = oMultiComboBox.getAggregation("tokenizer"),
			oOnBeforeRenderingSpy = this.spy(oMultiComboBox, "onBeforeRendering");

		oMultiComboBox.addItem(new Item({ key: "A", text: "A" }));
		oMultiComboBox.addItem(new Item({ key: "B", text: "B" }));
		oMultiComboBox.addItem(new Item({ key: "C", text: "C" }));
		oMultiComboBox.setSelectedKeys(["B", "C"]);
		oMultiComboBox.setSelectedKeys(["A"]);

		// Assert
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), ["A"], "Only the last setter should be applied");
		assert.strictEqual(oMultiComboBox.getSelectedItems().length, 1, "Selected Items association should be in sync");
		assert.strictEqual(oOnBeforeRenderingSpy.callCount, 0, "onBeforeRendering has not been called yet. No real sync.");

		// Act
		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oOnBeforeRenderingSpy.called, true, "onBeforeRendering has been called and items should be in sync");
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), ["A"], "Only the last setter should be applied");
		assert.strictEqual(oMultiComboBox.getSelectedItems().length, 1, "Selected Items association should be in sync");
		assert.strictEqual(oTokenizer.getTokens().length, 1, "Tokens should correspond to the actual selection");
		assert.strictEqual(oTokenizer.getTokens()[0].getKey(), "A", "Tokens should correspond to the actual selection");

		// Cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("Sync selectedItems' items before MultiComboBox has been rendered", async function (assert) {
		// Setup
		var oMultiComboBox = new MultiComboBox(),
			oTokenizer = oMultiComboBox.getAggregation("tokenizer"),
			oOnBeforeRenderingSpy = this.spy(oMultiComboBox, "onBeforeRendering"),
			aItems = [
				new Item({ key: "A", text: "A" }),
				new Item({ key: "B", text: "B" }),
				new Item({ key: "C", text: "C" })
			];

		oMultiComboBox.addItem(aItems[0]);
		oMultiComboBox.addItem(aItems[1]);
		oMultiComboBox.addItem(aItems[2]);
		oMultiComboBox.setSelectedItems([aItems[1], aItems[2]]);
		oMultiComboBox.setSelectedItems([aItems[0]]);

		// Assert
		assert.strictEqual(oMultiComboBox.getSelectedItems().length, 1, "Only the last setter should be applied");
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), ["A"], "selectedKeys is not in sync yet");
		assert.strictEqual(oOnBeforeRenderingSpy.callCount, 0, "onBeforeRendering has not been called yet. No real sync.");

		// Act
		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oOnBeforeRenderingSpy.called, true, "onBeforeRendering has been called and items should be in sync");
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), ["A"], "Only the last setter should be applied");
		assert.strictEqual(oMultiComboBox.getSelectedItems().length, 1, "Selected Items association should be in sync");
		assert.strictEqual(oTokenizer.getTokens().length, 1, "Tokens should correspond to the actual selection");
		assert.strictEqual(oTokenizer.getTokens()[0].getKey(), "A", "Tokens should correspond to the actual selection");

		// Cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("Sync selectedItems & selectedKeys", async function (assert) {
		this.clock = sinon.useFakeTimers();
		// Setup
		var oMultiComboBox = new MultiComboBox(),
			oTokenizer = oMultiComboBox.getAggregation("tokenizer"),
			oOnBeforeRenderingSpy = this.spy(oMultiComboBox, "onBeforeRendering"),
			aItems = [
				new Item({ key: "A", text: "A" }),
				new Item({ key: "B", text: "B" }),
				new Item({ key: "C", text: "C" })
			];

		oMultiComboBox.addItem(aItems[0]);
		oMultiComboBox.addItem(aItems[1]);
		oMultiComboBox.addItem(aItems[2]);

		// Act
		oMultiComboBox.setSelectedItems([aItems[1], aItems[2]]);
		oMultiComboBox.setSelectedKeys(["A"]);

		// Assert
		assert.strictEqual(oMultiComboBox.getSelectedItems().length, 3, "Selected items are properly set");
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), ["B", "C", "A"], "selectedKeys are properly set");
		assert.strictEqual(oOnBeforeRenderingSpy.callCount, 0, "onBeforeRendering has not been called yet. No real sync.");

		// Act
		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate(this.clock);
		this.clock.tick(500);

		// Assert
		assert.strictEqual(oOnBeforeRenderingSpy.callCount, 1, "onBeforeRendering has been called once and items should be in sync");
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), ["B", "C", "A"], "Only the last setter should be applied");
		assert.strictEqual(oMultiComboBox.getSelectedItems().length, 3, "Selected Items association should be in sync");
		assert.strictEqual(oTokenizer.getTokens().length, 3, "Tokens should correspond to the actual selection");
		assert.strictEqual(oTokenizer.getTokens()[0].getKey(), "B", "Tokens should correspond to the actual selection");

		// Act
		oMultiComboBox.setSelectedItems([aItems[1]]);
		await nextUIUpdate(this.clock);
		this.clock.tick(500);

		assert.strictEqual(oMultiComboBox.getSelectedItems().length, 1, "Selected Items should be adjusted");
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), ["B"], "SelectedKeys should be in sync");
		assert.strictEqual(oTokenizer.getTokens().length, 1, "Tokens should correspond to the actual selection");
		assert.strictEqual(oTokenizer.getTokens()[0].getKey(), "B", "Tokens should correspond to the actual selection");

		// Act
		oMultiComboBox.setSelectedKeys(["C", "A"]);
		await nextUIUpdate(this.clock);
		this.clock.tick(500);

		assert.deepEqual(oMultiComboBox.getSelectedKeys(), ["C", "A"], "SelectedKeys should be adjusted");
		assert.strictEqual(oMultiComboBox.getSelectedItems().length, 2, "Selected Items should be in sync");
		assert.strictEqual(oTokenizer.getTokens().length, 2, "Tokens should correspond to the actual selection");
		assert.strictEqual(oTokenizer.getTokens()[0].getKey(), "C", "Tokens should correspond to the actual selection");

		// Cleanup
		oMultiComboBox.destroy();
		runAllTimersAndRestore(this.clock);
	});

	QUnit.test("When setSelectedKeys is called before the model selected Tokens text should be syncronized", async function (assert) {
		// Arrange
		var oModel = new JSONModel();
		oModel.setData({
			a: "Test A",
			b: "Test B",
			c: "Test C"
		});
		var oMultiComboBox = new MultiComboBox({
			items : [
				new Item({ key: "A", text: "{test>/a}" }),
				new Item({ key: "B", text: "{test>/b}" }),
				new Item({ key: "C", text: "{test>/c}" })
			]
		}),
		oTokenizer = oMultiComboBox.getAggregation("tokenizer");

		// Act
		oMultiComboBox.setSelectedKeys(["A", "B"]);

		// Assert
		assert.strictEqual(oTokenizer.getTokens()[0].getText(), "", "Token text should be empty");
		assert.strictEqual(oTokenizer.getTokens()[1].getText(), "", "Token text should be empty");

		// Act
		oMultiComboBox.setModel(oModel, "test");
		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oTokenizer.getTokens().length, 2, "The MultiComboBox was not invalidated");
		assert.strictEqual(oTokenizer.getTokens()[0].getText(), "Test A", "Token text should correspond to the model");
		assert.strictEqual(oTokenizer.getTokens()[1].getText(), "Test B", "Token text should correspond to the model");

		// Act
		oMultiComboBox.getModel("test").setProperty("/a", "A Test");
		oMultiComboBox.getModel("test").setProperty("/b", "B Test");
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oTokenizer.getTokens()[0].getText(), "A Test", "Token text should be updated");
		assert.strictEqual(oTokenizer.getTokens()[1].getText(), "B Test", "Token text should be updated");

		// Cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("Only selected keys should be in the readonly popover", async function (assert) {
		this.clock = sinon.useFakeTimers();
		// Arrange
		var oMultiComboBox = new MultiComboBox({
			width: "300px",
			items: [
				new Item({text: "Token 1", key: "token1"}),
				new Item({text: "Token 2", key: "token2"}),
				new Item({text: "Token 3", key: "token3"}),
				new Item({text: "Token 4", key: "token4"}),
				new Item({text: "Token 5", key: "token5"}),
				new Item({text: "Token 6", key: "token6"}),
				new Item({text: "Token 7", key: "token7"}),
				new Item({text: "Token 8", key: "token8"}),
				new Item({text: "Token 9", key: "token9"}),
				new Item({text: "Token 10", key: "token10"})

			],
			selectedKeys: ["token1", "token2", "token3", "token4"],
			editable: false
		}).placeAt("MultiComboBoxContent"),
		oTokenizer = oMultiComboBox.getAggregation("tokenizer");

		await nextUIUpdate(this.clock);

		// Act
		oMultiComboBox.$().find(".sapMTokenizerIndicator")[0].click();
		this.clock.tick(nPopoverAnimationTick);

		assert.strictEqual(oTokenizer._getTokensList().getItems().length, 4, "Only the selected items should be in the list");

		// Act
		oMultiComboBox.close();
		this.clock.tick(nPopoverAnimationTick);
		oMultiComboBox.setEditable(false);
		oMultiComboBox.$().find(".sapMTokenizerIndicator")[0].click();
		this.clock.tick(nPopoverAnimationTick);

		assert.strictEqual(oTokenizer._getTokensList().getItems().length, 4, "Only the selected items should be in the list");

		// Cleanup
		oMultiComboBox.destroy();
		runAllTimersAndRestore(this.clock);
	});

	QUnit.module("One extra long token handling", {
		beforeEach: async function(){
			this.clock = sinon.useFakeTimers();
			this.oMultiComboBox = new MultiComboBox({
				width: '200px',
				items: [new Item({key: "A", text: "Extra long long long long long token"})],
				selectedKeys: ["A"]
			});

			this.oMultiComboBox.placeAt("MultiComboBoxContent");
			await nextUIUpdate(this.clock);
		},
		afterEach: function() {
			this.oMultiComboBox.destroy();
			runAllTimersAndRestore(this.clock);
		}
	});

	QUnit.test("Token should be truncated initially", function (assert) {
		// Assert
		assert.ok(this.oMultiComboBox.getAggregation("tokenizer").hasOneTruncatedToken(), "Token is truncated initially.");
	});

	QUnit.test("Should set/remove truncation on focusin/focusout", async function (assert) {
		// Arrange
		var oTokenizer = this.oMultiComboBox.getAggregation("tokenizer"),
			oSpy = this.spy(oTokenizer, "_useCollapsedMode"),
			oMockEvent = {
				target: this.oMultiComboBox.getFocusDomRef()
			};

		// Act
		this.oMultiComboBox.onfocusin(oMockEvent);
		await nextUIUpdate(this.clock);
		this.clock.tick(nPopoverAnimationTick);
		await nextUIUpdate(this.clock);

		// Assert
		assert.ok(oSpy.calledWith(TokenizerRenderMode.Loose), "_useCollapsedMode should be called with 'Narrow'.");
		assert.ok(!oTokenizer.hasOneTruncatedToken(), "Truncation was removed from the token");

		// Act
		this.oMultiComboBox.onsapfocusleave(oMockEvent);
		await nextUIUpdate(this.clock);
		this.clock.tick(nPopoverAnimationTick);
		await nextUIUpdate(this.clock);

		assert.ok(oSpy.calledWith(TokenizerRenderMode.Narrow), "_useCollapsedMode should be called with 'Loose'.");
		assert.ok(oTokenizer.hasOneTruncatedToken(), "Truncation was set on the token");
		oSpy.restore();
	});

	QUnit.test("Should open/close suggestion popover on CTRL + I", function (assert) {
		// Arrange
		var oPicker;

		// Act
		qutils.triggerKeydown(this.oMultiComboBox, KeyCodes.I, false, false, true); // trigger Control key + I
		this.clock.tick(nPopoverAnimationTick);

		oPicker = this.oMultiComboBox.getPicker();

		// Assert
		assert.ok(oPicker.isOpen(), "Should open suggestion popover");

		// Act
		qutils.triggerKeydown(this.oMultiComboBox, KeyCodes.I, false, false, true); // trigger Control key + I
		this.clock.tick(nPopoverAnimationTick);

		// Assert
		assert.notOk(oPicker.isOpen(), "Should close suggestion popover");
	});

	QUnit.test("Should open read only popover on CTRL + I and the token should not be truncated", function (assert) {
		var oTokenizer = this.oMultiComboBox.getAggregation("tokenizer");
		// Arrange
		this.oMultiComboBox.setEditable(false);
		this.clock.tick();

		assert.ok(oTokenizer.hasOneTruncatedToken(), "The token should be truncated");

		// Act
		qutils.triggerKeydown(this.oMultiComboBox, KeyCodes.I, false, false, true); // trigger Control key + I
		this.clock.tick(500);

		// Assert
		assert.ok(oTokenizer.getTokensPopup().isOpen(), "Suggestion read only popover should be opened");
		assert.notOk(oTokenizer.hasOneTruncatedToken(), "The token should not be truncated");
	});

	QUnit.test("Truncation should stay on token click in read only mode", async function (assert) {
		var oTokenizer = this.oMultiComboBox.getAggregation("tokenizer");
		// Arrange
		this.oMultiComboBox.setEditable(false);

		assert.ok(oTokenizer.hasOneTruncatedToken(), "The token should be truncated");

		// Act
		this.oMultiComboBox.$().find(".sapMTokenizerIndicator")[0].click();
		await nextUIUpdate(this.clock);
		this.clock.tick(nPopoverAnimationTick);

		// Assert
		assert.ok(this.oMultiComboBox.getAggregation("tokenizer").hasOneTruncatedToken(), "The token should be truncated");
	});

	QUnit.test("Should not create suggestion popover on CTRL + I when the input doesn't have tokens", async function (assert) {
		// Arrange
		var oMultiComboBox = new MultiComboBox();

		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate(this.clock);

		// Act
		qutils.triggerKeydown(oMultiComboBox, KeyCodes.I, false, false, true); // trigger Control key + I
		await nextUIUpdate(this.clock);
		this.clock.tick(nPopoverAnimationTick);

		// Assert
		assert.strictEqual(oMultiComboBox.getPicker(), null, "Suggestion popover should not be opened.");

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("Should not open suggestion popover on CTRL + I when the input doesn't have tokens", async function (assert) {
		// Arrange
		// First we need to make sure there is picker
		this.oMultiComboBox.createPicker();

		// Remove all tokens
		this.oMultiComboBox.setSelectedKeys([]);
		await nextUIUpdate(this.clock);

		// Act
		qutils.triggerKeydown(this.oMultiComboBox, KeyCodes.I, false, false, true); // trigger Control key + I
		await nextUIUpdate(this.clock);
		this.clock.tick(nPopoverAnimationTick);

		// Assert
		assert.strictEqual(this.oMultiComboBox.getPicker().isOpen(), false, "Suggestion popover should not be opened.");

		// cleanup
		this.oMultiComboBox.destroy();
	});

	QUnit.module("Rendering");

	QUnit.test("Should not create suggestion popover on CTRL + I when the input doesn't have tokens", async function (assert) {
		// Arrange
		var oMultiComboBox = new MultiComboBox({
				items: [
				new Item({text: "Token 1", key: "token1"}),
				new Item({text: "Token 2", key: "token2"}),
				new Item({text: "Token 3", key: "token3"})
			]
		});

		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate();

		// Act
		oMultiComboBox.setSelectedKeys(["token1"]);
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oMultiComboBox.getDomRef().classList.contains("sapMMultiComboBoxHasToken"), true, "Should contain 'sapMMultiComboBoxHasToken' class when there are tokens");

		// Act
		oMultiComboBox.setSelectedKeys([]);
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oMultiComboBox.getDomRef().classList.contains("sapMMultiComboBoxHasToken"), false, "Should not contain 'sapMMultiComboBoxHasToken' class when there are no tokens");

		// Clean
		oMultiComboBox.destroy();
	});

	QUnit.test("MultiComboBox should have sapMMultiComboBoxHasToken css class when there are selected tokens", async function (assert) {
		// Arrange
		var oModel = new JSONModel({
			"items" : [{
				"key" : "token1"
			}, {
				"key" : "token2"
			}, {
				"key" : "token3"
			}]
		});

		var oMultiComboBox = new MultiComboBox({
			placeholder: "Select parameters",
			items : {
				path : "/items",
				template : new Item({
					key : "{key}",
					text : "{key}"
				})
			}
		});

		oMultiComboBox.placeAt("MultiComboBoxContent");
		oMultiComboBox.setModel(oModel);

		// Act
		oMultiComboBox.setSelectedKeys(["token1"]);
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oMultiComboBox.getDomRef().classList.contains("sapMMultiComboBoxHasToken"), true, "Should contain 'sapMMultiComboBoxHasToken' class when there are tokens");

		// Clean
		oMultiComboBox.destroy();
	});

	QUnit.module("RTL Support");

	QUnit.test("If the sap.ui.core.Item's text direction is set explicitly it should be mapped to the StandardListItem", async function (assert) {
		// Arrange
		var oMultiComboBox = new MultiComboBox({
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
		}).placeAt("MultiComboBoxContent");
		await nextUIUpdate();

		// Act
		oMultiComboBox.open();

		// Assert
		assert.strictEqual(ListHelpers.getListItem(oMultiComboBox.getItems()[0]).getTitleTextDirection(),  "RTL", 'RTL direction is correctly mapped from sap.ui.core.Item to sap.m.StandardListItem');
		assert.strictEqual(ListHelpers.getListItem(oMultiComboBox.getItems()[1]).getTitleTextDirection(), "RTL", 'RTL direction is correctly mapped from sap.ui.core.Item to sap.m.StandardListItem');

		// Clean
		oMultiComboBox.destroy();
	});


	QUnit.module("Range Selection", {
		beforeEach : async function() {
			var aItems = [
				new ListItem({
					key: "GER",
					text: "Germany"
				}),
				new ListItem({
					key: "AR",
					text: "Argentina"
				}),
				new ListItem({
					key: "BG",
					text: "Bulgaria"
				}),
				new ListItem({
					key: "BL",
					text: "Belgium"
				}),
				new ListItem({
					key: "MAD",
					text: "Madagascar"
				}),
				new ListItem({
					key: "SER",
					text: "Serbia"
				})
			];
			this.oMultiComboBox = new MultiComboBox({
				items: aItems
			}).placeAt("MultiComboBoxContent");
			await nextUIUpdate();
		},
		afterEach : function() {
			this.oMultiComboBox.destroy();
		}
	});

	QUnit.test("It should select multiple items", async function (assert) {
		var that = this;
		// Arrange
		var oEventMock = {
			getParameter: function(param) {
				switch (param) {
					case "listItems":
						return [that.oMultiComboBox._getList().getItems()[1], that.oMultiComboBox._getList().getItems()[3], that.oMultiComboBox._getList().getItems()[4]];
					case "listItem":
						return that.oMultiComboBox._getList().getItems()[1];
					case "selectAll":
						return false;
					case "selected":
						return true;
				}
			}
		};

		// Act
		this.oMultiComboBox.open();
		this.oMultiComboBox._setIsClick(true);
		this.oMultiComboBox._handleSelectionLiveChange(oEventMock);

		await nextUIUpdate();

		// Assert
		assert.strictEqual(this.oMultiComboBox.getAggregation("tokenizer").getTokens().length, 3, "3 Tokens must be added");
		assert.strictEqual(this.oMultiComboBox.getSelectedKeys().length, 3, "3 keys must be set as selected");
		assert.strictEqual(this.oMultiComboBox.getAggregation("tokenizer").getTokens()[2].getText(), "Madagascar", "The last token's name is correct");
		assert.strictEqual(this.oMultiComboBox._getList().getItems()[4].getDomRef(), document.activeElement, "The last selected item is focused");
	});


	QUnit.test("Should select all items and add the selectAll param to the event", async function (assert) {
		// Arrange
		var oList, oItemToFocus, oItemDOM;
		var fnFireSelectionChangeSpy = this.spy(this.oMultiComboBox, "fireSelectionChange");

		// Act
		this.oMultiComboBox.open();

		oList = this.oMultiComboBox._getList();
		oItemToFocus = oList.getItems()[0];
		oItemDOM = oItemToFocus.getFocusDomRef();

		oItemToFocus.focus();

		qutils.triggerKeydown(oItemDOM, KeyCodes.A, false, false, true);

		// Assert
		assert.strictEqual(this.oMultiComboBox.getAggregation("tokenizer").getTokens().length, 6, "All Tokens must be added");
		assert.strictEqual(fnFireSelectionChangeSpy.args[0][0].selectAll, true, "All Tokens must be added");
		assert.strictEqual(fnFireSelectionChangeSpy.callCount, 6, "selectionChange must be fired for every selected item");

		fnFireSelectionChangeSpy.restore();
		await nextUIUpdate();
	});

	QUnit.test("Should select only the filtered items when 'select all' is used", async function (assert) {
		// Arrange
		var oList, oItemToFocus, oItemDOM;
		var fnFireSelectionChangeSpy = this.spy(this.oMultiComboBox, "fireSelectionChange");

		// Act
		this.oMultiComboBox._$input.trigger("focus").val("b").trigger("input");

		oList = this.oMultiComboBox._getList();
		oItemToFocus = oList.getItems()[2];
		oItemDOM = oItemToFocus.getFocusDomRef();
		oItemToFocus.focus();

		qutils.triggerKeydown(oItemDOM, KeyCodes.A, false, false, true);

		// Assert
		assert.strictEqual(this.oMultiComboBox._oTokenizer.getTokens().length, 2, "Only the filtered items are selected with select all");
		assert.strictEqual(fnFireSelectionChangeSpy.callCount, 2, "selectionChange must be fired for every selected item");

		fnFireSelectionChangeSpy.restore();
		await nextUIUpdate();
	});

	QUnit.module("selectAll", {
		beforeEach : async function() {
			this.clock = sinon.useFakeTimers();
			this.oMultiComboBox = new MultiComboBox({
				items: [
					new ListItem({
						text: "Hong Kong",
						additionalText: "China"
					}),
					new ListItem({
						text: "Haskovo",
						additionalText: "Bulgaria"
					}),
					new ListItem({
						text: "Baragoi",
						additionalText: "Kenya"
					}),
					new ListItem({
						text: "Brussel",
						additionalText: "Belgium"
					})
				]
			});
			this.oMultiComboBox.placeAt("MultiComboBoxContent");

			await nextUIUpdate(this.clock);
		},
		afterEach : function() {
			this.oMultiComboBox.destroy();
			runAllTimersAndRestore(this.clock);
		}
	});

	QUnit.test("getSelectAllToolbar & getSelectAllCheckbox", async function (assert) {
		// Assert
		assert.notOk(this.oMultiComboBox.getSelectAllToolbar(), "The select all toolbar should not be rendered by default");
		assert.notOk(this.oMultiComboBox.getSelectAllCheckbox(), "The select all checkbox should not be rendered by default");

		this.oMultiComboBox.setShowSelectAll(true);
		await nextUIUpdate(this.clock);

		// Assert
		assert.notOk(this.oMultiComboBox.getSelectAllToolbar(), "The select all toolbar should not be rendered, since the list is not rendered");
		assert.notOk(this.oMultiComboBox.getSelectAllCheckbox(), "The select all checkbox should not be rendered, since the list is not rendered");

		// Act
		this.oMultiComboBox.open();
		this.clock.tick(500);
		await nextUIUpdate(this.clock);

		// Assert
		assert.ok(this.oMultiComboBox.getSelectAllToolbar().hasStyleClass("sapMMultiComboBoxSelectAll"), "The select all checkbox should be rendered");
		assert.ok(this.oMultiComboBox.getSelectAllToolbar(), "The select all toolbar should be rendered");
		assert.ok(this.oMultiComboBox.getSelectAllCheckbox(), "The select all checkbox should be rendered");

		this.oMultiComboBox.setShowSelectAll(false);
		await nextUIUpdate(this.clock);

		// Assert
		assert.notOk(this.oMultiComboBox.getSelectAllToolbar().getVisible(), "The select all toolbar should not be visible, when showSelectAll is false");

		this.oMultiComboBox.setShowSelectAll(true);
		await nextUIUpdate(this.clock);

		// Assert
		assert.ok(this.oMultiComboBox.getSelectAllToolbar().getVisible(), "The select all toolbar should be visible, when showSelectAll is true");
	});

	QUnit.test("Focus handling", async function (assert) {
		// Act
		this.oMultiComboBox.setShowSelectAll(true);
		this.oMultiComboBox.open();
		this.clock.tick(500);

		this.oMultiComboBox.focusSelectAll();
		await nextUIUpdate(this.clock);

		// Assert
		assert.strictEqual(this.oMultiComboBox.getSelectAllCheckbox().getFocusDomRef(), document.activeElement, "The select all checkbox should be focused.");
		assert.ok(this.oMultiComboBox.getSelectAllToolbar().hasStyleClass("sapMMultiComboBoxSelectAllFocused"), "The select all toolbar should have a focus class.");

		// Act
		qutils.triggerKeydown(document.activeElement, KeyCodes.ARROW_DOWN);

		// Assert
		assert.strictEqual(this.oMultiComboBox._getList().getItems()[0].getDomRef(), document.activeElement, "The first item in the list should be focused.");
		assert.notOk(this.oMultiComboBox.getSelectAllToolbar().hasStyleClass("sapMMultiComboBoxSelectAllFocused"), "The select all toolbar should not have a focus class.");
	});

	QUnit.test("Toggle selection", async function (assert) {
		// Act
		this.oMultiComboBox.setShowSelectAll(true);
		this.oMultiComboBox.open();
		this.clock.tick(500);

		this.oMultiComboBox.focusSelectAll();
		await nextUIUpdate(this.clock);

		// Act
		qutils.triggerKeyup(document.activeElement, KeyCodes.SPACE);

		// Assert
		assert.strictEqual(this.oMultiComboBox.getSelectedItems().length, 4, "All list items should be selected");

		// Act
		qutils.triggerKeyup(document.activeElement, KeyCodes.SPACE);

		// Assert
		assert.notOk(this.oMultiComboBox.getSelectedItems().length, "No list items should be selected");
	});

	QUnit.module("Clear icon", {
		beforeEach: function(){
			this.clock = sinon.useFakeTimers();
		},
		afterEach: function(){
			runAllTimersAndRestore(this.clock);
		}
	});

	QUnit.test("Invalidating the MultiComboBox due to clear icon should not change its state", async function (assert) {
		var aItems = [
			new ListItem({
				key: "GER",
				text: "Germany"
			}),
			new ListItem({
				key: "AR",
				text: "Argentina"
			}),
			new ListItem({
				key: "BG",
				text: "Bulgaria"
			}),
			new ListItem({
				key: "BL",
				text: "Belgium"
			}),
			new ListItem({
				key: "MAD",
				text: "Madagascar"
			})
		];
		var oMultiComboBox = new MultiComboBox({
			items: aItems,
			showClearIcon: true
		}).placeAt("MultiComboBoxContent");
		await nextUIUpdate(this.clock);

		// Arrange
		var fnFilterItemsSpy = this.spy(oMultiComboBox, "filterItems");
		var fnHighlighSpy = this.spy(oMultiComboBox, "highlightList");
		var fnBeforeRenderingSpy = this.spy(oMultiComboBox, "onBeforeRendering");

		// Act
		oMultiComboBox._$input.focus().val("b").trigger("input");
		qutils.triggerKeydown(oMultiComboBox.getFocusDomRef(), KeyCodes.b);
		oMultiComboBox.onkeyup();
		await nextUIUpdate(this.clock);
		this.clock.tick(500);

		// Assert
		assert.strictEqual(oMultiComboBox.getVisibleItems().length, 2, "Only the filtered items are shown");
		assert.strictEqual(fnBeforeRenderingSpy.called, true, "onBeforeRendering was called");
		assert.strictEqual(fnFilterItemsSpy.called, true, "filterItems must be called");
		assert.strictEqual(fnHighlighSpy.called, true, "highlightList must be called");

		// Clean
		fnFilterItemsSpy.restore();
		fnHighlighSpy.restore();
		fnFilterItemsSpy.restore();
		oMultiComboBox.destroy();
	});

	QUnit.test("'handleClearIconPress' should call clear the value and call setProperty", async function(assert) {
		// Arrange
		var oMultiComboBox = new MultiComboBox({
			showClearIcon: true,
			value: "test"
		});
		var oSetValueSpy, oSetPropertySpy;

		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate(this.clock);

		oSetValueSpy = this.spy(oMultiComboBox, "setValue");
		oSetPropertySpy = this.spy(oMultiComboBox, "setProperty");

		// Act
		oMultiComboBox.handleClearIconPress();
		await nextUIUpdate(this.clock);

		// Assert
		assert.strictEqual(oSetValueSpy.calledWith(""), true, "setValue was called with the correct parameters");
		assert.strictEqual(oSetPropertySpy.calledWith('effectiveShowClearIcon', false), true, "setProperty was called with the correct parameters");
		assert.strictEqual(oMultiComboBox._sOldInput, "", "_sOldInput was reset to empty string");

		// Clean
		oSetValueSpy.restore();
		oSetPropertySpy.restore();
		oMultiComboBox.destroy();
	});

	QUnit.test("'handleClearIconPress' should not do anything when control is disabled", async function(assert) {
		// Arrange
		var oMultiComboBox = new MultiComboBox({
			showClearIcon: true,
			value: "test",
			enabled: false
		});
		var oSetPropertySpy;

		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate(this.clock);

		oSetPropertySpy = this.spy(oMultiComboBox, "setProperty");

		// Act
		oMultiComboBox.handleClearIconPress();
		await nextUIUpdate(this.clock);

		// Assert
		assert.strictEqual(oSetPropertySpy.calledWith('effectiveShowClearIcon', false), false, "setProperty was called with the correct parameters");

		// Arrange
		oMultiComboBox.setEnabled(true);
		oMultiComboBox.setEditable(false);
		await nextUIUpdate(this.clock);
		oSetPropertySpy.resetHistory();

		// Act
		oMultiComboBox.handleClearIconPress();
		await nextUIUpdate(this.clock);

		// Assert
		assert.strictEqual(oSetPropertySpy.calledWith('effectiveShowClearIcon', false), false, "setProperty was called with the correct parameters");

		// Clean
		oSetPropertySpy.restore();
		oMultiComboBox.destroy();
	});

	QUnit.test("Clear icon should clear the filter and close the suggestion dropdown when open while entering value", async function(assert) {
		// Arrange
		var oMultiComboBox = new MultiComboBox({
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

		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate(this.clock);

		// Act
		oMultiComboBox.focus();
		oMultiComboBox.getFocusDomRef().value = "A";
		qutils.triggerEvent("input", oMultiComboBox.getFocusDomRef());


		// Assert
		assert.ok(oMultiComboBox.isOpen(), "MultiComboBox is open");
		assert.strictEqual(ListHelpers.getVisibleItems(oMultiComboBox.getItems()).length, 3, "The items are filtered");

		// Act
		oMultiComboBox.handleClearIconPress();
		await nextUIUpdate(this.clock);

		// Assert
		assert.notOk(oMultiComboBox.isOpen(), "MultiComboBox is closed");
		assert.strictEqual(ListHelpers.getVisibleItems(oMultiComboBox.getItems()).length, 4, "The items are filtered");

		// Clean
		oMultiComboBox.destroy();
	});

	QUnit.test("Clear icon should clear the filter and close the suggestion dropdown when open while entering value", async function(assert) {
		// Arrange
		var oMultiComboBox = new MultiComboBox({
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

		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate(this.clock);

		// Act
		oMultiComboBox.focus();
		qutils.triggerKeydown(oMultiComboBox.getFocusDomRef(), KeyCodes.F4);
		oMultiComboBox.getFocusDomRef().value = "A";
		qutils.triggerEvent("input", oMultiComboBox.getFocusDomRef());


		// Assert
		assert.ok(oMultiComboBox.isOpen(), "MultiComboBox is open");
		assert.strictEqual(ListHelpers.getVisibleItems(oMultiComboBox.getItems()).length, 3, "The items are filtered");

		// Act
		oMultiComboBox.handleClearIconPress();
		await nextUIUpdate(this.clock);

		// Assert
		assert.ok(oMultiComboBox.isOpen(), "MultiComboBox remains open");
		assert.strictEqual(ListHelpers.getVisibleItems(oMultiComboBox.getItems()).length, 4, "The items are filtered");

		// Clean
		oMultiComboBox.destroy();
	});

	QUnit.test("Clear icon not be displayed initially if 'selectedKey' is declared before the suggestion items and there is a value initially set", async function(assert) {
		// Arrange
		var oMultiComboBox = new MultiComboBox({
			showClearIcon: true,
			selectedKeys: ["AG"],
			value: "Algeria",
			items: [
				new Item({
					text: "Algeria"
				}),

				new Item({
					text: "Argentina",
					key: "AG"

				}),
				new Item({
					text: "Australia"
				}),

				new Item({
					text: "Germany"
				})
			]
		});

		oMultiComboBox.placeAt("MultiComboBoxContent");
		await nextUIUpdate(this.clock);

		// Act
		assert.strictEqual(oMultiComboBox._getClearIcon().getVisible(), false, "The clear icon is hidden");

		// Clean
		oMultiComboBox.destroy();
	});

	QUnit.test("The tokens are rendered in in the order they have been added in selectedKey after opening the picker", async function (assert) {
		var aTokens,
			aItems = [
				new Item({ text: "Item A", key: "A" }),
				new Item({ text: "Item B", key: "B" }),
				new Item({ text: "Item C", key: "C" }),
				new Item({ text: "Item D", key: "D" }),
				new Item({ text: "Item E", key: "E" })
			], oMCB = new MultiComboBox({
				width: "20rem",
				items: aItems,
				selectedKeys: ["D", "A", "E"]
			});

		oMCB.placeAt("MultiComboBoxContent");
		await nextUIUpdate(this.clock);

		this.clock.tick();

		oMCB.open();

		aTokens = oMCB.getAggregation("tokenizer").getTokens();

		assert.equal(aTokens[0].getKey(), "D", "The first token is D");
		assert.equal(aTokens[1].getKey(), "A", "The second token is A");
		assert.equal(aTokens[2].getKey(), "E", "The third token is E");

		// clean up
		oMCB.destroy();

		await nextUIUpdate(this.clock);
	});

	QUnit.test("The tokens are rendered in the order they have been added in selectectedItems after opening the picker", async function (assert) {
		var items = [new Item({
			text : "Algeria"
		}), new Item({
			text : "Bulgaria"
		}), new Item({
			text : "Canada"
		}), new Item({
			text : "Denmark"
		}), new Item({
			text : "Estonia"
		})];

		var aSelection = [items[0], items[4], items[2], items[3], items[1]];
		var aSelectedCountries = aSelection.map(function (itm) { return itm.getText(); });
		var oMCB = new MultiComboBox({
			items : items,
			selectedItems : aSelection
			});

		oMCB.placeAt("MultiComboBoxContent");
		await nextUIUpdate(this.clock);

		this.clock.tick();

		oMCB.open();

		var aTokens = oMCB.getAggregation("tokenizer").getTokens();
		for (var i = 0; i < aTokens.length;  i++) {
			assert.equal(aTokens[i].getText(), aSelectedCountries[i], "The txt of the item " + i + " should be " + aSelection[i].getText());
		}

		// clean up
		oMCB.destroy();

		await nextUIUpdate(this.clock);
	});

	QUnit.test("The order of selected items (tokens) from the user is preserved after re-opening the picker", async function (assert) {
		var selection = [4, 3, 2, 1, 0];
		var aTokens,
			aItems = [
				new Item({ text: "Item A", key: '' }),
				new Item({ text: "Item B", key:'Y' }),
				new Item({ text: "Item C" }),
				new Item({ text: "Item D", key:'X' }),
				new Item({ text: "Item E", key: null})
			], oMCB = new MultiComboBox({
				width: "20rem",
				items: aItems
			});

		oMCB.placeAt("MultiComboBoxContent");
		await nextUIUpdate(this.clock);

		this.clock.tick();

		oMCB.open();
		this.clock.tick();

		selection.forEach(function (iPosition) {
			oMCB._getList().setSelectedItem(oMCB._getList().getItems()[iPosition], true, true);
			this.clock.tick(500);
		}.bind(this));

		await nextUIUpdate(this.clock);
		this.clock.tick();

		aTokens = oMCB.getAggregation("tokenizer").getTokens();

		selection.forEach(function(iPosition, iIndex) {
			assert.equal(aTokens[iIndex].getText(), aItems[iPosition].getText(), "Before close: The token is " + aItems[iPosition].getText());
		});

		oMCB.close();
		await nextUIUpdate(this.clock);
		this.clock.tick();

		selection.forEach(function(iPosition, iIndex) {
			assert.equal(aTokens[iIndex].getText(), aItems[iPosition].getText(), "After close: The token is " + aItems[iPosition].getText());
		});

		// clean up
		oMCB.destroy();

		await nextUIUpdate(this.clock);
	});
});
