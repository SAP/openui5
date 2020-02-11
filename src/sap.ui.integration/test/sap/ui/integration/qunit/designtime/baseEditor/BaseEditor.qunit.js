/* global QUnit */

sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/BaseEditor"
], function (
	BaseEditor
) {
	"use strict";

	QUnit.module("Given BaseEditor is created", {
		beforeEach: function () {
			this.oBaseEditor = new BaseEditor({
				json: {
					context: {
						prop1: "value1",
						prop2: "value2",
						prop3: "value3",
						prop4: "value4"
					},
					fooPath: {
						foo1: "bar1"
					}
				}
			});
		},
		afterEach: function () {
			this.oBaseEditor.destroy();
		}
	}, function () {
		QUnit.test("When config with 1 property is set", function (assert) {
			var done = assert.async();
			this.oBaseEditor.setConfig({
				context: "context",
				properties: {
					"prop1": {
						label: "Prop1",
						path: "prop1",
						type: "string"
					}
				},
				propertyEditors: {
					"string": "sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor"
				}
			});

			this.oBaseEditor.placeAt("qunit-fixture");

			this.oBaseEditor.attachEventOnce("propertyEditorsReady", function () {
				sap.ui.getCore().applyChanges();
				assert.strictEqual(this.oBaseEditor.getPropertyEditorsSync().length, 1, "Then 1 property editor is created");
				assert.strictEqual(
					this.oBaseEditor.getPropertyEditorsSync()[0].getValue(),
					"value1",
					"Then value of the property is correctly set on the property editor"
				);
				done();
			}.bind(this));
		});

		QUnit.test("When property editor changes value", function (assert) {
			var done = assert.async();
			this.oBaseEditor.setConfig({
				context: "context",
				properties: {
					"prop1": {
						path: "prop1",
						type: "string"
					},
					"prop2": {
						path: "prop2",
						type: "string"
					}
				},
				propertyEditors: {
					"string": "sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor"
				}
			});
			this.oBaseEditor.attachEventOnce("propertyEditorsReady", function () {
				this.oBaseEditor.attachJsonChange(function(oEvent) {
					assert.strictEqual(oEvent.getParameter("json").context.prop1, "test", "Then the value is updated in JSON");
					done();
				});

				this.oBaseEditor.getPropertyEditorsSync()[0].setValue("test");
			}.bind(this));
		});

		QUnit.test("When config contains properties with tags", function (assert) {
			var done = assert.async();

			this.oBaseEditor.attachEventOnce("propertyEditorsReady", function () {
				sap.ui.getCore().applyChanges();
				assert.strictEqual(this.oBaseEditor.getPropertyEditorsByNameSync("prop2")[0].getValue(), "value2", "Then property editor getter works with property name");

				assert.strictEqual(this.oBaseEditor.getPropertyEditorsByTagSync("commonTag").length, 2, "Then property editor getter works with one tag (1/3)");
				assert.strictEqual(this.oBaseEditor.getPropertyEditorsByTagSync("commonTag")[0].getValue(), "value1", "Then property editor getter works with one tag (2/3)");
				assert.strictEqual(this.oBaseEditor.getPropertyEditorsByTagSync("commonTag")[1].getValue(), "value2", "Then property editor getter works with one tag (3/3)");

				assert.strictEqual(this.oBaseEditor.getPropertyEditorsByTagSync(["commonTag", "tag1"]).length, 1, "Then property editor getter works with multiple tags (1/2)");
				assert.strictEqual(this.oBaseEditor.getPropertyEditorsByTagSync(["commonTag", "tag1"])[0].getValue(), "value1", "Then property editor getter works with multiple tags (2/2)");
				done();
			}, this);

			this.oBaseEditor.setConfig({
				context: "context",
				properties: {
					"prop1": {
						path: "prop1",
						tags: ["tag1", "commonTag"],
						type: "string"
					},
					"prop2": {
						path: "prop2",
						tags: ["tag2", "commonTag"],
						type: "string"
					},
					"prop3": {
						path: "prop3",
						tags: [],
						type: "string"
					},
					"prop4": {
						path: "prop4",
						type: "anotherString"
					}
				},
				propertyEditors: {
					"string": "sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor",
					"anotherString": "sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor"
				}
			});

			this.oBaseEditor.placeAt("qunit-fixture");
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
