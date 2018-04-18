/* global QUnit */

QUnit.config.autostart = false;
sap.ui.require([
	// Controls
	'sap/m/Button',
	'sap/m/MessageBox',
	'sap/m/MessageToast',
	// internal
	'sap/ui/dt/plugin/ContextMenu',
	'sap/ui/dt/OverlayRegistry',
	'sap/ui/fl/registry/Settings',
	'sap/ui/fl/Change',
	'sap/ui/fl/Utils',
	'sap/ui/rta/Utils',
	'sap/ui/fl/FakeLrepLocalStorage',
	'sap/ui/fl/variants/VariantManagement',
	'sap/ui/rta/RuntimeAuthoring',
	'sap/ui/rta/command/Stack',
	'sap/ui/rta/command/CommandFactory',
	'sap/ui/rta/plugin/Remove',
	'sap/ui/rta/plugin/CreateContainer',
	'sap/ui/rta/plugin/Rename',
	'sap/ui/rta/plugin/ControlVariant',
	'sap/ui/base/Event',
	'sap/ui/rta/command/BaseCommand',
	'sap/ui/rta/qunit/RtaQunitUtils',
	'sap/ui/thirdparty/sinon'
], function(
	Button,
	MessageBox,
	MessageToast,
	ContextMenuPlugin,
	OverlayRegistry,
	Settings,
	Change,
	Utils,
	RtaUtils,
	FakeLrepLocalStorage,
	VariantManagement,
	RuntimeAuthoring,
	Stack,
	CommandFactory,
	Remove,
	CreateContainerPlugin,
	RenamePlugin,
	ControlVariantPlugin,
	Event,
	RTABaseCommand,
	RtaQunitUtils,
	sinon
) {
	"use strict";

	QUnit.start();

	var sandbox = sinon.sandbox.create();
	var oCompCont = RtaQunitUtils.renderTestAppAt("test-view");
	var oComp = oCompCont.getComponentInstance();

	QUnit.module("Given that RuntimeAuthoring is created without a root control...", {
		beforeEach : function(assert) {
			this.oRta = new RuntimeAuthoring({
				rootControl : undefined
			});

		},
		afterEach : function(assert) {
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when RTA starts", function(assert) {
			this.oUtilsLogStub = sandbox.stub(Utils.log, "error");
			var done = assert.async();

			this.oRta.start().catch(function(vError){
				assert.ok(vError, "then the promise is rejected");
				assert.strictEqual(this.oUtilsLogStub.callCount, 1, "and an error is logged");
				done();
			}.bind(this));
		});
	});

	QUnit.module("Given that RuntimeAuthoring is created and started with non-default plugin sets only...", {
		beforeEach : function(assert) {
			var done = assert.async();
			FakeLrepLocalStorage.deleteChanges();
			var oCommandFactory = new CommandFactory();

			this.oContextMenuPlugin = new ContextMenuPlugin("nonDefaultContextMenu");
			this.oRemovePlugin = new Remove({
				id : "nonDefaultRemovePlugin",
				commandFactory : oCommandFactory
			});

			this.oRta = new RuntimeAuthoring({
				rootControl : oCompCont.getComponentInstance().getAggregation("rootControl"),
				showToolbars : false,
				plugins : {
					remove : this.oRemovePlugin,
					contextMenu : this.oContextMenuPlugin
				}
			});

			this.fnDestroy = sinon.spy(this.oRta, "_destroyDefaultPlugins");

			this.oRta.attachStart(function() {
				done();
			});

			this.oRta.start();
		},
		afterEach : function(assert) {
			this.oContextMenuPlugin.destroy();
			FakeLrepLocalStorage.deleteChanges();
			this.oRemovePlugin.destroy();
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when we check the plugins on RTA", function(assert) {
			var done = assert.async();

			assert.equal(this.oRta.getPlugins()['contextMenu'], this.oContextMenuPlugin, " then the custom ContextMenuPlugin is set");
			assert.equal(this.oRta.getPlugins()['rename'], undefined, " and the default plugins are not loaded");
			assert.equal(this.fnDestroy.callCount, 1, " and _destroyDefaultPlugins have been called 1 time after oRta.start()");

			return this.oRta.stop(false).then(function() {
				this.oRta.destroy();
				assert.equal(this.fnDestroy.callCount, 2, " and _destroyDefaultPlugins have been called once again after oRta.stop()");
				done();
			}.bind(this));
		});
	});

	QUnit.module("Given that RuntimeAuthoring is created and started with default plugin sets...", {
		beforeEach : function(assert) {
			var done = assert.async();
			FakeLrepLocalStorage.deleteChanges();

			this.oRta = new RuntimeAuthoring({
				rootControl : oCompCont.getComponentInstance().getAggregation("rootControl"),
				showToolbars : false
			});

			this.fnDestroy = sinon.spy(this.oRta, "_destroyDefaultPlugins");

			this.oRta.attachStart(function() {
				done();
			});

			this.oRta.start();
		},
		afterEach : function(assert) {
			this.oRta.destroy();
			FakeLrepLocalStorage.deleteChanges();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when we check the plugins on RTA", function(assert) {
			var done = assert.async();

			assert.ok(this.oRta.getPlugins()['contextMenu'], " then the default ContextMenuPlugin is set");
			assert.notOk(this.oRta.getPlugins()['contextMenu'].bIsDestroyed, " and the default ContextMenuPlugin is not destroyed");
			assert.ok(this.oRta.getPlugins()['dragDrop'], " and the default DragDropPlugin is set");
			assert.notOk(this.oRta.getPlugins()['dragDrop'].bIsDestroyed, " and the default DragDropPlugin is not destroyed");
			assert.ok(this.oRta.getPlugins()['cutPaste'], " and the default CutPastePlugin is set");
			assert.notOk(this.oRta.getPlugins()['cutPaste'].bIsDestroyed, " and the default CutPastePlugin is not destroyed");
			assert.ok(this.oRta.getPlugins()['remove'], " and the default RemovePlugin is set");
			assert.notOk(this.oRta.getPlugins()['remove'].bIsDestroyed, " and the default RemovePlugin is not destroyed");
			assert.ok(this.oRta.getPlugins()['additionalElements'], " and the default AdditionalElementsPlugin is set");
			assert.notOk(this.oRta.getPlugins()['additionalElements'].bIsDestroyed, " and the default AdditionalElementsPlugin is not destroyed");
			assert.ok(this.oRta.getPlugins()['rename'], " and the default RenamePlugin is set");
			assert.notOk(this.oRta.getPlugins()['rename'].bIsDestroyed, " and the default RenamePlugin is not destroyed");
			assert.ok(this.oRta.getPlugins()['selection'], " and the default SelectionPlugin is set");
			assert.notOk(this.oRta.getPlugins()['selection'].bIsDestroyed, " and the default SelectionPlugin is not destroyed");
			assert.ok(this.oRta.getPlugins()['settings'], " and the default SettingsPlugin is set");
			assert.notOk(this.oRta.getPlugins()['settings'].bIsDestroyed, " and the default SettingsPlugin is not destroyed");
			assert.ok(this.oRta.getPlugins()['createContainer'], " and the default CreateContainerPlugin is set");
			assert.notOk(this.oRta.getPlugins()['createContainer'].bIsDestroyed, " and the default CreateContainerPlugin is not destroyed");
			assert.ok(this.oRta.getPlugins()['tabHandling'], " and the default TabHandlingPlugin is set");
			assert.notOk(this.oRta.getPlugins()['tabHandling'].bIsDestroyed, " and the default TabHandlingPlugin is not destroyed");

			this.oRta.stop(false).then(function(){
				this.oRta.destroy();
				assert.equal(this.fnDestroy.callCount, 2, " and _destroyDefaultPlugins have been called once again after oRta.stop()");
				done();
			}.bind(this));
		});
	});

	QUnit.module("Given that RuntimeAuthoring is started with one different (non-default) plugin (using setPlugins method)...", {
		beforeEach : function(assert) {
			var done = assert.async();
			FakeLrepLocalStorage.deleteChanges();

			this.oContextMenuPlugin = new ContextMenuPlugin("nonDefaultContextMenu");

			this.oRta = new RuntimeAuthoring({
				rootControl : oCompCont.getComponentInstance().getAggregation("rootControl"),
				showToolbars : false
			});
			this.fnDestroy = sinon.spy(this.oRta, "_destroyDefaultPlugins");
			var mPlugins = this.oRta.getDefaultPlugins();

			assert.ok(mPlugins, " then default plugins are supplied by getDefaultPlugins methode");
			delete mPlugins['rename'];
			mPlugins['contextMenu'] = this.oContextMenuPlugin;
			this.oRta.setPlugins(mPlugins);

			this.oRta.attachStart(function() {
				assert.throws(function () {
					this.oRta.setPlugins(mPlugins);
				}, /Cannot replace plugins/, " and setPlugins cannot be called after DT start");
				assert.equal(this.oRta.getPlugins()['rename'], undefined, " and a custom rename plugin does not exist");
				assert.ok(this.oRta.getDefaultPlugins()['rename'].bIsDestroyed, " and the default rename plugin has been destroyed");
				assert.ok(this.oRta.getDefaultPlugins()['contextMenu'].bIsDestroyed, " and the default context menu plugin has been destroyed");
				assert.equal(this.oRta.getPlugins()['contextMenu'].getId(), this.oContextMenuPlugin.getId(), " and the context menu plugin is used");
				done();
			}.bind(this));

			this.oRta.start();
		},
		afterEach : function(assert) {
			this.oContextMenuPlugin.destroy();
			FakeLrepLocalStorage.deleteChanges();
			this.oRta.destroy();
		}
	}, function() {
		QUnit.test("when we check the plugins on RTA", function (assert) {
			var done = assert.async();

			this.oRta.attachStop(function(oEvent) {
				this.oRta.destroy();
				assert.equal(this.fnDestroy.callCount, 2, " and _destroyDefaultPlugins have been called once again after oRta.stop()");
				done();
			}.bind(this));

			this.oRta.stop(false);
		});
	});

	QUnit.module("Given that RTA is started in FLP", {
		beforeEach : function(assert) {
			window.bUShellNavigationTriggered = false;

			this.oRta = new RuntimeAuthoring({
				rootControl : oCompCont.getComponentInstance().getAggregation("rootControl"),
				showToolbars : false
			});

			this.fnEnableRestartSpy = sandbox.spy(RuntimeAuthoring, "enableRestart");

			this.originalUShell = sap.ushell;
			// this overrides the ushell globally => we need to restore it!

			sap.ushell = jQuery.extend(sap.ushell, {
				Container : {
					getService : function(sServiceName) {
						return {
							toExternal : function() {
								window.bUShellNavigationTriggered = true;
							},
							getHash : function() {
								return "Action-somestring";
							},
							parseShellHash : function() {
								return {
									semanticObject : "Action",
									action : "somestring"
								};
							}
						};
					},
					setDirtyFlag : function() {
						return "";
					}
				}
			});
		},
		afterEach : function(assert) {
			this.oRta.destroy();
			sap.ushell = this.originalUShell;
			sandbox.restore();
			delete window.bUShellNavigationTriggered;
		}
	}, function() {
		QUnit.test("when there are personalized changes and when _handlePersonalizationChangesOnStart() method is called", function(assert) {
			var stubFlexController = {
				isPersonalized : function(){
					return Promise.resolve(true);
				}
			};

			sandbox.stub(this.oRta, "_getFlexController").returns(stubFlexController);

			this.fnStubMessageBox = sandbox.stub(sap.m.MessageBox,
				"show",
				function(sMessage, mOptions){
					mOptions.onClose.call(this);
				}
			);

			return this.oRta._handlePersonalizationChangesOnStart().then(function(){
				assert.strictEqual(this.fnEnableRestartSpy.calledOnce,
					true,
					"then enableRestart() is called only once");
				assert.equal(this.fnEnableRestartSpy.calledWith("CUSTOMER"),
					true,
					"then enableRestart() is called with the correct parameter");
				assert.strictEqual(window.bUShellNavigationTriggered,
					true,
					"then the reload inside FLP is triggered");
			}.bind(this));
		});

		QUnit.test("when no personalized changes and _handlePersonalizationChangesOnStart() is called", function(assert) {
			var stubFlexController = {
				isPersonalized : function(){
					return Promise.resolve(false);
				}
			};

			sandbox.stub(this.oRta, "_getFlexController").returns(stubFlexController);

			return this.oRta._handlePersonalizationChangesOnStart().then(function(){
				assert.strictEqual(this.fnEnableRestartSpy.callCount,
					0,
					"then enableRestart() is not called");
				assert.strictEqual(window.bUShellNavigationTriggered,
					false,
					"then the reload inside FLP is not triggered");
			}.bind(this));
		});

		QUnit.test("when RTA toolbar gets closed (exit without appClosed)", function(assert) {
			var done = assert.async();

			sandbox.stub(this.oRta, "_handlePersonalizationChangesOnExit", function(){
				//The test will timeout if the Personalization handling is not called
				assert.ok("then the check for personalized changes was executed");
				done();
			});

			var stubFlexController = {
				isPersonalized : function(){
					return Promise.resolve(false);
				}
			};

			sandbox.stub(this.oRta, "_getFlexController").returns(stubFlexController);
			sandbox.stub(this.oRta, "_checkChangesExist", function() {
				return Promise.resolve(true);
			});
			this.oRta.setShowToolbars(true);

			this.oRta.start().then(function () {
				this.oRta.getToolbar().getControl('exit').firePress();
			}.bind(this));
		});
	});

	QUnit.module("Given that RTA is started in FLP with sap-ui-fl-max-layer = CUSTOMER already in the URL", {
		beforeEach : function(assert) {
			window.bUShellNavigationTriggered = false;
			this.oRta = new RuntimeAuthoring({
				rootControl : oCompCont.getComponentInstance().getAggregation("rootControl"),
				showToolbars : false
			});

			this.fnEnableRestartSpy = sandbox.spy(RuntimeAuthoring, "enableRestart");

			this.originalUShell = sap.ushell;
			// this overrides the ushell globally => we need to restore it!
			sap.ushell = jQuery.extend(sap.ushell, {
				Container : {
					getService : function(sServiceName) {
						return {
							toExternal : function() {
								window.bUShellNavigationTriggered = true;
							},
							getHash : function() {
								return "Action-somestring";
							},
							parseShellHash : function() {
								return {
									semanticObject : "Action",
									action : "somestring",
									params : {
									"sap-ui-fl-max-layer" : ["CUSTOMER"]
									}
								};
							}
						};
					},
					setDirtyFlag : function() {
						return "";
					}
				}
			});
		},
		afterEach : function(assert) {
			this.oRta.destroy();
			sap.ushell = this.originalUShell;
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when _handlePersonalizationChangesOnStart() method is called", function(assert) {
			var stubFlexController = {
				isPersonalized : function(){
					return Promise.resolve(true);
				}
			};

			sandbox.stub(this.oRta, "_getFlexController").returns(stubFlexController);

			this.fnStubMessageBox = sandbox.stub(sap.m.MessageBox,
				"show",
				function(sMessage, mOptions){
					mOptions.onClose.call(this);
				}
			);

			return this.oRta._handlePersonalizationChangesOnStart().then(function(){
				assert.strictEqual(this.fnEnableRestartSpy.calledOnce,
					false,
					"then enableRestart() is not called");
				assert.strictEqual(window.bUShellNavigationTriggered,
					false,
					"then the reload inside FLP is not triggered");
			}.bind(this));
		});

		QUnit.test("when personalized changes exist and user exits reloading the personalization...", function(assert) {
			var stubFlexController = {
				isPersonalized : function(){
					return Promise.resolve(true);
				}
			};

			sandbox.stub(this.oRta, "_getFlexController").returns(stubFlexController);

			var sMessageBoxConfirmText = this.oRta._getTextResources().getText("MSG_PERSONALIZATION_CONFIRM_BUTTON_TEXT");

			this.fnStubMessageBox = sandbox.stub(sap.m.MessageBox,
				"confirm",
				function(sMessage, mOptions){
					mOptions.onClose.call(this, sMessageBoxConfirmText);
				}
			);

			return this.oRta._handlePersonalizationChangesOnExit().then(function(){
				assert.strictEqual(this.fnEnableRestartSpy.callCount,
					0,
					"then enableRestart() is not called");
				assert.strictEqual(window.bUShellNavigationTriggered,
					true,
					"then the reload inside FLP is triggered");
			}.bind(this));
		});

		QUnit.test("when personalized changes exist and user exits without personalization...", function(assert) {
			var stubFlexController = {
				isPersonalized : function(){
					return Promise.resolve(true);
				}
			};

			sandbox.stub(this.oRta, "_getFlexController").returns(stubFlexController);

			var sMessageBoxCancelText = this.oRta._getTextResources().getText("MSG_PERSONALIZATION_CANCEL_BUTTON_TEXT");

			this.fnStubMessageBox = sandbox.stub(sap.m.MessageBox,
				"confirm",
				function(sMessage, mOptions){
					mOptions.onClose.call(this, sMessageBoxCancelText);
				}
			);

			return this.oRta._handlePersonalizationChangesOnExit().then(function(){
				assert.strictEqual(this.fnEnableRestartSpy.callCount,
					0,
					"then enableRestart() is not called");
				assert.strictEqual(window.bUShellNavigationTriggered,
					false,
					"then the reload inside FLP is not triggered");
			}.bind(this));
		});

		QUnit.test("when there are no personalized changes and _handlePersonalizationChangesOnExit() is called", function(assert) {
			var stubFlexController = {
				isPersonalized : function(){
					return Promise.resolve(false);
				}
			};

			sandbox.stub(this.oRta, "_getFlexController").returns(stubFlexController);

			return this.oRta._handlePersonalizationChangesOnExit().then(function(){
				assert.strictEqual(this.fnEnableRestartSpy.callCount,
					0,
					"then enableRestart() is not called");
				assert.strictEqual(window.bUShellNavigationTriggered,
					false,
					"then the reload inside FLP is not triggered");
			}.bind(this));
		});
	});

	QUnit.module("Given that RTA is started on stand-alone applications", {
		beforeEach : function(assert) {
			this.oRta = new RuntimeAuthoring({
				rootControl : oCompCont.getComponentInstance().getAggregation("rootControl"),
				showToolbars : false
			});

			this.fnEnableRestartSpy = sandbox.spy(RuntimeAuthoring, "enableRestart");
			this.fnReloadWithPersonalizationChangesSpy =
				sandbox.spy(this.oRta, "_reloadWithPersonalizationChanges");
			this.fnReloadWithoutPersonalizationChangesSpy =
				sandbox.spy(this.oRta, "_reloadWithoutPersonalizationChanges");
		},
		afterEach : function(assert) {
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when the _handlePersonalizationChangesOnStart() method is called", function(assert) {
			return this.oRta._handlePersonalizationChangesOnStart().then(function(){
				assert.strictEqual(this.fnEnableRestartSpy.callCount, 0, "then enableRestart() is not called");
				assert.strictEqual(this.fnReloadWithPersonalizationChangesSpy.callCount,
					0,
					"then reloadWithoutPersonalizationChanges() is not called");
			}.bind(this));
		});

		QUnit.test("when the _handlePersonalizationChangesOnExit() method is called", function(assert) {
			return this.oRta._handlePersonalizationChangesOnExit().then(function(){
				assert.strictEqual(this.fnEnableRestartSpy.callCount, 0, "then enableRestart() is not called");
				assert.strictEqual(this.fnReloadWithoutPersonalizationChangesSpy.callCount,
					0,
					"then reloadWithPersonalizationChanges() is not called");
			}.bind(this));
		});
	});

	QUnit.module("Given that RuntimeAuthoring is available with a view as rootControl ...", {
		beforeEach : function(assert) {
			var that = this;
			var done = assert.async();
			sandbox = sinon.sandbox.create();
			var oSettings = {
				isAtoAvailable: false,
				isKeyUser: true,
				isProductiveSystem: true
			};
			var oSettingsInstance = new Settings(oSettings);
			this.oRta = new RuntimeAuthoring({
				rootControl : oCompCont.getComponentInstance().getAggregation("rootControl")
			});
			sap.ui.require(["sap/ui/fl/registry/Settings"], function(Settings) {
				sandbox.stub(Settings, "getInstance").returns(Promise.resolve(oSettingsInstance));

				that.oRta.start().then(done);
			});
		},
		afterEach : function(assert) {
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("and publish is disabled", function(assert) {
			assert.equal(this.oRta.getToolbar().getControl('restore').getVisible(), true, "then the Reset Button is still visible");
			assert.equal(this.oRta.getToolbar().getControl('publish').getVisible(), false, "then the Publish Button is invisible");
		});
	});

	QUnit.module("Given that RuntimeAuthoring is available with a view as rootControl...", {
		beforeEach : function(assert) {
			var that = this;
			var done = assert.async();
			sandbox = sinon.sandbox.create();
			var oSettings = {
				isAtoAvailable: true,
				isKeyUser: true,
				isProductiveSystem: false
			};
			var oSettingsInstance = new Settings(oSettings);
			this.oRta = new RuntimeAuthoring({
				rootControl : oCompCont.getComponentInstance().getAggregation("rootControl")
			});
			sap.ui.require(["sap/ui/fl/registry/Settings"], function(Settings) {
				sandbox.stub(Settings, "getInstance").returns(Promise.resolve(oSettingsInstance));

				that.oRta.start().then(done);
			});
		},
		afterEach : function(assert) {
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("and publish is enabled", function(assert) {
			assert.equal(this.oRta.getToolbar().getControl('restore').getVisible(), true, "then the Reset Button is visible");
			assert.equal(this.oRta.getToolbar().getControl('publish').getVisible(), true, "then the Publish Button is visible");
		});
	});

	QUnit.module("Given that RuntimeAuthoring is available with a view as rootControl...", {
		beforeEach : function(assert) {
			var that = this;
			var done = assert.async();
			this.oRta = new RuntimeAuthoring({
				rootControl : oCompCont.getComponentInstance().getAggregation("rootControl")
			});
			sap.ui.require(["sap/ui/fl/registry/Settings"], function(Settings) {
				sandbox.stub(Settings, "getInstance").returns(Promise.reject());

				that.oRta.start().then(done);
			});
		},
		afterEach : function(assert) {
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("and FL settings return rejected promise", function(assert) {
			assert.equal(this.oRta.getToolbar().getControl('restore').getVisible(), true, "then the Reset Button is still visible");
			assert.equal(this.oRta.getToolbar().getControl('publish').getVisible(), false, "then the Publish Button is invisible");
		});
	});

	QUnit.module("Given that RuntimeAuthoring is created but not started", {
		beforeEach : function(assert) {
			this.oRootControl = oCompCont.getComponentInstance().getAggregation("rootControl");
			this.oRta = new RuntimeAuthoring({
				rootControl : this.oRootControl
			});
		},
		afterEach : function(assert) {
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when _onUnload is called with changes", function(assert) {
			sandbox.stub(this.oRta, "getCommandStack").returns({
				canUndo: function() {
					return true;
				}
			});
			var sMessage = this.oRta._onUnload();
			assert.equal(sMessage, this.oRta._getTextResources().getText("MSG_UNSAVED_CHANGES"), "then the function returns the correct message");
		});

		QUnit.test("when _onUnload is called with changes but 'showWindowUnloadDialog' set to false", function(assert) {
			sandbox.stub(this.oRta, "getCommandStack").returns({
				canUndo: function() {
					return true;
				}
			});
			this.oRta.setShowWindowUnloadDialog(false);
			var sMessage = this.oRta._onUnload();
			assert.equal(sMessage, undefined, "then the function returns no message");
		});

		QUnit.test("when _onUnload is called without changes", function(assert) {
			sandbox.stub(this.oRta, "getCommandStack").returns({
				canUndo: function() {
					return false;
				},
				canRedo: function() {
					return false;
				}
			});
			var sMessage = this.oRta._onUnload();
			assert.equal(sMessage, undefined, "then the function returns no message");
		});

		QUnit.test("when getSelection is called with no designtime available", function(assert) {
			var aSelection = this.oRta.getSelection();
			assert.ok(Array.isArray(aSelection), "then it still returns an array");
			assert.equal(aSelection.length, 0, "and the array is empty");
		});

		QUnit.test("when _showMessageToast is called", function(assert) {
			var oMessageToastStub = sandbox.stub(MessageToast, "show");
			sandbox.stub(this.oRta, "_getTextResources").returns({
				getText: function() {
					return "myMessage";
				}
			});
			this.oRta._showMessageToast("myMessage");
			assert.equal(oMessageToastStub.callCount, 1, "then one message toast was opened");
			assert.equal(oMessageToastStub.lastCall.args[0], "myMessage", "and the message was set correctly");
		});

		QUnit.test("when _onElementEditableChange is called", function(assert) {
			assert.equal(this.oRta.iEditableOverlaysCount, 0, "initially the counter is 0");

			this.oRta._onElementEditableChange({
				getParameter: function() {
					return true;
				}
			});
			assert.equal(this.oRta.iEditableOverlaysCount, 1, "the counter is now 1");

			this.oRta._onElementEditableChange({
				getParameter: function() {
					return false;
				}
			});
			assert.equal(this.oRta.iEditableOverlaysCount, 0, "the counter is now 0 again");
		});

		QUnit.test("when _checkChangesExist is called without a componentName", function(assert) {
			sandbox.stub(this.oRta, "_getFlexController").returns({
				getComponentName: function() {
					return [];
				}
			});

			return this.oRta._checkChangesExist().then(function(bPromiseValue) {
				assert.equal(bPromiseValue, false, "then the promise resolved with false as parameter");
			});
		});
	});

	QUnit.done(function( details ) {
		oComp.destroy();
		jQuery("#test-view").hide();
	});
});
