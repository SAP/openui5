/*global QUnit*/

sap.ui.define([
	"sap/ui/rta/RuntimeAuthoring",
	"test-resources/sap/ui/rta/qunit/RtaQunitUtils",
	"sap/ui/dt/OverlayRegistry",
	"sap/m/Table",
	"sap/m/Column",
	"sap/m/Text",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/core/Core",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4"
], function(
	RuntimeAuthoring,
	RtaQunitUtils,
	OverlayRegistry,
	Table,
	Column,
	Text,
	VerticalLayout,
	Core,
	jQuery,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	// Build table
	function givenTableWithResizableColumns() {
		this.oComponent = RtaQunitUtils.createAndStubAppComponent(sandbox);
		this.oTable = new Table({
			id: this.oComponent.createId("myTable"),
			columns: [
				new Column(this.oComponent.createId("column0"), { header: [new Text("text0", { text: "column0" })], width: "auto" }),
				new Column(this.oComponent.createId("column1"), { header: [new Text("text1", { text: "column1" })], width: "auto" }),
				new Column(this.oComponent.createId("column2"), { header: [new Text("text2", { text: "column2" })], width: "auto" })
			],
			width: "500px"
		});
		this.oContainer = new VerticalLayout({
			id: this.oComponent.createId("myVerticalLayout"),
			content: [this.oTable],
			width: "100%"
		});
		this.oContainer.placeAt("qunit-fixture");
		Core.applyChanges();
	}

	function setDefaultMetadataAndSelectHandle(oResizePlugin, oColumnOverlay) {
		oColumnOverlay.setDesignTimeMetadata({
			actions: {
				resize: {
					changeType: "myChangeType"
				}
			}
		});
		oResizePlugin.registerElementOverlay(oColumnOverlay);

		oColumnOverlay.setSelectable(true);
		oColumnOverlay.setSelected(true);
	}

	// Some tests need RTA as the calculations are dependent on the style class (handle position)
	QUnit.module("Given a table in RTA...", {
		beforeEach: function() {
			givenTableWithResizableColumns.call(this);

			this.oRta = new RuntimeAuthoring({
				rootControl: this.oContainer,
				showToolbars: true,
				flexSettings: {
					developerMode: false
				}
			});

			return this.oRta.start()
				.then(function() {
					this.oColumn0Overlay = OverlayRegistry.getOverlay(this.oComponent.createId("column0"));
					this.oResizePlugin = this.oRta.getPlugins()["resize"];
				}.bind(this));
		},
		afterEach: function() {
			this.oComponent.destroy();
			this.oContainer.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when the resize handle is dragged on the column header without any extra functions on DT Metadata... ", function(assert) {
			var fnDone = assert.async();
			sandbox.stub(this.oResizePlugin, "isEnabled").withArgs([this.oColumn0Overlay]).returns(true);

			setDefaultMetadataAndSelectHandle(this.oResizePlugin, this.oColumn0Overlay);

			var oHandle = this.oResizePlugin.getHandle();
			assert.ok(this.oResizePlugin.getHandle(), "then the handle is created");
			// The middle of the handle is always positioned on the mouse cursor
			var iHalfHandleWidth = oHandle.offsetWidth / 2;

			var iColumn0OverlayOldWidth = this.oColumn0Overlay.getDomRef().offsetWidth;

			var oFinalizeResizeStub = sandbox.stub(this.oResizePlugin, "_finalizeResize");

			// Mouse down on the right limit of the handle
			var iMouseDownPosition = Math.round(oHandle.getBoundingClientRect().right);

			function onMouseDown() {
				var oFullScreenDiv = document.getElementsByClassName("sapUiRtaFullScreenDiv")[0];
				var iHandlePositionAfterMouseDown = Math.round(oHandle.getBoundingClientRect().left);
				assert.strictEqual(iHandlePositionAfterMouseDown, iMouseDownPosition - iHalfHandleWidth, "then the middle of the handle is on the mouse position");

				// Move mouse 12px to the left
				var iMouseEndPosition = iMouseDownPosition - 12;
				oFullScreenDiv.dispatchEvent(new MouseEvent("mousemove", { clientX: iMouseEndPosition }));
				assert.strictEqual(Math.round(oHandle.getBoundingClientRect().left), iMouseEndPosition - iHalfHandleWidth, "then the handle moves with the mouse to the left");

				// Then move mouse 28 px to the right
				iMouseEndPosition = iMouseEndPosition + 28;
				oFullScreenDiv.dispatchEvent(new MouseEvent("mousemove", { clientX: iMouseEndPosition }));
				assert.strictEqual(Math.round(oHandle.getBoundingClientRect().left), iMouseEndPosition - iHalfHandleWidth, "then the handle moves with the mouse to the right");

				function onMouseUp() {
					var iHandleFinalPosition = Math.round(oHandle.getBoundingClientRect().left);
					var iHandleDeltaPosition = iHandleFinalPosition - iHandlePositionAfterMouseDown;
					// Initial mouse down on handle moves it half width to the right of the overlay before resizing; so this half width must be subtracted
					var iNewWidth = iColumn0OverlayOldWidth - iHandleDeltaPosition - iHalfHandleWidth;
					assert.ok(oFinalizeResizeStub.calledWith(this.oColumn0Overlay, iNewWidth), "then on mouse up _finalizeResize is called with the right parameters");

					assert.notOk(this.oResizePlugin.getDragging(), "then dragging is disabled");

					assert.notOk(this.oResizePlugin.getBusy(), "then after mouse up the plugin is no longer busy");
					assert.notOk(document.getElementsByClassName("sapUiRtaFullScreenDiv")[0], "then on mouse up the full screen div is removed");

					fnDone();
				}

				oFullScreenDiv.addEventListener("mouseup", onMouseUp.bind(this));
				oFullScreenDiv.dispatchEvent(new MouseEvent("mouseup"));
			}

			oHandle.addEventListener("mousedown", onMouseDown.bind(this));
			oHandle.dispatchEvent(new MouseEvent("mousedown", { clientX: iMouseDownPosition }));
		});

		QUnit.test("when the resize handle is dragged on the column header and there is a handle extension... ", function(assert) {
			var fnDone = assert.async();
			sandbox.stub(this.oResizePlugin, "isEnabled").withArgs([this.oColumn0Overlay]).returns(true);

			this.oColumn0Overlay.setDesignTimeMetadata({
				actions: {
					resize: {
						changeType: "myChangeType",
						getHandleExtensionHeight: function(oElement) {
							return oElement.getParent().getDomRef().offsetHeight;
						}
					}
				}
			});
			this.oResizePlugin.registerElementOverlay(this.oColumn0Overlay);

			this.oColumn0Overlay.setSelectable(true);
			this.oColumn0Overlay.setSelected(true);

			var oHandle = this.oResizePlugin.getHandle();
			var iMouseDownPosition = oHandle.getBoundingClientRect().left;

			function onMouseDown() {
				var oFullScreenDiv = document.getElementsByClassName("sapUiRtaFullScreenDiv")[0];

				// Move mouse 10px to the right
				var iMouseEndPosition = iMouseDownPosition + 10;
				oFullScreenDiv.dispatchEvent(new MouseEvent("mousemove", { clientX: iMouseEndPosition }));
				var oHandleExtension = oHandle.getElementsByClassName("sapUiRtaResizeHandleExtension")[0];
				assert.ok(oHandleExtension, "when the mouse is moved a HandleExtension is attached to the handle");
				var iTableHeight = this.oColumn0Overlay.getElement().getParent().getDomRef().offsetHeight;
				assert.strictEqual(iTableHeight, oHandleExtension.offsetHeight, "then the extension has the size of the table as defined in DT Metadata");
				fnDone();
			}

			oHandle.addEventListener("mousedown", onMouseDown.bind(this));
			oHandle.dispatchEvent(new MouseEvent("mousedown", { clientX: iMouseDownPosition }));
		});

		QUnit.test("when the resize is executed using the keyboard (shift + arrow keys)... ", function(assert) {
			var fnDone = assert.async();
			sandbox.stub(this.oResizePlugin, "isEnabled").withArgs([this.oColumn0Overlay]).returns(true);
			setDefaultMetadataAndSelectHandle(this.oResizePlugin, this.oColumn0Overlay);

			var oOverlayDomElement = this.oColumn0Overlay.getDomRef();
			var iColumn0OverlayOldWidth = oOverlayDomElement.offsetWidth;

			var oFinalizeResizeStub = sandbox.stub(this.oResizePlugin, "_finalizeResize");

			function onShiftRightKeyDown() {
				// Resize is triggered decreasing size (-15px)
				assert.ok(oFinalizeResizeStub.calledWith(this.oColumn0Overlay, iColumn0OverlayOldWidth - 15), "then on ArrowRight, _finalizeResize is called with the decreased width");

				function onShiftLeftKeyDown() {
					// Resize is triggered increasing size (+15px)
					assert.ok(oFinalizeResizeStub.calledWith(this.oColumn0Overlay, iColumn0OverlayOldWidth + 15), "then on ArrowLeft, _finalizeResize is called with the increased width");

					function onSecondShiftRightKeyDown() {
						assert.ok(oFinalizeResizeStub.calledWith(this.oColumn0Overlay, iColumn0OverlayOldWidth), "then on ArrowRight by minimumWidth, _finalizeResize is called with the minimumWidth");
						fnDone();
					}

					this.oColumn0Overlay.setDesignTimeMetadata({
						actions: {
							resize: {
								changeType: "myChangeType",
								getSizeLimits: function() {
									return {
										minimumWidth: iColumn0OverlayOldWidth
									};
								}
							}
						}
					});
					this.oResizePlugin.registerElementOverlay(this.oColumn0Overlay);

					oOverlayDomElement.addEventListener("keydown", onSecondShiftRightKeyDown.bind(this), { once: true });
					oOverlayDomElement.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", shiftKey: true }));
				}

				oOverlayDomElement.addEventListener("keydown", onShiftLeftKeyDown.bind(this), { once: true });
				oOverlayDomElement.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", shiftKey: true }));
			}

			oOverlayDomElement.addEventListener("keydown", onShiftRightKeyDown.bind(this), { once: true });
			oOverlayDomElement.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", shiftKey: true }));
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});