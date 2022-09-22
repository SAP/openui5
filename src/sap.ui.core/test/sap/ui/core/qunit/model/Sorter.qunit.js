/* global  QUnit */
sap.ui.define([
	"sap/ui/core/Configuration",
	"sap/ui/model/Sorter"
], function(Configuration, Sorter) {
	"use strict";

	var sDefaultLanguage = Configuration.getLanguage();

	QUnit.module("sap.ui.model.Sorter", {
		beforeEach : function () {
			Configuration.setLanguage("en-US");
		},

		afterEach : function () {
			Configuration.setLanguage(sDefaultLanguage);
		}
	});

	//*********************************************************************************************
	QUnit.test("defaultComparator: localeCompare with language tag", function (assert) {
		this.mock(Configuration).expects("getLanguageTag").withExactArgs().returns("foo");
		this.mock(String.prototype).expects("localeCompare")
			.withExactArgs("~b", "foo")
			.on("~a")
			.returns("bar");

		// code under test
		assert.strictEqual(Sorter.defaultComparator("~a", "~b"), "bar");
	});

	//*********************************************************************************************
	QUnit.test("defaultComparator: localeCompare for different locales", function (assert) {
		Configuration.setLanguage("de");

		// code under test
		assert.strictEqual(Sorter.defaultComparator("ä", "z"), -1);

		Configuration.setLanguage("sv");

		// code under test
		assert.strictEqual(Sorter.defaultComparator("ä", "z"), 1);
	});
});
