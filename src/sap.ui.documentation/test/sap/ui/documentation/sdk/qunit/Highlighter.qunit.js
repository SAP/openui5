/*global QUnit*/
sap.ui.define([
	"sap/ui/documentation/sdk/controller/util/Highlighter"
],
function (
	Highlighter
) {
	"use strict";

	var oRootElement = document.getElementById("qunit-fixture"),
		oHighlighter = new Highlighter(oRootElement, {
			useExternalStyles: false,
			shouldBeObserved: true,
			isCaseSensitive: false
		});

	QUnit.module("API", {
	});

	QUnit.test("highlight", function (assert) {
		var done = assert.async(),
			sExpectedOutputHTML =
			'<span>' +
				'<span class="defaultHighlightedText">test</span>' +
			'</span>';

		// Setup
		oRootElement.innerText = "test";

		setTimeout(function() {
			// Act
			oHighlighter.highlight("test");

			assert.equal(oRootElement.innerHTML, sExpectedOutputHTML, "correct output");
			done();
		}, 0);
	});

	QUnit.test("highlight inside sentence", function (assert) {
		var done = assert.async(),
			sExpectedOutputHTML =
			'<span>' +
				'before ' +
				'<span class="defaultHighlightedText">test</span>' +
				' after' +
			'</span>';

		// Setup
		oRootElement.innerText = "before test after";

		setTimeout(function() {
			// Act
			oHighlighter.highlight("test");

			assert.equal(oRootElement.innerHTML, sExpectedOutputHTML, "correct output");
			done();
		}, 0);
	});

	QUnit.test("highlight repeated tokens", function (assert) {
		var done = assert.async(),
			sExpectedOutputHTML =
			'<span>' +
				'before ' +
				'<span class="defaultHighlightedText">test</span>' +
				' again ' +
				'<span class="defaultHighlightedText">test</span>' +
				' after' +
			'</span>';

		// Setup
		oRootElement.innerText = "before test again test after";

		setTimeout(function() {
			// Act
			oHighlighter.highlight("test");

			assert.equal(oRootElement.innerHTML, sExpectedOutputHTML, "correct output");
			done();
		}, 0);
	});

	QUnit.test("highlight multiple tokens", function (assert) {
		var done = assert.async(),
			sExpectedOutputHTML =
			'<span>' +
				'before ' +
				'<span class="defaultHighlightedText">token1</span>' +
				' and ' +
				'<span class="defaultHighlightedText">token2</span>' +
				' after' +
			'</span>';

		// Setup
		oRootElement.innerText = "before token1 and token2 after";

		setTimeout(function() {
			// Act
			oHighlighter.highlight("token1 token2");

			assert.equal(oRootElement.innerHTML, sExpectedOutputHTML, "correct output");
			done();
		}, 0);
	});

	QUnit.test("highlight text with line breaks", function (assert) {
		var done = assert.async(),
			sInputText = "test before line-break \nafter line-break",
			sExpectedOutputHTML =
			'<span>' +
				sInputText.replace("test", "<span class=\"defaultHighlightedText\">test</span>") +
			'</span>';

		// Setup
		oRootElement.appendChild(document.createTextNode(sInputText));

		setTimeout(function() {
			// Act
			oHighlighter.highlight("test");

			assert.equal(oRootElement.innerHTML, sExpectedOutputHTML, "correct output");
			done();
		}, 0);
	});
});