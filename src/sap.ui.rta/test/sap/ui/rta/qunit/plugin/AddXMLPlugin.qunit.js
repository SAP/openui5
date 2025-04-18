/* global QUnit */
sap.ui.define([
	"sap/ui/core/mvc/XMLView",
	"sap/ui/core/Component",
	"sap/ui/core/Lib",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/Util",
	"sap/ui/fl/Layer",
	"sap/ui/test/utils/nextUIUpdate",
	"sap/ui/rta/command/AddXML",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/rta/plugin/AddXMLPlugin",
	"sap/ui/rta/Utils",
	"sap/ui/thirdparty/sinon-4"
], function(
	XMLView,
	Component,
	Lib,
	DesignTime,
	OverlayRegistry,
	Util,
	Layer,
	nextUIUpdate,
	AddXMLCommand,
	CommandFactory,
	AddXMLPlugin,
	RtaUtils,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	var sXmlString =
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

		this.oFragmentHandlerStub = sandbox.stub().resolves({});

		this.oCommandFactory = new CommandFactory({
			flexSettings: {
				layer: Layer.CUSTOMER_BASE
			}
		});

		this.oAddXmlPlugin = new AddXMLPlugin({
			commandFactory: this.oCommandFactory,
			fragmentHandler: this.oFragmentHandlerStub
		});

		this.oHasChangeHandlerStub = sandbox.stub(this.oAddXmlPlugin, "hasChangeHandler").resolves(true);

		this.oDesignTime = new DesignTime({
			rootElements: this.oXmlView,
			plugins: [this.oAddXmlPlugin]
		});
		await Util.waitForSynced(this.oDesignTime)();

		this.oPanelOverlay = OverlayRegistry.getOverlay(this.oPanel);
	}

	QUnit.module("AddXMLPlugin", {
		beforeEach() {
			return beforeEachSetup.call(this, "myView");
		},
		afterEach() {
			this.oDesignTime.destroy();
			this.oComponent.destroy();
			this.oXmlView.destroy();
			this.oAddXmlPlugin.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("Editable check - positive case", function(assert) {
			return this.oAddXmlPlugin._isEditable(this.oPanelOverlay).then(function(bEditable) {
				assert.ok(bEditable, "then the Overlay is editable");
			});
		});

		QUnit.test("When the Action is set to null", function(assert) {
			sandbox.stub(this.oAddXmlPlugin, "getAction").returns(null);
			return this.oAddXmlPlugin._isEditable(this.oPanelOverlay).then(function(bEditable) {
				assert.notOk(bEditable, "then the Overlay is not editable");
			});
		});

		QUnit.test("When the Action is not defined in the designtimeMetadata", function(assert) {
			sandbox.stub(this.oAddXmlPlugin, "getAction").returns(undefined);
			return this.oAddXmlPlugin._isEditable(this.oPanelOverlay).then(function(bEditable) {
				assert.ok(bEditable, "then the Overlay is editable");
			});
		});

		QUnit.test("When the system is an S4HanaCloud system and the control is in a reuse component", async function(assert) {
			sandbox.stub(this.oAddXmlPlugin, "isInReuseComponentOnS4HanaCloud").returns(true);

			assert.notOk(this.oAddXmlPlugin.isEnabled(this.oPanelOverlay), "then the action is not enabled");
			const aMenuItems = await this.oAddXmlPlugin.getMenuItems([this.oPanelOverlay]);
			assert.strictEqual(
				aMenuItems[0].text,
				`${Lib.getResourceBundleFor("sap.ui.rta").getText("CTX_ADDXML")} (${Lib.getResourceBundleFor("sap.ui.rta").getText("CTX_DISABLED_REUSE")})`,
				"then the menu item has the correct text"
			);
		});

		QUnit.test("When the Element has no Stable Id", async function(assert) {
			sandbox.stub(this.oAddXmlPlugin, "hasStableId").returns(false);
			assert.notOk(this.oAddXmlPlugin.isEnabled(this.oPanelOverlay), "then the action is not enabled");
			const aMenuItems = await this.oAddXmlPlugin.getMenuItems([this.oPanelOverlay]);
			assert.strictEqual(
				aMenuItems[0].text,
				`${Lib.getResourceBundleFor("sap.ui.rta").getText("CTX_ADDXML")} (${Lib.getResourceBundleFor("sap.ui.rta").getText("CTX_DISABLED_NO_STABLE_ID")})`,
				"then the menu item has the correct text"
			);
		});

		QUnit.test("When the Plugin has no changeHandler", function(assert) {
			this.oHasChangeHandlerStub.reset();
			this.oHasChangeHandlerStub.resolves(false);
			return this.oAddXmlPlugin._isEditable(this.oPanelOverlay).then(function(bEditable) {
				assert.notOk(bEditable, "then the Overlay is not editable");
			});
		});

		QUnit.test("isEnabled function when not in reusable component on S4HanaCloud and with stable ID", function(assert) {
			const oAddXmlPlugin = new AddXMLPlugin();

			sandbox.stub(RtaUtils, "isS4HanaCloud").returns(false);
			sandbox.stub(oAddXmlPlugin, "hasStableId").returns(true);

			// Test with one overlay
			const aElementOverlays = [{ getElement: () => {} }];
			assert.strictEqual(oAddXmlPlugin.isEnabled(aElementOverlays), true, "then isEnabled returns true when there is one overlay");

			// Test with no overlays
			const aNoOverlays = [];
			assert.strictEqual(oAddXmlPlugin.isEnabled(aNoOverlays), false, "then isEnabled returns false when there are no overlays");

			// Test with multiple overlays
			const aMultipleOverlays = [{}, {}];
			assert.strictEqual(
				oAddXmlPlugin.isEnabled(aMultipleOverlays),
				false,
				"then isEnabled returns false when there are multiple overlays"
			);
		});

		QUnit.test("When the handler function is called and the fragment is returned successfully", function(assert) {
			const fnDone = assert.async();
			const mPropertyBag = {
				fragmentHandler: () => {
					return {
						fragment: "fragment",
						fragmentPath: "fragmentPath",
						targetAggregation: "content",
						index: 0
					};
				}
			};

			this.oAddXmlPlugin.attachEventOnce("elementModified", function(oEvent) {
				const oCommand = oEvent.getParameter("command");
				assert.ok(oCommand instanceof AddXMLCommand, "then the command is created");
				assert.strictEqual(oCommand.getSelector().id, "myView--panel", "then the selector is set correctly");
				assert.equal(oCommand.getFragment(), "fragment", "then the fragment is set correctly");
				assert.equal(oCommand.getFragmentPath(), "fragmentPath", "then the fragmentPath is set correctly");
				assert.equal(oCommand.getTargetAggregation(), "content", "then the targetAggregation is set correctly");
				assert.equal(oCommand.getIndex(), 0, "then the index is set correctly");
				fnDone();
			});

			this.oAddXmlPlugin.handler([this.oPanelOverlay], mPropertyBag);
		});

		QUnit.test("When the handler function is called and the fragment handler and the action is available", function(assert) {
			sandbox.stub(this.oAddXmlPlugin, "getAction").returns({
				excludedAggregations: ["excludedAggregation"]
			});

			const fnDone = assert.async();

			const mPropertyBag = {
				fragmentHandler: (...aArgs) => {
					assert.deepEqual(
						aArgs[0],
						this.oPanelOverlay,
						"then the overlay is passed to the fragment handler"
					);
					assert.deepEqual(
						aArgs[1],
						["excludedAggregation"],
						"then the excluded aggregations are passed to the fragment handler"
					);
					return {
						fragment: "fragment",
						fragmentPath: "fragmentPath",
						targetAggregation: "content",
						index: 0
					};
				}
			};

			this.oAddXmlPlugin.attachEventOnce("elementModified", function(oEvent) {
				const oCommand = oEvent.getParameter("command");
				assert.ok(oCommand instanceof AddXMLCommand, "then the command is created");
				fnDone();
			});

			this.oAddXmlPlugin.handler([this.oPanelOverlay], mPropertyBag);
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});