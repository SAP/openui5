/* global QUnit */

sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/BaseEditor",
	"qunit/designtime/EditorQunitUtils",
	"sap/ui/thirdparty/sinon-4"
], function (
	BaseEditor,
	EditorQunitUtils,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	function _getComplexMapEditors (oEditor) {
		// Return the property keys of each complex editor value with the respective editors which were created
		var aComplexMapItems = oEditor.getContent().getItems()[0].getItems();
		return aComplexMapItems.map(function (oFilters) {
			var aNestedComplexMapEditors = {};
			var oArrayEditor = oEditor.getConfig().collapsibleItems === false
				? oFilters.getItems()[1]
				: oFilters.getContent()[0];
			oArrayEditor._getPropertyEditors().forEach(function (oPropertyEditor) {
				var sPropertyName = oPropertyEditor.getConfig().path.split("/")[1];
				aNestedComplexMapEditors[sPropertyName] = oPropertyEditor;
			});
			return aNestedComplexMapEditors;
		});
	}

	function _createBaseEditorConfig(mConfigOptions) {
		return {
			context: "/",
			properties: {
				"sampleFilter": Object.assign({
					"label": "Filters",
					"type": "filters",
					"itemLabel": "Filters",
					"path": "filters"
				}, mConfigOptions)
			},
			propertyEditors: {
				"filters": "sap/ui/integration/designtime/cardEditor/propertyEditor/filtersEditor/FiltersEditor",
				"array": "sap/ui/integration/designtime/baseEditor/propertyEditor/arrayEditor/ArrayEditor",
				"string": "sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor",
				"select": "sap/ui/integration/designtime/baseEditor/propertyEditor/selectEditor/SelectEditor",
				"code": "sap/ui/integration/designtime/baseEditor/propertyEditor/codeEditor/CodeEditor",
				"json": "sap/ui/integration/designtime/baseEditor/propertyEditor/jsonEditor/JsonEditor",
				"multiSelect": "sap/ui/integration/designtime/baseEditor/propertyEditor/multiSelectEditor/MultiSelectEditor"
			}
		};
	}

	QUnit.module("Developer scenario", {
		before: function () {
			this.oFilters = {
				filters: {
					sampleFilter: {
						label: "MySampleFilter",
						type: "Select"
					},
					anotherFilter: {
						label: "MyAnotherFilter",
						type: "Select"
					}
				}
			};
		},
		beforeEach: function () {
			var mConfig = _createBaseEditorConfig();

			this.oBaseEditor = new BaseEditor({
				config: mConfig,
				json: this.oFilters
			});
			this.oBaseEditor.placeAt("qunit-fixture");

			return this.oBaseEditor.getPropertyEditorsByName("sampleFilter").then(function (aPropertyEditor) {
				this.oFiltersEditor = aPropertyEditor[0];
				this.oNestedArrayEditor = this.oFiltersEditor.getContent();
			}.bind(this));
		},
		afterEach: function () {
			this.oBaseEditor.destroy();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("When an editor is created", function (assert) {
			var oFiltersEditorDomRef = this.oFiltersEditor.getDomRef();
			assert.ok(oFiltersEditorDomRef instanceof HTMLElement, "Then it is rendered correctly (1/3)");
			assert.ok(oFiltersEditorDomRef.offsetHeight > 0, "Then it is rendered correctly (2/3)");
			assert.ok(oFiltersEditorDomRef.offsetWidth > 0, "Then it is rendered correctly (3/3)");
		});

		QUnit.test("When config and json data were set", function (assert) {
			assert.deepEqual(
				this.oNestedArrayEditor.getValue(),
				[
					{
						"key": "sampleFilter",
						"label": "MySampleFilter",
						"options": [
						  "date",
						  "today",
						  "dateRange",
						  "from",
						  "to",
						  "lastDays",
						  "nextDays",
						  "lastWeeks",
						  "nextWeeks"
						],
						"sValue": undefined,
						"selectedOptions": [],
						"type": "Select"
					  },
					  {
						"key": "anotherFilter",
						"label": "MyAnotherFilter",
						"options": [
						  "date",
						  "today",
						  "dateRange",
						  "from",
						  "to",
						  "lastDays",
						  "nextDays",
						  "lastWeeks",
						  "nextWeeks"
						],
						"sValue": undefined,
						"selectedOptions": [],
						"type": "Select"
					  }
				],
				"Then the editor value is properly converted to an array"
			);
		});

		QUnit.test("When the description is set in the editor", function (assert) {
			var fnDone = assert.async();
			var oDescriptionEditor = _getComplexMapEditors(this.oNestedArrayEditor)[0].description;

			this.oFiltersEditor.attachValueChange(function (oEvent) {
				assert.deepEqual(
					oEvent.getParameter("value"),
					{
						"anotherFilter": {
						  "label": "MyAnotherFilter",
						  "options": [
							"date",
							"today",
							"dateRange",
							"from",
							"to",
							"lastDays",
							"nextDays",
							"lastWeeks",
							"nextWeeks"
						  ],
						  "selectedOptions": [],
						  "type": "Select",
						  "value": undefined
						},
						"sampleFilter": {
						  "description": "dTest",
						  "label": "MySampleFilter",
						  "options": [
							"date",
							"today",
							"dateRange",
							"from",
							"to",
							"lastDays",
							"nextDays",
							"lastWeeks",
							"nextWeeks"
						  ],
						  "selectedOptions": [],
						  "type": "Select",
						  "value": undefined
						}
					},
					"Then the description is updated"
				);
				fnDone();
			});
			EditorQunitUtils.setInputValue(oDescriptionEditor.getContent(), "dTest");
		});
	});

	QUnit.module("Configuration options", {
		beforeEach: function () {
			var mJson = {
				filters: {
					sampleFilter: {
						type: "abc"
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
		QUnit.test("When allowed values are set", function (assert) {
			var mConfig = _createBaseEditorConfig({
				allowKeyChange: false,
				allowedTypes: ["abc", "def"]
			});
			this.oBaseEditor.setConfig(mConfig);

			return this.oBaseEditor.getPropertyEditorsByName("sampleFilter").then(function (aPropertyEditor) {
				var oFiltersEditor = aPropertyEditor[0];
				sap.ui.getCore().applyChanges();
				var oNestedArrayEditor = oFiltersEditor.getContent();
				return oNestedArrayEditor.ready().then(function () {
					var oComplexEditors = _getComplexMapEditors(oNestedArrayEditor)[0];
					assert.deepEqual(Object.keys(oComplexEditors), ["type"], "Then only the type field is editable");

					assert.deepEqual(
						oComplexEditors.type.getConfig().items,
						mConfig.properties.sampleFilter.allowedTypes.map(function(sKey){ return { key: sKey }; }),
						"Then only the allowed types are available in the type selection"
					);
				});
			});
		});
	});

	QUnit.module("Check filter type: Select.", {
		beforeEach: function () {
			var mJson = {
				filters: {
					sampleFilter: {
						type: "Select"
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
		QUnit.test("Check fields state", function (assert) {
			var mConfig = _createBaseEditorConfig();
			this.oBaseEditor.setConfig(mConfig);

			return this.oBaseEditor.getPropertyEditorsByName("sampleFilter").then(function (aPropertyEditor) {
				var oFiltersEditor = aPropertyEditor[0];
				sap.ui.getCore().applyChanges();
				var oNestedArrayEditor = oFiltersEditor.getContent();
				return oNestedArrayEditor.ready().then(function() {
					var oComplexEditors = _getComplexMapEditors(oNestedArrayEditor)[0];

					var oKey = oComplexEditors.key;
					var oType = oComplexEditors.type;
					var oLabel = oComplexEditors.label;
					var oDescription = oComplexEditors.description;
					var oValue = oComplexEditors.sValue;
					var oItems = oComplexEditors.items;

					assert.ok(oKey.getVisible(), "Key field is editable.");
					assert.ok(oType.getVisible(), "Type field is editable.");
					assert.ok(oLabel.getVisible(), "Label field is editable.");
					assert.ok(oDescription.getVisible(), "Description field is editable.");
					assert.ok(oValue.getVisible(), "Value field is editable.");
					assert.ok(oItems.getVisible(), "Items field is editable.");
				});
			});
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});