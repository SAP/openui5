/* global QUnit */

sap.ui.define([
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/dt/plugin/ContextMenu",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/util/ZIndexManager",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/Layer",
	"sap/base/Log",
	"sap/ui/fl/Utils",
	"sap/ui/rta/Utils",
	"sap/ui/rta/RuntimeAuthoring",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/rta/plugin/Remove",
	"qunit/RtaQunitUtils",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/fl/write/api/VersionsAPI",
	"sap/ui/thirdparty/sinon-4"
], function (
	MessageBox,
	MessageToast,
	ContextMenuPlugin,
	DesignTime,
	ZIndexManager,
	Settings,
	Layer,
	Log,
	FlexUtils,
	RtaFlexUtils,
	RuntimeAuthoring,
	CommandFactory,
	Remove,
	RtaQunitUtils,
	PersistenceWriteAPI,
	VersionsAPI,
	sinon
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

	function givenDraftParameterIsSetTo(sDraftLayer, fnFLPToExternalStub) {
		givenAnFLP.call(this, fnFLPToExternalStub, {
			"sap-ui-fl-version" : [sDraftLayer]
		});
	}

	function givenNoParameterIsSet(fnFLPToExternalStub) {
		givenAnFLP.call(this, fnFLPToExternalStub, {
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

	function isReloadedWithDraftParameter(fnFLPToExternalStub) {
		if (!fnFLPToExternalStub.lastCall) {
			return false;
		}
		var mFLPArgs = fnFLPToExternalStub.lastCall.args[0];
		return !!mFLPArgs.params["sap-ui-fl-version"];
	}

	function isReloadedWithDraftFalseParameter(fnFLPToExternalStub) {
		if (!fnFLPToExternalStub.lastCall) {
			return false;
		}
		var mFLPArgs = fnFLPToExternalStub.lastCall.args[0];
		return mFLPArgs.params &&
			mFLPArgs.params["sap-ui-fl-version"] &&
			mFLPArgs.params["sap-ui-fl-version"][0] === "false" || false;
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
				assert.equal(this.oLogStub.callCount, 1, "and an error is logged");
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
			RuntimeAuthoring.disableRestart(Layer.CUSTOMER);
			RuntimeAuthoring.disableRestart(Layer.VENDOR);
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when there are higher layer (e.g personalization) changes during startup", function(assert) {
			whenHigherLayerChangesExist();

			whenUserConfirmsMessage.call(this, "MSG_PERSONALIZATION_EXISTS", assert);

			return this.oRta._determineReload().then(function() {
				assert.equal(this.fnEnableRestartSpy.calledOnce,
					true,
					"then enableRestart() is called only once");
				assert.equal(this.fnEnableRestartSpy.calledWith(Layer.CUSTOMER),
					true,
					"then enableRestart() is called with the correct parameter");
				assert.equal(isReloadedWithMaxLayerParameter(this.fnFLPToExternalStub),
					true,
					"then the reload inside FLP is triggered");
			}.bind(this));
		});
		QUnit.test("when there are customer changes and currentLayer is VENDOR during startup", function(assert) {
			whenStartedWithLayer(this.oRta, Layer.VENDOR);
			whenHigherLayerChangesExist();
			whenUserConfirmsMessage.call(this, "MSG_HIGHER_LAYER_CHANGES_EXIST", assert);

			return this.oRta._determineReload().then(function() {
				assert.equal(this.fnEnableRestartSpy.calledOnce,
					true,
					"then enableRestart() is called only once");
				assert.equal(this.fnEnableRestartSpy.calledWith(Layer.VENDOR),
					true,
					"then enableRestart() is called with the correct parameter");
				assert.equal(isReloadedWithMaxLayerParameter(this.fnFLPToExternalStub),
					true,
					"then the reload inside FLP is triggered");
			}.bind(this));
		});

		QUnit.test("when no personalized changes and _determineReload() is called", function(assert) {
			whenNoHigherLayerChangesExist();

			return this.oRta._determineReload().then(function() {
				assert.equal(this.fnEnableRestartSpy.callCount,
					0,
					"then RTA restart will not be enabled");
				assert.equal(isReloadedWithMaxLayerParameter(this.fnFLPToExternalStub),
					false,
					"then the reload inside FLP is not triggered");
			}.bind(this));
		});

		QUnit.test("when RTA is started and _determineReload returns true", function(assert) {
			assert.expect(4);
			sandbox.stub(this.oRta, "_determineReload").resolves(true);
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

	QUnit.module("Given that RTA gets started in FLP", {
		beforeEach : function() {
			this.oRta = new RuntimeAuthoring({
				rootControl : oCompCont.getComponentInstance().getAggregation("rootControl"),
				showToolbars : false
			});
			whenNoAppDescriptorChangesExist(this.oRta);
			this.fnEnableRestartSpy = sandbox.spy(RuntimeAuthoring, "enableRestart");
			this.fnReloadPageStub = sandbox.stub(this.oRta, "_reloadPage");
			this.fnHandleParametersOnExitSpy = sandbox.spy(this.oRta, "_handleParametersOnExit");
			this.fnFLPToExternalStub = sandbox.spy();
		},
		afterEach : function() {
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when draft changes are available, RTA is started and user exists", function(assert) {
			sandbox.stub(PersistenceWriteAPI, "hasHigherLayerChanges").resolves(false);
			sandbox.stub(this.oRta, "_isDraftAvailable").returns(true);
			sandbox.stub(FlexUtils, "getUshellContainer").returns({
				getService: function () {
					return {
						toExternal: function() {
							return true;
						},
						parseShellHash: function () {
							return {
								params: {
									"sap-ui-fl-version": [Layer.CUSTOMER]
								}
							};
						}
					};
				}
			});
			whenUserConfirmsMessage.call(this, "MSG_RELOAD_WITHOUT_DRAFT", assert);

			return this.oRta._handleReloadOnExit().then(function(sShouldReload) {
				assert.equal(this.fnEnableRestartSpy.callCount, 0,
					"then RTA restart will not be enabled");
				assert.strictEqual(sShouldReload, this.oRta._RESTART.VIA_HASH,
					"then the correct reload reason is triggered");
			}.bind(this));
		});

		QUnit.test("when draft changes already existed when entering and user exits RTA...", function(assert) {
			givenDraftParameterIsSetTo.call(this, Layer.CUSTOMER, this.fnFLPToExternalStub);
			sandbox.stub(this.oRta, "_handleReloadOnExit").resolves(this.oRta._RESTART.VIA_HASH);
			sandbox.stub(this.oRta, "_serializeToLrep").resolves();

			return this.oRta.stop().then(function() {
				assert.equal(this.fnHandleParametersOnExitSpy.callCount,
					1,
					"then crossAppNavigation was triggered");
				assert.equal(isReloadedWithDraftParameter(this.fnFLPToExternalStub),
					false,
					"then draft parameter is removed");
			}.bind(this));
		});

		QUnit.test("when draft changes already existed and the draft was activated and user exits RTA...", function(assert) {
			givenDraftParameterIsSetTo.call(this, Layer.CUSTOMER, this.fnFLPToExternalStub);
			sandbox.stub(this.oRta, "_serializeToLrep").resolves();
			sandbox.stub(this.oRta, "_handleReloadMessageBoxOnExit").resolves();

			return this.oRta.stop().then(function() {
				assert.equal(this.fnHandleParametersOnExitSpy.callCount,
					1,
					"then crossAppNavigation was triggered");
				assert.equal(isReloadedWithDraftParameter(this.fnFLPToExternalStub),
					false,
					"then draft parameter is removed");
			}.bind(this));
		});

		QUnit.test("when no draft was present and dirty changes were made after entering RTA and user exits RTA...", function(assert) {
			givenNoParameterIsSet.call(this, this.fnFLPToExternalStub);
			sandbox.stub(this.oRta, "_handleReloadOnExit").resolves(this.oRta._RESTART.VIA_HASH);
			sandbox.stub(this.oRta, "_serializeToLrep").resolves();
			sandbox.stub(this.oRta, "_isDraftAvailable").returns(true);

			return this.oRta.stop().then(function() {
				assert.equal(this.fnHandleParametersOnExitSpy.callCount,
					1, "then crossAppNavigation was triggered");
				assert.equal(isReloadedWithDraftFalseParameter(this.fnFLPToExternalStub),
					true, "then draft parameter is set to false");
			}.bind(this));
		});

		QUnit.test("when no versioning is available and dirty changes were made after entering RTA and user exits RTA...", function(assert) {
			givenNoParameterIsSet.call(this, this.fnFLPToExternalStub);
			sandbox.stub(this.oRta, "_handleReloadOnExit").resolves(this.oRta._RESTART.VIA_HASH);
			sandbox.stub(this.oRta, "_serializeToLrep").resolves();
			sandbox.stub(this.oRta, "_isDraftAvailable").returns(false);

			return this.oRta.stop().then(function() {
				assert.equal(this.fnHandleParametersOnExitSpy.callCount,
					1, "then crossAppNavigation was triggered");
				assert.equal(isReloadedWithDraftFalseParameter(this.fnFLPToExternalStub),
					false, "then draft parameter is not set");
			}.bind(this));
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
			givenMaxLayerParameterIsSetTo.call(this, Layer.CUSTOMER, this.fnFLPToExternalStub);
			whenHigherLayerChangesExist();

			whenUserConfirmsMessage.call(this, "MSG_RELOAD_WITH_PERSONALIZATION", assert);

			return this.oRta._handleReloadOnExit().then(function(sShouldReload) {
				assert.equal(this.fnEnableRestartSpy.callCount,
					0,
					"then RTA restart will not be enabled");
				assert.strictEqual(sShouldReload, this.oRta._RESTART.VIA_HASH,
					"then the page is reloaded");
			}.bind(this));
		});

		QUnit.test("when higher layer changes exist, RTA is started above CUSTOMER layer and user exits and started in FLP reloading the personalization...", function(assert) {
			givenMaxLayerParameterIsSetTo.call(this, Layer.VENDOR, this.fnFLPToExternalStub);
			whenStartedWithLayer(this.oRta, Layer.VENDOR);
			whenHigherLayerChangesExist();
			whenUserConfirmsMessage.call(this, "MSG_RELOAD_WITH_ALL_CHANGES", assert);

			return this.oRta._handleReloadOnExit().then(function(sShouldReload) {
				assert.equal(this.fnEnableRestartSpy.callCount,
					0,
					"then RTA restart will not be enabled");
				assert.strictEqual(sShouldReload, this.oRta._RESTART.VIA_HASH,
					"then the page is reloaded");
			}.bind(this));
		});

		QUnit.test("when app descriptor and personalized changes exist and user exits reloading the personalization...", function(assert) {
			givenMaxLayerParameterIsSetTo.call(this, Layer.CUSTOMER, this.fnFLPToExternalStub);
			whenAppDescriptorChangesExist(this.oRta);
			whenHigherLayerChangesExist();

			whenUserConfirmsMessage.call(this, "MSG_RELOAD_WITH_PERSONALIZATION", assert);

			return this.oRta._handleReloadOnExit().then(function(sShouldReload) {
				assert.equal(this.fnEnableRestartSpy.callCount, 0,
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
				assert.equal(this.fnEnableRestartSpy.callCount, 0,
					"then RTA restart will not be enabled");
				assert.equal(fnNeedsReloadStub.callCount, 2,
					"then the reload check is called once");
				assert.strictEqual(sShouldReload, this.oRta._RESTART.RELOAD_PAGE,
					"then the reload page is triggered to update the flp cache");
			}.bind(this));
		});

		QUnit.test("when app descriptor changes exist and user publishes and afterwards exits ...", function(assert) {
			givenMaxLayerParameterIsSetTo.call(this, Layer.CUSTOMER, this.fnFLPToExternalStub);
			whenAppDescriptorChangesExist(this.oRta);
			var fnNeedsReloadSpy = sandbox.spy(this.oRta._oSerializer, "needsReload");

			whenUserConfirmsMessage.call(this, "MSG_RELOAD_NEEDED", assert);

			return this.oRta._serializeToLrep()
			.then(this.oRta._handleReloadOnExit.bind(this.oRta))
			.then(function(sShouldReload) {
				assert.equal(this.fnEnableRestartSpy.callCount, 0,
					"then RTA restart will not be enabled");
				assert.equal(fnNeedsReloadSpy.callCount, 1,
					"then the reload check is called once");
				assert.strictEqual(sShouldReload, this.oRta._RESTART.RELOAD_PAGE,
					"then the reload page is triggered to update the flp cache");
			}.bind(this));
		});

		QUnit.test("when app descriptor changes exist and user exits ...", function(assert) {
			givenMaxLayerParameterIsSetTo.call(this, Layer.CUSTOMER, this.fnFLPToExternalStub);
			whenAppDescriptorChangesExist(this.oRta);
			var fnNeedsReloadSpy = sandbox.spy(this.oRta._oSerializer, "needsReload");

			whenUserConfirmsMessage.call(this, "MSG_RELOAD_NEEDED", assert);

			return this.oRta._handleReloadOnExit()
			.then(function(sShouldReload) {
				assert.equal(this.fnEnableRestartSpy.callCount, 0,
					"then RTA restart will not be enabled");
				assert.equal(fnNeedsReloadSpy.callCount, 1,
					"then the reload check is called once");
				assert.strictEqual(sShouldReload, this.oRta._RESTART.RELOAD_PAGE,
					"then the reload page is triggered to update the flp cache");
			}.bind(this));
		});

		QUnit.test("when there are no personalized and appDescriptor changes and _handleReloadOnExit() is called", function(assert) {
			givenMaxLayerParameterIsSetTo.call(this, Layer.CUSTOMER, this.fnFLPToExternalStub);
			whenNoHigherLayerChangesExist();

			return this.oRta._handleReloadOnExit().then(function(sShouldReload) {
				assert.equal(this.fnEnableRestartSpy.callCount,
					0,
					"then RTA restart will not be enabled");
				assert.strictEqual(sShouldReload, this.oRta._RESTART.NOT_NEEDED,
					"then the reload page is not necessary");
			}.bind(this));
		});

		QUnit.test("when app descriptor and no personalized changes exist and user exits reloading the personalization...", function(assert) {
			givenMaxLayerParameterIsSetTo.call(this, Layer.CUSTOMER, this.fnFLPToExternalStub);
			whenAppDescriptorChangesExist(this.oRta);
			whenNoHigherLayerChangesExist();

			whenUserConfirmsMessage.call(this, "MSG_RELOAD_NEEDED", assert);

			return this.oRta._handleReloadOnExit().then(function(sShouldReload) {
				assert.equal(this.fnEnableRestartSpy.callCount,
					0,
					"then RTA restart will not be enabled");
				assert.strictEqual(sShouldReload, this.oRta._RESTART.RELOAD_PAGE,
					"then the reload page is triggered to update the flp cache");
			}.bind(this));
		});

		QUnit.test("when reloadable changes exist and user exits RTA...", function(assert) {
			givenMaxLayerParameterIsSetTo.call(this, Layer.CUSTOMER, this.fnFLPToExternalStub);
			sandbox.stub(this.oRta, "_handleReloadOnExit").resolves(this.oRta._RESTART.RELOAD_PAGE);
			sandbox.stub(this.oRta, "_serializeToLrep").resolves();

			return this.oRta.stop().then(function() {
				assert.equal(this.fnReloadPageStub.callCount,
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
			this.fnHandleParametersOnExitSpy =
				sandbox.spy(this.oRta, "_handleParametersOnExit");
			this.fnReloadWithMaxLayerOrDraftParam =
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
				assert.equal(this.fnEnableRestartSpy.callCount, 0, "then RTA restart will not be enabled");
				assert.equal(this.fnHandleParametersOnExitSpy.callCount,
					0,
					"then _handleParametersOnExit() is not called");
			}.bind(this));
		});

		QUnit.test("when the _handleReloadOnExit() method is called", function(assert) {
			return this.oRta._handleReloadOnExit().then(function() {
				assert.equal(this.fnEnableRestartSpy.callCount, 0, "then RTA restart will not be enabled");
				assert.equal(this.fnReloadWithMaxLayerOrDraftParam.callCount,
					0,
					"then _reloadWithMaxLayerOrDraftParam() is not called");
			}.bind(this));
		});

		QUnit.test("when _handleReloadOnExit() is called and personalized changes and user exits reloading the personalization...", function(assert) {
			whenHigherLayerChangesExist();
			whenUserConfirmsMessage.call(this, "MSG_RELOAD_WITH_PERSONALIZATION", assert);

			return this.oRta._handleReloadOnExit().then(function(sShouldReload) {
				assert.equal(this.fnEnableRestartSpy.callCount, 0,
					"then RTA restart will not be enabled");
				assert.strictEqual(sShouldReload, this.oRta._RESTART.RELOAD_PAGE,
					"then the page is reloaded");
			}.bind(this));
		});

		QUnit.test("when _handleReloadOnExit() is called and draft changes are available", function(assert) {
			sandbox.stub(PersistenceWriteAPI, "hasHigherLayerChanges").resolves(false);
			sandbox.stub(this.oRta, "_isDraftAvailable").returns(true);

			whenUserConfirmsMessage.call(this, "MSG_RELOAD_WITHOUT_DRAFT", assert);

			return this.oRta._handleReloadOnExit().then(function(sShouldReload) {
				assert.equal(this.fnEnableRestartSpy.callCount, 0,
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
				isProductiveSystem: true,
				versioning: {}
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
				isProductiveSystem: false,
				versioning: {}
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
			sandbox.stub(FlexUtils, "getUshellContainer").returns({
				getService: function () {
					return {
						toExternal: function() {
							return true;
						},
						parseShellHash: function () {
							return {
								params: {
									"sap-ui-fl-version": [Layer.CUSTOMER]
								}
							};
						}
					};
				}
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

		QUnit.test("when _onActivateDraft is called ", function(assert) {
			var oActivateDraftStub;
			var oShowMessageToastStub;
			var oRemoveAllCommandsSpy;
			var oSetVersionLabelStub;
			var oToolbarSetDraftEnabledSpy;
			var oToolbarSetRestoreEnabledSpy;
			var oRta = this.oRta;
			var sVersionTitle = "aVersionTitle";
			var oEvent = {
				getParameter: function() {
					return sVersionTitle;
				}
			};

			return oRta.start().then(function () {
				oRta.bInitialDraftAvailable = true;
				oActivateDraftStub = sandbox.stub(VersionsAPI, "activateDraft").resolves(true);
				oShowMessageToastStub = sandbox.stub(oRta, "_showMessageToast");
				oRemoveAllCommandsSpy = sandbox.spy(oRta.getCommandStack(), "removeAllCommands");
				oSetVersionLabelStub = sandbox.stub(oRta, "_setVersionLabel");
				oToolbarSetDraftEnabledSpy = sandbox.spy(oRta.getToolbar(), "setDraftEnabled");
				oToolbarSetRestoreEnabledSpy = sandbox.spy(oRta.getToolbar(), "setRestoreEnabled");
			})
			.then(oRta._onActivateDraft.bind(oRta, oEvent))
			.then(function() {
				assert.equal(oActivateDraftStub.callCount, 1, "then the activateDraft() method is called once");
				var oActivationCallPropertyBag = oActivateDraftStub.getCall(0).args[0];
				assert.equal(oActivationCallPropertyBag.selector, this.oRta.getRootControlInstance(), "with the correct selector");
				assert.equal(oActivationCallPropertyBag.layer, this.oRta.getLayer(), "and layer");
				assert.equal(oActivationCallPropertyBag.title, sVersionTitle, "and version title");
				assert.equal(oRemoveAllCommandsSpy.callCount, 1, "and all commands were removed");
				assert.equal(oRta.bInitialDraftAvailable, false, "and the initialDraftAvailable is removed");
				assert.equal(oToolbarSetDraftEnabledSpy.callCount, 1, "and the draft info is set once");
				assert.equal(oToolbarSetDraftEnabledSpy.getCall(0).args[0], false, "to false");
				assert.equal(oToolbarSetRestoreEnabledSpy.callCount, 2, "and the restore enabled is called again");
				assert.equal(oToolbarSetRestoreEnabledSpy.getCall(1).args[0], true, "to true");
				assert.equal(oShowMessageToastStub.callCount, 1, "and a message is shown");
				assert.equal(oSetVersionLabelStub.callCount, 1, "and set version title is called");
			}.bind(this));
		});

		QUnit.test("when _onDiscardDraft is called ", function(assert) {
			var oDiscardDraftStub;
			var oHandleDiscardDraftStub;
			var oHandleDraftParameterStub;
			var oRemoveAllCommandsSpy;
			var oStopSpy;
			var oRta = this.oRta;
			var mParsedHash = {
				params: {
					"sap-ui-fl-version": [Layer.CUSTOMER]
				}
			};

			var done = assert.async();

			sandbox.stub(MessageBox, "confirm").callsFake(function(sMessage, mParameters) {
				assert.equal(sMessage, this.oRta._getTextResources().getText("MSG_DRAFT_DISCARD_DIALOG"), "then the message is correct");
				mParameters.onClose("OK");
				assert.equal(oDiscardDraftStub.callCount, 1, "then the discardDraft() method is called once");
				assert.equal(oHandleDiscardDraftStub.callCount, 1, "then _handleDiscard was called");
				assert.equal(oHandleDraftParameterStub.callCount, 1, "then _handleDraftParameter was called");
				assert.equal(oHandleDraftParameterStub.getCall(0).args[0], mParsedHash, "then _handleDraftParameter was called with the correct parameters");

				mParameters.onClose("notOK");
				assert.equal(oDiscardDraftStub.callCount, 1, "then _handleDiscard was not called again");
				assert.equal(oHandleDraftParameterStub.callCount, 1, "then _handleDraftParameter was not called again");
				done();
			}.bind(this));

			sandbox.stub(oRta, "_isDraftAvailable").returns(true);
			sandbox.stub(FlexUtils, "getParsedURLHash").returns(mParsedHash);

			return oRta.start().then(function () {
				oRta.bInitialDraftAvailable = true;
				oDiscardDraftStub = sandbox.stub(VersionsAPI, "discardDraft").resolves(true);
				oRemoveAllCommandsSpy = sandbox.spy(oRta.getCommandStack(), "removeAllCommands");
				oHandleDiscardDraftStub = sandbox.spy(oRta, "_handleDiscard");
				oHandleDraftParameterStub = sandbox.spy(oRta, "_handleDraftParameter");
				oStopSpy = sandbox.spy(oRta, "stop");
			})
			.then(oRta._onDiscardDraft.bind(oRta, false))
			.then(function() {
				var oDiscardCallPropertyBag = oDiscardDraftStub.getCall(0).args[0];
				assert.equal(oDiscardCallPropertyBag.selector, this.oRta.getRootControlInstance(), "with the correct selector");
				assert.equal(oDiscardCallPropertyBag.layer, this.oRta.getLayer(), "and layer");
				assert.equal(oRemoveAllCommandsSpy.callCount, 1, "and all commands were removed");
				assert.equal(oStopSpy.callCount, 1, "then stop was called");
			}.bind(this));
		});
	});

	function _mockStateCallIsDraftAvailableAndCheckResult(assert, oRta, bIsVersioningEnabled, bIsDraftAvailable, bCanUndo, bExpectedResult) {
		oRta._bVersioningEnabled = bIsVersioningEnabled;
		sandbox.stub(VersionsAPI, "isDraftAvailable").returns(bIsDraftAvailable);
		sandbox.stub(oRta, "canUndo").returns(bCanUndo);
		assert.equal(oRta._isDraftAvailable(), bExpectedResult);
	}

	QUnit.module("Given that RuntimeAuthoring wants to determine if a draft is available", {
		beforeEach: function() {
			this.oRootControl = oCompCont.getComponentInstance().getAggregation("rootControl");
			this.oRta = new RuntimeAuthoring({
				rootControl : this.oRootControl,
				showToolbars : false
			});
		},
		afterEach: function() {
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("and versioning is not available", function (assert) {
			return _mockStateCallIsDraftAvailableAndCheckResult(assert, this.oRta, false, false, false, false);
		});
		QUnit.test("and versioning is available but no draft and no undo is available", function (assert) {
			return _mockStateCallIsDraftAvailableAndCheckResult(assert, this.oRta, true, false, false, false);
		});
		QUnit.test("and versioning and a draft is available", function (assert) {
			return _mockStateCallIsDraftAvailableAndCheckResult(assert, this.oRta, true, true, false, true);
		});
		QUnit.test("and versioning and a undo is available", function (assert) {
			return _mockStateCallIsDraftAvailableAndCheckResult(assert, this.oRta, true, false, true, true);
		});
		QUnit.test("and versioning, a draft and undo is available", function (assert) {
			return _mockStateCallIsDraftAvailableAndCheckResult(assert, this.oRta, true, true, true, true);
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
		QUnit.test("and versioning is available and a draft is available,", function(assert) {
			sandbox.stub(FlexUtils, "getParsedURLHash").returns(this.mParsedHash);

			var oHasParameterSpy = sandbox.spy(this.oRta, "_hasParameter");
			var oHasHigherLayerChangesSpy = sandbox.spy(PersistenceWriteAPI, "hasHigherLayerChanges");
			var oHandleReloadMessageBoxOnStart = sandbox.stub(this.oRta, "_handleReloadMessageBoxOnStart").returns(Promise.resolve());
			var oReloadWithoutHigherLayerOrDraftChangesOnStart = sandbox.stub(this.oRta, "_reloadWithMaxLayerOrDraftParam").returns(Promise.resolve());
			var oIsDraftAvailableStub = sandbox.stub(VersionsAPI, "isDraftAvailable").returns(true);
			this.oRta._bVersioningEnabled = true;

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
			this.oRta._bVersioningEnabled = false;

			return this.oRta._determineReload().then(function () {
				assert.equal(oIsDraftAvailableStub.callCount, 0, "then isDraftAvailable is not called");

				assert.equal(oHasParameterSpy.callCount, 2, "then _hasParameter is called twice");
				assert.deepEqual(oHasParameterSpy.lastCall.args[0], this.mParsedHash, "then _hasParameter is called with the parsed hash");

				assert.equal(oHandleReloadMessageBoxOnStart.callCount, 0, "then _handleReloadMessageBoxOnStart is not called");

				assert.equal(oReloadWithoutHigherLayerOrDraftChangesOnStart.callCount, 0, "then _reloadWithMaxLayerOrDraftParam is not called");
			}.bind(this));
		});
	});
	QUnit.module("Given that a CrossAppNavigation is needed because of a draft", {
		beforeEach: function() {
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
			this.oCrossAppNav = {
				toExternal: function() {
					return Promise.resolve(true);
				}
			};
		},
		afterEach: function() {
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("and the url parameter for draft is present in the parsed hash", function(assert) {
			var mParsedHash = {
				params: {
					"sap-ui-fl-version": [Layer.CUSTOMER]
				}
			};

			var oLoadForApplicationStub = sandbox.stub(VersionsAPI, "loadDraftForApplication");
			var fnEnableRestartSpy = sandbox.spy(RuntimeAuthoring, "enableRestart");

			return this.oRta._reloadWithMaxLayerOrDraftParam(mParsedHash, this.oCrossAppNav, this.oReloadInfo).then(function () {
				assert.equal(oLoadForApplicationStub.callCount, 0, "then loadDraftForApplication is not called");
				assert.equal(fnEnableRestartSpy.callCount, 1, "the enableRestart was callCount");
				assert.equal(fnEnableRestartSpy.getCall(0).args[1], this.oRta.getRootControlInstance(), "the root control was passed");
			}.bind(this));
		});

		QUnit.test("and the url parameter for draft is not present in the parsed hash", function(assert) {
			var mParsedHash = {
				params: {
					"sap-ui-fl-parameter": ["test"]
				}
			};

			var oExpectedBag = {
				selector: this.oReloadInfo.selector,
				layer: this.oReloadInfo.layer
			};
			var oLoadForApplicationStub = sandbox.stub(VersionsAPI, "loadDraftForApplication");

			return this.oRta._reloadWithMaxLayerOrDraftParam(mParsedHash, this.oCrossAppNav, this.oReloadInfo).then(function () {
				assert.equal(oLoadForApplicationStub.callCount, 1, "then loadDraftForApplication is called once");
				assert.deepEqual(oLoadForApplicationStub.lastCall.args[0], oExpectedBag, "then _hasParameter is called with the parsed hash");
			});
		});
	});

	QUnit.module("Given that RuntimeAuthoring wants to determine if a reload is needed on exit", {
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
		QUnit.test("and a draft is available", function (assert) {
			sandbox.stub(FlexUtils, "getParsedURLHash").returns(this.mParsedHash);

			var oHasParameterSpy = sandbox.spy(this.oRta, "_hasParameter");
			var oHasHigherLayerChangesSpy = sandbox.spy(PersistenceWriteAPI, "hasHigherLayerChanges");
			var oHandleReloadMessageBoxOnStart = sandbox.stub(this.oRta, "_handleReloadMessageBoxOnStart").returns(Promise.resolve());
			var oReloadWithoutHigherLayerOrDraftChangesOnStart = sandbox.stub(this.oRta, "_reloadWithMaxLayerOrDraftParam").returns(Promise.resolve());
			var oIsDraftAvailableStub = sandbox.stub(VersionsAPI, "isDraftAvailable").returns(true);
			this.oRta._bVersioningEnabled = true;

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
	});

	QUnit.done(function() {
		oComp.destroy();
		jQuery("#qunit-fixture").hide();
	});
});
