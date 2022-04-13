/* global QUnit */

sap.ui.define([
	"sap/ui/fl/write/api/Version",
	"sap/ui/fl/write/api/ReloadInfoAPI",
	"sap/ui/fl/write/api/VersionsAPI",
	"sap/ui/fl/write/api/FeaturesAPI",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/LayerUtils",
	"sap/ui/fl/Utils",
	"sap/base/util/UriParameters",
	"sap/ui/fl/Layer",
	"sap/ui/thirdparty/sinon-4"
], function(
	Version,
	ReloadInfoAPI,
	VersionsAPI,
	FeaturesAPI,
	PersistenceWriteAPI,
	ManifestUtils,
	LayerUtils,
	FlexUtils,
	UriParameters,
	Layer,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	QUnit.module("Given that a CrossAppNavigation is needed because of a draft, handleParametersOnStart is called,", {
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("while a draft is available and the url parameter for draft is not present in the parsed hash", function(assert) {
			var oReloadInfo = {
				hasHigherLayerChanges: false,
				isDraftAvailable: true,
				layer: Layer.CUSTOMER,
				selector: {}
			};

			var oExpectedHash = {
				params: {
					"sap-ui-fl-version": [Version.Number.Draft],
					"sap-ui-fl-parameter": ["test"]
				}
			};
			var mParsedHash = {
				params: {
					"sap-ui-fl-parameter": ["test"]
				}
			};
			sandbox.stub(FlexUtils, "getParsedURLHash").returns(mParsedHash);
			var oNewParsedHash = ReloadInfoAPI.handleParametersOnStart(oReloadInfo);
			assert.deepEqual(oNewParsedHash.params, oExpectedHash.params, "Parameters are as expected");
		});

		QUnit.test("while no draft is available and the url parameter for draft is not present in the parsed hash", function(assert) {
			var oReloadInfo = {
				hasHigherLayerChanges: false,
				isDraftAvailable: false,
				layer: Layer.CUSTOMER,
				selector: {}
			};

			var mParsedHash = {
				params: {
					"sap-ui-fl-parameter": ["test"]
				}
			};

			sandbox.stub(FlexUtils, "getParsedURLHash").returns(mParsedHash);

			var oLoadForApplicationStub = sandbox.stub(VersionsAPI, "loadDraftForApplication");
			var oNewParsedHash = ReloadInfoAPI.handleParametersOnStart(oReloadInfo);

			assert.equal(oNewParsedHash.params, mParsedHash.params, "The parsed hash did not change");
			assert.equal(oLoadForApplicationStub.callCount, 0, "then loadDraftForApplication is not called");
		});

		QUnit.test("while higher layer changes are available and the url parameter for max-layer is not present in the parsed hash", function(assert) {
			var oReloadInfo = {
				hasHigherLayerChanges: true,
				isDraftAvailable: false,
				layer: Layer.CUSTOMER,
				selector: {}
			};

			var oExpectedParams = {
				params: {
					"sap-ui-fl-max-layer": [Layer.CUSTOMER]
				}
			};

			var mParsedHash = {
				params: {}
			};
			sandbox.stub(FlexUtils, "getParsedURLHash").returns(mParsedHash);
			var oNewParsedHash = ReloadInfoAPI.handleParametersOnStart(oReloadInfo);

			assert.deepEqual(oNewParsedHash.params, oExpectedParams.params, "Parameters are as expected");
		});

		QUnit.test("while no higher layer changes are available and the url parameter for max-layer is not present in the parsed hash", function(assert) {
			var oReloadInfo = {
				hasHigherLayerChanges: false,
				isDraftAvailable: false,
				layer: Layer.CUSTOMER,
				selector: {}
			};

			var oExpectedParams = {
				params: {}
			};

			var mParsedHash = {
				params: {}
			};
			sandbox.stub(FlexUtils, "getParsedURLHash").returns(mParsedHash);
			var oNewParsedHash = ReloadInfoAPI.handleParametersOnStart(oReloadInfo);
			assert.deepEqual(oNewParsedHash.params, oExpectedParams.params, "Parameters are as expected");
		});
	});

	QUnit.module("Given that a getReloadReasonsForStart is called on RTA start,", {
		beforeEach: function() {
			sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns(null);
		},
		afterEach: function() {
			sandbox.restore();
			window.sessionStorage.removeItem("sap.ui.fl.info.true");
		}
	}, function() {
		QUnit.test("allContexts is save in the session storage and do not call flex/info request", function(assert) {
			var oReloadInfo = {
				ignoreMaxLayerParameter: false,
				layer: Layer.CUSTOMER,
				selector: {}
			};
			var oFlexInfoResponse = {allContextsProvided: true};
			window.sessionStorage.setItem("sap.ui.fl.info.true", JSON.stringify(oFlexInfoResponse));
			sandbox.stub(ReloadInfoAPI, "hasMaxLayerParameterWithValue");
			sandbox.stub(ReloadInfoAPI, "hasVersionParameterWithValue");
			sandbox.stub(FeaturesAPI, "isVersioningEnabled").returns(Promise.resolve(true));
			var oHasHigherLayerChangesAPIStub = sandbox.stub(PersistenceWriteAPI, "hasHigherLayerChanges").resolves(false);
			var oGetResetAndPublishInfoAPIStub = sandbox.stub(PersistenceWriteAPI, "getResetAndPublishInfo").resolves();
			sandbox.stub(VersionsAPI, "isDraftAvailable").returns(true);

			return ReloadInfoAPI.getReloadReasonsForStart(oReloadInfo).then(function (oReloadInfo) {
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
			});
		});

		QUnit.test("allContextsProvided is true and a draft is available and the url parameter for draft is not present in the parsed hash", function(assert) {
			var oReloadInfo = {
				ignoreMaxLayerParameter: false,
				layer: Layer.CUSTOMER,
				selector: {}
			};

			sandbox.stub(ReloadInfoAPI, "hasMaxLayerParameterWithValue");
			sandbox.stub(ReloadInfoAPI, "hasVersionParameterWithValue");
			sandbox.stub(FeaturesAPI, "isVersioningEnabled").returns(Promise.resolve(true));
			var oHasHigherLayerChangesAPIStub = sandbox.stub(PersistenceWriteAPI, "hasHigherLayerChanges").resolves(false);
			sandbox.stub(PersistenceWriteAPI, "getResetAndPublishInfo").resolves({
				isResetEnabled: true,
				isPublishEnabled: true,
				allContextsProvided: true
			});
			sandbox.stub(VersionsAPI, "isDraftAvailable").returns(true);

			return ReloadInfoAPI.getReloadReasonsForStart(oReloadInfo).then(function (oReloadInfo) {
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

		QUnit.test("allContextsProvided is false and a draft is available and the url parameter for draft is present in the parsed hash", function(assert) {
			var oReloadInfo = {
				ignoreMaxLayerParameter: false,
				layer: Layer.CUSTOMER,
				selector: {}
			};

			var mParsedHash = {
				params: Version.UrlParameter
			};

			var oUriWithVersionUrlParameter = UriParameters.fromQuery("?" + Version.UrlParameter + "=" + Version.Number.Draft);
			sandbox.stub(UriParameters, "fromQuery").returns(oUriWithVersionUrlParameter);
			sandbox.stub(ReloadInfoAPI, "hasMaxLayerParameterWithValue");
			sandbox.stub(ReloadInfoAPI, "hasVersionParameterWithValue").returns(true);
			sandbox.stub(FlexUtils, "getParsedURLHash").returns(mParsedHash);
			sandbox.stub(FeaturesAPI, "isVersioningEnabled").returns(Promise.resolve(true));
			sandbox.stub(PersistenceWriteAPI, "hasHigherLayerChanges").resolves(false);
			sandbox.stub(PersistenceWriteAPI, "getResetAndPublishInfo").resolves({
				isResetEnabled: true,
				isPublishEnabled: true,
				allContextsProvided: false
			});
			sandbox.stub(VersionsAPI, "isDraftAvailable").returns(true);

			return ReloadInfoAPI.getReloadReasonsForStart(oReloadInfo).then(function (oReloadInfo) {
				assert.deepEqual(oReloadInfo.isDraftAvailable, false, "isDraftAvailable is set to false"); //If param is set it will not load the draft
				assert.deepEqual(oReloadInfo.hasHigherLayerChanges, false, "hasHigherLayerChanges is set to false");
				assert.deepEqual(oReloadInfo.allContexts, true, "allContexts is set to true");
			});
		});

		QUnit.test("higher layer changes are available and max-layer parameter is not present in the parsed hash", function(assert) {
			var oReloadInfo = {
				ignoreMaxLayerParameter: false,
				layer: Layer.CUSTOMER,
				selector: {}
			};

			var mParsedHash = {
				params: {}
			};

			sandbox.stub(ReloadInfoAPI, "hasMaxLayerParameterWithValue").returns(false);
			sandbox.stub(ReloadInfoAPI, "hasVersionParameterWithValue").returns(false);
			sandbox.stub(FlexUtils, "getParsedURLHash").returns(mParsedHash);
			sandbox.stub(FeaturesAPI, "isVersioningEnabled").returns(Promise.resolve(true));
			sandbox.stub(PersistenceWriteAPI, "hasHigherLayerChanges").returns(true);
			sandbox.stub(PersistenceWriteAPI, "getResetAndPublishInfo").resolves({
				isResetEnabled: true,
				isPublishEnabled: true,
				allContextsProvided: true
			});
			sandbox.stub(VersionsAPI, "isDraftAvailable").returns(false);

			return ReloadInfoAPI.getReloadReasonsForStart(oReloadInfo).then(function (oReloadInfo) {
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

			var mParsedHash = {
				params: LayerUtils.FL_MAX_LAYER_PARAM
			};

			sandbox.stub(ReloadInfoAPI, "hasMaxLayerParameterWithValue").returns(true);
			sandbox.stub(ReloadInfoAPI, "hasVersionParameterWithValue").returns(false);
			sandbox.stub(FlexUtils, "getParsedURLHash").returns(mParsedHash);
			sandbox.stub(FeaturesAPI, "isVersioningEnabled").returns(Promise.resolve(true));
			sandbox.stub(PersistenceWriteAPI, "hasHigherLayerChanges").returns(true);
			sandbox.stub(PersistenceWriteAPI, "getResetAndPublishInfo").resolves({
				isResetEnabled: true,
				isPublishEnabled: true,
				allContextsProvided: true
			});
			sandbox.stub(VersionsAPI, "isDraftAvailable").returns(false);

			return ReloadInfoAPI.getReloadReasonsForStart(oReloadInfo).then(function (oReloadInfo) {
				assert.deepEqual(oReloadInfo.isDraftAvailable, false, "isDraftAvailable is set to false");
				assert.deepEqual(oReloadInfo.hasHigherLayerChanges, false, "hasHigherLayerChanges is set to false"); // parameter already set;
				assert.deepEqual(oReloadInfo.allContexts, false, "allContexts is set to false");
			});
		});
	});

	QUnit.module("Given that getReloadMethod is called in FLP", {
		beforeEach: function() {
			this.oRELOAD = {
				NOT_NEEDED: "NO_RELOAD",
				RELOAD_PAGE: "HARD_RELOAD",
				VIA_HASH: "CROSS_APP_NAVIGATION"
			};
			sandbox.stub(FlexUtils, "getUshellContainer").returns(true);
			sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns(null);
		},
		afterEach: function () {
			sandbox.restore();
		}
	}, function () {
		QUnit.test("and no reason to reload was found", function(assert) {
			var oReloadInfo = {
				layer: Layer.CUSTOMER,
				selector: {},
				changesNeedReload: false,
				isDraftAvailable: false,
				versioningEnabled: true
			};
			sandbox.stub(ReloadInfoAPI, "hasMaxLayerParameterWithValue");
			sandbox.stub(ReloadInfoAPI, "hasVersionParameterWithValue");
			sandbox.stub(ReloadInfoAPI, "initialDraftGotActivated").returns(false);

			var oExpectedReloadInfo = ReloadInfoAPI.getReloadMethod(oReloadInfo);
			assert.equal(oExpectedReloadInfo.reloadMethod, this.oRELOAD.NOT_NEEDED, "then expected reloadMethod was set");
		});

		QUnit.test("and dirty draft changes exist", function(assert) {
			var oReloadInfo = {
				layer: Layer.CUSTOMER,
				selector: {},
				changesNeedReload: false,
				isDraftAvailable: true,
				versioningEnabled: true
			};
			sandbox.stub(ReloadInfoAPI, "hasMaxLayerParameterWithValue");
			sandbox.stub(ReloadInfoAPI, "hasVersionParameterWithValue");
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
			sandbox.stub(ReloadInfoAPI, "hasMaxLayerParameterWithValue").returns(false);
			sandbox.stub(ReloadInfoAPI, "hasVersionParameterWithValue").returns(true);
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

			var mParsedHash = {
				params: {
					"sap-ui-fl-version": ["1"]
				}
			};

			sandbox.stub(FlexUtils, "getParsedURLHash").returns(mParsedHash);

			sandbox.stub(ReloadInfoAPI, "hasMaxLayerParameterWithValue").returns(false);
			sandbox.stub(ReloadInfoAPI, "initialDraftGotActivated").returns(false);

			var oExpectedReloadInfo = ReloadInfoAPI.getReloadMethod(oReloadInfo);
			assert.equal(oExpectedReloadInfo.reloadMethod, this.oRELOAD.VIA_HASH, "then VIA_HASH reloadMethod was set");
		});

		QUnit.test("current active version is selected/previewed", function(assert) {
			var oReloadInfo = {
				layer: Layer.CUSTOMER,
				selector: {},
				changesNeedReload: false,
				isDraftAvailable: false,
				versioningEnabled: true,
				activeVersion: "2",
				URLParsingService: {
					parseShellHash: function() {
						return {
							params: {
								"sap-ui-fl-version": ["2"]
							}
						};
					}
				}
			};

			sandbox.stub(ReloadInfoAPI, "hasMaxLayerParameterWithValue").returns(false);
			sandbox.stub(ReloadInfoAPI, "initialDraftGotActivated").returns(false);

			var oExpectedReloadInfo = ReloadInfoAPI.getReloadMethod(oReloadInfo);
			assert.equal(oExpectedReloadInfo.reloadMethod, this.oRELOAD.NOT_NEEDED, "then NOT_NEEDED reloadMethod was set");
		});

		QUnit.test("and sap-ui-fl-max-layer parameter exist", function(assert) {
			var oReloadInfo = {
				layer: Layer.CUSTOMER,
				selector: {},
				changesNeedReload: false,
				isDraftAvailable: false,
				versioningEnabled: true
			};
			sandbox.stub(ReloadInfoAPI, "hasMaxLayerParameterWithValue").returns(true);
			sandbox.stub(ReloadInfoAPI, "hasVersionParameterWithValue").returns(false);
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
			sandbox.stub(ReloadInfoAPI, "hasMaxLayerParameterWithValue").returns(false);
			sandbox.stub(ReloadInfoAPI, "hasVersionParameterWithValue").returns(false);
			sandbox.stub(ReloadInfoAPI, "initialDraftGotActivated").returns(true);

			var oExpectedReloadInfo = ReloadInfoAPI.getReloadMethod(oReloadInfo);
			assert.equal(oExpectedReloadInfo.reloadMethod, this.oRELOAD.VIA_HASH, "then VIA_HASH reloadMethod was set");
			assert.equal(oExpectedReloadInfo.isDraftAvailable, false, "then there is no draft");
		});

		QUnit.test("and an initial draft got activated and in the url version parameter exists", function(assert) {
			var oReloadInfo = {
				layer: Layer.CUSTOMER,
				selector: {},
				changesNeedReload: false,
				isDraftAvailable: false,
				versioningEnabled: true
			};
			sandbox.stub(ReloadInfoAPI, "hasMaxLayerParameterWithValue").returns(false);
			sandbox.stub(ReloadInfoAPI, "hasVersionParameterWithValue").returns(true);
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
			sandbox.stub(ReloadInfoAPI, "hasMaxLayerParameterWithValue").returns(false);
			sandbox.stub(ReloadInfoAPI, "hasVersionParameterWithValue").returns(false);
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
			sandbox.stub(ReloadInfoAPI, "hasMaxLayerParameterWithValue").returns(false);
			sandbox.stub(ReloadInfoAPI, "hasVersionParameterWithValue").returns(true);
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
			sandbox.stub(ReloadInfoAPI, "hasMaxLayerParameterWithValue").returns(true);
			sandbox.stub(ReloadInfoAPI, "hasVersionParameterWithValue").returns(false);
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
			sandbox.stub(ReloadInfoAPI, "hasMaxLayerParameterWithValue").returns(false);
			sandbox.stub(ReloadInfoAPI, "hasVersionParameterWithValue").returns(false);
			sandbox.stub(ReloadInfoAPI, "initialDraftGotActivated").returns(false);

			var oExpectedReloadInfo = ReloadInfoAPI.getReloadMethod(oReloadInfo);
			var oFlexInfoFronSession = JSON.parse(window.sessionStorage.getItem("sap.ui.fl.info.true"));
			assert.equal(oExpectedReloadInfo.reloadMethod, this.oRELOAD.VIA_HASH, "then VIA_HASH reloadMethod was set");
			assert.equal(oFlexInfoFronSession, null, "then allContexts is null in session storage");
		});

		QUnit.test("and all context was not loaded and there is no other reason for reload", function(assert) {
			var oReloadInfo = {
				layer: Layer.CUSTOMER,
				selector: {},
				changesNeedReload: false,
				isDraftAvailable: false,
				versioningEnabled: true
			};
			var oFlexInfoResponse = {allContextsProvided: true};
			window.sessionStorage.setItem("sap.ui.fl.info.true", JSON.stringify(oFlexInfoResponse));
			sandbox.stub(ReloadInfoAPI, "hasMaxLayerParameterWithValue").returns(false);
			sandbox.stub(ReloadInfoAPI, "hasVersionParameterWithValue").returns(false);
			sandbox.stub(ReloadInfoAPI, "initialDraftGotActivated").returns(false);

			var oExpectedReloadInfo = ReloadInfoAPI.getReloadMethod(oReloadInfo);
			assert.equal(oExpectedReloadInfo.reloadMethod, this.oRELOAD.NOT_NEEDED, "then NOT_NEEDED reloadMethod was set");
		});
	});

	QUnit.module("Given that initialDraftGotActivated is called", {
		beforeEach: function() {
			this.oRELOAD = {
				NOT_NEEDED: "NO_RELOAD",
				RELOAD_PAGE: "HARD_RELOAD",
				VIA_HASH: "CROSS_APP_NAVIGATION"
			};
			sandbox.stub(FlexUtils, "getUshellContainer").returns(false);
		},
		afterEach: function () {
			sandbox.restore();
		}
	}, function () {
		QUnit.test("and versioning is enabled & version parameter is in the url", function(assert) {
			var oReloadInfo = {
				layer: Layer.CUSTOMER,
				selector: {},
				versioningEnabled: true
			};
			sandbox.stub(ReloadInfoAPI, "hasVersionParameterWithValue").returns(true);
			sandbox.stub(VersionsAPI, "isDraftAvailable").returns(false);

			var bActivated = ReloadInfoAPI.initialDraftGotActivated(oReloadInfo);
			assert.equal(bActivated, true, "it returns true");
		});

		QUnit.test("and versioning is enabled & version parameter is not in the url", function(assert) {
			var oReloadInfo = {
				layer: Layer.CUSTOMER,
				selector: {},
				versioningEnabled: true
			};
			sandbox.stub(VersionsAPI, "isDraftAvailable").returns(false);
			sandbox.stub(ReloadInfoAPI, "hasVersionParameterWithValue").returns(false);

			var bActivated = ReloadInfoAPI.initialDraftGotActivated(oReloadInfo);
			assert.equal(bActivated, false, "it returns false");
		});

		QUnit.test("and versioning is enabled & version parameter is in the url & draft is still present", function(assert) {
			var oReloadInfo = {
				layer: Layer.CUSTOMER,
				selector: {},
				versioningEnabled: true
			};
			sandbox.stub(VersionsAPI, "isDraftAvailable").returns(true);
			sandbox.stub(ReloadInfoAPI, "hasVersionParameterWithValue").returns(true);

			var bActivated = ReloadInfoAPI.initialDraftGotActivated(oReloadInfo);
			assert.equal(bActivated, false, "it returns false");
		});

		QUnit.test("and versioning is not enabled & version parameter is in the url", function(assert) {
			var oReloadInfo = {
				layer: Layer.CUSTOMER,
				selector: {},
				versioningEnabled: false
			};
			sandbox.stub(VersionsAPI, "isDraftAvailable").returns(false);
			sandbox.stub(ReloadInfoAPI, "hasVersionParameterWithValue").returns(true);

			var bActivated = ReloadInfoAPI.initialDraftGotActivated(oReloadInfo);
			assert.equal(bActivated, false, "it returns false");
		});
	});

	QUnit.module("Given that a hasVersionParameterWithValue is called in FLP and the version parameter is in the hash", {
		beforeEach: function() {
			this.oURLParsingService = {
				parseShellHash: function () {
					return {
						params: {
							"sap-ui-fl-version": [Version.Number.Draft]
						}
					};
				}
			};
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("with value '0'", function(assert) {
			var bHasVersionParameter = ReloadInfoAPI.hasVersionParameterWithValue({value: Version.Number.Draft}, this.oURLParsingService);
			assert.deepEqual(bHasVersionParameter, true, "hasVersionParameterWithValue returns true");
		});

		QUnit.test("with value '1'", function(assert) {
			var bHasVersionParameter = ReloadInfoAPI.hasVersionParameterWithValue({value: "1"}, this.oURLParsingService);
			assert.deepEqual(bHasVersionParameter, false, "hasVersionParameterWithValue returns false");
		});
	});

	QUnit.module("Given that a hasMaxLayerParameterWithValue is called in FLP and the version parameter is in the hash", {
		beforeEach: function() {
			this.oURLParsingService = {
				parseShellHash: function () {
					return {
						params: {
							"sap-ui-fl-max-layer": [Layer.CUSTOMER]
						}
					};
				}
			};
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("with value CUSTOMER", function(assert) {
			var bHasVersionParameter = ReloadInfoAPI.hasMaxLayerParameterWithValue({value: Layer.CUSTOMER}, this.oURLParsingService);
			assert.deepEqual(bHasVersionParameter, true, "hasMaxLayerParameterWithValue returns true");
		});

		QUnit.test("with value USER", function(assert) {
			var bHasVersionParameter = ReloadInfoAPI.hasMaxLayerParameterWithValue({value: Layer.USER}, this.oURLParsingService);
			assert.deepEqual(bHasVersionParameter, false, "hasMaxLayerParameterWithValue returns false");
		});
	});

	QUnit.module("Given that a hasVersionParameterWithValue is called in FLP and the version parameter is not in the hash", {
		beforeEach: function() {
			this.oURLParsingService = {
				parseShellHash: function () {
					return {
						params: {
						}
					};
				}
			};
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("with value '0'", function(assert) {
			var bHasVersionParameter = ReloadInfoAPI.hasVersionParameterWithValue({value: Version.Number.Draft}, this.oURLParsingService);
			assert.deepEqual(bHasVersionParameter, false, "hasVersionParameterWithValue returns undefined");
		});

		QUnit.test("with value '1'", function(assert) {
			var bHasVersionParameter = ReloadInfoAPI.hasVersionParameterWithValue({value: "1"}, this.oURLParsingService);
			assert.deepEqual(bHasVersionParameter, false, "hasVersionParameterWithValue returns undefined");
		});
	});

	QUnit.module("Given that a handleParametersForStandalone is called", {
		beforeEach: function() {
			sandbox.stub(FlexUtils, "getUshellContainer").returns(undefined);
			this.oHandleUrlParameterSpy = sandbox.spy(FlexUtils, "handleUrlParameters");
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("and the version parameter is in the URL with value '0'", function(assert) {
			var sParams = "?" + Version.UrlParameter + "=" + Version.Number.Draft;
			var oHasParameterAndValueStub = sandbox.stub(FlexUtils, "hasParameterAndValue").returns(true);

			var oReloadInfo = {
				layer: Layer.CUSTOMER,
				isDraftAvailable: true,
				hasHigherLayerChanges: false,
				parameters: sParams
			};

			var sExpectedParams = "";
			var sParameters = ReloadInfoAPI.handleUrlParametersForStandalone(oReloadInfo);
			assert.equal(this.oHandleUrlParameterSpy.calledOnce, true, "handleUrlParameter was called");
			assert.equal(oHasParameterAndValueStub.calledOnce, true, "handleUrlParameter was called");
			assert.equal(sParameters, sExpectedParams, "then the parameter was removed");
		});

		QUnit.test("and the version parameter is in the URL with value '-1'", function(assert) {
			var sParams = "?" + Version.UrlParameter + "=" + Version.Number.Original;
			var oHasParameterAndValueStub = sandbox.stub(FlexUtils, "hasParameterAndValue").returns(true);

			var oReloadInfo = {
				layer: Layer.CUSTOMER,
				isDraftAvailable: true,
				hasHigherLayerChanges: false,
				parameters: sParams
			};

			var sExpectedParams = "";
			var sParameters = ReloadInfoAPI.handleUrlParametersForStandalone(oReloadInfo);
			assert.equal(this.oHandleUrlParameterSpy.calledOnce, true, "handleUrlParameter was called");
			assert.equal(oHasParameterAndValueStub.calledOnce, true, "handleUrlParameter was called");
			assert.equal(sParameters, sExpectedParams, "then the parameter was removed");
		});

		QUnit.test("and the version parameter is in the URL with value '123'", function(assert) {
			var sParams = "?" + Version.UrlParameter + "=123";
			var oHasParameterAndValueStub = sandbox.stub(FlexUtils, "hasParameterAndValue").returns(true);

			var oReloadInfo = {
				layer: Layer.CUSTOMER,
				isDraftAvailable: true,
				hasHigherLayerChanges: false,
				parameters: sParams
			};

			var sExpectedParams = "";
			var sParameters = ReloadInfoAPI.handleUrlParametersForStandalone(oReloadInfo);
			assert.equal(this.oHandleUrlParameterSpy.calledOnce, true, "handleUrlParameter was called");
			assert.equal(oHasParameterAndValueStub.calledOnce, true, "handleUrlParameter was called");
			assert.equal(sParameters, sExpectedParams, "then the parameter was removed");
		});

		QUnit.test("and the max-layer parameter is in the url", function(assert) {
			var sParams = "?" + LayerUtils.FL_MAX_LAYER_PARAM + "=" + Layer.CUSTOMER;
			var oHasParameterAndValueStub = sandbox.stub(FlexUtils, "hasParameterAndValue").returns(true);

			var oReloadInfo = {
				layer: Layer.CUSTOMER,
				isDraftAvailable: false,
				hasHigherLayerChanges: true,
				parameters: sParams
			};

			var sExpectedParams = "";
			var sParameters = ReloadInfoAPI.handleUrlParametersForStandalone(oReloadInfo);
			assert.equal(this.oHandleUrlParameterSpy.calledOnce, true, "handleUrlParameter was called");
			assert.equal(oHasParameterAndValueStub.calledOnce, true, "handleUrlParameter was called");
			assert.equal(sParameters, sExpectedParams, "then the parameter was removed");
		});

		QUnit.test("and the version parameter is not in the url and draft changes exist on startup", function(assert) {
			var sParams = "";
			var oHasParameterAndValueStub = sandbox.stub(FlexUtils, "hasParameterAndValue").returns(false);

			var oReloadInfo = {
				layer: Layer.CUSTOMER,
				isDraftAvailable: true,
				hasHigherLayerChanges: false,
				parameters: sParams
			};

			var sExpectedParams = "?" + Version.UrlParameter + "=" + Version.Number.Draft;
			var sParameters = ReloadInfoAPI.handleUrlParametersForStandalone(oReloadInfo);
			assert.equal(this.oHandleUrlParameterSpy.calledOnce, true, "handleUrlParameter was called");
			assert.equal(oHasParameterAndValueStub.calledOnce, true, "handleUrlParameter was called");
			assert.equal(sParameters, sExpectedParams, "then the parameter was added");
		});

		QUnit.test("and the version parameter is not in the url and draft changes exist on exit", function(assert) {
			var sParams = "";
			var oHasParameterAndValueStub = sandbox.stub(FlexUtils, "hasParameterAndValue").returns(false);

			var oReloadInfo = {
				layer: Layer.CUSTOMER,
				isDraftAvailable: true,
				hasHigherLayerChanges: false,
				parameters: sParams,
				onExit: true
			};

			var sExpectedParams = "";
			var sParameters = ReloadInfoAPI.handleUrlParametersForStandalone(oReloadInfo);
			assert.equal(this.oHandleUrlParameterSpy.calledOnce, false, "handleUrlParameter was NOT called");
			assert.equal(oHasParameterAndValueStub.calledOnce, false, "handleUrlParameter was NOT called");
			assert.equal(sParameters, sExpectedParams, "then the parameter was NOT added");
		});

		QUnit.test("and the max-layer parameter is not in the url and higherLayer changes exist", function(assert) {
			var sParams = "";
			var oHasParameterAndValueStub = sandbox.stub(FlexUtils, "hasParameterAndValue").returns(false);

			var oReloadInfo = {
				layer: Layer.CUSTOMER,
				isDraftAvailable: false,
				hasHigherLayerChanges: true,
				parameters: sParams
			};

			var sExpectedParams = "?" + LayerUtils.FL_MAX_LAYER_PARAM + "=" + Layer.CUSTOMER;
			var sParameters = ReloadInfoAPI.handleUrlParametersForStandalone(oReloadInfo);
			assert.equal(this.oHandleUrlParameterSpy.calledOnce, true, "handleUrlParameter was called");
			assert.equal(oHasParameterAndValueStub.calledOnce, true, "handleUrlParameter was called");
			assert.equal(sParameters, sExpectedParams, "then the parameter was added");
		});

		QUnit.test("and the max-layer & version parameter is not in the url and higherLayer & draft changes exist", function(assert) {
			var sParams = "";
			var oHasParameterAndValueStub = sandbox.stub(FlexUtils, "hasParameterAndValue").returns(false);

			var oReloadInfo = {
				layer: Layer.CUSTOMER,
				isDraftAvailable: true,
				hasHigherLayerChanges: true,
				parameters: sParams
			};
			var sExpectedParams = "?" + LayerUtils.FL_MAX_LAYER_PARAM + "=" + Layer.CUSTOMER + "&" + Version.UrlParameter + "=" + Version.Number.Draft;
			var sParameters = ReloadInfoAPI.handleUrlParametersForStandalone(oReloadInfo);
			assert.equal(this.oHandleUrlParameterSpy.calledTwice, true, "handleUrlParameter was called twice");
			assert.equal(oHasParameterAndValueStub.calledTwice, true, "handleUrlParameter was called twice");
			assert.equal(sParameters, sExpectedParams, "then the parameter was added");
		});
	});

	QUnit.module("Given that removeInfoSessionStorage is called", {
		afterEach: function() {
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
});