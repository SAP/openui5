/*!
 * ${copyright}
 */
/*global QUnit, sinon */
sap.ui.define(['sap/base/Log', 'sap/base/util/UriParameters'], function(Log, UriParameters) {
	"use strict";

	QUnit.module("sap.base.util.UriParameters");

	QUnit.test("empty query string", function(assert) {
		var oUriParams = new UriParameters("/service");
		assert.deepEqual(Array.from(oUriParams.keys()), [], "empty query string should result in no parameters");
	});

	QUnit.test("empty constructor", function(assert) {
		var oUriParams = new UriParameters();
		assert.deepEqual(oUriParams.get(), null);
		assert.deepEqual(Array.from(oUriParams.keys()), [], "empty constructor should result in no parameters");
	});

	QUnit.test("a single parameter", function(assert) {
		var oUriParams = new UriParameters("/service?x=1");
		assert.deepEqual(oUriParams.getAll('x'), ['1']);
	});

	QUnit.test("wrong syntax", function(assert) {
		var oUriParams = new UriParameters("/service&x=1");
		assert.deepEqual(oUriParams.getAll('x'), []);
		var oUriParams = new UriParameters("/service?=2");
		assert.deepEqual(oUriParams.getAll('x'), []);
		var oUriParams = new UriParameters();
		assert.deepEqual(oUriParams.get(), null);
	});

	QUnit.test("multiple different parameters with different types", function(assert) {
		var oUriParams = new UriParameters("/service?x=1&y=2&z=true&@=test");
		assert.deepEqual(oUriParams.getAll('x'), ['1']);
		assert.deepEqual(oUriParams.getAll('y'), ['2']);
		assert.deepEqual(oUriParams.getAll('z'), ['true']);
		assert.deepEqual(oUriParams.getAll('@'), ['test']);
	});

	QUnit.test("URL with a hash", function(assert) {
		var oUriParams = new UriParameters("/service?x=1&y=#&z=test");
		assert.deepEqual(oUriParams.getAll('x'), ['1'], "parameter before hash");
		assert.deepEqual(oUriParams.getAll('y'), [""], "parameter without value, before hash");
		assert.deepEqual(oUriParams.getAll('z'), [], "parameter after hash");
	});

	QUnit.test("URL with multiple values for a single name", function(assert) {
		var oUriParams = new UriParameters("/service?addin=1&addin=2&addin=3");
		assert.deepEqual(oUriParams.getAll('addin'), ['1','2','3'], "param with multiple values");
	});

	QUnit.test("URL with param names from Object.prototype", function(assert) {
		var oUriParams = new UriParameters("/service?constructor=1&hasOwnProperty=2");
		assert.deepEqual(oUriParams.getAll('constructor'), ['1'], "param with Object.prototype name");
		assert.deepEqual(oUriParams.getAll('hasOwnProperty'), ['2'], "param with Object.prototype name");
		assert.deepEqual(oUriParams.getAll('toString'), [], "non-existing param with Object.prototype name");
	});

	QUnit.test("URL with param names with encoded characters", function(assert) {
		var oUriParams = new UriParameters("?key1%3D=2");
		assert.deepEqual(oUriParams.get('key1='), '2', "parameter with an encoded equal sign in the name");
		var oUriParams = new UriParameters("?key1%3Dx%26=2");
		assert.deepEqual(oUriParams.get('key1=x&'), '2', "parameter with an encoded ampersand sign in the name");
	});

	QUnit.test("URL with encoded values or spaces", function(assert) {
		var oUriParams = new UriParameters("?some+key=value");
		assert.deepEqual(oUriParams.getAll('some key'), ['value'], "plus-encoded parameter names should be retrievable by their decoded name");
		assert.deepEqual(oUriParams.getAll('some+key'), [], "plus-encoded parameter names should not be retrievable by their encoded name");
		var oUriParams = new UriParameters("/service?key1=&key2&key3=abc&key3=&key3&search=Rock+%26+Roll&rock%26roll=here+to+stay&weird=%26%CE%A8%E2%88%88");
		assert.deepEqual(oUriParams.getAll('key1'), [''], "empty value with equals sign");
		assert.deepEqual(oUriParams.getAll('key2'), [''], "empty  value");
		assert.deepEqual(oUriParams.getAll('key3'), ['abc', '', ''], "mixed with empty values");
		assert.deepEqual(oUriParams.getAll('rock&roll'), ['here to stay'], "encoded key");
		assert.deepEqual(oUriParams.getAll('search'), ['Rock & Roll'], "encoded value");
		assert.deepEqual(oUriParams.getAll('weird'), ['&\u03A8\u2208'], "hex encoded value");
		//alert('&\u03A8\u2208');
	});

	QUnit.test("query with consecutive ampersands", function(assert) {
		var oUriParams = new UriParameters("?a=1&&b=2&&&c=3");
		assert.deepEqual(Array.from(oUriParams.keys()).sort(), ["a", "b", "c"], "consecutive ampersands should not result in additional parameters");
		assert.deepEqual(oUriParams.getAll("a"), ["1"], "consecutive ampersands should not result in additional parameter values");
		assert.deepEqual(oUriParams.getAll("b"), ["2"], "consecutive ampersands should not result in additional parameter values");
		assert.deepEqual(oUriParams.getAll("c"), ["3"], "consecutive ampersands should not result in additional parameter values");
	});

	QUnit.test("URL with param values containing '='", function(assert) {
		var oUriParams = new UriParameters("/service?a=b====c&d=====&e=====f&g=h====");
		assert.deepEqual(oUriParams.getAll('a'), ['b====c'], "value with '=' in the middle");
		assert.deepEqual(oUriParams.getAll('d'), ['===='], "value consisting of '=' only");
		assert.deepEqual(oUriParams.getAll('e'), ['====f'], "value starting with '='");
		assert.deepEqual(oUriParams.getAll('g'), ['h===='], "value ending with '='");
	});

	QUnit.test("get() for empty and undefined parameters", function(assert) {
		var oUriParams = new UriParameters("?x");
		assert.deepEqual(oUriParams.get('x'), "", "parameters without a value should return the empty string as value");
		assert.deepEqual(oUriParams.get('z'), null, "undefined parameters should return null");
		var oUriParams = new UriParameters("?x&y=2");
		assert.deepEqual(oUriParams.get('x'), "", "parameters without a value should return the empty string as value, even if another parameter follows");
		assert.deepEqual(oUriParams.get('z'), null, "undefined parameters should return null");
		var oUriParams = new UriParameters("?x=");
		assert.deepEqual(oUriParams.get('x'), "", "parameters with an empty value should return an empty string as value");
		assert.deepEqual(oUriParams.get('z'), null, "undefined parameters should return null");
		var oUriParams = new UriParameters("?x=&y=2");
		assert.deepEqual(oUriParams.get('y'), "2");
		assert.deepEqual(oUriParams.get('x'), "", "parameters with an empty value should return an empty string as value, even if another parameter follows");
		assert.deepEqual(oUriParams.get('y'), "2");
	});

	QUnit.test("fromURL", function(assert) {
		var oUriParams = UriParameters.fromURL("service?x=1#y=2");
		assert.deepEqual(Array.from(oUriParams.keys()), ["x"]);
		assert.deepEqual(oUriParams.getAll('x'), ["1"]);
	});

	QUnit.test("fromQuery, standard use case", function(assert) {
		// a query string that looks like a URL with path / hash
		// this example is meant to epxlai nthe difference between fromURL and from Query
		var oUriParams = UriParameters.fromQuery("?x=1&y=2&y=3&z=");
		assert.deepEqual(Array.from(oUriParams.keys()), ["x", "y", "z"]);
		assert.deepEqual(oUriParams.getAll('x'), ["1"]);
		assert.deepEqual(oUriParams.getAll('y'), ["2", "3"]);
		assert.deepEqual(oUriParams.getAll('z'), [""]);
	});

	QUnit.test("fromQuery, edge case", function(assert) {
		// a query string that looks like a URL with path & hash
		// this example is meant to explain the difference between fromURL() and fromQuery()
		var oUriParams = UriParameters.fromQuery("service?x=1#&y=2");
		assert.deepEqual(Array.from(oUriParams.keys()), ["service?x", "y"]);
		assert.deepEqual(oUriParams.getAll('service?x'), ["1#"]);
		assert.deepEqual(oUriParams.getAll('y'), ["2"]);
	});

	QUnit.test("Deprecated Access to get(...,true)", function(assert) {
		sinon.stub(Log, "warning");
		try {
			var aValues = UriParameters.fromQuery("x=1&x=2").get("x", true);
			assert.deepEqual(aValues, ["1", "2"], "all values should be returned");
			assert.ok(
				Log.warning.calledWith(
					sinon.match(/Deprecated/)
					.and(sinon.match(/must not be used, use getAll/))),
				"A warning should be logged");
		} finally {
			Log.warning.restore();
		}
	});

	QUnit.test("Deprecated Access to mParams", function(assert) {
		sinon.stub(Log, "warning");
		try {
			var mParams = UriParameters.fromQuery("x=1&y=2").mParams;
			assert.strictEqual(Object.getPrototypeOf(mParams), Object.prototype, "mParams should have Object.prototype as prototype");
			assert.deepEqual(mParams, {x:["1"], y: ["2"]}, "mParams should have the expected content");
			assert.ok(
				Log.warning.calledWith(
					sinon.match(/Deprecated/)
					.and(sinon.match(/mParams must not be accessed/))),
				"A warning should be logged");
		} finally {
			Log.warning.restore();
		}
	});

});