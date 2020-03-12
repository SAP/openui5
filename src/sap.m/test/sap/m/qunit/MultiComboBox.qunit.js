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
	"sap/ui/dom/containsOrEquals",
	"sap/ui/core/SeparatorItem",
	"sap/ui/core/InvisibleText"
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
	containsOrEquals,
	SeparatorItem,
	InvisibleText
) {
	// shortcut for sap.ui.core.OpenState
	var OpenState = coreLibrary.OpenState;

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	createAndAppendDiv("MultiComboBox-content").setAttribute("class", "select-content");



	var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");

	function enterNewText (oMC, sText) {
		oMC.setValue("");
		sap.ui.test.qunit.triggerKeydown(oMC.getDomRef(), KeyCodes.ENTER);
		sap.ui.getCore().applyChanges();

		sap.ui.test.qunit.triggerCharacterInput(oMC.getFocusDomRef(), sText);
		sap.ui.test.qunit.triggerKeydown(oMC.getDomRef(), KeyCodes.ENTER);

		sap.ui.getCore().applyChanges();
	}

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
			oMultiComboBox.syncPickerContent();
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
		}).placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();

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
		oMultiComboBox.syncPickerContent();
		var fnAddAggregationSpy = this.spy(oMultiComboBox, "addAggregation");
		var fnListAddAggregationSpy = this.spy(oMultiComboBox._getList(), "addAggregation");
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
		oMultiComboBox.syncPickerContent();
		var fnAddAggregationSpy = this.spy(oMultiComboBox, "addAggregation");
		var fnListAddAggregationSpy = this.spy(oMultiComboBox._getList(), "addAggregation");
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
		oMultiComboBox.syncPickerContent();
		var fnAddAggregationSpy = this.spy(oMultiComboBox, "addAggregation");
		var fnListAddAggregationSpy = this.spy(oMultiComboBox._getList(), "addAggregation");
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
		oMultiComboBox.syncPickerContent();
		var fnAddAggregationSpy = this.spy(oMultiComboBox, "addAggregation");
		var fnListAddAggregationSpy = this.spy(oMultiComboBox._getList(), "addAggregation");
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
		oMultiComboBox.syncPickerContent();
		var fnAddAggregationSpy = this.spy(oMultiComboBox, "addAggregation");
		var fnListAddAggregationSpy = this.spy(oMultiComboBox._getList(), "addAggregation");
		var fnAddItemSpy = this.spy(oMultiComboBox, "addItem");

		// act
		oMultiComboBox.addItem(null);

		// assertions
		assert.ok(fnAddAggregationSpy.calledWith("items", null),
				"sap.m.MultiComboBox.addAggregation() method was called with the expected arguments");
		assert.ok(fnListAddAggregationSpy.calledWith("items", null),
				"sap.m.List.addAggregation() method was called with the expected arguments");
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
		oMultiComboBox.syncPickerContent();
		var fnInsertAggregation = this.spy(oMultiComboBox, "insertAggregation");
		var fnListInsertAggregation = this.spy(oMultiComboBox._getList(), "insertAggregation");
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
		oMultiComboBox.syncPickerContent();
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
		oMultiComboBox.syncPickerContent();
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
		oMultiComboBox.syncPickerContent();
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
		oMultiComboBox.syncPickerContent();
		sap.ui.getCore().applyChanges();

		// assertions
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), ["01", "02"]);
		assert.deepEqual(oMultiComboBox.getSelectedItems(), [oItem1, oItem2]);

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("it should not purge selected keys from the items", function (assert) {
		// system under test
		var oMultiComboBox = new MultiComboBox({
			items: [
				new Item({key: "1", text: "1"}),
				new Item({key: "2", text: "2"})
			]
		}).placeAt("MultiComboBox-content");

		sap.ui.getCore().applyChanges();

		// Act
		oMultiComboBox.addSelectedKeys(["", "", "1", "2", ""]);
		sap.ui.getCore().applyChanges();

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
		oMultiComboBox.syncPickerContent();
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
			oMultiComboBox.syncPickerContent();
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
		oMultiComboBox.syncPickerContent();
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
		oMultiComboBox.syncPickerContent();
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
				assert.equal(oMultiComboBox._getList().$().find("#" + oMultiComboBox.getListItem(oItem1).getId()).length, 0,
						'The first Listitem should not be shown');
				assert.equal(oMultiComboBox._getList().$().find("#" + oMultiComboBox.getListItem(oItem2).getId()).length, 1,
						'The second Listitem should be shown');
				assert.equal(oMultiComboBox._getList().$().find("#" + oMultiComboBox.getListItem(oItem3).getId()).length, 1,
						'The third Listitem should be shown');
				assert.ok(!oMultiComboBox._getList().$().find("#" + oMultiComboBox.getListItem(oItem3).getId()).hasClass(
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
		assert.equal(oMultiComboBox._getList().$().find("#" + oMultiComboBox.getListItem(oItem1).getId()).length, 0,
				'The first Listitem should not be shown');
		assert.equal(oMultiComboBox._getList().$().find("#" + oMultiComboBox.getListItem(oItem2).getId()).length, 1,
				'The second Listitem should be shown');
		assert.equal(oMultiComboBox._getList().$().find("#" + oMultiComboBox.getListItem(oItem3).getId()).length, 0,
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
		assert.equal(oMultiComboBox._getList().$().find("#" + oMultiComboBox.getListItem(oItem1).getId()).length, 0,
				'The first Listitem should not be shown');
		assert.equal(oMultiComboBox._getList().$().find("#" + oMultiComboBox.getListItem(oItem2).getId()).length, 1,
				'The second Listitem should be shown');
		assert.equal(oMultiComboBox._getList().$().find("#" + oMultiComboBox.getListItem(oItem3).getId()).length, 1,
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
		oMultiComboBox.syncPickerContent();
		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();

		// act
		oMultiComboBox.setSelectable(oItem3, false);
		oMultiComboBox.open();
		this.clock.tick(500);

		// assertions
		assert.equal(oMultiComboBox._getList().$().find("#" + oMultiComboBox.getListItem(oItem1).getId()).length, 1,
				'The first Listitem should be shown');
		assert.equal(oMultiComboBox._getList().$().find("#" + oMultiComboBox.getListItem(oItem2).getId()).length, 1,
				'The second Listitem should be shown');
		assert.equal(oMultiComboBox._getList().$().find("#" + oMultiComboBox.getListItem(oItem3).getId()).length, 0,
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
		assert.equal(oMultiComboBox._getList().$().find("#" + oMultiComboBox.getListItem(oItem1).getId()).length, 1,
				'The first Listitem should be shown');
		assert.equal(oMultiComboBox._getList().$().find("#" + oMultiComboBox.getListItem(oItem2).getId()).length, 1,
				'The second Listitem should be shown');
		assert.equal(oMultiComboBox._getList().$().find("#" + oMultiComboBox.getListItem(oItem3).getId()).length, 1,
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
		assert.equal(oMultiComboBox._getList().$().find("#" + oMultiComboBox.getListItem(oItem1).getId()).length, 1,
				'The first Listitem should be shown');
		assert.equal(oMultiComboBox._getList().$().find("#" + oMultiComboBox.getListItem(oItem2).getId()).length, 1,
				'The second Listitem should be shown');
		assert.equal(oMultiComboBox._getList().$().find("#" + oMultiComboBox.getListItem(oItem3).getId()).length, 1,
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
		assert.equal(oMultiComboBox._getList().$().find("#" + oMultiComboBox.getListItem(oItem1).getId()).length, 1,
				'The first Listitem should be shown');
		assert.equal(oMultiComboBox._getList().$().find("#" + oMultiComboBox.getListItem(oItem2).getId()).length, 1,
				'The second Listitem should be shown');
		assert.equal(oMultiComboBox._getList().$().find("#" + oMultiComboBox.getListItem(oItem3).getId()).length, 1,
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
		assert.equal(oMultiComboBox._getList().$().find("#" + oMultiComboBox.getListItem(oItem1).getId()).length, 1,
				'The first Listitem should be shown');
		assert.equal(oMultiComboBox._getList().$().find("#" + oMultiComboBox.getListItem(oItem2).getId()).length, 1,
				'The second Listitem should be shown');
		assert.equal(oMultiComboBox._getList().$().find("#" + oMultiComboBox.getListItem(oItem3).getId()).length, 1,
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
		oMultiComboBox.syncPickerContent();
		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();

		// act
		oMultiComboBox.getListItem(oMultiComboBox.getFirstItem()).setVisible(false);
		oMultiComboBox.clearFilter();
		oMultiComboBox.open();
		this.clock.tick(500);

		// assertions
		assert.equal(oMultiComboBox._getList().$().find("#" + oMultiComboBox.getListItem(oItem1).getId()).length, 1,
				'The first Listitem should be shown');
		assert.equal(oMultiComboBox._getList().$().find("#" + oMultiComboBox.getListItem(oItem2).getId()).length, 1,
				'The second Listitem should be shown');
		assert.equal(oMultiComboBox._getList().$().find("#" + oMultiComboBox.getListItem(oItem3).getId()).length, 1,
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
		assert.equal(oMultiComboBox._getList().$().find("#" + oMultiComboBox.getListItem(oItem1).getId()).length, 0,
				'The first Listitem should not be shown');
		assert.equal(oMultiComboBox._getList().$().find("#" + oMultiComboBox.getListItem(oItem2).getId()).length, 1,
				'The second Listitem should be shown');
		assert.equal(oMultiComboBox._getList().$().find("#" + oMultiComboBox.getListItem(oItem3).getId()).length, 1,
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
		oMultiComboBox.syncPickerContent();
		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();

		// act
		oMultiComboBox.getListItem(oMultiComboBox.getFirstItem()).setVisible(false);
		oMultiComboBox.clearFilter();
		oMultiComboBox.open();
		this.clock.tick(500);

		// assertions
		assert.equal(oMultiComboBox._getList().$().find("#" + oMultiComboBox.getListItem(oItem1).getId()).length, 0,
				'The first Listitem should not be shown');
		assert.equal(oMultiComboBox._getList().$().find("#" + oMultiComboBox.getListItem(oItem2).getId()).length, 1,
				'The second Listitem should be shown');
		assert.equal(oMultiComboBox._getList().$().find("#" + oMultiComboBox.getListItem(oItem3).getId()).length, 1,
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
		oMultiComboBox.syncPickerContent();
		oMultiComboBox.getListItem(oMultiComboBox.getFirstItem()).setVisible(false);
		oMultiComboBox.clearFilter();
		oMultiComboBox.open();
		this.clock.tick(500);

		// assertions
		assert.equal(oMultiComboBox._getList().$().find("#" + oMultiComboBox.getListItem(oItem1).getId()).length, 1,
				'The first Listitem should be shown');
		assert.equal(oMultiComboBox._getList().$().find("#" + oMultiComboBox.getListItem(oItem2).getId()).length, 1,
				'The second Listitem should be shown');
		assert.equal(oMultiComboBox._getList().$().find("#" + oMultiComboBox.getListItem(oItem3).getId()).length, 1,
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
		oMultiComboBox.syncPickerContent();
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
		oMultiComboBox.syncPickerContent();
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
		/* TODO remove after the end of support for Internet Explorer */
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
			oMultiComboBox.syncPickerContent();
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

	QUnit.test("Paste value behaviour", function (assert) {
		var oMultiComboBox = new MultiComboBox({
			items : [oItem = new Item({
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
		this.clock.tick(300);

		// assert
		assert.ok(oHandleInputEventSpy.called, "handleInputValidation should be called on input");
		assert.ok(oUpdateDomValueSpy.called, "Update DOM value should be called while pasting value");
		assert.ok(oHandleTypeAheadSpy.called, "Type ahead should be called while pasting value");
	});


	QUnit.test("Focus out cleanup", function (assert) {
		// Arrange
		var oMultiComboBox = new MultiComboBox();
		oMultiComboBox._bIsPasteEvent = true;
		oMultiComboBox.sUpdateValue = "Test";
		var oUpdateDomValueSpy = this.spy(oMultiComboBox, "updateDomValue");

		// Act
		oMultiComboBox._handleInputFocusOut();
		this.clock.tick(300);

		// Assert
		assert.notOk(oMultiComboBox._bIsPasteEvent, "Should reset _bIsPasteEvent variable");
		assert.ok(oUpdateDomValueSpy.called, "DOM value should be called");
		assert.ok(oUpdateDomValueSpy.calledWith(""), "DOM value should be updated");
	});

	QUnit.test("Scenario 'EVENT_VALUE_LINE_BREAK_PASTE': CTRL+V 'item1 item2' ", function(assert) {
		/* TODO remove after the end of support for Internet Explorer */
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
			oMultiComboBox.syncPickerContent();
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
		sap.ui.test.qunit.triggerKeydown(oMultiComboBox.getFocusDomRef(), KeyCodes.BACKSPACE); // select last token

		// assert
		assert.strictEqual(document.activeElement, oMultiComboBox._oTokenizer.getTokens()[0].getDomRef(),
			"The focus is forwarded to the token.");

		// act
		sap.ui.test.qunit.triggerKeydown(document.activeElement, KeyCodes.BACKSPACE); // delete selected token
		sap.ui.getCore().applyChanges();

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
		// assert
		assert.strictEqual(document.activeElement, oMultiComboBox._oTokenizer.getTokens()[0].getDomRef(),
			"The focus is forwarded to the token.");

		// act
		sap.ui.test.qunit.triggerKeydown(document.activeElement, KeyCodes.DELETE); // delete selected token
		sap.ui.getCore().applyChanges();

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
		oMultiComboBox.syncPickerContent();
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

	QUnit.test("Scenario 'EVENT_VALUE_ENTER_OPENLIST': 'alg' + ENTER", function(assert) {
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

	QUnit.test("Read-only popover should be opened on ENTER keypress", function (assert) {
		// arrange
		var aItems = [
				new Item("it1", {text: "this is a long text"}),
				new Item("it2", {text: "this is another long text"})
			], oMCB = new MultiComboBox({
				width: "8rem",
				editable: false,
				items: aItems,
				selectedItems: ["it1", "it2"]
			});

		// act
		oMCB.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();
		var oHandleIndicatorPressSpy = sinon.spy(oMCB, "_handleIndicatorPress");

		// assert
		assert.ok(oMCB._getReadOnlyPopover(), "Readonly Popover should be created");

		// act
		qutils.triggerKeydown(oMCB.getFocusDomRef(), KeyCodes.ENTER);
		this.clock.tick(500);

		// assert
		assert.ok(containsOrEquals(oMCB._oReadOnlyPopover.getDomRef(), document.activeElement),
			"Popover should be on focus when opened");
		assert.ok(oHandleIndicatorPressSpy.called, "MultiComboBox's _handleIndicatorPress is called");

		// delete
		oHandleIndicatorPressSpy.restore();
		oMCB.destroy();
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
		oMultiComboBox.syncPickerContent();
		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();
		oMultiComboBox.focus();

		// act - 'alg' + OpenList + Enter
		sap.ui.test.qunit.triggerCharacterInput(document.activeElement, "alg");
		sap.ui.test.qunit.triggerKeyboardEvent(document.activeElement, KeyCodes.ENTER);
		sap.ui.test.qunit.triggerKeyboardEvent(document.activeElement, KeyCodes.ARROW_DOWN, false, true);
		sap.ui.test.qunit.triggerKeyboardEvent(document.activeElement, KeyCodes.ARROW_UP, false, true);

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
		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();
		oMultiComboBox.focus();

		// act - 'al' + OpenList + Enter
		sap.ui.test.qunit.triggerCharacterInput(document.activeElement, "al");
		sap.ui.test.qunit.triggerKeyboardEvent(document.activeElement, KeyCodes.ENTER);
		sap.ui.test.qunit.triggerKeyboardEvent(document.activeElement, KeyCodes.ARROW_DOWN, false, true);
		sap.ui.test.qunit.triggerKeyboardEvent(document.activeElement, KeyCodes.ARROW_UP, false, true);
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
		oMultiComboBox.syncPickerContent();
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
		oMultiComboBox.syncPickerContent();
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
		oMultiComboBox.syncPickerContent();
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
		oMultiComboBox.syncPickerContent();
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
		oMultiComboBox.syncPickerContent();
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
		oMultiComboBox.syncPickerContent();
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
		oMultiComboBox.syncPickerContent();
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
				oMultiComboBox.syncPickerContent();
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
				oMultiComboBox.syncPickerContent();
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
				'The MultiComboBox must have the css class "' + InputBase.ICON_PRESSED_CSS_CLASS + '"');
		assert.strictEqual(oMultiComboBox.getFocusDomRef().getAttribute("aria-expanded"), "true", "aria-expanded should be true");

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
				'The MultiComboBox must not have the css class "' + InputBase.ICON_PRESSED_CSS_CLASS + '"');
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
		assert.ok(oMultiComboBox.isOpen(), "oMultiComboBox is open");
		assert.ok(!oMultiComboBox._isListInSuggestMode(), 'Complete list is open');
		assert.ok(oMultiComboBox.$().hasClass(InputBase.ICON_PRESSED_CSS_CLASS),
				'The MultiComboBox must have the css class "' + InputBase.ICON_PRESSED_CSS_CLASS + '"');

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

	QUnit.test("FocusBorder - pressed on read-only control", function(assert) {

		// system under test
		var oMultiComboBox = new MultiComboBox({
			items : [new Item({
				key : "DZ",
				text : "Algeria"
			})],
			editable: false
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

		oMultiComboBox.syncPickerContent();
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
		oMultiComboBox._getList().getItems()[0].focus();

		// act
		oMultiComboBox.rerender();

		this.clock.tick(500);

		// assertions
		assert.ok(oMultiComboBox.isOpen(), "oMultiComboBox is open");
		assert.ok(oMultiComboBox._getList().getItems()[0].getDomRef() === document.activeElement, "First Item of list is focused");

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
		oMCB.syncPickerContent();

		var oSpyFireSelectionFinish = this.spy(oMCB, "fireSelectionFinish");
		var oSpySetSelection = this.spy(oMCB, "setSelection");
		var oList = oMCB.getList();

		sap.ui.getCore().applyChanges();

		oMCB.open();
		sap.ui.getCore().applyChanges();
		this.clock.tick(500);

		var oFakeEvent = {
			id: oList.getId(),
			listItem: oList.getItems()[0],
			getParameter: function (sParam) {
				if (sParam === "listItem") {
					return oList.getItems()[0];
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

	QUnit.test("Selecting an item checkbox should not add the old input value in the field", function(assert) {
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
			oHandleTokensStub = sinon.stub(Event.prototype, "getParameter"),
			oFocusinStub = sinon.stub(MultiComboBox.prototype, "onfocusin");


		// act
		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();
		oMultiComboBox.getFocusDomRef().focus();

		oMultiComboBox.setValue("t");
		oMultiComboBox.fireChange({ value: "t" });
		oMultiComboBox.oninput(oFakeInput);

		oHandleTokensStub.withArgs("listItem").returns(oMultiComboBox.getListItem(oItem));
		oHandleTokensStub.withArgs("selected").returns(true);

		oMultiComboBox.getFocusDomRef().blur();
		this.clock.tick(300);

		oMultiComboBox.open();
		this.clock.tick(300);

		oMultiComboBox._handleSelectionLiveChange(oFakeEvent);
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(oMultiComboBox.getValue(), "", "Value should be cleared");

		// clean up
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
		assert.strictEqual(oMultiComboBox._getList().getItemNavigation().iSelectedIndex, 0, "Initial index should be 0");

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
		assert.strictEqual(oMultiComboBox._getList().getItemNavigation().iSelectedIndex, 1, "Initial index should be 1");

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
		oMultiComboBox.syncPickerContent();
		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();

		oMultiComboBox._oTokenizer.getTokens()[1].focus();
		this.clock.tick(500);

		// act
		oMultiComboBox.onsapshow(oFakeEvent);
		this.clock.tick(500);

		// assert
		assert.strictEqual(oMultiComboBox._getList().getItemNavigation().iSelectedIndex, 2, "Initial index should be 2");

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

		oMultiComboBox.syncPickerContent();
		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();

		oSpy = this.spy(oMultiComboBox._oTokenizer, "scrollToEnd");
		oTokenizer.getTokens()[0].focus();
		sap.ui.getCore().applyChanges();

		// assert
		setTimeout(function(){
			assert.notOk(oSpy.called, "Tokenizer's scrollToEnd should not be called on focusining a token.");
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
		assert.strictEqual(oInfo.description, "Value", "Description");
		assert.strictEqual(oInfo.focusable, true, "Focusable");
		assert.strictEqual(oInfo.enabled, true, "Enabled");
		assert.strictEqual(oInfo.editable, true, "Editable");
		oMultiComboBox.setValue("");
		oMultiComboBox.setEnabled(false);
		oInfo = oMultiComboBox.getAccessibilityInfo();
		assert.strictEqual(oInfo.description, "", "Description");
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

		//arrange
		sInvisibleTextId = InvisibleText.getStaticId("sap.m", "MULTICOMBOBOX_OPEN_NMORE_POPOVER");

		// act
		oMultiComboBox.setEditable(false);
		oMultiComboBox.setWidth("50px");

		sap.ui.getCore().applyChanges();
		this.clock.tick(300);

		//assert
		assert.ok(oMultiComboBox.getFocusDomRef().getAttribute('aria-labelledBy').indexOf(sInvisibleTextId) !== -1, "Input has aria-labelledby attribute to indicate Enter press possibility");

		// destroy
		oItem1.destroy();
		oItem2.destroy();
		oMultiComboBox.destroy();
	});

	if (Device.browser.internet_explorer) {
		QUnit.test("AriaDescribedBy announcement", function(assert) {
			var oItem1 = new Item({key: "Item1", text: "Item1"}),
				oItem2 = new Item({key: "Item2", text: "Item2"}),
				oMultiComboBox = new MultiComboBox({
					items: [oItem1, oItem2]
				}),
				sInvisibleTextId = oMultiComboBox._oTokenizer.getTokensInfoId(),
				oInvisibleText = sap.ui.getCore().byId(sInvisibleTextId);

			oMultiComboBox.placeAt("MultiComboBox-content");
			sap.ui.getCore().applyChanges();

			var	oInvisibleText1 = oMultiComboBox.oInvisibleText;

			//assert
			assert.ok(oMultiComboBox.$("inner").attr("aria-describedby").length > 0, "Property aria-describedby should exist");
			assert.strictEqual(oInvisibleText.getText(), oResourceBundle.getText("TOKENIZER_ARIA_CONTAIN_TOKEN") , "'MultiComboBox may contain tokens' text is announced.");
			assert.strictEqual(oInvisibleText1.getText(), oResourceBundle.getText("ACC_CTR_TYPE_COMBO") , "'Combobox' is announced");

			// destroy
			oItem1.destroy();
			oItem2.destroy();
			oMultiComboBox.destroy();
		});
	}

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
		this.oMultiComboBox.syncPickerContent();

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

	QUnit.test("_getNextTraversalItem should return the group header item when not opened", function (assert) {
		// Arrange
		var oGroupHeaderItem = new SeparatorItem({text: "Group Header"}),
			oNextItem, oPreviousItem, aItems;

		this.oMultiComboBox.insertItem(oGroupHeaderItem, 0);
		this.oMultiComboBox.syncPickerContent();
		sap.ui.getCore().applyChanges();

		oNextItem = this.oMultiComboBox._getNextTraversalItem();
		oPreviousItem = this.oMultiComboBox._getPreviousTraversalItem();
		aItems = this.oMultiComboBox.getItems();

		// Assert
		assert.strictEqual(oNextItem.getText(), 'Item1', "Should return the first item");
		assert.strictEqual(oPreviousItem.getText(), 'Item3', "Should return the last item");

		// Act
		this.oMultiComboBox.setSelectedItems([aItems[1], aItems[3]]); // The first and last item
		sap.ui.getCore().applyChanges();

		// Assert
		oNextItem = this.oMultiComboBox._getNextTraversalItem();
		oPreviousItem = this.oMultiComboBox._getPreviousTraversalItem();
		assert.ok(oNextItem.getText() !== 'Item1', "Should not return the first item anymore as it's selected already");
		assert.ok(oPreviousItem.getText() !== 'Item3', "Should not return the last item anymore as it's selected already");
	});

	QUnit.test("_getNextTraversalItem should return the first non group item when opened", function (assert) {
		// Arrange
		var oGroupHeaderItem = new SeparatorItem({text: "Group Header"}),
			oNextItem, oPreviousItem, aItems;

		this.oMultiComboBox.insertItem(oGroupHeaderItem, 0);
		this.oMultiComboBox.open();
		sap.ui.getCore().applyChanges();

		oNextItem = this.oMultiComboBox._getNextTraversalItem();
		oPreviousItem = this.oMultiComboBox._getPreviousTraversalItem();
		aItems = this.oMultiComboBox.getItems();

		// Assert
		assert.strictEqual(oNextItem.getText(), 'Group Header', "Should return the first item");
		assert.strictEqual(oPreviousItem.getText(), 'Item3', "Should return the last item");

		// Act
		this.oMultiComboBox.setSelectedItems([aItems[1], aItems[3]]); // The first and last item
		sap.ui.getCore().applyChanges();

		// Assert
		oNextItem = this.oMultiComboBox._getNextTraversalItem();
		oPreviousItem = this.oMultiComboBox._getPreviousTraversalItem();
		assert.ok(oNextItem.getText() !== 'Item1', "Should not return the first item anymore as it's selected already");
		assert.ok(oNextItem.getText() === 'Group Header', "Should return the group header item's text");
		assert.ok(oPreviousItem.getText() !== 'Item3', "Should not return the last item anymore as it's selected already");
	});

	QUnit.test("onsapend should focus the input if the tokenizer has forwarded the focus", function (assert) {
		var oEvent = {isMarked: function(sKey){ if (sKey === "forwardFocusToParent") { return true;}}};

		this.oMultiComboBox.onsapend(oEvent);
		this.clock.tick();

		assert.strictEqual(this.oMultiComboBox.getFocusDomRef(), document.activeElement, "The input is focused");
	});

	QUnit.test("onsaphome should trigger Tokenizer's onsaphome", function (assert) {
		var oToken,
			oSapHomeSpy = sinon.spy(Tokenizer.prototype, "onsaphome"),
			oItem = new sap.ui.core.Item({text: "text123", key: "key123"});

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

		sap.ui.getCore().applyChanges();

		// act
		oToken = this.oMultiComboBox._oTokenizer.getTokens()[0];
		qutils.triggerKeydown(this.oMultiComboBox.getDomRef(), KeyCodes.HOME);
		this.clock.tick();

		qutils.triggerKeydown(this.oMultiComboBox.getDomRef(), KeyCodes.HOME);
		this.clock.tick();

		// assert
		assert.strictEqual(oToken.getDomRef(), document.activeElement, "The first token is selected");
		assert.ok(oSapHomeSpy.called, "onsaphome of the Tokenizer should be called");
		assert.ok(oSapHomeSpy.calledOn(this.oTokenizer), "onsapend should be called on the internal Tokenizer");

		// clean up
		oSapHomeSpy.restore();
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

	QUnit.test("onsaptabprevious should select the highlighted item", function (assert) {
		// Assert
		assert.strictEqual(this.oMultiComboBox.getSelectedKeys().length, 0, "No items should be selected");

		// Act
		this.oMultiComboBox.open();
		this.oMultiComboBox.focus();
		this.oMultiComboBox.setValue("Item1");
		this.oMultiComboBox.onkeydown({});

		this.oMultiComboBox.onsaptabprevious();

		sap.ui.getCore().applyChanges();

		// Assert
		assert.strictEqual(this.oMultiComboBox.getSelectedKeys().length, 1, "The first item should be selected");
		assert.strictEqual(this.oMultiComboBox.getSelectedItems()[0].getText(), "Item1", "The first item should be selected");
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

		oMultiComboBox.syncPickerContent();
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

	QUnit.test("_selectItemByKey should set items with valid keys only", function(assert) {
		// Arrange
		var oMultiComboBox = new MultiComboBox();
		var oAddAssociationStub = sinon.stub(oMultiComboBox, "addAssociation");
		var oFakeEvent = {
			setMarked: function () {}
		};
		var fnTestFunction = function() {
			return "Test";
		};
		var aMockItems = [
			{
				getId: fnTestFunction,
				getText: fnTestFunction,
				data: fnTestFunction,
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
				data: fnTestFunction,
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
				data: fnTestFunction,
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
				data: fnTestFunction,
				getKey: fnTestFunction,
				isA: function () {
					return false;
				},
				sId: "item3"
			}
		];



		var oGetUnselectedItemsStub = sinon.stub(oMultiComboBox, "_getUnselectedItems", function() {
			return aMockItems;
		}),
		oGetEnabledStub = sinon.stub(oMultiComboBox, "getEnabled", function () {
			return true;
		}),
		oGetListItemStub = sinon.stub(oMultiComboBox, "getListItem", function (oItem) {
			return {
				isSelected: function () {
					return false;
				}
			};
		}),
		oGetValueStub = sinon.stub(oMultiComboBox, "getValue", fnTestFunction),
		oSetSelectionSpy = sinon.spy(oMultiComboBox, "setSelection");

		// Act
		oMultiComboBox._selectItemByKey(oFakeEvent);
		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();
		this.clock.tick(300);

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
		oGetUnselectedItemsStub.restore();
		oAddAssociationStub.restore();
		oGetEnabledStub.restore();
		oGetListItemStub.restore();
		oGetValueStub.restore();
		oSetSelectionSpy.restore();
		oMultiComboBox.destroy();
	});

	QUnit.test("_selectItemByKey should set sap.ui.coreItems only", function(assert) {
		// Arrange
		var oMultiComboBox = new MultiComboBox();
		var oAddAssociationStub = sinon.stub(oMultiComboBox, "addAssociation");
		var oFakeEvent = {
			setMarked: function () {}
		};

		var fnTestFunction = function() {
			return "Test";
		};
		var aMockItems = [
			{
				getId: fnTestFunction,
				getText: fnTestFunction,
				data: fnTestFunction,
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
				data: fnTestFunction,
				getKey: fnTestFunction,
				isA: function () {
					return false;
				},
				sId: "Test"
			},
			{
				getId: fnTestFunction,
				getText: fnTestFunction,
				data: fnTestFunction,
				getKey: fnTestFunction,
				isA: function () {
					return false;
				},
				sId: "item2"
			}
		];

		var oGetUnselectedItemsStub = sinon.stub(oMultiComboBox, "_getUnselectedItems", function() {
				return aMockItems;
			}),
			oGetEnabledStub = sinon.stub(oMultiComboBox, "getEnabled", function () {
				return true;
			}),
			oGetListItemStub = sinon.stub(oMultiComboBox, "getListItem", function (oItem) {
				return {
					isSelected: function () {
						return false;
					}
				};
			}),
			oGetValueStub = sinon.stub(oMultiComboBox, "getValue", fnTestFunction),
			oSetSelectionSpy = sinon.spy(oMultiComboBox, "setSelection");

		// Act
		oMultiComboBox._selectItemByKey(oFakeEvent);
		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();
		this.clock.tick(300);

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
		oGetUnselectedItemsStub.restore();
		oAddAssociationStub.restore();
		oGetEnabledStub.restore();
		oGetListItemStub.restore();
		oGetValueStub.restore();
		oSetSelectionSpy.restore();
		oMultiComboBox.destroy();
	});

	QUnit.test("onsapenter on mobile device", function(assert) {

		// system under test
		this.stub(Device, "system", {
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

		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();

		oMultiComboBox.open();
		this.clock.tick(300);

		oPickerTextField = oMultiComboBox.getPickerTextField();
		oPickerTextField.focus();
		oPickerTextFieldDomRef = oPickerTextField.getFocusDomRef();

		oPickerTextFieldDomRef.value = "I";
		sap.ui.qunit.QUnitUtils.triggerEvent("input", oPickerTextFieldDomRef);
		this.clock.tick(300);
		sap.ui.test.qunit.triggerKeydown(oPickerTextFieldDomRef, KeyCodes.ENTER); //onsapenter
		this.clock.tick(300);

		// assert
		assert.strictEqual(oMultiComboBox.getSelectedItems().length, 2, "There are two selected item");
		assert.notOk(oMultiComboBox.isOpen(), "The picker is closed");

		// clean up
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

	QUnit.test("Data binding: update model data and selected items", function (assert) {
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
		oMultiCombo.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();

		assert.strictEqual(oMultiCombo.getSelectedKeys().length, 2, "Selected keys are set to 2 items.");
		assert.strictEqual(oMultiCombo.getSelectedItems().length, 1, "Selected items are set to 1 item.");
		assert.deepEqual(oMultiCombo.getSelectedKeys(), oData.selectedCustomKeys, "Selected keys are properly propagated.");
		assert.strictEqual(oMultiCombo.getSelectedItems()[0].getKey(), oData.selectedCustomKeys[0], "Selected items are properly propagated.");

		var oData2 = Object.assign({}, oData);
		oData2.ProductCollection.push({ProductId: "Zzz3", Name: "New Item"});
		oModel.setProperty("/ProductCollection", oData2.ProductCollection);
		sap.ui.getCore().applyChanges();

		assert.strictEqual(oMultiCombo.getSelectedKeys().length, 2, "Selected keys remain to 2.");
		assert.strictEqual(oMultiCombo.getSelectedItems().length, 2, "Selected keys are updated to 2.");
		assert.deepEqual(oMultiCombo.getSelectedKeys(), oData.selectedCustomKeys, "Selected keys are not changed as the same item is in the new data.");
		assert.strictEqual(oMultiCombo.getSelectedItems()[1].getKey(), oData.selectedCustomKeys[1], "Selected items are not changed as the same item is in the new data.");

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
		oMultiComboBox.syncPickerContent();
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

	QUnit.test("Clearing values after highlighting", function(assert) {
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
		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();

		oMultiComboBox.oninput(oFakeEvent);
		this.clock.tick(100);

		oMultiComboBox.getFocusDomRef().blur();
		this.clock.tick(100);

		// assert
		assert.strictEqual(oMultiComboBox._getSuggestionsPopover()._sTypedInValue, "", "The input value is deleted");

		// cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("The tokens are rendered after opening the picker", function (assert) {
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

		oMCB.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();

		oMCB.open();
		this.clock.tick();

		aTokens = oMCB._oTokenizer.getTokens();
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
		this.oMultiComboBox.syncPickerContent();

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
			var aItems = [new Item("firstItem", {text: "XXXX"}),
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
				target : this.oMCB1.getFocusDomRef()
			};

		//assert
		assert.ok(oIndicator[0], "A n-more label is rendered");

		//close and open the picker
		this.oMCB1.onfocusin(oEventMock);
		// assert
		assert.ok(oIndicator.hasClass("sapUiHidden"), "The n-more label is hidden on focusin.");
	});

	QUnit.test("Focus on a token", function(assert) {
		// arrange
		var oIndicator = this.oMCB1.$().find(".sapMTokenizerIndicator");

		// act
		this.oMCB1._oTokenizer.getTokens()[2].focus();

		// assert
		assert.notOk(oIndicator.hasClass("sapUiHidden"), "The n-more label is not hidden on focusin.");
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
		var oMultiComboBox = new MultiComboBox({
				width: "500px"
			});

		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();

		oMultiComboBox.$().find(".sapMMultiComboBoxInputContainer").removeClass("sapMMultiComboBoxInputContainer");
		sap.ui.getCore().applyChanges();

		assert.strictEqual(oMultiComboBox._calculateSpaceForTokenizer(), "398px", "_calculateSpaceForTokenizer returns a correct px value");

		oMultiComboBox.destroy();
	});

	QUnit.test("_calculateSpaceForTokenizer with null DOM element reference", function(assert) {
		var oMultiComboBox = new MultiComboBox(),
			output;

		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();

		oMultiComboBox.$().find(".sapMMultiComboBoxInputContainer").removeClass("sapMMultiComboBoxInputContainer");
		sap.ui.getCore().applyChanges();

		output = oMultiComboBox._calculateSpaceForTokenizer();

		assert.strictEqual(isNaN(parseInt(output)), false, "_calculateSpaceForTokenizer returns a valid value");

		oMultiComboBox.destroy();
	});

	QUnit.test("_calculateSpaceForTokenizer with negative tokenizer space", function(assert) {
		var oMultiComboBox = new MultiComboBox({
			width: "30px"
		});

		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();

		assert.strictEqual(oMultiComboBox._calculateSpaceForTokenizer(), "0px", "_calculateSpaceForTokenizer returns a non negative value");

		oMultiComboBox.destroy();
	});

	QUnit.test("N-more popover transition from read-only to edit mode", function (assert) {
		//arrange
		var oReadOnlyPopover,
			aReadOnlyContent,
			aEditModeContent,
			aItems = [
				new Item("it1", {text: "this is a long text"}),
				new Item("it2", {text: "this is another long text"})
			], oMCB = new MultiComboBox({
				width: "8rem",
				editable: false,
				items: aItems,
				selectedItems: ["it1", "it2"]
			});

		oMCB.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();

		oMCB._oTokenizer._oIndicator.click();
		this.clock.tick(200);

		oReadOnlyPopover = oMCB._getReadOnlyPopover();
		aReadOnlyContent = oReadOnlyPopover.getContent();
		assert.strictEqual(aReadOnlyContent.length, 1, "The read-only popover has content.");
		assert.ok(aReadOnlyContent[0].isA("sap.m.List"), "The read-only popover aggregated a list.");
		assert.strictEqual(aReadOnlyContent[0].getMode(), "None", "The list is in mode 'None'.");
		assert.strictEqual(aReadOnlyContent[0].getItems().length, 2, "The list has 2 items.");

		oReadOnlyPopover.close();
		oMCB.setEditable(true);
		sap.ui.getCore().applyChanges();

		oMCB._oTokenizer._oIndicator.click();
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

		this.oMCB1.syncPickerContent();

		this.oMCB1.$().find(".sapMTokenizerIndicator")[0].click();
		this.clock.tick(200);

		//assert
		assert.strictEqual(this.oMCB1.getSelectedItems().length, 2, "There are two selected items");
		assert.strictEqual(this.oMCB1.getVisibleItems().length, 4, "The selected items are shown grouped");
	});

	QUnit.test("Phone: Selected items are grouped when picker is opened", function (assert) {
		this.stub(Device, "system", {
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
		oMultiComboBox.placeAt("MultiComboBox-content");
		this.clock.tick(200);

		oMultiComboBox.$().find(".sapMTokenizerIndicator").click();

		//assert
		assert.strictEqual(oMultiComboBox.getSelectedItems().length, 2, "There are two selected items");
		assert.strictEqual(oMultiComboBox.getVisibleItems().length, 4, "The selected items are shown grouped");



		oMultiComboBox.close();
		this.clock.tick(500);
		oMultiComboBox.destroy();
		this.clock.restore();
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
		sap.ui.test.qunit.triggerKeyboardEvent(oMultiComboBox._getList().getItems()[0].getDomRef(), KeyCodes.ARROW_UP, false, false);
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
		}), oInputDomRef, aListItems, oList,
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
		oMultiComboBox.syncPickerContent();
		oList = oMultiComboBox._getList();
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

	QUnit.test("Typeahead should be disabled on adroid devices", function (assert) {
		this.stub(Device, "system", {
			desktop: false,
			phone: true,
			tablet: false
		});

		this.stub(Device, "os", {
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

		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();
		oMultiComboBox.focus();
		oMultiComboBox.open();
		this.clock.tick(500);
		var oPickerTextField = oMultiComboBox.getPickerTextField();
		oPickerTextField.focus();
		var oPickerTextFieldDomRef = oPickerTextField.getFocusDomRef();

		// act
		sap.ui.qunit.QUnitUtils.triggerEvent("keydown", oPickerTextFieldDomRef, {
			which: KeyCodes.L,
			srcControl: oPickerTextField
		});

		oMultiComboBox.close();
		this.clock.tick(500);

		// assert
		assert.notOk(oPickerTextField._bDoTypeAhead, '_bDoTypeAhead should be set to false');

		// act
		sap.ui.qunit.QUnitUtils.triggerEvent("keydown", oMultiComboBox.getFocusDomRef(), {
			which: KeyCodes.I,
			srcControl: oMultiComboBox.getFocusDomRef()
		});

		// assert
		assert.notOk(oMultiComboBox._bDoTypeAhead, '_bDoTypeAhead should be set to false');

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

		oListItemRef = this.oMultiComboBox._getList().getItems()[0].$();
		assert.strictEqual(oListItemRef.find(".sapMSLITitleOnly")[0].innerHTML,
			"<span class=\"sapMInputHighlight\">A</span>lgeria", "The main text is correctly highlighted.");

		assert.strictEqual(oListItemRef.find(".sapMSLIInfo")[0].innerHTML,
			"<span class=\"sapMInputHighlight\">A</span>L", "The additional text is correctly highlighted.");
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

		aListItems = this.oMultiComboBox._getList().getItems();

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
		this.oMultiComboBox.syncPickerContent();
		var aFilteredItems = this.oMultiComboBox.filterItems({ value: "A", items: this.oMultiComboBox.getItems() });
		assert.strictEqual(aFilteredItems.length, 0, "There is no filtered items");
	});

	QUnit.test("_mapItemToList()", function(assert) {
		this.oMultiComboBox.syncPickerContent();
		var groupHeader = this.oMultiComboBox._getList().getItems()[0];
		assert.ok(groupHeader instanceof sap.m.GroupHeaderListItem, "The control used for the group name is instance of sap.m.GroupHeaderListItem");
	});

	QUnit.test("_mapItemToListItem() - Data Binding works correct ", function(assert) {

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
		}).setModel(oModel).placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();

		this.multiComboBox.open();

		// assert
		assert.ok(true, "If there's no exception so far, values ending with curly brackets could be used.");

		// destroy
		this.multiComboBox.destroy();
		this.multiComboBox = null;
	});



	QUnit.module("Value State Error", {
		beforeEach : function() {
			var oItem1, oItem2, oItem3, oItem4;
			this.oMultiComboBox = new MultiComboBox({
				items: [
					new SeparatorItem({ text: "Asia-Countries" }),
					oItem1 = new ListItem({
						text: "Hong Kong",
						additionalText: "China"
					}),
					oItem2 = new ListItem({
						text: "Haskovo",
						additionalText: "Bulgaria"
					}),
					new SeparatorItem({ text: "Africa-Countries" }),
					oItem3 = new ListItem({
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
			this.oMultiComboBox.placeAt("MultiComboBox-content");

			sap.ui.getCore().applyChanges();
		},
		afterEach : function() {
			this.oMultiComboBox.destroy();
		}
	});

	QUnit.test("onsapenter should trigger invalidation if the item is already selected", function(assert) {
		// arrange
		var oAlreadySelectedItemSpy = this.spy(this.oMultiComboBox, "_showAlreadySelectedVisualEffect");

		// act
		sap.ui.test.qunit.triggerCharacterInput(this.oMultiComboBox.getFocusDomRef(), "Brussel");
		sap.ui.test.qunit.triggerKeydown(this.oMultiComboBox.getDomRef(), KeyCodes.ENTER); //onsapenter

		// assert
		assert.strictEqual(oAlreadySelectedItemSpy.callCount, 1, "_showAlreadySelectedVisualEffect() should be called exactly once");
		assert.strictEqual(this.oMultiComboBox.getValueState(), ValueState.Error, "The value is already selected");
		assert.strictEqual(this.oMultiComboBox.getValue(), "Brussel", "The value is not deleted");
	});

	QUnit.test("oninput the value state message should not be visible", function(assert) {
		// act
		this.oMultiComboBox._$input.focus().val("Brussel").trigger("input");
		sap.ui.test.qunit.triggerKeydown(this.oMultiComboBox.getDomRef(), KeyCodes.ENTER);
		this.oMultiComboBox._$input.focus().val("H").trigger("input");
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(this.oMultiComboBox.getValueState(), ValueState.None, "The value state is reset to none.");
	});

	QUnit.test("onbackspace should reset the value state", function(assert) {
		// arrange
		var oOnBackSpaceSpy = this.spy(this.oMultiComboBox, "_showAlreadySelectedVisualEffect");

		// act
		sap.ui.test.qunit.triggerCharacterInput(this.oMultiComboBox.getFocusDomRef(), "Brussel");
		sap.ui.test.qunit.triggerKeydown(this.oMultiComboBox.getFocusDomRef(), KeyCodes.ENTER); //onsapenter
		sap.ui.test.qunit.triggerKeydown(this.oMultiComboBox.getFocusDomRef(), KeyCodes.BACKSPACE); //onsapbackspace

		// assert
		assert.strictEqual(oOnBackSpaceSpy.callCount, 2, "_showAlreadySelectedVisualEffect() should be called and value state should be reset");
		assert.strictEqual(this.oMultiComboBox.getValueState(), ValueState.None, "The input value is valid");

	});

	QUnit.test("onsapdelete should reset the value state", function(assert) {
		// arrange
		var oOnBackSpaceSpy = this.spy(this.oMultiComboBox, "_showAlreadySelectedVisualEffect");

		// act
		sap.ui.test.qunit.triggerCharacterInput(this.oMultiComboBox.getFocusDomRef(), "Brussel");
		sap.ui.test.qunit.triggerKeydown(this.oMultiComboBox.getFocusDomRef(), KeyCodes.ENTER);
		sap.ui.test.qunit.triggerKeydown(this.oMultiComboBox.getFocusDomRef(), KeyCodes.DELETE);

		// assert
		assert.strictEqual(oOnBackSpaceSpy.callCount, 2, "_showAlreadySelectedVisualEffect() should be called and value state should be reset");
		assert.strictEqual(this.oMultiComboBox.getValueState(), ValueState.None, "The input value is valid");
	});

	QUnit.test("value state message should be opened if the input field is on focus", function(assert) {

		// act
		this.oMultiComboBox.focus();
		this.oMultiComboBox.open();
		sap.ui.getCore().applyChanges();
		this.clock.tick(500);

		sap.ui.test.qunit.triggerCharacterInput(this.oMultiComboBox.getFocusDomRef(), "Brussel");
		sap.ui.test.qunit.triggerKeydown(this.oMultiComboBox.getDomRef(), KeyCodes.ENTER);

		this.oMultiComboBox.close();
		this.clock.tick(500);

		// assert
		assert.strictEqual(document.activeElement, this.oMultiComboBox.getFocusDomRef(), "Focus is set to the input field");
		assert.strictEqual(this.oMultiComboBox.getValueState(), ValueState.Error, "The value state is error");
		assert.strictEqual(this.oMultiComboBox.getValueStateText(), oResourceBundle.getText("VALUE_STATE_ERROR_ALREADY_SELECTED"), "Value State message is correct");
		assert.strictEqual(this.oMultiComboBox.getValue(), "Brussel", "The invalid value is corrected");
	});

	QUnit.test("value state message for invalid input should be overwritten by the applications", function(assert) {
		 var sCustomText = "This is application text. This is application text. This is application text. This is application text. This is application text. This is application text. This is application text.";

		// act
		this.oMultiComboBox.setValueStateText(sCustomText);
		this.oMultiComboBox.focus();
		this.oMultiComboBox.open();
		sap.ui.getCore().applyChanges();
		this.clock.tick(500);
		enterNewText(this.oMultiComboBox, "Roma");

		// assert
		assert.strictEqual(this.oMultiComboBox.getValueStateText(), sCustomText, "Value State message is correct.");

		// act
		enterNewText(this.oMultiComboBox, "Brussel");

		// assert
		assert.strictEqual(this.oMultiComboBox.getValueStateText(),
			oResourceBundle.getText("VALUE_STATE_ERROR_ALREADY_SELECTED"),
			"Already selected value message is correct.");

		// act
		enterNewText(this.oMultiComboBox, "Roma");

		// assert
		assert.strictEqual(this.oMultiComboBox.getValueStateText(), sCustomText, "Value State message is correct.");
	});

	QUnit.test("onfocusout value should be deleted", function(assert) {

		// act
		this.oMultiComboBox.open();
		sap.ui.getCore().applyChanges();
		this.clock.tick(500);

		sap.ui.test.qunit.triggerCharacterInput(this.oMultiComboBox.getFocusDomRef(), "Brussel");
		sap.ui.test.qunit.triggerKeydown(this.oMultiComboBox.getDomRef(), KeyCodes.ENTER);

		this.oMultiComboBox.getFocusDomRef().blur();
		this.clock.tick(500);


		// assert
		assert.notEqual(document.activeElement, this.oMultiComboBox.getFocusDomRef(), "Focus is not in the input field");
		assert.strictEqual(this.oMultiComboBox.getValueState(), ValueState.None, "The value state is reset");
		assert.strictEqual(this.oMultiComboBox.getValue(), "", "The input value is deleted");
	});

	QUnit.test("onfocusout value should be cleared", function(assert) {
		//arrange
		var oFocusedDomRef = this.oMultiComboBox.getFocusDomRef();

		// act
		this.oMultiComboBox.open();
		sap.ui.getCore().applyChanges();
		this.clock.tick(500);

		sap.ui.test.qunit.triggerCharacterInput(oFocusedDomRef, "Brussel");
		sap.ui.test.qunit.triggerKeydown(oFocusedDomRef, KeyCodes.BACKSPACE);
		sap.ui.test.qunit.triggerKeydown(oFocusedDomRef, KeyCodes.ENTER);

		this.oMultiComboBox.getFocusDomRef().blur();
		this.clock.tick(500);

		// assert
		assert.notEqual(document.activeElement, this.oMultiComboBox.getFocusDomRef(), "Focus is not in the input field");
		assert.strictEqual(this.oMultiComboBox.getValue(), "", "The input value is deleted");
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
		this.multiComboBox.syncPickerContent();
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
		this.multiComboBox._bIsPasteEvent = false;

		// act
		this.multiComboBox.oncompositionstart(oFakeEvent);
		this.multiComboBox.oninput(oFakeEvent);
		this.clock.tick(300);

		// assert
		assert.ok(oHandleInputEventSpy.called, "handleInputValidation should be called on input");
		assert.notOk(oHandleTypeAheadSpy.called, "Type ahed should not be called while composing");
		assert.notOk(oHandleFieldValueStateSpy.called, "Field Validation should not be called while composing");
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

			this.oMultiComboBox = new MultiComboBox({
				items: {
					path: "/",
					template: new Item({text: "{name}", key: "{key}"})
				}
			}).setModel(oModel).placeAt("MultiComboBox-content");

			sap.ui.getCore().applyChanges();

		},
		afterEach: function () {
			this.oMultiComboBox.destroy();
			this.oMultiComboBox = null;
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

	QUnit.test("Should show all the items", function (assert) {
		// Setup
		var fnGetVisisbleItems = function (aItems) {
			return aItems.filter(function (oItem) {
				return oItem.getVisible();
			});
		};

		// Act
		this.oMultiComboBox.showItems();
		sap.ui.getCore().applyChanges();

		// Assert
		assert.strictEqual(this.oMultiComboBox._oList.getItems().length, 5, "All the items are available");
		assert.strictEqual(fnGetVisisbleItems(this.oMultiComboBox._oList.getItems()).length, 5, "Shows all items");
	});

	QUnit.test("Should filter the items", function (assert) {
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
		sap.ui.getCore().applyChanges();

		// Assert
		assert.strictEqual(this.oMultiComboBox._oList.getItems().length, 5, "All the items are available");
		assert.strictEqual(fnGetVisisbleItems(this.oMultiComboBox._oList.getItems()).length, 1, "Only the matching items are visible");
	});

	QUnit.test("Should call toggleIconPressedState correctly in the process of showing items", function (assert) {
		// Setup
		var oSpy = new sinon.spy(this.oMultiComboBox, "toggleIconPressedStyle");

		// Act
		this.oMultiComboBox.showItems(function () {
			return true;
		});

		// Assert
		assert.strictEqual(oSpy.callCount, 0, "The toggleIconPressedStyle method was not called.");

		// Act
		this.oMultiComboBox._handlePopupOpenAndItemsLoad(true); // Icon press

		// Assert
		assert.strictEqual(oSpy.callCount, 1, "The toggleIconPressedStyle method was called once:");
		assert.strictEqual(oSpy.getCall(0).args[0], true, "...first time with 'true'.");

		// Arrange
		this.oMultiComboBox._bShouldClosePicker = true;
		this.oMultiComboBox._bItemsShownWithFilter = false;

		// Act
		this.oMultiComboBox._handlePopupOpenAndItemsLoad(); // Icon press

		// Assert
		assert.strictEqual(oSpy.callCount, 2, "The toggleIconPressedStyle method was called twice:");
		assert.strictEqual(oSpy.getCall(1).args[0], false, "...second time with 'false'.");

		// Clean
		oSpy.restore();
	});

	QUnit.test("Should call toggleIconPressedState after showItems is called and oninput is triggered.", function (assert) {
		// Setup
		var oSpy = new sinon.spy(this.oMultiComboBox, "toggleIconPressedStyle"),
			oFakeEvent = {
				isMarked: function () {return false;},
				setMarked: function () {},
				target: {
					value: "A Item"
				},
				srcControl: this.oMultiComboBox
			};

		// Act
		this.oMultiComboBox.showItems(function () {
			return true;
		});

		// Assert
		assert.strictEqual(oSpy.callCount, 0, "The toggleIconPressedStyle method was not called.");

		// Act
		this.oMultiComboBox.oninput(oFakeEvent); // Fake input

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
		this.oMultiComboBox.showItems(function (sValue, oItem) {
			return oItem.getText() === "A Item 1";
		});
		sap.ui.getCore().applyChanges();

		// Assert
		assert.strictEqual(this.oMultiComboBox._oList.getItems().length, 5, "All the items are available");
		assert.strictEqual(fnGetVisisbleItems(this.oMultiComboBox._oList.getItems()).length, 1, "Only the matching items are visible");

		// Act
		this.oMultiComboBox._handlePopupOpenAndItemsLoad(true); // Icon press
		sap.ui.getCore().applyChanges();

		assert.strictEqual(this.oMultiComboBox._oList.getItems().length, 5, "All the items are available");
		assert.strictEqual(fnGetVisisbleItems(this.oMultiComboBox._oList.getItems()).length, 5, "All items are visible");
	});

	QUnit.module("selectedKeys");

	QUnit.test("Should select keys & items", function (assert) {
		var oClone,
			oMultiComboBox = new MultiComboBox({
				selectedKeys: ["1", "3"],
				items: [
					new Item({key: "1", text: "1"}),
					new Item({key: "2", text: "2"}),
					new Item({key: "3", text: "3"}),
					new Item({key: "4", text: "4"})
				]
			}).placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();

		// Assert
		assert.strictEqual(oMultiComboBox.getSelectedKeys().length, oMultiComboBox.getSelectedItems().length, "Selection should be in sync");
		assert.strictEqual(oMultiComboBox.getSelectedKeys().length, oMultiComboBox._oTokenizer.getTokens().length, "Selection should be in sync");

		// Act
		oClone = oMultiComboBox.clone();

		// Assert
		assert.strictEqual(oMultiComboBox.getSelectedKeys().length, oClone.getSelectedKeys().length, "Clones should inherit selections");
		assert.strictEqual(oMultiComboBox.getSelectedItems().length, oClone.getSelectedItems().length, "Clones should inherit selections");
		assert.strictEqual(oMultiComboBox._oTokenizer.getTokens().length, oClone._oTokenizer.getTokens().length, "Clones should inherit selections");

		oMultiComboBox.destroy();
		oClone.destroy();
	});

	QUnit.test("Should be able to sync mixed properties", function (assert) {
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
			}).placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();

		// Assert
		assert.strictEqual(oMultiComboBox.getSelectedKeys().length, 3, "Selection should be in sync");
		assert.strictEqual(oMultiComboBox.getSelectedKeys().length, oMultiComboBox.getSelectedItems().length, "Selection should be in sync");

		oMultiComboBox.destroy();
	});

	QUnit.test("Should be able to sync predefined selectedKey", function (assert) {
		var oItem = new Item({key: "1", text: "1"}),
			oMultiComboBox = new MultiComboBox({
				selectedKeys: ["1"],
				items: [
					new Item({key: "2", text: "2"}),
					new Item({key: "3", text: "3"}),
					new Item({key: "4", text: "4"})
				]
			}).placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();

		// Assert
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), ["1"], "There should be selected key defined");
		assert.strictEqual(oMultiComboBox.getSelectedItems().length, 0, "But ther should not be selectedItems as there's no match");

		// Act
		oMultiComboBox.addItem(oItem);
		sap.ui.getCore().applyChanges();

		// Assert
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), ["1"], "There should be selected key defined");
		assert.strictEqual(oMultiComboBox.getSelectedItems().length, 1, "There should be selected item now");
		assert.deepEqual(oMultiComboBox.getSelectedItems()[0], oItem, "Recent item shoud be selected");


		// Act
		oMultiComboBox.removeItem(oItem);
		sap.ui.getCore().applyChanges();

		// Assert
		assert.strictEqual(oMultiComboBox.getSelectedKeys().length, 0, "Selected keys should be empty");
		assert.strictEqual(oMultiComboBox.getSelectedItems().length, 0, "Selected items should be empty");


		oMultiComboBox.destroy();
	});

	QUnit.test("API use should sync with the token", function (assert) {
		var oMultiComboBox = new MultiComboBox({
			items: [
				new Item({key: "2", text: "2"}),
				new Item({key: "3", text: "3"}),
				new Item({key: "4", text: "4"})
			]
		}).placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();

		// Act
		oMultiComboBox.addSelectedKeys(["2", "3"]);
		sap.ui.getCore().applyChanges();

		assert.deepEqual(oMultiComboBox.getSelectedKeys(), ["2", "3"], "SelectedKeys should be saved");
		assert.strictEqual(oMultiComboBox.getSelectedItems().length, 2, "selectedItems should be there");
		assert.strictEqual(oMultiComboBox.getSelectedItems().length, oMultiComboBox._oTokenizer.getTokens().length, "Selected items should be visible as tokens");

		// Act
		oMultiComboBox.setSelectedKeys([]);
		sap.ui.getCore().applyChanges();

		assert.strictEqual(oMultiComboBox.getSelectedKeys().length, 0, "SelectedKeys should be empty");
		assert.strictEqual(oMultiComboBox.getSelectedItems().length, 0, "selectedItems should be empty");
		assert.strictEqual(oMultiComboBox.getSelectedItems().length, oMultiComboBox._oTokenizer.getTokens().length, "Selected items should be removed");

		oMultiComboBox.destroy();
	});

	QUnit.test("Items without keys", function (assert) {
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
			}).placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();

		// Assert
		assert.strictEqual(oMultiComboBox.getItems().length, 3, "Items should be 3");
		assert.strictEqual(oMultiComboBox.getSelectedKeys().length, 4, "SelectedKeys should be 4");
		assert.strictEqual(oMultiComboBox.getSelectedItems().length, 3, "The available selectedItems should be 3");

		// Act
		oMultiComboBox.addItem(oItem);
		sap.ui.getCore().applyChanges();

		// Assert
		assert.strictEqual(oMultiComboBox.getItems().length, 4, "Items should be 4");
		assert.strictEqual(oMultiComboBox.getSelectedKeys().length, 4, "SelectedKeys should be 4");
		assert.strictEqual(oMultiComboBox.getSelectedItems().length, 4, "The available selectedItems should be 4");

		// Act
		oMultiComboBox.removeItem(aItems[0]);
		sap.ui.getCore().applyChanges();

		// Assert
		assert.strictEqual(oMultiComboBox.getItems().length, 3, "Items should be 3");
		assert.strictEqual(oMultiComboBox.getSelectedKeys().length, 3, "SelectedKeys should be 3");
		assert.strictEqual(oMultiComboBox.getSelectedItems().length, 3, "The available selectedItems should be 3");

		// Act
		oMultiComboBox.removeSelectedItem(aItems[0]); // This item has already been removed, but let's give it another try
		sap.ui.getCore().applyChanges();

		// Assert
		assert.strictEqual(oMultiComboBox.getItems().length, 3, "Items should be 3");
		assert.strictEqual(oMultiComboBox.getSelectedKeys().length, 3, "SelectedKeys should be 3");
		assert.strictEqual(oMultiComboBox.getSelectedItems().length, 3, "The available selectedItems should be 3");

		// Act
		oMultiComboBox.removeSelectedItem(aItems[1]);
		sap.ui.getCore().applyChanges();

		// Assert
		assert.strictEqual(oMultiComboBox.getItems().length, 3, "Items should be 3");
		assert.strictEqual(oMultiComboBox.getSelectedKeys().length, 2, "SelectedKeys should be 2");
		assert.strictEqual(oMultiComboBox.getSelectedItems().length, 2, "The available selectedItems should be 2");

		oMultiComboBox.destroy();
	});

	QUnit.test("Sync selectedKeys' items before MultiComboBox has been rendered", function (assert) {
		// Setup
		var oMultiComboBox = new MultiComboBox(),
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
		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();

		// Assert
		assert.strictEqual(oOnBeforeRenderingSpy.callCount, 1, "onBeforeRendering has been called and items should be in sync");
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), ["A"], "Only the last setter should be applied");
		assert.strictEqual(oMultiComboBox.getSelectedItems().length, 1, "Selected Items association should be in sync");
		assert.strictEqual(oMultiComboBox._oTokenizer.getTokens().length, 1, "Tokens should correspond to the actual selection");
		assert.strictEqual(oMultiComboBox._oTokenizer.getTokens()[0].getKey(), "A", "Tokens should correspond to the actual selection");

		// Cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("Sync selectedItems' items before MultiComboBox has been rendered", function (assert) {
		// Setup
		var oMultiComboBox = new MultiComboBox(),
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
		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();

		// Assert
		assert.strictEqual(oOnBeforeRenderingSpy.callCount, 1, "onBeforeRendering has been called and items should be in sync");
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), ["A"], "Only the last setter should be applied");
		assert.strictEqual(oMultiComboBox.getSelectedItems().length, 1, "Selected Items association should be in sync");
		assert.strictEqual(oMultiComboBox._oTokenizer.getTokens().length, 1, "Tokens should correspond to the actual selection");
		assert.strictEqual(oMultiComboBox._oTokenizer.getTokens()[0].getKey(), "A", "Tokens should correspond to the actual selection");

		// Cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("Sync selectedItems & selectedKeys", function (assert) {
		// Setup
		var oMultiComboBox = new MultiComboBox(),
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
		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();
		this.clock.tick(500);

		// Assert
		assert.strictEqual(oOnBeforeRenderingSpy.callCount, 1, "onBeforeRendering has been called and items should be in sync");
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), ["B", "C", "A"], "Only the last setter should be applied");
		assert.strictEqual(oMultiComboBox.getSelectedItems().length, 3, "Selected Items association should be in sync");
		assert.strictEqual(oMultiComboBox._oTokenizer.getTokens().length, 3, "Tokens should correspond to the actual selection");
		assert.strictEqual(oMultiComboBox._oTokenizer.getTokens()[0].getKey(), "B", "Tokens should correspond to the actual selection");

		// Act
		oMultiComboBox.setSelectedItems([aItems[1]]);
		sap.ui.getCore().applyChanges();
		this.clock.tick(500);

		assert.strictEqual(oOnBeforeRenderingSpy.callCount, 1, "The MultiComboBox was not invalidated");
		assert.strictEqual(oMultiComboBox.getSelectedItems().length, 1, "Selected Items should be adjusted");
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), ["B"], "SelectedKeys should be in sync");
		assert.strictEqual(oMultiComboBox._oTokenizer.getTokens().length, 1, "Tokens should correspond to the actual selection");
		assert.strictEqual(oMultiComboBox._oTokenizer.getTokens()[0].getKey(), "B", "Tokens should correspond to the actual selection");

		// Act
		oMultiComboBox.setSelectedKeys(["C", "A"]);
		sap.ui.getCore().applyChanges();
		this.clock.tick(500);

		assert.strictEqual(oOnBeforeRenderingSpy.callCount, 1, "The MultiComboBox was not invalidated");
		assert.deepEqual(oMultiComboBox.getSelectedKeys(), ["C", "A"], "SelectedKeys should be adjusted");
		assert.strictEqual(oMultiComboBox.getSelectedItems().length, 2, "Selected Items should be in sync");
		assert.strictEqual(oMultiComboBox._oTokenizer.getTokens().length, 2, "Tokens should correspond to the actual selection");
		assert.strictEqual(oMultiComboBox._oTokenizer.getTokens()[0].getKey(), "C", "Tokens should correspond to the actual selection");

		// Cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("When setSelectedKeys is called before the model selected Tokens text should be syncronized", function (assert) {
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
		});

		// Act
		oMultiComboBox.setSelectedKeys(["A", "B"]);

		// Assert
		assert.strictEqual(oMultiComboBox._oTokenizer.getTokens()[0].getText(), "", "Token text should be empty");
		assert.strictEqual(oMultiComboBox._oTokenizer.getTokens()[1].getText(), "", "Token text should be empty");

		// Act
		oMultiComboBox.setModel(oModel, "test");
		oMultiComboBox.placeAt("MultiComboBox-content");
		sap.ui.getCore().applyChanges();

		// Assert
		assert.strictEqual(oMultiComboBox._oTokenizer.getTokens().length, 2, "The MultiComboBox was not invalidated");
		assert.strictEqual(oMultiComboBox._oTokenizer.getTokens()[0].getText(), "Test A", "Token text should correspond to the model");
		assert.strictEqual(oMultiComboBox._oTokenizer.getTokens()[1].getText(), "Test B", "Token text should correspond to the model");

		// Act
		oMultiComboBox.getModel("test").setProperty("/a", "A Test");
		oMultiComboBox.getModel("test").setProperty("/b", "B Test");
		sap.ui.getCore().applyChanges();

		// Assert
		assert.strictEqual(oMultiComboBox._oTokenizer.getTokens()[0].getText(), "A Test", "Token text should be updated");
		assert.strictEqual(oMultiComboBox._oTokenizer.getTokens()[1].getText(), "B Test", "Token text should be updated");

		// Cleanup
		oMultiComboBox.destroy();
	});
});
