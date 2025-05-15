/* global QUnit */
sap.ui.define([
	"sap/ui/core/mvc/XMLView",
	"sap/ui/core/Component",
	"sap/ui/core/Lib",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/Util",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/test/utils/nextUIUpdate",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/rta/command/ExtendControllerCommand",
	"sap/ui/rta/plugin/ExtendControllerPlugin",
	"sap/ui/thirdparty/sinon-4"
], function(
	XMLView,
	Component,
	Lib,
	DesignTime,
	OverlayRegistry,
	Util,
	Layer,
	Utils,
	nextUIUpdate,
	CommandFactory,
	ExtendControllerCommand,
	ExtendControllerPlugin,
	sinon
) {
	"use strict";

	const sandbox = sinon.createSandbox();

	const sXmlString =
	'<mvc:View xmlns:mvc="sap.ui.core.mvc"  xmlns:core="sap.ui.core" xmlns="sap.m">' +
		'<Panel id="panel">' +
			"<content>" +
				'<core:ExtensionPoint name="ExtensionPoint1" />' +
				'<Label id="label2" text="Panel with stable id" />' +
			"</content>" +
		"</Panel>" +
	"</mvc:View>";

	function createComponent() {
		return Component.create({
			name: "testComponent",
			id: "testComponent",
			metadata: {
				manifest: "json"
			}
		});
	}

	function createAsyncView(sViewName, oComponent) {
		return oComponent.runAsOwner(function() {
			return XMLView.create({
				id: sViewName,
				definition: sXmlString,
				async: true
			});
		});
	}

	async function beforeEachSetup(sViewId) {
		this.oComponent = await createComponent();
		this.oXmlView = await createAsyncView(sViewId, this.oComponent);
		[this.oPanel] = this.oXmlView.getContent();
		this.oXmlView.placeAt("qunit-fixture");
		await nextUIUpdate();

		this.oControllerHandlerStub = sandbox.stub().resolves({});
		sandbox.stub(this.oXmlView, "getControllerModuleName").returns("test.controller.TestController");

		this.oCommandFactory = new CommandFactory({
			flexSettings: {
				layer: Layer.CUSTOMER_BASE,
				namespace: "test.namespace"
			}
		});

		this.oExtendControllerPlugin = new ExtendControllerPlugin({
			handlerFunction: this.oControllerHandlerStub,
			commandFactory: this.oCommandFactory
		});

		this.oHasChangeHandlerStub = sandbox.stub(this.oExtendControllerPlugin, "hasChangeHandler").resolves(true);

		this.oDesignTime = new DesignTime({
			rootElements: this.oXmlView,
			plugins: [this.oExtendControllerPlugin]
		});
		await Util.waitForSynced(this.oDesignTime)();

		this.oPanelOverlay = OverlayRegistry.getOverlay(this.oPanel);
	}

	QUnit.module("ExtendControllerPlugin", {
		beforeEach() {
			return beforeEachSetup.call(this, "myView");
		},
		afterEach() {
			this.oDesignTime.destroy();
			this.oComponent.destroy();
			this.oXmlView.destroy();
			this.oExtendControllerPlugin.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("isEditable check - positive case", function(assert) {
			return this.oExtendControllerPlugin._isEditable(this.oPanelOverlay).then(function(bEditable) {
				assert.ok(bEditable, "then the Overlay is editable");
			});
		});

		QUnit.test("When the Action is not defined in the designtimeMetadata", function(assert) {
			sandbox.stub(this.oExtendControllerPlugin, "getAction").returns(undefined);
			return this.oExtendControllerPlugin._isEditable(this.oPanelOverlay).then(function(bEditable) {
				assert.ok(bEditable, "then the Overlay is editable");
			});
		});

		QUnit.test("When the system is an S4HanaCloud system and the control is in a reuse component", async function(assert) {
			sandbox.stub(this.oExtendControllerPlugin, "isInReuseComponentOnS4HanaCloud").returns(true);

			assert.notOk(this.oExtendControllerPlugin.isEnabled([this.oPanelOverlay]), "then the action is not enabled");
			const aMenuItems = await this.oExtendControllerPlugin.getMenuItems([this.oPanelOverlay]);
			const sFoundText = Lib.getResourceBundleFor("sap.ui.rta").getText("CTX_DISABLED_REUSE");
			assert.notStrictEqual(sFoundText, "CTX_DISABLED_REUSE", "then the text is found in the resource bundle");
			assert.strictEqual(
				aMenuItems[0].text,
				`${Lib.getResourceBundleFor("sap.ui.rta").getText("CTX_EXTEND_CONTROLLER")} (${sFoundText})`,
				"then the menu item has the correct text"
			);
		});

		QUnit.test("When the control is not in an async view", async function(assert) {
			sandbox.stub(Utils, "getViewForControl").returns({});

			assert.notOk(this.oExtendControllerPlugin.isEnabled([this.oPanelOverlay]), "then the action is not enabled");
			const aMenuItems = await this.oExtendControllerPlugin.getMenuItems([this.oPanelOverlay]);
			const sFoundText = Lib.getResourceBundleFor("sap.ui.rta").getText("CTX_DISABLED_NOT_ASYNC");
			assert.notStrictEqual(sFoundText, "CTX_DISABLED_NOT_ASYNC", "then the text is found in the resource bundle");
			assert.strictEqual(
				aMenuItems[0].text,
				`${Lib.getResourceBundleFor("sap.ui.rta").getText("CTX_EXTEND_CONTROLLER")} (${sFoundText})`,
				"then the menu item has the correct text"
			);
		});

		QUnit.test("isEnabled function when not in reusable component on S4HanaCloud", function(assert) {
			const oExtendControllerPlugin = new ExtendControllerPlugin();

			sandbox.stub(this.oExtendControllerPlugin, "isInReuseComponentOnS4HanaCloud").returns(false);
			sandbox.stub(Utils, "getViewForControl").returns({ oAsyncState: { promise: Promise.resolve() } });

			// Test with one overlay
			const aElementOverlays = [{ getElement: () => {} }];
			assert.strictEqual(
				oExtendControllerPlugin.isEnabled(aElementOverlays),
				true,
				"then isEnabled returns true when there is one overlay"
			);

			// Test with no overlays
			const aNoOverlays = [];
			assert.strictEqual(
				oExtendControllerPlugin.isEnabled(aNoOverlays),
				false,
				"then isEnabled returns false when there are no overlays"
			);

			// Test with multiple overlays
			const aMultipleOverlays = [{}, {}];
			assert.strictEqual(
				oExtendControllerPlugin.isEnabled(aMultipleOverlays),
				false,
				"then isEnabled returns false when there are multiple overlays"
			);
		});

		QUnit.test("When the handler function is called and the fragment handler and the action is available", function(assert) {
			const fnDone = assert.async();

			const mPropertyBag = {
				handlerFunction: (...aArgs) => {
					assert.deepEqual(
						aArgs[0],
						this.oPanelOverlay,
						"then the overlay is passed to the fragment handler"
					);
					return {
						viewId: "myView",
						codeRef: "TestCodeRef"
					};
				}
			};

			this.oExtendControllerPlugin.attachEventOnce("elementModified", function(oEvent) {
				const oCommand = oEvent.getParameter("command");
				assert.ok(oCommand instanceof ExtendControllerCommand, "then the command is created");
				assert.strictEqual(oCommand.getSelector().id, "myView--panel", "then the viewId is set correctly");
				assert.strictEqual(
					oCommand.getPreparedChange().mProperties.content.codeRef,
					"TestCodeRef",
					"then the codeRef is set correctly"
				);
				assert.strictEqual(
					oCommand.getPreparedChange().mProperties.flexObjectMetadata.moduleName,
					"testComponent/changes/TestCodeRef",
					"then the moduleName is set correctly"
				);

				fnDone();
			});

			this.oExtendControllerPlugin.handler([this.oPanelOverlay], mPropertyBag);
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});