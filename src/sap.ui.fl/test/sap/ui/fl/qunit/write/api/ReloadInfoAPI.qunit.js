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
			assert.equal(oReloadInfo.hasVersionUrlParameter, false, "has version paramert in the url");
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
				activeVersion: "2",
				URLParsingService: true //the functionality is stubbed, but is needs to exist
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

		QUnit.test("active version is not original", function(assert) {
			var oReloadInfo = {
				layer: Layer.CUSTOMER,
				selector: {},
				changesNeedReload: false,
				isDraftAvailable: false,
				versioningEnabled: true,
				activeVersion: "2",
				URLParsingService: true //the functionality is stubbed, but is needs to exist
			};

			var mParsedHash = {
				params: {}
			};

			sandbox.stub(FlexUtils, "getParsedURLHash").returns(mParsedHash);

			sandbox.stub(ReloadInfoAPI, "hasMaxLayerParameterWithValue").returns(false);
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
			assert.equal(oReloadInfo.hasVersionUrlParameter, true, "has version paramert in the url");
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

	function checkParameters(oExpectedParameters, oActualParameters, sScenario, assert) {
		var vParameters = oExpectedParameters;
		if (sScenario === "standalone") {
			var oUriParameters = UriParameters.fromQuery(oActualParameters);
			Object.entries(oExpectedParameters).forEach(function(aKeyValue) {
				assert.strictEqual(oUriParameters.get(aKeyValue[0]), aKeyValue[1][0], "the parameters are correct");
			});
			assert.strictEqual(Object.keys(oExpectedParameters).length, Object.keys(oUriParameters.mParams).length, "the number of params is correct");
		} else {
			assert.deepEqual(oActualParameters, vParameters, "the parameters are correct");
		}
	}

	function initialParameter(sKey, sValue, sScenario) {
		var oReturn;
		if (sScenario === "flp") {
			oReturn = {};
			oReturn[sKey] = [sValue];
		} else {
			oReturn = "?" + sKey + "=" + sValue;
		}
		return oReturn;
	}

	["flp", "standalone"].forEach(function(sScenario) {
		var sName = sScenario + ": handleParametersOnStart - ";
		QUnit.module(sName, {
			beforeEach: function() {
				this.oReloadInfo = {
					parameters: sScenario === "flp" ? {} : "",
					layer: Layer.CUSTOMER
				};
			},
			afterEach: function() {
				sandbox.restore();
			}
		}, function() {
			QUnit.test("with no draft / higher layer Changes", function(assert) {
				var bResult = ReloadInfoAPI.handleParametersOnStart(this.oReloadInfo, sScenario);
				assert.strictEqual(bResult, false, "no parameter was changed");
				checkParameters({}, this.oReloadInfo.parameters, sScenario, assert);
			});

			QUnit.test("with a draft / no higher layer Changes", function(assert) {
				this.oReloadInfo.isDraftAvailable = true;
				var bResult = ReloadInfoAPI.handleParametersOnStart(this.oReloadInfo, sScenario);
				assert.strictEqual(bResult, true, "parameters were changed");
				checkParameters({"sap-ui-fl-version": [Version.Number.Draft]}, this.oReloadInfo.parameters, sScenario, assert);
			});

			QUnit.test("with no draft / higher layer Changes", function(assert) {
				this.oReloadInfo.hasHigherLayerChanges = true;
				var bResult = ReloadInfoAPI.handleParametersOnStart(this.oReloadInfo, sScenario);
				assert.strictEqual(bResult, true, "parameters were changed");
				checkParameters({"sap-ui-fl-max-layer": [Layer.CUSTOMER]}, this.oReloadInfo.parameters, sScenario, assert);
			});

			QUnit.test("with a draft / higher layer Changes", function(assert) {
				this.oReloadInfo.isDraftAvailable = true;
				this.oReloadInfo.hasHigherLayerChanges = true;
				var bResult = ReloadInfoAPI.handleParametersOnStart(this.oReloadInfo, sScenario);
				assert.strictEqual(bResult, true, "parameters were changed");
				checkParameters({"sap-ui-fl-max-layer": [Layer.CUSTOMER], "sap-ui-fl-version": [Version.Number.Draft]}, this.oReloadInfo.parameters, sScenario, assert);
			});
		});

		var sName2 = sScenario + ": handleUrlParameters - ";
		QUnit.module(sName2, {
			beforeEach: function() {
				this.oReloadInfo = {
					parameters: sScenario === "flp" ? {} : "",
					layer: Layer.CUSTOMER
				};
				sandbox.stub(UriParameters, "fromQuery").callsFake(function() {
					return UriParameters.fromQuery.wrappedMethod(this.oReloadInfo.parameters);
				}.bind(this));
			},
			afterEach: function() {
				sandbox.restore();
			}
		}, function() {
			QUnit.test("with max layer param in the url and hasHigherLayerChanges", function(assert) {
				this.oReloadInfo.hasHigherLayerChanges = true;
				this.oReloadInfo.parameters = initialParameter("sap-ui-fl-max-layer", Layer.CUSTOMER, sScenario);
				var bResult = ReloadInfoAPI.handleUrlParameters(this.oReloadInfo, sScenario);
				assert.strictEqual(bResult, true, "parameters were changed");
				checkParameters({}, this.oReloadInfo.parameters, sScenario, assert);
			});

			QUnit.test("with max layer param in the url and hasHigherLayerChanges / ignoreMaxLayerParameter", function(assert) {
				this.oReloadInfo.hasHigherLayerChanges = true;
				this.oReloadInfo.ignoreMaxLayerParameter = true;
				this.oReloadInfo.parameters = initialParameter("sap-ui-fl-max-layer", Layer.CUSTOMER, sScenario);
				var bResult = ReloadInfoAPI.handleUrlParameters(this.oReloadInfo, sScenario);
				assert.strictEqual(bResult, false, "no parameters were changed");
				checkParameters({"sap-ui-fl-max-layer": [Layer.CUSTOMER]}, this.oReloadInfo.parameters, sScenario, assert);
			});

			QUnit.test("without version in url and versionSwitch / version set", function(assert) {
				this.oReloadInfo.versionSwitch = true;
				this.oReloadInfo.version = "1";
				var bResult = ReloadInfoAPI.handleUrlParameters(this.oReloadInfo, sScenario);
				assert.strictEqual(bResult, true, "parameters were changed");
				checkParameters({"sap-ui-fl-version": ["1"]}, this.oReloadInfo.parameters, sScenario, assert);
			});

			QUnit.test("with version in url and versionSwitch / version set", function(assert) {
				this.oReloadInfo.versionSwitch = true;
				this.oReloadInfo.version = "1";
				this.oReloadInfo.parameters = initialParameter("sap-ui-fl-version", "1", sScenario);
				var bResult = ReloadInfoAPI.handleUrlParameters(this.oReloadInfo, sScenario);
				assert.strictEqual(bResult, false, "no parameters were changed");
				checkParameters({"sap-ui-fl-version": ["1"]}, this.oReloadInfo.parameters, sScenario, assert);
			});

			QUnit.test("with different version in url and versionSwitch / version set", function(assert) {
				this.oReloadInfo.versionSwitch = true;
				this.oReloadInfo.version = "1";
				this.oReloadInfo.parameters = initialParameter("sap-ui-fl-version", "2", sScenario);
				var bResult = ReloadInfoAPI.handleUrlParameters(this.oReloadInfo, sScenario);
				assert.strictEqual(bResult, true, "parameters were changed");
				checkParameters({"sap-ui-fl-version": ["1"]}, this.oReloadInfo.parameters, sScenario, assert);
			});

			QUnit.test("with version in url and removeVersionParameter", function(assert) {
				this.oReloadInfo.removeVersionParameter = true;
				this.oReloadInfo.parameters = initialParameter("sap-ui-fl-version", "2", sScenario);
				var bResult = ReloadInfoAPI.handleUrlParameters(this.oReloadInfo, sScenario);
				assert.strictEqual(bResult, true, "parameters were changed");
				checkParameters({}, this.oReloadInfo.parameters, sScenario, assert);
			});

			QUnit.test("with draft version in url and removeVersionParameter", function(assert) {
				this.oReloadInfo.removeVersionParameter = true;
				this.oReloadInfo.parameters = initialParameter("sap-ui-fl-version", Version.Number.Draft, sScenario);
				var bResult = ReloadInfoAPI.handleUrlParameters(this.oReloadInfo, sScenario);
				assert.strictEqual(bResult, true, "parameters were changed");
				checkParameters({}, this.oReloadInfo.parameters, sScenario, assert);
			});

			QUnit.test("without version in url and removeVersionParameter", function(assert) {
				this.oReloadInfo.removeVersionParameter = true;
				var bResult = ReloadInfoAPI.handleUrlParameters(this.oReloadInfo, sScenario);
				assert.strictEqual(bResult, false, "no parameters were changed");
				checkParameters({}, this.oReloadInfo.parameters, sScenario, assert);
			});

			QUnit.test("without version in url and removeDraft", function(assert) {
				this.oReloadInfo.removeVersionParameter = true;
				var bResult = ReloadInfoAPI.handleUrlParameters(this.oReloadInfo, sScenario);
				assert.strictEqual(bResult, false, "no parameters were changed");
				checkParameters({}, this.oReloadInfo.parameters, sScenario, assert);
			});

			QUnit.test("with draft version in url and removeDraft", function(assert) {
				this.oReloadInfo.removeVersionParameter = true;
				this.oReloadInfo.parameters = initialParameter("sap-ui-fl-version", Version.Number.Draft, sScenario);
				var bResult = ReloadInfoAPI.handleUrlParameters(this.oReloadInfo, sScenario);
				assert.strictEqual(bResult, true, "parameters were changed");
				checkParameters({}, this.oReloadInfo.parameters, sScenario, assert);
			});
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});