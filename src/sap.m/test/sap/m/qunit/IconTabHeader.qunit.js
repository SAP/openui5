/*global QUnit */

sap.ui.define([
	"sap/m/IconTabHeader",
	"sap/m/IconTabFilter",
	"sap/ui/core/Core",
	"sap/ui/qunit/utils/createAndAppendDiv"
], function(
	IconTabHeader,
	IconTabFilter,
	Core,
	createAndAppendDiv
) {
	"use strict";

	var DOM_RENDER_LOCATION = "content";

	createAndAppendDiv(DOM_RENDER_LOCATION);

	function createHeaderWithItems(iNum) {
		var aItems = [];
		for (var i = 0; i < iNum; i++) {
			aItems.push(new IconTabFilter({
				text: "Tab " + i,
				key: i
			}));
		}

		return new IconTabHeader({
			items: aItems
		});
	}

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

	QUnit.module("shifting behavior");

	QUnit.test("selecting an overflown tab causes it to show up in the tab strip", function (assert) {
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
});