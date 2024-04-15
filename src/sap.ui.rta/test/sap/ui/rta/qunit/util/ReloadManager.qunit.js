/* global QUnit */

sap.ui.define([
	"sap/ui/fl/apply/api/FlexRuntimeInfoAPI",
	"sap/ui/fl/initial/_internal/FlexInfoSession",
	"sap/ui/fl/write/api/ReloadInfoAPI",
	"sap/ui/fl/write/api/VersionsAPI",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/rta/util/ReloadManager",
	"sap/ui/rta/Utils",
	"sap/ui/thirdparty/sinon-4"
], function(
	FlexRuntimeInfoAPI,
	FlexInfoSession,
	ReloadInfoAPI,
	VersionsAPI,
	Layer,
	FlUtils,
	ReloadManager,
	Utils,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	var mReloadMethods = {
		NOT_NEEDED: "NO_RELOAD",
		VIA_HASH: "CROSS_APP_NAVIGATION",
		RELOAD_PAGE: "HARD_RELOAD"
	};

	QUnit.module("handleReloadOnExit", {
		beforeEach() {
			this.oReloadStub = sandbox.stub(ReloadManager, "triggerReload");
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("with reloadMethod NOT_NEEDED", function(assert) {
			ReloadManager.handleReloadOnExit({reloadMethod: mReloadMethods.NOT_NEEDED});
			assert.strictEqual(this.oReloadStub.callCount, 0, "the reload method was not called");
		});

		QUnit.test("with reload needed", function(assert) {
			ReloadManager.handleReloadOnExit({});
			assert.strictEqual(this.oReloadStub.callCount, 1, "the reload method was called");
			assert.deepEqual(this.oReloadStub.lastCall.args[0].removeVersionParameter, true, "the parameter was added");
		});
	});

	QUnit.module("checkReloadOnExit", {
		beforeEach() {
			this.oMessageBoxStub = sandbox.stub(Utils, "showMessageBox").resolves();
			this.oGetReloadMethodStub = sandbox.stub(ReloadInfoAPI, "getReloadMethod");
			ReloadManager.setUShellServices({URLParsing: "foo"});
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("with changesNeedReloadPromise resolves and no reload needed", function(assert) {
			var mProperties = {
				changesNeedReloadPromise: Promise.resolve("false")
			};
			this.oGetReloadMethodStub.returns({});
			return ReloadManager.checkReloadOnExit(mProperties).then(function() {
				assert.strictEqual(mProperties.changesNeedReload, "false", "the value is taken over to the property bag");
				assert.strictEqual(this.oMessageBoxStub.callCount, 0, "the message box is not opened");
				assert.strictEqual(mProperties.URLParsingService, "foo", "the propertyBag was enhanced");
			}.bind(this));
		});

		[
			{
				oReloadInfo: {
					hasHigherLayerChanges: true,
					layer: Layer.USER,
					isDraftAvailable: true,
					allContexts: true
				},
				testName: "with hasHigherLayerChanges in User layer",
				expectedMessageKey: "MSG_RELOAD_WITH_ALL_CHANGES"
			},
			{
				oReloadInfo: {
					hasHigherLayerChanges: true,
					layer: Layer.CUSTOMER,
					isDraftAvailable: true,
					allContexts: true
				},
				testName: "with hasHigherLayerChanges in Customer layer with draft and allContexts",
				expectedMessageKey: "MSG_RELOAD_WITH_VIEWS_PERSONALIZATION_AND_WITHOUT_DRAFT"
			},
			{
				oReloadInfo: {
					hasHigherLayerChanges: true,
					layer: Layer.CUSTOMER,
					isDraftAvailable: false,
					allContexts: true
				},
				testName: "with hasHigherLayerChanges in Customer layer with allContexts",
				expectedMessageKey: "MSG_RELOAD_WITH_PERSONALIZATION_AND_RESTRICTED_CONTEXT"
			},
			{
				oReloadInfo: {
					hasHigherLayerChanges: true,
					layer: Layer.CUSTOMER,
					isDraftAvailable: false,
					allContexts: false
				},
				testName: "with hasHigherLayerChanges in Customer layer",
				expectedMessageKey: "MSG_RELOAD_WITH_PERSONALIZATION_AND_VIEWS"
			},
			{
				oReloadInfo: {
					hasHigherLayerChanges: false,
					layer: Layer.CUSTOMER,
					isDraftAvailable: true,
					allContexts: true,
					initialDraftGotActivated: true,
					changesNeedReload: true
				},
				testName: "with initial draft",
				expectedMessageKey: "MSG_RELOAD_ACTIVATED_DRAFT"
			},
			{
				oReloadInfo: {
					hasHigherLayerChanges: false,
					layer: Layer.CUSTOMER,
					isDraftAvailable: true,
					allContexts: true,
					initialDraftGotActivated: false,
					changesNeedReload: true
				},
				testName: "with draft",
				expectedMessageKey: "MSG_RELOAD_WITHOUT_DRAFT"
			},
			{
				oReloadInfo: {
					hasHigherLayerChanges: false,
					layer: Layer.CUSTOMER,
					isDraftAvailable: false,
					allContexts: true,
					initialDraftGotActivated: false,
					changesNeedReload: true
				},
				testName: "with changesNeedReload",
				expectedMessageKey: "MSG_RELOAD_NEEDED"
			},
			{
				oReloadInfo: {
					hasHigherLayerChanges: false,
					layer: Layer.CUSTOMER,
					isDraftAvailable: false,
					allContexts: true,
					initialDraftGotActivated: false,
					changesNeedReload: false
				},
				testName: "with only allContexts",
				expectedMessageKey: "MSG_RELOAD_WITHOUT_ALL_CONTEXT"
			},
			{
				oReloadInfo: {
					hasHigherLayerChanges: false,
					layer: Layer.CUSTOMER,
					isDraftAvailable: false,
					allContexts: false,
					initialDraftGotActivated: false,
					changesNeedReload: false,
					switchEndUserAdaptation: true
				},
				testName: "with only switchEndUserAdaptation",
				expectedMessageKey: "MSG_RELOAD_OTHER_CONTEXT_BASED_ADAPTATION"
			},
			{
				oReloadInfo: {
					hasHigherLayerChanges: true,
					layer: Layer.CUSTOMER,
					isDraftAvailable: false,
					allContexts: false,
					initialDraftGotActivated: false,
					changesNeedReload: false,
					switchEndUserAdaptation: true
				},
				testName: "with hasHigherLayerChanges in Customer layer and switchEndUserAdaptation",
				expectedMessageKey: "MSG_RELOAD_WITH_PERSONALIZATION_AND_CONTEXT_BASED_ADAPTATION"
			}
		].forEach(function(oTestInfo) {
			QUnit.test(oTestInfo.testName, function(assert) {
				var mProperties = {
					changesNeedReloadPromise: Promise.resolve()
				};
				this.oGetReloadMethodStub.returns(oTestInfo.oReloadInfo);
				return ReloadManager.checkReloadOnExit(mProperties).then(function() {
					assert.strictEqual(this.oMessageBoxStub.callCount, 1, "the message box is opened");
					assert.strictEqual(this.oMessageBoxStub.lastCall.args[0], "information", "the type is correct");
					assert.strictEqual(this.oMessageBoxStub.lastCall.args[1], oTestInfo.expectedMessageKey, "the type is correct");
					assert.strictEqual(this.oMessageBoxStub.lastCall.args[2].titleKey, "HEADER_RELOAD_NEEDED", "the header is correct");
				}.bind(this));
			});
		});
	});

	QUnit.module("handleReloadOnStart", {
		beforeEach() {
			this.oMessageBoxStub = sandbox.stub(Utils, "showMessageBox").resolves();
			this.oGetReloadReasonsStub = sandbox.stub(ReloadInfoAPI, "getReloadReasonsForStart");
			this.oReloadStub = sandbox.stub(ReloadManager, "triggerReload");
			this.oAutoStartStub = sandbox.stub(ReloadManager, "enableAutomaticStart");
			this.oLoadVersionStubFinished = false;
			var fnSlowCall = function() {
				return new Promise(function(resolve) {
					setTimeout(function() {
						this.oLoadVersionStubFinished = true;
						resolve();
					}.bind(this), 0);
				}.bind(this));
			}.bind(this);
			this.oLoadDraftStub = sandbox.stub(VersionsAPI, "loadDraftForApplication").callsFake(fnSlowCall);
			this.oLoadVersionStub = sandbox.stub(VersionsAPI, "loadVersionForApplication").callsFake(fnSlowCall);
			ReloadManager.setUShellServices({URLParsing: "foo", Navigation: "bar"});
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("with no reload reason", function(assert) {
			this.oGetReloadReasonsStub.resolves({});
			return ReloadManager.handleReloadOnStart({foo: "bar"}).then(function(bResult) {
				var oExpectedProperties = {
					hasHigherLayerChanges: false,
					isDraftAvailable: false,
					ignoreMaxLayerParameter: false,
					includeCtrlVariants: true,
					URLParsingService: "foo",
					foo: "bar"
				};
				assert.deepEqual(this.oGetReloadReasonsStub.lastCall.args[0], oExpectedProperties, "the properties were enhanced");
				assert.strictEqual(bResult, undefined, "the function returns undefined");
				assert.strictEqual(this.oReloadStub.callCount, 0, "no reload was triggered");
			}.bind(this));
		});

		QUnit.test("in the developer mode with a reload reason", function(assert) {
			this.oGetReloadReasonsStub.resolves({hasHigherLayerChanges: true});
			return ReloadManager.handleReloadOnStart({developerMode: true}).then(function(bResult) {
				assert.strictEqual(bResult, true, "the function returns true");
				assert.strictEqual(this.oAutoStartStub.callCount, 1, "auto start was set");
				assert.strictEqual(this.oReloadStub.callCount, 1, "reload was triggered");
				assert.strictEqual(this.oReloadStub.lastCall.args[0].onStart, true, "the onStart flag was added");
				assert.strictEqual(this.oMessageBoxStub.callCount, 0, "the message box is not opened");
			}.bind(this));
		});

		QUnit.test("with versioning and with a reload reason", function(assert) {
			this.oGetReloadReasonsStub.resolves({hasHigherLayerChanges: true});
			this.oReloadStub.callsFake(function() {
				assert.ok(this.oLoadVersionStubFinished, "then calls are properly chained");
				return Promise.resolve();
			}.bind(this));
			return ReloadManager.handleReloadOnStart({versioningEnabled: true}).then(function() {
				assert.strictEqual(this.oLoadDraftStub.callCount, 0, "the draft was not loaded");
				assert.strictEqual(this.oLoadVersionStub.callCount, 1, "the version was loaded");
			}.bind(this));
		});

		QUnit.test("with versioning and a draft and with a reload reason", function(assert) {
			this.oGetReloadReasonsStub.resolves({isDraftAvailable: true});
			this.oReloadStub.callsFake(function() {
				assert.ok(this.oLoadVersionStubFinished, "then calls are properly chained");
				return Promise.resolve();
			}.bind(this));
			return ReloadManager.handleReloadOnStart({versioningEnabled: true}).then(function() {
				assert.strictEqual(this.oLoadDraftStub.callCount, 1, "the draft was loaded");
				assert.strictEqual(this.oLoadVersionStub.callCount, 0, "the version was not loaded");
			}.bind(this));
		});

		QUnit.test("with versioning and a draft and all context not provided and with a reload reason", function(assert) {
			this.oGetReloadReasonsStub.resolves({isDraftAvailable: true, allContexts: true});
			return ReloadManager.handleReloadOnStart({versioningEnabled: true}).then(function() {
				assert.strictEqual(this.oLoadDraftStub.callCount, 1, "the draft was loaded");
				assert.strictEqual(this.oLoadDraftStub.getCall(0).args[0].allContexts, true, "with allContext=true parameter");
				assert.strictEqual(this.oLoadVersionStub.callCount, 0, "the version was not loaded");
			}.bind(this));
		});

		QUnit.test("with versioning and a draft and all context and adaptationId and with a reload reason", function(assert) {
			this.oGetReloadReasonsStub.resolves({isDraftAvailable: true, allContexts: true, adaptationId: "id_1234"});
			return ReloadManager.handleReloadOnStart({versioningEnabled: true}).then(function() {
				assert.strictEqual(this.oLoadDraftStub.callCount, 1, "the draft was loaded");
				var oLoadDraftPropertyBag = this.oLoadDraftStub.getCall(0).args[0];
				assert.strictEqual(oLoadDraftPropertyBag.allContexts, true, "with allContext=true parameter");
				assert.strictEqual(oLoadDraftPropertyBag.adaptationId, "id_1234", "with adaptationId  parameter");
				assert.strictEqual(this.oLoadVersionStub.callCount, 0, "the version was not loaded");
			}.bind(this));
		});

		QUnit.test("with versioning and all context and adaptationId and with a reload reason", function(assert) {
			this.oGetReloadReasonsStub.resolves({hasHigherLayerChanges: true, allContexts: true, adaptationId: "id_1234"});
			return ReloadManager.handleReloadOnStart({versioningEnabled: true}).then(function() {
				assert.strictEqual(this.oLoadDraftStub.callCount, 0, "the draft was loaded");
				assert.strictEqual(this.oLoadVersionStub.callCount, 1, "the version was not loaded");
				var oLoadVersionPropertyBag = this.oLoadVersionStub.getCall(0).args[0];
				assert.strictEqual(oLoadVersionPropertyBag.allContexts, true, "with allContext=true parameter");
				assert.strictEqual(oLoadVersionPropertyBag.adaptationId, "id_1234", "with adaptationId  parameter");
			}.bind(this));
		});

		[
			{
				oReloadInfo: {
					hasHigherLayerChanges: true,
					isDraftAvailable: true,
					layer: Layer.CUSTOMER
				},
				testName: "higher layer changes and draft in CUSTOMER layer",
				expectedMessageKey: "MSG_VIEWS_OR_PERSONALIZATION_AND_DRAFT_EXISTS"
			},
			{
				oReloadInfo: {
					hasHigherLayerChanges: true,
					isDraftAvailable: true,
					layer: Layer.USER
				},
				testName: "higher layer changes and draft in USER layer",
				expectedMessageKey: "MSG_HIGHER_LAYER_CHANGES_AND_DRAFT_EXISTS"
			},
			{
				oReloadInfo: {
					hasHigherLayerChanges: true,
					layer: Layer.CUSTOMER
				},
				testName: "only higher layer changes in CUSTOMER layer",
				expectedMessageKey: "MSG_PERSONALIZATION_OR_PUBLIC_VIEWS_EXISTS"
			},
			{
				oReloadInfo: {
					hasHigherLayerChanges: true,
					layer: Layer.USER
				},
				testName: "only higher layer changes in USER layer",
				expectedMessageKey: "MSG_HIGHER_LAYER_CHANGES_EXIST"
			},
			{
				oReloadInfo: {
					isDraftAvailable: true
				},
				testName: "only draft",
				expectedMessageKey: "MSG_DRAFT_EXISTS"
			},
			{
				oReloadInfo: {
					allContexts: true
				},
				testName: "only all contexts",
				expectedMessageKey: "MSG_RESTRICTED_CONTEXT_EXIST"
			},
			{
				oReloadInfo: {
					hasHigherLayerChanges: true,
					allContexts: true
				},
				testName: "higher layer changes and allContexts",
				expectedMessageKey: "MSG_RESTRICTED_CONTEXT_EXIST_AND_PERSONALIZATION"
			}
		].forEach(function(oTestInfo) {
			QUnit.test(oTestInfo.testName, function(assert) {
				this.oGetReloadReasonsStub.resolves(oTestInfo.oReloadInfo);
				return ReloadManager.handleReloadOnStart({foo: "bar"}).then(function(bResult) {
					assert.strictEqual(bResult, true, "the function returns true");
					assert.strictEqual(this.oAutoStartStub.callCount, 1, "auto start was set");
					assert.strictEqual(this.oReloadStub.callCount, 1, "reload was triggered");
					assert.strictEqual(this.oReloadStub.lastCall.args[0].onStart, true, "the onStart flag was added");
					assert.strictEqual(this.oMessageBoxStub.callCount, 1, "the message box is opened");
					assert.strictEqual(this.oMessageBoxStub.lastCall.args[0], "information", "the type is correct");
					assert.strictEqual(this.oMessageBoxStub.lastCall.args[1], oTestInfo.expectedMessageKey, "the type is correct");
				}.bind(this));
			});
		});
	});

	QUnit.module("FLP: triggerReload", {
		beforeEach() {
			sandbox.stub(FlUtils, "getUshellContainer").returns(true);
			this.oHardReloadStub = sandbox.stub(ReloadManager, "reloadPage");
			this.oHandleReloadInfoOnStartStub = sandbox.stub(ReloadInfoAPI, "handleReloadInfoOnStart");
			this.oHandleReloadInfoStub = sandbox.stub(ReloadInfoAPI, "handleReloadInfo");
			sandbox.stub(FlUtils, "getParsedURLHash").returns({
				semanticObject: "semanticObject",
				action: "action",
				contextRaw: "contextRaw",
				params: {},
				appSpecificRoute: "appSpecificRoute"
			});
			this.oReloadCurrentAppStub = sandbox.stub();
			ReloadManager.setUShellServices({
				URLParsing: "foo",
				AppLifeCycle: {reloadCurrentApp: this.oReloadCurrentAppStub}
			});
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("onStart with changed params", function(assert) {
			FlexInfoSession.setByReference({version: "1"});
			this.oHandleReloadInfoOnStartStub.callsFake(function() {
				return true;
			});
			ReloadManager.triggerReload({
				onStart: true
			});
			assert.strictEqual(this.oReloadCurrentAppStub.callCount, 1, "the reloadCurrentApp was not called");
			assert.strictEqual(this.oHandleReloadInfoOnStartStub.callCount, 1, "the handleParams was called");
			FlexInfoSession.removeByReference();
		});

		QUnit.test("onStart with no changed params", function(assert) {
			ReloadManager.triggerReload({
				onStart: true
			});
			assert.strictEqual(this.oReloadCurrentAppStub.callCount, 1, "the reloadCurrentApp was called");
		});

		QUnit.test("onStart with changed params and triggerHardReload", function(assert) {
			this.oHandleReloadInfoOnStartStub.returns(true);
			ReloadManager.triggerReload({
				onStart: true,
				triggerHardReload: true
			});
			assert.strictEqual(this.oReloadCurrentAppStub.callCount, 1, "the reloadCurrentApp was called");
			assert.strictEqual(this.oHardReloadStub.callCount, 1, "the hardReload was triggered");
		});

		QUnit.test("not on start without changed params", function(assert) {
			this.oHandleReloadInfoStub.returns(true);
			ReloadManager.triggerReload({
				onStart: false,
				triggerHardReload: true
			});
			assert.strictEqual(this.oHandleReloadInfoStub.callCount, 1, "the handleParams was called");
			assert.strictEqual(this.oReloadCurrentAppStub.callCount, 1, "the reloadCurrentApp was called");
			assert.strictEqual(this.oHardReloadStub.callCount, 1, "the hardReload was triggered");
		});
	});

	QUnit.module("Standalone: triggerReload", {
		beforeEach() {
			sandbox.stub(FlUtils, "getUshellContainer").returns(false);
			this.oHardReloadStub = sandbox.stub(ReloadManager, "reloadPage");
			this.oHandleReloadInfoOnStartStub = sandbox.stub(ReloadInfoAPI, "handleReloadInfoOnStart");
			this.oHandleReloadInfoStub = sandbox.stub(ReloadInfoAPI, "handleReloadInfo");
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("onStart with no changed params", function(assert) {
			ReloadManager.triggerReload({
				onStart: true
			});
			assert.strictEqual(this.oHardReloadStub.callCount, 1, "the hard reload was triggered");
			assert.strictEqual(this.oHandleReloadInfoOnStartStub.callCount, 1, "the handleReloadInfoOnStart was called");
			assert.strictEqual(this.oHandleReloadInfoStub.callCount, 0, "the handleReloadInfo was not called");
		});

		QUnit.test("not onStart with no changed params", function(assert) {
			ReloadManager.triggerReload({
				onStart: false
			});
			assert.strictEqual(this.oHardReloadStub.callCount, 1, "the hard reload was triggered");
			assert.strictEqual(this.oHandleReloadInfoOnStartStub.callCount, 0, "the handleReloadInfoOnStart was not called");
			assert.strictEqual(this.oHandleReloadInfoStub.callCount, 1, "the handleReloadInfo was called");
		});
	});

	QUnit.module("automatic start", {
		beforeEach() {
			sandbox.stub(FlexRuntimeInfoAPI, "getFlexReference").returns("ABC");
			ReloadManager.disableAutomaticStart(Layer.USER);
			ReloadManager.disableAutomaticStart(Layer.CUSTOMER);
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("without reference", function(assert) {
			ReloadManager.enableAutomaticStart(Layer.CUSTOMER, {});
			window.sessionStorage.getItem(`sap.ui.rta.restart.${Layer.CUSTOMER}`);
			var sValue = window.sessionStorage.getItem(`sap.ui.rta.restart.${Layer.CUSTOMER}`);
			assert.strictEqual(sValue, "ABC", "the value is correct");
			assert.ok(FlexInfoSession.getByReference("ABC").reloadFlexData, "reloadFlexData is set");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});