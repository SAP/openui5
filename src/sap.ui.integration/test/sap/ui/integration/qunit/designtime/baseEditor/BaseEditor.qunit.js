/* global QUnit */

sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/BaseEditor"
],
	function (
		BaseEditor
	) {
		"use strict";

		QUnit.module("Given BaseEditor is created", {
			beforeEach: function () {
				this.oBaseEditor = new BaseEditor({
					json: {
						context: {
							prop1: "value1",
							prop2: "value2"
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
		});

		QUnit.test("When config with 1 property is set", function (assert) {
			var done = assert.async();
			this.oBaseEditor.setConfig({
				context: "context",
				properties: {
					"prop1": {
						path: "prop1",
						type: "string"
					}
				},
				propertyEditors: {
					"string": "sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor"
				}
			});
			this.oBaseEditor.attachEventOnce("propertyEditorsReady", function () {
				assert.strictEqual(this.oBaseEditor.getPropertyEditorsSync().length, 1, "Then 1 property editor is created");
				assert.strictEqual(this.oBaseEditor.getPropertyEditorsSync()[0].getBindingContext().getObject().value, "value1", "Then value of the property is correctly retrieved from the context object");
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
						path: "prop1",
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
					assert.strictEqual(this.oBaseEditor.getPropertyEditorsSync()[1].getConfig().value, "test", "Then the value is updated in another editor interested in the same path");
					done();
				}.bind(this));

				this.oBaseEditor.getPropertyEditorsSync()[0].fireValueChange("test");
			}.bind(this));
		});


		QUnit.test("When config with binding against property in the context model is set", function (assert) {
			var done = assert.async();
			this.oBaseEditor.setConfig({
				context: "context",
				properties: {
					"prop1": {
						path: "prop1",
						type: "string",
						val: "test"
					},
					"prop2": {
						path: "prop2",
						type: "string",
						val: "{context>/prop1}",
						i18n: "{i18n>prop}"
					}
				},
				propertyEditors: {
					"string": "sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor"
				}
			});
			this.oBaseEditor.attachEventOnce("propertyEditorsReady", function () {
				assert.strictEqual(this.oBaseEditor.getPropertyEditorsSync()[1].getBindingContext().getObject().val, "value1", "Then binding against property model works properly");
				assert.strictEqual(this.oBaseEditor.getPropertyEditorsSync()[1].getBindingContext().getObject().i18n, "prop", "Then binding against other models is untouched");
				done();
			}.bind(this));
		});

		QUnit.test("When config contains properties with tags", function (assert) {
			var done = assert.async();
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
			this.oBaseEditor.attachEventOnce("propertyEditorsReady", function () {
				assert.strictEqual(this.oBaseEditor.getPropertyEditorSync("prop2").getConfig().path, "prop2", "Then property editor getter works with property name");

				assert.strictEqual(this.oBaseEditor.getPropertyEditorsSync("commonTag").length, 2, "Then property editor getter works with one tag (1/3)");
				assert.strictEqual(this.oBaseEditor.getPropertyEditorsSync("commonTag")[0].getConfig().path, "prop1", "Then property editor getter works with one tag (2/3)");
				assert.strictEqual(this.oBaseEditor.getPropertyEditorsSync("commonTag")[1].getConfig().path, "prop2", "Then property editor getter works with one tag (3/3)");

				assert.strictEqual(this.oBaseEditor.getPropertyEditorsSync(["commonTag", "tag1"]).length, 1, "Then property editor getter works with multiple tags (1/2)");
				assert.strictEqual(this.oBaseEditor.getPropertyEditorsSync(["commonTag", "tag1"])[0].getConfig().path, "prop1", "Then property editor getter works with multiple tags (2/2)");
				done();
			}.bind(this));
		});
	}
);
