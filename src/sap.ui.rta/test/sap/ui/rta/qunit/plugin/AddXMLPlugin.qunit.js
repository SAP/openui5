/* global QUnit */
sap.ui.define([
	"sap/ui/base/DesignTime",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/core/Component",
	"sap/ui/core/UIComponent",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/Util",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/test/utils/nextUIUpdate",
	"sap/ui/rta/command/AddXML",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/rta/plugin/AddXMLPlugin",
	"sap/ui/rta/Utils",
	"sap/ui/thirdparty/sinon-4"
], function(
	DesignTimeConfig,
	XMLView,
	Component,
	UIComponent,
	DesignTime,
	OverlayRegistry,
	Util,
	Layer,
	FlUtils,
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
			this.oIsDesignModeEnabledStub = sandbox.stub(DesignTimeConfig, "isDesignModeEnabled").returns(true);
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
		QUnit.test("When everything is enabled", function(assert) {
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

		QUnit.test("When the system is an S4HanaCloud system and the control is in a reuse component", function(assert) {
			sandbox.stub(RtaUtils, "isS4HanaCloud").returns(true);

			const oParentComponent = new (UIComponent.extend("component", {
				metadata: {
					manifest: {
						"sap.ui5": {
							componentUsages: {
								reuseComponent: {
									name: "testComponent"
								}
							}
						}
					}
				}
			}))();

			sandbox.stub(FlUtils, "getAppComponentForControl")
			.callThrough()
			.withArgs(this.oComponent)
			.returns(oParentComponent);

			sandbox.stub(this.oComponent, "getManifest")
			.returns({
				"sap.app": {
					id: "testComponent"
				}
			});

			return this.oAddXmlPlugin._isEditable(this.oPanelOverlay).then(function(bEditable) {
				assert.notOk(bEditable, "then the Overlay is not editable");
			});
		});

		QUnit.test("When the Element has no Stable Id", function(assert) {
			sandbox.stub(this.oAddXmlPlugin, "hasStableId").returns(false);
			return this.oAddXmlPlugin._isEditable(this.oPanelOverlay).then(function(bEditable) {
				assert.notOk(bEditable, "then the Overlay is not editable");
			});
		});

		QUnit.test("When the Plugin has no changeHandler", function(assert) {
			this.oHasChangeHandlerStub.reset();
			this.oHasChangeHandlerStub.resolves(false);
			return this.oAddXmlPlugin._isEditable(this.oPanelOverlay).then(function(bEditable) {
				assert.notOk(bEditable, "then the Overlay is not editable");
			});
		});

		QUnit.test("isEnabled function", function(assert) {
			const oAddXmlPlugin = new AddXMLPlugin();

			// Test with one overlay
			const aElementOverlays = [{}];
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
});