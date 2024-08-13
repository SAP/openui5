/* global QUnit */

sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/initial/api/Version",
	"sap/ui/fl/initial/_internal/FlexConfiguration",
	"sap/ui/fl/initial/_internal/FlexInfoSession",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/write/_internal/Storage",
	"sap/ui/fl/write/_internal/Versions",
	"sap/ui/fl/write/_internal/connectors/KeyUserConnector",
	"sap/ui/fl/write/_internal/connectors/LrepConnector",
	"sap/ui/fl/write/api/VersionsAPI",
	"sap/ui/fl/write/api/FeaturesAPI",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/BindingMode",
	"sap/ui/thirdparty/sinon-4"
], function(
	Control,
	ManifestUtils,
	Version,
	FlexConfiguration,
	FlexInfoSession,
	Settings,
	Storage,
	Versions,
	KeyUserConnector,
	LrepConnector,
	VersionsAPI,
	FeaturesAPI,
	Layer,
	Utils,
	JSONModel,
	BindingMode,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	function setVersioningEnabled(oVersioning) {
		sandbox.stub(Settings, "getInstance").resolves({
			isVersioningEnabled(sLayer) {
				return oVersioning[sLayer];
			}
		});
	}

	function stubStorageVersionsLoad(aReturnedVersions) {
		sandbox.stub(Storage.versions, "load").resolves(aReturnedVersions);
	}

	QUnit.module("Initialization", {
		beforeEach() {
			this.aReturnedVersions = [];
			this.oStorageLoadVersionsStub = sandbox.stub(Storage.versions, "load").resolves(this.aReturnedVersions);
		},
		afterEach() {
			Versions.clearInstances();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("Given Versions.initialize is called and versioning is NOT enabled", function(assert) {
			setVersioningEnabled({CUSTOMER: false});

			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				reference: "com.sap.app"
			};

			return Versions.initialize(mPropertyBag).then(function(oResponse) {
				assert.equal(this.oStorageLoadVersionsStub.callCount, 0, "then no request for versions was sent");
				assert.ok(oResponse instanceof JSONModel, "a model was returned");
				assert.equal(oResponse.getDefaultBindingMode(), BindingMode.OneWay, "with its default binding set to 'OneWay'");
				var oData = oResponse.getData();
				assert.equal(oData.versioningEnabled, false, "with a versionsEnabled flag set to false");
				assert.deepEqual(oData.versions, [], ", an empty versions list");
				assert.equal(oData.backendDraft, false, ", a backendDraft flag set to false");
				assert.equal(oData.dirtyChanges, false, ", a dirty changes flag set to false");
				assert.equal(oData.draftAvailable, false, ", a draftAvailable flag set to false");
				assert.equal(oData.activateEnabled, false, ", a activateEnabled flag set to false");
				assert.equal(oData.activeVersion, Version.Number.Original, ", a activeVersion property set to the original version");
				assert.equal(oData.displayedVersion, Version.Number.Original, ", a version property set to the original version");
				assert.equal(oData.draftFilenames.length, 0, "empty draft filesnames");
				assert.equal(oData.publishVersionEnabled, false, "publish version is not enabled");
			}.bind(this));
		});

		QUnit.test("Given Versions.initialize is called", function(assert) {
			var sReference = "com.sap.app";
			var sLayer = Layer.CUSTOMER;

			var oVersioningEnabled = {};
			oVersioningEnabled[sLayer] = true;
			setVersioningEnabled(oVersioningEnabled);

			var mPropertyBag = {
				layer: sLayer,
				reference: sReference
			};

			return Versions.initialize(mPropertyBag).then(function(oResponse) {
				assert.equal(this.oStorageLoadVersionsStub.callCount, 1, "then a request was sent");
				var aCallArguments = this.oStorageLoadVersionsStub.getCall(0).args[0];
				assert.equal(aCallArguments.reference, sReference, "the reference was passed");
				assert.equal(aCallArguments.layer, sLayer, "the layer was passed");
				assert.equal(aCallArguments.limit, 10, "and the limit was passed");
				assert.ok(oResponse instanceof JSONModel, "a model was returned");
				assert.strictEqual(
					oResponse.getProperty("/versions"), this.aReturnedVersions,
					"and the versions list is returned in the model data"
				);
			}.bind(this));
		});

		QUnit.test("Given Versions.initialize is called multiple times for the same reference and layer", function(assert) {
			setVersioningEnabled({CUSTOMER: true});

			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				reference: "com.sap.app"
			};

			return Versions.initialize(mPropertyBag).then(function(oResponse) {
				assert.strictEqual(this.oStorageLoadVersionsStub.callCount, 1, "then a request was sent");
				assert.ok(oResponse instanceof JSONModel, "a model was returned");
				assert.strictEqual(
					oResponse.getProperty("/versions"), this.aReturnedVersions,
					"and the versions list is returned in the model data"
				);
				return Versions.initialize(mPropertyBag);
			}.bind(this)).then(function(oResponse) {
				assert.strictEqual(this.oStorageLoadVersionsStub.callCount, 1, "no further request is send");
				assert.ok(oResponse instanceof JSONModel, "a model was returned");
				assert.strictEqual(
					oResponse.getProperty("/versions"), this.aReturnedVersions,
					"and the versions list is returned in the model data"
				);
			}.bind(this));
		});

		QUnit.test("Given Versions.initialize is called multiple times for different references", function(assert) {
			setVersioningEnabled({CUSTOMER: true});

			var mPropertyBag1 = {
				layer: Layer.CUSTOMER,
				reference: "com.sap.app"
			};

			var mPropertyBag2 = {
				layer: Layer.CUSTOMER,
				reference: "com.sap.app2"
			};

			var aReturnedVersions = [];
			sandbox.stub(KeyUserConnector.versions, "load").resolves(aReturnedVersions);

			return Versions.initialize(mPropertyBag1).then(function(oResponse) {
				assert.strictEqual(this.oStorageLoadVersionsStub.callCount, 1, "then a request was sent");
				assert.ok(oResponse instanceof JSONModel, "a model was returned");
				assert.strictEqual(
					oResponse.getProperty("/versions"), this.aReturnedVersions,
					"and the versions list is returned in the model data"
				);
				return Versions.initialize(mPropertyBag2);
			}.bind(this)).then(function(oResponse) {
				assert.strictEqual(this.oStorageLoadVersionsStub.callCount, 2, "a further request is sent");
				assert.ok(oResponse instanceof JSONModel, "a model was returned");
				assert.strictEqual(
					oResponse.getProperty("/versions"), this.aReturnedVersions,
					"and the versions list is returned in the model data"
				);
			}.bind(this));
		});

		QUnit.test("Given Versions.initialize is called multiple times for different layers where only one is versioning enabled", function(assert) {
			setVersioningEnabled({CUSTOMER: true, USER: false});
			var mPropertyBag1 = {
				layer: Layer.CUSTOMER,
				reference: "com.sap.app"
			};

			var mPropertyBag2 = {
				layer: Layer.USER,
				reference: "com.sap.app"
			};

			return Versions.initialize(mPropertyBag1).then(function() {
				assert.equal(this.oStorageLoadVersionsStub.callCount, 1, "then a request was sent");
				return Versions.initialize(mPropertyBag2);
			}.bind(this)).then(function() {
				assert.equal(this.oStorageLoadVersionsStub.callCount, 1, "a further request is sent");
			}.bind(this));
		});

		QUnit.test("Given Versions.initialize is called multiple times for different layers where all are versioning enabled", function(assert) {
			setVersioningEnabled({CUSTOMER: true, USER: true});
			var mPropertyBag1 = {
				layer: Layer.CUSTOMER,
				reference: "com.sap.app"
			};

			var mPropertyBag2 = {
				layer: Layer.USER,
				reference: "com.sap.app"
			};

			return Versions.initialize(mPropertyBag1).then(function() {
				assert.equal(this.oStorageLoadVersionsStub.callCount, 1, "then a request was sent");
				return Versions.initialize(mPropertyBag2);
			}.bind(this)).then(function() {
				assert.equal(this.oStorageLoadVersionsStub.callCount, 2, "a further request is sent");
			}.bind(this));
		});
	});

	QUnit.module("Calling the Storage: Given Versions.initialize is called", {
		beforeEach() {
			setVersioningEnabled({CUSTOMER: true});
			sandbox.stub(FlexConfiguration, "getFlexibilityServices").returns([
				{connector: "KeyUserConnector", layers: [Layer.CUSTOMER], url: "/flexKeyUser"}
			]);
			this.oAppComponent = {
				getManifest() {
					return {};
				},
				getId() {
					return this.sComponentId;
				}
			};
			this.sReference = "com.sap.app";
		},
		afterEach() {
			FlexInfoSession.removeByReference(this.sReference);
			Versions.clearInstances();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("and a connector is configured which returns a list of versions", function(assert) {
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				reference: this.sReference
			};
			var aReturnedVersions = [];
			sandbox.stub(KeyUserConnector.versions, "load").resolves(aReturnedVersions);

			return Versions.initialize(mPropertyBag).then(function(oResponse) {
				assert.deepEqual(oResponse.getProperty("/versions"), aReturnedVersions, "then the versions list is returned");
			});
		});

		QUnit.test("and a connector is configured which returns a list of versions with entries", function(assert) {
			var sActiveVersion = "2";

			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				reference: this.sReference
			};

			var oFirstVersion = {
				activatedBy: "qunit",
				activatedAt: "a long while ago",
				version: "1",
				isPublished: false
			};

			var oSecondVersion = {
				activatedBy: "qunit",
				activatedAt: "a while ago",
				version: sActiveVersion,
				isPublished: false
			};

			var aReturnedVersions = [
				oSecondVersion,
				oFirstVersion
			];

			sandbox.stub(KeyUserConnector.versions, "load").resolves(aReturnedVersions);

			return Versions.initialize(mPropertyBag).then(function(oResponse) {
				var aVersions = oResponse.getProperty("/versions");
				assert.deepEqual(aVersions, aReturnedVersions, "then the versions list is returned");
				assert.deepEqual(aVersions[0].type, Version.Type.Active, "the first version on the list is the 'active' one");
				assert.deepEqual(aVersions[1].type, Version.Type.Inactive, "the second version on the list  is the 'inactive' one");
				assert.equal(oResponse.getProperty("/activeVersion"), sActiveVersion, "and the active version was determined correct");
				assert.equal(oResponse.getProperty("/publishVersionEnabled"), true, "and the publish button is enabled");
			});
		});

		QUnit.test("with setDirtyChange(false) and a connector is configured which returns a list of versions with entries while an older version is displayed", function(assert) {
			var sActiveVersion = "2";
			// set displayedVersion to draft
			FlexInfoSession.setByReference({version: Version.Number.Draft}, this.sReference);
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				reference: this.sReference,
				control: new Control(),
				version: "1"
			};

			var oFirstVersion = {
				activatedBy: "qunit",
				activatedAt: "a long while ago",
				version: "1",
				isPublished: true
			};

			var oSecondVersion = {
				activatedBy: "qunit",
				activatedAt: "a while ago",
				version: sActiveVersion,
				isPublished: false
			};

			var aReturnedVersions = [
				oSecondVersion,
				oFirstVersion
			];

			sandbox.stub(KeyUserConnector.versions, "load").resolves(aReturnedVersions);
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			sandbox.stub(FeaturesAPI, "isPublishAvailable").returns(true);
			sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns("com.sap.app");

			return Versions.initialize(mPropertyBag)
			.then(function(oModel) {
				assert.strictEqual(
					oModel.getProperty("/displayedVersion"), Version.Number.Draft,
					"when initial version model with flex info session displayedVersion is set correct"
				);
			})
			// switch to another version
			.then(VersionsAPI.loadVersionForApplication.bind(this, mPropertyBag))
			.then(function() {
				var oVersionsModel = Versions.getVersionsModel(mPropertyBag);
				oVersionsModel.setDirtyChanges(false);
			})
			.then(function() {
				var oData = Versions.getVersionsModel(mPropertyBag).getData();
				var aVersions = oData.versions;
				assert.equal(aVersions.length, 2, "then versions has two entries");
				assert.deepEqual(aVersions[0], oSecondVersion, "with the second");
				assert.equal(aVersions[1], oFirstVersion, "and the first version");
				assert.equal(oData.backendDraft, false, "the backendDraft flag is false");
				assert.equal(oData.dirtyChanges, false, "the dirtyChanges flag is set to false");
				assert.equal(oData.draftAvailable, false, "as well as draftAvailable false");
				assert.equal(oData.activateEnabled, true, "as well as activateEnabled true");
				assert.equal(oData.displayedVersion, "1", "the displayedVersion set 1");
				assert.equal(oData.activeVersion, sActiveVersion, "and the activeVersion set to 2");
				assert.equal(oData.publishVersionEnabled, false, "and the publish button is not enabled due to current display already published version");
			});
		});

		QUnit.test("and a connector is configured which returns a list of versions with entries and a draft", function(assert) {
			var sActiveVersion = "2";

			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				reference: this.sReference
			};

			var oDraftVersion = {
				version: Version.Number.Draft,
				filenames: ["filename1", "filename2"]
			};

			var oFirstVersion = {
				activatedBy: "qunit",
				activatedAt: "a long while ago",
				version: "1",
				isPublished: false
			};

			var oSecondVersion = {
				activatedBy: "qunit",
				activatedAt: "a while ago",
				version: sActiveVersion,
				isPublished: false
			};

			var aReturnedVersions = [
				oDraftVersion,
				oSecondVersion,
				oFirstVersion
			];

			sandbox.stub(KeyUserConnector.versions, "load").resolves(aReturnedVersions);

			return Versions.initialize(mPropertyBag).then(function(oResponse) {
				var aVersions = oResponse.getProperty("/versions");
				assert.deepEqual(aVersions, aReturnedVersions, "then the versions list is returned");
				assert.deepEqual(aVersions[0].type, Version.Type.Draft, "the first version is the 'draft' one");
				assert.deepEqual(aVersions[1].type, Version.Type.Active, "the second version is the 'active' one");
				assert.deepEqual(aVersions[2].type, Version.Type.Inactive, "the third version is the 'inactive' one");
				assert.equal(oResponse.getProperty("/displayedVersion"), Version.Number.Draft, ", a displayedVersion property set to the draft version");
				assert.equal(oResponse.getProperty("/activeVersion"), sActiveVersion, "and the active version was determined correct");
				assert.equal(oResponse.getProperty("/publishVersionEnabled"), false, "and the publish button is not enabled due to current display Draft");
				var aDraftFilenames = oResponse.getProperty("/draftFilenames");
				assert.equal(aDraftFilenames.length, 2, "draft filenames containt 2 entries");
				assert.equal(aDraftFilenames[0], "filename1", "first draft filename with 'filename1'");
				assert.equal(aDraftFilenames[1], "filename2", "sec draft filename with 'filename2'");
			});
		});
	});

	QUnit.module("Calling the Storage: Given Versions.activate is called", {
		before() {
			this.oAppComponent = {
				getManifest() {
					return {};
				},
				getId() {
					return this.sComponentId;
				}
			};
			this.sReference = "com.sap.app";
		},
		beforeEach() {
			setVersioningEnabled({CUSTOMER: true});
			sandbox.stub(FlexConfiguration, "getFlexibilityServices").returns([
				{connector: "KeyUserConnector", layers: [Layer.CUSTOMER], url: "/flexKeyUser"}
			]);
		},
		afterEach() {
			FlexInfoSession.removeByReference(this.sReference);
			Versions.clearInstances();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("and a connector is configured which returns a list of versions while a draft exists", function(assert) {
			var sActiveVersion = 2;
			// set displayedVersion to draft
			FlexInfoSession.setByReference({version: Version.Number.Draft}, this.sReference);
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				reference: this.sReference,
				appComponent: this.oAppComponent
			};

			var oFirstVersion = {
				activatedBy: "qunit",
				activatedAt: "a long while ago",
				version: "1",
				isPublished: true
			};

			var oSecondVersion = {
				activatedBy: "qunit",
				activatedAt: "a while ago",
				version: "2",
				isPublished: true
			};

			var aReturnedVersions = [
				{version: Version.Number.Draft},
				oSecondVersion,
				oFirstVersion
			];

			stubStorageVersionsLoad(aReturnedVersions);

			var oActivatedVersion = {
				activatedBy: "qunit",
				activatedAt: "just now",
				version: sActiveVersion
			};
			sandbox.stub(KeyUserConnector.versions, "activate").resolves(oActivatedVersion);

			var oExpectedActivatedVersion = {
				activatedBy: "qunit",
				activatedAt: "just now",
				version: sActiveVersion,
				isPublished: false,
				type: Version.Type.Active
			};

			return Versions.initialize(mPropertyBag)
			.then(Versions.activate.bind(undefined, mPropertyBag))
			.then(Versions.getVersionsModel.bind(Versions, mPropertyBag))
			.then(function(oResponse) {
				var aVersions = oResponse.getProperty("/versions");
				assert.equal(aVersions.length, 3, "with three versions");
				assert.deepEqual(aVersions[0], oExpectedActivatedVersion, "and the newly activated is the first");
				assert.deepEqual(aVersions[1], oSecondVersion, "where the old version is the second");
				assert.deepEqual(aVersions[2], oFirstVersion, "where the older version is the third");
				assert.equal(oResponse.getProperty("/backendDraft"), false, "backendDraft property was set to false");
				assert.equal(oResponse.getProperty("/displayedVersion"), sActiveVersion, ", a displayedVersion property set to the active version");
				assert.equal(oResponse.getProperty("/activeVersion"), sActiveVersion, ", the active version was determined correct");
				assert.equal(oResponse.getProperty("/persistedVersion"), sActiveVersion, "and the persisted version was determined correct");
				assert.equal(oResponse.getProperty("/publishVersionEnabled"), true, "after activate a new version can be published");
				assert.equal(oResponse.getProperty("/draftFilenames").length, 0, "and draft file name is empty");
			});
		});

		QUnit.test("to reactivate an old version and a connector is configured which returns a list of versions while a draft does NOT exists", function(assert) {
			var sActiveVersion = "3";
			// set displayedVersion to 1
			FlexInfoSession.setByReference({version: "1"}, this.sReference);
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				reference: this.sReference,
				appComponent: this.oAppComponent
			};

			var oFirstVersion = {
				activatedBy: "qunit",
				activatedAt: "a while ago",
				version: "1"
			};

			var oSecondVersion = {
				activatedBy: "qunit",
				activatedAt: "a while ago",
				version: "2"
			};

			var aReturnedVersions = [
				oSecondVersion,
				oFirstVersion
			];

			stubStorageVersionsLoad(aReturnedVersions);

			var oActivatedVersion = {
				activatedBy: "qunit",
				activatedAt: "just now",
				version: sActiveVersion
			};
			sandbox.stub(KeyUserConnector.versions, "activate").resolves(oActivatedVersion);

			return Versions.initialize(mPropertyBag)
			.then(Versions.activate.bind(undefined, mPropertyBag))
			.then(Versions.getVersionsModel.bind(Versions, mPropertyBag))
			.then(function(oResponse) {
				var aVersions = oResponse.getProperty("/versions");
				assert.equal(aVersions.length, 3, "with three versions");
				assert.equal(aVersions[0], oActivatedVersion, "and the newly activated is the first");
				assert.equal(aVersions[1], oSecondVersion, "where the old version is the second");
				assert.equal(aVersions[2], oFirstVersion, "where the older version is the third");
				assert.equal(oResponse.getProperty("/backendDraft"), false, "backendDraft property was set to false");
				assert.equal(oResponse.getProperty("/publishVersionEnabled"), true, "publishVersionEnabled property was set to true");
				assert.equal(oResponse.getProperty("/displayedVersion"), sActiveVersion, ", a displayedVersion property set to the active version");
				assert.equal(oResponse.getProperty("/activeVersion"), sActiveVersion, "and the active version was determined correct");
				assert.equal(oResponse.getProperty("/publishVersionEnabled"), true, "after activate a new version can be published");
				assert.equal(oResponse.getProperty("/draftFilenames").length, 0, "and draft file name is empty");
			});
		});

		QUnit.test("and a connector is configured which returns a list of versions while a draft does NOT exists", function(assert) {
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				reference: this.sReference,
				appComponent: this.oAppComponent,
				displayedVersion: "1"
			};

			var oFirstVersion = {
				activatedBy: "qunit",
				activatedAt: "a while ago",
				version: "1"
			};

			var aReturnedVersions = [
				oFirstVersion
			];

			stubStorageVersionsLoad(aReturnedVersions);

			var oActivatedVersion = {
				activatedBy: "qunit",
				activatedAt: "just now",
				version: "2"
			};
			sandbox.stub(KeyUserConnector.versions, "activate").resolves(oActivatedVersion);

			return Versions.initialize(mPropertyBag)
			.then(Versions.activate.bind(undefined, mPropertyBag))
			.catch(function(sErrorMessage) {
				assert.equal(sErrorMessage, "Version is already active", "then the promise is rejected with an error message");
			});
		});

		QUnit.test("and a connector is configured which returns a list of versions while dirty changes exists", function(assert) {
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				reference: this.sReference,
				appComponent: this.oAppComponent
			};

			var oFirstVersion = {
				activatedBy: "qunit",
				activatedAt: "a while ago",
				version: "1"
			};

			var oDraft = {
				version: Version.Number.Draft,
				type: Version.Type.Draft,
				filenames: [],
				isPublished: false
			};

			var aReturnedVersions = [
				oFirstVersion
			];

			stubStorageVersionsLoad(aReturnedVersions);

			var oActivatedVersion = {
				activatedBy: "qunit",
				activatedAt: "just now",
				version: "2"
			};
			sandbox.stub(KeyUserConnector.versions, "activate").resolves(oActivatedVersion);

			return Versions.initialize(mPropertyBag)
			.then(function(oVersionsModel) {
				oVersionsModel.setDirtyChanges(true);
			})
			.then(function() {
				var oData = Versions.getVersionsModel(mPropertyBag).getData();
				var aVersions = oData.versions;
				assert.equal(Array.isArray(aVersions), true, "then the draft is added");
				assert.equal(aVersions.length, 2, "summing up to two versions");
				assert.deepEqual(aVersions[0], oDraft, "and first is the draft");
				assert.equal(aVersions[1], oFirstVersion, "where the older version is the second");
				assert.equal(oData.backendDraft, false, "the backendDraft flag is false");
				assert.equal(oData.dirtyChanges, true, "the dirtyChanges flag is set to true");
				assert.equal(oData.draftAvailable, true, "as well as draftAvailable true");
				assert.equal(oData.activateEnabled, true, "as well as activateEnabled true");
				assert.equal(oData.displayedVersion, Version.Number.Draft, "as well as the displayedVersion is set to 'Draft'");
				assert.equal(oData.draftFilenames.length, 0, "and draft file name is empty");
			})
			.then(function() {
				return assert.throws(Versions.activate(mPropertyBag), "the save is rejected");
			});
		});
	});

	QUnit.module("Calling the Storage: Given Versions.discardDraft is called", {
		before() {
			this.reference = "com.sap.app";
			this.sComponentId = "sComponentId";
			this.oAppComponent = {
				getManifest() {
					return {};
				},
				getId() {
					return this.sComponentId;
				}
			};
		},
		beforeEach() {
			setVersioningEnabled({CUSTOMER: true});
			sandbox.stub(FlexConfiguration, "getFlexibilityServices").returns([
				{connector: "KeyUserConnector", layers: [Layer.CUSTOMER], url: "/flexKeyUser"}
			]);
		},
		afterEach() {
			Versions.clearInstances();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("and a connector is configured and no backendDraft exists while discard is called with only dirty changes", function(assert) {
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				reference: this.reference,
				appComponent: this.oAppComponent
			};

			var oFirstVersion = {
				activatedBy: "qunit",
				activatedAt: "a while ago",
				version: "1"
			};

			var oDraft = {
				version: Version.Number.Draft,
				type: Version.Type.Draft,
				filenames: [],
				isPublished: false
			};

			var aReturnedBackendVersions = [
				oFirstVersion
			];

			sandbox.stub(Storage.versions, "load").resolves(aReturnedBackendVersions);
			var oDiscardStub = sandbox.stub(KeyUserConnector.versions, "discardDraft").resolves();

			return Versions.initialize(mPropertyBag)
			.then(function(oVersionsModel) {
				oVersionsModel.setDirtyChanges(true);
			})
			.then(function() {
				var oData = Versions.getVersionsModel(mPropertyBag).getData();
				var aVersions = oData.versions;
				assert.equal(Array.isArray(aVersions), true, "then the draft is added");
				assert.equal(aVersions.length, 2, "summing up to two versions");
				assert.deepEqual(aVersions[0], oDraft, "and first is the draft");
				assert.equal(aVersions[1], oFirstVersion, "where the older version is the second");
				assert.equal(oData.backendDraft, false, "the backendDraft flag is false");
				assert.equal(oData.dirtyChanges, true, "the dirtyChanges flag is set to true");
				assert.equal(oData.draftAvailable, true, "as well as draftAvailable true");
				assert.equal(oData.activateEnabled, true, "as well as activateEnabled true");
				assert.equal(oData.displayedVersion, Version.Number.Draft, ", a displayedVersion property set to the draft version");
			})
			.then(Versions.discardDraft.bind(undefined, mPropertyBag))
			.then(function() {
				assert.equal(oDiscardStub.callCount, 0, "no discardDraft was called");
			})
			.then(Versions.getVersionsModel.bind(undefined, mPropertyBag))
			.then(function(oModel) {
				var oData = oModel.getData();
				var aVersions = oData.versions;
				assert.equal(aVersions.length, 1, "and a getting the versions anew will return one version");
				assert.equal(oDiscardStub.callCount, 0, "no discardDraft was called");
				assert.equal(aVersions[0], oFirstVersion, "which is the activated version");
				assert.equal(oData.backendDraft, false, "the backendDraft flag is still false");
				assert.equal(oData.dirtyChanges, false, "the dirtyChanges flag is set to false");
				assert.equal(oData.draftAvailable, false, "as well as draftAvailable false");
				assert.equal(oData.activateEnabled, false, "as well as activateEnabled false");
				assert.equal(oData.displayedVersion, 1, ", a displayedVersion property set to the active version");
			});
		});

		QUnit.test("and a connector is configured and a draft exists while discard is called with only backend changes", function(assert) {
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				reference: this.reference,
				appComponent: this.oAppComponent
			};
			var sActiveVersion = "1";
			var oFirstVersion = {
				activatedBy: "qunit",
				activatedAt: "a while ago",
				version: sActiveVersion
			};

			var aReturnedVersions = [
				{version: Version.Number.Draft},
				oFirstVersion
			];

			stubStorageVersionsLoad(aReturnedVersions);
			var oDiscardStub = sandbox.stub(KeyUserConnector.versions, "discardDraft").resolves();

			return Versions.initialize(mPropertyBag)
			.then(function(oVersionsModel) {
				this.oVersionsModel = oVersionsModel;
			}.bind(this))
			.then(Versions.discardDraft.bind(undefined, mPropertyBag))
			.then(Versions.getVersionsModel.bind(undefined, mPropertyBag))
			.then(function(oModel) {
				var oData = oModel.getData();
				var aVersions = oData.versions;
				assert.equal(aVersions.length, 1, "and a getting the versions a new will return one version");
				assert.equal(oDiscardStub.callCount, 1, "discardDraft was called once");
				assert.equal(aVersions[0], oFirstVersion, "which is the activated version");
				assert.equal(oData.backendDraft, false, "the backendDraft flag is still false");
				assert.equal(oData.dirtyChanges, false, "the dirtyChanges flag is set to false");
				assert.equal(oData.draftAvailable, false, "as well as draftAvailable false");
				assert.equal(oData.activateEnabled, false, "as well as activateEnabled false");
				assert.equal(this.oVersionsModel.getProperty("/displayedVersion"), sActiveVersion, ", a displayedVersion property set to the active version");
				assert.equal(this.oVersionsModel.getProperty("/persistedVersion"), sActiveVersion, ", a displayedVersion property set to the active version");
			}.bind(this));
		});

		QUnit.test("and a connector is configured and a draft does NOT exists while discard is called", function(assert) {
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				reference: this.reference,
				appComponent: this.oAppComponent
			};

			var oFirstVersion = {
				activatedBy: "qunit",
				activatedAt: "a while ago",
				version: "1"
			};

			var aReturnedVersions = [
				oFirstVersion
			];

			stubStorageVersionsLoad(aReturnedVersions);

			return Versions.initialize(mPropertyBag)
			.then(function(oVersionsModel) {
				this.oVersionsModel = oVersionsModel;
			}.bind(this))
			.then(Versions.discardDraft.bind(undefined, mPropertyBag))
			.then(function(oDiscardInfo) {
				assert.equal(oDiscardInfo.backendChangesDiscarded, false, "no discarding took place");
				assert.equal(this.oVersionsModel.getProperty("/displayedVersion"), 1, ", a displayedVersion property set to the active version");
			}.bind(this));
		});

		QUnit.test("and a connector is configured and a draft does NOT exists but dirty changes exists " +
			"while discard is called", function(assert) {
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				reference: this.reference,
				appComponent: this.oAppComponent
			};

			var oFirstVersion = {
				activatedBy: "qunit",
				activatedAt: "a while ago",
				version: "1"
			};

			var aReturnedVersions = [
				oFirstVersion
			];

			stubStorageVersionsLoad(aReturnedVersions);

			return Versions.initialize(mPropertyBag)
			.then(function(oVersionsModel) {
				this.oVersionsModel = oVersionsModel;
			}.bind(this))
			.then(Versions.discardDraft.bind(undefined, mPropertyBag))
			.then(function() {
				assert.equal(this.oVersionsModel.getProperty("/displayedVersion"), 1, ", a displayedVersion property set to the active version");
			}.bind(this));
		});

		QUnit.test("and a connector is configured and a backendDraft exists and dirty changes exists " +
			"while discard is called", function(assert) {
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				reference: this.reference,
				appComponent: this.oAppComponent
			};

			var oFirstVersion = {
				activatedBy: "qunit",
				activatedAt: "a while ago",
				version: "1"
			};

			var oDraft = {
				activatedBy: "",
				activatedAt: "",
				version: Version.Number.Draft
			};

			var aReturnedVersions = [
				oDraft,
				oFirstVersion
			];

			stubStorageVersionsLoad(aReturnedVersions);
			var oDiscardStub = sandbox.stub(KeyUserConnector.versions, "discardDraft").resolves();

			return Versions.initialize(mPropertyBag)
			.then(function(oVersionsModel) {
				this.oVersionsModel = oVersionsModel;
			}.bind(this))
			.then(Versions.discardDraft.bind(undefined, mPropertyBag))
			.then(function(oDiscardInfo) {
				assert.equal(oDiscardInfo.backendChangesDiscarded, true, "some discarding took place");
				assert.equal(oDiscardStub.callCount, 1, "discarding the draft was called");
				assert.equal(this.oVersionsModel.getProperty("/displayedVersion"), "1", ", a displayedVersion property set to the active version");
			}.bind(this));
		});
	});

	QUnit.module("Calling the Storage: Given Versions.publish is called", {
		before() {
			this.oAppComponent = {
				getManifest() {
					return {};
				},
				getId() {
					return this.sComponentId;
				}
			};
			this.sReference = "com.sap.app";
		},
		beforeEach() {
			setVersioningEnabled({CUSTOMER: true});
			sandbox.stub(FlexConfiguration, "getFlexibilityServices").returns([
				{connector: "LrepConnector", layers: ["ALL"], url: "/sap/bc/lrep"}
			]);
		},
		afterEach() {
			FlexInfoSession.removeByReference(this.sReference);
			Versions.clearInstances();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("to publish a version", function(assert) {
			// set displayedVersion to 2
			FlexInfoSession.setByReference({version: "2"}, this.sReference);
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				reference: this.sReference,
				appComponent: this.oAppComponent,
				version: "3"
			};

			var oFirstVersion = {
				activatedBy: "qunit",
				activatedAt: "a while ago",
				version: "1",
				isPublished: true
			};

			var oSecondVersion = {
				activatedBy: "qunit",
				activatedAt: "a while ago",
				version: "2",
				isPublished: false
			};

			var oThirdVersion = {
				activatedBy: "qunit",
				activatedAt: "a while ago",
				version: "3",
				isPublished: false
			};

			var oFourthVersion = {
				activatedBy: "qunit",
				activatedAt: "a while ago",
				version: "4",
				isPublished: false
			};

			var aReturnedVersions = [
				oFourthVersion,
				oThirdVersion,
				oSecondVersion,
				oFirstVersion
			];

			stubStorageVersionsLoad(aReturnedVersions);
			sandbox.stub(LrepConnector.versions, "publish").resolves("Success");

			return Versions.initialize(mPropertyBag)
			.then(Versions.publish.bind(undefined, mPropertyBag))
			.then(Versions.getVersionsModel.bind(Versions, mPropertyBag))
			.then(function(oResponse) {
				var aVersions = oResponse.getProperty("/versions");
				assert.equal(aVersions[0].isPublished, false, "the 4. version model is not updated");
				assert.equal(aVersions[1].isPublished, true, "the 3. version model is updated correctly");
				assert.equal(aVersions[2].isPublished, true, "the 2. version model is updated correctly");
				assert.equal(oResponse.getProperty("/publishVersionEnabled"), false, "after publish successfully, the button is disable");
			});
		});
	});

	QUnit.module("Calling the Storage: Given Versions.initialize is called", {
		before() {
			this.aReturnedVersions = [];
			this.oAppComponent = {
				getManifest() {
					return {};
				},
				getId() {
					return this.sComponentId;
				}
			};
		},
		beforeEach() {
			setVersioningEnabled({CUSTOMER: true});
			sandbox.stub(FlexConfiguration, "getFlexibilityServices").returns([
				{connector: "LrepConnector", layers: ["ALL"], url: "/sap/bc/lrep"}
			]);
		},
		afterEach() {
			Versions.clearInstances();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("to trigger onAllChangesSaved without contextBasedAdaptation parameter", function(assert) {
			var done = assert.async();
			var sReference = "com.sap.app";

			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				reference: sReference,
				appComponent: this.oAppComponent,
				version: "3",
				draftFilenames: ["filename1", "filename2"]
			};

			var oDraftVersion = {
				version: Version.Number.Draft,
				filenames: ["old draftfilename"]
			};

			var oFirstVersion = {
				activatedBy: "qunit",
				activatedAt: "a while ago",
				version: "1",
				isPublished: true
			};

			var aReturnedVersions = [
				oDraftVersion,
				oFirstVersion
			];

			stubStorageVersionsLoad(aReturnedVersions);

			return Versions.initialize(mPropertyBag)
			.then(Versions.onAllChangesSaved.bind(Versions, mPropertyBag))
			.then(Versions.getVersionsModel.bind(Versions, mPropertyBag))
			.then(function(oResponse) {
				var aVersions = oResponse.getProperty("/versions");
				var aDraftFilenames = oResponse.getProperty("/draftFilenames");
				assert.deepEqual(aVersions.length, 2, "a new draft is added to the version model");
				assert.deepEqual(aVersions[0].type, "draft", "the latest version type is draft");
				assert.deepEqual(oResponse.getProperty("/versioningEnabled"), true);
				assert.deepEqual(oResponse.getProperty("/dirtyChanges"), true, "dirty changes exits");
				assert.deepEqual(oResponse.getProperty("/backendDraft"), false, "backend draft does not exists");
				assert.equal(aDraftFilenames.length, 3, "add dirty change filenames into draft filename list");
				done();
			});
		});

		QUnit.test("to trigger onAllChangesSaved with contextBasedAdaptation parameter", function(assert) {
			var done = assert.async();
			var sReference = "com.sap.app";

			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				reference: sReference,
				appComponent: this.oAppComponent,
				version: "3",
				contextBasedAdaptation: true
			};

			var oFirstVersion = {
				activatedBy: "qunit",
				activatedAt: "a while ago",
				version: "1",
				isPublished: true
			};

			var aReturnedVersions = [
				oFirstVersion
			];

			stubStorageVersionsLoad(aReturnedVersions);

			return Versions.initialize(mPropertyBag)
			.then(Versions.onAllChangesSaved.bind(Versions, mPropertyBag))
			.then(Versions.getVersionsModel.bind(Versions, mPropertyBag))
			.then(function(oResponse) {
				var aVersions = oResponse.getProperty("/versions");
				assert.deepEqual(aVersions.length, 2, "a new version (draft) is added to the version model");
				assert.deepEqual(aVersions[0].type, "draft", "the latest version type is draft");
				assert.deepEqual(oResponse.getProperty("/versioningEnabled"), true);
				assert.deepEqual(oResponse.getProperty("/dirtyChanges"), true, "dirty changes exits");
				assert.deepEqual(oResponse.getProperty("/backendDraft"), true, "backed draft exists");
				done();
			});
		});
	});

	QUnit.module("Calling the Storage:", {
		before() {
			this.sReference = "com.sap.app";
		},
		beforeEach() {
			sandbox.stub(FlexConfiguration, "getFlexibilityServices").returns([
				{connector: "LrepConnector", layers: ["ALL"], url: "/sap/bc/lrep"}
			]);
			this.oStorageLoadVersionsStub = sandbox.stub(Storage.versions, "load");
		},
		afterEach() {
			Versions.clearInstances();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("Given Versions.updateModelFromBackend is called", function(assert) {
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				reference: this.sReference
			};
			var aOldVersions = [
				{
					version: Version.Number.Draft
				},
				{
					version: "1",
					isPublished: true,
					activatedBy: "qunit",
					activatedAt: "a while ago"
				}
			];
			var oVersionsModel = new JSONModel({
				publishVersionEnabled: false,
				versioningEnabled: true,
				versions: aOldVersions,
				backendDraft: true,
				dirtyChanges: false,
				draftAvailable: true,
				activateEnabled: true,
				activeVersion: "1",
				persistedVersion: "1",
				displayedVersion: "2",
				draftFilenames: ["draftFilename"]
			});
			sandbox.stub(Versions, "hasVersionsModel").returns(true);
			sandbox.stub(Versions, "getVersionsModel").returns(oVersionsModel);
			var aNewVersions = [
				{
					version: "2",
					isPublished: true,
					activatedBy: "qunit",
					activatedAt: "a while ago"
				},
				{
					version: "1",
					isPublished: true,
					activatedBy: "qunit",
					activatedAt: "a while ago"
				}
			];
			this.oStorageLoadVersionsStub.resolves(aNewVersions);

			return Versions.updateModelFromBackend(mPropertyBag).then(function(oVersionModel) {
				var oData = oVersionModel.getData();
				assert.deepEqual(oData.draftFilenames, [], "without draft filenames");
				assert.equal(oData.publishVersionEnabled, false, "publishVersionEnabled is false");
				assert.equal(oData.versioningEnabled, true, "versioningEnabled is true");
				assert.equal(oData.backendDraft, false, "backendDraft is false");
				assert.equal(oData.dirtyChanges, false, "dirtyChanges is false");
				assert.equal(oData.draftAvailable, false, "draftAvailable is false");
				assert.equal(oData.activateEnabled, false, "activateEnabled is false");
				assert.equal(oData.activeVersion, "2", "activeVersion is correct");
				assert.equal(oData.persistedVersion, "2", "persistedVersion is correct");
				assert.equal(oData.displayedVersion, "2", "displayedVersion is correct");
			});
		});

		QUnit.test("Versions.updateModelFromBackend is called without versions model available", function(assert) {
			sandbox.stub(Versions, "hasVersionsModel").returns(false);
			Versions.updateModelFromBackend({});
			assert.strictEqual(this.oStorageLoadVersionsStub.callCount, 0, "the update is not called");
		});

		QUnit.test("Versions.updateModelFromBackend is called with versions model available but versioning not active", function(assert) {
			var oVersionsModel = new JSONModel({
				versioningEnabled: false
			});
			sandbox.stub(Versions, "hasVersionsModel").returns(true);
			sandbox.stub(Versions, "getVersionsModel").returns(oVersionsModel);
			Versions.updateModelFromBackend({});
			assert.strictEqual(this.oStorageLoadVersionsStub.callCount, 0, "the update is not called");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});