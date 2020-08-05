/* global QUnit */

sap.ui.define([
	"sap/ui/fl/write/api/VersionsAPI",
	"sap/ui/fl/write/_internal/Versions",
	"sap/ui/fl/write/_internal/Storage",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/core/Control",
	"sap/ui/thirdparty/sinon-4"
], function(
	VersionsAPI,
	Versions,
	Storage,
	Settings,
	FlexState,
	Layer,
	Utils,
	ManifestUtils,
	Control,
	sinon
) {
	"use strict";

	jQuery("#qunit-fixture").hide();
	var sandbox = sinon.sandbox.create();


	QUnit.module("Given VersionsAPI.isDraftAvailable is called", {
		before: function() {
			this.oAppComponent = {
				getManifest : function () {
					return {};
				},
				getId : function () {
					return "sComponentId";
				},
				getComponentData : function () {
					return {
						startupParameters : ["sap-app-id"]
					};
				}
			};
		},
		beforeEach: function () {
			sandbox.stub(Settings, "getInstance").resolves({
				isVersioningEnabled: function () {
					return true;
				}
			});
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when no selector is provided", function (assert) {
			var mPropertyBag = {
				layer: Layer.CUSTOMER
			};

			assert.throws(
				VersionsAPI.isDraftAvailable.bind(undefined, mPropertyBag),
				new Error("No selector was provided"),
				"then an Error is thrown"
			);
		});

		QUnit.test("when no layer is provided", function (assert) {
			var mPropertyBag = {
				selector: new Control()
			};

			assert.throws(
				VersionsAPI.isDraftAvailable.bind(undefined, mPropertyBag),
				new Error("No layer was provided"),
				"then an Error is thrown"
			);
		});

		QUnit.test("when a selector and a layer were provided, but no app ID could be determined", function(assert) {
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				selector: new Control()
			};

			assert.throws(
				VersionsAPI.isDraftAvailable.bind(undefined, mPropertyBag),
				new Error("The application ID could not be determined"),
				"then an Error is thrown"
			);
		});

		QUnit.test("when a selector and a layer were provided and a draft exists", function(assert) {
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				selector: new Control()
			};

			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			sandbox.stub(ManifestUtils, "getFlexReference").returns("com.sap.app");
			var aReturnedVersions = [
				{versionNumber: 0},
				{versionNumber: 2},
				{versionNumber: 1}
			];
			sandbox.stub(Storage.versions, "load").resolves(aReturnedVersions);

			return VersionsAPI.initialize(mPropertyBag).then(function () {
				assert.equal(VersionsAPI.isDraftAvailable(mPropertyBag), true, "then a 'true' is returned");
			});
		});

		QUnit.test("when a selector and a layer were provided and a draft does not exists", function(assert) {
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				selector: new Control()
			};

			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			sandbox.stub(ManifestUtils, "getFlexReference").returns("com.sap.app");
			var aReturnedVersions = [
				{versionNumber: 2},
				{versionNumber: 1}
			];
			sandbox.stub(Storage.versions, "load").resolves(aReturnedVersions);

			return VersionsAPI.initialize(mPropertyBag).then(function () {
				assert.equal(VersionsAPI.isDraftAvailable(mPropertyBag), false, "then a 'false' is returned");
			});
		});
	});

	QUnit.module("Given VersionsAPI.loadDraftForApplication is called", {
		before: function() {
			this.oAppComponent = {
				getManifest: function () {
					return {};
				},
				getId: function () {
					return "sComponentId";
				},
				getComponentData: function () {
					return {
						startupParameters: ["sap-app-id"]
					};
				}
			};
		},
		beforeEach: function () {
			sandbox.stub(Settings, "getInstance").resolves({
				isVersioningEnabled: function () {
					return true;
				}
			});
		},
		afterEach: function() {
			sandbox.restore();
			Versions.clearInstances();
		}
	}, function() {
		QUnit.test("when no selector is provided", function (assert) {
			var mPropertyBag = {
				layer : Layer.CUSTOMER
			};

			return VersionsAPI.loadDraftForApplication(mPropertyBag).catch(function (sErrorMessage) {
				assert.equal(sErrorMessage, "No selector was provided", "then an Error is thrown");
			});
		});
		QUnit.test("when no layer is provided", function (assert) {
			var mPropertyBag = {
				selector : new Control()
			};

			return VersionsAPI.loadDraftForApplication(mPropertyBag).catch(function (sErrorMessage) {
				assert.equal(sErrorMessage, "No layer was provided", "then an Error is thrown");
			});
		});

		QUnit.test("when a selector and a layer were provided, but no app ID could be determined", function (assert) {
			var mPropertyBag = {
				layer : Layer.CUSTOMER,
				selector : new Control()
			};

			return VersionsAPI.loadDraftForApplication(mPropertyBag).catch(function (sErrorMessage) {
				assert.equal(sErrorMessage, "The application ID could not be determined", "then an Error is thrown");
			});
		});

		QUnit.test("when a selector and a layer were provided and the request returns a list of versions", function (assert) {
			var sComponentId = "sComponentId";
			var sLayer = Layer.CUSTOMER;
			var mPropertyBag = {
				layer : sLayer,
				selector : new Control(),
				componentData: {},
				manifest: {}
			};

			var sReference = "com.sap.app";
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			sandbox.stub(ManifestUtils, "getFlexReference").returns(sReference);
			var aReturnedVersions = [];
			var oClearAndInitializeStub = sandbox.stub(FlexState, "clearAndInitialize").resolves(aReturnedVersions);

			return VersionsAPI.loadDraftForApplication(mPropertyBag)
				.then(function () {
					assert.equal(oClearAndInitializeStub.callCount, 1, "and reinitialized");
					var oInitializePropertyBag = oClearAndInitializeStub.getCall(0).args[0];
					assert.equal(oInitializePropertyBag.reference, sReference, "for the same application");
					assert.equal(oInitializePropertyBag.componentId, sComponentId, "and passing the componentId accordingly");
					assert.equal(oInitializePropertyBag.draftLayer, sLayer, "and passing the draft layer accordingly");
				});
		});
	});

	QUnit.module("Given VersionsAPI.activateDraft is called", {
		before: function() {
			this.oAppComponent = {
				getManifest: function () {
					return {};
				},
				getId: function () {
					return "sComponentId";
				},
				getComponentData: function () {
					return {
						startupParameters: ["sap-app-id"]
					};
				}
			};
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when no selector is provided", function (assert) {
			var mPropertyBag = {
				layer: Layer.CUSTOMER
			};

			return VersionsAPI.activateDraft(mPropertyBag).catch(function (sErrorMessage) {
				assert.equal(sErrorMessage, "No selector was provided", "then an Error is thrown");
			});
		});

		QUnit.test("when no layer is provided", function (assert) {
			var mPropertyBag = {
				selector: new Control()
			};

			return VersionsAPI.activateDraft(mPropertyBag).catch(function (sErrorMessage) {
				assert.equal(sErrorMessage, "No layer was provided", "then an Error is thrown");
			});
		});

		QUnit.test("when no version title is provided", function (assert) {
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				selector: new Control()
			};

			return VersionsAPI.activateDraft(mPropertyBag).catch(function (sErrorMessage) {
				assert.equal(sErrorMessage, "No version title was provided", "then an Error is thrown");
			});
		});

		QUnit.test("when a selector and a layer were provided, but no app ID could be determined", function(assert) {
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				selector: new Control(),
				title: "new Title"
			};
			sandbox.stub(Utils, "getAppComponentForControl").returns(undefined);

			return VersionsAPI.activateDraft(mPropertyBag).catch(function (sErrorMessage) {
				assert.equal(sErrorMessage, "The application ID could not be determined", "then an Error is thrown");
			});
		});

		QUnit.test("when a selector and a layer were provided and the request returns a list of versions", function(assert) {
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				selector: new Control(),
				title: "new Title"
			};
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			sandbox.stub(ManifestUtils, "getFlexReference").returns("com.sap.app");
			var aReturnedVersions = [];
			sandbox.stub(Versions, "activateDraft").resolves(aReturnedVersions);

			return VersionsAPI.activateDraft(mPropertyBag)
				.then(function(oResult) {
					assert.equal(oResult, aReturnedVersions, "then the returned version list is passed");
				});
		});
	});

	QUnit.module("Given VersionsAPI.discardDraft is called", {
		beforeEach: function() {
			this.oAppComponent = {
				getManifest: function () {
					return {};
				},
				getId: function () {
					return "sComponentId";
				},
				getComponentData: function () {
					return {
						startupParameters: ["sap-app-id"]
					};
				}
			};
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when no selector is provided", function (assert) {
			var mPropertyBag = {
				layer: Layer.CUSTOMER
			};

			return VersionsAPI.discardDraft(mPropertyBag).catch(function (sErrorMessage) {
				assert.equal(sErrorMessage, "No selector was provided", "then an Error is thrown");
			});
		});
		QUnit.test("when no layer is provided", function (assert) {
			var mPropertyBag = {
				selector: new Control()
			};

			return VersionsAPI.discardDraft(mPropertyBag).catch(function (sErrorMessage) {
				assert.equal(sErrorMessage, "No layer was provided", "then an Error is thrown");
			});
		});

		QUnit.test("when a selector and a layer were provided, but no app ID could be determined", function(assert) {
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				selector: new Control()
			};

			return VersionsAPI.discardDraft(mPropertyBag).catch(function (sErrorMessage) {
				assert.equal(sErrorMessage, "The application ID could not be determined", "then an Error is thrown");
			});
		});

		QUnit.test("when a selector, a layer and a flag to update the state were provided and the request returns a list of versions", function(assert) {
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				selector: new Control()
			};

			var sReference = "com.sap.app";
			sandbox.stub(ManifestUtils, "getFlexReference").returns(sReference);
			var oClearAndInitStub = sandbox.stub(FlexState, "clearAndInitialize");
			var oDiscardStub = sandbox.stub(Versions, "discardDraft").resolves({backendChangesDiscarded: true, dirtyChangesDiscarded: true});
			return VersionsAPI.discardDraft(mPropertyBag)
				.then(function(oDiscardInfo) {
					assert.equal(oClearAndInitStub.calledOnce, true, "then the FlexState was cleared and initialized");
					assert.equal(oDiscardInfo.backendChangesDiscarded, true, "then the discard outcome was returned");
					assert.equal(oDiscardInfo.dirtyChangesDiscarded, true, "then the discard outcome was returned");					var oCallingPropertyBag = oDiscardStub.getCall(0).args[0];
					assert.equal(oCallingPropertyBag.reference, sReference, "the reference was passed");
					assert.equal(oCallingPropertyBag.layer, mPropertyBag.layer, "the layer was passed");
				});
		});

		QUnit.test("when a AppComponent was found", function(assert) {
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				selector: new Control()
			};
			var sAppVersion = "1.0.0";
			sandbox.stub(Utils, "getAppVersionFromManifest").returns(sAppVersion);

			var sReference = "com.sap.app";
			sandbox.stub(ManifestUtils, "getFlexReference").returns(sReference);
			var oClearAndInitStub = sandbox.stub(FlexState, "clearAndInitialize");
			var oDiscardStub = sandbox.stub(Versions, "discardDraft").resolves({backendChangesDiscarded: true, dirtyChangesDiscarded: true});
			return VersionsAPI.discardDraft(mPropertyBag)
				.then(function(oDiscardInfo) {
					assert.equal(oClearAndInitStub.calledOnce, true, "then the FlexState was cleared and initialized");
					assert.equal(oDiscardInfo.backendChangesDiscarded, true, "then the discard outcome was returned");
					assert.equal(oDiscardInfo.dirtyChangesDiscarded, true, "then the discard outcome was returned");
					assert.deepEqual(oDiscardStub.getCall(0).args[0].appVersion, sAppVersion, "the app version was passed");
					assert.deepEqual(oDiscardStub.getCall(0).args[0].reference, sReference, "the reference was passed");
					assert.deepEqual(oDiscardStub.getCall(0).args[0].layer, Layer.CUSTOMER, "the layer was passed");
				});
		});
	});
});
