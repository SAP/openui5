/* global QUnit */

sap.ui.define([
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/Layer",
	"sap/ui/rta/util/PluginManager",
	"sap/ui/rta/plugin/CreateContainer",
	"sap/ui/rta/plugin/Settings",
	"sap/ui/thirdparty/sinon-4"
],
function(
	Settings,
	Layer,
	PluginManager,
	CreateContainerPlugin,
	SettingsPlugin,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	QUnit.module("Given PluginManager exists", {
		beforeEach() {
			this.oPluginManager = new PluginManager();
			sandbox.stub(Settings, "getInstanceOrUndef").returns({
				isVariantAdaptationEnabled() {
					return true;
				},
				isVersioningEnabled(sLayer) {
					if (sLayer === Layer.USER) {
						return true;
					}
					return false;
				},
				isLocalResetEnabled() {
					return true;
				}
			});
		},
		afterEach() {
			this.oPluginManager.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when PluginManager is initialized", function(assert) {
			assert.strictEqual(this.oPluginManager.getEditableOverlaysCount(), 0, "then number of editable overlays should be 0");
		});

		QUnit.test("when 'getDefaultPlugins' function is called correctly", function(assert) {
			var defaultPlugins = this.oPluginManager.getDefaultPlugins({layer: Layer.CUSTOMER});

			var pluginsToCheck = [
				"addIFrame",
				"additionalElements",
				"combine",
				"compVariant",
				"contextMenu",
				"controlVariant",
				"createContainer",
				"cutPaste",
				"dragDrop",
				"localReset",
				"remove",
				"rename",
				"resize",
				"selection",
				"settings",
				"split",
				"stretch",
				"tabHandling",
				"toolHooks"
			];

			var defaultPluginsArray = [];

			for (var key in defaultPlugins) {
				defaultPluginsArray.push(key);
			}
			assert.deepEqual(defaultPluginsArray.sort(), pluginsToCheck.sort(), "then all default plugins are included");
		});
		function getMockEvent(bParameter) {
			return {
				getParameter() {
					return bParameter;
				}
			};
		}

		QUnit.test("when 'onElementEditableChange' function is called", function(assert) {
			var mMockEventTrue = getMockEvent(true);
			this.oPluginManager.onElementEditableChange(mMockEventTrue);
			assert.equal(this.oPluginManager.getEditableOverlaysCount(), 1, "then onElementEditableChange is working as expected when parameter is true");

			var mMockEventFalse = getMockEvent(false);
			this.oPluginManager.onElementEditableChange(mMockEventFalse);
			assert.equal(this.oPluginManager.getEditableOverlaysCount(), 0, "then onElementEditableChange is working as expected when parameter is false");
		});

		QUnit.test("when 'handleStopCutPaste' function is called", function(assert) {
			this.oPluginManager.preparePlugins([], function() {});
			var oCutPastePlugin = this.oPluginManager.getPlugins().cutPaste;
			var oCutPastePluginSpy = sandbox.spy(oCutPastePlugin, "stopCutAndPaste");
			this.oPluginManager.handleStopCutPaste();
			assert.equal(oCutPastePluginSpy.callCount, 1, "then handleStopCutPaste is working as expected");
		});

		QUnit.test("when 'preparePlugins' function is called without plugins defined", function(assert) {
			var oGetDefaultPluginsSpy = sandbox.spy(this.oPluginManager, "getDefaultPlugins");
			var oDestroyDefaultPluginsSpy = sandbox.spy(this.oPluginManager, "_destroyDefaultPlugins");
			var oFakeCommandStack = { id: "fakeCommandStack" };
			this.oPluginManager.preparePlugins({ name: "flexSettings" }, sandbox.stub(), oFakeCommandStack);
			assert.strictEqual(oGetDefaultPluginsSpy.callCount, 1, "then the get default plugins function is called once");
			assert.strictEqual(oDestroyDefaultPluginsSpy.callCount, 0, "then the destroy default plugins function is not called because all default plugins are in use");
			var oPlugins = this.oPluginManager.getPlugins();
			Object.keys(oPlugins).forEach(function(sPluginName) {
				if (oPlugins[sPluginName].attachElementModified) {
					assert.ok(oPlugins[sPluginName].mEventRegistry.elementModified,
						`then '${sPluginName}' plugin attached a handler function for the elmenetModified event`);
				}
			});
			assert.strictEqual(this.oPluginManager.getPlugins().settings.getCommandStack().id,
				oFakeCommandStack.id, "then command stack is provided to the settings plugin");
		});

		QUnit.test("when 'preparePlugins' function is called with specific plugins defined", function(assert) {
			var oDefaultRenamePlugin = this.oPluginManager.getDefaultPlugins({layer: Layer.CUSTOMER}).rename;
			var oGetDefaultPluginsSpy = sandbox.spy(this.oPluginManager, "getDefaultPlugins");
			var oDestroyDefaultPluginsSpy = sandbox.spy(this.oPluginManager, "_destroyDefaultPlugins");
			this.oPluginManager.setPlugins({
				rename: oDefaultRenamePlugin,
				createContainer: new CreateContainerPlugin({ commandFactory: {} }),
				settings: new SettingsPlugin({ commandFactory: {} })
			});
			var oFakeCommandStack = { id: "fakeCommandStack" };
			this.oPluginManager.preparePlugins({ name: "flexSettings" }, sandbox.stub(), oFakeCommandStack);
			assert.strictEqual(oGetDefaultPluginsSpy.callCount, 0, "then the get default plugins function is not called");
			assert.strictEqual(oDestroyDefaultPluginsSpy.callCount, 1, "then the destroy default plugins function is called once");
			var oPlugins = this.oPluginManager.getPlugins();
			Object.keys(oPlugins).forEach(function(sPluginName) {
				if (oPlugins[sPluginName].attachElementModified) {
					assert.ok(oPlugins[sPluginName].mEventRegistry.elementModified,
						`then '${sPluginName}' plugin attached a handler function for the elmenetModified event`);
				}
			});
			assert.strictEqual(this.oPluginManager.getPlugins().settings.getCommandStack().id,
				oFakeCommandStack.id, "then command stack is provided to the settings plugin");
		});

		QUnit.test("when 'getPluginList' function is called", function(assert) {
			assert.strictEqual(this.oPluginManager.getPluginList().length, 0,
				"then before set plugins the returned value is an empty array");
			this.oPluginManager.setPlugins({
				createContainer: new CreateContainerPlugin({ commandFactory: {} }),
				settings: new SettingsPlugin({ commandFactory: {} })
			});
			var aPlugins = this.oPluginManager.getPluginList();
			assert.strictEqual(aPlugins.length, 2,
				"then after set plugins the returned value is an array with two entries");
			assert.ok(aPlugins[0] instanceof CreateContainerPlugin,
				"then after set plugins the first value is a create container plugin");
			assert.ok(aPlugins[1] instanceof SettingsPlugin,
				"then after set plugins the first value is a settings plugin");
		});
	});

	QUnit.module("Given PluginManager exists", {
		beforeEach() {
			this.oPluginManager = new PluginManager();
		},
		afterEach() {
			this.oPluginManager.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when 'getDefaultPlugins' function is called with localReset plugin defined but with local reset unavailable", function(assert) {
			sandbox.stub(Settings, "getInstanceOrUndef").returns({
				isVariantAdaptationEnabled() {
					return true;
				},
				isLocalResetEnabled() {
					return false;
				}
			});
			var oDefaultLocalResetPlugin = this.oPluginManager.getDefaultPlugins({layer: Layer.CUSTOMER}).localReset;
			assert.equal(oDefaultLocalResetPlugin, undefined, "then the localReset plugin is not available");
		});

		QUnit.test("when 'getDefaultPlugins' function is called with localReset plugin defined but with local reset available", function(assert) {
			sandbox.stub(Settings, "getInstanceOrUndef").returns({
				isVariantAdaptationEnabled() {
					return true;
				},
				isLocalResetEnabled() {
					return true;
				}
			});
			var oDefaultLocalResetPlugin = this.oPluginManager.getDefaultPlugins({layer: Layer.CUSTOMER});
			assert.notEqual(oDefaultLocalResetPlugin, undefined, "then the localReset plugin is available");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});