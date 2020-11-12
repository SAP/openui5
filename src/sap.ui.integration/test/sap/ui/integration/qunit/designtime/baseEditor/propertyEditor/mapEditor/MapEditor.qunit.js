/* global QUnit */

sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/BaseEditor",
	"sap/ui/qunit/QUnitUtils",
	"qunit/designtime/EditorQunitUtils",
	"sap/base/util/ObjectPath"
], function (
	BaseEditor,
	QUnitUtils,
	EditorQunitUtils,
	ObjectPath
) {
	"use strict";

	function getMapEditorContent (oEditor) {
		return {
			addButton: oEditor.getContent().getItems()[1],
			items: oEditor.getContent().getItems()[0].getItems().map(function (oItem) {
				var oNestedEditors = oItem.getContent()[0]._getPropertyEditors();
				return {
					item: oItem,
					key: oNestedEditors[0],
					type: oNestedEditors[1],
					value: oNestedEditors[2],
					deleteButton: oItem.getHeaderToolbar().getContent()[4]
				};
			})
		};
	}

	QUnit.module("Map Editor: Given an editor config", {
		beforeEach: function (assert) {
			var mConfig = {
				"properties": {
					"sampleMap": {
						"path": "/sampleMap",
						"type": "map",
						"allowedTypes": ["string", "number", "boolean"]
					}
				},
				"propertyEditors": {
					"map": "sap/ui/integration/designtime/baseEditor/propertyEditor/mapEditor/MapEditor",
					"string": "sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor",
					"number": "sap/ui/integration/designtime/baseEditor/propertyEditor/numberEditor/NumberEditor",
					"boolean": "sap/ui/integration/designtime/baseEditor/propertyEditor/booleanEditor/BooleanEditor",
					"select": "sap/ui/integration/designtime/baseEditor/propertyEditor/selectEditor/SelectEditor"
				}
			};
			var mJson = {
				sampleMap: {
					"foo": "bar"
				}
			};

			this.oBaseEditor = new BaseEditor({
				config: mConfig,
				json: mJson
			});
			this.oBaseEditor.placeAt("qunit-fixture");

			return this.oBaseEditor.getPropertyEditorsByName("sampleMap").then(function (aPropertyEditor) {
				sap.ui.getCore().applyChanges();
				this.oMapEditor = aPropertyEditor[0];
				var oMapEditorContent = getMapEditorContent(this.oMapEditor);
				this.oAddButton = oMapEditorContent.addButton;
				this.aItems = oMapEditorContent.items;
			}.bind(this));
		},
		afterEach: function () {
			this.oBaseEditor.destroy();
		}
	}, function () {
		QUnit.test("When a MapEditor is created", function (assert) {
			var oMapEditorDomRef = this.oMapEditor.getDomRef();
			assert.ok(oMapEditorDomRef instanceof HTMLElement, "Then it is rendered correctly (1/3)");
			assert.ok(oMapEditorDomRef.offsetHeight > 0, "Then it is rendered correctly (2/3)");
			assert.ok(oMapEditorDomRef.offsetWidth > 0, "Then it is rendered correctly (3/3)");
		});

		QUnit.test("When a value is set", function (assert) {
			assert.deepEqual(
				this.aItems[0].value.getConfig(),
				{
					type: "string",
					path: "value",
					itemKey: "foo",
					designtime: undefined,
					visible: true
				},
				"Then the nested value editor receives the correct config"
			);

			assert.strictEqual(
				this.aItems[0].value.getValue(),
				"bar",
				"Then the nested value editor receives the correct value"
			);
		});

		QUnit.test("When an element is added", function (assert) {
			var fnDone = assert.async();
			this.oMapEditor.attachValueChange(function (oEvent) {
				assert.strictEqual(Object.keys(oEvent.getParameter("value")).length, 2, "Then editor contains two keys");
				assert.strictEqual(
					Object.keys(ObjectPath.get(["sampleMap"], this.oBaseEditor.getJson())).length,
					2,
					"Then the base editor JSON is updated"
				);
				fnDone();
			}, this);
			QUnitUtils.triggerEvent("tap", this.oAddButton.getDomRef());
		});

		QUnit.test("When two elements are added", function (assert) {
			var fnDone = assert.async();
			this.oMapEditor.attachEventOnce("valueChange", function (oEvent) {
				assert.ok(oEvent.getParameter("value").hasOwnProperty("key"), "Then a new key is added");

				this.oMapEditor.attachValueChange(function (oEvent) {
					assert.strictEqual(Object.keys(oEvent.getParameter("value")).length, 3, "Then editor contains three keys");
					fnDone();
				});
				QUnitUtils.triggerEvent("tap", this.oAddButton.getDomRef());
			}, this);
			QUnitUtils.triggerEvent("tap", this.oAddButton.getDomRef());
		});

		QUnit.test("When an element is removed", function (assert) {
			var fnDone = assert.async(2);
			this.oMapEditor.attachValueChange(function (oEvent) {
				assert.notOk(oEvent.getParameter("value").hasOwnProperty("foo"), "Then the property is removed");
				assert.strictEqual(Object.keys(oEvent.getParameter("value")).length, 0, "Then editor contains no more keys");
				assert.deepEqual(
					this.oBaseEditor.getJson(),
					{},
					"Then the base editor JSON is updated"
				);
				fnDone();
			}, this);
			this.oMapEditor.attachDesigntimeMetadataChange(function (oEvent) {
				assert.notOk(oEvent.getParameter("value").hasOwnProperty("foo"), "Then the property is removed from the designtime metadata");
				fnDone();
			}, this);
			QUnitUtils.triggerEvent("tap", this.aItems[0].deleteButton.getDomRef());
		});

		QUnit.test("When an element is added to an empty map", function (assert) {
			var fnDone = assert.async();
			this.oBaseEditor.setJson({sampleMap: {}});

			this.oBaseEditor.ready().then(function () {
				var oMapEditor = this.oBaseEditor.getPropertyEditorsByNameSync("sampleMap")[0].getAggregation("propertyEditor");
				var oAddButton = getMapEditorContent(oMapEditor).addButton;

				oMapEditor.attachValueChange(function (oEvent) {
					assert.strictEqual(Object.keys(oEvent.getParameter("value")).length, 1, "Then editor contains one key");
					fnDone();
				});

				QUnitUtils.triggerEvent("tap", oAddButton.getDomRef());
			}.bind(this));
		});

		QUnit.test("When an element key is changed to an unique value", function (assert) {
			var fnDone = assert.async();
			this.oMapEditor.attachEventOnce("valueChange", function () {
				this.oMapEditor.attachValueChange(function (oEvent) {
					assert.deepEqual(
						oEvent.getParameter("value"),
						{
							foo2: "bar",
							key: ""
						},
						"Then the key is updated"
					);

					// Check the designtime change event which is fired after value change
					// and ignore previous events to ignore additional position changes
					this.oMapEditor.attachDesigntimeMetadataChange(function (oEvent) {
						assert.notOk(oEvent.getParameter("value").hasOwnProperty("foo"), "Then the old property is removed from the designtime metadata");
						assert.ok(oEvent.getParameter("value").hasOwnProperty("foo2"), "Then the new property is added to the designtime metadata");
						fnDone();
					});
				}, this);
				EditorQunitUtils.setInputValue(this.aItems[0].key.getContent(), "foo2");
			}, this);
			QUnitUtils.triggerEvent("tap", this.oAddButton.getDomRef());
		});

		QUnit.test("When an element key is changed to an existing value", function (assert) {
			QUnitUtils.triggerEvent("tap", this.oAddButton.getDomRef());
			return this.oMapEditor.ready().then(function () {
				this.oMapEditorContent = getMapEditorContent(this.oMapEditor);
				EditorQunitUtils.setInputValue(this.aItems[0].key.getContent(), "key");

				assert.deepEqual(
					this.oMapEditor.getValue(),
					{
						foo: "bar",
						key: ""
					},
					"Then the key is not updated"
				);
				assert.strictEqual(this.aItems[0].key.getContent().getValueState(), "Error", "Then the error is displayed");
			}.bind(this));
		});

		QUnit.test("When the type of an element is changed", function (assert) {
			var fnDone = assert.async();
			assert.strictEqual(this.aItems[0].value.getConfig().type, "string", "Then the initial type is set");

			this.aItems[0].value.attachEventOnce("configChange", function () {
				assert.strictEqual(this.aItems[0].value.getConfig().type, "number", "Then the change is reflected in the nested editor config");
				fnDone();
			}, this);

			var oTypeSelector = this.aItems[0].type.getContent();
			EditorQunitUtils.selectComboBoxValue(oTypeSelector, "number");
		});

		QUnit.test("When a value is updated and the new value is valid", function (assert) {
			var fnDone = assert.async();

			assert.deepEqual(
				this.oMapEditor.getValue(),
				{
					foo: "bar"
				}
			);

			this.aItems[0].value.attachEventOnce("valueChange", function () {
				assert.deepEqual(
					this.oMapEditor.getValue(),
					{
						foo: "baz"
					},
					"Then the value is updated"
				);
				fnDone();
			}, this);

			var oInput = this.aItems[0].value.getContent();
			EditorQunitUtils.setInputValue(oInput, "baz");
		});

		QUnit.test("When a value is updated and the new value is not valid", function (assert) {
			var oInput = this.aItems[0].value.getContent();
			EditorQunitUtils.setInputValue(oInput, "{someInvalidBindingString");

			assert.deepEqual(
				this.oMapEditor.getValue(),
				{
					foo: "bar"
				},
				"Then the value is not updated"
			);
			assert.strictEqual(oInput.getValueState(), "Error", "Then the error is displayed");
		});

		QUnit.test("When the configuration formatter is called for an item", function (assert) {
			var oItem = {
				key: "test",
				value: {
					type: "string",
					value: "Test value"
				}
			};

			assert.strictEqual(
				this.oMapEditor.getAggregation("propertyEditor").formatItemConfig(oItem).length,
				3,
				"Then configurations for the nested editors are returned"
			);
		});

		QUnit.test("Auto Expand - When a prefilled item is added", function (assert) {
			var iLastItemIndex = this.aItems.length - 1;
			assert.strictEqual(
				this.aItems[iLastItemIndex].item.getExpanded(),
				false,
				"Then the item is initially collapsed"
			);
		});

		QUnit.test("Auto Expand - When an empty item is added", function (assert) {
			var iLastItemIndex = this.aItems.length - 1;
			QUnitUtils.triggerEvent("tap", this.oAddButton.getDomRef());

			return this.oMapEditor.ready().then(function () {
				var aEditorItems = getMapEditorContent(this.oMapEditor).items;
				assert.strictEqual(
					aEditorItems[(iLastItemIndex + 1)].item.getExpanded(),
					true,
					"Then the newly added item is expanded"
				);
			}.bind(this));
		});

		QUnit.test("Auto Expand - When an empty item is manually collapsed", function (assert) {
			var iLastItemIndex = this.aItems.length - 1;
			QUnitUtils.triggerEvent("tap", this.oAddButton.getDomRef());

			return this.oMapEditor.ready().then(function () {
				var aEditorItems = getMapEditorContent(this.oMapEditor).items;
				aEditorItems[iLastItemIndex + 1].item.setExpanded(false);

				// Trigger config change by removing a different element
				QUnitUtils.triggerEvent("tap", aEditorItems[iLastItemIndex].deleteButton.getDomRef());

				return this.oMapEditor.ready().then(function () {
					assert.strictEqual(
						getMapEditorContent(this.oMapEditor).items[iLastItemIndex].item.getExpanded(),
						false,
						"Then the item stays collapsed"
					);
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.module("Configuration options", {
		beforeEach: function () {
			this.oBaseEditor = new BaseEditor();
			this.oBaseEditor.placeAt("qunit-fixture");
		},
		afterEach: function () {
			this.oBaseEditor.destroy();
		}
	}, function () {
		QUnit.test("When the supported value types are restricted", function (assert) {
			this.oBaseEditor.setConfig({
				"properties": {
					"restrictedMap": {
						"path": "/restrictedMap",
						"type": "map",
						"allowedTypes": ["string", "number"]
					}
				},
				"propertyEditors": {
					"map": "sap/ui/integration/designtime/baseEditor/propertyEditor/mapEditor/MapEditor",
					"string": "sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor",
					"number": "sap/ui/integration/designtime/baseEditor/propertyEditor/numberEditor/NumberEditor",
					"select": "sap/ui/integration/designtime/baseEditor/propertyEditor/selectEditor/SelectEditor"
				}
			});

			this.oBaseEditor.setJson({
				restrictedMap: {
					"validProperty": "bar"
				}
			});

			return this.oBaseEditor.getPropertyEditorsByName("restrictedMap").then(function (aPropertyEditor) {
				this.oMapEditor = aPropertyEditor[0];
				var oMapEditorContent = getMapEditorContent(this.oMapEditor);
				var aItems = oMapEditorContent.items;

				var oTypeSelector = aItems[0].type.getContent();
				assert.strictEqual(oTypeSelector.getItems().length, 2, "Then only the provided types are available");
			}.bind(this));
		});

		QUnit.test("When changing the key is restricted", function (assert) {
			this.oBaseEditor.setConfig({
				"properties": {
					"restrictedMap": {
						"path": "/restrictedMap",
						"type": "map",
						"allowKeyChange": false
					}
				},
				"propertyEditors": {
					"map": "sap/ui/integration/designtime/baseEditor/propertyEditor/mapEditor/MapEditor",
					"string": "sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor",
					"select": "sap/ui/integration/designtime/baseEditor/propertyEditor/selectEditor/SelectEditor"
				}
			});

			this.oBaseEditor.setJson({
				restrictedMap: {
					"validProperty": "bar"
				}
			});

			return this.oBaseEditor.getPropertyEditorsByName("restrictedMap").then(function (aPropertyEditor) {
				this.oMapEditor = aPropertyEditor[0];
				var oMapEditorContent = getMapEditorContent(this.oMapEditor);
				var aItems = oMapEditorContent.items;

				assert.notOk(aItems[0].key.getContent().getEnabled(), "Then the key field is disabled");
			}.bind(this));
		});

		QUnit.test("When changing the type is restricted", function (assert) {
			this.oBaseEditor.setConfig({
				"properties": {
					"restrictedMap": {
						"path": "/restrictedMap",
						"type": "map",
						"allowTypeChange": false
					}
				},
				"propertyEditors": {
					"map": "sap/ui/integration/designtime/baseEditor/propertyEditor/mapEditor/MapEditor",
					"string": "sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor",
					"select": "sap/ui/integration/designtime/baseEditor/propertyEditor/selectEditor/SelectEditor"
				}
			});

			this.oBaseEditor.setJson({
				restrictedMap: {
					"validProperty": "bar"
				}
			});

			return this.oBaseEditor.getPropertyEditorsByName("restrictedMap").then(function (aPropertyEditor) {
				this.oMapEditor = aPropertyEditor[0];
				var oMapEditorContent = getMapEditorContent(this.oMapEditor);
				var aItems = oMapEditorContent.items;

				var oTypeSelector = aItems[0].type;
				assert.notOk(oTypeSelector.getParent().getVisible(), "Then the type field is hidden");
			}.bind(this));
		});


		QUnit.test("When adding and removing items is disabled", function (assert) {
			this.oBaseEditor.setConfig({
				"properties": {
					"sampleMap": {
						"path": "/sampledMap",
						"type": "map",
						"allowAddAndRemove": false
					}
				},
				"propertyEditors": {
					"map": "sap/ui/integration/designtime/baseEditor/propertyEditor/mapEditor/MapEditor",
					"string": "sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor",
					"select": "sap/ui/integration/designtime/baseEditor/propertyEditor/selectEditor/SelectEditor"
				}
			});

			this.oBaseEditor.setJson({
				sampledMap: {
					"sampleProperty": "bar"
				}
			});

			return this.oBaseEditor.getPropertyEditorsByName("sampleMap").then(function (aPropertyEditor) {
				this.oMapEditor = aPropertyEditor[0];
				var oMapEditorContent = getMapEditorContent(this.oMapEditor);
				var aItems = oMapEditorContent.items;

				assert.notOk(aItems[0].deleteButton.getVisible(), "Then the remove buttons are hidden");
				assert.notOk(oMapEditorContent.addButton.getVisible(), "Then the add button is hidden");
			}.bind(this));
		});

		QUnit.test("When invalid entries should be filtered and an invalid type is set", function (assert) {
			this.oBaseEditor.setConfig({
				"properties": {
					"sampleMap": {
						"path": "/sampleMap",
						"type": "map",
						"includeInvalidEntries": false,
						"allowedTypes": ["number"]
					}
				},
				"propertyEditors": {
					"map": "sap/ui/integration/designtime/baseEditor/propertyEditor/mapEditor/MapEditor",
					"string": "sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor",
					"number": "sap/ui/integration/designtime/baseEditor/propertyEditor/numberEditor/NumberEditor",
					"select": "sap/ui/integration/designtime/baseEditor/propertyEditor/selectEditor/SelectEditor"
				}
			});

			this.oBaseEditor.setJson({
				sampleMap: {
					"validProperty": 123,
					"invalidProperty": "invalid"
				}
			});

			return this.oBaseEditor.getPropertyEditorsByName("sampleMap").then(function (aPropertyEditor) {
				this.oMapEditor = aPropertyEditor[0];
				var oMapEditorContent = getMapEditorContent(this.oMapEditor);
				var aItems = oMapEditorContent.items;

				assert.strictEqual(aItems.length, 1, "Then the invalid value is not included");
			}.bind(this));
		});

		QUnit.test("When a key is changed in a map with invalid filtered items and the new key is a duplicate of a filtered item", function (assert) {
			this.oBaseEditor.setConfig({
				"properties": {
					"sampleMap": {
						"path": "/sampleMap",
						"type": "map",
						"includeInvalidEntries": false,
						"allowedTypes": ["number"]
					}
				},
				"propertyEditors": {
					"map": "sap/ui/integration/designtime/baseEditor/propertyEditor/mapEditor/MapEditor",
					"number": "sap/ui/integration/designtime/baseEditor/propertyEditor/numberEditor/NumberEditor",
					"string": "sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor",
					"select": "sap/ui/integration/designtime/baseEditor/propertyEditor/selectEditor/SelectEditor"
				}
			});

			this.oBaseEditor.setJson({
				sampleMap: {
					"foo": "bar",
					"key": 123
				}
			});

			return this.oBaseEditor.getPropertyEditorsByName("sampleMap").then(function (aPropertyEditor) {
				var oMapEditor = aPropertyEditor[0];
				var oMapEditorContent = getMapEditorContent(oMapEditor);
				var aItems = oMapEditorContent.items;

				sap.ui.getCore().applyChanges();
				EditorQunitUtils.setInputValue(aItems[0].key.getContent(), "foo");

				assert.deepEqual(
					oMapEditor.getValue(),
					{
						foo: "bar",
						key: 123
					},
					"Then the key is not updated"
				);
				assert.strictEqual(aItems[0].key.getContent().getValueState(), "Error", "Then the error is displayed");
			});
		});
	});

	QUnit.module("Nested designtime metadata", {
		beforeEach: function () {
			this.oBaseEditor = new BaseEditor();
			this.oBaseEditor.placeAt("qunit-fixture");
		},
		afterEach: function () {
			this.oBaseEditor.destroy();
		}
	}, function () {
		QUnit.test("when designtime metadata exists for an item value", function (assert) {
			this.oBaseEditor.setConfig({
				"properties": {
					"sampleMap": {
						"path": "/sampleMap",
						"type": "map",
						"allowedTypes": ["string"]
					}
				},
				"propertyEditors": {
					"map": "sap/ui/integration/designtime/baseEditor/propertyEditor/mapEditor/MapEditor",
					"string": "sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor",
					"select": "sap/ui/integration/designtime/baseEditor/propertyEditor/selectEditor/SelectEditor"
				}
			});

			this.oBaseEditor.setDesigntimeMetadata({
				sampleMap: {
					foo: {
						__value: {
							label: "Foo Parameter",
							// Nested value dt metadata
							value: {
								__value: {
									customDesigntimeMetadata: "test"
								}
							}
						}
					}
				}
			});

			this.oBaseEditor.setJson({
				sampleMap: {
					foo: "bar"
				}
			});

			return this.oBaseEditor.getPropertyEditorsByName("sampleMap").then(function (aPropertyEditor) {
				var oMapEditor = aPropertyEditor[0];
				var oMapEditorContent = getMapEditorContent(oMapEditor);
				var oValueEditor = oMapEditorContent.items[0].value.getAggregation("propertyEditor");

				assert.deepEqual(
					oValueEditor.getDesigntimeMetadataValue(),
					{
						customDesigntimeMetadata: "test"
					},
					"then nested designtime metadata is passed to the value editor"
				);
			});
		});

		QUnit.test("when designtime metadata of the value editor changes", function (assert) {
			var fnDone = assert.async();

			this.oBaseEditor.setConfig({
				"properties": {
					"sampleMap": {
						"path": "/sampleMap",
						"type": "map",
						"allowedTypes": ["string"]
					}
				},
				"propertyEditors": {
					"map": "sap/ui/integration/designtime/baseEditor/propertyEditor/mapEditor/MapEditor",
					"string": "sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor",
					"select": "sap/ui/integration/designtime/baseEditor/propertyEditor/selectEditor/SelectEditor"
				}
			});

			this.oBaseEditor.setJson({
				sampleMap: {
					foo: "bar"
				}
			});

			this.oBaseEditor.getPropertyEditorsByName("sampleMap").then(function (aPropertyEditor) {
				var oMapEditor = aPropertyEditor[0];
				var oMapEditorContent = getMapEditorContent(oMapEditor);
				var oValueEditor = oMapEditorContent.items[0].value.getAggregation("propertyEditor");

				this.oBaseEditor.attachDesigntimeMetadataChange(function (oEvent) {
					assert.deepEqual(
						oEvent.getParameter("designtimeMetadata")["sampleMap/foo"].value.__value,
						{
							customDesigntimeMetadata: "test"
						},
						"then the designtime metadata is properly updated"
					);
					fnDone();
				});

				oValueEditor.setDesigntimeMetadataValue({customDesigntimeMetadata: "test"});
			}.bind(this));
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});