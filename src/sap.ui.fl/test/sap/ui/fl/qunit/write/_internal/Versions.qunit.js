/* global QUnit */

sap.ui.define([
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/BindingMode",
	"sap/ui/fl/Layer",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/write/_internal/Versions",
	"sap/ui/fl/write/_internal/Storage",
	"sap/ui/fl/write/_internal/connectors/KeyUserConnector",
	"sap/ui/fl/ChangePersistenceFactory",
	"sap/base/util/UriParameters"
], function(
	sinon,
	JSONModel,
	BindingMode,
	Layer,
	Settings,
	Versions,
	Storage,
	KeyUserConnector,
	ChangePersistenceFactory,
	UriParameters
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	function setVersioningEnabled(oVersioning) {
		sandbox.stub(Settings, "getInstance").resolves({
			isVersioningEnabled: function (sLayer) {
				return oVersioning[sLayer];
			}
		});
	}

	function _prepareResponsesAndStubMethod(sReference, aReturnedVersions, sFunctionName, aDirtyChanges) {
		sandbox.stub(Storage.versions, "load").resolves(aReturnedVersions);
		var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForComponent(sReference);
		sandbox.stub(oChangePersistence, "getDirtyChanges").returns(aDirtyChanges);
		return sandbox.stub(oChangePersistence, sFunctionName).resolves();
	}

	QUnit.module("Internal Caching", {
		beforeEach: function () {
			this.aReturnedVersions = [];
			this.oStorageLoadVersionsStub = sandbox.stub(Storage.versions, "load").resolves(this.aReturnedVersions);
		},
		afterEach: function() {
			Versions.clearInstances();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("Given Versions.initialize is called and versioning is NOT enabled", function (assert) {
			setVersioningEnabled({CUSTOMER: false});

			var mPropertyBag = {
				layer : Layer.CUSTOMER,
				reference : "com.sap.app"
			};

			return Versions.initialize(mPropertyBag).then(function (oResponse) {
				assert.equal(this.oStorageLoadVersionsStub.callCount, 0, "then no request for versions was sent");
				assert.ok(oResponse instanceof JSONModel, "a model was returned");
				assert.equal(oResponse.getDefaultBindingMode(), BindingMode.OneWay, "with its default binding set to 'OneWay'");
				var oData = oResponse.getData();
				assert.equal(oData.versioningEnabled, false, "with a versionsEnabled flag set to false");
				assert.deepEqual(oData.versions, [], ", an empty versions list");
				assert.equal(oData.backendDraft, false, ", a backendDraft flag set to false");
				assert.equal(oData.dirtyChanges, false, ", a dirty changes flag set to false");
				assert.equal(oData.draftAvailable, false, ", a draftAvailable flag set to false");
				assert.equal(oData.switchVersionsActive, false, "and a switchVersionsActive flag set to false as data");
			}.bind(this));
		});

		QUnit.test("Given Versions.initialize is called and switchVersionsActive is set in the url to 'true'", function (assert) {
			setVersioningEnabled({CUSTOMER: false});
			var mPropertyBag = {
				layer : Layer.CUSTOMER,
				reference : "com.sap.app"
			};

			sandbox.stub(UriParameters, "fromQuery").returns({
				get : function () {
					return "true";
				}
			});

			return Versions.initialize(mPropertyBag).then(function (oResponse) {
				var oData = oResponse.getData();
				assert.equal(oData.switchVersionsActive, true, "then a switchVersionsActive flag set to true as data");
			});
		});

		QUnit.test("Given Versions.initialize is called and switchVersionsActive is set in the url to 'something'", function (assert) {
			setVersioningEnabled({CUSTOMER: false});
			var mPropertyBag = {
				layer : Layer.CUSTOMER,
				reference : "com.sap.app"
			};

			sandbox.stub(UriParameters, "fromQuery").returns({
				get : function () {
					return "something";
				}
			});

			return Versions.initialize(mPropertyBag).then(function (oResponse) {
				var oData = oResponse.getData();
				assert.equal(oData.switchVersionsActive, true, "then a switchVersionsActive flag set to true as data");
			});
		});

		QUnit.test("Given Versions.initialize is called and switchVersionsActive is set in the url to 'false'", function (assert) {
			setVersioningEnabled({CUSTOMER: false});
			var mPropertyBag = {
				layer : Layer.CUSTOMER,
				reference : "com.sap.app"
			};

			sandbox.stub(UriParameters, "fromQuery").returns({
				get : function () {
					return "false";
				}
			});

			return Versions.initialize(mPropertyBag).then(function (oResponse) {
				var oData = oResponse.getData();
				assert.equal(oData.switchVersionsActive, false, "then a switchVersionsActive flag set to false as data");
			});
		});

		QUnit.test("Given Versions.initialize is called", function (assert) {
			var sReference = "com.sap.app";
			var sLayer = Layer.CUSTOMER;

			var oVersioningEnabled = {};
			oVersioningEnabled[sLayer] = true;
			setVersioningEnabled(oVersioningEnabled);

			var mPropertyBag = {
				layer : sLayer,
				reference : sReference
			};

			return Versions.initialize(mPropertyBag).then(function (oResponse) {
				assert.equal(this.oStorageLoadVersionsStub.callCount, 1, "then a request was sent");
				var aCallArguments = this.oStorageLoadVersionsStub.getCall(0).args[0];
				assert.equal(aCallArguments.reference, sReference, "the reference was passed");
				assert.equal(aCallArguments.layer, sLayer, "the layer was passed");
				assert.equal(aCallArguments.limit, 10, "and the limit was passed");
				assert.ok(oResponse instanceof JSONModel, "a model was returned");
				assert.equal(oResponse.getProperty("/versions"), this.aReturnedVersions, "and the versions list is returned in the model data");
			}.bind(this));
		});

		QUnit.test("Given Versions.initialize is called multiple times for the same reference and layer", function (assert) {
			setVersioningEnabled({CUSTOMER: true});

			var mPropertyBag = {
				layer : Layer.CUSTOMER,
				reference : "com.sap.app"
			};

			return Versions.initialize(mPropertyBag).then(function (oResponse) {
				assert.equal(this.oStorageLoadVersionsStub.callCount, 1, "then a request was sent");
				assert.ok(oResponse instanceof JSONModel, "a model was returned");
				assert.equal(oResponse.getProperty("/versions"), this.aReturnedVersions, "and the versions list is returned in the model data");
				return Versions.initialize(mPropertyBag);
			}.bind(this)).then(function (oResponse) {
				assert.equal(this.oStorageLoadVersionsStub.callCount, 2, "a second request is sent");
				assert.ok(oResponse instanceof JSONModel, "a model was returned");
				assert.equal(oResponse.getProperty("/versions"), this.aReturnedVersions, "and the versions list is returned in the model data");
			}.bind(this));
		});

		QUnit.test("Given Versions.initialize is called multiple times for different references", function (assert) {
			setVersioningEnabled({CUSTOMER: true});

			var mPropertyBag1 = {
				layer : Layer.CUSTOMER,
				reference : "com.sap.app"
			};

			var mPropertyBag2 = {
				layer : Layer.CUSTOMER,
				reference : "com.sap.app2"
			};

			var aReturnedVersions = [];
			sandbox.stub(KeyUserConnector.versions, "load").resolves(aReturnedVersions);

			return Versions.initialize(mPropertyBag1).then(function (oResponse) {
				assert.equal(this.oStorageLoadVersionsStub.callCount, 1, "then a request was sent");
				assert.ok(oResponse instanceof JSONModel, "a model was returned");
				assert.equal(oResponse.getProperty("/versions"), this.aReturnedVersions, "and the versions list is returned in the model data");
				return Versions.initialize(mPropertyBag2);
			}.bind(this)).then(function (oResponse) {
				assert.equal(this.oStorageLoadVersionsStub.callCount, 2, "a further request is sent");
				assert.ok(oResponse instanceof JSONModel, "a model was returned");
				assert.equal(oResponse.getProperty("/versions"), this.aReturnedVersions, "and the versions list is returned in the model data");
			}.bind(this));
		});

		QUnit.test("Given Versions.initialize is called multiple times for different layers where only one is versioning enabled", function (assert) {
			setVersioningEnabled({CUSTOMER: true, USER: false});
			var mPropertyBag1 = {
				layer : Layer.CUSTOMER,
				reference : "com.sap.app"
			};

			var mPropertyBag2 = {
				layer : Layer.USER,
				reference : "com.sap.app"
			};

			return Versions.initialize(mPropertyBag1).then(function () {
				assert.equal(this.oStorageLoadVersionsStub.callCount, 1, "then a request was sent");
				return Versions.initialize(mPropertyBag2);
			}.bind(this)).then(function () {
				assert.equal(this.oStorageLoadVersionsStub.callCount, 1, "a further request is sent");
			}.bind(this));
		});

		QUnit.test("Given Versions.initialize is called multiple times for different layers where all are versioning enabled", function (assert) {
			setVersioningEnabled({CUSTOMER: true, USER: true});
			var mPropertyBag1 = {
				layer : Layer.CUSTOMER,
				reference : "com.sap.app"
			};

			var mPropertyBag2 = {
				layer : Layer.USER,
				reference : "com.sap.app"
			};

			return Versions.initialize(mPropertyBag1).then(function () {
				assert.equal(this.oStorageLoadVersionsStub.callCount, 1, "then a request was sent");
				return Versions.initialize(mPropertyBag2);
			}.bind(this)).then(function () {
				assert.equal(this.oStorageLoadVersionsStub.callCount, 2, "a further request is sent");
			}.bind(this));
		});
	});

	QUnit.module("Calling the Storage: Given Versions.initialize is called", {
		beforeEach: function () {
			setVersioningEnabled({CUSTOMER: true});
			sandbox.stub(sap.ui.getCore().getConfiguration(), "getFlexibilityServices").returns([
				{connector : "KeyUserConnector", layers : [Layer.CUSTOMER], url: "/flexKeyUser"}
			]);
		},
		afterEach: function() {
			Versions.clearInstances();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("and a connector is configured which returns a list of versions", function (assert) {
			var mPropertyBag = {
				layer : Layer.CUSTOMER,
				reference : "com.sap.app"
			};
			var aReturnedVersions = [];
			sandbox.stub(KeyUserConnector.versions, "load").resolves(aReturnedVersions);

			return Versions.initialize(mPropertyBag).then(function (oResponse) {
				assert.deepEqual(oResponse.getProperty("/versions"), aReturnedVersions, "then the versions list is returned");
			});
		});

		QUnit.test("and a connector is configured which returns a list of versions with entries", function (assert) {
			var mPropertyBag = {
				layer : Layer.CUSTOMER,
				reference : "com.sap.app"
			};

			var oFirstVersion = {
				activatedBy : "qunit",
				activatedAt : "a long while ago",
				versionNumber : 1
			};

			var oSecondVersion = {
				activatedBy : "qunit",
				activatedAt : "a while ago",
				versionNumber : 2
			};

			var aReturnedVersions = [
				oSecondVersion,
				oFirstVersion
			];

			sandbox.stub(KeyUserConnector.versions, "load").resolves(aReturnedVersions);

			return Versions.initialize(mPropertyBag).then(function (oResponse) {
				var aVersions = oResponse.getProperty("/versions");
				assert.deepEqual(aVersions, aReturnedVersions, "then the versions list is returned");
				assert.deepEqual(aVersions[0].type, "active", "the first version is the 'active' one");
				assert.deepEqual(aVersions[1].type, "inactive", "the second version is the 'inactive' one");
			});
		});

		QUnit.test("and a connector is configured which returns a list of versions with entries and a draft", function (assert) {
			var mPropertyBag = {
				layer : Layer.CUSTOMER,
				reference : "com.sap.app"
			};

			var oFirstVersion = {
				activatedBy : "qunit",
				activatedAt : "a long while ago",
				versionNumber : 1
			};

			var oSecondVersion = {
				activatedBy : "qunit",
				activatedAt : "a while ago",
				versionNumber : 2
			};

			var aReturnedVersions = [
				{versionNumber : 0},
				oSecondVersion,
				oFirstVersion
			];

			sandbox.stub(KeyUserConnector.versions, "load").resolves(aReturnedVersions);

			return Versions.initialize(mPropertyBag).then(function (oResponse) {
				var aVersions = oResponse.getProperty("/versions");
				assert.deepEqual(aVersions, aReturnedVersions, "then the versions list is returned");
				assert.deepEqual(aVersions[0].type, "draft", "the first version is the 'draft' one");
				assert.deepEqual(aVersions[1].type, "active", "the second version is the 'active' one");
				assert.deepEqual(aVersions[2].type, "inactive", "the third version is the 'inactive' one");
			});
		});
	});

	QUnit.module("Calling the Storage: Given Versions.activateDraft is called", {
		before: function() {
			this.oAppComponent = {
				getManifest: function () {
					return {};
				},
				getId: function () {
					return this.sComponentId;
				}
			};
		},
		beforeEach: function () {
			setVersioningEnabled({CUSTOMER: true});
			sandbox.stub(sap.ui.getCore().getConfiguration(), "getFlexibilityServices").returns([
				{connector : "KeyUserConnector", layers : [Layer.CUSTOMER], url: "/flexKeyUser"}
			]);
		},
		afterEach: function() {
			Versions.clearInstances();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("and a connector is configured which returns a list of versions while a draft exists", function (assert) {
			var sReference = "com.sap.app";
			var mPropertyBag = {
				layer : Layer.CUSTOMER,
				reference : sReference,
				nonNormalizedReference: sReference,
				appComponent: this.oAppComponent
			};

			var oFirstVersion = {
				activatedBy : "qunit",
				activatedAt : "a long while ago",
				versionNumber : 1
			};

			var oSecondVersion = {
				activatedBy : "qunit",
				activatedAt : "a while ago",
				versionNumber : 2
			};

			var aReturnedVersions = [
				{versionNumber : 0},
				oSecondVersion,
				oFirstVersion
			];

			var oSaveStub = _prepareResponsesAndStubMethod(sReference, aReturnedVersions, "saveDirtyChanges", []);

			var oActivatedVersion = {
				activatedBy : "qunit",
				activatedAt : "just now",
				versionNumber : 2
			};
			sandbox.stub(KeyUserConnector.versions, "activate").resolves(oActivatedVersion);

			return Versions.initialize(mPropertyBag)
				.then(Versions.activateDraft.bind(undefined, mPropertyBag))
				.then(function () {
					assert.equal(oSaveStub.callCount, 0, "no save changes was called");
				})
				.then(Versions.getVersionsModel.bind(Versions, mPropertyBag))
				.then(function (oResponse) {
					var aVersions = oResponse.getProperty("/versions");
					assert.equal(aVersions.length, 3, "with three versions");
					assert.equal(aVersions[0], oActivatedVersion, "and the newly activated is the first");
					assert.equal(aVersions[1], oSecondVersion, "where the old version is the second");
					assert.equal(aVersions[2], oFirstVersion, "where the older version is the third");
					assert.equal(oResponse.getProperty("/backendDraft"), false, "backendDraft property was set to false");
				});
		});

		QUnit.test("and a connector is configured which returns a list of versions while a draft does NOT exists", function (assert) {
			var sReference = "com.sap.app";
			var mPropertyBag = {
				layer : Layer.CUSTOMER,
				reference : sReference,
				nonNormalizedReference: sReference,
				appComponent: this.oAppComponent
			};

			var oFirstVersion = {
				activatedBy: "qunit",
				activatedAt: "a while ago",
				versionNumber: 1
			};

			var aReturnedVersions = [
				oFirstVersion
			];

			var oSaveStub = _prepareResponsesAndStubMethod(sReference, aReturnedVersions, "saveDirtyChanges", []);

			var oActivatedVersion = {
				activatedBy: "qunit",
				activatedAt: "just now",
				versionNumber: 2
			};
			sandbox.stub(KeyUserConnector.versions, "activate").resolves(oActivatedVersion);

			return Versions.initialize(mPropertyBag)
				.then(Versions.activateDraft.bind(undefined, mPropertyBag))
				.catch(function (sErrorMessage) {
					assert.equal(oSaveStub.callCount, 0, "no save changes was called");
					assert.equal(sErrorMessage, "No draft exists", "then the promise is rejected with an error message");
				});
		});

		QUnit.test("and a connector is configured which returns a list of versions while a backend-draft does NOT exists but dirty changes do", function (assert) {
			var sReference = "com.sap.app";
			var mPropertyBag = {
				layer : Layer.CUSTOMER,
				reference : sReference,
				appComponent: this.oAppComponent
			};

			var oFirstVersion = {
				activatedBy: "qunit",
				activatedAt: "a while ago",
				versionNumber: 1
			};

			var oDraft = {
				versionNumber: 0,
				type: "draft"
			};

			var aReturnedVersions = [
				oFirstVersion
			];

			var oSaveStub = _prepareResponsesAndStubMethod(mPropertyBag.reference, aReturnedVersions, "saveDirtyChanges", [{}]);

			var oActivatedVersion = {
				activatedBy: "qunit",
				activatedAt: "just now",
				versionNumber: 2
			};
			sandbox.stub(KeyUserConnector.versions, "activate").resolves(oActivatedVersion);

			return Versions.initialize(mPropertyBag)
				.then(function (oVersionsModel) {
					oVersionsModel.setDirtyChanges(true);
				})
				.then(function () {
					var oData = Versions.getVersionsModel(mPropertyBag).getData();
					var aVersions = oData.versions;
					assert.equal(Array.isArray(aVersions), true, "then the draft is added");
					assert.equal(aVersions.length, 2, "summing up to two versions");
					assert.deepEqual(aVersions[0], oDraft, "and first is the draft");
					assert.equal(aVersions[1], oFirstVersion, "where the older version is the second");
					assert.equal(oData.backendDraft, false, "the backendDraft flag is false");
					assert.equal(oData.dirtyChanges, true, "the dirtyChanges flag is set to true");
					assert.equal(oData.draftAvailable, true, "as well as draftAvailable true");
				})
				.then(Versions.activateDraft.bind(undefined, mPropertyBag))
				.then(function () {
					assert.equal(oSaveStub.callCount, 1, "the changes were saved");
					var aSaveCallArgs = oSaveStub.getCall(0).args;
					assert.deepEqual(aSaveCallArgs[0], this.oAppComponent, "the app component was passed");
					assert.equal(aSaveCallArgs[1], false, "the caching update should not be skipped");
					assert.equal(aSaveCallArgs[2], undefined, "no list of changes is passed");
					assert.equal(aSaveCallArgs[3], true, "the draft flag is set");
					var oData = Versions.getVersionsModel(mPropertyBag).getData();
					var aVersions = oData.versions;
					assert.equal(Array.isArray(aVersions), true, "the versions list in the model is updated");
					assert.equal(aVersions.length, 2, "still containing two versions");
					assert.equal(aVersions[0], oActivatedVersion, "with the previous draft updated");
					assert.equal(aVersions[1], oFirstVersion, "and the older version is the second");
					assert.equal(oData.backendDraft, false, "the backendDraft flag is still false");
					assert.equal(oData.dirtyChanges, false, "the dirtyChanges flag is set to false");
					assert.equal(oData.draftAvailable, false, "as well as draftAvailable false");
				}.bind(this));
		});
	});

	QUnit.module("Calling the Storage: Given Versions.discardDraft is called", {
		before: function() {
			this.reference = "com.sap.app";
			this.nonNormalizedReference = this.reference + ".Component";
			this.sComponentId = "sComponentId";
			this.oAppComponent = {
				getManifest: function () {
					return {};
				},
				getId: function () {
					return this.sComponentId;
				}
			};
		},
		beforeEach: function () {
			setVersioningEnabled({CUSTOMER: true});
			sandbox.stub(sap.ui.getCore().getConfiguration(), "getFlexibilityServices").returns([
				{connector : "KeyUserConnector", layers : [Layer.CUSTOMER], url: "/flexKeyUser"}
			]);
		},
		afterEach: function() {
			Versions.clearInstances();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("and a connector is configured and no backendDraft exists while discard is called with only dirty changes", function (assert) {
			var mPropertyBag = {
				layer : Layer.CUSTOMER,
				reference : this.reference,
				nonNormalizedReference: this.nonNormalizedReference,
				appComponent: this.oAppComponent
			};

			var oFirstVersion = {
				activatedBy : "qunit",
				activatedAt : "a while ago",
				versionNumber : 1
			};

			var oDraft = {
				versionNumber: 0,
				type: "draft"
			};

			var aReturnedBackendVersions = [
				oFirstVersion
			];

			sandbox.stub(Storage.versions, "load").resolves(aReturnedBackendVersions);
			var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForComponent(this.reference);
			var oDeleteStub = sandbox.stub(oChangePersistence, "deleteChange").resolves();
			var oGetDirtyChangesStub = sandbox.stub(oChangePersistence, "getDirtyChanges").returns([{}]);
			var oDiscardStub = sandbox.stub(KeyUserConnector.versions, "discardDraft").resolves();

			return Versions.initialize(mPropertyBag)
			.then(function (oVersionsModel) {
				oVersionsModel.setDirtyChanges(true);
			})
			.then(function () {
				var oData = Versions.getVersionsModel(mPropertyBag).getData();
				var aVersions = oData.versions;
				assert.equal(Array.isArray(aVersions), true, "then the draft is added");
				assert.equal(aVersions.length, 2, "summing up to two versions");
				assert.deepEqual(aVersions[0], oDraft, "and first is the draft");
				assert.equal(aVersions[1], oFirstVersion, "where the older version is the second");
				assert.equal(oData.backendDraft, false, "the backendDraft flag is false");
				assert.equal(oData.dirtyChanges, true, "the dirtyChanges flag is set to true");
				assert.equal(oData.draftAvailable, true, "as well as draftAvailable true");
			})
			.then(Versions.discardDraft.bind(undefined, mPropertyBag))
			.then(function () {
				assert.equal(oDeleteStub.callCount, 1, "deleteChange was called");
				assert.equal(oDiscardStub.callCount, 0, "no discardDraft was called");
				oGetDirtyChangesStub.restore();
			})
			.then(Versions.getVersionsModel.bind(undefined, mPropertyBag))
			.then(function (oModel) {
				var oData = oModel.getData();
				var aVersions = oData.versions;
				assert.equal(aVersions.length, 1, "and a getting the versions anew will return one version");
				assert.equal(oDiscardStub.callCount, 0, "no discardDraft was called");
				assert.equal(aVersions[0], oFirstVersion, "which is the activated version");
				assert.equal(oData.backendDraft, false, "the backendDraft flag is still false");
				assert.equal(oData.dirtyChanges, false, "the dirtyChanges flag is set to false");
				assert.equal(oData.draftAvailable, false, "as well as draftAvailable false");
			});
		});

		QUnit.test("and a connector is configured and a draft exists while discard is called with only backend changes", function (assert) {
			var mPropertyBag = {
				layer : Layer.CUSTOMER,
				reference : this.reference,
				nonNormalizedReference: this.nonNormalizedReference,
				appComponent: this.oAppComponent
			};

			var oFirstVersion = {
				activatedBy : "qunit",
				activatedAt : "a while ago",
				versionNumber : 1
			};

			var aReturnedVersions = [
				{versionNumber : 0},
				oFirstVersion
			];

			var oSaveStub = _prepareResponsesAndStubMethod(this.reference, aReturnedVersions, "saveDirtyChanges", []);
			var oDiscardStub = sandbox.stub(KeyUserConnector.versions, "discardDraft").resolves();

			return Versions.initialize(mPropertyBag)
			.then(Versions.discardDraft.bind(undefined, mPropertyBag))
			.then(function () {
				assert.equal(oSaveStub.callCount, 0, "no save changes was called");
			})
			.then(Versions.getVersionsModel.bind(undefined, mPropertyBag))
			.then(function (oModel) {
				var oData = oModel.getData();
				var aVersions = oData.versions;
				assert.equal(aVersions.length, 1, "and a getting the versions anew will return one version");
				assert.equal(oDiscardStub.callCount, 1, "discardDraft was called once");
				assert.equal(aVersions[0], oFirstVersion, "which is the activated version");
				assert.equal(oData.backendDraft, false, "the backendDraft flag is still false");
				assert.equal(oData.dirtyChanges, false, "the dirtyChanges flag is set to false");
				assert.equal(oData.draftAvailable, false, "as well as draftAvailable false");
			});
		});

		QUnit.test("and a connector is configured and a draft does NOT exists while discard is called", function (assert) {
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				reference: this.reference,
				nonNormalizedReference: this.nonNormalizedReference,
				appComponent: this.oAppComponent
			};

			var oFirstVersion = {
				activatedBy: "qunit",
				activatedAt: "a while ago",
				versionNumber: 1
			};

			var aReturnedVersions = [
				oFirstVersion
			];

			_prepareResponsesAndStubMethod(this.reference, aReturnedVersions, "saveDirtyChanges", []);

			return Versions.initialize(mPropertyBag)
				.then(Versions.discardDraft.bind(undefined, mPropertyBag))
				.then(function (oDiscardInfo) {
					assert.equal(oDiscardInfo.backendChangesDiscarded, false, "no discarding took place");
					assert.equal(oDiscardInfo.dirtyChangesDiscarded, false, "no discarding took place");
				});
		});

		QUnit.test("and a connector is configured and a draft does NOT exists but dirty changes exists " +
			"while discard is called with a flag to discard the dirty changes", function (assert) {
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				reference: this.reference,
				nonNormalizedReference: this.nonNormalizedReference,
				appComponent: this.oAppComponent
			};

			var oFirstVersion = {
				activatedBy: "qunit",
				activatedAt: "a while ago",
				versionNumber: 1
			};

			var aReturnedVersions = [
				oFirstVersion
			];

			var oDeleteStub = _prepareResponsesAndStubMethod(this.reference, aReturnedVersions, "deleteChange", [{}, {}]);

			return Versions.initialize(mPropertyBag)
				.then(Versions.discardDraft.bind(undefined, mPropertyBag))
				.then(function (oDiscardInfo) {
					assert.equal(oDiscardInfo.dirtyChangesDiscarded, true, "some discarding took place");
					assert.equal(oDeleteStub.callCount, 2, "two changes were deleted");
				});
		});

		QUnit.test("and a connector is configured and a draft does NOT exists but dirty changes exists " +
			"while discard is called", function (assert) {
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				reference: this.reference,
				nonNormalizedReference: this.nonNormalizedReference,
				appComponent: this.oAppComponent
			};

			var oFirstVersion = {
				activatedBy: "qunit",
				activatedAt: "a while ago",
				versionNumber: 1
			};

			var aReturnedVersions = [
				oFirstVersion
			];

			var oDeleteStub = _prepareResponsesAndStubMethod(this.reference, aReturnedVersions, "deleteChange", [{}, {}]);

			return Versions.initialize(mPropertyBag)
				.then(Versions.discardDraft.bind(undefined, mPropertyBag))
				.then(function (oDiscardInfo) {
					assert.equal(oDiscardInfo.dirtyChangesDiscarded, true, "discarding took place");
					assert.equal(oDeleteStub.callCount, 2, "two changes were deleted");
				});
		});

		QUnit.test("and a connector is configured and a backendDraft exists and dirty changes exists " +
			"while discard is called", function (assert) {
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				reference: this.reference,
				nonNormalizedReference: this.nonNormalizedReference,
				appComponent: this.oAppComponent
			};

			var oFirstVersion = {
				activatedBy: "qunit",
				activatedAt: "a while ago",
				versionNumber: 1
			};

			var oDraft = {
				activatedBy: "",
				activatedAt: "",
				versionNumber: 0
			};

			var aReturnedVersions = [
				oDraft,
				oFirstVersion
			];

			var oDeleteStub = _prepareResponsesAndStubMethod(this.reference, aReturnedVersions, "deleteChange", [{}, {}]);
			var oDiscardStub = sandbox.stub(KeyUserConnector.versions, "discardDraft").resolves();

			return Versions.initialize(mPropertyBag)
				.then(Versions.discardDraft.bind(undefined, mPropertyBag))
				.then(function (oDiscardInfo) {
					assert.equal(oDiscardInfo.backendChangesDiscarded, true, "some discarding took place");
					assert.equal(oDiscardInfo.dirtyChangesDiscarded, true, "some discarding took place");
					assert.equal(oDiscardStub.callCount, 1, "discarding the draft was called");
					assert.equal(oDeleteStub.callCount, 2, "two changes were deleted");
				});
		});
	});

	QUnit.done(function () {
		jQuery('#qunit-fixture').hide();
	});
});