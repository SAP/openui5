/* global QUnit */

sap.ui.define([
	"sap/m/MessageToast",
	"sap/ui/dt/plugin/ContextMenu",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/util/ZIndexManager",
	"sap/ui/fl/registry/Settings",
	"sap/base/Log",
	"sap/ui/fl/Utils",
	"sap/ui/rta/Utils",
	"sap/ui/rta/RuntimeAuthoring",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/rta/plugin/Remove",
	"qunit/RtaQunitUtils",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/fl/write/api/VersionsAPI"
], function (
	MessageToast,
	ContextMenuPlugin,
	DesignTime,
	ZIndexManager,
	Settings,
	Log,
	FlexUtils,
	RtaFlexUtils,
	RuntimeAuthoring,
	CommandFactory,
	Remove,
	RtaQunitUtils,
	PersistenceWriteAPI,
	sinon,
	VersionsAPI
) {
	"use strict";

	var sandbox = sinon.sandbox.create();
	var oCompCont = RtaQunitUtils.renderTestAppAt("qunit-fixture");
	var oComp = oCompCont.getComponentInstance();

	function givenAnFLP(fnFLPToExternalStub, mShellParams) {
		sandbox.stub(FlexUtils, "getUshellContainer").returns({
			getService : function() {
				return {
					toExternal : fnFLPToExternalStub,
					getHash : function() {
						return "Action-somestring";
					},
					parseShellHash : function() {
						var mHash = {
							semanticObject : "Action",
							action : "somestring"
						};

						if (mShellParams) {
							mHash.params = mShellParams;
						}
						return mHash;
					}
				};
			},
			getLogonSystem: function() {
				return {
					isTrial: function() {
						return false;
					}
				};
			}
		});
	}

	function givenMaxLayerParameterIsSetTo(sMaxLayer, fnFLPToExternalStub) {
		givenAnFLP.call(this, fnFLPToExternalStub, {
			"sap-ui-fl-max-layer" : [sMaxLayer]
		});
	}

	function appDescriptorChanges(oRta, bExist) {
		//we don't want to start RTA for these tests, so just setting the otherwise not set property,
		//that sinon cannot stub until it was set.
		oRta._oSerializer = {
			needsReload : function() {
				return Promise.resolve(bExist);
			},
			saveCommands : function() {
				return;
			}
		};
	}
	function whenStartedWithLayer(oRta, sLayer) {
		var mFlexSettings = Object.assign({}, oRta.getFlexSettings());
		mFlexSettings.layer = sLayer;
		oRta.setFlexSettings(mFlexSettings);
	}
	function whenAppDescriptorChangesExist(oRta) {
		appDescriptorChanges(oRta, true);
	}
	function whenNoAppDescriptorChangesExist(oRta) {
		appDescriptorChanges(oRta, false);
	}
	function personalizationChanges(bExist) {
		sandbox.stub(PersistenceWriteAPI, "hasHigherLayerChanges").resolves(bExist);
	}
	function whenHigherLayerChangesExist() {
		personalizationChanges(true);
	}
	function whenNoHigherLayerChangesExist() {
		personalizationChanges(false);
	}

	function isReloadedWithMaxLayerParameter(fnFLPToExternalStub) {
		if (!fnFLPToExternalStub.lastCall) {
			return false;
		}
		var mFLPArgs = fnFLPToExternalStub.lastCall.args[0];
		return !!mFLPArgs.params["sap-ui-fl-max-layer"];
	}
	function whenUserConfirmsMessage(sExpectedMessageKey, assert) {
		sandbox.stub(RtaFlexUtils, "_showMessageBox").callsFake(
			function(oMessageType, sTitleKey, sMessageKey) {
				assert.equal(sMessageKey, sExpectedMessageKey, "then expected message is shown");
				return Promise.resolve();
			}
		);
	}

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
			this.oLogStub = sandbox.stub(Log, "error");
			var done = assert.async();

			this.oRta.start().catch(function(vError) {
				assert.ok(vError, "then the promise is rejected");
				assert.strictEqual(this.oLogStub.callCount, 1, "and an error is logged");
				done();
			}.bind(this));
		});
	});

	QUnit.module("Given that RuntimeAuthoring is created and started with non-default plugin sets only...", {
		beforeEach : function() {
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

			return RtaQunitUtils.clear()
				.then(this.oRta.start.bind(this.oRta));
		},
		afterEach : function() {
			this.oContextMenuPlugin.destroy();
			this.oRemovePlugin.destroy();
			this.oRta.destroy();
			sandbox.restore();
			return RtaQunitUtils.clear();
		}
	}, function() {
		QUnit.test("when we check the plugins on RTA", function(assert) {
			assert.equal(this.oRta.getPlugins()['contextMenu'], this.oContextMenuPlugin, " then the custom ContextMenuPlugin is set");
			assert.equal(this.oRta.getPlugins()['rename'], undefined, " and the default plugins are not loaded");
			assert.equal(this.fnDestroy.callCount, 1, " and _destroyDefaultPlugins have been called 1 time after oRta.start()");

			return this.oRta.stop(false).then(function() {
				this.oRta.destroy();
				assert.equal(this.fnDestroy.callCount, 2, " and _destroyDefaultPlugins have been called once again after oRta.stop()");
			}.bind(this));
		});
	});

	QUnit.module("Given that RuntimeAuthoring is started with one different (non-default) plugin (using setPlugins method)...", {
		beforeEach : function(assert) {
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

			return RtaQunitUtils.clear()
				.then(this.oRta.start.bind(this.oRta))
			.then(function() {
				assert.throws(function () {
					this.oRta.setPlugins(mPlugins);
				}.bind(this), /Cannot replace plugins/, " and setPlugins cannot be called after DT start");
				assert.equal(this.oRta.getPlugins()['rename'], undefined, " and a custom rename plugin does not exist");
				assert.ok(this.oRta.getDefaultPlugins()['rename'].bIsDestroyed, " and the default rename plugin has been destroyed");
				assert.ok(this.oRta.getDefaultPlugins()['contextMenu'].bIsDestroyed, " and the default context menu plugin has been destroyed");
				assert.equal(this.oRta.getPlugins()['contextMenu'].getId(), this.oContextMenuPlugin.getId(), " and the context menu plugin is used");
			}.bind(this));
		},
		afterEach : function() {
			this.oContextMenuPlugin.destroy();
			this.oRta.destroy();
			return RtaQunitUtils.clear();
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
			this.fnFLPToExternalStub = sandbox.spy();

			givenAnFLP.call(this, this.fnFLPToExternalStub);
		},
		afterEach : function() {
			this.oRta.destroy();
			//cleanup session storage
			RuntimeAuthoring.disableRestart("CUSTOMER");
			RuntimeAuthoring.disableRestart("VENDOR");
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when there are higher layer (e.g personalization) changes during startup", function(assert) {
			whenHigherLayerChangesExist();

			whenUserConfirmsMessage.call(this, "MSG_PERSONALIZATION_EXISTS", assert);

			return this.oRta._determineReload().then(function() {
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
		QUnit.test("when there are customer changes and currentLayer is VENDOR during startup", function(assert) {
			whenStartedWithLayer(this.oRta, "VENDOR");
			whenHigherLayerChangesExist();
			whenUserConfirmsMessage.call(this, "MSG_HIGHER_LAYER_CHANGES_EXIST", assert);

			return this.oRta._determineReload().then(function() {
				assert.strictEqual(this.fnEnableRestartSpy.calledOnce,
					true,
					"then enableRestart() is called only once");
				assert.equal(this.fnEnableRestartSpy.calledWith("VENDOR"),
					true,
					"then enableRestart() is called with the correct parameter");
				assert.strictEqual(isReloadedWithMaxLayerParameter(this.fnFLPToExternalStub),
					true,
					"then the reload inside FLP is triggered");
			}.bind(this));
		});

		QUnit.test("when no personalized changes and _determineReload() is called", function(assert) {
			whenNoHigherLayerChangesExist();

			return this.oRta._determineReload().then(function() {
				assert.strictEqual(this.fnEnableRestartSpy.callCount,
					0,
					"then RTA restart will not be enabled");
				assert.strictEqual(isReloadedWithMaxLayerParameter(this.fnFLPToExternalStub),
					false,
					"then the reload inside FLP is not triggered");
			}.bind(this));
		});

		QUnit.test("when RTA is started and _determineReload returns true", function(assert) {
			assert.expect(4);
			sandbox.stub(this.oRta, "_determineReload").returns(Promise.resolve(true));
			var oFireFailedStub = sandbox.stub(this.oRta, "fireFailed");
			var fnRemovePopupFilterStub = sandbox.spy(ZIndexManager, "removePopupFilter");
			return this.oRta.start()
			.catch(function(oError) {
				assert.ok(true, "then the start promise rejects");
				assert.equal(oFireFailedStub.callCount, 0, "and fireFailed was not called");
				assert.equal(oError, "Reload triggered", "and the Error is 'Reload triggered'");
				assert.equal(fnRemovePopupFilterStub.callCount, 2, "then the popup filter from the old rta popupManager are removed from ZIndexManager");
			});
		});

		QUnit.test("when RTA toolbar gets closed (exit without appClosed)", function(assert) {
			var done = assert.async();

			sandbox.stub(this.oRta, "_handleReloadOnExit").callsFake(function() {
				//The test will timeout if the reload handling is not called
				assert.ok("then the check for reload was executed");
				done();
				return Promise.resolve(this.oRta._RESTART.NOT_NEEDED);
			}.bind(this));

			sandbox.stub(PersistenceWriteAPI, "hasHigherLayerChanges").resolves(false);
			sandbox.stub(PersistenceWriteAPI, "getResetAndPublishInfo").resolves({
				isResetEnabled: true,
				isPublishEnabled: true
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

	QUnit.module("Given that RTA is started in FLP with sap-ui-fl-max-layer already in the URL", {
		beforeEach : function() {
			this.oRta = new RuntimeAuthoring({
				rootControl : oCompCont.getComponentInstance().getAggregation("rootControl"),
				showToolbars : false
			});
			whenNoAppDescriptorChangesExist(this.oRta);

			this.fnEnableRestartSpy = sandbox.spy(RuntimeAuthoring, "enableRestart");
			this.fnReloadPageStub = sandbox.stub(this.oRta, "_reloadPage");
			this.fnFLPToExternalStub = sandbox.spy();
		},
		afterEach : function() {
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when personalized changes exist and user exits and started in FLP reloading the personalization...", function(assert) {
			givenMaxLayerParameterIsSetTo.call(this, "CUSTOMER", this.fnFLPToExternalStub);
			whenHigherLayerChangesExist();

			whenUserConfirmsMessage.call(this, "MSG_RELOAD_WITH_PERSONALIZATION", assert);

			return this.oRta._handleReloadOnExit().then(function(sShouldReload) {
				assert.strictEqual(this.fnEnableRestartSpy.callCount,
					0,
					"then RTA restart will not be enabled");
				assert.strictEqual(sShouldReload, this.oRta._RESTART.VIA_HASH,
					"then the page is reloaded");
			}.bind(this));
		});

		QUnit.test("when higher layer changes exist, RTA is started above CUSTOMER layer and user exits and started in FLP reloading the personalization...", function(assert) {
			givenMaxLayerParameterIsSetTo.call(this, "VENDOR", this.fnFLPToExternalStub);
			whenStartedWithLayer(this.oRta, "VENDOR");
			whenHigherLayerChangesExist();
			whenUserConfirmsMessage.call(this, "MSG_RELOAD_WITH_ALL_CHANGES", assert);

			return this.oRta._handleReloadOnExit().then(function(sShouldReload) {
				assert.strictEqual(this.fnEnableRestartSpy.callCount,
					0,
					"then RTA restart will not be enabled");
				assert.strictEqual(sShouldReload, this.oRta._RESTART.VIA_HASH,
					"then the page is reloaded");
			}.bind(this));
		});

		QUnit.test("when app descriptor and personalized changes exist and user exits reloading the personalization...", function(assert) {
			givenMaxLayerParameterIsSetTo.call(this, "CUSTOMER", this.fnFLPToExternalStub);
			whenAppDescriptorChangesExist(this.oRta);
			whenHigherLayerChangesExist();

			whenUserConfirmsMessage.call(this, "MSG_RELOAD_WITH_PERSONALIZATION", assert);

			return this.oRta._handleReloadOnExit().then(function(sShouldReload) {
				assert.strictEqual(this.fnEnableRestartSpy.callCount, 0,
					"then RTA restart will not be enabled");
				assert.strictEqual(sShouldReload, this.oRta._RESTART.RELOAD_PAGE,
					"then the reload page is triggered to update the flp cache");
			}.bind(this));
		});

		QUnit.test("when no app descriptor changes exist at first save and later they exist and user exits ...", function(assert) {
			this.oRta._oSerializer = {
				needsReload : function(bReload) {
					return Promise.resolve(bReload);
				},
				saveCommands : function() {
					return;
				}
			};
			var fnNeedsReloadStub = sandbox.stub(this.oRta._oSerializer, "needsReload");
			fnNeedsReloadStub.onFirstCall().resolves(false);
			fnNeedsReloadStub.onSecondCall().resolves(true);

			whenUserConfirmsMessage.call(this, "MSG_RELOAD_NEEDED", assert);

			return this.oRta._serializeToLrep()
				.then(this.oRta._handleReloadOnExit.bind(this.oRta))
				.then(function(sShouldReload) {
					assert.strictEqual(this.fnEnableRestartSpy.callCount, 0,
						"then RTA restart will not be enabled");
					assert.strictEqual(fnNeedsReloadStub.callCount, 2,
						"then the reload check is called once");
					assert.strictEqual(sShouldReload, this.oRta._RESTART.RELOAD_PAGE,
						"then the reload page is triggered to update the flp cache");
				}.bind(this));
		});

		QUnit.test("when app descriptor changes exist and user publishes and afterwards exits ...", function(assert) {
			givenMaxLayerParameterIsSetTo.call(this, "CUSTOMER", this.fnFLPToExternalStub);
			whenAppDescriptorChangesExist(this.oRta);
			var fnNeedsReloadSpy = sandbox.spy(this.oRta._oSerializer, "needsReload");

			whenUserConfirmsMessage.call(this, "MSG_RELOAD_NEEDED", assert);

			return this.oRta._serializeToLrep()
				.then(this.oRta._handleReloadOnExit.bind(this.oRta))
				.then(function(sShouldReload) {
					assert.strictEqual(this.fnEnableRestartSpy.callCount, 0,
						"then RTA restart will not be enabled");
					assert.strictEqual(fnNeedsReloadSpy.callCount, 1,
						"then the reload check is called once");
					assert.strictEqual(sShouldReload, this.oRta._RESTART.RELOAD_PAGE,
						"then the reload page is triggered to update the flp cache");
				}.bind(this));
		});

		QUnit.test("when app descriptor changes exist and user exits ...", function(assert) {
			givenMaxLayerParameterIsSetTo.call(this, "CUSTOMER", this.fnFLPToExternalStub);
			whenAppDescriptorChangesExist(this.oRta);
			var fnNeedsReloadSpy = sandbox.spy(this.oRta._oSerializer, "needsReload");

			whenUserConfirmsMessage.call(this, "MSG_RELOAD_NEEDED", assert);

			return this.oRta._handleReloadOnExit()
				.then(function(sShouldReload) {
					assert.strictEqual(this.fnEnableRestartSpy.callCount, 0,
						"then RTA restart will not be enabled");
					assert.strictEqual(fnNeedsReloadSpy.callCount, 1,
						"then the reload check is called once");
					assert.strictEqual(sShouldReload, this.oRta._RESTART.RELOAD_PAGE,
						"then the reload page is triggered to update the flp cache");
				}.bind(this));
		});

		QUnit.test("when there are no personalized and appDescriptor changes and _handleReloadOnExit() is called", function(assert) {
			givenMaxLayerParameterIsSetTo.call(this, "CUSTOMER", this.fnFLPToExternalStub);
			whenNoHigherLayerChangesExist();

			return this.oRta._handleReloadOnExit().then(function(sShouldReload) {
				assert.strictEqual(this.fnEnableRestartSpy.callCount,
					0,
					"then RTA restart will not be enabled");
				assert.strictEqual(sShouldReload, this.oRta._RESTART.NOT_NEEDED,
					"then the reload page is not necessary");
			}.bind(this));
		});

		QUnit.test("when app descriptor and no personalized changes exist and user exits reloading the personalization...", function(assert) {
			givenMaxLayerParameterIsSetTo.call(this, "CUSTOMER", this.fnFLPToExternalStub);
			whenAppDescriptorChangesExist(this.oRta);
			whenNoHigherLayerChangesExist();

			whenUserConfirmsMessage.call(this, "MSG_RELOAD_NEEDED", assert);

			return this.oRta._handleReloadOnExit().then(function(sShouldReload) {
				assert.strictEqual(this.fnEnableRestartSpy.callCount,
					0,
					"then RTA restart will not be enabled");
				assert.strictEqual(sShouldReload, this.oRta._RESTART.RELOAD_PAGE,
						"then the reload page is triggered to update the flp cache");
			}.bind(this));
		});

		QUnit.test("when reloadable changes exist and user exits RTA...", function(assert) {
			givenMaxLayerParameterIsSetTo.call(this, "CUSTOMER", this.fnFLPToExternalStub);
			sandbox.stub(this.oRta, "_handleReloadOnExit").resolves(this.oRta._RESTART.RELOAD_PAGE);
			sandbox.stub(this.oRta, "_serializeToLrep").resolves();

			return this.oRta.stop().then(function() {
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
			this.fnReloadWithHigherLayerChangesSpy =
				sandbox.spy(this.oRta, "_removeMaxLayerParameter");
			this.fnReloadWithoutHigherLayerChangesSpy =
				sandbox.spy(this.oRta, "_reloadWithMaxLayerOrDraftParam");
			this.fnReloadPageStub =
				sandbox.stub(this.oRta, "_reloadPage");
		},
		afterEach : function() {
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when the _determineReload() method is called", function(assert) {
			return this.oRta._determineReload().then(function() {
				assert.strictEqual(this.fnEnableRestartSpy.callCount, 0, "then RTA restart will not be enabled");
				assert.strictEqual(this.fnReloadWithHigherLayerChangesSpy.callCount,
					0,
					"then removeMaxLayerParameter() is not called");
			}.bind(this));
		});

		QUnit.test("when the _handleReloadOnExit() method is called", function(assert) {
			return this.oRta._handleReloadOnExit().then(function() {
				assert.strictEqual(this.fnEnableRestartSpy.callCount, 0, "then RTA restart will not be enabled");
				assert.strictEqual(this.fnReloadWithoutHigherLayerChangesSpy.callCount,
					0,
					"then reloadWithoutHigherLayerChanges() is not called");
			}.bind(this));
		});

		QUnit.test("when _handleReloadOnExit() is called and personalized changes and user exits reloading the personalization...", function(assert) {
			whenHigherLayerChangesExist();
			whenUserConfirmsMessage.call(this, "MSG_RELOAD_WITH_PERSONALIZATION", assert);

			return this.oRta._handleReloadOnExit().then(function(sShouldReload) {
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
	});

	QUnit.module("Given that RuntimeAuthoring wants to determine if a reload is needed", {
		beforeEach: function() {
			sandbox.stub(FlexUtils, "getUshellContainer").returns({
				getService: function () {
					return {
						toExternal: true,
						parseShellHash: function () {
							return {params: {}};
						}
					};
				}
			});
			this.oRootControl = oCompCont.getComponentInstance().getAggregation("rootControl");
			this.oRta = new RuntimeAuthoring({
				rootControl : this.oRootControl,
				showToolbars : false
			});
			this.oReloadInfo = {
				hasHigherLayerChanges: false,
				hasDraftChanges: true,
				layer: this.oRta.getLayer(),
				selector: this.oRta.getRootControlInstance(),
				ignoreMaxLayerParameter: false
			};
			this.mParsedHash = {params: {}};
		},
		afterEach: function() {
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("and versioning is available,", function(assert) {
			sandbox.stub(FlexUtils, "getParsedURLHash").returns(this.mParsedHash);

			var oHasParameterSpy = sandbox.spy(this.oRta, "_hasParameter");
			var oHasHigherLayerChangesSpy = sandbox.spy(PersistenceWriteAPI, "hasHigherLayerChanges");
			var oHandleReloadMessageBoxOnStart = sandbox.stub(this.oRta, "_handleReloadMessageBoxOnStart").returns(Promise.resolve());
			var oReloadWithoutHigherLayerOrDraftChangesOnStart = sandbox.stub(this.oRta, "_reloadWithMaxLayerOrDraftParam").returns(Promise.resolve());
			var oIsDraftAvailableStub = sandbox.stub(VersionsAPI, "isDraftAvailable").returns(true);
			sandbox.stub(this.oRta, "_isVersioningEnabled").returns(Promise.resolve(true));

			return this.oRta._determineReload().then(function () {
				assert.equal(oIsDraftAvailableStub.callCount, 1, "then isDraftAvailable is called once");

				assert.equal(oHasParameterSpy.callCount, 2, "then _hasParameter is called twice");
				assert.equal(oHasParameterSpy.lastCall.args[0], this.mParsedHash, "then _hasParameter is called with the parsed hash");

				assert.equal(oHasHigherLayerChangesSpy.callCount, 1, "then hasHigherLayerChanges is called once");
				assert.deepEqual(oHasHigherLayerChangesSpy.lastCall.args[0], {
					selector: this.oReloadInfo.selector,
					ignoreMaxLayerParameter: this.oReloadInfo.ignoreMaxLayerParameter
				}, "then hasHigherLayerChanges is called with the correct parameters");

				assert.equal(oHandleReloadMessageBoxOnStart.callCount, 1, "then _handleReloadMessageBoxOnStart is called once");
				assert.deepEqual(oHandleReloadMessageBoxOnStart.lastCall.args[0], this.oReloadInfo, "then _handleReloadMessageBoxOnStart is called with the correct reload info");

				assert.equal(oReloadWithoutHigherLayerOrDraftChangesOnStart.callCount, 1, "then _reloadWithMaxLayerOrDraftParam is called once");

				var oReloadTriggerCallArguments = oReloadWithoutHigherLayerOrDraftChangesOnStart.lastCall.args;
				assert.deepEqual(oReloadTriggerCallArguments[0], this.mParsedHash, "then _reloadWithMaxLayerOrDraftParam is called with the parsed hash");
				assert.deepEqual(oReloadTriggerCallArguments[2], this.oReloadInfo, "then _reloadWithMaxLayerOrDraftParam is called with the correct reload info");
			}.bind(this));
		});

		QUnit.test("and versioning is not available,", function(assert) {
			sandbox.stub(FlexUtils, "getParsedURLHash").returns(this.mParsedHash);
			var oIsDraftAvailableStub = sandbox.stub(VersionsAPI, "isDraftAvailable");

			var oHasParameterSpy = sandbox.spy(this.oRta, "_hasParameter");
			var oHandleReloadMessageBoxOnStart = sandbox.stub(this.oRta, "_handleReloadMessageBoxOnStart").returns(Promise.resolve());
			var oReloadWithoutHigherLayerOrDraftChangesOnStart = sandbox.stub(this.oRta, "_reloadWithMaxLayerOrDraftParam").returns(Promise.resolve());
			sandbox.stub(this.oRta, "_isVersioningEnabled").returns(Promise.resolve(false));

			return this.oRta._determineReload().then(function () {
				assert.equal(oIsDraftAvailableStub.callCount, 0, "then isDraftAvailable is not called");

				assert.equal(oHasParameterSpy.callCount, 2, "then _hasParameter is called twice");
				assert.deepEqual(oHasParameterSpy.lastCall.args[0], this.mParsedHash, "then _hasParameter is called with the parsed hash");

				assert.equal(oHandleReloadMessageBoxOnStart.callCount, 0, "then _handleReloadMessageBoxOnStart is not called");

				assert.equal(oReloadWithoutHigherLayerOrDraftChangesOnStart.callCount, 0, "then _reloadWithMaxLayerOrDraftParam is not called");
			}.bind(this));
		});
	});

	QUnit.done(function() {
		oComp.destroy();
		jQuery("#qunit-fixture").hide();
	});
});
