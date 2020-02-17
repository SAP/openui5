/*global QUnit */
sap.ui.define(["sap/base/util/ObjectPath"], function(ObjectPath) {
	"use strict";

	QUnit.module("sap.base.util.ObjectPath");

	QUnit.test("create object", function(assert) {
		var oBase = {};

		assert.deepEqual(ObjectPath.create("my1.pack.age", oBase), oBase.my1.pack.age, "should be created");
		assert.deepEqual(oBase.my1.pack.age, {}, "should exist now");

		assert.deepEqual(ObjectPath.create("my2.pack.age", oBase), oBase.my2.pack.age, "should be created");
		assert.deepEqual(oBase.my2.pack.age, {}, "should exist now");

		assert.deepEqual(ObjectPath.create("my2.pack.age2", oBase), oBase.my1.pack.age, "should be created");
		assert.deepEqual(oBase.my2.pack.age2, {}, "should exist now");
	});

	QUnit.test("create object (values already exist)", function(assert) {
		var fnTest = function(oBase, sPath, vValueToCheck, vExpectedValue, sPathError) {
			assert.throws(
				function() {
					ObjectPath.create(sPath, oBase);
				},
				new Error("Could not set object-path for '" + sPath + "', path segment '" + sPathError + "' already exists."),
				"could not be created"
			);
			assert.strictEqual(vValueToCheck, vExpectedValue, "should not be changed");
		};

		var oBase = {
			my1: { pack: 1 },
			my2: { pack: false },
			my3: { pack: null },
			my4: { pack: true },
			my5: { pack: "" },
			my6: { pack: "somestring" }
		};

		fnTest(oBase, "my1.pack", oBase.my1.pack, 1, "pack");
		fnTest(oBase, "my2.pack", oBase.my2.pack, false, "pack");
		fnTest(oBase, "my3.pack", oBase.my3.pack, null, "pack");
		fnTest(oBase, "my4.pack", oBase.my4.pack, true, "pack");
		fnTest(oBase, "my5.pack", oBase.my5.pack, "", "pack");
		fnTest(oBase, "my6.pack", oBase.my6.pack, "somestring", "pack");
	});

	QUnit.test("create object (names as array)", function(assert) {
		var oBase = {};

		assert.deepEqual(ObjectPath.create(["my1", "pack", "age"], oBase),  oBase.my1.pack.age, "should be created");
		assert.deepEqual(oBase.my1.pack.age, {}, "should exist now");

		assert.deepEqual(ObjectPath.create(["my2", "pack", "age"], oBase), oBase.my2.pack.age, "should be created");
		assert.deepEqual(oBase.my2.pack.age, {}, "should exist now");

		assert.deepEqual(ObjectPath.create(["my2", "pack", "age2"], oBase), oBase.my2.pack.age2, "should be created");
		assert.deepEqual(oBase.my2.pack.age2, {}, "should exist now");
	});

	QUnit.test("get property", function(assert) {
		var oBase = {
			"my": {
				"pack": {
					"age1": {},
					"age2": false,
					"age3": null,
					"age4": undefined,
					"age5": 0
				},
				"test1": 1,
				"test2": true,
				"test3": "safd",
				"test4": NaN
			}
		};

		assert.deepEqual(ObjectPath.get("my.pack.age1", oBase), {}, "should exist");
		assert.strictEqual(ObjectPath.get("my.pack.age2", oBase), false, "should exist");
		assert.strictEqual(ObjectPath.get("my.pack.age3", oBase), null, "should exist");
		assert.strictEqual(ObjectPath.get("my.pack.age4", oBase), undefined, "should exist");
		assert.strictEqual(ObjectPath.get("my.pack.age5", oBase), 0, "should exist");
		assert.strictEqual(ObjectPath.get("my.test1", oBase), 1, "should exist");
		assert.strictEqual(ObjectPath.get("my.test2", oBase), true, "should exist");
		assert.strictEqual(ObjectPath.get("my.test3", oBase), "safd", "should exist");
		assert.deepEqual(ObjectPath.get("my.test4", oBase), NaN, "should exist");

		assert.strictEqual(ObjectPath.get("my.pack.list", oBase), undefined, "should not exist");
		assert.strictEqual(ObjectPath.get("my.pack.age1.some", oBase), undefined, "should not exist");
		assert.strictEqual(ObjectPath.get("my.pack.age2.other", oBase), undefined, "should not exist");
	});

	QUnit.test("get property (names as array)", function(assert) {
		var oBase = {
			"my": {
				"pack": {
					"age1": {},
					"age2": false,
					"age3": null,
					"age4": undefined,
					"age5": 0
				},
				"test1": 1,
				"test2": true,
				"test3": "safd",
				"test4": NaN
			}
		};

		assert.deepEqual(ObjectPath.get(["my", "pack", "age1"], oBase), {}, "should exist");
		assert.strictEqual(ObjectPath.get(["my", "pack", "age2"], oBase), false, "should exist");
		assert.strictEqual(ObjectPath.get(["my", "pack", "age3"], oBase), null, "should exist");
		assert.strictEqual(ObjectPath.get(["my", "pack", "age4"], oBase), undefined, "should exist");
		assert.strictEqual(ObjectPath.get(["my", "pack", "age5"], oBase), 0, "should exist");
		assert.strictEqual(ObjectPath.get(["my", "test1"], oBase), 1, "should exist");
		assert.strictEqual(ObjectPath.get(["my", "test2"], oBase), true, "should exist");
		assert.strictEqual(ObjectPath.get(["my", "test3"], oBase), "safd", "should exist");
		assert.deepEqual(ObjectPath.get(["my", "test4"], oBase), NaN, "should exist");

		assert.strictEqual(ObjectPath.get(["my", "pack", "list"], oBase), undefined, "should not exist");
		assert.strictEqual(ObjectPath.get(["my", "pack", "age1", "some"], oBase), undefined, "should not exist");
		assert.strictEqual(ObjectPath.get(["my", "pack", "age2", "other"], oBase), undefined, "should not exist");
	});

	QUnit.test("set property", function(assert) {
		var oBase = {
			"my": {
				"pack": {
					"age": {},
					"func": function () {}
				}
			}
		};

		var oObject = {};
		ObjectPath.set("my.pack.object", oObject, oBase);
		assert.strictEqual(oBase.my.pack.object, oObject, "should exist");

		ObjectPath.set("my.pack.age", "someProperty", oBase);
		assert.strictEqual(oBase.my.pack.age, "someProperty", "should exist");

		ObjectPath.set("my.pack.age", "someOtherProperty", oBase);
		assert.strictEqual(oBase.my.pack.age, "someOtherProperty", "should exist");

		ObjectPath.set("some.other.path", "test123", oBase);
		assert.strictEqual(oBase.some.other.path, "test123", "should exist");

		ObjectPath.set("my.pack.list1", false, oBase);
		assert.strictEqual(oBase.my.pack.list1, false, "should exist");

		ObjectPath.set("my.pack.list2", null, oBase);
		assert.strictEqual(oBase.my.pack.list2, null, "should exist");

		ObjectPath.set("my.pack.list3", undefined, oBase);
		assert.strictEqual(oBase.my.pack.list3, undefined, "should be undefined");

		ObjectPath.set("my.pack.list4", 0, oBase);
		assert.strictEqual(oBase.my.pack.list4, 0, "should exist");

		ObjectPath.set("my.pack.et1", true, oBase);
		assert.strictEqual(oBase.my.pack.et1, true, "should exist");

		ObjectPath.set("my.pack.et2", 1, oBase);
		assert.strictEqual(oBase.my.pack.et2, 1, "should exist");

		ObjectPath.set("my.pack.func.tion", "function property", oBase);
		assert.strictEqual(oBase.my.pack.func.tion, "function property", "should exist");
	});

	QUnit.test("set property", function(assert) {
		var oBase = {
			"my": {
				"pack": {
					"age": {}
				}
			}
		};

		var oObject = {};
		ObjectPath.set(["my", "pack", "object"], oObject, oBase);
		assert.strictEqual(oBase.my.pack.object, oObject, "should exist");

		ObjectPath.set(["my", "pack", "age"], "someProperty", oBase);
		assert.strictEqual(oBase.my.pack.age, "someProperty", "should exist");

		ObjectPath.set(["my", "pack", "age"], "someOtherProperty", oBase);
		assert.strictEqual(oBase.my.pack.age, "someOtherProperty", "should exist");

		ObjectPath.set(["some", "other", "path"], "test123", oBase);
		assert.strictEqual(oBase.some.other.path, "test123", "should exist");

		ObjectPath.set(["my", "pack", "list1"], false, oBase);
		assert.strictEqual(oBase.my.pack.list1, false, "should exist");

		ObjectPath.set(["my", "pack", "list2"], null, oBase);
		assert.strictEqual(oBase.my.pack.list2, null, "should exist");

		ObjectPath.set(["my", "pack", "list3"], undefined, oBase);
		assert.strictEqual(oBase.my.pack.list3, undefined, "should be undefined");

		ObjectPath.set(["my", "pack", "list4"], 0, oBase);
		assert.strictEqual(oBase.my.pack.list4, 0, "should exist");

		ObjectPath.set(["my", "pack", "et1"], true, oBase);
		assert.strictEqual(oBase.my.pack.et1, true, "should exist");

		ObjectPath.set(["my", "pack", "et2"], 1, oBase);
		assert.strictEqual(oBase.my.pack.et2, 1, "should exist");
	});

	QUnit.test("set property should not mutate parts array", function(assert) {
		var oBase = {
			"my": {
				"pack": {
					"age": {}
				}
			}
		};

		var oObject = {};
		var aParts = ["my", "pack", "object"];
		var aPartsCopy = aParts.slice();

		ObjectPath.set(aParts, oObject, oBase);
		assert.strictEqual(oBase.my.pack.object, oObject, "should exist");
		assert.deepEqual(aParts, aPartsCopy, "parts array is the same");
	});
});
