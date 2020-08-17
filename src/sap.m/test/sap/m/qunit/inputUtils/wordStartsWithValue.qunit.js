/*global QUnit, sinon */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"jquery.sap.global",
	"sap/m/library",
	"sap/m/inputUtils/wordStartsWithValue"
], function (
	jQuery,
	mobileLibrary,
	wordStartsWithValue
) {
	"use strict";

	QUnit.module("General");

	QUnit.test("wordStartsWithValue", function (assert) {
		// Setup
		var sTestInput = "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
			sTestInput2 = "서비스 ID 서비스 유헝 성별";

		// Assert
		assert.ok(wordStartsWithValue(sTestInput, "ipsum"), "Detect properly starts with inputs");
		assert.ok(wordStartsWithValue(sTestInput, "elit"), "Detect properly starts with inputs");
		assert.ok(wordStartsWithValue(sTestInput, "consect"), "Detect properly starts with inputs");
		assert.ok(wordStartsWithValue(sTestInput, "Lorem ipsum dolor sit amet, consectetur adipiscing elit"), "Detect properly starts with inputs");


		assert.ok(wordStartsWithValue(sTestInput2, "ID"), "Detect properly starts with unicode characters");
		assert.ok(wordStartsWithValue(sTestInput2, "서비스"), "Detect properly starts with unicode characters");
		assert.ok(wordStartsWithValue(sTestInput2, "서비"), "Detect properly starts with unicode characters");
		assert.ok(wordStartsWithValue(sTestInput2, "유헝"), "Detect properly starts with unicode characters");
		assert.ok(!wordStartsWithValue(sTestInput2, "헝"), "Detect properly starts with unicode characters");
		assert.ok(!wordStartsWithValue(sTestInput2, "스 유헝 성"), "Detect properly starts with unicode characters");

	});
});
