/* global QUnit */

sap.ui.define([
	"qunit/RtaQunitUtils",
	"sap/base/util/isEmptyObject",
	"sap/base/util/UriParameters",
	"sap/m/MessageToast",
	"sap/m/Page",
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/Core",
	"sap/ui/model/json/JSONModel",
	"sap/ui/dt/plugin/TabHandling",
	"sap/ui/dt/util/ZIndexManager",
	"sap/ui/dt/DesignTime",
	"sap/ui/fl/apply/api/FlexRuntimeInfoAPI",
	"sap/ui/fl/write/api/Version",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/write/_internal/Versions",
	"sap/ui/fl/write/api/ControlPersonalizationWriteAPI",
	"sap/ui/fl/write/api/FeaturesAPI",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/fl/write/api/ReloadInfoAPI",
	"sap/ui/fl/write/api/TranslationAPI",
	"sap/ui/fl/write/api/VersionsAPI",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/rta/appVariant/AppVariantUtils",
	"sap/ui/rta/appVariant/Feature",
	"sap/ui/rta/command/BaseCommand",
	"sap/ui/rta/command/Stack",
	"sap/ui/rta/plugin/Stretch",
	"sap/ui/rta/RuntimeAuthoring",
	"sap/ui/rta/Utils",
	"sap/ui/thirdparty/sinon-4"
], function(
	RtaQunitUtils,
	isEmptyObject,
	UriParameters,
	MessageToast,
	Page,
	ComponentContainer,
	Core,
	JSONModel,
	TabHandling,
	ZIndexManager,
	DesignTime,
	FlexRuntimeInfoAPI,
	Version,
	Settings,
	Versions,
	ControlPersonalizationWriteAPI,
	FeaturesAPI,
	PersistenceWriteAPI,
	ReloadInfoAPI,
	TranslationAPI,
	VersionsAPI,
	Layer,
	FlexUtils,
	AppVariantUtils,
	AppVariantFeature,
	BaseCommand,
	Stack,
	Stretch,
	RuntimeAuthoring,
	Utils,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	var oTextResources = Core.getLibraryResourceBundle("sap.ui.rta");
	var oComp = RtaQunitUtils.createAndStubAppComponent(sinon, "someId", {
		"sap.app": {
			id: "someId"
		}
	}, new Page("mockPage"));
	new ComponentContainer({
		component: oComp
	}).placeAt("qunit-fixture");

	function givenAnFLP(fnFLPToExternalStub, fnFLPReloadStub, mShellParams) {
		sandbox.stub(FlexUtils, "getUshellContainer").returns({
			getServiceAsync: function() {
				return Promise.resolve({
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
					registerNavigationFilter: function() {},
					reloadCurrentApp: fnFLPReloadStub,
					getUser: function() {}
				});
			}
		});
	}

	function stubUShellService(oRta, mSettings) {
		return sandbox.stub(oRta, "_getUShellService").returns({
			getHash: function() {
				return "Action-somestring";
			},
			parseShellHash: function() {
				var mHash = {
					semanticObject: "Action",
					action: "somestring"
				};

				mHash.params = mSettings.mHashParameters;
				return mHash;
			},
			toExternal: mSettings.fnToExternal,
			reloadCurrentApp: mSettings.fnReload
		});
	}

	function stubAppDescriptorChanges(oRta, bExist) {
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
		stubAppDescriptorChanges(oRta, true);
	}

	function whenNoAppDescriptorChangesExist(oRta) {
		stubAppDescriptorChanges(oRta, false);
	}

	function stubPersonalizationChanges(bExist) {
		sandbox.stub(PersistenceWriteAPI, "hasHigherLayerChanges").resolves(bExist);
	}

	function whenHigherLayerChangesExist(sLayer) {
		stubPersonalizationChanges(true, sLayer);
	}

	function whenNoHigherLayerChangesExist() {
		stubPersonalizationChanges(false);
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

	function cleanInfoSessionStorage() {
		var sFlexReference = FlexRuntimeInfoAPI.getFlexReference({element: oComp});
		window.sessionStorage.removeItem("sap.ui.fl.info." + sFlexReference);
	}

	QUnit.module("Given that RTA gets started in FLP", {
		beforeEach: function() {
			this.fnFLPToExternalStub = sandbox.spy();
			this.fnTriggerRealoadStub = sandbox.stub();
			givenAnFLP(this.fnFLPToExternalStub, this.fnTriggerRealoadStub, {"sap-ui-fl-version": [Version.Number.Draft]});

			this.oRta = new RuntimeAuthoring({
				rootControl: oComp,
				showToolbars: false
			});
			whenNoAppDescriptorChangesExist(this.oRta);
			this.fnEnableRestartSpy = sandbox.spy(RuntimeAuthoring, "enableRestart");
			sandbox.stub(this.oRta, "_reloadPage");
			this.fnTriggerCrossAppNavigationSpy = sandbox.spy(this.oRta, "_triggerCrossAppNavigation");
			this.fnHandleParametersOnExitStub = sandbox.spy(this.oRta, "_handleUrlParameterOnExit");

			return this.oRta._initVersioning();
		},
		afterEach: function() {
			this.oRta.destroy();
			RuntimeAuthoring.disableRestart(Layer.CUSTOMER);
			RuntimeAuthoring.disableRestart(Layer.VENDOR);
			sandbox.restore();
		}
	}, function() {
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

		QUnit.test("when draft changes are available, RTA is started and user exists", function(assert) {
			sandbox.stub(ReloadInfoAPI, "initialDraftGotActivated").returns(false);
			sandbox.stub(PersistenceWriteAPI, "hasHigherLayerChanges").resolves(false);
			sandbox.stub(this.oRta, "_isDraftAvailable").returns(true);

			whenUserConfirmsMessage.call(this, "MSG_RELOAD_WITHOUT_DRAFT", assert);

			return this.oRta._handleReloadOnExit()
			.then(function(oReloadInfo) {
				assert.equal(this.fnEnableRestartSpy.callCount, 0, "then RTA restart will not be enabled");
				assert.strictEqual(oReloadInfo.reloadMethod, this.oRta._RELOAD.VIA_HASH, "then the correct reload reason is triggered");
			}.bind(this));
		});

		QUnit.test("when draft changes already existed when entering and user exits RTA...", function(assert) {
			var oReloadInfo = {
				reloadMethod: this.oRta._RELOAD.VIA_HASH,
				hasVersionUrlParameter: true
			};
			sandbox.stub(this.oRta, "_handleReloadOnExit").resolves(oReloadInfo);
			sandbox.stub(this.oRta, "_serializeToLrep").resolves();

			return this.oRta.stop().then(function() {
				assert.equal(this.fnHandleParametersOnExitStub.callCount, 1, "then handleParametersOnExit was called");
				assert.equal(this.fnTriggerCrossAppNavigationSpy.callCount, 1, "then crossAppNavigation was triggered");
				assert.equal(isReloadedWithDraftParameter(this.fnFLPToExternalStub), false, "then draft parameter is removed");
			}.bind(this));
		});

		QUnit.test("when draft changes already existed and the draft was activated and user exits RTA...", function(assert) {
			sandbox.stub(ReloadInfoAPI, "initialDraftGotActivated").returns(true);
			sandbox.stub(this.oRta, "_serializeToLrep").resolves();
			sandbox.stub(this.oRta, "_handleReloadMessageBoxOnExit").resolves();

			return this.oRta.stop().then(function() {
				assert.equal(this.fnHandleParametersOnExitStub.callCount, 1, "then handleParametersOnExit was called");
				assert.equal(this.fnTriggerCrossAppNavigationSpy.callCount, 1, "then crossAppNavigation was triggered");
				assert.equal(isReloadedWithDraftParameter(this.fnFLPToExternalStub), false, "then draft parameter is removed");
			}.bind(this));
		});

		QUnit.test("when no draft was present and dirty changes were made after entering RTA and user exits RTA...", function(assert) {
			sandbox.stub(ReloadInfoAPI, "initialDraftGotActivated").returns(false);
			var fnTriggerReloadStub = sandbox.stub();
			stubUShellService(this.oRta, {
				fnReload: fnTriggerReloadStub,
				fnToExternal: this.fnFLPToExternalStub,
				mHashParameters: {}
			});
			var oReloadInfo = {
				reloadMethod: this.oRta._RELOAD.VIA_HASH,
				hasHigherLayerChanges: false
			};
			sandbox.stub(this.oRta, "_handleReloadOnExit").resolves(oReloadInfo);
			sandbox.stub(this.oRta, "_serializeToLrep").resolves();
			sandbox.stub(this.oRta, "_isDraftAvailable").returns(true);

			return this.oRta.stop().then(function() {
				assert.equal(this.fnHandleParametersOnExitStub.callCount, 1, "then handleParametersOnExit was called");
				assert.equal(fnTriggerReloadStub.callCount, 1, "then crossAppNavigation was triggered without changing the url");
			}.bind(this));
		});

		QUnit.test("when no draft was present and dirty changes were made after entering RTA and user exits RTA...", function(assert) {
			sandbox.stub(ReloadInfoAPI, "initialDraftGotActivated").returns(false);
			var fnTriggerReloadStub = sandbox.stub();
			stubUShellService(this.oRta, {
				fnReload: fnTriggerReloadStub,
				fnToExternal: this.fnFLPToExternalStub,
				mHashParameters: {}
			});
			var oReloadInfo = {
				reloadMethod: this.oRta._RELOAD.VIA_HASH,
				hasHigherLayerChanges: true
			};
			sandbox.stub(this.oRta, "_handleReloadOnExit").resolves(oReloadInfo);
			sandbox.stub(this.oRta, "_serializeToLrep").resolves();
			sandbox.stub(this.oRta, "_isDraftAvailable").returns(true);

			return this.oRta.stop().then(function() {
				assert.equal(this.fnHandleParametersOnExitStub.callCount, 1, "then handleParametersOnExit was called");
				assert.equal(fnTriggerReloadStub.callCount, 0, "then reloadCurrentApp was not triggered because the max layer parameter gets removed");
			}.bind(this));
		});

		QUnit.test("when no versioning is available and dirty changes were made after entering RTA and user exits RTA...", function(assert) {
			var oReloadInfo = {
				reloadMethod: this.oRta._RELOAD.VIA_HASH
			};
			sandbox.stub(this.oRta, "_handleReloadOnExit").resolves(oReloadInfo);
			sandbox.stub(this.oRta, "_serializeToLrep").resolves();
			sandbox.stub(this.oRta, "_isDraftAvailable").returns(false);

			return this.oRta.stop().then(function() {
				assert.equal(this.fnHandleParametersOnExitStub.callCount, 1, "then handleParametersOnExit was called");
				assert.equal(this.fnTriggerRealoadStub.callCount, 1, "then reloadCurrentApp was triggered");
				assert.equal(this.fnTriggerCrossAppNavigationSpy.callCount, 0, "then crossAppNavigation was not triggered");
			}.bind(this));
		});

		QUnit.test("when all context is loaded without higher layer changes after entering RTA and user exits RTA...", function(assert) {
			var oReloadInfo = {
				reloadMethod: this.oRta._RELOAD.VIA_HASH,
				hasHigherLayerChanges: false,
				allContexts: true
			};
			sandbox.stub(this.oRta, "_handleReloadOnExit").resolves(oReloadInfo);
			sandbox.stub(this.oRta, "_serializeToLrep").resolves();

			return this.oRta.stop().then(function() {
				assert.equal(this.fnHandleParametersOnExitStub.callCount, 1, "then handleParametersOnExit was called");
				assert.equal(this.fnTriggerRealoadStub.callCount, 1, "then reloadCurrentApp was trigger");
				assert.equal(this.fnTriggerCrossAppNavigationSpy.callCount, 0, "then crossAppNavigation was not triggered");
			}.bind(this));
		});

		QUnit.test("when all context is loaded with higher layer changes after entering RTA and user exits RTA...", function(assert) {
			var oReloadInfo = {
				reloadMethod: this.oRta._RELOAD.VIA_HASH,
				hasHigherLayerChanges: true,
				allContexts: true
			};
			sandbox.stub(this.oRta, "_handleReloadOnExit").resolves(oReloadInfo);
			sandbox.stub(this.oRta, "_serializeToLrep").resolves();

			return this.oRta.stop().then(function() {
				assert.equal(this.fnHandleParametersOnExitStub.callCount, 1, "then handleParametersOnExit was called");
				assert.equal(this.fnTriggerRealoadStub.callCount, 0, "then reloadCurrentApp was not triggered");
				assert.equal(this.fnTriggerCrossAppNavigationSpy.callCount, 1, "then crossAppNavigation was triggered");
			}.bind(this));
		});
	});

	QUnit.module("Given that RTA is started in FLP with sap-ui-fl-max-layer already in the URL", {
		beforeEach: function() {
			this.fnFLPToExternalStub = sandbox.spy();
			givenAnFLP(this.fnFLPToExternalStub, sandbox.stub(), {"sap-ui-fl-max-layer": [Layer.CUSTOMER]});
			this.oRta = new RuntimeAuthoring({
				rootControl: oComp,
				showToolbars: false
			});
			whenNoAppDescriptorChangesExist(this.oRta);

			this.fnEnableRestartSpy = sandbox.spy(RuntimeAuthoring, "enableRestart");
			this.fnTriggerCrossAppNavigationSpy = sandbox.stub(this.oRta, "_triggerCrossAppNavigation");
			sandbox.spy(this.oRta, "_handleUrlParameterOnExit");

			return this.oRta._initVersioning();
		},
		afterEach: function() {
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when personalized changes exist and started in FLP reloading the personalization...", function(assert) {
			sandbox.stub(ReloadInfoAPI, "initialDraftGotActivated").returns(false);

			whenHigherLayerChangesExist();

			whenUserConfirmsMessage.call(this, "MSG_RELOAD_WITH_PERSONALIZATION_AND_VIEWS", assert);

			return this.oRta._handleReloadOnExit().then(function(oReloadInfo) {
				assert.equal(this.fnEnableRestartSpy.callCount, 0, "then RTA restart will not be enabled");
				assert.strictEqual(oReloadInfo.reloadMethod, this.oRta._RELOAD.VIA_HASH, "then the page is reloaded");
			}.bind(this));
		});

		QUnit.test("when higher layer changes exist, RTA is started above CUSTOMER layer and user exits and started in FLP reloading the personalization...", function(assert) {
			sandbox.stub(ReloadInfoAPI, "initialDraftGotActivated").returns(false);
			stubUShellService(this.oRta, {
				fnReload: sandbox.stub(),
				fnToExternal: this.fnFLPToExternalStub,
				mHashParameters: {"sap-ui-fl-max-layer": [Layer.VENDOR]}
			});
			whenStartedWithLayer(this.oRta, Layer.VENDOR);
			whenHigherLayerChangesExist(Layer.VENDOR);
			whenUserConfirmsMessage.call(this, "MSG_RELOAD_WITH_ALL_CHANGES", assert);

			return this.oRta._handleReloadOnExit().then(function(oReloadInfo) {
				assert.equal(this.fnEnableRestartSpy.callCount, 0, "then RTA restart will not be enabled");
				assert.strictEqual(oReloadInfo.reloadMethod, this.oRta._RELOAD.VIA_HASH, "then the page is reloaded");
			}.bind(this));
		});

		QUnit.test("when app descriptor and personalized changes exist and user exits reloading the personalization...", function(assert) {
			sandbox.stub(ReloadInfoAPI, "initialDraftGotActivated").returns(false);
			whenAppDescriptorChangesExist(this.oRta);
			whenHigherLayerChangesExist();

			whenUserConfirmsMessage.call(this, "MSG_RELOAD_WITH_PERSONALIZATION_AND_VIEWS", assert);

			return this.oRta._handleReloadOnExit().then(function(oReloadInfo) {
				assert.equal(this.fnEnableRestartSpy.callCount, 0, "then RTA restart will not be enabled");
				assert.strictEqual(oReloadInfo.reloadMethod, this.oRta._RELOAD.RELOAD_PAGE, "then the reload page is triggered to update the flp cache");
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
			fnNeedsReloadStub.onFirstCall().resolves(false);
			fnNeedsReloadStub.onSecondCall().resolves(true);
			whenUserConfirmsMessage.call(this, "MSG_RELOAD_WITH_PERSONALIZATION_AND_VIEWS", assert);

			return this.oRta._serializeToLrep()
			.then(this.oRta._handleReloadOnExit.bind(this.oRta))
			.then(function(oReloadInfo) {
				assert.equal(this.fnEnableRestartSpy.callCount, 0, "then RTA restart will not be enabled");
				assert.equal(fnNeedsReloadStub.callCount, 2, "then the reload check is called once");
				assert.strictEqual(oReloadInfo.reloadMethod, this.oRta._RELOAD.RELOAD_PAGE, "then the reload page is triggered to update the flp cache");
			}.bind(this));
		});

		QUnit.test("when app descriptor changes exist and user publishes and afterwards exits ...", function(assert) {
			sandbox.stub(ReloadInfoAPI, "initialDraftGotActivated").returns(false);
			whenAppDescriptorChangesExist(this.oRta);
			var fnNeedsReloadSpy = sandbox.spy(this.oRta._oSerializer, "needsReload");

			whenUserConfirmsMessage.call(this, "MSG_RELOAD_WITH_PERSONALIZATION_AND_VIEWS", assert);

			return this.oRta._serializeToLrep()
			.then(this.oRta._handleReloadOnExit.bind(this.oRta))
			.then(function(oReloadInfo) {
				assert.equal(this.fnEnableRestartSpy.callCount, 0, "then RTA restart will not be enabled");
				assert.equal(fnNeedsReloadSpy.callCount, 1, "then the reload check is called once");
				assert.strictEqual(oReloadInfo.reloadMethod, this.oRta._RELOAD.RELOAD_PAGE, "then the reload page is triggered to update the flp cache");
			}.bind(this));
		});

		QUnit.test("when app descriptor changes exist and user exits ...", function(assert) {
			sandbox.stub(ReloadInfoAPI, "initialDraftGotActivated").returns(false);
			whenAppDescriptorChangesExist(this.oRta);
			var fnNeedsReloadSpy = sandbox.spy(this.oRta._oSerializer, "needsReload");

			whenUserConfirmsMessage.call(this, "MSG_RELOAD_WITH_PERSONALIZATION_AND_VIEWS", assert);

			return this.oRta._handleReloadOnExit()
			.then(function(oReloadInfo) {
				assert.equal(this.fnEnableRestartSpy.callCount, 0, "then RTA restart will not be enabled");
				assert.equal(fnNeedsReloadSpy.callCount, 1, "then the reload check is called once");
				assert.strictEqual(oReloadInfo.reloadMethod, this.oRta._RELOAD.RELOAD_PAGE, "then the reload page is triggered to update the flp cache");
			}.bind(this));
		});

		QUnit.test("when there are no personalized and appDescriptor changes and _handleReloadOnExit() is called", function(assert) {
			sandbox.stub(ReloadInfoAPI, "initialDraftGotActivated").returns(false);
			whenUserConfirmsMessage.call(this, "MSG_RELOAD_WITH_PERSONALIZATION_AND_VIEWS", assert);

			return this.oRta._handleReloadOnExit().then(function(oReloadInfo) {
				assert.equal(this.fnEnableRestartSpy.callCount, 0, "then RTA restart will not be enabled");
				assert.strictEqual(oReloadInfo.reloadMethod, this.oRta._RELOAD.VIA_HASH, "then we reload to remove the max-layer parameter");
			}.bind(this));
		});

		QUnit.test("when app descriptor and no personalized changes exist and user exits reloading the personalization...", function(assert) {
			sandbox.stub(ReloadInfoAPI, "initialDraftGotActivated").returns(false);
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
			sandbox.spy(this.oRta, "_handleReloadOnExit");
			sandbox.stub(this.oRta, "_serializeToLrep").resolves();
			whenUserConfirmsMessage.call(this, "MSG_RELOAD_WITH_PERSONALIZATION_AND_VIEWS", assert);

			return this.oRta.stop().then(function() {
				assert.equal(this.fnTriggerCrossAppNavigationSpy.callCount, 1, "then page reload is triggered");
				assert.strictEqual(isReloadedWithMaxLayerParameter(this.fnFLPToExternalStub), false, "then max layer parameter is removed");
			}.bind(this));
		});
	});

	QUnit.module("Given that RTA is started on stand-alone applications", {
		beforeEach: function() {
			this.oRta = new RuntimeAuthoring({
				rootControl: oComp,
				showToolbars: false
			});
			whenNoAppDescriptorChangesExist(this.oRta);

			this.fnEnableRestartSpy = sandbox.spy(RuntimeAuthoring, "enableRestart");
			this.fnReloadPageStub = sandbox.stub(this.oRta, "_reloadPage");

			return this.oRta._initVersioning();
		},
		afterEach: function() {
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function() {
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
				assert.equal(this.fnEnableRestartSpy.callCount, 0, "then RTA restart will not be enabled");
				assert.strictEqual(oReloadInfo.reloadMethod, this.oRta._RELOAD.RELOAD_PAGE, "then the page is reloaded");
			}.bind(this));
		});

		QUnit.test("when _handleReloadOnExit() is called and personalized changes and user exits reloading the personalization with draft", function(assert) {
			sandbox.stub(this.oRta, "_isDraftAvailable").returns(true);
			sandbox.stub(ReloadInfoAPI, "hasVersionParameterWithValue").returns(true);
			sandbox.stub(ReloadInfoAPI, "hasMaxLayerParameterWithValue").returns(true);
			sandbox.stub(ReloadInfoAPI, "initialDraftGotActivated").returns(false);

			whenUserConfirmsMessage.call(this, "MSG_RELOAD_WITH_VIEWS_PERSONALIZATION_AND_WITHOUT_DRAFT", assert);

			return this.oRta._handleReloadOnExit().then(function(oReloadInfo) {
				assert.equal(this.fnEnableRestartSpy.callCount, 0, "then RTA restart will not be enabled");
				assert.strictEqual(oReloadInfo.reloadMethod, this.oRta._RELOAD.RELOAD_PAGE, "then the page is reloaded");
			}.bind(this));
		});

		QUnit.test("when _handleReloadOnExit() is called and personalized changes and user exits reloading the personalization with avtivated version", function(assert) {
			sandbox.stub(this.oRta, "_isDraftAvailable").returns(true);
			sandbox.stub(ReloadInfoAPI, "hasVersionParameterWithValue").returns(true);
			sandbox.stub(ReloadInfoAPI, "hasMaxLayerParameterWithValue").returns(true);
			sandbox.stub(ReloadInfoAPI, "initialDraftGotActivated").returns(true);

			whenUserConfirmsMessage.call(this, "MSG_RELOAD_WITH_PERSONALIZATION_AND_VIEWS", assert);

			return this.oRta._handleReloadOnExit().then(function(oReloadInfo) {
				assert.equal(this.fnEnableRestartSpy.callCount, 0, "then RTA restart will not be enabled");
				assert.strictEqual(oReloadInfo.reloadMethod, this.oRta._RELOAD.RELOAD_PAGE, "then the page is reloaded");
			}.bind(this));
		});

		QUnit.test("when _handleReloadOnExit() is called, draft url parameter is set and draft changes are available", function(assert) {
			sandbox.stub(ReloadInfoAPI, "initialDraftGotActivated").returns(false);
			sandbox.stub(PersistenceWriteAPI, "hasHigherLayerChanges").resolves(false);
			sandbox.stub(this.oRta, "_isDraftAvailable").returns(true);
			sandbox.stub(ReloadInfoAPI, "hasVersionParameterWithValue").returns(true);

			whenUserConfirmsMessage.call(this, "MSG_RELOAD_WITHOUT_DRAFT", assert);

			return this.oRta._handleReloadOnExit().then(function(oReloadInfo) {
				assert.equal(this.fnEnableRestartSpy.callCount, 0, "then RTA restart will not be enabled");
				assert.strictEqual(oReloadInfo.reloadMethod, this.oRta._RELOAD.RELOAD_PAGE, "then the page is reloaded");
			}.bind(this));
		});

		QUnit.test("when _handleReloadOnExit() is called, draft url parameter is set and initial draft got activated", function(assert) {
			sandbox.stub(ReloadInfoAPI, "initialDraftGotActivated").returns(true);
			sandbox.stub(PersistenceWriteAPI, "hasHigherLayerChanges").resolves(false);
			sandbox.stub(this.oRta, "_isDraftAvailable").returns(true);
			sandbox.stub(ReloadInfoAPI, "hasVersionParameterWithValue").returns(true);
			whenUserConfirmsMessage.call(this, "MSG_RELOAD_ACTIVATED_DRAFT", assert);

			return this.oRta._handleReloadOnExit().then(function(oReloadInfo) {
				assert.equal(this.fnEnableRestartSpy.callCount, 0, "then RTA restart will not be enabled");
				assert.strictEqual(oReloadInfo.reloadMethod, this.oRta._RELOAD.RELOAD_PAGE, "then the page is reloaded to remove the parameter anyways");
			}.bind(this));
		});

		QUnit.test("when _handleReloadOnExit() is called and draft url parameter is set and no draft exists", function(assert) {
			sandbox.stub(ReloadInfoAPI, "initialDraftGotActivated").returns(false);
			sandbox.stub(PersistenceWriteAPI, "hasHigherLayerChanges").resolves(false);
			sandbox.stub(this.oRta, "_isDraftAvailable").returns(false);
			sandbox.stub(ReloadInfoAPI, "hasVersionParameterWithValue").returns(true);
			whenUserConfirmsMessage.call(this, "MSG_RELOAD_WITHOUT_DRAFT", assert);

			return this.oRta._handleReloadOnExit().then(function(oReloadInfo) {
				assert.equal(this.fnEnableRestartSpy.callCount, 0, "then RTA restart will not be enabled");
				assert.strictEqual(oReloadInfo.reloadMethod, this.oRta._RELOAD.RELOAD_PAGE, "then the page is reloaded");
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

		QUnit.test("when _triggerHardReload() is called and the url does not need adjustment", function(assert) {
			var oHandleParametersForStandalone = sandbox.stub(ReloadInfoAPI, "handleUrlParametersForStandalone");
			oHandleParametersForStandalone.returns(document.location.search);
			this.oRta._triggerHardReload({});
			assert.equal(this.fnReloadPageStub.calledOnce, true, "reload was triggered");
		});
	});

	QUnit.module("Given that RuntimeAuthoring is created", {
		beforeEach: function() {
			this.oRta = new RuntimeAuthoring({
				rootControl: oComp
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

		QUnit.test("and started without ATO in prod system", function(assert) {
			var oSettings = {
				isAtoAvailable: false,
				isKeyUser: true,
				isProductiveSystem: true,
				versioning: {}
			};
			var oSettingsInstance = new Settings(oSettings);
			this.oRta = new RuntimeAuthoring({
				rootControl: oComp
			});
			sandbox.stub(Settings, "getInstance").resolves(oSettingsInstance);

			return this.oRta.start().then(function() {
				assert.equal(this.oRta.getToolbar().getControl("restore").getVisible(), true, "then the Reset Button is still visible");
				assert.equal(this.oRta.getToolbar().getControl("publish").getVisible(), false, "then the Publish Button is invisible");
			}.bind(this));
		});

		QUnit.test("and started with ATO in non prod system", function(assert) {
			var oSettings = {
				isAtoAvailable: true,
				isKeyUser: true,
				isProductiveSystem: false,
				versioning: {},
				system: "someSystemId",
				client: "someClient"
			};
			var oSettingsInstance = new Settings(oSettings);
			sandbox.stub(Settings, "getInstance").resolves(oSettingsInstance);
			return this.oRta.start().then(function() {
				assert.equal(this.oRta.getToolbar().getControl("restore").getVisible(), true, "then the Reset Button is visible");
				assert.equal(this.oRta.getToolbar().getControl("publish").getVisible(), true, "then the Publish Button is visible");
			}.bind(this));
		});

		QUnit.test("when RTA is created with custom plugins and start is triggered", function(assert) {
			var oStretchPlugin = new Stretch("nonDefaultStretch");
			var oTabHandlingPlugin = new TabHandling("nonDefaultRemovePlugin");

			this.oRta.setPlugins({
				tabHandling: oTabHandlingPlugin,
				stretch: oStretchPlugin
			});
			var oPreparePluginsSpy = sinon.spy(this.oRta.getPluginManager(), "preparePlugins");

			return this.oRta.start().then(function() {
				assert.equal(this.oRta.getPlugins()["stretch"].getId(), oStretchPlugin.getId(), " then the custom stretch is set");
				assert.equal(this.oRta.getPlugins()["tabHandling"].getId(), oTabHandlingPlugin.getId(), " then the custom tabHandling is set");
				assert.equal(Object.keys(this.oRta.getPlugins()).length, 2, " and the default plugins are not loaded");
				assert.equal(oPreparePluginsSpy.callCount, 1, " and getPluginManager.preparePlugins() have been called once on oRta.start()");
			}.bind(this));
		});

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
		beforeEach: function() {
			givenAnFLP(function() {return true;}, undefined, {});
			this.oRta = new RuntimeAuthoring({
				rootControl: oComp,
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
		QUnit.test("a higher layer changes exist but no dirty draft changes", function(assert) {
			sandbox.stub(ReloadInfoAPI, "hasMaxLayerParameterWithValue").returns(true);
			whenUserConfirmsMessage.call(this, "MSG_RELOAD_WITH_ALL_CHANGES", assert);
			return this.oRta._handleReloadOnExit()
				.then(function(oReloadInfo) {
					assert.equal(oReloadInfo.reloadMethod, "CROSS_APP_NAVIGATION", "then a cross app is triggered");
				});
		});

		QUnit.test("a higher layer changes exist with dirty draft changes", function(assert) {
			sandbox.stub(ReloadInfoAPI, "hasMaxLayerParameterWithValue").returns(true);
			this.oRta._oVersionsModel.setProperty("/draftAvailable", true);
			this.oRta._oVersionsModel.setProperty("/dirtyChanges", true);
			whenUserConfirmsMessage.call(this, "MSG_RELOAD_WITH_ALL_CHANGES", assert);
			return this.oRta._handleReloadOnExit()
				.then(function(oReloadInfo) {
					assert.equal(oReloadInfo.reloadMethod, "CROSS_APP_NAVIGATION", "then a cross app is triggered");
				});
		});
	});

	QUnit.module("Given that RuntimeAuthoring is started", {
		beforeEach: function() {
			this.oRta = new RuntimeAuthoring({
				rootControl: oComp
			});

			this.oPreparePluginsSpy = sinon.spy(this.oRta.getPluginManager(), "preparePlugins");
			return this.oRta.start();
		},
		afterEach: function() {
			this.oRta.destroy();
			sandbox.restore();
			cleanInfoSessionStorage();
		}
	}, function() {
		QUnit.test("when a new commandstack is being set", function(assert) {
			var oInitialCommandStack = this.oRta.getCommandStack();
			var oDetachSpy = sandbox.spy(oInitialCommandStack, "detachModified");
			assert.ok(oInitialCommandStack, "the command stack is automatically created");

			var oNewStack = new Stack();
			var oAttachSpy = sandbox.spy(oNewStack, "attachModified");
			this.oRta.setCommandStack(oNewStack);

			assert.strictEqual(oAttachSpy.callCount, 1, "the new stack was attached to");
			assert.strictEqual(oDetachSpy.callCount, 1, "the old stack was detached from");
		});

		QUnit.test("when RTA is stopped and destroyed, the default plugins get created and destroyed", function(assert) {
			var done = assert.async();

			assert.equal(this.oPreparePluginsSpy.callCount, 1, " and getPluginManager.preparePlugins() have been called 1 time on oRta.start()");
			assert.ok(!isEmptyObject(this.oRta.getPlugins()), "then plugins are created on start");

			this.oRta.attachStop(function() {
				assert.ok(true, "the 'stop' event was fired");

				this.oRta.destroy();
				assert.strictEqual(jQuery(".sapUiRtaToolbar").length, 0, "... and Toolbar is destroyed.");
				done();
			}.bind(this));
			this.oRta.stop().then(function() {
				assert.ok(true, "then the promise got resolved");
			});
		});

		QUnit.test("when RTA is stopped it waits for pending actions", function(assert) {
			assert.expect(3);
			var done = assert.async();
			var fnResolve;
			var fnResolve2;
			var fnResolve3;
			var pPromise = new Promise(function(resolve) {
				fnResolve = resolve;
			});

			var oPushAndExecuteStub = sandbox.stub(this.oRta.getCommandStack(), "pushAndExecute").callsFake(function() {
				return new Promise(function(resolve) {
					fnResolve3 = resolve;
				});
			});

			var oWaitForBusyStub = sandbox.stub(this.oRta._oDesignTime, "waitForBusyPlugins").callsFake(function() {
				return new Promise(function(resolve) {
					fnResolve2 = resolve;

					var oEvent = {
						getParameter: function(sParameter) {
							if (sParameter === "command") {
								return new BaseCommand();
							}
						}
					};
					this.oRta._handleElementModified(oEvent);

					fnResolve();
				}.bind(this));
			}.bind(this));

			this.oRta.stop().then(function() {
				assert.ok(true, "the function resolves");
				done();
			});

			pPromise.then(function() {
				assert.strictEqual(oWaitForBusyStub.callCount, 1, "the wait function was already called");
				assert.strictEqual(oPushAndExecuteStub.callCount, 1, "the command was pushed");
				fnResolve2();
				fnResolve3();
			});
		});

		QUnit.test("when Mode is changed from adaptation to navigation and back to adaptation", function(assert) {
			var oTabHandlingPlugin = this.oRta.getPlugins()["tabHandling"];
			var oTabHandlingRemoveSpy = sandbox.spy(oTabHandlingPlugin, "removeTabIndex");
			var oTabHandlingRestoreSpy = sandbox.spy(oTabHandlingPlugin, "restoreTabIndex");
			var oTabHandlingRemoveOverlaySpy = sandbox.spy(oTabHandlingPlugin, "removeOverlayTabIndex");
			var oTabHandlingRestoreOverlaySpy = sandbox.spy(oTabHandlingPlugin, "restoreOverlayTabIndex");
			var oFireModeChangedSpy = sandbox.stub(this.oRta, "fireModeChanged");
			var oStopCutPasteStub = sandbox.stub(this.oRta.getPluginManager(), "handleStopCutPaste");

			this.oRta.setMode("navigation");
			assert.notOk(this.oRta._oDesignTime.getEnabled(), " in navigation mode the designTime property enabled is false");
			assert.equal(oTabHandlingRestoreSpy.callCount, 1, "restoreTabIndex was called");
			assert.equal(oTabHandlingRemoveOverlaySpy.callCount, 1, "removeOverlayTabIndex was called");
			assert.equal(oFireModeChangedSpy.callCount, 1, "the event ModeChanged was fired");
			assert.deepEqual(oFireModeChangedSpy.lastCall.args[0], {mode: "navigation"}, "the argument of the event is correct");
			assert.strictEqual(oStopCutPasteStub.callCount, 1, "the cut paste was stopped");

			// simulate mode change from toolbar
			this.oRta.getToolbar().fireModeChange({item: { getKey: function() {return "adaptation";}}});
			assert.ok(this.oRta._oDesignTime.getEnabled(), "in adaption mode the designTime property enabled is true again");
			assert.equal(oTabHandlingRemoveSpy.callCount, 1, "removeTabIndex was called");
			assert.equal(oTabHandlingRestoreOverlaySpy.callCount, 1, "restoreOverlayTabIndex was called");
			assert.equal(oFireModeChangedSpy.callCount, 2, "the event ModeChanged was fired again");
			assert.deepEqual(oFireModeChangedSpy.lastCall.args[0], {mode: "adaptation"}, "the argument of the event is correct");
			assert.strictEqual(oStopCutPasteStub.callCount, 1, "the cut paste was not stopped again");
		});

		QUnit.test("when Mode is changed from adaptation to visualization and back to adaptation", function(assert) {
			oComp.getRootControl().addStyleClass("sapUiDtOverlayMovable");
			var oTabHandlingPlugin = this.oRta.getPlugins()["tabHandling"];
			var oTabHandlingRemoveSpy = sandbox.spy(oTabHandlingPlugin, "removeTabIndex");
			var oTabHandlingRestoreSpy = sandbox.spy(oTabHandlingPlugin, "restoreTabIndex");
			var oTabHandlingRemoveOverlaySpy = sandbox.spy(oTabHandlingPlugin, "removeOverlayTabIndex");
			var oTabHandlingRestoreOverlaySpy = sandbox.spy(oTabHandlingPlugin, "restoreOverlayTabIndex");
			var oFireModeChangedSpy = sandbox.stub(this.oRta, "fireModeChanged");
			var oStopCutPasteStub = sandbox.stub(this.oRta.getPluginManager(), "handleStopCutPaste");

			this.oRta.setMode("visualization");
			assert.ok(this.oRta._oDesignTime.getEnabled(), "in visualization mode the designTime property enabled is true");
			assert.equal(oTabHandlingRestoreSpy.callCount, 0, "restoreTabIndex was not called");
			assert.equal(oTabHandlingRemoveOverlaySpy.callCount, 1, "removeOverlayTabIndex was called");
			assert.equal(oFireModeChangedSpy.callCount, 1, "the event ModeChanged was fired");
			assert.deepEqual(oFireModeChangedSpy.lastCall.args[0], {mode: "visualization"}, "the argument of the event is correct");
			assert.equal(jQuery(".sapUiDtOverlayMovable").css("cursor"), "default", "the movable overlays switched to the default cursor");
			assert.strictEqual(oStopCutPasteStub.callCount, 1, "the cut paste was stopped");

			// simulate mode change from toolbar
			this.oRta.getToolbar().fireModeChange({item: { getKey: function() {return "adaptation";}}});
			assert.ok(this.oRta._oDesignTime.getEnabled(), "in adaption mode the designTime property enabled is true");
			assert.equal(oTabHandlingRemoveSpy.callCount, 0, "removeTabIndex was not called");
			assert.equal(oTabHandlingRestoreOverlaySpy.callCount, 1, "restoreOverlayTabIndex was called");
			assert.equal(oFireModeChangedSpy.callCount, 2, "the event ModeChanged was fired again");
			assert.deepEqual(oFireModeChangedSpy.lastCall.args[0], {mode: "adaptation"}, "the argument of the event is correct");
			assert.equal(jQuery(".sapUiDtOverlayMovable").css("cursor"), "move", "the movable overlays switched back to the move cursor");
			oComp.getRootControl().removeStyleClass("sapUiDtOverlayMovable");
			assert.strictEqual(oStopCutPasteStub.callCount, 1, "the cut paste was not stopped again");
		});

		QUnit.test("when Mode is changed from visualization to navigation and back to visualization", function(assert) {
			oComp.getRootControl().addStyleClass("sapUiDtOverlayMovable");
			this.oRta.setMode("visualization");
			var oTabHandlingPlugin = this.oRta.getPlugins()["tabHandling"];
			var oTabHandlingRemoveSpy = sandbox.spy(oTabHandlingPlugin, "removeTabIndex");
			var oTabHandlingRestoreSpy = sandbox.spy(oTabHandlingPlugin, "restoreTabIndex");
			var oTabHandlingRemoveOverlaySpy = sandbox.spy(oTabHandlingPlugin, "removeOverlayTabIndex");
			var oTabHandlingRestoreOverlaySpy = sandbox.spy(oTabHandlingPlugin, "restoreOverlayTabIndex");
			var oFireModeChangedSpy = sandbox.stub(this.oRta, "fireModeChanged");
			assert.equal(jQuery(".sapUiDtOverlayMovable").css("cursor"), "default", "the movable overlays switched to the default cursor");

			this.oRta.setMode("navigation");
			assert.notOk(this.oRta._oDesignTime.getEnabled(), " in navigation mode the designTime property enabled is false");
			assert.equal(oTabHandlingRestoreSpy.callCount, 1, "restoreTabIndex was called");
			assert.equal(oTabHandlingRemoveOverlaySpy.callCount, 1, "removeOverlayTabIndex was called");
			assert.equal(oFireModeChangedSpy.callCount, 1, "the event ModeChanged was fired");
			assert.deepEqual(oFireModeChangedSpy.lastCall.args[0], {mode: "navigation"}, "the argument of the event is correct");
			assert.equal(jQuery(".sapUiDtOverlayMovable").css("cursor"), "move", "the movable overlays back to the move cursor");

			// simulate mode change from toolbar
			this.oRta.getToolbar().fireModeChange({item: { getKey: function() {return "visualization";}}});
			assert.ok(this.oRta._oDesignTime.getEnabled(), "in visualization mode the designTime property enabled is true again");
			assert.equal(oTabHandlingRemoveSpy.callCount, 1, "removeTabIndex was called");
			assert.equal(oTabHandlingRestoreOverlaySpy.callCount, 0, "restoreOverlayTabIndex was not called");
			assert.equal(oFireModeChangedSpy.callCount, 2, "the event ModeChanged was fired again");
			assert.deepEqual(oFireModeChangedSpy.lastCall.args[0], {mode: "visualization"}, "the argument of the event is correct");
			assert.equal(jQuery(".sapUiDtOverlayMovable").css("cursor"), "default", "the movable overlays switched again to the default cursor");
			oComp.getRootControl().removeStyleClass("sapUiDtOverlayMovable");
		});

		QUnit.test("when personalization changes are created in navigation mode", function(assert) {
			var oMessageToastSpy = sandbox.stub(MessageToast, "show");
			this.oRta.setMode("navigation");
			return ControlPersonalizationWriteAPI.add({changes: [{
				selectorElement: oComp
			}]})
				.then(function() {
					var sExpectedErrorMessage = oTextResources.getText("MSG_NAVIGATION_MODE_CHANGES_WARNING");
					assert.ok(oMessageToastSpy.calledOnceWith(sExpectedErrorMessage), "then a warning is shown");
					oMessageToastSpy.resetHistory();
					return ControlPersonalizationWriteAPI.add({changes: [{
						selectorElement: oComp
					}]})
						.then(function() {
							assert.ok(oMessageToastSpy.notCalled, "then the toast is only shown once");
						});
				});
		});
	});

	QUnit.module("Toolbar handling", {
		beforeEach: function() {
			this.oFlexSettings = {
				layer: Layer.CUSTOMER,
				developerMode: true
			};
			this.oRta = new RuntimeAuthoring({
				rootControl: oComp,
				flexSettings: this.oFlexSettings
			});
		},
		afterEach: function() {
			this.oRta.destroy();
			cleanInfoSessionStorage();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when RTA gets started", function(assert) {
			return this.oRta.start().then(function() {
				assert.equal(jQuery(".sapUiRtaToolbar").length, 1, "then Toolbar is visible.");

				assert.equal(this.oRta._oToolbarControlsModel.getProperty("/appVariantsOverviewEnabled"), false, "then the 'AppVariant Overview' Menu Button is not enabled");
				assert.equal(this.oRta._oToolbarControlsModel.getProperty("/appVariantsOverviewVisible"), false, "then the 'AppVariant Overview' Menu Button is not visible");
				assert.equal(this.oRta._oToolbarControlsModel.getProperty("/manageAppsEnabled"), false, "then the 'AppVariant Overview' Icon Button is not enabled");
				assert.equal(this.oRta._oToolbarControlsModel.getProperty("/manageAppsVisible"), false, "then the 'AppVariant Overview' Icon Button is not visible");
				assert.equal(this.oRta._oToolbarControlsModel.getProperty("/saveAsEnabled"), false, "then the saveAs Button is not enabled");
				assert.equal(this.oRta._oToolbarControlsModel.getProperty("/saveAsVisible"), false, "then the saveAs Button is not visible");
				assert.equal(this.oRta._oToolbarControlsModel.getProperty("/modeSwitcher"), "adaptation", "then the mode is initially set to 'Adaptation'");
				assert.equal(this.oRta._oToolbarControlsModel.getProperty("/publishEnabled"), false, "then the Publish Button is disabled");
				assert.equal(this.oRta._oToolbarControlsModel.getProperty("/publishVisible"), false, "then the Publish Button is not visible");
				assert.equal(this.oRta._oToolbarControlsModel.getProperty("/redoEnabled"), false, "then the redo is disabled");
				assert.equal(this.oRta._oToolbarControlsModel.getProperty("/undoEnabled"), false, "then the undo is disabled");
				assert.equal(this.oRta._oToolbarControlsModel.getProperty("/restoreEnabled"), false, "then the restore is disabled");
				assert.equal(this.oRta._oToolbarControlsModel.getProperty("/translationEnabled"), false, "then the translation button is disabled");
				assert.equal(this.oRta._oToolbarControlsModel.getProperty("/translationVisible"), false, "then the translation button is not visible");
				assert.equal(this.oRta._oToolbarControlsModel.getProperty("/visualizationButtonVisible"), true, "then the visualization button is visible");

				var oExpectedSettings = {
					flexSettings: this.oFlexSettings,
					rootControl: this.oRta.getRootControlInstance(),
					commandStack: this.oRta.getCommandStack()
				};
				assert.deepEqual(this.oRta.getToolbar().getRtaInformation(), oExpectedSettings, "the rta settings were passed to the toolbar");
			}.bind(this));
		});

		QUnit.test("when RTA gets started with an enabled key user translation", function(assert) {
			var oSettings = {
				isKeyUserTranslationEnabled: true,
				isKeyUser: true,
				versioning: {}
			};
			var oSettingsInstance = new Settings(oSettings);
			sandbox.stub(Settings, "getInstance").resolves(oSettingsInstance);
			sandbox.stub(TranslationAPI, "getSourceLanguages").resolves([]);

			return this.oRta.start().then(function() {
				assert.equal(this.oRta._oToolbarControlsModel.getProperty("/translationVisible"), true, "then the Translate Button is visible");
				assert.equal(this.oRta._oToolbarControlsModel.getProperty("/translationEnabled"), false, "then the Translate Button is disabled");
			}.bind(this));
		});

		QUnit.test("when RTA gets started with an enabled key user translation and already translatable changes", function(assert) {
			var oSettings = {
				isKeyUserTranslationEnabled: true,
				isKeyUser: true,
				versioning: {}
			};
			var oSettingsInstance = new Settings(oSettings);
			sandbox.stub(Settings, "getInstance").resolves(oSettingsInstance);
			sandbox.stub(TranslationAPI, "getSourceLanguages").resolves(["en"]);

			return this.oRta.start().then(function() {
				assert.equal(this.oRta._oToolbarControlsModel.getProperty("/translationVisible"), true, "then the Translate Button is visible");
				assert.equal(this.oRta._oToolbarControlsModel.getProperty("/translationEnabled"), true, "then the Translate Button is enabled");
			}.bind(this));
		});

		/**
		 * Stubs the return value of UriParameter's "has" function
		 * when called with "fiori-tools-rta-mode".
		 * This has to be stubbed like this because "has" is not static, nor is it part of the prototype
		 *
		 * @param {boolean} bValue the return value for "has"
		 */
		function stubUriParametersHasFioriToolsParam(bValue) {
			sandbox.stub(UriParameters, "fromURL").callsFake(function() {
				var oUriParameters = UriParameters.fromURL.wrappedMethod.apply(this, arguments);
				sandbox.stub(oUriParameters, "has").callThrough().withArgs("fiori-tools-rta-mode").returns(bValue);
				return oUriParameters;
			});
		}

		QUnit.test("when the URL parameter set by Fiori tools is set to 'true'", function(assert) {
			stubUriParametersHasFioriToolsParam(true);

			sandbox.stub(UriParameters.prototype, "get").callThrough().withArgs("fiori-tools-rta-mode").returns("true");

			return this.oRta.start().then(function() {
				var oToolbar = this.oRta.getToolbar();
				assert.notOk(oToolbar.getControl("visualizationSwitcherButton").getVisible(), "then the 'Visualization' tab is not visible");
			}.bind(this));
		});

		QUnit.test("when the URL parameter set by Fiori tools is set to 'false'", function(assert) {
			stubUriParametersHasFioriToolsParam(true);
			sandbox.stub(UriParameters.prototype, "get").callThrough().withArgs("fiori-tools-rta-mode").returns("false");

			return this.oRta.start().then(function() {
				var oToolbar = this.oRta.getToolbar();
				assert.ok(oToolbar.getControl("visualizationSwitcherButton").getVisible(), "then the 'Visualization' tab is visible");
			}.bind(this));
		});

		QUnit.test("when the URL parameter used by Fiori tools is not set", function(assert) {
			stubUriParametersHasFioriToolsParam(false);

			return this.oRta.start().then(function() {
				var oToolbar = this.oRta.getToolbar();
				assert.ok(oToolbar.getControl("visualizationSwitcherButton").getVisible(), "then the 'Visualization' tab is visible");
			}.bind(this));
		});

		QUnit.test("when RTA is started and stopped in the user layer", function(assert) {
			var done = assert.async();
			this.oRta.setFlexSettings({layer: Layer.USER});
			var oHandleReloadOnExitSpy = sandbox.spy(this.oRta, "_handleReloadOnExit");

			this.oRta.attachStop(function() {
				assert.strictEqual(oHandleReloadOnExitSpy.lastCall.args[0], true, "Boolean to skip the reload was passed");
				done();
			});

			this.oRta.start().then(function() {
				assert.strictEqual(this.oRta.getToolbar().getMetadata().getName(), "sap.ui.rta.toolbar.Personalization", "the personalization toolbar was created");
				this.oRta.getToolbar().getControl("exit").firePress();
			}.bind(this));
		});

		QUnit.test("when RTA is started in the customer layer, app variant feature is available for a (key user) but the manifest of an app is not supported", function(assert) {
			sandbox.stub(this.oRta, "_getToolbarButtonsVisibility").resolves({
				publishAvailable: true,
				saveAsAvailable: true,
				draftAvailable: false
			});
			sandbox.stub(AppVariantUtils, "getManifirstSupport").resolves({response: false});
			sandbox.stub(FlexUtils, "getAppDescriptor").returns({"sap.app": {id: "1"}});

			return this.oRta.start().then(function() {
				assert.strictEqual(this.oRta._oToolbarControlsModel.getProperty("/appVariantsOverviewEnabled"), false, "then the 'AppVariant Overview' Menu Button is not enabled");
				assert.strictEqual(this.oRta._oToolbarControlsModel.getProperty("/appVariantsOverviewVisible"), false, "then the 'AppVariant Overview' Menu Button is not visible");
				assert.strictEqual(this.oRta._oToolbarControlsModel.getProperty("/manageAppsEnabled"), false, "then the 'AppVariant Overview' Icon Button is not enabled");
				assert.strictEqual(this.oRta._oToolbarControlsModel.getProperty("/manageAppsVisible"), true, "then the 'AppVariant Overview' Icon Button is visible");
				assert.strictEqual(this.oRta._oToolbarControlsModel.getProperty("/saveAsEnabled"), false, "then the saveAs Button is not enabled");
				assert.strictEqual(this.oRta._oToolbarControlsModel.getProperty("/saveAsVisible"), true, "then the saveAs Button is visible");
			}.bind(this));
		});

		QUnit.test("when RTA is started in the customer layer, app variant feature is available for an (SAP) developer but the manifest of an app is not supported", function(assert) {
			sandbox.stub(this.oRta, "_getToolbarButtonsVisibility").resolves({
				publishAvailable: true,
				saveAsAvailable: true,
				draftAvailable: false
			 });
			sandbox.stub(AppVariantFeature, "isOverviewExtended").returns(true);
			sandbox.stub(AppVariantFeature, "isManifestSupported").resolves(false);

			return this.oRta.start().then(function() {
				assert.strictEqual(this.oRta._oToolbarControlsModel.getProperty("/appVariantsOverviewEnabled"), false, "then the 'AppVariant Overview' Menu Button is not enabled");
				assert.strictEqual(this.oRta._oToolbarControlsModel.getProperty("/appVariantsOverviewVisible"), true, "then the 'AppVariant Overview' Menu Button is visible");
				assert.strictEqual(this.oRta._oToolbarControlsModel.getProperty("/manageAppsEnabled"), false, "then the 'AppVariant Overview' Icon Button is not enabled");
				assert.strictEqual(this.oRta._oToolbarControlsModel.getProperty("/manageAppsVisible"), false, "then the 'AppVariant Overview' Icon Button is not visible");
				assert.strictEqual(this.oRta._oToolbarControlsModel.getProperty("/saveAsEnabled"), false, "then the saveAs Button is not enabled");
				assert.strictEqual(this.oRta._oToolbarControlsModel.getProperty("/saveAsVisible"), true, "then the saveAs Button is visible");
			}.bind(this));
		});

		QUnit.test("when save is triggered via the toolbar with an appdescriptor change", function(assert) {
			var fnResolve;
			var oPromise = new Promise(function(resolve) {
				fnResolve = resolve;
			});
			var oSerializeStub = sandbox.stub(this.oRta, "_serializeAndSave").resolves();
			var oCallbackStub = sandbox.stub().callsFake(function() {
				fnResolve();
			});

			return this.oRta.start().then(function() {
				sandbox.stub(this.oRta._oSerializer, "needsReload").resolves(true);
				this.oRta.getToolbar().fireSave({
					callback: oCallbackStub
				});
				return oPromise;
			}.bind(this))
			.then(function() {
				assert.ok(this.oRta._bReloadNeeded, "the flag was set");
				assert.strictEqual(oSerializeStub.callCount, 1, "the serialize function was called once");
				assert.strictEqual(oCallbackStub.callCount, 1, "the callback function was called once");
			}.bind(this));
		});

		QUnit.test("when save is triggered via the toolbar with a translatable change", function(assert) {
			return new Promise(function (resolve) {
				this.oRta.start().then(function () {
					assert.equal(this.oRta.bPersistedDataTranslatable, false, "no translation is present");

					// simulate a translatable change was done
					this.oRta._oToolbarControlsModel.setProperty("/translationEnabled", true);

					this.oRta.getToolbar().fireSave({
						callback: resolve
					});
				}.bind(this));
			}.bind(this)).then(function () {
				assert.equal(this.oRta._oToolbarControlsModel.getProperty("/translationEnabled"), true, "the translation button is still enabled");
				assert.strictEqual(this.oRta.bPersistedDataTranslatable, true, "the serialize function was called once");
			}.bind(this));
		});
	});

	QUnit.module("_determineReload with FLP without versioning", {
		beforeEach: function() {
			this.fnFLPToExternalStub = sandbox.spy();
			this.fnTriggerRealoadStub = sandbox.stub();
			givenAnFLP.call(this, this.fnFLPToExternalStub, this.fnTriggerRealoadStub);

			this.oRta = new RuntimeAuthoring({
				rootControl: oComp,
				showToolbars: false
			});
			this.fnEnableRestartStub = sandbox.stub(RuntimeAuthoring, "enableRestart");
			this.oVersioningLoadDraftStub = sandbox.stub(VersionsAPI, "loadDraftForApplication");
			this.oVersioningLoadAppStub = sandbox.stub(VersionsAPI, "loadVersionForApplication");
			return this.oRta._initVersioning();
		},
		afterEach: function() {
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("with FLP: when there are higher layer (e.g personalization) changes during startup", function(assert) {
			whenHigherLayerChangesExist();
			whenUserConfirmsMessage.call(this, "MSG_PERSONALIZATION_OR_PUBLIC_VIEWS_EXISTS", assert);

			return this.oRta._determineReload().then(function() {
				assert.equal(this.fnEnableRestartStub.calledOnce, true, "then enableRestart is called only once");
				assert.equal(this.fnEnableRestartStub.calledWith(Layer.CUSTOMER), true, "then enableRestart is called with the correct parameter");
				assert.equal(isReloadedWithMaxLayerParameter(this.fnFLPToExternalStub), true, "then the reload inside FLP is triggered");
				assert.strictEqual(this.oVersioningLoadDraftStub.callCount, 0, "the VersionsAPI was not called");
				assert.strictEqual(this.oVersioningLoadAppStub.callCount, 0, "the VersionsAPI was not called");
			}.bind(this));
		});

		QUnit.test("with FLP: when there are customer changes and currentLayer is VENDOR during startup", function(assert) {
			whenStartedWithLayer(this.oRta, Layer.VENDOR);
			whenHigherLayerChangesExist();
			whenUserConfirmsMessage.call(this, "MSG_HIGHER_LAYER_CHANGES_EXIST", assert);

			return this.oRta._determineReload().then(function() {
				assert.equal(this.fnEnableRestartStub.calledOnce, true, "then enableRestart is called only once");
				assert.equal(this.fnEnableRestartStub.calledWith(Layer.VENDOR), true, "then enableRestart is called with the correct parameter");
				assert.equal(isReloadedWithMaxLayerParameter(this.fnFLPToExternalStub), true, "then the reload inside FLP is triggered");
				assert.strictEqual(this.oVersioningLoadDraftStub.callCount, 0, "the VersionsAPI was not called");
				assert.strictEqual(this.oVersioningLoadAppStub.callCount, 0, "the VersionsAPI was not called");
			}.bind(this));
		});

		QUnit.test("with FLP: when no personalized changes and _determineReload() is called", function(assert) {
			whenNoHigherLayerChangesExist();

			return this.oRta._determineReload().then(function() {
				assert.equal(this.fnEnableRestartStub.callCount, 0, "then RTA restart will not be enabled");
				assert.equal(isReloadedWithMaxLayerParameter(this.fnFLPToExternalStub), false, "then the reload inside FLP is not triggered");
				assert.strictEqual(this.oVersioningLoadDraftStub.callCount, 0, "the VersionsAPI was not called");
				assert.strictEqual(this.oVersioningLoadAppStub.callCount, 0, "the VersionsAPI was not called");
			}.bind(this));
		});

		QUnit.test("with FLP: when not all context is provided and no personalized changes are available and _determineReload() is called", function(assert) {
			cleanInfoSessionStorage();
			whenNoHigherLayerChangesExist();
			sandbox.stub(PersistenceWriteAPI, "getResetAndPublishInfo").resolves({
				isResetEnabled: true,
				isPublishEnabled: true,
				allContextsProvided: false
			});
			whenUserConfirmsMessage.call(this, "MSG_RESTRICTED_CONTEXT_EXIST", assert);

			return this.oRta._determineReload().then(function() {
				assert.equal(this.fnTriggerRealoadStub.callCount, 1, "then RTA restart will not be enabled");
				assert.equal(isReloadedWithMaxLayerParameter(this.fnFLPToExternalStub), false, "then the reload inside FLP is not triggered via url parameter");
				assert.strictEqual(this.oVersioningLoadDraftStub.callCount, 0, "the VersionsAPI was not called");
				assert.strictEqual(this.oVersioningLoadAppStub.callCount, 0, "the VersionsAPI was not called");
			}.bind(this));
		});

		QUnit.test("with FLP: when not all context is provided and personalized changes are available and _determineReload() is called", function(assert) {
			cleanInfoSessionStorage();
			whenHigherLayerChangesExist();
			sandbox.stub(PersistenceWriteAPI, "getResetAndPublishInfo").resolves({
				isResetEnabled: true,
				isPublishEnabled: true,
				allContextsProvided: false
			});
			whenUserConfirmsMessage.call(this, "MSG_RESTRICTED_CONTEXT_EXIST_AND_PERSONALIZATION", assert);

			return this.oRta._determineReload().then(function() {
				assert.equal(this.fnTriggerRealoadStub.callCount, 0, "then RTA restart will not be enabled");
				assert.equal(isReloadedWithMaxLayerParameter(this.fnFLPToExternalStub), true, "then the reload inside FLP is not triggered via url parameter");
				assert.strictEqual(this.oVersioningLoadDraftStub.callCount, 0, "the VersionsAPI was not called");
				assert.strictEqual(this.oVersioningLoadAppStub.callCount, 0, "the VersionsAPI was not called");
			}.bind(this));
		});
	});

	QUnit.module("_determineReload standalone", {
		beforeEach: function() {
			this.oRta = new RuntimeAuthoring({
				rootControl: oComp,
				showToolbars: false
			});
			sandbox.stub(Versions, "getVersionsModel").returns({
				getProperty: function() {
					return true;
				}
			});
			this.fnEnableRestartStub = sandbox.stub(RuntimeAuthoring, "enableRestart");
			this.oTriggerHardReloadStub = sandbox.stub(this.oRta, "_triggerHardReload");
			this.oHandleParametersForStandalone = sandbox.stub(ReloadInfoAPI, "handleUrlParametersForStandalone");
			this.oHandleParametersOnExitStub = sandbox.stub(this.oRta, "_handleUrlParameterOnExit");
		},
		afterEach: function() {
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when the _determineReload() method is called", function(assert) {
			return this.oRta._determineReload().then(function() {
				assert.equal(this.fnEnableRestartStub.callCount, 0, "then RTA restart will not be enabled");
				assert.equal(this.oHandleParametersOnExitStub.callCount, 0, "then _handleMaxLayerAndVersionParametersOnExit() is not called");
			}.bind(this));
		});

		QUnit.test("when the _determineReload() method is called with draft", function(assert) {
			sandbox.stub(FeaturesAPI, "isVersioningEnabled").returns(Promise.resolve(true));
			sandbox.stub(VersionsAPI, "isDraftAvailable").returns(true);
			whenUserConfirmsMessage.call(this, "MSG_DRAFT_EXISTS", assert);
			var oHasMaxLayerParameterSpy = sandbox.spy(ReloadInfoAPI, "hasMaxLayerParameterWithValue");
			var oHasVersionParameterSpy = sandbox.spy(FlexUtils, "getParameter");

			this.oHandleParametersForStandalone.returns(document.location.search);
			return this.oRta._determineReload().then(function() {
				assert.equal(oHasMaxLayerParameterSpy.callCount, 1, "hasMaxLayerParameterWithValue is called");
				assert.ok(oHasVersionParameterSpy.calledWith("sap-ui-fl-version"), "the version parameter was checked");
				assert.equal(this.oTriggerHardReloadStub.callCount, 1, "_triggerHardReload is called");
			}.bind(this));
		});

		QUnit.test("when the _determineReload() method is called with draft but parameter already set", function(assert) {
			sandbox.stub(FeaturesAPI, "isVersioningEnabled").returns(Promise.resolve(true));
			sandbox.stub(VersionsAPI, "isDraftAvailable").returns(true);
			sandbox.stub(ReloadInfoAPI, "hasMaxLayerParameterWithValue").returns(true);
			sandbox.stub(FlexUtils, "getParameter").returns(Version.Number.Draft);
			var fnGetReloadMessageOnStartSpy = sandbox.spy(this.oRta, "_getReloadMessageOnStart");

			this.oHandleParametersForStandalone.returns(document.location.search);
			return this.oRta._determineReload().then(function() {
				assert.equal(this.oHandleParametersForStandalone.callCount, 0, "handleUrlParameterForStandalone is not called");
				assert.equal(fnGetReloadMessageOnStartSpy.callCount, 0, "_getReloadMessageOnStart is not called");
				assert.equal(this.oTriggerHardReloadStub.callCount, 0, "_triggerHardReload is not called");
			}.bind(this));
		});
	});

	QUnit.done(function() {
		cleanInfoSessionStorage();
		oComp._restoreGetAppComponentStub();
		oComp.destroy();
		jQuery("#qunit-fixture").hide();
	});
});
