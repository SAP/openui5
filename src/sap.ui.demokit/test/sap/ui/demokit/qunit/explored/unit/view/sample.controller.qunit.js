sap.ui.define([
	"jquery.sap.global",
	"codeUnterTest/view/sample.controller"
], function ($, Controller) {
	"use strict";

	var MODULE_PATH = "modulePathForTesting";
	var URL_PREFIX = "./";
	$.sap.registerResourcePath(MODULE_PATH, URL_PREFIX);

	QUnit.module("IFrame URL creation");

	// have a consistent URL state

	[{
		sIFrameUrl: "test.html",
		sWindowParameters: "some=parameter",
		sExpectedUrl: "test.html?some=parameter&sap-ui-theme=base"
	},
	{
		sIFrameUrl: "test.html",
		sWindowParameters: "",
		sExpectedUrl: "test.html?sap-ui-theme=base"
	},
	{
		sIFrameUrl: "test.html?foo=bar",
		sWindowParameters: "some=parameter",
		sExpectedUrl: "test.html?foo=bar&some=parameter&sap-ui-theme=base"
	},
	{
		sIFrameUrl: "test.html?foo=bar",
		sWindowParameters: "",
		sExpectedUrl: "test.html?foo=bar&sap-ui-theme=base"
	}].forEach(function (oTest) {
		QUnit.test("Should create the correct url for " + oTest.sIFrameUrl , function (assert) {
			// used for stubbing window.location.search
			history.pushState({}, "unit tests for explored app", "unitTests.qunit.html?" + oTest.sWindowParameters);
			var sCreatedUrl = Controller._createIFrameURL(oTest.sIFrameUrl, MODULE_PATH);
			assert.strictEqual(sCreatedUrl, URL_PREFIX + oTest.sExpectedUrl);
		});
	});

});