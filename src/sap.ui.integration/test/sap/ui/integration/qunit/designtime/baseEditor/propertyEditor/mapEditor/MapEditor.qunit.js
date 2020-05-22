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
					key: oNestedEditors[0],
					type: oNestedEditors[1],
					value: oNestedEditors[2],
					deleteButton: oItem.getHeaderToolbar().getContent()[2]
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
					"enum": "sap/ui/integration/designtime/baseEditor/propertyEditor/enumStringEditor/EnumStringEditor"
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
					itemKey: "foo"
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
			var fnDone = assert.async();
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
			QUnitUtils.triggerEvent("tap", this.aItems[0].deleteButton.getDomRef());
		});

		QUnit.test("When an element is added to an empty map", function (assert) {
			var fnDone = assert.async();

			this.oBaseEditor.attachEventOnce("propertyEditorsReady", function (oEvent) {
				this.oMapEditor = oEvent.getParameter("propertyEditors")[0];
				sap.ui.getCore().applyChanges();
				this.oAddButton = getMapEditorContent(this.oMapEditor).addButton;

				this.oMapEditor.attachValueChange(function (oEvent) {
					assert.strictEqual(Object.keys(oEvent.getParameter("value")).length, 1, "Then editor contains one key");
					fnDone();
				});

				QUnitUtils.triggerEvent("tap", this.oAddButton.getDomRef());
			}, this);

			this.oBaseEditor.setJson({sampleMap: {}});
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
					fnDone();
				});
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
			var oExpectedItemConfig = [
				{
					allowBindings: false,
					enabled: true,
					itemKey: "test",
					label: "Key",
					path: "key",
					type: "string",
					value: "test"
				},
				{
					allowBindings: false,
					"enum": ["string", "number", "boolean"],
					itemKey: "test",
					label: "Type",
					path: "type",
					type: "enum",
					value: "string",
					visible: true
				},
				{
					itemKey: "test",
					label: "Value",
					path: "value",
					type: "string",
					value: "Test value"
				}
			];

			assert.deepEqual(
				this.oMapEditor.getAggregation("propertyEditor").formatItemConfig(oItem),
				oExpectedItemConfig,
				"Then configurations for the nested editors are returned"
			);
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
					"enum": "sap/ui/integration/designtime/baseEditor/propertyEditor/enumStringEditor/EnumStringEditor"
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
					"enum": "sap/ui/integration/designtime/baseEditor/propertyEditor/enumStringEditor/EnumStringEditor"
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
					"enum": "sap/ui/integration/designtime/baseEditor/propertyEditor/enumStringEditor/EnumStringEditor"
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
					"enum": "sap/ui/integration/designtime/baseEditor/propertyEditor/enumStringEditor/EnumStringEditor"
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
					"enum": "sap/ui/integration/designtime/baseEditor/propertyEditor/enumStringEditor/EnumStringEditor"
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
					"enum": "sap/ui/integration/designtime/baseEditor/propertyEditor/enumStringEditor/EnumStringEditor"
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

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});