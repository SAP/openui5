/* global QUnit */

sap.ui.define([
	"sap/ui/rta/util/UrlParser",
	"sap/ui/thirdparty/sinon-4"
], function(
	UrlParser,
	sinon
) {
	"use strict";
	var sandbox = sinon.createSandbox();

	QUnit.module("getParams function test", {
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when testsuite parameters are given", function(assert) {
			var mParams = UrlParser.getParams();
			assert.ok(Object.keys(mParams).length > 1, "then multiple parameters are returned");
		});

		QUnit.test("when url with emtpy parameter string is given", function(assert) {
			var mParams = UrlParser.getParams("");
			assert.strictEqual(Object.keys(mParams)[0], "", "then object with empty string as key is returned");
			assert.strictEqual(Object.values(mParams)[0], undefined, "then object with undefined as value is returned");
		});

		QUnit.test("when url with parameter string is given", function(assert) {
			var mParams = UrlParser.getParams("?test=util/UrlParser");
			assert.strictEqual(Object.keys(mParams)[0], "test", "then object with given key is returned");
			assert.strictEqual(Object.values(mParams)[0], "util/UrlParser", "then object with given value is returned");
		});

		QUnit.test("when url with parameter string with 'true' value is given", function(assert) {
			var mParams = UrlParser.getParams("?test=true");
			assert.strictEqual(Object.keys(mParams)[0], "test", "then object with given key is returned");
			assert.strictEqual(Object.values(mParams)[0], true, "then object with given value is returned");
		});

		QUnit.test("when url with parameter string with 'false' value is given", function(assert) {
			var mParams = UrlParser.getParams("?test=false");
			assert.strictEqual(Object.keys(mParams)[0], "test", "then object with given key is returned");
			assert.strictEqual(Object.values(mParams)[0], false, "then object with given value is returned");
		});
	});

	QUnit.module("getParam function test", {
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when asked for not valid url parameter", function(assert) {
			var sValue = UrlParser.getParam("notexisting");
			assert.strictEqual(sValue, undefined, "then undefined value is returned");
		});
		QUnit.test("when asked for valid url parameter", function(assert) {
			var sValue = UrlParser.getParam("test");
			assert.ok(sValue.includes("UrlParser"), "then correct value is returned");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});