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

	QUnit.module("Resize");

	QUnit.test("when there is not enough space, items should be hidden", function(assert) {
		// arrange
		var oITH = createHeaderWithItems(),
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
});