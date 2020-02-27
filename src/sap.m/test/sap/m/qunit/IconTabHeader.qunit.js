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

	var DOM_RENDER_LOCATION = "content",
		SCROLL_ANIMATION_DURATION = 500;

	createAndAppendDiv(DOM_RENDER_LOCATION);

	function createHeaderWithItems() {
		return new IconTabHeader({
			items: [
				new IconTabFilter({text: "tab1"}),
				new IconTabFilter({text: "tab2"}),
				new IconTabFilter({text: "tab3"}),
				new IconTabFilter({text: "tab4"})
			]
		});
	}

	QUnit.module("Scrolling items");

	QUnit.test("Selecting tab when there is enough space and no overflow button/arrows are shown", function(assert) {
		// arrange
		var oITH = createHeaderWithItems(),
			oFirstItem = oITH.getItems()[0],
			oLastItem = oITH.getItems()[3];

		oITH.isTouchScrollingDisabled = function () { return true; };
		oITH.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();
		oITH.$().width("300px");
		this.clock.tick(SCROLL_ANIMATION_DURATION);

		// act
		oITH.setSelectedItem(oLastItem);
		this.clock.tick(SCROLL_ANIMATION_DURATION);

		// assert
		assert.notOk(oFirstItem.$().hasClass("sapMITBFilterHidden"), "There should be no hidden filters");

		// clean up
		oITH.destroy();
	});
});