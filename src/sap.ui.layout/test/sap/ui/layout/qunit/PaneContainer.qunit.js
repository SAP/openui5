/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/layout/PaneContainer"
], function(
	PaneContainer
) {
	"use strict";

	QUnit.module("General");

	QUnit.test("Cleanup on destroy", function (assert) {
		// arrange
		var oPaneContainer = new PaneContainer(),
			oDestroySpy = sinon.spy(oPaneContainer._oSplitter, "destroy");

		// act
		oPaneContainer.destroy();

		// assert
		assert.ok(oDestroySpy.called, "Private AssociativeSplitter should be destroyed.");
		assert.notOk(oPaneContainer._oSplitter, "Private AssociativeSplitter reference should be set to null.");

		// clean up
		oDestroySpy.restore();
	});
});
