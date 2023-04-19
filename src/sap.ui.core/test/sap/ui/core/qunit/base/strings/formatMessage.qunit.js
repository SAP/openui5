/*global QUnit */
sap.ui.define(["sap/base/strings/formatMessage"], function(formatMessage) {
	"use strict";

	QUnit.module("FormatMessage");

	QUnit.test("simple case", function(assert) {
		assert.equal(formatMessage("Say {0}", ["Hello"]), "Say Hello", "should replace unqouted placeholder0");
		assert.equal(formatMessage("{2},{1},{0}, {3}!", ["1", "2", "3", "Go"]), "3,2,1, Go!", "should replace multiple placeholders in the right order");
		assert.equal(formatMessage("{0},{2},{0}, {2}!", ["1", "2", "3", "Go"]), "1,3,1, 3!", "should replace multiple occurences of the same placeholders with the same value");
	});

	QUnit.test("false/falsy values", function(assert) {
		assert.equal(formatMessage("Say {0}"), "Say undefined");
		assert.equal(formatMessage("Say {0}", ""), "Say ");
		assert.equal(formatMessage("Say {0}", undefined), "Say undefined");
		assert.equal(formatMessage("Say {0}", []), "Say undefined");
		assert.equal(formatMessage("Say {0}", [""]), "Say ");
		assert.equal(formatMessage("Say {0}", [undefined]), "Say undefined");
		assert.equal(formatMessage("Say {0}", [undefined, "Awesome"]), "Say undefined");
	});

	QUnit.test("escaping", function(assert) {
		assert.equal(formatMessage("Say '{0}'", ["Hello"]), "Say {0}", "quoted placeholder should be ignored");
		assert.equal(formatMessage("Say ''{0}''", ["Hello"]), "Say 'Hello'", "double single quotes are added to the result as single quotes, even around placeholders");
		assert.equal(formatMessage("'Some JS Object {x:''text''}': {0}", ["Hello"]), "Some JS Object {x:'text'}: Hello", "quoted fragment should be copied 1:1, with double sinqle quotes replaced by single single quotes");
		assert.equal(formatMessage("Say '{0}", ["Hello"]), "Say {0}", "missing final quote should be added silently");
	});

	QUnit.test("format types", function(assert) {
		assert.equal(formatMessage("Say {0,integer}", [12.4]), "Say 12.4", "format type should be silently ignored");
		assert.equal(formatMessage("Say {0,some+-'}", ["Hello"]), "Say Hello", "syntactically incorrect specifiers should be ignored as long as they contain no nested placeholders");
	});

	QUnit.test("formatter case", function(assert) {
		assert.equal(formatMessage("Say {0} 12", 0), "Say 0 12", "should replace unqouted placeholder0");
		assert.equal(formatMessage("Say {0}", "Hello"), "Say Hello", "should replace unqouted placeholder0");
		assert.equal(formatMessage("Say {0} {1}", "Hello",12), "Say Hello 12", "should replace unqouted placeholder 0 and 1");
		assert.equal(formatMessage("Say {0,integer}", 12.4), "Say 12.4", "format type should be silently ignored");
		assert.equal(formatMessage("Say '{0}'", "Hello"), "Say {0}", "quoted placeholder should be ignored");
	});

	QUnit.test("pattern syntax errors", function(assert) {
		assert.expect(5);
		try {
			formatMessage("Say }", [12.4]);
		} catch (e) {
			assert.ok(true, "unbalanced curly braces should raise an error");
		}
		try {
			formatMessage("Say {0} or {", [12.4]);
		} catch (e) {
			assert.ok(true, "unbalanced curly braces should raise an error");
		}
		try {
			formatMessage("Say {x,integer}", [12.4]);
		} catch (e) {
			assert.ok(true, "non-numerical argument index should raise an error");
		}
		try {
			formatMessage("Say {0integer}", [12.4]);
		} catch (e) {
			assert.ok(true, "not properly separated format options raise an error");
		}
		try {
			formatMessage("There {0,choice,0#are no files|1#is one file|1<are {0,number,integer} files}.", [5]);
		} catch (e) {
			assert.ok(true, "nested placeholders raise an error");
		}
	});
});
