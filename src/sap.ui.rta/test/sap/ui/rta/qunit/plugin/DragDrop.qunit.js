/* global QUnit */

sap.ui.define([
	"sap/ui/fl/Layer",
	"sap/m/Button",
	"sap/m/Bar",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/rta/plugin/DragDrop",
	"sap/ui/thirdparty/sinon-4"
], function(
	Layer,
	Button,
	Bar,
	VerticalLayout,
	DesignTime,
	OverlayRegistry,
	CommandFactory,
	DragDropPlugin,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	var oCommandFactory = new CommandFactory({
		flexSettings: {
			layer: Layer.VENDOR
		}
	});

	function fnCheckRelevantOverlays(aRelevantOverlays, assert) {
		assert.ok(aRelevantOverlays.indexOf(this.oMiddleButton1Overlay) > -1, "evaluateEditable is called with the overlay for moved middle button");
		assert.ok(aRelevantOverlays.indexOf(this.oMiddleButton2Overlay) > -1, "evaluateEditable is called with the overlay for the remaining middle button of the source aggregation");
		assert.ok(aRelevantOverlays.indexOf(this.oLeftButtonOverlay) > -1, "evaluateEditable is called with the overlay for the left button of the target aggregation");
		assert.ok(aRelevantOverlays.indexOf(this.oBarOverlay) > -1, "evaluateEditable is called with the overlay for the parent element (bar)");
	}

	QUnit.module("Given a bar with elements in different aggregations", {
		// Parent (VerticalLayout)
		// 	oBar (Bar)
		// 		contentLeft
		// 			[oLeftButton]
		// 		contentMiddle
		// 			[oMiddleButton1, oMiddleButton2]
		beforeEach: function (assert) {
			this.oLeftButton = new Button({id: "LeftButton", visible: true, text: "Left"});
			this.oMiddleButton1 = new Button({id: "MiddleButton1", visible: true, text: "Middle1"});
			this.oMiddleButton2 = new Button({id: "MiddleButton2", visible: true, text: "Middle2"});

			this.oBar = new Bar({
				id: "bar",
				contentLeft: [this.oLeftButton],
				contentMiddle: [this.oMiddleButton1, this.oMiddleButton2]
			});

			this.oLayout = new VerticalLayout({
				id: "parent",
				content: [this.oBar],
				width: "100%"
			});

			this.oLayout.placeAt("qunit-fixture");

			this.oDesignTime = new DesignTime({
				rootElements: [this.oLayout]
			});

			this.oDragDropPlugin = new DragDropPlugin({
				commandFactory: oCommandFactory
			});

			this.oDragDropPlugin.setDesignTime(this.oDesignTime);

			var done = assert.async();

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oMiddleButton1Overlay = OverlayRegistry.getOverlay(this.oMiddleButton1);
				this.oMiddleButton2Overlay = OverlayRegistry.getOverlay(this.oMiddleButton2);
				this.oLeftButtonOverlay = OverlayRegistry.getOverlay(this.oLeftButton);
				this.oBarOverlay = OverlayRegistry.getOverlay(this.oBar);
				this.oElementMover.setMovedOverlay(this.oMiddleButton1Overlay);
				done();
			}.bind(this));

			this.oElementMover = this.oDragDropPlugin.getElementMover();
			sandbox.stub(this.oElementMover, "buildMoveCommand").resolves();
		},

		afterEach: function () {
			sandbox.restore();
			this.oLayout.destroy();
			this.oDesignTime.destroy();
			this.oDragDropPlugin.destroy();
		}
	}, function () {
		QUnit.test("When OnDragEnd is called with one button being moved from the middle to the left aggregation (position 0)", function(assert) {
			var done = assert.async();

			this.oElementMover.repositionOn(this.oMiddleButton1Overlay, this.oLeftButtonOverlay, /*bInsertAtEnd=*/false);

			sandbox.stub(this.oDragDropPlugin, "evaluateEditable").callsFake(function(aRelevantOverlays) {
				fnCheckRelevantOverlays.call(this, aRelevantOverlays, assert);
				done();
			}.bind(this));

			this.oDragDropPlugin.onDragEnd(this.oMiddleButton1Overlay);
		});

		QUnit.test("When OnDragEnd is called with one button being moved from the middle to the left aggregation (position 1)", function(assert) {
			var done = assert.async();

			this.oElementMover.repositionOn(this.oMiddleButton1Overlay, this.oLeftButtonOverlay, /*bInsertAtEnd=*/true);

			sandbox.stub(this.oDragDropPlugin, "evaluateEditable").callsFake(function(aRelevantOverlays) {
				fnCheckRelevantOverlays.call(this, aRelevantOverlays, assert);
				done();
			}.bind(this));

			this.oDragDropPlugin.onDragEnd(this.oMiddleButton1Overlay);
		});

		QUnit.test("When OnDragEnd is called with one button being moved from the middle to the left aggregation (simulate 'insertInto')", function(assert) {
			var done = assert.async();

			var oTargetAggregationOverlay = this.oLeftButtonOverlay.getParentAggregationOverlay();
			this.oElementMover.insertInto(this.oMiddleButton1Overlay, oTargetAggregationOverlay, true);

			sandbox.stub(this.oDragDropPlugin, "evaluateEditable").callsFake(function(aRelevantOverlays) {
				fnCheckRelevantOverlays.call(this, aRelevantOverlays, assert);
				done();
			}.bind(this));

			this.oDragDropPlugin.onDragEnd(this.oMiddleButton1Overlay);
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});