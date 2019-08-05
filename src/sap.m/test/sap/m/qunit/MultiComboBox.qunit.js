/*global QUnit, sinon */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/MultiComboBox",
	"sap/ui/core/Item",
	"sap/ui/model/json/JSONModel",
	"sap/m/ComboBoxBaseRenderer",
	"sap/ui/Device",
	"jquery.sap.mobile",
	"sap/ui/core/library",
	"sap/m/InputBase",
	"sap/ui/base/Event",
	"sap/base/Log",
	"sap/ui/events/KeyCodes",
	"sap/m/MultiComboBoxRenderer",
	"sap/m/Button",
	"sap/m/Tokenizer",
	"sap/ui/model/SimpleType",
	"sap/ui/core/ListItem",
	"sap/m/ComboBoxBase",
	"sap/ui/core/SeparatorItem"
], function(
	qutils,
	createAndAppendDiv,
	MultiComboBox,
	Item,
	JSONModel,
	ComboBoxBaseRenderer,
	Device,
	jQuery,
	coreLibrary,
	InputBase,
	Event,
	Log,
	KeyCodes,
	MultiComboBoxRenderer,
	Button,
	Tokenizer,
	SimpleType,
	ListItem,
	ComboBoxBase,
	SeparatorItem
) {
	// shortcut for sap.ui.core.OpenState
	var OpenState = coreLibrary.OpenState;

	createAndAppendDiv("MultiComboBox-content").setAttribute("class", "select-content");



	var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");

	// =========================================================== //
	// Check UX requirements on                                    //
	// =========================================================== //

	// =========================================================== //
	// API module                                                  //
	// =========================================================== //

	QUnit.module("API");

	// ------------------------------ //
	// tests for default values       //
	// ------------------------------ //
	QUnit.test("constructor - items : []", function(assert) {

		// system under test
		var oMultiComboBox = new MultiComboBox({
			items : []
		});

		// arrange
		//oMultiComboBox.placeAt("MultiComboBox-content");
		//sap.ui.getCore().applyChanges();

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

	QUnit.test("constructor - items : [aItems]", function(assert) {

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
		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();
		sap.ui.getCore().applyChanges();

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
				oMultiComboBox.destroy();
			});

	QUnit.test("constructor - selectedItems : [Item], items : [Item], removeSelectedKey programatically - check fired events",
			function(assert) {

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
				oMultiComboBox.removeSelectedKeys(["0"]);

				// assertions
				assert.strictEqual(fnFireSelectionChangeSpy.callCount, 0, "The change event was not fired");
				assert.strictEqual(fnFireSelectionFinishSpy.callCount, 0, "The selection finish event was not fired");
				assert.deepEqual(oMultiComboBox.getSelectedKeys(), []);
				assert.deepEqual(oMultiComboBox.getSelectedItems(), []);

				// cleanup
				oMultiComboBox.destroy();
	});

	QUnit.test("constructor - selectedItems : [Item], items : [Item], removeSelectedKey via UI - check fired events",
		function(assert) {

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
			oMultiComboBox.placeAt("MultiComboBox-content");
			sap.ui.getCore().applyChanges();

			var fnFireSelectionChangeSpy = this.spy(oMultiComboBox, "fireSelectionChange");

			// act
			sap.ui.test.qunit.triggerCharacterInput(oMultiComboBox.getFocusDomRef(), "Algeria");
			sap.ui.test.qunit.triggerKeydown(oMultiComboBox.getDomRef(), KeyCodes.ENTER); //onsapenter

			// assertions
			assert.strictEqual(fnFireSelectionChangeSpy.callCount, 1, "The selection change event was fired");
			assert.strictEqual(fnFireSelectionChangeSpy.args[0][0].changedItem, oMultiComboBox.getSelectedItems()[0],
					"The selection change event parameter was passed");

			// cleanup
			oMultiComboBox.destroy();
	});

	QUnit.test("constructor, check selectedKeys - items:[Items]", function(assert) {

		// system under test
		var oItem0, oItem1, oItem2;
		var oMultiComboBox = new MultiComboBox({
			items : [
			oItem0 = new Item({
				key : "0",
				text : "item 0"
			}),

			oItem1 = new Item({
				key : "1",
				text : "item 1"
			}),

			oItem2 = new Item({
				key : "2",
				text : "item 2"
			}),

			oItem3 = new Item({
				key : "",
				text : "item 3"
			})
			]
		});

		// assertions
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), []);
		assert.deepEqual(oMultiComboBox.getSelectedItems(), []);

		oMultiComboBox.setSelectedKeys(["0"]);
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), ["0"]);
		assert.deepEqual(oMultiComboBox.getSelectedItems(), [oItem0]);
		assert.deepEqual(oItem0.data(ComboBoxBaseRenderer.CSS_CLASS_COMBOBOXBASE + "Token"), oMultiComboBox._getTokenByItem(oItem0));
		assert.deepEqual(oItem1.data(ComboBoxBaseRenderer.CSS_CLASS_COMBOBOXBASE + "Token"), null);
		assert.deepEqual(oItem2.data(ComboBoxBaseRenderer.CSS_CLASS_COMBOBOXBASE + "Token"), null);

		oMultiComboBox.setSelectedKeys(["0", "1"]);
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), ["0", "1"]);
		assert.deepEqual(oMultiComboBox.getSelectedItems(), [oItem0, oItem1]);
		assert.deepEqual(oItem0.data(ComboBoxBaseRenderer.CSS_CLASS_COMBOBOXBASE + "Token"), oMultiComboBox._getTokenByItem(oItem0));
		assert.deepEqual(oItem1.data(ComboBoxBaseRenderer.CSS_CLASS_COMBOBOXBASE + "Token"), oMultiComboBox._getTokenByItem(oItem1));
		assert.deepEqual(oItem2.data(ComboBoxBaseRenderer.CSS_CLASS_COMBOBOXBASE + "Token"), null);

		oMultiComboBox.setSelectedKeys(null); // enforce default value
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), []);
		assert.deepEqual(oMultiComboBox.getSelectedItems(), []);
		assert.deepEqual(oItem0.data(ComboBoxBaseRenderer.CSS_CLASS_COMBOBOXBASE + "Token"), null);
		assert.deepEqual(oItem1.data(ComboBoxBaseRenderer.CSS_CLASS_COMBOBOXBASE + "Token"), null);
		assert.deepEqual(oItem2.data(ComboBoxBaseRenderer.CSS_CLASS_COMBOBOXBASE + "Token"), null);

		oMultiComboBox.setSelectedKeys(["0"]);
		oMultiComboBox.setSelectedKeys(["dummy"]);
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), ["dummy"]);
		assert.deepEqual(oMultiComboBox.getSelectedItems(), []);
		assert.deepEqual(oItem0.data(ComboBoxBaseRenderer.CSS_CLASS_COMBOBOXBASE + "Token"), null);
		assert.deepEqual(oItem1.data(ComboBoxBaseRenderer.CSS_CLASS_COMBOBOXBASE + "Token"), null);
		assert.deepEqual(oItem2.data(ComboBoxBaseRenderer.CSS_CLASS_COMBOBOXBASE + "Token"), null);

		oMultiComboBox.setSelectedKeys(["0"]);
		oMultiComboBox.setSelectedKeys([""]);
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), [""]);
		assert.deepEqual(oMultiComboBox.getSelectedItems(), [oItem3]);
		assert.deepEqual(oItem0.data(ComboBoxBaseRenderer.CSS_CLASS_COMBOBOXBASE + "Token"), null);
		assert.deepEqual(oItem1.data(ComboBoxBaseRenderer.CSS_CLASS_COMBOBOXBASE + "Token"), null);
		assert.deepEqual(oItem2.data(ComboBoxBaseRenderer.CSS_CLASS_COMBOBOXBASE + "Token"), null);

		oMultiComboBox.setSelectedKeys(["0", "1"]);
		oMultiComboBox.removeSelectedKeys(["1"]);
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), ["0"]);
		assert.deepEqual(oMultiComboBox.getSelectedItems(), [oItem0]);
		assert.deepEqual(oItem0.data(ComboBoxBaseRenderer.CSS_CLASS_COMBOBOXBASE + "Token"), oMultiComboBox._getTokenByItem(oItem0));
		assert.deepEqual(oItem1.data(ComboBoxBaseRenderer.CSS_CLASS_COMBOBOXBASE + "Token"), null);
		assert.deepEqual(oItem2.data(ComboBoxBaseRenderer.CSS_CLASS_COMBOBOXBASE + "Token"), null);

		oMultiComboBox.removeSelectedKeys(["dummy"]);
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), ["0"]);
		assert.deepEqual(oMultiComboBox.getSelectedItems(), [oItem0]);
		assert.deepEqual(oItem0.data(ComboBoxBaseRenderer.CSS_CLASS_COMBOBOXBASE + "Token"), oMultiComboBox._getTokenByItem(oItem0));
		assert.deepEqual(oItem1.data(ComboBoxBaseRenderer.CSS_CLASS_COMBOBOXBASE + "Token"), null);
		assert.deepEqual(oItem2.data(ComboBoxBaseRenderer.CSS_CLASS_COMBOBOXBASE + "Token"), null);

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

	QUnit.test("method: xxxMaxWidth() - maxWidth", function(assert) {

		// system under test
		var oMultiComboBox = new MultiComboBox({
			items : [new Item({
				key : "0",
				text : "item 0"
			})],
			maxWidth : "300px"
		});

		// arrange
		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();

		// assertions
		assert.strictEqual(oMultiComboBox.getMaxWidth(), "300px");
		assert.strictEqual(oMultiComboBox.getDomRef().style.maxWidth, "300px");

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("method: xxxMaxWidth() - maxWidth", function(assert) {

		// system under test
		var oMultiComboBox = new MultiComboBox();

		// arrange
		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();

		// act
		oMultiComboBox.setMaxWidth("30%");
		sap.ui.getCore().applyChanges();

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
		var oItem;
		var oMultiComboBox = new MultiComboBox({
			items : [oItem = new Item({
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
		//oMultiComboBox.placeAt("MultiComboBox-content");
		//sap.ui.getCore().applyChanges();

		// assertions
		assert.deepEqual(oMultiComboBox.getSelectedItems(), [oItem]);
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), [oItem.getKey()]);

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("method: getSelectedXXX() - selectedItems : [dummy], items : [Items]", function(assert) {

		// system under test
		var oItem;
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
		//oMultiComboBox.placeAt("MultiComboBox-content");
		//sap.ui.getCore().applyChanges();

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

	QUnit.test("method: addItem() - with key and text", function(assert) {

		// system under test
		var oMultiComboBox = new MultiComboBox();

		// arrange
		var fnAddAggregationSpy = this.spy(oMultiComboBox, "addAggregation");
		var fnListAddAggregationSpy = this.spy(oMultiComboBox.getList(), "addAggregation");
		var fnAddItemSpy = this.spy(oMultiComboBox, "addItem");
		var oItem = new Item({
			key : "0",
			text : "item 0"
		});

		// act
		oMultiComboBox.addItem(oItem);

		// assertions
		assert.ok(fnAddAggregationSpy.calledWith("items", oItem),
				"sap.m.MultiComboBox.addAggregation() method was called with the expected arguments");
		assert.ok(fnListAddAggregationSpy.calledWith("items", oMultiComboBox.getListItem(oItem)),
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

	QUnit.test("method: addItem() - with text", function(assert) {

		// system under test
		var oMultiComboBox = new MultiComboBox();

		// arrange
		var fnAddAggregationSpy = this.spy(oMultiComboBox, "addAggregation");
		var fnListAddAggregationSpy = this.spy(oMultiComboBox.getList(), "addAggregation");
		var fnAddItemSpy = this.spy(oMultiComboBox, "addItem");
		var oItem = new Item({
			text : "item 0"
		});

		// act
		oMultiComboBox.addItem(oItem);

		// assertions
		assert.ok(fnAddAggregationSpy.calledWith("items", oItem),
				"sap.m.MultiComboBox.addAggregation() method was called with the expected arguments");
		assert.ok(fnListAddAggregationSpy.calledWith("items", oMultiComboBox.getListItem(oItem)),
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

	QUnit.test("method: addItem()", function(assert) {

		// system under test
		var oMultiComboBox = new MultiComboBox();

		// arrange
		var fnAddAggregationSpy = this.spy(oMultiComboBox, "addAggregation");
		var fnListAddAggregationSpy = this.spy(oMultiComboBox.getList(), "addAggregation");
		var fnAddItemSpy = this.spy(oMultiComboBox, "addItem");
		var oItem = new Item();

		// act
		oMultiComboBox.addItem(oItem);

		// assertions
		assert.ok(fnAddAggregationSpy.calledWith("items", oItem),
				"sap.m.MultiComboBox.addAggregation() method was called with the expected arguments");
		assert.ok(fnListAddAggregationSpy.calledWith("items", oMultiComboBox.getListItem(oItem)),
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

	QUnit.test("method: addItem() - twice", function(assert) {

		// system under test
		var oMultiComboBox = new MultiComboBox();

		// arrange
		var fnAddAggregationSpy = this.spy(oMultiComboBox, "addAggregation");
		var fnListAddAggregationSpy = this.spy(oMultiComboBox.getList(), "addAggregation");
		var fnAddItemSpy = this.spy(oMultiComboBox, "addItem");
		var oItem = new Item({
			key : "0",
			text : "item 0"
		});

		// act
		oMultiComboBox.addItem(oItem);
		oMultiComboBox.addItem(oItem);

		// assertions
		assert.ok(fnAddAggregationSpy.calledWith("items", oItem),
				"sap.m.MultiComboBox.addAggregation() method was called with the expected arguments");
		assert.ok(fnListAddAggregationSpy.calledWith("items", oMultiComboBox.getListItem(oItem)),
				"sap.m.List.addAggregation() method was called with the expected arguments");
		assert.ok(fnAddItemSpy.returned(oMultiComboBox));
		assert.deepEqual(oMultiComboBox.getAggregation("items"), [oItem]);
		assert.deepEqual(oMultiComboBox.getItems(), [oItem]);
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), []);
		assert.deepEqual(oMultiComboBox.getSelectedItems(), []);

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("method: addItem(null)", function(assert) {

		// system under test
		var oMultiComboBox = new MultiComboBox();

		// arrange
		var fnAddAggregationSpy = this.spy(oMultiComboBox, "addAggregation");
		var fnListAddAggregationSpy = this.spy(oMultiComboBox.getList(), "addAggregation");
		var fnAddItemSpy = this.spy(oMultiComboBox, "addItem");

		// act
		oMultiComboBox.addItem(null);

		// assertions
		assert.ok(fnAddAggregationSpy.calledWith("items", null),
				"sap.m.MultiComboBox.addAggregation() method was called with the expected arguments");
		assert.ok(fnListAddAggregationSpy.calledWith("items", null),
				"sap.m.List.addAggregation() method was called with the expected arguments");
		assert.ok(fnAddItemSpy.returned(oMultiComboBox));
		assert.deepEqual(oMultiComboBox.getAggregation("items"), null);
		assert.deepEqual(oMultiComboBox.getItems(), []);
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), []);
		assert.deepEqual(oMultiComboBox.getSelectedItems(), []);

		// cleanup
		oMultiComboBox.destroy();
	});

	// ------------------------------ //
	// removeXXX                      //
	// ------------------------------ //
	QUnit.test("method: removeItem(oItem)", function(assert) {

		// system under test
		var oItem, oItemRemoved;
		var oMultiComboBox = new MultiComboBox({
			items : [oItem = new Item()],
			selectedItems : [oItem]
		});

		// arrange

		// act
		oItemRemoved = oMultiComboBox.removeItem(oItem);

		// assertions
		assert.strictEqual(oItemRemoved, oItem);
		assert.deepEqual(oMultiComboBox.getAggregation("items"), []);
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), []);
		assert.deepEqual(oMultiComboBox.getSelectedItems(), []);
		assert.deepEqual(oMultiComboBox._oTokenizer.getTokens(), []);

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
		assert.deepEqual(oMultiComboBox._oTokenizer.getTokens(), [oMultiComboBox._getTokenByItem(oItem)]);

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
		assert.deepEqual(oMultiComboBox._oTokenizer.getTokens(), [oMultiComboBox._getTokenByItem(oItem)]);

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("method: removeAllItems()", function(assert) {

		// system under test
		var oItem, aItems;
		var oMultiComboBox = new MultiComboBox({
			items : [oItem = new Item()],
			selectedItems : [oItem]
		});

		// arrange

		// act
		aItems = oMultiComboBox.removeAllItems();

		// assertions
		assert.deepEqual(aItems, [oItem]);
		assert.deepEqual(oMultiComboBox.getAggregation("items"), []);
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), []);
		assert.deepEqual(oMultiComboBox.getSelectedItems(), []);
		assert.deepEqual(oMultiComboBox._oTokenizer.getTokens(), []);

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
		assert.deepEqual(oMultiComboBox._oTokenizer.getTokens(), []);

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
		assert.deepEqual(oMultiComboBox._oTokenizer.getTokens(), [oMultiComboBox._getTokenByItem(oItem)]);

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
		assert.deepEqual(oMultiComboBox._oTokenizer.getTokens(), [oMultiComboBox._getTokenByItem(oItem)]);

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
		assert.deepEqual(oMultiComboBox._oTokenizer.getTokens(), []);

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
		assert.deepEqual(oMultiComboBox._oTokenizer.getTokens(), []);

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
		assert.deepEqual(oMultiComboBox._oTokenizer.getTokens(), []);

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("method: clearSelection()", function(assert) {

		// system under test
		var oItem;
		var oMultiComboBox = new MultiComboBox({
			items : [oItem = new Item()],
			selectedItems : [oItem]
		});

		// arrange

		// act
		oMultiComboBox.clearSelection();

		// assertions
		assert.deepEqual(oMultiComboBox.getSelectedItems(), []);
		assert.deepEqual(oMultiComboBox.getAggregation("items"), [oItem]);
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), []);
		assert.deepEqual(oMultiComboBox.getSelectedItems(), []);
		assert.deepEqual(oMultiComboBox._oTokenizer.getTokens(), []);

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("method: destroyItems()", function(assert) {

		// system under test
		var oItem;
		var oMultiComboBox = new MultiComboBox({
			items : [oItem = new Item()],
			selectedItems : [oItem]
		});

		// arrange

		// act
		oMultiComboBox.destroyItems();

		// assertions
		assert.deepEqual(oMultiComboBox.getItems(), []);
		assert.deepEqual(oMultiComboBox.getAggregation("items"), []);
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), []);
		assert.deepEqual(oMultiComboBox.getSelectedItems(), []);
		assert.deepEqual(oMultiComboBox._oTokenizer.getTokens(), []);

		// cleanup
		oMultiComboBox.destroy();
	});

	// ------------------------------ //
	// insertItem                     //
	// ------------------------------ //

	QUnit.test("method: insertItem()", function(assert) {

		// system under test
		var oMultiComboBox = new MultiComboBox();

		// arrange
		var fnInsertAggregation = this.spy(oMultiComboBox, "insertAggregation");
		var fnListInsertAggregation = this.spy(oMultiComboBox.getList(), "insertAggregation");
		var fnInsertItem = this.spy(oMultiComboBox, "insertItem");
		var oItem = new Item({
			key : "0",
			text : "item 0"
		});

		// act
		oMultiComboBox.insertItem(oItem, 0);

		// assertions
		assert.ok(fnInsertAggregation.calledWith("items", oItem, 0),
				"oMultiComboBox.insertAggregation() method was called with the expected arguments");
		assert.ok(fnListInsertAggregation.calledWith("items", oMultiComboBox.getListItem(oItem), 0),
				"oList.insertAggregation() method was called with the expected arguments");
		assert.ok(fnInsertItem.returned(oMultiComboBox), 'oMultiComboBox.insertAggregation() method return the "this" reference');

		// cleanup
		oMultiComboBox.destroy();
	});

	//------------------------------ //
	// _isListInSuggestMode          //
	// ------------------------------ //

	QUnit.test("method: _isListInSuggestMode - complete list", function(assert) {

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
		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();

		// act
		oMultiComboBox.open();
		this.clock.tick(500);

		// assertions
		assert.ok(!oMultiComboBox._isListInSuggestMode(), 'Complete list is displayed');

		// cleanup
		oMultiComboBox.destroy();
		this.clock.reset();
	});

	QUnit.test("method: _isListInSuggestMode complete list with disabled item", function(assert) {

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
		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();

		// act
		oMultiComboBox.open();
		this.clock.tick(500);

		// assertions
		assert.ok(!oMultiComboBox._isListInSuggestMode(), 'Complete list is displayed');

		// cleanup
		oMultiComboBox.destroy();
		this.clock.reset();
	});

	QUnit.test("method: _isListInSuggestMode suggest list", function(assert) {

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
		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();

		// act
		oMultiComboBox.getListItem(oMultiComboBox.getFirstItem()).setVisible(false);
		oMultiComboBox.open();
		this.clock.tick(500);

		// assertions
		assert.ok(oMultiComboBox._isListInSuggestMode(), 'Suggest list is displayed');

		// cleanup
		oMultiComboBox.destroy();
		this.clock.reset();
	});

	QUnit.test("method: _isListInSuggestMode suggest list with disabled item", function(assert) {

		// system under test
		var oItem1, oItem2, oItem3;
		var oMultiComboBox = new MultiComboBox({
			items : [oItem1 = new Item({
				text : "item1"
			}), oItem2 = new Item({
				text : "item2",
				enabled : false
			}), oItem3 = new Item({
				text : "item3"
			})]
		});

		// arrange
		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();

		// act
		oMultiComboBox.getListItem(oMultiComboBox.getFirstItem()).setVisible(false);
		oMultiComboBox.open();
		this.clock.tick(500);

		// assertions
		assert.ok(oMultiComboBox._isListInSuggestMode(), 'Suggest list is displayed');

		// cleanup
		oMultiComboBox.destroy();
		this.clock.reset();
	});

	// ------------------------------ //
	// setSelectedItems()              //
	// ------------------------------ //

	QUnit.test("method: setSelectedItems() - [null] : should give an warning when called with faulty parameter", function(assert) {
		assert.ok(Log, "Log module should be available");

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

	QUnit.test("method: setSelectedItems() - [two items with same text] : should take over", function(assert) {

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
		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();

		// assertions
		assert.deepEqual(oMultiComboBox.getSelectedItems(), [oItem1, oItem2], "Should have both items");
		assert.strictEqual(oMultiComboBox._oTokenizer.getTokens().length, 2, "should have two item");

		// cleanup
		oMultiComboBox.destroy();
	});
	QUnit.test("method: setSelectedKeys() - {} : should give an warning when called with faulty parameter", function(assert) {
		assert.ok(Log, "Log module should be available");

		// system under test
		var oMultiComboBox = new MultiComboBox();

		// arrange
		var fnSetPropertySpy = this.spy(oMultiComboBox, "setProperty");
		var fnSetAssociationSpy = this.spy(oMultiComboBox, "setAssociation");
		var fnFireChangeSpy = this.spy(oMultiComboBox, "fireChange");
		var fnSetSelectedKeysSpy = this.spy(oMultiComboBox, "setSelectedKeys");

		// act
		oMultiComboBox.setSelectedKeys(null);

		// assertions
		assert.strictEqual(fnSetPropertySpy.callCount, 0, "sap.m.MultiComboBox.prototype.setProperty() method was not called");
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

		//sap.ui.getCore().applyChanges();
		//assert.strictEqual(oMultiComboBox.getValue(), "item 1");

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("Firing event: setSelectedItems() set the selected item when the MultiComboBox popup menu is open", function(assert) {

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
		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();

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

	QUnit.test("constructor - items:[] selectedKeys[sKey] - addItem(oItem)", function(assert) {

		// system under test
		var oItem;
		var oMultiComboBox = new MultiComboBox({
			items : []
		});
		oMultiComboBox.setSelectedKeys(["01"]);

		// arrange
		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();
		oMultiComboBox.addItem(oItem = new Item({
			key : "01",
			text : "selected item"
		}));
		oMultiComboBox.addItem(new Item({
			key : "02",
			text : "item"
		}));
		sap.ui.getCore().applyChanges();

		// assertions
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), ["01"]);
		assert.deepEqual(oMultiComboBox.getSelectedItems(), [oItem]);

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("constructor - items:[] selectedItems[oItem] selectedKeys[sKey] - addItem(oItem)", function(assert) {

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
		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();
		oMultiComboBox.addItem(oItem1);
		oMultiComboBox.addItem(oItem2 = new Item({
			key : "02",
			text : "selected item"
		}));
		sap.ui.getCore().applyChanges();

		// assertions
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), ["01", "02"]);
		assert.deepEqual(oMultiComboBox.getSelectedItems(), [oItem1, oItem2]);

		// cleanup
		oMultiComboBox.destroy();
	});

	// BCP 0020079747 0000613914 2015
	QUnit.test("it should not throw an exception, when the undefined value is passed in as an argument to the addSelectedKeys() method", function(assert) {

		// system under test
		var oMultiComboBox = new MultiComboBox();

		// act
		var aKeys = oMultiComboBox.addSelectedKeys(undefined);

		// assert
		assert.ok(Array.isArray(oMultiComboBox.getSelectedKeys()));

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("constructor - binding", function(assert) {

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
		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();

		// act
		sap.ui.test.qunit.triggerCharacterInput(oMultiComboBox.getFocusDomRef(), "Algeria");
		sap.ui.test.qunit.triggerKeydown(oMultiComboBox.getDomRef(), KeyCodes.ENTER); //onsapenter

		// assertions
		assert.deepEqual(oModel.getData().selected, ["AR", "BH", "AL"]);

		// cleanup
		oMultiComboBox.destroy();
		oModel.destroy();
	});

	QUnit.test("constructor - binding - destroyItems", function(assert) {

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
		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();

		// act
		oMultiComboBox.destroyItems();

		// assertions
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), []);

		// cleanup
		oMultiComboBox.destroy();
		oModel.destroy();
	});

	QUnit.test("constructor - selectedItems : [Item], items : [Item], removeSelectedKey via UI - check fired events",
		function(assert) {

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
			oMultiComboBox.placeAt("MultiComboBox-content");
			sap.ui.getCore().applyChanges();

			var fnFireSelectionChangeSpy = this.spy(oMultiComboBox, "fireSelectionChange");
			var fnFireSelectionFinishSpy = this.spy(oMultiComboBox, "fireSelectionFinish");

			// act
			sap.ui.test.qunit.triggerCharacterInput(oMultiComboBox.getFocusDomRef(), "Algeria");
			sap.ui.test.qunit.triggerKeydown(oMultiComboBox.getDomRef(), KeyCodes.ENTER); //onsapenter

			// assertions
			assert.strictEqual(fnFireSelectionChangeSpy.callCount, 1, "The selection change event was fired");
			assert.strictEqual(fnFireSelectionFinishSpy.callCount, 1, "The selection change event was fired");
			assert.strictEqual(fnFireSelectionChangeSpy.args[0][0].changedItem, oMultiComboBox.getSelectedItems()[0],
					"The selection change event parameter was passed");
			assert.strictEqual(fnFireSelectionChangeSpy.args[0][0].selected, true,
					"The selection change event parameter was passed");
			assert.deepEqual(fnFireSelectionFinishSpy.args[0][0].selectedItems, oMultiComboBox.getSelectedItems());

			// cleanup
			oMultiComboBox.destroy();
	});

	//------------------------------ //
	// _getXXXVisibleItemOf          //
	// ----------------------------- //
	QUnit.test("_getNextVisibleItemOf", function(assert) {

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
		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();

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

	QUnit.test("_getPreviousVisibleItemOf", function(assert) {

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
		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();

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
			function(assert) {

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
				oMultiComboBox.placeAt("MultiComboBox-content");
				sap.ui.getCore().applyChanges();
				oMultiComboBox.open();
				this.clock.tick(500);

				// assertions
				assert.equal(oMultiComboBox.getList().$().find("#" + oMultiComboBox.getListItem(oItem1).getId()).length, 0,
						'The first Listitem should not be shown');
				assert.equal(oMultiComboBox.getList().$().find("#" + oMultiComboBox.getListItem(oItem2).getId()).length, 1,
						'The second Listitem should be shown');
				assert.equal(oMultiComboBox.getList().$().find("#" + oMultiComboBox.getListItem(oItem3).getId()).length, 1,
						'The third Listitem should be shown');
				assert.ok(!oMultiComboBox.getList().$().find("#" + oMultiComboBox.getListItem(oItem3).getId()).hasClass(
						"sapMComboBoxBaseItemDisabled"),
						'The third Listitem must not have the css class sapMComboBoxBaseItemDisabled');

				// cleanup
				oMultiComboBox.destroy();
				this.clock.reset();
			});

	QUnit.test("DisabledListItem 'LIST_ITEM_VISUALISATION' - should not be shown in suggest list", function(assert) {

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
		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();

		// act
		qutils.triggerEvent("input", oMultiComboBox.getFocusDomRef());
		this.clock.tick(500);

		// assertions
		assert.ok(oMultiComboBox._isListInSuggestMode(), 'Suggest list is open');
		assert.equal(oMultiComboBox.getList().$().find("#" + oMultiComboBox.getListItem(oItem1).getId()).length, 0,
				'The first Listitem should not be shown');
		assert.equal(oMultiComboBox.getList().$().find("#" + oMultiComboBox.getListItem(oItem2).getId()).length, 1,
				'The second Listitem should be shown');
		assert.equal(oMultiComboBox.getList().$().find("#" + oMultiComboBox.getListItem(oItem3).getId()).length, 0,
				'The third Listitem should not be shown');

		// cleanup
		oMultiComboBox.destroy();
		this.clock.reset();
	});

	QUnit.test("DisabledListItem 'LIST_ITEM_VISUALISATION' - set disabled via API", function(assert) {

		var oSystem = {
			desktop : true,
			phone : false,
			tablet : false
		};
		this.stub(Device, "system", oSystem);
		this.stub(jQuery.device, "is", oSystem);

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
		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();

		// act
		oItem1.setEnabled(false); //leads to invalidate of control
		this.clock.tick(500);
		oMultiComboBox.open();
		this.clock.tick(500);

		// assertions
		assert.equal(oMultiComboBox.getList().$().find("#" + oMultiComboBox.getListItem(oItem1).getId()).length, 0,
				'The first Listitem should not be shown');
		assert.equal(oMultiComboBox.getList().$().find("#" + oMultiComboBox.getListItem(oItem2).getId()).length, 1,
				'The second Listitem should be shown');
		assert.equal(oMultiComboBox.getList().$().find("#" + oMultiComboBox.getListItem(oItem3).getId()).length, 1,
				'The third Listitem should be shown');

		// cleanup
		oMultiComboBox.destroy();
		this.clock.reset();
	});

	//------------------------------ //
	// Selectable Item             //
	// ----------------------------- //
	QUnit.test("setSelectable Item 'LIST_ITEM_VISUALISATION'", function(assert) {

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
		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();

		// act
		oMultiComboBox.setSelectable(oItem3, false);
		oMultiComboBox.open();
		this.clock.tick(500);

		// assertions
		assert.equal(oMultiComboBox.getList().$().find("#" + oMultiComboBox.getListItem(oItem1).getId()).length, 1,
				'The first Listitem should be shown');
		assert.equal(oMultiComboBox.getList().$().find("#" + oMultiComboBox.getListItem(oItem2).getId()).length, 1,
				'The second Listitem should be shown');
		assert.equal(oMultiComboBox.getList().$().find("#" + oMultiComboBox.getListItem(oItem3).getId()).length, 0,
				'The third Listitem should not be shown');

		// cleanup
		oMultiComboBox.destroy();
		this.clock.reset();
	});

	QUnit.test("setSelectable Dummy Item 'LIST_ITEM_VISUALISATION'", function(assert) {

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
		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();

		// act
		oMultiComboBox.setSelectable(new Item({
			text : "Dummy"
		}), false);
		oMultiComboBox.open();
		this.clock.tick(500);

		// assertions
		assert.equal(oMultiComboBox.getList().$().find("#" + oMultiComboBox.getListItem(oItem1).getId()).length, 1,
				'The first Listitem should be shown');
		assert.equal(oMultiComboBox.getList().$().find("#" + oMultiComboBox.getListItem(oItem2).getId()).length, 1,
				'The second Listitem should be shown');
		assert.equal(oMultiComboBox.getList().$().find("#" + oMultiComboBox.getListItem(oItem3).getId()).length, 1,
				'The third Listitem should be shown');

		// cleanup
		oMultiComboBox.destroy();
		this.clock.reset();
	});

	QUnit.test("setSelectable Item 'LIST_ITEM_VISUALISATION'", function(assert) {

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
		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();

		// act
		oMultiComboBox.setSelectable(oItem3, false);
		oMultiComboBox.setSelectable(oItem3, true);
		oMultiComboBox.open();
		this.clock.tick(500);

		// assertions
		assert.equal(oMultiComboBox.getList().$().find("#" + oMultiComboBox.getListItem(oItem1).getId()).length, 1,
				'The first Listitem should be shown');
		assert.equal(oMultiComboBox.getList().$().find("#" + oMultiComboBox.getListItem(oItem2).getId()).length, 1,
				'The second Listitem should be shown');
		assert.equal(oMultiComboBox.getList().$().find("#" + oMultiComboBox.getListItem(oItem3).getId()).length, 1,
				'The third Listitem should be shown');

		// cleanup
		oMultiComboBox.destroy();
		this.clock.reset();
	});

	QUnit.test("setSelectable Item 'LIST_ITEM_VISUALISATION' - selection is stored", function(assert) {

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
		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();

		// act
		oMultiComboBox.setSelectable(oItem1, false);
		oMultiComboBox.setSelectable(oItem1, true);
		oMultiComboBox.open();
		this.clock.tick(500);

		// assertions
		assert.equal(oMultiComboBox.getList().$().find("#" + oMultiComboBox.getListItem(oItem1).getId()).length, 1,
				'The first Listitem should be shown');
		assert.equal(oMultiComboBox.getList().$().find("#" + oMultiComboBox.getListItem(oItem2).getId()).length, 1,
				'The second Listitem should be shown');
		assert.equal(oMultiComboBox.getList().$().find("#" + oMultiComboBox.getListItem(oItem3).getId()).length, 1,
				'The third Listitem should be shown');

		// cleanup
		oMultiComboBox.destroy();
		this.clock.reset();
	});

	//------------------------------ //
	// clearFilter                   //
	// ----------------------------- //
	QUnit.test("clearFilter", function(assert) {

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
		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();

		// act
		oMultiComboBox.clearFilter();
		oMultiComboBox.open();
		this.clock.tick(500);

		// assertions
		assert.equal(oMultiComboBox.getList().$().find("#" + oMultiComboBox.getListItem(oItem1).getId()).length, 1,
				'The first Listitem should be shown');
		assert.equal(oMultiComboBox.getList().$().find("#" + oMultiComboBox.getListItem(oItem2).getId()).length, 1,
				'The second Listitem should be shown');
		assert.equal(oMultiComboBox.getList().$().find("#" + oMultiComboBox.getListItem(oItem3).getId()).length, 1,
				'The third Listitem should be shown');

		// cleanup
		oMultiComboBox.destroy();
		this.clock.reset();
	});

	QUnit.test("clearFilter - after invisible", function(assert) {

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
		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();

		// act
		oMultiComboBox.getListItem(oMultiComboBox.getFirstItem()).setVisible(false);
		oMultiComboBox.clearFilter();
		oMultiComboBox.open();
		this.clock.tick(500);

		// assertions
		assert.equal(oMultiComboBox.getList().$().find("#" + oMultiComboBox.getListItem(oItem1).getId()).length, 1,
				'The first Listitem should be shown');
		assert.equal(oMultiComboBox.getList().$().find("#" + oMultiComboBox.getListItem(oItem2).getId()).length, 1,
				'The second Listitem should be shown');
		assert.equal(oMultiComboBox.getList().$().find("#" + oMultiComboBox.getListItem(oItem3).getId()).length, 1,
				'The third Listitem should be shown');

		// cleanup
		oMultiComboBox.destroy();
		this.clock.reset();
	});

	QUnit.test("clearFilter - disabled item", function(assert) {

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
		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();

		// act
		oMultiComboBox.clearFilter();
		oMultiComboBox.open();
		this.clock.tick(500);

		// assertions
		assert.equal(oMultiComboBox.getList().$().find("#" + oMultiComboBox.getListItem(oItem1).getId()).length, 0,
				'The first Listitem should not be shown');
		assert.equal(oMultiComboBox.getList().$().find("#" + oMultiComboBox.getListItem(oItem2).getId()).length, 1,
				'The second Listitem should be shown');
		assert.equal(oMultiComboBox.getList().$().find("#" + oMultiComboBox.getListItem(oItem3).getId()).length, 1,
				'The third Listitem should be shown');

		// cleanup
		oMultiComboBox.destroy();
		this.clock.reset();
	});

	QUnit.test("clearFilter - disabled item after invisible", function(assert) {

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
		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();

		// act
		oMultiComboBox.getListItem(oMultiComboBox.getFirstItem()).setVisible(false);
		oMultiComboBox.clearFilter();
		oMultiComboBox.open();
		this.clock.tick(500);

		// assertions
		assert.equal(oMultiComboBox.getList().$().find("#" + oMultiComboBox.getListItem(oItem1).getId()).length, 0,
				'The first Listitem should not be shown');
		assert.equal(oMultiComboBox.getList().$().find("#" + oMultiComboBox.getListItem(oItem2).getId()).length, 1,
				'The second Listitem should be shown');
		assert.equal(oMultiComboBox.getList().$().find("#" + oMultiComboBox.getListItem(oItem3).getId()).length, 1,
				'The third Listitem should be shown');

		// cleanup
		oMultiComboBox.destroy();
		this.clock.reset();
	});

	QUnit.test("clearFilter - disabled item after invisible", function(assert) {

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
		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();

		// act
		oItem1.setEnabled(true);
		this.clock.tick(500);
		oMultiComboBox.getListItem(oMultiComboBox.getFirstItem()).setVisible(false);
		oMultiComboBox.clearFilter();
		oMultiComboBox.open();
		this.clock.tick(500);

		// assertions
		assert.equal(oMultiComboBox.getList().$().find("#" + oMultiComboBox.getListItem(oItem1).getId()).length, 1,
				'The first Listitem should be shown');
		assert.equal(oMultiComboBox.getList().$().find("#" + oMultiComboBox.getListItem(oItem2).getId()).length, 1,
				'The second Listitem should be shown');
		assert.equal(oMultiComboBox.getList().$().find("#" + oMultiComboBox.getListItem(oItem3).getId()).length, 1,
				'The third Listitem should be shown');

		// cleanup
		oMultiComboBox.destroy();
		this.clock.reset();
	});

	// ------------------------------ //
	// Scenarios - specification      //
	// ------------------------------ //
	//
	QUnit.test("Enter completely new value should refilter the picker", function(assert) {
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

		oMultiComboBox.placeAt("MultiComboBox-content");
		oMultiComboBox.setValue("l");
		sap.ui.getCore().applyChanges();
		oMultiComboBox.open();
		this.clock.tick(300);

		oMultiComboBox.fireChange({ value: "l" });
		oMultiComboBox.oninput(oFakeEvent);
		sap.ui.getCore().applyChanges();

		oFakeEvent.target.value = "t";
		oMultiComboBox.fireChange({ value: "t" });
		oMultiComboBox.oninput(oFakeEvent);
		oMultiComboBox.setValue("t");
		sap.ui.getCore().applyChanges();

		assert.strictEqual(oMultiComboBox.getSelectableItems().length, 1, "1 item should be available");
		assert.strictEqual(oMultiComboBox.getSelectableItems()[0].getText(), "test", "selectable item should be test");

		oMultiComboBox.destroy();
		this.clock.reset();
	});

	QUnit.test("Scenario 'FIXED_CHAR': add invalid character.", function(assert) {

		// system under test
		var oItem;
		var sInitValue = "Algeri";
		var oMultiComboBox = new MultiComboBox({
			value : sInitValue,
			items : [oItem = new Item({
				key : "DZ",
				text : "Algeria"
			})]
		});

		// arrange
		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();

		var oTarget = oMultiComboBox.getFocusDomRef();
		var fnOninputSpy = this.spy(oMultiComboBox, "oninput");
		var fnOnkeyupSpy = this.spy(oMultiComboBox, "onkeyup");

		// act
		sap.ui.test.qunit.triggerKeyup(oTarget, ''); // store old value
		oTarget.value = "Algeriz";
		qutils.triggerEvent("input", oTarget);

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

	QUnit.test("Scenario 'FIXED_CHAR': overwrite selected character with invalid one.", function(assert) {

		// system under test
		var oItem;
		var sInitValue = "Algeri";
		var oMultiComboBox = new MultiComboBox({
			value : sInitValue,
			items : [oItem = new Item({
				key : "DZ",
				text : "Algeria"
			})]
		});

		// arrange
		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();
		oMultiComboBox.selectText(1, 2);
		var oTarget = oMultiComboBox.getFocusDomRef();
		var fnOninputSpy = this.spy(oMultiComboBox, "oninput");
		var fnOnkeyupSpy = this.spy(oMultiComboBox, "onkeyup");

		// act
		sap.ui.test.qunit.triggerKeyup(oTarget, ''); // store old value
		oTarget.value = "Azgeri";
		qutils.triggerEvent("input", oTarget);

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

	QUnit.test("Scenario 'TOKEN_ORDER': Order of tokens is the order how the items were selected", function(assert) {

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
		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();

		// act
		sap.ui.test.qunit.triggerCharacterInput(oMultiComboBox.getFocusDomRef(), oItem1.getText());
		sap.ui.test.qunit.triggerKeydown(oMultiComboBox.getDomRef(), KeyCodes.ENTER); //onsapenter

		sap.ui.test.qunit.triggerCharacterInput(oMultiComboBox.getFocusDomRef(), oItem2.getText());
		sap.ui.test.qunit.triggerKeydown(oMultiComboBox.getDomRef(), KeyCodes.ENTER); //onsapenter

		sap.ui.test.qunit.triggerCharacterInput(oMultiComboBox.getFocusDomRef(), oItem3.getText());
		sap.ui.test.qunit.triggerKeydown(oMultiComboBox.getDomRef(), KeyCodes.ENTER); //onsapenter

		// assertions
		var aTokens = oMultiComboBox._oTokenizer.getTokens();
		assert.strictEqual(aTokens[0].getKey(), oItem1.getKey());
		assert.strictEqual(aTokens[1].getKey(), oItem2.getKey());
		assert.strictEqual(aTokens[2].getKey(), oItem3.getKey());

		// arrange
		oMultiComboBox.clearSelection();

		// act
		sap.ui.test.qunit.triggerCharacterInput(oMultiComboBox.getFocusDomRef(), oItem3.getText());
		sap.ui.test.qunit.triggerKeydown(oMultiComboBox.getDomRef(), KeyCodes.ENTER); //onsapenter

		sap.ui.test.qunit.triggerCharacterInput(oMultiComboBox.getFocusDomRef(), oItem2.getText());
		sap.ui.test.qunit.triggerKeydown(oMultiComboBox.getDomRef(), KeyCodes.ENTER); //onsapenter

		sap.ui.test.qunit.triggerCharacterInput(oMultiComboBox.getFocusDomRef(), oItem1.getText());
		sap.ui.test.qunit.triggerKeydown(oMultiComboBox.getDomRef(), KeyCodes.ENTER); //onsapenter

		// assertions
		aTokens = oMultiComboBox._oTokenizer.getTokens();
		assert.strictEqual(aTokens[0].getKey(), oItem3.getKey());
		assert.strictEqual(aTokens[1].getKey(), oItem2.getKey());
		assert.strictEqual(aTokens[2].getKey(), oItem1.getKey());

		// cleanup
		oMultiComboBox.destroy();
	});

	// ------------------------------ //
	// Scenarios - event handling     //
	// ------------------------------ //

	QUnit.test("Scenario 'EVENT_VALUE_ENTER': 'Algeria' + ENTER", function(assert) {

		// system under test
		var oItem;
		var oMultiComboBox = new MultiComboBox({
			items : [oItem = new Item({
				key : "DZ",
				text : "Algeria"
			})]
		});

		// arrange
		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();

		var fnFireChangeSpy = this.spy(oMultiComboBox, "fireChange");
		var fnFireSelectionChangeSpy = this.spy(oMultiComboBox, "fireSelectionChange");
		var fnFireSelectionFinishSpy = this.spy(oMultiComboBox, "fireSelectionFinish");

		// act
		sap.ui.test.qunit.triggerCharacterInput(oMultiComboBox.getFocusDomRef(), oItem.getText());
		sap.ui.test.qunit.triggerKeydown(oMultiComboBox.getDomRef(), KeyCodes.ENTER);

		// assertions
		assert.deepEqual(oMultiComboBox.getSelectedItems(), [oItem]);
		assert.strictEqual(fnFireChangeSpy.callCount, 1, "The change event was fired");
		assert.strictEqual(fnFireSelectionChangeSpy.callCount, 1, "The selection change event was fired");
		assert.strictEqual(fnFireSelectionFinishSpy.callCount, 1, "The selection finish event was fired");

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("Scenario 'EVENT_VALUE_DUMMY_ENTER': 'dummy' + ENTER", function(assert) {

		// system under test
		var oItem;
		var oMultiComboBox = new MultiComboBox({
			items : [oItem = new Item({
				key : "DZ",
				text : "Algeria"
			})]
		});

		// arrange
		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();

		var fnFireChangeSpy = this.spy(oMultiComboBox, "fireChange");
		var fnFireSelectionChangeSpy = this.spy(oMultiComboBox, "fireSelectionChange");
		var fnFireSelectionFinishSpy = this.spy(oMultiComboBox, "fireSelectionFinish");

		// act
		sap.ui.test.qunit.triggerCharacterInput(oMultiComboBox.getFocusDomRef(), 'dummy');
		sap.ui.test.qunit.triggerKeydown(oMultiComboBox.getDomRef(), KeyCodes.ENTER); //onsapenter

		// assertions
		assert.deepEqual(oMultiComboBox.getSelectedItems(), []);
		assert.strictEqual(fnFireChangeSpy.callCount, 1, "The change event was fired");
		assert.strictEqual(fnFireSelectionChangeSpy.callCount, 0, "The selection change event was not fired");
		assert.strictEqual(fnFireSelectionFinishSpy.callCount, 0, "The selection finish event was not fired");

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("Scenario 'EVENT_VALUE_SELECT_ENTER': 'Algeria' + select 'lgeria' + 'ustralia' + ENTER", function(assert) {

		// system under test
		var oItem1, oItem2;
		var oMultiComboBox = new MultiComboBox({
			items : [oItem1 = new Item({
				key : "DZ",
				text : "Algeria"
			}), oItem2 = new Item({
				key : "AU",
				text : "Australia"
			})]
		});

		// arrange
		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();

		var fnFireChangeSpy = this.spy(oMultiComboBox, "fireChange");
		var fnFireSelectionChangeSpy = this.spy(oMultiComboBox, "fireSelectionChange");
		var fnFireSelectionFinishSpy = this.spy(oMultiComboBox, "fireSelectionFinish");

		// act
		sap.ui.test.qunit.triggerCharacterInput(oMultiComboBox.getFocusDomRef(), oItem1.getText());
		oMultiComboBox.selectText(1, oMultiComboBox.getValue().length);
		sap.ui.test.qunit.triggerCharacterInput(oMultiComboBox.getFocusDomRef(), "ustralia");

		// assertions
		assert.strictEqual(fnFireChangeSpy.callCount, 0, "The change event was not fired");
		assert.strictEqual(fnFireSelectionChangeSpy.callCount, 0, "The selection change event was not fired");
		assert.strictEqual(fnFireSelectionFinishSpy.callCount, 0, "The selection finish event was not fired");
		sap.ui.test.qunit.triggerKeydown(oMultiComboBox.getDomRef(), KeyCodes.ENTER);

		// assertions
		assert.deepEqual(oMultiComboBox.getSelectedItems(), []);
		assert.strictEqual(fnFireChangeSpy.callCount, 1, "The change event was fired");
		assert.strictEqual(fnFireSelectionChangeSpy.callCount, 0, "The selection change event was not fired");
		assert.strictEqual(fnFireSelectionFinishSpy.callCount, 0, "The selection finish event was not fired");

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("Scenario 'EVENT_VALUE_PASTE': CTRL+V 'Algeria' ", function(assert) {
		/* TODO remove after 1.62 version */
		// IE has security settings
		// which prompt the user if he wants to let the page access the clipboard.
		if (!Device.browser.internet_explorer) {
			// system under test
			var oItem;
			var oMultiComboBox = new MultiComboBox({
				items : [oItem = new Item({
					key : "DZ",
					text : "Algeria"
				})]
			});

			// arrange
			oMultiComboBox.placeAt("MultiComboBox-content");
			sap.ui.getCore().applyChanges();

			var fnFireSelectionChangeSpy = this.spy(oMultiComboBox, "fireSelectionChange");
			var fnFireSelectionFinishSpy = this.spy(oMultiComboBox, "fireSelectionFinish");

			// act
			sap.ui.test.qunit.triggerEvent("paste", oMultiComboBox.getFocusDomRef(), {
				originalEvent : {
					clipboardData : {
						getData : function() {
							return "Algeria";
						}
					}
				}
			});

			// assertions
			assert.strictEqual(fnFireSelectionChangeSpy.callCount, 1, "The selection change event was fired");
			assert.strictEqual(fnFireSelectionFinishSpy.callCount, 1, "The selection finish event was fired");

			assert.deepEqual(oMultiComboBox.getSelectedItems(), [oItem]);

			// cleanup
			oMultiComboBox.destroy();
		} else {
			assert.expect(0);
		}
	});

	QUnit.test("Scenario 'EVENT_VALUE_LINE_BREAK_PASTE': CTRL+V 'item1 item2' ", function(assert) {
		/* TODO remove after 1.62 version */
		// IE has security settings
		// which prompt the user if he wants to let the page access the clipboard.
		if (!Device.browser.internet_explorer) {
			// system under test
			var oItem;
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
			oMultiComboBox.placeAt("MultiComboBox-content");
			sap.ui.getCore().applyChanges();

			var fnFireSelectionChangeSpy = this.spy(oMultiComboBox, "fireSelectionChange");
			var fnFireSelectionFinishSpy = this.spy(oMultiComboBox, "fireSelectionFinish");

			// act
			sap.ui.test.qunit.triggerEvent("paste", oMultiComboBox.getFocusDomRef(), {
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
			oMultiComboBox.destroy();
		} else {
			assert.expect(0);
		}
	});

	QUnit.test("Scenario 'EVENT_VALUE_FOCUSOUT': 'Algeria' + FOCUSOUT", function(assert) {

		// system under test
		var oItem;
		var oMultiComboBox = new MultiComboBox({
			items : [oItem = new Item({
				key : "DZ",
				text : "Algeria"
			})]
		});

		// arrange
		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();

		var fnFireChangeSpy = this.spy(oMultiComboBox, "fireChange");
		var fnFireSelectionChangeSpy = this.spy(oMultiComboBox, "fireSelectionChange");
		var fnFireSelectionFinishSpy = this.spy(oMultiComboBox, "fireSelectionFinish");

		// act
		oMultiComboBox.getFocusDomRef().focus();
		this.clock.tick(500);
		sap.ui.test.qunit.triggerCharacterInput(oMultiComboBox.getFocusDomRef(), oItem.getText());
		this.clock.tick(500);
		oMultiComboBox.getFocusDomRef().blur();
		this.clock.tick(500);

		// assertions
		var aSelectedItems = oMultiComboBox.getSelectedItems();
		assert.strictEqual(aSelectedItems.length, 0, "No token was selected on Focus Out");
		assert.strictEqual(fnFireChangeSpy.callCount, 1, "The change event was not fired");
		assert.strictEqual(fnFireSelectionChangeSpy.callCount, 0, "The selection change event was not fired");
		assert.strictEqual(fnFireSelectionFinishSpy.callCount, 0, "The selection finish event was not fired");

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("Scenario 'EVENT_TOKEN_BACKSPACE': Token 'Algeria' + BACKSPACE + BACKSPACE", function(assert) {

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
		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();

		var fnFireChangeSpy = this.spy(oMultiComboBox, "fireChange");
		var fnFireSelectionChangeSpy = this.spy(oMultiComboBox, "fireSelectionChange");
		var fnFireSelectionFinishSpy = this.spy(oMultiComboBox, "fireSelectionFinish");

		// act
		sap.ui.test.qunit.triggerKeydown(oMultiComboBox.getDomRef(), KeyCodes.BACKSPACE); // select last token
		sap.ui.test.qunit.triggerKeydown(oMultiComboBox.getDomRef(), KeyCodes.BACKSPACE); // delete selected token

		// assertions
		assert.deepEqual(oMultiComboBox.getSelectedItems(), []);
		assert.strictEqual(fnFireChangeSpy.callCount, 1, "The change event was fired");
		assert.strictEqual(fnFireSelectionChangeSpy.callCount, 1, "The selection change event was fired");
		assert.strictEqual(fnFireSelectionFinishSpy.callCount, 1, "The selection finish event was fired");

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("Scenario 'EVENT_TOKEN_DELETE': Token 'Algeria' + BACKSPACE + DELETE", function(assert) {

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
		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();

		var fnFireChangeSpy = this.spy(oMultiComboBox, "fireChange");
		var fnFireSelectionChangeSpy = this.spy(oMultiComboBox, "fireSelectionChange");
		var fnFireSelectionFinishSpy = this.spy(oMultiComboBox, "fireSelectionFinish");

		// act
		sap.ui.test.qunit.triggerKeydown(oMultiComboBox.getDomRef(), KeyCodes.BACKSPACE); // select last token
		sap.ui.test.qunit.triggerKeydown(oMultiComboBox.getDomRef(), KeyCodes.DELETE); // delete selected token

		// assertions
		assert.deepEqual(oMultiComboBox.getSelectedItems(), []);
		assert.strictEqual(fnFireChangeSpy.callCount, 1, "The change event was fired");
		assert.strictEqual(fnFireSelectionChangeSpy.callCount, 1, "The selection change event was fired");
		assert.strictEqual(fnFireSelectionFinishSpy.callCount, 1, "The selection finish event was fired");

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("Scenario 'EVENT_TOKENS_DELETE': 3 Tokens + CTRL+A + DELETE", function(assert) {

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
		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();

		var fnFireChangeSpy = this.spy(oMultiComboBox, "fireChange");
		var fnFireSelectionChangeSpy = this.spy(oMultiComboBox, "fireSelectionChange");
		var fnFireSelectionFinishSpy = this.spy(oMultiComboBox, "fireSelectionFinish");

		// act
		sap.ui.test.qunit.triggerKeydown(oMultiComboBox.getDomRef(), KeyCodes.A, false, false, true); // select all tokens
		sap.ui.test.qunit.triggerKeydown(oMultiComboBox.getDomRef(), KeyCodes.DELETE); // delete selected tokens

		// assertions
		assert.deepEqual(oMultiComboBox.getSelectedItems(), []);
		assert.strictEqual(fnFireChangeSpy.callCount, 3, "The change event was fired");
		assert.strictEqual(fnFireSelectionChangeSpy.callCount, 3, "The selection change event was fired");
		assert.strictEqual(fnFireSelectionFinishSpy.callCount, 3, "The selection finish event was fired");

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("Scenario 'EVENT_TOKEN_DELETE_BUTTON': Token 'Algeria' + delete button on token", function(assert) {

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
		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();

		var fnFireChangeSpy = this.spy(oMultiComboBox, "fireChange");
		var fnFireSelectionChangeSpy = this.spy(oMultiComboBox, "fireSelectionChange");
		var fnFireSelectionFinishSpy = this.spy(oMultiComboBox, "fireSelectionFinish");

		// act
		var oToken = jQuery.find(".sapMToken")[0];
		var oTokenIcon = jQuery.find(".sapMTokenIcon")[0];
		sap.ui.test.qunit.triggerEvent("click", oTokenIcon);

		// assertions
		assert.deepEqual(oMultiComboBox.getSelectedItems(), []);
		assert.strictEqual(fnFireChangeSpy.callCount, 1, "The change event was fired");
		assert.strictEqual(fnFireSelectionChangeSpy.callCount, 1, "The selection change event was fired");
		assert.strictEqual(fnFireSelectionFinishSpy.callCount, 1, "The selection finish event was fired");

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("Scenario 'EVENT_VALUE_ESCAPE': 'Algeria' change to 'Dummy' + ESCAPE", function(assert) {

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
		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();

		var fnFireChangeSpy = this.spy(oMultiComboBox, "fireChange");
		var fnFireSelectionChangeSpy = this.spy(oMultiComboBox, "fireSelectionChange");
		var fnFireSelectionFinishSpy = this.spy(oMultiComboBox, "fireSelectionFinish");
		var fnFireEventSpy = this.spy(oMultiComboBox, "fireEvent");

		// act
		oMultiComboBox.getFocusDomRef().value = "Dummy";

		// act
		sap.ui.test.qunit.triggerKeyboardEvent(oMultiComboBox.getFocusDomRef(), KeyCodes.ESCAPE);

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
		oMultiComboBox.destroy();
	});

	QUnit.test("Scenario 'EVENT_VALUE_ENTER_OPENLIST': 'alg' + ALT+DOWNKEY + ENTER + ALT+UPKEY", function(assert) {
		var oSystem = {
			desktop : true,
			phone : false,
			tablet : false
		};
		this.stub(Device, "system", oSystem);
		this.stub(jQuery.device, "is", oSystem);

		// system under test
		var oItem;
		var oMultiComboBox = new MultiComboBox({
			items : [oItem = new Item({
				key : "DZ",
				text : "Algeria"
			})]
		});

		// arrange
		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();
		oMultiComboBox.focus();

		var fnFireChangeSpy = this.spy(oMultiComboBox, "fireChange");
		var fnFireSelectionChangeSpy = this.spy(oMultiComboBox, "fireSelectionChange");

		// act - 'alg' + OpenList + Enter
		sap.ui.test.qunit.triggerCharacterInput(oMultiComboBox.getFocusDomRef(), "alg");
		sap.ui.test.qunit.triggerKeyboardEvent(oMultiComboBox.getFocusDomRef(), KeyCodes.ENTER);
		this.clock.tick(500);

		// assertions
		assert.deepEqual(oMultiComboBox.getSelectedItems(), []);
		assert.strictEqual(fnFireSelectionChangeSpy.callCount, 0, "The selection change event was not fired");

		// cleanup
		oMultiComboBox.destroy();
		this.clock.reset();
	});

	QUnit.test("Scenario 'EVENT_VALUE_ENTER_OPENLIST': 'alg' + ALT+DOWNKEY + ENTER + ALT+UPKEY Case insensitive", function(assert) {
		var oSystem = {
			desktop : true,
			phone : false,
			tablet : false
		};
		this.stub(Device, "system", oSystem);
		this.stub(jQuery.device, "is", oSystem);

		// system under test
		var oItem1, oItem2;
		var oMultiComboBox = new MultiComboBox({
			items : [oItem1 = new Item({
				key : "DZ",
				text : "Algeria"
			}), oItem2 = new Item({
				key : "DZ",
				text : "Alg"
			})]
		});

		// arrange
		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();
		oMultiComboBox.focus();

		// act - 'alg' + OpenList + Enter
		sap.ui.test.qunit.triggerCharacterInput(oMultiComboBox.getFocusDomRef(), "alg");
		sap.ui.test.qunit.triggerKeyboardEvent(oMultiComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN, false, true);
		sap.ui.test.qunit.triggerKeyboardEvent(oMultiComboBox.getFocusDomRef(), KeyCodes.ENTER);
		sap.ui.test.qunit.triggerKeyboardEvent(oMultiComboBox.getFocusDomRef(), KeyCodes.ARROW_UP, false, true);
		this.clock.tick(500);

		// assertions
		assert.deepEqual(oMultiComboBox.getSelectedItems(), [oItem2]);

		// cleanup
		oMultiComboBox.destroy();
		this.clock.reset();
	});

	QUnit.test("Scenario 'EVENT_VALUE_ENTER_OPENLIST': 'al' + ALT+DOWNKEY + ENTER + ALT+UPKEY", function(assert) {
		var oSystem = {
			desktop : true,
			phone : false,
			tablet : false
		};
		this.stub(Device, "system", oSystem);
		this.stub(jQuery.device, "is", oSystem);

		// system under test
		var oItem1, oItem2;
		var oMultiComboBox = new MultiComboBox({
			items : [oItem1 = new Item({
				key : "DZ",
				text : "Algeria"
			}), oItem2 = new Item({
				key : "DZ",
				text : "Alg"
			})]
		});

		// arrange
		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();
		oMultiComboBox.focus();

		// act - 'al' + OpenList + Enter
		sap.ui.test.qunit.triggerCharacterInput(oMultiComboBox.getFocusDomRef(), "al");
		sap.ui.test.qunit.triggerKeyboardEvent(oMultiComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN, false, true);
		sap.ui.test.qunit.triggerKeyboardEvent(oMultiComboBox.getFocusDomRef(), KeyCodes.ENTER);
		sap.ui.test.qunit.triggerKeyboardEvent(oMultiComboBox.getFocusDomRef(), KeyCodes.ARROW_UP, false, true);
		this.clock.tick(500);

		// assertions
		assert.deepEqual(oMultiComboBox.getSelectedItems(), [], "should not select anything");
		assert.strictEqual(oMultiComboBox.getValue(), "al", "Value should not be deleted");

		// cleanup
		sap.ui.test.qunit.triggerKeyboardEvent(oMultiComboBox.getFocusDomRef(), KeyCodes.ESCAPE);
		this.clock.tick(500);
		oMultiComboBox.destroy();
		this.clock.reset();
	});

	QUnit.test("Scenario 'EVENT_SELECTION_SPACE': ALT+DOWNKEY + SelectItem + ALT+UPKEY", function(assert) {
		var oSystem = {
			desktop : true,
			phone : false,
			tablet : false
		};
		this.stub(Device, "system", oSystem);
		this.stub(jQuery.device, "is", oSystem);

		// system under test
		var oItem;
		var oMultiComboBox = new MultiComboBox({
			items : [oItem = new Item({
				key : "DZ",
				text : "Algeria"
			})]
		});

		// arrange
		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();
		oMultiComboBox.focus();

		var fnFireChangeSpy = this.spy(oMultiComboBox, "fireChange");
		var fnFireSelectionChangeSpy = this.spy(oMultiComboBox, "fireSelectionChange");
		var fnFireSelectionFinishSpy = this.spy(oMultiComboBox, "fireSelectionFinish");

		// act - 'alg' + OpenList + TAP
		sap.ui.test.qunit
				.triggerKeyboardEvent(oMultiComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN, false, true);
		this.clock.tick(500);
		var oDomListItem = oMultiComboBox.getListItem(oMultiComboBox.getFirstItem()).getDomRef();
		var oListItem = sap.ui.getCore().byId(oDomListItem.id);
		sap.ui.test.qunit.triggerTouchEvent("tap", oDomListItem, {
			srcControl : oListItem
		});

		// assertions
		assert.deepEqual(oMultiComboBox.getSelectedItems(), [oItem]);
		assert.strictEqual(fnFireChangeSpy.callCount, 1, "The change event was fired");
		assert.strictEqual(fnFireSelectionChangeSpy.callCount, 1, "The selection change event was fired");
		assert.strictEqual(fnFireSelectionFinishSpy.callCount, 0, "The selection finish event was fired");

		// act - CloseList
		sap.ui.test.qunit.triggerKeyboardEvent(oMultiComboBox.getFocusDomRef(), KeyCodes.ARROW_UP, false, true);
		this.clock.tick(500);

		// assertions
		assert.strictEqual(fnFireSelectionFinishSpy.callCount, 1, "The selection finish event was fired");

		// cleanup
		oMultiComboBox.destroy();
		this.clock.reset();
	});

	QUnit.test("Scenario 'EVENT_DESELECTION_SPACE': SelectedItem + ALT+DOWNKEY + DeselectItem + ALT+UPKEY", function(assert) {

		var oSystem = {
			desktop : true,
			phone : false,
			tablet : false
		};
		this.stub(Device, "system", oSystem);
		this.stub(jQuery.device, "is", oSystem);

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
		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();
		oMultiComboBox.focus();

		var fnFireChangeSpy = this.spy(oMultiComboBox, "fireChange");
		var fnFireSelectionChangeSpy = this.spy(oMultiComboBox, "fireSelectionChange");
		var fnFireSelectionFinishSpy = this.spy(oMultiComboBox, "fireSelectionFinish");

		// act - 'alg' + OpenList + TAP
		sap.ui.test.qunit
				.triggerKeyboardEvent(oMultiComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN, false, true);
		this.clock.tick(500);
		var oDomListItem = oMultiComboBox.getListItem(oMultiComboBox.getFirstItem()).getDomRef();
		var oListItem = sap.ui.getCore().byId(oDomListItem.id);
		sap.ui.test.qunit.triggerTouchEvent("tap", oDomListItem, {
			srcControl : oListItem
		});

		// assertions
		assert.deepEqual(oMultiComboBox.getSelectedItems(), []);
		assert.strictEqual(fnFireChangeSpy.callCount, 1, "The change event was fired");
		assert.strictEqual(fnFireSelectionChangeSpy.callCount, 1, "The selection change event was fired");
		assert.strictEqual(fnFireSelectionFinishSpy.callCount, 0, "The selection finish event was fired");

		// act - CloseList
		sap.ui.test.qunit.triggerKeyboardEvent(oMultiComboBox.getFocusDomRef(), KeyCodes.ARROW_UP, false, true);
		this.clock.tick(500);

		// assertions
		assert.strictEqual(fnFireSelectionFinishSpy.callCount, 1, "The selection finish event was fired");

		// cleanup
		oMultiComboBox.destroy();
		this.clock.reset();
	});

	QUnit.test("Scenario CLICK_INPUT: tap into control", function(assert) {

		// system under test
		var oMultiComboBox = new MultiComboBox({
			items : [new Item({
				key : "DZ",
				text : "Algeria"
			})]
		});

		// arrange
		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();
		var fnTapSpy = this.spy(oMultiComboBox, "ontap");
		var fnOpenSpy = this.spy(oMultiComboBox.getPicker(), "open");

		// act - clicking on control
		sap.ui.test.qunit.triggerTouchEvent("tap", oMultiComboBox.getFocusDomRef(), {
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
		this.clock.reset();
	});

	QUnit.test("setSelection should trigger Tokenizer's scrollToEnd", function (assert) {

		var oFakeEvent = new Event();

		// system under test
		var oItem = new Item({
				key : "DZ",
				text : "Algeria"
			}),
			oMultiComboBox = new MultiComboBox({
				items : [oItem]
			}), oToken;

		// arrange
		oMultiComboBox.placeAt("MultiComboBox-content");
		oMultiComboBox.setSelectedItems([oItem]);

		var oSpy = this.spy(oMultiComboBox._oTokenizer, "scrollToEnd");
		var oStubSetSelection = sinon.stub(Event.prototype, "getParameters");

		sap.ui.getCore().applyChanges();

		oStubSetSelection.withArgs("id").returns(oItem.getId());
		oStubSetSelection.withArgs("item").returns(oItem);
		oStubSetSelection.withArgs("listItemUpdated").returns(true);

		this.clock.tick(500);
		oMultiComboBox.setSelection(oFakeEvent);

		assert.ok(oSpy.called, "Tokenizer's scrollToEnd should be called when a new token is added");

		// cleanup
		oSpy.restore();
		oFakeEvent.destroy();
		oStubSetSelection.restore();
		oMultiComboBox.destroy();

	});

	QUnit.test("Clicking on token should not throw an exception", function(assert) {
		// system under test
		var oItem = new Item({
				key : "DZ",
				text : "Algeria"
			}),
			oMultiComboBox = new MultiComboBox({
				items : [oItem]
			}), oToken;

		// arrange
		oMultiComboBox.placeAt("MultiComboBox-content");
		oMultiComboBox.setSelectedItems([oItem]);
		sap.ui.getCore().applyChanges();

		// act - clicking on control
		oToken = oMultiComboBox._oTokenizer.getTokens()[0];
		sap.ui.test.qunit.triggerTouchEvent("tap", oMultiComboBox.getFocusDomRef(), {
			srcControl: oToken,
			target: oToken.getFocusDomRef()
		});
		this.clock.tick(500);

		assert.ok(true, "The test should not throw and exception");

		// cleanup
		oMultiComboBox.destroy();
		this.clock.reset();
	});

	// --------------------------------- //
	// Scenarios - opening dropdown list //
	// --------------------------------- //

	QUnit.test("Scenario OPEN_ALTDOWN", function(assert) {

		var oSystem = {
			desktop : true,
			phone : false,
			tablet : false
		};
		this.stub(Device, "system", oSystem);
		this.stub(jQuery.device, "is", oSystem);

		// system under test
		var oMultiComboBox = new MultiComboBox({
			items : [new Item({
				key : "DZ",
				text : "Algeria"
			})]
		});

		// arrange
		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();

		var fnShowSpy = this.spy(oMultiComboBox, "onsapshow");
		var fnOpenSpy = this.spy(oMultiComboBox.getPicker(), "open");

		// act
		sap.ui.test.qunit
				.triggerKeyboardEvent(oMultiComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN, false, true);
		this.clock.tick(500);

		// assertions
		assert.strictEqual(fnShowSpy.callCount, 1, "onsapshow was called exactly once");
		assert.strictEqual(fnOpenSpy.callCount, 1, "openwas called exactly once");
		assert.strictEqual(oMultiComboBox.getPicker().oPopup.getOpenState(), OpenState.OPEN, "Popup is open");
		assert.ok(oMultiComboBox.isOpen(), "oMultiComboBox is open");
		assert.ok(oMultiComboBox.$().hasClass(InputBase.ICON_PRESSED_CSS_CLASS),
				'The MultiComboBox must have the css class “' + oMultiComboBox.ICON_PRESSED_CSS_CLAS);
		assert.strictEqual(oMultiComboBox.getFocusDomRef().getAttribute("aria-expanded"), "true", "aria-expanded should be true");
		assert.ok(!oMultiComboBox._isListInSuggestMode(), 'Complete list is open');

		// cleanup
		oMultiComboBox.destroy();
		this.clock.reset();
	});

	QUnit.test("Scenario OPEN_ALTUP", function(assert) {

		var oSystem = {
			desktop : true,
			phone : false,
			tablet : false
		};
		this.stub(Device, "system", oSystem);
		this.stub(jQuery.device, "is", oSystem);

		// system under test
		var oMultiComboBox = new MultiComboBox({
			items : [new Item({
				key : "DZ",
				text : "Algeria"
			})]
		});

		// arrange
		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();

		var fnHideSpy = this.spy(oMultiComboBox, "onsaphide");
		var fnOpenSpy = this.spy(oMultiComboBox.getPicker(), "open");

		// act
		sap.ui.test.qunit.triggerKeyboardEvent(oMultiComboBox.getFocusDomRef(), KeyCodes.ARROW_UP, false, true);
		this.clock.tick(500);

		// assertions
		assert.strictEqual(fnHideSpy.callCount, 1, "onsaphide was called exactly once");
		assert.strictEqual(fnOpenSpy.callCount, 1, "openwas called exactly once");
		assert.strictEqual(oMultiComboBox.getPicker().oPopup.getOpenState(), OpenState.OPEN, "Popup is open");
		assert.ok(oMultiComboBox.isOpen(), "oMultiComboBox is open");
		assert.ok(oMultiComboBox.$().hasClass(InputBase.ICON_PRESSED_CSS_CLASS),
				'The MultiComboBox must have the css class “' + oMultiComboBox.ICON_PRESSED_CSS_CLAS);
		assert.strictEqual(oMultiComboBox.getFocusDomRef().getAttribute("aria-expanded"), "true", "aria-expanded should be true");
		assert.ok(!oMultiComboBox._isListInSuggestMode(), 'Complete list is open');

		// cleanup
		oMultiComboBox.destroy();
		this.clock.reset();
	});

	QUnit.test("Scenario OPEN_F4", function(assert) {

		var oSystem = {
			desktop : true,
			phone : false,
			tablet : false
		};
		this.stub(Device, "system", oSystem);
		this.stub(jQuery.device, "is", oSystem);

		// system under test
		var oMultiComboBox = new MultiComboBox({
			items : [new Item({
				key : "DZ",
				text : "Algeria"
			})]
		});

		// arrange
		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();

		var fnShowSpy = this.spy(oMultiComboBox, "onsapshow");
		var fnOpenSpy = this.spy(oMultiComboBox.getPicker(), "open");

		// act
		sap.ui.test.qunit.triggerKeyboardEvent(oMultiComboBox.getFocusDomRef(), KeyCodes.F4);
		this.clock.tick(500);

		// assertions
		assert.strictEqual(fnShowSpy.callCount, 1, "onsapshow was called exactly once");
		assert.strictEqual(fnOpenSpy.callCount, 1, "open was called exactly once");
		assert.strictEqual(oMultiComboBox.getPicker().oPopup.getOpenState(), OpenState.OPEN, "Popup is open");
		assert.ok(oMultiComboBox.isOpen(), "oMultiComboBox is open");
		assert.ok(oMultiComboBox.$().hasClass(InputBase.ICON_PRESSED_CSS_CLASS),
				'The MultiComboBox must have the css class “' + oMultiComboBox.ICON_PRESSED_CSS_CLA);
		assert.strictEqual(oMultiComboBox.getFocusDomRef().getAttribute("aria-expanded"), "true", "aria-expanded should be true");
		assert.ok(!oMultiComboBox._isListInSuggestMode(), 'Complete list is open');

		// cleanup
		oMultiComboBox.destroy();
		this.clock.reset();
	});

	QUnit.test("Scenario OPEN_ARROW: tap on arrow", function(assert) {

		var oSystem = {
			desktop : true,
			phone : false,
			tablet : false
		};
		this.stub(Device, "system", oSystem);
		this.stub(jQuery.device, "is", oSystem);

		// system under test
		var oMultiComboBox = new MultiComboBox({
			items : [new Item({
				key : "DZ",
				text : "Algeria"
			})]
		});

		// arrange
		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();
		var fnClickSpy = this.spy(oMultiComboBox.getDomRef("arrow"), "click");
		var fnOpenSpy = this.spy(oMultiComboBox.getPicker(), "open");

		// act - clicking on arrow
		sap.ui.test.qunit.triggerTouchEvent("click", oMultiComboBox.getDomRef("arrow"), {
			srcControl: oMultiComboBox,
			target: oMultiComboBox.getDomRef("arrow")
		});
		this.clock.tick(500);

		// assertions
		assert.strictEqual(fnOpenSpy.callCount, 1, "open was called exactly once");
		assert.strictEqual(oMultiComboBox.getPicker().oPopup.getOpenState(), OpenState.OPEN, "Popup is open");
		assert.ok(oMultiComboBox.isOpen(), "oMultiComboBox is open");
		assert.ok(oMultiComboBox.$().hasClass(InputBase.ICON_PRESSED_CSS_CLASS),
				'The MultiComboBox must have the css class “' + oMultiComboBox.ICON_PRESSED_CSS_CLAS);
		assert.strictEqual(oMultiComboBox.getFocusDomRef().getAttribute("aria-expanded"), "true", "aria-expanded should be true");
		assert.ok(!oMultiComboBox._isListInSuggestMode(), 'Complete list is open');

		// cleanup
		oMultiComboBox.destroy();
		this.clock.reset();
	});

	QUnit.test("Scenario OPEN_VALUE: Typing valid letters into InputField", function(assert) {

		var oSystem = {
			desktop : true,
			phone : false,
			tablet : false
		};
		this.stub(Device, "system", oSystem);
		this.stub(jQuery.device, "is", oSystem);

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
		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();
		var fnOpenSpy = this.spy(oMultiComboBox.getPicker(), "open");

		// act
		qutils.triggerEvent("input", oMultiComboBox.getFocusDomRef());
		this.clock.tick(500);

		// assertions
		assert.strictEqual(fnOpenSpy.callCount, 1, "open was called exactly once");
		assert.strictEqual(oMultiComboBox.getPicker().oPopup.getOpenState(), OpenState.OPEN, "Popup is open");
		assert.ok(oMultiComboBox.isOpen(), "oMultiComboBox is open");
		assert.ok(oMultiComboBox.$().hasClass(InputBase.ICON_PRESSED_CSS_CLASS),
				'The MultiComboBox must have the css class “' + oMultiComboBox.ICON_PRESSED_CSS_CLAS);
		assert.strictEqual(oMultiComboBox.getFocusDomRef().getAttribute("aria-expanded"), "true", "aria-expanded should be true");
		assert.ok(oMultiComboBox._isListInSuggestMode(), 'Suggest list is open');

		// cleanup
		oMultiComboBox.destroy();
		this.clock.reset();
	});

	QUnit.test("Scenario OPEN_VALUE: Type valid letter into InputField and delete it", function(assert) {

		var oSystem = {
			desktop : true,
			phone : false,
			tablet : false
		};
		this.stub(Device, "system", oSystem);
		this.stub(jQuery.device, "is", oSystem);

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
		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();
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
		this.clock.reset();
	});

	QUnit.test("Scenario OPEN_VALUE: Open MCB by Arrow + Down / F4 or by clicking arrow then type valid letter and delete it", function (assert) {
		var oSystem = {
			desktop : true,
			phone : false,
			tablet : false
		};
		this.stub(Device, "system", oSystem);

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
		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();
		oMultiComboBox.focus();

		sap.ui.test.qunit.triggerKeyboardEvent(oMultiComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN, false, true);
		this.clock.tick(500);

		// act
		oMultiComboBox.getFocusDomRef().value = "";
		qutils.triggerEvent("input", oMultiComboBox.getFocusDomRef());
		this.clock.tick(500);

		assert.ok(oMultiComboBox.isOpen(), "oMultiComboBox is opened");

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("Scenario OPEN_SUGGEST_SPACE: Pushing SPACE on item in suggest list - suggest list is closing first and complete list is opening then", function(assert) {

				var oSystem = {
					desktop : true,
					phone : false,
					tablet : false
				};
				this.stub(Device, "system", oSystem);
				this.stub(jQuery.device, "is", oSystem);

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
				oMultiComboBox.placeAt("MultiComboBox-content");
				sap.ui.getCore().applyChanges();
				var fnOpenSpy = this.spy(oMultiComboBox.getPicker(), "open");

				// act
				qutils.triggerEvent("input", oMultiComboBox.getFocusDomRef());
				this.clock.tick(500);

				// assertions
				assert.ok(oMultiComboBox._isListInSuggestMode(), 'Suggest list is open');

				// act
				var oDomListItem = oMultiComboBox.getListItem(oMultiComboBox.getFirstItem()).getDomRef();
				sap.ui.test.qunit.triggerKeyup(oDomListItem, KeyCodes.SPACE);
				this.clock.tick(500);

				// assertions
				assert.strictEqual(fnOpenSpy.callCount, 2, "open was called exactly once");
				assert.strictEqual(oMultiComboBox.getPicker().oPopup.getOpenState(), OpenState.OPEN, "Popup is open");
				assert.ok(oMultiComboBox.isOpen(), "oMultiComboBox is open");
				assert.ok(oMultiComboBox.$().hasClass(InputBase.ICON_PRESSED_CSS_CLASS),
						'The MultiComboBox must have the css class “' + oMultiComboBox.ICON_PRESSED_CSS_CLAS);

				// cleanup
				oMultiComboBox.destroy();
				this.clock.reset();
			});

	QUnit.test("Scenario OPEN_SUGGEST_ARROW: Pushing twice ALT+DOWN etc. in suggest list - suggest list is closing first and complete list is opening then",
			function(assert) {

				var oSystem = {
					desktop : true,
					phone : false,
					tablet : false
				};
				this.stub(Device, "system", oSystem);
				this.stub(jQuery.device, "is", oSystem);

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
				oMultiComboBox.placeAt("MultiComboBox-content");
				sap.ui.getCore().applyChanges();
				oMultiComboBox.focus();
				var fnOpenSpy = this.spy(oMultiComboBox.getPicker(), "open");

				// act
				qutils.triggerEvent("input", oMultiComboBox.getFocusDomRef());
				this.clock.tick(500);

				// assertions
				assert.ok(oMultiComboBox._isListInSuggestMode(), 'Suggest list is open');

				// act
				sap.ui.test.qunit.triggerKeyboardEvent(oMultiComboBox.getFocusDomRef(), KeyCodes.ARROW_UP, false,
						true); // close list
				this.clock.tick(500);
				sap.ui.test.qunit.triggerKeyboardEvent(oMultiComboBox.getFocusDomRef(), KeyCodes.ARROW_UP, false,
						true); // open list
				this.clock.tick(500);

				// assertions
				assert.strictEqual(fnOpenSpy.callCount, 2, "open was called exactly twice");
				assert.strictEqual(oMultiComboBox.getPicker().oPopup.getOpenState(), OpenState.OPEN, "Popup is open");
				assert.ok(oMultiComboBox.isOpen(), "oMultiComboBox is open");
				assert.ok(oMultiComboBox.$().hasClass(InputBase.ICON_PRESSED_CSS_CLASS),
						'The MultiComboBox must have the css class “' + oMultiComboBox.ICON_PRESSED_CSS_CLAS);
				assert.ok(!oMultiComboBox._isListInSuggestMode(), 'Complete list is open');

				// cleanup
				oMultiComboBox.destroy();
				this.clock.reset();
			});

	QUnit.test("Scenario 'CLOSE_TAP': closing list via tapping on list item", function(assert) {

		var oSystem = {
			desktop : true,
			phone : false,
			tablet : false
		};
		this.stub(Device, "system", oSystem);
		this.stub(jQuery.device, "is", oSystem);

		// system under test
		var oMultiComboBox = new MultiComboBox({
			items : [new Item({
				text : "Algeria"
			}), new Item({
				text : "Argentina"
			})]
		});

		// arrange
		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();
		oMultiComboBox.getFocusDomRef().focus();
		oMultiComboBox.open();
		this.clock.tick(500);

		// act
		var oDomListItem = oMultiComboBox.getListItem(oMultiComboBox.getFirstItem()).getDomRef();
		var oListItem = sap.ui.getCore().byId(oDomListItem.id);
		sap.ui.test.qunit.triggerEvent("tap", oDomListItem, {
			srcControl : oListItem
		});
		this.clock.tick(500);

		// assertions
		assert.ok(!oMultiComboBox.isOpen(), "oMultiComboBox is closed");
		assert.strictEqual(oMultiComboBox.getFocusDomRef().getAttribute("aria-expanded"), "false", "aria-expanded should be false");
		assert.equal(oMultiComboBox.getFocusDomRef().id, document.activeElement.id, "Input field has focus");

		// cleanup
		oMultiComboBox.destroy();
		this.clock.reset();
	});

	// --------------------------------- //
	// Scenarios - closing dropdown list //
	// --------------------------------- //

	/*test("Scenario CLOSE_FOCUSLEAVE", function() {

		  // system under test
		  var oMultiComboBox = new sap.m.MultiComboBox({
				 items : [ new sap.ui.core.Item({
						key : "DZ",
						text : "Algeria"
				 }) ]
		  });

		  // arrange
		  oMultiComboBox.placeAt("MultiComboBox-content");
		  sap.ui.getCore().applyChanges();
		  oMultiComboBox.focus();

		  var fnOpenSpy = this.spy(oMultiComboBox.getPicker(), "open");
		  var fnCloseSpy = this.spy(oMultiComboBox.getPicker(), "close");

		  // act
		  oMultiComboBox.open();
		  this.clock.tick(1000);
		  sap.ui.test.qunit.triggerEvent("focusout", oMultiComboBox.getFocusDomRef());
		  this.clock.tick(1000);

		  // assertions
		  assert.strictEqual(fnCloseSpy.callCount, 1, "close was called exactly once");
		  assert.strictEqual(oMultiComboBox.getPicker().oPopup.getOpenState(), sap.ui.core.OpenState.CLOSED, "Popup is closed");
		  assert.ok(!oMultiComboBox.isOpen(), "oMultiComboBox is closed");
		  assert.ok(!oMultiComboBox.$().hasClass(sap.m.ComboBoxBaseRenderer.CSS_CLASS_COMBOBOXBASE), 'The MultiComboBox must not have the css class “'
						+ sap.m.ComboBoxBaseRenderer.CSS_CLASS_COMBOBOXBAS);

		  // cleanup
		  oMultiComboBox.destroy();
		   this.clock.reset();
	});*/

	// --------------------------------- //
	// Arrow - pressed state             //
	// --------------------------------- //
	QUnit.test("Arrow - pressed on arrow", function(assert) {

		// system under test
		var oMultiComboBox = new MultiComboBox({
			items : [new Item({
				key : "DZ",
				text : "Algeria"
			})]
		});

		// arrange
		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();
		oMultiComboBox.focus();

		// act
		var oDomRefArrow = oMultiComboBox.getDomRef("arrow");
		sap.ui.test.qunit.triggerTouchEvent("click", oDomRefArrow, {
			target : oDomRefArrow
		});

		// assertions
		assert.ok(oMultiComboBox.isOpen(), "oMultiComboBox is open");
		assert.ok(oMultiComboBox.$().hasClass(InputBase.ICON_PRESSED_CSS_CLASS),
				'The MultiComboBox must have the css class “' + oMultiComboBox.ICON_PRESSED_CSS_CLAS);
		assert.strictEqual(oMultiComboBox.getFocusDomRef().getAttribute("aria-expanded"), "false", "aria-expanded should be false");

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("Arrow - pressed on control", function(assert) {

		// system under test
		var oMultiComboBox = new MultiComboBox({
			items : [new Item({
				key : "DZ",
				text : "Algeria"
			})]
		});

		// arrange
		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();
		oMultiComboBox.focus();

		// act
		var oDomRef = oMultiComboBox.getFocusDomRef();
		sap.ui.test.qunit.triggerTouchEvent("touchstart", oDomRef, {
			target : oDomRef
		});

		// assertions
		assert.ok(!oMultiComboBox.isOpen(), "oMultiComboBox is closed");
		assert.ok(!oMultiComboBox.$().hasClass(InputBase.ICON_PRESSED_CSS_CLASS),
				'The MultiComboBox must not have the css class “' + oMultiComboBox.ICON_PRESSED_CSS_CLAS);
		assert.strictEqual(oMultiComboBox.getFocusDomRef().getAttribute("aria-expanded"), "false", "aria-expanded should be false");

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("Arrow - tap on list item in suggest mode", function(assert) {

		var oSystem = {
			desktop : true,
			phone : false,
			tablet : false
		};
		this.stub(Device, "system", oSystem);
		this.stub(jQuery.device, "is", oSystem);

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
		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();
		qutils.triggerEvent("input", oMultiComboBox.getFocusDomRef());
		this.clock.tick(500);

		// act
		var oDomListItem = oMultiComboBox.getListItem(oMultiComboBox.getFirstItem()).getDomRef();
		var oListItem = sap.ui.getCore().byId(oDomListItem.id);
		oListItem.focus();
		sap.ui.test.qunit.triggerTouchEvent("tap", oDomListItem, {
			srcControl : oListItem
		});
		this.clock.tick(500);

		// assertions
		assert.ok(oMultiComboBox.isOpen(), "oMultiComboBox is closed");
		assert.ok(!oMultiComboBox._isListInSuggestMode(), 'Complete list is open');
		assert.ok(oMultiComboBox.$().hasClass(InputBase.ICON_PRESSED_CSS_CLASS),
				'The MultiComboBox must have the css class “' + oMultiComboBox.ICON_PRESSED_CSS_CLAS);

		// cleanup
		oMultiComboBox.destroy();
		this.clock.reset();
	});
	// --------------------------------- //
	// Focus - border                    //
	// --------------------------------- //
	QUnit.test("FocusBorder - pressed on control", function(assert) {

		// system under test
		var oMultiComboBox = new MultiComboBox({
			items : [new Item({
				key : "DZ",
				text : "Algeria"
			})]
		});

		// arrange
		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();
		oMultiComboBox.focus();

		// act
		var oDomRef = oMultiComboBox.getFocusDomRef();
		sap.ui.test.qunit.triggerTouchEvent("touchstart", oDomRef, {
			target : oDomRef
		});

		// assertions
		assert.ok(oMultiComboBox.$().hasClass("sapMFocus"), 'The MultiComboBox has the CSS class "sapMFocus"');

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("FocusBorder - pressed on arrow", function(assert) {

		// system under test
		var oMultiComboBox = new MultiComboBox({
			items : [new Item({
				key : "DZ",
				text : "Algeria"
			})]
		});

		// arrange
		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();
		oMultiComboBox.focus();

		// act
		var oDomRefArrow = oMultiComboBox.getDomRef("arrow");
		sap.ui.test.qunit.triggerTouchEvent("touchstart", oDomRefArrow, {
			target : oDomRefArrow
		});

		// assertions
		assert.ok(oMultiComboBox.$().hasClass("sapMFocus"), 'The MultiComboBox has the CSS class "sapMFocus"');

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("FocusBorder - focus on list item", function(assert) {

		// system under test
		var oMultiComboBox = new MultiComboBox({
			items : [new Item({
				key : "DZ",
				text : "Algeria"
			})]
		});

		// arrange
		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();
		oMultiComboBox.focus();

		// act
		sap.ui.test.qunit
				.triggerKeyboardEvent(oMultiComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN, false, true);
		this.clock.tick(500);
		var oDomListItem = oMultiComboBox.getListItem(oMultiComboBox.getFirstItem()).getDomRef();
		var oListItem = sap.ui.getCore().byId(oDomListItem.id);
		sap.ui.test.qunit.triggerTouchEvent("tap", oDomListItem, {
			srcControl : oListItem
		});

		// assertions
		assert.ok(oMultiComboBox.$().hasClass(MultiComboBoxRenderer.CSS_CLASS_MULTICOMBOBOX + "Focused"),
				'The MultiComboBox must have the css class “' + MultiComboBoxRenderer.CSS_CLASS_MULTICOMBOBOX + 'Focused”');

		// cleanup
		oMultiComboBox.destroy();
		this.clock.reset();
	});

	QUnit.test("FocusBorder - arrow + leave", function(assert) {

		// system under test
		var oMultiComboBox = new MultiComboBox({
			items : [new Item({
				key : "DZ",
				text : "Algeria"
			})]
		});

		// arrange
		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();
		oMultiComboBox.focus();

		// act
		var oDomRefArrow = oMultiComboBox.getDomRef("arrow");
		sap.ui.test.qunit.triggerTouchEvent("touchstart", oDomRefArrow, {
			target : oDomRefArrow
		});
		sap.ui.test.qunit.triggerEvent("focusout", oMultiComboBox.getDomRef());

		// assertions
		assert.ok(!oMultiComboBox.$().hasClass(MultiComboBoxRenderer.CSS_CLASS_MULTICOMBOBOX + "Focused"),
				'The MultiComboBox must not have the css class “' + MultiComboBoxRenderer.CSS_CLASS_MULTICOMBOBOX + 'Focused”');

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("FocusBorder - control + leave", function(assert) {
		// system under test
		var oMultiComboBox = new MultiComboBox({
			items : [new Item({
				key : "DZ",
				text : "Algeria"
			})]
		});

		// arrange
		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();
		oMultiComboBox.focus();

		// act
		var oDomRef = oMultiComboBox.getFocusDomRef();
		sap.ui.test.qunit.triggerTouchEvent("touchstart", oDomRef, {
			target : oDomRef
		});
		sap.ui.test.qunit.triggerEvent("focusout", oDomRef);

		// assertions
		assert.ok(!oMultiComboBox.$().hasClass(MultiComboBoxRenderer.CSS_CLASS_MULTICOMBOBOX + "Focused"),
				'The MultiComboBox must not have the css class “' + MultiComboBoxRenderer.CSS_CLASS_MULTICOMBOBOX + 'Focused”');

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("Input Value - reset on focus out", function(assert) {
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
		oMultiComboBox.placeAt("MultiComboBox-content");
		oMultiComboBoxNext.placeAt("MultiComboBox-content");

		sap.ui.getCore().applyChanges();
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
		this.clock.reset();
	});

	QUnit.test("Input Value - select Item on Tab out", function(assert) {

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
		oMultiComboBox.placeAt("MultiComboBox-content");
		oMultiComboBoxNext.placeAt("MultiComboBox-content");

		sap.ui.getCore().applyChanges();

		// act
		oMultiComboBox.getFocusDomRef().focus();
		sap.ui.test.qunit.triggerCharacterInput(oMultiComboBox.getFocusDomRef(), "Algeria");
		sap.ui.test.qunit.triggerKeydown(oMultiComboBox.getDomRef(), KeyCodes.TAB);

		// assertions
		assert.strictEqual(oMultiComboBox.getValue(), "",
				'The InputValue of the MultiComboBox must be resetted (empty) when user tabs to next control.');
		assert.strictEqual(oMultiComboBox.getSelectedItems()[0].getKey(), "DZ");

		// cleanup
		oMultiComboBox.destroy();
		oMultiComboBoxNext.destroy();
	});

	QUnit.test("Keep picker open after re-rendering", function(assert) {
		// system under test
		var oMultiComboBox = new MultiComboBox({
			items : [new Item({
				key : "DZ",
				text : "Algeria"
			})]
		});

		// arrange
		oMultiComboBox.placeAt("MultiComboBox-content");

		sap.ui.getCore().applyChanges();

		oMultiComboBox.focus();

		oMultiComboBox.open();

		this.clock.tick(500);
		oMultiComboBox.getList().getItems()[0].focus();

		// act
		oMultiComboBox.rerender();

		this.clock.tick(500);

		// assertions
		assert.ok(oMultiComboBox.isOpen(), "oMultiComboBox is open");
		assert.ok(oMultiComboBox.getList().getItems()[0].getDomRef() === document.activeElement, "First Item of list is focused");

		// cleanup
		oMultiComboBox.destroy();
		this.clock.reset();
	});

	QUnit.test("Cancel selection", function(assert) {
		// system under test
		this.stub(Device, "system", {
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
		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();
		this.clock.tick(300);

		oMultiComboBox.open();
		this.clock.tick(1000);


		oMultiComboBox.setSelectedItems([oItem]);
		oMultiComboBox.getPicker().getCustomHeader().getContentRight()[0].firePress();
		this.clock.tick(300);

		assert.strictEqual(oMultiComboBox.getSelectedItems().length, 0, "No items selected after cancel selection");

		// cleanup
		oMultiComboBox.destroy();
		this.clock.reset();
	});

	QUnit.test("method: _setContainerSizes() - Calculating correct sizes", function(assert) {
		// system under test
		var oSystem = {
			desktop : false,
			phone : true,
			tablet : false
		};

		this.stub(Device, "system", oSystem);
		this.stub(jQuery.device, "is", oSystem);

		var oMultiComboBox = new MultiComboBox({
			id : "MultiComboBox",
			width : "400px",
			placeholder : "Choose your country"
		});

		// arrange
		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();
		this.clock.tick(1000);

		// assertions
		assert.ok(oMultiComboBox.getDomRef().clientWidth >= oMultiComboBox.$().find(".sapMInputBaseInner")[0].clientWidth,
			"Check if the size of the container is calculated correctly.");

		// cleanup
		oMultiComboBox.destroy();
		this.clock.reset();
	});

	QUnit.test("setSelection + Popover close race condition", function (assert) {
		// system under test
		this.stub(Device, "system", {
			desktop: true,
			phone: false,
			tablet: true
		});

		var oItem = new Item({text: "Example"});
		var oMCB = new MultiComboBox({
			items: [oItem]
		}).placeAt("MultiComboBox-content");

		var oSpyFireSelectionFinish = this.spy(oMCB, "fireSelectionFinish");
		var oSpySetSelection = this.spy(oMCB, "setSelection");

		sap.ui.getCore().applyChanges();

		oMCB.open();
		sap.ui.getCore().applyChanges();
		this.clock.tick(500);

		//Act
		oMCB.close();
		oMCB.setSelection({
			fireChangeEvent: true,
			id: oItem.getId(),
			item: oItem,
			key: "",
			listItemUpdated: true,
			suppressInvalidate: true
		});

		//Assert
		assert.strictEqual(oSpySetSelection.callCount, 1, "setSelection executed");
		assert.strictEqual(oSpyFireSelectionFinish.callCount, 0, "fireSelectionFinish not called yet");

		//Act. Close the popover
		this.clock.tick(500);

		//Assert
		assert.ok(oSpySetSelection.calledBefore(oSpyFireSelectionFinish), "setSelection should be called before fireSelectionFinish.");
		assert.strictEqual(oSpySetSelection.callCount, 1, "setSelection executed last run.");
		assert.strictEqual(oSpyFireSelectionFinish.callCount, 1, "fireSelectionFinish is called async after setSelection");
		assert.ok(oSpyFireSelectionFinish.calledWithMatch({selectedItems: [oItem]}), "fireSelectionFinish should return an array within object containing the selected items.");

		oMCB.destroy();
	});

	QUnit.test("Selecting an item should close the picker and clean the input", function(assert) {
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

		var oHandleTokensStub = sinon.stub(Event.prototype, "getParameter");

		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();

		oMultiComboBox.open();
		this.clock.tick(300);

		oMultiComboBox._sOldValue = "t";
		oMultiComboBox._bCheckBoxClicked = false;
		oMultiComboBox.setValue("t");
		oMultiComboBox.fireChange({ value: "t" });
		oMultiComboBox.oninput(oFakeInput);
		sap.ui.getCore().applyChanges();

		oHandleTokensStub.withArgs("listItem").returns(oMultiComboBox.getListItem(oItem));
		oHandleTokensStub.withArgs("selected").returns(true);

		oMultiComboBox._handleSelectionLiveChange(oFakeEvent);
		sap.ui.getCore().applyChanges();
		this.clock.tick(300);

		assert.strictEqual(oMultiComboBox.isOpen(), false, "Picker should close after selection");
		assert.strictEqual(oMultiComboBox.getValue(), "", "Value should be empty");

		oFakeInput = null;
		oMultiComboBox.destroy();
		oHandleTokensStub.restore();
	});

	QUnit.test("Selecting an item checkbox should not close the picker", function(assert) {
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

		var oHandleTokensStub = sinon.stub(Event.prototype, "getParameter"),
			oFocusinStub = sinon.stub(MultiComboBox.prototype, "onfocusin");

		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();

		oMultiComboBox.open();
		this.clock.tick(300);

		oMultiComboBox._sOldValue = "t";
		oMultiComboBox._bCheckBoxClicked = true;
		oMultiComboBox.setValue("t");
		oMultiComboBox.fireChange({ value: "t" });
		oMultiComboBox.oninput(oFakeInput);
		sap.ui.getCore().applyChanges();

		oHandleTokensStub.withArgs("listItem").returns(oMultiComboBox.getListItem(oItem));
		oHandleTokensStub.withArgs("selected").returns(true);

		oMultiComboBox._handleSelectionLiveChange(oFakeEvent);
		sap.ui.getCore().applyChanges();
		this.clock.tick(300);

		assert.strictEqual(oMultiComboBox.isOpen(), true, "Picker should not close after selection");
		assert.strictEqual(oMultiComboBox.getValue(), "t", "Value should be t");

		oFakeInput = null;
		oMultiComboBox.destroy();
		oHandleTokensStub.restore();
		oFocusinStub.restore();
	});

	QUnit.module("Focus handling");

	QUnit.test("Focusing a token inside the MCB should not add css focus indication to the MCB itself", function(assert) {
		var oItem = new Item({ text: "test" }),
			oFakeEvent = new Event(),
			oMultiComboBox = new MultiComboBox({
				items: [oItem]
			}).placeAt("MultiComboBox-content");

		var oHandleTokenFocusStub = sinon.stub(Event.prototype, "getParameter");

		sap.ui.getCore().applyChanges();

		oMultiComboBox.setSelectedItems([oItem]);

		oHandleTokenFocusStub.withArgs("type", "focusin");
		oHandleTokenFocusStub.withArgs("target", oMultiComboBox._oTokenizer.getTokens()[0].getDomRef());

		oMultiComboBox.onfocusin(oFakeEvent);

		assert.notOk(oMultiComboBox.$().hasClass("sapMMultiComboBoxFocus"), "The MCB must not have the css sapMMultiComboBoxFocus");

		//cleanup
		oFakeEvent.destroy();
		oHandleTokenFocusStub.restore();
		oMultiComboBox.destroy();
	});

	QUnit.test("Invalidating MCB should not set the focus to it when the focus has been outside it", function(assert) {
		// system under test
		this.stub(Device, "system", {
			desktop: true,
			phone: false,
			tablet: true
		});

		var oButton = new Button({
			press: function() {
				oMultiComboBox.invalidate();
			}
		}).placeAt("MultiComboBox-content"),
			oMultiComboBox = new MultiComboBox({
				items: [
					new Item({
						text: "Example"
					})
				]
			}).placeAt("MultiComboBox-content");

		sap.ui.getCore().applyChanges();

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

	QUnit.test("Tokenizer should scroll to end when focus is outside MCB", function(assert) {

		var oFakeEvent = sap.ui.base.Event,
			oMultiComboBox = new MultiComboBox({
				items: [
					new Item({
						text: "Example"
					})
				]
			}).placeAt("MultiComboBox-content");

		var oSpy = sinon.spy(oMultiComboBox._oTokenizer, "scrollToEnd");
		oHandleFocusleaveStub = sinon.stub(Event.prototype, "getParameter");

		sap.ui.getCore().applyChanges();

		oHandleFocusleaveStub.withArgs("relatedControlId").returns(null);
		oMultiComboBox.onsapfocusleave(oFakeEvent);

		// assert
		assert.ok(oSpy.called, "Tokenizer's scrollToEnd should be called when focus is outside MCB");

		// cleanup
		oSpy.restore();
		oHandleFocusleaveStub.restore();
		oMultiComboBox.destroy();
	});

	QUnit.test("Change event should be called on focusleave", function (assert) {
		var oMultiComboBox = new MultiComboBox({ value: "A" }).placeAt("MultiComboBox-content"),
			oStub = this.stub(oMultiComboBox, "fireChangeEvent"),
			oFakeEvent = {};

		// act
		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();

		//act
		oMultiComboBox.onsapfocusleave(oFakeEvent);

		// assert
		assert.ok(oStub.called, "change should be called");
		assert.ok(oStub.calledWith("", { value: "A" }), "change should be called with empty values");

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("Change event should not be called if the old value does not differ from the current one", function (assert) {
		var oMultiComboBox = new MultiComboBox().placeAt("MultiComboBox-content"),
			oStub = this.stub(oMultiComboBox, "fireChangeEvent"),
			oFakeEvent = {};

		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();

		// act
		oMultiComboBox.onsapfocusleave(oFakeEvent);

		// assert
		assert.notOk(oStub.called, "change should be called");

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test('Endless focus loop should not be triggered when Dialog is opened on mobile', function(assert) {
		// system under test
		this.stub(Device, "system", {
			desktop: false,
			phone: true,
			tablet: false
		});
		var oMultiComboBox = new MultiComboBox().placeAt("MultiComboBox-content"),
			oStub = sinon.stub(MultiComboBox.prototype, "onfocusin");

		sap.ui.getCore().applyChanges();

		oMultiComboBox.open();
		this.clock.tick(500);

		assert.ok(!oStub.called, "onfocusin of the MCB should not be triggered after dialog is opened");

		oMultiComboBox.close();
		this.clock.tick(500);

		oStub.restore();
		oMultiComboBox.destroy();
	});

	QUnit.test('Endless focus loop should not be triggered when token is deleted on phone', function(assert) {
		// system under test
		this.stub(Device, "system", {
			desktop: false,
			phone: true,
			tablet: false
		});
		var oItem = new Item({ text: "test" }),
			oFakeEvent = new Event(),
			oMultiComboBox = new MultiComboBox({
				items: [oItem]
			}).placeAt("MultiComboBox-content"),
			oSpy = sinon.spy(MultiComboBox.prototype, "focus"),
			oHandleTokensStub = sinon.stub(Event.prototype, "getParameter");

		oMultiComboBox.setSelectedItems([oItem]);
		sap.ui.getCore().applyChanges();

		oHandleTokensStub.withArgs("type").returns(Tokenizer.TokenChangeType.Removed);
		oHandleTokensStub.withArgs("token").returns(oMultiComboBox._oTokenizer.getTokens()[0]);
		oMultiComboBox._handleTokenChange(oFakeEvent);
		this.clock.tick(300);

		assert.ok(!oSpy.called, "onfocusin of the MCB should not be triggered after a token is deleted");

		oSpy.restore();
		oFakeEvent.destroy();
		oHandleTokensStub.restore();
		oMultiComboBox.destroy();
	});

	QUnit.test("Focus should be set to the first item of the list if no item is selected", function(assert) {
		// arrange
		var oItem = new Item(),
			oMultiComboBox = new MultiComboBox({
				items: [ oItem ]
			}),
			oFakeEvent = {
				setMarked: function () {},
				keyCode: 111 // dommy code
			};
		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();

		// act
		oMultiComboBox.onsapshow(oFakeEvent);
		this.clock.tick(500);

		// assert
		assert.strictEqual(oMultiComboBox.getList().getItemNavigation().iSelectedIndex, 0, "Initial index should be 0");

		//delete
		oMultiComboBox.destroy();
	});

	QUnit.test("Focus should be set to the first selected item if there are any selected", function(assert) {
		// arrange
		var oItem = new Item(),
			oMultiComboBox = new MultiComboBox({
				items: [ new Item(), oItem ],
				selectedItems: [ oItem ]
			}),
			oFakeEvent = {
				setMarked: function () {},
				keyCode: 111 // dommy code
			};
		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();

		// act
		oMultiComboBox.onsapshow(oFakeEvent);
		this.clock.tick(500);

		// assert
		assert.strictEqual(oMultiComboBox.getList().getItemNavigation().iSelectedIndex, 1, "Initial index should be 1");

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("Focus should be set to the item for which a token have been focused", function(assert) {
		// arrange
		var oItem1 = new Item( { text: "1" }),
			oItem2 = new Item( { text: "2" }),
			oMultiComboBox = new MultiComboBox({
				items: [ new Item({ text: "3" }), oItem1,  oItem2],
				selectedItems: [ oItem1, oItem2 ]
			}),
			oFakeEvent = {
				setMarked: function () {},
				keyCode: 111 // dommy code
			};
		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();

		oMultiComboBox._oTokenizer.getTokens()[1].focus();
		this.clock.tick(500);

		// act
		oMultiComboBox.onsapshow(oFakeEvent);
		this.clock.tick(500);

		// assert
		assert.strictEqual(oMultiComboBox.getList().getItemNavigation().iSelectedIndex, 2, "Initial index should be 2");

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("focusin triggers tokenizer scrolling only once", function(assert) {
		// arrange
		var done = assert.async(),
			oMultiComboBox = new MultiComboBox({
				selectedKeys: ["Item1", "Item2"],
				items: [
					new Item({key: "Item1", text: "Item1"}),
					new Item({key: "Item2", text: "Item2"})
				]
			}), oTokenizer = oMultiComboBox._oTokenizer,
				oSpy;

		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();

		oSpy = this.spy(oMultiComboBox._oTokenizer, "scrollToEnd");
		oTokenizer.getTokens()[0].focus();
		sap.ui.getCore().applyChanges();

		// assert
		setTimeout(function(){
			assert.ok(oSpy.calledOnce, "Tokenizer's scrollToEnd should be called one onfocusin.");
			done();
			oMultiComboBox.destroy();
		}, 0);

		this.clock.tick();

	});

	QUnit.module("Accessibility");

	QUnit.test("getAccessibilityInfo", function(assert) {
		var oMultiComboBox = new MultiComboBox({
			value: "Value",
			tooltip: "Tooltip",
			placeholder: "Placeholder",
			items: [
				new Item({key: "Item1", text: "Item1"}),
				new Item({key: "Item2", text: "Item2"}),
				new Item({key: "Item3", text: "Item3"})
			]
		});
		assert.ok(!!oMultiComboBox.getAccessibilityInfo, "MultiComboBox has a getAccessibilityInfo function");
		var oInfo = oMultiComboBox.getAccessibilityInfo();
		assert.ok(!!oInfo, "getAccessibilityInfo returns a info object");
		assert.strictEqual(oInfo.role, oMultiComboBox.getRenderer().getAriaRole(), "AriaRole");
		assert.strictEqual(oInfo.type, sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("ACC_CTR_TYPE_MULTICOMBO"), "Type");
		assert.strictEqual(oInfo.description, "Value Placeholder Tooltip", "Description");
		assert.strictEqual(oInfo.focusable, true, "Focusable");
		assert.strictEqual(oInfo.enabled, true, "Enabled");
		assert.strictEqual(oInfo.editable, true, "Editable");
		oMultiComboBox.setValue("");
		oMultiComboBox.setEnabled(false);
		oInfo = oMultiComboBox.getAccessibilityInfo();
		assert.strictEqual(oInfo.description, "Placeholder Tooltip", "Description");
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
		assert.strictEqual(oInfo.description, "Placeholder Tooltip Item1 Item2", "Description");
		oMultiComboBox.destroy();
	});

	QUnit.test("Tokens information should be read out", function(assert) {
		var oItem1 = new Item({key: "Item1", text: "Item1"}),
			oItem2 = new Item({key: "Item2", text: "Item2"}),
			oMultiComboBox = new MultiComboBox({
				items: [oItem1, oItem2]
			}),
			sInvisibleTextId = oMultiComboBox._oTokenizer.getTokensInfoId(),
			oInvisibleText = sap.ui.getCore().byId(sInvisibleTextId);

		oMultiComboBox.placeAt("MultiComboBox-content");

		// assert
		assert.strictEqual(oInvisibleText.getText(), oResourceBundle.getText("TOKENIZER_ARIA_CONTAIN_TOKEN"), "'MultiComboBox may contain tokens' text is set.");

		// act
		oMultiComboBox.setSelectedKeys(["Item1"]);
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(oInvisibleText.getText(), oResourceBundle.getText("TOKENIZER_ARIA_CONTAIN_ONE_TOKEN"), "'MultiComboBox contains 1 token' text is set.");

		// act
		oMultiComboBox.setSelectedKeys(["Item1", "Item2"]);

		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(oInvisibleText.getText(), oResourceBundle.getText("TOKENIZER_ARIA_CONTAIN_SEVERAL_TOKENS", 2), "'MultiComboBox contains N tokens' text is set.");

		// destroy
		oItem1.destroy();
		oItem2.destroy();
		oMultiComboBox.destroy();
	});

	QUnit.test("MultiComboBox with accessibility=false", function(assert) {
		var oStub =  sinon.stub(sap.ui.getCore().getConfiguration(), "getAccessibility").returns(false),
			oMultiComboBox = new MultiComboBox();

		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();

		assert.ok(!!oMultiComboBox.getDomRef(), "The MultiComboBox should be rendered, when accessibility is off.");

		oStub.restore();
		oMultiComboBox.destroy();
	});


	QUnit.module("Keyboard handling", {
		beforeEach: function(){
			this.oFirstItem = new Item({key: "Item1", text: "Item1"});
			this.oMultiComboBox = new MultiComboBox({
				items: [
					this.oFirstItem,
					new Item({key: "Item2", text: "Item2"}),
					new Item({key: "Item3", text: "Item3"})
				]
			});
			this.oTokenizer = this.oMultiComboBox._oTokenizer;
			this.oMultiComboBox.placeAt("MultiComboBox-content");
			sap.ui.getCore().applyChanges();
		}, afterEach: function() {
			this.oMultiComboBox.destroy();
		}
	});

	QUnit.test("_getNextTraversalItem should return the right traversal item", function (assert) {
		var oNextItem = this.oMultiComboBox._getNextTraversalItem(),
				oPreviousItem = this.oMultiComboBox._getPreviousTraversalItem(),
				aItems = this.oMultiComboBox.getItems();

		// Assert
		assert.strictEqual(oNextItem.getText(), 'Item1', "Should return the first item");
		assert.strictEqual(oPreviousItem.getText(), 'Item3', "Should return the last item");

		// Act
		this.oMultiComboBox.setSelectedItems([aItems[0], aItems[2]]); // The first and last item
		sap.ui.getCore().applyChanges();

		// Assert
		oNextItem = this.oMultiComboBox._getNextTraversalItem();
		oPreviousItem = this.oMultiComboBox._getPreviousTraversalItem();
		assert.ok(oNextItem.getText() !== 'Item1', "Should not return the first item anymore as it's selected already");
		assert.ok(oPreviousItem.getText() !== 'Item3', "Should not return the last item anymore as it's selected already");
	});

	QUnit.test("onsapend should trigger Tokenizer's onsapend", function (assert) {
		var oSapEndSpy = sinon.spy(Tokenizer.prototype, "onsapend");

		this.oMultiComboBox.onsapend();
		this.clock.tick();

		assert.ok(oSapEndSpy.called, "onsapend of the Tokenizer should be called");
		assert.ok(oSapEndSpy.calledOn(this.oTokenizer), "onsapend should be called on the internal Tokenizer");
	});

	QUnit.test("onsaphome should trigger Tokenizer's onsaphome", function (assert) {
		var oSapEndSpy = sinon.spy(Tokenizer.prototype, "onsaphome");

		this.oMultiComboBox.onsaphome();
		this.clock.tick();

		assert.ok(oSapEndSpy.called, "onsaphome of the Tokenizer should be called");
		assert.ok(oSapEndSpy.calledOn(this.oTokenizer), "onsapend should be called on the internal Tokenizer");
	});

	QUnit.test("onsapdown should update input's value with first item's text", function (assert) {
		sap.ui.test.qunit.triggerKeydown(this.oMultiComboBox.getDomRef(), KeyCodes.ARROW_DOWN);
		this.clock.tick(100);

		assert.strictEqual(this.oFirstItem.getText(), this.oMultiComboBox.getValue(), "Item's text should be the same as input's value");
	});

	QUnit.test("onsapup should update input's value with previous selectable item's text", function (assert) {
		sap.ui.test.qunit.triggerKeydown(this.oMultiComboBox.getDomRef(), KeyCodes.ARROW_DOWN);
		sap.ui.test.qunit.triggerKeydown(this.oMultiComboBox.getDomRef(), KeyCodes.ARROW_DOWN);
		this.clock.tick(100);

		sap.ui.test.qunit.triggerKeydown(this.oMultiComboBox.getDomRef(), KeyCodes.ARROW_UP);
		this.clock.tick(100);

		assert.strictEqual(this.oFirstItem.getText(), this.oMultiComboBox.getValue(), "Item's text should be the same as input's value");
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

	QUnit.module("Mobile mode (dialog)");

	QUnit.test("Prevent endless focus loop on mobile", function(assert) {
		//arrange
		this.stub(Device, "system", {
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
			}).placeAt("MultiComboBox-content"),
			oFakeEvent = new Event(),
			fnTapSpy = sinon.spy(oMultiComboBox, "onfocusin");

		oFakeEvent.relatedControlId = oMultiComboBox.getPicker().getId();
		sap.ui.getCore().applyChanges();

		//act
		sap.ui.test.qunit.triggerTouchEvent("tap", oMultiComboBox.getFocusDomRef(), {
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

	QUnit.test("Tap on input field on mobile", function(assert) {
		//arrange
		this.stub(Device, "system", {
			desktop: false,
			phone: true,
			tablet: false
		});
		var oMultiComboBox = new MultiComboBox().placeAt("MultiComboBox-content"),
			fnOpenSpy = sinon.spy(oMultiComboBox, "open");

		sap.ui.getCore().applyChanges();

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

	QUnit.test("_getFilterSelectedButton()", function(assert) {
		this.stub(Device, "system", {
			desktop: false,
			tablet: false,
			phone: true
		});

		var oFirstItem = new Item({key: "Item1", text: "Item1"});
		var oMultiComboBox = new MultiComboBox({
			items: [
				oFirstItem,
				new Item({key: "Item2", text: "Item2"}),
				new Item({key: "Item3", text: "Item3"})
			]
		});

		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();

		var oHeaderButton = oMultiComboBox.getPicker().getSubHeader().getContent()[1];

		assert.equal(oHeaderButton, oMultiComboBox._getFilterSelectedButton(), "Header button should be the second element in subheader's content of the Dialog");

		oMultiComboBox.destroy();
	});

	QUnit.test("_filterSelectedItems()", function(assert) {
		this.stub(Device, "system", {
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
		}), oSelectedButton = oMultiComboBox._getFilterSelectedButton();

		var oFakeEvent = {
			target: {
				value: "I"
			},
			setMarked: function () { },
			srcControl: oMultiComboBox
		};
		oMultiComboBox.setSelectedItems([oFirstItem]);

		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();

		oMultiComboBox.open();
		this.clock.tick(300);
		oSelectedButton.setPressed(true);
		oMultiComboBox._filterSelectedItems({"oSource": oSelectedButton});
		sap.ui.getCore().applyChanges();
		this.clock.tick(300);

		assert.strictEqual(oMultiComboBox.getVisibleItems().length, 1, "Only one item should be visible");
		assert.strictEqual(oSelectedButton.getPressed(),true,"the SelectedButton is pressed");

		oMultiComboBox.fireChange({ value: "I" });
		oMultiComboBox.oninput(oFakeEvent);
		sap.ui.getCore().applyChanges();

		assert.strictEqual(oMultiComboBox.getVisibleItems().length, 3, "All three items are visible");
		assert.strictEqual(oSelectedButton.getPressed(), false, "the SelectedButton is not pressed");
		this.clock.tick(300);

		oMultiComboBox.close();
		this.clock.tick(300);

		oMultiComboBox.destroy();
	});

	QUnit.test("_filterSelectedItems() with grouping", function(assert) {
		this.stub(Device, "system", {
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
		}), oSelectedButton = oMultiComboBox._getFilterSelectedButton();

		var oFakeEvent = {
			target: {
				value: "I"
			},
			setMarked: function () { },
			srcControl: oMultiComboBox
		};
		oMultiComboBox.setSelectedItems([oFirstItem]);

		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();

		oMultiComboBox.open();
		this.clock.tick(300);
		oSelectedButton.setPressed(true);
		oMultiComboBox._filterSelectedItems({"oSource": oSelectedButton});
		sap.ui.getCore().applyChanges();
		this.clock.tick(300);

		assert.strictEqual(oMultiComboBox.getSelectedItems().length, 1, "There is one selected item");
		assert.strictEqual(oMultiComboBox.getVisibleItems().length, 2, "Only one item should be visible");
		assert.strictEqual(oSelectedButton.getPressed(),true,"the SelectedButton is pressed");

		oMultiComboBox.oninput(oFakeEvent);
		sap.ui.getCore().applyChanges();

		assert.strictEqual(oMultiComboBox.getVisibleItems().length, 5, "All three items are visible");
		assert.strictEqual(oSelectedButton.getPressed(), false, "the SelectedButton is not pressed");
		this.clock.tick(300);

		oMultiComboBox.close();
		this.clock.tick(300);

		oMultiComboBox.destroy();
	});

	QUnit.test("Popup should have ariaLabelledBy that points to the PopupHiddenLabelId", function(assert) {
		var oItem = new Item({
			key: "li",
			text: "lorem ipsum"
		}), oMultiComboBox = new MultiComboBox({
				items: [
					oItem
				]
		}), oResourceBundleOptions = oResourceBundle.getText("COMBOBOX_AVAILABLE_OPTIONS");

		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();

		assert.equal(sap.ui.getCore().byId(oMultiComboBox.getPickerInvisibleTextId()).getText(), oResourceBundleOptions, 'popup ariaLabelledBy is set');
		oMultiComboBox.destroy();
	});


	QUnit.module("Integrations");

	QUnit.test("Data binding: update model data", function (assert) {
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
		oMultiCombo.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();

		assert.strictEqual(oMultiCombo.getSelectedKeys().length, 1, "Selected keys are set to 1 item.");
		assert.strictEqual(oMultiCombo.getSelectedItems().length, 1, "Selected items are set to 1 item.");
		assert.deepEqual(oMultiCombo.getSelectedKeys(), oData.selectedCustomKeys, "Selected keys are properly propagated.");
		assert.strictEqual(oMultiCombo.getSelectedItems()[0].getKey(), oData.selectedCustomKeys[0], "Selected items are properly propagated.");

		oModel.setProperty("/ProductCollection", oData2);
		sap.ui.getCore().applyChanges();

		assert.strictEqual(oMultiCombo.getSelectedKeys().length, 1, "Selected keys remain to 1.");
		assert.strictEqual(oMultiCombo.getSelectedItems().length, 1, "Selected keys remain to 1.");
		assert.deepEqual(oMultiCombo.getSelectedKeys(), oData.selectedCustomKeys, "Selected keys are not changed as the same item is in the new data.");
		assert.strictEqual(oMultiCombo.getSelectedItems()[0].getKey(), oData.selectedCustomKeys[0], "Selected items are not changed as the same item is in the new data.");

		oMultiCombo.destroy();
		oModel.destroy();
	});

	QUnit.test("Data binding: update seelctedkeys after model's value is formatted", function (assert) {
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

		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();

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
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(oMultiComboBox._oTokenizer.getTokens().length, 1, 'Only one token should be shown');

		// cleanup
		oMultiComboBox.destroy();
		oModel.destroy();
	});

	QUnit.module("highlighting");

	QUnit.test("_boldItemRef should return a bold string", function(assert) {
		var oFunctionRef = MultiComboBox.prototype._boldItemRef;

		assert.strictEqual(oFunctionRef("Test", /^t/i, 1), "<b>T</b>est");
		assert.strictEqual(oFunctionRef("Test", /^Test/i, 4), "<b>Test</b>");
		assert.strictEqual(oFunctionRef("Test", /^/i, 0), "Test");
		assert.strictEqual(oFunctionRef("Test (TE)", /^Test/i, 4), "<b>Test</b>&#x20;&#x28;TE&#x29;");

	});

	QUnit.test("_boldItemRef bold starts with per term", function (assert) {
		var oFunctionRef = MultiComboBox.prototype._boldItemRef,
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

	QUnit.test("_highlightList doesn't throw an error when showSecondaryValues=true and sap.ui.core.Item is set", function(assert) {

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
		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();
		oMultiComboBox.focus();

		// act
		oMultiComboBox.open();
		this.clock.tick(1000);

		// assert
		assert.strictEqual(fnOnAfterOpenSpy.callCount, 1, "onAfterOpen() called exactly once");

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("_highlightList doesn't throw an error when combobox's value contains special characters", function(assert) {

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
		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();
		oMultiComboBox._highlightList("(T");

		// act
		oMultiComboBox.open();
		this.clock.tick(1000);

		// assert
		assert.strictEqual(fnOnAfterOpenSpy.callCount, 1, "onAfterOpen() called exactly once");

		// cleanup
		oMultiComboBox.destroy();
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
			fnWarningSpy = this.spy(log, "warning"),
			fnDefaultFilterSpy = this.stub(ComboBoxBase, "DEFAULT_TEXT_FILTER");

		// null is passed for a filter
		this.oMultiComboBox.setFilterFunction(null);
		assert.notOk(fnWarningSpy.called, "Warning should not be logged in the console when filter is null");

		this.oMultiComboBox.filterItems({ value:  "", items: this.oMultiComboBox.getItems() });
		assert.ok(ComboBoxBase.DEFAULT_TEXT_FILTER.called, "Default text filter should be applied");

		// undefined is passed for a filter
		this.oMultiComboBox.setFilterFunction(undefined);
		assert.notOk(fnWarningSpy.called, "Warning should not be logged in the console when filter is undefined");

		this.oMultiComboBox.filterItems({ value:  "", items: this.oMultiComboBox.getItems() });
		assert.ok(ComboBoxBase.DEFAULT_TEXT_FILTER.called, "Default text filter should be applied");

		// wrong filter type is passed
		this.oMultiComboBox.setFilterFunction({});
		assert.ok(fnWarningSpy.called, "Warning should be logged in the console when filter is not a function");

		this.oMultiComboBox.filterItems({ value:  "", items: this.oMultiComboBox.getItems() });
		assert.ok(ComboBoxBase.DEFAULT_TEXT_FILTER.called, "Default text filter should be applied");
	});

	QUnit.test("Setting a valid filter should apply on items", function (assert) {
		var log = sap.ui.require('sap/base/Log'),
		fnFilterSpy = this.spy();

		// null is passed for a filter
		this.oMultiComboBox.setFilterFunction(fnFilterSpy);

		// act
		var aFilteredItems = this.oMultiComboBox.filterItems({ value: "B", items: this.oMultiComboBox.getItems() });

		assert.ok(fnFilterSpy.called, "Filter should be called");
		assert.strictEqual(aFilteredItems.length, 0, "Zero items should be filtered");
	});

	QUnit.test("Setting a valid filter should apply on items and their text", function (assert) {
		// arrange
		this.oMultiComboBox.addItem(new Item({ text: "Bbbb" }));

		// act
		var aFilteredItems = this.oMultiComboBox.filterItems({ value: "B", items: this.oMultiComboBox.getItems() });

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
		var aFilteredItems = this.oMultiComboBox.filterItems({ value: "B", items: this.oMultiComboBox.getItems() });
		assert.strictEqual(aFilteredItems.length, 2, "Two items should be filtered");
		assert.strictEqual(this.oMultiComboBox.getVisibleItems().length, 4, "There are two visible items with their group names");
	});

	QUnit.test("Default filtering should be per term", function (assert) {
		var aFilteredItems = this.oMultiComboBox.filterItems({ value: "K", items: this.oMultiComboBox.getItems() });

		assert.strictEqual(aFilteredItems.length, 1, "One item should be filtered");
		assert.strictEqual(aFilteredItems[0].getText(), "Hong Kong", "Hong Kong item is matched by 'K'");
	});


	QUnit.module("Tablet focus handling");

	QUnit.test("it should not set the focus to the input", function(assert) {
		this.stub(Device, "system", {
			desktop: false,
			tablet: true,
			phone: false
		});

		var oMultiComboBox = new MultiComboBox(),
			oFakeEvent = null,
			oFocusinStub = this.stub(oMultiComboBox, "focus");

		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();

		oFakeEvent = { target: oMultiComboBox.getDomRef("arrow") };

		oMultiComboBox.onfocusin(oFakeEvent);

		assert.strictEqual(oFocusinStub.callCount, 0, "Focus should not be called");

		oMultiComboBox.destroy();
		oFocusinStub.restore();
	});

	QUnit.module("Collapsed state (N-more)", {
		beforeEach : function() {
			var aItems = [new Item({text: "XXXX"}),
				new Item({text: "XXXX"}),
				new Item({text: "XXXX"}),
				new Item({text: "XXXX"})];

			this.oMCB1 = new MultiComboBox({
				items: aItems,
				selectedItems: aItems,
				width: "200px"
			});
			this.oMCB1.placeAt("MultiComboBox-content");

			sap.ui.getCore().applyChanges();
		},
		afterEach : function() {
			this.oMCB1.destroy();
		}
	});

	QUnit.test("onfocusin", function(assert) {
		var oIndicator = this.oMCB1.$().find(".sapMTokenizerIndicator"),
			oEventMock = {
				target : {
					classList: {
						contains: function () {
							return false;
						}
					}
				}
			};

		//assert
		assert.ok(oIndicator[0], "A n-more label is rendered");

		//close and open the picker
		this.oMCB1.onfocusin(oEventMock);
		// assert
		assert.ok(oIndicator.hasClass("sapUiHidden"), "The n-more label is hidden on focusin.");
	});

	QUnit.test("SelectedItems Popover's interaction", function(assert) {
		// act
		this.oMCB1.$().find(".sapMTokenizerIndicator")[0].click();
		this.clock.tick(200);

		// deselect the first item
		jQuery(this.oMCB1.getPicker().getContent()[0].getItems()[0]).tap();
		this.clock.tick(200);
		// assert
		assert.strictEqual(this.oMCB1.getSelectedItems().length, 3, "A selected item was removed after deselecting an item from the popover");
	});

	QUnit.test("_calculateSpaceForTokenizer", function(assert) {
		var oMultiComboBox = new MultiComboBox(),
			output;

		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();

		oMultiComboBox.$().find(".sapMMultiComboBoxInputContainer").removeClass("sapMMultiComboBoxInputContainer");
		sap.ui.getCore().applyChanges();

		output = oMultiComboBox._calculateSpaceForTokenizer();

		assert.strictEqual(isNaN(parseInt(output, 10)), false, "_calculateSpaceForTokenizer returns a valid value");

		oMultiComboBox.destroy();
	});

	QUnit.test("tokenizer's adjustTokensVisibility is called on initial rendering", function (assert) {
		//arrange
		var oMCB = new MultiComboBox();
		var oTokenizerSpy = this.spy(oMCB._oTokenizer, "_adjustTokensVisibility");

		// act
		oMCB.placeAt("MultiComboBox-content");
		this.clock.tick(100);

		// assert
		assert.ok(oMCB._oTokenizer._getAdjustable(), "the tokenizer is adjustable");
		assert.ok(oTokenizerSpy.called, "tokenizer's _adjustTokensVisibility is called");

		// clean up
		oMCB.destroy();
	});

	QUnit.test("Sync Items with Tokens", function (assert) {
		// Setup
		var oIndicator = this.oMCB1.$().find(".sapMTokenizerIndicator");

		// Act
		this.oMCB1.setWidth("30px");
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(oIndicator.text(), oResourceBundle.getText("TOKENIZER_SHOW_ALL_ITEMS", 4));

		// Act
		this.oMCB1.getItems()[0].setEnabled(false);
		sap.ui.getCore().applyChanges();

		// assert
		oIndicator = this.oMCB1.$().find(".sapMTokenizerIndicator");
		assert.strictEqual(oIndicator.text(), oResourceBundle.getText("TOKENIZER_SHOW_ALL_ITEMS", 3));
	});

	QUnit.module("Expanded state (N-more)", {
		beforeEach : function() {
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
			this.oMCB1.placeAt("MultiComboBox-content");

			sap.ui.getCore().applyChanges();
		},
		afterEach : function() {
			this.oMCB1.destroy();
		}
	});

	QUnit.test("Desktop: Selected items are grouped when picker is opened", function(assert) {
		this.stub(Device, "system", {
			desktop: true,
			phone: false,
			tablet: false
		});
		this.oMCB1.$().find(".sapMTokenizerIndicator")[0].click();
		this.clock.tick(200);

		//assert
		assert.strictEqual(this.oMCB1.getSelectedItems().length, 2, "There are two selected items");
		assert.strictEqual(this.oMCB1.getVisibleItems().length, 4, "The selected items are shown grouped");
	});

	QUnit.test("Phone: Selected items are grouped when picker is opened", function(assert) {
		this.stub(Device, "system", {
			desktop: false,
			phone: true,
			tablet: false
		});
		this.oMCB1.$().find(".sapMTokenizerIndicator")[0].click();
		this.clock.tick(200);

		//assert
		assert.strictEqual(this.oMCB1.getSelectedItems().length, 2, "There are two selected items");
		assert.strictEqual(this.oMCB1.getVisibleItems().length, 4, "The selected items are shown grouped");
	});

	QUnit.module("Type-ahead");

	QUnit.test("Desktop: Basic interaction", function (assert) {
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

		this.stub(Device, "system", oSystem);
		this.stub(jQuery.device, "is", oSystem);

		// arrange
		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();

		// act
		oInputDomRef = oMultiComboBox.getDomRef("inner");
		oMultiComboBox.oninput(oFakeEvent);
		this.clock.tick(500);
		// assert
		assert.strictEqual(oInputDomRef.value, "Algeria", "Correct value autocompleted on input.");

		// act
		sap.ui.test.qunit.triggerKeyboardEvent(oMultiComboBox.getFocusDomRef(), KeyCodes.ARROW_DOWN, false, false);
		this.clock.tick(500);
		// assert
		assert.strictEqual(oInputDomRef.value, "A", "Autocompleted text is removed after navigation into options list.");

		// act
		sap.ui.test.qunit.triggerKeyboardEvent(oMultiComboBox.getList().getItems()[0].getDomRef(), KeyCodes.ARROW_UP, false, false);
		this.clock.tick(500);
		// assert
		assert.strictEqual(oInputDomRef.value, "Algeria", "Correct value autocompleted when navigating with arrow from list item to input field.");

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("Desktop: Autocomplete + Item selection", function (assert) {
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
		}), oInputDomRef, aListItems,
			oList = oMultiComboBox.getList(),
			oInputEvent = {
				target: {
					value: "A"
				},
				srcControl: oMultiComboBox,
				setMarked: function () {}
			};

		this.stub(Device, "system", oSystem);
		this.stub(jQuery.device, "is", oSystem);

		// arrange
		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();

		// act
		aListItems = oList.getItems();
		oInputDomRef = oMultiComboBox.getDomRef("inner");

		oMultiComboBox.oninput(oInputEvent);
		this.clock.tick(500);
		// assert
		assert.strictEqual(oInputDomRef.value, "Algeria",
				"Correct value autocompleted on input.");

		// act - select item from list
		oList.setSelectedItem(aListItems[0], true, true);
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
		oList.setSelectedItem(aListItems[1], true, true);
		this.clock.tick(500);
		// assert
		assert.strictEqual(oInputDomRef.value, "",
				"Autocompleted value removed after item selection by pressing an list item.");

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("Phone: Autocomplete + Item selection", function (assert) {
		var oSystem = {
			desktop : false,
			phone : true,
			tablet : false
		};
		this.stub(Device, "system", oSystem);
		this.stub(jQuery.device, "is", oSystem);

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
			}),
			oList = oMultiComboBox.getList(), aListItems,
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
		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();

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

	QUnit.module("Two Column Layout", {
		beforeEach: function(){
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
			}).placeAt("MultiComboBox-content");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function(){
			this.oMultiComboBox.destroy();
		}
	});

	QUnit.test("Highlighting", function(){
		var oFakeEvent = {
			target: {
				value: "a"
			},
			setMarked: function () { },
			srcControl: this.oMultiComboBox
		}, oListItemRef;

		this.oMultiComboBox.oninput(oFakeEvent);
		this.clock.tick(2000);

		oListItemRef = this.oMultiComboBox.getList().getItems()[0].$();
		assert.strictEqual(oListItemRef.find(".sapMSLITitleOnly")[0].innerHTML,
			"<b>A</b>lgeria", "The main text is correctly highlighted.");

		assert.strictEqual(oListItemRef.find(".sapMSLIInfo")[0].innerHTML,
			"<b>A</b>L", "The additional text is correctly highlighted.");
	});

	QUnit.test("StandardListItem mapping", function(){
		var oFakeEvent = {
			target: {
				value: "a"
			},
			setMarked: function () { },
			srcControl: this.oMultiComboBox
		}, aListItems = [],
			aSuggestions = this.oMultiComboBox.getItems();

		this.oMultiComboBox.open();
		this.clock.tick(2000);

		aListItems = this.oMultiComboBox.getList().getItems();

		for (var i = 0; i < 3; i++) {
			assert.strictEqual(aListItems[i].getTitle(), aSuggestions[i].getText(), "Item " + i + " text is correctly mapped.");
			assert.strictEqual(aListItems[i].getInfo(), aSuggestions[i].getAdditionalText(), "Item " + i + " info is correctly mapped.");
		}
	});

	QUnit.module("Width calculations");

	QUnit.test("_syncInputWidth", function(assert) {
		var oMultiComboBox = new MultiComboBox({
			items: [
				new Item({
					key : "0",
					text : "item 0"
				}),
				new Item({
					key : "1",
					text : "item 1"
				})
			]
		}),
		oSyncInput = this.spy(oMultiComboBox, "_syncInputWidth");

		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();
		this.clock.tick(1000);

		assert.strictEqual(oSyncInput.callCount, 1);

		oMultiComboBox.setSelectedKeys(["0"]);
		this.clock.tick(1000);

		assert.strictEqual(oSyncInput.callCount, 2);

		oMultiComboBox.setSelectedKeys([]);
		this.clock.tick(1000);

		assert.strictEqual(oSyncInput.callCount, 3);

		oSyncInput.restore();
		oMultiComboBox.destroy();
	});

	QUnit.module("Grouping", {
		beforeEach : function() {
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
			this.oMultiComboBox.placeAt("MultiComboBox-content");

			sap.ui.getCore().applyChanges();
		},
		afterEach : function() {
			this.oMultiComboBox.destroy();
		}
	});

	QUnit.test("The groups names are not filtered", function(assert) {
		var aFilteredItems = this.oMultiComboBox.filterItems({ value: "A", items: this.oMultiComboBox.getItems() });
		assert.strictEqual(aFilteredItems.length, 0, "There is no filtered items");
	});

	QUnit.test("_mapItemToList()", function(assert) {
		var groupHeader = this.oMultiComboBox.getList().getItems()[0];
		assert.ok(groupHeader instanceof sap.m.GroupHeaderListItem, "The control used for the group name is instance of sap.m.GroupHeaderListItem");
	});

	QUnit.module("Composition characters handling", {
		beforeEach: function () {
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
			}).placeAt("MultiComboBox-content");

			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.multiComboBox.destroy();
			this.multiComboBox = null;
		}
	});

	QUnit.test("Filtering", function (assert) {

		// act
		var bMatched = ComboBoxBase.DEFAULT_TEXT_FILTER("서", this.multiComboBox.getItems()[0], "getText");
		var aFilteredItems = this.multiComboBox.filterItems({ value: "서", items: this.multiComboBox.getItems() });

		// assert
		assert.ok(bMatched, "'DEFAULT_TEXT_FILTER' should match composite characters");
		assert.strictEqual(aFilteredItems.length, 2, "Two items should be filtered");
		assert.strictEqual(aFilteredItems[0].getText(), "서비스 ID", "Text should start with 서");
	});

	QUnit.test("Composititon events", function (assert) {
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

		// act
		this.multiComboBox.oncompositionstart(oFakeEvent);
		this.multiComboBox.oninput(oFakeEvent);
		this.clock.tick(300);

		// assert
		assert.ok(oHandleInputEventSpy.called, "handleInputValidation should be called on input");
		assert.notOk(oHandleTypeAheadSpy.called, "Type ahed should not be called while composing");
		assert.notOk(oHandleFieldValueStateSpy.called, "Field Validation should not be called while composing");
	});
});