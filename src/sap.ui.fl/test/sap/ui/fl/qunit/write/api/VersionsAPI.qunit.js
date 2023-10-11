/* global QUnit */

sap.ui.define([
	"sap/ui/fl/write/api/ContextBasedAdaptationsAPI",
	"sap/ui/fl/write/api/Version",
	"sap/ui/fl/write/api/VersionsAPI",
	"sap/ui/fl/write/_internal/Versions",
	"sap/ui/fl/write/_internal/Storage",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/initial/_internal/FlexInfoSession",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/core/Control",
	"sap/ui/thirdparty/sinon-4"
], function(
	ContextBasedAdaptationsAPI,
	Version,
	VersionsAPI,
	Versions,
	Storage,
	Settings,
	FlexState,
	FlexInfoSession,
	Layer,
	Utils,
	ManifestUtils,
	Control,
	sinon
) {
	"use strict";

	document.getElementById("qunit-fixture").style.display = "none";
	var sandbox = sinon.createSandbox();

	function stubSettings(sandbox) {
		sandbox.stub(Settings, "getInstance").resolves({
			isVersioningEnabled() {
				return true;
			},
			isSystemWithTransports() {
				return false;
			}
		});
	}

	QUnit.module("getVersionsModel", {
		before() {
			this.oAppComponent = {
				getManifest() {
					return {};
				},
				getManifestObject() {
					return {
						"sap.app": {
							id: "com.sap.test.app"
						}
					};
				},
				getId() {
					return "sComponentId";
				},
				getComponentData() {
					return {
						startupParameters: ["sap-app-id"]
					};
				}
			};
		}
	}, function() {
		QUnit.test("Given isDraftAvailable is called", function(assert) {
			var oGetModelStub = sandbox.stub(Versions, "getVersionsModel").returns({
				getProperty() {
					return [];
				}
			});

			var sNormalizedReference = "com.sap.test.app";

			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);

			VersionsAPI.isDraftAvailable({
				layer: Layer.CUSTOMER,
				control: new Control()
			});

			assert.equal(oGetModelStub.callCount, 1, "then the model was requested once");
			assert.equal(oGetModelStub.getCall(0).args[0].reference, sNormalizedReference, "the model was requested without '.Component	'");
		});
	});

	QUnit.module("Given VersionsAPI.isDraftAvailable is called", {
		before() {
			this.oAppComponent = {
				getManifest() {
					return {};
				},
				getManifestObject() {
					return {
						"sap.app": {
							id: "com.sap.test.app"
						}
					};
				},
				getId() {
					return "sComponentId";
				},
				getComponentData() {
					return {
						startupParameters: ["sap-app-id"]
					};
				}
			};
		},
		beforeEach() {
			Versions.clearInstances();
			stubSettings(sandbox);
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when no control is provided", function(assert) {
			var mPropertyBag = {
				layer: Layer.CUSTOMER
			};

			assert.throws(
				VersionsAPI.isDraftAvailable.bind(undefined, mPropertyBag),
				new Error("No control was provided"),
				"then an Error is thrown"
			);
		});

		QUnit.test("when no layer is provided", function(assert) {
			var mPropertyBag = {
				control: new Control()
			};

			assert.throws(
				VersionsAPI.isDraftAvailable.bind(undefined, mPropertyBag),
				new Error("No layer was provided"),
				"then an Error is thrown"
			);
		});

		QUnit.test("when a control and a layer were provided, but no app ID could be determined", function(assert) {
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				control: new Control()
			};

			assert.throws(
				VersionsAPI.isDraftAvailable.bind(undefined, mPropertyBag),
				new Error("The application ID could not be determined"),
				"then an Error is thrown"
			);
		});

		QUnit.test("when a control and a layer were provided and a draft exists", function(assert) {
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				control: new Control()
			};

			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			sandbox.stub(ManifestUtils, "getFlexReference").returns("com.sap.app");
			var aReturnedVersions = [
				{version: Version.Number.Draft},
				{version: "2"},
				{version: "1"}
			];
			sandbox.stub(Storage.versions, "load").resolves(aReturnedVersions);

			return VersionsAPI.initialize(mPropertyBag).then(function() {
				assert.equal(VersionsAPI.isDraftAvailable(mPropertyBag), true, "then a 'true' is returned");
			});
		});

		QUnit.test("when a control and a layer were provided and a draft does not exists", function(assert) {
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				control: new Control()
			};

			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			sandbox.stub(ManifestUtils, "getFlexReference").returns("com.sap.app");
			var aReturnedVersions = [
				{version: "2"},
				{version: "1"}
			];
			sandbox.stub(Storage.versions, "load").resolves(aReturnedVersions);

			return VersionsAPI.initialize(mPropertyBag).then(function() {
				assert.equal(VersionsAPI.isDraftAvailable(mPropertyBag), false, "then a 'false' is returned");
			});
		});
	});

	QUnit.module("Given VersionsAPI.isOldVersionDisplayed is called", {
		before() {
			this.oAppComponent = {
				getManifest() {
					return {};
				},
				getManifestObject() {
					return {
						"sap.app": {
							id: "com.sap.test.app"
						}
					};
				},
				getId() {
					return "sComponentId";
				},
				getComponentData() {
					return {
						startupParameters: ["sap-app-id"]
					};
				}
			};
		},
		beforeEach() {
			Versions.clearInstances();
			stubSettings(sandbox);
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when no control is provided", function(assert) {
			var mPropertyBag = {
				layer: Layer.CUSTOMER
			};

			assert.throws(
				VersionsAPI.isOldVersionDisplayed.bind(undefined, mPropertyBag),
				new Error("No control was provided"),
				"then an Error is thrown"
			);
		});

		QUnit.test("when no layer is provided", function(assert) {
			var mPropertyBag = {
				control: new Control()
			};

			assert.throws(
				VersionsAPI.isOldVersionDisplayed.bind(undefined, mPropertyBag),
				new Error("No layer was provided"),
				"then an Error is thrown"
			);
		});

		QUnit.test("when a control and a layer were provided, but no app ID could be determined", function(assert) {
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				control: new Control()
			};

			assert.throws(
				VersionsAPI.isOldVersionDisplayed.bind(undefined, mPropertyBag),
				new Error("The application ID could not be determined"),
				"then an Error is thrown"
			);
		});

		QUnit.test("when a control and a layer were provided and a draft exists", function(assert) {
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				control: new Control()
			};

			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			sandbox.stub(ManifestUtils, "getFlexReference").returns("com.sap.app");
			var aReturnedVersions = [
				{version: Version.Number.Draft},
				{version: "2"},
				{version: "1"}
			];
			sandbox.stub(Storage.versions, "load").resolves(aReturnedVersions);

			return VersionsAPI.initialize(mPropertyBag).then(function() {
				assert.equal(VersionsAPI.isOldVersionDisplayed(mPropertyBag), false, "then a 'false' is returned");
			});
		});

		QUnit.test("when a control and a layer were provided and display version is equal to active version", function(assert) {
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				control: new Control()
			};

			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			sandbox.stub(ManifestUtils, "getFlexReference").returns("com.sap.app");
			var aReturnedVersions = [
				{version: "2"},
				{version: "1"}
			];
			sandbox.stub(Storage.versions, "load").resolves(aReturnedVersions);

			return VersionsAPI.initialize(mPropertyBag).then(function() {
				assert.equal(VersionsAPI.isOldVersionDisplayed(mPropertyBag), false, "then a 'false' is returned");
			});
		});

		QUnit.test("when a control and a layer were provided and display version is not equal to active version", function(assert) {
			sandbox.stub(URLSearchParams.prototype, "get").returns("1");
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				control: new Control(),
				version: "1"
			};

			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			sandbox.stub(ManifestUtils, "getFlexReference").returns("com.sap.app");
			var aReturnedVersions = [
				{version: "2"},
				{version: "1"}
			];
			sandbox.stub(Storage.versions, "load").resolves(aReturnedVersions);
			return VersionsAPI.initialize(mPropertyBag)
			// switch to another version
			.then(VersionsAPI.loadVersionForApplication.bind(this, mPropertyBag))
			.then(function() {
				assert.equal(VersionsAPI.isOldVersionDisplayed(mPropertyBag), true, "then a 'true' is returned");
			});
		});
	});

	QUnit.module("Given VersionsAPI.loadDraftForApplication is called", {
		before() {
			this.oAppComponent = {
				getManifest() {
					return {};
				},
				getManifestObject() {
					return {};
				},
				getId() {
					return "sComponentId";
				},
				getComponentData() {
					return {
						startupParameters: ["sap-app-id"]
					};
				}
			};
		},
		beforeEach() {
			stubSettings(sandbox);
			Versions.clearInstances();
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when no control is provided", function(assert) {
			var oControl = new Control();
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				control: oControl
			};

			var oLoadVersionForApplicationStub = sandbox.stub(VersionsAPI, "loadVersionForApplication").resolves();

			return VersionsAPI.loadDraftForApplication(mPropertyBag)
			.then(function() {
				assert.equal(oLoadVersionForApplicationStub.callCount, 1, "loadVersionsForApplication was called once");
				var oParameters = oLoadVersionForApplicationStub.getCall(0).args[0];
				assert.equal(oParameters.layer, Layer.CUSTOMER, "and the layer was passed");
				assert.equal(oParameters.control, oControl, "as well as the control was passed");
				assert.equal(oParameters.version, Version.Number.Draft, "and the version number of the draft was passed");
			});
		});
	});

	QUnit.module("Given VersionsAPI.loadVersionForApplication is called", {
		before() {
			this.oAppComponent = {
				getManifest() {
					return {};
				},
				getManifestObject() {
					return {
						"sap.app": {
							id: "com.sap.app"
						}
					};
				},
				getId() {
					return "sComponentId";
				},
				getComponentData() {
					return {
						startupParameters: ["sap-app-id"]
					};
				}
			};
		},
		beforeEach() {
			stubSettings(sandbox);
			Versions.clearInstances();
			var oDefaultAdaptation = {
				id: "DEFAULT",
				title: "",
				type: "DEFAULT"
			};
			var aAdaptations = [
				{
					title: "Sales",
					rank: 1,
					id: "id_1234"
				},
				{
					title: "Manager",
					rank: 2,
					id: "id_5678"
				},
				oDefaultAdaptation
			];
			sandbox.stub(ContextBasedAdaptationsAPI, "hasAdaptationsModel").returns(true);
			this.oRefreshAdaptationsModelStub = sandbox.stub(ContextBasedAdaptationsAPI, "refreshAdaptationModel").resolves("id_5678");
			this.oAdaptationsModel = ContextBasedAdaptationsAPI.createModel(aAdaptations, aAdaptations[0], true);
			this.oGetAdaptationsModelStub = sandbox.stub(ContextBasedAdaptationsAPI, "getAdaptationsModel").returns(this.oAdaptationsModel);
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when no control is provided", function(assert) {
			var mPropertyBag = {
				layer: Layer.CUSTOMER
			};

			return VersionsAPI.loadVersionForApplication(mPropertyBag).catch(function(sErrorMessage) {
				assert.equal(sErrorMessage, "No control was provided", "then an Error is thrown");
			});
		});

		QUnit.test("when no layer is provided", function(assert) {
			var mPropertyBag = {
				control: new Control()
			};

			return VersionsAPI.loadVersionForApplication(mPropertyBag).catch(function(sErrorMessage) {
				assert.equal(sErrorMessage, "No layer was provided", "then an Error is thrown");
			});
		});

		QUnit.test("when a control, a layer and a version were provided, but no app ID could be determined", function(assert) {
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				control: new Control(),
				version: Version.Number.Original
			};

			assert.throws(
				VersionsAPI.loadVersionForApplication.bind(undefined, mPropertyBag),
				new Error("The application ID could not be determined"),
				"then an Error is thrown"
			);
		});

		QUnit.test("when a control, a layer, a context but no adaptationId parameter were provided and the request returns a list (version is switched)", function(assert) {
			var sLayer = Layer.CUSTOMER;
			var sReference = "com.sap.app";
			var mPropertyBag = {
				layer: sLayer,
				control: new Control(),
				allContexts: true,
				reference: sReference,
				appComponent: this.oAppComponent
			};
			var sActiveVersion = "1";
			var aReturnedBackendVersions = [
				{
					activatedBy: "qunit",
					activatedAt: "a while ago",
					version: sActiveVersion
				}
			];
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			sandbox.stub(ManifestUtils, "getFlexReference").returns(sReference);
			sandbox.stub(Storage.versions, "load").resolves(aReturnedBackendVersions);
			var oClearStub = sandbox.stub(FlexState, "clearState");

			return Versions.initialize(mPropertyBag)
			.then(function(oVersionsModel) {
				this.oVersionsModel = oVersionsModel;
				sandbox.stub(Versions, "getVersionsModel").returns(oVersionsModel);
				assert.equal(mPropertyBag.version, undefined, "version is not set yet");
			}.bind(this))
			.then(VersionsAPI.loadVersionForApplication.bind(undefined, mPropertyBag))
			.then(function() {
				assert.equal(oClearStub.callCount, 1, "and cleared");
				const oInfoSession = FlexInfoSession.getByReference(sReference);
				assert.equal(oInfoSession.adaptationId, "id_5678", "the displayed adaptationId is provided by refreshAdaptationModel");
				assert.equal(oInfoSession.version, sActiveVersion, "and active version is set by version model");
				assert.equal(this.oVersionsModel.getProperty("/displayedVersion"), sActiveVersion, "and displayed version is active version");
				assert.equal(this.oVersionsModel.getProperty("/persistedVersion"), sActiveVersion, "and persisted version is active version");
				assert.equal(this.oRefreshAdaptationsModelStub.callCount, 1, "a refresh of the context based adaptations is triggered");
				assert.equal(this.oGetAdaptationsModelStub.callCount, 0, "a switching of the adaptation is not triggered");
			}.bind(this));
		});

		QUnit.test("when a control, a layer and context parameter were provided and the request returns a list (adaptation is switched)", function(assert) {
			var sLayer = Layer.CUSTOMER;
			var sReference = "com.sap.app";
			var mPropertyBag = {
				layer: sLayer,
				control: new Control(),
				allContexts: true,
				adaptationId: "id_5678",
				reference: sReference,
				appComponent: this.oAppComponent
			};
			var sActiveVersion = "1";
			var aReturnedBackendVersions = [
				{
					activatedBy: "qunit",
					activatedAt: "a while ago",
					version: sActiveVersion
				}
			];
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			sandbox.stub(ManifestUtils, "getFlexReference").returns(sReference);
			sandbox.stub(Storage.versions, "load").resolves(aReturnedBackendVersions);
			var oClearStub = sandbox.stub(FlexState, "clearState").resolves([]);

			return Versions.initialize(mPropertyBag)
			.then(function(oVersionsModel) {
				this.oVersionsModel = oVersionsModel;
				sandbox.stub(Versions, "getVersionsModel").returns(oVersionsModel);
				assert.equal(mPropertyBag.version, undefined, "version is not set yet");
			}.bind(this))
			.then(VersionsAPI.loadVersionForApplication.bind(undefined, mPropertyBag))
			.then(function() {
				assert.equal(oClearStub.callCount, 1, "and reinitialized");
				const oInfoSession = FlexInfoSession.getByReference(sReference);
				assert.equal(oInfoSession.adaptationId, "id_5678", "and passing adaptationId");
				assert.equal(oInfoSession.version, sActiveVersion, "and active version is set by version model");
				assert.equal(this.oVersionsModel.getProperty("/displayedVersion"), sActiveVersion,
					"and displayed version is active version");
				assert.equal(this.oVersionsModel.getProperty("/persistedVersion"), sActiveVersion,
					"and persisted version is active version");
				assert.equal(this.oRefreshAdaptationsModelStub.callCount, 0,
					"a refresh of the context based adaptations is not triggered");
				assert.equal(this.oGetAdaptationsModelStub.callCount, 1, "a switching of the adaptation is triggered");
				assert.equal(this.oAdaptationsModel.getProperty("/displayedAdaptation/id"), mPropertyBag.adaptationId,
					"and displayed adaptation is switched");
			}.bind(this));
		});

		QUnit.test("when a control and a layer were provided and the request returns a list of versions", function(assert) {
			var sLayer = Layer.CUSTOMER;
			var mPropertyBag = {
				layer: sLayer,
				control: new Control(),
				componentData: {},
				manifest: {},
				version: Version.Number.Draft
			};

			var sActiveVersion = "1";
			var aReturnedBackendVersions = [
				{
					activatedBy: "qunit",
					activatedAt: "a while ago",
					version: sActiveVersion,
					isPublished: true
				}
			];

			var sReference = "com.sap.app";
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			sandbox.stub(ManifestUtils, "getFlexReference").returns(sReference);
			sandbox.stub(Storage.versions, "load").resolves(aReturnedBackendVersions);
			var oClearStub = sandbox.stub(FlexState, "clearState");

			return Versions.initialize(mPropertyBag)
			.then(function(oVersionsModel) {
				this.oVersionsModel = oVersionsModel;
				sandbox.stub(Versions, "getVersionsModel").returns(oVersionsModel);
				assert.equal(this.oVersionsModel.getProperty("/displayedVersion"), sActiveVersion, "displayed version is active version");
				assert.equal(this.oVersionsModel.getProperty("/persistedVersion"), sActiveVersion, "and persisted version is active version");
			}.bind(this))
			.then(VersionsAPI.loadVersionForApplication.bind(undefined, mPropertyBag))
			.then(function() {
				assert.equal(oClearStub.callCount, 1, "and reinitialized");
				const oInfoSession = FlexInfoSession.getByReference(sReference);
				assert.equal(oInfoSession.version, Version.Number.Draft, "and passing the version number accordingly");
				assert.equal(this.oVersionsModel.getProperty("/displayedVersion"), Version.Number.Draft, "and displayed version is draft");
				assert.equal(this.oVersionsModel.getProperty("/persistedVersion"), Version.Number.Draft, "and persisted version is draft");
			}.bind(this));
		});

		QUnit.test("when a control and a layer but no version were provided and the request returns a list of versions", function(assert) {
			var sLayer = Layer.CUSTOMER;
			var mPropertyBag = {
				layer: sLayer,
				control: new Control(),
				componentData: {},
				manifest: {}
			};

			var sActiveVersion = 1;
			sandbox.stub(Versions, "getVersionsModel").returns({
				getProperty() {
					return sActiveVersion;
				},
				setProperty() {}
			});

			var sReference = "com.sap.app";
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			sandbox.stub(ManifestUtils, "getFlexReference").returns(sReference);
			var aReturnedVersions = [];
			var oClearStub = sandbox.stub(FlexState, "clearState").resolves(aReturnedVersions);

			return VersionsAPI.loadVersionForApplication(mPropertyBag)
			.then(function() {
				assert.equal(oClearStub.callCount, 1, "and reinitialized");
				const oInfoSession = FlexInfoSession.getByReference(sReference);
				assert.equal(oInfoSession.version, sActiveVersion, "and passing the version number accordingly");
			});
		});
	});

	QUnit.module("Given VersionsAPI.activate is called", {
		before() {
			this.oAppComponent = {
				getManifest() {
					return {};
				},
				getManifestObject() {
					return {};
				},
				getId() {
					return "sComponentId";
				},
				getComponentData() {
					return {
						startupParameters: ["sap-app-id"]
					};
				}
			};
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when no control is provided", function(assert) {
			var mPropertyBag = {
				layer: Layer.CUSTOMER
			};

			return VersionsAPI.activate(mPropertyBag).catch(function(sErrorMessage) {
				assert.equal(sErrorMessage, "No control was provided", "then an Error is thrown");
			});
		});

		QUnit.test("when no layer is provided", function(assert) {
			var mPropertyBag = {
				control: new Control()
			};

			return VersionsAPI.activate(mPropertyBag).catch(function(sErrorMessage) {
				assert.equal(sErrorMessage, "No layer was provided", "then an Error is thrown");
			});
		});

		QUnit.test("when no version title is provided", function(assert) {
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				control: new Control()
			};

			return VersionsAPI.activate(mPropertyBag).catch(function(sErrorMessage) {
				assert.equal(sErrorMessage, "No version title was provided", "then an Error is thrown");
			});
		});

		QUnit.test("when a control and a layer were provided, but no app ID could be determined", function(assert) {
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				control: new Control(),
				title: "new Title"
			};
			sandbox.stub(Utils, "getAppComponentForControl").returns(undefined);

			assert.throws(
				VersionsAPI.activate.bind(undefined, mPropertyBag),
				new Error("The application ID could not be determined"),
				"then an Error is thrown"
			);
		});

		QUnit.test("when a control and a layer were provided and the request returns a list of versions", function(assert) {
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				control: new Control(),
				title: "new Title"
			};
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns("com.sap.app");
			var aReturnedVersions = [];
			sandbox.stub(Versions, "activate").resolves(aReturnedVersions);

			return VersionsAPI.activate(mPropertyBag)
			.then(function(oResult) {
				assert.equal(oResult, aReturnedVersions, "then the returned version list is passed");
			});
		});
	});

	QUnit.module("Given VersionsAPI.discardDraft is called", {
		beforeEach() {
			this.oAppComponent = {
				getManifest() {
					return {};
				},
				getManifestObject() {},
				getId() {
					return "sComponentId";
				},
				getComponentData() {
					return {
						startupParameters: ["sap-app-id"]
					};
				}
			};
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when no control is provided", function(assert) {
			var mPropertyBag = {
				layer: Layer.CUSTOMER
			};

			return VersionsAPI.discardDraft(mPropertyBag).catch(function(sErrorMessage) {
				assert.equal(sErrorMessage, "No control was provided", "then an Error is thrown");
			});
		});
		QUnit.test("when no layer is provided", function(assert) {
			var mPropertyBag = {
				control: new Control()
			};

			return VersionsAPI.discardDraft(mPropertyBag).catch(function(sErrorMessage) {
				assert.equal(sErrorMessage, "No layer was provided", "then an Error is thrown");
			});
		});

		QUnit.test("when a control and a layer were provided, but no app ID could be determined", function(assert) {
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				control: new Control()
			};

			sandbox.stub(ManifestUtils, "getFlexReferenceForControl");

			assert.throws(
				VersionsAPI.discardDraft.bind(undefined, mPropertyBag),
				new Error("The application ID could not be determined"),
				"then an Error is thrown"
			);
		});

		QUnit.test("when a control, a layer and a flag to update the state were provided and the request returns a list of versions", function(assert) {
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				control: new Control()
			};

			var sReference = "com.sap.app";
			sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns("com.sap.app");
			var oClearStub = sandbox.stub(FlexState, "clearState");
			var oDiscardStub = sandbox.stub(Versions, "discardDraft").resolves({backendChangesDiscarded: true, dirtyChangesDiscarded: true});
			sandbox.stub(ContextBasedAdaptationsAPI, "hasAdaptationsModel").returns(true);
			var sDisplayedAdaptationId = "id_5678";
			var oAdaptationsRefreshStub = sandbox.stub(ContextBasedAdaptationsAPI, "refreshAdaptationModel").resolves(sDisplayedAdaptationId);
			return VersionsAPI.discardDraft(mPropertyBag)
			.then(function(oDiscardInfo) {
				assert.equal(oClearStub.calledOnce, true, "then the FlexState was cleared");
				assert.equal(oAdaptationsRefreshStub.calledOnce, true, "then the Adaptation Model was refreshed");
				const oInfoSession = FlexInfoSession.getByReference(sReference);
				assert.strictEqual(oInfoSession.adaptationId, sDisplayedAdaptationId, "then the FlexState gets the correct adaptationId");
				assert.equal(oDiscardInfo.backendChangesDiscarded, true, "then the discard outcome was returned");
				assert.equal(oDiscardInfo.dirtyChangesDiscarded, true, "then the discard outcome was returned");
				var oCallingPropertyBag = oDiscardStub.getCall(0).args[0];
				assert.equal(oCallingPropertyBag.reference, sReference, "the reference was passed");
				assert.equal(oCallingPropertyBag.layer, mPropertyBag.layer, "the layer was passed");
			});
		});

		QUnit.test("when a AppComponent was found", function(assert) {
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				control: new Control()
			};

			var sReference = "com.sap.app";
			sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns(sReference);
			var oClearStub = sandbox.stub(FlexState, "clearState");
			var oDiscardStub = sandbox.stub(Versions, "discardDraft").resolves({backendChangesDiscarded: true, dirtyChangesDiscarded: true});
			sandbox.stub(ContextBasedAdaptationsAPI, "hasAdaptationsModel").returns(true);
			var sDisplayedAdaptationId = "id_5678";
			var oAdaptationsDiscardStub = sandbox.stub(ContextBasedAdaptationsAPI, "refreshAdaptationModel").resolves(sDisplayedAdaptationId);
			return VersionsAPI.discardDraft(mPropertyBag)
			.then(function(oDiscardInfo) {
				assert.equal(oAdaptationsDiscardStub.calledOnce, true, "then the Adaptation Model was refreshed");
				assert.equal(oClearStub.calledOnce, true, "then the FlexState was cleared and initialized");
				const oInfoSession = FlexInfoSession.getByReference(sReference);
				assert.strictEqual(oInfoSession.adaptationId, sDisplayedAdaptationId, "then the FlexState gets the correct adaptationId");
				assert.equal(oDiscardInfo.backendChangesDiscarded, true, "then the discard outcome was returned");
				assert.equal(oDiscardInfo.dirtyChangesDiscarded, true, "then the discard outcome was returned");
				assert.deepEqual(oDiscardStub.getCall(0).args[0].reference, sReference, "the reference was passed");
				assert.deepEqual(oDiscardStub.getCall(0).args[0].layer, Layer.CUSTOMER, "the layer was passed");
			});
		});
	});

	QUnit.module("Given VersionsAPI.publish is called", {
		beforeEach() {
			this.oAppComponent = {
				getManifest() {
					return {};
				},
				getManifestObject() {
					return {};
				},
				getId() {
					return "sComponentId";
				},
				getComponentData() {
					return {
						startupParameters: ["sap-app-id"]
					};
				}
			};
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when no selector is provided", function(assert) {
			var mPropertyBag = {
				layer: Layer.CUSTOMER
			};

			return VersionsAPI.publish(mPropertyBag).catch(function(sErrorMessage) {
				assert.equal(sErrorMessage, "No selector was provided", "then an Error is thrown");
			});
		});
		QUnit.test("when no layer is provided", function(assert) {
			var mPropertyBag = {
				selector: new Control()
			};

			return VersionsAPI.publish(mPropertyBag).catch(function(sErrorMessage) {
				assert.equal(sErrorMessage, "No layer was provided", "then an Error is thrown");
			});
		});
		QUnit.test("when no version is provided", function(assert) {
			var mPropertyBag = {
				selector: new Control(),
				layer: "CUSTOMER"
			};

			return VersionsAPI.publish(mPropertyBag).catch(function(sErrorMessage) {
				assert.equal(sErrorMessage, "No version was provided", "then an Error is thrown");
			});
		});
		QUnit.test("when a selector, a layer amd a version were provided and the reference can be determined", function(assert) {
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				selector: new Control(),
				version: "abc"
			};

			var sReference = "com.sap.app";
			sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns(sReference);
			var oPublishStub = sandbox.stub(Versions, "publish").resolves("Success");
			return VersionsAPI.publish(mPropertyBag)
			.then(function(sMessage) {
				assert.equal(sMessage, "Success", "a message was returned");
				assert.deepEqual(oPublishStub.getCall(0).args[0].reference, sReference, "the reference was passed");
				assert.deepEqual(oPublishStub.getCall(0).args[0].version, "abc", "the version was passed");
			});
		});
	});
});
