/* global QUnit */

sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/propertyEditor/arrayEditor/ArrayEditor",
	"sap/ui/model/json/JSONModel",
	"sap/ui/qunit/QUnitUtils",
	"sap/base/util/ObjectPath"
], function (
	ArrayEditor,
	JSONModel,
	QUnitUtils,
	ObjectPath
) {
	"use strict";

	function _getArrayEditorElement(oEditor, iIndex) {
		return oEditor.getContent().getItems()[0].getItems()[iIndex];
	}

	QUnit.module("Array Editor: Given an editor config", {
		beforeEach: function (assert) {
			this.oPropertyConfig = {
				tags: ["header", "numericHeader"],
				label: "SIDE_INDICATORS",
				path: "header/sideIndicators",
				type: "array",
				itemLabel: "SIDE_INDICATOR",
				template: {
					title : {
						label: "SIDE_INDICATOR.TITLE",
						type: "string",
						path: "title",
						defaultValue: "Side Indicator"
					},
					number : {
						label: "SIDE_INDICATOR.NUMBER",
						type: "number",
						path: "number"
					},
					unit : {
						label: "SIDE_INDICATOR.UNIT",
						type: "string",
						path: "unit"
					}
				},
				maxItems: 3,
				visible: "{= ${context>header/type} === 'Numeric' }"
			};

			this.oContextModel = new JSONModel({
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
			});
			this.oContextModel.setDefaultBindingMode("OneWay");

			this.oEditor = new ArrayEditor();
			this.oEditor.setModel(this.oContextModel, "_context");
			this.oEditor.setConfig(this.oPropertyConfig);
			this.oEditor.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			var fnReady = assert.async();
			this.oEditor.attachReady(function () {
				this.oEditorElement = this.oEditor.getContent();
				fnReady();
			}, this);
		},
		afterEach: function () {
			this.oContextModel.destroy();
			this.oEditor.destroy();
		}
	}, function () {
		QUnit.test("When an ArrayEditor is created", function (assert) {
			assert.ok(this.oEditor.getDomRef() instanceof HTMLElement, "Then it is rendered correctly (1/3)");
			assert.ok(this.oEditor.getDomRef() && this.oEditor.getDomRef().offsetHeight > 0, "Then it is rendered correctly (2/3)");
			assert.ok(this.oEditor.getDomRef() && this.oEditor.getDomRef().offsetWidth > 0, "Then it is rendered correctly (3/3)");
		});

		QUnit.test("When a model is set", function (assert) {
			var oPropertyEditors = _getArrayEditorElement(this.oEditor, 0).getItems()[1];
			assert.strictEqual(oPropertyEditors.getConfig().length, 3, "Then the property editors get three configurations");
			assert.strictEqual(oPropertyEditors.getConfig()[0].type, "string", "and the first property editor is for string");
			assert.strictEqual(oPropertyEditors.getConfig()[1].type, "number", "and the second property editor is for number");
			assert.strictEqual(oPropertyEditors.getConfig()[2].type, "string", "and the third property editor is for string");
		});

		QUnit.test("When a property is changed in the model", function (assert) {
			this.oPropertyConfig.template.title.type = "enum";
			this.oPropertyConfig.template.title.enum = ["Title1", "Title2"];
			this.oEditor.setConfig(this.oPropertyConfig);
			var oPropertyEditors = _getArrayEditorElement(this.oEditor, 0).getItems()[1];
			assert.strictEqual(oPropertyEditors.getConfig().length, 3, "Then the property editors get three configurations");
			assert.strictEqual(oPropertyEditors.getConfig()[0].type, "enum", "and the first property editor is changed to enum");
			assert.strictEqual(oPropertyEditors.getConfig()[1].type, "number", "and the second property editor is still for number");
			assert.strictEqual(oPropertyEditors.getConfig()[2].type, "string", "and the third property editor is still for string");
		});

		QUnit.test("When the first delete button is pressed in the editor", function (assert) {
			var done = assert.async();

			this.oEditor.attachPropertyChange(function (oEvent) {
				assert.strictEqual(oEvent.getParameter("value").length, 1, "Then there is only one side indicator");
				assert.equal(oEvent.getParameter("value")[0].title, "Deviation", "Then it is updated correctly");
				done();
			});
			var oDelButton0 = _getArrayEditorElement(this.oEditor, 0).getItems()[0].getContentRight()[0];
			QUnitUtils.triggerEvent("tap", oDelButton0.getDomRef());
		});

		QUnit.test("When the second delete button is pressed in the editor", function (assert) {
			var done = assert.async();

			this.oEditor.attachPropertyChange(function (oEvent) {
				assert.strictEqual(oEvent.getParameter("value").length, 1, "Then there is only one side indicator");
				assert.strictEqual(oEvent.getParameter("value")[0].title, "Target", "Then it is updated correctly");
				done();
			});
			var oButton1 = _getArrayEditorElement(this.oEditor, 1).getItems()[0].getContentRight()[0];
			QUnitUtils.triggerEvent("tap", oButton1.getDomRef());
		});

		QUnit.test("When the default values are undefined or complex", function (assert) {
			var done = assert.async();
			var oConfig = {
				tags: ["header", "numericHeader"],
				label: "SIDE_INDICATORS",
				path: "header/sideIndicators",
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
				visible: "{= ${context>header/type} === 'Numeric' }"
			};
			this.oEditor.setConfig(oConfig);

			this.oEditor.attachPropertyChange(function (oEvent) {
				assert.deepEqual(
					oEvent.getParameter("value")[2],
					{
						number: {
							unit: undefined,
							val: 1
						},
						title: undefined
					},
					"Then new items have the proper values"
				);
				assert.ok(oEvent.getParameter("value")[2].number !== oConfig.template.number.defaultValue, "Then the default value is cloned");
				done();
			});
			var oAddButton = this.oEditorElement.getItems()[1];
			QUnitUtils.triggerEvent("tap", oAddButton.getDomRef());
		});

		QUnit.test("When the add button is pressed in the editor", function (assert) {
			var done = assert.async();

			this.oEditor.attachPropertyChange(function (oEvent) {
				assert.strictEqual(oEvent.getParameter("value").length, 3, "Then there are three side indicators");
				assert.deepEqual(oEvent.getParameter("value")[2], {title: "Side Indicator"}, "Then the new item is created with proper default values");
				done();
			});
			var oAddButton = this.oEditorElement.getItems()[1];
			QUnitUtils.triggerEvent("tap", oAddButton.getDomRef());
		});

		QUnit.test("When a new item is added to and an existing item is removed from an array", function (assert) {
			var done = assert.async();

			this.oEditor.attachEventOnce("propertyChange", function (oEvent) {
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
						title: "Side Indicator"
					}],
					"Then the new item is added to the array"
				);

				var sPath = oEvent.getParameter("path");
				var aParts = sPath.split("/");

				var oContext = this.oContextModel.getData();
				ObjectPath.set(aParts, oEvent.getParameter("value"), oContext);
				this.oContextModel.checkUpdate();

				this.oEditor.attachPropertyChange(function (oEvent) {
					assert.deepEqual(
						oEvent.getParameter("value"),
						[{
							title: "Target",
							number: 250,
							unit: "K"
						},{
							title: "Side Indicator"
						}],
						"Then the remaining items still have the correct value"
					);
					assert.ok(oEvent.getParameter("value") !== aEditorValueAfterAdding, "Then the editor value is not mutated");
					done();
				});

				// The old item is deleted
				QUnitUtils.triggerEvent("tap", _getArrayEditorElement(this.oEditor, 1).getItems()[0].getContentRight()[0].getDomRef());
			}.bind(this));

			// A new item is added
			QUnitUtils.triggerEvent("tap", this.oEditorElement.getItems()[1].getDomRef());
		});

		QUnit.test("When a nested array editor is created", function (assert) {
			this.oEditor.destroy();
			var done = assert.async();

			this.oPropertyConfig = {
				label: "Nested Array Level 1",
				path: "parent/parentitems",
				type: "array",
				itemLabel: "Item",
				template: {
					parentitems: {
						label: "Nested Array Level 2",
						type: "array",
						path: "childitems",
						template: {
							childproperty: {
								label: "Number",
								type: "number",
								path: "childproperty"
							}
						}
					}
				}
			};
			this.oContextModel = new JSONModel({
				parent: {
					parentitems: [
						{
							childitems: [
								{childproperty: 1},
								{childproperty: 2},
								{childproperty: 3}
							]
						},
						{
							childitems: [
								{childproperty: 4},
								{childproperty: 5},
								{childproperty: 6}
							]
						}
					]
				}
			});
			this.oContextModel.setDefaultBindingMode("OneWay");
			this.oEditor = new ArrayEditor();
			this.oEditor.setModel(this.oContextModel, "_context");
			this.oEditor.setConfig(this.oPropertyConfig);

			this.oEditor.attachReady(function () {
				assert.strictEqual(
					this.oEditor.getModel("_context").getProperty("/parent/parentitems/0/childitems/0/childproperty"),
					1,
					"Then the item binding paths are correct"
				);
				done();
			}, this);
		});
	});
});