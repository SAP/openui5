/* global QUnit */

sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/propertyEditor/arrayEditor/ArrayEditor",
	"sap/ui/integration/designtime/baseEditor/PropertyEditors",
	"sap/ui/model/json/JSONModel",
	"sap/ui/base/ManagedObjectObserver",
	"sap/ui/qunit/QUnitUtils"
], function (
	ArrayEditor,
	PropertyEditors,
	JSONModel,
	ManagedObjectObserver,
	QUnitUtils
) {
	"use strict";

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
						path: "header/sideIndicators/:index/title"
					},
					number : {
						label: "SIDE_INDICATOR.NUMBER",
						type: "number",
						path: "header/sideIndicators/:index/number"
					},
					unit : {
						label: "SIDE_INDICATOR.UNIT",
						type: "string",
						path: "header/sideIndicators/:index/unit"
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

			var done = assert.async();
			this.oEditor.attachReady(function() {
				assert.ok(true, "the Array Editor is ready");
				done();
			});
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
			var oPropertyEditors = this.oEditor.getContent()[0].getItems()[0].getItems()[0].getItems()[1];
			assert.strictEqual(oPropertyEditors.getConfig().length, 3, "Then the property editors get three configurations");
			assert.strictEqual(oPropertyEditors.getConfig()[0].type, "string", "and the first property editor is for string");
			assert.strictEqual(oPropertyEditors.getConfig()[1].type, "number", "and the second property editor is for number");
			assert.strictEqual(oPropertyEditors.getConfig()[2].type, "string", "and the third property editor is for string");
		});

		QUnit.test("When a property is changed in the model", function (assert) {
			this.oPropertyConfig.template.title.type = "enum";
			this.oPropertyConfig.template.title.enum = ["Title1", "Title2"];
			this.oEditor.setConfig(this.oPropertyConfig);
			var oPropertyEditors = this.oEditor.getContent()[0].getItems()[0].getItems()[0].getItems()[1];
			assert.strictEqual(oPropertyEditors.getConfig().length, 3, "Then the property editors get three configurations");
			assert.strictEqual(oPropertyEditors.getConfig()[0].type, "enum", "and the first property editor is changed to enum");
			assert.strictEqual(oPropertyEditors.getConfig()[1].type, "number", "and the second property editor is still for number");
			assert.strictEqual(oPropertyEditors.getConfig()[2].type, "string", "and the third property editor is still for string");
		});

		QUnit.test("When the first delete button is pressed in the editor", function (assert) {
			var done = assert.async();

			this.oEditor.attachPropertyChanged(function (oEvent) {
				assert.strictEqual(oEvent.getParameter("value").length, 1, "Then there is only one side indicator");
				assert.equal(oEvent.getParameter("value")[0].title, "Deviation", "Then it is updated correctly");
				done();
			});
			var oDelButton_0 = this.oEditor.getContent()[0].getItems()[0].getItems()[0].getItems()[0].getContentRight()[0];
			QUnitUtils.triggerEvent("tap", oDelButton_0.getDomRef());
		});

		QUnit.test("When the second delete button is pressed in the editor", function (assert) {
			var done = assert.async();

			this.oEditor.attachPropertyChanged(function (oEvent) {
				assert.strictEqual(oEvent.getParameter("value").length, 1, "Then there is only one side indicator");
				assert.strictEqual(oEvent.getParameter("value")[0].title, "Target", "Then it is updated correctly");
				done();
			});
			var oButton_1 = this.oEditor.getContent()[0].getItems()[0].getItems()[1].getItems()[0].getContentRight()[0];
			QUnitUtils.triggerEvent("tap", oButton_1.getDomRef());
		});

		QUnit.test("When the add button is pressed in the editor", function (assert) {
			var done = assert.async();

			this.oEditor.attachPropertyChanged(function (oEvent) {
				assert.strictEqual(oEvent.getParameter("value").length, 3, "Then there are three side indicators");
				done();
			});
			var oAddButton = this.oEditor.getContent()[0].getItems()[1];
			QUnitUtils.triggerEvent("tap", oAddButton.getDomRef());
		});

	});
});