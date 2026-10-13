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
	"sap/m/StandardListItem",
	"sap/ui/core/Item",
	"sap/ui/core/InvisibleText",
	"sap/ui/test/utils/nextUIUpdate"
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
	StandardListItem,
	Item,
	InvisibleText,
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

QUnit.module("aria-labelledby with ValueStateHeader", {
	beforeEach: async function () {
		this.oInput = new Input({
			showSuggestion: true,
			suggestionItems: [
				new Item({ text: "Item 1" }),
				new Item({ text: "Item 2" })
			]
		});
		this.oInput.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Ensure suggestions popover is created
		if (!this.oInput._getSuggestionsPopover()) {
			this.oInput._createSuggestionsPopover();
		}
		this.oSuggestionsPopover = this.oInput._getSuggestionsPopover();
	},
	afterEach: function () {
		this.oInput.destroy();
	}
});

QUnit.test("aria-labelledby should not reference ValueStateHeader when it has no visible content", async function (assert) {
	// Act
	this.oSuggestionsPopover.getPopover().openBy(this.oInput);
	await nextUIUpdate();

	// Assert
	const oPopover = this.oSuggestionsPopover.getPopover();
	const oValueStateHeader = oPopover.getCustomHeader();
	const sAriaLabelledBy = oPopover.getDomRef().getAttribute('aria-labelledby') || "";

	// ValueStateHeader ID should NOT be in aria-labelledby
	assert.notOk(sAriaLabelledBy.includes(oValueStateHeader.getId()), "aria-labelledby should not include empty ValueStateHeader ID");
});

QUnit.test("aria-labelledby should reference ValueStateHeader when it has visible content", async function (assert) {
	// Arrange - set value state
	this.oInput.setValueState("Error");
	this.oInput.setValueStateText("Error message");

	// Act - open suggestions with value state
	this.oSuggestionsPopover.getPopover().openBy(this.oInput);
	await nextUIUpdate();

	// Assert
	const oPopover = this.oSuggestionsPopover.getPopover();
	const sAriaLabelledBy = oPopover.getDomRef().getAttribute('aria-labelledby');
	const oValueStateHeader = oPopover.getCustomHeader();

	assert.ok(sAriaLabelledBy, "aria-labelledby should be set");
	assert.ok(oValueStateHeader && oValueStateHeader.isA("sap.m.ValueStateHeader"), "Should have ValueStateHeader");
	assert.ok(sAriaLabelledBy.includes(oValueStateHeader.getId()), "Should include ValueStateHeader ID");
});

QUnit.test("aria-labelledby should include both ValueStateHeader and other associations", async function (assert) {
	// Arrange - set value state and add custom aria-labelledby
	this.oInput.setValueState("Warning");
	this.oInput.setValueStateText("Warning message");

	const oInvisibleText = new InvisibleText({
		text: "Additional description"
	});
	oInvisibleText.toStatic().placeAt("qunit-fixture");
	await nextUIUpdate();

	const oPopover = this.oSuggestionsPopover.getPopover();
	oPopover.addAriaLabelledBy(oInvisibleText);

	// Act - open suggestions
	oPopover.openBy(this.oInput);
	await nextUIUpdate();

	// Assert
	const sAriaLabelledBy = oPopover.getDomRef().getAttribute('aria-labelledby');
	const oValueStateHeader = oPopover.getCustomHeader();

	assert.ok(sAriaLabelledBy.includes(oValueStateHeader.getId()), "Should include ValueStateHeader");
	assert.ok(sAriaLabelledBy.includes(oInvisibleText.getId()), "Should include the invisible text");
	assert.ok(sAriaLabelledBy.indexOf(oValueStateHeader.getId()) < sAriaLabelledBy.indexOf(oInvisibleText.getId()),
		"ValueStateHeader should come before custom association");

	// Cleanup
	oInvisibleText.destroy();
});

QUnit.module("Group header skipping (listbox mode)", {
	beforeEach: async function () {
		this.oInput = new Input({
			showSuggestion: true,
			suggestionItems: [
				new Item({ text: "Argentina" }),
				new Item({ text: "Australia" })
			]
		});
		this.oInput.placeAt("qunit-fixture");
		await nextUIUpdate();

		this.oInput._$input.trigger("focus").val("a").trigger("input");
		await nextUIUpdate();

		this.oSuggPopover = this.oInput._getSuggestionsPopover();
		this.oList = this.oSuggPopover.getItemsContainer();
		this.oList.removeAllItems();
	},
	afterEach: function () {
		this.oInput.destroy();
	}
});

QUnit.test("The suggestions List has skipGroupHeaderFocus enabled in listbox mode", function (assert) {
	assert.strictEqual(this.oList.getAriaRole(), "listbox", "The List uses the listbox ARIA role");
	assert.strictEqual(this.oList.getSkipGroupHeaderFocus(), true,
		"skipGroupHeaderFocus is enabled via the native List API");
});

