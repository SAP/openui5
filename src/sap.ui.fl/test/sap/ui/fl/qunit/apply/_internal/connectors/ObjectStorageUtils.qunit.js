/* global QUnit */

sap.ui.define([
	"sap/ui/fl/Layer",
	"sap/ui/fl/apply/_internal/connectors/ObjectStorageUtils",
	"sap/ui/thirdparty/jquery"
], function (
	Layer,
	ObjectStorageUtils,
	jQuery
) {
	"use strict";

	function parseAndAssertProperty(oStorage, sKey, sPropertyName, vValue, sMessage, assert) {
		assert.equal(JSON.parse(oStorage[sKey])[sPropertyName], vValue, sMessage);
	}

	QUnit.module("forEachChangeInStorage / createFlexKey", {
		beforeEach: function() {
			this.sChangeKey1 = ObjectStorageUtils.createFlexKey("id1");
			this.sChangeKey2 = ObjectStorageUtils.createFlexKey("id2");
			this.sVariantKey1 = ObjectStorageUtils.createFlexKey("id3");
			this.sVariantKey2 = ObjectStorageUtils.createFlexKey("id4");
			this.oStorage = {};
			this.oStorage[this.sChangeKey1] = JSON.stringify({reference: "sap.ui.fl.test", layer: Layer.USER, name: "change1"});
			this.oStorage[this.sChangeKey2] = JSON.stringify({reference: "sap.ui.fl.test.1", layer: Layer.USER, name: "change2"});
			this.oStorage[this.sVariantKey1] = JSON.stringify({reference: "sap.ui.fl.test.2", layer: Layer.CUSTOMER, name: "variant1"});
			this.oStorage[this.sVariantKey2] = JSON.stringify({reference: "sap.ui.fl.test.3", layer: Layer.CUSTOMER, name: "variant2"});
			this.oStorage.foo = JSON.stringify({name: "bar"});
			this.oStorage.bar = JSON.stringify({name: "foobar"});
		},
		afterEach: function () {
			delete this.oStorage;
		}
	}, function() {
		QUnit.test("forEachObjectInStorage with various changes and variants", function(assert) {
			return ObjectStorageUtils.forEachObjectInStorage({storage: this.oStorage}, function(mFlexObject) {
				mFlexObject.changeDefinition.name += "called";
				this.oStorage[mFlexObject.key] = (JSON.stringify(mFlexObject.changeDefinition));
			}.bind(this))
			.then(function () {
				parseAndAssertProperty(this.oStorage, this.sChangeKey1, "name", "change1called", "the callback was called and the value was changed", assert);
				parseAndAssertProperty(this.oStorage, this.sChangeKey2, "name", "change2called", "the callback was called and the value was changed", assert);
				parseAndAssertProperty(this.oStorage, this.sVariantKey1, "name", "variant1called", "the callback was called and the value was changed", assert);
				parseAndAssertProperty(this.oStorage, this.sVariantKey2, "name", "variant2called", "the callback was called and the value was changed", assert);
				parseAndAssertProperty(this.oStorage, "foo", "name", "bar", "the value was not changed", assert);
				parseAndAssertProperty(this.oStorage, "bar", "name", "foobar", "the value was not changed", assert);
			}.bind(this));
		});

		QUnit.test("forEachObjectInStorage with various changes and variants with reference", function(assert) {
			return ObjectStorageUtils.forEachObjectInStorage({
				storage : this.oStorage,
				reference : "sap.ui.fl.test"
			}, function (mFlexObject) {
				mFlexObject.changeDefinition.name += "called";
				this.oStorage[mFlexObject.key] = (JSON.stringify(mFlexObject.changeDefinition));
			}.bind(this))
			.then(function () {
				parseAndAssertProperty(this.oStorage, this.sChangeKey1, "name", "change1called", "the callback was called and the value was changed", assert);
				parseAndAssertProperty(this.oStorage, this.sChangeKey2, "name", "change2", "the callback was not called", assert);
				parseAndAssertProperty(this.oStorage, this.sVariantKey1, "name", "variant1", "the callback was not called", assert);
				parseAndAssertProperty(this.oStorage, this.sVariantKey2, "name", "variant2", "the callback was not called", assert);
				parseAndAssertProperty(this.oStorage, "foo", "name", "bar", "the value was not changed", assert);
				parseAndAssertProperty(this.oStorage, "bar", "name", "foobar", "the value was not changed", assert);
			}.bind(this));
		});

		QUnit.test("forEachObjectInStorage with various changes and variants with layer", function(assert) {
			return ObjectStorageUtils.forEachObjectInStorage({
				storage: this.oStorage,
				layer: Layer.USER
			}, function(mFlexObject) {
				mFlexObject.changeDefinition.name += "called";
				this.oStorage[mFlexObject.key] = (JSON.stringify(mFlexObject.changeDefinition));
			}.bind(this))
			.then(function () {
				parseAndAssertProperty(this.oStorage, this.sChangeKey1, "name", "change1called", "the callback was called and the value was changed", assert);
				parseAndAssertProperty(this.oStorage, this.sChangeKey2, "name", "change2called", "the callback was called and the value was changed", assert);
				parseAndAssertProperty(this.oStorage, this.sVariantKey1, "name", "variant1", "the callback was not called", assert);
				parseAndAssertProperty(this.oStorage, this.sVariantKey2, "name", "variant2", "the callback was not called", assert);
				parseAndAssertProperty(this.oStorage, "foo", "name", "bar", "the value was not changed", assert);
				parseAndAssertProperty(this.oStorage, "bar", "name", "foobar", "the value was not changed", assert);
			}.bind(this));
		});

		QUnit.test("forEachObjectInStorage with various changes and variants with layer + reference", function(assert) {
			return ObjectStorageUtils.forEachObjectInStorage({
				storage: this.oStorage,
				reference: "sap.ui.fl.test.2",
				layer: Layer.CUSTOMER
			}, function(mFlexObject) {
				mFlexObject.changeDefinition.name += "called";
				this.oStorage[mFlexObject.key] = (JSON.stringify(mFlexObject.changeDefinition));
			}.bind(this))
			.then(function () {
				parseAndAssertProperty(this.oStorage, this.sChangeKey1, "name", "change1", "the callback was not called", assert);
				parseAndAssertProperty(this.oStorage, this.sChangeKey2, "name", "change2", "the callback was not called", assert);
				parseAndAssertProperty(this.oStorage, this.sVariantKey1, "name", "variant1called", "the callback was called and the value was changed", assert);
				parseAndAssertProperty(this.oStorage, this.sVariantKey2, "name", "variant2", "the callback was not called", assert);
				parseAndAssertProperty(this.oStorage, "foo", "name", "bar", "the value was not changed", assert);
				parseAndAssertProperty(this.oStorage, "bar", "name", "foobar", "the value was not changed", assert);
			}.bind(this));
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
