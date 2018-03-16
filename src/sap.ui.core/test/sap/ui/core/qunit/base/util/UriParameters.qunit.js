/*!
 * ${copyright}
 */
/*global QUnit */
sap.ui.define(['sap/base/util/UriParameters'], function(UriParameters) {
	"use strict";

	QUnit.module("sap.base.util.UriParameters");

	QUnit.test("empty query string", function(assert) {
		var oUriParams = new UriParameters("/service");
		assert.ok(Object.keys(oUriParams.mParams).length === 0);
	});

	QUnit.test("a single parameter", function(assert) {
		var oUriParams = new UriParameters("/service?x=1");
		assert.deepEqual(oUriParams.get('x',true), ['1']);
	});

	QUnit.test("wrong syntax", function(assert) {
		var oUriParams = new UriParameters("/service&x=1");
		assert.deepEqual(oUriParams.get('x',true), []);
		var oUriParams = new UriParameters("/service?=2");
		assert.deepEqual(oUriParams.get('x',true), []);
		var oUriParams = new UriParameters();
		assert.deepEqual(oUriParams.get(), null);
	});

	QUnit.test("multiple different parameters with different types", function(assert) {
		var oUriParams = new UriParameters("/service?x=1&y=2&z=true&@=test");
		assert.deepEqual(oUriParams.get('x',true), ['1']);
		assert.deepEqual(oUriParams.get('y',true), ['2']);
		assert.deepEqual(oUriParams.get('z',true), ['true']);
		assert.deepEqual(oUriParams.get('@',true), ['test']);
	});

	QUnit.test("URL with a hash", function(assert) {
		var oUriParams = new UriParameters("/service?x=1&y=#&z=test");
		assert.deepEqual(oUriParams.get('x',true), ['1'], "parameter before hash");
		assert.deepEqual(oUriParams.get('y',true), [""], "parameter without value, before hash");
		assert.deepEqual(oUriParams.get('z',true), [], "parameter after hash");
	});

	QUnit.test("URL with multiple values for a single name", function(assert) {
		var oUriParams = new UriParameters("/service?addin=1&addin=2&addin=3");
		assert.deepEqual(oUriParams.get('addin',true), ['1','2','3'], "param with multiple values");
	});

	QUnit.test("URL with param names from Object.prototype", function(assert) {
		var oUriParams = new UriParameters("/service?constructor=1&hasOwnProperty=2");
		assert.deepEqual(oUriParams.get('constructor',true), ['1'], "param with Object.prototype name");
		assert.deepEqual(oUriParams.get('hasOwnProperty',true), ['2'], "param with Object.prototype name");
	});

	QUnit.test("URL with encoded values or spaces", function(assert) {
		var oUriParams = new UriParameters("/service?key1=&key2&search=Rock+%26+Roll&rock%26roll=here+to+stay&weird=%26%CE%A8%E2%88%88");
		assert.deepEqual(oUriParams.get('key1',true), [''], "empty value with equals sign");
		assert.deepEqual(oUriParams.get('key2',true), [''], "empty  value");
		assert.deepEqual(oUriParams.get('rock&roll',true), ['here to stay'], "encoded key");
		assert.deepEqual(oUriParams.get('search',true), ['Rock & Roll'], "encoded value");
		assert.deepEqual(oUriParams.get('weird',true), ['&\u03A8\u2208'], "hex encoded value");
		//alert('&\u03A8\u2208');
	});
});