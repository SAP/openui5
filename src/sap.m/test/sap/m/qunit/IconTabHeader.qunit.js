/*global QUnit */

sap.ui.define([
	"sap/m/IconTabHeader",
	"sap/m/IconTabFilter",
	"sap/m/IconTabSeparator",
	"sap/ui/core/Core",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/Panel"
], function(
	IconTabHeader,
	IconTabFilter,
	IconTabSeparator,
	Core,
	createAndAppendDiv,
	Panel
) {
	"use strict";

	var DOM_RENDER_LOCATION = "content";

	createAndAppendDiv(DOM_RENDER_LOCATION);

	function createHeaderWithItems(iNum, bWithSeparators) {
		var aItems = [];
		for (var i = 0; i < iNum; i++) {
			aItems.push(new IconTabFilter({
				text: "Tab " + i,
				key: i
			}));

			if (bWithSeparators && i < (iNum - 1)) {
				aItems.push(new IconTabSeparator());
			}
		}

		return new IconTabHeader({
			items: aItems
		});
	}

	QUnit.module("Methods");

	QUnit.test("_findItemByKey", function (assert) {
		// arrange
		var oITH = createHeaderWithItems(3),
			oNestedItem = new IconTabFilter({
				key: "nested"
			}),
			oSecondItem = oITH.getItems()[1];

		oSecondItem.addItem(oNestedItem);

		// assert
		assert.strictEqual(oITH._findItemByKey("nested"), oNestedItem, "Nested item should be found.");

		oITH.destroy();
	});

	QUnit.module("Resize");

	QUnit.test("when there is not enough space, items should be hidden", function(assert) {
		// arrange
		var oITH = createHeaderWithItems(4),
			oLastItem = oITH.getItems()[3];

		oITH.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();

		assert.notOk(oLastItem.$().hasClass("sapMITBFilterHidden"), "the last filter is visible");

		oITH.$().width("200px");
		Core.applyChanges();
		this.clock.tick(300);

		// assert
		assert.ok(oLastItem.$().hasClass("sapMITBFilterHidden"), "the last filter is hidden");

		// clean up
		oITH.destroy();
	});

	QUnit.test("hide items together with preceding separator", function(assert) {
		// arrange
		var oITH = createHeaderWithItems(4, true),
			aItems = oITH.getItems(),
			oLastSeparator = aItems[5],
			oLastItem = aItems[6];

		oITH.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();

		// assert - all visible
		assert.notOk(oLastSeparator.$().hasClass("sapMITBFilterHidden"), "the last separator is visible");
		assert.notOk(oLastItem.$().hasClass("sapMITBFilterHidden"), "the last filter item is visible");

		// act - resize
		oITH.$().width("200px");
		Core.applyChanges();
		this.clock.tick(300);

		// assert - last item is hidden
		assert.ok(oLastSeparator.$().hasClass("sapMITBFilterHidden"), "the last separator is hidden");
		assert.ok(oLastItem.$().hasClass("sapMITBFilterHidden"), "the last filter item is hidden");

		// act - select last item
		oITH.setSelectedKey(oLastItem.getKey());
		Core.applyChanges();
		this.clock.tick(300);

		// assert - selected item is visible
		assert.notOk(oLastSeparator.$().hasClass("sapMITBFilterHidden"), "the last separator is visible");
		assert.notOk(oLastItem.$().hasClass("sapMITBFilterHidden"), "the last filter item is visible");

		// clean up
		oITH.destroy();
	});

	QUnit.test("when first item is truncated, more button is still visible", function(assert) {
		// arrange
		var oITH = createHeaderWithItems(2),
			oFirstItem = oITH.getItems()[0],
			oContainer = new Panel({
				width: "50px",
				content: [oITH]
			});

		oContainer.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();

		// assert
		assert.ok(oFirstItem.$().hasClass("sapMITBFilterTruncated"), "the first item is truncated");
		assert.ok(oITH._getOverflow().$().hasClass("sapMITHOverflowVisible"), "the more button is visible");

		// clean up
		oContainer.destroy();
	});

	QUnit.module("Shifting behavior");

	QUnit.test("Selecting an overflown tab causes it to show up in the tab strip", function (assert) {
		// Arrange
		var oITH = createHeaderWithItems(100);
		var oTargetTab = oITH.getItems()[99];
		oITH.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();

		// Assert
		var aVisibleTabs = oITH.$().find(".sapMITBItem:not(.sapMITBFilterHidden)").toArray();
		assert.strictEqual(aVisibleTabs.indexOf(oTargetTab.getDomRef()), -1, "The target tab is not in the tab strip before it gets picked");
		assert.strictEqual(oITH._getItemsInStrip().indexOf(oTargetTab), -1, "The target tab is not in the tab strip before it gets picked");

		// Act
		oITH.setSelectedKey("99");
		Core.applyChanges();

		// Assert
		aVisibleTabs = oITH.$().find(".sapMITBItem:not(.sapMITBFilterHidden)").toArray();
		assert.notStrictEqual(aVisibleTabs.indexOf(oTargetTab.getDomRef()), -1, "The target tab is not in the tab strip before it gets picked");
		assert.notStrictEqual(oITH._getItemsInStrip().indexOf(oTargetTab), -1, "The target tab is now in the tab strip after it got selected");

		// Clean-up
		oITH.destroy();
	});

	QUnit.module("tab properties");

	QUnit.test("tabs with items aggregation and property enabled=false should not open their dropdown", function (assert) {
		// Arrange
		var oITH = createHeaderWithItems(1);
		var oTab = oITH.getItems()[0];
		oTab.addItem(new IconTabFilter({ text: "SAP" }));
		oITH.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();

		// Act
		oTab._expandButtonPress();

		// Assert
		assert.ok(oTab._oPopover, "Tab's own popover is initialised");
		assert.strictEqual(oTab._oPopover.isOpen(), true, "Tab's popover is open");

		oTab._closePopover();
		this.clock.tick(250);

		// Act
		oTab.setEnabled(false);
		oTab._expandButtonPress();
		this.clock.tick(250);

		// Assert
		assert.strictEqual(oTab._oPopover.isOpen(), false, "Tab's popover does not open");

		// Clean-up
		oITH.destroy();
	});

	QUnit.module("properties");

	QUnit.test("ariaTexts", function (assert) {
		var oITH = createHeaderWithItems(10);

		oITH.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();

		assert.notOk(oITH.$().attr("aria-label"), "'aria-label' attribute should NOT be set.");
		assert.notOk(oITH.$("head").attr("aria-describedby"), "'aria-describedby' attribute should NOT be set.");

		oITH.setAriaTexts({
			headerLabel: "Available spaces",
			headerDescription: "Select tab to show a space"
		});
		Core.applyChanges();

		assert.strictEqual(oITH.$().attr("aria-label"), "Available spaces", "'aria-label' attribute should be set");
		assert.strictEqual(oITH.$("head").attr("aria-describedby"), oITH._getInvisibleHeadText().getId(), "'aria-describedby' attribute should be set.");


		// Clean-up
		oITH.destroy();
	});
});