/* global QUnit */

sap.ui.define(["jquery.sap.script", "sap/base/util/isEmptyObject"], function(jQuery, isEmptyObject) {
	"use strict";

	var DELAY = 200;

	var myObject = {};
	myObject.myFunction = function(param1, param2) {
		QUnit.assert.equal(this, myObject, "this should be 'myObject'");
		QUnit.assert.equal(param1, "myParam1", "param1 should be 'myParam1'");
		QUnit.assert.equal(param2, undefined, "param2 should not be defined");
	};

	function globalFunction(param1, param2) {
		QUnit.assert.equal(param1, "myParam1", "param1 should be 'myParam1'");
		QUnit.assert.equal(param2, undefined, "param2 should not be defined");
	}
	window.globalFunction = globalFunction;

	// custom assertion
	QUnit.assert.equalSets = function(a1,a2,message) {
		this.ok(a1 === a2 || (!!a1 && !!a2), "array either both must be null or both not null");
		if ( a1 && a2 ) {
			a1 = a1.slice().sort();
			a2 = a2.slice().sort();
			this.deepEqual(a1,a2, message);
		}
	};

	// -------------------------------------------------------------------------------
	// delayedCall
	// -------------------------------------------------------------------------------

	QUnit.module("jQuery.sap.delayedCall");

	QUnit.test("with function name", function(assert) {
		assert.expect(3);
		jQuery.sap.delayedCall(DELAY, myObject, "myFunction", ["myParam1"]);

		var done = assert.async();
		setTimeout(function() {
			done();
		}, DELAY * 2);
	});

	QUnit.test("with function pointer", function(assert) {
		assert.expect(3);
		jQuery.sap.delayedCall(DELAY, myObject, myObject.myFunction, ["myParam1"]);

		var done = assert.async();
		setTimeout(function() {
			done();
		}, DELAY * 2);
	});

	QUnit.test("with function name for global function", function(assert) {
		assert.expect(2);
		jQuery.sap.delayedCall(DELAY, window, "globalFunction", ["myParam1"]);

		var done = assert.async();
		setTimeout(function() {
			done();
		}, DELAY * 2);
	});

	QUnit.test("with function pointer for global function", function(assert) {
		assert.expect(2);
		jQuery.sap.delayedCall(DELAY, window, globalFunction, ["myParam1"]);

		var done = assert.async();
		setTimeout(function() {
			done();
		}, DELAY * 2);
	});

	// -------------------------------------------------------------------------------
	// clearDelayedCall
	// -------------------------------------------------------------------------------

	QUnit.module("jQuery.sap.clearDelayedCall");

	QUnit.test("with function name", function(assert) {
		assert.expect(1); // delayed function may not be called, only the ok check here
		var callId = jQuery.sap.delayedCall(DELAY, myObject, "myFunction", ["myParam1"]);

		var done = assert.async();
		setTimeout(function() {
			jQuery.sap.clearDelayedCall(callId);
			setTimeout(function() {
				assert.ok(true, "dummy check - only this one may be executed");
				done();
			}, DELAY * 2);
		}, Math.floor(DELAY / 2));
	});

	QUnit.test("with function pointer", function(assert) {
		assert.expect(1); // delayed function may not be called, only the ok check here
		var callId = jQuery.sap.delayedCall(DELAY, myObject, myObject.myFunction, ["myParam1"]);

		var done = assert.async();
		setTimeout(function() {
			jQuery.sap.clearDelayedCall(callId);
			setTimeout(function() {
				assert.ok(true, "dummy check - only this one may be executed");
				done();
			}, DELAY * 2);
		}, Math.floor(DELAY / 2));
	});


	// -------------------------------------------------------------------------------
	// intervalCall
	// -------------------------------------------------------------------------------

	QUnit.module("jQuery.sap.intervalCall");

	QUnit.test("with function name, one iteration", function(assert) {
		assert.expect(3);
		var callId = jQuery.sap.intervalCall(DELAY, myObject, "myFunction", ["myParam1"]);

		var done = assert.async();
		setTimeout(function() {
			jQuery.sap.clearIntervalCall(callId);
			setTimeout(function() {
				done();
			}, DELAY * 2);
		}, Math.round(DELAY * 1.5));
	});
	/* these tests are very unreliable on central build and do not add a lot of value
				QUnit.test("with function name, two iterations", function(assert) {
					assert.expect(4);
					var callId = jQuery.sap.intervalCall(DELAY, myObject, "myFunction", ["myParam1"]);

					var done = assert.async();
					setTimeout(function() {
						jQuery.sap.clearIntervalCall(callId);
						setTimeout(function() {
							done();
						}, DELAY * 2);
					}, Math.round(DELAY * 2.5));
				});

				QUnit.test("with function name, six iterations", function(assert) {
					assert.expect(12);
					var callId = jQuery.sap.intervalCall(DELAY, myObject, "myFunction", ["myParam1"]);

					var done = assert.async();
					setTimeout(function() {
						jQuery.sap.clearIntervalCall(callId);
						setTimeout(function() {
						done();
						}, DELAY * 2);
					}, Math.round(DELAY * 6.5));
				});
	*/

	QUnit.test("with function pointer, two iterations", function(assert) {
		assert.expect(6);
		var callId = jQuery.sap.intervalCall(DELAY, myObject, myObject.myFunction, ["myParam1"]);

		var done = assert.async();
		setTimeout(function() {
			jQuery.sap.clearIntervalCall(callId);
			setTimeout(function() {
				done();
			}, DELAY * 2);
		}, Math.round(DELAY * 2.5));
	});


	// -------------------------------------------------------------------------------
	// URIParams
	// -------------------------------------------------------------------------------

	QUnit.module("jQuery.sap.getUriParameters");

	QUnit.test("empty query string", function(assert) {
		assert.expect(1);
		var oParams = jQuery.sap.getUriParameters("/service");
		assert.equal(Object.keys(oParams.mParams).length, 0);
	});

	QUnit.test("a single parameter", function(assert) {
		var oParams = jQuery.sap.getUriParameters("/service?x=1");
		assert.deepEqual(oParams.get('x',true), ['1']);
	});

	QUnit.test("multiple different parameters with different types", function(assert) {
		var oParams = jQuery.sap.getUriParameters("/service?x=1&y=2&z=true&@=test");
		assert.deepEqual(oParams.get('x',true), ['1']);
		assert.deepEqual(oParams.get('y',true), ['2']);
		assert.deepEqual(oParams.get('z',true), ['true']);
		assert.deepEqual(oParams.get('@',true), ['test']);
	});

	QUnit.test("URL with a hash", function(assert) {
		var oParams = jQuery.sap.getUriParameters("/service?x=1&y=#&z=test");
		assert.deepEqual(oParams.get('x',true), ['1'], "parameter before hash");
		assert.deepEqual(oParams.get('y',true), [""], "parameter without value, before hash");
		assert.deepEqual(oParams.get('z',true), [], "parameter after hash");
	});

	QUnit.test("URL with multiple values for a single name", function(assert) {
		var oParams = jQuery.sap.getUriParameters("/service?addin=1&addin=2&addin=3");
		assert.deepEqual(oParams.get('addin',true), ['1','2','3'], "param with multiple values");
	});

	QUnit.test("URL with param names from Object.prototype", function(assert) {
		var oParams = jQuery.sap.getUriParameters("/service?constructor=1&hasOwnProperty=2");
		assert.deepEqual(oParams.get('constructor',true), ['1'], "param with Object.prototype name");
		assert.deepEqual(oParams.get('hasOwnProperty',true), ['2'], "param with Object.prototype name");
	});

	QUnit.test("URL with encoded values or spaces", function(assert) {
		var oParams = jQuery.sap.getUriParameters("/service?key1=&key2&search=Rock+%26+Roll&rock%26roll=here+to+stay&weird=%26%CE%A8%E2%88%88");
		assert.deepEqual(oParams.get('key1',true), [''], "empty value with equals sign");
		assert.deepEqual(oParams.get('key2',true), [''], "empty  value");
		assert.deepEqual(oParams.get('rock&roll',true), ['here to stay'], "encoded key");
		assert.deepEqual(oParams.get('search',true), ['Rock & Roll'], "encoded value");
		assert.deepEqual(oParams.get('weird',true), ['&\u03A8\u2208'], "hex encoded value");
		//alert('&\u03A8\u2208');
	});

	// -------------------------------------------------------------------------------
	// getUID
	// -------------------------------------------------------------------------------

	QUnit.module("jQuery.sap.uid");

	QUnit.test("basic test", function(assert) {
		var myid = jQuery.sap.uid();
		assert.ok(myid);
	});

	// -------------------------------------------------------------------------------
	// hashCode
	// -------------------------------------------------------------------------------

	QUnit.module("hashCode");

	QUnit.test("empty string", function(assert) {
		var s = "";
		assert.equal(jQuery.sap.hashCode(s), 0, "empty string hash-code is 0");
	});

	QUnit.test("equality", function(assert) {
		var s = "Neque porro quisquam est qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit...";
		assert.strictEqual(jQuery.sap.hashCode(s), jQuery.sap.hashCode(s), "same string - same hash-code");
	});

	QUnit.test("inequality", function(assert) {
		var s = "Neque porro quisquam est qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit...";
		assert.notEqual(jQuery.sap.hashCode(s), jQuery.sap.hashCode(s + "."), "different string - different hash-code");
	});

	// -------------------------------------------------------------------------------
	// jQuery.sap.unique
	// -------------------------------------------------------------------------------

	QUnit.module("jQuery.sap.unique");

	QUnit.test("basic test", function(assert) {
		assert.deepEqual(jQuery.sap.unique(['a', 'b', 'c']), ['a', 'b', 'c'], "identity");
		assert.deepEqual(jQuery.sap.unique(['c', 'b', 'a']), ['a', 'b', 'c'], "resort");
		assert.deepEqual(jQuery.sap.unique(['c', 'c', 'b', 'a', 'c', 'b', 'a']), ['a', 'b', 'c'], "removal of duplicates");
		assert.deepEqual(jQuery.sap.unique(['a', 'a', 'a', 'a']), ['a'], "reduce to one");
		var a = ['c', 'c', 'b', 'a', 'c', 'b', 'a'];
		assert.deepEqual(jQuery.sap.unique(a), a,  "inplace");
		var a = ['a', 'b', 'c'];
		assert.deepEqual(jQuery.sap.unique(a), a, "inplace");
	});

	// -------------------------------------------------------------------------------
	// jQuery.sap.equal
	// -------------------------------------------------------------------------------

	QUnit.module("jQuery.sap.equal");

	QUnit.test("basic test", function(assert) {
		assert.equal(jQuery.sap.equal(0, 0), true, "number");
		assert.equal(jQuery.sap.equal(0, 1), false, "number");
		assert.equal(jQuery.sap.equal(true, true), true, "boolean");
		assert.equal(jQuery.sap.equal(true, false), false, "boolean");
		assert.equal(jQuery.sap.equal("test", "test"), true, "string");
		assert.equal(jQuery.sap.equal("foo", "bar"), false, "string");
		assert.equal(jQuery.sap.equal([1, 2], [1, 2]), true, "array");
		assert.equal(jQuery.sap.equal([1, 2], [1, 2, 3]), false, "array");
		assert.equal(jQuery.sap.equal({a:1, b:2}, {a:1, b:2}), true, "object");
		assert.equal(jQuery.sap.equal({a:1, b:2}, {b:1, c:2}), false, "object");
		assert.equal(jQuery.sap.equal(null, null), true, "null");
		assert.equal(jQuery.sap.equal(null, 0), false, "null");
		assert.equal(jQuery.sap.equal(undefined, undefined), true, "undefined");
		assert.equal(jQuery.sap.equal(undefined, null), false, "undefined");
		assert.equal(jQuery.sap.equal(new Date(234), new Date(234)), true, "Date");
		assert.equal(jQuery.sap.equal(new Date(234), new Date(2345)), false, "Date");

	});

	QUnit.test("contains test", function(assert) {
		assert.equal(jQuery.sap.equal([1, 2], [1, 2], true), true, "equal array");
		assert.equal(jQuery.sap.equal([1, 2], [2, 1], true), false, "different array");
		assert.equal(jQuery.sap.equal([1, 2], [1, 2, 3], true), true, "contained array");
		assert.equal(jQuery.sap.equal([1, 2, 3, 4], [1, 2, 3], true), false, "not contained array");
		assert.equal(jQuery.sap.equal({a:1, b:2}, {a:1, b:2}, true), true, "equal object");
		assert.equal(jQuery.sap.equal({a:1, b:2}, {a:2, b:1}, true), false, "different object values");
		assert.equal(jQuery.sap.equal({a:1, b:2}, {a:1, c:2}, true), false, "different property names");
		assert.equal(jQuery.sap.equal({a:1, b:2}, {a:1, b:2, c:3}, true), true, "contained object");
		assert.equal(jQuery.sap.equal({a:1, b:2, c:3, d:4}, {a:1, b:2, c:3}, true), false, "not contained object");
	});

	QUnit.test("boolean test", function(assert) {
		assert.equal(jQuery.sap.equal(true, true), true, "true, true");
		assert.equal(jQuery.sap.equal(true, false), false, "true, false");
		assert.equal(jQuery.sap.equal(false, true), false, "false, true");
		assert.equal(jQuery.sap.equal(false, false), true, "false, false");
		assert.equal(jQuery.sap.equal(false, 0), false, "false, 0");
		assert.equal(jQuery.sap.equal(false, null), false, "false, null");
		assert.equal(jQuery.sap.equal(false, "false"), false, "false, \"false\"");
		assert.equal(jQuery.sap.equal(false, []), false, "false, []");
	});

	QUnit.test("number test", function(assert) {
		assert.equal(jQuery.sap.equal(0, 0), true, "0, 0");
		assert.equal(jQuery.sap.equal(1, 0), false, "1, 0");
		assert.equal(jQuery.sap.equal(0, -1), false, "0, -1");
		assert.equal(jQuery.sap.equal(0xff, 255), true, "0xff, 255");
		assert.equal(jQuery.sap.equal(23, "23"), false, "23, \"23\"");
		assert.equal(jQuery.sap.equal(false, 0), false, "false, 0");
		assert.equal(jQuery.sap.equal(0, null), false, "0, null");
		assert.equal(jQuery.sap.equal(1, []), false, "1, []");
	});

	QUnit.test("string test", function(assert) {
		assert.equal(jQuery.sap.equal("test", "test"), true, "\"test\", \"test\"");
		assert.equal(jQuery.sap.equal("foo", "bar"), false, "\"foo\", \"bar\"");
		assert.equal(jQuery.sap.equal("test", ""), false, "\"test\", \"\"");
		assert.equal(jQuery.sap.equal("", ""), true, "\"\", \"\"");
		assert.equal(jQuery.sap.equal("", null), false, "\"\", null");
		assert.equal(jQuery.sap.equal("0", 0), false, "\"0\", 0");
		assert.equal(jQuery.sap.equal("{}", {}), false, "\"{}\", {}");
	});

	QUnit.test("array", function(assert) {
		assert.equal(jQuery.sap.equal([1, 2], [1, 2]), true, "[1, 2], [1, 2]");
		assert.equal(jQuery.sap.equal([1, 2], [2, 1]), false, "[1, 2], [2, 1]");
		assert.equal(jQuery.sap.equal([1, 2], [3, 4]), false, "[1, 2], [3, 4]");
		assert.equal(jQuery.sap.equal([1, 2], [1, 2, 3]), false, "[1, 2], [1, 2, 3]");
		assert.equal(jQuery.sap.equal([1, 2], []), false, "[1, 2], []");
		assert.equal(jQuery.sap.equal([], []), true, "[], []");
		assert.equal(jQuery.sap.equal([1, 2], {1:1, 2:2, length:2}), false, "[1, 2], {1:1, 2:2, length:2}");
		assert.equal(jQuery.sap.equal([undefined], [undefined]), true, "[undefined], [undefined]");


		assert.equal(jQuery.sap.equal([1, 2], [1, 2, 3], true), true, "[1, 2], [1, 2, 3], true");
		assert.equal(jQuery.sap.equal([1, 2, 3], [1, 2], true), false, "[1, 2, 3], [1, 2], true");
	});

	QUnit.test("object", function(assert) {
		assert.equal(jQuery.sap.equal({a:1, b:2}, {a:1, b:2}), true, "{a:1, b:2}, {a:1, b:2}");
		assert.equal(jQuery.sap.equal({a:1, b:2}, {b:2, a:1}), true, "{a:1, b:2}, {b:2, a:1}");
		assert.equal(jQuery.sap.equal({a:1, b:2}, {b:1, a:2}), false, "{a:1, b:2}, {b:1, a:2}");
		assert.equal(jQuery.sap.equal({a:1, b:2}, {a:1, b:2, c:3}), false, "{a:1, b:2}, {a:1, b:2, c:3}");
		assert.equal(jQuery.sap.equal({a:1, b:2}, {a:1}), false, "{a:1, b:2}, {a:1}");
		assert.equal(jQuery.sap.equal({a:1, b:2}, {}), false, "{a:1, b:2}, {}");
		assert.equal(jQuery.sap.equal({}, {}), true, "{}, {}");
		assert.equal(jQuery.sap.equal({1:1}, [1]), false, "{1:1}, [1]");
		assert.equal(jQuery.sap.equal({}, null), false, "{}, null");
		assert.equal(jQuery.sap.equal({a: undefined}, {a: undefined}), true, "{a: undefined}, {a: undefined}");

		assert.equal(jQuery.sap.equal({a:1, b:2}, {a:1, b:2, c:3}, true), true, "{a:1, b:2}, {a:1, b:2, c:3}, true");
		assert.equal(jQuery.sap.equal({a:1, b:2, c:3}, {a:1, b:2}, true), false, "{a:1, b:2, c:3}, {a:1, b:2}, true");
	});

	QUnit.test("recursion", function(assert) {
		var a = [], b = [];
		a[0] = a; b[0] = b;
		assert.equal(jQuery.sap.equal(a, b), false, "recursive array");
		a = {}; b = {};
		a.a = a; b.a = b;
		assert.equal(jQuery.sap.equal(a, b), false, "recursive object");
		a = [[[[[[[[[[[0]]]]]]]]]]];
		b = [[[[[[[[[[[0]]]]]]]]]]];
		assert.equal(jQuery.sap.equal(a, b), false, "deep array");
		assert.equal(jQuery.sap.equal(a, b, 100), true, "deep array");
		a = {a:{a:{a:{a:{a:{a:{a:{a:{a:{a:{a:0}}}}}}}}}}};
		b = {a:{a:{a:{a:{a:{a:{a:{a:{a:{a:{a:0}}}}}}}}}}};
		assert.equal(jQuery.sap.equal(a, b), false, "deep object");
		assert.equal(jQuery.sap.equal(a, b, 100), true, "deep object");
	});

	QUnit.test("DOM node", function(assert) {
		assert.equal(jQuery.sap.equal(document.createElement("div"), document.createElement("div")), true, "div, div");
		assert.equal(jQuery.sap.equal(document.createElement("div"), document.createElement("span")), false, "div, span");
		assert.equal(jQuery.sap.equal(document.createElement("div"), { nodeName: true, namespaceURI: true }), false, "div, fake node");
		assert.equal(jQuery.sap.equal(document.createElement("div"), true), false, "div, true");
		assert.equal(jQuery.sap.equal(document.createElement("div"), 1), false, "div, 1");
		assert.equal(jQuery.sap.equal(document.createElement("div"), "div"), false, "div, \"div\"");

		function createDivWithSpan(spanText) {
			var div = document.createElement("div");
			var span = document.createElement("span");
			span.innerText = spanText;
			div.appendChild(span);
			return div;
		}

		assert.equal(jQuery.sap.equal(createDivWithSpan("foo"), createDivWithSpan("foo")), true, "div (/w span), div (/w span)");
		assert.equal(jQuery.sap.equal(createDivWithSpan("foo"), createDivWithSpan("bar")), false, "div (/w span), div (/w span)");
		assert.equal(jQuery.sap.equal(createDivWithSpan("foo"), document.createElement("div")), false, "div (/w span), div");
	});

	// -------------------------------------------------------------------------------
	// jQuery.sap.each
	// -------------------------------------------------------------------------------

	QUnit.module("jQuery.sap.each");

	function testEach(assert, obj) {

		var	keys = [],
			values = [],
			result;

		function callback(i,v) {
			assert.ok(v == null || this == v, "context in the callback should be equal to the current item"); // simple equal, not strict equal due to object wrapping!
			keys.push(i);
			values.push(v);
		}

		result = jQuery.sap.each(obj, callback);

		assert.equal(result, obj, "return value should be the same as the given obj");

		return { keys : keys, values : values };

	}

	QUnit.test("dense array", function(assert) {
		var obj = ["a", "b", "c"];
		var result = testEach(assert, obj);
		assert.deepEqual(result.keys, [0,1,2], "keys should be the numeric indices");
		assert.deepEqual(result.values, ["a", "b", "c"], "values should match the array content");
	});

	QUnit.test("sparse array", function(assert) {
		var obj = [];
		obj.push("a");
		obj[5] = "c";
		obj[3] = "b";
		var result = testEach(assert, obj);
		assert.deepEqual(result.keys, [0, 1, 2, 3, 4, 5], "for sparse arrays, the keys should match the array length");
		assert.deepEqual(result.values, ["a", undefined, undefined, "b", undefined, "c"], "for sparse arrays, missing entries should be undefined");

	});

	QUnit.test("object with identifier properties", function(assert) {
		var obj = {a:"a", b:"b", c:"c"};
		var result = testEach(assert, obj);
		assert.deepEqual(result.keys, ["a","b","c"], "for objects, the keys should be the property names");
		assert.deepEqual(result.values, ["a", "b", "c"], "for objects, the iterated values should match the property values");
	});

	QUnit.test("object with out of order identifier properties", function(assert) {
		var obj = {z:"a", c:"b", m:"c"};
		var result = testEach(assert, obj);
		assert.deepEqual(result.keys, ["z","c","m"], "for objects, the keys should be the property names");
		assert.deepEqual(result.values, ["a", "b", "c"], "for objects, the iterated values should match the property values, order should match the order of creation");
	});

	QUnit.test("object with string literal properties", function(assert) {
		var obj = {"a a":"a", "b b":"b", "c c":"c"};
		var result = testEach(assert, obj);
		assert.deepEqual(result.keys, ["a a","b b","c c"], "for objects, the keys should be the property names");
		assert.deepEqual(result.values, ["a", "b", "c"], "for objects, the iterated values should match the property values");
	});

	QUnit.test("object with ordered num properties but w/o length", function(assert) {
		var obj = {1:"a", 2:"b", 3:"c"};
		var result = testEach(assert, obj);
		assert.deepEqual(result.keys, ["1","2","3"], "for objects, the keys should be the property names");
		assert.deepEqual(result.values, ["a", "b", "c"], "for objects, the iterated values should match the property values");
	});

	QUnit.test("object with out of order num properties and w/o length", function(assert) {
		var obj = {};
		obj[0] = "a";
		obj[5] = "c";
		obj[3] = "b";
		var result = testEach(assert, obj);
		assert.equalSets(result.keys, ["0", "5", "3"], "for objects, the keys should match the property names");
		assert.equalSets(result.values, ["a", "c", "b"], "for objects, the values should match the property values");
	});

	QUnit.test("object with num properties and with matching length", function(assert) {
		var obj = { length:3, 2:"c", 1:"b", 0:"a" };
		var result = testEach(assert, obj);
		assert.equalSets(result.keys, ["length", "2", "1", "0" ], "for objects, the keys should match the property names");
		assert.equalSets(result.values, [3, "c", "b", "a"], "for objects, the order of values should match the order of entries");
	});

	QUnit.test("object with num properties and with non-matching length", function(assert) {
		var obj = { length:5, 2:"c", 1:"b", 0:"a" };
		var result = testEach(assert, obj);
		assert.equalSets(result.keys, ["length", "2", "1", "0" ], "for objects, the keys should match the property names");
		assert.equalSets(result.values, [5, "c", "b", "a"], "for objects, the order of values should match the order of entries");
	});

	// -------------------------------------------------------------------------------
	// jQuery.sap.forIn
	// -------------------------------------------------------------------------------

	QUnit.module("jQuery.sap.forIn");

	QUnit.test("simple", function(assert) {

		function forInKeys(o) {
			var keys = [];
			jQuery.sap.forIn(o, function(n,v) { keys.push(n); });
			return keys;
		}

		assert.equalSets(forInKeys({ a:0, b:1, c:3 }), ["a", "b", "c"], "key sets for simple objects should match");
		assert.equalSets(forInKeys({ a:0, b:1, toString:function(){return "aa";} }), ["a", "b", "toString"], "key sets for simple objects should match");

	});


	// -------------------------------------------------------------------------------
	// jQuery.sap.arrayDiff
	// -------------------------------------------------------------------------------

	QUnit.module("jQuery.sap.arrayDiff");

	QUnit.test("arrayDiff", function(assert) {
		var aData1 = [1,2,3,4,5];
		var aData2 = [1,4,5,6,7];
		var aData3 = [1,6,7,4,5];
		var aData4 = [1,6,7,2,3];
		var aData5 = [3,4,5,6,7];
		var aData6 = [4,5,7];
		// var aData7 = [9,8,4,4,3,2,9]; // currently not used
		var aData8 = [1,4,5,2,3];
		var aData9 = [1,7,8,9,2,3,4,5];
		var aData10 = [5,4,3,2,1];
		var aData11 = [];
		var aData12 = [1,3,2,5,4];
		var aData13 = [1,2,3,3,3,4,5];
		var aData14 = [3,3,2,1,3,4,5];
		var aData15 = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28];
		var aData16 = [3,18,29,30,31,32,33,34,35,36,37];
		var aData17 = [1,2,1,2,1];
		var aData18 = [2,1,2,1,2];
		var aData19 = [1,2,3,4,5,6];
		var aData20 = [1,2,3,4,2,6];
		var aData21 = [1,2,3,4,5,1];
		var aData22 = [8,1,3,1,7,2,6,3,6,9];
		var aData23 = [1,9,7,1,5,9,1,9,9,6];
		var aData24 = [1,2,3,4,2,6,2];
		var aDiff;

		aDiff = [
			{ index: 1, type: 'insert' },
			{ index: 2, type: 'insert' },
			{ index: 3, type: 'insert' },
			{ index: 4, type: 'insert' },
			{ index: 5, type: 'insert' },
			{ index: 8, type: 'delete' },
			{ index: 8, type: 'delete' }
		];
		assert.deepEqual(jQuery.sap.arrayDiff(aData8, aData9), aDiff, "diff between data 8 and 9");

		aDiff = [
			{ index: 1, type: 'delete' },
			{ index: 1, type: 'delete' },
			{ index: 3, type: 'insert' },
			{ index: 4, type: 'insert' }
		];
		assert.deepEqual(jQuery.sap.arrayDiff(aData1, aData2), aDiff, "diff between data 1 and 2");

		aDiff = [
			{ index: 1, type: 'delete' },
			{ index: 1, type: 'delete' },
			{ index: 1, type: 'insert' },
			{ index: 2, type: 'insert' }
		];
		assert.deepEqual(jQuery.sap.arrayDiff(aData1, aData3), aDiff, "diff between data 1 and 3");

		aDiff = [
			{ index: 1, type: 'insert' },
			{ index: 2, type: 'insert' },
			{ index: 5, type: 'delete' },
			{ index: 5, type: 'delete' }
		];
		assert.deepEqual(jQuery.sap.arrayDiff(aData1, aData4), aDiff, "diff between data 1 and 4");

		aDiff = [
			{ index: 1, type: 'insert' },
			{ index: 2, type: 'insert' },
			{ index: 5, type: 'delete' },
			{ index: 5, type: 'delete' }
		];
		assert.deepEqual(jQuery.sap.arrayDiff(aData2, aData3), aDiff, "diff between data 2 and 3");

		aDiff = [
			{ index: 1, type: 'delete' },
			{ index: 1, type: 'delete' },
			{ index: 3, type: 'insert' },
			{ index: 4, type: 'insert' }
		];
		assert.deepEqual(jQuery.sap.arrayDiff(aData2, aData4), aDiff, "diff between data 2 and 4");

		aDiff = [
			{ index: 3, type: 'delete' },
			{ index: 3, type: 'delete' },
			{ index: 3, type: 'insert' },
			{ index: 4, type: 'insert' }
		];
		assert.deepEqual(jQuery.sap.arrayDiff(aData3, aData4), aDiff, "diff between data 3 and 4");

		aDiff = [
			{ index: 0, type: 'delete' },
			{ index: 0, type: 'delete' },
			{ index: 3, type: 'insert' },
			{ index: 4, type: 'insert' }
		];
		assert.deepEqual(jQuery.sap.arrayDiff(aData1, aData5), aDiff, "diff between data 1 and 5");

		aDiff = [
			{ index: 0, type: 'insert' },
			{ index: 1, type: 'insert' },
			{ index: 5, type: 'delete' },
			{ index: 5, type: 'delete' }
		];
		assert.deepEqual(jQuery.sap.arrayDiff(aData5, aData1), aDiff, "diff between data 5 and 1");

		aDiff = [
			{ index: 0, type: 'insert' },
			{ index: 1, type: 'insert' },
			{ index: 2, type: 'insert' },
			{ index: 3, type: 'insert' },
			{ index: 5, type: 'delete' },
			{ index: 5, type: 'delete' },
			{ index: 5, type: 'delete' },
			{ index: 5, type: 'delete' }
		];
		assert.deepEqual(jQuery.sap.arrayDiff(aData1, aData10), aDiff, "diff between data 1 and 10");

		aDiff = [
			{ index: 0, type: 'insert' },
			{ index: 1, type: 'insert' },
			{ index: 2, type: 'insert' },
			{ index: 3, type: 'insert' },
			{ index: 4, type: 'insert' }
		];
		assert.deepEqual(jQuery.sap.arrayDiff(aData11, aData1), aDiff, "diff between data 1 and 11");

		aDiff = [
			{ index: 0, type: 'delete' },
			{ index: 0, type: 'delete' },
			{ index: 0, type: 'delete' },
			{ index: 0, type: 'delete' },
			{ index: 0, type: 'delete' }
		];
		assert.deepEqual(jQuery.sap.arrayDiff(aData1, aData11), aDiff, "diff between data 11 and 1");

		aDiff = [
			{ index: 1, type: 'insert' },
			{ index: 3, type: 'delete' },
			{ index: 3, type: 'insert' },
			{ index: 5, type: 'delete' }
		];
		assert.deepEqual(jQuery.sap.arrayDiff(aData1, aData12), aDiff, "diff between data 1 and 12");

		aDiff = [
			{ index: 0, type: 'insert' },
			{ index: 1, type: 'insert' },
			{ index: 2, type: 'insert' },
			{ index: 3, type: 'insert' },
			{ index: 4, type: 'insert' },
			{ index: 5, type: 'insert' },
			{ index: 8, type: 'delete' }
		];
		assert.deepEqual(jQuery.sap.arrayDiff(aData6, aData9), aDiff, "diff between data 6 and 9");

		aDiff = [
			{ index: 0, type: 'insert' },
			{ index: 1, type: 'insert' },
			{ index: 2, type: 'insert' },
			{ index: 4, type: 'delete' },
			{ index: 4, type: 'delete' },
			{ index: 4, type: 'delete' }
		];
		assert.deepEqual(jQuery.sap.arrayDiff(aData13, aData14), aDiff, "diff between data 13 and 14");

		aDiff = [
			{ index: 0, type: 'delete' },
			{ index: 0, type: 'delete' },
			{ index: 1, type: 'delete' },
			{ index: 1, type: 'delete' },
			{ index: 1, type: 'delete' },
			{ index: 1, type: 'delete' },
			{ index: 1, type: 'delete' },
			{ index: 1, type: 'delete' },
			{ index: 1, type: 'delete' },
			{ index: 1, type: 'delete' },
			{ index: 1, type: 'delete' },
			{ index: 1, type: 'delete' },
			{ index: 1, type: 'delete' },
			{ index: 1, type: 'delete' },
			{ index: 1, type: 'delete' },
			{ index: 1, type: 'delete' },
			{ index: 2, type: 'delete' },
			{ index: 2, type: 'delete' },
			{ index: 2, type: 'delete' },
			{ index: 2, type: 'delete' },
			{ index: 2, type: 'delete' },
			{ index: 2, type: 'delete' },
			{ index: 2, type: 'delete' },
			{ index: 2, type: 'delete' },
			{ index: 2, type: 'delete' },
			{ index: 2, type: 'delete' },
			{ index: 2, type: 'insert' },
			{ index: 3, type: 'insert' },
			{ index: 4, type: 'insert' },
			{ index: 5, type: 'insert' },
			{ index: 6, type: 'insert' },
			{ index: 7, type: 'insert' },
			{ index: 8, type: 'insert' },
			{ index: 9, type: 'insert' },
			{ index: 10, type: 'insert' }
		];
		assert.deepEqual(jQuery.sap.arrayDiff(aData15, aData16), aDiff, "diff between data 15 and 16");

		aDiff = [
			{ index: 0, type: 'delete' },
			{ index: 0, type: 'delete' },
			{ index: 0, type: 'delete' },
			{ index: 0, type: 'delete' },
			{ index: 0, type: 'delete' },
			{ index: 0, type: 'insert' },
			{ index: 1, type: 'insert' },
			{ index: 2, type: 'insert' },
			{ index: 3, type: 'insert' },
			{ index: 4, type: 'insert' }
		];
		assert.deepEqual(jQuery.sap.arrayDiff(aData17, aData18), aDiff, "diff between data 17 and 18");

		aDiff = [
			{ index: 4, type: 'delete' },
			{ index: 4, type: 'insert' }
		];
		assert.deepEqual(jQuery.sap.arrayDiff(aData19, aData20), aDiff, "diff between data 19 and 20");

		aDiff = [
			{ index: 5, type: 'insert' }
		];
		assert.deepEqual(jQuery.sap.arrayDiff(aData1, aData21), aDiff, "diff between data 1 and 21");

		aDiff = [
			{ index: 0, type: 'delete' },
			{ index: 0, type: 'delete' },
			{ index: 0, type: 'delete' },
			{ index: 0, type: 'delete' },
			{ index: 0, type: 'insert' },
			{ index: 1, type: 'insert' },
			{ index: 3, type: 'delete' },
			{ index: 3, type: 'delete' },
			{ index: 3, type: 'delete' },
			{ index: 3, type: 'delete' },
			{ index: 3, type: 'delete' },
			{ index: 3, type: 'insert' },
			{ index: 4, type: 'insert' },
			{ index: 5, type: 'insert' },
			{ index: 6, type: 'insert' },
			{ index: 7, type: 'insert' },
			{ index: 8, type: 'insert' },
			{ index: 9, type: 'insert' }
		];
		assert.deepEqual(jQuery.sap.arrayDiff(aData22, aData23), aDiff, "diff between data 22 and 23");

		aDiff = [
			{ index: 4, type: 'delete' },
			{ index: 4, type: 'insert' },
			{ index: 6, type: 'insert' }
		];
		assert.deepEqual(jQuery.sap.arrayDiff(aData19, aData24), aDiff, "diff between data 19 and 24");

		var aContexts1 = [
			"/navigation/0",
			"/navigation/1",
			"/navigation/2",
			"/navigation/3",
			"/navigation/4",
			"/navigation/5",
			"/navigation/6",
			"/navigation/7",
			"/navigation/8",
			"/navigation/9"
		];
		var aContexts2 = [
			"/navigation/0",
			"/navigation/1",
			"/navigation/2",
			"/navigation/3",
			"/navigation/4",
			"/navigation/5",
			"/navigation/6",
			"/navigation/7",
			"/navigation/8",
			"/navigation/9"
		];
		var oLastContextData = {
			"/navigation/0": { name: "Item 6" },
			"/navigation/1": { name: "Item 4" },
			"/navigation/2": { name: "Item 8" },
			"/navigation/3": { name: "Item 6" },
			"/navigation/4": { name: "Item 1" },
			"/navigation/5": { name: "Item 3" },
			"/navigation/6": { name: "Item 4" },
			"/navigation/7": { name: "Item 9" },
			"/navigation/8": { name: "Item 3" },
			"/navigation/9": { name: "Item 0" }
		};
		var oContextData = {
			"/navigation/0": { name: "Item 8" },
			"/navigation/1": { name: "Item 8" },
			"/navigation/2": { name: "Item 2" },
			"/navigation/3": { name: "Item 3" },
			"/navigation/4": { name: "Item 3" },
			"/navigation/5": { name: "Item 4" },
			"/navigation/6": { name: "Item 2" },
			"/navigation/7": { name: "Item 0" },
			"/navigation/8": { name: "Item 7" },
			"/navigation/9": { name: "Item 0" }
		};
		aDiff = [
			{ index: 0, type: 'delete' },
			{ index: 0, type: 'delete' },
			{ index: 0, type: 'delete' },
			{ index: 0, type: 'delete' },
			{ index: 0, type: 'delete' },
			{ index: 0, type: 'delete' },
			{ index: 0, type: 'delete' },
			{ index: 0, type: 'delete' },
			{ index: 0, type: 'delete' },
			{ index: 0, type: 'delete' },
			{ index: 0, type: 'insert' },
			{ index: 1, type: 'insert' },
			{ index: 2, type: 'insert' },
			{ index: 3, type: 'insert' },
			{ index: 4, type: 'insert' },
			{ index: 5, type: 'insert' },
			{ index: 6, type: 'insert' },
			{ index: 7, type: 'insert' },
			{ index: 8, type: 'insert' },
			{ index: 9, type: 'insert' }
		];
		var aDiffResult = jQuery.sap.arrayDiff(aContexts1, aContexts2, function(oOldContext, oNewContext) {
			return jQuery.sap.equal(
				oOldContext && oLastContextData && oLastContextData[oOldContext],
				oNewContext && oContextData && oContextData[oNewContext]
			);
		});
		assert.deepEqual(aDiffResult, aDiff, "diff with custom compare function");
		var oLastContextDataArray = [
			{ name: "Item 6" },
			{ name: "Item 4" },
			{ name: "Item 8" },
			{ name: "Item 6" },
			{ name: "Item 1" },
			{ name: "Item 3" },
			{ name: "Item 4" },
			{ name: "Item 9" },
			{ name: "Item 3" },
			{ name: "Item 0" }
		];
		var oContextDataArray = [
			{ name: "Item 8" },
			{ name: "Item 8" },
			{ name: "Item 2" },
			{ name: "Item 3" },
			{ name: "Item 3" },
			{ name: "Item 4" },
			{ name: "Item 2" },
			{ name: "Item 0" },
			{ name: "Item 7" },
			{ name: "Item 0" }
		];
		assert.deepEqual(jQuery.sap.arrayDiff(oLastContextDataArray, oContextDataArray), aDiff, "same diff without custom compare function");

	});

	QUnit.test("random arrayDiffs", function(assert) {
		for (var t = 0; t < 100; t++) {
			var listA = [],
				listB = [],
				listACount = Math.floor(Math.random() * 101),
				listBCount = Math.floor(Math.random() * 101),
				aDiff;

			for (var a = 0; a < listACount; a++) {
				listA[a] = Math.floor(Math.random() * 101);
			}
			for (var b = 0; b < listBCount; b++) {
				listB[b] = Math.floor(Math.random() * 101);
			}
			aDiff = jQuery.sap.arrayDiff(listA, listB);
			for (var d = 0; d < aDiff.length; d++) {
				var oDiff = aDiff[d];
				if (oDiff.type === "insert") {
					listA.splice(oDiff.index, 0, listB[oDiff.index]);
				} else {
					listA.splice(oDiff.index, 1);
				}
			}
			assert.deepEqual(listA, listB, "random arrayDiff " + (t + 1));
		}
	});

	QUnit.module("jQuery.sap.arraySymbolDiff");

	QUnit.test("simple arrays", function(assert) {
		var aData1 = [1,2,3,4,5];
		var aData2 = [1,4,5,6,7];
		var aData3 = [1,6,7,4,5];
		var aData4 = [1,6,7,2,3];
		var aData5 = [3,4,5,6,7];
		var aData6 = [4,5,7];
		// var aData7 = [9,8,4,4,3,2,9]; // currently not used
		var aData8 = [1,4,5,2,3];
		var aData9 = [1,7,8,9,2,3,4,5];
		var aData10 = [5,4,3,2,1];
		var aData11 = [];
		var aData12 = [1,3,2,5,4];
		var aData13 = [1,2,3,3,3,4,5];
		var aData14 = [3,3,2,1,3,4,5];
		var aData15 = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28];
		var aData16 = [3,18,29,30,31,32,33,34,35,36,37];
		var aData17 = [1,2,1,2,1];
		var aData18 = [2,1,2,1,2];
		var aData19 = [1,2,3,4,5,6];
		var aData20 = [1,2,3,4,2,6];
		var aData21 = [1,2,3,4,5,1];
		var aData22 = [8,1,3,1,7,2,6,3,6,9];
		var aData23 = [1,9,7,1,5,9,1,9,9,6];
		var aData24 = [1,2,3,4,2,6,2];
		var aDiff;

		aDiff = [
			{ index: 1, type: 'insert' },
			{ index: 2, type: 'insert' },
			{ index: 3, type: 'insert' },
			{ index: 4, type: 'insert' },
			{ index: 5, type: 'insert' },
			{ index: 8, type: 'delete' },
			{ index: 8, type: 'delete' }
		];
		assert.deepEqual(jQuery.sap.arraySymbolDiff(aData8, aData9), aDiff, "diff between data 8 and 9");

		aDiff = [
			{ index: 1, type: 'delete' },
			{ index: 1, type: 'delete' },
			{ index: 3, type: 'insert' },
			{ index: 4, type: 'insert' }
		];
		assert.deepEqual(jQuery.sap.arraySymbolDiff(aData1, aData2), aDiff, "diff between data 1 and 2");

		aDiff = [
			{ index: 1, type: 'delete' },
			{ index: 1, type: 'delete' },
			{ index: 1, type: 'insert' },
			{ index: 2, type: 'insert' }
		];
		assert.deepEqual(jQuery.sap.arraySymbolDiff(aData1, aData3), aDiff, "diff between data 1 and 3");

		aDiff = [
			{ index: 1, type: 'insert' },
			{ index: 2, type: 'insert' },
			{ index: 5, type: 'delete' },
			{ index: 5, type: 'delete' }
		];
		assert.deepEqual(jQuery.sap.arraySymbolDiff(aData1, aData4), aDiff, "diff between data 1 and 4");

		aDiff = [
			{ index: 1, type: 'insert' },
			{ index: 2, type: 'insert' },
			{ index: 5, type: 'delete' },
			{ index: 5, type: 'delete' }
		];
		assert.deepEqual(jQuery.sap.arraySymbolDiff(aData2, aData3), aDiff, "diff between data 2 and 3");

		aDiff = [
			{ index: 1, type: 'delete' },
			{ index: 1, type: 'delete' },
			{ index: 3, type: 'insert' },
			{ index: 4, type: 'insert' }
		];
		assert.deepEqual(jQuery.sap.arraySymbolDiff(aData2, aData4), aDiff, "diff between data 2 and 4");

		aDiff = [
			{ index: 3, type: 'delete' },
			{ index: 3, type: 'delete' },
			{ index: 3, type: 'insert' },
			{ index: 4, type: 'insert' }
		];
		assert.deepEqual(jQuery.sap.arraySymbolDiff(aData3, aData4), aDiff, "diff between data 3 and 4");

		aDiff = [
			{ index: 0, type: 'delete' },
			{ index: 0, type: 'delete' },
			{ index: 3, type: 'insert' },
			{ index: 4, type: 'insert' }
		];
		assert.deepEqual(jQuery.sap.arraySymbolDiff(aData1, aData5), aDiff, "diff between data 1 and 5");

		aDiff = [
			{ index: 0, type: 'insert' },
			{ index: 1, type: 'insert' },
			{ index: 5, type: 'delete' },
			{ index: 5, type: 'delete' }
		];
		assert.deepEqual(jQuery.sap.arraySymbolDiff(aData5, aData1), aDiff, "diff between data 5 and 1");

		aDiff = [
			{ index: 0, type: 'insert' },
			{ index: 1, type: 'insert' },
			{ index: 2, type: 'insert' },
			{ index: 3, type: 'insert' },
			{ index: 5, type: 'delete' },
			{ index: 5, type: 'delete' },
			{ index: 5, type: 'delete' },
			{ index: 5, type: 'delete' }
		];
		assert.deepEqual(jQuery.sap.arraySymbolDiff(aData1, aData10), aDiff, "diff between data 1 and 10");

		aDiff = [
			{ index: 0, type: 'insert' },
			{ index: 1, type: 'insert' },
			{ index: 2, type: 'insert' },
			{ index: 3, type: 'insert' },
			{ index: 4, type: 'insert' }
		];
		assert.deepEqual(jQuery.sap.arraySymbolDiff(aData11, aData1), aDiff, "diff between data 1 and 11");

		aDiff = [
			{ index: 0, type: 'delete' },
			{ index: 0, type: 'delete' },
			{ index: 0, type: 'delete' },
			{ index: 0, type: 'delete' },
			{ index: 0, type: 'delete' }
		];
		assert.deepEqual(jQuery.sap.arraySymbolDiff(aData1, aData11), aDiff, "diff between data 11 and 1");

		aDiff = [
			{ index: 1, type: 'insert' },
			{ index: 3, type: 'delete' },
			{ index: 3, type: 'insert' },
			{ index: 5, type: 'delete' }
		];
		assert.deepEqual(jQuery.sap.arraySymbolDiff(aData1, aData12), aDiff, "diff between data 1 and 12");

		aDiff = [
			{ index: 0, type: 'insert' },
			{ index: 1, type: 'delete' },
			{ index: 1, type: 'delete' },
			{ index: 2, type: 'insert' },
			{ index: 3, type: 'insert' },
			{ index: 4, type: 'insert' },
			{ index: 5, type: 'insert' },
			{ index: 6, type: 'insert' },
			{ index: 7, type: 'insert' }
		];
		assert.deepEqual(jQuery.sap.arraySymbolDiff(aData6, aData9), aDiff, "diff between data 6 and 9");

		aDiff = [
			{ index: 0, type: 'insert' },
			{ index: 1, type: 'insert' },
			{ index: 2, type: 'insert' },
			{ index: 4, type: 'delete' },
			{ index: 4, type: 'delete' },
			{ index: 4, type: 'delete' }
		];
		assert.deepEqual(jQuery.sap.arraySymbolDiff(aData13, aData14), aDiff, "diff between data 13 and 14");

		aDiff = [
			{ index: 0, type: 'delete' },
			{ index: 0, type: 'delete' },
			{ index: 1, type: 'delete' },
			{ index: 1, type: 'delete' },
			{ index: 1, type: 'delete' },
			{ index: 1, type: 'delete' },
			{ index: 1, type: 'delete' },
			{ index: 1, type: 'delete' },
			{ index: 1, type: 'delete' },
			{ index: 1, type: 'delete' },
			{ index: 1, type: 'delete' },
			{ index: 1, type: 'delete' },
			{ index: 1, type: 'delete' },
			{ index: 1, type: 'delete' },
			{ index: 1, type: 'delete' },
			{ index: 1, type: 'delete' },
			{ index: 2, type: 'delete' },
			{ index: 2, type: 'delete' },
			{ index: 2, type: 'delete' },
			{ index: 2, type: 'delete' },
			{ index: 2, type: 'delete' },
			{ index: 2, type: 'delete' },
			{ index: 2, type: 'delete' },
			{ index: 2, type: 'delete' },
			{ index: 2, type: 'delete' },
			{ index: 2, type: 'delete' },
			{ index: 2, type: 'insert' },
			{ index: 3, type: 'insert' },
			{ index: 4, type: 'insert' },
			{ index: 5, type: 'insert' },
			{ index: 6, type: 'insert' },
			{ index: 7, type: 'insert' },
			{ index: 8, type: 'insert' },
			{ index: 9, type: 'insert' },
			{ index: 10, type: 'insert' }
		];
		assert.deepEqual(jQuery.sap.arraySymbolDiff(aData15, aData16), aDiff, "diff between data 15 and 16");

		aDiff = [
			{ index: 0, type: 'delete' },
			{ index: 0, type: 'delete' },
			{ index: 0, type: 'delete' },
			{ index: 0, type: 'delete' },
			{ index: 0, type: 'delete' },
			{ index: 0, type: 'insert' },
			{ index: 1, type: 'insert' },
			{ index: 2, type: 'insert' },
			{ index: 3, type: 'insert' },
			{ index: 4, type: 'insert' }
		];
		assert.deepEqual(jQuery.sap.arraySymbolDiff(aData17, aData18), aDiff, "diff between data 17 and 18");

		aDiff = [
			{ index: 4, type: 'delete' },
			{ index: 4, type: 'insert' }
		];
		assert.deepEqual(jQuery.sap.arraySymbolDiff(aData19, aData20), aDiff, "diff between data 19 and 20");

		aDiff = [
			{ index: 5, type: 'insert' }
		];
		assert.deepEqual(jQuery.sap.arraySymbolDiff(aData1, aData21), aDiff, "diff between data 1 and 21");

		aDiff = [
			{ index: 0, type: 'delete' },
			{ index: 0, type: 'delete' },
			{ index: 0, type: 'delete' },
			{ index: 0, type: 'delete' },
			{ index: 0, type: 'insert' },
			{ index: 1, type: 'insert' },
			{ index: 3, type: 'delete' },
			{ index: 3, type: 'delete' },
			{ index: 3, type: 'delete' },
			{ index: 3, type: 'delete' },
			{ index: 3, type: 'delete' },
			{ index: 3, type: 'insert' },
			{ index: 4, type: 'insert' },
			{ index: 5, type: 'insert' },
			{ index: 6, type: 'insert' },
			{ index: 7, type: 'insert' },
			{ index: 8, type: 'insert' },
			{ index: 9, type: 'insert' }
		];
		assert.deepEqual(jQuery.sap.arraySymbolDiff(aData22, aData23), aDiff, "diff between data 22 and 23");

		aDiff = [
			{ index: 4, type: 'delete' },
			{ index: 4, type: 'insert' },
			{ index: 6, type: 'insert' }
		];
		assert.deepEqual(jQuery.sap.arraySymbolDiff(aData19, aData24), aDiff, "diff between data 19 and 24");
	});

	QUnit.test("random arrays", function(assert) {
		for (var t = 0; t < 100; t++) {
			var listA = [],
				listB = [],
				listACount = Math.floor(Math.random() * 101),
				listBCount = Math.floor(Math.random() * 101),
				aDiff;

			for (var a = 0; a < listACount; a++) {
				listA[a] = Math.floor(Math.random() * 101);
			}
			for (var b = 0; b < listBCount; b++) {
				listB[b] = Math.floor(Math.random() * 101);
			}
			aDiff = jQuery.sap.arraySymbolDiff(listA, listB);
			for (var d = 0; d < aDiff.length; d++) {
				var oDiff = aDiff[d];
				if (oDiff.type === "insert") {
					listA.splice(oDiff.index, 0, listB[oDiff.index]);
				} else {
					listA.splice(oDiff.index, 1);
				}
			}
			assert.deepEqual(listA, listB, "random arrayDiff " + (t + 1));
		}
	});

	QUnit.test("arrays with undefined values", function(assert) {
		var a1 = [1, 2, 3, undefined],
			a2 = [1, undefined],
			aDiff = jQuery.sap.arraySymbolDiff(a1, a2),
			aResult = [
				{ index: 1, type: 'delete'},
				{ index: 1, type: 'delete'}
			];
		assert.deepEqual(aDiff, aResult, "arraySymbolDiff must work with undefined values");
	});

	// -------------------------------------------------------------------------------
	// jQuery.sap.parseJS
	// -------------------------------------------------------------------------------

	QUnit.module("jQuery.sap.parseJS");

	QUnit.test("valid expressions", function(assert) {
		[
			["{}", {}],
			["{test:'123'}", { test: "123" }],
			["{test:456.00}", { test: 456.00 }],
			["{test:-456}", { test: -456 }],
			["{test:-456e9}", { test: -456e9 }],
			["{test:77E-4}", { test: 77E-4 }],
			["{test:\"123\"}", { test: "123" }],
			["{23:'test'}", { 23: "test" }],
			["{'23':'test'}", { "23": "test" }],
			["{aa:'123', bb:'456'}", { aa: "123", bb: "456" }],
			["{a1:123, b2:'456', c3:false, c4:true, d5:null}", { a1: 123, b2: "456", c3: false, c4: true, d5: null }],
			["{a:{}, b:[], c:'test'}", { a: {}, b: [], c: "test" }],
			["{a:{a:{a:{a:{a:{}}}}}}", { a: { a: { a: { a: { a: {}}}}}}],
			["{$a:{$a:{$a:{$a:{$a:{}}}}}}", { $a: { $a: { $a: { $a: { $a: {}}}}}}],
			["{arr:[1,2,3,4]}", { arr: [1, 2, 3, 4] }],
			["{arr:[1,'2',3,false]}", { arr: [1, "2", 3, false] }],
			["{test:'{test}'}", { test: "{test}" }],
			["{test:'\\'\"\\\\'}", { test: "'\"\\"}]
		].forEach(function(input) {
			assert.deepEqual(jQuery.sap.parseJS(input[0]), input[1], "Parse " + input[0]);
		});
	});

	QUnit.test("invalid expressions", function(assert) {
		[
			"{[}",
			"{test:'123\"}",
			"{test:\"123}",
			"{23a:'test'}",
			"{aa:'123' bb:'456'}",
			"{a1:123a, b2:'456', c3:false}",
			"{a:{}, b:[}, c:'test'}",
			"{a:{a:{a:{a:{a:{}}}}}}}",
			"{arr:[1,2,3,4,,]}",
			"{arr:[1,'2,3,false]}",
			"{test:'{test}',test}",
			"{test:'\'\"\\'}"
		].forEach(function(input) {
			assert.raises(function() {
				jQuery.sap.parseJS(input);
			}, "Invalid " + input);
		});
	});

	QUnit.test("tokenizer with enhancements getCh, getIndex, init, setIndex", function (assert) {
		var oTokenizer = jQuery.sap._createJSTokenizer(),
			oTokenizer2 = jQuery.sap._createJSTokenizer();

		oTokenizer.init("{='foo'}");
		assert.strictEqual(oTokenizer.getIndex(), -1, "index after init without start index");
		assert.strictEqual(oTokenizer.getCh(), " ");

		oTokenizer.init("{='foo'}", 2);
		assert.strictEqual(oTokenizer.getIndex(), 1, "index after init with start index");
		assert.strictEqual(oTokenizer.getCh(), " ");

		oTokenizer.next();
		assert.strictEqual(oTokenizer.getIndex(), 2, "index after next");
		assert.strictEqual(oTokenizer.getCh(), "'");

		oTokenizer.setIndex(7);
		assert.strictEqual(oTokenizer.getIndex(), 7, "index after setIndex");
		assert.strictEqual(oTokenizer.getCh(), "}");

		assert.throws(function() {
			oTokenizer.setIndex(0);
		}, /Must not set index 0 before previous index 7/, "setIndex must not go back in text");
		oTokenizer.setIndex(42);
		assert.strictEqual(oTokenizer.getCh(), "", "move index beyond text end");

		oTokenizer2.init("{='other foo'}");
		assert.ok(oTokenizer2.getIndex() !== oTokenizer.getIndex(), "different instances");
	});

	QUnit.module("jQuery.sap.extend", {
		beforeEach : function() {
			myObject = {
				prop1: "test",
				prop2: [0,1,2],
				prop3: 2,
				prop4: null,
				prop5: undefined,
				prop6: {
					prop61:"test",
					prop62:[0,2,3],
					prop63: undefined,
					prop64: null,
					prop65: 2
				}
			};
		},
		afterEach : function() {
			myObject = undefined;
		}
	});

	QUnit.test("extend first level", function(assert) {
		var oClone = jQuery.sap.extend({}, myObject);
		assert.ok(typeof (oClone) == "object", "object clone created");
		assert.ok(!isEmptyObject(oClone), "clone not plain object");
		assert.ok(myObject !== oClone, "object cloned successfully");
		assert.equal(myObject.prop6, oClone.prop6, "no deep clone");
		assert.equal(myObject.prop1, oClone.prop1, "property cloned successfully");
		assert.equal(myObject.prop2, oClone.prop2, "property cloned successfully");
		assert.ok(Array.isArray(oClone.prop2), "property cloned successfully");
		assert.equal(myObject.prop3, oClone.prop3, "property cloned successfully");
		assert.equal(myObject.prop4, oClone.prop4, "property cloned successfully");
		assert.equal(myObject.prop5, oClone.prop5, "property cloned successfully");

	});

	QUnit.test("extend first level with __proto__", function(assert) {
		var myObject = JSON.parse('{ "y": 20, "__proto__": { "x": 42} }');
		var oClone = jQuery.sap.extend({}, myObject);
		assert.equal(oClone.y, 20, "y should be set");
		assert.equal(oClone.x, undefined, "x should not be set");
		assert.equal(Object.getPrototypeOf(oClone).x, undefined, "x should not be set");
	});

	QUnit.test("extend deep", function(assert) {
		var oClone = jQuery.sap.extend(true, {}, myObject);
		assert.ok(typeof (oClone) == "object", "object clone created");
		assert.ok(!isEmptyObject(oClone), "clone not plain object");
		assert.ok(myObject !== oClone, "object cloned successfully");
		assert.ok(myObject.prop6 !== oClone.prop6, "deep clone");
		assert.equal(myObject.prop1, oClone.prop1, "property cloned successfully");
		assert.ok(myObject.prop2 !== oClone.prop2, "property cloned successfully");
		assert.ok(Array.isArray(oClone.prop2), "property cloned successfully");
		assert.equal(myObject.prop3, oClone.prop3, "property cloned successfully");
		assert.equal(myObject.prop4, oClone.prop4, "property cloned successfully");
		assert.equal(myObject.prop5, oClone.prop5, "property cloned successfully");
	});

	QUnit.test("extend: undefined/null properties", function(assert) {
		var oClone = jQuery.sap.extend({}, myObject);
		assert.equal(oClone.prop4, null, "null property cloned successfully");
		assert.equal(oClone.prop5, undefined, "undefined property cloned successfully");
		assert.equal(oClone.prop6.prop64, null, "null property cloned successfully");
		assert.equal(oClone.prop6.prop63, undefined, "undefined property cloned successfully");
	});

	QUnit.test("extend: arrays", function(assert) {

		assert.deepEqual(jQuery.sap.extend([1, 2, 3], [6, 7, 8, 9]), [6, 7, 8, 9]);
		assert.deepEqual(jQuery.sap.extend([6, 7, 8, 9], [1, 2, 3]), [1, 2, 3, 9]);

		assert.deepEqual(jQuery.sap.extend([1, undefined], [6, 7, 8, 9]), [6, 7, 8, 9]);
		assert.deepEqual(jQuery.sap.extend([6, 7, 8, 9], [1, undefined]), [1, undefined, 8, 9]);


		assert.deepEqual(jQuery.sap.extend([1, null], [6, 7, 8, 9]), [6, 7, 8, 9]);
		assert.deepEqual(jQuery.sap.extend([6, 7, 8, 9], [1, null]), [1, null, 8, 9]);

		assert.deepEqual(jQuery.sap.extend(null, [1, null]), {"0": 1, "1": null});
		assert.deepEqual(jQuery.sap.extend(undefined, [1, null]), {"0": 1, "1": null});
		assert.deepEqual(jQuery.sap.extend(undefined, [1, null]), {"0": 1, "1": null});
		assert.deepEqual(jQuery.sap.extend(undefined, [undefined]), {"0": undefined});
	});
});
