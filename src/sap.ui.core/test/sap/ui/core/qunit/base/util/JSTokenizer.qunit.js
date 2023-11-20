/*!
 * ${copyright}
 */
/*global QUnit*/
sap.ui.define(['sap/base/util/JSTokenizer'], function(JSTokenizer) {
	"use strict";

	QUnit.module("sap/base/util/JSTokenizer");

	QUnit.test("valid expressions", function(assert) {
		var list = [
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
			];
		for (var i = 0; i < list.length; i++) {
			var aListEntries = list[i];
			assert.deepEqual(JSTokenizer.parseJS(aListEntries[0]), aListEntries[1], "Parse " + aListEntries[0]);
		}
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
			assert.throws(function() { JSTokenizer.parseJS(input); }, "Invalid " + input);
		});
	});

	QUnit.test("tokenizer with enhancements getCh, getIndex, init, setIndex", function (assert) {
		var oTokenizer = new JSTokenizer(),
			oTokenizer2 = new JSTokenizer();

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
});