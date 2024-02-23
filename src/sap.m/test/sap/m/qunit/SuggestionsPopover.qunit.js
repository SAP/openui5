/*global QUnit */
sap.ui.define([
	"sap/ui/Device",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/events/KeyCodes",
	"sap/ui/thirdparty/jquery",
	"sap/m/SuggestionsPopover",
	'sap/m/List',
	"sap/m/Input",
	"sap/m/ComboBox",
	"sap/m/MultiComboBox",
	"sap/m/GroupHeaderListItem",
	"sap/ui/core/Item",
	"sap/ui/qunit/utils/nextUIUpdate"
], function (
	Device,
	qutils,
	KeyCodes,
	jQuery,
	SuggestionsPopover,
	List,
	Input,
	ComboBox,
	MultiComboBox,
	GroupHeaderListItem,
	Item,
	nextUIUpdate
) {
	"use strict";

	QUnit.module("Highlighting", {
		before: async function () {
			this.oSuggestionsPopover = new SuggestionsPopover();
			await nextUIUpdate();
		},
		after: function () {
			this.oSuggestionsPopover.destroy();
			this.oSuggestionsPopover = null;
		}
	});

	QUnit.test("ValueStateHeader is destroyed when the SuggestionsPopover is destroyed", function (assert) {
		var oSpy;
		var oInput = new Input();
		var oSuggestionsPopover = oInput._getSuggestionsPopover();

		// Arrange
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
		oInput.destroy();
	});

	QUnit.module("initContent", {
		beforeEach: async function () {
			this.oSuggestionsPopover = new SuggestionsPopover();
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oSuggestionsPopover.destroy();
			this.oSuggestionsPopover = null;
		}
	});

	QUnit.test("_onsaparrowkey should not be called when we have composition characters", async function (assert) {
		// Arrange
		var oInput = new Input({
			showSuggestion: true,
			suggestionItems: [
				new Item({ text: "test" })
			]
		}),
			oSuggPopover = oInput._getSuggestionsPopover(),
			oSpy = this.spy(oSuggPopover, "handleListNavigation");

		// Act
		oInput._bIsComposingCharacter = true;
		oInput.placeAt("qunit-fixture");
		await nextUIUpdate();

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

	QUnit.test("On mobile the sapUiNoContentPadding class is added to the picker.", async function (assert) {
		var oComboBox, oSuggestionsPopover;

		// Arrange
		this.stub(Device, "system").value({
			desktop: false,
			phone: true,
			tablet: false
		});

		oComboBox = new ComboBox();

		oSuggestionsPopover = new SuggestionsPopover();
		oSuggestionsPopover._bUseDialog = true;

		await nextUIUpdate();

		//Act
		oSuggestionsPopover.createSuggestionPopup(oComboBox, {});

		//Assert
		assert.ok(oSuggestionsPopover._oPopover.hasStyleClass("sapUiNoContentPadding"), "The sapUiNoContentPadding class is added");

		// cleanup
		oComboBox.destroy();
		oSuggestionsPopover.destroy();
	});

	QUnit.test("ComboBox: The following condition is met: height != 'auto' as this prevents the scroll on mobile devices (can be adjusted in future).", async function (assert) {
		var oComboBox;

		// Arrange
		this.stub(Device, "system").value({
			desktop: false,
			phone: true,
			tablet: false
		});

		oComboBox = new ComboBox();
		oComboBox.placeAt("qunit-fixture");
		await nextUIUpdate();

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

	QUnit.test("MultiComboBox: The following condition is met: height != 'auto' as this prevents the scroll on mobile devices (can be adjusted in future).", async function (assert) {
		var oMultiComboBox;

		// Arrange
		this.stub(Device, "system").value({
			desktop: false,
			phone: true,
			tablet: false
		});

		oMultiComboBox = new MultiComboBox();
		oMultiComboBox.placeAt("qunit-fixture");
		await nextUIUpdate();

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

	QUnit.test("Get the proper list", async function (assert) {
		var oSuggPopover, oInput;

		// Arrange
		this.stub(Device, "system").value({
			desktop: false,
			phone: true,
			tablet: false
		});

		// Setup
		oInput = new Input();
		oSuggPopover = oInput._getSuggestionsPopover();
		await nextUIUpdate();

		// Act
		oSuggPopover.addContent(new List());
		await nextUIUpdate();

		// Assert
		assert.notOk(oSuggPopover.getItemsContainer(), "This is not the items container, but a custom list");
		assert.ok(oSuggPopover.getPopover().getContent()[0].isA("sap.m.List"), "The content has the custom list");

		// Cleanup
		oInput.destroy();
		oSuggPopover.destroy();
	});

	QUnit.test("Navigating through GroupItems should deselect items from the list", async function (assert) {
		var oSuggPopover, oInput, oListItem, oList, oListSpy;

		// Setup
		oListItem = new GroupHeaderListItem();
		oInput = new Input();
		oSuggPopover = oInput._getSuggestionsPopover();
		oSuggPopover.initContent();
		await nextUIUpdate();

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
