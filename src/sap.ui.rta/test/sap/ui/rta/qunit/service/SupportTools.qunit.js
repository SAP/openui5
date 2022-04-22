/* global QUnit*/

sap.ui.define([
	"sap/m/Button",
	"sap/m/Page",
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/Core",
	"sap/ui/core/UIComponent",
	"sap/ui/dt/ElementOverlay",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/fl/changeHandler/JsControlTreeModifier",
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
	UIComponent,
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
		before: function () {
			QUnit.config.fixture = null;
			this.oButton1 = new Button("button1");
			this.oComponent = RtaQunitUtils.createAndStubAppComponent(
				sandbox,
				"fixture.application",
				undefined,
				new Page("page", {
					content: [this.oButton1]
				})
			);
			this.oPage = this.oComponent.getRootControl();

			this.oComponentContainer = new ComponentContainer("CompCont", {
				component: this.oComponent
			});
			this.oComponentContainer.placeAt("qunit-fixture");
			Core.applyChanges();
		},
		beforeEach: function () {
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

			return this.oRta.start().then(function () {
				return this.oRta.getService("supportTools");
			}.bind(this));
		},
		afterEach: function() {
			this.oRta.destroy();
			sandbox.restore();
		},
		after: function () {
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
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});