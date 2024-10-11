/* global QUnit */

sap.ui.define([
	"sap/m/Button",
	"sap/m/Page",
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/Element",
	"sap/ui/dt/ElementOverlay",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/qunit/utils/nextUIUpdate",
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
	Element,
	ElementOverlay,
	OverlayRegistry,
	JsControlTreeModifier,
	ChangesWriteAPI,
	PersistenceWriteAPI,
	nextUIUpdate,
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
		async before() {
			QUnit.config.fixture = null;
			this.oButton1 = new Button("button1");
			this.oButton2 = new Button("button2");
			this.oButton3 = new Button("button3");
			this.oComponent = RtaQunitUtils.createAndStubAppComponent(
				sandbox,
				"fixture.application",
				undefined,
				new Page("page", {
					content: [this.oButton1, this.oButton2, this.oButton3]
				})
			);
			this.oPage = this.oComponent.getRootControl();

			this.oComponentContainer = new ComponentContainer("CompCont", {
				component: this.oComponent
			});
			this.oComponentContainer.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		beforeEach() {
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
		afterEach() {
			this.oRta.destroy();
			sandbox.restore();
			delete window.ui5flex$0;
			delete window.ui5flex$temp;
		},
		after() {
			QUnit.config.fixture = "";
			this.oComponentContainer.destroy();
		}
	}, function() {
		QUnit.test("when an 'overlayInfo' event is triggered", function(assert) {
			var fnDone = assert.async();
			// To prevent changes in the control's designtime affecting this test, we return
			// these three plugins and check for the number of plugins in the response
			sandbox.stub(ElementOverlay.prototype, "getEditableByPlugins").returns({
				"sap.ui.rta.plugin.Rename": true,
				"sap.ui.rta.plugin.Remove": true,
				"sap.ui.rta.plugin.Combine": true,
				someOtherPlugin: false
			});
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
				element: Element.getElementById("button1"),
				modifier: JsControlTreeModifier,
				layer: "CUSTOMER"
			}).then(function(oChangeHandler) {
				oConsoleStub
				.callThrough()
				.withArgs(sinon.match(function(oLoggedObject) {return oLoggedObject.changeHandler === oChangeHandler;}))
				.callsFake(function(oLoggedObject) {
					assert.ok(true, "then the change handler is printed to console");
					assert.ok(oLoggedObject.savedAs.includes("ui5flex$"), "and a temporary variable is saved");
					assert.ok(oLoggedObject.description.includes("ChangeHandler"), "and the correct Control Identification is set");
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
			.withArgs(sinon.match(function(oLoggedObject) {return oLoggedObject.metaData === oButtonDesigntimeMetadata;}))
			.callsFake(function(oLoggedObject) {
				assert.ok(true, "then the design time metadata is printed to console");
				assert.ok(oLoggedObject.savedAs.includes("ui5flex$"), "and a temporary variable is saved");
				assert.ok(oLoggedObject.description.includes("DesignTimeMetaData"), "and the correct Control Identification is set");
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

		QUnit.test("when an 'changeOverlaySelection' event is triggered on multiple selection", function(assert) {
			var fnDone = assert.async();
			// We have to fake a Multiselection of Buttons using Selectionmanager
			const oSelectionManager = this.oRta._oDesignTime.getSelectionManager();
			oSelectionManager.add(OverlayRegistry.getOverlay("button1"));
			oSelectionManager.add(OverlayRegistry.getOverlay("button2"));
			assert.ok(OverlayRegistry.getOverlay("button1").getSelected(), "Initially, button1 is selected");
			assert.ok(OverlayRegistry.getOverlay("button2").getSelected(), "Initially, button2 is selected");
			assert.ok(this.oRta.getSelection().length = 2, "Initially, two buttons are selected");
			function onMessage(oEvent) {
				if (
					oEvent.data.id === "ui5FlexibilitySupport.submodules.overlayInfo"
					&& oEvent.data.type === "changeOverlaySelection"
				) {
					assert.notOk(OverlayRegistry.getOverlay("button1").getSelected(), "After processing button1 is not selected");
					assert.notOk(OverlayRegistry.getOverlay("button2").getSelected(), "After processing button2 is not selected");
					assert.ok(this.oRta.getSelection().length = 1, "After processing, only one overlay is selected");
					assert.strictEqual(this.oRta.getSelection()[0],
						OverlayRegistry.getOverlay("button3"), "After processing the correct Overlay is selected");
					fnDone();
				}
			}

			window.postMessage({
				id: "ui5FlexibilitySupport.submodules.overlayInfo",
				type: "changeOverlaySelection",
				content: {
					overlayId: OverlayRegistry.getOverlay("button3").getId()
				}
			});

			window.addEventListener("message", onMessage.bind(this), { once: true });
		});

		QUnit.test("when contextmenu is closed", async function(assert) {
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
			await nextUIUpdate();
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
						assert.strictEqual(aCollectedTableData[iIndex].id, aTableMockData[iIndex].id, `the entry number ${iIndex + 1} has the correct id`);
						assert.strictEqual(aCollectedTableData[iIndex].elementId, aTableMockData[iIndex].elementId, `the entry number ${iIndex + 1} has the correct elementId`);
						assert.strictEqual(aCollectedTableData[iIndex].visible, aTableMockData[iIndex].visible, `the entry number ${iIndex + 1} has the correct visible status`);
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