/*global QUnit */
sap.ui.define([
	"sap/m/inputUtils/highlightItemsWithContains"
], function (
	highlightedTextsWithContains
) {
	"use strict";

	QUnit.module("General");

	QUnit.test("_createHighlightedText", function (assert) {
		// Setup
		var sTestInput = "Lorem ipsum dolor sit amet",
			sTestInput2 = "서비스 ID 유헝 성별",
			oDivDomRef = document.createElement("div");

		highlightedTextsWithContains([oDivDomRef]);

		assert.strictEqual(
			oDivDomRef.innerHTML,
			"", "Empty inputs, empty output");

		// Act
		oDivDomRef.innerText = sTestInput;
		highlightedTextsWithContains([oDivDomRef]);
		// Assert
		assert.strictEqual(
			oDivDomRef.innerHTML,
			"Lorem ipsum dolor sit amet", "No second argument, no formatting");

		// Act
		oDivDomRef.innerText = sTestInput;
		highlightedTextsWithContains([oDivDomRef], "dolor");
		// Assert
		assert.strictEqual(
			oDivDomRef.innerHTML,
			"Lorem ipsum <span class=\"sapMInputHighlight\">dolor</span> sit amet", "Highlight text in the middle");

		// Act
		oDivDomRef.innerText = sTestInput;
		highlightedTextsWithContains([oDivDomRef], "lorem");
		// Assert
		assert.strictEqual(
			oDivDomRef.innerHTML,
			"<span class=\"sapMInputHighlight\">Lorem</span> ipsum dolor sit amet", "Highlight text @ start");

		// Act
		oDivDomRef.innerText = sTestInput;
		highlightedTextsWithContains([oDivDomRef], "amet");
		// Assert
		assert.strictEqual(
			oDivDomRef.innerHTML,
			"Lorem ipsum dolor sit <span class=\"sapMInputHighlight\">amet</span>", "Highlight text in the end");

		// Act
		oDivDomRef.innerText = sTestInput;
		highlightedTextsWithContains([oDivDomRef], "zzz");
		// Assert
		assert.strictEqual(
			oDivDomRef.innerHTML,
			"Lorem ipsum dolor sit amet", "No match, no highlight");

		// Act
		oDivDomRef.innerText = sTestInput2;
		highlightedTextsWithContains([oDivDomRef], "zzz");
		// Assert
		assert.strictEqual(
			oDivDomRef.innerHTML,
			"서비스 ID 유헝 성별", "Unicode characters: No match, no highlight");

		// Act
		oDivDomRef.innerText = sTestInput2;
		highlightedTextsWithContains([oDivDomRef], "ID");
		// Assert
		assert.strictEqual(
			oDivDomRef.innerHTML,
			"서비스 <span class=\"sapMInputHighlight\">ID</span> 유헝 성별", "Unicode characters: Match ascii");

		// Act
		oDivDomRef.innerText = sTestInput2;
		highlightedTextsWithContains([oDivDomRef], "서비");
		// Assert
		assert.strictEqual(
			oDivDomRef.innerHTML,
			"<span class=\"sapMInputHighlight\">서비</span>스 ID 유헝 성별", "Unicode characters: Match beginning");

		// Act
		oDivDomRef.innerText = sTestInput2;
		highlightedTextsWithContains([oDivDomRef], "유헝");
		// Assert
		assert.strictEqual(
			oDivDomRef.innerHTML,
			"서비스 ID <span class=\"sapMInputHighlight\">유헝</span> 성별", "Unicode characters: Match beginning");
	});

	QUnit.test("_createHighlightedText edge case with repeating pattern", function (assert) {
		// Setup
		var sTestInput = "Prod prodProduct",
			sTestInput2 = "Prod prodProduct prod",
			sTestInput3 = "Zaasd Adr dar",
			oDivDomRef = document.createElement("div");

		// Act
		oDivDomRef.innerText = sTestInput;
		highlightedTextsWithContains([oDivDomRef], 'prod');
		// Assert
		assert.strictEqual(
			oDivDomRef.innerHTML,
			"<span class=\"sapMInputHighlight\">Prod</span> <span class=\"sapMInputHighlight\">prod</span><span class=\"sapMInputHighlight\">Prod</span>uct",
			"Should highlight ONLY words that start with the input pattern");

		// Act
		oDivDomRef.innerText = sTestInput;
		highlightedTextsWithContains([oDivDomRef], 'prod', true);
		// Assert
		assert.strictEqual(
			oDivDomRef.innerHTML,
			"<span class=\"sapMInputHighlight\">Prod</span> <span class=\"sapMInputHighlight\">prod</span><span class=\"sapMInputHighlight\">Prod</span>uct",
			"Should highlight ONLY words that start with the input pattern");

		// Act
		oDivDomRef.innerText = sTestInput2;
		highlightedTextsWithContains([oDivDomRef], 'prod', true);
		// Assert
		assert.strictEqual(
			oDivDomRef.innerHTML,
			"<span class=\"sapMInputHighlight\">Prod</span> <span class=\"sapMInputHighlight\">prod</span><span class=\"sapMInputHighlight\">Prod</span>uct <span class=\"sapMInputHighlight\">prod</span>",
			"Should highlight ONLY words that start with the input pattern");

		// Act
		oDivDomRef.innerText = sTestInput3;
		highlightedTextsWithContains([oDivDomRef], 'a', true);
		// Assert
		assert.strictEqual(
			oDivDomRef.innerHTML,
			"Z<span class=\"sapMInputHighlight\">a</span><span class=\"sapMInputHighlight\">a</span>sd <span class=\"sapMInputHighlight\">A</span>dr d<span class=\"sapMInputHighlight\">a</span>r",
			"Should highlight ONLY words that start with the input pattern");
	});

	QUnit.test("_createHighlightedText continuous", function (assert) {
		// Setup
		var sTestInput = "Lorem ipsum dolor Lorem amet",
			sTestInput2 = "서비스 ID 유헝 서비스 성별",
			oDivDomRef = document.createElement("div");

		// Act
		oDivDomRef.innerText = sTestInput;
		highlightedTextsWithContains([oDivDomRef], "lorem", true);
		// Assert
		assert.strictEqual(
			oDivDomRef.innerHTML,
			"<span class=\"sapMInputHighlight\">Lorem</span> ipsum dolor <span class=\"sapMInputHighlight\">Lorem</span> amet",
			"Double highlights for ASCII");

		// Act
		oDivDomRef.innerText = sTestInput2;
		highlightedTextsWithContains([oDivDomRef], "서비스", true);
		// Assert
		assert.strictEqual(
			oDivDomRef.innerHTML,
			"<span class=\"sapMInputHighlight\">서비스</span> ID 유헝 <span class=\"sapMInputHighlight\">서비스</span> 성별",
			"Double highlight with unicode characters");
	});

	QUnit.test("highlightSuggestionItems", function (assert) {
		// Setup
		var sTestInput = "Lorem ipsum dolor sit amet",
			sTestInput2 = "서비스 ID 유헝 성별",
			oDivDomRef = document.createElement("div");

		// Act
		oDivDomRef.innerText = sTestInput;
		highlightedTextsWithContains([oDivDomRef]);
		// Assert
		assert.strictEqual(oDivDomRef.innerHTML,
			"Lorem ipsum dolor sit amet", "No second argument, no formatting");

		// Act
		oDivDomRef.innerText = sTestInput;
		highlightedTextsWithContains([oDivDomRef], "dolor");
		// Assert
		assert.strictEqual(oDivDomRef.innerHTML,
			"Lorem ipsum <span class=\"sapMInputHighlight\">dolor</span> sit amet", "Highlight text in the middle");

		// Act
		oDivDomRef.innerText = sTestInput;
		highlightedTextsWithContains([oDivDomRef], "lorem");
		// Assert
		assert.strictEqual(oDivDomRef.innerHTML,
			"<span class=\"sapMInputHighlight\">Lorem</span> ipsum dolor sit amet", "Highlight text @ start");

		// Act
		oDivDomRef.innerText = sTestInput;
		highlightedTextsWithContains([oDivDomRef], "amet");
		// Assert
		assert.strictEqual(oDivDomRef.innerHTML,
			"Lorem ipsum dolor sit <span class=\"sapMInputHighlight\">amet</span>", "Highlight text in the end");

		// Act
		oDivDomRef.innerText = sTestInput;
		highlightedTextsWithContains([oDivDomRef], "zzz");
		// Assert
		assert.strictEqual(oDivDomRef.innerHTML,
			"Lorem ipsum dolor sit amet", "No match, no highlight");

		// Act
		oDivDomRef.innerText = sTestInput2;
		highlightedTextsWithContains([oDivDomRef], "zzz");
		// Assert
		assert.strictEqual(oDivDomRef.innerHTML,
			"서비스 ID 유헝 성별", "Unicode characters: No match, no highlight");

		// Act
		oDivDomRef.innerText = sTestInput2;
		highlightedTextsWithContains([oDivDomRef], "ID");
		// Assert
		assert.strictEqual(oDivDomRef.innerHTML,
			"서비스 <span class=\"sapMInputHighlight\">ID</span> 유헝 성별", "Unicode characters: Match ascii");

		// Act
		oDivDomRef.innerText = sTestInput2;
		highlightedTextsWithContains([oDivDomRef], "서비");
		// Assert
		assert.strictEqual(oDivDomRef.innerHTML,
			"<span class=\"sapMInputHighlight\">서비</span>스 ID 유헝 성별", "Unicode characters: Match beginning");

		// Act
		oDivDomRef.innerText = sTestInput2;
		highlightedTextsWithContains([oDivDomRef], "유헝");
		// Assert
		assert.strictEqual(oDivDomRef.innerHTML,
			"서비스 ID <span class=\"sapMInputHighlight\">유헝</span> 성별", "Unicode characters: Match beginning");
	});

	QUnit.test("highlightSuggestionItems continuous", function (assert) {
		// Setup
		var sTestInput = "Lorem ipsum dolor Lorem amet",
			sTestInput2 = "서비스 ID 유헝 서비스 성별",
			oDivDomRef = document.createElement("div");

		// Act
		oDivDomRef.innerText = sTestInput;
		highlightedTextsWithContains([oDivDomRef], "lorem", true);
		// Assert
		assert.strictEqual(oDivDomRef.innerHTML,
			"<span class=\"sapMInputHighlight\">Lorem</span> ipsum dolor <span class=\"sapMInputHighlight\">Lorem</span> amet",
			"Double highlights for ASCII");

		// Act
		oDivDomRef.innerText = sTestInput2;
		highlightedTextsWithContains([oDivDomRef], "서비스", true);
		// Assert
		assert.strictEqual(oDivDomRef.innerHTML,
			"<span class=\"sapMInputHighlight\">서비스</span> ID 유헝 <span class=\"sapMInputHighlight\">서비스</span> 성별",
			"Double highlight with unicode characters");
	});
});
