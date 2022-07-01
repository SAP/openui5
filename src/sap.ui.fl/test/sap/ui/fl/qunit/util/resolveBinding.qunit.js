/*global QUnit*/

sap.ui.define([
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/core/mvc/View",
	"sap/ui/model/json/JSONModel",
	"sap/ui/fl/util/resolveBinding",
	"sap/ui/core/Core"
], function(
	sinon,
	View,
	JSONModel,
	resolveBinding,
	oCore
) {
	"use strict";
	var sandbox = sinon.createSandbox();

	QUnit.module("Base functionality", {
		before: function() {
			this.oView = new View().placeAt("qunit-fixture");
			this.oDefaultModel = new JSONModel({
				foo: "foo value",
				bar: {
					foobar: "foobar value"
				}
			});
			this.oCustomModel = new JSONModel({
				custom: "custom value"
			});
			this.oView.setModel(this.oDefaultModel);
			this.oView.setBindingContext(this.oDefaultModel.getContext("/"));
			this.oView.setModel(this.oDefaultModel, "context");
			this.oView.setBindingContext(this.oDefaultModel.getContext("/bar"), "context");
			this.oView.setModel(this.oCustomModel, "custom");
			this.oView.setBindingContext(this.oCustomModel.getContext("/"), "custom");
			oCore.applyChanges();
		},
		after: function() {
			this.oView.destroy();
			this.oDefaultModel.destroy();
			this.oCustomModel.destroy();
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when a passed value string contains no binding", function(assert) {
			assert.strictEqual(
				resolveBinding("test", this.oView),
				undefined,
				"then undefined is returned"
			);
		});

		QUnit.test("when a passed value object contains no binding", function(assert) {
			assert.strictEqual(
				resolveBinding({
					someProperty: "someValue"
				}, this.oView),
				undefined,
				"then undefined is returned"
			);
		});

		QUnit.test("when the value contains an invalid binding", function(assert) {
			assert.strictEqual(
				resolveBinding("{foo2}", this.oView),
				undefined,
				"then undefined is returned"
			);
		});

		QUnit.test("when a string contains a binding against the default model", function(assert) {
			assert.strictEqual(
				resolveBinding("{foo}", this.oView),
				"foo value",
				"then the resolved value is returned"
			);
		});

		QUnit.test("when an object contains a binding against the default model", function(assert) {
			assert.strictEqual(
				resolveBinding({
					path: "bar/foobar"
				}, this.oView),
				"foobar value",
				"then the resolved value is returned"
			);
		});

		QUnit.test("when a string contains a binding against a custom model", function(assert) {
			assert.strictEqual(
				resolveBinding("{custom>custom}", this.oView),
				"custom value",
				"then the resolved value is returned"
			);
		});

		QUnit.test("when a string contains a binding with a custom binding context", function(assert) {
			assert.strictEqual(
				resolveBinding("{context>foobar}", this.oView),
				"foobar value",
				"then the resolved value is returned"
			);
		});

		QUnit.test("when an object contains multiple binding parts", function(assert) {
			assert.strictEqual(
				resolveBinding({
					parts: [
						{
							path: "foo"
						},
						{
							path: "custom",
							model: "custom"
						}
					]
				}, this.oView),
				"foo value custom value",
				"then all parts are resolved"
			);
		});

		QUnit.test("when a string contains an expression binding with multiple models", function(assert) {
			assert.strictEqual(
				resolveBinding("{= ${context>foobar} + ' and ' + ${foo}}", this.oView),
				"foobar value and foo value",
				"then all models are properly resolved"
			);
		});

		QUnit.test("when a string contains an expression binding with a formatter", function(assert) {
			sandbox.stub(this.oView, "getController").returns({
				formatter: function (value) {
					return value && value.toUpperCase();
				}
			});

			assert.strictEqual(
				resolveBinding("{path: 'foo', formatter: '.formatter'}", this.oView),
				"FOO VALUE",
				"then the formatter is executed"
			);
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});