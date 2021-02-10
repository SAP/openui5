/* global QUnit */

sap.ui.define([
	"sap/ui/dt/OverlayUtil",
	"sap/ui/dt/plugin/ControlDragDrop",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/layout/VerticalLayout",
	"sap/m/Button"
], function (
	OverlayUtil,
	ControlDragDrop,
	DesignTime,
	OverlayRegistry,
	VerticalLayout,
	Button
) {
	"use strict";

	QUnit.module("Given that a ControlDragDrop is initialized ", {
		beforeEach: function(assert) {
			this.oButton0 = new Button();
			this.oButton1 = new Button();
			this.oLayout = new VerticalLayout({content: [this.oButton0, this.oButton1]});
			this.oEmptyLayout = new VerticalLayout();
			this.oParentLayout = new VerticalLayout({content: [this.oLayout, this.oEmptyLayout]});
			this.oParentLayout.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			this.oDragDrop = new ControlDragDrop();
			this.oDesignTime = new DesignTime({
				rootElements: [this.oParentLayout],
				plugins: [this.oDragDrop]
			});

			var done = assert.async();

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oLayoutOverlay = OverlayRegistry.getOverlay(this.oLayout);
				this.oAggregationOverlay = this.oLayoutOverlay.getAggregationOverlay("content");
				this.oAggregationOverlay.setTargetZone(true);
				this.oEmptyLayoutOverlay = OverlayRegistry.getOverlay(this.oEmptyLayout);
				this.oEmptyAggregationOverlay = this.oEmptyLayoutOverlay.getAggregationOverlay("content");
				this.oEmptyAggregationOverlay.setTargetZone(true);
				this.oButtonOverlay0 = OverlayRegistry.getOverlay(this.oButton0);
				this.oButtonOverlay0.setMovable(true);
				this.oButtonOverlay1 = OverlayRegistry.getOverlay(this.oButton1);
				this.oButtonOverlay1.setMovable(true);
				done();
			}.bind(this));
		},
		afterEach: function() {
			OverlayRegistry.getOverlay(this.oParentLayout).destroy();
			this.oButtonOverlay0.destroy();
			this.oButtonOverlay1.destroy();
			this.oLayoutOverlay.destroy();
			this.oEmptyLayoutOverlay.destroy();
			this.oParentLayout.destroy();
			this.oDragDrop.destroy();
			this.oDesignTime.destroy();
		}
	}, function () {
		QUnit.test("when an element is dragged over the first element of an aggregation", function(assert) {
			this.oDragDrop.onDragStart(this.oButtonOverlay1);
			this.oDragDrop.onDragEnter(this.oButtonOverlay0);
			assert.strictEqual(
				OverlayUtil.getParentInformation(this.oButtonOverlay1).index,
				0,
				"then it is moved to the first position"
			);
		});

		QUnit.test("when an element is dragged over the last element of an aggregation", function(assert) {
			this.oDragDrop.onDragStart(this.oButtonOverlay0);
			this.oDragDrop.onDragEnter(this.oButtonOverlay1);
			assert.strictEqual(
				OverlayUtil.getParentInformation(this.oButtonOverlay0).index,
				1,
				"then it is moved to the last position"
			);
		});

		QUnit.test("when an element is dragged over an aggregation that contains other elements", function(assert) {
			this.oDragDrop.onDragStart(this.oButtonOverlay1);
			this.oDragDrop.onAggregationDragEnter(this.oAggregationOverlay);
			assert.strictEqual(
				OverlayUtil.getParentInformation(this.oButtonOverlay1).index,
				1,
				"then its position doesn't change"
			);
		});

		QUnit.test("when an element is dragged over an empty aggregation", function(assert) {
			this.oDragDrop.onDragStart(this.oButtonOverlay1);
			this.oDragDrop.onAggregationDragEnter(this.oEmptyAggregationOverlay);
			assert.strictEqual(
				this.oButtonOverlay1.getParentAggregationOverlay(),
				this.oEmptyAggregationOverlay,
				"then its inserted into the empty aggregation"
			);
		});
	});
});