/* global QUnit */

sap.ui.define([
	"sap/ui/integration/designtime/controls/utils/ObjectBinding",
	"sap/ui/model/json/JSONModel"
],
	function (
		ObjectBinding,
		JSONModel
	) {
		"use strict";

		QUnit.module("Given test JSON models, Object and ObjectBinding are created", {
			beforeEach: function (assert) {
				this.oObject = {
					noBinding: 1,
					defaultModelContextBinding: "{value}",
					defaultModelAbsoluteBinding: "{/root}",
					modelWithRootContextBinding: "{foo>root}",
					nonExistingModelBinding: "{i18n>test}",
					nestedProperties: {
						anotherModelContextBinding: "{test>value}",
						anotherModelExpressionBinding: "{= ${test>value} === 'TestValue' ? 'Success' : 'Failure' }",
						multipleModelsExpression: "{= ${test>value} === ${foo>/context/bar} ? 'Yes' : 'No'}"
					}
				};

				this.oDefaultModelData = {
					root: "root",
					context: {
						value: "DefaultValue"
					},
					another: {
						foo: "bar"
					}
				};
				this.oTestModelData = {
					test: "testRoot",
					context: {
						value: "TestValue"
					},
					another: {
						foo: "testBar"
					}
				};
				this.oFooModelData = {
					root: "fooRoot",
					context: {
						bar: "TestValue"
					},
					another: {
						foo: "fooBar"
					}
				};
				this.oDefaultModel = new JSONModel(this.oDefaultModelData);
				this.oTestModel = new JSONModel(this.oTestModelData);
				this.oFooModel = new JSONModel(this.oFooModelData);
				this.oObjectBinding = new ObjectBinding();
				this.oObjectBinding.setObject(this.oObject);
				this.oObjectBinding.setModel(this.oDefaultModel);
				this.oObjectBinding.setBindingContext(this.oDefaultModel.getContext("/context"));
				this.oObjectBinding.setModel(this.oTestModel, "test");
				this.oObjectBinding.setBindingContext(this.oTestModel.getContext("/context"), "test");
				this.oObjectBinding.setModel(this.oFooModel, "foo");
				this.oObjectBinding.setBindingContext(this.oFooModel.getContext("/"), "foo");
			},
			afterEach: function () {
				this.oObjectBinding.destroy();
				this.oDefaultModel.destroy();
				this.oTestModel.destroy();
				this.oFooModel.destroy();
			}
		});

		QUnit.test("When bindings are resolved", function (assert) {
			assert.deepEqual(this.oObject, {
				noBinding: 1,
				defaultModelContextBinding: "DefaultValue",
				defaultModelAbsoluteBinding: "root",
				modelWithRootContextBinding: "fooRoot",
				nonExistingModelBinding: "{i18n>test}",
				nestedProperties: {
					anotherModelContextBinding: "TestValue",
					anotherModelExpressionBinding: "Success",
					multipleModelsExpression: "Yes"
				}
			}, "then object values are updated accordingly");
		});

		QUnit.test("When values in models are changed", function (assert) {
			this.oDefaultModelData.root = "rootUpdated";
			this.oDefaultModelData.context.value = "DefaultValueUpdated";
			this.oTestModelData.context.value = "TestValueUpdated";
			this.oFooModelData.root = "fooRootUpdated";
			this.oFooModelData.context.bar = "TestValueUpdated";
			this.oDefaultModel.checkUpdate();
			this.oTestModel.checkUpdate();
			this.oFooModel.checkUpdate();

			assert.deepEqual(this.oObject, {
				noBinding: 1,
				defaultModelContextBinding: "DefaultValueUpdated",
				defaultModelAbsoluteBinding: "rootUpdated",
				modelWithRootContextBinding: "fooRootUpdated",
				nonExistingModelBinding: "{i18n>test}",
				nestedProperties: {
					anotherModelContextBinding: "TestValueUpdated",
					anotherModelExpressionBinding: "Failure",
					multipleModelsExpression: "Yes"
				}
			}, "then object values are updated as well");
		});
	}
);
