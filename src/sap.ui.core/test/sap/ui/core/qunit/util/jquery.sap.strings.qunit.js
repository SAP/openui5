/* global QUnit */

sap.ui.define(["jquery.sap.strings"], function(jQuery) {
	"use strict";

	QUnit.test("EndsWithOk", function (assert) {
		assert.ok(jQuery.sap.endsWith("abcde", "cde"), "'abcde' ends with 'cde'");
		assert.ok(jQuery.sap.endsWith("abc de", "c de"), "'abc de' ends with 'c de'");
		assert.ok(!(jQuery.sap.endsWith("abcde", "ce")), "'abcde' doesn't end with 'ce'");
		assert.ok(!(jQuery.sap.endsWith("abcde", "cDe")), "'abcde' doesn't end with 'cDe'");

		assert.ok(!(jQuery.sap.endsWith("abcde", "")), "'abcde' doesn't end with ''");
		assert.ok(!(jQuery.sap.endsWith("abcde", 10)), "'abcde' doesn't end with '10'");
		assert.ok(!(jQuery.sap.endsWith("abcde", null)), "'abcde' doesn't end with null");
	});

	QUnit.test("EndsWithFailed", function (assert) {
		try {
			jQuery.sap.endsWith(null, "abc");
			assert.ok(false, "exception should have been thrown");
		} catch (e) {
			assert.ok(true, "exception expected");
		}
	});

	QUnit.test("EndsWithIgnoreCaseOk", function (assert) {
		assert.ok(jQuery.sap.endsWithIgnoreCase("abcdE", "cDe"), "'abcdE' ends with 'cDe'");
		assert.ok(jQuery.sap.endsWithIgnoreCase("abcdE", "cDe"), "'abcdE' does end with 'cDe'");
		assert.ok(jQuery.sap.endsWith("abc De", "c De"), "'abc De' ends with 'c De'");
		assert.ok(!(jQuery.sap.endsWithIgnoreCase("abcdE", "cE")), "'abcdE' doesn't end with 'cE'");

		assert.ok(!(jQuery.sap.endsWithIgnoreCase("abcdE", "")), "'abcdE' doesn't end with ''");
		assert.ok(!(jQuery.sap.endsWithIgnoreCase("abcdE", 10)), "'abcdE' doesn't end with '10'");
		assert.ok(!(jQuery.sap.endsWithIgnoreCase("abcdE", null)), "'abcdE' doesn't end with null");
	});

	QUnit.test("EndsWithIgnoreCaseFailed", function (assert) {
		try {
			jQuery.sap.endsWithIgnoreCase(null, "abC");
			assert.ok(false, "exception should have been thrown");
		} catch (e) {
			assert.ok(true, "exception expected");
		}
	});

	QUnit.test("StartsWithOk", function (assert) {
		assert.ok(jQuery.sap.startsWith("abcde", "abc"), "'abcde' starts with 'abc'");
		assert.ok(jQuery.sap.startsWith("abCde", "abCd"), "'abCde' starts with 'abCd'");
		assert.ok(jQuery.sap.startsWith("abc de", "abc d"), "'abc de' starts with 'abc d'");
		assert.ok(jQuery.sap.startsWith("abc de", "abc "), "'abc de' starts with 'abc '");
		assert.ok(!(jQuery.sap.startsWith("abcde", "ac")), "'abcde' doesn't start with 'ac'");
		assert.ok(!(jQuery.sap.startsWith("abcde", "aB")), "'abcde' doesn't start with 'aB'");

		assert.ok(!(jQuery.sap.startsWith("abcde", "")), "'abcde' doesn't start with ''");
		assert.ok(!(jQuery.sap.startsWith("abcde", 10)), "'abcde' doesn't start with '10'");
		assert.ok(!(jQuery.sap.startsWith("abcde", null)), "'abcde' doesn't start with null");
	});

	QUnit.test("StartsWithFailed", function (assert) {
		try {
			jQuery.sap.startsWith(null, "abc");
			assert.ok(false, "exception should have been thrown");
		} catch (e) {
			assert.ok(true, "exception expected");
		}
	});

	QUnit.test("StartsWithIgnoreCaseOk", function (assert) {
		assert.ok(jQuery.sap.startsWithIgnoreCase("abcde", "Abc"), "'abcde' starts with 'abc'");
		assert.ok(jQuery.sap.startsWithIgnoreCase("abCde", "aBCd"), "'abCde' starts with 'aBCd'");
		assert.ok(jQuery.sap.startsWithIgnoreCase("abC de", "abc D"), "'abC de' starts with 'abc D'");
		assert.ok(jQuery.sap.startsWithIgnoreCase("abC de", "aBc "), "'abC de' starts with 'aBc '");
		assert.ok(!(jQuery.sap.startsWithIgnoreCase("abCde", "aC")), "'abCde' doesn't start with 'aC'");

		assert.ok(!(jQuery.sap.startsWithIgnoreCase("abcdE", "")), "'abcdE' doesn't start with ''");
		assert.ok(!(jQuery.sap.startsWithIgnoreCase("abcdE", 10)), "'abcdE' doesn't start with '10'");
		assert.ok(!(jQuery.sap.startsWithIgnoreCase("abcdE", null)), "'abcdE' doesn't start with null");
	});

	QUnit.test("StartsWithIgnoreCaseFailed", function (assert) {
		try {
			jQuery.sap.startsWithIgnoreCase(null, "aBc");
			assert.ok(false, "exception should have been thrown");
		} catch (e) {
			assert.ok(true, "exception expected");
		}
	});

//		QUnit.test("ContainsOk", function (assert){
//			assertTrue("'abcde' contains 'abc'", jQuery.sap.contains("abcde", "abc"));
//			assertTrue("'abCde' contains 'bCd'", jQuery.sap.contains("abCde", "bCd"));
//			assertTrue("'abCde' contains 'Cde'", jQuery.sap.contains("abCde", "Cde"));
//			assertTrue("'abC de' contains 'C de'", jQuery.sap.contains("abC de", "C de"));
//			assertFalse("'abCde' doesn't contain 'BC'", jQuery.sap.contains("abCde", "BC"));
//			assertFalse("'abCde' doesn't contain 'aC'", jQuery.sap.contains("abCde", "aC"));

//			assertFalse("'abcdE' doesn't contain ''", jQuery.sap.contains("abcdE", ""));
//			assertFalse("'abcdE' doesn't contain '10'", jQuery.sap.contains("abcdE", 10));
//			assertFalse("'abcdE' doesn't contain null", jQuery.sap.contains("abcdE", null));
//		});

//		QUnit.test("ContainsFailed", function (assert) {
//			try {
//				jQuery.sap.contains(null, "aBc");
//				assertTrue("exception should have been thrown", false);
//			} catch (e) {
//		  		assertTrue("exception expected", true);
//			}
//		});

//		QUnit.test("ContainsIgnoreCaseOk", function (assert){
//			assertTrue("'abcde' contains 'aBc'", jQuery.sap.containsIgnoreCase("abcde", "aBc"));
//			assertTrue("'abCde' contains 'bCD'", jQuery.sap.containsIgnoreCase("abCde", "bCD"));
//			assertTrue("'abCde' contains 'CdE'", jQuery.sap.containsIgnoreCase("abCde", "CdE"));
//			assertTrue("'abC de' contains 'Cd e'", jQuery.sap.containsIgnoreCase("abC de", "C DE"));
//			assertFalse("'abCde' doesn't contain 'Bd'", jQuery.sap.containsIgnoreCase("abCde", "Bd"));
//			assertFalse("'abCde' doesn't contain 'ac'", jQuery.sap.containsIgnoreCase("abCde", "ac"));

//			assertFalse("'abcdE' doesn't contain ''", jQuery.sap.containsIgnoreCase("abcdE", ""));
//			assertFalse("'abcdE' doesn't contain '10'", jQuery.sap.containsIgnoreCase("abcdE", 10));
//			assertFalse("'abcdE' doesn't contain null", jQuery.sap.containsIgnoreCase("abcdE", null));
//		});

//		QUnit.test("ContainsIgnoreFailed", function (assert) {
//			try {
//				jQuery.sap.containsIgnoreCase(null, "aBc");
//				assertTrue("exception should have been thrown", false);
//			} catch (e) {
//		  		assertTrue("exception expected", true);
//			}
//		});

//		QUnit.test("IsEmpty", function (assert){
//			assertTrue(jQuery.sap.isEmpty(""));
//			assertTrue(jQuery.sap.isEmpty("    "));
//			assertFalse(jQuery.sap.isEmpty("   .  "));
//			assertFalse(jQuery.sap.isEmpty(null));
//			assertFalse(jQuery.sap.isEmpty(10));
//		});

	QUnit.test("CharToUpperCase", function (assert) {
		assert.strictEqual("GggT", jQuery.sap.charToUpperCase("gggT"));
		assert.strictEqual("Gs4T", jQuery.sap.charToUpperCase("gs4T"));
		assert.strictEqual("GggT", jQuery.sap.charToUpperCase("gggT",0));
		assert.strictEqual("gggT", jQuery.sap.charToUpperCase("gggT",3));
		assert.strictEqual("ggGT", jQuery.sap.charToUpperCase("gggT",2));
		assert.strictEqual("loW", jQuery.sap.charToUpperCase("low",2));
		assert.strictEqual("Löw", jQuery.sap.charToUpperCase("löw",3));

		assert.strictEqual("GggT", jQuery.sap.charToUpperCase("gggT",-1));
		assert.strictEqual("GggT", jQuery.sap.charToUpperCase("gggT",-2));
		assert.strictEqual("GggT", jQuery.sap.charToUpperCase("gggT","kgtzjrf"));
		assert.strictEqual("GshfJsrhT", jQuery.sap.charToUpperCase("gshfJsrhT",10));

		assert.strictEqual("GggT", jQuery.sap.charToUpperCase("gggT",null));
		assert.strictEqual(jQuery.sap.charToUpperCase(null,-1), null);
	});


	QUnit.test("CamelCase", function(assert) {
		assert.expect(2);
		var sCamelCase = jQuery.sap.camelCase("this-is-an-camel-case-string");
		assert.equal(sCamelCase, "thisIsAnCamelCaseString", "CamelCase function returns the right value");

		var sCamelCase = jQuery.sap.camelCase("this-is-an-1amel-case-ütring");
		assert.equal(sCamelCase, "thisIsAn1amelCaseÜtring", "CamelCase function returns the right value for numeric and umlauts chars");
	});

	QUnit.module("formatMessage");

	QUnit.test("simple case", function(assert) {
		assert.equal(jQuery.sap.formatMessage("Say {0}", ["Hello"]), "Say Hello", "should replace unqouted placeholder0");
		assert.equal(jQuery.sap.formatMessage("{2},{1},{0}, {3}!", ["1", "2", "3", "Go"]), "3,2,1, Go!", "should replace multiple placeholders in the right order");
		assert.equal(jQuery.sap.formatMessage("{0},{2},{0}, {2}!", ["1", "2", "3", "Go"]), "1,3,1, 3!", "should replace multiple occurences of the same placeholders with the same value");
	});

	QUnit.test("escaping", function(assert) {
		assert.equal(jQuery.sap.formatMessage("Say '{0}'", ["Hello"]), "Say {0}", "quoted placeholder should be ignored");
		assert.equal(jQuery.sap.formatMessage("Say ''{0}''", ["Hello"]), "Say 'Hello'", "double single quotes are added to the result as single quotes, even around placeholders");
		assert.equal(jQuery.sap.formatMessage("'Some JS Object {x:''text''}': {0}", ["Hello"]), "Some JS Object {x:'text'}: Hello", "quoted fragment should be copied 1:1, with double sinqle quotes replaced by single single quotes");
		assert.equal(jQuery.sap.formatMessage("Say '{0}", ["Hello"]), "Say {0}", "missing final quote should be added silently");
	});

	QUnit.test("format types", function(assert) {
		assert.equal(jQuery.sap.formatMessage("Say {0,integer}", [12.4]), "Say 12.4", "format type should be silently ignored");
		assert.equal(jQuery.sap.formatMessage("Say {0,some+-'}", ["Hello"]), "Say Hello", "syntactically incorrect specifiers should be ignored as long as they contain no nested placeholders");
	});

	QUnit.test("formatter case", function(assert) {
		assert.equal(jQuery.sap.formatMessage("Say {0} 12", 0), "Say 0 12", "should replace unqouted placeholder0");
		assert.equal(jQuery.sap.formatMessage("Say {0}", "Hello"), "Say Hello", "should replace unqouted placeholder0");
		assert.equal(jQuery.sap.formatMessage("Say {0} {1}", "Hello",12), "Say Hello 12", "should replace unqouted placeholder 0 and 1");
		assert.equal(jQuery.sap.formatMessage("Say {0,integer}", 12.4), "Say 12.4", "format type should be silently ignored");
		assert.equal(jQuery.sap.formatMessage("Say '{0}'", "Hello"), "Say {0}", "quoted placeholder should be ignored");
	});

	QUnit.test("pattern syntax errors", function(assert) {
		assert.expect(5);
		try {
			jQuery.sap.formatMessage("Say }", [12.4]);
		} catch (e) {
			assert.ok(true, "unbalanced curly braces should raise an error");
		}
		try {
			jQuery.sap.formatMessage("Say {0} or {", [12.4]);
		} catch (e) {
			assert.ok(true, "unbalanced curly braces should raise an error");
		}
		try {
			jQuery.sap.formatMessage("Say {x,integer}", [12.4]);
		} catch (e) {
			assert.ok(true, "non-numerical argument index should raise an error");
		}
		try {
			jQuery.sap.formatMessage("Say {0integer}", [12.4]);
		} catch (e) {
			assert.ok(true, "not properly separated format options raise an error");
		}
		try {
			jQuery.sap.formatMessage("There {0,choice,0#are no files|1#is one file|1<are {0,number,integer} files}.", [5]);
		} catch (e) {
			assert.ok(true, "nested placeholders raise an error");
		}
	});
});
