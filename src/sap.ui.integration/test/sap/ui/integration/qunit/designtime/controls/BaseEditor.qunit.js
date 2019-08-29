/* global QUnit */

sap.ui.define([
	"sap/ui/integration/designtime/controls/BaseEditor"
],
	function (
		BaseEditor
	) {
		"use strict";

		QUnit.module("Given BaseEditor is created", {
			beforeEach: function (assert) {
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
					"string": "sap/ui/integration/designtime/controls/propertyEditors/StringEditor"
				}
			});
			this.oBaseEditor.attachPropertyEditorsReady(function(oEvent) {
				assert.strictEqual(this.oBaseEditor.getPropertyEditors().length, 1, "Then 1 property editor is created");
				assert.strictEqual(this.oBaseEditor.getPropertyEditors()[0].getBindingContext().getObject().value, "value1", "Then value of the property is correctly retrieved from the context object");
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
					}
				},
				propertyEditors: {
					"string": "sap/ui/integration/designtime/controls/propertyEditors/StringEditor"
				}
			});
			this.oBaseEditor.attachPropertyEditorsReady(function(oEvent) {
				this.oBaseEditor.attachJsonChanged(function(oEvent) {
					assert.strictEqual(oEvent.getParameter("json").context.prop1, "test", "Then the value is updated in JSON");
					done();
				});

				this.oBaseEditor.getPropertyEditors()[0].firePropertyChanged("test");
			}.bind(this));
		});


		QUnit.test("When config with binding against property in the default (property) model is set", function (assert) {
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
						val: "{properties>/prop1/val}",
						i18n: "{i18n>prop}"
					}
				},
				propertyEditors: {
					"string": "sap/ui/integration/designtime/controls/propertyEditors/StringEditor"
				}
			});
			this.oBaseEditor.attachPropertyEditorsReady(function(oEvent) {
				assert.strictEqual(this.oBaseEditor.getPropertyEditors()[1].getBindingContext().getObject().val, "test", "Then binding against property model works properly");
				assert.strictEqual(this.oBaseEditor.getPropertyEditors()[1].getBindingContext().getObject().i18n, "{i18n>prop}", "Then binding against other models is untouched");
				done();
			}.bind(this));
		});

		QUnit.test("When config with binding against another binding in default (property) model is set", function (assert) {
			var done = assert.async();
			this.oBaseEditor.setConfig({
				context: "context",
				properties: {
					"prop1": {
						path: "prop1",
						type: "string",
						val: "{properties>/prop2/val}"
					},
					"prop2": {
						path: "prop2",
						type: "string",
						val: "{properties>/prop3/val}",
						i18n: "{i18n>prop}"
					},
					"prop3": {
						val: "test"
					}
				},
				propertyEditors: {
					"string": "sap/ui/integration/designtime/controls/propertyEditors/StringEditor"
				}
			});
			this.oBaseEditor.attachPropertyEditorsReady(function(oEvent) {
				assert.strictEqual(this.oBaseEditor.getPropertyEditors()[1].getBindingContext().getObject().val, "test", "Then binding against property model works properly");
				assert.strictEqual(this.oBaseEditor.getPropertyEditors()[0].getBindingContext().getObject().val, "test", "Then binding against property model works properly");
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
					"string": "sap/ui/integration/designtime/controls/propertyEditors/StringEditor",
					"anotherString": "sap/ui/integration/designtime/controls/propertyEditors/StringEditor"
				}
			});
			this.oBaseEditor.attachPropertyEditorsReady(function(oEvent) {
				assert.strictEqual(this.oBaseEditor.getPropertyEditor("prop2").getPropertyInfo().path, "prop2", "Then property editor getter works with property name");

				assert.strictEqual(this.oBaseEditor.getPropertyEditors("commonTag").length, 2, "Then property editor getter works with one tag (1/3)");
				assert.strictEqual(this.oBaseEditor.getPropertyEditors("commonTag")[0].getPropertyInfo().path, "prop1", "Then property editor getter works with one tag (2/3)");
				assert.strictEqual(this.oBaseEditor.getPropertyEditors("commonTag")[1].getPropertyInfo().path, "prop2", "Then property editor getter works with one tag (3/3)");

				assert.strictEqual(this.oBaseEditor.getPropertyEditors(["commonTag", "tag1"]).length, 1, "Then property editor getter works with multiple tags (1/2)");
				assert.strictEqual(this.oBaseEditor.getPropertyEditors(["commonTag", "tag1"])[0].getPropertyInfo().path, "prop1", "Then property editor getter works with multiple tags (2/2)");
				done();
			}.bind(this));
		});

		QUnit.test("When config contains arrays", function (assert) {
			var done = assert.async();
			var aArray = [
				{
					a: "test1",
					b: "Default"
				},
				{
					a: "test2",
					b: "Bold"
				}
			];
			this.oBaseEditor.setJson({
				context: {
					prop: aArray
				},
				fooPath: {
					foo1: "bar1"
				}
			});
			this.oBaseEditor.setConfig({
				context: "context",
				properties: {
					"prop": {
						path: "prop",
						type: "array",
						template: {
							a: {
								path: "prop/:index/a",
								type: "string"
							},
							b: {
								path: "prop/:index/b",
								type: "enum",
								"enum": ["Default", "Bold"]
							}
						}
					}
				},
				propertyEditors: {
					"string": "sap/ui/integration/designtime/controls/propertyEditors/StringEditor",
					"array": "sap/ui/integration/designtime/controls/propertyEditors/ArrayEditor",
					"enum": "sap/ui/integration/designtime/controls/propertyEditors/EnumStringEditor"
				}
			});
			this.oBaseEditor.attachPropertyEditorsReady(function(oEvent) {
				assert.strictEqual(this.oBaseEditor.getPropertyEditor("prop").getPropertyInfo().items.length, 2, "Then configuration for array items is created from template");
				assert.strictEqual(this.oBaseEditor.getPropertyEditor("prop").getPropertyInfo().items[0].a.path, "prop/0/a", "Then path index in array item is resolved");
				assert.strictEqual(this.oBaseEditor.getPropertyEditor("prop").getPropertyInfo().items[1].b.value, "Bold", "Then value in array item is correct");
				assert.deepEqual(this.oBaseEditor.getPropertyEditor("prop").getPropertyInfo().value, aArray, "Then array value is set correctly");
				assert.strictEqual(this.oBaseEditor.getPropertyEditor("prop").getContent().length, 2, "Then array editor is created correctly");
				done();
			}.bind(this));
		});
	}
);
