/*global QUnit, sinon */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/Device",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/events/KeyCodes",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"jquery.sap.global",
	"sap/m/library",
	"sap/m/SuggestionsPopover",
	'sap/m/List',
	"sap/m/Input",
	"sap/m/ComboBox",
	"sap/m/MultiComboBox",
	"sap/ui/thirdparty/sinon",
	"sap/ui/core/Item"
], function (
	Device,
	qutils,
	KeyCodes,
	createAndAppendDiv,
	jQuery,
	mobileLibrary,
	SuggestionsPopover,
	List,
	Input,
	ComboBox,
	MultiComboBox,
	sinon,
	Item
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

	QUnit.test("ValueStateHeader is destroyed when the SuggestionsPopover is destroyed", function (assert) {
		var oSpy;

		// Arrange
		this.oSuggestionsPopover._createSuggestionPopup();
		this.oSuggestionsPopover._createSuggestionPopupContent();
		this.oSuggestionsPopover._getValueStateHeader();

		// Assert
		assert.ok(this.oSuggestionsPopover._oValueStateHeader, "The ValueStateHeader is created.");

		// Arrange
		oSpy = new this.spy(this.oSuggestionsPopover._oValueStateHeader, "destroy");

		// Act
		this.oSuggestionsPopover.destroy();

		// Assert
		assert.ok(oSpy.calledOnce, "The value state header was destroyed.");
		assert.strictEqual(this.oSuggestionsPopover._oValueStateHeader, null, "There is no reference to the ValueStateHeader in the SuggestionsPopover.");

		// Clean
		oSpy.restore();
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

	QUnit.test("_onsaparrowkey should not be called when we have composition characters", function (assert) {
		// Arrange
		var oInput = new Input({
			showSuggestion: true,
			suggestionItems: [
				new Item({ text: "test" })
			]
		}),
			oSuggPopover = oInput._getSuggestionsPopover(),
			oSpy = sinon.spy(oSuggPopover, "_onsaparrowkey");

		// Act
		oInput._bIsComposingCharacter = true;
		oInput.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		oInput._$input.trigger("focus").val("te").trigger("input");

		qutils.triggerKeydown(oInput.getFocusDomRef(), KeyCodes.ARROW_DOWN);
		qutils.triggerKeydown(oInput.getFocusDomRef(), KeyCodes.ARROW_UP);

		// Assert
		assert.strictEqual(oSpy.callCount, 0, "_onsaparrowkey is not called.");

		//Cleanup
		oInput.destroy();
		oSpy.restore();
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

	QUnit.test("ComboBox: The following condition is met: height != 'auto' as this prevents the scroll on mobile devices (can be adjusted in future).", function (assert) {
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

	QUnit.test("MultiComboBox: The following condition is met: height != 'auto' as this prevents the scroll on mobile devices (can be adjusted in future).", function (assert) {
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
