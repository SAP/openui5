/* global QUnit */
sap.ui.define(['sap/ui/base/ManagedObject', 'sap/ui/model/json/JSONModel'],
	function(ManagedObject, JSONModel) {
		"use strict";

		var TestClass = ManagedObject.extend("TestClass", {
			metadata: {
				properties: {
					simple: "string",
					withDefaultUndefined: {
						type: "object",
						defaultValue: undefined
					}
				}
			}
		});

		var oModel = new JSONModel({
			simple: 'test',
			object: {
				some: true
			}
		});

		QUnit.module("state 'initial' for managed properties", {
			beforeEach: function() {
				this.obj = new TestClass();
			},
			afterEach: function() {
				this.obj.destroy();
			}
		});

		QUnit.test("after creation (empty)", function(assert) {
			assert.ok(this.obj.isPropertyInitial('simple'), "property should be initial after creation");
			assert.ok(this.obj.isPropertyInitial('withDefaultUndefined'), "property should be initial after creation");
		});

		QUnit.test("set non-default value", function(assert) {
			this.obj.setSimple("test");
			assert.notOk(this.obj.isPropertyInitial('simple'), "property should no longer be initial after setting a value");
			this.obj.setWithDefaultUndefined( /* some object */ {});
			assert.notOk(this.obj.isPropertyInitial('withDefaultUndefined'), "property should no longer be initial after setting a value");
		});

		QUnit.test("set default value (null)", function(assert) {
			this.obj.setSimple(null);
			assert.notOk(this.obj.isPropertyInitial('simple'), "property should no longer be initial after setting default value");
			this.obj.setWithDefaultUndefined(null);
			assert.notOk(this.obj.isPropertyInitial('withDefaultUndefined'), "property should no longer be initial after setting defeault value");
		});

		QUnit.test("set default value (undefined)", function(assert) {
			this.obj.setSimple(undefined);
			assert.notOk(this.obj.isPropertyInitial('simple'), "property should no longer be initial after setting default value");
			this.obj.setWithDefaultUndefined(undefined);
			assert.notOk(this.obj.isPropertyInitial('withDefaultUndefined'), "property should no longer be initial after setting defeault value");
		});

		QUnit.test("set default value (value)", function(assert) {
			this.obj.setSimple("");
			assert.notOk(this.obj.isPropertyInitial('simple'), "property should no longer be initial after setting default value");
			this.obj.setWithDefaultUndefined(undefined);
			assert.notOk(this.obj.isPropertyInitial('withDefaultUndefined'), "property should no longer be initial after setting defeault value");
		});

		QUnit.test("reset", function(assert) {
			this.obj.setSimple("test");
			this.obj.setWithDefaultUndefined( /* some object */ {});

			this.obj.resetProperty("simple");
			assert.ok(this.obj.isPropertyInitial('simple'), "property should be initial after resetProperty");
			this.obj.resetProperty("withDefaultUndefined");
			assert.ok(this.obj.isPropertyInitial('withDefaultUndefined'), "property should be initial after resetProperty");
		});

		QUnit.test("binding", function(assert) {
			this.obj.setModel(oModel);
			this.obj.bindObject('/');

			// bind properties
			this.obj.bindProperty("simple", {
				path: 'simple'
			});
			this.obj.bindProperty("withDefaultUndefined", {
				path: 'object'
			});

			assert.notOk(this.obj.isPropertyInitial('simple'), "property should no longer be initial after binding");
			assert.notOk(this.obj.isPropertyInitial('withDefaultUndefined'), "property should no longer be initial after binding");

			// bind object to non-existent path
			this.obj.bindObject('/nowhere');
			assert.equal(this.obj.getSimple(), this.obj.getMetadata().getProperty("simple").getDefaultValue(), "property should have default value again");
			assert.equal(this.obj.getWithDefaultUndefined(), this.obj.getMetadata().getProperty("withDefaultUndefined").getDefaultValue(), "property should have default value again");

			assert.notOk(this.obj.isPropertyInitial('simple'), "property should still not be initial for undefined binding context");
			assert.notOk(this.obj.isPropertyInitial('withDefaultUndefined'), "property should still not be initial for undefined binding context");

			// unbind properties
			this.obj.unbindProperty("simple");
			this.obj.unbindProperty("withDefaultUndefined", true); // this one should NOT reset its value (will remain the "undefined" from the model)
			assert.ok(this.obj.isPropertyInitial('simple'), "property should be initial again after unbinding");
			assert.notOk(this.obj.isPropertyInitial('withDefaultUndefined'), "property should still not be initial after unbinding when bSuppressReset was used");
		});

		QUnit.test("model presence", function(assert) {
			this.obj.bindObject('/');

			// bind properties
			this.obj.bindProperty("simple", {
				path: 'simple'
			});
			this.obj.bindProperty("withDefaultUndefined", {
				path: 'object'
			});

			assert.notOk(this.obj.isPropertyInitial('simple'), "bound property should not be initial even before model was set"); // TODO: REALLY?!  This fails.
			assert.notOk(this.obj.isPropertyInitial('withDefaultUndefined'), "bound property should not be initial even before model was set");

			this.obj.setModel(oModel);
			assert.ok(this.obj.getModel() instanceof JSONModel, "Object should have the model once it was set");

			assert.notOk(this.obj.isPropertyInitial('simple'), "property should no longer be initial after model was set");
			assert.notOk(this.obj.isPropertyInitial('withDefaultUndefined'), "property should no longer be initial after model was set");


			this.obj.setModel();
			assert.equal(this.obj.getModel(), undefined, "Object should no longer have the model once it was removed");

			assert.notOk(this.obj.isPropertyInitial('simple'), "property should not be initial even after model was removed"); // TODO: REALLY?!  This works.
			assert.notOk(this.obj.isPropertyInitial('withDefaultUndefined'), "property should not be initial even after model was removed");
		});

	});