QUnit.test("_getSelectableItems excludes group headers when the parent has no handleSelectionFromList", function (assert) {
	// Arrange
	var oHeader = new GroupHeaderListItem({ title: "Group" }),
		oItem1 = new StandardListItem({ title: "Item 1" }),
		oItem2 = new StandardListItem({ title: "Item 2" });
	this.oList.addItem(oHeader).addItem(oItem1).addItem(oItem2);

	// Act
	var aSelectable = this.oSuggPopover._getSelectableItems(this.oInput);

	// Assert
	assert.strictEqual(aSelectable.length, 2, "Only the two suggestion items are selectable");
	assert.strictEqual(aSelectable.indexOf(oHeader), -1, "The group header is excluded");
	assert.deepEqual(aSelectable, [oItem1, oItem2], "The suggestion items are kept in order");
});

QUnit.test("_getSelectableItems excludes invisible items", function (assert) {
	// Arrange
	var oVisible = new StandardListItem({ title: "Visible" }),
		oHidden = new StandardListItem({ title: "Hidden", visible: false });
	this.oList.addItem(oVisible).addItem(oHidden);

	// Act
	var aSelectable = this.oSuggPopover._getSelectableItems(this.oInput);

	// Assert
	assert.deepEqual(aSelectable, [oVisible], "The invisible item is excluded");
});

QUnit.test("_getSelectableItems skips group headers even when the parent defines handleSelectionFromList", function (assert) {
	// Arrange - a parent that manages selection itself (ComboBox/MultiComboBox-like)
	var oHeader = new GroupHeaderListItem({ title: "Group" }),
		oItem1 = new StandardListItem({ title: "Item 1" });
	this.oList.addItem(oHeader).addItem(oItem1);

	var oComboBoxLikeParent = { handleSelectionFromList: function () {} };

	// Act
	var aSelectable = this.oSuggPopover._getSelectableItems(oComboBoxLikeParent);

	// Assert
	assert.strictEqual(aSelectable.length, 1, "Only the regular item is selectable");
	assert.strictEqual(aSelectable.indexOf(oHeader), -1, "The group header is skipped even for ComboBox-like parents");
});

QUnit.test("Arrow Up on the first selectable item returns to the input (group header not focused)", function (assert) {
	// Arrange - header + two items; selectable set excludes the header
	var oHeader = new GroupHeaderListItem({ title: "Group" }),
		oItem1 = new StandardListItem({ title: "Item 1" }),
		oItem2 = new StandardListItem({ title: "Item 2" });
	this.oList.addItem(oHeader).addItem(oItem1).addItem(oItem2);

	var aSelectable = this.oSuggPopover._getSelectableItems(this.oInput);

	// Act - focus is on the first selectable item, press Up
	var oNewItem = this.oSuggPopover.handleArrowUp(aSelectable, 0, false);

	// Assert - no item returned => focus goes back to the input, no group header in between
	assert.strictEqual(oNewItem, undefined, "Up on the first item returns nothing (focus back on the input)");
});

QUnit.test("Arrow Down on the last selectable item stays there (grouped list)", function (assert) {
	// Arrange
	var oHeader = new GroupHeaderListItem({ title: "Group" }),
		oItem1 = new StandardListItem({ title: "Item 1" }),
		oItem2 = new StandardListItem({ title: "Item 2" });
	this.oList.addItem(oHeader).addItem(oItem1).addItem(oItem2);

	var aSelectable = this.oSuggPopover._getSelectableItems(this.oInput);

	// Act - focus is on the last selectable item, press Down (no typeahead)
	var oNewItem = this.oSuggPopover.handleArrowDown(aSelectable, aSelectable.length - 1, false, false);

	// Assert - stays on the last item, does not fall onto a following group header
	assert.strictEqual(oNewItem, aSelectable[aSelectable.length - 1], "Down on the last item keeps focus there");
});

QUnit.test("Arrow Down from the input lands on the first item, skipping the leading group header", function (assert) {
	// Arrange - a list starting with a group header
	var oHeader = new GroupHeaderListItem({ title: "Group" }),
		oItem1 = new StandardListItem({ title: "Item 1" }),
		oItem2 = new StandardListItem({ title: "Item 2" });
	this.oList.addItem(oHeader).addItem(oItem1).addItem(oItem2);

	var aSelectable = this.oSuggPopover._getSelectableItems(this.oInput);

	// Act - focus is on the input (bFocusInInput = true), no typeahead
	var oNewItem = this.oSuggPopover.handleArrowDown(aSelectable, -1, true, false);

	// Assert - first real item, not the group header
	assert.strictEqual(oNewItem, oItem1, "Down from the input focuses the first item, skipping the group header");
});
});
