/*global QUnit*/

sap.ui.define([
	"sap/m/Text",
	"codeUnterTest/model/formatter",
	"../helper/FakeI18nModel"
], function (Text, formatter, FakeI18n) {
	"use strict";

	QUnit.module("formatter - crossLink");

	QUnit.test("Should format a link starting with # to current URL prepended with the link", function (assert) {
		var sOriginalHash = document.location.hash;
		document.location.hash = "demoapps.html";
		assert.ok(formatter.crossLink("#test123").search("#test123") > 0, "the link is appended at the end");
		document.location.hash = sOriginalHash;
	});

	QUnit.test("Should not format any other link", function (assert) {
		assert.strictEqual(formatter.crossLink("something.different"), "something.different");
		assert.strictEqual(formatter.crossLink(""), "");
	});

	QUnit.module("formatter - libraryLink");

	QUnit.test("Should format a library link with sap.* to the corresponding demokit hash", function (assert) {
		assert.strictEqual(formatter.libraryLink.call({formatter: formatter}, "sap.foo.bar"), "#docs/api/symbols/sap.foo.bar.html");
	});

	QUnit.test("Should format any other library link to the empty string", function (assert) {
		assert.strictEqual(formatter.libraryLink.call({formatter: formatter}, "something.different"), "");
		assert.strictEqual(formatter.libraryLink.call({formatter: formatter}, ""), "");
	});

	QUnit.module("formatter - libraryLinkEnabled");

	QUnit.test("Should format a library link with sap.* to true", function (assert) {
		assert.strictEqual(formatter.libraryLinkEnabled.call({formatter: formatter}, "sap.foo.bar"), true);
	});

	QUnit.test("Should format any other library link to false", function (assert) {
		assert.strictEqual(formatter.libraryLinkEnabled.call({formatter: formatter}, "something.different"), false);
		assert.strictEqual(formatter.libraryLinkEnabled.call({formatter: formatter}, ""), false);
	});

	QUnit.module("formatter - categoryName");

	function categoryNameTestCase(assert, sCategoryId, sExpectedText) {

		//Act
		var oControllerStub = {
			getModel: function () {
				return new FakeI18n({
					"DEMO_APPS_CATEGORY_SHOWCASE": 1,
					"DEMO_APPS_CATEGORY_TUTORIAL": 2,
					"DEMO_APPS_CATEGORY_TEMPLATE": 3,
					"DEMO_APPS_CATEGORY_MISC": 4
				});
			}
		};
		var fnStubbedFormatter = formatter.categoryName.bind(oControllerStub);
		var fText = fnStubbedFormatter(sCategoryId);

		//Assert
		assert.strictEqual(fText, sExpectedText);
	}

	QUnit.test("Should provide 'Showcase' category text", function (assert) {
		categoryNameTestCase.call(this, assert, "Showcase", 1);
	});

	QUnit.test("Should provide 'Tutorial' category text", function (assert) {
		categoryNameTestCase.call(this, assert, "Tutorial", 2);
	});

	QUnit.test("Should provide 'Template' category text", function (assert) {
		categoryNameTestCase.call(this, assert, "Template", 3);
	});

	QUnit.test("Should provide 'Misc' category text", function (assert) {
		categoryNameTestCase.call(this, assert, "Misc", 4);
	});

});