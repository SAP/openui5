/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/events/KeyCodes",
	"sap/m/BadgeCustomData",
	"sap/m/IconTabHeader",
	"sap/m/IconTabFilter",
	"sap/m/IconTabSeparator",
	"sap/m/Text",
	"sap/ui/core/Core",
	"sap/ui/core/InvisibleMessage",
	"sap/ui/core/CustomData",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/Panel"
], function(
	QUnitUtils,
	KeyCodes,
	BadgeCustomData,
	IconTabHeader,
	IconTabFilter,
	IconTabSeparator,
	Text,
	Core,
	InvisibleMessage,
	CustomData,
	createAndAppendDiv,
	Panel
) {
	"use strict";

	var DOM_RENDER_LOCATION = "content";
	var oRB = Core.getLibraryResourceBundle("sap.m");

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

	function fillWithItems(oITH, iCount) {
		for (var i = 0; i < iCount; i++) {
			oITH.addItem(new IconTabFilter({
				text: "Tab " + i,
				key: i
			}));
		}
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
			this.oITH = new IconTabHeader({
				selectedKey: "initiallySelected",
				items: [
					new IconTabFilter({
						key: "initiallySelected"
					})
				]
			});
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

		var $badgeIndicator = oRootTab.$().find(".sapMBadgeIndicator");

		// Assert
		assert.ok($badgeIndicator.length, "Badge is rendered on the root tab");
		assert.strictEqual($badgeIndicator.attr("aria-label"), oRB.getText("ICONTABFILTER_SUB_ITEMS_BADGES"), "'aria-label' is correct");
		assert.ok(oRootTab.$().attr("aria-labelledby").indexOf($badgeIndicator.attr("id")) === 0, "aria-labelledby starts with the badge indicator id");
	});

	QUnit.test("Badge is removed from the root tab", function (assert) {
		// Arrange
		var oRootTab = new IconTabFilter({
			text: "Tab2",
			key: "tab2",
			customData: [
				new BadgeCustomData()
			]
		});
		this.oITH.addItem(oRootTab);
		Core.applyChanges();

		var $badgeIndicator = oRootTab.$().find(".sapMBadgeIndicator");
		assert.ok(oRootTab.$().attr("aria-labelledby").indexOf($badgeIndicator.attr("id")) === 0, "aria-labelledby starts with the badge indicator id");

		QUnitUtils.triggerKeydown(oRootTab.$(), KeyCodes.ENTER);

		this.clock.tick(4000);

		// Assert
		assert.notOk(oRootTab._isBadgeAttached, "Badge is removed from the root tab");
		assert.ok(oRootTab.$().attr("aria-labelledby").indexOf($badgeIndicator.attr("id")) === -1, "aria-labelledby doesn't contain the badge indicator id");
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

		var $badgeIndicator = oRootTab.$().find(".sapMBadgeIndicator");

		assert.ok(oRootTab.$().attr("aria-labelledby").indexOf($badgeIndicator.attr("id")) === 0, "aria-labelledby starts with the badge indicator id");

		oRootTab._expandButtonPress();
		var oFakeEvent = {
			srcControl: oRootTab._getSelectList().getItems()[0],
			preventDefault: function () {}
		};

		// Act
		oRootTab._getSelectList().ontap(oFakeEvent);
		this.clock.tick(4000);

		// Assert
		assert.notOk(oRootTab.getAggregation("_expandButtonBadge")._isBadgeAttached, "Badge is removed from the root tab");
		assert.ok(oRootTab.$().attr("aria-labelledby").indexOf($badgeIndicator.attr("id")) === -1, "aria-labelledby doesn't contain the badge indicator id");
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
		assert.ok(oRootTab.getAggregation("_expandButtonBadge")._isBadgeAttached, "Badge is NOT removed from the root tab");
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
		assert.ok(oRootTab.getAggregation("_expandButtonBadge")._isBadgeAttached, "Badge is shown on the root tab");
		assert.ok(oNestedItem._oCloneInList._isBadgeAttached, "Badge is shown on the item in the SelectList");

		// Act
		var oItemCloneInList = oNestedItem._oCloneInList;
		this.clock.tick(4000);

		// Assert
		assert.notOk(oRootTab.getAggregation("_expandButtonBadge")._isBadgeAttached, "Badge is removed from the root tab");
		assert.notOk(oItemCloneInList._isBadgeAttached, "Badge is removed from the item in the SelectList");
	});

	QUnit.module("Badges - double click area tabs", {
		beforeEach: function () {
			this.oITH = new IconTabHeader({
				items: [
					new IconTabFilter({
						text: "Tab1",
						key: "tab1"
					})
				],
				content: [
					new Text()
				]
			});
			this.oITH.placeAt(DOM_RENDER_LOCATION);
		},
		afterEach: function () {
			this.oITH.destroy();
		}
	});

	QUnit.test("Badge is shown on the root tab and the expand button", function (assert) {
		// Arrange
		var oRootTab = new IconTabFilter({
			text: "Tab2",
			key: "tab2",
			customData: [
				new BadgeCustomData()
			],
			items: [
				new IconTabFilter({
					text: "Nested",
					key: "Nested",
					customData: [
						new BadgeCustomData()
					]
				})
			],
			content: [
				new Text()
			]
		});
		this.oITH.addItem(oRootTab);
		Core.applyChanges();

		var $badgeIndicator = oRootTab.$().find(".sapMBadgeIndicator");

		// Assert
		assert.strictEqual($badgeIndicator.length, 2, "There are 2 badges rendered");
	});

	QUnit.test("aria-label of the 2 badges", function (assert) {
		// Arrange
		var oRootTab = new IconTabFilter({
			text: "Tab2",
			key: "tab2",
			customData: [
				new BadgeCustomData()
			],
			items: [
				new IconTabFilter({
					text: "Nested",
					key: "Nested",
					customData: [
						new BadgeCustomData()
					]
				})
			],
			content: [
				new Text()
			]
		});
		this.oITH.addItem(oRootTab);
		Core.applyChanges();

		var $badgeIndicator1 = oRootTab.$().find(".sapMBadgeIndicator").eq(0),
			$badgeIndicator2 = oRootTab.$().find(".sapMBadgeIndicator").eq(1);

		// Assert
		assert.strictEqual($badgeIndicator1.attr("aria-label"), oRB.getText("ICONTABFILTER_BADGE"), "'aria-label' is correct");
		assert.strictEqual($badgeIndicator2.attr("aria-label"), oRB.getText("ICONTABFILTER_SUB_ITEMS_BADGES"), "'aria-label' is correct");
	});

	QUnit.test("There is badge on the root when a nested tab with badge is selected from the overflow", function (assert) {
		// Arrange
		fillWithItems(this.oITH, 100);

		var oNestedItem = new IconTabFilter({
				text: "Nested11",
				key: "Nested11"
			}),
			oRootTab = new IconTabFilter({
				text: "Tab2",
				key: "tab2",
				content: [
					new Text()
				],
				items: [
					new IconTabFilter({
						text: "Nested1",
						key: "Nested1",
						items: [
							oNestedItem
						]
					})
				]
			});
		this.oITH.addItem(oRootTab);
		Core.applyChanges();

		// Act
		oNestedItem.addCustomData(new BadgeCustomData());
		this.oITH._getOverflow()._expandButtonPress();
		var oItems = this.oITH._getOverflow()._getSelectList().getItems();
		var oFakeEvent = {
			srcControl: oItems[oItems.length - 1],
			preventDefault: function () {}
		};
		this.oITH._getOverflow()._getSelectList().ontap(oFakeEvent);
		Core.applyChanges();

		// Assert
		assert.ok(oRootTab.getAggregation("_expandButtonBadge")._isBadgeAttached, "Badge is added to the expand button");
	});

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
		assert.ok(this.oITH._getOverflow().getAggregation("_expandButtonBadge")._isBadgeAttached, "Badge is rendered on the overflow tab");
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

	QUnit.module("Badges - dynamically added", {
		beforeEach: function () {
			this.oITH = new IconTabHeader({
				items: [
					new IconTabFilter({
						text: "Tab1",
						id: "tab1",
						items: [
							new IconTabFilter({
								text: "Tab11",
								id: "tab11"
							}),
							new IconTabFilter({
								text: "Tab12",
								id: "tab12"
							})
						]
					}),
					new IconTabFilter({
						text: "Tab2",
						id: "tab2"
					})
				]
			});

			for (var i = 0; i < 100; i++) {
				this.oITH.addItem(new IconTabFilter({text: 'additional tab ' + i}));
			}

			this.oITH.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		},
		afterEach: function () {
			this.oITH.destroy();
		}
	});

	QUnit.test("Badge is added on a root tab", function (assert) {
		// Arrange
		var oRootTab = this.oITH.getItems()[0],
			oInvisibleMessageInstance = InvisibleMessage.getInstance();

		oRootTab.addCustomData(new BadgeCustomData());
		Core.applyChanges();

		var $badgeIndicator = oRootTab.$().find(".sapMBadgeIndicator"),
			oInvisibleMsgDomRef = document.getElementById(oInvisibleMessageInstance.getId() + "-assertive");

		// Assert
		assert.ok($badgeIndicator.length, "Badge is rendered on the root tab");
		assert.strictEqual($badgeIndicator.attr("aria-label"), oRB.getText("ICONTABFILTER_BADGE"),"'aria-label' is correct");
		assert.ok(oRootTab.$().attr("aria-labelledby").indexOf($badgeIndicator.attr("id")) === 0, "aria-labelledby starts with the badge indicator id");
		assert.strictEqual(oInvisibleMsgDomRef.textContent, oRB.getText("ICONTABFILTER_BADGE_MSG", oRootTab.getText()), "badge is announced");
	});

	QUnit.test("Badge is added on a child tab", function (assert) {
		// Arrange
		var oRootTab = this.oITH.getItems()[0],
			oChildTab = oRootTab.getItems()[0],
			oInvisibleMessageInstance = InvisibleMessage.getInstance();

		oChildTab.addCustomData(new BadgeCustomData());
		Core.applyChanges();

		var $badgeIndicator = oRootTab.$().find(".sapMBadgeIndicator"),
			oInvisibleMsgDomRef = document.getElementById(oInvisibleMessageInstance.getId() + "-assertive");

		// Assert
		assert.ok($badgeIndicator.length, "Badge is rendered on the root tab");
		assert.strictEqual($badgeIndicator.attr("aria-label"), oRB.getText("ICONTABFILTER_SUB_ITEMS_BADGES"),"'aria-label' is correct");
		assert.ok(oRootTab.$().attr("aria-labelledby").indexOf($badgeIndicator.attr("id")) === 0, "aria-labelledby starts with the badge indicator id");
		assert.strictEqual(oInvisibleMsgDomRef.textContent, oRB.getText("ICONTABFILTER_SUB_ITEM_BADGE", [oChildTab.getText(), oRootTab.getText()]), "badge is announced");
	});

	QUnit.test("Badge is added on an overflow tab", function (assert) {
		// Arrange
		var oRootTab = this.oITH.getItems()[90],
			oOverflowTab = this.oITH._getOverflow(),
			oInvisibleMessageInstance = InvisibleMessage.getInstance();

		oRootTab.addCustomData(new BadgeCustomData());
		Core.applyChanges();

		var $badgeIndicator = oOverflowTab.$().find(".sapMBadgeIndicator"),
			oInvisibleMsgDomRef = document.getElementById(oInvisibleMessageInstance.getId() + "-assertive");

		// Assert
		assert.ok($badgeIndicator.length, "Badge is rendered on the root tab");
		assert.strictEqual($badgeIndicator.attr("aria-label"), oRB.getText("ICONTABFILTER_SUB_ITEMS_BADGES"),"'aria-label' is correct");
		assert.ok(oOverflowTab.$().attr("aria-labelledby").indexOf($badgeIndicator.attr("id")) === 0, "aria-labelledby starts with the badge indicator id");
		assert.strictEqual(oInvisibleMsgDomRef.textContent, oRB.getText("ICONTABFILTER_SUB_ITEM_BADGE", [oRootTab.getText(), oOverflowTab.getText()]), "badge is announced");
	});

	QUnit.module("Badges and selectedKey", {
		beforeEach: function () {
			this.oITH = new IconTabHeader();
			this.oITH.placeAt(DOM_RENDER_LOCATION);
		},
		afterEach: function () {
			this.oITH.destroy();
		}
	});

	QUnit.test("Badge is removed from initially selected tab", function (assert) {
		// Arrange
		var oSelectedTab = new IconTabFilter({
			text: "Tab",
			key: "tab",
			customData: [
				new BadgeCustomData()
			]
		});
		this.oITH.addItem(oSelectedTab);
		this.oITH.setSelectedKey("tab");
		Core.applyChanges();

		// Assert
		assert.notOk(oSelectedTab._isBadgeAttached, "The badge is removed from initially selected tab");
	});

	QUnit.module("Filters CustomData", {
		beforeEach: function () {
			this.oITH = new IconTabHeader();

			// Arrange
			fillWithItems(this.oITH, 100);

			var oRootTab = new IconTabFilter({
				text: "Tab2",
				key: "tab2",
				customData: new CustomData({
					key: "a",
					value: "b",
					writeToDom: true
				})
			});
			this.oITH.addItem(oRootTab);
			this.oITH.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		},
		afterEach: function () {
			this.oITH.destroy();
		}
	});

	QUnit.test("CustomData is cloned to the overflow item", function (assert) {
		var oOverflowTab = this.oITH._getOverflow();

		QUnitUtils.triggerKeydown(oOverflowTab.$(), KeyCodes.ENTER);
		this.clock.tick(4000);

		assert.strictEqual(oOverflowTab._oPopover.$().find("li[data-a]").attr('data-a'), "b", "custom data attribute is correctly cloned");

		oOverflowTab._closePopover();
	});
});