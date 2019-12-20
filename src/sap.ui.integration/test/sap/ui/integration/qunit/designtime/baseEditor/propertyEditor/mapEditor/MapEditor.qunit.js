/* global QUnit */

sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/BaseEditor",
	"sap/ui/qunit/QUnitUtils",
	"sap/base/util/ObjectPath",
	"sap/ui/events/KeyCodes"
], function (
	BaseEditor,
	QUnitUtils,
	ObjectPath,
	KeyCodes
) {
	"use strict";

	function getMapEditorContent (oEditor) {
		return {
			addButton: oEditor.getContent().getItems()[1],
			items: oEditor.getContent().getItems()[0].getItems().map(function (item) {
				return {
					key: item.getCells()[0],
					type: item.getCells()[1],
					value: item.getCells()[2],
					deleteButton: item.getCells()[3]
				};
			})
		};
	}

	QUnit.module("Map Editor: Given an editor config", {
		beforeEach: function (assert) {
			var fnDone = assert.async();
			var mConfig = {
				"properties": {
					"sampleMap": {
						"path": "sampleMap",
						"type": "map"
					}
				},
				"propertyEditors": {
					"map": "sap/ui/integration/designtime/baseEditor/propertyEditor/mapEditor/MapEditor",
					"string": "sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor",
					"json": "sap/ui/integration/designtime/baseEditor/propertyEditor/jsonEditor/JsonEditor"
				}
			};
			var mJson = {
				sampleMap: {
					"foo": "bar",
					"complex": {
						"complexChild": "childValue"
					}
				}
			};

			this.oBaseEditor = new BaseEditor({
				config: mConfig,
				json: mJson
			});
			this.oBaseEditor.placeAt("qunit-fixture");

			this.oBaseEditor.getPropertyEditor("sampleMap").then(function (oPropertyEditor) {
				this.oMapEditor = oPropertyEditor;
				sap.ui.getCore().applyChanges();
				var oMapEditorContent = getMapEditorContent(this.oMapEditor);
				this.oAddButton = oMapEditorContent.addButton;
				this.aItems = oMapEditorContent.items;
				fnDone();
			}.bind(this));
		},
		afterEach: function () {
			this.oBaseEditor.destroy();
		}
	}, function () {
		QUnit.test("When a MapEditor is created", function (assert) {
			assert.ok(this.oMapEditor.getDomRef() instanceof HTMLElement, "Then it is rendered correctly (1/3)");
			assert.ok(this.oMapEditor.getDomRef() && this.oMapEditor.getDomRef().offsetHeight > 0, "Then it is rendered correctly (2/3)");
			assert.ok(this.oMapEditor.getDomRef() && this.oMapEditor.getDomRef().offsetWidth > 0, "Then it is rendered correctly (3/3)");
		});

		QUnit.test("When a model is set", function (assert) {
			assert.deepEqual(
				this.aItems[0].value.getConfig(),
				[{
					type: "string",
					path: "foo",
					value: "bar"
				}],
				"Then the nested editor receives the correct config"
			);
		});

		QUnit.test("When an element is added", function (assert) {
			var fnDone = assert.async();
			this.oMapEditor.attachValueChange(function (oEvent) {
				assert.strictEqual(Object.keys(oEvent.getParameter("value")).length, 3, "Then editor contains three keys");
				assert.strictEqual(
					Object.keys(ObjectPath.get(["sampleMap"], this.oBaseEditor.getJson())).length,
					3,
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
					assert.strictEqual(Object.keys(oEvent.getParameter("value")).length, 4, "Then editor contains four keys");
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
				assert.strictEqual(Object.keys(oEvent.getParameter("value")).length, 1, "Then editor contains one key");
				assert.strictEqual(
					Object.keys(ObjectPath.get(["sampleMap"], this.oBaseEditor.getJson())).length,
					1,
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
							complex: {
								complexChild: "childValue"
							},
							foo2: "bar",
							key: ""
						},
						"Then the key is updated"
					);
					fnDone();
				});
				this.aItems[0].key.setValue("foo2");
				QUnitUtils.triggerEvent("input", this.aItems[0].key.getDomRef());
			}, this);
			QUnitUtils.triggerEvent("tap", this.oAddButton.getDomRef());
		});

		QUnit.test("When an element key is changed to an existing value", function (assert) {
			var fnDone = assert.async();
			this.oMapEditor.attachEventOnce("valueChange", function () {
				this.oMapEditorContent = getMapEditorContent(this.oMapEditor);
				this.aItems[0].key.setValue("key");
				QUnitUtils.triggerEvent("input", this.aItems[0].key.getDomRef());

				assert.deepEqual(
					this.oMapEditor.getAggregation("propertyEditor").getBindingContext().getObject().value,
					{
						complex: {
							complexChild: "childValue"
						},
						foo: "bar",
						key: ""
					},
					"Then the key is not updated"
				);
				assert.strictEqual(this.aItems[0].key.getValueState(), "Error", "Then the error is displayed");
				fnDone();
			}, this);
			QUnitUtils.triggerEvent("tap", this.oAddButton.getDomRef());
		});

		QUnit.test("When the type of an element is changed", function (assert) {
			var fnDone = assert.async();
			assert.strictEqual(this.aItems[0].value.getConfig()[0].type, "string", "Then the initial type is set");

			this.aItems[0].value.attachEventOnce("configChange", function () {
				assert.strictEqual(this.aItems[0].value.getConfig()[0].type, "json", "Then the change is reflected in the nested editor config");
				fnDone();
			}, this);

			var oTypeSelector = this.aItems[0].type.getDomRef();
			oTypeSelector.value = "Object";
			QUnitUtils.triggerEvent("input", oTypeSelector);
			QUnitUtils.triggerKeydown(oTypeSelector, KeyCodes.ENTER);
		});

		QUnit.test("When a value is updated and the new value is valid", function (assert) {
			var fnDone = assert.async();

			assert.deepEqual(
				this.oMapEditor.getValue(),
				{
					complex: {
						complexChild: "childValue"
					},
					foo: "bar"
				}
			);

			this.aItems[0].value.getAggregation("propertyEditors")[0].attachEventOnce("valueChange", function () {
				assert.deepEqual(
					this.oMapEditor.getValue(),
					{
						complex: {
							complexChild: "childValue"
						},
						foo: "baz"
					},
					"Then the value is updated"
				);
				fnDone();
			}, this);

			var oInput = this.aItems[0].value.getAggregation("propertyEditors")[0].getContent();
			oInput.setValue("baz");
			QUnitUtils.triggerEvent("input", oInput.getDomRef());
		});

		QUnit.test("When a value is updated and the new value is not valid", function (assert) {
			var oInput = this.aItems[0].value.getAggregation("propertyEditors")[0].getContent();
			oInput.setValue("{someInvalidBindingString");
			QUnitUtils.triggerEvent("input", oInput.getDomRef());

			assert.deepEqual(
				this.oMapEditor.getAggregation("propertyEditor").getBindingContext().getObject().value,
				{
					complex: {
						complexChild: "childValue"
					},
					foo: "bar"
				},
				"Then the value is not updated"
			);
			assert.strictEqual(oInput.getValueState(), "Error", "Then the error is displayed");
		});
	});
});