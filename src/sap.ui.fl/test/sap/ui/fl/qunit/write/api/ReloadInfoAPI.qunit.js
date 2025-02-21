/* global QUnit */

sap.ui.define([
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/initial/_internal/FlexInfoSession",
	"sap/ui/fl/initial/api/Version",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/write/_internal/flexState/compVariants/CompVariantState",
	"sap/ui/fl/write/api/FeaturesAPI",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/fl/write/api/ReloadInfoAPI",
	"sap/ui/fl/write/api/VersionsAPI",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/thirdparty/sinon-4"
], function(
	FlexState,
	ManifestUtils,
	FlexInfoSession,
	Version,
	Settings,
	CompVariantState,
	FeaturesAPI,
	PersistenceWriteAPI,
	ReloadInfoAPI,
	VersionsAPI,
	Layer,
	FlexUtils,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	QUnit.module("Given that a getReloadReasonsForStart is called on RTA start, ", {
		beforeEach() {
			sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns(null);
			this.oCheckSVMStub = sandbox.stub(CompVariantState, "checkSVMControlsForDirty").returns(false);
		},
		afterEach() {
			sandbox.restore();
			window.sessionStorage.removeItem("sap.ui.fl.info.true");
		}
	}, function() {
		QUnit.test("initialAllContexts is not saved in the session storage", function(assert) {
			var oReloadInfo = {
				ignoreMaxLayerParameter: false,
				layer: Layer.CUSTOMER,
				selector: {}
			};
			window.sessionStorage.setItem("sap.ui.fl.info.true", JSON.stringify({}));
			sandbox.stub(ReloadInfoAPI, "hasMaxLayerStorage");
			sandbox.stub(ReloadInfoAPI, "hasVersionStorage");
			sandbox.stub(FeaturesAPI, "isVersioningEnabled").resolves(true);
			var oHasHigherLayerChangesAPIStub = sandbox.stub(PersistenceWriteAPI, "hasHigherLayerChanges").resolves(false);
			var oGetResetAndPublishInfoAPIStub = sandbox.stub(PersistenceWriteAPI, "getResetAndPublishInfo").resolves({
				isResetEnabled: true,
				allContextsProvided: true
			});
			sandbox.stub(VersionsAPI, "isDraftAvailable").returns(true);

			return ReloadInfoAPI.getReloadReasonsForStart(oReloadInfo).then(function(oReloadInfo) {
				var oExpectedArgs = {
					selector: oReloadInfo.selector,
					ignoreMaxLayerParameter: oReloadInfo.ignoreMaxLayerParameter,
					upToLayer: oReloadInfo.layer,
					includeCtrlVariants: oReloadInfo.includeCtrlVariants,
					includeDirtyChanges: true
				};
				assert.deepEqual(oHasHigherLayerChangesAPIStub.getCall(0).args[0], oExpectedArgs, "the correct propertyBag was passed");
				assert.deepEqual(oGetResetAndPublishInfoAPIStub.callCount, 1, "getResetAndPublishInfo was called");
				assert.deepEqual(oReloadInfo.isDraftAvailable, true, "isDraftAvailable is set to true");
				assert.deepEqual(oReloadInfo.hasHigherLayerChanges, false, "hasHigherLayerChanges is set to false");
				assert.deepEqual(oReloadInfo.allContexts, false, "allContexts is set to false");
				assert.deepEqual(FlexInfoSession.getByReference().initialAllContexts, false, "initialAllContexts is set to false");
				assert.deepEqual(FlexInfoSession.getByReference().isResetEnabled, true, "isResetEnabled is set to true");
				assert.deepEqual(FlexInfoSession.getByReference().allContextsProvided, true, "allContextsProvided is set to true");
				window.sessionStorage.removeItem("sap.ui.fl.info.true");
			});
		});

		QUnit.test("allContexts is saved in the session storage and do not call flex/info request", function(assert) {
			var oReloadInfo = {
				ignoreMaxLayerParameter: false,
				layer: Layer.CUSTOMER,
				selector: {}
			};
			var oFlexInfoResponse = {allContextsProvided: true};
			window.sessionStorage.setItem("sap.ui.fl.info.true", JSON.stringify(oFlexInfoResponse));
			sandbox.stub(ReloadInfoAPI, "hasMaxLayerStorage");
			sandbox.stub(ReloadInfoAPI, "hasVersionStorage");
			sandbox.stub(FeaturesAPI, "isVersioningEnabled").resolves(true);
			var oHasHigherLayerChangesAPIStub = sandbox.stub(PersistenceWriteAPI, "hasHigherLayerChanges").resolves(false);
			var oGetResetAndPublishInfoAPIStub = sandbox.stub(PersistenceWriteAPI, "getResetAndPublishInfo").resolves();
			sandbox.stub(VersionsAPI, "isDraftAvailable").returns(true);

			return ReloadInfoAPI.getReloadReasonsForStart(oReloadInfo).then(function(oReloadInfo) {
				var oExpectedArgs = {
					selector: oReloadInfo.selector,
					ignoreMaxLayerParameter: oReloadInfo.ignoreMaxLayerParameter,
					upToLayer: oReloadInfo.layer,
					includeCtrlVariants: oReloadInfo.includeCtrlVariants,
					includeDirtyChanges: true
				};
				assert.deepEqual(oHasHigherLayerChangesAPIStub.getCall(0).args[0], oExpectedArgs, "the correct propertyBag was passed");
				assert.deepEqual(oGetResetAndPublishInfoAPIStub.callCount, 0, "getResetAndPublishInfo was not called");
				assert.deepEqual(oReloadInfo.isDraftAvailable, true, "isDraftAvailable is set to true");
				assert.deepEqual(oReloadInfo.hasHigherLayerChanges, false, "hasHigherLayerChanges is set to false");
				assert.deepEqual(oReloadInfo.allContexts, false, "allContexts is set to false");
				assert.deepEqual(FlexInfoSession.getByReference().initialAllContexts, false, "initialAllContexts is set to false");
				assert.deepEqual(FlexInfoSession.getByReference().isResetEnabled, undefined, "isResetEnabled is set to undefined");
				assert.deepEqual(FlexInfoSession.getByReference().allContextsProvided, true, "allContextsProvided is set to true");
				window.sessionStorage.removeItem("sap.ui.fl.info.true");
			});
		});

		[
			{
				oFlexInfoSession: { allContextsProvided: undefined, initialAllContexts: undefined },
				oFlexInfoResponse: { allContextsProvided: false, isResetEnabled: true },
				oExpected: { allContextsProvided: false, initialAllContexts: true, isResetEnabled: true }
			},
			{
				oFlexInfoSession: { allContextsProvided: undefined, initialAllContexts: undefined },
				oFlexInfoResponse: { allContextsProvided: true, isResetEnabled: false },
				oExpected: { allContextsProvided: true, initialAllContexts: true, isResetEnabled: false }
			},

			{
				oFlexInfoSession: { allContextsProvided: false, initialAllContexts: undefined },
				oFlexInfoResponse: { allContextsProvided: false },
				oExpected: { allContextsProvided: false, initialAllContexts: true, isResetEnabled: undefined }
			},
			{
				oFlexInfoSession: { allContextsProvided: false, initialAllContexts: undefined },
				oFlexInfoResponse: { allContextsProvided: true },
				oExpected: { allContextsProvided: false, initialAllContexts: true, isResetEnabled: undefined }
			},

			{
				oFlexInfoSession: { allContextsProvided: true, initialAllContexts: undefined },
				oFlexInfoResponse: { allContextsProvided: false },
				oExpected: { allContextsProvided: true, initialAllContexts: true, isResetEnabled: undefined }
			},
			{
				oFlexInfoSession: { allContextsProvided: true, initialAllContexts: undefined },
				oFlexInfoResponse: { allContextsProvided: true },
				oExpected: { allContextsProvided: true, initialAllContexts: true, isResetEnabled: undefined }
			},

			{
				oFlexInfoSession: { allContextsProvided: undefined, initialAllContexts: false },
				oFlexInfoResponse: { allContextsProvided: false },
				oExpected: { allContextsProvided: false, initialAllContexts: true, isResetEnabled: undefined }
			},
			{
				oFlexInfoSession: { allContextsProvided: undefined, initialAllContexts: false },
				oFlexInfoResponse: { allContextsProvided: true },
				oExpected: { allContextsProvided: true, initialAllContexts: true, isResetEnabled: undefined }
			},

			{
				oFlexInfoSession: { allContextsProvided: undefined, initialAllContexts: true },
				oFlexInfoResponse: { allContextsProvided: false},
				oExpected: { allContextsProvided: undefined, initialAllContexts: true, isResetEnabled: undefined }
			},
			{
				oFlexInfoSession: { allContextsProvided: undefined, initialAllContexts: true },
				oFlexInfoResponse: { allContextsProvided: true },
				oExpected: { allContextsProvided: undefined, initialAllContexts: true, isResetEnabled: undefined }
			},

			{
				oFlexInfoSession: { allContextsProvided: false, initialAllContexts: false},
				oFlexInfoResponse: { allContextsProvided: false },
				oExpected: { allContextsProvided: false, initialAllContexts: true, isResetEnabled: undefined }
			},
			{
				oFlexInfoSession: { allContextsProvided: false, initialAllContexts: false},
				oFlexInfoResponse: { allContextsProvided: true },
				oExpected: { allContextsProvided: false, initialAllContexts: true, isResetEnabled: undefined }
			},

			{
				oFlexInfoSession: { allContextsProvided: false, initialAllContexts: true},
				oFlexInfoResponse: { allContextsProvided: false },
				oExpected: { allContextsProvided: false, initialAllContexts: true, isResetEnabled: undefined }
			},
			{
				oFlexInfoSession: { allContextsProvided: false, initialAllContexts: true},
				oFlexInfoResponse: { allContextsProvided: true },
				oExpected: { allContextsProvided: false, initialAllContexts: true, isResetEnabled: undefined }
			},

			{
				oFlexInfoSession: { allContextsProvided: true, initialAllContexts: false},
				oFlexInfoResponse: { allContextsProvided: false },
				oExpected: { allContextsProvided: true, initialAllContexts: false, isResetEnabled: undefined }
			},
			{
				oFlexInfoSession: { allContextsProvided: true, initialAllContexts: false},
				oFlexInfoResponse: { allContextsProvided: true },
				oExpected: { allContextsProvided: true, initialAllContexts: false, isResetEnabled: undefined }
			},

			{
				oFlexInfoSession: { allContextsProvided: true, initialAllContexts: true},
				oFlexInfoResponse: { allContextsProvided: false },
				oExpected: { allContextsProvided: true, initialAllContexts: true, isResetEnabled: undefined }
			},
			{
				oFlexInfoSession: { allContextsProvided: true, initialAllContexts: true},
				oFlexInfoResponse: { allContextsProvided: true },
				oExpected: { allContextsProvided: true, initialAllContexts: true, isResetEnabled: undefined }
			}
		].forEach((oSetup) => {
			var sTestDescription = Object.entries(oSetup.oFlexInfoSession).map(([key, value]) => `${key} ${value}`).join(" and ");
			QUnit.test(sTestDescription, function(assert) {
				var oStubs = setFlexInfoSessionAndPrepareMocks({ ...oSetup.oFlexInfoSession}, {...oSetup.oFlexInfoResponse });
				return ReloadInfoAPI.getReloadReasonsForStart(oStubs.oReloadInfo).then(function(oReloadInfo) {
					assertReloadReasonsAndSession(oReloadInfo, oStubs, oSetup, assert);
					window.sessionStorage.removeItem("sap.ui.fl.info.true");
				});
			});
		});

		function setFlexInfoSessionAndPrepareMocks(oFlexInfoSession, oFlexInfoResponse) {
			var oReloadInfo = {
				ignoreMaxLayerParameter: false,
				layer: Layer.CUSTOMER,
				selector: {}
			};
			FlexInfoSession.setByReference(oFlexInfoSession);
			sandbox.stub(ReloadInfoAPI, "hasMaxLayerStorage");
			sandbox.stub(ReloadInfoAPI, "hasVersionStorage");
			sandbox.stub(FeaturesAPI, "isVersioningEnabled").resolves(true);
			var oSetAllContextsProvided = sandbox.spy(FlexState, "setAllContextsProvided");
			var oHasHigherLayerChangesAPIStub = sandbox.stub(PersistenceWriteAPI, "hasHigherLayerChanges").resolves(false);
			var oGetResetAndPublishInfoAPIStub = sandbox.stub(PersistenceWriteAPI, "getResetAndPublishInfo").resolves(oFlexInfoResponse);
			sandbox.stub(VersionsAPI, "isDraftAvailable").returns(true);
			return {
				oReloadInfo,
				oSetAllContextsProvided,
				oHasHigherLayerChangesAPIStub,
				oGetResetAndPublishInfoAPIStub
			};
		}

		function assertReloadReasonsAndSession(oReloadInfo, oStubs, oSetup, assert) {
			var oExpectedArgs = {
				selector: oReloadInfo.selector,
				ignoreMaxLayerParameter: oReloadInfo.ignoreMaxLayerParameter,
				upToLayer: oReloadInfo.layer,
				includeCtrlVariants: oReloadInfo.includeCtrlVariants,
				includeDirtyChanges: true
			};
			assert.deepEqual(oStubs.oHasHigherLayerChangesAPIStub.getCall(0).args[0], oExpectedArgs, "the correct propertyBag was passed");
			assert.deepEqual(oReloadInfo.isDraftAvailable, true, "isDraftAvailable is set to true");
			assert.deepEqual(oReloadInfo.hasHigherLayerChanges, false, "hasHigherLayerChanges is set to false");
			assert.deepEqual(FlexInfoSession.getByReference().isResetEnabled, oSetup.oExpected.isResetEnabled, `isResetEnabled is set to ${oSetup.oExpected.isResetEnabled}`);

			const iSetAllContextsProvidedCallCount = oStubs.oSetAllContextsProvided.callCount;
			if (!oSetup.oFlexInfoSession.initialAllContexts) {
				assert.deepEqual(iSetAllContextsProvidedCallCount, 1, "setAllContextsProvided was called");
				assert.deepEqual(oStubs.oSetAllContextsProvided.getCall(0).args[1], oSetup.oExpected.allContextsProvided, `setAllContextsProvided was called with ${oSetup.oExpected.allContextsProvided}`);
				assert.deepEqual(oReloadInfo.allContexts, !oSetup.oExpected.allContextsProvided, `allContexts is set to ${!oSetup.oExpected.allContextsProvided}`);
			} else {
				assert.deepEqual(iSetAllContextsProvidedCallCount, 0, "setAllContextsProvided was not called");
				assert.deepEqual(oStubs.oGetResetAndPublishInfoAPIStub.callCount, 0, "getResetAndPublishInfo was not called");
				assert.deepEqual(FlexInfoSession.getByReference().initialAllContexts, oSetup.oExpected.initialAllContexts, `initialAllContexts is set to ${oSetup.oExpected.initialAllContexts}`);
			}
			if (oSetup.oFlexInfoSession.initialAllContexts === undefined && oSetup.oFlexInfoSession.allContextsProvided === undefined) {
				assert.deepEqual(oStubs.oGetResetAndPublishInfoAPIStub.callCount, 1, "getResetAndPublishInfo was called");
			} else if (!oSetup.oFlexInfoSession.initialAllContexts && oSetup.oFlexInfoSession.allContextsProvided !== undefined) {
				assert.deepEqual(FlexInfoSession.getByReference().initialAllContexts, !oSetup.oExpected.allContextsProvided, `initialAllContexts is set to ${oSetup.oExpected.initialAllContexts}`);
			}
			assert.deepEqual(FlexInfoSession.getByReference().allContextsProvided, oSetup.oExpected.allContextsProvided, `allContextsProvided is set to ${oSetup.oExpected.allContextsProvided}`);
		}

		QUnit.test("allContextsProvided is true and a draft is available and the draft is not present in the session", function(assert) {
			var oReloadInfo = {
				ignoreMaxLayerParameter: false,
				layer: Layer.CUSTOMER,
				selector: {}
			};

			sandbox.stub(ReloadInfoAPI, "hasMaxLayerStorage");
			sandbox.stub(ReloadInfoAPI, "hasVersionStorage");
			sandbox.stub(FeaturesAPI, "isVersioningEnabled").resolves(true);
			var oHasHigherLayerChangesAPIStub = sandbox.stub(PersistenceWriteAPI, "hasHigherLayerChanges").resolves(false);
			sandbox.stub(PersistenceWriteAPI, "getResetAndPublishInfo").resolves({
				isResetEnabled: true,
				isPublishEnabled: true,
				allContextsProvided: true
			});
			sandbox.stub(VersionsAPI, "isDraftAvailable").returns(true);

			return ReloadInfoAPI.getReloadReasonsForStart(oReloadInfo).then(function(oReloadInfo) {
				var oExpectedArgs = {
					selector: oReloadInfo.selector,
					ignoreMaxLayerParameter: oReloadInfo.ignoreMaxLayerParameter,
					upToLayer: oReloadInfo.layer,
					includeCtrlVariants: oReloadInfo.includeCtrlVariants,
					includeDirtyChanges: true
				};
				assert.deepEqual(oHasHigherLayerChangesAPIStub.getCall(0).args[0], oExpectedArgs, "the correct propertyBag was passed");
				assert.deepEqual(oReloadInfo.isDraftAvailable, true, "isDraftAvailable is set to true");
				assert.deepEqual(oReloadInfo.hasHigherLayerChanges, false, "hasHigherLayerChanges is set to false");
				assert.deepEqual(oReloadInfo.allContexts, false, "allContexts is set to false");
			});
		});

		QUnit.test("allContextsProvided is false and a draft is available and the draft is present in the session", function(assert) {
			var oReloadInfo = {
				ignoreMaxLayerParameter: false,
				layer: Layer.CUSTOMER,
				selector: {}
			};

			FlexInfoSession.setByReference({version: Version.Number.Draft});
			sandbox.stub(ReloadInfoAPI, "hasMaxLayerStorage");
			sandbox.stub(ReloadInfoAPI, "hasVersionStorage").returns(true);
			sandbox.stub(FeaturesAPI, "isVersioningEnabled").resolves(true);
			sandbox.stub(PersistenceWriteAPI, "hasHigherLayerChanges").resolves(false);
			sandbox.stub(PersistenceWriteAPI, "getResetAndPublishInfo").resolves({
				isResetEnabled: true,
				isPublishEnabled: true,
				allContextsProvided: false
			});
			sandbox.stub(VersionsAPI, "isDraftAvailable").returns(true);

			return ReloadInfoAPI.getReloadReasonsForStart(oReloadInfo).then(function(oReloadInfo) {
				assert.deepEqual(oReloadInfo.isDraftAvailable, false, "isDraftAvailable is set to false"); // If param is set it will not load the draft
				assert.deepEqual(oReloadInfo.hasHigherLayerChanges, false, "hasHigherLayerChanges is set to false");
				assert.deepEqual(oReloadInfo.allContexts, true, "allContexts is set to true");
			});
		});

		QUnit.test("higher layer changes are available and max-layer is not present in the session", function(assert) {
			var oReloadInfo = {
				ignoreMaxLayerParameter: false,
				layer: Layer.CUSTOMER,
				selector: {}
			};

			sandbox.stub(ReloadInfoAPI, "hasMaxLayerStorage").returns(false);
			sandbox.stub(ReloadInfoAPI, "hasVersionStorage").returns(false);
			sandbox.stub(FeaturesAPI, "isVersioningEnabled").resolves(true);
			sandbox.stub(PersistenceWriteAPI, "hasHigherLayerChanges").resolves(true);
			sandbox.stub(PersistenceWriteAPI, "getResetAndPublishInfo").resolves({
				isResetEnabled: true,
				isPublishEnabled: true,
				allContextsProvided: true
			});
			sandbox.stub(VersionsAPI, "isDraftAvailable").returns(false);

			return ReloadInfoAPI.getReloadReasonsForStart(oReloadInfo).then(function(oReloadInfo) {
				assert.deepEqual(oReloadInfo.isDraftAvailable, false, "isDraftAvailable is set to false");
				assert.deepEqual(oReloadInfo.hasHigherLayerChanges, true, "hasHigherLayerChanges is set to true");
				assert.deepEqual(oReloadInfo.allContexts, false, "allContexts is set to false");
			});
		});

		QUnit.test("higher layer changes are available and max-layer parameter is present in the parsed hash", function(assert) {
			var oReloadInfo = {
				ignoreMaxLayerParameter: false,
				layer: Layer.CUSTOMER,
				selector: {}
			};

			FlexInfoSession.setByReference({maxLayer: Layer.CUSTOMER});
			sandbox.stub(ReloadInfoAPI, "hasMaxLayerStorage").returns(true);
			sandbox.stub(ReloadInfoAPI, "hasVersionStorage").returns(false);
			sandbox.stub(FeaturesAPI, "isVersioningEnabled").resolves(true);
			sandbox.stub(PersistenceWriteAPI, "hasHigherLayerChanges").resolves(true);
			sandbox.stub(PersistenceWriteAPI, "getResetAndPublishInfo").resolves({
				isResetEnabled: true,
				isPublishEnabled: true,
				allContextsProvided: true
			});
			sandbox.stub(VersionsAPI, "isDraftAvailable").returns(false);

			return ReloadInfoAPI.getReloadReasonsForStart(oReloadInfo).then(function(oReloadInfo) {
				assert.deepEqual(oReloadInfo.isDraftAvailable, false, "isDraftAvailable is set to false");
				assert.deepEqual(oReloadInfo.hasHigherLayerChanges, false, "hasHigherLayerChanges is set to false"); // parameter already set;
				assert.deepEqual(oReloadInfo.allContexts, false, "allContexts is set to false");
			});
		});

		QUnit.test("higher layer changes are not available but SVM controls are dirty in the user layer", function(assert) {
			var oReloadInfo = {
				ignoreMaxLayerParameter: false,
				layer: Layer.USER,
				selector: {}
			};

			sandbox.stub(ReloadInfoAPI, "hasMaxLayerStorage").returns(false);
			sandbox.stub(PersistenceWriteAPI, "hasHigherLayerChanges").resolves(false);
			sandbox.stub(FlexUtils, "getParameter").returns(false);
			sandbox.stub(FlexInfoSession, "getByReference").returns({initialAllContexts: true});
			this.oCheckSVMStub.reset();
			this.oCheckSVMStub.returns(true);

			return ReloadInfoAPI.getReloadReasonsForStart(oReloadInfo).then(function(oReloadInfo) {
				assert.strictEqual(oReloadInfo.isDraftAvailable, false, "isDraftAvailable is set to false");
				assert.strictEqual(oReloadInfo.hasHigherLayerChanges, false, "hasHigherLayerChanges is set to false");
				assert.strictEqual(oReloadInfo.allContexts, false, "allContexts is set to false");
			});
		});

		QUnit.test("higher layer changes are not available but SVM controls are dirty in the customer layer", function(assert) {
			var oReloadInfo = {
				ignoreMaxLayerParameter: false,
				layer: Layer.CUSTOMER,
				selector: {}
			};

			sandbox.stub(ReloadInfoAPI, "hasMaxLayerStorage").returns(false);
			sandbox.stub(PersistenceWriteAPI, "hasHigherLayerChanges").resolves(false);
			sandbox.stub(FlexUtils, "getParameter").returns(false);
			sandbox.stub(FlexInfoSession, "getByReference").returns({initialAllContexts: true});
			this.oCheckSVMStub.reset();
			this.oCheckSVMStub.returns(true);

			return ReloadInfoAPI.getReloadReasonsForStart(oReloadInfo).then(function(oReloadInfo) {
				assert.strictEqual(oReloadInfo.isDraftAvailable, false, "isDraftAvailable is set to false");
				assert.strictEqual(oReloadInfo.hasHigherLayerChanges, true, "hasHigherLayerChanges is set to true");
				assert.strictEqual(oReloadInfo.allContexts, false, "allContexts is set to false");
			});
		});
	});

	QUnit.module("Given that getReloadMethod is called in FLP", {
		beforeEach() {
			this.oRELOAD = {
				NOT_NEEDED: "NO_RELOAD",
				RELOAD_PAGE: "HARD_RELOAD",
				VIA_HASH: "CROSS_APP_NAVIGATION"
			};
			sandbox.stub(FlexUtils, "getUshellContainer").returns(true);
			sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns(null);
		},
		afterEach() {
			FlexInfoSession.removeByReference();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("and no reason to reload was found", function(assert) {
			var oReloadInfo = {
				layer: Layer.CUSTOMER,
				selector: {},
				changesNeedReload: false,
				isDraftAvailable: false,
				versioningEnabled: true
			};
			sandbox.stub(ReloadInfoAPI, "hasMaxLayerStorage");
			sandbox.stub(ReloadInfoAPI, "hasVersionStorage");
			sandbox.stub(ReloadInfoAPI, "initialDraftGotActivated").returns(false);

			var oExpectedReloadInfo = ReloadInfoAPI.getReloadMethod(oReloadInfo);
			assert.equal(oExpectedReloadInfo.reloadMethod, this.oRELOAD.NOT_NEEDED, "then expected reloadMethod was set");
			assert.equal(oReloadInfo.hasVersionStorage, false, "has version paramert in the url");
		});

		QUnit.test("and dirty draft changes exist", function(assert) {
			var oReloadInfo = {
				layer: Layer.CUSTOMER,
				selector: {},
				changesNeedReload: false,
				isDraftAvailable: true,
				versioningEnabled: true
			};
			sandbox.stub(ReloadInfoAPI, "hasMaxLayerStorage");
			sandbox.stub(ReloadInfoAPI, "hasVersionStorage");
			sandbox.stub(ReloadInfoAPI, "initialDraftGotActivated").returns(false);

			var oExpectedReloadInfo = ReloadInfoAPI.getReloadMethod(oReloadInfo);
			assert.equal(oExpectedReloadInfo.reloadMethod, this.oRELOAD.VIA_HASH, "then VIA_HASH reloadMethod was set");
		});

		QUnit.test("and sap-ui-fl-version parameter exist", function(assert) {
			var oReloadInfo = {
				layer: Layer.CUSTOMER,
				selector: {},
				changesNeedReload: false,
				isDraftAvailable: false,
				versioningEnabled: true
			};
			sandbox.stub(ReloadInfoAPI, "hasMaxLayerStorage").returns(false);
			sandbox.stub(ReloadInfoAPI, "hasVersionStorage").returns(true);
			sandbox.stub(ReloadInfoAPI, "initialDraftGotActivated").returns(false);

			var oExpectedReloadInfo = ReloadInfoAPI.getReloadMethod(oReloadInfo);
			assert.equal(oExpectedReloadInfo.reloadMethod, this.oRELOAD.VIA_HASH, "then VIA_HASH reloadMethod was set");
		});

		QUnit.test("another version (not the active one) is selected/previewed", function(assert) {
			var oReloadInfo = {
				layer: Layer.CUSTOMER,
				selector: {},
				changesNeedReload: false,
				isDraftAvailable: false,
				versioningEnabled: true,
				activeVersion: "2"
			};

			FlexInfoSession.setByReference({version: "1"});
			sandbox.stub(ReloadInfoAPI, "hasMaxLayerStorage").returns(false);
			sandbox.stub(ReloadInfoAPI, "initialDraftGotActivated").returns(false);

			var oExpectedReloadInfo = ReloadInfoAPI.getReloadMethod(oReloadInfo);
			assert.equal(oExpectedReloadInfo.reloadMethod, this.oRELOAD.VIA_HASH, "then VIA_HASH reloadMethod was set");
		});

		QUnit.test("active version is not original", function(assert) {
			var oReloadInfo = {
				layer: Layer.CUSTOMER,
				selector: {},
				changesNeedReload: false,
				isDraftAvailable: false,
				versioningEnabled: true,
				activeVersion: "2"
			};

			sandbox.stub(ReloadInfoAPI, "hasMaxLayerStorage").returns(false);
			sandbox.stub(ReloadInfoAPI, "initialDraftGotActivated").returns(false);

			var oExpectedReloadInfo = ReloadInfoAPI.getReloadMethod(oReloadInfo);
			assert.equal(oExpectedReloadInfo.reloadMethod, this.oRELOAD.NOT_NEEDED, "then NOT_NEEDED reloadMethod was set");
		});

		QUnit.test("current active version is selected/previewed", function(assert) {
			var oReloadInfo = {
				layer: Layer.CUSTOMER,
				selector: {},
				changesNeedReload: false,
				isDraftAvailable: false,
				versioningEnabled: true,
				activeVersion: "2"
			};

			FlexInfoSession.setByReference({version: "2", allContextsProvided: true});
			sandbox.stub(ReloadInfoAPI, "hasMaxLayerStorage").returns(false);
			sandbox.stub(ReloadInfoAPI, "initialDraftGotActivated").returns(false);

			var oExpectedReloadInfo = ReloadInfoAPI.getReloadMethod(oReloadInfo);
			assert.equal(oExpectedReloadInfo.reloadMethod, this.oRELOAD.NOT_NEEDED, "then NOT_NEEDED reloadMethod was set");
			assert.equal(oReloadInfo.hasVersionStorage, true, "has version paramert in the url");
		});

		QUnit.test("and maxLayer parameter exist", function(assert) {
			var oReloadInfo = {
				layer: Layer.CUSTOMER,
				selector: {},
				changesNeedReload: false,
				isDraftAvailable: false,
				versioningEnabled: true
			};
			sandbox.stub(ReloadInfoAPI, "hasMaxLayerStorage").returns(true);
			sandbox.stub(ReloadInfoAPI, "hasVersionStorage").returns(false);
			sandbox.stub(ReloadInfoAPI, "initialDraftGotActivated").returns(false);

			var oExpectedReloadInfo = ReloadInfoAPI.getReloadMethod(oReloadInfo);
			assert.equal(oExpectedReloadInfo.reloadMethod, this.oRELOAD.VIA_HASH, "then VIA_HASH reloadMethod was set");
		});

		QUnit.test("and an initial draft got activated", function(assert) {
			var oReloadInfo = {
				layer: Layer.CUSTOMER,
				selector: {},
				changesNeedReload: false,
				isDraftAvailable: false,
				versioningEnabled: true
			};
			sandbox.stub(ReloadInfoAPI, "hasMaxLayerStorage").returns(false);
			sandbox.stub(ReloadInfoAPI, "hasVersionStorage").returns(false);
			sandbox.stub(ReloadInfoAPI, "initialDraftGotActivated").returns(true);

			var oExpectedReloadInfo = ReloadInfoAPI.getReloadMethod(oReloadInfo);
			assert.equal(oExpectedReloadInfo.reloadMethod, this.oRELOAD.VIA_HASH, "then VIA_HASH reloadMethod was set");
			assert.equal(oExpectedReloadInfo.isDraftAvailable, false, "then there is no draft");
		});

		QUnit.test("and an initial draft got activated and in the version exists in session", function(assert) {
			var oReloadInfo = {
				layer: Layer.CUSTOMER,
				selector: {},
				changesNeedReload: false,
				isDraftAvailable: false,
				versioningEnabled: true
			};
			sandbox.stub(ReloadInfoAPI, "hasMaxLayerStorage").returns(false);
			sandbox.stub(ReloadInfoAPI, "hasVersionStorage").returns(true);
			sandbox.stub(ReloadInfoAPI, "initialDraftGotActivated").returns(true);

			var oExpectedReloadInfo = ReloadInfoAPI.getReloadMethod(oReloadInfo);
			assert.equal(oExpectedReloadInfo.reloadMethod, this.oRELOAD.VIA_HASH, "then VIA_HASH reloadMethod was set");
			assert.equal(oExpectedReloadInfo.isDraftAvailable, false, "then there is no draft");
		});

		QUnit.test("and appDescriptor changes exist", function(assert) {
			var oReloadInfo = {
				layer: Layer.CUSTOMER,
				selector: {},
				changesNeedReload: true,
				isDraftAvailable: false,
				versioningEnabled: true
			};
			sandbox.stub(ReloadInfoAPI, "hasMaxLayerStorage").returns(false);
			sandbox.stub(ReloadInfoAPI, "hasVersionStorage").returns(false);
			sandbox.stub(ReloadInfoAPI, "initialDraftGotActivated").returns(false);

			var oExpectedReloadInfo = ReloadInfoAPI.getReloadMethod(oReloadInfo);
			assert.equal(oExpectedReloadInfo.reloadMethod, this.oRELOAD.RELOAD_PAGE, "then RELOAD_PAGE reloadMethod was set");
		});

		QUnit.test("and version parameter & appDescriptor changes exist", function(assert) {
			var oReloadInfo = {
				layer: Layer.CUSTOMER,
				selector: {},
				changesNeedReload: true,
				isDraftAvailable: false,
				versioningEnabled: true
			};
			sandbox.stub(ReloadInfoAPI, "hasMaxLayerStorage").returns(false);
			sandbox.stub(ReloadInfoAPI, "hasVersionStorage").returns(true);
			sandbox.stub(ReloadInfoAPI, "initialDraftGotActivated").returns(false);

			var oExpectedReloadInfo = ReloadInfoAPI.getReloadMethod(oReloadInfo);
			assert.equal(oExpectedReloadInfo.reloadMethod, this.oRELOAD.RELOAD_PAGE, "then RELOAD_PAGE reloadMethod was set");
		});

		QUnit.test("and max-layer parameter & appDescriptor changes exist", function(assert) {
			var oReloadInfo = {
				layer: Layer.CUSTOMER,
				selector: {},
				changesNeedReload: true,
				isDraftAvailable: false,
				versioningEnabled: true
			};
			sandbox.stub(ReloadInfoAPI, "hasMaxLayerStorage").returns(true);
			sandbox.stub(ReloadInfoAPI, "hasVersionStorage").returns(false);
			sandbox.stub(ReloadInfoAPI, "initialDraftGotActivated").returns(false);

			var oExpectedReloadInfo = ReloadInfoAPI.getReloadMethod(oReloadInfo);
			assert.equal(oExpectedReloadInfo.reloadMethod, this.oRELOAD.RELOAD_PAGE, "then RELOAD_PAGE reloadMethod was set");
		});

		QUnit.test("and all context was loaded and there is no other reason to reload", function(assert) {
			var oReloadInfo = {
				layer: Layer.CUSTOMER,
				selector: {},
				changesNeedReload: false,
				isDraftAvailable: false,
				versioningEnabled: true
			};
			var oFlexInfoResponse = {allContextsProvided: false};
			window.sessionStorage.setItem("sap.ui.fl.info.true", JSON.stringify(oFlexInfoResponse));
			sandbox.stub(Settings, "getInstanceOrUndef").returns({
				isContextSharingEnabled: () => {return true;}
			});
			sandbox.stub(ReloadInfoAPI, "hasMaxLayerStorage").returns(false);
			sandbox.stub(ReloadInfoAPI, "hasVersionStorage").returns(false);
			sandbox.stub(ReloadInfoAPI, "initialDraftGotActivated").returns(false);

			var oExpectedReloadInfo = ReloadInfoAPI.getReloadMethod(oReloadInfo);
			assert.equal(oExpectedReloadInfo.reloadMethod, this.oRELOAD.VIA_HASH, "then VIA_HASH reloadMethod was set");
		});

		QUnit.test("and isEndUserAdaptation is true and there are also no other reasons for reload", function(assert) {
			var oReloadInfo = {
				layer: Layer.CUSTOMER,
				selector: {},
				changesNeedReload: false,
				isDraftAvailable: false,
				versioningEnabled: true
			};
			var oFlexInfoResponse = {allContextsProvided: true, isEndUserAdaptation: true};
			window.sessionStorage.setItem("sap.ui.fl.info.true", JSON.stringify(oFlexInfoResponse));
			sandbox.stub(ReloadInfoAPI, "hasMaxLayerStorage").returns(false);
			sandbox.stub(ReloadInfoAPI, "hasVersionStorage").returns(false);
			sandbox.stub(ReloadInfoAPI, "initialDraftGotActivated").returns(false);

			var oExpectedReloadInfo = ReloadInfoAPI.getReloadMethod(oReloadInfo);
			assert.equal(oExpectedReloadInfo.reloadMethod, this.oRELOAD.NOT_NEEDED, "then NOT_NEEDED reloadMethod was set");
		});

		QUnit.test("and the only reload reason is that key user and end user adaptation don't match", function(assert) {
			var oReloadInfo = {
				layer: Layer.CUSTOMER,
				selector: {},
				changesNeedReload: false,
				isDraftAvailable: false,
				versioningEnabled: true
			};
			var oFlexInfoResponse = {allContextsProvided: true, isEndUserAdaptation: false};
			window.sessionStorage.setItem("sap.ui.fl.info.true", JSON.stringify(oFlexInfoResponse));
			sandbox.stub(ReloadInfoAPI, "hasMaxLayerStorage").returns(false);
			sandbox.stub(ReloadInfoAPI, "hasVersionStorage").returns(false);
			sandbox.stub(ReloadInfoAPI, "initialDraftGotActivated").returns(false);

			var oExpectedReloadInfo = ReloadInfoAPI.getReloadMethod(oReloadInfo);
			assert.equal(oExpectedReloadInfo.reloadMethod, this.oRELOAD.VIA_HASH, "then VIA_HASH reloadMethod was set");
		});
	});

	QUnit.module("Given that initialDraftGotActivated is called", {
		beforeEach() {
			this.oRELOAD = {
				NOT_NEEDED: "NO_RELOAD",
				RELOAD_PAGE: "HARD_RELOAD",
				VIA_HASH: "CROSS_APP_NAVIGATION"
			};
			sandbox.stub(FlexUtils, "getUshellContainer").returns(false);
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("and versioning is enabled & version is in the session", function(assert) {
			var oReloadInfo = {
				layer: Layer.CUSTOMER,
				selector: {},
				versioningEnabled: true
			};
			sandbox.stub(ReloadInfoAPI, "hasVersionStorage").returns(true);
			sandbox.stub(VersionsAPI, "isDraftAvailable").returns(false);

			var bActivated = ReloadInfoAPI.initialDraftGotActivated(oReloadInfo);
			assert.equal(bActivated, true, "it returns true");
		});

		QUnit.test("and versioning is enabled & version is not in the session", function(assert) {
			var oReloadInfo = {
				layer: Layer.CUSTOMER,
				selector: {},
				versioningEnabled: true
			};
			sandbox.stub(VersionsAPI, "isDraftAvailable").returns(false);
			sandbox.stub(ReloadInfoAPI, "hasVersionStorage").returns(false);

			var bActivated = ReloadInfoAPI.initialDraftGotActivated(oReloadInfo);
			assert.equal(bActivated, false, "it returns false");
		});

		QUnit.test("and versioning is enabled & version is in the session & draft is still present", function(assert) {
			var oReloadInfo = {
				layer: Layer.CUSTOMER,
				selector: {},
				versioningEnabled: true
			};
			sandbox.stub(VersionsAPI, "isDraftAvailable").returns(true);
			sandbox.stub(ReloadInfoAPI, "hasVersionStorage").returns(true);

			var bActivated = ReloadInfoAPI.initialDraftGotActivated(oReloadInfo);
			assert.equal(bActivated, false, "it returns false");
		});

		QUnit.test("and versioning is not enabled & version is in the session", function(assert) {
			var oReloadInfo = {
				layer: Layer.CUSTOMER,
				selector: {},
				versioningEnabled: false
			};
			sandbox.stub(VersionsAPI, "isDraftAvailable").returns(false);
			sandbox.stub(ReloadInfoAPI, "hasVersionStorage").returns(true);

			var bActivated = ReloadInfoAPI.initialDraftGotActivated(oReloadInfo);
			assert.equal(bActivated, false, "it returns false");
		});
	});

	QUnit.module("Given that a hasVersionStorage is called in FLP and the version is in the session", {
		beforeEach() {
			this.sReference = "foo";
			sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns(this.sReference);
			FlexInfoSession.setByReference({version: Version.Number.Draft}, this.sReference);
		},
		afterEach() {
			FlexInfoSession.removeByReference(this.sReference);
			sandbox.restore();
		}
	}, function() {
		QUnit.test("with value '0'", function(assert) {
			var bHasVersionParameter = ReloadInfoAPI.hasVersionStorage({value: Version.Number.Draft}, {});
			assert.deepEqual(bHasVersionParameter, true, "hasVersionStorage returns true");
		});

		QUnit.test("with value '1'", function(assert) {
			var bHasVersionParameter = ReloadInfoAPI.hasVersionStorage({value: "1"}, {});
			assert.deepEqual(bHasVersionParameter, false, "hasVersionStorage returns false");
		});
	});

	QUnit.module("Given that a hasMaxLayerStorage is called in FLP and the maxLayer is in the session", {
		beforeEach() {
			this.sReference = "foo";
			sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns(this.sReference);
			FlexInfoSession.setByReference({maxLayer: Layer.CUSTOMER}, this.sReference);
		},
		afterEach() {
			sandbox.restore();
			FlexInfoSession.removeByReference(this.sReference);
		}
	}, function() {
		QUnit.test("with value CUSTOMER", function(assert) {
			var bHasMaxLayerParameter = ReloadInfoAPI.hasMaxLayerStorage({value: Layer.CUSTOMER}, {});
			assert.deepEqual(bHasMaxLayerParameter, true, "hasMaxLayerStorage returns true");
		});

		QUnit.test("with value USER", function(assert) {
			var bHasMaxLayerParameter = ReloadInfoAPI.hasMaxLayerStorage({value: Layer.USER}, {});
			assert.deepEqual(bHasMaxLayerParameter, false, "hasMaxLayerStorage returns false");
		});
	});

	QUnit.module("Given that a hasVersionStorage is called in FLP and the version is not in the session", {
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("with value '0'", function(assert) {
			var bHasVersionParameter = ReloadInfoAPI.hasVersionStorage({value: Version.Number.Draft}, {});
			assert.deepEqual(bHasVersionParameter, false, "hasVersionStorage returns undefined");
		});

		QUnit.test("with value '1'", function(assert) {
			var bHasVersionParameter = ReloadInfoAPI.hasVersionStorage({value: "1"}, {});
			assert.deepEqual(bHasVersionParameter, false, "hasVersionStorage returns undefined");
		});
	});

	QUnit.module("Given that removeInfoSessionStorage is called", {
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("with foo oControl, but session storage has also bar oControl", function(assert) {
			var oFlexInfoResponse = {allContextsProvided: true};
			var oHugoFlexInfoResponse = {allContextsProvided: false};
			window.sessionStorage.setItem("sap.ui.fl.info.bar", JSON.stringify(oFlexInfoResponse));
			window.sessionStorage.setItem("sap.ui.fl.info.foo", JSON.stringify(oHugoFlexInfoResponse));
			sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns("foo");
			ReloadInfoAPI.removeInfoSessionStorage();

			var sHugoInfoSession = JSON.parse(window.sessionStorage.getItem("sap.ui.fl.info.foo"));
			assert.equal(sHugoInfoSession, null, "foo oControl is deleted");
			var sInfoSession = JSON.parse(window.sessionStorage.getItem("sap.ui.fl.info.bar"));
			assert.equal(sInfoSession.allContextsProvided, oFlexInfoResponse.allContextsProvided, "bar oControl still exists");
			// clean up session storage
			window.sessionStorage.removeItem("sap.ui.fl.info.bar");
		});
	});

	["flp", "standalone"].forEach(function(sScenario) {
		var sName = `${sScenario}: handleReloadInfoOnStart - `;
		QUnit.module(sName, {
			beforeEach() {
				this.oReloadInfo = {
					parameters: sScenario === "flp" ? {} : "",
					layer: Layer.CUSTOMER
				};
			},
			afterEach() {
				FlexInfoSession.removeByReference();
				sandbox.restore();
			}
		}, function() {
			QUnit.test("with no draft / higher layer Changes", function(assert) {
				var bResult = ReloadInfoAPI.handleReloadInfoOnStart(this.oReloadInfo);
				assert.strictEqual(bResult, false, "no parameter was changed");
				assert.deepEqual(FlexInfoSession.getByReference(), {}, "flex info session is correct");
			});

			QUnit.test("with a draft / no higher layer Changes", function(assert) {
				this.oReloadInfo.isDraftAvailable = true;
				var bResult = ReloadInfoAPI.handleReloadInfoOnStart(this.oReloadInfo);
				assert.strictEqual(bResult, true, "parameters were changed");
				assert.deepEqual(FlexInfoSession.getByReference(), {version: Version.Number.Draft}, "flex info session is correct");
			});

			QUnit.test("with no draft / higher layer Changes", function(assert) {
				this.oReloadInfo.hasHigherLayerChanges = true;
				var bResult = ReloadInfoAPI.handleReloadInfoOnStart(this.oReloadInfo);
				assert.strictEqual(bResult, true, "parameters were changed");
				assert.deepEqual(FlexInfoSession.getByReference(), {maxLayer: Layer.CUSTOMER}, "flex info session is correct");
			});

			QUnit.test("with a draft / higher layer Changes", function(assert) {
				this.oReloadInfo.isDraftAvailable = true;
				this.oReloadInfo.hasHigherLayerChanges = true;
				var bResult = ReloadInfoAPI.handleReloadInfoOnStart(this.oReloadInfo);
				assert.strictEqual(bResult, true, "parameters were changed");
				assert.deepEqual(FlexInfoSession.getByReference(), {maxLayer: Layer.CUSTOMER, version: Version.Number.Draft}, "flex info session is correct");
			});
		});

		var sName2 = `${sScenario}: handleReloadInfo - `;
		QUnit.module(sName2, {
			beforeEach() {
				this.oReloadInfo = {
					parameters: sScenario === "flp" ? {} : "",
					layer: Layer.CUSTOMER
				};
				sandbox.stub(window, "URLSearchParams").callsFake(function() {
					return new URLSearchParams.wrappedMethod(this.oReloadInfo.parameters);
				}.bind(this));
			},
			afterEach() {
				FlexInfoSession.removeByReference();
				sandbox.restore();
			}
		}, function() {
			QUnit.test("with max layer param in the session and hasHigherLayerChanges", function(assert) {
				this.oReloadInfo.hasHigherLayerChanges = true;
				FlexInfoSession.setByReference({maxLayer: Layer.CUSTOMER});
				var bResult = ReloadInfoAPI.handleReloadInfo(this.oReloadInfo);
				assert.strictEqual(bResult, true, "parameters were changed");
				assert.equal(FlexInfoSession.getByReference().maxLayer, undefined, "max layer is set correct in session");
				assert.deepEqual(FlexInfoSession.getByReference(), {}, "flex info session is correct");
			});

			QUnit.test("with max layer param in the session and hasHigherLayerChanges / ignoreMaxLayerParameter", function(assert) {
				this.oReloadInfo.hasHigherLayerChanges = true;
				this.oReloadInfo.ignoreMaxLayerParameter = true;
				FlexInfoSession.setByReference({maxLayer: Layer.CUSTOMER});
				var bResult = ReloadInfoAPI.handleReloadInfo(this.oReloadInfo);
				assert.strictEqual(bResult, false, "no parameters were changed");
				assert.deepEqual(FlexInfoSession.getByReference(), {maxLayer: Layer.CUSTOMER}, "flex info session is correct");
				assert.equal(FlexInfoSession.getByReference().maxLayer, Layer.CUSTOMER, "max layer is set correct in session");
			});

			QUnit.test("without version in session and versionSwitch / version set", function(assert) {
				this.oReloadInfo.versionSwitch = true;
				this.oReloadInfo.version = "1";
				var bResult = ReloadInfoAPI.handleReloadInfo(this.oReloadInfo);
				assert.strictEqual(bResult, true, "parameters were changed");
				assert.deepEqual(FlexInfoSession.getByReference(), {version: "1"}, "flex info session is correct");
				assert.equal(FlexInfoSession.getByReference().version, "1", "version is set correct in session");
			});

			QUnit.test("with version in session and versionSwitch / version set", function(assert) {
				this.oReloadInfo.versionSwitch = true;
				this.oReloadInfo.version = "1";
				FlexInfoSession.setByReference({version: "1"});
				var bResult = ReloadInfoAPI.handleReloadInfo(this.oReloadInfo);
				assert.strictEqual(bResult, false, "no parameters were changed");
				assert.deepEqual(FlexInfoSession.getByReference(), {version: "1"}, "flex info session is correct");
				assert.equal(FlexInfoSession.getByReference().version, "1", "version is set correct in session");
			});

			QUnit.test("with different version in session and versionSwitch / version set", function(assert) {
				this.oReloadInfo.versionSwitch = true;
				this.oReloadInfo.version = "1";
				FlexInfoSession.setByReference({version: "2"});
				var bResult = ReloadInfoAPI.handleReloadInfo(this.oReloadInfo);
				assert.strictEqual(bResult, true, "parameters were changed");
				assert.deepEqual(FlexInfoSession.getByReference(), {version: "1"}, "flex info session is correct");
				assert.equal(FlexInfoSession.getByReference().version, "1", "version is set correct in session");
			});

			QUnit.test("with version in session and removeVersionParameter", function(assert) {
				this.oReloadInfo.removeVersionParameter = true;
				FlexInfoSession.setByReference({version: "2"});
				var bResult = ReloadInfoAPI.handleReloadInfo(this.oReloadInfo);
				assert.strictEqual(bResult, true, "parameters were changed");
				assert.deepEqual(FlexInfoSession.getByReference(), {}, "flex info session is correct");
				assert.equal(FlexInfoSession.getByReference().version, undefined, "version is set correct in session");
			});

			QUnit.test("with draft version in session and removeVersionParameter", function(assert) {
				this.oReloadInfo.removeVersionParameter = true;
				FlexInfoSession.setByReference({version: Version.Number.Draft});
				var bResult = ReloadInfoAPI.handleReloadInfo(this.oReloadInfo);
				assert.strictEqual(bResult, true, "parameters were changed");
				assert.deepEqual(FlexInfoSession.getByReference(), {}, "flex info session is correct");
				assert.equal(FlexInfoSession.getByReference().version, undefined, "version is set correct in session");
			});

			QUnit.test("without version in session and removeVersionParameter", function(assert) {
				this.oReloadInfo.removeVersionParameter = true;
				var bResult = ReloadInfoAPI.handleReloadInfo(this.oReloadInfo);
				assert.strictEqual(bResult, false, "no parameters were changed");
				assert.deepEqual(FlexInfoSession.getByReference(), {}, "flex info session is correct");
				assert.equal(FlexInfoSession.getByReference().version, undefined, "version is set correct in session");
			});

			QUnit.test("without version in session and removeDraft", function(assert) {
				this.oReloadInfo.removeVersionParameter = true;
				var bResult = ReloadInfoAPI.handleReloadInfo(this.oReloadInfo);
				assert.strictEqual(bResult, false, "no parameters were changed");
				assert.deepEqual(FlexInfoSession.getByReference(), {}, "flex info session is correct");
				assert.equal(FlexInfoSession.getByReference().version, undefined, "version is set correct in session");
			});

			QUnit.test("with draft version in session and removeDraft", function(assert) {
				this.oReloadInfo.removeVersionParameter = true;
				FlexInfoSession.setByReference({version: Version.Number.Draft});
				var bResult = ReloadInfoAPI.handleReloadInfo(this.oReloadInfo);
				assert.strictEqual(bResult, true, "parameters were changed");
				assert.deepEqual(FlexInfoSession.getByReference(), {}, "flex info session is correct");
				assert.equal(FlexInfoSession.getByReference().version, undefined, "version is set correct in session");
			});

			QUnit.test("with flex session contains with a different selector", function(assert) {
				FlexInfoSession.setByReference({maxLayer: Layer.CUSTOMER}, "foo");
				ReloadInfoAPI.handleReloadInfo(this.oReloadInfo);
				assert.deepEqual(FlexInfoSession.getByReference(), {}, "session is empty");
			});
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
