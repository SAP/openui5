/*global QUnit, sinon */

sap.ui.define([
	"sap/m/BadgeCustomData",
	"sap/m/IconTabHeader",
	"sap/m/IconTabFilter",
	"sap/m/IconTabSeparator",
	"sap/ui/core/Core",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/Panel"
], function(
	BadgeCustomData,
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

	QUnit.module("Overflow tab");

	QUnit.test("Adding event delegates", function (assert) {
		// arrange
		var oSpy = sinon.spy(IconTabFilter.prototype, "addEventDelegate"),
			oITH = createHeaderWithItems(100);
		oITH.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();

		// assert
		assert.ok(oSpy.calledWith(oITH._oOverflowEventDelegate, oITH._getOverflow()), "Event delegate is added to the overflow tab");

		// clean up
		oITH.destroy();
	});

	QUnit.test("Removing event delegates", function (assert) {
		// arrange
		var oITH = createHeaderWithItems(100);
		oITH.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();

		var oOverflow = oITH._getOverflow(),
			oSpy = sinon.spy(oOverflow, "removeEventDelegate"),
			oOverflowEventDelegate = oITH._oOverflowEventDelegate;

		// Act
		oITH.destroy();

		// assert
		assert.ok(oSpy.calledWith(oOverflowEventDelegate), "Event delegate is removed from the overflow tab");
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

	QUnit.module("Badges - simple tabs", {
		beforeEach: function () {
			this.oITH = new IconTabHeader({
				items: [
					new IconTabFilter({
						text: "Tab1",
						key: "tab1"
					})
				]
			});
			this.oITH.placeAt(DOM_RENDER_LOCATION);
		},
		afterEach: function () {
			this.oITH.destroy();
		}
	});

	QUnit.test("Badge is shown", function (assert) {
		// Arrange
		var oTab = 	new IconTabFilter({
			text: "Tab2",
			key: "tab2",
			customData: [
				new BadgeCustomData()
			]
		});
		this.oITH.addItem(oTab);
		Core.applyChanges();

		// Assert
		assert.ok(this.oITH.$().find(".sapMBadgeIndicator").length, "Badge indicator is rendered");
	});

	QUnit.test("Badge hiding after tab is selected", function (assert) {
		// Arrange
		var oTab = 	new IconTabFilter({
			text: "Tab2",
			key: "tab2",
			customData: [
				new BadgeCustomData()
			]
		});
		this.oITH.addItem(oTab);
		Core.applyChanges();

		// Act
		this.oITH.setSelectedKey("tab2");
		this.clock.tick(4000);

		// Assert
		assert.notOk(oTab._isBadgeAttached, "Badge indicator is removed");
	});

	QUnit.test("Badge hiding timeout is properly handled", function (assert) {
		// Arrange
		var oTab = new IconTabFilter({
			text: "Tab2",
			key: "tab2",
			customData: [
				new BadgeCustomData()
			]
		});
		this.oITH.addItem(oTab);
		Core.applyChanges();

		// Act
		this.oITH.setSelectedKey("tab2");
		var iTimeoutId = oTab._iHideBadgeTimeout;

		// Assert
		assert.ok(iTimeoutId, "There is timeout");

		// Act
		this.oITH.setSelectedKey("tab2");

		assert.strictEqual(oTab._iHideBadgeTimeout, iTimeoutId, "The timeout is the same as before");
	});

	QUnit.module("Badges - single click area tabs", {
		beforeEach: function () {
			this.oITH = new IconTabHeader();
			this.oITH.placeAt(DOM_RENDER_LOCATION);
		},
		afterEach: function () {
			this.oITH.destroy();
		}
	});

	QUnit.test("Badge is shown on the root tab when a nested tab has badge", function (assert) {
		// Arrange
		var oRootTab = new IconTabFilter({
			text: "Tab2",
			key: "tab2",
			items: [
				new IconTabFilter({
					text: "Nested",
					key: "Nested",
					customData: [
						new BadgeCustomData()
					]
				})
			]
		});
		this.oITH.addItem(oRootTab);
		Core.applyChanges();

		// Assert
		assert.ok(oRootTab.$().find(".sapMBadgeIndicator").length, "Badge is rendered on the root tab");
	});

	QUnit.test("Badge is removed from the root tab when it is removed from the nested tab", function (assert) {
		// Arrange
		var oRootTab = new IconTabFilter({
			text: "Tab2",
			key: "tab2",
			items: [
				new IconTabFilter({
					text: "Nested",
					key: "Nested",
					customData: [
						new BadgeCustomData()
					]
				})
			]
		});
		this.oITH.addItem(oRootTab);
		Core.applyChanges();
		oRootTab._expandButtonPress();
		var oFakeEvent = {
			srcControl: oRootTab._getSelectList().getItems()[0],
			preventDefault: function () {}
		};

		// Act
		oRootTab._getSelectList().ontap(oFakeEvent);
		this.clock.tick(4000);

		// Assert
		assert.notOk(oRootTab._isBadgeAttached, "Badge is removed from the root tab");
	});

	QUnit.test("Badge is NOT removed from the root tab when there are more tabs inside it with badges", function (assert) {
		// Arrange
		var oRootTab = new IconTabFilter({
			text: "Tab2",
			key: "tab2",
			items: [
				new IconTabFilter({
					text: "Nested1",
					key: "Nested2",
					customData: [
						new BadgeCustomData()
					]
				}),
				new IconTabFilter({
					text: "Nested2",
					key: "Nested1",
					customData: [
						new BadgeCustomData()
					]
				})
			]
		});
		this.oITH.addItem(oRootTab);
		Core.applyChanges();
		oRootTab._expandButtonPress();
		var oFakeEvent = {
			srcControl: oRootTab._getSelectList().getItems()[0],
			preventDefault: function () {}
		};

		// Act
		oRootTab._getSelectList().ontap(oFakeEvent);
		this.clock.tick(4000);

		// Assert
		assert.ok(oRootTab._isBadgeAttached, "Badge is removed from the root tab");
	});

	QUnit.test("Badge is removed from the cloned item in the select list", function (assert) {
		// Arrange
		var oNestedItem  = new IconTabFilter({
				text: "Nested",
				key: "Nested",
				customData: [
					new BadgeCustomData()
				]
			}),
			oRootTab = new IconTabFilter({
				text: "Tab2",
				key: "tab2",
				items: [oNestedItem]
			});

		this.oITH.addItem(oRootTab);
		Core.applyChanges();
		oRootTab._expandButtonPress();

		var oFakeEvent = {
			srcControl: oNestedItem,
			preventDefault: function () {}
		};

		// Act
		oRootTab._getSelectList().ontap(oFakeEvent);
		oRootTab._expandButtonPress(); // open the list again while the badge is still there

		// Assert
		assert.ok(oRootTab._isBadgeAttached, "Badge is shown on the root tab");
		assert.ok(oNestedItem._oCloneInList._isBadgeAttached, "Badge is shown on the item in the SelectList");

		// Act
		var oItemCloneInList = oNestedItem._oCloneInList;
		this.clock.tick(4000);

		// Assert
		assert.notOk(oRootTab._isBadgeAttached, "Badge is removed from the root tab");
		assert.notOk(oItemCloneInList._isBadgeAttached, "Badge is removed from the item in the SelectList");
	});

	// QUnit.module("Badges - double click area tabs", {
		// TO DO
	// });

	QUnit.module("Badges - overflow menu (More button)", {
		beforeEach: function () {
			this.iSize = 100;
			this.oITH = createHeaderWithItems(this.iSize);
			this.oITH.placeAt(DOM_RENDER_LOCATION);
		},
		afterEach: function () {
			this.oITH.destroy();
		}
	});

	QUnit.test("Badge is shown on the overflow tab when there are tabs with badges in it", function (assert) {
		// Arrange
		this.oITH.getItems()[this.iSize - 1].addCustomData(new BadgeCustomData());
		Core.applyChanges();

		// Assert
		assert.ok(this.oITH._getOverflow()._isBadgeAttached, "Badge is rendered on the overflow tab");
	});

	QUnit.test("Badge is removed from the overflow tab when there are no more tabs with badges in it", function (assert) {
		// Arrange
		this.oITH.getItems()[this.iSize - 1].addCustomData(new BadgeCustomData());

		Core.applyChanges();

		// Act
		this.oITH._getOverflow()._expandButtonPress();
		var oItems = this.oITH._getOverflow()._getSelectList().getItems();
		var oFakeEvent = {
			srcControl: oItems[oItems.length - 1],
			preventDefault: function () {}
		};
		this.oITH._getOverflow()._getSelectList().ontap(oFakeEvent);

		// Assert
		assert.notOk(this.oITH._getOverflow()._isBadgeAttached, "Badge is removed from the root tab");
	});

});