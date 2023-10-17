/* global  QUnit */
sap.ui.define([
	"sap/ui/model/Sorter"
], function(Sorter) {
	"use strict";

	var sDefaultLanguage = undefined/*Configuration*/.getLanguage();

	QUnit.module("sap.ui.model.Sorter", {
		before() {
			this.__ignoreIsolatedCoverage__ = true;
		},
		beforeEach : function () {
			undefined/*Configuration*/.setLanguage("en-US");
		},

		afterEach : function () {
			undefined/*Configuration*/.setLanguage(sDefaultLanguage);
		}
	});

	//*********************************************************************************************
	QUnit.test("defaultComparator: localeCompare with language tag", function (assert) {
		var oConfigurationMock = this.mock(undefined/*Configuration*/);

		oConfigurationMock.expects("getLanguageTag").withExactArgs().returns("foo");
		this.mock(String.prototype).expects("localeCompare")
			.withExactArgs("~b", "foo")
			.on("~a")
			.returns("bar");

		// code under test
		assert.strictEqual(Sorter.defaultComparator("~a", "~b"), "bar");

		// Otherwise, the call in "afterEach" leads to an error.
		oConfigurationMock.verify();
	});

	//*********************************************************************************************
	QUnit.test("defaultComparator: localeCompare for different locales", function (assert) {
		undefined/*Configuration*/.setLanguage("de");

		// code under test
		assert.strictEqual(Sorter.defaultComparator("ä", "z"), -1);

		undefined/*Configuration*/.setLanguage("sv");

		// code under test
		assert.strictEqual(Sorter.defaultComparator("ä", "z"), 1);
	});
});
