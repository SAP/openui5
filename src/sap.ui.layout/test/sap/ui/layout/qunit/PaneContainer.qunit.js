/*global QUnit */
sap.ui.define([
	"sap/ui/layout/PaneContainer",
	"sap/ui/layout/ResponsiveSplitter",
	"sap/ui/layout/SplitPane",
	"sap/m/Text",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(
	PaneContainer,
	ResponsiveSplitter,
	SplitPane,
	Text,
	nextUIUpdate
) {
	"use strict";

	QUnit.module("General");

	QUnit.test("Cleanup on destroy", function (assert) {
		// arrange
		var oPaneContainer = new PaneContainer(),
			oDestroySpy = this.spy(oPaneContainer._oSplitter, "destroy");

		// act
		oPaneContainer.destroy();

		// assert
		assert.ok(oDestroySpy.called, "Private AssociativeSplitter should be destroyed.");
		assert.notOk(oPaneContainer._oSplitter, "Private AssociativeSplitter reference should be set to null.");
	});

	QUnit.test("Invalidate on 'onLayoutDataChange'", function (assert) {
		// arrange
		var oPaneContainer = new PaneContainer(),
			oInvalidateSpy = this.spy(oPaneContainer, "invalidate");

		assert.ok(oPaneContainer.getAggregation("_splitter"), "Pane container has splitter aggregation.");

		// act
		oPaneContainer.onLayoutDataChange();

		// assert
		assert.ok(oInvalidateSpy.called, "Pane container is invalidated on layout data change.");
	});

	QUnit.module("Reflecting properties on the internal AssociativeSplitter");

	QUnit.test("Orientation", async function(assert) {
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
		await nextUIUpdate();

		// assert
		assert.ok(oWrapper.$().find(".sapUiLoSplitterBar[aria-orientation='vertical']").length, "'Horizontal' orientation is properly passed to the internal AssociativeSplitter");

		// act
		oPaneContainer.setOrientation("Vertical");
		await nextUIUpdate();

		// assert
		assert.ok(oWrapper.$().find(".sapUiLoSplitterBar[aria-orientation='horizontal']").length, "'Vertical' orientation is properly passed to the internal AssociativeSplitter");

		// clean up
		oWrapper.destroy();
	});
});
