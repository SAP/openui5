/* global QUnit */
sap.ui.define([
	"sap/ui/base/Metadata",
	"sap/ui/base/Object"
], function(Metadata, BaseObject) {
	"use strict";

	// define new type for testing
	var TestClass = BaseObject.extend("sap.ui.test.TestClass", {
		metadata : {
			library : "sap.ui.test",
			publicMethods : ["a1", "a2", "a2"]	// duplicate present
		}
	});

	QUnit.module("Basic");

	QUnit.test("Lazy calculation of public method name uniqueness", function(assert) {
		var testObj = new TestClass();
		var metaData = testObj.getMetadata();

		// initial state checks
		assert.ok(!metaData._bInterfacesUnique, "dirty flag must be set");
		assert.deepEqual(metaData._aPublicMethods, ["a1", "a2", "a2"], "duplicates must be present before getting");

		// get public methods and assert correctness
		assert.deepEqual(metaData.getAllPublicMethods(), ["a1", "a2"], "obj must have 2 public methods");
		assert.ok(metaData._bInterfacesUnique, "dirty flag must be cleared");
	});

	QUnit.test("Lazy calculation of public method name uniqueness after addition", function(assert) {
		var testObj = new TestClass();
		var metaData = testObj.getMetadata();

		// initial state checks
		assert.deepEqual(metaData.getAllPublicMethods(), ["a1", "a2"], "obj must have 2 public methods");
		assert.ok(metaData._bInterfacesUnique, "dirty flag must be cleared");

		// add a duplicate and non-duplicate method name
		metaData.addPublicMethods(["a2", "a3"]);
		assert.deepEqual(metaData.getAllPublicMethods(), ["a1", "a2", "a3"], "obj must have 3 public methods");
		assert.ok(metaData._bInterfacesUnique, "dirty flag must be cleared");

		// add a duplicate and non-duplicate method name as arguments
		metaData.addPublicMethods("a3", "a4");
		assert.deepEqual(metaData.getAllPublicMethods(), ["a1", "a2", "a3", "a4"], "obj must have 4 public methods");
		assert.ok(metaData._bInterfacesUnique, "dirty flag must be cleared");
	});

});
