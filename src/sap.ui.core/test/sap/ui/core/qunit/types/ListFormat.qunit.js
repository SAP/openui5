/*global QUnit */
sap.ui.define(['sap/ui/core/format/ListFormat', 'sap/ui/core/Locale', "sap/base/Log"], function (ListFormat, Locale, Log) {
	"use strict";

	QUnit.module("ListFormat", {
		before() {
			this.__ignoreIsolatedCoverage__ = true;
		},
		beforeEach: function () {
			this.oLocale = new Locale("de-DE");
			this.LogErrorSpy = this.spy(Log, "error");
			this.aInput = [
				[],
				["1"],
				["1", "2"],
				["1,2"],
				["1, 2, 3,5"],
				["1", "2", "", "3", "4"],
				["", "", ""],
				["1", "2", "3", "4", "5", "6", "7", "8"],
				["1 und 1,", "2", "3", "4", "5", "6", "7", "8"],
				["{0}", "{1}", ";"]
			];
		},
		afterEach: function () {
			delete this.oLocale;
		}
	});

	function runTests(assert, oLocale, aInput, aFormattedValues) {
		var oListFormat = ListFormat.getInstance(oLocale),
			sFormattedValue, aParsedValues;

		for (var i = 0; i < aInput.length; i++) {
			sFormattedValue = oListFormat.format(aInput[i]);
			aParsedValues = oListFormat.parse(aFormattedValues[i]);

			assert.deepEqual(sFormattedValue, aFormattedValues[i], "The list is correctly formatted.");
			assert.deepEqual(aParsedValues, aInput[i], 'Array [' + aInput[i] + '] with ' + aInput[i].length + " elements should be returned");
		}
	}

	QUnit.test("check symmetry of formatting and parsing - (de-DE)", function (assert) {
		var oLocale = new Locale("de-DE"),
			aFormattedValues = [
				"",
				"1",
				"1 und 2",
				"1,2",
				"1, 2, 3,5",
				"1, 2, , 3 und 4",
				",  und ",
				"1, 2, 3, 4, 5, 6, 7 und 8",
				"1 und 1,, 2, 3, 4, 5, 6, 7 und 8",
				"{0}, {1} und ;"
			];

		runTests(assert, oLocale, this.aInput, aFormattedValues);
	});

	QUnit.test("check symmetry of formatting and parsing - (en_US)", function (assert) {
		var oLocale = new Locale("en_US"),
			aFormattedValues = [
				"",
				"1",
				"1 and 2",
				"1,2",
				"1, 2, 3,5",
				"1, 2, , 3, and 4",
				", , and ",
				"1, 2, 3, 4, 5, 6, 7, and 8",
				"1 und 1,, 2, 3, 4, 5, 6, 7, and 8",
				"{0}, {1}, and ;"
			];

		runTests(assert, oLocale, this.aInput, aFormattedValues);
	});

	QUnit.test("check symmetry of formatting and parsing - (he)", function (assert) {
		var oLocale = new Locale("he"),
			aFormattedValues = [
				"",
				"1",
				"1 ו2",
				"1,2",
				"1, 2, 3,5",
				"1, 2, , 3 ו4",
				",  ו",
				"1, 2, 3, 4, 5, 6, 7 ו8",
				"1 und 1,, 2, 3, 4, 5, 6, 7 ו8",
				"{0}, {1} ו;"
			];

		runTests(assert, oLocale, this.aInput, aFormattedValues);
	});

	QUnit.test("with invalid input type - (de-DE)", function (assert) {
		var sInput = "1,2,3,4";

		var oListFormat = ListFormat.getInstance(this.oLocale);
		var sResult = oListFormat.format(sInput);
		assert.equal(sResult, "", "An empty string should be returned.");
		assert.equal(this.LogErrorSpy.callCount, 1, "Log.error should be called.");
		assert.equal(this.LogErrorSpy.getCall(0).args[0], "ListFormat can only format with an array given.", "Correct error log should be thrown.");
	});

	QUnit.test("with given formatOptions", function (assert) {
		var aInput = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"], aExpectedResult,
			oListFormat = ListFormat.getInstance(this.oLocale),
			sResult;

		sResult = oListFormat.format(aInput);
		assert.ok(sResult, "A formatted string should be returned");
		assert.equal(sResult, "1, 2, 3, 4, 5, 6, 7, 8, 9 und 10", "Values are correctly formatted.");

		aExpectedResult = oListFormat.parse(sResult);
		assert.deepEqual(aExpectedResult, aInput, "Values are correctly parsed.");


		oListFormat = ListFormat.getInstance({
			style: "wide"
		}, this.oLocale);
		sResult = oListFormat.format(aInput);
		assert.ok(sResult, "A formatted string should be returned");
		assert.equal(sResult, "1, 2, 3, 4, 5, 6, 7, 8, 9 und 10", "Values are correctly formatted.");

		aExpectedResult = oListFormat.parse(sResult);
		assert.deepEqual(aExpectedResult, aInput, "Values are correctly parsed.");


		this.oLocale = new Locale("en_US");
		oListFormat = ListFormat.getInstance({
			style: "short"
		}, this.oLocale);

		sResult = oListFormat.format(aInput);
		assert.ok(sResult, "A formatted string should be returned");
		assert.equal(sResult, "1, 2, 3, 4, 5, 6, 7, 8, 9, & 10", "Values are correctly formatted.");

		aExpectedResult = oListFormat.parse(sResult);
		assert.deepEqual(aExpectedResult, aInput, "Values are correctly parsed.");


		this.oLocale = new Locale("fr");
		oListFormat = ListFormat.getInstance({
			style: "nostyle"
		}, this.oLocale);

		sResult = oListFormat.format(aInput);
		assert.equal(sResult, "", "An empty string should be returned.");
		assert.equal(this.LogErrorSpy.callCount, 1, "Log.error should be called.");
		assert.equal(this.LogErrorSpy.getCall(0).args[0], "No list pattern exists for the provided format options (type, style).", "Correct error log should be thrown.");

		aExpectedResult = oListFormat.parse(sResult);
		assert.deepEqual(aExpectedResult, [], "Values are correctly parsed.");
		assert.equal(this.LogErrorSpy.callCount, 2, "Log.error should be called.");
		assert.equal(this.LogErrorSpy.getCall(1).args[0], "No list pattern exists for the provided format options (type, style).", "Correct error log should be thrown.");

	});

	QUnit.test("Edge case where items include delimiters of the list patterns", function (assert) {
		// more list elements after formatting + parsing
		var aInput = ["1, 2", "3, 4", "5 und 6"],
			aActualResult = ["1", "2", "3", "4 und 5", "6"],
			aExpectedResult,
			oListFormat = ListFormat.getInstance(this.oLocale),
			sResult;

		sResult = oListFormat.format(aInput);
		assert.ok(sResult, "A formatted string should be returned");
		assert.equal(sResult, "1, 2, 3, 4 und 5 und 6", "Values are correctly formatted.");

		aExpectedResult = oListFormat.parse(sResult);
		assert.deepEqual(aExpectedResult, aActualResult, "Values are correctly parsed but differs from the original input.");

		// less list elements after formatting + parsing
		aInput = ["1 und 2", "3"];
		aActualResult = ["1 und 2 und 3"];
		oListFormat = ListFormat.getInstance(this.oLocale);

		sResult = oListFormat.format(aInput);
		assert.ok(sResult, "A formatted string should be returned");
		assert.equal(sResult, "1 und 2 und 3", "Values are correctly formatted.");

		aExpectedResult = oListFormat.parse(sResult);
		assert.deepEqual(aExpectedResult, aActualResult, "Values are correctly parsed but differs from the original input.");
	});

});