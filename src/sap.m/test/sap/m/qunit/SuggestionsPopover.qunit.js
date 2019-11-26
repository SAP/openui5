/*global QUnit, sinon */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/Device",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"jquery.sap.global",
	"sap/m/library",
	"sap/m/SuggestionsPopover",
	'sap/m/List',
	"sap/m/Input",
	"sap/m/ComboBox",
	"sap/m/MultiComboBox",
	"sap/ui/thirdparty/sinon",
	"sap/m/SimpleFixFlex"
], function (
	Device,
	qutils,
	createAndAppendDiv,
	jQuery,
	mobileLibrary,
	SuggestionsPopover,
	List,
	Input,
	ComboBox,
	MultiComboBox,
	sinon,
	SimpleFixFlex
) {
	"use strict";

	QUnit.module("Highlighting", {
		before: function () {
			var oInput = new Input();
			this.oSuggestionsPopover = new SuggestionsPopover(oInput);
			sap.ui.getCore().applyChanges();
		},
		after: function () {
			this.oSuggestionsPopover.destroy();
			this.oSuggestionsPopover = null;
		}
	});

	QUnit.test("_wordStartsWithValue", function (assert) {
		// Setup
		var sTestInput = "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
			sTestInput2 = "서비스 ID 서비스 유헝 성별";

		// Assert
		assert.ok(SuggestionsPopover._wordStartsWithValue(sTestInput, "ipsum"), "Detect properly starts with inputs");
		assert.ok(SuggestionsPopover._wordStartsWithValue(sTestInput, "elit"), "Detect properly starts with inputs");
		assert.ok(SuggestionsPopover._wordStartsWithValue(sTestInput, "consect"), "Detect properly starts with inputs");
		assert.ok(SuggestionsPopover._wordStartsWithValue(sTestInput, "Lorem ipsum dolor sit amet, consectetur adipiscing elit"), "Detect properly starts with inputs");


		assert.ok(SuggestionsPopover._wordStartsWithValue(sTestInput2, "ID"), "Detect properly starts with unicode characters");
		assert.ok(SuggestionsPopover._wordStartsWithValue(sTestInput2, "서비스"), "Detect properly starts with unicode characters");
		assert.ok(SuggestionsPopover._wordStartsWithValue(sTestInput2, "서비"), "Detect properly starts with unicode characters");
		assert.ok(SuggestionsPopover._wordStartsWithValue(sTestInput2, "유헝"), "Detect properly starts with unicode characters");
		assert.ok(!SuggestionsPopover._wordStartsWithValue(sTestInput2, "헝"), "Detect properly starts with unicode characters");
		assert.ok(!SuggestionsPopover._wordStartsWithValue(sTestInput2, "스 유헝 성"), "Detect properly starts with unicode characters");

	});

	QUnit.test("_createHighlightedText", function (assert) {
		// Setup
		var sTestInput = "Lorem ipsum dolor sit amet",
			sTestInput2 = "서비스 ID 유헝 성별",
			oDivDomRef = document.createElement("div");

		assert.strictEqual(
			this.oSuggestionsPopover._createHighlightedText(),
			"", "Empty inputs, empty output");

		// Act
		oDivDomRef.innerText = sTestInput;
		// Assert
		assert.strictEqual(
			this.oSuggestionsPopover._createHighlightedText(oDivDomRef),
			"Lorem&#x20;ipsum&#x20;dolor&#x20;sit&#x20;amet", "No second argument, no formatting");

		// Act
		oDivDomRef.innerText = sTestInput;
		// Assert
		assert.strictEqual(
			this.oSuggestionsPopover._createHighlightedText(oDivDomRef, "dolor"),
			"Lorem&#x20;ipsum&#x20;<span class=\"sapMInputHighlight\">dolor</span>&#x20;sit&#x20;amet", "Highlight text in the middle");

		// Act
		oDivDomRef.innerText = sTestInput;
		// Assert
		assert.strictEqual(
			this.oSuggestionsPopover._createHighlightedText(oDivDomRef, "lorem"),
			"<span class=\"sapMInputHighlight\">Lorem</span>&#x20;ipsum&#x20;dolor&#x20;sit&#x20;amet", "Highlight text @ start");

		// Act
		oDivDomRef.innerText = sTestInput;
		// Assert
		assert.strictEqual(
			this.oSuggestionsPopover._createHighlightedText(oDivDomRef, "amet"),
			"Lorem&#x20;ipsum&#x20;dolor&#x20;sit&#x20;<span class=\"sapMInputHighlight\">amet</span>", "Highlight text in the end");

		// Act
		oDivDomRef.innerText = sTestInput;
		// Assert
		assert.strictEqual(
			this.oSuggestionsPopover._createHighlightedText(oDivDomRef, "zzz"),
			"Lorem&#x20;ipsum&#x20;dolor&#x20;sit&#x20;amet", "No match, no highlight");

		// Act
		oDivDomRef.innerText = sTestInput2;
		// Assert
		assert.strictEqual(
			this.oSuggestionsPopover._createHighlightedText(oDivDomRef, "zzz"),
			"서비스&#x20;ID&#x20;유헝&#x20;성별", "Unicde characters: No match, no highlight");

		// Act
		oDivDomRef.innerText = sTestInput2;
		// Assert
		assert.strictEqual(
			this.oSuggestionsPopover._createHighlightedText(oDivDomRef, "ID"),
			"서비스&#x20;<span class=\"sapMInputHighlight\">ID</span>&#x20;유헝&#x20;성별", "Unicde characters: Match ascii");

		// Act
		oDivDomRef.innerText = sTestInput2;
		// Assert
		assert.strictEqual(
			this.oSuggestionsPopover._createHighlightedText(oDivDomRef, "서비"),
			"<span class=\"sapMInputHighlight\">서비</span>스&#x20;ID&#x20;유헝&#x20;성별", "Unicde characters: Match beginning");

		// Act
		oDivDomRef.innerText = sTestInput2;
		// Assert
		assert.strictEqual(
			this.oSuggestionsPopover._createHighlightedText(oDivDomRef, "유헝"),
			"서비스&#x20;ID&#x20;<span class=\"sapMInputHighlight\">유헝</span>&#x20;성별", "Unicde characters: Match beginning");
	});

	QUnit.test("_createHighlightedText edge case with repeating pattern", function (assert) {
		// Setup
		var sTestInput = "Prod prodProduct",
			sTestInput2 = "Prod prodProduct prod",
			sTestInput3 = "Zaasd Adr dar",
			oDivDomRef = document.createElement("div");

		// Act
		oDivDomRef.innerText = sTestInput;
		// Assert
		assert.strictEqual(
			this.oSuggestionsPopover._createHighlightedText(oDivDomRef, 'prod'),
			"<span class=\"sapMInputHighlight\">Prod</span>&#x20;prodProduct", "Should highlight ONLY words that start with the input pattern");

		// Act
		oDivDomRef.innerText = sTestInput;
		// Assert
		assert.strictEqual(
			this.oSuggestionsPopover._createHighlightedText(oDivDomRef, 'prod', true),
			"<span class=\"sapMInputHighlight\">Prod</span>&#x20;<span class=\"sapMInputHighlight\">prod</span>Product",
			"Should highlight ONLY words that start with the input pattern");

		// Act
		oDivDomRef.innerText = sTestInput2;
		// Assert
		assert.strictEqual(
			this.oSuggestionsPopover._createHighlightedText(oDivDomRef, 'prod', true),
			"<span class=\"sapMInputHighlight\">Prod</span>&#x20;<span class=\"sapMInputHighlight\">prod</span>Product&#x20;<span class=\"sapMInputHighlight\">prod</span>",
			"Should highlight ONLY words that start with the input pattern");

		// Act
		oDivDomRef.innerText = sTestInput3;
		// Assert
		assert.strictEqual(
			this.oSuggestionsPopover._createHighlightedText(oDivDomRef, 'a', true),
			"Zaasd&#x20;<span class=\"sapMInputHighlight\">A</span>dr&#x20;dar",
			"Should highlight ONLY words that start with the input pattern");
	});

	QUnit.test("_createHighlightedText continuous", function (assert) {
		// Setup
		var sTestInput = "Lorem ipsum dolor Lorem amet",
			sTestInput2 = "서비스 ID 유헝 서비스 성별",
			oDivDomRef = document.createElement("div");

		// Act
		oDivDomRef.innerText = sTestInput;
		// Assert
		assert.strictEqual(
			this.oSuggestionsPopover._createHighlightedText(oDivDomRef, "lorem", true),
			"<span class=\"sapMInputHighlight\">Lorem</span>&#x20;ipsum&#x20;dolor&#x20;<span class=\"sapMInputHighlight\">Lorem</span>&#x20;amet",
			"Double highlights for ASCII");

		// Act
		oDivDomRef.innerText = sTestInput2;
		// Assert
		assert.strictEqual(
			this.oSuggestionsPopover._createHighlightedText(oDivDomRef, "서비스", true),
			"<span class=\"sapMInputHighlight\">서비스</span>&#x20;ID&#x20;유헝&#x20;<span class=\"sapMInputHighlight\">서비스</span>&#x20;성별",
			"Double highlight with unicode characters");
	});

	QUnit.test("highlightSuggestionItems", function (assert) {
		// Setup
		var sTestInput = "Lorem ipsum dolor sit amet",
			sTestInput2 = "서비스 ID 유헝 성별",
			oDivDomRef = document.createElement("div");

		// Act
		oDivDomRef.innerText = sTestInput;
		this.oSuggestionsPopover.highlightSuggestionItems([oDivDomRef]);
		// Assert
		assert.strictEqual(oDivDomRef.innerHTML,
			"Lorem ipsum dolor sit amet", "No second argument, no formatting");

		// Act
		oDivDomRef.innerText = sTestInput;
		this.oSuggestionsPopover.highlightSuggestionItems([oDivDomRef], "dolor");
		// Assert
		assert.strictEqual(oDivDomRef.innerHTML,
			"Lorem ipsum <span class=\"sapMInputHighlight\">dolor</span> sit amet", "Highlight text in the middle");

		// Act
		oDivDomRef.innerText = sTestInput;
		this.oSuggestionsPopover.highlightSuggestionItems([oDivDomRef], "lorem");
		// Assert
		assert.strictEqual(oDivDomRef.innerHTML,
			"<span class=\"sapMInputHighlight\">Lorem</span> ipsum dolor sit amet", "Highlight text @ start");

		// Act
		oDivDomRef.innerText = sTestInput;
		this.oSuggestionsPopover.highlightSuggestionItems([oDivDomRef], "amet");
		// Assert
		assert.strictEqual(oDivDomRef.innerHTML,
			"Lorem ipsum dolor sit <span class=\"sapMInputHighlight\">amet</span>", "Highlight text in the end");

		// Act
		oDivDomRef.innerText = sTestInput;
		this.oSuggestionsPopover.highlightSuggestionItems([oDivDomRef], "zzz");
		// Assert
		assert.strictEqual(oDivDomRef.innerHTML,
			"Lorem ipsum dolor sit amet", "No match, no highlight");

		// Act
		oDivDomRef.innerText = sTestInput2;
		this.oSuggestionsPopover.highlightSuggestionItems([oDivDomRef], "zzz");
		// Assert
		assert.strictEqual(oDivDomRef.innerHTML,
			"서비스 ID 유헝 성별", "Unicde characters: No match, no highlight");

		// Act
		oDivDomRef.innerText = sTestInput2;
		this.oSuggestionsPopover.highlightSuggestionItems([oDivDomRef], "ID");
		// Assert
		assert.strictEqual(oDivDomRef.innerHTML,
			"서비스 <span class=\"sapMInputHighlight\">ID</span> 유헝 성별", "Unicde characters: Match ascii");

		// Act
		oDivDomRef.innerText = sTestInput2;
		this.oSuggestionsPopover.highlightSuggestionItems([oDivDomRef], "서비");
		// Assert
		assert.strictEqual(oDivDomRef.innerHTML,
			"<span class=\"sapMInputHighlight\">서비</span>스 ID 유헝 성별", "Unicde characters: Match beginning");

		// Act
		oDivDomRef.innerText = sTestInput2;
		this.oSuggestionsPopover.highlightSuggestionItems([oDivDomRef], "유헝");
		// Assert
		assert.strictEqual(oDivDomRef.innerHTML,
			"서비스 ID <span class=\"sapMInputHighlight\">유헝</span> 성별", "Unicde characters: Match beginning");
	});

	QUnit.test("highlightSuggestionItems continuous", function (assert) {
		// Setup
		var sTestInput = "Lorem ipsum dolor Lorem amet",
			sTestInput2 = "서비스 ID 유헝 서비스 성별",
			oDivDomRef = document.createElement("div");

		// Act
		oDivDomRef.innerText = sTestInput;
		this.oSuggestionsPopover.highlightSuggestionItems([oDivDomRef], "lorem", true);
		// Assert
		assert.strictEqual(oDivDomRef.innerHTML,
			"<span class=\"sapMInputHighlight\">Lorem</span> ipsum dolor <span class=\"sapMInputHighlight\">Lorem</span> amet",
			"Double highlights for ASCII");

		// Act
		oDivDomRef.innerText = sTestInput2;
		this.oSuggestionsPopover.highlightSuggestionItems([oDivDomRef], "서비스", true);
		// Assert
		assert.strictEqual(oDivDomRef.innerHTML,
			"<span class=\"sapMInputHighlight\">서비스</span> ID 유헝 <span class=\"sapMInputHighlight\">서비스</span> 성별",
			"Double highlight with unicode characters");
	});

	QUnit.module("_createSuggestionPopupContent", {
		beforeEach: function () {
			var oInput = new Input();
			this.oSuggestionsPopover = new SuggestionsPopover(oInput);
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oSuggestionsPopover.destroy();
			this.oSuggestionsPopover = null;
		}
	});

	QUnit.test("Using tabular suggestions", function (assert) {
		//Act
		var fnGetSuggestionsTableSpy = this.spy(Input.prototype, "_getSuggestionsTable");
		this.oSuggestionsPopover._createSuggestionPopupContent(true);

		//Assert
		assert.strictEqual(this.oSuggestionsPopover._bHasTabularSuggestions, true, "The value is updated correctly");
		assert.strictEqual(fnGetSuggestionsTableSpy.callCount, 1, "The input has tabular suggestions");

		//Clean up
		fnGetSuggestionsTableSpy.restore();
	});

	QUnit.test("Using regular suggestions", function (assert) {
		//Act
		this.oSuggestionsPopover._createSuggestionPopupContent(false);

		//Assert
		assert.strictEqual(this.oSuggestionsPopover._bHasTabularSuggestions, false, "The value is updated correctly");
		assert.ok(this.oSuggestionsPopover._oList instanceof List, "The suggestions type is ListItem");
	});

	QUnit.module("mobile");

	QUnit.test("On mobile the sapUiNoContentPadding class is added to the picker.", function (assert) {
		var oComboBox, oSuggestionsPopover, oRegisterAutocompleteStub;

		// Arrange
		this.stub(Device, "system", {
			desktop: false,
			phone: true,
			tablet: false
		});

		oComboBox = new ComboBox();

		oSuggestionsPopover = new SuggestionsPopover(oComboBox);
		oSuggestionsPopover._bUseDialog = true;

		oRegisterAutocompleteStub = sinon.stub(oSuggestionsPopover, "_registerAutocomplete", function () {});

		sap.ui.getCore().applyChanges();

		//Act
		oSuggestionsPopover._createSuggestionPopup({});

		//Assert
		assert.ok(oSuggestionsPopover._oPopover.hasStyleClass("sapUiNoContentPadding"), "The sapUiNoContentPadding class is added");

		// cleanup
		oRegisterAutocompleteStub.restore();
		oComboBox.destroy();
		oSuggestionsPopover.destroy();
	});

	QUnit.test("ComboBox: The following condition is met: hеight != 'auto' as this prevents the scroll on mobile devices (can be adjusted in future).", function (assert) {
		var oComboBox;

		// Arrange
		this.stub(Device, "system", {
			desktop: false,
			phone: true,
			tablet: false
		});

		oComboBox = new ComboBox();
		oComboBox.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Act
		oComboBox.open();

		// Assert
		// NOTE!
		// This can change in future! In such case please ensure that the scroll is working on mobile devices
		// and amend this test accordingly and/or add new ones!
		assert.notEqual(jQuery(oComboBox._oSuggestionPopover._getScrollableContent()).css("height"), "auto", "Height style attribute of the SimpleFixFlex is not 'auto'.");

		//Cleanup
		oComboBox.destroy();
	});

	QUnit.test("MultiComboBox: The following condition is met: hеight != 'auto' as this prevents the scroll on mobile devices (can be adjusted in future).", function (assert) {
		var oMultiComboBox;

		// Arrange
		this.stub(Device, "system", {
			desktop: false,
			phone: true,
			tablet: false
		});

		oMultiComboBox = new MultiComboBox();
		oMultiComboBox.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Act
		oMultiComboBox.open();

		// Assert
		// NOTE!
		// This can change in future! In such case please ensure that the scroll is working on mobile devices
		// and amend this test accordingly and/or add new ones!
		assert.notEqual(jQuery(oMultiComboBox._oSuggestionPopover._getScrollableContent()).css("height"), "auto", "Height style attribute of the SimpleFixFlex is not 'auto'.");

		//Cleanup
		oMultiComboBox.destroy();
	});

	QUnit.module("API");

	QUnit.test("_getScrollableContent", function (assert) {
		//Set up
		var oInput = new Input({
			showSuggestion: true
		});

		sap.ui.getCore().applyChanges();

		//Assert
		assert.strictEqual(oInput._oSuggPopover._getScrollableContent(), oInput._oSuggPopover._oPopover.getDomRef("scroll"), "_getScrollableContent should return Popover's scroll content");

		//Clean up
		oInput.destroy();
	});
});
