/* global QUnit */

sap.ui.define([
	"sap/ui/fl/apply/api/FlexRuntimeInfoAPI",
	"sap/ui/fl/write/api/ReloadInfoAPI",
	"sap/ui/fl/write/api/VersionsAPI",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/rta/util/ReloadManager",
	"sap/ui/rta/Utils",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4"
], function(
	FlexRuntimeInfoAPI,
	ReloadInfoAPI,
	VersionsAPI,
	Layer,
	FlUtils,
	ReloadManager,
	Utils,
	jQuery,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	var mReloadMethods = {
		NOT_NEEDED: "NO_RELOAD",
		VIA_HASH: "CROSS_APP_NAVIGATION",
		RELOAD_PAGE: "HARD_RELOAD"
	};

	QUnit.module("handleUrlParametersOnExit", {
		beforeEach: function() {
			this.oReloadStub = sandbox.stub(ReloadManager, "triggerReload");
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("in USER layer", function(assert) {
			ReloadManager.handleUrlParametersOnExit({layer: Layer.USER});
			assert.strictEqual(this.oReloadStub.callCount, 0, "the reload method was not called");
		});

		QUnit.test("with reloadMethod NOT_NEEDED", function(assert) {
			ReloadManager.handleUrlParametersOnExit({reloadMethod: mReloadMethods.NOT_NEEDED});
			assert.strictEqual(this.oReloadStub.callCount, 0, "the reload method was not called");
		});

		QUnit.test("with reload needed", function(assert) {
			ReloadManager.handleUrlParametersOnExit({});
			assert.strictEqual(this.oReloadStub.callCount, 1, "the reload method was called");
			assert.deepEqual(this.oReloadStub.lastCall.args[0].removeVersionParameter, true, "the parameter was added");
		});
	});

	QUnit.module("checkReloadOnExit", {
		beforeEach: function() {
			this.oMessageBoxStub = sandbox.stub(Utils, "showMessageBox").resolves();
			this.oGetReloadMethodStub = sandbox.stub(ReloadInfoAPI, "getReloadMethod");
			ReloadManager.setUShellServices({URLParsing: "foo"});
		},
		afterEach: function() {
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
		beforeEach: function() {
			this.oMessageBoxStub = sandbox.stub(Utils, "showMessageBox").resolves();
			this.oGetReloadReasonsStub = sandbox.stub(ReloadInfoAPI, "getReloadReasonsForStart");
			this.oReloadStub = sandbox.stub(ReloadManager, "triggerReload");
			this.oAutoStartStub = sandbox.stub(ReloadManager, "enableAutomaticStart");
			this.oLoadDraftStub = sandbox.stub(VersionsAPI, "loadDraftForApplication");
			this.oLoadVersionStub = sandbox.stub(VersionsAPI, "loadVersionForApplication");
			ReloadManager.setUShellServices({URLParsing: "foo", CrossApplicationNavigation: "bar"});
		},
		afterEach: function() {
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
			return ReloadManager.handleReloadOnStart({versioningEnabled: true}).then(function() {
				assert.strictEqual(this.oLoadDraftStub.callCount, 0, "the draft was not loaded");
				assert.strictEqual(this.oLoadVersionStub.callCount, 1, "the version was loaded");
			}.bind(this));
		});

		QUnit.test("with versioning and a draft and with a reload reason", function(assert) {
			this.oGetReloadReasonsStub.resolves({isDraftAvailable: true});
			return ReloadManager.handleReloadOnStart({versioningEnabled: true}).then(function() {
				assert.strictEqual(this.oLoadDraftStub.callCount, 1, "the draft was loaded");
				assert.strictEqual(this.oLoadVersionStub.callCount, 0, "the version was not loaded");
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
		beforeEach: function() {
			sandbox.stub(FlUtils, "getUshellContainer").returns(true);
			this.oHardReloadStub = sandbox.stub(ReloadManager, "reloadPage");
			this.oHandleParamsOnStartStub = sandbox.stub(ReloadInfoAPI, "handleParametersOnStart");
			this.oHandleUrlParamsStub = sandbox.stub(ReloadInfoAPI, "handleUrlParameters");
			sandbox.stub(FlUtils, "getParsedURLHash").returns({
				semanticObject: "semanticObject",
				action: "action",
				contextRaw: "contextRaw",
				params: {},
				appSpecificRoute: "appSpecificRoute"
			});
			this.oReloadCurrentAppStub = sandbox.stub();
			this.oToExternalStub = sandbox.stub();
			ReloadManager.setUShellServices({
				URLParsing: "foo",
				AppLifeCycle: {reloadCurrentApp: this.oReloadCurrentAppStub},
				CrossApplicationNavigation: {toExternal: this.oToExternalStub}
			});
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("onStart with changed params", function(assert) {
			this.oHandleParamsOnStartStub.callsFake(function(oReloadInfo) {
				oReloadInfo.parameters["sap-ui-fl-version"] = ["1"];
				return true;
			});
			ReloadManager.triggerReload({
				onStart: true
			});
			assert.strictEqual(this.oReloadCurrentAppStub.callCount, 0, "the reloadCurrentApp was not called");
			assert.strictEqual(this.oHandleParamsOnStartStub.callCount, 1, "the handleParams was called");
			assert.strictEqual(this.oHandleParamsOnStartStub.lastCall.args[1], "flp", "with the correct scenario");
			var oExpectedParameters = {
				target: {
					semanticObject: "semanticObject",
					action: "action",
					context: "contextRaw"
				},
				params: {"sap-ui-fl-version": ["1"]},
				appSpecificRoute: "appSpecificRoute",
				writeHistory: false
			};
			assert.deepEqual(this.oToExternalStub.lastCall.args[0], oExpectedParameters, "the hash is correct");
		});

		QUnit.test("onStart with no changed params", function(assert) {
			ReloadManager.triggerReload({
				onStart: true
			});
			assert.strictEqual(this.oReloadCurrentAppStub.callCount, 1, "the reloadCurrentApp was called");
			assert.strictEqual(this.oToExternalStub.callCount, 0, "the triggerCrossAppNav was not called");
		});

		QUnit.test("onStart with changed params and triggerHardReload", function(assert) {
			this.oHandleParamsOnStartStub.returns(true);
			ReloadManager.triggerReload({
				onStart: true,
				triggerHardReload: true
			});
			assert.strictEqual(this.oReloadCurrentAppStub.callCount, 0, "the reloadCurrentApp was not called");
			assert.strictEqual(this.oToExternalStub.callCount, 1, "the triggerCrossAppNav was called");
			assert.strictEqual(this.oHardReloadStub.callCount, 1, "the hardReload was triggered");
		});

		QUnit.test("not on start without changed params", function(assert) {
			this.oHandleUrlParamsStub.returns(true);
			ReloadManager.triggerReload({
				onStart: false,
				triggerHardReload: true
			});
			assert.strictEqual(this.oHandleUrlParamsStub.callCount, 1, "the handleParams was called");
			assert.strictEqual(this.oHandleUrlParamsStub.lastCall.args[1], "flp", "with the correct scenario");
			assert.strictEqual(this.oReloadCurrentAppStub.callCount, 0, "the reloadCurrentApp was not called");
			assert.strictEqual(this.oToExternalStub.callCount, 1, "the triggerCrossAppNav was called");
			assert.strictEqual(this.oHardReloadStub.callCount, 1, "the hardReload was triggered");
		});
	});

	QUnit.module("Standalone: triggerReload", {
		beforeEach: function() {
			sandbox.stub(FlUtils, "getUshellContainer").returns(false);
			this.oHardReloadStub = sandbox.stub(ReloadManager, "reloadPage");
			this.oSetUriStub = sandbox.stub(ReloadManager, "setUriParameters");
			this.oHandleParamsOnStartStub = sandbox.stub(ReloadInfoAPI, "handleParametersOnStart");
			this.oHandleUrlParamsStub = sandbox.stub(ReloadInfoAPI, "handleUrlParameters");
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("onStart with changed params", function(assert) {
			this.oHandleParamsOnStartStub.callsFake(function(oReloadInfo) {
				oReloadInfo.parameters += "foo";
			});
			ReloadManager.triggerReload({
				onStart: true
			});
			assert.strictEqual(this.oSetUriStub.callCount, 1, "the uri parameters were set");
			assert.strictEqual(this.oHardReloadStub.callCount, 0, "the hard reload was not triggered");
			assert.strictEqual(this.oHandleParamsOnStartStub.callCount, 1, "the handleParams was called");
			assert.strictEqual(this.oHandleParamsOnStartStub.lastCall.args[1], "standalone", "with the correct scenario");
		});

		QUnit.test("onStart with no changed params", function(assert) {
			ReloadManager.triggerReload({
				onStart: true
			});
			assert.strictEqual(this.oSetUriStub.callCount, 0, "the uri parameters were not set");
			assert.strictEqual(this.oHardReloadStub.callCount, 1, "the hard reload was triggered");
			assert.strictEqual(this.oHandleParamsOnStartStub.callCount, 1, "the handleParams was called");
			assert.strictEqual(this.oHandleParamsOnStartStub.lastCall.args[1], "standalone", "with the correct scenario");
		});

		QUnit.test("not onStart with no changed params", function(assert) {
			ReloadManager.triggerReload({
				onStart: false
			});
			assert.strictEqual(this.oSetUriStub.callCount, 0, "the uri parameters were not set");
			assert.strictEqual(this.oHardReloadStub.callCount, 1, "the hard reload was triggered");
			assert.strictEqual(this.oHandleUrlParamsStub.callCount, 1, "the handleParams was called");
			assert.strictEqual(this.oHandleUrlParamsStub.lastCall.args[1], "standalone", "with the correct scenario");
		});
	});

	QUnit.module("automatic start", {
		beforeEach: function() {
			sandbox.stub(FlexRuntimeInfoAPI, "getFlexReference");
			ReloadManager.disableAutomaticStart(Layer.USER);
			ReloadManager.disableAutomaticStart(Layer.CUSTOMER);
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("with USER layer", function(assert) {
			FlexRuntimeInfoAPI.getFlexReference.returns("flexReference");
			ReloadManager.enableAutomaticStart(Layer.USER, {});
			var sValue = window.sessionStorage.getItem("sap.ui.rta.restart." + Layer.USER);
			assert.strictEqual(sValue, "flexReference", "the value is correct");
			assert.strictEqual(ReloadManager.needsAutomaticStart(Layer.USER), true, "restart is needed in the USER layer");
			assert.strictEqual(ReloadManager.needsAutomaticStart(Layer.CUSTOMER), false, "restart is not needed in a different layer");

			ReloadManager.disableAutomaticStart(Layer.USER);
			assert.strictEqual(ReloadManager.needsAutomaticStart(Layer.USER), false, "restart is not needed in the USER layer");
			assert.strictEqual(ReloadManager.needsAutomaticStart(Layer.CUSTOMER), false, "restart is not needed in a different layer");
		});

		QUnit.test("without reference", function(assert) {
			ReloadManager.enableAutomaticStart(Layer.CUSTOMER, {});
			window.sessionStorage.getItem("sap.ui.rta.restart." + Layer.CUSTOMER);
			var sValue = window.sessionStorage.getItem("sap.ui.rta.restart." + Layer.CUSTOMER);
			assert.strictEqual(sValue, "true", "the value is correct");
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});