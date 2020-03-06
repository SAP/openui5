/* global QUnit */

sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/BaseEditor",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/thirdparty/sinon-4",
	"sap/base/util/values"
], function (
	BaseEditor,
	QUnitUtils,
	sinon,
	values
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	function _getComplexMapEditors (oEditor) {
		// Return the property keys of each complex editor value with the respective editors which were created
		var aComplexMapItems = oEditor.getContent().getItems()[0].getItems();
		return aComplexMapItems.map(function (oComplexMap) {
			var aNestedComplexMapEditors = {};
			oComplexMap.getItems()[1].getAggregation("propertyEditors").forEach(function (oPropertyEditor) {
				var sPropertyName = oPropertyEditor.getConfig().path.split("/")[1];
				aNestedComplexMapEditors[sPropertyName] = oPropertyEditor.getContent();
			});
			return aNestedComplexMapEditors;
		});
	}

	function _createBaseEditorConfig(mConfigOptions) {
		return {
			context: "/",
			properties: {
				"sampleDataSource": Object.assign({
					"label": "Data Sources",
					"type": "complexMap",
					"itemLabel": "Data Source",
					"path": "datasource",
					"template": {
						"uri": {
							"label": "URI",
							"type": "string",
							"path": "uri"
						},
						"type": {
							"label": "Type",
							"type": "enum",
							"enum": [
								"OData",
								"ODataAnnotation",
								"INA",
								"XML",
								"JSON"
							],
							"defaultValue": "OData",
							"path": "type"
						},
						"odataVersion": {
							"label": "OData Version",
							"type": "enum",
							"enum": [
								"2.0",
								"4.0"
							],
							"defaultValue": "2.0",
							"path": "settings/odataVersion"
						}
					}
				}, mConfigOptions)
			},
			propertyEditors: {
				"complexMap": "sap/ui/integration/designtime/cardEditor/propertyEditor/complexMapEditor/ComplexMapEditor",
				"array": "sap/ui/integration/designtime/baseEditor/propertyEditor/arrayEditor/ArrayEditor",
				"string": "sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor",
				"enum": "sap/ui/integration/designtime/baseEditor/propertyEditor/enumStringEditor/EnumStringEditor"
			}
		};
	}

	QUnit.module("Given an editor config", {
		before: function () {
			this.oComplexMap = {
				datasource: {
					sampleDataSource: {
						uri: "https://example.com",
						settings: {
							odataVersion: "4.0"
						}
					},
					anotherDataSource: {}
				}
			};
		},
		beforeEach: function () {
			var mConfig = _createBaseEditorConfig();

			this.oBaseEditor = new BaseEditor({
				config: mConfig,
				json: this.oComplexMap
			});
			this.oBaseEditor.placeAt("qunit-fixture");

			return this.oBaseEditor.getPropertyEditorsByName("sampleDataSource").then(function (aPropertyEditor) {
				this.oComplexMapEditor = aPropertyEditor[0];
				this.oNestedArrayEditor = this.oComplexMapEditor.getContent();
			}.bind(this));
		},
		afterEach: function () {
			this.oBaseEditor.destroy();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("When a ComplexMapEditor is created", function (assert) {
			var oComplexMapEditorDomRef = this.oComplexMapEditor.getDomRef();
			assert.ok(oComplexMapEditorDomRef instanceof HTMLElement, "Then it is rendered correctly (1/3)");
			assert.ok(oComplexMapEditorDomRef.offsetHeight > 0, "Then it is rendered correctly (2/3)");
			assert.ok(oComplexMapEditorDomRef.offsetWidth > 0, "Then it is rendered correctly (3/3)");
		});

		QUnit.test("When config and json data were set", function (assert) {
			assert.deepEqual(
				this.oNestedArrayEditor.getValue(),
				[
					{
						uri: "https://example.com",
						settings: {
							odataVersion: "4.0"
						},
						key: "sampleDataSource"
					},
					{ key: "anotherDataSource" }
				],
				"Then the editor value is properly converted to an array"
			);
		});

		QUnit.test("When a complex map item is modified in the editor", function (assert) {
			var fnDone = assert.async();

			this.oComplexMapEditor.attachValueChange(function (oEvent) {
				assert.deepEqual(
					oEvent.getParameter("value"),
					{
						anotherDataSource: {},
						sampleDataSource: {
							uri: "https://example.com/foobar",
							settings: {
								odataVersion: "4.0"
							}
						}
					},
					"Then it is properly updated"
				);
				fnDone();
			});

			var aDataSourceEditors = _getComplexMapEditors(this.oNestedArrayEditor)[0];
			aDataSourceEditors["uri"].setValue("https://example.com/foobar");
			QUnitUtils.triggerEvent("input", aDataSourceEditors["uri"].getDomRef());
		});

		QUnit.test("When the add button is clicked twice", function (assert) {
			var fnDone = assert.async();

			var oStub = sinon.stub();
			this.oComplexMapEditor.attachValueChange(oStub);

			oStub.onSecondCall().callsFake(function (oEvent) {
				var oValue = oEvent.getParameter("value");
				assert.strictEqual(Object.keys(oValue).length, 4, "Then two data sources with unique keys are added");
				assert.deepEqual(
					values(oValue),
					[].concat(values(this.oComplexMap.datasource), {}, {}),
					"Then two empty data sources are initialized and the original data source is not touched"
				);
				fnDone();
			}.bind(this));

			var oAddButton = this.oNestedArrayEditor.getContent().getItems()[1];
			QUnitUtils.triggerEvent("tap", oAddButton.getDomRef());
			QUnitUtils.triggerEvent("tap", oAddButton.getDomRef());
		});

		QUnit.test("When a duplicate key is provided", function (assert) {
			var oSpy = sandbox.spy();
			this.oComplexMapEditor.attachValueChange(oSpy);

			var aDataSourceEditors = _getComplexMapEditors(this.oNestedArrayEditor)[1];
			aDataSourceEditors["key"].setValue("sampleDataSource");
			QUnitUtils.triggerEvent("input", aDataSourceEditors["key"].getDomRef());

			assert.strictEqual(aDataSourceEditors["key"].getValueState(), "Error", "Then the error is displayed");

			assert.ok(oSpy.notCalled, "Then no value change is triggered");
			assert.deepEqual(
				this.oComplexMapEditor.getValue(),
				this.oComplexMap.datasource,
				"Then the editor value is not updated"
			);
		});
	});

	QUnit.module("Configuration options", {
		beforeEach: function () {
			var mJson = {
				datasource: {
					sampleDataSource: {
						uri: "https://example.com",
						settings: {
							odataVersion: "4.0"
						}
					}
				}
			};

			this.oBaseEditor = new BaseEditor({
				json: mJson
			});
			this.oBaseEditor.placeAt("qunit-fixture");
		},
		afterEach: function () {
			this.oBaseEditor.destroy();
		}
	}, function () {
		QUnit.test("When key changes are forbidden", function (assert) {
			var mConfig = _createBaseEditorConfig({
				allowKeyChange: false
			});
			this.oBaseEditor.setConfig(mConfig);

			return this.oBaseEditor.getPropertyEditorsByName("sampleDataSource").then(function (aPropertyEditor) {
				var oComplexMapEditor = aPropertyEditor[0];
				sap.ui.getCore().applyChanges();
				var oNestedArrayEditor = oComplexMapEditor.getContent();
				return oNestedArrayEditor.ready().then(function () {
					var oKeyEditor = _getComplexMapEditors(oNestedArrayEditor)[0]["key"];
					assert.notOk(oKeyEditor.getEnabled(), "Then the key field is disabled");
				});
			});
		});

		QUnit.test("When a custom key label is set", function (assert) {
			var mConfig = _createBaseEditorConfig({
				keyLabel: "Custom label"
			});
			this.oBaseEditor.setConfig(mConfig);

			return this.oBaseEditor.getPropertyEditorsByName("sampleDataSource").then(function (aPropertyEditor) {
				var oComplexMapEditor = aPropertyEditor[0];
				sap.ui.getCore().applyChanges();
				var oNestedArrayEditor = oComplexMapEditor.getContent();
				assert.strictEqual(
					oNestedArrayEditor.getConfig().template.key.label,
					"Custom label",
					"Then the label is overriden"
				);
			});
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});