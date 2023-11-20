/*global QUnit*/
sap.ui.define([
		"sap/ui/documentation/sdk/model/formatter",
		"sap/base/util/isEmptyObject"
],
function (
	formatter,
	isEmptyObject
) {
	"use strict";

	QUnit.module("routeParamsToFilePath", {
		beforeEach: function () {
			window['sap-ui-documentation-config'] || (window['sap-ui-documentation-config'] = {});
		}
	});

	QUnit.test("routeParamsToFilePath with empty parameters map", function (assert) {
		// Setup
		var oParams = {};

		// Act
		var sPath = formatter.routeParamsToFilePath(oParams);

		// Check
		assert.strictEqual(sPath, undefined, "correct path");
	});

	QUnit.test("routeParamsToFilePath with one empty parameter", function (assert) {
		// Setup
		var oParams = {p1: "", p2: null, p3: null};

		// Act
		var sPath = formatter.routeParamsToFilePath(oParams);

		// Check
		assert.strictEqual(sPath, undefined, "correct path");
	});

	QUnit.test("routeParamsToFilePath with one parameter", function (assert) {
		// Setup
		var oParams = {p1: "myFile", p2: undefined, p3: undefined};

		// Act
		var sPath = formatter.routeParamsToFilePath(oParams);

		// Check
		assert.strictEqual(sPath, "myFile", "correct path");
	});

	QUnit.test("routeParamsToFilePath with two parameters", function (assert) {
		// Setup
		var oParams = {p1: "path", p2: "myFile", p3: undefined};

		// Act
		var sPath = formatter.routeParamsToFilePath(oParams);

		// Check
		assert.strictEqual(sPath, "path/myFile", "correct path");
	});

	QUnit.test("routeParamsToFilePath with two parameters", function (assert) {
		// Setup
		var oParams = {p1: "path", p2: "myFile", p3: undefined};

		// Act
		var sPath = formatter.routeParamsToFilePath(oParams);

		// Check
		assert.strictEqual(sPath, "path/myFile", "correct path");
	});

	QUnit.test("routeParamsToFilePath with null parameters", function (assert) {
		// Setup
		var oParams = {p1: "path", p2: "myFile", p3: null};

		// Act
		var sPath = formatter.routeParamsToFilePath(oParams);

		// Check
		assert.strictEqual(sPath, "path/myFile", "correct path");
	});

	QUnit.module("filePathToRouteParams", {
		beforeEach: function () {
			window['sap-ui-documentation-config'] || (window['sap-ui-documentation-config'] = {});
		}
	});

	QUnit.test("filePathToRouteParams with empty path", function (assert) {
		// Setup
		var sFilePath = "";

		// Act
		var oParams = formatter.filePathToRouteParams(sFilePath);

		// Check
		assert.ok(isEmptyObject(oParams), "correct parameters map");
	});

	QUnit.test("filePathToRouteParams with single part path", function (assert) {
		// Setup
		var sFilePath = "myFile";

		// Act
		var oParams = formatter.filePathToRouteParams(sFilePath);

		// Check
		assert.strictEqual(oParams.p1, sFilePath, "first parameter specified");
		assert.strictEqual(oParams.p2, undefined, "no second parameter specified");
	});

	QUnit.test("filePathToRouteParams with two part path", function (assert) {
		// Setup
		var sFilePath = "path/myFile";

		// Act
		var oParams = formatter.filePathToRouteParams(sFilePath);

		// Check
		assert.strictEqual(oParams.p1, "path", "first parameter correct");
		assert.strictEqual(oParams.p2, "myFile", "second parameter correct");
		assert.strictEqual(oParams.p3, undefined, "no third parameter");
	});

});