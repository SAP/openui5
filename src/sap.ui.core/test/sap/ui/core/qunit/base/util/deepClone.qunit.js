/*!
 * ${copyright}
 */
/*global QUnit */
sap.ui.define(['sap/base/util/deepClone', 'sap/ui/core/Control'], function(deepClone, Control) {
	"use strict";

	var Dummy = Control.extend("sap.ui.deepClone.Dummy",{
		metadata: {
			properties: {
				test: {
					type: "string"
				}
			}
		}
	});

	/**
	 * Checks whether a given test object is primitive
	 * @param test the test object
	 * @returns {boolean} <code>true</code> if the object is of primitive type
	 */
	function isPrimitive(test) {
		return test === Object(test);

	}

	/**
	 * Checks if two objects that are already verified to be deep equal have different references
	 * thus we can assume that each part, especially arrays have the same length
	 *
	 * @param src the original object
	 * @param clone the clone reference
	 * @returns {boolean} <code>true</code> if the references are different
	 * <code>false</code> else
	 */
	function checkOtherReference(src,clone) {
		if (!isPrimitive(src)) {
			if (src instanceof Date) {
				return src !== clone;
			} else if (Array.isArray(src)) {
				for (var i = 0; i < src.length; i++) {
					if (!checkOtherReference(src[i], clone[i])) {
						return false;
					}
				}
			} else if (typeof src === "object") {
				for (var key in src) {
					if (!checkOtherReference(src[key], clone[key])) {
						return false;
					}
				}
			}
		}

		return true;
	}

	QUnit.module("sap.base.util.deepClone");

	QUnit.test("basic test", function(assert) {
		assert.equal(deepClone(0), 0, "number");
		assert.equal(deepClone(true), true, "boolean");
		assert.equal(deepClone("test"), "test", "string");
		assert.deepEqual(deepClone([1, 2]), [1, 2], "array");
		assert.deepEqual(deepClone({a:1, b:2}), {a:1, b:2}, "object");
		assert.equal(deepClone(null), null, "null");
		assert.equal(deepClone(undefined), undefined, "undefined");
		assert.deepEqual(deepClone(new Date('1995-12-17T03:24:00.123')), new Date('1995-12-17T03:24:00.123'), "Date");
	});

	QUnit.test("UI5Date", function(assert) {
		var oUI5Date = new Date();

		oUI5Date.clone = function () {}; // sap.ui.core.date.UI5Date has specific clone method
		this.mock(oUI5Date).expects("clone").withExactArgs().returns("~clonedDate");

		assert.strictEqual(deepClone(oUI5Date), "~clonedDate");
	});

	QUnit.test("string test", function(assert) {
		assert.equal(deepClone("test"), "test", "\"test\", \"test\"");
		assert.equal(deepClone(""), "", "\"\", \"\"");
	});

	QUnit.test("array", function(assert) {
		var src = [1, 2];
		var clone = deepClone(src);
		assert.deepEqual(src, clone, "Deep cloning [1, 2] leads to [1, 2]");
		assert.equal(checkOtherReference(src,clone), true, "But the objects have different references");

		src = []; clone = deepClone(src);
		assert.deepEqual(src, clone, "Deep cloning [] leads to []");
		assert.equal(checkOtherReference(src,clone), true, "But the objects have different references");

		src = [undefined]; clone = deepClone(src);
		assert.deepEqual(src, clone, "Deep cloning [undefined] leads to [undefined]");
		assert.equal(checkOtherReference(src,clone), true, "But the objects have different references");

		src = [ {
			hugo: "is a",
			real: "deep",
			"array": ['as', "you"]
		}, {
			can: "see",
			so: {
				deep: [42],
				could: "ever be"
			}
		}];
		clone = deepClone(src);
		assert.deepEqual(src, clone, "Arrays that contain objects are clone");
		assert.equal(checkOtherReference(src,clone), true, "But the objects have different references");
	});

	QUnit.test("object", function(assert) {
		var src = {a:1, b:2};
		var clone = deepClone(src);
		assert.deepEqual(src, clone, "{a:1, b:2}, {a:1, b:2}");
		assert.equal(checkOtherReference(src,clone), true, "But the objects have different references");

		src = {a:1, b:NaN}; clone = deepClone(src);
		assert.deepEqual(src, clone, "{a:1, b:NaN}, {b:NaN, a:1}");
		assert.equal(checkOtherReference(src,clone), true, "But the objects have different references");

		src = {}; clone = deepClone(src);
		assert.deepEqual(src, clone, "{}, {}");
		assert.equal(checkOtherReference(src,clone), true, "But the objects have different references");

		src = {a: undefined}; clone = deepClone(src);
		assert.deepEqual(src, clone, "{a: undefined}, {a: undefined}");
		assert.equal(checkOtherReference(src,clone), true, "But the objects have different references");
	});

	QUnit.test("recursion", function(assert) {
		var src, clone;
		src = []; src[0] = src;
		clone = [[src]];
		assert.throws(function() { deepClone(src,3); }, "The maximal depth is exceeded");
		src = {j: 1};
		src.a = src; clone = { a: src, j: 1};
		assert.throws(function() { deepClone(src); }, "The maximal depth is exceeded");
		src = [[[[[[[[[[[0]]]]]]]]]]];
		clone = [[[[[[[[[[[0]]]]]]]]]]];
		assert.deepEqual(deepClone(src, 20), clone, "deep array");
		src = {a:{a:{a:{a:{a:{a:{a:{a:{a:{a:{a:0}}}}}}}}}}};
		clone = {a:{a:{a:{a:{a:{a:{a:{a:{a:{a:{a:0}}}}}}}}}}};
		assert.deepEqual(deepClone(src, 20), clone, "deep object");
	});

	QUnit.test("no clone managed object or promise", function(assert) {
		var oPromise = new Promise(function(resolve,reject) {
			var a = 3;
			if (a > 4) {
				reject();
			} else {
				resolve();
			}
		});

		assert.throws(function() { deepClone(oPromise); }, "Error only plain objects are cloned");

		var oDummy = new Dummy({ text: "Do not clone"});

		assert.throws(function() { deepClone(oDummy); }, "Error only plain objects are cloned");
	});

	QUnit.test("deepClone Object.prototype pollution", function(assert) {
		var src = JSON.parse('{"__proto__": {"x":42}}');
		var clone = deepClone(src);

		assert.ok(!("x" in clone.__proto__), "__proto__ not cloned"); // eslint-disable-line no-proto
		assert.ok(!("x" in {}), "Object.prototype not polluted");
	});
});
