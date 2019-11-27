/* global QUnit */

sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/BaseEditor",
	"sap/ui/qunit/QUnitUtils"
], function (
	BaseEditor,
	QUnitUtils
) {
	"use strict";

	function getParameterEditorContent (oEditor) {
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

	QUnit.module("Parameters Editor: Given an editor config", {
		beforeEach: function (assert) {
			var fnDone = assert.async();
			var mConfig = {
				"properties": {
					"sampleParams": {
						"path": "sampleParams",
						"type": "parameters"
					}
				},
				"propertyEditors": {
					"parameters": "sap/ui/integration/designtime/baseEditor/propertyEditor/parametersEditor/ParametersEditor",
					"string": "sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor"
				}
			};
			var mJson = {
				sampleParams: {
					foo: {
						value: "bar"
					}
				}
			};

			this.oBaseEditor = new BaseEditor({
				config: mConfig,
				json: mJson
			});
			this.oBaseEditor.placeAt("qunit-fixture");

			this.oBaseEditor.getPropertyEditor("sampleParams").then(function (oPropertyEditor) {
				this.oEditor = oPropertyEditor;
				sap.ui.getCore().applyChanges();
				var oEditorContent = getParameterEditorContent(this.oEditor);
				this.oAddButton = oEditorContent.addButton;
				this.aItems = oEditorContent.items;
				fnDone();
			}.bind(this));
		},
		afterEach: function () {
			this.oBaseEditor.destroy();
		}
	}, function () {
		QUnit.test("When a ParametersEditor is created", function (assert) {
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

		QUnit.test("When an element key is changed to an unique value", function (assert) {
			var fnDone = assert.async();

			this.oEditor.attachPropertyChange(function (oEvent) {
				assert.deepEqual(
					oEvent.getParameter("value"),
					{
						"foo2": {
							"value": "bar"
						}
					},
					"Then the key is updated"
				);
				fnDone();
			});
			this.aItems[0].key.setValue("foo2");
			QUnitUtils.triggerEvent("input", this.aItems[0].key.getDomRef());
		});
	});
});