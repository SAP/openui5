/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/layout/PaneContainer",
	"sap/ui/layout/ResponsiveSplitter",
	"sap/ui/layout/SplitPane",
	"sap/m/Text",
	"sap/ui/core/Core"
], function(
	PaneContainer,
	ResponsiveSplitter,
	SplitPane,
	Text,
	Core
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

	QUnit.module("Reflecting properties on the internal AssociativeSplitter");

	QUnit.test("Orientation", function (assert) {
		// arrange
		var oPaneContainer = new PaneContainer({
			panes: [
				new SplitPane({ content: new Text({ text: "pane1" }) }),
				new SplitPane({ content: new Text({ text: "pane2" }) })
			]
		});
		var oWrapper = new ResponsiveSplitter({
			rootPaneContainer: oPaneContainer
		});

		oWrapper.placeAt("qunit-fixture");
		Core.applyChanges();

		// assert
		assert.ok(oWrapper.$().find(".sapUiLoSplitterBar[aria-orientation='vertical']").length, "'Horizontal' orientation is properly passed to the internal AssociativeSplitter");

		// act
		oPaneContainer.setOrientation("Vertical");
		Core.applyChanges();

		// assert
		assert.ok(oWrapper.$().find(".sapUiLoSplitterBar[aria-orientation='horizontal']").length, "'Vertical' orientation is properly passed to the internal AssociativeSplitter");

		// clean up
		oWrapper.destroy();
	});
});
