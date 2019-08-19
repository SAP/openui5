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

		QUnit.test("When editor value is changed", function (assert) {
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
	}
);
