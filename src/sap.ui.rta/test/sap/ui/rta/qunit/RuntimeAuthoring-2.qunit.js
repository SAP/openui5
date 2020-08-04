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
	"sap/ui/fl/write/api/FeaturesAPI",
	"sap/ui/fl/write/api/ReloadInfoAPI",
	"sap/ui/fl/LayerUtils",
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
	Utils,
	RuntimeAuthoring,
	CommandFactory,
	Remove,
	RtaQunitUtils,
	PersistenceWriteAPI,
	VersionsAPI,
	FeaturesAPI,
	ReloadInfoAPI,
	LayerUtils,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();
	var oCompCont = RtaQunitUtils.renderTestAppAt("qunit-fixture");
	var oComp = oCompCont.getComponentInstance();

	function givenAnFLP(fnFLPToExternalStub, mShellParams) {
		sandbox.stub(FlexUtils, "getUshellContainer").returns({
			getService: function() {
				return {
					toExternal: fnFLPToExternalStub,
					getHash: function() {
						return "Action-somestring";
					},
					parseShellHash: function() {
						var mHash = {
							semanticObject: "Action",
							action: "somestring"
						};

						if (mShellParams) {
							mHash.params = mShellParams;
						}
						return mHash;
					},
					unregisterNavigationFilter: function() {},
					registerNavigationFilter: function() {}
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
	function whenHigherLayerChangesExist(sLayer) {
		personalizationChanges(true, sLayer);
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
		sandbox.stub(Utils, "showMessageBox").callsFake(
			function(oMessageType, sMessageKey) {
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
			sandbox.stub(ReloadInfoAPI, "initialDraftGotActivated").returns(false);
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
			sandbox.stub(ReloadInfoAPI, "initialDraftGotActivated").returns(false);
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
			sandbox.stub(FeaturesAPI, "isVersioningEnabled").returns(Promise.resolve(true));
			sandbox.stub(VersionsAPI, "isDraftAvailable").returns(Promise.resolve(false));
			sandbox.stub(ReloadInfoAPI, "hasMaxLayerParameterWithValue").returns(false);

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
				assert.ok(this.oRta.getToolbar().isBusy(), "then the whole toolbar should be disabled by the busy indicator");
				done();
				return Promise.resolve(this.oRta._RELOAD.NOT_NEEDED);
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
		beforeEach: function() {
			this.oRta = new RuntimeAuthoring({
				rootControl : oCompCont.getComponentInstance().getAggregation("rootControl"),
				showToolbars : false
			});
			whenNoAppDescriptorChangesExist(this.oRta);
			this.fnEnableRestartSpy = sandbox.spy(RuntimeAuthoring, "enableRestart");
			sandbox.stub(this.oRta, "_reloadPage");
			this.fnTriggerCrossAppNavigationSpy = sandbox.spy(this.oRta, "_triggerCrossAppNavigation");
			this.fnHandleParametersOnExitStub = sandbox.spy(this.oRta, "_handleUrlParameterOnExit");
			this.fnFLPToExternalStub = sandbox.spy();

			return this.oRta._initVersioning();
		},
		afterEach: function() {
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when draft changes are available, RTA is started and user exists", function(assert) {
			sandbox.stub(ReloadInfoAPI, "initialDraftGotActivated").returns(false);
			sandbox.stub(PersistenceWriteAPI, "hasHigherLayerChanges").resolves(false);
			sandbox.stub(this.oRta, "_isDraftAvailable").returns(true);
			givenAnFLP(function() {return true;}, {"sap-ui-fl-version": [Layer.CUSTOMER]});
			whenUserConfirmsMessage.call(this, "MSG_RELOAD_WITHOUT_DRAFT", assert);

			return this.oRta._handleReloadOnExit()
			.then(function(oReloadInfo) {
				assert.equal(this.fnEnableRestartSpy.callCount, 0,
					"then RTA restart will not be enabled");
				assert.strictEqual(oReloadInfo.reloadMethod, this.oRta._RELOAD.VIA_HASH,
					"then the correct reload reason is triggered");
			}.bind(this));
		});

		QUnit.test("when draft changes already existed when entering and user exits RTA...", function(assert) {
			givenDraftParameterIsSetTo.call(this, Layer.CUSTOMER, this.fnFLPToExternalStub);
			var oReloadInfo = {
				reloadMethod: this.oRta._RELOAD.VIA_HASH
			};
			sandbox.stub(this.oRta, "_handleReloadOnExit").resolves(oReloadInfo);
			sandbox.stub(this.oRta, "_serializeToLrep").resolves();

			return this.oRta.stop().then(function() {
				assert.equal(this.fnHandleParametersOnExitStub.callCount,
					1,
					"then handleParametersOnExit was called");
				assert.equal(this.fnTriggerCrossAppNavigationSpy.callCount,
					1, "then crossAppNavigation was triggered");
				assert.equal(isReloadedWithDraftParameter(this.fnFLPToExternalStub),
					false,
					"then draft parameter is removed");
			}.bind(this));
		});

		QUnit.test("when draft changes already existed and the draft was activated and user exits RTA...", function(assert) {
			sandbox.stub(ReloadInfoAPI, "initialDraftGotActivated").returns(true);
			givenDraftParameterIsSetTo.call(this, Layer.CUSTOMER, this.fnFLPToExternalStub);
			sandbox.stub(this.oRta, "_serializeToLrep").resolves();
			sandbox.stub(this.oRta, "_handleReloadMessageBoxOnExit").resolves();

			return this.oRta.stop().then(function() {
				assert.equal(this.fnHandleParametersOnExitStub.callCount,
					1,
					"then handleParametersOnExit was called");
				assert.equal(this.fnTriggerCrossAppNavigationSpy.callCount,
					1, "then crossAppNavigation was triggered");
				assert.equal(isReloadedWithDraftParameter(this.fnFLPToExternalStub),
					false,
					"then draft parameter is removed");
			}.bind(this));
		});

		QUnit.test("when no draft was present and dirty changes were made after entering RTA and user exits RTA...", function(assert) {
			sandbox.stub(ReloadInfoAPI, "initialDraftGotActivated").returns(false);
			givenNoParameterIsSet.call(this, this.fnFLPToExternalStub);
			var oReloadInfo = {
				reloadMethod: this.oRta._RELOAD.VIA_HASH,
				hasHigherLayerChanges: true
			};
			sandbox.stub(this.oRta, "_handleReloadOnExit").resolves(oReloadInfo);
			sandbox.stub(this.oRta, "_serializeToLrep").resolves();
			sandbox.stub(this.oRta, "_isDraftAvailable").returns(true);

			return this.oRta.stop().then(function() {
				assert.equal(this.fnHandleParametersOnExitStub.callCount,
					1,
					"then handleParametersOnExit was called");
				assert.equal(this.fnTriggerCrossAppNavigationSpy.callCount,
					1, "then crossAppNavigation was triggered");
				assert.equal(isReloadedWithDraftFalseParameter(this.fnFLPToExternalStub),
					true, "then draft parameter is set to false");
			}.bind(this));
		});

		QUnit.test("when no versioning is available and dirty changes were made after entering RTA and user exits RTA...", function(assert) {
			givenNoParameterIsSet.call(this, this.fnFLPToExternalStub);
			var oReloadInfo = {
				reloadMethod: this.oRta._RELOAD.VIA_HASH
			};
			sandbox.stub(this.oRta, "_handleReloadOnExit").resolves(oReloadInfo);
			sandbox.stub(this.oRta, "_serializeToLrep").resolves();
			sandbox.stub(this.oRta, "_isDraftAvailable").returns(false);

			return this.oRta.stop().then(function() {
				assert.equal(this.fnHandleParametersOnExitStub.callCount,
					1,
					"then handleParametersOnExit was called");
				assert.equal(this.fnTriggerCrossAppNavigationSpy.callCount,
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
			this.fnTriggerCrossAppNavigationSpy = sandbox.stub(this.oRta, "_triggerCrossAppNavigation");
			sandbox.spy(this.oRta, "_handleUrlParameterOnExit");
			this.fnFLPToExternalStub = sandbox.spy();

			return this.oRta._initVersioning();
		},
		afterEach : function() {
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when personalized changes exist and started in FLP reloading the personalization...", function(assert) {
			sandbox.stub(ReloadInfoAPI, "initialDraftGotActivated").returns(false);
			givenMaxLayerParameterIsSetTo.call(this, Layer.CUSTOMER, this.fnFLPToExternalStub);
			whenHigherLayerChangesExist();

			whenUserConfirmsMessage.call(this, "MSG_RELOAD_WITH_PERSONALIZATION", assert);

			return this.oRta._handleReloadOnExit().then(function(oReloadInfo) {
				assert.equal(this.fnEnableRestartSpy.callCount,
					0,
					"then RTA restart will not be enabled");
				assert.strictEqual(oReloadInfo.reloadMethod, this.oRta._RELOAD.VIA_HASH,
					"then the page is reloaded");
			}.bind(this));
		});

		QUnit.test("when higher layer changes exist, RTA is started above CUSTOMER layer and user exits and started in FLP reloading the personalization...", function(assert) {
			sandbox.stub(ReloadInfoAPI, "initialDraftGotActivated").returns(false);
			givenMaxLayerParameterIsSetTo.call(this, Layer.VENDOR, this.fnFLPToExternalStub);
			whenStartedWithLayer(this.oRta, Layer.VENDOR);
			whenHigherLayerChangesExist(Layer.VENDOR);
			whenUserConfirmsMessage.call(this, "MSG_RELOAD_WITH_ALL_CHANGES", assert);

			return this.oRta._handleReloadOnExit().then(function(oReloadInfo) {
				assert.equal(this.fnEnableRestartSpy.callCount,
					0,
					"then RTA restart will not be enabled");
				assert.strictEqual(oReloadInfo.reloadMethod, this.oRta._RELOAD.VIA_HASH,
					"then the page is reloaded");
			}.bind(this));
		});

		QUnit.test("when app descriptor and personalized changes exist and user exits reloading the personalization...", function(assert) {
			sandbox.stub(ReloadInfoAPI, "initialDraftGotActivated").returns(false);
			givenMaxLayerParameterIsSetTo.call(this, Layer.CUSTOMER, this.fnFLPToExternalStub);
			whenAppDescriptorChangesExist(this.oRta);
			whenHigherLayerChangesExist();

			whenUserConfirmsMessage.call(this, "MSG_RELOAD_WITH_PERSONALIZATION", assert);

			return this.oRta._handleReloadOnExit().then(function(oReloadInfo) {
				assert.equal(this.fnEnableRestartSpy.callCount, 0,
					"then RTA restart will not be enabled");
				assert.strictEqual(oReloadInfo.reloadMethod, this.oRta._RELOAD.RELOAD_PAGE,
					"then the reload page is triggered to update the flp cache");
			}.bind(this));
		});

		QUnit.test("when no app descriptor changes exist at first save and later they exist and user exits ...", function(assert) {
			sandbox.stub(ReloadInfoAPI, "initialDraftGotActivated").returns(false);
			this.oRta._oSerializer = {
				needsReload : function(bReload) {
					return Promise.resolve(bReload);
				},
				saveCommands : function() {
					return;
				}
			};
			var fnNeedsReloadStub = sandbox.stub(this.oRta._oSerializer, "needsReload");
			givenMaxLayerParameterIsSetTo.call(this, Layer.CUSTOMER, this.fnFLPToExternalStub);
			fnNeedsReloadStub.onFirstCall().resolves(false);
			fnNeedsReloadStub.onSecondCall().resolves(true);
			whenUserConfirmsMessage.call(this, "MSG_RELOAD_WITH_PERSONALIZATION", assert);

			return this.oRta._serializeToLrep()
			.then(this.oRta._handleReloadOnExit.bind(this.oRta))
			.then(function(oReloadInfo) {
				assert.equal(this.fnEnableRestartSpy.callCount, 0,
					"then RTA restart will not be enabled");
				assert.equal(fnNeedsReloadStub.callCount, 2,
					"then the reload check is called once");
				assert.strictEqual(oReloadInfo.reloadMethod, this.oRta._RELOAD.RELOAD_PAGE,
					"then the reload page is triggered to update the flp cache");
			}.bind(this));
		});

		QUnit.test("when app descriptor changes exist and user publishes and afterwards exits ...", function(assert) {
			sandbox.stub(ReloadInfoAPI, "initialDraftGotActivated").returns(false);
			givenMaxLayerParameterIsSetTo.call(this, Layer.CUSTOMER, this.fnFLPToExternalStub);
			whenAppDescriptorChangesExist(this.oRta);
			var fnNeedsReloadSpy = sandbox.spy(this.oRta._oSerializer, "needsReload");

			whenUserConfirmsMessage.call(this, "MSG_RELOAD_WITH_PERSONALIZATION", assert);

			return this.oRta._serializeToLrep()
			.then(this.oRta._handleReloadOnExit.bind(this.oRta))
			.then(function(oReloadInfo) {
				assert.equal(this.fnEnableRestartSpy.callCount, 0,
					"then RTA restart will not be enabled");
				assert.equal(fnNeedsReloadSpy.callCount, 1,
					"then the reload check is called once");
				assert.strictEqual(oReloadInfo.reloadMethod, this.oRta._RELOAD.RELOAD_PAGE,
					"then the reload page is triggered to update the flp cache");
			}.bind(this));
		});

		QUnit.test("when app descriptor changes exist and user exits ...", function(assert) {
			sandbox.stub(ReloadInfoAPI, "initialDraftGotActivated").returns(false);
			givenMaxLayerParameterIsSetTo.call(this, Layer.CUSTOMER, this.fnFLPToExternalStub);
			whenAppDescriptorChangesExist(this.oRta);
			var fnNeedsReloadSpy = sandbox.spy(this.oRta._oSerializer, "needsReload");

			whenUserConfirmsMessage.call(this, "MSG_RELOAD_WITH_PERSONALIZATION", assert);

			return this.oRta._handleReloadOnExit()
			.then(function(oReloadInfo) {
				assert.equal(this.fnEnableRestartSpy.callCount, 0,
					"then RTA restart will not be enabled");
				assert.equal(fnNeedsReloadSpy.callCount, 1,
					"then the reload check is called once");
				assert.strictEqual(oReloadInfo.reloadMethod, this.oRta._RELOAD.RELOAD_PAGE,
					"then the reload page is triggered to update the flp cache");
			}.bind(this));
		});

		QUnit.test("when there are no personalized and appDescriptor changes and _handleReloadOnExit() is called", function(assert) {
			sandbox.stub(ReloadInfoAPI, "initialDraftGotActivated").returns(false);
			givenMaxLayerParameterIsSetTo.call(this, Layer.CUSTOMER, this.fnFLPToExternalStub);
			whenUserConfirmsMessage.call(this, "MSG_RELOAD_WITH_PERSONALIZATION", assert);

			return this.oRta._handleReloadOnExit().then(function(oReloadInfo) {
				assert.equal(this.fnEnableRestartSpy.callCount,
					0,
					"then RTA restart will not be enabled");
				assert.strictEqual(oReloadInfo.reloadMethod, this.oRta._RELOAD.VIA_HASH,
					"then we reload to remove the max-layer parameter");
			}.bind(this));
		});

		QUnit.test("when app descriptor and no personalized changes exist and user exits reloading the personalization...", function(assert) {
			sandbox.stub(ReloadInfoAPI, "initialDraftGotActivated").returns(false);
			givenMaxLayerParameterIsSetTo.call(this, Layer.CUSTOMER, this.fnFLPToExternalStub);
			whenAppDescriptorChangesExist(this.oRta);

			whenUserConfirmsMessage.call(this, "MSG_RELOAD_WITH_PERSONALIZATION", assert);

			return this.oRta._handleReloadOnExit().then(function(oReloadInfo) {
				assert.equal(this.fnEnableRestartSpy.callCount,
					0,
					"then RTA restart will not be enabled");
				assert.strictEqual(oReloadInfo.reloadMethod, this.oRta._RELOAD.RELOAD_PAGE,
					"then the reload page is triggered to update the flp cache");
			}.bind(this));
		});

		QUnit.test("when reloadable changes exist and user exits RTA...", function(assert) {
			givenMaxLayerParameterIsSetTo.call(this, Layer.CUSTOMER, this.fnFLPToExternalStub);

			sandbox.spy(this.oRta, "_handleReloadOnExit");
			sandbox.stub(this.oRta, "_serializeToLrep").resolves();
			whenUserConfirmsMessage.call(this, "MSG_RELOAD_WITH_PERSONALIZATION", assert);

			return this.oRta.stop().then(function() {
				assert.equal(this.fnTriggerCrossAppNavigationSpy.callCount,
					1,
					"then page reload is triggered");
				assert.strictEqual(isReloadedWithMaxLayerParameter(this.fnFLPToExternalStub),
					false,
					"then max layer parameter is removed");
			}.bind(this));
		});
	});

	QUnit.module("Given the user is leaving RTA on stand-alone applications", {
		beforeEach : function() {
			this.oRta = new RuntimeAuthoring({
				rootControl : oCompCont.getComponentInstance().getAggregation("rootControl"),
				showToolbars : false
			});
		},
		afterEach : function() {
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when the _handleUrlParameterOnExit() method is called when higher layer changes are present for the user", function(assert) {
			var oReloadInfo = {
				layer: "CUSTOMER",
				hasHigherLayerChanges: true
			};
			sandbox.stub(FlexUtils, "getUshellContainer").returns(false);
			var oTriggerHardReloadStub = sandbox.stub(this.oRta, "_triggerHardReload");
			var oRemoveMaxLayerParameterForFLPStub = sandbox.stub(this.oRta, "_removeMaxLayerParameterForFLP");
			this.oRta._handleUrlParameterOnExit(oReloadInfo);
			assert.equal(oTriggerHardReloadStub.callCount, 1, "_triggerHardReload is called");
			assert.equal(oRemoveMaxLayerParameterForFLPStub.callCount, 0, "_removeMaxLayerParameterForFLP is not called");
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
			this.fnHandleParametersForStandalone = sandbox.stub(ReloadInfoAPI, "handleUrlParametersForStandalone");
			this.fnHandleParametersOnExitStub =
				sandbox.stub(this.oRta, "_handleUrlParameterOnExit");
			this.fnTriggerHardReloadStub = sandbox.stub(this.oRta, "_triggerHardReload");
			sandbox.stub(this.oRta, "_reloadPage");

			return this.oRta._initVersioning();
		},
		afterEach : function() {
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when the _determineReload() method is called", function(assert) {
			return this.oRta._determineReload().then(function() {
				assert.equal(this.fnEnableRestartSpy.callCount, 0, "then RTA restart will not be enabled");
				assert.equal(this.fnHandleParametersOnExitStub.callCount,
					0,
					"then _handleMaxLayerAndVersionParametersOnExit() is not called");
			}.bind(this));
		});

		QUnit.test("when the _determineReload() method is called with draft", function(assert) {
			sandbox.stub(FeaturesAPI, "isVersioningEnabled").returns(Promise.resolve(true));
			sandbox.stub(VersionsAPI, "isDraftAvailable").returns(true);
			whenUserConfirmsMessage.call(this, "MSG_DRAFT_EXISTS", assert);
			var oHasMaxLayerParameterSpy = sandbox.spy(ReloadInfoAPI, "hasMaxLayerParameterWithValue");
			var oHasVersionParameterSpy = sandbox.spy(ReloadInfoAPI, "hasVersionParameterWithValue");

			this.fnHandleParametersForStandalone.returns(document.location.search);
			return this.oRta._determineReload().then(function() {
				assert.equal(oHasMaxLayerParameterSpy.callCount, 1, "hasMaxLayerParameterWithValue is called");
				assert.equal(oHasVersionParameterSpy.callCount, 1, "hasVersionParameterWithValue is called");
				assert.equal(this.fnTriggerHardReloadStub.callCount, 1, "_triggerHardReload is called");
			}.bind(this));
		});

		QUnit.test("when the _determineReload() method is called with draft but parameter already set", function(assert) {
			sandbox.stub(FeaturesAPI, "isVersioningEnabled").returns(Promise.resolve(true));
			sandbox.stub(VersionsAPI, "isDraftAvailable").returns(true);
			sandbox.stub(ReloadInfoAPI, "hasMaxLayerParameterWithValue").returns(true);
			sandbox.stub(ReloadInfoAPI, "hasVersionParameterWithValue").returns(true);
			var fnGetReloadMessageOnStartSpy = sandbox.spy(this.oRta, "_getReloadMessageOnStart");
			this.fnHandleParametersForStandalone.returns(document.location.search);
			return this.oRta._determineReload().then(function() {
				assert.equal(this.fnHandleParametersForStandalone.callCount, 0, "handleUrlParameterForStandalone is not called");
				assert.equal(fnGetReloadMessageOnStartSpy.callCount, 0, "_getReloadMessageOnStart is not called");
				assert.equal(this.fnTriggerHardReloadStub.callCount, 0, "_triggerHardReload is not called");
			}.bind(this));
		});

		QUnit.test("when the _handleReloadOnExit() method is called", function(assert) {
			sandbox.stub(ReloadInfoAPI, "initialDraftGotActivated").returns(false);
			return this.oRta._handleReloadOnExit().then(function() {
				assert.equal(this.fnEnableRestartSpy.callCount, 0, "then RTA restart will not be enabled");
			}.bind(this));
		});

		QUnit.test("when _handleReloadOnExit() is called and personalized changes and user exits reloading the personalization...", function(assert) {
			sandbox.stub(ReloadInfoAPI, "initialDraftGotActivated").returns(false);
			whenHigherLayerChangesExist();
			sandbox.stub(ReloadInfoAPI, "hasMaxLayerParameterWithValue").returns(true);
			whenUserConfirmsMessage.call(this, "MSG_RELOAD_WITH_PERSONALIZATION", assert);

			return this.oRta._handleReloadOnExit().then(function(oReloadInfo) {
				assert.equal(this.fnEnableRestartSpy.callCount, 0,
					"then RTA restart will not be enabled");
				assert.strictEqual(oReloadInfo.reloadMethod, this.oRta._RELOAD.RELOAD_PAGE,
					"then the page is reloaded");
			}.bind(this));
		});

		QUnit.test("when _handleReloadOnExit() is called, draft url parameter is set and draft changes are available", function(assert) {
			sandbox.stub(ReloadInfoAPI, "initialDraftGotActivated").returns(false);
			sandbox.stub(PersistenceWriteAPI, "hasHigherLayerChanges").resolves(false);
			sandbox.stub(this.oRta, "_isDraftAvailable").returns(true);
			sandbox.stub(ReloadInfoAPI, "hasVersionParameterWithValue").returns(true);

			whenUserConfirmsMessage.call(this, "MSG_RELOAD_WITHOUT_DRAFT", assert);

			return this.oRta._handleReloadOnExit().then(function(oReloadInfo) {
				assert.equal(this.fnEnableRestartSpy.callCount, 0,
					"then RTA restart will not be enabled");
				assert.strictEqual(oReloadInfo.reloadMethod, this.oRta._RELOAD.RELOAD_PAGE,
					"then the page is reloaded");
			}.bind(this));
		});

		QUnit.test("when _handleReloadOnExit() is called, draft url parameter is set and initial draft got activated", function(assert) {
			sandbox.stub(ReloadInfoAPI, "initialDraftGotActivated").returns(true);
			sandbox.stub(PersistenceWriteAPI, "hasHigherLayerChanges").resolves(false);
			sandbox.stub(this.oRta, "_isDraftAvailable").returns(true);
			sandbox.stub(ReloadInfoAPI, "hasVersionParameterWithValue").returns(true);
			whenUserConfirmsMessage.call(this, "MSG_RELOAD_ACTIVATED_DRAFT", assert);

			return this.oRta._handleReloadOnExit().then(function(oReloadInfo) {
				assert.equal(this.fnEnableRestartSpy.callCount, 0,
					"then RTA restart will not be enabled");
				assert.strictEqual(oReloadInfo.reloadMethod, this.oRta._RELOAD.RELOAD_PAGE,
					"then the page is reloaded to remove the parameter anyways");
			}.bind(this));
		});

		QUnit.test("when _handleReloadOnExit() is called and draft url parameter is set and no draft exists", function(assert) {
			sandbox.stub(ReloadInfoAPI, "initialDraftGotActivated").returns(false);
			sandbox.stub(PersistenceWriteAPI, "hasHigherLayerChanges").resolves(false);
			sandbox.stub(this.oRta, "_isDraftAvailable").returns(false);
			sandbox.stub(ReloadInfoAPI, "hasVersionParameterWithValue").returns(true);
			whenUserConfirmsMessage.call(this, "MSG_RELOAD_WITHOUT_DRAFT", assert);

			return this.oRta._handleReloadOnExit().then(function(oReloadInfo) {
				assert.equal(this.fnEnableRestartSpy.callCount, 0,
					"then RTA restart will not be enabled");
				assert.strictEqual(oReloadInfo.reloadMethod, this.oRta._RELOAD.RELOAD_PAGE,
					"then the page is reloaded");
			}.bind(this));
		});

		QUnit.test("when _handleDiscard() is called", function(assert) {
			this.oRta._handleDiscard();
			assert.equal(this.fnTriggerHardReloadStub.callCount, 1, "then _triggerHardReload is called");
			var oReloadInfo = this.fnTriggerHardReloadStub.getCall(0).args[0];
			assert.equal(oReloadInfo.layer, Layer.CUSTOMER, "with CUSTOMER layer");
			assert.equal(oReloadInfo.hasDraftChanges, false, "and with no draft change");
		});

		QUnit.test("when _deleteChanges() is called", function(assert) {
			return this.oRta._deleteChanges().then(function() {
				assert.equal(this.fnHandleParametersOnExitStub.callCount, 1, "then _handleParameterOnExit is called");
				var oReloadInfo = this.fnHandleParametersOnExitStub.getCall(0).args[0];
				assert.equal(oReloadInfo.layer, Layer.CUSTOMER, "with CUSTOMER layer");
				assert.equal(oReloadInfo.hasDraftChanges, false, "and with no draft change");
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
			givenAnFLP(function() {return true;}, {"sap-ui-fl-version": [Layer.CUSTOMER]});
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
				oToolbarSetRestoreEnabledSpy = sandbox.spy(oRta.getToolbar(), "setRestoreEnabled");
			})
			.then(oRta._onActivateDraft.bind(oRta, oEvent))
			.then(function() {
				assert.equal(oActivateDraftStub.callCount, 1, "then the activateDraft() method is called once");
				var oActivationCallPropertyBag = oActivateDraftStub.getCall(0).args[0];
				assert.equal(oActivationCallPropertyBag.selector, this.oRta.getRootControlInstance(), "with the correct selector");
				assert.equal(oActivationCallPropertyBag.layer, this.oRta.getLayer(), "and layer");
				assert.equal(oActivationCallPropertyBag.title, sVersionTitle, "and version title");
				assert.equal(oRta.bInitialResetEnabled, true, "and the initialRestEnabled is true");
				assert.equal(oToolbarSetRestoreEnabledSpy.callCount, 2, "and the restore enabled is called");
				assert.equal(oToolbarSetRestoreEnabledSpy.getCall(0).args[0], true, "to true");
				assert.equal(oShowMessageToastStub.callCount, 1, "and a message is shown");
			}.bind(this));
		});

		QUnit.test("when _onDiscardDraft is called", function(assert) {
			var oDiscardDraftStub = sandbox.stub(VersionsAPI, "discardDraft").resolves();
			var oHandleDiscardDraftStub = sandbox.spy(this.oRta, "_handleDiscard");
			var oRemoveVersionParameterStub = sandbox.spy(this.oRta, "_removeVersionParameterForFLP");
			var oRemoveAllCommandsStub = sandbox.stub(this.oRta.getCommandStack(), "removeAllCommands");
			var oShowMessageBoxStub = sandbox.stub(Utils, "showMessageBox").resolves("MessageBox.Action.CANCEL");
			var oStopStub = sandbox.stub(this.oRta, "stop");
			var mParsedHash = {
				params: {
					"sap-ui-fl-version": [Layer.CUSTOMER]
				}
			};
			sandbox.stub(this.oRta, "_isDraftAvailable").returns(true);
			sandbox.stub(FlexUtils, "getParsedURLHash").returns(mParsedHash);
			this.oRta.bInitialDraftAvailable = true;
			return this.oRta.start()
			.then(this.oRta._onDiscardDraft.bind(this.oRta, false))
			.then(function() {
				assert.equal(oShowMessageBoxStub.callCount, 1, "then the message box was shown");
				assert.equal(oHandleDiscardDraftStub.callCount, 0, "then _handleDiscard was not called");
				assert.equal(oDiscardDraftStub.callCount, 0, "then VersionsAPI was not called");
				assert.equal(oRemoveVersionParameterStub.callCount, 0, "then _removeVersionParameterForFLP was not called");

				oShowMessageBoxStub.reset();
				oShowMessageBoxStub.resolves(MessageBox.Action.OK);
				return this.oRta._onDiscardDraft(false);
			}.bind(this))
			.then(function() {
				assert.equal(oShowMessageBoxStub.callCount, 1, "then the message box was shown");
				assert.equal(oShowMessageBoxStub.lastCall.args[1], "MSG_DRAFT_DISCARD_DIALOG", "then the message is correct");
				assert.equal(oDiscardDraftStub.callCount, 1, "then the discardDraft() method is called once");
				assert.equal(oHandleDiscardDraftStub.callCount, 1, "then _handleDiscard was called");
				assert.equal(oRemoveVersionParameterStub.callCount, 1, "then _removeVersionParameterForFLP was called");
				assert.equal(oRemoveVersionParameterStub.getCall(0).args[0], mParsedHash, "then _removeVersionParameterForFLP was called with the correct parameters");
				var oDiscardCallPropertyBag = oDiscardDraftStub.getCall(0).args[0];
				assert.equal(oDiscardCallPropertyBag.selector, this.oRta.getRootControlInstance(), "with the correct selector");
				assert.equal(oDiscardCallPropertyBag.layer, this.oRta.getLayer(), "and layer");
				assert.equal(oRemoveAllCommandsStub.callCount, 1, "and all commands were removed");
				assert.equal(oStopStub.callCount, 1, "then stop was called");
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
			return _mockStateCallIsDraftAvailableAndCheckResult(assert, this.oRta, true, false, true, false);
		});
		QUnit.test("and versioning, a draft and undo is available", function (assert) {
			return _mockStateCallIsDraftAvailableAndCheckResult(assert, this.oRta, true, true, true, true);
		});
	});

	QUnit.module("Given that RuntimeAuthoring wants to determine if a reload is needed", {
		beforeEach: function() {
			givenAnFLP(function() {return true;}, {});
			this.oRootControl = oCompCont.getComponentInstance().getAggregation("rootControl");
			this.oRta = new RuntimeAuthoring({
				rootControl : this.oRootControl,
				showToolbars : false
			});
			this.oReloadInfo = {
				layer: this.oRta.getLayer(),
				selector: this.oRta.getRootControlInstance(),
				ignoreMaxLayerParameter: false,
				parsedHash: {params: {}}
			};

			sandbox.stub(FlexUtils, "getParsedURLHash").returns(this.oReloadInfo.parsedHash);
		},
		afterEach: function() {
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("and versioning is available and a draft is available,", function(assert) {
			var oHasMaxLayerParameterSpy = sandbox.spy(ReloadInfoAPI, "hasMaxLayerParameterWithValue");
			var oHasVersionParameterSpy = sandbox.spy(ReloadInfoAPI, "hasVersionParameterWithValue");

			var oHasHigherLayerChangesSpy = sandbox.spy(PersistenceWriteAPI, "hasHigherLayerChanges");
			var oGetReloadMessageOnStart = sandbox.stub(this.oRta, "_getReloadMessageOnStart").returns("MSG_DRAFT_EXISTS");
			var oIsVersioningEnabledStub = sandbox.stub(FeaturesAPI, "isVersioningEnabled").returns(Promise.resolve(true));
			this.oReloadInfo.hasHigherLayerChanges = false;
			this.oReloadInfo.hasDraftChanges = true;
			var oIsDraftAvailableStub = sandbox.stub(VersionsAPI, "isDraftAvailable").returns(true);
			var oGetReloadReasonsSpy = sandbox.spy(ReloadInfoAPI, "getReloadReasonsForStart");
			whenUserConfirmsMessage.call(this, "MSG_DRAFT_EXISTS", assert);

			return this.oRta._determineReload().then(function () {
				assert.equal(oIsVersioningEnabledStub.callCount, 1, "then isVersioningEnabled is called once");
				assert.equal(oIsDraftAvailableStub.callCount, 1, "then isDraftAvailable is called once");

				assert.equal(oHasMaxLayerParameterSpy.callCount, 1, "then hasMaxLayerParameterWithValue is called once");
				assert.equal(oHasVersionParameterSpy.callCount, 1, "then hasVersionParameterWithValue is called once");
				assert.equal(oHasHigherLayerChangesSpy.callCount, 1, "then hasHigherLayerChanges is called once");
				assert.deepEqual(oHasHigherLayerChangesSpy.lastCall.args[0], {
					selector: this.oReloadInfo.selector,
					ignoreMaxLayerParameter: this.oReloadInfo.ignoreMaxLayerParameter
				}, "then hasHigherLayerChanges is called with the correct parameters");

				assert.equal(oGetReloadMessageOnStart.callCount, 1, "then _getReloadMessageOnStart is called once");
				assert.deepEqual(oGetReloadMessageOnStart.lastCall.args[0].hasHigherLayerChanges, this.oReloadInfo.hasHigherLayerChanges, "then _getReloadMessageOnStart is called with the correct reload reason");
				assert.deepEqual(oGetReloadMessageOnStart.lastCall.args[0].hasDraftChanges, this.oReloadInfo.hasDraftChanges, "then _getReloadMessageOnStart is called with the correct reload reason");
				assert.equal(oGetReloadReasonsSpy.callCount, 1, "then getReloadReasonsForStart is called once");
			}.bind(this));
		});

		QUnit.test("and versioning is not available,", function(assert) {
			var oIsDraftAvailableStub = sandbox.stub(VersionsAPI, "isDraftAvailable");

			var oHasMaxLayerParameterSpy = sandbox.spy(ReloadInfoAPI, "hasMaxLayerParameterWithValue");
			var oHasVersionParameterSpy = sandbox.spy(ReloadInfoAPI, "hasVersionParameterWithValue");
			var oGetReloadMessageOnStart = sandbox.stub(this.oRta, "_getReloadMessageOnStart").returns();
			this.oRta._bVersioningEnabled = false;
			this.oReloadInfo.hasHigherLayerChanges = false;
			this.oReloadInfo.hasDraftChanges = false;
			var oGetReloadReasonsStub = sandbox.stub(ReloadInfoAPI, "getReloadReasonsForStart").returns(Promise.resolve(this.oReloadInfo));

			return this.oRta._determineReload().then(function () {
				assert.equal(oIsDraftAvailableStub.callCount, 0, "then isDraftAvailable is not called");
				assert.equal(oHasMaxLayerParameterSpy.callCount, 0, "then hasMaxLayerParameterWithValue is not called");
				assert.equal(oHasVersionParameterSpy.callCount, 0, "then hasVersionParameterWithValue is not called");
				assert.equal(oGetReloadMessageOnStart.callCount, 0, "then _getReloadMessageOnStart is not called");
				assert.equal(oGetReloadReasonsStub.callCount, 1, "then getReloadReasonsForStart is called once");
			});
		});
	});
	QUnit.module("Given that a CrossAppNavigation is needed because of a draft", {
		beforeEach: function() {
			sandbox.stub(FlexUtils, "getUshellContainer").returns({
				getService: function () {
					return {
						toExternal: function() {
							return true;
						},
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
			this.mParsedHash = {
				params: {
					"sap-ui-fl-version": [Layer.CUSTOMER]
				}
			};
			this.oReloadInfo = {
				hasHigherLayerChanges: false,
				hasDraftChanges: true,
				layer: this.oRta.getLayer(),
				selector: this.oRta.getRootControlInstance(),
				ignoreMaxLayerParameter: false,
				parsedHash: this.mParsedHash
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
		QUnit.test("and versioning is not available,", function(assert) {
			var oGetReloadMessageOnStart = sandbox.stub(this.oRta, "_getReloadMessageOnStart").returns(Promise.resolve());
			this.oRta._bVersioningEnabled = false;
			this.oReloadInfo.hasHigherLayerChanges = false;
			this.oReloadInfo.hasDraftChanges = false;
			var oGetReloadReasonsStub = sandbox.stub(ReloadInfoAPI, "getReloadReasonsForStart").returns(Promise.resolve(this.oReloadInfo));

			return this.oRta._determineReload().then(function () {
				assert.equal(oGetReloadMessageOnStart.callCount, 0, "then _getReloadMessageOnStart is not called");
				assert.equal(oGetReloadReasonsStub.callCount, 1, "then getReloadReasons is called once");
			});
		});
	});

	QUnit.module("Given that RuntimeAuthoring wants to determine if a reload is needed on start", {
		beforeEach: function() {
			givenAnFLP(function() {return true;}, {});
			this.oRootControl = oCompCont.getComponentInstance().getAggregation("rootControl");
			this.oRta = new RuntimeAuthoring({
				rootControl : this.oRootControl,
				showToolbars : false
			});
			this.mParsedHash = {params: {}};

			this.oReloadInfo = {
				hasHigherLayerChanges: false,
				hasDraftChanges: true,
				layer: this.oRta.getLayer(),
				selector: this.oRta.getRootControlInstance(),
				ignoreMaxLayerParameter: false,
				parsedHash: this.mParsedHash
			};
		},
		afterEach: function() {
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("and a draft is available", function (assert) {
			sandbox.stub(FlexUtils, "getParsedURLHash").returns(this.mParsedHash);
			sandbox.stub(this.oRta, "_buildNavigationArguments").returns({});
			sandbox.stub(FeaturesAPI, "isVersioningEnabled").returns(Promise.resolve(true));

			var oHasMaxLayerParameterSpy = sandbox.spy(ReloadInfoAPI, "hasMaxLayerParameterWithValue");
			var oHasVersionParameterSpy = sandbox.spy(ReloadInfoAPI, "hasVersionParameterWithValue");
			var oHasHigherLayerChangesSpy = sandbox.spy(PersistenceWriteAPI, "hasHigherLayerChanges");
			var oGetReloadMessageOnStart = sandbox.stub(this.oRta, "_getReloadMessageOnStart").returns("MSG_DRAFT_EXISTS");
			var oHandleParameterOnStartStub = sandbox.stub(ReloadInfoAPI, "handleParametersOnStart");
			var oIsDraftAvailableStub = sandbox.stub(VersionsAPI, "isDraftAvailable").returns(true);
			whenUserConfirmsMessage.call(this, "MSG_DRAFT_EXISTS", assert);

			return this.oRta._determineReload().then(function () {
				assert.equal(oIsDraftAvailableStub.callCount, 1, "then isDraftAvailable is called once");

				assert.equal(oHasMaxLayerParameterSpy.callCount, 1, "then hasMaxLayerParameterWithValue is called twice");
				assert.equal(oHasVersionParameterSpy.callCount, 1, "then hasVersionParameterWithValue is called twice");
				assert.equal(oHasHigherLayerChangesSpy.callCount, 1, "then hasHigherLayerChanges is called once");
				assert.deepEqual(oHasHigherLayerChangesSpy.lastCall.args[0], {
					selector: this.oReloadInfo.selector,
					ignoreMaxLayerParameter: this.oReloadInfo.ignoreMaxLayerParameter
				}, "then hasHigherLayerChanges is called with the correct parameters");

				assert.equal(oGetReloadMessageOnStart.callCount, 1, "then _getReloadMessageOnStart is called once");
				assert.equal(oHandleParameterOnStartStub.callCount, 1, "then handleParametersOnStart is called once");
			}.bind(this));
		});
	});

	QUnit.module("Given that RuntimeAuthoring in the CUSTOMER layer was started within an FLP and wants to determine if a reload is needed on exit", {
		beforeEach: function() {
			givenAnFLP(function() {return true;}, {});
			this.oRootControl = oCompCont.getComponentInstance().getAggregation("rootControl");
			this.oRta = new RuntimeAuthoring({
				rootControl : this.oRootControl,
				showToolbars : false
			});
			return this.oRta.start();
		},
		afterEach: function() {
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("and nothing has changed", function (assert) {
			var oShowMessageBoxStub = sandbox.stub(Utils, "showMessageBox");
			return this.oRta._handleReloadOnExit()
				.then(function (oReloadInfo) {
					assert.equal(oReloadInfo.reloadMethod, "NO_RELOAD", "then no reload is triggered");
					assert.equal(oShowMessageBoxStub.callCount, 0, "and no message was shown");
				});
		});

		QUnit.test("a higher layer changes exist but no dirty draft changes", function (assert) {
			sandbox.stub(ReloadInfoAPI, "hasMaxLayerParameterWithValue").returns(true);
			whenUserConfirmsMessage.call(this, "MSG_RELOAD_WITH_PERSONALIZATION", assert);
			return this.oRta._handleReloadOnExit()
				.then(function (oReloadInfo) {
					assert.equal(oReloadInfo.reloadMethod, "CROSS_APP_NAVIGATION", "then a cross app is triggered");
				});
		});

		QUnit.test("a higher layer changes exist with dirty draft changes", function (assert) {
			sandbox.stub(ReloadInfoAPI, "hasMaxLayerParameterWithValue").returns(true);
			this.oRta._oVersionsModel.setProperty("/draftAvailable", true);
			this.oRta._oVersionsModel.setProperty("/dirtyChanges", true);
			whenUserConfirmsMessage.call(this, "MSG_RELOAD_WITH_PERSONALIZATION_AND_WITHOUT_DRAFT", assert);
			return this.oRta._handleReloadOnExit()
				.then(function (oReloadInfo) {
					assert.equal(oReloadInfo.reloadMethod, "CROSS_APP_NAVIGATION", "then a cross app is triggered");
				});
		});

		QUnit.test("and the initial draft got activated", function (assert) {
			sandbox.stub(ReloadInfoAPI, "initialDraftGotActivated").returns(true);
			whenUserConfirmsMessage.call(this, "MSG_RELOAD_ACTIVATED_DRAFT", assert);
			return this.oRta._handleReloadOnExit()
				.then(function (oReloadInfo) {
					assert.equal(oReloadInfo.reloadMethod, "CROSS_APP_NAVIGATION", "then a cross app is triggered");
				});
		});

		QUnit.test("and draft changes exist", function (assert) {
			this.oRta._oVersionsModel.setProperty("/draftAvailable", true);
			this.oRta._oVersionsModel.setProperty("/dirtyChanges", true);
			whenUserConfirmsMessage.call(this, "MSG_RELOAD_WITHOUT_DRAFT", assert);
			return this.oRta._handleReloadOnExit()
				.then(function (oReloadInfo) {
					assert.equal(oReloadInfo.reloadMethod, "CROSS_APP_NAVIGATION", "then a cross app is triggered");
				});
		});

		QUnit.test("and changes need a reload", function (assert) {
			this.oRta._bReloadNeeded = true;
			whenUserConfirmsMessage.call(this, "MSG_RELOAD_NEEDED", assert);
			return this.oRta._handleReloadOnExit()
				.then(function (oReloadInfo) {
					assert.equal(oReloadInfo.reloadMethod, "HARD_RELOAD", "then a cross app is triggered");
				});
		});
	});

	QUnit.module("Given that RuntimeAuthoring in the VENDOR layer was started within an FLP and wants to determine if a reload is needed on exit", {
		beforeEach: function() {
			givenAnFLP(function() {return true;}, {});
			this.oRootControl = oCompCont.getComponentInstance().getAggregation("rootControl");
			this.oRta = new RuntimeAuthoring({
				rootControl : this.oRootControl,
				showToolbars : false,
				flexSettings: {
					layer: Layer.VENDOR
				}
			});
			return this.oRta.start();
		},
		afterEach: function() {
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("a higher layer changes exist but no dirty draft changes", function (assert) {
			sandbox.stub(ReloadInfoAPI, "hasMaxLayerParameterWithValue").returns(true);
			whenUserConfirmsMessage.call(this, "MSG_RELOAD_WITH_ALL_CHANGES", assert);
			return this.oRta._handleReloadOnExit()
				.then(function (oReloadInfo) {
					assert.equal(oReloadInfo.reloadMethod, "CROSS_APP_NAVIGATION", "then a cross app is triggered");
				});
		});

		QUnit.test("a higher layer changes exist with dirty draft changes", function (assert) {
			sandbox.stub(ReloadInfoAPI, "hasMaxLayerParameterWithValue").returns(true);
			this.oRta._oVersionsModel.setProperty("/draftAvailable", true);
			this.oRta._oVersionsModel.setProperty("/dirtyChanges", true);
			whenUserConfirmsMessage.call(this, "MSG_RELOAD_WITH_ALL_CHANGES", assert);
			return this.oRta._handleReloadOnExit()
				.then(function (oReloadInfo) {
					assert.equal(oReloadInfo.reloadMethod, "CROSS_APP_NAVIGATION", "then a cross app is triggered");
				});
		});
	});

	QUnit.done(function() {
		oComp.destroy();
		jQuery("#qunit-fixture").hide();
	});
});
