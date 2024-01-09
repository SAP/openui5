/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/TabStrip",
	"sap/m/TabStripItem",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(qutils, createAndAppendDiv, TabStrip, TabStripItem, nextUIUpdate) {
	"use strict";

	// prepare DOM
	createAndAppendDiv("content");


	QUnit.module("events", {
		beforeEach: async function () {
			this.sut = new TabStrip({
				items: [
					new TabStripItem({ key: 'a', text: 'a'})
				]
			});
			this.sut.setHasSelect(true);
			this.sut.placeAt('qunit-fixture');
			await nextUIUpdate();
		},
		afterEach: function () {
			this.sut.destroy();
		}
	});

	QUnit.test("tap", function(assert) {
		//arrange
		var oSelect = this.sut.getAggregation('_select'),
			oSelectItem = oSelect.getItems()[0],
			oCloseButton = oSelectItem.getAggregation('_closeButton'),
			bHandlerCalledCount = 0;

		oSelectItem.attachItemClosePressed(function() {
			bHandlerCalledCount++;
		});

		//act
		oSelect.open();
		qutils.triggerEvent("tap", oCloseButton.getId());

		//assert
		assert.equal(bHandlerCalledCount, 1, "itemClosePressed fired");
	});
});