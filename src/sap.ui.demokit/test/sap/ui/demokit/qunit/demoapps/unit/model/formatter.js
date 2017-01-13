sap.ui.define([
	"sap/m/Text",
	"codeUnterTest/model/formatter",
	"test/helper/FakeI18nModel"
], function (Text, formatter, FakeI18n) {
	"use strict";

	QUnit.module("formatter - libraryLink");

	QUnit.test("Should format a library link with sap.* to the corresponding demokit hash", function (assert) {
		assert.strictEqual(formatter.libraryLink("sap.foo.bar"), "#docs/api/symbols/sap.foo.bar.html");
	});

	QUnit.test("Should format any other library link to the empty string", function (assert) {
		assert.strictEqual(formatter.libraryLink("something.different"), "");
		assert.strictEqual(formatter.libraryLink(""), "");
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
			getView : function () {
				return {
					getModel: function () {
						return new FakeI18n({
							"demoAppCategoryShowcase": 1,
							"demoAppCategoryTutorial": 2,
							"demoAppCategoryTemplate": 3,
							"demoAppCategoryMisc": 4
						});
					}
				}
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