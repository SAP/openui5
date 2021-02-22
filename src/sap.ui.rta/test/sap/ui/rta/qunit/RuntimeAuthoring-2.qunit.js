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
	"sap/ui/fl/write/_internal/Versions",
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
	Versions,
	LayerUtils,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();
	var oCompCont;
	var oComp;

	QUnit.config.fixture = null;

	var oComponentPromise = RtaQunitUtils.renderTestAppAtAsync("qunit-fixture")
		.then(function(oCompContainer) {
			oCompCont = oCompContainer;
			oComp = oCompCont.getComponentInstance();
		});

	function givenAnFLP(fnFLPToExternalStub, fnFLPReloadStub, mShellParams) {
		sandbox.stub(FlexUtils, "getUshellContainer").returns({
			getService: function() {
				return {
					toExternal: fnFLPToExternalStub,
					getHash: function () {
						return "Action-somestring";
					},
					parseShellHash: function () {
						var mHash = {
							semanticObject: "Action",
							action: "somestring"
						};

						if (mShellParams) {
							mHash.params = mShellParams;
						}
						return mHash;
					},
					unregisterNavigationFilter: function () {},
					registerNavigationFilter: function () {},
					reloadCurrentApp: fnFLPReloadStub
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

	function givenMaxLayerParameterIsSetTo(sMaxLayer, fnFLPToExternalStub, fnFLPReloadStub) {
		givenAnFLP.call(this, fnFLPToExternalStub, fnFLPReloadStub, {
			"sap-ui-fl-max-layer": [sMaxLayer]
		});
	}

	function givenDraftParameterIsSet(fnFLPToExternalStub, fnFLPReloadStub) {
		givenAnFLP.call(this, fnFLPToExternalStub, fnFLPReloadStub, {
			"sap-ui-fl-version": [sap.ui.fl.Versions.Draft.toString()]
		});
	}

	function givenNoParameterIsSet(fnFLPToExternalStub, fnFLPReloadStub) {
		givenAnFLP.call(this, fnFLPToExternalStub, fnFLPReloadStub, {
		});
	}

	function appDescriptorChanges(oRta, bExist) {
		//we don't want to start RTA for these tests, so just setting the otherwise not set property,
		//that sinon cannot stub until it was set.
		oRta._oSerializer = {
			needsReload: function() {
				return Promise.resolve(bExist);
			},
			saveCommands: function() {}
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

	function whenUserConfirmsMessage(sExpectedMessageKey, assert) {
		sandbox.stub(Utils, "showMessageBox").callsFake(
			function(oMessageType, sMessageKey) {
				assert.equal(sMessageKey, sExpectedMessageKey, "then expected message is shown");
				return Promise.resolve();
			}
		);
	}

	QUnit.module("Given that RuntimeAuthoring is created without a root control...", {
		before: function () {
			return oComponentPromise;
		},
		beforeEach: function() {
			this.oRta = new RuntimeAuthoring({
				rootControl: undefined
			});
		},
		afterEach: function() {
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
		before: function () {
			return oComponentPromise;
		},
		beforeEach: function() {
			var oCommandFactory = new CommandFactory();

			this.oContextMenuPlugin = new ContextMenuPlugin("nonDefaultContextMenu");
			this.oRemovePlugin = new Remove({
				id: "nonDefaultRemovePlugin",
				commandFactory: oCommandFactory
			});

			this.oRta = new RuntimeAuthoring({
				rootControl: oCompCont.getComponentInstance().getAggregation("rootControl"),
				showToolbars: false
			});

			this.oRta.setPlugins({
				remove: this.oRemovePlugin,
				contextMenu: this.oContextMenuPlugin
			});

			this.oPreparePluginsSpy = sinon.spy(this.oRta.getPluginManager(), "preparePlugins");

			return RtaQunitUtils.clear()
				.then(this.oRta.start.bind(this.oRta));
		},
		afterEach: function() {
			this.oContextMenuPlugin.destroy();
			this.oRemovePlugin.destroy();
			this.oRta.destroy();
			sandbox.restore();
			return RtaQunitUtils.clear();
		}
	}, function() {
		QUnit.test("when we check the plugins on RTA", function(assert) {
			sandbox.stub(ReloadInfoAPI, "initialDraftGotActivated").returns(false);
			assert.equal(this.oRta.getPlugins()['contextMenu'].getId(), this.oContextMenuPlugin.getId(), " then the custom ContextMenuPlugin is set");
			assert.equal(this.oRta.getPlugins()['rename'], undefined, " and the default plugins are not loaded");
			assert.equal(this.oPreparePluginsSpy.callCount, 1, " and getPluginManager.preparePlugins() have been called 1 time on oRta.start()");
		});
	});

	QUnit.module("Given that RTA is started in FLP", {
		before: function () {
			return oComponentPromise;
		},
		beforeEach: function() {
			this.oRta = new RuntimeAuthoring({
				rootControl: oCompCont.getComponentInstance().getAggregation("rootControl"),
				showToolbars: false
			});
			sandbox.stub(Versions, "getVersionsModel").returns({
				getProperty: function () {
					return true;
				}
			});
			this.fnEnableRestartSpy = sandbox.spy(RuntimeAuthoring, "enableRestart");
			this.fnFLPToExternalStub = sandbox.spy();

			givenAnFLP.call(this, this.fnFLPToExternalStub);
		},
		afterEach: function() {
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
			whenUserConfirmsMessage.call(this, "MSG_PERSONALIZATION_OR_PUBLIC_VIEWS_EXISTS", assert);

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
		before: function () {
			return oComponentPromise;
		},
		beforeEach: function() {
			this.oRta = new RuntimeAuthoring({
				rootControl: oCompCont.getComponentInstance().getAggregation("rootControl"),
				showToolbars: false
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
			givenAnFLP(function() {return true;}, undefined, {"sap-ui-fl-version": [sap.ui.fl.Versions.Draft.toString()]});
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
			givenDraftParameterIsSet.call(this, this.fnFLPToExternalStub);
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
			givenDraftParameterIsSet.call(this, this.fnFLPToExternalStub);
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
			var fnTriggerRealodStub = sandbox.stub();
			givenNoParameterIsSet.call(this, this.fnFLPToExternalStub, fnTriggerRealodStub);
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
				assert.equal(fnTriggerRealodStub.callCount,
					1, "then crossAppNavigation was triggered without changing the url");
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
			}.bind(this));
		});
	});

	QUnit.module("Given that RTA is started in FLP with sap-ui-fl-max-layer already in the URL", {
		before: function () {
			return oComponentPromise;
		},
		beforeEach: function() {
			this.oRta = new RuntimeAuthoring({
				rootControl: oCompCont.getComponentInstance().getAggregation("rootControl"),
				showToolbars: false
			});
			whenNoAppDescriptorChangesExist(this.oRta);

			this.fnEnableRestartSpy = sandbox.spy(RuntimeAuthoring, "enableRestart");
			this.fnTriggerCrossAppNavigationSpy = sandbox.stub(this.oRta, "_triggerCrossAppNavigation");
			sandbox.spy(this.oRta, "_handleUrlParameterOnExit");
			this.fnFLPToExternalStub = sandbox.spy();

			return this.oRta._initVersioning();
		},
		afterEach: function() {
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when personalized changes exist and started in FLP reloading the personalization...", function(assert) {
			sandbox.stub(ReloadInfoAPI, "initialDraftGotActivated").returns(false);
			givenMaxLayerParameterIsSetTo.call(this, Layer.CUSTOMER, this.fnFLPToExternalStub);
			whenHigherLayerChangesExist();

			whenUserConfirmsMessage.call(this, "MSG_RELOAD_WITH_PERSONALIZATION_AND_VIEWS", assert);

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

			whenUserConfirmsMessage.call(this, "MSG_RELOAD_WITH_PERSONALIZATION_AND_VIEWS", assert);

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
				needsReload: function(bReload) {
					return Promise.resolve(bReload);
				},
				saveCommands: function() {}
			};
			var fnNeedsReloadStub = sandbox.stub(this.oRta._oSerializer, "needsReload");
			givenMaxLayerParameterIsSetTo.call(this, Layer.CUSTOMER, this.fnFLPToExternalStub);
			fnNeedsReloadStub.onFirstCall().resolves(false);
			fnNeedsReloadStub.onSecondCall().resolves(true);
			whenUserConfirmsMessage.call(this, "MSG_RELOAD_WITH_PERSONALIZATION_AND_VIEWS", assert);

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

			whenUserConfirmsMessage.call(this, "MSG_RELOAD_WITH_PERSONALIZATION_AND_VIEWS", assert);

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

			whenUserConfirmsMessage.call(this, "MSG_RELOAD_WITH_PERSONALIZATION_AND_VIEWS", assert);

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
			whenUserConfirmsMessage.call(this, "MSG_RELOAD_WITH_PERSONALIZATION_AND_VIEWS", assert);

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

			whenUserConfirmsMessage.call(this, "MSG_RELOAD_WITH_PERSONALIZATION_AND_VIEWS", assert);

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
			whenUserConfirmsMessage.call(this, "MSG_RELOAD_WITH_PERSONALIZATION_AND_VIEWS", assert);

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
		before: function () {
			return oComponentPromise;
		},
		beforeEach: function() {
			this.oRta = new RuntimeAuthoring({
				rootControl: oCompCont.getComponentInstance().getAggregation("rootControl"),
				showToolbars: false
			});
		},
		afterEach: function() {
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
		before: function () {
			return oComponentPromise;
		},
		beforeEach: function() {
			this.oRta = new RuntimeAuthoring({
				rootControl: oCompCont.getComponentInstance().getAggregation("rootControl"),
				showToolbars: false
			});
			whenNoAppDescriptorChangesExist(this.oRta);

			this.fnEnableRestartSpy = sandbox.spy(RuntimeAuthoring, "enableRestart");
			this.fnHandleParametersForStandalone = sandbox.stub(ReloadInfoAPI, "handleUrlParametersForStandalone");
			this.fnHandleParametersOnExitStub =
				sandbox.stub(this.oRta, "_handleUrlParameterOnExit");
			this.fnReloadPageStub = sandbox.stub(this.oRta, "_reloadPage");

			return this.oRta._initVersioning();
		},
		afterEach: function() {
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
			var oHasVersionParameterSpy = sandbox.spy(FlexUtils, "getParameter");
			var oTriggerHardReloadStub = sandbox.stub(this.oRta, "_triggerHardReload");

			this.fnHandleParametersForStandalone.returns(document.location.search);
			return this.oRta._determineReload().then(function() {
				assert.equal(oHasMaxLayerParameterSpy.callCount, 1, "hasMaxLayerParameterWithValue is called");
				assert.ok(oHasVersionParameterSpy.calledWith(sap.ui.fl.Versions.UrlParameter), "the version parameter was checked");
				assert.equal(oTriggerHardReloadStub.callCount, 1, "_triggerHardReload is called");
			});
		});

		QUnit.test("when the _determineReload() method is called with draft but parameter already set", function(assert) {
			sandbox.stub(FeaturesAPI, "isVersioningEnabled").returns(Promise.resolve(true));
			sandbox.stub(VersionsAPI, "isDraftAvailable").returns(true);
			sandbox.stub(ReloadInfoAPI, "hasMaxLayerParameterWithValue").returns(true);
			sandbox.stub(FlexUtils, "getParameter").returns(sap.ui.fl.Versions.Draft.toString());
			var fnGetReloadMessageOnStartSpy = sandbox.spy(this.oRta, "_getReloadMessageOnStart");
			var oTriggerHardReloadStub = sandbox.stub(this.oRta, "_triggerHardReload");

			this.fnHandleParametersForStandalone.returns(document.location.search);
			return this.oRta._determineReload().then(function() {
				assert.equal(this.fnHandleParametersForStandalone.callCount, 0, "handleUrlParameterForStandalone is not called");
				assert.equal(fnGetReloadMessageOnStartSpy.callCount, 0, "_getReloadMessageOnStart is not called");
				assert.equal(oTriggerHardReloadStub.callCount, 0, "_triggerHardReload is not called");
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
			whenUserConfirmsMessage.call(this, "MSG_RELOAD_WITH_PERSONALIZATION_AND_VIEWS", assert);

			return this.oRta._handleReloadOnExit().then(function(oReloadInfo) {
				assert.equal(this.fnEnableRestartSpy.callCount, 0,
					"then RTA restart will not be enabled");
				assert.strictEqual(oReloadInfo.reloadMethod, this.oRta._RELOAD.RELOAD_PAGE,
					"then the page is reloaded");
			}.bind(this));
		});

		QUnit.test("when _handleReloadOnExit() is called and personalized changes and user exits reloading the personalization with draft", function(assert) {
			sandbox.stub(this.oRta, "_isDraftAvailable").returns(true);
			sandbox.stub(ReloadInfoAPI, "hasVersionParameterWithValue").returns(true);
			sandbox.stub(ReloadInfoAPI, "hasMaxLayerParameterWithValue").returns(true);
			sandbox.stub(ReloadInfoAPI, "initialDraftGotActivated").returns(false);

			whenUserConfirmsMessage.call(this, "MSG_RELOAD_WITH_VIEWS_PERSONALIZATION_AND_WITHOUT_DRAFT", assert);

			return this.oRta._handleReloadOnExit().then(function(oReloadInfo) {
				assert.equal(this.fnEnableRestartSpy.callCount, 0,
					"then RTA restart will not be enabled");
				assert.strictEqual(oReloadInfo.reloadMethod, this.oRta._RELOAD.RELOAD_PAGE,
					"then the page is reloaded");
			}.bind(this));
		});

		QUnit.test("when _handleReloadOnExit() is called and personalized changes and user exits reloading the personalization with avtivated version", function(assert) {
			sandbox.stub(this.oRta, "_isDraftAvailable").returns(true);
			sandbox.stub(ReloadInfoAPI, "hasVersionParameterWithValue").returns(true);
			sandbox.stub(ReloadInfoAPI, "hasMaxLayerParameterWithValue").returns(true);
			sandbox.stub(ReloadInfoAPI, "initialDraftGotActivated").returns(true);

			whenUserConfirmsMessage.call(this, "MSG_RELOAD_WITH_PERSONALIZATION_AND_VIEWS", assert);

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
			var oTriggerHardReloadStub = sandbox.stub(this.oRta, "_triggerHardReload");

			this.oRta._handleDiscard();
			assert.equal(oTriggerHardReloadStub.callCount, 1, "then _triggerHardReload is called");
			var oReloadInfo = oTriggerHardReloadStub.getCall(0).args[0];
			assert.equal(oReloadInfo.layer, Layer.CUSTOMER, "with CUSTOMER layer");
			assert.equal(oReloadInfo.isDraftAvailable, false, "and with no draft change");
		});

		QUnit.test("when _deleteChanges() is called", function(assert) {
			return this.oRta._deleteChanges().then(function() {
				assert.equal(this.fnHandleParametersOnExitStub.callCount, 1, "then _handleParameterOnExit is called");
				var oReloadInfo = this.fnHandleParametersOnExitStub.getCall(0).args[0];
				assert.equal(oReloadInfo.layer, Layer.CUSTOMER, "with CUSTOMER layer");
				assert.equal(oReloadInfo.isDraftAvailable, false, "and with no draft change");
			}.bind(this));
		});

		QUnit.test("when _triggerHardReload() is called and the url does not need adjustment", function(assert) {
			this.fnHandleParametersForStandalone.returns(document.location.search);
			this.oRta._triggerHardReload({});
			assert.equal(this.fnReloadPageStub.calledOnce, true, "reload was triggered");
		});
	});

	QUnit.module("Given that RuntimeAuthoring is available with a view as rootControl ...", {
		before: function () {
			return oComponentPromise;
		},
		beforeEach: function() {
			sandbox = sinon.sandbox.create();
			var oSettings = {
				isAtoAvailable: false,
				isKeyUser: true,
				isProductiveSystem: true,
				versioning: {}
			};
			var oSettingsInstance = new Settings(oSettings);
			this.oRta = new RuntimeAuthoring({
				rootControl: oCompCont.getComponentInstance().getAggregation("rootControl")
			});
			sandbox.stub(Settings, "getInstance").returns(Promise.resolve(oSettingsInstance));

			return this.oRta.start();
		},
		afterEach: function() {
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
		before: function () {
			return oComponentPromise;
		},
		beforeEach: function() {
			sandbox = sinon.sandbox.create();
			var oSettings = {
				isAtoAvailable: true,
				isKeyUser: true,
				isProductiveSystem: false,
				versioning: {}
			};
			var oSettingsInstance = new Settings(oSettings);
			this.oRta = new RuntimeAuthoring({
				rootControl: oCompCont.getComponentInstance().getAggregation("rootControl")
			});
			sandbox.stub(Settings, "getInstance").returns(Promise.resolve(oSettingsInstance));

			return this.oRta.start();
		},
		afterEach: function() {
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
		before: function () {
			return oComponentPromise;
		},
		beforeEach: function() {
			this.oRootControl = oCompCont.getComponentInstance().getAggregation("rootControl");
			this.oRta = new RuntimeAuthoring({
				rootControl: this.oRootControl
			});
			givenAnFLP(function() {return true;}, undefined, {"sap-ui-fl-version": [sap.ui.fl.Versions.Draft.toString()]});
		},
		afterEach: function() {
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
	});

	QUnit.module("Given that RuntimeAuthoring in the VENDOR layer was started within an FLP and wants to determine if a reload is needed on exit", {
		before: function () {
			return oComponentPromise;
		},
		beforeEach: function() {
			givenAnFLP(function() {return true;}, undefined, {});
			this.oRootControl = oCompCont.getComponentInstance().getAggregation("rootControl");
			this.oRta = new RuntimeAuthoring({
				rootControl: this.oRootControl,
				showToolbars: false,
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
