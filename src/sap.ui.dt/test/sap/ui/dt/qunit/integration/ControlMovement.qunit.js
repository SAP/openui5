/* global QUnit*/

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/dt/plugin/ControlDragDrop",
	"sap/ui/dt/plugin/CutPaste",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/DesignTime",
	"sap/m/Button",
	"sap/m/ObjectAttribute",
	"sap/m/ObjectHeader",
	"sap/ui/layout/VerticalLayout",
	"sap/m/Page",
	"sap/m/SplitContainer",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/events/KeyCodes",
	"sap/ui/thirdparty/sinon-4"
],
function (
	jQuery,
	ControlDragDrop,
	CutPaste,
	OverlayRegistry,
	DesignTime,
	Button,
	ObjectAttribute,
	ObjectHeader,
	VerticalLayout,
	Page,
	SplitContainer,
	QUnitUtils,
	KeyCodes,
	sinon
) {
	"use strict";

	function stubEventFor(oOverlay) {
		return {
			currentTarget: {
				id: oOverlay.getId()
			},
			preventDefault: function() {
			},
			stopPropagation: function() {
			}
		};
	}

	QUnit.module("Given overlays are created for controls that fit into aggregations of each other and don't fit to the other control", {
		beforeEach: function (assert) {
			var fnDone = assert.async();

			//Test Setup:
			//VerticalLayout
			//	content
			//		ObjectHeader
			//			attributes
			//				ObjectAttribute
			//		Button
			//		HereNotMovableButton

			var aALL_MOVABLE_TYPES = [
				"sap.m.Button",
				"sap.m.ObjectAttribute"
			];

			this.oButton = new Button();
			this.oNotMovableButton = new Button();
			this.oObjectAttribute = new ObjectAttribute({
				text: "Some attribute"
			});
			this.oObjectHeader = new ObjectHeader({
				attributes: [
					this.oObjectAttribute
				]
			});
			this.oLayout = new VerticalLayout({
				content: [
					this.oObjectHeader,
					this.oButton,
					this.oNotMovableButton
				]
			});

			this.oLayout.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			this.oControlDragDrop = new ControlDragDrop({
				draggableTypes: aALL_MOVABLE_TYPES
			});

			this.oCutPaste = new CutPaste({
				movableTypes: aALL_MOVABLE_TYPES
			});

			var fnCheckMovable = function (oOverlay) {
				if (oOverlay.getElement() === this.oNotMovableButton) {
					return Promise.resolve(false);
				}
				return Promise.resolve(true);
			}.bind(this);
			this.checkMovableDragStub = sinon.stub(this.oControlDragDrop.getElementMover(), "checkMovable").callsFake(fnCheckMovable);
			this.checkMovableCutStub = sinon.stub(this.oCutPaste.getElementMover(), "checkMovable").callsFake(fnCheckMovable);

			this.oDesignTime = new DesignTime({
				rootElements: [
					this.oLayout
				],
				plugins: [
					this.oControlDragDrop, this.oCutPaste
				]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				sap.ui.getCore().applyChanges();

				this.oLayoutOverlay = OverlayRegistry.getOverlay(this.oLayout);
				this.oLayoutAggregationOverlay = this.oLayoutOverlay.getAggregationOverlay("content");
				this.oButtonOverlay = OverlayRegistry.getOverlay(this.oButton);
				this.oNotMovableButtonOverlay = OverlayRegistry.getOverlay(this.oNotMovableButton);
				this.oObjectAttributeOverlay = OverlayRegistry.getOverlay(this.oObjectAttribute);
				this.oObjectHeaderOverlay = OverlayRegistry.getOverlay(this.oObjectHeader);
				this.oObjectHeaderAggregationOverlay = this.oObjectHeaderOverlay.getAggregationOverlay("attributes");

				fnDone();
			}, this);
		},
		afterEach: function() {
			this.oDesignTime.destroy();
			this.oLayout.destroy();
			this.checkMovableDragStub.restore();
			this.checkMovableCutStub.restore();
		}
	}, function () {
		QUnit.test("when the dragstart is triggered on a button overlay, that doesn't fit to ObjectHeader", function(assert) {
			var done = assert.async();
			this.oControlDragDrop._onDragStart(stubEventFor(this.oButtonOverlay));

			this.oControlDragDrop.getElementMover().attachValidTargetZonesActivated(function() {
				assert.ok(this.oLayoutAggregationOverlay.isTargetZone(), "the valid aggregation is marked as target zone");
				assert.ok(!this.oObjectHeaderAggregationOverlay.isTargetZone(), "the invalid aggregation is not marked as target zone");

				assert.ok(this.oLayoutAggregationOverlay.hasStyleClass("sapUiDtOverlayDropZone"), "the valid aggregation overlay has the additional drop zone style");
				assert.ok(!this.oObjectHeaderAggregationOverlay.hasStyleClass("sapUiDtOverlayDropZone"), "the invalid aggregation overlay has not the additional drop zone style");
				assert.equal(this.oControlDragDrop.getDraggedOverlay(), this.oButtonOverlay, "Dragged Overlay is remembered");
				done();
			}.bind(this));
		});

		QUnit.test("when the dragstart is triggered on the objectAttribute overlay, that fit into both aggregations", function(assert) {
			var done = assert.async();
			this.oControlDragDrop._onDragStart(stubEventFor(this.oObjectAttributeOverlay));

			this.oControlDragDrop.getElementMover().attachValidTargetZonesActivated(function() {
				assert.ok(this.oLayoutAggregationOverlay.isTargetZone(), "both aggregations are marked as target zone");
				assert.ok(this.oObjectHeaderAggregationOverlay.isTargetZone(), "both aggregations are marked as target zone");
				assert.equal(this.oControlDragDrop.getDraggedOverlay(), this.oObjectAttributeOverlay, "Dragged Overlay is remembered");
				done();
			}.bind(this));
		});

		QUnit.test("when the cut is triggered on a button overlay, that doesn't fit to ObjectHeader", function(assert) {
			var done = assert.async();
			QUnitUtils.triggerKeydown(this.oButtonOverlay.getDomRef(), KeyCodes.X, false, false, true);

			this.oCutPaste.getElementMover().attachValidTargetZonesActivated(function() {
				assert.ok(this.oLayoutAggregationOverlay.isTargetZone(), "the valid aggregation is marked as target zone");
				assert.ok(!this.oObjectHeaderAggregationOverlay.isTargetZone(), "the invalid aggregation is not marked as target zone");

				assert.ok(!this.oLayoutAggregationOverlay.hasStyleClass("sapUiDtOverlayDropZone"), "the valid aggregation overlay has not the additional drop zone style (we cutted!)");

				assert.ok(this.oButtonOverlay.hasStyleClass("sapUiDtOverlayCutted"), "the button overlay is marked with the correct style");
				assert.equal(this.oCutPaste.getCuttedOverlay(), this.oButtonOverlay, "then the button overlay is remembered as to be cutted");
				done();
			}.bind(this));
		});

		QUnit.test("when the cut is triggered on a non movable overlay (ObjectHeader)", function(assert) {
			QUnitUtils.triggerKeydown(this.oObjectHeaderOverlay.getDomRef(), KeyCodes.X, false, false, true);

			assert.ok(!this.oObjectHeaderOverlay.hasStyleClass("sapUiDtOverlayCutted"), "then the object header overlay is not marked with the cut style");
			assert.ok(!this.oLayoutAggregationOverlay.isTargetZone(), "the valid aggregation is not marked as target zone");
		});

		QUnit.test("when the cut is triggered on an in this situation non movable overlay", function(assert) {
			QUnitUtils.triggerKeydown(this.oNotMovableButtonOverlay.getDomRef(), KeyCodes.X, false, false, true);

			assert.ok(!this.oNotMovableButtonOverlay.hasStyleClass("sapUiDtOverlayCutted"), "then the button overlay is not marked with the cut style");
			assert.ok(!this.oLayoutAggregationOverlay.isTargetZone(), "the valid aggregation is not marked as target zone");
		});

		QUnit.test("when the cut is triggered on a button overlay,", function(assert) {
			var done = assert.async();
			QUnitUtils.triggerKeydown(this.oButtonOverlay.getDomRef(), KeyCodes.X, false, false, true);

			this.oCutPaste.getElementMover().attachValidTargetZonesActivated(function() {
				assert.ok(this.oCutPaste.isElementPasteable(this.oLayoutOverlay), "the target overlay of a valid element is pasteable");
				assert.ok(!this.oCutPaste.isElementPasteable(this.oObjectAttributeOverlay), "the target overlay of an invalid element is not pasteable");
				done();
			}.bind(this));
		});

		QUnit.test("and cut was triggered, when ESCAPE is triggered", function(assert) {
			QUnitUtils.triggerKeydown(this.oButtonOverlay.getDomRef(), KeyCodes.X, false, false, true);

			QUnitUtils.triggerKeydown(this.oObjectHeaderAggregationOverlay.getDomRef(), KeyCodes.ESCAPE, false, false, false);

			assert.ok(!this.oLayoutAggregationOverlay.isTargetZone(), "the valid aggregation is not marked as target zone");
			assert.ok(!this.oObjectHeaderAggregationOverlay.isTargetZone(), "the invalid aggregation is not marked as target zone");

			assert.ok(!this.oButtonOverlay.hasStyleClass("sapUiDtOverlayCutted"), "the overlay cut style class is removed");
		});

		QUnit.test("and cut was triggered, when another cut is triggered, then", function(assert) {
			var done = assert.async();
			QUnitUtils.triggerKeydown(this.oButtonOverlay.getDomRef(), KeyCodes.X, false, false, true);
			QUnitUtils.triggerKeydown(this.oObjectAttributeOverlay.getDomRef(), KeyCodes.X, false, false, true);

			this.oCutPaste.getElementMover().attachEventOnce("validTargetZonesActivated", function() {
				assert.ok(this.oLayoutAggregationOverlay.isTargetZone(), "the valid aggregation (layout) is marked as target zone");
				assert.ok(this.oObjectHeaderAggregationOverlay.isTargetZone(), "the valid aggregation (objectHeader) is marked as target zone");

				assert.ok(!this.oButtonOverlay.hasStyleClass("sapUiDtOverlayCutted"), "the overlay cut style class is removed from previously cutted overlay");
				assert.ok(this.oObjectAttributeOverlay.hasStyleClass("sapUiDtOverlayCutted"), "the overlay cut style class is added to the newly cutted overlay");
				done();
			}.bind(this));
		});

		QUnit.test("while dragging the button when dragenter is triggered on the ObjectHeader overlay,", function(assert) {
			var done = assert.async();
			assert.equal(this.oLayout.getContent()[0].getId(), this.oObjectHeader.getId(), "before ObjectHeader is at first position");
			assert.equal(this.oLayout.getContent()[1].getId(), this.oButton.getId(), "before Button is at second position");

			this.oControlDragDrop._onDragStart(stubEventFor(this.oButtonOverlay));

			this.oControlDragDrop.getElementMover().attachValidTargetZonesActivated(function() {
				this.oControlDragDrop._onDragEnter(stubEventFor(this.oObjectHeaderOverlay));
				assert.equal(this.oLayout.getContent()[0].getId(), this.oButton.getId(), "Button is at position of the ObjectHeader");
				assert.equal(this.oLayout.getContent()[1].getId(), this.oObjectHeader.getId(), "ObjectHeader is at position below");
				done();
			}.bind(this));
		});

		QUnit.test("while dragging the button when dragenter is triggered on the ObjectAttribute overlay,", function(assert) {
			this.oControlDragDrop._onDragStart(stubEventFor(this.oButtonOverlay));

			this.oControlDragDrop._onDragEnter(stubEventFor(this.oObjectAttributeOverlay));

			assert.equal(this.oLayout.getContent()[0].getId(), this.oObjectHeader.getId(), "ObjectHeader is still at first position");
			assert.equal(this.oLayout.getContent()[1].getId(), this.oButton.getId(), "Button is still at second position");
		});

		QUnit.test("while dragging the object attribute when dragenter is triggered on the layout content aggregation overlay,", function(assert) {
			this.oControlDragDrop._onDragStart(stubEventFor(this.oObjectAttributeOverlay));

			this.oControlDragDrop._onAggregationDragEnter(stubEventFor(this.oLayoutAggregationOverlay));

			assert.equal(this.oObjectHeader.getAttributes().length, 0, "object attribute is removed from the header");
			assert.equal(this.oLayout.getContent()[0].getId(), this.oObjectAttribute.getId(), "object attribute is inserted at the 1. position");
			assert.equal(this.oLayout.getContent()[1].getId(), this.oObjectHeader.getId(), "object header is now at 2. position");
			assert.equal(this.oLayout.getContent()[2].getId(), this.oButton.getId(), "button is now at 3. position");
			assert.equal(this.oLayout.getContent()[3].getId(), this.oNotMovableButton.getId(), "not movable button is now at 4. position");
		});

		QUnit.test("while dragging the object attribute when dragenter is triggered on the layout content aggregation overlay and InsertAfterElement is TRUE,", function(assert) {
			this.oControlDragDrop.setInsertAfterElement(true);
			this.oControlDragDrop._onDragStart(stubEventFor(this.oObjectAttributeOverlay));

			this.oControlDragDrop._onAggregationDragEnter(stubEventFor(this.oLayoutAggregationOverlay));

			assert.equal(this.oObjectHeader.getAttributes().length, 0, "object attribute is removed from the header");
			assert.equal(this.oLayout.getContent()[0].getId(), this.oObjectHeader.getId(), "object header is now at 1. position");
			assert.equal(this.oLayout.getContent()[1].getId(), this.oButton.getId(), "button is now at 2. position");
			assert.equal(this.oLayout.getContent()[2].getId(), this.oNotMovableButton.getId(), "not movable button is now at 3. position");
			assert.equal(this.oLayout.getContent()[3].getId(), this.oObjectAttribute.getId(), "object attribute is inserted at the 4. position");
		});

		QUnit.test("while dragging the object attribute on the layout content aggregation overlay  when dragend is triggered,", function(assert) {
			this.oControlDragDrop._onDragStart(stubEventFor(this.oObjectAttributeOverlay));

			this.oControlDragDrop._onAggregationDragEnter(stubEventFor(this.oLayoutAggregationOverlay));

			this.oControlDragDrop._onDragEnd(stubEventFor(this.oLayoutAggregationOverlay));

			assert.equal(this.oObjectHeader.getAttributes().length, 0, "object attribute is removed from the header");
			assert.equal(this.oLayout.getContent()[0].getId(), this.oObjectAttribute.getId(), "object attribute is inserted at the 1. position");
			assert.equal(this.oLayout.getContent()[1].getId(), this.oObjectHeader.getId(), "object header is now at 2. position");
			assert.equal(this.oLayout.getContent()[2].getId(), this.oButton.getId(), "button is now at 3. position");
			assert.equal(this.oLayout.getContent()[3].getId(), this.oNotMovableButton.getId(), "not movable button is now at 4. position");

			assert.ok(!this.oControlDragDrop.getElementMover()._getSource(), "source information should be deleted after move has finished");
		});

		QUnit.test("while dragging the object attribute on the layout content aggregation overlay  when dragend is triggered and InsertAfterElement is TRUE,", function(assert) {
			this.oControlDragDrop.setInsertAfterElement(true);
			this.oControlDragDrop._onDragStart(stubEventFor(this.oObjectAttributeOverlay));

			this.oControlDragDrop._onAggregationDragEnter(stubEventFor(this.oLayoutAggregationOverlay));

			this.oControlDragDrop._onDragEnd(stubEventFor(this.oLayoutAggregationOverlay));

			assert.equal(this.oObjectHeader.getAttributes().length, 0, "object attribute is removed from the header");
			assert.equal(this.oLayout.getContent()[0].getId(), this.oObjectHeader.getId(), "object header is now at 1. position");
			assert.equal(this.oLayout.getContent()[1].getId(), this.oButton.getId(), "button is now at 2. position");
			assert.equal(this.oLayout.getContent()[2].getId(), this.oNotMovableButton.getId(), "not movable button is now at 3. position");
			assert.equal(this.oLayout.getContent()[3].getId(), this.oObjectAttribute.getId(), "object attribute is inserted at the 4. position");

			assert.ok(!this.oControlDragDrop.getElementMover()._getSource(), "source information should be deleted after move has finished");
		});

		QUnit.test("when the dragend is triggered on previously dragged button overlay,", function(assert) {
			this.oControlDragDrop._onDragStart(stubEventFor(this.oButtonOverlay));

			this.oControlDragDrop._onDragEnd(stubEventFor(this.oButtonOverlay));

			assert.ok(!this.oLayoutAggregationOverlay.isTargetZone(), "the valid aggregation is no longer target zone");
			assert.ok(!this.oObjectHeaderAggregationOverlay.isTargetZone(), "the invalid aggregation is not marked as target zone");

			assert.ok(!this.oLayoutAggregationOverlay.hasStyleClass("sapUiDtOverlayDropZone"), "the valid aggregation overlay has the additional drop zone style removed after drop");
		});

		QUnit.test("when paste is triggered without cut before, then", function(assert) {
			QUnitUtils.triggerKeydown(this.oButtonOverlay.getDomRef(), KeyCodes.V, false, false, true);

			assert.equal(this.oLayout.getContent()[1].getId(), this.oButton.getId(), "nothing happened, button is still at second position");
		});

		QUnit.test("and object attribute was cutted, when paste is triggered on the layout (control with target zone aggregation), then", function(assert) {
			var done = assert.async();
			QUnitUtils.triggerKeydown(this.oObjectAttributeOverlay.getDomRef(), KeyCodes.X, false, false, true);

			this.oCutPaste.getElementMover().attachValidTargetZonesActivated(function() {
				QUnitUtils.triggerKeydown(this.oLayoutOverlay.getDomRef(), KeyCodes.V, false, false, true);
				assert.equal(this.oObjectHeader.getAttributes().length, 0, "object attribute is removed from the header");
				assert.equal(this.oLayout.getContent()[0].getId(), this.oObjectAttribute.getId(), "object attribute is inserted at the 1. position");
				assert.equal(this.oLayout.getContent()[1].getId(), this.oObjectHeader.getId(), "object header is now at 2. position");
				assert.equal(this.oLayout.getContent()[2].getId(), this.oButton.getId(), "button is now at 3. position");
				assert.equal(this.oLayout.getContent()[3].getId(), this.oNotMovableButton.getId(), "not movable button is now at 4. position");

				assert.ok(!this.oLayoutAggregationOverlay.isTargetZone(), "the valid aggregation (layout) is not marked as target zone");
				assert.ok(!this.oObjectHeaderAggregationOverlay.isTargetZone(), "the valid aggregation (objectHeader) is not marked as target zone");
				assert.ok(!this.oObjectAttributeOverlay.hasStyleClass("sapUiDtOverlayCutted"), "the overlay cut style class is removed");
				done();
			}.bind(this));
		});

		QUnit.test("and object attribute was cutted, when paste is triggered on the button (control in a target zone aggregation), then", function(assert) {
			var done = assert.async();
			QUnitUtils.triggerKeydown(this.oObjectAttributeOverlay.getDomRef(), KeyCodes.X, false, false, true);

			this.oCutPaste.getElementMover().attachValidTargetZonesActivated(function() {
				QUnitUtils.triggerKeydown(this.oButtonOverlay.getDomRef(), KeyCodes.V, false, false, true);

				assert.equal(this.oObjectHeader.getAttributes().length, 0, "object attribute is removed from the header");
				assert.equal(this.oLayout.getContent()[0].getId(), this.oObjectHeader.getId(), "object header stays at 1. position");
				assert.equal(this.oLayout.getContent()[1].getId(), this.oButton.getId(), "button is still at 2. position");
				assert.equal(this.oLayout.getContent()[2].getId(), this.oObjectAttribute.getId(), "object attribute is inserted at the 3. position after the button");

				assert.ok(!this.oLayoutAggregationOverlay.isTargetZone(), "the valid aggregation (layout) is not marked as target zone");
				assert.ok(!this.oObjectHeaderAggregationOverlay.isTargetZone(), "the valid aggregation (objectHeader) is not marked as target zone");
				assert.ok(!this.oObjectAttributeOverlay.hasStyleClass("sapUiDtOverlayCutted"), "the overlay cut style class is removed");

				assert.ok(!this.oCutPaste.getElementMover()._getSource(), "source information should be deleted after move has finished");
				done();
			}.bind(this));
		});

		QUnit.test("and button was cutted, when paste is triggered on the object attribute (control in an invalid aggregation), then", function(assert) {
			var done = assert.async();
			QUnitUtils.triggerKeydown(this.oButtonOverlay.getDomRef(), KeyCodes.X, false, false, true);

			this.oCutPaste.getElementMover().attachValidTargetZonesActivated(function() {
				QUnitUtils.triggerKeydown(this.oObjectAttributeOverlay.getDomRef(), KeyCodes.V, false, false, true);

				assert.equal(this.oObjectHeader.getAttributes().length, 1, "object attribute is removed from the header");
				assert.equal(this.oObjectHeader.getAttributes()[0].getId(), this.oObjectAttribute.getId(), "object attribute stays in header at 1. position");
				assert.equal(this.oLayout.getContent()[0].getId(), this.oObjectHeader.getId(), "object header stays at 1. position");
				assert.equal(this.oLayout.getContent()[1].getId(), this.oButton.getId(), "the button stays at the 2. position");

				assert.ok(this.oLayoutAggregationOverlay.isTargetZone(), "the valid aggregation (layout) is marked as target zone");
				assert.ok(!this.oObjectHeaderAggregationOverlay.isTargetZone(), "the invalid aggregation (objectHeader) is not marked as target zone");
				assert.ok(this.oButtonOverlay.hasStyleClass("sapUiDtOverlayCutted"), "the overlay cut style class is still there");
				done();
			}.bind(this));
		});
	});

	QUnit.module("Given overlays are created for a control with two aggregations", {
		beforeEach: function (assert) {
			var fnDone = assert.async();

			//Test Setup:
			//SplitPage
			//	masterPages
			//		Page
			//	detailPages

			var aALL_MOVABLE_TYPES = [
				"sap.m.Page"
			];

			this.oPage1 = new Page();
			this.oPage2 = new Page();
			this.oSplitContainer = new SplitContainer({
				masterPages: [
					this.oPage1,
					this.oPage2
				]
			});

			this.oSplitContainer.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			this.oControlDragDrop = new ControlDragDrop({
				draggableTypes: aALL_MOVABLE_TYPES
			});

			this.oCutPaste = new CutPaste({
				movableTypes: aALL_MOVABLE_TYPES
			});


			this.oDesignTime = new DesignTime({
				rootElements: [
					this.oSplitContainer
				],
				plugins: [
					this.oControlDragDrop,
					this.oCutPaste
				]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				sap.ui.getCore().applyChanges();

				this.oSplitContainerOverlay = OverlayRegistry.getOverlay(this.oSplitContainer);
				this.oSplitContainerMasterPagesAggregationOverlay = this.oSplitContainerOverlay.getAggregationOverlay("masterPages");
				this.oSplitContainerDetailPagesAggregationOverlay = this.oSplitContainerOverlay.getAggregationOverlay("detailPages");

				this.oPage1Overlay = OverlayRegistry.getOverlay(this.oPage1);
				this.oPage2Overlay = OverlayRegistry.getOverlay(this.oPage2);

				fnDone();
			}, this);
		},
		afterEach: function() {
			this.oDesignTime.destroy();
			this.oSplitContainer.destroy();
			this.oControlDragDrop.destroy();
			this.oCutPaste.destroy();
		}
	}, function () {
		QUnit.test("when the dragstart is triggered on the page overlay, that fit into both aggregations", function(assert) {
			var done = assert.async();
			this.oControlDragDrop._onDragStart(stubEventFor(this.oPage1Overlay));

			this.oControlDragDrop.getElementMover().attachValidTargetZonesActivated(function() {
				assert.ok(this.oSplitContainerMasterPagesAggregationOverlay.isTargetZone(), "both aggregations are marked as target zone");
				assert.ok(this.oSplitContainerDetailPagesAggregationOverlay.isTargetZone(), "both aggregations are marked as target zone");
				done();
			}.bind(this));
		});

		QUnit.test("when the page overlay is dragged into the empty detail pages aggregations", function(assert) {
			this.oControlDragDrop._onDragStart(stubEventFor(this.oPage1Overlay));
			this.oControlDragDrop._onAggregationDragEnter(stubEventFor(this.oSplitContainerDetailPagesAggregationOverlay));

			assert.equal(this.oSplitContainer.getMasterPages().length, 1, "then the page is removed from the masterPages aggregation");
			assert.equal(this.oSplitContainer.getDetailPages().length, 1, "and added to the detailPages aggregation");
			assert.strictEqual(this.oSplitContainer.getDetailPages()[0], this.oPage1, "and is the right control");
		});

		QUnit.test("when the page overlay is dragged into the empty detail pages aggregation and moved back into the not empty master pages aggregation", function(assert) {
			this.oControlDragDrop._onDragStart(stubEventFor(this.oPage1Overlay));
			this.oControlDragDrop._onAggregationDragEnter(stubEventFor(this.oSplitContainerDetailPagesAggregationOverlay));
			this.oControlDragDrop._onDragStart(stubEventFor(this.oPage1Overlay));
			this.oControlDragDrop._onAggregationDragEnter(stubEventFor(this.oSplitContainerMasterPagesAggregationOverlay));

			assert.equal(this.oSplitContainer.getMasterPages().length, 2, "then the page is again in the masterPages aggregation");
			assert.strictEqual(this.oSplitContainer.getMasterPages()[0], this.oPage1, "and is the first control on the right position");
			assert.strictEqual(this.oSplitContainer.getMasterPages()[1], this.oPage2, "and is the 2. control on the right position");
		});

		QUnit.test("when the cut is triggered on the page overlay, that fit into both aggregations", function(assert) {
			var done = assert.async();
			QUnitUtils.triggerKeydown(this.oPage1Overlay.getDomRef(), KeyCodes.X, false, false, true);

			this.oCutPaste.getElementMover().attachValidTargetZonesActivated(function() {
				assert.ok(this.oSplitContainerMasterPagesAggregationOverlay.isTargetZone(), "both aggregations are marked as target zone");
				assert.ok(this.oSplitContainerDetailPagesAggregationOverlay.isTargetZone(), "both aggregations are marked as target zone");
				done();
			}.bind(this));
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});