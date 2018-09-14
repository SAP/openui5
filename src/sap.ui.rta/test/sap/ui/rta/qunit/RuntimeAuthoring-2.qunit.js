/* global QUnit */

sap.ui.define([
	'sap/m/MessageToast',
	'sap/ui/dt/plugin/ContextMenu',
	'sap/ui/dt/DesignTime',
	'sap/ui/fl/registry/Settings',
	'sap/ui/fl/Utils',
	'sap/ui/rta/Utils',
	'sap/ui/fl/FakeLrepSessionStorage',
	'sap/ui/rta/RuntimeAuthoring',
	'sap/ui/rta/command/CommandFactory',
	'sap/ui/rta/plugin/Remove',
	'qunit/RtaQunitUtils',
	'sap/ui/thirdparty/sinon-4'
], function (
	MessageToast,
	ContextMenuPlugin,
	DesignTime,
	Settings,
	Utils,
	RtaUtils,
	FakeLrepSessionStorage,
	RuntimeAuthoring,
	CommandFactory,
	Remove,
	RtaQunitUtils,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();
	var oCompCont = RtaQunitUtils.renderTestAppAt("qunit-fixture");
	var oComp = oCompCont.getComponentInstance();

	QUnit.module("Given that RuntimeAuthoring is created without a root control...", {
		beforeEach : function() {
			this.oRta = new RuntimeAuthoring({
				rootControl : undefined
			});

		},
		afterEach : function() {
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
		beforeEach : function() {
			FakeLrepSessionStorage.deleteChanges();
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

			return this.oRta.start();
		},
		afterEach : function() {
			this.oContextMenuPlugin.destroy();
			FakeLrepSessionStorage.deleteChanges();
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

	QUnit.module("Given that RuntimeAuthoring is started with one different (non-default) plugin (using setPlugins method)...", {
		beforeEach : function(assert) {
			FakeLrepSessionStorage.deleteChanges();

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

			return this.oRta.start()
			.then(function() {
				assert.throws(function () {
					this.oRta.setPlugins(mPlugins);
				}, /Cannot replace plugins/, " and setPlugins cannot be called after DT start");
				assert.equal(this.oRta.getPlugins()['rename'], undefined, " and a custom rename plugin does not exist");
				assert.ok(this.oRta.getDefaultPlugins()['rename'].bIsDestroyed, " and the default rename plugin has been destroyed");
				assert.ok(this.oRta.getDefaultPlugins()['contextMenu'].bIsDestroyed, " and the default context menu plugin has been destroyed");
				assert.equal(this.oRta.getPlugins()['contextMenu'].getId(), this.oContextMenuPlugin.getId(), " and the context menu plugin is used");
			}.bind(this));
		},
		afterEach : function() {
			this.oContextMenuPlugin.destroy();
			FakeLrepSessionStorage.deleteChanges();
			this.oRta.destroy();
		}
	}, function() {
		QUnit.test("when we check the plugins on RTA", function (assert) {
			var done = assert.async();

			this.oRta.attachStop(function() {
				this.oRta.destroy();
				assert.equal(this.fnDestroy.callCount, 2, " and _destroyDefaultPlugins have been called once again after oRta.stop()");
				done();
			}.bind(this));

			this.oRta.stop(false);
		});
	});

	QUnit.module("Given that RTA is started in FLP", {
		beforeEach : function() {
			this.oRta = new RuntimeAuthoring({
				rootControl : oCompCont.getComponentInstance().getAggregation("rootControl"),
				showToolbars : false
			});

			this.fnEnableRestartSpy = sandbox.spy(RuntimeAuthoring, "enableRestart");
			var fnFLPToExternalStub = sandbox.spy();
			this.fnFLPToExternalStub = fnFLPToExternalStub;

			this.originalUShell = sap.ushell;
			// this overrides the ushell globally => we need to restore it!
			sap.ushell = jQuery.extend(sap.ushell, {
				Container : {
					getService : function() {
						return {
							toExternal : fnFLPToExternalStub,
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
					}
				}
			});
		},
		afterEach : function() {
			this.oRta.destroy();
			sap.ushell = this.originalUShell;
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when there are personalized changes and when _handlePersonalizationChangesOnStart() method is called", function(assert) {
			var stubFlexController = {
				isPersonalized : function(){
					return Promise.resolve(true);
				}
			};

			sandbox.stub(this.oRta, "_getFlexController").returns(stubFlexController);

			whenUserConfirmsMessage.call(this);

			return this.oRta._handlePersonalizationChangesOnStart().then(function(){
				assert.strictEqual(this.fnEnableRestartSpy.calledOnce,
					true,
					"then enableRestart() is called only once");
				assert.equal(this.fnEnableRestartSpy.calledWith("CUSTOMER"),
					true,
					"then enableRestart() is called with the correct parameter");
				assert.strictEqual(isReloadedWithMaxLayerParameter(this.fnFLPToExternalStub),
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
					"then RTA restart will not be enabled");
				assert.strictEqual(isReloadedWithMaxLayerParameter(this.fnFLPToExternalStub),
					false,
					"then the reload inside FLP is not triggered");
			}.bind(this));
		});

		QUnit.test("when RTA is started and _handlePersonalizationChangesOnStart returns true", function(assert) {
			assert.expect(3);
			sandbox.stub(this.oRta, "_handlePersonalizationChangesOnStart").returns(Promise.resolve(true));
			var oFireFailedStub = sandbox.stub(this.oRta, "fireFailed");
			return this.oRta.start()
			.catch(function(oError) {
				assert.ok(true, "then the start promise rejects");
				assert.equal(oFireFailedStub.callCount, 0, "and fireFailed was not called");
				assert.equal(oError, "Reload triggered", "and the Error is 'Reload triggered'");
			});
		});

		QUnit.test("when RTA toolbar gets closed (exit without appClosed)", function(assert) {
			var done = assert.async();

			sandbox.stub(this.oRta, "_handleReloadOnExit").callsFake(function(){
				//The test will timeout if the reload handling is not called
				assert.ok("then the check for reload was executed");
				done();
				return Promise.resolve(this.oRta._RESTART.NOT_NEEDED);
			}.bind(this));

			var stubFlexController = {
				isPersonalized : function(){
					return Promise.resolve(false);
				},
				getComponentChanges : function() {
					return Promise.resolve();
				}
			};

			sandbox.stub(this.oRta, "_getFlexController").returns(stubFlexController);
			sandbox.stub(this.oRta, "_checkChangesExist").callsFake(function(){
				return Promise.resolve(true);
			});
			this.oRta.setShowToolbars(true);

			this.oRta.start().then(function () {
				this.oRta.getToolbar().getControl('exit').firePress();
			}.bind(this));
		});

		QUnit.test("when RTA gets started without root control", function(assert) {
			assert.expect(3);
			this.oRta.setRootControl(undefined);
			return this.oRta.start()
			.catch(function(oError) {
				assert.ok(true, "the start function rejects the promise");
				assert.ok(oError instanceof Error, "the Error object has been returned");
				assert.strictEqual(oError.message, "Root control not found", "with the correct Error");
			});
		});

		QUnit.test("when RTA gets started with an app version validation", function(assert) {
			assert.expect(3);
			this.oRta.setValidateAppVersion(true);
			return this.oRta.start()
			.catch(function(vError) {
				assert.ok(true, "the start function rejects the promise");
				assert.ok(typeof vError === 'string', "the a string error has been returned");
				assert.ok(vError.includes('version'));
			});
		});

		QUnit.test("when RTA gets started and DesignTime fails to start", function(assert) {
			assert.expect(3);
			sandbox.stub(DesignTime.prototype, "addRootElement").callsFake(function() {
				setTimeout(function() {
					this.fireSyncFailed({error: "DesignTime failed"});
				}.bind(this), 0);
			});
			var oFireFailedStub = sandbox.stub(this.oRta, "fireFailed");
			return this.oRta.start()
			.catch(function(oError) {
				assert.ok(true, "the start function rejects the promise");
				assert.equal(oError, "DesignTime failed", "with the correct Error");
				assert.equal(oFireFailedStub.callCount, 1, "and fireFailed was called");
			});
		});
	});

	function appDescriptorChanges(oRta, bExist){
		//we don't want to start RTA for these tests, so just setting the otherwise not set property,
		//that sinon cannot stub until it was set.
		oRta._oSerializer = {
			needsReload : function(){
				return Promise.resolve(bExist);
			}
		};
	}
	function whenAppDescriptorChangesExist(oRta){
		appDescriptorChanges(oRta, true);
	}
	function whenNoAppDescriptorChangesExist(oRta){
		appDescriptorChanges(oRta, false);
	}
	function personalizationChanges(oRta, bExist){
		var stubFlexController = {
			isPersonalized : function(){
				return Promise.resolve(bExist);
			}
		};
		sandbox.stub(oRta, "_getFlexController").returns(stubFlexController);
	}
	function whenPersonalizationChangesExist(oRta){
		personalizationChanges(oRta, true);
	}
	function whenNoPersonalizationChangesExist(oRta){
		personalizationChanges(oRta, false);
	}

	function isReloadedWithMaxLayerParameter(fnFLPToExternalStub){
		if (!fnFLPToExternalStub.lastCall){
			return false;
		}
		var mFLPArgs = fnFLPToExternalStub.lastCall.args[0];
		return !!mFLPArgs.params["sap-ui-fl-max-layer"];
	}
	function whenUserConfirmsMessage(){
		var sMessageBoxConfirmText = this.oRta._getTextResources().getText("MSG_PERSONALIZATION_CONFIRM_BUTTON_TEXT");

		this.fnStubMessageBox = sandbox.stub(sap.m.MessageBox,"confirm")
		.callsFake(
			function(sMessage, mOptions){
				mOptions.onClose.call(this, sMessageBoxConfirmText);
			}
		);

		this.fnStubMessageBox = sandbox.stub(sap.m.MessageBox, "show")
		.callsFake(
			function(sMessage, mOptions){
				mOptions.onClose.call(this);
			}
		);
		this.fnStubMessageBox = sandbox.stub(RtaUtils,"_showMessageBox").resolves();
	}

	QUnit.module("Given that RTA is started in FLP with sap-ui-fl-max-layer = CUSTOMER already in the URL", {
		beforeEach : function() {
			this.oRta = new RuntimeAuthoring({
				rootControl : oCompCont.getComponentInstance().getAggregation("rootControl"),
				showToolbars : false
			});
			whenNoAppDescriptorChangesExist(this.oRta);

			this.fnEnableRestartSpy = sandbox.spy(RuntimeAuthoring, "enableRestart");
			this.fnReloadPageStub = sandbox.stub(this.oRta, "_reloadPage");
			var fnFLPToExternalStub = sandbox.spy();
			this.fnFLPToExternalStub = fnFLPToExternalStub;

			this.originalUShell = sap.ushell;
			// this overrides the ushell globally => we need to restore it!
			sap.ushell = jQuery.extend(sap.ushell, {
				Container : {
					getService : function() {
						return {
							toExternal : fnFLPToExternalStub,
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
					}
				}
			});
		},
		afterEach : function() {
			this.oRta.destroy();
			sap.ushell = this.originalUShell;
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when _handlePersonalizationChangesOnStart() method is called", function(assert) {
			whenPersonalizationChangesExist(this.oRta);

			whenUserConfirmsMessage.call(this);

			return this.oRta._handlePersonalizationChangesOnStart().then(function(){
				assert.strictEqual(this.fnEnableRestartSpy.calledOnce,
					false,
					"then RTA restart will not be enabled");
				assert.strictEqual(isReloadedWithMaxLayerParameter(this.fnFLPToExternalStub),
					false,
					"then the reload inside FLP is not triggered");
			}.bind(this));
		});

		QUnit.test("when personalized changes exist and user exits and started in FLP reloading the personalization...", function(assert) {
			whenPersonalizationChangesExist(this.oRta);

			whenUserConfirmsMessage.call(this);

			return this.oRta._handleReloadOnExit().then(function(sShouldReload){
				assert.strictEqual(this.fnEnableRestartSpy.callCount,
					0,
					"then RTA restart will not be enabled");
				assert.strictEqual(sShouldReload, this.oRta._RESTART.VIA_HASH,
					"then the page is reloaded");
			}.bind(this));
		});

		QUnit.test("when app descriptor and personalized changes exist and user exits reloading the personalization...", function(assert) {
			whenAppDescriptorChangesExist(this.oRta);
			whenPersonalizationChangesExist(this.oRta);

			whenUserConfirmsMessage.call(this);

			return this.oRta._handleReloadOnExit().then(function(sShouldReload){
				assert.strictEqual(this.fnEnableRestartSpy.callCount,
					0,
					"then RTA restart will not be enabled");
				assert.strictEqual(sShouldReload, this.oRta._RESTART.RELOAD_PAGE,
						"then the reload page is triggered to update the flp cache");
			}.bind(this));
		});

		QUnit.test("when there are no personalized and appDescriptor changes and _handleReloadOnExit() is called", function(assert) {
			whenNoPersonalizationChangesExist(this.oRta);

			return this.oRta._handleReloadOnExit().then(function(sShouldReload){
				assert.strictEqual(this.fnEnableRestartSpy.callCount,
					0,
					"then RTA restart will not be enabled");
				assert.strictEqual(sShouldReload, this.oRta._RESTART.NOT_NEEDED,
					"then the reload page is not necessary");
			}.bind(this));
		});

		QUnit.test("when app descriptor and no personalized changes exist and user exits reloading the personalization...", function(assert) {
			whenAppDescriptorChangesExist(this.oRta);
			whenNoPersonalizationChangesExist(this.oRta);

			whenUserConfirmsMessage.call(this);

			return this.oRta._handleReloadOnExit().then(function(sShouldReload){
				assert.strictEqual(this.fnEnableRestartSpy.callCount,
					0,
					"then RTA restart will not be enabled");
				assert.strictEqual(sShouldReload, this.oRta._RESTART.RELOAD_PAGE,
						"then the reload page is triggered to update the flp cache");
			}.bind(this));
		});

		QUnit.test("when reloadable changes exist and user exits RTA...", function(assert) {
			sandbox.stub(this.oRta, "_handleReloadOnExit").resolves(this.oRta._RESTART.RELOAD_PAGE);
			sandbox.stub(this.oRta, "_serializeToLrep").resolves();

			return this.oRta.stop().then(function(){
				assert.strictEqual(this.fnReloadPageStub.callCount,
					1,
					"then page reload is triggered");
				assert.strictEqual(isReloadedWithMaxLayerParameter(this.fnFLPToExternalStub),
					false,
					"then max layer parameter is removed");
			}.bind(this));
		});
	});

	QUnit.module("Given that RTA is started on stand-alone applications", {
		beforeEach : function() {
			this.oRta = new RuntimeAuthoring({
				rootControl : oCompCont.getComponentInstance().getAggregation("rootControl"),
				showToolbars : false
			});
			whenNoAppDescriptorChangesExist(this.oRta);

			this.fnEnableRestartSpy = sandbox.spy(RuntimeAuthoring, "enableRestart");
			this.fnReloadWithPersonalizationChangesSpy =
				sandbox.spy(this.oRta, "_removeMaxLayerParameter");
			this.fnReloadWithoutPersonalizationChangesSpy =
				sandbox.spy(this.oRta, "_reloadWithoutPersonalizationChanges");
			this.fnReloadPageStub =
				sandbox.stub(this.oRta, "_reloadPage");
		},
		afterEach : function() {
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when the _handlePersonalizationChangesOnStart() method is called", function(assert) {
			return this.oRta._handlePersonalizationChangesOnStart().then(function(){
				assert.strictEqual(this.fnEnableRestartSpy.callCount, 0, "then RTA restart will not be enabled");
				assert.strictEqual(this.fnReloadWithPersonalizationChangesSpy.callCount,
					0,
					"then removeMaxLayerParameter() is not called");
			}.bind(this));
		});

		QUnit.test("when the _handleReloadOnExit() method is called", function(assert) {
			return this.oRta._handleReloadOnExit().then(function(){
				assert.strictEqual(this.fnEnableRestartSpy.callCount, 0, "then RTA restart will not be enabled");
				assert.strictEqual(this.fnReloadWithoutPersonalizationChangesSpy.callCount,
					0,
					"then reloadWithoutPersonalizationChanges() is not called");
			}.bind(this));
		});

		QUnit.test("when _handleReloadOnExit() is called and personalized changes and user exits reloading the personalization...", function(assert) {
			whenPersonalizationChangesExist(this.oRta);
			whenUserConfirmsMessage.call(this);

			return this.oRta._handleReloadOnExit().then(function(sShouldReload){
				assert.strictEqual(this.fnEnableRestartSpy.callCount, 0,
					"then RTA restart will not be enabled");
				assert.strictEqual(sShouldReload, this.oRta._RESTART.RELOAD_PAGE,
					"then the page is reloaded");
			}.bind(this));
		});
	});

	QUnit.module("Given that RuntimeAuthoring is available with a view as rootControl ...", {
		beforeEach : function() {
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
			sandbox.stub(Settings, "getInstance").returns(Promise.resolve(oSettingsInstance));

			return this.oRta.start();
		},
		afterEach : function() {
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
		beforeEach : function() {
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
			sandbox.stub(Settings, "getInstance").returns(Promise.resolve(oSettingsInstance));

			return this.oRta.start();
		},
		afterEach : function() {
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
		beforeEach : function() {
			this.oRta = new RuntimeAuthoring({
				rootControl : oCompCont.getComponentInstance().getAggregation("rootControl")
			});
			sandbox.stub(Settings, "getInstance").returns(Promise.reject());

			return this.oRta.start();
		},
		afterEach : function() {
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
		beforeEach : function() {
			this.oRootControl = oCompCont.getComponentInstance().getAggregation("rootControl");
			this.oRta = new RuntimeAuthoring({
				rootControl : this.oRootControl
			});
		},
		afterEach : function() {
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

	QUnit.done(function() {
		oComp.destroy();
		jQuery("#qunit-fixture").hide();
	});
});
