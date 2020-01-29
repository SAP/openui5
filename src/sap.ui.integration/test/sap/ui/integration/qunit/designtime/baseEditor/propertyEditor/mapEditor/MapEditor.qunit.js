/* global QUnit */

sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/BaseEditor",
	"sap/ui/qunit/QUnitUtils",
	"sap/base/util/ObjectPath"
], function (
	BaseEditor,
	QUnitUtils,
	ObjectPath
) {
	"use strict";

	function getMapEditorContent (oEditor) {
		return {
			addButton: oEditor.getContent().getColumns()[2].getHeader(),
			items: oEditor.getContent().getItems().map(function (item) {
				return {
					key: item.getCells()[0],
					value: item.getCells()[1],
					deleteButton: item.getCells()[2]
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
					"string": "sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor"
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

			this.oBaseEditor.getPropertyEditor("sampleMap").then(function (oPropertyEditor) {
				this.oEditor = oPropertyEditor;
				sap.ui.getCore().applyChanges();
				var oEditorContent = getMapEditorContent(this.oEditor);
				this.oAddButton = oEditorContent.addButton;
				this.aItems = oEditorContent.items;
				fnDone();
			}.bind(this));
		},
		afterEach: function () {
			this.oBaseEditor.destroy();
		}
	}, function () {
		QUnit.test("When a MapEditor is created", function (assert) {
			assert.ok(this.oEditor.getDomRef() instanceof HTMLElement, "Then it is rendered correctly (1/3)");
			assert.ok(this.oEditor.getDomRef() && this.oEditor.getDomRef().offsetHeight > 0, "Then it is rendered correctly (2/3)");
			assert.ok(this.oEditor.getDomRef() && this.oEditor.getDomRef().offsetWidth > 0, "Then it is rendered correctly (3/3)");
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
			this.oEditor.attachValueChange(function (oEvent) {
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
			this.oEditor.attachEventOnce("valueChange", function (oEvent) {
				assert.ok(oEvent.getParameter("value").hasOwnProperty("key"), "Then a new key is added");

				this.oEditor.attachValueChange(function (oEvent) {
					assert.strictEqual(Object.keys(oEvent.getParameter("value")).length, 3, "Then editor contains three keys");
					fnDone();
				});
				QUnitUtils.triggerEvent("tap", this.oAddButton.getDomRef());
			}, this);
			QUnitUtils.triggerEvent("tap", this.oAddButton.getDomRef());
		});

		QUnit.test("When an element is removed", function (assert) {
			var fnDone = assert.async();
			this.oEditor.attachValueChange(function (oEvent) {
				assert.notOk(oEvent.getParameter("value").hasOwnProperty("foo"), "Then the property is removed");
				assert.strictEqual(Object.keys(oEvent.getParameter("value")).length, 0, "Then editor contains no more keys");
				assert.strictEqual(
					Object.keys(ObjectPath.get(["sampleMap"], this.oBaseEditor.getJson())).length,
					0,
					"Then the base editor JSON is updated"
				);
				fnDone();
			}, this);
			QUnitUtils.triggerEvent("tap", this.aItems[0].deleteButton.getDomRef());
		});

		QUnit.test("When an element is added to an empty map", function (assert) {
			var fnDone = assert.async();

			this.oBaseEditor.attachEventOnce("propertyEditorsReady", function (oEvent) {
				this.oEditor = oEvent.getParameter("propertyEditors")[0];
				sap.ui.getCore().applyChanges();
				this.oAddButton = getMapEditorContent(this.oEditor).addButton;

				this.oEditor.attachValueChange(function (oEvent) {
					assert.strictEqual(Object.keys(oEvent.getParameter("value")).length, 1, "Then editor contains one key");
					fnDone();
				});

				QUnitUtils.triggerEvent("tap", this.oAddButton.getDomRef());
			}, this);

			this.oBaseEditor.setJson({sampleMap: {}});
		});

		QUnit.test("When an element key is changed to an unique value", function (assert) {
			var fnDone = assert.async();
			this.oEditor.attachEventOnce("valueChange", function () {
				this.oEditor.attachValueChange(function (oEvent) {
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
				this.aItems[0].key.setValue("foo2");
				QUnitUtils.triggerEvent("input", this.aItems[0].key.getDomRef());
			}, this);
			QUnitUtils.triggerEvent("tap", this.oAddButton.getDomRef());
		});

		QUnit.test("When an element key is changed to an existing value", function (assert) {
			var fnDone = assert.async();
			this.oEditor.attachEventOnce("valueChange", function () {
				this.oEditorContent = getMapEditorContent(this.oEditor);
				this.aItems[0].key.setValue("key");
				QUnitUtils.triggerEvent("input", this.aItems[0].key.getDomRef());

				assert.deepEqual(
					this.oEditor.getBindingContext().getObject().value,
					{
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

		QUnit.test("When a value is updated and the new value is valid", function (assert) {
			var fnDone = assert.async();
			this.oEditor.attachValueChange(function (oEvent) {
				assert.deepEqual(
					oEvent.getParameter("value"),
					{
						foo: "baz"
					},
					"Then the value is updated"
				);
				fnDone();
			});
			// FIXME: Timing issue
			sap.ui.getCore().applyChanges();
			var oInput = this.aItems[0].value.getAggregation("propertyEditors")[0].getContent();
			oInput.setValue("baz");
			QUnitUtils.triggerEvent("input", oInput.getDomRef());
		});

		QUnit.test("When a value is updated and the new value is not valid", function (assert) {
			// FIXME: Timing issue
			sap.ui.getCore().applyChanges();
			var oInput = this.aItems[0].value.getAggregation("propertyEditors")[0].getContent();
			oInput.setValue("{someInvalidBindingString");
			QUnitUtils.triggerEvent("input", oInput.getDomRef());

			assert.deepEqual(
				this.oEditor.getBindingContext().getObject().value,
				{
					foo: "bar"
				},
				"Then the value is not updated"
			);
			assert.strictEqual(oInput.getValueState(), "Error", "Then the error is displayed");
		});
	});
});