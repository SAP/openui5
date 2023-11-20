/* global  QUnit */
sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/ui/model/Sorter"
], function(Localization, Sorter) {
	"use strict";

	var sDefaultLanguage = Localization.getLanguage();

	QUnit.module("sap.ui.model.Sorter", {
		before() {
			this.__ignoreIsolatedCoverage__ = true;
		},
		beforeEach : function () {
			Localization.setLanguage("en-US");
		},

		afterEach : function () {
			Localization.setLanguage(sDefaultLanguage);
		}
	});

	//*********************************************************************************************
	QUnit.test("defaultComparator: localeCompare with language tag", function (assert) {
		var oLocalizationMock = this.mock(Localization);

		oLocalizationMock.expects("getLanguageTag").withExactArgs().returns("foo");
		this.mock(String.prototype).expects("localeCompare")
			.withExactArgs("~b", "foo")
			.on("~a")
			.returns("bar");

		// code under test
		assert.strictEqual(Sorter.defaultComparator("~a", "~b"), "bar");

		// Otherwise, the call in "afterEach" leads to an error.
		oLocalizationMock.verify();
	});

	//*********************************************************************************************
	QUnit.test("defaultComparator: localeCompare for different locales", function (assert) {
		Localization.setLanguage("de");

		// code under test
		assert.strictEqual(Sorter.defaultComparator("ä", "z"), -1);

		Localization.setLanguage("sv");

		// code under test
		assert.strictEqual(Sorter.defaultComparator("ä", "z"), 1);
	});
});
