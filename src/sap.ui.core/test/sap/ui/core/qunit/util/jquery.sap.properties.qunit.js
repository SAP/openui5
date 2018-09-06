/* global QUnit, sinon */

sap.ui.define(["jquery.sap.properties"], function(jQuery) {
	"use strict";

	QUnit.test("PropertiesClassAvailable", function (assert) {
		assert.equal(typeof jQuery.sap.properties, "function", "jQuery.properties must be a function");
	});

	var expected = {
		comment_continuation_1 : 'ok',
		comment_continuation_2 : 'ok',
		key1 : 'key1',
		key2 : 'key2',
		key3 : 'key3',
		key4 : 'key4',
		key5 : 'key5 is a very long text with trailing spaces                 \t\t\t',
		key6 : 'key6 is a very long text with leading spaces',
		key7 : 'key7 is a very long text with leading and trailing spaces\t\t\t\t\t',
		key8 : 'key8 is a very long text with trailing spaces                 \t\t\t',
		key9 : 'key9 is a very long text with leading spaces',
		key10: 'key10 is a very long text with leading and trailing spaces\t\t\t\t\t',
		key11: 'key11 is a very long text with trailing spaces                 \t\t\t',
		key12: 'key12 is a very long text with leading spaces',
		key13: 'key13 is a very long text with leading and trailing spaces\t\t\t\t\t',
		key14: 'key14 is a very long text with trailing spaces                 \t\t\t',
		key15: 'key15 is a very long text with leading spaces',
		key16: 'key16 is a very long text with leading and trailing spaces\t\t\t\t\t',
		key17: '',
		key18: '',
		key19: 'Default given',

		key_with_unicode_escape : 'key_with_unicode_escape',
		value_with_unicode_escape : 'value_with_unicode_escape',
		key_and_value_with_unicode_escape : 'key_and_value_with_unicode_escape',
		'key and value with space\tand\ttab' : 'key and value with space\tand\ttab',
		'key and value with \\r and \\n\r\n' : 'key and value with \\r and \\n\r\n',
		':_at_begin_of_key':':_at_begin_of_key',
		'=_at_begin_of_key':'=_at_begin_of_key',
		'key_contains_:_somewhere':'key_contains_:_somewhere',
		'key_contains_=_somewhere':'key_contains_=_somewhere',
		'key_ends_with_:':'key_ends_with_:',
		'key_ends_with_=':'key_ends_with_=',
		'unsupported_escapes_bv\\':'unsupported_escapes_bv\\',
		'no_double_escaping_\u005cu005a':'no_double_escaping_\u005cu005a',
		'i18n_äöü_key':'ÄÖÜäöü',

		quoted1 : 'a value with \'single quotes\' in it',
		quoted2 : 'a value with "double quotes" in it',
		quoted3 : 'a value with \'single quotes\' and "double quotes" in it',
		quoted4 : 'a value with \'\'\'unbalanced quotes"""',
		quoted5 : 'a value with \'\'"" escaped quotes \'\'""',

		key_without_value: "",
		continuedkey:'continuedkey',
		single_line:'single_line\\',
		no_continuation_3:'ok',

		'non.identifier.key' : 'some value',

		test1: 'value\\',
		test2: 'value2',
		test3: 'T"; alert(\'Hello!\'); //',

		Truth1: 'Beauty',
		Truth2: 'Beauty',
		Truth3: 'Beauty',
		fruits: 'apple, banana, pear, cantaloupe, watermelon, kiwi, mango',
		cheeses: ''
	};

	function checkProperties(assert, oProps){
		// check that the expected content is available
		for (var sKey in expected) {
			var sValue = oProps.getProperty(sKey, "Default given");
			assert.strictEqual(sValue, expected[sKey], "value for key '" + sKey + "'");
		}

		// check that no other keys have been loaded
		var aKeys = oProps.getKeys();
		for (var i = 0; i < aKeys.length; i++) {
			assert.ok(expected.hasOwnProperty(aKeys[i]), "expected keys should contain actual key '" + aKeys[i] + "'");
		}

		// check fallback to default with a non existent key
		var sValue = oProps.getProperty("initially-undefined","Default given");
		assert.strictEqual(sValue, "Default given", "fallback to provided default");

		// add that key and check that it is returned
		oProps.setProperty("initially-undefined","New Value added");
		var sValue = oProps.getProperty("initially-undefined","Default given");
		assert.strictEqual(sValue, "New Value added", "initially-undefined accessed");
	}

	QUnit.test("ParseAndAccess (sync)", function (assert) {
		var oProps = jQuery.sap.properties({ url: sap.ui.require.toUrl(sap.ui.require.toUrl("testdata/test.properties"))});
		checkProperties(assert, oProps);
	});

	QUnit.test("ParseAndAccess (async)", function (assert) {
		var oPromise = jQuery.sap.properties({url : sap.ui.require.toUrl("testdata/test.properties"), async: true});
		return oPromise.then(function(oProps){
			checkProperties(assert, oProps);
		});
	});

	QUnit.test("Access non existing (sync)", function (assert) {
		var oProps = jQuery.sap.properties({url : "testdata/doesnotexist.properties"});
		assert.equal(oProps.getKeys().length, 0, "Non-existing Properties file results in empty properties list.");
	});

	QUnit.test("Access non existing (async)", function (assert) {
		var oPromise = jQuery.sap.properties({url : "testdata/doesnotexist.properties", async: true});
		return oPromise.then(function(oProps){
			assert.equal(oProps.getKeys().length, 0, "Non-existing Properties file results in empty properties list.");
		}, function() {
			assert.ok(false, "promise must not be rejected for no-existing files");
		});
	});

	QUnit.test("Access non existing (sync,null)", function (assert) {
		var oProps = jQuery.sap.properties({url : "testdata/doesnotexist.properties", returnNullIfMissing:true});
		assert.strictEqual(oProps, null, "Non-existing Properties file results in a null value");
	});

	QUnit.test("Access non existing (async,null)", function (assert) {
		var oPromise = jQuery.sap.properties({url : "testdata/doesnotexist.properties", async: true, returnNullIfMissing:true});
		return oPromise.then(function(oProps){
			assert.strictEqual(oProps, null, "Non-existing Properties file results in a null value");
		}, function() {
			assert.ok(false, "promise must not be rejected for no-existing files");
		});
	});

	QUnit.test("IncompleteUnicodeEscape (sync)", function (assert) {
		assert.throws(function() {
			jQuery.sap.properties({url : sap.ui.require.toUrl("testdata/broken.properties")});
		}, "broken unicode escape");
	});

	QUnit.test("IncompleteUnicodeEscape (async)", function (assert) {
		var oPromise = jQuery.sap.properties({ url: sap.ui.require.toUrl("testdata/broken.properties"), async: true});
		return oPromise.then(function(oProps){
			assert.ok(false, "Success should not be called");
		}, function(oError){
			assert.ok(oError instanceof Error, "Fail due to broken unicode escape error.");
		});
	});

	[
		{
			caption : "Empty first line",
			properties : '\nfoo=bar'
		},
		{
			caption : "Empty first line, key w. WS",
			properties : '\n \tfoo=bar'
		},
		{
			caption : "Empty first line w. whitespace",
			properties : ' \t\nfoo=bar'
		},
		{
			caption : "Empty first line w. whitespace, key w. WS",
			properties : ' \t\n \tfoo=bar'
		}
	].forEach( function(info) {

		QUnit.test(info.caption, function(assert) {
			var server = sinon.fakeServer.create();
			server.respondWith(/fake.properties/, info.properties);
			var oProps = jQuery.sap.properties({ url: sap.ui.require.toUrl("testdata/fake.properties")});
			var aKeys = oProps.getKeys();
			assert.equal(aKeys.length, 1, "properties should have 1 key/value pair");
			assert.equal(aKeys[0], "foo", "key must not contain whitespace or newline");
			assert.equal(oProps.getProperty("foo"), "bar", "value must be retrieved");
			server.restore();
		});

	});

	QUnit.test("getKeys", function (assert) {
		var oProps = jQuery.sap.properties({url : sap.ui.require.toUrl("testdata/test.properties")});
		var aKeys = oProps.getKeys();
		// check that each returned key can be retrieved
		for (var i = 0; i < aKeys.length; i++) {
			var sValue = oProps.getProperty(aKeys[i],"Default for Key " + i);
			assert.notStrictEqual(sValue, "Default for Key " + i, "key" + i + " accessed");
		}
	});

	QUnit.test("clone", function (assert) {
		var oProps = jQuery.sap.properties({url : sap.ui.require.toUrl("testdata/test.properties")});

		// add one property before cloning
		oProps.setProperty("initially-undefined","New Value added");
		sValue = oProps.getProperty("initially-undefined","Default given");
		assert.ok(sValue == "New Value added", "key11 accessed");

		// now create a clone
		var oDolly =  oProps.clone();

		// and add one property to origin _after_ cloning
		oProps.setProperty("origin-only","New Value 2 added");
		sValue = oProps.getProperty("origin-only","Default given");
		assert.ok(sValue == "New Value 2 added", "origin-only accessed");

		// check content of clone
		for (var sKey in expected) {
			if ( typeof expected[sKey] === "string" ) {
				var sValue = oDolly.getProperty(sKey, "Default given");
				assert.strictEqual(sValue, expected[sKey], "access to value");
			}
		}
		// special case: key 11 has been added before creation of the clone, but after load -> must be part of it
		var sValue = oDolly.getProperty("initially-undefined","Default given");
		assert.strictEqual(sValue, "New Value added", "modification before clone must be visible in clone");

		// key 12 has been added after creation of the clone -> must not be part of clone
		var sValue = oDolly.getProperty("origin-only","Default given");
		assert.strictEqual(sValue, "Default given", "key added in origin after clone must not exist");

		// now do a temp change in the clone for a key existing in the origin -> must not be reflected in the original
		oDolly.setProperty("initially-undefined","Value modified in Dolly");
		sValue = oDolly.getProperty("initially-undefined","Default given");
		assert.strictEqual(sValue, "Value modified in Dolly", "clone modification visible in clone");
		// test again in the original file
		sValue = oProps.getProperty("initially-undefined","Default given");
		assert.strictEqual(sValue, "New Value added", "clone modification must not be visible in origin");
	});
});
