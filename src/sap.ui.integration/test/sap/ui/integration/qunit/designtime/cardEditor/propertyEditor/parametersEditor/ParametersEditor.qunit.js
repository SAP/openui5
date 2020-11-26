/* global QUnit */

sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/BaseEditor",
	"sap/ui/qunit/QUnitUtils",
	"sap/base/util/restricted/_debounce",
	"qunit/designtime/EditorQunitUtils"
], function (
	BaseEditor,
	QUnitUtils,
	_debounce,
	EditorQunitUtils
) {
	"use strict";
	var isIE = false;
	if (navigator.userAgent.toLowerCase().indexOf("trident") > 0) {
		isIE = true;
	}
	function getParameterEditorContent (oEditor) {
		return {
			addButton: oEditor.getContent().getItems()[1],
			items: oEditor.getContent().getItems()[0].getItems().map(function (oItem) {
				var oNestedEditors = oItem.getContent()[0]._getPropertyEditors();
				return {
					key: oNestedEditors[0],
					type: oNestedEditors[1],
					value: oNestedEditors[2],
					label: oNestedEditors[3],
					description: oNestedEditors[4],
					visible: oNestedEditors[5],
					editable: oNestedEditors[6],
					translatable: oNestedEditors[7],
					allowDynamicValues: oNestedEditors[8],
					allowSettings: oNestedEditors[9],
					deleteButton: oItem.getHeaderToolbar().getContent()[2]
				};
			})
		};
	}

	QUnit.module("Parameters Editor: Given an editor config", {
		beforeEach: function (assert) {
			var mConfig = {
				"properties": {
					"sampleParams": {
						"path": "/sampleParams",
						"type": "parameters"
					}
				},
				"propertyEditors": {
					"parameters": "sap/ui/integration/designtime/cardEditor/propertyEditor/parametersEditor/ParametersEditor",
					"string": "sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor",
					"boolean": "sap/ui/integration/designtime/baseEditor/propertyEditor/booleanEditor/BooleanEditor",
					"select": "sap/ui/integration/designtime/baseEditor/propertyEditor/selectEditor/SelectEditor",
					"textArea": "sap/ui/integration/designtime/baseEditor/propertyEditor/textAreaEditor/TextAreaEditor"
				}
			};
			var mJson = {
				sampleParams: {
					foo: {
						value: "bar",
						label: "Test Parameter",
						type: "string"
					}
				}
			};

			this.oBaseEditor = new BaseEditor({
				config: mConfig,
				json: mJson
			});
			this.oBaseEditor.placeAt("qunit-fixture");

			return this.oBaseEditor.getPropertyEditorsByName("sampleParams").then(function (aPropertyEditor) {
				this.oEditor = aPropertyEditor[0];
				sap.ui.getCore().applyChanges();
				var oEditorContent = getParameterEditorContent(this.oEditor);
				this.oAddButton = oEditorContent.addButton;
				this.aItems = oEditorContent.items;
			}.bind(this));
		},
		afterEach: function () {
			this.oBaseEditor.destroy();
		}
	}, function () {
		if (!isIE) {
			QUnit.test("When a ParametersEditor is created", function (assert) {
				assert.ok(this.oEditor.getDomRef() instanceof HTMLElement, "Then it is rendered correctly (1/3)");
				assert.ok(this.oEditor.getDomRef() && this.oEditor.getDomRef().offsetHeight > 0, "Then it is rendered correctly (2/3)");
				assert.ok(this.oEditor.getDomRef() && this.oEditor.getDomRef().offsetWidth > 0, "Then it is rendered correctly (3/3)");
			});

			QUnit.test("When a value is set", function (assert) {
				assert.deepEqual(
					this.aItems[0].value.getConfig(),
					{
						type: "string",
						itemKey: "foo",
						path: "value",
						designtime: undefined,
						visible: true
					},
					"Then the nested editor receives the correct config"
				);

				assert.strictEqual(
					this.aItems[0].value.getValue(),
					"bar",
					"Then the nested editor receives the correct value"
				);
			});

			QUnit.test("When no label is provided", function (assert) {
				var fnDone = assert.async();

				// MapEditor dataflow problem
				var fnOnValueChangeDebounced = _debounce(function (vValue) {
					assert.deepEqual(
						vValue,
						{
							"foo": {
								"value": "baz",
								"type": "string"
							}
						},
						"Then the fallback label is not written to the manifest"
					);
					assert.strictEqual(
						this.aItems[0].label.getContent().getPlaceholder(),
						"foo",
						"Then the key is used as a default label"
					);
					fnDone();
				}.bind(this), 0);
				this.oEditor.attachValueChange(function (oEvent) {
					var vReceivedValue = Object.assign({}, oEvent.getParameter("value"));
					fnOnValueChangeDebounced(vReceivedValue);
				});

				this.oEditor.setValue({
					foo: {
						value: "baz",
						type: "string"
					}
				});
			});

			QUnit.test("When the key for an item with fallback label is changed", function (assert) {
				var fnDone = assert.async();

				// MapEditor dataflow problem
				this.oEditor.attachValueChange(_debounce(function () {
					assert.strictEqual(
						this.aItems[0].label.getContent().getPlaceholder(),
						"foo2",
						"Then the fallback label is changed to the new key"
					);
					fnDone();
				}.bind(this), 0));

				this.oEditor.setValue({
					foo: {
						value: "baz",
						type: "string"
					}
				});
				EditorQunitUtils.setInputValue(this.aItems[0].key.getContent(), "foo2");
			});

			QUnit.test("When an element key is changed to an unique value", function (assert) {
				var fnDone = assert.async();

				this.oEditor.attachValueChange(function (oEvent) {
					assert.deepEqual(
						oEvent.getParameter("value"),
						{
							"foo2": {
								"value": "bar",
								"type": "string",
								"label": "Test Parameter"
							}
						},
						"Then the key is updated"
					);
					fnDone();
				});
				EditorQunitUtils.setInputValue(this.aItems[0].key.getContent(), "foo2");
			});

			QUnit.test("When the label is changed in the editor", function (assert) {
				var fnDone = assert.async();

				this.oEditor.attachDesigntimeMetadataChange(function (oEvent) {
					assert.strictEqual(
						oEvent.getParameter("value").foo.__value.label,
						"Changed Label",
						"Then the label is updated"
					);
					fnDone();
				});
				EditorQunitUtils.setInputValue(this.aItems[0].label.getContent(), "Changed Label");
			});
		}
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
		if (!isIE) {
			QUnit.test("When invalid entries should be filtered and a non-string value without a type is set", function (assert) {
				this.oBaseEditor.setConfig({
					"properties": {
						"sampleParameters": {
							"path": "/sampleParameters",
							"type": "parameters",
							"includeInvalidEntries": false,
							"allowedTypes": ["string", "number"]
						}
					},
					"propertyEditors": {
						"parameters": "sap/ui/integration/designtime/cardEditor/propertyEditor/parametersEditor/ParametersEditor",
						"string": "sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor",
						"number": "sap/ui/integration/designtime/baseEditor/propertyEditor/numberEditor/NumberEditor",
						"boolean": "sap/ui/integration/designtime/baseEditor/propertyEditor/booleanEditor/BooleanEditor",
						"select": "sap/ui/integration/designtime/baseEditor/propertyEditor/selectEditor/SelectEditor",
						"textArea": "sap/ui/integration/designtime/baseEditor/propertyEditor/textAreaEditor/TextAreaEditor"
					}
				});

				this.oBaseEditor.setJson({
					sampleParameters: {
						"invalidProperty": {
							value: 123
						},
						"validProperty": {
							value: "Valid"
						}
					}
				});

				return this.oBaseEditor.getPropertyEditorsByName("sampleParameters").then(function (aPropertyEditor) {
					var oParametersEditor = aPropertyEditor[0];
					var oParametersEditorContent = getParameterEditorContent(oParametersEditor);
					var aItems = oParametersEditorContent.items;

					assert.strictEqual(aItems.length, 1, "Then the invalid value is not included");
				});
			});
		}

		QUnit.test("When type change and key change are forbidden", function (assert) {
			this.oBaseEditor.setConfig({
				"properties": {
					"sampleParameters": {
						"path": "/sampleParameters",
						"type": "parameters",
						"allowKeyChange": false,
						"allowTypeChange": false
					}
				},
				"propertyEditors": {
					"parameters": "sap/ui/integration/designtime/cardEditor/propertyEditor/parametersEditor/ParametersEditor",
					"string": "sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor",
					"textArea": "sap/ui/integration/designtime/baseEditor/propertyEditor/textAreaEditor/TextAreaEditor"
				}
			});

			this.oBaseEditor.setJson({
				sampleParameters: {
					"foo": {
						value: "foo value"
					},
					"bar": {
						value: "bar value"
					}
				}
			});

			return this.oBaseEditor.getPropertyEditorsByName("sampleParameters").then(function (aPropertyEditor) {
				var oParametersEditor = aPropertyEditor[0];
				assert.strictEqual(
					oParametersEditor.getAggregation('propertyEditor').getFragment(),
					"sap.ui.integration.designtime.cardEditor.propertyEditor.parametersEditor.ParametersConfigurationEditor",
					"Then the fragment for the configuration scenario is rendered"
				);
			});

		});
	});

	QUnit.module("Given the editor is used in the configuration scenario", {
		beforeEach: function () {
			this.oBaseEditor = new BaseEditor({
				config: {
					"properties": {
						"sampleParameters": {
							"path": "/sampleParameters",
							"type": "parameters",
							"allowKeyChange": false,
							"allowTypeChange": false
						}
					},
					"propertyEditors": {
						"parameters": "sap/ui/integration/designtime/cardEditor/propertyEditor/parametersEditor/ParametersEditor",
						"string": "sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor",
						"boolean": "sap/ui/integration/designtime/baseEditor/propertyEditor/booleanEditor/BooleanEditor",
						"select": "sap/ui/integration/designtime/baseEditor/propertyEditor/selectEditor/SelectEditor",
						"textArea": "sap/ui/integration/designtime/baseEditor/propertyEditor/textAreaEditor/TextAreaEditor"
					}
				},
				json: {
					sampleParameters: {
						foo: {
							value: "foo value"
						},
						bar: {
							value: "bar value"
						}
					}
				}
			});
			this.oBaseEditor.placeAt("qunit-fixture");

			return this.oBaseEditor.getPropertyEditorsByName("sampleParameters").then(function (aPropertyEditor) {
				this.oParametersEditor = aPropertyEditor[0];
			}.bind(this));
		},
		afterEach: function () {
			this.oBaseEditor.destroy();
		}
	}, function () {
		QUnit.test("When a value is changed", function (assert) {
			var fnDone = assert.async();

			this.oParametersEditor.attachEventOnce("valueChange", function (oEvent) {
				assert.deepEqual(
					oEvent.getParameter("value"),
					{
						foo: {
							value: "foo value"
						},
						bar: {
							value: "baz value"
						}
					},
					"Then the value is updated"
				);
				fnDone();
			}, this);

			var oInput = this.oParametersEditor.getContent()._getPropertyEditors()[1].getContent();
			EditorQunitUtils.setInputValue(oInput, "baz value");
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});