/* global QUnit */

sap.ui.define([
	"sap/ui/base/DesignTime",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/core/Component",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/Util",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/Layer",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/rta/command/AddXMLAtExtensionPoint",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/rta/command/CompositeCommand",
	"sap/ui/rta/command/ManifestCommand",
	"sap/ui/rta/plugin/AddXMLAtExtensionPoint",
	"sap/ui/thirdparty/sinon-4"
], function(
	DesignTimeConfig,
	XMLView,
	Component,
	DesignTime,
	OverlayRegistry,
	Util,
	ManifestUtils,
	Layer,
	nextUIUpdate,
	AddXMLAtExtensionPointCommand,
	CommandFactory,
	CompositeCommand,
	ManifestCommand,
	AddXMLAtExtensionPointPlugin,
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
				'<core:ExtensionPoint name="ExtensionPoint2">' +
					'<Label id="ep2-label1" text="Extension point label1 - default content" />' +
					'<Label id="ep2-label2" text="Extension point label2 - default content" />' +
				"</core:ExtensionPoint>" +
			"</content>" +
		"</Panel>" +
		"<Panel>" +
			"<content>" +
				'<core:ExtensionPoint name="ExtensionPoint3" />' +
			"</content>" +
		"</Panel>" +
		'<Panel id="invisiblePanel" width="0" height="0">' +
			"<content>" +
				'<core:ExtensionPoint name="ExtensionPoint4" />' +
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

	async function createBeforeEach(sViewId) {
		this.oComponent = await createComponent();
		this.oXmlView = await createAsyncView(sViewId, this.oComponent);
		[this.oPanel, this.oPanelWithoutId, this.oInvisiblePanel] = this.oXmlView.getContent();
		[, this.oLabel] = this.oPanel.getContent();
		this.oXmlView.placeAt("qunit-fixture");
		await nextUIUpdate();

		this.oCommandFactory = new CommandFactory({
			flexSettings: {
				layer: Layer.VENDOR
			}
		});
		this.oAddXmlAtExtensionPointPlugin = new AddXMLAtExtensionPointPlugin({
			commandFactory: this.oCommandFactory,
			fragmentHandler: this.oFragmentHandlerStub
		});

		this.oDesignTime = new DesignTime({
			rootElements: this.oXmlView,
			plugins: [this.oAddXmlAtExtensionPointPlugin]
		});
		await Util.waitForSynced(this.oDesignTime)();

		this.oPanelOverlay = OverlayRegistry.getOverlay(this.oPanel);
		this.oPanelWithoutIdOverlay = OverlayRegistry.getOverlay(this.oPanelWithoutId);
		this.oInvisiblePanelOverlay = OverlayRegistry.getOverlay(this.oInvisiblePanel);
		this.oLabelOverlay = OverlayRegistry.getOverlay(this.oLabel);
	}

	QUnit.module("Given a view with an unstable ID", {
		beforeEach() {
			sandbox.stub(DesignTimeConfig, "isDesignModeEnabled").returns(true);
			sandbox.stub(ManifestUtils, "isFlexExtensionPointHandlingEnabled").returns(true);
			return createBeforeEach.call(this, undefined);
		},
		afterEach() {
			this.oDesignTime.destroy();
			this.oComponent.destroy();
			this.oXmlView.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when the plugins is called with an overlay containing extension points", async function(assert) {
			assert.strictEqual(
				this.oAddXmlAtExtensionPointPlugin.isAvailable([this.oPanelOverlay]),
				true,
				"isAvailable is called and returns true"
			);
			assert.strictEqual(
				this.oAddXmlAtExtensionPointPlugin.isEnabled([this.oPanelOverlay]),
				false,
				"isEnabled is called and returns false"
			);
			const bEditable = await this.oAddXmlAtExtensionPointPlugin._isEditable(this.oPanelOverlay);
			assert.strictEqual(bEditable, false, "then the overlay is not editable");
		});
	});

	QUnit.module("Given an xmlView with extensionPoints and AddXMLAtExtensionPoint plugin without fragment handler function are created "
	+ "and the DesignTime is started ", {
		beforeEach() {
			sandbox.stub(DesignTimeConfig, "isDesignModeEnabled").returns(true);
			sandbox.stub(ManifestUtils, "isFlexExtensionPointHandlingEnabled").returns(true);
			return createBeforeEach.call(this, "myView");
		},
		afterEach() {
			this.oDesignTime.destroy();
			this.oComponent.destroy();
			this.oXmlView.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when no overlay is given", function(assert) {
			assert.strictEqual(this.oAddXmlAtExtensionPointPlugin.isEnabled([]), false, "isEnabled is called and returns false");
		});

		QUnit.test("when an overlay without extension points assigned is given", function(assert) {
			assert.strictEqual(
				this.oAddXmlAtExtensionPointPlugin.isAvailable([this.oLabelOverlay]),
				false,
				"isAvailable is called and returns false"
			);
			assert.strictEqual(
				this.oAddXmlAtExtensionPointPlugin.isEnabled([this.oLabelOverlay]),
				false,
				"isEnabled is called and returns false"
			);
			return this.oAddXmlAtExtensionPointPlugin._isEditable(this.oLabelOverlay)
			.then(function(bEditable) {
				assert.strictEqual(bEditable, false, "then the overlay is not editable");
			});
		});

		QUnit.test("when an overlay with extension points available is given", function(assert) {
			assert.strictEqual(
				this.oAddXmlAtExtensionPointPlugin.isAvailable([this.oPanelOverlay]),
				true,
				"isAvailable is called and returns true"
			);
			assert.strictEqual(
				this.oAddXmlAtExtensionPointPlugin.isEnabled([this.oPanelOverlay]),
				true,
				"isEnabled is called and returns true"
			);
			return this.oAddXmlAtExtensionPointPlugin._isEditable(this.oPanelOverlay)
			.then(function(bEditable) {
				assert.strictEqual(bEditable, true, "then the overlay is editable");
			});
		});

		QUnit.test("when an invisible overlay with extension points available is given", function(assert) {
			assert.strictEqual(
				this.oAddXmlAtExtensionPointPlugin.isAvailable([this.oInvisiblePanelOverlay]),
				true,
				"isAvailable is called and returns true"
			);
			assert.strictEqual(
				this.oAddXmlAtExtensionPointPlugin.isEnabled([this.oInvisiblePanelOverlay]),
				true,
				"isEnabled is called and returns true"
			);
			assert.notOk(
				this.oInvisiblePanelOverlay.getEditableByPlugins()["sap.ui.rta.plugin.AddXMLAtExtensionPoint"],
				"then overlay is not marked as editable for addXmlAtExtensionPoint action"
			);
		});

		QUnit.test("when an overlay with extension points but without stable ID available is given", function(assert) {
			assert.strictEqual(
				this.oAddXmlAtExtensionPointPlugin.isAvailable([this.oPanelWithoutIdOverlay]),
				true,
				"isAvailable is called and returns true"
			);
			assert.strictEqual(
				this.oAddXmlAtExtensionPointPlugin.isEnabled([this.oPanelWithoutIdOverlay]),
				true,
				"isEnabled is called and returns true"
			);
			return this.oAddXmlAtExtensionPointPlugin._isEditable(this.oPanelWithoutIdOverlay)
			.then(function(bEditable) {
				assert.strictEqual(bEditable, true, "then the overlay is editable");
			});
		});

		QUnit.test("when getMenuItem is called", async function(assert) {
			const aMenuItems = await this.oAddXmlAtExtensionPointPlugin.getMenuItems([this.oPanelOverlay]);
			assert.strictEqual(
				aMenuItems[0].id,
				"CTX_ADDXML_AT_EXTENSIONPOINT",
				"'getMenuItems' returns the context menu item for the plugin with the correct id"
			);
			assert.strictEqual(aMenuItems[0].rank, 105, "'getMenuItems' returns the context menu item with the correct rank");
			assert.strictEqual(aMenuItems[0].icon, "sap-icon://add-equipment", "'getMenuItems' returns the context menu item with the correct icon");
		});

		QUnit.test("when handler function is called without valid fragmentHandler function defined", function(assert) {
			return this.oAddXmlAtExtensionPointPlugin.handler([this.oPanelOverlay], {})
			.then(function() {
				assert.notOk(true, "then this should never be called");
			})
			.catch(function(oError) {
				assert.ok(
					oError.message.indexOf("Fragment handler function is not available in the handler") > -1,
					"then handler rejects with the correct exception message"
				);
			});
		});
	});

	QUnit.module("Given an xmlView with extensionPoints and AddXMLAtExtensionPoint plugin with initial fragment handler function is "
	+ "created and the DesignTime is started ", {
		beforeEach() {
			sandbox.stub(DesignTimeConfig, "isDesignModeEnabled").returns(true);
			this.sInitialFragmentPath = "sap/ui/.../fragment/fragmentName";
			this.oFragmentHandlerStub = sandbox.stub().resolves({
				extensionPointName: "EP1",
				fragmentPath: this.sInitialFragmentPath,
				fragment: "fragment/fragmentName"
			});
			return createBeforeEach.call(this, "myView");
		},
		afterEach() {
			this.oDesignTime.destroy();
			this.oComponent.destroy();
			this.oXmlView.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when handler is called for the view overlay, without fragmentHandler function in the propertyBag defined", function(assert) {
			const fnDone = assert.async(2);
			const oPropertyBag = {};
			this.oAddXmlAtExtensionPointPlugin.attachElementModified(function(oEvent) {
				const oCommand = oEvent.getParameters().command;
				assert.ok(
					oCommand instanceof CompositeCommand,
					"then the plugin fired the elementModified event with the CompositeCommand"
				);
				assert.ok(
					oCommand.getCommands()[0] instanceof AddXMLAtExtensionPointCommand,
					"then the CompositeCommand contains AddXMLAtExtensionPointCommand"
				);
				assert.ok(
					oCommand.getCommands()[1] instanceof ManifestCommand,
					"then the CompositeCommand contains ManifestCommand"
				);
				assert.strictEqual(
					oCommand.getCommands()[0].getFragmentPath(),
					this.sInitialFragmentPath,
					"then the returned command contains the fragment path from the initial fragmentHandler function"
				);
				const mManifestParameters = { flexExtensionPointEnabled: true };
				assert.deepEqual(
					oCommand.getCommands()[1].getParameters(),
					mManifestParameters,
					"then the CompositeCommand contains ManifestCommand"
				);
				fnDone();
			}.bind(this));
			const oViewOverlay = OverlayRegistry.getOverlay(this.oXmlView);
			this.oAddXmlAtExtensionPointPlugin.handler([oViewOverlay], oPropertyBag)
			.then(function() {
				assert.strictEqual(this.oFragmentHandlerStub.callCount, 1,
					"then the fragment handler function is called once");
				assert.strictEqual(this.oFragmentHandlerStub.firstCall.args[0], oViewOverlay,
					"then the fragment handler function is called with panel overlay as first parameter");
				const aPassedExtensionPointObjects = this.oFragmentHandlerStub.firstCall.args[1];
				assert.ok(Array.isArray(aPassedExtensionPointObjects),
					"then the fragment handler function is called with array of ExtensionPointInformation as second parameter");
				assert.deepEqual(aPassedExtensionPointObjects.map(function(oExtensionPoint) { return oExtensionPoint.name; }),
					["ExtensionPoint1", "ExtensionPoint2", "ExtensionPoint3", "ExtensionPoint4"],
					"then the expected extension points for the view are returned");
				fnDone();
			}.bind(this));
		});

		QUnit.test("when handler is called for the panel overlay, with fragmentHandler function in the propertyBag defined", function(assert) {
			const fnDone = assert.async(2);
			const sSecondFragmentPath = "sap/ui/.../fragment/SecondFragment";
			const oSecondFragmentHandlerStub = sandbox.stub().resolves({
				extensionPointName: "EP2",
				fragmentPath: sSecondFragmentPath,
				fragment: "fragment/SecondFragment"
			});
			const oPropertyBag = {
				fragmentHandler: oSecondFragmentHandlerStub
			};
			this.oAddXmlAtExtensionPointPlugin.attachElementModified(function(oEvent) {
				const oCommand = oEvent.getParameters().command;
				assert.ok(
					oCommand instanceof CompositeCommand,
					"then the plugin fired the elementModified event with the CompositeCommand"
				);
				assert.ok(
					oCommand.getCommands()[0] instanceof AddXMLAtExtensionPointCommand,
					"then the CompositeCommand contains AddXMLAtExtensionPointCommand"
				);
				assert.ok(
					oCommand.getCommands()[1] instanceof ManifestCommand,
					"then the CompositeCommand contains ManifestCommand"
				);
				assert.strictEqual(
					oCommand.getCommands()[0].getFragmentPath(),
					sSecondFragmentPath,
					"then the returned command contains the fragment path from the passed as property fragmentHandler function"
				);
				const mManifestParameters = { flexExtensionPointEnabled: true };
				assert.deepEqual(
					oCommand.getCommands()[1].getParameters(),
					mManifestParameters,
					"then the CompositeCommand contains ManifestCommand"
				);
				fnDone();
			});
			this.oAddXmlAtExtensionPointPlugin.handler([this.oPanelOverlay], oPropertyBag)
			.then(function() {
				assert.strictEqual(oSecondFragmentHandlerStub.callCount, 1, "then the fragment handler function is called once");
				assert.strictEqual(
					oSecondFragmentHandlerStub.firstCall.args[0],
					this.oPanelOverlay,
					"then the fragment handler function is called with panel overlay as first parameter"
				);
				assert.ok(
					Array.isArray(oSecondFragmentHandlerStub.firstCall.args[1]),
					"then the fragment handler function is called with array of ExtensionPointInformation as second parameter"
				);
				fnDone();
			}.bind(this));
		});

		QUnit.test("when handler is called with fragmentHandler function returning a map but no extensionPoint is selected", function(assert) {
			const oBrokenFragmentHandlerStub = sandbox.stub().resolves({
				fragmentPath: "sap/ui/.../fragment/SecondFragment",
				fragment: "fragment/SecondFragment"
			});
			const oPropertyBag = {
				fragmentHandler: oBrokenFragmentHandlerStub
			};
			this.oAddXmlAtExtensionPointPlugin.attachElementModified(function() {
				assert.notOk(true, "then elementModified event shouldn't be fired");
			});
			return this.oAddXmlAtExtensionPointPlugin.handler([this.oPanelOverlay], oPropertyBag)
			.catch(function(oError) {
				assert.strictEqual(oBrokenFragmentHandlerStub.callCount, 1, "then the fragment handler function is called once");
				assert.ok(oError.message.indexOf("Extension point name is not selected!") > -1, "then plugin handler rejects an error");
			});
		});

		QUnit.test("when handler is called with fragmentHandler function returning map without valid fragmentPath", function(assert) {
			const oBrokenFragmentHandlerStub = sandbox.stub().resolves({
				extensionPointName: "EP2",
				fragmentPath: ["invalidValue"],
				fragment: "fragment/SecondFragment"
			});
			const oPropertyBag = {
				fragmentHandler: oBrokenFragmentHandlerStub
			};
			this.oAddXmlAtExtensionPointPlugin.attachElementModified(function() {
				assert.notOk(true, "then elementModified event shouldn't be fired");
			});
			return this.oAddXmlAtExtensionPointPlugin.handler([this.oPanelOverlay], oPropertyBag)
			.catch(function(oError) {
				assert.strictEqual(oBrokenFragmentHandlerStub.callCount, 1, "then the fragment handler function is called once");
				assert.ok(oError.message.indexOf("Fragment path is not available") > -1, "then plugin handler rejects an error");
			});
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});