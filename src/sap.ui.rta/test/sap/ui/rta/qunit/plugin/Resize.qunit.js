/*global QUnit*/

sap.ui.define([
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/util/ZIndexManager",
	"sap/ui/rta/plugin/Resize",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/rta/command/FlexCommand",
	"sap/ui/rta/command/Resize",
	"sap/ui/rta/RuntimeAuthoring",
	"test-resources/sap/ui/rta/qunit/RtaQunitUtils",
	"sap/ui/dt/OverlayRegistry",
	"sap/m/Table",
	"sap/m/Column",
	"sap/m/Text",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/core/Core",
	"sap/ui/thirdparty/sinon-4"
], function(
	ChangesWriteAPI,
	DesignTime,
	ZIndexManager,
	Resize,
	CommandFactory,
	FlexCommand,
	ResizeCommand,
	RuntimeAuthoring,
	RtaQunitUtils,
	OverlayRegistry,
	Table,
	Column,
	Text,
	VerticalLayout,
	Core,
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

	QUnit.module("Given a table in Design Time with a Resize Plugin...", {
		beforeEach: function(assert) {
			givenTableWithResizableColumns.call(this);
			var fnDone = assert.async();

			this.oResizePlugin = new Resize({
				commandFactory: new CommandFactory()
			});

			this.oDesignTime = new DesignTime({
				rootElements: [this.oContainer],
				plugins: [this.oResizePlugin]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oColumn0Overlay = OverlayRegistry.getOverlay(this.oComponent.createId("column0"));
				fnDone();
			}.bind(this));
		},
		afterEach: function() {
			sandbox.restore();
			this.oDesignTime.destroy();
			this.oResizePlugin.destroy();
			this.oComponent.destroy();
			this.oContainer.destroy();
		}
	}, function() {
		QUnit.test("if the action is not on the control designtime metadata of a column...", function(assert) {
			this.oColumn0Overlay.setDesignTimeMetadata({
				actions: {}
			});

			this.oResizePlugin.registerElementOverlay(this.oColumn0Overlay);

			assert.notOk(this.oResizePlugin.isEnabled([this.oColumn0Overlay]), "then 'isEnabled' returns false");
			return this.oResizePlugin._isEditable(this.oColumn0Overlay)
				.then(function(bResult) {
					assert.notOk(bResult, "then 'isEditable' returns false");
				});
		});

		QUnit.test("if the action is disabled on the control designtime metadata of a column...", function(assert) {
			this.oColumn0Overlay.setDesignTimeMetadata({
				actions: {
					resize: {
						isEnabled: false
					}
				}
			});
			this.oResizePlugin.registerElementOverlay(this.oColumn0Overlay);

			assert.notOk(this.oResizePlugin.isEnabled([this.oColumn0Overlay]), "then 'isEnabled' returns false");
		});

		QUnit.test("if the action does not have a valid change handler for a column...", function(assert) {
			this.oColumn0Overlay.setDesignTimeMetadata({
				actions: {
					resize: {
						changeType: "myWrongChangeType"
					}
				}
			});
			this.oResizePlugin.registerElementOverlay(this.oColumn0Overlay);

			return this.oResizePlugin._isEditable(this.oColumn0Overlay)
				.then(function(bResult) {
					assert.notOk(bResult, "then 'isEditable' returns false");
				});
		});

		QUnit.test("if the action has a valid change handler for a column...", function(assert) {
			var sChangeType = "MyChangeType";
			sandbox.stub(ChangesWriteAPI, "getChangeHandler").callsFake(function(mPropertyBag) {
				if (mPropertyBag.changeType === sChangeType) {
					return Promise.resolve();
				}
				return Promise.reject();
			});
			this.oColumn0Overlay.setDesignTimeMetadata({
				actions: {
					resize: {
						changeType: sChangeType
					}
				}
			});
			this.oResizePlugin.registerElementOverlay(this.oColumn0Overlay);

			return this.oResizePlugin._isEditable(this.oColumn0Overlay)
				.then(function(bResult) {
					assert.ok(bResult, "then 'isEditable' returns true");
				});
		});

		QUnit.test("if the action has a custom handler for a column...", function(assert) {
			this.oColumn0Overlay.setDesignTimeMetadata({
				actions: {
					resize: {
						handler: function () {
							return;
						}
					}
				}
			});
			this.oResizePlugin.registerElementOverlay(this.oColumn0Overlay);

			return this.oResizePlugin._isEditable(this.oColumn0Overlay)
				.then(function(bResult) {
					assert.ok(bResult, "then 'isEditable' returns true");
				});
		});

		QUnit.test("when the Resize plugin is unregistered and registered again for an Overlay", function(assert) {
			function checkEventHandlerCalled(sEventName, oStub, iCallCount) {
				if (sEventName === "mouseleave") {
					this.oColumn0Overlay.$().trigger(sEventName); // "mouseleave" event is not triggered using "dispatchEvent"
				} else {
					this.oColumn0Overlay.getDomRef().dispatchEvent(new Event(sEventName));
				}
				assert.strictEqual(oStub.callCount, iCallCount, "then on " + sEventName + " event the method is called the correct number of times");
			}

			sandbox.stub(this.oResizePlugin, "isEnabled").returns(true);

			var oCreateHandleStub = sandbox.stub(this.oResizePlugin, "_onOverlayMouseMove");
			var oOnMouseLeaveStub = sandbox.stub(this.oResizePlugin, "_onOverlayMouseLeave");
			var oHandleKeyDownStub = sandbox.stub(this.oResizePlugin, "_onOverlayKeyDown");
			var oOverlaySelectionChangeStub = sandbox.stub(this.oResizePlugin, "_onOverlaySelectionChange");
			var oOverlayFocusStub = sandbox.stub(this.oResizePlugin, "_onOverlayFocus");
			var oOverlayGeometryChangedStub = sandbox.stub(this.oResizePlugin, "_onOverlayGeometryChanged");

			this.oResizePlugin.deregisterElementOverlay(this.oColumn0Overlay);
			checkEventHandlerCalled.call(this, "mousemove", oCreateHandleStub, 0);
			checkEventHandlerCalled.call(this, "mouseleave", oOnMouseLeaveStub, 0);
			checkEventHandlerCalled.call(this, "keydown", oHandleKeyDownStub, 0);
			checkEventHandlerCalled.call(this, "focus", oOverlayFocusStub, 0);
			this.oColumn0Overlay.fireEvent("selectionChange");
			assert.notOk(oOverlaySelectionChangeStub.called, "on Overlay selection change after deregistration, the handler method is not called");
			this.oColumn0Overlay.fireEvent("geometryChanged");
			assert.notOk(oOverlayGeometryChangedStub.called, "on Overlay geometry changed after deregistration, the handler method is not called");

			this.oResizePlugin.registerElementOverlay(this.oColumn0Overlay);
			checkEventHandlerCalled.call(this, "mousemove", oCreateHandleStub, 1);
			checkEventHandlerCalled.call(this, "mouseleave", oOnMouseLeaveStub, 1);
			checkEventHandlerCalled.call(this, "keydown", oHandleKeyDownStub, 1);
			checkEventHandlerCalled.call(this, "focus", oOverlayFocusStub, 1);
			this.oColumn0Overlay.fireEvent("selectionChange");
			assert.ok(oOverlaySelectionChangeStub.calledOnce, "on Overlay selection change after registration, the handler method is called");
			this.oColumn0Overlay.fireEvent("geometryChanged");
			assert.ok(oOverlayGeometryChangedStub.called, "on Overlay geometry changed after registration, the handler method is called");

			this.oResizePlugin.deregisterElementOverlay(this.oColumn0Overlay);
			checkEventHandlerCalled.call(this, "mousemove", oCreateHandleStub, 1);
			checkEventHandlerCalled.call(this, "mouseleave", oOnMouseLeaveStub, 1);
			checkEventHandlerCalled.call(this, "keydown", oHandleKeyDownStub, 1);
			checkEventHandlerCalled.call(this, "focus", oOverlayFocusStub, 1);
			this.oColumn0Overlay.fireEvent("selectionChange");
			assert.strictEqual(oOverlaySelectionChangeStub.callCount, 1, "on Overlay selection change after deregistration, the handler method is not called again");
			this.oColumn0Overlay.fireEvent("geometryChanged");
			assert.strictEqual(oOverlayGeometryChangedStub.callCount, 1, "on Overlay geometry changed after deregistration, the handler method is not called again");
		});

		QUnit.test("when the mouse is over an enabled and selectable overlay...", function(assert) {
			this.oColumn0Overlay.setSelectable(true);

			sandbox.stub(this.oResizePlugin, "isEnabled").withArgs([this.oColumn0Overlay]).returns(true);

			this.oResizePlugin.registerElementOverlay(this.oColumn0Overlay);
			this.oColumn0OverlayDomElement = this.oColumn0Overlay.getDomRef();
			this.oColumn0OverlayDomElement.dispatchEvent(new Event("mousemove"));

			var aHandle = this.oColumn0OverlayDomElement.getElementsByClassName("sapUiRtaResizeHandle");
			assert.strictEqual(aHandle.length, 1, "one handle is created on the overlay");
			var oHandle = aHandle[0];

			// The ZIndexManager picks new Z indices in steps of 10
			var iExpectedZIndex = ZIndexManager.getNextZIndex() - 10;
			assert.strictEqual(parseInt(oHandle.style["z-index"]), iExpectedZIndex, "the handle is created with the expected Z-Index");

			assert.strictEqual(this.oResizePlugin.getHandle(), oHandle, "then the handle is properly set on the plugin");

			var oRemoveHandleSpy = sandbox.spy(this.oResizePlugin.getHandle(), "remove");
			this.oColumn0Overlay.$().trigger("mouseleave"); // "mouseleave" event is not triggered using "dispatchEvent"
			assert.ok(oRemoveHandleSpy.called, "on mouse leave, the handle is removed");
			this.oColumn0OverlayDomElement.dispatchEvent(new Event("mousemove"));
			aHandle = this.oColumn0OverlayDomElement.getElementsByClassName("sapUiRtaResizeHandle");
			oHandle = aHandle[0];
			assert.strictEqual(aHandle.length, 1, "on new mousemove, handle is recreated on the overlay");
			oRemoveHandleSpy = sandbox.spy(this.oResizePlugin.getHandle(), "remove");

			oHandle.dispatchEvent(new Event("mousemove"));
			assert.ok(oRemoveHandleSpy.notCalled, "on mouse over an existing handle, it is not removed");
			assert.strictEqual(this.oResizePlugin.getHandle(), oHandle, "on mouse over an existing handle, still the same handle remains");

			var oChildOverlay = this.oColumn0Overlay.getAggregationOverlay("header").getChildren()[0];
			oChildOverlay.setSelectable(true);
			oChildOverlay.getDomRef().dispatchEvent(new Event("mousemove", { bubbles: true }));
			assert.ok(oRemoveHandleSpy.calledOnce, "if the handle is on a not-enabled selectable child Overlay, the handle is removed");

			aHandle = this.oColumn0OverlayDomElement.getElementsByClassName("sapUiRtaResizeHandle");
			assert.strictEqual(aHandle.length, 0, "the handle is not added to the enabled Overlay while mouse is over the not-enabled child overlay");

			this.oColumn0Overlay.setSelectable(false);
			this.oColumn0OverlayDomElement.dispatchEvent(new Event("mousemove", { bubbles: true }));
			assert.notOk(this.oResizePlugin.getHandle(), "then on a non-selectable Overlay the handle is not created");
		});

		QUnit.test("when the overlay is selected and deselected... ", function(assert) {
			sandbox.stub(this.oResizePlugin, "isEnabled").withArgs([this.oColumn0Overlay]).returns(true);

			this.oResizePlugin.registerElementOverlay(this.oColumn0Overlay);
			this.oColumn0Overlay.setSelectable(true);
			this.oColumn0Overlay.setSelected(true);
			assert.ok(this.oResizePlugin.getHandle(), "then the handle is created");

			this.oColumn0Overlay.setSelected(false);
			assert.notOk(this.oResizePlugin.getHandle(), "then the handle is removed");
		});

		QUnit.test("when a selected overlay loses focus and then gets it again... ", function(assert) {
			sandbox.stub(this.oResizePlugin, "isEnabled").withArgs([this.oColumn0Overlay]).returns(true);

			this.oResizePlugin.registerElementOverlay(this.oColumn0Overlay);
			this.oColumn0Overlay.setSelectable(true);
			this.oColumn0Overlay.setSelected(true);
			this.oResizePlugin._removeHandle();

			this.oColumn0Overlay.focus();
			assert.ok(this.oResizePlugin.getHandle(), "then the handle is created again");
		});
	});

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
			this.oRta.destroy();
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
			assert.ok(oHandle, "then the handle is created");
			// The middle of the handle is always positioned on the mouse cursor
			var iHalfHandleWidth = oHandle.offsetWidth / 2;

			var iColumn0OverlayOldWidth = this.oColumn0Overlay.getDomRef().offsetWidth;

			var oFinalizeResizeStub = sandbox.stub(this.oResizePlugin, "_finalizeResize");

			// Mouse down on the left limit of the handle
			var iMouseDownPosition = Math.round(oHandle.getBoundingClientRect().left);

			function onMouseDown() {
				assert.ok(this.oResizePlugin.getBusy(), "then on mouse down the plugin is busy");
				var oFullScreenDiv = document.getElementsByClassName("sapUiRtaFullScreenDiv")[0];
				assert.ok(oFullScreenDiv, "then the full screen div is created");
				assert.ok(this.oColumn0Overlay.hasFocus(), "then the corresponding overlay is focused");
				var iHandlePositionAfterMouseDown = Math.round(oHandle.getBoundingClientRect().left);
				assert.strictEqual(iHandlePositionAfterMouseDown, iMouseDownPosition - iHalfHandleWidth, "then the middle of the handle is on the mouse position");

				// Move mouse 12px to the right
				var iMouseEndPosition = iMouseDownPosition + 12;
				oFullScreenDiv.dispatchEvent(new MouseEvent("mousemove", { clientX: iMouseEndPosition }));
				assert.strictEqual(Math.round(oHandle.getBoundingClientRect().left), iMouseEndPosition - iHalfHandleWidth, "then the handle moves with the mouse to the right");
				assert.notOk(oHandle.getElementsByClassName("sapUiRtaResizeHandleExtension").length, "then a handle extension is not created");

				// Then move mouse 28 px to the left
				iMouseEndPosition = iMouseEndPosition - 28;
				oFullScreenDiv.dispatchEvent(new MouseEvent("mousemove", { clientX: iMouseEndPosition }));
				assert.strictEqual(Math.round(oHandle.getBoundingClientRect().left), iMouseEndPosition - iHalfHandleWidth, "then the handle moves with the mouse to the left");

				function onMouseUp() {
					var iHandleFinalPosition = Math.round(oHandle.getBoundingClientRect().left);
					var iHandleDeltaPosition = iHandleFinalPosition - iHandlePositionAfterMouseDown;
					// Initial mouse down on handle moves it half width to the left of the overlay before resizing; so this half width must be subtracted
					var iNewWidth = iColumn0OverlayOldWidth + iHandleDeltaPosition - iHalfHandleWidth;
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

		QUnit.test("when _finalizeResize is called with no change in width... ", function(assert) {
			var oCreateCommandSpy = sandbox.spy(this.oResizePlugin, "_createCommand");

			var iColumn0OverlayOldWidth = this.oColumn0Overlay.getDomRef().offsetWidth;

			this.oResizePlugin._finalizeResize(this.oColumn0Overlay, iColumn0OverlayOldWidth);
			assert.strictEqual(oCreateCommandSpy.callCount, 0, "then _createCommand is not called");
		});

		QUnit.test("when _finalizeResize is called with a change in width... ", function(assert) {
			assert.expect(6);
			var oCreateCommandStub = sandbox.stub(this.oResizePlugin, "_createCommand").resolves();

			var iColumn0OverlayOldWidth = this.oColumn0Overlay.getDomRef().offsetWidth;

			var iNewWidth = iColumn0OverlayOldWidth - 10;

			return this.oResizePlugin._finalizeResize(this.oColumn0Overlay, iNewWidth)
				.then(function() {
					var oPluginOnGeometryChangedSpy = sandbox.spy(this.oResizePlugin, "_onOverlayGeometryChanged");
					var oCreateHandleStub = sandbox.stub(this.oResizePlugin, "_createHandle");

					function onGeometryChanged() {
						assert.notOk(oPluginOnGeometryChangedSpy.called, "then _onOverlayGeometryChanged was not called");

						assert.ok(this.oColumn0Overlay.getSelected(), "then the overlay is selected");
						assert.ok(this.oColumn0Overlay.hasFocus(), "then the overlay is focused");

						assert.ok(oCreateCommandStub.calledWith(this.oColumn0Overlay, Math.round(iNewWidth)), "then _createCommand is called with the right parameters");

						function onGeometryChangedAgain() {
							assert.ok(oPluginOnGeometryChangedSpy.called, "then _onOverlayGeometryChanged was called after the first geometryChanged event");
							assert.ok(oCreateHandleStub.called, "then _createHandle is called");
						}

						this.oColumn0Overlay.attachEventOnce("geometryChanged", onGeometryChangedAgain, this);

						this.oColumn0Overlay.fireGeometryChanged({ id: this.oColumn0Overlay.getId() });
					}
					this.oColumn0Overlay.attachEventOnce("geometryChanged", onGeometryChanged, this);

					this.oColumn0Overlay.fireGeometryChanged();
				}.bind(this));
		});

		QUnit.test("when _finalizeResize is called and the handler returns no changes... ", function(assert) {
			sandbox.stub(this.oResizePlugin, "getAction").returns({
				handler: function() {
					return Promise.resolve([]);
				}
			});

			var iColumn0OverlayOldWidth = this.oColumn0Overlay.getDomRef().offsetWidth;

			var iNewWidth = iColumn0OverlayOldWidth - 10;

			var oFireElementModifiedSpy = sandbox.spy(this.oResizePlugin, "fireElementModified");

			return this.oResizePlugin._finalizeResize(this.oColumn0Overlay, iNewWidth)
				.then(function() {
					assert.ok(oFireElementModifiedSpy.notCalled, "then no command is created and fireElementModified is not called");
				});
		});

		QUnit.test("when _finalizeResize is called with a change in width but the handler fails... ", function(assert) {
			var sErrorMessage = "I failed!";
			sandbox.stub(this.oResizePlugin, "getAction").returns({
				handler: function() {
					return Promise.reject(sErrorMessage);
				}
			});

			var iColumn0OverlayOldWidth = this.oColumn0Overlay.getDomRef().offsetWidth;

			var iNewWidth = iColumn0OverlayOldWidth - 10;

			return this.oResizePlugin._finalizeResize(this.oColumn0Overlay, iNewWidth)
				.catch(function(oError) {
					assert.equal(
						oError.message,
						"Error occurred during handler execution. Original error: Error - " + sErrorMessage,
						"then the proper error is raised"
					);
					assert.ok(this.oColumn0Overlay.isSelected(), "then the overlay is selected");
					assert.ok(this.oColumn0Overlay.hasFocus(), "then the overlay is focused");
				}.bind(this));
		});

		QUnit.test("when _finalizeResize is called with a change in width but the command creation fails... ", function(assert) {
			var sErrorMessage = "I failed!";
			var oError = new Error(sErrorMessage);
			sandbox.stub(this.oResizePlugin, "_createCommand").rejects(oError);

			var iColumn0OverlayOldWidth = this.oColumn0Overlay.getDomRef().offsetWidth;

			var iNewWidth = iColumn0OverlayOldWidth - 10;

			return this.oResizePlugin._finalizeResize(this.oColumn0Overlay, iNewWidth)
				.catch(function(oError) {
					assert.equal(
						oError.message,
						"Error occurred during resize command creation. Original error: Error - " + sErrorMessage,
						"then the proper error is raised"
					);
					assert.ok(this.oColumn0Overlay.isSelected(), "then the overlay is selected");
					assert.ok(this.oColumn0Overlay.hasFocus(), "then the overlay is focused");
				}.bind(this));
		});

		QUnit.test("when _createCommand is called with a change in width... ", function(assert) {
			var oCreateCommandStub = sandbox.stub(this.oResizePlugin, "_createCommand").resolves();

			var iColumn0OverlayOldWidth = this.oColumn0Overlay.getDomRef().offsetWidth;

			var iNewWidth = iColumn0OverlayOldWidth - 10;

			this.oResizePlugin._finalizeResize(this.oColumn0Overlay, iNewWidth);

			assert.ok(oCreateCommandStub.calledWith(this.oColumn0Overlay, iNewWidth), "then _createCommand is called with the right parameters");
		});

		QUnit.test("when _createCommand is called without a handler in the DT Metadata... ", function(assert) {
			var fnDone = assert.async();
			setDefaultMetadataAndSelectHandle(this.oResizePlugin, this.oColumn0Overlay);

			var oColumn0Element = this.oColumn0Overlay.getElement();
			var sVariantManagementReference = this.oResizePlugin.getVariantManagementReference(this.oColumn0Overlay);
			var iNewWidth = this.oColumn0Overlay.getDomRef().offsetWidth - 10;

			// Stub required to bypass the change handler check
			sandbox.stub(FlexCommand.prototype, "prepare").resolves(true);

			var oGetCommandForSpy = sandbox.spy(this.oResizePlugin.getCommandFactory(), "getCommandFor").withArgs(oColumn0Element, "resize");
			sandbox.stub(this.oResizePlugin, "fireElementModified").callsFake(function(mArgs) {
				var aCommands = mArgs.command.getCommands();
				assert.ok(aCommands[0] instanceof ResizeCommand, "then fireElementModified is called with a composite command containing a resize command");
				assert.strictEqual(aCommands.length, 1, "then the composite command has only one resize command");
				fnDone();
			});

			return this.oResizePlugin._createCommand(this.oColumn0Overlay, iNewWidth)
				.then(function() {
					assert.ok(oGetCommandForSpy.calledWith(oColumn0Element, "resize", {
						changeType: "myChangeType",
						content: {
							resizedElementId: oColumn0Element.getId(),
							newWidth: iNewWidth
						}
					}, undefined, sVariantManagementReference), "then getCommandFor is called with the right parameters for the resize command");
				});
		});

		QUnit.test("when _createCommand is called with a handler in the DT Metadata... ", function(assert) {
			var fnDone = assert.async();
			var iNewWidth = this.oColumn0Overlay.getDomRef().offsetWidth - 10;
			var oTable = Core.byId(this.oComponent.createId("myTable"));
			var oColumn0 = Core.byId(this.oComponent.createId("column0"));
			var oColumn1 = Core.byId(this.oComponent.createId("column1"));
			var oColumn2 = Core.byId(this.oComponent.createId("column2"));

			this.oColumn0Overlay.setDesignTimeMetadata({
				actions: {
					resize: {
						changeType: "myChangeType",
						handler: function(oElement, mChangeSpecificData) {
							assert.strictEqual(oElement, this.oColumn0Overlay.getElement(), "the correct element is passed to the handler function");
							assert.strictEqual(mChangeSpecificData.newWidth, iNewWidth, "the correct newWidth is passed to the handler function");

							return Promise.resolve([{
								changeSpecificData: {
									changeType: "myChangeType0",
									content: {
										resizedElement: oColumn0,
										newWidth: 10
									}
								},
								selectorElement: oTable
							}, {
								changeSpecificData: {
									changeType: "myChangeType1",
									content: {
										resizedElement: oColumn1,
										newWidth: 20
									}
								},
								selectorElement: oTable
							}, {
								changeSpecificData: {
									changeType: "myChangeType2",
									content: {
										resizedElement: oColumn2,
										newWidth: 30
									}
								},
								selectorElement: oTable
							}]);
						}.bind(this)
					}
				}
			});
			this.oResizePlugin.registerElementOverlay(this.oColumn0Overlay);

			// Select overlay to create first handle
			this.oColumn0Overlay.setSelectable(true);
			this.oColumn0Overlay.setSelected(true);

			var sVariantManagementReference = this.oResizePlugin.getVariantManagementReference(this.oColumn0Overlay);

			// Stub required to bypass the change handler check
			sandbox.stub(FlexCommand.prototype, "prepare").resolves(true);

			var oGetCommandForSpy = sandbox.spy(this.oResizePlugin.getCommandFactory(), "getCommandFor").withArgs(sinon.match.any, "resize");
			sandbox.stub(this.oResizePlugin, "fireElementModified").callsFake(function(mArgs) {
				var aCommands = mArgs.command.getCommands();
				assert.ok(aCommands[0] instanceof ResizeCommand, "then fireElementModified is called with a composite command containing resize commands");
				assert.strictEqual(aCommands.length, 3, "then the composite command has three resize commands");
				fnDone();
			});

			return this.oResizePlugin._createCommand(this.oColumn0Overlay, iNewWidth)
				.then(function() {
					assert.ok(oGetCommandForSpy.calledWith(oTable, "resize", {
						changeType: "myChangeType0",
						content: {
							resizedElement: oColumn0,
							newWidth: 10
						}
					}, undefined, sVariantManagementReference), "then getCommandFor is called with the right parameters for the first resize command");
					assert.ok(oGetCommandForSpy.calledWith(oTable, "resize", {
						changeType: "myChangeType1",
						content: {
							resizedElement: oColumn1,
							newWidth: 20
						}
					}, undefined, sVariantManagementReference), "then getCommandFor is called with the right parameters for the second resize command");
					assert.ok(oGetCommandForSpy.calledWith(oTable, "resize", {
						changeType: "myChangeType2",
						content: {
							resizedElement: oColumn2,
							newWidth: 30
						}
					}, undefined, sVariantManagementReference), "then getCommandFor is called with the right parameters for the third resize command");
				});
		});

		QUnit.test("when the resize handle is dragged on the column header and there are size limits defined on the designtime metadata... ", function(assert) {
			var fnDone = assert.async();
			sandbox.stub(this.oResizePlugin, "isEnabled").withArgs([this.oColumn0Overlay]).returns(true);
			var iColumn0OverlayOldWidth = this.oColumn0Overlay.getDomRef().offsetWidth;
			var iLimitStep = 40;
			var iMinWidth = iColumn0OverlayOldWidth - iLimitStep;
			var iMaxWidth = iColumn0OverlayOldWidth + iLimitStep;

			this.oColumn0Overlay.setDesignTimeMetadata({
				actions: {
					resize: {
						changeType: "myChangeType",
						getSizeLimits: function(oElement) {
							assert.ok(oElement, this.oColumn0Overlay.getElement(), "then the right element is passed to the getSizeLimits function");
							return {
								minimumWidth: iMinWidth,
								maximumWidth: iMaxWidth
							};
						}.bind(this)
					}
				}
			});
			this.oResizePlugin.registerElementOverlay(this.oColumn0Overlay);

			// Select overlay to create first handle
			this.oColumn0Overlay.setSelectable(true);
			this.oColumn0Overlay.setSelected(true);

			var oHandle = this.oResizePlugin.getHandle();
			var iMouseInitialPosition = oHandle.getBoundingClientRect().left;

			var oFinalizeResizeStub = sandbox.stub(this.oResizePlugin, "_finalizeResize");

			function onFirstMouseDown() {
				var oFullScreenDiv = document.getElementsByClassName("sapUiRtaFullScreenDiv")[0];

				var iMouseFinalPosition = iMouseInitialPosition + 60;
				var iExpectedHandlePosition = iMaxWidth - oHandle.offsetWidth;
				oFullScreenDiv.dispatchEvent(new MouseEvent("mousemove", { clientX: iMouseFinalPosition }));
				assert.strictEqual(oHandle.offsetLeft, iExpectedHandlePosition, "then the handle moves with the mouse to the right up to the defined limit");

				function onFirstMouseUp() {
					assert.ok(oFinalizeResizeStub.calledWith(this.oColumn0Overlay, iMaxWidth), "then on mouse up _finalizeResize is called with the maximum permitted width");
					this.oColumn0Overlay.setSelected(false);
					this.oColumn0Overlay.setSelected(true);
					oHandle = this.oResizePlugin.getHandle();
					iMouseInitialPosition = oHandle.getBoundingClientRect().left;

					function onSecondMouseDown() {
						oFullScreenDiv = document.getElementsByClassName("sapUiRtaFullScreenDiv")[0];
						iMouseFinalPosition = iMouseInitialPosition - 60;
						iExpectedHandlePosition = iMinWidth - oHandle.offsetWidth;
						oFullScreenDiv.dispatchEvent(new MouseEvent("mousemove", { clientX: iMouseFinalPosition }));
						assert.strictEqual(oHandle.offsetLeft, iExpectedHandlePosition, "then the handle moves with the mouse to the left up to the defined limit");

						function onSecondMouseUp() {
							assert.ok(oFinalizeResizeStub.calledWith(this.oColumn0Overlay, iMinWidth), "then on mouse up _finalizeResize is called with the minimum permitted width");
							fnDone();
						}

						oFullScreenDiv.addEventListener("mouseup", onSecondMouseUp.bind(this), { once: true });
						oFullScreenDiv.dispatchEvent(new MouseEvent("mouseup"));
					}

					oHandle.addEventListener("mousedown", onSecondMouseDown.bind(this), { once: true });
					oHandle.dispatchEvent(new MouseEvent("mousedown", { clientX: iMouseInitialPosition }));
				}
				oFullScreenDiv.addEventListener("mouseup", onFirstMouseUp.bind(this), { once: true });
				oFullScreenDiv.dispatchEvent(new MouseEvent("mouseup"));
			}

			oHandle.addEventListener("mousedown", onFirstMouseDown.bind(this), { once: true });
			oHandle.dispatchEvent(new MouseEvent("mousedown", { clientX: iMouseInitialPosition }));
		});

		QUnit.test("when the resize handle is dragged on the column header and only maximumWidth is defined on the DesignTime Metadata... ", function(assert) {
			var fnDone = assert.async();
			sandbox.stub(this.oResizePlugin, "isEnabled").withArgs([this.oColumn0Overlay]).returns(true);
			var iColumn0OverlayOldWidth = this.oColumn0Overlay.getDomRef().offsetWidth;
			var iMaxWidth = iColumn0OverlayOldWidth + 40;

			this.oColumn0Overlay.setDesignTimeMetadata({
				actions: {
					resize: {
						changeType: "myChangeType",
						getSizeLimits: function(oElement) {
							assert.strictEqual(oElement, this.oColumn0Overlay.getElement(), "then the right element is passed to the getSizeLimits function");
							return {
								maximumWidth: iMaxWidth
							};
						}.bind(this)
					}
				}
			});
			this.oResizePlugin.registerElementOverlay(this.oColumn0Overlay);

			// Select overlay to create first handle
			this.oColumn0Overlay.setSelectable(true);
			this.oColumn0Overlay.setSelected(true);

			var oHandle = this.oResizePlugin.getHandle();
			var iMouseInitialPosition = oHandle.getBoundingClientRect().left;

			var oFinalizeResizeStub = sandbox.stub(this.oResizePlugin, "_finalizeResize");

			function onFirstMouseDown() {
				var oFullScreenDiv = document.getElementsByClassName("sapUiRtaFullScreenDiv")[0];

				var iMouseFinalPosition = iMouseInitialPosition + 60;
				var iExpectedHandlePosition = iMaxWidth - oHandle.offsetWidth;
				oFullScreenDiv.dispatchEvent(new MouseEvent("mousemove", { clientX: iMouseFinalPosition }));
				assert.strictEqual(oHandle.offsetLeft, iExpectedHandlePosition, "then the handle moves with the mouse to the right up to the defined limit");

				function onFirstMouseUp() {
					assert.ok(oFinalizeResizeStub.calledWith(this.oColumn0Overlay, iMaxWidth), "then on mouse up _finalizeResize is called with the maximum permitted width");
					this.oColumn0Overlay.setSelected(false);
					this.oColumn0Overlay.setSelected(true);
					oHandle = this.oResizePlugin.getHandle();
					iMouseInitialPosition = oHandle.getBoundingClientRect().left;

					function onSecondMouseDown() {
						oFullScreenDiv = document.getElementsByClassName("sapUiRtaFullScreenDiv")[0];
						// Move handle outside of the control border
						iMouseFinalPosition = iMouseInitialPosition - 175;
						iExpectedHandlePosition = 15 - oHandle.offsetWidth;
						oFullScreenDiv.dispatchEvent(new MouseEvent("mousemove", { clientX: iMouseFinalPosition }));
						assert.strictEqual(oHandle.offsetLeft, iExpectedHandlePosition, "then the handle moves with the mouse to the left up to the hardcoded minimum width");

						function onSecondMouseUp() {
							assert.ok(oFinalizeResizeStub.calledWith(this.oColumn0Overlay, 15), "then on mouse up _finalizeResize is called with the hardcoded minimum width");
							fnDone();
						}

						oFullScreenDiv.addEventListener("mouseup", onSecondMouseUp.bind(this), { once: true });
						oFullScreenDiv.dispatchEvent(new MouseEvent("mouseup"));
					}

					oHandle.addEventListener("mousedown", onSecondMouseDown.bind(this), { once: true });
					oHandle.dispatchEvent(new MouseEvent("mousedown", { clientX: iMouseInitialPosition }));
				}
				oFullScreenDiv.addEventListener("mouseup", onFirstMouseUp.bind(this), { once: true });
				oFullScreenDiv.dispatchEvent(new MouseEvent("mouseup"));
			}

			oHandle.addEventListener("mousedown", onFirstMouseDown.bind(this), { once: true });
			oHandle.dispatchEvent(new MouseEvent("mousedown", { clientX: iMouseInitialPosition }));
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

		QUnit.test("when the resize handle is dragged on the column header and the escape key is pressed... ", function(assert) {
			var fnDone = assert.async();
			sandbox.stub(this.oResizePlugin, "isEnabled").withArgs([this.oColumn0Overlay]).returns(true);

			setDefaultMetadataAndSelectHandle(this.oResizePlugin, this.oColumn0Overlay);

			var oHandle = this.oResizePlugin.getHandle();
			var iMouseDownPosition = oHandle.getBoundingClientRect().left;

			var oFinalizeResizeSpy = sandbox.spy(this.oResizePlugin, "_finalizeResize");

			function onMouseDown() {
				var oFullScreenDiv = document.getElementsByClassName("sapUiRtaFullScreenDiv")[0];

				// Move mouse 10px to the right
				var iMouseEndPosition = iMouseDownPosition + 10;
				oFullScreenDiv.dispatchEvent(new MouseEvent("mousemove", { clientX: iMouseEndPosition }));

				this.oColumn0Overlay.getDomRef().dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
				assert.notOk(this.oResizePlugin.getHandle(), "then the handle is removed");
				assert.notOk(document.getElementsByClassName("sapUiRtaFullScreenDiv")[0], "then the FullScreenDiv is removed");
				assert.notOk(oFinalizeResizeSpy.called, "then _finalizeResize is not called");
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
				// Resize is triggered increasing size (+15px)
				assert.ok(oFinalizeResizeStub.calledWith(this.oColumn0Overlay, iColumn0OverlayOldWidth + 15), "then on ArrowRight, _finalizeResize is called with the increased width");

				function onShiftLeftKeyDown() {
					// Resize is triggered decreasing size (-15px)
					assert.ok(oFinalizeResizeStub.calledWith(this.oColumn0Overlay, iColumn0OverlayOldWidth - 15), "then on ArrowLeft, _finalizeResize is called with the decreased width");

					function onSecondShiftLeftKeyDown() {
						assert.ok(oFinalizeResizeStub.calledWith(this.oColumn0Overlay, iColumn0OverlayOldWidth), "then on ArrowLeft by minimumWidth, _finalizeResize is called with the minimumWidth");
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

					oOverlayDomElement.addEventListener("keydown", onSecondShiftLeftKeyDown.bind(this), { once: true });
					oOverlayDomElement.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", shiftKey: true }));
				}

				oOverlayDomElement.addEventListener("keydown", onShiftLeftKeyDown.bind(this), { once: true });
				oOverlayDomElement.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", shiftKey: true }));
			}

			oOverlayDomElement.addEventListener("keydown", onShiftRightKeyDown.bind(this), { once: true });
			oOverlayDomElement.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", shiftKey: true }));
		});

		QUnit.test("when the arrow keys are pressed without shift key... ", function(assert) {
			var fnDone = assert.async();
			sandbox.stub(this.oResizePlugin, "isEnabled").withArgs([this.oColumn0Overlay]).returns(true);
			setDefaultMetadataAndSelectHandle(this.oResizePlugin, this.oColumn0Overlay);

			var oOverlayDomElement = this.oColumn0Overlay.getDomRef();

			var oFinalizeResizeStub = sandbox.stub(this.oResizePlugin, "_finalizeResize");

			function onRightKeyDown() {
				assert.ok(oFinalizeResizeStub.notCalled, "then _finalizeResize is not called");
				fnDone();
			}

			oOverlayDomElement.addEventListener("keydown", onRightKeyDown.bind(this), { once: true });
			oOverlayDomElement.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", shiftKey: false }));
		});

		QUnit.test("when a double click is done on the handle... ", function(assert) {
			var fnDone = assert.async();
			sandbox.stub(this.oResizePlugin, "isEnabled").withArgs([this.oColumn0Overlay]).returns(true);

			var oFinalizeResizeStub = sandbox.stub(this.oResizePlugin, "_finalizeResize");
			var iDoubleClickWidth = 150;

			this.oColumn0Overlay.setDesignTimeMetadata({
				actions: {
					resize: {
						changeType: "myChangeType",
						getDoubleClickWidth: function(oElement) {
							assert.strictEqual(oElement, this.oColumn0Overlay.getElement(), "then the correct element is passed to the getDoubleClickWidth function");
							return iDoubleClickWidth;
						}.bind(this)
					}
				}
			});
			this.oResizePlugin.registerElementOverlay(this.oColumn0Overlay);

			this.oColumn0Overlay.setSelectable(true);
			this.oColumn0Overlay.setSelected(true);

			var oHandle = this.oResizePlugin.getHandle();

			function onMouseDown() {
				assert.ok(oFinalizeResizeStub.calledWith(this.oColumn0Overlay, iDoubleClickWidth), "then _finalizeResize is called with the width defined in DT Metadata");
				assert.notOk(this.oResizePlugin.getBusy(), "then the plugin is no longer busy");
				fnDone();
			}

			oHandle.addEventListener("mousedown", onMouseDown.bind(this));
			// Simulate double-click
			oHandle.dispatchEvent(new MouseEvent("mousedown", { detail: 2 }));
		});
	});


	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});