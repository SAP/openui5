/* global QUnit */

sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/propertyEditor/PropertyEditorFactory",
	"sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor",
	"sap/ui/integration/designtime/baseEditor/propertyEditor/mapEditor/MapEditor",
	"sap/base/util/each",
	"sap/ui/thirdparty/sinon-4"
],
function (
	PropertyEditorFactory,
	StringEditor,
	MapEditor,
	each,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("Given an editor factory is configured", {
		beforeEach: function () {
			this.mPropertyEditors = {
				"map": "sap/ui/integration/designtime/baseEditor/propertyEditor/mapEditor/MapEditor",
				"string": "sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor"
			};
			PropertyEditorFactory.registerTypes(this.mPropertyEditors);
		},
		afterEach: function () {
			PropertyEditorFactory.deregisterAllTypes();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("When the factory is called for a simple editor type", function (assert) {
			return PropertyEditorFactory.create("string").then(function (oPropertyEditor) {
				assert.ok(oPropertyEditor instanceof StringEditor, "Then an editor instance is created");
			});
		});

		QUnit.test("When the factory is called for a complex editor type", function (assert) {
			return PropertyEditorFactory.create("map").then(function (oPropertyEditor) {
				assert.ok(oPropertyEditor instanceof MapEditor, "Then an editor instance is created");
			});
		});

		QUnit.test("When the factory is called with an unregistered type", function (assert) {
			return PropertyEditorFactory.create("notRegisteredType").catch(function (sError) {
				assert.strictEqual(sError, "Editor type was not registered", "Then an error is thrown");
			});
		});

		QUnit.test("When no property type is configured", function (assert) {
			return PropertyEditorFactory.create().catch(function (sError) {
				assert.strictEqual(sError, "No editor type was specified in the property configuration.", "Then an error is thrown");
			});
		});

		QUnit.test("When a type is deregistered", function (assert) {
			var fnDone = assert.async(3);

			PropertyEditorFactory.deregisterType("string");

			PropertyEditorFactory.create("string").catch(function (sError) {
				assert.strictEqual(sError, "Editor type was not registered", "Then the type can no longer be used");
				fnDone();
			});

			PropertyEditorFactory.create("map").then(function (oPropertyEditor) {
				assert.ok(oPropertyEditor instanceof MapEditor, "Then instances of the remaining type can still be created");
				fnDone();
			});

			PropertyEditorFactory.registerTypes({string: "sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor"});

			PropertyEditorFactory.create("string").then(function (oPropertyEditor) {
				assert.ok(oPropertyEditor instanceof StringEditor, "Then it can be registered again");
				fnDone();
			});
		});

		QUnit.test("When an invalid class path is provided", function (assert) {
			var oRequireStub = sandbox.stub(sap.ui, "require");
			var sInvalidClassPath = "sap/ui/integration/designtime/baseEditor/propertyEditor/someNonExistingEditorType";
			oRequireStub.withArgs([sInvalidClassPath]).callsArgWith(2, "Not found");

			PropertyEditorFactory.registerTypes({typeWithInvalidClass: sInvalidClassPath});
			return PropertyEditorFactory.create("typeWithInvalidClass").catch(function (sError) {
				assert.strictEqual(sError, "Not found", "Then an error is thrown");
			});
		});

		QUnit.test("When hasType() is called with a valid type", function (assert) {
			assert.ok(PropertyEditorFactory.hasType("string"), "then the string type is registered properly");
		});

		QUnit.test("When hasType() is called with an invalid type", function (assert) {
			assert.notOk(PropertyEditorFactory.hasType("sap.ui.model.type.Float"), "then the unknown type is not found");
		});

		QUnit.test("When getTypes() is called", function (assert) {
			var fnDone = assert.async(Object.keys(this.mPropertyEditors).length);
			var mRegistredTypes = PropertyEditorFactory.getTypes();

			each(mRegistredTypes, function (sType, oPromise) {
				assert.ok(typeof sType === "string", "then property editor key is correct");
				assert.ok(oPromise instanceof Promise, "then value is a promise");
				oPromise.then(function (fnConstructor) {
					assert.ok(fnConstructor.getMetadata().isA("sap.ui.integration.designtime.baseEditor.propertyEditor.BasePropertyEditor"));
					fnDone();
				});
			});
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
