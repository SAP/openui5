/* global QUnit */

sap.ui.define([
	"sap/m/Button",
	"sap/m/Page",
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/Core",
	"sap/ui/dt/ElementOverlay",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/rta/plugin/Plugin",
	"sap/ui/rta/plugin/Rename",
	"sap/ui/rta/RuntimeAuthoring",
	"sap/ui/rta/util/ReloadManager",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/rta/qunit/RtaQunitUtils"
], function(
	Button,
	Page,
	ComponentContainer,
	Core,
	ElementOverlay,
	OverlayRegistry,
	JsControlTreeModifier,
	ChangesWriteAPI,
	PersistenceWriteAPI,
	BasePlugin,
	RenamePlugin,
	RuntimeAuthoring,
	ReloadManager,
	sinon,
	RtaQunitUtils
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	QUnit.module("basic functionality", {
		before: function() {
			QUnit.config.fixture = null;
			this.oButton1 = new Button("button1");
			this.oButton2 = new Button("button2");
			this.oComponent = RtaQunitUtils.createAndStubAppComponent(
				sandbox,
				"fixture.application",
				undefined,
				new Page("page", {
					content: [this.oButton1, this.oButton2]
				})
			);
			this.oPage = this.oComponent.getRootControl();

			this.oComponentContainer = new ComponentContainer("CompCont", {
				component: this.oComponent
			});
			this.oComponentContainer.placeAt("qunit-fixture");
			Core.applyChanges();
		},
		beforeEach: function() {
			sandbox.stub(BasePlugin.prototype, "hasChangeHandler").resolves(true);
			sandbox.stub(PersistenceWriteAPI, "getResetAndPublishInfoFromSession").returns({
				isResetEnabled: true,
				isPublishEnabled: true
			});

			this.oRta = new RuntimeAuthoring({
				showToolbars: false,
				rootControl: this.oComponent
			});
			sandbox.stub(ReloadManager, "handleReloadOnStart").resolves(false);

			return this.oRta.start().then(function() {
				return this.oRta.getService("supportTools");
			}.bind(this));
		},
		afterEach: function() {
			this.oRta.destroy();
			sandbox.restore();
		},
		after: function() {
			QUnit.config.fixture = "";
			this.oComponentContainer.destroy();
		}
	}, function() {
		QUnit.test("when an 'overlayInfo' event is triggered", function(assert) {
			var fnDone = assert.async();
			// To prevent changes in the control's designtime affecting this test, we return
			// these three plugins and check for the number of plugins in the response
			sandbox.stub(ElementOverlay.prototype, "getEditableByPlugins").returns([
				"sap.ui.rta.plugin.Rename",
				"sap.ui.rta.plugin.Remove",
				"sap.ui.rta.plugin.Combine"
			]);
			// The same goes for the "isAvailable" function
			sandbox.stub(RenamePlugin.prototype, "isAvailable").returns(true);

			function onMessage(oEvent) {
				if (
					oEvent.data.id === "ui5FlexibilitySupport.submodules.overlayInfo"
					&& oEvent.data.type === "overlayInfo"
				) {
					assert.strictEqual(oEvent.data.content.plugins.length, 3, "then the number of returned plugins is correct");
					assert.ok(
						oEvent.data.content.plugins.some(function(mPlugin) {
							return (
								mPlugin.name === "sap.ui.rta.plugin.Rename"
								&& mPlugin.isAvailable === true
								&& mPlugin.hasChangeHandler === true
							);
						}),
						"then proper information about the 'rename' plugin is returned"
					);
					window.removeEventListener("message", onMessage);
					fnDone();
				}
			}

			window.postMessage({
				id: "ui5FlexibilitySupport.submodules.overlayInfo",
				type: "getOverlayInfo",
				content: {
					overlayId: OverlayRegistry.getOverlay("button1").getId()
				}
			});

			window.addEventListener("message", onMessage);
		});

		QUnit.test("when a 'printChangeHandler' event is triggered", function(assert) {
			var fnDone = assert.async();
			var oConsoleStub = sandbox.stub(console, "log");

			ChangesWriteAPI.getChangeHandler({
				changeType: "rename",
				element: Core.byId("button1"),
				modifier: JsControlTreeModifier,
				layer: "CUSTOMER"
			}).then(function(oChangeHandler) {
				oConsoleStub
				.callThrough()
				.withArgs(oChangeHandler)
				.callsFake(function() {
					assert.ok(true, "then the change handler is printed to console");
					fnDone();
				});

				window.postMessage({
					id: "ui5FlexibilitySupport.submodules.overlayInfo",
					type: "printChangeHandler",
					content: {
						overlayId: OverlayRegistry.getOverlay("button1").getId(),
						pluginName: "sap.ui.rta.plugin.Rename"
					}
				});
			});
		});

		QUnit.test("when a 'printDesignTimeMetadata' event is triggered", function(assert) {
			var fnDone = assert.async();
			var oConsoleStub = sandbox.stub(console, "log");
			var oButtonOverlay = OverlayRegistry.getOverlay("button1");
			var oButtonDesigntimeMetadata = oButtonOverlay.getDesignTimeMetadata().getData();

			oConsoleStub
			.callThrough()
			.withArgs(oButtonDesigntimeMetadata)
			.callsFake(function() {
				assert.ok(true, "then the design time metadata is printed to console");
				fnDone();
			});

			window.postMessage({
				id: "ui5FlexibilitySupport.submodules.overlayInfo",
				type: "printDesignTimeMetadata",
				content: {
					overlayId: oButtonOverlay.getId()
				}
			});
		});

		QUnit.test("when an 'changeOverlaySelection' event is triggered on a selectable overlay", function(assert) {
			var fnDone = assert.async();
			OverlayRegistry.getOverlay("button1").setSelected(false);
			OverlayRegistry.getOverlay("button2").setSelected(true);
			assert.notOk(OverlayRegistry.getOverlay("button1").getSelected(), "Initially, overlay of button1 is not selected");
			assert.strictEqual(this.oRta.getSelection()[0], OverlayRegistry.getOverlay("button2"), "Initially, overlay of button2 is selected");
			function onMessage(oEvent) {
				if (
					oEvent.data.id === "ui5FlexibilitySupport.submodules.overlayInfo"
					&& oEvent.data.type === "changeOverlaySelection"
				) {
					assert.strictEqual(this.oRta.getSelection()[0], OverlayRegistry.getOverlay("button1"), "After processing the correct Overlay is selected");
					assert.ok(OverlayRegistry.getOverlay("button1").getSelected(), "After processing the selection status of the Overlay is correct");
					assert.notOk(OverlayRegistry.getOverlay("button1").hasStyleClass("sapUiFlexibilitySupportExtension_Selected"), "After processing the extension styleclass is not set");
					fnDone();
				}
			}

			window.postMessage({
				id: "ui5FlexibilitySupport.submodules.overlayInfo",
				type: "changeOverlaySelection",
				content: {
					overlayId: OverlayRegistry.getOverlay("button1").getId()
				}
			});

			window.addEventListener("message", onMessage.bind(this), { once: true });
		});

		QUnit.test("when an 'changeOverlaySelection' event is triggered on a non selectable overlay", function(assert) {
			var fnDone = assert.async();
			OverlayRegistry.getOverlay("button1").setSelected(false);
			OverlayRegistry.getOverlay("button1").setSelectable(false);
			OverlayRegistry.getOverlay("button2").setSelected(true);
			assert.notOk(OverlayRegistry.getOverlay("button1").getSelected(), "Initially, overlay of button1 is not selected");
			assert.strictEqual(this.oRta.getSelection()[0], OverlayRegistry.getOverlay("button2"), "Initially, overlay of button2 is selected");
			function onMessage(oEvent) {
				if (
					oEvent.data.id === "ui5FlexibilitySupport.submodules.overlayInfo"
					&& oEvent.data.type === "changeOverlaySelection"
				) {
					assert.notOk(OverlayRegistry.getOverlay("button1").getSelected(), "After processing the non selectable overlay is not selected");
					assert.strictEqual(this.oRta.getSelection().length, 0, "After processing the selection is cleared");
					assert.ok(
						OverlayRegistry.getOverlay("button1").getDomRef().classList.contains("sapUiFlexibilitySupportExtension_Selected"),
						"After processing the extension styleclass is set"
					);
					fnDone();
				}
			}

			window.postMessage({
				id: "ui5FlexibilitySupport.submodules.overlayInfo",
				type: "changeOverlaySelection",
				content: {
					overlayId: OverlayRegistry.getOverlay("button1").getId()
				}
			});

			window.addEventListener("message", onMessage.bind(this), { once: true });
		});

		QUnit.test("when an 'changeOverlaySelection' event is triggered on a non selectable overlay without DomRef", function(assert) {
			var fnDone = assert.async();
			OverlayRegistry.getOverlay("button1").setSelected(false);
			OverlayRegistry.getOverlay("button1").setSelectable(false);
			OverlayRegistry.getOverlay("button1")._$DomRef = null; // there is no better way to remove DomRef...
			OverlayRegistry.getOverlay("button2").setSelected(true);
			assert.notOk(OverlayRegistry.getOverlay("button1").getSelected(), "Initially, overlay of button1 is not selected");
			assert.strictEqual(this.oRta.getSelection()[0], OverlayRegistry.getOverlay("button2"), "Initially, overlay of button2 is selected");
			function onMessages(oEvent) {
				if (
					oEvent.data.id === "ui5FlexibilitySupport.submodules.overlayInfo"
					&& oEvent.data.type === "changeOverlaySelection"
				) {
					assert.notOk(OverlayRegistry.getOverlay("button1").getSelected(), "After processing the non selectable overlay is not selected");
				} else if (
					oEvent.data.id === "ui5FlexibilitySupport.submodules.overlayInfo"
					&& oEvent.data.type === "getOverlayInfo"
				) {
					assert.ok(true, "Message for collecting overlay data received");
					window.removeEventListener("message", onMessages);
					fnDone();
				}
			}

			window.postMessage({
				id: "ui5FlexibilitySupport.submodules.overlayInfo",
				type: "changeOverlaySelection",
				content: {
					overlayId: OverlayRegistry.getOverlay("button1").getId()
				}
			});

			window.addEventListener("message", onMessages);
		});

		QUnit.test("when an 'changeOverlaySelection' event is triggered when a non selectable overlay is unselected", function(assert) {
			var fnDone = assert.async();
			OverlayRegistry.getOverlay("button1").setSelected(false);
			OverlayRegistry.getOverlay("button1").setSelectable(false);
			OverlayRegistry.getOverlay("button2").setSelected(true);
			assert.notOk(OverlayRegistry.getOverlay("button1").getSelected(), "Initially, overlay of button1 is not selected");
			assert.strictEqual(this.oRta.getSelection()[0], OverlayRegistry.getOverlay("button2"), "Initially, overlay of button2 is selected");
			function onMessageReceived(oEvent) {
				if (
					oEvent.data.id === "ui5FlexibilitySupport.submodules.overlayInfo"
					&& oEvent.data.type === "changeOverlaySelection"
					&& OverlayRegistry.getOverlay(oEvent.data.content.overlayId).getElement().getId() === "button2"
				) {
					assert.notOk(OverlayRegistry.getOverlay("button1").hasStyleClass("sapUiFlexibilitySupportExtension_Selected"), "After processing the extension styleclass is removed");
					assert.ok(OverlayRegistry.getOverlay("button2").getSelected(), "the correct overlay is selected");
					window.removeEventListener("message", onMessageReceived);
					fnDone();
				}
			}

			window.postMessage({
				id: "ui5FlexibilitySupport.submodules.overlayInfo",
				type: "changeOverlaySelection",
				content: {
					overlayId: OverlayRegistry.getOverlay("button1").getId()
				}
			});

			window.postMessage({
				id: "ui5FlexibilitySupport.submodules.overlayInfo",
				type: "changeOverlaySelection",
				content: {
					overlayId: OverlayRegistry.getOverlay("button2").getId()
				}
			});

			window.addEventListener("message", onMessageReceived);
		});

		QUnit.test("when contextmenu is closed", function(assert) {
			var fnDone = assert.async();
			OverlayRegistry.getOverlay("button1").setSelected(false);
			OverlayRegistry.getOverlay("button2").setSelected(true);

			// open a context menu on button2 overlay
			var oContexMenu = this.oRta.getPlugins().contextMenu;
			var oContextMenuEvent = new MouseEvent("contextmenu", {
				bubbles: true,
				cancelable: true,
				view: window,
				buttons: 2
			});
			oContexMenu.oContextMenuControl.openAsContextMenu(oContextMenuEvent, OverlayRegistry.getOverlay("button2"));
			Core.applyChanges();
			assert.strictEqual(document.getElementsByClassName("sapUiDtContextMenu").length, 1, "ContextMenu is available");

			function onMessage(oEvent) {
				if (
					oEvent.data.id === "ui5FlexibilitySupport.submodules.overlayInfo"
					&& oEvent.data.type === "changeOverlaySelection"
				) {
					assert.strictEqual(document.getElementsByClassName("sapUiDtContextMenu").length, 0, "ContextMenu is not available any more");
					fnDone();
				}
			}

			window.postMessage({
				id: "ui5FlexibilitySupport.submodules.overlayInfo",
				type: "changeOverlaySelection",
				content: {
					overlayId: OverlayRegistry.getOverlay("button1").getId()
				}
			});

			window.addEventListener("message", onMessage.bind(this), { once: true });
		});

		QUnit.test("when RTA is closed", function(assert) {
			var fnDone = assert.async();
			function onMessageStop(oEvent) {
				if (
					oEvent.data.id === "ui5FlexibilitySupport.submodules.overlayInfo"
					&& oEvent.data.type === "rtaStopped"
				) {
					assert.ok(true, "the correct message is sent to the extension");
					fnDone();
				}
			}

			window.addEventListener("message", onMessageStop.bind(this), { once: true });
			this.oRta.fireStop();
		});

		QUnit.test("when an 'collectOverlayTableData' event is triggered", function(assert) {
			var fnDone = assert.async();

			function mockTableEntity(oOverlay) {
				return {
					id: oOverlay.getId(),
					elementId: oOverlay.getElement().getId(),
					visible: oOverlay.getSelectable()
				};
			}
			var aTableMockData = [];
			OverlayRegistry.getOverlays().forEach(function(oOverlay) {
				if (!oOverlay.isA("sap.ui.dt.AggregationOverlay")) {
					aTableMockData.push(mockTableEntity(oOverlay));
				}
			});
			function onCollectMessage(oEvent) {
				if (
					oEvent.data.id === "ui5FlexibilitySupport.submodules.overlayInfo"
					&& oEvent.data.type === "overlayInfoTableData"
				) {
					var aCollectedTableData = oEvent.data.content;
					assert.strictEqual(aCollectedTableData.length, aTableMockData.length, "correct number of overlays is collected");
					for (var iIndex = 0; iIndex < aCollectedTableData.length; iIndex++) {
						assert.strictEqual(aCollectedTableData[iIndex].id, aTableMockData[iIndex].id, "the entry number " + (iIndex + 1) + " has the correct id");
						assert.strictEqual(aCollectedTableData[iIndex].elementId, aTableMockData[iIndex].elementId, "the entry number " + (iIndex + 1) + " has the correct elementId");
						assert.strictEqual(aCollectedTableData[iIndex].visible, aTableMockData[iIndex].visible, "the entry number " + (iIndex + 1) + " has the correct visible status");
					}
					window.removeEventListener("message", onCollectMessage);
					fnDone();
				}
			}

			window.postMessage({
				id: "ui5FlexibilitySupport.submodules.overlayInfo",
				type: "collectOverlayTableData",
				content: {}
			});

			window.addEventListener("message", onCollectMessage.bind(this));
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});