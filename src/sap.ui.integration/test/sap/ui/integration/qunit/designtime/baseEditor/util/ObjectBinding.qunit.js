/* global QUnit */

sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/util/binding/ObjectBinding",
	"sap/ui/model/json/JSONModel"
],
function (
	ObjectBinding,
	JSONModel
) {
	"use strict";

	QUnit.module("Given test JSON models and ObjectBinding", {
		beforeEach: function () {
			this.oObjectBinding = new ObjectBinding();

			this.oDefaultModel = new JSONModel({
				root: "root",
				context: {
					value: "DefaultValue"
				},
				another: {
					foo: "bar"
				}
			});

			this.oTestModel = new JSONModel({
				root: "testRoot",
				context: {
					value: "TestValue"
				},
				another: {
					foo: "testBar"
				}
			});

			this.oFooModel = new JSONModel({
				root: "fooRoot",
				context: {
					bar: "TestValue"
				},
				another: {
					foo: "fooBar"
				}
			});
		},
		afterEach: function () {
			this.oObjectBinding.destroy();
			this.oDefaultModel.destroy();
			this.oTestModel.destroy();
			this.oFooModel.destroy();
		}
	}, function () {
		QUnit.test("simple binding — absolute binding", function (assert) {
			var oJson = {
				noBinding: 1,
				absoluteBinding: "{/root}"
			};

			this.oObjectBinding.setObject(oJson);
			this.oObjectBinding.setModel(this.oDefaultModel);

			assert.deepEqual(
				this.oObjectBinding.getObject(),
				{
					noBinding: 1,
					absoluteBinding: "root"
				}
			);
		});

		QUnit.test("simple binding — relative binding", function (assert) {
			var oJson = {
				noBinding: 1,
				relativeBinding: "{value}"
			};

			this.oObjectBinding.setObject(oJson);
			this.oObjectBinding.setModel(this.oDefaultModel);
			this.oObjectBinding.setBindingContext(this.oDefaultModel.getContext("/context"));

			assert.deepEqual(
				this.oObjectBinding.getObject(),
				{
					noBinding: 1,
					relativeBinding: "DefaultValue"
				}
			);
		});

		QUnit.test("simple binding — incorrect binding string", function (assert) {
			var oJson = {
				noBinding: 1,
				incorrectBinding: "{nonExistentPath}"
			};

			this.oObjectBinding.setObject(oJson);
			this.oObjectBinding.setModel(this.oDefaultModel);
			this.oObjectBinding.setBindingContext(this.oDefaultModel.getContext("/context"));

			assert.deepEqual(
				this.oObjectBinding.getObject(),
				{
					noBinding: 1,
					incorrectBinding: undefined
				}
			);
		});

		QUnit.test("simple binding against non-default model", function (assert) {
			var oJson = {
				noBinding: 1,
				simpleBinding: "{test>/root}"
			};

			this.oObjectBinding.setObject(oJson);
			this.oObjectBinding.setModel(this.oTestModel, "test");

			assert.deepEqual(
				this.oObjectBinding.getObject(),
				{
					noBinding: 1,
					simpleBinding: "testRoot"
				}
			);
		});

		QUnit.test("simple binding against unknown model", function (assert) {
			var oJson = {
				noBinding: 1,
				simpleBinding: "{someModel>/root}"
			};

			this.oObjectBinding.setObject(oJson);

			assert.deepEqual(
				this.oObjectBinding.getObject(),
				{
					noBinding: 1,
					simpleBinding: "{someModel>/root}"
				}
			);
		});

		QUnit.test("complex binding against default model with absolute and relative parts", function (assert) {
			var oJson = {
				noBinding: 1,
				complexBinding: "{= ${/root} + ' ' + ${value} }"
			};

			this.oObjectBinding.setObject(oJson);
			this.oObjectBinding.setModel(this.oDefaultModel);
			this.oObjectBinding.setBindingContext(this.oDefaultModel.getContext("/context"));

			assert.deepEqual(
				this.oObjectBinding.getObject(),
				{
					noBinding: 1,
					complexBinding: "root DefaultValue"
				}
			);
		});

		QUnit.test("complex binding against default model when one part is unknown", function (assert) {
			var oJson = {
				noBinding: 1,
				complexBinding: "{= ${/root} + ' ' + ${someProperty} }"
			};

			this.oObjectBinding.setObject(oJson);
			this.oObjectBinding.setModel(this.oDefaultModel);
			this.oObjectBinding.setBindingContext(this.oDefaultModel.getContext("/context"));

			assert.deepEqual(
				this.oObjectBinding.getObject(),
				{
					noBinding: 1,
					complexBinding: "root undefined" // `undefined` because "someProperty" is undefined in the source object
				}
			);
		});

		QUnit.test("complex binding against default model and some other model", function (assert) {
			var oJson = {
				noBinding: 1,
				complexBinding: "{= ${/root} + ' ' + ${test>value} }"
			};

			this.oObjectBinding.setObject(oJson);
			this.oObjectBinding.setModel(this.oDefaultModel);
			this.oObjectBinding.setBindingContext(this.oDefaultModel.getContext("/context"));
			this.oObjectBinding.setModel(this.oTestModel, "test");
			this.oObjectBinding.setBindingContext(this.oTestModel.getContext("/context"), "test");

			assert.deepEqual(
				this.oObjectBinding.getObject(),
				{
					noBinding: 1,
					complexBinding: "root TestValue"
				}
			);
		});

		QUnit.test("complex binding against default model and unknown model", function (assert) {
			var oJson = {
				noBinding: 1,
				complexBinding: "{= ${/root} + ' ' + ${test>value} }"
			};

			this.oObjectBinding.setObject(oJson);
			this.oObjectBinding.setModel(this.oDefaultModel);
			this.oObjectBinding.setBindingContext(this.oDefaultModel.getContext("/context"));

			assert.deepEqual(
				this.oObjectBinding.getObject(),
				{
					noBinding: 1,
					complexBinding: "{= ${/root} + ' ' + ${test>value} }"
				}
			);
		});

		QUnit.test("nesting: simple binding", function (assert) {
			var oJson = {
				noBinding: 1,
				nestedProperties: {
					simpleBinding: "{value}"
				}
			};

			this.oObjectBinding.setObject(oJson);
			this.oObjectBinding.setModel(this.oDefaultModel);
			this.oObjectBinding.setBindingContext(this.oDefaultModel.getContext("/context"));

			assert.deepEqual(
				this.oObjectBinding.getObject(),
				{
					noBinding: 1,
					nestedProperties: {
						simpleBinding: "DefaultValue"
					}
				}
			);
		});

		QUnit.test("nesting: complex binding", function (assert) {
			var oJson = {
				noBinding: 1,
				nestedProperties: {
					complexBinding: "{= ${test>value} === 'TestValue' ? 'Success' : 'Failure' }"
				}
			};

			this.oObjectBinding.setObject(oJson);
			this.oObjectBinding.setModel(this.oTestModel, "test");
			this.oObjectBinding.setBindingContext(this.oTestModel.getContext("/context"), "test");

			assert.deepEqual(
				this.oObjectBinding.getObject(),
				{
					noBinding: 1,
					nestedProperties: {
						complexBinding: "Success"
					}
				}
			);
		});

		QUnit.test("nesting: complex binding with multiple models", function (assert) {
			var oJson = {
				noBinding: 1,
				nestedProperties: {
					complexBinding: "{= ${test>value} === ${foo>/context/bar} ? 'Yes' : 'No'}"
				}
			};

			this.oObjectBinding.setObject(oJson);
			this.oObjectBinding.setModel(this.oTestModel, "test");
			this.oObjectBinding.setBindingContext(this.oTestModel.getContext("/context"), "test");
			this.oObjectBinding.setModel(this.oFooModel, "foo");
			this.oObjectBinding.setBindingContext(this.oFooModel.getContext("/context"), "foo");

			assert.deepEqual(
				this.oObjectBinding.getObject(),
				{
					noBinding: 1,
					nestedProperties: {
						complexBinding: "Yes"
					}
				}
			);
		});

		QUnit.test("avoid mutations in the JSON object", function (assert) {
			var oJson = {
				noBinding: 1,
				nestedProperties: {
					simpleBinding: "{value}"
				}
			};

			this.oObjectBinding.setObject(oJson);
			this.oObjectBinding.setModel(this.oDefaultModel);
			this.oObjectBinding.setBindingContext(this.oDefaultModel.getContext("/context"));

			assert.notStrictEqual(this.oObjectBinding.getObject(), oJson);
			assert.notStrictEqual(this.oObjectBinding.getObject().nestedProperties, oJson.nestedProperties);
		});

		QUnit.test("model updates", function (assert) {
			var fnDone = assert.async();
			var oJson = {
				noBinding: 1,
				absoluteBinding: "{/root}"
			};

			this.oObjectBinding.setObject(oJson);
			this.oObjectBinding.setModel(this.oDefaultModel);

			assert.deepEqual(
				this.oObjectBinding.getObject(),
				{
					noBinding: 1,
					absoluteBinding: "root"
				}
			);

			this.oObjectBinding.attachChange(function (oEvent) {
				assert.strictEqual(oEvent.getParameter("path"), "absoluteBinding");
				assert.strictEqual(oEvent.getParameter("value"), "foo");
				assert.deepEqual(
					this.oObjectBinding.getObject(),
					{
						noBinding: 1,
						absoluteBinding: "foo"
					}
				);
				fnDone();
			}, this);

			this.oDefaultModel.setData(Object.assign({}, this.oDefaultModel.getData(), {
				root: "foo"
			}));
		});

		QUnit.test("arrays support", function (assert) {
			var oJson = [
				{
					simpleBinding: "{/root}",
					noBinding: null
				},
				"{value}",
				[
					"{/root}",
					"{value}"
				]
			];

			this.oObjectBinding.setObject(oJson);
			this.oObjectBinding.setModel(this.oDefaultModel);
			this.oObjectBinding.setBindingContext(this.oDefaultModel.getContext("/context"));

			assert.deepEqual(
				this.oObjectBinding.getObject(),
				[
					{
						simpleBinding: "root",
						noBinding: null
					},
					"DefaultValue",
					[
						"root",
						"DefaultValue"
					]
				]
			);
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
