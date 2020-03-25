/* global QUnit */

sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/BaseEditor",
	"sap/ui/integration/designtime/baseEditor/propertyEditor/arrayEditor/ArrayEditor",
	"sap/ui/model/json/JSONModel",
	"sap/ui/qunit/QUnitUtils",
	"sap/base/util/ObjectPath",
	"sap/base/util/restricted/_merge"
], function (
	BaseEditor,
	ArrayEditor,
	JSONModel,
	QUnitUtils,
	ObjectPath,
	_merge
) {
	"use strict";

	function _getArrayEditorElements(oEditor) {
		return oEditor.getContent().getItems()[0].getItems();
	}

	QUnit.module("Array Editor: Given an editor config", {
		beforeEach: function (assert) {
			var fnReady = assert.async();
			var mPropertyConfig = {
				tags: ["header", "numericHeader"],
				label: "SIDE_INDICATORS",
				path: "/header/sideIndicators",
				type: "array",
				itemLabel: "SIDE_INDICATOR",
				template: {
					title: {
						label: "SIDE_INDICATOR.TITLE",
						type: "string",
						path: "title",
						defaultValue: "Side Indicator"
					},
					number: {
						label: "SIDE_INDICATOR.NUMBER",
						type: "number",
						path: "number"
					},
					unit: {
						label: "SIDE_INDICATOR.UNIT",
						type: "string",
						path: "unit"
					}
				},
				maxItems: 3,
				visible: "{= ${context>/header/type} === 'Numeric' }"
			};
			var mConfig = {
				context: "/",
				properties: {
					sideIndicator: mPropertyConfig
				},
				propertyEditors: {
					"array": "sap/ui/integration/designtime/baseEditor/propertyEditor/arrayEditor/ArrayEditor",
					"string": "sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor",
					"number": "sap/ui/integration/designtime/baseEditor/propertyEditor/numberEditor/NumberEditor",
					"enum": "sap/ui/integration/designtime/baseEditor/propertyEditor/enumStringEditor/EnumStringEditor"
				}
			};
			var mJson = {
					header: {
						type: "Numeric",
						sideIndicators:
							[
								{
									"title": "Target",
									"number": 250,
									"unit": "K"
								},
								{
									"title": "Deviation",
									"number": 42,
									"unit": "%"
								}
							]
					}
			};

			this.oBaseEditor = new BaseEditor({
				config: mConfig,
				json: mJson
			});
			this.oBaseEditor.placeAt("qunit-fixture");

			this.oBaseEditor.getPropertyEditorsByName("sideIndicator").then(function (aPropertyEditor) {
				this.oArrayEditor = aPropertyEditor[0];
				sap.ui.getCore().applyChanges();
				this.oArrayEditorElement = this.oArrayEditor.getContent();
				fnReady();
			}.bind(this));
		},
		afterEach: function () {
			this.oBaseEditor.destroy();
		}
	}, function () {
		QUnit.test("When an ArrayEditor is created", function (assert) {
			assert.ok(this.oArrayEditor.getDomRef() instanceof HTMLElement, "Then it is rendered correctly (1/3)");
			assert.ok(this.oArrayEditor.getDomRef() && this.oArrayEditor.getDomRef().offsetHeight > 0, "Then it is rendered correctly (2/3)");
			assert.ok(this.oArrayEditor.getDomRef() && this.oArrayEditor.getDomRef().offsetWidth > 0, "Then it is rendered correctly (3/3)");
		});

		QUnit.test("When a model is set", function (assert) {
			var oPropertyEditors = _getArrayEditorElements(this.oArrayEditor)[0].getItems()[1];
			assert.strictEqual(oPropertyEditors.getConfig().length, 3, "Then the property editors get three configurations");
			assert.strictEqual(oPropertyEditors.getConfig()[0].type, "string", "and the first property editor is for string");
			assert.strictEqual(oPropertyEditors.getConfig()[1].type, "number", "and the second property editor is for number");
			assert.strictEqual(oPropertyEditors.getConfig()[2].type, "string", "and the third property editor is for string");
		});

		QUnit.test("When the first delete button is pressed in the editor", function (assert) {
			var done = assert.async();

			this.oArrayEditor.attachEventOnce("valueChange", function (oEvent) {
				assert.strictEqual(oEvent.getParameter("value").length, 1, "Then there is only one side indicator");
				assert.equal(oEvent.getParameter("value")[0].title, "Deviation", "Then it is updated correctly");
				done();
			});
			var oDelButton0 = _getArrayEditorElements(this.oArrayEditor)[0].getItems()[0].getContentRight()[2];
			QUnitUtils.triggerEvent("tap", oDelButton0.getDomRef());
		});

		QUnit.test("When the second delete button is pressed in the editor", function (assert) {
			var done = assert.async();

			this.oArrayEditor.attachValueChange(function (oEvent) {
				assert.strictEqual(oEvent.getParameter("value").length, 1, "Then there is only one side indicator");
				assert.strictEqual(oEvent.getParameter("value")[0].title, "Target", "Then it is updated correctly");
				done();
			});
			var oButton1 = _getArrayEditorElements(this.oArrayEditor)[1].getItems()[0].getContentRight()[2];
			QUnitUtils.triggerEvent("tap", oButton1.getDomRef());
		});

		QUnit.test("When the default values are undefined or complex", function (assert) {
			var done = assert.async();
			var oConfig = {
				tags: ["header", "numericHeader"],
				label: "SIDE_INDICATORS",
				path: "/header/sideIndicators",
				type: "array",
				itemLabel: "SIDE_INDICATOR",
				template: {
					title : {
						label: "SIDE_INDICATOR.TITLE",
						type: "string",
						path: "title",
						defaultValue: undefined
					},
					number : {
						label: "SIDE_INDICATOR.NUMBER",
						type: "enum",
						defaultValue: {
							val: 1,
							unit: undefined
						},
						path: "number",
						"enum": [{
							val: 1,
							unit: undefined
						}]
					}
				},
				maxItems: 3,
				visible: true
			};
			this.oArrayEditor.getAggregation("propertyEditor").setConfig(oConfig);

			this.oArrayEditor.attachValueChange(function (oEvent) {
				assert.deepEqual(
					oEvent.getParameter("value")[2],
					{},
					"Then new items have the proper values"
				);
				assert.ok(oEvent.getParameter("value")[2].number !== oConfig.template.number.defaultValue, "Then the default value is cloned");
				done();
			});
			var oAddButton = this.oArrayEditorElement.getItems()[1];
			QUnitUtils.triggerEvent("tap", oAddButton.getDomRef());
		});

		QUnit.test("When the add button is pressed in the editor", function (assert) {
			var done = assert.async();

			this.oArrayEditor.attachValueChange(function (oEvent) {
				assert.strictEqual(oEvent.getParameter("value").length, 3, "Then there are three side indicators");
				assert.deepEqual(oEvent.getParameter("value")[2], {}, "Then the new item is created with proper default values");
				done();
			});
			var oAddButton = this.oArrayEditorElement.getItems()[1];
			QUnitUtils.triggerEvent("tap", oAddButton.getDomRef());
		});

		QUnit.test("Ready handling - When the editor items change", function (assert) {
			var done = assert.async();
			var oAddButton = this.oArrayEditorElement.getItems()[1];
			this.oArrayEditor.attachEventOnce("ready", function () {
				assert.ok(true, "Then the ready event of the ArrayEditor is triggered again after the update");
				done();
			}, this);
			QUnitUtils.triggerEvent("tap", oAddButton.getDomRef());
		});

		QUnit.test("When a new item is added to and an existing item is removed from an array", function (assert) {
			var done = assert.async();

			this.oArrayEditor.attachEventOnce("valueChange", function (oEvent) {
				var aEditorValueAfterAdding = oEvent.getParameter("value");
				assert.deepEqual(
					aEditorValueAfterAdding,
					[{
						title: "Target",
						number: 250,
						unit: "K"
					},{
						number: 42,
						title: "Deviation",
						unit: "%"
					},{
					}],
					"Then the new item is added to the array"
				);

				this.oArrayEditor.attachValueChange(function (oEvent) {
					assert.deepEqual(
						oEvent.getParameter("value"),
						[{
							title: "Target",
							number: 250,
							unit: "K"
						},{
						}],
						"Then the remaining items still have the correct value"
					);
					assert.ok(oEvent.getParameter("value") !== aEditorValueAfterAdding, "Then the editor value is not mutated");
					done();
				});

				// The old item is deleted
				QUnitUtils.triggerEvent("tap", _getArrayEditorElements(this.oArrayEditor)[1].getItems()[0].getContentRight()[2].getDomRef());

			}.bind(this));

			// A new item is added
			QUnitUtils.triggerEvent("tap", this.oArrayEditorElement.getItems()[1].getDomRef());
		});

		QUnit.test("When an element is added to a non-declared array", function (assert) {
			var done = assert.async();
			this.oPropertyConfig = {
				label: "EMPTY ARRAY TEST",
				path: "/emptyArray",
				type: "array",
				template: {
					title : {
						label: "TITLE",
						type: "string",
						path: "title",
						defaultValue: "Default Title"
					}
				}
			};

			this.oArrayEditor.setConfig(this.oPropertyConfig);

			this.oArrayEditor.ready().then(function () {
				sap.ui.getCore().applyChanges();
				this.oArrayEditor.attachValueChange(function (oEvent) {
					assert.strictEqual(oEvent.getParameter("value").length, 1, "Then there is one item");
					assert.deepEqual(oEvent.getParameter("value")[0], {}, "Then the new item is created with proper default values");
					done();
				});
				var oAddButton = this.oArrayEditor.getContent().getItems()[1];
				assert.strictEqual(oAddButton.getEnabled(), true, "Then the button to add an item is enabled");
				QUnitUtils.triggerEvent("tap", oAddButton.getDomRef());
			}.bind(this));
		});

		QUnit.test("moveUp should be disabled for the first item in the array", function (assert) {
			var oMoveUpButton = _getArrayEditorElements(this.oArrayEditor)[0].getItems()[0].getContentRight()[0];
			assert.strictEqual(oMoveUpButton.getEnabled(), false);
		});

		QUnit.test("moveUp should be enabled for all items except first", function (assert) {
			var aArrayElements = _getArrayEditorElements(this.oArrayEditor);
			var bEnabled = aArrayElements.slice(1).every(function (oArrayElement) {
				return oArrayElement.getItems()[0].getContentRight()[0].getEnabled();
			});
			assert.strictEqual(bEnabled, true);
		});

		QUnit.test("moveDown should be disabled for the last item in the array", function (assert) {
			var oMoveDownButton = _getArrayEditorElements(this.oArrayEditor).slice(-1)[0].getItems()[0].getContentRight()[1];
			assert.strictEqual(oMoveDownButton.getEnabled(), false);
		});

		QUnit.test("moveDown should be enabled for all items except last", function (assert) {
			var aArrayElements = _getArrayEditorElements(this.oArrayEditor);
			var bEnabled = aArrayElements.slice(0, -1).every(function (oArrayElement) {
				return oArrayElement.getItems()[0].getContentRight()[1].getEnabled();
			});
			assert.strictEqual(bEnabled, true);
		});

		QUnit.test("when pressing moveUp", function (assert) {
			var done = assert.async();

			this.oArrayEditor.attachValueChange(function (oEvent) {
				var aValue = oEvent.getParameter("value");
				assert.strictEqual(aValue[0].title, "Deviation", "then Deviation is on the first place in array editor");
				assert.strictEqual(aValue[1].title, "Target", "then Target is on the second place in array editor");
				done();
			});

			var oMoveUpButton = _getArrayEditorElements(this.oArrayEditor)[1].getItems()[0].getContentRight()[0];
			assert.strictEqual(this.oArrayEditor.getValue()[0].title, "Target", "then Target is on the first place in array editor");
			assert.strictEqual(this.oArrayEditor.getValue()[1].title, "Deviation", "then Deviation is on the second place in array editor");
			QUnitUtils.triggerEvent("tap", oMoveUpButton.getDomRef());
		});

		QUnit.test("when pressing moveDown", function (assert) {
			var done = assert.async();

			this.oArrayEditor.attachValueChange(function (oEvent) {
				var aValue = oEvent.getParameter("value");
				assert.strictEqual(aValue[0].title, "Deviation", "then Deviation is on the first place in array editor");
				assert.strictEqual(aValue[1].title, "Target", "then Target is on the second place in array editor");
				done();
			});

			var oMoveUpButton = _getArrayEditorElements(this.oArrayEditor)[0].getItems()[0].getContentRight()[1];
			assert.strictEqual(this.oArrayEditor.getValue()[0].title, "Target", "then Target is on the first place in array editor");
			assert.strictEqual(this.oArrayEditor.getValue()[1].title, "Deviation", "then Deviation is on the second place in array editor");
			QUnitUtils.triggerEvent("tap", oMoveUpButton.getDomRef());
		});

		QUnit.test("when a property in an array item has a visibility binding against another property in the item", function (assert) {
			var fnDone = assert.async();

			var oConfig = {
				"label": "Array Editor",
				"path": "/foo",
				"type": "array",
				"template": {
					"prop1": {
						"label": "Prop1",
						"type": "enum",
						"path": "prop1",
						"enum": [
							"Value1",
							"Value2",
							"Value3"
						]
					},
					"prop2": {
						"label": "Prop2",
						"type": "string",
						"path": "prop2",
						"visible": "{= ${prop1} === 'Value2'}"
					}
				}
			};

			this.oBaseEditor.setJson({
				foo: [
					{
						prop1: "Value1",
						prop2: ""
					},
					{
						prop1: "Value2",
						prop2: ""
					}
				]
			});

			this.oArrayEditor.ready().then(function () {
				var aArrayElements = _getArrayEditorElements(this.oArrayEditor);
				assert.strictEqual(aArrayElements[0].getItems()[1].getConfig()[1].visible, false, "then prop2 is invisible for 1st array item");
				assert.strictEqual(aArrayElements[1].getItems()[1].getConfig()[1].visible, true, "then prop2 is visible for 2nd array item");
				fnDone();
			}.bind(this));

			this.oArrayEditor.setConfig(oConfig);
		});

		QUnit.test("when a property in an array item has a visibility binding against another property in the item (defaultValue usecase)", function (assert) {
			var fnDone = assert.async();

			var oConfig = {
				"label": "Array Editor",
				"path": "/foo",
				"type": "array",
				"template": {
					"prop1": {
						"label": "Prop1",
						"type": "enum",
						"path": "prop1",
						"enum": [
							"Value1",
							"Value2",
							"Value3"
						],
						defaultValue: "Value2"
					},
					"prop2": {
						"label": "Prop2",
						"type": "string",
						"path": "prop2",
						"visible": "{= ${prop1} === 'Value2'}"
					}
				}
			};

			this.oBaseEditor.setJson({
				foo: [
					{
						prop2: ""
					},
					{
						prop1: "Value2",
						prop2: ""
					}
				]
			});

			this.oArrayEditor.ready().then(function () {
				var aArrayElements = _getArrayEditorElements(this.oArrayEditor);
				assert.strictEqual(aArrayElements[0].getItems()[1].getConfig()[1].visible, true, "then prop2 is visible for 1st array item");
				assert.strictEqual(aArrayElements[1].getItems()[1].getConfig()[1].visible, true, "then prop2 is visible for 2nd array item");
				fnDone();
			}.bind(this));

			this.oArrayEditor.setConfig(oConfig);
		});
	});

	QUnit.module("Nested arrays", {
		beforeEach: function (assert) {
			var fnReady = assert.async();
			var mPropertyConfig = {
				label: "Nested Array Level 1",
				path: "/parent/parentItems",
				type: "array",
				itemLabel: "Item",
				template: {
					childItems: {
						label: "Nested Array Level 2",
						type: "array",
						path: "childItems",
						template: {
							childProperty: {
								label: "Number",
								type: "number",
								path: "childProperty"
							}
						}
					}
				}
			};
			var mConfig = {
				properties: {
					sideIndicator: mPropertyConfig
				},
				propertyEditors: {
					array: "sap/ui/integration/designtime/baseEditor/propertyEditor/arrayEditor/ArrayEditor",
					string: "sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor",
					number: "sap/ui/integration/designtime/baseEditor/propertyEditor/numberEditor/NumberEditor"
				}
			};
			var mJson = {
				parent: {
					parentItems: [
						{
							childItems: [
								{ childProperty: 1 },
								{ childProperty: 2 },
								{ childProperty: 3 }
							]
						},
						{
							childItems: [
								{ childProperty: 4 },
								{ childProperty: 5 },
								{ childProperty: 6 }
							]
						}
					]
				}
			};
			this.oBaseEditor = new BaseEditor({
				config: mConfig,
				json: mJson
			});
			this.oBaseEditor.placeAt("qunit-fixture");

			this.oBaseEditor.getPropertyEditorsByName("sideIndicator").then(function (aPropertyEditor) {
				this.oArrayEditor = aPropertyEditor[0].getAggregation("propertyEditor");
				sap.ui.getCore().applyChanges();
				this.oArrayEditorElement = this.oArrayEditor.getContent();
				fnReady();
			}.bind(this));
		},
		afterEach: function () {
			this.oBaseEditor.destroy();
		}
	}, function () {
		QUnit.test("when add button is pressed for parent array", function (assert) {
			var fnDone = assert.async();

			this.oArrayEditor.attachValueChange(function (oEvent) {
				var aValue = oEvent.getParameter("value");
				var mLastChild = aValue.slice().pop();

				assert.ok(Array.isArray(mLastChild.childItems), "then nested array is initialized with an empty array value by default");
				assert.strictEqual(mLastChild.childItems.length, 0, "then nested array doesn't contain any items by default");

				fnDone();
			});
			var oAddButton = this.oArrayEditorElement.getItems()[1];
			QUnitUtils.triggerEvent("tap", oAddButton.getDomRef());
		});
	});

	QUnit.module("Custom configuration", {
		beforeEach: function (assert) {
			var mJson = {
				"testValues": [
					{
						"foo": "bar"
					},
					{
						"foo": "baz"
					}
				]
			};

			this.oBaseEditor = new BaseEditor({
				json: mJson
			});

			this.oBaseEditor.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oBaseEditor.destroy();
		}
	}, function () {
		QUnit.test("When adding/removing items is forbidden", function (assert) {
			this.oBaseEditor.setConfig({
				"properties": {
					"sampleArray": {
						path: "/testValues",
						type: "array",
						template: {
							foo: {
								type: "string",
								path: "foo"
							}
						},
						allowAddAndRemove: false
					}
				},
				"propertyEditors": {
					"array": "sap/ui/integration/designtime/baseEditor/propertyEditor/arrayEditor/ArrayEditor",
					"string": "sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor"
				}
			});

			return this.oBaseEditor.getPropertyEditorsByName("sampleArray").then(function (aPropertyEditor) {
				var oArrayEditor = aPropertyEditor[0];
				assert.notOk(
					oArrayEditor.getContent().getItems()[1].getVisible(),
					"Then the add button is disabled"
				);
				assert.notOk(
					_getArrayEditorElements(oArrayEditor)[0].getItems()[0].getContentRight()[2].getVisible(),
					"Then the remove buttons are disabled"
				);
			}, this);
		});

		QUnit.test("When changing the order of items is forbidden", function (assert) {
			this.oBaseEditor.setConfig({
				"properties": {
					"sampleArray": {
						path: "/testValues",
						type: "array",
						template: {
							foo: {
								type: "string",
								path: "foo"
							}
						},
						allowSorting: false
					}
				},
				"propertyEditors": {
					"array": "sap/ui/integration/designtime/baseEditor/propertyEditor/arrayEditor/ArrayEditor",
					"string": "sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor"
				}
			});

			return this.oBaseEditor.getPropertyEditorsByName("sampleArray").then(function (aPropertyEditor) {
				var oArrayEditor = aPropertyEditor[0];
				assert.notOk(
					_getArrayEditorElements(oArrayEditor)[0].getItems()[0].getContentRight()[0].getVisible(),
					"Then the move up buttons are disabled"
				);
				assert.notOk(
					_getArrayEditorElements(oArrayEditor)[0].getItems()[0].getContentRight()[1].getVisible(),
					"Then the move down buttons are disabled"
				);
			}, this);
		});
	});

	QUnit.module("Integration with BaseEditor", {
		beforeEach: function (assert) {
			var fnDone = assert.async();

			var mConfig = {
				"properties": {
					"cars": {
						label: "Cars",
						path: "/cars",
						type: "array",
						itemLabel: "Item",
						template: {
							vendor: {
								label: "Vendor",
								type: "string",
								path: "vendor"
							},
							year: {
								label: "Year produced",
								type: "number",
								path: "year"
							},
							owners: {
								label: "Owners",
								type: "array",
								path: "owners",
								itemLabel: "Owner",
								template: {
									name: {
										label: "Name",
										type: "string",
										path: "name"
									},
									phone: {
										label: "Phone",
										type: "number",
										path: "phone"
									}
								}
							}
						},
						maxItems: 2
					}
				},
				"propertyEditors": {
					"array": "sap/ui/integration/designtime/baseEditor/propertyEditor/arrayEditor/ArrayEditor",
					"string": "sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor",
					"number": "sap/ui/integration/designtime/baseEditor/propertyEditor/numberEditor/NumberEditor"
				}
			};

			var mJson = {
				cars: [
					{
						"vendor": "VW",
						"year": 2019,
						"owners": [
							{
								"name": "Peter",
								"phone": "7570000001"
							},
							{
								"name": "Sylvia",
								"phone": "7570000002"
							}
						]
					},
					{
						"vendor": "Audi",
						"year": 1999,
						"owners": [
							{
								"name": "Sebastian",
								"phone": "7570000003"
							}
						]
					}
				]
			};

			this.oBaseEditor = new BaseEditor({
				config: mConfig,
				json: mJson
			});

			this.oBaseEditor.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			this.oBaseEditor.attachEventOnce("propertyEditorsReady", function (oEvent) {
				this.oArrayEditor = oEvent.getSource().getPropertyEditorsByNameSync("cars")[0].getAggregation("propertyEditor");
				assert.strictEqual(this.oArrayEditor.isReady(), true, "Ready is triggered for empty arrays and nested arrays");
				fnDone();
			}, this);
		},
		afterEach: function () {
			this.oBaseEditor.destroy();
		}
	}, function () {
		QUnit.test("when amount of elements reaches maxItems, then the `add` button should be disabled", function (assert) {
			var oAddButton = this.oArrayEditor.getContent().getItems()[1];
			assert.strictEqual(this.oArrayEditor.getValue().length, this.oArrayEditor.getConfig().maxItems);
			assert.notOk(oAddButton.getEnabled(), "then add button is disabled");
		});

		QUnit.test("when removing one item, then the add button should be enabled", function (assert) {
			var oAddButton = this.oArrayEditor.getContent().getItems()[1];
			assert.strictEqual(this.oArrayEditor.getValue().length, this.oArrayEditor.getConfig().maxItems);

			QUnitUtils.triggerEvent("tap", _getArrayEditorElements(this.oArrayEditor)[0].getItems()[0].getContentRight()[2].getDomRef());

			assert.ok(this.oArrayEditor.getValue().length < this.oArrayEditor.getConfig().maxItems);
			assert.ok(oAddButton.getEnabled(), "then add button is enabled");
		});

		QUnit.test("when data is set via setJson api on BaseEditor", function (assert) {
			var fnDone = assert.async();

			this.oBaseEditor.attachEventOnce("propertyEditorsReady", function () {
				var oArrayEditor = this.oBaseEditor.getPropertyEditorsByNameSync("cars")[0].getAggregation("propertyEditor");
				var oAddButton = oArrayEditor.getContent().getItems()[1];
				assert.ok(oArrayEditor.getValue().length < oArrayEditor.getConfig().maxItems);
				assert.ok(oAddButton.getEnabled(), "then add button is enabled");

				this.oBaseEditor.attachEventOnce("propertyEditorsReady", function () {
					var oArrayEditor = this.oBaseEditor.getPropertyEditorsByNameSync("cars")[0].getAggregation("propertyEditor");
					var oAddButton = oArrayEditor.getContent().getItems()[1];

					assert.strictEqual(this.oArrayEditor.getValue().length, this.oArrayEditor.getConfig().maxItems);
					assert.notOk(oAddButton.getEnabled(), "then add button is disabled");

					fnDone();
				}, this);

				this.oBaseEditor.setJson({
					cars: [
						{
							"vendor": "VW",
							"year": 2019,
							"owners": []
						},
						{
							"vendor": "Audi",
							"year": 1999,
							"owners": []
						}
					]
				});
			}, this);

			this.oBaseEditor.setJson({
				cars: [
					{
						"vendor": "VW",
						"year": 2019,
						"owners": []
					}
				]
			});
		});

		QUnit.test("When BaseEditor fires ready", function (assert) {
			var fnDone = assert.async();

			this.oBaseEditor.attachEventOnce("propertyEditorsReady", function () {
				var oArrayEditor = this.oBaseEditor.getPropertyEditorsByNameSync("cars")[0].getAggregation("propertyEditor");
				var aWrappers = oArrayEditor._aEditorWrappers;

				assert.strictEqual(aWrappers.length, 2, "Then both wrappers are registered on the array editor");
				// Validate the ready state
				aWrappers.forEach(function (oWrapper, idx) {
					assert.strictEqual(oWrapper._fnCancelInit, undefined, "Then each wrapper has finished initialization - Wrapper" + idx);
					assert.strictEqual(
						oWrapper.getAggregation("propertyEditors").filter(function (oNestedEditor) {
							return oNestedEditor.isReady();
						}).length,
						3,
						"Then all nested editors are ready - Wrapper" + idx
					);
				});
				fnDone();
			}, this);

			this.oBaseEditor.setJson({
				cars: [
					{
						"vendor": "VW",
						"year": 2019,
						"owners": []
					},
					{
						"vendor": "Audi",
						"year": 1999,
						"owners": []
					}
				]
			});
		});

		QUnit.test("when editing item in the nested array, then no re-rendering should take place", function (assert) {
			var oVWCarEditor = _getArrayEditorElements(this.oArrayEditor)[0];
			var oOwnersEditor = oVWCarEditor.getItems()[1].getAggregation("propertyEditors")[2].getAggregation("propertyEditor");
			var aOwnersItems = _getArrayEditorElements(oOwnersEditor);
			var oOwnerNameEditor = aOwnersItems[0].getItems()[1].getAggregation("propertyEditors")[0].getAggregation("propertyEditor");
			var oOwnerInput = oOwnerNameEditor.getContent();

			oOwnerInput.focus();
			assert.strictEqual(document.activeElement, oOwnerInput.$("inner").get(0));
			oOwnerInput.setValue("Kevin");
			QUnitUtils.triggerEvent("input", oOwnerInput.getDomRef());

			assert.strictEqual(
				ObjectPath.get(["cars", "0", "owners", "0", "name"], this.oBaseEditor.getJson()),
				"Kevin"
			);

			assert.strictEqual(document.activeElement, oOwnerInput.$("inner").get(0));
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});