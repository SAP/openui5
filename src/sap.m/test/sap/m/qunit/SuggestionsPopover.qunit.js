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
		var oInput = new Input();
		var oSuggestionsPopover = new SuggestionsPopover(oInput);

		// Arrange
		oSuggestionsPopover.createSuggestionPopup(oInput);
		oSuggestionsPopover._getValueStateHeader();

		// Assert
		assert.ok(oSuggestionsPopover._getValueStateHeader(), "The ValueStateHeader is created.");

		// Arrange
		oSpy = this.spy(oSuggestionsPopover._getValueStateHeader(), "destroy");

		// Act
		oSuggestionsPopover.destroy();

		// Assert
		assert.ok(oSpy.calledOnce, "The value state header was destroyed.");
		assert.strictEqual(this.oSuggestionsPopover._getValueStateHeader(), undefined, "There is no reference to the ValueStateHeader in the SuggestionsPopover.");

		// Clean
		oSpy.restore();
	});

	QUnit.module("initContent", {
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

	QUnit.test("_onsaparrowkey should not be called when we have composition characters", function (assert) {
		// Arrange
		var oInput = new Input({
			showSuggestion: true,
			suggestionItems: [
				new Item({ text: "test" })
			]
		}),
			oSuggPopover = oInput._getSuggestionsPopover(),
			oSpy = sinon.spy(oSuggPopover, "handleListNavigation");

		// Act
		oInput._bIsComposingCharacter = true;
		oInput.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		oInput._$input.trigger("focus").val("te").trigger("input");

		qutils.triggerKeydown(oInput.getFocusDomRef(), KeyCodes.ARROW_DOWN);
		qutils.triggerKeydown(oInput.getFocusDomRef(), KeyCodes.ARROW_UP);

		// Assert
		assert.strictEqual(oSpy.callCount, 0, "handleListNavigation is not called.");

		//Cleanup
		oInput.destroy();
		oSpy.restore();
	});

	QUnit.module("mobile");

	QUnit.test("On mobile the sapUiNoContentPadding class is added to the picker.", function (assert) {
		var oComboBox, oSuggestionsPopover;

		// Arrange
		this.stub(Device, "system", {
			desktop: false,
			phone: true,
			tablet: false
		});

		oComboBox = new ComboBox();

		oSuggestionsPopover = new SuggestionsPopover(oComboBox);
		oSuggestionsPopover._bUseDialog = true;

		sap.ui.getCore().applyChanges();

		//Act
		oSuggestionsPopover.createSuggestionPopup(oComboBox, {});

		//Assert
		assert.ok(oSuggestionsPopover._oPopover.hasStyleClass("sapUiNoContentPadding"), "The sapUiNoContentPadding class is added");

		// cleanup
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
		assert.notEqual(jQuery(oComboBox._oSuggestionPopover._oPopover.getDomRef("scroll")).css("height"), "auto", "Height style attribute of the SimpleFixFlex is not 'auto'.");

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
		assert.notEqual(jQuery(oMultiComboBox._oSuggestionPopover._oPopover.getDomRef("scroll")).css("height"), "auto", "Height style attribute of the SimpleFixFlex is not 'auto'.");

		//Cleanup
		oMultiComboBox.destroy();
	});

	QUnit.test("Get the proper list", function (assert) {
		var oSuggPopover, oInput;

		// Arrange
		this.stub(Device, "system", {
			desktop: false,
			phone: true,
			tablet: false
		});

		// Setup
		oInput = new Input();
		oSuggPopover = oInput._getSuggestionsPopover();
		sap.ui.getCore().applyChanges();

		// Act
		oSuggPopover.addContent(new List());
		sap.ui.getCore().applyChanges();

		// Assert
		assert.notOk(oSuggPopover.getItemsContainer(), "This is not the items container, but a custom list");
		assert.ok(oSuggPopover.getPopover().getContent()[0].isA("sap.m.List"), "The content has the custom list");

		// Cleanup
		oInput.destroy();
		oSuggPopover.destroy();
	});

	QUnit.test("Navigating through GroupItems should deselect items from the list", function (assert) {
		var oSuggPopover, oInput, oListItem, oList, oListSpy;

		// Setup
		oListItem = new sap.m.GroupHeaderListItem();
		oInput = new Input();
		oSuggPopover = oInput._getSuggestionsPopover();
		oSuggPopover.initContent();
		sap.ui.getCore().applyChanges();

		oList = oSuggPopover.getItemsContainer();
		oListSpy = this.spy(oList, "removeSelections");

		// Act
		oSuggPopover.handleSelectionFromList(oListItem);

		// Assert
		assert.ok(oListSpy.calledWith(true), "Clear the Selections from list");

		// Cleanup
		oInput.destroy();
	});
});
