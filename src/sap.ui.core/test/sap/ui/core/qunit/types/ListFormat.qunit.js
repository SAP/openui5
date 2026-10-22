/*global QUnit */
sap.ui.define(['sap/ui/core/format/ListFormat', 'sap/ui/core/Locale', "sap/base/Log"], function (ListFormat, Locale, Log) {
	"use strict";

	QUnit.module("ListFormat", {
		before() {
			this.__ignoreIsolatedCoverage__ = true;
		},
		beforeEach: function () {
			this.LogErrorSpy = this.spy(Log, "error");
		}
	});

	const aInput = [
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
	function runTests(assert, oLocale, aFormattedValues) {
		const oListFormat = ListFormat.getInstance(oLocale);
		let sFormattedValue;
		let aParsedValues;

		for (let i = 0; i < aInput.length; i++) {
			sFormattedValue = oListFormat.format(aInput[i]);
			aParsedValues = oListFormat.parse(aFormattedValues[i]);

			assert.deepEqual(sFormattedValue, aFormattedValues[i], "The list is correctly formatted.");
			assert.deepEqual(aParsedValues, aInput[i],
				'Array [' + aInput[i] + '] with ' + aInput[i].length + " elements should be returned");
		}
	}

	QUnit.test("check symmetry of formatting and parsing - (de-DE)", function (assert) {
		const aFormattedValues = [
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

		runTests(assert, new Locale("de-DE"), aFormattedValues);
	});

	QUnit.test("check symmetry of formatting and parsing - (en_US)", function (assert) {
		const aFormattedValues = [
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

		runTests(assert, new Locale("en_US"), aFormattedValues);
	});

	QUnit.test("check symmetry of formatting and parsing - (he)", function (assert) {
		const aFormattedValues = [
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

		runTests(assert, new Locale("he"), aFormattedValues);
	});

	QUnit.test("with invalid input type - (de-DE)", function (assert) {
		const sInput = "1,2,3,4";

		const oListFormat = ListFormat.getInstance(this.oLocale);
		const sResult = oListFormat.format(sInput);
		assert.equal(sResult, "", "An empty string should be returned.");
		assert.equal(this.LogErrorSpy.callCount, 1, "Log.error should be called.");
		assert.equal(this.LogErrorSpy.getCall(0).args[0],
			"ListFormat can only format with an array given.", "Correct error log should be thrown.");
	});

	QUnit.test("with given formatOptions", function (assert) {
		const aInput = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
		const oLocale = new Locale("de-DE");
		let oListFormat = ListFormat.getInstance(oLocale);

		let sFormatResult = oListFormat.format(aInput);
		assert.ok(sFormatResult, "A formatted string should be returned");
		assert.equal(sFormatResult, "1, 2, 3, 4, 5, 6, 7, 8, 9 und 10", "Values are correctly formatted.");

		let aParseResult = oListFormat.parse(sFormatResult);
		assert.deepEqual(aParseResult, aInput, "Values are correctly parsed.");


		oListFormat = ListFormat.getInstance({style: "wide"}, oLocale);
		sFormatResult = oListFormat.format(aInput);
		assert.ok(sFormatResult, "A formatted string should be returned");
		assert.equal(sFormatResult, "1, 2, 3, 4, 5, 6, 7, 8, 9 und 10", "Values are correctly formatted.");

		aParseResult = oListFormat.parse(sFormatResult);
		assert.deepEqual(aParseResult, aInput, "Values are correctly parsed.");


		oListFormat = ListFormat.getInstance({style: "short"}, new Locale("en_US"));

		sFormatResult = oListFormat.format(aInput);
		assert.ok(sFormatResult, "A formatted string should be returned");
		assert.equal(sFormatResult, "1, 2, 3, 4, 5, 6, 7, 8, 9, & 10", "Values are correctly formatted.");

		aParseResult = oListFormat.parse(sFormatResult);
		assert.deepEqual(aParseResult, aInput, "Values are correctly parsed.");


		oListFormat = ListFormat.getInstance({style: "narrow"}, oLocale);

		sFormatResult = oListFormat.format(aInput);
		assert.equal(sFormatResult, "", "An empty string should be returned.");
		assert.equal(this.LogErrorSpy.callCount, 1, "Log.error should be called.");
		assert.equal(this.LogErrorSpy.getCall(0).args[0], "No list pattern exists for the provided format options (type, style).", "Correct error log should be thrown.");

		aParseResult = oListFormat.parse(sFormatResult);
		assert.deepEqual(aParseResult, [], "Values are correctly parsed.");
		assert.equal(this.LogErrorSpy.callCount, 2, "Log.error should be called.");
		assert.equal(this.LogErrorSpy.getCall(1).args[0], "No list pattern exists for the provided format options (type, style).", "Correct error log should be thrown.");

	});

	QUnit.test("Edge case where items include delimiters of the list patterns", function (assert) {
		// more list elements after formatting + parsing
		let aInput = ["1, 2", "3, 4", "5 und 6"];
		const oLocale = new Locale("de-DE");
		let oListFormat = ListFormat.getInstance(oLocale);

		let sFormatResult = oListFormat.format(aInput);
		assert.ok(sFormatResult, "A formatted string should be returned");
		assert.equal(sFormatResult, "1, 2, 3, 4 und 5 und 6", "Values are correctly formatted.");

		let aParseResult = oListFormat.parse(sFormatResult);
		let aExpectedResult = ["1", "2", "3", "4 und 5", "6"];
		assert.deepEqual(aParseResult, aExpectedResult, "Values are correctly parsed but differs from the original input.");

		// less list elements after formatting + parsing
		aInput = ["1 und 2", "3"];
		aExpectedResult = ["1 und 2 und 3"];
		oListFormat = ListFormat.getInstance(oLocale);

		sFormatResult = oListFormat.format(aInput);
		assert.ok(sFormatResult, "A formatted string should be returned");
		assert.equal(sFormatResult, "1 und 2 und 3", "Values are correctly formatted.");

		aParseResult = oListFormat.parse(sFormatResult);
		assert.deepEqual(aParseResult, aExpectedResult, "Values are correctly parsed but differs from the original input.");
	});

	//*********************************************************************************************
	QUnit.test("items containing '$' replacement patterns are inserted literally", function (assert) {
		// '$' sequences in the values must not be interpreted as
		// String.prototype.replace replacement patterns (e.g. "$&", "$$", "$'").
		const oListFormat = ListFormat.getInstance(new Locale("de-DE"));
		assert.equal(oListFormat.format(["Preis $&", "B"]), "Preis $& und B",
			"'$&' in a value (exact-count pattern) is kept literally");
		assert.equal(oListFormat.format(["100$$", "B"]), "100$$ und B",
			"'$$' in a value is kept literally");
		assert.equal(oListFormat.format(["a$'b", "B", "C"]), "a$'b, B und C",
			"\"$'\" in the start element is kept literally");
		assert.equal(oListFormat.format(["A", "B", "c$&d"]), "A, B und c$&d",
			"'$&' in the end element is kept literally");
	});

	//*********************************************************************************************
	QUnit.test("items containing '{0}' and '{1}' patterns are inserted literally", function (assert) {
		const oListFormat = ListFormat.getInstance(new Locale("de-DE"));
		assert.equal(oListFormat.format(["{1}"]), "{1}");
		assert.equal(oListFormat.format(["{1}", "{0}"]), "{1} und {0}");
		assert.equal(oListFormat.format(["{1}", "{1}", "{0}", "{1}"]), "{1}, {1}, {0} und {1}");
	});
});