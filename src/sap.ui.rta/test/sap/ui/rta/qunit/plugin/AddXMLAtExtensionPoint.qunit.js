/* global QUnit */

sap.ui.define([
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/rta/command/AddXMLAtExtensionPoint",
	"sap/ui/rta/command/CompositeCommand",
	"sap/ui/rta/command/AppDescriptorCommand",
	"sap/ui/rta/plugin/AddXMLAtExtensionPoint",
	"sap/ui/fl/Layer",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/apply/_internal/flexState/Loader",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/DesignTime",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/thirdparty/sinon-4"
], function(
	CommandFactory,
	AddXMLAtExtensionPointCommand,
	CompositeCommand,
	AppDescriptorCommand,
	AddXMLAtExtensionPointPlugin,
	Layer,
	ManifestUtils,
	Loader,
	OverlayRegistry,
	DesignTime,
	XMLView,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	var sXmlString =
	'<mvc:View id="testComponent---myView" xmlns:mvc="sap.ui.core.mvc"  xmlns:core="sap.ui.core" xmlns="sap.m">' +
		'<Panel id="panel">' +
			'<content>' +
				'<core:ExtensionPoint name="ExtensionPoint1" />' +
				'<Label id="label2" text="Panel with stable id" />' +
				'<core:ExtensionPoint name="ExtensionPoint2">' +
					'<Label id="ep2-label1" text="Extension point label1 - default content" />' +
					'<Label id="ep2-label2" text="Extension point label2 - default content" />' +
				'</core:ExtensionPoint>' +
			'</content>' +
		'</Panel>' +
		'<Panel>' +
			'<content>' +
				'<core:ExtensionPoint name="ExtensionPoint3" />' +
			'</content>' +
		'</Panel>' +
		'<Panel id="invisiblePanel" width="0" height="0">' +
			'<content>' +
				'<core:ExtensionPoint name="ExtensionPoint4" />' +
			'</content>' +
		'</Panel>' +
	'</mvc:View>';

	function createComponent() {
		return sap.ui.getCore().createComponent({
			name: "testComponent",
			id: "testComponent",
			metadata: {
				manifest: "json"
			}
		});
	}

	function createAsyncView(sViewName, oComponent) {
		return oComponent.runAsOwner(function () {
			return XMLView.create({
				id: sViewName,
				definition: sXmlString,
				async: true
			});
		});
	}

	function createBeforeEach() {
		this.oComponent = createComponent();
		return createAsyncView("myView", this.oComponent)
			.then(function (oXmlView) {
				this.oXmlView = oXmlView;
				this.oPanel = oXmlView.getContent()[0];
				this.oPanelWithoutId = oXmlView.getContent()[1];
				this.oInvisiblePanel = oXmlView.getContent()[2];
				this.oLabel = this.oPanel.getContent()[1];
				oXmlView.placeAt("qunit-fixture");
				sap.ui.getCore().applyChanges();

				this.oCommandFactory = new CommandFactory({
					flexSettings: {
						layer: Layer.VENDOR
					}
				});
				this.oAddXmlAtExtensionPointPlugin = new AddXMLAtExtensionPointPlugin({
					commandFactory: this.oCommandFactory,
					fragmentHandler: this.oFragmentHandlerStub
				});

				return new Promise(function (resolve) {
					this.oDesignTime = new DesignTime({
						rootElements: this.oXmlView,
						plugins: [this.oAddXmlAtExtensionPointPlugin]
					});
					this.oDesignTime.attachEventOnce("synced", function() {
						this.oPanelOverlay = OverlayRegistry.getOverlay(this.oPanel);
						this.oPanelWithoutIdOverlay = OverlayRegistry.getOverlay(this.oPanelWithoutId);
						this.oInvisiblePanelOverlay = OverlayRegistry.getOverlay(this.oInvisiblePanel);
						this.oLabelOverlay = OverlayRegistry.getOverlay(this.oLabel);
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
	}

	QUnit.module("Given an xmlView with extensionPoints and AddXMLAtExtensionPoint plugin without fragment handler function are created and the DesignTime is started ", {
		beforeEach: function() {
			sandbox.stub(sap.ui.getCore().getConfiguration(), "getDesignMode").returns(true);
			sandbox.stub(ManifestUtils, "isFlexExtensionPointHandlingEnabled").returns(true);
			sandbox.stub(Loader, "loadFlexData").resolves({ changes: [] });
			return createBeforeEach.call(this);
		},
		afterEach: function() {
			this.oDesignTime.destroy();
			this.oComponent.destroy();
			this.oXmlView.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when no overlay is given", function(assert) {
			assert.strictEqual(this.oAddXmlAtExtensionPointPlugin.isEnabled([]), false, "isEnabled is called and returns false");
		});

		QUnit.test("when an overlay without extensionpoints assigned is given", function(assert) {
			assert.strictEqual(this.oAddXmlAtExtensionPointPlugin.isAvailable([this.oLabelOverlay]), false, "isAvailable is called and returns false");
			assert.strictEqual(this.oAddXmlAtExtensionPointPlugin.isEnabled([this.oLabelOverlay]), true, "isEnabled is called and returns true");
			return this.oAddXmlAtExtensionPointPlugin._isEditable(this.oLabelOverlay)
				.then(function(bEditable) {
					assert.strictEqual(bEditable, false, "then the overlay is not editable");
				});
		});

		QUnit.test("when an overlay with extensionpoints available is given", function(assert) {
			assert.strictEqual(this.oAddXmlAtExtensionPointPlugin.isAvailable([this.oPanelOverlay]), true, "isAvailable is called and returns true");
			assert.strictEqual(this.oAddXmlAtExtensionPointPlugin.isEnabled([this.oPanelOverlay]), true, "isEnabled is called and returns true");
			return this.oAddXmlAtExtensionPointPlugin._isEditable(this.oPanelOverlay)
				.then(function(bEditable) {
					assert.strictEqual(bEditable, true, "then the overlay is editable");
				});
		});

		QUnit.test("when an invisible overlay with extensionpoints available is given", function(assert) {
			assert.strictEqual(this.oAddXmlAtExtensionPointPlugin.isAvailable([this.oInvisiblePanelOverlay]), true, "isAvailable is called and returns true");
			assert.strictEqual(this.oAddXmlAtExtensionPointPlugin.isEnabled([this.oInvisiblePanelOverlay]), true, "isEnabled is called and returns true");
			var aPluginList = this.oInvisiblePanelOverlay.getEditableByPlugins();
			assert.strictEqual(aPluginList.indexOf("sap.ui.rta.plugin.AddXMLAtExtensionPoint"), -1, "then overlay is not marked as editable for addXmlAtExtensionPoint action");
		});

		QUnit.test("when an overlay with extensionpoints but without stable ID available is given", function(assert) {
			assert.strictEqual(this.oAddXmlAtExtensionPointPlugin.isAvailable([this.oPanelWithoutIdOverlay]), true, "isAvailable is called and returns true");
			assert.strictEqual(this.oAddXmlAtExtensionPointPlugin.isEnabled([this.oPanelWithoutIdOverlay]), true, "isEnabled is called and returns true");
			return this.oAddXmlAtExtensionPointPlugin._isEditable(this.oPanelWithoutIdOverlay)
				.then(function(bEditable) {
					assert.strictEqual(bEditable, true, "then the overlay is editable");
				});
		});

		QUnit.test("when getMenuItem is called", function(assert) {
			var aMenuItems = this.oAddXmlAtExtensionPointPlugin.getMenuItems([this.oPanelOverlay]);
			assert.strictEqual(aMenuItems[0].id, "CTX_ADDXML_AT_EXTENSIONPOINT", "'getMenuItems' returns the context menu item for the plugin with the correct id");
			assert.strictEqual(aMenuItems[0].rank, 110, "'getMenuItems' returns the context menu item with the correct rank");
			assert.strictEqual(aMenuItems[0].icon, "sap-icon://add-equipment", "'getMenuItems' returns the context menu item with the correct icon");
		});

		QUnit.test("when handler function is called without valid fragmentHandler function defined", function(assert) {
			return this.oAddXmlAtExtensionPointPlugin.handler([this.oPanelOverlay], {})
				.then(function () {
					assert.notOk(true, "then this should never be called");
				})
				.catch(function (oError) {
					assert.ok(oError.message.indexOf("Fragment handler function is not available in the handler") > -1, "then handler rejects with the correct exception message");
				});
		});
	});

	QUnit.module("Given an xmlView with extensionPoints and AddXMLAtExtensionPoint plugin with initial fragment handler function is created and the DesignTime is started ", {
		beforeEach: function() {
			sandbox.stub(sap.ui.getCore().getConfiguration(), "getDesignMode").returns(true);
			this.sInitialFragmentPath = "sap/ui/.../fragment/fragmentName";
			this.oFragmentHandlerStub = sandbox.stub().resolves({
				extensionPointName: "EP1",
				fragmentPath: this.sInitialFragmentPath,
				fragment: "fragment/fragmentName"
			});
			return createBeforeEach.call(this);
		},
		afterEach: function() {
			this.oDesignTime.destroy();
			this.oComponent.destroy();
			this.oXmlView.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when handler is called for the view overlay, without fragmentHandler function in the propertyBag defined", function(assert) {
			var fnDone = assert.async(2);
			var oPropertyBag = {};
			this.oAddXmlAtExtensionPointPlugin.attachElementModified(function (oEvent) {
				var oCommand = oEvent.getParameters().command;
				assert.ok(oCommand instanceof CompositeCommand, "then the plugin fired the elementModified event with the CompositeCommand");
				assert.ok(oCommand.getCommands()[0] instanceof AddXMLAtExtensionPointCommand, "then the CompositeCommand contains AddXMLAtExtensionPointCommand");
				assert.ok(oCommand.getCommands()[1] instanceof AppDescriptorCommand, "then the CompositeCommand contains AppDescriptorCommand");
				assert.strictEqual(oCommand.getCommands()[0].getFragmentPath(), this.sInitialFragmentPath, "then the returned command contains the fragment path from the initial fragmentHandler function");
				var mAppDescriptorparameters = { flexExtensionPointEnabled: true };
				assert.deepEqual(oCommand.getCommands()[1].getParameters(), mAppDescriptorparameters, "then the CompositeCommand contains AppDescriptorCommand");
				fnDone();
			}.bind(this));
			var oViewOverlay = OverlayRegistry.getOverlay(this.oXmlView);
			this.oAddXmlAtExtensionPointPlugin.handler([oViewOverlay], oPropertyBag)
				.then(function () {
					assert.strictEqual(this.oFragmentHandlerStub.callCount, 1,
						"then the fragment handler function is called once");
					assert.strictEqual(this.oFragmentHandlerStub.firstCall.args[0], oViewOverlay,
						"then the fragment handler function is called with panel overlay as first parameter");
					var aPassedExtensionPointObjects = this.oFragmentHandlerStub.firstCall.args[1];
					assert.ok(Array.isArray(aPassedExtensionPointObjects),
						"then the fragment handler function is called with array of ExtensionPointInformations as second parameter");
					assert.deepEqual(aPassedExtensionPointObjects.map(function (oExtensionPoint) { return oExtensionPoint.name; }),
						["ExtensionPoint1", "ExtensionPoint2", "ExtensionPoint3", "ExtensionPoint4"],
						"then the expected extension points for the view are returned");
					fnDone();
				}.bind(this));
		});

		QUnit.test("when handler is called for the panel overlay, with fragmentHandler function in the propertyBag defined", function(assert) {
			var fnDone = assert.async(2);
			var sSecondFragmentPath = "sap/ui/.../fragment/SecondFragment";
			var oSecondFragmentHandlerStub = sandbox.stub().resolves({
				extensionPointName: "EP2",
				fragmentPath: sSecondFragmentPath,
				fragment: "fragment/SecondFragment"
			});
			var oPropertyBag = {
				fragmentHandler: oSecondFragmentHandlerStub
			};
			this.oAddXmlAtExtensionPointPlugin.attachElementModified(function (oEvent) {
				var oCommand = oEvent.getParameters().command;
				assert.ok(oCommand instanceof CompositeCommand, "then the plugin fired the elementModified event with the CompositeCommand");
				assert.ok(oCommand.getCommands()[0] instanceof AddXMLAtExtensionPointCommand, "then the CompositeCommand contains AddXMLAtExtensionPointCommand");
				assert.ok(oCommand.getCommands()[1] instanceof AppDescriptorCommand, "then the CompositeCommand contains AppDescriptorCommand");
				assert.strictEqual(oCommand.getCommands()[0].getFragmentPath(), sSecondFragmentPath, "then the returned command contains the fragment path from the passed as property fragmentHandler function");
				var mAppDescriptorparameters = { flexExtensionPointEnabled: true };
				assert.deepEqual(oCommand.getCommands()[1].getParameters(), mAppDescriptorparameters, "then the CompositeCommand contains AppDescriptorCommand");
				fnDone();
			});
			this.oAddXmlAtExtensionPointPlugin.handler([this.oPanelOverlay], oPropertyBag)
				.then(function () {
					assert.strictEqual(oSecondFragmentHandlerStub.callCount, 1, "then the fragment handler function is called once");
					assert.strictEqual(oSecondFragmentHandlerStub.firstCall.args[0], this.oPanelOverlay, "then the fragment handler function is called with panel overlay as first parameter");
					assert.ok(Array.isArray(oSecondFragmentHandlerStub.firstCall.args[1]), "then the fragment handler function is called with array of ExtensionPointInformations as second parameter");
					fnDone();
				}.bind(this));
		});

		QUnit.test("when handler is called with fragmentHandler function returning a map but no extensionPoint is selected", function(assert) {
			var oBrokenFragmentHandlerStub = sandbox.stub().resolves({
				fragmentPath: "sap/ui/.../fragment/SecondFragment",
				fragment: "fragment/SecondFragment"
			});
			var oPropertyBag = {
				fragmentHandler: oBrokenFragmentHandlerStub
			};
			this.oAddXmlAtExtensionPointPlugin.attachElementModified(function () {
				assert.notOk(true, "then elementModified event shouldn't be fired");
			});
			return this.oAddXmlAtExtensionPointPlugin.handler([this.oPanelOverlay], oPropertyBag)
				.catch(function (oError) {
					assert.strictEqual(oBrokenFragmentHandlerStub.callCount, 1, "then the fragment handler function is called once");
					assert.ok(oError.message.indexOf("Extension point name is not selected!") > -1, "then plugin handler rejects an error");
				});
		});

		QUnit.test("when handler is called with fragmentHandler function returning map without valid fragmentPath", function(assert) {
			var oBrokenFragmentHandlerStub = sandbox.stub().resolves({
				extensionPointName: "EP2",
				fragmentPath: ["invalidValue"],
				fragment: "fragment/SecondFragment"
			});
			var oPropertyBag = {
				fragmentHandler: oBrokenFragmentHandlerStub
			};
			this.oAddXmlAtExtensionPointPlugin.attachElementModified(function () {
				assert.notOk(true, "then elementModified event shouldn't be fired");
			});
			return this.oAddXmlAtExtensionPointPlugin.handler([this.oPanelOverlay], oPropertyBag)
				.catch(function (oError) {
					assert.strictEqual(oBrokenFragmentHandlerStub.callCount, 1, "then the fragment handler function is called once");
					assert.ok(oError.message.indexOf("Fragment path is not available") > -1, "then plugin handler rejects an error");
				});
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
