/* global QUnit */

sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/BaseEditor",
	"sap/ui/qunit/QUnitUtils",
	"sap/base/util/ObjectPath",
	"sap/base/util/restricted/_merge",
	"qunit/designtime/EditorQunitUtils"
], function (
	BaseEditor,
	QUnitUtils,
	ObjectPath,
	_merge,
	EditorQunitUtils
) {
	"use strict";
	var isIE = false;
	if (navigator.userAgent.toLowerCase().indexOf("trident") > 0) {
		isIE = true;
	}
	function _getArrayEditorElements(oEditor) {
		var oArrayEditorContent = oEditor.getContent().getItems();
		return oEditor.getConfig().collapsibleItems === false
			? { // ArrayEditorPlain
				items: oArrayEditorContent[0].getItems().map(function (oArrayEditorItem) {
					return {
						item: oArrayEditorItem,
						label: oArrayEditorItem.getItems()[0].getContentLeft()[0],
						moveUpButton: oArrayEditorItem.getItems()[0].getContentRight()[0],
						moveDownButton: oArrayEditorItem.getItems()[0].getContentRight()[1],
						deleteButton: oArrayEditorItem.getItems()[0].getContentRight()[2],
						editors: oArrayEditorItem.getItems()[1]._getPropertyEditors()
					};
				}),
				addButton: oArrayEditorContent[1]
			}
			: { // ArrayEditor with collapsible items
				items: oArrayEditorContent[0].getItems().map(function (oArrayEditorItem) {
					var aToolbarItems = oArrayEditorItem.getHeaderToolbar().getContent();
					return {
						item: oArrayEditorItem,
						label: aToolbarItems[0],
						moveUpButton: aToolbarItems[2],
						moveDownButton: aToolbarItems[3],
						deleteButton: aToolbarItems[4],
						editors: oArrayEditorItem.getContent()[0]._getPropertyEditors()
					};
				}),
				addButton: oArrayEditorContent[1]
			};
	}

	function createBaseEditorConfig(mConfigOptions) {
		var mPropertyConfig = Object.assign(
			{
				path: "/content",
				type: "array",
				template: {
					foo: {
						type: "string",
						path: "foo"
					}
				}
			},
			mConfigOptions
		);

		return {
			context: "/",
			properties: {
				sampleArray: mPropertyConfig
			},
			propertyEditors: {
				"array": "sap/ui/integration/designtime/baseEditor/propertyEditor/arrayEditor/ArrayEditor",
				"string": "sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor"
			}
		};
	}

	var fnBaseTests = function () {
		QUnit.test("When an ArrayEditor is created", function (assert) {
			assert.ok(this.oArrayEditor.getDomRef() instanceof HTMLElement, "Then it is rendered correctly (1/3)");
			assert.ok(this.oArrayEditor.getDomRef() && this.oArrayEditor.getDomRef().offsetHeight > 0, "Then it is rendered correctly (2/3)");
			assert.ok(this.oArrayEditor.getDomRef() && this.oArrayEditor.getDomRef().offsetWidth > 0, "Then it is rendered correctly (3/3)");
		});

		QUnit.test("When a model is set", function (assert) {
			var aPropertyEditors = _getArrayEditorElements(this.oArrayEditor).items[0].editors;
			assert.strictEqual(aPropertyEditors.length, 3, "Then three editors are created for the first array item");
			assert.strictEqual(aPropertyEditors[0].getConfig().type, "string", "and the first property editor is for string");
			assert.strictEqual(aPropertyEditors[1].getConfig().type, "number", "and the second property editor is for number");
			assert.strictEqual(aPropertyEditors[2].getConfig().type, "string", "and the third property editor is for string");
		});

		QUnit.test("When the first delete button is pressed in the editor", function (assert) {
			var done = assert.async();

			this.oArrayEditor.attachEventOnce("valueChange", function (oEvent) {
				assert.strictEqual(oEvent.getParameter("value").length, 1, "Then there is only one side indicator");
				assert.equal(oEvent.getParameter("value")[0].title, "Deviation", "Then it is updated correctly");
				done();
			});
			var oDelButton0 = _getArrayEditorElements(this.oArrayEditor).items[0].deleteButton;
			QUnitUtils.triggerEvent("tap", oDelButton0.getDomRef());
		});

		QUnit.test("When the second delete button is pressed in the editor", function (assert) {
			var done = assert.async();

			this.oArrayEditor.attachValueChange(function (oEvent) {
				assert.strictEqual(oEvent.getParameter("value").length, 1, "Then there is only one side indicator");
				assert.strictEqual(oEvent.getParameter("value")[0].title, "Target", "Then it is updated correctly");
				done();
			});
			var oButton1 = _getArrayEditorElements(this.oArrayEditor).items[1].deleteButton;
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
			var oAddButton = _getArrayEditorElements(this.oArrayEditor).addButton;
			QUnitUtils.triggerEvent("tap", oAddButton.getDomRef());
		});

		QUnit.test("When the add button is pressed in the editor", function (assert) {
			var done = assert.async();

			this.oArrayEditor.attachValueChange(function (oEvent) {
				assert.strictEqual(oEvent.getParameter("value").length, 3, "Then there are three side indicators");
				assert.deepEqual(oEvent.getParameter("value")[2], {}, "Then the new item is created with proper default values");
				done();
			});
			var oAddButton = _getArrayEditorElements(this.oArrayEditor).addButton;
			QUnitUtils.triggerEvent("tap", oAddButton.getDomRef());
		});

		QUnit.test("Ready handling - When the editor items change", function (assert) {
			var done = assert.async();
			var oAddButton = _getArrayEditorElements(this.oArrayEditor).addButton;
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
				QUnitUtils.triggerEvent("tap", _getArrayEditorElements(this.oArrayEditor).items[1].deleteButton);

			}.bind(this));

			// A new item is added
			QUnitUtils.triggerEvent("tap", _getArrayEditorElements(this.oArrayEditor).addButton.getDomRef());
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
				var oAddButton = _getArrayEditorElements(this.oArrayEditor).addButton;
				assert.strictEqual(oAddButton.getEnabled(), true, "Then the button to add an item is enabled");
				QUnitUtils.triggerEvent("tap", oAddButton.getDomRef());
			}.bind(this));
		});

		QUnit.test("moveUp should be disabled for the first item in the array", function (assert) {
			var oMoveUpButton = _getArrayEditorElements(this.oArrayEditor).items[0].moveUpButton;
			assert.strictEqual(oMoveUpButton.getEnabled(), false);
		});

		QUnit.test("moveUp should be enabled for all items except first", function (assert) {
			var aArrayElements = _getArrayEditorElements(this.oArrayEditor).items;
			var bEnabled = aArrayElements.slice(1).every(function (oArrayElement) {
				return oArrayElement.moveUpButton.getEnabled();
			});
			assert.strictEqual(bEnabled, true);
		});

		QUnit.test("moveDown should be disabled for the last item in the array", function (assert) {
			var oMoveDownButton = _getArrayEditorElements(this.oArrayEditor).items.slice(-1)[0].moveDownButton;
			assert.strictEqual(oMoveDownButton.getEnabled(), false);
		});

		QUnit.test("moveDown should be enabled for all items except last", function (assert) {
			var aArrayElements = _getArrayEditorElements(this.oArrayEditor).items;
			var bEnabled = aArrayElements.slice(0, -1).every(function (oArrayElement) {
				return oArrayElement.moveDownButton.getEnabled();
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

			var oMoveUpButton = _getArrayEditorElements(this.oArrayEditor).items[1].moveUpButton;
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

			var oMoveDownButton = _getArrayEditorElements(this.oArrayEditor).items[0].moveDownButton;
			assert.strictEqual(this.oArrayEditor.getValue()[0].title, "Target", "then Target is on the first place in array editor");
			assert.strictEqual(this.oArrayEditor.getValue()[1].title, "Deviation", "then Deviation is on the second place in array editor");
			QUnitUtils.triggerEvent("tap", oMoveDownButton.getDomRef());
		});

		if (!isIE) {
			QUnit.test("when a property in an array item has a visibility binding against another property in the item", function (assert) {
				var fnDone = assert.async();

				var oConfig = {
					"label": "Array Editor",
					"path": "/foo",
					"type": "array",
					"template": {
						"prop1": {
							"label": "Prop1",
							"type": "select",
							"path": "prop1",
							"items": [
								{ "key": "Value1" },
								{ "key": "Value2" },
								{ "key": "Value3" }
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

				this.oArrayEditor.setConfig(oConfig);
				this.oArrayEditor.ready().then(function () {
					var aArrayElements = _getArrayEditorElements(this.oArrayEditor).items;
					assert.strictEqual(aArrayElements[0].editors[1].getConfig().visible, false, "then prop2 is invisible for 1st array item");
					assert.strictEqual(aArrayElements[1].editors[1].getConfig().visible, true, "then prop2 is visible for 2nd array item");
					fnDone();
				}.bind(this));
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
							"type": "select",
							"path": "prop1",
							"items": [
								{ "key": "Value1" },
								{ "key": "Value2" },
								{ "key": "Value3" }
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

				this.oArrayEditor.setConfig(oConfig);
				this.oArrayEditor.ready().then(function () {
					var aArrayElements = _getArrayEditorElements(this.oArrayEditor).items;
					assert.strictEqual(aArrayElements[0].editors[1].getConfig().visible, true, "then prop2 is visible for 1st array item");
					assert.strictEqual(aArrayElements[1].editors[1].getConfig().visible, true, "then prop2 is visible for 2nd array item");
					fnDone();
				}.bind(this));
			});
		}
	};

	QUnit.module("Collapsible Array Editor: Given an editor config", {
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
					"select": "sap/ui/integration/designtime/baseEditor/propertyEditor/selectEditor/SelectEditor"
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
				fnReady();
			}.bind(this));
		},
		afterEach: function () {
			this.oBaseEditor.destroy();
		}
	}, function (assert) {
		fnBaseTests(assert);

		QUnit.test("Auto Expand - When a prefilled item is added", function (assert) {
			var aEditorItems = _getArrayEditorElements(this.oArrayEditor).items;
			var iLastItemIndex = aEditorItems.length - 1;
			assert.strictEqual(
				aEditorItems[iLastItemIndex].item.getExpanded(),
				false,
				"Then the item is initially collapsed"
			);
		});

		QUnit.test("Auto Expand - When an empty item is added", function (assert) {
			var oEditorElements = _getArrayEditorElements(this.oArrayEditor);
			var iLastItemIndex = oEditorElements.items.length - 1;
			QUnitUtils.triggerEvent("tap", oEditorElements.addButton.getDomRef());

			return this.oArrayEditor.ready().then(function () {
				var aEditorItems = _getArrayEditorElements(this.oArrayEditor).items;
				assert.strictEqual(
					aEditorItems[(iLastItemIndex + 1)].item.getExpanded(),
					true,
					"Then the newly added item is expanded"
				);
			}.bind(this));
		});

		QUnit.test("Auto Expand - When an empty item is manually collapsed", function (assert) {
			var oEditorElements = _getArrayEditorElements(this.oArrayEditor);
			var iLastItemIndex = oEditorElements.items.length - 1;
			QUnitUtils.triggerEvent("tap", oEditorElements.addButton.getDomRef());

			return this.oArrayEditor.ready().then(function () {
				var oEditorElements = _getArrayEditorElements(this.oArrayEditor);
				oEditorElements.items[iLastItemIndex + 1].item.setExpanded(false);

				// Trigger config change by removing a different element
				QUnitUtils.triggerEvent("tap", oEditorElements.items[iLastItemIndex].deleteButton.getDomRef());

				return this.oArrayEditor.ready().then(function () {
					assert.strictEqual(
						_getArrayEditorElements(this.oArrayEditor).items[iLastItemIndex].item.getExpanded(),
						false,
						"Then the item stays collapsed"
					);
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.module("Plain Array Editor: Given an editor config", {
		beforeEach: function (assert) {
			var fnReady = assert.async();
			var mPropertyConfig = {
				tags: ["header", "numericHeader"],
				label: "SIDE_INDICATORS",
				path: "/header/sideIndicators",
				type: "array",
				collapsibleItems: false,
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
					"select": "sap/ui/integration/designtime/baseEditor/propertyEditor/selectEditor/SelectEditor"
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
				fnReady();
			}.bind(this));
		},
		afterEach: function () {
			this.oBaseEditor.destroy();
		}
	}, fnBaseTests);

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
			var oAddButton = _getArrayEditorElements(this.oArrayEditor).addButton;
			QUnitUtils.triggerEvent("tap", oAddButton.getDomRef());
		});
	});

	QUnit.module("Custom configuration", {
		beforeEach: function (assert) {
			var mJson = {
				"content": [
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
			var mConfig = createBaseEditorConfig({
				allowAddAndRemove: false
			});
			this.oBaseEditor.setConfig(mConfig);

			return this.oBaseEditor.getPropertyEditorsByName("sampleArray").then(function (aPropertyEditors) {
				var oArrayEditor = aPropertyEditors[0];
				assert.notOk(
					_getArrayEditorElements(oArrayEditor).addButton.getVisible(),
					"Then the add button is disabled"
				);
				assert.notOk(
					_getArrayEditorElements(oArrayEditor).items[0].deleteButton.getVisible(),
					"Then the remove buttons are disabled"
				);
			}, this);
		});

		QUnit.test("When changing the order of items is forbidden", function (assert) {
			var mConfig = createBaseEditorConfig({
				allowSorting: false
			});
			this.oBaseEditor.setConfig(mConfig);

			return this.oBaseEditor.getPropertyEditorsByName("sampleArray").then(function (aPropertyEditor) {
				var oArrayEditor = aPropertyEditor[0];
				assert.notOk(
					_getArrayEditorElements(oArrayEditor).items[0].moveUpButton.getVisible(),
					"Then the move up buttons are disabled"
				);
				assert.notOk(
					_getArrayEditorElements(oArrayEditor).items[0].moveDownButton.getVisible(),
					"Then the move down buttons are disabled"
				);
			}, this);
		});

		QUnit.test("When item labels are disabled in the plain editor", function (assert) {
			var mConfig = createBaseEditorConfig({
				showItemLabel: false,
				collapsibleItems: false
			});
			this.oBaseEditor.setConfig(mConfig);

			return this.oBaseEditor.getPropertyEditorsByName("sampleArray").then(function (aPropertyEditor) {
				var oArrayEditor = aPropertyEditor[0];
				assert.notOk(
					_getArrayEditorElements(oArrayEditor).items[0].label.getVisible(),
					"Then the labels are hidden"
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
				fnDone();
			}, this);
		},
		afterEach: function () {
			this.oBaseEditor.destroy();
		}
	}, function () {
		QUnit.test("when the editor is created", function (assert) {
			assert.strictEqual(this.oArrayEditor.isReady(), true, "then ready is triggered for empty arrays and nested arrays");
		});

		QUnit.test("when amount of elements reaches maxItems, then the `add` button should be disabled", function (assert) {
			var oAddButton = _getArrayEditorElements(this.oArrayEditor).addButton;
			assert.strictEqual(this.oArrayEditor.getValue().length, this.oArrayEditor.getConfig().maxItems);
			assert.notOk(oAddButton.getEnabled(), "then add button is disabled");
		});

		QUnit.test("when removing one item, then the add button should be enabled", function (assert) {
			var oAddButton =  _getArrayEditorElements(this.oArrayEditor).addButton;
			assert.strictEqual(this.oArrayEditor.getValue().length, this.oArrayEditor.getConfig().maxItems);

			var oRemoveButton = _getArrayEditorElements(this.oArrayEditor).items[0].deleteButton;
			QUnitUtils.triggerEvent("tap", oRemoveButton.getDomRef());

			assert.ok(this.oArrayEditor.getValue().length < this.oArrayEditor.getConfig().maxItems);
			assert.ok(oAddButton.getEnabled(), "then add button is enabled");
		});

		QUnit.test("when data is set via setJson api on BaseEditor", function (assert) {
			this.oBaseEditor.setJson({
				cars: [
					{
						"vendor": "VW",
						"year": 2019,
						"owners": []
					}
				]
			});

			return this.oBaseEditor.ready().then(function () {
				var oArrayEditor = this.oBaseEditor.getPropertyEditorsByNameSync("cars")[0].getAggregation("propertyEditor");
				var oAddButton = _getArrayEditorElements(oArrayEditor).addButton;
				assert.ok(oArrayEditor.getValue().length < oArrayEditor.getConfig().maxItems);
				assert.ok(oAddButton.getEnabled(), "then add button is enabled");

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

				return this.oBaseEditor.ready().then(function () {
					var oArrayEditor = this.oBaseEditor.getPropertyEditorsByNameSync("cars")[0].getAggregation("propertyEditor");
					var oAddButton = _getArrayEditorElements(oArrayEditor).addButton;

					assert.strictEqual(this.oArrayEditor.getValue().length, this.oArrayEditor.getConfig().maxItems);
					assert.notOk(oAddButton.getEnabled(), "then add button is disabled");
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("When BaseEditor fires ready", function (assert) {
			var oJson = {
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
					},
					{
						"vendor": "BMW",
						"year": 2020,
						"owners": []
					}
				]
			};
			this.oBaseEditor.setJson(oJson);

			return this.oBaseEditor.ready().then(function () {
				var oArrayEditor = this.oBaseEditor.getPropertyEditorsByNameSync("cars")[0].getAggregation("propertyEditor");
				var aWrappers = oArrayEditor._aEditorWrappers;

				assert.strictEqual(aWrappers.length, oJson.cars.length, "Then all wrappers are registered on the array editor");
				// Validate the ready state
				aWrappers.forEach(function (oWrapper, idx) {
					assert.strictEqual(oWrapper._fnCancelInit, undefined, "Then each wrapper has finished initialization - Wrapper" + idx);
					assert.strictEqual(
						oWrapper._getPropertyEditors().filter(function (oNestedEditor) {
							return oNestedEditor.isReady();
						}).length,
						3,
						"Then all nested editors are ready - Wrapper" + idx
					);
				});
			}.bind(this));
		});

		QUnit.test("when editing item in the nested array, then no re-rendering should take place", function (assert) {
			var fnDone = assert.async();
			var oEditorElements = _getArrayEditorElements(this.oArrayEditor);
			// Get the array editor for owners of item "VW"
			var oVWOwnersEditor = oEditorElements.items[0].editors[2].getAggregation("propertyEditor");
			var oVWOwnersEditorElements = _getArrayEditorElements(oVWOwnersEditor);
			// Get the editor for the name of the first VW owner
			var oOwnerNameEditor = oVWOwnersEditorElements.items[0].editors[0].getAggregation("propertyEditor");

			oVWOwnersEditorElements.items[0].item.attachEventOnce("expand", function () {
				var oOwnerInput = oOwnerNameEditor.getContent();

				oOwnerInput.$("inner").focus();
				assert.strictEqual(document.activeElement, oOwnerInput.$("inner").get(0));

				EditorQunitUtils.setInputValue(oOwnerInput, "Kevin");

				assert.strictEqual(
					ObjectPath.get(["cars", "0", "owners", "0", "name"], this.oBaseEditor.getJson()),
					"Kevin"
				);

				setTimeout(function () {
					assert.strictEqual(document.activeElement, oOwnerInput.$("inner").get(0));
					fnDone();
				});
			}.bind(this));
			oEditorElements.items[0].item.setExpanded(true);
			oVWOwnersEditorElements.items[0].item.setExpanded(true);
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});