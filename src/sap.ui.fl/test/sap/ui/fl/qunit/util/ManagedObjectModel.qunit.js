/*global QUnit*/

sap.ui.define([
	"sap/ui/fl/util/ManagedObjectModel",
	"sap/ui/core/Element"
], function(
	ManagedObjectModel,
	Element
) {
	"use strict";

	var FixtureElement = Element.extend("fixture.Control");

	QUnit.module("Basic functionality", {

		beforeEach: function () {
			this.sModelName = "testModel";
			this.oElement = new FixtureElement();
			this.oManagedObjectModel = new ManagedObjectModel({
				object: this.oElement,
				name: this.sModelName
			});
		},
		afterEach: function () {
			this.oManagedObjectModel.destroy();
			this.oElement.destroy();
		}
	}, function () {
		QUnit.test("when created, it should be an instance of sap.ui.core.Element", function (assert) {
			assert.ok(this.oManagedObjectModel instanceof Element);
		});

		QUnit.test("when added to dependents aggregation of Element, the named model should be set on the Element object", function (assert) {
			this.oElement.addDependent(this.oManagedObjectModel);
			assert.ok(this.oElement.getModel(this.sModelName).isA("sap.ui.model.base.ManagedObjectModel"));
		});

		QUnit.test("when moved from one Element to another, the model should be removed automatically", function (assert) {
			var oElement1 = new FixtureElement();
			var oElement2 = new FixtureElement();

			oElement1.addDependent(this.oManagedObjectModel);
			assert.ok(oElement1.getModel(this.sModelName));
			oElement2.addDependent(this.oManagedObjectModel);
			assert.strictEqual(oElement1.getModel(this.sModelName), undefined);
			assert.ok(oElement2.getModel(this.sModelName));

			oElement1.destroy();
			oElement2.destroy();
		});

		QUnit.test("when try to change the `data` property, it should throw an Error", function (assert) {
			assert.throws(function () {
				this.oManagedObjectModel.setData({});
			});
		});

		QUnit.test("when try to change the `name` property, it should throw an Error", function (assert) {
			assert.throws(function () {
				this.oManagedObjectModel.setName('newName');
			});
		});

		QUnit.test("when try to change the `object` association, it should throw an Error", function (assert) {
			var oAnotherElement = new FixtureElement();
			assert.throws(function () {
				this.oManagedObjectModel.setObject(oAnotherElement);
			});
			oAnotherElement.destroy();
		});
	});

	QUnit.done(function () {
		jQuery('#qunit-fixture').hide();
	});
});